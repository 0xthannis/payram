#!/usr/bin/env bash
# ============================================
# start.sh — Script tout-en-un
# Lance ce script une seule fois : bash start.sh
# Il installe les dépendances, configure l'env,
# crée la base de données, injecte les données
# de démo, puis lance le serveur.
# ============================================

set -e

echo ""
echo "🚀 Démarrage de Ma Sadaqa (masadaqa.com)..."
echo "==========================================="
echo ""

# 1. Installation des dépendances
echo "📦 Installation des dépendances npm..."
npm install --silent
echo ""

# 2. Configuration de l'environnement
echo "⚙️  Configuration de l'environnement..."
node setup.js
echo ""

# 3. Création / migration de la base de données
echo "🗄️  Migration de la base de données..."
node db/migrate.js
echo ""

# 4. Injection des données de démonstration
echo "🌱 Injection des données de démo..."
node db/seed.js
echo ""

# 5. Lancement du serveur
echo "==========================================="
echo "✅ Tout est prêt !"
echo "🌐 Ma Sadaqa démarre sur http://localhost:${PORT:-3000}"
echo "🔑 Back-office : http://localhost:${PORT:-3000}/admin.html"
echo "==========================================="
echo ""
node server.js
