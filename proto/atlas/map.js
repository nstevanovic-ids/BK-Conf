/* Atlas — la carte. MapLibre GL JS sans fond de carte ni tuile : seules les géométries du dépôt.
   Zoom sémantique : Confédération -> État (communes chargées à la demande) -> commune.
   Les libellés sont des éléments HTML positionnés par map.project (polices du portail, tous les
   diacritiques et le cyrillique, sans glyphes PBF). */
import * as ml from './vendor/maplibre-gl.mjs';

const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

export async function createMap(ctx) {
  const { CORE, BY, RM, DESK } = ctx;
  if (!document.getElementById('mlcss')) {
    const l = document.createElement('link'); l.id = 'mlcss'; l.rel = 'stylesheet'; l.href = 'vendor/maplibre-gl.css';
    await new Promise(res => { l.onload = l.onerror = res; document.head.appendChild(l); });
  }
  const C = [0, 1, 2, 3, 4].map(i => css('--c' + i)), CN = css('--cn');
  const SEA = css('--sea'), LAND = css('--land'), LANDLINE = css('--landline'), COAST = css('--coast'), INK = css('--ink'), GOLD = css('--gold'), RED = css('--red');
  const geo = await fetch('data/geo.json').then(r => r.json());
  const q = geo.q, br = CORE.breaks.state;
  const stage = document.getElementById('stage'), labelsEl = document.getElementById('labels'), tip = document.getElementById('tip');
  const sheetEl = document.getElementById('sheet');

  /* ---------- géométries de la vue Confédération (geo.json v2, anneaux en deltas) ---------- */
  const SG = {};   // code -> coordonnées MultiPolygon
  const feats = [...geo.states, ...geo.fed].map(x => {
    const s = BY[x.c], coords = ctx.decPolys(x.g, q);
    SG[x.c] = coords;
    return { type: 'Feature', properties: { c: x.c, pc: ctx.klass(s.pop, br.pop), dc: ctx.klass(ctx.densOf(s), br.dens), gc: ctx.klass(s.gdp, br.gdp) },
      geometry: { type: 'MultiPolygon', coordinates: coords } };
  });
  const fc = f => ({ type: 'FeatureCollection', features: f });
  const poly = (g) => ({ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: ctx.decPolys(g, q) } });
  const EMPTY = fc([]);
  const colorExpr = (key) => ['match', ['get', key], 0, C[0], 1, C[1], 2, C[2], 3, C[3], 4, C[4], CN];
  const key = () => ({ pop: 'pc', dens: 'dc', gdp: 'gc' }[ctx.mode()]);

  /* ---------- cadrage : mêmes marges que la silhouette statique (variables CSS) ---------- */
  function pad() {
    const W = innerWidth, H = innerHeight;
    if (DESK.matches) return { top: H < 521 ? 62 : 84, right: H < 521 ? 12 : 28, bottom: H < 521 ? 60 : 104, left: Math.min(W - 320, (parseFloat(getComputedStyle(document.body).getPropertyValue('--sheet-w')) || sheetEl.offsetWidth) + 44) };
    return { top: 120, right: 14, left: 14, bottom: Math.min(H - 260, ctx.snapPx() + 8) };
  }
  function syncVars() {}
  syncVars();
  const B = CORE.bounds;
  const map = new ml.Map({
    container: 'glmap', attributionControl: false, keyboard: false, dragRotate: false, pitchWithRotate: false, touchPitch: false,
    renderWorldCopies: false, fadeDuration: 0, minZoom: 2.6, maxZoom: 11.6, maxBounds: [[-25, 20], [70, 64]],
    bounds: [[B[0], B[1]], [B[2], B[3]]], fitBoundsOptions: { padding: pad() },
    style: { version: 8, projection: { type: 'mercator' }, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': SEA } }] },
  });
  map.touchZoomRotate.disableRotation();
  /* garde : une source peut ne pas exister encore quand une vue demande sa mise à jour */
  const gsrc = n => map.getSource(n) || { setData() {} };
  const cv = map.getCanvas(); cv.tabIndex = -1; cv.removeAttribute('aria-label'); cv.removeAttribute('role');
  await new Promise(res => map.once('load', res));

  /* seuils sémantiques relatifs au cadrage d'ensemble : ils valent pour 375 px comme pour 1440 px */
  let Z0, ZA, ZB, Z1, Z2;
  function thresholds() {
    const cam = map.cameraForBounds([[B[0], B[1]], [B[2], B[3]]], { padding: pad() });
    Z0 = cam ? cam.zoom : 5; ZA = Z0 + 0.55; ZB = Z0 + 1.15; Z1 = Z0 + 0.85; Z2 = Z0 + 3.1;
    map.setMaxZoom(Math.min(11.6, Z0 + 5.4));      // pas de zoom dans le vide : au plus l'échelle d'une commune
  }
  thresholds();
  /* Une seule échelle peinte à la fois : au niveau « communes », un État non encore révélé passe
     en gris neutre ; l'opacité des communes ne dépend plus du zoom mais de leur révélation. */
  let level = 0, focus = null;
  const opFill = () => ['coalesce', ['feature-state', 'o'], 0];
  const opLine = () => ['*', 0.85, ['coalesce', ['feature-state', 'o'], 0]];
  const opState = (a) => ['case', ['boolean', ['feature-state', 'm'], false], 0, a];
  const stateColor = () => (level >= 1 && ctx.mode() !== 'gdp') ? CN : colorExpr(key());

  /* hachure des territoires occupés (motif généré, non figuratif) */
  (() => {
    const n = 8, d = new Uint8ClampedArray(n * n * 4), rgb = [153, 64, 47];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if ((x + y) % n < 2) { const i = (y * n + x) * 4; d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 150; }
    map.addImage('hatch', { width: n, height: n, data: d });
  })();

  map.addSource('far', { type: 'geojson', data: poly(geo.far) });
  map.addSource('land', { type: 'geojson', data: fc(geo.land.map(l => poly(l.g))) });
  map.addSource('borders', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: geo.borders.map(b => { const r = ctx.decPolys([[b]], q)[0][0]; r.pop(); return r; }) } } });
  map.addSource('occ', { type: 'geojson', data: fc(geo.occupied.map(o => poly(o.g))) });
  map.addSource('states', { type: 'geojson', data: fc(feats), promoteId: 'c', tolerance: 0.25 });
  for (const s of ['sel', 'cur', 'hov', 'mask', 'plc']) map.addSource(s, { type: 'geojson', data: EMPTY });
  const lineW = (a, b) => ['interpolate', ['linear'], ['zoom'], 4, a, 10, b];
  [
    { id: 'far', type: 'fill', source: 'far', paint: { 'fill-color': LAND, 'fill-outline-color': COAST } },
    { id: 'land', type: 'fill', source: 'land', paint: { 'fill-color': LAND, 'fill-outline-color': COAST } },
    { id: 'borders', type: 'line', source: 'borders', paint: { 'line-color': LANDLINE, 'line-width': 1 } },
    { id: 'occ', type: 'fill', source: 'occ', paint: { 'fill-pattern': 'hatch' } },
    { id: 'occ-l', type: 'line', source: 'occ', paint: { 'line-color': RED, 'line-width': 0.7, 'line-opacity': 0.55 } },
    { id: 'states-fill', type: 'fill', source: 'states', paint: { 'fill-color': colorExpr(key()), 'fill-opacity': opState(1) } },
    { id: 'states-x', type: 'fill', source: 'states', paint: { 'fill-color': colorExpr(key()), 'fill-opacity': 0 } },
    { id: 'states-line', type: 'line', source: 'states', layout: { 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': lineW(0.7, 1.6), 'line-opacity': opState(1) } },
    { id: 'mask', type: 'fill', source: 'mask', paint: { 'fill-color': SEA, 'fill-opacity': 0, 'fill-opacity-transition': { duration: 500 } } },
    { id: 'plc', type: 'line', source: 'plc', layout: { 'line-join': 'round' }, paint: { 'line-color': GOLD, 'line-width': 3 } },
    { id: 'plc-i', type: 'line', source: 'plc', layout: { 'line-join': 'round' }, paint: { 'line-color': INK, 'line-width': 1, 'line-gap-width': 3 } },
    { id: 'sel-case', type: 'line', source: 'sel', layout: { 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': DESK.matches ? 5.5 : 3.6, 'line-opacity': 0.95 } },
    { id: 'sel', type: 'line', source: 'sel', layout: { 'line-join': 'round' }, paint: { 'line-color': INK, 'line-width': DESK.matches ? 2.4 : 1.5 } },
    { id: 'hov', type: 'line', source: 'hov', layout: { 'line-join': 'round' }, paint: { 'line-color': INK, 'line-width': 1.6 } },
    { id: 'cur-case', type: 'line', source: 'cur', layout: { 'line-join': 'round' }, paint: { 'line-color': INK, 'line-width': 6.5 } },
    { id: 'cur', type: 'line', source: 'cur', layout: { 'line-join': 'round' }, paint: { 'line-color': GOLD, 'line-width': 3.5 } },
  ].forEach(l => map.addLayer(l));

  /* ---------- communes : un fichier par État, chargé quand on zoome dessus ---------- */
  let dead = false;      // contexte WebGL perdu (onglet fermé, mémoire) : plus aucune écriture de style
  map.on('webglcontextlost', () => { dead = true; });
  map.on('webglcontextrestored', () => { dead = false; });
  const loaded = {}, rev = {};   // code -> données ; code -> 0 | 1 (en cours) | 2 (révélé)
  const munColor = () => ['match', ['get', key()], 0, C[0], 1, C[1], 2, C[2], 3, C[3], 4, C[4], CN];
  async function ensureMun(code) {
    if (loaded[code]) return loaded[code];
    const d = await ctx.loadMun(code);
    if (loaded[code] || dead || !map.getLayer('states-line')) return d;
    const f = d.m.map(m => ({ type: 'Feature', properties: { s: m.s, c: code, pc: m.pc, dc: m.dc, gc: m.gc }, geometry: { type: 'MultiPolygon', coordinates: m.coords } }));
    d.frag.forEach((p, i) => f.push({ type: 'Feature', properties: { s: '~' + i, c: code, frag: 1, pc: 0, dc: 0, gc: d.gc }, geometry: { type: 'Polygon', coordinates: p } }));
    map.addSource('m-' + code, { type: 'geojson', data: fc(f), promoteId: 's', tolerance: 0.2 });
    map.addSource('o-' + code, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: d.outline } }, tolerance: 0.2 });
    map.addLayer({ id: 'mf-' + code, type: 'fill', source: 'm-' + code, paint: { 'fill-color': munColor(), 'fill-opacity': opFill(), 'fill-antialias': false } }, 'states-line');
    map.addLayer({ id: 'ml-' + code, type: 'line', source: 'm-' + code, filter: ['!', ['has', 'frag']], layout: { 'line-join': 'round' },
      paint: { 'line-color': '#fff', 'line-width': ['interpolate', ['linear'], ['zoom'], ZA, 0.3, ZA + 3.5, 1.1], 'line-opacity': opLine() } }, 'states-line');
    map.addLayer({ id: 'mo-' + code, type: 'line', source: 'o-' + code, layout: { 'line-join': 'round' },
      paint: { 'line-color': INK, 'line-width': ['interpolate', ['linear'], ['zoom'], ZA, 0.5, ZA + 3.5, 1.9], 'line-opacity': level >= 1 ? 0.62 : 0, 'line-opacity-transition': { duration: 400 } } }, 'mask');
    loaded[code] = d; rev[code] = 0;
    return d;
  }
  /* Signature : les limites communales se dessinent de proche en proche depuis un point. */
  let lastOrigin = null;
  function reveal(code, origin) {
    const d = loaded[code]; if (!d || rev[code] || dead) return;
    rev[code] = 1;
    const src = 'm-' + code, ids = d.m.map(m => [m.s, m.pt]).concat(d.frag.map((p, i) => ['~' + i, p[0][0]]));
    const done = () => { rev[code] = 2; map.setFeatureState({ source: 'states', id: code }, { m: true }); layoutSoon(); };
    if (RM.matches) { ids.forEach(([id]) => map.setFeatureState({ source: src, id }, { o: 1 })); done(); return; }
    const o = origin || BY[code].pt, k = Math.cos(o[1] * Math.PI / 180);
    const items = ids.map(([id, pt]) => ({ id, d: Math.hypot((pt[0] - o[0]) * k, pt[1] - o[1]), o: 0 }));
    const max = Math.max(...items.map(i => i.d)) || 1, SPREAD = 760, FADE = 300, t0 = performance.now();
    items.forEach(i => { i.t = SPREAD * Math.pow(i.d / max, 0.8); d.by[i.id] && (d.by[i.id]._t = t0 + i.t); });
    const fin = done;
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
  function inRing(pt, r) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  const inPoly = (pt, mp) => mp.some(p => inRing(pt, p[0]) && !p.slice(1).some(h => inRing(pt, h)));
  function stateAt(pt) { for (const s of CORE.states) { const bb = s.bb; if (pt[0] >= bb[0] && pt[0] <= bb[2] && pt[1] >= bb[1] && pt[1] <= bb[3] && inPoly(pt, SG[s.c])) return s.c; } return null; }

  /* fondu d'échelle : l'ancienne teinte reste un instant au-dessus de la nouvelle */
  let _lastState = colorExpr(key());
  function repaintStates() {
    const next = stateColor();
    if (!RM.matches) {
      map.setPaintProperty('states-x', 'fill-opacity-transition', { duration: 0 });
      map.setPaintProperty('states-x', 'fill-color', _lastState);
      map.setPaintProperty('states-x', 'fill-opacity', 1);
      setTimeout(() => { map.setPaintProperty('states-x', 'fill-opacity-transition', { duration: 480 }); map.setPaintProperty('states-x', 'fill-opacity', 0); }, 40);
    }
    map.setPaintProperty('states-fill', 'fill-color', next); _lastState = next;
  }
  function semantic() {
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
      const want = CORE.states.filter(s => !loaded[s.c] && bbHit(s.bb, b))
        .sort((a, d) => Math.hypot(a.pt[0] - c.lng, a.pt[1] - c.lat) - Math.hypot(d.pt[0] - c.lng, d.pt[1] - c.lat)).slice(0, 8);
      want.forEach(s => ensureMun(s.c).then(() => { if (level >= 1) reveal(s.c, lastOrigin || [map.getCenter().lng, map.getCenter().lat]); layoutSoon(); semanticSoon(); }));
    }
    for (const code in loaded) {
      if (level >= 1 && !rev[code] && bbHit(BY[code].bb, b)) reveal(code, lastOrigin || [c.lng, c.lat]);
    }
    const f = l >= 1 ? stateAt([c.lng, c.lat]) : null;
    if (f !== focus) { focus = f; ctx.onFocus(f); }
  }

  /* ---------- étiquettes HTML ---------- */
  const ST = CORE.states.map(s => ({ kind: 'st', s, pt: s.pt, el: null, on: false, v: '' }));
  const MU = {};       // code -> [{kind:'mu', m, ...}]
  let PL = [];
  const sizeCache = new Map();
  function mkEl(cls, html) { const el = document.createElement('div'); el.className = 'lb ' + cls; el.innerHTML = html; labelsEl.appendChild(el); return el; }
  function size(cls, html) {
    const k = cls + '|' + html; let s = sizeCache.get(k);
    if (!s) { const el = mkEl(cls, html); s = [el.offsetWidth, el.offsetHeight]; el.remove(); sizeCache.set(k, s); }
    return s;
  }
  const e = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function variants(it) {
    if (it.kind === 'st') {
      const s = it.s;
      if (s.t !== 'T') return [['cap' + (s.t === 'M' ? ' m' : ''), e(ctx.disp(s.n)), 'l']];
      if (level >= 1) return [['st wm', e(ctx.disp(s.n)), 'c']];
      const dk = ctx.klass(ctx.valOf(s, ctx.mode()), br[ctx.mode()]) >= 3 ? ' dk' : '';
      return [['st' + dk, e(ctx.disp(s.n)), 'c'], ['st' + dk, s.k, 'c']];
    }
    if (it.kind === 'mu') {
      const m = it.m, cl = (m[key()] >= 3 ? ' dk' : '') + (m.seat ? ' seat' : '') + (level >= 2 ? ' big' : '');
      const nm = `<b>${e(ctx.disp(m.n))}</b>`, fig = level >= 2 && m.dens != null
        ? `<small>${ctx.fmtN(m.p)} · ${e(ctx.disp(ctx.L('{0} / km²', ctx.fmtN(Math.round(m.dens)))))}</small>` : `<small>${ctx.fmtN(m.p)}</small>`;
      return it.rich ? [['mu' + cl, nm + fig, 'c'], ['mu' + cl, nm, 'c']] : [['mu' + cl, nm, 'c']];
    }
    return [['pl', e(ctx.disp(it.n)), 'c']];
  }
  let boxes = [];
  const hit = (a) => boxes.some(b => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]);
  function tryPlace(it, p, free) {
    for (const [cls, html, anchor] of variants(it)) {
      const [w, h] = size(cls, html);
      const g = DESK.matches ? 3 : 5, x0 = anchor === 'l' ? p.x - 6 : p.x - w / 2, box = [x0 - g, p.y - h / 2 - g + 1, x0 + w + g, p.y + h / 2 + g - 1];
      if (free || !hit(box)) {
        if (!free) boxes.push(box);
        const v = cls + '|' + html;
        if (!it.el) { it.el = mkEl(cls, html); it.v = v; if (it.kind === 'pl') it.el.dataset.i = it.i; if (it.kind === 'st') it.el.dataset.c = it.s.c; }
        else if (it.v !== v) { it.el.className = 'lb ' + cls + (it.on ? ' on' : ''); it.el.innerHTML = html; it.v = v; }
        it.anchor = anchor; it.w = w;
        return true;
      }
    }
    return false;
  }
  let active = new Set(), _lay = 0, _layT = 0;
  function layoutSoon() { if (!_lay) _lay = requestAnimationFrame(() => { _lay = 0; layout(); }); }
  function layout() {
    _layT = performance.now();
    const W = innerWidth, H = innerHeight, z = map.getZoom(), next = new Set(), now = performance.now();
    boxes = [];
    for (const id of ['top', 'sheet', 'legend']) { const el = document.getElementById(id); if (!el || el.hidden) continue;
      if (id === 'top') { for (const ch of el.children) { const r = ch.getBoundingClientRect(); if (r.width) boxes.push([r.left, r.top, r.right, r.bottom]); } continue; }
      const r = el.getBoundingClientRect(); boxes.push([r.left, r.top, r.right, r.bottom]); }
    const vis = p => p.x > -40 && p.x < W + 40 && p.y > -20 && p.y < H + 20;
    const put = (it, free) => { const p = map.project(it.pt); if (!vis(p)) return false; if (tryPlace(it, p, free)) { next.add(it); return true; } return false; };
    PL.forEach(it => put(it));
    const R = ctx.R();
    ST.filter(it => it.s.t === 'F').forEach(it => put(it));
    ST.filter(it => it.s.t === 'M').forEach(it => { if (z > Z0 + 0.4 || DESK.matches) put(it); });
    if (level === 0) ST.filter(it => it.s.t === 'T').sort((a, b) => (b.s.c === R.c) - (a.s.c === R.c) || b.s.pop - a.s.pop).forEach(it => put(it));
    else {
      if (level === 1) ST.filter(it => it.s.t === 'T' && !(rev[it.s.c] && it.s.c === R.c)).forEach(it => {
        const a = map.project([it.s.bb[0], it.s.bb[1]]), b = map.project([it.s.bb[2], it.s.bb[3]]);
        const [w] = size('st wm', e(ctx.disp(it.s.n)));
        if (b.x - a.x > w * 1.5 && a.y - b.y > 70) put(it);
      });
      const cand = [];
      for (const code in loaded) {
        if (rev[code] !== 2 && !(rev[code] === 1)) continue;
        if (!bbHit(BY[code].bb, map.getBounds())) continue;
        if (BY[code].t !== 'T' && loaded[code].m.length === 1) continue;      // ville-État d'un seul tenant : son étiquette de capitale suffit
        if (!MU[code]) MU[code] = loaded[code].m.map(m => ({ kind: 'mu', m, pt: m.pt, el: null, on: false, v: '' }));
        for (const it of MU[code]) { if (it.m._t && it.m._t > now) continue; cand.push(it); }
      }
      const selS = R.v === 'mun' ? R.s : null, curS = cursor && cursor.s;
      cand.sort((a, b) => ((b.m.s === selS && b.m.c === R.c) - (a.m.s === selS && a.m.c === R.c)) || ((b.m.s === curS) - (a.m.s === curS)) || ((b.m.c === R.c) - (a.m.c === R.c)) || b.m.p - a.m.p);
      let n = 0, tests = 0;
      const cap = DESK.matches ? 90 : 22;
      for (const it of cand) {
        if (n >= cap || tests > 420) break;
        const p = map.project(it.pt); if (!vis(p)) continue;
        tests++; it.rich = level >= 2 || n < (DESK.matches ? 16 : 6);
        if (tryPlace(it, p)) { next.add(it); n++; }
      }
    }
    for (const it of active) if (!next.has(it)) { it.on = false; it.off = now; if (it.el) it.el.classList.remove('on'); }
    for (const it of next) if (!it.on) { it.on = true; const el = it.el; requestAnimationFrame(() => el.classList.add('on')); }
    /* éléments éteints : retirés après le fondu */
    for (const code in MU) for (const it of MU[code]) if (it.el && !it.on && now - (it.off || 0) > 500) { it.el.remove(); it.el = null; it.v = ''; }
    for (const it of ST) if (it.el && !it.on && now - (it.off || 0) > 500) { it.el.remove(); it.el = null; it.v = ''; }
    active = next;
    position();
  }
  function position() {
    const all = [...active];
    for (const it of all) {
      if (!it.el) continue;
      const p = map.project(it.pt);
      it.el.style.transform = it.anchor === 'l' ? `translate(${Math.round(p.x - 5)}px,${Math.round(p.y)}px) translate(0,-50%)`
        : `translate(${Math.round(p.x)}px,${Math.round(p.y)}px) translate(-50%,-50%)`;
    }
  }
  map.on('move', () => { position(); if (performance.now() - _layT > 130) layout(); semanticSoon(); });
  map.on('moveend', () => { semantic(); layout(); });
  let _sem = 0;
  function semanticSoon() { if (!_sem) _sem = setTimeout(() => { _sem = 0; semantic(); }, 90); }
  labelsEl.addEventListener('click', ev => { const el = ev.target.closest('.pl'); if (!el) return; const p = PL[+el.dataset.i]; if (p) ctx.onPick(p.k === 's' ? { c: p.c } : { c: p.c, s: p.s }); });

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
  const geomOf = id => !id ? null : id.s ? (loaded[id.c] && loaded[id.c].by[id.s] ? loaded[id.c].by[id.s].coords : null) : SG[id.c];
  const feat = id => { const g = geomOf(id); return g ? { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: g } } : EMPTY; };
  let hov = null, cursor = null;
  const same = (a, b) => (!a && !b) || (a && b && a.c === b.c && (a.s || '') === (b.s || ''));
  let tipMute = null;
  map.on('mousemove', ev => {
    if (tipMute && Math.hypot(ev.point.x - tipMute.x, ev.point.y - tipMute.y) < 14) return;
    tipMute = null;
    const id = pick(ev.point);
    if (!same(id, hov)) { hov = id; gsrc('hov').setData(feat(id)); map.getCanvas().style.cursor = id ? 'pointer' : ''; }
    if (!id) { tip.hidden = true; return; }
    const s = BY[id.c], m = id.s && loaded[id.c].by[id.s], mode = ctx.mode();
    const val = m ? (mode === 'gdp' ? ctx.valLab(s.gdp, 'gdp') : ctx.valLab(mode === 'pop' ? m.p : m.dens, mode)) : ctx.valLab(ctx.valOf(s, mode), mode);
    tip.innerHTML = `<b>${e(ctx.disp(m ? m.n : s.n))}${m ? '' : `<code>${s.c}</code>`}</b><span>${e(ctx.disp(m ? s.n + ' · ' : ''))}${e(ctx.disp(val))}</span>`;
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.min(innerWidth - r.width - 8, ev.originalEvent.clientX + 14) + 'px';
    tip.style.top = Math.max(8, ev.originalEvent.clientY - r.height - 12) + 'px';
  });
  map.on('mouseout', () => { tip.hidden = true; hov = null; gsrc('hov').setData(EMPTY); });
  map.on('click', ev => { const id = pick(ev.point); if (!id) return; lastOrigin = [ev.lngLat.lng, ev.lngLat.lat]; tip.hidden = true; tipMute = ev.point; ctx.onPick(id); });
  map.on('dragstart', () => { tip.hidden = true; });

  /* ---------- caméra ---------- */
  function cut() { stage.classList.remove('cut'); void stage.offsetWidth; stage.classList.add('cut'); setTimeout(() => stage.classList.remove('cut'), 260); }
  function fit(bb, maxZoom, instant, dur) {
    const o = { padding: pad(), maxZoom: maxZoom || 11.2 };
    if (instant || RM.matches) { if (!instant) cut(); map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { ...o, animate: false }); }
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
    const instant = !!o.first;
    target = R;
    if (R.v === 'home') {
      gsrc('sel').setData(EMPTY); maskFor(null);
      if (!o.first) fit(B, Z0 + 0.01, false);
    } else if (R.v === 'state') {
      const s = BY[R.c];
      gsrc('sel').setData(feat({ c: R.c })); maskFor(SG[R.c], 0.62);
      lastOrigin = lastOrigin || s.pt;
      ensureMun(R.c).then(() => { if (target === R) { semantic(); layoutSoon(); } });
      fit(s.bb, Z0 + 4.2, instant);
    } else if (R.v === 'mun') {
      const d = await ensureMun(R.c); if (target !== R) return;
      const m = d.by[R.s];
      gsrc('sel').setData(feat({ c: R.c, s: R.s })); maskFor(m.coords, 0.6);
      const bb = bbOf(m.coords), dx = (bb[2] - bb[0]) * 0.35, dy = (bb[3] - bb[1]) * 0.35;
      lastOrigin = m.pt;
      fit([bb[0] - dx, bb[1] - dy, bb[2] + dx, bb[3] + dy], Z0 + 5.2, instant);
    } else {
      gsrc('sel').setData(EMPTY); maskFor(null);
    }
    if (instant) { semantic(); layout(); }
    else layoutSoon();
  }

  /* ---------- Constitution située ---------- */
  function showPlaces(list, o = {}) {
    PL.forEach(it => it.el && it.el.remove());
    active.forEach(it => { if (it.kind === 'pl') active.delete(it); });
    const all = (list || []).map((p, i) => ({ kind: 'pl', i, k: p.k, c: p.c, s: p.s, n: p.n, pt: p.k === 's' ? BY[p.c].pt : p.pt, el: null, on: false, v: '' }));
    PL = all.length > 8 ? [] : all;      // une liste entière (art. 1 bis : 54 entités) se lit sur la carte elle-même
    gsrc('plc').setData(fc(PL.filter(p => p.k === 's').map(p => feat({ c: p.c }))));
    if (o.fit && all.length) {
      const t = o.only != null ? [all[o.only]] : all;
      let bb = [180, 90, -180, -90];
      const ext = (w, s, e2, n) => { bb = [Math.min(bb[0], w), Math.min(bb[1], s), Math.max(bb[2], e2), Math.max(bb[3], n)]; };
      t.forEach(p => { if (p.k === 's') ext(...BY[p.c].bb); else ext(p.pt[0] - 0.22, p.pt[1] - 0.16, p.pt[0] + 0.22, p.pt[1] + 0.16); });
      fit(bb, t.length === 1 && t[0].k === 'm' ? ZB + 1.6 : ZB + 2.4);
      if (o.only != null) setTimeout(() => { const it = PL[o.only]; if (it && it.el) { it.el.classList.remove('pulse'); void it.el.offsetWidth; it.el.classList.add('pulse'); } }, 60);
    }
    layoutSoon();
  }

  function setCursor(id, soft) {
    cursor = id;
    if (id && id.s && !loaded[id.c]) { gsrc('cur').setData(EMPTY); return; }
    gsrc('cur').setData(feat(id));
    if (id && !soft) {
      const g = geomOf(id); if (!g) return;
      const bb = bbOf(g), b = map.getBounds(), p = pad();
      const a = map.project([bb[0], bb[3]]), c = map.project([bb[2], bb[1]]);
      if (a.x < p.left || c.x > innerWidth - p.right || a.y < p.top || c.y > innerHeight - p.bottom) {
        const ctr = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2];
        map.easeTo({ center: ctr, padding: p, duration: RM.matches ? 0 : 420, essential: true });
      }
      void b;
    }
    layoutSoon();
  }
  function setMode() {
    repaintStates();
    const b = map.getBounds();
    for (const code in loaded) {
      const id = 'mf-' + code, old = map.getPaintProperty(id, 'fill-color');
      if (!RM.matches && rev[code] === 2 && bbHit(BY[code].bb, b) && !map.getLayer(id + 'x')) {
        map.addLayer({ id: id + 'x', type: 'fill', source: 'm-' + code, paint: { 'fill-color': old, 'fill-opacity': 1, 'fill-opacity-transition': { duration: 480 }, 'fill-antialias': false } }, 'ml-' + code);
        setTimeout(() => map.getLayer(id + 'x') && map.setPaintProperty(id + 'x', 'fill-opacity', 0), 40);
        setTimeout(() => map.getLayer(id + 'x') && map.removeLayer(id + 'x'), 620);
      }
      map.setPaintProperty(id, 'fill-color', munColor());
    }
    layout();
  }
  function relabel() {
    sizeCache.clear();
    for (const it of [...ST, ...PL, ...Object.values(MU).flat()]) { if (it.el) it.el.remove(); it.el = null; it.on = false; it.v = ''; }
    active = new Set();
    layout();
  }
  let _rp = 0;
  function repad() {
    clearTimeout(_rp);
    _rp = setTimeout(() => {
      syncVars(); map.resize();
      const z0 = Z0; thresholds();
      void z0;
      if (target && target.v !== 'cons' && target.v !== 'title') sync(target, {}); else layout();
    }, 260);
  }
  const api = {
    sync, showPlaces, setCursor, setMode, relabel, repad,
    refit() { if (target) sync(target.v === 'cons' || target.v === 'title' ? { v: 'home' } : target, {}); },
    home() { fit(B, Z0 + 0.01); },
    zoom(d) { map.easeTo({ zoom: map.getZoom() + d, duration: RM.matches ? 0 : 320, essential: true }); },
    zoomAt(pt, dir) { map.easeTo({ zoom: map.getZoom() + dir * 0.9, around: map.unproject(pt), duration: RM.matches ? 0 : 520, essential: true }); },
    wake() { map.resize(); semantic(); layout(); },
    map,
  };
  await new Promise(res => { if (map.loaded()) res(); else map.once('idle', res); });
  semantic(); layout();
  window.__atlas = api;
  return api;
}
