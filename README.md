# 🤲 Ma Sadaqa — masadaqa.com

Plateforme de sadaqa en ligne pour la communauté musulmane. Paiement sécurisé via **PayRam** (card-to-crypto, settlement en USDC sur Base).

---

## Démarrage en 3 étapes

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd ma-sadaqa
```

### 2. Configurer l'environnement

Ouvre le fichier `.env.example`, copie-le en `.env` et remplis tes clés PayRam :

```bash
cp .env.example .env
# Édite .env avec tes vraies clés (PAYRAM_SECRET_KEY, PAYRAM_PUBLIC_KEY, etc.)
```

> **Note :** Si tu lances `bash start.sh` sans créer le `.env`, il sera créé automatiquement depuis `.env.example` avec des valeurs de test.

### 3. Lancer

```bash
bash start.sh
```

C'est tout. Le site tourne sur [http://localhost:3000](http://localhost:3000).  
Back-office : [http://localhost:3000/admin.html](http://localhost:3000/admin.html) (mot de passe dans `.env`).

En production : [https://masadaqa.com](https://masadaqa.com)

---

## Stack technique

- **Frontend** : HTML5, CSS3, JavaScript vanilla, Tailwind CSS (CDN)
- **Backend** : Node.js + Express
- **Base de données** : SQLite (better-sqlite3)
- **Paiement** : PayRam API (card-to-crypto)
- **Domaine** : masadaqa.com
