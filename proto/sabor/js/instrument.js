/* Sabor : l'instrument. On compose un vote, les règles de la Constitution répondent.
   Deux dispositions de la même scène : par délégation (rangées et camps) et géographique
   (chaque unité à la place de son État, contours réels de geo.json en fond). */
import { S, T, H, Q, label, labelH, esc, fmtN, pct, peopleName, artLink, cyrApply, toast, artId } from './core.js';
import { TYPES, typeById, evaluate, encode, decode, SCENARIOS, setGroup, blank, HYP } from './rules.js';

const N = s => s;                                      // clé anglaise tenue dans une table (lue par build.py)
const ORDER3 = ['f', 'x', 'a'];                        // colonnes : pour, abstention, contre
const LAB = { f: N('For'), x: N('Abstention'), a: N('Against') };
const NEXT = { f: 'a', a: 'x', x: 'f' };
const VERDICT = { pass: [N('Passes'), '✓'], fail: [N('Fails'), '✕'], hold: [N('Suspended'), '‖'], wait: ['', '…'] };
const TYPE_RE = new RegExp('^vote-(' + TYPES.map(t => t.id).join('|') + ')$');

let C, V, root, stage, unitsEl, lanesEl, capsEl, tipEl, panelEl, nodes = [], byCode = {}, cells = {}, capEl = {};
let sim = null, d3 = null, MAP = null, mode = 'lanes', sel = null, pinned = false, drag = null, dragged = false;
let play = null, timer = 0, mobile = false, touch = false, GROUPS = [], scen = {}, built = '', lastW = 0, lastH = 0, measured = false, rz = null;
const groupOf = s => s.p || (s.t === 'F' ? 'fed' : 'mun');
const groupName = g => g === 'fed' ? T('Confederal territories') : g === 'mun' ? T('Confederal municipalities') : peopleName(g);
const type = () => typeById(V.type);
const inactive = s => { const t = type(); return !!t.c || (!!t.co && s.t === 'M'); };
const sub = s => s.t === 'T' ? T(S.C.peoples[s.p].en + ' state · seat {0}', s.ch) : T(s.ch).replace('&amp;', '&');
const regPct = x => pct(x / C.regTotal);

function initial(h) {
  const out = { mode: 'lanes', sel: null };
  if (h.endsWith('-map')) { out.mode = 'map'; h = h.slice(0, -4); }
  const s = /^select-([A-Za-z]{2}-\d{2})$/.exec(h);
  if (s && C.by[s[1].toUpperCase()]) out.sel = s[1].toUpperCase();
  out.v = decode(C, h);
  if (!out.v) {
    const m = TYPE_RE.exec(h), sc = (m && SCENARIOS.find(x => x.type === m[1])) || SCENARIOS[0];
    out.v = sc.make(C);
    if (m) out.v.type = m[1];
  }
  return out;
}

export async function render(app, h) {
  C = S.C; GROUPS = [...C.order, 'fed', 'mun'];
  measured = false; sel = null; pinned = false; built = ''; stopPlay();
  const init = initial(h); V = init.v; mode = init.mode;
  if (mode === 'map' && !MAP) MAP = await (await fetch('data/map.json')).json();   // avant le premier dessin : aucun décalage de mise en page
  SCENARIOS.forEach(s => { const v = s.make(C); scen[s.id] = { enc: encode(C, v), tag: s.tag(evaluate(C, v), regPct) }; });
  const popMax = Math.max(...C.states.map(s => s.pop));
  const sorted = [...C.states].sort((a, b) => GROUPS.indexOf(groupOf(a)) - GROUPS.indexOf(groupOf(b)) || b.pop - a.pop);
  nodes = sorted.map((s, i) => ({ s, i, g: groupOf(s), q: Math.sqrt(s.pop / popMax), o: null, x: 0, y: 0 }));
  byCode = {}; nodes.forEach(n => byCode[n.s.c] = n);
  const keep = S.lang === 'en' && app.querySelector('.boot-home .intro');   // premier rendu : le titre statique reste en place

  app.innerHTML = `<div class="inst" id="inst">
  <section class="top">
    <div class="intro"><h1 class="h1" id="ih">${H('How a confederal law is made')}</h1>
      <p class="lead">${H('Every confederal law passes the Kongres. The Narodni Sabor guards the matters that touch the peoples, and the citizens keep the last word through the referendum. Choose a case to follow it step by step.')}</p></div>
    <div class="ctl">
      <select id="tsel" class="tsel" aria-labelledby="ih">${TYPES.map(t => `<option value="${t.id}">${esc(label(t.name))} · ${esc(t.arts.map(a => T('Art. {0}', a)).join(', '))}</option>`).join('')}</select>
      <div class="tlist" role="radiogroup" aria-labelledby="ih">${TYPES.map(t =>
        `<button type="button" role="radio" class="tbtn" data-type="${t.id}" aria-checked="false" tabindex="-1"><span>${labelH(t.name)}</span><small translate="no">${t.arts.join(' · ')}</small></button>`).join('')}</div>
      <div class="scn"><span class="cap" id="sch">${H('Choose a case')}</span>
        <div class="scl" role="toolbar" aria-labelledby="sch">${SCENARIOS.map((s, i) => `<button type="button" class="sbtn" data-sc="${s.id}" aria-pressed="false" tabindex="${i ? -1 : 0}"><span>${labelH(typeById(s.type).name)}</span><small>${esc(scen[s.id].tag)}</small></button>`).join('')}</div>
      </div>
    </div>
  </section>
  <section class="scene" aria-label="${esc(T('States'))}">
    <div class="layrow"><div class="seg lay" id="lay" role="group" aria-label="${esc(T('Map'))}"><button type="button" data-lay="lanes" aria-pressed="true">${H('Constituent peoples')}</button><button type="button" data-lay="map" aria-pressed="false">${H('Map')}</button></div></div>
    <div class="heads" id="heads">${ORDER3.map(o => `<div class="head" data-o="${o}"><span class="hl"><i class="gl" data-o="${o}"></i>${H(LAB[o])}</span><b class="hn" id="hn-${o}">0</b><span class="hu" id="hu-${o}"></span></div>`).join('')}
</div>
    <div class="stage" id="stage">
      <div class="units" id="units" role="group" aria-label="${esc(T('States'))}" tabindex="-1">${nodes.map(n =>
        `<button type="button" class="u" data-c="${n.s.c}" data-t="${n.s.t}" tabindex="-1"><span translate="no">${n.s.k}</span></button>`).join('')}</div>
      <svg class="geo" id="geo" aria-hidden="true" preserveAspectRatio="xMinYMin meet"></svg>
      <div class="lanes" id="lanes">${GROUPS.map(g => { const st = C.states.filter(s => groupOf(s) === g), seats = st.reduce((a, s) => a + s.s, 0);
        const cnt = g === 'mun' ? esc(T('{0} confederal municipalities', st.length)) : g === 'fed' ? esc(T('{0} confederal territories', st.length)) : st.length > 1 ? `${st.length} ${H('States')}` : H('Territorial state');
        return `<section class="lane" data-g="${g}">
        <div class="lh">
          <div class="ln"><b>${esc(groupName(g))}</b><span class="lm">${cnt}<span class="lm2"> · ${seats} ${H('Kongres seats')}</span></span></div>
          <div class="ld" data-g="${g}"></div>
          <div class="seg3" role="group" aria-label="${esc(groupName(g))}">${ORDER3.map(o =>
            `<button type="button" data-g="${g}" data-go="${o}" aria-pressed="false" aria-label="${esc(groupName(g) + ': ' + T(LAB[o]))}" title="${esc(T(LAB[o]))}"><i class="gl" data-o="${o}"></i></button>`).join('')}</div>
        </div>
        <div class="track">${ORDER3.map(o => `<div class="cell" data-o="${o}"></div>`).join('')}</div>
      </section>`; }).join('')}</div>
      <div class="caps" id="caps" aria-hidden="true">${GROUPS.map(g => ORDER3.map(o => `<i class="cap-o" data-k="${g}|${o}"></i>`).join('')).join('')}</div>
      <div class="council" id="council" role="group" aria-label="${esc(T('7 councillors, one per people'))}"></div>
      <div class="tip" id="tip" hidden></div>
    </div>
    <div class="legend">
      <span><i class="lg big"></i><i class="lg sm"></i>${H('Population')}</span>
      <span><i class="lg" data-t="T"></i>${H('Territorial state')}</span>
      <span><i class="lg" data-t="F"></i>${H('Confederal territory')}</span>
      <span><i class="lg" data-t="M"></i>${H('Confederal municipality')}</span>
    </div>
    <details class="tbl" id="tbl"><summary>${H('Show the figures as a table')}</summary><div class="tblw" id="tblw"></div></details>
  </section>
  <aside class="panel" id="panel" aria-label="${esc(T('Outcome'))}"></aside>
</div>`;
  root = app.querySelector('#inst'); stage = root.querySelector('#stage'); lanesEl = root.querySelector('#lanes');
  if (keep) root.querySelector('.intro').replaceWith(keep);
  unitsEl = root.querySelector('#units'); capsEl = root.querySelector('#caps'); tipEl = root.querySelector('#tip'); panelEl = root.querySelector('#panel');
  nodes.forEach(n => { n.el = unitsEl.querySelector(`[data-c="${n.s.c}"]`); });
  capEl = {}; capsEl.querySelectorAll('.cap-o').forEach(c => capEl[c.dataset.k] = { el: c, on: false, w: 0, h: 0 });
  bind();
  if (mode === 'map') loadMap();
  apply(false, true);
  nodes[0].el.tabIndex = 0;
  if (init.sel) select(init.sel, true);
  if (!S.reduced) (window.requestIdleCallback || setTimeout)(() => startSim(), { timeout: 1200 });
  return T('Home');
}

export function update(h) {
  if (!root || !root.isConnected) return false;
  const init = initial(h);
  V = init.v; stopPlay();
  if (init.mode !== mode) setMode(init.mode); else apply(true, true);
  if (init.sel) select(init.sel, true);
  return true;
}
export function leave() { if (sim) sim.stop(); sim = null; root = null; measured = false; sel = null; stopPlay(); if (rz) rz.disconnect();
  removeEventListener('resize', onResize); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); }
/** Élément partagé avec la fiche d'un État (View Transition) : le disque de cet État. */
export function hero(code, on) { const n = byCode[code]; if (n && n.el) n.el.style.viewTransitionName = on ? 'hero' : ''; }

/* ------------------------------------------------------------------ disposition */
const onResize = () => { if (root && measured && stage.clientWidth !== lastW) { layout(); retarget(true); placeTip(); panelTop(); } };
function flow(list, width) {            // rangées de disques, du plus peuplé au moins peuplé
  const rows = []; let row = null;
  for (const n of list) {
    const d = 2 * n.br + 3;
    if (!row || row.w + d > width) { row = { w: 0, h: 2 * n.br + 3, items: [] }; rows.push(row); }
    row.items.push(n); row.w += d;
  }
  return rows;
}
async function loadMap() {
  if (!MAP) MAP = await (await fetch('data/map.json')).json();
  const g = root && root.querySelector('#geo'); if (!g || g.childElementCount) return;
  g.setAttribute('viewBox', `0 0 ${MAP.w} ${MAP.h}`);
  g.innerHTML = `<path class="land" d="${Object.values(MAP.p).join('')}"/>`;
}
function layout() {
  mobile = matchMedia('(max-width: 760px)').matches;
  const W = lastW = stage.clientWidth, council = !!type().c;
  /* surface du disque = population ; plancher de lisibilité pour les plus petites entités */
  const rmax = mobile ? 19 : 26, rmin = mobile ? 6 : 10, ms = mode === 'map' ? Math.max(.55, Math.min(1, W / 880)) : 1;
  nodes.forEach(n => { n.br = Math.max(rmin, rmax * n.q); n.r = n.br * ms;
    n.el.style.setProperty('--d', (2 * n.r).toFixed(1) + 'px'); n.el.classList.toggle('sm', n.r < 9.5); });
  const cellW = stage.querySelector('.cell').clientWidth - 10;
  stage.querySelectorAll('.lane').forEach(l => {
    const h = flow(nodes.filter(n => n.g === l.dataset.g), cellW).reduce((a, r) => a + r.h, 0);
    l.querySelector('.track').style.height = Math.max(mobile ? 44 : 50, Math.ceil(h * (S.reduced ? 1 : 1.12)) + 12) + 'px';
  });
  const sr = stage.getBoundingClientRect();
  stage.querySelectorAll('.lane').forEach(l => l.querySelectorAll('.cell').forEach(c => {
    const r = c.getBoundingClientRect(), k = l.dataset.g + '|' + c.dataset.o;
    cells[k] = { x0: r.left - sr.left, x1: r.right - sr.left, y0: r.top - sr.top, y1: r.bottom - sr.top, cx: (r.left + r.right) / 2 - sr.left, cy: (r.top + r.bottom) / 2 - sr.top };
  }));
  if (MAP) relax(W);
  const h = council ? root.querySelector('#council').offsetHeight : mode === 'map' && MAP ? Math.round(W * MAP.h / MAP.w) : lanesEl.offsetHeight;
  stage.style.height = h + 'px'; lastH = h; measured = true;
}
/* Disposition géographique : chaque unité part du centroïde réel de son État, puis les
   chevauchements sont écartés (même résultat avec ou sans animation). */
function relax(W) {
  const k = W / MAP.w, P = nodes.map(n => ({ n, cx: MAP.c[n.s.c][0] * k, cy: MAP.c[n.s.c][1] * k, x: MAP.c[n.s.c][0] * k, y: MAP.c[n.s.c][1] * k }));
  for (let it = 0; it < 160; it++) {
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j], dx = b.x - a.x || .01, dy = b.y - a.y || .01, d = Math.hypot(dx, dy), m = a.n.r + b.n.r + 2;
      if (d < m) { const f = (m - d) / d / 2, wa = b.n.r / (a.n.r + b.n.r), wb = 1 - wa;
        a.x -= dx * f * wa * 1.0; a.y -= dy * f * wa; b.x += dx * f * wb; b.y += dy * f * wb; }
    }
    for (const p of P) { p.x += (p.cx - p.x) * .04; p.y += (p.cy - p.y) * .04; }
  }
  for (const p of P) { p.n.mx = Math.max(p.n.r, Math.min(W - p.n.r, p.x)); p.n.my = Math.max(p.n.r, p.y); }
}
/* Cibles : la grille stable (rangées par cellule) sert au mouvement réduit ; sinon le centre de
   la cellule, la simulation de forces fait le reste. En disposition géographique, la place de l'État. */
function retarget(instant) {
  const geo = mode === 'map' && MAP;
  for (const g of GROUPS) for (const o of ORDER3) {
    const c = cells[g + '|' + o], list = nodes.filter(n => n.g === g && n.o === o);
    const rows = flow(list, c.x1 - c.x0 - 10), H0 = rows.reduce((a, r) => a + r.h, 0);
    let y = c.cy - H0 / 2;
    for (const r of rows) { let x = c.cx - r.w / 2;
      for (const n of r.items) { n.gx = x + n.br + 1.5; n.gy = y + r.h / 2; x += 2 * n.br + 3; }
      y += r.h; }
    list.forEach(n => { n.tx = c.cx; n.ty = c.cy; n.y0 = c.y0 + n.r + 2; n.y1 = c.y1 - n.r - 2; });
  }
  if (geo) nodes.forEach(n => { n.gx = n.tx = n.mx; n.gy = n.ty = n.my; n.y0 = -1e9; n.y1 = 1e9; });
  if (S.reduced || !sim) placeGrid(instant);
  else { sim.force('x').strength(geo ? .22 : .05).initialize(nodes); sim.force('y').strength(geo ? .22 : .09).initialize(nodes); sim.alpha(instant ? .9 : .65).restart(); }
}
function placeGrid(instant) {
  const move = () => { nodes.forEach(n => { n.x = n.gx; n.y = n.gy; paint(n); n.el.style.opacity = ''; }); caps(true); placeTip(); };
  const moved = nodes.filter(n => Math.abs(n.x - n.gx) > .5 || Math.abs(n.y - n.gy) > .5);
  if (instant || !moved.length) return move();
  moved.forEach(n => { n.el.classList.add('fade'); n.el.style.opacity = '0'; });   // fondu court : disparaît, se range, reparaît
  setTimeout(move, 140);
}
const paint = n => { n.px = n.x; n.py = n.y; n.el.style.transform = `translate3d(${(n.x - n.r).toFixed(1)}px,${(n.y - n.r).toFixed(1)}px,0)${n.s.t === 'M' ? ' rotate(45deg) scale(.84)' : ''}`; };
function caps(grid) {                                   // contour de groupe : un cadre par délégation et par camp
  const bb = {};
  if (mode === 'lanes' && !type().c) for (const n of nodes) { const k = n.g + '|' + n.o, b = bb[k] || (bb[k] = [1e9, 1e9, -1e9, -1e9]);
    const x = grid ? n.gx : n.x, y = grid ? n.gy : n.y;
    if (x - n.r < b[0]) b[0] = x - n.r; if (y - n.r < b[1]) b[1] = y - n.r; if (x + n.r > b[2]) b[2] = x + n.r; if (y + n.r > b[3]) b[3] = y + n.r; }
  for (const k in capEl) { const c = capEl[k], b = bb[k];
    if (!b) { if (c.on) { c.on = false; c.el.style.opacity = '0'; } continue; }
    if (!c.on) { c.on = true; c.el.style.opacity = '1'; }
    const w = Math.round(b[2] - b[0] + 10), h = Math.round(b[3] - b[1] + 10);
    c.el.style.transform = `translate3d(${(b[0] - 5).toFixed(1)}px,${(b[1] - 5).toFixed(1)}px,0)`;
    if (w !== c.w) { c.w = w; c.el.style.width = w + 'px'; }
    if (h !== c.h) { c.h = h; c.el.style.height = h + 'px'; } }
}
async function startSim() {
  if (sim || !root) return;
  d3 = d3 || await import('../vendor/d3-force.min.js');
  if (!root || S.reduced || sim) return;
  const geo = mode === 'map' && MAP;
  sim = d3.forceSimulation(nodes)
    .velocityDecay(.34).alphaDecay(.024).alphaMin(.012).alpha(.3)
    .force('x', d3.forceX(n => n.tx).strength(geo ? .22 : .05))
    .force('y', d3.forceY(n => n.ty).strength(geo ? .22 : .09))
    .force('c', d3.forceCollide(n => n.r + 1.8).strength(1).iterations(4))
    .on('tick', () => {
      const w = lastW;
      for (const n of nodes) {
        if (n.fx == null) { if (n.y < n.y0) { n.y = n.y0; n.vy *= .3; } else if (n.y > n.y1) { n.y = n.y1; n.vy *= .3; }
          if (n.x < n.r) n.x = n.r; else if (n.x > w - n.r) n.x = w - n.r; }
        if (Math.abs(n.x - n.px) > .2 || Math.abs(n.y - n.py) > .2) paint(n);   // n'écrire que ce qui a bougé
      }
      caps(false);
      if (sel && !tipEl.hidden) placeTip();
    });
}
async function setMode(m) {
  if (m === 'map') await loadMap();
  if (!root) return;
  mode = m; root.dataset.layout = m;
  layout(); retarget(false);
  apply(true, false);
}

/* ------------------------------------------------------------------ pas à pas */
function stopPlay() { clearTimeout(timer); timer = 0; play = null; }
function startPlay(id) {
  const sc = SCENARIOS.find(s => s.id === id);
  V = sc.make(C); stopPlay();
  const t = typeById(sc.type);
  play = { id, i: 0, n: t.steps.length + 1, auto: !S.reduced };
  apply(true, true);
  if (play.auto) timer = setTimeout(tick, 650);
}
function tick() { if (!play || !root) return; if (play.i < play.n) { play.i++; apply(true, false); } if (play && play.auto && play.i < play.n) timer = setTimeout(tick, 1900); }
function stepTo(d) { if (!play) return; clearTimeout(timer); play.auto = false; play.i = Math.max(0, Math.min(play.n, play.i + d)); apply(true, false); }
/** Le vote tel qu'il est montré à l'étape courante, et les jauges déjà atteintes. */
function staged() {
  if (!play) return { v: V, shown: null, done: true };
  const t = type(), groups = t.steps.slice(0, play.i), shown = new Set(groups.flat());
  const v = blank(C, V.type, 'x');
  if (play.i >= 1) { v.st = V.st; v.cv = V.cv; }
  if (['ns', 'del', 'alarm'].some(k => shown.has(k)) || !t.steps.flat().some(k => ['ns', 'del', 'alarm'].includes(k))) v.del = V.del;
  return { v, shown, done: play.i >= play.n };
}

/* ------------------------------------------------------------------ gestes */
function manual() { stopPlay(); }
function setSt(c, o) { manual(); V.st[c] = o; apply(true); }
function cycle(c) { setSt(c, NEXT[V.st[c]]); }
function select(c, pin) {
  if (sel && byCode[sel]) byCode[sel].el.classList.remove('sel');
  sel = c; pinned = !!(c && pin);
  if (c) { const n = byCode[c]; n.el.classList.add('sel'); nodes.forEach(m => m.el.tabIndex = m === n ? 0 : -1); }
  card();
}
function nearest(e) {                                   // zone de toucher de 44 px autour de chaque disque, sans élément supplémentaire
  const r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = null, bd = 1e9;
  for (const n of nodes) { const d = Math.hypot(n.x - x, n.y - y) - n.r; if (d < bd) { bd = d; best = n; } }
  return best && bd <= Math.max(0, 22 - best.r) + 2 ? best : null;
}
function roving(box, sel0, dir) {
  const items = [...box.querySelectorAll(sel0)], i = items.indexOf(document.activeElement), j = (i + dir + items.length) % items.length;
  items.forEach((b, k) => b.tabIndex = k === j ? 0 : -1); items[j].focus(); return items[j];
}
function bind() {
  root.addEventListener('pointerdown', e => { touch = e.pointerType === 'touch'; }, true);
  root.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b && root.contains(b)) {
      if (b.dataset.type) { manual(); V.type = b.dataset.type; apply(true, true); }
      else if (b.dataset.sc) startPlay(b.dataset.sc);
      else if (b.dataset.stp) stepTo(+b.dataset.stp);
      else if (b.dataset.lay) { if (b.dataset.lay !== mode) setMode(b.dataset.lay); }
      else if (b.dataset.go) { manual(); setGroup(C, V, b.dataset.g, b.dataset.go); apply(true); }
      else if (b.dataset.step) step(b.dataset.g, +b.dataset.step);
      else if (b.dataset.seat) { manual(); V.cv[b.dataset.seat] = NEXT[V.cv[b.dataset.seat]]; seatMove(); }
      else if (b.dataset.set) setSt(b.dataset.c, b.dataset.set);
      else if (b.dataset.x) select(null);
      else if (b.id === 'copy') copy();
      else if (b.id === 'pv') { panelEl.classList.toggle('open'); b.setAttribute('aria-expanded', panelEl.classList.contains('open')); }
      else if (b.classList.contains('u')) hit(byCode[b.dataset.c]);
      return;
    }
    if (e.target.closest('#stage') && !e.target.closest('.tip,.lh,.council')) { const n = nearest(e); if (n) hit(n); else if (pinned) select(null); }
  });
  root.querySelector('#tsel').addEventListener('change', e => { manual(); V.type = e.target.value; apply(true, true); });
  root.querySelector('.tlist').addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
    e.preventDefault(); const b = roving(e.currentTarget, '.tbtn', d); manual(); V.type = b.dataset.type; apply(true, true); });
  root.querySelector('.scl').addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); roving(e.currentTarget, '.sbtn', d); } });
  root.querySelector('#tbl').addEventListener('change', e => { const r = e.target; if (r.name && r.name.startsWith('v-')) setSt(r.name.slice(2), r.value); });
  root.querySelector('#tbl').addEventListener('toggle', e => { if (e.target.open) table(); });
  unitsEl.addEventListener('pointerover', e => { const b = e.target.closest('.u'); if (b && e.pointerType === 'mouse' && !drag && !pinned) select(b.dataset.c, false); });
  unitsEl.addEventListener('pointerout', e => { if (e.pointerType === 'mouse' && !pinned && !drag && !unitsEl.contains(document.activeElement)) select(null); });
  unitsEl.addEventListener('focusin', e => { const b = e.target.closest('.u'); if (b && b.dataset.c !== sel) select(b.dataset.c, false); });
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && sel) { select(null); } });
  unitsEl.addEventListener('keydown', e => {
    const b = e.target.closest('.u'); if (!b) return;
    const n = byCode[b.dataset.c], k = e.key;
    if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); const m = nodes[(n.i + (k === 'ArrowDown' ? 1 : nodes.length - 1)) % nodes.length]; select(m.s.c, false); m.el.focus({ preventScroll: false }); }
    else if ((k === 'ArrowLeft' || k === 'ArrowRight') && !inactive(n.s)) { e.preventDefault();
      const i = ORDER3.indexOf(V.st[n.s.c]) + (k === 'ArrowRight' ? 1 : -1); if (i >= 0 && i < 3) setSt(n.s.c, ORDER3[i]); }
    else if (k === 'Enter') { e.preventDefault(); location.hash = '#state-' + n.s.c; }
    else if (k === ' ') { e.preventDefault(); if (!inactive(n.s)) cycle(n.s.c); }
  });
  /* glisser (souris, stylet) : l'unité suit le pointeur, le camp est celui où on la lâche */
  unitsEl.addEventListener('pointerdown', e => {
    const b = e.target.closest('.u'); if (!b || e.pointerType === 'touch' || e.button || !sim || mode !== 'lanes') return;
    const n = byCode[b.dataset.c]; if (inactive(n.s)) return;
    drag = { n, x: e.clientX, y: e.clientY, on: false, id: e.pointerId };
  });
  addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  addEventListener('resize', onResize);
  rz = new ResizeObserver(() => { onResize(); panelTop(); }); rz.observe(stage); rz.observe(panelEl);
}
/** Un disque est visé. Au toucher : sélection seule, le vote se fait par les boutons de la fiche.
    À la souris : le disque change de camp et sa fiche s'épingle. */
function hit(n) {
  if (dragged) { dragged = false; return; }
  const c = n.s.c;
  if (!touch && !inactive(n.s)) cycle(c);
  select(c, true);
}
function onMove(e) {
  if (!drag || !root) return;
  if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
  const r = stage.getBoundingClientRect(), n = drag.n;
  if (!drag.on) { drag.on = true; n.el.classList.add('drag'); n.el.setPointerCapture(drag.id); sim.alphaTarget(.25).restart(); select(n.s.c, false); tipEl.hidden = true; }
  n.fx = e.clientX - r.left; n.fy = e.clientY - r.top;
  stage.dataset.drop = campAt(n, n.fx);
}
function campAt(n, x) { return x < cells[n.g + '|f'].x1 ? 'f' : x < cells[n.g + '|x'].x1 ? 'x' : 'a'; }
function onUp() {
  if (!drag) return;
  const n = drag.n;
  if (drag.on && root) { dragged = true; setTimeout(() => dragged = false, 60);
    const o = campAt(n, n.fx); n.fx = n.fy = null; n.el.classList.remove('drag'); delete stage.dataset.drop;
    if (sim) sim.alphaTarget(0);
    if (o !== V.st[n.s.c]) setSt(n.s.c, o); else if (sim) sim.alpha(.4).restart();
    select(n.s.c, true); }
  drag = null;
}
function step(g, d) {                                   // un membre de la délégation change de camp
  manual();
  let [f, a] = V.del[g];
  if (d > 0) { if (a > 0) { a--; f++; } else if (f + a < 10) f++; }
  else { if (f > 0) { f--; a++; } else if (f + a < 10) a++; }
  V.del[g] = [f, a]; apply(true);
}
function seatMove() {                                   // les sièges du Konfederalno Veće changent de colonne
  if (document.startViewTransition && !S.reduced) document.startViewTransition(() => apply(true)); else apply(true);
}
async function copy() {
  const url = location.origin + location.pathname + '#' + encode(C, V) + (mode === 'map' ? '-map' : '');
  try { await navigator.clipboard.writeText(url); } catch (e) {
    const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  toast(H('Link copied'));
}

/* ------------------------------------------------------------------ fiche du disque visé */
const glyph = o => `<i class="gl" data-o="${o}"></i>`;
function card() {
  const n = sel && byCode[sel], pc = panelEl.querySelector('.pcard');
  if (!n) { tipEl.hidden = true; if (pc) pc.hidden = true; return; }
  const s = n.s, off = inactive(s), o = V.st[s.c];
  const acts = pinned ? `<div class="tip-a"><div class="seg3 big" role="group" aria-label="${esc(s.n)}">${ORDER3.map(x =>
      `<button type="button" data-set="${x}" data-c="${s.c}" aria-pressed="${o === x}"${off ? ' disabled' : ''}>${glyph(x)}<span>${H(LAB[x])}</span></button>`).join('')}</div>
      <a class="btn" href="#state-${s.c}">${H('Open state page')} →</a></div>` : '';
  const html = `<div class="tip-h"><code translate="no">${s.c}</code><strong>${esc(s.n)}</strong>${pinned ? `<button type="button" class="tip-x" data-x="1" aria-label="${esc(T('Cancel'))}">×</button>` : ''}</div>
    <div class="tip-l">${esc(sub(s))}</div>
    <div class="tip-f"><span>${H('Population')} <b>${fmtN(s.pop)}</b></span><span>${H('Kongres seats')} <b>${s.s}</b></span></div>${acts}`;
  if (mobile) { tipEl.hidden = true; if (pc) { pc.hidden = !pinned; pc.innerHTML = html; } }
  else { if (pc) pc.hidden = true; tipEl.innerHTML = html; tipEl.hidden = false; tipEl.classList.toggle('pin', pinned); placeTip(); }
}
function placeTip() {
  const n = sel && byCode[sel]; if (!n || tipEl.hidden) return;
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight, W = lastW;
  const x = Math.max(4, Math.min(W - w - 4, n.x - w / 2)), up = n.y - n.r - h - 10, y = up < -40 ? n.y + n.r + 10 : up;
  tipEl.style.transform = `translate3d(${x.toFixed(0)}px,${y.toFixed(0)}px,0)`;
}

/* ------------------------------------------------------------------ panneau : verdict et jauges */
const M = n => n ? T('{0} M', fmtN(n / 1e6, { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '0';
const reqText = g => esc(g.req).replace('{f}', H(LAB.f)).replace('{a}', H(LAB.a));
function gaugeHTML(g) {
  const head = `<div class="g-h"><span class="g-org">${g.q ? esc(Q(g.q)) + ' · ' : ''}${H(g.org)}</span><span class="g-req">${reqText(g)}</span><span class="g-arts">${g.arts.map(artLink).join(' ')}</span><span class="g-st"><i aria-hidden="true"></i></span></div>`;
  const barEl = `<div class="g-bar${g.max ? ' max' : ''}"><i class="bf"></i><i class="ba"></i><i class="tick"></i></div>`;
  let body = '';
  if (g.kind === 'bar') body = `${barEl}<div class="g-n"><span>${glyph('f')}<b data-r="f"></b></span><span>${glyph('x')}<span data-r="x"></span></span><span>${glyph('a')}<span data-r="a"></span></span><span class="need" data-r="need"></span></div>`;
  else if (g.kind === 'count' && g.list) body = `<div class="chips">${g.list.map(x => `<span class="chip" data-p="${x.p}">${esc(peopleName(x.p))}</span>`).join('')}</div>
      <div class="g-n"><span><b data-r="v"></b> / ${g.total}</span></div>`;
  else if (g.kind === 'count') body = `${barEl}<div class="g-n"><span>${glyph('f')}<b data-r="v"></b> / ${g.total}</span></div>`;
  else if (g.kind === 'share') body = `${barEl}<div class="g-n"><span><b data-r="v"></b></span><span data-r="x"></span></div>`;
  else if (g.kind === 'alarm') body = `<div class="chips">${g.list.map(x => `<span class="chip" data-p="${x.p}" data-al="0">${esc(peopleName(x.p))} <b translate="no"></b></span>`).join('')}</div>`;
  return `<article class="g" data-g="${g.id}"${g.soft ? ' data-soft="1"' : ''}>${head}${body}${g.hyp ? `<p class="g-hyp">${H(HYP[g.hyp])}</p>` : ''}</article>`;
}
const setR = (el, r, v) => { const e = el.querySelector(`[data-r="${r}"]`); if (e && e.textContent !== v) e.textContent = v; };
function gaugeSet(el, g, on) {                          // mise à jour en place : rien n'est reconstruit
  const live = on && g.when !== false;
  el.dataset.ok = live ? (g.ok ? 1 : 0) : ''; el.classList.toggle('wait', !live);
  el.querySelector('.g-st i').textContent = live ? (g.ok ? '✓' : g.soft ? '–' : '✕') : '';
  const bar = el.querySelector('.g-bar');
  const W = (f, a, t) => { if (!bar) return; bar.children[0].style.width = (live ? f : 0) + '%'; bar.children[1].style.width = (live ? a : 0) + '%'; bar.children[2].style.left = t + '%'; };
  if (g.kind === 'bar') {
    const fmt = g.unit === 'inhabitants' ? M : fmtN, need = g.need == null ? (g.f + g.a) / 2 : g.need;
    W(g.f / g.total * 100, g.a / g.total * 100, live ? need / g.total * 100 : 50);
    setR(el, 'f', live ? fmt(g.f) : '–'); setR(el, 'x', live ? fmt(g.x) : '–'); setR(el, 'a', live ? fmt(g.a) : '–');
    setR(el, 'need', live ? (g.need == null ? '> ' + fmt((g.f + g.a) / 2) : '≥ ' + fmt(g.need)) : '');
  } else if (g.kind === 'count' && g.list) {
    el.querySelectorAll('.chip').forEach((c, i) => { c.dataset.on = live && g.list[i].on ? 1 : 0; if (live && g.list[i].off) c.dataset.off = 1; else delete c.dataset.off; });
    setR(el, 'v', live ? String(g.value) : '–');
  } else if (g.kind === 'count') { W(g.value / g.total * 100, 0, g.need / g.total * 100); setR(el, 'v', live ? String(g.value) : '–'); }
  else if (g.kind === 'share') { W(g.value * 100, 0, 50); setR(el, 'v', live ? pct(g.value) : '–');
    setR(el, 'x', live && g.topP ? `${g.top} / ${g.n} · ${peopleName(g.topP)}` : ''); }
  else if (g.kind === 'alarm') el.querySelectorAll('.chip').forEach((c, i) => { c.dataset.al = live && g.list[i].on ? 1 : 0; c.lastElementChild.textContent = live ? g.list[i].n + '/10' : ''; });
}
function panel(E, st) {
  const t = E.type, key = t.id + '|' + S.lang;
  if (built !== key) {                                  // structure : une fois par type de décision
    built = key;
    panelEl.innerHTML = `<div class="pstep" hidden></div><div class="pcard" hidden></div>
    <button type="button" class="pv" id="pv" aria-expanded="${panelEl.classList.contains('open')}">
      <span class="pv-m" aria-hidden="true"></span><span class="pv-t"><span class="pv-k">${labelH(t.name)}</span><strong></strong></span>
      <span class="pv-g" aria-hidden="true">${E.gauges.map(g => `<i data-g="${g.id}"></i>`).join('')}</span></button>
    <div class="pb"><p class="pv-l"></p>
      <div class="pa"><button type="button" class="btn" id="copy">${H('Copy link')}</button><a class="btn ghost" href="#${artId(t.arts[0])}">${esc(T('Article {0}', t.arts[0]))} →</a></div>
      <div class="gs">${E.gauges.map(gaugeHTML).join('')}</div>
      <details class="hyp"><summary>${H('Assumptions of the instrument')}</summary><p class="pdesc">${esc(label(t.desc))}</p><ul>${E.hyp.map(h => `<li>${H(HYP[h])}</li>`).join('')}</ul></details>
    </div>`;
  }
  const done = st.done, v = done ? E.verdict : 'wait', pv = panelEl.querySelector('#pv');
  pv.dataset.v = v; pv.querySelector('.pv-m').textContent = VERDICT[v][1];
  const word = pv.querySelector('strong'), w = VERDICT[v][0] ? T(VERDICT[v][0]) : '…';
  if (word.textContent !== w) { word.innerHTML = VERDICT[v][0] ? H(VERDICT[v][0]) : '…'; }
  const line = panelEl.querySelector('.pv-l'), lt = done && E.line ? label(E.line) : '';
  if (line.dataset.t !== lt) { line.dataset.t = lt; line.textContent = lt; line.hidden = !lt; }
  E.gauges.forEach(g => { const on = !st.shown || st.shown.has(g.id); gaugeSet(panelEl.querySelector(`.g[data-g="${g.id}"]`), g, on);
    const d = panelEl.querySelector(`.pv-g [data-g="${g.id}"]`); d.dataset.ok = on && g.when !== false ? (g.ok ? 1 : 0) : ''; });
  const ps = panelEl.querySelector('.pstep');
  if (play) {
    const groups = t.steps, i = play.i, gs = i >= 1 && i <= groups.length ? groups[i - 1].map(id => E.gauges.find(g => g.id === id)).filter(g => g && g.when !== false) : [];
    const cap = i === 0 ? '' : i > groups.length ? `${VERDICT[E.verdict][1]} ${H(VERDICT[E.verdict][0])}` : gs.map(g => `${g.ok ? '✓' : g.soft ? '–' : '✕'} ${H(g.org)} <span>${reqText(g)}</span>`).join(' · ');
    ps.hidden = false;
    ps.innerHTML = `<span class="ps-n">${esc(T('Step {0} of {1}', Math.max(1, i), play.n))}</span><span class="ps-c">${cap}</span>
      <span class="ps-b"><button type="button" data-stp="-1"${i <= 1 ? ' disabled' : ''}>← ${H('Previous')}</button><button type="button" data-stp="1"${i >= play.n ? ' disabled' : ''}>${H('Next')} →</button></span>`;
  } else if (!ps.hidden) { ps.hidden = true; ps.innerHTML = ''; }
  panelTop();
}
function panelTop() {                                   // le panneau reste entier : collé en haut s'il tient, sinon il suit la page
  if (!panelEl || mobile) { if (panelEl) panelEl.style.top = ''; return; }
  panelEl.style.top = Math.min(72, innerHeight - panelEl.offsetHeight - 16) + 'px';
}
function council(v) {
  const el = root.querySelector('#council'), max = Math.max(...C.order.map(p => C.reg[p]));
  el.innerHTML = `<div class="cn-cols">${ORDER3.map(o => `<div class="cn-col" data-o="${o}">${C.order.filter(p => (v.cv[p] || 'x') === o).map(p =>
    `<button type="button" class="seat" data-seat="${p}" style="--d:${Math.round((mobile ? 30 : 44) + (mobile ? 46 : 84) * Math.sqrt(C.reg[p] / max))}px;view-transition-name:seat-${p}" aria-label="${esc(peopleName(p) + ': ' + T(LAB[o]))}"><i class="disc" data-o="${o}"></i><b>${esc(peopleName(p))}</b><small>${regPct(C.reg[p])}</small></button>`).join('')}</div>`).join('')}</div>
    <p class="cn-n">${H('7 councillors, one per people')} · ${H(HYP.reg)}</p>`;
}
function table() {
  const w = root.querySelector('#tblw'); if (!root.querySelector('#tbl').open) return;
  w.innerHTML = `<table><thead><tr><th>${H('Name')}</th><th>${H('Constituent people')}</th><th class="num">${H('Population')}</th><th class="num">${H('Kongres seats')}</th><th>${H('Outcome')}</th></tr></thead><tbody>${nodes.map(n => {
    const s = n.s, off = inactive(s);
    return `<tr><th scope="row"><a href="#state-${s.c}"><code translate="no">${s.c}</code> ${esc(s.n)}</a></th><td>${esc(groupName(n.g))}</td><td class="num">${fmtN(s.pop)}</td><td class="num">${s.s}</td>
      <td><fieldset class="rad"${off ? ' disabled' : ''}><legend class="vh">${esc(s.n)}</legend>${ORDER3.map(o =>
        `<label><input type="radio" name="v-${s.c}" value="${o}"${V.st[s.c] === o ? ' checked' : ''} aria-label="${esc(T(LAB[o]))}"><span class="rb"></span>${glyph(o)}</label>`).join('')}</fieldset></td></tr>`; }).join('')}</tbody></table>`;
}
function apply(animate, structural) {
  const t = type(), E = evaluate(C, V), st = staged(), vd = st.v, Ed = play ? evaluate(C, vd) : E;
  root.dataset.type = t.id; root.dataset.layout = mode; root.classList.toggle('is-council', !!t.c);
  let moved = false;
  for (const n of nodes) {
    const o = vd.st[n.s.c];
    if (n.o !== o) { n.o = o; moved = true; }
    n.el.dataset.o = o; n.el.classList.toggle('off', inactive(n.s));
    n.el.setAttribute('aria-label', `${n.s.n}, ${groupName(n.g)}, ${n.s.s} ${T('Kongres seats')}: ${T(LAB[o])}`);
  }
  /* têtes de colonnes : la mesure qui compte pour ce type de décision */
  const raw = { f: 0, x: 0, a: 0 }; C.states.forEach(s => { if (s.t !== 'M') raw[vd.st[s.c]]++; });
  const cnt = t.c ? { f: Ed.t.cv.f.length, x: Ed.t.cv.x.length, a: Ed.t.cv.a.length } : t.k ? Ed.t.K : t.co ? raw : Ed.t.St;
  const unit = t.c ? '' : t.k ? 'Kongres seats' : 'States';
  ORDER3.forEach(o => { const hn = root.querySelector('#hn-' + o), v = fmtN(cnt[o]); if (hn.textContent !== v) hn.textContent = v;
    const hu = root.querySelector('#hu-' + o); if (hu.dataset.u !== unit) { hu.dataset.u = unit; hu.innerHTML = unit ? H(unit) : ''; } });
  /* en-têtes des délégations */
  for (const g of GROUPS) {
    const lane = root.querySelector(`.lane[data-g="${g}"]`), list = C.states.filter(s => groupOf(s) === g);
    const u = list.every(s => vd.st[s.c] === vd.st[list[0].c]) ? vd.st[list[0].c] : null;
    lane.querySelectorAll('.seg3 button').forEach(b => b.setAttribute('aria-pressed', u === b.dataset.go));
    const ld = lane.querySelector('.ld'); let h = '';
    if (C.reg[g] != null && t.d) { const [f, a] = vd.del[g], x = 10 - f - a;
      h = `<div class="dl" title="${esc(T('of 10 members'))}"><button type="button" class="stp" data-g="${g}" data-step="-1" aria-label="${esc(peopleName(g) + ': ' + T(LAB.a) + ' +1')}">−</button>
        <span class="pips" role="img" aria-label="${esc(`${T('Narodni Sabor')}, ${peopleName(g)}: ${T(LAB.f)} ${f}, ${T(LAB.x)} ${x}, ${T(LAB.a)} ${a}`)}">${'<i data-o="f"></i>'.repeat(f)}${'<i data-o="x"></i>'.repeat(x)}${'<i data-o="a"></i>'.repeat(a)}</span>
        <button type="button" class="stp" data-g="${g}" data-step="1" aria-label="${esc(peopleName(g) + ': ' + T(LAB.f) + ' +1')}">+</button><b class="dn" translate="no">${f}–${a}</b></div>`; }
    if (ld.innerHTML !== h) ld.innerHTML = h;
    lane.classList.toggle('dim', !!t.co && g === 'mun');
  }
  root.querySelectorAll('.tbtn').forEach(b => { const on = b.dataset.type === t.id; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
  root.querySelector('#tsel').value = t.id;
  root.querySelectorAll('#lay button').forEach(b => { b.setAttribute('aria-pressed', b.dataset.lay === mode); b.disabled = !!t.c; });
  const enc = encode(C, V);
  root.querySelectorAll('.sbtn').forEach(b => b.setAttribute('aria-pressed', scen[b.dataset.sc].enc === enc));
  if (t.c) council(vd);
  panel(E, st);
  const sh = t.c ? root.querySelector('#council').offsetHeight : mode === 'map' && MAP ? Math.round(stage.clientWidth * MAP.h / MAP.w) : lanesEl.offsetHeight;
  if (!measured) { layout(); retarget(true); nodes.forEach(n => { n.x = n.gx; n.y = n.gy; paint(n); }); caps(true); }
  else if (sh !== lastH) { layout(); retarget(!animate); }
  else if (moved || !animate) retarget(!animate);
  if (structural) caps(S.reduced || !sim);
  card(); table();
  if (animate) history.replaceState(null, '', '#' + enc + (mode === 'map' ? '-map' : ''));
  if (animate && st.done) document.getElementById('live').textContent = `${label(t.name)}: ${T(VERDICT[E.verdict][0])}. ${E.line ? label(E.line) : ''}`;
}
