#!/usr/bin/env python3
"""
gen_favicon.py — génère les icônes du portail à partir du lion ailé confédéral.

Source  : images-sources/symboles/BK-CoA.png (lion ailé d'or, fond transparent)
Sorties : portail/favicon.ico           16 / 32 / 48 px, tuile arrondie
          portail/apple-touch-icon.png  180 px, tuile pleine (iOS applique son masque)

Composition : lion d'or (couleur du fichier source, non recolorée) sur la tuile
indigo de chrome du portail (#1f2742), identique à l'en-tête (masthead).
Un lion d'or sur fond transparent serait illisible sur un onglet clair.

Usage :
    python scripts/gen_favicon.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images-sources" / "symboles" / "BK-CoA.png"
OUT = ROOT / "portail"

INDIGO = (0x1F, 0x27, 0x42)   # --indigo, chrome structurel du portail
SS = 8                        # suréchantillonnage pour l'anticrénelage des coins

# taille → (marge relative autour du lion, rayon relatif des coins, renfort alpha)
# Les petites tailles réduisent la marge et renforcent l'opacité du lion : les
# hachures internes du dessin, moyennées à 16-32 px, ternissent sinon la silhouette.
SPEC_ICO = {16: (0.03, 0.20, 1.6), 32: (0.08, 0.20, 1.3), 48: (0.10, 0.20, 1.15)}
SPEC_TOUCH = (180, 0.14, 0.0, 1.0)  # pleine tuile, sans arrondi


def load_lion():
    """Retourne (couleur RGB du lion, masque alpha L) depuis la source."""
    im = Image.open(SRC).convert("RGBA")
    alpha = im.getchannel("A")
    im = im.crop(alpha.getbbox())
    # Le lion est monochrome : on prend la couleur du pixel le plus opaque.
    px = max(im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata(),
             key=lambda p: p[3])
    return px[:3], im.getchannel("A")


def tile(size: int, pad: float, radius: float, boost: float, gold,
         mask: Image.Image) -> Image.Image:
    # Fond : tuile indigo, coins arrondis dessinés en suréchantillonnage
    big = size * SS
    shape = Image.new("L", (big, big), 0)
    ImageDraw.Draw(shape).rounded_rectangle(
        (0, 0, big - 1, big - 1), radius=int(radius * big), fill=255)
    shape = shape.resize((size, size), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), INDIGO + (0,))
    out.putalpha(shape)

    # Lion : on redimensionne le masque alpha seul (pas de halo de prémultiplication)
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

    icons = [tile(s, p, r, b, gold, mask) for s, (p, r, b) in sorted(SPEC_ICO.items())]
    ico = OUT / "favicon.ico"
    # Pillow écrit chaque taille demandée à partir de append_images si fournies
    icons[-1].save(ico, format="ICO", sizes=[(i.width, i.height) for i in icons],
                   append_images=icons[:-1])

    size, pad, radius, boost = SPEC_TOUCH
    touch = tile(size, pad, radius, boost, gold, mask).convert("RGB")
    apple = OUT / "apple-touch-icon.png"
    touch.save(apple, optimize=True)

    for f in (ico, apple):
        print(f"{f.relative_to(ROOT)}  ({f.stat().st_size} o)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
