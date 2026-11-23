/* carte-gl.js — moteur MapLibre de la carte (#/map), chargé par portail/js/carte.js au repos ou au premier
   geste, sur cette page seulement. Repris de proto/atlas/map.js (branche claude/proto-tour-2).
   MapLibre GL JS sans fond de carte, tuile ni glyphe : seules les géométries du dépôt (geo.json,
   carte/m/<CODE>.json). Zoom sémantique : Confédération → État (communes chargées à la demande, au plus
   douze États en mémoire) → commune. Libellés HTML positionnés par map.project, polices du portail.
   Couleurs : jetons de .ca (carte.css), relus au changement de thème. ADR 2026-11-23-carte-maplibre.md. */
var CAGL = (function () {
  'use strict';
  const KEEP = 12;                                     // États dont les communes restent en mémoire

  async function create(ctx) {
    const { CARTE, by } = ctx;
    const ca = document.getElementById('ca'), container = document.getElementById('caGl'), labelsEl = document.getElementById('caLab');
    const tip = document.getElementById('caTip');
    if (!container) throw new Error('carte absente');
    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl2')) throw new Error('WebGL 2 indisponible');
    const base = document.baseURI;
    if (!document.getElementById('caMlCss')) {
      const l = document.createElement('link'); l.id = 'caMlCss'; l.rel = 'stylesheet'; l.href = new URL('vendor/maplibre-gl/maplibre-gl.css', base).href;
      await new Promise(res => { l.onload = l.onerror = res; document.head.appendChild(l); });
    }
    const [ml, geo] = await Promise.all([
      import(new URL('vendor/maplibre-gl/maplibre-gl.mjs', base).href),
      GEO && GEO.states ? GEO : fetch('data/geo.json' + DATA_V).then(r => { if (!r.ok) throw new Error('geo.json'); return r.json(); }),
    ]);
    if (!container.isConnected) throw new Error('page quittée');
    const q = geo.q, brS = CARTE.breaks.state;

    /* ---------- couleurs : jetons de .ca ---------- */
    let K = {};
    const readColors = () => {
      const cs = getComputedStyle(ca), v = n => cs.getPropertyValue(n).trim();
      K = { C: [0, 1, 2, 3, 4].map(i => v('--c' + i)), CN: v('--cn'), SEA: v('--ca-sea'), LAND: v('--ca-land'), LANDLINE: v('--ca-landline'),
        COAST: v('--ca-coast'), INK: v('--ca-ink'), GOLD: v('--ca-gold'), EDGE: v('--ca-edge') };
    };
    readColors();

    /* ---------- géométries (geo.json v2, anneaux en deltas) ---------- */
    const decRing = (flat, qq) => { let x = flat[0], y = flat[1]; const out = [[x / qq, y / qq]];
      for (let i = 2; i < flat.length; i += 2) { x += flat[i]; y += flat[i + 1]; out.push([x / qq, y / qq]); } out.push(out[0]); return out; };
    const decPolys = (g, qq) => g.map(poly => poly.map(r => decRing(r, qq)));
    const SG = {};
    const props = c => ({ c, pc: ctx.klass(ctx.valOf(c, 'pop'), brS.pop), dc: ctx.klass(ctx.valOf(c, 'dens'), brS.dens), gc: ctx.klass(ctx.valOf(c, 'gdp'), brS.gdp),
      pp: by(c).t === 'T' ? by(c).p : 'fed' });
    const feats = [...geo.states, ...geo.fed].map(x => { SG[x.c] = decPolys(x.g, q);
      return { type: 'Feature', properties: props(x.c), geometry: { type: 'MultiPolygon', coordinates: SG[x.c] } }; });
    const fc = f => ({ type: 'FeatureCollection', features: f });
    const poly = g => ({ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: decPolys(g, q) } });
    const EMPTY = fc([]);
    const key = () => ({ pop: 'pc', dens: 'dc', gdp: 'gc' }[ctx.mode()]);
    const colorExpr = k => ['match', ['get', k], 0, K.C[0], 1, K.C[1], 2, K.C[2], 3, K.C[3], 4, K.C[4], K.CN];

    /* ---------- cadrage : le même que la silhouette (boîte de .ca-sil, carte.css) ---------- */
    function pad() {
      const s = document.getElementById('caSil'), r = ca.getBoundingClientRect(), b = s ? s.getBoundingClientRect() : r;
      const p = { top: b.top - r.top, left: b.left - r.left, right: r.right - b.right, bottom: r.bottom - b.bottom };
      for (const k in p) p[k] = Math.max(8, Math.round(p[k]));
      return p;
    }
    const B = CARTE.bounds;
    const map = new ml.Map({
      container, attributionControl: false, keyboard: false, dragRotate: false, pitchWithRotate: false, touchPitch: false,
      renderWorldCopies: false, fadeDuration: 0, minZoom: 2.6, maxZoom: 11.6, maxBounds: [[-25, 20], [70, 64]],
      bounds: [[B[0], B[1]], [B[2], B[3]]], fitBoundsOptions: { padding: pad() },
      style: { version: 8, projection: { type: 'mercator' }, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': K.SEA } }] },
    });
    map.touchZoomRotate.disableRotation();
    const gsrc = n => map.getSource(n) || { setData() {} };
    const cv = map.getCanvas(); cv.tabIndex = -1; cv.removeAttribute('aria-label'); cv.removeAttribute('role');
    await new Promise((res, rej) => { map.once('load', res); map.once('error', e => rej(e.error || e)); });

    /* seuils sémantiques relatifs au cadrage d'ensemble : ils valent pour 375 px comme pour 1440 px */
    let Z0, ZA, ZB, Z1, Z2;
    function thresholds() {
      const cam = map.cameraForBounds([[B[0], B[1]], [B[2], B[3]]], { padding: pad() });
      Z0 = cam ? cam.zoom : 5; ZA = Z0 + 0.55; ZB = Z0 + 1.15; Z1 = Z0 + 0.85; Z2 = Z0 + 3.1;
      map.setMaxZoom(Math.min(11.6, Z0 + 5.4));      // pas de zoom dans le vide : au plus l'échelle d'une commune
    }
    thresholds();
    /* une seule échelle peinte à la fois : au niveau des communes, un État non encore révélé passe en gris */
    let level = 0;
    const opFill = () => ['coalesce', ['feature-state', 'o'], 0];
    const opLine = () => ['*', 0.85, ['coalesce', ['feature-state', 'o'], 0]];
    const opState = a => ['case', ['boolean', ['feature-state', 'm'], false], 0, a];
    const stateColor = () => (level >= 1 && ctx.mode() !== 'gdp') ? K.CN : colorExpr(key());

    /* hachure des territoires occupés (motif généré, non figuratif) */
    (() => {
      const n = 8, d = new Uint8ClampedArray(n * n * 4), rgb = [153, 64, 47];
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if ((x + y) % n < 2) { const i = (y * n + x) * 4; d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 150; }
      map.addImage('hatch', { width: n, height: n, data: d });
    })();
    map.addSource('far', { type: 'geojson', data: poly(geo.far) });
    map.addSource('land', { type: 'geojson', data: fc(geo.land.map(l => poly(l.g))) });
    map.addSource('borders', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString',
      coordinates: geo.borders.map(b => { const r = decPolys([[b]], q)[0][0]; r.pop(); return r; }) } } });
    map.addSource('occ', { type: 'geojson', data: fc(geo.occupied.map(o => poly(o.g))) });
    map.addSource('states', { type: 'geojson', data: fc(feats), promoteId: 'c', tolerance: 0.25 });
    for (const s of ['sel', 'cur', 'hov', 'mask']) map.addSource(s, { type: 'geojson', data: EMPTY });
    const lineW = (a, b) => ['interpolate', ['linear'], ['zoom'], 4, a, 10, b];
    const desk = () => !ctx.mobile();
    [
      { id: 'far', type: 'fill', source: 'far', paint: { 'fill-color': K.LAND, 'fill-outline-color': K.COAST } },
      { id: 'land', type: 'fill', source: 'land', paint: { 'fill-color': K.LAND, 'fill-outline-color': K.COAST } },
      { id: 'borders', type: 'line', source: 'borders', paint: { 'line-color': K.LANDLINE, 'line-width': 1 } },
      { id: 'occ', type: 'fill', source: 'occ', paint: { 'fill-pattern': 'hatch' } },
      { id: 'occ-l', type: 'line', source: 'occ', paint: { 'line-color': '#99402F', 'line-width': 0.7, 'line-opacity': 0.55 } },
      { id: 'states-fill', type: 'fill', source: 'states', paint: { 'fill-color': colorExpr(key()), 'fill-opacity': opState(1) } },
      { id: 'states-x', type: 'fill', source: 'states', paint: { 'fill-color': colorExpr(key()), 'fill-opacity': 0 } },
      { id: 'states-line', type: 'line', source: 'states', layout: { 'line-join': 'round' }, paint: { 'line-color': K.EDGE, 'line-width': lineW(0.7, 1.6), 'line-opacity': opState(1) } },
      { id: 'pdim', type: 'fill', source: 'states', filter: ['==', ['get', 'pp'], '-'], paint: { 'fill-color': K.SEA, 'fill-opacity': 0.78 } },
      { id: 'mask', type: 'fill', source: 'mask', paint: { 'fill-color': K.SEA, 'fill-opacity': 0, 'fill-opacity-transition': { duration: 500 } } },
      { id: 'sel-case', type: 'line', source: 'sel', layout: { 'line-join': 'round' }, paint: { 'line-color': K.EDGE, 'line-width': desk() ? 5.5 : 3.6, 'line-opacity': 0.95 } },
      { id: 'sel', type: 'line', source: 'sel', layout: { 'line-join': 'round' }, paint: { 'line-color': K.INK, 'line-width': desk() ? 2.4 : 1.5 } },
      { id: 'hov', type: 'line', source: 'hov', layout: { 'line-join': 'round' }, paint: { 'line-color': K.INK, 'line-width': 1.6 } },
      { id: 'cur-case', type: 'line', source: 'cur', layout: { 'line-join': 'round' }, paint: { 'line-color': K.INK, 'line-width': 6.5 } },
      { id: 'cur', type: 'line', source: 'cur', layout: { 'line-join': 'round' }, paint: { 'line-color': K.GOLD, 'line-width': 3.5 } },
    ].forEach(l => map.addLayer(l));

    /* ---------- communes : un fichier par État, chargé quand on zoome dessus ---------- */
    let dead = false;                                  // contexte WebGL perdu : plus aucune écriture de style
    map.on('webglcontextlost', () => { dead = true; });
    map.on('webglcontextrestored', () => { dead = false; });
    const loaded = {}, rev = {}, used = {};            // code -> données ; 0 | 1 (en cours) | 2 (révélé) ; dernier usage
    const munColor = () => ['match', ['get', key()], 0, K.C[0], 1, K.C[1], 2, K.C[2], 3, K.C[3], 4, K.C[4], K.CN];
    const coordsOf = (d, m) => m.coords || (m.coords = decPolys(m.g, d.q));
    async function ensureMun(code) {
      used[code] = performance.now();
      if (loaded[code]) return loaded[code];
      const d = await ctx.loadMun(code);
      if (loaded[code] || dead || !map.getLayer('states-line')) return d;
      if (!d.frag2) { d.frag2 = decPolys(d.f, d.q); d.outline = d.o.map(r => decRing(r, d.q)); }
      const f = d.m.map(m => ({ type: 'Feature', properties: { s: m.s, c: code, pc: m.pc, dc: m.dc, gc: m.gc }, geometry: { type: 'MultiPolygon', coordinates: coordsOf(d, m) } }));
      d.frag2.forEach((p, i) => f.push({ type: 'Feature', properties: { s: '~' + i, c: code, frag: 1, pc: 0, dc: 0, gc: d.gc }, geometry: { type: 'Polygon', coordinates: p } }));
      map.addSource('m-' + code, { type: 'geojson', data: fc(f), promoteId: 's', tolerance: 0.2 });
      map.addSource('o-' + code, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: d.outline } }, tolerance: 0.2 });
      map.addLayer({ id: 'mf-' + code, type: 'fill', source: 'm-' + code, paint: { 'fill-color': munColor(), 'fill-opacity': opFill(), 'fill-antialias': false } }, 'states-line');
      map.addLayer({ id: 'ml-' + code, type: 'line', source: 'm-' + code, filter: ['!', ['has', 'frag']], layout: { 'line-join': 'round' },
        paint: { 'line-color': K.EDGE, 'line-width': ['interpolate', ['linear'], ['zoom'], ZA, 0.3, ZA + 3.5, 1.1], 'line-opacity': opLine() } }, 'states-line');
      map.addLayer({ id: 'mo-' + code, type: 'line', source: 'o-' + code, layout: { 'line-join': 'round' },
        paint: { 'line-color': K.INK, 'line-width': ['interpolate', ['linear'], ['zoom'], ZA, 0.5, ZA + 3.5, 1.9], 'line-opacity': level >= 1 ? 0.62 : 0, 'line-opacity-transition': { duration: 400 } } }, 'pdim');
      loaded[code] = d; rev[code] = 0;
      prune();
      return d;
    }
    /* mémoire : au-delà de KEEP États, les communes les moins récemment vues et hors champ sont retirées */
    function prune() {
      const codes = Object.keys(loaded); if (codes.length <= KEEP) return;
      const R = ctx.R(), b = map.getBounds();
      codes.filter(c => c !== R.c && !bbHit(CARTE.e[c].bb, b)).sort((a, c) => used[a] - used[c]).slice(0, codes.length - KEEP).forEach(c => {
        for (const id of ['mf-', 'ml-', 'mo-']) if (map.getLayer(id + c)) map.removeLayer(id + c);
        for (const id of ['m-', 'o-']) if (map.getSource(id + c)) map.removeSource(id + c);
        map.setFeatureState({ source: 'states', id: c }, { m: false });
        if (MU[c]) { MU[c].forEach(it => { if (it.el) it.el.remove(); active.delete(it); }); delete MU[c]; }
        delete loaded[c]; delete rev[c];
      });
    }
    /* signature : les limites communales se dessinent de proche en proche depuis un point */
    let lastOrigin = null;
    function reveal(code, origin) {
      const d = loaded[code]; if (!d || rev[code] || dead) return;
      rev[code] = 1;
      const src = 'm-' + code, ids = d.m.map(m => [m.s, m.pt]).concat(d.frag2.map((p, i) => ['~' + i, p[0][0]]));
      const fin = () => { rev[code] = 2; map.setFeatureState({ source: 'states', id: code }, { m: true }); layoutSoon(); };
      if (ctx.reduced()) { ids.forEach(([id]) => map.setFeatureState({ source: src, id }, { o: 1 })); fin(); return; }
      const o = origin || CARTE.e[code].pt, k = Math.cos(o[1] * Math.PI / 180);
      const items = ids.map(([id, pt]) => ({ id, d: Math.hypot((pt[0] - o[0]) * k, pt[1] - o[1]), o: 0 }));
      const max = Math.max(...items.map(i => i.d)) || 1, SPREAD = 760, FADE = 300, t0 = performance.now();
      items.forEach(i => { i.t = SPREAD * Math.pow(i.d / max, 0.8); if (d.by[i.id]) d.by[i.id]._t = t0 + i.t; });
      const step = now => {
        if (rev[code] !== 1 || dead || !map.getSource(src)) return;
        const el = now - t0; let done = true;
        for (const i of items) {
          if (i.o >= 1) continue;
          const v = Math.max(0, Math.min(1, (el - i.t) / FADE));
          if (v !== i.o) { i.o = v; map.setFeatureState({ source: src, id: i.id }, { o: v }); }
          if (v < 1) done = false;
        }
        if (done) fin(); else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function unreveal(code) { if (rev[code]) { rev[code] = 0; map.removeFeatureState({ source: 'm-' + code }); map.setFeatureState({ source: 'states', id: code }, { m: false }); } }
    const bbHit = (bb, b) => !(bb[2] < b.getWest() || bb[0] > b.getEast() || bb[3] < b.getSouth() || bb[1] > b.getNorth());

    /* fondu d'échelle : l'ancienne teinte reste un instant au-dessus de la nouvelle */
    let _lastState = colorExpr(key());
    function repaintStates() {
      const next = stateColor();
      if (!ctx.reduced()) {
        map.setPaintProperty('states-x', 'fill-opacity-transition', { duration: 0 });
        map.setPaintProperty('states-x', 'fill-color', _lastState);
        map.setPaintProperty('states-x', 'fill-opacity', 1);
        setTimeout(() => { if (!dead) { map.setPaintProperty('states-x', 'fill-opacity-transition', { duration: 480 }); map.setPaintProperty('states-x', 'fill-opacity', 0); } }, 40);
      }
      map.setPaintProperty('states-fill', 'fill-color', next); _lastState = next;
    }
    function semantic() {
      if (dead) return;
      const z = map.getZoom(), b = map.getBounds(), c = map.getCenter();
      const l = z < (level >= 1 ? Z1 - 0.2 : Z1) ? 0 : z < Z2 ? 1 : 2;
      if (l !== level) {
        const was = level; level = l; ctx.onLevel(l);
        if ((was === 0) !== (l === 0)) {
          repaintStates();
          for (const code in loaded) map.setPaintProperty('mo-' + code, 'line-opacity', l >= 1 ? 0.62 : 0);
          if (l === 0) for (const code in loaded) unreveal(code);
        }
      }
      if (z >= Z1 - 0.6) {
        const want = STATES.filter(s => !loaded[s.c] && bbHit(CARTE.e[s.c].bb, b))
          .sort((a, d) => Math.hypot(CARTE.e[a.c].pt[0] - c.lng, CARTE.e[a.c].pt[1] - c.lat) - Math.hypot(CARTE.e[d.c].pt[0] - c.lng, CARTE.e[d.c].pt[1] - c.lat)).slice(0, 8);
        want.forEach(s => ensureMun(s.c).then(() => { if (level >= 1) reveal(s.c, lastOrigin || [map.getCenter().lng, map.getCenter().lat]); layoutSoon(); semanticSoon(); }).catch(() => {}));
      }
      for (const code in loaded) {
        if (bbHit(CARTE.e[code].bb, b)) used[code] = performance.now();
        if (level >= 1 && !rev[code] && bbHit(CARTE.e[code].bb, b)) reveal(code, lastOrigin || [c.lng, c.lat]);
      }
    }

    /* ---------- libellés HTML ---------- */
    const ST = STATES.map(s => ({ kind: 'st', s, pt: CARTE.e[s.c].pt, el: null, on: false, v: '' }));
    const MU = {};
    const sizeCache = new Map();
    function mkEl(cls, h) { const el = document.createElement('div'); el.className = 'lb ' + cls; el.innerHTML = h; labelsEl.appendChild(el); return el; }
    function size(cls, h) {
      const k = cls + '|' + h; let s = sizeCache.get(k);
      if (!s) { const el = mkEl(cls, h); s = [el.offsetWidth, el.offsetHeight]; el.remove(); sizeCache.set(k, s); }
      return s;
    }
    const e = s => esc(ctx.sc(s));
    function variants(it) {
      if (it.kind === 'st') {
        const s = it.s;
        if (s.t !== 'T') return [['cap' + (s.t === 'M' ? ' m' : ''), e(s.n), 'l']];
        if (level >= 1) return [['st wm', e(s.n), 'c']];
        const dk = ctx.klass(ctx.valOf(s.c, ctx.mode()), brS[ctx.mode()]) >= 3 ? ' dk' : '';
        return [['st' + dk, e(s.n), 'c'], ['st' + dk, s.k, 'c']];
      }
      const m = it.m, cl = (m[key()] >= 3 ? ' dk' : '') + (m.seat ? ' ca-ch' : '') + (level >= 2 ? ' big' : '');
      const nm = `<b>${e(m.n)}</b>`, fig = level >= 2 && m.dens != null
        ? `<small>${fmtN(m.p)} · ${e(L`${fmtN(Math.round(m.dens))} / km²`)}</small>` : `<small>${fmtN(m.p)}</small>`;
      return it.rich ? [['mu' + cl, nm + fig, 'c'], ['mu' + cl, nm, 'c']] : [['mu' + cl, nm, 'c']];
    }
    let boxes = [];
    const hit = a => boxes.some(b => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]);
    function tryPlace(it, p, free) {
      for (const [cls, h, anchor] of variants(it)) {
        const [w, ht] = size(cls, h);
        const g = desk() ? 3 : 5, x0 = anchor === 'l' ? p.x - 6 : p.x - w / 2, box = [x0 - g, p.y - ht / 2 - g + 1, x0 + w + g, p.y + ht / 2 + g - 1];
        if (free || !hit(box)) {
          if (!free) boxes.push(box);
          const v = cls + '|' + h;
          if (!it.el) { it.el = mkEl(cls, h); it.v = v; if (it.kind === 'st') it.el.dataset.c = it.s.c; }
          else if (it.v !== v) { it.el.className = 'lb ' + cls + (it.on ? ' on' : ''); it.el.innerHTML = h; it.v = v; }
          it.anchor = anchor;
          return true;
        }
      }
      return false;
    }
    let active = new Set(), _lay = 0, _layT = 0;
    function layoutSoon() { if (!_lay) _lay = requestAnimationFrame(() => { _lay = 0; layout(); }); }
    function layout() {
      if (dead || !labelsEl.isConnected) return;
      _layT = performance.now();
      const W = container.clientWidth, H = container.clientHeight, z = map.getZoom(), next = new Set(), now = performance.now(), R = ctx.R();
      boxes = ctx.obstacles();
      const vis = p => p.x > -40 && p.x < W + 40 && p.y > -20 && p.y < H + 20;
      const put = (it, free) => { const p = map.project(it.pt); if (!vis(p)) return false; if (tryPlace(it, p, free)) { next.add(it); return true; } return false; };
      const P = ctx.people();
      const keep = s => !P || (P === 'fed' ? s.t !== 'T' : s.p === P);
      ST.filter(it => it.s.t === 'F' && keep(it.s)).forEach(it => put(it));
      ST.filter(it => it.s.t === 'M' && keep(it.s)).forEach(it => { if (z > Z0 + 0.4 || desk()) put(it); });
      if (level === 0) ST.filter(it => it.s.t === 'T' && keep(it.s)).sort((a, b) => (b.s.c === R.c) - (a.s.c === R.c) || (ctx.valOf(b.s.c, 'pop') || 0) - (ctx.valOf(a.s.c, 'pop') || 0)).forEach(it => put(it));
      else {
        if (level === 1) ST.filter(it => it.s.t === 'T' && keep(it.s) && !(rev[it.s.c] && it.s.c === R.c)).forEach(it => {
          const bb = CARTE.e[it.s.c].bb, a = map.project([bb[0], bb[1]]), b = map.project([bb[2], bb[3]]);
          const [w] = size('st wm', e(it.s.n));
          if (b.x - a.x > w * 1.5 && a.y - b.y > 70) put(it);
        });
        const cand = [];
        for (const code in loaded) {
          if (!rev[code] || !bbHit(CARTE.e[code].bb, map.getBounds())) continue;
          if (by(code).t !== 'T' && loaded[code].m.length === 1) continue;      // ville-État d'un seul contour : son étiquette de capitale suffit
          if (P && !keep(by(code))) continue;
          if (!MU[code]) MU[code] = loaded[code].m.map(m => ({ kind: 'mu', m, pt: m.pt, el: null, on: false, v: '' }));
          for (const it of MU[code]) { if (it.m._t && it.m._t > now) continue; cand.push(it); }
        }
        const selS = R.v === 'mun' ? R.s : null, curS = cursor && cursor.s;
        cand.sort((a, b) => ((b.m.s === selS && b.m.c === R.c) - (a.m.s === selS && a.m.c === R.c)) || ((b.m.s === curS) - (a.m.s === curS)) || ((b.m.c === R.c) - (a.m.c === R.c)) || b.m.p - a.m.p);
        let n = 0, tests = 0;
        const cap = desk() ? 90 : 22;
        for (const it of cand) {
          if (n >= cap || tests > 420) break;
          const p = map.project(it.pt); if (!vis(p)) continue;
          tests++; it.rich = level >= 2 || n < (desk() ? 16 : 6);
          if (tryPlace(it, p)) { next.add(it); n++; }
        }
      }
      for (const it of active) if (!next.has(it)) { it.on = false; it.off = now; if (it.el) it.el.classList.remove('on'); }
      for (const it of next) if (!it.on) { it.on = true; const el = it.el; requestAnimationFrame(() => el.classList.add('on')); }
      for (const code in MU) for (const it of MU[code]) if (it.el && !it.on && now - (it.off || 0) > 500) { it.el.remove(); it.el = null; it.v = ''; }
      for (const it of ST) if (it.el && !it.on && now - (it.off || 0) > 500) { it.el.remove(); it.el = null; it.v = ''; }
      active = next;
      position();
    }
    function position() {
      for (const it of active) {
        if (!it.el) continue;
        const p = map.project(it.pt);
        it.el.style.transform = it.anchor === 'l' ? `translate(${Math.round(p.x - 5)}px,${Math.round(p.y)}px) translate(0,-50%)`
          : `translate(${Math.round(p.x)}px,${Math.round(p.y)}px) translate(-50%,-50%)`;
      }
    }
    let _sem = 0;
    function semanticSoon() { if (!_sem) _sem = setTimeout(() => { _sem = 0; semantic(); }, 90); }
    map.on('move', () => { position(); if (performance.now() - _layT > 130) layout(); semanticSoon(); });
    map.on('moveend', () => { semantic(); layout(); });

    /* ---------- pointeur ---------- */
    function pick(point) {
      const layers = ['states-fill'];
      if (level >= 1) for (const code in loaded) if (rev[code]) layers.unshift('mf-' + code);
      const f = map.queryRenderedFeatures(point, { layers });
      if (!f.length) return null;
      const m = f.find(x => x.layer.id !== 'states-fill' && !x.properties.frag);
      if (m) return { c: m.properties.c, s: m.properties.s };
      const s = f.find(x => x.properties.c);
      return s ? { c: s.properties.c } : null;
    }
    const geomOf = id => !id ? null : id.s ? (loaded[id.c] && loaded[id.c].by[id.s] ? coordsOf(loaded[id.c], loaded[id.c].by[id.s]) : null) : SG[id.c];
    const feat = id => { const g = geomOf(id); return g ? { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: g } } : EMPTY; };
    let hov = null, cursor = null, tipMute = null;
    const same = (a, b) => (!a && !b) || (a && b && a.c === b.c && (a.s || '') === (b.s || ''));
    map.on('mousemove', ev => {
      if (tipMute && Math.hypot(ev.point.x - tipMute.x, ev.point.y - tipMute.y) < 14) return;
      tipMute = null;
      const id = pick(ev.point);
      if (!same(id, hov)) { hov = id; gsrc('hov').setData(feat(id)); map.getCanvas().style.cursor = id ? 'pointer' : ''; }
      if (!id || ctx.mobile()) { tip.hidden = true; return; }
      const s = by(id.c), m = id.s && loaded[id.c].by[id.s], mode = ctx.mode();
      const val = m ? (mode === 'gdp' ? ctx.valLab(ctx.valOf(id.c, 'gdp'), 'gdp') : ctx.valLab(mode === 'pop' ? m.p : m.dens, mode)) : ctx.valLab(ctx.valOf(id.c, mode), mode);
      tip.innerHTML = `<b>${e(m ? m.n : s.n)}${m ? '' : `<code translate="no">${s.c}</code>`}</b><span>${e(m ? s.n + ' · ' : '')}${e(val)}</span>`;
      tip.hidden = false;
      const r = tip.getBoundingClientRect();
      tip.style.left = Math.min(innerWidth - r.width - 8, ev.originalEvent.clientX + 14) + 'px';
      tip.style.top = Math.max(8, ev.originalEvent.clientY - r.height - 12) + 'px';
    });
    map.on('mouseout', () => { tip.hidden = true; hov = null; gsrc('hov').setData(EMPTY); });
    map.on('click', ev => { const id = pick(ev.point); if (!id) return; lastOrigin = [ev.lngLat.lng, ev.lngLat.lat]; tip.hidden = true; tipMute = ev.point; ctx.onPick(id); });
    map.on('dragstart', () => { tip.hidden = true; });

    /* ---------- caméra ---------- */
    function cut() { ca.classList.remove('ca-cut'); void ca.offsetWidth; ca.classList.add('ca-cut'); setTimeout(() => ca.classList.remove('ca-cut'), 260); }
    function fit(bb, maxZoom, instant, dur) {
      const o = { padding: pad(), maxZoom: maxZoom || 11.2 };
      if (instant || ctx.reduced()) { if (!instant) cut(); map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { ...o, animate: false }); }
      else {
        const cam = map.cameraForBounds([[bb[0], bb[1]], [bb[2], bb[3]]], o), c0 = map.getCenter();
        const dz = cam ? Math.abs(cam.zoom - map.getZoom()) : 2, dd = cam ? Math.hypot(cam.center.lng - c0.lng, cam.center.lat - c0.lat) : 2;
        map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { ...o, linear: false, curve: 1.3, duration: dur || Math.max(900, Math.min(2400, 850 + 420 * dz + 140 * dd)), essential: true });
      }
    }
    const bbOf = coords => { let w = 180, s = 90, e2 = -180, n = -90; for (const p of coords) for (const pt of p[0]) { if (pt[0] < w) w = pt[0]; if (pt[0] > e2) e2 = pt[0]; if (pt[1] < s) s = pt[1]; if (pt[1] > n) n = pt[1]; } return [w, s, e2, n]; };
    function maskFor(coords, a) {
      if (!coords) { map.setPaintProperty('mask', 'fill-opacity', 0); return; }
      const outer = [[-60, 10], [90, 10], [90, 75], [-60, 75], [-60, 10]];
      gsrc('mask').setData({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [outer, ...coords.map(p => p[0])] } });
      map.setPaintProperty('mask', 'fill-opacity', a);
    }
    let target = null;
    async function sync(R, o = {}) {
      if (dead) return;
      const instant = !!o.first;                       // arrivée sur la page : déjà cadrée, sans vol (ADR du mouvement)
      target = R;
      if (R.v === 'state') {
        gsrc('sel').setData(feat({ c: R.c })); maskFor(SG[R.c], 0.62);
        lastOrigin = lastOrigin || CARTE.e[R.c].pt;
        ensureMun(R.c).then(() => { if (target === R) { semantic(); layoutSoon(); } }).catch(() => {});
        fit(CARTE.e[R.c].bb, Z0 + 4.2, instant);
      } else if (R.v === 'mun') {
        let d; try { d = await ensureMun(R.c); } catch (e) { return; }
        if (target !== R || !d.by[R.s]) return;
        const m = d.by[R.s], c = coordsOf(d, m);
        gsrc('sel').setData(feat({ c: R.c, s: R.s })); maskFor(c, 0.6);
        const bb = bbOf(c), dx = (bb[2] - bb[0]) * 0.35, dy = (bb[3] - bb[1]) * 0.35;
        lastOrigin = m.pt;
        fit([bb[0] - dx, bb[1] - dy, bb[2] + dx, bb[3] + dy], Z0 + 5.2, instant);
      } else {
        gsrc('sel').setData(EMPTY); maskFor(null);
        if (!o.first) fit(B, Z0 + 0.01, false);
      }
      layoutSoon();
    }
    function setCursor(id, soft) {
      cursor = id;
      if (id && id.s && !loaded[id.c]) { gsrc('cur').setData(EMPTY); return; }
      gsrc('cur').setData(feat(id));
      if (id && !soft) {
        const g = geomOf(id); if (!g) return;
        const bb = bbOf(g), p = pad(), a = map.project([bb[0], bb[3]]), c = map.project([bb[2], bb[1]]);
        if (a.x < p.left || c.x > container.clientWidth - p.right || a.y < p.top || c.y > container.clientHeight - p.bottom)
          map.easeTo({ center: [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2], padding: p, duration: ctx.reduced() ? 0 : 420, essential: true });
      }
      layoutSoon();
    }
    function setMode() {
      if (dead) return;
      repaintStates();
      const b = map.getBounds();
      for (const code in loaded) {
        const id = 'mf-' + code, old = map.getPaintProperty(id, 'fill-color');
        if (!ctx.reduced() && rev[code] === 2 && bbHit(CARTE.e[code].bb, b) && !map.getLayer(id + 'x')) {
          map.addLayer({ id: id + 'x', type: 'fill', source: 'm-' + code, paint: { 'fill-color': old, 'fill-opacity': 1, 'fill-opacity-transition': { duration: 480 }, 'fill-antialias': false } }, 'ml-' + code);
          setTimeout(() => map.getLayer(id + 'x') && map.setPaintProperty(id + 'x', 'fill-opacity', 0), 40);
          setTimeout(() => map.getLayer(id + 'x') && map.removeLayer(id + 'x'), 620);
        }
        map.setPaintProperty(id, 'fill-color', munColor());
      }
      layout();
    }
    /* filtre par peuple : une seule teinte, les autres États estompés */
    function setPeople(P) {
      if (dead) return;
      map.setFilter('pdim', P ? ['!=', ['get', 'pp'], P] : ['==', ['get', 'pp'], '-']);   // pp : peuple de l'État, « fed » pour les entités confédérales
      layout();
    }
    function relabel() {
      sizeCache.clear();
      for (const it of [...ST, ...Object.values(MU).flat()]) { if (it.el) it.el.remove(); it.el = null; it.on = false; it.v = ''; }
      active = new Set();
      layout();
    }
    let _rp = 0;
    function repad() {
      clearTimeout(_rp);
      _rp = setTimeout(() => { if (dead || !container.isConnected) return; map.resize(); thresholds(); if (target) sync(target, {}); else layout(); }, 260);
    }
    /* thème du portail : jetons relus, couleurs réappliquées */
    function theme() {
      if (dead) return;
      readColors();
      map.setPaintProperty('bg', 'background-color', K.SEA);
      for (const id of ['far', 'land']) { map.setPaintProperty(id, 'fill-color', K.LAND); map.setPaintProperty(id, 'fill-outline-color', K.COAST); }
      map.setPaintProperty('borders', 'line-color', K.LANDLINE);
      map.setPaintProperty('states-line', 'line-color', K.EDGE);
      map.setPaintProperty('sel-case', 'line-color', K.EDGE);
      for (const id of ['sel', 'hov', 'cur-case']) map.setPaintProperty(id, 'line-color', K.INK);
      map.setPaintProperty('cur', 'line-color', K.GOLD);
      map.setPaintProperty('mask', 'fill-color', K.SEA);
      map.setPaintProperty('pdim', 'fill-color', K.SEA);
      _lastState = stateColor(); map.setPaintProperty('states-fill', 'fill-color', _lastState);
      for (const code in loaded) { map.setPaintProperty('mf-' + code, 'fill-color', munColor()); map.setPaintProperty('ml-' + code, 'line-color', K.EDGE); map.setPaintProperty('mo-' + code, 'line-color', K.INK); }
    }
    const api = {
      sync, setCursor, setMode, setPeople, relabel, repad, theme,
      home() { fit(B, Z0 + 0.01); },
      zoom(d) { if (!d) { fit(target && target.v === 'state' ? CARTE.e[target.c].bb : B, target && target.v === 'state' ? Z0 + 4.2 : Z0 + 0.01); return; }
        map.easeTo({ zoom: map.getZoom() + d, duration: ctx.reduced() ? 0 : 320, essential: true }); },
      zoomAt(pt, dir) { map.easeTo({ zoom: map.getZoom() + dir * 0.9, around: map.unproject(pt), duration: ctx.reduced() ? 0 : 520, essential: true }); },
      wake() { map.resize(); semantic(); layout(); },
      level: () => level,
      remove() { dead = true; clearTimeout(_rp); clearTimeout(_sem); try { map.remove(); } catch (err) {} labelsEl.innerHTML = ''; },
      map,
    };
    await new Promise(res => { if (map.loaded()) res(); else map.once('idle', res); });
    semantic(); layout();
    return api;
  }
  return { create };
})();
