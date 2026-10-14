#!/usr/bin/env python3
"""
gen_geo.py — build portail/data/geo.json from the per-state GeoJSON files.

Inputs (portail/data/):
  - one <CODE>.geojson per territorial state (e.g. BA-01.geojson), each a
    FeatureCollection of its constituent municipalities;
  - one <CODE>.geojson per federal city / municipality (BG-91, SA-92, …);
  - the occupied-territory files;
  - etats.json (code <-> people mapping).

Output:
  - portail/data/geo.json : { w, h, land[], states[], fed[], occupied[], pts{} }
    * land     : neighbouring-country outlines (context), from Natural Earth
    * states   : one dissolved, pre-projected SVG path per state
    * fed      : same for the federal cities and municipalities
    * occupied : hatched overlays, tied to their parent state
    * pts      : projected label points of the federal units

All layers form ONE coverage: they are projected together, cleaned with
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
NE_URL = ("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
          "master/geojson/ne_50m_admin_0_countries.geojson")
NE_CACHE = Path(os.environ.get("TMPDIR", "/tmp")) / "ne_50m_admin_0_countries.geojson"

# Projection window over the Balkans (lon/lat) and target SVG width.
LON0, LON1 = 12.3, 29.8
LAT0, LAT1 = 39.8, 47.4
COSM = math.cos(math.radians((LAT0 + LAT1) / 2))
W = 1000.0
SX = W / ((LON1 - LON0) * COSM)
H = (LAT1 - LAT0) * SX

# Neighbouring (non-member) countries drawn as light context behind the states.
# Member countries are NOT listed here: their territory is covered by the state
# polygons, so including their outlines would double the borders.
CONTEXT = {
    "Albania", "Italy", "Austria", "Hungary", "Romania", "Greece", "Turkey",
    "Slovakia", "Moldova", "Ukraine",
}

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

GAP_PX = 3.0       # coverage_clean : slivers narrower than this (~4 km) are merged
SIMPLIFY_PX = 0.9  # coverage_simplify tolerance (projected pixels)
MIN_LAND_PX2 = 6   # context islands smaller than this are dropped


def proj(lon, lat):
    return ((lon - LON0) * COSM * SX, (LAT1 - lat) * SX)


def xy_path(coords):
    pts, last = [], None
    for x, y in coords:
        p = (round(x, 1), round(y, 1))
        if p != last:
            pts.append(p)
            last = p
    if len(pts) < 4:
        return ""
    return "M" + " ".join(f"{x:g},{y:g}" for x, y in pts[:-1]) + "Z"


def proj_path(geom, min_px2=0.0):
    """SVG path of an already projected (multi)polygon; rings oriented so that
    holes stay empty with the default nonzero fill rule."""
    import shapely
    from shapely.geometry.polygon import orient
    paths = []
    for poly in shapely.get_parts(geom):
        if poly.geom_type != "Polygon" or poly.is_empty or poly.area < min_px2:
            continue
        poly = orient(poly, 1.0)
        rings = [xy_path(poly.exterior.coords)] + [xy_path(r.coords) for r in poly.interiors]
        paths += [r for r in rings if r]
    return " ".join(paths)


def context_countries():
    """Neighbouring countries from Natural Earth 50m, clipped to the window."""
    from shapely.geometry import box, shape
    override = os.environ.get("NE_GEOJSON")
    if override and Path(override).exists():
        NE_CACHE.write_bytes(Path(override).read_bytes())
    if not NE_CACHE.exists():
        print(f"Downloading Natural Earth countries -> {NE_CACHE}")
        # Read fully and retry: some proxies truncate urlretrieve().
        last = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(NE_URL, timeout=60) as r:
                    data = r.read()
                if data and data.lstrip().startswith(b"{"):
                    NE_CACHE.write_bytes(data)
                    break
            except Exception as e:  # noqa: BLE001
                last = e
        else:
            sys.exit(f"Could not fetch Natural Earth data ({last}). "
                     f"Set NE_GEOJSON=/path/to/ne_50m_admin_0_countries.geojson")
    ne = json.loads(NE_CACHE.read_text())
    win = box(LON0 - 1, LAT0 - 1, LON1 + 1, LAT1 + 1)
    out = {}
    for f in ne["features"]:
        nm = f["properties"].get("ADMIN") or f["properties"].get("NAME")
        if nm in CONTEXT:
            g = shape(f["geometry"]).buffer(0).intersection(win)
            if not g.is_empty:
                out[nm] = g
    return out


def main():
    try:
        import numpy as np
        import shapely
        from shapely.geometry import shape
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
    ne = context_countries()
    land0 = len(cells)
    for nm, g in ne.items():
        cells.append(("land", {"n": nm}, g.difference(members).buffer(0)))
    # Natural Earth (1:50m) and the member contours do not meet exactly: the
    # gaps between them (e.g. along the Danube) go to the neighbouring country.
    allu = unary_union([g for _, _, g in cells])
    for ring in [r for p in shapely.get_parts(allu) for r in p.interiors]:
        hole = shapely.Polygon(ring)
        probe = hole.buffer(0.002)
        i = max(range(len(cells)), key=lambda k: (k >= land0,
                cells[k][2].boundary.intersection(probe).length))
        if cells[i][2].boundary.intersection(probe).length == 0:
            continue
        layer, meta, g = cells[i]
        cells[i] = (layer, meta, unary_union([g, hole]).buffer(0))

    # 2. Project, clean the coverage, simplify shared borders once
    def to_px(a):
        return np.column_stack(((a[:, 0] - LON0) * COSM * SX, (LAT1 - a[:, 1]) * SX))
    geoms = shapely.transform(np.array([g for _, _, g in cells], dtype=object), to_px)
    geoms = shapely.coverage_clean(geoms, gap_width=GAP_PX)
    geoms = shapely.coverage_simplify(geoms, SIMPLIFY_PX)
    geoms = shapely.make_valid(geoms)

    # 3. Control: no overlap between cells, no hole inside the land mass
    all_px = shapely.union_all(geoms)
    holes = [h for p in shapely.get_parts(all_px) for h in p.interiors
             if shapely.Polygon(h).area > 0.05]
    tree = shapely.STRtree(geoms)
    overlap = 0.0
    for i, j in zip(*tree.query(geoms, predicate="intersects")):
        if i < j:
            overlap += shapely.area(shapely.intersection(geoms[i], geoms[j]))

    # 4. Layers. Under an occupied territory, the land of the country holding it.
    out = {"states": [], "fed": [], "occupied": []}
    land_px = {}
    for (layer, meta, _), g in zip(cells, geoms):
        if layer == "land":
            land_px[meta["n"]] = g
        else:
            out[layer].append({**meta, "d": proj_path(g)})
    for (layer, meta, g0), g in zip(cells, geoms):
        if layer == "occupied":
            host = max(ne, key=lambda n: ne[n].intersection(g0).area, default=None)
            if host and ne[host].intersection(g0).area > 0.5 * g0.area:
                land_px[host] = shapely.union(land_px[host], g)
    land = [{"n": n, "d": proj_path(g, MIN_LAND_PX2)} for n, g in land_px.items()]
    pts = {c: [round(proj(lon, lat)[0], 1), round(proj(lon, lat)[1], 1)]
           for c, (lon, lat) in SEATS.items()}

    res = {"w": round(W, 1), "h": round(H, 1), "land": [l for l in land if l["d"]],
           "states": out["states"], "fed": out["fed"], "occupied": out["occupied"], "pts": pts}
    (DATA / "geo.json").write_text(json.dumps(res, ensure_ascii=False, separators=(",", ":")))
    kb = (DATA / "geo.json").stat().st_size / 1024
    print(f"geo.json: {len(res['states'])} states, {len(res['fed'])} federal polygons, "
          f"{len(res['occupied'])} occupied, {len(res['land'])} context countries, {kb:.1f} kB")
    print(f"control: {len(holes)} hole(s) inside the territory, overlaps {overlap:.3f} px²")
    return 0 if not holes and overlap < 1 else 1


if __name__ == "__main__":
    sys.exit(main())
