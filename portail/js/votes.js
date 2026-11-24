/* votes.js — page « Votes and majorities » (#/votes), chargée avec sa page.
   Reprise de l'instrument du prototype Sabor (proto/sabor/js/instrument.js, branche claude/proto-tour-2),
   raccordée au portail : moteur unique (portail/js/regles.js, REGLES : règles, cas, libellés), langue
   (LANG, L, T), écriture (conversion du portail), thème, recherche. Plan : docs/lot3/PLAN.md ; ADR
   2026-11-24-votes-majorites.md ; mouvement : ADR 2026-11-23-mouvement-lecteur.md, section « #/votes ».

   On compose un vote : 52 États et 2 municipalités confédérales (disques dont la surface suit la
   population), les sept délégations du Narodni Sabor, les sept conseillers ; les règles de la Constitution
   répondent jauge par jauge, article cité, et un verdict se forme. Deux dispositions de la même scène : par
   peuple (rangées et camps) et géographique (place de chaque État, constitution/map.json). La couleur ne
   code que pour, contre, abstention et le verdict, toujours doublée par la forme ; aucune couleur par peuple.
   La page ne montre de l'État que son nom, son code, sa population et ses sièges : elle renvoie à sa fiche.

   Adresses : #/votes ; #/votes/<type> ; #/votes/<type>/<cas> ; #/votes/<type>/v-<code> ; suffixes /map
   (disposition géographique) et /<CODE> (disque choisi). La composition s'écrit dans l'adresse par
   history.replaceState. Le portail appelle VOTES.prepare(h), html(h), mounted(), inplace(h), rerender(), leave(). */
var VOTES = (function () {
  'use strict';
  const N = s => s;                                    // marqueur des chaînes de tables (scripts/textes.py)
  const $ = id => document.getElementById(id);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOB = matchMedia('(max-width:760px)');
  const D3F = ['vendor/d3-dispatch.min.js', 'vendor/d3-quadtree.min.js', 'vendor/d3-timer.min.js', 'vendor/d3-force.min.js'];
  const TITLE0 = document.title;
  const O3 = ['f', 'x', 'a'];                          // colonnes : pour, abstention, contre
  const NEXT = { f: 'a', a: 'x', x: 'f' };
  const MARK = { pass: '✓', fail: '✕', hold: '‖', wait: '…' };
  const PAGE = N('Votes and majorities');
  const LEAD = N('Place the States, the national delegations and the councillors, and see which majority the Constitution requires: each threshold cites its article, and every assumption is stated.');
  const RM = N('With reduced motion, the discs are not dragged: select one, then place it by clicking or with the arrow keys.');
  /* chiffre de chaque cas, à côté de son nom */
  const TAG = {
    'consent-given': E => `${fmtN(E.t.K.f)} – ${fmtN(E.t.K.a)}`,
    'two-peoples': E => `${E.t.yes.length} / 7`,
    'five-delegations': E => `${E.t.yes.length} / 7 · ${pct(E.t.regYes / C.regTotal)}`,
    alarm: E => { const g = E.gauges.find(x => x.id === 'alarm'), on = g.list.find(x => x.on); return `${E.t.alarm.length} × ${on ? on.n : 0} / 10`; },
    'six-of-seven': E => `${E.t.yes.length} / 7`,
    'nine-of-twelve': E => { const g = E.gauges.find(x => x.id === 'half'); return `${g.top} / ${E.t.coalStates}`; },
    'four-councillors': E => `${E.t.cv.f.length} – ${E.t.cv.a.length}`,
  };

  let C = null;                                        // contexte du moteur (sièges, registres)
  const ctx = () => C || (C = REGLES.contexte(STATES, STATS, PEUPLES));
  const LIB = () => REGLES.LIB;
  const type = () => REGLES.typeById(V.type);
  const typeName = t => L(LIB().type[t.id]) + (t.co ? ' · ' + L('{0} States', t.co) : '');
  const pct = (x, d = 1) => (x * 100).toLocaleString(L_LOC[LANG] || 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }) + (LANG === 'en' ? '%' : ' %');
  const fmtM = n => n ? L('{0} M', (n / 1e6).toLocaleString(L_LOC[LANG] || 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '0';
  const voteLab = o => L(LIB().vote[o]);
  const groupOf = s => s.p || (s.t === 'F' ? 'fed' : 'mun');
  const groupName = g => g === 'fed' ? L`Confederal territories` : g === 'mun' ? L`Confederal municipalities` : L(PEUPLES[g].en);
  const info = c => byCode(c) || { c, n: c, k: c.slice(0, 2), ch: '' };
  const sub = s => s.t === 'T' ? L(PEUPLES[s.p].en + ' state · seat {0}', info(s.c).ch) : L(info(s.c).ch).replace(/&amp;/g, '&');
  const inactive = s => { const t = type(); return !!t.c || (!!t.co && s.t === 'M'); };
  const artHref = n => { const id = 'art-' + String(n).replace(/ /g, ''), t = typeof cIndex === 'function' && CORE ? cIndex()[id] : null; return t ? `#/constitution/${t}/${id}` : '#/constitution'; };
  const glyph = o => `<i class="vo-gl" data-o="${o}" aria-hidden="true"></i>`;

  /* ---------------------------------------------------------------- textes de la Constitution
     Alinéas cités depuis les titres du lecteur (constitution/t/title-4 et title-8, langue de l'interface),
     désignés par les ancrages de core.json (scripts/build_lecteur.py). Fichier unique : CX_DATA. */
  const got = {}, cache = new Map();
  function load(p) {
    if (!cache.has(p)) {
      const inl = typeof CX_DATA !== 'undefined' && CX_DATA[p];
      cache.set(p, (inl ? Promise.resolve(inl) : fetch('data/constitution/' + p + DATA_V).then(r => {
        if (!r.ok) throw new Error(p + ' : ' + r.status); return r.json(); }))
        .then(d => (got[p] = d), e => { cache.delete(p); throw e; }));
    }
    return cache.get(p);
  }
  const QLANG = () => ['en', 'zap', 'sre', 'ist'].includes(LANG) ? LANG : 'en';
  const QFILES = () => ['t/title-4.' + QLANG() + '.json', 't/title-8.' + QLANG() + '.json'];
  const arts = {};
  function artOf(id) {
    const l = QLANG();
    if (!arts[l]) {
      const idx = {}, walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') {
        if (o.id && o.u) idx[o.id] = o; else Object.values(o).forEach(walk); } };
      QFILES().forEach(f => { if (got[f]) walk(got[f]); });
      if (QFILES().every(f => got[f])) arts[l] = idx; else return idx[id];
    }
    return arts[l][id];
  }
  /* un alinéa : son texte (renvois liés), sans le terme en gras qui l'ouvre (« b. Alarm-bell procedure. ») */
  function unit(key) {
    const a = CORE && CORE.anc[key], art = a && artOf(a[0]), u = art && art.u[a[1]];
    if (!u) return null;
    const h = u[0] === 'li' ? u[1] + ' ' + u[2] : u[u.length - 1];
    return { html: h.replace(/^<strong>[^<]*<\/strong>\s*/, ''), num: art.num };
  }
  function quote(keys) {
    const us = (Array.isArray(keys) ? keys : [keys]).map(unit).filter(Boolean);
    if (!us.length) return '';
    return `<blockquote class="vo-q">${us.map(u => `<span>${u.html}</span>`).join(' ')} <a class="vo-qa" href="${artHref(us[0].num)}">${esc(L`Art. ${us[0].num}`)}</a></blockquote>`;
  }
  const plain = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' ').trim(); };
  function lineHTML(line) {
    if (!line) return '';
    const v = LIB().line[line.k];
    return v && v.q ? quote(v.q) : v ? esc(L(v)) : '';
  }

  /* ---------------------------------------------------------------- adresses */
  const codeOf = v => REGLES.encode(ctx(), v).replace(/^vote-[a-z]+-/, '');
  function parse(h) {
    ctx();
    const p = (h || '').replace(/^#\/votes\/?/, '').split('/').filter(Boolean);
    const r = { open: true, type: 'consent', cas: null, code: null, map: false, sel: null };
    let i = 0;
    const t = p[0] && REGLES.typeBySlug(p[0]);
    if (t) { r.open = false; r.type = t.id; i = 1; }
    for (; i < p.length; i++) {
      const s = p[i];
      if (s === 'map') r.map = true;
      else if (/^[A-Za-z]{2}-\d{2}$/.test(s) && C.by[s.toUpperCase()]) r.sel = s.toUpperCase();
      else if (/^v-/.test(s) && !r.open) r.code = s.slice(2);
      else if (REGLES.caseById(s) && !r.open) r.cas = s;
    }
    if (r.cas) { r.type = REGLES.caseById(r.cas).type; r.code = null; }          // un cas porte son type
    if (r.code && !REGLES.decode(C, 'vote-' + r.type + '-' + r.code)) r.code = null;
    return r;
  }
  /* l'adresse de l'état affiché */
  function hashOf() {
    let h = '#/votes';
    if (!S.open) { h += '/' + type().slug; if (S.cas) h += '/' + S.cas; else if (S.dirty) h += '/v-' + codeOf(V); }
    if (mode === 'map') h += '/map';
    if (sel && pinned) h += '/' + sel;
    return h;
  }
  function writeHash() { const h = hashOf(); if (location.hash !== h) history.replaceState(null, '', h); }
  /* le vote d'une adresse : composition codée, cas, ou cas par défaut du type */
  function voteOf(r) {
    if (r.code) return REGLES.decode(C, 'vote-' + r.type + '-' + r.code);
    const sc = REGLES.caseById(r.cas) || REGLES.SCENARIOS.find(x => x.type === r.type) || REGLES.SCENARIOS[0];
    const v = sc.make(C); v.type = r.type; return v;
  }

  /* ---------------------------------------------------------------- état */
  const S = { open: true, cas: null, dirty: false, next: null, lang: null };
  let V = null, mode = 'lanes', sel = null, pinned = false, drag = null, dragged = false;
  let play = null, timer = 0, touch = false, GROUPS = [], scen = {}, built = '', lastW = 0, lastH = 0, measured = false;
  let root, stage, unitsEl, lanesEl, capsEl, tipEl, panelEl, nodes = [], byNode = {}, cells = {}, capEl = {};
  let sim = null, MAP = null, rz = null, ac = null, idle = 0, liveT = 0;

  async function prepare(h) {
    const r = parse(h);
    const jobs = QFILES().map(f => load(f).catch(() => null));
    if (r.map) jobs.push(load('map.json').then(d => { MAP = d; }).catch(() => { r.map = false; }));
    await Promise.all(jobs);
    r.h = h; S.next = r;
    return r;
  }

  /* ---------------------------------------------------------------- HTML */
  function html(h) {
    const r = S.next && S.next.h === h ? S.next : parse(h);
    S.next = null; S.open = r.open; S.cas = r.cas; S.dirty = !!r.code; S.lang = LANG;
    V = voteOf(r); mode = r.map && MAP ? 'map' : 'lanes'; sel = r.sel; pinned = !!r.sel;
    play = r.cas ? { id: r.cas, i: 0, n: 0, auto: false } : null;    // un cas ouvert par son adresse : dernière étape
    if (play) play.i = play.n = REGLES.typeById(V.type).steps.length + 1;
    GROUPS = [...C.order, 'fed', 'mun'];
    REGLES.SCENARIOS.forEach(s => { const v = s.make(C); scen[s.id] = { enc: REGLES.encode(C, v), tag: TAG[s.id](REGLES.evaluate(C, v)) }; });
    const popMax = Math.max(...C.states.map(s => s.pop));
    const sorted = [...C.states].sort((a, b) => GROUPS.indexOf(groupOf(a)) - GROUPS.indexOf(groupOf(b)) || b.pop - a.pop);
    nodes = sorted.map((s, i) => ({ s, i, g: groupOf(s), q: Math.sqrt(s.pop / popMax), o: null, x: 0, y: 0, px: -1, py: -1 }));
    byNode = {}; nodes.forEach(n => { byNode[n.s.c] = n; });
    const T = REGLES.TYPES, lanes = GROUPS.map(g => {
      const st = C.states.filter(s => groupOf(s) === g), seats = st.reduce((a, s) => a + s.s, 0);
      const cnt = g === 'mun' ? L('{0} confederal municipalities', st.length) : g === 'fed' ? L('{0} confederal territories', st.length) : L('{0} territorial states', st.length);
      return `<section class="vo-lane" data-g="${g}">
        <div class="vo-lh">
          <div class="vo-ln"><b>${esc(groupName(g))}</b><span class="vo-lm">${esc(cnt)}<span class="vo-lm2"> · ${esc(L('{0} Kongres seats', seats))}</span></span></div>
          <div class="vo-ld" data-g="${g}"></div>
          <div class="vo-seg3" role="group" aria-label="${esc(groupName(g))}">${O3.map(o =>
            `<button type="button" data-g="${g}" data-go="${o}" aria-pressed="false" aria-label="${esc(groupName(g) + ' : ' + voteLab(o))}" title="${esc(voteLab(o))}">${glyph(o)}</button>`).join('')}</div>
        </div>
        <div class="vo-track">${O3.map(o => `<div class="vo-cell" data-o="${o}"></div>`).join('')}</div>
      </section>`; }).join('');
    return crumb([['Home', '#/home'], ['Institutions', '#/institutions'], [PAGE]]) + `<div class="vo" id="vo" data-layout="${mode}">
  <section class="vo-top">
    <div class="vo-intro"><h1 id="voH">${esc(L(PAGE))}</h1><p class="vo-lead">${esc(L(LEAD))}</p></div>
    <div class="vo-ctl">
      <select class="vo-tsel" id="voTsel" aria-labelledby="voH">${T.map(t => `<option value="${t.id}">${esc(typeName(t))} · ${esc(t.arts.map(a => L`Art. ${a}`).join(', '))}</option>`).join('')}</select>
      <div class="vo-types" role="radiogroup" aria-labelledby="voH">${T.map(t =>
        `<button type="button" role="radio" class="vo-tbtn" data-type="${t.id}" aria-checked="false" tabindex="-1"><span>${esc(typeName(t))}</span><small translate="no">${t.arts.join(' · ')}</small></button>`).join('')}</div>
      <div class="vo-scn"><span class="vo-cap" id="voSch">${esc(L`Choose a case`)}</span>
        <div class="vo-scl" role="toolbar" aria-labelledby="voSch">${REGLES.SCENARIOS.map((s, i) =>
          `<button type="button" class="vo-sbtn" data-sc="${s.id}" aria-pressed="false" tabindex="${i ? -1 : 0}" title="${esc(L(s.name))}"><span>${esc(L(s.name))}</span><small translate="no">${esc(scen[s.id].tag)}</small></button>`).join('')}</div>
      </div>
    </div>
  </section>
  <section class="vo-scene" aria-label="${esc(L`States`)}">
    <div class="vo-layrow"><div class="vo-seg vo-lay" id="voLay" role="group"><button type="button" data-lay="lanes" aria-pressed="true">${esc(L`Constituent peoples`)}</button><button type="button" data-lay="map" aria-pressed="false">${esc(T_('nav_map'))}</button></div></div>
    <div class="vo-heads">${O3.map(o => `<div class="vo-head" data-o="${o}"><span class="vo-hl">${glyph(o)}${esc(voteLab(o))}</span><b class="vo-hn" id="voHn-${o}">0</b><span class="vo-hu" id="voHu-${o}"></span></div>`).join('')}</div>
    <div class="vo-stage" id="voStage">
      <div class="vo-units" id="voUnits" role="group" aria-label="${esc(L`States`)}" tabindex="-1">${nodes.map(n =>
        `<button type="button" class="vo-u" data-c="${n.s.c}" data-t="${n.s.t}" tabindex="-1"><span translate="no" aria-hidden="true">${esc(info(n.s.c).k)}</span></button>`).join('')}</div>
      <svg class="vo-geo" id="voGeo" aria-hidden="true" preserveAspectRatio="xMinYMin meet"></svg>
      <div class="vo-lanes" id="voLanes">${lanes}</div>
      <div class="vo-caps" id="voCaps" aria-hidden="true">${GROUPS.map(g => O3.map(o => `<i class="vo-cap-o" data-k="${g}|${o}"></i>`).join('')).join('')}</div>
      <div class="vo-council" id="voCouncil" role="group" aria-label="${esc(L`7 councillors, one per people`)}"></div>
      <div class="vo-tip" id="voTip" hidden></div>
    </div>
    <div class="vo-legend">
      <span><i class="vo-lg vo-big"></i><i class="vo-lg vo-sm"></i>${esc(L`Population`)}</span>
      <span><i class="vo-lg" data-t="T"></i>${esc(L`Territorial state`)}</span>
      <span><i class="vo-lg" data-t="F"></i>${esc(L`Confederal territory`)}</span>
      <span><i class="vo-lg" data-t="M"></i>${esc(L`Confederal municipality`)}</span>
    </div>
    <p class="vo-rm" id="voRm">${esc(L(RM))}</p>
    <details class="vo-tbl" id="voTbl"><summary>${esc(L`Show the figures as a table`)}</summary><div class="vo-tblw" id="voTblw"></div></details>
  </section>
  <aside class="vo-panel" id="voPanel" aria-label="${esc(L`Outcome`)}"></aside>
  <div class="vo-vh" id="voLive" aria-live="polite" aria-atomic="true"></div>
</div>`;
  }
  const T_ = k => T(k);                                 // chaîne d'interface (i18n.json)

  /* ---------------------------------------------------------------- montage */
  function mounted() {
    root = $('vo'); if (!root) return;
    if (ac) ac.abort();
    ac = new AbortController();
    stage = $('voStage'); lanesEl = $('voLanes'); unitsEl = $('voUnits'); capsEl = $('voCaps'); tipEl = $('voTip'); panelEl = $('voPanel');
    nodes.forEach(n => { n.el = unitsEl.querySelector(`[data-c="${n.s.c}"]`); });
    capEl = {}; capsEl.querySelectorAll('.vo-cap-o').forEach(c => { capEl[c.dataset.k] = { el: c, on: false, w: 0, h: 0 }; });
    measured = false; built = ''; sim = null;
    if (mode === 'map') drawGeo();
    bind();
    rmNote();
    apply(false, true);
    (nodes.find(n => n.s.c === sel) || nodes[0]).el.tabIndex = 0;
    if (sel) select(sel, pinned);
    writeHash();
    document.title = (cyrOn() ? cyrText(L(PAGE) + ' · ' + T('brand'), LANG) : L(PAGE) + ' · ' + T('brand'));
    if (!reduced()) idle = (window.requestIdleCallback || setTimeout)(() => startSim(), { timeout: 1500 });
    if (mode !== 'map') (window.requestIdleCallback || setTimeout)(() => load('map.json').then(d => { MAP = MAP || d; }).catch(() => {}), { timeout: 4000 });
  }
  /* mouvement réduit : le glisser est désactivé, la page le dit */
  function rmNote() {
    const on = reduced(), p = $('voRm');
    if (p) p.hidden = !on;
    if (unitsEl) { if (on) unitsEl.setAttribute('aria-describedby', 'voRm'); else unitsEl.removeAttribute('aria-describedby'); }
  }
  function inplace(h) {
    if (!root || !root.isConnected) return false;
    const r = parse(h);
    const go = () => {
      stopPlay();
      S.open = r.open; S.cas = r.cas; S.dirty = !!r.code;
      V = voteOf(r);
      if (r.cas) { play = { id: r.cas, i: 0, n: type().steps.length + 1, auto: false }; play.i = play.n; }
      if (r.sel) select(r.sel, true); else if (pinned) select(null);
      if ((r.map ? 'map' : 'lanes') !== mode) setMode(r.map ? 'map' : 'lanes'); else apply(true, true);
      writeHash();
    };
    if (r.map && !MAP) load('map.json').then(d => { MAP = d; go(); }, () => { r.map = false; go(); }); else go();
    return true;
  }
  function leave() {
    if (!root) return;
    if (sim) sim.stop(); sim = null; stopPlay();
    if (idle && window.cancelIdleCallback) cancelIdleCallback(idle);
    if (rz) rz.disconnect(); rz = null;
    if (ac) ac.abort(); ac = null;
    root = null; measured = false; sel = null; pinned = false;
    if (document.title !== TITLE0 && !$('vo')) document.title = TITLE0;
  }
  /* langue ou écriture : les citations de la langue chargées, la page est redessinée à l'identique (la
     composition est dans l'adresse), à la même hauteur */
  function rerender() {
    if (!$('vo')) return false;
    const y = scrollY;
    Promise.all(QFILES().map(f => load(f).catch(() => null))).then(() => {
      if (!$('vo')) return;
      renderNow(); scrollTo({ top: y, behavior: 'instant' });
    });
    return true;
  }

  /* ---------------------------------------------------------------- disposition */
  const onResize = () => { if (root && measured && stage.clientWidth !== lastW) { layout(); retarget(true); placeTip(); } };
  function flow(list, width) {                          // rangées de disques, du plus peuplé au moins peuplé
    const rows = []; let row = null;
    for (const n of list) {
      const d = 2 * n.br + 3;
      if (!row || row.w + d > width) { row = { w: 0, h: 2 * n.br + 3, items: [] }; rows.push(row); }
      row.items.push(n); row.w += d;
    }
    return rows;
  }
  function drawGeo() {
    const g = $('voGeo'); if (!g || !MAP || g.childElementCount) return;
    g.setAttribute('viewBox', `0 0 ${MAP.w} ${MAP.h}`);
    g.innerHTML = Object.keys(MAP.e).map(c => `<path class="vo-land" d="${MAP.e[c].d}"/>`).join('');
  }
  function layout() {
    const W = lastW = stage.clientWidth, council = !!type().c, mob = MOB.matches, geo = mode === 'map' && MAP;
    /* surface du disque = population ; plancher de lisibilité pour les plus petites entités */
    const rmax = mob ? 19 : 26, rmin = mob ? 6 : 10, ms = geo ? Math.max(.55, Math.min(1, W / 880)) : 1;
    nodes.forEach(n => { n.br = Math.max(rmin, rmax * n.q); n.r = n.br * ms;
      n.el.style.setProperty('--d', (2 * n.r).toFixed(1) + 'px'); n.el.classList.toggle('vo-xs', n.r < 9.5); });
    const mapH = geo ? Math.round(W * MAP.h / MAP.w) : 0;
    lanesEl.style.top = mapH + 'px';
    if (!geo) {
      const cell = stage.querySelector('.vo-cell'), cellW = (cell ? cell.clientWidth : W / 3) - 10;
      stage.querySelectorAll('.vo-lane').forEach(l => {
        const h = flow(nodes.filter(n => n.g === l.dataset.g), cellW).reduce((a, r) => a + r.h, 0);
        l.querySelector('.vo-track').style.height = Math.max(mob ? 44 : 50, Math.ceil(h) + 12) + 'px';
      });
      const sr = stage.getBoundingClientRect();
      stage.querySelectorAll('.vo-lane').forEach(l => l.querySelectorAll('.vo-cell').forEach(c => {
        const r = c.getBoundingClientRect(), k = l.dataset.g + '|' + c.dataset.o;
        cells[k] = { x0: r.left - sr.left, x1: r.right - sr.left, y0: r.top - sr.top, y1: r.bottom - sr.top, cx: (r.left + r.right) / 2 - sr.left, cy: (r.top + r.bottom) / 2 - sr.top };
      }));
    } else relax(W);
    const h = council ? $('voCouncil').offsetHeight : mapH + lanesEl.offsetHeight;
    stage.style.height = h + 'px'; lastH = h; measured = true;
  }
  /* disposition géographique : chaque disque part du point intérieur de son État (map.json), puis les
     chevauchements sont écartés (même résultat avec ou sans animation) */
  function relax(W) {
    const k = W / MAP.w, P = nodes.map(n => { const c = MAP.e[n.s.c].c; return { n, cx: c[0] * k, cy: c[1] * k, x: c[0] * k, y: c[1] * k }; });
    for (let it = 0; it < 160; it++) {
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const a = P[i], b = P[j], dx = b.x - a.x || .01, dy = b.y - a.y || .01, d = Math.hypot(dx, dy), m = a.n.r + b.n.r + 2;
        if (d < m) { const f = (m - d) / d / 2, wa = b.n.r / (a.n.r + b.n.r), wb = 1 - wa;
          a.x -= dx * f * wa; a.y -= dy * f * wa; b.x += dx * f * wb; b.y += dy * f * wb; }
      }
      for (const p of P) { p.x += (p.cx - p.x) * .04; p.y += (p.cy - p.y) * .04; }
    }
    for (const p of P) { p.n.mx = Math.max(p.n.r, Math.min(W - p.n.r, p.x)); p.n.my = Math.max(p.n.r, p.y); }
  }
  /* cibles : la place de chaque disque dans la grille de son camp (rangées par cellule), ou la place de
     son État ; la simulation de forces y mène, le mouvement réduit y pose (mêmes places) */
  function retarget(instant) {
    const geo = mode === 'map' && MAP;
    if (geo) nodes.forEach(n => { n.gx = n.mx; n.gy = n.my; n.y0 = -1e9; n.y1 = 1e9; });
    else for (const g of GROUPS) for (const o of O3) {
      const c = cells[g + '|' + o]; if (!c) continue;
      const list = nodes.filter(n => n.g === g && n.o === o);
      const rows = flow(list, c.x1 - c.x0 - 10), H0 = rows.reduce((a, r) => a + r.h, 0);
      let y = c.cy - H0 / 2;
      for (const r of rows) { let x = c.cx - r.w / 2;
        for (const n of r.items) { n.gx = x + n.br + 1.5; n.gy = y + r.h / 2; x += 2 * n.br + 3; }
        y += r.h; }
      list.forEach(n => { n.y0 = c.y0 + n.r + 2; n.y1 = c.y1 - n.r - 2; });
    }
    nodes.forEach(n => { n.tx = n.gx; n.ty = n.gy; });
    if (reduced() || !sim || instant) placeGrid(instant);   // instantané (largeur changée, arrivée) : posé, la simulation reste au repos
    else { sim.force('x').strength(geo ? .2 : .14).initialize(nodes); sim.force('y').strength(geo ? .2 : .16).initialize(nodes);
      sim.alpha(instant ? .9 : .7).restart(); }
  }
  function placeGrid(instant) {
    const move = () => { nodes.forEach(n => { n.x = n.gx; n.y = n.gy; paint(n); n.el.style.opacity = ''; }); caps(); placeTip(); };
    const moved = nodes.filter(n => Math.abs(n.x - n.gx) > .5 || Math.abs(n.y - n.gy) > .5);
    if (instant || !moved.length) return move();
    moved.forEach(n => { n.el.classList.add('vo-fade'); n.el.style.opacity = '0'; });   // fondu court : s'efface, se range, reparaît
    setTimeout(move, 140);
  }
  const paint = n => { n.px = n.x; n.py = n.y; n.el.style.transform = `translate3d(${(n.x - n.r).toFixed(1)}px,${(n.y - n.r).toFixed(1)}px,0)${n.s.t === 'M' ? ' rotate(45deg) scale(.84)' : ''}`; };
  function caps() {                                     // cadre de groupe : un par délégation et par camp
    const bb = {};
    if (mode === 'lanes' && !type().c) for (const n of nodes) { const k = n.g + '|' + n.o, b = bb[k] || (bb[k] = [1e9, 1e9, -1e9, -1e9]);
      if (n.x - n.r < b[0]) b[0] = n.x - n.r; if (n.y - n.r < b[1]) b[1] = n.y - n.r; if (n.x + n.r > b[2]) b[2] = n.x + n.r; if (n.y + n.r > b[3]) b[3] = n.y + n.r; }
    for (const k in capEl) { const c = capEl[k], b = bb[k];
      if (!b) { if (c.on) { c.on = false; c.el.style.opacity = '0'; } continue; }
      if (!c.on) { c.on = true; c.el.style.opacity = '1'; }
      const w = Math.round(b[2] - b[0] + 10), h = Math.round(b[3] - b[1] + 10);
      c.el.style.transform = `translate3d(${(b[0] - 5).toFixed(1)}px,${(b[1] - 5).toFixed(1)}px,0)`;
      if (w !== c.w) { c.w = w; c.el.style.width = w + 'px'; }
      if (h !== c.h) { c.h = h; c.el.style.height = h + 'px'; } }
  }
  /* simulation de forces (d3-force), chargée au repos après le premier rendu, jamais en mouvement réduit ;
     elle part au repos : rien ne bouge avant le premier geste */
  async function startSim() {
    idle = 0;
    if (sim || !root || reduced()) return;
    try { await need(D3F); } catch (e) { return; }
    if (!root || reduced() || sim || !window.d3 || !d3.forceSimulation) return;
    const geo = mode === 'map' && MAP;
    sim = d3.forceSimulation(nodes)
      .velocityDecay(.34).alphaDecay(.03).alphaMin(.012).alpha(0)
      .force('x', d3.forceX(n => n.tx).strength(geo ? .2 : .14))
      .force('y', d3.forceY(n => n.ty).strength(geo ? .2 : .16))
      .force('c', d3.forceCollide(n => n.r + 1.5).strength(.9).iterations(3))
      .on('tick', () => {
        const w = lastW;
        for (const n of nodes) {
          if (n.fx == null) { if (n.y < n.y0) { n.y = n.y0; n.vy *= .3; } else if (n.y > n.y1) { n.y = n.y1; n.vy *= .3; }
            if (n.x < n.r) n.x = n.r; else if (n.x > w - n.r) n.x = w - n.r; }
          if (Math.abs(n.x - n.px) > .2 || Math.abs(n.y - n.py) > .2) paint(n);   // n'écrire que ce qui a bougé
        }
        caps();
        if (sel && !tipEl.hidden) placeTip();
      });
    sim.stop();
  }
  async function setMode(m) {
    if (m === 'map' && !MAP) { try { MAP = await load('map.json'); } catch (e) { return; } }
    if (!root) return;
    if (m === 'map') drawGeo();
    mode = m; root.dataset.layout = m;
    if (reduced()) root.classList.add('vo-cut');               // mouvement réduit : coupe et fondu de 0,2 s
    layout(); retarget(false);
    apply(true, false);
    if (reduced()) setTimeout(() => { if (root) root.classList.remove('vo-cut'); }, 220);
  }

  /* ---------------------------------------------------------------- pas à pas */
  function stopPlay() { clearTimeout(timer); timer = 0; play = null; }
  function startPlay(id) {
    const sc = REGLES.caseById(id);
    V = sc.make(C); stopPlay();
    S.open = false; S.cas = id; S.dirty = false;
    play = { id, i: 0, n: REGLES.typeById(sc.type).steps.length + 1, auto: !reduced() };
    apply(true, true);
    if (play.auto) timer = setTimeout(tick, 650);
  }
  function tick() { if (!play || !root) return; if (play.i < play.n) { play.i++; apply(true, false); } if (play && play.auto && play.i < play.n) timer = setTimeout(tick, 1900); }
  function stepTo(d) { if (!play) return; clearTimeout(timer); play.auto = false; play.i = Math.max(1, Math.min(play.n, play.i + d)); apply(true, false); }
  /* le vote tel qu'il est montré à l'étape courante, et les jauges déjà atteintes */
  function staged() {
    if (!play) return { v: V, shown: null, done: true };
    const t = type(), groups = t.steps.slice(0, play.i), shown = new Set(groups.flat());
    const v = REGLES.blank(C, V.type, 'x');
    if (play.i >= 1) { v.st = V.st; v.cv = V.cv; }
    if (['ns', 'del', 'alarm'].some(k => shown.has(k)) || !t.steps.flat().some(k => ['ns', 'del', 'alarm'].includes(k))) v.del = V.del;
    return { v, shown, done: play.i >= play.n };
  }

  /* ---------------------------------------------------------------- gestes */
  function manual() { stopPlay(); S.open = false; S.cas = null; S.dirty = true; }
  function setSt(c, o) { manual(); V.st[c] = o; apply(true); }
  function cycle(c) { setSt(c, NEXT[V.st[c]]); }
  function select(c, pin) {
    if (sel && byNode[sel]) byNode[sel].el.classList.remove('vo-sel');
    sel = c; pinned = !!(c && pin);
    if (c && byNode[c]) { const n = byNode[c]; n.el.classList.add('vo-sel'); nodes.forEach(m => { m.el.tabIndex = m === n ? 0 : -1; }); }
    card(); writeHash();
  }
  function nearest(e) {                                 // zone de toucher de 44 px autour de chaque disque
    const r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = null, bd = 1e9;
    for (const n of nodes) { const d = Math.hypot(n.x - x, n.y - y) - n.r; if (d < bd) { bd = d; best = n; } }
    return best && bd <= Math.max(0, 22 - best.r) + 2 ? best : null;
  }
  function roving(box, q, dir) {
    const items = [...box.querySelectorAll(q)], i = items.indexOf(document.activeElement), j = (i + dir + items.length) % items.length;
    items.forEach((b, k) => { b.tabIndex = k === j ? 0 : -1; }); items[j].focus(); return items[j];
  }
  function setType(id) { manual(); V.type = id; built = ''; apply(true, true); }
  function bind() {
    const o = { signal: ac.signal };
    root.addEventListener('pointerdown', e => { touch = e.pointerType === 'touch'; }, { capture: true, signal: ac.signal });
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b && root.contains(b)) {
        if (b.dataset.type) setType(b.dataset.type);
        else if (b.dataset.sc) startPlay(b.dataset.sc);
        else if (b.dataset.stp) stepTo(+b.dataset.stp);
        else if (b.dataset.lay) { if (b.dataset.lay !== mode) { stopPlayKeep(); setMode(b.dataset.lay).then(writeHash); } }
        else if (b.dataset.go) { manual(); REGLES.setGroup(C, V, b.dataset.g, b.dataset.go); apply(true); }
        else if (b.dataset.step) step(b.dataset.g, +b.dataset.step);
        else if (b.dataset.seat) { manual(); V.cv[b.dataset.seat] = NEXT[V.cv[b.dataset.seat] || 'x']; seatMove(); }
        else if (b.dataset.set) setSt(b.dataset.c, b.dataset.set);
        else if (b.dataset.x) select(null);
        else if (b.id === 'voCopy') copy();
        else if (b.id === 'voPv') { if (MOB.matches) { panelEl.classList.toggle('vo-open'); b.setAttribute('aria-expanded', panelEl.classList.contains('vo-open')); } }
        else if (b.classList.contains('vo-u')) hit(byNode[b.dataset.c]);
        return;
      }
      if (e.target.closest('#voStage') && !e.target.closest('.vo-tip,.vo-lh,.vo-council')) { const n = nearest(e); if (n) hit(n); else if (pinned) select(null); }
    }, o);
    $('voTsel').addEventListener('change', e => setType(e.target.value), o);
    root.querySelector('.vo-types').addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
      e.preventDefault(); const b = roving(e.currentTarget, '.vo-tbtn', d); setType(b.dataset.type); }, o);
    root.querySelector('.vo-scl').addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); roving(e.currentTarget, '.vo-sbtn', d); } }, o);
    $('voTbl').addEventListener('change', e => { const r = e.target; if (r.name && r.name.startsWith('v-')) setSt(r.name.slice(2), r.value); }, o);
    $('voTbl').addEventListener('toggle', e => { if (e.target.open) table(); }, o);
    unitsEl.addEventListener('pointerover', e => { const b = e.target.closest('.vo-u'); if (b && e.pointerType === 'mouse' && !drag && !pinned) select(b.dataset.c, false); }, o);
    unitsEl.addEventListener('pointerout', e => { if (e.pointerType === 'mouse' && !pinned && !drag && !unitsEl.contains(document.activeElement)) select(null); }, o);
    unitsEl.addEventListener('focusin', e => { const b = e.target.closest('.vo-u'); if (b && b.dataset.c !== sel) select(b.dataset.c, pinned); }, o);
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && sel) select(null); }, o);
    unitsEl.addEventListener('keydown', e => {
      const b = e.target.closest('.vo-u'); if (!b) return;
      const n = byNode[b.dataset.c], k = e.key;
      if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); const m = nodes[(n.i + (k === 'ArrowDown' ? 1 : nodes.length - 1)) % nodes.length]; select(m.s.c, pinned); m.el.focus(); }
      else if ((k === 'ArrowLeft' || k === 'ArrowRight') && !inactive(n.s)) { e.preventDefault();
        const i = O3.indexOf(V.st[n.s.c]) + (k === 'ArrowRight' ? 1 : -1); if (i >= 0 && i < 3) setSt(n.s.c, O3[i]); }
      else if (k === 'Enter') { e.preventDefault(); location.hash = '#/state/' + n.s.c; }
      else if (k === ' ') { e.preventDefault(); if (!inactive(n.s)) cycle(n.s.c); }
    }, o);
    /* glisser (souris, stylet) : le disque suit le pointeur, le camp est celui où on le lâche */
    unitsEl.addEventListener('pointerdown', e => {
      const b = e.target.closest('.vo-u'); if (!b || e.pointerType === 'touch' || e.button || !sim || mode !== 'lanes' || reduced()) return;
      const n = byNode[b.dataset.c]; if (inactive(n.s)) return;
      drag = { n, x: e.clientX, y: e.clientY, on: false, id: e.pointerId };
    }, o);
    addEventListener('pointermove', onMove, o); addEventListener('pointerup', onUp, o); addEventListener('pointercancel', onUp, o);
    addEventListener('resize', onResize, o);
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { rmNote(); if (reduced() && sim) { sim.stop(); sim = null; placeGrid(true); } }, o);
    rz = new ResizeObserver(() => { onResize(); panelTop(); }); rz.observe(stage); rz.observe(panelEl);
  }
  function stopPlayKeep() { clearTimeout(timer); timer = 0; if (play) play.auto = false; }
  /* un disque visé ; au toucher : sélection seule, le vote se fait par les boutons de l'infobulle ;
     à la souris : le disque change de camp et son infobulle s'épingle */
  function hit(n) {
    if (dragged) { dragged = false; return; }
    if (!touch && !inactive(n.s)) cycle(n.s.c);
    select(n.s.c, true);
  }
  function onMove(e) {
    if (!drag || !root) return;
    if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
    const r = stage.getBoundingClientRect(), n = drag.n;
    if (!drag.on) { drag.on = true; n.el.classList.add('vo-drag'); try { n.el.setPointerCapture(drag.id); } catch (x) { /* */ } sim.alphaTarget(.25).restart(); select(n.s.c, false); tipEl.hidden = true; }
    n.fx = e.clientX - r.left; n.fy = e.clientY - r.top;
    stage.dataset.drop = campAt(n, n.fx);
  }
  function campAt(n, x) { return x < cells[n.g + '|f'].x1 ? 'f' : x < cells[n.g + '|x'].x1 ? 'x' : 'a'; }
  function onUp() {
    if (!drag) return;
    const n = drag.n;
    if (drag.on && root) { dragged = true; setTimeout(() => { dragged = false; }, 60);
      const o = campAt(n, n.fx); n.fx = n.fy = null; n.el.classList.remove('vo-drag'); delete stage.dataset.drop;
      if (sim) sim.alphaTarget(0);
      if (o !== V.st[n.s.c]) setSt(n.s.c, o); else if (sim) sim.alpha(.4).restart();
      select(n.s.c, true); }
    drag = null;
  }
  function step(g, d) {                                 // un membre de la délégation change de camp
    manual();
    let [f, a] = V.del[g];
    if (d > 0) { if (a > 0) { a--; f++; } else if (f + a < 10) f++; }
    else { if (f > 0) { f--; a++; } else if (f + a < 10) a++; }
    V.del[g] = [f, a]; apply(true);
  }
  /* les sièges du Konfederalno Veće changent de colonne (élément partagé par siège) ; jamais pendant une
     transition du routeur, jamais en mouvement réduit */
  function seatMove() {
    const rt = document.documentElement;
    const name = on => document.querySelectorAll('#voCouncil .vo-seat').forEach(b => { b.style.viewTransitionName = on ? 'vo-seat-' + b.dataset.seat : ''; });
    if (document.startViewTransition && !reduced() && !rt.dataset.vt) {
      rt.dataset.vt = 'vo'; name(true);                  // noms posés le temps de la transition : jamais pendant un glissement de page
      const t = document.startViewTransition(() => { apply(true); name(true); });
      const done = () => { if (rt.dataset.vt === 'vo') delete rt.dataset.vt; name(false); };
      t.finished.then(done, done);
    } else apply(true);
  }
  async function copy() {
    const url = location.href.split('#')[0] + hashOf();
    try { await navigator.clipboard.writeText(url); } catch (e) {
      const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (x) { /* */ } t.remove(); }
    toast(L`Link copied`);
  }

  /* ---------------------------------------------------------------- infobulle du disque visé */
  function card() {
    if (!root) return;
    const n = sel && byNode[sel], pc = panelEl.querySelector('.vo-pcard');
    if (!n) { tipEl.hidden = true; if (pc) pc.hidden = true; return; }
    const s = n.s, off = inactive(s), o = V.st[s.c], nm = info(s.c).n;
    const acts = pinned ? `<div class="vo-tip-a"><div class="vo-seg3 vo-big" role="group" aria-label="${esc(nm)}">${O3.map(x =>
        `<button type="button" data-set="${x}" data-c="${s.c}" aria-pressed="${o === x}"${off ? ' disabled' : ''}>${glyph(x)}<span>${esc(voteLab(x))}</span></button>`).join('')}</div>
      <a class="btn btn-ghost" href="#/state/${s.c}">${esc(L`Open state page`)} →</a></div>` : '';
    const h = `<div class="vo-tip-h"><code translate="no">${s.c}</code><strong>${esc(nm)}</strong>${pinned ? `<button type="button" class="vo-tip-x" data-x="1" aria-label="${esc(L`Cancel`)}">×</button>` : ''}</div>
    <div class="vo-tip-l">${esc(sub(s))}</div>
    <div class="vo-tip-f"><span>${esc(L`Population`)} <b>${fmtN(s.pop)}</b></span><span>${esc(L`Kongres seats`)} <b>${s.s}</b></span></div>${acts}`;
    if (MOB.matches) { tipEl.hidden = true; if (pc) { pc.hidden = !pinned; pc.innerHTML = h; if (cyrOn()) cyrApply(pc); } }
    else { if (pc) pc.hidden = true; tipEl.innerHTML = h; if (cyrOn()) cyrApply(tipEl); tipEl.hidden = false; tipEl.classList.toggle('vo-pin', pinned); placeTip(); }
  }
  function placeTip() {
    const n = sel && byNode[sel]; if (!n || !tipEl || tipEl.hidden) return;
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight, W = lastW;
    const x = Math.max(4, Math.min(W - w - 4, n.x - w / 2)), up = n.y - n.r - h - 10, y = up < -40 ? n.y + n.r + 10 : up;
    tipEl.style.transform = `translate3d(${x.toFixed(0)}px,${y.toFixed(0)}px,0)`;
  }

  /* ---------------------------------------------------------------- panneau : verdict et jauges */
  const reqText = g => esc(g.req).replace('{f}', esc(voteLab('f'))).replace('{a}', esc(voteLab('a')));
  const orgOf = g => g.id === 'k23' ? L(LIB().org.conciliation) + ' · ' + L(LIB().org.kongres) : L(LIB().org[g.org]);
  function gaugeHTML(g) {
    const head = `<div class="vo-g-h"><span class="vo-g-org">${esc(orgOf(g))}</span><span class="vo-g-req">${reqText(g)}</span><span class="vo-g-arts">${g.arts.map(artLink).join(' ')}</span><span class="vo-g-st"><i aria-hidden="true"></i><span class="vo-vh"></span></span></div>`;
    const barEl = `<div class="vo-g-bar${g.max ? ' vo-max' : ''}" aria-hidden="true"><i class="vo-bf"></i><i class="vo-ba"></i><i class="vo-tick"></i></div>`;
    let body = '';
    if (g.kind === 'bar') body = `${barEl}<div class="vo-g-n"><span>${glyph('f')}<span class="vo-vh">${esc(voteLab('f'))} </span><b data-r="f"></b></span><span>${glyph('x')}<span class="vo-vh">${esc(voteLab('x'))} </span><span data-r="x"></span></span><span>${glyph('a')}<span class="vo-vh">${esc(voteLab('a'))} </span><span data-r="a"></span></span><span class="vo-need" data-r="need"></span></div>`;
    else if (g.kind === 'count' && g.list) body = `<div class="vo-chips">${g.list.map(x => `<span class="vo-chip" data-p="${x.p}">${esc(L(PEUPLES[x.p].en))}</span>`).join('')}</div>
      <div class="vo-g-n"><span><b data-r="v"></b> / ${g.total}</span></div>`;
    else if (g.kind === 'count') body = `${barEl}<div class="vo-g-n"><span>${glyph('f')}<b data-r="v"></b> / ${g.total}</span></div>`;
    else if (g.kind === 'share') body = `${barEl}<div class="vo-g-n"><span><b data-r="v"></b></span><span data-r="x"></span></div>`;
    else if (g.kind === 'alarm') body = `<div class="vo-chips">${g.list.map(x => `<span class="vo-chip" data-p="${x.p}" data-al="0">${esc(L(PEUPLES[x.p].en))} <b translate="no"></b></span>`).join('')}</div>`;
    return `<article class="vo-g" data-g="${g.id}"${g.soft ? ' data-soft="1"' : ''}>${head}${body}${g.hyp ? `<p class="vo-g-hyp">${esc(L(LIB().hyp[g.hyp]))}</p>` : ''}</article>`;
  }
  const setR = (el, r, v) => { const e = el.querySelector(`[data-r="${r}"]`); if (e && e.textContent !== v) e.textContent = v; };
  function gaugeSet(el, g, on) {                         // mise à jour en place : rien n'est reconstruit
    const live = on && g.when !== false;
    el.dataset.ok = live ? (g.ok ? 1 : 0) : ''; el.classList.toggle('vo-wait', !live);
    el.querySelector('.vo-g-st i').textContent = live ? (g.ok ? '✓' : g.soft ? '–' : '✕') : '';
    el.querySelector('.vo-g-st .vo-vh').textContent = live ? (g.ok ? L`Met` : L`Not met`) : '';
    const bar = el.querySelector('.vo-g-bar');
    const W = (f, a, t) => { if (!bar) return; bar.children[0].style.width = (live ? f : 0) + '%'; bar.children[1].style.width = (live ? a : 0) + '%'; bar.children[2].style.left = t + '%'; };
    if (g.kind === 'bar') {
      const fmt = g.unit === 'inhabitants' ? fmtM : fmtN, need = g.need == null ? (g.f + g.a) / 2 : g.need;
      W(g.f / g.total * 100, g.a / g.total * 100, live ? need / g.total * 100 : 50);
      setR(el, 'f', live ? fmt(g.f) : '–'); setR(el, 'x', live ? fmt(g.x) : '–'); setR(el, 'a', live ? fmt(g.a) : '–');
      setR(el, 'need', live ? (g.need == null ? '> ' + fmt((g.f + g.a) / 2) : '≥ ' + fmt(g.need)) : '');
    } else if (g.kind === 'count' && g.list) {
      el.querySelectorAll('.vo-chip').forEach((c, i) => { c.dataset.on = live && g.list[i].on ? 1 : 0; if (live && g.list[i].off) c.dataset.off = 1; else delete c.dataset.off; });
      setR(el, 'v', live ? String(g.value) : '–');
    } else if (g.kind === 'count') { W(g.value / g.total * 100, 0, g.need / g.total * 100); setR(el, 'v', live ? String(g.value) : '–'); }
    else if (g.kind === 'share') { W(g.value * 100, 0, 50); setR(el, 'v', live ? pct(g.value) : '–');
      setR(el, 'x', live && g.topP ? `${g.top} / ${g.n} · ${L(PEUPLES[g.topP].en)}` : ''); }
    else if (g.kind === 'alarm') el.querySelectorAll('.vo-chip').forEach((c, i) => { c.dataset.al = live && g.list[i].on ? 1 : 0; c.lastElementChild.textContent = live ? g.list[i].n + '/10' : ''; });
  }
  const verdictWord = (t, v) => v === 'wait' ? '…' : L(LIB()[t.co ? 'request' : 'verdict'][v]);
  function panel(E, st) {
    const t = E.type, key = t.id + '|' + LANG + '|' + cyrOn();
    if (built !== key) {                                 // structure : une fois par type de décision
      built = key;
      const art = t.arts[0];
      panelEl.innerHTML = `<div class="vo-pstep" hidden></div><div class="vo-pcard" hidden></div>
    <button type="button" class="vo-pv" id="voPv"${MOB.matches ? ` aria-expanded="${panelEl.classList.contains('vo-open')}" aria-controls="voPb"` : ''}>
      <span class="vo-pv-m" aria-hidden="true"></span><span class="vo-pv-t"><span class="vo-pv-k">${esc(typeName(t))}</span><strong></strong></span>
      <span class="vo-pv-g" aria-hidden="true">${E.gauges.map(g => `<i data-g="${g.id}"></i>`).join('')}</span></button>
    <div class="vo-pb" id="voPb"><div class="vo-pv-l"></div>
      <div class="vo-rule" id="voRule">${quote(t.desc)}</div>
      <div class="vo-pa"><button type="button" class="btn btn-ghost" id="voCopy">${esc(L`Copy link`)}</button><a class="btn btn-ghost" href="${artHref(art)}">${esc(L`Article ${art}`)} →</a></div>
      <div class="vo-gs">${E.gauges.map(gaugeHTML).join('')}</div>
      <details class="vo-hyp"><summary>${esc(L`Assumptions of the calculation`)}</summary><ul>${E.hyp.map(h => `<li>${esc(L(LIB().hyp[h]))}</li>`).join('')}</ul></details>
    </div>`;
      if (cyrOn()) cyrApply(panelEl);
    }
    const done = st.done, v = done ? E.verdict : 'wait', pv = $('voPv');
    pv.dataset.v = v; pv.querySelector('.vo-pv-m').textContent = MARK[v];
    const word = pv.querySelector('strong'), w = verdictWord(t, v);
    if (word.dataset.w !== v + key) { word.dataset.w = v + key; word.textContent = w; if (cyrOn()) cyrApply(word); }
    const line = panelEl.querySelector('.vo-pv-l'), lk = done && E.line ? E.line.k : '';
    if (line.dataset.k !== lk + key) { line.dataset.k = lk + key; line.innerHTML = done ? lineHTML(E.line) : ''; line.hidden = !line.innerHTML; if (cyrOn()) cyrApply(line); }
    E.gauges.forEach(g => { const on = !st.shown || st.shown.has(g.id); gaugeSet(panelEl.querySelector(`.vo-g[data-g="${g.id}"]`), g, on);
      const d = panelEl.querySelector(`.vo-pv-g [data-g="${g.id}"]`); d.dataset.ok = on && g.when !== false ? (g.ok ? 1 : 0) : ''; });
    const ps = panelEl.querySelector('.vo-pstep');
    if (play) {
      const groups = t.steps, i = play.i, gs = i >= 1 && i <= groups.length ? groups[i - 1].map(id => E.gauges.find(g => g.id === id)).filter(g => g && g.when !== false) : [];
      const cap = i === 0 ? '' : i > groups.length ? `<span aria-hidden="true">${MARK[E.verdict]}</span> ${esc(verdictWord(t, E.verdict))}` : gs.map(g => `<span aria-hidden="true">${g.ok ? '✓' : g.soft ? '–' : '✕'}</span><span class="vo-vh">${esc(g.ok ? L`Met` : L`Not met`)} :</span> ${esc(orgOf(g))} <span>${reqText(g)}</span>`).join(' · ');
      ps.hidden = false;
      ps.innerHTML = `<span class="vo-ps-n">${esc(L('Step {0} of {1}', Math.max(1, i), play.n))}</span><span class="vo-ps-c">${cap}</span>
      <span class="vo-ps-b"><button type="button" data-stp="-1"${i <= 1 ? ' disabled' : ''}>← ${esc(L`Previous`)}</button><button type="button" data-stp="1"${i >= play.n ? ' disabled' : ''}>${esc(L`Next`)} →</button></span>`;
      if (cyrOn()) cyrApply(ps);
    } else if (!ps.hidden) { ps.hidden = true; ps.innerHTML = ''; }
    panelTop();
  }
  function panelTop() {                                  // le panneau reste entier : collé en haut s'il tient, sinon il suit la page
    if (!panelEl) return;
    if (MOB.matches) { panelEl.style.top = ''; return; }
    const hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 150, top = hdr - 4;
    panelEl.style.top = Math.min(top, innerHeight - panelEl.offsetHeight - 16) + 'px';
  }
  function council(v) {
    const el = $('voCouncil'), max = Math.max(...C.order.map(p => C.reg[p])), mob = MOB.matches;
    el.innerHTML = `<div class="vo-cn-cols">${O3.map(o => `<div class="vo-cn-col" data-o="${o}">${C.order.filter(p => (v.cv[p] || 'x') === o).map(p =>
      `<button type="button" class="vo-seat" data-seat="${p}" style="--d:${Math.round((mob ? 30 : 44) + (mob ? 46 : 84) * Math.sqrt(C.reg[p] / max))}px" aria-label="${esc(L(PEUPLES[p].en) + ' : ' + voteLab(o))}"><i class="vo-disc" data-o="${o}"></i><b>${esc(L(PEUPLES[p].en))}</b><small>${pct(C.reg[p] / C.regTotal)}</small></button>`).join('')}</div>`).join('')}</div>
    <p class="vo-cn-n">${esc(L`7 councillors, one per people`)} · ${esc(L(LIB().hyp.reg))}</p>`;
    if (cyrOn()) cyrApply(el);
  }
  function table() {
    const w = $('voTblw'); if (!$('voTbl').open) return;
    w.innerHTML = `<table><thead><tr><th>${esc(L`Name`)}</th><th>${esc(L`Constituent people`)}</th><th class="vo-num">${esc(L`Population`)}</th><th class="vo-num">${esc(L`Kongres seats`)}</th><th>${esc(L`Outcome`)}</th></tr></thead><tbody>${nodes.map(n => {
      const s = n.s, off = inactive(s);
      return `<tr><th scope="row"><a href="#/state/${s.c}"><code translate="no">${s.c}</code> ${esc(info(s.c).n)}</a></th><td>${esc(groupName(n.g))}</td><td class="vo-num">${fmtN(s.pop)}</td><td class="vo-num">${s.s}</td>
      <td><fieldset class="vo-rad"${off ? ' disabled' : ''}><legend class="vo-vh">${esc(info(s.c).n)}</legend>${O3.map(o =>
        `<label><input type="radio" name="v-${s.c}" value="${o}"${V.st[s.c] === o ? ' checked' : ''} aria-label="${esc(voteLab(o))}"><span class="vo-rb"></span>${glyph(o)}</label>`).join('')}</fieldset></td></tr>`; }).join('')}</tbody></table>`;
    if (cyrOn()) cyrApply(w);
  }
  function announce(t, E) {
    clearTimeout(liveT);
    liveT = setTimeout(() => { const el = $('voLive'); if (!el) return;
      el.textContent = `${typeName(t)} : ${verdictWord(t, E.verdict)}. ${E.line ? plain(lineHTML(E.line)) : ''}`; if (cyrOn()) cyrApply(el); }, 400);
  }
  function apply(animate, structural) {
    if (!root) return;
    const t = type(), E = REGLES.evaluate(C, V), st = staged(), vd = st.v, Ed = play ? REGLES.evaluate(C, vd) : E;
    root.dataset.type = t.id; root.dataset.layout = mode; root.classList.toggle('vo-is-council', !!t.c);
    let moved = false;
    for (const n of nodes) {
      const o = vd.st[n.s.c];
      if (n.o !== o) { n.o = o; moved = true; }
      n.el.dataset.o = o; n.el.classList.toggle('vo-off', inactive(n.s));
      n.el.setAttribute('aria-label', `${info(n.s.c).n}, ${groupName(n.g)}, ${n.s.s} ${L`Kongres seats`} : ${voteLab(o)}`);
    }
    /* têtes de colonnes : la mesure qui compte pour ce type de décision */
    const raw = { f: 0, x: 0, a: 0 }; C.states.forEach(s => { if (s.t !== 'M') raw[vd.st[s.c]]++; });
    const cnt = t.c ? { f: Ed.t.cv.f.length, x: Ed.t.cv.x.length, a: Ed.t.cv.a.length } : t.k ? Ed.t.K : t.co ? raw : Ed.t.St;
    const unit = t.c ? '' : t.k ? L`Kongres seats` : L`States`;
    O3.forEach(o => { const hn = $('voHn-' + o), v = fmtN(cnt[o]); if (hn.textContent !== v) hn.textContent = v;
      const hu = $('voHu-' + o); if (hu.dataset.u !== unit) { hu.dataset.u = unit; hu.textContent = unit; if (cyrOn()) cyrApply(hu); } });
    /* en-têtes des délégations */
    for (const g of GROUPS) {
      const lane = root.querySelector(`.vo-lane[data-g="${g}"]`), list = C.states.filter(s => groupOf(s) === g);
      const u = list.every(s => vd.st[s.c] === vd.st[list[0].c]) ? vd.st[list[0].c] : null;
      lane.querySelectorAll('.vo-seg3 button').forEach(b => b.setAttribute('aria-pressed', u === b.dataset.go));
      const ld = lane.querySelector('.vo-ld'); let h = '';
      if (C.reg[g] != null && t.d) { const [f, a] = vd.del[g], x = 10 - f - a, nm = L(PEUPLES[g].en);
        h = `<div class="vo-dl" title="${esc(L`of 10 members`)}"><button type="button" class="vo-stp" data-g="${g}" data-step="-1" aria-label="${esc(nm + ' : ' + voteLab('a') + ' +1')}">−</button>
          <span class="vo-pips" role="img" aria-label="${esc(`${L`Narodni Sabor`}, ${nm} : ${voteLab('f')} ${f}, ${voteLab('x')} ${x}, ${voteLab('a')} ${a}`)}">${'<i data-o="f"></i>'.repeat(f)}${'<i data-o="x"></i>'.repeat(x)}${'<i data-o="a"></i>'.repeat(a)}</span>
          <button type="button" class="vo-stp" data-g="${g}" data-step="1" aria-label="${esc(nm + ' : ' + voteLab('f') + ' +1')}">+</button><b class="vo-dn" translate="no">${f}–${a}</b></div>`; }
      if (ld.dataset.h !== h) { const had = ld.contains(document.activeElement) && document.activeElement.dataset.step;
        ld.dataset.h = h; ld.innerHTML = h; if (cyrOn()) cyrApply(ld);
        if (had) { const b = ld.querySelector(`[data-step="${had}"]`); if (b) b.focus(); } }
      lane.classList.toggle('vo-dim', !!t.co && g === 'mun');
    }
    root.querySelectorAll('.vo-tbtn').forEach(b => { const on = b.dataset.type === t.id; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
    $('voTsel').value = t.id;
    root.querySelectorAll('#voLay button').forEach(b => { b.setAttribute('aria-pressed', b.dataset.lay === mode); b.disabled = !!t.c; });
    const enc = REGLES.encode(C, V);
    root.querySelectorAll('.vo-sbtn').forEach(b => b.setAttribute('aria-pressed', scen[b.dataset.sc].enc === enc));
    if (t.c) council(vd);
    panel(E, st);
    const sh = t.c ? $('voCouncil').offsetHeight : lastH;
    if (!measured) { layout(); retarget(true); nodes.forEach(n => { n.x = n.gx; n.y = n.gy; paint(n); }); caps(); }
    else if (structural || sh !== lastH) { layout(); retarget(!animate); }
    else if (moved || !animate) retarget(!animate);
    card(); table();
    if (animate) writeHash();
    if (animate && st.done) announce(t, E);
  }

  return { prepare, html, mounted, inplace, leave, rerender, parse, SLUGS: () => REGLES.TYPES.map(t => t.slug) };
})();
