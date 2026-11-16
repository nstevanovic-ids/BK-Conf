/* Langues et écritures — fonctions portées telles quelles de portail/index.html
   (cyrWord, cyrPlain, cyrText, toCyr, T, L, lPlural, fmtD, fmtN, cyr2lat, fold). */
let UI = { langs: {}, t: {}, tx: {}, new: [] }, AUT = [];
export function setUI(ui, aut) { UI = ui; AUT = aut; _latRe = null; }
export const getUI = () => UI;
export const getLang = () => LANG;
export function setLangVar(l) { LANG = l; }
let LANG = 'en';
const SCRIPTS = { sre: 'lat', ist: 'cyr' };
try { const l = localStorage.getItem('bk-lang'); if (l) LANG = l; } catch (e) {}
try { for (const s of ['sre', 'ist']) { const v = localStorage.getItem('bk-script-' + s); if (v === 'lat' || v === 'cyr') SCRIPTS[s] = v; } } catch (e) {}
const scriptOf = () => SCRIPTS[LANG] || 'lat';
const cyrOn = () => (LANG === 'sre' || LANG === 'ist') && SCRIPTS[LANG] === 'cyr';
const CYR_SRE = { a: 'а', b: 'б', c: 'ц', č: 'ч', ć: 'ћ', d: 'д', đ: 'ђ', e: 'е', ě: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'ј', k: 'к', l: 'л',
  ļ: 'љ', m: 'м', n: 'н', ñ: 'њ', o: 'о', p: 'п', r: 'р', s: 'с', š: 'ш', t: 'т', u: 'у', v: 'в', x: 'џ', z: 'з', ž: 'ж', ã: 'ъ' };
const CYR_IST = { ...CYR_SRE, ć: 'ћ', đ: 'ђ', x: 'дж', j: 'й', ļ: 'ль', ñ: 'нь' };
const CYR_V = 'aeiouãě';
function cyrWord(w, std) {
  if (/\d/.test(w)) return w;
  const lo = w.toLowerCase().replace(/lj/g, 'ļ').replace(/nj/g, 'ñ').replace(/dž/g, 'x');
  let out = '';
  if (std === 'ist') {
    for (let i = 0; i < lo.length; i++) {
      const c = lo[i], n = lo[i + 1] || '', p = lo[i - 1] || '';
      if (c === 'š' && n === 't') { out += 'щ'; i++; continue; }
      if (c === 'j' || c === 'ļ' || c === 'ñ') {
        const base = c === 'ļ' ? 'л' : c === 'ñ' ? 'н' : '';
        if (n === 'a') { out += base + 'я'; i++; continue; }
        if (n === 'u') { out += base + 'ю'; i++; continue; }
        if (n === 'o') { out += base ? base + 'ьо' : (p && !CYR_V.includes(p) ? 'ьо' : 'йо'); i++; continue; }
        out += base ? base + 'ь' : 'й'; continue;
      }
      out += CYR_IST[c] !== undefined ? CYR_IST[c] : c;
    }
  } else for (const c of lo) out += CYR_SRE[c] !== undefined ? CYR_SRE[c] : c;
  if (w.length > 1 && w === w.toUpperCase() && w !== w.toLowerCase()) return out.toUpperCase();
  return w[0] !== w[0].toLowerCase() ? out[0].toUpperCase() + out.slice(1) : out;
}
const LAT_FOREIGN = /[qwyäëöüéèêàâçşğıőűôõåøæßáíóúý]/i;
const LAT_KEEP = ['Eurostat', 'Google Wallet', 'Google', 'Brevo', 'Cloudflare', 'Turnstile', 'GitHub', 'Decidim',
  'GADM', 'geoBoundaries', 'Natural Earth', 'ICAO', 'MRZ', 'PPS', 'EU-27', 'PDF', 'QR', 'HTML', 'CSS'];
let _latRe = null;
function latRe() {
  if (_latRe) return _latRe;
  const names = AUT.map(a => a.n).filter(n => LAT_FOREIGN.test(n)).concat(LAT_KEEP)
    .sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return _latRe = new RegExp('[^\\s@<>()]+@[^\\s@<>()]+|\\b(?:https?:\\/\\/|www\\.)\\S+|[\\w.-]+\\.(?:io|com|org|net|eu|app|dev)\\b'
    + (names.length ? '|(?<![\\p{L}\\p{M}])(?:' + names.join('|') + ')(?![\\p{L}\\p{M}])' : ''), 'gu');
}
const ROMAN = /^(?:XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/;
function cyrPlain(t, std) {
  return t.replace(/[\p{L}\p{M}\d]+(?:['’-][\p{L}\p{M}\d]+)*/gu, (tok, at, all) => {
    if (LAT_FOREIGN.test(tok) || (ROMAN.test(tok) && (tok.length > 1 || /(?:[\p{L}\d]|\b[IVXL]+,)\s+$/u.test(all.slice(0, at))))
      || (/^[a-h]$/.test(tok) && /\d\s+$/.test(all.slice(0, at)))) return tok;
    if (/\d/.test(tok)) return tok.replace(/[\p{L}\p{M}\d]+/gu, w => /^[\p{Ll}\p{M}]+$/u.test(w) ? cyrWord(w, std) : w);
    return tok.replace(/[\p{L}\p{M}\d]+/gu, w => cyrWord(w, std));
  });
}
function cyrText(t, std) {
  let out = '', i = 0;
  for (const m of String(t).matchAll(latRe())) { out += cyrPlain(t.slice(i, m.index), std) + m[0]; i = m.index + m[0].length; }
  return out + cyrPlain(String(t).slice(i), std);
}
function toCyr(s, std) {
  return String(s).split(/(<[^>]*>|&[a-z#0-9]+;)/i).map(part => part[0] === '<' || part[0] === '&' ? part
    : cyrText(part, std)).join('');
}
function T(k) { const e = (UI.t || {})[k]; const s = e ? (e[LANG] || e.en) : k; return s; }
const L_LOC = { en: 'en-GB', zap: 'sl-SI', sre: 'hr-HR', ist: 'bg-BG' };
const LKEY = s => String(s).replace(/\s+/g, ' ').trim();
const _lpr = {};
function lPlural(n, spec) {
  const loc = L_LOC[LANG] || 'en-GB', pr = _lpr[loc] || (_lpr[loc] = new Intl.PluralRules(loc)), f = {};
  spec.split(';').forEach(x => { const i = x.indexOf(':'); if (i > 0) f[x.slice(0, i).trim()] = x.slice(i + 1); });
  const v = Number(String(n).replace(/\D/g, ''));
  return f[pr.select(v)] ?? f.other ?? '';
}
function L(s, ...a) {
  if (LANG !== 'en') {
    const e = (UI.tx || {})[LKEY(s)], tr = e && e[LANG];
    if (tr != null) return tr.replace(/\{(\d+)#([^}]*)\}/g, (m, i, spec) => lPlural(a[i], spec))
      .replace(/\{(\d+)\}/g, (m, i) => a[i] ?? '');
  }
  return a.length ? String(s).replace(/\{(\d+)\}/g, (m, i) => a[i] ?? '') : s;
}
/* Chaîne nouvelle : reste en anglais dans toutes les langues, marquée data-untranslated. */
const U = s => `<span data-untranslated translate="no">${esc(s)}</span>`;
const UT = s => s;   // chaîne nouvelle en attribut : l'élément porte data-untranslated
const gloss = (en, name) => LANG === 'en' ? en + ' · ' + name : L(en);
const MONTHS = { zap: ['januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij', 'avgust', 'september', 'oktober', 'november', 'december'],
  ist: ['januari', 'fevruari', 'mart', 'april', 'maj', 'juni', 'juli', 'avgust', 'septemvri', 'oktomvri', 'noemvri', 'dekemvri'] };
function fmtD(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); if (!m) return iso || '';
  const y = m[1], mo = +m[2], d = +m[3];
  if (LANG === 'zap') return `${d}. ${MONTHS.zap[mo - 1]} ${y}`;
  if (LANG === 'sre') return `${d}. ${mo}. ${y}.`;
  if (LANG === 'ist') return `${d} ${MONTHS.ist[mo - 1]} ${y} g.`;
  return new Date(Date.UTC(+y, mo - 1, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
function fmtN(n) { return Number(n).toLocaleString(L_LOC[LANG] || 'en-GB'); }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
const CYR_ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
const cyrSkip = el => !!el.closest('[translate="no"],[data-untranslated],script,style,textarea,code,kbd');
function cyrApply(n) {
  if (!cyrOn() || !n) return;
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
  for (let t = w.nextNode(); t; t = w.nextNode())
    if (/\p{L}/u.test(t.data) && !cyrSkip(t.parentElement)) t.data = cyrText(t.data, LANG);
  [n, ...n.querySelectorAll('[title],[aria-label],[placeholder],[alt]')].forEach(el => {
    if (cyrSkip(el)) return;
    CYR_ATTRS.forEach(a => { const v = el.getAttribute(a); if (v) el.setAttribute(a, cyrText(v, LANG)); });
  });
}
/* texte seul (titres d'onglet, étiquettes de carte, annonces) */
const disp = s => cyrOn() ? cyrText(String(s), LANG) : String(s);
const CYR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ђ': 'đ', 'ѓ': 'đ', 'е': 'e', 'ж': 'ž', 'з': 'z',
  'ѕ': 'dz', 'и': 'i', 'ѝ': 'i', 'й': 'j', 'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'ļ', 'м': 'm', 'н': 'n', 'њ': 'ñ',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'ћ': 'ć', 'ќ': 'ć', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
  'ч': 'č', 'џ': 'x', 'ш': 'š', 'щ': 'št', 'ъ': 'ã', 'ь': 'j', 'ю': 'ju', 'я': 'ja', 'ѣ': 'ě' };
function cyr2lat(s) {
  return String(s).replace(/дж/g, 'x').replace(/Дж|ДЖ/g, 'X')
    .replace(/([ЛлНн])([ьЬюЮяЯ])/g, (m, c, v) => { const p = { 'л': 'ļ', 'н': 'ñ' }[c.toLowerCase()];
      return (c === c.toLowerCase() ? p : p.toUpperCase()) + ({ 'ь': '', 'ю': 'u', 'я': 'a' }[v.toLowerCase()]); })
    .replace(/[Ѐ-ӿ]/g, ch => {
      const lo = ch.toLowerCase(), t = CYR[lo];
      if (t === undefined) return ch;
      return ch === lo ? t : t.charAt(0).toUpperCase() + t.slice(1);
    });
}
function fold(s) {
  return cyr2lat(s).replace(/[đĐ]/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[-–/().,']/g, ' ').replace(/\s+/g, ' ').trim();
}
/* seconde clé : digrammes de la gajica (ljubljana, podrinje, sandžak) pour ļ, ñ, x */
const fold2 = s => fold(cyr2lat(s).replace(/[ñÑ]/g, 'nj').replace(/[ļĻ]/g, 'lj').replace(/x/g, 'dž').replace(/X/g, 'Dž'));


export { SCRIPTS, scriptOf, cyrOn, cyrWord, cyrText, toCyr, T, L, L_LOC, U, UT, gloss, fmtD, fmtN, esc, cyrApply, disp, cyr2lat, fold, fold2 };
