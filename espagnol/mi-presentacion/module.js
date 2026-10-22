/* Module : Espagnol · « Mi presentación » (cours du lundi 21 septembre 2026).
   Sources : cahier de Léandre, 3 pages — les questions surlignées en bleu (à savoir par cœur, reprises dans PAR_COEUR)
   et leurs réponses (nom, âge, anniversaire, ville, nationalité, origines, frères et sœurs, parents, goûts, animaux),
   puis les corrections des exercices 1 b et 3 b p. 10 (le portrait d'Andrea).
   Corrigé par rapport au cahier : « Vino en » → « Vivo en », « Mayo » → « mayo », « belgiola » → « belga »,
   « vietnamieno » → « vietnamita », « tunisino » → « tunecino », « chinesa / chinés » → « chino, china »,
   « laotiano » → « laosiano » (laotiano accepté), « me gusta baile clásico » → « me gusta el baile clásico »,
   « Mis orígenes son diversos : francesa, italiana… » → au masculin (el origen).
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";
const {esc, shuffle, pick, fold, speakBtn} = Revision;
const ES = "es-ES";

/* ---------- notions ---------- */
const UNITS = [
  {id: "pre",  group: "1", name: "Poser une question",          sub: "¿ … ? · Cómo, Cuál, Cuántos, Cuándo, Dónde, Qué"},
  {id: "nom",  group: "1", name: "Mon nom",                     sub: "¿Cómo te llamas? · el nombre, el apellido"},
  {id: "edad", group: "1", name: "Mon âge et mon anniversaire", sub: "¿Cuántos años tienes? · el cumpleaños, la fecha"},
  {id: "lug",  group: "1", name: "Où j'habite, d'où je suis",   sub: "¿Dónde vives? · la nacionalidad, el origen"},
  {id: "her",  group: "2", name: "Mes frères et sœurs",         sub: "¿Cuántos hermanos tienes? · mayor, pequeño, hijo único"},
  {id: "pad",  group: "2", name: "Mes parents",                 sub: "¿Cómo se llaman tus padres? · se llama, se llaman"},
  {id: "gus",  group: "3", name: "Mes goûts et mes animaux",    sub: "¿Qué te gusta? · ¿Tienes mascotas?"},
  {id: "des",  group: "3", name: "Décrire quelqu'un",           sub: "Exercices p. 10 : le portrait d'Andrea"}
].map(u => Object.assign(u, {tag: u.name}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- le « par cœur » : les questions surlignées en bleu, avec la réponse du cahier ----------
   es / alt : la question (et l'autre façon de la poser) ; rep : la réponse de Léandre ;
   fam : questions trop proches pour servir de pièges l'une à l'autre ;
   trous / rtrous : mots à écrire au contrôle (dans la question / dans la réponse) ;
   pieges : [morceau, remplacement] → une fausse question de même tournure pour le QCM ;
   qw : le mot interrogatif, qwNot : ceux qui pourraient aussi passer (jamais proposés comme pièges). */
const PAR_COEUR = [
  {id: "llamas", n: "nom", fam: "nom", fr: "Comment tu t'appelles ?", es: "¿Cómo te llamas?",
   rep: "Me llamo Léandre.", repFr: "Je m'appelle Léandre.", trous: ["Cómo", "llamas"], rtrous: ["llamo"],
   pieges: [["Cómo", "Cuál"], ["te llamas", "se llaman"], ["llamas", "llamo"]], qw: "Cómo", qwNot: ["Cuál"]},
  {id: "nombre", n: "nom", fam: "nom", fr: "Quel est ton prénom ?", es: "¿Cuál es tu nombre?",
   rep: "Mi nombre es Léandre.", repFr: "Mon prénom est Léandre.", trous: ["Cuál", "nombre"], rtrous: ["nombre"],
   pieges: [["nombre", "apellido"], ["Cuál", "Qué"], ["Cuál", "Cuándo"]], qw: "Cuál", qwNot: ["Qué", "Cómo"]},
  {id: "apellido", n: "nom", fam: "nom", fr: "Quel est ton nom de famille ?", es: "¿Cuál es tu apellido?",
   rep: "Mi apellido es Cirotteau.", repFr: "Mon nom de famille est Cirotteau.", trous: ["apellido", "Cuál"], rtrous: ["apellido"],
   pieges: [["apellido", "nombre"], ["Cuál", "Qué"], ["Cuál es", "Cómo es"]], qw: "Cuál", qwNot: ["Qué", "Cómo"]},
  {id: "edad", n: "edad", fam: "edad", fr: "Quel âge as-tu ?", es: "¿Cuántos años tienes?", alt: "¿Cuál es tu edad?",
   rep: "Tengo trece años.", repFr: "J'ai treize ans.", trous: ["Cuántos", "años", "tienes"], rtrous: ["Tengo", "años"],
   pieges: [["Cuántos", "Cuántas"], ["tienes", "tienen"], ["años", "hermanos"]],
   altPieges: [["Cuál", "Qué"], ["edad", "fecha"], ["Cuál es tu", "Cuáles son tus"]], qw: "Cuántos", qwNot: []},
  {id: "nacimiento", n: "edad", fam: "cumple", fr: "Quelle est ta date de naissance ?", es: "¿Cuál es tu fecha de nacimiento?",
   rep: "Mi fecha de nacimiento es el 26 de mayo.", repFr: "Ma date de naissance est le 26 mai.", trous: ["fecha", "nacimiento"], rtrous: ["fecha", "mayo"],
   pieges: [["fecha", "edad"], ["Cuál", "Dónde"], ["nacimiento", "nacionalidad"]], qw: "Cuál", qwNot: ["Qué", "Cómo"]},
  {id: "cumple", n: "edad", fam: "cumple", fr: "Quand est ton anniversaire ?", es: "¿Cuándo es tu cumpleaños?",
   rep: "Mi cumpleaños es el 26 de mayo.", repFr: "Mon anniversaire est le 26 mai.", trous: ["Cuándo", "cumpleaños"], rtrous: ["cumpleaños", "mayo"],
   pieges: [["Cuándo", "Dónde"], ["Cuándo", "Cuántos"], ["cumpleaños", "apellido"]], qw: "Cuándo", qwNot: ["Cuál", "Qué"]},
  {id: "vives", n: "lug", fam: "viv", fr: "Où habites-tu ?", es: "¿Dónde vives?",
   rep: "Vivo en Champs-sur-Marne.", repFr: "J'habite à Champs-sur-Marne.", trous: ["Dónde", "vives"], rtrous: ["Vivo"],
   pieges: [["Dónde", "Cuándo"], ["vives", "vivo"], ["Dónde vives", "De dónde eres"]], qw: "Dónde", qwNot: []},
  {id: "nacionalidad", n: "lug", fam: "nac", fr: "Quelle est ta nationalité ?", es: "¿Cuál es tu nacionalidad?",
   rep: "Mi nacionalidad es francesa.", repFr: "Ma nationalité est française.", trous: ["nacionalidad", "Cuál"], rtrous: ["nacionalidad", "francesa"],
   pieges: [["nacionalidad", "origen"], ["Cuál", "Qué"], ["Cuál", "Dónde"]], qw: "Cuál", qwNot: ["Qué", "Cómo"]},
  {id: "eres", n: "lug", fam: "nac", fr: "D'où es-tu ?", es: "¿De dónde eres?",
   rep: "Soy francés.", repFr: "Je suis français.", note: "Une fille dit : Soy francesa.", trous: ["dónde", "eres"], rtrous: ["Soy"],
   pieges: [["eres", "vives"], ["De dónde", "Dónde"], ["eres", "soy"]], qw: "dónde", qwNot: []},
  {id: "origen", n: "lug", fam: "nac", fr: "Quelle est ton origine ?", es: "¿Cuál es tu origen?",
   alt: "¿Cuáles son tus orígenes?", altFr: "Quelles sont tes origines ?",
   rep: "Mi origen es español.", repFr: "Mon origine est espagnole.", note: "Ou : No tengo orígenes. · Mis orígenes son diversos: francés, italiano…",
   trous: ["origen", "Cuál"], rtrous: ["origen"],
   pieges: [["origen", "nacionalidad"], ["Cuál", "Dónde"], ["Cuál", "Qué"]],
   altPieges: [["Cuáles", "Cuántos"], ["son tus", "es tu"], ["orígenes", "hermanos"]], qw: "Cuál", qwNot: ["Qué", "Cómo"]},
  {id: "hermanos", n: "her", fam: "her", fr: "Combien de frères et sœurs as-tu ?", es: "¿Cuántos hermanos tienes?",
   rep: "Tengo un hermano y una hermana.", repFr: "J'ai un frère et une sœur.", note: "Ou : No tengo hermanos. · Soy hijo único (hija única).",
   trous: ["Cuántos", "hermanos", "tienes"], rtrous: ["hermano", "hermana"],
   pieges: [["hermanos", "años"], ["tienes", "tienen"], ["Cuántos", "Cómo"]], qw: "Cuántos", qwNot: ["Qué"]},
  {id: "hermanosNombres", n: "her", fam: "hern", fr: "Comment s'appellent tes frères et sœurs ?", es: "¿Cómo se llaman tus hermanos?",
   rep: "Mis hermanos se llaman Victor y Louise.", repFr: "Mon frère et ma sœur s'appellent Victor et Louise.", trous: ["llaman", "hermanos", "Cómo"], rtrous: ["hermanos", "llaman"],
   pieges: [["se llaman", "te llamas"], ["hermanos", "padres"], ["Cómo", "Cuántos"]], qw: "Cómo", qwNot: []},
  {id: "hermanosEdad", n: "her", fam: "here", fr: "Quel âge ont tes frères et sœurs ?", es: "¿Cuántos años tienen tus hermanos?",
   rep: "Tienen 21 y 17 años.", repFr: "Ils ont 21 et 17 ans.", trous: ["años", "tienen", "Cuántos"], rtrous: ["Tienen", "años"],
   pieges: [["tienen", "tienes"], ["años", "hermanos"], ["Cuántos", "Cuántas"]], qw: "Cuántos", qwNot: []},
  {id: "padres", n: "pad", fam: "pad", fr: "Comment s'appellent tes parents ?", es: "¿Cómo se llaman tus padres?",
   rep: "Mis padres se llaman Damien y Stéphanie.", repFr: "Mes parents s'appellent Damien et Stéphanie.",
   note: "Ou : Mi padre se llama Damien y mi madre se llama Stéphanie.", trous: ["padres", "llaman"], rtrous: ["padres", "llaman"],
   pieges: [["padres", "hermanos"], ["se llaman", "se llama"], ["Cómo", "Cuál"]], qw: "Cómo", qwNot: []},
  {id: "gusta", n: "gus", fam: "gus", fr: "Qu'est-ce que tu aimes ?", es: "¿Qué te gusta?",
   rep: "A mí me gusta el baile clásico y el saxofón.", repFr: "Moi, j'aime la danse classique et le saxophone.", trous: ["Qué", "gusta"], rtrous: ["gusta", "baile", "saxofón"],
   pieges: [["Qué", "Cómo"], ["te gusta", "me gusta"], ["gusta", "gustas"]], qw: "Qué", qwNot: ["Cuál"]},
  {id: "mascotas", n: "gus", fam: "mas", fr: "As-tu des animaux de compagnie ?", es: "¿Tienes mascotas?",
   rep: "Tengo un perro.", repFr: "J'ai un chien.", note: "Ou : un gato (chat), un conejo (lapin), un pez (poisson).", trous: ["Tienes", "mascotas"], rtrous: ["Tengo", "perro"],
   pieges: [["Tienes", "Tienen"], ["mascotas", "hermanos"], ["Tienes", "Tengo"]]}
];
const PBY = n => PAR_COEUR.filter(p => p.n === n);
const SOURCE = "surligné en bleu";

/* ---------- les mots interrogatifs ---------- */
const INTERRO = [
  {w: "Cómo", fr: "comment"}, {w: "Cuál", fr: "quel, quelle (lequel)"}, {w: "Cuántos", fr: "combien"},
  {w: "Cuándo", fr: "quand"}, {w: "Dónde", fr: "où"}, {w: "Qué", fr: "qu'est-ce que, quoi"}
];

/* ---------- vocabulaire : [français, espagnol, variantes acceptées, notion] ---------- */
const VOC = [
  ["le prénom", "el nombre", [], "nom"], ["le nom de famille", "el apellido", [], "nom"], ["je m'appelle", "me llamo", [], "nom"],
  ["l'âge", "la edad", [], "edad"], ["j'ai (verbe avoir)", "tengo", [], "edad"], ["treize", "trece", [], "edad"],
  ["les ans, les années", "los años", ["año"], "edad"], ["la date de naissance", "la fecha de nacimiento", [], "edad"],
  ["l'anniversaire", "el cumpleaños", [], "edad"], ["mai (le mois)", "mayo", [], "edad"], ["lundi", "lunes", [], "edad"],
  ["septembre", "septiembre", ["setiembre"], "edad"], ["vingt et un", "veintiuno", ["veintiún"], "edad"],
  ["j'habite, je vis", "vivo", [], "lug"], ["je suis (nationalité)", "soy", [], "lug"], ["la nationalité", "la nacionalidad", [], "lug"],
  ["l'origine", "el origen", [], "lug"], ["les origines", "los orígenes", [], "lug"], ["divers", "diversos", ["diverso", "diversas", "diversa"], "lug"],
  ["les frères et sœurs", "los hermanos", [], "her"], ["un frère", "un hermano", [], "her"], ["une sœur", "una hermana", [], "her"],
  ["fils unique", "hijo único", [], "her"], ["fille unique", "hija única", [], "her"],
  ["aîné, plus grand (frère, sœur)", "mayor", ["grande"], "her"], ["petit, plus jeune (frère, sœur)", "pequeño", ["pequeña", "menor"], "her"],
  ["un demi-frère", "un hermanastro", [], "her"], ["une demi-sœur", "una hermanastra", [], "her"],
  ["les parents", "los padres", [], "pad"], ["le père", "el padre", [], "pad"], ["la mère", "la madre", [], "pad"],
  ["il s'appelle, elle s'appelle", "se llama", [], "pad"], ["ils s'appellent", "se llaman", [], "pad"],
  ["j'aime", "me gusta", [], "gus"], ["la danse classique", "el baile clásico", [], "gus"], ["le saxophone", "el saxofón", [], "gus"],
  ["les animaux de compagnie", "las mascotas", ["mascota"], "gus"], ["un chien", "un perro", [], "gus"], ["un chat", "un gato", [], "gus"],
  ["un lapin", "un conejo", [], "gus"], ["un poisson", "un pez", [], "gus"],
  ["mince", "delgada", ["delgado"], "des"], ["les cheveux", "el pelo", [], "des"], ["noir", "negro", ["negra"], "des"],
  ["long", "largo", ["larga"], "des"], ["les yeux", "los ojos", [], "des"], ["marron (les yeux)", "marrones", ["marrón"], "des"],
  ["silencieux, calme", "callada", ["callado"], "des"], ["paresseux", "perezosa", ["perezoso"], "des"],
  ["travailleur", "trabajadora", ["trabajador"], "des"], ["mais", "pero", [], "des"], ["une fille", "una chica", [], "des"],
  ["le caractère", "el carácter", [], "des"], ["parce que", "porque", [], "des"]
].map(([fr, es, alts, n]) => ({fr, es, alts, n}));

/* ---------- nationalités et origines : [français, masculin, féminin, variantes] ---------- */
const GENT = [
  ["français", "francés", "francesa"], ["espagnol", "español", "española"], ["belge", "belga", "belga"],
  ["vietnamien", "vietnamita", "vietnamita"], ["portugais", "portugués", "portuguesa"], ["tunisien", "tunecino", "tunecina"],
  ["chinois", "chino", "china"], ["laotien", "laosiano", "laosiana", ["laotiano", "laotiana"]], ["italien", "italiano", "italiana"],
  ["marocain", "marroquí", "marroquí"], ["algérien", "argelino", "argelina"], ["allemand", "alemán", "alemana"]
].map(([fr, m, f, alts]) => ({fr, m, f, alts: alts || []}));
const frFem = {français: "française", espagnol: "espagnole", portugais: "portugaise", tunisien: "tunisienne", chinois: "chinoise",
  laotien: "laotienne", italien: "italienne", algérien: "algérienne", allemand: "allemande"};

/* ---------- questions de cours : carte + QCM (bonne réponse en premier dans o) ---------- */
const COURS = [
  {n: "pre", card: "Comment écrit-on une question en espagnol ?",
   a: "Avec un point d'interrogation à l'envers au début et un à l'endroit à la fin : ¿Cómo te llamas?\nLe mot interrogatif prend un accent : Cómo, Cuál, Cuántos, Cuándo, Dónde, Qué.",
   say: "¿Cómo te llamas?"},
  {n: "pre", card: "Que veulent dire Cómo, Cuál, Cuántos, Cuándo, Dónde et Qué ?",
   a: "Cómo = comment\nCuál = quel, quelle\nCuántos = combien\nCuándo = quand\nDónde = où (De dónde = d'où)\nQué = qu'est-ce que, quoi"},
  {n: "nom", card: "Quelle différence entre « el nombre » et « el apellido » ?",
   a: "el nombre = le prénom (Léandre)\nel apellido = le nom de famille (Cirotteau)",
   q: "« El apellido », c'est…", o: ["le nom de famille", "le prénom", "le surnom", "l'âge"]},
  {n: "edad", card: "Quel verbe utilise-t-on pour dire son âge ?",
   a: "Le verbe tener (avoir), comme en français : Tengo trece años = J'ai treize ans.", say: "Tengo trece años.",
   q: "Pour dire son âge, on dit…", o: ["Tengo trece años.", "Soy trece años.", "Vivo trece años.", "Me llamo trece años."]},
  {n: "edad", card: "Comment écrit-on en espagnol la date du lundi 21 septembre 2026 ?",
   a: "Lunes, veintiuno de septiembre de dos mil veintiséis.", say: "Lunes, veintiuno de septiembre de dos mil veintiséis.",
   q: "Comment écrit-on « lundi 21 septembre 2026 » ?",
   o: ["Lunes, veintiuno de septiembre de dos mil veintiséis", "Lunes, veintiuno septiembre dos mil veintiséis",
       "Lunes, veintiséis de septiembre de dos mil veintiuno", "Lunes, veintiuno de mayo de dos mil veintiséis"]},
  {n: "edad", card: "En espagnol, les mois prennent-ils une majuscule ?",
   a: "Non : el 26 de mayo, el 21 de septiembre.",
   q: "Comment écrit-on « le 26 mai » ?", o: ["el 26 de mayo", "el 26 de Mayo", "el 26 mayo", "la 26 de mayo"]},
  {n: "lug", card: "Que veut dire « Vivo en Champs-sur-Marne » ?",
   a: "J'habite à Champs-sur-Marne (verbe vivir).", tip: "Attention : vino, avec un n, veut dire « le vin » !", say: "Vivo en Champs-sur-Marne.",
   q: "« Vivo en Champs-sur-Marne » veut dire…", o: ["J'habite à Champs-sur-Marne.", "Je suis né à Champs-sur-Marne.", "Je viens de Champs-sur-Marne.", "J'aime Champs-sur-Marne."]},
  {n: "lug", card: "Comment dit-on « Je suis français » ? Et une fille ?",
   a: "Soy francés.\nUne fille : Soy francesa.", say: "Soy francés. Soy francesa.",
   q: "Une fille dit « Je suis française » :", o: ["Soy francesa.", "Soy francés.", "Tengo francesa.", "Vivo francesa."]},
  {n: "lug", card: "Pourquoi écrit-on « Mi nacionalidad es francesa », même pour un garçon ?",
   a: "Parce que « la nacionalidad » est féminin : l'adjectif s'accorde avec lui.\nÀ l'inverse, « el origen » est masculin : Mi origen es español.",
   q: "Léandre écrit : « Mi nacionalidad es… »", o: ["francesa", "francés", "franceses", "Francia"]},
  {n: "lug", card: "Comment dire « Je n'ai pas d'origines » ?", a: "No tengo orígenes.", say: "No tengo orígenes.",
   q: "« No tengo orígenes » veut dire…", o: ["Je n'ai pas d'origines.", "Je n'ai pas de nationalité.", "Je n'ai pas de frères et sœurs.", "Je ne connais pas mes origines."]},
  {n: "lug", card: "Comment dire « Mes origines sont diverses : française, italienne, marocaine, algérienne et allemande » ?",
   a: "Mis orígenes son diversos: francés, italiano, marroquí, argelino y alemán.", say: "Mis orígenes son diversos: francés, italiano, marroquí, argelino y alemán.",
   q: "« Mis orígenes son diversos » veut dire…", o: ["Mes origines sont diverses.", "Mes origines sont espagnoles.", "Je n'ai pas d'origines.", "Mes parents sont divers."]},
  {n: "lug", card: "Espagnol, belge, vietnamien, portugais : comment dit-on ces origines en espagnol ?",
   a: "español · belga · vietnamita · portugués", say: "español, belga, vietnamita, portugués"},
  {n: "lug", card: "Tunisien, chinois, laotien : comment dit-on ces origines en espagnol ?",
   a: "tunecino · chino · laosiano", say: "tunecino, chino, laosiano"},
  {n: "lug", card: "Italien, marocain, algérien, allemand : comment dit-on ces origines en espagnol ?",
   a: "italiano · marroquí · argelino · alemán", say: "italiano, marroquí, argelino, alemán"},
  {n: "her", card: "Comment dire que tu n'as pas de frères et sœurs ? (deux façons)",
   a: "No tengo hermanos.\nSoy hijo único (une fille : hija única).", say: "No tengo hermanos. Soy hijo único.",
   q: "« Soy hija única » veut dire…", o: ["Je suis fille unique.", "J'ai une sœur.", "Je suis l'aînée.", "Je n'ai pas de parents."]},
  {n: "her", card: "Comment dire « J'ai un frère » et « J'ai une sœur » ?",
   a: "Tengo un hermano.\nTengo una hermana.", say: "Tengo un hermano. Tengo una hermana.",
   q: "« Tengo una hermana » veut dire…", o: ["J'ai une sœur.", "J'ai un frère.", "Je suis une sœur.", "J'ai une demi-sœur."]},
  {n: "her", card: "Comment dire « un grand frère » et « une petite sœur » ?",
   a: "un hermano mayor (ou grande)\nuna hermana pequeña\nmayor ≠ pequeño", say: "un hermano mayor, una hermana pequeña",
   q: "« Una hermana mayor », c'est…", o: ["une grande sœur", "une petite sœur", "une demi-sœur", "une cousine"]},
  {n: "her", card: "Que veulent dire « hermanastro » et « hermanastra » ?",
   a: "un hermanastro = un demi-frère\nuna hermanastra = une demi-sœur", say: "un hermanastro, una hermanastra",
   q: "« Un hermanastro », c'est…", o: ["un demi-frère", "un grand frère", "un petit frère", "un fils unique"]},
  {n: "her", card: "Que veut dire « mis hermanos » ?",
   a: "Mes frères et sœurs : le masculin pluriel regroupe les garçons et les filles.\nMis hermanos se llaman Victor y Louise.",
   q: "« Mis hermanos se llaman Victor y Louise » veut dire…",
   o: ["Mon frère et ma sœur s'appellent Victor et Louise.", "Mes parents s'appellent Victor et Louise.", "Mes enfants s'appellent Victor et Louise.", "Mes amis s'appellent Victor et Louise."]},
  {n: "pad", card: "Comment dire « Mon père s'appelle Damien et ma mère s'appelle Stéphanie » ?",
   a: "Mi padre se llama Damien y mi madre se llama Stéphanie.", say: "Mi padre se llama Damien y mi madre se llama Stéphanie.",
   q: "« Mi madre se llama Stéphanie » veut dire…", o: ["Ma mère s'appelle Stéphanie.", "Mon père s'appelle Stéphanie.", "Ma sœur s'appelle Stéphanie.", "Mes parents s'appellent Stéphanie."]},
  {n: "pad", card: "« Se llama » ou « se llaman » : quand emploie-t-on chacun ?",
   a: "se llama : pour une seule personne (Mi padre se llama Damien).\nse llaman : pour plusieurs (Mis padres se llaman Damien y Stéphanie).",
   q: "Mis padres se … Damien y Stéphanie.", o: ["llaman", "llama", "llamas", "llamo"]},
  {n: "pad", card: "Que veut dire « mis padres » ?", a: "Mes parents : mi padre (mon père) et mi madre (ma mère).",
   q: "« Mis padres », ce sont…", o: ["mes parents", "mes pères", "mes frères", "mes grands-parents"]},
  {n: "gus", card: "Que veut dire « A mí me gusta… » ?", a: "Moi, j'aime…\n« A mí » insiste : moi.", say: "A mí me gusta el saxofón.",
   q: "« A mí me gusta el saxofón » veut dire…", o: ["Moi, j'aime le saxophone.", "Moi, je joue du saxophone.", "Moi, j'ai un saxophone.", "Moi, je déteste le saxophone."]},
  {n: "gus", card: "Comment dit-on « la danse classique » et « le saxophone » ?", a: "el baile clásico\nel saxofón", say: "el baile clásico y el saxofón"},
  {n: "gus", card: "Comment dit-on chien, chat, lapin et poisson ?", a: "un perro (chien)\nun gato (chat)\nun conejo (lapin)\nun pez (poisson)",
   say: "un perro, un gato, un conejo, un pez"},
  {n: "des", card: "Comment dire « Andrea est mince, elle a les cheveux noirs et longs » ?",
   a: "Andrea es delgada, tiene el pelo negro y largo.", say: "Andrea es delgada, tiene el pelo negro y largo.",
   q: "« Tiene el pelo negro y largo » veut dire…", o: ["Elle a les cheveux noirs et longs.", "Elle a les yeux noirs et longs.", "Elle a les cheveux longs et blonds.", "Elle a les cheveux noirs et courts."]},
  {n: "des", card: "Comment dire « Elle a les yeux marron » ?", a: "Tiene los ojos marrones.", say: "Tiene los ojos marrones.",
   q: "« Tiene los ojos marrones » veut dire…", o: ["Elle a les yeux marron.", "Elle a les cheveux marron.", "Elle a les yeux noirs.", "Elle est mince et brune."]},
  {n: "des", card: "Que veulent dire « callada », « perezosa » et « trabajadora » ?",
   a: "callada = silencieuse, calme\nperezosa = paresseuse\ntrabajadora = travailleuse", say: "callada, perezosa, trabajadora"},
  {n: "des", card: "Comment dire « C'est une fille silencieuse, paresseuse mais travailleuse » ?",
   a: "Es una chica callada, perezosa pero trabajadora.", say: "Es una chica callada, perezosa pero trabajadora.",
   q: "« Es una chica callada, perezosa pero trabajadora » veut dire…",
   o: ["C'est une fille silencieuse, paresseuse mais travailleuse.", "C'est une fille bavarde, travailleuse mais paresseuse.",
       "C'est une fille calme, mince mais paresseuse.", "C'est une fille silencieuse, travailleuse et sportive."]},
  {n: "des", card: "Pourquoi le caractère d'Andrea ne paraît-il pas cohérent ? (ex. 3 p. 10)",
   a: "Su carácter no me parece coherente porque es perezosa y trabajadora.\n= Son caractère ne me paraît pas cohérent parce qu'elle est paresseuse et travailleuse.",
   say: "Su carácter no me parece coherente porque es perezosa y trabajadora.",
   q: "« Su carácter no me parece coherente porque es perezosa y trabajadora. » Pourquoi ?",
   o: ["Parce qu'elle est à la fois paresseuse et travailleuse.", "Parce qu'elle est mince et a les cheveux longs.", "Parce qu'elle est silencieuse.", "Parce qu'elle a les yeux marron."]}
];

/* ---------- vrai ou faux ---------- */
const VF = [
  ["En espagnol, une question commence par un point d'interrogation à l'envers : ¿", true, "pre", "Oui : ¿Cómo te llamas?"],
  ["« Dónde » veut dire « quand ».", false, "pre", "Non : dónde = où. Quand, c'est cuándo."],
  ["« Cuántos » veut dire « combien ».", true, "pre", "Oui : ¿Cuántos años tienes? = Combien d'années as-tu ?"],
  ["Dans une question, « Cómo » prend un accent.", true, "pre", "Oui : les mots interrogatifs prennent un accent : Cómo, Cuál, Dónde…"],
  ["« El apellido » veut dire « le prénom ».", false, "nom", "Non : el apellido = le nom de famille. Le prénom, c'est el nombre."],
  ["« ¿Cómo te llamas? » veut dire « Comment tu t'appelles ? ».", true, "nom", "Oui. Réponse : Me llamo Léandre."],
  ["« ¿Cuántos años tienes? » veut dire « Quel âge as-tu ? ».", true, "edad", "Oui. On peut aussi dire ¿Cuál es tu edad?"],
  ["« El cumpleaños » veut dire « l'anniversaire ».", true, "edad", "Oui : Mi cumpleaños es el 26 de mayo."],
  ["En espagnol, les mois prennent une majuscule : el 26 de Mayo.", false, "edad", "Non : les mois s'écrivent en minuscules : el 26 de mayo."],
  ["Pour dire son âge en espagnol, on emploie le verbe « ser » : Soy trece años.", false, "edad", "Non : on emploie tener, comme « avoir » : Tengo trece años."],
  ["« Vivo en Champs-sur-Marne » veut dire « J'habite à Champs-sur-Marne ».", true, "lug", "Oui : vivo vient de vivir (vivre, habiter)."],
  ["On écrit « Mi nacionalidad es francés ».", false, "lug", "Non : la nacionalidad est féminin, donc Mi nacionalidad es francesa."],
  ["Une fille dit « Soy francesa ».", true, "lug", "Oui : francés au masculin, francesa au féminin."],
  ["« ¿De dónde eres? » veut dire « Où habites-tu ? ».", false, "lug", "Non : ¿De dónde eres? = D'où es-tu ? Où habites-tu, c'est ¿Dónde vives?"],
  ["« No tengo orígenes » veut dire « Je n'ai pas d'origines ».", true, "lug", "Oui."],
  ["« Mis hermanos » peut vouloir dire « mes frères et sœurs ».", true, "her", "Oui : le masculin pluriel regroupe les garçons et les filles."],
  ["« Un hermano mayor » est un petit frère.", false, "her", "Non : mayor = plus grand, aîné. Un petit frère : un hermano pequeño."],
  ["« Soy hijo único » veut dire « Je suis fils unique ».", true, "her", "Oui. Une fille dit : Soy hija única."],
  ["« Una hermanastra » est une demi-sœur.", true, "her", "Oui. Un demi-frère : un hermanastro."],
  ["« Mis padres » veut dire « mes pères ».", false, "pad", "Non : mis padres = mes parents (le père et la mère)."],
  ["« Mi padre se llaman Damien » est correct.", false, "pad", "Non : une seule personne → se llama : Mi padre se llama Damien."],
  ["« La madre » veut dire « la mère ».", true, "pad", "Oui. Le père : el padre."],
  ["« Un conejo » est un chien.", false, "gus", "Non : un conejo = un lapin. Un chien : un perro."],
  ["« Un pez » est un poisson.", true, "gus", "Oui."],
  ["« ¿Tienes mascotas? » veut dire « As-tu des animaux de compagnie ? ».", true, "gus", "Oui. Réponse : Tengo un perro, un gato…"],
  ["« ¿Qué te gusta? » veut dire « Qu'est-ce que tu aimes ? ».", true, "gus", "Oui. Réponse : A mí me gusta el baile clásico y el saxofón."],
  ["« Andrea es delgada » veut dire « Andrea est grande ».", false, "des", "Non : delgada = mince."],
  ["« Perezosa » veut dire « travailleuse ».", false, "des", "Non : perezosa = paresseuse. Travailleuse, c'est trabajadora."],
  ["« Tiene los ojos marrones » veut dire « Elle a les yeux marron ».", true, "des", "Oui : los ojos = les yeux."],
  ["« Pero » veut dire « mais ».", true, "des", "Oui : perezosa pero trabajadora = paresseuse mais travailleuse."]
];

/* ---------- outils ---------- */
const lowq = s => String(s).toLowerCase().replace(/[’`´]/g, "'").replace(/\s+/g, " ").trim();
const bare = s => lowq(s).replace(/[¿?¡!.,;:«»"()…]/g, " ").replace(/\s+/g, " ").trim();
const ART = /^(el|la|los|las|lo|un|una|unos|unas)\s+/;
const keyEs = s => bare(s).replace(ART, "").trim();
/* espagnol : majuscules, ponctuation et articles ignorés ; un accent oublié est accepté mais signalé */
function esCheck(good, alts = [], asQuestion = false){
  return v => {
    const raw = String(v == null ? "" : v), a = keyEs(raw);
    if (!a) return {ok: false, fix: `→ ${good}`};
    for (const g of [good, ...alts]) {
      const gg = keyEs(g);
      if (!gg || fold(a) !== fold(gg)) continue;
      const acc = a !== gg, inv = asQuestion && !raw.includes("¿");
      const msg = acc && inv ? `✓ Attention aux accents et au ¿ du début : ${good}` : acc ? `✓ Attention aux accents : ${good}` : inv ? `✓ N'oublie pas le ¿ du début : ${good}` : "✓";
      return {ok: true, fix: msg};
    }
    return {ok: false, fix: `→ ${good}`};
  };
}
const strip = h => String(h).replace(/<[^>]+>/g, "");
const tagOf = n => `<span class="tag ${({1: "l1", 2: "l2", 3: "l3"})[UBY[n].group]}">${esc(UBY[n].name)}</span>`;
const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;
const nl = s => esc(s).replace(/\n/g, "<br>");
const es = s => `<b lang="es">${esc(s)}</b>`;
const pcLabel = `<span class="label">À savoir par cœur · ${SOURCE}</span>`;
const wordRe = w => new RegExp(`(^|[^\\p{L}\\d])(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=[^\\p{L}\\d]|$)`, "gu");
const trapOf = (text, [a, b]) => text.replace(a, b);
const unacc = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
const near = (list, n) => { const s = shuffle(list); return [...s.filter(x => x.n === n), ...s.filter(x => x.n !== n)]; };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- générateurs : {n, prompt, opts | fields, explain, say?, review, redo} ---------- */
const G = {
  /* QCM : la question exacte, contre trois fausses de même tournure */
  parcoeur(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), useAlt = !!(p.alt && p.altPieges) && Math.random() < .3;
    const good = useAlt ? p.alt : p.es, fr = useAlt ? (p.altFr || p.fr) : p.fr;
    const traps = [...new Set((useAlt ? p.altPieges : p.pieges).map(x => trapOf(good, x)))].filter(t => t !== good && t !== p.es && t !== p.alt);
    return {n, pid: p.id, prompt: `${pcLabel}<br>Comment demandes-tu en espagnol :<br><b>« ${esc(fr)} »</b>${useAlt ? `<br><span class="fine">L'autre façon de le demander (pas ${esc(p.es)})</span>` : ""}`, wide: true,
      opts: shuffle([{t: good, ok: true}, ...traps.map(t => ({t, ok: false}))]),
      explain: `C'est ${es(good)} : la question du cahier, mot pour mot.<br>Réponse : ${es(p.rep)}`, say: `${good} ${p.rep}`,
      review: rev(n, fr, good), redo: () => G.parcoeur(n)};
  },
  /* contrôle : écrire la question en entier */
  ecrire(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool);
    return {n, pid: p.id, prompt: `${pcLabel}<br>Écris la question en espagnol :<br><b>« ${esc(p.fr)} »</b>`, wide: true,
      fields: [{label: "La question", lang: "es", check: esCheck(p.es, p.alt ? [p.alt] : [], true)}],
      explain: "", say: p.es, review: rev(n, p.fr, p.es + (p.alt ? " / " + p.alt : "")), redo: () => G.ecrire(n)};
  },
  /* contrôle : texte à trous dans la question ou dans la réponse */
  trous(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), onQ = Math.random() < .55;
    const text = onQ ? p.es : p.rep, cands = (onQ ? p.trous : p.rtrous).filter(w => wordRe(w).test(text));
    const k = text.split(" ").length > 5 && cands.length > 1 ? 2 : 1;
    const tr = shuffle(cands).slice(0, k).sort((a, b) => text.indexOf(a) - text.indexOf(b));
    let html = esc(text), full = esc(text);
    tr.forEach((w, i) => {
      html = html.replace(wordRe(esc(w)), `$1<b class="blank">…(${i + 1})…</b>`);
      full = full.replace(wordRe(esc(w)), `$1<b>${esc(w)}</b>`);
    });
    const lead = onQ ? `Complète la question « ${esc(p.fr)} » :` : `Complète la réponse à ${es(p.es)} :`;
    return {n, pid: p.id, prompt: `${pcLabel}<br>${lead}<br><span class="q" lang="es">${html}</span>`, wide: true,
      fields: tr.map((w, i) => ({label: tr.length > 1 ? `Mot ${i + 1}` : "Le mot", lang: "es", check: esCheck(w)})),
      explain: `<span lang="es">${full}</span>`, say: text, review: rev(n, onQ ? p.fr : p.es, text), redo: () => G.trous(n)};
  },
  /* que veut dire la question ? */
  sens(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), useAlt = !!p.alt && Math.random() < .3, q = useAlt ? p.alt : p.es, fr = useAlt ? (p.altFr || p.fr) : p.fr;
    const others = near(PAR_COEUR.filter(x => x.fam !== p.fam), n).map(x => x.fr).filter(t => t !== fr && t !== p.fr && t !== p.altFr);
    return {n, prompt: `Que veut dire cette question ?<br>${es(q)}`, wide: true,
      opts: shuffle([{t: fr, ok: true}, ...[...new Set(others)].slice(0, 3).map(t => ({t, ok: false}))]),
      explain: `${es(q)} = « ${esc(fr)} »<br>Réponse : ${es(p.rep)}`, say: q, review: rev(n, q, fr), redo: () => G.sens(n)};
  },
  /* la bonne réponse à la question */
  reponse(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), others = near(PAR_COEUR.filter(x => x.fam !== p.fam), n).slice(0, 3);
    return {n, prompt: `Quelle est la bonne réponse à cette question ?<br>${es(p.es)}`, wide: true,
      opts: shuffle([{t: p.rep, ok: true}, ...others.map(x => ({t: x.rep, ok: false}))]),
      explain: `${es(p.es)} (${esc(p.fr)})<br>→ ${es(p.rep)} (${esc(p.repFr)})`, say: `${p.es} ${p.rep}`,
      review: rev(n, p.es, p.rep), redo: () => G.reponse(n)};
  },
  /* retrouver la question à partir de la réponse */
  question(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), good = p.alt && Math.random() < .3 ? p.alt : p.es;
    const others = near(PAR_COEUR.filter(x => x.fam !== p.fam), n).slice(0, 3);
    return {n, prompt: `Voici la réponse : ${es("« " + p.rep + " »")}<br>Quelle était la question ?`, wide: true,
      opts: shuffle([{t: good, ok: true}, ...others.map(x => ({t: x.es, ok: false}))]),
      explain: `${es(good)} (${esc(p.fr)})<br>→ ${es(p.rep)}`, say: `${good} ${p.rep}`,
      review: rev(n, `Question pour : ${p.rep}`, good), redo: () => G.question(n)};
  },
  /* le mot interrogatif qui manque */
  motq(n){
    const pool = PAR_COEUR.filter(p => p.qw);
    const p = pick(pool), low = p.qw === p.qw.toLowerCase(), fit = w => low ? w.toLowerCase() : w;
    const bad = shuffle(INTERRO.map(x => x.w).filter(w => w.toLowerCase() !== p.qw.toLowerCase() && !p.qwNot.includes(w))).slice(0, 3);
    const html = esc(p.es).replace(wordRe(esc(p.qw)), `$1<b class="blank">…</b>`);
    return {n, prompt: `Quel mot manque dans la question « ${esc(p.fr)} » ?<br><span class="q" lang="es">${html}</span>`, wide: true,
      opts: shuffle([{t: p.qw, ok: true}, ...bad.map(w => ({t: fit(w), ok: false}))]),
      explain: es(p.es), say: p.es, review: rev(n, `Le mot qui manque : ${p.fr}`, p.qw), redo: () => G.motq(n)};
  },
  /* le mot interrogatif à partir de son sens (QCM au quiz, à écrire au contrôle) */
  interro(n, typed){
    const x = pick(INTERRO), base = {n, prompt: `Quel mot interrogatif veut dire <b>« ${esc(x.fr)} »</b> ?`, explain: "",
      review: rev(n, `Mot interrogatif : ${x.fr}`, x.w), redo: () => G.interro(n, typed)};
    if (typed) return Object.assign(base, {fields: [{label: "En espagnol", lang: "es", check: esCheck(x.w, x.w === "Cuál" ? ["Cuáles"] : x.w === "Cuántos" ? ["Cuántas"] : [])}]});
    return Object.assign(base, {explain: `C'est ${es(x.w)}.`, opts: shuffle([{t: x.w, ok: true}, ...shuffle(INTERRO.filter(y => y !== x)).slice(0, 3).map(y => ({t: y.w, ok: false}))])});
  },
  /* quelle question est bien écrite (¿ ? et accent) */
  ponct(n){
    const p = pick(PAR_COEUR.filter(x => x.qw && /[áéíóú]/.test(x.qw))), inner = p.es.replace(/^¿|\?$/g, "");
    const wrong = [inner + "?", "¿" + inner + "¿", "¿" + inner.replace(p.qw, unacc(p.qw)) + "?"];
    return {n, prompt: "Quelle question est bien écrite ?", wide: true,
      opts: shuffle([{t: p.es, ok: true}, ...wrong.map(t => ({t, ok: false}))]),
      explain: `${es(p.es)} : un ¿ au début, un ? à la fin, et l'accent sur ${esc(p.qw)}.`, say: p.es,
      review: rev(n, "La question bien écrite", p.es), redo: () => G.ponct(n)};
  },
  /* vocabulaire : français → espagnol (QCM au quiz, à écrire au contrôle) */
  vocab(n, typed){
    const pool = VOC.filter(v => v.n === n);
    if (!pool.length) return null;
    const v = pick(pool), base = {n, prompt: `Comment dit-on <b>« ${esc(v.fr)} »</b> en espagnol ?`, say: v.es,
      review: rev(n, v.fr, v.es), redo: () => G.vocab(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: "En espagnol", lang: "es", check: esCheck(v.es, v.alts)}]});
    const taken = new Set([keyEs(v.es), ...v.alts.map(keyEs)]);
    const others = near(VOC.filter(x => x !== v), n).filter(x => !taken.has(keyEs(x.es)) && (taken.add(keyEs(x.es)) || true)).slice(0, 3);
    return Object.assign(base, {explain: `C'est ${es(v.es)}.`, opts: shuffle([{t: v.es, ok: true}, ...others.map(x => ({t: x.es, ok: false}))])});
  },
  /* vocabulaire : espagnol → français */
  vocabInv(n){
    const pool = VOC.filter(v => v.n === n);
    if (!pool.length) return null;
    const v = pick(pool), seen = new Set([v.fr]);
    const others = near(VOC.filter(x => x !== v && x.es !== v.es), n).filter(x => !seen.has(x.fr) && (seen.add(x.fr) || true)).slice(0, 3);
    return {n, prompt: `Que veut dire ${es(v.es)} ?`, opts: shuffle([{t: v.fr, ok: true}, ...others.map(x => ({t: x.fr, ok: false}))]),
      explain: `${es(v.es)} = « ${esc(v.fr)} »`, say: v.es, review: rev(n, v.es, v.fr), redo: () => G.vocabInv(n)};
  },
  /* nationalités et origines */
  gent(n, typed){
    if (n !== "lug") return null;
    const g = pick(GENT), base = {n, prompt: `Comment dit-on l'origine <b>« ${esc(g.fr)} »</b> en espagnol ?`, say: `Mi origen es ${g.m}.`,
      review: rev(n, `Origine : ${g.fr}`, g.m === g.f ? g.m : `${g.m} / ${g.f}`), redo: () => G.gent(n, typed)};
    if (typed) return Object.assign(base, {explain: "", prompt: base.prompt + `<br><span class="fine">Mi origen es…</span>`,
      fields: [{label: "En espagnol", lang: "es", check: esCheck(g.m, [g.f, ...g.alts])}]});
    const others = shuffle(GENT.filter(x => x !== g)).slice(0, 3);
    return Object.assign(base, {explain: `Mi origen es ${es(g.m)}.`, opts: shuffle([{t: g.m, ok: true}, ...others.map(x => ({t: x.m, ok: false}))])});
  },
  fem(n){
    if (n !== "lug") return null;
    const g = pick(GENT.filter(x => x.m !== x.f && frFem[x.fr])), others = shuffle(GENT.filter(x => x !== g && x.m !== x.f)).slice(0, 2);
    return {n, prompt: `Une fille dit <b>« Je suis ${esc(frFem[g.fr])}. »</b>`, wide: true,
      opts: shuffle([{t: `Soy ${g.f}.`, ok: true}, {t: `Soy ${g.m}.`, ok: false}, ...others.map(x => ({t: `Soy ${x.f}.`, ok: false}))]),
      explain: `Au féminin : ${es("Soy " + g.f + ".")} (un garçon : Soy ${esc(g.m)}).`, say: `Soy ${g.f}.`,
      review: rev(n, `Une fille : je suis ${frFem[g.fr]}`, `Soy ${g.f}.`), redo: () => G.fem(n)};
  },
  cours(n){
    const pool = COURS.filter(c => c.n === n && c.o);
    if (!pool.length) return null;
    const c = pick(pool), q = c.q || c.card;
    return {n, prompt: esc(q), wide: true, opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), explain: nl(c.a), tip: c.tip, say: c.say,
      review: rev(n, q, c.o[0]), redo: () => G.cours(n)};
  },
  vf(n){
    const pool = VF.filter(v => v[2] === n);
    if (!pool.length) return null;
    const [s, truth, , why] = pick(pool);
    return {n, prompt: `Vrai ou faux ?<br><b>${esc(s)}</b>`, opts: [{t: "Vrai", ok: truth}, {t: "Faux", ok: !truth}], explain: esc(why),
      review: rev(n, s, truth ? "Vrai" : "Faux"), redo: () => G.vf(n)};
  }
};
const KQ = {
  pre: ["motq", "motq", "ponct", "interro", "vf"],
  nom: ["sens", "reponse", "question", "vocab", "vocabInv", "cours", "vf"],
  edad: ["sens", "reponse", "question", "vocab", "vocabInv", "cours", "cours", "vf"],
  lug: ["sens", "reponse", "question", "gent", "fem", "vocab", "cours", "vf"],
  her: ["sens", "reponse", "question", "vocab", "vocabInv", "cours", "vf"],
  pad: ["sens", "reponse", "question", "vocab", "cours", "vf"],
  gus: ["sens", "reponse", "question", "vocab", "vocabInv", "cours", "vf"],
  des: ["vocab", "vocabInv", "cours", "cours", "vf"]
};
const KC = {
  pre: ["interro", "interro", "motq", "ponct"],
  nom: ["vocab", "vocab", "sens", "vf"],
  edad: ["vocab", "vocab", "sens", "cours"],
  lug: ["gent", "gent", "fem", "vocab", "sens"],
  her: ["vocab", "vocab", "sens", "reponse"],
  pad: ["vocab", "vocab", "reponse", "cours"],
  gus: ["vocab", "vocab", "vocab", "sens"],
  des: ["vocab", "vocab", "vocab", "cours"]
};
function make(kinds, n, typed){
  for (const k of shuffle(kinds)) { const e = G[k](n, typed); if (e) return e; }
  return G.vf(n) || G.vocab(n, typed);
}

/* ---------- rédaction : comme à l'évaluation, corrigée critère par critère ---------- */
const REDAC = [
  {id: "mi-presentacion", unit: "nom", titre: "Mi presentación",
   consigne: `<p>Présente-toi <b>en espagnol</b>, en <b>6 à 8 phrases</b> : ton <b>nom</b>, ton <b>âge</b> et ton <b>anniversaire</b>, <b>où tu habites</b> et ta <b>nationalité</b>, ta <b>famille</b> (frères et sœurs, parents) et <b>ce que tu aimes</b>.</p>`,
   modele: "Me llamo Léandre y mi apellido es Cirotteau. Tengo trece años. Mi cumpleaños es el 26 de mayo. Vivo en Champs-sur-Marne y soy francés. Tengo un hermano y una hermana: mis hermanos se llaman Victor y Louise y tienen 21 y 17 años. Mis padres se llaman Damien y Stéphanie. A mí me gusta el baile clásico y el saxofón.",
   criteres: [
     {t: "Donne son nom et son âge (Me llamo…, Tengo … años)", pts: 1},
     {t: "Donne son anniversaire, où il habite et sa nationalité (Mi cumpleaños es el…, Vivo en…, Soy…)", pts: 1},
     {t: "Présente sa famille : ses frères et sœurs et ses parents, avec leurs prénoms (… se llaman …)", pts: 1},
     {t: "Dit ce qu'il aime (Me gusta…)", pts: 1},
     {t: "Écrit des phrases correctes en espagnol : verbes à la 1re personne (me llamo, tengo, vivo, soy) et mots du cours bien écrits", pts: 1}]},
  {id: "entrevista", unit: "pre", titre: "Les questions au nouvel élève",
   doc: `<p>Pablo, un nouvel élève, arrive d'Espagne dans ta classe. Il ne parle pas encore français.</p>`,
   consigne: `<p>Écris <b>en espagnol</b> les questions que tu lui poses pour savoir <b>comment il s'appelle</b>, <b>quel âge il a</b>, <b>où il habite</b> et <b>combien il a de frères et sœurs</b>.</p>`,
   modele: "¿Cómo te llamas? ¿Cuántos años tienes? ¿Dónde vives? ¿Cuántos hermanos tienes?",
   criteres: [
     {t: "Demande son nom : ¿Cómo te llamas? (ou ¿Cuál es tu nombre?)", pts: 1},
     {t: "Demande son âge : ¿Cuántos años tienes? (ou ¿Cuál es tu edad?)", pts: 1},
     {t: "Demande où il habite : ¿Dónde vives?", pts: 1},
     {t: "Demande combien il a de frères et sœurs : ¿Cuántos hermanos tienes?", pts: 1},
     {t: "Écrit chaque question avec ¿ au début et ? à la fin, et l'accent sur le mot interrogatif (Cómo, Cuántos, Dónde)", pts: 1}]},
  {id: "carta-pablo", unit: "gus", titre: "Le message de Pablo",
   doc: `<p lang="es">¡Hola! Me llamo Pablo. Tengo trece años y vivo en Madrid. Soy español. Tengo una hermana pequeña: se llama Lucía. Me gusta el saxofón y tengo un gato.<br>Y tú: ¿Cómo te llamas? ¿Cuántos años tienes? ¿Cuántos hermanos tienes? ¿Qué te gusta? ¿Tienes mascotas?</p>`,
   consigne: `<p>Ton correspondant espagnol t'écrit. <b>Réponds à chacune de ses questions</b> par une phrase complète en espagnol. Puis dis <b>en français</b> deux choses que tu as apprises sur Pablo.</p>`,
   modele: "Me llamo Léandre. Tengo trece años. Tengo un hermano y una hermana: se llaman Victor y Louise. A mí me gusta el baile clásico y el saxofón. No tengo mascotas.\nEn français : Pablo a treize ans comme moi, il habite à Madrid et il a une petite sœur, Lucía. Lui aussi aime le saxophone, et il a un chat.",
   criteres: [
     {t: "Répond à ¿Cómo te llamas? et ¿Cuántos años tienes? par des phrases complètes (Me llamo…, Tengo … años)", pts: 1},
     {t: "Répond à ¿Cuántos hermanos tienes? (Tengo un hermano…, No tengo hermanos…)", pts: 1},
     {t: "Répond à ¿Qué te gusta? (Me gusta…)", pts: 1},
     {t: "Répond à ¿Tienes mascotas? (Tengo un…, No tengo…)", pts: 1},
     {t: "Donne en français deux informations justes sur Pablo, tirées de son message", pts: 1}]},
  {id: "andrea", unit: "des", titre: "Présente Andrea",
   doc: `<p><b>Fiche d'Andrea</b> · 13 ans · habite à Madrid · espagnole · mince, cheveux noirs et longs, yeux marron · silencieuse, paresseuse mais travailleuse · un chat.</p>`,
   consigne: `<p>Présente Andrea <b>en espagnol</b>, en <b>5 ou 6 phrases</b>, à partir de sa fiche. Attention : tu parles d'elle, donc tu emploies <b>se llama, tiene, vive, es</b>.</p>`,
   modele: "Se llama Andrea. Tiene trece años y vive en Madrid. Es española. Es delgada, tiene el pelo negro y largo y tiene los ojos marrones. Es una chica callada, perezosa pero trabajadora. Tiene un gato.",
   criteres: [
     {t: "Donne son prénom, son âge et sa ville (Se llama…, Tiene … años, Vive en…)", pts: 1},
     {t: "Donne sa nationalité au féminin (Es española)", pts: 1},
     {t: "Décrit son physique (delgada, el pelo negro y largo, los ojos marrones)", pts: 1},
     {t: "Décrit son caractère (callada, perezosa pero trabajadora)", pts: 1},
     {t: "Parle d'elle à la 3e personne (se llama, tiene, vive, es) avec les adjectifs au féminin", pts: 1}]}
];

/* ---------- passage au moteur ---------- */
const spk = (s, cls = "btn small") => s ? speakBtn(s, ES, cls) : "";
const asQuiz = e => ({unit: UBY[e.n], key: strip(e.review), prompt: e.prompt, fig: e.fig, wide: e.wide, opts: e.opts, tip: e.tip,
  feedback: () => box(e.explain) + spk(e.say), review: e.review});
const asControl = e => Object.assign({unit: UBY[e.n], prompt: e.prompt, wide: e.wide, tip: e.tip, review: e.review,
  correction: () => (e.explain ? `<p class="label" style="margin-top:4px">Correction</p>${box(e.explain)}` : "") + spk(e.say),
  redo: () => asControl(e.redo())},
  e.fields ? {kind: "fields", fields: e.fields} : {kind: "choice", opts: e.opts});

const card = (n, front, back, label, say, tip) => ({unit: UBY[n],
  front: `<div class="fbody">${label ? `<span class="label">${esc(label)}</span>` : ""}<span class="card-q">${front}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
  back: `<div class="fbody left"><span class="card-a">${back}</span>${tip ? `<span class="tip">${esc(tip)}</span>` : ""}</div>`,
  extra: say ? spk(say, "btn") : undefined});
const pcCard = p => card(p.n, `« ${esc(p.fr)} »<br><span class="fine">Pose la question en espagnol, puis réponds-y.</span>`,
  `<span lang="es"><b>${esc(p.es)}</b>${p.alt ? `<br>ou <b>${esc(p.alt)}</b>` : ""}<br>→ ${esc(p.rep)}</span><br><span class="muted">${esc(p.repFr)}</span>${p.note ? `<br><span class="muted" lang="es">${esc(p.note)}</span>` : ""}`,
  `À savoir par cœur · ${SOURCE}`, `${p.es} ${p.rep}`);

function overview(sel){
  const ids = new Set(sel.map(u => u.id)), rows = [];
  for (const u of UNITS) {
    const ps = PBY(u.id);
    if (!ps.length || !ids.has(u.id)) continue;
    rows.push(`<div class="vt-grp">${tagOf(u.id)}</div>`);
    ps.forEach(p => rows.push(`<div class="vt-row" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><span class="b" lang="es">${esc(p.es)}${p.alt ? `<br>${esc(p.alt)}` : ""}<span class="fr">${esc(p.fr)}</span></span><span class="f" lang="es">${esc(p.rep)}</span></div>`));
  }
  if (!rows.length) return "";
  const all = PAR_COEUR.filter(p => ids.has(p.n)).map(p => `${p.es} ${p.rep}`).join(" ");
  return `<div class="sec-h"><p class="label">Les questions surlignées · à savoir par cœur</p>${spk(all)}</div>
    <div class="vt-wrap"><div class="vt">${rows.join("")}</div></div>`;
}

Revision.start({
  key: "leandre-espagnol-mi-presentacion-v1",
  title: "Mi presentación",
  subtitle: "Se présenter en espagnol",
  eyebrow: "Espagnol · Cours du 21 septembre",
  hand: "Les questions surlignées en bleu : par cœur !",
  groups: {
    "1": {name: "Me presento", cls: "l1", filter: "Moi"},
    "2": {name: "Mi familia", cls: "l2", filter: "Ma famille"},
    "3": {name: "Gustos y descripción", cls: "l3", filter: "Goûts et portrait"}
  },
  redaction: {items: REDAC, text: "4 sujets comme à l'évaluation : te présenter, poser les questions, répondre à un correspondant, présenter Andrea. Tu écris en espagnol (ou tu prends ta copie en photo), puis tu es corrigé critère par critère."},
  units: UNITS,
  allLabel: () => "Toute la leçon",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["la leçon", "Les 16 questions surlignées en bleu avec leurs réponses, puis le vocabulaire, à réviser chaque jour."],
    quiz: ["10 questions", "Les questions par cœur, leur sens, la bonne réponse, le vocabulaire, les nationalités."],
    control: ["noté sur 20", "Tu écris toi-même les questions et les mots en espagnol, comme à l'évaluation."]
  },
  overview,
  cards: pool => {
    const ids = pool.map(u => u.id);
    return [...PAR_COEUR.filter(p => ids.includes(p.n)).map(pcCard),
      ...COURS.filter(c => ids.includes(c.n)).map(c => card(c.n, esc(c.card), nl(c.a), "", c.say, c.tip))];
  },
  quiz: {count: 10, make: (pool, R, i) => {
    const n = R.weighted(pool).id, f = i % 5 < 2 ? G.parcoeur(n) : null;   // environ 4 questions sur 10 sur le « par cœur »
    return asQuiz(f || make(KQ[n], n, false));
  }},
  control: {
    lead: "14 questions : des questions à écrire en entier, des phrases du cours à compléter, des mots à écrire en espagnol. Chaque question compte autant.",
    note: "Les majuscules, la ponctuation et les articles (el, la, un…) ne comptent pas. Un accent oublié est accepté mais signalé : sur ta copie, il compte ! Le ¿ du début aussi.",
    size: () => 14,
    build: (pool, R) => {
      const ids = pool.map(u => u.id), withPc = ids.filter(n => PBY(n).length), items = [];
      const add = e => { if (e && !items.some(x => strip(x.review) === strip(e.review) || (e.pid && x.pid === e.pid))) { items.push(e); return true; } return false; };   // jamais deux fois la même question par cœur
      for (let s = 0; s < 3 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.ecrire(pick(withPc))); t++);    // 3 questions à écrire
      for (let s = 0; s < 3 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.trous(pick(withPc))); t++);     // 3 textes à trous
      for (let s = 0; s < 1 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.parcoeur(pick(withPc))); t++);
      let guard = 0;
      while (items.length < 14 && guard++ < 200) {
        const n = guard % 3 ? R.weighted(pool).id : ids[guard % ids.length];
        add(make(KC[n], n, true));
      }
      while (items.length < 14) items.push(make(KC[ids[0]], ids[0], true));
      return shuffle(items).map(asControl);
    }
  }
});
})();
