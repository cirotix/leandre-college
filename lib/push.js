/* Accueil : enregistrement du service worker et abonnement aux notifications des nouveautés.
   L'adresse du worker Cloudflare est dans push.json ({"api": "https://…workers.dev"}) ; vide = bloc caché. */
(async () => {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  let reg;
  try { reg = await navigator.serviceWorker.register("sw.js"); } catch (e) { return; }

  const box = document.getElementById("push");
  if (!box) return;
  let api = "";
  try { api = ((await (await fetch("push.json", {cache: "no-cache"})).json()).api || "").replace(/\/$/, ""); } catch (e) {}
  if (!api) return;

  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const supported = "PushManager" in window && "Notification" in window;
  const b64 = s => { const p = (s + "===".slice((s.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/"), r = atob(p); return Uint8Array.from(r, c => c.charCodeAt(0)); };
  const post = (path, body) => fetch(api + path, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)});

  function show(html){ box.hidden = false; box.innerHTML = `<p class="label">Notifications</p>${html}<p class="pmsg" id="pmsg" aria-live="polite"></p>`; }
  const msg = t => { const m = document.getElementById("pmsg"); if (m) m.textContent = t; };

  async function render(){
    if (!supported) {
      if (ios && !standalone) show(`<p class="d">Pour être prévenu quand un nouveau module arrive, ajoute d'abord le site à l'écran d'accueil (Partager → « Sur l'écran d'accueil »), puis ouvre-le depuis l'icône.</p>`);
      return;
    }
    if (Notification.permission === "denied") {
      show(`<p class="d">Les notifications sont bloquées. Pour les réactiver : Réglages de la tablette → Notifications → Révisions.</p>`);
      return;
    }
    const sub = await reg.pushManager.getSubscription();
    if (sub) show(`<p class="d"><b>Activées ✓</b> Tu seras prévenu à chaque nouveau module.</p>
      <div class="pbtns"><button class="chip" type="button" data-push="test">Envoyer un test</button><button class="chip" type="button" data-push="off">Désactiver</button></div>`);
    else show(`<p class="d">Sois prévenu dès qu'un nouveau module de révision arrive.</p>
      <div class="pbtns"><button class="chip on" type="button" data-push="on">Recevoir les nouveautés</button></div>`);
  }

  box.addEventListener("click", async e => {
    const b = e.target.closest("[data-push]");
    if (!b) return;
    b.disabled = true;
    try {
      if (b.dataset.push === "on") {
        const perm = await Notification.requestPermission();   // doit partir du geste : pas d'await avant
        if (perm !== "granted") { await render(); return; }
        const {key} = await (await fetch(api + "/vapid-public-key")).json();
        const sub = await reg.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: b64(key)});
        const r = await post("/subscribe", {subscription: sub.toJSON()});
        if (!r.ok) throw new Error("abonnement refusé (" + r.status + ")");
        await render(); msg("C'est fait !");
      } else if (b.dataset.push === "off") {
        const sub = await reg.pushManager.getSubscription();
        if (sub) { await post("/unsubscribe", {endpoint: sub.endpoint}).catch(() => {}); await sub.unsubscribe(); }
        await render(); msg("Notifications désactivées.");
      } else if (b.dataset.push === "test") {
        const sub = await reg.pushManager.getSubscription();
        const r = sub && await (await post("/test", {endpoint: sub.endpoint})).json();
        msg(r && r.ok ? "Test envoyé : la notification arrive dans quelques secondes." : "Le test n'est pas passé. Désactive puis réactive les notifications.");
        b.disabled = false;
      }
    } catch (err) {
      msg("Impossible pour le moment : " + (err && err.message || err) + ". Réessaie plus tard.");
      b.disabled = false;
    }
  });
  render();
})();
