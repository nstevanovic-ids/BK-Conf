#!/usr/bin/env python3
"""
build_lecteur.py — données du lecteur de la Constitution (#/constitution), générées, ne pas éditer.

Repris de proto/codex/build.py (branche claude/proto-tour-2) : lecture de v4.md, découpage en unités
(alinéa, lettre, intertitre), renvois d'articles avec plages et lettres, renvois de titres, codes
d'États, renvois inverses, contrôles. Seuls changent les sorties et les liens (routes du portail).

Lit :
  portail/data/constitution.json, constitution.{zap,sre,ist}.json   textes officiels (build_constitution.py)
  docs/constitution/v4.md                                           texte de travail français
  portail/data/etats.json                                           codes d'États (liens)
Écrit dans portail/data/constitution/ :
  core.json            version, sommaire (noms des titres dans les cinq textes, articles de chaque titre),
                       préambule des cinq textes, renvois inverses, ancrages des instruments de marge
  t/<titre>.<lg>.json  un fichier par titre et par texte (en, zap, sre, ist, fr) : chapitres, sections,
                       articles en unités alignées, renvois déjà liés (55 fichiers)
  idx.<lg>.json        numéro, nom et début du premier alinéa de chaque article (aperçus)
  full.<lg>.json       texte de chaque article, graphie d'origine (recherche)
  (map.json, carte de marge, vient de scripts/build_carte_marge.py)

Échoue si un texte officiel n'a pas la structure de l'anglais, si le français ne s'aligne pas unité par
unité, si les renvois d'un alinéa diffèrent d'un texte à l'autre, ou si un alinéa annoté par un
instrument est introuvable ou ambigu.

Usage : python scripts/build_lecteur.py   (appelé à la fin de scripts/build_constitution.py)
"""
import html
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PD = ROOT / "portail" / "data"
OUT = PD / "constitution"
LANGS = ["en", "zap", "sre", "ist", "fr"]
STDS = ["zap", "sre", "ist"]
SUF = "bis|ter|quater|quinquies|sexies|septies|octies"
ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10}

# Alinéas annotés par les instruments de marge, ou cités par la page des votes : clé → (article, motif
# cherché dans le texte anglais).
# Le motif doit désigner exactement une unité ; son rang vaut pour les cinq textes, alignés.
ANCRES = {
    "1ter.SA-92": ("art-1ter", r"^\*\*Sarajevo\*\*"),
    "1ter.BG-91": ("art-1ter", r"^\*\*Beograd\*\*"),
    "1ter.ZG-94": ("art-1ter", r"^\*\*Zagreb\*\*"),
    "1ter.SF-93": ("art-1ter", r"^\*\*Sofija\*\*"),
    "103.circonscriptions": ("art-103", r"one electoral constituency and receives at least two and at most twenty seats"),
    "103.municipalites": ("art-103", r"Brčko and Mostar each form one constituency"),
    "109.b": ("art-109", r"^\*\*b\. Alarm-bell procedure\.\*\*"),
    "110.cinq": ("art-110", r"simple majority in at least five of the seven national delegations"),
    "110.cle": ("art-110", r"must also together represent a majority of the citizens enrolled"),
    "110.six": ("art-110", r"at least six of the seven national delegations"),
    "110ter.saisine": ("art-110ter", r"^It is seized when"),
    "110ter.majorite": ("art-110ter", r"adopts a single compromise text by a majority of its members"),
    "110ter.echec": ("art-110ter", r"If conciliation fails"),
    "110ter.b": ("art-110ter", r"law subject to an alarm motion may be adopted only by a two-thirds majority"),
    "111.consensus": ("art-111", r"taken collegially by consensus"),
    "111.quatre": ("art-111", r"at least four councillors"),
    "111.suspension": ("art-111", r"against the opinion of at least three councillors"),
    "111.exceptions": ("art-111", r"^This procedure applies neither to"),
    "115bis.releve": ("art-115bis", r"total number of citizens enrolled on 1 January"),
    # alinéas cités par la page des votes (#/votes, lot 3) : description des types, ligne du verdict
    "106.majorite": ("art-106", r"^Decisions of the Kongres are taken by simple majority"),
    "106.quorum": ("art-106", r"^The quorum is an absolute majority of the delegates"),
    "106bis.initiative": ("art-106bis", r"^The right of legislative initiative belongs"),
    "106bis.d": ("art-106bis", r"at least eight States, of which no more than half"),
    "106bis.depot": ("art-106bis", r"^Bills are tabled before the Kongres"),
    "121.double": ("art-121", r"^An initiative for partial revision is submitted to the vote"),
    "122.demande": ("art-122", r"^One hundred and fifty thousand citizens, or twelve States"),
    "122.vote": ("art-122", r"is rejected if a majority of voters vote against it"),
    "123bis.urgent": ("art-123bis", r"may be declared urgent by the Kongres"),
    "150.garanties": ("art-150", r"^The following provisions may be revised only with the approval"),
}


def J(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def W(p, obj):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return p.stat().st_size


# ----------------------------------------------------------------- texte français (v4.md)
def slug(s):
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def blocks(text):
    """Même découpage que scripts/build_constitution.py (listes regroupées)."""
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
            out.append({"t": "ol", "items": [[int(m.group(1)), m.group(2).strip()]
                                             for m in (re.match(r"^(\d+)\. (.*)$", l) for l in lines)]})
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


def parse_fr(md):
    """Le français garde ses propres préfixes (Titre 4, Chapitre 2, Article 110 bis, Section 3)."""
    md = md.split("\n# Annexe")[0]
    doc = {"preamble": None, "titles": {}, "arts": {}, "chap": {}, "sec": {}}
    for sec in re.split(r"^# ", md, flags=re.M)[1:]:
        heading, _, rest = sec.partition("\n")
        rest = re.sub(r"^---\s*$", "", rest, flags=re.M)
        if heading.startswith("Préambule"):
            paras = [p.strip() for p in re.split(r"\n\s*\n", rest) if p.strip()]
            motto = paras.pop() if paras and paras[-1].startswith("*") else ""
            doc["preamble"] = {"paras": paras, "motto": motto.strip("*")}
            continue
        m = re.match(r"^Titre (\d+(?: bis)?) / (.+)$", heading)
        if not m:
            continue
        tid = "title-" + slug(m.group(1))
        doc["titles"][tid] = m.group(2).strip()
        parts = re.split(r"^## ", rest, flags=re.M)
        pre, chaps = parts[0], parts[1:]
        if not chaps:
            chaps = ["\n" + pre]
        elif pre.strip():
            chaps = ["\n" + pre] + chaps
        for cp in chaps:
            ch_head, _, ch_body = cp.partition("\n")
            cm = re.match(r"^Chapitre (\d+(?: bis)?) / (.+)$", ch_head.strip())
            if cm:
                doc["chap"][(tid, "Chapter " + cm.group(1))] = cm.group(2).strip()
            aparts = re.split(r"^### ", ch_body, flags=re.M)

            def section(t):
                sm = re.search(r"^#### Section (\S+) / (.+)$", t, re.M)
                return (("Section " + sm.group(1), sm.group(2).strip()), sm.start()) if sm else (None, len(t))
            pending, _ = section(aparts[0])
            for ap in aparts[1:]:
                a_head, _, a_body = ap.partition("\n")
                nxt, cut = section(a_body)
                am = re.match(r"^Article (\d+(?: \w+)?) / (.+)$", a_head.strip())
                if not am:
                    pending = nxt or pending
                    continue
                aid = "art-" + slug(am.group(1))
                doc["arts"][aid] = {"name": am.group(2).strip(), "body": blocks(a_body[:cut])}
                if pending:
                    doc["sec"][aid] = pending
                pending = nxt
    return doc


# ----------------------------------------------------------------- unités et renvois
def units_of(body):
    """Aplatit un corps d'article en unités alignables : (genre, marque, texte)."""
    u = []
    for b in body:
        if b["t"] in ("p", "h"):
            u.append((b["t"], "", b["x"]))
        elif b["t"] == "ul":
            u += [("li", "–", x) for x in b["items"]]
        else:
            u += [("li", f"{m}.", x) for m, x in b["items"]]
    return u


def shape_of(body):
    return [(k, m) for k, m, _ in units_of(body)]


TRIG = {
    "en": r"\b(?:Articles?|Art\.)",
    "fr": r"(?<![^\W\d_])(?:[Aa]rticles?|[Aa]rt\.)",
    "std": r"(?<![^\W\d_])[Čč]l(?:\.|an|en)[^\W\d_]*",
}
NUM = rf"\d{{1,3}}(?:[  ](?:{SUF})(?![^\W\d_]))?"
# lettres d'alinéa après un numéro : « 109 a and b », « 109 a in b » ; jamais prises pour un renvoi
LETTERS = r"(?:[  ][a-h](?![^\W_])(?:(?:, | and | or | et | ou | in | i | ali | ili )[a-h](?![^\W_]))*)?"
SEPS = r"(?:, | and | or | to | et | ou | à | in | i | do | ali | ili | ter )"
RANGE_SEPS = {" to ", " à ", " do "}
TITLE_RE = {
    "en": r"\b(Titles?)[  ]([IVX]+(?: bis)?)(?![\w])",
    "fr": r"(?<![\w])([Tt]itres?)[  ](\d+(?: bis)?)(?![\w])",
    "std": r"(?<![^\W\d_])(Title|[Pp]oglavj\w*|[Gg]lav\w*)[  ]([IVX]+(?: bis)?)(?![\w])",
}


def art_id(num):
    return "art-" + slug(num)


def title_id_from(num, lang):
    roman, _, sfx = num.partition(" ")
    n = roman if lang == "fr" else ROMAN.get(roman)
    return f"title-{n}{slug(sfx)}" if n else None


def link_text(raw, lang, ORDER, ART_TITLE, TITLES, CODES):
    """Texte brut → HTML : gras, italique, renvois d'articles et de titres, codes d'États, liés aux
    routes du portail. Renvoie (html, [ids cités])."""
    kind = lang if lang in ("en", "fr") else "std"
    cited = []
    spans = []  # (début, fin, cible)
    for m in re.finditer(TRIG[kind] + r"[  ](?:ot |od )?", raw):
        pos = m.end()
        first = True
        prev_id = None
        prev_sep = None
        while True:
            nm = re.compile(NUM).match(raw, pos)
            if not nm:
                break
            aid = art_id(nm.group(0))
            start = m.start() if first else nm.start()
            if aid in ORDER:
                spans.append((start, nm.end(), aid))
                if prev_sep in RANGE_SEPS and prev_id in ORDER:
                    a, b = ORDER[prev_id], ORDER[aid]
                    cited += [k for k, i in ORDER.items() if a < i < b]
                cited.append(aid)
            first = False
            prev_id = aid
            pos = nm.end()
            lm = re.compile(LETTERS).match(raw, pos)
            pos = lm.end() if lm else pos
            sm = re.compile(SEPS).match(raw, pos)
            if not sm or not re.compile(NUM).match(raw, sm.end()):
                break
            prev_sep = sm.group(0)
            pos = sm.end()
    for m in re.finditer(TITLE_RE[kind], raw):
        tid = title_id_from(m.group(2), lang)
        if tid in TITLES and not any(s <= m.start() < e for s, e, _ in spans):
            spans.append((m.start(), m.end(), tid))
            cited.append(tid)
    for m in re.finditer(r"\b([A-Z]{2}-\d{2})\b", raw):
        if m.group(1) in CODES:
            spans.append((m.start(), m.end(), "state-" + m.group(1)))
    spans.sort()
    out, i = [], 0
    for s, e, target in spans:
        if s < i:
            continue
        out.append(html.escape(raw[i:s], quote=False))
        txt = html.escape(raw[s:e], quote=False)
        if target.startswith("state-"):
            out.append(f'<a class="cx-sl" href="#/state/{target[6:]}" translate="no">{txt}</a>')
        elif target.startswith("title-"):
            out.append(f'<a class="cx-rf" href="#/constitution/{target}">{txt}</a>')
        else:
            out.append(f'<a class="cx-rf" href="#/constitution/{ART_TITLE[target]}/{target}">{txt}</a>')
        i = e
    out.append(html.escape(raw[i:], quote=False))
    h = "".join(out)
    h = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", h)
    h = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", h)
    return h, cited


def plain(raw):
    return re.sub(r"\*+", "", raw)


# ----------------------------------------------------------------- construction
def main() -> int:
    docs = {"en": J(PD / "constitution.json")}
    for s in STDS:
        docs[s] = J(PD / f"constitution.{s}.json")
    fr = parse_fr((ROOT / "docs" / "constitution" / "v4.md").read_text(encoding="utf-8"))
    CODES = {e["c"] for e in J(PD / "etats.json")}
    errors = []

    en = docs["en"]
    ORDER, TITLES, ART_TITLE = {}, [], {}
    for t in en["titles"]:
        TITLES.append(t["id"])
        for c in t["chapters"]:
            for a in c["articles"]:
                ORDER[a["id"]] = len(ORDER)
                ART_TITLE[a["id"]] = t["id"]
    TSET = set(TITLES)

    arts = {l: {} for l in LANGS}
    for l in ["en"] + STDS:
        for t in docs[l]["titles"]:
            for c in t["chapters"]:
                for a in c["articles"]:
                    arts[l][a["id"]] = a
    for s in STDS:   # garanti par build_constitution.py ; contrôlé de nouveau, à l'unité
        for aid, a in arts["en"].items():
            if aid not in arts[s] or shape_of(arts[s][aid]["body"]) != shape_of(a["body"]):
                errors.append(f"{s} : structure de {aid} différente de l'anglais")
    for aid, a in arts["en"].items():
        f = fr["arts"].get(aid)
        if not f:
            errors.append(f"fr : {aid} absent de docs/constitution/v4.md")
        elif shape_of(f["body"]) != shape_of(a["body"]):
            errors.append(f"fr : {aid} ne s'aligne pas ({len(shape_of(a['body']))} unités en anglais, "
                          f"{len(shape_of(f['body']))} en français)")
    extra = [k for k in fr["arts"] if k not in arts["en"]]
    if extra:
        errors.append(f"fr : articles sans équivalent anglais : {extra}")
    if not fr["preamble"] or len(fr["preamble"]["paras"]) != len(en["preamble"]["paras"]):
        errors.append("fr : le préambule n'a pas le nombre d'alinéas de l'anglais")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1

    # ancrages des instruments, sur le texte anglais
    anc = {}
    for key, (aid, pat) in ANCRES.items():
        us = [x for _, _, x in units_of(arts["en"].get(aid, {"body": []})["body"])]
        hits = [i for i, x in enumerate(us) if re.search(pat, x)]
        if len(hits) != 1:
            errors.append(f"ancrage {key} : {len(hits)} unité(s) de {aid} pour /{pat}/")
        else:
            anc[key] = [aid, hits[0]]

    cited_by, refs_en, ref_mismatch = {}, {}, []
    idx = {l: {} for l in LANGS}
    full = {l: {} for l in LANGS}
    files = {}   # chemin relatif → objet ; rien n'est écrit si un contrôle échoue

    for ti, t in enumerate(en["titles"]):
        for l in LANGS:
            chapters = []
            for ci, c in enumerate(t["chapters"]):
                src_ch = docs[l]["titles"][ti]["chapters"][ci] if l != "fr" else None
                ch = {"num": c["num"],
                      "name": fr["chap"].get((t["id"], c["num"]), "") if l == "fr" else src_ch["name"],
                      "arts": []}
                for a in c["articles"]:
                    aid = a["id"]
                    body = fr["arts"][aid]["body"] if l == "fr" else arts[l][aid]["body"]
                    name = fr["arts"][aid]["name"] if l == "fr" else arts[l][aid]["name"]
                    rec = {"id": aid, "num": a["num"].replace("Article ", ""), "name": name, "u": []}
                    if "sec" in a:
                        sn = fr["sec"].get(aid, ("", ""))[1] if l == "fr" else arts[l][aid]["sec"]["name"]
                        rec["sec"] = [a["sec"]["num"], sn]
                    us = units_of(body)
                    if l == "fr":   # espaces insécables de la typographie française
                        us = [(k, m, re.sub(r" ([:;?!»])", " \\1", x).replace("« ", "« "))
                              for k, m, x in us]
                    cites = []
                    for k, m, x in us:
                        h, cs = link_text(x, l, ORDER, ART_TITLE, TSET, CODES)
                        cites.append([c_ for c_ in cs if c_ != aid])
                        rec["u"].append([k, m, h] if m else [k, h])
                    if l == "en":
                        refs_en[aid] = cites
                        for cs in cites:
                            for c_ in cs:
                                cited_by.setdefault(c_, [])
                                if aid not in cited_by[c_]:
                                    cited_by[c_].append(aid)
                    else:
                        for ui, (g, w) in enumerate(zip(cites, refs_en[aid])):
                            if sorted(set(g)) != sorted(set(w)):
                                ref_mismatch.append(f"{l} {aid} unité {ui} : en {sorted(set(w))}, "
                                                    f"{l} {sorted(set(g))}")
                    first = next((plain(x) for k, _, x in us if k == "p"), "")
                    idx[l][aid] = [rec["num"], name, first[:260] + ("…" if len(first) > 260 else "")]
                    full[l][aid] = name + " \n" + " \n".join(plain(x) for _, _, x in us)
                    ch["arts"].append(rec)
                chapters.append(ch)
            tname = fr["titles"].get(t["id"], "") if l == "fr" else docs[l]["titles"][ti]["name"]
            files[f"t/{t['id']}.{l}.json"] = {"id": t["id"], "num": t["num"].replace("Title ", ""),
                                               "name": tname, "ch": chapters}
    if ref_mismatch:
        errors += ["renvois divergents : " + r for r in ref_mismatch]
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    for l in LANGS:
        files[f"idx.{l}.json"] = idx[l]
        files[f"full.{l}.json"] = full[l]

    pre = {l: docs[l]["preamble"] for l in ["en"] + STDS}
    pre["fr"] = fr["preamble"]
    toc = [{"id": t["id"], "num": t["num"].replace("Title ", ""),
            "name": [docs[l]["titles"][ti]["name"] for l in ["en"] + STDS] + [fr["titles"].get(t["id"], "")],
            "a": [a["id"][4:] for c in t["chapters"] for a in c["articles"]]}
           for ti, t in enumerate(en["titles"])]
    core = {"version": en["version"], "iso": en["iso"], "date": en["date"], "langs": LANGS,
            "toc": toc, "pre": pre,
            "cited": {k: sorted(v, key=lambda a: ORDER[a]) for k, v in cited_by.items()},
            "anc": anc}
    files["core.json"] = core
    # Écriture : les fichiers générés précédents (titre disparu, langue retirée) sont d'abord retirés ;
    # map.json, produit par build_carte_marge.py, reste.
    for old in [OUT / "core.json", *OUT.glob("idx.*.json"), *OUT.glob("full.*.json")]:
        old.unlink()
    if (OUT / "t").exists():
        shutil.rmtree(OUT / "t")
    sizes = {k: W(OUT / k, v) for k, v in files.items()}
    tsz = [v for k, v in sizes.items() if k.startswith("t/")]
    print(f"Lecteur → {OUT.relative_to(ROOT)}/ : {len(ORDER)} articles, {len(TITLES)} titres, "
          f"{len(tsz)} fichiers de titres (le plus lourd {max(tsz) // 1024} ko), "
          f"core.json {sizes['core.json'] // 1024} ko, {sum(len(v) for v in cited_by.values())} renvois "
          f"inverses, {len(anc)} ancrages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
