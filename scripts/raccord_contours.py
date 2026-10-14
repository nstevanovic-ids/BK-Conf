#!/usr/bin/env python3
"""
raccord_contours.py — met en cohérence les contours de la carte (portail/data/*.geojson).

Les contours viennent de sources différentes (GADM par pays, geoBoundaries,
Natural Earth) qui ne se raccordent pas : doublons, recouvrements et trous.
Ce script les corrige dans les fichiers sources, de façon idempotente :

  1. Communes en double : une commune présente dans deux fichiers d'État est
     retirée du fichier « perdant » (rattachements de ASSIGN, build_stats.py).
  2. Villes-États entièrement entourées d'États GADM (BG-91, SF-93, BK-95,
     MO-96) : leur contour est le trou que laissent ces États (cohérent avec les
     voisins, à ±4 % des superficies officielles) ; geoBoundaries sert seulement
     à identifier le bon trou. Écrit dans portail/data/<CODE>.geojson.
  3. Priorité des villes-États et municipalités confédérales : les communes
     voisines sont découpées sur leur contour.
  4. Recouvrements entre États de pays différents : arbitrés par la frontière
     nationale geoBoundaries (ADM0). Territoires occupés : découpés sur les États.
  5. Trous dans la couverture : fusionnés dans la commune voisine avec laquelle
     ils partagent la plus longue frontière.

Ensuite :
    python scripts/build_stats.py
    python scripts/gen_geo.py
    python scripts/build_portail.py --inline
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

from shapely.geometry import Polygon, mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import build_stats as B  # noqa: E402  (norm, geoboundaries, ASSIGN, area_km2, level)

DATA = ROOT / "portail" / "data"
EXTRA = {"LV-LASVA.geojson": "LV", "SO-SOLI.geojson": "SO", "VB-VRHBOSNA.geojson": "VB"}
OCCUPIED = ["KJ-16_Occupied-territories.geojson", "KM-17_Occupied-territories.geojson",
            "Occupied_Beneska-Slovenija_GO-12.geojson"]
# Villes-États tirées du trou laissé par les États voisins ; contour de référence
# geoBoundaries (gbOpen) pour repérer ce trou. MO-96 : référence = fichier existant.
HOLE_FED = {
    "BG-91": ("SRB", "ADM1", "Belgrade", "Grad Beograd"),
    "SF-93": ("BGR", "ADM1", "Sofia City", "Stolichna"),
    "BK-95": ("BIH", "ADM2", "Brcko District", "Brčko distrikt"),
    "MO-96": (None, None, None, "Grad Mostar"),
}
# Code ISO geoBoundaries des frontières nationales (Kosovo : XKX).
GB_ADM0 = {"SRB": "SRB", "BIH": "BIH", "HRV": "HRV", "SVN": "SVN", "MNE": "MNE",
           "MKD": "MKD", "BGR": "BGR", "XKO": "XKX"}
MIN_KM2 = 0.01   # en dessous : bruit numérique, laissé au nettoyage de gen_geo.py


class Entity:
    def __init__(self, code, path, kind):
        self.code, self.path, self.kind = code, path, kind   # kind : T, F, O
        self.fc = json.loads(path.read_text(encoding="utf-8"))
        self.geoms = [shape(f["geometry"]).buffer(0) for f in self.fc["features"]]
        isos = [f["properties"].get("GID_0") for f in self.fc["features"]
                if f["properties"].get("GID_0")]
        self.iso = Counter(isos).most_common(1)[0][0] if isos else None
        self.changed = False
        self._u = None

    def union(self):
        if self._u is None:
            self._u = unary_union(self.geoms)
        return self._u

    def subtract(self, region):
        for i, g in enumerate(self.geoms):
            if g.intersects(region) and B.area_km2(g.intersection(region)) > 1e-4:
                self.geoms[i] = g.difference(region).buffer(0)
                self.changed = True
                self._u = None

    def absorb(self, hole):
        """Fusionne un trou dans la commune de plus longue frontière commune."""
        probe = hole.buffer(0.0003)
        i = max(range(len(self.geoms)),
                key=lambda k: self.geoms[k].boundary.intersection(probe).length)
        self.geoms[i] = unary_union([self.geoms[i], hole]).buffer(0)
        self.changed = True
        self._u = None

    def save(self):
        feats = []
        for f, g in zip(self.fc["features"], self.geoms):
            if g.is_empty:
                continue
            f["geometry"] = mapping(g)
            feats.append(f)
        self.fc["features"] = feats
        self.path.write_text(json.dumps(self.fc, ensure_ascii=False), encoding="utf-8")


def load_entities():
    etats = json.loads((DATA / "etats.json").read_text(encoding="utf-8"))
    by_k = {s["k"]: s for s in etats}
    ents = {}
    for fp in sorted(DATA.glob("*.geojson")):
        m = re.match(r"^([A-Z]{2})-\d+\.geojson$", fp.name)
        k = m.group(1) if m else EXTRA.get(fp.name)
        if k and k in by_k and by_k[k]["t"] == "T":
            ents[by_k[k]["c"]] = Entity(by_k[k]["c"], fp, "T")
    for s in etats:
        if s["t"] != "T" and (DATA / f"{s['c']}.geojson").exists():
            ents[s["c"]] = Entity(s["c"], DATA / f"{s['c']}.geojson", "F")
    for name in OCCUPIED:
        if (DATA / name).exists():
            ents["occ:" + name] = Entity("occ:" + name, DATA / name, "O")
    return etats, by_k, ents


def main() -> int:
    etats, by_k, ents = load_entities()
    log = []

    # 1. Communes en double
    for e in [x for x in ents.values() if x.kind == "T"]:
        k = by_k_code(etats, e.code)
        keep_f, keep_g = [], []
        for f, g in zip(e.fc["features"], e.geoms):
            gid = f["properties"].get("GID_" + B.level(f["properties"]))
            owner = B.ASSIGN.get(gid, k)
            if owner != k:
                log.append(f"doublon retiré : {f['properties'].get('NAME_' + B.level(f['properties']))} ({e.code} → {owner})")
                e.changed = True
                continue
            keep_f.append(f)
            keep_g.append(g)
        e.fc["features"], e.geoms, e._u = keep_f, keep_g, None

    # 2. Villes-États : trou laissé par les États voisins
    base = unary_union([e.union() for c, e in ents.items() if c not in HOLE_FED])
    holes = [Polygon(r) for p in getattr(base, "geoms", [base]) for r in p.interiors]
    for code, (iso, adm, gbname, label) in HOLE_FED.items():
        if iso:
            hit = [f for f in B.geoboundaries(iso, adm)["features"]
                   if f["properties"].get("shapeName") == gbname]
            if len(hit) != 1:
                sys.exit(f"geoBoundaries {iso} {adm} : « {gbname} » introuvable")
            ref = shape(hit[0]["geometry"]).buffer(0)
        else:
            ref = ents[code].union()
        best = max(holes, key=lambda h: h.intersection(ref).area, default=None)
        if best is None or best.intersection(ref).area < 0.8 * ref.area:
            log.append(f"{code} : aucun trou correspondant, contour inchangé")
            continue
        ratio = best.area / ref.area
        if not 0.85 <= ratio <= 1.15:
            log.append(f"{code} : trou de taille incohérente ({ratio:.0%}), contour inchangé")
            continue
        path = DATA / f"{code}.geojson"
        path.write_text(json.dumps({"type": "FeatureCollection", "features": [{
            "type": "Feature",
            "properties": {"NAME_1": label,
                           "source": "GADM : trou laissé par les États voisins (repéré avec geoBoundaries)"},
            "geometry": mapping(best)}]}, ensure_ascii=False), encoding="utf-8")
        ents[code] = Entity(code, path, "F")
        holes.remove(best)
        log.append(f"contour {code} ({label}) : {B.area_km2(best):.0f} km²")

    # 3. Priorité des villes-États
    for f in [x for x in ents.values() if x.kind == "F"]:
        fu = f.union()
        for e in ents.values():
            if e is not f and e.kind != "F" and e.union().intersects(fu):
                before = B.area_km2(e.union().intersection(fu))
                if before > MIN_KM2:
                    e.subtract(fu)
                    log.append(f"{e.code} découpé sur {f.code} : {before:.1f} km²")

    # 4. Recouvrements entre États ; territoires occupés sous les États
    adm0 = {}
    codes = [c for c, e in ents.items() if e.kind in ("T", "O")]
    for i, a in enumerate(codes):
        for b in codes[i + 1:]:
            A, Bb = ents[a], ents[b]
            ov = A.union().intersection(Bb.union())
            if ov.is_empty or B.area_km2(ov) < MIN_KM2:
                continue
            if "O" in (A.kind, Bb.kind):
                occ, st = (A, Bb) if A.kind == "O" else (Bb, A)
                occ.subtract(ov)
                log.append(f"{occ.code} découpé sous {st.code} : {B.area_km2(ov):.1f} km²")
                continue
            if A.iso != Bb.iso and A.iso in GB_ADM0 and Bb.iso in GB_ADM0:
                for iso in (A.iso, Bb.iso):
                    if iso not in adm0:
                        adm0[iso] = unary_union([shape(x["geometry"]).buffer(0) for x in
                                                 B.geoboundaries(GB_ADM0[iso], "ADM0")["features"]])
                to_a = ov.intersection(adm0[A.iso])
                to_b = ov.difference(to_a)
                A.subtract(to_b)
                Bb.subtract(to_a)
                log.append(f"recouvrement {a}/{b} ({B.area_km2(ov):.1f} km²) arbitré par la frontière {A.iso}/{Bb.iso}")
            else:
                Bb.subtract(ov)
                log.append(f"recouvrement {a}/{b} ({B.area_km2(ov):.1f} km²) laissé à {a}")

    # 5. Trous
    allu = unary_union([e.union() for e in ents.values()])
    holes = [Polygon(r) for p in getattr(allu, "geoms", [allu]) for r in p.interiors]
    filled = 0.0
    for h in holes:
        a = B.area_km2(h)
        if a < MIN_KM2:
            continue
        probe = h.buffer(0.0003)
        best = max(ents.values(), key=lambda e: e.union().boundary.intersection(probe).length)
        best.absorb(h)
        filled += a
        if a >= 1:
            c = h.representative_point()
            log.append(f"trou {a:.1f} km² ({c.y:.3f}, {c.x:.3f}) → {best.code}")

    for e in ents.values():
        if e.changed:
            e.save()
    print("\n".join(log))
    allu = unary_union([e.union() for e in ents.values()])
    rest = [B.area_km2(Polygon(r)) for p in getattr(allu, "geoms", [allu]) for r in p.interiors]
    print(f"\nTrous comblés : {filled:.1f} km² ; trous restants : {sum(1 for x in rest if x >= MIN_KM2)} "
          f"(> {MIN_KM2} km²) ; fichiers modifiés : "
          f"{', '.join(sorted(e.path.name for e in ents.values() if e.changed))}")
    return 0


def by_k_code(etats, code):
    return next(s["k"] for s in etats if s["c"] == code)


if __name__ == "__main__":
    sys.exit(main())
