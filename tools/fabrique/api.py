"""Appels à l'API Claude (Messages et Batch), sans SDK : seulement `requests`.

- Sortie JSON contrainte par un schéma (output_config.format), relue et renvoyée en dict.
- Chaque appel renvoie aussi l'usage (jetons, cache) et son coût en dollars, d'après les prix de config.yaml.
- Mode simulation (FABRIQUE_SIMULATION=1 ou simulation: true) : aucune requête, les réponses viennent de
  simulation/<etape>.json et l'usage est estimé ; sert à tester la chaîne et l'interface sans clé ni dépense.
"""
import base64
import io
import json
import os
import time
from pathlib import Path

import requests

URL = "https://api.anthropic.com/v1"
ICI = Path(__file__).resolve().parent
VERSION = "2023-06-01"


class ErreurAPI(RuntimeError):
    pass


# ---------- pièces jointes ----------
def piece(chemin, max_cote=1568):
    """Photo → bloc image (réduite : au-delà de ~1568 px l'API réduit de toute façon et facture plus) ; PDF → bloc document."""
    p = Path(chemin)
    data = p.read_bytes()
    if p.suffix.lower() == ".pdf":
        return {"type": "document", "source": {"type": "base64", "media_type": "application/pdf",
                                                "data": base64.b64encode(data).decode()}}
    try:
        from PIL import Image, ImageOps
        Image.MAX_IMAGE_PIXELS = None
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
        im.thumbnail((max_cote, max_cote))
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=85)
        data, mt = buf.getvalue(), "image/jpeg"
    except ImportError:
        mt = {".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}.get(p.suffix.lower(), "image/jpeg")
    return {"type": "image", "source": {"type": "base64", "media_type": mt, "data": base64.b64encode(data).decode()}}


# ---------- coûts ----------
def cout(usage, modele, prix, batch=False):
    """Coût en dollars d'un appel. prix = section « prix » de config.yaml."""
    p = prix.get(modele)
    if not p:
        return None
    entree, sortie = p["entree"] / 1e6, p["sortie"] / 1e6
    c = (usage.get("input_tokens", 0) * entree
         + usage.get("cache_creation_input_tokens", 0) * entree * p.get("cache_ecriture", 1.25)
         + usage.get("cache_read_input_tokens", 0) * entree * p.get("cache_lecture", 0.1)
         + usage.get("output_tokens", 0) * sortie)
    return round(c * (prix.get("remise_batch", 0.5) if batch else 1), 6)


# ---------- appel ----------
def _corps(etape, systeme, contenu, schema):
    corps = {"model": etape["modele"], "max_tokens": int(etape.get("max_tokens", 16000)),
             # le système est mis en cache : il est identique d'un module à l'autre pour une même étape
             "system": [{"type": "text", "text": systeme, "cache_control": {"type": "ephemeral"}}],
             "messages": [{"role": "user", "content": contenu}],
             "output_config": {"format": {"type": "json_schema", "schema": schema}}}
    if etape.get("temperature") is not None:
        corps["temperature"] = etape["temperature"]
    corps.update(etape.get("extra") or {})  # pour essayer un paramètre sans toucher au code (thinking, effort…)
    return corps


def _lire(message):
    if message.get("stop_reason") == "max_tokens":
        raise ErreurAPI("Réponse coupée : augmenter max_tokens pour cette étape dans la configuration.")
    if message.get("stop_reason") == "refusal":
        raise ErreurAPI("Le modèle a refusé de répondre.")
    texte = next((b["text"] for b in message.get("content", []) if b.get("type") == "text"), None)
    if texte is None:
        raise ErreurAPI("Réponse sans texte.")
    try:
        return json.loads(texte)
    except json.JSONDecodeError as e:
        raise ErreurAPI(f"JSON illisible : {e}") from e


def _entetes():
    cle = os.environ.get("ANTHROPIC_API_KEY")
    if not cle:
        raise ErreurAPI("Variable d'environnement ANTHROPIC_API_KEY absente (ou lancer en simulation).")
    return {"x-api-key": cle, "anthropic-version": VERSION, "content-type": "application/json"}


def _post(chemin, corps, essais=5):
    attente = 5
    for i in range(essais):
        try:
            r = requests.post(f"{URL}/{chemin}", headers=_entetes(), json=corps, timeout=600)
        except requests.RequestException as e:
            if i == essais - 1:
                raise ErreurAPI(f"Réseau : {e}") from e
        else:
            if r.status_code == 200:
                return r.json()
            if r.status_code not in (429, 500, 502, 503, 529) or i == essais - 1:
                raise ErreurAPI(f"API {r.status_code} : {r.text[:600]}")
            attente = float(r.headers.get("retry-after") or attente)
        time.sleep(attente)
        attente = min(attente * 2, 120)


def simulation_active(config):
    return bool(config.get("simulation")) or os.environ.get("FABRIQUE_SIMULATION") == "1"


SIMULATION = {"extraction": "cours", "production": "lecon", "correction": "lecon", "relecture": "relecture", "storyboard": "storyboard"}


def _simuler(nom, corps):
    data = json.loads((ICI / "simulation" / f"{SIMULATION.get(nom, nom)}.json").read_text(encoding="utf8"))
    blocs = corps["messages"][0]["content"]
    texte = sum(len(b.get("text", "")) for b in blocs) + len(corps["system"][0]["text"])
    n_img = sum(1 for b in blocs if b.get("type") in ("image", "document"))
    usage = {"input_tokens": texte // 3 + 1600 * n_img,  # ~1600 jetons par photo de 1568 px
             "output_tokens": len(json.dumps(data, ensure_ascii=False)) // 3,
             "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0}
    time.sleep(0.3)
    return data, usage


def appeler(nom, etape, systeme, contenu, schema, config, journal=None):
    """Un appel complet. nom = nom de l'étape (extraction, production…), etape = sa config (modele, max_tokens…).
    Renvoie (données, trace) ; trace = {etape, modele, usage, cout, secondes, batch, simulation}."""
    corps = _corps(etape, systeme, contenu, schema)
    t0, batch = time.time(), bool(etape.get("batch", config.get("batch")))
    if simulation_active(config):
        data, usage = _simuler(nom, corps)
        batch = False
    elif batch:
        message = _batch(corps, config)
        usage, data = message.get("usage", {}), _lire(message)
    else:
        message = _post("messages", corps)
        usage, data = message.get("usage", {}), _lire(message)
    usage = {k: usage.get(k, 0) or 0 for k in ("input_tokens", "output_tokens", "cache_creation_input_tokens", "cache_read_input_tokens")}
    trace = {"etape": nom, "modele": etape["modele"], "usage": usage, "batch": batch,
             "cout": cout(usage, etape["modele"], config.get("prix", {}), batch),
             "secondes": round(time.time() - t0, 1), "simulation": simulation_active(config)}
    if journal:
        with open(journal, "a", encoding="utf8") as f:
            f.write(json.dumps(trace, ensure_ascii=False) + "\n")
    return data, trace


def _batch(corps, config):
    """API Batch : moitié prix, mais la réponse peut prendre de quelques minutes à quelques heures."""
    lot = _post("messages/batches", {"requests": [{"custom_id": "fabrique", "params": corps}]})
    attente, limite = 10, time.time() + float(config.get("batch_attente_max", 3 * 3600))
    while True:
        time.sleep(attente)
        r = requests.get(f"{URL}/messages/batches/{lot['id']}", headers=_entetes(), timeout=60)
        etat = r.json()
        if etat.get("processing_status") == "ended":
            break
        if time.time() > limite:
            raise ErreurAPI(f"Lot {lot['id']} toujours en cours : relancer plus tard ou désactiver le mode batch.")
        attente = min(attente * 1.5, 60)
    res = requests.get(etat["results_url"], headers=_entetes(), timeout=120)
    for ligne in res.text.splitlines():
        r = json.loads(ligne)
        if r["result"]["type"] == "succeeded":
            return r["result"]["message"]
        raise ErreurAPI(f"Lot en échec : {json.dumps(r['result'], ensure_ascii=False)[:600]}")
    raise ErreurAPI("Lot vide.")
