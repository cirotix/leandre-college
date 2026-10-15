"""Écrit un module « leçon » dans le site, lance les vérifications et publie (git)."""
import datetime as dt
import json
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COULEURS = ["hl-1", "hl-2", "hl-3"]
MATIERES = {  # libellé lu dans le cahier → identifiant du site
    "svt": "sciences", "sciences de la vie et de la terre": "sciences", "sciences": "sciences",
    "physique": "physique-chimie", "physique-chimie": "physique-chimie", "physique chimie": "physique-chimie",
    "histoire": "histoire-geo", "geographie": "histoire-geo", "histoire-geographie": "histoire-geo",
    "histoire geographie": "histoire-geo", "histoire-geo": "histoire-geo", "emc": "histoire-geo",
    "francais": "francais", "anglais": "anglais", "espagnol": "espagnol", "allemand": "allemand",
    "maths": "maths", "mathematiques": "maths", "technologie": "technologie", "latin": "latin",
}
NOMS = {"sciences": "Sciences", "physique-chimie": "Physique-chimie", "histoire-geo": "Histoire-géo", "francais": "Français",
        "anglais": "Anglais", "espagnol": "Espagnol", "allemand": "Allemand", "maths": "Maths", "technologie": "Technologie", "latin": "Latin"}


def slug(s):
    s = unicodedata.normalize("NFD", str(s).lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"\b(le|la|les|l|un|une|des|du|de|d|et|a|au|aux)\b", " ", s.replace("'", " "))
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:40].strip("-") or "module"


def matiere_id(label):
    k = slug(label).replace("-", " ")
    return MATIERES.get(k) or MATIERES.get(k.split(" ")[0]) or slug(label) or "divers"


def chemin_libre(matiere, titre):
    base = f"{matiere}/{slug(titre)}"
    chemin, i = base + "/", 2
    while (ROOT / chemin).exists():
        chemin, i = f"{base}-{i}/", i + 1
    return chemin


def module_js(lecon, key, sources):
    data = {"key": key, **{k: v for k, v in lecon.items() if k != "key"}}
    head = ("/* Module généré par la fabrique (tools/fabrique) : données seulement, le moteur est dans lib/lesson.js.\n"
            f"   Sources : {sources}.\n   Pour corriger un texte, modifier les données ci-dessous ; pour tout refaire, relancer la fabrique. */\n")
    return head + "Revision.lesson(" + json.dumps(data, ensure_ascii=False, indent=1) + ");\n"


def ecrire_module(lecon, matiere_label, chemin=None, sources="photos du cahier"):
    """Crée (ou remplace) le dossier du module et l'entrée de modules.json. Renvoie le chemin et la liste des fichiers touchés."""
    mat = matiere_id(matiere_label)
    chemin = chemin or chemin_libre(mat, lecon["titre"])
    d = ROOT / chemin
    d.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / "lib" / "module.html", d / "index.html")
    key = "leandre-" + chemin.strip("/").replace("/", "-") + "-v1"
    (d / "module.js").write_text(module_js(lecon, key, sources), encoding="utf8")
    touched = [chemin + "index.html", chemin + "module.js", "modules.json"]

    cat = json.loads((ROOT / "modules.json").read_text(encoding="utf8"))
    if not any(m["id"] == mat for m in cat["matieres"]):
        cat["matieres"].append({"id": mat, "nom": NOMS.get(mat, matiere_label.strip().capitalize()),
                                "couleur": COULEURS[len(cat["matieres"]) % 3]})
        page = ROOT / mat / "index.html"
        if not page.exists():
            src = (ROOT / "maths" / "index.html").read_text(encoding="utf8").replace("m=maths", f"m={mat}")
            page.write_text(src, encoding="utf8")
            touched.append(f"{mat}/index.html")
    entree = {"matiere": mat, "chemin": chemin, "titre": lecon["titre"], "chapitre": lecon.get("surtitre", ""),
              "resume": lecon.get("resume") or lecon.get("note") or lecon["titre"], "ajoute": dt.date.today().isoformat(),
              "motsCles": lecon.get("motsCles", [])}
    cat["modules"] = [m for m in cat["modules"] if m["chemin"] != chemin] + [entree]
    (ROOT / "modules.json").write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    return chemin, touched


def retirer_module(chemin):
    """Annule un module non publié : dossier supprimé, entrée retirée du catalogue."""
    shutil.rmtree(ROOT / chemin, ignore_errors=True)
    cat = json.loads((ROOT / "modules.json").read_text(encoding="utf8"))
    cat["modules"] = [m for m in cat["modules"] if m["chemin"] != chemin]
    (ROOT / "modules.json").write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n", encoding="utf8")


def verifier(chemin, captures=None):
    """check.py puis test_module.py (ce dernier demande Playwright + Chromium). Renvoie [(nom, ok, sortie)]."""
    out = []
    r = subprocess.run(["python3", "tools/check.py"], cwd=ROOT, capture_output=True, text=True)
    out.append(("Cohérence du site (check.py)", r.returncode == 0, (r.stdout + r.stderr).strip()))
    try:
        import playwright  # noqa: F401
    except ImportError:
        out.append(("Test du module dans Chromium", None, "Playwright n'est pas installé : pip install playwright && playwright install chromium"))
        return out
    cmd = ["python3", "tools/test_module.py", chemin] + (["--shots", str(captures)] if captures else [])
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=900)
    out.append(("Test du module dans Chromium (test_module.py)", r.returncode == 0, (r.stdout + r.stderr).strip()[-3000:]))
    return out


def publier(fichiers, message, push=True):
    """git add des fichiers du module, commit, push. Renvoie la sortie de git."""
    def git(*a):
        return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True)
    log = []
    r = git("add", "--", *fichiers); log.append(r.stdout + r.stderr)
    r = git("commit", "-m", message); log.append(r.stdout + r.stderr)
    if r.returncode != 0:
        return False, "\n".join(log)
    if push:
        r = git("pull", "--rebase", "--autostash"); log.append(r.stdout + r.stderr)
        r = git("push"); log.append(r.stdout + r.stderr)
        if r.returncode != 0:
            return False, "\n".join(log)
    return True, "\n".join(log)
