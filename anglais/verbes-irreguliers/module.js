/* Module : anglais · verbes irréguliers. Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";

/* Les 105 verbes de la fiche : 65 avec étoile (RAW), 40 sans (NOSTAR). [base, prétérit, participe, traduction, niveau, astuce, options]
   "a|b" = deux réponses acceptées ; "a, b" = deux formes à écrire (was, were). */
const RAW = [
  ["cut","cut","cut","couper",1,"Les trois formes sont identiques : cut, cut, cut."],
  ["put","put","put","mettre",1,"Les trois formes sont identiques : put, put, put."],
  ["let","let","let","laisser, permettre",1,"Les trois formes sont identiques : let, let, let."],
  ["shut","shut","shut","fermer",1,"Les trois formes sont identiques : shut, shut, shut."],
  ["cost","cost","cost","coûter",1,"Les trois formes sont identiques : cost, cost, cost."],
  ["read","read","read","lire",1,"Ça s'écrit pareil, mais au prétérit et au participe on prononce « red »."],
  ["have","had","had","avoir",1,"had dans les deux colonnes."],
  ["make","made","made","faire, fabriquer",1,"On remplace le k par un d : made, made."],
  ["say","said","said","dire",1,"said se prononce « sed ». On dit say something, et tell someone.",{q:"dire (quelque chose)"}],
  ["pay","paid","paid","payer",1,"paid, et surtout pas payed !"],
  ["meet","met","met","rencontrer",1,"Le ee devient un seul e : met, met."],
  ["sit","sat","sat","être assis",1,"Le i devient a : sat, sat.",{ok:["s'asseoir"]}],
  ["sleep","slept","slept","dormir",1,"Le ee devient e et on ajoute un t : slept."],
  ["keep","kept","kept","garder",1,"Comme sleep : le ee devient e et on ajoute un t."],
  ["feel","felt","felt","(se) sentir, éprouver",1,"Le ee devient e et on ajoute un t : felt."],
  ["mean","meant","meant","signifier",1,"On ajoute juste un t : meant (ça se prononce « ment »).",{ok:["vouloir dire"]}],
  ["learn","learnt|learned","learnt|learned","apprendre",1,"learnt ou learned : les deux sont justes."],
  ["smell","smelt|smelled","smelt|smelled","sentir (odeur)",1,"smelt ou smelled : les deux sont justes."],
  ["spell","spelt|spelled","spelt|spelled","épeler",1,"spelt ou spelled : les deux sont justes."],
  ["send","sent","sent","envoyer",1,"Le d devient t : sent, comme spend, spent."],
  ["spend","spent","spent","passer, dépenser",1,"Le d devient t : spent, comme send, sent."],
  ["sell","sold","sold","vendre",1,"Le e devient o : sold, comme tell, told."],
  ["tell","told","told","dire",1,"Le e devient o : told, comme sell, sold. On dit tell someone.",{q:"dire (à quelqu'un)"}],
  ["win","won","won","gagner",1,"won se prononce comme one."],
  ["get","got","got|gotten","obtenir, se rendre",1,"got, got (les Américains disent aussi gotten).",{ok:["recevoir","devenir"]}],

  ["buy","bought","bought","acheter",2,"Famille -ought, comme bring, think, fight. Pas de a dans buy, donc -ought."],
  ["bring","brought","brought","apporter",2,"Famille -ought, comme buy, think, fight."],
  ["think","thought","thought","penser, réfléchir",2,"Famille -ought, comme buy, bring, fight."],
  ["fight","fought","fought","se battre",2,"Famille -ought, comme buy, bring, think.",{ok:["combattre"]}],
  ["catch","caught","caught","attraper",2,"Il y a un a dans catch, donc -aught. Pareil pour teach."],
  ["teach","taught","taught","enseigner",2,"Il y a un a dans teach, donc -aught, comme catch."],
  ["build","built","built","construire",2,"Le d devient t : built, built."],
  ["find","found","found","trouver",2,"found, found."],
  ["hold","held","held","tenir",2,"Le o devient e : held, held."],
  ["lose","lost","lost","perdre",2,"lost, lost. Un seul o dans lose."],
  ["leave","left","left","quitter, laisser",2,"left, left : le même mot que « gauche »."],
  ["stand","stood","stood","se tenir debout",2,"stood, stood, comme understand.",{ok:["être debout"]}],
  ["understand","understood","understood","comprendre",2,"C'est under + stand : understood, comme stood."],
  ["come","came","come","venir",2,"La base et le participe sont pareils : come, came, come."],
  ["become","became","become","devenir",2,"Comme come : become, became, become."],
  ["run","ran","run","courir",2,"Comme come : run, ran, run."],

  ["be","was, were","been","être",3,"Deux formes au prétérit : was (I, he, she, it) et were (you, we, they).",{reg:"beed",x:{pret:["is, are","was, been"],pp:["being","be"]}}],
  ["go","went","gone","aller",3,"went ne ressemble pas du tout à go : à apprendre par cœur."],
  ["do","did","done","faire",3,"did, done. On dit do your homework, mais make a cake.",{q:"faire (une action)"}],
  ["begin","began","begun","commencer",3,"i, a, u : begin, began, begun. Même musique que drink, sing, swim, ring."],
  ["drink","drank","drunk","boire",3,"i, a, u, comme begin : drink, drank, drunk."],
  ["sing","sang","sung","chanter",3,"i, a, u, comme begin : sing, sang, sung."],
  ["swim","swam","swum","nager",3,"i, a, u, comme begin : swim, swam, swum."],
  ["ring","rang","rung","sonner",3,"i, a, u, comme begin : ring, rang, rung."],
  ["write","wrote","written","écrire",3,"written prend deux t."],
  ["ride","rode","ridden","faire du vélo, du cheval",3,"Comme write : ride, rode, ridden (deux d).",{ok:["faire du cheval","monter","rouler","monter à cheval","aller à vélo"]}],
  ["drive","drove","driven","conduire",3,"Comme ride : drive, drove, driven."],
  ["take","took","taken","prendre",3,"took, taken."],
  ["break","broke","broken","casser",3,"Comme speak : break, broke, broken."],
  ["speak","spoke","spoken","parler",3,"Comme break : speak, spoke, spoken."],
  ["wake","woke","woken","(se) réveiller",3,"woke, woken. Le up est facultatif.",{up:1}],
  ["wear","wore","worn","porter (un vêtement)",3,"wore, worn, comme tear, tore, torn."],
  ["eat","ate","eaten","manger",3,"ate, eaten."],
  ["fall","fell","fallen","tomber",3,"fallen prend deux l."],
  ["forget","forgot","forgotten","oublier",3,"forgotten prend deux t."],
  ["forbid","forbade","forbidden","interdire",3,"forbidden prend deux d."],
  ["give","gave","given","donner",3,"gave, given."],
  ["know","knew","known","savoir, connaître",3,"Le k ne se prononce pas : know, knew, known."],
  ["see","saw","seen","voir",3,"saw, seen."],
  ["show","showed","shown","montrer",3,"showed est régulier, seul shown est irrégulier."]
];

const NOSTAR = [
  ["bet","bet","bet","parier",1,"Les trois formes sont identiques : bet, bet, bet."],
  ["burst","burst","burst","éclater",1,"Les trois formes sont identiques : burst, burst, burst."],
  ["hit","hit","hit","frapper",1,"Les trois formes sont identiques : hit, hit, hit."],
  ["hurt","hurt","hurt","blesser",1,"Les trois formes sont identiques : hurt, hurt, hurt.",{ok:["faire mal"]}],
  ["spread","spread","spread","répandre",1,"Les trois formes sont identiques. Attention, la fiche a une faute de frappe : c'est spread, pas « sread ».",{ok:["étaler","répendre"]}],
  ["bend","bent","bent","plier",1,"Le d devient t : bent, comme send, sent."],
  ["lend","lent","lent","prêter",1,"Le d devient t : lent, comme send, sent."],
  ["bleed","bled","bled","saigner",1,"Le ee devient un seul e : bled, comme feed, fed."],
  ["feed","fed","fed","nourrir",1,"Le ee devient un seul e : fed, comme bleed, bled."],
  ["lead","led","led","mener",1,"On enlève le a : led, led.",{ok:["diriger"]}],
  ["burn","burnt|burned","burnt|burned","brûler",1,"burnt ou burned : les deux sont justes."],
  ["dream","dreamt|dreamed","dreamt|dreamed","rêver",1,"dreamt ou dreamed : les deux sont justes. dreamt se prononce « dremt »."],
  ["spoil","spoilt|spoiled","spoilt|spoiled","gâcher",1,"spoilt ou spoiled : les deux sont justes.",{ok:["abîmer","gâter"]}],

  ["hear","heard","heard","entendre",2,"On ajoute juste un d : heard, mais ça se prononce « heurd »."],
  ["light","lit|lighted","lit|lighted","allumer",2,"lit, lit. On entend aussi lighted."],
  ["slide","slid","slid","glisser",2,"On enlève le e : slid, slid."],
  ["shoot","shot","shot","tirer (au fusil, etc.)",2,"Le oo devient un seul o : shot, shot.",{q:"tirer (au fusil)"}],
  ["shine","shone","shone","briller",2,"shone, shone."],
  ["seek","sought","sought","chercher",2,"Famille -ought, comme buy, bring, think."],
  ["bind","bound","bound","lier",2,"Comme find, found : bind, bound."],
  ["hang","hung","hung","accrocher",2,"hung, hung.",{reg:"hunged",ok:["suspendre"]}],
  ["beat","beat","beaten","battre",2,"beat, beat, beaten : seul le participe passé change.",{ok:["vaincre"]}],

  ["awake","awoke","awoken|awaken","se réveiller",3,"awake, awoke, awoken. La fiche écrit awaken : les deux sont acceptés ici.",{q:"s'éveiller"}],
  ["bear","bore","born|borne","porter, supporter",3,"Comme wear : bear, bore, born. On dit I was born in Paris : je suis né à Paris."],
  ["bite","bit","bitten","mordre",3,"bitten prend deux t, comme hide, hid, hidden."],
  ["blow","blew","blown","souffler",3,"Comme grow ou know : blow, blew, blown."],
  ["choose","chose","chosen","choisir",3,"choose a deux o, chose et chosen n'en ont qu'un."],
  ["draw","drew","drawn","dessiner",3,"drew, drawn, comme blow, blew, blown."],
  ["fly","flew","flown","voler (dans les airs)",3,"Comme blow : fly, flew, flown."],
  ["forgive","forgave","forgiven","pardonner",3,"C'est for + give : forgive, forgave, forgiven."],
  ["freeze","froze","frozen","geler",3,"Comme speak : freeze, froze, frozen.",{ok:["congeler"]}],
  ["grow","grew","grown","grandir, faire pousser",3,"Comme know : grow, grew, grown.",{ok:["pousser"]}],
  ["hide","hid","hidden","cacher",3,"hidden prend deux d."],
  ["rise","rose","risen","se lever",3,"Comme drive : rise, rose, risen. Un seul s.",{ok:["s'élever"]}],
  ["shake","shook","shaken","agiter, trembler",3,"Comme take : shake, shook, shaken.",{ok:["secouer"]}],
  ["sink","sank","sunk","couler",3,"i, a, u, comme drink : sink, sank, sunk."],
  ["steal","stole","stolen","voler (dérober)",3,"Comme speak : steal, stole, stolen."],
  ["swear","swore","sworn","jurer",3,"Comme wear : swear, swore, sworn."],
  ["tear","tore","torn","déchirer",3,"Comme wear : tear, tore, torn. Ici tear se prononce comme « air »."],
  ["throw","threw","thrown","lancer, jeter",3,"Comme grow : throw, threw, thrown."]
];

const VERBS = [...RAW.map(r => [r, true]), ...NOSTAR.map(r => [r, false])]
  .map(([[base,pret,pp,fr,lvl,tip,o], star]) => Object.assign({id:base, name:base, base, pret, pp, fr, lvl, group:String(lvl), tip, star}, o || {}))
  .sort((a,b) => a.lvl - b.lvl || a.base.localeCompare(b.base));
const DEFAULT = ["cut","put","have","make","say","buy","bring","think","catch","teach","be","go","begin","write","take"];
const COLS = {base:"Base verbale", pret:"Prétérit", pp:"Participe passé", fr:"Traduction"};
const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.95 6.1 6.65.85-4.9 4.6 1.25 6.6L12 17.4l-5.95 3.25 1.25-6.6-4.9-4.6 6.65-.85z"/></svg><span class="sr"> (avec étoile)</span>';
const {esc, shuffle, pick, speakBtn} = Revision;

/* ---------- formes et corrections ---------- */
const first = f => f.split(",").map(g => g.split("|")[0].trim()).join(", ");
const D = (v, col) => col === "fr" ? v.fr : first(v[col]) + (v.up ? " (up)" : "");
const frQ = v => v.q || v.fr;
function corr(v, col){
  if (col === "fr") return v.fr;
  return v[col].split(",").map(g => { const a = g.split("|").map(s => s.trim()); return a.length > 1 ? `${a[0]} (ou ${a.slice(1).join(", ")})` : a[0]; }).join(", ") + (v.up ? " (up)" : "");
}
/* Correction en anglais : majuscules, « to » et « up » ignorés ; was/were demande les deux. */
function tokensEN(s){
  return s.toLowerCase().replace(/[’']/g, "").replace(/[()]/g, " ").split(/[\s,\/;+&.]+/)
    .filter(t => t && !["up","to","and","et","ou","or"].includes(t));
}
function checkEN(ans, field){
  const groups = field.split(",").map(g => g.split("|").map(s => s.trim().toLowerCase()));
  const toks = tokensEN(ans);
  if (!toks.length) return {ok:false, empty:true};
  const all = groups.flat();
  const clean = toks.every(t => all.includes(t));
  const ok = clean && groups.every(g => g.some(a => toks.includes(a)));
  return {ok, partial: !ok && clean && groups.length > 1};
}
/* Correction en français : accents, « se » et parenthèses ignorés. */
const fold = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’`´]/g, "'").replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim();
const frKey = s => fold(s).replace(/^(se |s')/, "").replace(/^to /, "").trim();
function frAccepted(v){
  const out = new Set(), add = s => { const k = frKey(s); if (k) out.add(k); };
  (v.ok || []).forEach(add);
  v.fr.split(/,(?![^(]*\))/).forEach(p => { add(p.replace(/\([^)]*\)/g, " ")); add(p.replace(/[()]/g, " ")); });
  if (v.q) add(v.q.replace(/\([^)]*\)/g, " "));
  return out;
}
function checkFR(ans, v){
  const parts = ans.split(/[,;\/]| ou /i).map(frKey).filter(Boolean);
  if (!parts.length) return {ok:false, empty:true};
  const acc = frAccepted(v);
  return {ok: parts.some(p => acc.has(p))};
}

/* Mauvaises réponses plausibles : les erreurs que font vraiment les élèves. */
function regular(v){
  if (v.reg) return v.reg;
  const b = v.base;
  if (/e$/.test(b)) return b + "d";
  if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ied";
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(b)) return b + b.slice(-1) + "ed";
  return b + "ed";
}
function mutate(f){
  const o = [];
  if (f.includes("ought")) o.push(f.replace("ought", "aught"));
  if (f.includes("aught")) o.push(f.replace("aught", "ought"));
  const m = f.match(/([a-z])\1/);
  if (m) o.push(f.replace(m[0], m[1]));
  return o;
}
function formDistractors(v, col){
  const right = first(v[col]), other = first(v[col === "pret" ? "pp" : "pret"]);
  const pri = [regular(v), ...mutate(right)];
  if (other !== right) pri.push(other);
  if (col === "pp" && v.lvl > 1 && !right.endsWith("en")) { const p = first(v.pret); if (!p.includes(",")) pri.push(/e$/.test(p) ? p + "n" : p + "en"); }
  ((v.x && v.x[col]) || []).forEach(x => pri.push(x));
  const tail = v.base !== right ? [v.base] : [];
  const same = shuffle(VERBS.filter(x => x !== v && x.lvl === v.lvl)).map(x => first(x[col]));
  const out = [];
  for (const d of [...shuffle(pri), ...tail, ...same]) {
    if (!d || out.includes(d) || d === right) continue;
    const r = checkEN(d, v[col]);
    if (r.ok || r.partial) continue;
    out.push(d);
    if (out.length >= 6) break;
  }
  return out;
}

/* ---------- morceaux d'affichage ---------- */
const sayText = v => [v.base, first(v.pret), first(v.pp)].map(s => v.up ? s + " up" : s).join(", ");
const spk = (v, cls) => speakBtn(sayText(v), "en-GB", cls);
const fullLine = v => `<span class="fullline"><b>${esc(D(v, "base"))}</b> · ${esc(D(v, "pret"))} · ${esc(D(v, "pp"))} <span class="muted">· ${esc(v.fr)}</span></span>`;
const LVL = {1:"Faciles", 2:"Moyens", 3:"Durs"};
function table(sel, R){
  let h = `<div class="vt-wrap"><div class="vt"><div class="vt-row vt-head"><span>Base verbale</span><span>Prétérit</span><span>Participe passé</span><span></span></div>`;
  [1, 2, 3].forEach(l => {
    const g = sel.filter(v => v.lvl === l);
    if (!g.length) return;
    h += `<div class="vt-grp"><span class="tag l${l}">${LVL[l]}</span></div>`;
    g.forEach(v => {
      const m = R.mastery(v);
      h += `<div class="vt-row"><span class="b">${esc(D(v, "base"))}${v.star ? STAR : ""}<span class="fr">${esc(v.fr)}</span></span><span class="f">${esc(D(v, "pret"))}</span><span class="f">${esc(D(v, "pp"))}</span><span class="dots" role="img" aria-label="Maîtrise ${m} sur 3">${[0, 1, 2].map(k => `<i class="${k < m ? "on" : ""}"></i>`).join("")}</span></div>`;
    });
  });
  return h + `</div></div>`;
}

/* ---------- questions ---------- */
function makeQ(v, R){
  const type = pick(["pret", "pp", "triple", "fr"]);
  let prompt, opts;
  if (type === "pret" || type === "pp") {
    opts = [{t: first(v[type]), ok: true}, ...formDistractors(v, type).slice(0, 3).map(t => ({t, ok: false}))];
    prompt = `Le <strong>${type === "pret" ? "prétérit" : "participe passé"}</strong> de <span class="w">${esc(D(v, "base"))}</span>&nbsp;?`;
  } else if (type === "triple") {
    const T = [v.base, first(v.pret), first(v.pp)], c = [];
    formDistractors(v, "pret").forEach(d => c.push([T[0], d, T[2]]));
    formDistractors(v, "pp").forEach(d => c.push([T[0], T[1], d]));
    c.push([T[0], regular(v), regular(v)]);
    c.push([T[0], T[2], T[1]]);
    const seen = new Set([T.join(" – ")]), wrong = [];
    for (const t of shuffle(c)) {
      const k = t.join(" – ");
      if (seen.has(k) || (checkEN(t[1], v.pret).ok && checkEN(t[2], v.pp).ok)) continue;
      seen.add(k); wrong.push(k);
      if (wrong.length === 3) break;
    }
    opts = [{t: T.join(" – "), ok: true}, ...wrong.map(t => ({t, ok: false}))];
    prompt = `Quelle ligne est juste pour <span class="w">« ${esc(frQ(v))} »</span>&nbsp;?`;
  } else {
    const acc = frAccepted(v);
    const ok = x => x !== v && ![...frAccepted(x)].some(k => acc.has(k));
    const sel = R.selected();
    const others = [...shuffle(sel.filter(ok)), ...shuffle(VERBS.filter(x => ok(x) && !sel.includes(x) && x.lvl === v.lvl))];
    opts = [{t: D(v, "base"), ok: true}, ...others.slice(0, 3).map(x => ({t: D(x, "base"), ok: false}))];
    prompt = `Comment dit-on <span class="w">« ${esc(frQ(v))} »</span> en anglais&nbsp;?`;
  }
  return {unit: v, key: v.id, prompt, opts: shuffle(opts), wide: type === "triple", tip: v.tip,
    feedback: () => fullLine(v) + spk(v, "btn small"), review: fullLine(v)};
}
function controlItem(v, pt){
  const fields = pt === "base" ? ["pret", "pp", "fr"] : ["base", "pret", "pp"];
  return {unit: v, kind: "fields", tip: v.tip, review: fullLine(v), redo: () => controlItem(v, pt),
    given: pt === "base" ? {label: COLS.base, value: D(v, "base")} : {label: COLS.fr, value: frQ(v)},
    fields: fields.map(f => ({id: f, label: COLS[f], lang: f === "fr" ? "fr" : "en", check: val => {
      const r = f === "fr" ? checkFR(val, v) : checkEN(val, f === "base" ? v.base : v[f]);
      return {ok: r.ok, fix: r.ok ? "✓" : r.partial ? `Il faut les deux : ${corr(v, f)}` : `→ ${corr(v, f)}`};
    }})),
    correction: all => (all ? "" : fullLine(v)) + spk(v, "btn small")};
}

/* ---------- le module ---------- */
Revision.start({
  key: "verbes-leandre-v1",
  title: "Défi de mardi",
  subtitle: "Verbes irréguliers",
  eyebrow: "Anglais · Verbes irréguliers",
  hand: "15 verbes au choix, de préférence avec une étoile",
  countdown: {date: "2026-10-13", label: "mardi 13 octobre"},
  verdictTop: "Excellent, prêt pour mardi !",
  groups: {
    "1": {name: "Facile", plural: "Faciles", cls: "l1"},
    "2": {name: "Moyen", plural: "Moyens", cls: "l2"},
    "3": {name: "Dur", plural: "Durs", cls: "l3"}
  },
  units: VERBS,
  allLabel: n => `Les ${n}`,
  mastery: {max: 3, noun: "verbes", help: "Une case se remplit d'un tiers à chaque fois que tu écris un verbe sans faute au contrôle. Une erreur la fait redescendre d'un cran."},
  modes: {
    cards: ["pour commencer", "Retourne chaque carte pour voir les trois formes et une astuce."],
    quiz: ["10 questions", "Trouve la bonne réponse parmi quatre. Enchaîne les séries."],
    control: ["noté sur 20", "Écris les formes toi-même, comme mardi en classe."]
  },
  selection: {
    default: DEFAULT,
    button: "Changer de verbes",
    filters: [
      {id: "all", label: "Tous", test: () => true},
      {id: "star", label: "Avec étoile", test: v => v.star},
      {id: "nostar", label: "Sans étoile", test: v => !v.star}
    ],
    chip: v => `<b>${esc(D(v, "base"))}${v.star ? STAR : ""}</b><small>${esc(first(v.pret))} · ${esc(first(v.pp))}</small>`,
    counter: sel => {
      const c = {1: 0, 2: 0, 3: 0}; sel.forEach(v => c[v.lvl]++);
      return `<span class="fine">dont ${sel.filter(v => v.star).length} avec étoile · ${c[1]} faciles · ${c[2]} moyens · ${c[3]} durs</span>
        <div class="legend-row"><span class="lg l1"><i></i>Facile</span><span class="lg l2"><i></i>Moyen</span><span class="lg l3"><i></i>Dur</span><span class="lg">${STAR} étoile sur la fiche, à travailler en priorité</span></div>
        <span class="fine">La consigne : 15 verbes au choix, de préférence avec une étoile. Touche un verbe pour l'ajouter ou l'enlever.</span>`;
    }
  },
  overview: table,
  cards: pool => pool.map(v => ({unit: v,
    front: `<div class="fbody"><span class="big">${esc(D(v, "base"))}</span><span class="frl">${esc(v.fr)}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
    back: `<div class="forms">${["base", "pret", "pp"].map(c => `<div class="form"><span class="flab">${COLS[c]}</span><span class="fw">${esc(D(v, c))}</span></div>`).join("")}</div><span class="frl">${esc(v.fr)}</span>${v.tip ? `<span class="tip">${esc(v.tip)}</span>` : ""}`,
    extra: spk(v)})),
  quiz: {count: 10, make: (pool, R) => makeQ(R.weighted(pool), R)},
  control: {
    lead: "Pour chaque verbe, écris les formes qui manquent. À la fin, tu as ta note sur 20 et la liste de tes erreurs.",
    note: "Les accents ne comptent pas dans la traduction. Pour be, écris les deux formes du prétérit : was, were.",
    options: [{id: "cm", label: "On te donne", choices: [["mix", "Un peu des deux"], ["base", "Le verbe anglais"], ["fr", "La traduction"]], default: "mix"}],
    build: (pool, R) => shuffle(pool).map(v => { const cm = R.option("cm"); return controlItem(v, cm === "mix" ? (Math.random() < .5 ? "base" : "fr") : cm); })
  }
});
})();
