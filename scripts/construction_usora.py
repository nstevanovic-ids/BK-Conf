#!/usr/bin/env python3
"""construction_usora.py — drapeau 3:2 et blason d'Usora (US-43), construits par géométrie.

Blason : parti d'or et de gueules, au chevron contre-changé, chargé de trois croissants
d'argent, celui de la pointe montant, ceux des branches tournés vers la pointe du chevron.
Les mesures viennent du blason source (images-sources/symboles/Usora-CoA-source.png ; champ de
510 × 620 px) ; cf. ADR docs/decisions/2026-11-05-drapeau-blason-usora.md.

Écrit images-sources/drapeaux/Usora-Flag.svg et images-sources/symboles/Usora-CoA.svg, plus
Usora-CoA.png (fond blanc, 1160 px de large) pour scripts/encode_blason.py.

Usage :
    python scripts/construction_usora.py
"""
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GOLD, RED, WHITE, INK = "#FAC033", "#B63033", "#FFFFFF", "#1E1B1B"
S = 1.26                     # pente du chevron (51,6°), mesurée sur le blason
ANG = math.degrees(math.atan(S))


def crescent(cx, cy, rot, R):
    """Croissant montant (ouvert vers le haut) tourné de rot degrés : disque de rayon R
    moins un disque de rayon 0,937 R décalé de 0,50 R vers l'ouverture."""
    r, d = 0.937 * R, 0.50 * R
    y0 = (r * r - R * R - d * d) / (2 * d)          # hauteur des pointes
    x0 = math.sqrt(R * R - y0 * y0)
    large = 1 if y0 < -d else 0
    p = (f"M {-x0:.2f} {y0:.2f} A {R:.2f} {R:.2f} 0 1 0 {x0:.2f} {y0:.2f} "
         f"A {r:.2f} {r:.2f} 0 {large} 1 {-x0:.2f} {y0:.2f} Z")
    return f'<path transform="translate({cx:.2f} {cy:.2f}) rotate({rot:.2f})" d="{p}" fill="{WHITE}"/>'


def flag_svg():
    """Drapeau 3:2 : même pente que le blason, le bord extérieur du chevron passe par les
    coins du bas ; croissants à la taille du blason rapportée au chevron, ceux des branches
    au milieu des branches."""
    W, H = 1500, 1000
    A = H - S * W / 2                 # sommet extérieur (55)
    T = 360                           # épaisseur verticale (0,36 H, comme sur le blason)
    K = T / 231                       # échelle blason → drapeau
    R = 59 * K
    cx, xi, dx = W / 2, (H - (A + T)) / S, 300
    yl = A + T / 2 + S * dx
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<title>Usora (US-43)</title>
<rect x="0" y="0" width="{cx}" height="{H}" fill="{GOLD}"/>
<rect x="{cx}" y="0" width="{cx}" height="{H}" fill="{RED}"/>
<path d="M {cx} {A:.2f} L {cx} {A + T:.2f} L {cx - xi:.2f} {H} L 0 {H} Z" fill="{RED}"/>
<path d="M {cx} {A:.2f} L {W} {H} L {cx + xi:.2f} {H} L {cx} {A + T:.2f} Z" fill="{GOLD}"/>
{crescent(cx, A + 144 * K, 0, R)}
{crescent(cx - dx, yl, 90 - ANG, R)}
{crescent(cx + dx, yl, -(90 - ANG), R)}
</svg>
'''


def coa_svg():
    """Blason : champ de demi-largeur 255 et de hauteur 620 (origine au milieu du bord
    supérieur) ; bas de l'écu en courbes de Bézier ajustées sur le contour source (écart
    moyen 1,4 px) ; bordure d'argent et liseré sombre."""
    HW, FH = 255, 620
    p = (f"M {-HW} 0 L {HW} 0 L {HW} 227.4 C {HW} 406 131.5 570.6 0 {FH} "
         f"C -131.5 570.6 {-HW} 406 {-HW} 227.4 Z")
    CA, CT, R, BORD, EDGE = 18, 231, 59.0, 8, 2.5
    m = HW + 50
    yo, xb = CA + S * m, (FH + 50 - (CA + CT)) / S
    cy = CA + CT / 2 + S * 136.5
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="540" height="652" viewBox="-270 -16 540 652">
<title>Usora (US-43) — blason</title>
<defs><clipPath id="champ"><path d="{p}"/></clipPath></defs>
<path d="{p}" fill="none" stroke="{INK}" stroke-width="{2 * (BORD + EDGE)}" stroke-linejoin="miter"/>
<path d="{p}" fill="{WHITE}" stroke="{WHITE}" stroke-width="{2 * BORD}" stroke-linejoin="miter"/>
<g clip-path="url(#champ)">
<rect x="{-m}" y="-60" width="{m}" height="{FH + 120}" fill="{GOLD}"/>
<rect x="0" y="-60" width="{m}" height="{FH + 120}" fill="{RED}"/>
<path d="M 0 {CA} L 0 {CA + CT} L {-xb:.2f} {FH + 50} L {-m} {FH + 50} L {-m} {yo:.2f} Z" fill="{RED}"/>
<path d="M 0 {CA} L {m} {yo:.2f} L {m} {FH + 50} L {xb:.2f} {FH + 50} L 0 {CA + CT} Z" fill="{GOLD}"/>
{crescent(0, 162, 0, R)}
{crescent(-136.5, cy, 90 - ANG, R)}
{crescent(136.5, cy, -(90 - ANG), R)}
</g>
</svg>
'''


def main():
    flag = ROOT / "images-sources" / "drapeaux" / "Usora-Flag.svg"
    coa = ROOT / "images-sources" / "symboles" / "Usora-CoA.svg"
    flag.write_text(flag_svg(), encoding="utf-8")
    coa.write_text(coa_svg(), encoding="utf-8")
    import cairosvg
    cairosvg.svg2png(url=str(coa), write_to=str(coa.with_suffix(".png")), output_width=1160,
                     background_color="white")
    for f in (flag, coa, coa.with_suffix(".png")):
        print(f.relative_to(ROOT))


if __name__ == "__main__":
    main()
