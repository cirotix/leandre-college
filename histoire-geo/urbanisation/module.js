/* Module : histoire-géo · l'urbanisation du monde.
   Sources : cahier de Léandre (séance 3, activités 1 et 2, bilan « Les paysages de l'urbanisation dans le monde »,
   entraînement pour l'évaluation du 12/10/26), bilan « Londres, centre et périphéries », planche de photos.
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";
const {esc, shuffle, pick, fold} = Revision;

/* ---------- notions ---------- */
const UNITS = [
  {id: "urb",  group: "1", name: "L'urbanisation",          sub: "Définition, chiffres, débuts au XIXe siècle"},
  {id: "cro",  group: "1", name: "La croissance urbaine",   sub: "Selon les régions, exode rural, accroissement naturel"},
  {id: "cen",  group: "2", name: "Les centres",             sub: "Verticalité, CBD, centres historiques et touristiques"},
  {id: "per",  group: "2", name: "Les périphéries",         sub: "Étalement, banlieues, autoroutes, contrastes sociaux"},
  {id: "sha",  group: "3", name: "Shanghai",                sub: "Pudong, gentrification, Songjiang, exode rural"},
  {id: "lon",  group: "3", name: "Londres",                 sub: "Centre, périphéries, transports, inégalités"}
].map(u => Object.assign(u, {tag: u.name}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- questions de cours : carte (recto/verso) + QCM (bonne réponse en premier) ---------- */
const COURS = [
  {id: "u-def", n: "urb", card: "L'urbanisation, c'est quoi ?", q: "L'urbanisation, c'est…",
   a: "Le fait que les villes grandissent et se développent, parce que de plus en plus d'habitants viennent y vivre.\nLa part de la population qui vit en ville augmente.",
   o: ["la croissance des villes et de la part de la population qui y vit", "le départ des habitants des villes vers la campagne", "la construction de routes entre les villes", "la baisse du nombre d'habitants dans le monde"]},
  {id: "u-55", n: "urb", card: "Aujourd'hui, quelle part de la population mondiale vit en ville ?", q: "Aujourd'hui, quelle part de la population mondiale vit en ville ?",
   a: "Environ 55 %, un peu plus de la moitié.", o: ["Environ 55 %", "Environ 25 %", "Environ 85 %", "Environ 10 %"],
   tip: "Plus d'un humain sur deux est un citadin."},
  {id: "u-2050", n: "urb", card: "En 2050, quelle part de la population mondiale sera urbaine ?", q: "En 2050, quelle part de la population mondiale sera urbaine ?",
   a: "Près de 70 %.", o: ["Près de 70 %", "Près de 55 %", "Près de 40 %", "Près de 100 %"],
   tip: "55 % aujourd'hui, 70 % en 2050 : ça continue d'augmenter."},
  {id: "u-debut", n: "urb", card: "Où et quand la croissance urbaine a-t-elle commencé ?", q: "La croissance urbaine a commencé…",
   a: "En Europe et en Amérique du Nord, au XIXe siècle.\nElle s'est ensuite étendue aux autres continents.",
   o: ["en Europe et en Amérique du Nord, au XIXe siècle", "en Afrique, au XXIe siècle", "en Asie, au Moyen Âge", "en Australie, au XXe siècle"]},
  {id: "u-metro", n: "urb", card: "Où se trouvent les grandes métropoles mondiales ?", q: "Aujourd'hui, les grandes métropoles mondiales sont surtout…",
   a: "En Asie du Sud et de l'Est (Tokyo, Shanghai, Mumbai).\nVers 2050, elles seront de plus en plus en Afrique.",
   o: ["en Asie du Sud et de l'Est", "en Europe de l'Ouest", "en Amérique du Sud", "en Océanie"],
   tip: "Exemples à citer : Tokyo, Shanghai, Mumbai."},

  {id: "c-fort", n: "cro", card: "Quelles régions du monde sont déjà très urbanisées ?", q: "Quelles régions sont déjà très urbanisées ?",
   a: "L'Amérique, l'Europe, le Moyen-Orient, l'Australie et le Japon.",
   o: ["L'Amérique, l'Europe, le Moyen-Orient, l'Australie et le Japon", "L'Afrique et l'Asie du Sud", "L'Afrique centrale et l'Inde", "Le Nigeria et le Bangladesh"]},
  {id: "c-faible", n: "cro", card: "Quelles régions sont encore peu urbanisées ?", q: "Quelles régions sont encore les moins urbanisées ?",
   a: "L'Afrique et l'Asie du Sud : moins de 60 % de leurs habitants vivent en ville.",
   o: ["L'Afrique et l'Asie du Sud", "L'Europe et l'Amérique du Nord", "Le Japon et l'Australie", "Le Moyen-Orient"]},
  {id: "c-asie", n: "cro", card: "Comment a évolué la population urbaine en Asie de 1970 à 2020 ?", q: "En Asie, la part de population urbaine est passée de 1970 à 2020…",
   a: "D'environ 25 % à 50 % : elle a doublé.",
   o: ["d'environ 25 % à 50 %", "d'environ 75 % à 85 %", "d'environ 50 % à 25 %", "d'environ 10 % à 90 %"]},
  {id: "c-amn", n: "cro", card: "Et en Amérique du Nord, de 1970 à 2020 ?", q: "En Amérique du Nord, la part de population urbaine est passée de 1970 à 2020…",
   a: "De 75 % à 85 % : elle était déjà très urbaine, elle augmente lentement.",
   o: ["de 75 % à 85 %", "de 25 % à 50 %", "de 85 % à 75 %", "de 40 % à 95 %"]},
  {id: "c-eur", n: "cro", card: "L'évolution urbaine de l'Europe ressemble à quel modèle ?", q: "L'évolution de la population urbaine en Europe ressemble surtout…",
   a: "Au modèle américain : l'Europe est déjà urbaine à plus de 80 %.",
   o: ["au modèle américain", "au modèle africain", "au modèle de l'Asie du Sud", "à aucun autre continent"]},
  {id: "c-afr", n: "cro", card: "Quelle région connaît la plus forte croissance urbaine ?", q: "La région qui connaît la plus forte croissance annuelle de sa population urbaine est…",
   a: "L'Afrique (par exemple le Nigeria).", o: ["l'Afrique", "l'Europe", "l'Amérique du Nord", "le Japon"],
   tip: "Exemple à citer : le Nigeria."},
  {id: "c-pourquoi", n: "cro", card: "Pourquoi les villes d'Afrique grandissent-elles si vite ?", q: "En Afrique, la croissance urbaine est forte à cause…",
   a: "De l'accroissement naturel (naissances − décès)\net de l'exode rural (départ des habitants des campagnes vers les villes).",
   o: ["de l'accroissement naturel et de l'exode rural", "du tourisme et des gratte-ciel", "du départ des citadins vers la campagne", "de la baisse des naissances"]},
  {id: "c-exode", n: "cro", card: "L'exode rural, c'est quoi ?", q: "L'exode rural, c'est…",
   a: "Le départ des habitants des espaces ruraux (campagnes) vers les espaces urbains (villes).",
   o: ["le départ des habitants des campagnes vers les villes", "le départ des habitants des villes vers les campagnes", "la construction de villes nouvelles", "l'arrivée de touristes à la campagne"]},
  {id: "c-accr", n: "cro", card: "L'accroissement naturel, c'est quoi ?", q: "L'accroissement naturel, c'est…",
   a: "La différence entre les naissances et les décès.",
   o: ["la différence entre les naissances et les décès", "l'arrivée d'habitants venus d'autres pays", "l'agrandissement des parcs en ville", "le nombre d'habitants par km²"]},

  {id: "ce-def", n: "cen", card: "Le centre-ville, c'est quoi ?", q: "Le centre-ville d'une métropole est un espace…",
   a: "Le cœur de la métropole : un espace très dense, animé et souvent vertical.",
   o: ["très dense, animé et souvent vertical", "peu dense, horizontal et calme", "fait de maisons avec jardin", "agricole"]},
  {id: "ce-cbd", n: "cen", card: "Un CBD, c'est quoi ?", q: "Un CBD, c'est…",
   a: "Un quartier d'affaires (Central Business District).\nOn le reconnaît à ses immenses gratte-ciel en verre. Il concentre les commerces, les banques et les sièges des grandes entreprises.",
   o: ["un quartier d'affaires", "un bidonville", "une banlieue résidentielle", "une ville nouvelle"],
   tip: "Exemples : Times Square à New York, l'avenue Paulista à São Paulo, la City à Londres."},
  {id: "ce-hist", n: "cen", card: "Les centres historiques et touristiques", q: "Les centres historiques et touristiques sont…",
   a: "Des espaces de pouvoir et de culture, avec des monuments célèbres et de grandes avenues.\nEx. : les Champs-Élysées à Paris.",
   o: ["des espaces de pouvoir et de culture, avec des monuments", "des zones industrielles", "des banlieues avec des maisons", "des quartiers très pauvres"]},
  {id: "ce-tab", n: "cen", card: "Les centres : forme, densité, fonction", q: "Dans les centres, le paysage est…",
   a: "Forme : vertical (gratte-ciel, tours).\nDensité : très forte (beaucoup de monde et de bâtiments).\nFonction : commandement (affaires, banques, commerces, tourisme).",
   o: ["vertical, très dense, avec une fonction de commandement", "horizontal, peu dense, résidentiel", "vertical mais presque vide", "agricole et peu peuplé"]},

  {id: "pe-def", n: "per", card: "La périphérie, c'est quoi ?", q: "La périphérie d'une ville est…",
   a: "L'espace tout autour du centre : plus bas (horizontal) et marqué par l'étalement urbain.",
   o: ["l'espace autour du centre, horizontal et étalé", "le cœur de la ville, avec des gratte-ciel", "un quartier d'affaires", "la campagne loin de toute ville"]},
  {id: "pe-etal", n: "per", card: "L'étalement urbain, c'est quoi ?", q: "L'étalement urbain, c'est…",
   a: "La ville grandit en prenant de la place sur la campagne.",
   o: ["la ville qui grandit en prenant de la place sur la campagne", "la construction de tours dans le centre", "le départ des habitants vers la campagne", "la rénovation des vieux quartiers"],
   tip: "Avec la mondialisation, les villes connaissent un étalement urbain."},
  {id: "pe-banl", n: "per", card: "Les banlieues résidentielles", q: "Les banlieues résidentielles sont souvent…",
   a: "Des alignements de maisons individuelles avec jardin (ex. : Melbourne en Australie, Hendon à Londres),\nou traversées par de grandes autoroutes (ex. : Los Angeles).",
   o: ["des alignements de maisons individuelles avec jardin", "des immenses gratte-ciel en verre", "des monuments célèbres", "des champs cultivés"]},
  {id: "pe-contr", n: "per", card: "Les contrastes sociaux dans les périphéries", q: "Dans les pays pauvres ou en développement, la périphérie montre…",
   a: "De fortes inégalités : de riches gratte-ciel juste à côté de bidonvilles très pauvres.\nEx. : Mumbai en Inde.",
   o: ["de riches gratte-ciel à côté de bidonvilles très pauvres", "uniquement des maisons avec jardin", "des quartiers tous aussi riches", "aucune habitation"]},
  {id: "pe-tab", n: "per", card: "Les périphéries : forme, densité, fonction", q: "Dans les périphéries, le paysage est…",
   a: "Forme : horizontal (maisons, autoroutes, étalement).\nDensité : moins forte (plus d'espaces ouverts).\nFonction : résidence (logements) et transport.",
   o: ["horizontal, moins dense, avec des logements et des transports", "vertical, très dense, avec des banques", "fait seulement de monuments", "plus dense que le centre"]},

  {id: "sh-pudong", n: "sha", card: "À Shanghai, qu'a-t-on construit à Pudong ?", q: "À Pudong (Shanghai), on a réalisé…",
   a: "De gigantesques travaux : des ponts, des tours, et la rénovation des quais.",
   o: ["de gigantesques travaux : ponts, tours, quais rénovés", "des champs de riz", "des bidonvilles", "un vieux centre historique protégé"]},
  {id: "sh-gentri", n: "sha", card: "La gentrification, c'est quoi ?", q: "La gentrification, c'est…",
   a: "L'arrivée de familles aisées dans un quartier plus pauvre.\nLe quartier se transforme et attire d'autres familles aisées.",
   o: ["l'arrivée de familles aisées dans un quartier plus pauvre", "le départ des habitants des campagnes vers les villes", "la construction de routes", "l'arrivée de touristes dans un musée"],
   tip: "À Shanghai, la rue Madang en est l'exemple : elle imite le style anglais pour attirer les expatriés et les Chinois très aisés."},
  {id: "sh-madang", n: "sha", card: "Où voit-on le plus la gentrification à Shanghai ?", q: "À Shanghai, la gentrification se voit surtout…",
   a: "Rue Madang : elle imite le style anglais pour attirer les expatriés ou les Chinois très aisés.",
   o: ["rue Madang", "à Songjiang", "dans les campagnes", "dans les usines"]},
  {id: "sh-amen", n: "sha", card: "Quels aménagements a-t-on faits à Shanghai ?", q: "À Shanghai, on a aménagé…",
   a: "Des zones industrielles et de haute technologie, de vastes secteurs résidentiels et des universités.",
   o: ["des zones industrielles et de haute technologie, des quartiers résidentiels, des universités", "uniquement des champs", "uniquement des monuments anciens", "des bidonvilles"]},
  {id: "sh-pop", n: "sha", card: "D'où viennent les habitants des nouveaux quartiers de Shanghai ?", q: "Les nouveaux quartiers de Shanghai accueillent…",
   a: "Les populations des vieux quartiers du centre-ville et des campagnes (exode rural).",
   o: ["les habitants des vieux quartiers du centre et des campagnes", "uniquement des touristes", "des habitants venus d'Europe", "personne"]},
  {id: "sh-song", n: "sha", card: "Songjiang, c'est quoi ?", q: "Songjiang est…",
   a: "Une ville nouvelle près de Shanghai, avec un grand nombre de tours et de barres pour accueillir des centaines de milliers d'habitants.",
   o: ["une ville nouvelle avec des tours et des barres", "un quartier d'affaires de Londres", "une banlieue de Melbourne", "un bidonville de Mumbai"]},

  {id: "lo-hab", n: "lon", card: "Londres en chiffres", q: "Combien d'habitants compte Londres avec sa banlieue ?",
   a: "Environ 10 millions d'habitants avec sa banlieue.\nDensité : environ 5 000 hab./km² pour le Grand Londres, plus de 11 000 hab./km² dans le centre (la City).",
   o: ["Environ 10 millions", "Environ 1 million", "Environ 50 millions", "Environ 100 000"]},
  {id: "lo-pouvoir", n: "lon", card: "Londres : où est le pouvoir politique ?", q: "À Londres, le pouvoir politique est concentré…",
   a: "À Westminster (le Parlement) et à Buckingham Palace (la résidence royale).",
   o: ["à Westminster et Buckingham Palace", "à Canary Wharf", "à Hendon", "à Stratford"]},
  {id: "lo-city", n: "lon", card: "Londres : la City", q: "À Londres, la City est…",
   a: "Un cœur financier (un CBD), avec de hauts gratte-ciel.\nPiccadilly Circus, lui, a surtout une fonction touristique.",
   o: ["un cœur financier (CBD) avec des gratte-ciel", "une banlieue résidentielle", "la résidence royale", "une zone industrielle"]},
  {id: "lo-transf", n: "lon", card: "Comment le centre de Londres se transforme-t-il ?", q: "Aujourd'hui, le centre de Londres se transforme par…",
   a: "La verticalisation (construction de nouvelles tours) et de grands projets de rénovation : les anciens docks réhabilités, le nouveau quartier d'affaires de Canary Wharf.",
   o: ["la verticalisation et la rénovation des anciens docks", "la destruction des gratte-ciel", "la plantation de champs", "le départ de tous ses habitants"]},
  {id: "lo-cosmo", n: "lon", card: "Londres, une ville cosmopolite", q: "Dans le centre de Londres, la part des habitants nés à l'étranger est…",
   a: "Plus de 30 % des habitants sont nés à l'étranger.\nCertains quartiers sont structurés autour d'une communauté, comme Peckham avec une importante communauté nigériane.",
   o: ["plus de 30 %", "moins de 1 %", "100 %", "environ 5 %"]},
  {id: "lo-peri", n: "lon", card: "Les périphéries de Londres", q: "Les périphéries de Londres s'étendent jusqu'à…",
   a: "Jusqu'à 50 km du centre.\nOn y trouve des banlieues résidentielles denses (Hendon) ou rénovées (Stratford), des zones commerciales et industrielles.",
   o: ["50 km", "5 km", "500 km", "1 km"]},
  {id: "lo-transp", n: "lon", card: "Comment le centre et les périphéries de Londres sont-ils reliés ?", q: "Le centre et les périphéries de Londres sont reliés par…",
   a: "Un réseau de transport très performant : métro, trains de banlieue, autoroutes.",
   o: ["le métro, les trains de banlieue et les autoroutes", "uniquement des pistes cyclables", "des bateaux seulement", "rien : ils ne sont pas reliés"]},
  {id: "lo-inega", n: "lon", card: "Les inégalités à Londres", q: "Quel exemple montre les inégalités à Londres ?",
   a: "Le quartier autour de Big Ben est plus aisé que Peckham.\nHendon est plus favorisé que Stratford.",
   o: ["Le quartier de Big Ben est plus aisé que Peckham", "Tous les quartiers ont le même niveau de vie", "Peckham est le quartier le plus riche", "Stratford est plus favorisé que Hendon"]}
];

/* ---------- exemples à reconnaître ---------- */
const T = {
  CBD: "Un quartier d'affaires (CBD)",
  HIST: "Un centre historique et touristique",
  BANL: "Une banlieue résidentielle",
  AUTO: "L'étalement urbain le long des autoroutes",
  CONTR: "Des contrastes sociaux : gratte-ciel et bidonvilles",
  COSMO: "Un quartier cosmopolite",
  NEW: "Une ville nouvelle",
  GENT: "Un quartier touché par la gentrification",
  RENOV: "Une banlieue rénovée",
  POUV: "Un lieu du pouvoir politique"
};
/* where : "c" centre, "p" périphérie, null = ne pas demander ; not = types à ne pas proposer (ambigus) */
const EX = [
  {name: "Times Square", city: "New York", t: "CBD", where: "c", n: "cen", why: "Times Square concentre commerces, sièges de grandes entreprises et salles de spectacle : c'est le cœur d'une ville mondiale."},
  {name: "L'avenue Paulista", city: "São Paulo", t: "CBD", where: "c", n: "cen", why: "L'avenue Paulista est le cœur économique de São Paulo : un quartier d'affaires avec des gratte-ciel."},
  {name: "La City", city: "Londres", t: "CBD", where: "c", n: "lon", why: "La City est le cœur financier de Londres, avec de hauts gratte-ciel."},
  {name: "Canary Wharf", city: "Londres", t: "CBD", where: "c", n: "lon", not: ["GENT", "RENOV"], why: "Canary Wharf est le nouveau quartier d'affaires construit sur les anciens docks."},
  {name: "Les Champs-Élysées", city: "Paris", t: "HIST", where: "c", n: "cen", not: ["POUV"], why: "Une grande avenue avec des monuments célèbres (l'Arc de Triomphe) : un centre historique et touristique."},
  {name: "Piccadilly Circus", city: "Londres", t: "HIST", where: "c", n: "lon", not: ["CBD"], why: "Piccadilly Circus se distingue par sa fonction touristique."},
  {name: "Westminster", city: "Londres", t: "POUV", where: "c", n: "lon", not: ["HIST"], why: "Westminster, c'est le Parlement : le pouvoir politique."},
  {name: "Buckingham Palace", city: "Londres", t: "POUV", where: "c", n: "lon", not: ["HIST"], why: "Buckingham Palace est la résidence royale : un lieu du pouvoir politique."},
  {name: "Une banlieue de Melbourne", city: "Australie", t: "BANL", where: "p", n: "per", not: ["RENOV"], why: "Des alignements de maisons individuelles avec jardin : une banlieue résidentielle."},
  {name: "Hendon", city: "Londres", t: "BANL", where: "p", n: "lon", not: ["RENOV"], why: "Hendon est une banlieue résidentielle dense de Londres."},
  {name: "Stratford", city: "Londres", t: "RENOV", where: "p", n: "lon", not: ["BANL", "GENT"], why: "Stratford est une banlieue rénovée de Londres."},
  {name: "Los Angeles", city: "États-Unis", t: "AUTO", where: "p", n: "per", not: ["BANL"], why: "À Los Angeles, la ville s'étale le long de grandes autoroutes."},
  {name: "Mumbai", city: "Inde", t: "CONTR", where: "p", n: "per", why: "À Mumbai, de riches gratte-ciel se dressent juste à côté de bidonvilles très pauvres."},
  {name: "Peckham", city: "Londres", t: "COSMO", where: null, n: "lon", not: ["GENT"], why: "Peckham s'est structuré autour d'une importante communauté nigériane."},
  {name: "Songjiang", city: "Shanghai", t: "NEW", where: null, n: "sha", why: "Songjiang est une ville nouvelle, avec des tours et des barres pour des centaines de milliers d'habitants."},
  {name: "La rue Madang", city: "Shanghai", t: "GENT", where: null, n: "sha", not: ["COSMO"], why: "La rue Madang imite le style anglais pour attirer les expatriés et les Chinois très aisés : c'est la gentrification."}
];

/* ---------- vocabulaire : définition → mot ---------- */
const VOC = [
  {def: "Départ des habitants des campagnes vers les villes.", word: "l'exode rural", ok: ["exode rural", "exode"], n: "cro"},
  {def: "Différence entre les naissances et les décès.", word: "l'accroissement naturel", ok: ["accroissement naturel"], n: "cro"},
  {def: "La ville grandit en prenant de la place sur la campagne.", word: "l'étalement urbain", ok: ["etalement urbain", "etalement"], n: "per"},
  {def: "Quartier d'affaires aux immenses gratte-ciel (en trois lettres).", word: "un CBD", ok: ["cbd", "central business district"], n: "cen"},
  {def: "Construction de nouvelles tours dans le centre-ville.", word: "la verticalisation", ok: ["verticalisation"], n: "lon"},
  {def: "Arrivée de familles aisées dans un quartier plus pauvre.", word: "la gentrification", ok: ["gentrification"], n: "sha"},
  {def: "Quartier d'habitations très pauvres, à côté des gratte-ciel à Mumbai.", word: "un bidonville", ok: ["bidonville", "bidonvilles"], n: "per"},
  {def: "Croissance des villes et de la part de la population qui y vit.", word: "l'urbanisation", ok: ["urbanisation"], n: "urb"},
  {def: "Espace tout autour du centre d'une ville.", word: "la périphérie", ok: ["peripherie", "peripheries", "banlieue", "banlieues"], n: "per"},
  {def: "Ville construite d'un coup pour accueillir beaucoup d'habitants (ex. : Songjiang).", word: "une ville nouvelle", ok: ["ville nouvelle"], n: "sha"},
  {def: "Présence d'habitants venus du monde entier (plus de 30 % nés à l'étranger à Londres).", word: "le cosmopolitisme", ok: ["cosmopolitisme", "cosmopolite"], n: "lon"},
  {def: "Très grande ville qui concentre beaucoup d'habitants et d'activités (ex. : Londres, Tokyo).", word: "une métropole", ok: ["metropole", "megapole", "megalopole"], n: "urb"}
];
const norm = s => fold(s).replace(/[^a-z0-9 ]+/g, " ").replace(/\b(l|le|la|les|un|une|des|d|de|du)\b/g, " ").replace(/\s+/g, " ").trim();
/* tolère pluriels et accords (rural / rurale / ruraux) mot à mot */
const stem = s => s.split(" ").map(w => w.replace(/(aux|es|e|s|x)$/, "")).join(" ");
const vocOk = (v, ans) => { const a = norm(ans); return !!a && v.ok.some(k => a === k || stem(a) === stem(k)); };

/* ---------- chiffres ---------- */
const NUM = [
  {q: "Aujourd'hui, environ quel pourcentage de la population mondiale vit en ville ?", ans: 55, tol: 3, unit: "%", n: "urb", traps: [25, 70, 85], why: "Environ 55 % : un peu plus de la moitié de l'humanité."},
  {q: "En 2050, près de quel pourcentage de la population mondiale sera urbaine ?", ans: 70, tol: 3, unit: "%", n: "urb", traps: [55, 50, 90], why: "Près de 70 % en 2050."},
  {q: "Au cours de quel siècle la croissance urbaine a-t-elle commencé en Europe et en Amérique du Nord ? (écris le numéro : 19 pour XIXe)", ans: 19, tol: 0, unit: "e siècle", n: "urb", traps: [21, 15, 10], why: "Au XIXe siècle, c'est-à-dire le 19e siècle."},
  {q: "En Asie, quelle était la part de population urbaine en 1970 ?", ans: 25, tol: 3, unit: "%", n: "cro", traps: [50, 75, 85], why: "Environ 25 % en 1970, puis 50 % en 2020."},
  {q: "En Asie, quelle était la part de population urbaine en 2020 ?", ans: 50, tol: 3, unit: "%", n: "cro", traps: [25, 85, 75], why: "Environ 50 % en 2020 : elle a doublé depuis 1970."},
  {q: "En Amérique du Nord, quelle était la part de population urbaine en 1970 ?", ans: 75, tol: 3, unit: "%", n: "cro", traps: [25, 50, 85], why: "75 % en 1970, puis 85 % en 2020."},
  {q: "En Amérique du Nord, quelle était la part de population urbaine en 2020 ?", ans: 85, tol: 3, unit: "%", n: "cro", traps: [50, 75, 25], why: "85 % en 2020."},
  {q: "L'Europe est urbaine à plus de combien de pour cent ?", ans: 80, tol: 2, unit: "%", n: "cro", traps: [50, 25, 60], why: "Plus de 80 %, comme l'Amérique du Nord."},
  {q: "Combien de millions d'habitants compte Londres avec sa banlieue ?", ans: 10, tol: 1, unit: " millions", n: "lon", traps: [1, 50, 100], why: "Environ 10 millions d'habitants."},
  {q: "Densité du Grand Londres : environ combien d'habitants par km² ?", ans: 5000, tol: 500, unit: " hab./km²", n: "lon", traps: [11000, 500, 50000], why: "Environ 5 000 hab./km² en moyenne, et plus de 11 000 dans le centre."},
  {q: "Densité dans le centre de Londres (la City) : plus de combien d'habitants par km² ?", ans: 11000, tol: 1000, unit: " hab./km²", n: "lon", traps: [5000, 1100, 110000], why: "Plus de 11 000 hab./km² : le centre est bien plus dense que la moyenne."},
  {q: "Dans le centre de Londres, plus de quel pourcentage des habitants est né à l'étranger ?", ans: 30, tol: 2, unit: "%", n: "lon", traps: [3, 70, 10], why: "Plus de 30 % : c'est le cosmopolitisme."},
  {q: "Jusqu'à combien de kilomètres s'étend la périphérie de Londres ?", ans: 50, tol: 5, unit: " km", n: "lon", traps: [5, 500, 15], why: "Jusqu'à 50 km du centre."}
];

/* ---------- vrai ou faux ---------- */
const VF = [
  ["Les périphéries sont plus denses que les centres.", false, "per", "C'est l'inverse : la densité est très forte dans les centres, moins forte dans les périphéries."],
  ["Le paysage des centres est plutôt vertical.", true, "cen", "Oui : gratte-ciel et tours."],
  ["Le paysage des périphéries est plutôt horizontal.", true, "per", "Oui : maisons, autoroutes, étalement."],
  ["La fonction principale des centres est la résidence.", false, "cen", "Non : c'est le commandement (affaires, banques, commerces, tourisme). La résidence, c'est la périphérie."],
  ["Plus de la moitié de la population mondiale vit en ville.", true, "urb", "Oui : environ 55 %."],
  ["La croissance urbaine a commencé en Afrique.", false, "urb", "Non : en Europe et en Amérique du Nord, au XIXe siècle."],
  ["Aujourd'hui, l'Afrique est la région où la population urbaine augmente le plus vite.", true, "cro", "Oui, par exemple au Nigeria."],
  ["L'exode rural, c'est le départ des citadins vers la campagne.", false, "cro", "Non : c'est le départ des habitants des campagnes vers les villes."],
  ["L'Asie était plus urbanisée que l'Amérique du Nord en 2020.", false, "cro", "Non : environ 50 % en Asie contre 85 % en Amérique du Nord."],
  ["À Mumbai, de riches gratte-ciel côtoient des bidonvilles.", true, "per", "Oui : ce sont les contrastes sociaux."],
  ["Songjiang est le quartier historique de Londres.", false, "sha", "Non : Songjiang est une ville nouvelle près de Shanghai."],
  ["Canary Wharf est un nouveau quartier d'affaires de Londres.", true, "lon", "Oui, construit sur les anciens docks."],
  ["Le centre et les périphéries de Londres sont mal reliés.", false, "lon", "Non : métro, trains de banlieue et autoroutes forment un réseau très performant."],
  ["Avec la mondialisation, les villes connaissent un étalement urbain.", true, "per", "Oui : elles grandissent sur la campagne."],
  ["Westminster est le quartier du Parlement.", true, "lon", "Oui : un lieu du pouvoir politique."],
  ["Les grandes métropoles mondiales sont surtout en Europe.", false, "urb", "Non : surtout en Asie du Sud et de l'Est (Tokyo, Shanghai, Mumbai)."]
];

/* ---------- tableau centres / périphéries ---------- */
const TAB = [
  {crit: "la forme du paysage", c: "verticale (gratte-ciel, tours)", p: "horizontale (maisons, autoroutes, étalement)"},
  {crit: "la densité", c: "très forte (beaucoup de monde et de bâtiments)", p: "moins forte (plus d'espaces ouverts)"},
  {crit: "la fonction principale", c: "le commandement (affaires, banques, commerces, tourisme)", p: "la résidence (logements) et le transport"}
];

/* ---------- fabrication des questions ---------- */
const tagOf = n => `<span class="tag ${({1: "l1", 2: "l2", 3: "l3"})[UBY[n].group]}">${esc(UBY[n].name)}</span>`;
const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;
const nl = s => esc(s).replace(/\n/g, "<br>");

/* Chaque générateur renvoie un exercice neutre {n, prompt, opts | field, explain, review, tip?, redo} */
const G = {
  cours(n){
    const c = pick(COURS.filter(x => x.n === n));
    return {n, prompt: esc(c.q), wide: true, opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), explain: nl(c.a), tip: c.tip,
      review: rev(n, c.q, c.o[0]), redo: () => G.cours(n)};
  },
  exemple(n){
    const pool = EX.filter(e => e.n === n);
    if (!pool.length) return null;
    const e = pick(pool), bad = Object.keys(T).filter(k => k !== e.t && !(e.not || []).includes(k));
    const opts = shuffle([{t: T[e.t], ok: true}, ...shuffle(bad).slice(0, 3).map(k => ({t: T[k], ok: false}))]);
    return {n, prompt: `<b>${esc(e.name)}</b> (${esc(e.city)}), c'est…`, wide: true, opts, explain: esc(e.why),
      review: rev(n, `${e.name} (${e.city})`, T[e.t]), redo: () => G.exemple(n)};
  },
  ouSitue(n){
    const pool = EX.filter(e => e.n === n && e.where);
    if (!pool.length) return null;
    const e = pick(pool), ans = e.where === "c" ? "Le centre" : "La périphérie";
    return {n, prompt: `<b>${esc(e.name)}</b> (${esc(e.city)}) : centre ou périphérie ?`, opts: [{t: "Le centre", ok: e.where === "c"}, {t: "La périphérie", ok: e.where === "p"}],
      explain: esc(e.why), review: rev(n, `${e.name} : centre ou périphérie ?`, ans), redo: () => G.ouSitue(n)};
  },
  tableau(n){
    if (n !== "cen" && n !== "per") return null;
    const row = pick(TAB), side = n === "cen" ? "c" : "p", other = side === "c" ? "p" : "c";
    const others = TAB.filter(r => r !== row).map(r => r[side]);
    const opts = shuffle([{t: row[side], ok: true}, {t: row[other], ok: false}, ...others.map(t => ({t, ok: false}))]);
    const where = side === "c" ? "les centres" : "les périphéries";
    return {n, prompt: `Dans <b>${where}</b>, ${esc(row.crit)} est…`, wide: true, opts,
      explain: `Centres : ${esc(row.c)}.<br>Périphéries : ${esc(row.p)}.`, review: rev(n, `${where} : ${row.crit}`, row[side]), redo: () => G.tableau(n)};
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
    if (typed) return Object.assign(base, {explain: "", field: {label: "Le mot", lang: "fr", check: val => { const ok = vocOk(v, val); return {ok, fix: ok ? "✓" : `→ ${v.word}`}; }}});
    const others = shuffle(VOC.filter(x => x !== v)).slice(0, 3).map(x => ({t: x.word, ok: false}));
    return Object.assign(base, {opts: shuffle([{t: v.word, ok: true}, ...others])});
  },
  chiffre(n, typed){
    const pool = NUM.filter(x => x.n === n);
    if (!pool.length) return null;
    const x = pick(pool), u = x.unit, show = v => Revision.fmt(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + u;
    const base = {n, prompt: esc(x.q), explain: esc(x.why), review: rev(n, x.q, show(x.ans)), redo: () => G.chiffre(n, typed)};
    if (typed) return Object.assign(base, {field: {label: "Ta réponse", inputmode: "decimal", unit: u, check: val => {
      const raw = String(val).trim().toLowerCase().replace(/\s/g, "").replace(/(ème|eme|e)(siècle|siecle)?$/, "");
      const roman = /^[ivxlc]+$/.test(raw) ? [...raw].reduce((acc, ch, i, arr) => { const V = {i: 1, v: 5, x: 10, l: 50, c: 100}; return acc + (V[ch] < (V[arr[i + 1]] || 0) ? -V[ch] : V[ch]); }, 0) : NaN;
      const v = !isNaN(roman) ? roman : Revision.parseNum(raw.replace(/%|millions?|km|hab.*$/g, ""));
      const ok = !isNaN(v) && Math.abs(v - x.ans) <= x.tol;
      return {ok, fix: ok ? "✓" : isNaN(v) ? `Écris un nombre. → ${show(x.ans)}` : `→ ${show(x.ans)}`};
    }}});
    return Object.assign(base, {opts: shuffle([{t: show(x.ans), ok: true}, ...x.traps.map(t => ({t: show(t), ok: false}))])});
  }
};
const KINDS_QUIZ = ["cours", "cours", "exemple", "ouSitue", "tableau", "vraiFaux", "vocab", "chiffre"];
function make(kinds, n, typed){
  for (const k of shuffle(kinds)) { const e = G[k](n, typed); if (e) return e; }
  return G.cours(n);
}

/* ---------- passage au moteur ---------- */
const asQuiz = e => ({unit: UBY[e.n], key: e.review, prompt: e.prompt, wide: e.wide, opts: e.opts, tip: e.tip,
  feedback: () => box(e.explain), review: e.review});
const asControl = e => Object.assign({unit: UBY[e.n], prompt: e.prompt, wide: e.wide, tip: e.tip, review: e.review,
  correction: () => e.explain ? `<p class="label" style="margin-top:4px">Correction</p>${box(e.explain)}` : "", redo: () => asControl(e.redo())},
  e.field ? {kind: "fields", fields: [e.field]} : {kind: "choice", opts: e.opts});

Revision.start({
  key: "leandre-histoire-geo-urbanisation-v1",
  title: "L'urbanisation du monde",
  subtitle: "Géographie",
  eyebrow: "Histoire-géo · Géographie",
  hand: "Centres, périphéries, Shanghai et Londres",
  countdown: {date: "2026-10-12", label: "lundi 12 octobre"},
  groups: {
    "1": {name: "Le monde urbain", cls: "l1", filter: "Le monde urbain"},
    "2": {name: "Les paysages", cls: "l2", filter: "Centres et périphéries"},
    "3": {name: "Études de cas", cls: "l3", filter: "Shanghai et Londres"}
  },
  units: UNITS,
  allLabel: () => "Tout le chapitre",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["pour commencer", "Lis la question, retourne la carte : la leçon et des exemples."],
    quiz: ["10 questions", "Définitions, exemples, chiffres, vrai ou faux."],
    control: ["noté sur 20", "Tu écris les mots et les chiffres toi-même, comme à l'évaluation."]
  },
  cards: pool => COURS.filter(c => pool.some(u => u.id === c.n)).map(c => ({unit: UBY[c.n],
    front: `<div class="fbody"><span class="card-q">${esc(c.card)}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
    back: `<div class="fbody left"><span class="card-a">${esc(c.a)}</span>${c.tip ? `<span class="tip">${esc(c.tip)}</span>` : ""}</div>`})),
  quiz: {count: 10, make: (pool, R) => asQuiz(make(KINDS_QUIZ, R.weighted(pool).id, false))},
  control: {
    lead: "12 questions : des mots à écrire, des chiffres à retrouver, des exemples à reconnaître et des questions de cours. Chaque question compte autant.",
    note: "Les accents et les majuscules ne comptent pas pour les mots. Pour les chiffres, une petite approximation est acceptée.",
    size: () => 12,
    build: (pool, R) => {
      const plan = ["vocab", "vocab", "vocab", "chiffre", "chiffre", "exemple", "exemple", "ouSitue", "tableau", "vraiFaux", "cours", "cours"];
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
