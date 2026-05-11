/**
 * server.js — Point d'entrée principal de l'application.
 * Express + SQLite + routes API + fichiers statiques.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Connexion à la base de données
// ============================================
const dbPath = path.join(__dirname, process.env.DATABASE_PATH || 'db/cagnottes.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Rendre la DB accessible aux routes
app.locals.db = db;

// ============================================
// Middlewares
// ============================================

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

// Fermer proprement la DB à l'arrêt
process.on('SIGINT', () => {
  db.close();
  console.log('\n🛑 Serveur arrêté, base de données fermée.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});
