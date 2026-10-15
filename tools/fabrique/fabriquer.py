#!/usr/bin/env python3
"""Fabrique un module en ligne de commande (même chaîne que l'interface Streamlit).

  python3 tools/fabrique/fabriquer.py photo1.jpg photo2.jpg … [--matiere SVT] [--titre "…"] [--date 2026-11-04]
          [--sans-redaction] [--video] [--consignes "…"] [--modele production=claude-sonnet-5-5 …] [--publier]
  python3 tools/fabrique/fabriquer.py --reprendre travaux/<dossier> [--publier | --jeter]
  python3 tools/fabrique/fabriquer.py --couts

Sans --publier, le module reste dans le site local pour l'aperçu (python3 -m http.server, puis /<chemin>).
FABRIQUE_SIMULATION=1 : aucune requête à l'API (réponses de simulation/), pour tester la chaîne."""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pipeline  # noqa: E402


def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("fichiers", nargs="*")
    a.add_argument("--matiere", default="")
    a.add_argument("--titre", default="")
    a.add_argument("--date", default="", help="date de l'évaluation AAAA-MM-JJ")
    a.add_argument("--sans-redaction", action="store_true")
    a.add_argument("--video", action="store_true")
    a.add_argument("--consignes", default="")
    a.add_argument("--chemin", default="", help="compléter un module existant (ex. sciences/systeme-nerveux/)")
    a.add_argument("--modele", action="append", default=[], help="etape=modele, ex. production=claude-sonnet-5-5")
    a.add_argument("--config", default=str(pipeline.ICI / "config.yaml"))
    a.add_argument("--reprendre")
    a.add_argument("--publier", action="store_true")
    a.add_argument("--jeter", action="store_true")
    a.add_argument("--couts", action="store_true")
    o = a.parse_args()

    if o.couts:
        for l in pipeline.lire_couts():
            print(f"{l['date'][:16]}  {l['cout']:7.3f} $  {l['pages']:>2} p.  {'vidéo ' if l['video'] else '      '}"
                  f"{'(simulation) ' if l['simulation'] else ''}{l['titre']}  — " + ", ".join(f"{e['etape']}:{e['modele'].replace('claude-', '')}" for e in l["etapes"]))
        return

    if o.reprendre:
        f = pipeline.Fabrication(o.reprendre)
    else:
        if not o.fichiers:
            a.error("donner des photos ou PDF, ou --reprendre")
        f = pipeline.Fabrication.nouvelle([(p, Path(p).read_bytes()) for p in o.fichiers], {
            "matiere": o.matiere, "titre": o.titre, "date_evaluation": o.date, "redaction": not o.sans_redaction,
            "video": o.video, "indications": o.consignes, "chemin": o.chemin,
            "modeles": dict(m.split("=", 1) for m in o.modele)})
    print("Dossier :", f.dir)

    if o.jeter:
        f.jeter(); print("Module retiré du site."); return
    if f.etat.get("statut") not in ("apercu", "publie"):
        cfg = pipeline.charger_config(o.config)
        for e in f.executer(cfg):
            t = e.get("trace")
            cout = f"  [{t['modele']}, {t['usage']['input_tokens']}+{t['usage']['output_tokens']} jetons, {t['cout']:.4f} $]" if t else ""
            print(f"{'✗' if e['statut'] == 'erreur' else '·'} {e['etape']:<13} {e['message']}{cout}", flush=True)
            for p in e.get("problemes") or []:
                if p["gravite"] != "mineur":
                    print(f"      - {p['gravite']} · {p['ou']} : {p['constat']}")
        if f.etat["statut"] == "erreur":
            sys.exit(1)
    if o.publier:
        ok, log = f.publier()
        print(log)
        sys.exit(0 if ok else 1)
    print(f"\nAperçu : python3 -m http.server 8000  puis  http://localhost:8000/{f.etat['chemin']}")
    print(f"Publier : python3 tools/fabrique/fabriquer.py --reprendre {f.dir} --publier   (ou --jeter)")


if __name__ == "__main__":
    main()
