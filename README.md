# Les révisions de Léandre

Petit site de révision servi par GitHub Pages : https://leandre.cirotteau.info
(aussi https://cirotix.github.io/leandre-college/). Pensé pour l'iPad, utilisable hors connexion une fois ajouté à l'écran d'accueil.

## Ce que propose un module

Un parcours en quatre ou cinq étapes, la première non faite étant marquée « À faire maintenant » :

1. **Vidéo** (facultative) : un film animé d'environ 5 minutes, avec des repères pour aller à une partie.
2. **Cartes** : répétition espacée (boîtes de Leitner). Chaque jour, les « cartes du jour » mêlent des cartes à revoir
   et quelques nouvelles ; « Je savais » renvoie la carte à plus tard (1, 3, 7, 14 puis 30 jours), « À revoir » la fait
   repasser dans la séance puis le lendemain. On peut aussi parcourir toutes les cartes ou reprendre les plus difficiles.
3. **Quiz** : 10 questions à choix, corrigées tout de suite.
4. **Contrôle** noté sur 20 : on écrit les réponses soi-même, comme en classe, puis on refait ses erreurs.
5. **Rédaction** (facultative) : des sujets comme à l'évaluation (document + consigne). On rédige, ou on prend sa copie
   en photo, puis la réponse est corrigée critère par critère : par Claude sur un appareil débloqué par mot de passe,
   sinon en se corrigeant soi-même avec la réponse modèle.

Les notions maîtrisées (au contrôle) sont gardées sur l'appareil. On glisse les cartes et les questions du doigt.

## Modules en ligne

- `anglais/verbes-irreguliers/` : les verbes irréguliers
- `maths/triangles/` : triangles égaux, semblables, agrandissement et réduction
- `histoire-geo/urbanisation/` : l'urbanisation du monde
- `sciences/systeme-nerveux/` : le système nerveux (SVT 4e), avec son film animé

## Organisation

- `lib/` : le moteur commun (écrans, progression, répétition espacée) ; un module n'est qu'un fichier `module.js`
  (données + règles) à côté d'une copie de `lib/module.html`.
- `modules.json` : le catalogue qui construit l'accueil (recherche, filtre par matière, « Nouveau ! », progression).
- `tools/check.py` : vérifications de cohérence ; `tools/test_module.py <chemin>` : test complet d'un module dans Chromium.
- `tools/film/` : fabrication des films animés (`make_film.py` + une page de scènes par module dans `sources/`).
- `worker/` : Worker Cloudflare des notifications « nouveau module » et de la correction par l'IA.
- `outils/comparer-ia.html` : comparaison des modèles de correction sur des réponses tests.

Conventions, contrat des modules et fabrication des vidéos : `CLAUDE.md`.
