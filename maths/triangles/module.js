/* Module : maths · triangles égaux, semblables, agrandissement et réduction.
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";

/* ---------- notions du chapitre ---------- */
const NOT = {
  egaux: {p:1, name:"Triangles égaux", d:"Définition, sommets, côtés et angles homologues"},
  cas:   {p:1, name:"Cas d'égalité", d:"Ce qui suffit pour dire que deux triangles sont égaux"},
  semb:  {p:2, name:"Triangles semblables", d:"Côtés proportionnels, tableau rangé, quotients"},
  agr:   {p:3, name:"Agrandir, réduire", d:"Le facteur k, ce qui est conservé, les longueurs"},
  aire:  {p:3, name:"Les aires", d:"Les aires sont multipliées par k²"}
};
const PART = {1:{name:"Triangles égaux", cls:"l1"}, 2:{name:"Semblables", cls:"l2"}, 3:{name:"Agrandissement", cls:"l3"}};
const MAXM = 5;

/* ---------- questions de cours ---------- */
/* card : recto de la carte ; q : énoncé du quiz ; a : réponse (verso) ; o : bonne réponse puis 3 pièges */
const COURS = [
  {id:"def", n:"egaux", card:"Des triangles égaux, c'est quoi ?",
   q:"Deux triangles sont égaux quand…",
   a:"Ils sont superposables.\nLeurs côtés sont deux à deux de même longueur, et leurs angles deux à deux de même mesure.",
   o:["leurs côtés ont deux à deux la même longueur et leurs angles la même mesure","ils ont la même aire","ils ont les mêmes angles, même si les côtés sont différents","ils ont le même périmètre"],
   tip:"Égaux = superposables : on peut poser l'un pile sur l'autre, quitte à le retourner."},
  {id:"homo", n:"egaux", card:"Les angles qui se superposent dans deux triangles égaux s'appellent…",
   q:"Dans deux triangles égaux, les angles qui se superposent sont dits…",
   a:"Des angles homologues.\nDe même, on parle de sommets homologues et de côtés homologues.",
   o:["homologues","adjacents","opposés","complémentaires"],
   tip:"Homologue = qui se correspond. Sur les figures, ils ont la même couleur ou le même codage."},
  {id:"homo2", n:"egaux", card:"Dans deux triangles égaux, deux côtés homologues…",
   q:"Dans deux triangles égaux, deux côtés homologues…",
   a:"ont la même longueur.\nEt deux angles homologues ont la même mesure.",
   o:["ont la même longueur","sont parallèles","sont perpendiculaires","sont proportionnels avec k = 2"],
   tip:"Même couleur ou même codage sur la figure = même longueur."},
  {id:"nbcas", n:"cas", card:"Combien y a-t-il de cas d'égalité des triangles ?",
   q:"Combien y a-t-il de cas d'égalité des triangles ?",
   a:"Trois.",
   o:["3","2","4","1"], tip:"Trois cas : un côté et deux angles · un angle et deux côtés · les trois côtés."},
  {id:"cas1", n:"cas", card:"1er cas d'égalité des triangles",
   q:"Deux triangles ont un côté de même longueur et les deux angles adjacents à ce côté de même mesure deux à deux. Alors…",
   a:"Si deux triangles ont :\n– un côté de même longueur,\n– et les angles adjacents à ce côté de même mesure deux à deux,\nalors ces deux triangles sont égaux.",
   o:["ils sont égaux","ils sont seulement semblables","on ne peut rien dire","ils ont la même aire mais ne sont pas égaux"],
   tip:"Adjacents à ce côté = les deux angles qui sont aux deux bouts de ce côté."},
  {id:"cas2", n:"cas", card:"2e cas d'égalité des triangles",
   q:"Deux triangles ont un angle de même mesure, et les deux côtés de cet angle de même longueur. Alors…",
   a:"Si deux triangles ont :\n– un angle de même mesure,\n– et les deux côtés de cet angle de même longueur,\nalors ces deux triangles sont égaux.",
   o:["ils sont égaux","ils sont seulement semblables","on ne peut rien dire","ils sont rectangles"],
   tip:"Les deux côtés de cet angle = les deux côtés qui partent de son sommet."},
  {id:"cas3", n:"cas", card:"3e cas d'égalité des triangles",
   q:"Deux triangles ont leurs trois côtés de même longueur deux à deux. Alors…",
   a:"Si deux triangles ont leurs trois côtés de même longueur deux à deux, alors ces deux triangles sont égaux.",
   o:["ils sont égaux","ils sont seulement semblables","on ne peut rien dire, il faut aussi un angle","ils sont isocèles"],
   tip:"Avec trois longueurs, on ne peut construire qu'un seul triangle (à un retournement près)."},
  {id:"aaa", n:"cas", card:"Trois angles de même mesure, ça suffit pour des triangles égaux ?",
   q:"Deux triangles ont leurs trois angles de même mesure. Sont-ils forcément égaux ?",
   a:"Non !\nIls ont la même forme, mais l'un peut être plus grand que l'autre : ils sont semblables, pas forcément égaux.",
   o:["Non, ils sont seulement semblables","Oui, toujours","Oui, s'ils sont rectangles","Non, ils n'ont rien en commun"],
   tip:"Le piège classique : les angles donnent la forme, pas la taille."},
  {id:"sdef", n:"semb", card:"Dire que deux triangles sont semblables, ça revient à dire…",
   q:"Dire que deux triangles sont semblables revient à dire que…",
   a:"les longueurs des côtés de l'un sont proportionnelles aux longueurs des côtés de l'autre.",
   o:["les longueurs des côtés de l'un sont proportionnelles à celles de l'autre","ils ont la même aire","leurs côtés ont les mêmes longueurs","ils ont un côté en commun"],
   tip:"Semblables = même forme, mais pas forcément la même taille."},
  {id:"sang", n:"semb", card:"Les angles de deux triangles semblables…",
   q:"Deux triangles semblables ont leurs angles…",
   a:"deux à deux de même mesure.\nC'est pour ça qu'ils ont la même forme.",
   o:["deux à deux de même mesure","proportionnels","multipliés par k","tous égaux à 60°"],
   tip:"On agrandit les côtés, on ne touche pas aux angles."},
  {id:"smeth", n:"semb", card:"Méthode : montrer que deux triangles sont semblables avec les côtés",
   q:"Pour montrer que deux triangles sont semblables avec les côtés, on…",
   a:"1. Dans un tableau, on range dans l'ordre croissant les côtés des deux triangles.\n2. On calcule les quotients colonne par colonne.\n3. S'ils sont tous égaux, les côtés sont proportionnels : les triangles sont semblables.",
   o:["range les côtés dans l'ordre croissant et vérifie que les quotients sont égaux","vérifie que les périmètres sont égaux","additionne les côtés des deux triangles","mesure un seul côté de chaque triangle"],
   tip:"Exemple du cahier : 4,8 ÷ 0,8 = 7,2 ÷ 1,2 = 9,6 ÷ 1,6 = 6. Tous égaux, donc semblables."},
  {id:"sord", n:"semb", card:"Pourquoi range-t-on les côtés dans l'ordre croissant ?",
   q:"Pourquoi range-t-on les côtés dans l'ordre croissant dans le tableau ?",
   a:"Pour mettre ensemble les côtés homologues : le plus petit avec le plus petit, le moyen avec le moyen, le plus grand avec le plus grand.",
   o:["Pour associer les côtés homologues","Pour que le tableau soit plus joli","Pour calculer le périmètre","Parce que k doit être plus grand que 1"],
   tip:"Le plus grand côté d'un triangle correspond toujours au plus grand côté de l'autre."},
  {id:"kdef", n:"agr", card:"Agrandissement ou réduction ?",
   q:"Une réduction correspond à un facteur k…",
   a:"On multiplie toutes les longueurs par un nombre k strictement positif.\nk > 1 : agrandissement\n0 < k < 1 : réduction\nk = 1 : les deux figures sont identiques.",
   o:["compris entre 0 et 1","plus grand que 1","égal à 1","négatif"],
   tip:"k = 0,5 : tout est deux fois plus petit. k = 3 : tout est trois fois plus grand."},
  {id:"kprop", n:"agr", card:"Dans le cas des triangles semblables, que représente k ?",
   q:"Pour deux triangles semblables, le nombre k est…",
   a:"le coefficient de proportionnalité du tableau des côtés.\nSelon le cas, on l'appelle facteur d'agrandissement ou facteur de réduction.",
   o:["le coefficient de proportionnalité du tableau","la somme des côtés","la différence entre les deux périmètres","la mesure du plus grand angle"],
   tip:"k = côté du nouveau triangle ÷ côté homologue de l'ancien."},
  {id:"kcons", n:"agr", card:"Qu'est-ce qui est conservé lors d'un agrandissement ou d'une réduction ?",
   q:"Lors d'un agrandissement ou d'une réduction, ce qui est conservé, c'est…",
   a:"Les angles et le parallélisme.\nLes longueurs, elles, sont multipliées par k.",
   o:["les angles et le parallélisme","les longueurs","les aires","le périmètre"],
   tip:"Un angle de 40° reste un angle de 40°, même si la figure est 10 fois plus grande."},
  {id:"klong", n:"agr", card:"Agrandissement de facteur k : que deviennent les longueurs et le périmètre ?",
   q:"Lors d'un agrandissement de facteur k, les longueurs et le périmètre sont…",
   a:"multipliés par k.",
   o:["multipliés par k","multipliés par k²","augmentés de k","inchangés"],
   tip:"Si chaque côté est multiplié par 3, le tour complet aussi."},
  {id:"kinv", n:"agr", card:"DEF est un agrandissement de ABC de facteur 3. Donc ABC est…",
   q:"DEF est un agrandissement de ABC de facteur 3. Donc ABC est…",
   a:"une réduction de DEF de facteur 1/3.",
   o:["une réduction de DEF de facteur 1/3","une réduction de DEF de facteur 3","un agrandissement de DEF de facteur 3","égal à DEF"],
   tip:"Dans un sens on multiplie par 3, dans l'autre on divise par 3 (× 1/3)."},
  {id:"kaire", n:"aire", card:"Agrandissement ou réduction de facteur k : que deviennent les aires ?",
   q:"Lors d'un agrandissement ou d'une réduction de facteur k, les aires sont…",
   a:"multipliées par k² (k × k).",
   o:["multipliées par k²","multipliées par k","multipliées par 2k","inchangées"],
   tip:"Le piège : si k = 2, l'aire est multipliée par 4, pas par 2 !"},
  {id:"atri", n:"aire", card:"Comment calcule-t-on l'aire d'un triangle ?",
   q:"L'aire d'un triangle se calcule avec…",
   a:"(base × hauteur) ÷ 2.\nPour un triangle rectangle : on multiplie les deux côtés de l'angle droit, puis on divise par 2.",
   o:["(base × hauteur) ÷ 2","base × hauteur","base + hauteur","(base + hauteur) × 2"],
   tip:"Exemple du cahier : (6 × 4,5) ÷ 2 = 13,5 cm²."},
  {id:"eqsem", n:"semb", card:"Deux triangles égaux sont-ils semblables ?",
   q:"Deux triangles égaux sont-ils semblables ?",
   a:"Oui : ce sont des triangles semblables avec k = 1.",
   o:["Oui, avec k = 1","Non, jamais","Seulement s'ils sont rectangles","Oui, avec k = 2"],
   tip:"k = 1 : rien n'est agrandi ni réduit, les figures sont identiques."}
];
const CBY = Object.fromEntries(COURS.map(c => [c.id, c]));


/* ---------- outils ---------- */
const {esc, pick, shuffle} = Revision;
const ri = Revision.randInt, r2 = Revision.round2, f = Revision.fmt;
function fk(k){ // facteur affiché, en fraction si besoin
  const fr = {[1/3]:"1/3", [2/3]:"2/3", [1/4]:"1/4"};
  for (const v in fr) if (Math.abs(k - v) < 1e-9) return fr[v];
  return f(k);
}

/* ---------- figures ---------- */
const TRI = [[4,5,7],[5,6,8],[4,6,7],[6,7,9],[5,7,8],[3,5,6],[6,8,9],[5,6,9],[4,7,8],[3,4,6],[2,3,4],[4,5,6]];
function geom(xy, yz, xz){
  const x = (xy * xy + xz * xz - yz * yz) / (2 * xy);
  const y = Math.sqrt(Math.max(0, xz * xz - x * x));
  return [[0, 0], [xy, 0], [x, -y]];
}
/* tris : [{v:["A","B","C"], s:[AB,BC,AC], lab:[...3 textes], right:index du sommet droit ou -1}] */
function fig(tris){
  const G = tris.map(t => geom(t.s[0], t.s[1], t.s[2]));
  const bb = G.map(P => ({x0: Math.min(...P.map(p => p[0])), x1: Math.max(...P.map(p => p[0])), y0: Math.min(...P.map(p => p[1])), y1: Math.max(...P.map(p => p[1]))}));
  const W = 360, H = 150, GAP = 46, PAD = 26;
  const tw = bb.reduce((a, b) => a + b.x1 - b.x0, 0), th = Math.max(...bb.map(b => b.y1 - b.y0));
  const s = Math.min((W - GAP * (tris.length - 1)) / tw, H / th, 30);
  let ox = PAD, out = "";
  const totalW = tw * s + GAP * (tris.length - 1) + PAD * 2, totalH = th * s + PAD * 2;
  tris.forEach((t, i) => {
    const b = bb[i];
    const P = G[i].map(p => [ox + (p[0] - b.x0) * s, PAD + (th - (b.y1 - b.y0)) * s + (p[1] - b.y0) * s]);
    const cx = (P[0][0] + P[1][0] + P[2][0]) / 3, cy = (P[0][1] + P[1][1] + P[2][1]) / 3;
    out += `<polygon class="tri" points="${P.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ")}"/>`;
    if (t.right >= 0) {
      const R = P[t.right], o = P.filter((_, k) => k !== t.right);
      const u = o.map(q => { const dx = q[0] - R[0], dy = q[1] - R[1], L = Math.hypot(dx, dy); return [dx / L * 9, dy / L * 9]; });
      out += `<path class="ra" d="M${R[0] + u[0][0]} ${R[1] + u[0][1]} L${R[0] + u[0][0] + u[1][0]} ${R[1] + u[0][1] + u[1][1]} L${R[0] + u[1][0]} ${R[1] + u[1][1]}"/>`;
    }
    P.forEach((p, k) => {
      const dx = p[0] - cx, dy = p[1] - cy, L = Math.hypot(dx, dy) || 1;
      out += `<text class="vx" x="${(p[0] + dx / L * 13).toFixed(1)}" y="${(p[1] + dy / L * 13 + 5).toFixed(1)}" text-anchor="middle">${t.v[k]}</text>`;
    });
    [[0, 1], [1, 2], [0, 2]].forEach(([a, c], k) => {
      if (!t.lab[k]) return;
      const mx = (P[a][0] + P[c][0]) / 2, my = (P[a][1] + P[c][1]) / 2, dx = mx - cx, dy = my - cy, L = Math.hypot(dx, dy) || 1;
      const q = t.lab[k] === "?";
      out += `<text class="sd${q ? " q" : ""}" x="${(mx + dx / L * 14).toFixed(1)}" y="${(my + dy / L * 14 + 4).toFixed(1)}" text-anchor="middle">${esc(t.lab[k])}</text>`;
    });
    ox += (b.x1 - b.x0) * s + GAP;
  });
  return `<div class="fig"><svg viewBox="0 0 ${totalW.toFixed(0)} ${totalH.toFixed(0)}" role="img" aria-label="Figure des triangles">${out}</svg></div>`;
}
const SN = ["AB", "BC", "AC"], DN = ["DE", "EF", "DF"];
function table(rows){ // rows: [[titre, [cellules]]]
  return `<div class="tbw"><table class="tb">${rows.map(([h, c]) => `<tr><th>${h}</th>${c.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</table></div>`;
}
function sortedPairs(A, Bv){ // A, B : {nom: longueur}
  const a = Object.entries(A).sort((x, y) => x[1] - y[1]), b = Object.entries(Bv).sort((x, y) => x[1] - y[1]);
  return [a, b];
}

/* ---------- exercices (tirés au hasard, nouveaux nombres à chaque fois) ---------- */
const GEN = {
  findK(){
    const base = pick(TRI), red = Math.random() < .35;
    const k = red ? pick([2, 4, 5]) : pick([1.5, 2, 2.5, 3, 4]);
    const small = shuffle(base), big = shuffle(base.map(x => x * k));
    const abc = red ? big : small, def = red ? small : big, ans = red ? 1 / k : k;
    const A = Object.fromEntries(SN.map((n, i) => [n, abc[i]])), D = Object.fromEntries(DN.map((n, i) => [n, def[i]]));
    const [sa, sd] = sortedPairs(A, D);
    return {n:"semb", kind:"num", ans, unit:"",
      prompt:`Les triangles ABC et DEF sont semblables. Calcule le facteur <b>k</b> qui permet de passer de ABC à DEF.`,
      fig: fig([{v:["A","B","C"], s:abc, lab:abc.map(f), right:-1}, {v:["D","E","F"], s:def, lab:def.map(f), right:-1}]),
      short:"Calculer le facteur k entre ABC et DEF",
      dist:[1 / ans, ans + 1, sd[0][1] - sa[0][1], ans * ans],
      steps:`<p>On range les côtés dans l'ordre croissant :</p>${table([["Côtés de ABC", sa.map(([n, v]) => `${n} = ${f(v)}`)], ["Côtés de DEF", sd.map(([n, v]) => `${n} = ${f(v)}`)]])}
        <p>${sd.map(([n, v], i) => `${f(v)} ÷ ${f(sa[i][1])}`).join(" = ")} = ${f(ans)}</p>
        <p class="concl">k = ${fk(ans)} : DEF est ${red ? "une réduction" : "un agrandissement"} de ABC.</p>`};
  },
  semYN(){
    const base = pick(TRI), k = pick([1.5, 2, 2.5, 3]), yes = Math.random() < .5;
    let def = base.map(x => x * k);
    if (!yes) { const i = ri(0, 2); def = def.map((x, j) => j === i ? x + pick([1, -1, 0.5]) : x); }
    const abc = shuffle(base), dd = shuffle(def);
    const A = Object.fromEntries(SN.map((n, i) => [n, abc[i]])), D = Object.fromEntries(DN.map((n, i) => [n, dd[i]]));
    const [sa, sd] = sortedPairs(A, D);
    const qs = sd.map(([, v], i) => v / sa[i][1]);
    return {n:"semb", kind:"choice",
      prompt:`Les triangles ABC et DEF sont-ils semblables ?`,
      fig: fig([{v:["A","B","C"], s:abc, lab:abc.map(f), right:-1}, {v:["D","E","F"], s:dd, lab:dd.map(f), right:-1}]),
      short:"Dire si ABC et DEF sont semblables",
      opts:[{t:"Oui, ils sont semblables", ok:yes}, {t:"Non, ils ne sont pas semblables", ok:!yes}],
      answerText: yes ? "Oui" : "Non",
      steps:`<p>On range les côtés dans l'ordre croissant :</p>${table([["Côtés de ABC", sa.map(([n, v]) => `${n} = ${f(v)}`)], ["Côtés de DEF", sd.map(([n, v]) => `${n} = ${f(v)}`)]])}
        <p>${sd.map(([, v], i) => `${f(v)} ÷ ${f(sa[i][1])} = ${f(qs[i])}`).join(" ; ")}</p>
        <p class="concl">${yes ? `Les quotients sont tous égaux à ${f(k)} : les côtés sont proportionnels, donc les triangles sont semblables.` : `Les quotients ne sont pas tous égaux : les côtés ne sont pas proportionnels, donc les triangles ne sont pas semblables.`}</p>`};
  },
  missTab(){
    const base = pick(TRI), k = pick([1.5, 2, 2.5, 3, 4]);
    const abc = shuffle(base), def = shuffle(base.map(x => x * k));
    const A = Object.fromEntries(SN.map((n, i) => [n, abc[i]])), D = Object.fromEntries(DN.map((n, i) => [n, def[i]]));
    const [sa, sd] = sortedPairs(A, D);
    const hide = ri(0, 2), known = hide === 0 ? 1 : 0, [hn, hv] = sd[hide];
    const lab = DN.map(n => n === hn ? "?" : f(D[n]));
    return {n:"semb", kind:"num", ans:hv, unit:" cm",
      prompt:`Les triangles ABC et DEF sont semblables. Calcule la longueur <b>${hn}</b> (en cm).`,
      fig: fig([{v:["A","B","C"], s:abc, lab:abc.map(f), right:-1}, {v:["D","E","F"], s:def, lab, right:-1}]),
      short:`Calculer ${hn} dans des triangles semblables`,
      dist:[sa[hide][1] + (sd[known][1] - sa[known][1]), sa[hide][1] * k * k, sa[hide][1], hv + k],
      steps:`<p>On range les côtés dans l'ordre croissant :</p>${table([["Côtés de ABC", sa.map(([n, v]) => `${n} = ${f(v)}`)], ["Côtés de DEF", sd.map(([n, v], i) => i === hide ? `${n} = ?` : `${n} = ${f(v)}`)]])}
        <p>Le facteur : k = ${f(sd[known][1])} ÷ ${f(sa[known][1])} = ${f(k)}</p>
        <p>Donc ${hn} = ${f(k)} × ${f(sa[hide][1])} = ${f(hv)}</p>
        <p class="concl">${hn} = ${f(hv)} cm</p>`};
  },
  missK(){
    const base = shuffle(pick(TRI)), red = Math.random() < .3;
    const k = red ? 0.5 : pick([1.5, 2, 2.5, 3]);
    const i = ri(0, 2), src = red ? base.map(x => x * 2) : base;
    const ans = src[i] * k, names = red ? [DN, SN] : [SN, DN];
    const lab = src.map(f), t1 = red ? ["D","E","F"] : ["A","B","C"], t2 = red ? ["A","B","C"] : ["D","E","F"];
    const txt = red ? `ABC est une réduction de DEF de facteur ${f(k)}` : `DEF est un agrandissement de ABC de facteur ${f(k)}`;
    return {n:"agr", kind:"num", ans, unit:" cm",
      prompt:`${txt}. Les sommets homologues sont A et D, B et E, C et F. Calcule <b>${names[1][i]}</b> (en cm).`,
      fig: fig([{v:t1, s:src, lab, right:-1}]),
      short:`Calculer une longueur avec k = ${f(k)}`,
      dist:[src[i] + k, src[i] / (k || 1), src[i] * k * k, src[i]],
      steps:`<p>${names[1][i]} est le côté homologue de ${names[0][i]}. Les longueurs sont multipliées par k = ${f(k)}.</p>
        <p>${names[1][i]} = ${f(k)} × ${names[0][i]} = ${f(k)} × ${f(src[i])} = ${f(ans)}</p>
        <p class="concl">${names[1][i]} = ${f(ans)} cm</p>`};
  },
  angle(){
    const x = ri(5, 22) * 5, k = pick([2, 3, 4, 0.5, 1.5]), V = pick([["A","D"],["B","E"],["C","F"]]);
    return {n:"agr", kind:"num", ans:x, unit:"°",
      prompt:`Dans le triangle ABC, l'angle en <b>${V[0]}</b> mesure ${x}°. Le triangle DEF est ${k > 1 ? "un agrandissement" : "une réduction"} de ABC de facteur ${f(k)} (${V[0]} et ${V[1]} sont homologues). Combien mesure l'angle en <b>${V[1]}</b> ?`,
      fig:"", short:`Angle après ${k > 1 ? "agrandissement" : "réduction"}`,
      dist:[x * k, x + k, x * k * k, 180 - x],
      steps:`<p>Un agrandissement ou une réduction conserve les angles. Le facteur k ne change rien aux angles !</p>
        <p class="concl">L'angle en ${V[1]} mesure ${x}°, comme l'angle en ${V[0]}.</p>`};
  },
  perim(){
    const base = pick(TRI), k = pick([2, 3, 1.5, 0.5]), P = base[0] + base[1] + base[2], ans = P * k;
    return {n:"agr", kind:"num", ans, unit:" cm",
      prompt:`Le triangle ABC a pour côtés ${base.map(x => f(x) + " cm").join(", ")}. Le triangle DEF est ${k > 1 ? "un agrandissement" : "une réduction"} de ABC de facteur ${f(k)}. Calcule le <b>périmètre</b> de DEF.`,
      fig:"", short:"Périmètre après agrandissement ou réduction",
      dist:[P * k * k, P + k, P, P * 2 * k],
      steps:`<p>Périmètre de ABC : ${base.map(f).join(" + ")} = ${f(P)} cm</p>
        <p>Les longueurs sont multipliées par k, donc le périmètre aussi : ${f(P)} × ${f(k)} = ${f(ans)}</p>
        <p class="concl">Le périmètre de DEF est ${f(ans)} cm.</p>`};
  },
  kind(){
    const k = pick([0.8, 1.2, 1, 2.5, 0.25, 3, 0.9, 1.05, 0.5, 4]);
    const right = k > 1 ? 0 : k < 1 ? 1 : 2;
    const L = ["Un agrandissement", "Une réduction", "Deux figures identiques"];
    return {n:"agr", kind:"choice",
      prompt:`On multiplie toutes les longueurs d'une figure par <b>k = ${f(k)}</b>. On obtient…`,
      fig:"", short:`Facteur k = ${f(k)} : agrandissement ou réduction ?`,
      opts:L.map((t, i) => ({t, ok: i === right})), answerText:L[right],
      steps:`<p>k > 1 : agrandissement · 0 < k < 1 : réduction · k = 1 : figures identiques.</p>
        <p class="concl">${f(k)} ${k > 1 ? "> 1" : k < 1 ? "< 1" : "= 1"} : ${L[right].toLowerCase()}.</p>`};
  },
  aire(){
    const A = pick([6, 8, 10, 12, 13.5, 15, 20, 24, 30]), k = pick([2, 3, 0.5, 1.5, 10, 4]), ans = A * k * k;
    return {n:"aire", kind:"num", ans, unit:" cm²",
      prompt:`Un triangle a une aire de ${f(A)} cm². On ${k > 1 ? "l'agrandit" : "le réduit"} avec un facteur ${f(k)}. Quelle est l'<b>aire</b> du nouveau triangle ?`,
      fig:"", short:"Aire après agrandissement ou réduction",
      dist:[A * k, A * 2 * k, A + k, A],
      steps:`<p>Les aires sont multipliées par k² = ${f(k)} × ${f(k)} = ${f(k * k)}.</p>
        <p>${f(A)} × ${f(k * k)} = ${f(ans)}</p>
        <p class="concl">L'aire du nouveau triangle est ${f(ans)} cm².</p>`};
  },
  aireFac(){
    const k = pick([2, 3, 4, 5, 10, 0.5]);
    return {n:"aire", kind:"num", ans:k * k, unit:"",
      prompt:`On ${k > 1 ? "agrandit" : "réduit"} une figure : toutes les longueurs sont multipliées par ${f(k)}. Par combien l'<b>aire</b> est-elle multipliée ?`,
      fig:"", short:"Facteur des aires",
      dist:[k, 2 * k, k + 2, k * 3],
      steps:`<p>Les aires sont multipliées par k², c'est-à-dire k × k.</p><p class="concl">${f(k)} × ${f(k)} = ${f(k * k)}</p>`};
  },
  aireRev(){
    const k = pick([2, 3, 4, 5, 10]);
    return {n:"aire", kind:"num", ans:k, unit:"",
      prompt:`Après un agrandissement, l'aire d'une figure a été multipliée par ${k * k}. Quel est le <b>facteur d'agrandissement k</b> ?`,
      fig:"", short:"Retrouver k à partir des aires",
      dist:[k * k, k * k / 2, k + 1, k * k * k],
      steps:`<p>Les aires sont multipliées par k². On cherche donc le nombre qui, multiplié par lui-même, donne ${k * k}.</p><p class="concl">${k} × ${k} = ${k * k}, donc k = ${k}.</p>`};
  },
  rect(){
    const L = pick([[3, 4], [4, 6], [6, 8], [4.5, 6], [5, 12], [3, 8], [6, 9]]), k = pick([2, 3]);
    const a1 = L[0] * L[1] / 2, ans = a1 * k * k, hyp = Math.hypot(L[0], L[1]);
    return {n:"aire", kind:"num", ans, unit:" cm²",
      prompt:`ABC est rectangle en A, avec AB = ${f(L[1])} cm et AC = ${f(L[0])} cm. DEF est un agrandissement de ABC de facteur ${k}. Calcule l'<b>aire de DEF</b>.`,
      fig: fig([{v:["A","B","C"], s:[L[1], hyp, L[0]], lab:[f(L[1]) + " cm", "", f(L[0]) + " cm"], right:0}]),
      short:"Aire d'un triangle rectangle agrandi",
      dist:[a1 * k, a1, L[0] * L[1] * k * k, a1 * 2 * k],
      steps:`<p>Aire de ABC = (${f(L[1])} × ${f(L[0])}) ÷ 2 = ${f(L[0] * L[1])} ÷ 2 = ${f(a1)} cm²</p>
        <p>Aire de DEF = aire de ABC × k² = ${f(a1)} × ${k}² = ${f(a1)} × ${k * k} = ${f(ans)}</p>
        <p class="concl">L'aire de DEF est ${f(ans)} cm².</p>`};
  },
  homSide(){
    const base = shuffle(pick(TRI)), L2 = pick(["RST", "IJK", "MNP", "UVW", "XYZ"]).split(""), perm = shuffle([0, 1, 2]);
    const map = {A: L2[perm[0]], B: L2[perm[1]], C: L2[perm[2]]};
    const q = ri(0, 2), src = SN[q], ans = base[q];
    const tgt = map[src[0]] + map[src[1]];
    return {n:"egaux", kind:"num", ans, unit:" cm",
      prompt:`Les triangles ABC et ${L2.join("")} sont égaux : A et ${map.A} sont homologues, B et ${map.B}, C et ${map.C}. On sait que AB = ${f(base[0])} cm, BC = ${f(base[1])} cm et AC = ${f(base[2])} cm. Combien mesure <b>${tgt}</b> ?`,
      fig:"", short:"Côté homologue dans des triangles égaux",
      dist:base.filter((_, i) => i !== q).concat([ans * 2]),
      steps:`<p>${tgt[0]} est l'homologue de ${src[0]}, ${tgt[1]} est l'homologue de ${src[1]}. Donc ${tgt} est le côté homologue de ${src}.</p>
        <p>Dans deux triangles égaux, les côtés homologues ont la même longueur.</p>
        <p class="concl">${tgt} = ${src} = ${f(ans)} cm</p>`};
  },
  homAngle(){
    const a = ri(6, 16) * 5, b = ri(6, 16) * 5, c = 180 - a - b;
    const L2 = pick(["RST", "IJK", "MNP"]).split(""), perm = shuffle([0, 1, 2]);
    const map = {A: L2[perm[0]], B: L2[perm[1]], C: L2[perm[2]]};
    return {n:"egaux", kind:"num", ans:c, unit:"°",
      prompt:`Les triangles ABC et ${L2.join("")} sont égaux : A et ${map.A} sont homologues, B et ${map.B}, C et ${map.C}. L'angle en A mesure ${a}° et l'angle en B mesure ${b}°. Combien mesure l'angle en <b>${map.C}</b> ?`,
      fig:"", short:"Angle homologue dans des triangles égaux",
      dist:[a, b, 180 - a, 360 - a - b],
      steps:`<p>${map.C} est l'homologue de C, donc les angles en ${map.C} et en C ont la même mesure.</p>
        <p>Dans un triangle, la somme des angles fait 180° : angle C = 180 − ${a} − ${b} = ${c}°.</p>
        <p class="concl">L'angle en ${map.C} mesure ${c}°.</p>`};
  },
  cas(){
    const t = pick(["aca", "cac", "ccc", "aaa", "cca"]);
    const x = ri(7, 14) * 5, y = ri(5, 12) * 5, z = 180 - x - y, s = TRI[ri(0, TRI.length - 1)];
    const D = {
      aca:`un côté de ${s[0]} cm, et les deux angles adjacents à ce côté mesurent ${x}° et ${y}°`,
      cac:`deux côtés de ${s[0]} cm et ${s[1]} cm, et l'angle compris entre ces deux côtés mesure ${x}°`,
      ccc:`trois côtés de ${s[0]} cm, ${s[1]} cm et ${s[2]} cm`,
      aaa:`trois angles de ${x}°, ${y}° et ${z}°`,
      cca:`deux côtés de ${s[0]} cm et ${s[1]} cm, et un angle de ${x}° qui n'est pas entre ces deux côtés`
    };
    const O = [["aca", "Oui : un côté et les deux angles adjacents (1er cas)"], ["cac", "Oui : un angle et les deux côtés de cet angle (2e cas)"], ["ccc", "Oui : les trois côtés (3e cas)"], ["no", "Non, on ne peut pas conclure"]];
    const right = t === "aaa" || t === "cca" ? "no" : t;
    const why = {
      aca:"On connaît un côté et les deux angles à ses extrémités : c'est le 1er cas d'égalité.",
      cac:"On connaît un angle et les deux côtés qui partent de son sommet : c'est le 2e cas d'égalité.",
      ccc:"Les trois côtés sont de même longueur deux à deux : c'est le 3e cas d'égalité.",
      aaa:"Trois angles égaux ne suffisent pas : les triangles ont la même forme mais peuvent avoir des tailles différentes. Ils sont semblables, pas forcément égaux.",
      cca:"L'angle n'est pas entre les deux côtés connus : ce n'est aucun des trois cas. On ne peut pas conclure."
    };
    return {n:"cas", kind:"choice",
      prompt:`Deux triangles ont ${D[t]}, deux à deux. Peut-on affirmer qu'ils sont égaux ?`,
      fig:"", short:"Reconnaître un cas d'égalité",
      opts:O.map(([k, txt]) => ({t:txt, ok:k === right})), answerText:O.find(o => o[0] === right)[1], wide:true,
      steps:`<p class="concl">${why[t]}</p>`};
  }
};
const GBY_N = {};
Object.keys(GEN).forEach(g => { const n = GEN[g]().n; (GBY_N[n] = GBY_N[n] || []).push(g); });

/* ---------- passage au moteur ---------- */
const NOTIONS = Object.entries(NOT).map(([id, n]) => ({id, name: n.name, tag: n.name, sub: `Partie ${n.p} · ${n.d}`, group: String(n.p)}));
const UBY = Object.fromEntries(NOTIONS.map(u => [u.id, u]));

const review = e => `<span class="tag l${NOT[e.n].p}">${esc(NOT[e.n].name)}</span><span class="q">${esc(e.short)}</span><span>Réponse : <b>${esc(e.answerText || (f(e.ans) + e.unit))}</b></span>`;
const steps = e => `<div class="steps">${e.steps}</div>`;
function fromCours(c){
  return {n: c.n, notion: UBY[c.n], key: "c:" + c.id, kind: "choice", prompt: esc(c.q), wide: true, tip: c.tip,
    opts: shuffle(c.o.map((t, i) => ({t, ok: i === 0}))), answerText: c.o[0], short: c.q,
    steps: `<p class="concl">${esc(c.a).replace(/\n/g, "<br>")}</p>`, redo: () => fromCours(c)};
}
function fromGen(g){
  const e = GEN[g]();
  return Object.assign(e, {notion: UBY[e.n], key: "g:" + g + ":" + e.short, redo: () => fromGen(g)});
}
function pickItem(pool, R, preferCours){
  const n = R.weighted(pool).id;
  const cs = COURS.filter(c => c.n === n), gs = GBY_N[n] || [];
  return preferCours || !gs.length ? fromCours(pick(cs)) : fromGen(pick(gs));
}
const asQuiz = e => ({unit: e.notion, key: e.key, prompt: e.prompt, fig: e.fig, wide: e.wide, tip: e.tip,
  opts: e.kind === "num" ? Revision.numChoices(e.ans, e.dist || [], e.unit) : e.opts,
  feedback: () => steps(e), review: review(e)});
const asControl = e => Object.assign({unit: e.notion, prompt: e.prompt, fig: e.fig, wide: e.wide, tip: e.tip, review: review(e),
  correction: () => `<p class="label" style="margin-top:4px">Correction</p>${steps(e)}`, redo: () => asControl(e.redo())},
  e.kind === "num" ? {kind: "fields", fields: [Revision.numField(e.ans, e.unit)]} : {kind: "choice", opts: e.opts});

Revision.start({
  key: "triangles-leandre-v1",
  title: "Les triangles",
  subtitle: "Maths",
  eyebrow: "Maths · Géométrie · Chapitre 2",
  hand: "Égaux, semblables, agrandis ou réduits",
  groups: {
    "1": {name: "Triangles égaux", cls: "l1", filter: "Partie 1 · Égaux"},
    "2": {name: "Semblables", cls: "l2", filter: "Partie 2 · Semblables"},
    "3": {name: "Agrandissement", cls: "l3", filter: "Partie 3 · Agrandissement"}
  },
  units: NOTIONS,
  allLabel: () => "Tout le chapitre",
  mastery: {max: MAXM, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["pour commencer", "Lis la question, retourne la carte : la leçon et une astuce."],
    quiz: ["10 questions", "Cours et exercices, la bonne réponse parmi plusieurs."],
    control: ["noté sur 20", "Tu calcules toi-même, puis tu vois la correction rédigée."]
  },
  footnote: "Les exercices changent de nombres à chaque fois.",
  cards: pool => COURS.filter(c => pool.some(u => u.id === c.n)).map(c => ({unit: UBY[c.n],
    front: `<div class="fbody"><span class="card-q">${esc(c.card)}</span><span class="hint">Touche la carte pour voir la réponse</span></div>`,
    back: `<div class="fbody left"><span class="card-a">${esc(c.a)}</span>${c.tip ? `<span class="tip">${esc(c.tip)}</span>` : ""}</div>`})),
  quiz: {count: 10, make: (pool, R, i) => asQuiz(pickItem(pool, R, i % 2 === 0))},
  control: {
    lead: "3 questions de cours et 7 exercices. Pour les calculs, écris ton résultat (une virgule ou un point, comme tu veux). Chaque question vaut 2 points.",
    note: "Après chaque réponse, tu vois la correction rédigée, comme au tableau. Garde un brouillon à côté pour poser tes calculs.",
    size: () => 10,
    build: pool => {
      const ids = pool.map(u => u.id);
      const cs = shuffle(COURS.filter(c => ids.includes(c.n))).slice(0, 3).map(fromCours);
      const gp = ids.flatMap(n => GBY_N[n] || []), order = shuffle(gp), gs = [];
      for (let i = 0; i < 7; i++) gs.push(fromGen(i < order.length ? order[i] : pick(gp)));
      return shuffle([...cs, ...gs]).map(asControl);
    }
  }
});
})();
