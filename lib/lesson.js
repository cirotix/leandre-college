/* Leçon pilotée par les données : Revision.lesson(D) construit cartes, quiz, contrôle et rédaction à partir d'un objet
   de données (produit par la fabrique, tools/fabrique/, ou écrit à la main). Schéma : LECON dans tools/fabrique/schemas.py.
   Textes en clair ; **gras** et paragraphes (ligne vide) autorisés dans document, consigne, reponse, explication. */
(() => {
"use strict";
const {esc, shuffle, pick, fold, fmt, parseNum} = Revision;

const md = s => esc(s || "").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const para = s => String(s || "").split(/\n\s*\n/).map(p => `<p>${md(p).replace(/\n/g, "<br>")}</p>`).join("");
const nl = s => md(s).replace(/\n/g, "<br>");
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
/* saisie tolérante : accents, majuscules, articles, pluriels et accords, apostrophes typographiques */
const norm = s => fold(s).replace(/[’']/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\b(l|le|la|les|un|une|des|d|de|du|au|aux)\b/g, " ").replace(/\s+/g, " ").trim();
const stem = s => s.split(" ").map(w => w.replace(/(aux|eaux|es|e|s|x)$/, "")).join(" ");
const wordOk = (list, ans) => { const a = norm(ans); return !!a && list.some(k => { const kk = norm(k); return !!kk && (a === kk || stem(a) === stem(kk)); }); };
const WORDNUM = {zero: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, cent: 100, mille: 1000};
const roman = r => /^[ivxlcdm]+$/.test(r) ? [...r].reduce((a, c, i, s) => { const V = {i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000}; return a + (V[c] < (V[s[i + 1]] || 0) ? -V[c] : V[c]); }, 0) : NaN;

function lesson(D){
  const L = k => Array.isArray(D[k]) ? D[k] : [];
  const parts = L("parties"), notions = L("notions");
  const UNITS = notions.map(n => ({id: n.id, group: String(n.partie), name: n.nom, sub: n.detail || "", tag: n.nom}));
  const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));
  const okN = n => !!UBY[n];
  const PC = L("parCoeur").filter(p => okN(p.notion));
  const COURS = L("cours").filter(c => okN(c.notion));
  const VOC = L("vocabulaire").filter(v => okN(v.notion));
  const VF = L("vraiFaux").filter(v => okN(v.notion));
  const NUM = L("chiffres").filter(x => okN(x.notion) && isFinite(x.valeur));
  const ETA = L("etapes").filter(e => okN(e.notion) && (e.liste || []).length >= 3);
  const CLS = L("classements").filter(c => (c.categories || []).length >= 2);
  const pcLabel = p => p.source ? `À savoir par cœur · ${p.source}` : "À savoir par cœur";

  const cls = {1: "l1", 2: "l2", 3: "l3"};
  const tagOf = n => `<span class="tag ${cls[UBY[n].group] || "l1"}">${esc(UBY[n].name)}</span>`;
  const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
  const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;

  /* Chaque générateur renvoie {n, prompt, opts | fields, explain, review, redo} ou null si rien pour cette notion */
  const G = {
    parCoeur(n){
      const pool = PC.filter(p => p.notion === n && (p.pieges || []).length >= 3);
      if (!pool.length) return null;
      const p = pick(pool);
      return {n, wide: true, prompt: `<span class="label">${esc(pcLabel(p))}</span><br>${esc(p.question)}`,
        opts: shuffle([{t: p.phrase, ok: true}, ...p.pieges.slice(0, 3).map(t => ({t, ok: false}))]),
        explain: `La bonne réponse est la phrase à savoir, mot pour mot : <b>${esc(p.phrase)}</b>`,
        review: rev(n, p.question, p.phrase), redo: () => G.parCoeur(n)};
    },
    trous(n, typed){
      if (!typed) return null;
      const pool = PC.filter(p => p.notion === n && (p.motsCles || []).some(m => p.phrase.toLowerCase().includes(String(m).toLowerCase())));
      if (!pool.length) return null;
      const p = pick(pool), low = p.phrase.toLowerCase(), at = m => low.indexOf(String(m).toLowerCase());
      const keys = p.motsCles.filter(m => at(m) >= 0).slice(0, 3).sort((a, b) => at(a) - at(b));  // numérotés dans l'ordre de lecture
      let txt = esc(p.phrase);
      keys.forEach((k, i) => { const re = new RegExp(esc(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); txt = txt.replace(re, `<span class="trou">(${i + 1}) ……</span>`); });
      return {n, prompt: `<span class="label">${esc(pcLabel(p))}</span><br>Complète la phrase :<br><b>${txt}</b>`,
        fields: keys.map((k, i) => ({label: `Mot ${i + 1}`, lang: "fr", check: v => { const ok = wordOk([k], v); return {ok, fix: ok ? "✓" : `→ ${k}`}; }})),
        explain: esc(p.phrase), review: rev(n, `Phrase à compléter : ${p.question}`, p.phrase), redo: () => G.trous(n, typed)};
    },
    cours(n){
      const pool = COURS.filter(c => c.notion === n && c.qcm && (c.qcm.pieges || []).length >= 3);
      if (!pool.length) return null;
      const c = pick(pool), q = c.qcm;
      return {n, wide: true, prompt: esc(q.question || c.question), opts: shuffle([{t: q.bonne, ok: true}, ...q.pieges.slice(0, 3).map(t => ({t, ok: false}))]),
        explain: nl(c.reponse), tip: c.astuce, review: rev(n, q.question || c.question, q.bonne), redo: () => G.cours(n)};
    },
    vocab(n, typed){
      const pool = VOC.filter(v => v.notion === n);
      if (!pool.length) return null;
      const v = pick(pool), base = {n, prompt: `Quel est le mot ?<br><b>${esc(v.definition)}</b>`, explain: `C'est <b>${esc(v.mot)}</b>.`,
        review: rev(n, v.definition, v.mot), redo: () => G.vocab(n, typed)};
      if (typed) return Object.assign(base, {explain: "", fields: [{label: "Le mot", lang: "fr", check: val => { const ok = wordOk([v.mot, ...(v.variantes || [])], val); return {ok, fix: ok ? "✓" : `→ ${v.mot}`}; }}]});
      const others = shuffle(VOC.filter(x => x !== v && norm(x.mot) !== norm(v.mot))).slice(0, 3).map(x => ({t: x.mot, ok: false}));
      if (others.length < 2) return null;
      return Object.assign(base, {opts: shuffle([{t: v.mot, ok: true}, ...others])});
    },
    vraiFaux(n){
      const pool = VF.filter(v => v.notion === n);
      if (!pool.length) return null;
      const v = pick(pool);
      return {n, prompt: `Vrai ou faux ?<br><b>${esc(v.affirmation)}</b>`, opts: [{t: "Vrai", ok: !!v.vrai}, {t: "Faux", ok: !v.vrai}],
        explain: nl(v.explication), review: rev(n, v.affirmation, v.vrai ? "Vrai" : "Faux"), redo: () => G.vraiFaux(n)};
    },
    chiffre(n, typed){
      const pool = NUM.filter(x => x.notion === n);
      if (!pool.length) return null;
      const x = pick(pool), u = x.unite ? (/^[%°]/.test(x.unite) ? x.unite : " " + x.unite) : "";
      const show = v => fmt(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + u;
      const base = {n, prompt: esc(x.question), explain: nl(x.explication), review: rev(n, x.question, show(x.valeur)), redo: () => G.chiffre(n, typed)};
      if (typed) return Object.assign(base, {fields: [{label: "Ta réponse", inputmode: "decimal", unit: (x.unite || "").trim(), check: val => {
        const raw = fold(String(val)).trim().toLowerCase(), w = WORDNUM[raw.split(/\s+/)[0]];
        const clean = raw.replace(/\s/g, "").replace(/(eme|e)?(siecle)?$/, "").replace(/[a-z%°/²³]+$/, "");
        let v = w !== undefined && /^[a-z]+(\s+[a-z]+)*$/.test(raw) ? w : parseNum(clean);
        if (isNaN(v)) v = roman(clean);
        const ok = !isNaN(v) && Math.abs(v - x.valeur) <= (+x.tolerance || 0);
        return {ok, fix: ok ? "✓" : isNaN(v) ? `Écris un nombre. → ${show(x.valeur)}` : `→ ${show(x.valeur)}`};
      }}]});
      const traps = [...new Set((x.pieges || []).filter(t => isFinite(t) && t !== x.valeur))].slice(0, 3);
      if (traps.length < 2) return null;
      return Object.assign(base, {opts: shuffle([{t: show(x.valeur), ok: true}, ...traps.map(t => ({t: show(t), ok: false}))])});
    },
    etape(n){
      const pool = ETA.filter(e => e.notion === n);
      if (!pool.length) return null;
      const e = pick(pool), ch = e.liste, i = Math.floor(Math.random() * (ch.length - 1)), next = ch[i + 1];
      const others = shuffle(ch.filter((_, k) => k !== i && k !== i + 1)).slice(0, 3);
      if (others.length < 1) return null;
      return {n, wide: true, prompt: `${esc(e.nom)} : juste après « <b>${esc(ch[i])}</b> », que se passe-t-il ?`,
        opts: shuffle([{t: cap(next), ok: true}, ...others.map(t => ({t: cap(t), ok: false}))]),
        explain: ch.map((s, k) => k === i + 1 ? `<b>${esc(cap(s))}</b>` : esc(cap(s))).join(" → "),
        review: rev(n, `${e.nom} : après « ${ch[i]} »`, cap(next)), redo: () => G.etape(n)};
    },
    classement(n){
      const pool = [];
      CLS.forEach(c => (c.items || []).forEach(it => { if (it.notion === n && c.categories.includes(it.categorie)) pool.push([c, it]); }));
      if (!pool.length) return null;
      const [c, it] = pick(pool), bad = shuffle(c.categories.filter(k => k !== it.categorie && !(it.pas || []).includes(k))).slice(0, 3);
      if (!bad.length) return null;
      return {n, wide: true, prompt: `${esc(c.question || "C'est…")}<br><b>${esc(it.nom)}</b>`, opts: shuffle([{t: it.categorie, ok: true}, ...bad.map(t => ({t, ok: false}))]),
        explain: nl(it.pourquoi || ""), review: rev(n, `${it.nom}`, it.categorie), redo: () => G.classement(n)};
    }
  };
  const KINDS = ["cours", "cours", "vocab", "vraiFaux", "chiffre", "etape", "classement"];
  function make(kinds, n, typed){
    for (const k of shuffle(kinds)) { const e = G[k](n, typed); if (e) return e; }
    for (const u of shuffle(UNITS)) for (const k of KINDS) { const e = G[k](u.id, typed); if (e) return e; }
    return null;
  }
  const asQuiz = e => ({unit: UBY[e.n], key: e.review, prompt: e.prompt, wide: e.wide, opts: e.opts, tip: e.tip, feedback: () => e.explain ? box(e.explain) : "", review: e.review});
  const asControl = e => Object.assign({unit: UBY[e.n], prompt: e.prompt, wide: e.wide, tip: e.tip, review: e.review,
    correction: () => e.explain ? `<p class="label" style="margin-top:4px">Correction</p>${box(e.explain)}` : "", redo: () => asControl(e.redo())},
    e.fields ? {kind: "fields", fields: e.fields} : {kind: "choice", opts: e.opts});
  const card = (n, front, back, tip, label) => ({unit: UBY[n],
    front: `<div class="fbody">${label ? `<span class="label">${esc(label)}</span>` : ""}<span class="card-q">${front}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
    back: `<div class="fbody left"><span class="card-a">${back}</span>${tip ? `<span class="tip">${esc(tip)}</span>` : ""}</div>`});

  const groups = {};
  parts.forEach((p, i) => { groups[String(p.id)] = {name: p.nom, cls: cls[i + 1] || "l1", filter: p.filtre || p.nom}; });
  const nbPC = PC.length, nbRd = L("redaction").length;
  Revision.start({
    key: D.key,
    title: D.titre, subtitle: D.sousTitre || "", eyebrow: D.surtitre || "", hand: D.note || "",
    countdown: D.controle && D.controle.date ? {date: D.controle.date, label: D.controle.label || D.controle.date} : undefined,
    video: D.video || undefined,
    redaction: nbRd ? {items: L("redaction").filter(r => okN(r.notion)).map(r => ({id: r.id, unit: r.notion, titre: r.titre,
      doc: r.document ? para(r.document) : "", consigne: para(r.consigne), modele: r.modele, criteres: r.criteres, photo: r.photo !== false})),
      text: `${nbRd} sujet${nbRd > 1 ? "s" : ""} comme à l'évaluation : tu rédiges (ou tu prends ta copie en photo), puis tu es corrigé critère par critère.`} : undefined,
    groups, units: UNITS,
    allLabel: () => "Tout le chapitre",
    mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
    modes: {
      cards: ["la leçon", nbPC ? `D'abord les ${nbPC} phrase${nbPC > 1 ? "s" : ""} à savoir par cœur, puis le reste du cours, chaque jour un peu.` : "Les questions du cours, à réviser chaque jour un peu."],
      quiz: ["10 questions", "Les phrases à savoir, le vocabulaire, les chiffres, vrai ou faux."],
      control: ["noté sur 20", "Tu écris les mots et tu complètes les phrases à savoir, comme à l'évaluation."]
    },
    cards: pool => {
      const ids = new Set(pool.map(u => u.id)), out = [];
      PC.filter(p => ids.has(p.notion)).forEach(p => out.push(card(p.notion, esc(p.question), esc(p.phrase), "", pcLabel(p))));
      COURS.filter(c => ids.has(c.notion)).forEach(c => out.push(card(c.notion, esc(c.question), nl(c.reponse), c.astuce)));
      VOC.filter(v => ids.has(v.notion)).forEach(v => out.push(card(v.notion, `Que veut dire « ${esc(v.mot)} » ?`, esc(v.definition))));
      return out.length ? out : [card(UNITS[0].id, esc(D.titre), "Pas encore de cartes pour ces notions.")];
    },
    quiz: {count: 10, make: (pool, R, i) => {
      const n = R.weighted(pool).id;
      const e = (i % 5 < 2 && G.parCoeur(n)) || make(KINDS, n, false) || G.parCoeur(n) || make(["parCoeur"], n, false);
      return asQuiz(e);
    }},
    control: {
      lead: "12 questions : des mots à écrire, des phrases à compléter, des chiffres à retrouver et des questions de cours. Chaque question compte autant.",
      note: "Les accents, les majuscules et les articles ne comptent pas pour les mots. Pour les chiffres, une petite approximation est acceptée.",
      size: () => 12,
      build: pool => {
        const plan = ["vocab", "vocab", "vocab", "trous", "trous", "parCoeur", "chiffre", "etape", "classement", "vraiFaux", "cours", "cours"];
        const ids = pool.map(u => u.id), items = [];
        for (const k of plan) {
          let e = null;
          for (let t = 0; t < 12 && !e; t++) { e = G[k](pick(ids), true); if (e && items.some(x => x.review === e.review)) e = null; }
          if (!e) { for (let t = 0; t < 12 && !e; t++) { e = make(KINDS, pick(ids), true); if (e && items.some(x => x.review === e.review)) e = null; } }
          if (e) items.push(e);
        }
        return shuffle(items).map(asControl);
      }
    }
  });
}
Revision.lesson = lesson;
})();
