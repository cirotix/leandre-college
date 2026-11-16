/* Module : anglais · Describe a picture (décrire une image), 4e.
   Sources : cahier de Léandre, leçon du vendredi 2 octobre 2026 (description de la photo des garçons qui sautent dans l'eau
   depuis une structure gonflable : We can see…, They're wearing…, look / seem, are having fun) et page suivante
   (campagne = countryside, image de la ferme légendée : fence, windmill, mountain, barn, water tower, field, grass,
   path / dirt track, bush ; « Emplacement » : in the top left corner, at the top, in the background, on the left,
   on the right, in the middle, at the bottom, in the foreground, in the bottom right corner ; « Do a drawing of countryside »).
   Vocabulaire en plus, signalé « En plus » : les deux autres coins, les prépositions de lieu, quelques mots de la campagne
   et de la plage, There is / There are, be + -ing, les adjectifs des émotions. Images : dessins SVG faits pour le module.
   Film animé (film.mp4) : les 9 zones de l'image, les plans, les prépositions, les phrases du cahier.
   Ajout du 16 novembre 2026 : la fiche « Tool box » (Things · People · Actions · Places · Feelings, photo du baseball)
   et les tableaux du cahier remplis sur le même modèle (le camp, le lacrosse, la randonnée, le team building, le baseball),
   plus la description de la ferme rédigée par Léandre (ses erreurs deviennent des exercices « corrige l'erreur »).
   Données + règles ; le moteur est dans lib/revision.js. */
(() => {
"use strict";
const {esc, shuffle, pick, speakBtn} = Revision;

/* ---------- les dessins (SVG) : objets, scènes, mini-schémas ----------
   Repère des scènes : 360 × 240, découpé en 9 zones de 120 × 80 (3 lignes, 3 colonnes).
   Chaque objet est dessiné autour de son ancre (0, 0) : au sol pour les objets posés, au centre pour le ciel. */
const ART = (() => {
  const K = {ink: "#2A3152", sky: "#BFE4FF", sky2: "#EAF6FF", grass: "#A5DB7C", grass2: "#86C95E", hill: "#7DBF5C", hill2: "#9DD27A",
    red: "#D64B3C", red2: "#A93B30", wood: "#B98049", wood2: "#87592C", white: "#FFFFFF", cream: "#FFF3DA", rock: "#8D97AE",
    rock2: "#B9C1D4", water: "#4FA8E0", water2: "#8ED0F4", sand: "#F3DBA2", sand2: "#E7C67F", sun: "#FFC93C", orange: "#FF8A1F",
    skin: "#F1C29A", skin2: "#C98B5E", leaf: "#3C9A4B", leaf2: "#5DBA56", yellow: "#FFD84A", blue: "#3B78DE", pink: "#FF92B8",
    gray: "#717A93", brown: "#A0683A", black: "#2B2B33", green: "#3E9F4C"};
  const S = `stroke="${K.ink}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  const S1 = `stroke="${K.ink}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
  const at = (x, y, s, body, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${body}</g>`;
  let uid = 0;

  /* ---------- les objets ---------- */
  const D = {
    barn: () => `<path d="M-25 0V-26L-14 -41H14L25 -26V0Z" fill="${K.red}" ${S}/>
      <path d="M-27 -25L-15 -43H15L27 -25" fill="none" stroke="${K.white}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M-27 -25L-15 -43H15L27 -25" fill="none" ${S1}/>
      <rect x="-10" y="-21" width="20" height="21" fill="${K.white}" ${S1}/>
      <path d="M-10 -21L10 0M10 -21L-10 0" stroke="${K.red}" stroke-width="2.2"/>
      <rect x="-5" y="-35" width="10" height="8" fill="${K.white}" ${S1}/>`,
    windmill: () => `<path d="M-9 0L-5 -36H5L9 0Z" fill="${K.cream}" ${S}/>
      <rect x="-3" y="-10" width="6" height="10" fill="${K.wood2}"/>
      <path d="M-7 -35Q0 -46 7 -35Z" fill="${K.red}" ${S}/>
      ${[25, 115, 205, 295].map(a => `<g transform="rotate(${a} 0 -39)"><rect x="-3" y="-64" width="6" height="24" fill="${K.white}" ${S1}/><path d="M0 -62V-42" stroke="${K.ink}" stroke-width=".9"/></g>`).join("")}
      <circle cx="0" cy="-39" r="3" fill="${K.ink}"/>`,
    watertower: () => `<path d="M-10 0L-7 -28M10 0L7 -28M-9 -9L9 -19M9 -9L-9 -19" fill="none" stroke="${K.ink}" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="-14" y="-47" width="28" height="19" rx="3" fill="${K.rock2}" ${S}/>
      <path d="M-14 -40H14" stroke="${K.ink}" stroke-width="1"/>
      <path d="M-15 -47L0 -57L15 -47Z" fill="${K.gray}" ${S}/>`,
    house: () => `<rect x="-17" y="-25" width="34" height="25" fill="${K.cream}" ${S}/>
      <path d="M-21 -23L0 -41L21 -23Z" fill="${K.red2}" ${S}/>
      <rect x="-5" y="-15" width="10" height="15" fill="${K.wood}" ${S1}/>
      <rect x="-14" y="-19" width="7" height="7" fill="${K.sky}" ${S1}/><rect x="7" y="-19" width="7" height="7" fill="${K.sky}" ${S1}/>`,
    tree: () => `<rect x="-3.5" y="-23" width="7" height="23" fill="${K.wood}" ${S}/>
      <path d="M-14 -22C-25 -23 -25 -40 -13 -42C-12 -55 12 -55 13 -42C25 -40 25 -23 14 -22Z" fill="${K.leaf2}" ${S}/>
      <path d="M-6 -36q3 -4 7 -2M5 -28q3 -3 6 -1" fill="none" stroke="${K.leaf}" stroke-width="1.6" stroke-linecap="round"/>`,
    bush: () => `<path d="M-21 0C-28 0 -28 -12 -18 -14C-18 -25 -5 -27 0 -19C5 -27 18 -25 18 -14C28 -12 28 0 21 0Z" fill="${K.leaf}" ${S}/>
      <circle cx="-9" cy="-10" r="1.8" fill="${K.red}"/><circle cx="7" cy="-15" r="1.8" fill="${K.red}"/><circle cx="12" cy="-6" r="1.8" fill="${K.red}"/>`,
    fence: () => `<rect x="-28" y="-19" width="56" height="4.5" fill="${K.wood}" ${S1}/><rect x="-28" y="-10" width="56" height="4.5" fill="${K.wood}" ${S1}/>
      ${[-23, -8, 7, 22].map(x => `<path d="M${x - 3} 0V-21L${x} -24L${x + 3} -21V0Z" fill="${K.wood}" ${S1}/>`).join("")}`,
    cow: () => `<path d="M-12 -9V0M-6 -9V0M10 -9V0M16 -9V0" stroke="${K.ink}" stroke-width="3" stroke-linecap="round"/>
      <path d="M20 -21q7 4 4 13" fill="none" ${S}/>
      <rect x="-17" y="-25" width="38" height="17" rx="7" fill="${K.white}" ${S}/>
      <path d="M-5 -25q7 5 1 12q-8 -1 -8 -8q2 -3 7 -4z" fill="${K.black}"/><circle cx="13" cy="-17" r="4" fill="${K.black}"/>
      <rect x="-29" y="-32" width="14" height="14" rx="5" fill="${K.white}" ${S}/>
      <rect x="-32" y="-23" width="11" height="8" rx="3.5" fill="${K.pink}" ${S1}/>
      <path d="M-27 -32l-2 -4M-18 -32l2 -4" ${S}/><circle cx="-24" cy="-27" r="1.3" fill="${K.ink}"/>`,
    sheep: () => `<path d="M-8 -7V0M-2 -7V0M8 -7V0M13 -7V0" stroke="${K.black}" stroke-width="3" stroke-linecap="round"/>
      <path d="M-14 -10C-21 -10 -21 -21 -13 -22C-12 -30 -2 -30 0 -25C3 -31 13 -30 13 -23C21 -22 21 -10 14 -9C11 -4 -10 -4 -14 -10Z" fill="${K.white}" ${S}/>
      <ellipse cx="-17" cy="-20" rx="5" ry="6.5" fill="${K.black}"/><circle cx="-18.5" cy="-21" r="1.2" fill="${K.white}"/>`,
    horse: () => `<path d="M-11 -14V0M-5 -14V0M10 -14V0M15 -14V0" stroke="${K.wood2}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M18 -25q9 6 4 17" fill="none" stroke="${K.black}" stroke-width="3" stroke-linecap="round"/>
      <rect x="-16" y="-28" width="36" height="16" rx="7" fill="${K.brown}" ${S}/>
      <path d="M-15 -24L-21 -42L-13 -45L-6 -27Z" fill="${K.brown}" ${S}/>
      <path d="M-21 -42L-32 -37Q-34 -33 -30 -32L-18 -35Z" fill="${K.brown}" ${S}/>
      <path d="M-13 -45L-5 -27" stroke="${K.black}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-22" cy="-39" r="1.2" fill="${K.ink}"/>`,
    tractor: () => `<path d="M-26 -9V-20H-1V-36H17V-9Z" fill="${K.green}" ${S}/>
      <rect x="3" y="-33" width="11" height="11" fill="${K.sky}" ${S1}/>
      <rect x="-15" y="-29" width="3.5" height="9" fill="${K.ink}"/>
      <circle cx="10" cy="-12" r="12" fill="${K.black}" ${S}/><circle cx="10" cy="-12" r="4.5" fill="${K.yellow}"/>
      <circle cx="-18" cy="-6" r="6" fill="${K.black}" ${S}/><circle cx="-18" cy="-6" r="2.2" fill="${K.yellow}"/>`,
    flowers: () => `<path d="M-11 0V-12M0 0V-17M11 0V-11" stroke="${K.leaf}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M-5 -6q-5 -4 -8 0M5 -7q5 -4 8 0" fill="${K.leaf2}" stroke="${K.leaf}" stroke-width="1.2"/>
      ${[[-11, -14, K.pink], [0, -19, K.yellow], [11, -13, K.blue]].map(([x, y, c]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-3.6" r="2.8" fill="${c}" transform="rotate(${a})"/>`).join("")}<circle r="2" fill="${K.orange}"/></g>`).join("")}`,
    dog: () => `<path d="M-9 -9V0M-4 -9V0M6 -9V0M10 -9V0" stroke="${K.wood2}" stroke-width="3" stroke-linecap="round"/>
      <path d="M12 -15q7 -5 5 -12" fill="none" stroke="${K.wood2}" stroke-width="3" stroke-linecap="round"/>
      <rect x="-12" y="-18" width="26" height="11" rx="5.5" fill="${K.brown}" ${S}/>
      <circle cx="-13" cy="-22" r="7" fill="${K.brown}" ${S}/>
      <ellipse cx="-20" cy="-20" rx="4" ry="3" fill="${K.brown}" ${S1}/><circle cx="-23.5" cy="-20.5" r="1.4" fill="${K.ink}"/>
      <path d="M-10 -28q5 2 3 10q-4 -1 -5 -6z" fill="${K.wood2}"/><circle cx="-15" cy="-24" r="1.2" fill="${K.ink}"/>`,
    cat: () => `<path d="M8 -2q12 -2 10 -14" fill="none" stroke="${K.gray}" stroke-width="3" stroke-linecap="round"/>
      <path d="M-9 0C-11 -8 -9 -16 -2 -18C6 -18 10 -10 9 0Z" fill="${K.gray}" ${S}/>
      <circle cx="-3" cy="-22" r="7" fill="${K.gray}" ${S}/>
      <path d="M-9 -25L-9 -32L-4 -28ZM2 -28L4 -32L4 -24Z" fill="${K.gray}" ${S1}/>
      <circle cx="-5.5" cy="-23" r="1.1" fill="${K.ink}"/><circle cx="-0.5" cy="-23" r="1.1" fill="${K.ink}"/>`,
    bench: () => `<path d="M-19 -12V0M19 -12V0" stroke="${K.ink}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M-19 -15V-29M19 -15V-29" stroke="${K.ink}" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="-25" y="-16" width="50" height="5" rx="1.5" fill="${K.wood}" ${S1}/>
      <rect x="-25" y="-30" width="50" height="5" rx="1.5" fill="${K.wood}" ${S1}/><rect x="-25" y="-23" width="50" height="4" rx="1.5" fill="${K.wood}" ${S1}/>`,
    ball: () => `<circle cx="0" cy="-7" r="7" fill="${K.red}" ${S}/><path d="M-7 -7H7M0 -14q5 7 0 14" fill="none" stroke="${K.white}" stroke-width="1.6"/>`,
    sun: () => `${Array.from({length: 10}, (_, i) => `<path d="M0 -17V-24" stroke="${K.sun}" stroke-width="3" stroke-linecap="round" transform="rotate(${i * 36})"/>`).join("")}
      <circle r="13" fill="${K.sun}" ${S}/>`,
    cloud: () => `<path d="M-24 8C-32 8 -32 -3 -23 -4C-23 -14 -10 -16 -6 -9C-3 -18 12 -18 13 -8C24 -10 28 2 22 8Z" fill="${K.white}" stroke="#9FB3CC" stroke-width="1.6" stroke-linejoin="round"/>`,
    birds: () => `<path d="M-16 0q5 -7 10 0q5 -7 10 0M4 -12q4 -6 8 0q4 -6 8 0M-2 8q3 -5 6 0q3 -5 6 0" fill="none" stroke="${K.ink}" stroke-width="2" stroke-linecap="round"/>`,
    plane: () => `<path d="M-24 0Q-24 -5 -16 -5H18L26 -13H30L26 0Q24 3 18 3H-18Q-24 3 -24 0Z" fill="${K.white}" ${S}/>
      <path d="M-4 -1L6 -1L-6 12H-12Z" fill="${K.rock2}" ${S1}/><circle cx="-14" cy="-1" r="1.6" fill="${K.sky}" ${S1}/><circle cx="-8" cy="-1" r="1.6" fill="${K.sky}" ${S1}/><circle cx="-2" cy="-1" r="1.6" fill="${K.sky}" ${S1}/>`,
    mountain: () => `<path d="M-62 0L-24 -58L-10 -40L10 -72L62 0Z" fill="${K.rock2}" ${S}/>
      <path d="M-32 -46L-24 -58L-15 -46L-20 -42L-25 -47Z" fill="${K.white}" ${S1}/><path d="M1 -58L10 -72L20 -57L14 -53L10 -58L5 -53Z" fill="${K.white}" ${S1}/>`,
    boat: () => `<path d="M-22 -8H22L15 2H-15Z" fill="${K.red}" ${S}/><path d="M0 -8V-44" stroke="${K.ink}" stroke-width="2"/>
      <path d="M2 -42L20 -12H2Z" fill="${K.white}" ${S1}/><path d="M-2 -38L-16 -12H-2Z" fill="${K.yellow}" ${S1}/>`,
    lighthouse: () => `<path d="M-9 0L-6 -46H6L9 0Z" fill="${K.white}" ${S}/>
      <path d="M-8.2 -12H8.2L7.4 -24H-7.4ZM-6.8 -34H6.8L6.3 -42H-6.3Z" fill="${K.red}"/>
      <rect x="-6" y="-56" width="12" height="10" fill="${K.yellow}" ${S1}/><path d="M-8 -56L0 -63L8 -56Z" fill="${K.red}" ${S1}/>`,
    umbrella: () => `<path d="M0 0V-38" stroke="${K.ink}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M-26 -34Q0 -58 26 -34Q19 -38 13 -34Q6 -39 0 -34Q-6 -39 -13 -34Q-19 -38 -26 -34Z" fill="${K.red}" ${S}/>
      <path d="M-13 -34Q-8 -50 0 -49Q8 -50 13 -34" fill="none" stroke="${K.white}" stroke-width="3"/>`,
    sandcastle: () => `<path d="M-20 0V-14H-14V-18H-9V-14H9V-18H14V-14H20V0Z" fill="${K.sand2}" ${S}/>
      <path d="M-7 -14V-26H-3V-30H3V-26H7V-14Z" fill="${K.sand2}" ${S}/><path d="M0 -30V-38L7 -35L0 -33" fill="${K.red}" stroke="${K.ink}" stroke-width="1.2"/>
      <path d="M-3 0V-6Q0 -9 3 -6V0Z" fill="${K.wood2}"/>`,
    bucket: () => `<path d="M-8 -14H8L6 0H-6Z" fill="${K.blue}" ${S}/><path d="M-8 -14Q0 -24 8 -14" fill="none" stroke="${K.ink}" stroke-width="1.6"/>
      <path d="M12 0L16 -18" stroke="${K.ink}" stroke-width="2"/><path d="M13 0L19 -2L17 4Z" fill="${K.yellow}" ${S1}/>`,
    lifejacket: () => `<path d="M-14 -30L-6 -34Q0 -26 6 -34L14 -30L13 0H-13Z" fill="${K.orange}" ${S}/>
      <path d="M0 -26V0" stroke="${K.ink}" stroke-width="1.5"/><path d="M-13 -12H13M-13 -20H13" stroke="${K.ink}" stroke-width="2.2"/>
      <rect x="-3" y="-14" width="6" height="4" fill="${K.rock2}" ${S1}/><rect x="-3" y="-22" width="6" height="4" fill="${K.rock2}" ${S1}/>`,
    swimsuit: () => `<path d="M-14 -22H14L13 -8Q6 -8 2 0H-2Q-6 -8 -13 -8Z" fill="${K.blue}" ${S}/><path d="M-14 -18H14" stroke="${K.yellow}" stroke-width="2.4"/>`
  };
  const icon = (t, x, y, s = 1, flip = false) => at(x, y, s, D[t](), flip);

  /* une personne : pose = stand | jump | swim | sit | build ; vest = gilet de sauvetage */
  function kid(x, y, s, o = {}){
    const sk = o.skin || K.skin, sh = o.shirt || K.blue, hair = o.hair || K.wood2, pose = o.pose || "stand";
    const limb = (d, c = sk, w = 3.4) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const torso = o.vest
      ? `<path d="M-6 -28L-2 -30Q0 -26 2 -30L6 -28L6 -15H-6Z" fill="${K.orange}" ${S1}/><path d="M-6 -21H6" stroke="${K.ink}" stroke-width="1.3"/>`
      : `<rect x="-5.5" y="-29" width="11" height="15" rx="3" fill="${sh}" ${S1}/>`;
    const trunks = `<rect x="-5.5" y="-16" width="11" height="5" rx="1.5" fill="${o.trunks || K.blue}" ${S1}/>`;
    const head = (hx, hy) => `<circle cx="${hx}" cy="${hy}" r="5.6" fill="${sk}" ${S1}/><path d="M${hx - 5.6} ${hy - 1}q1 -6 5.6 -6q4.6 0 5.6 6q-3 -3 -5.6 -3q-3 0 -5.6 3z" fill="${hair}"/>
      ${o.smile !== false ? `<path d="M${hx - 2} ${hy + 1.6}q2 2 4 0" fill="none" stroke="${K.ink}" stroke-width="1"/>` : ""}`;
    let b = "";
    if (pose === "stand") b = limb("M-3 -12L-4 0M3 -12L4 0", sk) + limb("M-5 -27L-10 -16M5 -27L10 -16") + torso + (o.vest ? trunks : "") + head(0, -35);
    else if (pose === "arms") b = limb("M-3 -12L-4 0M3 -12L4 0", sk) + limb("M-5 -27L-11 -38M5 -27L11 -38") + torso + (o.vest ? trunks : "") + head(0, -35);
    else if (pose === "jump") b = limb("M-3 -12L-9 -6L-5 0M3 -12L9 -7L7 0", sk) + limb("M-5 -27L-12 -39M5 -27L12 -39") + torso + trunks + head(0, -35);
    else if (pose === "swim") b = limb("M-5 -4L-14 -12M5 -4L14 -12") + (o.vest ? `<path d="M-6 -4L-2 -6Q0 -2 2 -6L6 -4L6 2H-6Z" fill="${K.orange}" ${S1}/>` : "") + head(0, -10)
      + `<path d="M-18 2q4 -3 8 0q4 -3 8 0q4 -3 8 0q4 -3 8 0q4 -3 8 0" fill="none" stroke="${K.white}" stroke-width="1.6"/>`;
    else if (pose === "build") b = limb("M-4 -2L-12 0M4 -2L12 0", sk) + limb("M-5 -16L-10 -6M5 -16L11 -8") + `<rect x="-5.5" y="-18" width="11" height="15" rx="3" fill="${sh}" ${S1}/>` + head(0, -24);
    return at(x, y, s, b, o.flip);
  }

  /* ---------- fonds et cadres ---------- */
  function sky(id, c1 = K.sky, c2 = K.sky2){
    return `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="360" height="240" fill="url(#${id}s)"/>`;
  }
  function country(id){
    return sky(id) + `<path d="M0 124Q50 104 110 118T220 114T360 120V240H0Z" fill="${K.hill2}"/>
      <path d="M0 132Q90 122 180 130T360 128V240H0Z" fill="${K.grass}"/>
      <path d="M20 200q4 -6 8 0M80 180q4 -6 8 0M300 190q4 -6 8 0M240 214q4 -6 8 0M150 226q4 -6 8 0" fill="none" stroke="${K.grass2}" stroke-width="1.6" stroke-linecap="round"/>`;
  }
  function frame(inner, o = {}){
    const id = "a" + (++uid), w = o.w || 360, h = o.h || 240;
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${o.label || "Une image à décrire"}" style="${o.style || ""}"><defs><clipPath id="${id}c"><rect width="${w}" height="${h}" rx="10"/></clipPath></defs>
      <g clip-path="url(#${id}c)">${typeof inner === "function" ? inner(id) : inner}</g><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10" fill="none" stroke="${K.ink}" stroke-width="2"/></svg>`;
  }

  /* ---------- les 9 zones ---------- */
  const CX = [60, 180, 300], CY = [40, 120, 200];
  const ROW = {top: ["sun", "cloud", "birds", "plane"], mid: ["barn", "windmill", "watertower", "house", "tree"],
    bot: ["cow", "sheep", "horse", "bush", "tractor", "flowers", "dog", "fence"]};
  const SIZE = {barn: [52, 44], windmill: [50, 64], watertower: [30, 57], house: [42, 41], tree: [50, 55], cow: [56, 36], sheep: [42, 30],
    horse: [54, 45], bush: [52, 27], tractor: [52, 36], flowers: [30, 24], dog: [40, 30], fence: [58, 24], sun: [50, 50], cloud: [60, 26],
    birds: [40, 24], plane: [56, 26], mountain: [124, 72]};
  /* place un objet dans la zone z (0 à 8) ; renvoie {svg, box: [cx, cy, rx, ry]} */
  function place(t, z, jit = 0){
    const r = Math.floor(z / 3), c = z % 3, x = CX[c] + jit, [w, h] = SIZE[t];
    if (r === 0) return {svg: icon(t, x, CY[0], 1.15), box: [x, CY[0], w * .62, h * .7]};
    if (r === 1) { const s = .95, y = 150; return {svg: icon(t, x, y, s, c === 2 && t !== "barn"), box: [x, y - h * s / 2, w * s * .62, h * s * .66]}; }
    const s = 1.3, y = 226; return {svg: icon(t, x, y, s, c === 0 && Math.random() < .5), box: [x, y - h * s / 2, w * s * .6, h * s * .68]};
  }
  const rowOf = z => ["top", "mid", "bot"][Math.floor(z / 3)];
  /* une scène de campagne tirée au hasard : 6 à 8 objets, tous différents, au plus un par zone */
  function randomScene(must){
    const zones = [0, 1, 2, 3, 4, 5, 6, 7, 8], used = new Set(), items = [];
    const pickT = row => { const c = ROW[row].filter(t => !used.has(t)); return c[Math.floor(Math.random() * c.length)]; };
    const keep = zones.filter(z => (must !== undefined && z === must) || Math.random() < (Math.floor(z / 3) === 0 ? .62 : .78));
    for (const z of keep) { const t = pickT(rowOf(z)); used.add(t); items.push({t, z}); }
    return items;
  }
  function sceneSVG(items, o = {}){
    const placed = items.map(it => Object.assign({}, it, place(it.t, it.z, it.j || 0)));
    const hi = o.ring !== undefined ? placed.find(p => p.z === o.ring) : null;
    return {svg: frame(id => country(id) + placed.map(p => p.svg).join("")
      + (hi ? `<ellipse cx="${hi.box[0]}" cy="${hi.box[1]}" rx="${hi.box[2] + 6}" ry="${hi.box[3] + 6}" fill="none" stroke="${K.red}" stroke-width="3" stroke-dasharray="7 5"/>` : "")
      + (o.grid ? grid() : ""), {label: o.label || "Une image de la campagne"}), placed};
  }
  const grid = () => `<g stroke="${K.ink}" stroke-width="1.2" stroke-dasharray="4 4" opacity=".45"><path d="M120 0V240M240 0V240M0 80H360M0 160H360"/></g>`;

  /* mini-schéma : la zone (ou le plan) en couleur */
  function miniZone(z){
    const r = Math.floor(z / 3), c = z % 3;
    return `<svg viewBox="0 0 150 100" role="img" aria-label="La zone sur l'image" style="max-width:190px">
      <rect x="1" y="1" width="148" height="98" rx="6" fill="${K.sky2}" stroke="${K.ink}" stroke-width="2"/>
      <rect x="${1 + c * 49.3}" y="${1 + r * 32.7}" width="49.3" height="32.7" fill="${K.red}" opacity=".85" rx="${(r !== 1 && c !== 1) ? 5 : 0}"/>
      <path d="M50.3 1V99M99.6 1V99M1 33.7H149M1 66.4H149" stroke="${K.ink}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".6"/></svg>`;
  }
  function miniPlan(fg){
    return frame(id => country(id) + icon("mountain", 250, 132, .9) + icon("windmill", 120, 136, .55)
      + icon("bush", 70, 228, 1.5) + icon("sheep", 250, 224, 1.4)
      + `<rect x="5" y="${fg ? 176 : 70}" width="350" height="${fg ? 60 : 74}" rx="8" fill="${K.red}" fill-opacity=".14" stroke="${K.red}" stroke-width="3" stroke-dasharray="8 6"/>`
      + `<rect x="98" y="${fg ? 140 : 18}" width="164" height="30" rx="8" fill="${K.white}" stroke="${K.red}" stroke-width="2"/><text x="180" y="${fg ? 161 : 39}" text-anchor="middle" font-family="Lexend,sans-serif" font-weight="700" font-size="17" fill="${K.red}">${fg ? "in the foreground" : "in the background"}</text>`,
      {label: fg ? "Le premier plan : en bas, ce qui est près" : "L'arrière-plan : au fond, ce qui est loin", style: "max-width:260px"});
  }
  /* image « près / loin » : un objet au premier plan, un autre à l'arrière-plan */
  function planScene(fgT, bgT){
    return frame(id => country(id) + icon("mountain", 270, 132, .8) + (bgT ? icon(bgT, 110, 134, .55, false) : "") + (fgT ? icon(fgT, 200, 228, 1.7) : ""),
      {label: "Une image avec un premier plan et un arrière-plan"});
  }

  /* ---------- les prépositions ---------- */
  const PREP = {
    "next to": [["dog", "house", "The dog is next to the house."], ["cow", "tree", "The cow is next to the tree."], ["sheep", "barn", "The sheep is next to the barn."]],
    "behind": [["cow", "fence", "The cow is behind the fence."], ["dog", "bush", "The dog is behind the bush."], ["sheep", "fence", "The sheep is behind the fence."]],
    "in front of": [["dog", "house", "The dog is in front of the house."], ["horse", "barn", "The horse is in front of the barn."], ["tractor", "barn", "The tractor is in front of the barn."]],
    "between": [["dog", "tree", "The dog is between the two trees."], ["cow", "bush", "The cow is between the two bushes."], ["house", "tree", "The house is between the two trees."]],
    "under": [["dog", "bench", "The dog is under the bench."], ["ball", "bench", "The ball is under the bench."], ["cat", "bench", "The cat is under the bench."]],
    "above": [["birds", "barn", "The birds are above the barn."], ["plane", "house", "The plane is above the house."], ["sun", "windmill", "The sun is above the windmill."]],
    "on": [["cat", "house", "The cat is on the roof."], ["ball", "bench", "The ball is on the bench."], ["cat", "bench", "The cat is on the bench."]]
  };
  function prepScene(p, k){
    const [a, b] = PREP[p][k], gnd = 128;
    const bg = id => sky(id) + `<path d="M0 100Q120 90 240 100V150H0Z" fill="${K.grass}"/>`;
    let s = "";
    if (p === "next to") s = icon(b, 92, gnd, 1.25) + icon(a, 158, gnd, 1.15);
    if (p === "behind") s = (b === "fence" ? icon(a, 124, gnd - 12, a === "sheep" ? 1.45 : 1.25) + icon(b, 120, gnd, 1.3) : icon(a, 136, gnd - 14, 1.35) + icon(b, 112, gnd, 1.45));
    if (p === "in front of") s = icon(b, 112, gnd - 14, 1.25) + icon(a, 138, gnd + 4, 1.2);
    if (p === "between") s = icon(b, 58, gnd, 1.15) + icon(b, 182, gnd, 1.15) + icon(a, 120, gnd, a === "house" ? 1.05 : 1.15);
    if (p === "under") s = icon(b, 120, gnd, 1.7) + icon(a, 120, gnd - 1, a === "ball" ? 1.1 : .85);
    if (p === "above") s = icon(b, 120, gnd, 1.25) + icon(a, 120, 26, 1);
    if (p === "on") s = a === "cat" && b === "house" ? icon(b, 120, gnd, 1.6) + icon(a, 104, gnd - 51, .8) : icon(b, 120, gnd, 1.6) + icon(a, 120, gnd - 25, a === "ball" ? 1.1 : .85);
    return frame(id => bg(id) + s, {w: 240, h: 150, label: "Où est-il ?", style: "max-width:320px"});
  }

  /* ---------- les visages ---------- */
  const FACE = {
    happy: `<path d="M-9 -6q0 -3 0 0M9 -6q0 -3 0 0" stroke="${K.ink}" stroke-width="3.4" stroke-linecap="round"/><path d="M-11 5q11 11 22 0" fill="none" ${S}/>`,
    sad: `<circle cx="-8" cy="-5" r="2" fill="${K.ink}"/><circle cx="8" cy="-5" r="2" fill="${K.ink}"/><path d="M-9 11q9 -8 18 0" fill="none" ${S}/><path d="M-14 -12l5 -2M14 -12l-5 -2" ${S}/><path d="M-9 0q-2 4 0 6q2 -2 0 -6z" fill="${K.water}"/>`,
    scared: `<circle cx="-8" cy="-5" r="4.6" fill="${K.white}" ${S1}/><circle cx="8" cy="-5" r="4.6" fill="${K.white}" ${S1}/><circle cx="-8" cy="-5" r="1.6" fill="${K.ink}"/><circle cx="8" cy="-5" r="1.6" fill="${K.ink}"/><path d="M-9 10q3 -3 6 0q3 3 6 0q3 -3 6 0" fill="none" ${S}/><path d="M-14 -14l6 2M14 -14l-6 2" ${S}/>`,
    tired: `<path d="M-12 -4q4 3 8 0M4 -4q4 3 8 0" fill="none" ${S}/><path d="M-5 9h10" ${S}/><text x="13" y="-12" font-family="Lexend,sans-serif" font-weight="700" font-size="11" fill="${K.blue}">z z</text>`,
    surprised: `<circle cx="-8" cy="-5" r="3" fill="${K.ink}"/><circle cx="8" cy="-5" r="3" fill="${K.ink}"/><ellipse cx="0" cy="9" rx="4.5" ry="6" fill="${K.ink}"/><path d="M-13 -14q5 -4 9 -1M13 -14q-5 -4 -9 -1" fill="none" ${S}/>`,
    angry: `<circle cx="-8" cy="-3" r="2" fill="${K.ink}"/><circle cx="8" cy="-3" r="2" fill="${K.ink}"/><path d="M-14 -11l9 4M14 -11l-9 4" ${S}/><path d="M-9 11q9 -7 18 0" fill="none" ${S}/>`
  };
  const face = f => `<svg viewBox="-34 -34 68 68" role="img" aria-label="Un visage" style="max-width:150px"><circle r="28" fill="${f === "angry" ? "#FFB49A" : K.yellow}" stroke="${K.ink}" stroke-width="2.4"/>${FACE[f]}</svg>`;

  /* ---------- une vignette d'objet (vocabulaire) ---------- */
  const SKYT = new Set(["sun", "cloud", "birds", "plane"]);
  function thumb(t){
    const big = {mountain: .9, barn: 1.5, windmill: 1.3, watertower: 1.4, house: 1.6, tree: 1.4, field: 1};
    if (t === "field") return frame(id => sky(id) + `<path d="M0 60H160V120H0Z" fill="${K.grass}"/><path d="M0 64L160 62V120H0Z" fill="#E9C85B"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<path d="M${-30 + i * 26} 120L${40 + i * 10} 63" stroke="#C9A43A" stroke-width="3"/>`).join(""), {w: 160, h: 120, label: "Une image", style: "max-width:200px"});
    if (t === "grass") return frame(id => sky(id) + `<path d="M0 70H160V120H0Z" fill="${K.grass}"/>` + Array.from({length: 26}, (_, i) => `<path d="M${4 + i * 6} 120q${i % 2 ? 2 : -2} -20 ${i % 3 - 1} -${28 + (i * 7) % 18}" fill="none" stroke="${i % 2 ? K.leaf : K.leaf2}" stroke-width="3" stroke-linecap="round"/>`).join(""), {w: 160, h: 120, label: "Une image", style: "max-width:200px"});
    if (t === "path") return frame(id => country(id).replace('width="360" height="240"', 'width="360" height="240"') + `<path d="M120 240Q160 190 175 150Q182 132 186 126H194Q196 134 196 150Q205 195 250 240Z" fill="${K.sand}" stroke="${K.sand2}" stroke-width="2"/>`, {label: "Une image", style: "max-width:220px"});
    if (t === "hill") return frame(id => sky(id) + `<path d="M0 120Q50 40 110 70T160 80V120H0Z" fill="${K.hill}" stroke="${K.ink}" stroke-width="2"/>`, {w: 160, h: 120, label: "Une image", style: "max-width:200px"});
    if (t === "sea" || t === "lake" || t === "river" || t === "pool") return frame(id => water(id, t), {w: 160, h: 120, label: "Une image", style: "max-width:200px"});
    if (t === "inflatable") return frame(id => sky(id) + `<rect y="70" width="160" height="50" fill="${K.water}"/>` + inflatable(80, 98, .62), {w: 160, h: 120, label: "Une image", style: "max-width:200px"});
    if (t === "boat" || t === "lighthouse") return frame(id => sky(id) + `<rect y="${t === "boat" ? 74 : 96}" width="160" height="50" fill="${K.water}"/>` + (t === "lighthouse" ? `<path d="M40 104Q60 84 100 90L120 106H40Z" fill="${K.rock}" stroke="${K.ink}" stroke-width="1.6"/>` + icon(t, 80, 100, 1.45) : icon(t, 80, 96, 1.5)), {w: 160, h: 120, label: "Une image", style: "max-width:200px"});
    if (t === "kids") return frame(id => sky(id) + `<rect y="88" width="160" height="32" fill="${K.grass}"/>` + kid(40, 108, 1.4, {shirt: K.red, pose: "arms"}) + kid(80, 108, 1.5, {shirt: K.blue, hair: K.black}) + kid(120, 108, 1.4, {shirt: K.yellow, pose: "arms", hair: K.orange, skin: K.skin2}), {w: 160, h: 120, label: "Une image", style: "max-width:200px"});
    const s = big[t] || (SKYT.has(t) ? 1.6 : 1.6), y = SKYT.has(t) ? 58 : 106;
    return frame(id => sky(id) + (SKYT.has(t) ? "" : `<rect y="96" width="160" height="24" fill="${K.grass}"/>`) + icon(t, 80, t === "mountain" ? 112 : y, s), {w: 160, h: 120, label: "Une image", style: "max-width:200px"});
  }
  function water(id, t){
    if (t === "sea") return sky(id) + `<rect y="58" width="160" height="62" fill="${K.water}"/><path d="M0 58H160" stroke="#2F7FB8" stroke-width="2"/>` + [72, 88, 104].map((y, i) => `<path d="M${-10 + i * 8} ${y}q10 -6 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="${K.white}" stroke-width="2" opacity=".8"/>`).join("") + icon("boat", 112, 66, .7);
    if (t === "lake") return sky(id) + `<path d="M0 48Q40 36 80 46T160 44V120H0Z" fill="${K.hill}"/>` + [14, 34, 132, 150].map(x => icon("tree", x, 70, .5)).join("") + `<ellipse cx="80" cy="92" rx="76" ry="24" fill="${K.water}" stroke="#2F7FB8" stroke-width="2"/><path d="M50 90h20M90 98h24" stroke="${K.white}" stroke-width="2" stroke-linecap="round"/>`;
    if (t === "river") return sky(id) + `<rect y="50" width="160" height="70" fill="${K.grass}"/><path d="M70 50Q60 70 84 84T64 120H112Q118 96 98 82T82 50Z" fill="${K.water}" stroke="#2F7FB8" stroke-width="2"/>` + icon("tree", 30, 92, .7) + icon("tree", 136, 78, .55);
    return `<rect width="160" height="120" fill="#DDE7F2"/><rect x="18" y="40" width="124" height="66" rx="6" fill="${K.water2}" stroke="${K.ink}" stroke-width="2"/>` + [50, 70, 90].map(y => `<path d="M18 ${y}H142" stroke="${K.white}" stroke-width="1.6" stroke-dasharray="6 6"/>`).join("") + `<path d="M120 40V20M132 40V20M120 26H132M120 33H132" stroke="${K.gray}" stroke-width="2.4"/>`;
  }
  /* la structure gonflable (bleue et jaune) */
  function inflatable(x, y, s){
    return at(x, y, s, `<rect x="-70" y="-8" width="140" height="22" rx="11" fill="${K.blue}" ${S}/><path d="M-62 3H62" stroke="${K.white}" stroke-width="2" opacity=".6"/>
      <path d="M-34 -8V-40Q-34 -48 -26 -48H-2Q6 -48 6 -40V-8Z" fill="${K.yellow}" ${S}/><path d="M-34 -28H6" stroke="${K.ink}" stroke-width="1.4"/>
      <path d="M6 -40Q40 -38 58 -8H40Q30 -26 6 -26Z" fill="${K.red}" ${S}/>`);
  }

  /* ---------- les grandes scènes (rédaction, film) ---------- */
  /* une clôture en perspective : de (x0, y0) (près) à (x1, y1) (loin), n poteaux */
  function fenceLine(x0, y0, x1, y1, n){
    const P = Array.from({length: n}, (_, i) => { const t = 1 - Math.pow(1 - i / (n - 1), 1.35); return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 30 * (1 - .72 * t)]; });
    const rail = f => `<path d="M${P.map(([x, y, h]) => `${x} ${y - h * f}`).join("L")}" fill="none" stroke="${K.wood}" stroke-width="5" stroke-linecap="round"/><path d="M${P.map(([x, y, h]) => `${x} ${y - h * f}`).join("L")}" fill="none" stroke="${K.wood2}" stroke-width="1.2"/>`;
    return rail(.78) + rail(.42) + P.map(([x, y, h]) => `<rect x="${x - h * .1}" y="${y - h}" width="${h * .2}" height="${h}" rx="1" fill="${K.wood}" ${S1}/>`).join("");
  }
  /* La ferme (le dessin du cahier) */
  function farm(id){
    let s = country(id);
    s += icon("mountain", 300, 128, 1.3) + icon("mountain", 210, 128, .8);
    s += icon("cloud", 54, 36, 1.7) + icon("cloud", 140, 22, .9);
    s += `<path d="M118 132L250 129L262 158L104 162Z" fill="#E9C85B" stroke="#C9A43A" stroke-width="1.5"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${112 + i * 20} 161L${124 + i * 17.5} 131" stroke="#C9A43A" stroke-width="2"/>`).join("");
    s += icon("windmill", 180, 132, .75);
    s += `<path d="M140 240Q170 200 182 172Q188 160 190 158H200Q201 165 202 174Q212 205 238 240Z" fill="${K.sand}" stroke="${K.sand2}" stroke-width="2"/>`;
    s += icon("barn", 288, 178, 1.45) + icon("watertower", 342, 178, 1.05);
    s += fenceLine(6, 236, 112, 158, 9);
    s += icon("bush", 322, 236, 1.6) + icon("flowers", 260, 232, 1.1);
    return s;
  }
  /* Le lac : dix garçons sautent d'une structure gonflable */
  function lake(id){
    let s = sky(id) + icon("sun", 318, 38, 1.2) + icon("cloud", 60, 34, 1.4) + icon("cloud", 150, 20, .8);
    s += `<path d="M0 100Q60 80 120 92T240 88T360 96V120H0Z" fill="${K.leaf}"/>` + [20, 48, 80, 230, 262, 300, 334].map((x, i) => icon("tree", x, 108 + (i % 2) * 4, .5 + (i % 3) * .06)).join("");
    s += `<rect y="112" width="360" height="128" fill="${K.water}"/>` + [130, 150, 175, 205].map((y, i) => `<path d="M${(i * 37) % 60} ${y}h40M${120 + (i * 53) % 80} ${y + 6}h30M${250 + (i * 29) % 60} ${y - 4}h36" stroke="${K.water2}" stroke-width="2.4" stroke-linecap="round"/>`).join("");
    s += `<path d="M300 112Q330 104 360 108V140Q330 128 300 120Z" fill="${K.grass2}"/>` + icon("tree", 320, 128, .9) + icon("tree", 348, 132, 1);
    s += inflatable(150, 160, 1.15);
    const V = {vest: true, smile: true};
    s += kid(108, 104, .95, Object.assign({pose: "arms", hair: K.black}, V)) + kid(132, 104, .95, Object.assign({pose: "stand", skin: K.skin2}, V)) + kid(86, 151, .95, Object.assign({pose: "stand", hair: K.orange}, V));
    s += kid(196, 120, 1, Object.assign({pose: "jump", hair: K.yellow}, V)) + kid(228, 132, 1, Object.assign({pose: "jump", skin: K.skin2, hair: K.black}, V))
      + kid(60, 138, 1, Object.assign({pose: "jump", flip: true}, V)) + kid(250, 104, .95, Object.assign({pose: "jump", hair: K.orange}, V));
    s += kid(90, 214, 1.5, Object.assign({pose: "swim"}, V)) + kid(200, 222, 1.6, Object.assign({pose: "swim", hair: K.black, skin: K.skin2}, V)) + kid(290, 206, 1.4, Object.assign({pose: "swim", hair: K.yellow}, V));
    s += [[196, 175], [230, 186], [60, 186]].map(([x, y]) => `<path d="M${x - 12} ${y}q4 -10 6 -2q2 -12 6 0q4 -10 6 2" fill="${K.white}" stroke="${K.water2}" stroke-width="1.2"/>`).join("");
    return s;
  }
  /* La plage */
  function beach(id){
    let s = sky(id) + icon("sun", 318, 38, 1.2) + icon("birds", 180, 34, 1.2) + icon("cloud", 70, 30, 1.2);
    s += `<rect y="96" width="360" height="60" fill="${K.water}"/><path d="M0 96H360" stroke="#2F7FB8" stroke-width="2"/>`
      + [108, 124, 140].map((y, i) => `<path d="M${-10 + i * 9} ${y}${"q9 -5 18 0".repeat(22)}" fill="none" stroke="${K.white}" stroke-width="1.6" opacity=".8"/>`).join("");
    s += `<path d="M0 104Q20 92 44 100L56 112L0 118Z" fill="${K.rock}" stroke="${K.ink}" stroke-width="1.6"/>` + icon("lighthouse", 30, 104, 1.1);
    s += icon("boat", 186, 108, .75);
    s += `<path d="M0 150Q90 136 180 146T360 140V240H0Z" fill="${K.sand}"/><path d="M0 150Q90 136 180 146T360 140" fill="none" stroke="${K.white}" stroke-width="3"/>`;
    s += `<rect x="262" y="186" width="60" height="22" rx="3" fill="${K.pink}" stroke="${K.ink}" stroke-width="1.4" transform="rotate(-6 292 197)"/>` + icon("umbrella", 296, 190, 1.5);
    s += icon("sandcastle", 180, 222, 1.5) + kid(136, 226, 1.5, {pose: "build", shirt: K.red, hair: K.orange}) + kid(226, 226, 1.5, {pose: "build", shirt: K.yellow, hair: K.black, skin: K.skin2, flip: true});
    s += icon("bucket", 48, 228, 1.4);
    return s;
  }
  const big = (fn, label, extra = "") => frame(id => fn(id) + extra, {label, style: "max-width:560px"});

  return {K, icon, kid, frame, country, sky, randomScene, sceneSVG, place, grid, miniZone, miniPlan, planScene, PREP, prepScene, face, FACES: Object.keys(FACE),
    thumb, farm, lake, beach, big, inflatable, ROW, SIZE, CX, CY};
})();

/* ---------- notions ---------- */
const UNITS = [
  {id: "coins",       group: "1", name: "Les coins",                  sub: "in the top left corner, in the bottom right corner…"},
  {id: "cote",        group: "1", name: "Haut, bas, gauche, droite",  sub: "at the top, at the bottom, on the left, on the right, in the middle"},
  {id: "plans",       group: "1", name: "Premier plan, arrière-plan", sub: "in the foreground, in the background"},
  {id: "prep",        group: "1", name: "Les prépositions de lieu",   sub: "next to, behind, in front of, between, under, above, on"},
  {id: "campagne",    group: "2", name: "The countryside",            sub: "barn, windmill, fence, field, path, bush…"},
  {id: "eau",         group: "2", name: "Au bord de l'eau",           sub: "lake, river, swimming pool, lifejacket, swimsuit…"},
  {id: "camp",        group: "2", name: "Le camp, la randonnée",      sub: "tent, campfire, campsite, hikers, stream, to chat…"},
  {id: "sport",       group: "2", name: "Le sport",                   sub: "baseball, lacrosse : glove, bat, coach, to score…"},
  {id: "toolbox",     group: "3", name: "La Tool box",                sub: "Things, People, Actions, Places, Feelings"},
  {id: "phrases",     group: "3", name: "Présenter et décrire",       sub: "We can see…, There is / There are, be + -ing"},
  {id: "impressions", group: "3", name: "Les impressions",            sub: "look happy, seem excited, determined, out of breath…"}
].map(u => Object.assign(u, {tag: u.name}));
const UBY = Object.fromEntries(UNITS.map(u => [u.id, u]));

/* ---------- les 9 zones et les 2 plans ---------- */
const ZONES = [
  {z: 0, n: "coins", en: "in the top left corner",     fr: "en haut à gauche (dans le coin)", o: ["on the top left corner", "in the left top corner", "in the top left angle"]},
  {z: 1, n: "cote",  en: "at the top",                 fr: "en haut",                         o: ["in the top", "on the top", "at the up"]},
  {z: 2, n: "coins", en: "in the top right corner",    fr: "en haut à droite (dans le coin)", o: ["on the top right corner", "in the right top corner", "in the top right angle"]},
  {z: 3, n: "cote",  en: "on the left",                fr: "à gauche",                        o: ["in the left", "at the left", "on the left corner"]},
  {z: 4, n: "cote",  en: "in the middle",              fr: "au milieu",                       o: ["at the middle", "on the middle", "in the medium"]},
  {z: 5, n: "cote",  en: "on the right",               fr: "à droite",                        o: ["in the right", "at the right", "on the right corner"]},
  {z: 6, n: "coins", en: "in the bottom left corner",  fr: "en bas à gauche (dans le coin)",  o: ["on the bottom left corner", "in the left bottom corner", "in the bottom left angle"]},
  {z: 7, n: "cote",  en: "at the bottom",              fr: "en bas",                          o: ["in the bottom", "on the bottom", "at the down"]},
  {z: 8, n: "coins", en: "in the bottom right corner", fr: "en bas à droite (dans le coin)",  o: ["on the bottom right corner", "in the right bottom corner", "in the bottom right angle"]}
];
const PLANS = {
  fg: {n: "plans", en: "in the foreground", fr: "au premier plan (devant, ce qui est près)", o: ["on the foreground", "at the foreground", "in the first plan"]},
  bg: {n: "plans", en: "in the background", fr: "à l'arrière-plan (au fond, ce qui est loin)", o: ["on the background", "at the background", "in the last plan"]}
};
const ZONES_OF = {coins: [0, 2, 6, 8], cote: [1, 3, 4, 5, 7]};

/* ---------- le « par cœur » : ce que le cahier fait apprendre tel quel ----------
   Les expressions de lieu (page « Emplacement ») et les phrases de la description des garçons.
   gap = textes à trous [avant, réponse(s) séparées par |, après]. */
const SRC_LIEU = "Cahier · Emplacement", SRC_DESC = "Cahier · la photo des garçons";
const PAR_COEUR = [
  {id: "z0", n: "coins", z: 0, source: SRC_LIEU}, {id: "z1", n: "cote", z: 1, source: SRC_LIEU},
  {id: "bg", n: "plans", plan: "bg", source: SRC_LIEU}, {id: "z3", n: "cote", z: 3, source: SRC_LIEU},
  {id: "z5", n: "cote", z: 5, source: SRC_LIEU}, {id: "z4", n: "cote", z: 4, source: SRC_LIEU},
  {id: "z7", n: "cote", z: 7, source: SRC_LIEU}, {id: "fg", n: "plans", plan: "fg", source: SRC_LIEU},
  {id: "z8", n: "coins", z: 8, source: SRC_LIEU},
  {id: "cs", n: "campagne", text: "the countryside", fr: "la campagne", source: "Cahier · campagne = countryside",
   o: ["the campaign", "the campagne", "the country size"], tip: "Faux ami : a campaign, c'est une campagne électorale ou publicitaire. La campagne (les champs), c'est the countryside.",
   gap: [["the ", "countryside", " (la campagne)"]]},
  {id: "p1", n: "phrases", text: "We can see ten boys jumping in the water.", fr: "On voit dix garçons qui sautent dans l'eau.", source: SRC_DESC,
   o: ["We can see ten boys are jumping in the water.", "We can see ten boys jumps in the water.", "We can to see ten boys jumping in the water."],
   gap: [["We can see ten boys ", "jumping", " in the water."], ["We ", "can see", " ten boys jumping in the water."]],
   tip: "On peut changer les mots : boys, kids, children, teenagers, young people… in the water, the sea, a lake, the river, the pool…"},
  {id: "p2", n: "phrases", text: "They're wearing lifejackets and swimsuits.", fr: "Ils portent des gilets de sauvetage et des maillots de bain.", source: SRC_DESC,
   o: ["They're carrying lifejackets and swimsuits.", "They're wear lifejackets and swimsuits.", "Their wearing lifejackets and swimsuits."],
   gap: [["They're ", "wearing", " lifejackets and swimsuits."], ["They're wearing ", "lifejackets|life jackets", " and swimsuits."], ["They're wearing lifejackets and ", "swimsuits|swimming costumes", "."]],
   tip: "Porter un vêtement = wear. They're = They are."},
  {id: "p3", n: "impressions", text: "The boys look happy.", fr: "Les garçons ont l'air heureux.", source: SRC_DESC,
   o: ["The boys look like happy.", "The boys looks happy.", "The boys are look happy."],
   gap: [["The boys ", "look|seem", " happy."]], tip: "look + adjectif, sans like : They look happy."},
  {id: "p4", n: "impressions", text: "The boys seem excited.", fr: "Les garçons semblent tout excités.", source: SRC_DESC,
   o: ["The boys seem exciting.", "The boys seems excited.", "The boys seem to excited."],
   gap: [["The boys seem ", "excited", "."], ["The boys ", "seem|look", " excited."]], tip: "excited = tout excité (la personne). exciting = excitant (la chose)."},
  {id: "p5", n: "impressions", text: "The boys are having fun.", fr: "Les garçons s'amusent.", source: SRC_DESC,
   o: ["The boys are having funny.", "The boys are have fun.", "The boys is having fun."],
   gap: [["The boys are ", "having", " fun."]], tip: "have fun = s'amuser, ici au présent be + -ing : are having fun."},
  {id: "p6", n: "impressions", text: "The boys are smiling.", fr: "Les garçons sourient.", source: SRC_DESC,
   o: ["The boys are smileing.", "The boys is smiling.", "The boys are smile."],
   gap: [["The boys are ", "smiling", "."]], tip: "smile → smiling : le e tombe devant -ing."},
  {id: "p7", n: "impressions", text: "They have a wide smile on their faces.", fr: "Ils ont un grand sourire sur le visage.", source: SRC_DESC,
   o: ["They have a wide smile on them faces.", "They have a wide smile on there faces.", "They have a wide smile on they faces."],
   gap: [["They have a wide smile on ", "their", " faces."], ["They have a ", "wide", " smile on their faces."]],
   tip: "their = leur(s). them, c'est « eux » : on ne le met jamais devant un nom."},
  {id: "p8", n: "impressions", text: "They seem to be having fun.", fr: "Ils ont l'air de bien s'amuser.", source: SRC_DESC,
   o: ["They seem be having fun.", "They seem to having fun.", "They seems to be having fun."],
   gap: [["They seem ", "to be", " having fun."], ["They seem to be ", "having fun", "."]], tip: "seem to be + V-ing : ils ont l'air d'être en train de…"},
  {id: "tb", n: "toolbox", text: "Things, People, Actions, Places, Feelings.", q: "Quelles sont les 5 colonnes de la Tool box pour décrire une image ?",
   fr: "Les 5 colonnes de la Tool box : les choses, les personnes, les actions, les lieux, les sentiments.", source: "Fiche Tool box",
   o: ["Things, Persons, Actions, Places, Feelings.", "Things, People, Actions, Colours, Feelings.", "Objects, People, Actions, Places, Moods."],
   gap: [["Things, ", "People", ", Actions, Places, Feelings."], ["Things, People, ", "Actions", ", Places, Feelings."], ["Things, People, Actions, ", "Places", ", Feelings."],
     ["Things, People, Actions, Places, ", "Feelings", "."], ["", "Things", ", People, Actions, Places, Feelings."]],
   tip: "Avant de décrire, on remplit les 5 colonnes : ce qu'on voit, qui, ce qu'ils font, où, ce qu'ils ressentent."}
].map(p => {
  const L = p.z !== undefined ? ZONES[p.z] : p.plan ? PLANS[p.plan] : null;
  return L ? Object.assign(p, {text: L.en, fr: L.fr, o: L.o, loc: true}) : p;
});
const PC = Object.fromEntries(PAR_COEUR.map(p => [p.id, p]));

/* ---------- vocabulaire : en (avec article), fr, ok (réponses acceptées), ic (dessin), cahier, card ---------- */
const VOC = [
  {n: "campagne", en: "a fence", fr: "une clôture, une barrière", ok: ["fence"], ic: "fence", cahier: 1},
  {n: "campagne", en: "a windmill", fr: "un moulin à vent", ok: ["windmill"], ic: "windmill", cahier: 1},
  {n: "campagne", en: "a mountain", fr: "une montagne", ok: ["mountain"], ic: "mountain", cahier: 1, not: ["a hill"]},
  {n: "campagne", en: "a barn", fr: "une grange", ok: ["barn"], ic: "barn", cahier: 1, not: ["a house"]},
  {n: "campagne", en: "a water tower", fr: "un château d'eau", ok: ["water tower"], ic: "watertower", cahier: 1},
  {n: "campagne", en: "a field", fr: "un champ", ok: ["field"], ic: "field", cahier: 1, not: ["grass", "a path"]},
  {n: "campagne", en: "grass", fr: "l'herbe", ok: ["grass"], ic: "grass", cahier: 1, not: ["a field", "a bush"]},
  {n: "campagne", en: "a path", fr: "un chemin (de terre)", ok: ["path", "dirt track", "track", "footpath", "trail"], ic: "path", cahier: 1,
   not: ["grass", "a field", "a hill"], tip: "On dit aussi a dirt track : un chemin de terre (pas « dust track » : dust, c'est la poussière)."},
  {n: "campagne", en: "a bush", fr: "un buisson", ok: ["bush"], ic: "bush", cahier: 1, not: ["a tree"]},
  {n: "campagne", en: "a sheep", fr: "un mouton", ok: ["sheep"], ic: "sheep", card: 1, tip: "Pas de s au pluriel : one sheep, two sheep."},
  {n: "campagne", en: "a tree", fr: "un arbre", ok: ["tree"], ic: "tree", not: ["a bush"]},
  {n: "campagne", en: "a cow", fr: "une vache", ok: ["cow"], ic: "cow"},
  {n: "campagne", en: "a hill", fr: "une colline", ok: ["hill"], ic: "hill", not: ["a mountain", "grass"]},
  {n: "campagne", en: "a horse", fr: "un cheval", ok: ["horse"], ic: "horse"},
  {n: "campagne", en: "a tractor", fr: "un tracteur", ok: ["tractor"], ic: "tractor"},
  {n: "campagne", en: "a house", fr: "une maison", ok: ["house"], ic: "house", not: ["a barn"]},
  {n: "campagne", en: "a cloud", fr: "un nuage", ok: ["cloud"], ic: "cloud"},
  {n: "campagne", en: "the sun", fr: "le soleil", ok: ["sun"], ic: "sun"},
  {n: "campagne", en: "birds", fr: "des oiseaux", ok: ["bird", "birds"], ic: "birds"},
  {n: "campagne", en: "flowers", fr: "des fleurs", ok: ["flower", "flowers"], ic: "flowers"},
  {n: "eau", en: "kids", fr: "des enfants (familier)", ok: ["kids", "children", "kid", "child"], ic: "kids", cahier: 1, not: ["children", "teenagers", "young people"]},
  {n: "eau", en: "children", fr: "des enfants", ok: ["children", "kids"], cahier: 1, not: ["kids", "teenagers", "young people"], tip: "Un seul enfant : a child. Plusieurs : children (sans s)."},
  {n: "eau", en: "teenagers", fr: "des adolescents", ok: ["teenagers", "teens", "teenager"], cahier: 1, not: ["kids", "children", "young people"]},
  {n: "eau", en: "young people", fr: "des jeunes", ok: ["young people"], cahier: 1, not: ["kids", "children", "teenagers"]},
  {n: "eau", en: "the sea", fr: "la mer", ok: ["sea"], ic: "sea", cahier: 1, not: ["a boat", "a lake"]},
  {n: "eau", en: "a lake", fr: "un lac", ok: ["lake"], ic: "lake", cahier: 1, not: ["the sea", "a river"]},
  {n: "eau", en: "a river", fr: "une rivière", ok: ["river"], ic: "river", cahier: 1, not: ["a lake"]},
  {n: "eau", en: "a swimming pool", fr: "une piscine", ok: ["swimming pool", "pool", "swimmingpool"], ic: "pool", cahier: 1},
  {n: "eau", en: "an inflatable structure", fr: "une structure gonflable", ok: ["inflatable structure", "inflatable"], ic: "inflatable", cahier: 1,
   not: ["the sea", "a lake", "a river", "a swimming pool", "a boat"]},
  {n: "eau", en: "a lifejacket", fr: "un gilet de sauvetage", ok: ["lifejacket", "life jacket"], ic: "lifejacket", cahier: 1},
  {n: "eau", en: "a swimsuit", fr: "un maillot de bain", ok: ["swimsuit", "swimming costume", "bathing suit", "swimming trunks", "trunks", "swimwear"], ic: "swimsuit", cahier: 1},
  {n: "eau", en: "a boat", fr: "un bateau", ok: ["boat", "sailing boat", "sailboat"], ic: "boat"},
  {n: "eau", en: "a lighthouse", fr: "un phare", ok: ["lighthouse"], ic: "lighthouse"},
  {n: "eau", en: "a sandcastle", fr: "un château de sable", ok: ["sandcastle", "sand castle"], ic: "sandcastle"},
  {n: "eau", en: "a beach umbrella", fr: "un parasol", ok: ["beach umbrella", "umbrella", "parasol", "sunshade"], ic: "umbrella"},
  {n: "eau", en: "a beach", fr: "une plage", ok: ["beach"]},
  /* Tool box du cahier : le camp, la randonnée, le team building (src = le tableau d'où vient le mot) */
  {n: "camp", src: "le camp", en: "a forest", fr: "une forêt, les bois", ok: ["forest", "woods", "wood"], tip: "On dit aussi the woods : les bois."},
  {n: "camp", src: "le camp", en: "a barbecue", fr: "un barbecue", ok: ["barbecue", "barbeque", "bbq"]},
  {n: "camp", src: "le camp", en: "a tent", fr: "une tente", ok: ["tent"]},
  {n: "camp", src: "le camp", en: "a camp", fr: "un camp (de vacances)", ok: ["camp", "summer camp"], not: ["a campsite", "a campfire"]},
  {n: "camp", src: "le camp", en: "a hut", fr: "une cabane", ok: ["hut", "cabin"], not: ["a tent"]},
  {n: "camp", src: "le camp", en: "marshmallows", fr: "des chamallows (des guimauves)", ok: ["marshmallow", "marshmallows"]},
  {n: "camp", src: "le camp", en: "a backpack", fr: "un sac à dos", ok: ["backpack", "rucksack", "back pack"], tip: "On dit aussi a rucksack."},
  {n: "camp", src: "le camp", en: "a campfire", fr: "un feu de camp", ok: ["campfire", "camp fire"], not: ["a barbecue", "a camp"]},
  {n: "camp", src: "le camp", en: "a campsite", fr: "un terrain de camping", ok: ["campsite", "camp site", "campground", "camping site"], not: ["a camp"],
   tip: "Faux ami : le camping (le lieu) = a campsite. Camping, c'est l'activité : to go camping."},
  {n: "camp", src: "le camp", en: "a meadow", fr: "un pré, une prairie", ok: ["meadow"]},
  {n: "camp", src: "le camp", en: "adults", fr: "des adultes", ok: ["adult", "adults", "grown ups"], not: ["instructors", "supervisors"]},
  {n: "camp", src: "le camp", en: "instructors", fr: "des moniteurs", ok: ["instructor", "instructors"], not: ["supervisors", "adults"]},
  {n: "camp", src: "le camp", en: "supervisors", fr: "des animateurs, des surveillants", ok: ["supervisor", "supervisors"], not: ["instructors", "adults"]},
  {n: "camp", src: "le camp", en: "to grill", fr: "faire griller", ok: ["grill", "grilling"], not: ["to cook"]},
  {n: "camp", src: "le camp", en: "to cook", fr: "faire la cuisine, cuisiner", ok: ["cook", "cooking"], not: ["to grill"]},
  {n: "camp", src: "le camp", en: "to have a barbecue", fr: "faire un barbecue", ok: ["have a barbecue", "have a bbq", "having a barbecue"]},
  {n: "camp", src: "le camp", en: "to chat", fr: "bavarder, discuter", ok: ["chat", "chatting", "talk", "talking", "have a chat"], tip: "On dit aussi to talk ou to have a chat."},
  {n: "camp", src: "le camp", en: "to laugh", fr: "rire", ok: ["laugh", "laughing"], tip: "Sans t à la fin : to laugh. Au passé : laughed."},
  {n: "camp", src: "le camp", en: "to sit", fr: "s'asseoir, être assis", ok: ["sit", "sitting", "sit down"], tip: "sit → sitting : on double le t."},
  {n: "camp", src: "la randonnée", en: "rocks", fr: "des rochers", ok: ["rock", "rocks"]},
  {n: "camp", src: "la randonnée", en: "tree trunks", fr: "des troncs d'arbre", ok: ["tree trunk", "tree trunks", "trunks", "trunk"], not: ["roots"]},
  {n: "camp", src: "la randonnée", en: "a stream", fr: "un ruisseau", ok: ["stream", "brook", "creek"]},
  {n: "camp", src: "la randonnée", en: "roots", fr: "des racines", ok: ["root", "roots"], not: ["tree trunks"]},
  {n: "camp", src: "la randonnée", en: "the dirt", fr: "la terre (par terre, sur le chemin)", ok: ["dirt", "mud", "earth", "ground"]},
  {n: "camp", src: "la randonnée", en: "trekking shoes", fr: "des chaussures de randonnée", ok: ["trekking shoes", "hiking shoes", "hiking boots", "walking shoes", "walking boots"]},
  {n: "camp", src: "la randonnée", en: "hikers", fr: "des randonneurs", ok: ["hikers", "hiker", "walkers", "trekkers"], not: ["adventurers"], tip: "On dit aussi walkers ou trekkers."},
  {n: "camp", src: "la randonnée", en: "adventurers", fr: "des aventuriers", ok: ["adventurer", "adventurers", "explorers"], not: ["hikers"]},
  {n: "camp", src: "la randonnée", en: "to hike", fr: "faire de la randonnée", ok: ["hike", "hiking", "go hiking", "trek", "trekking"], not: ["to walk"]},
  {n: "camp", src: "la randonnée", en: "to walk up the hill", fr: "monter la colline (à pied)", ok: ["walk up the hill", "go up the hill", "climb the hill", "walking up the hill"]},
  {n: "camp", src: "la randonnée", en: "to walk along the stream", fr: "marcher le long du ruisseau", ok: ["walk along the stream", "walking along the stream", "walk along the river"]},
  {n: "camp", src: "la randonnée", en: "to jump over", fr: "sauter par-dessus", ok: ["jump over", "jumping over"]},
  {n: "camp", src: "la randonnée", en: "to avoid the water", fr: "éviter l'eau", ok: ["avoid the water", "avoid water", "avoiding the water", "avoiding water"]},
  {n: "camp", src: "le team building", en: "a team building activity", fr: "une activité pour souder l'équipe", ok: ["team building activity", "team building"]},
  {n: "camp", src: "le team building", en: "a structure", fr: "une structure (en bois)", ok: ["structure", "frame", "wooden structure"]},
  {n: "camp", src: "le team building", en: "to carry someone on your shoulders", fr: "porter quelqu'un sur ses épaules",
   ok: ["carry someone on your shoulders", "carry someone on their shoulders", "carry people on their shoulders", "carry somebody on your shoulders", "carry someone on his shoulders"],
   tip: "Porter quelqu'un ou quelque chose = to carry. Porter un vêtement = to wear."},
  {n: "camp", src: "le team building", en: "to squat", fr: "s'accroupir", ok: ["squat", "squatting", "crouch", "crouch down", "squat down"]},
  /* Tool box du cahier : le baseball et le lacrosse */
  {n: "sport", src: "le baseball", en: "a leather glove", fr: "un gant en cuir", ok: ["leather glove", "glove", "baseball glove", "mitt"], not: ["gloves"], tip: "leather = le cuir."},
  {n: "sport", src: "le baseball", en: "a cap", fr: "une casquette", ok: ["cap", "baseball cap"], not: ["a helmet"]},
  {n: "sport", src: "le baseball", en: "a bat", fr: "une batte", ok: ["bat", "baseball bat"], not: ["a lacrosse stick"]},
  {n: "sport", src: "le baseball", en: "a coach", fr: "un entraîneur", ok: ["coach", "trainer"]},
  {n: "sport", src: "le baseball", en: "a team", fr: "une équipe", ok: ["team", "baseball team"]},
  {n: "sport", src: "le baseball", en: "a player", fr: "un joueur, une joueuse", ok: ["player", "players"], not: ["a batter", "a catcher", "a pitcher", "a goalkeeper"]},
  {n: "sport", src: "le baseball", en: "a batter", fr: "le batteur (celui qui tape la balle)", ok: ["batter", "hitter"], not: ["a player"]},
  {n: "sport", src: "le baseball", en: "a catcher", fr: "le receveur (celui qui attrape la balle)", ok: ["catcher"], not: ["a player"]},
  {n: "sport", src: "le baseball", en: "a pitcher", fr: "le lanceur", ok: ["pitcher", "thrower"], not: ["a player"],
   tip: "Le cahier dit thrower : on comprend, mais au baseball le lanceur s'appelle the pitcher."},
  {n: "sport", src: "le baseball", en: "a referee", fr: "un arbitre", ok: ["referee", "umpire", "ref"], tip: "Au baseball, l'arbitre s'appelle an umpire."},
  {n: "sport", src: "le baseball", en: "a baseball field", fr: "un terrain de baseball", ok: ["baseball field", "baseball pitch", "field", "pitch", "baseball diamond"]},
  {n: "sport", src: "le baseball", en: "a playground", fr: "une aire de jeux, une cour de récréation", ok: ["playground"]},
  {n: "sport", src: "le baseball", en: "a park", fr: "un parc", ok: ["park"]},
  {n: "sport", src: "le baseball", en: "to throw", fr: "lancer", ok: ["throw", "throwing", "pitch", "pitching"]},
  {n: "sport", src: "le baseball", en: "to catch", fr: "attraper (la balle)", ok: ["catch", "catching"], not: ["to grab", "to hold"]},
  {n: "sport", src: "le baseball", en: "to run", fr: "courir", ok: ["run", "running"], tip: "run → running : on double le n."},
  {n: "sport", src: "le baseball", en: "to train", fr: "s'entraîner", ok: ["train", "training", "practise", "practice", "practising", "practicing"]},
  {n: "sport", src: "le baseball", en: "a practice", fr: "un entraînement", ok: ["practice", "training", "training session", "practice session"], not: ["a game"]},
  {n: "sport", src: "le lacrosse", en: "a game", fr: "un match", ok: ["game", "match"], not: ["a practice"], tip: "On dit aussi a match."},
  {n: "sport", src: "le lacrosse", en: "a helmet", fr: "un casque", ok: ["helmet"], not: ["a cap"]},
  {n: "sport", src: "le lacrosse", en: "equipment", fr: "l'équipement, le matériel", ok: ["equipment", "gear", "kit"],
   tip: "Pas de s : equipment (et gear) ne se mettent jamais au pluriel."},
  {n: "sport", src: "le lacrosse", en: "a lacrosse stick", fr: "une crosse de lacrosse", ok: ["lacrosse stick", "stick"], not: ["a bat"]},
  {n: "sport", src: "le lacrosse", en: "a goal", fr: "un but (la cage)", ok: ["goal", "goal cage", "cage", "net"]},
  {n: "sport", src: "le lacrosse", en: "a post", fr: "un poteau", ok: ["post", "goalpost", "goal post"]},
  {n: "sport", src: "le lacrosse", en: "gloves", fr: "des gants", ok: ["gloves", "glove"], not: ["a leather glove"]},
  {n: "sport", src: "le lacrosse", en: "a goalkeeper", fr: "un gardien de but", ok: ["goalkeeper", "goalie", "keeper", "goal keeper"], not: ["a player"]},
  {n: "sport", src: "le lacrosse", en: "to hold", fr: "tenir", ok: ["hold", "holding"], not: ["to catch", "to grab"]},
  {n: "sport", src: "le lacrosse", en: "to grab", fr: "saisir, attraper d'un coup", ok: ["grab", "grabbing", "seize"], not: ["to catch", "to hold"]},
  {n: "sport", src: "le lacrosse", en: "to score", fr: "marquer (un but, un point)", ok: ["score", "scoring", "score a goal"]},
  /* Feelings des tableaux du cahier */
  {n: "impressions", src: "le camp", en: "joyful", fr: "joyeux", ok: ["joyful", "joyous", "cheerful"], not: ["enthusiastic"]},
  {n: "impressions", src: "le camp", en: "enthusiastic", fr: "enthousiaste", ok: ["enthusiastic"], not: ["joyful", "eager to win"]},
  {n: "impressions", src: "le lacrosse", en: "determined", fr: "déterminé", ok: ["determined"], not: ["competitive", "focused", "eager to win", "courageous"]},
  {n: "impressions", src: "le lacrosse", en: "competitive", fr: "qui a l'esprit de compétition", ok: ["competitive"], not: ["determined", "eager to win"]},
  {n: "impressions", src: "le lacrosse", en: "out of breath", fr: "essoufflé", ok: ["out of breath", "breathless"], not: ["exhausted", "sweating"]},
  {n: "impressions", src: "le lacrosse", en: "eager to win", fr: "impatient de gagner, qui veut gagner", ok: ["eager to win", "wants to win", "want to win", "eager"],
   not: ["determined", "competitive", "enthusiastic"]},
  {n: "impressions", src: "le lacrosse", en: "sweating", fr: "en sueur (il transpire)", ok: ["sweating", "sweaty"], not: ["out of breath", "exhausted"]},
  {n: "impressions", src: "la randonnée", en: "exhausted", fr: "épuisé", ok: ["exhausted", "worn out"], not: ["out of breath", "sweating"], tip: "Plus fort que tired (fatigué)."},
  {n: "impressions", src: "la randonnée", en: "courageous", fr: "courageux", ok: ["courageous", "brave"], not: ["adventurous", "determined"]},
  {n: "impressions", src: "la randonnée", en: "adventurous", fr: "aventureux, qui aime l'aventure", ok: ["adventurous"], not: ["courageous"]},
  {n: "impressions", src: "le baseball", en: "stressed", fr: "stressé", ok: ["stressed", "stressed out"], not: ["nervous"]},
  {n: "impressions", src: "le baseball", en: "focused", fr: "concentré", ok: ["focused", "focussed", "concentrated"], not: ["determined"]},
  {n: "impressions", src: "le baseball", en: "nervous", fr: "nerveux, anxieux", ok: ["nervous", "anxious"], not: ["stressed"], tip: "On dit aussi anxious."}
].map((v, i) => Object.assign(v, {id: "v" + i}));

/* ---------- prépositions ---------- */
const PREPS = [
  {en: "next to",     fr: "à côté de",   ok: ["next to", "beside", "by"]},
  {en: "behind",      fr: "derrière",    ok: ["behind"]},
  {en: "in front of", fr: "devant",      ok: ["in front of"]},
  {en: "between",     fr: "entre",       ok: ["between"]},
  {en: "under",       fr: "sous",        ok: ["under", "underneath", "below", "beneath"]},
  {en: "above",       fr: "au-dessus de", ok: ["above", "over"]},
  {en: "on",          fr: "sur",         ok: ["on", "on top of"]}
];
const PREP_BY = Object.fromEntries(PREPS.map(p => [p.en, p]));
const PREP_NOT = {"next to": ["between", "in front of"], "between": ["next to"], "in front of": ["next to"], "above": ["on"], "on": ["above"]};

/* ---------- émotions (dessins de visages) ---------- */
const FEEL = {
  happy:     {fr: "heureux, content",          ok: ["happy", "glad", "cheerful", "pleased"]},
  sad:       {fr: "triste",                    ok: ["sad", "unhappy", "upset"]},
  scared:    {fr: "effrayé, qui a peur",       ok: ["scared", "afraid", "frightened", "terrified"]},
  tired:     {fr: "fatigué",                   ok: ["tired", "sleepy", "exhausted"]},
  surprised: {fr: "surpris",                   ok: ["surprised", "amazed", "astonished", "shocked"]},
  angry:     {fr: "en colère",                 ok: ["angry", "cross", "furious", "mad"]}
};

/* ---------- objets des scènes : leur nom ---------- */
const NAME = {barn: "barn", windmill: "windmill", watertower: "water tower", house: "house", tree: "tree", cow: "cow", sheep: "sheep", horse: "horse",
  bush: "bush", tractor: "tractor", flowers: "flowers", dog: "dog", fence: "fence", sun: "sun", cloud: "cloud", birds: "birds", plane: "plane"};
const PLURAL = new Set(["flowers", "birds"]);
const aName = t => t === "sun" ? "the sun" : PLURAL.has(t) ? NAME[t] : /^[aeiou]/.test(NAME[t]) ? "an " + NAME[t] : "a " + NAME[t];
const whereIs = t => `Where ${PLURAL.has(t) ? "are" : "is"} the <b>${esc(NAME[t])}</b>?`;
const sentence = (t, en) => `The ${NAME[t]} ${PLURAL.has(t) ? "are" : "is"} ${en}.`;

/* ---------- présent en be + -ing ---------- */
const CONT = [
  ["The boys", "jump", "are", "jumping", "in the water.", ["are jumpping", "is jumping", "are jump"]],
  ["The girl", "swim", "is", "swimming", "in the lake.", ["is swiming", "are swimming", "is swim"], "swim → swimming : on double le m."],
  ["The children", "smile", "are", "smiling", "", ["are smileing", "is smiling", "are smile"], "smile → smiling : le e tombe."],
  ["The farmer", "drive", "is", "driving", "a tractor.", ["is driveing", "are driving", "is drive"], "drive → driving : le e tombe."],
  ["The dog", "run", "is", "running", "in the field.", ["is runing", "are running", "is run"], "run → running : on double le n."],
  ["The cows", "eat", "are", "eating", "grass.", ["is eating", "are eat", "are eatting"]],
  ["A boy", "sit", "is", "sitting", "on the fence.", ["is siting", "are sitting", "is sit"], "sit → sitting : on double le t."],
  ["They", "wear", "are", "wearing", "lifejackets.", ["is wearing", "are wear", "are wearring"]],
  ["The kids", "play", "are", "playing", "on the beach.", ["are plaing", "is playing", "are play"]],
  ["The sun", "shine", "is", "shining", "", ["is shineing", "are shining", "is shine"], "shine → shining : le e tombe."],
  ["Two girls", "build", "are", "building", "a sandcastle.", ["is building", "are build", "are buildding"]]
];
const THERE = [
  ["a windmill in the middle.", "is"], ["two cows in the field.", "are"], ["some clouds in the sky.", "are"], ["a bush in the bottom right corner.", "is"],
  ["ten boys in the water.", "are"], ["a fence on the left.", "is"], ["mountains in the background.", "are"], ["a red barn on the right.", "is"],
  ["a lighthouse on the left.", "is"], ["three sheep in the foreground.", "are"]
];
const LOOK = [
  {q: "The boys look ___.", a: "happy", o: ["happily", "like happy", "happiness"], w: "look + adjectif : They look happy."},
  {q: "They seem ___ having fun.", a: "to be", o: ["be", "to", "are"], w: "seem to be + V-ing : They seem to be having fun."},
  {q: "They have a wide smile on ___ faces.", a: "their", o: ["them", "they", "there"], w: "their = leur(s) : on their faces."},
  {q: "It looks ___ a farm.", a: "like", o: ["as", "at", "to"], w: "look like + nom : It looks like a farm (ça ressemble à une ferme)."},
  {q: "The girl ___ tired.", a: "looks", o: ["look like", "is look", "looking"], w: "The girl looks tired : look + adjectif, avec un s (she)."},
  {q: "The boys seem ___.", a: "excited", o: ["exciting", "excite", "to excited"], w: "excited = tout excité (la personne)."},
  {q: "They ___ fun.", a: "are having", o: ["are have", "having", "is having"], w: "be + V-ing : They are having fun."}
];
/* questions sur l'image du lac (la photo du cahier, redessinée) */
const LAKE_Q = [
  {n: "eau", q: "What are the boys wearing?", a: "They're wearing lifejackets and swimsuits.", o: ["They're wearing coats and boots.", "They're wearing T-shirts and jeans.", "They're wearing helmets and gloves."]},
  {n: "phrases", q: "What are the boys doing?", a: "They are jumping in the water.", o: ["They are playing football.", "They are building a sandcastle.", "They are riding horses."]},
  {n: "impressions", q: "How do the boys look?", a: "They look happy: they're having fun.", o: ["They look sad: they're crying.", "They look tired: they're sleeping.", "They look angry: they're shouting."]},
  {n: "eau", q: "Where are the boys?", a: "They're in a lake.", o: ["They're in a classroom.", "They're in the mountains.", "They're in a barn."]}
];

/* ---------- la Tool box : dans quelle colonne ? (mots des tableaux du cahier, sans les mots rangés dans deux colonnes) ---------- */
const TB_COLS = {
  Things: "les choses qu'on voit (What can you see?)", People: "les personnes (Who?)", Actions: "ce qu'ils font (What are they doing?)",
  Places: "le lieu (Where?)", Feelings: "ce qu'ils ressentent (How do they feel?)"
};
const TBI = [
  ["a tent", "Things", "camp"], ["marshmallows", "Things", "camp"], ["a backpack", "Things", "camp"], ["a campfire", "Things", "camp"], ["a barbecue", "Things", "camp"],
  ["rocks", "Things", "camp"], ["roots", "Things", "camp"], ["trekking shoes", "Things", "camp"], ["a bat", "Things", "sport"], ["a cap", "Things", "sport"],
  ["a leather glove", "Things", "sport"], ["a helmet", "Things", "sport"], ["a lacrosse stick", "Things", "sport"],
  ["instructors", "People", "camp"], ["supervisors", "People", "camp"], ["adults", "People", "camp"], ["teenagers", "People", "camp"], ["hikers", "People", "camp"],
  ["adventurers", "People", "camp"], ["a goalkeeper", "People", "sport"], ["a coach", "People", "sport"], ["a batter", "People", "sport"], ["a catcher", "People", "sport"],
  ["to grill", "Actions", "camp"], ["to chat", "Actions", "camp"], ["to laugh", "Actions", "camp"], ["to jump over", "Actions", "camp"], ["to hike", "Actions", "camp"],
  ["to squat", "Actions", "camp"], ["to throw", "Actions", "sport"], ["to catch", "Actions", "sport"], ["to score", "Actions", "sport"], ["to run", "Actions", "sport"],
  ["a campsite", "Places", "camp"], ["a meadow", "Places", "camp"], ["a baseball field", "Places", "sport"], ["a park", "Places", "sport"], ["a playground", "Places", "sport"],
  ["joyful", "Feelings", "impressions"], ["enthusiastic", "Feelings", "impressions"], ["determined", "Feelings", "impressions"], ["competitive", "Feelings", "impressions"],
  ["out of breath", "Feelings", "impressions"], ["exhausted", "Feelings", "impressions"], ["courageous", "Feelings", "impressions"], ["nervous", "Feelings", "impressions"],
  ["focused", "Feelings", "impressions"], ["stressed", "Feelings", "impressions"]
];

/* ---------- la description de la ferme écrite par Léandre : corrige l'erreur ---------- */
const FIX = [
  {n: "phrases", bad: "On this landscape, they are a barn in the background.", a: "In this picture, there is a barn in the background.",
   o: ["In this picture, they are a barn in the background.", "In this picture, there are a barn in the background.", "In this picture, their is a barn in the background."],
   w: "Il y a = there is (un seul) ou there are (plusieurs). They are, c'est « ils sont »."},
  {n: "cote", bad: "In the top, there is a cloud.", a: "At the top, there is a cloud.",
   o: ["In the top, there is a cloud.", "On the top, there is a cloud.", "To the top, there is a cloud."], w: "AT the top, AT the bottom."},
  {n: "cote", bad: "On the middle, there is a windmill.", a: "In the middle, there is a windmill.",
   o: ["On the middle, there is a windmill.", "At the middle, there is a windmill.", "Of the middle, there is a windmill."], w: "IN the middle."},
  {n: "coins", bad: "On the right corner, there is a bush.", a: "In the bottom right corner, there is a bush.",
   o: ["On the bottom right corner, there is a bush.", "In the right bottom corner, there is a bush.", "In the corner right, there is a bush."],
   w: "IN the … corner, et on dit quel coin : in the bottom right corner (en bas à droite)."},
  {n: "campagne", bad: "There is a path dusttrack at the bottom to lead in the barn.", a: "There is a dirt track at the bottom, leading to the barn.",
   o: ["There is a dust track at the bottom, leading to the barn.", "There is a dirt track at the bottom, to lead in the barn.", "There is a dirt track at the bottom, leading in the barn."],
   w: "a dirt track = un chemin de terre (dust, c'est la poussière). leading to the barn = qui mène à la grange."},
  {n: "plans", bad: "On the third plan, there are fields.", a: "In the background, there are fields.",
   o: ["On the third plan, there are fields.", "In the third plan, there are fields.", "On the background, there are fields."],
   w: "« plan » ne se traduit pas mot à mot : in the foreground (devant), in the background (au fond)."}
];

/* ---------- vrai ou faux ---------- */
const VF = [
  ["La Tool box a 5 colonnes : Things, People, Actions, Places, Feelings.", true, "toolbox", "Oui : on les remplit avant d'écrire la description."],
  ["Dans la colonne Feelings, on écrit ce que font les personnes.", false, "toolbox", "Non : ce qu'ils font, c'est Actions. Feelings = ce qu'ils ressentent (happy, nervous, determined…)."],
  ["Dans la colonne Places, on écrit où se passe la scène.", true, "toolbox", "Oui : a campsite, a meadow, a baseball field…"],
  ["Dans la colonne People, on écrit « a tent ».", false, "toolbox", "Non : a tent est une chose (Things). People = les personnes : hikers, a coach…"],
  ["« a campsite » veut dire « un terrain de camping ».", true, "camp", "Oui. Attention, faux ami : en anglais, camping c'est l'activité (to go camping)."],
  ["« a stream » veut dire « un ruisseau ».", true, "camp", "Oui : to walk along the stream = marcher le long du ruisseau."],
  ["« hikers » veut dire « des randonneurs ».", true, "camp", "Oui, on dit aussi walkers ou trekkers."],
  ["Rire se dit « to laught ».", false, "camp", "Non : to laugh, sans t à la fin."],
  ["Pour porter un camarade sur ses épaules, on dit « to wear someone on your shoulders ».", false, "camp", "Non : porter quelqu'un = to carry. to wear, c'est pour les vêtements."],
  ["On écrit « equipments » au pluriel.", false, "sport", "Non : equipment ne prend jamais de s (gear non plus)."],
  ["« a bat » veut dire « une batte ».", true, "sport", "Oui (et aussi une chauve-souris !)."],
  ["« to score » veut dire « marquer un but, un point ».", true, "sport", "Oui."],
  ["Au baseball, le lanceur s'appelle « the pitcher ».", true, "sport", "Oui : le cahier dit thrower, on comprend, mais le vrai mot est pitcher."],
  ["« out of breath » veut dire « essoufflé ».", true, "impressions", "Oui : The players are out of breath."],
  ["« focused » veut dire « concentré ».", true, "impressions", "Oui : The boy looks focused."],
  ["On dit « on second plan » pour « au second plan ».", false, "plans", "Non, c'est le français mot à mot. On dit in the background (au fond) ou in the foreground (devant)."],
  ["Pour « il y a une grange », on écrit « they are a barn ».", false, "phrases", "Non : There is a barn. They are = ils sont."],
  ["On dit « in the foreground » pour « au premier plan ».", true, "plans", "Oui : in the foreground, avec in."],
  ["On dit « on the foreground ».", false, "plans", "Non : in the foreground (au premier plan), in the background (à l'arrière-plan)."],
  ["« in the background » veut dire « à l'arrière-plan ».", true, "plans", "Oui : au fond de l'image, ce qui est loin."],
  ["On dit « at the top » pour « en haut ».", true, "cote", "Oui : at the top, at the bottom."],
  ["On dit « in the left » pour « à gauche ».", false, "cote", "Non : on the left, on the right."],
  ["« in the middle » veut dire « au milieu ».", true, "cote", "Oui."],
  ["On dit « in the bottom right corner » pour « en bas à droite ».", true, "coins", "Oui : in the… corner."],
  ["« a corner » veut dire « un coin ».", true, "coins", "Oui : in the top left corner = dans le coin en haut à gauche."],
  ["On dit « in the top left angle ».", false, "coins", "Non : angle est un faux ami. On dit in the top left corner."],
  ["« behind » veut dire « devant ».", false, "prep", "Non : behind = derrière. Devant = in front of."],
  ["« between » veut dire « entre ».", true, "prep", "Oui : The dog is between the two trees."],
  ["Le pluriel de « a sheep » est « two sheeps ».", false, "campagne", "Non : sheep ne prend pas de s. One sheep, two sheep."],
  ["« the campaign » veut dire « la campagne ».", false, "campagne", "Non, faux ami ! La campagne = the countryside."],
  ["« a barn » veut dire « une grange ».", true, "campagne", "Oui : la grande grange rouge de l'image."],
  ["« a lifejacket » veut dire « une veste de ski ».", false, "eau", "Non : a lifejacket, c'est un gilet de sauvetage."],
  ["« a swimsuit » veut dire « un maillot de bain ».", true, "eau", "Oui."],
  ["On dit « There are a barn on the right. »", false, "phrases", "Non : un seul objet, donc There is a barn on the right."],
  ["On dit « There are two cows in the field. »", true, "phrases", "Oui : plusieurs, donc There are."],
  ["Pour dire ce que font les personnes de l'image, on utilise be + V-ing.", true, "phrases", "Oui : The boys are jumping. The farmer is driving a tractor."],
  ["On écrit « They have a wide smile on them faces. »", false, "impressions", "Non : on their faces (their = leur)."],
  ["On dit « The boys look like happy. »", false, "impressions", "Non : look + adjectif, sans like. The boys look happy."],
  ["« excited » veut dire « excitant ».", false, "impressions", "Non : excited = tout excité (la personne). Excitant, c'est exciting."]
];

/* ---------- vérification des réponses tapées ---------- */
const normEN = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’`´‘]/g, "'").replace(/[-_]/g, " ").replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim();
const sq = s => s.replace(/[ ']/g, "");
const sing = w => /(sh|ch|x|ss)es$/.test(w) ? w.slice(0, -2) : /[^aeiou]ies$/.test(w) ? w.slice(0, -3) + "y" : /[^s]s$/.test(w) ? w.slice(0, -1) : w;
const vkey = s => sing(sq(normEN(s).replace(/\b(a|an|the|some|two|ten|to)\b/g, " ")));
const vocOk = (list, val) => { const a = vkey(val); return !!a && list.some(k => vkey(k) === a); };
function locForms(en){
  const out = new Set([en]), m = en.match(/^in the (top|bottom) (left|right) corner$/);
  if (m) for (const v of [m[1], m[1] === "top" ? "upper" : "lower"]) { out.add(`in the ${v} ${m[2]} corner`); out.add(`in the ${v} ${m[2]} hand corner`); }
  return [...out];
}
const locNorm = s => normEN(s).replace(/'/g, " ").replace(/\s+/g, " ").trim()
  .replace(/^(it is|it s|its|they are|they re|theyre|he is|she is|is|are)\s+/, "").replace(/\s+(of|in|on) the (picture|photo|image|drawing)$/, "");
function checkLoc(val, en){
  const a = locNorm(val), forms = locForms(en);
  if (!a) return {ok: false, fix: `→ ${en}`};
  if (forms.some(f => sq(f) === sq(a))) return {ok: true, fix: "✓"};
  if (forms.some(f => sq(f.replace(/\bthe /, "")) === sq(a))) return {ok: false, fix: `Presque : il manque the → ${en}`};
  const prep = en.split(" ")[0], rest = en.split(" ").slice(2).join(" ");
  if (sq(a).endsWith(sq(rest)) && !a.startsWith(prep + " ")) return {ok: false, fix: `Attention à la préposition (${prep}) → ${en}`};
  return {ok: false, fix: `→ ${en}`};
}
const gapOk = (ans, val) => { const a = sq(normEN(val)); return !!a && ans.split("|").some(x => sq(normEN(x)) === a); };

/* ---------- affichage ---------- */
const tagOf = n => `<span class="tag ${({1: "l1", 2: "l2", 3: "l3"})[UBY[n].group]}">${esc(UBY[n].name)}</span>`;
const rev = (n, q, a) => `${tagOf(n)}<span class="q">${esc(q)}</span><span>Réponse : <b>${esc(a)}</b></span>`;
const box = html => `<div class="steps"><p class="concl">${html}</p></div>`;
const fig = svg => `<div class="fig">${svg}</div>`;
const say = t => speakBtn(t, "en-GB", "btn small");
const LABEL_PC = "À savoir par cœur";
const pcLabel = p => `${LABEL_PC} · ${p.source.replace(/^Cahier · /, "cahier, ")}`;
const firstGap = g => g[1].split("|")[0];

/* Un objet dans un coin est aussi « un peu » en haut et à droite : on ne propose jamais le bord voisin d'un coin comme piège. */
const CORNER = {0: [1, 3], 2: [1, 5], 6: [3, 7], 8: [5, 7]};
const overlap = (target, other) => (CORNER[target] || []).includes(other);

/* Chaque générateur renvoie un exercice neutre {n, prompt, fig?, opts | field, explain, review, redo, say?, wide?} */
const G = {
  /* le « par cœur » : la phrase ou l'expression exacte */
  pc(n, typed){
    const pool = PAR_COEUR.filter(p => p.n === n);
    if (!pool.length) return null;
    const p = pick(pool);
    if (typed) return G.pcTyped(p);
    const label = `<span class="label">${esc(pcLabel(p))}</span><br>`;
    const prompt = p.loc ? `${label}Comment dit-on <b>« ${esc(p.fr.replace(/ \(.*\)$/, ""))} »</b> ?` : p.id === "cs" ? `${label}Comment dit-on <b>« la campagne »</b> en anglais ?` : p.q ? `${label}${esc(p.q)}` : `${label}Dis en anglais : <b>« ${esc(p.fr)} »</b>`;
    return {n, prompt, wide: !p.loc, opts: shuffle([{t: p.text, ok: true}, ...p.o.map(t => ({t, ok: false}))]),
      fig: p.loc ? (p.plan ? fig(ART.miniPlan(p.plan === "fg")) : fig(ART.miniZone(p.z))) : "",
      explain: `<b>${esc(p.text)}</b> : c'est ${p.loc || p.id === "cs" ? "l'expression" : "la phrase"} du cahier, mot pour mot.${p.tip ? `<br>${esc(p.tip)}` : ""}`, say: p.text,
      review: rev(n, `Par cœur : ${p.fr}`, p.text), redo: () => G.pc(n, typed)};
  },
  /* au contrôle : l'expression à écrire (lieux) ou le texte à trous (phrases) */
  pcTyped(p){
    if (p.loc) return {n: p.n, prompt: `<span class="label">${esc(pcLabel(p))}</span><br>Écris en anglais : <b>« ${esc(p.fr.replace(/ \(.*\)$/, ""))} »</b>`,
      fig: p.plan ? fig(ART.miniPlan(p.plan === "fg")) : fig(ART.miniZone(p.z)), say: p.text,
      field: {label: "L'expression", lang: "en", check: v => checkLoc(v, p.text)}, review: rev(p.n, `Par cœur : ${p.fr}`, p.text), redo: () => G.pcTyped(p)};
    const g = pick(p.gap);
    return {n: p.n, prompt: `<span class="label">${esc(pcLabel(p))} · texte à trous</span><br>${esc(p.fr)}<br><b>${esc(g[0])}______${esc(g[2])}</b>`, say: p.text,
      explain: `La phrase du cahier : <b>${esc(p.text)}</b>${p.tip ? `<br>${esc(p.tip)}` : ""}`,
      field: {label: "Le ou les mots qui manquent", lang: "en", check: v => { const ok = gapOk(g[1], v); return {ok, fix: ok ? "✓" : `→ ${firstGap(g)}`}; }},
      review: rev(p.n, `Texte à trous : ${g[0]}… ${g[2]}`, p.text), redo: () => G.pcTyped(p)};
  },
  gap(n){ const pool = PAR_COEUR.filter(p => p.n === n && p.gap); return pool.length ? G.pcTyped(pick(pool)) : null; },
  pcLoc(n){ const pool = PAR_COEUR.filter(p => p.n === n && p.loc); return pool.length ? G.pcTyped(pick(pool)) : null; },

  /* « Where is the barn? » : une scène tirée au hasard, l'objet entouré */
  lieu(n, typed){
    const zs = ZONES_OF[n];
    if (!zs) return null;
    const z = pick(zs), items = ART.randomScene(z), t = items.find(i => i.z === z).t, Z = ZONES[z];
    const base = {n, prompt: `${whereIs(t)}<br><span class="muted">Regarde l'objet entouré.</span>`, fig: fig(ART.sceneSVG(items, {ring: z}).svg), say: sentence(t, Z.en),
      explain: `${esc(sentence(t, Z.en))}<br><span class="muted">${esc(Z.en)} = ${esc(Z.fr)}</span>`, review: rev(n, `Where is the ${NAME[t]}?`, Z.en), redo: () => G.lieu(n, typed)};
    if (typed) return Object.assign(base, {explain: "", field: {label: `The ${NAME[t]} ${PLURAL.has(t) ? "are" : "is"}…`, lang: "en", check: v => checkLoc(v, Z.en)}});
    const wrong = shuffle(ZONES.filter(x => x.z !== z && !overlap(z, x.z))).slice(0, 3);
    return Object.assign(base, {wide: true, opts: shuffle([{t: Z.en, ok: true}, ...wrong.map(x => ({t: x.en, ok: false}))])});
  },
  /* « What can you see in the top right corner? » */
  quoi(n){
    const zs = ZONES_OF[n];
    if (!zs) return null;
    const z = pick(zs), items = ART.randomScene(z), t = items.find(i => i.z === z).t, Z = ZONES[z];
    const present = shuffle(items.filter(i => i.z !== z).map(i => i.t)), used = new Set(items.map(i => i.t));
    const absent = shuffle(Object.keys(NAME).filter(x => !used.has(x)));
    const wrong = [...present.slice(0, 2), ...absent].slice(0, 3);
    return {n, prompt: `What can you see <b>${esc(Z.en)}</b>?`, fig: fig(ART.sceneSVG(items).svg), wide: true,
      opts: shuffle([{t: `I can see ${aName(t)}.`, ok: true}, ...wrong.map(x => ({t: `I can see ${aName(x)}.`, ok: false}))]), say: `${Z.en}, I can see ${aName(t)}.`,
      explain: `${esc(Z.en.charAt(0).toUpperCase() + Z.en.slice(1))}, I can see <b>${esc(aName(t))}</b>.<br><span class="muted">${esc(Z.en)} = ${esc(Z.fr)}</span>`,
      review: rev(n, `What can you see ${Z.en}?`, aName(t)), redo: () => G.quoi(n)};
  },
  /* vrai ou faux sur une scène */
  vfScene(n){
    const zs = ZONES_OF[n];
    if (!zs) return null;
    const z = pick(zs), items = ART.randomScene(z), t = items.find(i => i.z === z).t, truth = Math.random() < .5;
    const said = truth ? ZONES[z] : pick(ZONES.filter(x => x.z !== z && !overlap(z, x.z))), s = sentence(t, said.en);
    return {n, prompt: `True or false?<br><b>${esc(s)}</b>`, fig: fig(ART.sceneSVG(items).svg), opts: [{t: "True", ok: truth}, {t: "False", ok: !truth}],
      explain: truth ? `True : ${esc(s)}` : `False : ${esc(sentence(t, ZONES[z].en))}`, say: sentence(t, ZONES[z].en),
      review: rev(n, `Vrai ou faux : ${s}`, truth ? "True" : "False"), redo: () => G.vfScene(n)};
  },
  /* in, at ou on ? */
  memo(n){
    const M = {coins: [["in", "the top left corner"], ["in", "the bottom right corner"], ["in", "the top right corner"], ["in", "the bottom left corner"]],
      cote: [["at", "the top"], ["at", "the bottom"], ["on", "the left"], ["on", "the right"], ["in", "the middle"]],
      plans: [["in", "the foreground"], ["in", "the background"]]}[n];
    if (!M) return null;
    const [p, rest] = pick(M);
    return {n, prompt: `Quelle préposition ?<br><b>… ${esc(rest)}</b>`, opts: shuffle(["in", "at", "on"].map(x => ({t: x, ok: x === p}))), say: `${p} ${rest}`,
      explain: `<b>${p} ${esc(rest)}</b><br>AT the top, AT the bottom · ON the left, ON the right · IN the middle, IN the corner, IN the foreground, IN the background.`,
      review: rev(n, `… ${rest}`, `${p} ${rest}`), redo: () => G.memo(n)};
  },
  /* que veut dire… ? */
  lieuEN(n){
    const L = n === "plans" ? Object.values(PLANS) : ZONES.filter(x => x.n === n);
    if (!L.length) return null;
    const x = pick(L), all = [...ZONES, ...Object.values(PLANS)].filter(y => y !== x);
    const short = s => s.replace(/ \(.*\)$/, "");
    return {n, prompt: `Que veut dire <b>« ${esc(x.en)} »</b> ?`, wide: true, say: x.en,
      opts: shuffle([{t: short(x.fr), ok: true}, ...shuffle(all).slice(0, 3).map(y => ({t: short(y.fr), ok: false}))]),
      explain: `<b>${esc(x.en)}</b> = ${esc(x.fr)}`, review: rev(n, x.en, short(x.fr)), redo: () => G.lieuEN(n)};
  },
  /* premier plan ou arrière-plan ? */
  plan(n, typed){
    if (n !== "plans") return null;
    const fgT = pick(["cow", "sheep", "horse", "bush", "tractor", "dog"]), bgT = pick(["barn", "windmill", "house", "watertower", "tree"]);
    const svg = fig(ART.planScene(fgT, bgT));
    if (typed || Math.random() < .5) {
      const fg = Math.random() < .5, t = fg ? fgT : bgT, L = fg ? PLANS.fg : PLANS.bg;
      const base = {n, prompt: `${whereIs(t)}`, fig: svg, say: sentence(t, L.en), explain: `${esc(sentence(t, L.en))}<br><span class="muted">${esc(L.en)} = ${esc(L.fr)}</span>`,
        review: rev(n, `Where is the ${NAME[t]}?`, L.en), redo: () => G.plan(n, typed)};
      if (typed) return Object.assign(base, {explain: "", field: {label: `The ${NAME[t]} is…`, lang: "en", check: v => checkLoc(v, L.en)}});
      return Object.assign(base, {opts: shuffle([PLANS.fg, PLANS.bg].map(p => ({t: p.en, ok: p === L})))});
    }
    const fg = Math.random() < .5, L = fg ? PLANS.fg : PLANS.bg, t = fg ? fgT : bgT, other = fg ? bgT : fgT;
    const absent = shuffle(["cow", "sheep", "horse", "tractor", "dog", "barn", "windmill", "house", "watertower"].filter(x => x !== fgT && x !== bgT)).slice(0, 2);
    return {n, prompt: `What can you see <b>${esc(L.en)}</b>?`, fig: svg, wide: true, say: `${L.en}, I can see ${aName(t)}.`,
      opts: shuffle([t, other, ...absent].map(x => ({t: `I can see ${aName(x)}.`, ok: x === t}))),
      explain: `${esc(L.en.charAt(0).toUpperCase() + L.en.slice(1))}, I can see <b>${esc(aName(t))}</b>. ${fg ? "Au premier plan : en bas, ce qui est près et paraît grand." : "À l'arrière-plan : au fond, ce qui est loin et paraît petit."}`,
      review: rev(n, `What can you see ${L.en}?`, aName(t)), redo: () => G.plan(n, typed)};
  },
  /* les prépositions sur un dessin */
  prep(n, typed){
    if (n !== "prep") return null;
    const p = pick(PREPS), k = Math.floor(Math.random() * 3), s = ART.PREP[p.en][k][2], blank = s.replace(` ${p.en} `, " ___ ");
    const base = {n, prompt: `Look at the picture. Complète :<br><b>${esc(blank)}</b>`, fig: fig(ART.prepScene(p.en, k)), say: s,
      explain: `<b>${esc(s)}</b><br><span class="muted">${esc(p.en)} = ${esc(p.fr)}</span>`, review: rev(n, blank, p.en), redo: () => G.prep(n, typed)};
    if (typed) return Object.assign(base, {explain: "", field: {label: "La préposition", lang: "en", check: v => { const ok = p.ok.some(x => sq(normEN(x)) === sq(normEN(v))); return {ok, fix: ok ? "✓" : `→ ${p.en}`}; }}});
    const wrong = shuffle(PREPS.filter(x => x !== p && !(PREP_NOT[p.en] || []).includes(x.en))).slice(0, 3);
    return Object.assign(base, {opts: shuffle([{t: p.en, ok: true}, ...wrong.map(x => ({t: x.en, ok: false}))])});
  },
  prepFR(n){
    if (n !== "prep") return null;
    const p = pick(PREPS), wrong = shuffle(PREPS.filter(x => x !== p)).slice(0, 3);
    return {n, prompt: `Comment dit-on <b>« ${esc(p.fr)} »</b> ?`, opts: shuffle([{t: p.en, ok: true}, ...wrong.map(x => ({t: x.en, ok: false}))]), say: p.en,
      explain: `<b>${esc(p.en)}</b> = ${esc(p.fr)}`, review: rev(n, p.fr, p.en), redo: () => G.prepFR(n)};
  },
  /* vocabulaire : le dessin → le mot */
  vocImg(n, typed){
    const pool = VOC.filter(v => v.n === n && v.ic);
    if (!pool.length) return null;
    const v = pick(pool);
    const base = {n, prompt: "What's this? <span class=\"muted\">(Qu'est-ce que c'est ?)</span>", fig: fig(ART.thumb(v.ic)), say: v.en,
      explain: `It's <b>${esc(v.en)}</b> : ${esc(v.fr)}.${v.tip ? `<br>${esc(v.tip)}` : ""}`, review: rev(n, `Dessin : ${v.fr}`, v.en), redo: () => G.vocImg(n, typed)};
    if (typed) return Object.assign(base, {explain: "", field: {label: "Le mot anglais", lang: "en", check: val => { const ok = vocOk(v.ok, val); return {ok, fix: ok ? "✓" : `→ ${v.en}`}; }}});
    const wrong = shuffle(VOC.filter(x => x !== v && x.ic && x.n === n && !(v.not || []).includes(x.en))).slice(0, 3);
    return Object.assign(base, {opts: shuffle([{t: v.en, ok: true}, ...wrong.map(x => ({t: x.en, ok: false}))])});
  },
  /* vocabulaire : français → anglais */
  vocFR(n, typed){
    const pool = VOC.filter(v => v.n === n);
    if (!pool.length) return null;
    const v = pick(pool);
    const base = {n, prompt: `Comment dit-on <b>« ${esc(v.fr)} »</b> ?`, say: v.en, explain: `<b>${esc(v.en)}</b> = ${esc(v.fr)}${v.tip ? `<br>${esc(v.tip)}` : ""}`,
      review: rev(n, v.fr, v.en), redo: () => G.vocFR(n, typed)};
    if (typed) return Object.assign(base, {explain: "", field: {label: "Le mot anglais", lang: "en", check: val => { const ok = vocOk(v.ok, val); return {ok, fix: ok ? "✓" : `→ ${v.en}`}; }}});
    const wrong = shuffle(VOC.filter(x => x !== v && x.n === n && !(v.not || []).includes(x.en))).slice(0, 3);
    return Object.assign(base, {opts: shuffle([{t: v.en, ok: true}, ...wrong.map(x => ({t: x.en, ok: false}))])});
  },
  /* vocabulaire : anglais → français */
  vocEN(n){
    const pool = VOC.filter(v => v.n === n);
    if (!pool.length) return null;
    const v = pick(pool), wrong = shuffle(VOC.filter(x => x !== v && x.n === n && !(v.not || []).includes(x.en) && x.fr !== v.fr)).slice(0, 3);
    return {n, prompt: `Que veut dire <b>« ${esc(v.en)} »</b> ?`, say: v.en, opts: shuffle([{t: v.fr, ok: true}, ...wrong.map(x => ({t: x.fr, ok: false}))]),
      explain: `<b>${esc(v.en)}</b> = ${esc(v.fr)}`, review: rev(n, v.en, v.fr), redo: () => G.vocEN(n)};
  },
  /* There is ou There are ? */
  thereIs(n, typed){
    if (n !== "phrases") return null;
    const [rest, b] = pick(THERE), good = `There ${b}`, s = `${good} ${rest}`;
    const base = {n, prompt: `Complète :<br><b>___ ${esc(rest)}</b>`, say: s,
      explain: `<b>${esc(s)}</b><br>There is + un seul (There is a barn) · There are + plusieurs (There are two cows).`, review: rev(n, `___ ${rest}`, good), redo: () => G.thereIs(n, typed)};
    if (typed) return Object.assign(base, {field: {label: "There…", lang: "en", check: v => { const a = sq(normEN(v)).replace(/^there/, ""); const ok = a === b || (b === "is" && a === "s");
      return {ok, fix: ok ? "✓" : `→ ${good}`}; }}});
    return Object.assign(base, {opts: shuffle(["There is", "There are", "It is", "They are"].map(t => ({t, ok: t === good})))});
  },
  /* le présent en be + -ing */
  cont(n, typed){
    if (n !== "phrases") return null;
    const [subj, base, be, ing, rest, wrong, tip] = pick(CONT), good = `${be} ${ing}`, s = `${subj} ${good}${rest ? " " + rest : "."}`;
    const b0 = {n, prompt: `Ce qu'ils font sur l'image : complète avec <b>be + V-ing</b>.<br><b>${esc(subj)} ___ ${esc(rest)}</b> <span class="muted">(${esc(base)})</span>`, say: s, tip,
      explain: `<b>${esc(s)}</b>`, review: rev(n, `${subj} ___ (${base}) ${rest}`, good), redo: () => G.cont(n, typed)};
    if (typed) return Object.assign(b0, {explain: tip ? esc(tip) : "", field: {label: "be + V-ing", lang: "en", check: v => { const a = normEN(v).replace(/'/g, " ").replace(/\s+/g, " ").trim();
      const ok = a === good || (be === "is" && a === `s ${ing}`) || (be === "are" && a === `re ${ing}`);
      const fix = ok ? "✓" : a.endsWith(" " + ing) || a === ing ? `Attention à be : ${subj} ${be}… → ${good}` : `→ ${good}`; return {ok, fix}; }}});
    return Object.assign(b0, {opts: shuffle([{t: good, ok: true}, ...wrong.map(t => ({t, ok: false}))])});
  },
  /* un visage → l'émotion */
  face(n, typed){
    if (n !== "impressions") return null;
    const f = pick(ART.FACES), F = FEEL[f];
    const base = {n, prompt: "How does he feel? <span class=\"muted\">He looks…</span>", fig: fig(ART.face(f)), say: `He looks ${f}.`,
      explain: `He looks <b>${f}</b> (${esc(F.fr)}).`, review: rev(n, `Visage : ${F.fr}`, f), redo: () => G.face(n, typed)};
    if (typed) return Object.assign(base, {explain: "", field: {label: "He looks…", lang: "en", check: v => { const a = sq(normEN(v)).replace(/^he(looks|seems|is)/, ""); const ok = F.ok.includes(a); return {ok, fix: ok ? "✓" : `→ ${f}`}; }}});
    return Object.assign(base, {opts: shuffle([f, ...shuffle(ART.FACES.filter(x => x !== f)).slice(0, 3)].map(x => ({t: x, ok: x === f})))});
  },
  /* look, seem, their… */
  lookSeem(n){
    if (n !== "impressions") return null;
    const x = pick(LOOK), s = x.q.replace("___", x.a);
    return {n, prompt: `Complète :<br><b>${esc(x.q)}</b>`, opts: shuffle([{t: x.a, ok: true}, ...x.o.map(t => ({t, ok: false}))]), say: s,
      explain: `<b>${esc(s)}</b><br>${esc(x.w)}`, review: rev(n, x.q, x.a), redo: () => G.lookSeem(n)};
  },
  /* l'image du lac (la photo du cahier) */
  lake(n){
    const pool = LAKE_Q.filter(x => x.n === n);
    if (!pool.length) return null;
    const x = pick(pool);
    return {n, prompt: `Look at the picture.<br><b>${esc(x.q)}</b>`, fig: fig(ART.big(ART.lake, "Des garçons sautent dans un lac depuis une structure gonflable")), wide: true,
      opts: shuffle([{t: x.a, ok: true}, ...x.o.map(t => ({t, ok: false}))]), say: x.a, explain: `<b>${esc(x.a)}</b>`, review: rev(n, x.q, x.a), redo: () => G.lake(n)};
  },
  /* la Tool box : dans quelle colonne ? */
  tb(n){
    const pool = TBI.filter(x => n === "toolbox" || x[2] === n);
    if (!pool.length) return null;
    const [w, col] = pick(pool), wrong = shuffle(Object.keys(TB_COLS).filter(c => c !== col)).slice(0, 3);
    return {n, prompt: `<span class="label">Tool box</span><br>Dans quelle colonne ranges-tu <b>« ${esc(w)} »</b> ?`,
      opts: shuffle([{t: col, ok: true}, ...wrong.map(t => ({t, ok: false}))]), say: w,
      explain: `<b>${esc(w)}</b> → <b>${col}</b> : ${esc(TB_COLS[col])}.`, review: rev(n, `Tool box : ${w}`, col), redo: () => G.tb(n)};
  },
  /* la description de la ferme écrite par Léandre : la bonne phrase */
  fix(n){
    const pool = FIX.filter(x => x.n === n);
    if (!pool.length) return null;
    const x = pick(pool);
    return {n, prompt: `<span class="label">Ta description de la ferme · corrige l'erreur</span><br>Tu avais écrit : <i>${esc(x.bad)}</i><br>Quelle est la bonne phrase ?`,
      fig: fig(ART.big(ART.farm, "Une ferme à la campagne")), wide: true, say: x.a,
      opts: shuffle([{t: x.a, ok: true}, ...x.o.map(t => ({t, ok: false}))]), explain: `<b>${esc(x.a)}</b><br>${esc(x.w)}`,
      review: rev(n, `Corrige : ${x.bad}`, x.a), redo: () => G.fix(n)};
  },
  vf(n){
    const pool = VF.filter(v => v[2] === n);
    if (!pool.length) return null;
    const [s, truth, , why] = pick(pool);
    return {n, prompt: `Vrai ou faux ?<br><b>${esc(s)}</b>`, opts: [{t: "Vrai", ok: truth}, {t: "Faux", ok: !truth}], explain: esc(why),
      review: rev(n, s, truth ? "Vrai" : "Faux"), redo: () => G.vf(n)};
  }
};
const KINDS = {
  coins: ["lieu", "lieu", "quoi", "vfScene", "memo", "lieuEN", "fix", "vf"],
  cote: ["lieu", "lieu", "quoi", "vfScene", "memo", "lieuEN", "fix", "vf"],
  plans: ["plan", "plan", "memo", "lieuEN", "fix", "vf"],
  prep: ["prep", "prep", "prep", "prepFR", "vf"],
  campagne: ["vocImg", "vocImg", "vocFR", "vocEN", "fix", "vf"],
  eau: ["vocImg", "vocFR", "vocEN", "lake", "vf"],
  camp: ["vocFR", "vocFR", "vocEN", "vocEN", "tb", "vf"],
  sport: ["vocFR", "vocFR", "vocEN", "vocEN", "tb", "vf"],
  toolbox: ["tb", "tb", "tb", "vf"],
  phrases: ["thereIs", "cont", "cont", "lake", "fix", "vf"],
  impressions: ["face", "lookSeem", "lookSeem", "lake", "vocFR", "vocEN", "tb", "vf"]
};
const KINDS_TYPED = {coins: ["lieu", "pcLoc"], cote: ["lieu", "pcLoc"], plans: ["plan", "pcLoc"], prep: ["prep"], campagne: ["vocImg", "vocFR", "gap"], eau: ["vocImg", "vocFR"],
  camp: ["vocFR"], sport: ["vocFR"], toolbox: ["gap"], phrases: ["gap", "cont", "thereIs"], impressions: ["gap", "face", "vocFR"]};
function make(n, typed){
  for (const k of shuffle(typed ? KINDS_TYPED[n] : KINDS[n])) { const e = G[k](n, typed); if (e) return e; }
  return G.vf(n);
}

/* ---------- rédaction : décrire une image, comme à l'évaluation ---------- */
const desc = t => `<p class="sr">Description de l'image pour la correction : ${esc(t)}</p>`;
const REDAC = [
  {id: "lac", unit: "impressions", titre: "The boys at the lake",
   doc: fig(ART.big(ART.lake, "Des garçons sautent dans un lac depuis une structure gonflable"))
     + desc("un lac en été. Au milieu, une grande structure gonflable bleue, jaune et rouge flotte sur l'eau. Dix garçons, tous avec un gilet de sauvetage orange et un maillot de bain : trois sont debout sur la structure (au milieu), quatre sautent dans l'eau, trois nagent au premier plan, en bas de l'image. Ils sourient. En haut à droite, le soleil. En haut à gauche, des nuages. À l'arrière-plan, une forêt. À droite, des arbres au bord du lac."),
   consigne: `<p>C'est l'image du cahier ! <b>Describe the picture</b> en 6 à 8 phrases : <b>qui</b> on voit, <b>ce qu'ils font</b> (be + -ing), <b>ce qu'ils portent</b>, <b>où</b> sont les choses (au moins 3 expressions de lieu) et <b>l'impression</b> qu'ils donnent (look, seem).</p>`,
   modele: "This is a picture of a lake in summer. In the middle, there is a big inflatable structure. We can see ten boys jumping in the water off the inflatable structure. They're wearing lifejackets and swimsuits. In the foreground, three boys are swimming. In the background, there is a forest, and in the top right corner, the sun is shining. The boys look happy and excited. They have a wide smile on their faces: they seem to be having fun!",
   criteres: [
     {t: "Dit qui on voit et ce qu'ils font, avec be + -ing (We can see ten boys jumping… / They are jumping in the water)", pts: 1},
     {t: "Dit ce qu'ils portent : They're wearing lifejackets and swimsuits", pts: 1},
     {t: "Situe au moins trois éléments avec une expression de lieu juste et qui correspond à l'image (in the middle, in the foreground, in the top right corner…)", pts: 2},
     {t: "Donne une impression avec look ou seem (They look happy, They seem to be having fun…)", pts: 1},
     {t: "Écrit des phrases complètes en anglais, avec un sujet et un verbe", pts: 1}]},
  {id: "ferme", unit: "cote", titre: "The countryside",
   doc: fig(ART.big(ART.farm, "Une ferme à la campagne"))
     + desc("la campagne. En bas à gauche, une clôture en bois qui part vers le milieu de l'image (on peut dire qu'elle est à gauche). Au milieu, un moulin à vent, devant un champ de blé jaune. À droite, une grande grange rouge et, tout à droite, un château d'eau. À l'arrière-plan, des montagnes (en haut à droite, derrière la grange). En haut à gauche, un gros nuage. En bas, au milieu, un chemin de terre qui va vers le moulin. En bas à droite, un buisson et des fleurs. De l'herbe partout au premier plan. Il fait beau."),
   consigne: `<p>C'est l'image de la leçon sur la campagne. <b>Describe the picture</b> en 6 à 8 phrases. Utilise le <b>vocabulaire de la campagne</b>, <b>There is / There are</b> et au moins <b>quatre expressions de lieu</b>.</p>`,
   modele: "This is a picture of the countryside. In the top left corner, there is a big cloud. In the bottom left corner, we can see a fence. In the middle, there is a windmill in front of a field. On the right, there is a red barn and a water tower. In the background, there are mountains. At the bottom, there is a path, and in the bottom right corner, we can see a bush. It looks peaceful and it seems to be summer.",
   criteres: [
     {t: "Présente l'image (This is a picture of the countryside / In this picture, we can see…)", pts: 1},
     {t: "Situe au moins quatre éléments avec une expression de lieu juste et qui correspond à l'image (on the left, in the middle, on the right, in the background…)", pts: 2},
     {t: "Emploie au moins cinq mots de la campagne justes (fence, windmill, field, barn, water tower, mountains, path, bush…)", pts: 1},
     {t: "Emploie There is / There are correctement (is pour un seul, are pour plusieurs)", pts: 1},
     {t: "Donne une impression ou une hypothèse (It looks peaceful, It seems to be summer, I think…)", pts: 1}]},
  {id: "plage", unit: "phrases", titre: "At the beach",
   doc: fig(ART.big(ART.beach, "Une plage en été"))
     + desc("une plage en été. En haut à droite, le soleil. En haut au milieu, des oiseaux (des mouettes). En haut à gauche, un nuage. À gauche, un phare rouge et blanc sur des rochers. Au milieu, à l'arrière-plan, un voilier sur la mer. À droite, un parasol rouge et une serviette rose. Au premier plan, en bas au milieu, deux enfants construisent un château de sable. En bas à gauche, un seau et une pelle."),
   consigne: `<p>Une nouvelle image : <b>describe the picture</b> en 6 à 8 phrases. Dis <b>où</b> sont les choses (au moins quatre expressions de lieu), <b>ce que font</b> les enfants (be + -ing) et donne <b>ton impression</b>.</p>`,
   modele: "This is a picture of a beach in summer. In the top right corner, the sun is shining. At the top, there are some birds. On the left, there is a lighthouse. In the background, we can see a boat on the sea. On the right, there is a beach umbrella. In the foreground, two children are building a sandcastle. In the bottom left corner, there is a bucket. The children look happy: they seem to be having fun.",
   criteres: [
     {t: "Présente l'image (This is a picture of a beach / In this picture, we can see…)", pts: 1},
     {t: "Situe au moins quatre éléments avec une expression de lieu juste et qui correspond à l'image (in the top right corner, on the left, in the background, in the foreground…)", pts: 2},
     {t: "Dit ce que font les enfants avec be + -ing (two children are building a sandcastle)", pts: 1},
     {t: "Emploie There is / There are correctement", pts: 1},
     {t: "Donne une impression avec look ou seem (They look happy, It seems to be summer…)", pts: 1}]},
  {id: "dessin", unit: "campagne", titre: "My drawing of the countryside",
   consigne: `<p>La consigne du cahier : <b>Do a drawing of countryside</b>. Fais ton dessin de la campagne sur une feuille, puis <b>décris-le en anglais</b> en 6 à 8 phrases, comme pour l'évaluation. Tu peux prendre en photo ton dessin <b>et</b> ta description.</p>`,
   modele: "This is a picture of the countryside. In the background, there are mountains and a windmill. In the top right corner, the sun is shining. On the left, there is a farm with a red barn. On the right, we can see a field with three cows. In the foreground, there is a path and a fence. A farmer is driving a tractor in the middle. It looks peaceful.",
   criteres: [
     {t: "Présente l'image (This is a picture of the countryside / In my drawing, we can see…)", pts: 1},
     {t: "Situe au moins quatre éléments avec des expressions de lieu justes (in the background, on the left, in the foreground…)", pts: 2},
     {t: "Emploie au moins cinq mots de la campagne justes (barn, field, fence, path, windmill, cow…)", pts: 1},
     {t: "Emploie There is / There are ou be + -ing correctement", pts: 1},
     {t: "Donne une impression ou une hypothèse (It looks peaceful, It seems to be summer…)", pts: 1}]},
  {id: "ferme-corrige", unit: "cote", titre: "Ma description de la ferme, corrigée",
   doc: fig(ART.big(ART.farm, "Une ferme à la campagne"))
     + `<p class="label">Ce que tu avais écrit dans ton cahier</p><p class="fine"><i>On this landscape, they are a barn in the background, a path dusttrack at the bottom to lead in the barn. In the top, there is a cloud. The path dusttrack is between grass. On the left, there is a fence. On the middle but on second plan, there is a windmill. On the right of the barn, there is a water tower. On the right corner, there is a bush. On the third plan, there are fields behind the grass, on the middle. The path dust track is in the foreground.</i></p>`
     + desc("la campagne. En bas à gauche, une clôture en bois. Au milieu, un moulin à vent, devant un champ de blé jaune. À droite, une grande grange rouge et, tout à droite, un château d'eau. À l'arrière-plan, des montagnes. En haut à gauche, un gros nuage. En bas, au milieu, un chemin de terre qui va vers le moulin et la grange. En bas à droite, un buisson et des fleurs. De l'herbe au premier plan."),
   consigne: `<p>Voici ta description de la ferme : elle contient des erreurs. <b>Réécris-la sans erreur</b> : <b>there is / there are</b> (pas « they are »), les bonnes <b>prépositions</b> (at the top, in the middle, in the bottom right corner), <b>a dirt track</b>, et <b>in the foreground / in the background</b> à la place de « second plan » ou « third plan ».</p>`,
   modele: "In this picture, there is a barn on the right and a dirt track at the bottom, leading to the barn. At the top, there is a cloud. The dirt track is between the grass. On the left, there is a fence. In the middle, in the background, there is a windmill. On the right of the barn, there is a water tower. In the bottom right corner, there is a bush. In the background, there are fields behind the grass. The dirt track is in the foreground.",
   criteres: [
     {t: "Écrit There is / There are (et non « they are ») pour dire ce qu'il y a", pts: 1},
     {t: "Écrit At the top et In the middle (et non « In the top », « On the middle »)", pts: 1},
     {t: "Écrit In the bottom right corner pour le buisson (et non « On the right corner »)", pts: 1},
     {t: "Écrit a dirt track (ou a path) leading to the barn (et non « dusttrack… to lead in the barn »)", pts: 1},
     {t: "Remplace « second plan / third plan » par in the background (ou in the foreground)", pts: 1}]},
  {id: "baseball", unit: "toolbox", titre: "The baseball practice",
   doc: `<p class="label">La photo de la fiche Tool box (décrite en français)</p><p>Un terrain de baseball en été. <b>Au premier plan, à gauche</b>, un garçon en tenue blanche avec une casquette verte et un gant en cuir, penché en avant, un pied près de la base (un carré blanc par terre) : il attend la balle, très concentré. <b>Au milieu</b>, sur le terrain de terre et d'herbe, d'autres joueurs s'entraînent et se lancent la balle. <b>À l'arrière-plan</b>, deux bus scolaires jaunes et de grands arbres. Le ciel est bleu, il fait beau.</p>`,
   consigne: `<p>Remplis d'abord ta <b>Tool box</b> au brouillon (<b>Things, People, Actions, Places, Feelings</b>), puis <b>describe the picture</b> en 6 à 8 phrases : <b>où</b> sont les choses, <b>ce que font</b> les joueurs (be + -ing) et <b>ce qu'ils ressentent</b> (look, seem).</p>`,
   modele: "This is a photo of a baseball practice on a sunny day. In the foreground, on the left, we can see a boy. He's wearing a white uniform, a green cap and a leather glove. He is waiting for the ball: he looks focused and determined. In the middle, other players are throwing and catching the ball. In the background, there are two yellow school buses and big trees. The players seem to be having fun.",
   criteres: [
     {t: "Présente l'image (This is a photo of a baseball practice / a baseball game…)", pts: 1},
     {t: "Situe au moins trois éléments avec une expression de lieu juste (in the foreground, in the middle, in the background…)", pts: 2},
     {t: "Emploie au moins trois mots du baseball (glove, cap, bat, player, team, field, coach…)", pts: 1},
     {t: "Dit ce que font les joueurs avec be + -ing (are throwing, is catching, are playing…)", pts: 1},
     {t: "Dit ce qu'ils ressentent avec look ou seem et un mot de la colonne Feelings (focused, determined, nervous, happy…)", pts: 1}]}
];

/* ---------- cartes ---------- */
const card = (n, front, back, o = {}) => ({unit: UBY[n],
  front: `<div class="fbody">${o.label ? `<span class="label">${esc(o.label)}</span>` : ""}<span class="card-q">${front}</span>${o.figF || ""}<span class="hint">Touche la carte pour voir la réponse</span></div>`,
  back: `<div class="fbody">${back}${o.tip ? `<span class="tip">${esc(o.tip)}</span>` : ""}</div>`, extra: o.say ? speakBtn(o.say, "en-GB") : ""});
const ans = (en, fr) => `<span class="card-q" style="color:var(--pen)">${esc(en)}</span>${fr ? `<span class="muted">${esc(fr)}</span>` : ""}`;
const small = svg => `<div class="fig" style="margin:6px 0 0;width:100%">${svg}</div>`;
function buildCards(){
  const out = [];
  /* 1. le par cœur, dans l'ordre du cahier */
  for (const p of PAR_COEUR) {
    if (p.loc) out.push(card(p.n, `Comment dit-on « ${esc(p.fr.replace(/ \(.*\)$/, ""))} » ?`, ans(p.text, p.fr) + small(p.plan ? ART.miniPlan(p.plan === "fg") : ART.miniZone(p.z)),
      {label: pcLabel(p), say: p.text}));
    else if (p.id === "cs") out.push(card(p.n, "Comment dit-on « la campagne » ?", ans("the countryside", "campagne = countryside") + small(ART.big(ART.farm, "La campagne")), {label: pcLabel(p), say: p.text, tip: p.tip}));
    else if (p.q) out.push(card(p.n, esc(p.q), ans(p.text, p.fr), {label: pcLabel(p), say: p.text, tip: p.tip}));
    else out.push(card(p.n, `Dis en anglais : « ${esc(p.fr)} »`, ans(p.text), {label: pcLabel(p), say: p.text, tip: p.tip}));
  }
  /* 2. les lieux : en plus */
  out.push(card("coins", "Et les deux autres coins ?", ans("in the top right corner", "en haut à droite") + ans("in the bottom left corner", "en bas à gauche")
    + `<div class="fig" style="gap:10px;margin:6px 0 0">${ART.miniZone(2)}${ART.miniZone(6)}</div>`, {label: "En plus", say: "in the top right corner. in the bottom left corner."}));
  out.push(card("cote", "in, at ou on ? Quelle préposition avec top, left, middle, corner… ?",
    `<div class="card-a" style="margin-top:0"><b>AT</b> the top · <b>AT</b> the bottom\n<b>ON</b> the left · <b>ON</b> the right\n<b>IN</b> the middle · <b>IN</b> the … corner\n<b>IN</b> the foreground · <b>IN</b> the background</div>`,
    {label: "Le truc pour ne pas se tromper", tip: "Jamais « in the left » ni « on the foreground » !"}));
  /* 3. les prépositions */
  for (const p of PREPS) out.push(card("prep", `Comment dit-on « ${esc(p.fr)} » ?`, ans(p.en, ART.PREP[p.en][0][2]) + small(ART.prepScene(p.en, 0)), {label: "En plus · prépositions", say: ART.PREP[p.en][0][2]}));
  /* 4. le vocabulaire */
  for (const v of VOC.filter(v => v.n === "campagne" && (v.cahier || v.card)))
    out.push(card(v.n, `Comment dit-on « ${esc(v.fr)} » ?`, ans(v.en, v.fr) + (v.ic ? small(ART.thumb(v.ic)) : ""), {label: v.cahier ? "Vocabulaire du cahier" : "En plus", say: v.en, tip: v.tip}));
  out.push(card("eau", "Quatre façons de parler des garçons de la photo ?", `<div class="card-a" style="margin-top:0"><b>boys</b> : des garçons\n<b>kids</b> / <b>children</b> : des enfants\n<b>teenagers</b> : des adolescents\n<b>young people</b> : des jeunes</div>`,
    {label: "Vocabulaire du cahier", say: "boys, kids, children, teenagers, young people", tip: "a child, two children (sans s)"}));
  for (const v of VOC.filter(v => v.n === "eau" && v.cahier && v.ic && v.ic !== "kids"))
    out.push(card(v.n, `Comment dit-on « ${esc(v.fr)} » ?`, ans(v.en, v.fr) + small(ART.thumb(v.ic)), {label: "Vocabulaire du cahier", say: v.en, tip: v.tip}));
  /* 5. les phrases utiles */
  out.push(card("phrases", "Comment commencer la description d'une image ?", `<div class="card-a" style="margin-top:0"><b>This is a picture of</b> the countryside.\n<b>It's a photo of</b> a lake.\n<b>In this picture, we can see</b>…</div>`,
    {label: "En plus", say: "This is a picture of the countryside. In this picture, we can see a barn."}));
  out.push(card("phrases", "There is ou There are ?", `<div class="card-a" style="margin-top:0"><b>There is</b> + un seul : There is a barn on the right.\n<b>There are</b> + plusieurs : There are two cows in the field.</div>`,
    {label: "En plus", say: "There is a barn on the right. There are two cows in the field."}));
  out.push(card("phrases", "Pour dire ce que font les personnes, quel temps ?", `<div class="card-a" style="margin-top:0">Le présent <b>be + V-ing</b> :\nThe boys <b>are jumping</b> in the water.\nThe farmer <b>is driving</b> a tractor.</div>`,
    {label: "En plus", tip: "swim → swimming, smile → smiling, run → running", say: "The boys are jumping in the water. The farmer is driving a tractor."}));
  out.push(card("impressions", "look happy ou look like happy ?", `<div class="card-a" style="margin-top:0"><b>look + adjectif</b> : They look happy.\n<b>look like + nom</b> : It looks like a farm.</div>`,
    {label: "En plus", say: "They look happy. It looks like a farm."}));
  /* 6. la Tool box et ses tableaux */
  out.push(card("toolbox", "À quelle question répond chaque colonne de la Tool box ?",
    `<div class="card-a" style="margin-top:0">${Object.entries(TB_COLS).map(([c, d]) => `<b>${c}</b> : ${esc(d)}`).join("\n")}</div>`,
    {label: "En plus", say: "Things, People, Actions, Places, Feelings."}));
  for (const v of VOC.filter(v => v.src))
    out.push(card(v.n, `Comment dit-on « ${esc(v.fr)} » ?`, ans(v.en, v.fr), {label: `Tool box du cahier · ${v.src}`, say: v.en, tip: v.tip}));
  for (const f of ["scared", "tired", "surprised"]) out.push(card("impressions", `Comment dit-on « ${esc(FEEL[f].fr)} » ?`, ans(f) + small(ART.face(f)), {label: "En plus · les émotions", say: `He looks ${f}.`}));
  return out;
}

/* ---------- passage au moteur ---------- */
const asQuiz = e => ({unit: UBY[e.n], key: e.review, prompt: e.prompt, fig: e.fig, wide: e.wide, opts: e.opts, tip: e.tip,
  feedback: () => box(e.explain) + (e.say ? say(e.say) : ""), review: e.review});
const asControl = e => Object.assign({unit: UBY[e.n], prompt: e.prompt, fig: e.fig, wide: e.wide, tip: e.tip, review: e.review,
  correction: () => (e.explain ? `<p class="label" style="margin-top:4px">Correction</p>${box(e.explain)}` : "") + (e.say ? say(e.say) : ""), redo: () => asControl(e.redo())},
  e.field ? {kind: "fields", fields: [e.field]} : {kind: "choice", opts: e.opts});

function overview(){
  const cell = z => { const Z = ZONES[z]; return `<td style="white-space:normal;vertical-align:top;width:33%;padding:8px 6px"><b style="color:var(--pen)">${esc(Z.en)}</b><br><span class="muted" style="font-size:12px">${esc(Z.fr.replace(/ \(.*\)$/, ""))}</span></td>`; };
  return `<p class="label">Les 9 zones de l'image</p><div class="tbw"><table class="tb" style="width:100%;table-layout:fixed">${[0, 1, 2].map(r => `<tr>${[0, 1, 2].map(c => cell(r * 3 + c)).join("")}</tr>`).join("")}</table></div>
    <p class="fine" style="margin:8px 0 0"><b>AT</b> the top / the bottom · <b>ON</b> the left / the right · <b>IN</b> the middle, the … corner, the foreground (devant), the background (au fond).</p>
    <p class="label" style="margin-top:14px">La Tool box : 5 colonnes à remplir avant d'écrire</p>
    <p class="fine" style="margin:0">${Object.entries(TB_COLS).map(([c, d]) => `<b>${c}</b> : ${esc(d)}`).join("<br>")}</p>`;
}

Revision.start({
  key: "leandre-anglais-decrire-une-image-v1",
  title: "Décrire une image",
  subtitle: "Describe a picture",
  eyebrow: "Anglais · 4e",
  hand: "Where? What? How? Pour l'évaluation",
  video: {src: "film.mp4", poster: "film.jpg", length: "6 min", title: "Le film : où est-ce sur l'image ?",
    text: "Les 9 zones de l'image, le premier plan et l'arrière-plan, les prépositions et les phrases du cahier, en dessins animés. Idéal avant les cartes ou la veille de l'évaluation.",
    chapters: [[0, "Introduction"], [9, "La campagne"], [31, "1 · Les 9 zones"], [128, "Premier plan, arrière-plan"], [171, "Les prépositions"], [197, "2 · La photo du cahier"], [224, "3 · Les impressions"], [269, "La méthode et un exemple"], [321, "À retenir"]]},
  groups: {
    "1": {name: "Where? · Situer", cls: "l1", filter: "Situer (where?)"},
    "2": {name: "What? · Le vocabulaire", cls: "l2", filter: "Vocabulaire (what?)"},
    "3": {name: "How? · Les phrases", cls: "l3", filter: "Phrases (how?)"}
  },
  redaction: {items: REDAC, text: "6 images à décrire en anglais, comme à l'évaluation : tu écris (ou tu prends ta copie en photo), puis tu es corrigé critère par critère."},
  units: UNITS,
  allLabel: () => "Tout le chapitre",
  mastery: {max: 5, noun: "notions", feminine: true, help: "Une pastille se remplit à chaque bonne réponse au contrôle et se vide à chaque erreur. Cinq pastilles : notion maîtrisée."},
  modes: {
    cards: ["la leçon", "Les expressions et les phrases du cahier, puis le vocabulaire, à réviser chaque jour."],
    quiz: ["10 questions", "Des images à observer : où est l'objet ? qu'y a-t-il dans le coin ?"],
    control: ["noté sur 20", "Tu écris toi-même les expressions de lieu, les mots et les phrases du cahier."]
  },
  overview,
  cards: pool => { const ids = pool.map(u => u.id); return buildCards().filter(c => ids.includes(c.unit.id)); },
  quiz: {count: 10, make: (pool, R, i) => {
    const n = R.weighted(pool).id, p = i % 5 < 2 ? G.pc(n, false) : null;   // environ 4 questions sur 10 sur le « par cœur »
    return asQuiz(p || make(n, false));
  }},
  control: {
    lead: "17 questions, comme à l'évaluation : tu situes des objets sur des images, tu écris les expressions de lieu, les mots des Tool box et les phrases du cahier.",
    note: "Les majuscules et la ponctuation ne comptent pas. Les prépositions (in, at, on) et the, si !",
    size: () => 17,
    build: (pool, R) => {
      const ids = pool.map(u => u.id), items = [];
      const plan = [["lieu", ["coins", "cote"]], ["lieu", ["coins", "cote"]], ["pcLoc", ["coins", "cote", "plans"]], ["pcLoc", ["cote", "coins", "plans"]], ["plan", ["plans"]],
        ["prep", ["prep"]], ["vocImg", ["campagne", "eau"]], ["gap", ["campagne"]], ["vocFR", ["eau", "campagne"]], ["gap", ["phrases", "impressions"]],
        ["gap", ["impressions", "phrases"]], ["cont", ["phrases"]], ["thereIs", ["phrases"]], ["face", ["impressions"]],
        ["vocFR", ["camp", "sport"]], ["vocFR", ["sport", "camp", "impressions"]], ["gap", ["toolbox"]]];
      for (const [k, us] of plan) {
        const cand = us.filter(u => ids.includes(u));
        let e = null;
        for (let t = 0; t < 12 && !e; t++) {
          e = cand.length ? G[k](pick(cand), true) : make(pick(ids), true);
          if (e && items.some(x => x.review === e.review)) e = null;
        }
        items.push(e || make(pick(ids), true));
      }
      return shuffle(items).map(asControl);
    }
  }
});
})();
