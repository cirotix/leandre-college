"""Schémas JSON de la fabrique.

Chaque schéma existe en deux versions :
- la version « stricte » (ici), utilisée pour valider localement avec jsonschema (nombres minimaux d'éléments…) ;
- la version « API », dérivée automatiquement par api_schema() : l'API Claude n'accepte pas minItems > 1, maxItems,
  minLength, minimum… (https://platform.claude.com/docs/en/build-with-claude/structured-outputs).
Tous les champs sont obligatoires (l'API limite le nombre de champs facultatifs) : vide = "" ou [].
"""
import copy

S = {"type": "string"}
B = {"type": "boolean"}
N = {"type": "number"}
I = {"type": "integer"}


def obj(props, **extra):
    return {"type": "object", "properties": props, "required": list(props), "additionalProperties": False, **extra}


def arr(items, mini=0):
    a = {"type": "array", "items": items}
    if mini:
        a["minItems"] = mini
    return a


# ---------- 1. Extraction : ce que contiennent les photos du cahier ----------
COURS = obj({
    "matiere": S,                 # « SVT », « Histoire-géographie »…
    "niveau": S,                  # « 4e »…
    "chapitre": S,                # « Thème 1 · Chapitre 1 » tel qu'écrit dans le cahier
    "titre": S,                   # titre du chapitre
    "date_evaluation": S,         # AAAA-MM-JJ si une date d'évaluation est écrite, sinon ""
    "parties": arr(obj({"titre": S, "contenu": S}), 1),   # le cours, fidèlement recopié partie par partie
    "par_coeur": arr(obj({"phrase": S, "source": S, "indice": S})),  # phrases à savoir mot pour mot
    "fiche_questions": arr(obj({"question": S, "reponse": S})),        # fiche de questions-réponses du professeur
    "vocabulaire": arr(obj({"mot": S, "definition": S})),
    "faits_chiffres": arr(S),
    "schemas": arr(obj({"titre": S, "description": S})),
    "activites": arr(obj({"titre": S, "consigne": S, "documents": S})),
    "erreurs_cahier": arr(obj({"constat": S, "correction": S})),
    "doutes": arr(S),
    "photos_illisibles": arr(S),
})

# ---------- 2. La leçon (données lues par lib/lesson.js) ----------
NOTION = S  # identifiant d'une notion (« trj », « neurone »…)
LECON = obj({
    "titre": S, "sousTitre": S, "surtitre": S, "note": S,
    "resume": S,                       # une phrase pour l'accueil du site
    "motsCles": arr(S),
    "parties": arr(obj({"id": S, "nom": S, "filtre": S}), 1),
    "notions": arr(obj({"id": S, "nom": S, "partie": S, "detail": S}), 1),
    "parCoeur": arr(obj({"id": S, "notion": NOTION, "question": S, "phrase": S, "source": S,
                         "motsCles": arr(S), "pieges": arr(S)})),
    "cours": arr(obj({"notion": NOTION, "question": S, "reponse": S, "astuce": S,
                      "qcm": obj({"question": S, "bonne": S, "pieges": arr(S)})}), 1),
    "vocabulaire": arr(obj({"notion": NOTION, "mot": S, "definition": S, "variantes": arr(S)})),
    "vraiFaux": arr(obj({"notion": NOTION, "affirmation": S, "vrai": B, "explication": S})),
    "chiffres": arr(obj({"notion": NOTION, "question": S, "valeur": N, "unite": S, "tolerance": N,
                         "pieges": arr(N), "explication": S})),
    "etapes": arr(obj({"notion": NOTION, "nom": S, "liste": arr(S)})),
    "classements": arr(obj({"question": S, "categories": arr(S),
                            "items": arr(obj({"notion": NOTION, "nom": S, "categorie": S, "pourquoi": S}))})),
    "redaction": arr(obj({"id": S, "notion": NOTION, "titre": S, "document": S, "consigne": S, "modele": S,
                          "photo": B, "criteres": arr(obj({"t": S, "pts": I}))})),
})

# ---------- 3. Relecture ----------
RELECTURE = obj({
    "note": I,                           # 0 à 10 : qualité globale
    "publiable": B,
    "problemes": arr(obj({"gravite": {"type": "string", "enum": ["bloquant", "important", "mineur"]},
                          "ou": S, "constat": S, "correction": S})),
    "par_coeur_oublie": arr(S),           # phrases du cahier à savoir qui ne sont pas dans la leçon
    "resume": S,
})

# ---------- 4. Storyboard de la vidéo (scènes rendues par tools/film/gabarit.html) ----------
SCENE_TYPES = ["titre", "chaine", "liste", "definition", "phrase", "chiffres", "comparaison", "recap"]
STORYBOARD = obj({
    "titre": S,
    "scenes": arr(obj({
        "type": {"type": "string", "enum": SCENE_TYPES},
        "partie": S,                    # nom court de la partie (chapitres de la vidéo)
        "titre": S,
        "texte": S,                     # une ou deux phrases à l'écran
        "etiquette": S,                 # « À savoir par cœur », « Fiche mémo · question 3 » ou ""
        "elements": arr(obj({"label": S, "detail": S, "valeur": N})),
        "duree": I,                     # secondes
    }), 1),
})


def api_schema(schema):
    """Retire les contraintes que l'API ne sait pas imposer (elles restent vérifiées localement)."""
    s = copy.deepcopy(schema)

    def walk(x):
        if isinstance(x, dict):
            if x.get("type") == "array" and x.get("minItems", 0) > 1:
                x["minItems"] = 1
            for k in ("maxItems", "minLength", "maxLength", "minimum", "maximum", "multipleOf"):
                x.pop(k, None)
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    walk(s)
    return s
