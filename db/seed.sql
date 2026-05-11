-- ============================================
-- seed.sql — Données de démonstration Ma Sadaqa
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Cagnotte 1 : Aide au logement
INSERT INTO cagnottes (slug, title, story, image_url, goal_cents, baseline_collected_cents, baseline_donors, is_active)
VALUES (
  'operation-toit-mehdi',
  'Aidons Mehdi à retrouver un toit',
  'Mehdi, 34 ans, père de deux enfants, a perdu son appartement à Lyon suite à un dégât des eaux. Il vit temporairement chez sa sœur dans un petit studio.

La cagnotte servira à financer le dépôt de garantie et le premier loyer d''un nouvel appartement. Qu''Allah récompense chaque donateur. Chaque euro compte pour redonner une stabilité à cette famille.',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
  240000, 142000, 24, 1
);

-- Cagnotte 2 : Soins médicaux enfant
INSERT INTO cagnottes (slug, title, story, image_url, goal_cents, baseline_collected_cents, baseline_donors, is_active)
VALUES (
  'soins-pour-petit-adam',
  'Soins urgents pour le petit Adam',
  'Adam, 6 ans, souffre d''une maladie rare qui nécessite un traitement spécialisé non remboursé par la Sécurité sociale. Ses parents, Youssef et Fatima, travaillent tous les deux mais ne peuvent pas assumer les 5 000€ de frais.

Aidons cette famille à offrir à leur fils le traitement dont il a besoin. Le Prophète ﷺ a dit : « Celui qui soulage un croyant d''une difficulté, Allah le soulagera d''une difficulté le Jour du Jugement. »',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
  500000, 287000, 73, 1
);

-- Cagnotte 3 : Mosquée
INSERT INTO cagnottes (slug, title, story, image_url, goal_cents, baseline_collected_cents, baseline_donors, is_active)
VALUES (
  'renovation-mosquee-al-nour',
  'Rénovation de la mosquée Al-Nour',
  'La mosquée Al-Nour de Marseille accueille plus de 500 fidèles chaque vendredi. Le toit fuit depuis des mois et les installations électriques sont vétustes.

Les travaux urgents sont estimés à 8 000€. Le Prophète ﷺ a dit : « Quiconque construit une mosquée pour Allah, Allah lui construira une maison au Paradis. » Participez à cette sadaqa jariya !',
  'https://images.unsplash.com/photo-1585036156171-384164a8c055?w=800',
  800000, 398000, 95, 1
);

-- Cagnotte 4 : Veuve et orphelins
INSERT INTO cagnottes (slug, title, story, image_url, goal_cents, baseline_collected_cents, baseline_donors, is_active)
VALUES (
  'soutien-oum-yassin',
  'Soutien à Oum Yassin et ses 3 orphelins',
  'Oum Yassin a perdu son mari dans un accident de travail il y a 2 mois. Elle se retrouve seule avec 3 enfants en bas âge à Toulouse, sans revenus stables.

Cette cagnotte l''aidera à payer le loyer et les courses pendant les prochains mois, le temps qu''elle retrouve une stabilité. Le Prophète ﷺ a dit : « Moi et celui qui prend en charge un orphelin serons comme cela au Paradis » en joignant son index et son majeur.',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
  350000, 201000, 56, 1
);

-- Cagnotte 5 : Étudiant en science islamique
INSERT INTO cagnottes (slug, title, story, image_url, goal_cents, baseline_collected_cents, baseline_donors, is_active)
VALUES (
  'bourse-ilyas-medine',
  'Bourse d''études pour Ilyas à Médine',
  'Ilyas, 21 ans de Bordeaux, a été accepté à l''Université Islamique de Médine. Il a besoin de financer son billet d''avion et ses premiers mois sur place.

Ses parents ne peuvent pas l''aider financièrement. Cette bourse lui permettra de poursuivre son rêve : étudier la science islamique à la source. Le Prophète ﷺ a dit : « Celui qui emprunte un chemin vers la science, Allah lui facilite un chemin vers le Paradis. »',
  'https://images.unsplash.com/photo-1585521551041-7b24e0643556?w=800',
  420000, 178000, 41, 1
);

-- Cagnotte 6 : Épicerie solidaire
INSERT INTO cagnottes (slug, title, story, image_url, goal_cents, baseline_collected_cents, baseline_donors, is_active)
VALUES (
  'epicerie-solidaire-al-baraka',
  'Épicerie solidaire Al-Baraka',
  'L''association Al-Baraka distribue chaque semaine des colis alimentaires à plus de 80 familles dans le besoin à Saint-Denis. Le Ramadan approche et les besoins explosent.

Nous avons besoin de 3 000€ pour assurer les colis du mois. Le Prophète ﷺ a dit : « Celui qui donne à manger à un jeûneur pour la rupture du jeûne aura la même récompense que lui. »',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
  300000, 112000, 31, 1
);

-- ============================================
-- DONS FICTIFS avec commentaires
-- ============================================

-- Dons cagnotte 1 (Mehdi - logement)
INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url, created_at, confirmed_at) VALUES
(1, 'Abdallah', 5000, 'Qu''Allah te facilite akhi, courage !', 'confirmed', 'https://i.pravatar.cc/40?u=abdallah-1', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(1, 'Khadija', 10000, 'De la part de toute la famille. Qu''Allah vous accorde un foyer béni.', 'confirmed', 'https://i.pravatar.cc/40?u=khadija-2', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(1, 'Omar', 2000, 'Force à toi mon frère', 'confirmed', 'https://i.pravatar.cc/40?u=omar-3', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(1, 'Aïcha', 3000, 'Sadaqa pour la famille de Mehdi', 'confirmed', 'https://i.pravatar.cc/40?u=aicha-4', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(1, 'Bilal', 1500, '', 'confirmed', 'https://i.pravatar.cc/40?u=bilal-5', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(1, 'Nour', 5000, 'Qu''Allah mette la baraka dans cette cagnotte', 'confirmed', 'https://i.pravatar.cc/40?u=nour-6', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(1, 'Yassine', 2500, 'Petit geste mais de tout coeur', 'confirmed', 'https://i.pravatar.cc/40?u=yassine-7', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
(1, 'Maryam', 7500, 'Qu''Allah te donne mieux en retour ya Mehdi', 'confirmed', 'https://i.pravatar.cc/40?u=maryam-8', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

-- Dons cagnotte 2 (Adam - soins)
INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url, created_at, confirmed_at) VALUES
(2, 'Fatima-Zahra', 10000, 'Pour le petit Adam, qu''Allah lui accorde la guérison complète', 'confirmed', 'https://i.pravatar.cc/40?u=fatimazahra-1', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(2, 'Ibrahim', 5000, 'Qu''Allah guérisse ton fils, courage aux parents', 'confirmed', 'https://i.pravatar.cc/40?u=ibrahim-2', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(2, 'Samira', 3000, 'On pense fort à vous', 'confirmed', 'https://i.pravatar.cc/40?u=samira-3', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 'Moussa', 2000, 'Qu''Allah vous facilite', 'confirmed', 'https://i.pravatar.cc/40?u=moussa-4', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(2, 'Hafsa', 7500, 'Je suis maman aussi, ça me touche beaucoup. Qu''Allah protège Adam.', 'confirmed', 'https://i.pravatar.cc/40?u=hafsa-5', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(2, 'Rachid', 15000, 'De la part de la communauté de Villeurbanne', 'confirmed', 'https://i.pravatar.cc/40?u=rachid-6', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
(2, 'Amina', 2500, 'Qu''Allah accorde shifa au petit', 'confirmed', 'https://i.pravatar.cc/40?u=amina-7', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
(2, 'Soufiane', 4000, '', 'confirmed', 'https://i.pravatar.cc/40?u=soufiane-8', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(2, 'Leïla', 1000, 'Qu''Allah vous récompense pour votre patience', 'confirmed', 'https://i.pravatar.cc/40?u=leila-9', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days');

-- Dons cagnotte 3 (Mosquée Al-Nour)
INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url, created_at, confirmed_at) VALUES
(3, 'Mohamed', 20000, 'Sadaqa jariya pour ma famille et moi. Qu''Allah accepte.', 'confirmed', 'https://i.pravatar.cc/40?u=mohamed-1', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(3, 'Aïssatou', 5000, 'Pour la maison d''Allah', 'confirmed', 'https://i.pravatar.cc/40?u=aissatou-2', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(3, 'Hamza', 3000, 'BarakAllahu fikum pour cette initiative', 'confirmed', 'https://i.pravatar.cc/40?u=hamza-3', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(3, 'Zineb', 10000, 'Qu''Allah fasse de cette mosquée un lieu de science et de paix', 'confirmed', 'https://i.pravatar.cc/40?u=zineb-4', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(3, 'Tarek', 1500, 'Petit don mais grande intention in sha Allah', 'confirmed', 'https://i.pravatar.cc/40?u=tarek-5', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(3, 'Oumayma', 5000, 'Au nom de mon père décédé, qu''Allah lui fasse miséricorde', 'confirmed', 'https://i.pravatar.cc/40?u=oumayma-6', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
(3, 'Karim', 7500, '', 'confirmed', 'https://i.pravatar.cc/40?u=karim-7', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
(3, 'Salma', 2000, 'Qu''Allah accepte de nous tous', 'confirmed', 'https://i.pravatar.cc/40?u=salma-8', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(3, 'Anas', 4000, 'Ma mosquée de quartier, je donne avec plaisir', 'confirmed', 'https://i.pravatar.cc/40?u=anas-9', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days');

-- Dons cagnotte 4 (Oum Yassin - veuve)
INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url, created_at, confirmed_at) VALUES
(4, 'Asma', 5000, 'Qu''Allah te donne la force ya okhti. On est avec toi.', 'confirmed', 'https://i.pravatar.cc/40?u=asma-1', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(4, 'Youssef', 10000, 'Le Prophète a recommandé de prendre soin des veuves et orphelins', 'confirmed', 'https://i.pravatar.cc/40?u=youssef-2', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(4, 'Nadia', 3000, 'Courage ma sœur, Allah est avec les patients', 'confirmed', 'https://i.pravatar.cc/40?u=nadia-3', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(4, 'Redouane', 2000, 'Qu''Allah prenne soin de tes enfants', 'confirmed', 'https://i.pravatar.cc/40?u=redouane-4', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(4, 'Imane', 8000, 'Don de notre halqa du dimanche. Qu''Allah vous bénisse.', 'confirmed', 'https://i.pravatar.cc/40?u=imane-5', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(4, 'Sofiane', 1500, '', 'confirmed', 'https://i.pravatar.cc/40?u=sofiane-6', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(4, 'Meriem', 4000, 'Inna lillahi wa inna ilayhi rajioun. Qu''Allah lui accorde le firdaws.', 'confirmed', 'https://i.pravatar.cc/40?u=meriem-7', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days');

-- Dons cagnotte 5 (Ilyas - études Médine)
INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url, created_at, confirmed_at) VALUES
(5, 'Abderrahman', 5000, 'Qu''Allah te facilite le chemin de la science ya akhi !', 'confirmed', 'https://i.pravatar.cc/40?u=abderrahman-1', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(5, 'Hawa', 3000, 'Fier de toi, représente-nous bien à Médine !', 'confirmed', 'https://i.pravatar.cc/40?u=hawa-2', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(5, 'Ismaïl', 2000, 'Qu''Allah ouvre les portes du ilm pour toi', 'confirmed', 'https://i.pravatar.cc/40?u=ismail-3', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(5, 'Safia', 7500, 'De la part de l''association des étudiants musulmans de Bordeaux', 'confirmed', 'https://i.pravatar.cc/40?u=safia-4', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
(5, 'Mehdi', 1500, 'Go go go ! Reviens nous imam in sha Allah', 'confirmed', 'https://i.pravatar.cc/40?u=mehdi-5', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
(5, 'Rania', 4000, 'Qu''Allah mette la baraka dans tes études', 'confirmed', 'https://i.pravatar.cc/40?u=rania-6', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
(5, 'Zakaria', 2500, '', 'confirmed', 'https://i.pravatar.cc/40?u=zakaria-7', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days');

-- Dons cagnotte 6 (Épicerie solidaire)
INSERT INTO dons (cagnotte_id, prenom, amount_cents, message, status, avatar_url, created_at, confirmed_at) VALUES
(6, 'Khalid', 5000, 'BarakAllahu fikum pour ce que vous faites pour la communauté', 'confirmed', 'https://i.pravatar.cc/40?u=khalid-1', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(6, 'Djamila', 3000, 'Qu''Allah récompense les bénévoles d''Al-Baraka', 'confirmed', 'https://i.pravatar.cc/40?u=djamila-2', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(6, 'Hassan', 2000, 'Pour les familles dans le besoin ce Ramadan', 'confirmed', 'https://i.pravatar.cc/40?u=hassan-3', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(6, 'Souad', 10000, 'Don de la famille Benali pour les colis du Ramadan', 'confirmed', 'https://i.pravatar.cc/40?u=souad-4', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(6, 'Malik', 1500, 'Qu''Allah accepte de nous', 'confirmed', 'https://i.pravatar.cc/40?u=malik-5', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
(6, 'Yasmine', 2500, 'Ma mère bénéficie de vos colis, jazakumullahu khayran', 'confirmed', 'https://i.pravatar.cc/40?u=yasmine-6', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
(6, 'Mourad', 4000, '', 'confirmed', 'https://i.pravatar.cc/40?u=mourad-7', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(6, 'Latifa', 2000, 'Qu''Allah nourrisse ceux qui nourrissent les autres', 'confirmed', 'https://i.pravatar.cc/40?u=latifa-8', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');
