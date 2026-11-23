#!/usr/bin/env python3
"""
build_carte_marge.py — carte des 54 entités pour la marge du lecteur de la Constitution
(instruments des art. 1 bis, 1 ter et 103), générée, ne pas éditer.

Repris de proto/codex/build.py (build_map). Lit portail/data/geo.json (scripts/gen_geo.py), écrit
portail/data/constitution/map.json : un tracé SVG par entité, simplifié en couverture (les limites
communes restent communes : ni trou ni recouvrement), projection équirectangulaire au parallèle moyen,
largeur 1000 ; pour chaque entité, un point intérieur (étiquette) et son rectangle englobant.
Rien n'est dessiné à la main : les contours sont ceux de la carte du portail.

À relancer après scripts/gen_geo.py seulement (shapely ≥ 2.1 pour coverage_simplify).

Usage : python scripts/build_carte_marge.py
"""
import json
import math
import sys
from pathlib import Path

import shapely
from shapely.geometry import Polygon
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "portail" / "data" / "geo.json"
OUT = ROOT / "portail" / "data" / "constitution" / "map.json"
TOLERANCE = 0.02   # degrés ; 75 ko pour 54 entités, limites lisibles à 320 px de large


def shapes_of(geo):
    """geo.json v2 : anneaux lon/lat en entiers (1/q degré), codés en différences."""
    q = geo.get("q", 1000)

    def ring(a):
        x, y = a[0], a[1]
        r = [(x / q, y / q)]
        for i in range(2, len(a), 2):
            x += a[i]
            y += a[i + 1]
            r.append((x / q, y / q))
        return r
    shapes = {}
    for o in geo["states"] + geo["fed"]:
        polys = []
        for p in o["g"]:
            rr = [ring(a) for a in p]
            if len(rr[0]) >= 3:
                pg = Polygon(rr[0], [h for h in rr[1:] if len(h) >= 3])
                polys.append(pg if pg.is_valid else pg.buffer(0))
        shapes[o["c"]] = unary_union(polys)
    return shapes


def build_map(shapes):
    codes = sorted(shapes)
    geoms = [shapes[c] for c in codes]
    simp = list(shapely.coverage_simplify(geoms, TOLERANCE))
    x0 = min(g.bounds[0] for g in geoms)
    x1 = max(g.bounds[2] for g in geoms)
    y0 = min(g.bounds[1] for g in geoms)
    y1 = max(g.bounds[3] for g in geoms)
    kx = math.cos(math.radians((y0 + y1) / 2))
    sc = 1000 / ((x1 - x0) * kx)

    def P(x, y):
        return round((x - x0) * kx * sc, 1), round((y1 - y) * sc, 1)
    out = {}
    for c, g, full in zip(codes, simp, geoms):
        polys = list(g.geoms) if hasattr(g, "geoms") else [g]
        d = ""
        for pg in polys:
            for ring in [pg.exterior] + list(pg.interiors):
                pts = [P(x, y) for x, y in ring.coords]
                if len(pts) >= 4:
                    d += "M" + "L".join(f"{x:g},{y:g}" for x, y in pts[:-1]) + "Z"
        parts = list(full.geoms) if hasattr(full, "geoms") else [full]
        rp = max(parts, key=lambda p: p.area).representative_point()
        bx = [P(full.bounds[0], full.bounds[3]), P(full.bounds[2], full.bounds[1])]
        out[c] = {"d": d, "c": list(P(rp.x, rp.y)), "b": [bx[0][0], bx[0][1], bx[1][0], bx[1][1]]}
    return {"w": 1000, "h": round((y1 - y0) * sc, 1), "e": out}


def main() -> int:
    geo = json.loads(SRC.read_text(encoding="utf-8"))
    etats = {e["c"] for e in json.loads((ROOT / "portail" / "data" / "etats.json").read_text(encoding="utf-8"))}
    shapes = shapes_of(geo)
    if set(shapes) != etats:
        print(f"geo.json et etats.json divergent : {sorted(set(shapes) ^ etats)}", file=sys.stderr)
        return 1
    m = build_map(shapes)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(m, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Carte de marge → {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} ko, {len(m['e'])} entités)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
