/* Service worker du site : révisions disponibles hors connexion + réception des notifications.
   Stratégie « réseau d'abord » : une mise à jour du site est visible tout de suite quand on est connecté,
   et la dernière version vue reste utilisable sans réseau. */
const CACHE = "revisions-v2";
const CORE = ["./", "index.html", "modules.json", "manifest.webmanifest", "icon.svg", "icon-192.png", "apple-touch-icon.png",
  "lib/revision.css", "lib/revision.js", "lib/lesson.js", "lib/home.js", "lib/push.js", "lib/module.html"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE).catch(() => {});
    try { await cacheModules(cache, await (await fetch("modules.json", {cache: "no-store"})).json()); } catch (e) {}
    self.skipWaiting();
  })());
});

/* Met en cache les modules du catalogue qui n'y sont pas encore (appelé à l'installation et à chaque modules.json
   reçu du réseau) : un module ajouté après l'installation devient lui aussi disponible hors connexion. */
async function cacheModules(cache, data){
  const urls = (data.modules || []).flatMap(m => [m.chemin, m.chemin + "index.html", m.chemin + "module.js"]);
  const missing = [];
  for (const u of urls) if (!(await cache.match(u))) missing.push(u);
  await Promise.all(missing.map(u => cache.add(u).catch(() => {})));
}

/* Page affichée quand on ouvre hors connexion une page qui n'a jamais été mise en cache.
   (Avant : l'accueil était renvoyé à la place, et ses liens relatifs cassaient sous le chemin du module.) */
const OFFLINE = home => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Pas de connexion</title>
<style>body{font:17px/1.5 system-ui,-apple-system,sans-serif;max-width:32em;margin:12vh auto;padding:0 20px;color:#1b2340}
h1{color:#2340C4;font-size:1.6em}a,button{display:inline-block;margin:8px 10px 0 0;padding:10px 16px;border-radius:10px;
font:inherit;border:0;background:#2340C4;color:#fff;text-decoration:none}a{background:#e8ecfb;color:#2340C4}</style></head>
<body><h1>Pas de connexion</h1><p>Cette page n'a pas encore été enregistrée sur cet appareil : il faut l'ouvrir une
première fois avec Internet. Les modules déjà ouverts restent disponibles.</p>
<button onclick="location.reload()">Réessayer</button><a href="${home}">← Mes révisions</a></body></html>`;

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !fonts) return;
  // vidéos : laissées au navigateur (lecture par morceaux « Range », trop lourdes pour le cache hors connexion)
  if (sameOrigin && (req.headers.has("range") || /\.(mp4|m4v|webm|mov)$/i.test(url.pathname))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (fonts) { // les polices ne changent pas : cache d'abord
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    }
    try {
      const res = await fetch(req, {cache: "no-cache"});
      if (res.ok) {
        cache.put(req, res.clone());
        if (url.pathname.endsWith("/modules.json")) event.waitUntil(res.clone().json().then(d => cacheModules(cache, d)).catch(() => {}));
      }
      return res;
    } catch (e) {
      const hit = await cache.match(req, {ignoreSearch: true});
      if (hit) return hit;
      if (req.mode !== "navigate") return Response.error();
      const scope = new URL(self.registration.scope);
      if (url.pathname === scope.pathname) { const home = await cache.match("./"); if (home) return home; }
      return new Response(OFFLINE(scope.href), {headers: {"Content-Type": "text/html; charset=utf-8"}});
    }
  })());
});

self.addEventListener("push", event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = {body: event.data && event.data.text()}; }
  event.waitUntil(self.registration.showNotification(d.title || "Révisions", {
    body: d.body || "",
    tag: d.tag,
    icon: "icon-192.png",
    data: {url: d.url || self.registration.scope}
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({type: "window", includeUncontrolled: true});
    for (const w of wins) { if ("navigate" in w) { await w.focus(); return w.navigate(url); } }
    return self.clients.openWindow(url);
  })());
});
