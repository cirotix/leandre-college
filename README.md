# Les révisions de Léandre

Petit site de révision servi par GitHub Pages : https://cirotix.github.io/leandre-college/

Chaque module propose trois modes : Cartes · Quiz · Contrôle noté sur 20.

- `anglais/verbes-irreguliers/` : les verbes irréguliers
- `maths/triangles/` : triangles égaux, semblables, agrandissement et réduction

Le moteur commun est dans `lib/` ; un module n'est qu'un fichier `module.js` (données + règles).
L'accueil (recherche, filtre par matière) se construit à partir de `modules.json`.
Conventions et contrat des modules : `CLAUDE.md`. Vérifications : `python3 tools/check.py`.
