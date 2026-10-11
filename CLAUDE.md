# Les révisions de Léandre — conventions

Site statique servi par GitHub Pages (branche `main`, racine) : https://cirotix.github.io/leandre-college/
Public : Léandre, au collège, surtout sur iPad (Safari, ajouté à l'écran d'accueil).

## Arborescence

```
index.html              accueil, généré depuis modules.json (ne pas y écrire de module en dur)
modules.json            catalogue : matières + modules
manifest.webmanifest    installation sur l'écran d'accueil
icon.svg
<matiere>/<module>/index.html   un module = une page HTML autonome
tools/check.py          vérifications avant chaque commit
```

Identifiants en minuscules, sans accent, avec des tirets : `maths/fractions/`, `francais/accords-participe/`.
Matières prévues dans modules.json : anglais, maths, francais, histoire-geo, sciences (en ajouter au besoin).
Une matière sans module n'apparaît pas sur l'accueil.

## Ajouter un module

1. Créer `<matiere>/<module>/index.html`, en partant d'un module existant (même modèle : cahier Seyès,
   fiches bristol, trois modes **Cartes · Quiz · Contrôle noté sur 20**, sombre = ardoise).
2. Dans le `<head>` : `../../manifest.webmanifest`, `../../icon.svg`, `lang="fr"`.
   Juste avant `<div class="app" id="screen">` : le lien `<a class="site-back" href="../../">← Mes révisions</a>`.
3. Clé localStorage unique : `leandre-<matiere>-<module>-v1`.
   Exceptions historiques à ne pas renommer (on perdrait la progression) : `verbes-leandre-v1`, `triangles-leandre-v1`.
4. Ajouter l'entrée dans `modules.json` (`matiere`, `chemin`, `titre`, `resume`, `ajoute` au format AAAA-MM-JJ,
   `chapitre` facultatif). Un module ajouté depuis moins de 14 jours affiche « Nouveau ! ».
5. `python3 tools/check.py`, tester les trois modes dans un navigateur (mobile et tablette), puis commit et push.

## Contenu

- Questions de cours fidèles au cahier de Léandre (photos fournies par Damien) ; signaler toute erreur de recopie
  repérée dans le cahier plutôt que de la reproduire.
- Exercices générés avec des nombres tirés au hasard, correction rédigée « comme au tableau ».
- Tout en français, ton encourageant, aucune dépendance externe hors Google Fonts.
- Ne jamais renommer ni déplacer un module publié sans redirection (favoris, écran d'accueil).
