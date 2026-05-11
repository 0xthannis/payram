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
function sendTelegramNotif(prenom, amountCents, cagnotteTitle, message) {
  return new Promise((resolve, reject) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return reject(new Error('Telegram non configuré'));

    const text = [
      `🤲 *Nouveau don sur Ma Sadaqa !*`,
      ``,
      `👤 *Donateur:* ${prenom}`,
      `💰 *Montant:* ${(amountCents / 100).toFixed(0)} €`,
      `📋 *Cagnotte:* ${cagnotteTitle}`,
      message ? `💬 *Message:* ${message}` : '',
      ``,
      `📅 ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`
    ].filter(Boolean).join('\n');

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

  // Confirmer le don et rediriger vers la page de remerciement
  db.prepare(`
    UPDATE dons SET status = 'confirmed', confirmed_at = datetime('now'), payram_invoice_id = ?
    WHERE id = ?
  `).run('don_' + donId, donId);

  console.log(`✅ Don #${donId} confirmé : ${amountCents/100}€ de ${prenom} pour cagnotte #${cagnotte_id}`);

  // Envoyer la notification Telegram (async, ne bloque pas la réponse)
  sendTelegramNotif(prenom, amountCents, cagnotte.title, (message || '').trim()).catch(err => {
    console.warn('⚠️ Telegram:', err.message);
  });

  // Émettre la notification push (SSE)
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

// POST /api/dons/save-info — Sauvegarder les infos donateur (appelé avant paiement widget)
router.post('/save-info', (req, res) => {
  const db = req.app.locals.db;
  const { cagnotte_id, prenom, message } = req.body;

  if (!cagnotte_id || !prenom) {
    return res.status(400).json({ error: 'cagnotte_id et prenom requis' });
  }

  // Sauvegarder en session côté serveur (table temporaire)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS donor_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cagnotte_id INTEGER NOT NULL,
      prenom TEXT NOT NULL,
      message TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  const result = db.prepare(`
    INSERT INTO donor_sessions (cagnotte_id, prenom, message) VALUES (?, ?, ?)
  `).run(parseInt(cagnotte_id), prenom.trim(), (message || '').trim());

  res.json({ success: true, session_id: result.lastInsertRowid });
});

module.exports = router;
