#!/usr/bin/env python3
"""
toponymie_v3.py — forme v3 des noms de communes (règle toponymique, option 1).

Règle (docs/alfabet/transition-toponymique.md, ADR 2026-10-25-toponymie-v3-option-1.md) :
  - substitutions graphiques, partout : nj → ñ, lj → ļ, dž → x (gajica : HR, BA, ME, RS, SI) ;
    en macédonien, gj → đ et kj → ć en plus ;
  - Bulgarie : retranscription depuis le cyrillique officiel (docs/alfabet/toponymes-bg.csv),
    par la table du cyrillique confédéral, dont ъ → ã et ль, лю, ля → ļ, ļu, ļa ;
  - yat et cas particuliers : table validée docs/alfabet/toponymes-v3.csv (forme officielle →
    forme v3), appliquée en dernier ; Beograd reste une exception déclarée.

Usage :
  python scripts/toponymie_v3.py            réécrit portail/data/opstine.json en place
  python scripts/toponymie_v3.py --check    affiche les formes qui changent, sans écrire
build_stats.py appelle rows_v3() en écrivant opstine.json, si bien qu'une reconstruction
complète donne le même résultat.
Format d'une entrée d'opstine.json (v 2) : [nom v3, ISO, code d'État, nom officiel du
recensement ou "" s'il est identique, nom GADM s'il diffère]. Les deux derniers servent
d'alias à la recherche du parcours citoyen.
"""
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ALF = ROOT / "docs" / "alfabet"
OPSTINE = ROOT / "portail" / "data" / "opstine.json"

GAJ = ("SRB", "HRV", "BIH", "MNE", "SVN", "MKD", "XKO", "BKC")

# Cyrillique → latin v3 (table du cyrillique confédéral, docs/alfabet/cyrillique-confederal.md)
CYR = {"а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "ђ": "đ", "ѓ": "đ", "е": "e",
       "ж": "ž", "з": "z", "ѕ": "dz", "и": "i", "й": "j", "ј": "j", "к": "k", "л": "l",
       "љ": "ļ", "м": "m", "н": "n", "њ": "ñ", "о": "o", "п": "p", "р": "r", "с": "s",
       "т": "t", "ћ": "ć", "ќ": "ć", "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "č",
       "џ": "x", "ш": "š", "щ": "št", "ъ": "ã", "ь": "j", "ю": "ju", "я": "ja", "ѣ": "ě"}


def _case(src: str, out: str) -> str:
    return out[:1].upper() + out[1:] if src[:1].isupper() else out


def cyr_to_v3(s: str) -> str:
    """Cyrillique (serbe, macédonien, bulgare) → latin v3."""
    s = re.sub(r"[Дд][Жж]", lambda m: _case(m.group(0), "x"), s)
    # bulgare : latérale et nasale palatales (v1 : любов → ļubov)
    s = re.sub(r"([ЛлНн])([ьЬюЮяЯ])",
               lambda m: _case(m.group(1), {"л": "ļ", "н": "ñ"}[m.group(1).lower()])
               + {"ь": "", "ю": "u", "я": "a"}[m.group(2).lower()], s)
    out = []
    for ch in s:
        lo = ch.lower()
        t = CYR.get(lo)
        out.append(ch if t is None else (t if ch == lo else _case("X", t)))
    return "".join(out)


def gaj_to_v3(s: str, iso: str) -> str:
    """Latin officiel (gajica, slovène, latin macédonien) → latin v3, substitutions graphiques."""
    rep = [("NJ", "Ñ"), ("Nj", "Ñ"), ("nj", "ñ"), ("LJ", "Ļ"), ("Lj", "Ļ"), ("lj", "ļ"),
           ("DŽ", "X"), ("Dž", "X"), ("dž", "x")]
    if iso == "MKD":
        rep += [("Gj", "Đ"), ("gj", "đ"), ("Kj", "Ć"), ("kj", "ć")]
    for a, b in rep:
        s = s.replace(a, b)
    return s


def _load_bg() -> dict:
    out = {}
    with open(ALF / "toponymes-bg.csv", encoding="utf-8") as f:
        for r in csv.DictReader(l for l in f if not l.startswith("#")):
            out[r["name"]] = r["cyrillic"]
    return out


def _load_overrides() -> dict:
    out = {}
    with open(ALF / "toponymes-v3.csv", encoding="utf-8") as f:
        for r in csv.DictReader(l for l in f if not l.startswith("#")):
            out[(r["iso"], r["officiel"])] = r["v3"]
    return out


BG, OVR = _load_bg(), _load_overrides()


def _title_like(census: str, v3: str) -> str:
    """Majuscules du nom de recensement, mot à mot (le cyrillique bulgare minuscule le 2e mot)."""
    cw, vw = re.split(r"([ \-()]+)", census), re.split(r"([ \-()]+)", v3)
    if len([w for w in cw if w.strip(" -()")]) != len([w for w in vw if w.strip(" -()")]):
        return "".join(w[:1].upper() + w[1:] for w in vw)
    words = iter([w for w in cw if w.strip(" -()")])
    res = []
    for w in vw:
        if w.strip(" -()"):
            c = next(words)
            res.append(w[:1].upper() + w[1:] if c[:1].isupper() else w)
        else:
            res.append(w)
    return "".join(res)


def to_v3(name: str, iso: str) -> str:
    """Forme v3 d'un nom de commune, d'après son nom de recensement et son pays."""
    clean = name.replace("\xa0", " ")
    if (iso, clean) in OVR:
        return OVR[(iso, clean)]
    if iso == "BGR":
        cy = BG.get(clean)
        if not cy:
            sys.exit(f"toponymie_v3 : « {clean} » (BGR) absent de docs/alfabet/toponymes-bg.csv")
        return _title_like(clean, cyr_to_v3(cy).replace(" - ", "-"))
    if iso in GAJ:
        return gaj_to_v3(clean, iso)
    return clean


def _fold(s: str) -> str:
    return unicodedata.normalize("NFD", s.replace("đ", "d").replace("Đ", "D")).encode(
        "ascii", "ignore").decode().lower()


def rows_v3(rows: list) -> list:
    """[nom officiel, ISO, code, alias GADM?] → [nom v3, ISO, code, nom officiel ou "", alias GADM?]."""
    out = []
    for r in rows:
        name, iso, code = r[0].replace("\xa0", " "), r[1], r[2]
        v3 = to_v3(name, iso)
        extra = [a for a in r[3:] if a and a not in (v3, name)]
        out.append([v3, iso, code, "" if name == v3 else name] + extra[:1])
    return sorted(out, key=lambda r: (_fold(r[0]), r[1]))


def main() -> int:
    data = json.loads(OPSTINE.read_text(encoding="utf-8"))
    if data.get("v") == 2:     # déjà converti : repartir des noms officiels
        base = [[r[3] or r[0], r[1], r[2]] + r[4:] for r in data["m"]]
    else:
        base = data["m"]
    new = rows_v3(base)
    changed = [(r[3], r[0]) for r in new if r[3]]
    if "--check" in sys.argv:
        for a, b in changed:
            print(f"{a} → {b}")
        print(f"{len(changed)} noms changent sur {len(new)}")
        return 0
    OPSTINE.write_text(json.dumps({"v": 2, "m": new}, ensure_ascii=False, separators=(",", ":")),
                       encoding="utf-8")
    print(f"→ {OPSTINE.relative_to(ROOT)} : {len(new)} communes, {len(changed)} en forme v3")
    return 0


if __name__ == "__main__":
    sys.exit(main())
