-- ============================================
-- schema.sql — Structure de la base de données
-- ============================================

-- Table des cagnottes
CREATE TABLE IF NOT EXISTS cagnottes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,                  -- URL-friendly : "operation-toit-mehdi"
  title TEXT NOT NULL,                        -- Titre affiché
  story TEXT NOT NULL,                        -- Histoire complète (HTML autorisé)
  image_url TEXT NOT NULL,                    -- URL de l'image de couverture
  goal_cents INTEGER NOT NULL,               -- Objectif en centimes (2400€ = 240000)
  baseline_collected_cents INTEGER DEFAULT 0, -- Montant de base pré-seed (centimes)
  baseline_donors INTEGER DEFAULT 0,          -- Nombre de donateurs pré-seed
  is_active INTEGER DEFAULT 1,               -- 1 = active, 0 = désactivée
  created_at TEXT DEFAULT (datetime('now'))
);

-- Table des dons
CREATE TABLE IF NOT EXISTS dons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cagnotte_id INTEGER NOT NULL,
  prenom TEXT NOT NULL,                       -- Prénom du donateur
  amount_cents INTEGER NOT NULL,              -- Montant en centimes
  message TEXT DEFAULT '',                    -- Message optionnel
  status TEXT DEFAULT 'pending',              -- pending | confirmed | failed
  payram_invoice_id TEXT,                     -- ID de l'invoice PayRam
  tx_hash TEXT,                               -- Hash de la transaction blockchain
  avatar_url TEXT,                            -- URL de l'avatar (pravatar)
  created_at TEXT DEFAULT (datetime('now')),
  confirmed_at TEXT,                          -- Date de confirmation du paiement
  FOREIGN KEY (cagnotte_id) REFERENCES cagnottes(id) ON DELETE CASCADE
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_dons_cagnotte ON dons(cagnotte_id);
CREATE INDEX IF NOT EXISTS idx_dons_status ON dons(status);
CREATE INDEX IF NOT EXISTS idx_dons_payram ON dons(payram_invoice_id);
CREATE INDEX IF NOT EXISTS idx_cagnottes_slug ON cagnottes(slug);
