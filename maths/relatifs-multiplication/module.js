/* Module : maths · multiplication et division des nombres relatifs (4e), chapitre N2.
   Sources (photos du 11/11/2026) :
   - cahier manuscrit « N2 : Multiplier et diviser les nombres relatifs » : rappel sur les trois statuts du signe « − »,
     la multiplication des relatifs « prolonge » celle des nombres positifs et garde ses propriétés (commutative et
     associative en rouge, produit par zéro, distributivité) ;
   - polycopié collé : I) règle des signes du produit, propriété du nombre de facteurs négatifs, exemples ;
     II) règle des signes du quotient, exemples en fractions (−4/−5 = 4/5, 2/−3 = −2/3, −2 × (−5)/−9 = −10/9).
   Les phrases « par cœur » sont celles du polycopié (encadrés) et du cahier (mots en rouge), mot pour mot.
   Corrigé par rapport au cahier : « on peut changer l'ordre des facteurs SANS changer la valeur du produit » (le « sans »
   manque), et « regrouper les FACTEURS » (le cahier écrit « les termes », qui désigne les nombres d'une somme).
   Les nombres restent petits (tables jusqu'à 10) : l'enjeu est le signe, pas la multiplication.
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";

const {esc, pick, shuffle, fold} = Revision;
const ri = Revision.randInt;

/* ---------- notions ---------- */
const NOT = {
  prop:   {p:1, name:"Propriétés", d:"Commutative, associative, distributivité"},
  deux:   {p:1, name:"Produit de deux nombres", d:"Même signe ou signes contraires"},
  plus:   {p:1, name:"3 ou 4 facteurs", d:"Compter les facteurs négatifs"},
  zero:   {p:1, name:"Zéro et −1", d:"Produit par zéro, multiplier par −1"},
  quot:   {p:2, name:"Quotient", d:"Règle des signes, fractions"},
  manq:   {p:2, name:"Nombre manquant", d:"Retrouver le facteur ou le dividende"},
  statut: {p:3, name:"Le signe −", d:"Soustraction, signe ou opposé"},
  piege:  {p:3, name:"× ou + ?", d:"Ne pas confondre avec l'addition"}
};
const MAXM = 5;

/* ---------- écriture des nombres relatifs ---------- */
const MINUS = "−";
const sn = x => x < 0 ? MINUS + (-x) : String(x);                    // −12, 12
const fac = (x, plus) => x < 0 ? `(${MINUS}${-x})` : (plus ? `(+${x})` : String(x));  // facteur dans un produit
const prodTxt = (fs, plus) => fs.map((x, i) => fac(x, plus && i > 0 ? true : plus && Math.random() < .5)).join(" × ");
const sgn = () => Math.random() < .5 ? -1 : 1;
/* l'enjeu est le signe : presque toujours au moins un nombre négatif */
const allPos = xs => xs.every(x => x >= 0) && Math.random() < .9;
const nNeg = fs => fs.filter(x => x < 0).length;
const prod = fs => fs.reduce((a, b) => a * b, 1);
const absProd = fs => fs.map(Math.abs).reduce((a, b) => a * b, 1);
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
/* quotient écrit en fraction (HTML) */
const fracH = (n, d) => `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 3px;line-height:1.15"><span style="padding:0 4px;border-bottom:1.6px solid currentColor">${n}</span><span style="padding:0 4px">${d}</span></span>`;
const frac = (a, b) => fracH(sn(a), sn(b));
const fracS = (n, d) => `${n < 0 ? MINUS : ""}${frac(Math.abs(n), d)}`;             // signe devant la fraction
const fracTxt = (a, b) => `${sn(a)}/${b < 0 ? "(" + sn(b) + ")" : b}`;
const ftxt = (n, d) => `${n < 0 ? MINUS : ""}${Math.abs(n)}/${d}`;                   // −10/9

/* ---------- le « par cœur » : phrases du polycopié (encadrés) et du cahier (mots en rouge) ---------- */
const PAR_COEUR = [
  {id:"pc-statut", n:"statut", source:"Cahier · Rappel",
   card:"En maths, que peut désigner le signe « − » ? (3 réponses)",
   q:"En mathématiques, le signe « − » a plusieurs statuts. Il peut désigner…",
   text:"En mathématiques, le signe « − » a plusieurs statuts. Il peut désigner : une soustraction, le signe d'un nombre relatif, l'opposé d'un nombre relatif.",
   o:["une soustraction, le signe d'un nombre relatif, l'opposé d'un nombre relatif",
      "une soustraction, le signe d'un nombre relatif, l'inverse d'un nombre relatif",
      "une addition, le signe d'un nombre relatif, l'opposé d'un nombre relatif",
      "une soustraction, une division, l'opposé d'un nombre relatif"],
   trou:"Le signe « − » peut désigner : une [[soustraction]], le [[signe]] d'un nombre relatif, l'[[opposé|oppose]] d'un nombre relatif."},
  {id:"pc-comm", n:"prop", source:"Cahier · Propriétés",
   card:"Que veut dire : « la multiplication est commutative » ?",
   q:"La multiplication est commutative : cela veut dire que…",
   text:"La multiplication est commutative : on peut changer l'ordre des facteurs sans changer la valeur du produit.",
   o:["on peut changer l'ordre des facteurs sans changer la valeur du produit",
      "on peut changer le signe des facteurs sans changer la valeur du produit",
      "on peut changer l'ordre des facteurs, mais le produit change de signe",
      "on peut changer l'ordre des facteurs seulement s'ils sont positifs"],
   trou:"La multiplication est [[commutative|commutatif|commutativite]] : on peut changer l'[[ordre]] des facteurs sans changer la valeur du produit."},
  {id:"pc-assoc", n:"prop", source:"Cahier · Propriétés",
   card:"Que veut dire : « la multiplication est associative » ?",
   q:"La multiplication est associative : cela veut dire que…",
   text:"La multiplication est associative : on peut regrouper les facteurs dans l'ordre que l'on veut dans un produit.",
   o:["on peut regrouper les facteurs dans l'ordre que l'on veut dans un produit",
      "on peut regrouper les facteurs seulement s'ils sont tous positifs",
      "on peut regrouper les facteurs négatifs pour les additionner",
      "on doit toujours calculer un produit de gauche à droite"],
   trou:"La multiplication est [[associative|associatif|associativite]] : on peut [[regrouper|grouper]] les facteurs dans l'ordre que l'on veut dans un produit."},
  {id:"pc-zero", n:"zero", source:"Cahier · Propriétés",
   card:"Que vaut un produit dont l'un des facteurs est égal à 0 ?",
   q:"Le produit d'un relatif par zéro…",
   text:"Le produit d'un relatif par zéro est égal à zéro.",
   o:["est égal à zéro","est égal à ce relatif","est égal à l'opposé de ce relatif","est impossible à calculer"],
   trou:"Le produit d'un relatif par [[zéro|0|zero]] est égal à [[zéro|0|zero|nul]]."},
  {id:"pc-distrib", n:"prop", source:"Cahier · Propriétés",
   card:"La distributivité de la multiplication marche-t-elle encore avec les nombres relatifs ?",
   q:"Les propriétés de distributivité de la multiplication par rapport à l'addition et à la soustraction…",
   text:"Les propriétés de distributivité de la multiplication par rapport à l'addition et à la soustraction sont conservées avec les nombres relatifs.",
   o:["sont conservées avec les nombres relatifs",
      "ne sont plus vraies avec les nombres relatifs",
      "sont conservées pour l'addition seulement",
      "sont conservées pour les positifs seulement"],
   trou:"Les propriétés de [[distributivité|distributivite|distributive]] de la multiplication par rapport à l'[[addition]] et à la [[soustraction]] sont conservées avec les nombres relatifs."},
  {id:"pc-meme", n:"deux", source:"Polycopié · Règle des signes (produit)",
   card:"Quel est le signe du produit de deux nombres relatifs de même signe ?",
   q:"Complète la règle des signes : le produit de deux nombres de même signe…",
   text:"Le produit de deux nombres de même signe est positif.",
   o:["est positif","est négatif","est nul","a le signe du plus grand"],
   trou:"Le produit de deux nombres de [[même signe|meme signe]] est [[positif|positive|+]]."},
  {id:"pc-contraire", n:"deux", source:"Polycopié · Règle des signes (produit)",
   card:"Quel est le signe du produit de deux nombres relatifs de signes contraires ?",
   q:"Complète la règle des signes : le produit de deux nombres de signes contraires…",
   text:"Le produit de deux nombres de signes contraires est négatif.",
   o:["est négatif","est positif","est nul","a le signe du plus grand"],
   trou:"Le produit de deux nombres de signes [[contraires|differents|opposes]] est [[négatif|negative|-|moins]]."},
  {id:"pc-pair", n:"plus", source:"Polycopié · Propriété",
   card:"Un produit de nombres relatifs non nuls contient un nombre PAIR de facteurs négatifs. Quel est son signe ?",
   q:"Complète la propriété : un produit de facteurs est positif si…",
   text:"Un produit de facteurs est positif si le nombre de facteurs négatifs est pair.",
   o:["le nombre de facteurs négatifs est pair","le nombre de facteurs négatifs est impair",
      "le nombre de facteurs positifs est pair","le nombre total de facteurs est pair"],
   trou:"Un produit de facteurs est [[positif|positive|+]] si le nombre de facteurs négatifs est [[pair|paire]]."},
  {id:"pc-impair", n:"plus", source:"Polycopié · Propriété",
   card:"Un produit de nombres relatifs non nuls contient un nombre IMPAIR de facteurs négatifs. Quel est son signe ?",
   q:"Complète la propriété : un produit de facteurs est négatif si…",
   text:"Un produit de facteurs est négatif si le nombre de facteurs négatifs est impair.",
   o:["le nombre de facteurs négatifs est impair","le nombre de facteurs négatifs est pair",
      "le nombre de facteurs positifs est impair","le nombre total de facteurs est impair"],
   trou:"Un produit de facteurs est [[négatif|negative|-|moins]] si le nombre de facteurs négatifs est [[impair|impaire]]."},
  {id:"pc-qmeme", n:"quot", source:"Polycopié · Règle des signes (quotient)",
   card:"Quel est le signe du quotient de deux nombres relatifs de même signe ?",
   q:"Complète la règle des signes : le quotient de deux nombres de même signe…",
   text:"Le quotient de deux nombres de même signe est positif.",
   o:["est positif","est négatif","est nul","a le signe du plus grand"],
   trou:"Le quotient de deux nombres de [[même signe|meme signe]] est [[positif|positive|+]]."},
  {id:"pc-qcontraire", n:"quot", source:"Polycopié · Règle des signes (quotient)",
   card:"Quel est le signe du quotient de deux nombres relatifs de signes contraires ?",
   q:"Complète la règle des signes : le quotient de deux nombres de signes contraires…",
   text:"Le quotient de deux nombres de signes contraires est négatif.",
   o:["est négatif","est positif","est nul","a le signe du plus grand"],
   trou:"Le quotient de deux nombres de signes [[contraires|differents|opposes]] est [[négatif|negative|-|moins]]."}
];

/* ---------- questions de cours ---------- */
/* card : recto ; q : énoncé du quiz ; a : verso ; o : bonne réponse puis les pièges.
   cardH / qH / aH : mêmes rôles, en HTML (fractions). oldPC : carte qui était « par cœur » (on garde sa progression). */
const COURS = [
  {id:"prolong", n:"prop", card:"La multiplication des nombres relatifs garde-t-elle les propriétés de la multiplication des nombres positifs ?",
   q:"La multiplication des nombres relatifs, par rapport à celle des nombres positifs…",
   a:"Oui : c'est un « prolongement » de la multiplication des nombres non relatifs.\nElle reste commutative et associative, le produit par zéro vaut zéro, et la distributivité marche toujours.",
   o:["garde toutes ses propriétés","n'est plus commutative","n'a plus un produit nul par zéro","n'est plus distributive"]},
  {id:"vcomm", n:"prop", card:"Comment s'appelle la propriété : « on peut changer l'ordre des facteurs sans changer la valeur du produit » ?",
   q:"« On peut changer l'ordre des facteurs sans changer la valeur du produit » : cela veut dire que la multiplication est…",
   a:"La multiplication est commutative.", o:["commutative","associative","distributive","relative"]},
  {id:"vassoc", n:"prop", card:"Comment s'appelle la propriété : « on peut regrouper les facteurs dans l'ordre que l'on veut dans un produit » ?",
   q:"« On peut regrouper les facteurs dans l'ordre que l'on veut dans un produit » : cela veut dire que la multiplication est…",
   a:"La multiplication est associative.", o:["associative","commutative","distributive","relative"]},
  {id:"astex", n:"prop", card:"Comment calcules-tu astucieusement (−25) × 7 × (−4) ?",
   q:"(−25) × 7 × (−4) = …",
   a:"La multiplication est commutative et associative : je regroupe (−25) × (−4) = 100.\nPuis 100 × 7 = 700.",
   o:["700","−700","70","−70"]},
  {id:"dex", n:"prop", card:"Calcule (−2) × (10 + 3) en utilisant la distributivité.",
   q:"Avec la distributivité : (−2) × (10 + 3) = (−2) × 10 + (−2) × 3 = …",
   a:"(−2) × (10 + 3) = (−2) × 10 + (−2) × 3\n= −20 + (−6)\n= −26",
   o:["−26","26","−23","−14"]},
  {id:"facteur", n:"deux", card:"Dans 3 × (−5) = −15, comment s'appellent 3 et −5 ?",
   q:"Dans 3 × (−5) = −15, les nombres 3 et −5 s'appellent…",
   a:"Les facteurs.\n−15 est le produit.", o:["les facteurs","les produits","les termes","les quotients"]},
  {id:"produit", n:"deux", card:"Comment s'appelle le résultat d'une multiplication ?",
   q:"Le résultat d'une multiplication s'appelle…",
   a:"Le produit.", o:["le produit","la somme","le quotient","la différence"]},
  {id:"distance", n:"deux", card:"Quelle est la distance à zéro de −7 ?",
   q:"La distance à zéro de −7 est…",
   a:"7 : c'est le nombre sans son signe.", o:["7","−7","0","14"]},
  {id:"methode", n:"deux", oldPC:true, card:"Comment calcule-t-on le produit de deux nombres relatifs ?",
   q:"Pour calculer le produit de deux nombres relatifs, on…",
   a:"1. On trouve le signe du produit avec la règle des signes.\n2. On multiplie les distances à zéro.\nExemple : (−4) × (+2) → signes contraires, négatif ; 4 × 2 = 8 ; donc −8.",
   o:["trouve le signe avec la règle des signes, puis on multiplie les distances à zéro",
      "trouve le signe avec la règle des signes, puis on additionne les distances à zéro",
      "multiplie les distances à zéro, puis on garde le signe du premier nombre",
      "multiplie les distances à zéro, puis on garde le signe du plus grand nombre"]},
  {id:"mm", n:"deux", card:"Combien font (−6) × (−4) ?",
   q:"(−6) × (−4) = …",
   a:"24.\nMême signe → positif ; 6 × 4 = 24.", o:["24","−24","−10","10"]},
  {id:"mp", n:"deux", card:"Combien font (−7) × 3 ?",
   q:"(−7) × 3 = …",
   a:"−21.\nSignes contraires → négatif ; 7 × 3 = 21.", o:["−21","21","−4","−10"]},
  {id:"pm", n:"deux", card:"Combien font 8 × (−5) ?",
   q:"8 × (−5) = …",
   a:"−40.\nSignes contraires → négatif ; 8 × 5 = 40.", o:["−40","40","3","−3"]},
  {id:"carre", n:"deux", card:"Le produit d'un nombre relatif non nul par lui-même peut-il être négatif ?",
   q:"Le produit d'un nombre relatif non nul par lui-même est toujours…",
   a:"Non : il est toujours positif, car les deux facteurs ont le même signe.\nExemple : (−5) × (−5) = 25.",
   o:["positif","négatif","négatif si le nombre est négatif","égal à 1"]},
  {id:"compter", n:"plus", card:"Pour trouver le signe d'un produit de plusieurs facteurs, que comptes-tu ?",
   q:"Pour trouver le signe d'un produit de plusieurs facteurs, on compte…",
   a:"Le nombre de facteurs négatifs.\nPair → positif ; impair → négatif.",
   o:["le nombre de facteurs négatifs","le nombre de facteurs positifs","le nombre total de facteurs","les distances à zéro"]},
  {id:"poly1", n:"plus", card:"Combien font 3 × (−2) × 4 × 2 ?",
   q:"3 × (−2) × 4 × 2 = …",
   a:"−48.\n1 facteur négatif, 1 est impair → négatif ; 3 × 2 × 4 × 2 = 48.", o:["−48","48","−7","7"]},
  {id:"poly4", n:"plus", card:"Combien font (−3) × (−2) × (−4) × (−2) ?",
   q:"(−3) × (−2) × (−4) × (−2) = …",
   a:"48.\n4 facteurs négatifs, 4 est pair → positif ; 3 × 2 × 4 × 2 = 48.", o:["48","−48","−11","11"]},
  {id:"ex3", n:"plus", card:"Sans calculer, quel est le signe de (−2) × (−3) × (−1) ?",
   q:"Sans calculer, (−2) × (−3) × (−1) est…",
   a:"Négatif : il y a 3 facteurs négatifs, 3 est impair.\nLe produit vaut −6.",
   o:["négatif","positif","nul","on ne peut pas savoir sans calculer"]},
  {id:"ex4", n:"plus", card:"Combien font (−1) × (−1) × (−1) × (−1) ?",
   q:"(−1) × (−1) × (−1) × (−1) = …",
   a:"1.\n4 facteurs négatifs, 4 est pair → positif ; 1 × 1 × 1 × 1 = 1.", o:["1","−1","−4","4"]},
  {id:"methN", n:"plus", card:"Comment calcules-tu (−2) × 5 × (−3) × (−1) ?",
   q:"Pour calculer (−2) × 5 × (−3) × (−1), la première étape est…",
   a:"1. Je compte les facteurs négatifs : 3, c'est impair, donc le produit est négatif.\n2. Je multiplie les distances à zéro : 2 × 5 × 3 × 1 = 30.\nRésultat : −30.",
   o:["compter les facteurs négatifs pour trouver le signe","additionner tous les nombres","multiplier seulement les nombres négatifs","garder le signe du premier facteur"]},
  {id:"cube", n:"plus", card:"a est un nombre négatif. Quel est le signe de a × a × a ?",
   q:"a est un nombre négatif. Le produit a × a × a est…",
   a:"Négatif : 3 facteurs négatifs, 3 est impair.", o:["négatif","positif","nul","on ne peut pas savoir"]},
  {id:"z0", n:"zero", card:"Quel est le résultat de (−3) × 0 × (−8) × 5 ?",
   q:"(−3) × 0 × (−8) × 5 = …",
   a:"0 : le produit d'un relatif par zéro est égal à zéro. Pas besoin de compter les signes !",
   o:["0","120","−120","−6"]},
  {id:"moins1", n:"zero", card:"Que se passe-t-il quand on multiplie un nombre par (−1) ?",
   q:"Multiplier un nombre par (−1) revient à…",
   a:"On obtient son opposé.\nExemples : (−1) × 7 = −7 ; (−1) × (−4) = 4.",
   o:["prendre son opposé","ne rien changer","le rendre toujours négatif","le rendre nul"]},
  {id:"fois1", n:"zero", card:"Combien font (−9) × 1 ?",
   q:"(−9) × 1 = …",
   a:"−9 : multiplier par 1 ne change pas le nombre.", o:["−9","9","−10","1"]},
  {id:"quotient", n:"quot", card:"Comment s'appelle le résultat d'une division ?",
   q:"Le résultat d'une division s'appelle…",
   a:"Le quotient.", o:["le quotient","le produit","le facteur","la somme"]},
  {id:"regleQ", n:"quot", oldPC:true, card:"Quelle règle des signes utilise-t-on pour diviser deux nombres relatifs ?",
   q:"Pour diviser deux nombres relatifs, on applique…",
   a:"La même règle des signes que pour le produit :\nmême signe → positif ; signes contraires → négatif.",
   o:["la même règle des signes que pour le produit","la même règle des signes que pour l'addition","le signe du nombre qui a la plus grande distance à zéro","toujours le signe du premier nombre"]},
  {id:"div0", n:"quot", oldPC:true, card:"Peut-on diviser un nombre par 0 ?",
   q:"Diviser un nombre par 0…",
   a:"Non : on ne peut pas diviser par zéro.",
   o:["est impossible : on ne peut pas diviser par zéro","donne toujours 0","donne toujours 1","donne le nombre lui-même"]},
  {id:"d1", n:"quot", card:"Combien font (−24) ÷ (−6) ?",
   q:"(−24) ÷ (−6) = …",
   a:"4.\nMême signe → positif ; 24 ÷ 6 = 4.", o:["4","−4","−18","18"]},
  {id:"d2", n:"quot", card:"Combien font 35 ÷ (−7) ?",
   q:"35 ÷ (−7) = …",
   a:"−5.\nSignes contraires → négatif ; 35 ÷ 7 = 5.", o:["−5","5","28","−28"]},
  {id:"fq1", n:"quot", cardH:`Comment écrit-on ${frac(-4, -5)} plus simplement ?`, qH:`${frac(-4, -5)} = …`,
   aH:`${frac(4, 5)}\nLe numérateur et le dénominateur ont le même signe : le quotient est positif.`,
   o:["4/5","−4/5","5/4","−5/4"]},
  {id:"fq2", n:"quot", cardH:`Comment écrit-on ${frac(2, -3)} avec le signe devant la fraction ?`, qH:`${frac(2, -3)} = …`,
   aH:`${MINUS}${frac(2, 3)}\nSignes contraires : le quotient est négatif, on écrit le signe devant la fraction.`,
   o:["−2/3","2/3","−3/2","3/2"]},
  {id:"fq3", n:"quot", cardH:`Combien vaut ${fracH(`${MINUS}2 × (${MINUS}5)`, `${MINUS}9`)} ?`, qH:`${fracH(`${MINUS}2 × (${MINUS}5)`, `${MINUS}9`)} = …`,
   aH:`${MINUS}${frac(10, 9)}\nNumérateur : (−2) × (−5) = 10 (même signe → positif).\nPuis ${frac(10, -9)} : signes contraires → négatif.`,
   o:["−10/9","10/9","−9/10","9/10"]},
  {id:"ecr", n:"quot", card:"Les nombres −15/3 et 15/(−3) sont-ils égaux ?",
   q:"Les nombres −15/3 et 15/(−3)…",
   a:"Oui : les deux valent −5 (signes contraires → négatif).",
   o:["sont égaux : ils valent tous les deux −5","sont opposés : −5 et 5","sont égaux : ils valent tous les deux 5","ne sont pas des nombres"]},
  {id:"ecr2", n:"quot", card:"Que vaut −18/(−3) ?",
   q:"−18/(−3) = …",
   a:"6 : le numérateur et le dénominateur ont le même signe, donc le quotient est positif.",
   o:["6","−6","−15","15"]},
  {id:"st1", n:"statut", card:"Dans 9 − 4, que désigne le signe « − » ?",
   q:"Dans 9 − 4, le signe « − » désigne…",
   a:"Une soustraction : on enlève 4 à 9.\n9 − 4 = 5.",
   o:["une soustraction","le signe d'un nombre relatif","l'opposé d'un nombre relatif"]},
  {id:"st2", n:"statut", card:"Dans (−6) × 2, que désigne le signe « − » de −6 ?",
   q:"Dans (−6) × 2, le signe « − » de −6 désigne…",
   a:"Le signe du nombre relatif −6 : c'est un nombre négatif.",
   o:["le signe d'un nombre relatif","une soustraction","l'opposé d'un nombre relatif"]},
  {id:"st3", n:"statut", card:"Dans −(−3), que désigne le premier signe « − » ?",
   q:"Dans −(−3), le premier signe « − » désigne…",
   a:"L'opposé : −(−3) est l'opposé de −3.\n−(−3) = 3.",
   o:["l'opposé d'un nombre relatif","une soustraction","le signe d'un nombre relatif"]},
  {id:"vfAdd", n:"piege", card:"« Moins par moins donne plus » : est-ce vrai pour l'addition ?",
   q:"La règle « moins par moins donne plus » est valable…",
   a:"Non ! Seulement pour la multiplication et la division.\nPour l'addition : (−3) + (−5) = −8.",
   o:["pour la multiplication et la division seulement","pour toutes les opérations","pour l'addition seulement","pour l'addition et la soustraction"]},
  {id:"add", n:"piege", card:"Combien font (−3) + (−5) ? Et (−3) × (−5) ?",
   q:"(−3) + (−5) = …",
   a:"(−3) + (−5) = −8 (on additionne deux nombres négatifs : le résultat est négatif).\n(−3) × (−5) = 15 (même signe → positif).",
   o:["−8","8","15","−15"]},
  {id:"addmul", n:"piege", card:"Combien font (−7) + 3 ? Et (−7) × 3 ?",
   q:"(−7) × 3 = …",
   a:"(−7) + 3 = −4.\n(−7) × 3 = −21.", o:["−21","−4","21","4"]}
];

/* saisie : −12, -12, – 12, +12, (−12) */
function parseRel(v){
  let s = String(v).trim().replace(/[−–—‒]/g, "-").replace(/\s+/g, "").replace(/^\((.*)\)$/, "$1").replace(/^\+/, "");
  if (!/^-?\d+([.,]\d+)?$/.test(s)) return NaN;
  return Revision.parseNum(s);
}
function relField(ans, label){
  return {id:"n", label: label || "Ta réponse", inputmode:"text", check: v => {
    const x = parseRel(v);
    if (isNaN(x)) return {ok:false, fix:`Écris un nombre (avec son signe). → ${sn(ans)}`};
    if (Math.abs(x - ans) < 1e-9) return {ok:true, fix:"✓"};
    if (ans !== 0 && Math.abs(x + ans) < 1e-9) return {ok:false, fix:`Attention au signe ! → ${sn(ans)}`};
    return {ok:false, fix:`→ ${sn(ans)}`};
  }};
}
/* saisie d'une fraction : −10/9, -10/9, - 10 / 9, −(10/9), (−10)/9 ; 10/(−9) est refusé (signe devant la fraction) */
function parseFrac(v){
  let s = String(v).trim().replace(/[−–—‒]/g, "-").replace(/[÷:]/g, "/").replace(/\s+/g, "");
  let k = 1;
  const m0 = s.match(/^([+-])\((.+)\)$/);
  if (m0) { k = m0[1] === "-" ? -1 : 1; s = m0[2]; }
  const m = s.match(/^([+-]?)\(?([+-]?\d+)\)?\/\(?([+-]?\d+)\)?$/);
  if (!m) return null;
  const n = k * (m[1] === "-" ? -1 : 1) * parseInt(m[2], 10), d = parseInt(m[3], 10);
  return d === 0 ? null : {n, d};
}
function fracField(n, d){
  const want = ftxt(n, d);
  return {id:"f", label:"Ta fraction", inputmode:"text", check: v => {
    const f = parseFrac(v);
    if (!f) return {ok:false, fix:`Écris une fraction, par exemple −2/3. → ${want}`};
    const same = f.n * d === n * f.d, opp = f.n * d === -n * f.d;
    if (same && f.d > 0) return {ok:true, fix:"✓"};
    if (same) return {ok:false, fix:`C'est la bonne valeur, mais on écrit le signe devant la fraction. → ${want}`};
    if (opp) return {ok:false, fix:`Attention au signe ! → ${want}`};
    return {ok:false, fix:`→ ${want}`};
  }};
}
/* QCM numériques : la bonne réponse, son opposé, puis les pièges */
function relChoices(ans, traps){
  const seen = new Set([ans]), out = [{t: sn(ans), ok: true}];
  const add = v => { if (Number.isInteger(v) && !seen.has(v) && out.length < 4) { seen.add(v); out.push({t: sn(v), ok: false}); } };
  if (ans !== 0) add(-ans);
  shuffle(traps).forEach(add);
  let d = 1;
  while (out.length < 4) { add(ans + d); add(-(ans + d)); d++; }
  return shuffle(out);
}
/* QCM de fractions : la bonne, son opposée, l'inverse et son opposé (|n| ≥ 2 et n, d premiers entre eux) */
const fracChoices = (n, d) => shuffle([{t: ftxt(n, d), ok: true}, {t: ftxt(-n, d), ok: false},
  {t: ftxt(Math.sign(n) * d, Math.abs(n)), ok: false}, {t: ftxt(-Math.sign(n) * d, Math.abs(n)), ok: false}]);
const SIGN_OPTS = (ans, withZero) => {
  const o = [{t:"positif", ok: ans > 0}, {t:"négatif", ok: ans < 0}];
  if (withZero) o.push({t:"nul (égal à 0)", ok: ans === 0});
  return o;
};
const signWord = x => x > 0 ? "positif" : x < 0 ? "négatif" : "nul";
const parite = k => k % 2 === 0 ? "pair" : "impair";
/* facteurs : distances à zéro de 1 à 10, avec un produit qui reste raisonnable */
const d1 = maxAbs => Math.random() < .12 ? 1 : ri(2, maxAbs);   // le 1 reste rare
function factors(n, maxAbs, maxProd){
  let fs;
  do { fs = Array.from({length: n}, () => sgn() * d1(maxAbs)); } while (absProd(fs) > maxProd || fs.filter(x => Math.abs(x) === 1).length > 1 || allPos(fs));
  return fs;
}
const negCountTxt = fs => { const k = nNeg(fs); return k === 0 ? "aucun facteur négatif (0, c'est pair)" : `${k} facteur${k > 1 ? "s" : ""} négatif${k > 1 ? "s" : ""}`; };
const stepsSign = fs => {
  const k = nNeg(fs), p = prod(fs);
  if (fs.length === 2) return `<p>1. Signe : ${fs[0] < 0 === fs[1] < 0 ? "les deux facteurs ont le même signe, donc le produit est <b>positif</b>" : "les facteurs sont de signes contraires, donc le produit est <b>négatif</b>"}.</p>`;
  return `<p>1. Signe : je compte les facteurs négatifs : ${negCountTxt(fs)}. ${k ? `${k} est ${parite(k)}` : "C'est pair"}, donc le produit est <b>${signWord(p)}</b>.</p>`;
};
const stepsDist = fs => `<p>2. Je multiplie les distances à zéro : ${fs.map(Math.abs).join(" × ")} = ${absProd(fs)}.</p>`;
const signQ = (a, b) => (a < 0) === (b < 0)
  ? "le numérateur et le dénominateur ont le même signe, donc le quotient est <b>positif</b>"
  : "le numérateur et le dénominateur sont de signes contraires, donc le quotient est <b>négatif</b>";

/* le signe « − » mis en évidence */
const RED_MINUS = `<span style="color:var(--red);font-weight:800;font-size:1.2em">${MINUS}</span>`;
const STATUTS = {sous: "une soustraction", signe: "le signe d'un nombre relatif", opp: "l'opposé d'un nombre relatif"};
/* propriétés et leur nom à écrire */
const PROPS = {
  comm:  {t: "la commutativité", words: ["commutative", "commutativite", "commutatif"], pc: "pc-comm"},
  assoc: {t: "l'associativité", words: ["associative", "associativite", "associatif"], pc: "pc-assoc"},
  dist:  {t: "la distributivité", words: ["distributive", "distributivite", "distributif"], pc: "pc-distrib"},
  zero:  {t: "le produit par zéro", pc: "pc-zero"}
};
const PCBY = Object.fromEntries(PAR_COEUR.map(p => [p.id, p]));

/* ---------- exercices (nouveaux nombres à chaque fois) ---------- */
const GEN = {
  statutG(){
    const a = ri(2, 9), b = ri(2, 9), c = a + b;
    const C = [
      ["sous", `${c} ${RED_MINUS} ${b}`, `le « − » de ${c} − ${b}`, `Le « − » est entre deux nombres : on enlève ${b} à ${c}. ${c} − ${b} = ${a}.`],
      ["sous", `(${MINUS}${a}) ${RED_MINUS} ${b}`, `le « − » entre (−${a}) et ${b}`, `Ce « − » est entre deux nombres : c'est une soustraction. (−${a}) − ${b} = ${sn(-a - b)}.`],
      ["sous", `${a} ${RED_MINUS} (${MINUS}${b})`, `le « − » entre ${a} et (−${b})`, `Ce « − » est entre deux nombres : c'est une soustraction. ${a} − (−${b}) = ${a + b}.`],
      ["signe", `(${RED_MINUS}${a}) × ${b}`, `le « − » de −${a} dans (−${a}) × ${b}`, `−${a} est un nombre négatif : ce « − » est son signe.`],
      ["signe", `Ce matin, il fait ${RED_MINUS}${a} °C.`, `le « − » de −${a} °C`, `−${a} °C est une température négative : ce « − » est le signe du nombre −${a}.`],
      ["signe", `${b} + (${RED_MINUS}${a})`, `le « − » de −${a} dans ${b} + (−${a})`, `L'opération est une addition ; −${a} est un nombre négatif : ce « − » est son signe.`],
      ["opp", `${RED_MINUS}(${MINUS}${a})`, `le premier « − » de −(−${a})`, `−(−${a}) est l'opposé de −${a} : il vaut ${a}.`],
      ["opp", `${RED_MINUS}(+${a})`, `le premier « − » de −(+${a})`, `−(+${a}) est l'opposé de +${a} : il vaut −${a}.`],
      ["opp", `Si x = ${a}, alors ${RED_MINUS}x = ${MINUS}${a}.`, `le « − » de −x`, `−x désigne l'opposé du nombre x.`]
    ];
    const [k, expr, where, why] = pick(C);
    return {n:"statut", kind:"choice", wide:true,
      prompt:`Que désigne le signe « − » écrit en rouge ?<p style="margin-top:10px;font-size:1.2em;font-weight:700">${expr}</p>`,
      short:`Que désigne ${where} ?`,
      opts: shuffle(Object.entries(STATUTS).map(([id, t]) => ({t, ok: id === k}))), answerText: STATUTS[k],
      steps:`<p>${why}</p><p class="concl">Ce « − » désigne ${STATUTS[k]}.</p><p class="label" style="color:var(--red)">À savoir par cœur · Cahier · Rappel</p><p>${esc(PCBY["pc-statut"].text)}</p>`};
  },
  quelleProp(noZero){
    let a, b, c; do { a = sgn() * ri(2, 9); b = sgn() * ri(2, 9); c = sgn() * ri(2, 9); } while (a === b || allPos([a, b, c]));
    const k = -ri(2, 9), x = ri(2, 12), y = ri(2, 9);
    const C = [
      ["comm", `${fac(a)} × ${fac(b)} = ${fac(b)} × ${fac(a)}`, "On a changé l'ordre des facteurs, le produit ne change pas."],
      ["assoc", `(${fac(a)} × ${fac(b)}) × ${fac(c)} = ${fac(a)} × (${fac(b)} × ${fac(c)})`, "Les facteurs sont dans le même ordre, mais on les a regroupés autrement."],
      ["dist", `${fac(k)} × (${x} + ${y}) = ${fac(k)} × ${x} + ${fac(k)} × ${y}`, `On a distribué ${fac(k)} sur chaque terme de la somme.`],
      ["dist", `${fac(k)} × (${x + y} − ${y}) = ${fac(k)} × ${x + y} − ${fac(k)} × ${y}`, `On a distribué ${fac(k)} sur chaque terme de la différence.`]
    ];
    if (!noZero) C.push(["zero", `${fac(a)} × 0 = 0`, "Un des facteurs est zéro."]);
    const [id, expr, why] = pick(C), P = PROPS[id], pc = PCBY[P.pc];
    return {n:"prop", kind:"choice", wide:true, id, expr, words: P.words,
      prompt:`Quelle propriété de la multiplication utilise cette égalité ?<p style="margin-top:10px;font-weight:700">${expr}</p>`,
      short:`Quelle propriété : ${expr} ?`,
      opts: shuffle(Object.values(PROPS).map(q => ({t: q.t, ok: q === P}))), answerText: P.t,
      steps:`<p>${why}</p><p class="label" style="color:var(--red)">À savoir par cœur · ${esc(pc.source)}</p><p class="concl">${esc(pc.text)}</p>`};
  },
  astuce(){
    const [u, v] = pick([[25, 4], [4, 25], [5, 2], [2, 5], [50, 2], [2, 50], [20, 5], [5, 20]]);
    let p, q, m; do { p = sgn() * u; q = sgn() * v; m = sgn() * ri(3, 9); } while (allPos([p, q, m]));
    const ans = p * m * q, pq = p * q, t = `${fac(p)} × ${fac(m)} × ${fac(q)}`;
    return {n:"prop", kind:"num", ans, wide:true, prompt:`Calcule astucieusement : <b>${t}</b>`, short:t,
      dist:[pq + m, ans / 10, p + m + q],
      steps:`<p>La multiplication est commutative et associative : je regroupe ${fac(p)} et ${fac(q)}.</p><p>${fac(p)} × ${fac(q)} = ${sn(pq)}</p><p>${fac(pq)} × ${fac(m)} = ${sn(ans)}</p><p class="concl">${t} = ${sn(ans)}</p>`};
  },
  distrib(){
    const k = Math.random() < .8 ? -ri(2, 9) : ri(2, 9);
    if (Math.random() < .5) {
      const tot = pick([10, 20, 100]), a = ri(1, tot - 1), b = tot - a, ans = k * tot, t = `${fac(k)} × ${a} + ${fac(k)} × ${b}`;
      return {n:"prop", kind:"num", ans, wide:true, prompt:`Calcule astucieusement avec la distributivité : <b>${t}</b>`, short:t,
        dist:[-ans, k * a + b, k + tot],
        steps:`<p>${fac(k)} est en facteur dans les deux produits : j'utilise la distributivité.</p><p>${t} = ${fac(k)} × (${a} + ${b})</p><p>= ${fac(k)} × ${tot}</p><p class="concl">${t} = ${sn(ans)}</p>`};
    }
    const a = ri(11, 49), b = a - 10, ans = k * 10, t = `${fac(k)} × ${a} − ${fac(k)} × ${b}`;
    return {n:"prop", kind:"num", ans, wide:true, prompt:`Calcule astucieusement avec la distributivité : <b>${t}</b>`, short:t,
      dist:[-ans, k * (a + b), k * a - b],
      steps:`<p>${fac(k)} est en facteur dans les deux produits : j'utilise la distributivité.</p><p>${t} = ${fac(k)} × (${a} − ${b})</p><p>= ${fac(k)} × 10</p><p class="concl">${t} = ${sn(ans)}</p>`};
  },
  prod2(){
    let fs; do { fs = [sgn() * ri(2, 10), sgn() * ri(2, 10)]; } while (allPos(fs));
    const p = prod(fs), plus = Math.random() < .3, t = prodTxt(fs, plus);
    return {n:"deux", kind:"num", ans:p, prompt:`Calcule : <b>${t}</b>`, short:`${t}`,
      dist:[fs[0] + fs[1], -(fs[0] + fs[1]), fs[0] - fs[1], p + (p > 0 ? 10 : -10)],
      steps:`${stepsSign(fs)}${stepsDist(fs)}<p class="concl">${t} = ${sn(p)}</p>`};
  },
  sign2(){
    let fs; do { fs = [sgn() * ri(2, 99), sgn() * ri(2, 99)]; } while (allPos(fs));
    const p = prod(fs), t = prodTxt(fs, Math.random() < .3);
    return {n:"deux", kind:"choice", prompt:`<b>Sans calculer</b>, le produit <b>${t}</b> est-il positif ou négatif ?`, short:`Signe de ${t}`,
      opts: SIGN_OPTS(p), answerText: signWord(p),
      steps:`${stepsSign(fs)}<p class="concl">${t} est ${signWord(p)} (il vaut ${sn(p)}).</p>`};
  },
  prodN(){
    const n = pick([3, 3, 4, 4]), fs = factors(n, n === 3 ? 6 : 5, 120), p = prod(fs), t = prodTxt(fs, Math.random() < .3);
    return {n:"plus", kind:"num", ans:p, wide:true, prompt:`Calcule : <b>${t}</b>`, short:t,
      dist:[fs.reduce((a, b) => a + b, 0), p * (fs.some(x => Math.abs(x) === 1) ? 1 : 2), p + (p > 0 ? 2 : -2)],
      steps:`${stepsSign(fs)}${stepsDist(fs)}<p class="concl">${t} = ${sn(p)}</p>`};
  },
  signN(){
    const n = pick([3, 4, 4]); let fs; do { fs = Array.from({length: n}, () => sgn() * ri(2, 99)); } while (allPos(fs));
    const p = prod(fs), t = prodTxt(fs, Math.random() < .3);
    return {n:"plus", kind:"choice", wide:true, prompt:`<b>Sans calculer</b>, le produit <b>${t}</b> est-il positif ou négatif ?`, short:`Signe de ${t}`,
      opts: SIGN_OPTS(p), answerText: signWord(p),
      steps:`${stepsSign(fs)}<p class="concl">${t} est ${signWord(p)}.</p>`};
  },
  countNeg(){
    const n = pick([3, 4]), fs = Array.from({length: n}, () => sgn() * ri(2, 12)), k = nNeg(fs), t = prodTxt(fs, Math.random() < .4);
    return {n:"plus", kind:"num", ans:k, prompt:`Dans le produit <b>${t}</b>, combien y a-t-il de <b>facteurs négatifs</b> ?`, short:`Facteurs négatifs dans ${t}`,
      dist:[n - k, n, k + 1], pos:true,
      steps:`<p>Les facteurs négatifs sont ceux qui ont un signe − : ${fs.filter(x => x < 0).map(x => fac(x)).join(", ") || "aucun"}.</p><p class="concl">Il y a ${k} facteur${k > 1 ? "s" : ""} négatif${k > 1 ? "s" : ""}, ${k} est ${parite(k)} : le produit est ${signWord(prod(fs))}.</p>`};
  },
  whichPos(){ // lequel de ces produits est positif / négatif ?
    const want = sgn(), n = pick([3, 4]);
    const mk = s => { let fs; do { fs = Array.from({length: n}, () => sgn() * ri(2, 9)); } while (Math.sign(prod(fs)) !== s); return fs; };
    const good = mk(want), bads = [mk(-want), mk(-want), mk(-want)];
    const T = fs => fs.map(x => fac(x)).join(" × ");
    if (new Set([good, ...bads].map(T)).size < 4) return GEN.whichPos();
    return {n:"plus", kind:"choice", wide:true, prompt:`Lequel de ces produits est <b>${want > 0 ? "positif" : "négatif"}</b> ?`, short:`Reconnaître un produit ${want > 0 ? "positif" : "négatif"}`,
      opts: shuffle([{t:T(good), ok:true}, ...bads.map(b => ({t:T(b), ok:false}))]), answerText: T(good),
      steps:`<p>Pour chaque produit, je compte les facteurs négatifs : ${[good, ...bads].map(fs => `${T(fs)} → ${nNeg(fs)}`).join(" ; ")}.</p><p class="concl">Seul ${T(good)} a un nombre ${want > 0 ? "pair" : "impair"} de facteurs négatifs (${nNeg(good)}) : il est ${want > 0 ? "positif" : "négatif"}.</p>`};
  },
  changeSign(){ // un seul facteur change de signe : le produit change de signe
    const fs = factors(3, 6, 120), p = prod(fs), i = ri(0, 2), gs = fs.map((x, j) => j === i ? -x : x), q = prod(gs);
    const t = prodTxt(fs), u = prodTxt(gs);
    return {n:"plus", kind:"num", ans:q, wide:true, prompt:`On sait que <b>${t} = ${sn(p)}</b>. Sans tout refaire, combien vaut <b>${u}</b> ?`, short:`Changer le signe d'un facteur : ${u}`,
      dist:[p + 1, q * 2, -q + 1],
      steps:`<p>Un seul facteur a changé de signe (${fac(fs[i])} est devenu ${fac(gs[i])}) : le nombre de facteurs négatifs change de 1, donc le produit change de signe.</p><p class="concl">${u} = ${sn(q)}</p>`};
  },
  zeroIn(){
    const n = pick([3, 4]), fs = Array.from({length: n}, () => sgn() * ri(2, 9)), withZ = Math.random() < .6;
    if (withZ) fs[ri(0, n - 1)] = 0;
    const p = prod(fs), t = fs.map(x => x === 0 ? "0" : fac(x)).join(" × ");
    return {n:"zero", kind:"choice", wide:true, prompt:`Le produit <b>${t}</b> est-il positif, négatif ou nul ?`, short:`Signe de ${t}`,
      opts: SIGN_OPTS(p, true), answerText: signWord(p),
      steps: withZ ? `<p>Un des facteurs est 0.</p><p class="concl">Le produit d'un relatif par zéro est égal à zéro : ${t} = 0.</p>`
                   : `${stepsSign(fs)}<p class="concl">Aucun facteur n'est nul : ${t} = ${sn(p)}, il est ${signWord(p)}.</p>`};
  },
  zeroCalc(){
    const n = pick([3, 4]), fs = Array.from({length: n}, () => sgn() * ri(2, 9)); fs[ri(0, n - 1)] = 0;
    const t = fs.map(x => x === 0 ? "0" : fac(x)).join(" × "), others = fs.filter(x => x);
    return {n:"zero", kind:"num", ans:0, wide:true, prompt:`Calcule : <b>${t}</b>`, short:t,
      dist:[prod(others), -prod(others), others.reduce((a, b) => a + b, 0)],
      steps:`<p class="concl">Un des facteurs est 0. Le produit d'un relatif par zéro est égal à zéro : ${t} = 0.</p>`};
  },
  moins1(){
    const a = sgn() * ri(2, 50), first = Math.random() < .5, t = first ? `(${MINUS}1) × ${fac(a)}` : `${fac(a)} × (${MINUS}1)`;
    return {n:"zero", kind:"num", ans:-a, prompt:`Calcule : <b>${t}</b>`, short:t, dist:[a - 1, -a - 1, 1 - a],
      steps:`<p>Multiplier par (−1), c'est prendre l'opposé.</p><p class="concl">${t} = ${sn(-a)}</p>`};
  },
  div(){
    let q, b; do { q = sgn() * ri(2, 10); b = sgn() * ri(2, 10); } while (allPos([q, b]));
    const a = q * b, t = `${fac(a)} ÷ ${fac(b)}`;
    return {n:"quot", kind:"num", ans:q, prompt:`Calcule : <b>${t}</b>`, short:t, dist:[a * b, a - b, -(a - b), a + b],
      steps:`<p>1. Signe : ${(a < 0) === (b < 0) ? "même signe, donc le quotient est <b>positif</b>" : "signes contraires, donc le quotient est <b>négatif</b>"}.</p><p>2. Je divise les distances à zéro : ${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(q)}.</p><p class="concl">${t} = ${sn(q)}</p>`};
  },
  fracQ(){
    let q, b; do { q = sgn() * ri(2, 9); b = sgn() * ri(2, 9); } while (allPos([q, b]));
    const a = q * b;
    return {n:"quot", kind:"num", ans:q, prompt:`Calcule : ${frac(a, b)}`, short:`Calculer ${fracTxt(a, b)}`, dist:[a - b, a + b, a * b],
      steps:`<p>1. Signe : ${signQ(a, b)}.</p><p>2. ${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(q)}.</p><p class="concl">${frac(a, b)} = ${sn(q)}</p>`};
  },
  fracSign(){ // comme au polycopié : −4/−5 = 4/5 ; 2/−3 = −2/3
    let a, b; do { a = ri(2, 12); b = ri(2, 9); } while (gcd(a, b) !== 1);
    const na = Math.random() < .5 ? -a : a, nb = -b, n = Math.sign(na * nb) * a;
    return {n:"quot", kind:"frac", fa:[n, b], wide:true, answerText: ftxt(n, b),
      prompt:`Écris ce quotient comme dans le cours, sans signe « − » au dénominateur : ${frac(na, nb)}`, short:`Écrire ${fracTxt(na, nb)} avec le signe devant`,
      steps:`<p>Signe : ${signQ(na, nb)}.</p><p class="concl">${frac(na, nb)} = ${fracS(n, b)}</p>`};
  },
  fracProd(){ // comme au polycopié : −2 × (−5) / −9 = 10/−9 = −10/9
    let x, y, d, p; do { x = sgn() * ri(2, 9); y = sgn() * ri(2, 9); d = sgn() * ri(2, 11); p = x * y; } while (gcd(p, d) !== 1 || allPos([x, y, d]));
    const n = Math.sign(p * d) * Math.abs(p), D = Math.abs(d), top = `${sn(x)} × ${fac(y)}`;
    return {n:"quot", kind:"frac", fa:[n, D], wide:true, answerText: ftxt(n, D),
      prompt:`Calcule et écris le résultat sous la forme d'une fraction, sans signe « − » au dénominateur : ${fracH(top, sn(d))}`, short:`Calculer (${top})/${d < 0 ? "(" + sn(d) + ")" : d}`,
      steps:`<p>1. Numérateur : ${top} = ${sn(p)} (${(x < 0) === (y < 0) ? "même signe → positif" : "signes contraires → négatif"}).</p><p>2. ${frac(p, d)} : ${signQ(p, d)}.</p><p class="concl">${fracH(top, sn(d))} = ${frac(p, d)} = ${fracS(n, D)}</p>`};
  },
  divSign(){
    let a, b; do { a = sgn() * ri(10, 999); b = sgn() * ri(2, 99); } while (allPos([a, b]));
    const t = `${fac(a)} ÷ ${fac(b)}`, s = Math.sign(a) * Math.sign(b);
    return {n:"quot", kind:"choice", prompt:`<b>Sans calculer</b>, le quotient <b>${t}</b> est-il positif ou négatif ?`, short:`Signe de ${t}`,
      opts: SIGN_OPTS(s), answerText: signWord(s),
      steps:`<p class="concl">${(a < 0) === (b < 0) ? "Le quotient de deux nombres de même signe est positif." : "Le quotient de deux nombres de signes contraires est négatif."}</p>`};
  },
  missF(){ // a × … = c
    let a, x; do { a = sgn() * ri(2, 9); x = sgn() * ri(2, 9); } while (allPos([a, x]));
    const c = a * x, left = Math.random() < .5;
    const t = left ? `${fac(a)} × … = ${sn(c)}` : `… × ${fac(a)} = ${sn(c)}`;
    return {n:"manq", kind:"num", ans:x, prompt:`Trouve le nombre manquant : <b>${t}</b>`, short:`Nombre manquant : ${t}`, dist:[c - a, a * c],
      steps:`<p>On cherche le nombre qui, multiplié par ${fac(a)}, donne ${sn(c)} : on calcule ${sn(c)} ÷ ${fac(a)}.</p><p>${(c < 0) === (a < 0) ? "Même signe → positif" : "Signes contraires → négatif"} ; ${Math.abs(c)} ÷ ${Math.abs(a)} = ${Math.abs(x)}.</p><p class="concl">Le nombre manquant est ${sn(x)} : ${left ? `${fac(a)} × ${fac(x)}` : `${fac(x)} × ${fac(a)}`} = ${sn(c)}.</p>`};
  },
  missD(){ // … ÷ b = q   ou   a ÷ … = q
    let q, b; do { q = sgn() * ri(2, 9); b = sgn() * ri(2, 9); } while (allPos([q, b]));
    const a = q * b, dividend = Math.random() < .5;
    if (dividend) {
      const t = `… ÷ ${fac(b)} = ${sn(q)}`;
      return {n:"manq", kind:"num", ans:a, prompt:`Trouve le nombre manquant : <b>${t}</b>`, short:`Nombre manquant : ${t}`, dist:[q + b, q - b],
        steps:`<p>Le nombre manquant est égal à ${sn(q)} × ${fac(b)}.</p><p>${(q < 0) === (b < 0) ? "Même signe → positif" : "Signes contraires → négatif"} ; ${Math.abs(q)} × ${Math.abs(b)} = ${Math.abs(a)}.</p><p class="concl">Le nombre manquant est ${sn(a)} : ${fac(a)} ÷ ${fac(b)} = ${sn(q)}.</p>`};
    }
    const t = `${fac(a)} ÷ … = ${sn(q)}`;
    return {n:"manq", kind:"num", ans:b, prompt:`Trouve le nombre manquant : <b>${t}</b>`, short:`Nombre manquant : ${t}`, dist:[a * q, a - q],
      steps:`<p>Le nombre manquant est égal à ${sn(a)} ÷ ${fac(q)}.</p><p>${(a < 0) === (q < 0) ? "Même signe → positif" : "Signes contraires → négatif"} ; ${Math.abs(a)} ÷ ${Math.abs(q)} = ${Math.abs(b)}.</p><p class="concl">Le nombre manquant est ${sn(b)} : ${fac(a)} ÷ ${fac(b)} = ${sn(q)}.</p>`};
  },
  missN(){ // (−2) × … × 3 = 30 : le facteur manquant dans un produit de 3
    const fs = factors(3, 6, 150), i = ri(0, 2), c = prod(fs), x = fs[i];
    const t = fs.map((v, j) => j === i ? "…" : fac(v)).join(" × ") + ` = ${sn(c)}`, rest = fs.filter((_, j) => j !== i), pr = prod(rest);
    return {n:"manq", kind:"num", ans:x, wide:true, prompt:`Trouve le nombre manquant : <b>${t}</b>`, short:`Nombre manquant : ${t}`, dist:[c - pr, c + pr],
      steps:`<p>Je calcule d'abord le produit des facteurs connus : ${rest.map(v => fac(v)).join(" × ")} = ${sn(pr)}.</p><p>Il faut donc ${fac(pr)} × … = ${sn(c)}, soit … = ${sn(c)} ÷ ${fac(pr)} = ${sn(x)}.</p><p class="concl">Le nombre manquant est ${sn(x)}.</p>`};
  },
  addOrMul(){ // le piège : même paire de nombres, + ou ×
    const a = -ri(2, 9), b = sgn() * ri(2, 9), op = pick(["+", "×"]), ans = op === "+" ? a + b : a * b, t = `${fac(a)} ${op} ${fac(b)}`;
    return {n:"piege", kind:"num", ans, prompt:`Attention à l'opération ! Calcule : <b>${t}</b>`, short:t,
      dist: op === "+" ? [a * b, -(a * b), -ans] : [a + b, -(a + b), -ans],
      steps: op === "+"
        ? `<p>C'est une <b>addition</b> : la règle des signes de la multiplication ne s'applique pas !</p><p class="concl">${t} = ${sn(ans)}</p><p>(Pour comparer : ${fac(a)} × ${fac(b)} = ${sn(a * b)}.)</p>`
        : `${stepsSign([a, b])}${stepsDist([a, b])}<p class="concl">${t} = ${sn(ans)}</p><p>(Pour comparer : ${fac(a)} + ${fac(b)} = ${sn(a + b)}.)</p>`};
  },
  vf(){
    const a = ri(2, 9), b = ri(2, 9), S = [
      [`(${MINUS}${a}) + (${MINUS}${b}) = ${a + b}`, false, `C'est une addition de deux négatifs : (${MINUS}${a}) + (${MINUS}${b}) = ${sn(-a - b)}. « Moins par moins donne plus » ne vaut que pour × et ÷.`],
      [`(${MINUS}${a}) × (${MINUS}${b}) = ${a * b}`, true, `Même signe → positif : ${a} × ${b} = ${a * b}.`],
      [`(${MINUS}${a}) × ${b} = ${a * b}`, false, `Signes contraires → négatif : (${MINUS}${a}) × ${b} = ${sn(-a * b)}.`],
      [`(${MINUS}${a}) × (${MINUS}${b}) × (${MINUS}1) = ${a * b}`, false, `3 facteurs négatifs, 3 est impair → négatif : le produit vaut ${sn(-a * b)}.`],
      [`(${MINUS}${a}) × (${MINUS}1) × (${MINUS}${b}) × (${MINUS}1) = ${a * b}`, true, `4 facteurs négatifs, 4 est pair → positif : ${a} × 1 × ${b} × 1 = ${a * b}.`],
      [`(${MINUS}${a * b}) ÷ (${MINUS}${b}) = ${a}`, true, `Même signe → positif : ${a * b} ÷ ${b} = ${a}.`],
      [`(${MINUS}${a}) × 0 × (${MINUS}${b}) = ${a * b}`, false, `Le produit d'un relatif par zéro est égal à zéro : il vaut 0.`]
    ];
    const [s, ok, why] = pick(S);
    return {n:"piege", kind:"choice", prompt:`Vrai ou faux ? <b>${s}</b>`, short:`Vrai ou faux : ${s}`,
      opts:[{t:"Vrai", ok}, {t:"Faux", ok:!ok}], answerText: ok ? "Vrai" : "Faux",
      steps:`<p class="concl">${ok ? "Vrai" : "Faux"}. ${why}</p>`};
  }
};
const GBY_N = {}, KIND = {};
Object.keys(GEN).forEach(g => { const e = GEN[g](); KIND[g] = e.kind; (GBY_N[e.n] = GBY_N[e.n] || []).push(g); });

/* ---------- passage au moteur ---------- */
const GROUPS = {"1": "Multiplication", "2": "Division", "3": "Rappel et pièges"};
const NOTIONS = Object.entries(NOT).map(([id, n]) => ({id, name: n.name, tag: n.name, sub: `${GROUPS[n.p]} · ${n.d}`, group: String(n.p)}));
const UBY = Object.fromEntries(NOTIONS.map(u => [u.id, u]));

const review = e => `<span class="tag l${NOT[e.n].p}">${esc(NOT[e.n].name)}</span><span class="q">${esc(e.short)}</span><span>Réponse : <b>${esc(e.answerText || sn(e.ans))}</b></span>`;
const steps = e => `<div class="steps">${e.steps}</div>`;
const pcBadge = () => `<p class="label" style="color:var(--red)">À savoir par cœur</p>`;
const pcFront = card => `<div class="fbody"><span class="card-q">${esc(card)}</span><span class="hint">À savoir par cœur · touche la carte</span></div>`;

/* saisie tolérante pour les mots des phrases à trous */
const norm = s => fold(s).replace(/[’']/g, " ").replace(/[^a-z0-9+\- ]+/g, " ").replace(/\b(l|le|la|les|un|une|des|d|de|du|en|au|a)\b/g, " ").replace(/\s+/g, " ").trim();
const stem = s => s.split(" ").map(w => w.replace(/(es|e|s|x)$/, "")).join(" ");
const wordOk = (list, v) => { const a = norm(String(v).replace(/[−–]/g, "-")); return !!a && list.some(k => { const kk = norm(k); return a === kk || stem(a) === stem(kk); }); };

const cq = c => c.qH || esc(c.q);
const ca = c => c.aH || esc(c.a);
function fromPC(p){
  return {n: p.n, notion: UBY[p.n], key: "p:" + p.id, kind: "choice", prompt: `${pcBadge()}${esc(p.q)}`, wide: true,
    opts: shuffle(p.o.map((t, i) => ({t, ok: i === 0}))), answerText: p.o[0], short: p.q,
    steps: `<p class="label" style="color:var(--red)">À savoir par cœur · ${esc(p.source)}</p><p class="concl">${esc(p.text)}</p>`, redo: () => fromPC(p)};
}
function fromCours(c){
  return {n: c.n, notion: UBY[c.n], key: "c:" + c.id, kind: "choice", prompt: cq(c), wide: true, tip: c.tip,
    opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), answerText: c.o[0], short: c.q || plainTxt(c.qH),
    steps: `<p class="concl">${ca(c).replace(/\n/g, "<br>")}</p>`, redo: () => fromCours(c)};
}
/* texte brut d'une fraction HTML (pour la ligne « À revoir ») */
function plainTxt(h){
  return String(h).replace(/<span style="padding:0 4px;border-bottom[^>]*>([^<]*)<\/span><span style="padding:0 4px">([^<]*)<\/span>/g, "($1)/($2)").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
function fromGen(g){
  const e = GEN[g]();
  return Object.assign(e, {notion: UBY[e.n], key: "g:" + g + ":" + e.short + ":" + (e.ans ?? e.answerText), redo: () => fromGen(g)});
}
function trou(p){
  const blanks = [];
  const html = esc(p.trou).replace(/\[\[([^\]]+)\]\]/g, (_, alts) => { blanks.push(alts.split("|")); return `<b style="color:var(--red)">(${blanks.length})</b> ______`; });
  return {unit: UBY[p.n], kind: "fields", wide: true,
    prompt: `${pcBadge()}Complète la phrase du cours :<p style="margin-top:8px">${html}</p>`,
    fields: blanks.map((alts, i) => ({label: `Mot (${i + 1})`, lang: "fr", check: v => { const ok = wordOk(alts, v); return {ok, fix: ok ? "✓" : `→ ${alts[0]}`}; }})),
    correction: () => `<p class="label" style="margin-top:4px;color:var(--red)">À savoir par cœur · ${esc(p.source)}</p><div class="steps"><p class="concl">${esc(p.text)}</p></div>`,
    review: `<span class="tag l${NOT[p.n].p}">${esc(NOT[p.n].name)}</span><span class="q">Phrase par cœur : ${esc(p.card)}</span><span><b>${esc(p.text)}</b></span>`,
    redo: () => trou(p)};
}
/* contrôle : le nom de la propriété, à écrire */
function propWord(){
  const e = GEN.quelleProp(true), pc = PCBY[PROPS[e.id].pc];
  return {unit: UBY.prop, kind: "fields", wide: true,
    prompt: `Quelle propriété de la multiplication utilise cette égalité ? Écris le mot.<p style="margin-top:10px;font-weight:700">${e.expr}</p>`,
    fields: [{label: "La multiplication est…", lang: "fr", check: v => { const ok = wordOk(e.words, String(v).replace(/^\s*(la\s+)?multiplication\s+(est\s+)?/i, "")); return {ok, fix: ok ? "✓" : `→ ${e.words[0]}`}; }}],
    correction: () => `<p class="label" style="margin-top:4px;color:var(--red)">À savoir par cœur · ${esc(pc.source)}</p><div class="steps"><p class="concl">${esc(pc.text)}</p></div>`,
    review: `<span class="tag l1">${esc(NOT.prop.name)}</span><span class="q">${esc(e.short)}</span><span>Réponse : <b>la multiplication est ${esc(e.words[0])}</b></span>`,
    redo: () => propWord()};
}
function pickItem(pool, R, kind){
  const n = R.weighted(pool).id;
  const pcs = PAR_COEUR.filter(p => p.n === n), cs = COURS.filter(c => c.n === n), gs = GBY_N[n] || [];
  if (kind === "pc" && pcs.length) return fromPC(pick(pcs));
  if (kind === "cours" && cs.length) return fromCours(pick(cs));
  return gs.length ? fromGen(pick(gs)) : fromCours(pick(cs));
}
function posChoices(ans, traps){ // nombres positifs (compter des facteurs)
  const c = [ans, ...shuffle(traps), ans + 1, ans - 1, ans + 2, ans + 3].filter((v, i, a) => v >= 0 && a.indexOf(v) === i).slice(0, 4);
  return shuffle(c).map(v => ({t: String(v), ok: v === ans}));
}
const numOpts = e => e.kind === "frac" ? fracChoices(e.fa[0], e.fa[1]) : e.pos ? posChoices(e.ans, e.dist || []) : relChoices(e.ans, e.dist || []);
const asQuiz = e => ({unit: e.notion, key: e.key, prompt: e.prompt, fig: e.fig, wide: e.wide, tip: e.tip,
  opts: e.kind === "num" || e.kind === "frac" ? numOpts(e) : e.opts, feedback: () => steps(e), review: review(e)});
const asControl = e => Object.assign({unit: e.notion, prompt: e.prompt, fig: e.fig, wide: e.wide, tip: e.tip, review: review(e),
  correction: () => `<p class="label" style="margin-top:4px">Correction</p>${steps(e)}`, redo: () => asControl(e.redo())},
  e.kind === "num" ? {kind: "fields", fields: [relField(e.ans)]}
  : e.kind === "frac" ? {kind: "fields", fields: [fracField(e.fa[0], e.fa[1])]}
  : {kind: "choice", opts: e.opts});

const RULES = `<div class="steps" style="margin-top:0"><p><b>La règle des signes</b> (× et ÷)</p>
  <p>Même signe → positif &nbsp; · &nbsp; Signes contraires → négatif</p>
  <p>Plusieurs facteurs : je compte les facteurs négatifs. Pair → positif, impair → négatif.</p>
  <p>Quotient : le signe s'écrit devant la fraction, ${frac(2, -3)} = ${fracS(-2, 3)}.</p></div>`;

Revision.start({
  key: "leandre-maths-relatifs-multiplication-v1",
  title: "Multiplier et diviser des relatifs",
  subtitle: "Maths",
  eyebrow: "Maths · N2 · Nombres relatifs",
  hand: "Tout est dans le signe !",
  groups: {
    "1": {name: "Multiplication", cls: "l1", filter: "Multiplication"},
    "2": {name: "Division", cls: "l2", filter: "Division"},
    "3": {name: "Rappel et pièges", cls: "l3", filter: "Rappel et pièges"}
  },
  units: NOTIONS,
  allLabel: () => "Tout le chapitre",
  mastery: {max: MAXM, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["pour commencer", "Les règles et les propriétés à savoir par cœur d'abord, puis des exemples."],
    quiz: ["10 questions", "Des signes à trouver, des propriétés à reconnaître et des calculs."],
    control: ["noté sur 20", "Tu complètes les phrases du cours et tu écris toi-même les résultats, avec leur signe."]
  },
  overview: () => RULES,
  footnote: "Les exercices changent de nombres à chaque fois.",
  cards: pool => {
    const ids = pool.map(u => u.id);
    const pc = PAR_COEUR.filter(p => ids.includes(p.n)).map(p => ({unit: UBY[p.n], front: pcFront(p.card),
      back: `<div class="fbody left"><span class="card-a">${esc(p.text)}</span><span class="tip">À savoir par cœur · ${esc(p.source)}</span></div>`}));
    const cs = COURS.filter(c => ids.includes(c.n)).map(c => Object.assign({unit: UBY[c.n],
      front: `<div class="fbody"><span class="card-q">${c.cardH || esc(c.card)}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
      back: `<div class="fbody left"><span class="card-a">${ca(c)}</span>${c.tip ? `<span class="tip">${esc(c.tip)}</span>` : ""}</div>`},
      c.oldPC ? {idFront: pcFront(c.card)} : {}));
    return [...pc, ...cs];
  },
  quiz: {count: 10, make: (pool, R, i) => asQuiz(pickItem(pool, R, [0, 3, 6, 8].includes(i) ? "pc" : i === 5 ? "cours" : "gen"))},
  control: {
    lead: "Des phrases du cours à compléter, puis des calculs. Écris chaque résultat avec son signe : −12 ou -12, comme tu veux. Une fraction s'écrit −2/3.",
    note: "Après chaque réponse, tu vois la correction rédigée, comme au tableau : d'abord le signe, puis le calcul.",
    size: () => 12,
    build: pool => {
      const ids = pool.map(u => u.id);
      const pcs = shuffle(PAR_COEUR.filter(p => ids.includes(p.n)));
      const head = pcs.slice(0, 2).map(trou), items = [];
      const count = () => head.length + items.length;
      if (pcs[2]) items.push(asControl(fromPC(pcs[2])));
      if (ids.includes("prop")) items.push(propWord());
      const gp = ids.flatMap(n => GBY_N[n] || []);
      /* surtout des calculs à écrire : on privilégie les générateurs numériques */
      const numG = gp.filter(g => KIND[g] === "num" || KIND[g] === "frac"), chG = gp.filter(g => !numG.includes(g) && g !== "quelleProp");
      let order = shuffle(numG.slice());
      while (count() < 10 && numG.length) { if (!order.length) order = shuffle(numG.slice()); items.push(asControl(fromGen(order.pop()))); }
      shuffle(chG).slice(0, 2).forEach(g => count() < 12 && items.push(asControl(fromGen(g))));
      while (count() < 12) items.push(asControl(fromCours(pick(COURS.filter(c => ids.includes(c.n))))));
      return head.concat(shuffle(items));
    }
  }
});
})();
