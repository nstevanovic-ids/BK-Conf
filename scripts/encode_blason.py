#!/usr/bin/env python3
"""
encode_blason.py — prépare les armoiries d'un État pour sa fiche du portail.

Prend l'image source d'un blason (souvent un JPEG sur fond blanc ou papier clair) et
écrit portail/images/coa-<CODE>.webp, que la fiche État affiche dans la carte
« Coat of arms » (le fichier absent, la carte disparaît d'elle-même) :
  - le fond clair relié aux bords de l'image devient transparent (remplissage depuis
    le pourtour, avec tolérance : le grain du papier ne reste pas) ;
  - la frange anticrénelée du contour est « décolorée » du blanc (color-to-alpha) :
    pas de liseré clair sur le fond sombre du mode nuit ;
  - recadrage au contenu, marge de 2 %, hauteur plafonnée à 1 400 px ;
  - WebP avec transparence, qualité 90.

Les sources restent dans images-sources/symboles/ (<Nom>-CoA.*), jamais modifiées.

Usage :
    python scripts/encode_blason.py TL-40 images-sources/symboles/Torlak-CoA.jpg
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "portail" / "images"
ETATS = ROOT / "portail" / "data" / "etats.json"
MAX_H = 1400
SENTINEL = (255, 0, 255)


def background_mask(img: Image.Image, tol: int) -> np.ndarray:
    """Vrai pour les pixels clairs reliés au pourtour de l'image."""
    work = img.copy()
    w, h = work.size
    step = max(1, min(w, h) // 40)
    seeds = ([(x, 0) for x in range(0, w, step)] + [(x, h - 1) for x in range(0, w, step)] +
             [(0, y) for y in range(0, h, step)] + [(w - 1, y) for y in range(0, h, step)])
    for s in seeds:
        r, g, b = work.getpixel(s)
        if (r, g, b) != SENTINEL and min(r, g, b) > 200:    # graine claire seulement
            ImageDraw.floodfill(work, s, SENTINEL, thresh=tol)
    return np.all(np.asarray(work) == SENTINEL, axis=2)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("code", help="code d'État, ex. TL-40")
    ap.add_argument("source", type=Path, help="image source du blason")
    ap.add_argument("--tol", type=int, default=40, help="tolérance du fond (40)")
    args = ap.parse_args()

    if args.code not in {s["c"] for s in json.loads(ETATS.read_text(encoding="utf-8"))}:
        sys.exit(f"code inconnu dans etats.json : {args.code}")
    img = Image.open(args.source).convert("RGB")
    bg = background_mask(img, args.tol)
    if bg.mean() < 0.02:
        sys.exit("aucun fond clair détecté sur le pourtour : source déjà détourée ?")

    rgb = np.asarray(img).astype(np.float32)
    alpha = np.where(bg, 0.0, 255.0)
    # Frange : 3 px autour du fond, décolorée du blanc.
    near = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(
        ImageFilter.MaxFilter(7))) > 0
    fringe = near & ~bg
    a = (255.0 - rgb.min(axis=2)) / 255.0
    a = np.clip(a / 0.55, 0.0, 1.0)            # un or à 45 % de blanc reste opaque
    safe = np.maximum(a, 1e-3)[..., None]
    unmixed = np.clip((rgb - 255.0 * (1.0 - safe)) / safe, 0, 255)
    rgb = np.where(fringe[..., None], unmixed, rgb)
    alpha = np.where(fringe, a * 255.0, alpha)

    out = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), "RGBA")
    box = out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    m = round(0.02 * max(box[2] - box[0], box[3] - box[1]))
    box = (max(0, box[0] - m), max(0, box[1] - m),
           min(out.width, box[2] + m), min(out.height, box[3] + m))
    out = out.crop(box)
    if out.height > MAX_H:
        out = out.resize((round(out.width * MAX_H / out.height), MAX_H), Image.LANCZOS)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    dst = OUT_DIR / f"coa-{args.code}.webp"
    out.save(dst, "WEBP", quality=90, method=6)
    print(f"{dst.relative_to(ROOT)}  {out.width}×{out.height}  {dst.stat().st_size / 1e3:.0f} ko")
    return 0


if __name__ == "__main__":
    sys.exit(main())
