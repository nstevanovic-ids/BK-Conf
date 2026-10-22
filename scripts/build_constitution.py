#!/usr/bin/env python3
"""
build_constitution.py — convertit la constitution publiée (anglais) en données portail.

Source : docs/constitution/v4.en.md (texte public, anglais)
Sortie : portail/data/constitution.json (lu par portail/index.html, vue #/constitution)

À relancer après toute modification du texte anglais, puis rebuild du portail :
    python scripts/build_constitution.py
    python scripts/build_portail.py --inline

Structure produite :
  {version, date, source, preamble:{paras[], motto},
   titles:[{id, num, name, chapters:[{num, name, articles:[...]}]}]}
  title.id = « title-4 », « title-1bis » ; article.id = « art-109 », « art-140bis »
  article = {id, num, name, body:[block], sec?:{num, name}}
            (sec : section qui s'ouvre avant cet article, « #### Section N / Nom »)
  block   = {"t":"p","x":str} | {"t":"ul","items":[str]}
          | {"t":"ol","items":[[n,str]]} | {"t":"ll","items":[[letter,str]]}
          | {"t":"h","x":str}   (intertitre en gras, ex. « Territorial States (45): »)
Le texte garde le balisage léger **gras** et *italique* ; le portail le rend.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "constitution" / "v4.en.md"
OUT = ROOT / "portail" / "data" / "constitution.json"


ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7,
         "VIII": 8, "IX": 9, "X": 10}


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def title_id(num: str) -> str:
    """« I bis » -> title-1bis, « IV » -> title-4 (identifiant d'URL du portail)."""
    roman, _, suffix = num.partition(" ")
    return f"title-{ROMAN.get(roman, roman.lower())}{slug(suffix)}"


def blocks(text: str) -> list:
    """Découpe un corps d'article en blocs typés (listes regroupées)."""
    out = []
    for para in [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]:
        lines = para.split("\n")
        if all(re.match(r"^- ", l) for l in lines):
            items = [l[2:].strip() for l in lines]
            if out and out[-1]["t"] == "ul":
                out[-1]["items"] += items
            else:
                out.append({"t": "ul", "items": items})
        elif all(re.match(r"^\d+\. ", l) for l in lines):
            items = [[int(m.group(1)), m.group(2).strip()]
                     for m in (re.match(r"^(\d+)\. (.*)$", l) for l in lines)]
            out.append({"t": "ol", "items": items})
        elif len(lines) == 1 and re.match(r"^[a-z]\. ", para):
            item = [para[0], para[3:].strip()]
            if out and out[-1]["t"] == "ll":
                out[-1]["items"].append(item)
            else:
                out.append({"t": "ll", "items": [item]})
        elif len(lines) == 1 and re.fullmatch(r"\*\*[^*]+:\*\*", para):
            out.append({"t": "h", "x": para.strip("*")})
        else:
            out.append({"t": "p", "x": " ".join(l.strip() for l in lines)})
    return out


def section(text: str):
    """Premier intertitre « #### Section N / Nom » d'un texte, et sa position."""
    m = re.search(r"^#### Section (\S+) / (.+)$", text, re.M)
    if not m:
        return None, len(text)
    return {"num": "Section " + m.group(1), "name": m.group(2).strip()}, m.start()


def parse(md: str) -> dict:
    head = re.search(r"^## Consolidated text, version (\S+) \(([^)]+)\)", md, re.M)
    doc = {
        "version": "v" + head.group(1) if head else "",
        "date": head.group(2) if head else "",
        "source": "docs/constitution/v4.en.md",
        "preamble": None,
        "titles": [],
    }
    sections = re.split(r"^# ", md, flags=re.M)[1:]
    for sec in sections:
        heading, _, rest = sec.partition("\n")
        rest = re.sub(r"^---\s*$", "", rest, flags=re.M)
        if heading.startswith("Preamble"):
            paras = [p.strip() for p in re.split(r"\n\s*\n", rest) if p.strip()]
            motto = paras.pop() if paras and paras[-1].startswith("*") else ""
            doc["preamble"] = {"paras": paras, "motto": motto.strip("*")}
            continue
        m = re.match(r"^Title (\S+(?: bis)?) / (.+)$", heading)
        if not m:
            continue
        title = {"id": title_id(m.group(1)), "num": "Title " + m.group(1),
                 "name": m.group(2).strip(), "chapters": []}
        # Chapitres (facultatifs : les Titres V n'en ont pas)
        chap_parts = re.split(r"^## ", rest, flags=re.M)
        pre, chap_parts = chap_parts[0], chap_parts[1:]
        if not chap_parts:
            chap_parts = ["\n" + pre]
        elif pre.strip():
            chap_parts = ["\n" + pre] + chap_parts
        for cp in chap_parts:
            ch_head, _, ch_body = cp.partition("\n")
            cm = re.match(r"^Chapter (\d+(?: bis)?) / (.+)$", ch_head.strip())
            chapter = {"num": f"Chapter {cm.group(1)}" if cm else "",
                       "name": cm.group(2).strip() if cm else "", "articles": []}
            parts = re.split(r"^### ", ch_body, flags=re.M)
            pending, _ = section(parts[0])
            for ap in parts[1:]:
                a_head, _, a_body = ap.partition("\n")
                # un intertitre de section en fin de corps ouvre la section de l'article suivant
                nxt, cut = section(a_body)
                a_body = a_body[:cut]
                am = re.match(r"^Article (\d+(?: \w+)?) / (.+)$", a_head.strip())
                if not am:
                    pending = nxt or pending
                    continue
                art = {
                    "id": "art-" + slug(am.group(1)),
                    "num": "Article " + am.group(1),
                    "name": am.group(2).strip(),
                    "body": blocks(a_body),
                }
                if pending:
                    art["sec"] = pending
                chapter["articles"].append(art)
                pending = nxt
            if chapter["articles"]:
                title["chapters"].append(chapter)
        doc["titles"].append(title)
    return doc


def main() -> int:
    doc = parse(SRC.read_text(encoding="utf-8"))
    n_art = sum(len(c["articles"]) for t in doc["titles"] for c in t["chapters"])
    if not doc["preamble"] or not doc["titles"] or n_art == 0:
        print("Échec de l'analyse : préambule, titres ou articles introuvables.", file=sys.stderr)
        return 1
    OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    n_sec = sum(1 for t in doc["titles"] for c in t["chapters"] for a in c["articles"] if "sec" in a)
    print(f"{OUT.relative_to(ROOT)} : {len(doc['titles'])} titres, {n_art} articles, {n_sec} sections, "
          f"{len(doc['preamble']['paras'])} alinéas de préambule "
          f"({OUT.stat().st_size // 1024} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
