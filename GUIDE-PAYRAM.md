# 🤲 Guide complet PayRam pour Ma Sadaqa — De zéro à production

> **Objectif** : Activer les paiements par carte bancaire (Visa/Mastercard) sur masadaqa.com.
> Les donateurs paient en € par CB → PayRam convertit → tu reçois des USDC sur Base dans ton wallet.
> **Aucun KYC, aucune entreprise nécessaire, self-hosted (tu contrôles tout).**

---

## 🧠 Comment ça marche (résumé en 30 secondes)

```
Donateur clique "Je donne ma sadaqa"
        ↓
Formulaire sur masadaqa.com (prénom, montant, message)
        ↓
Ma Sadaqa crée un lien de paiement via l'API PayRam (sur ton serveur)
        ↓
Donateur est redirigé vers la page de paiement PayRam
        ↓
Il paie par CB (Visa/Mastercard)
        ↓
PayRam convertit € → USDC via onramp
        ↓
USDC arrive sur TON wallet (Base chain)
        ↓
Le smart contract sweep envoie vers ton cold wallet
        ↓
Webhook confirme le don dans la base Ma Sadaqa → "BarakAllahou fik !"
```

**PayRam est self-hosted** = tu l'installes sur TON serveur (VPS). Personne ne peut bloquer tes fonds.

---

## 📋 Pré-requis

| Ce qu'il te faut | Coût | Temps |
|---|---|---|
| Un VPS (serveur Linux) | ~5€/mois | 5 min pour commander |
| Un nom de domaine (masadaqa.com) | ~10€/an | Déjà fait ? |
| Un wallet crypto (MetaMask ou Rabby) | Gratuit | 2 min |
| Du ETH sur Base pour le gas (déploiement) | ~1-2$ | 5 min |

---

## ÉTAPE 1 — Commander ton VPS (5 minutes)

### Hébergeur recommandé : **Hetzner** (allemand, fiable, pas cher)

1. Va sur **https://www.hetzner.com/cloud**
2. Crée un compte (email + mot de passe)
3. Clique **"Add Server"**
4. Choisis ces options :

| Paramètre | Valeur |
|---|---|
| **Location** | Falkenstein (DE) ou Helsinki (FI) |
| **Image** | Ubuntu 22.04 |
| **Type** | CX22 (2 vCPU, 4 GB RAM) — **4,51€/mois** |
| **Networking** | IPv4 (coché) |
| **SSH Key** | Ajoute ta clé SSH (ou choisis un mot de passe root) |
| **Name** | `masadaqa` |

5. Clique **"Create & Buy Now"**
6. Note l'**adresse IP** qui apparaît (ex: `65.108.XX.XX`)

> **Alternative moins chère** : Contabo (https://contabo.com) — VPS S à 4,99€/mois
> **Alternative simple** : DigitalOcean (https://digitalocean.com) — Droplet à $6/mois

### Se connecter au serveur

Ouvre ton terminal et tape :

```bash
ssh root@65.108.XX.XX
```

(Remplace par ton IP. Tape "yes" si demandé, puis entre ton mot de passe.)

---

## ÉTAPE 2 — Installer PayRam sur le VPS (5 minutes)

Une fois connecté en SSH sur ton serveur :

### 2.1 — Installer Docker + PayRam en une commande

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/PayRam/payram-scripts/main/setup_payram.sh)"
```

Le script va :
- Installer Docker automatiquement si nécessaire
- Télécharger l'image PayRam
- Lancer le conteneur
- Te demander un **email** et **mot de passe** pour le dashboard admin

> **Choisis un mot de passe solide** — c'est l'accès à ton gateway de paiement.

### 2.2 — Vérifier que PayRam tourne

```bash
curl -s http://localhost:8080/api/v1/member/root/exist
```

Tu dois voir une réponse JSON. Si oui → PayRam est installé ✅

### 2.3 — Vérifier le conteneur Docker

```bash
docker ps
```

Tu dois voir un conteneur `payram` en status "Up".

**Si problème :**
```bash
docker logs payram --tail 50
```

---

## ÉTAPE 3 — Créer ton wallet et déployer le smart contract (10 minutes)

### 3.1 — Préparer ton wallet destinataire

Tu as besoin de **2 wallets** :
- **Hot wallet** (sur le serveur) : sert uniquement à payer le gas pour les transactions de sweep
- **Cold wallet** (MetaMask/Rabby sur TON PC) : là où arrivent tes USDC

**Créer ton cold wallet (si pas déjà fait) :**
1. Installe [MetaMask](https://metamask.io) ou [Rabby](https://rabby.io)
2. Crée un nouveau wallet
3. **SAUVEGARDE TA SEED PHRASE** (12 ou 24 mots) dans un endroit sûr
4. Ajoute le réseau **Base** :
   - Network Name: `Base`
   - RPC URL: `https://mainnet.base.org`
   - Chain ID: `8453`
   - Symbol: `ETH`
   - Explorer: `https://basescan.org`
5. Copie ton adresse (commence par `0x...`)

### 3.2 — Déployer le contrat de sweep (sur mainnet Base)

> **IMPORTANT pour les paiements par carte** : Tu DOIS être sur **mainnet** (pas testnet).
> Les paiements carte ne fonctionnent PAS sur testnet.

Dans le dashboard PayRam (http://TON-IP:8080) :

1. Connecte-toi avec l'email/mot de passe créé à l'étape 2
2. Va dans **Wallets** → **Deploy Contract**
3. Sélectionne la chain **Base**
4. Entre l'adresse de ton **cold wallet** comme destination des fonds
5. Le système va te demander d'envoyer un peu d'ETH (sur Base) au hot wallet pour le gas

**Envoyer du gas au hot wallet :**
- Depuis MetaMask, envoie **0.002 ETH sur Base** (~0.50€) à l'adresse du hot wallet affichée par PayRam
- Attends la confirmation (quelques secondes sur Base)
- Clique "Deploy" dans le dashboard

### 3.3 — Vérifier le déploiement

Dans PayRam Dashboard → **Wallets**, tu dois voir :
- ✅ Contract deployed on Base
- ✅ Cold wallet address: ton adresse 0x...
- ✅ Status: Active

---

## ÉTAPE 4 — Activer les paiements par carte (Card-to-Crypto) (2 minutes)

1. Dans le dashboard PayRam : **Settings** → **Payment Channels**
2. Active **"Cards"** (Visa/Mastercard)
3. Sélectionne **Base** comme chain de settlement
4. Sélectionne **USDC** comme token
5. Sauvegarde

> Les donateurs pourront maintenant payer par CB. PayRam gère la conversion €→USDC automatiquement.

---

## ÉTAPE 5 — Connecter masadaqa.com à PayRam (10 minutes)

### 5.1 — Récupérer tes identifiants API

Dans le dashboard PayRam → **Settings** → **API** :
- Copie ton **API Key** (ou Bearer token)
- Note l'URL de ton PayRam : `http://TON-IP:8080`

### 5.2 — Configurer le .env de Ma Sadaqa

Sur le même serveur (ou un autre), édite le fichier `.env` de Ma Sadaqa :

```bash
# Édite le .env
nano /chemin/vers/ma-sadaqa/.env
```

Remplis ces valeurs :

```env
# URL de ton instance PayRam (sur le même serveur ou un autre)
PAYRAM_API_URL=http://localhost:8080/api/v1

# Clé API PayRam (depuis le dashboard)
PAYRAM_SECRET_KEY=ton_api_key_ici

# URL publique de ton site
BASE_URL=https://masadaqa.com

# Secret pour les webhooks (à configurer dans PayRam)
PAYRAM_WEBHOOK_SECRET=ton_secret_webhook
```

### 5.3 — Configurer le webhook dans PayRam

1. Dashboard PayRam → **Settings** → **Webhooks**
2. Ajoute un endpoint :
   - **URL** : `https://masadaqa.com/webhook/payram`
   - **Events** : `payment.completed`, `payment.failed`
3. Copie le **Webhook Secret** affiché
4. Colle-le dans ton `.env` → `PAYRAM_WEBHOOK_SECRET=...`

### 5.4 — Déployer Ma Sadaqa sur le serveur

```bash
# Sur ton VPS, clone le projet
git clone https://ton-repo.git /var/www/masadaqa
cd /var/www/masadaqa

# Lance le setup
bash start.sh
```

Le serveur Ma Sadaqa tourne maintenant sur le port 3000.

---

## ÉTAPE 6 — Mettre un reverse proxy (Nginx + SSL) (10 minutes)

Pour que masadaqa.com pointe vers ton serveur avec HTTPS :

### 6.1 — Installer Nginx + Certbot

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx
```

### 6.2 — Configurer Nginx

```bash
nano /etc/nginx/sites-available/masadaqa
```

Colle ce contenu :

```nginx
server {
    listen 80;
    server_name masadaqa.com www.masadaqa.com;

    # Ma Sadaqa (frontend + API)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name pay.masadaqa.com;

    # PayRam Dashboard (optionnel, pour accès admin)
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 — Activer le site

```bash
ln -s /etc/nginx/sites-available/masadaqa /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 6.4 — Activer HTTPS (SSL gratuit avec Let's Encrypt)

```bash
certbot --nginx -d masadaqa.com -d www.masadaqa.com -d pay.masadaqa.com
```

Suis les instructions (entre ton email, accepte les conditions).

**Résultat :**
- `https://masadaqa.com` → ton site Ma Sadaqa ✅
- `https://pay.masadaqa.com` → dashboard PayRam (admin) ✅

---

## ÉTAPE 7 — Configurer ton DNS (2 minutes)

Chez ton registrar de domaine (OVH, Namecheap, Cloudflare...) :

| Type | Nom | Valeur | TTL |
|---|---|---|---|
| A | `@` | `65.108.XX.XX` (ton IP) | 3600 |
| A | `www` | `65.108.XX.XX` | 3600 |
| A | `pay` | `65.108.XX.XX` | 3600 |

Attends 5-10 minutes que le DNS se propage.

---

## ÉTAPE 8 — Tester le parcours complet (5 minutes)

### Test en production (montant réel)

1. Va sur `https://masadaqa.com`
2. Clique sur une cagnotte
3. Clique **"Je donne ma sadaqa"**
4. Entre ton prénom, choisis 5€, et un message
5. Tu es redirigé vers la page de paiement PayRam
6. Paie avec ta CB (paiement réel, tu te paies toi-même)
7. Après le paiement → redirection vers la page de confirmation
8. Vérifie dans le back-office (`/admin.html`) que le don est **confirmed**
9. Vérifie dans MetaMask que les USDC sont arrivés sur ton wallet Base

> **Note** : PayRam ne supporte les paiements carte QUE sur mainnet.
> Pour tester le flux crypto sans carte, tu peux envoyer directement des USDC à l'adresse du contrat.

---

## ÉTAPE 9 — Garder Ma Sadaqa toujours en ligne (process manager)

Pour que le site redémarre automatiquement si le serveur reboot :

```bash
# Installer PM2
npm install -g pm2

# Lancer Ma Sadaqa avec PM2
cd /var/www/masadaqa
pm2 start server.js --name masadaqa

# Sauvegarder pour redémarrage auto
pm2 save
pm2 startup
```

PayRam (Docker) redémarre déjà automatiquement grâce à la policy `--restart always` du conteneur.

---

## 🔒 Sécurité — Checklist

- [ ] Mot de passe admin Ma Sadaqa changé dans `.env`
- [ ] Mot de passe PayRam dashboard solide
- [ ] Seed phrase du cold wallet sauvegardée **hors du serveur** (papier, coffre)
- [ ] HTTPS activé (Certbot)
- [ ] Firewall activé : `ufw allow 22,80,443/tcp && ufw enable`
- [ ] Le hot wallet ne contient que du gas (~0.005 ETH), jamais gros montants
- [ ] Webhook secret configuré (vérifie la signature HMAC)

---

## 📊 Architecture finale

```
┌─────────────────────────────────────────────────────┐
│                    TON VPS (Hetzner)                  │
│                                                       │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │  Ma Sadaqa    │     │      PayRam (Docker)      │  │
│  │  Node.js:3000 │────▶│  Gateway:8080             │  │
│  │  + SQLite     │     │  Smart Contract (Base)    │  │
│  └──────────────┘     └──────────────────────────┘  │
│         │                         │                   │
│         │         Nginx (SSL)     │                   │
│         └────────┐   ┌───────────┘                   │
│                  ▼   ▼                                │
│         ┌──────────────────┐                         │
│         │  Nginx :443 SSL   │                         │
│         │  masadaqa.com     │                         │
│         │  pay.masadaqa.com │                         │
│         └──────────────────┘                         │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────┐
        │  Donateur (CB Visa)   │
        │  paie 20€ par carte   │
        └──────────────────────┘
                      │
                      ▼
        ┌──────────────────────┐
        │  Onramp Card→Crypto   │
        │  20€ → ~20 USDC      │
        └──────────────────────┘
                      │
                      ▼
        ┌──────────────────────┐
        │  Smart Contract Sweep │
        │  USDC → Cold Wallet   │
        └──────────────────────┘
                      │
                      ▼
        ┌──────────────────────┐
        │  TON WALLET (MetaMask)│
        │  Base chain / USDC    │
        └──────────────────────┘
```

---

## 💰 Récapitulatif des coûts

| Élément | Coût |
|---|---|
| VPS Hetzner CX22 | 4,51€/mois |
| Domaine masadaqa.com | ~10€/an |
| SSL (Let's Encrypt) | Gratuit |
| PayRam | Gratuit (self-hosted) |
| Gas pour déploiement (Base) | ~0.50€ (une fois) |
| **Total** | **~5€/mois** |

---

## ❓ FAQ

**Q: Et si PayRam tombe en panne sur mon serveur ?**
R: `docker restart payram` — c'est tout. Le conteneur redémarre en 5 secondes.

**Q: Où vont mes USDC exactement ?**
R: Sur l'adresse de cold wallet que tu as configurée à l'étape 3. Le smart contract sweep les envoie automatiquement.

**Q: Quelqu'un peut-il voler mes fonds si le serveur est hacké ?**
R: Non. Le smart contract est déployé on-chain. Seul ton cold wallet (dont la clé est sur TON PC, pas le serveur) peut changer la destination des fonds.

**Q: Comment je convertis mes USDC en euros ?**
R: Envoie tes USDC depuis ton wallet vers un exchange (Binance, Kraken, Coinbase) et vends-les. Ou utilise un service comme Mt Pelerin pour virement SEPA direct.

**Q: Les donateurs voient-ils "crypto" quelque part ?**
R: Non. Ils voient une page de paiement CB classique. La conversion crypto est invisible pour eux.

**Q: Puis-je utiliser testnet pour tester ?**
R: Oui pour le flux crypto (envoyer du USDC test). Mais les paiements CARTE ne marchent QUE sur mainnet. Pour un vrai test avec CB, fais un petit don de 5€ à toi-même.

---

## ✅ C'est fait !

**Ton site Ma Sadaqa est prêt à collecter des dons.**

Récap de ce que tu as :
- 🌐 Site masadaqa.com en ligne avec 6 cagnottes
- 💳 Paiement par carte bancaire (Visa/Mastercard)
- 🔒 HTTPS, self-hosted, aucune dépendance tierce
- 💰 USDC reçus directement dans ton wallet
- 📊 Back-office pour suivre les dons
- 🤲 Interface en français pour la communauté musulmane

**Lance `bash start.sh` et commence à collecter. BismIllah.**
