#!/usr/bin/env python3
"""
gen_wallet_images.py — images du pass Google Wallet (carte citoyenne).

  portail/images/wallet-logo.png  660 × 660   lion ailé or vieilli sur azur (Google le recadre en cercle)
  portail/images/wallet-hero.png  1032 × 336  bandeau : fond de sécurité, guilloches, lion en filigrane

Le registre (registre/src/wallet.js) référence ces fichiers par leur URL publique sur
GitHub Pages. Rendu par Chromium headless (Playwright) depuis le lion de portail/index.html
et la police Zurich de portail/fonts/.
    pip install playwright && playwright install chromium
    python scripts/gen_wallet_images.py
"""
import base64
import math
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
HTML = (ROOT / "portail" / "index.html").read_text(encoding="utf-8")
COA = re.search(r'const COA_DATA="(data:image/png;base64,[^"]+)"', HTML).group(1)
FONTS = ROOT / "portail" / "fonts"


def font_face():
    css = ""
    for w, f in (("300 500", "zurich-regular.woff2"), ("600 900", "zurich-bold.woff2")):
        fp = FONTS / f
        if fp.exists():
            b64 = base64.b64encode(fp.read_bytes()).decode()
            css += f"@font-face{{font-family:Zurich;font-weight:{w};src:url(data:font/woff2;base64,{b64}) format('woff2')}}"
    return css


def guilloche(w, h, n, col, op, amp, per):
    d = []
    for i in range(n):
        y0 = h * (i + .5) / n
        pts = [f"{'M' if x == 0 else 'L'}{x} {y0 + math.sin(x / per + i * .9) * amp + math.sin(x / (per * 2.9) + i * .37) * amp * .7:.1f}"
               for x in range(0, w + 1, 8)]
        d.append(" ".join(pts))
    return f'<path d="{" ".join(d)}" fill="none" stroke="{col}" stroke-width=".6" opacity="{op}"/>'


def rosette(cx, cy, rx, ry, n, col, op):
    e = "".join(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({180 * i / n:.2f} {cx} {cy})"/>' for i in range(n))
    return f'<g fill="none" stroke="{col}" stroke-width=".7" opacity="{op}">{e}</g>'


GOLD = '<filter id="g" color-interpolation-filters="sRGB"><feFlood flood-color="#c9a95c"/><feComposite in2="SourceAlpha" operator="in"/></filter>'
GOLD_DARK = '<filter id="gd" color-interpolation-filters="sRGB"><feFlood flood-color="#ad8f47"/><feComposite in2="SourceAlpha" operator="in"/></filter>'

LOGO = f'''<svg id="logo" width="660" height="660" viewBox="0 0 660 660" xmlns="http://www.w3.org/2000/svg">
<defs>{GOLD}<radialGradient id="bg" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#3a4478"/><stop offset="1" stop-color="#232a52"/></radialGradient></defs>
<rect width="660" height="660" fill="url(#bg)"/>
{rosette(330, 330, 250, 82, 30, "#c9a95c", .22)}
<image href="{COA}" x="150" y="165" width="360" height="330" filter="url(#g)" preserveAspectRatio="xMidYMid meet"/>
</svg>'''

HERO = f'''<svg id="hero" width="1032" height="336" viewBox="0 0 1032 336" xmlns="http://www.w3.org/2000/svg" font-family="Zurich,Inter,Arial,sans-serif">
<defs>{GOLD_DARK}<linearGradient id="hb" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#f7ece7"/><stop offset=".45" stop-color="#f7f5f0"/><stop offset="1" stop-color="#e3eaf4"/></linearGradient></defs>
<rect width="1032" height="336" fill="url(#hb)"/>
{guilloche(1032, 336, 22, "#2c3466", .12, 7, 30)}
{guilloche(1032, 336, 11, "#b49a52", .12, 11, 57)}
{rosette(820, 168, 230, 70, 34, "#2c3466", .08)}
<image href="{COA}" x="690" y="38" width="290" height="260" opacity=".16" filter="url(#gd)" preserveAspectRatio="xMidYMid meet"/>
<image href="{COA}" x="56" y="104" width="118" height="106" filter="url(#gd)" preserveAspectRatio="xMidYMid meet"/>
<text x="200" y="152" font-size="31" font-weight="600" fill="#2c3466" letter-spacing="6">BALKANSKA KONFEDERACIJA</text>
<text x="200" y="190" font-size="20" fill="#8a90a0" letter-spacing="5">BALKAN CONFEDERATION</text>
<line x1="200" y1="216" x2="880" y2="216" stroke="#b49a52" stroke-width="1.2"/>
<path d="M540 211 L545 216 L540 221 L535 216 Z" fill="#b49a52"/>
<text x="200" y="250" font-size="19" fill="#5f6678" font-style="italic">Različiti narodi, jedan dom</text>
</svg>'''


def main():
    out = ROOT / "portail" / "images"
    page_html = f"<!doctype html><html><head><style>{font_face()}body{{margin:0}}svg{{display:block}}</style></head><body>{LOGO}{HERO}</body></html>"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(device_scale_factor=1, viewport={"width": 1100, "height": 1100})
        pg.set_content(page_html)
        pg.wait_for_timeout(400)
        pg.locator("#logo").screenshot(path=str(out / "wallet-logo.png"))
        pg.locator("#hero").screenshot(path=str(out / "wallet-hero.png"))
        b.close()
    for f in ("wallet-logo.png", "wallet-hero.png"):
        print(f"→ portail/images/{f} ({(out / f).stat().st_size // 1024} kB)")


if __name__ == "__main__":
    main()
