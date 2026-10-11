/* Web Push sans dépendance (WebCrypto uniquement) :
   - chiffrement du message, RFC 8291 (aes128gcm, RFC 8188)
   - signature VAPID, RFC 8292 (JWT ES256) */

const enc = new TextEncoder();

export const b64u = {
  encode(buf){
    const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  decode(str){
    const s = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
    const bin = atob(s), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
};

const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};

async function hmac(key, data){
  const k = await crypto.subtle.importKey("raw", key, {name: "HMAC", hash: "SHA-256"}, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

/* ---------- clés VAPID ---------- */
export async function generateVapidKeys(){
  const kp = await crypto.subtle.generateKey({name: "ECDSA", namedCurve: "P-256"}, true, ["sign", "verify"]);
  const privateJwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
  const publicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  return {privateJwk, publicKey: b64u.encode(publicRaw)};
}

async function vapidAuthorization(endpoint, vapid, subject){
  const aud = new URL(endpoint).origin;
  const header = b64u.encode(enc.encode(JSON.stringify({typ: "JWT", alg: "ES256"})));
  const claims = b64u.encode(enc.encode(JSON.stringify({aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject})));
  const key = await crypto.subtle.importKey("jwk", vapid.privateJwk, {name: "ECDSA", namedCurve: "P-256"}, false, ["sign"]);
  // WebCrypto renvoie déjà la signature au format r||s attendu par JWT
  const sig = new Uint8Array(await crypto.subtle.sign({name: "ECDSA", hash: "SHA-256"}, key, enc.encode(`${header}.${claims}`)));
  return `vapid t=${header}.${claims}.${b64u.encode(sig)}, k=${vapid.publicKey}`;
}

/* ---------- chiffrement du message ---------- */
export async function encryptPayload(subscription, plaintext){
  const uaPublic = b64u.decode(subscription.keys.p256dh);
  const authSecret = b64u.decode(subscription.keys.auth);
  if (uaPublic.length !== 65 || authSecret.length !== 16) throw new Error("clés d'abonnement invalides");

  const local = await crypto.subtle.generateKey({name: "ECDH", namedCurve: "P-256"}, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, {name: "ECDH", namedCurve: "P-256"}, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({name: "ECDH", public: uaKey}, local.privateKey, 256));

  // RFC 8291 §3.4
  const prkKey = await hmac(authSecret, ecdhSecret);
  const keyInfo = concat(enc.encode("WebPush: info\0"), uaPublic, asPublic, new Uint8Array([1]));
  const ikm = await hmac(prkKey, keyInfo);

  // RFC 8188 §2.2-2.3
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, concat(enc.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, concat(enc.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);

  const data = typeof plaintext === "string" ? enc.encode(plaintext) : plaintext;
  if (data.length > 3800) throw new Error("message trop long");
  const padded = concat(data, new Uint8Array([2])); // délimiteur du dernier (unique) enregistrement
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({name: "AES-GCM", iv: nonce}, aes, padded));

  const rs = new Uint8Array(4); new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}

/* Envoie une notification. Renvoie le code HTTP du service de push (201 = accepté, 404/410 = abonnement mort). */
export async function sendPush(subscription, payload, vapid, subject, {ttl = 86400, urgency = "normal", fetchImpl = fetch} = {}){
  const body = await encryptPayload(subscription, JSON.stringify(payload));
  const res = await fetchImpl(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": String(ttl),
      "Urgency": urgency,
      "Authorization": await vapidAuthorization(subscription.endpoint, vapid, subject)
    },
    body
  });
  return res.status;
}
