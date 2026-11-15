/* Moteur de révision commun à tous les modules : accueil du module, Cartes, Quiz, Contrôle noté sur 20,
   progression (localStorage), choix des éléments à réviser. Un module n'apporte que ses données et ses règles :
   voir CLAUDE.md à la racine pour le contrat complet. */
(() => {
"use strict";

/* Adresse de ce fichier : sert à charger lib/planisphere.js à côté, à la demande */
const LIB = (document.currentScript && document.currentScript.src) || "";

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

/* Adresse du worker (push.json à la racine du site), pour la correction par l'IA */
const LIB_SRC = (document.currentScript && document.currentScript.src) || "";
let API = null;
async function api(){
  if (API !== null) return API;
  try { API = ((await (await fetch(new URL("../push.json", LIB_SRC), {cache: "no-cache"})).json()).api || "").replace(/\/$/, ""); } catch (e) { API = ""; }
  return API;
}
const IA_KEY = "revisions-ia-jeton";
const iaToken = () => { try { return localStorage.getItem(IA_KEY) || ""; } catch (e) { return ""; } };

const GOOD = ["Bien !", "Très bien !", "Bravo !", "Parfait !", "Oui !", "Excellent !"];
const BAD = ["Ce n'est pas ça"];

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
    for (const k of ["cb", "nd", "done", "rd", "cq"]) if (!s[k] || typeof s[k] !== "object") s[k] = {};
    delete s.k; delete s.cs;   // anciennes séries de cartes (remplacées par la répétition espacée)
    optDefs.forEach(o => { if (!o.choices.some(c => c[0] === s.opt[o.id])) s.opt[o.id] = o.default || o.choices[0][0]; });
    if (!selFilters.some(f => f.id === s.lf)) s.lf = selFilters.length ? selFilters[0].id : "all";
    return s;
  }
  function save(){ try { localStorage.setItem(M.key, JSON.stringify(S)); } catch(e) {} publish(); }
  /* Résumé lu par l'accueil du site (déjà ouvert ? combien de notions maîtrisées ? date du contrôle ?) */
  const CHEMIN = (() => { try { return location.pathname.split("/").filter(p => p && p !== "index.html").slice(-2).join("/") + "/"; } catch(e) { return ""; } })();
  function publish(){
    try {
      const all = JSON.parse(localStorage.getItem("revisions-index") || "{}") || {}, sel = selected();
      let k = 0; try { const T = today(allCards(sel)); k = T.due.length + T.fresh.length; } catch (e) {}
      all[CHEMIN] = {seen: (all[CHEMIN] && all[CHEMIN].seen) || Date.now(), done: sel.filter(u => mOf(u) >= MAX).length, n: sel.length,
        noun, fem: !!(M.mastery && M.mastery.feminine), cd: M.countdown || null, k, kd: dayKey()};
      localStorage.setItem("revisions-index", JSON.stringify(all));
    } catch(e) {}
  }
  /* Étapes du parcours : Vidéo (si le module en a une) → Cartes → Quiz → Contrôle ; « fait » pendant 7 jours */
  /* M.video : une vidéo {src, …} ou une liste de vidéos (la première est proposée d'abord) */
  const VIDS = M.video ? (Array.isArray(M.video) ? M.video : [M.video]) : [];
  const RD = (M.redaction && M.redaction.items) || [];
  const CQ = M.croquis && (M.croquis.elements || []).length ? M.croquis : null;
  const steps = () => [VIDS.length ? "video" : null, "cards", "quiz", "control", CQ ? "croquis" : null, RD.length ? "redaction" : null].filter(Boolean);
  const isDone = k => k === "cards" ? !!S.done.cards && cardsLeft() === 0 : !!S.done[k] && Date.now() - S.done[k] < 7 * 864e5;
  const cardsLeft = () => { try { const T = today(); return T.due.length + T.fresh.length; } catch (e) { return 0; } };
  const nextStep = () => steps().find(k => !isDone(k)) || null;
  function markDone(k){ S.done[k] = Date.now(); save(); }
  const mOf = u => Math.max(0, Math.min(MAX, S.m[typeof u === "string" ? u : u.id] || 0));
  const selected = () => units.filter(u => S.sel.includes(u.id));
  function pool(){
    const sel = selected();
    const f = S.f === "all" ? sel : sel.filter(u => u.group === S.f);
    return f.length ? f : sel;
  }
  const hardOf = uid => Math.min(3, Object.keys(S.cb).filter(k => k.startsWith(uid + ":") && S.cb[k].b <= 1 && S.cb[k].ko > 0).length);
  function weighted(list){
    const w = list.map(u => MAX + 1 - mOf(u) + hardOf(u.id));   // cartes « à revoir » d'une notion : tirée plus souvent
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
  function show(name, html){ cur = name; document.body.dataset.screen = name; screen.innerHTML = html; window.scrollTo(0, 0); }
  const bar = (title, meta) => `<div class="bar"><button class="btn small" type="button" data-act="home">← Le module</button><h2>${title}</h2><span class="meta">${meta}</span></div>`;
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
  const masteredLine = () => { const sel = selected(), d = sel.filter(u => mOf(u) >= MAX).length;
    return `${d} / ${sel.length} ${esc(noun)} maîtrisé${(M.mastery && M.mastery.feminine) ? "e" : ""}s`; };
  const progDetails = (title) => `<details class="prog-d" data-pd="1"${S.po ? " open" : ""}><summary><span>${esc(title || "Mes " + noun)}</span><span class="pd-n">${masteredLine()}</span></summary>${progress(false)}</details>`;
  const verdict = n => n >= 18 ? (M.verdictTop || "Excellent, prêt pour le contrôle !") : n >= 15 ? "Très bien, encore un petit effort." : n >= 12 ? "Bien, continue comme ça." : n >= 8 ? "Ça vient. Relis tes erreurs." : "On s'accroche ! Repasse par les cartes.";
  function progress(head = true){
    const sel = selected(), done = sel.filter(u => mOf(u) >= MAX).length;
    const help = (M.mastery && M.mastery.help) || `Une case se remplit à chaque bonne réponse au contrôle et redescend à chaque erreur.`;
    const body = sel.length > 10
      ? `<div class="cells">${sel.map(u => `<span class="cell" style="--p:${Math.round(mOf(u) / MAX * 100)}%" title="${esc(u.name)} : ${mOf(u)}/${MAX}"></span>`).join("")}</div>`
      : `<div class="vt-wrap"><div>${sel.map(u => `<div class="nrow ${groups[u.group].cls}"><b>${esc(u.name)}</b><span class="ndots" role="img" aria-label="Maîtrise ${mOf(u)} sur ${MAX}">${Array.from({length: MAX}, (_, k) => `<i class="${k < mOf(u) ? "on" : ""}"></i>`).join("")}</span>${u.sub ? `<small>${esc(u.sub)}</small>` : ""}</div>`).join("")}</div></div>`;
    return `<div class="prog">${head ? `<span class="prog-n"><b>${done}</b> / ${sel.length} ${esc(noun)} maîtrisé${(M.mastery && M.mastery.feminine) ? "e" : ""}s</span>` : ""}${body}<p class="fine">${esc(help)}</p></div>`;
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
    const ns = nextStep(), sel1 = selected(), nDone = sel1.filter(u => mOf(u) >= MAX).length;
    const tile = (k, name, badge, text, r) => {
      const st = isDone(k) ? "done" : ns === k ? "next" : "";
      return `<button class="mode bristol${st ? " " + st : ""}" type="button" style="--r:${r}deg" data-act="${k}"><span class="mode-top"><span class="mode-k">${name}</span><span class="mode-x">${esc(badge)}</span></span><span class="mode-d">${esc(text)}</span>${st === "done" ? `<span class="mode-st">✓ Fait</span>` : st === "next" ? `<span class="mode-st">À faire maintenant</span>` : ""}</button>`;
    };
    show("home", `
      <header class="hd">
        <span class="eyebrow">${esc(M.eyebrow || "")}</span>
        <h1>${esc(M.title)}</h1>
        ${M.hand ? `<p class="hand-note">${esc(M.hand)}</p>` : ""}
        <div class="pills">${countdown()}${nDone ? `<span class="jx">${masteredLine()}</span>` : ""}</div>
      </header>
      ${fl.length > 2 ? `<section class="sec"><p class="label" id="f-lab">Je révise</p>
        <div class="chips" role="group" aria-labelledby="f-lab">${fl.map(([k, t]) => `<button class="chip" type="button" data-act="filter" data-f="${k}" aria-pressed="${S.f === k}">${esc(t)}</button>`).join("")}</div></section>` : ""}
      <div class="modes${(VIDS.length ? 1 : 0) + (RD.length ? 1 : 0) + (CQ ? 1 : 0) ? " four" : ""}">
        ${VIDS.length ? tile("video", VIDS.length > 1 ? "Vidéos" : "Vidéo", VIDS.length > 1 ? `${VIDS.length} vidéos` : (VIDS[0].length || "à regarder"), VIDS[0].text || "Regarde la vidéo de révision du chapitre.", .6) : ""}
        ${(() => { const n = cardsLeft(); return tile("cards", "Cartes", n ? `${n} aujourd'hui` : "à jour", md.cards[1], -.8); })()}
        ${tile("quiz", "Quiz", md.quiz[0], md.quiz[1], .6)}
        ${tile("control", "Contrôle", md.control[0], md.control[1], -.4)}
        ${CQ ? tile("croquis", "Croquis", CQ.badge || "sur la carte", CQ.text || "Replace les éléments sur le fond de carte vierge, comme sur ton croquis.", -.5) : ""}
        ${RD.length ? tile("redaction", "Rédaction", "comme à l'éval", (M.redaction && M.redaction.text) || "Une question comme à l'évaluation : tu rédiges, puis tu es corrigé critère par critère.", .5) : ""}
      </div>
      ${M.selection ? `<section class="sec"><div class="sec-h"><p class="label">Ma liste · ${sel.length} ${esc(noun)}</p><button class="btn small" type="button" data-act="list">${esc(M.selection.button || "Changer")}</button></div>${M.overview ? M.overview(sel, R) : ""}</section>` : (M.overview ? `<section class="sec">${M.overview(sel, R)}</section>` : "")}
      ${progDetails()}
      <footer class="foot">
        <button class="btn ghost small" type="button" data-act="reset">Remettre les compteurs à zéro</button>
        <p class="fine">La progression est gardée sur cet appareil.${M.footnote ? " " + esc(M.footnote) : ""}</p>
      </footer>`);
    if (keepScroll) window.scrollTo(0, y);
  }

  /* ---------- vidéo (facultative : M.video = {src, poster?, length?, text?, title?, chapters?: [[secondes, titre]]}) ---------- */
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  let vI = 0;
  function videoScreen(i){
    if (i !== undefined) vI = i;
    const V = VIDS[vI] || VIDS[0], ch = V.chapters || [];
    show("video", `${bar(VIDS.length > 1 ? "Vidéos" : "Vidéo", esc(V.length || ""))}
      ${VIDS.length > 1 ? `<div class="chips vpick" role="group" aria-label="Choisir la vidéo">${VIDS.map((x, k) => `<button class="chip" type="button" data-act="vpick" data-i="${k}" aria-pressed="${k === vI}">${esc(x.title || "Vidéo " + (k + 1))}${x.length ? ` · ${esc(x.length)}` : ""}</button>`).join("")}</div>` : (V.title ? `<p class="label">${esc(V.title)}</p>` : "")}
      ${VIDS.length > 1 && V.text ? `<p class="fine vtext">${esc(V.text)}</p>` : ""}
      <div class="vid bristol"><video id="vid" src="${esc(V.src)}"${V.poster ? ` poster="${esc(V.poster)}"` : ""} controls playsinline preload="metadata"></video></div>
      ${ch.length ? `<section class="sec"><p class="label">Aller directement à…</p><div class="chaps">${ch.map(([t, lbl]) =>
        `<button class="chap" type="button" data-act="seek" data-t="${+t}"><span class="chap-t">${mmss(+t)}</span><span>${esc(lbl)}</span></button>`).join("")}</div></section>` : ""}
      <div class="ctrls center"><button class="btn primary" type="button" data-act="cards">Suite : les cartes →</button></div>`);
    const v = document.getElementById("vid");
    const seen = () => { if (v.duration && v.currentTime / v.duration > .8 && !isDone("video")) markDone("video"); };
    v.addEventListener("timeupdate", seen); v.addEventListener("ended", () => { if (!isDone("video")) markDone("video"); });
  }
  function seek(t){
    const v = document.getElementById("vid"); if (!v) return;
    const go = () => { try { v.currentTime = t; } catch (e) {} const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (v.readyState >= 1) go(); else { v.addEventListener("loadedmetadata", go, {once: true}); v.load(); }
    v.scrollIntoView({behavior: "smooth", block: "center"});
  }

  /* ---------- rédaction : une question comme à l'évaluation, corrigée critère par critère ----------
     M.redaction = {text?, items: [{id, unit, titre, consigne: html, doc?: html, photo?: bool, modele: texte, criteres: [{t, pts}]}]}
     Correction par l'IA (worker /ia/evaluer, jeton obtenu une fois avec le mot de passe) ou par l'élève lui-même. */
  const rdBy = id => RD.find(x => x.id === id);
  const rdSt = id => (S.rd[id] = S.rd[id] || {});
  const rdTotal = it => it.criteres.reduce((a, c) => a + (c.pts || 1), 0);
  let RDX = {mode: "text", img: null, busy: false};
  function iaBlock(where){
    if (iaToken()) return `<p class="fine ia-on">✓ Correction par l'IA activée sur cet appareil.</p>`;
    return `<details class="ia-unlock" id="iaunlock-${where}"><summary>Débloquer la correction par l'IA</summary>
      <form class="ia-form" data-form="ialogin"><label class="label" for="iapw-${where}">Mot de passe</label>
      <div class="numrow"><input class="inp" id="iapw-${where}" type="password" autocomplete="current-password" enterkeyhint="go"><button class="btn primary" type="submit">Débloquer</button></div>
      <p class="fine" id="iamsg-${where}" aria-live="polite">À demander à tes parents. Une seule fois par appareil.</p></form></details>`;
  }
  function rdList(){
    show("rd-list", `${bar("Rédaction", `${RD.length} sujet${RD.length > 1 ? "s" : ""}`)}
      <p class="lead rd-lead">Comme à l'évaluation : lis le document, rédige ta réponse (ou écris-la sur une feuille et prends-la en photo), puis fais-la corriger.</p>
      <div class="rd-list">${RD.map((it, i) => { const st = S.rd[it.id] || {}, u = UBY[it.unit];
        return `<button class="rd-item bristol" type="button" data-act="rdopen" data-id="${esc(it.id)}" style="--r:${[-.5, .4, -.3, .5][i % 4]}deg">
          <span class="rd-top">${u ? tag(u) : ""}<span class="rd-score${st.best !== undefined ? " on" : ""}">${st.best !== undefined ? `${st.best} / ${rdTotal(it)}` : "à faire"}</span></span>
          <span class="rd-t">${esc(it.titre)}</span></button>`; }).join("")}</div>
      ${iaBlock("list")}`);
  }
  function rdOpen(id, keepMode){
    const it = rdBy(id), st = rdSt(id); if (!it) return rdList();
    if (!keepMode) RDX = {mode: "text", img: null, busy: false, id};
    RDX.id = id;
    const tk = iaToken(), photo = it.photo !== false;
    show("rd", `${bar("Rédaction", esc(`${rdTotal(it)} points`))}
      <div class="rd-sheet bristol">
        <div class="fhead">${UBY[it.unit] ? tag(UBY[it.unit]) : ""}<span class="fine push">${st.best !== undefined ? `Meilleure note : ${st.best} / ${rdTotal(it)}` : ""}</span></div>
        <h3 class="rd-h">${esc(it.titre)}</h3>
        ${it.doc ? `<div class="rd-doc"><p class="label">Document</p>${it.doc}</div>` : ""}
        <div class="rd-q"><p class="label">Consigne</p>${it.consigne}</div>
        ${photo ? `<div class="seg" role="group" aria-label="Comment répondre"><button type="button" class="chip" data-act="rdmode" data-m="text" aria-pressed="${RDX.mode === "text"}">J'écris ici</button><button type="button" class="chip" data-act="rdmode" data-m="photo" aria-pressed="${RDX.mode === "photo"}">Photo de ma copie</button></div>` : ""}
        <div id="rdtextbox"${RDX.mode === "text" ? "" : " hidden"}><label class="sr" for="rdtext">Ta réponse</label>
          <textarea id="rdtext" class="rd-text" rows="9" placeholder="Rédige ta réponse en phrases. Appuie-toi sur le document." spellcheck="true" lang="fr">${esc(st.draft || "")}</textarea>
          <p class="fine rd-count" id="rdcount"></p></div>
        <div id="rdphotobox"${RDX.mode === "photo" ? "" : " hidden"}>
          <label class="btn rd-pick" for="rdfile">${RDX.img ? "Reprendre la photo" : "Prendre ma copie en photo"}</label>
          <input id="rdfile" type="file" accept="image/*" capture="environment" hidden>
          ${RDX.img ? `<img class="rd-prev" src="${RDX.img}" alt="Photo de ta copie">` : `<p class="fine">Écris ta réponse sur une feuille (tu peux faire un schéma), puis prends-la en photo, bien à plat et bien éclairée.</p>`}
        </div>
        <p class="rd-err" id="rderr" aria-live="polite"></p>
        <div class="ctrls center stack">
          ${tk ? `<button class="btn primary" type="button" data-act="rdia" id="rdgo">Faire corriger par l'IA</button>` : ""}
          <button class="btn${tk ? " ghost" : " primary"}" type="button" data-act="rdself">Me corriger moi-même</button>
        </div>
        ${tk ? "" : iaBlock("q")}
      </div>
      <div class="ctrls center"><button class="btn ghost" type="button" data-act="redaction">Autres sujets</button></div>`);
    const ta = document.getElementById("rdtext"), cnt = document.getElementById("rdcount");
    const upd = () => { const n = (ta.value.trim().match(/\S+/g) || []).length; cnt.textContent = n ? `${n} mot${n > 1 ? "s" : ""}` : ""; };
    ta.addEventListener("input", () => { st.draft = ta.value; upd(); clearTimeout(rdSave); rdSave = setTimeout(save, 400); }); upd();
    const f = document.getElementById("rdfile");
    if (f) f.addEventListener("change", async () => { const file = f.files && f.files[0]; if (!file) return;
      try { RDX.img = await shrink(file); rdOpen(id, true); } catch (e) { document.getElementById("rderr").textContent = "Impossible de lire cette photo. Réessaie."; } });
  }
  let rdSave = null;
  /* photo réduite à 1600 px de côté, en JPEG, pour l'envoi */
  function shrink(file){
    return new Promise((ok, ko) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => { const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas");
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", .82)); };
      im.onerror = () => { URL.revokeObjectURL(url); ko(new Error("image")); };
      im.src = url;
    });
  }
  function rdAnswer(){ const ta = document.getElementById("rdtext"); return RDX.mode === "photo" ? {image: RDX.img} : {reponse: ta ? ta.value.trim() : ""}; }
  async function rdIA(){
    const it = rdBy(RDX.id), a = rdAnswer(), err = document.getElementById("rderr");
    if (!a.image && !a.reponse) { err.textContent = RDX.mode === "photo" ? "Prends d'abord ta copie en photo." : "Écris d'abord ta réponse."; return; }
    if (a.reponse && a.reponse.split(/\s+/).length < 8) { err.textContent = "Ta réponse est très courte : rédige au moins une ou deux phrases."; return; }
    if (RDX.busy) return; RDX.busy = true;
    const b = document.getElementById("rdgo"); if (b) { b.disabled = true; b.textContent = "Correction en cours…"; }
    try {
      const base = await api(); if (!base) throw new Error("La correction par l'IA n'est pas disponible.");
      const sujet = {matiere: M.eyebrow || M.subtitle || "", titre: it.titre, consigne: htmlText(it.consigne), doc: htmlText(it.doc || ""), modele: it.modele, criteres: it.criteres};
      const res = await fetch(base + "/ia/evaluer", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({token: iaToken(), sujet, ...a})});
      const r = await res.json().catch(() => ({}));
      if (res.status === 401) { try { localStorage.removeItem(IA_KEY); } catch (e) {} }
      if (!res.ok) throw new Error(r.error || "La correction n'a pas pu se faire.");
      rdResult(it, r, "ia");
    } catch (e) {
      err.textContent = (e && e.message) || "Pas de connexion ? Réessaie, ou corrige-toi toi-même.";
      if (b) { b.disabled = false; b.textContent = "Faire corriger par l'IA"; }
    } finally { RDX.busy = false; }
  }
  function rdSelf(){
    const it = rdBy(RDX.id), a = rdAnswer();
    show("rd-self", `${bar("Rédaction", "Je me corrige")}
      <div class="rd-sheet bristol">
        <div class="fhead"><span class="fine">Compare avec la réponse modèle, puis coche honnêtement ce que tu as fait.</span></div>
        ${a.reponse ? `<div class="rd-mine"><p class="label">Ta réponse</p><p>${esc(a.reponse).replace(/\n/g, "<br>")}</p></div>` : a.image ? `<img class="rd-prev" src="${a.image}" alt="Ta copie">` : ""}
        <div class="rd-model"><p class="label">Réponse modèle</p><p>${esc(it.modele).replace(/\n/g, "<br>")}</p></div>
        <p class="label">Dans ma réponse…</p>
        <div class="rd-checks">${it.criteres.map((c, i) => `<label class="rd-check"><input type="checkbox" id="rdc${i}"><span>${esc(c.t)}</span><b>${c.pts || 1} pt${(c.pts || 1) > 1 ? "s" : ""}</b></label>`).join("")}</div>
        <div class="ctrls center stack"><button class="btn primary" type="button" data-act="rdselfok">Voir ma note</button></div>
      </div>`);
  }
  function rdSelfOk(){
    const it = rdBy(RDX.id), crits = it.criteres.map((c, i) => ({ok: !!(document.getElementById("rdc" + i) || {}).checked, commentaire: "", pts: c.pts || 1}));
    rdResult(it, {criteres: crits, points: crits.reduce((a, c) => a + (c.ok ? c.pts : 0), 0), total: rdTotal(it), bilan: "", conseil: "", transcription: ""}, "self");
  }
  function rdResult(it, r, how){
    const st = rdSt(it.id);
    st.best = Math.max(st.best ?? -1, r.points); st.n = (st.n || 0) + 1; st.last = {points: r.points, how, at: Date.now()};
    markDone("redaction");
    const sur20 = Math.round(r.points / r.total * 40) / 2;
    show("rd-res", `${bar("Rédaction", how === "ia" ? "Corrigé par l'IA" : "Autocorrection")}
      <div class="result bristol">
        <div class="fhead"><span class="fine">${esc(it.titre)}</span></div>
        <div class="grade" role="img" aria-label="Note : ${r.points} sur ${r.total}"><svg viewBox="0 0 240 140" aria-hidden="true"><path d="M34 80 C 22 32, 150 12, 206 42 C 240 62, 222 114, 138 124 C 68 132, 16 112, 26 74 C 32 50, 72 28, 130 24"/></svg><span>${r.points}/${r.total}</span></div>
        <p class="sum">soit ${String(sur20).replace(".", ",")}/20${how === "ia" ? " · note indicative" : ""}</p>
        ${r.bilan ? `<p class="verdict rd-bilan">${esc(r.bilan)}</p>` : ""}
        <div class="rd-crits">${it.criteres.map((c, i) => { const x = r.criteres[i] || {}; return `<div class="rd-crit ${x.ok ? "ok" : "ko"}"><span class="rd-mark" aria-label="${x.ok ? "acquis" : "à revoir"}">${x.ok ? "✓" : "✗"}</span><span><b>${esc(c.t)}</b>${x.commentaire ? `<span class="rd-com">${esc(x.commentaire)}</span>` : ""}</span><em>${x.ok ? c.pts || 1 : 0}/${c.pts || 1}</em></div>`; }).join("")}</div>
        ${r.conseil ? `<p class="tip rd-tip"><b>Pour gagner des points :</b> ${esc(r.conseil)}</p>` : ""}
        <div class="ctrls center stack">
          ${r.points < r.total ? `<button class="btn primary" type="button" data-act="rdimprove">Améliorer ma réponse</button>` : ""}
          <button class="btn${r.points < r.total ? "" : " primary"}" type="button" data-act="redaction">Autre sujet</button>
        </div>
        ${r.transcription ? `<details class="misses"><summary>Ce que l'IA a lu sur ta copie</summary><p class="rd-tr">${esc(r.transcription).replace(/\n/g, "<br>")}</p></details>` : ""}
        <details class="misses"><summary>Voir la réponse modèle</summary><p class="rd-tr">${esc(it.modele).replace(/\n/g, "<br>")}</p></details>
      </div>`);
    save();
  }
  async function iaLogin(form){
    const inp = form.querySelector("input"), msg = form.querySelector("[id^=iamsg]"), btn = form.querySelector("button");
    const pw = inp.value.trim(); if (!pw) { inp.focus(); return; }
    btn.disabled = true; msg.textContent = "Vérification…";
    try {
      const base = await api(); if (!base) throw new Error("Service indisponible.");
      const res = await fetch(base + "/ia/login", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({password: pw})});
      const r = await res.json().catch(() => ({}));
      if (!res.ok || !r.token) throw new Error(r.error || "Impossible pour le moment.");
      try { localStorage.setItem(IA_KEY, r.token); } catch (e) {}
      if (cur === "rd") rdOpen(RDX.id, true); else rdList();
    } catch (e) { msg.textContent = e.message; btn.disabled = false; }
  }
  const htmlText = h => { const d = document.createElement("div"); d.innerHTML = h; d.querySelectorAll("svg").forEach(x => x.replaceWith(" [schéma] ")); return d.textContent.replace(/\s+/g, " ").trim(); };

  /* ---------- glisser (cartes, quiz, contrôle) ---------- */
  /* dirAction(dir) renvoie la fonction à lancer pour un glissé vers « left » ou « right », ou null (la carte revient) */
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function swipe(el, dirAction){
    if (!el) return;
    let id = null, x0 = 0, y0 = 0, t0 = 0, dx = 0, drag = false;
    el.addEventListener("pointerdown", e => {
      if ((e.pointerType === "mouse" && e.button !== 0) || e.target.closest("input, textarea, select, video")) return;
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); dx = 0; drag = false;
    });
    el.addEventListener("pointermove", e => {
      if (e.pointerId !== id) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!drag && Math.abs(mx) > 12 && Math.abs(mx) > Math.abs(my) * 1.3) { drag = true; try { el.setPointerCapture(id); } catch (err) {} el.classList.add("dragging"); }
      if (drag) { dx = mx; el.style.transform = `translateX(${dx}px) rotate(${dx / 45}deg)`; }
    });
    const end = e => {
      if (e.pointerId !== id) return;
      id = null;
      if (!drag) return;
      el.classList.remove("dragging"); el.dataset.dragged = "1"; setTimeout(() => { delete el.dataset.dragged; }, 80);
      const fast = Math.abs(dx) / Math.max(1, Date.now() - t0) > .55, fn = (Math.abs(dx) > 80 || fast) ? dirAction(dx < 0 ? "left" : "right") : null;
      if (fn) {
        if (calm) { el.style.transform = ""; fn(); return; }
        el.classList.add("fly"); el.style.transform = `translateX(${dx < 0 ? -110 : 110}vw) rotate(${dx < 0 ? -10 : 10}deg)`;
        setTimeout(fn, 170);
      } else { el.classList.add("snap"); el.style.transform = ""; setTimeout(() => el.classList.remove("snap"), 220); }
    };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  }

  /* ---------- cartes : répétition espacée (boîtes de Leitner) ----------
     Chaque carte a une boîte de 1 à 5. « Je savais » la fait monter d'une boîte et la renvoie à plus tard
     (1, 3, 7, 14 puis 30 jours ; plus court quand un contrôle approche), « À revoir » la remet en boîte 1 et
     la refait passer quelques cartes plus loin dans la même séance. Acquise = boîte 4 ou 5 (trois rappels espacés réussis). */
  const INT = [0, 1, 3, 7, 14, 30];
  const now = () => (window.__revisionNow ? new Date(window.__revisionNow) : new Date());
  const dayKey = d => { const x = d || now(); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
  const addDays = n => { const d = now(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return dayKey(d); };
  const daysUntil = key => { const [y, m, d] = key.split("-").map(Number), n0 = now(); n0.setHours(12, 0, 0, 0); return Math.round((new Date(y, m - 1, d, 12) - n0) / 864e5); };
  const hash = t => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
  const plain = h => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  /* Identifiant = notion + empreinte du recto ; une carte dont on change l'affichage garde sa progression
     si elle donne son ancien recto dans idFront. */
  function allCards(list){
    const seen = {};
    return M.cards(list || pool(), R).map(c => {
      let id = (c.unit ? c.unit.id : "") + ":" + hash(plain(c.idFront ?? c.front));
      if (seen[id]) id += "-" + (++seen[id]); else seen[id] = 1;
      return Object.assign(c, {id});
    });
  }
  const cst = c => S.cb[c.id] || null;
  const isDue = c => { const x = cst(c); return !!x && x.due <= dayKey(); };
  const isHard = c => { const x = cst(c); return !!x && x.b <= 1 && x.ko > 0; };   // ratée au moins une fois et pas encore remontée
  const examIn = () => { if (!M.countdown) return null; const d = daysUntil(M.countdown.date); return d > 0 ? d : null; };
  function nextDue(b){
    let n = INT[b];
    const d = examIn();
    if (d) { n = Math.min(n, Math.max(1, Math.ceil(d * .4))); if (n >= d) n = Math.max(1, d - 1); }   // revoir avant le contrôle
    return addDays(n);
  }
  function gradeCard(c, ok, relearn){
    const x = cst(c) || {b: 0, ok: 0, ko: 0};
    if (!cst(c)) { const t = dayKey(); if (S.nd.d !== t) S.nd = {d: t, n: 0}; S.nd.n++; }
    if (ok) { x.b = relearn ? 1 : Math.min(5, x.b + 1); x.ok++; x.due = nextDue(x.b); }
    else { x.b = 1; x.ko++; x.due = dayKey(); }
    S.cb[c.id] = x;
  }
  /* Nouvelles cartes par jour : 10, ou assez pour toutes les avoir vues 2 jours avant le contrôle */
  function newPerDay(all){
    const left = all.filter(c => !cst(c)).length, d = examIn();
    return Math.min(25, Math.max(10, d ? Math.ceil(left / Math.max(1, d - 2)) : 0));
  }
  function today(all){
    all = all || allCards();
    const t = dayKey(), usedNew = S.nd.d === t ? S.nd.n : 0, perDay = newPerDay(all);
    const due = all.filter(isDue).sort((a, b) => cst(a).b - cst(b).b || (cst(a).due < cst(b).due ? -1 : 1));
    const fresh = all.filter(c => !cst(c));
    const ex = examIn(), cap = ex && ex <= 14 ? 40 : 20, d = due.slice(0, cap);   // séance plus longue quand le contrôle approche
    const n = fresh.slice(0, Math.max(0, Math.min(perDay - usedNew, cap - d.length)));
    return {all, due: d, fresh: n, dueAll: due.length, freshAll: fresh.length};
  }
  /* Mélanger en alternant les notions (pratique entrelacée) */
  function interleave(cards){
    const by = {};
    for (const c of shuffle(cards)) (by[c.unit ? c.unit.id : "_"] = by[c.unit ? c.unit.id : "_"] || []).push(c);
    const qs = shuffle(Object.values(by)), out = [];
    while (qs.some(q => q.length)) for (const q of qs) if (q.length) out.push(q.shift());
    return out;
  }
  function nextReview(all){
    const t = dayKey(), fut = all.map(cst).filter(x => x && x.due > t).map(x => x.due).sort();
    if (!fut.length) return "";
    const d = fut[0], n = fut.filter(x => x === d).length, k = daysUntil(d);
    return `Prochaine révision ${k === 1 ? "demain" : `dans ${k} jours`} : ${n} carte${n > 1 ? "s" : ""}.`;
  }
  const boxChip = c => { const x = cst(c);
    return !x ? `<span class="kbox new">Nouvelle</span>` : x.b <= 1 ? `<span class="kbox ko">À revoir</span>` : x.b >= 4 ? `<span class="kbox ok">Acquise</span>` : `<span class="kbox mid">En cours</span>`; };

  /* écran d'entrée des cartes */
  function cardsHome(){
    const T = today(), all = T.all, nToday = T.due.length + T.fresh.length;
    const nNew = all.filter(c => !cst(c)).length, nAcq = all.filter(c => cst(c) && cst(c).b >= 4).length, nMid = all.length - nNew - nAcq;
    const nHard = all.filter(isHard).length, pc = k => `${(k / all.length * 100).toFixed(1)}%`;
    const parts = [T.due.length ? `${T.due.length} à revoir` : "", T.fresh.length ? `${T.fresh.length} nouvelle${T.fresh.length > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ");
    show("cards-home", `${bar("Cartes", `${all.length} cartes`)}
      <div class="kday bristol">
        <div class="fhead"><span class="fine">Cartes du jour</span>${examIn() ? `<span class="fine push">Contrôle dans ${examIn()} j</span>` : ""}</div>
        ${nToday ? `<p class="kbig"><b>${nToday}</b> carte${nToday > 1 ? "s" : ""} aujourd'hui</p>
          <p class="sum">${parts} · environ ${Math.max(2, Math.round(nToday / 3))} min</p>
          <div class="ctrls center stack"><button class="btn primary" type="button" data-act="kday">Commencer</button></div>`
        : `<p class="kbig">C'est tout pour aujourd'hui !</p><p class="sum">${esc(nextReview(all)) || "Toutes les cartes sont vues."}</p>
          <div class="ctrls center stack"><button class="btn" type="button" data-act="kextra">M'entraîner quand même</button><button class="btn primary" type="button" data-act="quiz">Suite : le quiz →</button></div>`}
      </div>
      <div class="kstate" aria-label="État des cartes">
        <div class="kbar"><i class="new" style="width:${pc(nNew)}"></i><i class="mid" style="width:${pc(nMid)}"></i><i class="ok" style="width:${pc(nAcq)}"></i></div>
        <p class="klegend"><span><i class="new"></i>${nNew} nouvelle${nNew > 1 ? "s" : ""}</span><span><i class="mid"></i>${nMid} en cours</span><span><i class="ok"></i>${nAcq} acquise${nAcq > 1 ? "s" : ""}</span></p>
      </div>
      <div class="kmore">
        ${nHard ? `<button class="btn" type="button" data-act="khard">Mes cartes difficiles (${nHard})</button>` : ""}
        <button class="btn" type="button" data-act="kbrowse">Parcourir toutes les cartes</button>
      </div>
      <p class="fine kwhy">Une carte que tu sais revient de plus en plus tard (demain, dans 3 jours, 1 semaine, 2 semaines…) : c'est en révisant juste avant d'oublier qu'on retient longtemps. Une carte à revoir revient dans la séance, puis le lendemain.</p>`);
  }

  /* séance notée : "day" (cartes du jour), "extra" (entraînement en plus), "hard" (cartes difficiles) */
  let K = null;
  function startSession(mode, cards){
    if (mode === "day") { const T = today(); cards = interleave(T.due).concat(T.fresh); }
    if (!cards || !cards.length) { cardsHome(); return; }
    K = {mode, q: cards, i: 0, on: false, first: {}, last: {}, rep: {}, failed: new Set()};
    renderCard();
  }
  const cardsByUnits = ids => { const set = new Set(ids), a = allCards(selected()).filter(c => c.unit && set.has(c.unit.id));
    return a.sort((x, y) => (cst(x) ? cst(x).b : 0) - (cst(y) ? cst(y).b : 0)).slice(0, 15); };
  function renderCard(){
    const c = K.q[K.i], n = K.q.length;
    const head = `<span class="fhead">${c.unit ? tag(c.unit) : ""}<span class="push">${boxChip(c)}</span></span>`;
    const title = K.mode === "hard" ? "Cartes difficiles" : K.mode === "extra" ? "Entraînement" : "Cartes du jour";
    show("cards", `${bar(title, `${K.i + 1} / ${n}`)}
      <div class="kprog" aria-hidden="true"><i style="width:${(K.i / n * 100).toFixed(1)}%"></i></div>
      <div class="flash" id="flash">
        <div class="flip${K.on ? " on" : ""}" id="flip" role="button" tabindex="0" data-act="flip" aria-label="Retourner la carte">
          <div class="face front bristol" aria-hidden="${K.on}">${head}${c.front}</div>
          <div class="face back bristol" aria-hidden="${!K.on}">${head}${c.back}</div>
        </div>
      </div>
      <div class="rate" id="rate"${K.on ? "" : " hidden"}>
        <button class="btn rate-ko" type="button" data-act="rate" data-v="0">À revoir</button>
        <button class="btn primary" type="button" data-act="rate" data-v="1">Je savais</button>
      </div>
      <div class="ctrls center" id="reveal"${K.on ? " hidden" : ""}><button class="btn primary wide" type="button" data-act="flip">Voir la réponse</button></div>
      ${c.extra ? `<div class="ctrls center">${c.extra}</div>` : ""}
      <p class="fine hint" id="khint">${K.on ? "Glisse la carte à droite si tu savais, à gauche s'il faut la revoir." : "Cherche la réponse dans ta tête, puis retourne la carte."}</p>`);
    swipe(document.getElementById("flash"), dir => K.on ? () => rate(dir === "right" ? 1 : 0) : null);
  }
  function flip(){
    const st = cur === "cards-browse" ? Bw : K;
    st.on = !st.on;
    const f = document.getElementById("flip"); if (!f) return;
    f.classList.toggle("on", st.on);
    f.querySelector(".front").setAttribute("aria-hidden", st.on);
    f.querySelector(".back").setAttribute("aria-hidden", !st.on);
    if (cur === "cards") {
      const r = document.getElementById("rate"), rv = document.getElementById("reveal"), h = document.getElementById("khint");
      if (r) r.hidden = !st.on; if (rv) rv.hidden = st.on;
      if (h) h.textContent = st.on ? "Glisse la carte à droite si tu savais, à gauche s'il faut la revoir." : "Cherche la réponse dans ta tête, puis retourne la carte.";
    }
  }
  function rate(v){
    const c = K.q[K.i];
    if (!(c.id in K.first)) K.first[c.id] = v;
    K.last[c.id] = v;
    if (K.mode === "day") gradeCard(c, !!v, v && K.failed.has(c.id));
    else if (!v) gradeCard(c, false);                 // entraînement en plus : une erreur compte, une réussite n'avance pas la carte
    if (!v) {
      K.failed.add(c.id); K.rep[c.id] = (K.rep[c.id] || 0) + 1;
      if (K.rep[c.id] <= 3) K.q.splice(Math.min(K.q.length, K.i + 4), 0, c);   // elle revient trois cartes plus loin
    }
    save();
    if (K.i < K.q.length - 1) { K.i++; K.on = false; renderCard(); } else cardsEnd();
  }
  function cardsEnd(){
    const ids = Object.keys(K.first), firstOk = ids.filter(id => K.first[id] === 1).length;
    const back = ids.filter(id => K.first[id] === 0 && K.last[id] === 1).length, still = ids.filter(id => K.last[id] === 0);
    for (const id of still) if (S.cb[id]) S.cb[id].due = addDays(1);   // pas retrouvée aujourd'hui : demain
    if (K.mode === "day") markDone("cards"); else save();
    const T = today(), more = T.due.length + T.fresh.length, nHard = T.all.filter(isHard).length;
    show("cards-end", `${bar("Cartes", "Terminé")}
      <div class="result bristol">
        <div class="fhead"><span class="fine">${ids.length} carte${ids.length > 1 ? "s" : ""} révisée${ids.length > 1 ? "s" : ""}</span></div>
        <p class="tally"><span class="t-ok"><b>${firstOk}</b> du premier coup</span>${back ? `<span class="t-mid"><b>${back}</b> retrouvée${back > 1 ? "s" : ""}</span>` : ""}${still.length ? `<span class="t-ko"><b>${still.length}</b> à revoir demain</span>` : ""}</p>
        <p class="sum">${K.mode === "day" ? esc(nextReview(T.all)) : "Ces cartes reviendront à leur date dans les cartes du jour."}</p>
        <div class="ctrls center stack">
          ${more ? `<button class="btn primary" type="button" data-act="kday">Encore ${more} carte${more > 1 ? "s" : ""} pour aujourd'hui</button>` : `<button class="btn primary" type="button" data-act="quiz">Suite : le quiz →</button>`}
          ${nHard && K.mode !== "hard" ? `<button class="btn" type="button" data-act="khard">Mes cartes difficiles (${nHard})</button>` : ""}
          <button class="btn ghost" type="button" data-act="cards">Retour aux cartes</button>
        </div>
      </div>`);
  }

  /* parcourir librement toutes les cartes, notion par notion (sans noter) */
  let Bw = null;
  function browse(unitId){
    const list = allCards();
    let i = 0;
    if (unitId) { const k = list.findIndex(c => c.unit && c.unit.id === unitId); if (k >= 0) i = k; }
    else if (Bw && Bw.list.length === list.length) i = Math.min(Bw.i, list.length - 1);
    Bw = {list, i, on: false};
    renderBrowse();
  }
  function renderBrowse(){
    const {list, i} = Bw, c = list[i], n = list.length, uid = c.unit ? c.unit.id : "";
    const us = units.filter(u => list.some(x => x.unit && x.unit.id === u.id));
    const head = `<span class="fhead">${c.unit ? tag(c.unit) : ""}<span class="push">${boxChip(c)}</span></span>`;
    show("cards-browse", `${bar("Toutes les cartes", `${i + 1} / ${n}`)}
      ${us.length > 1 ? `<div class="kjump" role="group" aria-label="Aller à une notion">${us.map(u => `<button class="chip" type="button" data-act="kjump" data-u="${esc(u.id)}" aria-pressed="${u.id === uid}">${esc(u.tag || u.name)}</button>`).join("")}</div>` : ""}
      <div class="flash" id="flash">
        <div class="flip${Bw.on ? " on" : ""}" id="flip" role="button" tabindex="0" data-act="flip" aria-label="Retourner la carte">
          <div class="face front bristol" aria-hidden="${Bw.on}">${head}${c.front}</div>
          <div class="face back bristol" aria-hidden="${!Bw.on}">${head}${c.back}</div>
        </div>
      </div>
      <div class="ctrls">
        <button class="btn" type="button" data-act="bprev" ${i === 0 ? "disabled" : ""}>← Précédente</button>
        ${c.extra || ""}
        <button class="btn" type="button" data-act="bnext" ${i === n - 1 ? "disabled" : ""}>Suivante →</button>
      </div>
      <p class="fine hint">Glisse la carte pour avancer ou reculer. Ici on lit sans noter : pour retenir, fais les cartes du jour.</p>
      <div class="ctrls center"><button class="btn ghost" type="button" data-act="cards">Retour aux cartes</button></div>`);
    const fl = document.getElementById("flash"), j = screen.querySelector('.kjump [aria-pressed="true"]');
    if (j) j.scrollIntoView({block: "nearest", inline: "center"});
    swipe(fl, dir => dir === "left" ? (Bw.i < Bw.list.length - 1 ? () => bMove(1) : null) : (Bw.i > 0 ? () => bMove(-1) : null));
  }
  function bMove(d){ Bw.i = Math.max(0, Math.min(Bw.list.length - 1, Bw.i + d)); Bw.on = false; renderBrowse(); }

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
    swipe(screen.querySelector(".qcard"), dir => dir === "left" && Q.done ? () => act("qnext") : null);
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
  const missList = list => list.length ? `<details class="misses"><summary>${list.length > 1 ? `Voir mes ${list.length} erreurs` : "Voir mon erreur"}</summary>${list.map(x => `<div class="miss">${x.review}</div>`).join("")}</details>` : "";
  const unitIds = list => [...new Set(list.map(x => x.unit && x.unit.id).filter(Boolean))];
  function quizEnd(){
    markDone("quiz");
    const note = Math.round(Q.score / Q.qs.length * 40) / 2;
    show("quiz-end", `${bar("Quiz", "Terminé")}
      <div class="result bristol">
        <div class="fhead"><span class="fine">Résultat</span></div>
        ${grade(note)}
        <p class="verdict">${verdict(note)}</p>
        <p class="sum">${Q.score} bonne${Q.score > 1 ? "s" : ""} réponse${Q.score > 1 ? "s" : ""} sur ${Q.qs.length}${Q.best >= 2 ? ` · meilleure série : ${Q.best}` : ""}.</p>
        <div class="ctrls center stack">
          <button class="btn primary" type="button" data-act="control">Suite : le contrôle →</button>
          ${Q.wrong.length ? `<button class="btn" type="button" data-act="kfix" data-from="quiz">Revoir les cartes de mes erreurs</button>` : ""}
          <button class="btn ghost" type="button" data-act="quiz">Rejouer le quiz</button>
        </div>
        ${missList(Q.wrong)}
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
    swipe(document.getElementById("cform"), dir => dir === "left" && C.checked ? () => nextC() : null);
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
    const remark = all || it.kind === "choice" ? `<span class="remark ${all ? "ok" : "ko"}">${pick(all ? GOOD : BAD)}</span>` : "";  // champ faux : la correction rouge sous le champ suffit
    document.getElementById("cfb").innerHTML = `${remark}${full ? `<span class="fullline">Maîtrisé : <b>${esc(u.name)}</b> !</span>` : ""}${fb}${!all && it.tip ? `<span class="tip">${esc(it.tip)}</span>` : ""}`;
    C.checked = true;
    const b = document.getElementById("cbtn"); b.hidden = false;
    b.textContent = C.i < C.q.length - 1 ? "Question suivante →" : "Voir ma note";
    b.focus({preventScroll: true});
  }
  function nextC(){ C.i++; C.checked = false; if (C.i >= C.q.length) cResults(); else renderCItem(); }
  function cResults(){
    markDone("control");
    const note = Math.round(C.pts / C.q.length * 40) / 2;
    const miss = C.res.filter(r => !r.all).map(r => r.it), nOk = C.res.length - miss.length;
    C.miss = miss;
    show("control-end", `${bar("Contrôle", "Terminé")}
      <div class="result bristol">
        <div class="fhead"><span class="fine">Copie corrigée</span></div>
        ${grade(note)}
        <p class="verdict">${verdict(note)}</p>
        <p class="sum">${nOk} réponse${nOk > 1 ? "s" : ""} sans faute sur ${C.res.length}.</p>
        <div class="ctrls center stack">
          ${miss.length ? `<button class="btn primary" type="button" data-act="cretry">Refaire mes erreurs (${miss.length})</button>
          <button class="btn" type="button" data-act="kfix" data-from="control">Revoir les cartes de ces notions</button>` : ""}
          ${RD.length ? `<button class="btn${miss.length ? "" : " primary"}" type="button" data-act="redaction">Suite : une question rédigée →</button>` : ""}
          <button class="btn${miss.length || RD.length ? " ghost" : " primary"}" type="button" data-act="cstart">Nouveau contrôle</button>
        </div>
        ${missList(miss)}
      </div>
      ${progDetails()}`);
  }

  /* ---------- croquis : replacer les éléments sur un fond de carte vierge ----------
     M.croquis = {text?, badge?, consigne?: html, points?: [[lon, lat]] (villes imprimées sur le fond, leurres),
       legende?: [{id, t, c: "#hex"}], series?: [{id, t, ids}],
       elements: [{id, nom, court? (sur la carte), unit?, lon, lat, zone?: [[lon, lat, rx°, ry°]], cercle? (zone entourée au corrigé), couleur?: id de legende, aide?}]}
     Sans zone : une ville, à poser sur un des petits ronds. Avec zone : un océan, une région (on touche dedans).
     Le fond (lib/planisphere.js) est chargé à la demande. Meilleur score par série dans S.cq. */
  let mapP = null;
  function loadMap(){
    if (window.Revision && Revision.planisphere) return Promise.resolve();
    if (mapP) return mapP;
    mapP = new Promise((ok, ko) => {
      const s = document.createElement("script");
      s.src = new URL(LIB ? "planisphere.js" : "../../lib/planisphere.js", LIB || location.href).href;
      s.onload = () => ok(); s.onerror = () => { mapP = null; s.remove(); ko(); };
      document.head.appendChild(s);
    });
    return mapP;
  }
  let CQG = null, CQS = null;
  function cqGeo(){
    if (CQG) return CQG;
    const P = Revision.planisphere, W = P.w;
    const els = CQ.elements.map(e => {
      const [x, y] = P.proj(e.lon, e.lat);
      const Z = e.zone ? e.zone.map(([lo, la, rx, ry]) => { const [cx] = P.proj(lo, la), y1 = P.proj(lo, la + ry)[1], y2 = P.proj(lo, la - ry)[1];
        return {cx, cy: (y1 + y2) / 2, rx: rx / 360 * W, ry: (y2 - y1) / 2}; }) : null;
      return Object.assign({}, e, {x, y, Z});
    });
    const dots = els.filter(e => !e.Z).map(e => ({x: e.x, y: e.y, id: e.id}));
    (CQ.points || []).forEach(([lo, la]) => { const [x, y] = P.proj(lo, la); if (!dots.some(d => Math.hypot(d.x - x, d.y - y) < .8)) dots.push({x, y, id: null}); });
    dots.forEach((d, i) => { d.i = i; });
    const LEG = Object.fromEntries((CQ.legende || []).map(l => [l.id, l]));
    CQG = {P, W, H: P.h, els, byId: Object.fromEntries(els.map(e => [e.id, e])), dots, LEG};
    return CQG;
  }
  const cqSeries = () => [...(CQ.series || []).map(x => ({id: x.id, t: x.t, ids: (x.ids || []).filter(id => CQG.byId[id])})).filter(x => x.ids.length),
    {id: "tout", t: "Tout le croquis", ids: CQG.els.map(e => e.id)}];
  const cqColor = () => S.cqc !== false && Object.keys(CQG.LEG).length > 0;
  const needsColor = e => cqColor() && !!e.couleur && !!CQG.LEG[e.couleur];
  function cqOpen(){
    show("croquis", `${bar("Croquis", "")}<p class="lead">Chargement de la carte…</p>`);
    loadMap().then(() => { cqGeo(); const sr = cqSeries(); cqStart((sr.find(x => x.id === S.cqs) || sr[0]).id); })
      .catch(() => show("croquis", `${bar("Croquis", "")}<p class="lead">La carte n'a pas pu se charger. Vérifie la connexion, puis réessaie.</p>
        <div class="ctrls center"><button class="btn primary" type="button" data-act="croquis">Réessayer</button></div>`));
  }
  function cqStart(sid, ids){
    const sr = cqSeries().find(x => x.id === sid) || cqSeries()[0];
    if (sid !== "erreurs") { S.cqs = sr.id; save(); }
    const list = shuffle(ids || sr.ids);
    CQS = {sid: ids ? "erreurs" : sr.id, ids: list, placed: {}, active: list[0], color: null, checked: false, res: null,
      view: {x: 0, y: 0, w: CQG.W}, msg: ""};
    cqRender(true);
  }
  const cqLeft = () => CQS.ids.filter(id => !CQS.placed[id] || (needsColor(CQG.byId[id]) && !CQS.placed[id].c));
  function cqNext(){ const l = CQS.ids.filter(id => !CQS.placed[id]); CQS.active = l[0] || null; }
  /* largeur de la carte à l'écran en px (avant même l'affichage) et échelle px / unité de la vue courante */
  const cqPx = () => { const m = document.getElementById("cqmap"); return Math.max(260, (m ? m.clientWidth : Math.min(screen.clientWidth, 1100)) - 2); };
  const cqK = () => cqPx() / CQS.view.w;
  function cqSvg(){
    const G = cqGeo(), V = CQS.view, k = cqK(), u = px => +(px / k).toFixed(2), h = V.w * G.H / G.W;
    const fs = u(cqPx() < 600 ? 10 : 13), halo = u(3.2), r = u(CQS.view.w < G.W ? 6 : 3.4), out = [];
    out.push(`<rect class="cq-sea" x="-5" y="-5" width="${G.W + 10}" height="${G.H + 10}"/><path class="cq-land" d="${G.P.d}" style="stroke-width:${u(.8)}"/>`);
    const labs = [], txt = (x, y, t, cls, anchor = "start") => { labs.push({x, y, t, cls, mid: anchor === "middle"}); return ""; };
    const fill = (e, c) => c && G.LEG[c] ? G.LEG[c].c : "";
    const cross = (x, y, cls) => { const a = u(6); return `<path class="${cls}" d="M${x - a} ${y - a}L${x + a} ${y + a}M${x - a} ${y + a}L${x + a} ${y - a}" style="stroke-width:${u(2.5)}"/>`; };
    if (CQS.checked) {
      CQS.ids.forEach(id => { const e = G.byId[id], R = CQS.res[id];
        if (e.Z && e.cercle) e.Z.forEach(z => out.push(`<ellipse class="cq-zone ${R.pos ? "ok" : "ko"}" cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}" style="stroke-width:${u(2)};stroke-dasharray:${u(6)} ${u(4)}"/>`));
        else if (!R.pos) { const p = CQS.placed[id]; out.push(`<line class="cq-link" x1="${p.x}" y1="${p.y}" x2="${e.x}" y2="${e.y}" style="stroke-width:${u(1.6)};stroke-dasharray:${u(4)} ${u(3)}"/>`); }
      });
    }
    G.dots.forEach(d => { const p = Object.values(CQS.placed).some(q => q.dot === d.i); if (!p || CQS.checked) out.push(`<circle class="cq-dot" cx="${d.x}" cy="${d.y}" r="${r}" style="stroke-width:${u(1.2)}"/>`); });
    CQS.ids.forEach(id => {
      const e = G.byId[id], p = CQS.placed[id]; if (!p) return;
      const R = CQS.checked ? CQS.res[id] : null, okAll = R && R.pos && R.col !== false;
      if (e.Z) {
        if (R && !R.pos) out.push(cross(p.x, p.y, "cq-x"));
        if (!R || !R.pos) out.push(`<circle class="cq-pin${R ? " ko" : ""}" cx="${p.x}" cy="${p.y}" r="${u(4)}"/>`);
        out.push(txt(R && !R.pos ? e.x : p.x, (R && !R.pos ? e.y : p.y) - u(8), e.court || e.nom, `cq-lab${R ? (okAll ? " ok" : " ko") : ""}`, "middle"));
        if (R && !R.pos) out.push(txt(p.x, p.y + u(18), "ta réponse", "cq-lab ko small", "middle"));
      } else {
        const c = R ? (e.couleur && G.LEG[e.couleur] ? G.LEG[e.couleur].c : "") : fill(e, p.c);
        if (R && !R.pos) { out.push(cross(p.x, p.y, "cq-x")); out.push(txt(p.x + u(8), p.y + u(16), "✗ " + (e.court || e.nom), "cq-lab ko small")); }
        const x = R ? e.x : p.x, y = R ? e.y : p.y;
        out.push(`<circle class="cq-city${c ? " col" : ""}${R ? (okAll ? " ok" : " ko") : ""}" cx="${x}" cy="${y}" r="${u((c ? 6 : 5) * (cqPx() < 600 ? .7 : 1))}" style="${c ? `fill:${c};` : ""}stroke-width:${u(1.6)}"/>`);
        out.push(txt(x + u(9), y - u(6), e.court || e.nom, `cq-lab${R ? (okAll ? " ok" : " ko") : ""}`));
      }
    });
    /* étiquettes : on essaie plusieurs places autour du point et on garde la première qui ne chevauche rien */
    const lh = fs * 1.05, boxes = labs.filter(L => !L.mid).map(L => ({x: L.x - u(9) - lh * .4, y: L.y - lh * .1, w: lh * .9, h: lh * .9}));   // les points des villes
    labs.sort((a, b) => a.mid - b.mid).forEach(L => {
      const w = L.t.length * fs * .56, d = u(9);
      const tries = L.mid ? [[-w / 2, 0], [-w / 2, -lh * 1.1], [-w / 2, lh * 1.3], [d, lh * .4], [-w - d, lh * .4], [-w / 2, -lh * 2.3], [-w / 2, lh * 2.6], [d * 2, -lh], [-w - d * 2, -lh]]
        : [[0, 0], [0, lh * 1.25], [-w - u(18), 0], [-w - u(18), lh * 1.25], [-w / 2 - u(9), -lh * .5], [-w / 2 - u(9), lh * 2.2]];
      let best = tries[0];
      const inV = b => b.x >= V.x && b.x + b.w <= V.x + V.w && b.y >= V.y && b.y + b.h <= V.y + h;
      for (const [dx, dy] of [...tries.filter(([dx, dy]) => inV({x: L.x + dx, y: L.y + dy - lh, w, h: lh})), ...tries]) { const b = {x: L.x + dx, y: L.y + dy - lh, w, h: lh};
        if (!boxes.some(o => b.x < o.x + o.w && o.x < b.x + b.w && b.y < o.y + o.h && o.y < b.y + b.h)) { best = [dx, dy]; break; } }
      boxes.push({x: L.x + best[0], y: L.y + best[1] - lh, w, h: lh});
      out.push(`<text class="${L.cls}" x="${(L.x + best[0]).toFixed(1)}" y="${(L.y + best[1]).toFixed(1)}" style="font-size:${fs}px;stroke-width:${halo}px">${esc(L.t)}</text>`);
    });
    return `<svg id="cqsvg" class="cq-svg" viewBox="${V.x.toFixed(1)} ${V.y.toFixed(1)} ${V.w.toFixed(1)} ${h.toFixed(1)}" role="img" aria-label="Planisphère vierge">${out.join("")}</svg>`;
  }
  function cqRender(top){
    const G = cqGeo(), n = CQS.ids.length, done = n - cqLeft().length, sr = cqSeries(), act = CQS.active && G.byId[CQS.active];
    const zoomed = CQS.view.w < G.W - 1, colorE = CQS.color && G.byId[CQS.color];
    let ask;
    if (CQS.checked) ask = "";
    else if (colorE) ask = `De quelle couleur colories-tu <b>${esc(colorE.nom)}</b> ?`;
    else if (act) ask = `Où places-tu <b>${esc(act.nom)}</b> ? ${act.Z ? "Touche la carte à cet endroit." : "Touche le petit rond de la ville."}`;
    else ask = "Tout est placé ! Vérifie quand tu es prêt, ou touche une étiquette pour la déplacer.";
    const legend = CQ.legende && cqColor() ? `<div class="cq-leg">${CQ.legende.map(l => `<button class="cq-sw" type="button" data-act="cqcolor" data-c="${esc(l.id)}"${colorE ? "" : " disabled"}><i style="background:${esc(l.c)}"></i>${esc(l.t)}</button>`).join("")}</div>` : "";
    let res = "";
    if (CQS.checked) {
      const ko = CQS.ids.filter(id => !CQS.res[id].all), okN = n - ko.length;
      res = `<div class="cq-res bristol"><span class="remark ${ko.length ? "ko" : "ok"}">${ko.length ? (okN >= n * .7 ? "Presque !" : "À revoir") : pick(GOOD)}</span>
        <p class="sum"><b>${okN} / ${n}</b> bien placé${okN > 1 ? "s" : ""}${cqColor() ? " (et bien colorié" + (okN > 1 ? "s" : "") + ")" : ""}. Sur la carte : en vert la bonne place, en rouge ta réponse.</p>
        ${ko.length ? `<div class="misses">${ko.map(id => { const e = G.byId[id], R = CQS.res[id];
          const why = !R.pos ? (e.Z ? "pas au bon endroit" : R.other ? `placé sur le point de ${esc(R.other)}` : "pas au bon endroit")
            : `bien placé, mais c'est en <b>${esc(G.LEG[e.couleur].t.toLowerCase())}</b>`;
          return `<div class="miss"><b>${esc(e.nom)}</b><span class="muted">${why}</span>${e.aide ? `<span class="q">${esc(e.aide)}</span>` : ""}</div>`; }).join("")}</div>` : ""}
        <div class="ctrls center stack">
          ${ko.length ? `<button class="btn primary" type="button" data-act="cqretry">Refaire mes erreurs (${ko.length})</button>` : ""}
          <button class="btn${ko.length ? "" : " primary"}" type="button" data-act="cqagain">Recommencer</button>
          ${RD.length ? `<button class="btn ghost" type="button" data-act="redaction">Suite : une question rédigée →</button>` : ""}
        </div></div>`;
    }
    const y = window.scrollY;
    show("croquis", `${bar("Croquis", CQS.checked ? "Corrigé" : `${done} / ${n} placé${done > 1 ? "s" : ""}`)}
      ${CQ.consigne && top ? `<p class="lead cq-lead">${CQ.consigne}</p>` : ""}
      <div class="chips cq-series" role="group" aria-label="Série">${sr.map(x => `<button class="chip" type="button" data-act="cqserie" data-s="${esc(x.id)}" aria-pressed="${CQS.sid === x.id}">${esc(x.t)}${S.cq[x.id] !== undefined ? ` · ${S.cq[x.id]} %` : ""}</button>`).join("")}
        ${CQ.legende ? `<button class="chip" type="button" data-act="cqcol" aria-pressed="${cqColor()}">Colorier aussi</button>` : ""}</div>
      ${ask ? `<p class="cq-ask" aria-live="polite">${ask}</p>` : ""}
      ${CQS.checked ? `<p class="fine cq-hint">Touche la carte pour l'agrandir.</p>` : ""}
      ${CQS.msg ? `<p class="cq-msg" role="status">${esc(CQS.msg)}</p>` : ""}
      <div class="cq-map bristol${zoomed ? " zoomed" : ""}" id="cqmap">${cqSvg()}
        ${zoomed ? `<button class="btn small cq-unzoom" type="button" data-act="cqunzoom">Voir toute la carte</button>` : ""}</div>
      ${res}
      ${!CQS.checked ? legend : ""}
      ${!CQS.checked ? `<div class="chips cq-tray" role="group" aria-label="Étiquettes à placer">${CQS.ids.map(id => { const e = G.byId[id], p = CQS.placed[id];
        return `<button class="chip cq-chip${p ? " placed" : ""}" type="button" data-act="cqpick" data-id="${esc(id)}" aria-pressed="${CQS.active === id}">${p ? `<span class="ck" aria-hidden="true">${p.c && G.LEG[p.c] ? `<i style="background:${esc(G.LEG[p.c].c)}"></i>` : "✓"}</span>` : ""}${esc(e.nom)}</button>`; }).join("")}</div>
      <div class="ctrls"><button class="btn ghost" type="button" data-act="cqagain">Tout effacer</button>
        <button class="btn primary" type="button" data-act="cqcheck"${cqLeft().length ? " disabled" : ""}>Vérifier</button></div>` : ""}`);
    if (!top) window.scrollTo(0, y);
    const svg = document.getElementById("cqsvg");
    if (svg) svg.addEventListener("click", cqTap);
  }
  function cqTap(ev){
    const G = cqGeo(), svg = ev.currentTarget, pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const {x, y} = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (CQS.checked) {   // corrigé : toucher la carte l'agrandit autour du doigt
      const w = Math.max(60, CQS.view.w / 3), h = w * G.H / G.W;
      CQS.view = {w, x: Math.max(0, Math.min(G.W - w, x - w / 2)), y: Math.max(0, Math.min(G.H - h, y - h / 2))};
      return cqRender();
    }
    const k = svg.getBoundingClientRect().width / CQS.view.w;
    CQS.msg = "";
    if (CQS.color) { CQS.msg = "Choisis d'abord la couleur, sous la carte."; return cqRender(); }
    const e = CQS.active && G.byId[CQS.active];
    if (!e) { CQS.msg = "Touche d'abord une étiquette, sous la carte."; return cqRender(); }
    if (e.Z) { CQS.placed[e.id] = {x, y}; cqNext(); CQS.view = {x: 0, y: 0, w: G.W}; return cqRender(); }
    const near = G.dots.map(d => [d, Math.hypot(d.x - x, d.y - y) * k]).filter(([, dd]) => dd <= 24).sort((a, b) => a[1] - b[1]);
    if (!near.length) { CQS.msg = "Touche une ville : un des petits ronds de la carte."; return cqRender(); }
    const close = near.filter(([, dd]) => dd - near[0][1] < 14);
    if (close.length > 1) {   // plusieurs villes sous le doigt : on zoome autour
      const xs = close.map(([d]) => d.x), ys = close.map(([d]) => d.y), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const spread = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...ys) - Math.min(...ys)) * G.W / G.H, 2);
      const w = Math.max(10, Math.min(CQS.view.w / 2.5, spread * 5));
      const h = w * G.H / G.W;
      CQS.view = {w, x: Math.max(0, Math.min(G.W - w, cx - w / 2)), y: Math.max(0, Math.min(G.H - h, cy - h / 2))};
      CQS.msg = "Il y a plusieurs villes ici : la carte est agrandie, touche la bonne.";
      return cqRender();
    }
    const d = near[0][0];
    const other = CQS.ids.find(id => id !== e.id && CQS.placed[id] && CQS.placed[id].dot === d.i);
    if (other) { delete CQS.placed[other]; CQS.msg = `${G.byId[other].nom} était sur ce point : son étiquette est revenue en bas.`; }
    CQS.placed[e.id] = {x: d.x, y: d.y, dot: d.i, c: CQS.placed[e.id] && CQS.placed[e.id].c};
    CQS.view = {x: 0, y: 0, w: G.W};
    if (needsColor(e)) CQS.color = e.id; else cqNext();
    cqRender();
  }
  function cqCheck(){
    const G = cqGeo(); CQS.res = {};
    CQS.ids.forEach(id => {
      const e = G.byId[id], p = CQS.placed[id] || {};
      const pos = e.Z ? e.Z.some(z => ((p.x - z.cx) / z.rx) ** 2 + ((p.y - z.cy) / z.ry) ** 2 <= 1) : G.dots[p.dot] && G.dots[p.dot].id === id;
      const col = needsColor(e) ? p.c === e.couleur : null;
      const od = !e.Z && G.dots[p.dot] && G.dots[p.dot].id ? G.byId[G.dots[p.dot].id] : null;
      CQS.res[id] = {pos: !!pos, col, all: !!pos && col !== false, other: od && od.id !== id ? od.nom : ""};
    });
    CQS.checked = true; CQS.color = null; CQS.view = {x: 0, y: 0, w: G.W}; CQS.msg = "";
    const pct = Math.round(CQS.ids.filter(id => CQS.res[id].all).length / CQS.ids.length * 100);
    if (CQS.sid !== "erreurs") S.cq[CQS.sid] = Math.max(S.cq[CQS.sid] || 0, pct);
    if (CQS.sid === "tout" || cqSeries().filter(x => x.id !== "tout").every(x => S.cq[x.id] !== undefined)) markDone("croquis"); else save();
    cqRender(true);
  }
  let cqRz = null;
  window.addEventListener("resize", () => { if (cur !== "croquis" || !CQS) return; clearTimeout(cqRz); cqRz = setTimeout(() => cqRender(), 200); });

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
      case "cards": cardsHome(); break;
      case "kday": startSession("day"); break;
      case "kextra": startSession("extra", interleave(allCards().filter(c => cst(c)).sort((a, b) => cst(a).b - cst(b).b).slice(0, 12))); break;
      case "khard": startSession("hard", interleave(allCards().filter(isHard))); break;
      case "kbrowse": browse(); break;
      case "kjump": browse(el.dataset.u); break;
      case "bprev": bMove(-1); break;
      case "bnext": bMove(1); break;
      case "video": if (VIDS.length) videoScreen(); break;
      case "vpick": videoScreen(+el.dataset.i); break;
      case "redaction": if (RD.length) rdList(); break;
      case "croquis": if (CQ) cqOpen(); break;
      case "cqserie": cqStart(el.dataset.s); break;
      case "cqcol": S.cqc = !cqColor(); save(); cqStart(CQS.sid === "erreurs" ? S.cqs : CQS.sid); break;
      case "cqpick": if (CQS && !CQS.checked) { const id = el.dataset.id; if (CQS.color && CQS.color !== id) CQS.msg = "Choisis d'abord la couleur, sous la carte."; else { CQS.color = null; CQS.active = id; CQS.msg = ""; } cqRender(); } break;
      case "cqcolor": if (CQS && CQS.color) { CQS.placed[CQS.color].c = el.dataset.c; CQS.color = null; cqNext(); cqRender(); } break;
      case "cqunzoom": if (CQS) { CQS.view = {x: 0, y: 0, w: cqGeo().W}; CQS.msg = ""; cqRender(); } break;
      case "cqcheck": if (CQS && !cqLeft().length) cqCheck(); break;
      case "cqagain": if (CQS) cqStart(CQS.sid === "erreurs" ? S.cqs : CQS.sid); break;
      case "cqretry": if (CQS) cqStart(CQS.sid, CQS.ids.filter(id => !CQS.res[id].all)); break;
      case "rdopen": rdOpen(el.dataset.id); break;
      case "rdmode": { const ta = document.getElementById("rdtext"); if (ta) rdSt(RDX.id).draft = ta.value; RDX.mode = el.dataset.m; rdOpen(RDX.id, true); break; }
      case "rdia": rdIA(); break;
      case "rdself": rdSelf(); break;
      case "rdselfok": rdSelfOk(); break;
      case "rdimprove": rdOpen(RDX.id, true); break;
      case "seek": seek(+el.dataset.t); break;
      case "flip": flip(); break;
      case "rate": if (K && K.on) rate(+el.dataset.v); break;
      case "speak": speak(el.dataset.say, el.dataset.lang); break;
      case "quiz": startQuiz(); break;
      case "answer": answer(+el.dataset.i); break;
      case "qnext": Q.i++; Q.done = false; if (Q.i >= Q.qs.length) quizEnd(); else renderQuiz(); break;
      case "control": controlIntro(); break;
      case "opt": S.opt[el.dataset.o] = el.dataset.v; save(); screen.querySelectorAll(`[data-act="opt"][data-o="${el.dataset.o}"]`).forEach(b => b.setAttribute("aria-pressed", b.dataset.v === el.dataset.v)); break;
      case "cstart": startControl(); break;
      case "kfix": startSession("extra", interleave(cardsByUnits(unitIds(el.dataset.from === "quiz" ? Q.wrong : C.miss)))); break;
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
        if (el.dataset.armed) { S.m = {}; S.cb = {}; S.nd = {}; S.done = {}; S.rd = {}; S.cq = {}; save(); clearTimeout(armTimer); home(); }
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
    if (!t || t.disabled || e.target.closest("[data-dragged]")) return;
    if (t.tagName === "BUTTON" && t.type !== "submit" && t.closest("form")) e.preventDefault();
    act(t.dataset.act, t);
  });
  document.addEventListener("submit", e => {
    if (e.target.dataset && e.target.dataset.form === "ialogin") { e.preventDefault(); iaLogin(e.target); return; }
    if (e.target.id !== "cform") return;
    e.preventDefault();
    if (C.checked) nextC(); else if (C.q[C.i].kind !== "choice") checkC();
  });
  document.addEventListener("keydown", e => {
    if (cur === "cards") {
      if (e.key === " " || e.key === "Enter") { if (e.target.id === "flip" || e.target === document.body) { e.preventDefault(); flip(); } }
      else if (K.on && e.key === "ArrowRight") rate(1);
      else if (K.on && e.key === "ArrowLeft") rate(0);
    } else if (cur === "cards-browse") {
      if (e.key === "ArrowRight") bMove(1);
      else if (e.key === "ArrowLeft") bMove(-1);
      else if ((e.key === " " || e.key === "Enter") && e.target.id === "flip") { e.preventDefault(); flip(); }
    } else if (cur === "quiz" && Q && !Q.done) {
      const i = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
      if (e.key.length === 1 && i >= 0 && i < Q.qs[Q.i].opts.length) answer(i);
    } else if (cur === "control" && e.key === "Enter" && e.target.matches && e.target.matches(".inp") && !C.checked) {
      const inputs = [...screen.querySelectorAll(".inp")], k = inputs.indexOf(e.target);
      if (k < inputs.length - 1) { e.preventDefault(); inputs[k + 1].focus(); }
    }
  });
  document.addEventListener("toggle", e => { if (e.target.dataset && e.target.dataset.pd) { S.po = e.target.open; save(); } }, true);
  if (canSpeak) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch(e) {} }

  if (CQ) loadMap().catch(() => {});   // le fond de carte sert aussi aux questions « sur la carte » du quiz
  publish();   // l'accueil du site sait que ce module a été ouvert
  window.__module = {M, R, start: {startQuiz, startControl, cardsHome, startSession, browse, videoScreen, rdList, rdOpen, cqOpen}, today: () => today(), state: () => S};
  home();
}

/* Service worker (révisions hors connexion, notifications) : sw.js est à la racine du site, à côté de lib/ */
try {
  const me = document.currentScript && document.currentScript.src;
  if (me && "serviceWorker" in navigator) navigator.serviceWorker.register(new URL("../sw.js", me)).catch(() => {});
} catch (e) {}

window.Revision = {start, esc, shuffle, pick, randInt, round2, fmt, fold, parseNum, numEqual, numField, numChoices, speak, speakBtn};
})();
