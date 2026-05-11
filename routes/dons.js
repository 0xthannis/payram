/**
 * routes/dons.js — API pour créer un don et rediriger vers PayRam.
 * POST /api/dons — Crée un don pending + invoice PayRam, renvoie l'URL checkout
 * GET  /api/dons/:id — Récupère les infos d'un don (pour la page de confirmation)
 */

const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const url = require('url');

/**
 * Appel HTTP vers l'API PayRam self-hosted pour créer un paiement.
 * API: POST {PAYRAM_API_URL}/api/v1/payment
 * Headers: API-Key, Content-Type
 * Body: { customerEmail, customerID, amountInUSD }
 * Réponse: { host, reference_id, url }
 */
function createPayramPayment(amountCents, donId, donorPrenom) {
  return new Promise((resolve, reject) => {
    const payramUrl = process.env.PAYRAM_API_URL || 'https://pay.masadaqa.com';
    const endpoint = `${payramUrl}/api/v1/payment`;
    const parsed = url.parse(endpoint);

    // Convertir centimes EUR en USD (approximation 1:1 pour stablecoins)
    const amountInUSD = (amountCents / 100).toFixed(2);

    const data = JSON.stringify({
      customerEmail: `don-${donId}@masadaqa.com`,
      customerID: donId.toString(),
      amountInUSD: parseFloat(amountInUSD)
    });

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': process.env.PAYRAM_SECRET_KEY,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`PayRam API ${res.statusCode}: ${body}`));
          }
        } catch (e) {
          reject(new Error(`PayRam réponse invalide: ${body}`));
        }
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('PayRam timeout après 10s'));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// POST /api/dons — Créer un don
router.post('/', async (req, res) => {
  const db = req.app.locals.db;
  const { cagnotte_id, prenom, amount, message } = req.body;

  // Validation
  if (!cagnotte_id || !prenom || !amount) {
    return res.status(400).json({ error: 'Champs obligatoires : cagnotte_id, prenom, amount' });
  }

  const amountCents = Math.round(parseFloat(amount) * 100);
  if (amountCents < 100) {
    return res.status(400).json({ error: 'Le montant minimum est de 1 €' });
  }

  // Vérifier que la cagnotte existe
  const cagnotte = db.prepare('SELECT id, title FROM cagnottes WHERE id = ? AND is_active = 1').get(cagnotte_id);
  if (!cagnotte) {
    return res.status(404).json({ error: 'Cagnotte introuvable' });
  }

  // Générer l'avatar
  const avatarSeed = prenom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '-' + Date.now();
  const avatarUrl = `https://i.pravatar.cc/40?u=${avatarSeed}`;

  // Insérer le don en base (status = pending)
  const result = db.prepare(`
    INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `).run(cagnotte_id, prenom.trim(), amountCents, (message || '').trim(), avatarUrl);

  const donId = result.lastInsertRowid;

  // Créer le paiement PayRam
  try {
    const payment = await createPayramPayment(amountCents, donId, prenom);

    // Sauvegarder le reference_id PayRam
    db.prepare('UPDATE dons SET payram_invoice_id = ? WHERE id = ?')
      .run(payment.reference_id, donId);

    // Renvoyer l'URL de paiement PayRam
    res.json({
      success: true,
      don_id: donId,
      checkout_url: payment.url
    });
  } catch (err) {
    console.error('❌ Erreur PayRam:', err.message);
    // En mode dev / test (API key fictive), on simule une confirmation directe
    if (!process.env.PAYRAM_SECRET_KEY || process.env.PAYRAM_SECRET_KEY.includes('REMPLACE_MOI')) {
      console.log('🧪 Mode test détecté — simulation de confirmation du don #' + donId);
      db.prepare(`
        UPDATE dons SET status = 'confirmed', confirmed_at = datetime('now'), payram_invoice_id = ?
        WHERE id = ?
      `).run('test_' + donId, donId);

      return res.json({
        success: true,
        don_id: donId,
        checkout_url: `${process.env.BASE_URL || 'http://localhost:3000'}/confirmation.html?don_id=${donId}`,
        test_mode: true
      });
    }

    // En prod, renvoyer l'erreur
    res.status(502).json({ error: 'Impossible de contacter PayRam. Réessayez.' });
  }
});

// GET /api/dons/:id — Infos d'un don (pour la page de confirmation)
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const don = db.prepare(`
    SELECT d.*, c.title AS cagnotte_title, c.slug AS cagnotte_slug
    FROM dons d
    JOIN cagnottes c ON c.id = d.cagnotte_id
    WHERE d.id = ?
  `).get(req.params.id);

  if (!don) {
    return res.status(404).json({ error: 'Don introuvable' });
  }

  res.json(don);
});

module.exports = router;
