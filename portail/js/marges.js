/* marges.js — instruments de marge du lecteur de la Constitution, chargés à l'approche de leur article.
   Repris de Codex (proto/codex/instr.js et map.js, branche claude/proto-tour-2) : l'affichage est
   gardé, les calculs viennent du moteur unique (portail/js/regles.js, REGLES), l'ordre des peuples de
   peuples.json, les alinéas marqués des ancrages calculés par scripts/build_lecteur.py (CORE.anc).
   Chaque instrument applique l'article qu'il borde, à la lettre ; ce que le texte ne tranche pas est
   dit dans la marge (« Assumption »). L'art. 132 n'a pas d'instrument (révision en cours).
   ADR 2026-11-23-lecteur-constitution.md. */
var MARGES = (function () {
  'use strict';
  const N = s => s;   // marqueur des chaînes de tables (scripts/textes.py)
  /* hypothèses : libellés du moteur (REGLES.LIB.hyp, une seule source avec la page des votes), plus celle
     de la marge de l'art. 110, propre à l'instrument */
  const PLEN = N('The plenary majority depends on seventy individual votes and is not modelled here.');
  const assume = k => k === 'plen' ? PLEN : REGLES.LIB.hyp[k];
  let C = null;
  const ctx = () => C || (C = REGLES.contexte(STATES, STATS, PEUPLES));
  const sc = s => CX.sc(s);
  const t = s => esc(sc(s));                                   // chaîne d'interface, échappée, dans l'écriture choisie
  const pname = k => sc(L(PEUPLES[k].en));
  const fmtNd = (n, d) => Number(n).toLocaleString(L_LOC[LANG] || 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtP = (x, d = 1) => fmtNd(x * 100, d) + (LANG === 'en' ? '%' : ' %');
  const sign = ok => ok ? '✓' : '✕';
  const as = (...keys) => `<p class="cx-as"><b>${t(L`Assumption`)}</b>${keys.map(k => t(L(assume(k)))).join(' ')}</p>`;
  const reset = () => `<button type="button" class="cx-rs" aria-label="${t(L`Back`)}"><span aria-hidden="true">↺</span></button>`;
  const stLine = c => { const s = byCode(c) || { n: c }; return `<a class="cx-sl" href="#/state/${c}" translate="no">${c}</a> <strong>${t(s.n)}</strong>`; };

  /* ---------------------------------------------------------------- marques sur le texte
     key : ancrage de core.json (« 110.cle ») → [article, unité] ; l'état s'écrit sur cette unité dans
     tous les textes affichés (cx-ok, cx-ko, cx-na, cx-on) et l'étiquette dans data-mk. */
  function marker(scope) {
    return (key, cls, mk) => {
      const a = CORE.anc[key]; if (!a) return;
      document.querySelectorAll(`${scope(a[0])} .cx-cell[data-u="${a[1]}"]`).forEach(c => {
        c.classList.remove('cx-ok', 'cx-ko', 'cx-na', 'cx-on'); if (cls) c.classList.add('cx-' + cls);
        if (mk) c.dataset.mk = mk; else delete c.dataset.mk;
      });
    };
  }
  const KIND = () => ({ dk110, dk111, reg: regs, sl, map1, cap, alarm });
  function mount(el, kind, mark) {
    if (!KIND()[kind]) return;
    KIND()[kind](el, ctx(), mark);
    if (!el._wired) { el._wired = true; document.addEventListener('cx:script', () => { if (el.isConnected) KIND()[kind](el, ctx(), mark); }); }
  }

  /* ---------------------------------------------------------------- art. 110 et 111 : cinq sur sept, double clé */
  function switches(C, state) {
    return `<div class="cx-legend" aria-hidden="true" translate="no">✕ ◂ ▸ ✓</div>
  <div class="cx-rows">${C.order.map(k => `<button type="button" class="cx-sw" role="switch" aria-checked="${!!state[k]}" data-k="${k}">
    <span class="cx-kn"></span><span class="cx-nm">${esc(pname(k))}<i style="--w:${(C.reg[k] / C.regTotal * 100).toFixed(1)}%"></i></span>
    <span class="cx-pc">${fmtP(C.reg[k] / C.regTotal)}</span></button>`).join('')}</div>`;
  }
  const yes = (C, st) => C.order.filter(k => st[k]);
  function wire(el, st, init, draw) {
    if (el._w) return; el._w = true;
    el.addEventListener('click', e => {
      const b = e.target.closest('.cx-sw');
      if (b) { const k = b.dataset.k; st[k] = st[k] ? 0 : 1; draw(); const nb = el.querySelector(`.cx-sw[data-k="${k}"]`); if (nb) nb.focus({ preventScroll: true }); return; }
      if (e.target.closest('.cx-rs')) { Object.assign(st, init); draw(); el.querySelector('.cx-rs').focus({ preventScroll: true }); }
    });
  }
  function dk110(el, C, mark) {
    const init = { slo: 1, hrv: 1, srb: 0, bos: 1, cng: 1, mkd: 1, bul: 0 }, st = el._st || (el._st = { ...init });
    const draw = () => {
      const R = REGLES.cleDouble(C, yes(C, st));
      el.innerHTML = `<div class="cx-ih"><div class="cx-big ${R.cinq ? 'cx-ok' : 'cx-ko'}">${R.n} / 7<small>≥ 5 ${sign(R.cinq)}</small></div>
      <div class="cx-big ${R.cle ? 'cx-ok' : 'cx-ko'}">${fmtP(R.part)}<small>&gt; 50 % ${sign(R.inscrits * 2 > C.regTotal)} · ${t(L`Registered citizens`)}</small></div></div>
      ${switches(C, st)}${as('reg', 'plen')}${reset()}`;
      // art. 110 al. 4 : cinq sur sept ; al. 5 : double clé ; al. 6 : six sur sept, ou les sept
      mark('110.cinq', R.cinq ? 'ok' : 'ko', `${R.n} / 7 ${sign(R.cinq)}`);
      mark('110.cle', R.cinq ? (R.cle ? 'ok' : 'ko') : 'na', `${fmtP(R.part)} ${R.cinq ? sign(R.cle) : ''}`.trim());
      mark('110.six', R.six ? 'ok' : 'ko', `6 / 7 ${sign(R.six)} · 7 / 7 ${sign(R.sept)}`);
    };
    wire(el, st, init, draw); draw();
  }
  function dk111(el, C, mark) {
    const init = { slo: 1, hrv: 1, srb: 1, bos: 1, cng: 0, mkd: 0, bul: 0 }, st = el._st || (el._st = { ...init });
    const draw = () => {
      const R = REGLES.conseil(C, yes(C, st));
      el.innerHTML = `<div class="cx-ih"><div class="cx-big ${R.adoptee ? 'cx-ok' : 'cx-ko'}">${R.n} / 7<small>${R.consensus ? '7 / 7' : R.cinq ? '≥ 5' : '≥ 4'} ${sign(R.adoptee)}</small></div>
      <div class="cx-big ${R.inscrits * 2 > C.regTotal ? 'cx-ok' : 'cx-ko'}">${fmtP(R.part)}<small>&gt; 50 % ${sign(R.inscrits * 2 > C.regTotal)} · ${t(L`Registered citizens`)}</small></div></div>
      ${switches(C, st)}${as('reg', 'exc')}${reset()}`;
      // art. 111 al. 3 : consensus ; al. 4 : quatre et la majorité des inscrits, ou cinq ; al. 5 : trente jours
      mark('111.consensus', R.consensus ? 'ok' : 'ko', `7 / 7 ${sign(R.consensus)}`);
      mark('111.quatre', R.consensus ? 'na' : R.adoptee ? 'ok' : 'ko', R.consensus ? '–' : `${R.n} + ${fmtP(R.part)} ${sign(R.quatre)} · ${R.n} ≥ 5 ${sign(R.cinq)}`);
      mark('111.suspension', R.suspendue ? 'on' : 'na', `${R.contre} ≥ 3 ${sign(R.suspendue)}`);
    };
    wire(el, st, init, draw); draw();
  }
  /* ---------------------------------------------------------------- art. 115 bis : le relevé annuel */
  function regs(el, C, mark) {
    el.innerHTML = `<table><tbody>${C.order.map(k => `<tr><td>${esc(pname(k))}</td><td class="cx-r">${fmtN(C.reg[k])}</td><td class="cx-r">${fmtP(C.reg[k] / C.regTotal)}</td></tr>`).join('')}
    <tr class="cx-tot"><td>${t(L`Total`)}</td><td class="cx-r">${fmtN(C.regTotal)}</td><td class="cx-r">${fmtP(1, 0)}</td></tr></tbody></table>${as('reg')}`;
    mark('115bis.releve', 'on', '');
  }
  /* ---------------------------------------------------------------- art. 103 : sièges du Kongres */
  function sl(el, C, mark) {
    const st = el._st || (el._st = { sel: null, f: {} });
    const base = REGLES.sieges(C.states), b0 = Object.fromEntries(base.rows.map(r => [r.c, r.s]));
    const pctOf = c => Math.round(((st.f[c] || 1) - 1) * 100);
    el.innerHTML = `<div class="cx-ih"></div><div class="cx-mapbox"></div><div class="cx-det" aria-live="polite"></div><div class="cx-seats"></div>${as('sl')}${reset()}`;
    const q = c => el.querySelector(c);
    let map = null, lastRows = null;
    drawMap(q('.cx-mapbox'), { label: L`Kongres seats`, pick: c => { if (c && c !== st.sel) { st.sel = c; draw(); } } }).then(m => { map = m; if (lastRows) paintMap(); });
    const paintMap = () => { if (!map) return; const by = Object.fromEntries(lastRows.map(r => [r.c, r.s])); map.paint(c => .08 + .92 * by[c] / 20); map.select(st.sel); };
    const draw = (dragging) => {
      const cur = REGLES.sieges(C.states.map(s => ({ ...s, pop: Math.round(s.pop * (st.f[s.c] || 1)) })));
      const rows = [...cur.rows].sort((a, b) => b.s - a.s || b.pop - a.pop), nf = rows.filter(r => r.floor).length, nc = rows.filter(r => r.cap).length;
      const sel = rows.find(r => r.c === st.sel), p = sel ? pctOf(sel.c) : 0, pv = `${p === 0 ? '±' : p > 0 ? '+' : '−'}${Math.abs(p)} %`;
      q('.cx-ih').innerHTML = `<div class="cx-big">${cur.sum}<small>${t(L`Delegates`)}</small></div>
      <div class="cx-big">${rows.length}<small>${t(L`Constituencies`)}</small></div>
      <div class="cx-big">÷ ${fmtN(Math.round(cur.D / 100) * 100)}<small translate="no">min 2 : ${nf} · max 20 : ${nc}</small></div>`;
      lastRows = rows; paintMap();
      q('.cx-seats').innerHTML = rows.map(r => `<button type="button" data-c="${r.c}" aria-pressed="${r.c === st.sel}" class="${r.floor || r.cap ? 'cx-lim' : ''}${r.s !== b0[r.c] ? ' cx-chg' : ''}" title="${t((byCode(r.c) || {}).n || r.c)}" translate="no" aria-label="${r.c} ${t((byCode(r.c) || {}).n || r.c)}: ${r.s}">
        <span>${r.c}</span><i style="--w:${r.s / 20 * 100}%"></i><b>${r.s}</b></button>`).join('');
      const info = sel ? `${stLine(sel.c)} · ${t(L`${fmtN(sel.pop)} inhabitants`)} · <b>${sel.s}</b>${sel.floor ? ` · <span translate="no">min ${sel.t === 'M' ? 1 : 2}</span>` : ''}${sel.cap ? ' · <span translate="no">max 20</span>' : ''}` : '';
      if (dragging && sel) { q('.cx-det .cx-inf').innerHTML = info; q('.cx-det output').textContent = pv; }
      else {
        q('.cx-det').innerHTML = sel ? `<div class="cx-inf">${info}</div>
        <div class="cx-sl-row"><label for="cxSlp" aria-hidden="true">±</label><input id="cxSlp" type="range" min="-60" max="200" step="5" value="${p}" aria-label="${t(L`Population`)} ${sel.c}"><output>${pv}</output></div>`
          : `${t(L`Inhabitants per delegate, on average`)}: <b>${fmtN(Math.round(C.popTotal / 250 / 100) * 100)}</b>`;
        const sp = q('#cxSlp');
        if (sp) sp.addEventListener('input', e => { st.f[st.sel] = 1 + e.target.value / 100; draw(true); });
      }
      const sp = q('#cxSlp'); if (sp) sp.style.setProperty('--v', (+sp.value + 60) / 260 * 100 + '%');
      // art. 103 al. 3 : une circonscription par État, deux à vingt sièges ; al. 4 : Brčko et Mostar
      mark('103.circonscriptions', 'on', `min 2 : ${nf} · max 20 : ${nc}`);
      mark('103.municipalites', 'on', rows.filter(r => r.t === 'M').map(r => r.s).join(' · '));
    };
    el.onclick = e => {
      const b = e.target.closest('.cx-seats button');
      if (b) { st.sel = st.sel === b.dataset.c ? null : b.dataset.c; draw(); const nb = el.querySelector(`.cx-seats [data-c="${b.dataset.c}"]`); if (nb) nb.focus({ preventScroll: true }); return; }
      if (e.target.closest('.cx-rs')) { st.sel = null; st.f = {}; draw(); }
    };
    draw();
  }
  /* ---------------------------------------------------------------- art. 1 bis : les États, liste et carte liées */
  function map1(el, C, mark) {
    el.innerHTML = `<div class="cx-mapbox"></div><div class="cx-det" aria-live="polite"></div>`;
    const det = el.querySelector('.cx-det'), art = () => document.getElementById('art-1bis');
    let cur, map = null;
    const TYPE = { T: N('Territorial state'), F: N('Confederal territory'), M: N('Confederal autonomous municipality') };
    const show = c => {
      if (c === cur) return; cur = c;
      if (art()) art().querySelectorAll('.cx-cell.cx-pk').forEach(x => x.classList.remove('cx-pk'));
      if (map) map.select(c);
      if (!c) { det.innerHTML = `<b>48</b> ${t(L`Territorial states`)} · <b>6</b> ${t(L`Confederal territories and municipalities`)}`; return; }
      const s = byCode(c), st = STATS[c] || {};
      det.innerHTML = `${stLine(c)}<br>${t(L(TYPE[s.t]))}${s.p !== 'fed' && PEUPLES[s.p] ? ' · ' + esc(pname(s.p)) : ''}${st.population ? ' · ' + t(L`${fmtN(st.population)} inhabitants`) : ''}`;
      if (art()) art().querySelectorAll(`a.cx-sl[href="#/state/${c}"]`).forEach(a => { const cell = a.closest('.cx-cell'); if (cell) cell.classList.add('cx-pk'); });
    };
    drawMap(el.querySelector('.cx-mapbox'), { label: L`States`, fill: c => ({ T: .3, F: 1, M: .62 })[(byCode(c) || {}).t], pick: show }).then(m => { map = m; });
    show(null);
    if (!el._w) {
      el._w = true; const A = art();
      if (A) { const over = e => { const a = e.target.closest && e.target.closest('a.cx-sl'); if (a) show(a.getAttribute('href').slice(8)); };
        A.addEventListener('mouseover', over); A.addEventListener('focusin', over); }
    }
  }
  /* ---------------------------------------------------------------- art. 1 ter : les quatre capitales */
  function cap(el, C, mark) {
    const U = { 'SA-92': '1ter.SA-92', 'BG-91': '1ter.BG-91', 'ZG-94': '1ter.ZG-94', 'SF-93': '1ter.SF-93' };
    el.innerHTML = `<div class="cx-mapbox"></div><div class="cx-det" aria-live="polite"></div>`;
    const det = el.querySelector('.cx-det'); let map = null;
    const show = c => {
      for (const k of Object.values(U)) mark(k, null, '');
      if (map) map.select(U[c] ? c : null);
      if (!c || !U[c]) { det.innerHTML = Object.keys(U).map(stLine).join(' · '); return; }
      const s = byCode(c);
      det.innerHTML = `${stLine(c)}<br>${t(L(s.ch))}`;
      mark(U[c], 'on', '');
    };
    drawMap(el.querySelector('.cx-mapbox'), { label: L`States`, fill: c => U[c] ? 1 : .14, labels: Object.keys(U), pick: show }).then(m => { map = m; });
    show(null);
  }
  /* ---------------------------------------------------------------- art. 109 b et 110 ter : la sonnette d'alarme */
  function alarm(el, C, mark) {
    const init = { k: 'cng', v: 7, day: 12, com: 8, mem: 1, kg: 150 }, st = el._st || (el._st = { ...init });
    const row = (id, lab, min, max, val) => `<div class="cx-sl-row"><label for="cxAl${id}" translate="no">${lab}</label><input id="cxAl${id}" data-f="${id}" type="range" min="${min}" max="${max}" step="1" value="${val}" aria-label="${esc(lab)}"><output></output></div>`;
    el.innerHTML = `<div class="cx-ih"></div>
    <div class="cx-pk7" role="group" aria-label="${t(L`Constituent peoples`)}">${C.order.map(k => `<button type="button" data-k="${k}" aria-pressed="${k === st.k}">${esc(pname(k))}</button>`).join('')}</div>
    ${row('v', '≥ 7 / 10', 0, 10, st.v)}${row('day', '≤ 30', 1, 60, st.day)}
    <div class="cx-k3" translate="no">${esc(sc(CX.lab('art', '110 ter', LANG)))}</div>
    ${row('com', '≥ 8 / 14', 0, 14, st.com)}
    <button type="button" class="cx-sw" role="switch" aria-checked="${!!st.mem}" data-mem><span class="cx-kn"></span><span class="cx-nm" id="cxAlMem"></span><span class="cx-pc" translate="no">1 / 14</span></button>
    ${row('kg', '≥ 167 / 250', 0, 250, st.kg)}
    ${as('al')}${reset()}`;
    const q = c => el.querySelector(c);
    const draw = () => {
      const A = REGLES.alarme({ voix: st.v, jour: st.day }), K = REGLES.conciliation({ pour: st.com, membre: st.mem }), two = REGLES.kongresDeuxTiers(st.kg);
      const raised = A.levee, comp = raised && K.adopte;
      q('.cx-ih').innerHTML = `<div class="cx-big ${raised ? 'cx-ok' : 'cx-ko'}">${st.v} / 10<small translate="no">≥ ⅔ ${sign(A.voix)} · ${st.day} ≤ 30 ${sign(A.delai)}</small></div>
      <div class="cx-big ${!raised ? '' : comp ? 'cx-ok' : two.ok ? 'cx-ok' : 'cx-ko'}">${!raised ? '–' : comp ? st.com + ' / 14' : st.kg + ' / 250'}<small translate="no">${!raised ? '' : comp ? '≥ 8 ' + sign(true) : '≥ 167 ' + sign(two.ok)}</small></div>`;
      q('#cxAlMem').textContent = pname(st.k);
      el.querySelectorAll('.cx-pk7 button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === st.k));
      for (const i of el.querySelectorAll('input[type=range]')) { const f = i.dataset.f; i.nextElementSibling.textContent = st[f];
        i.style.setProperty('--v', (st[f] - i.min) / (i.max - i.min) * 100 + '%'); }
      q('[data-mem]').setAttribute('aria-checked', !!st.mem);
      // art. 109 b : alarme levée, loi suspendue et renvoyée en conciliation
      mark('109.b', raised ? 'on' : 'na', `${st.v} / 10 ${sign(A.voix)} · ${st.day} ≤ 30 ${sign(A.delai)}`);
      // art. 110 ter : al. 2 saisine ; al. 3 majorité avec le membre ; al. 5 échec ; al. 5 b deux tiers
      mark('110ter.saisine', raised ? 'on' : null, '');
      mark('110ter.majorite', !raised ? null : comp ? 'ok' : 'ko', raised ? `${st.com} / 14 ${sign(K.majorite)} · 1 / 14 ${sign(!!st.mem)}` : '');
      mark('110ter.echec', raised && !comp ? 'on' : null, '');
      mark('110ter.b', raised && !comp ? (two.ok ? 'ok' : 'ko') : null, raised && !comp ? `${st.kg} / 250 ${sign(two.ok)}` : '');
    };
    el.oninput = e => { const f = e.target.dataset.f; if (f) { st[f] = +e.target.value; draw(); } };
    el.onclick = e => {
      const b = e.target.closest('.cx-pk7 button'); if (b) { st.k = b.dataset.k; draw(); return; }
      if (e.target.closest('[data-mem]')) { st.mem = st.mem ? 0 : 1; draw(); return; }
      if (e.target.closest('.cx-rs')) { Object.assign(st, init); el.querySelectorAll('input[type=range]').forEach(i => { i.value = st[i.dataset.f]; }); draw(); }
    };
    draw();
  }

  /* ---------------------------------------------------------------- carte de marge (map.js)
     Géométrie : constitution/map.json (scripts/build_carte_marge.py, depuis geo.json ; rien n'est dessiné
     à la main). Une couleur canonique en échelle tonale, jamais une couleur par peuple. Chaque entité
     mène à sa fiche ; une seule est dans l'ordre de tabulation, les flèches passent à la suivante. */
  async function drawMap(el, opts = {}) {
    const m = await CX.load('map.json'), codes = Object.keys(m.e);
    if (!el.isConnected) return null;
    const vb = [0, 0, m.w, m.h], sw = vb[2] / 560;
    el.innerHTML = `<svg class="cx-mp" viewBox="${vb.join(' ')}" role="group" aria-label="${t(opts.label || '')}" style="--sw:${sw.toFixed(2)}">${
      codes.map(c => `<a href="#/state/${c}" data-c="${c}" tabindex="-1" aria-label="${c} ${t((byCode(c) || {}).n || c)}"><path d="${m.e[c].d}"/></a>`).join('')}${
      (opts.labels || []).map(c => { const e = m.e[c]; return `<text x="${e.c[0]}" y="${e.c[1] - vb[2] * .022}" text-anchor="middle" font-size="${(vb[2] * .036).toFixed(1)}">${t((byCode(c) || {}).n || c)}</text>`; }).join('')}</svg>`;
    const svg = el.firstChild, A = Object.fromEntries([...svg.querySelectorAll('a')].map(a => [a.dataset.c, a]));
    let sel = null, tab = null;
    const setTab = c => { if (tab && A[tab]) A[tab].tabIndex = -1; tab = c; if (A[c]) A[c].tabIndex = 0; };
    const api = {
      paint(fill) { for (const c of codes) { const v = fill ? fill(c) : null, a = A[c];
        a.classList.toggle('cx-off', v == null); a.style.setProperty('--v', v == null ? 0 : Math.max(0, Math.min(1, v)).toFixed(3)); } },
      select(c) { if (sel && A[sel]) A[sel].classList.remove('cx-sel'); sel = c;
        if (c && A[c]) { A[c].classList.add('cx-sel'); svg.append(A[c]); svg.querySelectorAll('text').forEach(x => svg.append(x)); } },
      el: svg };
    api.paint(opts.fill || (() => .3));
    setTab(codes[0]);
    const pick = c => { if (opts.pick) opts.pick(c); };
    svg.addEventListener('pointerover', e => { const a = e.target.closest('a'); if (a) pick(a.dataset.c); });
    svg.addEventListener('pointerleave', () => pick(null));
    svg.addEventListener('focusin', e => { const a = e.target.closest('a'); if (a) { setTab(a.dataset.c); pick(a.dataset.c); } });
    svg.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
      e.preventDefault();
      const i = codes.indexOf(tab), c = codes[(i + d + codes.length) % codes.length]; setTab(c); A[c].focus({ preventScroll: true });
    });
    return api;
  }

  return {
    /* lecteur : instruments montés à l'approche de leur article ; leurs marques vont sur l'article */
    mount(el) { mount(el, el.dataset.ins, marker(id => '#' + id)); },
    drawMap
  };
})();
