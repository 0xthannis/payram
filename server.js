/**
 * server.js — Point d'entrée principal de l'application.
 * Express + SQLite + routes API + fichiers statiques.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 3000;

// Rendre le pool PostgreSQL accessible aux routes
app.locals.pool = pool;

// ============================================
// Middlewares
// ============================================

// Forcer HTTPS (Railway proxy envoie x-forwarded-proto)
app.set('trust proxy', 1);
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, 'https://' + req.hostname + req.originalUrl);
  }
  next();
});

// Body parsers — raw pour webhooks, json/urlencoded pour le reste
app.use('/webhook/payram', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// Routes API
// ============================================
app.use('/api/cagnottes', require('./routes/cagnottes'));
app.use('/api/dons', require('./routes/dons'));
app.use('/webhook', require('./routes/webhook'));
app.use('/api/admin', require('./routes/admin'));

// Redirect /admin → /admin.html
app.get('/admin', (req, res) => res.redirect('/admin.html'));

// ============================================
// Lancement du serveur
// ============================================
app.listen(PORT, () => {
  console.log(`🌐 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🔑 Back-office : http://localhost:${PORT}/admin.html`);
});

// Fermer proprement le pool à l'arrêt
process.on('SIGINT', () => {
  pool.end();
  console.log('\n🛑 Serveur arrêté, pool PostgreSQL fermé.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  pool.end();
  process.exit(0);
});
