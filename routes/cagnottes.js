/**
 * routes/cagnottes.js — API publique pour les cagnottes.
 * GET /api/cagnottes       → Liste toutes les cagnottes actives
 * GET /api/cagnottes/:slug → Détail d'une cagnotte avec ses dons
 */

const express = require('express');
const router = express.Router();

// GET /api/cagnottes — Liste des cagnottes actives avec stats
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const { rows: cagnottes } = await pool.query(`
      SELECT
        c.id, c.slug, c.title, c.image_url, c.goal_cents,
        c.baseline_collected_cents, c.baseline_donors,
        COALESCE(SUM(CASE WHEN d.status = 'confirmed' THEN d.amount_cents ELSE 0 END), 0)::int AS dons_collected,
        COUNT(CASE WHEN d.status = 'confirmed' THEN 1 END)::int AS dons_count
      FROM cagnottes c
      LEFT JOIN dons d ON d.cagnotte_id = c.id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json(cagnottes.map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      image_url: c.image_url,
      goal_cents: c.goal_cents,
      collected_cents: c.baseline_collected_cents + c.dons_collected,
      donors_count: c.baseline_donors + c.dons_count,
      progress: Math.min(100, Math.round(((c.baseline_collected_cents + c.dons_collected) / c.goal_cents) * 100))
    })));
  } catch (err) {
    console.error('❌ Erreur cagnottes:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/cagnottes/:slug — Détail d'une cagnotte
router.get('/:slug', async (req, res) => {
  const pool = req.app.locals.pool;
  const { slug } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT
        c.*,
        COALESCE(SUM(CASE WHEN d.status = 'confirmed' THEN d.amount_cents ELSE 0 END), 0)::int AS dons_collected,
        COUNT(CASE WHEN d.status = 'confirmed' THEN 1 END)::int AS dons_count
      FROM cagnottes c
      LEFT JOIN dons d ON d.cagnotte_id = c.id
      WHERE c.slug = $1
      GROUP BY c.id
    `, [slug]);

    const cagnotte = rows[0];
    if (!cagnotte) {
      return res.status(404).json({ error: 'Cagnotte introuvable' });
    }

    const { rows: dons } = await pool.query(`
      SELECT prenom, amount_cents, message, avatar_url, created_at
      FROM dons
      WHERE cagnotte_id = $1 AND status = 'confirmed'
      ORDER BY created_at DESC
    `, [cagnotte.id]);

    res.json({
      id: cagnotte.id,
      slug: cagnotte.slug,
      title: cagnotte.title,
      story: cagnotte.story,
      image_url: cagnotte.image_url,
      goal_cents: cagnotte.goal_cents,
      collected_cents: cagnotte.baseline_collected_cents + cagnotte.dons_collected,
      donors_count: cagnotte.baseline_donors + cagnotte.dons_count,
      progress: Math.min(100, Math.round(((cagnotte.baseline_collected_cents + cagnotte.dons_collected) / cagnotte.goal_cents) * 100)),
      dons
    });
  } catch (err) {
    console.error('❌ Erreur cagnotte:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
