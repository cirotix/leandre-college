"""Film du module à partir du storyboard : gabarit tools/film/gabarit.html + tools/film/make_film.py."""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FILM = ROOT / "tools" / "film"


def source(storyboard, chemin):
    """Écrit tools/film/sources/<matiere>-<module>.html (gabarit + scénario) et renvoie son chemin."""
    g = (FILM / "gabarit.html").read_text(encoding="utf8")
    data = json.dumps(storyboard, ensure_ascii=False).replace("</", "<\\/")
    g = re.sub(r"/\*STORYBOARD\*/.*?/\*FIN\*/", lambda _: f"/*STORYBOARD*/{data}/*FIN*/", g, flags=re.S)
    dst = FILM / "sources" / (chemin.strip("/").replace("/", "-") + ".html")
    dst.write_text(g, encoding="utf8")
    return dst


def planche(src, dossier):
    r = subprocess.run([sys.executable, str(FILM / "make_film.py"), str(src), "--preview", str(dossier)],
                       cwd=ROOT, capture_output=True, text=True, timeout=600)
    if r.returncode:
        raise RuntimeError(r.stdout + r.stderr)
    return Path(dossier) / "planche.png"


def fabriquer(src, chemin, titre="Le film du chapitre"):
    """Rend film.mp4 + film.jpg dans le dossier du module ; renvoie l'objet `video` du module."""
    r = subprocess.run([sys.executable, str(FILM / "make_film.py"), str(src), "--out", str(ROOT / chemin)],
                       cwd=ROOT, capture_output=True, text=True, timeout=3600)
    if r.returncode:
        raise RuntimeError(r.stdout + r.stderr)
    ch = next((l[len("chapters: "):] for l in r.stdout.splitlines() if l.startswith("chapters: ")), "[]")
    duree = re.search(r"(\d+):(\d\d)\)", r.stdout)
    minutes = max(1, round((int(duree[1]) * 60 + int(duree[2])) / 60)) if duree else 5
    return {"src": "film.mp4", "poster": "film.jpg", "length": f"{minutes} min", "title": titre,
            "text": "Tout le chapitre en images, sans blabla. Regarde-le avant de commencer les cartes.",
            "chapters": json.loads(ch)}
