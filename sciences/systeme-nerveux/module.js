/* Module : SVT · Thème 1 « Corps humain et santé », chapitre 1 : le système nerveux.
   Sources : cahier de Léandre (bilans des activités 1 et 2, brouillon du schéma fonctionnel de la sprinteuse),
   fiche « Les organes mis en jeu lors d'une course de 100 m » et « Le système nerveux central »,
   fiche « Les neurones » (documents 1 à 4 : neurone, transmission, synapse, neurone et muscle),
   activité 3 « Cerveau et message nerveux » (le téléphone sonne), TD « AVC de Jean » (aires cérébrales),
   TP « Système nerveux et conduites addictives », « Fiche mémo des 4èmes » (12 questions-réponses, reprises telles quelles). Film animé du chapitre (film.mp4), fait à partir de ces sources.
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
  {id: "add", group: "3", name: "Addictions et hygiène de vie", sub: "Drogues, dopamine, sommeil, se faire aider"}
].map(u => Object.assign(u, {tag: u.name}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- questions de cours : carte (recto/verso) + QCM (bonne réponse en premier) ----------
   fiche: k = question k de la « Fiche mémo des 4èmes » : question et réponse recopiées telles quelles. */
const COURS = [
  {fiche: 1, n: "snc", card: "Qu'est-ce que le système nerveux ?",
   a: "C'est un ensemble composé du cerveau, de la moelle épinière et d'un réseau de nerfs parcourant tout l'organisme. Le système nerveux commande et contrôle l'ensemble du corps.",
   o: ["C'est un ensemble composé du cœur, des vaisseaux sanguins et du sang qui parcourent tout l'organisme. Le système nerveux transporte l'oxygène dans l'ensemble du corps.",
       "C'est un ensemble composé des muscles, des os et des articulations de tout l'organisme. Le système nerveux permet au corps de tenir debout et de se déplacer.",
       "C'est uniquement le cerveau, qui se trouve dans la tête. La moelle épinière et les nerfs font partie d'un autre système, qui contrôle seulement les muscles."]},
  {fiche: 2, n: "trj", card: "Quel est le trajet du message qui permet de réaliser un mouvement ?",
   a: "Lors d'une stimulation, les messages nerveux sensoriels se propagent des organes sensoriels vers les centres nerveux qui envoient notamment des messages moteurs vers les muscles via les nerfs moteurs.",
   o: ["Lors d'une stimulation, les messages nerveux se propagent des muscles vers les organes sensoriels, qui envoient notamment des messages moteurs vers les centres nerveux via les nerfs sensitifs.",
       "Lors d'une stimulation, les messages nerveux sensoriels se propagent des organes sensoriels directement vers les muscles via les nerfs sensitifs, sans passer par les centres nerveux.",
       "Lors d'une stimulation, les messages nerveux moteurs se propagent des centres nerveux vers les organes sensoriels, qui envoient notamment des messages vers les muscles via les nerfs moteurs."]},
  {fiche: 3, n: "neu", card: "Quelles structures permettent la communication entre les différents organes du système nerveux ?",
   a: "Ce sont les cellules nerveuses, appelées les neurones.",
   o: ["Ce sont les cellules du sang, appelées les globules rouges.", "Ce sont les muscles, reliés entre eux par les tendons.", "Ce sont les os de la colonne, appelés les vertèbres."]},
  {fiche: 4, n: "neu", card: "Quelles sont les différentes parties d'un neurone ?",
   a: "Le corps cellulaire composé du noyau avec les dendrites, puis un prolongement nommé axone entouré de myéline.",
   o: ["Un noyau seul, entouré de neurotransmetteurs et de récepteurs.", "Le corps cellulaire composé de myéline, puis un prolongement nommé dendrite entouré de noyaux.",
       "Une synapse composée de vertèbres, puis un prolongement nommé moelle épinière."]},
  {fiche: 5, n: "neu", card: "Quelle est la nature du message nerveux qui circule dans un neurone ?",
   a: "Le message nerveux circule sous forme électrique le long du neurone.",
   o: ["Le message nerveux circule sous forme chimique, transporté par le sang.", "Le message nerveux circule sous forme d'ondes sonores le long du neurone.", "Le message nerveux circule sous forme de lumière le long du neurone."]},
  {fiche: 6, n: "syn", card: "Comment s'appelle le lieu de la transmission du message nerveux entre deux neurones ?",
   a: "C'est la synapse.", o: ["C'est l'axone.", "C'est la myéline.", "C'est le noyau."]},
  {fiche: 7, n: "syn", card: "Comment circule le message nerveux entre deux neurones ?",
   a: "Il y a une libération de neurotransmetteurs (molécules chimiques) dans la synapse.",
   o: ["Le message électrique saute directement d'un neurone à l'autre, sans aucune molécule.", "Il y a une libération de sang dans la synapse.", "Les deux neurones se collent et ne forment plus qu'une seule cellule."]},
  {fiche: 8, n: "syn", card: "Qu'est-ce qu'un neurotransmetteur ?",
   a: "C'est une molécule qui sert de messager entre deux neurones, ou entre un neurone et un muscle.",
   o: ["C'est une cellule nerveuse qui relie directement le cerveau aux muscles.", "C'est la gaine qui entoure l'axone et accélère le message.", "C'est une zone du cerveau spécialisée dans une fonction précise."]},
  {fiche: 9, n: "trj", card: "Qu'est-ce qu'un nerf ?",
   a: "C'est un cordon blanchâtre composé d'axones, qui permet de conduire les messages nerveux.",
   o: ["C'est un muscle très fin qui se contracte pour transmettre le mouvement.", "C'est une seule cellule nerveuse, très longue, qui part du cerveau.", "C'est un vaisseau qui transporte le sang jusqu'au cerveau."]},
  {fiche: 10, n: "int", card: "Quel est le rôle du cerveau dans le traitement de l'information ?",
   a: "Le cerveau intègre les informations sensorielles dans des zones spécialisées appelées « aires ». Et il élabore une réponse adaptée, comme un mouvement.",
   o: ["Le cerveau capte lui-même les sons et la lumière, sans avoir besoin des organes sensoriels. Il envoie ensuite ces informations aux muscles sans les modifier.", "Le cerveau ne traite pas les informations sensorielles : il les transmet telles quelles aux muscles. C'est la moelle épinière qui élabore la réponse adaptée.",
       "Le cerveau fabrique les neurotransmetteurs dans des zones appelées « aires ». Ils circulent ensuite dans le sang jusqu'aux muscles pour les faire bouger."]},
  {fiche: 11, n: "add", card: "C'est quoi l'addiction ?",
   a: "C'est une maladie qui se manifeste par une dépendance à une substance ou à une activité, et qui a des conséquences nuisibles sur la santé.",
   o: ["C'est une simple habitude, sans danger, qui disparaît toute seule.", "C'est une maladie des muscles due au manque de sport.", "C'est une zone du cerveau qui produit la sensation de plaisir."]},
  {fiche: 12, n: "add", card: "Quels sont les effets de nos comportements négatifs sur le système nerveux ?",
   a: "Une mauvaise hygiène de vie comme un manque de sommeil entraine une baisse des performances cérébrales. La consommation de drogues ou l'addiction aux jeux stimulent le circuit de la récompense et créent des dépendances. Il est important d'avoir une bonne hygiène de vie pour préserver le bon fonctionnement du système nerveux.",
   o: ["Le manque de sommeil n'a aucun effet sur les performances cérébrales. Seules les drogues agissent sur le cerveau, et les jeux ne créent jamais de dépendance. L'hygiène de vie compte surtout pour les muscles.",
       "Les drogues et les jeux vidéo stimulent les neurones et améliorent les performances cérébrales. Le sommeil ralentit le cerveau. Pour bien fonctionner, le système nerveux a besoin de stimulations fortes.",
       "Le système nerveux se répare tout seul pendant la nuit, quelle que soit la durée du sommeil. Les dépendances ne viennent que de l'alcool. L'hygiène de vie n'a pas d'effet sur le système nerveux."]},

  /* cartes en plus : une vraie question, une réponse courte */
  {n: "trj", card: "Qu'est-ce qu'un stimulus ?", q: "Un stimulus, c'est…",
   a: "Une information de l'environnement qui déclenche une réaction.\nEx. : le coup de feu pour la sprinteuse, la sonnerie du téléphone.",
   o: ["une information de l'environnement qui déclenche une réaction", "un muscle qui se contracte", "un nerf qui relie le cerveau aux muscles", "une molécule libérée dans la synapse"],
   tip: "Au pluriel, on dit des stimuli."},
  {n: "trj", card: "À quoi servent les organes sensoriels ?", q: "Les organes sensoriels (œil, oreille) servent à…",
   a: "À capter les informations de l'environnement : l'oreille capte les sons, l'œil capte la lumière.",
   o: ["capter les informations de l'environnement", "mettre le corps en mouvement", "décider de l'action à faire", "protéger la moelle épinière"]},
  {n: "trj", card: "Grâce à quelles cellules l'oreille capte-t-elle les sons ?", q: "L'oreille capte les sons grâce…",
   a: "Grâce aux cellules ciliées.", o: ["aux cellules ciliées", "aux neurotransmetteurs", "aux vertèbres", "à la myéline"]},
  {n: "trj", card: "Quel nerf transporte le message des organes sensoriels vers les centres nerveux ?", q: "Le message va des organes sensoriels vers les centres nerveux par…",
   a: "Le nerf sensitif.", o: ["les nerfs sensitifs", "les nerfs moteurs", "les muscles", "les vertèbres"]},
  {n: "trj", card: "Quel nerf transporte le message des centres nerveux vers les muscles ?", q: "Le message va des centres nerveux vers les muscles par…",
   a: "Le nerf moteur.", o: ["les nerfs moteurs", "les nerfs sensitifs", "les organes sensoriels", "la moelle épinière seule"],
   tip: "Attention : le nerf moteur n'est pas l'organe effecteur. Il relie le centre nerveux à l'organe effecteur (le muscle)."},
  {n: "trj", card: "Quels sont les organes effecteurs du mouvement ?", q: "Les organes effecteurs du mouvement sont…",
   a: "Les muscles : ils se contractent et mettent le corps en mouvement.", o: ["les muscles", "les yeux et les oreilles", "les nerfs sensitifs", "les vertèbres"]},
  {n: "trj", card: "Remets dans l'ordre : nerf moteur, stimulus, centre nerveux, muscle, organe sensoriel, nerf sensitif.", q: "Quel est le bon ordre ?",
   a: "Stimulus → organe sensoriel → nerf sensitif → centre nerveux → nerf moteur → muscle.\nEx. : coup de feu → oreille → nerf sensitif → cerveau → nerf moteur → muscles des jambes.",
   o: ["organe sensoriel → nerf sensitif → centre nerveux → nerf moteur → muscle", "muscle → nerf moteur → centre nerveux → nerf sensitif → organe sensoriel",
       "organe sensoriel → nerf moteur → centre nerveux → nerf sensitif → muscle", "centre nerveux → organe sensoriel → muscle → nerf sensitif"]},
  {n: "trj", card: "À quelle vitesse se propagent les messages nerveux ?", q: "Les messages nerveux se propagent à environ…",
   a: "Environ 100 m/s (cent mètres par seconde).", o: ["100 m/s", "1 m/s", "10 000 m/s", "1 km/h"]},

  {n: "snc", card: "Qu'est-ce qui forme le système nerveux central ?", q: "Le système nerveux central (le centre nerveux) est formé…",
   a: "L'encéphale (dont la plus grande partie est le cerveau) et la moelle épinière.",
   o: ["de l'encéphale et de la moelle épinière", "des yeux et des oreilles", "des nerfs et des muscles", "du cœur et des poumons"]},
  {n: "snc", card: "Qu'est-ce qui protège la moelle épinière ?", q: "La moelle épinière est protégée par…",
   a: "Les vertèbres de la colonne vertébrale.", o: ["les vertèbres de la colonne vertébrale", "les côtes", "la myéline", "les muscles du dos"]},
  {n: "snc", card: "Que se passe-t-il quand le système nerveux est lésé ?", q: "Quand le système nerveux est lésé…",
   a: "Il n'y a plus de communication entre les organes, donc plus de mouvement : c'est la paralysie.",
   o: ["il n'y a plus de communication entre les organes : c'est la paralysie", "les muscles se contractent plus vite", "le message nerveux va deux fois plus vite", "rien ne change"]},

  {n: "neu", card: "À quoi sert la myéline ?", q: "La myéline sert…",
   a: "À augmenter la vitesse du message nerveux. C'est une gaine qui entoure l'axone.",
   o: ["à augmenter la vitesse du message", "à fabriquer des neurotransmetteurs", "à protéger la moelle épinière", "à contracter le muscle"]},
  {n: "neu", card: "Où se trouvent les dendrites ?", q: "Les dendrites sont…",
   a: "Autour du corps cellulaire : ce sont de petites ramifications.",
   o: ["de petites ramifications autour du corps cellulaire", "le noyau du neurone", "la gaine autour de l'axone", "des molécules libérées dans la synapse"],
   tip: "Le bout de l'axone se ramifie aussi : ce sont les terminaisons de l'axone."},
  {n: "neu", card: "Où se trouve le noyau du neurone, et que contient-il ?", q: "Le noyau du neurone se trouve…",
   a: "Dans le corps cellulaire. Il contient l'ADN.", o: ["dans le corps cellulaire", "au bout de l'axone", "dans la myéline", "dans la synapse"]},
  {n: "neu", card: "Dans combien de sens le message circule-t-il le long d'un neurone ?", q: "Le long d'un neurone, le message circule…",
   a: "Dans un seul sens : des dendrites vers le corps cellulaire, puis le long de l'axone.",
   o: ["dans un seul sens", "dans les deux sens", "dans tous les sens", "il ne circule pas"]},

  {n: "syn", card: "Combien de synapses possède un neurone ?", q: "Un neurone possède environ…",
   a: "Environ 1 000 à 10 000 synapses avec d'autres neurones.", o: ["1 000 à 10 000 synapses", "1 ou 2 synapses", "10 à 100 synapses", "une seule synapse"]},
  {n: "syn", card: "Sur quoi se fixent les neurotransmetteurs ?", q: "Les neurotransmetteurs se fixent sur…",
   a: "Sur des récepteurs du neurone suivant (ou du muscle). Un nouveau message électrique repart alors.",
   o: ["des récepteurs", "des vertèbres", "des cellules ciliées", "la myéline"]},
  {n: "syn", card: "Le message nerveux est électrique dans le neurone. Et dans la synapse ?", q: "Dans la synapse, le message nerveux est…",
   a: "Chimique : ce sont des molécules, les neurotransmetteurs.", o: ["chimique", "électrique", "sonore", "lumineux"]},

  {n: "mus", card: "Comment le message nerveux fait-il contracter un muscle ?", q: "Comment le message nerveux fait-il contracter un muscle ?",
   a: "Le neurone libère des neurotransmetteurs, qui se fixent sur les récepteurs des fibres musculaires : le muscle se contracte.",
   o: ["le neurone libère des neurotransmetteurs qui se fixent sur le muscle", "le muscle se contracte tout seul, sans message", "le sang transporte le message électrique", "l'oreille envoie des ondes sonores au muscle"]},
  {n: "mus", card: "Pourquoi l'anesthésie relâche-t-elle les muscles ?", q: "Pendant une opération, l'anesthésie…",
   a: "Elle bloque la communication entre les cellules nerveuses et les cellules musculaires.",
   o: ["bloque la communication entre les nerfs et les muscles", "accélère le message nerveux", "fabrique de la myéline", "fait contracter les muscles"]},

  {n: "air", card: "Combien d'hémisphères a le cerveau ?", q: "Le cerveau est formé de…",
   a: "Deux : l'hémisphère droit et l'hémisphère gauche.", o: ["deux hémisphères, droit et gauche", "quatre hémisphères", "un seul bloc", "deux moelles épinières"]},
  {n: "air", card: "Qu'est-ce qu'une aire cérébrale ?", q: "Une aire cérébrale, c'est…",
   a: "Une zone du cerveau spécialisée dans une fonction précise (voir, entendre, bouger…).",
   o: ["une zone du cerveau spécialisée dans une fonction précise", "une cellule nerveuse", "un nerf qui va au muscle", "une molécule de plaisir"]},
  {n: "air", card: "Où arrivent les messages nerveux sensitifs ?", q: "Les messages nerveux sensitifs arrivent…",
   a: "Dans les aires sensitives du cerveau : visuelle, auditive, olfactive, gustative, somesthésique.",
   o: ["dans les aires sensitives du cerveau", "dans les muscles", "dans les vertèbres", "dans les organes sensoriels"]},
  {n: "air", card: "Quelles aires commandent les mouvements ?", q: "Quelles aires commandent les mouvements ?",
   a: "Les aires motrices : elles envoient les ordres aux muscles.", o: ["les aires motrices", "l'aire visuelle", "l'aire olfactive", "l'aire gustative"]},
  {n: "air", card: "Où se trouve l'aire visuelle ?", q: "L'aire visuelle se trouve…",
   a: "À l'arrière du cerveau.", o: ["à l'arrière du cerveau", "à l'avant, juste derrière les yeux", "dans la moelle épinière", "dans l'oreille"]},
  {n: "air", card: "Qu'est-ce qu'un AVC ?", q: "Un AVC, c'est…",
   a: "Un accident vasculaire cérébral, par exemple une hémorragie soudaine dans le cerveau. La zone touchée peut être abîmée pour toujours.",
   o: ["un accident vasculaire cérébral", "une maladie des muscles", "une drogue", "un organe sensoriel"]},
  {n: "air", card: "Un AVC touche l'aire visuelle. Quelles conséquences ?", q: "L'AVC de Jean a touché l'aire visuelle. Il aura surtout…",
   a: "Des troubles de la vision : la personne peut confondre les formes et les couleurs.",
   o: ["des troubles de la vision (formes, couleurs)", "des troubles de l'odorat", "des troubles du goût", "aucune conséquence"],
   tip: "Méthode du TD : je localise la zone touchée, je trouve l'aire, j'en déduis les troubles."},

  {n: "int", card: "Le téléphone sonne. Dans quel ordre les aires du cerveau travaillent-elles ?", q: "Le téléphone sonne. Quelle aire est activée en premier ?",
   a: "1. L'aire auditive entend la sonnerie.\n2. L'aire de la mémoire reconnaît le son.\n3. L'aire de la prise de décision décide de répondre.\n4. L'aire motrice envoie l'ordre au bras.",
   o: ["l'aire auditive", "l'aire motrice", "l'aire de la prise de décision", "l'aire visuelle"]},
  {n: "int", card: "Qu'est-ce que l'intégration ?", q: "L'intégration, c'est…",
   a: "Le traitement en même temps, par le cerveau, de toutes les informations reçues des organes sensoriels et échangées dans le cerveau.",
   o: ["le traitement en même temps de toutes les informations par le cerveau", "la contraction d'un muscle", "la fabrication de myéline", "la libération de dopamine"],
   tip: "Le cerveau est comme un chef d'orchestre : il analyse les infos et les met en relation."},
  {n: "int", card: "À quoi sert la mémoire quand on perçoit l'environnement ?", q: "La mémoire permet…",
   a: "À reconnaître ce qu'on a déjà vécu (par exemple la sonnerie de son téléphone).",
   o: ["de reconnaître ce qu'on a déjà vécu", "de faire bouger le bras", "de capter les sons", "de protéger la moelle épinière"]},
  {n: "int", card: "Quelle aire décide de l'action à faire ?", q: "Quelle aire décide de l'action à faire ?",
   a: "L'aire préfrontale (l'aire de la prise de décision), à l'avant du cerveau.",
   o: ["l'aire préfrontale (prise de décision)", "l'aire auditive", "l'aire de la mémoire", "l'aire visuelle"]},

  {n: "add", card: "Qu'est-ce que la dopamine ?", q: "La dopamine est…",
   a: "Une substance chimique qui assure la communication entre neurones et qui provoque la sensation de plaisir.",
   o: ["une substance qui assure la communication entre neurones et provoque le plaisir", "une drogue", "une aire du cerveau", "une gaine autour de l'axone"]},
  {n: "add", card: "Comment les drogues agissent-elles sur le cerveau ?", q: "Les drogues perturbent les synapses du cerveau : elles…",
   a: "Elles augmentent la libération de dopamine dans les synapses : c'est ce qui crée la dépendance.",
   o: ["augmentent la libération de dopamine", "diminuent la libération de dopamine", "détruisent la moelle épinière", "fabriquent de la myéline"]},
  {n: "add", card: "Que peuvent provoquer certaines drogues sur la vue ?", q: "Certaines drogues modifient la perception visuelle et provoquent…",
   a: "Des hallucinations, qui peuvent être dangereuses.", o: ["des hallucinations", "une meilleure vue", "la paralysie", "plus de myéline"]},
  {n: "add", card: "Quelles sont les conséquences d'une addiction ?", q: "Une addiction a des conséquences…",
   a: "Des conséquences négatives sur la vie personnelle, professionnelle et sociale.",
   o: ["négatives sur la vie personnelle, professionnelle et sociale", "seulement positives", "aucune", "seulement sur la vue"]},
  {n: "add", card: "En France, quelle substance a le plus d'usagers chaque jour ?", q: "En France (11-75 ans), quelle substance a le plus d'usagers quotidiens ?",
   a: "Le tabac : environ 12 millions. Puis l'alcool (5 millions) et le cannabis (850 000).",
   o: ["le tabac", "l'alcool", "le cannabis", "aucune, elles sont à égalité"]},
  {n: "add", card: "Qui peut aider à sortir d'une addiction ?", q: "Pour sortir d'une addiction, on a souvent besoin…",
   a: "Un professionnel de santé (médecin, addictologue, psychiatre), avec souvent un traitement et un suivi psychologique.\nTabac info service : 39 89.",
   o: ["d'un accompagnement par un professionnel de santé", "de rester seul sans en parler", "de consommer davantage", "de changer de drogue"]}
].map((c, i) => Object.assign(c, {id: c.fiche ? "f" + c.fiche : "c" + i,
  q: c.q || c.card, o: c.fiche ? [c.a, ...c.o] : c.o}));
const FICHE = COURS.filter(c => c.fiche);

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
  {def: "Cordon blanchâtre composé d'axones, qui permet de conduire les messages nerveux.", word: "un nerf", ok: ["nerf"], n: "trj"},
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
  ["Le manque de sommeil fait baisser les performances du cerveau.", true, "add", "Oui : une mauvaise hygiène de vie (comme le manque de sommeil) entraîne une baisse des performances cérébrales."],
  ["L'addiction aux jeux vidéo peut créer une dépendance, comme une drogue.", true, "add", "Oui : elle stimule le circuit de la récompense et crée une dépendance."],
  ["Un nerf est une seule cellule nerveuse.", false, "trj", "Non : un nerf est un cordon composé de nombreux axones."],
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
    const own = COURS.filter(x => x.n === n && !x.fiche), c = pick(own.length ? own : COURS.filter(x => x.n === n));
    return {n, prompt: esc(c.q), wide: true, opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), explain: nl(c.a), tip: c.tip,
      review: rev(n, c.q, c.o[0]), redo: () => G.cours(n)};
  },
  fiche(n){
    const pool = FICHE.filter(x => x.n === n);
    if (!pool.length) return null;
    const c = pick(pool);
    return {n, fiche: c.fiche, prompt: `<span class="label">Fiche mémo · question ${c.fiche}</span><br>${esc(c.card)}`, wide: true,
      opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), explain: `La bonne réponse (en vert) est celle de la fiche mémo, mot pour mot : c'est elle qu'il faut savoir redire.`,
      review: rev(n, `Fiche mémo, question ${c.fiche} : ${c.card}`, c.a), redo: () => G.fiche(n)};
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

const card = (n, front, back, tip, fiche) => ({unit: UBY[n],
  front: `<div class="fbody">${fiche ? `<span class="label">Fiche mémo · question ${fiche}</span>` : ""}<span class="card-q">${front}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
  back: `<div class="fbody left"><span class="card-a">${back}</span>${tip ? `<span class="tip">${esc(tip)}</span>` : ""}</div>`});

Revision.start({
  key: "leandre-sciences-systeme-nerveux-v1",
  title: "Le système nerveux",
  subtitle: "Thème 1 · Corps humain et santé",
  eyebrow: "SVT · Chapitre 1",
  hand: "Du stimulus au mouvement, du neurone au cerveau",
  video: {src: "film.mp4", poster: "film.jpg", length: "5 min", title: "Le film du chapitre",
    text: "Tout le chapitre en 5 minutes, schémas animés et phrases de la fiche mémo. Idéal avant les cartes ou la veille du contrôle.",
    chapters: [[0, "Introduction"], [9, "1 · Le trajet du message"], [74, "2 · Le neurone"], [129, "3 · La synapse"],
      [174, "4 · Le cerveau"], [240, "5 · Addictions et hygiène de vie"], [286, "À retenir"]]},
  groups: {
    "1": {name: "Le trajet du message", cls: "l1", filter: "Le trajet du message"},
    "2": {name: "La communication nerveuse", cls: "l2", filter: "Neurones et synapses"},
    "3": {name: "Le cerveau", cls: "l3", filter: "Le cerveau"}
  },
  units: UNITS,
  allLabel: () => "Tout le chapitre",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["la leçon", "Les 12 questions de la fiche mémo, puis le reste du cours, à réviser chaque jour."],
    quiz: ["10 questions", "Les questions de la fiche mémo, le schéma du neurone, les étapes dans l'ordre."],
    control: ["noté sur 20", "Tu écris les mots toi-même et tu légendes le neurone, comme à l'évaluation."]
  },
  cards: pool => {
    const ids = pool.map(u => u.id);
    const out = COURS.filter(c => ids.includes(c.n)).map(c => card(c.n, esc(c.card), nl(c.a), c.tip, c.fiche));
    const k = out.findIndex((c, i) => i >= FICHE.length && c.unit.id === "neu");
    if (ids.includes("neu")) out.splice(k >= 0 ? k : out.length, 0, card("neu", `Légende le schéma du neurone${neuronFig()}`,
      "1 · les dendrites<br>2 · le corps cellulaire<br>3 · le noyau (il contient l'ADN)<br>4 · l'axone (la fibre nerveuse)<br>5 · la gaine de myéline<br>6 · les terminaisons de l'axone",
      "Titre à mettre : « Schéma d'un neurone »."));
    return out;
  },
  quiz: {count: 10, make: (pool, R, i) => {
    const n = R.weighted(pool).id, f = i % 5 < 2 ? G.fiche(n) : null;   // environ 4 questions sur 10 viennent de la fiche mémo
    return asQuiz(f || make(KINDS_QUIZ, n, false));
  }},
  control: {
    lead: "13 questions : des mots à écrire, le schéma du neurone à légender, des questions de la fiche mémo, des étapes à remettre dans l'ordre. Chaque question compte autant.",
    note: "Les accents, les majuscules et les articles ne comptent pas pour les mots. Pour les chiffres, une petite approximation est acceptée.",
    size: () => 13,
    build: (pool, R) => {
      const plan = ["vocab", "vocab", "vocab", "vocab", "schema", "fiche", "fiche", "exemple", "aire", "suite", "vraiFaux", "cours", "chiffre"];
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
