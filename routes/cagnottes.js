/**
 * routes/cagnottes.js — API publique pour les cagnottes.
 * GET /api/cagnottes       → Liste toutes les cagnottes actives
 * GET /api/cagnottes/:slug → Détail d'une cagnotte avec ses dons
 */

const express = require('express');
const router = express.Router();

// GET /api/cagnottes — Liste des cagnottes actives avec stats
router.get('/', (req, res) => {
  const db = req.app.locals.db;

  const cagnottes = db.prepare(`
    SELECT
      c.id,
      c.slug,
      c.title,
      c.image_url,
      c.goal_cents,
      c.baseline_collected_cents,
      c.baseline_donors,
      COALESCE(SUM(CASE WHEN d.status = 'confirmed' THEN d.amount_cents ELSE 0 END), 0) AS dons_collected,
      COUNT(CASE WHEN d.status = 'confirmed' THEN 1 END) AS dons_count
    FROM cagnottes c
    LEFT JOIN dons d ON d.cagnotte_id = c.id
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all();

  const result = cagnottes.map(c => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    image_url: c.image_url,
    goal_cents: c.goal_cents,
    collected_cents: c.baseline_collected_cents + c.dons_collected,
    donors_count: c.baseline_donors + c.dons_count,
    progress: Math.min(100, Math.round(((c.baseline_collected_cents + c.dons_collected) / c.goal_cents) * 100))
  }));

  res.json(result);
});

// GET /api/cagnottes/:slug — Détail d'une cagnotte
router.get('/:slug', (req, res) => {
  const db = req.app.locals.db;
  const { slug } = req.params;

  const cagnotte = db.prepare(`
    SELECT
      c.*,
      COALESCE(SUM(CASE WHEN d.status = 'confirmed' THEN d.amount_cents ELSE 0 END), 0) AS dons_collected,
      COUNT(CASE WHEN d.status = 'confirmed' THEN 1 END) AS dons_count
    FROM cagnottes c
    LEFT JOIN dons d ON d.cagnotte_id = c.id
    WHERE c.slug = ?
    GROUP BY c.id
  `).get(slug);

  if (!cagnotte) {
    return res.status(404).json({ error: 'Cagnotte introuvable' });
  }

  // Récupérer les dons confirmés (derniers en premier)
  const dons = db.prepare(`
    SELECT prenom, amount_cents, message, avatar_url, created_at
    FROM dons
    WHERE cagnotte_id = ? AND status = 'confirmed'
    ORDER BY created_at DESC
  `).all(cagnotte.id);

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
});

module.exports = router;
