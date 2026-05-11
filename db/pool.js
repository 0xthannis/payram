/**
 * db/pool.js — Pool de connexion PostgreSQL (Supabase).
 * Utilise DATABASE_URL comme connection string.
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;
