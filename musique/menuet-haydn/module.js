/* Module : musique · « Comment se construit la musique à la période Classique ? »
   Source : fiche de cours de Léandre (photo du 22/11/2026) : l'œuvre (Quatuor en ré majeur opus 20 n°4 de Haydn,
   menuet), ses trois parties A B A, la période classique (phrases soulignées = à savoir par cœur), le compositeur,
   les définitions. Module « leçon » piloté par les données : lib/lesson.js construit cartes, quiz, contrôle et rédaction. */
(() => {
"use strict";

const SRC = "La période classique · phrase soulignée";

Revision.lesson({
  key: "leandre-musique-menuet-haydn-v1",
  titre: "Le menuet de Haydn",
  sousTitre: "Comment se construit la musique à la période classique ?",
  surtitre: "Éducation musicale · La période classique",
  note: "Quatuor en ré majeur opus 20 n°4",

  parties: [
    {id: "1", nom: "L'œuvre : un menuet en 3 parties", filtre: "L'œuvre"},
    {id: "2", nom: "La période classique et Haydn", filtre: "Période classique"},
    {id: "3", nom: "Les mots de la musique", filtre: "Vocabulaire"}
  ],
  notions: [
    {id: "oeuvre", partie: "1", nom: "Le quatuor de Haydn", detail: "Quatuor à cordes, musique de chambre, menuet, tempo, 3 temps"},
    {id: "parta",  partie: "1", nom: "La partie A", detail: "Violon 1, thèmes a a a' a'"},
    {id: "partb",  partie: "1", nom: "La partie B", detail: "Violoncelle, thèmes b b b' b', moins rapide"},
    {id: "reprise", partie: "1", nom: "Le retour de A", detail: "Reprise simplifiée : a a'"},
    {id: "periode", partie: "2", nom: "La période classique", detail: "1750-1800, formes et règles, construction claire"},
    {id: "menuet", partie: "2", nom: "La forme menuet", detail: "ABA, B moins rapide, mesures à 3 temps"},
    {id: "compo",  partie: "2", nom: "Haydn et Mozart", detail: "Compositeur autrichien, plus de 200 pièces"},
    {id: "mots",   partie: "3", nom: "Les définitions", detail: "Quatuor, musique de chambre, tempo, forme, thème"}
  ],

  /* ---------- phrases soulignées de la fiche, à savoir mot pour mot ---------- */
  parCoeur: [
    {id: "pc1", notion: "periode", source: SRC,
     question: "À la période classique, à quoi correspondent tous les morceaux ?",
     phrase: "À cette période, tous les morceaux correspondent à une forme musicale et chaque forme a ses règles.",
     motsCles: ["forme musicale", "règles"],
     pieges: ["À cette période, tous les morceaux sont improvisés et aucune forme n'a de règles.",
              "À cette période, tous les morceaux correspondent à un instrument et chaque instrument a ses règles.",
              "À cette période, quelques morceaux correspondent à une forme musicale, mais les formes n'ont pas de règles."]},
    {id: "pc2", notion: "periode", source: SRC,
     question: "Comment est construite la musique à la période classique ?",
     phrase: "À cette période, la musique a une construction claire et équilibrée.",
     motsCles: ["claire", "équilibrée"],
     pieges: ["À cette période, la musique a une construction libre et compliquée.",
              "À cette période, la musique a une construction sombre et déséquilibrée.",
              "À cette période, la musique n'a pas de construction : elle est improvisée."]},
    {id: "pc3", notion: "menuet", source: "La période classique · exemple du menuet",
     question: "Quelles sont les règles de la forme menuet ?",
     phrase: "La forme menuet doit comporter 3 parties (ABA), la partie B doit être moins rapide que les autres et les mesures doivent être à 3 temps.",
     motsCles: ["ABA", "moins rapide", "3 temps"],
     pieges: ["La forme menuet doit comporter 2 parties (AB), la partie B doit être plus rapide que les autres et les mesures doivent être à 2 temps.",
              "La forme menuet doit comporter 3 parties (ABC), la partie B doit être plus rapide que les autres et les mesures doivent être à 4 temps.",
              "La forme menuet doit comporter 3 parties (ABA), la partie A doit être moins rapide que les autres et les mesures doivent être à 4 temps."]}
  ],

  /* ---------- le reste de la fiche ---------- */
  cours: [
    /* l'œuvre */
    {notion: "oeuvre", question: "Qui a composé le Quatuor en ré majeur opus 20 n°4 ?", reponse: "**Joseph Haydn** (1732-1809).", astuce: "",
     qcm: {question: "Qui a composé le Quatuor en ré majeur opus 20 n°4 ?", bonne: "Joseph Haydn", pieges: ["Wolfgang Amadeus Mozart", "Jean-Sébastien Bach", "Antonio Vivaldi"]}},
    {notion: "oeuvre", question: "Par quoi ce morceau est-il joué ?", reponse: "Par un **quatuor à cordes**.", astuce: "",
     qcm: {question: "Le Quatuor opus 20 n°4 de Haydn est joué par…", bonne: "un quatuor à cordes", pieges: ["un orchestre symphonique", "un piano seul", "un chœur et un orgue"]}},
    {notion: "oeuvre", question: "Quels instruments forment un quatuor à cordes ?", reponse: "**Deux violons, un alto et un violoncelle.**", astuce: "Quatuor = 4 musiciens.",
     qcm: {question: "Quels instruments forment un quatuor à cordes ?", bonne: "Deux violons, un alto et un violoncelle", pieges: ["Quatre violons", "Deux violons, une contrebasse et un piano", "Un violon, un alto, un violoncelle et une flûte"]}},
    {notion: "oeuvre", question: "Ce morceau, joué par un petit nombre d'instruments, c'est de la musique…", reponse: "De la **musique de chambre**.", astuce: "",
     qcm: {question: "Ce morceau joué par un quatuor à cordes, c'est de la…", bonne: "musique de chambre", pieges: ["musique symphonique", "musique d'opéra", "musique de film"]}},
    {notion: "oeuvre", question: "Quelle est la forme musicale de ce morceau ?", reponse: "C'est un **menuet**.", astuce: "",
     qcm: {question: "Quelle est la forme musicale de ce morceau ?", bonne: "Un menuet", pieges: ["Une fugue", "Un concerto", "Un opéra"]}},
    {notion: "oeuvre", question: "Quel est le tempo de ce menuet ?", reponse: "Le tempo est **rapide**.", astuce: "",
     qcm: {question: "Quel est le tempo de ce menuet ?", bonne: "Rapide", pieges: ["Très lent", "Lent", "Il n'y a pas de tempo"]}},
    {notion: "oeuvre", question: "Combien de temps y a-t-il dans chaque mesure de ce menuet ?", reponse: "Les mesures sont à **3 temps**.", astuce: "Comme une valse : 1-2-3, 1-2-3.",
     qcm: {question: "Les mesures de ce menuet sont à…", bonne: "3 temps", pieges: ["2 temps", "4 temps", "6 temps"]}},
    /* partie A */
    {notion: "parta", question: "De quoi se compose la 1re partie (A) ?", reponse: "De **deux thèmes** différents : **a** et **a'**.", astuce: "",
     qcm: {question: "La 1re partie (A) se compose de…", bonne: "deux thèmes différents, a et a'", pieges: ["un seul thème, a", "trois thèmes, a, b et c", "deux thèmes, b et b'"]}},
    {notion: "parta", question: "Dans la partie A, quel instrument joue les thèmes ?", reponse: "Le **violon 1** (le premier violon).", astuce: "",
     qcm: {question: "Dans la partie A, quel instrument joue les thèmes ?", bonne: "Le violon 1", pieges: ["Le violoncelle", "L'alto", "Le violon 2"]}},
    {notion: "parta", question: "Dans la partie A, que jouent les autres instruments ?", reponse: "Ils jouent **l'accompagnement**.", astuce: "",
     qcm: {question: "Pendant que le violon 1 joue les thèmes, les autres instruments…", bonne: "jouent l'accompagnement", pieges: ["se taisent", "jouent le même thème en même temps", "improvisent un autre thème"]}},
    {notion: "parta", question: "Dans quel ordre sont joués les thèmes de la partie A ?", reponse: "**a a a' a'**", astuce: "Chaque thème est joué deux fois.",
     qcm: {question: "Dans la partie A, les thèmes sont joués dans cet ordre :", bonne: "a a a' a'", pieges: ["a a' a a'", "a' a' a a", "a a'"]}},
    /* partie B */
    {notion: "partb", question: "Quels thèmes entend-on dans la 2e partie (B) ?", reponse: "Deux autres thèmes : **b** et **b'**.", astuce: "",
     qcm: {question: "Dans la partie B, on entend les thèmes…", bonne: "b et b'", pieges: ["a et a'", "a et b", "c et c'"]}},
    {notion: "partb", question: "Dans la partie B, quel instrument joue les thèmes ?", reponse: "Le **violoncelle**.", astuce: "Cette fois, la mélodie passe au grave.",
     qcm: {question: "Dans la partie B, quel instrument joue les thèmes ?", bonne: "Le violoncelle", pieges: ["Le violon 1", "L'alto", "Le violon 2"]}},
    {notion: "partb", question: "Dans quel ordre sont joués les thèmes de la partie B ?", reponse: "**b b b' b'** : dans le même ordre que dans la 1re partie.", astuce: "",
     qcm: {question: "Dans la partie B, les thèmes sont joués dans cet ordre :", bonne: "b b b' b'", pieges: ["b b' b b'", "b' b' b b", "b b'"]}},
    {notion: "partb", question: "Comment est le tempo de la partie B par rapport à la partie A ?", reponse: "Il est **un peu moins rapide**.", astuce: "",
     qcm: {question: "Par rapport à la 1re partie, la partie B est…", bonne: "un peu moins rapide", pieges: ["beaucoup plus rapide", "un peu plus rapide", "exactement au même tempo"]}},
    /* retour de A */
    {notion: "reprise", question: "Qu'est-ce que la 3e partie du menuet ?", reponse: "C'est une **reprise simplifiée** de la 1re partie (A).", astuce: "",
     qcm: {question: "La 3e partie du menuet est…", bonne: "une reprise simplifiée de la 1re partie", pieges: ["une reprise de la partie B", "un nouveau thème c joué par l'alto", "un solo de violoncelle"]}},
    {notion: "reprise", question: "Dans quel ordre entend-on les thèmes dans la 3e partie ?", reponse: "**a a'** : chaque thème n'est joué qu'une fois.", astuce: "",
     qcm: {question: "Dans la 3e partie, les thèmes sont joués dans cet ordre :", bonne: "a a'", pieges: ["a a a' a'", "b b'", "a' a"]}},
    {notion: "reprise", question: "Quel est le plan du menuet ?", reponse: "**A B A** : 3 parties.", astuce: "",
     qcm: {question: "Quel est le plan du menuet ?", bonne: "A B A", pieges: ["A B C", "A A B", "A B B"]}},
    /* période */
    {notion: "periode", question: "Quelles sont les dates de la période classique ?", reponse: "De **1750 à 1800**.", astuce: "",
     qcm: {question: "Quelles sont les dates de la période classique ?", bonne: "1750-1800", pieges: ["1600-1750", "1800-1900", "1900-2000"]}},
    /* menuet */
    {notion: "menuet", question: "Dans un menuet, quelle partie doit être la moins rapide ?", reponse: "La partie **B**.", astuce: "",
     qcm: {question: "Dans un menuet, quelle partie doit être la moins rapide ?", bonne: "La partie B", pieges: ["La 1re partie A", "La dernière partie A", "Aucune : tout est au même tempo"]}},
    /* compositeur */
    {notion: "compo", question: "De quel pays est Joseph Haydn ?", reponse: "C'est un compositeur **autrichien** de la période classique.", astuce: "",
     qcm: {question: "Joseph Haydn est un compositeur…", bonne: "autrichien", pieges: ["français", "italien", "anglais"]}},
    {notion: "compo", question: "Quel autre grand compositeur de la période classique peut-on citer ?", reponse: "**Wolfgang Amadeus Mozart**.", astuce: "",
     qcm: {question: "Quel autre grand compositeur de la période classique peut-on citer ?", bonne: "Wolfgang Amadeus Mozart", pieges: ["Jean-Sébastien Bach", "Antonio Vivaldi", "Claude Debussy"]}},
    {notion: "compo", question: "Combien de pièces de musique de chambre Haydn a-t-il composées ?", reponse: "**Plus de 200** pièces de musique de chambre.", astuce: "",
     qcm: {question: "Haydn a composé…", bonne: "plus de 200 pièces de musique de chambre", pieges: ["une seule pièce de musique de chambre", "une vingtaine de pièces de musique de chambre", "seulement des opéras"]}}
  ],

  vocabulaire: [
    {notion: "mots", mot: "quatuor à cordes", definition: "Ensemble qui se compose de deux violons, un alto et un violoncelle.", variantes: ["quatuor", "un quatuor a corde"]},
    {notion: "mots", mot: "musique de chambre", definition: "Musique écrite pour un petit nombre d'instruments.", variantes: []},
    {notion: "mots", mot: "tempo", definition: "La vitesse.", variantes: []},
    {notion: "mots", mot: "forme musicale", definition: "Construction des œuvres musicales.", variantes: ["forme"]},
    {notion: "mots", mot: "thème", definition: "Mélodie principale.", variantes: ["theme"]}
  ],

  vraiFaux: [
    {notion: "oeuvre", affirmation: "Un quatuor à cordes compte quatre musiciens.", vrai: true, explication: "Deux violons, un alto et un violoncelle : **4 instruments**."},
    {notion: "oeuvre", affirmation: "Il y a un piano dans un quatuor à cordes.", vrai: false, explication: "Un quatuor à cordes, c'est **deux violons, un alto et un violoncelle**. Pas de piano."},
    {notion: "oeuvre", affirmation: "Dans ce menuet, les mesures sont à 4 temps.", vrai: false, explication: "Les mesures sont à **3 temps**, comme dans tout menuet."},
    {notion: "parta", affirmation: "Dans la partie A, c'est le violoncelle qui joue les thèmes.", vrai: false, explication: "Dans la partie A, c'est le **violon 1**. Le violoncelle joue les thèmes dans la partie B."},
    {notion: "partb", affirmation: "Dans la partie B, c'est le violoncelle qui joue les thèmes.", vrai: true, explication: "Oui : dans la partie B, le **violoncelle** joue les thèmes b et b', les autres l'accompagnent."},
    {notion: "partb", affirmation: "La partie B est plus rapide que la partie A.", vrai: false, explication: "Elle est **un peu moins rapide** : c'est une règle du menuet."},
    {notion: "reprise", affirmation: "La 3e partie est une reprise simplifiée de la 1re partie.", vrai: true, explication: "On réentend a et a', mais une seule fois chacun : **a a'**."},
    {notion: "reprise", affirmation: "Dans la 3e partie, on entend de nouveaux thèmes c et c'.", vrai: false, explication: "On réentend les thèmes **a et a'**, dans un autre ordre : a a'."},
    {notion: "periode", affirmation: "À la période classique, la musique a une construction claire et équilibrée.", vrai: true, explication: "C'est une phrase à savoir : **À cette période, la musique a une construction claire et équilibrée.**"},
    {notion: "periode", affirmation: "À la période classique, chaque compositeur invente librement la forme de ses morceaux, sans règles.", vrai: false, explication: "**À cette période, tous les morceaux correspondent à une forme musicale et chaque forme a ses règles.**"},
    {notion: "compo", affirmation: "Mozart est un grand compositeur de la période classique.", vrai: true, explication: "Comme Haydn, **Wolfgang Amadeus Mozart** est un grand compositeur de la période classique."},
    {notion: "compo", affirmation: "Joseph Haydn est un compositeur français.", vrai: false, explication: "Haydn est un compositeur **autrichien**."},
    {notion: "mots", affirmation: "Le tempo, c'est la vitesse d'un morceau.", vrai: true, explication: "**Tempo : vitesse.**"},
    {notion: "mots", affirmation: "Le thème, c'est l'accompagnement joué par les autres instruments.", vrai: false, explication: "**Thème : mélodie principale.** L'accompagnement, c'est ce que jouent les autres instruments pendant le thème."}
  ],

  chiffres: [
    {notion: "oeuvre", question: "Les mesures du menuet sont à combien de temps ?", valeur: 3, unite: "temps", tolerance: 0, pieges: [2, 4, 6], explication: "Les mesures sont à **3 temps**."},
    {notion: "oeuvre", question: "Combien d'instruments y a-t-il dans un quatuor à cordes ?", valeur: 4, unite: "", tolerance: 0, pieges: [3, 5, 8], explication: "Deux violons, un alto et un violoncelle : **4**."},
    {notion: "menuet", question: "Combien de parties doit comporter un menuet ?", valeur: 3, unite: "parties", tolerance: 0, pieges: [2, 4, 5], explication: "**3 parties (ABA).**"},
    {notion: "periode", question: "En quelle année commence la période classique ?", valeur: 1750, unite: "", tolerance: 0, pieges: [1600, 1800, 1900], explication: "La période classique va de **1750 à 1800**."},
    {notion: "periode", question: "En quelle année se termine la période classique ?", valeur: 1800, unite: "", tolerance: 0, pieges: [1750, 1850, 1900], explication: "La période classique va de **1750 à 1800**."},
    {notion: "compo", question: "En quelle année est né Joseph Haydn ?", valeur: 1732, unite: "", tolerance: 0, pieges: [1685, 1756, 1809], explication: "Joseph Haydn : **1732**-1809."},
    {notion: "compo", question: "En quelle année est mort Joseph Haydn ?", valeur: 1809, unite: "", tolerance: 0, pieges: [1732, 1791, 1850], explication: "Joseph Haydn : 1732-**1809**."},
    {notion: "compo", question: "Haydn a composé plus de combien de pièces de musique de chambre ?", valeur: 200, unite: "", tolerance: 0, pieges: [20, 50, 1000], explication: "**Plus de 200** pièces de musique de chambre."}
  ],

  etapes: [
    {notion: "reprise", nom: "Le menuet dans l'ordre",
     liste: ["partie A : le violon 1 joue a a a' a'", "partie B : le violoncelle joue b b b' b'", "retour de A, simplifié : a a'", "fin du menuet"]}
  ],

  classements: [
    {question: "Dans ce menuet, on entend cela dans quelle partie ?",
     categories: ["la 1re partie (A)", "la 2e partie (B)", "la 3e partie (retour de A)"],
     items: [
       {notion: "parta", nom: "Les thèmes joués dans l'ordre a a a' a'", categorie: "la 1re partie (A)", pourquoi: "Dans la 1re partie, chaque thème est joué deux fois : a a a' a'."},
       {notion: "partb", nom: "Le violoncelle joue les thèmes", categorie: "la 2e partie (B)", pourquoi: "Dans la partie B, c'est le violoncelle qui joue les thèmes b et b'."},
       {notion: "partb", nom: "Les thèmes b et b'", categorie: "la 2e partie (B)", pourquoi: "Les thèmes b et b' n'apparaissent que dans la partie B."},
       {notion: "partb", nom: "Le tempo est un peu moins rapide", categorie: "la 2e partie (B)", pourquoi: "La partie B doit être moins rapide que les autres."},
       {notion: "reprise", nom: "Une reprise simplifiée de la 1re partie", categorie: "la 3e partie (retour de A)", pourquoi: "La 3e partie reprend A en plus simple."},
       {notion: "reprise", nom: "Les thèmes joués dans l'ordre a a'", categorie: "la 3e partie (retour de A)", pourquoi: "Dans la 3e partie, a et a' ne sont joués qu'une fois chacun."}
     ]},
    {question: "Cet instrument fait-il partie d'un quatuor à cordes ?",
     categories: ["oui", "non"],
     items: [
       {notion: "oeuvre", nom: "Le violon", categorie: "oui", pourquoi: "Il y a deux violons dans un quatuor à cordes."},
       {notion: "oeuvre", nom: "L'alto", categorie: "oui", pourquoi: "Deux violons, un alto et un violoncelle."},
       {notion: "oeuvre", nom: "Le violoncelle", categorie: "oui", pourquoi: "Deux violons, un alto et un violoncelle."},
       {notion: "oeuvre", nom: "Le piano", categorie: "non", pourquoi: "Un quatuor à cordes : deux violons, un alto et un violoncelle. Pas de piano."},
       {notion: "oeuvre", nom: "La flûte", categorie: "non", pourquoi: "La flûte n'est pas un instrument à cordes."},
       {notion: "oeuvre", nom: "La trompette", categorie: "non", pourquoi: "La trompette n'est pas un instrument à cordes."}
     ]}
  ],

  redaction: [
    {id: "rd-oeuvre", notion: "oeuvre", titre: "Présente l'œuvre", photo: true, document: "",
     consigne: "Présente le **Quatuor en ré majeur opus 20 n°4** en quelques phrases : son **compositeur**, la **période**, les **instruments** qui le jouent, sa **forme musicale**, son **tempo** et ses **mesures**.",
     modele: "Le Quatuor en ré majeur opus 20 n°4 a été composé par Joseph Haydn, un compositeur autrichien de la période classique (1750-1800). C'est de la musique de chambre, c'est-à-dire de la musique écrite pour un petit nombre d'instruments : il est joué par un quatuor à cordes, composé de deux violons, un alto et un violoncelle. Sa forme musicale est un menuet. Le tempo est rapide et les mesures sont à 3 temps.",
     criteres: [
       {t: "Cite le compositeur Joseph Haydn et la période classique", pts: 1},
       {t: "Dit qu'il est joué par un quatuor à cordes : deux violons, un alto et un violoncelle", pts: 2},
       {t: "Dit que c'est de la musique de chambre (pour un petit nombre d'instruments)", pts: 1},
       {t: "Dit que la forme musicale est un menuet", pts: 1},
       {t: "Dit que le tempo est rapide et que les mesures sont à 3 temps", pts: 1}
     ]},
    {id: "rd-plan", notion: "menuet", titre: "Pourquoi ce morceau est un menuet", photo: true,
     document: "**Plan du morceau entendu en classe**\n\nPartie A : le violon 1 joue les thèmes **a a a' a'**, les autres instruments l'accompagnent. Tempo rapide.\n\nPartie B : le violoncelle joue les thèmes **b b b' b'**. Tempo un peu moins rapide.\n\nPartie A : reprise simplifiée, thèmes **a a'**.\n\nTout le morceau est en mesures à **3 temps**.",
     consigne: "**D'après le document**, montre que ce morceau respecte les **règles de la forme menuet**. Termine en disant ce que cela montre de la musique de la **période classique**.",
     modele: "La forme menuet doit comporter 3 parties (ABA), la partie B doit être moins rapide que les autres et les mesures doivent être à 3 temps. Ce morceau respecte ces règles. Il a bien 3 parties : une partie A où le violon 1 joue les thèmes a et a', une partie B où le violoncelle joue les thèmes b et b', puis le retour de A en plus simple. La partie B est un peu moins rapide que la partie A. Enfin, toutes les mesures sont à 3 temps. Cela montre qu'à la période classique, tous les morceaux correspondent à une forme musicale et chaque forme a ses règles : la musique a une construction claire et équilibrée.",
     criteres: [
       {t: "Dit que le morceau a 3 parties A B A, en s'appuyant sur le document", pts: 2},
       {t: "Dit que la partie B est moins rapide que les autres", pts: 1},
       {t: "Dit que les mesures sont à 3 temps", pts: 1},
       {t: "Conclut qu'à la période classique, tous les morceaux correspondent à une forme musicale et chaque forme a ses règles", pts: 1},
       {t: "Dit que la musique classique a une construction claire et équilibrée", pts: 1}
     ]},
    {id: "rd-transfert", notion: "menuet", titre: "Est-ce vraiment un menuet ?", photo: true,
     document: "**Un élève a noté le plan d'un autre morceau**\n\nPartie A : thèmes a et a'. Tempo modéré.\n\nPartie B : thèmes b et b'. Tempo **plus rapide** que la partie A.\n\nPartie A : retour des thèmes a et a'.\n\nLes mesures sont à **2 temps**.\n\nL'élève affirme : « Ce morceau est un menuet, puisqu'il a un plan ABA. »",
     consigne: "L'élève a-t-il raison ? **Rappelle les règles de la forme menuet**, puis vérifie-les une par une **avec le document**.",
     modele: "L'élève n'a pas raison. La forme menuet doit comporter 3 parties (ABA), la partie B doit être moins rapide que les autres et les mesures doivent être à 3 temps. Ce morceau a bien un plan ABA, donc la première règle est respectée. Mais sa partie B est plus rapide que la partie A, alors qu'elle devrait être moins rapide. Et ses mesures sont à 2 temps au lieu de 3 temps. Ce morceau ne respecte donc pas toutes les règles : ce n'est pas un menuet. Un plan ABA ne suffit pas.",
     criteres: [
       {t: "Rappelle les règles du menuet : 3 parties ABA, partie B moins rapide, mesures à 3 temps", pts: 2},
       {t: "Reconnaît que le plan ABA est bien respecté", pts: 1},
       {t: "Remarque que la partie B est plus rapide, alors qu'elle devrait être moins rapide", pts: 1},
       {t: "Remarque que les mesures sont à 2 temps au lieu de 3", pts: 1},
       {t: "Conclut que ce n'est pas un menuet : l'élève a tort", pts: 1}
     ]}
  ]
});
})();
