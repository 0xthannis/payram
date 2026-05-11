/**
 * routes/admin.js — API du back-office protégée par mot de passe.
 * Toutes les routes nécessitent le header X-Admin-Password.
 */

const express = require('express');
const router = express.Router();

// Middleware d'authentification admin
function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe admin incorrect' });
  }
  next();
}

router.use(requireAdmin);

// GET /api/admin/dashboard — Statistiques globales
router.get('/dashboard', (req, res) => {
  const db = req.app.locals.db;

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM cagnottes WHERE is_active = 1) AS total_cagnottes,
      (SELECT COUNT(*) FROM dons WHERE status = 'confirmed') AS total_dons_confirmed,
      (SELECT COUNT(*) FROM dons) AS total_dons_all,
      (SELECT COALESCE(SUM(amount_cents), 0) FROM dons WHERE status = 'confirmed') AS total_collected_cents,
      (SELECT COALESCE(SUM(baseline_collected_cents), 0) FROM cagnottes) AS total_baseline_cents
  `).get();

  const totalCollected = stats.total_collected_cents + stats.total_baseline_cents;
  const conversionRate = stats.total_dons_all > 0
    ? Math.round((stats.total_dons_confirmed / stats.total_dons_all) * 100)
    : 0;

  res.json({
    total_cagnottes: stats.total_cagnottes,
    total_dons: stats.total_dons_confirmed,
    total_collected_cents: totalCollected,
    conversion_rate: conversionRate
  });
});

// GET /api/admin/cagnottes — Liste complète des cagnottes (actives et inactives)
router.get('/cagnottes', (req, res) => {
  const db = req.app.locals.db;

  const cagnottes = db.prepare(`
    SELECT
      c.*,
      COALESCE(SUM(CASE WHEN d.status = 'confirmed' THEN d.amount_cents ELSE 0 END), 0) AS dons_collected,
      COUNT(CASE WHEN d.status = 'confirmed' THEN 1 END) AS dons_count
    FROM cagnottes c
    LEFT JOIN dons d ON d.cagnotte_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all();

  res.json(cagnottes.map(c => ({
    ...c,
    collected_cents: c.baseline_collected_cents + c.dons_collected,
    donors_count: c.baseline_donors + c.dons_count
  })));
});

// POST /api/admin/cagnottes — Créer une cagnotte
router.post('/cagnottes', (req, res) => {
  const db = req.app.locals.db;
  const { title, story, image_url, goal } = req.body;

  if (!title || !story || !goal) {
    return res.status(400).json({ error: 'Champs obligatoires : title, story, goal' });
  }

  const slug = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const goalCents = Math.round(parseFloat(goal) * 100);

  try {
    const result = db.prepare(`
      INSERT INTO cagnottes (slug, title, story, image_url, goal_cents)
      VALUES (?, ?, ?, ?, ?)
    `).run(slug, title, story, image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800', goalCents);

    res.json({ success: true, id: result.lastInsertRowid, slug });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/cagnottes/:id — Modifier une cagnotte
router.put('/cagnottes/:id', (req, res) => {
  const db = req.app.locals.db;
  const { title, story, image_url, goal, is_active } = req.body;

  const fields = [];
  const values = [];

  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (story !== undefined) { fields.push('story = ?'); values.push(story); }
  if (image_url !== undefined) { fields.push('image_url = ?'); values.push(image_url); }
  if (goal !== undefined) { fields.push('goal_cents = ?'); values.push(Math.round(parseFloat(goal) * 100)); }
  if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active ? 1 : 0); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Aucun champ à modifier' });
  }

  // Regénérer le slug si le titre change
  if (title) {
    const slug = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    fields.push('slug = ?');
    values.push(slug);
  }

  values.push(req.params.id);
  db.prepare(`UPDATE cagnottes SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  res.json({ success: true });
});

// DELETE /api/admin/cagnottes/:id — Supprimer une cagnotte
router.delete('/cagnottes/:id', (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM dons WHERE cagnotte_id = ?').run(req.params.id);
  db.prepare('DELETE FROM cagnottes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/admin/cagnottes/:id/dons — Dons d'une cagnotte
router.get('/cagnottes/:id/dons', (req, res) => {
  const db = req.app.locals.db;
  const dons = db.prepare(`
    SELECT * FROM dons WHERE cagnotte_id = ? ORDER BY created_at DESC
  `).all(req.params.id);
  res.json(dons);
});

module.exports = router;
