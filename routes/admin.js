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

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM cagnottes WHERE is_active = 1)::int AS total_cagnottes,
        (SELECT COUNT(*) FROM dons WHERE status = 'confirmed')::int AS total_dons_confirmed,
        (SELECT COUNT(*) FROM dons)::int AS total_dons_all,
        (SELECT COALESCE(SUM(amount_cents), 0) FROM dons WHERE status = 'confirmed')::int AS total_collected_cents,
        (SELECT COALESCE(SUM(baseline_collected_cents), 0) FROM cagnottes)::int AS total_baseline_cents
    `);
    const s = rows[0];
    const totalCollected = s.total_collected_cents + s.total_baseline_cents;
    const conversionRate = s.total_dons_all > 0 ? Math.round((s.total_dons_confirmed / s.total_dons_all) * 100) : 0;
    res.json({ total_cagnottes: s.total_cagnottes, total_dons: s.total_dons_confirmed, total_collected_cents: totalCollected, conversion_rate: conversionRate });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

// GET /api/admin/cagnottes
router.get('/cagnottes', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        COALESCE(SUM(CASE WHEN d.status = 'confirmed' THEN d.amount_cents ELSE 0 END), 0)::int AS dons_collected,
        COUNT(CASE WHEN d.status = 'confirmed' THEN 1 END)::int AS dons_count
      FROM cagnottes c LEFT JOIN dons d ON d.cagnotte_id = c.id
      GROUP BY c.id ORDER BY c.created_at DESC
    `);
    res.json(rows.map(c => ({ ...c, collected_cents: c.baseline_collected_cents + c.dons_collected, donors_count: c.baseline_donors + c.dons_count })));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

// POST /api/admin/cagnottes
router.post('/cagnottes', async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, story, image_url, goal } = req.body;
  if (!title || !story || !goal) return res.status(400).json({ error: 'Champs obligatoires : title, story, goal' });

  const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const goalCents = Math.round(parseFloat(goal) * 100);
  try {
    const { rows } = await pool.query(
      `INSERT INTO cagnottes (slug, title, story, image_url, goal_cents) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [slug, title, story, image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800', goalCents]
    );
    res.json({ success: true, id: rows[0].id, slug });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/cagnottes/:id
router.put('/cagnottes/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, story, image_url, goal, is_active } = req.body;
  const fields = []; const values = []; let idx = 1;

  if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
  if (story !== undefined) { fields.push(`story = $${idx++}`); values.push(story); }
  if (image_url !== undefined) { fields.push(`image_url = $${idx++}`); values.push(image_url); }
  if (goal !== undefined) { fields.push(`goal_cents = $${idx++}`); values.push(Math.round(parseFloat(goal) * 100)); }
  if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active ? 1 : 0); }
  if (title) {
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    fields.push(`slug = $${idx++}`); values.push(slug);
  }
  if (fields.length === 0) return res.status(400).json({ error: 'Aucun champ' });

  values.push(req.params.id);
  try {
    await pool.query(`UPDATE cagnottes SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/cagnottes/:id
router.delete('/cagnottes/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM dons WHERE cagnotte_id = $1', [req.params.id]);
    await pool.query('DELETE FROM cagnottes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/cagnottes/:id/baseline
router.patch('/cagnottes/:id/baseline', async (req, res) => {
  const pool = req.app.locals.pool;
  const { baseline_collected, baseline_donors } = req.body;
  const fields = []; const values = []; let idx = 1;

  if (baseline_collected !== undefined) { fields.push(`baseline_collected_cents = $${idx++}`); values.push(Math.round(parseFloat(baseline_collected) * 100)); }
  if (baseline_donors !== undefined) { fields.push(`baseline_donors = $${idx++}`); values.push(parseInt(baseline_donors)); }
  if (fields.length === 0) return res.status(400).json({ error: 'Aucun champ' });

  values.push(req.params.id);
  try {
    await pool.query(`UPDATE cagnottes SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/cagnottes/:id/dons
router.get('/cagnottes/:id/dons', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query('SELECT * FROM dons WHERE cagnotte_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/dons/:id
router.delete('/dons/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM dons WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/dons
router.get('/dons', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query(`
      SELECT d.*, c.title AS cagnotte_title FROM dons d
      JOIN cagnottes c ON c.id = d.cagnotte_id
      WHERE d.status = 'confirmed' AND d.message != ''
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
