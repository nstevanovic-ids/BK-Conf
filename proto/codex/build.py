#!/usr/bin/env python3
"""
build.py — prototype « Codex » : la Constitution est le site.

Lit (sans rien modifier) :
  portail/data/constitution.json, constitution.{zap,sre,ist}.json   textes officiels
  docs/constitution/v4.md                                           texte de travail français
  portail/data/{etats,stats,peuples,flagnotes,state_flags,entites-autonomes,opstine,i18n,textes,geo}.json
  portail/fonts/*.woff2, portail/images/coa-*.webp, portail/index.html (emblème COA_DATA)
Écrit dans proto/codex/ :
  data/core.json            sommaire, préambule (5 textes), chaînes d'interface, ordre des articles
  data/t/<titre>.<lg>.json  un fichier par titre et par texte : unités alignées, renvois liés
  data/idx.<lg>.json        nom et premier alinéa de chaque article (aperçus, palette)
  data/full.<lg>.json       texte par article, graphie d'origine (la palette le replie pour chercher)
  data/states.json          54 entités, chiffres, voisins, articles qui les nomment
  data/map.json             carte des 54 entités (géométries de geo.json simplifiées en couverture)
  data/instr.json           données des instruments (populations, PIB, peuples)
  data/opstine.json         index des communes (copie)
  flags/<code>.png, coa/<code>.webp, fonts/, emblem.png
  strings-new.json          chaînes d'interface nouvelles (non traduites)
  build-report.json         alignement du français, renvois, contrôles

Usage : python proto/codex/build.py
"""
import base64
import html
import json
import re
import shutil
import struct
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
PD = ROOT / "portail" / "data"
OUT = HERE / "data"
LANGS = ["en", "zap", "sre", "ist", "fr"]
STDS = ["zap", "sre", "ist"]
SUF = "bis|ter|quater|quinquies|sexies|septies|octies"
ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10}
REPORT = {"fr_misaligned": [], "ref_mismatch": [], "warnings": []}


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
            pending = None
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
    """Aplatis un corps d'article en unités alignables : (genre, marque, texte)."""
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


def link_text(raw, lang, ORDER, TITLES, CODES):
    """Texte brut -> HTML : gras, italique, renvois d'articles et de titres, codes d'États.
    Renvoie (html, [ids cités])."""
    kind = lang if lang in ("en", "fr") else "std"
    cited = []
    spans = []  # (start, end, href, data)
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
            out.append(f'<a class="sl" href="#{target}" translate="no">{txt}</a>')
        else:
            out.append(f'<a class="rf" href="#{target}">{txt}</a>')
        i = e
    out.append(html.escape(raw[i:], quote=False))
    h = "".join(out)
    h = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", h)
    h = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", h)
    return h, cited


def plain(raw):
    return re.sub(r"\*+", "", raw)


FOLD = str.maketrans({"đ": "d", "Đ": "d", "ł": "l", "ß": "ss", "æ": "ae", "œ": "oe", "ø": "o", "ı": "i",
                      "’": "'", "–": "-", "—": "-"})


def fold(s):
    s = unicodedata.normalize("NFD", s.translate(FOLD).lower())
    return "".join(c for c in s if not unicodedata.combining(c))


# ----------------------------------------------------------------- géométrie : voisins
def neighbours(geo):
    try:
        from shapely.geometry import Polygon
        from shapely.ops import unary_union
    except Exception as e:  # pragma: no cover
        REPORT["warnings"].append(f"shapely absent, voisins non calculés : {e}")
        return {}, {}
    q = geo.get("q", 1000)

    def ring(a):
        x, y = a[0], a[1]
        r = [(x / q, y / q)]
        for i in range(2, len(a), 2):
            x += a[i]
            y += a[i + 1]
            r.append((x / q, y / q))
        return r
    shapes = {}
    for o in geo["states"] + geo["fed"]:
        polys = []
        for p in o["g"]:
            rr = [ring(a) for a in p]
            if len(rr[0]) >= 3:
                pg = Polygon(rr[0], [h for h in rr[1:] if len(h) >= 3])
                polys.append(pg if pg.is_valid else pg.buffer(0))
        shapes[o["c"]] = unary_union(polys)
    nb = {c: [] for c in shapes}
    codes = sorted(shapes)
    buf = {c: shapes[c].buffer(0.004) for c in codes}
    for i, a in enumerate(codes):
        for b in codes[i + 1:]:
            if buf[a].intersects(buf[b]):
                inter = buf[a].intersection(buf[b])
                if inter.length > 0.03:  # un contact ponctuel n'est pas une limite commune
                    nb[a].append(b)
                    nb[b].append(a)
    return nb, shapes


def build_map(shapes):
    """Carte des 54 entités : géométries de geo.json, simplifiées en couverture (limites communes
    conservées), projetées (équirectangulaire au parallèle moyen), largeur 1000. Rien n'est dessiné."""
    import math
    import shapely
    codes = sorted(shapes)
    geoms = [shapes[c] for c in codes]
    try:
        simp = list(shapely.coverage_simplify(geoms, 0.02))
    except Exception as e:  # pragma: no cover
        REPORT["warnings"].append(f"coverage_simplify indisponible ({e}) : simplification par entité")
        simp = [g.simplify(0.01, preserve_topology=True) for g in geoms]
    x0 = min(g.bounds[0] for g in geoms); x1 = max(g.bounds[2] for g in geoms)
    y0 = min(g.bounds[1] for g in geoms); y1 = max(g.bounds[3] for g in geoms)
    kx = math.cos(math.radians((y0 + y1) / 2))
    sc = 1000 / ((x1 - x0) * kx)
    P = lambda x, y: (round((x - x0) * kx * sc, 1), round((y1 - y) * sc, 1))
    out = {}
    for c, g, full in zip(codes, simp, geoms):
        polys = list(g.geoms) if hasattr(g, "geoms") else [g]
        d = ""
        for pg in polys:
            for ring in [pg.exterior] + list(pg.interiors):
                pts = [P(x, y) for x, y in ring.coords]
                if len(pts) >= 4:
                    d += "M" + "L".join(f"{x:g},{y:g}" for x, y in pts[:-1]) + "Z"
        rp = max((list(full.geoms) if hasattr(full, "geoms") else [full]), key=lambda q_: q_.area).representative_point()
        bx = [P(full.bounds[0], full.bounds[3]), P(full.bounds[2], full.bounds[1])]
        out[c] = {"d": d, "c": list(P(rp.x, rp.y)), "b": [bx[0][0], bx[0][1], bx[1][0], bx[1][1]]}
    return {"w": 1000, "h": round((y1 - y0) * sc, 1), "e": out}


def png_size(b):
    return struct.unpack(">II", b[16:24])


# ----------------------------------------------------------------- chaînes d'interface
UI = {
    # clé : anglais (clé de textes.json ou valeur anglaise de i18n.json)
    "brand": "Balkanska Konfederacija", "topline": "Official portal of the Balkan Confederation",
    "constitution": "Constitution", "preamble": "Preamble", "titles": "Titles", "law": "Fundamental law",
    "h1": "Constitution of the Balkan Confederation", "version": "Consolidated text, version {0} of {1}.",
    "begin": "Begin reading", "read": "Read", "prev": "Previous", "next": "Next", "back": "Back",
    "home": "Home", "states": "States", "search": "Search the portal",
    "search_ph": "Search states, communities, peoples, letters, pages…", "noresult": "No result.",
    "lat": "Latin", "cyr": "Cyrillic", "menu": "Open menu", "menu_x": "Close menu",
    "theme": "Toggle light / dark theme", "search_x": "Close search", "search_q": "Search query",
    "k_nav": "navigate", "k_open": "open", "k_close": "close",
    "title_n": "Title {0}", "chapter_n": "Chapter {0}", "section_n": "Section {0}", "article_n": "Article {0}",
    "art_n": "Art. {0}", "n_articles": "{0} articles", "articles_of": "Articles of {0}",
    "population": "Population", "area": "Area", "municipalities": "Municipalities", "seat": "Seat",
    "gdp": "GDP per capita", "kseats": "Kongres seats", "people": "Constituent people", "code": "Official code",
    "t_T": "Territorial state", "t_F": "Confederal territory", "t_M": "Confederal autonomous municipality",
    "keydata": "Key data", "in_const": "In the Constitution", "coa": "Coat of arms", "density": "Density",
    "km2": "{0} km²", "inhab": "{0} inhabitants", "perkm2": "{0} / km²", "pps": "{0} PPS",
    "eu": "{0}% of the EU-27 average", "sources": "Sources", "open_state": "Open state page",
    "autonomy": "Autonomous communities", "peoples": "Constituent peoples", "registered": "Registered citizens",
    "delegates": "Delegates", "constituencies": "Constituencies", "total": "Total", "rank": "Rank {0} of {1}",
    "all_states": "All states", "territorial": "Territorial states",
    "fed_muni": "Confederal territories and municipalities", "language": "Language", "continue": "Continue →",
    "notfound": "Not found", "state_nf": "State not found.", "function": "Function", "status": "Status",
    "open": "Open", "our_home": "Our home.", "per_delegate": "Inhabitants per delegate, on average",
    "equal_formula": "Confederal financial equalisation formula", "double_key": "Consensus first, then a double key",
    "pps_inh": "{0} PPS per inhabitant", "show_all": "Show all", "pages": "Pages",
    "explore": "Explore the states", "municipality": "Municipality",
    "location": "Location",
    # chaînes nouvelles (absentes du portail) : restent en anglais, data-untranslated, marque visible
    "assumption": "Assumption", "misaligned": "Alignment failed for this article.", "skip": "Skip to content",
    "todo": "To be translated",
    "as_reg": "No annual count exists yet (Art. 115 bis): each register is given the census population of the territorial States attached to its people.",
    "as_plen": "The plenary majority depends on seventy individual votes and is not modelled here.",
    "as_eq": "The formula is left to confederal law. Here: fiscal capacity is GDP per inhabitant (Eurostat 2023, PPS); the average is weighted by population over the 52 States; one uniform rate is levied on the surplus, the lowest that pays the floor.",
    "as_gap": "At this setting the ceiling does not pay for the floor. The text does not say who covers the gap.",
    "as_sl": "The text does not say how the limits combine with the method. Here: one common divisor, standard rounding, then the limits, as on the portal.",
    "as_al": "Two thirds is rounded up: seven of the ten members of a delegation, 167 of the 250 delegates. A majority of the fourteen members of the committee is eight.",
}
NEW_KEYS = ["assumption", "misaligned", "skip", "todo", "as_reg", "as_plen", "as_eq", "as_gap", "as_sl", "as_al"]
# libellés du premier tour remplacés par une chaîne déjà traduite du portail, ou par un signe
REPLACED = [
    ["Cited by", "In the Constitution", "textes.json"],
    ["Texts in parallel", "Language", "textes.json"],
    ["Reading thread", "Pages", "textes.json (aria-label seulement)"],
    ["Neighbouring States", "Location", "textes.json"],
    ["Applies to its category", "Territorial state / Confederal territory / Confederal autonomous municipality", "textes.json"],
    ["Names this State", "(supprimé : le titre « In the Constitution » suffit)", "textes.json"],
    ["Reset", "↺, aria-label « Back »", "textes.json"],
    ["Double line", "aria-label « Latin / Cyrillic »", "i18n.json (scr_lat, scr_cyr)"],
    ["For / Against", "signes ✓ et ✕", "aucune chaîne"],
    ["Condition met / Condition not met", "signes ✓ et ✕", "aucune chaîne"],
    ["Confederal average", "« 100 % = n PPS »", "aucune chaîne"],
    ["at the floor / at the ceiling", "« min 2 », « max 20 »", "aucune chaîne"],
    ["Reading progress", "« Constitution »", "textes.json (aria-label)"],
    ["French working text", "« FR »", "aucune chaîne"],
    ["les quatre phrases d'accueil", "remplacées par l'instrument de l'art. 110 sur l'accueil", "texte de la Constitution"],
]


def build_ui(textes, i18n):
    by_en = {v["en"]: v for v in i18n["t"].values()}
    ui, new = {}, []
    for k, en in UI.items():
        tr = textes.get(en) or by_en.get(en)
        if tr and all(s in tr for s in STDS):
            ui[k] = [en] + [tr[s] for s in STDS]
        else:
            ui[k] = [en]
            new.append(en)
            if k not in NEW_KEYS:
                REPORT["warnings"].append(f"chaîne attendue dans le portail, absente : {en!r}")
    return ui, new


# ----------------------------------------------------------------- construction
def main():
    docs = {"en": J(PD / "constitution.json")}
    for s in STDS:
        docs[s] = J(PD / f"constitution.{s}.json")
    fr = parse_fr((ROOT / "docs" / "constitution" / "v4.md").read_text(encoding="utf-8"))
    etats = J(PD / "etats.json")
    stats = J(PD / "stats.json")
    peuples = J(PD / "peuples.json")
    notes = J(PD / "flagnotes.json")
    flags = J(PD / "state_flags.json")
    aut = J(PD / "entites-autonomes.json")
    textes = J(PD / "textes.json")["t"]
    i18n = J(PD / "i18n.json")
    CODES = {e["c"] for e in etats}

    en = docs["en"]
    ORDER, TITLES, ART_TITLE = {}, [], {}
    for t in en["titles"]:
        TITLES.append(t["id"])
        for c in t["chapters"]:
            for a in c["articles"]:
                ORDER[a["id"]] = len(ORDER)
                ART_TITLE[a["id"]] = t["id"]
    TSET = set(TITLES)

    # index des articles par langue
    arts = {l: {} for l in LANGS}
    for l in ["en"] + STDS:
        for t in docs[l]["titles"]:
            for c in t["chapters"]:
                for a in c["articles"]:
                    arts[l][a["id"]] = a
    # contrôle de structure des trois standards (le build du portail le garantit déjà)
    for s in STDS:
        for aid, a in arts["en"].items():
            if aid not in arts[s] or shape_of(arts[s][aid]["body"]) != shape_of(a["body"]):
                REPORT["warnings"].append(f"{s} : structure de {aid} différente de l'anglais")
    # alignement du français, article par article
    fr_ok = {}
    for aid, a in arts["en"].items():
        f = fr["arts"].get(aid)
        if not f:
            REPORT["fr_misaligned"].append({"id": aid, "why": "article absent de v4.md"})
            fr_ok[aid] = None
            continue
        se, sf = shape_of(a["body"]), shape_of(f["body"])
        if se != sf:
            REPORT["fr_misaligned"].append({"id": aid, "why": f"blocs différents : en {len(se)} unités, fr {len(sf)}"})
            fr_ok[aid] = False
        else:
            fr_ok[aid] = True
    extra = [k for k in fr["arts"] if k not in arts["en"]]
    if extra:
        REPORT["warnings"].append(f"articles français sans équivalent : {extra}")

    cited_by = {}
    refs_en = {}
    idx = {l: {} for l in LANGS}
    full = {l: {} for l in LANGS}
    art_units = {l: {} for l in LANGS}   # texte brut par unité (pour les extraits d'États)
    sizes = {}

    def name_of(l, aid):
        return fr["arts"][aid]["name"] if l == "fr" else arts[l][aid]["name"]

    for t in en["titles"]:
        ti = en["titles"].index(t)
        for l in LANGS:
            chapters = []
            for ci, c in enumerate(t["chapters"]):
                src_ch = docs[l]["titles"][ti]["chapters"][ci] if l != "fr" else None
                ch = {"num": c["num"],
                      "name": (fr["chap"].get((t["id"], c["num"]), "") if l == "fr" else src_ch["name"]),
                      "arts": []}
                for a in c["articles"]:
                    aid = a["id"]
                    body = fr["arts"][aid]["body"] if l == "fr" and fr_ok[aid] is not None else \
                        (None if l == "fr" else arts[l][aid]["body"])
                    rec = {"id": aid, "num": a["num"].replace("Article ", ""), "name": "", "u": []}
                    if "sec" in a:
                        sn = fr["sec"].get(aid, ("", ""))[1] if l == "fr" else arts[l][aid]["sec"]["name"]
                        rec["sec"] = [a["sec"]["num"], sn]
                    if body is None:
                        rec["miss"] = 1
                        ch["arts"].append(rec)
                        continue
                    rec["name"] = name_of(l, aid)
                    if l == "fr" and not fr_ok[aid]:
                        rec["mis"] = 1   # montré d'un bloc, sans alignement, rien n'est inventé
                    cites = []
                    us = units_of(body)
                    if l == "fr":   # espaces insécables de la typographie française, à l'affichage seulement
                        us = [(k, m, re.sub(r" ([:;?!»])", "\u00a0\\1", x).replace("« ", "«\u00a0")) for k, m, x in us]
                    for ui_, (k, m, x) in enumerate(us):
                        h, cs = link_text(x, l, ORDER, TSET, CODES)
                        cs = [c_ for c_ in cs if c_ != aid]
                        cites.append(cs)
                        rec["u"].append([k, m, h] if m else [k, h])
                    art_units[l][aid] = [x for _, _, x in us]
                    if l == "en":
                        refs_en[aid] = cites
                        for cs in cites:
                            for c_ in cs:
                                cited_by.setdefault(c_, [])
                                if aid not in cited_by[c_]:
                                    cited_by[c_].append(aid)
                    elif not rec.get("mis"):
                        got, want = [sorted(set(c_)) for c_ in cites], [sorted(set(c_)) for c_ in refs_en[aid]]
                        if got != want:
                            for ui_, (g, w_) in enumerate(zip(got, want)):
                                if g != w_:
                                    REPORT["ref_mismatch"].append({"lang": l, "id": aid, "unit": ui_, "en": w_, l: g})
                    first = next((plain(x) for k, _, x in us if k == "p"), "")
                    idx[l][aid] = [rec["num"], rec["name"], first[:260] + ("…" if len(first) > 260 else "")]
                    full[l][aid] = rec["name"] + " \n" + " \n".join(plain(x) for _, _, x in us)
                    ch["arts"].append(rec)
                chapters.append(ch)
            tname = fr["titles"].get(t["id"], "") if l == "fr" else docs[l]["titles"][ti]["name"]
            sizes[f"{t['id']}.{l}"] = W(OUT / "t" / f"{t['id']}.{l}.json",
                                         {"id": t["id"], "num": t["num"].replace("Title ", ""), "name": tname,
                                          "ch": chapters})
    for l in LANGS:
        W(OUT / f"idx.{l}.json", idx[l])
        W(OUT / f"full.{l}.json", full[l])

    # ---------------- États : chiffres, voisins, articles qui les nomment
    nb, shapes = neighbours(J(PD / "geo.json"))
    if shapes:
        REPORT.setdefault("counts", {})
        map_size = W(OUT / "map.json", build_map(shapes))
    (HERE / "flags").mkdir(exist_ok=True)
    (HERE / "coa").mkdir(exist_ok=True)
    CAT = {"T": r"\bterritorial States?\b", "F": r"\bconfederal territor(?:y|ies)\b",
           "M": r"\bconfederal autonomous municipalit(?:y|ies)\b"}
    states = []
    for e in etats:
        c = e["c"]
        st = stats.get(c, {})
        rec = {"c": c, "n": e["n"], "p": e["p"], "t": e["t"], "ch": html.unescape(e["ch"]),
               "pop": st.get("population"), "area": st.get("area"), "mun": st.get("municipalities"),
               "gdp": st.get("gdp"), "eu": st.get("gdp_eu"), "src": st.get("source"),
               "gsrc": st.get("gdp_source"),
               "note": (lambda n: [n] + [textes[n][x] for x in STDS] if n in textes and all(x in textes[n] for x in STDS) else [n])(notes.get(e["k"], "")), "nb": sorted(nb.get(c, [])),
               "aut": [[a["id"], a["n"], a["com"]] for a in aut if a["host"] == c]}
        if c in flags:
            raw = base64.b64decode(flags[c].split(",", 1)[1])
            (HERE / "flags" / f"{c}.png").write_bytes(raw)
            rec["fw"], rec["fh"] = png_size(raw)
            if rec["fh"] > rec["fw"]:
                REPORT["warnings"].append(f"drapeau {c} plus haut que large")
        coa = ROOT / "portail" / "images" / f"coa-{c}.webp"
        if coa.exists():
            shutil.copyfile(coa, HERE / "coa" / f"{c}.webp")
            rec["coa"] = 1
        name_re = re.compile(r"(?<![^\W\d_])" + re.escape(e["n"]) + r"(?![^\W\d_])")
        named, cat = [], []
        for aid in ORDER:
            for ui_, x in enumerate(art_units["en"][aid]):
                if c in x or name_re.search(x):
                    named.append([aid, ui_])
                    break
            else:
                if any(re.search(CAT[e["t"]], x) for x in art_units["en"][aid]):
                    cat.append(aid)
        rec["named"], rec["cat"] = named, cat
        states.append(rec)
    srcs = {x for s_ in states for x in (s_["src"], s_["gsrc"]) if x}
    src_tr = {x: [textes[x][l] for l in STDS] for x in srcs if x in textes and all(l in textes[x] for l in STDS)}
    for x in srcs - set(src_tr):
        REPORT["warnings"].append(f"source non traduite dans le portail : {x!r}")
    W(OUT / "states.json", {"s": states, "src": src_tr})

    # ---------------- instruments
    W(OUT / "instr.json", {
        "peoples": [{"k": k, "name": v["name"], "en": v["en"]} for k, v in peuples.items()],
        "states": [{"c": s["c"], "n": s["n"], "p": s["p"], "t": s["t"], "pop": s["pop"], "gdp": s["gdp"]}
                   for s in states]})

    # ---------------- cœur : sommaire, préambule, interface
    ui, new = build_ui(textes, i18n)
    pre = {l: docs[l]["preamble"] for l in ["en"] + STDS}
    pre["fr"] = fr["preamble"]
    if not fr["preamble"] or len(fr["preamble"]["paras"]) != len(en["preamble"]["paras"]):
        REPORT["warnings"].append("préambule français : nombre d'alinéas différent")
    toc = []
    for ti, t in enumerate(en["titles"]):
        toc.append({"id": t["id"], "num": t["num"].replace("Title ", ""),
                    "name": [docs[l]["titles"][ti]["name"] for l in ["en"] + STDS] + [fr["titles"].get(t["id"], "")],
                    "a": [a["id"][4:] for c in t["chapters"] for a in c["articles"]]})
    pe_names = {}
    for k, v in peuples.items():
        tr = textes.get(v["en"], {})
        pe_names[k] = [v["en"]] + [tr.get(s, v["name"]) for s in STDS]
    ch_tr = {}
    for e in etats:
        if e["t"] != "T":
            k = html.unescape(e["ch"])
            tr = textes.get(e["ch"]) or textes.get(k) or {}
            ch_tr[k] = [k] + [html.unescape(tr.get(s, k)) for s in STDS]
    core = {
        "version": en["version"], "iso": en["iso"], "date": en["date"],
        "langs": i18n["langs"], "ui": ui, "new": new, "toc": toc, "pre": pre,
        "cited": {k: sorted(v, key=lambda a: ORDER[a]) for k, v in cited_by.items()},
        "st": [[x["c"], x["n"], x["t"], x["p"], x["ch"], x["pop"], x["area"], x["mun"], x["gdp"], x["eu"], x.get("fw"), x.get("fh")] for x in states],
        "pe": pe_names, "ch": ch_tr,
        "keep": [a["n"] for a in aut],
        "fr_mis": [r["id"] for r in REPORT["fr_misaligned"]],
    }
    core_size = W(OUT / "core.json", core)
    shutil.copyfile(PD / "opstine.json", OUT / "opstine.json")

    # ---------------- polices, emblème
    (HERE / "fonts").mkdir(exist_ok=True)
    for f in (ROOT / "portail" / "fonts").iterdir():
        shutil.copyfile(f, HERE / "fonts" / f.name)   # telles quelles : un sous-ensemble ne gagnait que 34 ko
    src = (ROOT / "portail" / "index.html").read_text(encoding="utf-8")
    m = re.search(r'const COA_DATA="data:image/png;base64,([^"]+)"', src)
    if m:
        (HERE / "emblem.png").write_bytes(base64.b64decode(m.group(1)))
    else:
        REPORT["warnings"].append("emblème COA_DATA introuvable dans portail/index.html")

    (HERE / "strings-new.json").write_text(json.dumps(
        {"new": new, "replaced_by_existing": [{"was": w_, "now": n_, "source": src_} for w_, n_, src_ in REPLACED]},
        ensure_ascii=False, indent=1), encoding="utf-8")
    REPORT["counts"] = {"articles": len(ORDER), "titles": len(TITLES), "states": len(states),
                        "reverse_refs": sum(len(v) for v in cited_by.values()),
                        "articles_cited": len([k for k in cited_by if k.startswith("art-")]),
                        "new_strings": len(new), "core_bytes": core_size,
                        "largest_title_bytes": max(sizes.values())}
    (HERE / "build-report.json").write_text(json.dumps(REPORT, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(REPORT["counts"], ensure_ascii=False))
    print(f"français : {len(REPORT['fr_misaligned'])} article(s) non aligné(s)",
          [r["id"] for r in REPORT["fr_misaligned"]])
    print(f"renvois divergents entre textes : {len(REPORT['ref_mismatch'])}")
    for w_ in REPORT["warnings"]:
        print("  attention :", w_)
    return 0


if __name__ == "__main__":
    sys.exit(main())
