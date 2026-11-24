/* Film explicatif « The Confederation in five minutes » : composition SVG 1280 × 720.
   Tout est fonction du temps : FILM.seek(t) dessine l'image de l'instant t (secondes), sans horloge ni
   hasard, si bien que le rendu image par image (film/render.js) et la lecture en direct donnent la même chose.
   Une scène = { id, dur, bg, build(g) } ; build pose ses éléments une fois et rend update(lt), lt = temps local.
   Couleurs du canon (docs/canon/couleurs-symboles.md) ; aucune couleur par peuple. */
(function () {
  'use strict';
  var W = 1280, H = 720, NS = 'http://www.w3.org/2000/svg';
  var Q = new URLSearchParams(location.search);
  var LANG = Q.get('lang') || 'en', RENDER = Q.has('render');
  var X = (window.TXT || {})[LANG] || TXT.en;
  var C = {
    gules: '#99402F', azure: '#374078', gold: '#DFCC68', goldInk: '#9E7A16', silver: '#FFFFFF',
    ink: '#1b2030', ink2: '#545b6c', ink3: '#878d9b', paper: '#FFFFFF', paper2: '#E9EBF0',
    night: '#1a2040', land: '#D9DEEC', land2: '#BCC5DE', azureHi: '#4A56A0'
  };
  var FD = "'Sofia Sans Extra Condensed','Arimo',sans-serif", FB = "'Arimo',sans-serif";
  var LION = '../../images-sources/symboles/BK-CoA.png';

  /* ---------------------------------------------------------------- outils */
  function clamp(x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return x < a ? a : x > b ? b : x; }
  function P(t, a, d) { return clamp((t - a) / d); }
  var E = {
    lin: function (t) { return t; },
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    inn: function (t) { return t * t * t; },
    io: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    back: function (t) { var c = 1.5; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  };
  function lerp(a, b, t) { return a + (b - a) * t; }
  function fmt(n) { return Number(n).toLocaleString(LANG === 'en' ? 'en-US' : 'de-DE'); }
  function rgb(h) {
    if (h.charAt(0) !== '#') return h.match(/[\d.]+/g).slice(0, 3).map(Number);
    if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b);
    return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(lerp(x[i], y[i], t)); }).join(',') + ')'; }
  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function set(e, attrs) { for (var k in attrs) e.setAttribute(k, attrs[k]); }
  /* bloc de texte : une ligne par tspan */
  function txt(parent, lines, x, y, o) {
    o = o || {};
    var size = o.size || 24, lh = o.lh || size * 1.22;
    var t = el('text', { x: x, y: y, 'font-family': o.font || FB, 'font-size': size, 'font-weight': o.weight || 400,
      fill: o.fill || C.ink, 'text-anchor': o.anchor || 'start', 'letter-spacing': o.ls || 0 }, parent);
    if (o.italic) t.setAttribute('font-style', 'italic');
    (Array.isArray(lines) ? lines : [lines]).forEach(function (l, i) {
      var ln = el('tspan', { x: x, dy: i ? lh : 0 }, t);
      String(l).split('*').forEach(function (seg, k) {
        if (!seg) return;
        if (k % 2) el('tspan', { fill: o.hi || (o.dark ? C.gold : C.goldInk) }, ln, seg); else ln.appendChild(document.createTextNode(seg));
      });
    });
    return t;
  }
  /* entrées et sorties ordinaires : fondu et glissement, chaque élément dans son groupe */
  function TL() {
    var items = [];
    return {
      add: function (node, a, b, o) { items.push({ node: node, a: a, b: b, o: o || {} }); return node; },
      g: function (parent, a, b, o) { return this.add(el('g', {}, parent), a, b, o); },
      run: function (lt) {
        items.forEach(function (it) {
          var o = it.o, pin = E.out(P(lt, it.a, o.fi || .7)), pout = it.b == null ? 0 : E.io(P(lt, it.b, o.fo || .45));
          var op = Math.min(pin, 1 - pout);
          var dy = (o.dy == null ? 18 : o.dy) * (1 - pin) - (o.ody == null ? 8 : o.ody) * pout, dx = (o.dx || 0) * (1 - pin);
          it.node.setAttribute('opacity', op.toFixed(3));
          it.node.setAttribute('transform', 'translate(' + dx.toFixed(2) + ',' + dy.toFixed(2) + ')');
          it.node.style.display = op <= .001 ? 'none' : '';
        });
      }
    };
  }
  /* liseré du fond sous un texte posé sur la carte */
  function halo(t, col) { set(t, { stroke: col || C.paper, 'stroke-width': 5, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }); return t; }
  function chapter(parent, tl, n, label, dark) {
    var g = tl.g(parent, .35, null, { dy: 0, dx: -14 });
    el('rect', { x: 56, y: 40, width: 4, height: 26, fill: C.gules }, g);
    txt(g, String(n).padStart(2, '0'), 70, 62, { font: FD, size: 26, weight: 800, fill: dark ? C.gold : C.goldInk });
    txt(g, label.toUpperCase(), 100, 60, { font: FB, size: 13, weight: 700, ls: 2.4, fill: dark ? 'rgba(255,255,255,.78)' : C.ink2 });
    return g;
  }

  /* ---------------------------------------------------------------- données */
  var D = {};
  function load() {
    var get = function (u) { return fetch(u).then(function (r) { return r.json(); }); };
    return Promise.all([get('../../portail/data/constitution/map.json'), get('../../portail/data/etats.json'),
      get('../../portail/data/peuples.json'), get('../../portail/data/stats.json'),
      get('../../portail/data/entites-autonomes.json'), get('../../portail/data/alfabet.json')]).then(function (r) {
      D.map = r[0]; D.etats = r[1]; D.peuples = r[2]; D.stats = r[3]; D.ent = r[4]; D.abc = r[5];
      D.by = {}; D.etats.forEach(function (s) { D.by[s.c] = s; });
      D.order = Object.keys(D.peuples);
      if (window.REGLES) D.R = REGLES.contexte(D.etats, D.stats, D.peuples);
    });
  }

  /* ---------------------------------------------------------------- carte */
  /* map.json : chemins en 1000 × 548,6 ; c = point représentatif ; b = boîte */
  function drawMap(parent, o) {
    var g = el('g', { transform: 'translate(' + o.x + ',' + o.y + ') scale(' + o.s + ')' }, parent);
    /* États territoriaux d'abord : villes-États et municipalités sont des trous laissés par leurs voisins */
    var rank = { T: 0, F: 1, M: 2 };
    var codes = Object.keys(D.map.e).sort(function (a, b) { return rank[D.by[a].t] - rank[D.by[b].t] || (a < b ? -1 : 1); }), xs = codes.map(function (c) { return D.map.e[c].c[0]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var M = { g: g, s: o.s, x: o.x, y: o.y, p: {} };
    codes.forEach(function (c) {
      var p = el('path', { d: D.map.e[c].d, fill: C.land, 'fill-opacity': 0, stroke: C.ink2, 'stroke-width': .9 / o.s * 1.1,
        'stroke-linejoin': 'round' }, g);
      var len = p.getTotalLength();
      set(p, { 'stroke-dasharray': len + ' ' + len, 'stroke-dashoffset': len });
      M.p[c] = { el: p, len: len, k: (D.map.e[c].c[0] - x0) / (x1 - x0), t: D.by[c].t, peuple: D.by[c].p };
    });
    /* point de l'écran d'une entité */
    M.pt = function (c) { var q = D.map.e[c].c; return [o.x + q[0] * o.s, o.y + q[1] * o.s]; };
    return M;
  }

  /* ---------------------------------------------------------------- scènes */
  var SC = [];
  /* chap : numéro du chapitre ; la scène s'ouvre alors sur la transition du drapeau (CARD secondes de drapeau
     plein, lt < 0) */
  var CARD = .35;
  function scene(id, dur, bg, build, chap) { SC.push({ id: id, dur: dur, bg: bg, build: build, chap: chap, lead: chap ? CARD : 0 }); }

  /* 0. Ouverture */
  scene('intro', 6.4, 'night', function (g) {
    var tl = TL(), T = X.intro;
    var glow = el('circle', { cx: 640, cy: 226, r: 210, fill: 'url(#gGlow)' }, g);
    var lg = el('g', {}, g);
    el('image', { href: LION, x: -115, y: -102, width: 230, height: 204 }, lg);
    var eb = tl.g(g, .7, null, { dy: 0, fi: .6 });
    var ebt = txt(eb, T.eyebrow, 640, 398, { font: FD, size: 24, weight: 700, fill: C.gold, anchor: 'middle', ls: 6 });
    txt(tl.g(g, 1.0, null, { dy: 26, fi: .6 }), T.title, 640, 502, { font: FD, size: 96, weight: 800, fill: '#fff', anchor: 'middle' });
    txt(tl.g(g, 1.45, null, { dy: 20, fi: .6 }), T.sub, 640, 560, { font: FD, size: 48, weight: 600, fill: C.gold, anchor: 'middle' });
    var line = el('line', { x1: 640, x2: 640, y1: 604, y2: 604, stroke: C.gold, 'stroke-width': 1.2, opacity: .7 }, g);
    var mo = tl.g(g, 2.3, null, { dy: 10, fi: .6 });
    var mt = el('text', { x: 640, y: 652, 'text-anchor': 'middle' }, mo);
    el('tspan', { 'font-family': FD, 'font-size': 34, 'font-weight': 700, fill: C.gold }, mt, T.motto);
    el('tspan', { dx: 16, 'font-family': FB, 'font-size': 20, fill: 'rgba(255,255,255,.78)' }, mt, T.mottoEn);
    return function (lt) {
      var p = E.out(P(lt, .05, 1.1));
      set(lg, { transform: 'translate(640,226) scale(' + (.84 + .12 * p + .03 * P(lt, 1, 5.4)).toFixed(4) + ')', opacity: p.toFixed(3) });
      set(glow, { opacity: (.8 * E.out(P(lt, .3, 1.6))).toFixed(3), r: (200 + 16 * P(lt, 0, 6.4)).toFixed(1) });
      ebt.setAttribute('letter-spacing', lerp(18, 6, E.out(P(lt, .7, 1.2))).toFixed(2));
      var w = 130 * E.io(P(lt, 2.0, .8));
      set(line, { x1: 640 - w, x2: 640 + w });
      tl.run(lt);
    };
  });

  /* 1. Les États */
  scene('states', 31, 'paper', function (g) {
    var tl = TL(), T = X.states;
    var cam = el('g', {}, g);
    var M = drawMap(cam, { x: 290, y: 104, s: .96 });
    chapter(g, tl, 1, T.chapter);
    /* texte, colonne de gauche (mer Adriatique) : une phrase en titre, un détail dessous */
    var TX = 56, TY = 492;
    function say(a, b, head, detail, dy) {
      var h = txt(tl.g(g, a, b), head, TX, TY, { font: FD, size: 42, weight: 700, lh: 44 });
      if (detail) txt(tl.g(g, a + .35, b), detail, TX, TY + (dy || 44 * head.length + 10), { size: 24, lh: 32, fill: C.ink2 });
      return h;
    }
    say(.9, 5.4, T.l1);
    txt(tl.g(g, 2.5, 5.4), T.l2, TX, TY + 104, { font: FD, size: 42, weight: 700, fill: C.goldInk, lh: 44 });
    say(6.2, 11.2, T.l3);
    say(11.8, 15.6, T.terr[0], T.terr[1]);
    var pl = tl.g(g, 12.3, 15.6, { dy: 0 });
    var plt = txt(pl, '', TX, TY + 138, { font: FD, size: 32, weight: 700, fill: C.azure });
    say(16.0, 21.4, T.city[0], T.city[1]);
    say(21.8, 25.6, T.mun[0], T.mun[1]);
    say(26.0, null, T.sov[0], T.sov[1]);
    txt(tl.g(g, 27.6, null), T.frozen, TX, TY + 104, { font: FD, size: 30, weight: 700, fill: C.gules });
    /* compteur */
    var cg = tl.g(g, 4.6, null, { dy: 0, dx: 20 });
    var cn = txt(cg, '0', 1224, 196, { font: FD, size: 150, weight: 800, fill: C.ink, anchor: 'end' });
    txt(cg, T.count, 1224, 238, { font: FD, size: 38, weight: 700, fill: C.goldInk, anchor: 'end', ls: 1 });
    /* capitales et municipalités, dans le cadre de la caméra */
    var caps = ['ZG-94', 'BG-91', 'SA-92', 'SF-93'];
    var off = { 'ZG-94': [-70, -46, 'end'], 'BG-91': [86, -58, 'start'], 'SA-92': [74, 104, 'start'], 'SF-93': [66, 84, 'start'] };
    var CA = 16.5, CS = .6;
    var labs = caps.map(function (c, i) {
      var q = M.pt(c), o = off[c], a = CA + i * CS, lg = tl.g(cam, a, 21.4, { dy: 0 });
      var ln = el('line', { x1: q[0], y1: q[1], x2: q[0], y2: q[1], stroke: C.ink, 'stroke-width': 1.1 }, lg);
      el('circle', { cx: q[0], cy: q[1], r: 3.2, fill: C.ink }, lg);
      var tg = el('g', {}, lg), ax = q[0] + o[0] + (o[2] === 'end' ? -6 : 6);
      halo(txt(tg, T.caps[c][0], ax, q[1] + o[1] - 2, { font: FD, size: 30, weight: 800, anchor: o[2] }));
      halo(txt(tg, T.caps[c][1], ax, q[1] + o[1] + 20, { size: 16, fill: C.ink2, anchor: o[2] }));
      return { c: c, q: q, o: o, ln: ln, tg: tg, a: a };
    });
    var muns = ['BK-95', 'MO-96'].map(function (c, i) {
      var q = M.pt(c), a = 22.4 + i * .5, mg = tl.g(cam, a, 25.6, { dy: 0 });
      var ring = el('circle', { cx: q[0], cy: q[1], r: 10, fill: 'none', stroke: C.gules, 'stroke-width': 2.2 }, mg);
      halo(txt(mg, D.by[c].n, q[0] + (i ? -16 : 16), q[1] + 7, { font: FD, size: 28, weight: 800, fill: C.gules, anchor: i ? 'end' : 'start' }));
      return { ring: ring, a: a };
    });
    var PEUPLES = D.order;
    return function (lt) {
      /* caméra : lente avancée vers le cœur de la carte */
      var z = 1 + .05 * E.io(P(lt, 4, 27));
      cam.setAttribute('transform', 'translate(760,330) scale(' + z.toFixed(4) + ') translate(-760,-330)');
      /* tracé des contours, puis remplissage d'ouest en est */
      var n = 0, pk = Math.floor(P(lt, 12.4, 3.15) * 7 - 1e-9), peuple = lt >= 12.4 && lt < 15.6 ? PEUPLES[clamp(pk, 0, 6)] : null;
      var hl = E.io(P(lt, 27.6, .8)) * (1 - E.io(P(lt, 29.6, .8)));
      Object.keys(M.p).forEach(function (c) {
        var m = M.p[c];
        var pd = E.io(P(lt, .5 + m.k * 1.4, 2.6));
        var f0 = 4.8 + m.k * 4.0, pf = P(lt, f0, .8);
        if (m.t !== 'M' && lt >= f0 + .15) n++;
        var base = m.t === 'M' ? C.paper2 : C.land;
        /* les capitales en or le temps de leur présentation, puis Brčko et Mostar le temps de la leur */
        if (m.t === 'F') base = mix(base, C.gold, E.out(P(lt, CA + caps.indexOf(c) * CS, .6)) * (1 - E.io(P(lt, 21.4, .7))));
        if (m.t === 'M') base = mix(base, C.gules, .8 * E.out(P(lt, c === 'BK-95' ? 22.4 : 22.9, .6)) * (1 - E.io(P(lt, 25.6, .7))));
        var fill = mix(C.azure, base, E.out(pf));
        if (m.t === 'T' && peuple && m.peuple === peuple) fill = C.azure;
        set(m.el, {
          'stroke-dashoffset': (m.len * (1 - pd)).toFixed(1),
          'fill-opacity': clamp(pf * 3).toFixed(3), fill: fill,
          stroke: hl > 0 ? mix(C.paper, C.gules, hl) : pf > 0 ? mix(C.ink2, C.paper, E.out(pf)) : C.ink2,
          'stroke-width': ((lerp(.9, .8, E.out(pf)) + 1.1 * hl) / M.s).toFixed(3)
        });
      });
      cn.firstChild.textContent = String(Math.min(n, 52));
      plt.firstChild.textContent = peuple ? D.peuples[peuple].name + '  ·  ' + D.peuples[peuple].en : '';
      labs.forEach(function (l) {
        var p = E.out(P(lt, l.a, .5));
        set(l.ln, { x2: (l.q[0] + l.o[0] * p).toFixed(1), y2: (l.q[1] + l.o[1] * p).toFixed(1) });
        l.tg.setAttribute('opacity', E.out(P(lt, l.a + .3, .5)).toFixed(3));
      });
      muns.forEach(function (m) { var p = E.back(P(lt, m.a, .6)); m.ring.setAttribute('r', (4 + 8 * p).toFixed(2)); });
      tl.run(lt);
    };
  }, 1);

  /* ---------------------------------------------------------------- outils des scènes suivantes */
  /* une phrase en titre, un détail dessous (pair = [[titre…], [détail…]]) */
  function say(g, tl, a, b, pair, x, y, o) {
    o = o || {};
    var hs = o.hs || 42, hl = hs + 2, head = pair[0], det = pair[1];
    txt(tl.g(g, a, b), head, x, y, { font: FD, size: hs, weight: 700, lh: hl, anchor: o.anchor, fill: o.dark ? '#fff' : C.ink, dark: o.dark });
    if (det) txt(tl.g(g, a + .35, b), det, x, y + hl * head.length + 10, { size: o.ds || 24, lh: (o.ds || 24) + 8, fill: o.dark ? 'rgba(255,255,255,.8)' : C.ink2, anchor: o.anchor, dark: o.dark });
  }
  /* hémicycle : n sièges sur rows rangées, du plus à gauche au plus à droite */
  function hemi(n, cx, cy, r0, r1, rows) {
    var radii = [], tot = 0, i, j;
    for (i = 0; i < rows; i++) { var r = r0 + (r1 - r0) * i / (rows - 1); radii.push(r); tot += r; }
    var cnt = radii.map(function (r) { return Math.round(n * r / tot); });
    cnt[rows - 1] += n - cnt.reduce(function (a, b) { return a + b; }, 0);
    var pts = [];
    radii.forEach(function (r, i) { var k = cnt[i]; for (j = 0; j < k; j++) { var a = Math.PI * (1 - j / (k - 1)); pts.push({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a), a: a }); } });
    pts.sort(function (p, q) { return q.a - p.a; });
    return pts;
  }
  function check(parent, x, y, s, col) {
    return el('path', { d: 'M-10,0 L-3,7 L11,-8', transform: 'translate(' + x + ',' + y + ') scale(' + s + ')', fill: 'none',
      stroke: col, 'stroke-width': 3.2 / s * 1.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
  }
  function cross(parent, x, y, s, col) {
    return el('path', { d: 'M-8,-8 L8,8 M8,-8 L-8,8', transform: 'translate(' + x + ',' + y + ') scale(' + s + ')', fill: 'none',
      stroke: col, 'stroke-width': 3.2 / s * 1.4, 'stroke-linecap': 'round' }, parent);
  }
  /* bulle de verdict : coche ou croix et libellé, sur fond plein */
  function verdict(parent, x, y, ok, label) {
    var g = el('g', {}, parent);
    var r = el('rect', { x: x, y: y - 26, width: 100, height: 44, rx: 22, fill: ok ? C.azure : C.gules }, g);
    (ok ? check : cross)(g, x + 26, y - 4, .9, '#fff');
    var t = txt(g, label, x + 46, y + 6, { font: FD, size: 28, weight: 700, fill: '#fff' });
    r.setAttribute('width', (46 + t.getComputedTextLength() + 20).toFixed(1));
    return g;
  }
  var PEOPLE_ORDER = function () { return D.order; };
  /* hasard déterministe */
  function rnd(seed) { var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* 2. Les peuples */
  scene('peoples', 32, 'paper', function (g) {
    var tl = TL(), T = X.peoples, PE = PEOPLE_ORDER();
    chapter(g, tl, 2, T.chapter);
    var top = tl.g(g, .3, 20.6);
    txt(top, T.head, 56, 140, { font: FD, size: 56, weight: 800 });
    var TW = 153, GAP = 16, TY0 = 172;
    var tiles = PE.map(function (p, i) {
      var x = 56 + i * (TW + GAP), tg = tl.g(top, .6 + i * .12, null, { dy: 26 });
      var r = el('rect', { x: x, y: TY0, width: TW, height: 138, rx: 6, fill: '#fff', stroke: '#D0D2D8', 'stroke-width': 1.2 }, tg);
      el('rect', { x: x, y: TY0, width: TW, height: 5, fill: C.azure }, tg);
      txt(tg, D.peuples[p].name, x + 16, TY0 + 74, { font: FD, size: 38, weight: 800 });
      txt(tg, D.peuples[p].en, x + 16, TY0 + 104, { size: 17, fill: C.ink2 });
      return r;
    });
    var nr = tl.g(top, 10.2, null, { dy: 12 });
    var nrx = 56 + 6 * (TW + GAP), nrr = el('rect', { x: nrx, y: 334, width: TW, height: 46, rx: 23, fill: '#fff', stroke: C.ink2,
      'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, nr);
    txt(nr, T.none, nrx + TW / 2, 364, { font: FD, size: 24, weight: 700, fill: C.ink2, anchor: 'middle' });
    say(g, tl, 3.8, 9.6, T.choice, 56, 486);
    say(g, tl, 9.8, 15.4, T.free, 56, 486);
    say(g, tl, 15.6, 20.6, T.commune, 56, 486);
    /* les communautés */
    var cm = tl.g(g, 21.0, null, { dy: 0 });
    var M = drawMap(cm, { x: 600, y: 100, s: .62 });
    var hosts = {}; (D.ent || []).forEach(function (e) { hosts[e.host] = 1; });
    say(g, tl, 21.4, null, T.comm, 56, 170);
    var lg = tl.g(g, 22.6, null, { dy: 0 });
    el('rect', { x: 820, y: 472, width: 18, height: 18, rx: 3, fill: C.azure }, lg);
    txt(lg, T.host, 848, 487, { size: 17, fill: C.ink2 });
    var mo = T.mottos.map(function (m, i) {
      return txt(tl.g(g, 26.0 + i * .45, null, { dy: 16 }), m, 56 + i * 300, 590, { font: FD, size: 46, weight: 700, fill: C.goldInk });
    });
    txt(tl.g(g, 27.8, null), T.mottoCap, 56, 630, { size: 18, fill: C.ink2 });
    return function (lt) {
      /* le choix passe d'un peuple à l'autre, sans s'arrêter ; puis « No register » */
      var sw = lt >= 4.2 && lt < 9.6 ? (lt - 4.2) / 5.4 * 7 : -1, k = Math.floor(sw);
      tiles.forEach(function (r, i) {
        var on = sw >= 0 ? clamp(1 - Math.abs(sw - (i + .5)) * 1.4) : 0;
        set(r, { stroke: mix('#D0D2D8', C.azure, on), 'stroke-width': 1.2 + 2 * on, fill: mix('#FFFFFF', '#EEF0F8', on) });
      });
      var nh = E.out(P(lt, 10.6, .5)) * (1 - E.io(P(lt, 15.4, .5)));
      set(nrr, { stroke: mix(C.ink2, C.azure, nh), 'stroke-width': 1.4 + 1.4 * nh, fill: mix('#FFFFFF', '#EEF0F8', nh) });
      Object.keys(M.p).forEach(function (c) {
        var m = M.p[c], h = hosts[c] ? E.out(P(lt, 22.4 + m.k * 1.6, .6)) : 0;
        set(m.el, { 'stroke-dasharray': 'none', 'fill-opacity': 1, fill: mix(m.t === 'M' ? C.paper2 : C.land, C.azure, h), stroke: '#fff', 'stroke-width': (1 / M.s).toFixed(3) });
      });
      tl.run(lt);
    };
  }, 2);

  /* 3. Les institutions */
  scene('institutions', 40, 'paper', function (g) {
    var tl = TL(), T = X.institutions;
    chapter(g, tl, 3, T.chapter);
    var CX = [202, 494, 786, 1078], cols = [];
    var BEAT = [.4, 9.3, 18.3, 27.3, 33.8];
    T.org.forEach(function (o, i) {
      var cg = el('g', {}, g), ig = tl.g(cg, BEAT[i] + .2, null, { dy: 14 });
      txt(ig, o[0], CX[i], 412, { font: FD, size: 34, weight: 800, anchor: 'middle' });
      txt(ig, o[1], CX[i], 444, { font: FD, size: 26, weight: 600, fill: C.goldInk, anchor: 'middle' });
      cols.push(cg);
    });
    /* Kongres : 250 sièges */
    var kp = hemi(250, CX[0], 336, 52, 134, 8).map(function (p) { return el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 4.1, fill: C.azure }, cols[0]); });
    /* Narodni Sabor : sept délégations de dix */
    var sp = [];
    for (var d = 0; d < 7; d++) for (var m = 0; m < 10; m++)
      sp.push(el('circle', { cx: CX[1] - 96 + d * 32 + (m % 2) * 13 - 6, cy: 186 + Math.floor(m / 2) * 30, r: 5.6, fill: C.azure }, cols[1]));
    /* Konfederalno Veće : sept sièges */
    var vp = [];
    for (var v = 0; v < 7; v++) { var a = -Math.PI / 2 + v * 2 * Math.PI / 7;
      vp.push(el('circle', { cx: CX[2] + 82 * Math.cos(a), cy: 262 + 82 * Math.sin(a), r: 18, fill: '#fff', stroke: C.azure, 'stroke-width': 3 }, cols[2])); }
    /* Ustavni Sud : un édifice */
    var court = el('g', { transform: 'translate(' + CX[3] + ',262)', fill: 'none', stroke: C.azure, 'stroke-width': 3, 'stroke-linejoin': 'round' }, cols[3]);
    var cpaths = ['M-84,-34 L0,-86 L84,-34 Z', 'M-80,-26 L80,-26', 'M-60,-18 L-60,58', 'M-30,-18 L-30,58', 'M0,-18 L0,58', 'M30,-18 L30,58', 'M60,-18 L60,58',
      'M-84,66 L84,66', 'M-96,80 L96,80'].map(function (d) { var p = el('path', { d: d }, court); var L = p.getTotalLength(); set(p, { 'stroke-dasharray': L + ' ' + L, 'stroke-dashoffset': L }); return [p, L]; });
    T.say.forEach(function (s, i) { say(g, tl, BEAT[i] + .3, i < 4 ? BEAT[i + 1] - .3 : null, s, 56, 560); });
    /* sièges des capitales */
    var br = tl.g(g, 34.2, null, { dy: 0 });
    el('path', { d: 'M' + (CX[0] - 120) + ',466 L' + (CX[0] - 120) + ',476 L' + (CX[2] + 120) + ',476 L' + (CX[2] + 120) + ',466', fill: 'none', stroke: C.gules, 'stroke-width': 2 }, br);
    txt(br, 'Sarajevo', CX[1], 504, { font: FD, size: 28, weight: 800, fill: C.gules, anchor: 'middle' });
    el('path', { d: 'M' + (CX[3] - 110) + ',466 L' + (CX[3] - 110) + ',476 L' + (CX[3] + 110) + ',476 L' + (CX[3] + 110) + ',466', fill: 'none', stroke: C.gules, 'stroke-width': 2 }, br);
    txt(br, 'Zagreb', CX[3], 504, { font: FD, size: 28, weight: 800, fill: C.gules, anchor: 'middle' });
    return function (lt) {
      var act = lt < BEAT[1] ? 0 : lt < BEAT[2] ? 1 : lt < BEAT[3] ? 2 : lt < BEAT[4] ? 3 : 4;
      cols.forEach(function (c, i) {
        var op;
        if (act === 4) op = i === 3 ? 1 : lerp(.26, 1, E.io(P(lt, BEAT[4], .6)));
        else if (i === act) op = E.out(P(lt, BEAT[i], .4));
        else if (i < act) op = .26 + .74 * (1 - E.io(P(lt, BEAT[i + 1], .5)));
        else op = 0;
        c.setAttribute('opacity', op.toFixed(3));
      });
      kp.forEach(function (c, i) { var p = E.back(P(lt, .7 + i / 250 * 2.4, .35)); c.setAttribute('r', (4.1 * p).toFixed(2)); });
      sp.forEach(function (c, i) { var p = E.back(P(lt, 9.7 + Math.floor(i / 10) * .28 + (i % 10) * .03, .35)); c.setAttribute('r', (5.6 * p).toFixed(2)); });
      vp.forEach(function (c, i) { var p = E.back(P(lt, 18.8 + i * .2, .45)); c.setAttribute('r', (18 * p).toFixed(2)); });
      cpaths.forEach(function (q, i) { q[0].setAttribute('stroke-dashoffset', (q[1] * (1 - E.io(P(lt, 27.7 + i * .14, .7)))).toFixed(1)); });
      tl.run(lt);
    };
  }, 3);

  /* 4. Comment une loi passe */
  scene('law', 42, 'paper', function (g) {
    var tl = TL(), T = X.law, PE = PEOPLE_ORDER(), R = D.R;
    chapter(g, tl, 4, T.chapter);
    var vis = el('g', {}, g);
    /* Kongres : 160 pour, 21 abstentions, 69 contre (cas « Consent given » du moteur) */
    var KF = 160, KX = 21, kg = el('g', {}, vis);
    var kd = hemi(250, 300, 404, 96, 214, 9).map(function (p) { return el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 6.2, fill: C.land }, kg); });
    var kc = tl.g(kg, 3.0, 30, { dy: 8 });
    var kct = el('text', { x: 300, y: 446, 'text-anchor': 'middle', 'font-family': FD, 'font-size': 28, 'font-weight': 700 }, kc);
    el('tspan', { fill: C.azure }, kct, KF + ' ' + T.kfor); el('tspan', { fill: C.ink3, dx: 14 }, kct, KX + ' ' + T.kab);
    el('tspan', { fill: C.gules, dx: 14 }, kct, (250 - KF - KX) + ' ' + T.kag);
    var kv = tl.g(kg, 4.6, 30, { dy: 0 }); verdict(kv, 300 - 150, 146, true, T.kok);
    /* Narodni Sabor : sept délégations, part des inscrits */
    var sg = el('g', {}, vis), SX0 = 652, SW = 82;
    var share = {}; PE.forEach(function (p) { share[p] = R.reg[p] / R.regTotal; });
    var dl = PE.map(function (p, i) {
      var x = SX0 + i * SW, cg = tl.g(sg, 8.8 + i * .1, 30, { dy: 18 }), dots = [];
      for (var m = 0; m < 10; m++) dots.push(el('circle', { cx: x + 22 + (m % 2) * 22, cy: 150 + Math.floor(m / 2) * 22, r: 7.5, fill: C.land }, cg));
      txt(cg, D.peuples[p].name, x + 33, 278, { font: FD, size: 19, weight: 700, anchor: 'middle' });
      var mk = el('g', { opacity: 0 }, cg);
      var ok = check(mk, x + 33, 306, .9, C.azure), ko = cross(mk, x + 33, 306, .9, C.gules);
      return { p: p, dots: dots, ok: ok, ko: ko, mk: mk };
    });
    var cnt = tl.g(sg, 17.0, 30, { dy: 0 });
    var cntT = txt(cnt, '', SX0, 132 - 20, { font: FD, size: 26, weight: 700, fill: C.ink });
    /* jauge de la double clé */
    var gg = tl.g(sg, 17.6, 30, { dy: 10 }), GX = SX0, GW = 7 * SW - 16, GY = 360;
    txt(gg, T.share, GX, GY - 14, { size: 17, fill: C.ink2 });
    el('rect', { x: GX, y: GY, width: GW, height: 30, fill: C.land, rx: 3 }, gg);
    var segs = PE.map(function () { return el('rect', { x: GX, y: GY, width: 0, height: 30, fill: C.azure, stroke: '#fff', 'stroke-width': 1.5 }, gg); });
    el('line', { x1: GX + GW / 2, x2: GX + GW / 2, y1: GY - 8, y2: GY + 38, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, gg);
    txt(gg, '50 %', GX + GW / 2, GY + 58, { font: FD, size: 22, weight: 700, anchor: 'middle' });
    var pct = txt(gg, '', GX + GW, GY - 14, { font: FD, size: 30, weight: 800, anchor: 'end' });
    var vno = tl.g(sg, 21.0, 24.2, { dy: 0 }); verdict(vno, GX, 450, false, T.no);
    var vyes = tl.g(sg, 26.4, 30, { dy: 0 }); verdict(vyes, GX, 450, true, T.yes);
    txt(tl.g(g, 17.6, 30, { dy: 0 }), T.note, 1224, 690, { size: 13, fill: C.ink3, anchor: 'end' });
    say(g, tl, .4, 8.4, T.k, 56, 540);
    say(g, tl, 8.6, 16.4, T.id, 56, 540);
    say(g, tl, 16.6, 24.0, T.five, 56, 540);
    say(g, tl, 24.2, 30.0, T.six, 56, 540);
    /* sonnette d'alarme */
    say(g, tl, 30.4, null, T.alarm, 56, 540);
    var fl = el('g', {}, g), FX = [56, 286, 586, 806, 1036], FW = [200, 270, 190, 200, 190];
    var bell = tl.g(fl, 31.4, null, { dy: 0 }), bellI = el('g', {}, bell);
    el('path', { d: 'M-16,9 Q-16,-15 0,-17 Q16,-15 16,9 L21,14 L-21,14 Z', fill: C.gules }, bellI);
    el('circle', { cx: 0, cy: 18, r: 4, fill: C.gules }, bellI); el('circle', { cx: 0, cy: -19, r: 3.5, fill: C.gules }, bellI);
    var steps = T.flow.map(function (f, i) {
      var sg2 = tl.g(fl, 31.0 + i * .9, null, { dy: 0, dx: -20 }), x = FX[i], w = FW[i], y = 250, last = i === 4, mid = i === 2;
      el('rect', { x: x, y: y, width: w, height: 96, rx: 10, fill: mid ? C.gules : last ? C.azure : '#fff', stroke: mid ? C.gules : last ? C.azure : '#C9CDD6', 'stroke-width': 1.5 }, sg2);
      var words = f.split(': '), lines = words.length > 1 ? [words[0] + ':', words[1]] : [f];
      if (lines[lines.length - 1].length > 18) { var ww = lines.pop().split(' '), h = Math.ceil(ww.length / 2); lines.push(ww.slice(0, h).join(' '), ww.slice(h).join(' ')); }
      txt(sg2, lines, x + w / 2, y + 52 - (lines.length - 1) * 13, { font: FD, size: 25, weight: 700, lh: 26, anchor: 'middle', fill: mid || last ? '#fff' : C.ink });
      if (i < 4) el('path', { d: 'M' + (x + w + 8) + ',' + (y + 48) + ' L' + (FX[i + 1] - 10) + ',' + (y + 48) + ' M' + (FX[i + 1] - 18) + ',' + (y + 40) + ' L' + (FX[i + 1] - 10) + ',' + (y + 48) + ' L' + (FX[i + 1] - 18) + ',' + (y + 56),
        fill: 'none', stroke: C.ink2, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sg2);
      return sg2;
    });
    txt(tl.g(g, 36.5, null, { dy: 0 }), T.more, 56, 690, { size: 15, fill: C.ink3 });
    return function (lt) {
      vis.style.display = lt < 30.6 ? '' : 'none';
      /* le Kongres vote, de gauche à droite */
      kd.forEach(function (c, i) {
        var p = P(lt, .9 + i / 250 * 1.8, .25), v = i < KF ? C.azure : i < KF + KX ? '#fff' : C.gules;
        set(c, { fill: mix(C.land, v, p), stroke: i >= KF && i < KF + KX ? mix(C.land, C.ink3, p) : 'none', 'stroke-width': 1.6 });
      });
      kg.setAttribute('opacity', (1 - .7 * E.io(P(lt, 8.6, .6))).toFixed(3));
      /* les délégations : d'abord cinq sans les Serbes ni les Bulgares, puis les Serbes basculent */
      var yes = { slo: 1, hrv: 1, bos: 1, cng: 1, mkd: 1 };
      var flip = E.io(P(lt, 24.6, .7));
      dl.forEach(function (d, i) {
        var v = E.out(P(lt, 17.2 + i * .25, .4)), y = yes[d.p] || (d.p === 'srb' && flip > .5);
        d.dots.forEach(function (c, m) {
          var col = yes[d.p] ? C.azure : d.p === 'srb' ? mix(C.gules, C.azure, flip) : C.gules;
          c.setAttribute('fill', mix(C.land, col, clamp(v * 1.3 - m * .03)));
        });
        d.mk.setAttribute('opacity', v.toFixed(3));
        d.ok.style.display = y ? '' : 'none'; d.ko.style.display = y ? 'none' : '';
      });
      var nyes = 5 + (flip > .5 ? 1 : 0);
      cntT.firstChild.textContent = nyes + ' / 7 ' + T.deleg;
      var x = GX, tot = 0, gp = E.out(P(lt, 18.2, 1.6));
      PE.forEach(function (p, i) {
        var w = 0;
        if (yes[p]) w = share[p] * GW * gp;
        if (p === 'srb') w = share[p] * GW * flip;
        set(segs[i], { x: x.toFixed(1), width: Math.max(0, w).toFixed(1) });
        x += w; tot += yes[p] ? share[p] * gp : p === 'srb' ? share[p] * flip : 0;
      });
      pct.firstChild.textContent = (tot * 100).toFixed(1).replace('.', '.') + ' %';
      pct.setAttribute('fill', tot > .5 ? C.azure : C.gules);
      bellI.setAttribute('transform', 'translate(' + (FX[1] + FW[1] / 2) + ',200) rotate(' + (18 * Math.sin(lt * 9) * clamp(1 - P(lt, 32, 2.5)) * (lt > 31.4 ? 1 : 0)).toFixed(2) + ')');
      tl.run(lt);
    };
  }, 4);

  /* 5. Démocratie directe */
  scene('democracy', 32, 'paper', function (g) {
    var tl = TL(), T = X.democracy, R = D.R;
    chapter(g, tl, 5, T.chapter);
    /* compteur de signatures */
    var cg = tl.g(g, .5, 16.4, { dy: 0 });
    var cn = txt(cg, '', 56, 250, { font: FD, size: 128, weight: 800 });
    txt(cg, T.citizens, 60, 294, { font: FD, size: 36, weight: 700, fill: C.goldInk });
    var orG = tl.g(cg, 3.0, 9.0, { dy: 0 });
    txt(orG, T.or, 60, 352, { font: FD, size: 28, weight: 700, fill: C.ink3 });
    txt(orG, T.states12, 60, 386, { size: 20, lh: 27, fill: C.ink });
    /* tuiles des 52 États (grille du portail) */
    var TG = el('g', {}, g), CELL = 36, OX = 716, OY = 108, tiles = {};
    var tg = tl.g(TG, .8, 27.0, { dy: 0 });
    D.etats.forEach(function (s) {
      if (s.t === 'M') return;
      var x = OX + s.g[0] * CELL, y = OY + s.g[1] * CELL;
      var r = el('rect', { x: x, y: y, width: CELL - 4, height: CELL - 4, rx: 4, fill: C.land }, tg);
      var t = txt(tg, s.k, x + (CELL - 4) / 2, y + 21, { size: 11, weight: 700, fill: C.ink2, anchor: 'middle' });
      tiles[s.c] = { r: r, t: t, s: s, k: (s.g[0] + s.g[1]) / 24 };
    });
    /* douze États, la moitié au plus d'un même peuple */
    var want = { hrv: 3, srb: 3, bul: 2, slo: 1, bos: 1, mkd: 1, cng: 1 }, twelve = [];
    D.etats.forEach(function (s) { if (s.t === 'T' && want[s.p]) { want[s.p]--; twelve.push(s.c); } });
    /* double majorité : vote des États du cas « Consent given » du moteur */
    var ev = REGLES.evaluate(R, REGLES.caseById('consent-given').make(R)), sv = ev.t.stateVote;
    var pf = ev.t.P.f / (ev.t.P.f + ev.t.P.a);
    var dg = tl.g(g, 17.0, 27.0, { dy: 0 });
    var dN = txt(dg, '', 56, 250, { font: FD, size: 128, weight: 800 });
    txt(dg, '/ 52 ' + T.statesYes.toLowerCase(), 60, 294, { font: FD, size: 30, weight: 700, fill: C.goldInk });
    var VX = 60, VW = 520, VY = 352;
    txt(dg, T.voters, VX, VY - 12, { size: 17, fill: C.ink2 });
    el('rect', { x: VX, y: VY, width: VW, height: 26, fill: C.land, rx: 3 }, dg);
    var vbar = el('rect', { x: VX, y: VY, width: 0, height: 26, fill: C.azure, rx: 3 }, dg);
    el('line', { x1: VX + VW / 2, x2: VX + VW / 2, y1: VY - 6, y2: VY + 32, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, dg);
    var vpct = txt(dg, '', VX + VW, VY - 12, { font: FD, size: 26, weight: 800, fill: C.azure, anchor: 'end' });
    txt(dg, T.example, OX, OY + 11 * CELL + 14, { size: 14, fill: C.ink3 });
    var dv = tl.g(g, 24.0, 27.0, { dy: 0 }); verdict(dv, 60, 430, true, X.law.yes);
    say(g, tl, .4, 9.0, T.ref, 56, 520);
    say(g, tl, 9.3, 16.4, T.ini, 56, 520);
    say(g, tl, 16.8, 27.0, T.dbl, 56, 520);
    say(g, tl, 27.4, null, T.sun, 56, 520);
    /* calendrier : quatre dimanches */
    var cal = tl.g(g, 27.6, null, { dy: 0 }), sun = [2, 5, 8, 10], cd = [];
    T.months.forEach(function (m, i) {
      var x = 120 + i * 90;
      txt(cal, m, x, 250, { font: FD, size: 30, weight: 700, fill: C.ink2, anchor: 'middle' });
      cd.push(el('circle', { cx: x, cy: 300, r: sun.indexOf(i) >= 0 ? 0 : 5, fill: sun.indexOf(i) >= 0 ? C.azure : C.land }, cal));
    });
    return function (lt) {
      /* 150 000, puis 300 000 */
      var n = lt < 9.3 ? 150000 * E.out(P(lt, .6, 2.2)) : 150000 + 150000 * E.io(P(lt, 9.6, 1.6));
      cn.firstChild.textContent = Math.round(n / 1000) * 1000 >= 1000 ? fmt(Math.round(n / 1000) * 1000) : '0';
      var ny = 0;
      Object.keys(tiles).forEach(function (c) {
        var o = tiles[c], col = C.land, tcol = C.ink2;
        var i12 = twelve.indexOf(c);
        if (i12 >= 0) { var p = E.out(P(lt, 3.6 + i12 * .22, .4)) * (1 - E.io(P(lt, 9.0, .6))); col = mix(C.land, C.azure, p); tcol = mix(C.ink2, '#fff', p); }
        var q = E.out(P(lt, 17.4 + o.k * 4.5, .45));
        if (q > 0) {
          var v = sv[c] === 'f';
          col = mix(C.land, v ? C.azure : C.gules, q); tcol = mix(C.ink2, '#fff', q);
          if (q > .5 && v) ny++;
        }
        set(o.r, { fill: col }); o.t.setAttribute('fill', tcol);
      });
      dN.firstChild.textContent = String(ny);
      dN.setAttribute('fill', ny >= 27 ? C.azure : C.ink);
      var vp = E.out(P(lt, 18.0, 4.0)) * pf;
      vbar.setAttribute('width', (VW * vp).toFixed(1));
      vpct.firstChild.textContent = Math.round(vp * 100) + ' %';
      cd.forEach(function (c, i) { if (sun.indexOf(i) >= 0) c.setAttribute('r', (14 * E.back(P(lt, 28.4 + sun.indexOf(i) * .35, .5))).toFixed(2)); });
      tl.run(lt);
    };
  }, 5);

  /* 6. La langue */
  var CYR32 = { 'A': 'А', 'Ã': 'Ъ', 'B': 'Б', 'C': 'Ц', 'Č': 'Ч', 'Ć': 'Ћ', 'D': 'Д', 'Đ': 'Ђ', 'E': 'Е', 'Ě': 'Ѣ', 'F': 'Ф', 'G': 'Г', 'H': 'Х',
    'I': 'И', 'J': 'Ј', 'K': 'К', 'L': 'Л', 'Ļ': 'Љ', 'M': 'М', 'N': 'Н', 'Ñ': 'Њ', 'O': 'О', 'P': 'П', 'R': 'Р', 'S': 'С', 'Š': 'Ш', 'T': 'Т',
    'U': 'У', 'V': 'В', 'X': 'Џ', 'Z': 'З', 'Ž': 'Ж' };
  scene('language', 30, 'paper', function (g) {
    var tl = TL(), T = X.language;
    /* cyrillique confédéral : formes droites du jeu ss01 de Sofia Sans, comme le portail (pas les formes bulgares) */
    g.style.fontFeatureSettings = '"ss01"';
    chapter(g, tl, 6, T.chapter);
    var colX = [240, 640, 1040];
    T.std.forEach(function (s, i) {
      var cg = tl.g(g, .6 + i * .3, 9.0, { dy: 22 });
      txt(cg, s[0], colX[i], 200, { font: FD, size: 64, weight: 800, anchor: 'middle' });
      txt(cg, s[1], colX[i], 232, { size: 19, fill: C.ink2, anchor: 'middle' });
      el('line', { x1: colX[i] - 60, x2: colX[i] + 60, y1: 262, y2: 262, stroke: C.gold, 'stroke-width': 2 }, cg);
      txt(tl.g(cg, 2.4 + i * .3, null, { dy: 10 }), T.sabor[i], colX[i], 316, { font: FD, size: 36, weight: 700, fill: C.azure, anchor: 'middle' });
    });
    txt(tl.g(g, 3.6, 9.0, { dy: 0 }), T.same, 640, 372, { size: 18, fill: C.ink3, anchor: 'middle' });
    /* les 32 lettres */
    var AB = (D.abc || []).map(function (a) { return a.glyph; }), lt0 = 9.6, LW = 64, LG = 8, LX = 64, LY = 150;
    var SPECIAL = { 'Ã': 1, 'Ě': 1, 'Ļ': 1, 'Ñ': 1, 'X': 1 };
    var letters = AB.map(function (ch, i) {
      var x = LX + (i % 16) * (LW + LG), y = LY + Math.floor(i / 16) * (LW + 18), lg = tl.g(g, lt0 + i * .05, null, { dy: 16, fi: .4 });
      var inner = el('g', { transform: 'translate(' + (x + LW / 2) + ',' + (y + LW / 2) + ')' }, lg);
      var r = el('rect', { x: -LW / 2, y: -LW / 2, width: LW, height: LW, rx: 6, fill: SPECIAL[ch] ? C.gold : '#fff', stroke: SPECIAL[ch] ? C.gold : '#D0D2D8', 'stroke-width': 1.2 }, inner);
      var t = txt(inner, ch, 0, 15, { font: FD, size: 44, weight: 800, anchor: 'middle' });
      return { ch: ch, inner: inner, t: t, x: x + LW / 2, y: y + LW / 2, i: i };
    });
    var ndG = tl.g(g, 21.6, null, { dy: 14 });
    var nd = txt(ndG, X.intro.motto, 640, 412, { font: FD, size: 88, weight: 800, fill: C.ink, anchor: 'middle' });
    say(g, tl, .4, 9.0, T.three, 56, 486);
    say(g, tl, 9.4, 19.0, T.abc, 56, 486);
    say(g, tl, 19.4, null, T.cyr, 56, 486);
    var ND = X.intro.motto, NDC = ND.split('').map(function (c) { var u = c.toUpperCase(), y = CYR32[u]; return y ? (c === u ? y : y.toLowerCase()) : c; }).join('');
    return function (lt) {
      letters.forEach(function (L) {
        /* bascule lettre par lettre : l'écart se referme, la lettre change, l'écart se rouvre */
        var f = P(lt, 19.8 + L.i * .07, .36), sx = Math.abs(Math.cos(f * Math.PI));
        L.t.firstChild.textContent = f >= .5 ? CYR32[L.ch] : L.ch;
        L.inner.setAttribute('transform', 'translate(' + L.x + ',' + L.y + ') scale(' + Math.max(.02, sx).toFixed(3) + ',1)');
      });
      var fm = P(lt, 23.2, 1.4), k = Math.floor(fm * ND.length + 1e-9);
      nd.firstChild.textContent = NDC.slice(0, k) + ND.slice(k);
      tl.run(lt);
    };
  }, 6);

  /* 7. Vivre ensemble */
  scene('together', 30, 'paper', function (g) {
    var tl = TL(), T = X.together;
    chapter(g, tl, 7, T.chapter);
    var mg = tl.g(g, .3, null, { dy: 0 });
    var M = drawMap(mg, { x: 40, y: 120, s: .6 });
    /* échanges entre États de peuples différents */
    var terr = D.etats.filter(function (s) { return s.t === 'T'; }), arcs = [];
    for (var i = 0, n = 0; n < 22 && i < 400; i++) {
      var a = terr[Math.floor(rnd(i + 1) * terr.length)], b = terr[Math.floor(rnd(i + 101) * terr.length)];
      if (a.p === b.p) continue;
      var p = M.pt(a.c), q = M.pt(b.c), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2 - Math.hypot(q[0] - p[0], q[1] - p[1]) * .35;
      var path = el('path', { d: 'M' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + q[0].toFixed(1) + ',' + q[1].toFixed(1),
        fill: 'none', stroke: C.azure, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, mg);
      var L = path.getTotalLength(), dot = el('circle', { r: 4, fill: C.gules }, mg);
      arcs.push({ el: path, L: L, dot: dot, a: .8 + n * 1.05 });
      n++;
    }
    var IX = 680, items = T.items.map(function (it, i) {
      var y = 150 + i * 84, ig = tl.g(g, .8 + i * 4.6, null, { dy: 14 });
      var badge = el('circle', { cx: IX + 16, cy: y + 6, r: 17, fill: C.azure }, ig);
      txt(ig, String(i + 1), IX + 16, y + 14, { font: FD, size: 24, weight: 800, fill: '#fff', anchor: 'middle' });
      txt(ig, it, IX + 50, y + 14, { font: FD, size: 30, weight: 700, lh: 32 });
      return ig;
    });
    txt(tl.g(g, 24.4, null), T.end, 56, 540, { font: FD, size: 46, weight: 800, lh: 48 });
    return function (lt) {
      Object.keys(M.p).forEach(function (c) {
        var m = M.p[c]; set(m.el, { 'stroke-dasharray': 'none', 'fill-opacity': 1, fill: m.t === 'M' ? C.paper2 : C.land, stroke: '#fff', 'stroke-width': (1 / M.s).toFixed(3) });
      });
      arcs.forEach(function (r) {
        var p = E.io(P(lt, r.a, 1.6)), out = E.io(P(lt, r.a + 4.5, 1.2));
        set(r.el, { 'stroke-dasharray': r.L.toFixed(1) + ' ' + r.L.toFixed(1), 'stroke-dashoffset': (r.L * (1 - p)).toFixed(1), opacity: (1 - out * .75).toFixed(3) });
        var pt = r.el.getPointAtLength(r.L * p);
        set(r.dot, { cx: pt.x.toFixed(1), cy: pt.y.toFixed(1), opacity: (p > 0 && p < 1 ? 1 : 0) });
      });
      tl.run(lt);
    };
  }, 7);

  /* 8. Les symboles, et la fin */
  scene('symbols', 29, 'paper', function (g) {
    var tl = TL(), T = X.symbols;
    chapter(g, tl, 8, T.chapter);
    var FX0 = 620, FY0 = 120, FWD = 560, FHT = FWD * 2 / 3, RWD = FWD * 1000 / 4500;
    var fg = el('g', {}, g), fbands = [], fred;
    var clip = el('clipPath', { id: 'clipFlag' }, fg); el('rect', { x: FX0, y: FY0, width: FWD, height: FHT }, clip);
    var fin = el('g', { 'clip-path': 'url(#clipFlag)' }, fg);
    [FL.navy, '#fff', FL.navy].forEach(function (c, i) { fbands.push(el('rect', { x: FX0, y: FY0 + i * FHT / 3 - (i ? .5 : 0), width: FWD, height: FHT / 3 + 1, fill: c }, fin)); });
    fred = el('rect', { x: FX0, y: FY0, width: RWD, height: FHT, fill: FL.red }, fin);
    var sflag = el('image', { href: '../../images-sources/symboles/BK-State-Flag.png', x: FX0, y: FY0, width: FWD, height: FHT, opacity: 0 }, fg);
    var frame = el('rect', { x: FX0, y: FY0, width: FWD, height: FHT, fill: 'none', stroke: 'rgba(0,0,0,.12)', 'stroke-width': 1 }, fg);
    var lion = el('g', {}, g); el('image', { href: LION, x: -115, y: -102, width: 230, height: 204 }, lion);
    say(g, tl, .6, 7.6, T.civil, 56, 300);
    say(g, tl, 7.9, 14.6, T.state, 56, 300);
    say(g, tl, 14.9, 21.0, T.lion, 56, 300);
    /* la fin, sur fond de nuit */
    var night = el('rect', { width: W, height: H, fill: 'url(#gNight)', opacity: 0 }, g);
    var endG = el('g', {}, g);
    var mo = tl.g(endG, 22.6, null, { dy: 18 });
    txt(mo, T.motto, 640, 520, { font: FD, size: 120, weight: 800, fill: C.gold, anchor: 'middle' });
    txt(tl.g(endG, 23.2, null, { dy: 12 }), T.mottoEn, 640, 566, { size: 26, fill: 'rgba(255,255,255,.85)', anchor: 'middle' });
    txt(tl.g(endG, 24.4, null, { dy: 8 }), T.cta, 640, 650, { font: FB, size: 18, weight: 700, ls: 1.5, fill: C.gold, anchor: 'middle' });
    var line = el('line', { x1: 640, x2: 640, y1: 610, y2: 610, stroke: C.gold, 'stroke-width': 1.2, opacity: .6 }, endG);
    return function (lt) {
      /* le drapeau civil se monte, puis devient drapeau d'État */
      fbands.forEach(function (b, i) { b.setAttribute('transform', 'translate(' + (-FWD * (1 - E.io(P(lt, .4 + i * .12, .7)))).toFixed(1) + ',0)'); });
      fred.setAttribute('transform', 'translate(0,' + (-FHT * (1 - E.out(P(lt, .8, .7)))).toFixed(1) + ')');
      sflag.setAttribute('opacity', E.io(P(lt, 8.4, 1.0)).toFixed(3));
      frame.setAttribute('opacity', P(lt, 1.4, .3).toFixed(3));
      var away = E.io(P(lt, 14.6, .9));
      fg.setAttribute('transform', 'translate(' + (away * 700).toFixed(1) + ',0)');
      /* le lion : à droite, puis au centre de la fin */
      var li = E.out(P(lt, 15.2, .9)), fin2 = E.io(P(lt, 21.6, 1.2));
      var lx = lerp(900, 640, fin2), ly = lerp(300, 250, fin2), ls = lerp(1.45, 1.0, fin2) * (.9 + .1 * li);
      set(lion, { transform: 'translate(' + lx.toFixed(1) + ',' + ly.toFixed(1) + ') scale(' + ls.toFixed(4) + ')', opacity: li.toFixed(3) });
      night.setAttribute('opacity', E.io(P(lt, 21.3, 1.0)).toFixed(3));
      var w = 140 * E.io(P(lt, 24.0, .8)); set(line, { x1: 640 - w, x2: 640 + w });
      tl.run(lt);
      /* le lion passe devant la nuit */
      if (lion.nextSibling !== null && lt >= 21.3) g.appendChild(lion); else if (lt < 21.3 && lion.nextSibling === null) g.insertBefore(lion, night);
    };
  }, 8);

  /* ---------------------------------------------------------------- scène, transitions, temps */
  var svg = document.getElementById('film');
  var defs = el('defs', {}, svg);
  var gn = el('radialGradient', { id: 'gNight', cx: '50%', cy: '42%', r: '75%' }, defs);
  el('stop', { offset: '0', 'stop-color': '#2b3463' }, gn); el('stop', { offset: '1', 'stop-color': '#141933' }, gn);
  var gg = el('radialGradient', { id: 'gGlow' }, defs);
  el('stop', { offset: '0', 'stop-color': C.gold, 'stop-opacity': .32 }, gg); el('stop', { offset: '1', 'stop-color': C.gold, 'stop-opacity': 0 }, gg);
  var BG = { night: 'url(#gNight)', paper: C.paper };
  var bg = el('rect', { width: W, height: H }, svg);
  var stage = el('g', {}, svg);

  /* Transition : le drapeau civil (art. 7 bis) se monte sur la fin d'une scène, reste un instant plein cadre,
     puis s'en va vers la droite et découvre la scène suivante ; aucun texte. Couleurs du drapeau lui-même
     (docs/canon/couleurs-symboles.md : éléments dérivés du drapeau). */
  var FL = { red: '#C90505', navy: '#0E347F' }, FI = .75, FO = .9, RW = 240, BH = H / 3;
  var flag = el('g', { style: 'display:none' }, svg);
  var fband = [el('g', {}, flag), el('g', {}, flag), el('g', {}, flag)];
  el('rect', { y: -1, width: W, height: BH + 2, fill: FL.navy }, fband[0]);
  el('rect', { y: BH, width: W, height: BH, fill: '#FFFFFF' }, fband[1]);
  el('rect', { y: 2 * BH - 1, width: W, height: BH + 2, fill: FL.navy }, fband[2]);
  var fred = el('rect', { width: RW, height: H, fill: FL.red }, flag);
  function drawFlag(u, sc) {
    flag.style.display = '';
    var tx = [0, 0, 0], ry = 0, rx = 0;
    if (u < 0) {
      var p = (u + FI) / FI;
      tx = tx.map(function (z, k) { return -W * (1 - E.io(P(p, k * .13, .62))); });
      ry = -H * (1 - E.out(P(p, .32, .68)));
    } else if (u >= sc.lead) {
      var q = (u - sc.lead) / FO;
      tx = tx.map(function (z, k) { return W * E.io(P(q, k * .1, .62)); });
      rx = (W + 20) * E.io(P(q, .22, .78));
    }
    fband.forEach(function (b, k) { b.setAttribute('transform', 'translate(' + tx[k].toFixed(1) + ',0)'); });
    fred.setAttribute('transform', 'translate(' + rx.toFixed(1) + ',' + ry.toFixed(1) + ')');
  }

  var START = [], DUR = 0, NUM = {};
  SC.forEach(function (s) { START.push(DUR); DUR += s.lead + s.dur; if (s.chap) NUM[s.id] = s.chap; });
  var cur = -1, upd = null;
  function seek(t) {
    t = clamp(t, 0, DUR - 1e-6);
    var i = 0;
    while (i < SC.length - 1 && t >= START[i + 1]) i++;
    if (i !== cur) {
      stage.textContent = '';
      bg.setAttribute('fill', BG[SC[i].bg]);
      upd = SC[i].build(el('g', {}, stage));
      cur = i;
    }
    upd(t - START[i] - SC[i].lead);
    /* carton du chapitre suivant (entrée) ou du chapitre en cours (maintien, sortie) */
    var nx = i + 1 < SC.length && SC[i + 1].chap ? i + 1 : -1;
    stage.removeAttribute('transform');
    if (nx > 0 && t >= START[nx] - FI) {
      drawFlag(t - START[nx], SC[nx]);
      stage.setAttribute('transform', 'translate(' + (-60 * E.inn(P(t, START[nx] - FI, FI))).toFixed(1) + ',0)');
    } else if (SC[i].chap && t < START[i] + SC[i].lead + FO) drawFlag(t - START[i], SC[i]);
    else flag.style.display = 'none';
  }

  var ready = load().then(function () {
    var img = new Image(); img.src = LION;
    return Promise.all([img.decode().catch(function () {}),
      document.fonts.load("800 40px 'Sofia Sans Extra Condensed'"), document.fonts.load("400 20px 'Arimo'"),
      document.fonts.load("700 20px 'Arimo'")]);
  }).then(function () { return document.fonts.ready; });

  window.FILM = { duration: 0, ready: false, seek: seek, scenes: function () {
    return SC.map(function (s, i) { return { id: s.id, chap: s.chap || 0, start: START[i], card: s.lead, dur: s.dur }; }); } };
  ready.then(function () {
    FILM.duration = DUR; FILM.ready = true;
    if (RENDER) { document.body.className = 'render'; seek(+(Q.get('t') || 0)); return; }
    document.body.className = 'preview';
    var hud = document.getElementById('hud'), t0 = performance.now() - (+(Q.get('t') || 0)) * 1000, paused = false, tp = 0;
    addEventListener('keydown', function (e) {
      var now = performance.now(), t = paused ? tp : (now - t0) / 1000;
      if (e.key === ' ') { paused = !paused; tp = t; t0 = now - t * 1000; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { t = clamp(t + (e.key === 'ArrowRight' ? 5 : -5), 0, DUR); tp = t; t0 = now - t * 1000; }
    });
    (function loop() {
      var t = paused ? tp : ((performance.now() - t0) / 1000) % DUR;
      seek(t); hud.textContent = t.toFixed(2) + ' / ' + DUR + ' s · ' + SC[cur].id;
      requestAnimationFrame(loop);
    })();
  });
})();
