#!/usr/bin/env python3
"""Vérifie la cohérence du site avant un commit : python3 tools/check.py"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEGACY_KEYS = {"verbes-leandre-v1", "triangles-leandre-v1"}
TEMPLATE = (ROOT / "lib" / "module.html").read_text(encoding="utf8")
errors = []

data = json.loads((ROOT / "modules.json").read_text(encoding="utf8"))
matieres = {m["id"] for m in data["matieres"]}
keys = {}

for m in data["modules"]:
    where = m.get("chemin", "?")
    for field in ("matiere", "chemin", "titre", "resume", "ajoute"):
        if not m.get(field):
            errors.append(f"{where} : champ « {field} » manquant")
    if not isinstance(m.get("motsCles", []), list):
        errors.append(f"{where} : motsCles doit être une liste")
    if m.get("matiere") not in matieres:
        errors.append(f"{where} : matière inconnue « {m.get('matiere')} »")
    if not re.fullmatch(r"[a-z0-9-]+/[a-z0-9-]+/", where):
        errors.append(f"{where} : le chemin doit être <matiere>/<module>/ (minuscules, tirets)")
        continue
    if not where.startswith(m.get("matiere", "") + "/"):
        errors.append(f"{where} : le dossier ne correspond pas à la matière")
    page, js = ROOT / where / "index.html", ROOT / where / "module.js"
    if not page.exists() or page.read_text(encoding="utf8") != TEMPLATE:
        errors.append(f"{where} : index.html doit être une copie exacte de lib/module.html")
    if not js.exists():
        errors.append(f"{where} : module.js introuvable")
        continue
    src = js.read_text(encoding="utf8")
    if "Revision.start(" not in src and "Revision.lesson(" not in src:
        errors.append(f"{where} : module.js doit appeler Revision.start(...) ou Revision.lesson(...)")
    found = re.findall(r'Revision\.(?:start|lesson)\(\{\s*"?key"?:\s*"([^"]+)"', src)
    if len(found) != 1:
        errors.append(f"{where} : Revision.start doit commencer par key: \"…\" (clé localStorage)")
    else:
        k = found[0]
        if k not in LEGACY_KEYS and not k.startswith("leandre-"):
            errors.append(f"{where} : la clé « {k} » doit commencer par leandre-")
        if k in keys:
            errors.append(f"{where} : clé « {k} » déjà utilisée par {keys[k]}")
        keys[k] = where
    try:
        subprocess.run(["node", "--check", str(js)], check=True, capture_output=True, text=True)
    except FileNotFoundError:
        pass
    except subprocess.CalledProcessError as e:
        errors.append(f"{where} : erreur de syntaxe dans module.js\n{e.stderr.strip()}")

listed = {m.get("chemin") for m in data["modules"]}
for page in ROOT.glob("*/*/index.html"):
    rel = page.parent.relative_to(ROOT).as_posix() + "/"
    if rel.split("/")[0] in ("lib", "tools") or rel.startswith("."):
        continue
    if rel not in listed:
        errors.append(f"{rel} : module présent mais absent de modules.json")

if errors:
    print("\n".join("✗ " + e for e in errors))
    sys.exit(1)
print(f"✓ {len(data['modules'])} modules OK")
