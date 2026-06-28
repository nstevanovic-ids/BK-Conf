#!/usr/bin/env python3
"""
encode_drapeaux.py — pipeline d'encodage des drapeaux d'États.

Lit les images sources dans images-sources/drapeaux/, les encode en PNG palette
base64 et écrit portail/data/state_flags.json.

RÈGLE CRITIQUE : le nom de fichier n'est PAS la source de vérité. L'ordre d'upload
suit l'ordre alphabétique des codes d'États. Le mapping explicite ci-dessous (MAPPING)
doit être tenu à jour et vérifié visuellement (view) avant chaque run.

Pipeline : ouverture (PIL) → RGB → resize (max 400px large, LANCZOS) →
mode palette (ADAPTIVE, 64 couleurs, Floyd-Steinberg) → PNG optimisé → base64.
SVG → cairosvg → PNG d'abord. WebP s'ouvre directement avec PIL.

Usage :
    python scripts/encode_drapeaux.py
"""
import base64
import io
import json
import sys
from pathlib import Path

from PIL import Image

try:
    import cairosvg
    HAS_CAIRO = True
except ImportError:
    HAS_CAIRO = False

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "images-sources" / "drapeaux"
OUT_JSON = ROOT / "portail" / "data" / "state_flags.json"

MAX_WIDTH = 400
PALETTE_COLORS = 64

# Mapping code d'État → fichier source. Tenir à jour. Vérifier visuellement.
# (Les fichiers absents sont simplement ignorés — permet l'ajout incrémental.)
MAPPING = {
    "BA-01": "BA.png", "BC-02": "BC.png", "BN-03": "BN.png", "BR-04": "BR.png",
    "BS-05": "BS.png", "BZ-06": "BZ.png", "CG-07": "CG.png", "CM-08": "CM.png",
    "DA-09": "DA.png", "DJ-10": "DJ.png", "DR-11": "DR.png", "GV-12": "GV.png",
    "HZ-13": "HZ.png", "HI-14": "HI.png", "IS-15": "IS.png", "KJ-16": "KJ.png",
    "KM-17": "KM.png", "KR-18": "KR.png", "KV-19": "KV.png", "LG-20": "LG.png",
    "LK-21": "LK.png", "MI-22": "MI.png", "MZ-23": "MZ.png", "PI-24": "PI.png",
    "PM-25": "PM.png", "PO-26": "PO.png", "PR-27": "PR.png", "PZ-28": "PZ.png",
    "RO-29": "RO.png", "RS-30": "RS.png", "SI-31": "SI.png", "SL-32": "SL.png",
    "SP-33": "SP.png", "ST-34": "ST.png", "SU-35": "SU.png", "SX-36": "SX.png",
    "SZ-37": "SZ.png", "TK-38": "TK.png", "TL-39": "TL.png", "TR-40": "TR.png",
    "VI-41": "VI.png", "VZ-42": "VZ.png", "ZA-43": "ZA.png",
}


def load_image(path: Path) -> Image.Image:
    """Ouvre une image (PNG/JPG/WebP direct, SVG via cairosvg)."""
    if path.suffix.lower() == ".svg":
        if not HAS_CAIRO:
            raise RuntimeError("cairosvg requis pour les SVG : pip install cairosvg")
        png_bytes = cairosvg.svg2png(url=str(path), output_width=MAX_WIDTH)
        return Image.open(io.BytesIO(png_bytes)).convert("RGB")
    return Image.open(path).convert("RGB")


def encode_flag(path: Path) -> str:
    img = load_image(path)
    w, h = img.size
    if w > MAX_WIDTH:
        img = img.resize((MAX_WIDTH, int(h * MAX_WIDTH / w)), Image.LANCZOS)
    img_p = img.convert(
        "P", palette=Image.ADAPTIVE, colors=PALETTE_COLORS, dither=Image.FLOYDSTEINBERG
    )
    buf = io.BytesIO()
    img_p.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def main() -> int:
    flags = {}
    if OUT_JSON.exists():
        flags = json.loads(OUT_JSON.read_text())  # préserve l'existant

    encoded, skipped = 0, 0
    for code, fname in MAPPING.items():
        path = SRC_DIR / fname
        if not path.exists():
            skipped += 1
            continue
        flags[code] = encode_flag(path)
        encoded += 1
        print(f"  {code}: {path.name}")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(flags, ensure_ascii=False))
    total_kb = len(json.dumps(flags)) // 1024
    print(f"\n{encoded} encodés, {skipped} absents. Total : {len(flags)} drapeaux, {total_kb} kB.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
