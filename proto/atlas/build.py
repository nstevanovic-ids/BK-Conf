#!/usr/bin/env python3
"""
build.py — prototype « Atlas » : produit tout ce que proto/atlas/ charge.

Entrées (lecture seule) :
  portail/data/*.json, portail/data/*.geojson   source de vérité
  portail/fonts/*.woff2                         Arimo, Sofia Sans Extra Condensed
  portail/index.html                            emblème de l'en-tête (COA_DATA, #hdEmblem)
  scripts/build_stats.py                        correspondance fichier -> État (EXTRA, ASSIGN,
                                                ALIASES, SUBUNITS, level, norm) : importé, non copié
  scripts/gen_geo.py                            plan de travail (to_plane, to_lonlat)
  docs/data/population/*.csv (facultatif)       seulement pour rattacher à leur commune hôte les
                                                communes du recensement sans contour GADM
Sorties (dans proto/atlas/) :
  index.html            gabarit src/index.html + silhouette SVG de la Confédération + CSS critique
  data/core.json        54 entités, chiffres clés, classes des choroplèthes, points d'étiquette
  data/geo.json         copie de portail/data/geo.json (vue Confédération, aucune commune)
  data/mun/<CODE>.json  communes d'un État, simplifiées en couverture, chargées à la demande
  data/communes.json    index de la palette (communes -> État, contour hôte)
  data/places.json      « Constitution située » : lieux nommés par article, détectés par les données
  data/constitution*.json, data/ui.json (i18n + sous-ensemble de textes.json)
  data/flags/<CODE>.png, emblem.png, fonts/, vendor/
  strings-new.json      chaînes anglaises nouvelles (absentes de textes.json et i18n.json)

Outils : shapely >= 2.1 (GEOS >= 3.12), pyproj, numpy ; npm (maplibre-gl) dans $ATLAS_TOOLS
(défaut /tmp/atlas-tools, installé au besoin).

    python proto/atlas/build.py
    python -m http.server 8101 -d proto/atlas
"""
import base64
import gzip
import json
import math
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
DATA = ROOT / "portail" / "data"
OUT = HERE / "data"
TOOLS = Path(os.environ.get("ATLAS_TOOLS", "/tmp/atlas-tools"))

sys.dont_write_bytecode = True      # ne rien écrire dans scripts/
sys.path.insert(0, str(ROOT / "scripts"))
try:
    import numpy as np
    import shapely
    from shapely.geometry import shape, Point
    from pyproj import Geod
    import build_stats as BS      # correspondances fichier -> État, alias, niveaux GADM
    import gen_geo as GG          # plan de travail de la couverture
except ImportError as e:
    sys.exit(f"shapely >= 2.1, numpy et pyproj sont requis ({e})")

GEOD = Geod(ellps="WGS84")
QM = 10000              # communes : 1/10000 degré (~8-11 m)
GAP_PX = 0.4            # coverage_clean : interstices < ~0,55 km fusionnés
SIMPLIFY_PX = 0.06      # coverage_simplify : ~85 m
MAX_GZ = 250 * 1024     # budget par fichier de communes
NCLASS = 5


def jdump(obj, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return len(gzip.compress(path.read_bytes()))


def fold(s):
    s = s.replace("đ", "d").replace("Đ", "D")
    s = "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def area_km2(g):
    return abs(GEOD.geometry_area_perimeter(g)[0]) / 1e6


def label_point(g):
    """Centre du plus grand cercle inscrit dans la plus grande partie."""
    parts = [p for p in shapely.get_parts(g) if p.geom_type == "Polygon" and not p.is_empty]
    big = max(parts, key=lambda p: p.area)
    try:
        c = shapely.maximum_inscribed_circle(big, tolerance=0.002)
        x, y = shapely.get_coordinates(c)[0]
    except Exception:  # noqa: BLE001
        rp = big.representative_point()
        x, y = rp.x, rp.y
    return [round(float(x), 4), round(float(y), 4)]


def enc_ring(coords, q):
    pts = []
    for x, y in coords:
        p = (round(x * q), round(y * q))
        if not pts or p != pts[-1]:
            pts.append(p)
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts.pop()
    if len(pts) < 3:
        return None
    flat = [pts[0][0], pts[0][1]]
    for (a, b), (c, d) in zip(pts, pts[1:]):
        flat += [c - a, d - b]
    return flat


def enc_geom(g, q, min_area=0.0):
    out = []
    for poly in shapely.get_parts(g):
        if poly.geom_type != "Polygon" or poly.is_empty or poly.area < min_area:
            continue
        ext = enc_ring(poly.exterior.coords, q)
        if ext:
            out.append([ext] + [h for h in (enc_ring(r.coords, q) for r in poly.interiors) if h])
    return out


def dec_polys(g, q):
    """Anneaux codés de geo.json -> MultiPolygon shapely (lon/lat)."""
    polys = []
    for poly in g:
        rings = []
        for flat in poly:
            x, y = flat[0], flat[1]
            pts = [(x / q, y / q)]
            for i in range(2, len(flat), 2):
                x += flat[i]
                y += flat[i + 1]
                pts.append((x / q, y / q))
            rings.append(pts)
        polys.append(shapely.Polygon(rings[0], rings[1:]))
    return shapely.MultiPolygon(polys)


def breaks_of(values, n=NCLASS):
    """Seuils de quantiles arrondis à deux chiffres significatifs (n classes)."""
    v = sorted(values)
    out = []
    for i in range(1, n):
        x = v[min(len(v) - 1, round(i * len(v) / n))]
        if x > 0:
            m = 10 ** (math.floor(math.log10(x)) - 1)
            x = round(x / m) * m
        x = int(x) if x >= 10 else round(x, 1)
        if not out or x > out[-1]:
            out.append(x)
    return out


def klass(v, br):
    if v is None:
        return -1
    return sum(1 for b in br if v >= b)


# --------------------------------------------------------------------------- données de base
def load_base():
    et = json.loads((DATA / "etats.json").read_text(encoding="utf-8"))
    stats = json.loads((DATA / "stats.json").read_text(encoding="utf-8"))
    ops = json.loads((DATA / "opstine.json").read_text(encoding="utf-8"))["m"]
    lights = json.loads((DATA / "lights.json").read_text(encoding="utf-8"))
    lq = lights["q"]
    L = [(lights["p"][i] / lq, lights["p"][i + 1] / lq, lights["p"][i + 2])
         for i in range(0, len(lights["p"]), 3)]
    geo = json.loads((DATA / "geo.json").read_text(encoding="utf-8"))
    return et, stats, ops, L, geo


def census_pop():
    """(iso, nom du recensement) -> population ; ne sert qu'à départager des homonymes et à
    retrouver le contour hôte d'une commune sans unité GADM. {} si docs/ est absent."""
    try:
        t = BS.load_tables()
        return {(iso, k): v for iso, d in t.items() for k, v in d["pop"].items()}
    except Exception as e:  # noqa: BLE001
        print(f"  (recensements illisibles, rattachement dégradé : {e})")
        return {}


def read_units(et):
    """Unités GADM par État : même règle de correspondance que scripts/build_stats.py
    (lettres du nom de fichier, EXTRA, ASSIGN, doublons exacts). Le nom de fichier porte
    d'anciens numéros (LK-21.geojson = LK-20) : seules les lettres comptent, et la
    correspondance est vérifiée plus bas par le contenu (contour dans geo.json)."""
    by_k = {s["k"]: s for s in et}
    units, files = {}, {}
    for fp in sorted(DATA.glob("*.geojson")):
        m = re.match(r"^([A-Z]{2})-\d+\.geojson$", fp.name)
        k = m.group(1) if m else BS.EXTRA.get(fp.name)
        if not k or k not in by_k:
            continue
        st = by_k[k]
        if st["t"] != "T" and fp.name != st["c"] + ".geojson":
            continue
        files[st["c"]] = fp.name
        seen = set()
        for ft in json.loads(fp.read_text(encoding="utf-8"))["features"]:
            if not ft.get("geometry"):
                continue
            p = ft["properties"]
            gid = p.get("GID_" + BS.level(p))
            if st["t"] == "T" and BS.ASSIGN.get(gid, k) != k:
                continue
            g = shape(ft["geometry"]).buffer(0)
            rp = g.representative_point()
            key = (gid, round(rp.x, 4), round(rp.y, 4))
            if key in seen:
                continue
            seen.add(key)
            units.setdefault(st["c"], []).append({"p": p, "g": g})
    return units, files


def build_communes(et, stats, ops, L, geo):
    units, files = read_units(et)
    cpop = census_pop()
    by_c = {s["c"]: s for s in et}

    # Contrôle par le contenu : le point intérieur de chaque fichier tombe dans le contour
    # de l'État de geo.json auquel la règle des lettres l'attribue.
    gq = geo["q"]
    conf = {x["c"]: dec_polys(x["g"], gq) for x in geo["states"] + geo["fed"]}
    for code, lst in units.items():
        u = shapely.union_all([x["g"] for x in lst])
        inter = u.intersection(conf[code].buffer(0)).area / u.area
        if inter < 0.97:
            sys.exit(f"{files[code]} -> {code} : seulement {inter:.0%} du contenu dans le contour de geo.json")
    print(f"  {len(files)} fichiers d'État vérifiés par le contenu "
          f"(ex. {files['LK-20']} -> LK-20, {files['ZA-47']} -> ZA-47)")

    # Population : somme des lumières de lights.json situées dans le contour (une lumière par
    # commune comptée, posée au point intérieur de son unité GADM ou à son propre point).
    pts = shapely.points([(a, b) for a, b, _ in L])
    tree = shapely.STRtree(pts)
    owner = {}
    for code, lst in units.items():
        for i, u in enumerate(lst):
            u["pop"], u["lights"] = 0, []
            for j in tree.query(u["g"], predicate="intersects"):
                if j in owner:
                    sys.exit(f"lumière {L[j]} dans deux contours ({owner[j]}, {code})")
                owner[j] = (code, i)
                u["pop"] += L[j][2]
                u["lights"].append(int(j))
    if len(owner) != len(L):
        sys.exit(f"{len(L) - len(owner)} lumières hors de tout contour")
    for code, lst in units.items():
        tot = sum(u["pop"] for u in lst)
        if tot != stats[code]["population"]:
            sys.exit(f"{code} : {tot} hab. par les lumières, {stats[code]['population']} dans stats.json")
    print(f"  populations communales : {len(L)} lumières, somme par État identique à stats.json (54/54)")

    # Noms : opstine.json (forme v3, nom officiel, alias GADM), par État.
    rows_of = {}
    for r in ops:
        rows_of.setdefault(r[2], []).append(r)
    off = lambda r: r[3] or r[0]                                   # noqa: E731
    communes, host_of = {}, {}       # code -> [commune], (code, nom v3, iso) -> indice hôte
    n_frag = 0
    for code, lst in units.items():
        rows = rows_of.get(code, [])
        idx = {}
        for r in rows:
            for nm in {r[0], off(r), *[x for x in r[4:] if x]}:
                idx.setdefault(BS.norm(nm), []).append(r)
        fed = by_c[code]["t"] != "T"
        taken = set()
        out = []
        for u in lst:
            p = u["p"]
            nm = p.get("NAME_" + BS.level(p)) or ""
            hits = [r for r in idx.get(BS.norm(nm), []) if id(r) not in taken]
            if fed and len(lst) == 1:
                hits = [r for r in rows if BS.norm(r[0]) == BS.norm(by_c[code]["n"])] or \
                       [[by_c[code]["n"], "BKC", code, ""]]
                members = [r for r in rows if r is not hits[0]]
            else:
                members = []
                if len(hits) > 1:
                    exact = [r for r in hits if BS.norm(off(r)) == BS.norm(nm) or BS.norm(r[0]) == BS.norm(nm)]
                    same = [r for r in hits if cpop.get((r[1], off(r))) == u["pop"]]
                    if len(exact) == 1:
                        hits, members = exact, [r for r in hits if r is not exact[0]]
                    elif len(same) == 1:
                        hits = same
                    elif sum(cpop.get((r[1], off(r)), 0) for r in hits) != u["pop"] and cpop:
                        hits = hits[:1]
            if not hits:
                u["frag"] = True          # îlot, lac, polygone « Unknown » : contour seul
                u["rows"], u["members"] = [], []
                continue
            for r in hits + members:
                taken.add(id(r))
            u["rows"], u["members"] = hits, members
            out.append(u)
        # Communes d'opstine.json sans unité GADM propre : contour hôte (qui peut être un
        # fragment sans nom : il prend alors le nom des communes qu'il porte).
        gname_of = lambda u: BS.norm(u["p"].get("NAME_" + BS.level(u["p"])) or "")     # noqa: E731
        left = [r for r in rows if id(r) not in taken]
        for r in left:
            host, o = None, off(r)
            if len(lst) == 1:
                host = lst[0]
            elif r[1] == "BKC" and out:                           # nom de la ville-État : sa commune-centre
                host = max(out, key=lambda u: u["pop"])
            for gname, parts in BS.SUBUNITS.items():              # « Grad » à subdivisions
                if host is None and o in parts:
                    host = next((u for u in out if any(off(x) == gname for x in u["rows"] + u["members"])), None)
            if host is None:
                for gadm, names in BS.ALIASES.get(r[1], {}).items():
                    if o in names:
                        host = next((u for u in out if gname_of(u) == gadm.split("|")[0]), None)
                        if host:
                            break
            fb = BS.POINTS.get(r[1], {}).get(o)
            if host is None and isinstance(fb, str):              # repli de build_stats : commune d'origine
                host = next((u for u in out if gname_of(u) == BS.norm(fb)), None)
            if host is None and isinstance(fb, tuple):
                host = next((u for u in lst if u["g"].contains(Point(fb[1], fb[0]))), None)
            if host is None and (r[1], o) in cpop:                # lumière propre, même population
                cand = [u for u in lst for j in u["lights"] if L[j][2] == cpop[(r[1], o)]]
                if len({id(u) for u in cand}) == 1:
                    host = cand[0]
            if host is not None:
                host["members"].append(r)
                taken.add(id(r))
        for u in lst:
            if u.get("frag") and u["members"]:
                u["frag"] = False
                u["rows"], u["members"] = u["members"], []
                out.append(u)
            elif u.get("frag"):
                if u["pop"]:
                    nm = u["p"].get("NAME_" + BS.level(u["p"]))
                    sys.exit(f"{code} : unité « {nm} » peuplée mais sans commune identifiée")
                n_frag += 1
        communes[code] = out
        orphans = [r[0] for r in rows if id(r) not in taken]
        if orphans:
            print(f"  {code} : sans contour hôte identifié, renvoyées à l'État : {', '.join(orphans)}")
    n = sum(len(v) for v in communes.values())
    print(f"  {n} contours communaux nommés, {n_frag} fragments sans nom, "
          f"{sum(len(u['members']) for v in communes.values() for u in v)} communes rattachées à un contour hôte")
    return units, communes, conf


def simplify_coverage(units):
    """Une seule couverture pour toutes les communes : chaque limite partagée est simplifiée
    une fois, les États voisins gardent donc des bords identiques."""
    flat = [u for lst in units.values() for u in lst]
    geoms = shapely.transform(np.array([u["g"] for u in flat], dtype=object), GG.to_plane)
    geoms = shapely.coverage_clean(geoms, gap_width=GAP_PX)
    geoms = shapely.coverage_simplify(geoms, SIMPLIFY_PX)
    geoms = shapely.make_valid(geoms)
    for u, g in zip(flat, shapely.transform(geoms, GG.to_lonlat)):
        u["s"] = g


def write_mun(et, stats, units, communes):
    by_c = {s["c"]: s for s in et}
    allv = {"pop": [], "dens": []}
    for code, lst in communes.items():
        for u in lst:
            u["area"] = area_km2(u["g"])
            u["dens"] = u["pop"] / u["area"] if u["area"] > 0 else None
            if u["pop"]:
                allv["pop"].append(u["pop"])
                allv["dens"].append(u["dens"])
    mbr = {k: breaks_of(v) for k, v in allv.items()}
    sizes, index, seats, no_seat = {}, [], {}, []
    for s in et:
        code = s["c"]
        lst = sorted(communes.get(code, []), key=lambda u: -u["pop"])
        used = set()
        recs = []
        for rank, u in enumerate(lst):
            name = " · ".join(r[0] for r in u["rows"])
            slug = base = fold(name) or "x"
            k = 2
            while slug in used:
                slug = f"{base}-{k}"
                k += 1
            used.add(slug)
            u["slug"] = slug
            offn = " · ".join(r[3] for r in u["rows"] if r[3])
            rec = {"s": slug, "n": name, "p": u["pop"], "a": round(u["area"], 1),
                   "pt": label_point(u["s"]), "g": enc_geom(u["s"], QM)}
            if offn:
                rec["o"] = offn
            if u["members"]:
                rec["mb"] = sorted(r[0] for r in u["members"])
            recs.append(rec)
            for r in u["rows"]:
                index.append([r[0], code, slug, " ".join(x for x in r[3:] if x)])
            for r in u["members"]:
                index.append([r[0], code, slug, " ".join(x for x in r[3:] if x), 1])
        frags = [g for u in units.get(code, []) if u.get("frag") for g in enc_geom(u["s"], QM)]
        whole = shapely.union_all([u["s"] for u in units.get(code, [])])
        outline = [r for poly in enc_geom(whole, QM) for r in poly]
        if s["t"] == "T":
            ch = BS.norm(s["ch"])
            is_ch = lambda r: ch in {BS.norm(x) for x in r[:1] + r[3:] if isinstance(x, str) and x}   # noqa: E731
            seat = next((u for u in lst if any(is_ch(r) for r in u["rows"])), None) or \
                next((u for u in lst if any(is_ch(r) for r in u["members"])), None)
            if seat is None:      # chef-lieu qui n'est pas une commune de l'État dans les données
                no_seat.append(f"{code} {s['ch']}")
            else:
                seats[code] = seat["slug"]
        doc = {"c": code, "q": QM, "m": recs, "f": frags, "o": outline}
        sizes[code] = jdump(doc, OUT / "mun" / f"{code}.json")
        if sizes[code] > MAX_GZ:
            sys.exit(f"mun/{code}.json : {sizes[code]} octets gzip > budget {MAX_GZ}")
    # communes d'opstine.json sans contour hôte : renvoi à l'État
    known = {(r[0], r[1]) for r in index}
    for r in json.loads((DATA / "opstine.json").read_text(encoding="utf-8"))["m"]:
        if (r[0], r[2]) not in known:
            index.append([r[0], r[2], "", " ".join(x for x in r[3:] if x), 1])
    index.sort(key=lambda r: (fold(r[0]), r[1]))
    gz = jdump(index, OUT / "communes.json")
    if no_seat:
        print(f"  chefs-lieux sans commune homonyme dans leur État (non situés) : {', '.join(no_seat)}")
    top = sorted(sizes.items(), key=lambda kv: -kv[1])[:3]
    print(f"  data/mun/ : {len(sizes)} fichiers, {sum(sizes.values()) // 1024} ko gzip au total, "
          f"le plus lourd {top[0][0]} = {top[0][1] // 1024} ko gzip (budget {MAX_GZ // 1024} ko) ; "
          f"communes.json {len(index)} entrées, {gz // 1024} ko gzip")
    return mbr, seats, sizes


# --------------------------------------------------------------------------- noyau
def write_core(et, stats, geo, conf, communes, mbr, seats):
    peoples = json.loads((DATA / "peuples.json").read_text(encoding="utf-8"))
    aut = json.loads((DATA / "entites-autonomes.json").read_text(encoding="utf-8"))
    notes = json.loads((DATA / "flagnotes.json").read_text(encoding="utf-8"))
    cons = json.loads((DATA / "constitution.json").read_text(encoding="utf-8"))
    vals = {"pop": [], "dens": [], "gdp": []}
    # Nombre de communes : stats.json ; s'il est vide (BG-91, comptée en bloc), les communes
    # d'opstine.json rattachées à l'entité, hors la ligne qui porte le nom de la ville-État.
    ops_n = {}
    for r in json.loads((DATA / "opstine.json").read_text(encoding="utf-8"))["m"]:
        if r[1] != "BKC":
            ops_n[r[2]] = ops_n.get(r[2], 0) + 1
    states = []
    for s in et:
        st = stats[s["c"]]
        g = conf[s["c"]]
        dens = st["population"] / st["area"] if st.get("population") and st.get("area") else None
        w, so, e, n = g.bounds
        pt = geo["pts"].get(s["c"]) or label_point(g)
        rec = {**{k: s[k] for k in ("c", "k", "n", "p", "t", "ch")},
               "pop": st.get("population"), "area": st.get("area"), "gdp": st.get("gdp"),
               "gdp_eu": st.get("gdp_eu"), "src": st.get("source"), "gsrc": st.get("gdp_source"),
               "nm": st.get("municipalities") if st.get("municipalities") is not None else ops_n.get(s["c"]),
               "bb": [round(w, 3), round(so, 3), round(e, 3), round(n, 3)],
               "pt": [round(pt[0], 4), round(pt[1], 4)], "seat": seats.get(s["c"]),
               "nu": len(communes.get(s["c"], []))}
        states.append(rec)
        for k, v in (("pop", rec["pop"]), ("dens", dens), ("gdp", rec["gdp"])):
            if v is not None:
                vals[k].append(v)
    sbr = {k: breaks_of(v) for k, v in vals.items()}
    allb = shapely.union_all(list(conf.values())).bounds
    core = {"v": 1, "cons": {"version": cons["version"], "iso": cons["iso"], "date": cons["date"]},
            "states": states, "peoples": peoples, "aut": aut, "notes": notes,
            "std": {"western": "Western standard (zapadni)", "central": "Central standard (središñi)",
                    "eastern": "Eastern standard (istočni)"},      # cf. scripts/build_portail.py, STD
            "breaks": {"state": sbr, "mun": mbr},
            "bounds": [round(x, 3) for x in allb]}
    gz = jdump(core, OUT / "core.json")
    print(f"  core.json {gz // 1024} ko gzip ; seuils États {sbr} ; seuils communes {mbr}")
    return core


# --------------------------------------------------------------------------- Constitution située
def cons_texts(body):
    for b in body:
        if b["t"] in ("p", "h"):
            yield b["x"]
        elif b["t"] == "ul":
            yield from b["items"]
        else:
            for i in b["items"]:
                yield i[1]


def write_places(et, core):
    """Lieux nommés par article, détectés dans le texte anglais par les données : noms d'États,
    chefs-lieux, communes (communes.json). Deux règles écartent les homonymes, sans liste
    écrite à la main : un nom identique à celui d'un peuple constitutif (peuples.json) n'est
    pas un lieu ; un nom pris dans un terme défini en gras par la Constitution elle-même
    (« **Granična Straža** ») n'est pas un lieu."""
    cons = json.loads((DATA / "constitution.json").read_text(encoding="utf-8"))
    index = json.loads((OUT / "communes.json").read_text(encoding="utf-8"))
    peoples = {p["name"] for p in core["peoples"].values()}
    pts = {}
    for st in et:
        for m in json.loads((OUT / "mun" / f"{st['c']}.json").read_text(encoding="utf-8"))["m"]:
            pts[(st["c"], m["s"])] = m["pt"]
    gaz = {}
    for r in index:
        if r[2]:
            gaz.setdefault(r[0], {"k": "m", "c": r[1], "s": r[2], "n": r[0], "pt": pts[(r[1], r[2])]})
    for s in et:
        if s["t"] == "T" and core_seat(core, s["c"]):
            gaz[s["ch"]] = {"k": "m", "c": s["c"], "s": core_seat(core, s["c"]), "n": s["ch"],
                            "pt": pts[(s["c"], core_seat(core, s["c"]))]}
    for s in et:                                   # un nom d'État l'emporte sur une commune homonyme
        gaz[s["n"]] = {"k": "s", "c": s["c"], "n": s["n"]}
    for nm in peoples:
        gaz.pop(nm, None)
    raw = json.dumps(cons, ensure_ascii=False)
    terms = [t for t in set(re.findall(r"\*\*([^*]+)\*\*", raw)) if " " in t]
    rx = re.compile(r"(?<![\w])(" + "|".join(re.escape(n) for n in sorted(gaz, key=len, reverse=True)) + r")(?![\w])")
    places, n = {}, 0
    for t in cons["titles"]:
        for ch in t["chapters"]:
            for a in ch["articles"]:
                found = []
                for x in cons_texts(a["body"]):
                    plain = x.replace("**", "")
                    spans = [(m.start(), m.end()) for term in terms for m in re.finditer(re.escape(term), plain)]
                    for m in rx.finditer(plain):
                        if any(a0 <= m.start() and m.end() <= b0 for a0, b0 in spans):
                            continue
                        g = gaz[m.group(1)]
                        if g not in found:
                            found.append(g)
                if found:
                    places[a["id"]] = found
                    n += len(found)
    jdump(places, OUT / "places.json")
    print(f"  places.json : {len(places)} articles situés, {n} mentions de lieux "
          f"(ex. art-1ter : {', '.join(p['n'] for p in places.get('art-1ter', []))})")


def core_seat(core, code):
    return next(s["seat"] for s in core["states"] if s["c"] == code)


# --------------------------------------------------------------------------- textes
def write_ui():
    i18n = json.loads((DATA / "i18n.json").read_text(encoding="utf-8"))
    tx = json.loads((DATA / "textes.json").read_text(encoding="utf-8"))["t"]
    used = json.loads((HERE / "src" / "strings.json").read_text(encoding="utf-8"))
    # chaînes littérales du code : L('…') (textes.json) et T('…') (i18n.json), relevées dans les sources
    key = lambda s: re.sub(r"\s+", " ", s).strip()                 # noqa: E731
    src = "".join((HERE / f).read_text(encoding="utf-8") for f in ("app.js", "map.js", "inst.js"))
    lit = r"""(?<![\w.])%s\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")"""
    unq = lambda m: (m[0] or m[1]).replace("\\'", "'").replace('\\"', '"')      # noqa: E731
    used["textes"] = sorted(set(used["textes"]) | {unq(m) for m in re.findall(lit % "L", src)})
    used["i18n"] = sorted(set(used["i18n"]) | {unq(m) for m in re.findall(lit % "T", src)})
    declared_new = sorted({unq(m) for m in re.findall(lit % "U", src)} | {unq(m) for m in re.findall(lit % "UT", src)})
    for k in declared_new:
        if key(k) in tx:
            sys.exit(f"« {k} » existe dans textes.json : utiliser L(), pas U()")
    core = json.loads((OUT / "core.json").read_text(encoding="utf-8"))
    et = json.loads((DATA / "etats.json").read_text(encoding="utf-8"))
    # chaînes tenues dans les données : notes de drapeaux, fonctions, sources, peuples
    data_keys = set(core["notes"].values()) | set(core["std"].values())
    data_keys |= {s["ch"] for s in et if s["t"] != "T"}
    data_keys |= {s[k] for s in core["states"] for k in ("src", "gsrc") if s.get(k)}
    data_keys |= {p["en"] for p in core["peoples"].values()}
    key = lambda s: re.sub(r"\s+", " ", s).strip()                 # noqa: E731
    sub, new = {}, []
    for k in used["textes"]:
        if key(k) in tx:
            sub[key(k)] = tx[key(k)]
        else:
            new.append(k)
    miss_data = []
    for k in sorted(data_keys):
        if key(k) in tx:
            sub[key(k)] = tx[key(k)]
        else:
            miss_data.append(k)
    for k in used["i18n"]:
        if k not in i18n["t"]:
            sys.exit(f"strings.json : clé i18n inconnue « {k} »")
    new = sorted(set(new) | set(declared_new))
    ui = {"langs": i18n["langs"], "t": {k: i18n["t"][k] for k in used["i18n"]}, "tx": sub, "new": new}
    gz = jdump(ui, OUT / "ui.json")
    (HERE / "strings-new.json").write_text(json.dumps(new, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"  ui.json {gz // 1024} ko gzip : {len(used['i18n'])} clés i18n, {len(sub)} textes repris ; "
          f"{len(new)} chaînes nouvelles -> strings-new.json")
    if miss_data:
        print(f"  chaînes de données sans traduction dans textes.json (restent en anglais) : {miss_data}")
    for lang in ("", ".zap", ".sre", ".ist"):
        shutil.copyfile(DATA / f"constitution{lang}.json", OUT / f"constitution{lang}.json")


# --------------------------------------------------------------------------- actifs
def write_assets():
    flags = json.loads((DATA / "state_flags.json").read_text(encoding="utf-8"))
    (OUT / "flags").mkdir(parents=True, exist_ok=True)
    dims = {}
    for code, uri in flags.items():
        raw = base64.b64decode(uri.split(",", 1)[1])
        (OUT / "flags" / f"{code}.png").write_bytes(raw)
        dims[code] = [int.from_bytes(raw[16:20], "big"), int.from_bytes(raw[20:24], "big")]
    jdump(dims, OUT / "flags.json")
    # Emblème de l'en-tête : l'image que le portail rend dans #hdEmblem (COA_DATA), telle quelle.
    html = (ROOT / "portail" / "index.html").read_text(encoding="utf-8")
    m = re.search(r'const COA_DATA="data:image/png;base64,([^"]+)"', html)
    if not m:
        sys.exit("COA_DATA introuvable dans portail/index.html")
    (HERE / "emblem.png").write_bytes(base64.b64decode(m.group(1)))
    (HERE / "fonts").mkdir(exist_ok=True)
    for f in (ROOT / "portail" / "fonts").iterdir():
        shutil.copyfile(f, HERE / "fonts" / f.name)
    shutil.copyfile(DATA / "geo.json", OUT / "geo.json")
    # MapLibre GL JS (npm), copié tel quel dans vendor/.
    dist = TOOLS / "node_modules" / "maplibre-gl" / "dist"
    if not dist.exists():
        TOOLS.mkdir(parents=True, exist_ok=True)
        subprocess.run(["npm", "i", "--prefix", str(TOOLS), "maplibre-gl@6.18.0"], check=True)
    (HERE / "vendor").mkdir(exist_ok=True)
    for f in ("maplibre-gl.mjs", "maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs", "maplibre-gl.css"):
        if (dist / f).exists():
            shutil.copyfile(dist / f, HERE / "vendor" / f)
    shutil.copyfile(dist.parent / "LICENSE.txt", HERE / "vendor" / "LICENSE-maplibre-gl.txt")
    ver = json.loads((dist.parent / "package.json").read_text())["version"]
    print(f"  drapeaux {len(flags)} PNG, emblème, polices, geo.json, maplibre-gl {ver}")


# --------------------------------------------------------------------------- silhouette + index
def merc(lat):
    return math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


def write_index(core, geo):
    """Silhouette statique (premier rendu, avant MapLibre) : mêmes contours que la carte, en
    Mercator, colorés par la classe de population ; cadrée par viewBox sur l'emprise de la
    Confédération, comme le fitBounds de la carte hydratée."""
    K = 100.0
    w, s, e, n = core["bounds"]
    to_m = lambda a: np.column_stack((a[:, 0] * K, -np.vectorize(merc)(a[:, 1]) * K))    # noqa: E731
    cells = [(x["c"], dec_polys(x["g"], geo["q"])) for x in geo["states"] + geo["fed"]]
    geoms = shapely.transform(np.array([g for _, g in cells], dtype=object), to_m)
    try:
        simp = shapely.coverage_simplify(shapely.coverage_clean(geoms, gap_width=0.5), 1.7)
    except Exception:  # noqa: BLE001
        simp = shapely.simplify(geoms, 1.5)
    by_c = {s["c"]: s for s in core["states"]}
    br = core["breaks"]["state"]["pop"]

    def path(g, min_area=0.0):
        d = []
        for poly in shapely.get_parts(g):
            if poly.geom_type != "Polygon" or poly.area < min_area:
                continue
            for ring in [poly.exterior] + list(poly.interiors):
                c = []
                for x, y in ring.coords[:-1]:
                    q = (round(x), round(y))
                    if not c or q != c[-1]:
                        c.append(q)
                if len(c) < 3:
                    continue
                d.append(f"M{c[0][0]} {c[0][1]}l" + " ".join(
                    f"{x1 - x0} {y1 - y0}" for (x0, y0), (x1, y1) in zip(c, c[1:])) + "z")
        return "".join(d)

    x0, x1, y0, y1 = w * K, e * K, -merc(n) * K, -merc(s) * K
    land = shapely.transform(shapely.union_all([dec_polys(x["g"], geo["q"]).buffer(0) for x in geo["land"]]), to_m)
    land = shapely.simplify(land.intersection(shapely.box(x0 - 900, y0 - 700, x1 + 900, y1 + 700)), 9)
    occ = shapely.simplify(shapely.transform(shapely.union_all(
        [dec_polys(x["g"], geo["q"]).buffer(0) for x in geo["occupied"]]), to_m), 2.5)
    parts = ['<defs><pattern id="ho" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
             '<rect width="2" height="7" fill="#99402F" fill-opacity=".6"/></pattern>'
             '<pattern id="hx" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
             '<rect width="7" height="7" fill="#EEF0F7"/><rect width="1.6" height="7" fill="#374078"/></pattern>'
             '<pattern id="hy" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">'
             '<rect width="5" height="5" fill="#fff"/><rect width="1.4" height="5" fill="#171B36"/></pattern></defs>',
             f'<path class="sl" d="{path(land, 400)}"/>', f'<path class="so" d="{path(occ, 4)}"/>', '<g id="svS">']
    order = sorted(zip(cells, simp), key=lambda cg: by_c[cg[0][0]]["t"] != "T")      # villes-États au-dessus
    for (code, _), g in order:
        parts.append(f'<path data-c="{code}" class="sp s{klass(by_c[code]["pop"], br)}" d="{path(g, 1)}"/>')
    parts.append('</g><g id="svH"></g><g id="svO"></g>')
    svg = (f'<svg id="sil" viewBox="{x0:.1f} {y0:.1f} {x1 - x0:.1f} {y1 - y0:.1f}" '
           f'preserveAspectRatio="xMidYMid meet" data-k="{K:g}">'
           + "".join(parts) + "</svg>")
    tpl = (HERE / "src" / "index.html").read_text(encoding="utf-8")
    css = (HERE / "src" / "critical.css").read_text(encoding="utf-8")
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css).replace("; ", ";").replace(" {", "{").replace("{ ", "{").replace(" }", "}")
    html = tpl.replace("<!--SILHOUETTE-->", svg).replace("/*CRITICAL*/", css)
    (HERE / "index.html").write_text(html, encoding="utf-8")
    print(f"  index.html {len(gzip.compress(html.encode())) // 1024} ko gzip "
          f"(silhouette {len(gzip.compress(svg.encode())) // 1024} ko gzip, CSS critique en ligne)")


def main():
    print("Atlas : build")
    et, stats, ops, L, geo = load_base()
    units, communes, conf = build_communes(et, stats, ops, L, geo)
    simplify_coverage(units)
    mbr, seats, _ = write_mun(et, stats, units, communes)
    core = write_core(et, stats, geo, conf, communes, mbr, seats)
    write_places(et, core)
    write_ui()
    write_assets()
    write_index(core, geo)
    return 0


if __name__ == "__main__":
    sys.exit(main())
