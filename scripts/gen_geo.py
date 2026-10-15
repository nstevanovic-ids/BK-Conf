#!/usr/bin/env python3
"""
gen_geo.py — build portail/data/geo.json from the per-state GeoJSON files.

Inputs (portail/data/):
  - one <CODE>.geojson per territorial state (e.g. BA-01.geojson), each a
    FeatureCollection of its constituent municipalities;
  - one <CODE>.geojson per federal city / municipality (BG-91, SA-92, …);
  - the occupied-territory files;
  - etats.json (code <-> people mapping).
Context: Natural Earth 1:50m countries (neighbours) and 1:110m land (rest of
the globe seen from the satellite view of the map page).

Output: portail/data/geo.json, longitude / latitude geometries for d3-geo
  { v:2, q, states[], fed[], occupied[], land[], borders[], far[], pts{} }
  * states / fed / occupied / land : { …meta, g: polygons }
  * borders : land borders between neighbouring countries (lines)
  * far     : land of the rest of the visible globe (fill only)
  * pts     : label points of the federal units, [lon, lat]
  Coordinates are integers in 1/q degree, delta-encoded per ring
  ([x0, y0, dx1, dy1, …], ring implicitly closed). Rings follow the d3-geo
  winding: exterior clockwise, holes counter-clockwise.

All polygons form ONE coverage: they are projected together, cleaned with
shapely.coverage_clean (residual slivers merged, overlaps removed) and
simplified with shapely.coverage_simplify, which simplifies each shared border
once. Neighbouring entities therefore keep identical borders: no gap, no
overlap. The source contours must first be reconciled (scripts/raccord_contours.py).

    python scripts/raccord_contours.py   # only after changing a source contour
    python scripts/gen_geo.py
    python scripts/build_portail.py --inline
"""
import json, re, math, os, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "portail" / "data"
NE_BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
CACHE = Path(os.environ.get("TMPDIR", "/tmp"))

# Working plane: equirectangular around the member territory (1 unit ~ 1.4 km).
LON0, LON1 = 12.3, 29.8
LAT0, LAT1 = 39.8, 47.4
COSM = math.cos(math.radians((LAT0 + LAT1) / 2))
W = 1000.0
SX = W / ((LON1 - LON0) * COSM)

# Neighbouring (non-member) countries drawn at 1:50m. Member countries are NOT
# listed: their territory is covered by the state polygons.
CONTEXT = {
    "Albania", "Italy", "Austria", "Hungary", "Romania", "Greece", "Turkey",
    "Slovakia", "Moldova", "Ukraine", "Switzerland", "Germany", "Czechia",
    "Poland", "Cyprus", "Malta", "Tunisia", "Libya", "Belarus",
    "San Marino", "Vatican", "Liechtenstein",
}
NEAR_BOX = (3.0, 33.0, 42.0, 55.0)     # lon0, lat0, lon1, lat1 of the 1:50m layer
FAR_BOX = (-180.0, -60.0, 180.0, 85.0)  # 1:110m land: the rest of the globe (fill only)

# Label points (lon, lat) of the federal cities and municipalities.
SEATS = {
    "BG-91": (20.46, 44.81), "SA-92": (18.41, 43.86), "SF-93": (23.32, 42.70),
    "ZG-94": (15.98, 45.81), "BK-95": (18.81, 44.87), "MO-96": (17.81, 43.34),
}

# Occupied territories (hatched overlays) and the letters of their parent state.
OCCUPIED = {
    "KJ-16_Occupied-territories.geojson": "KJ",
    "KM-17_Occupied-territories.geojson": "KM",
    "Occupied_Beneska-Slovenija_GO-12.geojson": "GV",
}
# States with a non-numeric provisional code carry their own file name.
EXTRA = {"LV-LASVA.geojson": "LV", "SO-SOLI.geojson": "SO", "VB-VRHBOSNA.geojson": "VB"}

Q = 1000            # coordinates stored in 1/1000 degree (~80-110 m)
GAP_PX = 3.0        # coverage_clean : slivers narrower than this (~4 km) are merged
SIMPLIFY_PX = 0.35  # coverage_simplify tolerance, working-plane units (~0.5 km)
FAR_SIMPLIFY = 4.0  # 1:110m land, far from the territory
MIN_LAND_PX2 = 4    # context islands smaller than this are dropped


def natural_earth(name):
    """Natural Earth GeoJSON (cached in $TMPDIR; NE_<NAME> env var overrides)."""
    override = os.environ.get("NE_" + name.upper())
    cache = CACHE / f"{name}.geojson"
    if override and Path(override).exists():
        return json.loads(Path(override).read_text())
    if not cache.exists():
        print(f"Downloading Natural Earth {name} -> {cache}")
        last = None
        for _ in range(4):   # read fully and retry: some proxies truncate
            try:
                with urllib.request.urlopen(NE_BASE + name + ".geojson", timeout=120) as r:
                    data = r.read()
                if data.lstrip().startswith(b"{"):
                    cache.write_bytes(data)
                    break
            except Exception as e:  # noqa: BLE001
                last = e
        else:
            sys.exit(f"Could not fetch Natural Earth {name} ({last}).")
    return json.loads(cache.read_text())


def to_plane(a):
    import numpy as np
    return np.column_stack(((a[:, 0] - LON0) * COSM * SX, (LAT1 - a[:, 1]) * SX))


def to_lonlat(a):
    import numpy as np
    return np.column_stack((a[:, 0] / (COSM * SX) + LON0, LAT1 - a[:, 1] / SX))


def q_ring(coords, clockwise):
    """Quantised, delta-encoded ring with the d3-geo winding (None if degenerate)."""
    pts = []
    for x, y in coords:
        p = (round(x * Q), round(y * Q))
        if not pts or p != pts[-1]:
            pts.append(p)
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts.pop()
    if len(pts) < 3:
        return None
    area2 = sum(pts[k][0] * pts[k - 1][1] - pts[k - 1][0] * pts[k][1] for k in range(len(pts)))
    if area2 == 0:
        return None
    if (area2 < 0) != clockwise:   # area2 > 0 : counter-clockwise (y up)
        pts.reverse()
    flat = [pts[0][0], pts[0][1]]
    for (a, b), (c, d) in zip(pts, pts[1:]):
        flat += [c - a, d - b]
    return flat


def q_line(coords):
    pts = []
    for x, y in coords:
        p = (round(x * Q), round(y * Q))
        if not pts or p != pts[-1]:
            pts.append(p)
    if len(pts) < 2:
        return None
    flat = [pts[0][0], pts[0][1]]
    for (a, b), (c, d) in zip(pts, pts[1:]):
        flat += [c - a, d - b]
    return flat


def enc_polys(geom, min_px2=0.0, plane=None):
    """(Multi)polygon in lon/lat -> [[exterior, hole, …], …] encoded rings."""
    import shapely
    out = []
    parts = shapely.get_parts(geom)
    plane_parts = shapely.get_parts(plane) if plane is not None else [None] * len(parts)
    for poly, pp in zip(parts, plane_parts):
        if poly.geom_type != "Polygon" or poly.is_empty:
            continue
        if pp is not None and pp.area < min_px2:
            continue
        ext = q_ring(poly.exterior.coords, True)
        if not ext:
            continue
        out.append([ext] + [h for h in (q_ring(r.coords, False) for r in poly.interiors) if h])
    return out


def main():
    try:
        import numpy as np
        import shapely
        from shapely.geometry import box, shape
        from shapely.ops import unary_union
    except ImportError:
        sys.exit("shapely >= 2.1 and numpy are required: pip install shapely numpy")

    et = json.loads((DATA / "etats.json").read_text())
    by_k = {s["k"]: s for s in et}

    def dissolve(fp):
        fc = json.loads(fp.read_text())
        return unary_union([shape(f["geometry"]).buffer(0)
                            for f in fc["features"] if f.get("geometry")])

    # 1. Every cell of the coverage, in lon/lat: (layer, meta, geometry)
    cells = []
    for fp in sorted(DATA.glob("*.geojson")):
        m = re.match(r"^([A-Z]{2})-\d+\.geojson$", fp.name)
        k = m.group(1) if m else EXTRA.get(fp.name)
        st = by_k.get(k)
        if st and st["t"] == "T":
            cells.append(("states", {"c": st["c"], "k": st["k"], "p": st["p"]}, dissolve(fp)))
    for st in et:
        fp = DATA / f"{st['c']}.geojson"
        if st["t"] != "T" and fp.exists():
            cells.append(("fed", {"c": st["c"]}, dissolve(fp)))
    for fname, k in OCCUPIED.items():
        fp = DATA / fname
        if fp.exists() and k in by_k:
            cells.append(("occupied", {"parent": by_k[k]["c"]}, dissolve(fp)))
    members = unary_union([g for _, _, g in cells])
    near = box(*NEAR_BOX)
    ne = {}
    for f in natural_earth("ne_50m_admin_0_countries")["features"]:
        nm = f["properties"].get("ADMIN") or f["properties"].get("NAME")
        if nm in CONTEXT:
            g = shape(f["geometry"]).buffer(0).intersection(near)
            if not g.is_empty:
                ne[nm] = g
    land0 = len(cells)
    for nm, g in ne.items():
        cells.append(("land", {"n": nm}, g.difference(members).buffer(0)))
    # Natural Earth (1:50m) and the member contours do not meet exactly: the
    # gaps between them (e.g. along the Danube) go to the neighbouring country.
    core = box(LON0 - 1, LAT0 - 1, LON1 + 1, LAT1 + 1)
    allu = unary_union([g for _, _, g in cells])
    for ring in [r for p in shapely.get_parts(allu) for r in p.interiors]:
        hole = shapely.Polygon(ring)
        if not core.contains(hole):
            continue
        probe = hole.buffer(0.002)
        i = max(range(len(cells)), key=lambda k: (k >= land0,
                cells[k][2].boundary.intersection(probe).length))
        if cells[i][2].boundary.intersection(probe).length == 0:
            continue
        layer, meta, g = cells[i]
        cells[i] = (layer, meta, unary_union([g, hole]).buffer(0))

    # 2. Working plane: clean the coverage, simplify shared borders once
    geoms = shapely.transform(np.array([g for _, _, g in cells], dtype=object), to_plane)
    geoms = shapely.coverage_clean(geoms, gap_width=GAP_PX)
    geoms = shapely.coverage_simplify(geoms, SIMPLIFY_PX)
    geoms = shapely.make_valid(geoms)

    # 3. Control: no overlap between cells, no hole inside the territory
    core_px = shapely.transform(core, to_plane)
    all_px = shapely.union_all(geoms)
    holes = [h for p in shapely.get_parts(all_px) for h in p.interiors
             if shapely.Polygon(h).area > 0.05 and core_px.contains(shapely.Polygon(h))]
    tree = shapely.STRtree(geoms)
    overlap = 0.0
    for i, j in zip(*tree.query(geoms, predicate="intersects")):
        if i < j:
            overlap += shapely.area(shapely.intersection(geoms[i], geoms[j]))

    # 4. Layers. Under an occupied territory, the land of the country holding it.
    out = {"states": [], "fed": [], "occupied": [], "land": []}
    land_px = {}
    for (layer, meta, _), g in zip(cells, geoms):
        if layer == "land":
            land_px[meta["n"]] = g
        else:
            out[layer].append({**meta, "g": enc_polys(shapely.transform(g, to_lonlat))})
    for (layer, meta, g0), g in zip(cells, geoms):
        if layer == "occupied":
            host = max(ne, key=lambda n: ne[n].intersection(g0).area, default=None)
            if host and ne[host].intersection(g0).area > 0.5 * g0.area:
                land_px[host] = shapely.union(land_px[host], g)
    for n, g in land_px.items():
        enc = enc_polys(shapely.transform(g, to_lonlat), MIN_LAND_PX2, g)
        if enc:
            out["land"].append({"n": n, "g": enc})
    # Land borders between neighbouring countries (their outer edges are coast
    # or the edge of the 1:50m window, which must not be stroked).
    names = list(land_px)
    borders = []
    for a in range(len(names)):
        for b in range(a + 1, len(names)):
            ga, gb = land_px[names[a]], land_px[names[b]]
            if not ga.intersects(gb):
                continue
            line = shapely.line_merge(shapely.intersection(ga.boundary, gb.boundary))
            for part in shapely.get_parts(line):
                if part.geom_type == "LineString" and part.length > 1:
                    enc = q_line(shapely.transform(part, to_lonlat).coords)
                    if enc:
                        borders.append(enc)
    # Rest of the visible globe: 1:110m land, without the 1:50m window.
    far = []
    land110 = unary_union([shape(f["geometry"]).buffer(0)
                           for f in natural_earth("ne_110m_land")["features"]])
    far_geom = land110.intersection(box(*FAR_BOX))
    far_px = shapely.transform(far_geom, to_plane).simplify(FAR_SIMPLIFY)
    far = enc_polys(shapely.transform(far_px, to_lonlat), 8.0, far_px)

    res = {"v": 2, "q": Q, "states": out["states"], "fed": out["fed"],
           "occupied": out["occupied"], "land": out["land"], "borders": borders,
           "far": far, "pts": {c: [lon, lat] for c, (lon, lat) in SEATS.items()}}
    (DATA / "geo.json").write_text(json.dumps(res, ensure_ascii=False, separators=(",", ":")))
    kb = (DATA / "geo.json").stat().st_size / 1024
    print(f"geo.json: {len(res['states'])} states, {len(res['fed'])} federal polygons, "
          f"{len(res['occupied'])} occupied, {len(res['land'])} context countries, "
          f"{len(borders)} border lines, {kb:.1f} kB")
    print(f"control: {len(holes)} hole(s) inside the territory, overlaps {overlap:.3f} px²")
    return 0 if not holes and overlap < 1 else 1


if __name__ == "__main__":
    sys.exit(main())
