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
router.post('/payram', async (req, res) => {
  const pool = req.app.locals.pool;
  const secret = process.env.PAYRAM_WEBHOOK_SECRET;

  const payload = req.body;
  const signature = req.headers['x-payram-signature'];

  if (secret && secret !== 'whsec_REMPLACE_MOI_par_ton_secret_webhook') {
    if (!signature) return res.status(401).json({ error: 'Signature manquante' });
    try {
      if (!verifySignature(payload, signature, secret)) return res.status(401).json({ error: 'Signature invalide' });
    } catch (err) { return res.status(401).json({ error: 'Signature invalide' }); }
  }

  let event;
  try { event = JSON.parse(payload.toString()); }
  catch (e) { return res.status(400).json({ error: 'JSON invalide' }); }

  const eventType = event.event || event.type || 'unknown';
  console.log(`📩 Webhook PayRam: ${eventType}`, JSON.stringify(event));

  try {
    if (eventType === 'payment.confirmed' || eventType === 'payment.completed') {
      const referenceId = event.reference_id || '';
      const txHash = event.txid || event.tx_hash || '';
      const amountUSD = parseFloat(event.amount) || 0;
      const amountCents = Math.round(amountUSD * 100);

      const updateResult = await pool.query(
        `UPDATE dons SET status = 'confirmed', tx_hash = $1, confirmed_at = NOW() WHERE payram_invoice_id = $2 AND status = 'pending'`,
        [txHash, referenceId]
      );

      if (updateResult.rowCount > 0) {
        console.log(`✅ Don mis à jour pour ref ${referenceId}`);
      } else {
        const { rows } = await pool.query('SELECT id FROM cagnottes WHERE is_active = 1 ORDER BY id ASC LIMIT 1');
        const cagnotteId = rows[0] ? rows[0].id : 1;
        const avatarUrl = `https://i.pravatar.cc/40?u=payram-${Date.now()}`;

        await pool.query(
          `INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, payram_invoice_id, tx_hash, avatar_url, confirmed_at)
           VALUES ($1, 'Donateur', $2, '', 'confirmed', $3, $4, $5, NOW())`,
          [cagnotteId, amountCents, referenceId, txHash, avatarUrl]
        );
        console.log(`✅ Nouveau don créé: ${amountUSD}$ pour cagnotte #${cagnotteId}`);
      }
    }

    if (eventType === 'payment.failed') {
      const referenceId = event.reference_id;
      if (referenceId) {
        await pool.query(`UPDATE dons SET status = 'failed' WHERE payram_invoice_id = $1 AND status = 'pending'`, [referenceId]);
        console.log(`❌ Don échoué pour ref ${referenceId}`);
      }
    }
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
  }

  res.json({ received: true });
});

module.exports = router;
