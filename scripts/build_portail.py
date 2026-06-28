#!/usr/bin/env python3
"""
build_portail.py — assemble le portail final self-contained.

Deux modes :
  --linked   (défaut) : copie le template tel quel ; il charge data/*.json par fetch().
                        Nécessite un serveur HTTP local (python -m http.server).
  --inline   : injecte les données directement dans le HTML pour un fichier unique
              ouvrable par double-clic (file://), sans serveur.

Le template vit dans portail/index.html. Les données dans portail/data/*.json.

Usage :
    python scripts/build_portail.py            # build lié (dev avec serveur)
    python scripts/build_portail.py --inline   # build inline (fichier unique)
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORTAIL = ROOT / "portail"
TEMPLATE = PORTAIL / "index.html"
DATA = PORTAIL / "data"
OUT_INLINE = ROOT / "balkanska_konfederacija.html"


def build_inline() -> int:
    src = TEMPLATE.read_text(encoding="utf-8")
    peuples = json.loads((DATA / "peuples.json").read_text())
    states = json.loads((DATA / "etats.json").read_text())
    aut = json.loads((DATA / "entites-autonomes.json").read_text())
    alpha = json.loads((DATA / "alfabet.json").read_text())
    flags = json.loads((DATA / "state_flags.json").read_text())
    flagnotes = json.loads((DATA / "flagnotes.json").read_text())
    geo = json.loads((DATA / "geo.json").read_text())

    # Replace the bootstrap loader with inline assignment.
    inline_js = (
        f"PEUPLES={json.dumps(peuples, ensure_ascii=False)};\n"
        f"STATES={json.dumps(states, ensure_ascii=False)};\n"
        f"AUT={json.dumps(aut, ensure_ascii=False)};\n"
        f"ALPHA={json.dumps([[a['glyph'], a['ipa'], a['type']] for a in alpha], ensure_ascii=False)};\n"
        f"STATE_FLAGS={json.dumps(flags, ensure_ascii=False)};\n"
        f"FLAGNOTE={json.dumps(flagnotes, ensure_ascii=False)};\n"
        f"GEO={json.dumps(geo, ensure_ascii=False)};\n"
        "STD={western:'Standard occidental (zapadni)',central:'Standard central (središnji)',eastern:'Standard oriental (istočni)'};\n"
        "render();\n"
    )
    # Swap the loadData().then(...) call for the inline assignment + render.
    import re
    src = re.sub(
        r"loadData\(\)\.then\(\(\)=>\{ render\(\); \}\)\.catch\([\s\S]*?\}\);",
        inline_js,
        src,
        count=1,
    )
    OUT_INLINE.write_text(src, encoding="utf-8")
    kb = len(src) // 1024
    print(f"Build inline → {OUT_INLINE.relative_to(ROOT)} ({kb} kB)")
    return 0


def build_linked() -> int:
    # Le template est déjà prêt ; rien à assembler. On vérifie juste la présence des data.
    missing = [
        f for f in ("peuples.json", "etats.json", "entites-autonomes.json",
                    "alfabet.json", "state_flags.json", "flagnotes.json", "geo.json")
        if not (DATA / f).exists()
    ]
    if missing:
        print("Données manquantes :", ", ".join(missing), file=sys.stderr)
        return 1
    print("Build lié OK. Servir avec :  cd portail && python -m http.server 8000")
    print("Puis ouvrir http://localhost:8000")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--inline", action="store_true", help="build fichier unique self-contained")
    args = ap.parse_args()
    return build_inline() if args.inline else build_linked()


if __name__ == "__main__":
    sys.exit(main())
