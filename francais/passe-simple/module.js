/* Module : Français · Conjugaison « Le passé simple ».
   Sources : pas de cours photographié pour ce module (demande de Damien, 22 octobre 2026).
   - Le bilan en rouge de la séance 9 du cahier (les temps du récit, séquence « Vivre au XIXe siècle »),
     repris mot pour mot : PAR_COEUR tps1 à tps5 (emploi du passé simple et de l'imparfait).
   - Les 12 verbes du tableau corrigé de la séance 9 (prendre, chanter, s'évanouir, savoir, mettre, être, avoir,
     découvrir, faire, croire, recevoir, retenir) font partie de la liste de verbes.
   - Les règles de formation (terminaisons des 3 groupes, accents, -cer et -ger) sont celles du programme de 4e :
     elles ne viennent pas du cahier (source « Règle de conjugaison »).
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";
const {esc, shuffle, pick, fold} = Revision;
/* « -ai », « -èrent »… : un « word joiner » invisible après le tiret, pour que la ligne ne se coupe pas entre « - » et la terminaison */
const nb = s => String(s).replace(/(^|[\s(>«])-(?=\p{L})/gu, "$1-\u2060");

/* ---------- notions ---------- */
const UNITS = [
  {id: "er", group: "1", name: "Les verbes en -er", sub: "-ai, -as, -a, -âmes, -âtes, -èrent (et aller)"},
  {id: "is", group: "1", name: "Les verbes en -is", sub: "Le 2e groupe (finir) et beaucoup du 3e (prendre, faire, voir…)"},
  {id: "us", group: "1", name: "Les verbes en -us", sub: "être, avoir, pouvoir, savoir, lire, courir, vivre…"},
  {id: "ins", group: "1", name: "Les verbes en -ins", sub: "venir, tenir et leurs familles"},
  {id: "pie", group: "1", name: "Les pièges", sub: "Accents, -cer et -ger, -ai ou -ais, -èrent"},
  {id: "emp", group: "2", name: "Passé simple ou imparfait ?", sub: "Premier plan, arrière-plan : le bilan de la séance 9"},
  {id: "rec", group: "2", name: "Le passé simple dans un récit", sub: "Repérer, trouver l'infinitif, réécrire au passé"}
].map(u => Object.assign(u, {name: nb(u.name), sub: nb(u.sub), tag: nb(u.name)}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- le « par cœur » ----------
   trous : mots à écrire au contrôle ; "-âmes" = une terminaison (orthographe exacte, accents tolérés),
   sinon un mot du cours (articles, pluriel et accents tolérés).
   pieges : [morceau de la phrase, remplacement] → une fausse version de même tournure pour le QCM */
const REGLE = "Règle de conjugaison", BILAN = "Bilan de la séance 9";
const PAR_COEUR = [
  {id: "er1", n: "er", source: REGLE, q: "Quelles sont les terminaisons du passé simple des verbes en -er ?",
   text: "Au passé simple, les verbes en -er prennent les terminaisons -ai, -as, -a, -âmes, -âtes, -èrent.", trous: ["-âmes", "-èrent"],
   pieges: [["-ai, -as, -a,", "-ais, -ais, -ait,"], ["-âmes, -âtes, -èrent", "-âmes, -âtes, -airent"], ["-ai, -as, -a, -âmes, -âtes", "-is, -is, -it, -îmes, -îtes"]]},
  {id: "is1", n: "is", source: REGLE, q: "Quels verbes se conjuguent en -is au passé simple, et avec quelles terminaisons ?",
   text: "Les verbes du 2e groupe et beaucoup de verbes du 3e groupe se conjuguent en -is : -is, -is, -it, -îmes, -îtes, -irent.", trous: ["-it", "-irent"],
   pieges: [["-is, -is, -it,", "-is, -it, -it,"], ["-îtes, -irent", "-îtes, -isèrent"], ["Les verbes du 2e groupe et beaucoup de verbes du 3e groupe", "Les verbes du 1er groupe et beaucoup de verbes du 2e groupe"]]},
  {id: "us1", n: "us", source: REGLE, q: "Quelles sont les terminaisons du passé simple en -us ?",
   text: "Beaucoup de verbes du 3e groupe se conjuguent en -us : -us, -us, -ut, -ûmes, -ûtes, -urent (je fus, j'eus, je pus).", trous: ["-ut", "-urent"],
   pieges: [["-us, -us, -ut,", "-ut, -ut, -ut,"], ["-ûtes, -urent", "-ûtes, -usèrent"], ["(je fus, j'eus, je pus)", "(je fis, je vis, je pris)"]]},
  {id: "ins1", n: "ins", source: REGLE, q: "Comment se conjuguent venir, tenir et leurs familles au passé simple ?",
   text: "Venir, tenir et les verbes de leur famille se conjuguent en -ins : -ins, -ins, -int, -înmes, -întes, -inrent.", trous: ["-int", "-inrent"],
   pieges: [["-ins, -ins, -int,", "-is, -is, -it,"], ["-întes, -inrent", "-întes, -irent"], ["-înmes, -întes", "-îmes, -îtes"]]},
  {id: "pie1", n: "pie", source: REGLE, q: "Que prennent toujours « nous » et « vous » au passé simple ?",
   text: "Au passé simple, nous et vous prennent toujours un accent circonflexe : nous chantâmes, vous finîtes.", trous: ["circonflexe"],
   pieges: [["un accent circonflexe", "un accent grave"], ["nous et vous", "je et tu"], ["toujours un accent circonflexe", "parfois un accent aigu"]]},
  {id: "pie2", n: "pie", source: REGLE, q: "Par quoi se termine toujours la 3e personne du pluriel au passé simple ?",
   text: "À la 3e personne du pluriel, le passé simple se termine toujours par -rent : ils chantèrent, ils finirent, ils furent, ils vinrent.", trous: ["-rent"],
   pieges: [["par -rent :", "par -aient :"], ["la 3e personne du pluriel", "la 1re personne du pluriel"], ["se termine toujours", "se termine rarement"]]},
  {id: "pie3", n: "pie", source: REGLE, q: "Avec « je », comment distinguer le passé simple et l'imparfait des verbes en -er ?",
   text: "Avec je, les verbes en -er se terminent par -ai au passé simple (je chantai) et par -ais à l'imparfait (je chantais).", trous: ["-ai", "-ais"],
   pieges: [["par -ai au passé simple (je chantai) et par -ais à l'imparfait (je chantais)", "par -ais au passé simple (je chantais) et par -ai à l'imparfait (je chantai)"],
            ["les verbes en -er", "les verbes en -ir"], ["Avec je", "Avec il"]]},
  {id: "pie4", n: "pie", source: REGLE, q: "Que se passe-t-il devant « a » pour les verbes en -cer et en -ger ?",
   text: "Devant a, les verbes en -cer prennent une cédille (il lança) et les verbes en -ger gardent le e (il mangea).", trous: ["cédille"],
   pieges: [["prennent une cédille (il lança)", "perdent leur c (il lansa)"], ["Devant a", "Devant e"], ["gardent le e (il mangea)", "perdent le e (il manga)"]]},

  {id: "tps1", n: "emp", source: BILAN, q: "Dans un récit, à quoi servent l'imparfait et le passé simple ?",
   text: "L'imparfait et le passé simple sont utilisés dans un récit pour faire la narration. Ils ont des emplois différents et complémentaires.", trous: ["narration", "complémentaires"],
   pieges: [["différents et complémentaires", "identiques et interchangeables"], ["pour faire la narration", "pour faire les dialogues"], ["L'imparfait et le passé simple", "Le présent et le futur"]]},
  {id: "tps2", n: "emp", source: BILAN, q: "Quand utilise-t-on le passé simple dans un récit ?",
   text: "Le passé simple est utilisé pour une action de premier plan et qui est limitée dans le temps. Il est utilisé pour relater les actions ponctuelles qui font progresser le récit.", trous: ["premier plan", "ponctuelles"],
   pieges: [["de premier plan", "d'arrière-plan"], ["limitée dans le temps", "qui dure longtemps"], ["les actions ponctuelles", "les descriptions"]]},
  {id: "tps3", n: "emp", source: BILAN, q: "Pour quelles autres actions utilise-t-on le passé simple ?",
   text: "On l'utilise aussi pour les actions successives qui s'enchaînent.", trous: ["successives"],
   pieges: [["les actions successives qui s'enchaînent", "les descriptions de personnages et de lieux"], ["les actions successives", "les actions habituelles"], ["qui s'enchaînent", "qui se répètent chaque jour"]]},
  {id: "tps4", n: "emp", source: BILAN, q: "Quand utilise-t-on l'imparfait dans un récit ?",
   text: "L'imparfait est utilisé pour les actions d'arrière-plan. Il peut s'agir de faire la description d'un objet, d'un personnage ou d'un lieu.", trous: ["arrière-plan", "description"],
   pieges: [["d'arrière-plan", "de premier plan"], ["la description", "la progression"], ["pour les actions d'arrière-plan", "pour les actions limitées dans le temps"]]},
  {id: "tps5", n: "emp", source: BILAN, q: "À quoi d'autre peut servir l'imparfait ?",
   text: "De plus, l'imparfait peut également servir pour des actions qui durent ou qui se répètent comme une habitude, ainsi que des actions en cours de déroulement.", trous: ["habitude", "déroulement"],
   pieges: [["qui durent ou qui se répètent", "qui sont brèves et uniques"], ["en cours de déroulement", "à venir dans le futur"], ["comme une habitude", "comme une rupture"]]}
];
const PBY = n => PAR_COEUR.filter(p => p.n === n);

/* ---------- conjugaison ---------- */
const PERS = ["je", "tu", "il", "nous", "vous", "ils"];
const ENDS = {er: ["ai", "as", "a", "âmes", "âtes", "èrent"], is: ["is", "is", "it", "îmes", "îtes", "irent"],
  us: ["us", "us", "ut", "ûmes", "ûtes", "urent"], ins: ["ins", "ins", "int", "înmes", "întes", "inrent"]};
const IMP = ["ais", "ais", "ait", "ions", "iez", "aient"];
const FAM = {er: "-ai, -as, -a, -âmes, -âtes, -èrent", is: "-is, -is, -it, -îmes, -îtes, -irent",
  us: "-us, -us, -ut, -ûmes, -ûtes, -urent", ins: "-ins, -ins, -int, -înmes, -întes, -inrent"};
const OTHER = {is: "us", us: "is", ins: "is"};   // la fausse famille la plus tentante

/* r = radical du passé simple ; pi = radical de l'imparfait ; r6 = radical devant -èrent, -ions, -iez (verbes en -cer, -ger) ;
   c = la fin de la phrase d'exemple (convient à toutes les personnes) ; key = verbe à connaître (carte) ;
   look = infinitifs qui ressemblent (pour « trouve l'infinitif ») ; x = pièges écrits à la main, personne par personne */
const er = (inf, c, o = {}) => { const r = inf.slice(0, -2); return Object.assign({inf, f: "er", g: 1, r, pi: r, c}, o); };
const g2 = (inf, c, o = {}) => { const r = inf.replace(/^s'/, "").slice(0, -2); return Object.assign({inf, f: "is", g: 2, r, pi: r + "iss", c}, o); };
const g3 = (inf, f, r, pi, c, o = {}) => Object.assign({inf, f, g: 3, r, pi, c}, o);
const VERBS = [
  er("chanter", "une chanson"), er("marcher", "jusqu'au port"), er("regarder", "la mer"), er("entrer", "dans la maison"),
  er("arriver", "au village"), er("tomber", "dans l'escalier"), er("trouver", "une vieille clé"), er("donner", "l'alerte"),
  er("crier", "très fort"), er("jouer", "aux cartes"), er("demander", "le chemin"), er("appeler", "les secours"),
  er("pleurer", "en silence"), er("sauter", "par la fenêtre"), er("écouter", "la radio"),
  er("aller", "au marché", {key: true, look: ["allumer", "avoir", "appeler"]}),
  er("lancer", "la balle", {r: "lanç", pi: "lanç", r6: "lanc"}), er("commencer", "le travail", {r: "commenç", pi: "commenç", r6: "commenc"}),
  er("avancer", "lentement", {r: "avanç", pi: "avanç", r6: "avanc"}), er("manger", "une pomme", {r: "mange", pi: "mange", r6: "mang"}),
  er("nager", "vers la plage", {r: "nage", pi: "nage", r6: "nag"}), er("plonger", "dans le lac", {r: "plonge", pi: "plonge", r6: "plong"}),

  g2("finir", "le repas"), g2("choisir", "un livre"), g2("réussir", "l'épreuve"), g2("saisir", "la corde"), g2("bondir", "hors du lit"),
  g2("obéir", "aussitôt"), g2("grandir", "très vite"), g2("réfléchir", "longtemps"), g2("rougir", "de honte"), g2("remplir", "le seau"),
  g2("s'évanouir", "de peur", {refl: true}),

  g3("prendre", "is", "pr", "pren", "le train", {key: true, look: ["prier", "prêter", "promettre"]}),
  g3("apprendre", "is", "appr", "appren", "la nouvelle"), g3("comprendre", "is", "compr", "compren", "la situation"),
  g3("mettre", "is", "m", "mett", "un manteau", {look: ["mentir", "manger", "mourir"]}), g3("promettre", "is", "prom", "promett", "de revenir"),
  g3("faire", "is", "f", "fais", "un vœu", {key: true, look: ["finir", "fuir", "être"]}),
  g3("dire", "is", "d", "dis", "la vérité", {look: ["durer", "devoir", "dormir"]}),
  g3("voir", "is", "v", "voy", "une lumière", {key: true, look: ["venir", "vouloir", "valoir"]}),
  g3("rire", "is", "r", "ri", "aux éclats"),
  g3("écrire", "is", "écriv", "écriv", "une lettre", {key: true, look: ["crier", "écouter", "écraser"]}),
  g3("partir", "is", "part", "part", "à l'aube"), g3("sortir", "is", "sort", "sort", "dans la rue"), g3("dormir", "is", "dorm", "dorm", "profondément"),
  g3("servir", "is", "serv", "serv", "le dîner"), g3("sentir", "is", "sent", "sent", "le danger"), g3("répondre", "is", "répond", "répond", "à la lettre"),
  g3("entendre", "is", "entend", "entend", "un cri"), g3("attendre", "is", "attend", "attend", "le signal"),
  g3("descendre", "is", "descend", "descend", "à la cave"), g3("perdre", "is", "perd", "perd", "la clé"), g3("suivre", "is", "suiv", "suiv", "le guide"),
  g3("ouvrir", "is", "ouvr", "ouvr", "la fenêtre"), g3("découvrir", "is", "découvr", "découvr", "un trésor"), g3("offrir", "is", "offr", "offr", "des fleurs"),
  g3("conduire", "is", "conduis", "conduis", "la charrette"), g3("construire", "is", "construis", "construis", "une cabane"),
  g3("éteindre", "is", "éteign", "éteign", "la bougie"), g3("craindre", "is", "craign", "craign", "le pire"), g3("peindre", "is", "peign", "peign", "un paysage"),
  g3("naître", "is", "naqu", "naiss", "dans un village", {key: true, look: ["nager", "nuire", "naviguer"]}),
  g3("vaincre", "is", "vainqu", "vainqu", "l'ennemi", {look: ["venir", "vendre", "vivre"]}),
  g3("s'asseoir", "is", "ass", "assey", "près du feu", {refl: true, look: ["s'arrêter", "assister", "s'assoupir"]}),
  g3("battre", "is", "batt", "batt", "le record"), g3("cueillir", "is", "cueill", "cueill", "des fleurs"),

  g3("être", "us", "f", "ét", "en retard", {key: true, look: ["faire", "fuir", "finir"],
    x: [["fut", "étais", "fûs"], ["fut", "étais", "fûs"], ["fus", "était", "fût"], ["fumes", "étions", "fûtes"], ["futes", "étiez", "fûmes"], ["fûrent", "étaient", "fusent"]]}),
  g3("avoir", "us", "e", "av", "peur", {key: true, look: ["être", "aller", "voir"],
    x: [["eut", "avais", "eu"], ["eut", "avais", "eu"], ["eu", "avait", "eût"], ["eumes", "avions", "eûtes"], ["eutes", "aviez", "eûmes"], ["eûrent", "avaient", "eurrent"]]}),
  g3("pouvoir", "us", "p", "pouv", "entrer", {key: true, look: ["prendre", "plaire", "pleuvoir"]}),
  g3("vouloir", "us", "voul", "voul", "partir", {key: true, look: ["voler", "valoir", "voir"]}),
  g3("savoir", "us", "s", "sav", "la vérité", {key: true, look: ["suivre", "sortir", "servir"]}),
  g3("devoir", "us", "d", "dev", "attendre", {look: ["dire", "durer", "dormir"]}),
  g3("lire", "us", "l", "lis", "le message", {look: ["lier", "lever", "luire"]}),
  g3("croire", "us", "cr", "croy", "l'histoire", {look: ["crier", "courir", "craindre"]}),
  g3("boire", "us", "b", "buv", "un verre d'eau", {look: ["battre", "bouger", "bondir"]}),
  g3("courir", "us", "cour", "cour", "vers la sortie", {look: ["couvrir", "coudre", "croire"]}),
  g3("recevoir", "us", "reç", "recev", "une lettre", {key: true, look: ["reprendre", "rendre", "revenir"]}),
  g3("apercevoir", "us", "aperç", "apercev", "un bateau"),
  g3("vivre", "us", "véc", "viv", "à la campagne", {key: true, look: ["voir", "vaincre", "venir"]}),
  g3("connaître", "us", "conn", "connaiss", "la réponse", {look: ["conduire", "convaincre", "conquérir"]}),
  g3("disparaître", "us", "dispar", "disparaiss", "dans la nuit"),
  g3("mourir", "us", "mour", "mour", "de froid", {look: ["courir", "mordre", "mûrir"]}),
  g3("se taire", "us", "t", "tais", "aussitôt", {refl: true, look: ["se tenir", "tirer", "se terrer"]}),

  g3("venir", "ins", "v", "ven", "en courant", {key: true, look: ["vendre", "voir", "vaincre"]}),
  g3("tenir", "ins", "t", "ten", "parole", {look: ["taire", "tendre", "tirer"]}),
  g3("revenir", "ins", "rev", "reven", "le soir même"), g3("parvenir", "ins", "parv", "parven", "au sommet"),
  g3("obtenir", "ins", "obt", "obten", "une récompense"), g3("retenir", "ins", "ret", "reten", "la porte"),
  g3("intervenir", "ins", "interv", "interven", "aussitôt"),
  g3("se souvenir", "ins", "souv", "souven", "de tout", {refl: true, look: ["se soulever", "souffrir", "sourire"]})
];
const VBY = Object.fromEntries(VERBS.map(v => [v.inf, v]));
const form = (v, k) => (k === 5 && v.r6 ? v.r6 : v.r) + ENDS[v.f][k];
const impf = (v, k) => ((k === 3 || k === 4) && v.r6 ? v.r6 : v.pi) + IMP[k];
const VOW = /^[aeiouyhâàéèêëîïôûù]/i;
const REFL = ["me", "te", "se", "nous", "vous", "se"];
/* sujet (et pronom réfléchi) devant une forme, avec l'élision : j'eus, je m'assis, elle s'assit */
function subj(v, k, f, p){
  const pr = p || PERS[k];
  if (v.refl) { const rp = REFL[k]; return `${pr} ${VOW.test(f) && rp.length === 2 ? rp[0] + "'" : rp + " "}`; }
  return pr === "je" && VOW.test(f) ? "j'" : pr + " ";
}
const full = (v, k, f = form(v, k), p) => subj(v, k, f, p) + f;
const pron = k => k === 2 ? pick(["il", "elle", "on"]) : k === 5 ? pick(["ils", "elles"]) : PERS[k];
const conjList = (v, hi = -1) => PERS.map((_, k) => k === hi ? `<b>${esc(full(v, k))}</b>` : esc(full(v, k))).join(", ");

/* pièges plausibles pour la personne k : imparfait, mauvaise personne, terminaisons d'une autre famille */
function traps(v, k){
  if (v.x) return v.x[k];
  const r = v.r, r6 = v.r6 || v.r, p = v.pi, E = ENDS[v.f];
  if (v.f === "er") return [
    [impf(v, 0), r + "a", r + "as"], [impf(v, 1), r + "a", r + "at"], [r + "at", impf(v, 2), r + "as"],
    [impf(v, 3), r6 + "èmes", r + "âme"], [impf(v, 4), r6 + "ètes", r + "âte"], [impf(v, 5), r + "airent", r6 + "irent"]][k];
  const O = ENDS[OTHER[v.f]];
  return [
    [r + E[2], impf(v, 0), p + "ai", p + O[0]], [r + E[2], impf(v, 1), p + "as"], [r + E[0], impf(v, 2), p + "a", p + O[2]],
    [impf(v, 3), p + "âmes", r + E[4]], [impf(v, 4), p + "âtes", r + E[3]], [impf(v, 5), p + "èrent", p + O[5]]][k];
}
const three = (good, list) => {
  const u = [...new Set(list)].filter(t => t && t !== good);
  return u.length > 3 ? [u[0], ...shuffle(u.slice(1)).slice(0, 2)] : u;
};

/* ---------- passé simple ou imparfait : [phrase, infinitif, passé simple, imparfait, temps attendu, emploi] ---------- */
const EMP = {PONCT: "une action ponctuelle de premier plan, qui fait progresser le récit", SUCC: "des actions successives qui s'enchaînent (premier plan)",
  LIM: "une action de premier plan, limitée dans le temps", DESC: "une description (arrière-plan) : le décor, un personnage, un lieu",
  HAB: "une action qui se répète comme une habitude (arrière-plan)", COURS: "une action en cours de déroulement (arrière-plan)"};
const CLOSE = {PONCT: ["SUCC", "LIM"], SUCC: ["PONCT", "LIM"], LIM: ["PONCT", "SUCC"], DESC: ["COURS"], COURS: ["DESC"], HAB: []};
const EMPL = [
  ["La forêt {} sombre et silencieuse.", "être", "fut", "était", "IMP", "DESC"],
  ["Le vieux marin {} une longue barbe blanche.", "avoir", "eut", "avait", "IMP", "DESC"],
  ["Les murs de la chambre {} couverts de vieux tableaux.", "être", "furent", "étaient", "IMP", "DESC"],
  ["Dans la cheminée, un grand feu {}.", "brûler", "brûla", "brûlait", "IMP", "DESC"],
  ["La princesse {} de longs cheveux noirs.", "porter", "porta", "portait", "IMP", "DESC"],
  ["Chaque soir, le gardien {} les grilles du parc.", "fermer", "ferma", "fermait", "IMP", "HAB"],
  ["Tous les dimanches, nous {} chez nos grands-parents.", "déjeuner", "déjeunâmes", "déjeunions", "IMP", "HAB"],
  ["D'habitude, Léa {} le bus de huit heures.", "prendre", "prit", "prenait", "IMP", "HAB"],
  ["Autrefois, les enfants {} à pied jusqu'à l'école.", "aller", "allèrent", "allaient", "IMP", "HAB"],
  ["Souvent, le vieil homme {} des histoires aux enfants.", "raconter", "raconta", "racontait", "IMP", "HAB"],
  ["Les invités {} quand un cri retentit.", "danser", "dansèrent", "dansaient", "IMP", "COURS"],
  ["Je {} tranquillement lorsque le téléphone sonna.", "lire", "lus", "lisais", "IMP", "COURS"],
  ["Pendant que Paul {} la vaisselle, sa sœur arriva.", "faire", "fit", "faisait", "IMP", "COURS"],
  ["Nous {} dans la forêt quand l'orage éclata.", "marcher", "marchâmes", "marchions", "IMP", "COURS"],
  ["Soudain, un éclair {} le ciel.", "déchirer", "déchira", "déchirait", "PS", "PONCT"],
  ["Tout à coup, le chien {} sur le voleur.", "bondir", "bondit", "bondissait", "PS", "PONCT"],
  ["Un matin, un étranger {} au village.", "arriver", "arriva", "arrivait", "PS", "PONCT"],
  ["Je lisais tranquillement lorsque le téléphone {}.", "sonner", "sonna", "sonnait", "PS", "PONCT"],
  ["Les invités dansaient quand un cri {}.", "retentir", "retentit", "retentissait", "PS", "PONCT"],
  ["Brusquement, l'orage {}.", "éclater", "éclata", "éclatait", "PS", "PONCT"],
  ["Il ouvrit la porte, {} la tête et appela son frère.", "passer", "passa", "passait", "PS", "SUCC"],
  ["Elle se leva, prit son manteau et {}.", "sortir", "sortit", "sortait", "PS", "SUCC"],
  ["Le loup {} la porte, entra et se jeta sur la grand-mère.", "pousser", "poussa", "poussait", "PS", "SUCC"],
  ["Ils {} du train, traversèrent la place et entrèrent à l'hôtel.", "descendre", "descendirent", "descendaient", "PS", "SUCC"],
  ["Nous {} nos sacs, puis nous partîmes aussitôt.", "prendre", "prîmes", "prenions", "PS", "SUCC"],
  ["Ce jour-là, il {} deux heures sous la pluie, puis il rentra.", "attendre", "attendit", "attendait", "PS", "LIM"],
  ["La tempête {} trois jours, puis le calme revint.", "durer", "dura", "durait", "PS", "LIM"]
];
const TNAME = {PS: "passé simple", IMP: "imparfait"}, TART = {PS: "le passé simple", IMP: "l'imparfait"};

/* ---------- passages : [verbe|p] = passé simple, [verbe|i] = imparfait ; un seul verbe différent des autres ---------- */
const PASSAGES = [
  "La nuit [tombait|i]. Le vent [soufflait|i] dans les arbres. Soudain, une silhouette [apparut|p] au bout du chemin. Elle [avançait|i] lentement.",
  "Le marquis [ouvrit|p] la porte, [salua|p] ses invités et les [conduisit|p] au salon, où un grand feu [brûlait|i].",
  "Chaque matin, Jules [partait|i] à la mine. Il [marchait|i] dans le froid et [saluait|i] ses camarades. Mais ce jour-là, il [entendit|p] un grondement.",
  "Elle [prit|p] la lettre, la [lut|p] deux fois, puis elle [éclata|p] en sanglots. Dehors, la pluie [tombait|i] toujours.",
  "La salle [brillait|i] de mille bougies. Les dames [portaient|i] des robes de soie et les musiciens [jouaient|i] une valse. Tout à coup, l'orchestre [se tut|p].",
  "Le loup [frappa|p] à la porte. La grand-mère, qui [dormait|i], [se réveilla|p] et lui [ouvrit|p].",
  "Les mineurs [travaillaient|i] dans une chaleur de fournaise. L'air [était|i] irrespirable et l'eau [suintait|i] des parois. Brusquement, une galerie [s'effondra|p].",
  "Nous [arrivâmes|p] au sommet, [posâmes|p] nos sacs et [admirâmes|p] la vallée qui [s'étendait|i] à nos pieds."
];
const parsePassage = s => { const vs = []; const html = esc(s).replace(/\[([^\]|]+)\|([pi])\]/g, (_, w, t) => { vs.push([w.replace(/&#39;/g, "'"), t]); return `<u>${w}</u>`; }); return {html, vs}; };

/* ---------- réécrire au passé simple : [phrase au présent, verbe entre accolades], bonne forme, 3 pièges ---------- */
const TRANSPO = [
  ["Le chevalier {monte} sur son cheval.", "monta", ["montait", "montat", "montas"]],
  ["La sorcière {prend} sa baguette.", "prit", ["prenait", "prena", "pris"]],
  ["Les enfants {voient} une lumière au loin.", "virent", ["voyaient", "voyèrent", "vurent"]],
  ["Nous {faisons} un grand feu.", "fîmes", ["faisions", "faisâmes", "fimes"]],
  ["Le roi {vient} au château.", "vint", ["venait", "venit", "vit"]],
  ["Vous {êtes} en retard.", "fûtes", ["étiez", "futes", "fûmes"]],
  ["Elle {a} peur.", "eut", ["avait", "eu", "avit"]],
  ["Les soldats {peuvent} enfin entrer.", "purent", ["pouvaient", "pouvèrent", "pûrent"]],
  ["Tu {lis} la lettre.", "lus", ["lisais", "lisas", "lut"]],
  ["Le prince {écrit} un poème.", "écrivit", ["écrivait", "écriva", "écrivut"]],
  ["Ils {boivent} de l'eau fraîche.", "burent", ["buvaient", "buvèrent", "boivèrent"]],
  ["Elles {mangent} une soupe.", "mangèrent", ["mangeaient", "mangeèrent", "mangairent"]],
  ["Je {reçois} une lettre.", "reçus", ["recevais", "recevis", "reçut"]],
  ["Le chat {court} vers le jardin.", "courut", ["courait", "courit", "coura"]],
  ["Nous {lançons} la balle.", "lançâmes", ["lancions", "lancâmes", "lançames"]],
  ["On {sait} enfin la vérité.", "sut", ["savait", "savit", "sus"]],
  ["Le marchand {ouvre} sa boutique.", "ouvrit", ["ouvrait", "ouvra", "ouvrut"]],
  ["Je {vais} au marché.", "allai", ["allais", "alla", "allas"]],
  ["Les loups {tiennent} conseil.", "tinrent", ["tenaient", "tenèrent", "tenirent"]],
  ["Elle {naît} dans un petit village.", "naquit", ["naissait", "naissa", "naîtit"]]
];

/* ---------- mots qui annoncent un temps ---------- */
const IND_PS = ["soudain", "tout à coup", "brusquement", "un jour", "ce matin-là", "aussitôt"];
const IND_IMP = ["chaque soir", "d'habitude", "tous les jours", "souvent", "autrefois", "chaque matin"];

/* ---------- questions de cours : carte + QCM (o[0] = bonne réponse) ---------- */
const COURS = [
  {n: "er", card: "Comment s'écrit « il » au passé simple pour un verbe en -er ?", a: "Il se termine par -a, sans t ni s.\nEx. : il chanta, elle marcha, on arriva.",
   q: "Passé simple de « marcher » avec « elle » :", o: ["elle marcha", "elle marchat", "elle marchas", "elle marchait"]},
  {n: "er", card: "« Aller » est irrégulier. Comment se conjugue-t-il au passé simple ?", a: "Comme un verbe en -er :\nj'allai, tu allas, il alla, nous allâmes, vous allâtes, ils allèrent.",
   q: "Passé simple de « aller » avec « ils » :", o: ["ils allèrent", "ils allaient", "ils allirent", "ils allairent"]},
  {n: "is", card: "Quels verbes se conjuguent en -is au passé simple ?", a: "Tous les verbes du 2e groupe (finir, choisir, réussir…) et beaucoup de verbes du 3e groupe : prendre, mettre, faire, dire, voir, partir, écrire, ouvrir, naître…",
   q: "Lequel de ces verbes se conjugue en -is au passé simple ?", o: ["mettre (je mis)", "pouvoir (je pus)", "venir (je vins)", "lire (je lus)"]},
  {n: "is", card: "Comment s'écrit « il » pour les verbes en -is ?", a: "-it, avec un t : il prit, il finit, il fit, il vit, il naquit.",
   q: "Passé simple de « prendre » avec « il » :", o: ["il prit", "il pris", "il prenait", "il prena"]},
  {n: "us", card: "Quels verbes courants se conjuguent en -us ?", a: "être (je fus), avoir (j'eus), pouvoir (je pus), vouloir (je voulus), savoir (je sus), devoir (je dus), lire (je lus), croire (je crus), boire (je bus), courir (je courus), vivre (je vécus), recevoir (je reçus), connaître (je connus)…",
   q: "Lequel de ces verbes se conjugue en -us au passé simple ?", o: ["courir (je courus)", "partir (je partis)", "prendre (je pris)", "tenir (je tins)"]},
  {n: "us", card: "Pourquoi « recevoir » prend-il une cédille au passé simple ?", a: "Devant u, le c doit garder le son [s] : il faut une cédille.\nje reçus, il reçut, ils reçurent (de même : apercevoir → il aperçut).",
   q: "Passé simple de « apercevoir » avec « il » :", o: ["il aperçut", "il apercut", "il apercevit", "il aperçoit"]},
  {n: "us", card: "Comment s'écrit « il » pour les verbes en -us ?", a: "-ut, avec un t : il fut, il eut, il put, il sut, il lut, il vécut.",
   q: "Passé simple de « pouvoir » avec « il » :", o: ["il put", "il pus", "il pouvit", "il pouvait"]},
  {n: "ins", card: "Quels verbes se conjuguent en -ins ?", a: "venir, tenir et leurs familles : revenir, devenir, se souvenir, parvenir, retenir, obtenir, appartenir…",
   q: "Lequel de ces verbes se conjugue en -ins au passé simple ?", o: ["obtenir", "finir", "courir", "partir"]},
  {n: "ins", card: "Venir et tenir : que se passe-t-il avec « nous » et « vous » ?", a: "Le n reste devant la terminaison, et l'accent circonflexe se met sur le i :\nnous vînmes, vous vîntes, nous tînmes, vous tîntes.",
   q: "Passé simple de « venir » avec « nous » :", o: ["nous vînmes", "nous vîmes", "nous venîmes", "nous vinmes"]},
  {n: "pie", card: "« Il finit » : présent ou passé simple ?", a: "Les deux ! Au singulier, finir (et tout le 2e groupe), dire ou rire ont la même forme au présent et au passé simple.\nOn regarde le contexte, ou on met au pluriel : ils finissent (présent), ils finirent (passé simple).",
   q: "Laquelle de ces formes est forcément au passé simple ?", o: ["ils finirent", "il finit", "je finis", "tu finis"]},
  {n: "pie", card: "Comment savoir s'il faut écrire « je chantai » ou « je chantais » ?", a: "Remplace je par il :\n« il chanta » → passé simple → je chantai\n« il chantait » → imparfait → je chantais",
   q: "« Soudain, je … un cri. » On dirait « il poussa ». J'écris donc :", o: ["je poussai", "je poussais", "je poussa", "je poussas"]},
  {n: "pie", card: "Un verbe du 3e groupe peut-il se terminer par -èrent ?", a: "Non : -èrent est réservé aux verbes en -er (et à aller).\nils prirent, ils virent, ils vinrent… jamais « ils prenèrent ».",
   q: "Passé simple de « voir » avec « ils » :", o: ["ils virent", "ils voyèrent", "ils voyaient", "ils vurent"]},
  {n: "pie", card: "Comment s'écrivent les verbes en -cer au passé simple ?", a: "ç devant a : je lançai, il commença, nous avançâmes.\nMais c devant è : ils lancèrent.",
   q: "Passé simple de « commencer » avec « ils » :", o: ["ils commencèrent", "ils commençèrent", "ils commençaient", "ils commencairent"]},
  {n: "pie", card: "Comment s'écrivent les verbes en -ger au passé simple ?", a: "On garde le e devant a : je mangeai, il nagea, nous plongeâmes.\nMais pas devant è : ils mangèrent.",
   q: "Passé simple de « nager » avec « il » :", o: ["il nagea", "il naga", "il nageat", "il nagait"]},
  {n: "emp", card: "Quels mots annoncent souvent une action au passé simple ?", a: "Les mots d'une action soudaine ou d'une succession : soudain, tout à coup, brusquement, un jour, ce matin-là, puis, alors, enfin.",
   q: "Lequel de ces mots annonce plutôt une action au passé simple ?", o: ["tout à coup", "chaque soir", "d'habitude", "autrefois"]},
  {n: "emp", card: "Quels mots annoncent souvent l'imparfait ?", a: "Les mots de l'habitude ou de la durée : chaque jour, tous les soirs, souvent, d'habitude, autrefois, pendant que.",
   q: "Lequel de ces mots annonce plutôt l'imparfait ?", o: ["tous les soirs", "soudain", "brusquement", "ce matin-là"]},
  {n: "emp", card: "« Je lisais quand le téléphone sonna » : que montre chaque temps ?", a: "« lisais » (imparfait) : l'action en cours, à l'arrière-plan.\n« sonna » (passé simple) : l'action soudaine qui l'interrompt et fait progresser le récit.",
   q: "Dans « Je lisais quand le téléphone sonna », quelle action fait progresser le récit ?", o: ["sonna", "lisais", "les deux", "aucune des deux"]},
  {n: "emp", card: "Dans quels textes trouve-t-on surtout le passé simple ?", a: "À l'écrit, dans les récits : romans, contes, nouvelles, récits historiques.\nÀ l'oral, on emploie plutôt le passé composé.",
   q: "À l'oral, quel temps emploie-t-on plutôt à la place du passé simple ?", o: ["le passé composé", "l'imparfait", "le futur", "le plus-que-parfait"]},
  {n: "rec", card: "Comment reconnaît-on un verbe au passé simple ?", a: "À ses terminaisons :\nau singulier -a, -it, -ut, -int (il chanta, il prit, il fut, il vint) ;\nau pluriel -èrent, -irent, -urent, -inrent.",
   q: "Lequel de ces verbes est au passé simple ?", o: ["il courut", "il courait", "il court", "il courra"]},
  {n: "rec", card: "Comment trouver l'infinitif d'un verbe au passé simple ?", a: "On cherche le verbe dont il vient, en pensant aux formes irrégulières :\nil fit → faire · il fut → être · il eut → avoir\nil vit → voir · il vint → venir · il naquit → naître",
   q: "« il fit » vient du verbe…", o: ["faire", "finir", "être", "fuir"]},
  {n: "rec", card: "« Il vit » : voir ou vivre ?", a: "Au passé simple, « il vit » vient de voir : il vit une lumière.\nLe passé simple de vivre est « il vécut ».\n(Mais « il vit » est aussi le présent de vivre !)",
   q: "Quel est le passé simple de « vivre » avec « il » ?", o: ["il vécut", "il vit", "il vivit", "il vivut"]},
  {n: "rec", card: "Comment réécrire un récit du présent au passé ?", a: "Les actions de premier plan passent au passé simple ; le décor et les actions qui durent ou se répètent passent à l'imparfait.\nEx. : Il pleut. Paul ouvre la porte. → Il pleuvait. Paul ouvrit la porte.",
   q: "« La nuit tombe. Soudain, un cri retentit. » Au passé, cela donne :", o: ["La nuit tombait. Soudain, un cri retentit.", "La nuit tomba. Soudain, un cri retentissait.", "La nuit tombait. Soudain, un cri retentissait.", "La nuit tomba. Soudain, un cri retentissa."]}
];

/* ---------- vrai ou faux ---------- */
const VF = [
  ["Au passé simple, on écrit « il chantat ».", false, "er", "Non : il chanta, sans t ni s."],
  ["« Aller » se conjugue au passé simple comme un verbe en -er.", true, "er", "Oui : j'allai, il alla, ils allèrent."],
  ["Les verbes en -er font « -èrent » avec ils.", true, "er", "Oui : ils chantèrent, ils allèrent, ils mangèrent."],
  ["Tous les verbes du 2e groupe se conjuguent en -is au passé simple.", true, "is", "Oui : je finis, il choisit, ils réussirent."],
  ["Le passé simple de « voir » avec « ils » est « ils voyèrent ».", false, "is", "Non : ils virent."],
  ["Le passé simple de « naître » avec « il » est « il naquit ».", true, "is", "Oui : je naquis, il naquit, ils naquirent."],
  ["Le passé simple de « faire » avec « il » est « il faisa ».", false, "is", "Non : il fit."],
  ["Le passé simple de « être » avec « il » est « il fut ».", true, "us", "Oui : je fus, il fut, nous fûmes, ils furent."],
  ["« Courir » se conjugue en -is : il courit.", false, "us", "Non : en -us : il courut."],
  ["Le passé simple de « vivre » avec « il » est « il vivit ».", false, "us", "Non : il vécut."],
  ["Le passé simple de « recevoir » avec « il » est « il reçut ».", true, "us", "Oui, avec une cédille devant u."],
  ["« Venir » se conjugue en -ins : il vint.", true, "ins", "Oui : je vins, il vint, nous vînmes, ils vinrent."],
  ["Le passé simple de « tenir » avec « ils » est « ils tenirent ».", false, "ins", "Non : ils tinrent."],
  ["Au passé simple, nous et vous prennent un accent circonflexe.", true, "pie", "Oui : nous chantâmes, vous finîtes, nous fûmes, vous vîntes."],
  ["« Il finit » peut être au présent ou au passé simple.", true, "pie", "Oui : même forme au singulier. Au pluriel : ils finissent (présent), ils finirent (passé simple)."],
  ["On écrit « ils lançèrent ».", false, "pie", "Non : pas de cédille devant e : ils lancèrent."],
  ["Un verbe du 3e groupe peut se terminer par -èrent.", false, "pie", "Non : -èrent est réservé aux verbes en -er (ils prirent, ils virent)."],
  ["Le passé simple sert surtout à décrire les lieux et les personnages.", false, "emp", "Non : c'est l'imparfait (arrière-plan). Le passé simple sert aux actions de premier plan."],
  ["L'imparfait peut exprimer une habitude.", true, "emp", "Oui : « Tous les matins, il allait nager avant le travail. »"],
  ["Le passé simple exprime des actions ponctuelles qui font progresser le récit.", true, "emp", "Oui : c'est le premier plan du récit."],
  ["Dans « Il dormait quand l'orage éclata », « éclata » est à l'arrière-plan.", false, "emp", "Non : « éclata » (passé simple) est l'action de premier plan ; « dormait » (imparfait) est l'arrière-plan."],
  ["« il fit » est le passé simple de « faire ».", true, "rec", "Oui : je fis, il fit, ils firent."],
  ["« il fut » est le passé simple de « faire ».", false, "rec", "Non : de « être ». Faire → il fit."],
  ["Le passé simple s'emploie surtout dans les récits écrits.", true, "rec", "Oui : romans, contes, nouvelles. À l'oral, on dit plutôt le passé composé."],
  ["« ils eurent » est le passé simple de « avoir ».", true, "rec", "Oui : j'eus, il eut, nous eûmes, ils eurent."]
];

/* ---------- outils ---------- */
const lowq = s => String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/œ/g, "oe").replace(/\s+/g, " ").trim();
const PRON = /^((je|tu|il|elle|on|nous|vous|ils|elles|me|te|se)\s+|(j|m|t|s)\s*')+/;
const bare = v => lowq(v).replace(/[.!?…]+$/, "").replace(PRON, "").trim();
/* forme conjuguée : l'orthographe compte, accents et cédille compris */
function formCheck(good, other){
  return v => {
    const a = bare(v), g = lowq(good);
    if (a === g) return {ok: true, fix: "✓"};
    if (!a) return {ok: false, fix: `→ ${good}`};
    if (other && a === lowq(other.form)) return {ok: false, fix: `→ ${good} (${other.why})`};
    if (fold(a) === fold(g)) return {ok: false, fix: `→ ${good} : attention ${/ç/.test(good) && !/ç/.test(a) ? "à la cédille" : "à l'accent"} !`};
    return {ok: false, fix: `→ ${good}`};
  };
}
/* mot du cours : accents, articles et pluriel tolérés ; terminaison (« -âmes ») : accents tolérés seulement */
const clean = s => fold(lowq(s)).replace(/-/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const noArt = s => s.replace(/^(l|le|la|les|un|une|des|d|de|du) /, "").replace(/^accent /, "").replace(/s$/, "");
const trouOk = (t, v) => { const a = clean(String(v).replace(/'/g, "' ")), g = clean(t); return !!a && (t.startsWith("-") ? a === g : noArt(a) === noArt(g)); };
const infKey = s => fold(lowq(s)).replace(/^(se |s')/, "").replace(/[^a-z]/g, "");
const strip = h => String(h).replace(/<[^>]+>/g, "").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const tagOf = n => `<span class="tag ${({1: "l1", 2: "l2"})[UBY[n].group]}">${esc(UBY[n].name)}</span>`;
const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;
const nl = s => esc(s).replace(/\n/g, "<br>");
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const sample = (arr, k) => shuffle(arr).slice(0, k);
const BLANK = `<b class="blank" style="letter-spacing:1px">_____</b>`;
const wordRe = w => new RegExp(`(^|[^\\p{L}\\d])(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=[^\\p{L}\\d]|$)`, "gu");
const pcLabel = p => `<span class="label">À savoir par cœur · ${esc(p.source)}</span>`;
const fam = n => VERBS.filter(v => v.f === n);
const verbOf = n => n === "er" ? pick(fam("er")) : pick(fam(n));
const CG = VERBS.filter(v => v.r6);
const INF_POOL = VERBS.filter(v => v.look);

/* ---------- générateurs : {n, prompt, opts | fields, explain, review, redo} ---------- */
const G = {
  parcoeur(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), tr = [...new Set(p.pieges.map(([a, b]) => p.text.replace(a, b)))].filter(t => t !== p.text);
    return {n, prompt: `${pcLabel(p)}<br>${esc(p.q)}`, wide: true,
      opts: shuffle([{t: p.text, ok: true}, ...tr.map(t => ({t, ok: false}))]),
      explain: "La bonne réponse est la phrase du cours, mot pour mot : c'est elle qu'il faut savoir redire.",
      review: rev(n, p.q, p.text), redo: () => G.parcoeur(n)};
  },
  trous(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), tr = p.trous.slice(0, 3);
    let html = esc(p.text), all = esc(p.text);
    tr.forEach((t, i) => {
      const w = esc(t.replace(/^-/, ""));
      html = html.replace(wordRe(w), `$1<b class="blank">…(${i + 1})…</b>`);
      all = all.replace(wordRe(w), `$1<b>${w}</b>`);
    });
    return {n, prompt: `${pcLabel(p)}<br>Complète la phrase du cours :<br><span class="q">${html}</span>`, wide: true,
      fields: tr.map((t, i) => ({label: tr.length > 1 ? `Mot ${i + 1}` : "Le mot", lang: "fr", check: v => { const ok = trouOk(t, v); return {ok, fix: ok ? "✓" : `→ ${t.replace(/^-/, "")}`}; }})),
      explain: all, review: rev(n, p.q, p.text), redo: () => G.trous(n)};
  },
  cours(n){
    const pool = COURS.filter(c => c.n === n);
    if (!pool.length) return null;
    const c = pick(pool);
    return {n, prompt: esc(c.q), wide: true, opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), explain: nl(c.a),
      review: rev(n, c.q, c.o[0]), redo: () => G.cours(n)};
  },
  vf(n){
    const pool = VF.filter(v => v[2] === n);
    if (!pool.length) return null;
    const [s, truth, , why] = pick(pool);
    return {n, prompt: `Vrai ou faux ?<br><b>${esc(s)}</b>`, opts: [{t: "Vrai", ok: truth}, {t: "Faux", ok: !truth}], explain: esc(why),
      review: rev(n, s, truth ? "Vrai" : "Faux"), redo: () => G.vf(n)};
  },
  /* conjuguer dans une phrase : QCM (sujet compris) ou forme à écrire */
  conj(n, typed, vv, kk){
    if (!["er", "is", "us", "ins", "pie"].includes(n)) return null;
    const v = vv || verbOf(n), k = kk ?? Math.floor(Math.random() * 6), p = pron(k), good = form(v, k);
    const base = {n, review: rev(n, `Passé simple de « ${v.inf} » avec « ${p} »`, full(v, k, good, p)), redo: () => G.conj(n, typed)};
    if (typed) {
      const s = subj(v, k, good, p);
      return Object.assign(base, {prompt: `Écris le verbe <b>« ${esc(v.inf)} »</b> au passé simple :<br><span class="q">${esc(cap(s))}${BLANK} ${esc(v.c)}.</span>`,
        explain: "", fields: [{label: `${v.inf} · ${s.trim()}`, lang: "fr", check: formCheck(good, k === 0 && v.f === "er" ? {form: impf(v, 0), why: "-ais, c'est l'imparfait"} : null)}]});
    }
    const bad = three(good, traps(v, k));
    return Object.assign(base, {prompt: `Quelle forme complète la phrase au passé simple ?<br><span class="q">${BLANK} ${esc(v.c)}. <i>(${esc(v.inf)})</i></span>`,
      opts: shuffle([{t: cap(full(v, k, good, p)), ok: true}, ...bad.map(t => ({t: cap(full(v, k, t, p)), ok: false}))]),
      explain: `Au passé simple : ${conjList(v, k)}.`});
  },
  /* tout le verbe, à toutes les personnes (contrôle) */
  conjAll(n){
    if (!["er", "is", "us", "ins"].includes(n)) return null;
    const pool = fam(n).filter(v => v.key || v.f === "ins" || v.f === "er" || v.g === 2), v = pick(pool);
    return {n, prompt: `Conjugue <b>« ${esc(v.inf)} »</b> au passé simple, à toutes les personnes.`, explain: "",
      fields: PERS.map((_, k) => ({label: subj(v, k, form(v, k)).trim(), lang: "fr", check: formCheck(form(v, k))})),
      review: rev(n, `Passé simple de « ${v.inf} »`, PERS.map((_, k) => full(v, k)).join(", ")), redo: () => G.conjAll(n)};
  },
  famille(n){
    if (!["er", "is", "us", "ins"].includes(n)) return null;
    const v = n === "er" ? VBY["aller"] : pick(fam(n)), keys = ["er", "is", "us", "ins"];
    return {n, prompt: `Au passé simple, <b>« ${esc(v.inf)} »</b> se conjugue avec les terminaisons…`, wide: true,
      opts: keys.map(f => ({t: FAM[f], ok: f === v.f})), explain: `${conjList(v)}.`,
      review: rev(n, `Terminaisons de « ${v.inf} » au passé simple`, FAM[v.f]), redo: () => G.famille(n)};
  },
  accent(n, typed){
    if (n !== "pie") return null;
    const v = pick(VERBS), k = pick([3, 4]), good = form(v, k);
    if (typed) return Object.assign(G.conj("pie", true, v, k), {redo: () => G.accent(n, typed)});
    const noAcc = good.replace(/[âîû]/g, c => ({"â": "a", "î": "i", "û": "u"})[c]);
    const bad = [noAcc, good.slice(0, -1), form(v, k === 3 ? 4 : 3)];
    return {n, prompt: `Quelle est la bonne orthographe ? <i>(${esc(v.inf)}, au passé simple)</i>`,
      opts: shuffle([{t: full(v, k, good), ok: true}, ...bad.map(t => ({t: full(v, k, t), ok: false}))]),
      explain: `Avec nous et vous, toujours un accent circonflexe : <b>${esc(full(v, k, good))}</b>.`,
      review: rev(n, `« ${v.inf} » avec « ${PERS[k]} »`, full(v, k, good)), redo: () => G.accent(n, typed)};
  },
  cerger(n, typed){
    if (n !== "pie") return null;
    const v = pick(CG), k = Math.floor(Math.random() * 6), good = form(v, k);
    if (typed) return Object.assign(G.conj("pie", true, v, k), {redo: () => G.cerger(n, typed)});
    const wrong = k < 5 ? v.r6 + ENDS.er[k] : v.r + "èrent", p = pron(k);
    const bad = [wrong, ...three(good, traps(v, k).filter(t => t !== wrong)).slice(0, 2)];
    const rule = /ç/.test(v.r) ? "-cer : ç devant a (il lança), mais c devant è (ils lancèrent)" : "-ger : on garde le e devant a (il mangea), mais pas devant è (ils mangèrent)";
    return {n, prompt: `Quelle forme complète la phrase au passé simple ?<br><span class="q">${BLANK} ${esc(v.c)}. <i>(${esc(v.inf)})</i></span>`,
      opts: shuffle([{t: cap(full(v, k, good, p)), ok: true}, ...bad.map(t => ({t: cap(full(v, k, t, p)), ok: false}))]),
      explain: `Verbe en ${esc(rule)}.<br>${conjList(v, k)}.`,
      review: rev(n, `Passé simple de « ${v.inf} » avec « ${p} »`, full(v, k, good, p)), redo: () => G.cerger(n, typed)};
  },
  aiais(n, typed){
    if (n !== "pie") return null;
    const v = pick(fam("er")), ps = form(v, 0), im = impf(v, 0);
    if (typed) {
      const it = G.conj("pie", true, v, 0);
      return Object.assign(it, {prompt: `Écris le verbe <b>« ${esc(v.inf)} »</b> au <b>passé simple</b> (pas à l'imparfait !) :<br><span class="q">${esc(cap(subj(v, 0, ps)))}${BLANK} ${esc(v.c)}.</span>`,
        redo: () => G.aiais(n, typed)});
    }
    const isPs = Math.random() < 0.5, f = isPs ? ps : im;
    return {n, prompt: `À quel temps est ce verbe ?<br><span class="q">${esc(cap(full(v, 0, f)))} ${esc(v.c)}.</span>`,
      opts: [{t: "Passé simple", ok: isPs}, {t: "Imparfait", ok: !isPs}],
      explain: `Avec je : <b>-ai</b> = passé simple (${esc(full(v, 0, ps))}), <b>-ais</b> = imparfait (${esc(full(v, 0, im))}). Astuce : remplace je par il → il ${esc(form(v, 2))} / il ${esc(impf(v, 2))}.`,
      review: rev(n, full(v, 0, f), isPs ? "passé simple" : "imparfait"), redo: () => G.aiais(n, typed)};
  },
  /* passé simple ou imparfait dans une phrase */
  choix(n, typed){
    if (n !== "emp") return null;
    const [s, inf, ps, im, t, e] = pick(EMPL), good = t === "PS" ? ps : im, other = t === "PS" ? im : ps;
    const why = `${TART[t]} : ${EMP[e]}`;
    const html = esc(s).replace("{}", BLANK);
    const full2 = esc(s).replace("{}", `<b>${esc(good)}</b>`);
    if (typed) return {n, prompt: `Conjugue <b>« ${esc(inf)} »</b> au passé simple ou à l'imparfait, selon le sens :<br><span class="q">${html}</span>`,
      fields: [{label: inf, lang: "fr", check: formCheck(good, {form: other, why: `il faut ${why}`})}],
      explain: `Ici, ${esc(why)}.`, review: rev(n, s.replace("{}", `… (${inf})`), good), redo: () => G.choix(n, typed)};
    return {n, prompt: `Passé simple ou imparfait ? Choisis la forme qui convient :<br><span class="q">${html} <i>(${esc(inf)})</i></span>`,
      opts: shuffle([{t: good, ok: true}, {t: other, ok: false}]),
      explain: `${full2}<br>${esc(cap(why))}.`, review: rev(n, s.replace("{}", `… (${inf})`), good), redo: () => G.choix(n, typed)};
  },
  pourquoi(n){
    if (n !== "emp") return null;
    const [s, , ps, im, t, e] = pick(EMPL), good = t === "PS" ? ps : im;
    const others = Object.keys(EMP).filter(x => x !== e && !CLOSE[e].includes(x));
    return {n, prompt: `Pourquoi l'auteur emploie-t-il ici ${TART[t]} ? Il exprime…<br><span class="q">${esc(s).replace("{}", `<u>${esc(good)}</u>`)}</span>`, wide: true,
      opts: shuffle([{t: cap(EMP[e]), ok: true}, ...sample(others, 3).map(x => ({t: cap(EMP[x]), ok: false}))]),
      explain: `${cap(TART[t])} exprime ici <b>${esc(EMP[e])}</b>.`, review: rev(n, `${s.replace("{}", good)} (${TNAME[t]})`, EMP[e]), redo: () => G.pourquoi(n)};
  },
  indic(n){
    if (n !== "emp") return null;
    const ps = Math.random() < 0.5, good = pick(ps ? IND_PS : IND_IMP), bad = sample(ps ? IND_IMP : IND_PS, 3);
    return {n, prompt: `Lequel de ces mots annonce plutôt ${ps ? "une action au <b>passé simple</b>" : "l'<b>imparfait</b>"} ?`,
      opts: shuffle([{t: good, ok: true}, ...bad.map(t => ({t, ok: false}))]),
      explain: ps ? "« Soudain, tout à coup, brusquement, un jour, ce matin-là, aussitôt » annoncent une action soudaine, de premier plan : passé simple."
        : "« Chaque soir, d'habitude, tous les jours, souvent, autrefois » annoncent une habitude, à l'arrière-plan : imparfait.",
      review: rev(n, `Mot qui annonce ${ps ? "le passé simple" : "l'imparfait"}`, good), redo: () => G.indic(n)};
  },
  /* retrouver l'infinitif */
  infinitif(n, typed){
    if (n !== "rec") return null;
    const v = pick(INF_POOL), k = Math.floor(Math.random() * 6), p = pron(k), shown = full(v, k, form(v, k), p);
    const base = {n, review: rev(n, `Infinitif de « ${shown} »`, v.inf), redo: () => G.infinitif(n, typed)};
    if (typed) return Object.assign(base, {prompt: `Ce verbe est au passé simple. Quel est son <b>infinitif</b> ?<br><span class="q">${esc(shown)}</span>`, explain: "",
      fields: [{label: "L'infinitif", lang: "fr", check: x => { const ok = !!infKey(x) && infKey(x) === infKey(v.inf); return {ok, fix: ok ? "✓" : `→ ${v.inf}`}; }}]});
    const look = v.look.filter(w => w !== v.inf && !(VBY[w] && form(VBY[w], k) === form(v, k)));
    return Object.assign(base, {prompt: `Ce verbe est au passé simple. Quel est son infinitif ?<br><span class="q">${esc(shown)}</span>`,
      opts: shuffle([{t: v.inf, ok: true}, ...look.slice(0, 3).map(t => ({t, ok: false}))]),
      explain: `${esc(shown)} → <b>${esc(v.inf)}</b> (${conjList(v, k)}).`});
  },
  passage(n){
    if (n !== "rec") return null;
    const {html, vs} = parsePassage(pick(PASSAGES)), ps = vs.filter(x => x[1] === "p"), im = vs.filter(x => x[1] === "i");
    const askPs = ps.length === 1, good = (askPs ? ps : im)[0][0];
    return {n, prompt: `Dans ce passage, quel verbe est ${askPs ? "au <b>passé simple</b>" : "à l'<b>imparfait</b>"} ?<br><span class="q">${html}</span>`, wide: true,
      opts: shuffle(vs.map(([w]) => ({t: w, ok: w === good}))),
      explain: `Passé simple : <b>${esc(ps.map(x => x[0]).join(", "))}</b> · imparfait : <b>${esc(im.map(x => x[0]).join(", "))}</b>.`,
      review: rev(n, `Le verbe ${askPs ? "au passé simple" : "à l'imparfait"} du passage`, good), redo: () => G.passage(n)};
  },
  transpo(n, typed){
    if (n !== "rec") return null;
    const [s, good, bad] = pick(TRANSPO), html = esc(s).replace(/\{([^}]+)\}/, "<u>$1</u>"), present = s.match(/\{([^}]+)\}/)[1];
    const after = esc(s).replace(/\{([^}]+)\}/, `<b>${esc(good)}</b>`);
    const base = {n, review: rev(n, `${s.replace(/[{}]/g, "")} → passé simple`, good), redo: () => G.transpo(n, typed)};
    if (typed) return Object.assign(base, {prompt: `Réécris le verbe souligné au <b>passé simple</b> :<br><span class="q">${html}</span>`, explain: "",
      fields: [{label: `« ${present} » au passé simple`, lang: "fr", check: formCheck(good, {form: bad[0], why: "ça, c'est l'imparfait"})}]});
    return Object.assign(base, {prompt: `Réécris le verbe souligné au passé simple :<br><span class="q">${html}</span>`,
      opts: shuffle([{t: good, ok: true}, ...bad.map(t => ({t, ok: false}))]), explain: after});
  }
};
const KQ = {   // au quiz
  er: ["conj", "conj", "conj", "famille", "cours", "vf"], is: ["conj", "conj", "conj", "famille", "cours", "vf"],
  us: ["conj", "conj", "conj", "famille", "cours", "vf"], ins: ["conj", "conj", "famille", "cours", "vf"],
  pie: ["accent", "cerger", "aiais", "cours", "vf"], emp: ["choix", "choix", "pourquoi", "indic", "cours", "vf"],
  rec: ["infinitif", "infinitif", "passage", "transpo", "transpo", "cours", "vf"]
};
const KC = {   // au contrôle : surtout des réponses à écrire
  er: ["conj", "conj", "conjAll"], is: ["conj", "conj", "conjAll", "famille"], us: ["conj", "conj", "conjAll", "famille"],
  ins: ["conj", "conjAll", "famille"], pie: ["accent", "cerger", "aiais"], emp: ["choix", "choix", "pourquoi"],
  rec: ["infinitif", "transpo", "transpo", "passage"]
};
function make(kinds, n, typed){
  for (const k of shuffle(kinds)) { const e = G[k](n, typed); if (e) return e; }
  return G.cours(n) || G.vf(n);
}

/* ---------- rédaction ---------- */
const REDAC = [
  {id: "reecrire", unit: "rec", titre: "Réécris le récit au passé",
   doc: `<p>Il est minuit. La pluie tombe sur les toits et la rue est déserte. Le vieux Martin dort au coin du feu. Soudain, on frappe à la porte. Martin se lève, prend sa lanterne et ouvre. Un enfant trempé se tient sur le seuil. Il tend une lettre au vieil homme, puis il disparaît dans la nuit.</p>`,
   consigne: `<p>Réécris ce texte <b>au passé</b> : mets les actions de premier plan au <b>passé simple</b>, et le décor, les descriptions et les actions en cours à l'<b>imparfait</b>.</p>`,
   modele: "Il était minuit. La pluie tombait sur les toits et la rue était déserte. Le vieux Martin dormait au coin du feu. Soudain, on frappa à la porte. Martin se leva, prit sa lanterne et ouvrit. Un enfant trempé se tenait sur le seuil. Il tendit une lettre au vieil homme, puis il disparut dans la nuit.",
   criteres: [
     {t: "Met le décor et l'action en cours à l'imparfait : il était minuit, la pluie tombait, la rue était déserte, Martin dormait", pts: 2},
     {t: "Met les actions de premier plan au passé simple : on frappa, se leva, prit, ouvrit, tendit, disparut", pts: 2},
     {t: "Écrit les verbes en -er sans t ni s avec il et on : frappa, se leva", pts: 1},
     {t: "Écrit correctement les verbes du 3e groupe au passé simple : prit, ouvrit, tendit, disparut", pts: 1}]},
  {id: "orage", unit: "emp", titre: "À toi de raconter : une nuit d'orage",
   consigne: `<p>Raconte en <b>6 à 8 phrases</b>, au passé, une nuit d'orage. Ton récit doit contenir : l'<b>imparfait</b> pour décrire le décor ; une <b>action en cours</b> à l'imparfait <b>interrompue</b> par une action au passé simple ; au moins <b>quatre actions successives au passé simple</b>, dont deux verbes du 3e groupe ; un mot qui annonce l'action soudaine (<i>soudain, tout à coup…</i>).</p>`,
   modele: "Cette nuit-là, le vent soufflait très fort et la pluie frappait les volets. La maison était plongée dans le noir. Je lisais tranquillement dans mon lit quand, tout à coup, un éclair illumina la chambre. Je sursautai. Je me levai, pris ma lampe de poche et descendis l'escalier sans faire de bruit. Dans le salon, je vis une ombre près de la fenêtre. Je retins mon souffle… puis je reconnus mon chat, aussi effrayé que moi !",
   criteres: [
     {t: "Décrit le décor à l'imparfait (au moins deux verbes)", pts: 1},
     {t: "Une action en cours à l'imparfait est interrompue par une action au passé simple", pts: 1},
     {t: "Au moins quatre actions successives au passé simple, avec un mot qui annonce l'action soudaine", pts: 1},
     {t: "Au moins deux verbes du 3e groupe correctement conjugués au passé simple (pris, vis, vint, fit…)", pts: 1},
     {t: "Terminaisons correctes : -ai avec je pour les verbes en -er, pas de t après -a, -èrent seulement pour les verbes en -er, accent circonflexe avec nous et vous", pts: 1}]},
  {id: "cavalier", unit: "emp", titre: "Pourquoi ces temps ?",
   doc: `<p>Ce matin-là, le brouillard couvrait encore la vallée. Les paysans travaillaient déjà dans les champs et, au loin, les cloches sonnaient. Tout à coup, un cavalier surgit au bout du chemin. Il descendit de cheval, salua les paysans et leur demanda sa route. Puis il repartit au galop.</p>`,
   consigne: `<p>1. Relève les <b>verbes au passé simple</b> et donne leur <b>infinitif</b>.<br>2. Relève les verbes à l'<b>imparfait</b>.<br>3. Explique pourquoi l'auteur emploie d'abord l'imparfait, puis le passé simple. Emploie les mots du bilan : <b>premier plan</b>, <b>arrière-plan</b>.</p>`,
   modele: "1. Verbes au passé simple : surgit (surgir), descendit (descendre), salua (saluer), demanda (demander), repartit (repartir). 2. Verbes à l'imparfait : couvrait, travaillaient, sonnaient. 3. Au début, l'auteur emploie l'imparfait pour les actions d'arrière-plan : il fait la description du décor (le brouillard sur la vallée) et des actions qui durent (les paysans travaillent, les cloches sonnent). À partir de « Tout à coup », il emploie le passé simple pour les actions de premier plan : des actions ponctuelles et successives qui s'enchaînent et font progresser le récit (le cavalier surgit, descend, salue, demande sa route et repart).",
   criteres: [
     {t: "Relève les cinq verbes au passé simple : surgit, descendit, salua, demanda, repartit", pts: 1},
     {t: "Donne leur infinitif : surgir, descendre, saluer, demander, repartir", pts: 1},
     {t: "Relève les trois verbes à l'imparfait : couvrait, travaillaient, sonnaient", pts: 1},
     {t: "Explique que l'imparfait sert à l'arrière-plan : la description du décor, des actions qui durent", pts: 1},
     {t: "Explique que le passé simple sert aux actions de premier plan, ponctuelles et successives, qui font progresser le récit (à partir de « Tout à coup »)", pts: 1}]},
  {id: "erreurs", unit: "pie", titre: "Corrige les erreurs de Jules",
   doc: `<p>Dans sa rédaction, Jules a écrit :<br><i>« Ce jour-là, les chevaliers prenèrent leurs épées. Le roi les regardat partir, puis il rentrait dans son château. »</i></p>`,
   consigne: `<p>Trouve les <b>trois erreurs</b> de Jules, corrige-les, et explique-lui chaque fois <b>la règle</b>.</p>`,
   modele: "1. « prenèrent » → « prirent » : prendre est un verbe du 3e groupe qui se conjugue en -is (ils prirent). La terminaison -èrent est réservée aux verbes en -er. 2. « regardat » → « regarda » : avec il, les verbes en -er se terminent par -a, sans t. 3. « rentrait » → « rentra » : c'est une action de premier plan, qui suit les autres et fait progresser le récit (« puis ») : il faut le passé simple, pas l'imparfait.",
   criteres: [
     {t: "Corrige « prenèrent » en « prirent » et explique que -èrent est réservé aux verbes en -er (prendre se conjugue en -is)", pts: 1},
     {t: "Corrige « regardat » en « regarda » et explique qu'avec il, les verbes en -er se terminent par -a, sans t", pts: 1},
     {t: "Corrige « rentrait » en « rentra » et explique que c'est une action successive de premier plan (passé simple)", pts: 1},
     {t: "Explications claires, avec les mots de la règle (terminaison, verbes en -er, premier plan…)", pts: 1}]}
];

/* ---------- le tableau à connaître (accueil du module) ---------- */
function overview(){
  const ex = [["er", "aimer"], ["is", "finir"], ["us", "être"], ["ins", "venir"]].map(([f, inf]) => VBY[inf] || {inf, f, r: "aim"});
  const cols = "grid-template-columns:40px repeat(4,minmax(0,1fr)); gap:6px; padding-inline:10px; font-size:14px", nw = "white-space:nowrap; overflow-wrap:normal";
  const head = `<div class="vt-row vt-head" style="${cols}"><span></span>${ex.map(v => `<span>${esc(v.inf)}<span class="fr">en -${v.f === "er" ? "ai" : v.f}</span></span>`).join("")}</div>`;
  const rows = PERS.map((p, k) => `<div class="vt-row" style="${cols}"><span class="b">${p}</span>${ex.map(v => `<span class="f" style="${nw}">${esc(v.r6 && k === 5 ? v.r6 : v.r)}<b>${esc(ENDS[v.f][k])}</b></span>`).join("")}</div>`).join("");
  return `<div class="sec-h"><p class="label">Le tableau à connaître</p></div><div class="vt-wrap"><div class="vt" style="min-width:320px">${head}${rows}</div></div>`;
}

/* ---------- passage au moteur ---------- */
const nbOpts = o => o && o.map(x => Object.assign({}, x, {t: nb(x.t)}));
const asQuiz = e => ({unit: UBY[e.n], key: strip(e.review), prompt: nb(e.prompt), fig: e.fig, wide: e.wide, opts: nbOpts(e.opts), tip: e.tip,
  feedback: () => box(nb(e.explain)), review: nb(e.review)});
const asControl = e => Object.assign({unit: UBY[e.n], prompt: nb(e.prompt), wide: e.wide, tip: e.tip, review: nb(e.review),
  correction: () => e.explain ? `<p class="label" style="margin-top:4px">Correction</p>${box(nb(e.explain))}` : "", redo: () => asControl(e.redo())},
  e.fields ? {kind: "fields", fields: e.fields} : {kind: "choice", opts: nbOpts(e.opts)});

const card = (n, front, back, label) => ({unit: UBY[n],
  front: `<div class="fbody">${label ? `<span class="label">${esc(label)}</span>` : ""}<span class="card-q">${nb(front)}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
  back: `<div class="fbody left"><span class="card-a">${nb(back)}</span></div>`});
const KEYS = ["aller", "faire", "voir", "prendre", "écrire", "naître", "être", "avoir", "pouvoir", "vouloir", "savoir", "vivre", "recevoir", "venir"];
const conjCard = v => card(v.f, `Conjugue « ${esc(v.inf)} » au passé simple.`, PERS.map((_, k) => esc(full(v, k))).join("<br>"), "Passé simple · verbe à connaître");

Revision.start({
  key: "leandre-francais-passe-simple-v1",
  title: "Le passé simple",
  subtitle: "Le conjuguer et l'employer",
  eyebrow: "Français · Conjugaison",
  hand: "-ai, -is, -us, -ins… et l'accent à nous et vous !",
  groups: {
    "1": {name: "Former le passé simple", cls: "l1", filter: "Conjugaison"},
    "2": {name: "Employer le passé simple", cls: "l2", filter: "Emploi"}
  },
  redaction: {items: REDAC, text: "4 sujets comme à l'évaluation : réécrire un récit au passé, raconter, expliquer l'emploi des temps, corriger des erreurs. Tu rédiges (ou tu prends ta copie en photo), puis tu es corrigé critère par critère."},
  units: UNITS,
  allLabel: () => "Tout le passé simple",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["la leçon", "Les règles et le bilan à savoir par cœur, les pièges, puis les verbes irréguliers à connaître."],
    quiz: ["10 questions", "Conjuguer, choisir entre passé simple et imparfait, trouver l'infinitif, déjouer les pièges."],
    control: ["noté sur 20", "Tu écris toi-même les verbes au passé simple, accents compris, comme à l'évaluation."]
  },
  overview,
  cards: pool => {
    const ids = pool.map(u => u.id);
    const out = PAR_COEUR.filter(p => ids.includes(p.n)).map(p => card(p.n, esc(p.q), esc(p.text), `À savoir par cœur · ${p.source}`));
    out.push(...COURS.filter(c => ids.includes(c.n)).map(c => card(c.n, esc(c.card), nl(c.a))));
    out.push(...KEYS.map(i => VBY[i]).filter(v => ids.includes(v.f)).map(conjCard));
    return out;
  },
  quiz: {count: 10, make: (pool, R, i) => {
    const n = R.weighted(pool).id, f = i % 5 < 2 ? G.parcoeur(n) : null;   // environ 4 questions sur 10 sur le « par cœur »
    return asQuiz(f || make(KQ[n], n, false));
  }},
  control: {
    lead: "14 questions : des phrases du cours à compléter, des verbes à écrire au passé simple, passé simple ou imparfait, des infinitifs à retrouver. Chaque question compte autant.",
    note: "Au passé simple, l'orthographe compte : accents et cédille compris (nous chantâmes, ils chantèrent, il reçut). Sur la tablette, laisse le doigt appuyé sur une lettre pour trouver ses accents. Pour les mots du cours et les infinitifs, les accents ne comptent pas.",
    size: () => 14,
    build: (pool, R) => {
      const ids = pool.map(u => u.id), withPc = ids.filter(n => PBY(n).length), items = [];
      let all = 0;
      const add = e => {
        if (!e || items.some(x => strip(x.review) === strip(e.review))) return false;
        if (e.fields && e.fields.length === 6 && ++all > 2) return false;   // 2 conjugaisons complètes au plus
        items.push(e); return true;
      };
      for (let s = 0; s < 3 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.trous(pick(withPc))); t++);   // 3 textes à trous
      for (let s = 0; s < 2 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.parcoeur(pick(withPc))); t++);
      let guard = 0;
      while (items.length < 14 && guard++ < 300) {
        const n = guard % 3 ? R.weighted(pool).id : ids[guard % ids.length];
        add(make(KC[n], n, true));
      }
      while (items.length < 14) items.push(make(KC[ids[0]], ids[0], true));
      return shuffle(items).map(asControl);
    }
  }
});
})();
