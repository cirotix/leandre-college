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
  const isNew = m => m.ajoute && now - new Date(m.ajoute).getTime() < 14 * 864e5;
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
      return `<section><div class="sub"><h2>${esc(mt.nom)}</h2><span class="n">${ms.length} module${ms.length > 1 ? "s" : ""}</span></div>
        <div class="mods">${ms.map((m, i) => `<a class="mod" href="${esc(m.chemin)}" style="--r:${rot[i % rot.length]}deg; --hl:var(--${esc(mt.couleur)})">
          <span class="top"><span class="tag">${esc(mt.nom)}</span>${isNew(m) ? '<span class="new">Nouveau !</span>' : '<span class="go">Cartes · Quiz · Contrôle</span>'}</span>
          ${m.chapitre ? `<span class="ch">${hl(m.chapitre, toks)}</span>` : ""}
          <span class="k">${hl(m.titre, toks)}</span>
          <p class="d">${hl(m.resume, toks)}</p>
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
