/* Module : Français · Grammaire « Les types et les formes de phrases ».
   Sources : cahier de Léandre, 3 photos (novembre 2026) —
   - page 1 : 2. le type injonctif, 3. le type interrogatif, l'interrogation totale et partielle,
     « La phrase est nécessairement de forme affirmative ou négative », « Il dort → phrase déclarative de forme affirmative » ;
   - page 2 : les formes active, passive, impersonnelle et exclamative, « Exercices sur Classroom ».
   Tout le cours est écrit en rouge : les définitions sont reprises mot pour mot dans PAR_COEUR.
   Corrigé par rapport au cahier : forme passive « le sujet SUBIT l'action » (le cahier dit « fait ») ;
   « exprimée » (le cahier écrit « exprimé ») ; « Taisez-vous ! » (trait d'union).
   La partie 1 (le type déclaratif) n'a pas été photographiée : la carte sur le type déclaratif suit le programme de 4e.
   Les exercices (phrases à analyser, transformations) sont écrits pour le niveau 4e.
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";
const {esc, shuffle, pick, fold} = Revision;

/* ---------- notions ---------- */
const UNITS = [
  {id: "typ", group: "1", name: "Les trois types de phrases", sub: "Déclaratif, injonctif, interrogatif : un seul type par phrase"},
  {id: "inj", group: "1", name: "Le type injonctif", sub: "Ordre, conseil, invitation, interdiction"},
  {id: "int", group: "1", name: "Le type interrogatif", sub: "Poser une question : intonation, est-ce que, inversion"},
  {id: "itp", group: "1", name: "Interrogation totale ou partielle", sub: "Oui / non, ou un mot interrogatif"},
  {id: "neg", group: "2", name: "Affirmative ou négative", sub: "Ne… pas, ne… plus, ne… jamais, ne… rien"},
  {id: "pas", group: "2", name: "Active ou passive", sub: "Le sujet fait ou subit l'action ; le complément d'agent"},
  {id: "imp", group: "2", name: "La forme impersonnelle", sub: "« il » ne représente rien ni personne"},
  {id: "exc", group: "2", name: "La forme exclamative", sub: "Exprimer une émotion"}
].map(u => Object.assign(u, {tag: u.name}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- le « par cœur » : les définitions en rouge du cahier ---------- */
const C2 = "Cours, partie 2", C3 = "Cours, partie 3", CI = "Cours, les deux types d'interrogation", CF = "Cours, les formes de phrases";
const PAR_COEUR = [
  {id: "inj1", n: "inj", source: C2, q: "Que fait une phrase de type injonctif, et comment se termine-t-elle ?",
   text: "Une phrase de type injonctif donne un ordre, un conseil, une invitation ou exprime une interdiction. Elle se termine par un point ou un point d'exclamation.",
   trous: ["ordre", "interdiction", "exclamation"],
   pieges: [["donne un ordre, un conseil, une invitation ou exprime une interdiction", "pose une question, donne une information ou exprime une émotion"],
            ["par un point ou un point d'exclamation", "toujours par un point d'exclamation"], ["un conseil, une invitation", "une émotion, une information"]]},
  {id: "int1", n: "int", source: C3, q: "Que fait une phrase de type interrogatif, et comment se termine-t-elle ?",
   text: "Une phrase de type interrogatif pose une question. Elle se termine par un point d'interrogation.", trous: ["question", "interrogation"],
   pieges: [["pose une question", "donne un ordre"], ["par un point d'interrogation", "par un point ou un point d'exclamation"], ["pose une question", "exprime une émotion"]]},
  {id: "itp1", n: "itp", source: CI, q: "Qu'est-ce que l'interrogation totale ?",
   text: "L'interrogation totale porte sur la totalité de la phrase. On peut y répondre par oui, non ou peut-être.", trous: ["totalité", "peut-être"],
   pieges: [["la totalité de la phrase", "une partie de la phrase"], ["On peut y répondre par oui, non ou peut-être", "On ne peut pas y répondre par oui ou par non"],
            ["L'interrogation totale", "L'interrogation partielle"]]},
  {id: "itp2", n: "itp", source: CI, q: "Qu'est-ce que l'interrogation partielle ?",
   text: "L'interrogation partielle porte sur une partie de la phrase. On ne peut pas répondre par oui ou par non. Elle est introduite par un mot interrogatif.", trous: ["partie", "interrogatif"],
   pieges: [["une partie de la phrase", "la totalité de la phrase"], ["On ne peut pas répondre par oui ou par non", "On peut toujours répondre par oui ou par non"],
            ["par un mot interrogatif", "par « est-ce que »"]]},
  {id: "neg1", n: "neg", source: CF, q: "Une phrase est-elle forcément affirmative ou négative ?",
   text: "La phrase est nécessairement de forme affirmative ou négative.", trous: ["affirmative", "négative"],
   pieges: [["nécessairement", "rarement"], ["de forme affirmative ou négative", "de forme exclamative ou impersonnelle"], ["affirmative ou négative", "affirmative et négative"]]},
  {id: "pas1", n: "pas", source: CF, q: "Quand une phrase est-elle de forme active ?",
   text: "Une phrase est de forme active quand le verbe est à la voix active, c'est-à-dire que le sujet fait l'action exprimée par le verbe.", trous: ["active", "fait"],
   pieges: [["le sujet fait l'action", "le sujet subit l'action"], ["est à la voix active", "est à la voix passive"], ["le sujet fait", "le complément d'agent fait"]]},
  {id: "pas2", n: "pas", source: CF, q: "Quand une phrase est-elle de forme passive ?",
   text: "Une phrase est de forme passive quand le verbe est à la voix passive, c'est-à-dire que le sujet subit l'action exprimée par le verbe.", trous: ["passive", "subit"],
   pieges: [["le sujet subit l'action", "le sujet fait l'action"], ["est à la voix passive", "est à la voix active"], ["le sujet subit l'action exprimée par le verbe", "le sujet subit l'action exprimée par l'adjectif"]]},
  {id: "imp1", n: "imp", source: CF, q: "Quand une phrase est-elle de forme impersonnelle ?",
   text: "Une phrase est de forme impersonnelle quand elle contient un verbe impersonnel, c'est-à-dire un verbe à la 3e personne du singulier dont « il » ne représente rien ni personne.",
   trous: ["impersonnel", "singulier"],
   pieges: [["du singulier", "du pluriel"], ["ne représente rien ni personne", "représente toujours une personne"], ["à la 3e personne", "à la 1re personne"]]},
  {id: "exc1", n: "exc", source: CF, q: "Quand une phrase est-elle de forme exclamative ?",
   text: "Une phrase est de forme exclamative quand elle exprime une émotion.", trous: ["émotion"],
   pieges: [["exprime une émotion", "pose une question"], ["exprime une émotion", "donne un ordre"], ["exprime une émotion", "donne une information"]]}
];
const PBY = n => PAR_COEUR.filter(p => p.n === n);

/* ---------- banque de phrases à analyser ----------
   t : type ; nw : 2e mot de la négation (pre : la négation commence la phrase, « Personne n'… ») ;
   exc : forme exclamative ; nu / mode : nuance et mode de l'injonction ; it / mot : interrogation totale ou partielle, mot interrogatif */
const D = (s, o = {}) => Object.assign({s, t: "dec"}, o), I = (s, o) => Object.assign({s, t: "inj"}, o), Q = (s, o) => Object.assign({s, t: "int"}, o);
const SENT = [
  D("Le train part à huit heures."), D("Il dort."), D("Ma sœur adore les romans policiers."), D("Les élèves sont sortis en silence."),
  D("Victor Frankenstein donne vie à une créature."), D("Nous n'irons pas à la piscine demain.", {nw: "pas"}),
  D("Le gardien ne ferme jamais la grille.", {nw: "jamais"}), D("Personne n'a vu le voleur.", {nw: "personne", pre: true}),
  D("Il ne pleut plus depuis ce matin.", {nw: "plus"}), D("Je n'ai rien compris à cette histoire.", {nw: "rien"}),
  I("Taisez-vous !", {nu: "ordre", mode: "impératif", exc: 1}), I("Qu'il sorte !", {nu: "ordre", mode: "subjonctif", exc: 1}),
  I("Ne pas écrire sur les tables.", {nu: "interdiction", mode: "infinitif", nw: "pas"}), I("Range ta chambre.", {nu: "ordre", mode: "impératif"}),
  I("Prends ton parapluie, il va pleuvoir.", {nu: "conseil", mode: "impératif"}), I("Ne marchez pas sur la pelouse.", {nu: "interdiction", mode: "impératif", nw: "pas"}),
  I("Venez dîner à la maison samedi soir.", {nu: "invitation", mode: "impératif"}), I("Couvre-toi bien avant de sortir.", {nu: "conseil", mode: "impératif"}),
  I("Ne touche plus à ce vase !", {nu: "interdiction", mode: "impératif", nw: "plus", exc: 1}),
  I("Ne pas se pencher par la fenêtre.", {nu: "interdiction", mode: "infinitif", nw: "pas"}),
  I("Entrez donc et asseyez-vous près du feu.", {nu: "invitation", mode: "impératif"}),
  Q("Pourquoi le ciel est-il bleu ?", {it: "part", mot: "pourquoi"}), Q("Veux-tu un bonbon ?", {it: "tot"}), Q("Viendras-tu demain ?", {it: "tot"}),
  Q("Dans quel pays se déroule l'histoire de Frankenstein ?", {it: "part", mot: "quel"}), Q("Où as-tu rangé mes clés ?", {it: "part", mot: "où"}),
  Q("Est-ce que tu as fini tes devoirs ?", {it: "tot"}), Q("Quand partons-nous en vacances ?", {it: "part", mot: "quand"}),
  Q("Qui a cassé la vitre ?", {it: "part", mot: "qui"}), Q("Comment s'appelle ton professeur de français ?", {it: "part", mot: "comment"}),
  Q("N'as-tu pas entendu la sonnerie ?", {it: "tot", nw: "pas"}), Q("Pourquoi n'es-tu pas venu hier ?", {it: "part", mot: "pourquoi", nw: "pas"}),
  Q("Combien coûte ce livre ?", {it: "part", mot: "combien"}), Q("Tu viens avec nous ?", {it: "tot"}), Q("Que fais-tu ce week-end ?", {it: "part", mot: "que"}),
  Q("Avez-vous déjà lu Frankenstein ?", {it: "tot"}), Q("Ne veux-tu jamais m'écouter ?", {it: "tot", nw: "jamais"})
];
const TYPES = {dec: "déclaratif", inj: "injonctif", int: "interrogatif"};
const TFEM = {dec: "déclarative", inj: "injonctive", int: "interrogative"};
const NU = {ordre: "un ordre", conseil: "un conseil", invitation: "une invitation", interdiction: "une interdiction"};
const MODE = {"impératif": "à l'impératif", subjonctif: "au subjonctif", infinitif: "à l'infinitif"};

/* ---------- transformations ---------- */
/* [phrase active, phrase passive, verbe passif, complément d'agent (sans « par »), 3 fausses phrases passives] */
const PASSIF = [
  ["Le chat mange la souris.", "La souris est mangée par le chat.", "est mangée", "le chat",
   ["Le chat est mangé par la souris.", "La souris a été mangée par le chat.", "La souris est mangé par le chat."]],
  ["La pluie a interrompu le match.", "Le match a été interrompu par la pluie.", "a été interrompu", "la pluie",
   ["La pluie a été interrompue par le match.", "Le match est interrompu par la pluie.", "Le match a interrompu la pluie."]],
  ["Le jardinier arrose les fleurs.", "Les fleurs sont arrosées par le jardinier.", "sont arrosées", "le jardinier",
   ["Le jardinier est arrosé par les fleurs.", "Les fleurs ont été arrosées par le jardinier.", "Les fleurs sont arrosé par le jardinier."]],
  ["Un chien a mordu le facteur.", "Le facteur a été mordu par un chien.", "a été mordu", "un chien",
   ["Un chien a été mordu par le facteur.", "Le facteur est mordu par un chien.", "Le facteur a mordu un chien."]],
  ["La tempête détruira la cabane.", "La cabane sera détruite par la tempête.", "sera détruite", "la tempête",
   ["La cabane est détruite par la tempête.", "La tempête sera détruite par la cabane.", "La cabane sera détruit par la tempête."]],
  ["Le maire inaugurait la nouvelle école.", "La nouvelle école était inaugurée par le maire.", "était inaugurée", "le maire",
   ["La nouvelle école a été inaugurée par le maire.", "Le maire était inauguré par la nouvelle école.", "La nouvelle école était inauguré par le maire."]],
  ["Les pompiers ont sauvé les enfants.", "Les enfants ont été sauvés par les pompiers.", "ont été sauvés", "les pompiers",
   ["Les enfants sont sauvés par les pompiers.", "Les pompiers ont été sauvés par les enfants.", "Les enfants ont été sauvé par les pompiers."]],
  ["Mary Shelley a imaginé Frankenstein.", "Frankenstein a été imaginé par Mary Shelley.", "a été imaginé", "Mary Shelley",
   ["Frankenstein est imaginé par Mary Shelley.", "Mary Shelley a été imaginée par Frankenstein.", "Frankenstein a imaginé Mary Shelley."]],
  ["Le vent emporte les feuilles.", "Les feuilles sont emportées par le vent.", "sont emportées", "le vent",
   ["Le vent est emporté par les feuilles.", "Les feuilles ont été emportées par le vent.", "Les feuilles sont emporté par le vent."]],
  ["Le professeur corrige les copies.", "Les copies sont corrigées par le professeur.", "sont corrigées", "le professeur",
   ["Le professeur est corrigé par les copies.", "Les copies ont été corrigées par le professeur.", "Les copies sont corrigé par le professeur."]]
];
/* active ou passive ? [phrase, passive ?, explication] — avec les pièges du passé composé avec être */
const VOIX = [
  ["La souris est mangée par le chat.", true, "Le sujet « la souris » subit l'action ; « par le chat » est le complément d'agent."],
  ["Le match a été interrompu par la pluie.", true, "Le sujet « le match » subit l'action : verbe à la voix passive (a été interrompu)."],
  ["La pluie a interrompu le match.", false, "Le sujet « la pluie » fait l'action."],
  ["Les fleurs sont arrosées chaque matin.", true, "Le sujet « les fleurs » subit l'action, même sans complément d'agent."],
  ["Paul est parti tôt ce matin.", false, "« est parti » est le passé composé de partir (auxiliaire être) : Paul fait l'action."],
  ["Elle est tombée dans l'escalier.", false, "« est tombée » est le passé composé de tomber : le sujet fait l'action."],
  ["Les élèves sont arrivés en retard.", false, "« sont arrivés » est le passé composé de arriver : les élèves font l'action."],
  ["Le voleur a été arrêté par la police.", true, "Le sujet « le voleur » subit l'action ; « par la police » est le complément d'agent."],
  ["La police a arrêté le voleur.", false, "Le sujet « la police » fait l'action."],
  ["Ce roman sera traduit en anglais.", true, "Le sujet « ce roman » subit l'action (sera traduit), sans complément d'agent."],
  ["Victor Frankenstein crée une créature.", false, "Le sujet « Victor Frankenstein » fait l'action."],
  ["La créature est rejetée par son créateur.", true, "Le sujet « la créature » subit l'action ; « par son créateur » est le complément d'agent."]
];
/* « il » impersonnel ? [phrase, impersonnel ?, explication] */
const IMPERS = [
  ["Il pleut depuis ce matin.", true, "Pleuvoir est un verbe de météo : « il » ne représente rien ni personne."],
  ["Il neige sur la montagne.", true, "Neiger est un verbe de météo : « il » ne représente rien ni personne."],
  ["Il faut finir ce travail.", true, "Falloir est toujours impersonnel."],
  ["Il fait très froid aujourd'hui.", true, "« Il fait froid » : « il » ne représente rien ni personne."],
  ["Il tombe de la neige.", true, "Ici, « il » ne représente rien : c'est la neige qui tombe."],
  ["Il y a un chat sur le toit.", true, "« Il y a » est une tournure impersonnelle."],
  ["Il manque deux élèves.", true, "« il » ne représente rien : ce sont deux élèves qui manquent."],
  ["Il est arrivé un accident.", true, "« il » ne représente rien : c'est un accident qui est arrivé."],
  ["Il vaut mieux partir tôt.", true, "« Il vaut mieux » est une tournure impersonnelle."],
  ["Il tombe dans l'escalier et se fait mal.", false, "« il » représente quelqu'un : on peut dire « Paul tombe dans l'escalier »."],
  ["Il fait ses devoirs dans sa chambre.", false, "« il » représente quelqu'un : « Paul fait ses devoirs »."],
  ["Il court vers la sortie.", false, "« il » représente quelqu'un qui court."],
  ["Il arrive à huit heures.", false, "« il » représente quelqu'un qui arrive : « Mon père arrive à huit heures »."],
  ["Il manque de sommeil.", false, "« il » représente quelqu'un qui est fatigué : « Tom manque de sommeil »."]
];
/* phrases de forme exclamative / pièges non exclamatifs */
const EXC_OUI = ["Quelle merveilleuse idée !", "Comme il fait beau !", "Que ce paysage est beau !", "Quel courage !", "Tais-toi !", "Je suis si heureux de te revoir !", "Quelle peur j'ai eue !"];
const EXC_NON = ["Il fait beau.", "Quel temps fait-il ?", "Comme il faisait beau, nous sommes sortis.", "Que fais-tu ce soir ?", "Combien coûte ce livre ?", "Je suis heureux de te revoir."];
/* mettre à la forme négative : [phrase, négation demandée, bonne réponse, 3 pièges] */
const NEGT = [
  ["Il pleut encore.", "ne… plus", "Il ne pleut plus.", ["Il pleut plus.", "Il ne pleut encore plus.", "Il ne plus pleut."]],
  ["Nous avons vu quelqu'un.", "ne… personne", "Nous n'avons vu personne.", ["Nous avons vu personne.", "Nous n'avons personne vu.", "Nous ne avons vu personne."]],
  ["Elle a tout compris.", "ne… rien", "Elle n'a rien compris.", ["Elle a rien compris.", "Elle n'a compris rien.", "Elle ne a rien compris."]],
  ["Je mange toujours à la cantine.", "ne… jamais", "Je ne mange jamais à la cantine.", ["Je mange jamais à la cantine.", "Je ne jamais mange à la cantine.", "Je ne mange toujours jamais à la cantine."]],
  ["Tu as des frères.", "ne… pas", "Tu n'as pas de frères.", ["Tu as pas de frères.", "Tu ne as pas de frères.", "Tu n'as de frères pas."]],
  ["Prends ce chemin.", "ne… pas", "Ne prends pas ce chemin.", ["Prends pas ce chemin.", "Ne pas prends ce chemin.", "Ne prends ce chemin pas."]],
  ["Il faut se presser.", "ne… pas", "Il ne faut pas se presser.", ["Il faut pas se presser.", "Il ne pas faut se presser.", "Il ne faut se presser pas."]],
  ["Veux-tu venir ?", "ne… pas", "Ne veux-tu pas venir ?", ["Veux-tu pas venir ?", "Ne veux pas-tu venir ?", "Ne pas veux-tu venir ?"]]
];
/* poser une question sur le groupe souligné : [phrase avec {groupe}, bonne question, 3 pièges] */
const PARTQ = [
  ["Léa part {demain}.", "Quand Léa part-elle ?", ["Léa part-elle demain ?", "Où Léa part-elle ?", "Qui part demain ?"]],
  ["{Le chat} a renversé le vase.", "Qui a renversé le vase ?", ["Le chat a-t-il renversé le vase ?", "Qu'a renversé le chat ?", "Pourquoi le chat a-t-il renversé le vase ?"]],
  ["Les enfants jouent {dans le jardin}.", "Où les enfants jouent-ils ?", ["Les enfants jouent-ils dans le jardin ?", "Quand les enfants jouent-ils ?", "Comment les enfants jouent-ils ?"]],
  ["Tom est en retard {parce que son bus est tombé en panne}.", "Pourquoi Tom est-il en retard ?", ["Tom est-il en retard ?", "Quand Tom est-il en retard ?", "Où Tom est-il en retard ?"]],
  ["Ce livre coûte {douze euros}.", "Combien coûte ce livre ?", ["Ce livre coûte-t-il douze euros ?", "Pourquoi ce livre coûte-t-il douze euros ?", "Quel livre coûte douze euros ?"]],
  ["Il est venu {à vélo}.", "Comment est-il venu ?", ["Est-il venu à vélo ?", "Où est-il venu ?", "Quand est-il venu ?"]],
  ["L'histoire de Frankenstein se déroule {en Suisse}.", "Où se déroule l'histoire de Frankenstein ?", ["L'histoire de Frankenstein se déroule-t-elle en Suisse ?", "Quand se déroule l'histoire de Frankenstein ?", "Pourquoi l'histoire de Frankenstein se déroule-t-elle en Suisse ?"]]
];

/* ---------- questions de cours : carte + QCM (o[0] = bonne réponse) ---------- */
const COURS = [
  {n: "typ", card: "Quels sont les trois types de phrases ?", a: "Le type déclaratif, le type injonctif et le type interrogatif.\nUne phrase n'a qu'un seul type.",
   q: "Quels sont les trois types de phrases ?", o: ["déclaratif, injonctif, interrogatif", "affirmatif, négatif, interrogatif", "actif, passif, impersonnel", "déclaratif, exclamatif, négatif"]},
  {n: "typ", card: "Que fait une phrase de type déclaratif ?", a: "Elle donne une information : elle raconte, décrit ou explique. Elle se termine le plus souvent par un point.\nEx. : Il dort.",
   q: "Une phrase de type déclaratif…", o: ["donne une information", "pose une question", "donne un ordre", "exprime toujours une émotion"]},
  {n: "typ", card: "Quelle différence entre le type et la forme d'une phrase ?", a: "Une phrase a un seul type (déclaratif, injonctif ou interrogatif), mais elle a plusieurs formes : affirmative ou négative, active ou passive, et parfois impersonnelle ou exclamative.\nEx. : « Il dort. » → phrase déclarative de forme affirmative.",
   q: "« Il dort. » est une phrase…", o: ["déclarative de forme affirmative", "injonctive de forme affirmative", "déclarative de forme négative", "interrogative de forme affirmative"]},
  {n: "typ", card: "Comment reconnaître le type d'une phrase ?", a: "On se demande ce qu'elle fait :\ninformer → déclaratif ;\nfaire agir quelqu'un → injonctif ;\nposer une question → interrogatif.",
   q: "Une phrase qui cherche à faire agir quelqu'un est de type…", o: ["injonctif", "déclaratif", "interrogatif", "impersonnel"]},
  {n: "inj", card: "Avec quels modes peut-on écrire une phrase injonctive ?", a: "Avec l'impératif : Taisez-vous !\nAvec le subjonctif : Qu'il sorte !\nAvec l'infinitif : Ne pas écrire sur les tables.",
   q: "Dans « Qu'il sorte ! », le verbe est au…", o: ["subjonctif", "impératif", "infinitif", "futur"]},
  {n: "inj", card: "« Ne pas écrire sur les tables. » : quel type de phrase ?", a: "Une phrase injonctive : elle exprime une interdiction, avec un verbe à l'infinitif. Elle se termine par un simple point.",
   q: "« Ne pas écrire sur les tables. » exprime…", o: ["une interdiction", "une question", "une invitation", "une information"]},
  {n: "inj", card: "Une phrase injonctive se termine-t-elle toujours par un point d'exclamation ?", a: "Non : par un point ou un point d'exclamation.\nEx. : Ne pas écrire sur les tables. / Taisez-vous !",
   q: "Laquelle de ces phrases injonctives se termine par un simple point ?", o: ["Ne pas écrire sur les tables.", "Taisez-vous !", "Qu'il sorte !", "Tais-toi !"]},
  {n: "inj", card: "Quelle différence entre un ordre et un conseil ?", a: "Un ordre oblige : Range ta chambre !\nUn conseil aide l'autre, pour son bien : Prends ton parapluie, il va pleuvoir.",
   q: "« Prends ton parapluie, il va pleuvoir. » exprime…", o: ["un conseil", "une interdiction", "une question", "une invitation"]},
  {n: "int", card: "Quelles sont les trois façons de poser une question ?", a: "Avec l'intonation : Tu viens ?\nAvec « est-ce que » : Est-ce que tu viens ?\nAvec l'inversion du sujet : Viens-tu ?",
   q: "Dans « Viens-tu ? », la question est posée…", o: ["par l'inversion du sujet", "avec « est-ce que »", "par la seule intonation", "avec un mot interrogatif"]},
  {n: "int", card: "Quand le sujet est inversé, comment écrit-on le verbe et le pronom ?", a: "Avec un trait d'union : Veux-tu ? Viendras-tu ?\nEt avec -t- quand le verbe finit par une voyelle : A-t-il fini ? Viendra-t-elle ?",
   q: "Quelle est la bonne écriture ?", o: ["A-t-il fini ?", "A-il fini ?", "A t-il fini ?", "A-t'il fini ?"]},
  {n: "int", card: "Dans « Pourquoi le ciel est-il bleu ? », que reprend le pronom « il » ?", a: "Il reprend le sujet « le ciel », répété après le verbe : est-il. Le sujet est à la fois avant et après le verbe.",
   q: "Dans « Pourquoi le ciel est-il bleu ? », le pronom « il » reprend…", o: ["le ciel", "pourquoi", "bleu", "personne"]},
  {n: "itp", card: "Quels sont les principaux mots interrogatifs ?", a: "qui, que, quoi, quel (quelle, quels, quelles), lequel, où, quand, comment, pourquoi, combien.",
   q: "Lequel de ces mots est un mot interrogatif ?", o: ["combien", "est-ce que", "oui", "ne"]},
  {n: "itp", card: "« Est-ce que tu viens ? » : interrogation totale ou partielle ?", a: "Totale : on peut répondre par oui ou par non.\n« Est-ce que » n'est pas un mot interrogatif : il annonce seulement la question.",
   q: "« Est-ce que tu as fini ? » est une interrogation…", o: ["totale", "partielle", "injonctive", "impersonnelle"]},
  {n: "itp", card: "Comment transformer une interrogation totale en interrogation partielle ?", a: "On ajoute un mot interrogatif qui porte sur une partie de la phrase :\nViendras-tu demain ? → Quand viendras-tu ?",
   q: "Laquelle de ces questions est une interrogation partielle ?", o: ["Quand viendras-tu ?", "Viendras-tu demain ?", "Est-ce que tu viendras ?", "Tu viendras demain ?"]},
  {n: "neg", card: "Quels mots forment la négation ?", a: "Deux mots qui encadrent le verbe : ne… pas, ne… plus, ne… jamais, ne… rien, ne… personne.\nDevant une voyelle, ne devient n' : Je n'ai rien vu.",
   q: "Quelle phrase est de forme négative ?", o: ["Je n'ai rien vu.", "J'ai tout vu.", "Je vois bien.", "Ai-je tout vu ?"]},
  {n: "neg", card: "Où se place la négation avec un temps composé (passé composé…) ?", a: "Elle encadre l'auxiliaire : Je n'ai pas fini. Nous n'avons jamais vu la mer.",
   q: "Quelle est la bonne écriture ?", o: ["Je n'ai pas fini.", "Je n'ai fini pas.", "Je ne pas ai fini.", "J'ai ne pas fini."]},
  {n: "neg", card: "Où se place la négation avec un infinitif ?", a: "Les deux mots se placent ensemble devant l'infinitif : Ne pas écrire sur les tables. Ne pas toucher.",
   q: "Quelle est la bonne écriture ?", o: ["Ne pas toucher.", "Ne toucher pas.", "Toucher ne pas.", "Pas ne toucher."]},
  {n: "neg", card: "À l'oral, on dit souvent « Je sais pas ». Qu'écrit-on ?", a: "Je ne sais pas. À l'écrit, la négation a toujours ses deux mots : il ne faut pas oublier « ne ».",
   q: "À l'écrit, on doit écrire…", o: ["Je ne sais pas.", "Je sais pas.", "Je pas sais.", "Je sais ne pas."]},
  {n: "neg", card: "Une phrase interrogative ou injonctive peut-elle être négative ?", a: "Oui ! Toute phrase est affirmative ou négative, quel que soit son type.\nN'as-tu pas entendu ? → interrogative négative.\nNe marchez pas sur la pelouse. → injonctive négative.",
   q: "« Ne marchez pas sur la pelouse. » est une phrase…", o: ["injonctive de forme négative", "déclarative de forme négative", "injonctive de forme affirmative", "interrogative de forme négative"]},
  {n: "pas", card: "Comment se forme un verbe à la voix passive ?", a: "Auxiliaire être, au temps du verbe actif, + participe passé accordé avec le sujet.\nLa souris est mangée. Le match a été interrompu.",
   q: "Un verbe à la voix passive se forme avec…", o: ["être + participe passé", "avoir + participe passé", "être + infinitif", "avoir + infinitif"]},
  {n: "pas", card: "Qu'est-ce que le complément d'agent ?", a: "Dans une phrase passive, c'est celui qui fait l'action. Il est introduit par « par » (parfois « de »).\nLe match a été interrompu par la pluie.",
   q: "Dans « Le match a été interrompu par la pluie », le complément d'agent est…", o: ["par la pluie", "le match", "a été interrompu", "interrompu"]},
  {n: "pas", card: "Comment passer de la forme active à la forme passive ?", a: "Le COD devient sujet, le sujet devient complément d'agent, et le verbe passe à la voix passive, au même temps.\nLa pluie a interrompu le match. → Le match a été interrompu par la pluie.",
   q: "À la forme passive, le COD de la phrase active devient…", o: ["le sujet", "le complément d'agent", "le verbe", "un adjectif"]},
  {n: "pas", card: "« Paul est parti. » : est-ce une phrase passive ?", a: "Non ! « est parti » est le passé composé de partir, avec l'auxiliaire être. Paul fait l'action : la phrase est active.\nAstuce : une phrase passive peut recevoir un complément d'agent (« par… »).",
   q: "Laquelle de ces phrases est de forme passive ?", o: ["Les fleurs sont arrosées chaque matin.", "Paul est parti tôt.", "Elle est tombée.", "Les élèves sont arrivés."]},
  {n: "pas", card: "Le complément d'agent est-il obligatoire ?", a: "Non : il peut manquer. « Ce roman sera traduit en anglais. » est passive, même si on ne dit pas par qui.",
   q: "« Ce roman sera traduit en anglais. » est une phrase…", o: ["passive, sans complément d'agent", "active", "passive, avec un complément d'agent", "impersonnelle"]},
  {n: "imp", card: "Quels verbes sont toujours impersonnels ?", a: "Les verbes de météo (il pleut, il neige, il grêle) et falloir (il faut).",
   q: "Lequel de ces verbes est toujours impersonnel ?", o: ["falloir", "tomber", "courir", "faire"]},
  {n: "imp", card: "Un verbe ordinaire peut-il être employé à la forme impersonnelle ?", a: "Oui : Il tombe de la neige. Il manque deux élèves. Il est arrivé un accident. Il y a un chat sur le toit. Il fait froid.",
   q: "Dans « Il tombe de la neige », le pronom « il »…", o: ["ne représente rien ni personne", "représente un enfant qui tombe", "est un pronom interrogatif", "est au pluriel"]},
  {n: "imp", card: "« Il tombe dans l'escalier » : forme impersonnelle ?", a: "Non : ici, « il » représente quelqu'un. On peut le remplacer : Paul tombe dans l'escalier. La phrase est personnelle.",
   q: "Dans laquelle de ces phrases « il » est-il impersonnel ?", o: ["Il fait froid.", "Il fait ses devoirs.", "Il court vite.", "Il arrive à huit heures."]},
  {n: "exc", card: "Par quels mots commence souvent une phrase exclamative ?", a: "Quel (quelle…), que, comme, combien… et elle se termine par un point d'exclamation.\nQuelle merveilleuse idée ! Comme il fait beau !",
   q: "Laquelle de ces phrases est exclamative ?", o: ["Comme il fait beau !", "Comme il faisait beau, nous sommes sortis.", "Quel temps fait-il ?", "Il fait beau."]},
  {n: "exc", card: "Quelles émotions peut exprimer une phrase exclamative ?", a: "La joie, la surprise, la colère, la peur, l'admiration, la tristesse…\nQuelle merveilleuse idée ! (admiration, joie)",
   q: "« Quelle merveilleuse idée ! » exprime…", o: ["l'admiration ou la joie", "une question", "une interdiction", "une simple information"]},
  {n: "exc", card: "Une phrase injonctive peut-elle être exclamative ?", a: "Oui : « Tais-toi ! » est de type injonctif (un ordre) et de forme exclamative (elle exprime une émotion, l'agacement).",
   q: "« Tais-toi ! » est une phrase…", o: ["injonctive de forme exclamative", "interrogative de forme exclamative", "déclarative de forme passive", "injonctive de forme passive"]}
];

/* ---------- vrai ou faux ---------- */
const VF = [
  ["Une phrase a un seul type, mais elle a plusieurs formes.", true, "typ", "Oui : « Ne touche plus à ce vase ! » est injonctive, de forme négative et exclamative."],
  ["« Il dort. » est une phrase déclarative de forme affirmative.", true, "typ", "Oui : elle donne une information, sans négation."],
  ["Une phrase déclarative pose une question.", false, "typ", "Non : elle donne une information. C'est la phrase interrogative qui pose une question."],
  ["Une phrase injonctive se termine toujours par un point d'exclamation.", false, "inj", "Non : par un point ou un point d'exclamation (Ne pas écrire sur les tables.)."],
  ["Une phrase injonctive peut exprimer un conseil.", true, "inj", "Oui : ordre, conseil, invitation ou interdiction."],
  ["« Qu'il sorte ! » est une phrase injonctive.", true, "inj", "Oui : elle donne un ordre, avec un verbe au subjonctif."],
  ["Une phrase interrogative se termine par un point d'interrogation.", true, "int", "Oui, toujours."],
  ["« Tu viens ? » n'est pas une question, car le sujet n'est pas inversé.", false, "int", "Si : l'intonation (et le « ? » à l'écrit) suffit à poser une question."],
  ["On peut répondre par oui ou par non à une interrogation partielle.", false, "itp", "Non : c'est l'interrogation totale. L'interrogation partielle commence par un mot interrogatif."],
  ["« Viendras-tu demain ? » est une interrogation totale.", true, "itp", "Oui : on peut répondre oui, non ou peut-être."],
  ["« Est-ce que » est un mot interrogatif qui introduit une interrogation partielle.", false, "itp", "Non : « Est-ce que tu viens ? » est une interrogation totale (réponse oui ou non)."],
  ["« Pourquoi le ciel est-il bleu ? » est une interrogation partielle.", true, "itp", "Oui : elle commence par le mot interrogatif « pourquoi »."],
  ["Une phrase peut être à la fois affirmative et négative.", false, "neg", "Non : elle est nécessairement de forme affirmative OU négative."],
  ["Une phrase interrogative peut être de forme négative.", true, "neg", "Oui : N'as-tu pas entendu la sonnerie ?"],
  ["À l'écrit, « Je sais pas » est correct.", false, "neg", "Non : il manque « ne » : Je ne sais pas."],
  ["Dans une phrase passive, le sujet subit l'action.", true, "pas", "Oui : La souris est mangée par le chat."],
  ["« Paul est parti tôt » est une phrase passive.", false, "pas", "Non : « est parti » est le passé composé de partir. Paul fait l'action."],
  ["À la voix passive, le verbe se construit avec l'auxiliaire avoir.", false, "pas", "Non : avec être + participe passé (est mangée, a été interrompu)."],
  ["Le complément d'agent est souvent introduit par « par ».", true, "pas", "Oui : … interrompu par la pluie."],
  ["Dans « Il pleut », « il » ne représente rien ni personne.", true, "imp", "Oui : c'est une phrase impersonnelle."],
  ["« Il court vers la sortie » est une phrase impersonnelle.", false, "imp", "Non : « il » représente quelqu'un qui court."],
  ["Un verbe impersonnel est conjugué à la 3e personne du pluriel.", false, "imp", "Non : à la 3e personne du singulier (il pleut, il faut)."],
  ["Une phrase exclamative exprime une émotion.", true, "exc", "Oui : joie, surprise, colère, peur, admiration…"],
  ["« Quel temps fait-il ? » est une phrase exclamative.", false, "exc", "Non : « quel » est ici un mot interrogatif ; la phrase pose une question."],
  ["« Tais-toi ! » est à la fois injonctive et exclamative.", true, "exc", "Oui : elle donne un ordre et exprime une émotion."]
];

/* ---------- outils ---------- */
const lowq = s => String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/œ/g, "oe").replace(/\s+/g, " ").trim();
const clean = s => fold(lowq(s)).replace(/-/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const noArt = s => s.replace(/^(l|le|la|les|un|une|des|d|de|du) /, "").replace(/s$/, "");
const trouOk = (t, v) => { const a = clean(String(v).replace(/'/g, "' ")), g = clean(t); return !!a && noArt(a) === noArt(g); };
const strip = h => String(h).replace(/<[^>]+>/g, "").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const tagOf = n => `<span class="tag ${({1: "l1", 2: "l2"})[UBY[n].group]}">${esc(UBY[n].name)}</span>`;
const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;
const nl = s => esc(s).replace(/\n/g, "<br>");
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const BLANK = `<b class="blank" style="letter-spacing:1px">_____</b>`;
const wordRe = w => new RegExp(`(^|[^\\p{L}\\d])(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=[^\\p{L}\\d]|$)`, "gu");
const pcLabel = p => `<span class="label">À savoir par cœur · ${esc(p.source)}</span>`;
const q = s => `<span class="q">${esc(s)}</span>`;
const typeKey = v => { const a = clean(v); return /^decla/.test(a) ? "dec" : /^injon/.test(a) ? "inj" : /^interro/.test(a) ? "int" : null; };
const negKey = v => { const a = clean(v); return /^affirm/.test(a) ? false : /^negat/.test(a) ? true : null; };
const negOf = x => x.pre ? `${x.nw}… ne` : `ne… ${x.nw}`;
/* l'explication complète d'une phrase de la banque */
function why(x){
  const t = x.t === "dec" ? "Elle donne une information : type <b>déclaratif</b>."
    : x.t === "inj" ? `Elle exprime ${NU[x.nu]}, avec un verbe ${MODE[x.mode]} : type <b>injonctif</b>.`
    : `Elle pose une question (point d'interrogation) : type <b>interrogatif</b>, interrogation ${x.it === "tot" ? "totale" : "partielle"}.`;
  const f = x.nw ? ` Forme <b>négative</b> : ${esc(negOf(x))}.` : " Forme <b>affirmative</b> : pas de négation.";
  return t + f + (x.exc ? " Forme <b>exclamative</b> : elle exprime une émotion." : "");
}
const anaLabel = (t, neg, exc) => `${cap(TFEM[t])} de forme ${neg ? "négative" : "affirmative"}${exc ? " et exclamative" : ""}`;
const totWhy = x => x.it === "tot"
  ? `On peut y répondre par oui, non ou peut-être : interrogation <b>totale</b>.${/^Est-ce que/.test(x.s) ? " « Est-ce que » n'est pas un mot interrogatif." : ""}`
  : `Elle est introduite par le mot interrogatif <b>« ${esc(x.mot)} »</b> : on ne peut pas répondre par oui ou par non. Interrogation <b>partielle</b>.`;

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
      const w = esc(t);
      html = html.replace(wordRe(w), `$1<b class="blank">…(${i + 1})…</b>`);
      all = all.replace(wordRe(w), `$1<b>${w}</b>`);
    });
    return {n, prompt: `${pcLabel(p)}<br>Complète la phrase du cours :<br><span class="q">${html}</span>`, wide: true,
      fields: tr.map((t, i) => ({label: tr.length > 1 ? `Mot ${i + 1}` : "Le mot", lang: "fr", check: v => { const ok = trouOk(t, v); return {ok, fix: ok ? "✓" : `→ ${t}`}; }})),
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
    const [s, truth, , w] = pick(pool);
    return {n, prompt: `Vrai ou faux ?<br><b>${esc(s)}</b>`, opts: [{t: "Vrai", ok: truth}, {t: "Faux", ok: !truth}], explain: esc(w),
      review: rev(n, s, truth ? "Vrai" : "Faux"), redo: () => G.vf(n)};
  },
  /* le type d'une phrase */
  typeOf(n, typed){
    if (!["typ", "inj", "int"].includes(n)) return null;
    const x = pick(n === "typ" || Math.random() < 0.4 ? SENT : SENT.filter(s => s.t === n));
    const base = {n, explain: why(x), review: rev(n, `Type de la phrase « ${x.s} »`, TYPES[x.t]), redo: () => G.typeOf(n, typed)};
    if (typed) return Object.assign(base, {prompt: `Quel est le <b>type</b> de cette phrase ?<br>${q(x.s)}`,
      fields: [{label: "Type : déclaratif, injonctif ou interrogatif", lang: "fr", check: v => { const ok = typeKey(v) === x.t; return {ok, fix: ok ? "✓" : `→ ${TYPES[x.t]}`}; }}]});
    return Object.assign(base, {prompt: `Quel est le type de cette phrase ?<br>${q(x.s)}`,
      opts: ["dec", "inj", "int"].map(t => ({t: cap(TYPES[t]), ok: t === x.t}))});
  },
  /* type + forme */
  ana(n, typed){
    if (n !== "typ" && n !== "neg") return null;
    const x = pick(SENT), neg = !!x.nw, good = anaLabel(x.t, neg, x.exc);
    const base = {n, explain: why(x), review: rev(n, `Analyse de « ${x.s} »`, good), redo: () => G.ana(n, typed)};
    if (typed) return Object.assign(base, {prompt: `Analyse cette phrase : donne son <b>type</b> et dis si elle est <b>affirmative ou négative</b>.<br>${q(x.s)}`,
      fields: [
        {label: "Type", lang: "fr", check: v => { const ok = typeKey(v) === x.t; return {ok, fix: ok ? "✓" : `→ ${TYPES[x.t]}`}; }},
        {label: "Affirmative ou négative ?", lang: "fr", check: v => { const ok = negKey(v) === neg; return {ok, fix: ok ? "✓" : `→ ${neg ? "négative" : "affirmative"}`}; }}]});
    const others = ["dec", "inj", "int"].filter(t => t !== x.t);
    const cand = shuffle([anaLabel(x.t, !neg, x.exc), anaLabel(others[0], neg, x.exc), anaLabel(others[1], neg, x.exc),
      anaLabel(pick(others), !neg, x.exc), anaLabel(x.t, neg, !x.exc)]);
    const bad = [...new Set(cand)].filter(t => t !== good).slice(0, 3);
    return Object.assign(base, {prompt: `Quelle est la bonne analyse de cette phrase ?<br>${q(x.s)}`, wide: true,
      opts: shuffle([{t: good, ok: true}, ...bad.map(t => ({t, ok: false}))])});
  },
  nuance(n){
    if (n !== "inj") return null;
    const x = pick(SENT.filter(s => s.nu));
    return {n, prompt: `Cette phrase injonctive exprime…<br>${q(x.s)}`, opts: Object.keys(NU).map(k => ({t: cap(NU[k]), ok: k === x.nu})),
      explain: why(x), review: rev(n, x.s, NU[x.nu]), redo: () => G.nuance(n)};
  },
  mode(n){
    if (n !== "inj") return null;
    const x = pick(SENT.filter(s => s.mode));
    return {n, prompt: `Dans cette phrase injonctive, à quel mode est le verbe ?<br>${q(x.s)}`,
      opts: ["impératif", "subjonctif", "infinitif", "indicatif"].map(m => ({t: cap(m), ok: m === x.mode})),
      explain: `Le verbe est ${MODE[x.mode]}. Une phrase injonctive peut se construire avec l'impératif (Taisez-vous !), le subjonctif (Qu'il sorte !) ou l'infinitif (Ne pas écrire sur les tables.).`,
      review: rev(n, `Mode du verbe dans « ${x.s} »`, x.mode), redo: () => G.mode(n)};
  },
  totpart(n, typed){
    if (n !== "itp") return null;
    const x = pick(SENT.filter(s => s.it)), good = x.it === "tot" ? "totale" : "partielle";
    const base = {n, explain: totWhy(x), review: rev(n, `« ${x.s} » : interrogation…`, good), redo: () => G.totpart(n, typed)};
    if (typed) return Object.assign(base, {prompt: `Interrogation <b>totale</b> ou <b>partielle</b> ?<br>${q(x.s)}`,
      fields: [{label: "Totale ou partielle ?", lang: "fr", check: v => { const a = clean(v), k = /^total/.test(a) ? "tot" : /^partiel/.test(a) ? "part" : null, ok = k === x.it; return {ok, fix: ok ? "✓" : `→ ${good}`}; }}]});
    return Object.assign(base, {prompt: `Interrogation totale ou partielle ?<br>${q(x.s)}`,
      opts: [{t: "Totale", ok: x.it === "tot"}, {t: "Partielle", ok: x.it === "part"}]});
  },
  motInt(n, typed){
    if (n !== "itp") return null;
    const x = pick(SENT.filter(s => s.it === "part")), m = x.mot;
    const base = {n, explain: totWhy(x), review: rev(n, `Mot interrogatif de « ${x.s} »`, m), redo: () => G.motInt(n, typed)};
    if (typed) return Object.assign(base, {prompt: `Cette interrogation est partielle. Quel est le <b>mot interrogatif</b> ?<br>${q(x.s)}`,
      fields: [{label: "Le mot interrogatif", lang: "fr", check: v => { const w = clean(v).split(" ").filter(Boolean), ok = w.length > 0 && w.length <= 3 && w.includes(clean(m)); return {ok, fix: ok ? "✓" : `→ ${m}`}; }}]});
    const words = [...new Set(x.s.split(/[^\p{L}]+/u).filter(w => w.length >= 2 && clean(w) !== clean(m)).map(w => w.toLowerCase()))];
    if (words.length < 3) return G.totpart(n, false);
    return Object.assign(base, {prompt: `Quel est le mot interrogatif de cette phrase ?<br>${q(x.s)}`,
      opts: shuffle([{t: m, ok: true}, ...shuffle(words).slice(0, 3).map(t => ({t, ok: false}))])});
  },
  partielle(n){
    if (n !== "itp") return null;
    const [s, good, bad] = pick(PARTQ), html = esc(s).replace(/\{([^}]+)\}/, "<u>$1</u>");
    return {n, prompt: `Quelle question porte sur le groupe souligné ?<br><span class="q">${html}</span>`, wide: true,
      opts: shuffle([{t: good, ok: true}, ...bad.map(t => ({t, ok: false}))]),
      explain: `<b>${esc(good)}</b> : interrogation partielle, introduite par un mot interrogatif qui porte sur le groupe souligné.`,
      review: rev(n, `Question sur « ${s.match(/\{([^}]+)\}/)[1]} » dans « ${s.replace(/[{}]/g, "")} »`, good), redo: () => G.partielle(n)};
  },
  affneg(n, typed){
    if (n !== "neg") return null;
    const x = pick(SENT), neg = !!x.nw, good = neg ? "négative" : "affirmative";
    const explain = neg ? `Forme <b>négative</b> : la négation ${esc(negOf(x))}.` : "Forme <b>affirmative</b> : il n'y a pas de négation.";
    const base = {n, explain, review: rev(n, `« ${x.s} » : forme…`, good), redo: () => G.affneg(n, typed)};
    if (typed) return Object.assign(base, {prompt: `Cette phrase est-elle de forme <b>affirmative</b> ou <b>négative</b> ?<br>${q(x.s)}`,
      fields: [{label: "Affirmative ou négative ?", lang: "fr", check: v => { const ok = negKey(v) === neg; return {ok, fix: ok ? "✓" : `→ ${good}`}; }}]});
    return Object.assign(base, {prompt: `Cette phrase est de forme…<br>${q(x.s)}`, opts: [{t: "Affirmative", ok: !neg}, {t: "Négative", ok: neg}]});
  },
  negTransfo(n){
    if (n !== "neg") return null;
    const [s, w, good, bad] = pick(NEGT);
    return {n, prompt: `Mets cette phrase à la forme négative avec <b>« ${esc(w)} »</b> :<br>${q(s)}`, wide: true,
      opts: shuffle([{t: good, ok: true}, ...bad.map(t => ({t, ok: false}))]),
      explain: `<b>${esc(good)}</b><br>Les deux mots de la négation encadrent le verbe conjugué (ou l'auxiliaire), et « ne » devient « n' » devant une voyelle.`,
      review: rev(n, `${s} → forme négative (${w})`, good), redo: () => G.negTransfo(n)};
  },
  negWords(n, typed){
    if (n !== "neg") return null;
    if (!typed) return G.negTransfo(n);
    const x = pick(SENT.filter(s => s.nw && !s.pre));
    return {n, prompt: `Cette phrase est négative. Écris les <b>deux mots</b> qui forment la négation.<br>${q(x.s)}`,
      fields: [
        {label: "1er mot", lang: "fr", check: v => { const ok = ["ne", "n"].includes(clean(v)); return {ok, fix: ok ? "✓" : "→ ne (ou n')"}; }},
        {label: "2e mot", lang: "fr", check: v => { const ok = clean(v) === clean(x.nw); return {ok, fix: ok ? "✓" : `→ ${x.nw}`}; }}],
      explain: `La négation est <b>${esc(negOf(x))}</b>.`, review: rev(n, `Négation de « ${x.s} »`, negOf(x)), redo: () => G.negWords(n, typed)};
  },
  voix(n){
    if (n !== "pas") return null;
    const [s, p, w] = pick(VOIX);
    return {n, prompt: `Cette phrase est-elle de forme active ou passive ?<br>${q(s)}`, opts: [{t: "Active", ok: !p}, {t: "Passive", ok: p}],
      explain: `Forme <b>${p ? "passive" : "active"}</b> : ${esc(w)}`, review: rev(n, s, p ? "passive" : "active"), redo: () => G.voix(n)};
  },
  passif(n, typed){
    if (n !== "pas") return null;
    const [a, p, v, , bad] = pick(PASSIF);
    const explain = `<b>${esc(p)}</b><br>Le COD devient sujet, le sujet devient complément d'agent, et le verbe passe à la voix passive (être + participe passé accordé), au même temps.`;
    const base = {n, explain, review: rev(n, `${a} → forme passive`, p), redo: () => G.passif(n, typed)};
    if (typed) {
      const html = esc(p).replace(esc(v), BLANK);
      return Object.assign(base, {prompt: `Mets la phrase à la forme <b>passive</b>, au même temps. Écris le verbe qui manque :<br>${q(a)}<br>→ <span class="q">${html}</span>`,
        fields: [{label: "Le verbe à la voix passive", lang: "fr", check: x => {
          const g = clean(v), r = clean(x);
          if (r === g) return {ok: true, fix: "✓"};
          const sameBut = !!r && r.replace(/[es]+$/, "") === g.replace(/[es]+$/, "");
          return {ok: false, fix: `→ ${v}${sameBut ? " (accorde le participe passé avec le sujet !)" : ""}`};
        }}]});
    }
    return Object.assign(base, {prompt: `Quelle est la phrase passive qui correspond, au même temps ?<br>${q(a)}`, wide: true,
      opts: shuffle([{t: p, ok: true}, ...bad.map(t => ({t, ok: false}))])});
  },
  agent(n, typed){
    if (n !== "pas") return null;
    const [, p, v, ag] = pick(PASSIF), subj = p.split(v)[0].trim();
    const base = {n, explain: `Dans <b>${esc(p)}</b>, c'est « ${esc(ag)} » qui fait l'action : <b>par ${esc(ag)}</b> est le complément d'agent.`,
      review: rev(n, `Complément d'agent de « ${p} »`, `par ${ag}`), redo: () => G.agent(n, typed)};
    if (typed) return Object.assign(base, {prompt: `Quel est le <b>complément d'agent</b> de cette phrase passive ?<br>${q(p)}`,
      fields: [{label: "Le complément d'agent", lang: "fr", check: x => { const r = noArt(clean(x).replace(/^par /, "")), ok = !!r && r === noArt(clean(ag)); return {ok, fix: ok ? "✓" : `→ par ${ag}`}; }}]});
    return Object.assign(base, {prompt: `Quel est le complément d'agent de cette phrase ?<br>${q(p)}`,
      opts: shuffle([{t: `par ${ag}`, ok: true}, {t: subj, ok: false}, {t: v, ok: false}, {t: "Il n'y en a pas.", ok: false}])});
  },
  impers(n){
    if (n !== "imp") return null;
    if (Math.random() < 0.5) {
      const [s, t, w] = pick(IMPERS);
      return {n, prompt: `Dans cette phrase, le pronom « il » est-il impersonnel ?<br>${q(s)}`, wide: true,
        opts: [{t: "Oui : il ne représente rien ni personne", ok: t}, {t: "Non : il représente quelqu'un", ok: !t}],
        explain: esc(w), review: rev(n, s, t ? "impersonnelle" : "personnelle (« il » représente quelqu'un)"), redo: () => G.impers(n)};
    }
    const want = Math.random() < 0.6, good = pick(IMPERS.filter(x => x[1] === want)), bad = shuffle(IMPERS.filter(x => x[1] !== want)).slice(0, 3);
    return {n, prompt: want ? "Laquelle de ces phrases est de forme <b>impersonnelle</b> ?" : "Dans laquelle de ces phrases « il » <b>représente quelqu'un</b> ?",
      opts: shuffle([{t: good[0], ok: true}, ...bad.map(x => ({t: x[0], ok: false}))]), explain: `<b>${esc(good[0])}</b> ${esc(good[2])}`,
      review: rev(n, want ? "Phrase impersonnelle" : "« il » représente quelqu'un", good[0]), redo: () => G.impers(n)};
  },
  exclam(n){
    if (n !== "exc") return null;
    const good = pick(EXC_OUI), bad = shuffle(EXC_NON).slice(0, 3);
    return {n, prompt: "Laquelle de ces phrases est de forme <b>exclamative</b> ?", opts: shuffle([{t: good, ok: true}, ...bad.map(t => ({t, ok: false}))]),
      explain: `<b>${esc(good)}</b> exprime une émotion (point d'exclamation). Attention : « quel », « que », « comme » peuvent aussi poser une question ou exprimer une cause.`,
      review: rev(n, "Phrase exclamative", good), redo: () => G.exclam(n)};
  }
};
const KQ = {   // au quiz
  typ: ["typeOf", "typeOf", "ana", "ana", "cours", "vf"], inj: ["typeOf", "nuance", "nuance", "mode", "cours", "vf"],
  int: ["typeOf", "cours", "cours", "vf"], itp: ["totpart", "totpart", "motInt", "partielle", "cours", "vf"],
  neg: ["affneg", "negTransfo", "negTransfo", "ana", "cours", "vf"], pas: ["voix", "voix", "passif", "passif", "agent", "cours", "vf"],
  imp: ["impers", "impers", "impers", "cours", "vf"], exc: ["exclam", "exclam", "cours", "vf"]
};
const KC = {   // au contrôle : surtout des réponses à écrire
  typ: ["typeOf", "ana", "ana"], inj: ["typeOf", "nuance", "mode"], int: ["typeOf", "cours"], itp: ["totpart", "motInt", "partielle"],
  neg: ["negWords", "negTransfo", "affneg"], pas: ["passif", "agent", "voix"], imp: ["impers"], exc: ["exclam", "cours"]
};
function make(kinds, n, typed){
  for (const k of shuffle(kinds)) { const e = G[k](n, typed); if (e) return e; }
  return G.cours(n) || G.vf(n);
}

/* ---------- rédaction ---------- */
const REDAC = [
  {id: "analyse", unit: "typ", titre: "Analyse les phrases d'un récit",
   doc: `<p>(1) Victor Frankenstein travaillait seul dans son laboratoire. (2) Une nuit d'orage, la créature fut animée par le jeune savant. (3) Quelle horreur ! (4) Avait-il vraiment voulu cela ? (5) Victor ne dormit pas de la nuit. (6) Il pleuvait sans arrêt sur la ville.</p>`,
   consigne: `<p>Pour chaque phrase, donne son <b>type</b> (déclaratif, injonctif, interrogatif) et ses <b>formes</b> (affirmative ou négative ; active ou passive ; impersonnelle ; exclamative). Pour la phrase 4, précise si l'interrogation est <b>totale</b> ou <b>partielle</b>. Justifie en quelques mots.</p>`,
   modele: "(1) Phrase déclarative (elle donne une information), de forme affirmative et active : le sujet Victor Frankenstein fait l'action. (2) Phrase déclarative, affirmative, de forme passive : le sujet « la créature » subit l'action ; « par le jeune savant » est le complément d'agent. (3) Forme exclamative : elle exprime une émotion (l'horreur), avec un point d'exclamation ; elle est affirmative. (4) Phrase interrogative (point d'interrogation), affirmative : c'est une interrogation totale, car on peut y répondre par oui ou par non. (5) Phrase déclarative de forme négative : négation ne… pas. (6) Phrase déclarative, affirmative, de forme impersonnelle : « il » ne représente rien ni personne (verbe pleuvoir).",
   criteres: [
     {t: "Donne le bon type pour les phrases 1, 4, 5 et 6 (déclarative, interrogative, déclarative, déclarative)", pts: 1},
     {t: "Dit que la phrase 2 est passive, avec le complément d'agent « par le jeune savant » (le sujet subit l'action)", pts: 1},
     {t: "Dit que la phrase 3 est exclamative, car elle exprime une émotion", pts: 1},
     {t: "Dit que la phrase 4 est une interrogation totale (réponse par oui ou par non)", pts: 1},
     {t: "Dit que la phrase 5 est négative (ne… pas) et que la phrase 6 est impersonnelle (« il » ne représente rien ni personne)", pts: 1}]},
  {id: "transformations", unit: "pas", titre: "Transforme les phrases",
   consigne: `<p>Transforme chaque phrase comme demandé :<br>a) Mets à la forme <b>passive</b>, au même temps : « Les pompiers ont éteint l'incendie. »<br>b) Mets à la forme <b>négative</b> avec « ne… jamais » : « Mon frère range sa chambre. »<br>c) Pose une <b>interrogation partielle</b> sur le groupe souligné : « Léa part <u>à Londres</u>. »<br>d) Transforme en phrase <b>injonctive</b> qui donne un ordre : « Tu fermes la porte. »<br>e) Transforme en <b>interrogation totale</b> avec l'inversion du sujet : « Vous avez lu ce livre. »</p>`,
   modele: "a) L'incendie a été éteint par les pompiers. b) Mon frère ne range jamais sa chambre. c) Où Léa part-elle ? d) Ferme la porte ! e) Avez-vous lu ce livre ?",
   criteres: [
     {t: "a) Phrase passive juste : « L'incendie a été éteint par les pompiers » (même temps, complément d'agent)", pts: 1},
     {t: "b) Négation juste avec les deux mots : « Mon frère ne range jamais sa chambre »", pts: 1},
     {t: "c) Question partielle avec « où » : « Où Léa part-elle ? »", pts: 1},
     {t: "d) Phrase injonctive à l'impératif : « Ferme la porte ! » (ou « Ferme la porte. »)", pts: 1},
     {t: "e) Interrogation totale avec inversion et trait d'union : « Avez-vous lu ce livre ? »", pts: 1}]},
  {id: "dialogue", unit: "itp", titre: "À toi d'écrire : préparer une sortie",
   consigne: `<p>Écris un court dialogue (<b>6 à 8 répliques</b>) entre toi et un ami qui préparez une sortie au cinéma. Il doit contenir : une phrase <b>injonctive</b>, une <b>interrogation totale</b>, une <b>interrogation partielle</b>, une phrase de forme <b>négative</b>, une phrase <b>exclamative</b> et une phrase <b>impersonnelle</b>. Indique entre parenthèses, après chacune, son type ou sa forme.</p>`,
   modele: "— Veux-tu venir au cinéma samedi ? (interrogation totale)\n— Oui ! Quel film veux-tu voir ? (interrogation partielle)\n— Le nouveau film de science-fiction. Il paraît qu'il est génial.\n— Quelle bonne idée ! (exclamative)\n— Mais je n'ai pas encore réservé les places. (négative)\n— Réserve-les ce soir, sinon il n'y en aura plus. (injonctive)\n— D'accord. Il faut partir tôt, la séance commence à 14 heures. (impersonnelle)",
   criteres: [
     {t: "Contient une phrase injonctive (ordre, conseil, invitation ou interdiction)", pts: 1},
     {t: "Contient une interrogation totale (réponse oui / non) et une interrogation partielle (avec un mot interrogatif), avec le point d'interrogation", pts: 1},
     {t: "Contient une phrase négative avec les deux mots de la négation (ne… pas, ne… jamais…)", pts: 1},
     {t: "Contient une phrase exclamative et une phrase impersonnelle (« il » qui ne représente rien ni personne)", pts: 1},
     {t: "Les indications entre parenthèses sont justes", pts: 1}]},
  {id: "erreurs", unit: "pas", titre: "Corrige les erreurs de Jules",
   doc: `<p>Jules a analysé ces phrases :<br>1. « Paul est parti tôt. » → phrase passive.<br>2. « Est-ce que tu viens ? » → interrogation partielle, car « est-ce que » est un mot interrogatif.<br>3. « Il court vers la sortie. » → phrase impersonnelle.<br>4. « Le match a été interrompu par la pluie. » → phrase active, car le sujet fait l'action.</p>`,
   consigne: `<p>Jules s'est trompé les quatre fois. Corrige chaque analyse et <b>explique-lui la règle</b>.</p>`,
   modele: "1. « Paul est parti tôt » est active : « est parti » est le passé composé de partir, avec l'auxiliaire être, et Paul fait l'action. 2. C'est une interrogation totale : on peut répondre par oui ou par non ; « est-ce que » n'est pas un mot interrogatif. 3. La phrase n'est pas impersonnelle : « il » représente quelqu'un (Paul court vers la sortie). 4. La phrase est passive : le sujet « le match » subit l'action, et « par la pluie » est le complément d'agent.",
   criteres: [
     {t: "1. Dit que la phrase est active : « est parti » est le passé composé de partir, Paul fait l'action", pts: 1},
     {t: "2. Dit que c'est une interrogation totale (réponse oui ou non), « est-ce que » n'étant pas un mot interrogatif", pts: 1},
     {t: "3. Dit que la phrase est personnelle : « il » représente quelqu'un", pts: 1},
     {t: "4. Dit que la phrase est passive : le sujet subit l'action, « par la pluie » est le complément d'agent", pts: 1}]}
];

/* ---------- passage au moteur ---------- */
const asQuiz = e => ({unit: UBY[e.n], key: strip(e.review), prompt: e.prompt, fig: e.fig, wide: e.wide, opts: e.opts, tip: e.tip,
  feedback: () => box(e.explain), review: e.review});
const asControl = e => Object.assign({unit: UBY[e.n], prompt: e.prompt, wide: e.wide, tip: e.tip, review: e.review,
  correction: () => e.explain ? `<p class="label" style="margin-top:4px">Correction</p>${box(e.explain)}` : "", redo: () => asControl(e.redo())},
  e.fields ? {kind: "fields", fields: e.fields} : {kind: "choice", opts: e.opts});
const card = (n, front, back, label) => ({unit: UBY[n],
  front: `<div class="fbody">${label ? `<span class="label">${esc(label)}</span>` : ""}<span class="card-q">${front}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
  back: `<div class="fbody left"><span class="card-a">${back}</span></div>`});

Revision.start({
  key: "leandre-francais-types-de-phrases-v1",
  title: "Les types et les formes de phrases",
  subtitle: "Déclarative, injonctive, interrogative… affirmative, passive, impersonnelle, exclamative",
  eyebrow: "Français · Grammaire",
  hand: "Un seul type… mais plusieurs formes !",
  groups: {
    "1": {name: "Les types de phrases", cls: "l1", filter: "Types"},
    "2": {name: "Les formes de phrases", cls: "l2", filter: "Formes"}
  },
  redaction: {items: REDAC, text: "4 sujets comme à l'évaluation : analyser les phrases d'un récit, transformer des phrases, écrire un dialogue, corriger les erreurs d'un camarade. Tu rédiges (ou tu prends ta copie en photo), puis tu es corrigé critère par critère."},
  units: UNITS,
  allLabel: () => "Tout le chapitre",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["la leçon", "Les définitions du cours à savoir par cœur, puis les astuces et les pièges."],
    quiz: ["10 questions", "Reconnaître le type et les formes d'une phrase, transformer, déjouer les pièges."],
    control: ["noté sur 20", "Tu écris toi-même : phrases du cours à compléter, type et forme des phrases, verbes au passif, mots interrogatifs."]
  },
  cards: pool => {
    const ids = pool.map(u => u.id);
    const out = PAR_COEUR.filter(p => ids.includes(p.n)).map(p => card(p.n, esc(p.q), esc(p.text), `À savoir par cœur · ${p.source}`));
    out.push(...COURS.filter(c => ids.includes(c.n)).map(c => card(c.n, esc(c.card), nl(c.a))));
    return out;
  },
  quiz: {count: 10, make: (pool, R, i) => {
    const n = R.weighted(pool).id, f = i % 5 < 2 ? G.parcoeur(n) : null;   // environ 4 questions sur 10 sur le « par cœur »
    return asQuiz(f || make(KQ[n], n, false));
  }},
  control: {
    lead: "14 questions : des phrases du cours à compléter, le type et la forme de phrases à écrire, des verbes à mettre au passif, des mots interrogatifs à trouver. Chaque question compte autant.",
    note: "Les accents ne comptent pas pour les mots à écrire. Pour le verbe au passif, l'accord du participe passé compte : la souris est mangée.",
    size: () => 14,
    build: (pool, R) => {
      const ids = pool.map(u => u.id), withPc = ids.filter(n => PBY(n).length), items = [];
      const add = e => {
        if (!e || items.some(x => strip(x.review) === strip(e.review))) return false;
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
