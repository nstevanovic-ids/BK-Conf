#!/usr/bin/env python3
"""construction_usora.py — drapeau 3:2 et blason d'Usora (US-43), version byzantine.

De gueules à la croix d'or traversante, cantonnée de quatre briquets d'or adossés à la croix :
la croix serbe aux couleurs de la bannière des Paléologues. Le briquet est le symbole « elm »
de File:Serbian_Cross.svg (Wikimedia Commons), fourni par l'utilisateur et conservé dans
images-sources/symboles/Serbian_Cross-Commons.svg ; cf. ADR
docs/decisions/2026-11-05-usora-byzantin.md. La version au chevron et aux croissants
(ADR 2026-11-05-drapeau-blason-usora.md) est remplacée ; ses sources restent dans le dépôt.

Écrit images-sources/drapeaux/Usora-Flag-v2.svg et images-sources/symboles/Usora-CoA-v2.svg,
plus Usora-CoA-v2.png (fond blanc, 1160 px de large) pour scripts/encode_blason.py.

Usage :
    python scripts/construction_usora.py
"""
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
GOLD, RED, WHITE, INK = "#FAC033", "#B63033", "#FFFFFF", "#1E1B1B"

# Briquet de File:Serbian_Cross.svg : repère centré, x de -52,2 à 52,2, y de -79,6 à 79,6 ;
# bord droit (x = 50,464) plat, volutes à gauche.
OCILO = ("M50.464,64.955V-64.956 C22.143-72.561-46.82-100.027-50.409-39.811C-52.068-11.976-15.865,6.386-6.102-18.202"
         "C-1.481-29.839-6.515-38.08-13.32-40.74 c-7.354-2.87-14.651,3.071-12.701,11.926C-55.336-44.129,0.17-76.65,25.235-34.326"
         "C32.533-22.001,12.914-9.151,12.889-0.01 c-0.025,9.142,19.275,22.827,12.346,34.331c-25.378,42.123-80.571,9.809-51.256-5.51"
         "c-1.95,8.854,5.346,14.796,12.701,11.924 C-6.514,38.078-1.481,29.836-6.102,18.2c-9.763-24.591-45.965-6.229-44.307,21.607"
         "C-46.819,100.027,22.144,72.561,50.464,64.955 L50.464,64.955z")
OC_HW, OC_HH = 52.214, 79.574


def ocilo(cx, cy, s, back_right):
    """Briquet centré en (cx, cy), à l'échelle s ; back_right : dos plat à droite."""
    sx = s if back_right else -s
    return (f'<path transform="translate({cx:.2f} {cy:.2f}) scale({sx:.4f} {s:.4f})" '
            f'd="{OCILO}" fill="{GOLD}"/>')


def flag_svg():
    """3:2 : croix traversante de 0,15 H ; un briquet centré dans chaque quartier, haut de
    0,74 fois le quartier."""
    W, H, w = 1500, 1000, 150
    x0, x1, y0, y1 = W / 2 - w / 2, W / 2 + w / 2, H / 2 - w / 2, H / 2 + w / 2
    s = 0.74 * y0 / (2 * OC_HH)
    oc = [ocilo(x0 / 2, y0 / 2, s, True), ocilo(x0 / 2, (y1 + H) / 2, s, True),
          ocilo((x1 + W) / 2, y0 / 2, s, False), ocilo((x1 + W) / 2, (y1 + H) / 2, s, False)]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<title>Usora (US-43)</title>
<rect width="{W}" height="{H}" fill="{RED}"/>
<rect x="{x0}" y="0" width="{w}" height="{H}" fill="{GOLD}"/>
<rect x="0" y="{y0}" width="{W}" height="{w}" fill="{GOLD}"/>
{chr(10).join(oc)}
</svg>
'''


# Écu d'Usora : champ de demi-largeur 255 et de hauteur 620, origine au milieu du bord
# supérieur ; bas en courbes de Bézier (mesurées sur le blason fourni le 2026-11-05).
HW, FH = 255, 620
SHIELD = (f"M {-HW} 0 L {HW} 0 L {HW} 227.4 C {HW} 406 131.5 570.6 0 {FH} "
          f"C -131.5 570.6 {-HW} 406 {-HW} 227.4 Z")


def half_width(y):
    if y <= 227.4:
        return HW
    P = [np.array(p, float) for p in ((HW, 227.4), (HW, 406), (131.5, 570.6), (0, FH))]
    t = np.linspace(0, 1, 2001)[:, None]
    c = (1 - t) ** 3 * P[0] + 3 * (1 - t) ** 2 * t * P[1] + 3 * (1 - t) * t ** 2 * P[2] + t ** 3 * P[3]
    return float(np.interp(y, c[:, 1], c[:, 0]))


def coa_svg():
    """Croix de 86 à traverse haute (centre à 245) : l'écu finit en pointe, les briquets du
    bas doivent y tenir ; quatre briquets à l'échelle 0,9, à 135 du pal."""
    arm, yh, s, dx = 86, 245, 0.9, 135
    y0, y1 = yh - arm / 2, yh + arm / 2
    yu, yl = y0 / 2 + 4, y1 + 14 + OC_HH * s
    for y in (yl - OC_HH * s, yl, yl + OC_HH * s):        # les briquets du bas tiennent dans l'écu
        assert dx + OC_HW * s + 10 < half_width(y)
    oc = [ocilo(-dx, yu, s, True), ocilo(-dx, yl, s, True),
          ocilo(dx, yu, s, False), ocilo(dx, yl, s, False)]
    bord, edge = 8, 2.5
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="540" height="652" viewBox="-270 -16 540 652">
<title>Usora (US-43) — blason</title>
<defs><clipPath id="champ"><path d="{SHIELD}"/></clipPath></defs>
<path d="{SHIELD}" fill="none" stroke="{INK}" stroke-width="{2 * (bord + edge)}" stroke-linejoin="miter"/>
<path d="{SHIELD}" fill="{WHITE}" stroke="{WHITE}" stroke-width="{2 * bord}" stroke-linejoin="miter"/>
<g clip-path="url(#champ)">
<rect x="-300" y="-60" width="600" height="760" fill="{RED}"/>
<rect x="{-arm / 2}" y="-60" width="{arm}" height="760" fill="{GOLD}"/>
<rect x="-300" y="{y0}" width="600" height="{arm}" fill="{GOLD}"/>
{chr(10).join(oc)}
</g>
</svg>
'''


def main():
    flag = ROOT / "images-sources" / "drapeaux" / "Usora-Flag-v2.svg"
    coa = ROOT / "images-sources" / "symboles" / "Usora-CoA-v2.svg"
    flag.write_text(flag_svg(), encoding="utf-8")
    coa.write_text(coa_svg(), encoding="utf-8")
    import cairosvg
    cairosvg.svg2png(url=str(coa), write_to=str(coa.with_suffix(".png")), output_width=1160,
                     background_color="white")
    for f in (flag, coa, coa.with_suffix(".png")):
        print(f.relative_to(ROOT))


if __name__ == "__main__":
    main()
