/* Module : Espagnol · « La rutina diaria » (cours du jeudi 5 novembre 2026).
   Source : cahier de Léandre, 1 page — la liste de vocabulaire de la routine quotidienne (mots soulignés en rouge
   et leur traduction) : toute la liste est à savoir par cœur (PAR_COEUR), plus la date écrite en espagnol.
   Fin de ligne illisible sur la photo : « Practicar deporte : faire du sport / … » → gardé « faire du sport ».
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";
const {esc, shuffle, pick, fold, speakBtn} = Revision;
const ES = "es-ES";

/* ---------- notions ---------- */
const UNITS = [
  {id: "cle",  group: "1", name: "La routine et la date",      sub: "la rutina diaria · jueves, cinco de noviembre · les verbes en -se"},
  {id: "des",  group: "1", name: "Se réveiller, se lever",     sub: "despertarse · levantarse"},
  {id: "ase",  group: "1", name: "La toilette",                sub: "ducharse · bañarse · cepillarse · peinarse"},
  {id: "sal",  group: "1", name: "Se préparer et partir",      sub: "prepararse · vestirse · salir de casa"},
  {id: "jor",  group: "2", name: "Commencer, finir, rentrer",  sub: "empezar / comenzar · terminar / acabar · regresar / volver"},
  {id: "act",  group: "2", name: "Devoirs et sport",           sub: "hacer los deberes · practicar deporte"},
  {id: "com",  group: "3", name: "Les repas",                  sub: "desayunar · almorzar · merendar · cenar"},
  {id: "noc",  group: "3", name: "Le soir",                    sub: "relajarse · acostarse · dormir"}
].map(u => Object.assign(u, {tag: u.name}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- le « par cœur » : toute la liste du cahier ----------
   es : la ligne du cahier ; fr : la traduction du cahier ; ok : autres réponses acceptées au contrôle ;
   fam : mots trop proches pour servir de pièges l'un à l'autre ; se : verbe pronominal (le -se est un piège) ;
   trou : [mot à écrire au texte à trous] ; note : précision affichée au verso. */
const PAR_COEUR = [
  {id: "despertarse", n: "des", es: "despertarse", fr: "se réveiller", se: 1},
  {id: "levantarse",  n: "des", es: "levantarse",  fr: "se lever", se: 1},
  {id: "desayunar",   n: "com", es: "desayunar",   fr: "prendre le petit-déjeuner"},
  {id: "ducharse",    n: "ase", es: "ducharse",    fr: "se doucher", se: 1, fam: "eau"},
  {id: "banarse",     n: "ase", es: "bañarse",     fr: "prendre un bain", se: 1, fam: "eau", note: "En français, pas de « se » ici, mais bañarse garde son -se."},
  {id: "prepararse",  n: "sal", es: "prepararse",  fr: "se préparer", se: 1, fam: "prep"},
  {id: "vestirse",    n: "sal", es: "vestirse",    fr: "s'habiller", se: 1, fam: "prep"},
  {id: "cepillarse",  n: "ase", es: "cepillarse",  fr: "se brosser", se: 1, fam: "cep", note: "el pelo : les cheveux · los dientes : les dents"},
  {id: "cep-pelo",    n: "ase", es: "cepillarse el pelo",    fr: "se brosser les cheveux", fam: "cep", trou: ["pelo"]},
  {id: "cep-dientes", n: "ase", es: "cepillarse los dientes", fr: "se brosser les dents", fam: "cep", trou: ["dientes"]},
  {id: "peinarse",    n: "ase", es: "peinarse",    fr: "se peigner les cheveux", se: 1, fam: "cep", ok: ["peinarse el pelo"]},
  {id: "salir",       n: "sal", es: "salir (de casa)", fr: "partir (de la maison)", ok: ["salir", "salir de casa", "salir de la casa"], trou: ["casa"], trouText: "salir de casa"},
  {id: "empezar",     n: "jor", es: "empezar / comenzar", fr: "commencer, débuter", pair: ["empezar", "comenzar"], fam: "jor"},
  {id: "terminar",    n: "jor", es: "terminar / acabar",  fr: "terminer, finir",    pair: ["terminar", "acabar"], fam: "jor"},
  {id: "regresar",    n: "jor", es: "regresar / volver",  fr: "rentrer, revenir",   pair: ["regresar", "volver"]},
  {id: "relajarse",   n: "noc", es: "relajarse",   fr: "se relaxer, se détendre", se: 1, fam: "nuit"},
  {id: "acostarse",   n: "noc", es: "acostarse",   fr: "se coucher", se: 1, fam: "nuit"},
  {id: "dormir",      n: "noc", es: "dormir",      fr: "dormir", fam: "nuit"},
  {id: "deberes",     n: "act", es: "hacer los deberes", fr: "faire les devoirs", trou: ["deberes", "hacer"]},
  {id: "deporte",     n: "act", es: "practicar deporte", fr: "faire du sport", ok: ["practicar el deporte"], trou: ["deporte", "practicar"]},
  {id: "almorzar",    n: "com", es: "almorzar",    fr: "déjeuner", fam: "repas"},
  {id: "merendar",    n: "com", es: "merendar",    fr: "goûter", fam: "repas"},
  {id: "cenar",       n: "com", es: "cenar",       fr: "dîner", fam: "repas"}
];
PAR_COEUR.forEach(p => { if (p.pair) { const [a, b] = p.pair; p.ok = [a, b, `${b} / ${a}`, `${a} o ${b}`, `${b} o ${a}`, `${a} ${b}`, `${b} ${a}`]; p.trou = [b]; } });
const PBY = n => PAR_COEUR.filter(p => p.n === n);
const SOURCE = "liste du 5 novembre";
/* ligne telle qu'au cahier : « Despertarse : se réveiller » */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const line = p => `${cap(p.es)} : ${p.fr}`;
const first = p => p.pair ? p.pair[0] : p.es.replace(/\s*\(.*\)/, "");

/* ---------- vocabulaire en plus : [français, espagnol, variantes, notion] ---------- */
const VOC = [
  ["la routine quotidienne", "la rutina diaria", [], "cle"], ["jeudi", "jueves", [], "cle"], ["novembre", "noviembre", [], "cle"],
  ["cinq", "cinco", [], "cle"], ["deux mille vingt-six", "dos mil veintiséis", [], "cle"],
  ["les cheveux", "el pelo", [], "ase"], ["les dents", "los dientes", ["dientes"], "ase"],
  ["la maison", "la casa", ["casa"], "sal"], ["les devoirs", "los deberes", [], "act"], ["le sport", "el deporte", [], "act"]
].map(([fr, es, alts, n]) => ({fr, es, alts, n}));

/* ---------- questions de cours : carte + QCM (bonne réponse en premier dans o) ---------- */
const COURS = [
  {n: "cle", card: "Que veut dire « la rutina diaria » ?", a: "La routine quotidienne : ce qu'on fait chaque jour, du réveil au coucher.",
   say: "La rutina diaria", q: "« La rutina diaria », c'est…", o: ["la routine quotidienne", "le journal du jour", "le menu du jour", "la route de l'école"]},
  {n: "cle", card: "Comment écrit-on la date du jeudi 5 novembre 2026 en espagnol ?",
   a: "Jueves, cinco de noviembre de dos mil veintiséis.", say: "Jueves, cinco de noviembre de dos mil veintiséis.",
   q: "Comment écrit-on « jeudi 5 novembre 2026 » ?",
   o: ["Jueves, cinco de noviembre de dos mil veintiséis", "Jueves, cinco noviembre dos mil veintiséis",
       "Jueves, cinco de Noviembre de dos mil veintiséis", "Lunes, cinco de noviembre de dos mil veintiséis"]},
  {n: "cle", card: "Que veut dire le -se à la fin de levantarse, ducharse, acostarse… ?",
   a: "Ce sont des verbes pronominaux : en français aussi, on dit « se » lever, « se » doucher, « se » coucher.\nAttention : bañarse = prendre un bain.",
   q: "« Levantarse » finit par -se parce que…", o: ["c'est un verbe pronominal, comme « se lever »", "c'est un verbe au passé", "c'est un verbe au pluriel", "c'est un verbe à l'impératif"]},
  {n: "com", card: "Quels sont les quatre repas de la journée en espagnol ?",
   a: "desayunar = prendre le petit-déjeuner\nalmorzar = déjeuner\nmerendar = goûter\ncenar = dîner", say: "desayunar, almorzar, merendar, cenar"},
  {n: "jor", card: "Donne deux façons de dire « commencer », « finir » et « rentrer ».",
   a: "commencer : empezar / comenzar\nfinir : terminar / acabar\nrentrer : regresar / volver", say: "empezar, comenzar. terminar, acabar. regresar, volver.",
   q: "« Acabar » veut dire la même chose que…", o: ["terminar", "comenzar", "regresar", "empezar"]},
  {n: "ase", card: "Comment dit-on « se brosser les cheveux » et « se brosser les dents » ?",
   a: "cepillarse el pelo (el pelo = les cheveux)\ncepillarse los dientes (los dientes = les dents)", say: "cepillarse el pelo, cepillarse los dientes",
   q: "« Cepillarse los dientes » veut dire…", o: ["se brosser les dents", "se brosser les cheveux", "se peigner les cheveux", "se laver les mains"]}
];

/* ---------- vrai ou faux ---------- */
const VF = [
  ["« Despertarse » veut dire « se réveiller ».", true, "des", "Oui : despertarse = se réveiller. Se lever, c'est levantarse."],
  ["« Levantarse » veut dire « se coucher ».", false, "des", "Non : levantarse = se lever. Se coucher, c'est acostarse."],
  ["« Ducharse » veut dire « prendre un bain ».", false, "ase", "Non : ducharse = se doucher. Prendre un bain, c'est bañarse."],
  ["« Peinarse » veut dire « se peigner les cheveux ».", true, "ase", "Oui. Se brosser les cheveux, c'est cepillarse el pelo."],
  ["« Los dientes » veut dire « les dents ».", true, "ase", "Oui : cepillarse los dientes = se brosser les dents."],
  ["« Vestirse » veut dire « se préparer ».", false, "sal", "Non : vestirse = s'habiller. Se préparer, c'est prepararse."],
  ["« Salir de casa » veut dire « partir de la maison ».", true, "sal", "Oui : salir = partir, la casa = la maison."],
  ["« Empezar » et « comenzar » veulent dire tous les deux « commencer ».", true, "jor", "Oui : empezar / comenzar = commencer, débuter."],
  ["« Volver » veut dire « voler ».", false, "jor", "Non : volver = rentrer, revenir, comme regresar."],
  ["« Acabar » veut dire « terminer, finir ».", true, "jor", "Oui, comme terminar."],
  ["« Hacer los deberes » veut dire « faire les devoirs ».", true, "act", "Oui : los deberes = les devoirs."],
  ["« Practicar deporte » veut dire « faire du sport ».", true, "act", "Oui."],
  ["« Almorzar » veut dire « dîner ».", false, "com", "Non : almorzar = déjeuner (le midi). Dîner, c'est cenar."],
  ["« Merendar » veut dire « goûter ».", true, "com", "Oui : on merienda l'après-midi, après les cours."],
  ["« Desayunar » veut dire « prendre le petit-déjeuner ».", true, "com", "Oui, le matin."],
  ["« Relajarse » veut dire « se détendre ».", true, "noc", "Oui : se relaxer, se détendre."],
  ["« Acostarse » veut dire « se lever ».", false, "noc", "Non : acostarse = se coucher. Se lever, c'est levantarse."],
  ["« Jueves » veut dire « jeudi ».", true, "cle", "Oui : Jueves, cinco de noviembre."],
  ["En espagnol, les mois prennent une majuscule : Noviembre.", false, "cle", "Non : les mois s'écrivent en minuscules : cinco de noviembre."]
];

/* ---------- les repas et l'ordre de la journée ---------- */
const REPAS = [
  ["Le matin, au réveil, on…", "desayunar"], ["Vers midi, à la cantine, on…", "almorzar"],
  ["Après les cours, vers 16 h 30, on…", "merendar"], ["Le soir, avant d'aller au lit, on…", "cenar"]
];
const ORDRE = [
  ["des", "despertarse", "levantarse", "se réveiller, puis se lever"],
  ["noc", "acostarse", "dormir", "se coucher, puis dormir"],
  ["sal", "vestirse", "salir de casa", "s'habiller, puis partir de la maison"],
  ["jor", "empezar", "terminar", "commencer, puis finir"],
  ["com", "desayunar", "cenar", "le petit-déjeuner le matin, le dîner le soir"]
];

/* ---------- outils ---------- */
const lowq = s => String(s).toLowerCase().replace(/[’`´]/g, "'").replace(/\s+/g, " ").trim();
const bare = s => lowq(s).replace(/[¿?¡!.,;:«»"()…\/]/g, " ").replace(/\s+/g, " ").trim();
const ART = /^(el|la|los|las|lo|un|una|unos|unas)\s+/;
const keyEs = s => bare(s).replace(ART, "").trim();
/* espagnol : majuscules, ponctuation et article du début ignorés ; un accent ou un ñ oublié est accepté mais signalé ;
   un verbe pronominal écrit sans -se est refusé avec un mot d'explication. */
function esCheck(good, alts = [], shown = good){
  return v => {
    const raw = String(v == null ? "" : v), a = keyEs(raw);
    if (!a) return {ok: false, fix: `→ ${shown}`};
    for (const g of [good, ...alts]) {
      const gg = keyEs(g);
      if (!gg || fold(a) !== fold(gg)) continue;
      return {ok: true, fix: a !== gg ? `✓ Attention à l'orthographe (ñ, accents) : ${shown}` : "✓"};
    }
    if (/se$/.test(good) && fold(a + "se") === fold(keyEs(good))) return {ok: false, fix: `→ ${shown} : n'oublie pas le -se !`};
    return {ok: false, fix: `→ ${shown}`};
  };
}
const pcCheck = p => esCheck(p.pair ? p.pair[0] : p.es.replace(/\s*\(.*\)/, ""), [...(p.ok || []), p.es], p.es);
const strip = h => String(h).replace(/<[^>]+>/g, "");
const tagOf = n => `<span class="tag ${({1: "l1", 2: "l2", 3: "l3"})[UBY[n].group]}">${esc(UBY[n].name)}</span>`;
const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;
const nl = s => esc(s).replace(/\n/g, "<br>");
const es = s => `<b lang="es">${esc(s)}</b>`;
const pcLabel = `<span class="label">À savoir par cœur · ${SOURCE}</span>`;
const wordRe = w => new RegExp(`(^|[^\\p{L}\\d])(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=[^\\p{L}\\d]|$)`, "gu");
const near = (list, n) => { const s = shuffle(list); return [...s.filter(x => x.n === n), ...s.filter(x => x.n !== n)]; };
const unSe = s => s.replace(/se$/, "");

/* ---------- générateurs : {n, prompt, opts | fields, explain, say?, review, redo} ---------- */
const G = {
  /* QCM : la ligne exacte du cahier, contre trois mots de la liste (ou le même verbe sans -se) */
  parcoeur(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), traps = [];
    if (p.se && Math.random() < .6) traps.push(unSe(p.es));
    near(PAR_COEUR.filter(x => x !== p && (!p.fam || x.fam !== p.fam)), n).forEach(x => { if (!traps.includes(x.es)) traps.push(x.es); });
    return {n, pid: p.id, prompt: `${pcLabel}<br>Comment dit-on en espagnol :<br><b>« ${esc(p.fr)} »</b>`, wide: true,
      opts: shuffle([{t: p.es, ok: true}, ...traps.slice(0, 3).map(t => ({t, ok: false}))]),
      explain: `${es(line(p))}${p.se ? `<br><span class="fine">Verbe en -se, comme en français « se … ».</span>` : ""}${p.note ? `<br>${esc(p.note)}` : ""}`,
      say: p.es, review: rev(n, p.fr, p.es), redo: () => G.parcoeur(n)};
  },
  /* que veut dire le mot ? */
  sens(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool), others = near(PAR_COEUR.filter(x => x !== p && (!p.fam || x.fam !== p.fam)), n);
    return {n, pid: p.id, prompt: `Que veut dire ${es(p.es)} ?`, wide: true,
      opts: shuffle([{t: p.fr, ok: true}, ...others.slice(0, 3).map(x => ({t: x.fr, ok: false}))]),
      explain: es(line(p)), say: p.es, review: rev(n, p.es, p.fr), redo: () => G.sens(n)};
  },
  /* contrôle : écrire le mot en espagnol */
  ecrire(n){
    const pool = PBY(n);
    if (!pool.length) return null;
    const p = pick(pool);
    return {n, pid: p.id, prompt: `${pcLabel}<br>Écris en espagnol :<br><b>« ${esc(p.fr)} »</b>${p.pair ? `<br><span class="fine">Un des deux mots suffit, les deux c'est mieux.</span>` : ""}`, wide: true,
      fields: [{label: "En espagnol", lang: "es", check: pcCheck(p)}],
      explain: "", say: p.es, review: rev(n, p.fr, p.es), redo: () => G.ecrire(n)};
  },
  /* contrôle : texte à trous dans la ligne du cahier */
  trous(n){
    const pool = PBY(n).filter(p => p.trou);
    if (!pool.length) return null;
    const p = pick(pool), text = p.trouText || p.es, w = pick(p.trou.filter(x => wordRe(x).test(text)));
    const html = esc(text).replace(wordRe(esc(w)), `$1<b class="blank">…</b>`), full = esc(text).replace(wordRe(esc(w)), `$1<b>${esc(w)}</b>`);
    return {n, pid: p.id, prompt: `${pcLabel}<br>Complète :<br><span class="q" lang="es">${html}</span> : ${esc(p.fr)}`, wide: true,
      fields: [{label: "Le mot", lang: "es", check: esCheck(w)}],
      explain: `<span lang="es">${full}</span> : ${esc(p.fr)}`, say: text, review: rev(n, `${p.fr} : ${text.replace(wordRe(w), "$1…")}`, w), redo: () => G.trous(n)};
  },
  /* vocabulaire en plus : français → espagnol (QCM au quiz, à écrire au contrôle) */
  vocab(n, typed){
    const pool = VOC.filter(v => v.n === n);
    if (!pool.length) return null;
    const v = pick(pool), base = {n, prompt: `Comment dit-on <b>« ${esc(v.fr)} »</b> en espagnol ?`, say: v.es,
      review: rev(n, v.fr, v.es), redo: () => G.vocab(n, typed)};
    if (typed) return Object.assign(base, {explain: "", fields: [{label: "En espagnol", lang: "es", check: esCheck(v.es, v.alts)}]});
    const others = near(VOC.filter(x => x !== v), n).slice(0, 3);
    return Object.assign(base, {explain: `C'est ${es(v.es)}.`, opts: shuffle([{t: v.es, ok: true}, ...others.map(x => ({t: x.es, ok: false}))])});
  },
  vocabInv(n){
    const pool = VOC.filter(v => v.n === n);
    if (!pool.length) return null;
    const v = pick(pool), others = near(VOC.filter(x => x !== v), n).slice(0, 3);
    return {n, prompt: `Que veut dire ${es(v.es)} ?`, opts: shuffle([{t: v.fr, ok: true}, ...others.map(x => ({t: x.fr, ok: false}))]),
      explain: `${es(v.es)} = « ${esc(v.fr)} »`, say: v.es, review: rev(n, v.es, v.fr), redo: () => G.vocabInv(n)};
  },
  /* lequel est un verbe en -se ? */
  pron(n){
    const yes = pick(PAR_COEUR.filter(p => p.se && p.id !== "banarse"));
    const no = shuffle(PAR_COEUR.filter(p => !p.se && !p.pair && !p.es.includes("se"))).slice(0, 3);
    return {n, prompt: `Lequel de ces verbes se traduit en français par un verbe en « se » ?`,
      opts: shuffle([{t: yes.es, ok: true}, ...no.map(x => ({t: x.es, ok: false}))]),
      explain: `${es(line(yes))} : le -se espagnol correspond au « se » français.`, say: yes.es,
      review: rev(n, "Le verbe pronominal (en -se)", yes.es), redo: () => G.pron(n)};
  },
  /* les repas : quel moment de la journée ? */
  repas(n){
    if (n !== "com") return null;
    const [q, a] = pick(REPAS), p = PAR_COEUR.find(x => x.es === a);
    return {n, prompt: esc(q), opts: shuffle(REPAS.map(([, v]) => ({t: v, ok: v === a}))),
      explain: es(line(p)), say: a, review: rev(n, q, a), redo: () => G.repas(n)};
  },
  /* l'ordre de la journée */
  orden(n){
    const pool = ORDRE.filter(o => o[0] === n);
    if (!pool.length) return null;
    const [, a, b, why] = pick(pool);
    return {n, prompt: "Dans quel ordre, dans une journée ?", wide: true,
      opts: shuffle([{t: `${a} → ${b}`, ok: true}, {t: `${b} → ${a}`, ok: false}]),
      explain: `${es(a + " → " + b)} : ${esc(why)}.`, say: `${a}, ${b}`, review: rev(n, "Dans l'ordre", `${a} → ${b}`), redo: () => G.orden(n)};
  },
  cours(n){
    const pool = COURS.filter(c => c.n === n && c.o);
    if (!pool.length) return null;
    const c = pick(pool), q = c.q || c.card;
    return {n, prompt: esc(q), wide: true, opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), explain: nl(c.a), say: c.say,
      review: rev(n, q, c.o[0]), redo: () => G.cours(n)};
  },
  vf(n){
    const pool = VF.filter(v => v[2] === n);
    if (!pool.length) return null;
    const [s, truth, , why] = pick(pool);
    return {n, prompt: `Vrai ou faux ?<br><b>${esc(s)}</b>`, opts: [{t: "Vrai", ok: truth}, {t: "Faux", ok: !truth}], explain: esc(why),
      review: rev(n, s, truth ? "Vrai" : "Faux"), redo: () => G.vf(n)};
  }
};
const KQ = {
  cle: ["pron", "cours", "cours", "vocab", "vocabInv", "vf"],
  des: ["sens", "sens", "orden", "vf"],
  ase: ["sens", "sens", "cours", "vocab", "vocabInv", "vf"],
  sal: ["sens", "sens", "orden", "vocab", "vf"],
  jor: ["sens", "sens", "cours", "orden", "vf"],
  act: ["sens", "sens", "vocab", "vocabInv", "vf"],
  com: ["sens", "repas", "repas", "orden", "vf"],
  noc: ["sens", "sens", "orden", "vf"]
};
const KC = {
  cle: ["vocab", "vocab", "pron", "cours"],
  des: ["sens", "orden"],
  ase: ["vocab", "sens", "cours"],
  sal: ["vocab", "sens", "orden"],
  jor: ["sens", "cours"],
  act: ["vocab", "vocab", "sens"],
  com: ["repas", "sens"],
  noc: ["sens", "orden"]
};
function make(kinds, n, typed){
  for (const k of shuffle(kinds)) { const e = G[k](n, typed); if (e) return e; }
  return G.vf(n) || G.sens(n);
}

/* ---------- passage au moteur ---------- */
const spk = (s, cls = "btn small") => s ? speakBtn(s, ES, cls) : "";
const asQuiz = e => ({unit: UBY[e.n], key: strip(e.review), prompt: e.prompt, wide: e.wide, opts: e.opts,
  feedback: () => box(e.explain) + spk(e.say), review: e.review});
const asControl = e => Object.assign({unit: UBY[e.n], prompt: e.prompt, wide: e.wide, review: e.review,
  correction: () => (e.explain ? `<p class="label" style="margin-top:4px">Correction</p>${box(e.explain)}` : "") + spk(e.say),
  redo: () => asControl(e.redo())},
  e.fields ? {kind: "fields", fields: e.fields} : {kind: "choice", opts: e.opts});

const card = (n, front, back, label, say) => ({unit: UBY[n],
  front: `<div class="fbody">${label ? `<span class="label">${esc(label)}</span>` : ""}<span class="card-q">${front}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
  back: `<div class="fbody left"><span class="card-a">${back}</span></div>`,
  extra: say ? spk(say, "btn") : undefined});
const pcCard = p => card(p.n, `Comment dit-on <b>« ${esc(p.fr)} »</b> en espagnol ?`,
  `<span lang="es"><b>${esc(line(p))}</b></span>${p.note ? `<br><span class="muted">${esc(p.note)}</span>` : ""}`,
  `À savoir par cœur · ${SOURCE}`, p.es);
const invCard = p => card(p.n, `Que veut dire <b lang="es">« ${esc(p.es)} »</b> ?`, `<b>${esc(p.fr)}</b>`, "Dans l'autre sens", p.es);

function overview(sel){
  const ids = new Set(sel.map(u => u.id)), rows = [];
  for (const u of UNITS) {
    const ps = PBY(u.id);
    if (!ps.length || !ids.has(u.id)) continue;
    rows.push(`<div class="vt-grp">${tagOf(u.id)}</div>`);
    ps.forEach(p => rows.push(`<div class="vt-row" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><span class="b" lang="es">${esc(cap(p.es))}</span><span class="f">${esc(p.fr)}</span></div>`));
  }
  if (!rows.length) return "";
  const all = PAR_COEUR.filter(p => ids.has(p.n)).map(p => p.es.replace(/\//g, ",")).join(". ");
  return `<div class="sec-h"><p class="label">La liste du cahier · à savoir par cœur</p>${spk(all)}</div>
    <div class="vt-wrap"><div class="vt">${rows.join("")}</div></div>`;
}

Revision.start({
  key: "leandre-espagnol-la-rutina-diaria-v1",
  title: "La rutina diaria",
  subtitle: "La routine quotidienne",
  eyebrow: "Espagnol · Cours du 5 novembre",
  hand: "Toute la liste : par cœur !",
  groups: {
    "1": {name: "Por la mañana", cls: "l1", filter: "Le matin"},
    "2": {name: "Durante el día", cls: "l2", filter: "La journée"},
    "3": {name: "Comidas y noche", cls: "l3", filter: "Repas et soir"}
  },
  units: UNITS,
  allLabel: () => "Toute la liste",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["la liste", "Les 23 mots de la routine, du français vers l'espagnol puis dans l'autre sens."],
    quiz: ["10 questions", "Retrouve le bon mot, son sens, les repas, l'ordre de la journée."],
    control: ["noté sur 20", "Tu écris toi-même les mots en espagnol, comme à l'interro."]
  },
  overview,
  cards: pool => {
    const ids = pool.map(u => u.id), pc = PAR_COEUR.filter(p => ids.includes(p.n));
    return [...pc.map(pcCard),
      ...COURS.filter(c => ids.includes(c.n)).map(c => card(c.n, esc(c.card), nl(c.a), "", c.say)),
      ...pc.filter(p => !p.id.startsWith("cep-")).map(invCard)];
  },
  quiz: {count: 10, make: (pool, R, i) => {
    const n = R.weighted(pool).id, f = i % 5 < 2 ? G.parcoeur(n) : null;   // environ 4 questions sur 10 sur le « par cœur »
    return asQuiz(f || make(KQ[n], n, false));
  }},
  control: {
    lead: "14 questions : des mots de la liste à écrire en espagnol, des expressions à compléter, quelques questions à choix. Chaque question compte autant.",
    note: "Les majuscules et l'article du début (el, la, los…) ne comptent pas. Un ñ ou un accent oublié est accepté mais signalé : sur ta copie, il compte ! Et n'oublie pas le -se des verbes pronominaux.",
    size: () => 14,
    build: (pool, R) => {
      const ids = pool.map(u => u.id), withPc = ids.filter(n => PBY(n).length), withTr = ids.filter(n => PBY(n).some(p => p.trou)), items = [];
      const add = e => { if (e && !items.some(x => strip(x.review) === strip(e.review) || (e.pid && x.pid === e.pid))) { items.push(e); return true; } return false; };   // jamais deux fois le même mot
      for (let s = 0; s < 6 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.ecrire(pick(withPc))); t++);    // 6 mots à écrire
      for (let s = 0; s < 3 && withTr.length; s++) for (let t = 0; t < 10 && !add(G.trous(pick(withTr))); t++);     // 3 textes à trous
      for (let s = 0; s < 1 && withPc.length; s++) for (let t = 0; t < 10 && !add(G.parcoeur(pick(withPc))); t++);
      let guard = 0;
      while (items.length < 14 && guard++ < 200) {
        const n = guard % 3 ? R.weighted(pool).id : ids[guard % ids.length];
        add(make(KC[n], n, true));
      }
      while (items.length < 14) items.push(make(KC[ids[0]], ids[0], true));
      return shuffle(items).map(asControl);
    }
  }
});
})();
