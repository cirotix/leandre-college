"""Vérifications automatiques (gratuites) d'une leçon produite par un modèle.
Renvoie des problèmes au même format que la relecture : {gravite, ou, constat, correction}."""
import re
import unicodedata

import jsonschema

from schemas import LECON


def plat(s):
    s = unicodedata.normalize("NFD", str(s).lower().replace("’", "'"))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def verifier_lecon(lecon, cours=None):
    P = []

    def pb(gravite, ou, constat, correction=""):
        P.append({"gravite": gravite, "ou": ou, "constat": constat, "correction": correction})

    for e in jsonschema.Draft202012Validator(LECON).iter_errors(lecon):
        pb("bloquant", "/".join(map(str, e.absolute_path)) or "racine", f"Format : {e.message}")
    if P:
        return P

    parties = {p["id"] for p in lecon["parties"]}
    notions = {n["id"] for n in lecon["notions"]}
    if not 3 <= len(notions) <= 10:
        pb("important", "notions", f"{len(notions)} notions : il en faut 4 à 8.")
    for i, n in enumerate(lecon["notions"]):
        if n["partie"] not in parties:
            pb("bloquant", f"notions[{i}].partie", f"Partie « {n['partie']} » inconnue.", f"Une de : {sorted(parties)}")
    for cle in ("parCoeur", "cours", "vocabulaire", "vraiFaux", "chiffres", "etapes", "redaction"):
        for i, x in enumerate(lecon[cle]):
            if x["notion"] not in notions:
                pb("bloquant", f"{cle}[{i}].notion", f"Notion « {x['notion']} » inconnue.", f"Une de : {sorted(notions)}")
    for c, cl in enumerate(lecon["classements"]):
        for i, it in enumerate(cl["items"]):
            if it["notion"] not in notions:
                pb("bloquant", f"classements[{c}].items[{i}].notion", f"Notion « {it['notion']} » inconnue.")
            if it["categorie"] not in cl["categories"]:
                pb("bloquant", f"classements[{c}].items[{i}].categorie", f"« {it['categorie']} » n'est pas dans categories.")

    vues = {}
    for i, p in enumerate(lecon["parCoeur"]):
        ou = f"parCoeur[{i}]"
        if not p["motsCles"]:
            pb("important", ou + ".motsCles", "Aucun mot-clé : pas de texte à trous possible.")
        for m in p["motsCles"]:
            if m.lower() not in p["phrase"].lower():
                pb("important", ou + ".motsCles", f"« {m} » n'est pas écrit tel quel dans la phrase.", "Copier le mot exactement depuis la phrase.")
        pieges = [x for x in p["pieges"] if plat(x) != plat(p["phrase"])]
        if len(set(map(plat, pieges))) < 3:
            pb("important", ou + ".pieges", "Il faut 3 pièges différents de la phrase.")
        for j, x in enumerate(p["pieges"]):
            if abs(len(x) - len(p["phrase"])) > max(25, len(p["phrase"]) * 0.4):
                pb("mineur", f"{ou}.pieges[{j}]", "Longueur trop différente de la vraie phrase : la bonne se repère à vue.")
    for i, c in enumerate(lecon["cours"]):
        ou = f"cours[{i}]"
        q = c["question"].strip()
        if not q.endswith("?") and not q.endswith("…") and not q.endswith("...") and len(q.split()) < 7:
            pb("important", ou + ".question", f"« {q} » ressemble à un titre, pas à une question.")
        k = plat(q)
        if k in vues:
            pb("important", ou + ".question", f"Doublon de {vues[k]}.")
        vues[k] = ou
        qcm = c["qcm"]
        pieges = {plat(x) for x in qcm["pieges"]} - {plat(qcm["bonne"])}
        if len(pieges) < 3:
            pb("important", ou + ".qcm.pieges", "Il faut 3 pièges distincts de la bonne réponse.")
        if plat(qcm["bonne"]) in {plat(x) for x in qcm["pieges"]}:
            pb("bloquant", ou + ".qcm", "La bonne réponse figure aussi parmi les pièges.")
    for i, p in enumerate(lecon["parCoeur"]):
        k = plat(p["question"])
        if k in vues:
            pb("mineur", f"parCoeur[{i}].question", f"Même question que {vues[k]}.")
        vues[k] = f"parCoeur[{i}]"
    mots = {}
    for i, v in enumerate(lecon["vocabulaire"]):
        if plat(v["mot"]) in mots:
            pb("mineur", f"vocabulaire[{i}]", f"Mot déjà défini en {mots[plat(v['mot'])]}.")
        mots[plat(v["mot"])] = f"vocabulaire[{i}]"
        if len(plat(v["mot"])) > 3 and plat(v["mot"]) in plat(v["definition"]):
            pb("important", f"vocabulaire[{i}].definition", "La définition contient le mot à trouver.")
    for i, x in enumerate(lecon["chiffres"]):
        if x["valeur"] in x["pieges"]:
            pb("bloquant", f"chiffres[{i}].pieges", "La bonne valeur est parmi les pièges.")
        if any(abs(t - x["valeur"]) <= x["tolerance"] for t in x["pieges"] if t != x["valeur"]):
            pb("important", f"chiffres[{i}].pieges", "Un piège est dans la tolérance de la bonne réponse.")
    for i, e in enumerate(lecon["etapes"]):
        if len(e["liste"]) < 3:
            pb("important", f"etapes[{i}].liste", "Au moins 3 étapes.")
    for i, r in enumerate(lecon["redaction"]):
        if not 3 <= len(r["criteres"]) <= 5:
            pb("important", f"redaction[{i}].criteres", f"{len(r['criteres'])} critères : il en faut 3 à 5.")
        for j, c in enumerate(r["criteres"]):
            if c["pts"] not in (1, 2):
                pb("mineur", f"redaction[{i}].criteres[{j}].pts", "1 ou 2 points par critère.")
    if len(lecon["cours"]) + len(lecon["parCoeur"]) + len(lecon["vocabulaire"]) < 20:
        pb("important", "cours", "Moins de 20 cartes : le cours est-il entièrement couvert ?")

    # le par cœur de l'extraction doit se retrouver tel quel
    if cours:
        phrases = {plat(p["phrase"]) for p in lecon["parCoeur"]}
        for p in cours.get("par_coeur", []):
            if plat(p["phrase"]) not in phrases:
                pb("important", "parCoeur", f"Phrase à savoir absente ou modifiée : « {p['phrase']} » ({p['source']}).",
                   "L'ajouter telle quelle dans parCoeur.")
        for q in cours.get("fiche_questions", []):
            if plat(q["reponse"]) not in phrases:
                pb("important", "parCoeur", f"Réponse de la fiche absente ou modifiée : « {q['question']} » → « {q['reponse']} ».",
                   "L'ajouter dans parCoeur, question et réponse telles quelles.")
    return P


def bloquants(problemes):
    return [p for p in problemes if p["gravite"] in ("bloquant", "important")]
