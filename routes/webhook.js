/**
 * routes/webhook.js — Réception des webhooks PayRam.
 * POST /webhook/payram — Vérifie la signature HMAC, met à jour le don.
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

/**
 * Vérifie la signature HMAC-SHA256 du webhook PayRam.
 * PayRam envoie la signature dans le header "x-payram-signature".
 */
function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// POST /webhook/payram
router.post('/payram', (req, res) => {
  const db = req.app.locals.db;
  const secret = process.env.PAYRAM_WEBHOOK_SECRET;

  // Le body est en raw (Buffer) grâce au middleware dans server.js
  const payload = req.body;
  const signature = req.headers['x-payram-signature'];

  // Vérification de la signature
  if (secret && secret !== 'whsec_REMPLACE_MOI_par_ton_secret_webhook') {
    if (!signature) {
      console.warn('⚠️  Webhook reçu sans signature');
      return res.status(401).json({ error: 'Signature manquante' });
    }
    try {
      if (!verifySignature(payload, signature, secret)) {
        console.warn('⚠️  Webhook avec signature invalide');
        return res.status(401).json({ error: 'Signature invalide' });
      }
    } catch (err) {
      console.warn('⚠️  Erreur vérification signature:', err.message);
      return res.status(401).json({ error: 'Signature invalide' });
    }
  }

  // Parser le body
  let event;
  try {
    event = JSON.parse(payload.toString());
  } catch (e) {
    return res.status(400).json({ error: 'JSON invalide' });
  }

  const eventType = event.event || event.type || 'unknown';
  console.log(`📩 Webhook PayRam reçu : ${eventType}`);
  console.log(`📩 Payload:`, JSON.stringify(event));

  // Traiter l'événement payment.confirmed
  if (eventType === 'payment.confirmed' || eventType === 'payment.completed') {
    // Champs à la racine du payload (format PayRam réel)
    const referenceId = event.reference_id;
    const txHash = event.txid || event.tx_hash || '';

    if (!referenceId) {
      console.warn('⚠️  Webhook payment.confirmed sans reference_id');
      return res.status(400).json({ error: 'reference_id manquant' });
    }

    // Mettre à jour le don en base
    const result = db.prepare(`
      UPDATE dons
      SET status = 'confirmed',
          tx_hash = ?,
          confirmed_at = datetime('now')
      WHERE payram_invoice_id = ? AND status = 'pending'
    `).run(txHash, referenceId);

    if (result.changes > 0) {
      console.log(`✅ Don confirmé pour reference ${referenceId} (tx: ${txHash})`);
    } else {
      console.warn(`⚠️  Aucun don pending trouvé pour reference ${referenceId}`);
    }
  }

  // Traiter l'événement payment.failed
  if (eventType === 'payment.failed') {
    const referenceId = event.reference_id;
    if (referenceId) {
      db.prepare(`
        UPDATE dons SET status = 'failed' WHERE payram_invoice_id = ? AND status = 'pending'
      `).run(referenceId);
      console.log(`❌ Don échoué pour reference ${referenceId}`);
    }
  }

  // Toujours répondre 200 pour accuser réception
  res.json({ received: true });
});

module.exports = router;
