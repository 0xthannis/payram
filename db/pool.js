/**
 * db/pool.js — Pool de connexion PostgreSQL (Supabase).
 * Utilise DATABASE_URL comme connection string.
 */

const { Pool } = require('pg');
const dns = require('dns');

// Forcer IPv4 pour éviter ENETUNREACH sur Railway
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
