#!/usr/bin/env python3
"""Vérifie la cohérence du site avant un commit : python3 tools/check.py"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEGACY_KEYS = {"verbes-leandre-v1", "triangles-leandre-v1"}
errors = []

data = json.loads((ROOT / "modules.json").read_text(encoding="utf8"))
matieres = {m["id"] for m in data["matieres"]}
keys = {}

for m in data["modules"]:
    where = m.get("chemin", "?")
    for field in ("matiere", "chemin", "titre", "resume", "ajoute"):
        if not m.get(field):
            errors.append(f"{where} : champ « {field} » manquant")
    if m.get("matiere") not in matieres:
        errors.append(f"{where} : matière inconnue « {m.get('matiere')} »")
    if not re.fullmatch(r"[a-z0-9-]+/[a-z0-9-]+/", where):
        errors.append(f"{where} : le chemin doit être <matiere>/<module>/ (minuscules, tirets)")
        continue
    if not where.startswith(m.get("matiere", "") + "/"):
        errors.append(f"{where} : le dossier ne correspond pas à la matière")
    page = ROOT / where / "index.html"
    if not page.exists():
        errors.append(f"{where} : index.html introuvable")
        continue
    html = page.read_text(encoding="utf8")
    for needle in ('href="../../manifest.webmanifest"', 'class="site-back" href="../../"', '<html lang="fr">'):
        if needle not in html:
            errors.append(f"{where} : il manque {needle}")
    found = re.findall(r'const KEY = "([^"]+)"', html)
    if len(found) != 1:
        errors.append(f"{where} : clé localStorage (const KEY) introuvable ou multiple")
    else:
        k = found[0]
        if k not in LEGACY_KEYS and not k.startswith("leandre-"):
            errors.append(f"{where} : la clé « {k} » doit commencer par leandre-")
        if k in keys:
            errors.append(f"{where} : clé « {k} » déjà utilisée par {keys[k]}")
        keys[k] = where

# pages présentes sur le disque mais absentes du catalogue
listed = {m.get("chemin") for m in data["modules"]}
for page in ROOT.glob("*/*/index.html"):
    rel = page.parent.relative_to(ROOT).as_posix() + "/"
    if rel.startswith("tools/") or rel.startswith("."):
        continue
    if rel not in listed:
        errors.append(f"{rel} : module présent mais absent de modules.json")

if errors:
    print("\n".join("✗ " + e for e in errors))
    sys.exit(1)
print(f"✓ {len(data['modules'])} modules OK")
