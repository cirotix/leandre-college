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
    try {
      const data = await (await fetch("modules.json", {cache: "no-store"})).json();
      await cache.addAll(data.modules.flatMap(m => [m.chemin, m.chemin + "module.js"])).catch(() => {});
    } catch (e) {}
    self.skipWaiting();
  })());
});

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
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (e) {
      return (await cache.match(req, {ignoreSearch: true})) || (req.mode === "navigate" && await cache.match("./")) || Response.error();
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
