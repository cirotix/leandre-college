/* Worker Cloudflare « leandre-push » : abonnements et envoi des notifications du site de révisions.
   Routes :
     GET  /vapid-public-key   clé publique à donner au navigateur pour s'abonner
     POST /subscribe          {subscription}            → enregistre la tablette
     POST /unsubscribe        {endpoint}                → l'oublie
     POST /test               {endpoint}                → notification de test vers cette tablette seulement
   Tâches planifiées (wrangler.toml → [triggers]) :
     - toutes les heures : regarde modules.json sur le site et annonce les nouveaux modules
     - rappels de révision éventuels, définis dans la variable REMINDERS {"<cron>": {title, body, url}} */
import {generateVapidKeys, sendPush} from "./webpush.js";

const PUSH_HOSTS = [/^web\.push\.apple\.com$/, /^fcm\.googleapis\.com$/, /(^|\.)push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/];
const MAX_SUBS = 200;

export async function sha256hex(s){
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return [...d].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function getVapid(env){
  let v = await env.SUBS.get("vapid", "json");
  if (!v) { v = await generateVapidKeys(); await env.SUBS.put("vapid", JSON.stringify(v)); }
  return v;
}

function validSubscription(s){
  if (!s || typeof s.endpoint !== "string" || !s.keys || typeof s.keys.p256dh !== "string" || typeof s.keys.auth !== "string") return false;
  let u;
  try { u = new URL(s.endpoint); } catch (e) { return false; }
  return u.protocol === "https:" && PUSH_HOSTS.some(r => r.test(u.hostname));
}

async function listSubs(env){
  const out = [];
  let cursor;
  do {
    const page = await env.SUBS.list({prefix: "sub:", cursor});
    for (const k of page.keys) { const v = await env.SUBS.get(k.name, "json"); if (v) out.push({key: k.name, ...v}); }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return out;
}

/* Envoie à toutes les tablettes abonnées ; supprime les abonnements expirés. */
export async function broadcast(env, payload, fetchImpl = fetch){
  const vapid = await getVapid(env), subs = await listSubs(env), codes = [];
  let ok = 0, gone = 0, failed = 0;
  for (const s of subs) {
    try {
      const st = await sendPush(s.subscription, payload, vapid, env.VAPID_SUBJECT, {fetchImpl});
      codes.push(st);
      if (st === 404 || st === 410) { await env.SUBS.delete(s.key); gone++; }
      else if (st >= 200 && st < 300) ok++;
      else failed++;
    } catch (e) { failed++; codes.push(String(e && e.message || e).slice(0, 80)); }
  }
  return {ok, gone, failed, total: subs.length, codes};
}

/* Annonce les modules apparus dans modules.json depuis la dernière vérification. */
export async function checkNewModules(env, fetchImpl = fetch){
  const site = env.SITE_URL.replace(/\/?$/, "/");
  const res = await fetchImpl(site + "modules.json", {cf: {cacheTtl: 0}});
  if (!res.ok) return {error: res.status};
  const data = await res.json();
  const seen = await env.SUBS.get("seen-modules", "json");
  const all = data.modules.map(m => m.chemin);
  // Premier passage : on considère comme déjà annoncés les modules ajoutés il y a plus de 2 jours,
  // pour ne pas rater un module publié juste avant la toute première vérification.
  const recent = m => m.ajoute && Date.now() - new Date(m.ajoute + "T00:00:00Z").getTime() < 2 * 864e5;
  const known = seen || data.modules.filter(m => !recent(m)).map(m => m.chemin);
  const fresh = data.modules.filter(m => !known.includes(m.chemin));
  const mat = Object.fromEntries((data.matieres || []).map(m => [m.id, m.nom]));
  const results = [];
  for (const m of fresh) {
    results.push(await broadcast(env, {
      title: `Nouveau en ${mat[m.matiere] || m.matiere} !`,
      body: `${m.titre} : ${m.resume}`,
      url: site + m.chemin,
      tag: "module-" + m.chemin
    }, fetchImpl));
  }
  if (fresh.length || !seen) await env.SUBS.put("seen-modules", JSON.stringify([...new Set([...known, ...all])]));
  return {fresh: fresh.map(m => m.chemin), results};
}

function cors(env, req){
  const origin = req.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
const json = (body, status, headers) => new Response(JSON.stringify(body), {status, headers: {...headers, "Content-Type": "application/json"}});

export default {
  async fetch(req, env){
    const h = cors(env, req), url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, {status: 204, headers: h});
    const origin = req.headers.get("Origin");
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim());
    if (req.method === "POST" && !allowed.includes(origin)) return json({error: "origine non autorisée"}, 403, h);

    try {
      if (req.method === "GET" && url.pathname === "/status") {
        const subs = await listSubs(env);
        const hosts = {};
        subs.forEach(s => { const host = new URL(s.subscription.endpoint).hostname; hosts[host] = (hosts[host] || 0) + 1; });
        return json({subscriptions: subs.length, byService: hosts, created: subs.map(s => s.created).sort(),
          seenModules: await env.SUBS.get("seen-modules", "json"), lastRuns: (await env.SUBS.get("runs", "json")) || []}, 200, h);
      }
      if (req.method === "GET" && url.pathname === "/vapid-public-key") {
        return json({key: (await getVapid(env)).publicKey}, 200, h);
      }
      if (req.method === "POST" && url.pathname === "/subscribe") {
        const {subscription} = await req.json();
        if (!validSubscription(subscription)) return json({error: "abonnement invalide"}, 400, h);
        const key = "sub:" + await sha256hex(subscription.endpoint);
        if (!(await env.SUBS.get(key))) {
          const count = (await env.SUBS.list({prefix: "sub:", limit: MAX_SUBS})).keys.length;
          if (count >= MAX_SUBS) return json({error: "trop d'abonnements"}, 429, h);
        }
        await env.SUBS.put(key, JSON.stringify({subscription, created: new Date().toISOString()}));
        return json({ok: true}, 200, h);
      }
      if (req.method === "POST" && url.pathname === "/unsubscribe") {
        const {endpoint} = await req.json();
        if (typeof endpoint !== "string") return json({error: "endpoint manquant"}, 400, h);
        await env.SUBS.delete("sub:" + await sha256hex(endpoint));
        return json({ok: true}, 200, h);
      }
      if (req.method === "POST" && url.pathname === "/test") {
        const {endpoint} = await req.json();
        const rec = typeof endpoint === "string" && await env.SUBS.get("sub:" + await sha256hex(endpoint), "json");
        if (!rec) return json({error: "tablette non abonnée"}, 404, h);
        const st = await sendPush(rec.subscription, {title: "Ça marche !", body: "Tu recevras ici les nouveaux modules de révision.", url: env.SITE_URL, tag: "test"}, await getVapid(env), env.VAPID_SUBJECT);
        if (st === 404 || st === 410) await env.SUBS.delete("sub:" + await sha256hex(endpoint));
        const runs = (await env.SUBS.get("runs", "json")) || [];
        await env.SUBS.put("runs", JSON.stringify([{at: new Date().toISOString(), test: st, service: new URL(endpoint).hostname}, ...runs].slice(0, 12)));
        return json({ok: st >= 200 && st < 300, status: st}, 200, h);
      }
      return json({error: "introuvable"}, 404, h);
    } catch (e) {
      return json({error: "erreur interne"}, 500, h);
    }
  },

  async scheduled(event, env, ctx){
    ctx.waitUntil((async () => {
      let reminders = {};
      try { reminders = JSON.parse(env.REMINDERS || "{}"); } catch (e) {}
      const r = reminders[event.cron];
      const run = {at: new Date().toISOString(), cron: event.cron};
      try {
        if (r) run.reminder = await broadcast(env, {title: r.title, body: r.body, url: r.url || env.SITE_URL, tag: "rappel"});
        if (event.cron === env.MODULES_CRON) run.modules = await checkNewModules(env);
      } catch (e) { run.error = String(e && e.message || e).slice(0, 200); }
      const runs = (await env.SUBS.get("runs", "json")) || [];
      await env.SUBS.put("runs", JSON.stringify([run, ...runs].slice(0, 12)));
    })());
  }
};
