/* Sabor : la fiche d'un État, vue par son poids ; et le répertoire des 54 entités. */
import { S, T, H, esc, fmtN, pct, peopleName, artLink, loadNotes, typeLine } from './core.js';
import { equalise, HYP } from './rules.js';

const sub = s => s.t === 'T' ? T(S.C.peoples[s.p].en + ' state · seat {0}', s.ch) : T(s.ch).replace('&amp;', '&');
const idx = x => fmtN(Math.round(x * 100));
const ROT = 'Register of the ';
let sortKey = 'c', sortDir = 1, MAP = null, OPS = null;
export let code = null;                       // État affiché (élément partagé avec l'instrument)
const loadMap = async () => MAP || (MAP = await (await fetch('data/map.json')).json());

export async function render(app, h) {
  const C = S.C; code = null;
  if (h === 'states') return directory(app);
  const s = C.by[h.slice(6, 11).toUpperCase()];
  if (!s) { app.innerHTML = `<div class="boot"><h1 class="h1">${H('State not found.')}</h1><p><a class="btn" href="#states">${H('All states')}</a></p></div>`; return T('Not found'); }
  code = s.c;
  const notes = await loadNotes();
  const Q = equalise(C), q = Q.by[s.c];
  const byPop = [...C.states].sort((a, b) => b.pop - a.pop), bySeats = [...C.states].sort((a, b) => b.s - a.s || b.pop - a.pop);
  const prev = C.states[(s.i + 53) % 54], next = C.states[(s.i + 1) % 54];
  const noteT = notes[s.k], aut = C.aut.filter(a => a.host === s.c);
  const two = x => fmtN(x, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + (S.lang === 'en' ? '%' : ' %');
  let eq;
  if (!q) eq = `<p class="w-v">–</p><p class="w-x">${H('Direct confederal jurisdiction')}</p>`;
  else eq = `<p class="w-v eqv"><i class="gl" data-o="${q.d > 0 ? 'f' : q.d < 0 ? 'a' : 'x'}"></i>${q.d > 0 ? H('Receives') : q.d < 0 ? H('Contributes') : '–'}</p>
      <p class="w-n">${idx(q.idx)} → ${idx(q.after)}${q.d < 0 ? ` · ${pct(Q.rate, 0)} ${H('of the surplus')}` : ''}</p>
      <div class="mini" role="img" aria-label="${idx(q.idx)} → ${idx(q.after)}"><i class="m-fl" style="left:${85 / 2.5}%"></i><i class="m-av" style="left:${100 / 2.5}%"></i>
        <i class="m-b" data-d="${Math.sign(q.d)}" style="left:${Math.min(q.idx, q.after) * 40}%;width:${Math.abs(q.after - q.idx) * 40}%"></i><i class="m-d" style="left:${q.after * 40}%"></i></div>
      <p class="w-x">${H('Confederal average = 100')} · ${artLink('132')} · <a href="#equalisation">${H('Confederal financial equalisation formula')}</a></p>`;
  app.innerHTML = `<article class="st">
    <nav class="st-nav" aria-label="${esc(T('States'))}"><a href="#states">← ${H('All states')}</a>
      <span><a href="#state-${prev.c}" rel="prev" aria-label="${esc(T('Previous') + ': ' + prev.n)}">← <code translate="no">${prev.c}</code></a><a href="#state-${next.c}" rel="next" aria-label="${esc(T('Next') + ': ' + next.n)}"><code translate="no">${next.c}</code> →</a></span></nav>
    <header class="st-h">
      <div class="st-id"><div class="cap"><code translate="no">${s.c}</code> · ${esc(typeLine(s))}</div>
        <h1 class="h1">${esc(s.n)}</h1><p class="st-sub">${esc(sub(s))}</p>
        <p class="st-act"><a class="btn" href="#select-${s.c}">${H('Open in the instrument')} →</a></p></div>
      <figure class="loc" id="loc" style="aspect-ratio:${1 / C.mapR}"></figure>
      <figure class="flag"><img src="flags/${s.c}.png" width="${s.fw}" height="${s.fh}" alt="${esc(T('State Flag') + ': ' + s.n)}">
        ${noteT ? `<figcaption>${esc(noteT)}</figcaption>` : ''}</figure>
    </header>
    <section class="wt" aria-label="${esc(T('Key data'))}">
      <div class="w big"><div class="cap">${H('Kongres seats')} · ${artLink('103')}</div>
        <p class="w-v"><b>${s.s}</b><span> / 250</span></p>
        <div class="seats">${bySeats.map(x => `<a href="#state-${x.c}" title="${esc(x.n)} · ${x.s}" style="flex:${x.s}"${x === s ? ' aria-current="true"' : ''}><span class="vh">${esc(x.n)}</span></a>`).join('')}</div>
        <p class="w-x">${esc(T('Rank {0} of {1}', bySeats.indexOf(s) + 1, 54))} · ${H('Inhabitants per delegate, on average')}: ${fmtN(Math.round(s.pop / s.s))}</p></div>
      <div class="w"><div class="cap">${H('Population')}</div><p class="w-v"><b>${fmtN(s.pop)}</b></p>
        <p class="w-x">${esc(T('Rank {0} of {1}', byPop.indexOf(s) + 1, 54))} · ${pct(s.pop / C.popTotal)} · ${esc(T(s.src))}</p></div>
      <div class="w"><div class="cap">${H('GDP per capita')}</div><p class="w-v"><b>${esc(T('{0} PPS', fmtN(s.gdp)))}</b></p>
        <p class="w-x">${esc(T('{0}% of the EU-27 average', s.eu))} · ${esc(T(s.gsrc))}</p></div>
      <div class="w"><div class="cap">${H('Finance')}</div>${eq}</div>
      <div class="w wide"><div class="cap">${H('Kongres')} · ${artLink('106')}</div>
        <p class="w-v"><b>${two(s.sw)}</b></p>
        <p class="w-n">${H('Share of the possible votes of the Kongres in which its delegates decide the outcome.')}</p>
        <p class="w-x">${H('Exact count over every alignment of the other 53 constituencies. It also belongs to {0} of the minimal majorities of 126 seats ({1} of {2}).', two(s.mmS), fmtN(s.mm), fmtN(C.mmTotal))} ${H(HYP.bloc)}</p></div>
      <div class="w"><div class="cap">${H('States')} · ${artLink('124')}</div>
        ${s.t === 'M' ? `<p class="w-v"><b>0</b><span> / 52</span></p><p class="w-x">${H(HYP.mun)}</p>`
          : `<p class="w-v"><b>1</b><span> / 52</span></p><p class="w-x">${H('Double majority: a majority of voters across the Confederation and a majority of the States, 27 of 52. Each State counts as one vote, decided by its own voters.')}</p>`}</div>
    </section>
    <section class="facts"><dl>
      ${s.p ? `<div><dt>${H('Constituent people')}</dt><dd>${esc(peopleName(s.p))} · ${esc(T(ROT + C.peoples[s.p].en))}: ${pct(C.reg[s.p] / C.regTotal)}</dd></div>` : ''}
      <div><dt>${H('Area')}</dt><dd>${esc(T('{0} km²', fmtN(s.area)))} · ${esc(T('{0} inhabitants / km²', fmtN(Math.round(s.pop / s.area))))}</dd></div>
      ${aut.length ? `<div><dt>${H('Autonomous communities')}</dt><dd>${aut.map(a => `<span class="aut">${esc(a.n)} <small>${esc(T(a.com + ' community'))}</small></span>`).join('')}</dd></div>` : ''}
      <div class="mun"><dt>${H('Municipalities')}</dt><dd><details id="mun"><summary>${s.mun ? fmtN(s.mun) : ''}</summary><p id="munl"></p></details></dd></div>
    </dl></section>
  </article>`;
  new Promise(r => (window.requestIdleCallback || setTimeout)(r, { timeout: 1500 })).then(loadMap).then(map => { const f = app.querySelector('#loc'); if (!f || code !== s.c) return; const [cx, cy] = map.c[s.c];
    f.innerHTML = `<svg viewBox="0 0 ${map.w} ${map.h}" role="img" aria-label="${esc(T('Location of {0} in the Confederation', s.n))}">
      <path class="land" d="${Object.entries(map.p).filter(e => e[0] !== s.c).map(e => e[1]).join('')}"/><path class="here" d="${map.p[s.c]}"/><circle class="ring" cx="${cx}" cy="${cy}" r="34"/></svg>`; });
  app.querySelector('#mun').addEventListener('toggle', async e => {
    if (!e.target.open) return;
    OPS = OPS || await (await fetch('data/opstine.json')).json();
    const l = OPS.filter(o => o[1] === s.c).map(o => o[0]);
    app.querySelector('#munl').textContent = l.join(' · ');
    if (!s.mun) e.target.querySelector('summary').textContent = fmtN(l.length);
  });
  if (location.hash.endsWith('-mun')) app.querySelector('#mun').open = true;
  return s.n;
}

function directory(app) {
  const C = S.C, Q = equalise(C);
  const val = { c: s => s.c, n: s => s.n, pop: s => s.pop, s: s => s.s, gdp: s => s.gdp, d: s => (Q.by[s.c] ? Q.by[s.c].idx : 0) };
  const rows = [...C.states].sort((a, b) => { const x = val[sortKey](a), y = val[sortKey](b); return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir; });
  const th = (k, lab, num, sub2) => `<th${num ? ' class="num"' : ''} aria-sort="${sortKey === k ? (sortDir > 0 ? 'ascending' : 'descending') : 'none'}"><button type="button" data-k="${k}">${lab}</button>${sub2 ? `<small>${sub2}</small>` : ''}</th>`;
  app.innerHTML = `<div class="dir"><header class="doc-h"><div class="cap">${H('Directory')}</div><h1 class="h1">${H('States & territories')}</h1>
    <p class="ver">${esc(T('{0} territorial states', 48))} · ${esc(T('{0} confederal territories', 4))} · ${esc(T('{0} confederal municipalities', 2))}</p></header>
    <div class="tblw"><table class="dt"><thead><tr>${th('c', H('Official code'))}${th('n', H('Name'))}<th class="c-p">${H('Constituent people')}</th><th class="c-s">${H('Seat')}</th>
      ${th('pop', H('Population'), 1)}${th('s', H('Kongres seats'), 1)}${th('gdp', H('GDP per capita'), 1, 'PPS')}${th('d', H('Finance'), 1, H('Confederal average = 100'))}</tr></thead>
    <tbody>${rows.map(s => { const q = Q.by[s.c];
      return `<tr><td><code translate="no">${s.c}</code></td><th scope="row"><a href="#state-${s.c}">${esc(s.n)}</a></th>
        <td class="c-p">${s.p ? esc(peopleName(s.p)) : esc(typeLine(s))}</td><td class="c-s">${s.t === 'T' ? esc(s.ch) : esc(T(s.ch).replace('&amp;', '&'))}</td>
        <td class="num">${fmtN(s.pop)}</td><td class="num">${s.s}</td><td class="num c-g">${fmtN(s.gdp)}</td>
        <td class="num">${q ? `${q.d ? `<i class="gl" data-o="${q.d > 0 ? 'f' : 'a'}"></i>` : ''}${idx(q.idx)}${q.d ? ' → ' + idx(q.after) : ''}` : '–'}</td></tr>`; }).join('')}</tbody></table></div>
    <p class="ver"><i class="gl" data-o="f"></i>${H('Receives')} · <i class="gl" data-o="a"></i>${H('Contributes')} · ${artLink('103')} ${artLink('132')}</p></div>`;
  app.querySelector('thead').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
    if (sortKey === b.dataset.k) sortDir = -sortDir; else { sortKey = b.dataset.k; sortDir = ['c', 'n'].includes(sortKey) ? 1 : -1; }
    directory(app); app.querySelector(`button[data-k="${sortKey}"]`).focus(); });
  return T('States');
}
