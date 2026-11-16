import { S, T, H, Q, esc, fmtN, pct, artLink } from './core.js';
import { equalise } from './rules.js';

const LO = 0.4, HI = 2.4, pos = v => Math.max(0, Math.min(100, (v - LO) / (HI - LO) * 100));
const CONST = { f: 85, c: 30 };
let root, F = 85, K = 30;
const idx = x => fmtN(Math.round(x * 100));
const pc = n => n + (S.lang === 'en' ? '%' : ' %');

export async function render(app, h) {
const m = /^equalisation-(\d{1,3})-(\d{1,3})$/.exec(h);
F = m ? Math.min(100, Math.max(50, +m[1])) : CONST.f; K = m ? Math.min(100, +m[2]) : CONST.c;
const E = equalise(S.C, F / 100, K / 100);
const slider = (id, art, quote, min, max, v, cv) => `<div class="sl"><label for="${id}"><span class="sl-q"><span class="cap">${esc(T('Art. {0}', art))}</span>${esc(quote)}</span><output id="${id}-o" for="${id}">${pc(v)}</output></label>
<div class="sl-t"><input type="range" id="${id}" min="${min}" max="${max}" step="1" value="${v}"><i class="sl-m" style="left:${(cv - min) / (max - min) * 100}%" aria-hidden="true"></i></div>
<button type="button" class="sl-c" data-reset="${id}">${esc(T('Art. {0}', art))} · ${pc(cv)}</button></div>`;
app.innerHTML = `<div class="eq" id="eq">
<header class="doc-h"><div class="cap">${H('Finance')} · ${artLink('131')} ${artLink('132')}</div>
<h1 class="h1">${H('Confederal financial equalisation formula')}</h1>
<p class="eq-h">${H('Fiscal capacity per inhabitant is taken as proportional to GDP per capita, the only indicator of Article 132 a published for every State.')}</p>
<p class="eq-m" id="eq-m" aria-live="polite"></p></header>
<section class="eq-c" aria-label="${esc(T('Limits'))}">
${slider('fl', '132 b', Q('132b'), 50, 100, F, CONST.f)}
${slider('cp', '132 c', Q('132c'), 0, 100, K, CONST.c)}
</section>
<section class="eq-k" id="eq-k"></section>
<section class="eq-ch" aria-label="${esc(T('GDP per capita'))}">
<div class="eq-ax"><span class="ax-l">${H('Name')}</span><div class="ax" aria-hidden="true"><i class="ax-f" id="ax-f"><b id="ax-fb"></b></i><i class="ax-m" style="left:${pos(1)}%"><b>100</b></i>
${[0.5, 1.5, 2].map(v => `<i class="ax-g" style="left:${pos(v)}%"><b translate="no">${v * 100}</b></i>`).join('')}</div><span class="ax-u">${H('Confederal average = 100')}</span></div>
<ol class="eq-r" id="eq-r">${E.rows.map(r => `<li><a href="#state-${r.c}" data-c="${r.c}"><span class="er-n"><code translate="no">${r.s.k}</code>${esc(r.s.n)}</span>
<span class="er-t"><i class="er-b"></i><i class="er-0"></i><i class="er-1"></i></span><span class="er-v"></span></a></li>`).join('')}</ol>
</section>
<details class="hyp" open><summary>${H('Assumptions of the instrument')}</summary><ul>
<li>${H('The confederal average is that of the 52 States, weighted by population, before equalisation. Brčko and Mostar are not States.')}</li>
<li>${H('Every contributor gives the same fraction of its surplus, never more than the ceiling. What the ceiling leaves uncovered falls to the Confederation, since the floor is guaranteed without reservation.')}</li>
<li>${H('GDP per capita, PPS, 2023')} · ${H('Boundaries: GADM, geoBoundaries, Natural Earth. Population: national censuses and registers. GDP: Eurostat regional accounts, 2023.')}</li></ul></details>
</div>`;
root = app.querySelector('#eq');
root.addEventListener('input', e => { if (e.target.type !== 'range') return; if (e.target.id === 'fl') F = +e.target.value; else K = +e.target.value; draw(true); });
root.addEventListener('click', e => { const b = e.target.closest('[data-reset]'); if (!b) return;
const i = root.querySelector('#' + b.dataset.reset); i.value = b.dataset.reset === 'fl' ? CONST.f : CONST.c; i.dispatchEvent(new Event('input', { bubbles: true })); });
draw(false);
return T('Finance');
}
export function update() { return false; }

function draw(live) {
const E = equalise(S.C, F / 100, K / 100);
root.querySelector('#fl-o').textContent = pc(F); root.querySelector('#cp-o').textContent = pc(K);
root.dataset.const = F === CONST.f && K === CONST.c ? 1 : 0;
root.querySelector('#ax-f').style.left = pos(F / 100) + '%'; root.querySelector('#ax-fb').textContent = F;
root.querySelector('#eq-m').innerHTML = H('Result of the model: with a ceiling of {0}, the contributors fund {1} of what a floor of {2} requires.', pc(K), pct(E.cover, 0), pc(F));
root.querySelector('#eq-k').innerHTML = `
<div class="k"><div class="cap"><i class="gl" data-o="f"></i>${H('Receives')}</div><b>${E.nRecv}</b><span>${H('States')} · &lt; ${F}</span></div>
<div class="k"><div class="cap"><i class="gl" data-o="a"></i>${H('Contributes')}</div><b>${E.nPay}</b><span>${H('States')} · &gt; 100 · ${pct(K ? E.rate : 0, 1)} ${H('of the surplus')}</span></div>
<div class="k wide" data-ok="${E.cover >= 0.9995 ? 1 : 0}"><div class="cap">${esc(T('Art. {0}', '132 b'))} ∩ ${esc(T('Art. {0}', '132 c'))}</div><b>${pct(E.cover, 0)}</b>
<span class="cov"><i style="width:${E.cover * 100}%"></i></span></div>`;
for (const r of E.rows) {
const a = root.querySelector(`a[data-c="${r.c}"]`), t = a.children[1].children, lo = Math.min(r.idx, r.after), hi = Math.max(r.idx, r.after);
t[0].style.left = pos(lo) + '%'; t[0].style.width = (pos(hi) - pos(lo)) + '%'; t[0].dataset.d = Math.sign(r.d);
t[1].style.left = pos(r.idx) + '%'; t[2].style.left = pos(r.after) + '%';
a.children[2].textContent = r.d ? `${idx(r.idx)} → ${idx(r.after)}` : idx(r.idx);
a.setAttribute('aria-label', `${r.s.n}: ${idx(r.idx)} → ${idx(r.after)}`);
}
if (live) history.replaceState(null, '', F === CONST.f && K === CONST.c ? '#equalisation' : `#equalisation-${F}-${K}`);
}
