#!/usr/bin/env python3
"""
gen_geo.py — build portail/data/geo.json from the per-state GeoJSON files.

Inputs (portail/data/):
  - one <CODE>.geojson per territorial state (e.g. BA-01.geojson), each a
    FeatureCollection of its constituent GADM municipalities.
  - etats.json (for the code <-> people mapping and seat list).

Output:
  - portail/data/geo.json : { w, h, land[], states[], pts{} }
    * land   : neighbouring-country outlines (context), from Natural Earth
    * states : one dissolved + simplified, pre-projected SVG path per state
    * pts    : projected seat coordinates (for federal-city / municipality markers)

Everything is projected with the SAME equirectangular transform so the layers
align. Run after adding or updating any state GeoJSON, then rebuild the portal.

    python scripts/gen_geo.py
    python scripts/build_portail.py --inline
"""
import json, glob, re, math, os, sys, urllib.request
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

# Neighbouring countries kept as light context behind the states.
CONTEXT = {
    "Slovenia", "Croatia", "Bosnia and Herzegovina", "Serbia", "Montenegro",
    "Kosovo", "North Macedonia", "Albania", "Bulgaria", "Italy", "Austria",
    "Hungary", "Romania", "Greece", "Turkey", "Slovakia", "Moldova", "Ukraine",
}

# Real seat coordinates (lon, lat) for every state, including the federal
# cities and municipalities that have no territorial polygon.
SEATS = {
    "BA-01": (17.19, 44.77), "BC-02": (19.85, 45.25), "BN-03": (20.39, 45.38),
    "BR-04": (18.61, 45.77), "BS-05": (17.66, 44.23), "BZ-06": (15.87, 44.81),
    "CG-07": (19.26, 42.44), "CM-08": (27.91, 43.21), "DA-09": (16.44, 43.51),
    "DJ-10": (27.83, 43.57), "DR-11": (18.09, 42.65), "GV-12": (13.65, 45.96),
    "HZ-13": (17.59, 43.38), "HI-14": (18.34, 42.71), "IS-15": (13.85, 44.87),
    "KJ-16": (15.08, 46.51), "KM-17": (21.16, 42.66), "KR-18": (14.51, 46.05),
    "KV-19": (14.44, 45.33), "LG-20": (26.52, 43.53), "LK-21": (15.37, 44.55),
    "MI-22": (25.97, 43.85), "MZ-23": (24.62, 43.42), "PI-24": (19.29, 43.78),
    "PM-25": (16.17, 46.66), "PO-26": (20.93, 44.66), "PR-27": (23.09, 42.02),
    "PZ-28": (19.22, 44.76), "RO-29": (24.75, 42.14), "RS-30": (20.51, 43.14),
    "SI-31": (19.61, 44.98), "SL-32": (18.69, 45.55), "SP-33": (23.03, 42.61),
    "ST-34": (15.65, 46.55), "SU-35": (20.92, 44.01), "SX-36": (26.32, 42.68),
    "SZ-37": (18.99, 45.35), "TK-38": (22.28, 43.90), "TL-39": (22.59, 43.15),
    "TR-40": (25.64, 42.43), "VI-41": (22.20, 41.74), "VZ-42": (20.97, 42.01),
    "ZA-43": (15.87, 46.16),
    "BG-91": (20.46, 44.81), "SA-92": (18.41, 43.86), "SF-93": (23.32, 23.32),
    "ZG-94": (15.98, 45.81), "BK-95": (18.81, 44.87), "MO-96": (17.81, 43.34),
}
SEATS["SF-93"] = (23.32, 42.70)  # correct Sofia latitude


def proj(lon, lat):
    return ((lon - LON0) * COSM * SX, (LAT1 - lat) * SX)


def ring_path(coords):
    return "M" + " ".join(
        f"{proj(x, y)[0]:.1f},{proj(x, y)[1]:.1f}" for x, y in coords) + "Z"


def geom_path(geom):
    paths = []
    polys = list(geom.geoms) if geom.geom_type == "MultiPolygon" else [geom]
    for poly in polys:
        if poly.is_empty:
            continue
        paths.append(ring_path(poly.exterior.coords))
        for inr in poly.interiors:
            paths.append(ring_path(inr.coords))
    return " ".join(paths)


def context_land():
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
    land = []
    for f in ne["features"]:
        nm = f["properties"].get("ADMIN") or f["properties"].get("NAME")
        if nm not in CONTEXT:
            continue
        g = f["geometry"]
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        parts = []
        for poly in polys:
            for ring in poly:
                pr = [proj(x, y) for x, y in ring]
                area = abs(sum(pr[i][0] * pr[i + 1][1] - pr[i + 1][0] * pr[i][1]
                               for i in range(len(pr) - 1))) / 2
                if area < 6:
                    continue
                pts, last = [], None
                for lon, lat in ring:
                    x, y = proj(lon, lat)
                    p = (round(x, 1), round(y, 1))
                    if p != last:
                        pts.append(p)
                        last = p
                if len(pts) >= 3:
                    parts.append("M" + " ".join(f"{x},{y}" for x, y in pts) + "Z")
        if parts:
            land.append({"n": nm, "d": " ".join(parts)})
    return land


def main():
    try:
        from shapely.geometry import shape
        from shapely.ops import unary_union
    except ImportError:
        sys.exit("shapely is required: pip install shapely")

    et = json.loads((DATA / "etats.json").read_text())
    by_k = {s["k"]: s for s in et}

    def dissolve(fp):
        fc = json.loads(fp.read_text())
        geoms = [shape(f["geometry"]).buffer(0)
                 for f in fc["features"] if f.get("geometry")]
        return unary_union(geoms).simplify(0.008, preserve_topology=True)

    # Occupied territories: hatched overlays tied to their parent state.
    OCCUPIED = {
        "KJ-16_Occupied-territories.geojson": "KJ-16",
        "KM-17_Occupied-territories.geojson": "KM-17",
        "Occupied_Beneska-Slovenija_GO-12.geojson": "GV-12",
    }

    states = []
    for fp in sorted(DATA.glob("*.geojson")):
        m = re.match(r"^([A-Z]{2})-\d+\.geojson$", fp.name)
        if not m or m.group(1) not in by_k:
            continue  # skip autonomous / occupied / special-zone files
        st = by_k[m.group(1)]
        states.append({"c": st["c"], "k": st["k"], "p": st["p"],
                       "d": geom_path(dissolve(fp))})

    occupied = []
    for fname, parent in OCCUPIED.items():
        fp = DATA / fname
        if fp.exists():
            occupied.append({"parent": parent, "d": geom_path(dissolve(fp))})

    pts = {c: [round(proj(lon, lat)[0], 1), round(proj(lon, lat)[1], 1)]
           for c, (lon, lat) in SEATS.items()}

    out = {"w": round(W, 1), "h": round(H, 1), "land": context_land(),
           "states": states, "occupied": occupied, "pts": pts}
    (DATA / "geo.json").write_text(
        json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    kb = (DATA / "geo.json").stat().st_size / 1024
    print(f"geo.json: {len(states)} states, {len(occupied)} occupied, "
          f"{len(out['land'])} context countries, {kb:.1f} kB")


if __name__ == "__main__":
    main()
