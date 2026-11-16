import { S, loadCore, loadLang, T, H, esc, cyrOn, cyrApply, cyrText, scriptOf } from './core.js';

const app = document.getElementById('app'), hd = document.getElementById('hd');
const VIEWS = {
instrument: () => import('./instrument.js'),
state: () => import('./state.js'),
constitution: () => import('./constitution.js'),
equal: () => import('./equal.js'),
};
const VOTE = /^vote-(law|consent|urgent|revision|entrenched|initiative|stinit|stref|council)(-|$)/;
function route(h) {
if (h === '' || h === 'home' || VOTE.test(h) || /^select-[A-Za-z]{2}-\d{2}$/.test(h)) return 'instrument';
if (h === 'states' || h.startsWith('state-')) return 'state';
if (h === 'constitution' || h === 'preamble' || h.startsWith('title-') || h.startsWith('art-')) return 'constitution';
if (/^equalisation(-\d{1,3}-\d{1,3})?$/.test(h)) return 'equal';
return 'missing';
}
VIEWS.missing = async () => ({ render(app, h) {
app.innerHTML = `<div class="boot"><div class="cap"><code translate="no">#${esc(h)}</code></div><h1 class="h1">${H('Not found')}</h1><p><a class="btn" href="#home">${H('Back to the portal')}</a></p></div>`;
return T('Not found'); } });
const N = s => s;
const NAV = [['home', N('Home'), 'instrument'], ['states', N('States'), 'state'], ['equalisation', N('Finance'), 'equal'], ['constitution', N('Constitution'), 'constitution']];

function header() {
const L = S.C.langs, two = S.lang === 'sre' || S.lang === 'ist';
hd.innerHTML = `
<a class="skip" href="#app">${H('Skip to content')}</a><a class="skip" href="#units" id="skip2">${H('States')}</a>
<a class="brand" href="#home"><img src="emblem.png" alt="" width="34" height="30"><span>Balkanska Konfederacija</span></a>
<nav class="nav" id="nav" aria-label="${esc(T('Pages'))}">${NAV.map(n => `<a href="#${n[0]}" data-v="${n[2]}">${H(n[1])}</a>`).join('')}</nav>
<div class="tools" id="tools">
<button class="kbtn" id="palBtn" type="button" aria-haspopup="dialog"><span>${H('Search the portal')}</span>${matchMedia('(hover: none)').matches ? '' : `<kbd translate="no">${/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'}</kbd>`}</button>
<div class="seg langs" role="group" aria-label="${esc(T('Language'))}" translate="no">${Object.entries(L).map(([k, v]) =>
`<button type="button" data-l="${k}" aria-pressed="${k === S.lang}" title="${esc(v.name)}">${v.lab}</button>`).join('')}</div>
<div class="seg scripts" role="group" aria-label="${esc(T('Writing'))}" translate="no"${two ? '' : ' hidden'}>
<button type="button" data-s="lat" aria-pressed="${scriptOf() === 'lat'}" title="${esc(T('Latin'))}">Lat</button>
<button type="button" data-s="cyr" aria-pressed="${scriptOf() === 'cyr'}" title="${esc(T('Cyrillic'))}">${S.lang === 'ist' ? 'Кир' : 'Ћир'}</button></div>
<button class="ibtn" id="themeBtn" type="button" aria-label="${esc(T('Toggle light / dark theme'))}"><i class="half" aria-hidden="true"></i></button>
</div>
<button class="ibtn menu" id="menuBtn" type="button" aria-expanded="false" aria-controls="tools" aria-label="${esc(T('Open menu'))}"><i aria-hidden="true"></i></button>`;
document.documentElement.lang = cyrOn() ? (S.lang === 'ist' ? 'bg' : 'sh-Cyrl') : (L[S.lang].html || 'en');
cyrApply(hd);
markNav();
}
function markNav() {
const v = route(location.hash.slice(1));
hd.querySelectorAll('.nav a').forEach(a => a.dataset.v === v ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
}
hd.addEventListener('click', e => {
const b = e.target.closest('button'), menu = hd.classList.contains('open');
if (e.target.closest('a') && menu) setMenu(false);
if (!b) return;
if (b.dataset.l && b.dataset.l !== S.lang) { S.lang = b.dataset.l; try { localStorage.setItem('bk-lang', S.lang); } catch (x) { } loadLang().then(() => { header(); render(true); }); }
else if (b.dataset.s && b.dataset.s !== scriptOf()) { S.scripts[S.lang] = b.dataset.s; try { localStorage.setItem('bk-script-' + S.lang, b.dataset.s); } catch (x) { } header(); render(true, true); }
else if (b.id === 'themeBtn') {
const dark = (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
document.documentElement.dataset.theme = dark ? 'light' : 'dark';
try { localStorage.setItem('bk-theme', document.documentElement.dataset.theme); } catch (x) { }
} else if (b.id === 'menuBtn') setMenu(!menu);
else if (b.id === 'palBtn') { setMenu(false); openPalette(); }
});
function setMenu(on) {
hd.classList.toggle('open', on);
const b = document.getElementById('menuBtn');
if (b) { b.setAttribute('aria-expanded', on); b.setAttribute('aria-label', T(on ? 'Close menu' : 'Open menu')); cyrApply(b); }
}
async function openPalette() { (await import('./palette.js')).open(); }
addEventListener('keydown', e => {
if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
if (e.key === 'Escape' && hd.classList.contains('open')) setMenu(false);
});

let current = null, mod = null, seq = 0, lastState = null;
async function draw(m, name, h, keep) {
if (mod && mod.leave) mod.leave();
current = name; mod = m;
app.dataset.view = name;
const y = keep ? scrollY : 0;
const title = await m.render(app, h);
document.title = (title ? (cyrOn() ? cyrText(title, S.lang) : title) + ' · ' : '') + 'Balkanska Konfederacija';
cyrApply(app);
markNav();
if (keep) scrollTo({ top: y, behavior: 'instant' });
else if (!m.scrolls) scrollTo({ top: 0, behavior: 'instant' });
}
async function render(keep, glyphs) {
const h = decodeURIComponent(location.hash.slice(1)), name = route(h), my = ++seq;
const m = await VIEWS[name]();
if (my !== seq) return;
if (!keep && current === name && m.update && m.update(h) !== false) { markNav(); return; }
const toState = current === 'instrument' && name === 'state', toInst = current === 'state' && name === 'instrument';
if (document.startViewTransition && !S.reduced && !keep && (toState || toInst)) {
const c = toState ? h.slice(6, 11).toUpperCase() : (mod && mod.code) || lastState;
if (toState && mod.hero) mod.hero(c, true);
const vt = document.startViewTransition(async () => { await draw(m, name, h, false); if (toInst && m.hero && c) m.hero(c, true); });
vt.finished.finally(() => { if (toInst && mod && mod.hero && c) mod.hero(c, false); });
await vt.updateCallbackDone.catch(() => {});
} else {
const old = glyphs ? [...app.querySelectorAll('h1,h2,.g-org')].map(e => e.textContent) : null;
await draw(m, name, h, keep);
if (old && !S.reduced) [...app.querySelectorAll('h1,h2,.g-org')].forEach((e, i) => glyphSwap(e, old[i]));
}
if (name === 'state') lastState = mod.code;
const s2 = document.getElementById('skip2'); if (s2) s2.hidden = name !== 'instrument';
}
function glyphSwap(el, from) {
const to = el.textContent; if (from == null || from === to || el.children.length) return;
const A = [...from], B = [...to], n = Math.max(A.length, B.length);
el.setAttribute('translate', 'no'); el.setAttribute('aria-label', to); el.textContent = '';
const spans = []; for (let i = 0; i < n; i++) { const sp = document.createElement('span'); sp.className = 'gly'; sp.textContent = A[i] || ''; el.appendChild(sp); spans.push(sp); }
const dt = Math.min(34, 620 / n);
spans.forEach((sp, i) => setTimeout(() => { sp.textContent = B[i] || '';
sp.animate([{ opacity: 0, transform: 'translateY(.22em) scaleY(.6)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' }); }, i * dt));
setTimeout(() => { if (!el.isConnected) return; el.textContent = to; el.removeAttribute('translate'); el.removeAttribute('aria-label'); }, n * dt + 300);
}
addEventListener('hashchange', () => render(false));

new MutationObserver(ms => { if (!cyrOn()) return;
for (const m of ms) for (const n of m.addedNodes) cyrApply(n);
}).observe(document.body, { childList: true, subtree: true });

loadCore().then(() => { header(); render(false); }).catch(err => {
app.innerHTML = `<div class="boot"><p>${esc('Could not load the portal data: ' + err.message)}</p></div>`;
});
