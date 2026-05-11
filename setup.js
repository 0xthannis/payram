/**
 * setup.js — Crée le fichier .env depuis .env.example s'il n'existe pas déjà.
 * Appelé automatiquement par start.sh et npm start.
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const examplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (!fs.existsSync(examplePath)) {
    console.error('❌ Fichier .env.example introuvable. Réinstalle le projet.');
    process.exit(1);
  }
  fs.copyFileSync(examplePath, envPath);
  console.log('✅ Fichier .env créé depuis .env.example');
  console.log('⚠️  Pense à remplir tes vraies clés PayRam dans .env avant de passer en production.');
} else {
  console.log('✅ Fichier .env déjà présent.');
}
