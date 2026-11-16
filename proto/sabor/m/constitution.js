import { S, T, H, esc, labelH } from './core.js';
import { ART_RULE, typeById } from './rules.js';

const DOCS = {};
const get = f => DOCS[f] || (DOCS[f] = fetch(`data/const/${f}.json`).then(r => r.json()));
const doc = () => get(S.lang + '/index');
let shown = null;                       // 'lang|title' rendu
export const scrolls = true;

function cNum(num, abbr) {
const m = /^(Title|Chapter|Section|Article) (.+)$/.exec(String(num || ''));
if (!m) return num || '';
if (m[1] === 'Title') return T('Title {0}', m[2]);
if (m[1] === 'Chapter') return T('Chapter {0}', m[2]);
if (m[1] === 'Section') return T('Section {0}', m[2]);
return abbr ? T('Art. {0}', m[2]) : T('Article {0}', m[2]);
}
const SUF = '(?: (?:bis|ter|quater|quinquies|sexies|septies|octies)(?![\\p{L}]))?';
const NUM = '\\d+' + SUF;
const CREF = { en: new RegExp('\\b(Articles?) (' + NUM + '(?:(?:, | and | to )' + NUM + ')*)', 'gu'),
std: new RegExp('(?<![\\p{L}])([Čč]l(?:\\.|an|en)\\p{L}*) (' + NUM + '(?:(?:, | in | i | do | ter )' + NUM + ')*)', 'gu') };
const ONE = new RegExp(NUM, 'gu');
function inline(x, idx) {
let h = esc(x).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
if (!idx) return h;
h = h.replace(S.lang === 'en' ? CREF.en : CREF.std, (m, w, list) => { let first = true;
const out = list.replace(ONE, n => { const id = 'art-' + n.replace(' ', ''), lab = first ? w + ' ' + n : n; first = false;
return idx[id] ? `<a class="cref" href="#${id}">${lab}</a>` : lab; });
return out.startsWith('<a') || out.startsWith(w) ? out : w + ' ' + out; });
return h.replace(/\(([A-Z]{2}-\d{2})\)/g, (m, c) => S.C.by[c] ? `(<a class="cref" href="#state-${c}" translate="no">${c}</a>)` : m);
}
function block(b, idx) {
if (b.t === 'p') return `<p>${inline(b.x, idx)}</p>`;
if (b.t === 'h') return `<p class="csub">${inline(b.x)}</p>`;
if (b.t === 'ul') return `<ul>${b.items.map(i => `<li>${inline(i, idx)}</li>`).join('')}</ul>`;
if (b.t === 'll' || b.t === 'ol') return `<ol class="${b.t}${b.items.length > 12 ? ' cols' : ''}">${b.items.map(i =>
`<li><span class="mk" translate="no">${i[0]}.</span><span>${inline(i[1], idx)}</span></li>`).join('')}</ol>`;
return '';
}
const range = t => { const a = t.arts; return cNum(a[0][1], true) + (a.length > 1 ? ' – ' + a[a.length - 1][1].replace(/^Article /, '') : ''); };
function ruleLink(id) {
const r = ART_RULE[id]; if (!r) return '';
const eq = r === 'equalisation';
return `<a class="rule" href="#${eq ? 'equalisation' : 'vote-' + r}"><span class="rk">${H('Open in the instrument')}</span><span>${eq ? H('Confederal financial equalisation formula') : labelH(typeById(r).name)}</span><i aria-hidden="true">→</i></a>`;
}

export async function render(app, h) {
const d = await doc(), idx = {};
d.titles.forEach(t => t.arts.forEach(a => idx[a[0]] = t.id));
const tid = h.startsWith('title-') ? h : h.startsWith('art-') ? idx[h] : null;
const missing = (h.startsWith('art-') && !idx[h]) || (h.startsWith('title-') && !d.titles.some(t => t.id === h));
const title = d.titles.find(t => t.id === tid), full = title && await get(S.lang + '/' + title.id);
const toc = `<nav class="toc" aria-label="${esc(T('Titles'))}"><div class="cap">${H('Titles')}</div><ol>
<li><a href="#constitution"${!title ? ' aria-current="page"' : ''}><span class="tn"></span><span>${H('Preamble')}</span></a></li>
${d.titles.map(t => `<li><a href="#${t.id}"${t === title ? ' aria-current="page"' : ''}><span class="tn" translate="no">${esc(t.num.replace('Title ', ''))}</span><span>${esc(t.name)}<small>${esc(range(t))}</small></span></a></li>`).join('')}</ol></nav>`;
let main, name;
if (!title) {
name = T('Constitution');
main = `${missing ? `<p class="miss" role="status"><strong>${H('Not found')}</strong> <code translate="no">#${esc(h)}</code></p>` : ''}<header class="doc-h"><div class="cap">${H('Fundamental law')}</div><h1 class="h1">${H('Constitution of the Balkan Confederation')}</h1>
<p class="ver">${esc(T('Consolidated text, version {0} of {1}.', d.version, d.date))} ${esc(T('{0} articles', Object.keys(idx).length))}.</p></header>
<section class="pre"><h2>${H('Preamble')}</h2>${d.preamble.paras.map(p => `<p>${inline(p)}</p>`).join('')}${d.preamble.motto ? `<p class="motto">${inline(d.preamble.motto)}</p>` : ''}</section>
<ol class="tcards">${d.titles.map(t => `<li><a href="#${t.id}"><span class="cap">${esc(cNum(t.num))}</span><strong>${esc(t.name)}</strong><small>${esc(range(t))} · ${esc(T('{0} articles', t.arts.length))}</small></a></li>`).join('')}</ol>`;
} else {
name = cNum(title.num) + ' · ' + title.name;
const i = d.titles.indexOf(title), prev = d.titles[i - 1], next = d.titles[i + 1];
main = `<header class="doc-h"><div class="cap">${esc(cNum(title.num))} · ${esc(range(title))}</div><h1 class="h1">${esc(title.name)}</h1>
<nav class="anav" aria-label="${esc(T('Articles of {0}', cNum(title.num)))}"><details${title.arts.length <= 12 ? ' open' : ''}><summary>${esc(T('{0} articles', title.arts.length))}</summary><ol>${title.arts.map(a =>
`<li><a href="#${a[0]}"${ART_RULE[a[0]] ? ' data-rule="1"' : ''}><span translate="no">${esc(a[1].replace('Article ', ''))}</span>${esc(a[2])}</a></li>`).join('')}</ol></details></nav></header>
${full.chapters.map(c => `${c.num ? `<h2 class="chap"><span class="cap">${esc(cNum(c.num))}</span>${esc(c.name)}</h2>` : ''}
${c.articles.map(a => `${a.sec ? `<h3 class="sec"><span class="cap">${esc(cNum(a.sec.num))}</span>${esc(a.sec.name)}</h3>` : ''}
<section class="a" id="${a.id}" tabindex="-1"><header><a class="a-n" href="#${a.id}">${esc(cNum(a.num))}</a><h3>${esc(a.name)}</h3></header>
${a.body.map(b => block(b, idx)).join('')}${ruleLink(a.id)}</section>`).join('')}`).join('')}
<nav class="pn">${prev ? `<a href="#${prev.id}"><span class="cap">← ${H('Previous')}</span>${esc(prev.name)}</a>` : '<span></span>'}${next ? `<a href="#${next.id}"><span class="cap">${H('Next')} →</span>${esc(next.name)}</a>` : ''}</nav>`;
}
app.innerHTML = `<div class="co">${toc}<article class="doc">${main}</article></div>`;
shown = S.lang + '|' + (tid || '');
focusArt(h, true);
return name;
}
function focusArt(h, instant) {
const el = h.startsWith('art-') && document.getElementById(h);
if (!el) { scrollTo({ top: 0, behavior: 'instant' }); return; }
document.querySelectorAll('.a.on').forEach(x => x.classList.remove('on'));
el.classList.add('on');
requestAnimationFrame(() => { el.scrollIntoView({ block: 'start', behavior: instant || S.reduced ? 'instant' : 'smooth' }); el.focus({ preventScroll: true }); });
}
export function update(h) {
if (!h.startsWith('art-') || !shown || !document.getElementById(h) || !shown.startsWith(S.lang + '|')) return false;
focusArt(h, false);
return true;
}
export function leave() { shown = null; }
