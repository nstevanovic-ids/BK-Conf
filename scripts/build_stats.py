#!/usr/bin/env python3
"""
build_stats.py — chiffres clés des États → portail/data/stats.json

Pour chaque État :
  - municipalities : nombre de communes (unités GADM du fichier d'État, après
    résolution des chevauchements ; lacs et unités sans habitants exclus) ;
  - area           : superficie en km², calculée sur l'ellipsoïde WGS84 à partir
    des contours (union des communes) ;
  - population     : somme des populations communales du dernier recensement du
    pays, si TOUTES les communes de l'État sont couvertes ; sinon null (en attente) ;
  - source         : libellé du recensement (« Census 2022 (first results) »…).

Entrées :
  portail/data/<CODE>.geojson         contours communaux par État (GADM)
  portail/data/etats.json             liste canonique des États
  docs/data/population/<ISO>_*.csv    recensements par commune (name,population)
  docs/data/population/VILLES-ETATS.csv  villes-États et municipalités confédérales

Pour ajouter un pays : déposer docs/data/population/<ISO>_<année>.csv avec les
colonnes name,population (une ligne par commune), le déclarer dans TABLES, puis :
    python scripts/build_stats.py
    python scripts/build_portail.py --inline
Le script signale les communes non appariées : compléter ALIASES si besoin.
"""
import csv
import json
import math
import os
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

try:
    from shapely.geometry import shape
    from shapely.ops import unary_union
    from pyproj import Geod
except ImportError:
    sys.exit("shapely et pyproj sont requis : pip install shapely pyproj")

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "portail" / "data"
POP = ROOT / "docs" / "data" / "population"
OUT = DATA / "stats.json"
GEOD = Geod(ellps="WGS84")

# Recensements par pays (code GADM GID_0). Colonne retenue + libellé public.
TABLES = {
    "SRB": ("SRB_2022.csv", "population", "Census 2022 (first results)"),
    "MNE": ("MNE_2023.csv", "population", "Census 2023"),
    "MKD": ("MKD_2021.csv", "population", "Census 2021"),
    # Kosovo : le nord a boycotté 2011 et 2024 ; 2024 y est très sous-dénombré.
    "XKO": ("XKO.csv", "population_2011", "Census 2011"),
    # En attente : HRV (DZS 2021), SVN (SiStat), BGR (NSI 2021), BIH (BHAS 2013).
}
# Totaux nationaux de contrôle (même source que les tables).
NATIONAL = {"SRB": 6690887, "MNE": 623633, "MKD": 1836713}

# Nom GADM normalisé -> noms du recensement à additionner.
ALIASES = {
    "SRB": {
        "petrovac": ["Petrovac na Mlavi"],
        "pozarevac": ["Grad Požarevac"],   # Požarevac + Kostolac
        "nis": ["Grad Niš"],               # 5 gradske opštine
        "vranje": ["Grad Vranje"],         # Vranje + Vranjska Banja
        "uzice": ["Grad Užice"],           # Užice + Sevojno
    },
    "MNE": {  # GADM suit l'ancien découpage à 21 communes
        "niksic": ["Nikšić"],
        "podgorica": ["Podgorica", "Tuzi", "Zeta"],
        "berane": ["Berane", "Petnjica"],
        "plav": ["Plav", "Gusinje"],
    },
    "MKD": {
        "aracinovo": ["Aračinovo"], "cucer sandevo": ["Čučer-Sandevo"],
        "kavadartsi": ["Kavadarci"], "star dojran": ["Dojran"],
        "strumitsa": ["Strumica"], "vinitsa": ["Vinica"],
        "jegunovtse": ["Jegunovce"], "novatsi": ["Novaci"],
    },
    "XKO": {
        "leposavic": ["Leposaviq"], "zvecan": ["Zveçan"], "strpce": ["Shtërpca"],
    },
}
# « Grad » à subdivisions : composantes couvertes dès que le Grad est apparié.
SUBUNITS = {
    "Grad Užice": ["Užice", "Sevojno"],
    "Grad Požarevac": ["Požarevac", "Kostolac"],
    "Grad Vranje": ["Vranje", "Vranjska Banja"],
    "Grad Niš": ["Medijana", "Niška Banja", "Palilula (Niš)", "Pantelej", "Crveni Krst"],
}
# Unités GADM sans habitants ni statut communal (comptées en superficie seulement).
NON_MUNICIPAL = {"lake ohrid", "liberland"}

# Communes présentes dans deux fichiers d'État : rattachement retenu (code-lettres).
ASSIGN = {
    # Baranja : BR-04 Baraña existe dans la liste canonique ; SL-32 en double.
    **{g: "BR" for g in ("HRV.11.2_1", "HRV.11.4_1", "HRV.11.6_1", "HRV.11.9_1",
                         "HRV.11.12_1", "HRV.11.20_1", "HRV.11.28_1", "HRV.11.32_1",
                         "HRV.11.40_1")},
    # Stranxa : les 4 communes sortent de Černomorska et de Sěverna Trakija.
    **{g: "SX" for g in ("BGR.2.5_1", "BGR.2.11_1", "BGR.2.13_1", "BGR.28.1_1")},
    # Pojezerje : delta de la Neretva, avec Opuzen, Metković et Ploče.
    "HRV.3.15_1": "DA",
    # Žagubica : transférée à Timok (Homolje uni à la Krajina valaque).
    "SRB.2.8_1": "TK",
}

# Fichiers d'État au code provisoire (cf. gen_geo.py).
EXTRA = {"LV-LASVA.geojson": "LV", "SO-SOLI.geojson": "SO", "VB-VRHBOSNA.geojson": "VB"}

# Communes serbes de RS-30 identifiées seulement par leur district dans GADM :
# chef-lieu (lat, lon) des candidates, pour l'attribution géométrique.
SRB_DISTRICTS = {"Raški": "Raška", "Zlatiborski": "Zlatiborska", "Moravički": "Moravička"}
SEATS = {
    "Novi Pazar": (43.137, 20.512), "Raška": (43.286, 20.616), "Tutin": (42.990, 20.337),
    "Kraljevo": (43.725, 20.689), "Vrnjačka Banja": (43.623, 20.893),
    "Nova Varoš": (43.460, 19.814), "Priboj": (43.584, 19.526),
    "Prijepolje": (43.389, 19.648), "Sjenica": (43.273, 20.000),
    "Ivanjica": (43.581, 20.230),
}

# Villes-États : contours geoBoundaries (gbOpen), plus fidèles que Natural Earth
# pour les superficies ; Mostar (MO-96) a son propre fichier dans portail/data/.
GB_FED = {
    "BG-91": ("SRB", "ADM1", "Belgrade"),
    "ZG-94": ("HRV", "ADM1", "City of Zagreb"),
    "SF-93": ("BGR", "ADM1", "Sofia City"),
    "BK-95": ("BIH", "ADM2", "Brcko District"),
    "SA-92": ("BIH", "ADM2", "Sarajevo Canton"),
}
GB_URL = ("https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/"
          "releaseData/gbOpen/{iso}/{adm}/geoBoundaries-{iso}-{adm}.geojson")


def norm(s: str) -> str:
    s = s.replace("đ", "d").replace("Đ", "D")
    s = "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", re.sub(r"[-–/]", " ", s.lower())).strip()


def read_csv(path: Path) -> list:
    with open(path, encoding="utf-8") as fh:
        return list(csv.DictReader(l for l in fh if not l.startswith("#")))


def area_km2(geom) -> float:
    return abs(GEOD.geometry_area_perimeter(geom)[0]) / 1e6


def level(p: dict) -> str:
    for lv in ("3", "2", "1"):
        if p.get("NAME_" + lv):
            return lv
    return ""


def load_tables() -> dict:
    out = {}
    for iso, (fname, col, label) in TABLES.items():
        rows = read_csv(POP / fname)
        pop = {}
        for r in rows:
            if r.get("kind") == "D":
                continue
            pop[r["name"]] = int(r[col])
        out[iso] = {"pop": pop, "norm": {norm(k): k for k in pop}, "label": label,
                    "rows": rows}
    return out


def geoboundaries(iso: str, adm: str) -> dict:
    cache = Path(os.environ.get("TMPDIR", "/tmp")) / f"geoBoundaries-{iso}-{adm}.geojson"
    if not cache.exists():
        with urllib.request.urlopen(GB_URL.format(iso=iso, adm=adm), timeout=300) as r:
            cache.write_bytes(r.read())
    return json.loads(cache.read_text(encoding="utf-8"))


def main() -> int:
    etats = json.loads((DATA / "etats.json").read_text(encoding="utf-8"))
    by_k = {s["k"]: s for s in etats}
    tables = load_tables()

    # 1. Communes par État, chevauchements résolus.
    units = {}   # code d'État -> liste de (props, geom)
    for fp in sorted(DATA.glob("*.geojson")):
        m = re.match(r"^([A-Z]{2})-\d+\.geojson$", fp.name)
        k = m.group(1) if m else EXTRA.get(fp.name)
        if not k or k not in by_k or by_k[k]["t"] != "T":
            continue
        for ft in json.loads(fp.read_text(encoding="utf-8"))["features"]:
            p = ft["properties"]
            gid = p.get("GID_" + level(p))
            owner = ASSIGN.get(gid, k)
            if owner != k:
                continue
            units.setdefault(by_k[k]["c"], []).append((p, shape(ft["geometry"]).buffer(0)))
    # Doublons exacts au sein d'un même fichier (unités GADM répétées).
    for code, lst in units.items():
        seen, keep = set(), []
        for p, g in lst:
            key = (p.get("GID_" + level(p)), round(g.representative_point().x, 4),
                   round(g.representative_point().y, 4))
            if key not in seen:
                seen.add(key)
                keep.append((p, g))
        units[code] = keep

    # 2. Appariement des noms par pays.
    matched_names = {}   # iso -> set(noms du recensement utilisés)
    pending_district = []  # (code, props, geom) serbes identifiés par district
    resolved = {}        # (code, idx) -> [noms]
    for code, lst in units.items():
        for i, (p, g) in enumerate(lst):
            iso = p.get("GID_0")
            nm = p.get("NAME_" + level(p)) or ""
            if norm(nm) in NON_MUNICIPAL or iso not in tables:
                continue
            if iso == "SRB" and level(p) == "1":
                pending_district.append((code, i, p, g))
                continue
            t = tables[iso]
            names = ALIASES.get(iso, {}).get(norm(nm))
            if not names and norm(nm) in t["norm"]:
                names = [t["norm"][norm(nm)]]
            if names:
                resolved[(code, i)] = names
                matched_names.setdefault(iso, set()).update(names)
    for iso, used in matched_names.items():
        for g, parts in SUBUNITS.items():
            if g in used:
                used.update(parts)
    # Communes serbes connues seulement par leur district : candidates restantes.
    if pending_district:
        rows = tables["SRB"]["rows"]
        by_district = {}
        for code, i, p, g in pending_district:
            by_district.setdefault(SRB_DISTRICTS[p["NAME_1"]], []).append((code, i, g))
        for dist, feats in by_district.items():
            cands = [r["name"] for r in rows if r["district"] == dist and r["kind"] == "M"
                     and r["name"] not in matched_names.get("SRB", set())]
            if len(cands) != len(feats):
                sys.exit(f"District {dist} : {len(feats)} unités pour {len(cands)} communes libres {cands}")
            free = set(cands)
            for code, i, g in feats:
                pt = g.representative_point()
                best = min(free, key=lambda n: math.dist(SEATS[n], (pt.y, pt.x)))
                free.remove(best)
                resolved[(code, i)] = [best]
                matched_names["SRB"].add(best)

    # 3. Agrégation par État.
    fed_pop = {r["code"]: r for r in read_csv(POP / "VILLES-ETATS.csv")}
    stats, unmatched = {}, {}
    for s in etats:
        code = s["c"]
        if s["t"] == "T":
            lst = units.get(code, [])
            geom = unary_union([g for _, g in lst])
            n_mun = sum(1 for p, _ in lst
                        if norm(p.get("NAME_" + level(p)) or "") not in NON_MUNICIPAL)
            total, srcs, missing = 0, set(), []
            for i, (p, g) in enumerate(lst):
                nm = p.get("NAME_" + level(p)) or ""
                if norm(nm) in NON_MUNICIPAL:
                    continue
                iso = p.get("GID_0")
                names = resolved.get((code, i))
                if not names:
                    missing.append(f"{iso}:{nm}")
                    continue
                total += sum(tables[iso]["pop"][n] for n in names)
                srcs.add(tables[iso]["label"])
            stats[code] = {
                "municipalities": n_mun,
                "area": round(area_km2(geom)),
                "population": None if missing else total,
                "source": None if missing else " · ".join(sorted(srcs)),
            }
            if missing:
                unmatched[code] = missing
        else:
            stats[code] = {"municipalities": None, "area": None,
                           "population": int(fed_pop[code]["population"]) if code in fed_pop else None,
                           "source": fed_pop[code]["source"] if code in fed_pop else None}

    # 4. Superficie des villes-États et municipalités confédérales.
    fed_geom = {}
    for c, (iso, adm, name) in GB_FED.items():
        hit = [f for f in geoboundaries(iso, adm)["features"]
               if f["properties"].get("shapeName") == name]
        if len(hit) != 1:
            sys.exit(f"geoBoundaries {iso} {adm} : « {name} » introuvable ou ambigu")
        fed_geom[c] = shape(hit[0]["geometry"]).buffer(0)
    for s in etats:
        lf = DATA / f"{s['c']}.geojson"
        if s["t"] != "T" and lf.exists():
            fc = json.loads(lf.read_text(encoding="utf-8"))
            fed_geom[s["c"]] = unary_union([shape(f["geometry"]).buffer(0) for f in fc["features"]])
    for c, g in fed_geom.items():
        stats[c]["area"] = round(area_km2(g))
    # Contrôle : aucune commune d'un État territorial ne doit se trouver dans une
    # ville-État (test sur le point intérieur ; les écarts de tracé entre GADM et
    # geoBoundaries le long des limites sont ignorés).
    for code, lst in units.items():
        for p, g in lst:
            pt = g.representative_point()
            for c, fg in fed_geom.items():
                if fg.contains(pt):
                    print(f"  ATTENTION {code} « {p.get('NAME_' + level(p))} » "
                          f"est situé dans le contour de {c}")

    # 5. Contrôles de couverture par pays.
    print("Couverture des recensements :")
    fed_by_iso = {"SRB": int(fed_pop["BG-91"]["population"]) if "BG-91" in fed_pop else 0}
    for iso, t in tables.items():
        used = matched_names.get(iso, set())
        sub = {x for parts in SUBUNITS.values() for x in parts}
        assigned = sum(t["pop"][n] for n in used if n not in sub)
        free = sorted(n for n in t["pop"]
                      if n not in used and not any(n in v for v in ALIASES.get(iso, {}).values()))
        line = f"  {iso} : {len(used)} unités appariées, {assigned:,} hab. dans les États"
        if iso in NATIONAL:
            line += f" (+ ville-État {fed_by_iso.get(iso, 0):,}) / total national {NATIONAL[iso]:,}"
        print(line)
        if free and iso != "XKO":
            print(f"     hors États : {', '.join(free)}")
    n_pop = sum(1 for v in stats.values() if v["population"] is not None)
    print(f"États avec population : {n_pop}/{len(stats)} ; en attente : "
          f"{', '.join(sorted(c for c, v in stats.items() if v['population'] is None))}")
    if unmatched:
        print("Communes sans donnée (par État) :")
        for c, lst in sorted(unmatched.items()):
            print(f"  {c} : {len(lst)} ({', '.join(lst[:4])}{'…' if len(lst) > 4 else ''})")

    OUT.write_text(json.dumps(stats, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"→ {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
