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
  - source         : libellé du recensement (« Census 2022 (first results) »…) ;
  - gdp            : PIB par habitant 2023 en SPA, moyenne des régions de PIB des
    communes pondérée par leur population ; null si une commune n'est pas rattachée ;
  - gdp_eu         : en % de la moyenne UE-27 ; gdp_source : libellé public.

Entrées :
  portail/data/<CODE>.geojson         contours communaux par État (GADM)
  portail/data/etats.json             liste canonique des États
  docs/data/population/<ISO>_*.csv    recensements par commune (name,population)
  docs/data/population/VILLES-ETATS.csv  villes-États et municipalités confédérales
  docs/data/pib/PIB_2023.csv          PIB par habitant (SPA) par région NUTS 3 / entité
  docs/data/pib/REGIONS.csv           rattachement commune -> région de PIB
  docs/data/pib/CONTROLE_2023.csv     valeurs nationales (contrôle, moyenne UE-27)

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
PIB = ROOT / "docs" / "data" / "pib"
OUT = DATA / "stats.json"
OUT_LIGHTS = DATA / "lights.json"
GEOD = Geod(ellps="WGS84")

# Recensements par pays (code GADM GID_0). Colonne retenue + libellé public.
TABLES = {
    "SRB": ("SRB_2022.csv", "population", "Census 2022 (first results)"),
    "MNE": ("MNE_2023.csv", "population", "Census 2023"),
    "MKD": ("MKD_2021.csv", "population", "Census 2021"),
    "HRV": ("HRV_2021.csv", "population", "Census 2021"),
    "SVN": ("SVN_2026.csv", "population", "Population register, 1 Jan 2026"),
    "BGR": ("BGR_2025.csv", "population", "NSI estimate, 31 Dec 2025"),
    "BIH": ("BIH_2013.csv", "population", "Census 2013"),
    # Kosovo : le nord a boycotté 2011 et 2024 ; 2024 y est très sous-dénombré.
    "XKO": ("XKO.csv", "population_2011", "Census 2011"),
}
# Totaux nationaux de contrôle (même source que les tables).
NATIONAL = {"SRB": 6690887, "MNE": 623633, "MKD": 1836713, "HRV": 3871833, "SVN": 2135107,
            "BGR": 6423207, "BIH": 3531159}
# Villes-États et municipalités confédérales comptées hors États dans le total national.
FED_OF = {"SRB": ["BG-91"], "HRV": ["ZG-94"], "BGR": ["SF-93"],
          "BIH": ["SA-92", "BK-95", "MO-96"]}
# Composition communale des entités confédérales sans contour communal propre.
# Lumières de la carte : point (lat, lon) des villes-États sans contour communal.
FED_LIGHT = {"BG-91": (44.810, 20.460), "SF-93": (42.697, 23.322), "SA-92": (43.856, 18.413),
             "BK-95": (44.873, 18.810), "MO-96": (43.343, 17.808)}
# Région de PIB des villes-États sans commune au recensement.
FED_REGION = {"BG-91": "RS110"}
FED_NAMES = {
    "SF-93": ("BGR", ["Stolichna"]),
    "SA-92": ("BIH", ["Centar Sarajevo", "Hadžići", "Ilidža", "Ilijaš", "Novi Grad Sarajevo",
                      "Novo Sarajevo", "Stari Grad Sarajevo", "Trnovo (FBiH)", "Vogošća"]),
    "BK-95": ("BIH", ["Brčko"]),
    "MO-96": ("BIH", ["Grad Mostar"]),
}

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
    "HRV": {
        "murter": ["Murter-Kornati"], "povljane": ["Povljana"],
        "opatija veprinac": ["Opatija"], "lopar supetarska draga": ["Rab"],
        "vinodolska": ["Vinodolska općina"], "sveta marija na muri": ["Sveta Marija"],
    },
    "BGR": {  # translittérations GADM
        "aitos": ["Aytos"], "provadiya": ["Provadia"], "kainardzha": ["Kaynardzha"],
        "rousse": ["Ruse"], "gara hitrino": ["Hitrino"], "preslav": ["Veliki Preslav"],
        "loukovit": ["Lukovit"], "dolna mitropoliya": ["Dolna Mitropolia"],
        "boichinovtsi": ["Boychinovtsi"], "georgy damyanovo": ["Georgi Damyanovo"],
        "boinitsa": ["Boynitsa"], "ruzh": ["Ruzhintsi"], "hairedin": ["Hayredin"],
        "miziya": ["Mizia"], "lesichevo": ["Lesichovo"], "hisar": ["Hisarya"],
    },
    "BIH": {  # anciens noms GADM ; homonymes départagés par l'entité (NAME_1)
        "bosanska gradiska": ["Gradiška"], "bosanska kostajnica": ["Kostajnica"],
        "dubica": ["Kozarska Dubica"], "skender vakuf knezevo": ["Kneževo"],
        "bosanski brod": ["Brod"], "prozor rama": ["Prozor"],
        "doboj east": ["Doboj-Istok"], "doboj south": ["Doboj-Jug"],
        "tesan usora": ["Tešanj", "Usora"],
        "foca ustikolina": ["Foča (FBiH)"], "pale praca": ["Pale (FBiH)"],
        "foca|repuplika srpska": ["Foča (RS)"], "pale|repuplika srpska": ["Pale (RS)"],
        "trnovo|repuplika srpska": ["Trnovo (RS)"],
        "kupres|repuplika srpska": ["Kupres (RS)"],
        "kupres|federacija bosna i hercegovina": ["Kupres (FBiH)"],
    },
    "SVN": {  # noms GADM tronqués ou antérieurs
        "sveti andraz v slovenskih gorica": ["Sveti Andraž v Slov. goricah"],
        "sveti jurij": ["Sveti Jurij ob Ščavnici"],
        "sentjur pri celju": ["Šentjur"],
    },
}
# Unités GADM qui ne sont que des fragments d'une commune déjà comptée (îlots,
# hameaux, polygones « Unknown ») : superficie comptée, population nulle.
SUBPARTS = {
    "BGR": {"skalna glava"},
    "HRV": {"premantura", "ilovik", "male srakane", "vele srakane", "susak", "unije",
            "njivice", "blaca", "unknown_1", "unknown_2", "osjecko baranjska"},
}
# Communes du recensement absentes de GADM (créées après son découpage) :
# localisées via geoBoundaries (découpage actuel) puis rattachées à l'État qui
# contient leur point intérieur. POINTS : repli pour celles absentes de geoBoundaries.
LOCATE = {"HRV": ("HRV", "ADM2", r"^(opcina|grad|otok) "),
          "SVN": ("SVN", "ADM2", r"^$"),
          "BGR": ("BGR", "ADM2", r"^$")}
# Repli : coordonnées (lat, lon) du chef-lieu, ou nom GADM de la commune d'origine
# (communes slovènes détachées en 2006, absentes ou mal encodées dans geoBoundaries).
POINTS = {
    "HRV": {"Tribunj": (43.753, 15.746)},
    "SVN": {"Središče ob Dravi": "Ormož", "Sveti Tomaž": "Ormož",
            "Straža": "Novo Mesto", "Šmarješke Toplice": "Novo Mesto",
            "Šmartno pri Litiji": "Litija", "Ankaran/Ancarano": "Koper"},
    "BGR": {"Kuklen": "Rodopi", "Sarnitsa": "Velingrad", "Sopot": "Karlovo"},
}


def loc_key(name: str) -> str:
    """Clé de nom pour la localisation (formes bilingues, abréviations SURS)."""
    base = name.split(" (")[0].split(" – ")[0].split("/")[0]
    return norm(base.replace("Slov. ", "Slovenskih "))
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

# geoBoundaries (gbOpen) : localisation des communes absentes de GADM (LOCATE) ;
# aussi utilisé par scripts/raccord_contours.py.
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
        rows = [r for r in read_csv(POP / fname) if r.get("kind") != "D"]
        counts = {}
        for r in rows:
            counts[norm(r["name"])] = counts.get(norm(r["name"]), 0) + 1
        pop, index, district = {}, {}, {}
        for r in rows:
            # Homonymes (ex. Otok, Privlaka en Croatie) : clé « nom (comitat) ».
            key = r["name"] if counts[norm(r["name"])] == 1 else f"{r['name']} ({r.get('district', '')})"
            pop[key] = int(r[col])
            district[key] = r.get("district", "")
            for form in {r["name"], r["name"].split(" – ")[0], r["name"].split("/")[0]}:
                index.setdefault(norm(form), []).append((norm(r.get("district") or ""), key))
        out[iso] = {"pop": pop, "index": index, "label": label, "rows": rows,
                    "district": district}
    return out


def load_gdp():
    """Régions de PIB (SPA/hab.), rattachements et valeurs nationales de contrôle."""
    regions = {r["region"]: r for r in read_csv(PIB / "PIB_2023.csv")}
    for r in regions.values():
        r["pps"] = int(r["pps"])
    link = {}
    for r in read_csv(PIB / "REGIONS.csv"):
        if r["region"] not in regions:
            sys.exit(f"REGIONS.csv : région inconnue {r['region']}")
        link.setdefault(r["iso"], {})[r["key"]] = r["region"]
    ctrl = {r["geo"]: int(r["pps"]) for r in read_csv(PIB / "CONTROLE_2023.csv")}
    return regions, link, ctrl


def gdp_region(link, tables, iso, key, props=None):
    """Région de PIB d'une commune du recensement (None si non rattachée)."""
    lk = link.get(iso, {})
    if iso in ("SRB", "HRV", "BGR"):
        return lk.get(tables[iso]["district"].get(key, ""))
    if iso == "SVN":
        return lk.get((props or {}).get("NAME_1") or "")
    if iso == "BIH":
        return lk.get(key) or lk.get((props or {}).get("NAME_1") or "")
    if iso == "MKD":
        return lk.get(key)
    return lk.get("*")


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
    gdp_regions, gdp_link, gdp_ctrl = load_gdp()
    reg_of = {}   # (iso, clé du recensement) -> région de PIB
    pt_of = {}    # (iso, clé du recensement) -> (lon, lat) de la lumière sur la carte

    # 1. Communes par État, chevauchements résolus.
    units = {}   # code d'État -> liste de (props, geom)
    for fp in sorted(DATA.glob("*.geojson")):
        m = re.match(r"^([A-Z]{2})-\d+\.geojson$", fp.name)
        k = m.group(1) if m else EXTRA.get(fp.name)
        if not k or k not in by_k or by_k[k]["t"] != "T":
            continue
        feats = json.loads(fp.read_text(encoding="utf-8"))["features"]
        isos = [f["properties"].get("GID_0") for f in feats if f["properties"].get("GID_0")]
        main_iso = max(set(isos), key=isos.count) if isos else None
        for ft in feats:
            p = ft["properties"]
            if not p.get("GID_0"):
                p = {**p, "GID_0": main_iso}   # unité ajoutée hors GADM (ex. Srebrenica)
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
            if (norm(nm) in NON_MUNICIPAL or iso not in tables
                    or norm(nm) in SUBPARTS.get(iso, set())):
                continue
            if iso == "SRB" and level(p) == "1":
                pending_district.append((code, i, p, g))
                continue
            t = tables[iso]
            al = ALIASES.get(iso, {})
            names = al.get(f"{norm(nm)}|{norm(p.get('NAME_1') or '')}") or al.get(norm(nm))
            cands = t["index"].get(norm(nm), [])
            if not names and len(cands) == 1:
                names = [cands[0][1]]
            elif not names and len(cands) > 1:
                region = norm(p.get("NAME_1") or "")
                hit = [k for d, k in cands if d == region]
                names = hit[:1] or None
            if names:
                resolved[(code, i)] = names
                matched_names.setdefault(iso, set()).update(names)
                rp = g.representative_point()
                for n in names:
                    reg_of[(iso, n)] = gdp_region(gdp_link, tables, iso, n, p)
                    pt_of.setdefault((iso, n), (rp.x, rp.y))
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
                reg_of[("SRB", best)] = gdp_region(gdp_link, tables, "SRB", best)
                rp = g.representative_point()
                pt_of[("SRB", best)] = (rp.x, rp.y)

    # Villes-États dotées d'un contour communal propre (ex. ZG-94 avec le
    # Turopolje) : leurs communes sont appariées au recensement comme pour un État.
    fed_members = {}
    for s in etats:
        lf = DATA / f"{s['c']}.geojson"
        if s["t"] == "T" or not lf.exists():
            continue
        members, ok, mpts = [], True, []
        for ft in json.loads(lf.read_text(encoding="utf-8"))["features"]:
            p = ft["properties"]
            iso, nm = p.get("GID_0"), p.get("NAME_" + level(p)) or ""
            cands = tables[iso]["index"].get(norm(nm), []) if iso in tables else []
            if len(cands) != 1:
                ok = False
                break
            members.append((iso, cands[0][1]))
            rp = shape(ft["geometry"]).buffer(0).representative_point()
            mpts.append((rp.x, rp.y))
        if ok and members:
            fed_members[s["c"]] = members
            for (iso, k), xy in zip(members, mpts):
                reg_of[(iso, k)] = gdp_region(gdp_link, tables, iso, k)
                pt_of[(iso, k)] = xy
            for iso, k in members:
                matched_names.setdefault(iso, set()).add(k)

    for code, (iso, names) in FED_NAMES.items():
        if code in fed_members or iso not in tables:
            continue
        missing_fed = [n for n in names if n not in tables[iso]["pop"]]
        if missing_fed:
            sys.exit(f"{code} : communes inconnues dans {iso} : {missing_fed}")
        fed_members[code] = [(iso, n) for n in names]
        matched_names.setdefault(iso, set()).update(names)
        for n in names:
            reg_of[(iso, n)] = gdp_region(gdp_link, tables, iso, n)
            if code in FED_LIGHT:
                pt_of[(iso, n)] = FED_LIGHT[code][::-1]

    # Communes du recensement sans unité GADM : localisation géométrique.
    state_geom = {code: unary_union([g for _, g in lst]) for code, lst in units.items()}
    located = {}   # code d'État -> [(iso, clé)]
    for iso, (giso, adm, prefix) in LOCATE.items():
        if iso not in tables:
            continue
        t = tables[iso]
        sub = {x for parts in SUBUNITS.values() for x in parts}
        used = matched_names.get(iso, set())
        left = [k for k in t["pop"] if k not in used and k not in sub]
        gbidx = {}
        for f in geoboundaries(giso, adm)["features"]:
            gbidx.setdefault(re.sub(prefix, "", loc_key(f["properties"]["shapeName"])), []).append(f)
        parent_pt, iso_units = {}, []
        for code, lst in units.items():
            for p, g in lst:
                if p.get("GID_0") == iso:
                    parent_pt[norm(p.get("NAME_" + level(p)) or "")] = g.representative_point()
                    iso_units.append((p, g))
        for k in left:
            base = loc_key(k)
            pt = None
            fb = POINTS.get(iso, {}).get(k)
            if isinstance(fb, tuple):
                from shapely.geometry import Point
                pt = Point(fb[1], fb[0])
            elif isinstance(fb, str):
                pt = parent_pt.get(norm(fb))
            elif len(gbidx.get(base, [])) == 1:
                pt = shape(gbidx[base][0]["geometry"]).buffer(0).representative_point()
            if pt is None:
                continue
            for code, g in state_geom.items():
                if g.contains(pt):
                    located.setdefault(code, []).append((iso, k))
                    used.add(k)
                    host = next((p for p, ug in iso_units if ug.contains(pt)), None)
                    reg_of[(iso, k)] = gdp_region(gdp_link, tables, iso, k, host)
                    pt_of[(iso, k)] = (pt.x, pt.y)
                    break

    # 3. Agrégation par État.
    fed_pop = {r["code"]: r for r in read_csv(POP / "VILLES-ETATS.csv")}
    stats, unmatched = {}, {}
    gdp_by_iso = {}   # iso -> [Σ pop × SPA, Σ pop] (contrôle national)

    def gdp_of(members):
        """PIB/hab. pondéré par la population ; None si une commune n'a pas de région."""
        num = den = 0
        srcs = set()
        for iso, k in members:
            reg = reg_of.get((iso, k))
            if reg is None:
                return None
            pop = tables[iso]["pop"][k]
            num += pop * gdp_regions[reg]["pps"]
            den += pop
            srcs.add(gdp_regions[reg]["source"])
            acc = gdp_by_iso.setdefault(iso, [0, 0])
            acc[0] += pop * gdp_regions[reg]["pps"]
            acc[1] += pop
        return (num / den, srcs) if den else None

    def gdp_fields(res):
        if res is None:
            return {"gdp": None, "gdp_eu": None, "gdp_source": None}
        val, srcs = res
        # « Eurostat NUTS 3 » + « Eurostat NUTS 3 (provisional) » → « Eurostat NUTS 3 (provisional) »
        base, flags = set(), set()
        for x in srcs:
            m = re.match(r"^(.*?)(?: \((provisional|estimate)\))?$", x)
            base.add(m.group(1))
            if m.group(2):
                flags.add(m.group(2))
        label = " · ".join(sorted(base)) + ", 2023" + (f" ({', '.join(sorted(flags))})" if flags else "")
        return {"gdp": int(round(val, -2)), "gdp_eu": round(100 * val / gdp_ctrl["EU27"]),
                "gdp_source": label}
    for s in etats:
        code = s["c"]
        if s["t"] == "T":
            lst = units.get(code, [])
            geom = unary_union([g for _, g in lst])
            total, srcs, missing, keys, n_gadm = 0, set(), [], set(), 0
            for i, (p, g) in enumerate(lst):
                nm = p.get("NAME_" + level(p)) or ""
                iso = p.get("GID_0")
                if norm(nm) in NON_MUNICIPAL or norm(nm) in SUBPARTS.get(iso, set()):
                    continue
                n_gadm += 1
                names = resolved.get((code, i))
                if not names:
                    missing.append(f"{iso}:{nm}")
                    continue
                for n in names:
                    if (iso, n) not in keys:
                        keys.add((iso, n))
                        total += tables[iso]["pop"][n]
                srcs.add(tables[iso]["label"])
            for iso, k in located.get(code, []):
                if (iso, k) not in keys:
                    keys.add((iso, k))
                    total += tables[iso]["pop"][k]
            n_mun = n_gadm if missing else len(keys)
            stats[code] = {
                "municipalities": n_mun,
                "area": round(area_km2(geom)),
                "population": None if missing else total,
                "source": None if missing else " · ".join(sorted(srcs)),
                **gdp_fields(None if missing else gdp_of(sorted(keys))),
            }
            if missing:
                unmatched[code] = missing
        elif code in fed_members:
            mem = fed_members[code]
            stats[code] = {"municipalities": len(mem), "area": None,
                           "population": sum(tables[i]["pop"][k] for i, k in mem),
                           "source": " · ".join(sorted({tables[i]["label"] for i, _ in mem})),
                           **gdp_fields(gdp_of(mem))}
        else:
            stats[code] = {"municipalities": None, "area": None,
                           "population": int(fed_pop[code]["population"]) if code in fed_pop else None,
                           "source": fed_pop[code]["source"] if code in fed_pop else None}
            reg = FED_REGION.get(code)
            if reg and code in fed_pop:
                pop = int(fed_pop[code]["population"])
                iso = next(i for i, cs in FED_OF.items() if code in cs)
                acc = gdp_by_iso.setdefault(iso, [0, 0])
                acc[0] += pop * gdp_regions[reg]["pps"]
                acc[1] += pop
                stats[code].update(gdp_fields((gdp_regions[reg]["pps"],
                                               {gdp_regions[reg]["source"]})))
            else:
                stats[code].update(gdp_fields(None))

    # 4. Superficie des villes-États et municipalités confédérales : contours
    #    portail/data/<CODE>.geojson (raccordés aux États par raccord_contours.py).
    fed_geom = {}
    for s in etats:
        lf = DATA / f"{s['c']}.geojson"
        if s["t"] != "T":
            if not lf.exists():
                sys.exit(f"contour manquant : {lf.relative_to(ROOT)} (lancer scripts/raccord_contours.py)")
            fc = json.loads(lf.read_text(encoding="utf-8"))
            fed_geom[s["c"]] = unary_union([shape(f["geometry"]).buffer(0) for f in fc["features"]])
    for c, g in fed_geom.items():
        stats[c]["area"] = round(area_km2(g))
    # Contrôle : aucune commune d'un État territorial ne doit se trouver dans une
    # ville-État (test sur le point intérieur).
    for code, lst in units.items():
        for p, g in lst:
            pt = g.representative_point()
            for c, fg in fed_geom.items():
                if fg.contains(pt):
                    print(f"  ATTENTION {code} « {p.get('NAME_' + level(p))} » "
                          f"est situé dans le contour de {c}")

    # 5. Contrôles de couverture par pays.
    print("Couverture des recensements :")
    fed_by_iso = {iso: sum(stats[c]["population"] or 0 for c in cs) for iso, cs in FED_OF.items()}
    fed_keys = {(i, k) for mem in fed_members.values() for i, k in mem}
    for iso, t in tables.items():
        used = matched_names.get(iso, set())
        sub = {x for parts in SUBUNITS.values() for x in parts}
        assigned = sum(t["pop"][n] for n in used if n not in sub and (iso, n) not in fed_keys)
        free = sorted(n for n in t["pop"]
                      if n not in used and not any(n in v for v in ALIASES.get(iso, {}).values()))
        line = f"  {iso} : {len(used)} unités appariées, {assigned:,} hab. dans les États"
        if iso in NATIONAL:
            line += f" (+ ville-État {fed_by_iso.get(iso, 0):,}) / total national {NATIONAL[iso]:,}"
        print(line)
        if free and iso != "XKO":
            print(f"     hors États : {', '.join(free)}")
    print("PIB par habitant 2023 (SPA) : moyenne des communes pondérée par la population")
    ctrl_iso = {"SVN": "SVN", "HRV": "HRV", "BGR": "BGR", "SRB": "SRB", "MKD": "MKD",
                "MNE": "MNE", "BIH": "BIH"}
    for iso, (num, den) in sorted(gdp_by_iso.items()):
        ref = gdp_ctrl.get(ctrl_iso.get(iso, ""))
        line = f"  {iso} : {num / den:,.0f} sur {den:,} hab."
        if ref:
            line += f" / national {ref:,} ({100 * (num / den / ref - 1):+.1f} %)"
        print(line)
    n_gdp = sum(1 for v in stats.values() if v["gdp"] is not None)
    print(f"États avec PIB par habitant : {n_gdp}/{len(stats)} ; en attente : "
          f"{', '.join(sorted(c for c, v in stats.items() if v['gdp'] is None))}")
    n_pop = sum(1 for v in stats.values() if v["population"] is not None)
    print(f"États avec population : {n_pop}/{len(stats)} ; en attente : "
          f"{', '.join(sorted(c for c, v in stats.items() if v['population'] is None))}")
    if unmatched:
        print("Communes sans donnée (par État) :")
        for c, lst in sorted(unmatched.items()):
            print(f"  {c} : {len(lst)} ({', '.join(lst[:4])}{'…' if len(lst) > 4 else ''})")

    OUT.write_text(json.dumps(stats, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"→ {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} kB)")

    # Lumières de la carte : une par commune comptée dans un État ou une ville-État,
    # au point intérieur de son contour, intensité selon sa population.
    counted = set()
    for s in etats:
        if s["t"] == "T":
            for i, (p, g) in enumerate(units.get(s["c"], [])):
                for n in resolved.get((s["c"], i), []):
                    counted.add((p.get("GID_0"), n))
            counted.update(located.get(s["c"], []))
    for mem in fed_members.values():
        counted.update(mem)
    lights = {}
    for iso, k in counted:
        xy = pt_of.get((iso, k))
        if xy is None:
            continue
        q = (round(xy[0] * 1000), round(xy[1] * 1000))
        lights[q] = lights.get(q, 0) + tables[iso]["pop"][k]
    for code, (lat, lon) in FED_LIGHT.items():
        if code not in fed_members and code in fed_pop:
            q = (round(lon * 1000), round(lat * 1000))
            lights[q] = lights.get(q, 0) + int(fed_pop[code]["population"])
    flat = []
    for (x, y), pop in sorted(lights.items(), key=lambda kv: kv[1]):
        flat += [x, y, pop]
    OUT_LIGHTS.write_text(json.dumps({"q": 1000, "p": flat}, separators=(",", ":")), encoding="utf-8")
    tot = sum(lights.values())
    print(f"→ {OUT_LIGHTS.relative_to(ROOT)} : {len(lights)} lumières, {tot:,} hab. "
          f"({OUT_LIGHTS.stat().st_size // 1024} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
