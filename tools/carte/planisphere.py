#!/usr/bin/env python3
"""Fabrique lib/planisphere.js : le fond de carte vierge (pays, projection de Miller) des croquis de géographie.

Source : countries.geo.json de https://github.com/johan/world.geo.json (frontières Natural Earth 1:110m, domaine public).
    git clone --depth 1 https://github.com/johan/world.geo.json /tmp/world
    python3 tools/carte/planisphere.py /tmp/world/countries.geo.json

Sortie : Revision.planisphere = {w, h, d, proj(lon, lat) -> [x, y]} (le chemin SVG de tous les pays, Antarctique exclu).
"""
import json, math, sys
from pathlib import Path

W = 1000                    # largeur du viewBox ; la hauteur découle de la projection
LAT_N, LAT_S = 80, -56      # cadrage, comme le fond de carte du cahier
K = W / (2 * math.pi)
miller = lambda lat: 1.25 * math.log(math.tan(math.pi / 4 + 0.4 * math.radians(lat)))
Y0 = miller(LAT_N)
H = round((Y0 - miller(LAT_S)) * K)

def proj(lon, lat):
    lat = max(min(lat, LAT_N + 4), LAT_S - 4)
    return ((lon + 180) / 360 * W, (Y0 - miller(lat)) * K)

def dp(pts, tol):
    """Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy) or 1e-9
    best, idx = 0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / n if n > 1e-9 else math.hypot(x - x1, y - y1)
        if d > best:
            best, idx = d, i
    if best <= tol:
        return [pts[0], pts[-1]]
    return dp(pts[:idx + 1], tol)[:-1] + dp(pts[idx:], tol)

def area(p):
    return abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) / 2

def ring(coords):
    pts = [proj(lon, lat) for lon, lat in coords]
    if area(pts) < 2.5:            # îlots invisibles à cette échelle
        return ""
    s = dp(pts, 0.45)
    if len(s) < 4:
        return ""
    out = [f"{round(s[0][0], 1):g} {round(s[0][1], 1):g}"]
    px, py = round(s[0][0], 1), round(s[0][1], 1)
    for x, y in s[1:-1]:
        x, y = round(x, 1), round(y, 1)
        out.append(f"{round(x - px, 1):g} {round(y - py, 1):g}")
        px, py = x, y
    return "M" + out[0] + "l" + " ".join(out[1:]) + "z"

src = json.loads(Path(sys.argv[1]).read_text(encoding="utf8"))
parts = []
for f in src["features"]:
    if f["id"] in ("ATA", "ATF"):
        continue
    g = f["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    for poly in polys:
        r = ring(poly[0])
        if r:
            parts.append(r)
d = "".join(parts).replace(" -", "-")

out = Path(__file__).resolve().parent.parent.parent / "lib" / "planisphere.js"
out.write_text(f"""/* Fond de carte vierge des croquis (planisphère, projection de Miller, de {LAT_S}° à {LAT_N}° de latitude).
   Fabriqué par tools/carte/planisphere.py à partir des frontières Natural Earth 1:110m (domaine public). Ne pas modifier à la main.
   Chargé à la demande par lib/revision.js quand un module a un croquis. */
(() => {{
"use strict";
const W = {W}, H = {H}, K = W / (2 * Math.PI), m = lat => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * Math.PI / 180)), Y0 = m({LAT_N});
(window.Revision = window.Revision || {{}}).planisphere = {{
  w: W, h: H,
  proj: (lon, lat) => [(lon + 180) / 360 * W, (Y0 - m(Math.max(Math.min(lat, {LAT_N + 4}), {LAT_S - 4}))) * K],
  d: "{d}"
}};
}})();
""", encoding="utf8")
print(f"{out} : {len(parts)} contours, {len(d) // 1024} Ko, viewBox 0 0 {W} {H}")
