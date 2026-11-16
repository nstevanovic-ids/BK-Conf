import { S, T, H, esc, fold, cyrApply, typeLine, label, fmtN, pct } from './core.js';
import { TYPES, SCENARIOS, encode, evaluate } from './rules.js';

let el, input, list, items = [], cur = 0, arts = null, ops = null, last = null, builtFor = '', BODY = {}, bodyFor = '';
const N = s => s;
const PAGES = [['home', N('Home')], ['states', N('States & territories')], ['equalisation', N('Confederal financial equalisation formula')], ['constitution', N('Constitution')]];

function index() {
const C = S.C, ix = [];
TYPES.forEach(t => ix.push({ g: 'Law', t: label(t.name), s: t.arts.map(a => T('Art. {0}', a)).join(', '), h: 'vote-' + t.id }));
SCENARIOS.forEach(s => { const v = s.make(C); ix.push({ g: 'Choose a case', t: label(TYPES.find(t => t.id === s.type).name), s: s.tag(evaluate(C, v), x => pct(x / C.regTotal)), h: encode(C, v) }); });
PAGES.forEach(p => ix.push({ g: 'Pages', t: T(p[1]), s: '', h: p[0] }));
C.states.forEach(s => ix.push({ g: 'States', t: s.n, s: typeLine(s) + (s.t === 'T' ? ' · ' + s.ch : ''), code: s.c, h: 'state-' + s.c, k: fold(s.n + ' ' + s.c + ' ' + s.k + ' ' + (s.t === 'T' ? s.ch : '')) }));
(arts || []).forEach(a => ix.push({ g: 'Constitution', t: a[S.lang] || a.en, s: T('Article {0}', a.num), h: a.id, num: fold(a.num), id: a.id,
k: fold((a[S.lang] || a.en) + ' ' + a.en + ' ' + a.num + ' art ' + a.num.replace(' ', '')) }));
(ops || []).forEach(o => { const st = C.by[o[1]]; if (st && fold(o[0]) !== fold(st.n)) ix.push({ g: 'Municipalities', t: o[0], s: st.n, code: st.c, h: 'state-' + st.c + '-mun', k: fold(o.filter((x, i) => i !== 1).join(' ')) }); });
ix.forEach(i => { if (!i.k) i.k = fold(i.t + ' ' + i.s); });
return ix;
}
let IX = [];
const CAP = { Law: 9, 'Choose a case': 4, Pages: 4, States: 8, Constitution: 8, Municipalities: 8 };
function search(q) {
const f = fold(q), out = [];
if (!f) return IX.filter(i => i.g === 'Law' || i.g === 'Pages');
const by = {}, seen = new Set();
for (const i of IX) { const p = i.k.indexOf(f); if (p < 0 && i.num !== f) continue;
const sc = i.num === f ? 9 : p === 0 ? 3 : i.k[p - 1] === ' ' ? 2 : 1; (by[i.g] || (by[i.g] = [])).push([sc, i]); if (i.id) seen.add(i.id); }
const body = BODY[S.lang];
if (body && f.length >= 3) for (const i of IX) { if (!i.id || seen.has(i.id)) continue; const b = body[i.id]; if (!b) continue;
const p = b.f.indexOf(f); if (p < 0) continue;
const at = Math.max(0, Math.min(b.t.length - 90, Math.round(p * b.t.length / b.f.length) - 30));
(by.Constitution || (by.Constitution = [])).push([0, { ...i, s: i.s + ' · …' + b.t.slice(at, at + 90).trim() + '…' }]); }
for (const g of ['States', 'Constitution', 'Law', 'Choose a case', 'Municipalities', 'Pages']) {
if (by[g]) out.push(...by[g].sort((a, b) => b[0] - a[0] || a[1].t.length - b[1].t.length).slice(0, CAP[g]).map(x => x[1])); }
return out;
}
function draw() {
items = search(input.value); cur = Math.min(cur, Math.max(0, items.length - 1));
let g = null, h = '';
items.forEach((i, n) => {
if (i.g !== g) { g = i.g; h += `<li class="pg" role="presentation">${H(g)}</li>`; }
h += `<li role="option" id="po-${n}" data-n="${n}" aria-selected="${n === cur}">${i.code ? `<code translate="no">${i.code}</code>` : ''}<span class="pt">${esc(i.t)}</span><span class="ps">${esc(i.s)}</span></li>`;
});
list.innerHTML = h || `<li class="pe" role="presentation">${H('No result.')}</li>`;
input.setAttribute('aria-activedescendant', items.length ? 'po-' + cur : '');
const on = list.querySelector('[aria-selected=true]'); if (on) on.scrollIntoView({ block: 'nearest' });
}
function go(i) { if (!i) return; close(); location.hash = '#' + i.h; }
export function close() { if (!el) return; el.hidden = true; document.body.classList.remove('pal-on'); if (last && last.focus) last.focus(); }
async function loadBody() {
const l = S.lang; if (BODY[l] || bodyFor === l) return; bodyFor = l;
const raw = await (await fetch(`data/body.${l}.json`)).json(), b = {};
for (const k in raw) b[k] = { t: raw[k], f: fold(raw[k]) };
BODY[l] = b; if (el && !el.hidden) draw();
}
export async function open() {
const key = S.lang + '|' + (S.scripts[S.lang] || '');
if (!el || builtFor !== key) {
builtFor = key;
const host = document.getElementById('pal');
host.innerHTML = `<div class="pal-bg" id="palBg"><div class="pal" role="dialog" aria-modal="true" aria-label="${esc(T('Search the portal'))}">
<div class="pal-i"><input id="palIn" type="text" role="combobox" aria-expanded="true" aria-controls="palList" aria-autocomplete="list" autocomplete="off" spellcheck="false"
placeholder="${esc(T('Search a state, a code, a seat…'))}" aria-label="${esc(T('Search query'))}"><button type="button" id="palX" aria-label="${esc(T('Close search'))}"><kbd>esc</kbd></button></div>
<ul id="palList" role="listbox" aria-label="${esc(T('Search the portal'))}"></ul>
<div class="pal-f" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> ${H('navigate')}</span><span><kbd>↵</kbd> ${H('open')}</span><span><kbd>esc</kbd> ${H('close')}</span></div></div></div>`;
el = host.firstElementChild; input = el.querySelector('#palIn'); list = el.querySelector('#palList');
input.addEventListener('input', () => { cur = 0; draw(); if (input.value.length >= 3) loadBody(); });
el.addEventListener('keydown', e => {
if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { cur = (cur + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length; draw(); } }
else if (e.key === 'Enter') { e.preventDefault(); go(items[cur]); }
else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
else if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
});
el.addEventListener('click', e => { const li = e.target.closest('li[data-n]');
if (li) go(items[+li.dataset.n]); else if (e.target === el || e.target.closest('#palX')) close(); });
cyrApply(el);
}
last = document.activeElement;
el.hidden = false; document.body.classList.add('pal-on');
IX = index(); input.value = ''; cur = 0; draw(); input.focus();
if (!arts || !ops) {
[arts, ops] = await Promise.all([fetch('data/articles.json').then(r => r.json()), fetch('data/opstine.json').then(r => r.json())]);
IX = index(); draw();
}
}
