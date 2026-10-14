# Les révisions de Léandre

Petit site de révision servi par GitHub Pages : https://leandre.cirotteau.info
(aussi https://cirotix.github.io/leandre-college/). Pensé pour l'iPad, utilisable hors connexion une fois ajouté à l'écran d'accueil.

## Ce que propose un module

Un parcours en quatre étapes, la première non faite étant marquée « À faire maintenant » :

1. **Vidéo** (facultative) : un film animé d'environ 5 minutes, avec des repères pour aller à une partie.
2. **Cartes** : répétition espacée (boîtes de Leitner). Chaque jour, les « cartes du jour » mêlent des cartes à revoir
   et quelques nouvelles ; « Je savais » renvoie la carte à plus tard (1, 3, 7, 14 puis 30 jours), « À revoir » la fait
   repasser dans la séance puis le lendemain. On peut aussi parcourir toutes les cartes ou reprendre les plus difficiles.
3. **Quiz** : 10 questions à choix, corrigées tout de suite.
4. **Contrôle** noté sur 20 : on écrit les réponses soi-même, comme en classe, puis on refait ses erreurs.

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
- `worker/` : notifications « nouveau module » (Worker Cloudflare).

Conventions, contrat des modules et fabrication des vidéos : `CLAUDE.md`.
