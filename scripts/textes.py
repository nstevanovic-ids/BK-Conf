#!/usr/bin/env python3
"""
textes.py — texte des pages du portail dans les trois standards
(ADR docs/decisions/2026-10-26-traduction-pages.md).

Le gabarit garde l'anglais, qui sert de clé : L`…` (littéral étiqueté), L('…') et N('…')
(chaînes des tables de code), plus quelques champs des données JSON (notes de drapeaux,
sources des chiffres…). portail/data/textes.json donne chaque clé en zap, sre et ist.

Commandes :
  python scripts/textes.py extract [--out FICHIER]   catalogue des clés (JSON)
  python scripts/textes.py check                     contrôle complet ; code 1 si erreur
  python scripts/textes.py merge LANG LOT.json [...] intègre des traductions {clé: texte}
                                                     (LANG=ist : texte bulgare en cyrillique,
                                                     converti en latin v3 et vérifié par
                                                     aller-retour)
  python scripts/textes.py bg2lat "текст"            convertit du bulgare en latin v3

Règles de clé : espaces réduits, variables écrites {0}, {1}… dans l'ordre du littéral.
Conversion bulgare → latin v3 : celle des libellés existants (ъ ã, щ št, дж x, я ja,
ю ju, ня ña, ню ñu, ля ļa, лю ļu, ьо jo) ; le portail en dérive le cyrillique oriental
(toCyr), et l'aller-retour doit redonner le bulgare d'origine.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "portail" / "index.html"
DATA = ROOT / "portail" / "data"
TEXTES = DATA / "textes.json"
LANGS = ("zap", "sre", "ist")

# --------------------------------------------------------------------------- lexer JS


class Lexer:
    """Lexer JS minimal : trouve les appels L`…`, L('…') et N('…') en dehors des commentaires,
    des chaînes et des expressions régulières, et lit leurs littéraux."""

    REGEX_PREV = set("(,=:[!&|?{};+-*%<>~^")

    def __init__(self, src):
        self.s = src
        self.found = []  # (kind, key or None, pos, dynamic)

    def run(self):
        self.code(0, top=True)
        return self.found

    # -- helpers
    def skip_string(self, i):
        q = self.s[i]
        i += 1
        out = []
        while self.s[i] != q:
            if self.s[i] == "\\":
                out.append(self.s[i:i + 2])
                i += 2
                continue
            out.append(self.s[i])
            i += 1
        return i + 1, cook("".join(out))

    def template(self, i):
        """s[i] == '`' ; renvoie (fin, parties, nb d'expressions)."""
        i += 1
        parts = [""]
        while True:
            c = self.s[i]
            if c == "\\":
                parts[-1] += cook(self.s[i:i + 2])
                i += 2
                continue
            if c == "`":
                return i + 1, parts
            if c == "$" and self.s[i + 1] == "{":
                i = self.code(i + 2, top=False)
                parts.append("")
                continue
            parts[-1] += c
            i += 1

    def code(self, i, top):
        """Parcourt du code jusqu'à la '}' fermante (top=False) ou la fin du texte."""
        s, n, depth = self.s, len(self.s), 0
        prev = "("  # dernier caractère significatif
        while i < n:
            c = s[i]
            if c in " \t\r\n":
                i += 1
                continue
            if c == "/" and s.startswith("//", i):
                j = s.find("\n", i)
                i = n if j < 0 else j
                continue
            if c == "/" and s.startswith("/*", i):
                j = s.find("*/", i + 2)
                i = n if j < 0 else j + 2
                continue
            if c == "/" and (prev in self.REGEX_PREV or re.search(r"(?:return|typeof|case)\s*$", s[max(0, i - 8):i])):
                i = self.skip_regex(i)
                prev = "a"
                continue
            if c in "'\"":
                i, _ = self.skip_string(i)
                prev = "a"
                continue
            if c == "`":
                i, _ = self.template(i)
                prev = "a"
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                if depth == 0 and not top:
                    return i + 1
                depth -= 1
            if (c in "LN") and (i == 0 or not (s[i - 1].isalnum() or s[i - 1] in "_$.")) and i + 1 < n:
                nx = s[i + 1]
                if c == "L" and nx == "`":
                    j, parts = self.template(i + 1)
                    key = lkey("".join(p if k == 0 else "{%d}%s" % (k - 1, p) for k, p in enumerate(parts)))
                    self.found.append(("L`", key, i, False))
                    i = j
                    prev = "a"
                    continue
                if nx == "(":
                    j = i + 2
                    while s[j] in " \t\r\n":
                        j += 1
                    if s[j] in "'\"":
                        k, val = self.skip_string(j)
                        m = k
                        while s[m] in " \t\r\n":
                            m += 1
                        if s[m] in ",)":
                            self.found.append((c + "()", lkey(val), i, False))
                        else:
                            self.found.append((c + "()", None, i, True))
                        # on laisse la boucle relire l'appel normalement (la chaîne sera sautée)
                    elif s[j] == "`" and c == "N":
                        k, parts = self.template(j)
                        self.found.append(("N()", lkey("".join(parts)) if len(parts) == 1 else None, i, len(parts) > 1))
                    else:
                        self.found.append((c + "()", None, i, True))
            prev = c
            i += 1
        return i

    def skip_regex(self, i):
        s = self.s
        i += 1
        cls = False
        while True:
            c = s[i]
            if c == "\\":
                i += 2
                continue
            if c == "[":
                cls = True
            elif c == "]":
                cls = False
            elif c == "/" and not cls:
                i += 1
                while i < len(s) and s[i].isalpha():
                    i += 1
                return i
            elif c == "\n":
                return i
            i += 1


def cook(raw):
    """Valeur cuite d'une séquence de littéral JS."""
    out, i = [], 0
    simple = {"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "v": "\v", "0": "\0"}
    while i < len(raw):
        c = raw[i]
        if c != "\\":
            out.append(c)
            i += 1
            continue
        d = raw[i + 1] if i + 1 < len(raw) else ""
        if d in simple:
            out.append(simple[d])
            i += 2
        elif d == "u" and raw[i + 2:i + 3] == "{":
            j = raw.index("}", i)
            out.append(chr(int(raw[i + 3:j], 16)))
            i = j + 1
        elif d == "u":
            out.append(chr(int(raw[i + 2:i + 6], 16)))
            i += 6
        elif d == "x":
            out.append(chr(int(raw[i + 2:i + 4], 16)))
            i += 4
        elif d == "\n":
            i += 2
        else:
            out.append(d)
            i += 2
    return "".join(out)


def lkey(s):
    return re.sub(r"\s+", " ", s).strip()


def script_of(html):
    """Le grand script du gabarit (après les scripts vendor)."""
    starts = [m.end() for m in re.finditer(r"<script>", html)]
    best = max(starts, key=lambda st: html.find("</script>", st) - st)
    return best, html[best:html.find("</script>", best)]


def func_at(src, pos):
    m = None
    for m in re.finditer(r"^(?:async\s+)?function\s+([A-Za-z0-9_$]+)|^const\s+([A-Z_][A-Z0-9_]*)\s*=", src[:pos], re.M):
        pass
    return (m.group(1) or m.group(2)) if m else "?"


JSON_SOURCES = [
    ("flagnotes.json", lambda d: list(d.values())),
    ("stats.json", lambda d: [v[k] for v in d.values() for k in ("source", "gdp_source") if v.get(k)]),
    ("peuples.json", lambda d: [v["en"] for v in d.values()]),
    ("entites-autonomes.json", lambda d: sorted({a["com"] for a in d})),
]


def extract():
    html = TEMPLATE.read_text(encoding="utf-8")
    off, src = script_of(html)
    cat, dyn = {}, []
    for kind, key, pos, dynamic in Lexer(src).run():
        line = html.count("\n", 0, off + pos) + 1
        if dynamic or key is None:
            if kind != "L()":
                dyn.append((kind, line))
            continue
        if not re.search(r"[A-Za-z]", key):
            continue
        e = cat.setdefault(key, {"ctx": []})
        tag = f"{func_at(src, pos)}:{line}"
        if tag not in e["ctx"]:
            e["ctx"].append(tag)
    for fname, get in JSON_SOURCES:
        d = json.loads((DATA / fname).read_text(encoding="utf-8"))
        for v in get(d):
            k = lkey(v)
            if re.search(r"[A-Za-z]", k):
                cat.setdefault(k, {"ctx": []})["ctx"].append(fname)
    return cat, dyn


# ---------------------------------------------------------------- bulgare <-> latin v3

BG = {"а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ж": "ž", "з": "z", "и": "i",
      "й": "j", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s",
      "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "č", "ш": "š", "щ": "št", "ъ": "ã",
      "ю": "ju", "я": "ja", "ѝ": "i", "ћ": "ć", "ђ": "đ", "ѣ": "ě", "ј": "j", "њ": "ñ", "љ": "ļ",
      "џ": "x"}


def bg_word(w):
    lo = w.lower()
    out, i = [], 0
    while i < len(lo):
        c, nx = lo[i], lo[i + 1:i + 2]
        if c == "д" and nx == "ж":
            out.append("x"); i += 2; continue
        if c in "лн" and nx in ("я", "ю"):
            out.append(("ļ" if c == "л" else "ñ") + ("a" if nx == "я" else "u")); i += 2; continue
        if c in "лн" and nx == "ь" and lo[i + 2:i + 3] == "о":
            out.append(("ļ" if c == "л" else "ñ") + "o"); i += 3; continue
        if c == "ь":
            out.append("j"); i += 1; continue
        out.append(BG.get(c, c)); i += 1
    o = "".join(out)
    if len(w) > 1 and w.isupper():
        return o.upper()
    if w[:1].isupper():
        return o[:1].upper() + o[1:]
    return o


def bg2lat(s):
    return re.sub(r"[Ѐ-ӿ]+", lambda m: bg_word(m.group(0)), s)


# Portage Python de toCyr (portail/index.html), pour l'aller-retour.
CYR_SRE = dict(zip("abcčćdđeěfghijklļmnñoprsštuvxzžã", "абцчћдђееф" "гхијклљмнњ" "опрсштувџзжъ"))
CYR_IST = {**CYR_SRE, "x": "дж", "j": "й", "ļ": "ль", "ñ": "нь"}
CYR_V = "aeiouãě"
_FOREIGN = "qwyäëöüéèêàâçşğıőűôõåøæßáíóúý"
# pas de re.I : en Python, ı s'apparie alors à i (le portail, en JS, n'a pas ce travers)
LAT_FOREIGN = re.compile("[" + _FOREIGN + "".join(c.upper() for c in _FOREIGN if len(c.upper()) == 1 and c.upper() != "I") + "]")


def cyr_word(w, std):
    if re.search(r"\d", w):
        return w
    lo = w.lower().replace("lj", "ļ").replace("nj", "ñ").replace("dž", "x")
    out = []
    if std == "ist":
        i = 0
        while i < len(lo):
            c, n, p = lo[i], lo[i + 1:i + 2], lo[i - 1:i] if i else ""
            if c == "š" and n == "t":
                out.append("щ"); i += 2; continue
            if c in "jļñ":
                base = "л" if c == "ļ" else "н" if c == "ñ" else ""
                if n == "a":
                    out.append(base + "я"); i += 2; continue
                if n == "u":
                    out.append(base + "ю"); i += 2; continue
                if n == "o":
                    out.append(base + "ьо" if base else ("ьо" if p and p not in CYR_V else "йо")); i += 2; continue
                out.append(base + "ь" if base else "й"); i += 1; continue
            out.append(CYR_IST.get(c, c)); i += 1
    else:
        out = [CYR_SRE.get(c, c) for c in lo]
    o = "".join(out)
    if len(w) > 1 and w == w.upper() and w != w.lower():
        return o.upper()
    return o[:1].upper() + o[1:] if w[:1] != w[:1].lower() else o


ROMAN = re.compile(r"(?:XL|L?X{0,3})(?:IX|IV|V?I{0,3})")


def keep_latin(tok, before):
    if LAT_FOREIGN.search(tok):
        return True
    return bool(tok) and ROMAN.fullmatch(tok) and (len(tok) > 1 or re.search(r"[^\W_]\s+$", before))


def to_cyr(s, std, keep=()):
    def plain(t):
        return re.sub(r"[^\W_]+(?:['’-][^\W_]+)*",
                      lambda m: m.group(0) if keep_latin(m.group(0), t[:m.start()]) else
                      re.sub(r"[^\W_]+", lambda w: cyr_word(w.group(0), std), m.group(0)), t)
    if keep:
        pat = re.compile("|".join(re.escape(k) for k in sorted(keep, key=len, reverse=True)))
        out, i = [], 0
        for m in pat.finditer(s):
            out.append(plain(s[i:m.start()])); out.append(m.group(0)); i = m.end()
        out.append(plain(s[i:]))
        return "".join(out)
    return plain(s)


# --------------------------------------------------------------------------- contrôles

TAG = re.compile(r"</?[a-zA-Z][^>]*>")
PH = re.compile(r"\{(\d+)(?:#[^}]*)?\}")
CYRIL = re.compile(r"[Ѐ-ӿ]")
# séquences lj / nj / dž légitimes (deux sons) : préfixe + mot, emprunts
V3_OK = re.compile(r"(?i)\b(?:in[jž]ek|konjunk|nad[žž]i|pod[žž]|od[žž]|nadž|injic)")


def load_textes():
    return json.loads(TEXTES.read_text(encoding="utf-8"))


def save_textes(d):
    t = d["t"]
    d["t"] = {k: t[k] for k in sorted(t, key=lambda x: x.lower())}
    TEXTES.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def check_one(key, lang, tr):
    errs, warns = [], []
    if PH.findall(key) and sorted(set(PH.findall(key))) != sorted(set(PH.findall(tr))):
        errs.append(f"variables {sorted(set(PH.findall(key)))} ≠ {sorted(set(PH.findall(tr)))}")
    elif not PH.findall(key) and PH.findall(tr):
        errs.append("variable en trop")
    if sorted(TAG.findall(key)) != sorted(TAG.findall(tr)):
        errs.append("balises différentes")
    for ch in '"<>':
        if tr.count(ch) > key.count(ch) and not (ch in "<>" and TAG.search(tr)):
            errs.append(f"caractère {ch} ajouté")
    if CYRIL.search(tr):
        errs.append("cyrillique dans le latin")
    plain = TAG.sub(" ", tr)
    if lang in ("zap", "sre"):
        for m in re.finditer(r"(?i)\b\w*(?:lj|nj|dž)\w*", plain):
            if not V3_OK.search(m.group(0)):
                warns.append(f"v3 ? {m.group(0)}")
    if re.search(r"(?i)[ñļ]j", plain):
        errs.append("ñj / ļj (la lettre v3 remplace déjà nj, lj)")
    if lang in ("zap", "ist") and "ě" in plain.lower():
        errs.append("yat hors du središñi")
    if lang == "ist" and re.search(r"(?i)[ćđ]", plain):
        warns.append("ć/đ à l'istočni (nom propre ?)")
    return errs, warns


def cmd_check():
    cat, dyn = extract()
    d = load_textes()
    t = d["t"]
    nerr = 0
    missing = {lg: [k for k in cat if not (t.get(k) or {}).get(lg)] for lg in LANGS}
    for lg in LANGS:
        if missing[lg]:
            nerr += len(missing[lg])
            print(f"[{lg}] {len(missing[lg])} clé(s) sans traduction, ex. : {missing[lg][:3]}")
    allw = 0
    for k, e in t.items():
        for lg in LANGS:
            if lg in e:
                errs, warns = check_one(k, lg, e[lg])
                for x in errs:
                    nerr += 1
                    print(f"ERREUR [{lg}] {k[:70]!r} : {x}")
                allw += len(warns)
    obsolete = [k for k in t if k not in cat and not t[k].get("_keep")]
    print(f"{len(cat)} clés au catalogue · {len(t)} dans textes.json · {len(obsolete)} hors catalogue"
          f" · {len(dyn)} appel(s) dynamique(s) N/L non lus · {allw} avertissement(s) v3")
    if obsolete:
        print("Hors catalogue (anglais modifié ou supprimé ?) :", [k[:60] for k in obsolete[:8]])
    return 1 if nerr else 0


def cmd_extract(out=None):
    cat, dyn = extract()
    js = json.dumps(cat, ensure_ascii=False, indent=1)
    if out:
        Path(out).write_text(js, encoding="utf-8")
        print(f"{len(cat)} clés → {out}")
    else:
        print(js)
    for kind, line in dyn:
        print(f"appel dynamique {kind} ligne {line}", file=sys.stderr)


def cmd_merge(lang, files):
    assert lang in LANGS
    d = load_textes()
    t = d["t"]
    cat, _ = extract()
    names = keep_names()
    bad = 0
    for f in files:
        batch = json.loads(Path(f).read_text(encoding="utf-8"))
        for k, v in batch.items():
            k = lkey(k)
            if k not in cat:
                print(f"hors catalogue, ignoré : {k[:70]!r}")
                continue
            v = unicodedata.normalize("NFC", v.strip())
            if lang == "ist":
                lat = bg2lat(v)
                back = to_cyr(lat, "ist", names)
                ref = to_cyr(v.replace("ѝ", "и"), "ist", names)
                if back != ref:
                    bad += 1
                    print(f"aller-retour ≠ : {v[:60]!r} → {lat[:60]!r} → {back[:60]!r}")
                v = lat
            t.setdefault(k, {})[lang] = v
    save_textes(d)
    print(f"{lang} : fusion faite ({bad} écart(s) d'aller-retour)")


def keep_names():
    aut = json.loads((DATA / "entites-autonomes.json").read_text(encoding="utf-8"))
    return [a["n"] for a in aut if LAT_FOREIGN.search(a["n"])]


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return 0
    if a[0] == "extract":
        cmd_extract(a[2] if len(a) > 2 and a[1] == "--out" else None)
        return 0
    if a[0] == "check":
        return cmd_check()
    if a[0] == "merge":
        cmd_merge(a[1], a[2:])
        return 0
    if a[0] == "bg2lat":
        print(bg2lat(" ".join(a[1:])))
        return 0
    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(main())
