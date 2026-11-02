/* Module : maths · proportionnalité (chapitre 10).
   Sources : cahier de Léandre, chapitre 10 « Proportionnalité » (4 pages : I Reconnaître, II Résoudre,
   III Représenter graphiquement, IV Égalité des produits en croix) et fiches d'exercices du manuel
   (D1 fiches 1, 2, 3, 4, 7 et 11). Les exercices sont inspirés des fiches, avec d'autres situations et d'autres nombres.
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";

const {esc, pick, shuffle, fold} = Revision;
const ri = Revision.randInt, f = Revision.fmt;

/* ---------- notions du chapitre ---------- */
const NOT = {
  def:   {p:1, name:"Grandeurs proportionnelles", d:"Définition et coefficient de proportionnalité"},
  tab:   {p:1, name:"Proportionnel ou pas ?", d:"Calculer les quotients d'un tableau"},
  unite: {p:2, name:"Passage à l'unité", d:"Trouver la valeur pour 1, puis multiplier"},
  meth:  {p:2, name:"Coefficient, × et +", d:"Méthodes du coefficient, multiplicative, additive"},
  croix: {p:2, name:"Produits en croix", d:"Égalité des produits en croix, quatrième proportionnelle"},
  graph: {p:3, name:"Le graphique", d:"Points alignés avec l'origine du repère"},
  vit:   {p:3, name:"Durées et vitesses", d:"Heures décimales, minutes, distance et vitesse"}
};
const MAXM = 5;

/* ---------- le « par cœur » (phrases du cahier, encadrés et phrases soulignées) ---------- */
const PAR_COEUR = [
  {id:"pc-def", n:"def", source:"Définition (encadré vert)",
   card:"Quand dit-on que deux grandeurs sont proportionnelles ?",
   q:"Complète la définition : deux grandeurs sont proportionnelles si…",
   text:"Deux grandeurs sont proportionnelles si l'on peut passer de l'une à l'autre en multipliant (ou en divisant) par un même nombre différent de zéro appelé coefficient de proportionnalité.",
   o:["l'on peut passer de l'une à l'autre en multipliant (ou en divisant) par un même nombre différent de zéro appelé coefficient de proportionnalité",
      "l'on peut passer de l'une à l'autre en ajoutant (ou en soustrayant) un même nombre différent de zéro appelé coefficient de proportionnalité",
      "l'on peut passer de l'une à l'autre en multipliant (ou en divisant) par un nombre qui change à chaque fois, appelé coefficient de proportionnalité",
      "l'on peut passer de l'une à l'autre en multipliant (ou en divisant) par un même nombre égal à zéro appelé coefficient de proportionnalité"],
   trou:"Deux grandeurs sont proportionnelles si l'on peut passer de l'une à l'autre en [[multipliant|multiplier]] (ou en divisant) par un [[même]] nombre différent de zéro appelé [[coefficient|coefficient de proportionnalité]] de proportionnalité."},
  {id:"pc-tab", n:"def", source:"Remarque, partie I (souligné)",
   card:"Comment appelle-t-on un tableau qui représente deux grandeurs proportionnelles ?",
   q:"Un tableau qui représente deux grandeurs proportionnelles s'appelle…",
   text:"Très souvent, deux grandeurs proportionnelles sont représentées dans un tableau, appelé alors tableau de proportionnalité.",
   o:["un tableau de proportionnalité","un tableau des produits en croix","un tableau des coefficients","un tableau de quatrième proportionnelle"],
   trou:"Très souvent, deux grandeurs proportionnelles sont représentées dans un tableau, appelé alors [[tableau de proportionnalité]]."},
  {id:"pc-form", n:"def", source:"Formule (encadré bleu)",
   card:"À partir d'un tableau de proportionnalité, comment obtient-on le coefficient de proportionnalité ?",
   q:"À partir d'un tableau de proportionnalité, le coefficient de proportionnalité s'obtient en calculant…",
   text:"À partir d'un tableau de proportionnalité, le coefficient de proportionnalité s'obtient en calculant le quotient : valeur 2ème ligne ÷ valeur 1ère ligne.",
   o:["le quotient : valeur 2ème ligne ÷ valeur 1ère ligne","le quotient : valeur 1ère ligne ÷ valeur 2ème ligne","la différence : valeur 2ème ligne − valeur 1ère ligne","le produit : valeur 2ème ligne × valeur 1ère ligne"],
   trou:"À partir d'un tableau de proportionnalité, le coefficient de proportionnalité s'obtient en calculant le [[quotient|division]] : valeur 2ème ligne ÷ valeur 1ère ligne."},
  {id:"pc-rem", n:"tab", source:"Remarque, partie I (en gras)",
   card:"Tu appliques la formule à chaque colonne d'un tableau, et les résultats ne sont pas tous égaux. Que conclus-tu ?",
   q:"Lorsque l'on applique la formule, si tous les résultats ne sont pas égaux, alors…",
   text:"Lorsque l'on applique la formule, si tous les résultats ne sont pas égaux, alors le tableau n'est pas de proportionnalité.",
   o:["le tableau n'est pas de proportionnalité","le tableau est quand même de proportionnalité","il faut additionner les résultats","on prend le plus grand résultat comme coefficient"],
   trou:"Lorsque l'on applique la formule, si tous les résultats ne sont pas [[égaux|egal|pareils]], alors le tableau n'est pas de proportionnalité."},
  {id:"pc-g1", n:"graph", source:"Propriété 1 (encadré rouge)",
   card:"Une situation est une situation de proportionnalité. Que sais-tu des points de sa représentation graphique ?",
   q:"Si une situation est une situation de proportionnalité, alors les points de sa représentation graphique sont…",
   text:"Si une situation est une situation de proportionnalité, alors les points de sa représentation graphique sont alignés avec l'origine du repère.",
   o:["alignés avec l'origine du repère","alignés, mais jamais avec l'origine du repère","placés sur une courbe qui part de l'origine du repère","tous à la même hauteur dans le repère"],
   trou:"Si une situation est une situation de proportionnalité, alors les points de sa représentation graphique sont [[alignés]] avec l'[[origine]] du repère."},
  {id:"pc-g2", n:"graph", source:"Propriété 2 (encadré rouge)",
   card:"Les points d'une représentation graphique sont alignés avec l'origine du repère. Que peux-tu en conclure ?",
   q:"Si les points d'une représentation graphique sont alignés avec l'origine du repère, alors…",
   text:"Si les points d'une représentation graphique sont alignés avec l'origine du repère, alors ils représentent une situation de proportionnalité.",
   o:["ils représentent une situation de proportionnalité","ils ne représentent pas une situation de proportionnalité","il faut encore calculer les produits en croix pour savoir","ils représentent une situation de proportionnalité seulement s'il y a 4 points"],
   trou:"Si les points d'une représentation graphique sont alignés avec l'origine du repère, alors ils représentent une [[situation de proportionnalité|proportionnalité]]."},
  {id:"pc-croix", n:"croix", source:"Propriété : égalité des produits en croix",
   card:"Que dit la propriété de l'égalité des produits en croix ?",
   q:"Dans un tableau de proportionnalité, les produits en croix sont…",
   text:"Dans un tableau de proportionnalité, les produits en croix sont égaux.",
   o:["égaux","toujours différents","égaux à zéro","égaux au coefficient de proportionnalité"],
   trou:"Dans un tableau de proportionnalité, les [[produits en croix]] sont [[égaux|egal]]."},
  {id:"pc-4e", n:"croix", source:"Partie IV (souligné)",
   card:"Comment appelle-t-on la valeur que l'on calcule à partir des trois autres dans un tableau de proportionnalité ?",
   q:"La valeur que l'on souhaite calculer à partir des trois autres est appelée…",
   text:"Dans ce cas, la valeur que l'on souhaite calculer à partir des trois autres est appelée quatrième proportionnelle.",
   o:["quatrième proportionnelle","coefficient de proportionnalité","produit en croix","valeur de l'unité"],
   trou:"Dans ce cas, la valeur que l'on souhaite calculer à partir des trois autres est appelée [[quatrième proportionnelle|4e proportionnelle|4ème proportionnelle|4eme proportionnelle]]."}
];

/* ---------- questions de cours ---------- */
/* card : recto ; q : énoncé du quiz ; a : verso ; o : bonne réponse puis 3 pièges */
const COURS = [
  {id:"coefnom", n:"def", card:"Comment s'appelle le nombre par lequel on multiplie pour passer d'une grandeur à l'autre ?",
   q:"Le nombre par lequel on multiplie pour passer d'une grandeur à l'autre s'appelle…",
   a:"Le coefficient de proportionnalité.", o:["le coefficient de proportionnalité","le produit en croix","la quatrième proportionnelle","l'origine du repère"]},
  {id:"coefzero", n:"def", card:"Le coefficient de proportionnalité peut-il être égal à 0 ?",
   q:"Le coefficient de proportionnalité peut-il être égal à 0 ?",
   a:"Non : c'est un nombre différent de zéro.", o:["Non, c'est un nombre différent de zéro","Oui, toujours","Oui, si le tableau a 4 colonnes","Seulement pour les prix"]},
  {id:"tshirt", n:"def", card:"Un t-shirt coûte 11 €. Quel est le coefficient de proportionnalité entre le nombre de t-shirts et le prix ?",
   q:"Un t-shirt coûte 11 €. Le coefficient de proportionnalité entre le nombre de t-shirts et le prix est…",
   a:"11 : le prix s'obtient en multipliant le nombre de t-shirts par 11.", o:["11","1","12","110"],
   tip:"Exemple du cahier : 6 t-shirts → 6 × 11 = 66 € ; 12 t-shirts → 12 × 11 = 132 €."},
  {id:"retour", n:"def", card:"Pour passer de la 1re ligne à la 2e ligne, on multiplie par 11. Et pour revenir de la 2e ligne à la 1re ?",
   q:"De la 1re à la 2e ligne, on multiplie par 11. De la 2e à la 1re ligne, on…",
   a:"On divise par 11.", o:["divise par 11","multiplie par 11","soustrait 11","multiplie par 2"],
   tip:"132 ÷ 11 = 12 : on retrouve le nombre de t-shirts."},
  {id:"recette", n:"def", card:"Une recette est prévue pour 4 personnes. Comment l'adapter pour 8 personnes ?",
   q:"Une recette est prévue pour 4 personnes. Pour 8 personnes, il faut…",
   a:"Multiplier toutes les quantités par 2 : 2 fois plus de personnes, 2 fois plus de chaque ingrédient.",
   o:["multiplier toutes les quantités par 2","ajouter 4 à chaque quantité","multiplier seulement la farine par 2","garder les mêmes quantités"],
   tip:"C'est l'exemple des pommes du cahier : 2 pommes pour 4 personnes, 4 pommes pour 8 personnes."},
  {id:"verif", n:"tab", card:"Comment vérifies-tu qu'un tableau est un tableau de proportionnalité ?",
   q:"Pour vérifier qu'un tableau est de proportionnalité, on…",
   a:"On calcule séparément, pour chaque colonne, le quotient valeur 2e ligne ÷ valeur 1re ligne.\nS'ils sont tous égaux, c'est un tableau de proportionnalité.",
   o:["calcule le quotient 2e ligne ÷ 1re ligne pour chaque colonne et on vérifie qu'ils sont égaux","additionne toutes les cases et on vérifie que le total est rond","vérifie que les nombres de la 2e ligne sont plus grands","calcule un seul quotient, celui de la première colonne"]},
  {id:"ex4", n:"tab", card:"Temps : 10, 20, 30, 40 min. Distance : 20, 30, 50, 60 km. La distance est-elle proportionnelle au temps ?",
   q:"Temps : 10, 20, 30, 40 min. Distance : 20, 30, 50, 60 km. La distance est-elle proportionnelle au temps ?",
   a:"Non : 20 ÷ 10 = 2 mais 30 ÷ 20 = 1,5.\nLes quotients ne sont pas égaux, donc ce n'est pas un tableau de proportionnalité.",
   o:["Non, car 20 ÷ 10 = 2 mais 30 ÷ 20 = 1,5","Oui, car les deux lignes augmentent","Oui, car on ajoute 10 à chaque fois","On ne peut pas savoir sans graphique"],
   tip:"Exemple 4 du cahier : deux grandeurs qui augmentent ensemble ne sont pas forcément proportionnelles !"},
  {id:"fleurs", n:"tab", card:"4 tulipes coûtent 6,40 € et 10 tulipes coûtent 15 €. Le prix est-il proportionnel au nombre de tulipes ?",
   q:"4 tulipes coûtent 6,40 € et 10 tulipes coûtent 15 €. Le prix est-il proportionnel ?",
   a:"Non : 6,40 ÷ 4 = 1,60 € la tulipe, mais 15 ÷ 10 = 1,50 € la tulipe.\nLe prix d'une tulipe n'est pas le même.",
   o:["Non, car 6,40 ÷ 4 = 1,6 mais 15 ÷ 10 = 1,5","Oui, car plus on achète de tulipes, plus on paie","Oui, car 10 − 4 = 6","Non, car 15 n'est pas un nombre décimal"],
   tip:"Le grand bouquet est un peu moins cher à la tulipe : c'est une promotion, pas de la proportionnalité."},
  {id:"forfait", n:"tab", card:"Un abonnement coûte 10 €, plus 2 € par séance. Le prix est-il proportionnel au nombre de séances ?",
   q:"Un abonnement coûte 10 €, plus 2 € par séance. Le prix est-il proportionnel au nombre de séances ?",
   a:"Non : 1 séance coûte 12 € et 2 séances 14 €.\n12 ÷ 1 = 12 mais 14 ÷ 2 = 7 : les quotients ne sont pas égaux.",
   o:["Non, car 12 ÷ 1 = 12 mais 14 ÷ 2 = 7","Oui, car on paie 2 € par séance","Oui, car le coefficient est 10","Oui, car le prix augmente toujours"],
   tip:"Comme les tarifs avec abonnement de la fiche 3 : avec 0 séance, on paie déjà 10 €."},
  {id:"age", n:"tab", card:"La taille d'un enfant est-elle proportionnelle à son âge ?",
   q:"La taille d'un enfant est-elle proportionnelle à son âge ?",
   a:"Non : un enfant de 10 ans ne mesure pas 2 fois plus qu'un enfant de 5 ans.",
   o:["Non","Oui","Oui, jusqu'à 18 ans","Oui, si on mesure en mètres"]},
  {id:"unitedef", n:"unite", card:"En quoi consiste le passage à l'unité ?",
   q:"Le passage à l'unité consiste à…",
   a:"Revenir à une seule unité : on calcule d'abord la valeur pour 1 (le prix d'un seul stylo), puis on multiplie.",
   o:["calculer d'abord la valeur pour 1, puis multiplier","calculer d'abord la valeur pour 10, puis diviser","additionner deux colonnes du tableau","tracer le graphique et lire la réponse"]},
  {id:"uniteex", n:"unite", card:"4 stylos coûtent 10 €. Combien coûtent 12 stylos, par passage à l'unité ?",
   q:"4 stylos coûtent 10 €. Par passage à l'unité, la première étape est…",
   a:"1 stylo : 10 ÷ 4 = 2,5 €.\n12 stylos : 2,5 × 12 = 30 €.",
   o:["10 ÷ 4 = 2,5 € pour un stylo","10 × 4 = 40 € pour un stylo","12 − 4 = 8 stylos de plus","10 + 12 = 22 €"],
   tip:"Exemple 5 du cahier, qu'on résout de quatre façons différentes."},
  {id:"techs", n:"meth", card:"Quelles techniques permettent de trouver une valeur manquante dans un tableau de proportionnalité ?",
   q:"Laquelle de ces méthodes N'EST PAS une technique pour trouver une valeur manquante ?",
   a:"Le passage à l'unité, le coefficient de proportionnalité, la méthode multiplicative, la méthode additive et l'égalité des produits en croix.",
   o:["Ajouter le même nombre à chaque case","Le passage à l'unité","La méthode additive","Les produits en croix"]},
  {id:"coefmeth", n:"meth", card:"Méthode du coefficient : 4 stylos coûtent 10 €. Comment trouver le prix de 12 stylos ?",
   q:"Méthode du coefficient : 4 stylos coûtent 10 €. Le coefficient de proportionnalité vaut…",
   a:"On calcule le coefficient : 10 ÷ 4 = 2,5.\nPuis on complète le tableau avec : 12 × 2,5 = 30 €.",
   o:["10 ÷ 4 = 2,5","4 ÷ 10 = 0,4","10 − 4 = 6","10 × 4 = 40"]},
  {id:"multi", n:"meth", card:"Méthode multiplicative : 4 stylos coûtent 10 €. Combien coûtent 12 stylos ?",
   q:"Méthode multiplicative : 4 stylos coûtent 10 €. Comme 12 = 4 × 3, le prix de 12 stylos est…",
   a:"12 stylos = 4 stylos × 3, donc le prix est aussi multiplié par 3 : 10 € × 3 = 30 €.",
   o:["10 € × 3 = 30 €","10 € + 3 = 13 €","10 € × 12 = 120 €","10 € + 8 = 18 €"]},
  {id:"additive", n:"meth", card:"Méthode additive : 4 stylos coûtent 10 € et 8 stylos coûtent 20 €. Combien coûtent 12 stylos ?",
   q:"4 stylos coûtent 10 € et 8 stylos coûtent 20 €. Comme 12 = 4 + 8, 12 stylos coûtent…",
   a:"12 stylos = 4 stylos + 8 stylos, donc le prix = 10 € + 20 € = 30 €.",
   o:["10 € + 20 € = 30 €","10 € × 20 = 200 €","20 € − 10 € = 10 €","20 € + 4 = 24 €"]},
  {id:"echelle", n:"meth", card:"Que veut dire « un plan à l'échelle 1/200 » ?",
   q:"Sur un plan à l'échelle 1/200, 1 cm sur le plan représente…",
   a:"1 cm sur le plan représente 200 cm (2 m) en réalité.\nLes longueurs du plan sont proportionnelles aux longueurs réelles.",
   o:["200 cm en réalité","200 m en réalité","2 cm en réalité","1/200 de cm en réalité"],
   tip:"Fiche 1, le parc de jeu : 12 m en vrai → 6 cm sur le dessin."},
  {id:"croixform", n:"croix", card:"Tableau de proportionnalité : 1re ligne a et c, 2e ligne b et x. Quelle égalité donnent les produits en croix ?",
   q:"Tableau de proportionnalité : 1re ligne a et c, 2e ligne b et x. Les produits en croix donnent…",
   a:"a × x = b × c", o:["a × x = b × c","a × b = c × x","a × c = b × x","a + x = b + c"],
   tip:"On multiplie en diagonale : a avec x, b avec c."},
  {id:"croixcalc", n:"croix", card:"Avec 30 × x = 18 × 48, comment calcules-tu x ?",
   q:"Avec 30 × x = 18 × 48, on calcule x en faisant…",
   a:"On divise par 30 : x = (48 × 18) ÷ 30 = 864 ÷ 30 = 28,8.",
   o:["(48 × 18) ÷ 30","(48 × 30) ÷ 18","48 × 18 × 30","48 + 18 − 30"],
   tip:"Exemple 7 du cahier : 30 kg d'oranges → 18 L, donc 48 kg d'oranges → 28,8 L de cocktail."},
  {id:"croixmeth", n:"croix", card:"Pour résoudre un problème avec les produits en croix, que fais-tu en premier ?",
   q:"Pour résoudre un problème avec les produits en croix, on commence par…",
   a:"Regrouper les données dans un tableau, et noter x la valeur cherchée.",
   o:["regrouper les données dans un tableau et noter x la valeur cherchée","multiplier tous les nombres de l'énoncé","tracer un graphique","additionner les deux premières valeurs"]},
  {id:"gligne", n:"graph", card:"Les points d'un graphique sont alignés, mais la droite ne passe pas par l'origine. Est-ce une situation de proportionnalité ?",
   q:"Les points sont alignés, mais la droite ne passe pas par l'origine. Est-ce une situation de proportionnalité ?",
   a:"Non : il faut que les points soient alignés AVEC l'origine du repère.",
   o:["Non, car la droite ne passe pas par l'origine","Oui, car les points sont alignés","Oui, si la droite monte","On ne peut pas savoir"],
   tip:"C'est le piège du hand-spinner (fiche 2) : une droite qui part de 20 n'est pas une situation de proportionnalité."},
  {id:"gcourbe", n:"graph", card:"Les points d'un graphique forment une courbe qui part de l'origine. Est-ce une situation de proportionnalité ?",
   q:"Les points forment une courbe qui part de l'origine. Est-ce une situation de proportionnalité ?",
   a:"Non : les points ne sont pas alignés.",
   o:["Non, car les points ne sont pas alignés","Oui, car elle part de l'origine","Oui, si la courbe monte","Oui, car il y a un repère"],
   tip:"Le condensateur de la fiche 2 : une courbe, donc pas de proportionnalité."},
  {id:"gorigine", n:"graph", card:"Dans le graphique des stylos (exemple 5), que représente l'origine du repère ?",
   q:"Dans le graphique des stylos, l'origine du repère représente…",
   a:"0 stylo coûte 0 € : le point de coordonnées (0 ; 0).",
   o:["0 stylo coûte 0 €","1 stylo coûte 2,5 €","le prix le plus élevé","le coefficient de proportionnalité"]},
  {id:"gex4", n:"graph", card:"Pourquoi le graphique de l'exemple 4 (la voiture) ne représente-t-il pas une situation de proportionnalité ?",
   q:"Pourquoi le graphique de l'exemple 4 (la voiture) ne représente-t-il pas une situation de proportionnalité ?",
   a:"Car ses points ne sont pas alignés avec l'origine du repère.",
   o:["Car ses points ne sont pas alignés avec l'origine du repère","Car il n'y a que 4 points","Car la distance augmente","Car le temps est en minutes"]},
  {id:"v60", n:"vit", card:"Une voiture roule à la vitesse constante de 60 km/h. Qu'est-ce que ça veut dire ?",
   q:"Une voiture roule à 60 km/h. Ça veut dire qu'elle parcourt…",
   a:"60 km en 1 heure (60 minutes).\nÀ vitesse constante, la distance est proportionnelle à la durée.",
   o:["60 km en 1 heure","60 km en 1 minute","1 km en 60 heures","60 m en 1 heure"]},
  {id:"vmin", n:"vit", card:"Comment convertis-tu des minutes en heure décimale ?",
   q:"Pour convertir des minutes en heure décimale, on…",
   a:"On divise par 60.\n45 min = 45 ÷ 60 = 0,75 h.",
   o:["divise par 60","divise par 100","multiplie par 60","ajoute une virgule"],
   tip:"Le piège : 45 min, ce n'est PAS 0,45 h ! Une heure, c'est 60 minutes, pas 100."},
  {id:"vh", n:"vit", card:"Comment convertis-tu une heure décimale en minutes ?",
   q:"Pour convertir une heure décimale en minutes, on…",
   a:"On multiplie par 60.\n0,2 h = 0,2 × 60 = 12 min.",
   o:["multiplie par 60","multiplie par 100","divise par 60","enlève la virgule"]},
  {id:"vtiers", n:"vit", card:"Combien de minutes dans 1/3 h ? Et dans 2/3 h ?",
   q:"1/3 h, c'est…",
   a:"1/3 h = 60 ÷ 3 = 20 min.\n2/3 h = 2 × 20 = 40 min.",
   o:["20 min","30 min","33 min","13 min"]}
];

/* ---------- outils ---------- */
const norm = s => fold(s).replace(/[’']/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\b(l|le|la|les|un|une|des|d|de|du|en|au)\b/g, " ").replace(/\s+/g, " ").trim();
const stem = s => s.split(" ").map(w => w.replace(/(aux|es|e|s|x)$/, "")).join(" ");
const wordOk = (list, v) => { const a = norm(v); return !!a && list.some(k => { const kk = norm(k); return a === kk || stem(a) === stem(kk); }); };
const UNIT_RE = /(€|euros?|km\/h|km|kg|min(utes?)?|h(eures?)?|cm|m|l|litres?|g|pages?|pulls?|s)$/;
function numF(ans, unit){
  return {id:"n", label:"Ta réponse", inputmode:"decimal", unit, check: v => {
    const raw = String(v).trim().toLowerCase().replace(/\s+/g, "").replace(UNIT_RE, "");
    const ok = Revision.numEqual(raw, ans);
    return {ok, fix: ok ? "✓" : isNaN(Revision.parseNum(raw)) ? `Écris un nombre. → ${f(ans)}${unit}` : `→ ${f(ans)}${unit}`};
  }};
}
function table(rows, hl){ // rows: [[titre, [cellules]]] ; hl : cellule « ? » en rouge
  return `<div class="tbw"><table class="tb">${rows.map(([h, c]) => `<tr><th>${h}</th>${c.map(x => `<td${x === "?" || x === "x" ? ' style="color:var(--red);font-weight:700"' : ""}>${x}</td>`).join("")}</tr>`).join("")}</table></div>`;
}
const sameN = (a, b) => Math.abs(a - b) < 1e-9;
function distinctInts(n, lo, hi){ const s = new Set(); while (s.size < n) s.add(ri(lo, hi)); return [...s].sort((a, b) => a - b); }

/* ---------- graphique (SVG) ---------- */
/* o : {pts:[[x,y]], xmax, ymax, xstep, ystep, xlab, ylab, xname, yname, path:[[x,y]] (pointillés), solid:bool} */
function gfig(o){
  const W = 360, H = 250, X0 = 46, Y0 = 212, PW = 290, PH = 190;
  const px = x => X0 + x / o.xmax * PW, py = y => Y0 - y / o.ymax * PH;
  let s = "";
  for (let x = 0; x <= o.xmax + 1e-9; x += o.xstep) s += `<line x1="${px(x).toFixed(1)}" y1="${py(0)}" x2="${px(x).toFixed(1)}" y2="${py(o.ymax)}" style="stroke:var(--line);stroke-width:.8"/>`;
  for (let y = 0; y <= o.ymax + 1e-9; y += o.ystep) s += `<line x1="${px(0)}" y1="${py(y).toFixed(1)}" x2="${px(o.xmax)}" y2="${py(y).toFixed(1)}" style="stroke:var(--line);stroke-width:.8"/>`;
  s += `<line x1="${px(0)}" y1="${py(0)}" x2="${px(o.xmax) + 10}" y2="${py(0)}" style="stroke:var(--ink);stroke-width:1.6"/><line x1="${px(0)}" y1="${py(0)}" x2="${px(0)}" y2="${py(o.ymax) - 10}" style="stroke:var(--ink);stroke-width:1.6"/>`;
  for (let x = 0; x <= o.xmax + 1e-9; x += o.xlab) s += `<text x="${px(x).toFixed(1)}" y="${py(0) + 16}" text-anchor="middle" style="font:12px var(--f-body);fill:var(--muted)">${f(x)}</text>`;
  for (let y = o.ylab; y <= o.ymax + 1e-9; y += o.ylab) s += `<text x="${px(0) - 6}" y="${(py(y) + 4).toFixed(1)}" text-anchor="end" style="font:12px var(--f-body);fill:var(--muted)">${f(y)}</text>`;
  s += `<text x="${px(o.xmax) + 10}" y="${py(0) + 32}" text-anchor="end" style="font:600 12px var(--f-body);fill:var(--ink)">${esc(o.xname)}</text>`;
  s += `<text x="${px(0) + 6}" y="${py(o.ymax) - 6}" style="font:600 12px var(--f-body);fill:var(--ink)">${esc(o.yname)}</text>`;
  if (o.path) s += `<polyline points="${o.path.map(([x, y]) => `${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(" ")}" style="fill:none;stroke:var(--pen);stroke-width:2;${o.solid ? "" : "stroke-dasharray:6 5"}"/>`;
  (o.pts || []).forEach(([x, y]) => { const X = px(x), Y = py(y); s += `<path d="M${X - 5} ${Y - 5}L${X + 5} ${Y + 5}M${X - 5} ${Y + 5}L${X + 5} ${Y - 5}" style="stroke:var(--red);stroke-width:2.2"/>`; });
  return `<div class="fig"><svg viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Graphique">${s}</svg></div>`;
}

/* ---------- situations pour les problèmes ---------- */
/* h1/h2 : titres du tableau ; u : unité de la 2e grandeur ; ks : coefficients réalistes ; ns : valeurs de la 1re grandeur */
const CTX = [
  {h1:"Nombre de croissants", h2:"Prix (en €)", u:" €", ks:[0.9, 1.1, 1.2, 1.3, 1.15], ns:[2, 3, 4, 5, 6, 8, 10, 12],
   s:(n, v) => `${n} croissants coûtent ${f(v)} €`, q:m => `Combien coûtent ${m} croissants ?`, r:(m, x) => `${m} croissants coûtent ${f(x)} €.`, one:"1 croissant coûte"},
  {h1:"Nombre de cahiers", h2:"Prix (en €)", u:" €", ks:[1.5, 2.5, 3.2, 2.4, 1.8], ns:[2, 3, 4, 5, 6, 8, 10],
   s:(n, v) => `${n} cahiers coûtent ${f(v)} €`, q:m => `Combien coûtent ${m} cahiers ?`, r:(m, x) => `${m} cahiers coûtent ${f(x)} €.`, one:"1 cahier coûte"},
  {h1:"Nombre de places", h2:"Prix (en €)", u:" €", ks:[7.5, 8, 9.5, 6.5, 12], ns:[2, 3, 4, 5, 6],
   s:(n, v) => `${n} places de cinéma coûtent ${f(v)} €`, q:m => `Combien coûtent ${m} places ?`, r:(m, x) => `${m} places coûtent ${f(x)} €.`, one:"1 place coûte"},
  {h1:"Masse de pommes (kg)", h2:"Prix (en €)", u:" €", ks:[2.2, 2.5, 1.8, 3.5, 2.8], ns:[2, 3, 4, 5, 6],
   s:(n, v) => `${n} kg de pommes coûtent ${f(v)} €`, q:m => `Combien coûtent ${m} kg de pommes ?`, r:(m, x) => `${m} kg de pommes coûtent ${f(x)} €.`, one:"1 kg de pommes coûte"},
  {h1:"Nombre de personnes", h2:"Farine (en g)", u:" g", ks:[50, 60, 75, 40, 45], ns:[2, 4, 5, 6, 8],
   s:(n, v) => `Pour faire des crêpes pour ${n} personnes, il faut ${f(v)} g de farine`, q:m => `Combien de farine faut-il pour ${m} personnes ?`, r:(m, x) => `Pour ${m} personnes, il faut ${f(x)} g de farine.`, one:"Pour 1 personne, il faut"},
  {h1:"Durée (en min)", h2:"Pages imprimées", u:" pages", ks:[12, 15, 18, 20, 25], ns:[2, 3, 4, 5, 6],
   s:(n, v) => `Une imprimante imprime ${f(v)} pages en ${n} minutes`, q:m => `Combien de pages imprime-t-elle en ${m} minutes ?`, r:(m, x) => `En ${m} minutes, elle imprime ${f(x)} pages.`, one:"En 1 minute, elle imprime"},
  {h1:"Essence (en L)", h2:"Distance (en km)", u:" km", ks:[16, 18, 20, 15, 22], ns:[2, 3, 4, 5, 8, 10],
   s:(n, v) => `Avec ${n} L d'essence, une voiture parcourt ${f(v)} km`, q:m => `Quelle distance parcourt-elle avec ${m} L ?`, r:(m, x) => `Avec ${m} L, elle parcourt ${f(x)} km.`, one:"Avec 1 L, elle parcourt"},
  {h1:"Durée (en h)", h2:"Salaire (en €)", u:" €", ks:[11.5, 12, 12.5, 14, 13], ns:[2, 3, 4, 5, 6, 8],
   s:(n, v) => `Pour ${n} heures de travail, Inès gagne ${f(v)} €`, q:m => `Combien gagne-t-elle pour ${m} heures ?`, r:(m, x) => `Pour ${m} heures, elle gagne ${f(x)} €.`, one:"Pour 1 heure, elle gagne"}
];
function setup(minM){ // n, m différents, k et valeurs
  const c = pick(CTX), k = pick(c.ks), n = pick(c.ns);
  let m; do { m = ri(minM || 2, 15); } while (m === n);
  return {c, k, n, m, v: n * k, x: m * k};
}

/* ---------- exercices (nouveaux nombres à chaque fois) ---------- */
const GEN = {
  tabYN(){
    const k = pick([1.5, 2, 2.5, 3, 4, 5, 0.5, 1.2]), xs = distinctInts(4, 2, 12), yes = Math.random() < .5;
    let ys = xs.map(x => x * k);
    if (!yes) { const i = ri(1, 3), d = pick([1, 2, -1, 3]); ys = ys.map((y, j) => j === i ? y + d : y); }
    const qs = xs.map((x, i) => ys[i] / x);
    return {n:"tab", kind:"choice", wide:true,
      prompt:`Ce tableau est-il un tableau de proportionnalité ?${table([["1re ligne", xs.map(f)], ["2e ligne", ys.map(f)]])}`,
      short:"Dire si un tableau est de proportionnalité",
      opts:[{t:"Oui, c'est un tableau de proportionnalité", ok:yes}, {t:"Non, ce n'est pas un tableau de proportionnalité", ok:!yes}],
      answerText: yes ? "Oui" : "Non",
      steps:`<p>On calcule séparément les quotients 2e ligne ÷ 1re ligne :</p><p>${xs.map((x, i) => `${f(ys[i])} ÷ ${f(x)} = ${f(qs[i])}`).join(" ; ")}</p>
        <p class="concl">${yes ? `Tous les quotients sont égaux à ${f(k)} : c'est un tableau de proportionnalité, de coefficient ${f(k)}.` : `Les quotients ne sont pas tous égaux : le tableau n'est pas de proportionnalité.`}</p>`};
  },
  tabCoef(){
    const k = pick([1.5, 2.5, 3, 4, 6, 0.5, 1.2, 7, 12]), xs = distinctInts(3, 2, 10), ys = xs.map(x => x * k);
    return {n:"def", kind:"num", ans:k, unit:"",
      prompt:`Ce tableau est un tableau de proportionnalité. Quel est son <b>coefficient de proportionnalité</b> ?${table([["1re ligne", xs.map(f)], ["2e ligne", ys.map(f)]])}`,
      short:"Calculer le coefficient d'un tableau", dist:[1 / k, ys[0] - xs[0], k + 1, ys[0] * xs[0]],
      steps:`<p>Coefficient = valeur 2ème ligne ÷ valeur 1ère ligne.</p><p>${xs.map((x, i) => `${f(ys[i])} ÷ ${f(x)}`).join(" = ")} = ${f(k)}</p>
        <p class="concl">Le coefficient de proportionnalité est ${f(k)}.</p>`};
  },
  forfait(){
    const fx = pick([0, 0, 5, 8, 10, 15, 20]), p = pick([2, 3, 4, 1.5, 2.5, 6]), [it, its] = pick([["séance de piscine", "séances"], ["heure de location de vélo", "heures"], ["entrée au musée", "entrées"], ["cours de guitare", "cours"]]);
    const yes = fx === 0, a = 2, b = 5, pa = fx + a * p, pb = fx + b * p;
    const txt = fx ? `On paie un abonnement de ${f(fx)} €, puis ${f(p)} € par ${it}.` : `On paie ${f(p)} € par ${it}, sans abonnement.`;
    return {n:"tab", kind:"choice", wide:true,
      prompt:`${txt} Le prix payé est-il proportionnel au nombre de ${its} ?`,
      short:"Tarif avec ou sans abonnement",
      opts:[{t:"Oui, le prix est proportionnel", ok:yes}, {t:"Non, le prix n'est pas proportionnel", ok:!yes}], answerText: yes ? "Oui" : "Non",
      steps:`<p>Pour ${a} : ${fx ? f(fx) + " + " : ""}${a} × ${f(p)} = ${f(pa)} €. Pour ${b} : ${fx ? f(fx) + " + " : ""}${b} × ${f(p)} = ${f(pb)} €.</p>
        <p>Quotients : ${f(pa)} ÷ ${a} = ${f(pa / a)} ; ${f(pb)} ÷ ${b} = ${f(pb / b)}</p>
        <p class="concl">${yes ? `Les quotients sont égaux (${f(p)}) : le prix est proportionnel, de coefficient ${f(p)}.` : `Les quotients ne sont pas égaux : le prix n'est pas proportionnel (avec 0, on paie déjà ${f(fx)} €).`}</p>`};
  },
  unite(){
    const {c, k, n, m, v, x} = setup();
    return {n:"unite", kind:"num", ans:x, unit:c.u,
      prompt:`${c.s(n, v)}. ${c.q(m)} <i>(Passe par l'unité.)</i>`,
      short:"Passage à l'unité", dist:[v + (m - n), k, v * m, m * n / v, v / m * n],
      steps:`<p>On revient à l'unité : ${c.one} ${f(v)} ÷ ${n} = ${f(k)}${c.u}.</p><p>Puis ${f(k)} × ${m} = ${f(x)}</p>
        <p class="concl">${c.r(m, x)}</p>`};
  },
  uniteVal(){
    const {c, k, n, v} = setup();
    return {n:"unite", kind:"num", ans:k, unit:c.u,
      prompt:`${c.s(n, v)}. Complète : « ${c.one} … » <i>(Calcule la valeur pour une seule unité.)</i>`,
      short:"Calculer la valeur pour 1", dist:[n / v, v - n, v * n, k + 1],
      steps:`<p>On divise par ${n} : ${f(v)} ÷ ${n} = ${f(k)}</p><p class="concl">${c.one} ${f(k)}${c.u}.</p>`};
  },
  coefTab(){
    const {c, k, n, m, v, x} = setup();
    return {n:"meth", kind:"num", ans:x, unit:c.u,
      prompt:`${c.s(n, v)}. Complète le tableau de proportionnalité avec le <b>coefficient</b>.${table([[c.h1, [n, m]], [c.h2, [f(v), "?"]]])}`,
      short:"Compléter un tableau avec le coefficient", dist:[v + (m - n), k * n, v * m, m / k],
      steps:`<p>Coefficient : ${f(v)} ÷ ${n} = ${f(k)}</p><p>Donc ? = ${m} × ${f(k)} = ${f(x)}</p><p class="concl">${c.r(m, x)}</p>`};
  },
  multi(){
    const c = pick(CTX), k = pick(c.ks), n = pick([2, 3, 4, 5, 6]), t = ri(2, 6), m = n * t, v = n * k, x = v * t;
    return {n:"meth", kind:"num", ans:x, unit:c.u,
      prompt:`${c.s(n, v)}. ${c.q(m)} <i>(Méthode multiplicative : par combien multiplie-t-on ${n} pour obtenir ${m} ?)</i>`,
      short:"Méthode multiplicative", dist:[v + t, v + (m - n), v * m, x / 2, v * (t + 1)],
      steps:`<p>${m} = ${n} × ${t}, donc on multiplie aussi par ${t} :</p><p>${f(v)} × ${t} = ${f(x)}</p><p class="concl">${c.r(m, x)}</p>`};
  },
  additive(){
    const c = pick(CTX), k = pick(c.ks); let a, b;
    do { a = pick(c.ns); b = pick(c.ns); } while (a === b);
    const va = a * k, vb = b * k, m = a + b, x = va + vb;
    return {n:"meth", kind:"num", ans:x, unit:c.u,
      prompt:`Ce tableau est de proportionnalité. Complète la dernière case avec la <b>méthode additive</b>.${table([[c.h1, [a, b, m]], [c.h2, [f(va), f(vb), "?"]]])}`,
      short:"Méthode additive", dist:[va * vb, vb - va, va + m, x + k, vb * 2],
      steps:`<p>${m} = ${a} + ${b}, donc on additionne les deux valeurs :</p><p>${f(va)} + ${f(vb)} = ${f(x)}</p><p class="concl">La case manquante vaut ${f(x)}.</p>`};
  },
  echelle(){
    const E = pick([100, 200, 500, 1000]), cm = pick([2, 3, 4, 5, 6, 7.5, 8, 2.5, 4.5]), reel = cm * E / 100, inv = Math.random() < .5;
    const obj = pick(["un terrain de jeu", "une maison", "un jardin", "une piscine"]);
    return inv
      ? {n:"meth", kind:"num", ans:cm, unit:" cm",
          prompt:`On dessine ${obj} à l'échelle <b>1/${E}</b>. Un côté mesure ${f(reel)} m en réalité. Combien mesure-t-il sur le dessin (en cm) ?`,
          short:`Échelle 1/${E} : du réel au dessin`, dist:[reel / E, reel * 100, reel, cm * 10],
          steps:`<p>À l'échelle 1/${E}, 1 cm sur le dessin = ${E} cm en réalité. ${f(reel)} m = ${f(reel * 100)} cm.</p><p>${f(reel * 100)} ÷ ${E} = ${f(cm)}</p><p class="concl">Sur le dessin : ${f(cm)} cm.</p>`}
      : {n:"meth", kind:"num", ans:reel, unit:" m",
          prompt:`On dessine ${obj} à l'échelle <b>1/${E}</b>. Un côté mesure ${f(cm)} cm sur le dessin. Combien mesure-t-il en réalité (en m) ?`,
          short:`Échelle 1/${E} : du dessin au réel`, dist:[cm * E, cm / E * 100, reel * 10, reel / 10],
          steps:`<p>À l'échelle 1/${E}, 1 cm sur le dessin = ${E} cm en réalité.</p><p>${f(cm)} × ${E} = ${f(cm * E)} cm = ${f(reel)} m</p><p class="concl">En réalité : ${f(reel)} m.</p>`};
  },
  croix(){
    const {c, k, n, m, v, x} = setup();
    return {n:"croix", kind:"num", ans:x, unit:c.u,
      prompt:`${c.s(n, v)}. ${c.q(m)} <i>(Utilise l'égalité des produits en croix.)</i>`,
      short:"Quatrième proportionnelle (produits en croix)", dist:[n * v / m, n * m / v, v * m, v + (m - n)],
      steps:`<p>On regroupe les données dans un tableau, et on note x la valeur cherchée :</p>${table([[c.h1, [n, m]], [c.h2, [f(v), "x"]]])}
        <p>Produits en croix : ${n} × x = ${f(v)} × ${m}</p><p>x = (${f(v)} × ${m}) ÷ ${n} = ${f(v * m)} ÷ ${n} = ${f(x)}</p><p class="concl">${c.r(m, x)}</p>`};
  },
  croixTab(){
    const a = pick([3, 4, 5, 6, 8, 12, 15, 20, 25, 30]), k = pick([0.6, 1.2, 1.5, 2.4, 0.8, 3.5, 1.6]), b = a * k;
    let cc; do { cc = pick([2, 7, 9, 10, 14, 18, 24, 35, 40, 45]); } while (cc === a);
    const x = cc * k;
    return {n:"croix", kind:"num", ans:x, unit:"",
      prompt:`Ce tableau est de proportionnalité. Calcule <b>x</b>.${table([["1re ligne", [f(a), f(cc)]], ["2e ligne", [f(b), "x"]]])}`,
      short:"Calculer x avec les produits en croix", dist:[a * cc / b, b * cc, a * b / cc, b + (cc - a)],
      steps:`<p>Produits en croix : ${f(a)} × x = ${f(b)} × ${f(cc)}</p><p>x = (${f(b)} × ${f(cc)}) ÷ ${f(a)} = ${f(b * cc)} ÷ ${f(a)} = ${f(x)}</p><p class="concl">x = ${f(x)}</p>`};
  },
  croixEq(){
    const a = ri(2, 9), k = pick([2, 3, 4, 5]), b = a * k; let cc; do { cc = ri(10, 20); } while (cc === b);
    const O = [`${a} × x = ${b} × ${cc}`, `${a} × ${b} = ${cc} × x`, `${a} × ${cc} = ${b} × x`, `${a} + x = ${b} + ${cc}`];
    return {n:"croix", kind:"choice", wide:true,
      prompt:`Le tableau est de proportionnalité. Quelle égalité est vraie ?${table([["1re ligne", [a, cc]], ["2e ligne", [b, "x"]]])}`,
      short:"Écrire l'égalité des produits en croix",
      opts:shuffle(O.map((t, i) => ({t, ok: i === 0}))), answerText:O[0],
      steps:`<p>On multiplie en diagonale : ${a} avec x, et ${b} avec ${cc}.</p><p class="concl">${a} × x = ${b} × ${cc}, donc x = ${b * cc} ÷ ${a} = ${f(b * cc / a)}.</p>`};
  },
  graphYN(){
    const t = pick(["yes", "yes", "off", "dec", "curve"]), xs = [2, 4, 6, 8];
    let pts, path, ymax, ystep, ylab, why, right;
    const k = pick([1, 1.5, 2, 2.5, 3]);
    if (t === "yes") { pts = xs.map(x => [x, x * k]); ymax = 10 * k; path = [[0, 0], [10, 10 * k]]; right = 0;
      why = "Les points sont alignés, et la droite passe par l'origine du repère : c'est une situation de proportionnalité."; }
    else if (t === "off") { const b = 2 * k; pts = xs.map(x => [x, x * k + b]); ymax = 12 * k; path = [[0, b], [10, 10 * k + b]]; right = 1;
      why = `Les points sont alignés, mais la droite ne passe pas par l'origine (pour 0, on lit ${f(b)}) : ce n'est pas une situation de proportionnalité.`; }
    else if (t === "dec") { const top = 10 * k; pts = xs.map(x => [x, top - x * k * 0.8]); ymax = 12 * k; path = [[0, top], [10, top - 8 * k]]; right = 1;
      why = `Les points sont alignés, mais la droite descend et part de ${f(top)}, pas de l'origine : ce n'est pas une situation de proportionnalité.`; }
    else { pts = xs.map(x => [x, x * x * k / 8]); ymax = 10 * k; path = [[0, 0], ...pts]; right = 2;
      why = "Les points ne sont pas alignés (ils forment une courbe) : ce n'est pas une situation de proportionnalité, même si on part de l'origine."; }
    ystep = k; ymax = Math.ceil(Math.max(ymax, ...pts.map(q => q[1]), ...path.map(q => q[1])) / k - 1e-9) * k; ylab = 2 * k;
    const O = ["Oui : les points sont alignés avec l'origine", "Non : les points sont alignés, mais pas avec l'origine", "Non : les points ne sont pas alignés"];
    return {n:"graph", kind:"choice", wide:true,
      prompt:`Ce graphique représente-t-il une situation de proportionnalité ?`,
      fig: gfig({pts, path, xmax:10, ymax, xstep:1, ystep, xlab:2, ylab, xname:"", yname:""}),
      short:"Lire un graphique : proportionnel ou pas ?",
      opts:O.map((x, i) => ({t:x, ok: i === right})), answerText:O[right],
      steps:`<p>Une situation est de proportionnalité si et seulement si les points sont alignés avec l'origine du repère.</p><p class="concl">${why}</p>`};
  },
  graphRead(){
    const c = pick([{xn:"Masse (kg)", yn:"Prix (€)", u:" €", q:x => `le prix de ${x} kg`}, {xn:"Durée (h)", yn:"Distance (km)", u:" km", q:x => `la distance parcourue en ${x} h`}, {xn:"Nombre de tickets", yn:"Prix (€)", u:" €", q:x => `le prix de ${x} tickets`}]);
    const k = pick([1.5, 2, 2.5, 3, 4, 5, 10]), x0 = pick([3, 5, 7, 1]), ans = x0 * k;
    return {n:"graph", kind:"num", ans, unit:c.u,
      prompt:`Ce graphique représente une situation de proportionnalité. Lis sur le graphique <b>${c.q(x0)}</b>.`,
      fig: gfig({path:[[0, 0], [8, 8 * k]], solid:true, xmax:8, ymax:8 * k, xstep:1, ystep:k, xlab:1, ylab:2 * k, xname:c.xn, yname:c.yn}),
      short:"Lire une valeur sur un graphique", dist:[ans + k, ans - k, x0 * 2, k],
      steps:`<p>On part de ${x0} sur l'axe horizontal, on monte jusqu'à la droite, puis on lit sur l'axe vertical.</p>
        <p>Vérification : la droite passe par (1 ; ${f(k)}), donc le coefficient est ${f(k)} et ${x0} × ${f(k)} = ${f(ans)}.</p><p class="concl">On lit ${f(ans)}${c.u}.</p>`};
  },
  vMinH(){
    const m = pick([6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54]), h = m / 60;
    return {n:"vit", kind:"num", ans:h, unit:" h",
      prompt:`Convertis <b>${m} min</b> en heure décimale.`,
      short:`${m} min en heure décimale`, dist:[m / 100, m / 10, 60 / m, h * 2],
      steps:`<p>1 h = 60 min, donc on divise par 60 :</p><p>${m} ÷ 60 = ${f(h)}</p><p class="concl">${m} min = ${f(h)} h ${m === 45 || m === 15 ? `(et pas 0,${m} h !)` : ""}</p>`};
  },
  vHMin(){
    const h = pick([0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.75, 0.8, 0.9, 1.5, 0.25]), m = Math.round(h * 60);
    return {n:"vit", kind:"num", ans:m, unit:" min",
      prompt:`Convertis <b>${f(h)} h</b> en minutes.`,
      short:`${f(h)} h en minutes`, dist:[h * 100, h * 10, m + 10, 60 / h],
      steps:`<p>1 h = 60 min, donc on multiplie par 60 :</p><p>${f(h)} × 60 = ${m}</p><p class="concl">${f(h)} h = ${m} min</p>`};
  },
  vDist(){
    const v = pick([30, 40, 45, 48, 60, 80, 90, 120]), t = pick([10, 15, 20, 30, 40, 45, 90, 150]), d = v * t / 60;
    const tt = t >= 60 ? `${Math.floor(t / 60)} h ${t % 60 ? (t % 60) + " min" : ""}`.trim() : `${t} min`;
    const who = pick(["Une moto", "Un scooter", "Une voiture", "Un car"]);
    return {n:"vit", kind:"num", ans:d, unit:" km",
      prompt:`${who} roule à la vitesse constante de ${v} km/h. Quelle distance parcourt-${who.startsWith("Une") ? "elle" : "il"} en <b>${tt}</b> ?`,
      short:"Distance à vitesse constante", dist:[v * t / 100, v * t, v + t, d * 2],
      steps:`<p>La distance est proportionnelle à la durée : ${v} km en 60 min.</p>${table([["Durée (min)", [60, t]], ["Distance (km)", [v, "x"]]])}
        <p>x = (${v} × ${t}) ÷ 60 = ${f(v * t)} ÷ 60 = ${f(d)}</p><p class="concl">En ${tt}, on parcourt ${f(d)} km.</p>`};
  },
  vTime(){
    const v = pick([30, 40, 48, 60, 90, 120, 36]), m = pick([5, 10, 15, 20, 30, 40, 45]), d = v * m / 60;
    if (!Number.isInteger(d * 2)) return GEN.vTime();
    const who = pick(["Lisa", "Aymeric", "Nora", "Hugo"]);
    return {n:"vit", kind:"num", ans:m, unit:" min",
      prompt:`${who} doit faire ${f(d)} km en scooter, à la vitesse moyenne de ${v} km/h. Combien de temps, <b>en minutes</b>, mettra-t-${who === "Lisa" || who === "Nora" ? "elle" : "il"} ?`,
      short:"Durée d'un trajet en minutes", dist:[d * 60 / 100, v / d, d * v / 60, m * 2],
      steps:`<p>${v} km en 60 min : la durée est proportionnelle à la distance.</p>${table([["Distance (km)", [v, f(d)]], ["Durée (min)", [60, "x"]]])}
        <p>x = (${f(d)} × 60) ÷ ${v} = ${f(d * 60)} ÷ ${v} = ${m}</p><p class="concl">Il faut ${m} minutes.</p>`};
  },
  vSpeed(){
    const v = pick([12, 15, 18, 20, 24, 30, 36]), m = pick([10, 15, 20, 30, 40]), d = v * m / 60;
    return {n:"vit", kind:"num", ans:v, unit:" km/h",
      prompt:`Sur son vélo, Léa parcourt ${f(d)} km en ${m} min. Quelle est sa vitesse moyenne en <b>km/h</b> ?`,
      short:"Vitesse en km/h", dist:[d * m, d / m, d * 100 / m, v * 2],
      steps:`<p>On cherche la distance parcourue en 60 min.</p>${table([["Durée (min)", [m, 60]], ["Distance (km)", [f(d), "x"]]])}
        <p>x = (${f(d)} × 60) ÷ ${m} = ${f(d * 60)} ÷ ${m} = ${v}</p><p class="concl">Sa vitesse moyenne est ${v} km/h.</p>`};
  }
};
const GBY_N = {};
Object.keys(GEN).forEach(g => { const n = GEN[g]().n; (GBY_N[n] = GBY_N[n] || []).push(g); });

/* ---------- passage au moteur ---------- */
const NOTIONS = Object.entries(NOT).map(([id, n]) => ({id, name: n.name, tag: n.name, sub: `Partie ${n.p} · ${n.d}`, group: String(n.p)}));
const UBY = Object.fromEntries(NOTIONS.map(u => [u.id, u]));

const review = e => `<span class="tag l${NOT[e.n].p}">${esc(NOT[e.n].name)}</span><span class="q">${esc(e.short)}</span><span>Réponse : <b>${esc(e.answerText || (f(e.ans) + e.unit))}</b></span>`;
const steps = e => `<div class="steps">${e.steps}</div>`;
const pcBadge = p => `<p class="label" style="color:var(--red)">À savoir par cœur</p>`;

function fromPC(p){
  return {n: p.n, notion: UBY[p.n], key: "p:" + p.id, kind: "choice", prompt: `${pcBadge(p)}${esc(p.q)}`, wide: true,
    opts: shuffle(p.o.map((t, i) => ({t, ok: i === 0}))), answerText: p.o[0], short: p.q,
    steps: `<p class="label" style="color:var(--red)">À savoir par cœur · ${esc(p.source)}</p><p class="concl">${esc(p.text)}</p>`, redo: () => fromPC(p)};
}
function fromCours(c){
  return {n: c.n, notion: UBY[c.n], key: "c:" + c.id, kind: "choice", prompt: esc(c.q), wide: true, tip: c.tip,
    opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), answerText: c.o[0], short: c.q,
    steps: `<p class="concl">${esc(c.a).replace(/\n/g, "<br>")}</p>`, redo: () => fromCours(c)};
}
function fromGen(g){
  const e = GEN[g]();
  return Object.assign(e, {notion: UBY[e.n], key: "g:" + g + ":" + e.short + ":" + (e.ans ?? e.answerText), redo: () => fromGen(g)});
}
/* texte à trous sur une phrase par cœur (contrôle) */
function trou(p){
  const blanks = [];
  const html = esc(p.trou).replace(/\[\[([^\]]+)\]\]/g, (_, alts) => { blanks.push(alts.split("|")); return `<b style="color:var(--red)">(${blanks.length})</b> ______`; });
  const shown = p.text;
  return {unit: UBY[p.n], kind: "fields", wide: true,
    prompt: `${pcBadge(p)}Complète la phrase du cours :<p style="margin-top:8px">${html}</p>`,
    fields: blanks.map((alts, i) => ({label: `Mot (${i + 1})`, lang: "fr", check: v => { const ok = wordOk(alts, v); return {ok, fix: ok ? "✓" : `→ ${alts[0]}`}; }})),
    correction: () => `<p class="label" style="margin-top:4px;color:var(--red)">À savoir par cœur · ${esc(p.source)}</p><div class="steps"><p class="concl">${esc(shown)}</p></div>`,
    review: `<span class="tag l${NOT[p.n].p}">${esc(NOT[p.n].name)}</span><span class="q">Phrase par cœur : ${esc(p.card)}</span><span><b>${esc(shown)}</b></span>`,
    redo: () => trou(p)};
}
function pickItem(pool, R, kind){
  const n = R.weighted(pool).id;
  const pcs = PAR_COEUR.filter(p => p.n === n), cs = COURS.filter(c => c.n === n), gs = GBY_N[n] || [];
  if (kind === "pc" && pcs.length) return fromPC(pick(pcs));
  if ((kind === "cours" || !gs.length) && cs.length) return fromCours(pick(cs));
  return gs.length ? fromGen(pick(gs)) : fromCours(pick(cs));
}
const asQuiz = e => ({unit: e.notion, key: e.key, prompt: e.prompt, fig: e.fig, wide: e.wide, tip: e.tip,
  opts: e.kind === "num" ? Revision.numChoices(e.ans, e.dist || [], e.unit) : e.opts,
  feedback: () => steps(e), review: review(e)});
const asControl = e => Object.assign({unit: e.notion, prompt: e.prompt, fig: e.fig, wide: e.wide, tip: e.tip, review: review(e),
  correction: () => `<p class="label" style="margin-top:4px">Correction</p>${steps(e)}`, redo: () => asControl(e.redo())},
  e.kind === "num" ? {kind: "fields", fields: [numF(e.ans, e.unit)]} : {kind: "choice", opts: e.opts});

/* ---------- rédaction ---------- */
const bougie = gfig({pts:[[1, 18], [2, 16], [3, 14], [5, 10]], path:[[0, 20], [10, 0]], xmax:10, ymax:22, xstep:1, ystep:2, xlab:1, ylab:4, xname:"Temps (h)", yname:"Hauteur (cm)"});
const REDAC = [
  {id:"taxi", unit:"tab", titre:"Le prix du taxi",
   doc:`<p>Un taxi affiche ses prix :</p>${table([["Distance (km)", [2, 5, 10]], ["Prix (€)", [9, 15, 25]]])}`,
   consigne:"Le prix est-il <b>proportionnel</b> à la distance parcourue ? <b>Justifie</b> en t'appuyant sur des calculs.",
   modele:"Je calcule séparément les quotients prix ÷ distance : 9 ÷ 2 = 4,5 ; 15 ÷ 5 = 3 ; 25 ÷ 10 = 2,5. Lorsque l'on applique la formule, si tous les résultats ne sont pas égaux, alors le tableau n'est pas de proportionnalité. Ici les quotients ne sont pas égaux, donc le prix n'est pas proportionnel à la distance.",
   criteres:[{t:"Calcule les quotients prix ÷ distance pour chaque colonne (4,5 ; 3 ; 2,5)", pts:2}, {t:"Remarque que les quotients ne sont pas tous égaux", pts:1}, {t:"Conclut que le prix n'est pas proportionnel à la distance", pts:1}]},
  {id:"bougie", unit:"graph", titre:"La bougie qui fond",
   doc:`<p>On allume une bougie et on mesure sa hauteur toutes les heures. Les points relevés sont alignés sur une droite qui part de 20 cm (au moment où on l'allume) et qui descend.</p>${bougie}`,
   consigne:"La hauteur de la bougie est-elle <b>proportionnelle</b> au temps ? <b>Justifie</b> avec la propriété du cours sur les graphiques.",
   modele:"Les points du graphique sont alignés, mais la droite ne passe pas par l'origine du repère : au départ (0 h), la bougie mesure déjà 20 cm. Or si une situation est une situation de proportionnalité, alors les points de sa représentation graphique sont alignés avec l'origine du repère. Donc la hauteur de la bougie n'est pas proportionnelle au temps.",
   criteres:[{t:"Dit que les points sont alignés", pts:1}, {t:"Remarque que la droite ne passe pas par l'origine (à 0 h, la bougie mesure 20 cm)", pts:1}, {t:"Cite la propriété : proportionnalité ⇔ points alignés avec l'origine du repère", pts:1}, {t:"Conclut que la hauteur n'est pas proportionnelle au temps", pts:1}]},
  {id:"jus", unit:"croix", titre:"Le jus de pommes",
   doc:`<p>Au verger, avec <b>25 kg</b> de pommes, on obtient <b>15 L</b> de jus. La quantité de jus est proportionnelle à la masse de pommes.</p>`,
   consigne:"Quel volume de jus obtient-on avec <b>40 kg</b> de pommes ? Regroupe les données dans un <b>tableau</b>, utilise l'<b>égalité des produits en croix</b> et termine par une phrase réponse.",
   modele:"Je regroupe les données dans un tableau : masse de pommes 25 kg et 40 kg ; volume de jus 15 L et x. Comme le tableau est un tableau de proportionnalité, les produits en croix sont égaux : 25 × x = 15 × 40, donc x = (15 × 40) ÷ 25 = 600 ÷ 25 = 24. Avec 40 kg de pommes, on obtient 24 L de jus.",
   criteres:[{t:"Regroupe les données dans un tableau (25 et 40 ; 15 et x)", pts:1}, {t:"Écrit l'égalité des produits en croix : 25 × x = 15 × 40", pts:1}, {t:"Calcule x = 600 ÷ 25 = 24", pts:1}, {t:"Conclut par une phrase : on obtient 24 L de jus", pts:1}]}
];

Revision.start({
  key: "leandre-maths-proportionnalite-v1",
  title: "La proportionnalité",
  subtitle: "Maths",
  eyebrow: "Maths · Chapitre 10",
  hand: "Tableaux, produits en croix, graphiques",
  countdown: {date: "2026-11-03", label: "mardi 3 novembre"},
  redaction: {text: "Des questions « Justifie » comme au contrôle : écris des phrases complètes et pose tes calculs.",
    items: REDAC.map(r => ({id: r.id, unit: r.unit, titre: r.titre, doc: r.doc, consigne: r.consigne, modele: r.modele, criteres: r.criteres}))},
  groups: {
    "1": {name: "Reconnaître", cls: "l1", filter: "Partie I · Reconnaître"},
    "2": {name: "Résoudre", cls: "l2", filter: "Parties II et IV · Résoudre"},
    "3": {name: "Graphique et vitesse", cls: "l3", filter: "Partie III · Graphique"}
  },
  units: NOTIONS,
  allLabel: () => "Tout le chapitre",
  mastery: {max: MAXM, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["pour commencer", "Les phrases à savoir par cœur d'abord, puis les méthodes."],
    quiz: ["10 questions", "Cours et exercices, la bonne réponse parmi plusieurs."],
    control: ["noté sur 20", "Tu complètes les phrases du cours et tu calcules toi-même."]
  },
  footnote: "Les exercices changent de nombres à chaque fois.",
  cards: pool => {
    const ids = pool.map(u => u.id);
    const pc = PAR_COEUR.filter(p => ids.includes(p.n)).map(p => ({unit: UBY[p.n],
      front: `<div class="fbody"><span class="card-q">${esc(p.card)}</span><span class="hint">À savoir par cœur · touche la carte</span></div>`,
      back: `<div class="fbody left"><span class="card-a">${esc(p.text)}</span><span class="tip">À savoir par cœur · ${esc(p.source)}</span></div>`}));
    const cs = COURS.filter(c => ids.includes(c.n)).map(c => ({unit: UBY[c.n],
      front: `<div class="fbody"><span class="card-q">${esc(c.card)}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
      back: `<div class="fbody left"><span class="card-a">${esc(c.a)}</span>${c.tip ? `<span class="tip">${esc(c.tip)}</span>` : ""}</div>`}));
    return [...pc, ...cs];
  },
  quiz: {count: 10, make: (pool, R, i) => asQuiz(pickItem(pool, R, [0, 3, 6, 8].includes(i) ? "pc" : i === 5 ? "cours" : "gen"))},
  control: {
    lead: "Des phrases du cours à compléter, puis des exercices. Pour les calculs, écris ton résultat (virgule ou point, comme tu veux).",
    note: "Après chaque réponse, tu vois la correction rédigée, comme au tableau. Garde un brouillon à côté pour poser tes calculs.",
    size: () => 12,
    build: pool => {
      const ids = pool.map(u => u.id);
      const pcs = shuffle(PAR_COEUR.filter(p => ids.includes(p.n)));
      const items = [];
      pcs.slice(0, 3).forEach(p => items.push(trou(p)));
      if (pcs[3]) items.push(asControl(fromPC(pcs[3])));
      const cs = shuffle(COURS.filter(c => ids.includes(c.n))).slice(0, 1).map(fromCours).map(asControl);
      items.push(...cs);
      const gp = ids.flatMap(n => GBY_N[n] || []), order = shuffle(gp);
      while (items.length < 12 && gp.length) items.push(asControl(fromGen(order.length ? order.pop() : pick(gp))));
      while (items.length < 12) items.push(asControl(fromCours(pick(COURS.filter(c => ids.includes(c.n))))));
      return items.slice(0, 3).concat(shuffle(items.slice(3)));
    }
  }
});
})();
