#!/usr/bin/env python3
"""Compare deux jeux de captures (mesure.js) : part des pixels qui diffèrent, capture par capture.

Usage : python docs/lot1/outils/compare.py <avant> <après> [--seuil 0.5]

<avant> et <après> sont des dossiers de mesure (docs/lot1/mesures/<étiquette>). Un pixel diffère
si l'un de ses canaux s'écarte de plus de 24 (compression WebP tolérée). Sortie : les captures
au-delà du seuil (en %), puis un résumé ; les contrôles de page (pages.json) des deux côtés.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops


def diff_ratio(a: Path, b: Path) -> float:
    ia, ib = Image.open(a).convert("RGB"), Image.open(b).convert("RGB")
    if ia.size != ib.size:
        return 100.0
    d = ImageChops.difference(ia, ib).convert("L").point(lambda v: 255 if v > 24 else 0)
    return 100.0 * d.histogram()[255] / (ia.size[0] * ia.size[1])


def main() -> int:
    a, b = Path(sys.argv[1]), Path(sys.argv[2])
    seuil = float(sys.argv[sys.argv.index("--seuil") + 1]) if "--seuil" in sys.argv else 0.5
    ca, cb = a / "captures", b / "captures"
    noms = sorted({p.name for p in ca.glob("*.webp")} & {p.name for p in cb.glob("*.webp")})
    seules = sorted({p.name for p in ca.glob("*.webp")} ^ {p.name for p in cb.glob("*.webp")})
    res = {n: round(diff_ratio(ca / n, cb / n), 2) for n in noms}
    ecarts = {n: r for n, r in res.items() if r > seuil}
    for n, r in sorted(ecarts.items(), key=lambda x: -x[1]):
        print(f"{r:6.2f} %  {n}")
    print(f"{len(noms)} captures comparées, {len(ecarts)} au-delà de {seuil} %"
          + (f" ; présentes d'un seul côté : {', '.join(seules)}" if seules else ""))
    pa, pb = (json.loads((d / "pages.json").read_text()) for d in (a, b))
    for k in sorted(set(pa) | set(pb)):
        ea = (pa.get(k) or {}).get("erreurs", []), (pa.get(k) or {}).get("debordement")
        eb = (pb.get(k) or {}).get("erreurs", []), (pb.get(k) or {}).get("debordement")
        if ea != eb:
            print(f"contrôles différents {k} : avant {ea} ; après {eb}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
