/* Moteur de révision commun à tous les modules : accueil du module, Cartes, Quiz, Contrôle noté sur 20,
   progression (localStorage), choix des éléments à réviser. Un module n'apporte que ses données et ses règles :
   voir CLAUDE.md à la racine pour le contrat complet. */
(() => {
"use strict";

/* ---------- outils exposés aux modules ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const round2 = x => Math.round(x * 100) / 100;
const fmt = x => String(round2(x)).replace(".", ",");
const fold = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function parseNum(s){
  s = String(s).trim().toLowerCase().replace(/\s/g, "").replace(/cm²|cm2|cm|m²|°|degrés?/g, "").replace(/,/g, ".");
  if (!s) return NaN;
  const m = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (m) return +m[1] / +m[2];
  return /^-?\d+(\.\d+)?$|^-?\.\d+$/.test(s) ? +s : NaN;
}
const numEqual = (s, ans) => { const x = parseNum(s); return !isNaN(x) && Math.abs(x - ans) < 0.006 + Math.abs(ans) * 1e-6; };
/* Champ numérique prêt à l'emploi pour le contrôle */
const numField = (ans, unit = "", label = "Ta réponse") => ({id: "n", label, inputmode: "decimal", unit, check: v => {
  const ok = numEqual(v, ans);
  return {ok, fix: ok ? "✓" : isNaN(parseNum(v)) ? `Écris un nombre. → ${fmt(ans)}${unit}` : `→ ${fmt(ans)}${unit}`};
}});
/* Réponses chiffrées → QCM : la bonne réponse et trois pièges */
function numChoices(ans, traps, unit = ""){
  const seen = new Set([round2(ans)]), out = [{t: fmt(ans) + unit, ok: true}];
  for (const c of shuffle(traps)) { const v = round2(c); if (isFinite(v) && v > 0 && !seen.has(v)) { seen.add(v); out.push({t: fmt(v) + unit, ok: false}); } if (out.length === 4) break; }
  let d = 1;
  while (out.length < 4) { const v = round2(ans + d); if (v > 0 && !seen.has(v)) { seen.add(v); out.push({t: fmt(v) + unit, ok: false}); } d = d > 0 ? -d : -d + 1; }
  return shuffle(out);
}

/* Synthèse vocale (si l'appareil a une voix dans la langue) */
const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
function speak(text, lang = "en-GB"){
  if (!canSpeak || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = .82;
    const vs = speechSynthesis.getVoices(), base = lang.split("-")[0];
    const voice = vs.find(x => x.lang.replace("_", "-").toLowerCase() === lang.toLowerCase()) || vs.find(x => x.lang.toLowerCase().startsWith(base));
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  } catch(e) {}
}
const SPK = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const speakBtn = (text, lang = "en-GB", cls = "btn") => canSpeak ? `<button class="${cls}" type="button" data-act="speak" data-say="${esc(text)}" data-lang="${esc(lang)}">${SPK} Écouter</button>` : "";

const GOOD = ["Bien !", "Très bien !", "Bravo !", "Parfait !", "Oui !", "Excellent !"];
const BAD = ["Presque…", "Pas tout à fait", "Attention !", "À revoir"];

function start(M){
  /* ---------- configuration ---------- */
  const units = M.units, UBY = Object.fromEntries(units.map(u => [u.id, u]));
  const groups = M.groups, gids = Object.keys(groups);
  const MAX = (M.mastery && M.mastery.max) || 3;
  const noun = (M.mastery && M.mastery.noun) || "éléments";
  const sel0 = M.selection ? M.selection.default : units.map(u => u.id);
  const optDefs = (M.control && M.control.options) || [];
  const selFilters = (M.selection && M.selection.filters) || [];
  document.title = M.title + (M.subtitle ? " · " + M.subtitle : "");

  /* ---------- état (sur cet appareil) ---------- */
  let S = load();
  function load(){
    let s = null;
    try { s = JSON.parse(localStorage.getItem(M.key) || "null"); } catch(e) {}
    if (!s || typeof s !== "object") s = {};
    if (!Array.isArray(s.sel) || !M.selection) s.sel = [...sel0];
    s.sel = s.sel.filter(id => UBY[id]);
    if (!s.sel.length) s.sel = [...sel0];
    if (!s.m || typeof s.m !== "object") s.m = {};
    if (s.f !== "all" && !gids.includes(s.f)) s.f = "all";
    if (!s.opt || typeof s.opt !== "object") s.opt = {};
    optDefs.forEach(o => { if (!o.choices.some(c => c[0] === s.opt[o.id])) s.opt[o.id] = o.default || o.choices[0][0]; });
    if (!selFilters.some(f => f.id === s.lf)) s.lf = selFilters.length ? selFilters[0].id : "all";
    return s;
  }
  function save(){ try { localStorage.setItem(M.key, JSON.stringify(S)); } catch(e) {} }
  const mOf = u => Math.max(0, Math.min(MAX, S.m[typeof u === "string" ? u : u.id] || 0));
  const selected = () => units.filter(u => S.sel.includes(u.id));
  function pool(){
    const sel = selected();
    const f = S.f === "all" ? sel : sel.filter(u => u.group === S.f);
    return f.length ? f : sel;
  }
  function weighted(list){
    const w = list.map(u => MAX + 1 - mOf(u));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) { r -= w[i]; if (r < 0) return list[i]; }
    return list[list.length - 1];
  }
  const tag = u => { const g = groups[u.group]; return `<span class="tag ${g.cls}">${esc(u.tag || g.name)}</span>`; };

  /* Ce que le module reçoit pour fabriquer ses questions */
  const R = {esc, shuffle, pick, randInt, round2, fmt, fold, parseNum, numEqual, numField, numChoices, speak, speakBtn, canSpeak,
    units, unit: id => UBY[id], selected, pool, weighted, mastery: mOf, tag, option: id => S.opt[id], state: () => S, save};

  /* ---------- affichage commun ---------- */
  const screen = document.getElementById("screen");
  let cur = "home";
  function show(name, html){ cur = name; screen.innerHTML = html; window.scrollTo(0, 0); }
  const bar = (title, meta) => `<div class="bar"><button class="btn small" type="button" data-act="home">← Accueil</button><h2>${title}</h2><span class="meta">${meta}</span></div>`;
  function countdown(){
    if (!M.countdown) return "";
    const [y, mo, d] = M.countdown.date.split("-").map(Number);
    const t = new Date(y, mo - 1, d), now = new Date(); now.setHours(0, 0, 0, 0);
    const n = Math.round((t - now) / 864e5), lbl = M.countdown.label;
    if (n < 0) return "";
    return `<span class="jx">${n === 0 ? "Contrôle aujourd'hui !" : n === 1 ? `Contrôle demain, ${esc(lbl)}` : `Contrôle ${esc(lbl)} · J-${n}`}</span>`;
  }
  function grade(note){
    const s = (Number.isInteger(note) ? String(note) : note.toFixed(1).replace(".", ",")) + "/20";
    return `<div class="grade" role="img" aria-label="Note : ${s}"><svg viewBox="0 0 240 140" aria-hidden="true"><path d="M34 80 C 22 32, 150 12, 206 42 C 240 62, 222 114, 138 124 C 68 132, 16 112, 26 74 C 32 50, 72 28, 130 24"/></svg><span>${s}</span></div>`;
  }
  const verdict = n => n >= 18 ? (M.verdictTop || "Excellent, prêt pour le contrôle !") : n >= 15 ? "Très bien, encore un petit effort." : n >= 12 ? "Bien, continue comme ça." : n >= 8 ? "Ça vient. Relis tes erreurs." : "On s'accroche ! Repasse par les cartes.";
  function progress(){
    const sel = selected(), done = sel.filter(u => mOf(u) >= MAX).length;
    const help = (M.mastery && M.mastery.help) || `Une case se remplit à chaque bonne réponse au contrôle et redescend à chaque erreur.`;
    const body = sel.length > 10
      ? `<div class="cells">${sel.map(u => `<span class="cell" style="--p:${Math.round(mOf(u) / MAX * 100)}%" title="${esc(u.name)} : ${mOf(u)}/${MAX}"></span>`).join("")}</div>`
      : `<div class="vt-wrap"><div>${sel.map(u => `<div class="nrow ${groups[u.group].cls}"><b>${esc(u.name)}</b><span class="ndots" role="img" aria-label="Maîtrise ${mOf(u)} sur ${MAX}">${Array.from({length: MAX}, (_, k) => `<i class="${k < mOf(u) ? "on" : ""}"></i>`).join("")}</span>${u.sub ? `<small>${esc(u.sub)}</small>` : ""}</div>`).join("")}</div></div>`;
    return `<div class="prog"><span class="prog-n"><b>${done}</b> / ${sel.length} ${esc(noun)} maîtrisé${(M.mastery && M.mastery.feminine) ? "e" : ""}s</span>${body}<p class="fine">${esc(help)}</p></div>`;
  }

  /* ---------- accueil du module ---------- */
  function home(keepScroll){
    const y = window.scrollY, sel = selected();
    const cnt = {}; sel.forEach(u => cnt[u.group] = (cnt[u.group] || 0) + 1);
    if (S.f !== "all" && !cnt[S.f]) { S.f = "all"; save(); }
    const fl = [["all", M.allLabel ? M.allLabel(sel.length) : `Tout · ${sel.length}`]];
    gids.forEach(g => { if (cnt[g]) fl.push([g, groups[g].filter || `${groups[g].plural || groups[g].name} · ${cnt[g]}`]); });
    const md = Object.assign({
      cards: ["pour commencer", "Retourne chaque carte pour voir la réponse et une astuce."],
      quiz: [`${(M.quiz && M.quiz.count) || 10} questions`, "Trouve la bonne réponse parmi plusieurs. Enchaîne les séries."],
      control: ["noté sur 20", "Écris les réponses toi-même, comme en classe."]
    }, M.modes || {});
    show("home", `
      <header class="hd">
        <span class="eyebrow">${esc(M.eyebrow || "")}</span>
        <h1>${esc(M.title)}</h1>
        ${M.hand ? `<p class="hand-note">${esc(M.hand)}</p>` : ""}
        ${countdown()}
      </header>
      ${progress()}
      ${fl.length > 2 ? `<section class="sec"><p class="label" id="f-lab">Je révise</p>
        <div class="chips" role="group" aria-labelledby="f-lab">${fl.map(([k, t]) => `<button class="chip" type="button" data-act="filter" data-f="${k}" aria-pressed="${S.f === k}">${esc(t)}</button>`).join("")}</div></section>` : ""}
      <div class="modes${M.video ? " four" : ""}">
        ${M.video ? `<button class="mode bristol" type="button" style="--r:.6deg" data-act="video"><span class="mode-top"><span class="mode-k">Vidéo</span><span class="mode-x">${esc(M.video.length || "à regarder")}</span></span><span class="mode-d">${esc(M.video.text || "Regarde la vidéo de révision du chapitre.")}</span></button>` : ""}
        <button class="mode bristol" type="button" style="--r:-.8deg" data-act="cards"><span class="mode-top"><span class="mode-k">Cartes</span><span class="mode-x">${esc(md.cards[0])}</span></span><span class="mode-d">${esc(md.cards[1])}</span></button>
        <button class="mode bristol" type="button" style="--r:.6deg" data-act="quiz"><span class="mode-top"><span class="mode-k">Quiz</span><span class="mode-x">${esc(md.quiz[0])}</span></span><span class="mode-d">${esc(md.quiz[1])}</span></button>
        <button class="mode bristol" type="button" style="--r:-.4deg" data-act="control"><span class="mode-top"><span class="mode-k">Contrôle</span><span class="mode-x">${esc(md.control[0])}</span></span><span class="mode-d">${esc(md.control[1])}</span></button>
      </div>
      ${M.selection ? `<section class="sec"><div class="sec-h"><p class="label">Ma liste · ${sel.length} ${esc(noun)}</p><button class="btn small" type="button" data-act="list">${esc(M.selection.button || "Changer")}</button></div>${M.overview ? M.overview(sel, R) : ""}</section>` : (M.overview ? `<section class="sec">${M.overview(sel, R)}</section>` : "")}
      <footer class="foot">
        <button class="btn ghost small" type="button" data-act="reset">Remettre les compteurs à zéro</button>
        <p class="fine">La progression est gardée sur cet appareil.${M.footnote ? " " + esc(M.footnote) : ""}</p>
      </footer>`);
    if (keepScroll) window.scrollTo(0, y);
  }

  /* ---------- vidéo (facultative : M.video = {src, poster?, length?, text?, title?, chapters?: [[secondes, titre]]}) ---------- */
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  function videoScreen(){
    const V = M.video, ch = V.chapters || [];
    show("video", `${bar("Vidéo", esc(V.length || ""))}
      ${V.title ? `<p class="label">${esc(V.title)}</p>` : ""}
      <div class="vid bristol"><video id="vid" src="${esc(V.src)}"${V.poster ? ` poster="${esc(V.poster)}"` : ""} controls playsinline preload="metadata"></video></div>
      ${ch.length ? `<section class="sec"><p class="label">Aller directement à…</p><div class="chaps">${ch.map(([t, lbl]) =>
        `<button class="chap" type="button" data-act="seek" data-t="${+t}"><span class="chap-t">${mmss(+t)}</span><span>${esc(lbl)}</span></button>`).join("")}</div></section>` : ""}
      <div class="ctrls center"><button class="btn primary" type="button" data-act="cards">Suite : les cartes →</button></div>`);
  }
  function seek(t){
    const v = document.getElementById("vid"); if (!v) return;
    const go = () => { try { v.currentTime = t; } catch (e) {} const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (v.readyState >= 1) go(); else { v.addEventListener("loadedmetadata", go, {once: true}); v.load(); }
    v.scrollIntoView({behavior: "smooth", block: "center"});
  }

  /* ---------- cartes ---------- */
  let K = null;
  function startCards(){ K = {deck: shuffleIf(M.cards(pool(), R)), i: 0, on: false}; renderCards(); }
  const shuffleIf = d => M.shuffleCards ? shuffle(d) : d;
  function renderCards(){
    const c = K.deck[K.i], n = K.deck.length;
    const head = `<span class="fhead">${c.unit ? tag(c.unit) : ""}<span class="fine push">${K.i + 1} / ${n}</span></span>`;
    show("cards", `${bar("Cartes", `${K.i + 1} / ${n}`)}
      <div class="flash">
        <div class="flip${K.on ? " on" : ""}" id="flip" role="button" tabindex="0" data-act="flip" aria-label="Retourner la carte">
          <div class="face front bristol" aria-hidden="${K.on}">${head}${c.front}</div>
          <div class="face back bristol" aria-hidden="${!K.on}">${head}${c.back}</div>
        </div>
      </div>
      <div class="ctrls">
        <button class="btn" type="button" data-act="prev" ${K.i === 0 ? "disabled" : ""}>← Précédente</button>
        ${c.extra || ""}
        <button class="btn${K.i < n - 1 ? " primary" : ""}" type="button" data-act="next">${K.i < n - 1 ? "Suivante →" : "Recommencer"}</button>
        ${K.i === n - 1 ? `<button class="btn primary" type="button" data-act="quiz">Suite : le quiz →</button>` : ""}
      </div>
      <div class="ctrls center"><button class="btn ghost" type="button" data-act="shuffle">Mélanger les cartes</button></div>`);
  }
  function flip(){
    K.on = !K.on;
    const f = document.getElementById("flip"); if (!f) return;
    f.classList.toggle("on", K.on);
    f.querySelector(".front").setAttribute("aria-hidden", K.on);
    f.querySelector(".back").setAttribute("aria-hidden", !K.on);
  }

  /* ---------- quiz ---------- */
  let Q = null;
  const wideOpts = q => q.wide || q.opts.some(o => String(o.t).length > 22);
  function startQuiz(){
    const n = (M.quiz && M.quiz.count) || 10, qs = [];
    let last = null;
    for (let i = 0; i < n; i++) {
      let q, t = 0;
      do { q = M.quiz.make(pool(), R, i); t++; } while (last && q.key && q.key === last && t < 10);
      last = q.key; qs.push(q);
    }
    Q = {qs, i: 0, score: 0, streak: 0, best: 0, done: false, wrong: []};
    renderQuiz();
  }
  function renderQuiz(){
    const q = Q.qs[Q.i];
    show("quiz", `${bar("Quiz", `Question ${Q.i + 1} / ${Q.qs.length}`)}
      <div class="qcard bristol">
        <div class="fhead">${q.unit ? tag(q.unit) : ""}<span class="streak" id="streak" ${Q.streak < 2 ? "hidden" : ""}>Série de ${Q.streak} !</span><span class="score push" id="qscore">${Q.score} / ${Q.i} juste${Q.score > 1 ? "s" : ""}</span></div>
        <p class="prompt">${q.prompt}</p>
        ${q.fig || ""}
        <div class="opts${wideOpts(q) ? " wide" : ""}">${q.opts.map((o, i) => `<button class="opt" type="button" data-act="answer" data-i="${i}"><span class="k">${"ABCD"[i]}</span><span class="t">${esc(o.t)}</span></button>`).join("")}</div>
        <div class="fb" id="fb" aria-live="polite"></div>
      </div>
      <div class="ctrls"><span></span><button class="btn primary" type="button" id="qnext" data-act="qnext" hidden>${Q.i < Q.qs.length - 1 ? "Question suivante →" : "Voir ma note"}</button></div>`);
  }
  function answer(i){
    if (Q.done) return;
    Q.done = true;
    const q = Q.qs[Q.i], ok = q.opts[i].ok;
    screen.querySelectorAll(".opt").forEach((b, k) => { b.disabled = true; if (q.opts[k].ok) b.classList.add("good"); else if (k === i) b.classList.add("bad"); });
    if (ok) { Q.score++; Q.streak++; Q.best = Math.max(Q.best, Q.streak); }
    else { Q.streak = 0; if (!Q.wrong.some(w => w.review === q.review)) Q.wrong.push(q); }
    const st = document.getElementById("streak"); st.hidden = Q.streak < 2; st.textContent = `Série de ${Q.streak} !`;
    document.getElementById("qscore").textContent = `${Q.score} / ${Q.i + 1} juste${Q.score > 1 ? "s" : ""}`;
    const fb = typeof q.feedback === "function" ? q.feedback(ok) : (q.feedback || "");
    document.getElementById("fb").innerHTML = `<span class="remark ${ok ? "ok" : "ko"}">${pick(ok ? GOOD : BAD)}</span>${fb}${!ok && q.tip ? `<span class="tip">${esc(q.tip)}</span>` : ""}`;
    const nx = document.getElementById("qnext"); nx.hidden = false; nx.focus({preventScroll: true});
  }
  const missList = list => list.length ? `<div class="misses"><p class="label" style="padding:12px 2px 4px">À revoir</p>${list.map(x => `<div class="miss">${x.review}</div>`).join("")}</div>` : "";
  function quizEnd(){
    const note = Math.round(Q.score / Q.qs.length * 40) / 2;
    show("quiz-end", `${bar("Quiz", "Terminé")}
      <div class="result bristol">
        <div class="fhead"><span class="fine">Résultat</span></div>
        ${grade(note)}
        <p class="verdict">${verdict(note)}</p>
        <p class="sum">${Q.score} bonne${Q.score > 1 ? "s" : ""} réponse${Q.score > 1 ? "s" : ""} sur ${Q.qs.length}${Q.best >= 2 ? ` · meilleure série : ${Q.best}` : ""}.</p>
        ${missList(Q.wrong)}
        <div class="ctrls center"><button class="btn" type="button" data-act="home">Accueil</button><button class="btn" type="button" data-act="quiz">Rejouer</button><button class="btn primary" type="button" data-act="control">Suite : le contrôle →</button></div>
      </div>`);
  }

  /* ---------- contrôle ---------- */
  let C = null;
  function controlIntro(){
    const n = M.control.size ? M.control.size(pool(), R) : pool().length;
    show("control-intro", `${bar("Contrôle", `${n} question${n > 1 ? "s" : ""}`)}
      <div class="intro bristol">
        <div class="fhead"><span class="label">Consigne</span></div>
        <p class="lead">${M.control.lead}</p>
        ${optDefs.map(o => `<p class="label" id="o-${o.id}">${esc(o.label)}</p><div class="chips" role="group" aria-labelledby="o-${o.id}">${o.choices.map(([k, t]) => `<button class="chip" type="button" data-act="opt" data-o="${o.id}" data-v="${k}" aria-pressed="${S.opt[o.id] === k}">${esc(t)}</button>`).join("")}</div>`).join("")}
        ${M.control.note ? `<p class="fine">${M.control.note}</p>` : ""}
        <div class="ctrls"><span></span><button class="btn primary" type="button" data-act="cstart">Commencer le contrôle</button></div>
      </div>`);
  }
  function startControl(items){
    items = items && items.length ? items : M.control.build(pool(), R);
    C = {q: items, i: 0, pts: 0, res: [], checked: false};
    renderCItem();
  }
  function renderCItem(){
    const it = C.q[C.i];
    const body = it.kind === "choice"
      ? `<div class="opts${wideOpts(it) ? " wide" : ""}">${it.opts.map((o, i) => `<button class="opt" type="button" data-act="canswer" data-i="${i}"><span class="k">${"ABCD"[i]}</span><span class="t">${esc(o.t)}</span></button>`).join("")}</div>`
      : `<div class="fields">${it.fields.map((f, k) => `<div class="field" id="fd-${k}"><label for="c-${k}">${esc(f.label)}</label><div class="numrow"><input class="inp" id="c-${k}" type="text" ${f.inputmode ? `inputmode="${f.inputmode}"` : ""} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="${k < it.fields.length - 1 ? "next" : "done"}" lang="${f.lang || "fr"}">${f.unit ? `<span class="unit">${esc(f.unit.trim())}</span>` : ""}</div><span class="fix" hidden></span></div>`).join("")}</div>`;
    show("control", `${bar("Contrôle", `Question ${C.i + 1} / ${C.q.length}`)}
      <form class="copy bristol" id="cform" autocomplete="off" novalidate>
        <div class="fhead">${it.unit ? tag(it.unit) : ""}<span class="fine push">${C.i + 1} / ${C.q.length}</span></div>
        ${it.given ? `<div class="given"><span class="flab">${esc(it.given.label)}</span><span class="gval">${esc(it.given.value)}</span></div>` : ""}
        ${it.prompt ? `<p class="qtext">${it.prompt}</p>` : ""}
        ${it.fig || ""}
        ${body}
        <div class="cfb" id="cfb" aria-live="polite"></div>
        <div class="ctrls"><span></span><button class="btn primary" type="submit" id="cbtn" ${it.kind === "choice" ? "hidden" : ""}>Valider</button></div>
      </form>`);
    const f0 = document.getElementById("c-0");
    if (f0) setTimeout(() => f0.focus({preventScroll: true}), 30);
  }
  function checkC(choice){
    const it = C.q[C.i];
    let score;
    if (it.kind === "choice") {
      score = it.opts[choice].ok ? 1 : 0;
      screen.querySelectorAll(".opt").forEach((b, k) => { b.disabled = true; if (it.opts[k].ok) b.classList.add("good"); else if (k === choice) b.classList.add("bad"); });
    } else {
      const inputs = it.fields.map((_, k) => document.getElementById("c-" + k));
      if (inputs.every(el => !el.value.trim())) { inputs[0].focus(); return; }
      let n = 0;
      it.fields.forEach((f, k) => {
        const el = inputs[k], fd = document.getElementById("fd-" + k), fx = fd.querySelector(".fix");
        const r = f.check(el.value);
        el.readOnly = true;
        fd.classList.add(r.ok ? "good" : "bad");
        fx.hidden = false; fx.textContent = r.fix || (r.ok ? "✓" : "");
        if (r.ok) n++;
      });
      score = n / it.fields.length;
    }
    const all = score === 1, u = it.unit, before = u ? mOf(u) : 0;
    if (u) { S.m[u.id] = all ? Math.min(MAX, before + 1) : Math.max(0, before - 1); save(); }
    C.pts += score; C.res.push({it, all});
    const full = all && u && S.m[u.id] === MAX && before < MAX;
    const fb = typeof it.correction === "function" ? it.correction(all) : (it.correction || "");
    document.getElementById("cfb").innerHTML = `<span class="remark ${all ? "ok" : "ko"}">${pick(all ? GOOD : BAD)}</span>${full ? `<span class="fullline">Maîtrisé : <b>${esc(u.name)}</b> !</span>` : ""}${fb}${!all && it.tip ? `<span class="tip">${esc(it.tip)}</span>` : ""}`;
    C.checked = true;
    const b = document.getElementById("cbtn"); b.hidden = false;
    b.textContent = C.i < C.q.length - 1 ? "Question suivante →" : "Voir ma note";
    b.focus({preventScroll: true});
  }
  function nextC(){ C.i++; C.checked = false; if (C.i >= C.q.length) cResults(); else renderCItem(); }
  function cResults(){
    const note = Math.round(C.pts / C.q.length * 40) / 2;
    const miss = C.res.filter(r => !r.all).map(r => r.it), nOk = C.res.length - miss.length;
    C.miss = miss;
    show("control-end", `${bar("Contrôle", "Terminé")}
      <div class="result bristol">
        <div class="fhead"><span class="fine">Copie corrigée</span></div>
        ${grade(note)}
        <p class="verdict">${verdict(note)}</p>
        <p class="sum">${nOk} réponse${nOk > 1 ? "s" : ""} sans faute sur ${C.res.length}.</p>
        ${missList(miss)}
        <div class="ctrls center">
          <button class="btn" type="button" data-act="home">Accueil</button>
          ${miss.length ? `<button class="btn" type="button" data-act="cretry">Refaire mes erreurs (${miss.length})</button>` : ""}
          <button class="btn primary" type="button" data-act="cstart">Nouveau contrôle</button>
        </div>
      </div>
      ${progress()}`);
  }

  /* ---------- choix des éléments à réviser ---------- */
  function listScreen(focusId){
    const y = window.scrollY, sel = selected(), L = M.selection;
    const f = selFilters.find(x => x.id === S.lf), vis = f ? f.test : () => true;
    const list = units.filter(vis);
    show("list", `${bar(esc(L.title || "Ma liste"), `${sel.length} choisi${sel.length > 1 ? "s" : ""}`)}
      <div class="counter">
        <strong>${sel.length} ${esc(noun)} choisi${sel.length > 1 ? "s" : ""}</strong>
        ${L.counter ? L.counter(sel, R) : ""}
      </div>
      ${selFilters.length ? `<section class="sec" style="margin:22px 0 0"><p class="label" id="lf-lab">Afficher</p>
        <div class="chips" role="group" aria-labelledby="lf-lab">${selFilters.map(x => `<button class="chip" type="button" data-act="lf" data-lf="${x.id}" aria-pressed="${S.lf === x.id}">${esc(x.label)} · ${units.filter(x.test).length}</button>`).join("")}</div></section>` : ""}
      <section class="lvl-sec"><div class="vchips">${list.map(u => `<button class="vchip ${groups[u.group].cls}" type="button" data-act="toggle" data-id="${esc(u.id)}" aria-pressed="${S.sel.includes(u.id)}"><span class="ck" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>${L.chip ? L.chip(u, R) : `<b>${esc(u.name)}</b>`}</button>`).join("")}</div></section>
      <div class="ctrls">
        <button class="btn" type="button" data-act="defsel">Reprendre la sélection proposée</button>
        <button class="btn primary" type="button" data-act="home">C'est bon</button>
      </div>`);
    if (focusId) {
      window.scrollTo(0, y);
      const b = screen.querySelector(`[data-act="toggle"][data-id="${CSS.escape(focusId)}"]`);
      if (b) b.focus({preventScroll: true});
    }
  }

  /* ---------- actions ---------- */
  let armTimer = null;
  function act(a, el){
    switch (a) {
      case "home": home(); break;
      case "filter": S.f = el.dataset.f; save(); home(true); break;
      case "cards": startCards(); break;
      case "video": if (M.video) videoScreen(); break;
      case "seek": seek(+el.dataset.t); break;
      case "flip": flip(); break;
      case "prev": if (K.i > 0) { K.i--; K.on = false; renderCards(); } break;
      case "next": K.i = K.i < K.deck.length - 1 ? K.i + 1 : 0; K.on = false; renderCards(); break;
      case "shuffle": K.deck = shuffle(K.deck); K.i = 0; K.on = false; renderCards(); break;
      case "speak": speak(el.dataset.say, el.dataset.lang); break;
      case "quiz": startQuiz(); break;
      case "answer": answer(+el.dataset.i); break;
      case "qnext": Q.i++; Q.done = false; if (Q.i >= Q.qs.length) quizEnd(); else renderQuiz(); break;
      case "control": controlIntro(); break;
      case "opt": S.opt[el.dataset.o] = el.dataset.v; save(); screen.querySelectorAll(`[data-act="opt"][data-o="${el.dataset.o}"]`).forEach(b => b.setAttribute("aria-pressed", b.dataset.v === el.dataset.v)); break;
      case "cstart": startControl(); break;
      case "cretry": startControl(C.miss.map(it => it.redo ? it.redo() : it)); break;
      case "canswer": if (!C.checked) checkC(+el.dataset.i); break;
      case "list": listScreen(); break;
      case "toggle": {
        const id = el.dataset.id, i = S.sel.indexOf(id);
        if (i >= 0) { if (S.sel.length > 1) S.sel.splice(i, 1); } else S.sel.push(id);
        save(); listScreen(id); break;
      }
      case "defsel": S.sel = [...sel0]; save(); listScreen(); break;
      case "lf": S.lf = el.dataset.lf; save(); listScreen(); break;
      case "reset":
        if (el.dataset.armed) { S.m = {}; save(); clearTimeout(armTimer); home(); }
        else {
          el.dataset.armed = "1"; el.textContent = "Sûr ? Touche encore pour tout effacer";
          clearTimeout(armTimer);
          armTimer = setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = "Remettre les compteurs à zéro"; } }, 5000);
        }
        break;
    }
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t || t.disabled) return;
    if (t.tagName === "BUTTON" && t.type !== "submit" && t.closest("form")) e.preventDefault();
    act(t.dataset.act, t);
  });
  document.addEventListener("submit", e => {
    if (e.target.id !== "cform") return;
    e.preventDefault();
    if (C.checked) nextC(); else if (C.q[C.i].kind !== "choice") checkC();
  });
  document.addEventListener("keydown", e => {
    if (cur === "cards") {
      if (e.key === "ArrowRight") act("next");
      else if (e.key === "ArrowLeft" && K.i > 0) act("prev");
      else if ((e.key === " " || e.key === "Enter") && e.target.id === "flip") { e.preventDefault(); flip(); }
    } else if (cur === "quiz" && Q && !Q.done) {
      const i = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
      if (e.key.length === 1 && i >= 0 && i < Q.qs[Q.i].opts.length) answer(i);
    } else if (cur === "control" && e.key === "Enter" && e.target.matches && e.target.matches(".inp") && !C.checked) {
      const inputs = [...screen.querySelectorAll(".inp")], k = inputs.indexOf(e.target);
      if (k < inputs.length - 1) { e.preventDefault(); inputs[k + 1].focus(); }
    }
  });
  if (canSpeak) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch(e) {} }

  window.__module = {M, R, start: {startQuiz, startControl, startCards, videoScreen}};
  home();
}

/* Service worker (révisions hors connexion, notifications) : sw.js est à la racine du site, à côté de lib/ */
try {
  const me = document.currentScript && document.currentScript.src;
  if (me && "serviceWorker" in navigator) navigator.serviceWorker.register(new URL("../sw.js", me)).catch(() => {});
} catch (e) {}

window.Revision = {start, esc, shuffle, pick, randInt, round2, fmt, fold, parseNum, numEqual, numField, numChoices, speak, speakBtn};
})();
