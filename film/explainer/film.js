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
    ink: '#1b2030', ink2: '#545b6c', ink3: '#878d9b', paper: '#F6F4EE', paper2: '#E9E6DC',
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
  function rgb(h) {
    if (h.charAt(0) !== '#') return h.match(/[\d.]+/g).slice(0, 3).map(Number);
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
      get('../../portail/data/peuples.json'), get('../../portail/data/stats.json')]).then(function (r) {
      D.map = r[0]; D.etats = r[1]; D.peuples = r[2]; D.stats = r[3];
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
  function scene(id, dur, bg, build) { SC.push({ id: id, dur: dur, bg: bg, build: build }); }

  /* 0. Ouverture */
  scene('intro', 11, 'night', function (g) {
    var tl = TL(), T = X.intro;
    var glow = el('circle', { cx: 640, cy: 226, r: 210, fill: 'url(#gGlow)' }, g);
    var lg = el('g', {}, g);
    el('image', { href: LION, x: -115, y: -102, width: 230, height: 204 }, lg);
    var eb = tl.g(g, 1.4, null, { dy: 0 });
    var ebt = txt(eb, T.eyebrow, 640, 398, { font: FD, size: 24, weight: 700, fill: C.gold, anchor: 'middle', ls: 6 });
    txt(tl.g(g, 2.0, null, { dy: 26 }), T.title, 640, 502, { font: FD, size: 96, weight: 800, fill: '#fff', anchor: 'middle' });
    txt(tl.g(g, 2.7, null, { dy: 20 }), T.sub, 640, 560, { font: FD, size: 48, weight: 600, fill: C.gold, anchor: 'middle' });
    var line = el('line', { x1: 640, x2: 640, y1: 604, y2: 604, stroke: C.gold, 'stroke-width': 1.2, opacity: .7 }, g);
    var mo = tl.g(g, 5.2, null, { dy: 10 });
    var mt = el('text', { x: 640, y: 652, 'text-anchor': 'middle' }, mo);
    el('tspan', { 'font-family': FD, 'font-size': 34, 'font-weight': 700, fill: C.gold }, mt, T.motto);
    el('tspan', { dx: 16, 'font-family': FB, 'font-size': 20, fill: 'rgba(255,255,255,.78)' }, mt, T.mottoEn);
    return function (lt) {
      var p = E.out(P(lt, .2, 1.8));
      set(lg, { transform: 'translate(640,226) scale(' + (.86 + .1 * p + .03 * P(lt, 2, 9)).toFixed(4) + ')', opacity: p.toFixed(3) });
      set(glow, { opacity: (.8 * E.out(P(lt, .6, 2.4))).toFixed(3), r: (200 + 14 * P(lt, 0, 11)).toFixed(1) });
      ebt.setAttribute('letter-spacing', lerp(18, 6, E.out(P(lt, 1.4, 1.6))).toFixed(2));
      var w = 130 * E.io(P(lt, 4.7, 1));
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
        if (m.t === 'F') base = mix(base, C.gold, E.out(P(lt, CA + caps.indexOf(c) * CS, .6)));
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
  });

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
  var wipe = el('g', { style: 'display:none' }, svg);
  var wpanel = el('rect', { width: W, height: H }, wipe);
  el('rect', { x: W, width: 128, height: H, fill: C.gules }, wipe);
  var WD = .62;

  var START = [], DUR = 0;
  SC.forEach(function (s) { START.push(DUR); DUR += s.dur; });
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
    upd(t - START[i]);
    /* transition : le panneau de la scène suivante entre par la gauche, bande de gueules en tête */
    var nx = i + 1 < SC.length ? START[i + 1] : Infinity, p = P(t, nx - WD, WD);
    if (p > 0 && p < 1) {
      wipe.style.display = '';
      wpanel.setAttribute('fill', BG[SC[i + 1].bg]);
      wipe.setAttribute('transform', 'translate(' + (lerp(-(W + 128), 0, E.io(p))).toFixed(1) + ',0)');
      stage.setAttribute('transform', 'translate(' + (-50 * E.inn(p)).toFixed(1) + ',0)');
    } else { wipe.style.display = 'none'; stage.removeAttribute('transform'); }
  }

  var ready = load().then(function () {
    var img = new Image(); img.src = LION;
    return Promise.all([img.decode().catch(function () {}),
      document.fonts.load("800 40px 'Sofia Sans Extra Condensed'"), document.fonts.load("400 20px 'Arimo'"),
      document.fonts.load("700 20px 'Arimo'")]);
  }).then(function () { return document.fonts.ready; });

  window.FILM = { duration: 0, ready: false, seek: seek, scenes: function () {
    return SC.map(function (s, i) { return { id: s.id, start: START[i], dur: s.dur }; }); } };
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
