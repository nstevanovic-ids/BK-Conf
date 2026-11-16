/* Atlas — le territoire est l'interface.
   Noyau : routes par hash, feuillet, carte SVG de la Confédération (cliquable dès le premier
   rendu), palette, clavier. MapLibre (map.js) n'est chargé qu'au premier zoom, à la première
   ouverture d'État ou au repos ; les instruments de la Constitution (inst.js) à la lecture. */
import { setUI, getLang, setLangVar, SCRIPTS, scriptOf, cyrOn, cyrText, T, L, L_LOC, U, UT, gloss, fmtD, fmtN, esc,
  cyrApply, disp, fold, fold2 } from './i18n.js';

const $ = s => document.querySelector(s);
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const MOBQ = matchMedia('(max-width:599px),(max-width:899px) and (orientation:portrait)');
const DESK = { get matches() { return !MOBQ.matches; } };
const LOWQ = matchMedia('(max-height:520px) and (min-width:600px) and (orientation:landscape)');
const J = u => fetch(u).then(r => { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); });
const lang = getLang;

let CORE = null, UI = { langs: {}, t: {}, tx: {}, new: [] };
let BY = {}, PLACES = null, COMMUNES = null, FLAGS = {};
const CONS = {}, MUN = {};
let R = { v: 'home' }, MODE = 'pop', mapApi = null, FOCUS = null, LEVEL = 0;
let INST = null, INSTV = null, RETREAT = false;      // module inst.js, vue d'instrument en cours, carte en retrait
try { const m = localStorage.getItem('atlas-mode'); if (m === 'pop' || m === 'dens' || m === 'gdp') MODE = m; } catch (e) {}

/* ============================================================
   Données
   ============================================================ */
function decRing(flat, q) {
  let x = flat[0], y = flat[1];
  const out = [[x / q, y / q]];
  for (let i = 2; i < flat.length; i += 2) { x += flat[i]; y += flat[i + 1]; out.push([x / q, y / q]); }
  out.push(out[0]);
  return out;
}
const decPolys = (g, q) => g.map(poly => poly.map(r => decRing(r, q)));
const klass = (v, br) => v == null ? -1 : br.reduce((n, b) => n + (v >= b ? 1 : 0), 0);
const densOf = s => s.pop != null && s.area ? s.pop / s.area : null;
const valOf = (s, mode) => mode === 'pop' ? s.pop : mode === 'dens' ? densOf(s) : s.gdp;

function loadMun(code) {
  if (MUN[code]) return MUN[code];
  return MUN[code] = J(`data/mun/${code}.json`).then(d => {
    const st = BY[code], br = CORE.breaks.mun, gc = klass(st.gdp, CORE.breaks.state.gdp);
    d.m.forEach((m, i) => {
      m.c = code; m.rank = i + 1; m.dens = m.a ? m.p / m.a : null;
      m.coords = decPolys(m.g, d.q); delete m.g;
      m.pc = klass(m.p, br.pop); m.dc = klass(m.dens, br.dens); m.gc = gc;
      m.seat = st.seat === m.s;
    });
    d.by = Object.fromEntries(d.m.map(m => [m.s, m]));
    d.frag = decPolys(d.f, d.q); d.outline = d.o.map(r => decRing(r, d.q)); d.gc = gc;
    delete d.f; delete d.o;
    return MUN[code] = d;
  });
}
const munNow = code => (MUN[code] && !MUN[code].then) ? MUN[code] : null;
async function loadCons(l) {
  const k = l === 'en' ? 'en' : l;
  if (!CONS[k]) CONS[k] = await J(`data/constitution${k === 'en' ? '' : '.' + k}.json`);
  if (!CONS.en) CONS.en = await J('data/constitution.json');
  if (!PLACES) PLACES = await J('data/places.json');
  if (!CONS.idx) {
    CONS.idx = {};
    CONS.en.titles.forEach(t => t.chapters.forEach(c => c.articles.forEach(a => { CONS.idx[a.id] = t.id; })));
  }
  return CONS[k];
}
const cDoc = () => CONS[lang()] || CONS.en;

/* ============================================================
   Routes : #home, #state-LK-20, #mun-LK-20-gospic, #constitution, #title-4, #art-102
   (les routes du portail en ligne, #/state/LK-20, #/constitution/title-4/art-110, sont redirigées)
   ============================================================ */
function legacy(h) {
  const p = h.replace(/^#\//, '').split('/');
  if (p[0] === 'state' && p[1]) return '#state-' + p[1];
  if (p[0] === 'constitution') return p[2] ? '#' + p[2] : p[1] ? '#' + p[1] : '#constitution';
  if (p[0] === 'map' || p[0] === 'states' || p[0] === 'home' || !p[0]) return '#home';
  return '#home';
}
function parse(h) {
  h = (h || '').replace(/^#/, '');
  let m;
  if ((m = /^state-([A-Z]{2}-\d{2})$/.exec(h)) && BY[m[1]]) return { v: 'state', c: m[1] };
  if ((m = /^mun-([A-Z]{2}-\d{2})-([a-z0-9-]+)$/.exec(h)) && BY[m[1]]) return { v: 'mun', c: m[1], s: m[2] };
  if (h === 'constitution') return { v: 'cons' };
  if ((m = /^title-([a-z0-9]+)$/.exec(h))) return { v: 'title', t: 'title-' + m[1] };
  if ((m = /^art-([a-z0-9]+)$/.exec(h))) return { v: 'title', a: 'art-' + m[1] };
  return { v: 'home' };
}
let SRC = '', VTSRC = null;      // d'où vient la navigation (carte, palette, feuillet) ; élément partagé de départ
const go = (h, src) => { SRC = src || ''; if (location.hash === h) route(); else location.hash = h; };
function upLevel() {
  if (R.v === 'mun') return go('#state-' + R.c, 'map');
  if (R.v === 'title') return go('#constitution', 'map');
  if (R.v !== 'home') return go('#home', 'map');
  if (mapApi) mapApi.home();
}

/* ---------- transitions de vue à éléments partagés ---------- */
function vtTag(el, name) { if (el) el.style.viewTransitionName = name; return el; }
function vtClear() { document.querySelectorAll('[style*="view-transition-name"]').forEach(e => { e.style.viewTransitionName = ''; }); }
function vtOld(next) {
  if (next.v === 'state') {
    const row = VTSRC && VTSRC.closest ? VTSRC.closest('a[data-c]') : null;
    if (row && row.querySelector('.nm')) { vtTag(row.querySelector('.nm'), 'ent-name'); vtTag(row.querySelector('code'), 'ent-code'); return; }
    const lab = document.querySelector(`${document.body.classList.contains('svgmode') ? '#svlabels' : '#labels'} .lb.on[data-c="${next.c}"]`);
    vtTag(lab, 'ent-name');
  } else if (next.v === 'title' && next.a && VTSRC && VTSRC.classList && VTSRC.classList.contains('po')) {
    vtTag(VTSRC.querySelector('code'), 'art-num'); vtTag(VTSRC.querySelector('b'), 'ent-name');
  } else if (next.v === 'mun') {
    const row = VTSRC && VTSRC.closest ? VTSRC.closest('a[data-s]') : null;
    if (row) vtTag(row.querySelector('.nm'), 'ent-name');
  }
}
function vtNew() {
  vtClear();
  if (R.v === 'state') { vtTag($('#sheetBody h1'), 'ent-name'); vtTag($('#sheetBody .tag'), 'ent-code'); }
  else if (R.v === 'mun') vtTag($('#sheetBody h1'), 'ent-name');
  else if (R.v === 'title' && R.a) { const a = document.getElementById(R.a); if (a) { vtTag(a.querySelector('.num'), 'art-num'); vtTag(a.querySelector('h3'), 'ent-name'); } }
}

let _seq = 0, _booted = false;
async function route() {
  if (/^#\//.test(location.hash)) { history.replaceState(null, '', legacy(location.hash)); }
  const seq = ++_seq, prev = R, src = SRC; SRC = '';
  let next = parse(location.hash);
  const body = $('#sheetBody');
  if (next.v === 'cons' || next.v === 'title') {
    await loadCons(lang());
    if (!INST && next.v === 'title') INST = (await import('./inst.js')).create(instCtx());
    if (seq !== _seq) return;
    if (next.v === 'title') {
      if (next.a && !CONS.idx[next.a]) next = { v: 'cons' };
      else { next.t = next.a ? CONS.idx[next.a] : next.t; if (!cDoc().titles.find(t => t.id === next.t)) next = { v: 'cons' }; }
    }
  }
  if (next.v === 'mun') {
    const d = await loadMun(next.c);
    if (seq !== _seq) return;
    if (!d.by[next.s]) next = { v: 'state', c: next.c };
  }
  const key = lang() + scriptOf();
  /* même titre déjà affiché : on fait défiler, on ne redessine pas */
  if (next.v === 'title' && prev.v === 'title' && prev.t === next.t && prev.lang === key && $('#' + next.t + '-body')) {
    R = next; R.lang = key;
    if (R.a) jumpArt(R.a, false); else { body.scrollTo({ top: 0 }); readerTick(true); }
    chrome();
    return;
  }
  const draw = () => {
    R = next; R.lang = key;
    document.body.className = document.body.className.replace(/\bv-\w+/g, '').trim() + ' v-' + (R.v === 'title' ? 'cons' : R.v);
    document.body.classList.toggle('wide', R.v === 'cons');
    const html = R.v === 'state' ? vState(BY[R.c]) : R.v === 'mun' ? vMun(BY[R.c], MUN[R.c].by[R.s])
      : R.v === 'cons' ? vCons() : R.v === 'title' ? vTitle() : vHome();
    const stat = !_booted && R.v === 'home' && lang() === 'en' && body.querySelector('.pad.home > .motto');
    if (stat) {       // texte statique déjà peint : on le garde (c'est l'élément LCP) et on complète dessous
      const t = document.createElement('template'); t.innerHTML = html;
      for (let i = 0; i < 4; i++) t.content.firstElementChild.remove();
      stat.parentNode.appendChild(t.content);
    } else body.innerHTML = `<div class="pad ${R.v}">${html}</div>`;
    cyrApply(body);
    body.scrollTop = 0;
    chrome();
    if (R.v === 'state') fillMunList(R.c);
    if (R.v !== 'title') { _now = null; mapRole(); }
  };
  const vt = _booted && document.startViewTransition && !RM.matches && prev.v + (prev.c || '') + (prev.t || '') !== next.v + (next.c || '') + (next.t || '');
  if (vt) {
    vtClear(); vtOld(next);
    const tr = document.startViewTransition(() => { draw(); vtNew(); });
    try { await tr.updateCallbackDone; } catch (e) {}
    tr.finished.then(vtClear, vtClear);
  } else draw();
  VTSRC = null;
  if (R.v === 'title') { if (R.a) jumpArt(R.a, true); else readerTick(true); }
  if (!DESK.matches) setSnap(R.v === 'home' && prev.v === 'home' ? sheet.dataset.snap : (R.v === 'cons' || (R.v === 'title' && RETREAT)) ? 'full' : 'half');
  if (R.v === 'state' || R.v === 'mun') needGL().then(api => { if (seq === _seq) { stageSync(); api.sync(R, { from: prev }); } });
  else if (mapApi && R.v === 'home') mapApi.sync(R, { from: prev });
  stageSync();
  /* le focus reste sur la carte quand l'action en vient (flèches + Entrée, Échap, palette) */
  if (_booted && prev.v !== R.v) { if (src === 'map') $('#map').focus({ preventScroll: true }); else body.focus({ preventScroll: true }); }
}

function setTitle() {
  const brand = 'Balkanska Konfederacija';
  let t = brand;
  if (R.v === 'state') t = `${BY[R.c].n} (${R.c}) · ${brand}`;
  else if (R.v === 'mun') t = `${MUN[R.c].by[R.s].n} · ${BY[R.c].n} · ${brand}`;
  else if (R.v === 'cons') t = `${L('Constitution')} · ${brand}`;
  else if (R.v === 'title') {
    const a = R.a && artOf(R.a);
    t = `${a ? cNum(a.num) : cNum(titleOf(R.t).num)} · ${L('Constitution')} · ${brand}`;
  }
  document.title = disp(t);
}

function chrome() {
  setTitle();
  const root = T('f_conf'), parts = [];
  const cr = (i, lab, href, cur, code, ghost) => `<${href && !cur ? `a href="${href}"` : 'span'} class="cr${ghost ? ' ghost' : ''}"${cur ? ' aria-current="page"' : ''}><i>${i}</i>${esc(lab)}${code ? `<code translate="no">${code}</code>` : ''}</${href && !cur ? 'a' : 'span'}>`;
  parts.push(cr(1, root, '#home', R.v === 'home' && !FOCUS));
  if (R.v === 'state' || R.v === 'mun') parts.push(cr(2, BY[R.c].n, '#state-' + R.c, R.v === 'state', R.c));
  if (R.v === 'mun') parts.push(cr(3, MUN[R.c].by[R.s].n, '', true));
  if (R.v === 'cons' || R.v === 'title') parts.push(cr(2, L('Constitution'), '#constitution', R.v === 'cons'));
  if (R.v === 'title') { const a = R.a && artOf(R.a); parts.push(cr(3, a ? cNum(a.num, true) : cNum(titleOf(R.t).num), '', true)); }
  if (R.v === 'home' && FOCUS && BY[FOCUS]) parts.push(cr(2, BY[FOCUS].n, '#state-' + FOCUS, false, FOCUS, true));
  const el = $('#crumbs');
  el.innerHTML = parts.join('<span class="crs" aria-hidden="true">›</span>');
  el.setAttribute('aria-label', disp(L('Territory')));
  cyrApply(el);
  el.scrollLeft = el.scrollWidth;
  el.classList.toggle('s0', el.scrollLeft < 2);
  document.documentElement.lang = cyrOn() ? (lang() === 'ist' ? 'bg' : 'sh-Cyrl') : ((UI.langs[lang()] || {}).html || 'en');
}
$('#crumbs').addEventListener('scroll', e => e.currentTarget.classList.toggle('s0', e.currentTarget.scrollLeft < 2), { passive: true });

/* ============================================================
   Feuillets
   ============================================================ */
const fnLab = s => L(s.ch).replace(/&amp;/g, '&');
function valLab(v, mode) {
  if (v == null) return L('pending');
  return mode === 'pop' ? fmtN(v) : mode === 'dens' ? L('{0} / km²', fmtN(Math.round(v))) : L('{0} PPS', fmtN(v));
}
function shortLab(v, mode) {
  if (mode === 'dens') return fmtN(v);
  if (v >= 1e6) return L('{0} M', (v / 1e6).toLocaleString(L_LOC[lang()] || 'en-GB', { maximumFractionDigits: 1 }));
  if (v >= 1e3) return L('{0} k', fmtN(Math.round(v / 100) / 10));
  return fmtN(v);
}
const modeName = m => L(m === 'pop' ? 'Population' : m === 'dens' ? 'Density' : 'GDP per capita');

/* liste des 54 entités : triée par l'indicateur actif, filtrable par type */
let FILT = 'all';
function stateRows() {
  const list = CORE.states.filter(s => FILT === 'all' || s.t === FILT)
    .sort((a, b) => (valOf(b, MODE) ?? -1) - (valOf(a, MODE) ?? -1) || (a.c < b.c ? -1 : 1));
  const max = Math.max(...CORE.states.map(s => valOf(s, MODE) || 0));
  return list.map((s, i) => {
    const v = valOf(s, MODE);
    return `<li><a href="#state-${s.c}" data-c="${s.c}"><span class="rk">${i + 1}</span><code translate="no">${s.c}</code>
      <span class="nm">${esc(s.n)}<small>${s.p === 'fed' ? esc(fnLab(s)) : esc(L(CORE.peoples[s.p].en))}</small></span>
      <span class="v">${esc(valLab(v, MODE))}</span><span class="bar" style="width:${v ? Math.max(1, 100 * v / max).toFixed(1) : 0}%"></span></a></li>`;
  }).join('');
}
function listHead() {
  const f = [['all', L('All')], ['T', L('Territorial states')], ['F', L('Confederal territories')], ['M', L('Confederal municipalities')]];
  return `<div class="chips" role="group" aria-label="${esc(L('Status'))}">${f.map(([k, lab]) => `<button type="button" data-filt="${k}" aria-pressed="${k === FILT}">${esc(lab)}</button>`).join('')}</div>
  <p class="sub" style="margin:0 0 8px">${esc(modeName(MODE))} · ${esc(MODE === 'pop' ? L('Latest census or population register of each country') : MODE === 'dens' ? L('Inhabitants per km²') : L('GDP per capita, PPS, 2023'))}</p>`;
}
function listDraw() {
  const box = $('#stBox'); if (!box) return;
  box.innerHTML = listHead() + `<ul class="elist st" id="stList">${stateRows()}</ul>`;
  cyrApply(box);
}

function vHome() {
  const caps = CORE.states.filter(s => s.t === 'F');
  const n = t => CORE.states.filter(s => s.t === t).length;
  return `
  <div class="eyebrow">${esc(T('h_official_portal'))}</div>
  <h1>${T('h_hero')}</h1>
  <p class="lead">${esc(L('A confederation of fifty-two states and seven constituent South Slavic peoples, united in a Balkan union founded on the equality of states and on direct democracy.'))}</p>
  <p class="motto">${esc(L('“Naš dom” · Our home.'))}</p>
  <div class="figs">
    <div class="fig"><b>${n('T') + n('F')}</b><span>${esc(L('Confederated states'))}</span></div>
    <div class="fig"><b>${Object.keys(CORE.peoples).length}</b><span>${esc(L('Constituent peoples'))}</span></div>
    <div class="fig"><b>${caps.length}</b><span>${esc(L('Confederal capitals'))}</span></div>
    <div class="fig"><b>${CORE.aut.length}</b><span>${esc(L('Autonomous communities'))}</span></div>
  </div>
  <a class="entry" href="#constitution"><div><b>${esc(T('h_constitution_h1'))}</b>
    <span>${esc(L('Consolidated text, version {0} of {1}.', CORE.cons.version.replace('v', ''), fmtD(CORE.cons.iso)))}</span></div><em>${esc(L('Read'))} →</em></a>
  <a class="entry" href="#art-110"><div><b>${esc(L('Consensus first, then a double key'))}</b>
    <span>${esc(L('Without consensus, a decision needs four councillors whose peoples hold a majority of enrolled citizens, or five councillors.'))}</span></div><em>${esc(cNum('Article 110', true))} →</em></a>
  <a class="entry" href="#art-132"><div><b>${esc(L('Confederal financial equalisation formula'))}</b>
    <span>${esc(L('Article 132, objective indicators, 85% floor of fiscal capacity per capita.'))}</span></div><em>${esc(cNum('Article 132', true))} →</em></a>
  <h2>${esc(L('Confederal capitals'))}</h2>
  <div class="caps">${caps.map(s => `<a class="capb" href="#state-${s.c}" data-c="${s.c}"><b>${esc(s.n)}</b><span>${esc(fnLab(s))}</span></a>`).join('')}</div>
  <h2>${esc(L('Explore the states'))}</h2>
  <div id="stBox">${listHead()}<ul class="elist st" id="stList">${stateRows()}</ul></div>`;
}

const kd = (dt, dd, cls, small) => `<div${cls === 'w' ? ' class="w"' : ''}><dt>${esc(dt)}</dt><dd${cls && cls !== 'w' ? ` class="${cls}"` : ''}>${dd}${small ? `<small>${small}</small>` : ''}</dd></div>`;
/* Un seul décompte : celui de stats.json ; quand la carte porte moins de contours que de communes
   (communes sans contour GADM propre, ville-État d'un seul tenant), l'écart est libellé. */
const outlines = s => s.nu !== s.nm ? `${fmtN(s.nu)} ${U('mapped outlines')}` : '';
function vState(s) {
  const fed = s.p === 'fed', pu = fed ? null : CORE.peoples[s.p];
  const typeLabel = { T: 'Territorial state', F: 'Confederal territory', M: 'Confederal autonomous municipality' }[s.t];
  const note = CORE.notes[s.k] || '';
  const auts = CORE.aut.filter(a => a.host === s.c);
  const comLab = { Serb: 'serb community', Turkish: 'turkish community', Albanian: 'albanian community', Bosniak: 'bosniak community',
    Croat: 'croat community', Slovak: 'slovak community', Special: 'special community', Hungarian: 'hungarian community', Bulgarian: 'bulgarian community' };
  const dens = densOf(s), fd = FLAGS[s.c] || [3, 2];
  return `
  <a class="back" href="#home">‹ ${esc(T('f_conf'))}</a>
  <div class="eyebrow">${esc(L(typeLabel))}</div>
  <h1>${esc(s.n)}</h1>
  <div class="codeline"><span class="tag" translate="no">${s.c}</span><span>${fed ? esc(fnLab(s)) : esc(gloss(pu.en, pu.name))}</span></div>
  <figure class="flag"><img src="data/flags/${s.c}.png" width="${fd[0]}" height="${fd[1]}" alt="" decoding="async">
    <figcaption>${esc(L(note))}</figcaption></figure>
  <dl class="kd">
    ${fed ? kd(L('Function'), esc(fnLab(s)), 't') : kd(L('Seat'), esc(s.ch), 't')}
    ${fed ? kd(L('Status'), esc(L(typeLabel)), 't') : kd(L('Regional standard'), esc(L(CORE.std[pu.std])), 't')}
    ${kd(L('Population'), s.pop != null ? fmtN(s.pop) : '·', '', s.pop != null ? esc(L(s.src)) : esc(L('Pending census data')))}
    ${kd(L('Area'), s.area ? esc(L('{0} km²', fmtN(s.area))) : '·')}
    ${kd(L('Population density'), dens != null ? esc(L('{0} / km²', fmtN(Math.round(dens)))) : '·')}
    ${kd(L('Municipalities'), s.nm != null ? fmtN(s.nm) : '—', '', outlines(s))}
    ${kd(L('GDP per capita (PPS, est.)'), s.gdp != null ? esc(L('{0} PPS', fmtN(s.gdp))) : '·', 'w',
      s.gdp != null ? `${esc(L('{0}% of the EU-27 average', fmtN(s.gdp_eu)))} · ${esc(L(s.gsrc))}` : esc(L('Pending regional accounts')))}
  </dl>
  ${s.t !== 'M' ? `<a class="entry" href="#art-103"><div><b>${esc(L('Kongres seats'))}</b><span>${esc(L('Constituency of {0} ({1})', s.n, s.c))}</span></div><em>${esc(cNum('Article 103', true))} →</em></a>` : ''}
  ${auts.length ? `<h2>${esc(L('Autonomous communities'))}</h2>
  <ul class="aut">${auts.map(a => `<li><b>${esc(a.n)}</b><span><code translate="no">${a.id}</code> · ${esc(L(comLab[a.com] || a.com))}</span></li>`).join('')}</ul>
  <p class="note">${esc(L('Communities holding their own powers in education, culture and municipal affairs (Art. 1 quater).')).replace(/((?:Art|[Čč]l|Чл|чл)\. 1 quater)/, '<a class="ref" href="#art-1quater">$1</a>')}</p>` : ''}
  <h2>${esc(L('Municipalities'))}</h2>
  <p class="sub" id="muNote" style="margin:-4px 0 10px">${fmtN(s.nm)}${s.nu !== s.nm ? ' · ' + outlines(s) : ''}</p>
  <ul class="elist mun" id="muList" aria-busy="true"></ul>
  <p class="note">${esc(L("Key data are aggregated from the state's municipalities: population from each country's latest census or population register, area from municipal boundaries, GDP per capita from Eurostat regional accounts (2023, purchasing power standards) averaged by population. In Bosnia and Herzegovina, regional GDP is only published by entity."))}</p>`;
}
async function fillMunList(code) {
  const d = await loadMun(code), ul = $('#muList');
  if (!ul || R.c !== code) return;
  const max = d.m[0] ? d.m[0].p : 1;
  /* ville-État d'un seul tenant : ses communes sont nommées, sans chiffre propre */
  const solo = d.m.length === 1 && d.m[0].mb ? d.m[0].mb.map(n => `<li class="mb">${esc(n)}</li>`).join('') : '';
  ul.innerHTML = d.m.map(m => `<li><a href="#mun-${code}-${m.s}" data-s="${m.s}">
    <span class="nm">${esc(m.n)}${m.seat ? `<small>${esc(L('Seat'))}</small>` : ''}</span>
    <span class="v">${fmtN(m.p)}</span><span class="bar" style="width:${Math.max(1, 100 * m.p / max).toFixed(1)}%"></span></a></li>`).join('') + solo;
  ul.removeAttribute('aria-busy');
  cyrApply(ul);
}

function vMun(s, m) {
  const d = MUN[s.c];
  const alt = [m.o, ...(m.mb || [])].filter(Boolean);
  const share = s.pop ? (100 * m.p / s.pop) : null;
  return `
  <a class="back" href="#state-${s.c}">‹ ${esc(s.n)}</a>
  <div class="eyebrow">${esc(L('Municipality'))}${m.seat ? ' · ' + esc(L('Seat')) : ''}</div>
  <h1>${esc(m.n)}</h1>
  ${alt.length ? `<p class="sub">${alt.map(esc).join(' · ')}</p>` : ''}
  <dl class="kd">
    ${kd(L('Population'), fmtN(m.p), '', `${esc(L('Rank {0} of {1}', fmtN(m.rank), fmtN(d.m.length)))}${d.m.length !== s.nm ? ' ' + U('mapped outlines') : ''} · ${esc(L(s.src))}`)}
    ${kd(L('Area'), esc(L('{0} km²', fmtN(m.a >= 10 ? Math.round(m.a) : m.a))))}
    ${kd(L('Population density'), m.dens != null ? esc(L('{0} / km²', fmtN(Math.round(m.dens)))) : '·')}
    ${kd(L('State of attachment'), `<a class="ref" href="#state-${s.c}">${esc(s.n)}</a>`, 't', `<code translate="no">${s.c}</code> · ${s.p === 'fed' ? esc(fnLab(s)) : esc(L(CORE.peoples[s.p].en))}`)}
    ${share != null ? `<div class="w"><dt>${esc(s.n)} · ${esc(L('Population'))}</dt><dd>${share.toLocaleString(L_LOC[lang()] || 'en-GB', { maximumFractionDigits: 1 })} %</dd>
      <div class="gz-b" style="margin:8px 0 4px"><i style="width:${Math.max(.5, share).toFixed(1)}%"></i></div></div>` : ''}
  </dl>
  ${s.t !== 'M' ? `<a class="entry" href="#art-103"><div><b>${esc(L('Kongres seats'))}</b><span>${esc(L('Constituency of {0} ({1})', s.n, s.c))}</span></div><em>${esc(cNum('Article 103', true))} →</em></a>` : ''}
  <h2>${esc(s.n)}</h2>
  <ul class="elist mun" id="muList">${d.m.map(x => `<li><a href="#mun-${s.c}-${x.s}" data-s="${x.s}"${x === m ? ' class="cur" aria-current="true"' : ''}>
    <span class="nm">${esc(x.n)}</span><span class="v">${fmtN(x.p)}</span><span class="bar" style="width:${Math.max(1, 100 * x.p / d.m[0].p).toFixed(1)}%"></span></a></li>`).join('')}</ul>`;
}

/* ---------- Constitution : la carte en est l'instrument ---------- */
const titleOf = id => cDoc().titles.find(t => t.id === id);
function artOf(id) { for (const t of cDoc().titles) for (const c of t.chapters) for (const a of c.articles) if (a.id === id) return a; return null; }
const cArticles = t => t.chapters.flatMap(c => c.articles);
function cNum(num, abbr) {
  const m = /^(Title|Chapter|Section|Article) (.+)$/.exec(String(num || ''));
  if (!m) return num || '';
  if (m[1] === 'Title') return L('Title {0}', m[2]);
  if (m[1] === 'Chapter') return L('Chapter {0}', m[2]);
  if (m[1] === 'Section') return L('Section {0}', m[2]);
  return abbr ? L('Art. {0}', m[2]) : L('Article {0}', m[2]);
}
const cRange = t => { const a = cArticles(t); return a.length === 1 ? cNum(a[0].num) : cNum(a[0].num) + ' – ' + a[a.length - 1].num.replace(/^Article /, ''); };
const CREF_SUF = '(?: (?:bis|ter|quater|quinquies|sexies|septies|octies)(?![\\p{L}]))?';
const CREF = { en: new RegExp('\\b(Articles?) (\\d+' + CREF_SUF + ')', 'gu'),
  std: new RegExp('(?<![\\p{L}])([Čč]l(?:\\.|an|en)\\p{L}*) (\\d+' + CREF_SUF + ')', 'gu') };
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function cInline(x, links, places) {
  let h = esc(x).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  if (!links) return h;
  h = h.replace(lang() === 'en' ? CREF.en : CREF.std, (m, w, n) => {
    const id = 'art-' + n.replace(' ', '');
    return CONS.idx[id] ? `<a class="ref" href="#${id}">${w} ${n}</a>` : m;
  });
  h = h.replace(/\(([A-Z]{2}-\d{2})\)/g, (m, c) => BY[c] ? `(<a class="ref" href="#state-${c}" translate="no">${c}</a>)` : m);
  if (places && places.length) {
    const rx = new RegExp('(?<![\\p{L}\\p{M}])(' + places.map(p => p.n).sort((a, b) => b.length - a.length).map(p => reEsc(esc(p))).join('|') + ')(?![\\p{L}\\p{M}])', 'gu');
    h = h.split(/(<strong>.*?<\/strong>|<[^>]*>)/).map(part => part[0] === '<' ? part
      : part.replace(rx, (m, nm) => `<button type="button" class="plc" data-pl="${places.findIndex(p => p.n === nm)}">${nm}</button>`)).join('');
  }
  return h;
}
function cBlock(b, pl) {
  if (b.t === 'p') return `<p>${cInline(b.x, true, pl)}</p>`;
  if (b.t === 'h') return `<div class="hd">${cInline(b.x)}</div>`;
  if (b.t === 'ul') return `<ul>${b.items.map(i => `<li>${cInline(i, true, pl)}</li>`).join('')}</ul>`;
  if (b.t === 'll') return `<ol class="ll">${b.items.map(i => `<li><span class="mk" translate="no">${i[0]}.</span><span>${cInline(i[1], true, pl)}</span></li>`).join('')}</ol>`;
  if (b.t === 'ol') return `<ol class="nl${b.items.length > 12 ? ' cols' : ''}">${b.items.map(i => `<li><span class="mk">${i[0]}.</span><span>${cInline(i[1], true, pl)}</span></li>`).join('')}</ol>`;
  return '';
}
function vCons() {
  const C = cDoc(), TT = C.titles, CD = esc(C.iso ? fmtD(C.iso) : C.date);
  const nArt = TT.reduce((n, t) => n + cArticles(t).length, 0), ver = esc(C.version.replace('v', ''));
  return `
  <a class="back" href="#home">‹ ${esc(T('f_conf'))}</a>
  <div class="eyebrow">${esc(T('h_fundamental'))}</div>
  <h1>${esc(T('h_constitution_h1'))}</h1>
  <p class="lead">${lang() === 'en'
    ? esc(L('Consolidated text, version {0} of {1}: a preamble and {2} articles in {3} titles. Official acts are published in the unified South Slavic Latin alphabet and in the three regional standards; this is the English text.', ver, CD, fmtN(nArt), fmtN(TT.length)))
    : esc(L('Consolidated text, version {0} of {1}: a preamble and {2} articles in {3} titles. The texts in the three regional standards are equally authentic (Art. 151); this is the official text in this standard.', ver, CD, fmtN(nArt), fmtN(TT.length)))}</p>
  <h2>${esc(T('h_titles'))}</h2>
  <ul class="tlist">${TT.map(t => `<li><a href="#${t.id}"><i>${esc(cNum(t.num))}</i><div><b>${esc(t.name)}</b>
    <span>${esc(cRange(t))} · ${esc(L('{0} articles', fmtN(cArticles(t).length)))}</span></div></a></li>`).join('')}</ul>
  <h2>${esc(T('h_preamble'))}</h2>
  <div class="pre">${C.preamble.paras.map((p, i) => `<p${i === C.preamble.paras.length - 1 ? ' class="fin"' : ''}>${cInline(p)}</p>`).join('')}
    <p class="motto">${cInline(C.preamble.motto)}</p></div>
  <div class="pager"><span></span><a class="nx" href="#${TT[0].id}"><small>${esc(L('Begin reading'))} →</small>${esc(cNum(TT[0].num))} · ${esc(TT[0].name)}</a></div>`;
}
function vTitle() {
  const C = cDoc(), TT = C.titles, cur = titleOf(R.t), i = TT.indexOf(cur), prev = TT[i - 1], next = TT[i + 1];
  const body = cur.chapters.map(ch => `
    ${ch.num ? `<div class="chap">${esc(cNum(ch.num))} · ${esc(ch.name)}</div>` : ''}
    ${ch.articles.map(a => {
      const pl = PLACES[a.id] || [], kind = INST && INST.kind(a.id);
      return `${a.sec ? `<div class="secn">${esc(cNum(a.sec.num))} · ${esc(a.sec.name)}</div>` : ''}<article class="art" id="${a.id}">
      <div class="num">${esc(cNum(a.num))}</div>
      <h3>${esc(a.name)}</h3>
      ${pl.length && !kind ? `<div class="loc"><span>${esc(L('Location'))}</span>${pl.length > 8
        ? `<button type="button" data-pl="all">${esc(L('Show all'))} · ${fmtN(pl.length)}</button>`
        : pl.map((p, k) => `<button type="button" data-pl="${k}">${esc(p.n)}</button>`).join('')}</div>` : ''}
      ${kind ? `<section class="inst" data-art="${a.id}">${INST.panel(a.id)}</section>` : ''}
      ${a.body.map(b => cBlock(b, kind ? [] : pl)).join('')}
    </article>`; }).join('')}`).join('');
  return `
  <a class="back" href="#constitution">‹ ${esc(L('Constitution'))}</a>
  <div class="eyebrow">${esc(L('Constitution'))} · ${esc(cNum(cur.num))}</div>
  <h1>${esc(cur.name)}</h1>
  <p class="sub">${esc(cRange(cur))} · ${esc(L('{0} articles', fmtN(cArticles(cur).length)))}</p>
  <div id="${cur.id}-body">${body}</div>
  <div class="pager">
    ${prev ? `<a href="#${prev.id}"><small>← ${esc(L('Previous'))}</small>${esc(cNum(prev.num))} · ${esc(prev.name)}</a>`
      : `<a href="#constitution"><small>← ${esc(L('Back'))}</small>${esc(L('Preamble and table of titles'))}</a>`}
    ${next ? `<a class="nx" href="#${next.id}"><small>${esc(L('Next'))} →</small>${esc(cNum(next.num))} · ${esc(next.name)}</a>` : '<span></span>'}
  </div>`;
}

/* L'article en cours de lecture donne son rôle à la carte :
   un mécanisme (sièges, double clé, péréquation, coalition) -> instrument sur la carte SVG ;
   des lieux -> la carte MapLibre y vole ; ni l'un ni l'autre -> la Confédération, en retrait. */
let _now = null, _tick = 0, PIN = null;
function mapRole() {
  const id = R.v === 'title' ? _now : null;
  const kind = id && INST ? INST.kind(id) : null, pl = id ? (PLACES[id] || []) : [];
  INSTV = kind ? INST.view(id) : null;
  RETREAT = (R.v === 'cons') || (R.v === 'title' && !kind && !pl.length);
  if (R.v === 'title' && !kind && pl.length) needGL().then(api => { if (_now === id && R.v === 'title') { stageSync(); api.showPlaces(pl, { fit: true }); } });
  else if (mapApi) { mapApi.showPlaces([]); if (R.v === 'cons' || R.v === 'title') mapApi.sync({ v: 'home' }, { first: true }); }
  stageSync();
}
function readerTick(force) {
  if (R.v !== 'title' || (PIN && !force)) return;
  const body = $('#sheetBody'), top = body.getBoundingClientRect().top, line = top + Math.min(170, body.clientHeight * .3);
  let cur = null;
  for (const el of body.querySelectorAll('.art')) { if (el.getBoundingClientRect().top <= line) cur = el; else break; }
  if (!cur) cur = body.querySelector('.art');
  if (!cur || (cur.id === _now && !force)) return;
  setNow(cur.id);
}
function setNow(id) {
  _now = id;
  document.querySelectorAll('.art.now').forEach(e => e.classList.remove('now'));
  const el = document.getElementById(id); if (el) el.classList.add('now');
  R.a = id;
  history.replaceState(null, '', '#' + id);
  chrome();
  mapRole();
}
/* Saut vers un article : la position est recalée tant que la mise en page bouge (transition de
   largeur du feuillet, arrivée des polices), jusqu'au premier geste du lecteur. */
function jumpArt(id, fresh) {
  const el = document.getElementById(id), body = $('#sheetBody'); if (!el) return;
  const snap = () => { if (PIN && PIN.id === id) body.scrollTop += el.getBoundingClientRect().top - body.getBoundingClientRect().top - 6; };
  if (PIN && PIN.ro) PIN.ro.disconnect();
  if (!fresh && !RM.matches) {
    PIN = { id, until: Date.now() + 900 };
    body.scrollTo({ top: body.scrollTop + el.getBoundingClientRect().top - body.getBoundingClientRect().top - 6, behavior: 'smooth' });
    setNow(id);
    setTimeout(() => { if (PIN && PIN.id === id) PIN = null; }, 900);
    return;
  }
  PIN = { id, until: Date.now() + 2500 };
  snap(); setNow(id); snap();
  PIN.ro = new ResizeObserver(snap); PIN.ro.observe(body.firstElementChild); PIN.ro.observe(body);
  if (document.fonts) document.fonts.ready.then(snap);
  const pin = PIN;
  setTimeout(() => { if (PIN === pin) unpin(); }, 2500);
}
function unpin() { if (PIN) { if (PIN.ro) PIN.ro.disconnect(); PIN = null; } }
for (const ev of ['wheel', 'touchstart', 'pointerdown', 'keydown']) $('#sheetBody').addEventListener(ev, e => { if (PIN && PIN.ro && e.isTrusted !== false) unpin(); }, { passive: true });
$('#sheet').addEventListener('transitionend', e => { if (e.propertyName === 'width') { if (PIN && PIN.ro) $('#sheetBody').dispatchEvent(new Event('repin')); svSoon(); } });
$('#sheetBody').addEventListener('repin', () => { if (PIN) { const el = document.getElementById(PIN.id), b = $('#sheetBody'); if (el) b.scrollTop += el.getBoundingClientRect().top - b.getBoundingClientRect().top - 6; } });

/* ============================================================
   Carte SVG de la Confédération (générée par build.py) : premier rendu, accueil, instruments
   ============================================================ */
const sil = $('#sil'), svO = $('#svO'), svH = $('#svH'), svL = $('#svlabels'), tip = $('#tip');
const SVP = {}; sil.querySelectorAll('.sp').forEach(p => { SVP[p.dataset.c] = p; });
const SVK = +sil.dataset.k;
const merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
const svXY = pt => [pt[0] * SVK, -merc(pt[1]) * SVK];
function svScreen(pt, m) { const [x, y] = svXY(pt); return { x: x * m.a + m.e, y: y * m.d + m.f }; }
let svHov = null, CUR = null;
function svPaint() {
  if (!CORE) return;
  const br = CORE.breaks.state[MODE];
  for (const s of CORE.states) {
    const p = SVP[s.c]; if (!p) continue;
    const cl = INSTV ? INSTV.cls(s.c) : 's' + klass(valOf(s, MODE), br);
    p.setAttribute('class', 'sp ' + cl + (svHov === s.c ? ' hv' : '') + (!INSTV && (R.v === 'state' || R.v === 'mun') && R.c === s.c ? ' sel' : ''));
  }
  svH.innerHTML = CUR && SVP[CUR.c] && document.body.classList.contains('svgmode') ? `<path d="${SVP[CUR.c].getAttribute('d')}"/>` : '';
  /* cercles proportionnels des instruments */
  const m = sil.getScreenCTM(), list = INSTV && INSTV.circles ? INSTV.circles() : [], seen = new Set();
  for (const c of list) {
    let el = svO.querySelector(`[data-c="${c.c}"]`);
    if (!el) { el = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); el.dataset.c = c.c; const [x, y] = svXY(BY[c.c].pt); el.setAttribute('cx', x); el.setAttribute('cy', y); el.setAttribute('r', 0); svO.appendChild(el); void el.getBoundingClientRect(); }
    el.setAttribute('class', c.cls); el.style.r = (c.r / (m ? m.a : 1)).toFixed(2) + 'px'; seen.add(c.c);
  }
  svO.querySelectorAll('circle').forEach(el => { if (!seen.has(el.dataset.c)) el.remove(); });
  for (const id of ['hx', 'hy', 'ho']) { const pt = document.getElementById(id); if (pt && m) pt.setAttribute('patternTransform', `rotate(${id === 'hy' ? -45 : 45}) scale(${(1 / m.a).toFixed(3)})`); }
}
let GLY = 0;      // bascule d'écriture en cours : les libellés ne sont pas redessinés sous l'animation
function svLabels() {
  if (!CORE || !document.body.classList.contains('svgmode')) return;
  if (Date.now() < GLY) { setTimeout(svSoon, GLY - Date.now() + 30); return; }
  const m = sil.getScreenCTM(); if (!m) return;
  const boxes = [];
  for (const id of ['top', 'sheet', 'legend']) { const el = document.getElementById(id); if (!el || el.hidden) continue;
    if (id === 'top') { for (const ch of el.children) { const r = ch.getBoundingClientRect(); if (r.width) boxes.push([r.left, r.top, r.right, r.bottom]); } continue; }
    const r = el.getBoundingClientRect(); if (r.width) boxes.push([r.left, r.top, r.right, r.bottom]); }
  const hit = a => boxes.some(b => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]);
  const items = [];
  if (INSTV) items.push(...INSTV.labels());
  if (!INSTV || INSTV.names) {
    const br = CORE.breaks.state[MODE];
    for (const s of CORE.states.filter(s => s.t === 'F')) items.push({ c: s.c, pt: s.pt, v: [['cap', esc(disp(s.n)), 'l']] });
    if (DESK.matches && !INSTV) for (const s of CORE.states.filter(s => s.t === 'M')) items.push({ c: s.c, pt: s.pt, v: [['cap m', esc(disp(s.n)), 'l']] });
    if (!INSTV) for (const s of CORE.states.filter(s => s.t === 'T').sort((a, b) => b.pop - a.pop)) {
      const dk = klass(valOf(s, MODE), br) >= 3 ? ' dk' : '';
      items.push({ c: s.c, pt: s.pt, v: [['st' + dk, esc(disp(s.n)), 'c'], ['st' + dk, s.k, 'c']] });
    }
  }
  svL.innerHTML = '';
  for (const it of items) {
    const p = svScreen(it.pt, m);
    for (const [cls, html, anchor] of it.v) {
      const el = document.createElement('div'); el.className = 'lb ' + cls; el.innerHTML = html; if (it.c) el.dataset.c = it.c;
      svL.appendChild(el);
      const w = el.offsetWidth, h = el.offsetHeight, g = DESK.matches ? 3 : 4, x0 = anchor === 'l' ? p.x - 6 : p.x - w / 2;
      const box = [x0 - g, p.y - h / 2 - g + 1, x0 + w + g, p.y + h / 2 + g - 1];
      if (it.free || !hit(box)) {
        if (!it.free) boxes.push(box);
        el.style.transform = anchor === 'l' ? `translate(${Math.round(p.x - 5)}px,${Math.round(p.y)}px) translate(0,-50%)` : `translate(${Math.round(p.x)}px,${Math.round(p.y)}px) translate(-50%,-50%)`;
        el.classList.add('on');
        break;
      }
      el.remove();
    }
  }
}
let _sv = 0;
function svSoon() { if (!_sv) _sv = requestAnimationFrame(() => { _sv = 0; svPaint(); svLabels(); }); }
function svTip(code, ev) {
  if (!code || MOBQ.matches) { tip.hidden = true; return; }
  const s = BY[code];
  tip.innerHTML = INSTV && INSTV.tip ? INSTV.tip(code) : `<b>${esc(disp(s.n))}<code>${s.c}</code></b><span>${esc(disp(valLab(valOf(s, MODE), MODE)))}</span>`;
  tip.hidden = false;
  const r = tip.getBoundingClientRect();
  tip.style.left = Math.min(innerWidth - r.width - 8, ev.clientX + 14) + 'px';
  tip.style.top = Math.max(8, ev.clientY - r.height - 12) + 'px';
}
sil.addEventListener('pointermove', ev => {
  const c = ev.target.dataset && ev.target.dataset.c || null;
  if (c !== svHov) { svHov = c; svPaint(); }
  svTip(c, ev);
});
sil.addEventListener('pointerleave', () => { svHov = null; tip.hidden = true; svPaint(); });
sil.addEventListener('click', ev => {
  const c = ev.target.dataset && ev.target.dataset.c; if (!c) return;
  tip.hidden = true;
  if (INSTV) { if (INSTV.pick(c)) instRefresh(); return; }
  VTSRC = null; go('#state-' + c, 'map');
});
/* premier geste de zoom sur la carte SVG : MapLibre prend le relais, sans à-coup (même cadrage) */
function zoomIntent(ev) {
  if (!document.body.classList.contains('svgmode') || INSTV || RETREAT) return;
  if (ev.type === 'wheel') { if (ev.target.closest('#sheet,#legend,#top,#pal')) return; ev.preventDefault(); }
  const pt = [ev.clientX || (ev.touches && ev.touches[0].clientX) || innerWidth / 2, ev.clientY || (ev.touches && ev.touches[0].clientY) || innerHeight / 2];
  const dir = ev.type === 'wheel' ? (ev.deltaY < 0 ? 1 : -1) : 1;
  needGL().then(api => { stageSync(); if (ev.type !== 'touchstart') api.zoomAt(pt, dir); });
}
$('#stage').addEventListener('wheel', zoomIntent, { passive: false });
$('#stage').addEventListener('dblclick', zoomIntent);
$('#stage').addEventListener('touchstart', ev => { if (ev.touches.length > 1) zoomIntent(ev); }, { passive: true });

/* ---------- quel moteur montre la carte ---------- */
let GLP = null;
function needGL() {
  if (!GLP) GLP = import('./map.js').then(m => m.createMap(glCtx())).then(api => { mapApi = api; document.body.classList.add('hydrated'); return api; })
    .catch(err => { console.error(err); GLP = null; throw err; });
  return GLP;
}
function stageSync() {
  const svg = !mapApi || !!INSTV || RETREAT;
  const was = document.body.classList.contains('svgmode');
  document.body.classList.toggle('svgmode', svg);
  document.body.classList.toggle('retreat', RETREAT);
  document.body.classList.toggle('instr', !!INSTV);
  if (was !== svg && RM.matches) { const st = $('#stage'); st.classList.remove('cut'); void st.offsetWidth; st.classList.add('cut'); }
  legend(); svSoon();
  if (!svg && mapApi) mapApi.wake();
}
function instCtx() { return { CORE, BY, L, T, U, UT, esc, fmtN, disp, cNum, lang, L_LOC, DESK }; }
function instRefresh() {
  if (!INST) return;
  const act = document.activeElement && document.activeElement.closest('.inst') ? document.activeElement.dataset.f : null;
  document.querySelectorAll('.inst').forEach(sec => { const live = sec.querySelector('[data-live]'); if (live) { live.innerHTML = INST.live(sec.dataset.art); cyrApply(live); } });
  if (act) { const el = document.querySelector(`.inst [data-f="${act}"]`); if (el) el.focus({ preventScroll: true }); }
  svSoon();
}

/* ============================================================
   Légende, indicateurs
   ============================================================ */
function legend() {
  const el = $('#legend'); if (!CORE) return;
  const lvl = LEVEL >= 1 && MODE !== 'gdp' && !document.body.classList.contains('svgmode') ? 'mun' : 'state';
  const br = CORE.breaks[lvl][MODE];
  const unit = MODE === 'pop' ? L('Population') : MODE === 'dens' ? L('Inhabitants per km²') : L('GDP per capita, PPS, 2023');
  const srcOpen = !!el.querySelector('details[open]'), open = el.classList.contains('open');
  const sw = [0, 1, 2, 3, 4].map(i => `<i style="background:var(--c${i})"></i>`).join('');
  el.innerHTML = `
  <button type="button" class="cyc" aria-expanded="${open}" aria-label="${esc(L('Colour the states by'))} ${esc(modeName(MODE))}">${esc(modeName(MODE))}<em>${sw}</em></button>
  <div class="lg-top"><div class="seg" role="group" aria-label="${esc(L('Colour the states by'))}">${['pop', 'dens', 'gdp'].map(m =>
    `<button type="button" data-mode="${m}" aria-pressed="${m === MODE}">${esc(modeName(m))}</button>`).join('')}</div>
    <button type="button" class="lgi" data-lgx aria-label="${esc(T('search_close'))}">×</button></div>
  <div class="lg-b">
  <div class="lg-h"><b>${esc(L(lvl === 'mun' ? 'Municipalities' : 'States'))}</b><span>${esc(unit)}</span></div>
  <div class="lg-s">${sw}${lvl === 'mun' ? '' : ''}</div>
  <div class="lg-t"><span>0</span>${br.map(b => `<span>${esc(shortLab(b, MODE))}</span>`).join('')}</div>
  </div>
  <div class="lg-f">${lvl === 'mun' ? `<span><i style="background:var(--cn)"></i>${esc(L('States'))} · ${esc(L('pending'))}</span>` : ''}<span><i class="oc"></i>${esc(L('Occupied territories'))}</span>
    <details${srcOpen ? ' open' : ''}><summary>${esc(L('Sources'))}</summary><div class="lg-src">${esc(L('Boundaries: GADM, geoBoundaries, Natural Earth. Population: national censuses and registers. GDP: Eurostat regional accounts, 2023.'))}</div></details></div>`;
  el.hidden = false;
  cyrApply(el);
}
function setMode(m) {
  MODE = m;
  try { localStorage.setItem('atlas-mode', m); } catch (e) {}
  legend(); listDraw(); svSoon();
  if (mapApi) mapApi.setMode(m);
}
$('#legend').addEventListener('click', e => {
  const el = $('#legend'), b = e.target.closest('[data-mode]');
  if (b) return setMode(b.dataset.mode);
  if (e.target.closest('.cyc')) { el.classList.add('open'); legend(); const f = el.querySelector('[aria-pressed="true"]'); if (f) f.focus(); }
  else if (e.target.closest('[data-lgx]')) { el.classList.remove('open'); legend(); el.querySelector('.cyc').focus(); }
});

/* ============================================================
   Feuillet bas à trois crans (mobile) : poignée de 44 px, et le contenu lui-même déplace le
   feuillet tant qu'il n'est pas plein ; plein et en haut de défilement, tirer vers le bas le replie.
   ============================================================ */
const sheet = $('#sheet'), grip = $('#grip');
const SNAPS = ['peek', 'half', 'full'];
const snapPx = n => n === 'peek' ? 132 : n === 'half' ? Math.round(innerHeight * .5) : innerHeight - 64;
function setSnap(n, quiet) {
  sheet.dataset.snap = n;
  sheet.style.setProperty('--vis', snapPx(n) + 'px');
  grip.setAttribute('aria-expanded', n !== 'peek');
  grip.setAttribute('aria-label', disp(n === 'full' ? T('search_close') : L('Open')));
  document.body.style.setProperty('--pb', Math.min(innerHeight - 260, snapPx(n === 'full' ? 'half' : n) + 8) + 'px');
  if (!quiet) { if (mapApi) mapApi.repad(); setTimeout(svSoon, 360); }
}
(function sheetDrag() {
  let y0 = 0, v0 = 0, moved = false, on = false, last = 0, lastT = 0, vel = 0, eat = false;
  const start = (y, t) => { on = true; moved = false; y0 = y; v0 = snapPx(sheet.dataset.snap); last = y; lastT = t; vel = 0; };
  const move = (y, t) => { if (!on) return false; const dy = y0 - y; if (!moved && Math.abs(dy) < 6) return false;
    if (!moved) { moved = true; sheet.classList.add('drag'); }
    vel = (last - y) / Math.max(1, t - lastT); last = y; lastT = t;
    sheet.style.setProperty('--vis', Math.max(96, Math.min(innerHeight - 64, v0 + dy)) + 'px'); return true; };
  const end = y => { if (!on) return; on = false; sheet.classList.remove('drag');
    if (!moved) return;
    eat = true; setTimeout(() => { eat = false; }, 60);
    const cur = v0 + (y0 - y) + vel * 180;
    let best = 'half', bd = 1e9;
    for (const s of SNAPS) { const d = Math.abs(snapPx(s) - cur); if (d < bd) { bd = d; best = s; } }
    setSnap(best); };
  const body = $('#sheetBody');
  for (const el of [grip, body]) {
    el.addEventListener('pointerdown', e => { if (DESK.matches || (el === body && sheet.dataset.snap === 'full') || e.target.closest('input,[data-f]')) return; start(e.clientY, e.timeStamp); });
    el.addEventListener('pointermove', e => { if (on && move(e.clientY, e.timeStamp) && !el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointerup', e => end(e.clientY));
    el.addEventListener('pointercancel', e => end(e.clientY));
  }
  /* plein écran : en butée haute du défilement, le geste vers le bas replie le feuillet */
  let ty = 0, pull = false;
  body.addEventListener('touchstart', e => { if (DESK.matches || sheet.dataset.snap !== 'full') return; ty = e.touches[0].clientY; pull = body.scrollTop <= 0; if (pull) start(ty, e.timeStamp); }, { passive: true });
  body.addEventListener('touchmove', e => { if (!pull) return; const y = e.touches[0].clientY;
    if (y - ty > 6 && body.scrollTop <= 0) { e.preventDefault(); move(y, e.timeStamp); } else if (!moved && y < ty) { pull = false; on = false; } }, { passive: false });
  body.addEventListener('touchend', e => { if (pull) { pull = false; end(e.changedTouches[0].clientY); } });
  document.addEventListener('click', e => { if (eat) { e.preventDefault(); e.stopPropagation(); } }, true);
  grip.addEventListener('click', () => { if (moved) { moved = false; return; } const s = sheet.dataset.snap; setSnap(s === 'peek' ? 'half' : s === 'half' ? 'full' : 'half'); });
  grip.addEventListener('keydown', e => { const i = SNAPS.indexOf(sheet.dataset.snap);
    if (e.key === 'ArrowUp') { e.preventDefault(); setSnap(SNAPS[Math.min(2, i + 1)]); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSnap(SNAPS[Math.max(0, i - 1)]); } });
  body.addEventListener('wheel', e => { if (!DESK.matches && sheet.dataset.snap !== 'full' && e.deltaY > 0) setSnap('full'); }, { passive: true });
  const relayout = () => { if (!DESK.matches) setSnap(sheet.dataset.snap, true); else document.body.style.removeProperty('--pb'); if (mapApi) mapApi.repad(); svSoon(); setTimeout(svSoon, 400); };
  addEventListener('resize', relayout);
  MOBQ.addEventListener('change', relayout);
})();

/* ============================================================
   Palette de commande : États, articles (titre et texte), communes, actions
   ============================================================ */
let PAL = [], palSel = 0, palIdx = null, palLang = '';
const consText = b => b.t === 'p' || b.t === 'h' ? b.x : b.t === 'ul' ? b.items.join(' ') : b.items.map(i => i[1]).join(' ');
async function palIndex() {
  const key = lang() + scriptOf();
  if (palIdx && palLang === key) return palIdx;
  if (!COMMUNES) COMMUNES = await J('data/communes.json');
  await loadCons(lang());
  const st = CORE.states.map(s => ({ g: 0, code: s.c, lab: s.n, sub: s.p === 'fed' ? fnLab(s) : L(CORE.peoples[s.p].en + ' state · seat {0}', s.ch),
    hash: '#state-' + s.c, k: [fold(s.n), fold2(s.n), fold(s.c), fold(s.k)], k2: s.p === 'fed' ? [] : [fold(s.ch), fold2(s.ch)] }));
  const ar = [];
  cDoc().titles.forEach(t => t.chapters.forEach(c => c.articles.forEach(a => {
    const n = a.num.replace(/^Article /, ''), raw = a.body.map(consText).join(' ').replace(/\*/g, '');
    ar.push({ g: 1, code: L('Art. {0}', n), lab: a.name, sub: cNum(t.num), hash: '#' + a.id, num: fold(n), k: [fold(a.name), fold2(a.name)], raw, body: ' ' + fold(raw) });
  })));
  const co = COMMUNES.map(r => ({ g: 2, code: r[1], lab: r[0], sub: BY[r[1]].n, hash: r[2] ? `#mun-${r[1]}-${r[2]}` : '#state-' + r[1],
    k: [fold(r[0]), fold2(r[0]), ...(r[3] ? [fold(r[3])] : [])] }));
  const ac = [];
  for (const [k, v] of Object.entries(UI.langs)) ac.push({ g: 3, code: v.lab, lab: v.name, sub: L('Language'), run: () => setLang(k), k: [fold(v.name), fold(v.lab), fold(L('Language'))] });
  for (const [s, lab] of [['lat', T('scr_lat')], ['cyr', T('scr_cyr')]]) ac.push({ g: 3, code: s === 'lat' ? 'Lat' : 'Ћир', lab, sub: L('Writing'), need: 'scr', run: () => setLang(null, s), k: [fold(lab), fold(L('Writing')), s] });
  for (const m of ['pop', 'dens', 'gdp']) ac.push({ g: 3, code: '◐', lab: modeName(m), sub: L('Colour the states by'), run: () => setMode(m), k: [fold(modeName(m)), fold(L('Colour the states by'))] });
  palLang = key;
  return palIdx = [st, ar, co, ac];
}
/* correspondance en début de mot seulement (« lika » ne trouve plus « Republika ») */
function palScore(it, qs) {
  let best = 9;
  const run = (keys, pen) => { for (const q of qs) for (const k of keys) {
    if (!k) continue;
    const i = k === q ? 0 : k.startsWith(q) ? 0 : k.indexOf(' ' + q);
    if (i < 0) continue;
    const s = (k === q ? 0 : i === 0 ? 1 : 2) + pen;
    if (s < best) best = s;
  } };
  run(it.k, 0);
  if (it.k2) run(it.k2, 1.5);      // un État trouvé par son chef-lieu passe après la commune elle-même
  return best;
}
function snippet(raw, q) {
  const lo = raw.toLowerCase(), i = lo.search(new RegExp('(^|[^\\p{L}])' + reEsc(q.split(' ')[0]), 'u'));
  const a = Math.max(0, (i < 0 ? 0 : i) - 34);
  return (a ? '… ' : '') + raw.slice(a, a + 96).trim() + ' …';
}
async function palRun() {
  const idx = await palIndex(), raw = $('#palIn').value, q = fold(raw), q2 = fold2(raw);
  const qs = q === q2 ? [q] : [q, q2];
  const groups = [L('States'), L('Constitution'), L('Municipalities'), L('Colour the states by') + ' · ' + L('Language')], lim = [6, 7, 8, 5];
  const out = [];
  const artQ = q.replace(/^(art(icle|icles)?|cl(an|en)?|чл)\.?\s*/, '').trim();
  idx.forEach((list, g) => {
    let hits;
    if (g === 3) list = list.filter(a => a.need !== 'scr' || SCRIPTS[lang()]);
    if (!q) hits = g === 0 ? list.filter(i => /-9[1-4]$/.test(i.code)) : g === 1 ? list.filter(a => ['#art-103', '#art-110', '#art-132'].includes(a.hash)) : g === 3 ? list : [];
    else {
      hits = list.map(it => {
        let s = palScore(it, qs); it.snip = null;
        if (g === 1) {
          if (/^\d/.test(artQ)) { if (it.num === artQ) s = -1; else if (it.num.startsWith(artQ)) s = Math.min(s, 0.5); }
          if (s >= 9 && q.length >= 3 && qs.some(x => it.body.includes(' ' + x))) { const n = it.body.split(' ' + q).length - 1; s = 6 - Math.min(0.9, n * 0.1) + it.body.indexOf(' ' + q) / 1e6; it.snip = snippet(it.raw, raw.trim().toLowerCase()); }
        }
        return [s, it];
      }).filter(x => x[0] < 9).sort((a, b) => a[0] - b[0] || a[1].lab.length - b[1].lab.length).slice(0, lim[g]).map(x => { x[1].sc = x[0]; return x[1]; });
    }
    if (hits.length) out.push({ head: groups[g] }, ...hits);
  });
  PAL = out.filter(x => !x.head);
  palSel = 0;
  if (q) PAL.forEach((x, i) => { if (x.sc < PAL[palSel].sc) palSel = i; });
  const list = $('#palList');
  let n = -1;
  list.innerHTML = out.length ? out.map(x => x.head ? `<div class="pg" role="presentation">${esc(x.head)}</div>`
    : `<div class="po" role="option" id="po${++n}" data-n="${n}" aria-selected="${n === palSel}"><code${x.g === 1 ? '' : ' translate="no"'}>${esc(x.code)}</code><b>${x.g === 3 && UI.langs[Object.keys(UI.langs).find(k => UI.langs[k].name === x.lab)] ? `<span translate="no">${esc(x.lab)}</span>` : esc(x.lab)}${x.snip ? `<small>${esc(x.snip)}</small>` : ''}</b><span>${esc(x.sub)}</span></div>`).join('')
    : `<div class="pnone">${esc(L('No match.'))}</div>`;
  cyrApply(list);
  $('#palIn').setAttribute('aria-activedescendant', PAL.length ? 'po' + palSel : '');
}
function palMove(d) {
  if (!PAL.length) return;
  palSel = (palSel + d + PAL.length) % PAL.length;
  document.querySelectorAll('.po').forEach(e => e.setAttribute('aria-selected', +e.dataset.n === palSel));
  const el = $('#po' + palSel); if (el) el.scrollIntoView({ block: 'nearest' });
  $('#palIn').setAttribute('aria-activedescendant', 'po' + palSel);
}
let _palFrom = null;
function palOpen() {
  _palFrom = document.activeElement;
  $('#pal').hidden = false;
  const inp = $('#palIn'); inp.value = ''; inp.placeholder = disp(T('search')); inp.setAttribute('aria-label', disp(T('search_q')));
  $('#palBox').setAttribute('aria-label', disp(T('search')));
  $('#palX').setAttribute('aria-label', disp(T('search_x')));
  $('#palX').textContent = COARSE ? '×' : 'Esc';
  inp.focus();
  palRun();
}
function palClose(restore) { $('#pal').hidden = true; if (restore && _palFrom && _palFrom.focus) _palFrom.focus(); }
function palGo(n) {
  const it = PAL[n]; if (!it) return;
  if (it.run) { palClose(true); it.run(); return; }
  VTSRC = $('#po' + n);
  /* la palette se ferme dans la transition : le numéro d'article voyage jusqu'à la lecture */
  if (document.startViewTransition && !RM.matches && it.g === 1) { SRC = 'map'; location.hash === it.hash ? route() : (location.hash = it.hash); setTimeout(() => palClose(false), 0); }
  else { palClose(false); go(it.hash, 'map'); }
  $('#map').focus({ preventScroll: true });
}
$('#palBtn').addEventListener('click', palOpen);
$('#palX').addEventListener('click', () => palClose(true));
$('#pal').addEventListener('mousedown', e => { if (e.target.id === 'pal') palClose(true); });
$('#palIn').addEventListener('input', palRun);
$('#palIn').addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); palMove(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); palMove(-1); }
  else if (e.key === 'Enter') { e.preventDefault(); palGo(palSel); }
  else if (e.key === 'Tab') { e.preventDefault(); }
});
$('#palList').addEventListener('click', e => { const o = e.target.closest('.po'); if (o) palGo(+o.dataset.n); });
$('#palList').addEventListener('mousemove', e => { const o = e.target.closest('.po'); if (o && +o.dataset.n !== palSel) { palSel = +o.dataset.n; palMove(0); } });

/* ============================================================
   Langue, écriture (bascule latin / cyrillique animée glyphe par glyphe)
   ============================================================ */
const COARSE = matchMedia('(pointer:coarse)').matches && !matchMedia('(any-pointer:fine)').matches;
const MAC = /Mac|iPhone|iPad/.test(navigator.platform || '');
const KEYHELP = UT('Arrow keys move between neighbouring entities, Enter opens one, Escape goes up one level, plus and minus zoom, 0 fits the Confederation.');
function langUI() {
  const ls = $('#langsel'), ss = $('#scriptsel'), l = lang();
  ls.setAttribute('aria-label', disp(L('Language')));
  ls.innerHTML = Object.entries(UI.langs).map(([k, v]) => `<button type="button" data-l="${k}" aria-pressed="${k === l}" title="${esc(v.name)}" translate="no">${v.lab}</button>`).join('');
  ss.hidden = !(l === 'sre' || l === 'ist');
  ss.innerHTML = `<button type="button" data-s="lat" aria-pressed="${scriptOf() === 'lat'}" title="${esc(T('scr_lat'))}" translate="no">Lat</button>
    <button type="button" data-s="cyr" aria-pressed="${scriptOf() === 'cyr'}" title="${esc(T('scr_cyr'))}" translate="no">${l === 'ist' ? 'Кир' : 'Ћир'}</button>`;
  $('#langBtn').textContent = (UI.langs[l] || { lab: 'EN' }).lab + (cyrOn() ? ' · ' + (l === 'ist' ? 'Кир' : 'Ћир') : '');
  $('#langBtn').setAttribute('aria-label', disp(L('Language')));
  $('#palLab').textContent = disp(T('search'));
  $('#palBtn').setAttribute('aria-label', disp(T('search')));
  const kb = $('#palBtn kbd'); kb.hidden = COARSE; kb.textContent = MAC ? '⌘K' : 'Ctrl K';
  $('#brand').setAttribute('aria-label', disp(T('brand') + ' · ' + T('nav_home')));
  const mapEl = $('#map');
  mapEl.setAttribute('aria-label', disp(T('h_map')));
  mapEl.setAttribute('aria-description', KEYHELP);
  mapEl.toggleAttribute('data-untranslated', true);
  for (const s of CORE.states) { const p = SVP[s.c]; if (p) { p.setAttribute('role', 'link'); p.setAttribute('tabindex', '-1'); p.setAttribute('aria-label', disp(`${s.n} (${s.c})`)); } }
  sil.setAttribute('role', 'group'); sil.setAttribute('aria-label', disp(T('h_map')));
}
function glyphTargets() {
  const m = new Map();
  const h = $('#sheetBody h1'); if (h && !h.children.length) m.set('h1', h);
  document.querySelectorAll('#svlabels .lb.on[data-c], #labels .lb.on[data-c]').forEach(el => { if (!el.children.length && getComputedStyle(el.parentNode).opacity !== '0') m.set(el.parentNode.id + el.dataset.c, el); });
  return m;
}
function glyphSwap(el, from, to) {
  if (from === to) return;
  const a = [...from], b = [...to], n = Math.max(a.length, b.length);
  el.classList.add('gl');
  el.innerHTML = Array.from({ length: n }, (_, i) => `<span style="white-space:pre">${esc(a[i] || '')}</span>`).join('');
  const sp = [...el.children];
  sp.forEach((s, i) => setTimeout(() => { s.classList.add('o'); setTimeout(() => { s.textContent = b[i] || ''; s.classList.remove('o'); }, 110); }, 30 + i * 26));
  setTimeout(() => { if (el.isConnected && el.classList.contains('gl')) { el.textContent = to; el.classList.remove('gl'); } }, 30 + n * 26 + 320);
}
async function setLang(l, scr) {
  const scriptOnly = !l && !!scr;
  const before = scriptOnly && !RM.matches ? new Map([...glyphTargets()].map(([k, el]) => [k, el.textContent])) : null;
  if (l && UI.langs[l]) setLangVar(l);
  if (scr && SCRIPTS[lang()]) SCRIPTS[lang()] = scr;
  try { localStorage.setItem('bk-lang', lang()); if (SCRIPTS[lang()]) localStorage.setItem('bk-script-' + lang(), SCRIPTS[lang()]); } catch (e) {}
  const y = $('#sheetBody').scrollTop, keep = R.v === 'title' ? R.a : null;
  const redo = async () => {
    langUI(); legend();
    R = { ...R, lang: '' };
    const b = _booted; _booted = false;          // pas de transition imbriquée
    await route(); _booted = b;
    if (!keep) $('#sheetBody').scrollTop = y;
    if (mapApi) mapApi.relabel();
    svPaint(); svLabels();
  };
  if (!scriptOnly && document.startViewTransition && !RM.matches) { try { await document.startViewTransition(redo).updateCallbackDone; } catch (e) {} }
  else await redo();
  if (before) {
    cancelAnimationFrame(_sv); _sv = 0;
    let longest = 0;
    for (const [k, el] of glyphTargets()) if (before.has(k)) { longest = Math.max(longest, before.get(k).length, el.textContent.length); glyphSwap(el, before.get(k), el.textContent); }
    GLY = Date.now() + 60 + longest * 26 + 340;
  }
}
$('#langBtn').addEventListener('click', () => { const m = $('#langMenu'), open = m.hidden; m.hidden = !open; $('#langBtn').setAttribute('aria-expanded', open); if (open) m.querySelector('[aria-pressed="true"]').focus(); });
$('#langsel').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.l !== lang()) setLang(b.dataset.l).then(() => { const n = $(`#langsel [data-l="${lang()}"]`); if (n && !$('#langMenu').hidden) n.focus(); }); });
$('#scriptsel').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.s !== scriptOf()) setLang(null, b.dataset.s).then(() => { const n = $(`#scriptsel [data-s="${scriptOf()}"]`); if (n && !$('#langMenu').hidden) n.focus(); }); });
const DESKWIDE = matchMedia('(min-width: 1180px) and (min-height: 521px)');
function langLayout() { $('#langMenu').hidden = !DESKWIDE.matches; }
DESKWIDE.addEventListener('change', langLayout);
document.addEventListener('mousedown', e => { if (!DESKWIDE.matches && !e.target.closest('#lang') && !$('#langMenu').hidden) { $('#langMenu').hidden = true; $('#langBtn').setAttribute('aria-expanded', false); } });

/* ============================================================
   Clavier : la carte sans souris
   ============================================================ */
function entities() {
  if (!INSTV && (R.v === 'state' || R.v === 'mun') && munNow(R.c)) return munNow(R.c).m.map(m => ({ id: { c: R.c, s: m.s }, pt: m.pt, o: m }));
  return CORE.states.map(s => ({ id: { c: s.c }, pt: s.pt, o: s }));
}
const sameId = (a, b) => a && b && a.c === b.c && (a.s || '') === (b.s || '');
function announce(e) {
  const o = e.o;
  const txt = e.id.s ? `${o.n} · ${BY[e.id.c].n} · ${fmtN(o.p)}`
    : `${o.n} · ${o.c} · ${o.p === 'fed' ? fnLab(o) : L(CORE.peoples[o.p].en)} · ${o.pop != null ? L('{0} inhabitants', fmtN(o.pop)) : ''}`;
  $('#live').textContent = disp(txt);
}
function setCursor(id, quiet) {
  CUR = id;
  if (mapApi) mapApi.setCursor(id, quiet);
  svPaint();
  if (!quiet && id) { const e = entities().find(x => sameId(x.id, id)); if (e) announce(e); }
}
function moveCursor(dx, dy) {
  const list = entities(); if (!list.length) return;
  const cur = list.find(e => sameId(e.id, CUR));
  if (!cur) {
    const start = R.v === 'mun' ? list.find(e => e.id.s === R.s) : R.v === 'state' ? list[0] : list.find(e => e.id.c === 'SA-92');
    return setCursor((start || list[0]).id);
  }
  const k = Math.cos(cur.pt[1] * Math.PI / 180);
  let best = null, bs = 1e9;
  for (const e of list) {
    if (e === cur) continue;
    const vx = (e.pt[0] - cur.pt[0]) * k, vy = e.pt[1] - cur.pt[1], d = Math.hypot(vx, vy);
    const cos = (vx * dx + vy * dy) / d;
    if (cos < 0.5) continue;                       // cône de 60° autour de la direction
    const sc = d * (1 + 8.8 * (1 - cos) * (1 - cos));
    if (sc < bs) { bs = sc; best = e; }
  }
  if (best) setCursor(best.id);
}
function mapKey(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const k = e.key;
  if (k === 'ArrowLeft') moveCursor(-1, 0);
  else if (k === 'ArrowRight') moveCursor(1, 0);
  else if (k === 'ArrowUp') moveCursor(0, 1);
  else if (k === 'ArrowDown') moveCursor(0, -1);
  else if (k === 'Enter' || k === ' ') {
    if (!CUR) moveCursor(0, 0);
    else if (INSTV) { if (INSTV.pick(CUR.c)) instRefresh(); }
    else go(CUR.s ? `#mun-${CUR.c}-${CUR.s}` : '#state-' + CUR.c, 'map');
  }
  else if (k === '+' || k === '=') needGL().then(api => { stageSync(); api.zoom(1); });
  else if (k === '-' || k === '_') mapApi && mapApi.zoom(-1);
  else if (k === '0') mapApi && mapApi.refit();
  else return;
  e.preventDefault();
}
$('#map').addEventListener('keydown', mapKey);
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#pal').hidden ? palOpen() : palClose(true); return; }
  if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && $('#pal').hidden) { e.preventDefault(); palOpen(); return; }
  if (e.key === 'Escape') {
    if (!$('#pal').hidden) return palClose(true);
    if ($('#legend').classList.contains('open')) { $('#legend').classList.remove('open'); legend(); return; }
    if (!$('#langMenu').hidden && !DESKWIDE.matches) { $('#langMenu').hidden = true; $('#langBtn').setAttribute('aria-expanded', false); $('#langBtn').focus(); return; }
    upLevel();
  }
});

/* survol / focus d'une ligne de liste : l'entité s'allume sur la carte */
function listHover(e) {
  const a = e.target.closest && e.target.closest('.elist a, .capb');
  if (!a) return;
  CUR = a.dataset.s ? { c: R.c, s: a.dataset.s } : a.dataset.c ? { c: a.dataset.c } : null;
  if (mapApi) mapApi.setCursor(CUR, true);
  svPaint();
}
const sb = $('#sheetBody');
sb.addEventListener('mouseover', listHover);
sb.addEventListener('focusin', listHover);
sb.addEventListener('mouseleave', () => { CUR = null; if (mapApi) mapApi.setCursor(null, true); svPaint(); });
sb.addEventListener('click', e => {
  const row = e.target.closest('.elist a, .capb'); if (row) VTSRC = row;
  const f = e.target.closest('[data-filt]'); if (f) { FILT = f.dataset.filt; listDraw(); const n = $(`[data-filt="${FILT}"]`); if (n) n.focus(); return; }
  const ib = e.target.closest('.inst [data-act]');
  if (ib && INST) { const art = ib.closest('.inst').dataset.art; if (art !== _now) setNow(art); INST.act(art, ib.dataset.act, ib.dataset.v); instRefresh();
    if (ib.dataset.act === 'map' && !DESK.matches) setSnap('half'); return; }
  const b = e.target.closest('[data-pl]'); if (!b) return;
  const art = b.closest('.art'), pl = PLACES[art.id] || [];
  if (art.id !== _now) setNow(art.id);
  needGL().then(api => { stageSync(); api.showPlaces(pl, { fit: true, only: b.dataset.pl === 'all' ? null : +b.dataset.pl }); });
  if (!DESK.matches && sheet.dataset.snap === 'full') setSnap('half');
});
sb.addEventListener('input', e => { const i = e.target.closest('.inst input[data-k]'); if (i && INST) { const art = i.closest('.inst').dataset.art; if (art !== _now) setNow(art); INST.act(art, 'set', i.dataset.k + ':' + i.value); instRefresh(); } });
sb.addEventListener('scroll', () => {
  if (R.v !== 'title' || _tick) return;
  _tick = requestAnimationFrame(() => { _tick = 0; readerTick(); });
}, { passive: true });

/* ============================================================
   Démarrage : texte et carte SVG d'abord ; MapLibre à la demande
   ============================================================ */
function glCtx() {
  return { CORE, BY, R: () => R, mode: () => MODE, loadMun, munNow, decPolys, klass, valOf, densOf,
    disp, fmtN, valLab, L, T, RM, DESK, snapPx: () => snapPx(sheet.dataset.snap === 'full' ? 'half' : sheet.dataset.snap),
    onLevel(l) { if (l !== LEVEL) { LEVEL = l; legend(); } },
    onFocus(c) { if (c !== FOCUS) { FOCUS = c; if (R.v === 'home') chrome(); } },
    onPick(id) { VTSRC = null; go(id.s ? `#mun-${id.c}-${id.s}` : '#state-' + id.c, 'map'); } };
}
async function boot() {
  [CORE, UI, FLAGS] = await Promise.all([J('data/core.json'), J('data/ui.json'), J('data/flags.json')]);
  if (!UI.langs[lang()]) setLangVar('en');
  CORE.states.forEach(s => { BY[s.c] = s; });
  setUI(UI, CORE.aut);
  langLayout(); langUI(); legend();
  if (!DESK.matches) setSnap('half', true);
  await route();
  _booted = true;
  document.body.classList.remove('boot');
  addEventListener('hashchange', route);
  svPaint(); svLabels();
  if (document.fonts) document.fonts.ready.then(svSoon);
  /* au repos, sans geste du visiteur : MapLibre est préparé (sauf économie de données) */
  const conn = navigator.connection || {};
  if (!conn.saveData && !/(^|-)2g$/.test(conn.effectiveType || '')) {
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => needGL().then(stageSync), { timeout: 4000 }) : needGL().then(stageSync));
    setTimeout(idle, 6000);
  }
  window.__atlasApp = { needGL, state: () => ({ R, INSTV: !!INSTV, RETREAT, svg: document.body.classList.contains('svgmode'), now: _now }) };
}
boot();
