# La fabrique de modules

Des photos du cahier au module en ligne, sans intervention : une chaîne d'appels à l'API Claude qui tourne sur ta
machine, avec une petite interface Streamlit. Chaque fabrication est relue, testée, chiffrée, puis attend ton feu vert
avant d'être publiée (commit + push).

## Installation (une fois)

```bash
cd leandre-college
python3 -m venv .venv && source .venv/bin/activate
pip install -r tools/fabrique/requirements.txt
playwright install chromium          # tests du module et rendu du film
# ffmpeg doit être installé pour le film (brew install ffmpeg / apt install ffmpeg)
export ANTHROPIC_API_KEY=sk-ant-…    # ou la coller dans la barre latérale de l'interface (jamais écrite sur le disque)
```

## Utilisation

```bash
streamlit run tools/fabrique/app.py
```

1. **➕ Nouveau module** : déposer les photos (triées par nom de fichier), choisir la matière (ou la laisser détecter),
   cocher *Rédaction* et/ou *Film*, ajouter des consignes si besoin, éventuellement changer de modèle pour cette fois.
2. La chaîne se déroule (1 à 3 min, + ~5 min de rendu si film) : chaque étape affiche ce qu'elle a fait et son coût.
3. **🗂 Fabrications** : l'aperçu du module (le vrai site, servi en local), les captures du test automatique, ce qui est
   **à vérifier** (erreurs relevées dans le cahier, doutes de lecture, « par cœur » retenu, note de la relecture,
   problèmes restants), tout le contenu en tableaux, le coût détaillé.
   - **Publier** : commit (« Nouveau module : … ») + push → en ligne en une à deux minutes, notification aux tablettes.
   - **Jeter** : retire le module du site local (le dossier de travail reste).
   - **Refaire à partir de** une étape, avec un autre modèle : les étapes d'avant ne sont pas repayées.
4. **💶 Coûts** : chaque module, son coût, ses modèles ; la moyenne par étape et par modèle pour comparer.
5. **⚙️ Modèles** : `config.yaml` (modèle par étape, profils par matière, prix).

Même chose en ligne de commande : `python3 tools/fabrique/fabriquer.py photos/*.jpg --matiere SVT --video`, puis
`--reprendre travaux/<dossier> --publier` (ou `--jeter`) ; `--couts` pour l'historique.
Sans clé et sans dépense : `FABRIQUE_SIMULATION=1` (ou l'interrupteur « Simulation ») rejoue des réponses enregistrées.

## La chaîne

| Étape | Rôle | Modèle par défaut |
|---|---|---|
| extraction | lit les photos : cours recopié par parties, **« par cœur »** (souligné, rouge, encadré, bilans, fiche du prof), vocabulaire, chiffres, activités, erreurs du cahier, date de l'évaluation | Sonnet (la fidélité se joue ici) |
| production | écrit la leçon : notions, cartes, QCM avec pièges de même longueur, vrai/faux, chiffres, enchaînements, classements, sujets de rédaction avec critères | Haiku |
| vérifications | gratuites, en Python : références, mots-clés présents dans la phrase, pièges distincts, doublons, par cœur recopié à l'identique… | — |
| relecture | un « professeur » relit tout et classe les problèmes (bloquant / important / mineur) | Sonnet |
| correction | applique les corrections demandées, sans toucher au reste | Haiku |
| storyboard | scénario du film (si coché), rendu par `tools/film/gabarit.html` + `make_film.py` | Sonnet |
| site, tests | `module.js` = données seulement (`Revision.lesson`, moteur `lib/lesson.js`), `modules.json`, `check.py`, `test_module.py` | — |

Coût attendu : environ 0,10 à 0,20 $ par module (dont l'essentiel pour lire les photos), + ~0,03 $ de scénario
pour un film. Les prompts sont dans `prompts.py`, les schémas JSON (sorties contraintes) dans `schemas.py`.

## Fichiers

- `travaux/<horodatage>-<titre>/` (hors dépôt) : sources, options, sortie de chaque étape, `journal.jsonl` des appels,
  captures, état. Une fabrication interrompue reprend là où elle s'était arrêtée.
- `couts.jsonl` (hors dépôt) : une ligne par module fabriqué.
- `simulation/` : réponses enregistrées pour le mode simulation (tirées du module de SVT).

## Essayer d'autres modèles

- Pour une fabrication : la section « Modèles pour cette fabrication », ou `--modele production=claude-sonnet-5-5`.
- Pour une matière : un profil dans `config.yaml` (`profils: {histoire-geo: {production: {modele: …}}}`).
- Sur un module déjà fait : *Refaire à partir de* « production » avec un autre modèle, puis comparer dans *Coûts* et
  dans l'aperçu.
- `batch: true` divise le prix par deux (API Batch) mais la réponse peut prendre de quelques minutes à quelques heures.
- `extra:` dans une étape passe des paramètres bruts à l'API (pour essayer un réglage sans toucher au code).
