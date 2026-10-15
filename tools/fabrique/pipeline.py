"""La chaîne de fabrication d'un module, étape par étape.

    photos ─▶ extraction ─▶ production ─▶ vérifications ─▶ relecture ─▶ correction ─▶ site ─▶ tests ─▶ (vidéo) ─▶ aperçu
                                                                                                         Publier ▶ git

Chaque fabrication a son dossier travaux/<horodatage>-<titre>/ : sources, options, sortie de chaque étape (JSON), journal
des appels (jetons, coût) et état. Relancer une fabrication reprend là où elle s'était arrêtée (étapes déjà faites
sautées), ce qui évite de repayer l'extraction si la vidéo échoue, par exemple.
`executer()` est un générateur d'événements {etape, statut, message, …} lu par l'interface et par la ligne de commande.
"""
import copy
import datetime as dt
import json
import shutil
from pathlib import Path

import yaml

import api
import prompts
import schemas
import siteweb
import validation
import video

ICI = Path(__file__).resolve().parent
TRAVAUX = ICI / "travaux"
COUTS = ICI / "couts.jsonl"
JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
ETAPES = ["extraction", "production", "relecture", "correction", "storyboard"]
OPTIONS = {"matiere": "", "titre": "", "date_evaluation": "", "redaction": True, "video": False, "indications": "",
           "profil": "auto", "modeles": {}, "chemin": ""}


# ---------------------------------------------------------------- configuration
def charger_config(chemin=ICI / "config.yaml"):
    return yaml.safe_load(Path(chemin).read_text(encoding="utf8"))


def config_etape(config, nom, profil=None, surcharges=None):
    """Réglages d'une étape : défaut ← profil de la matière ← choix faits dans l'interface pour cette fabrication."""
    e = dict(config["etapes"][nom])
    e.update((config.get("profils") or {}).get(profil or "", {}).get(nom, {}) or {})
    if (surcharges or {}).get(nom):
        e["modele"] = surcharges[nom]
    return e


def date_fr(iso):
    d = dt.date.fromisoformat(iso)
    return f"{JOURS[d.weekday()]} {d.day}{'er' if d.day == 1 else ''} {MOIS[d.month - 1]}"


# ---------------------------------------------------------------- une fabrication
class Fabrication:
    def __init__(self, dossier):
        self.dir = Path(dossier)
        self.options = {**OPTIONS, **self.lire("options.json", {})}
        self.etat = self.lire("etat.json", {"statut": "nouveau", "etapes": {}, "fichiers": [], "chemin": ""})

    # ---- création, lecture
    @classmethod
    def nouvelle(cls, fichiers, options):
        """fichiers = [(nom, octets)] dans l'ordre des pages ; options = voir OPTIONS."""
        nom = dt.datetime.now().strftime("%Y%m%d-%H%M%S") + "-" + siteweb.slug(options.get("titre") or "module")
        d = TRAVAUX / nom
        (d / "sources").mkdir(parents=True)
        for i, (n, data) in enumerate(fichiers):
            (d / "sources" / f"{i + 1:02d}-{Path(n).name}").write_bytes(data)
        (d / "options.json").write_text(json.dumps({**OPTIONS, **options}, ensure_ascii=False, indent=1), encoding="utf8")
        return cls(d)

    @staticmethod
    def toutes():
        if not TRAVAUX.exists():
            return []
        return [Fabrication(d) for d in sorted(TRAVAUX.iterdir(), reverse=True) if (d / "options.json").exists()]

    def lire(self, nom, defaut=None):
        p = self.dir / nom
        return json.loads(p.read_text(encoding="utf8")) if p.exists() else defaut

    def ecrire(self, nom, data):
        (self.dir / nom).write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf8")

    def sauver(self):
        self.ecrire("etat.json", self.etat)

    def sources(self):
        return sorted((self.dir / "sources").iterdir())

    def traces(self):
        p = self.dir / "journal.jsonl"
        return [json.loads(l) for l in p.read_text(encoding="utf8").splitlines() if l.strip()] if p.exists() else []

    def cout_total(self):
        return round(sum(t.get("cout") or 0 for t in self.traces()), 4)

    @property
    def titre(self):
        return (self.lire("lecon.json") or {}).get("titre") or self.options.get("titre") or self.dir.name

    # ---- la chaîne
    def executer(self, config):
        def ev(etape, statut, message, **kw):
            self.etat["etapes"][etape] = statut
            self.sauver()
            return {"etape": etape, "statut": statut, "message": message, **kw}

        o, journal = self.options, self.dir / "journal.jsonl"
        surch = o.get("modeles") or {}
        profil = None if o.get("profil") in ("", "auto") else o["profil"]

        def appel(nom, systeme, contenu, schema):
            etape = config_etape(config, nom, profil, surch)
            return api.appeler(nom, etape, systeme, contenu, schemas.api_schema(schema), config, journal)

        self.etat["statut"] = "en cours"
        self.sauver()
        try:
            # 1. extraction
            cours = self.lire("cours.json")
            if cours is None:
                yield ev("extraction", "debut", f"Lecture de {len(self.sources())} page(s) du cahier…")
                pieces = [api.piece(p) for p in self.sources()]
                if profil is None and o.get("matiere"):
                    profil = siteweb.matiere_id(o["matiere"])
                cours, t = appel("extraction", prompts.EXTRACTION, prompts.message_extraction(pieces, o.get("indications")), schemas.COURS)
                if o.get("matiere"):
                    cours["matiere"] = o["matiere"]
                if o.get("date_evaluation"):
                    cours["date_evaluation"] = o["date_evaluation"]
                self.ecrire("cours.json", cours)
                yield ev("extraction", "fin", f"{cours['matiere']} · {cours['titre']} : {len(cours['parties'])} parties, "
                         f"{len(cours['par_coeur'])} phrases par cœur, {len(cours['vocabulaire'])} mots.", trace=t)
            if profil is None:
                profil = siteweb.matiere_id(o.get("matiere") or cours["matiere"])

            # 2. production
            lecon = self.lire("lecon_brute.json")
            if lecon is None:
                yield ev("production", "debut", "Écriture des cartes, questions et sujets…")
                lecon, t = appel("production", prompts.PRODUCTION, prompts.message_production(cours, o.get("redaction"), o.get("indications")), schemas.LECON)
                if o.get("titre"):
                    lecon["titre"] = o["titre"]
                self.ecrire("lecon_brute.json", lecon)
                yield ev("production", "fin", self.resume_lecon(lecon), trace=t)

            # 3. vérifications automatiques + relecture + correction
            final = self.lire("lecon.json")
            if final is None:
                lecon = copy.deepcopy(lecon)
                for tour in range(int(config.get("tours_correction", 1)) + 1):
                    locaux = validation.verifier_lecon(lecon, cours)
                    yield ev("verifications", "fin", f"{len(validation.bloquants(locaux))} problème(s) à corriger, "
                             f"{len(locaux) - len(validation.bloquants(locaux))} mineur(s).", problemes=locaux)
                    rel = {"problemes": [], "par_coeur_oublie": [], "note": None, "publiable": True, "resume": ""}
                    if config.get("relecture", True) and tour == 0:
                        yield ev("relecture", "debut", "Relecture par un professeur virtuel…")
                        rel, t = appel("relecture", prompts.RELECTURE, prompts.message_relecture(cours, lecon), schemas.RELECTURE)
                        self.ecrire("relecture.json", rel)
                        yield ev("relecture", "fin", f"Note {rel['note']}/10 — {rel['resume']}", trace=t, problemes=rel["problemes"])
                    a_corriger = validation.bloquants(locaux) + [p for p in rel["problemes"] if p["gravite"] in ("bloquant", "important")]
                    if not a_corriger and not rel["par_coeur_oublie"]:
                        break
                    if tour == int(config.get("tours_correction", 1)):
                        yield ev("correction", "fin", f"Il reste {len(a_corriger)} problème(s) après {tour} tour(s) : à regarder dans l'aperçu.")
                        break
                    yield ev("correction", "debut", f"Correction de {len(a_corriger)} problème(s)…")
                    corrige, t = appel("correction", prompts.CORRECTION, prompts.message_correction(lecon, a_corriger, rel["par_coeur_oublie"]), schemas.LECON)
                    lecon = corrige
                    yield ev("correction", "fin", self.resume_lecon(lecon), trace=t)
                final = lecon
                self.ecrire("lecon.json", final)
                self.ecrire("problemes.json", validation.verifier_lecon(final, cours))

            # 4. choix imposés dans l'interface (après la correction, qui pourrait les réécrire) + date de l'évaluation
            if o.get("titre"):
                final["titre"] = o["titre"]
            date = o.get("date_evaluation") or cours.get("date_evaluation")
            if date:
                try:
                    if dt.date.fromisoformat(date) >= dt.date.today():
                        final["controle"] = {"date": date, "label": date_fr(date)}
                except ValueError:
                    pass
            self.ecrire("lecon.json", final)

            # 5. vidéo (le scénario d'abord : le film se rend après l'écriture du module)
            sb = None
            if o.get("video"):
                sb = self.lire("storyboard.json")
                if sb is None:
                    yield ev("storyboard", "debut", "Scénario du film…")
                    sb, t = appel("storyboard", prompts.STORYBOARD, prompts.message_storyboard(final), schemas.STORYBOARD)
                    self.ecrire("storyboard.json", sb)
                    yield ev("storyboard", "fin", f"{len(sb['scenes'])} scènes, {sum(s['duree'] for s in sb['scenes'])} s.", trace=t)
                if self.lire("video.json"):
                    final["video"] = self.lire("video.json")

            # 6. écriture dans le site
            yield ev("site", "debut", "Écriture du module dans le site…")
            chemin, fichiers = siteweb.ecrire_module(final, o.get("matiere") or cours["matiere"],
                                                     chemin=o.get("chemin") or self.etat.get("chemin") or None,
                                                     sources=f"{len(self.sources())} page(s) du cahier, fabrique {self.dir.name}")
            self.etat.update(chemin=chemin, fichiers=sorted(set(self.etat.get("fichiers", []) + fichiers)))
            yield ev("site", "fin", f"Module écrit dans {chemin}", chemin=chemin)

            if sb is not None and not self.lire("video.json"):
                yield ev("video", "debut", "Rendu du film (quelques minutes)…")
                src = video.source(sb, chemin)
                v = video.fabriquer(src, chemin)
                self.ecrire("video.json", v)
                final["video"] = v
                self.ecrire("lecon.json", final)
                siteweb.ecrire_module(final, o.get("matiere") or cours["matiere"], chemin=chemin)
                rel_src = str(src.relative_to(siteweb.ROOT))
                self.etat["fichiers"] = sorted(set(self.etat["fichiers"] + [chemin + "film.mp4", chemin + "film.jpg", rel_src]))
                yield ev("video", "fin", f"Film de {v['length']}, {len(v['chapters'])} chapitres.")

            # 7. tests
            yield ev("tests", "debut", "Vérification du site et test du module dans Chromium…")
            captures = self.dir / "captures"
            shutil.rmtree(captures, ignore_errors=True)
            res = siteweb.verifier(chemin, captures)
            self.ecrire("tests.json", res)
            ok = all(r[1] is not False for r in res)
            yield ev("tests", "fin" if ok else "erreur", " · ".join(f"{n} : {'✓' if r is True else '✗' if r is False else '—'}" for n, r, _ in res))

            # 8. coûts
            self.enregistrer_couts(cours, final, chemin)
            self.etat["statut"] = "apercu"
            self.sauver()
            yield {"etape": "fin", "statut": "fin", "message": f"Prêt pour l'aperçu. Coût : {self.cout_total():.3f} $", "chemin": chemin}
        except Exception as e:  # noqa: BLE001 — l'erreur est montrée telle quelle dans l'interface
            self.etat["statut"] = "erreur"
            self.etat["erreur"] = f"{type(e).__name__}: {e}"
            self.sauver()
            yield {"etape": "erreur", "statut": "erreur", "message": self.etat["erreur"]}

    @staticmethod
    def resume_lecon(L):
        n = lambda k: len(L.get(k) or [])
        return (f"{n('notions')} notions · {n('parCoeur')} par cœur · {n('cours')} questions de cours · {n('vocabulaire')} mots · "
                f"{n('vraiFaux')} vrai/faux · {n('chiffres')} chiffres · {n('etapes')} enchaînements · {n('redaction')} rédactions")

    def enregistrer_couts(self, cours, lecon, chemin):
        traces = self.traces()
        ligne = {"date": dt.datetime.now().isoformat(timespec="seconds"), "travail": self.dir.name, "chemin": chemin,
                 "titre": lecon.get("titre"), "matiere": siteweb.matiere_id(self.options.get("matiere") or cours["matiere"]),
                 "pages": len(self.sources()), "video": bool(self.options.get("video")),
                 "redaction": bool(self.options.get("redaction")), "simulation": any(t.get("simulation") for t in traces),
                 "etapes": [{k: t[k] for k in ("etape", "modele", "cout", "usage", "secondes", "batch")} for t in traces],
                 "cout": self.cout_total(), "cartes": len(lecon.get("parCoeur", [])) + len(lecon.get("cours", [])) + len(lecon.get("vocabulaire", []))}
        # une ligne par fabrication : on remplace celle d'une exécution précédente
        lignes = [l for l in lire_couts() if l.get("travail") != self.dir.name] + [ligne]
        COUTS.write_text("".join(json.dumps(l, ensure_ascii=False) + "\n" for l in lignes), encoding="utf8")

    # ---- décision
    def publier(self, push=True):
        L = self.lire("lecon.json") or {}
        mat = siteweb.NOMS.get(siteweb.matiere_id(self.options.get("matiere") or (self.lire("cours.json") or {}).get("matiere", "")), "")
        msg = f"Nouveau module : {mat}, {L.get('titre', '')}\n\nFabriqué par tools/fabrique ({self.dir.name}), coût {self.cout_total():.3f} $."
        ok, log = siteweb.publier(self.etat["fichiers"], msg, push=push)
        if ok:
            self.etat["statut"] = "publie"
            self.etat["publie_le"] = dt.datetime.now().isoformat(timespec="seconds")
            self.sauver()
        return ok, log

    def jeter(self):
        """Retire le module du site (pas le dossier de travail : on peut le relancer ou le regarder plus tard)."""
        ch = self.etat.get("chemin")
        if ch and self.etat.get("statut") != "publie":
            siteweb.retirer_module(ch)
            for f in self.etat.get("fichiers", []):
                if f.startswith("tools/film/sources/"):
                    (siteweb.ROOT / f).unlink(missing_ok=True)
        self.etat["statut"] = "jete"
        self.sauver()

    def refaire(self, depuis):
        """Oublie les sorties à partir d'une étape pour la relancer (ex. « production » avec un autre modèle)."""
        ordre = ["extraction", "production", "correction", "storyboard", "video"]
        fichiers = {"extraction": ["cours.json"], "production": ["lecon_brute.json"], "correction": ["lecon.json", "relecture.json", "problemes.json"],
                    "storyboard": ["storyboard.json"], "video": ["video.json"]}
        for e in ordre[ordre.index(depuis):]:
            for f in fichiers[e]:
                (self.dir / f).unlink(missing_ok=True)
        self.etat["statut"] = "nouveau"
        self.sauver()


def lire_couts():
    if not COUTS.exists():
        return []
    return [json.loads(l) for l in COUTS.read_text(encoding="utf8").splitlines() if l.strip()]
