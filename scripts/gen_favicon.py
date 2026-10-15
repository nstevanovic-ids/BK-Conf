#!/usr/bin/env python3
"""
gen_favicon.py — génère les icônes du portail à partir du lion ailé confédéral.

Source  : images-sources/symboles/BK-CoA.png (lion ailé d'or, fond transparent)
Sorties : portail/favicon.ico           16 / 32 / 48 px
          portail/apple-touch-icon.png  180 px

Composition : le lion ailé seul, d'or (couleur du fichier source, non recolorée),
sur fond transparent, sans tuile ni contour.

Usage :
    python scripts/gen_favicon.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images-sources" / "symboles" / "BK-CoA.png"
OUT = ROOT / "portail"

# taille → (marge relative autour du lion, renfort alpha)
# Aux petites tailles, le renfort d'opacité évite que les hachures internes du
# dessin, moyennées à 16-32 px, ne ternissent la silhouette.
SPEC_ICO = {16: (0.0, 1.6), 32: (0.0, 1.3), 48: (0.02, 1.15)}
SPEC_TOUCH = (180, 0.06, 1.0)


def load_lion():
    """Retourne (couleur RGB du lion, masque alpha L) depuis la source."""
    im = Image.open(SRC).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    # Le lion est monochrome : on prend la couleur du pixel le plus opaque.
    data = im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()
    px = max(data, key=lambda p: p[3])
    return px[:3], im.getchannel("A")


def icon(size: int, pad: float, boost: float, gold, mask: Image.Image) -> Image.Image:
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # On redimensionne le masque alpha seul (pas de halo de prémultiplication)
    box = size * (1 - 2 * pad)
    w, h = mask.size
    k = box / max(w, h)
    lw, lh = max(1, round(w * k)), max(1, round(h * k))
    m = mask.resize((lw, lh), Image.LANCZOS)
    if boost != 1.0:
        m = m.point(lambda v: min(255, round(v * boost)))
    layer = Image.new("RGBA", (lw, lh), tuple(gold) + (255,))
    layer.putalpha(m)
    out.alpha_composite(layer, ((size - lw) // 2, (size - lh) // 2))
    return out


def main() -> int:
    gold, mask = load_lion()

    icons = [icon(s, p, b, gold, mask) for s, (p, b) in sorted(SPEC_ICO.items())]
    ico = OUT / "favicon.ico"
    icons[-1].save(ico, format="ICO", sizes=[(i.width, i.height) for i in icons],
                   append_images=icons[:-1])

    size, pad, boost = SPEC_TOUCH
    apple = OUT / "apple-touch-icon.png"
    icon(size, pad, boost, gold, mask).save(apple, optimize=True)

    for f in (ico, apple):
        print(f"{f.relative_to(ROOT)}  ({f.stat().st_size} o)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
