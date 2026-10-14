#!/usr/bin/env python3
"""Teste un module dans un vrai navigateur (Playwright + Chromium) :
     python3 tools/test_module.py <matiere>/<module>/ [--shots DOSSIER]

Vérifie, sans rien savoir du contenu :
  - la page se charge sans erreur JavaScript ;
  - Cartes : chaque carte a un recto et un verso ; une série se parcourt jusqu'au bilan (Je savais / À revoir) ;
  - Quiz : 300 quiz générés, chaque question a exactement une bonne réponse et des options distinctes ;
  - Contrôle : 300 contrôles générés, chaque item est valide (choix ou champs), a un `review`, une `unit`,
    un `redo()` qui renvoie un item valide, et les champs refusent une réponse absurde ;
  - parcours complet à l'écran : cartes, quiz de 10, contrôle jusqu'à la note, « Refaire mes erreurs » ;
  - pour chaque filtre « Je révise », quiz et contrôle restent générables.
Avec --shots, enregistre des captures (accueil, carte, quiz, contrôle) en largeur tablette et téléphone.
Code de sortie 0 si tout va bien."""
import asyncio, functools, http.server, json, sys, threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args:
    sys.exit(__doc__)
MOD = args[0].strip("/") + "/"
SHOTS = Path(sys.argv[sys.argv.index("--shots") + 1]) if "--shots" in sys.argv else None

try:
    from playwright.async_api import async_playwright
except ImportError:
    sys.exit("Playwright manquant : pip install playwright (Chromium est déjà installé dans l'environnement Claude).")

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
Handler = functools.partial(Quiet, directory=str(ROOT))
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_address[1]}/"

INVARIANTS = r"""() => {
  const {M, R} = window.__module, bad = [], add = m => { if (bad.length < 15 && !bad.includes(m)) bad.push(m); };
  const strip = s => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 70);
  const checkOpts = (opts, where) => {
    if (!Array.isArray(opts) || opts.length < 2) return add(`${where} : moins de 2 options`);
    if (opts.filter(o => o.ok).length !== 1) add(`${where} : ${opts.filter(o => o.ok).length} bonnes réponses`);
    if (new Set(opts.map(o => String(o.t))).size !== opts.length) add(`${where} : options en double`);
  };
  const checkItem = (it, where) => {
    if (!it.unit || !R.unit(it.unit.id)) add(`${where} : unit absente ou inconnue`);
    if (!it.review) add(`${where} : review manquant`);
    if (!it.prompt && !it.given) add(`${where} : ni prompt ni given`);
    if (it.kind === "choice") checkOpts(it.opts, `${where} « ${strip(it.prompt)} »`);
    else if (it.kind === "fields") {
      if (!it.fields || !it.fields.length) add(`${where} : aucun champ`);
      for (const f of it.fields || []) {
        const r = f.check("zz qq 99999 ##");
        if (!r || typeof r.ok !== "boolean") add(`${where} : check() doit renvoyer {ok, fix}`);
        else if (r.ok) add(`${where} « ${strip(it.prompt)} » : une réponse absurde est acceptée`);
        if (r && !r.ok && !r.fix) add(`${where} : pas de correction (fix) quand c'est faux`);
      }
    } else add(`${where} : kind inconnu « ${it.kind} »`);
  };
  const stats = {cards: 0, quiz: 0, control: 0, filters: []};
  const pools = [["tout", R.units]];
  Object.keys(M.groups).forEach(g => { const p = R.units.filter(u => u.group === g); if (p.length) pools.push([g, p]); });
  for (const [name, pool] of pools) {
    const cards = M.cards(pool, R);
    if (!cards.length) add(`filtre ${name} : aucune carte`);
    cards.forEach((c, i) => { if (!c.front || !c.back) add(`carte ${i} : recto ou verso vide`); });
    if (name === "tout") stats.cards = cards.length;
    const runs = name === "tout" ? 300 : 40;
    for (let r = 0; r < runs; r++) {
      for (let i = 0; i < (M.quiz.count || 10); i++) {
        const q = M.quiz.make(pool, R, i); stats.quiz++;
        checkOpts(q.opts, `quiz « ${strip(q.prompt)} »`);
        if (!q.review) add("quiz : review manquant");
        if (!q.unit) add("quiz : unit manquante");
      }
      const items = M.control.build(pool, R);
      if (!items.length) add(`filtre ${name} : contrôle vide`);
      for (const it of items) {
        stats.control++; checkItem(it, "contrôle");
        if (r < 20 && typeof it.redo === "function") checkItem(it.redo(), "redo()");
        else if (typeof it.redo !== "function") add("contrôle : redo() manquant");
      }
    }
    stats.filters.push(name);
  }
  return {bad, stats};
}"""

async def ui_pass(pg, shots_prefix=None):
    async def shot(name):
        if shots_prefix: await pg.screenshot(path=f"{shots_prefix}-{name}.png", full_page=True)
    await pg.goto(BASE + MOD); await pg.wait_for_selector(".mode")
    await shot("accueil")
    await pg.click("[data-act=cards]"); await pg.click("#flip"); await pg.wait_for_timeout(650)
    await shot("carte")
    # une série de cartes : « À revoir » / « Je savais » en alternance (la carte est déjà retournée), jusqu'au bilan
    for k in range(12):
        if not await pg.query_selector("#flip"): break
        if k: await pg.click("#flip")
        await pg.click(f"[data-act=rate][data-v='{k % 2}']")
    assert await pg.query_selector(".tally"), "la série de cartes ne mène pas au bilan"
    again = await pg.query_selector("[data-act=cagain]")
    if again:
        await again.click(); assert await pg.query_selector("#flip"), "« Revoir les cartes » ne relance pas"
    await pg.click("[data-act=home]"); await pg.click("[data-act=quiz]")
    for i in range(await pg.evaluate("window.__module.M.quiz.count || 10")):
        await pg.click("[data-act=answer]")
        if i == 0: await shot("quiz")
        await pg.click("#qnext")
    assert await pg.query_selector(".grade"), "le quiz ne mène pas à la note"
    await pg.click("[data-act=home]"); await pg.click("[data-act=control]"); await pg.click("[data-act=cstart]")
    shot_done = False
    for _ in range(200):
        if not await pg.query_selector("#cform"): break
        if await pg.query_selector("#c-0"):
            k = 0
            while await pg.query_selector(f"#c-{k}"):
                await pg.fill(f"#c-{k}", "test"); k += 1
            await pg.click("#cbtn")
        else:
            await pg.click("[data-act=canswer]")
        if not shot_done: await shot("controle"); shot_done = True
        await pg.click("#cbtn")
    assert await pg.query_selector(".grade"), "le contrôle ne mène pas à la note"
    retry = await pg.query_selector("[data-act=cretry]")
    if retry:
        await retry.click(); assert await pg.query_selector("#cform"), "« Refaire mes erreurs » ne relance pas"

async def main():
    meta = json.loads((ROOT / "modules.json").read_text(encoding="utf8"))
    if MOD not in [m["chemin"] for m in meta["modules"]]:
        print(f"✗ {MOD} absent de modules.json"); return 1
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errors = []
        for label, vp in (("tablette", {"width": 820, "height": 1180}), ("telephone", {"width": 390, "height": 844})):
            pg = await b.new_page(viewport=vp)
            pg.on("pageerror", lambda e: errors.append(str(e)))
            prefix = None
            if SHOTS:
                SHOTS.mkdir(parents=True, exist_ok=True); prefix = str(SHOTS / label)
            await ui_pass(pg, prefix)
            if label == "tablette":
                res = await pg.evaluate(INVARIANTS)
            await pg.close()
        await b.close()
    s = res["stats"]
    print(f"Cartes : {s['cards']} · questions de quiz testées : {s['quiz']} · items de contrôle testés : {s['control']} · filtres : {', '.join(s['filters'])}")
    problems = res["bad"] + [f"erreur JS : {e}" for e in errors]
    if problems:
        print("\n".join("✗ " + x for x in problems)); return 1
    print("✓ module OK" + (f" — captures dans {SHOTS}" if SHOTS else ""))
    return 0

sys.exit(asyncio.run(main()))
