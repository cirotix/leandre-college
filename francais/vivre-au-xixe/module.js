/* Module : Français · Séquence 1 « Vivre au XIXe siècle : un monde qui change ».
   Sources : cahier de Léandre (PDF de 35 pages, octobre 2026) —
   séance 1 (langue) les classes grammaticales : exercices et bilan en rouge ;
   séance 2 (lecture) le désir de réussite sociale, extrait du Père Goriot de Balzac : questions et bilan ;
   séance 3 (orthographe) les accords dans le groupe nominal : exercices et feuille « Bilan : les accords dans le GN » ;
   séance 4 (lecture) la place de la femme, extrait d'Horace de George Sand : questions, tableau des personnages, bilan ;
   séance 5 (langue) les fonctions grammaticales : exercices et feuille « Bilan » (fonctions dans la phrase et dans le GN) ;
   séance 6 (lecture) le travail à la mine, extrait de Germinal de Zola : réponses 6 à 8 et bilan ;
   séance 7 (vocabulaire) la vie quotidienne : feuille d'exercices et corrections ;
   séance 8 (lecture) soirée au bal, extrait de Madame Bovary de Flaubert : questions, bilan, exercice sur « hôte » ;
   séance 9 (langue) les temps du récit au passé : bilan en rouge, exercices, tableau du passé simple corrigé.
   Les phrases des bilans (en rouge dans le cahier, ou feuilles « Bilan » du professeur) sont dans PAR_COEUR.
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";
const {esc, shuffle, pick, fold} = Revision;

/* ---------- notions ---------- */
const UNITS = [
  {id: "cls", group: "1", name: "Les classes grammaticales", sub: "Mots variables et invariables, déterminants, pronoms, conjonctions"},
  {id: "fon", group: "1", name: "Les fonctions grammaticales", sub: "Sujet, COD, COI, attribut, compléments, fonctions dans le GN"},
  {id: "tps", group: "1", name: "Les temps du récit", sub: "Passé simple, imparfait, plus-que-parfait, passé antérieur, conditionnel"},
  {id: "acc", group: "2", name: "Les accords dans le GN", sub: "Féminin, pluriel, couleurs, numéraux, nu et demi"},
  {id: "voc", group: "2", name: "La vie quotidienne", sub: "Mobilier, vaisselle, matières, adverbes en -ment, le mot « hôte »"},
  {id: "rea", group: "3", name: "Vivre au XIXe siècle", sub: "La séquence, les auteurs et leurs romans"},
  {id: "amb", group: "3", name: "Ambition et aristocratie", sub: "Le Père Goriot (Balzac), Madame Bovary (Flaubert)"},
  {id: "trv", group: "3", name: "Femmes et travail", sub: "Horace (George Sand), Germinal (Zola)"}
].map(u => Object.assign(u, {tag: u.name}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- le « par cœur » : phrases des bilans, à savoir mot pour mot ----------
   trous : mots à écrire au contrôle (texte à trous) ; un tableau = [mot affiché, variantes acceptées…]
   pieges : [morceau de la phrase, remplacement] → une fausse version de même tournure pour le QCM */
const PAR_COEUR = [
  {id: "cls1", n: "cls", source: "Bilan de la séance 1", q: "Qu'est-ce que la classe grammaticale d'un mot ?",
   text: "La classe grammaticale d'un mot est sa nature, c'est-à-dire son identité.", trous: ["nature", "identité"],
   pieges: [["sa nature, c'est-à-dire son identité", "sa fonction, c'est-à-dire son rôle"], ["son identité", "sa place dans la phrase"], ["sa nature", "son sens"]]},
  {id: "cls2", n: "cls", source: "Bilan de la séance 1", q: "Avec quoi ne faut-il pas confondre la classe grammaticale ?",
   text: "Il ne faut pas la confondre avec la fonction, qui est le rôle du mot dans la phrase.", trous: ["fonction", "rôle"],
   pieges: [["avec la fonction", "avec la nature"], ["le rôle du mot", "l'identité du mot"], ["la fonction, qui est le rôle", "le sens, qui est la définition"]]},
  {id: "cls3", n: "cls", source: "Bilan de la séance 1", q: "Combien y a-t-il de classes grammaticales ?",
   text: "Il y a 10 classes grammaticales.", trous: [["10", "dix"]],
   pieges: [["10", "5"], ["10", "8"], ["10", "12"]]},
  {id: "cls4", n: "cls", source: "Bilan de la séance 1 · A", q: "Quelles sont les 5 classes de mots variables ?",
   text: "Les mots variables sont le nom, le déterminant, l'adjectif qualificatif, le pronom et le verbe.", trous: ["déterminant", "pronom"],
   pieges: [["le pronom", "l'adverbe"], ["l'adjectif qualificatif", "la préposition"], ["et le verbe", "et la conjonction"]]},
  {id: "cls5", n: "cls", source: "Bilan de la séance 1 · B", q: "Quelles sont les 5 classes de mots invariables ?",
   text: "Les mots invariables sont l'adverbe, la préposition, la conjonction, l'interjection et l'onomatopée.", trous: ["adverbe", "préposition"],
   pieges: [["l'adverbe", "le pronom"], ["la préposition", "le déterminant"], ["l'interjection", "l'adjectif qualificatif"]]},
  {id: "cls6", n: "cls", source: "Bilan de la séance 1 · B.3", q: "Quelles sont les conjonctions de coordination ?",
   text: "Les conjonctions de coordination sont : mais, ou, et, donc, or, ni, car.", trous: ["donc", "car"],
   pieges: [["donc, or", "dans, sur"], ["ni, car", "si, que"], ["mais, ou", "lorsque, comme"]]},

  {id: "fon1", n: "fon", source: "Bilan des fonctions", q: "Qu'est-ce que la fonction grammaticale d'un mot ?",
   text: "La fonction grammaticale d'un mot est le rôle qu'il joue dans une phrase.", trous: ["rôle"],
   pieges: [["le rôle qu'il joue dans une phrase", "sa nature, c'est-à-dire son identité"], ["le rôle qu'il joue", "la place qu'il occupe"], ["dans une phrase", "dans le dictionnaire"]]},
  {id: "fon2", n: "fon", source: "Bilan des fonctions · 1", q: "Qu'indique le sujet du verbe ?",
   text: "Le sujet indique qui fait l'action dans la phrase.", trous: ["action"],
   pieges: [["qui fait l'action", "qui subit l'action"], ["qui fait l'action", "où se passe l'action"], ["qui fait l'action", "quand se fait l'action"]]},
  {id: "fon3", n: "fon", source: "Bilan des fonctions · 1", q: "Comment trouve-t-on le sujet d'un verbe conjugué ?",
   text: "Pour trouver le sujet d'un verbe conjugué, on pose la question Qui est-ce qui… ? ou Qu'est-ce qui… ? posée avant le verbe.", trous: ["avant"],
   pieges: [["avant le verbe", "après le verbe"], ["Qui est-ce qui… ? ou Qu'est-ce qui… ?", "Qui ? ou Quoi ?"], ["Qui est-ce qui… ? ou Qu'est-ce qui… ?", "À qui ? ou De quoi ?"]]},
  {id: "fon4", n: "fon", source: "Bilan des fonctions · 2", q: "Qu'est-ce qu'un complément essentiel du verbe ?",
   text: "Les compléments essentiels du verbe sont les compléments qu'on ne peut pas supprimer sans rendre la phrase incorrecte ou changer profondément son sens.", trous: ["supprimer"],
   pieges: [["qu'on ne peut pas supprimer", "qu'on peut supprimer"], ["qu'on ne peut pas supprimer", "qu'on ne peut pas déplacer"], ["changer profondément son sens", "changer le temps du verbe"]]},
  {id: "fon5", n: "fon", source: "Bilan des fonctions · 2a", q: "Comment reconnaît-on un COD ?",
   text: "Le COD est relié directement au verbe, sans préposition, et répond à la question qui ? ou quoi ? posée après le verbe.", trous: ["directement", "après"],
   pieges: [["directement au verbe, sans préposition", "indirectement au verbe, par une préposition"], ["posée après le verbe", "posée avant le verbe"], ["qui ? ou quoi ?", "à qui ? ou de quoi ?"]]},
  {id: "fon6", n: "fon", source: "Bilan des fonctions · 2a", q: "Comment reconnaît-on un COI ?",
   text: "Le COI est relié indirectement au verbe, par l'intermédiaire d'une préposition, et répond à la question à/de qui ? ou à/de quoi ? posée après le verbe.", trous: ["indirectement", "préposition"],
   pieges: [["indirectement au verbe, par l'intermédiaire d'une préposition", "directement au verbe, sans l'intermédiaire d'une préposition"], ["posée après le verbe", "posée avant le verbe"], ["à/de qui ? ou à/de quoi ?", "qui ? ou quoi ?"]]},
  {id: "fon7", n: "fon", source: "Bilan des fonctions · 2b", q: "Qu'indique l'attribut du sujet ?",
   text: "L'attribut du sujet indique une caractéristique du sujet. Il y a une équivalence entre l'attribut du sujet et le sujet : on peut mettre un signe =.", trous: ["caractéristique", "équivalence"],
   pieges: [["une caractéristique du sujet", "qui fait l'action du verbe"], ["une équivalence", "une opposition"], ["un signe =", "un signe ≠"]]},
  {id: "fon8", n: "fon", source: "Bilan des fonctions · 2b", q: "Par quel type de verbe l'attribut complète-t-il le sujet ?",
   text: "L'attribut du sujet complète le sujet par l'intermédiaire d'un verbe d'état ou d'un verbe attributif.", trous: ["état", "attributif"],
   pieges: [["d'un verbe d'état ou d'un verbe attributif", "d'une préposition ou d'une conjonction"], ["complète le sujet", "complète le COD"], ["d'un verbe d'état", "d'un verbe d'action"]]},
  {id: "fon9", n: "fon", source: "Bilan des fonctions · 2c", q: "Qu'est-ce qui distingue un complément essentiel de lieu d'un CC de lieu ?",
   text: "Le complément essentiel de lieu, de temps ou de mesure ressemble à un C.C., mais on ne peut pas le supprimer.", trous: ["supprimer"],
   pieges: [["on ne peut pas le supprimer", "on peut le supprimer"], ["ressemble à un C.C.", "ressemble à un COD"], ["on ne peut pas le supprimer", "on ne peut pas le déplacer"]]},
  {id: "fon10", n: "fon", source: "Bilan des fonctions · 2d", q: "Qu'indique le complément d'agent ?",
   text: "Dans une phrase à la voix passive, le complément d'agent indique qui fait l'action exprimée par le verbe. Il correspond au sujet du verbe à la voix active.", trous: ["passive", "sujet"],
   pieges: [["à la voix passive", "à la voix active"], ["au sujet du verbe", "au COD du verbe"], ["qui fait l'action", "qui subit l'action"]]},
  {id: "fon11", n: "fon", source: "Bilan des fonctions · 3", q: "Peut-on supprimer un complément circonstanciel ?",
   text: "Les compléments circonstanciels peuvent être supprimés sans que cela ne rende la phrase incorrecte ni ne change profondément son sens.", trous: ["supprimés"],
   pieges: [["peuvent être supprimés", "ne peuvent pas être supprimés"], ["peuvent être supprimés", "doivent toujours être déplacés"], ["profondément son sens", "le genre du nom"]]},
  {id: "fon12", n: "fon", source: "Bilan des fonctions · II.1", q: "Qu'est-ce que le complément du nom ?",
   text: "Le complément du nom donne une information sur l'appartenance, la matière, l'origine. Il est toujours placé après le nom et relié au nom par une préposition.", trous: ["après", "préposition"],
   pieges: [["après le nom", "avant le nom"], ["par une préposition", "par une virgule"], ["l'appartenance, la matière, l'origine", "l'action, le temps, la manière"]]},
  {id: "fon13", n: "fon", source: "Bilan des fonctions · II.2", q: "Qu'est-ce que l'épithète ?",
   text: "L'épithète est la fonction occupée par les mots ou groupes de mots qui complètent un nom sans l'intermédiaire d'une préposition.", trous: ["nom", "préposition"],
   pieges: [["sans l'intermédiaire", "par l'intermédiaire"], ["qui complètent un nom", "qui complètent un verbe"], ["sans l'intermédiaire d'une préposition", "après une virgule ou un tiret"]]},

  {id: "tps1", n: "tps", source: "Bilan de la séance 9", q: "Dans un récit, à quoi servent l'imparfait et le passé simple ?",
   text: "L'imparfait et le passé simple sont utilisés dans un récit pour faire la narration. Ils ont des emplois différents et complémentaires.", trous: ["narration", "complémentaires"],
   pieges: [["différents et complémentaires", "identiques et interchangeables"], ["pour faire la narration", "pour faire les dialogues"], ["L'imparfait et le passé simple", "Le présent et le futur"]]},
  {id: "tps2", n: "tps", source: "Bilan de la séance 9", q: "Quand utilise-t-on le passé simple dans un récit ?",
   text: "Le passé simple est utilisé pour une action de premier plan et qui est limitée dans le temps. Il est utilisé pour relater les actions ponctuelles qui font progresser le récit.", trous: ["premier plan", "ponctuelles"],
   pieges: [["de premier plan", "d'arrière-plan"], ["limitée dans le temps", "qui dure longtemps"], ["les actions ponctuelles", "les descriptions"]]},
  {id: "tps3", n: "tps", source: "Bilan de la séance 9", q: "Pour quelles autres actions utilise-t-on le passé simple ?",
   text: "On l'utilise aussi pour les actions successives qui s'enchaînent.", trous: ["successives"],
   pieges: [["les actions successives qui s'enchaînent", "les descriptions de personnages et de lieux"], ["les actions successives", "les actions habituelles"], ["qui s'enchaînent", "qui se répètent chaque jour"]]},
  {id: "tps4", n: "tps", source: "Bilan de la séance 9", q: "Quand utilise-t-on l'imparfait dans un récit ?",
   text: "L'imparfait est utilisé pour les actions d'arrière-plan. Il peut s'agir de faire la description d'un objet, d'un personnage ou d'un lieu.", trous: ["arrière-plan", "description"],
   pieges: [["d'arrière-plan", "de premier plan"], ["la description", "la progression"], ["pour les actions d'arrière-plan", "pour les actions limitées dans le temps"]]},
  {id: "tps5", n: "tps", source: "Bilan de la séance 9", q: "À quoi d'autre peut servir l'imparfait ?",
   text: "De plus, l'imparfait peut également servir pour des actions qui durent ou qui se répètent comme une habitude, ainsi que des actions en cours de déroulement.", trous: ["habitude", "déroulement"],
   pieges: [["qui durent ou qui se répètent", "qui sont brèves et uniques"], ["en cours de déroulement", "à venir dans le futur"], ["comme une habitude", "comme une rupture"]]},
  {id: "tps6", n: "tps", source: "Bilan de la séance 9", q: "À quoi sert le conditionnel dans un récit au passé ?",
   text: "Le conditionnel remplace le futur dans un récit au passé. Il sert à relater une action qui se situe dans le futur par rapport à un moment du passé.", trous: ["futur"],
   pieges: [["remplace le futur", "remplace le présent"], ["dans le futur par rapport", "dans le passé par rapport"], ["Le conditionnel remplace", "Le plus-que-parfait remplace"]]},
  {id: "tps7", n: "tps", source: "Bilan de la séance 9", q: "Qu'expriment les temps composés dans un récit ?",
   text: "Les temps composés expriment une action accomplie au moment de l'action principale.", trous: ["accomplie"],
   pieges: [["une action accomplie", "une action à venir"], ["une action accomplie", "une action habituelle"], ["au moment de l'action principale", "après l'action principale"]]},
  {id: "tps8", n: "tps", source: "Bilan de la séance 9", q: "À quoi servent le plus-que-parfait et le passé antérieur ?",
   text: "Le plus-que-parfait et le passé antérieur sont employés pour relater des actions antérieures à une action au passé.", trous: ["antérieures"],
   pieges: [["des actions antérieures", "des actions postérieures"], ["Le plus-que-parfait et le passé antérieur", "L'imparfait et le passé simple"], ["des actions antérieures", "des actions habituelles"]]},

  {id: "acc1", n: "acc", source: "Bilan : les accords dans le GN", q: "À quoi s'appliquent aussi les règles d'accord de l'adjectif qualificatif ?",
   text: "Les règles d'accord qui concernent l'adjectif qualificatif s'appliquent également au participe passé employé comme adjectif (sans auxiliaire).", trous: ["participe passé", "auxiliaire"],
   pieges: [["participe passé employé comme adjectif (sans auxiliaire)", "verbe conjugué avec l'auxiliaire avoir"], ["(sans auxiliaire)", "(avec l'auxiliaire avoir)"], ["l'adjectif qualificatif", "l'adverbe"]]},
  {id: "acc2", n: "acc", source: "Bilan : les accords dans le GN · I.1", q: "Quelle est la règle générale pour former le féminin ?",
   text: "Règle générale du féminin : ajout d'un « e » au masculin (un apprenti / une apprentie ; loyal / loyale).", trous: ["masculin"],
   pieges: [["« e »", "« s »"], ["au masculin", "au pluriel"], ["ajout d'un « e »", "doublement de la consonne"]]},
  {id: "acc3", n: "acc", source: "Bilan : les accords dans le GN · II.1", q: "Quelle est la règle générale pour former le pluriel ?",
   text: "Règle générale du pluriel : ajout d'un « s » au singulier (un chien / des chiens ; riche / riches).", trous: ["singulier"],
   pieges: [["« s »", "« x »"], ["« s »", "« e »"], ["au singulier", "au féminin"]]},
  {id: "acc4", n: "acc", source: "Bilan : les accords dans le GN · II.2b", q: "Quels mots ne changent pas au pluriel ?",
   text: "Sont invariables les mots qui se terminent par « s » (gris), par « x » (jaloux), par « z » (nez).", trous: ["invariables"],
   pieges: [["Sont invariables", "Prennent un « x »"], ["par « z » (nez)", "par « l » (bal)"], ["par « s » (gris)", "par « u » (feu)"]]},
  {id: "acc5", n: "acc", source: "Bilan : les accords dans le GN · 5", q: "Quand l'adjectif de couleur ne s'accorde-t-il pas ?",
   text: "Il n'y a pas d'accord lorsque la couleur est exprimée par deux adjectifs (vert clair) ou par un nom utilisé comme adjectif (orange, marron).", trous: [["deux", "2"], "nom"],
   pieges: [["Il n'y a pas d'accord", "Il y a toujours accord"], ["par un nom", "par un verbe"], ["par deux adjectifs", "par un seul adjectif"]]},
  {id: "acc6", n: "acc", source: "Bilan : les accords dans le GN · 7", q: "Les déterminants numéraux s'accordent-ils ?",
   text: "Les déterminants numéraux sont invariables sauf « vingt » et « cent » s'ils sont multipliés (quatre-vingts, trois cents).", trous: ["vingt", "cent"],
   pieges: [["« vingt » et « cent »", "« mille » et « million »"], ["s'ils sont multipliés", "s'ils sont suivis d'un autre nombre"], ["sont invariables", "s'accordent toujours"]]},
  {id: "acc7", n: "acc", source: "Bilan : les accords dans le GN · 4", q: "Comment s'accorde le nom dans un complément du nom ?",
   text: "Dans un complément du nom, l'accord se fait selon le sens (des miettes de pain ; un groupe d'arbres).", trous: ["sens"],
   pieges: [["selon le sens", "toujours au singulier"], ["selon le sens", "toujours au pluriel"], ["selon le sens", "selon le déterminant"]]},
  {id: "acc8", n: "acc", source: "Bilan : les accords dans le GN · 6", q: "Quand « nu » et « demi » sont-ils invariables ?",
   text: "Les adjectifs « nu » et « demi » sont invariables placés devant le nom (nu-jambes / les jambes nues).", trous: ["devant"],
   pieges: [["placés devant le nom", "placés après le nom"], ["sont invariables", "s'accordent toujours"], ["« nu » et « demi »", "« vingt » et « cent »"]]},

  {id: "gor", n: "amb", source: "Bilan de la séance 2 · Le Père Goriot", q: "Que faut-il retenir du Père Goriot (séance 2) ?",
   text: "Le Père Goriot est un roman réaliste. L'action se déroule à Paris. Il raconte la vie d'un jeune provincial ambitieux, souffrant d'un sentiment d'infériorité, d'une ténacité à toute épreuve et animé par le désir de réussite dans le monde de l'aristocratie.",
   trous: ["réaliste", "provincial", "réussite"],
   pieges: [["un roman réaliste", "un roman fantastique"], ["ambitieux", "paresseux"], ["dans le monde de l'aristocratie", "dans le monde des ouvriers"]]},
  {id: "bov1", n: "amb", source: "Bilan de la séance 8 · Madame Bovary", q: "Que décrit Flaubert dans l'extrait de Madame Bovary ?",
   text: "À travers cet extrait, Flaubert décrit les festivités auxquelles s'adonnent les aristocrates d'une bourgade normande et notamment le bal annuel qui a lieu au château chez le marquis.",
   trous: ["aristocrates", "normande", "marquis"],
   pieges: [["les aristocrates", "les ouvriers"], ["normande", "parisienne"], ["le bal annuel", "le mariage annuel"]]},
  {id: "bov2", n: "amb", source: "Bilan de la séance 8 · Madame Bovary", q: "Comment apparaît la société du bal, et quels sont ses codes ?",
   text: "La société qui fréquente ces lieux apparaît comme heureuse, insouciante, vivant dans le luxe et les plaisirs. Cette société, où l'on joue la séduction, a ses codes : savoir danser, notamment la valse, en fait partie.",
   trous: ["insouciante", "luxe", "valse"],
   pieges: [["heureuse, insouciante", "malheureuse, inquiète"], ["dans le luxe et les plaisirs", "dans la misère et le travail"], ["savoir danser, notamment la valse", "savoir lire, notamment la poésie"]]},
  {id: "bov3", n: "amb", source: "Bilan de la séance 8 · Madame Bovary", q: "Pourquoi Emma Bovary se sent-elle inférieure au bal ?",
   text: "Emma Bovary, qui n'appartient pas au même milieu social, ce qui se manifeste dans le fait qu'elle ne sait pas danser, est rapidement étourdie lorsqu'elle s'essaie à la valse. Elle se sent véritablement inférieure lorsqu'elle envie la façon de danser d'une de ces dames du beau monde.",
   trous: [["milieu social", "milieu"], "inférieure"],
   pieges: [["n'appartient pas au même milieu social", "appartient au même milieu social"], ["véritablement inférieure", "véritablement supérieure"], ["rapidement étourdie", "rapidement admirée"]]},
  {id: "hor", n: "trv", source: "Bilan de la séance 4 · Horace", q: "Que faut-il retenir d'Horace sur la place de la femme ?",
   text: "L'évolution sociale à partir des années 1830 a vu naître le travail en association en même temps que l'émancipation des femmes. Les premières associations féminines se sont développées dans des ateliers de couture.",
   trous: [["1830"], "émancipation", "couture"],
   pieges: [["des années 1830", "des années 1950"], ["l'émancipation des femmes", "la soumission des femmes"], ["dans des ateliers de couture", "dans des mines de charbon"]]},
  {id: "ger1", n: "trv", source: "Bilan de la séance 6 · Germinal", q: "Que dénonce Zola dans Germinal, et à quoi appelle-t-il ?",
   text: "Émile Zola dénonce la pénibilité du travail ouvrier. Il lance un appel à la pitié et à la prise de conscience de tous.",
   trous: ["pénibilité", "pitié"],
   pieges: [["dénonce la pénibilité", "fait l'éloge de la facilité"], ["à la pitié et à la prise de conscience", "à la révolte et à la violence"], ["du travail ouvrier", "du travail des paysans"]]},
  {id: "ger2", n: "trv", source: "Bilan de la séance 6 · Germinal", q: "Selon Zola, que se passera-t-il si la société n'évolue pas ?",
   text: "L'homme ne peut ainsi exploiter ses semblables et si la société n'évolue pas vers l'instauration d'une justice sociale, la révolte sera inéluctable.",
   trous: [["justice sociale", "justice"], "révolte"],
   pieges: [["la révolte sera inéluctable", "la révolte sera impossible"], ["d'une justice sociale", "d'une monarchie absolue"], ["n'évolue pas", "évolue"]]},
  {id: "ger3", n: "trv", source: "Bilan de la séance 6 · Germinal", q: "Quel aspect Zola donne-t-il à la scène de la mine, et comment ?",
   text: "Il donne à la scène qu'il décrit un aspect irréel, quasi fantastique, en comparant les mineurs à des spectres qui s'agitent dans les ténèbres.",
   trous: ["fantastique", "spectres"],
   pieges: [["à des spectres", "à des héros"], ["un aspect irréel, quasi fantastique", "un aspect joyeux, quasi comique"], ["dans les ténèbres", "dans la lumière"]]}
];
const PBY = n => PAR_COEUR.filter(p => p.n === n);

/* ---------- questions de cours : carte (recto/verso) + QCM (o[0] = bonne réponse) ---------- */
const COURS = [
  /* classes */
  {n: "cls", card: "Quels sont les articles définis ?", a: "le, la, les, l'", o: ["le, la, les, l'", "un, une, des", "du, de la", "ce, cet, cette, ces"]},
  {n: "cls", card: "Quels sont les articles indéfinis ?", a: "un, une, des", o: ["un, une, des", "le, la, les, l'", "au, aux, du, des", "mon, ton, son"]},
  {n: "cls", card: "Quels sont les articles partitifs ?", a: "du, de la\nEx. : je bois du lait.", o: ["du, de la", "le, la, les", "au, aux", "ce, cette"]},
  {n: "cls", card: "Quels sont les articles définis contractés ?", a: "au, aux, du, des\nau = à + le · aux = à + les · du = de + le · des = de + les",
   o: ["au, aux, du, des", "un, une, des", "le, la, les, l'", "ma, ta, sa"]},
  {n: "cls", card: "Cite les déterminants démonstratifs.", a: "ce, cet, cette, ces", o: ["ce, cet, cette, ces", "celui, celle, ceux", "ma, ton, ses", "le, la, les"]},
  {n: "cls", card: "Cite des déterminants possessifs.", a: "ma, ton, ses, nos, leur, leurs, notre…", o: ["ma, ton, ses, nos, leur, notre…", "le mien, les siens, le nôtre…", "ce, cet, cette, ces", "qui, que, dont, où…"]},
  {n: "cls", card: "Cite des déterminants indéfinis.", a: "quelque(s), certain(e)(s), plusieurs, nul(le), aucun(e), chaque…", o: ["quelques, certains, plusieurs, chaque…", "un, deux, trois…", "quel, quelle, quels…", "le, la, les, l'"]},
  {n: "cls", card: "Quels sont les déterminants interrogatifs ou exclamatifs ?", a: "quel(s), quelle(s)\nEx. : Quelle belle robe !", o: ["quel, quelle, quels, quelles", "qui, que, quoi", "ce, cet, cette", "comment, pourquoi"]},
  {n: "cls", card: "Qu'est-ce qu'un déterminant numéral ? Donne des exemples.", a: "Il indique un nombre.\nCardinaux : un, deux, trois…\nOrdinaux : le 1er, le 2e…", o: ["un, deux, trois…", "plusieurs, quelques…", "chaque, aucun…", "ce, cette…"]},
  {n: "cls", card: "Cite des pronoms personnels.", a: "je, tu, il, leur, les, se, moi, eux…", o: ["je, tu, il, leur, se, moi, eux…", "qui, que, quoi, dont, où…", "le mien, le tien, le nôtre…", "celui, celle, ceci, cela…"]},
  {n: "cls", card: "Cite des pronoms relatifs.", a: "qui, que, quoi, dont, où, lequel, duquel, auquel et leurs composés", o: ["qui, que, quoi, dont, où, lequel…", "je, tu, il, nous…", "celui, celle, ceux…", "le mien, les siens…"]},
  {n: "cls", card: "Cite des pronoms possessifs.", a: "le mien, les siens, le nôtre, les leurs…", o: ["le mien, les siens, le nôtre…", "mon, ton, son…", "celui, celle, ceux…", "aucun, certains, plusieurs…"]},
  {n: "cls", card: "Cite des pronoms démonstratifs.", a: "celui, celle, ceux, celui-ci, celui-là, ceci, cela…", o: ["celui, celle, ceux, ceci, cela…", "ce, cet, cette, ces", "le mien, le tien…", "qui, que, dont…"]},
  {n: "cls", card: "Cite des pronoms indéfinis.", a: "aucun, quelque chose, les uns, certains, plusieurs, rien, personne…", o: ["aucun, quelque chose, certains, rien…", "le, la, les, l'", "celui, celle, ceux…", "qui, que, dont…"]},
  {n: "cls", card: "Cite des prépositions.", a: "à, dans, par, pour, en, vers, avec, de, sans, sous, sur…", o: ["à, dans, par, pour, avec, sans, sur…", "mais, ou, et, donc, or, ni, car", "très, vite, lentement…", "que, comme, si, lorsque…"]},
  {n: "cls", card: "Cite des conjonctions de subordination.", a: "que, comme, si, lorsque, parce que, bien que, dès que, étant donné que, alors que…", o: ["que, comme, si, lorsque, parce que…", "mais, ou, et, donc, or, ni, car", "à, dans, par, pour…", "qui, dont, où, lequel…"]},
  {n: "cls", card: "Cite des adverbes.", a: "très, vite, aujourd'hui, lentement, ne… pas, ne… jamais, élégamment…", o: ["très, vite, aujourd'hui, lentement…", "à, dans, par, pour…", "vert, gros, petit…", "mais, ou, et, donc…"]},
  {n: "cls", card: "Donne des exemples d'interjections et d'onomatopées.", a: "Interjections : Eh ! Ah ! Oh !\nOnomatopées : Dring ! Plouf ! Crac ! Boum !", o: ["Eh ! Ah ! Oh ! et Dring ! Plouf ! Boum !", "très, vite, bien", "mais, ou, et", "le, la, les"]},
  {n: "cls", card: "« dès » et « dès que » : quelle différence de classe ?", a: "dès = préposition.\ndès que = conjonction de subordination.\nDe même : avant / avant que, pour / pour que.",
   q: "« dès » est une préposition. Et « dès que » ?", o: ["une conjonction de subordination", "une préposition", "un adverbe", "une conjonction de coordination"]},
  {n: "cls", card: "Nom commun ou nom propre : « porte », « Paris » ?", a: "« porte » est un nom commun ; « Paris » est un nom propre (majuscule).", q: "« Paris » est…", o: ["un nom propre", "un nom commun", "un adjectif", "un déterminant"]},

  /* fonctions */
  {n: "fon", card: "Comment s'appelle un adjectif séparé du nom par une virgule ?", a: "Un adjectif apposé (on dit qu'il est détaché).\nEx. : Fatigués, les enfants se sont couchés tôt.", o: ["un adjectif apposé", "un adjectif épithète", "un attribut du sujet", "un complément du nom"]},
  {n: "fon", card: "Qu'est-ce qu'une apposition ?", a: "Un nom mis en apposition qualifie le nom ou le pronom près duquel il est placé, à la manière d'un adjectif épithète.\nEx. : Rodin, sculpteur célèbre. Paris, capitale de la France.",
   q: "Dans « Paris, capitale de la France », « capitale de la France » est…", o: ["une apposition", "un COD", "un complément d'agent", "un sujet"]},
  {n: "fon", card: "Comment passe-t-on de la voix passive à la voix active ?", a: "Le complément d'agent devient le sujet.\nEx. : Créon est défié par Antigone → Antigone défie Créon.",
   q: "Quand on passe de la voix passive à la voix active, le complément d'agent devient…", o: ["le sujet", "le COD", "le COI", "l'attribut du sujet"]},
  {n: "fon", card: "Cite des sortes de compléments circonstanciels.", a: "Lieu, temps, manière, moyen, but…\nEx. : « à l'aide d'un fin crochet » = CC de moyen ; « pour les recoller sur l'écran » = CC de but.",
   q: "Dans « Il répare l'écran à l'aide d'un fin crochet », le groupe souligné est un CC de…", o: ["moyen", "lieu", "but", "temps"]},
  {n: "fon", card: "« Thomas semble joyeux » / « Il est tombé amoureux » : quel type de verbe ?", a: "« semble » est un verbe d'état ; « est tombé » est un verbe attributif.\nThomas = joyeux ; Il = amoureux.",
   q: "Dans « Thomas semble joyeux », « semble » est…", o: ["un verbe d'état", "un verbe d'action", "un auxiliaire", "un complément"]},
  {n: "fon", card: "Une fonction est-elle toujours occupée par la même classe de mots ?", a: "Non : une fonction peut être occupée par un nom, un pronom, un GN, un infinitif, une proposition…\nComme un individu peut exercer différents métiers, un mot peut exercer différentes fonctions selon la phrase.",
   q: "Un même mot peut-il avoir des fonctions différentes ?", o: ["oui, selon la phrase dans laquelle il se trouve", "non, un mot a toujours la même fonction", "seulement s'il est un verbe", "seulement s'il est au pluriel"]},

  /* temps */
  {n: "tps", card: "Comment se forme le plus-que-parfait ?", a: "Auxiliaire être ou avoir à l'imparfait + participe passé.\nEx. : Il avait plu la veille.", o: ["auxiliaire à l'imparfait + participe passé", "auxiliaire au passé simple + participe passé", "auxiliaire au présent + participe passé", "radical + terminaisons -ais, -ait"]},
  {n: "tps", card: "Comment se forme le passé antérieur ?", a: "Auxiliaire être ou avoir au passé simple + participe passé.\nEx. : Quand il eut vu le vieillard, il se précipita.", o: ["auxiliaire au passé simple + participe passé", "auxiliaire à l'imparfait + participe passé", "auxiliaire au futur + participe passé", "radical + -ai, -as, -a"]},
  {n: "tps", card: "Le plus-que-parfait marque l'antériorité par rapport à quel temps ?", a: "Par rapport à une action à l'imparfait.\nEx. : Il avait plu la veille. Le sol était détrempé.", q: "Le plus-que-parfait marque une action antérieure à une action…", o: ["à l'imparfait", "au passé simple", "au futur", "au présent"]},
  {n: "tps", card: "Le passé antérieur marque l'antériorité par rapport à quel temps ?", a: "Par rapport à une action au passé simple.\nEx. : Quand il eut vu le vieillard, il se précipita.", q: "Le passé antérieur marque une action antérieure à une action…", o: ["au passé simple", "à l'imparfait", "au futur", "au conditionnel"]},
  {n: "tps", card: "Quelles sont les terminaisons du passé simple des verbes en -er ?", a: "-ai, -as, -a, -âmes, -âtes, -èrent\nje chantai, tu chantas, il chanta, nous chantâmes, vous chantâtes, ils chantèrent.", q: "Passé simple de « chanter » avec « je » :", o: ["je chantai", "je chantais", "je chanta", "je chantis"]},
  {n: "tps", card: "Conjugue « recevoir » au passé simple.", a: "je reçus, tu reçus, il reçut, nous reçûmes, vous reçûtes, ils reçurent", q: "Passé simple de « recevoir » avec « ils » :", o: ["ils reçurent", "ils recevirent", "ils recevèrent", "ils reçoivent"]},
  {n: "tps", card: "Conjugue « retenir » au passé simple.", a: "je retins, tu retins, il retint, nous retînmes, vous retîntes, ils retinrent", q: "Passé simple de « retenir » avec « il » :", o: ["il retint", "il retenit", "il retenut", "il retena"]},

  /* accords */
  {n: "acc", card: "Quelles sont les exceptions des mots en -al au pluriel ?", a: "Noms : bals, carnavals, chacals, festivals, récitals, régals.\nAdjectifs : banals, bancals, fatals, finals, glacials, natals, navals.", q: "Lequel de ces pluriels est correct ?", o: ["des festivals", "des festivaux", "des chevals", "des journals"]},
  {n: "acc", card: "Quels mots en -ou prennent un « x » au pluriel ?", a: "bijoux, cailloux, choux, genoux, hiboux, joujoux, poux", q: "Quel mot en -ou prend un « x » au pluriel ?", o: ["le genou", "le verrou", "le clou", "le bambou"]},
  {n: "acc", card: "Quels mots en -ail font leur pluriel en -aux ?", a: "vitraux, coraux, émaux, soupiraux, travaux", q: "Quel est le pluriel de « vitrail » ?", o: ["des vitraux", "des vitrails", "des vitrailx", "des vitreaux"]},
  {n: "acc", card: "Quelles sont les exceptions des mots en -au et -eu ?", a: "Ils prennent un « x » (fabliaux, seaux, feux), sauf : landaus, bleus, pneus.", q: "Quel est le pluriel de « pneu » ?", o: ["des pneus", "des pneux", "des pneaux", "des pneu"]},
  {n: "acc", card: "Quels mots ont une forme différente au pluriel ?", a: "ciel / cieux ; œil / yeux ; vieil (+ voyelle) / vieux ; nouvel (+ voyelle) / nouveau.", q: "Quel est le pluriel de « œil » ?", o: ["des yeux", "des œils", "des œux", "des yeuxs"]},
  {n: "acc", card: "Quand écrit-on « vieil » et « nouvel » ?", a: "Devant un nom qui commence par une voyelle : un vieil ami, un nouvel appareil.", q: "Quelle forme est correcte ?", o: ["un vieil ami", "un vieux ami", "un vieille ami", "un vieu ami"]},
  {n: "acc", card: "Au pluriel d'un nom composé, quels mots peuvent prendre la marque du pluriel ?", a: "Seuls les noms et les adjectifs (des sourds-muets, des balais-brosses). Les verbes, les adverbes et les prépositions restent invariables (des bouche-trous, des pince-sans-rire).",
   q: "Dans un nom composé, quels mots peuvent se mettre au pluriel ?", o: ["seuls les noms et les adjectifs", "seuls les verbes", "tous les mots", "seulement le dernier mot"]},
  {n: "acc", card: "Qu'est-ce qu'un homophone lexical distingué par le genre ?", a: "Deux mots qui se prononcent pareil et ne se distinguent que par leur genre : un tour / une tour.", q: "« un tour » et « une tour » sont des homophones qui se distinguent par…", o: ["leur genre", "leur nombre", "leur prononciation", "leur classe grammaticale"]},

  /* vocabulaire */
  {n: "voc", card: "Que veut dire le mot « hôte » ?", a: "Il a deux sens : celui qui reçoit, et l'invité.\nOn peut être l'hôte (celui qui reçoit) de l'hôte (l'invité).\nIl est de la même famille que « hospitalité ».",
   q: "Le mot « hôte » peut désigner…", o: ["celui qui reçoit ou l'invité", "seulement celui qui reçoit", "seulement l'invité", "le domestique du château"]},
  {n: "voc", card: "À quoi sert un ravier ?", a: "À servir les hors-d'œuvre.", q: "Un ravier sert à servir…", o: ["les hors-d'œuvre", "la soupe", "l'eau ou le vin", "la compote"]},
  {n: "voc", card: "À quoi sert une louche ?", a: "À servir la soupe (le potage).", q: "Une louche sert à servir…", o: ["la soupe", "les hors-d'œuvre", "le vin", "les fruits"]},
  {n: "voc", card: "À quoi servent une carafe, un compotier ?", a: "Une carafe (ou une cruche) : l'eau ou le vin.\nUn compotier (ou une coupe) : la compote ou les fruits.", q: "Un compotier sert à présenter…", o: ["la compote ou les fruits", "l'eau ou le vin", "la soupe", "le sucre"]},

  /* le XIXe siècle, la séquence */
  {n: "rea", card: "Quel est le titre de la séquence 1 ?", a: "Vivre au XIXe siècle : un monde qui change.", o: ["Vivre au XIXe siècle : un monde qui change", "Vivre au Moyen Âge : un monde de chevaliers", "Le XVIIe siècle : le théâtre classique", "Voyager au XXe siècle : un monde moderne"]},
  {n: "rea", card: "Quelle est la problématique de la séquence ?", a: "Quelles évolutions de la société les personnages incarnent-ils ?", o: ["Quelles évolutions de la société les personnages incarnent-ils ?", "Comment les héros affrontent-ils les monstres ?", "Pourquoi les poètes parlent-ils de la nature ?", "Comment écrire une fable ?"]},
  {n: "rea", card: "Que veut montrer le roman réaliste au XIXe siècle ?", a: "Il a l'ambition de représenter la société de son temps, à travers des personnages qui incarnent ses évolutions.", q: "L'ambition du roman réaliste au XIXe siècle, c'est…", o: ["représenter la société de son temps", "raconter des aventures merveilleuses", "faire rire avec des personnages ridicules", "parler uniquement de l'Antiquité"]},
  {n: "rea", card: "Qui a écrit Le Père Goriot ?", a: "Honoré de Balzac.", o: ["Balzac", "Zola", "Flaubert", "George Sand"]},
  {n: "rea", card: "Qui a écrit Germinal ?", a: "Émile Zola.", o: ["Zola", "Balzac", "Flaubert", "George Sand"]},
  {n: "rea", card: "Qui a écrit Madame Bovary ?", a: "Gustave Flaubert.", o: ["Flaubert", "Balzac", "Zola", "George Sand"]},
  {n: "rea", card: "Qui a écrit Horace ?", a: "George Sand.", o: ["George Sand", "Balzac", "Zola", "Flaubert"]},

  /* Le Père Goriot, Madame Bovary */
  {n: "amb", card: "Qui est Rastignac au début de l'extrait du Père Goriot ?", a: "Le héros : il est de bonne famille mais il est sans fortune.", q: "Rastignac est…", o: ["de bonne famille mais sans fortune", "riche mais sans famille", "un vieil aristocrate", "un ouvrier de la mine"]},
  {n: "amb", card: "Pourquoi Rastignac se rend-il chez la comtesse ?", a: "Pour s'introduire dans le milieu social de cette société (l'aristocratie).", q: "Rastignac se rend chez la comtesse…", o: ["pour s'introduire dans le milieu de l'aristocratie", "pour lui vendre des tissus", "pour lui demander un travail à la mine", "pour lui apprendre à danser"]},
  {n: "amb", card: "Comment Rastignac se prépare-t-il, et dans quel état d'esprit ?", a: "Il prend un soin extrême de sa toilette et pense à ce qu'il va dire. Il est à la fois prudent (« il marche avec mille précautions pour ne point se crotter »), surexcité et rempli d'espoir : c'est son avenir qui est en jeu !",
   q: "Avant sa visite, Rastignac est…", o: ["prudent, surexcité et rempli d'espoir", "calme et indifférent", "triste et découragé", "en colère contre la comtesse"]},
  {n: "amb", card: "Pourquoi Rastignac perd-il ses moyens chez la comtesse ?", a: "On le regarde de façon méprisante car il est arrivé à pied et non en voiture. Il est de mauvaise humeur, perd tout son esprit et se sent stupide.",
   q: "Chez la comtesse, on regarde Rastignac avec mépris parce qu'il…", o: ["est arrivé à pied et non en voiture", "est arrivé en retard", "parle trop fort", "porte un habit sale"]},
  {n: "amb", card: "Comment réagit Rastignac face au mépris ?", a: "Il est tenace : il décide de continuer malgré le mépris dont il a été témoin. Il se comporte en séducteur, persuadé de capter l'attention de la comtesse.",
   q: "Face au mépris, Rastignac…", o: ["est tenace et décide de continuer", "abandonne et rentre chez lui", "se met en colère", "repart en province"]},
  {n: "amb", card: "Pourquoi Emma refuse-t-elle d'abord de danser ?", a: "Elle ne sait pas valser, alors que tous les autres savent valser : son inexpérience se traduit par son refus.", q: "Au début, Emma refuse de danser parce qu'elle…", o: ["ne sait pas valser", "est fatiguée", "n'aime pas le vicomte", "veut rentrer chez elle"]},
  {n: "amb", card: "Qui convainc Emma de danser, et comment ses paroles sont-elles rapportées ?", a: "Le vicomte : il lui assure qu'il la guidera et que tout se passera bien. Ses paroles sont rapportées au discours indirect.",
   q: "Les paroles du vicomte sont rapportées au…", o: ["discours indirect", "discours direct", "discours indirect libre", "passé antérieur"]},
  {n: "amb", card: "Comment le narrateur rapporte-t-il les pensées d'Emma ?", a: "Au discours indirect libre.", q: "Les pensées d'Emma sont rapportées au…", o: ["discours indirect libre", "discours direct", "discours indirect", "dialogue de théâtre"]},
  {n: "amb", card: "Comment le vicomte apparaît-il au bal ?", a: "En séducteur sûr de son pouvoir : il porte bien le vêtement, sait parfaitement danser, propose de guider Emma. Il apparaît en position de séducteur, la taille cambrée, le coude arrondi et la bouche en avant.",
   q: "Au bal, le vicomte apparaît comme…", o: ["un séducteur sûr de son pouvoir", "un danseur maladroit", "un domestique timide", "un ouvrier fatigué"]},

  /* Horace, Germinal */
  {n: "trv", card: "Que décident de créer les jeunes femmes d'Horace ?", a: "Un atelier de couture, où elles travaillent en association.", q: "Les jeunes femmes d'Horace créent…", o: ["un atelier de couture", "une école", "une auberge", "un journal"]},
  {n: "trv", card: "Pourquoi la vie à Paris est-elle difficile pour les jeunes femmes d'Horace ?", a: "Tout est beaucoup plus cher qu'en province, et elles courent de nombreux dangers si elles sortent seules le soir.",
   q: "À Paris, la vie est difficile pour les jeunes femmes car…", o: ["tout est plus cher et sortir seule le soir est dangereux", "il n'y a pas de travail du tout", "elles n'ont pas le droit de coudre", "la ville est trop calme"]},
  {n: "trv", card: "Pourquoi les associées travaillent-elles mieux que des ouvrières ?", a: "Travailler ensemble leur permet de gagner plus et d'exploiter les qualités de chacune. Les associées sont plus impliquées car elles sont associées aux bénéfices.",
   q: "Selon Eugénie, les associées sont plus impliquées que des ouvrières car elles…", o: ["sont associées aux bénéfices", "travaillent moins longtemps", "ont une patronne sévère", "sont mieux logées"]},
  {n: "trv", card: "Quelle difficulté du travail en équipe apparaît dans Horace ?", a: "Les caractères ne s'accordent pas toujours.", q: "La difficulté du travail en équipe vient du fait que…", o: ["les caractères ne s'accordent pas toujours", "l'atelier est trop petit", "elles n'ont pas de clientes", "elles ne savent pas coudre"]},
  {n: "trv", card: "D'où vient l'adjectif « cyclopéenne » ?", a: "Du mot « cyclope », géant à la force exceptionnelle qui apparaît dans l'Odyssée. Une construction cyclopéenne est solide et gigantesque : Louison coud « avec une solidité cyclopéenne ».",
   q: "« Cyclopéenne » vient de…", o: ["cyclope, le géant de l'Odyssée", "cycle, la roue", "cyclone, la tempête", "cyclamen, la fleur"]},
  {n: "trv", card: "Quelle jeune femme d'Horace paraît la plus autoritaire ?", a: "Louison, qualifiée de « virago » ; elle est habituée à commander.", q: "La plus autoritaire des jeunes femmes est…", o: ["Louison", "Eugénie", "Marthe", "Suzanne"]},
  {n: "trv", card: "Les jeunes femmes d'Horace sont-elles émancipées ?", a: "Oui : leur volonté de créer un atelier de couture et de travailler en association est une initiative totalement innovante pour l'époque.",
   q: "Créer un atelier en association, pour ces jeunes femmes, c'est…", o: ["une initiative totalement innovante pour l'époque", "une habitude ancienne", "une obligation imposée par leurs maris", "un projet qui échoue tout de suite"]},
  {n: "trv", card: "Comment Zola décrit-il la mine dans Germinal ?", a: "Comme une fournaise, dans les profondeurs de la terre : l'air est irrespirable, l'eau suinte et enveloppe les mineurs d'humidité, la poussière de charbon risque de les étouffer ou de les aveugler.",
   q: "Dans Germinal, la mine est décrite comme…", o: ["une fournaise humide et étouffante", "un lieu frais et agréable", "un jardin souterrain", "une salle de bal"]},
  {n: "trv", card: "Quelle comparaison montre la vulnérabilité de Maheu ?", a: "Maheu est « pris entre deux feuillets d'un livre » : cette comparaison souligne l'extrême vulnérabilité des mineurs.",
   q: "« Pris entre deux feuillets d'un livre » : cette comparaison souligne…", o: ["l'extrême vulnérabilité des mineurs", "la richesse des mineurs", "l'amour de la lecture", "la force de Maheu"]},
  {n: "trv", card: "Comment Zola rend-il la mine presque fantastique ?", a: "Par des notations auditives et visuelles : les coups de rivelaine sont voilés et lointains ; des formes spectrales s'agitent dans l'obscurité ; on ne distingue que des bribes de corps (une rondeur de hanche, un bras noueux, une tête violente).",
   q: "Pour rendre la mine inquiétante, Zola utilise surtout…", o: ["des notations auditives et visuelles", "des dialogues comiques", "des chiffres précis", "des dates historiques"]}
].map((c, i) => Object.assign(c, {id: "c" + i, q: c.q || c.card}));

/* ---------- classes grammaticales : mot souligné → classe ---------- */
const K = {NOM: "un nom", DET: "un déterminant", ADJ: "un adjectif qualificatif", PRO: "un pronom", VER: "un verbe",
  ADV: "un adverbe", PREP: "une préposition", CCOO: "une conjonction de coordination", CSUB: "une conjonction de subordination",
  INT: "une interjection", ONO: "une onomatopée"};
const KPL = {NOM: "des noms", DET: "des déterminants", ADJ: "des adjectifs qualificatifs", PRO: "des pronoms", VER: "des verbes",
  ADV: "des adverbes", PREP: "des prépositions", CCOO: "des conjonctions de coordination", CSUB: "des conjonctions de subordination",
  INT: "des interjections", ONO: "des onomatopées"};
const KFAM = [["ADV", "PREP", "CCOO", "CSUB"], ["NOM", "DET", "ADJ", "PRO", "VER"], ["INT", "ONO", "ADV"]];
const CLS_EX = [
  ["<u>Quand</u> je suis allé chez le dentiste, il m'a dit que j'avais une carie.", "CSUB"],
  ["Quand je suis allé <u>chez</u> le dentiste, il m'a dit que j'avais une carie.", "PREP"],
  ["Il m'a dit que j'avais <u>certainement</u> une carie.", "ADV"],
  ["J'avais une carie <u>car</u> je ne me lavais pas bien les dents.", "CCOO"],
  ["<u>Lorsque</u> je vis un frelon dans le salon, je suis vite allé chercher une raquette.", "CSUB"],
  ["Lorsque je vis un frelon <u>dans</u> le salon, je suis allé chercher une raquette.", "PREP"],
  ["Je suis <u>vite</u> allé chercher une raquette électrique.", "ADV"],
  ["Je suis allé chercher une raquette <u>et</u> je l'ai tué.", "CCOO"],
  ["<u>Selon</u> mes professeurs, je parle trop.", "PREP"],
  ["Je parle trop <u>mais</u> je dis souvent que ce n'est pas moi.", "CCOO"],
  ["Selon mes professeurs, je parle <u>trop</u>.", "ADV"],
  ["Je dis souvent <u>que</u> ce n'est pas moi.", "CSUB"],
  ["Le troll <u>apparut</u> soudainement avec un bruit de tonnerre.", "VER"],
  ["Le troll apparut <u>soudainement</u> avec un bruit de tonnerre.", "ADV"],
  ["Le <u>troll</u> apparut soudainement avec un bruit de tonnerre.", "NOM"],
  ["Il semblait plus <u>grand</u> qu'un immeuble.", "ADJ"],
  ["<u>Il</u> m'observa un instant.", "PRO"],
  ["Puis il m'attrapa dans un mouvement <u>brusque</u>.", "ADJ"],
  ["Et il m'emporta dans <u>sa</u> bouche.", "DET"],
  ["Rastignac arrive à <u>Paris</u>.", "NOM"],
  ["<u>Plouf</u> ! Le caillou tomba dans l'eau.", "ONO"],
  ["<u>Dring</u> ! Le réveil sonna.", "ONO"],
  ["<u>Ah</u> ! Quelle bonne surprise !", "INT"],
  ["<u>Eh</u> ! Attends-moi !", "INT"],
  ["Les jeunes s'amusent <u>avec</u> leurs amis.", "PREP"],
  ["Elle avança <u>élégamment</u> vers la salle de bal.", "ADV"],
  ["<u>Plusieurs</u> mineurs descendirent dans la fosse.", "DET"],
  ["Je n'ai <u>rien</u> vu.", "PRO"],
  ["Le vicomte <u>valsait</u> avec Emma.", "VER"],
  ["Rastignac était pauvre, <u>donc</u> il marchait à pied.", "CCOO"],
  ["<u>Bien qu'</u>il soit pauvre, Rastignac est ambitieux.", "CSUB"],
  ["Les ouvrières cousaient <u>rapidement</u>.", "ADV"],
  ["Eugénie dirigeait les <u>travaux</u> de l'atelier.", "NOM"],
  ["La salle était <u>immense</u> et brillante.", "ADJ"],
  ["Emma regardait la dame <u>qui</u> dansait.", "PRO"],
  ["L'atelier ouvrira <u>dès que</u> les associées seront prêtes.", "CSUB"],
  ["L'atelier ouvrira <u>dès</u> demain.", "PREP"],
  ["Elle travaille <u>pour</u> gagner sa vie.", "PREP"],
  ["Elle travaille <u>pour que</u> l'atelier réussisse.", "CSUB"]
];
const LISTES = [
  ["à, dans, par, pour, en, vers, avec, sans, sous, sur", "PREP"], ["mais, ou, et, donc, or, ni, car", "CCOO"],
  ["que, comme, si, lorsque, parce que, bien que, dès que", "CSUB"], ["très, vite, aujourd'hui, lentement, élégamment", "ADV"],
  ["Eh ! Ah ! Oh !", "INT"], ["Dring ! Plouf ! Crac ! Boum !", "ONO"], ["vert, gros, petit, immense", "ADJ"],
  ["chanter, finir, servir, pouvoir, prendre, aller, avoir", "VER"]
];

/* déterminants et pronoms : la sorte précise */
const D = {ADEF: "un article défini", AIND: "un article indéfini", APART: "un article partitif", ACONT: "un article défini contracté",
  DPOSS: "un déterminant possessif", DDEM: "un déterminant démonstratif", DNUM: "un déterminant numéral", DIND: "un déterminant indéfini",
  DINT: "un déterminant exclamatif ou interrogatif",
  PPERS: "un pronom personnel", PREL: "un pronom relatif", PPOSS: "un pronom possessif", PDEM: "un pronom démonstratif", PIND: "un pronom indéfini"};
const DP_EX = [
  ["Il entra dans <u>la</u> salle d'auberge.", "ADEF"], ["Il vivait dans <u>ce</u> pays de marais.", "DDEM"],
  ["Elle tenait la lettre dans <u>sa</u> main.", "DPOSS"], ["Il appuyait sa tête sur <u>une</u> main.", "AIND"],
  ["Il portait <u>un</u> manteau couleur de sang.", "AIND"], ["Il se réchauffait près <u>du</u> feu.", "ACONT"],
  ["C'était un homme <u>au</u> long visage sombre.", "ACONT"], ["Le matin, je bois <u>du</u> lait.", "APART"],
  ["Elle mange <u>de la</u> confiture.", "APART"], ["<u>Cet</u> homme est riche.", "DDEM"],
  ["<u>Nos</u> souvenirs d'enfance reviennent.", "DPOSS"], ["Les ouvrières montrent <u>leurs</u> qualités.", "DPOSS"],
  ["<u>Trois</u> jeunes femmes créent un atelier.", "DNUM"], ["<u>Plusieurs</u> mineurs descendent dans la fosse.", "DIND"],
  ["<u>Chaque</u> associée touche une part des bénéfices.", "DIND"], ["<u>Certains</u> souvenirs reviennent.", "DIND"],
  ["<u>Aucun</u> élève n'a répondu.", "DIND"], ["<u>Quelle</u> belle robe !", "DINT"], ["<u>Quel</u> livre lis-tu ?", "DINT"],
  ["<u>Nous</u> trouvâmes la porte ouverte.", "PPERS"], ["Ils s'assirent en face d'<u>eux</u>.", "PPERS"],
  ["Le vicomte <u>lui</u> assura que tout se passerait bien.", "PPERS"], ["Le garçon <u>qui</u> parle est mon frère.", "PREL"],
  ["La maison <u>où</u> j'habite est grande.", "PREL"], ["Voici le livre <u>dont</u> je parle.", "PREL"],
  ["Ton vélo est rouge, <u>le mien</u> est bleu.", "PPOSS"], ["Prends ce gâteau, je garde <u>celui-ci</u>.", "PDEM"],
  ["<u>Cela</u> me plaît beaucoup.", "PDEM"], ["<u>Personne</u> n'est venu.", "PIND"], ["<u>Rien</u> ne l'arrête.", "PIND"],
  ["<u>Certains</u> sont partis tôt.", "PIND"], ["<u>Aucun</u> n'a répondu.", "PIND"], ["Les uns dansent, les <u>autres</u> regardent.", "PIND"]
];
const CONTRACTE = [["au", "à", "le"], ["aux", "à", "les"], ["du", "de", "le"], ["des", "de", "les"]];

/* ---------- fonctions : groupe souligné → fonction ---------- */
const F = {SUJ: "sujet", COD: "COD", COI: "COI", ATT: "attribut du sujet", AGT: "complément d'agent",
  CEL: "complément essentiel de lieu", CEM: "complément essentiel de mesure",
  CCL: "CC de lieu", CCT: "CC de temps", CCM: "CC de manière", CCMOY: "CC de moyen", CCB: "CC de but",
  CDN: "complément du nom", EPI: "épithète", APO: "adjectif apposé", APP: "apposition"};
const FFAM = [["SUJ", "COD", "COI", "ATT", "AGT"], ["CEL", "CEM", "CCL", "CCT", "CCM", "CCMOY", "CCB"], ["CDN", "EPI", "APO", "APP", "ATT"]];
const FON_EX = [
  ["<u>Roméo</u> s'approche de Juliette.", "SUJ", "Qui est-ce qui s'approche de Juliette ? Roméo."],
  ["<u>Antigone</u> défie Créon.", "SUJ", "Qui est-ce qui défie Créon ? Antigone."],
  ["Antigone défie <u>Créon</u>.", "COD", "Antigone défie qui ? Créon : pas de préposition."],
  ["Elle s'oppose <u>à son oncle</u>.", "COI", "Elle s'oppose à qui ? À son oncle : il y a la préposition « à »."],
  ["Karim est <u>heureux</u>.", "ATT", "Karim = heureux, avec le verbe d'état « être »."],
  ["Thomas semble <u>joyeux</u>.", "ATT", "Thomas = joyeux, avec le verbe d'état « sembler »."],
  ["Il est tombé <u>amoureux</u>.", "ATT", "Il = amoureux, avec le verbe attributif « tomber »."],
  ["Julie est <u>épuisée</u>.", "ATT", "Julie = épuisée."],
  ["Elle est <u>à la gare</u>.", "CEL", "On ne peut pas le supprimer (« Elle est. » ne veut rien dire) : complément essentiel de lieu."],
  ["Elle m'attend <u>à la gare</u>.", "CCL", "On peut le supprimer (« Elle m'attend. ») : CC de lieu."],
  ["J'habite <u>à Rennes</u>.", "CEL", "On ne peut pas le supprimer : complément essentiel de lieu."],
  ["Je pars en vacances <u>à Rennes</u>.", "CCL", "On peut le supprimer : CC de lieu."],
  ["Ils vont <u>à la plage</u>.", "CEL", "« Ils vont. » est incomplet : complément essentiel de lieu."],
  ["Ce paquet pèse <u>deux kilos</u>.", "CEM", "On ne peut pas le supprimer : complément essentiel de mesure."],
  ["Créon est défié <u>par Antigone</u>.", "AGT", "Voix passive : c'est Antigone qui fait l'action. → Antigone défie Créon."],
  ["Antigone est arrêtée <u>par les gardes</u>.", "AGT", "Voix passive : ce sont les gardes qui font l'action."],
  ["Les dauphins ont été touchés <u>par un virus</u>.", "AGT", "Voix passive : → Un virus a touché les dauphins."],
  ["J'appelle <u>ma mère</u>.", "COD", "J'appelle qui ? Ma mère : pas de préposition."],
  ["Je téléphone <u>à ma mère</u>.", "COI", "Je téléphone à qui ? À ma mère."],
  ["Il <u>leur</u> offre des fleurs.", "COI", "Il offre des fleurs à qui ? À eux : « leur » = COI."],
  ["Il leur offre <u>des fleurs</u>.", "COD", "Il offre quoi ? Des fleurs."],
  ["<u>Les jours de pluie</u> sont tristes.", "SUJ", "Qu'est-ce qui est triste ? Les jours de pluie."],
  ["<u>Chaque jour</u>, il se promène au bord de l'eau.", "CCT", "Il indique quand ; on peut le supprimer."],
  ["Il répare l'écran <u>à l'aide d'un fin crochet</u>.", "CCMOY", "Avec quoi ? À l'aide d'un fin crochet : le moyen."],
  ["Il décolle les touches <u>délicatement</u>.", "CCM", "Comment ? Délicatement : la manière."],
  ["Il travaille <u>avec précaution</u>.", "CCM", "Comment ? Avec précaution : la manière."],
  ["Il retire les touches <u>pour les recoller sur l'écran</u>.", "CCB", "Dans quel but ? Pour les recoller : le but."],
  ["<u>Lorsqu'il a fini son travail de précision</u>, il range ses outils.", "CCT", "Quand ? Lorsqu'il a fini : le temps."],
  ["Les élèves <u>de ma classe</u> sont bavards.", "CDN", "Il complète le nom « élèves » avec la préposition « de »."],
  ["Il porte une montre <u>en or</u>.", "CDN", "Il donne la matière de la montre, avec la préposition « en »."],
  ["Ils accostèrent sur une île <u>connue</u>.", "EPI", "Il complète le nom « île » directement, sans préposition."],
  ["Il avait un <u>long</u> visage sombre.", "EPI", "Il complète le nom « visage » directement."],
  ["<u>Fatigués</u>, les enfants se sont couchés tôt.", "APO", "L'adjectif est séparé du nom par une virgule : il est apposé (détaché)."],
  ["<u>Ambitieux</u>, Rastignac veut réussir.", "APO", "Séparé par une virgule : adjectif apposé."],
  ["Rodin, <u>sculpteur célèbre</u>, exposait ses œuvres.", "APP", "Un nom placé près de « Rodin » qui le qualifie comme un adjectif : apposition."],
  ["Paris, <u>capitale de la France</u>, attire les provinciaux.", "APP", "Apposition au nom « Paris »."],
  ["Rastignac marche <u>avec mille précautions</u>.", "CCM", "Comment ? Avec mille précautions."],
  ["Emma regarde <u>les danseurs</u>.", "COD", "Emma regarde qui ? Les danseurs."]
];
const VOIX = [
  {p: "Créon est défié par Antigone.", a: "Antigone défie Créon.", ag: ["par Antigone", "Antigone"], t: ["Créon défie Antigone.", "Antigone est défiée par Créon.", "Créon est défié."]},
  {p: "La victoire a été remportée par notre équipe.", a: "Notre équipe a remporté la victoire.", ag: ["par notre équipe", "notre équipe"], t: ["La victoire a remporté notre équipe.", "Notre équipe a été remportée.", "La victoire est remportée."]},
  {p: "Nous sommes surpris par cette décision.", a: "Cette décision nous surprend.", ag: ["par cette décision", "cette décision"], t: ["Nous surprenons cette décision.", "Cette décision est surprise par nous.", "Nous sommes surpris."]},
  {p: "Ce chanteur est apprécié de tous.", a: "Tous apprécient ce chanteur.", ag: ["de tous", "tous"], t: ["Ce chanteur apprécie tous.", "Tous sont appréciés de ce chanteur.", "Ce chanteur est apprécié par lui-même."]},
  {p: "Les dauphins ont été touchés par un virus.", a: "Un virus a touché les dauphins.", ag: ["par un virus", "un virus"], t: ["Les dauphins ont touché un virus.", "Un virus a été touché par les dauphins.", "Les dauphins sont touchés."]},
  {p: "Tu seras rattrapé très vite par les enfants.", a: "Les enfants te rattraperont très vite.", ag: ["par les enfants", "les enfants"], t: ["Tu rattraperas très vite les enfants.", "Les enfants seront rattrapés très vite par toi.", "Tu seras rattrapé très vite."]},
  {p: "Ce poème avait été composé par Rimbaud.", a: "Rimbaud avait composé ce poème.", ag: ["par Rimbaud", "Rimbaud"], t: ["Ce poème avait composé Rimbaud.", "Rimbaud avait été composé par ce poème.", "Ce poème avait été composé."]}
];

/* ---------- temps du récit ---------- */
const TPS = {PS: "passé simple", IMP: "imparfait", PQP: "plus-que-parfait", PA: "passé antérieur", COND: "conditionnel présent"};
const EMP = {PONCT: "une action ponctuelle de premier plan, qui fait progresser le récit", SUCC: "des actions successives qui s'enchaînent",
  DESC: "une description (arrière-plan)", COURS: "une action en cours de déroulement", HAB: "une habitude, une action qui se répète",
  FUT: "une action à venir par rapport à un moment du passé", ANT: "une action antérieure à une autre action passée"};
const CLOSE = {PONCT: ["SUCC"], SUCC: ["PONCT"], DESC: ["COURS"], COURS: ["DESC"]};   // emplois trop proches pour servir de piège
const TPS_EX = [
  ["Soudain, on <u>entendit</u> un bruit bizarre.", "PS", "PONCT"],
  ["Il <u>entra</u> dans la pièce, <u>se servit</u> un café et <u>sortit</u>.", "PS", "SUCC"],
  ["La maison <u>était</u> silencieuse.", "IMP", "DESC"],
  ["La charrette <u>s'enfonçait</u> dans la boue.", "IMP", "COURS"],
  ["Tous les matins, il <u>allait</u> nager avant le travail.", "IMP", "HAB"],
  ["Ils se dirent qu'ils <u>s'aimeraient</u> toute la vie.", "COND", "FUT"],
  ["Il <u>avait plu</u> la veille. Le sol était détrempé.", "PQP", "ANT"],
  ["Quand il <u>eut vu</u> le vieillard, il se précipita.", "PA", "ANT"],
  ["Le vicomte l'<u>invita</u> à danser.", "PS", "PONCT"],
  ["Emma <u>regardait</u> les couples qui valsaient.", "IMP", "COURS"],
  ["Rastignac <u>était</u> de bonne famille mais sans fortune.", "IMP", "DESC"],
  ["Chaque soir, les ouvrières <u>cousaient</u> jusqu'à minuit.", "IMP", "HAB"],
  ["Rastignac pensait qu'il <u>réussirait</u> dans le monde.", "COND", "FUT"],
  ["Dès qu'il <u>eut refermé</u> la porte, il s'assit.", "PA", "ANT"],
  ["Elle <u>avait vu</u> le loup la nuit précédente ; elle tremblait encore.", "PQP", "ANT"],
  ["La salle <u>brillait</u> de mille bougies.", "IMP", "DESC"],
  ["Elle <u>se leva</u>, <u>prit</u> son manteau et <u>partit</u>.", "PS", "SUCC"],
  ["Le mineur <u>frappa</u> la roche d'un coup sec.", "PS", "PONCT"],
  ["Les mineurs <u>travaillaient</u> dans une chaleur de fournaise.", "IMP", "COURS"],
  ["Le vicomte lui assura qu'il la <u>guiderait</u>.", "COND", "FUT"]
];
/* passé simple : je, tu, il, nous, vous, ils */
const PERS = ["je", "tu", "il", "nous", "vous", "ils"];
const VERBS = [
  {inf: "prendre", f: ["pris", "pris", "prit", "prîmes", "prîtes", "prirent"], err: ["prena", "prendit"]},
  {inf: "chanter", f: ["chantai", "chantas", "chanta", "chantâmes", "chantâtes", "chantèrent"], err: ["chantat", "chantit"]},
  {inf: "s'évanouir", f: ["évanouis", "évanouis", "évanouit", "évanouîmes", "évanouîtes", "évanouirent"], refl: ["me", "te", "s'", "nous", "vous", "s'"], err: ["évanouissa", "évanouissit"]},
  {inf: "savoir", f: ["sus", "sus", "sut", "sûmes", "sûtes", "surent"], err: ["savut", "savit"]},
  {inf: "mettre", f: ["mis", "mis", "mit", "mîmes", "mîtes", "mirent"], err: ["mettit", "metta"]},
  {inf: "être", f: ["fus", "fus", "fut", "fûmes", "fûtes", "furent"], err: ["était", "êtrit"]},
  {inf: "avoir", f: ["eus", "eus", "eut", "eûmes", "eûtes", "eurent"], err: ["avait", "avit"]},
  {inf: "découvrir", f: ["découvris", "découvris", "découvrit", "découvrîmes", "découvrîtes", "découvrirent"], err: ["découvra", "découvrut"]},
  {inf: "faire", f: ["fis", "fis", "fit", "fîmes", "fîtes", "firent"], err: ["faisit", "fasa"]},
  {inf: "croire", f: ["crus", "crus", "crut", "crûmes", "crûtes", "crurent"], err: ["croyit", "croya"]},
  {inf: "recevoir", f: ["reçus", "reçus", "reçut", "reçûmes", "reçûtes", "reçurent"], err: ["recevit", "recevut"]},
  {inf: "retenir", f: ["retins", "retins", "retint", "retînmes", "retîntes", "retinrent"], err: ["retenit", "retenut"]}
];
const subj = (v, k) => {
  if (v.refl) { const r = v.refl[k]; return `${PERS[k] === "je" ? "je" : PERS[k]} ${r}${r.endsWith("'") ? "" : " "}`.replace("je me ", "je m'").replace("tu te ", "tu t'"); }
  return PERS[k] === "je" && /^[aeiouéèêh]/i.test(v.f[0]) ? "j'" : PERS[k] + " ";
};
const conjForm = (v, k) => subj(v, k) + v.f[k];

/* ---------- accords ---------- */
const FEM = [
  ["apprenti", "apprentie"], ["loyal", "loyale"], ["fidèle", "fidèle"], ["captif", "captive"], ["marchand", "marchande"],
  ["muet", "muette"], ["fou", "folle"], ["favori", "favorite"], ["docteur", "doctoresse"], ["menteur", "menteuse"],
  ["conducteur", "conductrice"], ["public", "publique"], ["civil", "civile"], ["puéril", "puérile"], ["tranquille", "tranquille"],
  ["réel", "réelle"], ["bref", "brève"], ["attentif", "attentive"], ["nouveau", "nouvelle"], ["vieux", "vieille"], ["naïf", "naïve"],
  ["courageux", "courageuse"], ["heureux", "heureuse"], ["talentueux", "talentueuse"], ["fougueux", "fougueuse"], ["joueur", "joueuse"],
  ["gentil", "gentille"], ["cruel", "cruelle"], ["héros", "héroïne"], ["infirmier", "infirmière"], ["acteur", "actrice"],
  ["destructeur", "destructrice"], ["roux", "rousse"], ["blanc", "blanche"], ["coq", "poule"], ["loup", "louve"], ["cerf", "biche"]
];
const PLUR = [
  ["cheval", "chevaux"], ["central", "centraux"], ["oriental", "orientaux"], ["bocal", "bocaux"], ["bijou", "bijoux"], ["caillou", "cailloux"],
  ["chou", "choux"], ["genou", "genoux"], ["hibou", "hiboux"], ["joujou", "joujoux"], ["pou", "poux"], ["vitrail", "vitraux"],
  ["corail", "coraux"], ["émail", "émaux"], ["soupirail", "soupiraux"], ["travail", "travaux"], ["fabliau", "fabliaux"], ["seau", "seaux"],
  ["feu", "feux"], ["joyau", "joyaux"], ["landau", "landaus"], ["bleu", "bleus"], ["pneu", "pneus"], ["banal", "banals"], ["fatal", "fatals"],
  ["final", "finals"], ["glacial", "glacials"], ["naval", "navals"], ["bal", "bals"], ["carnaval", "carnavals"], ["chacal", "chacals"],
  ["festival", "festivals"], ["récital", "récitals"], ["régal", "régals"], ["gris", "gris"], ["jaloux", "jaloux"], ["nez", "nez"],
  ["ciel", "cieux"], ["œil", "yeux"], ["éventail", "éventails"], ["gouvernail", "gouvernails"], ["détail", "détails"], ["verrou", "verrous"],
  ["bambou", "bambous"], ["précieux", "précieux"], ["pays", "pays"]
];
/* genre : [masculin ?, nom, adjectif au masculin, au féminin] */
const GENRE = [
  [true, "tentacule", "démesuré", "démesurée"], [true, "intermède", "joyeux", "joyeuse"], [false, "autoroute", "dangereux", "dangereuse"],
  [true, "planisphère", "grand", "grande"], [true, "haltère", "lourd", "lourde"], [true, "pétale", "blanc", "blanche"],
  [false, "apostrophe", "violent", "violente"], [false, "analogie", "troublant", "troublante"], [true, "éloge", "flatteur", "flatteuse"],
  [false, "icône", "éternel", "éternelle"], [false, "artère", "étroit", "étroite"], [false, "alcôve", "sombre", "sombre"]
];
/* [bonne écriture, piège, règle] */
const ACCORD = [
  ["des étagères orange", "des étagères oranges", "« orange » est un nom utilisé comme adjectif de couleur : pas d'accord."],
  ["des écharpes marron", "des écharpes marrons", "« marron » est un nom utilisé comme adjectif de couleur : pas d'accord."],
  ["des robes vert clair", "des robes vertes claires", "Couleur exprimée par deux adjectifs : pas d'accord."],
  ["des pantalons bleu marine", "des pantalons bleus marine", "Couleur exprimée par deux mots : pas d'accord."],
  ["des yeux bleus", "des yeux bleu", "Un seul adjectif de couleur : il s'accorde normalement."],
  ["une demi-heure", "une demie-heure", "« demi » placé devant le nom est invariable."],
  ["nu-pieds", "nus-pieds", "« nu » placé devant le nom est invariable."],
  ["les jambes nues", "les jambes nu", "Après le nom, « nu » s'accorde."],
  ["quatre-vingts ans", "quatre-vingt ans", "« vingt » multiplié (4 × 20) et non suivi d'un autre nombre prend un « s »."],
  ["quatre-vingt-six ans", "quatre-vingts-six ans", "Suivi d'un autre nombre, « vingt » ne prend pas de « s »."],
  ["trois cents pages", "trois cent pages", "« cent » multiplié (3 × 100) prend un « s »."],
  ["trois cent trente pages", "trois cents trente pages", "Suivi d'un autre nombre, « cent » ne prend pas de « s »."],
  ["deux mille euros", "deux milles euros", "« mille » est toujours invariable."],
  ["des miettes de pain", "des miettes de pains", "L'accord se fait selon le sens : les miettes viennent d'un pain."],
  ["un groupe d'arbres", "un groupe d'arbre", "L'accord se fait selon le sens : un groupe contient plusieurs arbres."],
  ["un champ de coquelicots", "un champ de coquelicot", "Selon le sens : il y a plusieurs coquelicots dans le champ."],
  ["un échange de marchandises", "un échange de marchandise", "Selon le sens : on échange plusieurs marchandises."],
  ["un vieil ami", "un vieux ami", "Devant une voyelle, on écrit « vieil »."],
  ["un nouvel appareil", "un nouveau appareil", "Devant une voyelle, on écrit « nouvel »."],
  ["Convaincue par ton raisonnement, Léa a accepté.", "Convaincu par ton raisonnement, Léa a accepté.", "Participe passé employé comme adjectif : il s'accorde avec « Léa »."],
  ["Ces bagues, oubliées dans un café, ont été retrouvées.", "Ces bagues, oublié dans un café, ont été retrouvées.", "Participe passé employé comme adjectif (sans auxiliaire) : il s'accorde avec « bagues »."],
  ["Cette boutique attire une clientèle nombreuse.", "Cette boutique attire une clientèle nombreux.", "L'adjectif s'accorde avec « clientèle » (féminin singulier)."],
  ["une école publique", "une école public", "« public » fait « publique » au féminin."],
  ["des écharpes de soie très larges", "des écharpes de soies très larges", "« de soie » donne la matière : singulier ; « larges » s'accorde avec « écharpes »."]
];

/* ---------- vocabulaire ---------- */
const SYN = [["bahut", "buffet"], ["secrétaire", "bureau"], ["lustre", "plafonnier"], ["bergère", "fauteuil"], ["guéridon", "table"], ["sofa", "divan"]];
const LIEU = [["une véranda", true], ["une mansarde", true], ["un grenier", true], ["un corridor", true],
  ["un bosquet", false], ["une corbeille (de fleurs)", false], ["un parterre", false], ["une allée", false]];
const MAT = [["des couverts", "en argent"], ["une commode", "en acajou"], ["un drap", "en soie"], ["un parquet", "en chêne"], ["un fauteuil", "en cuir"], ["de la vaisselle", "en faïence"]];
const VAISS = [["la soupe", "une soupière", ["soupiere"]], ["la salade", "un saladier", ["saladier"]], ["le thé", "une théière", ["theiere"]],
  ["le café", "une cafetière", ["cafetiere"]], ["le chocolat", "une chocolatière", ["chocolatiere"]], ["le sucre", "un sucrier", ["sucrier"]],
  ["le pain", "une panière", ["paniere", "corbeille a pain"]]];
const DEFS = [
  ["Siège sans bras ni dossier : « Il n'y a plus de chaises, prends donc un… »", "un tabouret", ["tabouret"]],
  ["Petite table étroite contre le mur, dans l'entrée : « J'ai posé les clés sur la… »", "une console", ["console"]],
  ["Meuble où l'on range la vaisselle", "un buffet", ["buffet", "bahut"]],
  ["Large fauteuil confortable : « Confortablement installé dans une… Louis XV, il fumait son cigare »", "une bergère", ["bergere"]],
  ["Appareil d'éclairage suspendu au plafond : « un magnifique… en cristal de Venise »", "un lustre", ["lustre", "plafonnier"]],
  ["Emplacement au fond d'une chambre pour mettre un lit", "une alcôve", ["alcove"]],
  ["Pièce dont les murs sont en pente, sous le toit", "une mansarde", ["mansarde"]],
  ["Grosse pièce de bois qui supporte le plafond", "une poutre", ["poutre"]],
  ["Trou aménagé dans l'épaisseur du mur", "une niche", ["niche"]]
];
const MATS = {tissu: ["cachemire", "tulle", "étoffe", "velours", "satin", "lin", "soie"], métal: ["inox", "zinc", "platine", "fonte", "bronze", "étain", "acier", "cuivre"],
  bois: ["ébène", "teck", "acajou", "pin", "rotin", "chêne"], pierre: ["marbre", "albâtre", "jade"]};
const ADV = [["rapide", "rapidement"], ["impatient", "impatiemment"], ["assidu", "assidûment"], ["bref", "brièvement"], ["élégant", "élégamment"],
  ["malheureux", "malheureusement"], ["gentil", "gentiment"], ["imprudent", "imprudemment"], ["aisé", "aisément"], ["clair", "clairement"],
  ["nécessaire", "nécessairement"], ["méchant", "méchamment"], ["diligent", "diligemment"], ["solide", "solidement"], ["maladroit", "maladroitement"],
  ["consciencieux", "consciencieusement"], ["délicat", "délicatement"], ["fidèle", "fidèlement"]];

/* ---------- les romans de la séquence ---------- */
const OEUVRES = [
  {t: "Le Père Goriot", a: "Balzac", n: "amb", theme: "le désir de réussite sociale", persos: ["Rastignac"]},
  {t: "Horace", a: "George Sand", n: "trv", theme: "la place de la femme dans la société", persos: ["Eugénie", "Louison", "Marthe", "Suzanne"]},
  {t: "Germinal", a: "Émile Zola", n: "trv", theme: "le travail à la mine", persos: ["Maheu"]},
  {t: "Madame Bovary", a: "Gustave Flaubert", n: "amb", theme: "une soirée au bal chez des aristocrates", persos: ["Emma", "le vicomte"]}
];

/* ---------- vrai ou faux ---------- */
const VF = [
  ["La classe grammaticale et la fonction, c'est la même chose.", false, "cls", "Non : la classe est la nature du mot (son identité), la fonction est son rôle dans la phrase."],
  ["L'adverbe est un mot invariable.", true, "cls", "Oui : adverbe, préposition, conjonction, interjection, onomatopée sont invariables."],
  ["Le pronom est un mot invariable.", false, "cls", "Non : le pronom fait partie des mots variables (il / elle / ils)."],
  ["« car » est une conjonction de subordination.", false, "cls", "Non : « car » est une conjonction de coordination (mais, ou, et, donc, or, ni, car)."],
  ["« lorsque » est une conjonction de subordination.", true, "cls", "Oui, comme que, comme, si, parce que, dès que…"],
  ["« au » = « à » + « le ».", true, "cls", "Oui : c'est un article défini contracté."],
  ["« chez » est un adverbe.", false, "cls", "Non : « chez » est une préposition."],
  ["Le COD est relié au verbe par une préposition.", false, "fon", "Non : le COD est relié directement au verbe, sans préposition. C'est le COI qui a une préposition."],
  ["On peut supprimer un complément circonstanciel.", true, "fon", "Oui : la phrase reste correcte et garde son sens."],
  ["On peut supprimer un complément essentiel de lieu.", false, "fon", "Non : « Elle est à la gare » → « Elle est. » ne veut rien dire."],
  ["Le complément d'agent apparaît dans une phrase à la voix passive.", true, "fon", "Oui : il indique qui fait l'action. Il devient sujet à la voix active."],
  ["Le complément du nom est placé avant le nom.", false, "fon", "Non : toujours après le nom, et relié par une préposition."],
  ["Entre le sujet et l'attribut du sujet, on peut mettre un signe =.", true, "fon", "Oui : Karim est heureux → Karim = heureux."],
  ["Le passé simple sert surtout à décrire les lieux et les personnages.", false, "tps", "Non : c'est l'imparfait (arrière-plan). Le passé simple sert aux actions de premier plan."],
  ["L'imparfait peut exprimer une habitude.", true, "tps", "Oui : « Tous les matins, il allait nager avant le travail. »"],
  ["Dans un récit au passé, le conditionnel remplace le futur.", true, "tps", "Oui : « Ils se dirent qu'ils s'aimeraient toute la vie. »"],
  ["Le plus-que-parfait exprime une action postérieure à une action passée.", false, "tps", "Non : antérieure (qui s'est passée avant)."],
  ["Le passé simple de « recevoir » avec « il » est « il recevit ».", false, "tps", "Non : il reçut."],
  ["« fidèle » ne change pas au féminin.", true, "acc", "Oui : un ami fidèle, une amie fidèle."],
  ["Le pluriel de « festival » est « festivaux ».", false, "acc", "Non : festivals, comme bals, carnavals, chacals, récitals, régals."],
  ["« nez » ne change pas au pluriel.", true, "acc", "Oui : les mots en -s, -x, -z sont invariables."],
  ["On écrit « des chaussures oranges ».", false, "acc", "Non : « orange » est un nom utilisé comme adjectif de couleur : des chaussures orange."],
  ["« mille » ne prend jamais de « s ».", true, "acc", "Oui : les déterminants numéraux sont invariables, sauf vingt et cent multipliés."],
  ["Une mansarde est un élément du jardin.", false, "voc", "Non : c'est une pièce de la maison, aux murs en pente, sous le toit."],
  ["Une allée est un élément du jardin.", true, "voc", "Oui, comme un bosquet, une corbeille de fleurs, un parterre."],
  ["Le marbre est une pierre.", true, "voc", "Oui, comme l'albâtre et le jade."],
  ["Le satin est un métal.", false, "voc", "Non : c'est un tissu."],
  ["Le Père Goriot est un roman réaliste.", true, "rea", "Oui : c'est dans le bilan de la séance 2."],
  ["Germinal a été écrit par Gustave Flaubert.", false, "rea", "Non : Germinal est d'Émile Zola. Flaubert a écrit Madame Bovary."],
  ["Horace a été écrit par George Sand.", true, "rea", "Oui."],
  ["Rastignac est arrivé chez la comtesse en voiture.", false, "amb", "Non : il est arrivé à pied, et on le regarde avec mépris."],
  ["Emma Bovary sait parfaitement valser.", false, "amb", "Non : elle ne sait pas danser, ce qui montre qu'elle n'appartient pas au même milieu social."],
  ["Le bal de Madame Bovary a lieu au château, chez le marquis.", true, "amb", "Oui : c'est le bal annuel des aristocrates d'une bourgade normande."],
  ["Dans Horace, les jeunes femmes créent un atelier de couture.", true, "trv", "Oui, en association : une initiative innovante pour l'époque."],
  ["Zola fait l'éloge du travail à la mine.", false, "trv", "Non : il dénonce la pénibilité du travail ouvrier."],
  ["Zola compare les mineurs à des spectres.", true, "trv", "Oui : cela donne à la scène un aspect irréel, quasi fantastique."]
];

/* ---------- outils ---------- */
const lowq = s => String(s).toLowerCase().replace(/[’]/g, "'").replace(/œ/g, "oe").replace(/\s+/g, " ").trim();
const norm = s => fold(lowq(s)).replace(/'/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\b(l|le|la|les|un|une|des|d|de|du)\b/g, " ").replace(/\s+/g, " ").trim();
const stem = s => s.split(" ").map(w => w.replace(/(aux|es|e|s|x)$/, "")).join(" ");
/* tolérant : accents, majuscules, articles, pluriels et accords */
const wordOk = (list, ans) => { const a = norm(ans); return !!a && list.some(k => { const kk = norm(k); return a === kk || stem(a) === stem(kk); }); };
/* orthographe : la forme exacte compte (accents tolérés, mais rappelés) */
const DET_PRON = /^((le|la|les|un|une|des|je|tu|il|elle|on|nous|vous|ils|elles|me|te|se)\s+|(l|j|m|t|s)')+/;
function spellCheck(good, alts = []){
  return v => {
    const a = lowq(v).replace(/[.!?]+$/, "").replace(DET_PRON, "").trim();
    if (!a) return {ok: false, fix: `→ ${good}`};
    for (const g of [good, ...alts]) {
      const gg = lowq(g).replace(DET_PRON, "").trim();
      if (a === gg) return {ok: true, fix: "✓"};
      if (fold(a) === fold(gg)) return {ok: true, fix: `✓ Attention aux accents : ${good}`};
    }
    return {ok: false, fix: `→ ${good}`};
  };
}
const strip = h => String(h).replace(/<[^>]+>/g, "");
const tagOf = n => `<span class="tag ${({1: "l1", 2: "l2", 3: "l3"})[UBY[n].group]}">${esc(UBY[n].name)}</span>`;
const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;
const nl = s => esc(s).replace(/\n/g, "<br>");
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const sample = (arr, k) => shuffle(arr).slice(0, k);
const trouWord = t => Array.isArray(t) ? t[0] : t;
const trouAlts = t => Array.isArray(t) ? t : [t];
/* remplace un mot entier (pas à l'intérieur d'un autre mot) */
const wordRe = w => new RegExp(`(^|[^\\p{L}\\d])(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=[^\\p{L}\\d]|$)`, "gu");
const pcLabel = p => `<span class="label">À savoir par cœur · ${esc(p.source)}</span>`;
const trapOf = (p, [a, b]) => p.text.replace(a, b);
/* 3 options prises dans une famille de confusions, puis complétées */
function distract(keys, ans, fams, k = 3){
  const fam = fams.find(f => f.includes(ans)) || [];
  const near = shuffle(fam.filter(x => x !== ans)), far = shuffle(keys.filter(x => x !== ans && !fam.includes(x)));
  return [...near.slice(0, 2), ...far, ...near.slice(2)].slice(0, k);
}

/* ---------- générateurs : {n, prompt, opts | fields, explain, review, redo} ---------- */
const G = {
  parcoeur(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), traps = [...new Set(p.pieges.map(x => trapOf(p, x)))].filter(t => t !== p.text);
    return {n, prompt: `${pcLabel(p)}<br>${esc(p.q)}`, wide: true,
      opts: shuffle([{t: p.text, ok: true}, ...traps.map(t => ({t, ok: false}))]),
      explain: `La bonne réponse est la phrase du bilan, mot pour mot : c'est elle qu'il faut savoir redire.`,
      review: rev(n, p.q, p.text), redo: () => G.parcoeur(n)};
  },
  trous(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), tr = p.trous.slice(0, 3);
    let html = esc(p.text), full = esc(p.text);
    tr.forEach((t, i) => {
      const w = esc(trouWord(t));
      html = html.replace(wordRe(w), `$1<b class="blank">…(${i + 1})…</b>`);
      full = full.replace(wordRe(w), `$1<b>${w}</b>`);
    });
    return {n, prompt: `${pcLabel(p)}<br>Complète la phrase du cours :<br><span class="q">${html}</span>`, wide: true,
      fields: tr.map((t, i) => ({label: `Mot ${i + 1}`, lang: "fr", check: v => { const ok = wordOk(trouAlts(t), v); return {ok, fix: ok ? "✓" : `→ ${trouWord(t)}`}; }})),
      explain: full, review: rev(n, p.q, p.text), redo: () => G.trous(n)};
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
  classe(n){
    if (n !== "cls") return null;
    const [s, k] = pick(CLS_EX), others = distract(Object.keys(K), k, KFAM);
    return {n, prompt: `Quelle est la classe grammaticale du mot souligné ?<br><span class="q">${s}</span>`, wide: true,
      opts: shuffle([{t: cap(K[k]), ok: true}, ...others.map(x => ({t: cap(K[x]), ok: false}))]),
      explain: `C'est <b>${esc(K[k])}</b>.`, review: rev(n, strip(s), K[k]), redo: () => G.classe(n)};
  },
  liste(n){
    if (n !== "cls") return null;
    const [l, k] = pick(LISTES), others = distract(Object.keys(K), k, KFAM);
    return {n, prompt: `Ces mots sont tous…<br><b>${esc(l)}</b>`, wide: true,
      opts: shuffle([{t: cap(KPL[k]), ok: true}, ...others.map(x => ({t: cap(KPL[x]), ok: false}))]),
      explain: `Ce sont <b>${esc(KPL[k])}</b>.`, review: rev(n, l, KPL[k]), redo: () => G.liste(n)};
  },
  detpro(n){
    if (n !== "cls") return null;
    const [s, k] = pick(DP_EX), dets = Object.keys(D).filter(x => x[0] === "A" || x[0] === "D"), pros = Object.keys(D).filter(x => x[0] === "P");
    const same = (dets.includes(k) ? dets : pros).filter(x => x !== k), other = (dets.includes(k) ? pros : dets);
    const opts = [k, ...sample(same, 2), pick(other)];
    return {n, prompt: `Quelle est la nature précise du mot souligné ?<br><span class="q">${s}</span>`, wide: true,
      opts: shuffle(opts.map((x, i) => ({t: cap(D[x]), ok: i === 0}))), explain: `C'est <b>${esc(D[k])}</b>.`,
      review: rev(n, strip(s), D[k]), redo: () => G.detpro(n)};
  },
  contracte(n, typed){
    if (n !== "cls") return null;
    const [w, p, a] = pick(CONTRACTE);
    const base = {n, prompt: `L'article défini contracté <b>« ${w} »</b>, c'est « ${p} » + …`,
      explain: `${esc(w)} = ${esc(p)} + ${esc(a)}.`, review: rev(n, `${w} = ${p} + ?`, a), redo: () => G.contracte(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: `${p} + …`, lang: "fr", check: v => { const ok = lowq(v) === a; return {ok, fix: ok ? "✓" : `→ ${w} = ${p} + ${a}`}; }}]});
    return Object.assign(base, {opts: shuffle(["le", "la", "les", "l'"].map(x => ({t: x, ok: x === a})))});
  },
  fonction(n){
    if (n !== "fon") return null;
    const [s, k, why] = pick(FON_EX), others = distract(Object.keys(F), k, FFAM);
    return {n, prompt: `Quelle est la fonction du groupe souligné ?<br><span class="q">${s}</span>`, wide: true,
      opts: shuffle([{t: cap(F[k]), ok: true}, ...others.map(x => ({t: cap(F[x]), ok: false}))]),
      explain: `C'est <b>${esc(F[k])}</b>. ${esc(why)}`, review: rev(n, strip(s), F[k]), redo: () => G.fonction(n)};
  },
  voix(n, typed){
    if (n !== "fon") return null;
    const v = pick(VOIX);
    if (typed) return {n, prompt: `Quel est le complément d'agent dans cette phrase ?<br><span class="q">${esc(v.p)}</span>`,
      fields: [{label: "Le complément d'agent", lang: "fr", check: val => { const ok = wordOk(v.ag, val); return {ok, fix: ok ? "✓" : `→ ${v.ag[0]}`}; }}],
      explain: "", review: rev(n, `Complément d'agent : ${v.p}`, v.ag[0]), redo: () => G.voix(n, typed)};
    return {n, prompt: `Mets cette phrase à la voix active :<br><span class="q">${esc(v.p)}</span>`, wide: true,
      opts: shuffle([{t: v.a, ok: true}, ...v.t.map(t => ({t, ok: false}))]),
      explain: `Le complément d'agent (<b>${esc(v.ag[0])}</b>) devient le sujet : <b>${esc(v.a)}</b>`, review: rev(n, `Voix active : ${v.p}`, v.a), redo: () => G.voix(n, typed)};
  },
  temps(n){
    if (n !== "tps") return null;
    const [s, k] = pick(TPS_EX), others = sample(Object.keys(TPS).filter(x => x !== k), 3);
    return {n, prompt: `À quel temps est conjugué le verbe souligné ?<br><span class="q">${s}</span>`, wide: true,
      opts: shuffle([{t: cap(TPS[k]), ok: true}, ...others.map(x => ({t: cap(TPS[x]), ok: false}))]),
      explain: `C'est le <b>${esc(TPS[k])}</b>.`, review: rev(n, strip(s), TPS[k]), redo: () => G.temps(n)};
  },
  emploi(n){
    if (n !== "tps") return null;
    const [s, k, e] = pick(TPS_EX), bad = Object.keys(EMP).filter(x => x !== e && !(CLOSE[e] || []).includes(x));
    return {n, prompt: `Pourquoi l'auteur emploie-t-il ici le ${esc(TPS[k])} ? Il exprime…<br><span class="q">${s}</span>`, wide: true,
      opts: shuffle([{t: cap(EMP[e]), ok: true}, ...sample(bad, 3).map(x => ({t: cap(EMP[x]), ok: false}))]),
      explain: `Le ${esc(TPS[k])} exprime ici <b>${esc(EMP[e])}</b>.`, review: rev(n, `${strip(s)} (${TPS[k]})`, EMP[e]), redo: () => G.emploi(n)};
  },
  conj(n, typed){
    if (n !== "tps") return null;
    const v = pick(VERBS), k = Math.floor(Math.random() * 6), good = v.f[k], sub = subj(v, k).trim();
    const base = {n, review: rev(n, `Passé simple de « ${v.inf} » : ${sub}…`, conjForm(v, k)), redo: () => G.conj(n, typed),
      explain: `Au passé simple : ${v.f.map((f, i) => i === k ? `<b>${esc(conjForm(v, i))}</b>` : esc(conjForm(v, i))).join(", ")}.`};
    if (typed) return Object.assign(base, {prompt: `Conjugue <b>« ${esc(v.inf)} »</b> au passé simple.`, explain: "",
      fields: [{label: sub, lang: "fr", check: spellCheck(good)}]});
    const pool = [...new Set([...v.f.filter(f => f !== good), ...(k === 2 ? v.err : [])])];
    const traps = sample(k === 2 ? v.err : pool, 1).concat(sample(pool, 4)).filter((x, i, a) => a.indexOf(x) === i).slice(0, 3);
    return Object.assign(base, {prompt: `Passé simple de <b>« ${esc(v.inf)} »</b> : ${esc(sub)} …`,
      opts: shuffle([{t: good, ok: true}, ...traps.map(t => ({t, ok: false}))])});
  },
  fem(n, typed){
    if (n !== "acc") return null;
    const [m, f] = pick(FEM);
    const base = {n, prompt: `Quel est le féminin de <b>« ${esc(m)} »</b> ?`, explain: `${esc(m)} → <b>${esc(f)}</b>`,
      review: rev(n, `Féminin de « ${m} »`, f), redo: () => G.fem(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: "Au féminin", lang: "fr", check: spellCheck(f)}]});
    const cands = [m + "e", m + "te", m + "le", m.replace(/x$/, "se"), m.replace(/f$/, "ve"), m.replace(/eur$/, "euse"), m.replace(/eur$/, "rice"), m + "sse", m.replace(/(.)$/, "$1$1e")];
    const traps = [...new Set(cands)].filter(x => x !== f && !/ee$/.test(x));
    if (traps.length < 2) return G.plur(n, typed);
    return Object.assign(base, {opts: shuffle([{t: f, ok: true}, ...sample(traps, 3).map(t => ({t, ok: false}))])});
  },
  plur(n, typed){
    if (n !== "acc") return null;
    const [s, p] = pick(PLUR);
    const base = {n, prompt: `Quel est le pluriel de <b>« ${esc(s)} »</b> ?`, explain: `${esc(s)} → <b>${esc(p)}</b>`,
      review: rev(n, `Pluriel de « ${s} »`, p), redo: () => G.plur(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: "Au pluriel", lang: "fr", check: spellCheck(p)}]});
    const cands = /[sxz]$/.test(s) ? [s + "s", s.replace(/.$/, "x"), s.replace(/.$/, "s")] : [s + "s", s + "x", s.replace(/al$/, "aux"), s.replace(/ail$/, "aux"), s.replace(/au$/, "aux")];
    const t3 = [...new Set(cands)].filter(x => x !== p && (x !== s || /[sxz]$/.test(s))).slice(0, 3);
    if (t3.length < 2) return G.fem(n, typed);
    return Object.assign(base, {opts: shuffle([{t: p, ok: true}, ...t3.map(t => ({t, ok: false}))])});
  },
  genre(n){
    if (n !== "acc") return null;
    const [masc, nom, am, af] = pick(GENRE), good = masc ? `un ${nom} ${am}` : `une ${nom} ${af}`, bad = masc ? `une ${nom} ${af}` : `un ${nom} ${am}`;
    return {n, prompt: `Masculin ou féminin ? Quelle est la bonne écriture ?`, opts: shuffle([{t: good, ok: true}, {t: bad, ok: false}]),
      explain: `« ${esc(nom)} » est un nom <b>${masc ? "masculin" : "féminin"}</b> : ${esc(good)}.`, review: rev(n, `Genre de « ${nom} »`, good), redo: () => G.genre(n)};
  },
  accord(n){
    if (n !== "acc") return null;
    const [good, bad, why] = pick(ACCORD);
    return {n, prompt: "Quelle est la bonne orthographe ?", wide: true, opts: shuffle([{t: good, ok: true}, {t: bad, ok: false}]),
      explain: esc(why), review: rev(n, "Bonne orthographe", good), redo: () => G.accord(n)};
  },
  syn(n, typed){
    if (n !== "voc") return null;
    const [a, b] = pick(SYN), rev1 = Math.random() < 0.5, w = rev1 ? b : a, s = rev1 ? a : b, all = SYN.map(x => rev1 ? x[0] : x[1]);
    const base = {n, prompt: `Quel est le synonyme de <b>« ${esc(w)} »</b> ?`, explain: `${esc(w)} = <b>${esc(s)}</b>`,
      review: rev(n, `Synonyme de « ${w} »`, s), redo: () => G.syn(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: "Le synonyme", lang: "fr", check: v => { const ok = wordOk([s], v); return {ok, fix: ok ? "✓" : `→ ${s}`}; }}]});
    return Object.assign(base, {opts: shuffle([{t: s, ok: true}, ...sample(all.filter(x => x !== s), 3).map(t => ({t, ok: false}))])});
  },
  lieu(n){
    if (n !== "voc") return null;
    const [w, house] = pick(LIEU);
    return {n, prompt: `<b>${esc(cap(w))}</b>, c'est…`, opts: [{t: "Une pièce de la maison", ok: house}, {t: "Un élément du jardin", ok: !house}],
      explain: house ? "Une pièce de la maison (comme la véranda, la mansarde, le grenier, le corridor)." : "Un élément du jardin (comme le bosquet, la corbeille, le parterre, l'allée).",
      review: rev(n, w, house ? "une pièce de la maison" : "un élément du jardin"), redo: () => G.lieu(n)};
  },
  mat(n){
    if (n !== "voc") return null;
    const [o, m] = pick(MAT);
    return {n, prompt: `Dans l'exercice de vocabulaire, en quelle matière était <b>${esc(o)}</b> ?`,
      opts: shuffle([{t: m, ok: true}, ...sample(MAT.filter(x => x[1] !== m), 3).map(x => ({t: x[1], ok: false}))]),
      explain: `${esc(cap(o))} <b>${esc(m)}</b>.`, review: rev(n, `${o} : quelle matière ?`, m), redo: () => G.mat(n)};
  },
  materiau(n){
    if (n !== "voc") return null;
    const cat = pick(Object.keys(MATS)), w = pick(MATS[cat]);
    return {n, prompt: `<b>« ${esc(w)} »</b> désigne…`, opts: Object.keys(MATS).map(c => ({t: c === "métal" ? "un métal" : c === "tissu" ? "un tissu" : c === "bois" ? "un bois" : "une pierre", ok: c === cat})),
      explain: `${esc(cap(w))} : ${cat === "métal" ? "un métal" : cat === "tissu" ? "un tissu" : cat === "bois" ? "un bois" : "une pierre"}.`, review: rev(n, `« ${w} » : tissu, métal, bois ou pierre ?`, cat), redo: () => G.materiau(n)};
  },
  vaiss(n, typed){
    if (n !== "voc") return null;
    const [f, o, ok] = pick(VAISS);
    const base = {n, prompt: `Quel élément de vaisselle sert pour <b>${esc(f)}</b> ?`, explain: `Pour ${esc(f)} : <b>${esc(o)}</b>.`,
      review: rev(n, `Vaisselle pour ${f}`, o), redo: () => G.vaiss(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: "Le nom", lang: "fr", check: v => { const r = spellCheck(o.replace(/^une? /, ""))(v); return r.ok ? r : (wordOk(ok, v) ? {ok: true, fix: `✓ ${o}`} : r); }}]});
    return Object.assign(base, {opts: shuffle([{t: o, ok: true}, ...sample(VAISS.filter(x => x[1] !== o), 3).map(x => ({t: x[1], ok: false}))])});
  },
  def(n, typed){
    if (n !== "voc") return null;
    const [d, w, ok] = pick(DEFS);
    const base = {n, prompt: `Quel est le mot ?<br><b>${esc(d)}</b>`, explain: `C'est <b>${esc(w)}</b>.`, review: rev(n, d, w), redo: () => G.def(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: "Le mot", lang: "fr", check: v => { const r = wordOk(ok, v); return {ok: r, fix: r ? "✓" : `→ ${w}`}; }}]});
    return Object.assign(base, {opts: shuffle([{t: w, ok: true}, ...sample(DEFS.filter(x => x[1] !== w), 3).map(x => ({t: x[1], ok: false}))])});
  },
  adv(n, typed){
    if (n !== "voc") return null;
    const [a, d] = pick(ADV);
    const base = {n, prompt: `Forme l'adverbe en -ment à partir de <b>« ${esc(a)} »</b>.`, explain: `${esc(a)} → <b>${esc(d)}</b>`,
      review: rev(n, `Adverbe de « ${a} »`, d), redo: () => G.adv(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: "L'adverbe", lang: "fr", check: spellCheck(d)}]});
    const cands = [a + "ment", a.replace(/(ent|ant)$/, "$1ment"), a.replace(/ent$/, "amment"), a.replace(/ant$/, "emment"), a.replace(/x$/, "sement"), a.replace(/(.)$/, "$1ement"), a + "ement", a.replace(/e?$/, "amment"), a.replace(/e?$/, "emment")];
    const traps = [...new Set(cands)].filter(x => x !== d && x !== a);
    return Object.assign(base, {opts: shuffle([{t: d, ok: true}, ...traps.slice(0, 3).map(t => ({t, ok: false}))])});
  },
  oeuvre(n){
    const pool = OEUVRES.filter(o => n === "rea" || o.n === n);
    if (!pool.length) return null;
    const o = pick(pool), kind = pick(["auteur", "theme", "perso"]);
    if (kind === "auteur") return {n, prompt: `Qui a écrit <i>${esc(o.t)}</i> ?`, opts: shuffle(OEUVRES.map(x => ({t: x.a, ok: x === o}))),
      explain: `<i>${esc(o.t)}</i> est de <b>${esc(o.a)}</b>.`, review: rev(n, `Auteur de « ${o.t} »`, o.a), redo: () => G.oeuvre(n)};
    if (kind === "theme") return {n, prompt: `Quel thème avons-nous étudié dans l'extrait de <i>${esc(o.t)}</i> ?`, wide: true,
      opts: shuffle(OEUVRES.map(x => ({t: cap(x.theme), ok: x === o}))), explain: `<i>${esc(o.t)}</i> (${esc(o.a)}) : <b>${esc(o.theme)}</b>.`,
      review: rev(n, `Thème de « ${o.t} »`, o.theme), redo: () => G.oeuvre(n)};
    const p = pick(o.persos);
    return {n, prompt: `Dans quel roman apparaît <b>${esc(p)}</b> ?`, opts: shuffle(OEUVRES.map(x => ({t: x.t, ok: x === o}))),
      explain: `${esc(cap(p))} : <i>${esc(o.t)}</i>, de ${esc(o.a)}.`, review: rev(n, `Roman où apparaît ${p}`, o.t), redo: () => G.oeuvre(n)};
  }
};
const KQ = {
  cls: ["classe", "classe", "detpro", "detpro", "liste", "contracte", "cours", "vf"],
  fon: ["fonction", "fonction", "fonction", "voix", "cours", "vf"],
  tps: ["temps", "temps", "emploi", "conj", "conj", "cours", "vf"],
  acc: ["accord", "accord", "genre", "fem", "plur", "plur", "cours", "vf"],
  voc: ["syn", "lieu", "mat", "materiau", "vaiss", "def", "adv", "cours", "vf"],
  rea: ["oeuvre", "oeuvre", "cours", "vf"],
  amb: ["cours", "cours", "oeuvre", "vf"],
  trv: ["cours", "cours", "oeuvre", "vf"]
};
const KC = {   // au contrôle : surtout des réponses à écrire
  cls: ["classe", "detpro", "contracte"], fon: ["fonction", "fonction", "voix"], tps: ["conj", "conj", "temps", "emploi"],
  acc: ["fem", "plur", "plur", "accord", "genre"], voc: ["vaiss", "def", "adv", "syn"],
  rea: ["oeuvre", "cours"], amb: ["cours", "oeuvre"], trv: ["cours", "cours"]
};
function make(kinds, n, typed){
  for (const k of shuffle(kinds)) { const e = G[k](n, typed); if (e) return e; }
  return G.cours(n) || G.vf(n);
}

/* ---------- rédaction ---------- */
const REDAC = [
  {id: "rastignac", unit: "amb", titre: "Rastignac et le désir de réussite",
   doc: `<p><b>Le Père Goriot</b>, Balzac (résumé de l'extrait étudié). Rastignac, jeune provincial de bonne famille mais sans fortune, se rend chez une comtesse pour entrer dans la haute société parisienne. Il prend un soin extrême de sa toilette, pense à ce qu'il va dire, et marche « avec mille précautions pour ne point se crotter ». Mais il arrive à pied, et non en voiture : les domestiques le regardent avec mépris. Il perd ses moyens et se sent stupide. Pourtant, il porte bien l'habit, se comporte en séducteur et décide de continuer malgré le mépris.</p>`,
   consigne: `<p>Montre en un paragraphe comment Rastignac <b>incarne le désir de réussite sociale</b>. Appuie-toi sur le document et emploie le vocabulaire du cours.</p>`,
   modele: "Rastignac est un jeune provincial de bonne famille, mais sans fortune. Il se rend chez la comtesse pour s'introduire dans le monde de l'aristocratie : pour lui, c'est son avenir qui est en jeu. C'est pourquoi il prend un soin extrême de sa toilette et marche « avec mille précautions pour ne point se crotter ». Il est à la fois prudent, surexcité et rempli d'espoir. Pourtant, comme il arrive à pied et non en voiture, on le regarde avec mépris et il se sent inférieur. Mais il est tenace : il décide de continuer et se comporte en séducteur. Rastignac incarne donc le jeune provincial ambitieux du roman réaliste, animé par le désir de réussite dans le monde de l'aristocratie.",
   criteres: [
     {t: "Présente Rastignac : jeune provincial de bonne famille mais sans fortune", pts: 1},
     {t: "Dit qu'il veut entrer dans le monde de l'aristocratie (son avenir est en jeu)", pts: 1},
     {t: "Cite sa préparation soignée (toilette, mille précautions) comme preuve de son ambition", pts: 1},
     {t: "Explique l'humiliation (arrivé à pied, regards méprisants) et sa ténacité malgré tout", pts: 1},
     {t: "S'appuie sur le document (citation ou exemple précis)", pts: 1}]},
  {id: "mineurs", unit: "trv", titre: "Germinal : le travail à la mine",
   doc: `<p><b>Germinal</b>, Émile Zola (ce que l'on a relevé dans l'extrait). La veine de charbon est une véritable fournaise, dans les profondeurs de la terre. L'air est irrespirable, l'eau suinte et enveloppe les mineurs d'humidité. Maheu risque d'étouffer ou d'être aveuglé par la poussière de charbon qui tombe près de son visage ; il est « pris entre deux feuillets d'un livre ». Les coups de rivelaine sont voilés et lointains ; dans l'obscurité, on n'aperçoit que des « formes spectrales », une rondeur de hanche, un bras noueux, une tête violente.</p>`,
   consigne: `<p>Explique comment Zola met en scène <b>la pénibilité du travail des mineurs</b>, puis pourquoi la scène paraît <b>presque fantastique</b>. Termine en disant ce que <b>dénonce</b> l'auteur.</p>`,
   modele: "Dans cet extrait de Germinal, Zola montre que le travail à la mine est très pénible. La veine est une fournaise au fond de la terre : l'air est irrespirable, l'eau suinte et les mineurs sont trempés d'humidité. Maheu risque d'étouffer ou d'être aveuglé par la poussière de charbon. La comparaison « pris entre deux feuillets d'un livre » souligne l'extrême vulnérabilité des mineurs, écrasés par la roche. La scène paraît presque fantastique : les bruits sont voilés et lointains, et dans les ténèbres on ne voit que des formes spectrales et des morceaux de corps. Zola compare ainsi les mineurs à des spectres qui s'agitent dans les ténèbres. Par cette description, Émile Zola dénonce la pénibilité du travail ouvrier et lance un appel à la pitié et à la prise de conscience de tous.",
   criteres: [
     {t: "Décrit les conditions de travail (chaleur de fournaise, air irrespirable, humidité, poussière)", pts: 1},
     {t: "Explique la comparaison « pris entre deux feuillets d'un livre » (vulnérabilité des mineurs)", pts: 1},
     {t: "Dit que les mineurs sont comparés à des spectres dans les ténèbres : aspect irréel, quasi fantastique", pts: 1},
     {t: "Conclut que Zola dénonce la pénibilité du travail ouvrier (appel à la pitié, prise de conscience)", pts: 1},
     {t: "S'appuie sur le document (relevés précis)", pts: 1}]},
  {id: "atelier", unit: "trv", titre: "Horace : des femmes émancipées ?",
   doc: `<p><b>Horace</b>, George Sand. À Paris, vers 1830, la vie est difficile pour les jeunes femmes : tout est plus cher qu'en province (« si l'on gagnait le double […] on dépensait le triple »), et elles courent de nombreux dangers si elles sortent seules le soir. Eugénie, Marthe, Louison et Suzanne décident de créer ensemble un atelier de couture. Eugénie fait les affaires, essaie les robes et dirige les travaux ; Marthe a beaucoup de goût et d'invention ; Louison coud vite, « avec une solidité cyclopéenne », et est habituée à commander. Selon Eugénie, des associées sont plus impliquées que des ouvrières, car elles sont associées aux bénéfices.</p>`,
   consigne: `<p>Les jeunes femmes d'Horace sont-elles <b>émancipées</b> ? Réponds en un paragraphe argumenté qui s'appuie sur le document.</p>`,
   modele: "Oui, les jeunes femmes d'Horace sont émancipées. À Paris, la vie est difficile pour elles : tout coûte beaucoup plus cher qu'en province et elles courent des dangers si elles sortent seules le soir. Pour s'en sortir, elles décident de créer ensemble un atelier de couture et de travailler en association. Chacune y apporte ses qualités : Eugénie dirige les travaux, Marthe a du goût et de l'invention, Louison coud vite et sait commander. Comme elles sont associées aux bénéfices, elles sont plus impliquées que de simples ouvrières. Créer un atelier et travailler en association est une initiative totalement innovante pour l'époque : à partir des années 1830, le travail en association naît en même temps que l'émancipation des femmes.",
   criteres: [
     {t: "Explique pourquoi la vie est difficile pour elles à Paris (tout est cher, dangers le soir)", pts: 1},
     {t: "Dit qu'elles créent un atelier de couture en association", pts: 1},
     {t: "Donne les avantages de l'association (gagner plus, qualités de chacune, associées aux bénéfices)", pts: 1},
     {t: "Conclut que c'est une initiative innovante qui montre leur émancipation (années 1830)", pts: 1},
     {t: "S'appuie sur le document (un exemple ou une citation)", pts: 1}]},
  {id: "recit-bal", unit: "tps", titre: "À toi de raconter : l'arrivée au bal",
   consigne: `<p>Raconte en <b>6 à 8 phrases</b>, au passé, l'arrivée d'un jeune provincial (ou d'une jeune provinciale) à un bal du XIXe siècle. Ton récit doit contenir : <b>l'imparfait</b> pour décrire la salle et les invités, <b>le passé simple</b> pour au moins trois actions qui s'enchaînent, <b>un plus-que-parfait</b> pour une action qui s'est passée avant, et <b>un conditionnel</b> pour ce que le personnage imagine qu'il fera.</p>`,
   modele: "Le château brillait de mille bougies et les invités dansaient au son de l'orchestre. Les dames portaient de longues robes de soie et les messieurs souriaient avec assurance. Lucien avait marché pendant deux heures pour venir jusqu'ici, et ses chaussures étaient couvertes de boue. Il entra dans la salle, salua le marquis et s'approcha timidement des danseurs. Une jeune femme le regarda avec mépris. Pourtant, il se dit qu'un jour il serait reçu partout et que tous ces aristocrates l'admireraient.",
   criteres: [
     {t: "Emploie l'imparfait pour décrire le lieu ou les personnages", pts: 1},
     {t: "Emploie le passé simple pour au moins trois actions successives de premier plan", pts: 1},
     {t: "Emploie correctement un plus-que-parfait pour une action antérieure", pts: 1},
     {t: "Emploie un conditionnel pour une action à venir par rapport au passé", pts: 1},
     {t: "Conjugaisons et accords dans les groupes nominaux corrects", pts: 1}]}
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
const conjCard = v => card("tps", `Conjugue « ${esc(v.inf)} » au passé simple.`, v.f.map((_, k) => esc(conjForm(v, k))).join("<br>"), "Passé simple");

Revision.start({
  key: "leandre-francais-vivre-au-xixe-v1",
  title: "Vivre au XIXe siècle",
  subtitle: "Un monde qui change",
  eyebrow: "Français · Séquence 1",
  hand: "Balzac, Sand, Zola, Flaubert… et la grammaire !",
  groups: {
    "1": {name: "Langue", cls: "l1", filter: "Grammaire"},
    "2": {name: "Orthographe et vocabulaire", cls: "l2", filter: "Ortho et vocabulaire"},
    "3": {name: "Lectures", cls: "l3", filter: "Les romans"}
  },
  redaction: {items: REDAC, text: "4 sujets comme à l'évaluation : trois questions sur les textes et un petit récit au passé. Tu rédiges (ou tu prends ta copie en photo), puis tu es corrigé critère par critère."},
  units: UNITS,
  allLabel: () => "Toute la séquence",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["la leçon", "Les phrases des bilans à savoir par cœur, puis le reste du cours, à réviser chaque jour."],
    quiz: ["10 questions", "Les bilans, la classe et la fonction des mots, les temps, les accords, les romans."],
    control: ["noté sur 20", "Tu écris toi-même : mots des bilans, passé simple, féminins, pluriels, vocabulaire."]
  },
  cards: pool => {
    const ids = pool.map(u => u.id);
    const out = PAR_COEUR.filter(p => ids.includes(p.n)).map(p => card(p.n, esc(p.q), esc(p.text), `À savoir par cœur · ${p.source}`));
    out.push(...COURS.filter(c => ids.includes(c.n)).map(c => card(c.n, esc(c.card), nl(c.a))));
    if (ids.includes("tps")) out.push(...VERBS.filter(v => !["chanter", "recevoir", "retenir"].includes(v.inf)).map(conjCard));
    if (ids.includes("voc")) {
      out.push(card("voc", "Retrouve les synonymes : bahut, secrétaire, lustre, bergère, guéridon, sofa.", SYN.map(([a, b]) => `${esc(a)} = ${esc(b)}`).join("<br>")));
      out.push(card("voc", "Quel élément de vaisselle pour la soupe, la salade, le thé, le café, le chocolat, le sucre, le pain ?", VAISS.map(([f, o]) => `${esc(f)} → ${esc(o)}`).join("<br>")));
      out.push(card("voc", "Alcôve, mansarde, poutre, niche : que désigne chaque mot ?", DEFS.slice(5).map(([d, w]) => `<b>${esc(w)}</b> : ${esc(d.toLowerCase())}`).join("<br>")));
      out.push(card("voc", "Classe ces matières : velours, zinc, teck, marbre, satin, bronze, ébène, jade.", "Tissu : velours, satin<br>Métal : zinc, bronze<br>Bois : teck, ébène<br>Pierre : marbre, jade"));
    }
    return out;
  },
  quiz: {count: 10, make: (pool, R, i) => {
    const n = R.weighted(pool).id, f = i % 5 < 2 ? G.parcoeur(n) : null;   // environ 4 questions sur 10 sur le « par cœur »
    return asQuiz(f || make(KQ[n], n, false));
  }},
  control: {
    lead: "14 questions : des phrases des bilans à compléter, le passé simple, des féminins et des pluriels à écrire, la classe et la fonction des mots. Chaque question compte autant.",
    note: "Pour les mots des bilans, les accents, les majuscules et les articles ne comptent pas. Pour l'orthographe (passé simple, féminin, pluriel, adverbes), la forme doit être exacte ; un accent oublié est signalé mais accepté.",
    size: () => 14,
    build: (pool, R) => {
      const ids = pool.map(u => u.id), withPc = ids.filter(n => PBY(n).length), items = [];
      const add = e => { if (e && !items.some(x => strip(x.review) === strip(e.review))) { items.push(e); return true; } return false; };
      for (let s = 0; s < 3 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.trous(pick(withPc))); t++);   // 3 textes à trous
      for (let s = 0; s < 2 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.parcoeur(pick(withPc))); t++);
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
