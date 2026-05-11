/**
 * seed-pg.js — Injecte les 6 cagnottes de démonstration (PostgreSQL).
 * Appelé par migrate.js si la base est vide.
 */

const pool = require('./pool');

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
      { prenom: 'Sophie', montant: 50, message: 'Courage Mehdi, tu vas t\'en sortir', days_ago: 1 },
      { prenom: 'Jean-Pierre', montant: 100, message: 'De tout coeur avec toi et tes enfants.', days_ago: 2 },
      { prenom: 'Amina', montant: 20, message: 'On est avec toi', days_ago: 3 },
      { prenom: 'Thomas', montant: 30, message: 'Bon courage pour la suite', days_ago: 5 },
      { prenom: 'Nathalie', montant: 15, message: 'J\'espere que ca va s\'arranger vite', days_ago: 7 },
      { prenom: 'Kevin', montant: 25, message: 'Force a toi frere', days_ago: 10 },
      { prenom: 'Marie', montant: 50, message: 'Personne ne devrait vivre ca. Courage !', days_ago: 12 },
      { prenom: 'Rachid', montant: 40, message: '', days_ago: 15 },
      { prenom: 'Claire', montant: 10, message: 'petit geste mais de tout coeur', days_ago: 18 },
      { prenom: 'Lucas', montant: 20, message: '', days_ago: 22 }
    ]
  },
  {
    slug: 'chloe-veut-marcher',
    title: 'Chloé veut marcher à nouveau',
    story: `Chloé, 8 ans, a été renversée par une voiture en sortant de l'école. Elle a besoin d'une rééducation intensive non remboursée par la Sécu.\n\nSes parents, tous deux enseignants, ne peuvent pas assumer seuls les 4 000 euros de frais.`,
    image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    goal_cents: 400000,
    target_collected: 321000,
    target_donors: 89,
    donors: [
      { prenom: 'Isabelle', montant: 100, message: 'Pour la petite Chloe', days_ago: 1 },
      { prenom: 'Marc', montant: 50, message: 'Allez Chloe, tu vas remarcher !', days_ago: 1 },
      { prenom: 'Sandrine', montant: 30, message: 'Tous derriere toi ma puce', days_ago: 2 },
      { prenom: 'Eric', montant: 20, message: 'Bon retablissement', days_ago: 3 },
      { prenom: 'Fatima', montant: 75, message: 'Je suis maman aussi, ca me touche enormement', days_ago: 4 },
      { prenom: 'Guillaume', montant: 25, message: 'Courage aux parents aussi', days_ago: 6 },
      { prenom: 'Aurelie', montant: 150, message: 'Don de l\'ecole Voltaire', days_ago: 8 },
      { prenom: 'Denis', montant: 10, message: 'c est pas grand chose mais c est de bon coeur', days_ago: 10 },
      { prenom: 'Charlotte', montant: 40, message: 'Plein de bisous a Chloe', days_ago: 13 },
      { prenom: 'Youssef', montant: 20, message: 'Force et courage', days_ago: 16 }
    ]
  },
  {
    slug: 'food-truck-yasmine',
    title: 'Le food-truck de Yasmine',
    story: `Yasmine cuisinait les meilleurs tajines de Bordeaux dans son restaurant, fermé après le covid. Elle a trouvé un food-truck d'occasion à 6 500 euros.`,
    image_url: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800',
    goal_cents: 650000,
    target_collected: 498000,
    target_donors: 61,
    donors: [
      { prenom: 'Olivier', montant: 100, message: 'Tes tajines me manquent Yasmine !!', days_ago: 1 },
      { prenom: 'Lea', montant: 25, message: 'Hate de te revoir sur les marches', days_ago: 2 },
      { prenom: 'Mourad', montant: 50, message: 'La famille est derriere toi cousine', days_ago: 3 },
      { prenom: 'Christine', montant: 30, message: 'Ancienne cliente fidele', days_ago: 5 },
      { prenom: 'Antoine', montant: 20, message: 'Go Yasmine !', days_ago: 7 },
      { prenom: 'Samia', montant: 75, message: 'Tu le merites tellement', days_ago: 9 },
      { prenom: 'Francois', montant: 15, message: 'Petit don mais gros soutien', days_ago: 12 },
      { prenom: 'Pauline', montant: 40, message: 'Les meilleurs couscous de bordeaux', days_ago: 14 }
    ]
  },
  {
    slug: 'funerailles-grand-pere-rene',
    title: 'Funérailles dignes pour grand-père René',
    story: `René, 81 ans, est décédé brutalement. Sa famille modeste cherche à lui offrir un enterrement digne.`,
    image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    goal_cents: 320000,
    target_collected: 295000,
    target_donors: 112,
    donors: [
      { prenom: 'Annick', montant: 50, message: 'Repose en paix Rene.', days_ago: 1 },
      { prenom: 'Patrick', montant: 30, message: 'Un grand monsieur.', days_ago: 1 },
      { prenom: 'Gwenaelle', montant: 20, message: 'Kenavo Rene', days_ago: 2 },
      { prenom: 'Bernard', montant: 100, message: 'De la part de tout l\'equipage', days_ago: 2 },
      { prenom: 'Colette', montant: 15, message: 'Il ma toujours aide', days_ago: 3 },
      { prenom: 'Yann', montant: 25, message: 'Un vrai Breton. Respect.', days_ago: 5 },
      { prenom: 'Monique', montant: 40, message: '', days_ago: 7 },
      { prenom: 'Thierry', montant: 20, message: 'Mes pensees les plus sinceres', days_ago: 9 }
    ]
  },
  {
    slug: 'cafe-associatif-le-comptoir',
    title: 'Sauvons le café associatif Le Comptoir',
    story: `Le Comptoir est un café associatif toulousain qui accueille depuis 6 ans des ateliers gratuits et une épicerie solidaire.`,
    image_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
    goal_cents: 500000,
    target_collected: 134000,
    target_donors: 28,
    donors: [
      { prenom: 'Marine', montant: 30, message: 'Le Comptoir c\'est ma deuxieme maison', days_ago: 1 },
      { prenom: 'Romain', montant: 20, message: 'Faut sauver ce lieu !', days_ago: 2 },
      { prenom: 'Aicha', montant: 50, message: 'Mes enfants adorent les ateliers du mercredi', days_ago: 3 },
      { prenom: 'Bastien', montant: 10, message: 'Partagez tous svp', days_ago: 5 },
      { prenom: 'Laurence', montant: 25, message: '', days_ago: 8 },
      { prenom: 'Cedric', montant: 15, message: 'Soutien total', days_ago: 11 },
      { prenom: 'Ines', montant: 40, message: 'Le quartier a besoin du Comptoir', days_ago: 15 }
    ]
  },
  {
    slug: 'expedition-antarctique-lucas',
    title: 'Expédition Antarctique — Lucas, 19 ans',
    story: `Lucas a été sélectionné parmi 12 000 candidats pour une expédition scientifique en Antarctique. Les frais s'élèvent à 3 800 euros.`,
    image_url: 'https://images.unsplash.com/photo-1551415923-a2297c7fda79?w=800',
    goal_cents: 380000,
    target_collected: 210000,
    target_donors: 47,
    donors: [
      { prenom: 'Camille', montant: 50, message: 'Trop fier de toi Lucas !', days_ago: 1 },
      { prenom: 'Mathieu', montant: 30, message: 'Ramene nous des photos de manchots !', days_ago: 2 },
      { prenom: 'Elodie', montant: 20, message: 'Quelle aventure, bravo !', days_ago: 3 },
      { prenom: 'Hugo', montant: 25, message: 'Un pote de prepa qui croit en toi', days_ago: 5 },
      { prenom: 'Nadia', montant: 100, message: 'Tes parents doivent etre tellement fiers', days_ago: 7 },
      { prenom: 'Stephane', montant: 15, message: 'Belle initiative', days_ago: 10 },
      { prenom: 'Manon', montant: 40, message: 'Go Lucas !!!', days_ago: 13 },
      { prenom: 'Vincent', montant: 10, message: '', days_ago: 17 }
    ]
  }
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const c of cagnottes) {
      const donorsTotal = c.donors.reduce((sum, d) => sum + d.montant * 100, 0);
      const baselineCollected = Math.max(0, c.target_collected - donorsTotal);
      const baselineDonors = Math.max(0, c.target_donors - c.donors.length);

      const result = await client.query(
        `INSERT INTO cagnottes (slug, title, story, image_url, goal_cents, baseline_collected_cents, baseline_donors)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [c.slug, c.title, c.story, c.image_url, c.goal_cents, baselineCollected, baselineDonors]
      );

      const cagnotteId = result.rows[0].id;

      for (const d of c.donors) {
        const date = new Date();
        date.setDate(date.getDate() - d.days_ago);
        const seed = d.prenom.toLowerCase().replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ïî]/g, 'i');

        await client.query(
          `INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url, created_at, confirmed_at)
           VALUES ($1, $2, $3, $4, 'confirmed', $5, $6, $6)`,
          [cagnotteId, d.prenom, d.montant * 100, d.message, `https://i.pravatar.cc/40?u=${seed}-${d.days_ago}`, date.toISOString()]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Seed terminé : ${cagnottes.length} cagnottes insérées.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur seed:', err.message);
  } finally {
    client.release();
  }
}

seed();
