/* Module : SVT · Thème 1 « Corps humain et santé », chapitre 1 : le système nerveux.
   Sources : cahier de Léandre (bilans des activités 1 et 2, brouillon du schéma fonctionnel de la sprinteuse),
   fiche « Les organes mis en jeu lors d'une course de 100 m » et « Le système nerveux central »,
   fiche « Les neurones » (documents 1 à 4 : neurone, transmission, synapse, neurone et muscle),
   activité 3 « Cerveau et message nerveux » (le téléphone sonne), TD « AVC de Jean » (aires cérébrales),
   TP « Système nerveux et conduites addictives ». Vidéo de révision (NotebookLM) fournie par Damien.
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";
const {esc, shuffle, pick, fold} = Revision;

/* ---------- notions ---------- */
const UNITS = [
  {id: "trj", group: "1", name: "Le trajet du message",        sub: "Stimulus, organes sensoriels, nerfs, organes effecteurs"},
  {id: "snc", group: "1", name: "Le système nerveux central",  sub: "Encéphale, cerveau, moelle épinière, paralysie"},
  {id: "neu", group: "2", name: "Le neurone",                  sub: "Corps cellulaire, noyau, dendrites, axone, myéline"},
  {id: "syn", group: "2", name: "La synapse",                  sub: "Neurotransmetteurs, récepteurs, transmission chimique"},
  {id: "mus", group: "2", name: "Du neurone au muscle",        sub: "Contraction, anesthésie"},
  {id: "air", group: "3", name: "Les aires cérébrales",        sub: "Hémisphères, aires sensitives et motrices, l'AVC de Jean"},
  {id: "int", group: "3", name: "L'intégration",               sub: "Le téléphone sonne : mémoire et prise de décision"},
  {id: "add", group: "3", name: "Les addictions",              sub: "Drogues, dopamine, se faire aider"}
].map(u => Object.assign(u, {tag: u.name}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- questions de cours : carte (recto/verso) + QCM (bonne réponse en premier) ---------- */
const COURS = [
  {id: "t-stim", n: "trj", card: "Un stimulus, c'est quoi ?", q: "Un stimulus, c'est…",
   a: "Une information de l'environnement qui déclenche une réaction.\nEx. : le coup de feu pour la sprinteuse, la sonnerie du téléphone.\nAu pluriel, on dit des stimuli.",
   o: ["une information de l'environnement qui déclenche une réaction", "un muscle qui se contracte", "un nerf qui relie le cerveau aux muscles", "une molécule libérée dans la synapse"]},
  {id: "t-sens", n: "trj", card: "À quoi servent les organes sensoriels ?", q: "Les organes sensoriels (œil, oreille)…",
   a: "Ils agissent comme des récepteurs : ils captent les informations de l'environnement.\nL'oreille capte les ondes sonores, l'œil capte les ondes lumineuses, grâce à des cellules spécialisées.",
   o: ["captent les informations de l'environnement", "mettent le corps en mouvement", "décident de l'action à faire", "protègent la moelle épinière"]},
  {id: "t-cil", n: "trj", card: "Grâce à quoi l'oreille capte-t-elle les sons ?", q: "L'oreille capte les ondes sonores grâce…",
   a: "À des cellules spécialisées : les cellules ciliées.", o: ["aux cellules ciliées", "aux neurotransmetteurs", "aux vertèbres", "à la myéline"]},
  {id: "t-nsens", n: "trj", card: "Les nerfs sensitifs", q: "Les nerfs sensitifs transportent le message nerveux…",
   a: "Des organes sensoriels vers les centres nerveux (cerveau, moelle épinière).",
   o: ["des organes sensoriels vers les centres nerveux", "des centres nerveux vers les muscles", "d'un muscle à un autre muscle", "de l'œil vers l'oreille"]},
  {id: "t-nmot", n: "trj", card: "Les nerfs moteurs", q: "Les nerfs moteurs transportent le message nerveux…",
   a: "Des centres nerveux vers les organes effecteurs (les muscles).",
   o: ["des centres nerveux vers les muscles", "des organes sensoriels vers le cerveau", "de l'oreille vers l'œil", "des muscles vers les organes sensoriels"],
   tip: "Attention : le nerf moteur n'est pas l'organe effecteur. Il relie le centre nerveux à l'organe effecteur (le muscle)."},
  {id: "t-eff", n: "trj", card: "Les organes effecteurs, c'est quoi ?", q: "Les organes effecteurs des mouvements sont…",
   a: "Les muscles : en réponse aux stimuli, ils se contractent et mettent le corps en mouvement.",
   o: ["les muscles", "les yeux et les oreilles", "les nerfs sensitifs", "les vertèbres"]},
  {id: "t-traj", n: "trj", card: "Le trajet du message nerveux, dans l'ordre", q: "Quel est le bon trajet du message nerveux ?",
   a: "Stimulus → organe sensoriel → nerf sensitif → centre nerveux → nerf moteur → organe effecteur (muscle) → mouvement.",
   o: ["organe sensoriel → nerf sensitif → centre nerveux → nerf moteur → muscle", "muscle → nerf moteur → centre nerveux → nerf sensitif → organe sensoriel", "organe sensoriel → nerf moteur → centre nerveux → nerf sensitif → muscle", "centre nerveux → organe sensoriel → muscle → nerf sensitif"]},
  {id: "t-vit", n: "trj", card: "À quelle vitesse se propagent les messages nerveux ?", q: "Les messages nerveux se propagent à environ…",
   a: "100 m/s (cent mètres par seconde).", o: ["100 m/s", "1 m/s", "10 000 m/s", "1 km/h"]},
  {id: "t-sch", n: "trj", card: "Le schéma fonctionnel de la sprinteuse", q: "Dans le schéma de la sprinteuse, le coup de feu est…",
   a: "Coup de feu (stimulus) → oreilles (organes sensoriels) → nerfs sensitifs → centres nerveux → nerfs moteurs → muscles (organes effecteurs) → action : courir.",
   o: ["le stimulus", "l'organe effecteur", "le centre nerveux", "le nerf moteur"]},

  {id: "s-def", n: "snc", card: "Le système nerveux central (le centre nerveux)", q: "Le système nerveux central est formé…",
   a: "De l'encéphale (dont la plus grande partie est le cerveau) et de la moelle épinière.",
   o: ["de l'encéphale et de la moelle épinière", "des yeux et des oreilles", "des nerfs et des muscles", "du cœur et des poumons"]},
  {id: "s-moelle", n: "snc", card: "La moelle épinière", q: "La moelle épinière est…",
   a: "Dans le prolongement du cerveau. Elle est entourée par les vertèbres de la colonne vertébrale, qui la protègent.",
   o: ["dans le prolongement du cerveau, protégée par les vertèbres", "un muscle du dos", "un organe sensoriel", "une partie de l'oreille"]},
  {id: "s-ence", n: "snc", card: "L'encéphale et le cerveau", q: "La plus grande partie de l'encéphale est…",
   a: "Le cerveau.", o: ["le cerveau", "la moelle épinière", "l'oreille", "la colonne vertébrale"]},
  {id: "s-para", n: "snc", card: "Que se passe-t-il quand le système nerveux est lésé ?", q: "Quand le système nerveux est lésé…",
   a: "Il n'y a plus de communication entre les organes, donc plus de mouvement : c'est la paralysie.",
   o: ["il n'y a plus de communication entre les organes : c'est la paralysie", "les muscles se contractent plus vite", "le message nerveux va deux fois plus vite", "rien ne change"]},

  {id: "n-def", n: "neu", card: "Un neurone, c'est quoi ?", q: "Un neurone est…",
   a: "Une cellule nerveuse. La communication nerveuse est assurée par des milliards de neurones.",
   o: ["une cellule nerveuse", "un muscle", "une molécule", "un os de la colonne vertébrale"]},
  {id: "n-comp", n: "neu", card: "De quoi est composé un neurone ?", q: "Un neurone est composé…",
   a: "D'un corps cellulaire qui contient un noyau, entouré de dendrites,\net d'une fibre nerveuse appelée axone (parfois entourée de myéline), qui se termine par de petites ramifications.",
   o: ["d'un corps cellulaire avec un noyau, de dendrites et d'un axone", "seulement d'un noyau", "d'un muscle et d'un nerf", "de neurotransmetteurs et de vertèbres"]},
  {id: "n-axone", n: "neu", card: "L'axone, c'est quoi ?", q: "L'axone, c'est…",
   a: "La fibre nerveuse du neurone : le long prolongement qui part du corps cellulaire. Le message électrique se propage le long de l'axone.",
   o: ["la fibre nerveuse du neurone", "le noyau du neurone", "la zone entre deux neurones", "une molécule chimique"]},
  {id: "n-mye", n: "neu", card: "À quoi sert la myéline ?", q: "La myéline sert…",
   a: "C'est une gaine qui entoure parfois l'axone. Elle permet d'augmenter la vitesse de propagation du message.",
   o: ["à augmenter la vitesse du message", "à fabriquer des neurotransmetteurs", "à protéger la moelle épinière", "à contracter le muscle"]},
  {id: "n-dend", n: "neu", card: "Les dendrites", q: "Les dendrites sont…",
   a: "Les petites ramifications autour du corps cellulaire. Elles reçoivent les messages venant d'autres neurones.",
   o: ["de petites ramifications autour du corps cellulaire", "le noyau du neurone", "la gaine autour de l'axone", "des molécules de plaisir"],
   tip: "Le bout de l'axone se ramifie aussi : ce sont les terminaisons de l'axone (la ramification terminale)."},
  {id: "n-noyau", n: "neu", card: "Où se trouve le noyau du neurone ?", q: "Le noyau du neurone se trouve…",
   a: "Dans le corps cellulaire. Il contient l'ADN.", o: ["dans le corps cellulaire", "au bout de l'axone", "dans la myéline", "dans la synapse"]},
  {id: "n-elec", n: "neu", card: "Sous quelle forme l'information circule-t-elle dans un neurone ?", q: "Le long d'un neurone, le message nerveux circule…",
   a: "Sous forme de signaux électriques, codés de façon identique, qui se propagent le long de l'axone, dans un seul sens.",
   o: ["sous forme de signaux électriques, dans un seul sens", "sous forme de molécules, dans les deux sens", "sous forme d'ondes sonores", "dans le sang"]},

  {id: "y-def", n: "syn", card: "Une synapse, c'est quoi ?", q: "Une synapse, c'est…",
   a: "La zone de communication entre deux neurones (ou entre un neurone et un muscle).",
   o: ["la zone de communication entre deux neurones", "le noyau du neurone", "la gaine de myéline", "une partie de l'oreille"]},
  {id: "y-nb", n: "syn", card: "Combien de synapses a un neurone ?", q: "Un neurone possède environ…",
   a: "1 000 à 10 000 synapses avec d'autres neurones : le message passe de neurone en neurone.",
   o: ["1 000 à 10 000 synapses", "1 ou 2 synapses", "10 à 100 synapses", "une seule synapse"]},
  {id: "y-chim", n: "syn", card: "Entre deux neurones : transmission électrique ou chimique ?", q: "Entre deux neurones, la transmission du message est…",
   a: "Chimique : des molécules (les neurotransmetteurs) sont libérées par un neurone et réceptionnées par l'autre.\nLe long du neurone, le message est électrique.",
   o: ["chimique, grâce aux neurotransmetteurs", "électrique, grâce à la myéline", "sonore, grâce aux cellules ciliées", "impossible"]},
  {id: "y-nt", n: "syn", card: "Un neurotransmetteur, c'est quoi ?", q: "Un neurotransmetteur, c'est…",
   a: "Une molécule qui sert de message entre deux neurones ou entre un neurone et un muscle.",
   o: ["une molécule qui sert de message entre deux neurones", "une cellule nerveuse", "un nerf moteur", "un organe sensoriel"]},
  {id: "y-rec", n: "syn", card: "Les récepteurs du neurone 2", q: "Sur le neurone 2, les neurotransmetteurs se fixent sur…",
   a: "Des récepteurs. Un nouveau message électrique repart alors dans le neurone 2.",
   o: ["des récepteurs", "des vertèbres", "des cellules ciliées", "la myéline"]},

  {id: "m-nerf", n: "mus", card: "Les nerfs et les muscles", q: "Les nerfs sont…",
   a: "Présents dans tout le corps et reliés aux muscles.",
   o: ["présents dans tout le corps et reliés aux muscles", "seulement dans le cerveau", "seulement dans les yeux", "jamais reliés aux muscles"]},
  {id: "m-contr", n: "mus", card: "Comment un muscle se contracte-t-il ?", q: "Comment le message nerveux fait-il contracter un muscle ?",
   a: "Le message nerveux électrique arrive au bout du neurone → il provoque la libération de neurotransmetteurs → ils se fixent sur des récepteurs spécifiques des fibres musculaires → le muscle se contracte.",
   o: ["le neurone libère des neurotransmetteurs qui se fixent sur le muscle", "le muscle se contracte tout seul, sans message", "le sang transporte le message électrique", "l'oreille envoie des ondes sonores au muscle"]},
  {id: "m-anest", n: "mus", card: "Pourquoi l'anesthésie relâche-t-elle les muscles ?", q: "Pendant une opération, l'anesthésie…",
   a: "Bloque la communication entre les cellules nerveuses et les cellules musculaires : les muscles de la zone opérée se relâchent.",
   o: ["bloque la communication entre les nerfs et les muscles", "accélère le message nerveux", "fabrique de la myéline", "fait contracter les muscles"]},

  {id: "a-hemi", n: "air", card: "Les hémisphères cérébraux", q: "Le cerveau est formé de…",
   a: "Deux parties : les hémisphères cérébraux droit et gauche.", o: ["deux hémisphères, droit et gauche", "quatre hémisphères", "un seul bloc", "deux moelles épinières"]},
  {id: "a-def", n: "air", card: "Une aire cérébrale, c'est quoi ?", q: "Une aire cérébrale, c'est…",
   a: "Une zone du cerveau spécialisée dans une fonction précise (voir, entendre, bouger…).",
   o: ["une zone du cerveau spécialisée dans une fonction précise", "une cellule nerveuse", "un nerf qui va au muscle", "une molécule de plaisir"]},
  {id: "a-sens", n: "air", card: "Où arrivent les messages nerveux sensitifs ?", q: "Les messages nerveux sensitifs arrivent…",
   a: "Dans les aires sensitives du cerveau, pour y être traités : aires visuelle, auditive, olfactive, gustative, somesthésique.",
   o: ["dans les aires sensitives du cerveau", "dans les muscles", "dans les vertèbres", "dans les organes sensoriels"]},
  {id: "a-mot", n: "air", card: "Les aires motrices", q: "Quelles aires commandent les mouvements ?",
   a: "Les aires motrices (aire motrice primaire, aire motrice supplémentaire, cortex prémoteur). Elles envoient les ordres aux muscles.",
   o: ["les aires motrices", "l'aire visuelle", "l'aire olfactive", "l'aire gustative"]},
  {id: "a-vis", n: "air", card: "Où se trouve l'aire visuelle ?", q: "L'aire visuelle se trouve…",
   a: "À l'arrière du cerveau.", o: ["à l'arrière du cerveau", "à l'avant, juste derrière les yeux", "dans la moelle épinière", "dans l'oreille"]},
  {id: "a-avc", n: "air", card: "Un AVC, c'est quoi ?", q: "Un AVC, c'est…",
   a: "Un accident vasculaire cérébral : par exemple une hémorragie soudaine dans le cerveau.\nIl peut causer des dégâts neurologiques majeurs ; la zone touchée peut être altérée définitivement.",
   o: ["un accident vasculaire cérébral", "une maladie des muscles", "une drogue", "un organe sensoriel"]},
  {id: "a-jean", n: "air", card: "Les conséquences de l'AVC de Jean", q: "L'AVC de Jean a touché l'aire visuelle. Il aura surtout…",
   a: "Des troubles de la vision : comme les patients A et B, il risque de confondre les formes et les couleurs.",
   o: ["des troubles de la vision (formes, couleurs)", "des troubles de l'odorat", "des troubles du goût", "aucune conséquence"],
   tip: "Méthode du TD : je localise la zone touchée (doc 1), je trouve l'aire (doc 2), j'en déduis les troubles (doc 3)."},

  {id: "i-tel", n: "int", card: "Le téléphone sonne : que se passe-t-il dans ton cerveau ?", q: "Le téléphone sonne. Quelle aire est activée en premier ?",
   a: "1. L'aire auditive (l'oreille a été stimulée par la sonnerie).\n2. L'aire de la mémoire reconnaît le son.\n3. L'aire de la prise de décision (préfrontale) décide quoi faire.\n4. L'aire motrice envoie l'ordre au bras de saisir le téléphone.",
   o: ["l'aire auditive", "l'aire motrice", "l'aire de la prise de décision", "l'aire visuelle"]},
  {id: "i-def", n: "int", card: "L'intégration, c'est quoi ?", q: "L'intégration, c'est…",
   a: "Le traitement simultané par le cerveau des informations reçues des organes sensoriels et des informations échangées dans le cerveau.\nLe cerveau analyse les infos et les met en relation.",
   o: ["le traitement en même temps de toutes les informations par le cerveau", "la contraction d'un muscle", "la fabrication de myéline", "la libération de dopamine"]},
  {id: "i-chef", n: "int", card: "Le cerveau est comme…", q: "Dans ton bilan, le cerveau est comparé à…",
   a: "Un chef d'orchestre du corps : il analyse les infos et les met en relation.", o: ["un chef d'orchestre", "un simple câble", "une batterie", "un muscle"]},
  {id: "i-mem", n: "int", card: "Le rôle de la mémoire", q: "La mémoire joue un rôle important car elle permet…",
   a: "De reconnaître ce qu'on a déjà vécu (par exemple reconnaître la sonnerie de son téléphone).",
   o: ["de reconnaître ce qu'on a déjà vécu", "de faire bouger le bras", "de capter les sons", "de protéger la moelle épinière"]},
  {id: "i-pref", n: "int", card: "Quelle aire décide de l'action ?", q: "Quelle aire décide de l'action à faire ?",
   a: "L'aire préfrontale (l'aire de la prise de décision), à l'avant du cerveau.",
   o: ["l'aire préfrontale (prise de décision)", "l'aire auditive", "l'aire de la mémoire", "l'aire visuelle"]},

  {id: "d-def", n: "add", card: "L'addiction, c'est quoi ?", q: "Une addiction, c'est…",
   a: "Une pathologie (une maladie) qui repose sur la consommation répétée d'une drogue (alcool, tabac, produits stupéfiants…)\nou sur la pratique excessive d'un comportement (jeux vidéo, réseaux sociaux…).",
   o: ["une maladie liée à une drogue ou à un comportement excessif", "un muscle qui se contracte", "une aire du cerveau", "un neurotransmetteur"]},
  {id: "d-csq", n: "add", card: "Les conséquences d'une addiction", q: "Une addiction a des conséquences…",
   a: "Négatives sur la vie personnelle, professionnelle et sociale.",
   o: ["négatives sur la vie personnelle, professionnelle et sociale", "seulement positives", "aucune", "seulement sur la vue"]},
  {id: "d-dopa", n: "add", card: "La dopamine, c'est quoi ?", q: "La dopamine est…",
   a: "Une substance chimique qui assure la communication entre neurones et qui provoque la sensation de plaisir.",
   o: ["une substance qui assure la communication entre neurones et provoque le plaisir", "une drogue", "une aire du cerveau", "une gaine autour de l'axone"]},
  {id: "d-eff", n: "add", card: "Comment les drogues agissent-elles sur le cerveau ?", q: "Les drogues perturbent les synapses du cerveau :…",
   a: "Elles entraînent une augmentation de la libération de dopamine, à l'origine de la dépendance.",
   o: ["elles augmentent la libération de dopamine", "elles diminuent la libération de dopamine", "elles détruisent la moelle épinière", "elles fabriquent de la myéline"]},
  {id: "d-hallu", n: "add", card: "Un autre effet de certaines drogues", q: "Certaines drogues modifient la perception visuelle et provoquent…",
   a: "Des hallucinations, qui peuvent être dangereuses pour la personne.", o: ["des hallucinations", "une meilleure vue", "la paralysie", "plus de myéline"]},
  {id: "d-tab", n: "add", card: "Quelle substance a le plus d'usagers quotidiens en France ?", q: "En France (11-75 ans), quelle substance a le plus d'usagers quotidiens ?",
   a: "Le tabac : environ 12 millions d'usagers quotidiens.\nAlcool : 5 millions ; cannabis : 850 000.",
   o: ["le tabac", "l'alcool", "le cannabis", "aucune, elles sont à égalité"]},
  {id: "d-aide", n: "add", card: "Comment sortir d'une addiction ?", q: "Pour sortir d'une addiction, on a souvent besoin…",
   a: "D'un accompagnement par un professionnel de santé (médecin généraliste, addictologue, psychiatre…),\nsouvent avec un traitement médicamenteux et une prise en charge psychologique, seul ou en groupe.\nDes services d'aide existent, par exemple Tabac info service (39 89).",
   o: ["d'un accompagnement par un professionnel de santé", "de rester seul sans en parler", "de consommer davantage", "de changer de drogue"]}
];

/* ---------- le schéma du neurone ---------- */
const PARTS = [
  {num: 1, name: "les dendrites",            ok: ["dendrite", "dendrites"]},
  {num: 2, name: "le corps cellulaire",      ok: ["corps cellulaire", "corps"]},
  {num: 3, name: "le noyau",                 ok: ["noyau"]},
  {num: 4, name: "l'axone",                  ok: ["axone", "fibre nerveuse"]},
  {num: 5, name: "la gaine de myéline",      ok: ["myeline", "gaine de myeline", "gaine"]},
  {num: 6, name: "les terminaisons de l'axone", ok: ["terminaisons", "terminaisons de l'axone", "terminaison nerveuse", "ramification terminale", "arborisation terminale", "ramifications"]}
];
const MARK = {1: [[16, 14], [27, 30]], 2: [[112, 128], [92, 92]], 3: [[116, 22], [82, 73]], 4: [[151, 124], [151, 77]], 5: [[205, 22], [205, 67]], 6: [[364, 18], [355, 50]]};
function neuronFig(show){
  const ink = "var(--ink)";
  const dend = ["M62 62 L40 45 L27 30", "M40 45 L22 48", "M59 80 L36 92 L22 104", "M36 92 L30 112", "M72 54 L68 30 L58 18",
    "M68 30 L80 16", "M78 97 L72 120 L62 132", "M72 120 L86 134", "M58 72 L38 70 L20 66"];
  const term = ["M318 75 L340 58 L355 50", "M340 58 L354 66", "M318 75 L360 76", "M318 75 L340 92 L356 100", "M340 92 L354 86"];
  const ends = [[355, 50], [354, 66], [360, 76], [356, 100], [354, 86]];
  let s = dend.concat(term).map(d => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  s += ends.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${ink}"/>`).join("");
  s += `<line x1="100" y1="75" x2="318" y2="75" stroke="${ink}" stroke-width="2.6"/>`;
  s += [120, 154, 188, 222, 256].map(x => `<rect x="${x}" y="67" width="28" height="16" rx="7" fill="var(--hl-2)" stroke="${ink}" stroke-width="1.6"/>`).join("");
  s += `<circle cx="80" cy="75" r="22" fill="var(--pen-soft)" stroke="${ink}" stroke-width="2.4"/><circle cx="80" cy="75" r="7" fill="var(--pen)" stroke="${ink}" stroke-width="1.5"/>`;
  for (const p of PARTS) {
    if (show && !show.includes(p.num)) continue;
    const [[mx, my], [tx, ty]] = MARK[p.num];
    s += `<line x1="${mx}" y1="${my}" x2="${tx}" y2="${ty}" stroke="var(--red)" stroke-width="1.4"/>`;
    s += `<circle cx="${mx}" cy="${my}" r="10" fill="var(--red-soft)" stroke="var(--red)" stroke-width="1.6"/>`;
    s += `<text x="${mx}" y="${my + 4.5}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--red)">${p.num}</text>`;
  }
  return `<div class="fig"><svg viewBox="0 0 380 145" role="img" aria-label="Schéma d'un neurone avec des numéros">${s}</svg></div>`;
}

/* ---------- les éléments du trajet à reconnaître ---------- */
const T = {
  STIM: "Un stimulus", SENS: "Un organe sensoriel", NSENS: "Un nerf sensitif",
  CENT: "Un centre nerveux", NMOT: "Un nerf moteur", EFF: "Un organe effecteur"
};
const EX = [
  {name: "Le coup de feu du départ", t: "STIM", n: "trj", why: "Le coup de feu est une information de l'environnement qui déclenche la réaction : c'est le stimulus."},
  {name: "La sonnerie du téléphone", t: "STIM", n: "trj", why: "La sonnerie stimule l'oreille et déclenche une réaction : c'est un stimulus."},
  {name: "L'oreille", t: "SENS", n: "trj", why: "L'oreille capte les ondes sonores grâce aux cellules ciliées : c'est un organe sensoriel."},
  {name: "L'œil", t: "SENS", n: "trj", why: "L'œil capte les ondes lumineuses grâce à des cellules spécialisées : c'est un organe sensoriel."},
  {name: "Le cerveau", t: "CENT", n: "snc", why: "Le cerveau fait partie de l'encéphale : c'est un centre nerveux."},
  {name: "La moelle épinière", t: "CENT", n: "snc", why: "Avec l'encéphale, la moelle épinière forme le système nerveux central."},
  {name: "Les muscles des jambes de la sprinteuse", t: "EFF", n: "trj", why: "Les muscles se contractent et la mettent en mouvement : ce sont des organes effecteurs."},
  {name: "Le muscle du bras qui saisit le téléphone", t: "EFF", n: "trj", why: "Le muscle réalise le mouvement : c'est un organe effecteur."},
  {name: "Le nerf qui va de l'oreille vers le cerveau", t: "NSENS", n: "trj", why: "Il transporte le message de l'organe sensoriel vers le centre nerveux : c'est un nerf sensitif."},
  {name: "Le nerf qui va de la moelle épinière aux muscles des jambes", t: "NMOT", n: "trj", why: "Il transporte le message du centre nerveux vers le muscle : c'est un nerf moteur."}
];

/* ---------- quelle aire pour quelle action ? ---------- */
const A = {
  AUD: "L'aire auditive", VIS: "L'aire visuelle", MOT: "L'aire motrice", MEM: "L'aire de la mémoire",
  DEC: "L'aire de la prise de décision", OLF: "L'aire olfactive", GUS: "L'aire gustative"
};
const TASKS = [
  ["entendre la sonnerie du téléphone", "AUD", "int"],
  ["reconnaître que c'est la sonnerie de ton téléphone", "MEM", "int"],
  ["décider de répondre au téléphone", "DEC", "int"],
  ["envoyer au bras l'ordre de saisir le téléphone", "MOT", "int"],
  ["voir les formes et les couleurs d'un objet", "VIS", "air"],
  ["sentir une odeur", "OLF", "air"],
  ["percevoir le goût d'un aliment", "GUS", "air"],
  ["commander les mouvements des muscles", "MOT", "air"],
  ["entendre un son", "AUD", "air"]
];

/* ---------- les étapes dans l'ordre ---------- */
const CHAINS = {
  trj: ["le stimulus (le coup de feu)", "l'organe sensoriel (l'oreille) capte l'information", "le nerf sensitif transporte le message", "le centre nerveux traite le message", "le nerf moteur transporte le message", "l'organe effecteur (le muscle) se contracte", "le mouvement : elle court"],
  syn: ["le message électrique arrive au bout du neurone 1", "le neurone 1 libère des neurotransmetteurs", "les neurotransmetteurs se fixent sur les récepteurs du neurone 2", "un nouveau message électrique part dans le neurone 2"],
  mus: ["le message électrique arrive au bout du neurone", "des neurotransmetteurs sont libérés", "les neurotransmetteurs se fixent sur les récepteurs du muscle", "le muscle se contracte"],
  int: ["la sonnerie stimule l'oreille", "l'aire auditive est activée", "l'aire de la mémoire reconnaît le son", "l'aire de la prise de décision décide de répondre", "l'aire motrice envoie l'ordre au bras", "le bras saisit le téléphone"]
};
const CHAIN_NAME = {trj: "Chez la sprinteuse", syn: "À la synapse", mus: "Du neurone au muscle", int: "Le téléphone sonne"};

/* ---------- vocabulaire : définition → mot ---------- */
const VOC = [
  {def: "Information de l'environnement qui déclenche une réaction (ex. : le coup de feu).", word: "un stimulus", ok: ["stimulus", "stimuli"], n: "trj"},
  {def: "Organe qui capte les informations de l'environnement (œil, oreille).", word: "un organe sensoriel", ok: ["organe sensoriel", "organe des sens"], n: "trj", not: ["un récepteur"]},
  {def: "Organe qui réalise le mouvement en se contractant.", word: "un organe effecteur", ok: ["organe effecteur", "effecteur", "muscle"], n: "trj"},
  {def: "Nerf qui transporte le message des organes sensoriels vers les centres nerveux.", word: "un nerf sensitif", ok: ["nerf sensitif", "nerfs sensitifs"], n: "trj"},
  {def: "Nerf qui transporte le message des centres nerveux vers les muscles.", word: "un nerf moteur", ok: ["nerf moteur", "nerfs moteurs"], n: "trj"},
  {def: "Partie du centre nerveux, dans le prolongement du cerveau, protégée par les vertèbres.", word: "la moelle épinière", ok: ["moelle epiniere", "moelle"], n: "snc"},
  {def: "Plus de mouvement, parce que le système nerveux est lésé.", word: "la paralysie", ok: ["paralysie"], n: "snc"},
  {def: "Ensemble formé par l'encéphale et la moelle épinière.", word: "le système nerveux central", ok: ["systeme nerveux central", "centre nerveux", "snc"], n: "snc"},
  {def: "Cellule nerveuse.", word: "un neurone", ok: ["neurone"], n: "neu"},
  {def: "Fibre nerveuse du neurone, le long de laquelle se propage le message électrique.", word: "l'axone", ok: ["axone"], n: "neu"},
  {def: "Gaine autour de l'axone qui augmente la vitesse du message.", word: "la myéline", ok: ["myeline", "gaine de myeline"], n: "neu"},
  {def: "Partie du neurone qui contient le noyau.", word: "le corps cellulaire", ok: ["corps cellulaire"], n: "neu"},
  {def: "Petites ramifications autour du corps cellulaire qui reçoivent les messages.", word: "les dendrites", ok: ["dendrite", "dendrites"], n: "neu"},
  {def: "Zone de communication entre deux neurones.", word: "une synapse", ok: ["synapse"], n: "syn"},
  {def: "Molécule qui sert de message entre deux neurones ou entre un neurone et un muscle.", word: "un neurotransmetteur", ok: ["neurotransmetteur"], n: "syn", not: ["la dopamine"]},
  {def: "Structure du neurone 2 (ou du muscle) sur laquelle se fixent les neurotransmetteurs.", word: "un récepteur", ok: ["recepteur"], n: "syn", not: ["un organe sensoriel"]},
  {def: "Réaction du muscle quand les neurotransmetteurs se fixent sur ses récepteurs.", word: "la contraction", ok: ["contraction"], n: "mus"},
  {def: "Pendant une opération, elle bloque la communication entre les cellules nerveuses et musculaires.", word: "l'anesthésie", ok: ["anesthesie"], n: "mus"},
  {def: "Zone du cerveau spécialisée dans une fonction précise.", word: "une aire", ok: ["aire", "aire cerebrale"], n: "air"},
  {def: "Chacune des deux moitiés du cerveau, droite ou gauche.", word: "un hémisphère", ok: ["hemisphere", "hemisphere cerebral"], n: "air"},
  {def: "Accident dû par exemple à une hémorragie soudaine dans le cerveau (en trois lettres).", word: "un AVC", ok: ["avc", "accident vasculaire cerebral"], n: "air"},
  {def: "Traitement simultané par le cerveau des informations reçues et échangées.", word: "l'intégration", ok: ["integration"], n: "int"},
  {def: "Elle permet de reconnaître ce qu'on a déjà vécu.", word: "la mémoire", ok: ["memoire"], n: "int"},
  {def: "Maladie liée à la consommation répétée d'une drogue ou à un comportement excessif.", word: "une addiction", ok: ["addiction", "dependance"], n: "add"},
  {def: "Substance qui assure la communication entre neurones et provoque la sensation de plaisir.", word: "la dopamine", ok: ["dopamine"], n: "add", not: ["un neurotransmetteur"]},
  {def: "Fausses perceptions visuelles provoquées par certaines drogues.", word: "des hallucinations", ok: ["hallucination", "hallucinations"], n: "add"}
];
const norm = s => fold(s).replace(/[’']/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\b(l|le|la|les|un|une|des|d|de|du)\b/g, " ").replace(/\s+/g, " ").trim();
/* tolère pluriels et accords mot à mot */
const stem = s => s.split(" ").map(w => w.replace(/(aux|es|e|s|x)$/, "")).join(" ");
const wordOk = (list, ans) => { const a = norm(ans); return !!a && list.some(k => { const kk = norm(k); return a === kk || stem(a) === stem(kk); }); };

/* ---------- chiffres ---------- */
const NUM = [
  {q: "À quelle vitesse (en m/s) se propagent les messages nerveux ?", ans: 100, tol: 10, unit: " m/s", n: "trj", traps: [1, 10, 10000], why: "Environ 100 m/s, c'est-à-dire 100 mètres par seconde."},
  {q: "Un neurone possède environ 1 000 à combien de synapses ?", ans: 10000, tol: 0, unit: " synapses", n: "syn", traps: [100, 2000, 1000000], why: "Environ 1 000 à 10 000 synapses avec d'autres neurones."},
  {q: "En combien d'hémisphères le cerveau est-il divisé ?", ans: 2, tol: 0, unit: " hémisphères", n: "air", traps: [1, 3, 4], why: "Deux : l'hémisphère droit et l'hémisphère gauche."},
  {q: "Combien de millions de personnes fument du tabac chaque jour en France (11-75 ans) ?", ans: 12, tol: 1, unit: " millions", n: "add", traps: [5, 1, 50], why: "Environ 12 millions d'usagers quotidiens de tabac."},
  {q: "Combien de millions de personnes boivent de l'alcool chaque jour en France (11-75 ans) ?", ans: 5, tol: 1, unit: " millions", n: "add", traps: [12, 1, 50], why: "Environ 5 millions d'usagers quotidiens d'alcool."}
];
const WORDNUM = {un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cent: 100};

/* ---------- vrai ou faux ---------- */
const VF = [
  ["Le long d'un neurone, le message nerveux circule dans les deux sens.", false, "neu", "Non : il circule dans un seul sens."],
  ["Le long d'un neurone, le message nerveux est électrique.", true, "neu", "Oui : ce sont des signaux électriques qui se propagent le long de l'axone."],
  ["La myéline ralentit le message nerveux.", false, "neu", "Non : elle augmente la vitesse de propagation du message."],
  ["Le noyau se trouve dans le corps cellulaire.", true, "neu", "Oui, et il contient l'ADN."],
  ["Entre deux neurones, la transmission est électrique.", false, "syn", "Non : elle est chimique, grâce aux neurotransmetteurs."],
  ["Un neurone n'est relié qu'à un seul autre neurone.", false, "syn", "Non : il a environ 1 000 à 10 000 synapses."],
  ["Les neurotransmetteurs se fixent sur des récepteurs.", true, "syn", "Oui : sur les récepteurs du neurone suivant ou du muscle."],
  ["Les muscles sont des organes effecteurs.", true, "trj", "Oui : ils se contractent et produisent le mouvement."],
  ["Les nerfs moteurs vont des organes sensoriels vers le cerveau.", false, "trj", "Non : ça, ce sont les nerfs sensitifs. Les nerfs moteurs vont des centres nerveux vers les muscles."],
  ["L'œil et l'oreille sont des organes sensoriels.", true, "trj", "Oui : ils captent les informations de l'environnement."],
  ["La moelle épinière fait partie du système nerveux central.", true, "snc", "Oui : avec l'encéphale."],
  ["La moelle épinière est protégée par les vertèbres.", true, "snc", "Oui : par la colonne vertébrale."],
  ["Si le système nerveux est lésé, cela peut provoquer une paralysie.", true, "snc", "Oui : plus de communication entre les organes, donc plus de mouvement."],
  ["L'anesthésie bloque la communication entre les nerfs et les muscles.", true, "mus", "Oui : les muscles de la zone opérée se relâchent."],
  ["Un muscle se contracte sans recevoir de message nerveux.", false, "mus", "Non : il faut que des neurotransmetteurs se fixent sur ses récepteurs."],
  ["Le cerveau est formé de deux hémisphères.", true, "air", "Oui : le droit et le gauche."],
  ["L'aire visuelle se trouve à l'avant du cerveau.", false, "air", "Non : à l'arrière du cerveau."],
  ["Une aire cérébrale est spécialisée dans une fonction précise.", true, "air", "Oui : voir, entendre, bouger…"],
  ["Quand le téléphone sonne, l'aire motrice est activée en premier.", false, "int", "Non : d'abord l'aire auditive, puis la mémoire, la décision, et enfin l'aire motrice."],
  ["La mémoire permet de reconnaître ce qu'on a déjà vécu.", true, "int", "Oui : par exemple la sonnerie de ton téléphone."],
  ["L'intégration, c'est le cerveau qui traite en même temps toutes les informations.", true, "int", "Oui : il les analyse et les met en relation."],
  ["Les drogues diminuent la libération de dopamine.", false, "add", "Non : elles l'augmentent, et c'est à l'origine de la dépendance."],
  ["Une addiction peut aussi concerner un comportement, comme les jeux vidéo.", true, "add", "Oui : la pratique excessive d'un comportement (jeux vidéo, réseaux sociaux…)."],
  ["Pour sortir d'une addiction, on peut se faire accompagner par un professionnel de santé.", true, "add", "Oui : médecin, addictologue, psychiatre, avec souvent un traitement et un suivi psychologique."]
];

/* ---------- fabrication des questions ---------- */
const tagOf = n => `<span class="tag ${({1: "l1", 2: "l2", 3: "l3"})[UBY[n].group]}">${esc(UBY[n].name)}</span>`;
const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;
const nl = s => esc(s).replace(/\n/g, "<br>");
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* Chaque générateur renvoie un exercice neutre {n, prompt, fig?, opts | field, explain, review, tip?, redo} */
const G = {
  cours(n){
    const c = pick(COURS.filter(x => x.n === n));
    return {n, prompt: esc(c.q), wide: true, opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), explain: nl(c.a), tip: c.tip,
      review: rev(n, c.q, c.o[0]), redo: () => G.cours(n)};
  },
  exemple(n){
    const pool = EX.filter(e => e.n === n);
    if (!pool.length) return null;
    const e = pick(pool), bad = Object.keys(T).filter(k => k !== e.t);
    const opts = shuffle([{t: T[e.t], ok: true}, ...shuffle(bad).slice(0, 3).map(k => ({t: T[k], ok: false}))]);
    return {n, prompt: `<b>${esc(e.name)}</b>, c'est…`, wide: true, opts, explain: esc(e.why),
      review: rev(n, e.name, T[e.t]), redo: () => G.exemple(n)};
  },
  aire(n){
    const pool = TASKS.filter(t => t[2] === n);
    if (!pool.length) return null;
    const [task, a] = pick(pool), bad = shuffle(Object.keys(A).filter(k => k !== a)).slice(0, 3);
    const opts = shuffle([{t: A[a], ok: true}, ...bad.map(k => ({t: A[k], ok: false}))]);
    return {n, prompt: `Quelle aire du cerveau permet ${/^[aeiouéèh]/i.test(task) ? "d'" : "de "}<b>${esc(task)}</b> ?`, wide: true, opts,
      explain: `C'est <b>${esc(A[a].toLowerCase())}</b>.`, review: rev(n, `Aire pour : ${task}`, A[a]), redo: () => G.aire(n)};
  },
  schema(n, typed){
    if (n !== "neu") return null;
    if (!typed && Math.random() < 0.2) {
      const good = "des dendrites vers les terminaisons de l'axone";
      return {n, prompt: "Sur ce neurone, dans quel sens circule le message nerveux ?", fig: neuronFig([1, 6]), wide: true,
        opts: shuffle([{t: good, ok: true}, {t: "des terminaisons de l'axone vers les dendrites", ok: false}, {t: "dans les deux sens", ok: false}, {t: "il ne circule pas", ok: false}]),
        explain: "Dans un seul sens : des dendrites (1) vers le corps cellulaire, puis le long de l'axone jusqu'à ses terminaisons (6).",
        review: rev(n, "Sens du message dans un neurone", good), redo: () => G.schema(n, typed)};
    }
    const p = pick(PARTS), base = {n, prompt: `Sur le schéma du neurone, que désigne le numéro <b>${p.num}</b> ?`, fig: neuronFig(),
      explain: `Le numéro ${p.num}, c'est <b>${esc(p.name)}</b>.<br>1 dendrites · 2 corps cellulaire · 3 noyau · 4 axone · 5 gaine de myéline · 6 terminaisons de l'axone.`,
      review: rev(n, `Schéma du neurone : numéro ${p.num}`, p.name), redo: () => G.schema(n, typed)};
    if (typed) return Object.assign(base, {field: {label: "Le nom", lang: "fr", check: v => { const ok = wordOk(p.ok, v); return {ok, fix: ok ? "✓" : `→ ${p.name}`}; }}});
    const others = shuffle(PARTS.filter(x => x !== p)).slice(0, 3).map(x => ({t: cap(x.name), ok: false}));
    return Object.assign(base, {opts: shuffle([{t: cap(p.name), ok: true}, ...others])});
  },
  suite(n){
    const ch = CHAINS[n];
    if (!ch) return null;
    const i = Math.floor(Math.random() * (ch.length - 1)), next = ch[i + 1];
    const others = shuffle(ch.filter((_, k) => k !== i && k !== i + 1)).slice(0, 3);
    return {n, prompt: `${esc(CHAIN_NAME[n])} : juste après « <b>${esc(ch[i])}</b> », que se passe-t-il ?`, wide: true,
      opts: shuffle([{t: cap(next), ok: true}, ...others.map(t => ({t: cap(t), ok: false}))]),
      explain: ch.map((s, k) => k === i + 1 ? `<b>${esc(cap(s))}</b>` : esc(cap(s))).join(" → "),
      review: rev(n, `${CHAIN_NAME[n]} : après « ${ch[i]} »`, cap(next)), redo: () => G.suite(n)};
  },
  vraiFaux(n){
    const pool = VF.filter(v => v[2] === n);
    if (!pool.length) return null;
    const [s, truth, , why] = pick(pool);
    return {n, prompt: `Vrai ou faux ?<br><b>${esc(s)}</b>`, opts: [{t: "Vrai", ok: truth}, {t: "Faux", ok: !truth}], explain: esc(why),
      review: rev(n, s, truth ? "Vrai" : "Faux"), redo: () => G.vraiFaux(n)};
  },
  vocab(n, typed){
    const pool = VOC.filter(v => v.n === n);
    if (!pool.length) return null;
    const v = pick(pool), base = {n, prompt: `Quel est le mot ?<br><b>${esc(v.def)}</b>`, explain: `C'est <b>${esc(v.word)}</b>.`,
      review: rev(n, v.def, v.word), redo: () => G.vocab(n, typed)};
    if (typed) return Object.assign(base, {explain: "", field: {label: "Le mot", lang: "fr", check: val => { const ok = wordOk(v.ok, val); return {ok, fix: ok ? "✓" : `→ ${v.word}`}; }}});
    const others = shuffle(VOC.filter(x => x !== v && !(v.not || []).includes(x.word))).slice(0, 3).map(x => ({t: x.word, ok: false}));
    return Object.assign(base, {opts: shuffle([{t: v.word, ok: true}, ...others])});
  },
  chiffre(n, typed){
    const pool = NUM.filter(x => x.n === n);
    if (!pool.length) return null;
    const x = pick(pool), u = x.unit, show = v => Revision.fmt(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + u;
    const base = {n, prompt: esc(x.q), explain: esc(x.why), review: rev(n, x.q, show(x.ans)), redo: () => G.chiffre(n, typed)};
    if (typed) return Object.assign(base, {field: {label: "Ta réponse", inputmode: "decimal", unit: u, check: val => {
      const raw = fold(String(val)).trim().toLowerCase();
      const word = WORDNUM[raw.split(/\s+/)[0]];
      const v = word !== undefined && /^[a-z]+(\s+[a-z]+)?$/.test(raw) ? word
        : Revision.parseNum(raw.replace(/\s/g, "").replace(/(m\/s|millions?|synapses?|hemispheres?)$/, ""));
      const ok = !isNaN(v) && Math.abs(v - x.ans) <= x.tol;
      return {ok, fix: ok ? "✓" : isNaN(v) ? `Écris un nombre. → ${show(x.ans)}` : `→ ${show(x.ans)}`};
    }}});
    return Object.assign(base, {opts: shuffle([{t: show(x.ans), ok: true}, ...x.traps.map(t => ({t: show(t), ok: false}))])});
  }
};
const KINDS_QUIZ = ["cours", "cours", "exemple", "aire", "schema", "suite", "vraiFaux", "vocab", "chiffre"];
function make(kinds, n, typed){
  for (const k of shuffle(kinds)) { const e = G[k](n, typed); if (e) return e; }
  return G.cours(n);
}

/* ---------- passage au moteur ---------- */
const asQuiz = e => ({unit: UBY[e.n], key: e.review, prompt: e.prompt, fig: e.fig, wide: e.wide, opts: e.opts, tip: e.tip,
  feedback: () => box(e.explain), review: e.review});
const asControl = e => Object.assign({unit: UBY[e.n], prompt: e.prompt, fig: e.fig, wide: e.wide, tip: e.tip, review: e.review,
  correction: () => e.explain ? `<p class="label" style="margin-top:4px">Correction</p>${box(e.explain)}` : "", redo: () => asControl(e.redo())},
  e.field ? {kind: "fields", fields: [e.field]} : {kind: "choice", opts: e.opts});

const card = (n, front, back, tip) => ({unit: UBY[n],
  front: `<div class="fbody"><span class="card-q">${front}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
  back: `<div class="fbody left"><span class="card-a">${back}</span>${tip ? `<span class="tip">${esc(tip)}</span>` : ""}</div>`});

Revision.start({
  key: "leandre-sciences-systeme-nerveux-v1",
  title: "Le système nerveux",
  subtitle: "Thème 1 · Corps humain et santé",
  eyebrow: "SVT · Chapitre 1",
  hand: "Du stimulus au mouvement, du neurone au cerveau",
  video: {src: "video.mp4", poster: "video.jpg", length: "6 min", title: "Le système nerveux, en vidéo",
    text: "Tout le chapitre résumé en 6 minutes. Idéal avant de commencer ou la veille du contrôle.",
    chapters: [[0, "Introduction"], [49, "1 · Le trajet du message"], [107, "2 · Neurones et synapses"], [186, "3 · Le cerveau, chef d'orchestre"],
      [235, "4 · Lésions et AVC"], [285, "5 · Les conduites addictives"], [335, "Conclusion"]]},
  groups: {
    "1": {name: "Le trajet du message", cls: "l1", filter: "Le trajet du message"},
    "2": {name: "La communication nerveuse", cls: "l2", filter: "Neurones et synapses"},
    "3": {name: "Le cerveau", cls: "l3", filter: "Le cerveau"}
  },
  units: UNITS,
  allLabel: () => "Tout le chapitre",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["la leçon", "Lis la question, retourne la carte : la leçon et des exemples."],
    quiz: ["10 questions", "Définitions, schéma du neurone, étapes dans l'ordre, vrai ou faux."],
    control: ["noté sur 20", "Tu écris les mots toi-même et tu légendes le neurone, comme à l'évaluation."]
  },
  cards: pool => {
    const ids = pool.map(u => u.id), out = COURS.filter(c => ids.includes(c.n)).map(c => card(c.n, esc(c.card), nl(c.a), c.tip));
    if (ids.includes("neu")) out.splice(Math.min(out.length, 9), 0, card("neu", `Légende le schéma du neurone${neuronFig()}`,
      "1 · les dendrites<br>2 · le corps cellulaire<br>3 · le noyau (il contient l'ADN)<br>4 · l'axone (la fibre nerveuse)<br>5 · la gaine de myéline<br>6 · les terminaisons de l'axone",
      "Titre à mettre : « Schéma d'un neurone »."));
    return out;
  },
  quiz: {count: 10, make: (pool, R) => asQuiz(make(KINDS_QUIZ, R.weighted(pool).id, false))},
  control: {
    lead: "13 questions : des mots à écrire, le schéma du neurone à légender, des étapes à remettre dans l'ordre et des questions de cours. Chaque question compte autant.",
    note: "Les accents, les majuscules et les articles ne comptent pas pour les mots. Pour les chiffres, une petite approximation est acceptée.",
    size: () => 13,
    build: (pool, R) => {
      const plan = ["vocab", "vocab", "vocab", "vocab", "schema", "chiffre", "exemple", "aire", "suite", "vraiFaux", "vraiFaux", "cours", "cours"];
      const ids = pool.map(u => u.id), items = [];
      for (const k of plan) {
        let e = null;
        for (let t = 0; t < 12 && !e; t++) {
          e = G[k](pick(ids), true);
          if (e && items.some(x => x.review === e.review)) e = null;
        }
        items.push(e || make(KINDS_QUIZ, pick(ids), true));
      }
      return shuffle(items).map(asControl);
    }
  }
});
})();
