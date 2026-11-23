#!/usr/bin/env python3
"""
build_portail.py — assemble le portail.

Deux sorties (ADR docs/decisions/2026-11-23-deploiement-lie.md) :
  (défaut)  build lié : assemble _site/, le site publié sur GitHub Pages (données du lecteur de
            la Constitution comprises, data/constitution/). Le gabarit est copié
            avec la version des données (?v=) et charge data/*.json par page (table DATA_SRC du
            gabarit, socle puis données de la route) ; polices, bibliothèques, images et films
            restent des fichiers. Les données sont copiées d'après une liste blanche : jamais les
            GeoJSON sources de portail/data/ (27 Mo). Le fichier unique y est ajouté comme export,
            dans _site/export/index.html, ses liens vers images/ et videos/ remontant d'un cran.
  --inline  fichier unique : injecte données, bibliothèques, polices et favicon dans le HTML
            (balkanska_konfederacija.html), ouvrable par double-clic (file://), sans serveur.

Le gabarit vit dans portail/index.html, les données dans portail/data/*.json.

Usage :
    python scripts/build_portail.py            # _site/ (build lié + export), comme le déploiement
    python scripts/build_portail.py --inline   # fichier unique à la racine du dépôt
    cd _site && python -m http.server 8000     # puis http://localhost:8000
"""
import argparse
import base64
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORTAIL = ROOT / "portail"
TEMPLATE = PORTAIL / "index.html"
DATA = PORTAIL / "data"
OUT_INLINE = ROOT / "balkanska_konfederacija.html"
SITE = ROOT / "_site"

# Données publiées (build lié). Toute donnée que le gabarit charge doit y figurer : le contrôle
# de build_linked() compare cette liste à la table DATA_SRC du gabarit.
DATA_FILES = (
    "peuples.json", "etats.json", "entites-autonomes.json", "alfabet.json", "state_flags.json",
    "flagnotes.json", "geo.json", "stats.json", "opstine.json",
    "videos.json", "i18n.json", "registre.json", "textes.json",
)
# Données générées, chargées par leur page : lecteur de la Constitution (scripts/build_lecteur.py,
# build_carte_marge.py) et carte (scripts/build_carte.py) ; publiées en entier. Valeur : le fichier
# dont l'absence signale un dossier non généré.
DATA_DIRS = {"constitution": "core.json", "carte": "index.json"}
# Dossiers copiés tels quels (sans leurs README) et fichiers de la racine du site.
ASSET_DIRS = ("fonts", "vendor", "images", "videos", "js", "css")
# Code chargé avec sa page (need() du gabarit) ; le fichier unique l'embarque.
CODE_DIRS = ("js", "css")
# Bibliothèques tierces embarquées par le fichier unique, chargées avec leurs pages (d3 : mini-cartes
# des fiches ; qrcode : carte citoyenne), dans cet ordre (d3-geo s'appuie sur d3-array). MapLibre
# (vendor/maplibre-gl/, carte) n'est publié qu'en build lié : son worker exige http(s).
VENDOR = ("d3-array.min.js", "d3-geo.min.js", "qrcode.min.js")
# Amorce du chargement par page (portail/index.html), remplacée par les données en build inline.
BOOT_LINE = "need([...DATA_CORE,...txL()]).then(boot,dataFail);   // build inline : remplacé par les données"
# Version des données (paramètre ?v= des fetch) posée dans le gabarit publié.
DATA_V_LINE = "const DATA_V='';"
ROOT_FILES = ("favicon.ico", "apple-touch-icon.png")


def build_inline(out: Path = OUT_INLINE, asset_base: str = "") -> int:
    """Fichier unique. asset_base préfixe les liens restés relatifs (images, films, icône) :
    '' pour un fichier posé à côté de images/ et videos/, '../' pour _site/export/."""
    src = TEMPLATE.read_text(encoding="utf-8")
    peuples = json.loads((DATA / "peuples.json").read_text())
    states = json.loads((DATA / "etats.json").read_text())
    aut = json.loads((DATA / "entites-autonomes.json").read_text())
    alpha = json.loads((DATA / "alfabet.json").read_text())
    flags = json.loads((DATA / "state_flags.json").read_text())
    flagnotes = json.loads((DATA / "flagnotes.json").read_text())
    geo = json.loads((DATA / "geo.json").read_text())
    stats = json.loads((DATA / "stats.json").read_text(encoding="utf-8"))
    opstine = json.loads((DATA / "opstine.json").read_text(encoding="utf-8"))
    # Films d'États (scripts/encode_video.py) : manifeste optionnel ; les fichiers
    # vidéo restent liés (videos/…), copiés à côté par le déploiement Pages.
    i18n = json.loads((DATA / "i18n.json").read_text(encoding="utf-8"))
    # Texte des pages dans les trois standards (ADR 2026-10-26-traduction-pages.md).
    textes = json.loads((DATA / "textes.json").read_text(encoding="utf-8"))
    vfile = DATA / "videos.json"
    videos = json.loads(vfile.read_text(encoding="utf-8")) if vfile.exists() else {}
    if asset_base:
        videos = {c: {k: (asset_base + v if isinstance(v, str) and v.startswith("videos/") else v)
                      for k, v in vd.items()} for c, vd in videos.items()}
    registre = json.loads((DATA / "registre.json").read_text(encoding="utf-8"))
    # Lecteur de la Constitution : sommaire (CORE) et fichiers chargés par portail/js/constitution.js
    # (titres, aperçus, carte de marge), sous leur chemin relatif à data/constitution/.
    cdir = DATA / "constitution"
    core = json.loads((cdir / "core.json").read_text(encoding="utf-8"))
    cx_data = {str(f.relative_to(cdir)): json.loads(f.read_text(encoding="utf-8"))
               for f in sorted(cdir.rglob("*.json")) if not f.name.startswith(("core.", "full."))}
    cx_full = {l: json.loads((cdir / f"full.{l}.json").read_text(encoding="utf-8")) for l in ("en", "zap", "sre", "ist")}
    # Carte (#/map) : l'index et sa silhouette ; ni communes ni MapLibre (son worker exige http(s)) :
    # dans le fichier unique, la carte reste en SVG (CA_EXPORT).
    carte = json.loads((DATA / "carte" / "index.json").read_text(encoding="utf-8"))
    code = [PORTAIL / "vendor" / lib for lib in VENDOR] + \
        [f for d in CODE_DIRS for f in sorted((PORTAIL / d).glob("*")) if f.suffix in (".js", ".css")]

    # Replace the bootstrap loader with inline assignment.
    inline_js = (
        f"PEUPLES={json.dumps(peuples, ensure_ascii=False)};\n"
        f"STATES={json.dumps(states, ensure_ascii=False)};\n"
        f"AUT={json.dumps(aut, ensure_ascii=False)};\n"
        f"ALPHA={json.dumps([[a['glyph'], a['ipa'], a['type']] for a in alpha], ensure_ascii=False)};\n"
        f"STATE_FLAGS={json.dumps(flags, ensure_ascii=False)};\n"
        f"FLAGNOTE={json.dumps(flagnotes, ensure_ascii=False)};\n"
        f"GEO={json.dumps(geo, ensure_ascii=False)};\n"
        f"STATS={json.dumps(stats, ensure_ascii=False)};\n"
        f"OPSTINE={json.dumps(opstine['m'], ensure_ascii=False, separators=(',', ':'))};\n"
        f"VIDEOS={json.dumps(videos, ensure_ascii=False, separators=(',', ':'))};\n"
        f"I18N={json.dumps(i18n, ensure_ascii=False, separators=(',', ':'))};\n"
        f"TX={json.dumps(textes, ensure_ascii=False, separators=(',', ':'))};\n"
        f"REGISTRE={{...REGISTRE,...{json.dumps(registre, ensure_ascii=False)}}};\n"
        f"CORE={json.dumps(core, ensure_ascii=False, separators=(',', ':'))};\n"
        f"CARTE={json.dumps(carte, ensure_ascii=False, separators=(',', ':'))};\nvar CA_EXPORT=1;\n"
        f"var CX_DATA={json.dumps(cx_data, ensure_ascii=False, separators=(',', ':'))};\n"
        # recherche : aperçus et texte des articles, dans les quatre langues de l'interface
        + "".join(f"CIDX.{l}=CX_DATA['idx.{l}.json'];\n" for l in ("en", "zap", "sre", "ist"))
        + f"CFULL={json.dumps(cx_full, ensure_ascii=False, separators=(',', ':'))};\n" +
        # toutes les données sont là : chaque clé du chargement par page est marquée chargée
        "Object.keys(DATA_SRC).forEach(k=>{DATA_P[k]=Promise.resolve();});\n"
        + "".join(f"DATA_P[{json.dumps(f.parent.name + '/' + f.name)}]=Promise.resolve();\n" for f in code) +
        "boot();\n"
    )
    # Pas de préchargement dans le fichier unique (tout y est) ; DATA_V y reste vide.
    a, z = src.find("<!--préchargement:début-->"), src.find("<!--préchargement:fin-->")
    if a < 0 or z < a:
        sys.exit("bloc de préchargement absent du gabarit")
    src = src[:a] + "<script>const DATA_V='';</script>" + src[z + len("<!--préchargement:fin-->"):]
    # Le chargement du socle est remplacé par les données injectées (une seule occurrence).
    if src.count(BOOT_LINE) != 1:
        sys.exit(f"ligne d'amorce absente du gabarit : {BOOT_LINE}")
    src = src.replace(BOOT_LINE, inline_js)
    # Bibliothèques et code de page (lecteur, moteur) : scripts avant le script principal, qui les
    # appelle dès le premier rendu ; feuilles de style dans <head>. Ils ne font que se définir au
    # chargement ; chaque clé est marquée chargée (inline_js).
    tag = "<!--code:inline-->"
    esc_end = lambda t: t.replace("</script", "<\\/script")   # noqa: E731
    js = "".join("<script>\n" + esc_end(f.read_text(encoding="utf-8")) + "\n</script>\n"
                 for f in code if f.suffix == ".js")
    css = "".join(f"<style>\n{f.read_text(encoding='utf-8')}\n</style>\n" for f in code if f.suffix == ".css")
    if src.count(tag) != 1 or "</head>" not in src:
        sys.exit("ancre absente du gabarit (<!--code:inline--> ou </head>)")
    src = src.replace(tag, js, 1).replace("</head>", css + "</head>", 1)
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
    # Liens restés relatifs (images, icône) : préfixés pour un export posé hors de la racine.
    if asset_base:
        for head, tail in (('href="', 'apple-touch-icon.png"'), ('src="', 'images/'), ('`', 'images/')):
            if head + tail not in src:
                sys.exit(f"lien relatif attendu absent du template : {head + tail}")
            src = src.replace(head + tail, head + asset_base + tail)
        left = re.findall(r"""[`"'(=](?:images|videos)/""", src)
        if left:
            sys.exit(f"lien relatif non préfixé dans l'export : {left[:3]}")

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(src, encoding="utf-8")
    kb = len(src.encode("utf-8")) // 1024
    print(f"Build inline → {out.relative_to(ROOT)} ({kb} kB)")
    return 0


def _copytree(src: Path, dst: Path) -> None:
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns("README.md", ".*"))


def build_linked() -> int:
    """_site/ : gabarit, données de la liste blanche, fichiers, export du fichier unique."""
    tpl = TEMPLATE.read_text(encoding="utf-8")
    # Chaque fichier de la table DATA_SRC du gabarit doit être publié, et réciproquement.
    fetched = set(re.findall(r":\['([\w.-]+\.json)',d=>", tpl))
    if fetched != set(DATA_FILES):
        print("Liste blanche et gabarit divergent :",
              "non publiés", sorted(fetched - set(DATA_FILES)) or "–",
              "; publiés sans être chargés", sorted(set(DATA_FILES) - fetched) or "–", file=sys.stderr)
        return 1
    missing = [f for f in DATA_FILES if not (DATA / f).exists()]
    missing += [f"{d}/{f}" for d, f in DATA_DIRS.items() if not (DATA / d / f).exists()]
    missing += [d for d in ASSET_DIRS if not (PORTAIL / d).is_dir()]
    missing += [f for f in ROOT_FILES if not (PORTAIL / f).exists()]
    if missing:
        print("Fichiers manquants :", ", ".join(missing), file=sys.stderr)
        return 1

    if SITE.exists():
        shutil.rmtree(SITE)
    (SITE / "data").mkdir(parents=True)
    # Version des données : empreinte des fichiers publiés, ajoutée aux adresses des fetch(), pour
    # qu'un gabarit nouveau ne lise pas des données restées dans le cache (max-age=600 sur Pages).
    h = hashlib.sha256()
    for f in DATA_FILES:
        h.update(f.encode() + b"\0" + (DATA / f).read_bytes())
        shutil.copy2(DATA / f, SITE / "data" / f)
    for d in DATA_DIRS:
        for fp in sorted((DATA / d).rglob("*.json")):
            h.update(str(fp.relative_to(DATA)).encode() + b"\0" + fp.read_bytes())
        _copytree(DATA / d, SITE / "data" / d)
    for d in CODE_DIRS:   # le code de page porte la même version que les données
        for fp in sorted((PORTAIL / d).glob("*")):
            h.update(f"{d}/{fp.name}".encode() + b"\0" + fp.read_bytes())
    if tpl.count(DATA_V_LINE) != 1:
        print(f"ligne absente du gabarit : {DATA_V_LINE}", file=sys.stderr)
        return 1
    (SITE / "index.html").write_text(
        tpl.replace(DATA_V_LINE, f"const DATA_V='?v={h.hexdigest()[:10]}';"), encoding="utf-8")
    for d in ASSET_DIRS:
        _copytree(PORTAIL / d, SITE / d)
    for f in ROOT_FILES:
        shutil.copy2(PORTAIL / f, SITE / f)
    rc = build_inline(SITE / "export" / "index.html", asset_base="../")
    if rc:
        return rc

    data_kb = sum(f.stat().st_size for f in (SITE / "data").rglob("*.json")) // 1024
    print(f"Build lié → {SITE.relative_to(ROOT)}/ (index.html "
          f"{(SITE / 'index.html').stat().st_size // 1024} kB, data/ {data_kb} kB en "
          f"{len(DATA_FILES)} fichiers et {', '.join(d + '/' for d in DATA_DIRS)}, export/index.html)")
    print("Servir avec :  cd _site && python -m http.server 8000   puis http://localhost:8000")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--inline", action="store_true", help="fichier unique à la racine du dépôt")
    args = ap.parse_args()
    return build_inline() if args.inline else build_linked()


if __name__ == "__main__":
    sys.exit(main())
