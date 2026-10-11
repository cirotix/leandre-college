# Les révisions de Léandre — conventions

Site statique servi par GitHub Pages (branche `main`, racine) : https://cirotix.github.io/leandre-college/
Public : Léandre, au collège, surtout sur iPad (Safari, ajouté à l'écran d'accueil). Aucune étape de build.

## Arborescence

```
index.html                 accueil : recherche + filtre par matière (lib/home.js), alimenté par modules.json
modules.json               catalogue : matières + modules (seule chose à toucher pour l'accueil)
lib/revision.js            LE moteur : écrans Cartes / Quiz / Contrôle, progression, choix des éléments, synthèse vocale
lib/revision.css           styles communs (cahier Seyès, fiches bristol, mode sombre = ardoise)
lib/module.html            gabarit de page : chaque <matiere>/<module>/index.html en est une COPIE EXACTE
lib/home.js                logique de l'accueil
<matiere>/<module>/module.js   le module : données + règles, rien d'autre
tools/check.py             vérifications à lancer avant chaque commit
sw.js                      service worker : hors connexion (réseau d'abord, modules préchargés via modules.json) + notifications
lib/push.js                bloc « Notifications » de l'accueil (abonnement) ; adresse du worker dans push.json
worker/                    Worker Cloudflare « leandre-push » (abonnements en KV, envoi Web Push sans dépendance)
.github/workflows/deploy-worker.yml   déploie worker/ à chaque push qui le modifie
```

Identifiants en minuscules, sans accent, avec des tirets : `maths/fractions/`, `francais/accords-participe/`.

## Ajouter un module

1. `mkdir <matiere>/<module> && cp lib/module.html <matiere>/<module>/index.html`
2. Écrire `<matiere>/<module>/module.js` (contrat ci-dessous), en s'inspirant de `maths/triangles/` (cours + exercices
   générés) ou `anglais/verbes-irreguliers/` (liste d'éléments à choisir, saisie de texte, voix).
3. Ajouter l'entrée dans `modules.json` : `matiere`, `chemin`, `titre`, `resume`, `ajoute` (AAAA-MM-JJ),
   `chapitre` et `motsCles` (liste, pour la recherche) facultatifs. « Nouveau ! » s'affiche 14 jours.
   Nouvelle matière : l'ajouter dans `matieres` (`id`, `nom`, `couleur` parmi hl-1, hl-2, hl-3).
4. `python3 tools/check.py`, tester les trois modes dans un navigateur (mobile et tablette), commit, push.

Ne pas modifier le moteur pour un besoin propre à un module : soit c'est générique et ça va dans `lib/`
(en vérifiant que tous les modules marchent encore), soit ça reste dans le `module.js`.

## Contrat de `module.js`

Le fichier est enveloppé dans `(() => { "use strict"; … })();` et appelle `Revision.start({...})`, avec `key` en premier :

```js
Revision.start({
  key: "leandre-<matiere>-<module>-v1",    // clé localStorage, unique (exceptions historiques : verbes-leandre-v1, triangles-leandre-v1)
  title, subtitle?, eyebrow?, hand?,        // en-tête du module (hand = note manuscrite rouge)
  countdown?: {date: "AAAA-MM-JJ", label: "mardi 13 octobre"},
  groups: {"1": {name, plural?, cls: "l1"|"l2"|"l3", filter?}},   // couleur + chips « Je révise »
  units: [{id, name, group, tag?, sub?}],   // ce dont on suit la maîtrise (verbe, notion…)
  allLabel?: n => "Tout le chapitre",
  mastery: {max, noun, feminine?, help},
  modes?: {cards: [badge, texte], quiz: [...], control: [...]},
  selection?: {default: [ids], button, filters: [{id, label, test}], chip: u => html, counter: sel => html},
  overview?: (selectedUnits, R) => html,    // bloc libre sur l'accueil du module
  cards: (pool, R) => [{unit, front: html, back: html, extra?: html}],
  quiz: {count, make: (pool, R, i) => ({unit, key, prompt: html, fig?, opts: [{t, ok}], wide?, feedback: ok => html, tip?, review: html})},
  control: {lead: html, note?: html, options?: [{id, label, choices: [[k, t]], default}], size?: pool => n,
            build: (pool, R) => [item]}
});
```

Un `item` de contrôle : `{unit, kind: "choice", opts}` ou `{unit, kind: "fields", fields: [{label, lang?, inputmode?, unit?, check: v => ({ok, fix})}]}`,
plus `prompt?`, `given?: {label, value}`, `fig?`, `correction: all => html`, `tip?`, `review: html` (ligne « À revoir »),
`redo: () => item` (même exercice, nouveaux nombres, pour « Refaire mes erreurs »).

`R` (et `Revision`) fournit : `esc, shuffle, pick, randInt, round2, fmt, fold, parseNum, numEqual, numField(ans, unit),
numChoices(ans, pièges, unit), speakBtn(texte, lang), weighted(pool), mastery(u), selected(), option(id)`.
`prompt`, `feedback`, `correction`, `front`, `back` sont du HTML : échapper les textes avec `esc`.
La note du contrôle = moyenne des items (un item à champs vaut la part de champs justes) × 20.

## Contenu

- Questions de cours fidèles au cahier de Léandre (photos fournies par Damien) ; signaler les erreurs de recopie
  repérées dans le cahier plutôt que de les reproduire.
- Exercices générés avec des nombres tirés au hasard, correction rédigée « comme au tableau ».
- Tout en français, ton encourageant. Aucune dépendance externe hors Google Fonts.
- Ne jamais renommer ni déplacer un module publié (favoris, écran d'accueil) ni changer sa `key` (progression perdue).

## Notifications

- Seules les nouveautés sont annoncées : le worker relit `modules.json` toutes les heures (cron `17 * * * *`, UTC)
  et envoie « Nouveau en <matière> ! » pour chaque `chemin` jamais vu. Rien d'autre à faire qu'ajouter le module.
- Rappels de révision : prévus mais désactivés (`REMINDERS` dans `worker/wrangler.toml`), seulement sur demande de Damien.
- Les clés VAPID sont générées par le worker au premier appel et gardées dans le KV : ne jamais les mettre dans le dépôt.
- Sur iPad, l'abonnement n'est possible que depuis l'appli ajoutée à l'écran d'accueil (iPadOS 16.4+), en HTTPS.
- Tests de la crypto : chiffrement RFC 8291 et JWT VAPID vérifiés par une implémentation Python indépendante.
