#!/usr/bin/env python3
"""Prototype « Sabor » : produit tout ce que le prototype charge, depuis portail/.

Lit   portail/data/{etats,stats,peuples,entites-autonomes,flagnotes,state_flags,i18n,textes,
      opstine,geo,constitution*}.json, portail/fonts/, portail/index.html (emblème de l'en-tête).
Écrit proto/sabor/{data,flags,fonts}/…, emblem.png, strings-new.json.

Rien n'est inventé : les sièges (art. 103), les registres (docs/canon/equilibre.md) et les
décomptes de majorités minimales sont calculés ici, en entiers exacts, depuis stats.json.
Usage : python proto/sabor/build.py
"""
import base64, json, math, re, shutil, struct, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = ROOT / 'portail'
D = SRC / 'data'


def load(name):
    return json.loads((D / name).read_text(encoding='utf-8'))


def dump(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    return path.stat().st_size


# ---------------------------------------------------------------- sièges du Kongres (art. 103)
def kongres_seats(rows, total=250):
    """Sainte-Laguë en diviseur commun (arrondi standard), 2 à 20 sièges par État, au moins 1
    pour Brčko et Mostar : même méthode que portail/index.html (kongresSeats)."""
    def seats(div):
        return [min(20, max(1 if t == 'M' else 2, math.floor(p / div + 0.5))) for _, t, p in rows]
    lo, hi = 1.0, 1e7
    for _ in range(400):
        div = (lo + hi) / 2
        s = seats(div)
        n = sum(s)
        if n > total:
            lo = div
        elif n < total:
            hi = div
        else:
            return s, div
    raise SystemExit('Sainte-Laguë : pas de diviseur pour %d sièges' % total)


# ------------------------------------------------- majorités minimales du Kongres (décompte exact)
def minimal_majorities(weights, quota):
    """Pour un jeu de vote pondéré [quota ; poids], renvoie (total, par joueur) :
    le nombre exact de coalitions gagnantes minimales (toute défection la fait perdre) et,
    pour chaque joueur, le nombre de celles auxquelles il appartient. Polynômes générateurs,
    entiers exacts. Dans une coalition minimale, chaque membre est décisif par définition."""
    order = sorted(range(len(weights)), key=lambda i: (-weights[i], i))
    w = [weights[i] for i in order]
    n = len(w)
    member = [0] * n
    total = 0
    poly = [0] * quota          # produit des (1 + x^w_k) pour k < j, tronqué au degré quota-1
    poly[0] = 1
    for j in range(n):
        lo = max(0, quota - w[j])
        # j est le plus petit membre : les autres sont pris parmi k < j, somme dans [quota-w_j, quota-1]
        cnt = sum(poly[lo:quota])
        total += cnt
        member[j] += cnt
        for i in range(j):
            # sous-ensembles contenant i : diviser par (1 + x^w_i), puis décaler de w_i
            q = [0] * quota
            wi = w[i]
            for s in range(quota):
                q[s] = poly[s] - (q[s - wi] if s >= wi else 0)
            a, b = lo - wi, quota - wi
            if b > 0:
                member[i] += sum(q[max(0, a):b])
        for s in range(quota - 1, w[j] - 1, -1):
            poly[s] += poly[s - w[j]]
    out = [0] * n
    for pos, i in enumerate(order):
        out[i] = member[pos]
    return total, out


def swings(weights, quota):
    """Nombre exact, pour chaque joueur, des alignements des AUTRES joueurs (sur 2^(n-1)) où ses
    voix font basculer le résultat (décompte de Banzhaf)."""
    poly = [0] * quota
    poly[0] = 1
    for w in weights:
        for s in range(quota - 1, w - 1, -1):
            poly[s] += poly[s - w]
    out = []
    for w in weights:
        q = [0] * quota
        for s in range(quota):
            q[s] = poly[s] - (q[s - w] if s >= w else 0)
        out.append(sum(q[max(0, quota - w):quota]))
    return out


def haversine(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


def decode_ring(r, q):
    x, y = r[0], r[1]
    out = [(x / q, y / q)]
    for i in range(2, len(r), 2):
        x += r[i]
        y += r[i + 1]
        out.append((x / q, y / q))
    return out


def simplify(pts, tol):
    """Douglas-Peucker (itératif)."""
    if len(pts) < 5:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1
        n = math.hypot(dx, dy) or 1e-12
        best, bi = 0, -1
        for i in range(a + 1, b):
            d = abs((pts[i][0] - x1) * dy - (pts[i][1] - y1) * dx) / n
            if d > best:
                best, bi = d, i
        if best > tol and bi > 0:
            keep[bi] = True
            stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


def ring_area_centroid(pts):
    a = cx = cy = 0.0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        f = x1 * y2 - x2 * y1
        a += f
        cx += (x1 + x2) * f
        cy += (y1 + y2) * f
    a /= 2
    return (abs(a), cx / (6 * a), cy / (6 * a)) if a else (0, pts[0][0], pts[0][1])


def build_map(geo):
    """Contours réels des 54 entités (geo.json, lon/lat) projetés dans un cadre de 1000 de large
    (équirectangulaire à la latitude moyenne), simplifiés, avec le centroïde de chacune."""
    q = geo['q']
    ent = {e['c']: [[decode_ring(r, q) for r in poly] for poly in e['g']] for e in geo['states'] + geo['fed']}
    lons = [x for g in ent.values() for poly in g for r in poly for x, _ in r]
    lats = [y for g in ent.values() for poly in g for r in poly for _, y in r]
    lo0, lo1, la0, la1 = min(lons), max(lons), min(lats), max(lats)
    k = math.cos(math.radians((la0 + la1) / 2))
    sc = 1000 / ((lo1 - lo0) * k)
    proj = lambda p: ((p[0] - lo0) * k * sc, (la1 - p[1]) * sc)
    paths, cents = {}, {}
    for code, g in ent.items():
        d, A, CX, CY = '', 0, 0, 0
        for poly in g:
            for i, ring in enumerate(poly):
                pts = [proj(p) for p in ring]
                if i == 0:
                    a, cx, cy = ring_area_centroid(pts)
                    A += a
                    CX += cx * a
                    CY += cy * a
                    if a < 4 and len(g) > 1:
                        continue                      # îlots sous 1,5 unité² : hors du tracé
                elif ring_area_centroid(pts)[0] < 1.5:
                    continue
                pts = simplify(pts, 0.75)
                if len(pts) < 4:
                    continue
                px, py = round(pts[0][0], 1), round(pts[0][1], 1)
                d += 'M%g %g' % (px, py)
                seg = ''
                for x, y in pts[1:-1]:
                    x, y = round(x, 1), round(y, 1)
                    seg += '%g %g ' % (round(x - px, 1), round(y - py, 1))
                    px, py = x, y
                d += 'l' + seg.strip() + 'z'
        paths[code] = d
        cents[code] = [round(CX / A, 1), round(CY / A, 1)]
    return {'w': 1000, 'h': round((la1 - la0) * sc, 1), 'p': paths, 'c': cents}


def plain(x):
    return re.sub(r'\*+', '', x)


def quotes(doc):
    """Termes et alinéas repris tels quels du texte constitutionnel (clé → [article, texte])."""
    A = {a['id']: a for t in doc['titles'] for ch in t['chapters'] for a in ch['articles']}
    b = lambda i, n: A[i]['body'][n]
    term = lambda x: re.match(r'\*\*\w\. (.+?)\.\*\*', x).group(1)
    rest = lambda x: re.sub(r'^\*\*.+?\*\*\s*', '', x)
    item = lambda i, n, k: next(v for key, v in b(i, n)['items'] if key == k)
    q = {
        'consent': ['109 a', term(b('art-109', 1)['x'])],
        'alarm': ['109 b', term(b('art-109', 4)['x'])],
        '109b': ['109 b', rest(b('art-109', 4)['x'])],
        '106': ['106', b('art-106', 2)['x'] + ' ' + b('art-106', 3)['x']],
        '106bis': ['106 bis', b('art-106bis', 0)['x'] + ' ' + item('art-106bis', 1, 'd')],
        '106bis2': ['106 bis', b('art-106bis', 2)['x']],
        '110': ['110', b('art-110', 4)['x']],
        '111c': ['111', b('art-111', 2)['x']],
        '111': ['111', b('art-111', 3)['x']],
        '121': ['121', b('art-121', 1)['x']],
        '122': ['122', b('art-122', 0)['x']],
        '122e': ['122', b('art-122', 4)['x']],
        '123bis': ['123 bis', b('art-123bis', 0)['x']],
        '124m': ['124', b('art-124', 2)['x']],
        '132b': ['132 b', item('art-132', 1, 'b')],
        '132c': ['132 c', item('art-132', 1, 'c')],
        '150': ['150', b('art-150', 0)['x']],
    }
    for i in ('art-123bis', 'art-150', 'art-124', 'art-132', 'art-110ter', 'art-111'):
        q['n-' + i] = [A[i]['num'].replace('Article ', ''), A[i]['name']]
    return {k: [v[0], plain(v[1])] for k, v in q.items()}


def main():
    etats, stats, peuples = load('etats.json'), load('stats.json'), load('peuples.json')
    i18n, textes = load('i18n.json'), load('textes.json')['t']
    flags, notes, aut = load('state_flags.json'), load('flagnotes.json'), load('entites-autonomes.json')
    geo = load('geo.json')

    # ---- drapeaux : un fichier PNG par entité, dimensions réelles lues dans l'en-tête
    fdir = HERE / 'flags'
    fdir.mkdir(exist_ok=True)
    fdim = {}
    for code, uri in flags.items():
        raw = base64.b64decode(uri.split(',', 1)[1])
        assert raw[:8] == b'\x89PNG\r\n\x1a\n', code
        fdim[code] = struct.unpack('>II', raw[16:24])
        (fdir / f'{code}.png').write_bytes(raw)

    # ---- emblème de l'en-tête : l'asset du portail, tel quel (COA_DATA de portail/index.html)
    html = (SRC / 'index.html').read_text(encoding='utf-8')
    m = re.search(r'const COA_DATA="data:image/png;base64,([^"]+)"', html)
    if m:
        (HERE / 'emblem.png').write_bytes(base64.b64decode(m.group(1)))

    # ---- polices : sous-ensemble latin + latin étendu + cyrillique (ѣ compris) + ponctuation et
    #      signes, axes variables et fonctions OpenType conservés ; copie telle quelle si
    #      fontTools (ou brotli) n'est pas installé
    (HERE / 'fonts').mkdir(exist_ok=True)
    keep = ('U+0020-007E,U+00A0-017F,U+0218-021B,U+02C6-02DD,U+0300-036F,U+0400-045F,U+0462-0463,U+0490-0491,'
            'U+2010-2027,U+2030-203A,U+2044,U+20AC,U+2116,U+2190-2193,U+2212,U+2260-2265,U+00D7,U+FB00-FB04')
    for f in sorted((SRC / 'fonts').iterdir()):
        out = HERE / 'fonts' / f.name
        done = False
        if f.suffix == '.woff2':
            try:
                from fontTools import subset
                opt = subset.Options()
                opt.flavor = 'woff2'
                opt.layout_features = ['*']
                opt.unicodes = subset.parse_unicodes(keep)
                font = subset.load_font(str(f), opt)
                sub = subset.Subsetter(opt)
                sub.populate(unicodes=opt.unicodes)
                sub.subset(font)
                subset.save_font(font, str(out), opt)
                done = True
            except Exception as err:      # pas de fontTools : la police entière
                print('  police non réduite (%s) : %s' % (f.name, err))
        if not done:
            shutil.copy2(f, out)
        print('  fonts/%-36s %6.1f ko (source %.1f ko)' % (f.name, out.stat().st_size / 1024, f.stat().st_size / 1024))

    # ---- États, sièges, majorités minimales
    rows = [(e['c'], e['t'], stats[e['c']]['population']) for e in etats]
    seats, divisor = kongres_seats(rows)
    quota = 250 // 2 + 1
    mm_total, mm = minimal_majorities(seats, quota)
    sw = swings(seats, quota)
    pts = geo.get('pts', {})
    cities = [e['c'] for e in etats if e['t'] == 'F']
    states = []
    for e, s, k, z in zip(etats, seats, mm, sw):
        st = stats[e['c']]
        rec = {'c': e['c'], 'k': e['k'], 'n': e['n'], 't': e['t'],
               'p': e['p'] if e['t'] == 'T' else None, 'ch': e['ch'],
               'pop': st['population'], 'area': st['area'], 'mun': st['municipalities'],
               'gdp': st['gdp'], 'eu': st['gdp_eu'], 'src': st['source'], 'gsrc': st['gdp_source'],
               's': s, 'mm': str(k), 'mmS': round(100 * k / mm_total, 2),
               'sw': round(100 * z / 2 ** (len(etats) - 1), 2), 'fw': fdim[e['c']][0], 'fh': fdim[e['c']][1]}
        if e['t'] == 'M':   # art. 124 : vote avec le territoire confédéral le plus proche
            rec['with'] = min(cities, key=lambda c: haversine(pts[e['c']], pts[c]))
            rec['km'] = {c: round(haversine(pts[e['c']], pts[c])) for c in cities}
        states.append(rec)
    assert len(states) == 54 and sum(seats) == 250

    # ---- dictionnaire des chaînes : l'anglais sert de clé (i18n.json puis textes.json)
    dic = {}
    for v in i18n['t'].values():
        if isinstance(v, dict) and v.get('en'):
            dic[v['en']] = {k: v[k] for k in ('zap', 'sre', 'ist') if k in v}
    for k, v in textes.items():
        dic[k] = v
    used, new = {}, []
    pat = re.compile(r"""\b[THN]\(\s*'((?:[^'\\]|\\.)*)'""")
    for js in sorted((HERE / 'js').glob('*.js')):
        src = js.read_text(encoding='utf-8')
        found = [m_.group(1) for m_ in pat.finditer(src)]
        for raw in found:
            key = re.sub(r'\s+', ' ', raw.replace("\\'", "'")).strip()
            if key in dic:
                used[key] = dic[key]
            elif key not in new:
                new.append(key)
    # chaînes tenues dans les données (peuples, fonctions des capitales, sources, notes de drapeaux)
    data_keys = set(p['en'] for p in peuples.values())
    data_keys |= {s['ch'] for s in states if s['t'] != 'T'} | {s['src'] for s in states} | {s['gsrc'] for s in states}
    data_keys |= {'State of the ' + p['en'] for p in peuples.values()}
    data_keys |= {'Register of the ' + p['en'] for p in peuples.values()}
    data_keys |= {p['en'] + ' state · seat {0}' for p in peuples.values()}
    data_keys |= {a['com'] + ' community' for a in aut}
    for k in sorted(data_keys):
        if k in dic:
            used[k] = dic[k]
    note_tr = {k: dic[v] for k, v in notes.items() if v in dic}

    # ---- textes constitutionnels : quatre langues, découpés par titre ; index des articles ;
    #      corps des articles pour la recherche ; termes et alinéas cités par l'instrument
    sizes = {}
    index, qt = {}, {}
    for lg, name in (('en', 'constitution.json'), ('zap', 'constitution.zap.json'),
                     ('sre', 'constitution.sre.json'), ('ist', 'constitution.ist.json')):
        doc = load(name)
        qt[lg] = quotes(doc)
        head = {k: doc[k] for k in ('version', 'date', 'iso', 'preamble')}
        head['titles'] = [{'id': t['id'], 'num': t['num'], 'name': t['name'],
                           'arts': [[a['id'], a['num'], a['name']] for ch in t['chapters'] for a in ch['articles']]}
                          for t in doc['titles']]
        tot = dump(HERE / f'data/const/{lg}/index.json', head)
        body = {}
        for t in doc['titles']:
            tot += dump(HERE / f'data/const/{lg}/{t["id"]}.json', t)
            for ch in t['chapters']:
                for a in ch['articles']:
                    index.setdefault(a['id'], {'t': t['id'], 'num': a['num'].replace('Article ', '')})[lg] = a['name']
                    parts = []
                    for blk in a['body']:
                        parts += [blk['x']] if 'x' in blk else [i if isinstance(i, str) else str(i[1]) for i in blk['items']]
                    body[a['id']] = plain(' '.join(parts))
        sizes[f'data/const/{lg}/ (12 fichiers)'] = tot
        sizes[f'data/body.{lg}.json'] = dump(HERE / f'data/body.{lg}.json', body)
    sizes['data/articles.json'] = dump(HERE / 'data/articles.json',
                                       [dict(id=k, **v) for k, v in index.items()])

    # ---- carte : contours réels et centroïdes (geo.json)
    mp = build_map(geo)
    assert len(mp['p']) == 54, len(mp['p'])
    sizes['data/map.json'] = dump(HERE / 'data/map.json', mp)

    sizes['data/core.json'] = dump(HERE / 'data/core.json', {
        'v': load('constitution.json')['version'],
        'langs': i18n['langs'], 'states': states, 'peoples': peuples,
        'order': ['slo', 'hrv', 'srb', 'bos', 'cng', 'mkd', 'bul'],   # ordre de l'art. 110
        'divisor': divisor, 'quota': quota, 'mmTotal': str(mm_total),
        'aut': [{'id': a['id'], 'n': a['n'], 'com': a['com'], 'host': a.get('host')} for a in aut],
        'mapR': round(mp['h'] / mp['w'], 4),
        'q': {k: v[1] for k, v in qt['en'].items()}, 'new': new})
    # feuille de style servie : commentaires et blancs retirés
    css = (HERE / 'css/sabor.css').read_text(encoding='utf-8')
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', '', css)
    css = re.sub(r'\s*([{};,])\s*', r'\1', css).replace(';}', '}')
    (HERE / 'css/sabor.min.css').write_text(css, encoding='utf-8')
    sizes['css/sabor.min.css'] = len(css.encode())
    # modules servis (m/) : commentaires de bloc et retraits retirés, rien d'autre
    (HERE / 'm').mkdir(exist_ok=True)
    tot = 0
    for js in sorted((HERE / 'js').glob('*.js')):
        src = re.sub(r'(?m)^[ \t]*/\*.*?\*/[ \t]*\n', '', js.read_text(encoding='utf-8'), flags=re.S)
        src = re.sub(r'[ \t]+/\*[^\n]*?\*/', '', src)
        src = re.sub(r'[ \t]+//[^\n\'"`]*$', '', src, flags=re.M)
        src = re.sub(r'(?m)^[ \t]+', '', src)
        (HERE / 'm' / js.name).write_text(src, encoding='utf-8')
        tot += len(src.encode())
    sizes['m/*.js'] = tot
    for lg in ('zap', 'sre', 'ist'):
        tx = {k: v[lg] for k, v in used.items() if lg in v}
        tx['__q'] = {k: v[1] for k, v in qt[lg].items()}
        sizes[f'data/tx.{lg}.json'] = dump(HERE / f'data/tx.{lg}.json', tx)
    # notes des drapeaux : un fichier par langue (clé = code à deux lettres)
    for lg in ('en', 'zap', 'sre', 'ist'):
        sizes[f'data/notes.{lg}.json'] = dump(HERE / f'data/notes.{lg}.json',
            {k: (v if lg == 'en' else note_tr.get(k, {}).get(lg, v)) for k, v in notes.items()})
    # chaînes nouvelles (anglais seul) ; termes et alinéas repris du texte constitutionnel, article cité
    (HERE / 'strings-new.json').write_text(json.dumps({
        'new': new,
        'from_constitution': [{'key': k, 'article': v[0], 'en': v[1], 'zap': qt['zap'][k][1],
                               'sre': qt['sre'][k][1], 'ist': qt['ist'][k][1]} for k, v in qt['en'].items()],
    }, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')

    # ---- communes (palette) : nom, État, formes officielles
    ops = load('opstine.json')['m']
    sizes['data/opstine.json'] = dump(HERE / 'data/opstine.json',
                                      [[o[0], o[2]] + [x for x in o[3:] if x] for o in ops])

    print('54 entités, %d sièges, diviseur %.0f' % (sum(seats), divisor))
    print('majorités minimales du Kongres (quota %d) : %d' % (quota, mm_total))
    print('chaînes reprises : %d ; nouvelles : %d' % (len(used), len(new)))
    for k, v in sizes.items():
        print('  %-24s %7.1f ko' % (k, v / 1024))


if __name__ == '__main__':
    sys.exit(main())
