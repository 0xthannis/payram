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

  console.log(`📩 Webhook PayRam reçu : ${event.type || 'unknown'}`);

  // Traiter l'événement payment.completed ou payment.confirmed
  if (event.type === 'payment.completed' || event.type === 'payment.confirmed') {
    const invoiceId = event.data?.reference_id || event.data?.invoice_id || event.data?.id;
    const txHash = event.data?.tx_hash || event.data?.transaction_hash || '';

    if (!invoiceId) {
      console.warn('⚠️  Webhook payment.completed sans invoice_id');
      return res.status(400).json({ error: 'invoice_id manquant' });
    }

    // Mettre à jour le don en base
    const result = db.prepare(`
      UPDATE dons
      SET status = 'confirmed',
          tx_hash = ?,
          confirmed_at = datetime('now')
      WHERE payram_invoice_id = ? AND status = 'pending'
    `).run(txHash, invoiceId);

    if (result.changes > 0) {
      console.log(`✅ Don confirmé pour invoice ${invoiceId} (tx: ${txHash})`);
    } else {
      console.warn(`⚠️  Aucun don pending trouvé pour invoice ${invoiceId}`);
    }
  }

  // Traiter l'événement payment.failed
  if (event.type === 'payment.failed') {
    const invoiceId = event.data?.reference_id || event.data?.invoice_id || event.data?.id;
    if (invoiceId) {
      db.prepare(`
        UPDATE dons SET status = 'failed' WHERE payram_invoice_id = ? AND status = 'pending'
      `).run(invoiceId);
      console.log(`❌ Don échoué pour invoice ${invoiceId}`);
    }
  }

  // Toujours répondre 200 pour accuser réception
  res.json({ received: true });
});

module.exports = router;
