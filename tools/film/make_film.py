#!/usr/bin/env python3
"""Fabrique le film animé d'un module à partir d'une page HTML « film » (scènes + moteur d'animation).

  python3 tools/film/make_film.py tools/film/sources/<matiere>-<module>.html --preview DOSSIER
      → planche d'images (une par scène, en fin de scène) + images aux instants donnés par --at 12.5,40 …
  python3 tools/film/make_film.py tools/film/sources/<matiere>-<module>.html --out <matiere>/<module>/
      → <module>/film.mp4 (1280×720, 25 i/s, H.264 + AAC, faststart), <module>/film.jpg (affiche),
        et affiche les chapitres à recopier dans `video.chapters` du module.js.

La page doit exposer window.FILM = {render(t), TOTAL, events(), chapters()} (voir la source du système nerveux).
Pas de voix off : musique de fond douce synthétisée ici + petit « pop » à chaque étiquette qui apparaît."""
import asyncio, json, subprocess, sys, wave
from pathlib import Path

FPS, W, H, SR = 25, 1280, 720, 44100
args = sys.argv[1:]
if not args: sys.exit(__doc__)
SRC = Path(args[0]).resolve()
opt = lambda k: args[args.index(k) + 1] if k in args else None
URL = SRC.as_uri()

async def page(p):
    b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": W, "height": H})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(URL); await pg.wait_for_function("window.FILM", timeout=15000)
    if errs: sys.exit("Erreur JS dans la page : " + errs[0])
    return b, pg

async def meta():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b, pg = await page(p)
        m = await pg.evaluate("({T: FILM.TOTAL, ev: FILM.events(), ch: FILM.chapters(), sc: [...document.querySelectorAll('.sc')].map(s => [s.id, s._s, s._e])})")
        await b.close(); return m

async def preview(out, times):
    from playwright.async_api import async_playwright
    from PIL import Image
    out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b, pg = await page(p)
        m = await pg.evaluate("[...document.querySelectorAll('.sc')].map(s => s._e)")
        ts = times or [round(e - .6, 2) for e in m]
        ims = []
        for t in ts:
            await pg.evaluate(f"FILM.render({t})"); f = out / f"t{t:07.2f}.png"; await pg.screenshot(path=str(f))
            ims.append(Image.open(f).resize((640, 360)))
        await b.close()
    cols = 3; rows = (len(ims) + cols - 1) // cols; sheet = Image.new("RGB", (640 * cols, 360 * rows), "white")
    for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * 640, (i // cols) * 360))
    sheet.save(out / "planche.png"); print("planche :", out / "planche.png")

async def part(a, bnd, dst):
    from playwright.async_api import async_playwright
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", str(FPS), dst], stdin=subprocess.PIPE)
    async with async_playwright() as p:
        b, pg = await page(p)
        for f in range(a, bnd):
            await pg.evaluate(f"FILM.render({f / FPS})"); ff.stdin.write(await pg.screenshot(type="jpeg", quality=93))
        await b.close()
    ff.stdin.close(); ff.wait()

def music(M, dst):
    import numpy as np
    T = M["T"]; n = int(T * SR); t = np.arange(n) / SR; mix = np.zeros((n, 2))
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    beat = 60 / 84; L = 8 * beat
    chords = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]]
    arps = [[72, 76, 79, 83], [69, 72, 76, 79], [65, 69, 72, 76], [67, 71, 74, 79]]
    k, start = 0, 0.0
    while start < T:
        ch = chords[k % 4]; s0 = int(start * SR); s1 = min(n, int((start + L + 1.5) * SR)); tt = np.arange(s1 - s0) / SR
        env = np.minimum(1, tt / 1.2) * np.clip((L + 1.5 - tt) / 1.5, 0, 1)
        pad = sum(np.sin(2 * np.pi * hz(m) * tt) + .5 * np.sin(2 * np.pi * hz(m) * 1.004 * tt + 1) for m in ch) * env * .028
        mix[s0:s1, 0] += pad; mix[s0:s1, 1] += pad * .95
        for i in range(16):
            ts = start + i * beat / 2
            if ts >= T: break
            m = arps[k % 4][[0, 1, 2, 3, 2, 1, 2, 3][i % 8]]; a0 = int(ts * SR); a1 = min(n, a0 + int(.9 * SR)); u = np.arange(a1 - a0) / SR
            pl = (np.sin(2 * np.pi * hz(m) * u) + .25 * np.sin(4 * np.pi * hz(m) * u)) * np.exp(-u * 5.5) * .05; pan = .5 + .25 * np.sin(i)
            mix[a0:a1, 0] += pl * (1 - pan) * 2; mix[a0:a1, 1] += pl * pan * 2
        b0 = int(start * SR); b1 = min(n, int((start + L) * SR)); u = np.arange(b1 - b0) / SR
        mix[b0:b1] += (np.sin(2 * np.pi * hz(ch[0] - 12) * u) * np.minimum(1, u / .3) * np.clip((L - u) / .5, 0, 1) * .05)[:, None]
        start += L; k += 1
    for e in M["ev"]:
        a0 = int(e * SR); a1 = min(n, a0 + int(.09 * SR)); u = np.arange(a1 - a0) / SR
        mix[a0:a1] += (np.sin(2 * np.pi * np.cumsum(700 + 900 * u / .09) / SR) * np.exp(-u * 45) * .16)[:, None]
    rng = np.random.default_rng(1)
    for _, s, _ in M["sc"][1:]:
        a0 = int((s - .35) * SR); a1 = min(n, a0 + int(.7 * SR)); u = np.arange(a1 - a0) / SR
        w = np.convolve(rng.standard_normal(a1 - a0), np.ones(40) / 40, "same"); mix[a0:a1] += (w * np.sin(np.pi * u / .7) ** 2 * .06)[:, None]
    mix *= (np.minimum(1, t / 2) * np.clip((T - t) / 4, 0, 1))[:, None]
    mix = np.tanh(mix * 1.2) * .7; mix /= np.max(np.abs(mix)) / .6
    w = wave.open(str(dst), "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes()); w.close()

def main():
    if "--part" in args:
        a, b, dst = int(args[args.index("--part") + 1]), int(args[args.index("--part") + 2]), args[args.index("--part") + 3]
        asyncio.run(part(a, b, dst)); return
    if opt("--preview"):
        at = [float(x) for x in opt("--at").split(",")] if opt("--at") else None
        asyncio.run(preview(Path(opt("--preview")), at)); return
    out = Path(opt("--out") or sys.exit("--out <matiere>/<module>/ ou --preview DOSSIER"))
    tmp = Path("/tmp/film-" + SRC.stem); tmp.mkdir(exist_ok=True)
    M = asyncio.run(meta()); N = int(M["T"] * FPS); h = N // 2
    print(f"{M['T']} s, {N} images, {len(M['sc'])} scènes — rendu en 2 morceaux…", flush=True)
    procs = [subprocess.Popen([sys.executable, __file__, str(SRC), "--part", str(a), str(b), str(tmp / f"p{i}.mp4")]) for i, (a, b) in enumerate([(0, h), (h, N)])]
    music(M, tmp / "music.wav")
    if any(p.wait() for p in procs): sys.exit("le rendu a échoué")
    (tmp / "list.txt").write_text(f"file '{tmp / 'p0.mp4'}'\nfile '{tmp / 'p1.mp4'}'\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(tmp / "list.txt"), "-i", str(tmp / "music.wav"),
        "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", str(out / "film.mp4")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "6", "-i", str(out / "film.mp4"), "-frames:v", "1", "-q:v", "4", str(out / "film.jpg")], check=True)
    mm = lambda s: f"{int(s) // 60}:{int(s) % 60:02d}"
    print(f"✓ {out / 'film.mp4'} ({(out / 'film.mp4').stat().st_size / 1e6:.1f} Mo, {mm(M['T'])})")
    print("chapters: " + json.dumps([[round(s), n] for s, n in M["ch"]], ensure_ascii=False))

main()
