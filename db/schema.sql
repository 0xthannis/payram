-- ============================================
-- schema.sql — Structure de la base de données (PostgreSQL)
-- ============================================

-- Table des cagnottes
CREATE TABLE IF NOT EXISTS cagnottes (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  image_url TEXT NOT NULL,
  goal_cents INTEGER NOT NULL,
  baseline_collected_cents INTEGER DEFAULT 0,
  baseline_donors INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des dons
CREATE TABLE IF NOT EXISTS dons (
  id SERIAL PRIMARY KEY,
  cagnotte_id INTEGER NOT NULL REFERENCES cagnottes(id) ON DELETE CASCADE,
  prenom TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  payram_invoice_id TEXT,
  tx_hash TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_dons_cagnotte ON dons(cagnotte_id);
CREATE INDEX IF NOT EXISTS idx_dons_status ON dons(status);
CREATE INDEX IF NOT EXISTS idx_dons_payram ON dons(payram_invoice_id);
CREATE INDEX IF NOT EXISTS idx_cagnottes_slug ON cagnottes(slug);
