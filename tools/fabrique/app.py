"""Fabrique de modules — interface.  Lancer depuis la racine du dépôt :

    pip install -r tools/fabrique/requirements.txt
    export ANTHROPIC_API_KEY=…          (ou la coller dans la barre latérale, gardée en mémoire seulement)
    streamlit run tools/fabrique/app.py
"""
import datetime as dt
import functools
import http.server
import json
import os
import sys
import threading
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pipeline  # noqa: E402
import siteweb  # noqa: E402

st.set_page_config(page_title="Fabrique de modules", page_icon="📚", layout="wide")
CONFIG = pipeline.ICI / "config.yaml"
PORT = int(os.environ.get("FABRIQUE_PORT_APERCU", "8765"))
STATUTS = {"nouveau": "⚪ nouveau", "en cours": "🟡 en cours", "erreur": "🔴 erreur", "apercu": "🔵 à valider",
           "publie": "🟢 publié", "jete": "⚫ jeté"}


@st.cache_resource
def serveur_apercu():
    """Petit serveur HTTP sur le dépôt, pour voir le module comme sur l'iPad (même code, mêmes fichiers)."""
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def end_headers(self):
            self.send_header("Cache-Control", "no-store")
            super().end_headers()
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(H, directory=str(siteweb.ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://localhost:{PORT}/"


def config():
    return pipeline.charger_config(CONFIG)


def euros(d, cfg):
    return f"{d:.3f} $ · {d * cfg.get('euro_par_dollar', 0.92):.3f} €"


# ---------------------------------------------------------------- barre latérale
cfg = config()
with st.sidebar:
    st.title("📚 Fabrique")
    st.caption("Photos du cahier → module de révision en ligne.")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        cle = st.text_input("Clé API Anthropic", type="password", help="Gardée en mémoire le temps de la session, jamais écrite sur le disque.")
        if cle:
            os.environ["ANTHROPIC_API_KEY"] = cle.strip()
            st.rerun()
    else:
        st.success("Clé API présente")
    simu = st.toggle("Simulation (aucun appel payant)", value=pipeline.api.simulation_active(cfg),
                     help="Réponses lues dans tools/fabrique/simulation/ : pour tester la chaîne et l'interface.")
    os.environ["FABRIQUE_SIMULATION"] = "1" if simu else "0"
    base = serveur_apercu()
    st.markdown(f"Aperçu local du site : [{base}]({base})")
    total = sum(l["cout"] for l in pipeline.lire_couts() if not l.get("simulation"))
    st.metric("Dépensé en tout", f"{total:.2f} $")

tab_new, tab_list, tab_cost, tab_models = st.tabs(["➕ Nouveau module", "🗂 Fabrications", "💶 Coûts", "⚙️ Modèles"])


def derouler(f):
    """Exécute la chaîne en affichant chaque étape au fil de l'eau."""
    with st.status("Fabrication en cours…", expanded=True) as box:
        for e in f.executer(config()):
            t = e.get("trace")
            extra = f" — *{t['modele']}, {t['usage']['input_tokens']:,} + {t['usage']['output_tokens']:,} jetons, {t['cout']:.4f} $*" if t and t.get("cout") is not None else ""
            icone = {"debut": "⏳", "fin": "✅", "erreur": "❌"}.get(e["statut"], "•")
            st.write(f"{icone} **{e['etape']}** — {e['message']}{extra}")
            graves = [p for p in e.get("problemes") or [] if p["gravite"] != "mineur"]
            if graves:
                st.caption("\n".join(f"- {p['gravite']} · `{p['ou']}` : {p['constat']}" for p in graves[:12]))
        ok = f.etat["statut"] == "apercu"
        box.update(label="Prêt : à regarder dans l'onglet Fabrications" if ok else "La fabrication s'est arrêtée",
                   state="complete" if ok else "error")
    st.session_state["courante"] = f.dir.name


# ---------------------------------------------------------------- nouveau module
with tab_new:
    st.header("Nouveau module")
    fichiers = st.file_uploader("Photos ou PDF du cahier (dans l'ordre des pages : elles sont triées par nom)",
                                type=["jpg", "jpeg", "png", "webp", "pdf"], accept_multiple_files=True)
    if fichiers:
        fichiers = sorted(fichiers, key=lambda x: x.name)
        imgs = [x for x in fichiers if not x.name.lower().endswith(".pdf")]
        if imgs:
            st.image([x for x in imgs[:12]], width=110, caption=[x.name for x in imgs[:12]])
    catalogue = json.loads((siteweb.ROOT / "modules.json").read_text(encoding="utf8"))
    c1, c2, c3 = st.columns(3)
    noms = ["Détecter dans le cahier"] + sorted(set(siteweb.NOMS.values()))
    mat = c1.selectbox("Matière", noms)
    titre = c2.text_input("Titre (facultatif)", placeholder="lu dans le cahier si vide")
    avec_date = c3.checkbox("Date de l'évaluation connue")
    date = c3.date_input("Date", value=dt.date.today() + dt.timedelta(days=14), format="DD/MM/YYYY") if avec_date else None
    c1, c2, c3 = st.columns(3)
    redac = c1.checkbox("Sujets de rédaction (corrigés par l'IA)", value=True)
    vid = c2.checkbox("Film animé de 5 min", value=False, help="Ajoute un scénario (~0,03 $) et quelques minutes de rendu sur cette machine.")
    existants = {"— nouveau module —": ""} | {f"{m['titre']} ({m['chemin']})": m["chemin"] for m in catalogue["modules"]}
    cible = c3.selectbox("Compléter un module existant", list(existants), help="Garde le chemin et la progression ; le contenu est refait.")
    consignes = st.text_area("Consignes supplémentaires (facultatif)", placeholder="Ex. : la fiche de révision est la dernière photo ; insister sur les dates ; pas de rédaction sur la partie 3…")
    with st.expander("Modèles pour cette fabrication"):
        st.caption("Par défaut : la configuration (onglet Modèles), avec le profil de la matière.")
        prof = siteweb.matiere_id(mat) if mat != noms[0] else ""
        choix = {}
        cols = st.columns(len(pipeline.ETAPES))
        for col, etape in zip(cols, pipeline.ETAPES):
            defaut = pipeline.config_etape(cfg, etape, prof)["modele"]
            opts = [f"défaut ({defaut.replace('claude-', '')})"] + cfg.get("modeles", [])
            v = col.selectbox(etape, opts, key=f"m-{etape}")
            if v != opts[0]:
                choix[etape] = v
    if st.button("Fabriquer le module", type="primary", disabled=not fichiers):
        f = pipeline.Fabrication.nouvelle([(x.name, x.getvalue()) for x in fichiers], {
            "matiere": "" if mat == noms[0] else mat, "titre": titre.strip(), "date_evaluation": date.isoformat() if date else "",
            "redaction": redac, "video": vid, "indications": consignes.strip(), "chemin": existants[cible], "modeles": choix})
        derouler(f)


# ---------------------------------------------------------------- fabrications
with tab_list:
    travaux = pipeline.Fabrication.toutes()
    if not travaux:
        st.info("Aucune fabrication pour l'instant.")
    else:
        noms = [t.dir.name for t in travaux]
        cour = st.session_state.get("courante")
        idx = noms.index(cour) if cour in noms else 0
        sel = st.selectbox("Fabrication", noms, index=idx,
                           format_func=lambda n: f"{STATUTS.get(pipeline.Fabrication(pipeline.TRAVAUX / n).etat.get('statut'), '?')} · {n}")
        f = pipeline.Fabrication(pipeline.TRAVAUX / sel)
        L, C, R = f.lire("lecon.json") or {}, f.lire("cours.json") or {}, f.lire("relecture.json")
        st.subheader(f.titre)
        a, b, c, d = st.columns(4)
        a.metric("Statut", STATUTS.get(f.etat.get("statut"), "?"))
        b.metric("Coût", f"{f.cout_total():.3f} $")
        c.metric("Cartes", len(L.get("parCoeur", [])) + len(L.get("cours", [])) + len(L.get("vocabulaire", [])))
        d.metric("Relecture", f"{R['note']}/10" if R else "—")
        if f.etat.get("erreur") and f.etat.get("statut") == "erreur":
            st.error(f.etat["erreur"])

        ch = f.etat.get("chemin")
        statut = f.etat.get("statut")
        b1, b2, b3, b4 = st.columns(4)
        if statut == "apercu":
            if b1.button("✅ Publier (commit + push)", type="primary"):
                ok, log = f.publier()
                (st.success if ok else st.error)("Publié : en ligne d'ici une à deux minutes." if ok else "Échec de git")
                st.code(log)
            if b2.button("🗑 Jeter"):
                f.jeter()
                st.rerun()
        if statut in ("erreur", "nouveau", "en cours"):
            if b1.button("▶️ Reprendre", type="primary"):
                derouler(f)
        if statut in ("apercu", "erreur", "jete"):
            depuis = b3.selectbox("Refaire à partir de", ["production", "correction", "extraction", "storyboard", "video"], key="depuis")
            modele = b3.selectbox("avec le modèle", ["(inchangé)"] + cfg.get("modeles", []), key="avec")
            if b4.button("🔁 Refaire"):
                if modele != "(inchangé)":
                    f.options.setdefault("modeles", {})[{"video": "storyboard"}.get(depuis, depuis)] = modele
                    f.ecrire("options.json", f.options)
                f.refaire(depuis)
                derouler(f)

        t_apercu, t_verif, t_contenu, t_couts = st.tabs(["👀 Aperçu", "🔎 À vérifier", "📝 Contenu", "💶 Coût détaillé"])
        with t_apercu:
            if ch and statut in ("apercu", "publie"):
                st.markdown(f"[Ouvrir dans un onglet]({base}{ch}) · en ligne après publication : https://leandre.cirotteau.info/{ch}")
                components.iframe(f"{base}{ch}", height=900, scrolling=True)
            caps = sorted((f.dir / "captures").glob("*.png")) if (f.dir / "captures").exists() else []
            if caps:
                st.caption("Captures du test automatique")
                st.image([str(p) for p in caps], width=260, caption=[p.stem for p in caps])
        with t_verif:
            for nom, ok, sortie in f.lire("tests.json") or []:
                (st.success if ok else st.warning if ok is None else st.error)(nom)
                if not ok:
                    st.code(sortie[-2000:])
            if C.get("erreurs_cahier"):
                st.markdown("**Erreurs relevées dans le cahier** (la version correcte est dans le module) :")
                st.markdown("\n".join(f"- {e['constat']} → *{e['correction']}*" for e in C["erreurs_cahier"]))
            if C.get("doutes") or C.get("photos_illisibles"):
                st.markdown("**Doutes de la lecture :**")
                st.markdown("\n".join(f"- {d}" for d in C.get("doutes", []) + C.get("photos_illisibles", [])))
            pbs = f.lire("problemes.json") or []
            if R:
                st.markdown(f"**Relecture** ({R['note']}/10) : {R['resume']}")
            if pbs:
                st.markdown("**Problèmes restants** (vérifications automatiques) :")
                st.dataframe([{k: p[k] for k in ("gravite", "ou", "constat")} for p in pbs], use_container_width=True, hide_index=True)
            if C.get("par_coeur"):
                st.markdown(f"**Le « par cœur » retenu** ({len(C['par_coeur'])} phrases) :")
                st.dataframe([{"phrase": p["phrase"], "source": p["source"], "pourquoi": p["indice"]} for p in C["par_coeur"]],
                             use_container_width=True, hide_index=True)
        with t_contenu:
            if L:
                st.caption(pipeline.Fabrication.resume_lecon(L))
                for cle, cols in [("parCoeur", ["notion", "question", "phrase", "motsCles"]), ("cours", ["notion", "question", "reponse"]),
                                  ("vocabulaire", ["notion", "mot", "definition"]), ("vraiFaux", ["notion", "affirmation", "vrai"]),
                                  ("chiffres", ["notion", "question", "valeur", "unite"]), ("redaction", ["titre", "consigne", "modele"])]:
                    if L.get(cle):
                        with st.expander(f"{cle} ({len(L[cle])})"):
                            st.dataframe([{k: (", ".join(x[k]) if isinstance(x.get(k), list) else x.get(k)) for k in cols} for x in L[cle]],
                                         use_container_width=True, hide_index=True)
                st.download_button("Télécharger lecon.json", json.dumps(L, ensure_ascii=False, indent=1), "lecon.json")
        with t_couts:
            tr = f.traces()
            if tr:
                st.dataframe([{"étape": t["etape"], "modèle": t["modele"], "entrée": t["usage"]["input_tokens"],
                               "sortie": t["usage"]["output_tokens"], "cache lu": t["usage"]["cache_read_input_tokens"],
                               "coût $": t["cout"], "secondes": t["secondes"], "simulation": t.get("simulation")} for t in tr],
                             use_container_width=True, hide_index=True)
                st.write("Total :", euros(f.cout_total(), cfg))


# ---------------------------------------------------------------- coûts
with tab_cost:
    st.header("Coûts par module")
    lignes = pipeline.lire_couts()
    voir_simu = st.checkbox("Inclure les simulations", value=False)
    lignes = [l for l in lignes if voir_simu or not l.get("simulation")]
    if not lignes:
        st.info("Rien encore. Les coûts s'enregistrent à la fin de chaque fabrication (tools/fabrique/couts.jsonl, hors dépôt).")
    else:
        combo = lambda l: " / ".join(f"{e['etape'][:5]}:{e['modele'].replace('claude-', '')}" for e in l["etapes"])
        st.dataframe([{"date": l["date"][:16].replace("T", " "), "module": l["titre"], "matière": l["matiere"], "pages": l["pages"],
                       "vidéo": "oui" if l["video"] else "", "cartes": l.get("cartes"), "coût $": l["cout"],
                       "coût €": round(l["cout"] * cfg.get("euro_par_dollar", 0.92), 4), "modèles": combo(l)} for l in reversed(lignes)],
                     use_container_width=True, hide_index=True)
        n, tot = len(lignes), sum(l["cout"] for l in lignes)
        a, b, c = st.columns(3)
        a.metric("Modules", n)
        b.metric("Total", f"{tot:.2f} $")
        c.metric("Moyenne par module", f"{tot / n:.3f} $")
        st.subheader("Moyenne par étape et par modèle")
        agg = {}
        for l in lignes:
            for e in l["etapes"]:
                k = (e["etape"], e["modele"])
                s = agg.setdefault(k, [0, 0.0])
                s[0] += 1
                s[1] += e["cout"] or 0
        st.dataframe([{"étape": k[0], "modèle": k[1], "appels": v[0], "coût moyen $": round(v[1] / v[0], 4)} for k, v in sorted(agg.items())],
                     use_container_width=True, hide_index=True)


# ---------------------------------------------------------------- modèles
with tab_models:
    st.header("Modèles et réglages")
    st.markdown("Un modèle par étape, des **profils** par matière pour comparer (ex. Sonnet pour la production en histoire), "
                "les prix pour le calcul des coûts. Chaque fabrication peut aussi choisir ses modèles à la volée.")
    st.dataframe([{"étape": e, "modèle par défaut": cfg["etapes"][e]["modele"], "max_tokens": cfg["etapes"][e].get("max_tokens"),
                   **{f"profil {p}": (cfg["profils"][p] or {}).get(e, {}).get("modele", "") for p in (cfg.get("profils") or {})}}
                  for e in pipeline.ETAPES], use_container_width=True, hide_index=True)
    texte = st.text_area("config.yaml", CONFIG.read_text(encoding="utf8"), height=520)
    if st.button("Enregistrer la configuration"):
        try:
            neuf = yaml.safe_load(texte)
            assert all(e in neuf["etapes"] and "modele" in neuf["etapes"][e] for e in pipeline.ETAPES), "chaque étape doit avoir un modèle"
            CONFIG.write_text(texte, encoding="utf8")
            st.success("Enregistré.")
        except Exception as e:  # noqa: BLE001
            st.error(f"Configuration invalide : {e}")
