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

Usage : voir main() (--verify, --all, codes d'États).
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

# Mapping code d'État → fichier source, reconstruit le 2026-10-25 depuis les codes actuels
# (etats.json) : chaque drapeau affiché par le portail a été comparé à toutes les sources
# (écart quadratique moyen sur une vignette 60 × 40) ; le meilleur appariement est à moins
# de 10, le suivant à plus de 600. `--verify` refait ce contrôle. Le nom de fichier n'est
# pas la source de vérité : tout ajout se vérifie visuellement, puis par --verify.
# Sources non utilisées : Flag_of_Srednja_Bosna.png (État supprimé), Lika-Flag.png,
# Zapadna-Mizija-Flag-v2.png et Flag_of_Zapadna-Mizija.svg (versions remplacées).
MAPPING = {
    "BA-01": "Flag_of_Bosanska-Krajina.png",
    "BC-02": "flag_BC02.png",
    "BN-03": "flag_BN03.png",
    "BR-04": "Flag_of_Baranja_State_svg.png",
    "BZ-05": "Zapadna-Bosna-Flag_3x.png",
    "CG-06": "Flag_of_CG-07_svg.png",
    "CM-07": "SD-Black-Sea-Flag_3x.png",
    "DA-08": "SD-Dalmacija-Flag_3x.png",
    "DJ-09": "south-dobruja-flag.png",
    "DR-10": "SD-Dubrovnik-Flag_3x.png",
    "GV-11": "Vzhodna-Goriska-Flag.png",
    "HI-12": "Flag_from_the_Kosaca_COA_crest_Istocna-Hercegovina_svg.png",
    "HZ-13": "HZ-Flag.png",
    "IS-14": "SD-Istra-Flag_3x.png",
    "KJ-15": "Flag_of_KJ_svg.png",
    "KM-16": "SD-Severno-Kosovo-Flag_3x.png",
    "KR-17": "Flag_of_Kranjska.png",
    "KV-18": "Flag-Kvarner_svg.png",
    "LG-19": "Ludogorie-Flag.png",
    "LK-20": "Lika-Flag-Velebit.webp",
    "LV-21": "Lasva-Flag.webp",
    "MI-22": "Istocna-Mizija-Flag.png",
    "MZ-23": "Zapadna-Mizija-Flag-v3.png",
    "PI-24": "Istocno-Podrinje-Flag.png",
    "PM-25": "Flag_of_Prekmurje.png",
    "PO-26": "Podunavlje-Flag-V3.png",
    "PR-27": "Pirin-Flag.jpg",
    "PZ-28": "Flag-of-Zapadno-Podrinje.png",
    "RO-29": "Rodopi-Flag-v2.png",
    "RS-30": "SD-Raska-Sandzak-Flag.png",
    "SI-31": "SD-Istocni-Srem-Flag_4x.png",
    "SL-32": "SD-Slavonia-Flag-Horizontal.png",
    "SO-33": "Soli-Flag.png",
    "SP-34": "SD-Sopluk-Flag.png",
    "ST-35": "SD-Stajerska-Flag_3x.png",
    "SU-36": "Sumadija-Flag.png",
    "SX-37": "SD-Strandzha-Flag_3x.png",
    "SZ-38": "Flag_of_Wester-Syrmia_svg.png",
    "TK-39": "Timok-Flag.png",
    "TL-40": "Torlak-Flag.png",
    "TR-41": "SD-S_Trakija-Flag_3x.png",
    "VB-42": "Vrhbosna-Flag.png",
    "VI-43": "Istocen-Vardar-Flag.jpg",
    "VZ-44": "Flag_of_Zapaden-Vardar.webp",
    "ZA-45": "Zagorje-Flag.webp",
    "BG-91": "Beograd-Flag.png",
    "SA-92": "Sarajevo-Flag.png",
    "SF-93": "Sofia-Flag.webp",
    "ZG-94": "Zagreb-Flag.png",
    "BK-95": "Brcko-Flag.png",
    "MO-96": "Mostar-Flag.webp",
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


def _thumb(img: Image.Image):
    import numpy as np
    return np.asarray(img.convert("RGB").resize((60, 40), Image.BILINEAR), dtype=float)


def verify(flags: dict) -> int:
    """Compare chaque drapeau affiché à toutes les sources ; signale les appariements douteux."""
    import numpy as np
    Image.MAX_IMAGE_PIXELS = None
    src = {p.name: _thumb(load_image(p)) for p in sorted(SRC_DIR.iterdir()) if p.is_file()}
    bad = 0
    for code in sorted(flags):
        cur = _thumb(Image.open(io.BytesIO(base64.b64decode(flags[code].split(",", 1)[1]))))
        ranked = sorted((float(((cur - a) ** 2).mean()), n) for n, a in src.items())
        best = ranked[0][1]
        ok = MAPPING.get(code) == best and ranked[0][0] < 50
        bad += not ok
        print(f"  {'ok ' if ok else 'ÉCART'} {code}: {best} ({ranked[0][0]:.1f}) ; "
              f"MAPPING : {MAPPING.get(code)}")
    print(f"\n{len(flags) - bad}/{len(flags)} drapeaux conformes au MAPPING.")
    return 1 if bad else 0


def main() -> int:
    """
    python scripts/encode_drapeaux.py              encode les États sans drapeau dans state_flags.json
    python scripts/encode_drapeaux.py LK-20 SO-33  ré-encode ces États
    python scripts/encode_drapeaux.py --all        ré-encode tout (les drapeaux de 600 × 400 px
                                                   encodés avant le 2026-10-14 passeraient à 400 px)
    python scripts/encode_drapeaux.py --verify     contrôle le MAPPING contre les drapeaux affichés
    """
    flags = json.loads(OUT_JSON.read_text()) if OUT_JSON.exists() else {}
    args = [a for a in sys.argv[1:]]
    if "--verify" in args:
        return verify(flags)
    if "--all" in args:
        codes = list(MAPPING)
    elif args:
        unknown = [a for a in args if a not in MAPPING]
        if unknown:
            sys.exit(f"Codes absents du MAPPING : {', '.join(unknown)}")
        codes = args
    else:
        codes = [c for c in MAPPING if c not in flags]

    encoded, skipped = 0, 0
    for code in codes:
        path = SRC_DIR / MAPPING[code]
        if not path.exists():
            skipped += 1
            print(f"  absent : {code} ({path.name})")
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
