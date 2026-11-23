/* carte.js — carte de la Confédération (#/map), chargée avec sa page.
   Reprise du prototype Atlas (proto/atlas : app.js, critical.css, branche claude/proto-tour-2) et
   raccordée au portail : routes #/map/…, en-tête, thème, langue (LANG, L, T), écriture (cyrText) et
   recherche du portail. ADR 2026-11-23-carte-maplibre.md.

   Premier rendu : silhouette SVG des 54 entités (portail/data/carte/index.json), cliquable, coloriée par
   l'indicateur, et le feuillet. MapLibre (portail/js/carte-gl.js) prend la main au même cadrage, au repos
   ou au premier geste, sur cette page seulement ; le fichier unique garde la silhouette.
   Routes : #/map (Confédération), #/map/<code> (État), #/map/<code>/<commune>, #/map/art-103 et
   #/map/art-110 (couches institutionnelles). La carte ne duplique pas la fiche d'État : elle y renvoie.

   Le portail appelle : MAPX.prepare(h) (données de la vue), MAPX.html(h) (contenu de #app),
   MAPX.mounted() (après insertion), MAPX.inplace(h) (sous-route : la carte n'est pas redessinée),
   MAPX.rerender() (langue ou écriture), MAPX.theme() (thème), MAPX.leave(). */
var MAPX = (function () {
  'use strict';
  /* marqueur local des chaînes de tables (scripts/textes.py le lit comme N du gabarit) */
  const N = s => s;
  const $ = id => document.getElementById(id);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBQ = matchMedia('(max-width:599px),(max-width:899px) and (orientation:portrait)');
  const mobile = () => MOBQ.matches;
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  /* libellés posés sur la carte : la couche échappe à la conversion du portail (translate="no"),
     le texte est converti à la création */
  const sc = s => cyrOn() ? cyrText(String(s), LANG) : String(s);
  /* fichier unique : ni communes ni MapLibre (son worker exige http(s)) */
  const EXPORT = () => typeof CA_EXPORT !== 'undefined';
  const TITLE0 = document.title;

  const TYPE = { T: N('Territorial state'), F: N('Confederal territory'), M: N('Confederal autonomous municipality') };
  const MODES = ['pop', 'dens', 'gdp'];
  const MODE_LAB = { pop: N('Population'), dens: N('Density'), gdp: N('GDP per capita') };
  const MODE_SRC = { pop: N('Latest census or population register of each country'), dens: N('Inhabitants per km²'),
    gdp: N('GDP per capita, PPS, 2023') };
  const FILT = [['all', N('All')], ['T', N('Territorial states')], ['F', N('Confederal territories')], ['M', N('Confederal municipalities')]];
  const PP_ONLY = { slo: N('Show only the slovenes on the map'), hrv: N('Show only the croats on the map'),
    srb: N('Show only the serbs on the map'), bos: N('Show only the bosniaks on the map'),
    cng: N('Show only the montenegrins on the map'), mkd: N('Show only the macedonians on the map'),
    bul: N('Show only the bulgarians on the map'), fed: N('Show only the confederal entities on the map') };

  const S = { r: { v: 'home' }, next: null, mode: MODES.includes(ls.get('bk-map-mode')) ? ls.get('bk-map-mode') : 'pop',
    filt: 'all', people: null, cur: null, hov: null, snap: 'half', level: 0, focus: null, lang: null, scr: null, src: '' };
  const MUN = {};
  let GL = null;                                        // moteur MapLibre, une fois prêt (carte-gl.js)

  /* ---------------------------------------------------------------- valeurs */
  const st = c => STATS[c] || {};
  const densOf = c => { const s = st(c); return s.population && s.area ? s.population / s.area : null; };
  const valOf = (c, m) => m === 'pop' ? st(c).population : m === 'dens' ? densOf(c) : st(c).gdp;
  const klass = (v, br) => v == null ? -1 : br.reduce((n, b) => n + (v >= b ? 1 : 0), 0);
  const modeName = m => L(MODE_LAB[m]);
  function valLab(v, m) {
    if (v == null) return L`pending`;
    return m === 'pop' ? fmtN(v) : m === 'dens' ? L`${fmtN(Math.round(v))} / km²` : L`${fmtN(v)} PPS`;
  }
  function shortLab(v, m) {
    if (m === 'dens') return fmtN(v);
    if (v >= 1e6) return L`${(v / 1e6).toLocaleString(L_LOC[LANG] || 'en-GB', { maximumFractionDigits: 1 })} M`;
    if (v >= 1e3) return L`${fmtN(Math.round(v / 100) / 10)} k`;
    return fmtN(v);
  }
  /* fonction d'une entité confédérale (etats.json la garde en HTML : « Defence &amp; sciences capital ») */
  const chLab = s => L(s.ch).replace(/&amp;/g, '&');
  const who = s => s.t !== 'T' ? chLab(s) : L(PEUPLES[s.p].en);
  const inPeople = s => S.people === 'fed' ? s.t !== 'T' : s.p === S.people;
  function rankOf(c, m) {
    const list = STATES.filter(s => valOf(s.c, m) != null).sort((a, b) => valOf(b.c, m) - valOf(a.c, m));
    const i = list.findIndex(s => s.c === c);
    return i < 0 ? null : [i + 1, list.length];
  }
  function totals() {
    const T0 = { pop: 0, area: 0, mun: 0, gdp: 0 }; let g = 0, gp = 0;
    STATES.forEach(s => { const x = st(s.c), p = x.population || 0;
      T0.pop += p; T0.area += x.area || 0; T0.mun += x.municipalities || 0;
      if (x.gdp && p) { g += p * x.gdp; gp += p; } });
    T0.gdp = gp ? g / gp : 0;
    return T0;
  }

  /* ---------------------------------------------------------------- données des communes (carte/m/) */
  function loadMun(code) {
    if (EXPORT()) return Promise.reject(new Error('export'));
    if (!MUN[code]) MUN[code] = fetch('data/carte/m/' + code + '.json' + DATA_V)
      .then(r => { if (!r.ok) throw new Error(code + ' : ' + r.status); return r.json(); })
      .then(d => {
        const br = CARTE.breaks.mun, gc = klass(st(code).gdp, CARTE.breaks.state.gdp), seat = (CARTE.e[code] || {}).seat;
        d.m.forEach((m, i) => { m.c = code; m.rank = i + 1; m.dens = m.a ? m.p / m.a : null;
          m.pc = klass(m.p, br.pop); m.dc = klass(m.dens, br.dens); m.gc = gc; m.seat = seat === m.s; });
        d.by = Object.fromEntries(d.m.map(m => [m.s, m])); d.gc = gc;
        return (MUN[code] = d);
      })
      .catch(e => { delete MUN[code]; throw e; });
    return Promise.resolve(MUN[code]);
  }
  const munNow = c => MUN[c] && !MUN[c].then ? MUN[c] : null;

  /* ---------------------------------------------------------------- routes */
  const LAYERS = {};                                   // couches institutionnelles (art. 103, 110)
  function parse(h) {
    const p = (h || '').replace(/^#\/map\/?/, '').split(/[/?]/).filter(Boolean);
    if (!p.length) return { v: 'home' };
    if (LAYERS[p[0]]) return { v: 'layer', a: p[0] };
    const c = p[0].toUpperCase();
    if (byCode(c)) return p[1] && !EXPORT() ? { v: 'mun', c, s: p[1].toLowerCase() } : { v: 'state', c };
    return { v: 'home' };
  }
  const hashOf = r => r.v === 'state' ? '#/map/' + r.c : r.v === 'mun' ? `#/map/${r.c}/${r.s}` : r.v === 'layer' ? '#/map/' + r.a : '#/map';
  const same = (a, b) => hashOf(a) === hashOf(b);

  /* données de la vue : les communes d'un État ouvert (liste, commune demandée) */
  async function prepare(h) {
    const r = parse(h);
    if (r.v === 'state' || r.v === 'mun') { try { await loadMun(r.c); } catch (e) { /* fichier unique, réseau : liste absente */ } }
    if (r.v === 'mun') { const d = munNow(r.c); if (!d || !d.by[r.s]) { r.v = 'state'; delete r.s; } }
    if (r.v === 'layer' && LAYERS[r.a].need) await LAYERS[r.a].need();
    r.h = h; S.next = r;
    return r;
  }

  /* ---------------------------------------------------------------- HTML */
  function silSVG() {
    const s = CARTE.sil;
    return `<svg id="caSvg" viewBox="${s.vb.join(' ')}" preserveAspectRatio="xMidYMid meet" role="group">
<defs><pattern id="caHo" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="7" class="ca-ho"/></pattern>
<pattern id="caHx" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" class="ca-hxb"/><rect width="1.6" height="7" class="ca-hxl"/></pattern></defs>
<path class="ca-sl" d="${s.land}"/><path class="ca-so" d="${s.occ}"/><g id="caSvS">${s.e.map(([c, d]) => `<path data-c="${c}" class="ca-sp" d="${d}"/>`).join('')}</g><g id="caSvH"></g><g id="caSvO"></g></svg>`;
  }
  function crumbsHTML() {
    const r = S.r, parts = [];
    const cr = (i, lab, href, cur, code) => `<${href && !cur ? `a href="${href}"` : 'span'} class="ca-cr"${cur ? ' aria-current="page"' : ''}><i aria-hidden="true">${i}</i>${esc(lab)}${code ? `<code translate="no">${code}</code>` : ''}</${href && !cur ? 'a' : 'span'}>`;
    parts.push(cr(1, T('f_conf'), '#/map', r.v === 'home'));
    if (r.v === 'state' || r.v === 'mun') parts.push(cr(2, byCode(r.c).n, '#/map/' + r.c, r.v === 'state', r.c));
    if (r.v === 'mun') parts.push(cr(3, munNow(r.c).by[r.s].n, '', true));
    if (r.v === 'layer') parts.push(cr(2, L(LAYERS[r.a].name), '', true));
    return parts.join('<span class="ca-crs" aria-hidden="true">›</span>');
  }
  function legendHTML(open, srcOpen) {
    const lvl = S.level >= 1 && S.mode !== 'gdp' && GL && !svgMode() ? 'mun' : 'state';
    const br = CARTE.breaks[lvl][S.mode] || CARTE.breaks.state[S.mode];
    const sw = [0, 1, 2, 3, 4].map(i => `<i style="background:var(--c${i})"></i>`).join('');
    return `<button type="button" class="ca-cyc" aria-expanded="${!!open}">${esc(modeName(S.mode))}<em aria-hidden="true">${sw}</em></button>
  <div class="ca-lgt"><div class="ca-seg" role="group" aria-label="${esc(L`Colour the states by`)}">${MODES.map(m =>
    `<button type="button" data-mode="${m}" aria-pressed="${m === S.mode}">${esc(modeName(m))}</button>`).join('')}</div>
    <button type="button" class="ca-lgx" data-lgx aria-label="${esc(T('search_close'))}">×</button></div>
  <div class="ca-lgh"><b>${esc(lvl === 'mun' ? L`Municipalities` : L`States`)}</b><span>${esc(L(S.mode === 'pop' ? MODE_LAB.pop : MODE_SRC[S.mode]))}</span></div>
  <div class="ca-lgs">${sw}</div>
  <div class="ca-lgk"><span>0</span>${br.map(b => `<span>${esc(shortLab(b, S.mode))}</span>`).join('')}</div>
  <div class="ca-lgf">${lvl === 'mun' ? `<span><i style="background:var(--cn)"></i>${esc(L`States`)} · ${esc(L`pending`)}</span>` : ''}<span><i class="oc"></i>${esc(L`Occupied territories`)}</span>
    <details${srcOpen ? ' open' : ''}><summary>${esc(L`Sources`)}</summary><div class="ca-lgsrc">${esc(L`Boundaries: GADM, geoBoundaries, Natural Earth. Population: national censuses and registers. GDP: Eurostat regional accounts, 2023.`)}</div></details></div>`;
  }
  function html(h) {
    const r = S.next && S.next.h === h ? S.next : parse(h);
    delete r.h; S.r = r; S.next = null;
    return `<div class="ca ca-svg" id="ca" data-v="${r.v}">
  <div class="ca-stage" id="caStage">
    <div class="ca-gl" id="caGl"></div>
    <div class="ca-lab" id="caLab" translate="no" aria-hidden="true"></div>
    <div class="ca-sil" id="caSil">${silSVG()}</div>
    <div class="ca-svl" id="caSvl" translate="no" aria-hidden="true"></div>
    <div class="ca-map" id="caMap" tabindex="0" role="application" aria-label="${esc(T('h_map'))}" aria-describedby="caHelp"></div>
  </div>
  <nav class="ca-crumbs" id="caCrumbs" aria-label="${esc(L`Territory`)}">${crumbsHTML()}</nav>
  <div class="ca-zoom" id="caZoom" role="group"${EXPORT() ? ' hidden' : ''}>
    <button type="button" data-z="1" aria-label="${esc(L`Zoom in`)}">+</button><button type="button" data-z="0">${esc(L`Fit`)}</button><button type="button" data-z="-1" aria-label="${esc(L`Zoom out`)}">−</button></div>
  <div class="ca-legend" id="caLegend">${legendHTML()}</div>
  <aside class="ca-sheet" id="caSheet" data-snap="${S.snap}"><button type="button" class="ca-grip" id="caGrip" aria-controls="caBody"><i></i></button>
    <div class="ca-body" id="caBody" tabindex="-1">${sheetHTML(r)}</div></aside>
  <div class="ca-tip" id="caTip" hidden></div>
  <p class="ca-vh" id="caHelp">${L`Arrow keys move between neighbouring entities, <kbd>Enter</kbd> opens one, <kbd>Escape</kbd> goes up one level, plus and minus zoom, 0 fits the Confederation.`}</p>
  <div class="ca-vh" id="caLive" aria-live="polite"></div>
</div>`;
  }

  /* ---------------------------------------------------------------- feuillets */
  const kd = (dt, dd, small, cls) => `<div${cls === 'w' ? ' class="w"' : ''}><dt>${dt}</dt><dd${cls && cls !== 'w' ? ` class="${cls}"` : ''}>${dd}${small ? `<small>${small}</small>` : ''}</dd></div>`;
  function sheetHTML(r) {
    if (r.v === 'state') return stateHTML(r.c);
    if (r.v === 'mun') return munHTML(r.c, r.s);
    if (r.v === 'layer') return LAYERS[r.a].sheet();
    return homeHTML();
  }
  function homeHTML() {
    const T0 = totals();
    return `<div class="eyebrow">${esc(T('l_map'))}</div>
    <h1 data-i18n="h_map">${esc(T('h_map'))}</h1>
    <p class="ca-sub">${L`48 states, 4 confederal territories and 2 confederal municipalities`}</p>
    <dl class="ca-figs">${kd(L`Population`, fmtN(T0.pop))}${kd(L`Area`, L`${fmtN(T0.area)} km²`)}
      ${kd(L`Municipalities`, fmtN(T0.mun))}${kd(L`GDP per capita`, L`${fmtN(Math.round(T0.gdp / 100) * 100)} PPS`)}</dl>
    ${layersHTML()}
    <h2>${L`Explore the states`}</h2>
    <div id="caStList">${listHTML()}</div>
    <h2>${L`Population by constituent people`}</h2>
    <div class="ca-pp" id="caPeople">${peopleHTML()}</div>`;
  }
  /* entrées des couches institutionnelles (art. 103, 110), remplies par les couches */
  function layersHTML() {
    const ks = Object.keys(LAYERS);
    return ks.length ? `<div class="ca-layers">${ks.map(k => `<a href="#/map/${k}"><b>${esc(L(LAYERS[k].name))}</b><span>${esc(L`Art. ${k.replace('art-', '')}`)}</span></a>`).join('')}</div>` : '';
  }
  function listHTML() {
    const rows = STATES.filter(s => (S.filt === 'all' || s.t === S.filt) && (!S.people || inPeople(s)))
      .sort((a, b) => (valOf(b.c, S.mode) ?? -1) - (valOf(a.c, S.mode) ?? -1) || (a.c < b.c ? -1 : 1));
    const max = Math.max(...STATES.map(s => valOf(s.c, S.mode) || 0));
    return `<div class="ca-chips" role="group" aria-label="${esc(L`Status`)}">${FILT.map(([k, lab]) =>
      `<button type="button" data-filt="${k}" aria-pressed="${k === S.filt}">${esc(L(lab))}</button>`).join('')}</div>
    <p class="ca-note">${esc(modeName(S.mode))} · ${esc(L(MODE_SRC[S.mode]))}</p>
    <ul class="ca-list ca-st">${rows.map((s, i) => { const v = valOf(s.c, S.mode);
      return `<li><a href="#/map/${s.c}" data-c="${s.c}"><span class="ca-rk">${i + 1}</span><code translate="no">${s.c}</code>
      <span class="ca-nm">${esc(s.n)}<small>${esc(who(s))}</small></span><span class="ca-v">${esc(valLab(v, S.mode))}</span><span class="ca-bar" style="width:${v ? Math.max(1, 100 * v / max).toFixed(1) : 0}%"></span></a></li>`; }).join('')}</ul>`;
  }
  /* population par peuple : un filtre à une seule teinte, un peuple à la fois (aucun code couleur) */
  function peopleHTML() {
    const sum = {}; let fed = 0;
    STATES.forEach(s => { const p = st(s.c).population || 0; if (s.t === 'T') sum[s.p] = (sum[s.p] || 0) + p; else fed += p; });
    const rows = Object.keys(PEUPLES).map(k => [k, PEUPLES[k].en, sum[k] || 0]).concat([['fed', N('Confederal entities'), fed]]);
    const max = Math.max(...rows.map(r => r[2]));
    return `<div class="ca-pph">${S.people ? `<button type="button" data-pp="">${L`Show all`}</button>` : ''}</div>
    ${rows.map(([k, n, v]) => `<button type="button" class="ca-ppb${S.people && S.people !== k ? ' off' : ''}" data-pp="${k}" aria-pressed="${S.people === k}" title="${esc(L(PP_ONLY[k]))}">
      <span class="nm">${esc(L(n))}</span><span class="tr"><i style="width:${(100 * v / max).toFixed(1)}%"></i></span>
      <span class="v">${L`${(v / 1e6).toLocaleString(L_LOC[LANG] || 'en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`}</span></button>`).join('')}`;
  }
  function stateHTML(c) {
    const s = byCode(c), fed = s.t !== 'T', pu = fed ? null : PEUPLES[s.p], m = S.mode, v = valOf(c, m), rk = rankOf(c, m);
    const e = CARTE.e[c], nm = st(c).municipalities ?? e.nm, d = munNow(c);
    const out = nm != null && e.nu !== nm ? L`Outlines on the map: ${fmtN(e.nu)}` : '';
    return `<a class="ca-back" href="#/map">‹ ${esc(T('f_conf'))}</a>
    <div class="eyebrow">${esc(L(TYPE[s.t]))}</div>
    <h1 class="ca-name">${esc(s.n)}</h1>
    <div class="ca-code"><span class="tag indigo" translate="no">${c}</span><span>${fed ? esc(chLab(s)) : gloss(pu.en, pu.name)}</span></div>
    <dl class="ca-figs">${kd(esc(modeName(m)), esc(valLab(v, m)), rk ? esc(L`Rank ${fmtN(rk[0])} of ${fmtN(rk[1])}`) : '')}
      ${kd(esc(L`Municipalities`), nm != null ? fmtN(nm) : '—', esc(out))}</dl>
    <a class="ca-open" href="#/state/${c}">${L`Open state page`}<span aria-hidden="true">→</span></a>
    ${d ? `<h2>${L`Municipalities`}</h2><ul class="ca-list ca-mun" id="caMun">${munListHTML(c)}</ul>` : ''}`;
  }
  function munListHTML(c, cur) {
    const d = munNow(c); if (!d) return '';
    const max = d.m[0] ? d.m[0].p : 1;
    /* ville-État d'un seul contour : ses communes sont nommées, sans chiffre propre */
    const solo = d.m.length === 1 && d.m[0].mb ? d.m[0].mb.map(n => `<li class="mb">${esc(n)}</li>`).join('') : '';
    return d.m.map(m => `<li><a href="#/map/${c}/${m.s}" data-s="${m.s}"${m.s === cur ? ' class="cur" aria-current="true"' : ''}>
      <span class="ca-nm">${esc(m.n)}${m.seat ? `<small>${L`Seat`}</small>` : ''}</span><span class="ca-v">${fmtN(m.p)}</span>
      <span class="ca-bar" style="width:${Math.max(1, 100 * m.p / max).toFixed(1)}%"></span></a></li>`).join('') + solo;
  }
  function munHTML(c, s) {
    const d = munNow(c), m = d.by[s], E = byCode(c), sp = st(c).population, share = sp ? 100 * m.p / sp : null;
    const alt = [m.o, ...(m.mb || [])].filter(Boolean);
    const pct = x => x.toLocaleString(L_LOC[LANG] || 'en-GB', { maximumFractionDigits: 1 }) + ' %';
    return `<a class="ca-back" href="#/map/${c}">‹ ${esc(E.n)}</a>
    <div class="eyebrow">${L`Municipality`}${m.seat ? ' · ' + L`Seat` : ''}</div>
    <h1 class="ca-name">${esc(m.n)}</h1>
    ${alt.length ? `<p class="ca-sub">${alt.map(esc).join(' · ')}</p>` : ''}
    <dl class="ca-figs">${kd(L`Population`, fmtN(m.p), `${esc(L`Rank ${fmtN(m.rank)} of ${fmtN(d.m.length)}`)} · ${esc(L(st(c).source || ''))}`)}
      ${kd(L`Area`, esc(L`${fmtN(m.a >= 10 ? Math.round(m.a) : m.a)} km²`))}
      ${kd(L`Population density`, m.dens != null ? esc(L`${fmtN(Math.round(m.dens))} / km²`) : '·')}
      ${kd(L`State of attachment`, `<a href="#/map/${c}">${esc(E.n)}</a>`, `<code translate="no">${c}</code> · ${esc(who(E))}`, 't')}
      ${share != null ? `<div class="w"><dt>${esc(E.n)} · ${L`Population`}</dt><dd>${pct(share)}</dd><div class="ca-share"><i style="width:${Math.max(.5, share).toFixed(1)}%"></i></div></div>` : ''}</dl>
    <a class="ca-open" href="#/state/${c}">${L`Open state page`}<span aria-hidden="true">→</span></a>
    <h2>${esc(E.n)}</h2><ul class="ca-list ca-mun" id="caMun">${munListHTML(c, s)}</ul>`;
  }

  /* ---------------------------------------------------------------- carte SVG */
  const svgMode = () => { const ca = $('ca'); return !ca || ca.classList.contains('ca-svg'); };
  const merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
  const svXY = pt => [pt[0] * CARTE.sil.k, -merc(pt[1]) * CARTE.sil.k];
  const layerView = () => S.r.v === 'layer' ? LAYERS[S.r.a].view() : null;
  function svPaint() {
    const g = $('caSvS'); if (!g) return;
    const br = CARTE.breaks.state[S.mode], V = layerView(), sel = (S.r.v === 'state' || S.r.v === 'mun') ? S.r.c : null;
    for (const p of g.children) {
      const c = p.dataset.c, s = byCode(c);
      let cl = 'ca-sp ' + (V ? V.cls(c) : 's' + klass(valOf(c, S.mode), br));
      if (!V && S.people && !inPeople(s)) cl += ' ca-dim';
      if (S.hov === c) cl += ' hv';
      if (sel === c) cl += ' sel';
      p.setAttribute('class', cl);
    }
    const cur = S.cur && !S.cur.s && g.querySelector(`[data-c="${S.cur.c}"]`);
    $('caSvH').innerHTML = cur && svgMode() ? `<path d="${cur.getAttribute('d')}"/>` : '';
    /* cercles proportionnels des couches */
    const o = $('caSvO'), svg = $('caSvg'), m = svg && svg.getScreenCTM(), list = V && V.circles ? V.circles() : [], seen = new Set();
    for (const ci of list) {
      let el = o.querySelector(`[data-c="${ci.c}"]`);
      if (!el) { el = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); el.dataset.c = ci.c;
        const [x, y] = svXY(CARTE.e[ci.c].pt); el.setAttribute('cx', x); el.setAttribute('cy', y); el.setAttribute('r', 0); o.appendChild(el); }
      el.setAttribute('class', ci.cls); el.style.r = (ci.r / (m ? m.a : 1)).toFixed(2) + 'px'; seen.add(ci.c);
    }
    o.querySelectorAll('circle').forEach(el => { if (!seen.has(el.dataset.c)) el.remove(); });
  }
  /* obstacles des libellés (feuillet, légende, fil d'Ariane, zoom), en coordonnées de la scène */
  function obstacles(origin) {
    const out = [];
    for (const id of ['caSheet', 'caLegend', 'caCrumbs', 'caZoom']) {
      const el = $(id); if (!el || el.hidden) continue;
      const r = el.getBoundingClientRect(); if (r.width) out.push([r.left - origin.left, r.top - origin.top, r.right - origin.left, r.bottom - origin.top]);
    }
    return out;
  }
  function placeLabels(box, items, origin, boxes) {
    const hit = a => boxes.some(b => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]);
    box.innerHTML = '';
    for (const it of items) {
      for (const [cls, h, anchor] of it.v) {
        const el = document.createElement('div'); el.className = 'lb ' + cls; el.innerHTML = h; if (it.c) el.dataset.c = it.c;
        box.appendChild(el);
        const w = el.offsetWidth, ht = el.offsetHeight, g = mobile() ? 4 : 3, x0 = anchor === 'l' ? it.x - 6 : it.x - w / 2;
        const b = [x0 - g, it.y - ht / 2 - g + 1, x0 + w + g, it.y + ht / 2 + g - 1];
        if (it.free || !hit(b)) {
          if (!it.free) boxes.push(b);
          el.style.transform = anchor === 'l' ? `translate(${Math.round(it.x - 5)}px,${Math.round(it.y)}px) translate(0,-50%)`
            : `translate(${Math.round(it.x)}px,${Math.round(it.y)}px) translate(-50%,-50%)`;
          el.classList.add('on');
          break;
        }
        el.remove();
      }
    }
  }
  function svLabels() {
    const svg = $('caSvg'), box = $('caSvl'), stage = $('caStage');
    if (!svg || !box || !svgMode()) return;
    const m = svg.getScreenCTM(); if (!m) return;
    const o = stage.getBoundingClientRect(), boxes = obstacles(o), V = layerView(), br = CARTE.breaks.state[S.mode];
    const at = pt => { const [x, y] = svXY(pt); return { x: x * m.a + m.e - o.left, y: y * m.d + m.f - o.top }; };
    const e = h => esc(sc(h));
    const items = [];
    if (V && V.labels) items.push(...V.labels().map(l => ({ ...l, ...at(l.pt) })));
    if (!V || V.names) {
      for (const s of STATES.filter(s => s.t === 'F')) items.push({ c: s.c, ...at(CARTE.e[s.c].pt), v: [['cap', e(s.n), 'l']] });
      if (!mobile() && !V) for (const s of STATES.filter(s => s.t === 'M')) items.push({ c: s.c, ...at(CARTE.e[s.c].pt), v: [['cap m', e(s.n), 'l']] });
      if (!V) for (const s of STATES.filter(s => s.t === 'T').sort((a, b) => (st(b.c).population || 0) - (st(a.c).population || 0))) {
        if (S.people && !inPeople(s)) continue;
        const dk = klass(valOf(s.c, S.mode), br) >= 3 ? ' dk' : '';
        items.push({ c: s.c, ...at(CARTE.e[s.c].pt), v: [['st' + dk, e(s.n), 'c'], ['st' + dk, s.k, 'c']] });
      }
    }
    placeLabels(box, items, o, boxes);
  }
  let _sv = 0;
  function svSoon() { if (!_sv) _sv = requestAnimationFrame(() => { _sv = 0; if ($('ca')) { svPaint(); svLabels(); } }); }
  function tipAt(c, ev) {
    const tip = $('caTip'); if (!tip) return;
    if (!c || mobile()) { tip.hidden = true; return; }
    const s = byCode(c), V = layerView();
    tip.innerHTML = V && V.tip ? V.tip(c) : `<b>${esc(sc(s.n))}<code translate="no">${c}</code></b><span>${esc(sc(valLab(valOf(c, S.mode), S.mode)))}</span>`;
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.min(innerWidth - r.width - 8, ev.clientX + 14) + 'px';
    tip.style.top = Math.max(8, ev.clientY - r.height - 12) + 'px';
  }

  /* ---------------------------------------------------------------- moteur MapLibre (carte-gl.js) */
  function needGL() { return Promise.reject(new Error('moteur MapLibre non livré')); }
  function stageSync() {
    const ca = $('ca'); if (!ca) return;
    const svg = !GL || !!layerView();
    ca.classList.toggle('ca-svg', svg);
    ca.classList.toggle('ca-layer', S.r.v === 'layer');
    svSoon();
  }

  /* ---------------------------------------------------------------- feuillet bas (téléphone) */
  const SNAPS = ['peek', 'half', 'full'];
  function snapPx(n) {
    const H = ($('ca') || {}).clientHeight || innerHeight;
    return n === 'peek' ? 132 : n === 'half' ? Math.round(H * .5) : H - 60;
  }
  function setSnap(n, quiet) {
    const sh = $('caSheet'), ca = $('ca'); if (!sh) return;
    S.snap = n; sh.dataset.snap = n;
    ca.style.setProperty('--vis', snapPx(n) + 'px');
    const g = $('caGrip'); g.setAttribute('aria-expanded', n !== 'peek'); g.setAttribute('aria-label', n === 'full' ? T('search_close') : L`Open`);
    if (!quiet) setTimeout(svSoon, 360);
  }
  function wireSheet(sig) {
    const sh = $('caSheet'), grip = $('caGrip'), body = $('caBody');
    let y0 = 0, v0 = 0, moved = false, on = false, last = 0, lastT = 0, vel = 0, eat = false;
    const start = (y, t) => { on = true; moved = false; y0 = y; v0 = snapPx(sh.dataset.snap); last = y; lastT = t; vel = 0; };
    const move = (y, t) => { if (!on) return false; const dy = y0 - y; if (!moved && Math.abs(dy) < 6) return false;
      if (!moved) { moved = true; sh.classList.add('drag'); }
      vel = (last - y) / Math.max(1, t - lastT); last = y; lastT = t;
      $('ca').style.setProperty('--vis', Math.max(96, Math.min(snapPx('full'), v0 + dy)) + 'px'); return true; };
    const end = y => { if (!on) return; on = false; sh.classList.remove('drag'); if (!moved) return;
      eat = true; setTimeout(() => { eat = false; }, 60);
      const cur = v0 + (y0 - y) + vel * 180; let best = 'half', bd = 1e9;
      for (const s of SNAPS) { const d = Math.abs(snapPx(s) - cur); if (d < bd) { bd = d; best = s; } }
      setSnap(best); };
    for (const el of [grip, body]) {
      el.addEventListener('pointerdown', e => { if (!mobile() || (el === body && sh.dataset.snap === 'full') || e.target.closest('input')) return; start(e.clientY, e.timeStamp); }, sig);
      el.addEventListener('pointermove', e => { if (on && move(e.clientY, e.timeStamp) && !el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId); }, sig);
      el.addEventListener('pointerup', e => end(e.clientY), sig);
      el.addEventListener('pointercancel', e => end(e.clientY), sig);
    }
    /* plein écran : en butée haute du défilement, le geste vers le bas replie le feuillet */
    let ty = 0, pull = false;
    body.addEventListener('touchstart', e => { if (!mobile() || sh.dataset.snap !== 'full') return; ty = e.touches[0].clientY; pull = body.scrollTop <= 0; if (pull) start(ty, e.timeStamp); }, { ...sig, passive: true });
    body.addEventListener('touchmove', e => { if (!pull) return; const y = e.touches[0].clientY;
      if (y - ty > 6 && body.scrollTop <= 0) { e.preventDefault(); move(y, e.timeStamp); } else if (!moved && y < ty) { pull = false; on = false; } }, { ...sig, passive: false });
    body.addEventListener('touchend', e => { if (pull) { pull = false; end(e.changedTouches[0].clientY); } }, sig);
    sh.addEventListener('click', e => { if (eat) { e.preventDefault(); e.stopPropagation(); } }, { ...sig, capture: true });
    grip.addEventListener('click', () => { if (moved) { moved = false; return; } const s = sh.dataset.snap; setSnap(s === 'peek' ? 'half' : s === 'half' ? 'full' : 'half'); }, sig);
    grip.addEventListener('keydown', e => { const i = SNAPS.indexOf(sh.dataset.snap);
      if (e.key === 'ArrowUp') { e.preventDefault(); setSnap(SNAPS[Math.min(2, i + 1)]); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSnap(SNAPS[Math.max(0, i - 1)]); } }, sig);
    body.addEventListener('wheel', e => { if (mobile() && sh.dataset.snap !== 'full' && e.deltaY > 0) setSnap('full'); }, { ...sig, passive: true });
  }

  /* ---------------------------------------------------------------- clavier : la carte sans souris */
  function entities() {
    const d = GL && !layerView() && (S.r.v === 'state' || S.r.v === 'mun') ? munNow(S.r.c) : null;
    if (d) return d.m.map(m => ({ id: { c: S.r.c, s: m.s }, pt: m.pt, o: m }));
    return STATES.map(s => ({ id: { c: s.c }, pt: CARTE.e[s.c].pt, o: s }));
  }
  const sameId = (a, b) => a && b && a.c === b.c && (a.s || '') === (b.s || '');
  function announce(e) {
    const o = e.o;
    const txt = e.id.s ? `${o.n} · ${byCode(e.id.c).n} · ${fmtN(o.p)}`
      : `${o.n} · ${o.c} · ${who(o)}${st(o.c).population != null ? ' · ' + L`${fmtN(st(o.c).population)} inhabitants` : ''}`;
    const lv = $('caLive'); if (lv) lv.textContent = sc(txt);
  }
  function setCursor(id, quiet) {
    S.cur = id;
    if (GL) GL.setCursor(id, quiet);
    svPaint();
    if (!quiet && id) { const e = entities().find(x => sameId(x.id, id)); if (e) announce(e); }
  }
  function moveCursor(dx, dy) {
    const list = entities(); if (!list.length) return;
    const cur = list.find(e => sameId(e.id, S.cur));
    if (!cur) {
      const start = S.r.v === 'mun' ? list.find(e => e.id.s === S.r.s) : S.r.v === 'state' ? list.find(e => e.id.c === S.r.c) || list[0] : list.find(e => e.id.c === 'SA-92');
      return setCursor((start || list[0]).id);
    }
    const k = Math.cos(cur.pt[1] * Math.PI / 180);
    let best = null, bs = 1e9;
    for (const e of list) {
      if (e === cur) continue;
      const vx = (e.pt[0] - cur.pt[0]) * k, vy = e.pt[1] - cur.pt[1], d = Math.hypot(vx, vy);
      const cos = (vx * dx + vy * dy) / d;
      if (cos < 0.5) continue;                       // cône de 60° autour de la direction
      const s = d * (1 + 8.8 * (1 - cos) * (1 - cos));
      if (s < bs) { bs = s; best = e; }
    }
    if (best) setCursor(best.id);
  }
  function pick(c) {
    const V = layerView();
    if (V) { if (V.pick(c)) refreshLayer(); return; }
    go2('#/map/' + c, 'map');
  }
  function mapKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (k === 'ArrowLeft') moveCursor(-1, 0);
    else if (k === 'ArrowRight') moveCursor(1, 0);
    else if (k === 'ArrowUp') moveCursor(0, 1);
    else if (k === 'ArrowDown') moveCursor(0, -1);
    else if (k === 'Enter' || k === ' ') {
      if (!S.cur) moveCursor(0, 0);
      else if (S.cur.s) go2(`#/map/${S.cur.c}/${S.cur.s}`, 'map');
      else pick(S.cur.c);
    }
    else if (k === '+' || k === '=') zoom(1);
    else if (k === '-' || k === '_') zoom(-1);
    else if (k === '0') zoom(0);
    else return;
    e.preventDefault();
  }
  function zoom(d) { needGL().then(g => { stageSync(); g.zoom(d); }).catch(() => {}); }
  function upLevel() {
    const r = S.r;
    if (r.v === 'mun') return go2('#/map/' + r.c, 'map');
    if (r.v !== 'home') return go2('#/map', 'map');
    if (GL) GL.home();
  }
  function go2(h, src) { S.src = src || ''; if (location.hash === h) inplace(h); else location.hash = h; }

  /* ---------------------------------------------------------------- changement de vue sur la page */
  function docTitle() {
    const r = S.r, brand = T('brand'), map = T('h_map');
    const t = r.v === 'state' ? `${byCode(r.c).n} (${r.c}) · ${map}` : r.v === 'mun' ? `${munNow(r.c).by[r.s].n} · ${byCode(r.c).n} · ${map}`
      : r.v === 'layer' ? `${L(LAYERS[r.a].name)} · ${map}` : map;
    document.title = sc(t + ' · ' + brand);
  }
  function chrome() {
    const ca = $('ca'); if (!ca) return;
    ca.dataset.v = S.r.v;
    const cr = $('caCrumbs'); cr.innerHTML = crumbsHTML(); cr.scrollLeft = cr.scrollWidth;
    docTitle();
  }
  function legend() {
    const el = $('caLegend'); if (!el) return;
    el.innerHTML = legendHTML(el.classList.contains('open'), !!el.querySelector('details[open]'));
  }
  function vtTag(el) { if (el) el.style.viewTransitionName = 'ca-name'; return el; }
  /* la sous-route change : feuillet et fil d'Ariane remplacés, carte en place (la caméra vole) */
  function apply(r, from) {
    const prev = S.r, src = S.src; S.src = '';
    const swap = () => {
      document.querySelectorAll('#ca [style*="view-transition-name"]').forEach(x => { x.style.viewTransitionName = ''; });
      S.r = r;
      const b = $('caBody'); b.innerHTML = sheetHTML(r); b.scrollTop = 0;
      if (!same(prev, r)) S.cur = null;
      chrome(); legend(); stageSync(); svPaint();
      vtTag(b.querySelector('h1.ca-name'));
    };
    /* le nom de l'entité passe de la liste (ou du libellé) au titre du feuillet */
    const row = from && from.closest && from.closest('a[data-c],a[data-s]');
    const vt = document.startViewTransition && !reduced() && row && !same(prev, r);
    if (vt) {
      vtTag(row.querySelector('.ca-nm') || row);
      const root = document.documentElement; root.dataset.vt = 'ca';
      const t = document.startViewTransition(swap);
      const done = () => { if (root.dataset.vt === 'ca') delete root.dataset.vt; document.querySelectorAll('#ca [style*="view-transition-name"]').forEach(x => { x.style.viewTransitionName = ''; }); };
      t.finished.then(done, done);
    } else { swap(); document.querySelectorAll('#ca [style*="view-transition-name"]').forEach(x => { x.style.viewTransitionName = ''; }); }
    if (mobile()) setSnap(r.v === 'home' && prev.v === 'home' ? S.snap : 'half');
    if (GL && (r.v !== 'layer')) GL.sync(r, { from: prev });
    else if (r.v === 'state' || r.v === 'mun') needGL().then(g => { if (S.r === r) { stageSync(); g.sync(r, { from: prev }); } }).catch(() => {});
    /* le focus reste sur la carte quand l'action en vient (flèches et Entrée, Échap) */
    if (src === 'map') { const m = $('caMap'); if (m) m.focus({ preventScroll: true }); }
    else if (from) { const b = $('caBody'); if (b) b.focus({ preventScroll: true }); }
  }
  let _from = null;
  function inplace(h) {
    if (!$('ca')) return false;
    const r = parse(h), from = _from; _from = null;
    const fix = r2 => { if (hashOf(r2) !== h) history.replaceState(null, '', hashOf(r2)); apply(r2, from); };
    if (r.v === 'state' || r.v === 'mun') {
      loadMun(r.c).then(d => { if (r.v === 'mun' && !d.by[r.s]) fix({ v: 'state', c: r.c }); else fix(r); })
        .catch(() => fix({ v: 'state', c: r.c }));
    } else if (r.v === 'layer' && LAYERS[r.a].need) LAYERS[r.a].need().then(() => fix(r), () => fix({ v: 'home' }));
    else fix(r);
    return true;
  }
  function refreshLayer() {
    const L0 = S.r.v === 'layer' && LAYERS[S.r.a]; if (!L0) return;
    const live = $('caBody').querySelector('[data-live]'); if (live) live.innerHTML = L0.live();
    svPaint(); svLabels();
  }

  /* ---------------------------------------------------------------- montage */
  let off = null;
  function mounted() {
    if (off) { off(); off = null; }
    const ca = $('ca'); if (!ca) return;
    document.documentElement.classList.add('ca-on');
    if (hashOf(S.r) !== (location.hash || '#/map').replace(/\/$/, '')) history.replaceState(null, '', hashOf(S.r));
    S.lang = LANG; S.scr = cyrOn();
    const ac = new AbortController(), sig = { signal: ac.signal };
    off = () => ac.abort();
    chrome();
    if (mobile()) setSnap(S.r.v === 'layer' ? 'half' : S.snap, true);
    const sil = $('caSvg');
    sil.addEventListener('pointermove', ev => {
      const c = ev.target.dataset && ev.target.dataset.c || null;
      if (c !== S.hov) { S.hov = c; svPaint(); }
      tipAt(c, ev);
    }, sig);
    sil.addEventListener('pointerleave', () => { S.hov = null; $('caTip').hidden = true; svPaint(); }, sig);
    sil.addEventListener('click', ev => { const c = ev.target.dataset && ev.target.dataset.c; if (!c) return; $('caTip').hidden = true; pick(c); }, sig);
    $('caMap').addEventListener('keydown', mapKey, sig);
    $('caZoom').addEventListener('click', e => { const b = e.target.closest('[data-z]'); if (b) zoom(+b.dataset.z); }, sig);
    $('caLegend').addEventListener('click', e => {
      const el = $('caLegend'), b = e.target.closest('[data-mode]');
      if (b) return setMode(b.dataset.mode);
      if (e.target.closest('.ca-cyc')) { el.classList.add('open'); legend(); const f = el.querySelector('[aria-pressed="true"]'); if (f) f.focus(); }
      else if (e.target.closest('[data-lgx]')) { el.classList.remove('open'); legend(); el.querySelector('.ca-cyc').focus(); }
    }, sig);
    const body = $('caBody');
    body.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#/map"]');
      if (a) { _from = a; S.src = ''; }
      const f = e.target.closest('[data-filt]');
      if (f) { S.filt = f.dataset.filt; listDraw(); const n = body.querySelector(`[data-filt="${S.filt}"]`); if (n) n.focus(); return; }
      const p = e.target.closest('[data-pp]');
      if (p) { const k = p.dataset.pp || null; S.people = S.people === k ? null : k; peopleDraw(); listDraw(); svPaint(); svLabels(); if (GL) GL.setPeople(S.people);
        const n = body.querySelector(`[data-pp="${S.people || (p.dataset.pp || '')}"]`) || body.querySelector('[data-pp]'); if (n) n.focus(); return; }
      if (S.r.v === 'layer' && LAYERS[S.r.a].act && LAYERS[S.r.a].act(e)) refreshLayer();
    }, sig);
    const hover = e => {
      const a = e.target.closest && e.target.closest('.ca-list a');
      if (!a) return;
      S.cur = a.dataset.s ? { c: S.r.c, s: a.dataset.s } : a.dataset.c ? { c: a.dataset.c } : null;
      if (GL) GL.setCursor(S.cur, true);
      svPaint();
    };
    body.addEventListener('mouseover', hover, sig);
    body.addEventListener('focusin', hover, sig);
    body.addEventListener('mouseleave', () => { S.cur = null; if (GL) GL.setCursor(null, true); svPaint(); }, sig);
    $('caLab').addEventListener('click', e => { const el = e.target.closest('[data-c]'); if (el && GL) pick(el.dataset.c); }, sig);
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || document.documentElement.classList.contains('search-open')) return;
      const hd = document.querySelector('body>header'); if (hd && hd.classList.contains('open')) return;
      const lg = $('caLegend'); if (lg && lg.classList.contains('open')) { lg.classList.remove('open'); legend(); return; }
      const ae = document.activeElement;
      if (!ae || ae === document.body || ($('ca') && $('ca').contains(ae))) { e.preventDefault(); upLevel(); }
    }, sig);
    wireSheet(sig);
    const relayout = () => { if (mobile()) setSnap(S.snap, true); svSoon(); if (GL) GL.repad(); };
    addEventListener('resize', relayout, { ...sig, passive: true });
    MOBQ.addEventListener('change', relayout, sig);
    stageSync(); svPaint(); svLabels();
    if (document.fonts) document.fonts.ready.then(() => { if ($('ca')) svSoon(); });
    setTimeout(svSoon, 400);
    if (S.r.v === 'state' || S.r.v === 'mun') needGL().then(g => { stageSync(); g.sync(S.r, { first: true }); }).catch(() => {});
    else idleGL();
  }
  /* MapLibre au repos, sur cette page seulement, sauf économie de données (alors au premier geste) */
  function idleGL() {
    if (EXPORT()) return;
    const c = navigator.connection || {};
    if (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')) return;
    const go = () => { if ($('ca')) needGL().then(stageSync).catch(() => {}); };
    'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 1200);
  }
  function setMode(m) {
    S.mode = m; ls.set('bk-map-mode', m);
    legend(); listDraw(); svPaint(); svLabels();
    if (S.r.v === 'state') { const b = $('caBody'), y = b.scrollTop; b.innerHTML = sheetHTML(S.r); b.scrollTop = y; }
    if (GL) GL.setMode(m);
    const f = $('caLegend').querySelector('[aria-pressed="true"]'); if (f) f.focus();
  }
  function listDraw() { const el = $('caStList'); if (el) el.innerHTML = listHTML(); }
  function peopleDraw() { const el = $('caPeople'); if (el) el.innerHTML = peopleHTML(); }

  /* langue ou écriture changée depuis l'en-tête du portail : la carte reste en place */
  function rerender() {
    const ca = $('ca'); if (!ca) return false;
    S.lang = LANG; S.scr = cyrOn();
    const b = $('caBody'), y = b.scrollTop;
    b.innerHTML = sheetHTML(S.r); b.scrollTop = y;
    $('caHelp').innerHTML = L`Arrow keys move between neighbouring entities, <kbd>Enter</kbd> opens one, <kbd>Escape</kbd> goes up one level, plus and minus zoom, 0 fits the Confederation.`;
    $('caMap').setAttribute('aria-label', T('h_map'));
    $('caCrumbs').setAttribute('aria-label', L`Territory`);
    const z = $('caZoom'); z.querySelector('[data-z="1"]').setAttribute('aria-label', L`Zoom in`); z.querySelector('[data-z="-1"]').setAttribute('aria-label', L`Zoom out`); z.querySelector('[data-z="0"]').textContent = L`Fit`;
    chrome(); legend(); svLabels();
    if (GL) GL.relabel();
    if (cyrOn()) cyrApply(ca);
    return true;
  }
  function theme() { if (GL) GL.theme(); svSoon(); }
  function leave() {
    if (off) { off(); off = null; }
    document.documentElement.classList.remove('ca-on');
    if (GL) { GL.remove(); GL = null; }
    S.cur = null; S.hov = null;
    const tip = $('caTip'); if (tip) tip.hidden = true;
    if (document.title !== TITLE0 && !$('ca')) document.title = TITLE0;
  }

  return { prepare, html, mounted, inplace, rerender, theme, leave, parse, hashOf, LAYERS, S, loadMun, munNow, valOf, klass,
    who, sc, svSoon, stageSync, legend, pick, upLevel, go2, setCursor, entities, refreshLayer, sheetHTML };
})();
