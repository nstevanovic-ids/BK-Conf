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
import base64
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
    constitution = json.loads((DATA / "constitution.json").read_text(encoding="utf-8"))
    stats = json.loads((DATA / "stats.json").read_text(encoding="utf-8"))
    lights = json.loads((DATA / "lights.json").read_text(encoding="utf-8"))
    opstine = json.loads((DATA / "opstine.json").read_text(encoding="utf-8"))
    # Films d'États (scripts/encode_video.py) : manifeste optionnel ; les fichiers
    # vidéo restent liés (videos/…), copiés à côté par le déploiement Pages.
    i18n = json.loads((DATA / "i18n.json").read_text(encoding="utf-8"))
    vfile = DATA / "videos.json"
    videos = json.loads(vfile.read_text(encoding="utf-8")) if vfile.exists() else {}
    registre = json.loads((DATA / "registre.json").read_text(encoding="utf-8"))

    # Replace the bootstrap loader with inline assignment.
    inline_js = (
        f"PEUPLES={json.dumps(peuples, ensure_ascii=False)};\n"
        f"STATES={json.dumps(states, ensure_ascii=False)};\n"
        f"AUT={json.dumps(aut, ensure_ascii=False)};\n"
        f"ALPHA={json.dumps([[a['glyph'], a['ipa'], a['type']] for a in alpha], ensure_ascii=False)};\n"
        f"STATE_FLAGS={json.dumps(flags, ensure_ascii=False)};\n"
        f"FLAGNOTE={json.dumps(flagnotes, ensure_ascii=False)};\n"
        f"GEO={json.dumps(geo, ensure_ascii=False)};\n"
        f"CONSTITUTION={json.dumps(constitution, ensure_ascii=False)};\n"
        f"STATS={json.dumps(stats, ensure_ascii=False)};\n"
        f"LIGHTS={json.dumps(lights, separators=(',', ':'))};\n"
        f"OPSTINE={json.dumps(opstine['m'], ensure_ascii=False, separators=(',', ':'))};\n"
        f"VIDEOS={json.dumps(videos, ensure_ascii=False, separators=(',', ':'))};\n"
        f"I18N={json.dumps(i18n, ensure_ascii=False, separators=(',', ':'))};\n"
        f"REGISTRE={{...REGISTRE,...{json.dumps(registre, ensure_ascii=False)}}};\n"
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
    # Inline the vendored libraries (d3-geo for the map, qrcode for the citizen card).
    for lib in ("d3-array.min.js", "d3-geo.min.js", "qrcode.min.js"):
        tag = f'<script src="vendor/{lib}"></script>'
        if tag not in src:
            sys.exit(f"balise absente du template : {tag}")
        code = (PORTAIL / "vendor" / lib).read_text(encoding="utf-8").replace("</script", "<\\/script")
        src = src.replace(tag, f"<script>\n{code}\n</script>")
    # Embed the OFL font files (Arimo, Sofia Sans Extra Condensed) as base64 so the
    # single file is fully self-contained (font url(fonts/...) -> data URI).
    fonts_dir = PORTAIL / "fonts"
    for woff in ("arimo.woff2", "sofia-sans-extra-condensed.woff2"):
        fp = fonts_dir / woff
        ref = f"url('fonts/{woff}') format('woff2')"
        if not fp.exists() or ref not in src:
            sys.exit(f"police absente du dépôt ou du template : {woff}")
        b64 = base64.b64encode(fp.read_bytes()).decode("ascii")
        src = src.replace(ref, f"url(data:font/woff2;base64,{b64}) format('woff2')")
    # Favicon inliné en data URI : le fichier unique reste self-contained (file://).
    # apple-touch-icon.png reste un lien relatif, copié à côté par le déploiement Pages.
    ico = PORTAIL / "favicon.ico"
    if ico.exists():
        b64 = base64.b64encode(ico.read_bytes()).decode("ascii")
        src = src.replace('href="favicon.ico"', f'href="data:image/x-icon;base64,{b64}"', 1)

    OUT_INLINE.write_text(src, encoding="utf-8")
    kb = len(src) // 1024
    print(f"Build inline → {OUT_INLINE.relative_to(ROOT)} ({kb} kB)")
    return 0


def build_linked() -> int:
    # Le template est déjà prêt ; rien à assembler. On vérifie juste la présence des data.
    missing = [
        f for f in ("peuples.json", "etats.json", "entites-autonomes.json",
                    "alfabet.json", "state_flags.json", "flagnotes.json", "geo.json",
                    "constitution.json", "stats.json", "lights.json", "opstine.json",
                    "i18n.json", "registre.json")
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
