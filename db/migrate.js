/**
 * migrate.js — Crée les tables si elles n'existent pas encore (PostgreSQL).
 * Idempotent : peut être relancé sans risque.
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Vérifier DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.includes('[PASSWORD]') || dbUrl.includes('[PROJECT_REF]')) {
  console.error('❌ DATABASE_URL manquante ou invalide !');
  console.error('   Valeur actuelle:', dbUrl || '(vide)');
  console.error('   → Ajoute DATABASE_URL dans Railway → Variables');
  console.error('   → Copie la connection string depuis Supabase → Connect → URI');
  process.exit(1);
}

console.log('🔌 Connexion à PostgreSQL...');
const pool = require('./pool');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await pool.query(schema);
    console.log('✅ Base de données PostgreSQL migrée avec succès');

    // Seed si aucune cagnotte n'existe
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM cagnottes');
    if (parseInt(rows[0].count) === 0) {
      console.log('📦 Base vide, lancement du seed...');
      require('./seed-pg');
    } else {
      console.log('⏭️  Des cagnottes existent déjà, seed ignoré.');
    }
  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
