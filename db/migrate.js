/**
 * migrate.js — Crée les tables si elles n'existent pas encore.
 * Idempotent : peut être relancé sans risque.
 */

const fs = require('fs');
const path = require('path');

// Charger .env pour DATABASE_PATH
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', process.env.DATABASE_PATH || 'db/cagnottes.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Créer le dossier db/ s'il n'existe pas
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Activer WAL pour de meilleures performances
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

console.log('✅ Base de données migrée avec succès :', dbPath);
db.close();
