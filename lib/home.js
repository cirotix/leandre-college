/* Accueil du site : liste des modules depuis modules.json, recherche et filtre par matière (tout en front).
   La recherche et la matière choisie sont gardées dans l'adresse (?q=…&m=…), pour revenir au même endroit. */
(async () => {
  "use strict";
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const fold = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ");
  const list = $("list"), qIn = $("q"), mats = $("mats"), count = $("count");

  let data;
  try { data = await (await fetch("modules.json", {cache: "no-cache"})).json(); }
  catch (e) { list.innerHTML = '<p class="d">Impossible de charger la liste des modules. Vérifie la connexion et recharge la page.</p>'; return; }

  const MAT = Object.fromEntries(data.matieres.map(m => [m.id, m]));
  const order = Object.fromEntries(data.matieres.map((m, i) => [m.id, i]));
  const now = Date.now();
  /* Résumé écrit par chaque module ouvert sur cet appareil (lib/revision.js) : {chemin: {seen, done, n, noun, fem, cd}} */
  let IDX = {};
  try { IDX = JSON.parse(localStorage.getItem("revisions-index") || "{}") || {}; } catch (e) {}
  const info = m => IDX[m.chemin] || null;
  /* « Nouveau ! » : ajouté il y a moins de 14 jours ET pas encore ouvert sur cet appareil */
  const isNew = m => m.ajoute && now - new Date(m.ajoute).getTime() < 14 * 864e5 && !info(m);
  function daysTo(cd){
    if (!cd || !cd.date) return null;
    const [y, mo, d] = cd.date.split("-").map(Number), t = new Date(y, mo - 1, d), today = new Date(); today.setHours(0, 0, 0, 0);
    const n = Math.round((t - today) / 864e5);
    return n >= 0 ? n : null;
  }
  function badge(m){
    if (isNew(m)) return '<span class="new">Nouveau !</span>';
    const i = info(m), n = daysTo(i && i.cd || m.controle);
    if (n !== null) return `<span class="new">${n === 0 ? "Contrôle aujourd'hui" : n === 1 ? "Contrôle demain" : "Contrôle J-" + n}</span>`;
    return "";
  }
  function state(m){
    const i = info(m);
    if (!i || !i.n) return '<span class="st">Pas encore commencé</span>';
    const pct = Math.round(i.done / i.n * 100);
    const t = new Date(), tk = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    const k = i.kd === tk ? i.k : null;   // cartes du jour calculées aujourd'hui seulement
    return `<span class="st"><span class="bar" style="--p:${pct}%" aria-hidden="true"></span>${i.done} / ${i.n} ${esc(i.noun || "notions")} maîtrisé${i.fem ? "e" : ""}s</span>${k ? `<span class="st due">${k} carte${k > 1 ? "s" : ""} à faire aujourd'hui</span>` : ""}`;
  }
  const mods = data.modules.filter(m => MAT[m.matiere]).map(m => Object.assign({}, m, {
    hay: fold([m.titre, m.resume, m.chapitre, MAT[m.matiere].nom, ...(m.motsCles || [])].join(" "))
  }));
  const present = data.matieres.filter(mt => mods.some(m => m.matiere === mt.id));

  const url = new URL(location.href);
  let q = url.searchParams.get("q") || "", mat = url.searchParams.get("m") || "all";
  if (mat !== "all" && mat !== "new" && !MAT[mat]) mat = "all";
  qIn.value = q;

  function hl(text, toks){
    const t = String(text ?? "");
    if (!toks.length) return esc(t);
    const f = fold(t), marks = new Array(t.length).fill(false);
    // fold() garde une lettre par caractère pour le français courant, on peut donc reporter les positions
    if (f.length === t.length) toks.forEach(k => { let i = f.indexOf(k); while (i >= 0) { for (let j = i; j < i + k.length; j++) marks[j] = true; i = f.indexOf(k, i + 1); } });
    let out = "", open = false;
    for (let i = 0; i < t.length; i++) {
      if (marks[i] && !open) { out += "<mark>"; open = true; }
      if (!marks[i] && open) { out += "</mark>"; open = false; }
      out += esc(t[i]);
    }
    return out + (open ? "</mark>" : "");
  }

  function render(){
    const toks = fold(q).split(/\s+/).filter(Boolean);
    const byText = mods.filter(m => toks.every(k => m.hay.includes(k)));
    const shown = byText.filter(m => mat === "all" || (mat === "new" ? isNew(m) : m.matiere === mat));

    const chips = [["all", "Tout", byText.length]];
    if (mods.some(isNew)) chips.push(["new", "Nouveautés", byText.filter(isNew).length]);
    present.forEach(mt => chips.push([mt.id, mt.nom, byText.filter(m => m.matiere === mt.id).length]));
    mats.innerHTML = chips.map(([k, t, n]) => `<button class="chip" type="button" data-m="${k}" aria-pressed="${mat === k}">${esc(t)}<small>${n}</small></button>`).join("");

    count.textContent = toks.length || mat !== "all" ? `${shown.length} module${shown.length > 1 ? "s" : ""} trouvé${shown.length > 1 ? "s" : ""}` : "";

    if (!shown.length) {
      list.innerHTML = `<div class="empty"><b>Rien trouvé</b><p class="d">Essaie un autre mot${mat !== "all" ? ", ou regarde dans toutes les matières" : ""}.</p>${mat !== "all" || q ? '<p><button class="chip" type="button" data-reset>Tout afficher</button></p>' : ""}</div>`;
      return;
    }
    const rot = [-.7, .6, -.4, .5];
    list.innerHTML = present.map(mt => {
      const ms = shown.filter(m => m.matiere === mt.id).sort((a, b) => (b.ajoute || "").localeCompare(a.ajoute || ""));
      if (!ms.length) return "";
      return `<section><div class="sub"><h2>${esc(mt.nom)}</h2>${ms.length > 1 ? `<span class="n">${ms.length} modules</span>` : ""}</div>
        <div class="mods">${ms.map((m, i) => `<a class="mod" href="${esc(m.chemin)}" style="--r:${rot[i % rot.length]}deg; --hl:var(--${esc(mt.couleur)})">
          <span class="top"><span class="ch">${hl(m.chapitre || mt.nom, toks)}</span>${badge(m)}</span>
          <span class="k">${hl(m.titre, toks)}</span>
          <p class="d">${hl(m.resume, toks)}</p>
          ${state(m)}
        </a>`).join("")}</div></section>`;
    }).join("");
  }
  function sync(){
    const u = new URL(location.href);
    q ? u.searchParams.set("q", q) : u.searchParams.delete("q");
    mat !== "all" ? u.searchParams.set("m", mat) : u.searchParams.delete("m");
    history.replaceState(null, "", u);
  }

  qIn.addEventListener("input", () => { q = qIn.value; sync(); render(); });
  qIn.addEventListener("keydown", e => { if (e.key === "Escape") { qIn.value = q = ""; sync(); render(); } if (e.key === "Enter") qIn.blur(); });
  document.addEventListener("click", e => {
    const c = e.target.closest("[data-m]");
    if (c) { mat = c.dataset.m; sync(); render(); return; }
    if (e.target.closest("[data-reset]")) { mat = "all"; qIn.value = q = ""; sync(); render(); }
  });
  render();
})();
