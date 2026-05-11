/**
 * seed.js — Injecte les 6 cagnottes de démonstration et leurs donateurs fictifs.
 * Idempotent : ne re-seed pas si des cagnottes existent déjà.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '..', process.env.DATABASE_PATH || 'db/cagnottes.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Vérifier si des données existent déjà
const existing = db.prepare('SELECT COUNT(*) as count FROM cagnottes').get();
if (existing.count > 0) {
  console.log('⏭️  Des cagnottes existent déjà, seed ignoré.');
  db.close();
  process.exit(0);
}

// ============================================
// Données des 6 cagnottes
// ============================================

const cagnottes = [
  {
    slug: 'operation-toit-mehdi',
    title: 'Opération Toit pour Mehdi',
    story: `Mehdi, 34 ans, cariste à Lyon, a perdu son appartement suite à un dégât des eaux non couvert par son assurance. Il vit provisoirement chez sa sœur avec ses deux enfants.\n\nLa cagnotte finance le dépôt de garantie et le premier loyer d'un nouvel appartement. Chaque euro compte pour permettre à Mehdi et ses enfants de retrouver un chez-eux.`,
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    goal_cents: 240000,
    target_collected: 187000,
    target_donors: 34,
    donors: [
      { prenom: 'Sophie', montant: 50, message: 'Courage Mehdi, tu vas t\'en sortir 💪', days_ago: 1 },
      { prenom: 'Jean-Pierre', montant: 100, message: 'De tout cœur avec toi et tes enfants.', days_ago: 2 },
      { prenom: 'Amina', montant: 20, message: 'On est avec toi', days_ago: 3 },
      { prenom: 'Thomas', montant: 30, message: 'Bon courage pour la suite', days_ago: 5 },
      { prenom: 'Nathalie', montant: 15, message: 'J\'espère que ca va s\'arranger vite', days_ago: 7 },
      { prenom: 'Kévin', montant: 25, message: 'Force à toi frère', days_ago: 10 },
      { prenom: 'Marie', montant: 50, message: 'Personne ne devrait vivre ça. Courage !', days_ago: 12 },
      { prenom: 'Rachid', montant: 40, message: '', days_ago: 15 },
      { prenom: 'Claire', montant: 10, message: 'petit geste mais de tout coeur', days_ago: 18 },
      { prenom: 'Lucas', montant: 20, message: '🏠❤️', days_ago: 22 }
    ]
  },
  {
    slug: 'chloe-veut-marcher',
    title: 'Chloé veut marcher à nouveau',
    story: `Chloé, 8 ans, a été renversée par une voiture en sortant de l'école. Elle a besoin d'une rééducation intensive non remboursée par la Sécu.\n\nSes parents, tous deux enseignants, ne peuvent pas assumer seuls les 4 000 € de frais. Chaque don rapproche Chloé de ses premiers pas retrouvés.`,
    image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    goal_cents: 400000,
    target_collected: 321000,
    target_donors: 89,
    donors: [
      { prenom: 'Isabelle', montant: 100, message: 'Pour la petite Chloé, de la part de toute la famille Dupont ❤️', days_ago: 1 },
      { prenom: 'Marc', montant: 50, message: 'Allez Chloé, tu vas remarcher !', days_ago: 1 },
      { prenom: 'Sandrine', montant: 30, message: 'Tous derrière toi ma puce', days_ago: 2 },
      { prenom: 'Éric', montant: 20, message: 'Bon rétablissement', days_ago: 3 },
      { prenom: 'Fatima', montant: 75, message: 'Je suis maman aussi, ça me touche énormément', days_ago: 4 },
      { prenom: 'Guillaume', montant: 25, message: 'Courage aux parents aussi', days_ago: 6 },
      { prenom: 'Aurélie', montant: 150, message: 'Don de l\'école Voltaire, collecte de la classe de CE2 🎒', days_ago: 8 },
      { prenom: 'Denis', montant: 10, message: 'c est pas grand chose mais c est de bon coeur', days_ago: 10 },
      { prenom: 'Charlotte', montant: 40, message: 'Plein de bisous à Chloé 💕', days_ago: 13 },
      { prenom: 'Youssef', montant: 20, message: 'Force et courage', days_ago: 16 },
      { prenom: 'Martine', montant: 35, message: 'De la part de mamie Martine qui pense fort à toi', days_ago: 20 },
      { prenom: 'Alexandre', montant: 50, message: '', days_ago: 25 }
    ]
  },
  {
    slug: 'food-truck-yasmine',
    title: 'Le food-truck de Yasmine',
    story: `Yasmine cuisinait les meilleurs tajines de Bordeaux dans son restaurant, fermé après le covid. Elle a trouvé un food-truck d'occasion à 6 500 € et cherche à boucler son financement pour relancer son activité.\n\nAidez Yasmine à reprendre la route et à régaler les Bordelais avec ses plats faits maison !`,
    image_url: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800',
    goal_cents: 650000,
    target_collected: 498000,
    target_donors: 61,
    donors: [
      { prenom: 'Olivier', montant: 100, message: 'Tes tajines me manquent Yasmine !! 😍', days_ago: 1 },
      { prenom: 'Léa', montant: 25, message: 'Hâte de te revoir sur les marchés', days_ago: 2 },
      { prenom: 'Mourad', montant: 50, message: 'La famille est derrière toi cousine', days_ago: 3 },
      { prenom: 'Christine', montant: 30, message: 'Ancienne cliente fidèle, je suis de tout coeur', days_ago: 5 },
      { prenom: 'Antoine', montant: 20, message: 'Go Yasmine ! 🚚', days_ago: 7 },
      { prenom: 'Samia', montant: 75, message: 'Tu le mérites tellement', days_ago: 9 },
      { prenom: 'François', montant: 15, message: 'Petit don mais gros soutien', days_ago: 12 },
      { prenom: 'Pauline', montant: 40, message: 'Les meilleurs couscous de bordeaux 🤤', days_ago: 14 },
      { prenom: 'Mehdi', montant: 30, message: '', days_ago: 18 },
      { prenom: 'Valérie', montant: 50, message: 'Tu vas cartonner !', days_ago: 23 },
      { prenom: 'Julien', montant: 10, message: 'Soutien depuis Toulouse', days_ago: 27 }
    ]
  },
  {
    slug: 'funerailles-grand-pere-rene',
    title: 'Funérailles dignes pour grand-père René',
    story: `René, 81 ans, est décédé brutalement sans avoir pu anticiper ses funérailles. Sa famille modeste de Bretagne cherche à lui offrir un enterrement digne sans s'endetter.\n\nRené était un homme généreux, ancien marin-pêcheur, qui a toujours aidé ses voisins. Aujourd'hui c'est à notre tour de l'accompagner une dernière fois.`,
    image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    goal_cents: 320000,
    target_collected: 295000,
    target_donors: 112,
    donors: [
      { prenom: 'Annick', montant: 50, message: 'Repose en paix René. On t\'oublie pas.', days_ago: 1 },
      { prenom: 'Patrick', montant: 30, message: 'Un grand monsieur. Mes condoléances à la famille.', days_ago: 1 },
      { prenom: 'Gwenaëlle', montant: 20, message: 'Kenavo René 🕊️', days_ago: 2 },
      { prenom: 'Bernard', montant: 100, message: 'De la part de tout l\'équipage du Korrigane', days_ago: 2 },
      { prenom: 'Colette', montant: 15, message: 'Il ma toujours aidé quand jetais dans le besoin', days_ago: 3 },
      { prenom: 'Yann', montant: 25, message: 'Un vrai Breton. Respect.', days_ago: 5 },
      { prenom: 'Monique', montant: 40, message: '', days_ago: 7 },
      { prenom: 'Thierry', montant: 20, message: 'Mes pensées les plus sincères', days_ago: 9 },
      { prenom: 'Solène', montant: 35, message: 'Courage à toute la famille 💐', days_ago: 12 },
      { prenom: 'Jacques', montant: 50, message: 'Ancien voisin de René, un homme en or', days_ago: 15 },
      { prenom: 'Mireille', montant: 10, message: 'paix à son âme', days_ago: 20 },
      { prenom: 'Erwan', montant: 25, message: 'RIP papi René', days_ago: 26 }
    ]
  },
  {
    slug: 'cafe-associatif-le-comptoir',
    title: 'Sauvons le café associatif Le Comptoir',
    story: `Le Comptoir est un café associatif toulousain qui accueille depuis 6 ans des ateliers gratuits et une épicerie solidaire.\n\nSuite à une hausse de loyer imprévue, l'asso doit trouver 5 000 € en 30 jours ou fermer. Le Comptoir, c'est plus qu'un café : c'est le cœur du quartier.`,
    image_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
    goal_cents: 500000,
    target_collected: 134000,
    target_donors: 28,
    donors: [
      { prenom: 'Marine', montant: 30, message: 'Le Comptoir c\'est ma deuxième maison ❤️', days_ago: 1 },
      { prenom: 'Romain', montant: 20, message: 'Faut sauver ce lieu !', days_ago: 2 },
      { prenom: 'Aïcha', montant: 50, message: 'Mes enfants adorent les ateliers du mercredi', days_ago: 3 },
      { prenom: 'Bastien', montant: 10, message: 'Partagez tous svp 🙏', days_ago: 5 },
      { prenom: 'Laurence', montant: 25, message: '', days_ago: 8 },
      { prenom: 'Cédric', montant: 15, message: 'Soutien total', days_ago: 11 },
      { prenom: 'Inès', montant: 40, message: 'Le quartier a besoin du Comptoir', days_ago: 15 },
      { prenom: 'Philippe', montant: 100, message: 'Don de l\'association des commerçants du quartier', days_ago: 20 },
      { prenom: 'Émilie', montant: 5, message: 'je suis étudiante, c est tout ce que je peux mais courage !', days_ago: 25 }
    ]
  },
  {
    slug: 'expedition-antarctique-lucas',
    title: 'Expédition Antarctique — Lucas, 19 ans',
    story: `Lucas a été sélectionné parmi 12 000 candidats pour une expédition scientifique en Antarctique. Les frais s'élèvent à 3 800 €.\n\nSes parents agriculteurs ne peuvent pas l'aider davantage. Cette expédition est le rêve de sa vie et une chance unique pour sa carrière scientifique.`,
    image_url: 'https://images.unsplash.com/photo-1551415923-a2297c7fda79?w=800',
    goal_cents: 380000,
    target_collected: 210000,
    target_donors: 47,
    donors: [
      { prenom: 'Camille', montant: 50, message: 'Trop fier de toi Lucas ! Ton ancien prof de SVT 🧪', days_ago: 1 },
      { prenom: 'Mathieu', montant: 30, message: 'Ramène nous des photos de manchots !', days_ago: 2 },
      { prenom: 'Élodie', montant: 20, message: 'Quelle aventure, bravo !', days_ago: 3 },
      { prenom: 'Hugo', montant: 25, message: 'Un pote de prépa qui croit en toi 🐧', days_ago: 5 },
      { prenom: 'Nadia', montant: 100, message: 'Tes parents doivent être tellement fiers', days_ago: 7 },
      { prenom: 'Stéphane', montant: 15, message: 'Belle initiative', days_ago: 10 },
      { prenom: 'Manon', montant: 40, message: 'Go Lucas !!! 🚀🇦🇶', days_ago: 13 },
      { prenom: 'Vincent', montant: 10, message: '', days_ago: 17 },
      { prenom: 'Delphine', montant: 75, message: 'De la part du club nature de Clermont', days_ago: 21 },
      { prenom: 'Nicolas', montant: 20, message: 'La science a besoin de jeunes comme toi', days_ago: 28 }
    ]
  }
];

// ============================================
// Insertion en base
// ============================================

const insertCagnotte = db.prepare(`
  INSERT INTO cagnottes (slug, title, story, image_url, goal_cents, baseline_collected_cents, baseline_donors)
  VALUES (@slug, @title, @story, @image_url, @goal_cents, @baseline_collected_cents, @baseline_donors)
`);

const insertDon = db.prepare(`
  INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url, created_at, confirmed_at)
  VALUES (@cagnotte_id, @prenom, @amount_cents, @message, 'confirmed', @avatar_url, @created_at, @created_at)
`);

const seedAll = db.transaction(() => {
  for (const c of cagnottes) {
    // Calculer le total des dons fictifs
    const donorsTotal = c.donors.reduce((sum, d) => sum + d.montant * 100, 0);
    // Le baseline comble la différence pour atteindre le target
    const baselineCollected = Math.max(0, c.target_collected - donorsTotal);
    const baselineDonors = Math.max(0, c.target_donors - c.donors.length);

    const result = insertCagnotte.run({
      slug: c.slug,
      title: c.title,
      story: c.story,
      image_url: c.image_url,
      goal_cents: c.goal_cents,
      baseline_collected_cents: baselineCollected,
      baseline_donors: baselineDonors
    });

    const cagnotteId = result.lastInsertRowid;

    for (const d of c.donors) {
      const date = new Date();
      date.setDate(date.getDate() - d.days_ago);
      const isoDate = date.toISOString().replace('T', ' ').slice(0, 19);
      const seed = d.prenom.toLowerCase().replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ïî]/g, 'i');

      insertDon.run({
        cagnotte_id: cagnotteId,
        prenom: d.prenom,
        amount_cents: d.montant * 100,
        message: d.message,
        avatar_url: `https://i.pravatar.cc/40?u=${seed}-${d.days_ago}`,
        created_at: isoDate
      });
    }
  }
});

seedAll();

console.log(`✅ Seed terminé : ${cagnottes.length} cagnottes et leurs donateurs insérés.`);
db.close();
