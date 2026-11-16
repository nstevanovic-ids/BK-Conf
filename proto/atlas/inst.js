/* Atlas — instruments de la Constitution : la carte dit ce que l'article calcule.
   Chaque règle est appliquée à la lettre du texte (constitution.json) sur les chiffres de
   stats.json ; ce que le texte ne tranche pas est affiché sous l'instrument et listé dans NOTES.md.
   Aucun code couleur par peuple : pour / contre se lisent par l'aplat ou la hachure. */
export function create(ctx) {
  const { CORE, BY, L, U, esc, fmtN, disp, cNum, lang, L_LOC, DESK } = ctx;
  const KIND = { 'art-103': 'seats', 'art-110': 'key', 'art-111': 'key', 'art-115bis': 'key', 'art-132': 'equal',
    'art-130quater': 'pick', 'art-122': 'pick', 'art-106bis': 'pick' };
  const P = Object.keys(CORE.peoples);                       // ordre de l'art. 110 : slo, hrv, srb, bos, cng, mkd, bul
  const TS = CORE.states.filter(s => s.t === 'T'), S52 = CORE.states.filter(s => s.t !== 'M');
  const pct = (x, d = 0) => (100 * x).toLocaleString(L_LOC[lang()] || 'en-GB', { maximumFractionDigits: d }) + ' %';
  const pen = p => L(CORE.peoples[p].en);

  /* Registres nationaux (art. 115 bis) : aucun décompte n'existe ; chaque registre est approché
     par la population des États territoriaux rattachés au peuple (méthode de docs/canon/equilibre.md). */
  const REG = {}; let REGT = 0;
  for (const p of P) { REG[p] = TS.filter(s => s.p === p).reduce((a, s) => a + s.pop, 0); REGT += REG[p]; }
  const HEAD = {}; for (const p of P) HEAD[p] = TS.filter(s => s.p === p).sort((a, b) => b.pop - a.pop)[0];

  const S = { key: new Set(['slo', 'hrv', 'bos', 'cng', 'mkd']), floor: 85, cap: 30,
    pick: { 'art-130quater': new Set(), 'art-122': new Set(), 'art-106bis': new Set() } };

  /* ---------- art. 103 : 250 sièges, Sainte-Laguë, plancher 2, plafond 20, Brčko et Mostar ≥ 1
     (même calcul que kongresSeats() du portail : diviseur commun, arrondi au plus proche) ---------- */
  let _seats = null;
  function seats() {
    if (_seats) return _seats;
    const rows = CORE.states.filter(s => s.pop).map(s => ({ c: s.c, n: s.n, t: s.t, p: s.pop }));
    const at = D => rows.map(r => Math.min(20, Math.max(r.t === 'M' ? 1 : 2, Math.round(r.p / D))));
    let lo = 1, hi = 1e7, D = 0, s = [];
    for (let i = 0; i < 200; i++) { D = (lo + hi) / 2; s = at(D); const n = s.reduce((a, b) => a + b, 0); if (n > 250) lo = D; else if (n < 250) hi = D; else break; }
    rows.forEach((r, i) => { r.s = s[i]; });
    return _seats = { D, rows, by: Object.fromEntries(rows.map(r => [r.c, r])), pop: rows.reduce((a, r) => a + r.p, 0), total: s.reduce((a, b) => a + b, 0) };
  }

  /* ---------- art. 110, 111, 115 bis : double clé ---------- */
  function key(id) {
    const n = S.key.size, share = [...S.key].reduce((a, p) => a + REG[p], 0) / REGT;
    const ok = id === 'art-111' ? (n >= 5 || (n >= 4 && share > 0.5)) : (n >= 5 && share > 0.5);
    return { n, share, ok, council: id === 'art-111' };
  }

  /* ---------- art. 132 : péréquation ----------
     b) aucun État sous le plancher (85 % de la moyenne) après péréquation ;
     c) aucun contributeur privé de plus du plafond (30 %) de son excédent sur la moyenne. */
  function equal() {
    const pop = S52.reduce((a, s) => a + s.pop, 0), avg = S52.reduce((a, s) => a + s.pop * s.gdp, 0) / pop;
    const f = S.floor / 100, c = S.cap / 100;
    let need = 0, sur = 0;
    const rows = S52.map(s => {
      const gap = Math.max(0, f * avg - s.gdp), exc = Math.max(0, s.gdp - avg);
      need += gap * s.pop; sur += exc * s.pop;
      return { s, gap, exc };
    });
    const wanted = sur ? need / sur : 0, rate = Math.min(c, wanted), cover = need ? Math.min(1, rate * sur / need) : 1;
    let nc = 0, nr = 0, maxA = 0;
    for (const r of rows) {
      r.after = r.s.gdp + cover * r.gap - rate * r.exc;
      r.amt = r.gap ? cover * r.gap * r.s.pop : -rate * r.exc * r.s.pop;
      if (r.amt > 0) nr++; else if (r.amt < 0) nc++;
      maxA = Math.max(maxA, Math.abs(r.amt));
      r.rel = r.s.gdp / avg; r.relA = r.after / avg;
    }
    return { avg, rows, by: Object.fromEntries(rows.map(r => [r.s.c, r])), wanted, rate, cover, ok: wanted <= c + 1e-9, nc, nr, maxA, f, c };
  }

  /* ---------- art. 130 quater, 122, 106 bis : coalitions d'États ---------- */
  const PICK = {
    'art-130quater': { need: 12, elig: s => s.t === 'T', rule: 'peoples' },
    'art-122': { need: 12, elig: s => s.t !== 'M', rule: 'half' },
    'art-106bis': { need: 8, elig: s => s.t !== 'M', rule: 'half' },
  };
  function pick(id) {
    const cfg = PICK[id], sel = [...S.pick[id]].map(c => BY[c]);
    const by = {}; sel.forEach(s => { if (s.p !== 'fed') by[s.p] = (by[s.p] || 0) + 1; });
    const peoples = Object.keys(by).length, top = Math.max(0, ...Object.values(by));
    const ok = sel.length >= cfg.need && (cfg.rule === 'peoples' ? peoples >= 3 : top <= sel.length / 2);
    return { cfg, sel, n: sel.length, peoples, top, ok };
  }

  /* ---------- rendu des panneaux ---------- */
  const gauge = (cap, val, frac, ticks, bad) => `<div class="gz"><div class="gz-h"><span>${cap}</span><b>${val}</b></div>
    <div class="gz-b"><i${bad ? ' class="no"' : ''} style="width:${Math.max(0, Math.min(100, 100 * frac)).toFixed(1)}%"></i>${ticks.map(([x, l]) => `<u style="left:calc(${(100 * x).toFixed(1)}% - 1px)" data-l="${esc(l)}"></u>`).join('')}</div></div>`;
  const verdict = (ok, txt, small) => `<div class="vd ${ok ? 'ok' : 'ko'}" role="status"><b aria-hidden="true">${ok ? '✓' : '✗'}</b><div>${esc(L('Outcome'))} · ${txt}${small ? `<small>${small}</small>` : ''}</div></div>`;

  function live(id) {
    const k = KIND[id];
    if (k === 'seats') {
      const K = seats();
      return `<div class="kp"><div><b>${fmtN(K.total)}</b><span>${esc(L('Delegates'))}</span></div><div><b>${fmtN(K.rows.length)}</b><span>${esc(L('Constituencies'))}</span></div>
        <div><b>${fmtN(Math.round(K.pop / 250 / 100) * 100)}</b><span>${esc(L('Inhabitants per delegate, on average'))}</span></div></div>
        <div class="stl">${[...K.rows].sort((a, b) => b.s - a.s || b.p - a.p).map(r => `<span><a class="ref" href="#state-${r.c}" translate="no">${r.c}</a><b>${r.s}</b></span>`).join('')}</div>
        <p class="hy">${esc(L('Each population is divided by a common divisor, here {0}, and rounded to the nearest whole number; the divisor is chosen so that the 250 seats are filled, with at least 2 and at most 20 per State and at least 1 for Brčko and Mostar. Census figures as on the State pages; the Konfederalno Veće confirms the distribution after each census ({1}).', fmtN(Math.round(K.D / 10) * 10), cNum('Article 103', true)))}</p>`;
    }
    if (k === 'key') {
      const r = key(id);
      const tg = `<div class="tg">${P.map(p => `<button type="button" data-act="toggle" data-v="${p}" data-f="k-${id}-${p}" aria-pressed="${S.key.has(p)}">${esc(pen(p))} <span aria-hidden="true">${S.key.has(p) ? '✓' : '✗'}</span><small>${pct(REG[p] / REGT, 1)}</small></button>`).join('')}</div>`;
      const g1 = gauge(U('In favour'), `${r.n} / 7`, r.n / 7, r.council ? [[4 / 7, '4'], [5 / 7, '5']] : [[5 / 7, '5']], r.council ? r.n < 4 : r.n < 5);
      const g2 = gauge(U('Enrolled citizens represented'), pct(r.share, 1), r.share, [[0.5, '50 %']], r.share <= 0.5);
      const sus = r.council && r.ok && 7 - r.n >= 3 ? esc(L('A decision taken against three councillors or more is suspended for thirty days while the delegations of their peoples are heard, then reconsidered.')) : '';
      return `${tg}${g1}${g2}${verdict(r.ok, r.ok ? U('Adopted') : U('Not adopted'), sus)}
        <p class="hy">${U('Assumptions: each national register is approximated by the population of the territorial States attached to its people (docs/canon/equilibre.md), since no count of the registers exists yet.')}${r.council ? '' : ' ' + U('Each delegation is taken as voting as a bloc; the plenary majority of Article 110 is not simulated separately.')}</p>`;
    }
    if (k === 'equal') {
      const e = equal(), W = 300, H = 118, x = v => Math.max(0, Math.min(W, (v - 0.55) / (2.05 - 0.55) * W));
      const rows = [...e.rows].sort((a, b) => a.rel - b.rel);
      const chart = `<svg class="eqc" viewBox="0 0 ${W} ${H + 16}" role="img" aria-label="${esc(L('GDP per capita'))}">
        <line x1="${x(1)}" x2="${x(1)}" y1="0" y2="${H}" stroke="#171B36" stroke-width="1"/><line x1="${x(e.f)}" x2="${x(e.f)}" y1="0" y2="${H}" stroke="#171B36" stroke-width="1" stroke-dasharray="3 3"/>
        ${rows.map((r, i) => { const y = 3 + i * (H - 6) / (rows.length - 1);
          return `<line x1="${x(r.rel).toFixed(1)}" x2="${x(r.relA).toFixed(1)}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#374078" stroke-width="1.6"/><circle cx="${x(r.rel).toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" fill="#fff" stroke="#374078" stroke-width=".8"/><circle cx="${x(r.relA).toFixed(1)}" cy="${y.toFixed(1)}" r="1.7" fill="#171B36"/>`; }).join('')}
        <text x="${x(e.f) - 3}" y="${H + 12}" font-size="9.5" text-anchor="end" fill="#171B36">${S.floor} %</text><text x="${x(1) + 3}" y="${H + 12}" font-size="9.5" fill="#171B36">100 %</text><text x="${W}" y="${H + 12}" font-size="9.5" text-anchor="end" fill="#4B5174">200 %</text></svg>`;
      return `<div class="kp"><div><b>${fmtN(Math.round(e.avg / 100) * 100)}</b><span>${esc(L('GDP per capita, PPS, 2023'))}</span></div><div><b>${e.nc}</b><span>${U('Contributing States')}</span></div><div><b>${e.nr}</b><span>${U('Receiving States')}</span></div></div>
        ${chart}
        ${gauge(U('Share of surpluses levied'), pct(Math.min(1, e.wanted), 1), Math.min(1, e.wanted) / 0.6, [[e.c / 0.6, S.cap + ' %']], !e.ok)}
        ${verdict(e.ok, e.ok ? U('Floor reached') : U('Floor not reached within the cap'), '')}
        <p class="hy">${U('Assumptions: fiscal capacity and tax resources per inhabitant are taken as GDP per capita (PPS, 2023); the 52 States only; every contributing State gives the same share of its surplus; if the cap binds, receipts are reduced pro rata.')}</p>`;
    }
    const r = pick(id), c = r.cfg;
    const second = c.rule === 'peoples' ? gauge(esc(L('Constituent peoples')), `${r.peoples} / 3`, r.peoples / 7, [[3 / 7, '3']], r.peoples < 3)
      : gauge(U('Largest share of one people'), `${r.top} / ${r.n}`, r.n ? r.top / r.n : 0, [[0.5, '50 %']], r.n > 0 && r.top > r.n / 2);
    return `${gauge(esc(L('States')), `${r.n} / ${c.need}`, r.n / 24, [[c.need / 24, String(c.need)]], r.n < c.need)}${second}
      ${verdict(r.ok, `${r.n} / ${c.need}`)}
      <div class="stl" style="max-height:74px">${r.sel.map(s => `<span><b translate="no">${s.c}</b></span>`).join('')}</div>
      <div class="row"><button type="button" class="btn" data-act="reset" data-f="r-${id}">${U('Reset')}</button></div>
      <p class="hy">${U('Select States on the map.')}${c.rule === 'half' ? ' ' + U('Assumption: “no more than half” is counted on the States making the request; city-States are States and belong to no people.') : ''}</p>`;
  }
  function panel(id) {
    const k = KIND[id];
    const head = k === 'seats' ? L('Kongres seats') : k === 'equal' ? L('Confederal financial equalisation formula')
      : id === 'art-111' ? L('7 councillors, one per people') : k === 'key' ? L('7 delegations')
      : id === 'art-130quater' ? L('Confederal parties') : id === 'art-122' ? L('Referendum') : L('Initiative');
    const q = k === 'seats' ? L('Every State is a constituency. Seats follow the population, so that a delegate represents roughly the same number of inhabitants everywhere, within a floor that keeps the smallest States in the chamber.')
      : id === 'art-111' ? L('Without consensus, a decision needs four councillors whose peoples hold a majority of enrolled citizens, or five councillors.')
      : id === 'art-130quater' ? L('Public funding and airtime go to parties standing in at least twelve States of at least three peoples.')
      : id === 'art-122' ? L('150,000 citizens, or 12 States with no more than half from one people, request a vote within 100 days. The law goes to the people and is rejected if a majority votes against it.')
      : k === 'equal' ? L('Article 132, objective indicators, 85% floor of fiscal capacity per capita.') : '';
    const fixed = k === 'equal' ? `<label class="sl"><span>${U('Floor')} · ${esc(cNum('Article 132', true))} b</span><output data-o="floor">${S.floor} %</output><input type="range" min="60" max="100" step="1" value="${S.floor}" data-k="floor" data-f="s-floor"></label>
      <label class="sl"><span>${U('Cap')} · ${esc(cNum('Article 132', true))} c</span><output data-o="cap">${S.cap} %</output><input type="range" min="0" max="60" step="1" value="${S.cap}" data-k="cap" data-f="s-cap"></label>` : '';
    return `<h4>${esc(head)}</h4>${q ? `<p class="q">${esc(q)}</p>` : ''}
      <div class="row" style="margin:0 0 10px"><button type="button" class="btn" data-act="map" data-f="m-${id}">${esc(ctx.T('nav_map'))} ↗</button></div>
      ${fixed}<div data-live>${live(id)}</div>`;
  }
  function act(id, a, v) {
    if (a === 'toggle') { if (S.key.has(v)) S.key.delete(v); else S.key.add(v); }
    else if (a === 'reset') S.pick[id].clear();
    else if (a === 'set') { const [k, x] = v.split(':'); S[k] = +x;
      document.querySelectorAll(`.inst output[data-o="${k}"]`).forEach(o => { o.textContent = x + ' %'; }); }
  }

  /* ---------- la même chose, dite par la carte ---------- */
  function view(id) {
    const k = KIND[id], sc = () => (DESK.matches ? 1 : 0.62);
    if (k === 'seats') {
      const K = seats();
      return { cls: () => 'i-lo', names: false, pick: () => false,
        circles: () => K.rows.map(r => ({ c: r.c, r: 4.4 * Math.sqrt(r.s) * sc(), cls: 'cs' })),
        labels: () => K.rows.filter(r => r.s >= (DESK.matches ? 3 : 7)).map(r => ({ c: r.c, pt: BY[r.c].pt, free: true, v: [['nu', String(r.s), 'c']] })),
        tip: c => { const r = K.by[c]; return `<b>${esc(disp(r.n))}<code>${c}</code></b><span>${r.s} · ${esc(disp(L('Delegates')))} · ${esc(disp(L('{0} inhabitants', fmtN(r.p))))}</span>`; } };
    }
    if (k === 'key') {
      return { cls: c => BY[c].p === 'fed' ? 'i-na' : S.key.has(BY[c].p) ? 'i-on' : 'i-off', names: false,
        pick: c => { const p = BY[c].p; if (p === 'fed') return false; if (S.key.has(p)) S.key.delete(p); else S.key.add(p); return true; },
        labels: () => P.map(p => ({ pt: HEAD[p].pt, v: [['pp' + (S.key.has(p) ? '' : ' off'), `${esc(disp(pen(p)))}<i>${S.key.has(p) ? '✓' : '✗'}</i>`, 'c']] })),
        tip: c => { const p = BY[c].p; return `<b>${esc(disp(BY[c].n))}<code>${c}</code></b><span>${p === 'fed' ? '—' : esc(disp(pen(p))) + ' · ' + pct(REG[p] / REGT, 1)}</span>`; } };
    }
    if (k === 'equal') {
      return { cls: c => { const r = equal().by[c]; return r ? 's' + [0.7, 0.85, 1, 1.3].reduce((n, b) => n + (r.rel >= b ? 1 : 0), 0) : 'i-na'; }, names: false, pick: () => false,
        circles: () => { const e = equal(); return e.rows.filter(r => Math.abs(r.amt) > 0).map(r => ({ c: r.s.c, r: Math.max(2.5, 24 * Math.sqrt(Math.abs(r.amt) / e.maxA) * sc()), cls: r.amt > 0 ? 'ch' : 'cg' })); },
        labels: () => [],
        tip: c => { const r = equal().by[c]; return `<b>${esc(disp(BY[c].n))}<code>${c}</code></b><span>${r ? pct(r.rel, 0) + ' → ' + pct(r.relA, 0) : '—'}</span>`; } };
    }
    const cfg = PICK[id];
    return { cls: c => !cfg.elig(BY[c]) ? 'i-na' : S.pick[id].has(c) ? 'i-on' : 'i-lo', names: false,
      pick: c => { if (!cfg.elig(BY[c])) return false; if (S.pick[id].has(c)) S.pick[id].delete(c); else S.pick[id].add(c); return true; },
      labels: () => [...S.pick[id]].map(c => ({ c, pt: BY[c].pt, v: [['st dk', BY[c].k, 'c']] })),
      tip: c => `<b>${esc(disp(BY[c].n))}<code>${c}</code></b><span>${BY[c].p === 'fed' ? esc(disp(L(BY[c].ch).replace(/&amp;/g, '&'))) : esc(disp(pen(BY[c].p)))}</span>` };
  }
  return { kind: id => KIND[id] || null, panel, live, act, view, _calc: { seats, key, equal, pick, REG, REGT, S } };
}
