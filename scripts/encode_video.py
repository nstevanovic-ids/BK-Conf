#!/usr/bin/env python3
"""
encode_video.py — prépare une vidéo d'État pour le header animé du portail.

Prend une vidéo brute (Grok Imagine, montage, etc.) et produit, dans portail/videos/ :
  <CODE>.mp4       H.264 1280×720 (CRF 28, ≤ 2,6 Mbit/s), sans son — écrans larges
  <CODE>-480.mp4   H.264 854×480 (CRF 29, ≤ 1,2 Mbit/s), sans son — téléphones (<source media>)
  <CODE>.jpg       poster (première image), affiché avant lecture et en reduced-motion
puis inscrit l'État dans portail/data/videos.json (manifeste lu par le portail).

Le film est muet sur le portail : la piste son de la source est supprimée.

Boucle sans couture : les premières images (FADE, 15 par défaut) sont fondues en fin de
vidéo (xfade). La dernière image produite enchaîne exactement sur la première : la boucle
<video loop> ne montre plus de coupe. Durée finale = durée source − FADE.

Les métadonnées de la source sont retirées (signature du générateur, vignette jointe).
La vidéo brute n'est pas versionnée (trop lourde) : la garder hors du dépôt.

Usage :
    python scripts/encode_video.py BA-01 chemin/vers/source.mp4
    python scripts/encode_video.py BA-01 source.mp4 --fade 0.8 --poster-at 1.5
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "portail" / "videos"
MANIFEST = ROOT / "portail" / "data" / "videos.json"
ETATS = ROOT / "portail" / "data" / "etats.json"

FPS = 24
# (suffixe, largeur, hauteur, CRF, débit plafond kbit/s)
# CRF plafonné : la qualité ne baisse que sur les sources très détaillées (grain,
# accentuation), dont le poids doublerait sinon (BN-03 : 9,9 Mo sans plafond).
VARIANTS = [("", 1280, 720, 28, 2600), ("-480", 854, 480, 29, 1200)]


def duration(path: Path) -> float:
    """Durée du flux vidéo principal (la vignette jointe éventuelle est ignorée)."""
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "stream=codec_type,duration:stream_disposition=attached_pic", "-of", "json", str(path)],
        check=True, capture_output=True, text=True).stdout
    video = next(s for s in json.loads(out)["streams"]
                 if s["codec_type"] == "video" and not s.get("disposition", {}).get("attached_pic"))
    return float(video["duration"])


def encode(src: Path, dst: Path, w: int, h: int, crf: int, cap: int, n: int, f: int) -> None:
    """n = images de la source, f = images de fondu (calcul en images entières : un fondu
    à cheval sur deux images laisse une marche visible au bouclage)."""
    # La source est ouverte deux fois (entrée 0 = corps, entrée 1 = tête à fondre en fin).
    # Corps = images [f, n), tête = images [0, f). Le fondu dure f−1 images : la dernière
    # image produite est exactement l'image f−1 de la source, et la boucle repart sur f.
    off, xd = (n - 2 * f) / FPS, (f - 1) / FPS
    pre = f"scale={w}:{h}:flags=lanczos,setsar=1,fps={FPS},format=yuv420p"
    vf = (f"[0:v:0]{pre},trim=start_frame={f},setpts=PTS-STARTPTS[a];"
          f"[1:v:0]{pre},trim=end_frame={f},setpts=PTS-STARTPTS[b];"
          f"[a][b]xfade=transition=fade:duration={xd:.5f}:offset={off:.5f},format=yuv420p[v]")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-i", str(src),
         "-filter_complex", vf, "-map", "[v]", "-frames:v", str(n - f), "-an",
         "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
         "-maxrate", f"{cap}k", "-bufsize", f"{2 * cap}k",
         "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.0", "-g", "48",
         "-map_metadata", "-1", "-movflags", "+faststart", str(dst)],
        check=True)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("code", help="code d'État, ex. BA-01")
    ap.add_argument("source", type=Path, help="vidéo brute")
    ap.add_argument("--fade", type=float, default=0.625,
                    help="fondu de bouclage, s (0.625 = 15 images à 24 i/s)")
    ap.add_argument("--poster-at", type=float, default=0.0,
                    help="instant du poster dans la vidéo produite, s (0 = première image)")
    args = ap.parse_args()

    codes = {s["c"] for s in json.loads(ETATS.read_text(encoding="utf-8"))}
    if args.code not in codes:
        sys.exit(f"code inconnu dans etats.json : {args.code}")
    if not args.source.exists():
        sys.exit(f"source introuvable : {args.source}")

    n, f = round(duration(args.source) * FPS), max(2, round(args.fade * FPS))
    if n < 3 * f:
        sys.exit(f"vidéo trop courte ({n} images) pour un fondu de {f} images")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for suffix, w, h, crf, cap in VARIANTS:
        dst = OUT_DIR / f"{args.code}{suffix}.mp4"
        encode(args.source, dst, w, h, crf, cap, n, f)
        print(f"{dst.relative_to(ROOT)}  {dst.stat().st_size / 1e6:.2f} Mo")

    poster = OUT_DIR / f"{args.code}.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{args.poster_at}",
                    "-i", str(OUT_DIR / f"{args.code}.mp4"), "-frames:v", "1",
                    "-q:v", "4", "-map_metadata", "-1", str(poster)], check=True)
    print(f"{poster.relative_to(ROOT)}  {poster.stat().st_size / 1e3:.0f} ko")

    out_dur = round((n - f) / FPS, 2)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    manifest[args.code] = {
        "src": f"videos/{args.code}.mp4",
        "sm": f"videos/{args.code}-480.mp4",
        "poster": f"videos/{args.code}.jpg",
        "dur": out_dur,
    }
    manifest = dict(sorted(manifest.items()))
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{MANIFEST.relative_to(ROOT)} : {args.code} ({out_dur} s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
