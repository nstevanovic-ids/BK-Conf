/* Sabor : socle commun (données, langues, écritures, outils). */
export const S = {            // état de session
  lang: 'en', scripts: { sre: 'lat', ist: 'cyr' }, C: null,
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
};
try { const l = localStorage.getItem('bk-lang'); if (l) S.lang = l;
  for (const s of ['sre', 'ist']) { const v = localStorage.getItem('bk-script-' + s); if (v === 'lat' || v === 'cyr') S.scripts[s] = v; }
} catch (e) { /* stockage indisponible */ }
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { S.reduced = e.matches; dispatchEvent(new Event('hashchange')); });

export async function loadCore() {
  const C = await (await fetch('data/core.json')).json();
  C.by = {}; C.states.forEach((s, i) => { s.i = i; C.by[s.c] = s; });
  /* Registres nationaux : la population d'un peuple est celle des États territoriaux qui lui sont
     rattachés (docs/canon/equilibre.md, section 2). Hypothèse affichée dans l'instrument. */
  C.reg = {}; C.order.forEach(p => C.reg[p] = 0);
  C.states.forEach(s => { if (s.p) C.reg[s.p] += s.pop; });
  C.regTotal = C.order.reduce((a, p) => a + C.reg[p], 0);
  C.popTotal = C.states.reduce((a, s) => a + s.pop, 0);
  C.newSet = new Set(C.new);
  if (!C.langs[S.lang]) S.lang = 'en';
  C.tx = {}; C.qx = { en: C.q }; S.C = C;
  await loadLang();
  return C;
}
/** Traductions du portail pour la langue courante (rien à charger en anglais). */
export async function loadLang() {
  const l = S.lang;
  if (l !== 'en' && !S.C.tx[l]) { const t = await (await fetch(`data/tx.${l}.json`)).json(); S.C.qx[l] = t.__q; delete t.__q; S.C.tx[l] = t; }
}
const NOTES = {};
/** Notes des drapeaux dans la langue courante. */
export const loadNotes = () => NOTES[S.lang] || (NOTES[S.lang] = fetch(`data/notes.${S.lang}.json`).then(r => r.json()));

/* ---------- écriture cyrillique : fonctions du portail, portées telles quelles ---------- */
export const scriptOf = () => S.scripts[S.lang] || 'lat';
export const cyrOn = () => (S.lang === 'sre' || S.lang === 'ist') && S.scripts[S.lang] === 'cyr';
const CYR_SRE={a:'а',b:'б',c:'ц',č:'ч',ć:'ћ',d:'д',đ:'ђ',e:'е',ě:'е',f:'ф',g:'г',h:'х',i:'и',j:'ј',k:'к',l:'л',
  ļ:'љ',m:'м',n:'н',ñ:'њ',o:'о',p:'п',r:'р',s:'с',š:'ш',t:'т',u:'у',v:'в',x:'џ',z:'з',ž:'ж',ã:'ъ'};
const CYR_IST={...CYR_SRE,ć:'ћ',đ:'ђ',x:'дж',j:'й',ļ:'ль',ñ:'нь'};
const CYR_V='aeiouãě';
export function cyrWord(w,std){
  if(/\d/.test(w))return w;
  const lo=w.toLowerCase().replace(/lj/g,'ļ').replace(/nj/g,'ñ').replace(/dž/g,'x');
  let out='';
  if(std==='ist'){
    for(let i=0;i<lo.length;i++){
      const c=lo[i],n=lo[i+1]||'',p=lo[i-1]||'';
      if(c==='š'&&n==='t'){out+='щ';i++;continue;}
      if(c==='j'||c==='ļ'||c==='ñ'){
        const base=c==='ļ'?'л':c==='ñ'?'н':'';
        if(n==='a'){out+=base+'я';i++;continue;}
        if(n==='u'){out+=base+'ю';i++;continue;}
        if(n==='o'){out+=base?base+'ьо':(p&&!CYR_V.includes(p)?'ьо':'йо');i++;continue;}
        out+=base?base+'ь':'й';continue;
      }
      out+=CYR_IST[c]!==undefined?CYR_IST[c]:c;
    }
  }else for(const c of lo)out+=CYR_SRE[c]!==undefined?CYR_SRE[c]:c;
  if(w.length>1&&w===w.toUpperCase()&&w!==w.toLowerCase())return out.toUpperCase();
  return w[0]!==w[0].toLowerCase()?out[0].toUpperCase()+out.slice(1):out;
}
const LAT_FOREIGN=/[qwyäëöüéèêàâçşğıőűôõåøæßáíóúý]/i;
const LAT_KEEP=['Eurostat','Google Wallet','Google','Brevo','Cloudflare','Turnstile','GitHub','Decidim',
  'GADM','geoBoundaries','Natural Earth','ICAO','MRZ','PPS','EU-27','PDF','QR','HTML','CSS',
  'NUTS','FZS','BHAS','NSI'];   // ajout du prototype : sigles de sources statistiques (critique F9)
let _latRe=null;
function latRe(){
  if(_latRe)return _latRe;
  const AUT=(S.C&&S.C.aut)||[];
  const names=AUT.map(a=>a.n).filter(n=>LAT_FOREIGN.test(n)).concat(LAT_KEEP)
    .sort((a,b)=>b.length-a.length).map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const re=new RegExp('[^\\s@<>()]+@[^\\s@<>()]+|\\b(?:https?:\\/\\/|www\\.)\\S+|[\\w.-]+\\.(?:io|com|org|net|eu|app|dev)\\b'
    +(names.length?'|(?<![\\p{L}\\p{M}])(?:'+names.join('|')+')(?![\\p{L}\\p{M}])':''),'gu');
  if(S.C)_latRe=re;
  return re;
}
const ROMAN=/^(?:XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/;
function cyrPlain(t,std){
  return t.replace(/[\p{L}\p{M}\d]+(?:['’-][\p{L}\p{M}\d]+)*/gu,(tok,at,all)=>{
    if(LAT_FOREIGN.test(tok)||(ROMAN.test(tok)&&(tok.length>1||/(?:[\p{L}\d]|\b[IVXL]+,)\s+$/u.test(all.slice(0,at))))
      ||(/^[a-h]$/.test(tok)&&/\d\s+$/.test(all.slice(0,at))))return tok;
    if(/\d/.test(tok))return tok.replace(/[\p{L}\p{M}\d]+/gu,w=>/^[\p{Ll}\p{M}]+$/u.test(w)?cyrWord(w,std):w);
    return tok.replace(/[\p{L}\p{M}\d]+/gu,w=>cyrWord(w,std));
  });
}
export function cyrText(t,std){
  let out='',i=0;
  for(const m of String(t).matchAll(latRe())){out+=cyrPlain(t.slice(i,m.index),std)+m[0];i=m.index+m[0].length;}
  return out+cyrPlain(String(t).slice(i),std);
}
export function toCyr(s,std){
  return String(s).split(/(<[^>]*>|&[a-z#0-9]+;)/i).map(part=>part[0]==='<'||part[0]==='&'?part
    :cyrText(part,std)).join('');
}
/* Tout ce qui s'affiche : nœuds de texte et attributs title, aria-label, placeholder, alt.
   Restent en latin : translate="no", code, .mono, et les chaînes nouvelles (data-untranslated),
   qui sont de l'anglais. */
const CYR_ATTRS=['title','aria-label','placeholder','alt'];
const cyrSkip=el=>!!el.closest('[translate="no"],[data-untranslated],script,style,textarea,code,.mono');
export function cyrApply(n){
  if(!cyrOn()||!n)return;
  if(n.nodeType===3){if(n.parentElement&&!cyrSkip(n.parentElement))n.data=cyrText(n.data,S.lang);return;}
  if(n.nodeType!==1||cyrSkip(n))return;
  const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);
  for(let t=w.nextNode();t;t=w.nextNode())
    if(/\p{L}/u.test(t.data)&&!cyrSkip(t.parentElement))t.data=cyrText(t.data,S.lang);
  [n,...n.querySelectorAll('[title],[aria-label],[placeholder],[alt]')].forEach(el=>{
    if(cyrSkip(el))return;
    CYR_ATTRS.forEach(a=>{const v=el.getAttribute(a);if(v)el.setAttribute(a,cyrText(v,S.lang));});
  });
}
/* Cyrillique → latin v3 (portail : cyr2lat), pour la recherche. */
const CYR={'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'đ','ѓ':'đ','е':'e','ж':'ž','з':'z',
 'ѕ':'dz','и':'i','ѝ':'i','й':'j','ј':'j','к':'k','л':'l','љ':'ļ','м':'m','н':'n','њ':'ñ',
 'о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'ć','ќ':'ć','у':'u','ф':'f','х':'h','ц':'c',
 'ч':'č','џ':'x','ш':'š','щ':'št','ъ':'ã','ь':'j','ю':'ju','я':'ja','ѣ':'ě'};
export function cyr2lat(s){
  return String(s).replace(/дж/g,'x').replace(/Дж|ДЖ/g,'X')
   .replace(/([ЛлНн])([ьЬюЮяЯ])/g,(m,c,v)=>{const p={'л':'ļ','н':'ñ'}[c.toLowerCase()];
     return (c===c.toLowerCase()?p:p.toUpperCase())+({'ь':'','ю':'u','я':'a'}[v.toLowerCase()]);})
   .replace(/[Ѐ-ӿ]/g,ch=>{const lo=ch.toLowerCase(),t=CYR[lo];
     if(t===undefined)return ch;return ch===lo?t:t.charAt(0).toUpperCase()+t.slice(1);});
}
/* Recherche sans diacritiques ni écriture : ļ = lj = l, ñ = nj = n, x = dž = dz, đ = dj = d. */
export function fold(s){
  return cyr2lat(s).toLowerCase().replace(/ļ/g,'l').replace(/ñ/g,'n').replace(/x/g,'dz').replace(/đ/g,'d')
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/lj/g,'l').replace(/nj/g,'n').replace(/dj/g,'d')
    .replace(/[-–/().,'’]/g,' ').replace(/\s+/g,' ').trim();
}

/* ---------- textes : l'anglais sert de clé (i18n.json et textes.json du portail) ---------- */
const L_LOC = { en: 'en-GB', zap: 'sl-SI', sre: 'hr-HR', ist: 'bg-BG' };
const LKEY = s => String(s).replace(/\s+/g, ' ').trim();
const _pr = {};
function plural(n, spec) {
  const loc = L_LOC[S.lang] || 'en-GB', pr = _pr[loc] || (_pr[loc] = new Intl.PluralRules(loc)), f = {};
  spec.split(';').forEach(x => { const i = x.indexOf(':'); if (i > 0) f[x.slice(0, i).trim()] = x.slice(i + 1); });
  return f[pr.select(Number(String(n).replace(/\D/g, '')))] ?? f.other ?? '';
}
const fill = (s, a) => s.replace(/\{(\d+)#([^}]*)\}/g, (m, i, spec) => plural(a[i], spec)).replace(/\{(\d+)\}/g, (m, i) => a[i] ?? '');
/** Texte : traduction du portail si elle existe, sinon l'anglais. */
export function T(en, ...a) {
  const key = LKEY(en), e = S.lang !== 'en' && S.C.tx[S.lang];
  return fill(e && e[key] != null ? e[key] : key, a);
}
export const isNew = en => S.C.newSet.has(LKEY(en));
/** HTML : comme T, échappé ; une chaîne nouvelle reste en anglais et porte data-untranslated. */
export function H(en, ...a) {
  const s = esc(T(en, ...a)), e = S.C.tx[S.lang];
  return isNew(en) || (S.lang !== 'en' && !(e && e[LKEY(en)] != null)) ? `<span data-untranslated lang="en">${s}</span>` : s;
}
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const fmtN = (n, o) => Number(n).toLocaleString(L_LOC[S.lang] || 'en-GB', o);
export const pct = (x, d = 1) => fmtN(x * 100, { minimumFractionDigits: d, maximumFractionDigits: d }) + (S.lang === 'en' ? '%' : ' %');
/** Terme ou alinéa repris du texte constitutionnel, dans la langue courante (build.py, quotes). */
export const Q = k => (S.C.qx[S.lang] || S.C.q)[k] || S.C.q[k] || '';
/** Libellé décrit par rules.js : {t} chaîne du portail, {q} texte constitutionnel, {n} nombre d'États. */
export const label = sp => !sp ? '' : (sp.q ? Q(sp.q) : T(sp.t)) + (sp.n ? ` · ${sp.n} ${T('States')}` : '');
export const labelH = sp => !sp ? '' : sp.q ? esc(Q(sp.q)) : H(sp.t) + (sp.n ? ` · ${sp.n} ${H('States')}` : '');
export const nolat = s => `<span translate="no">${esc(s)}</span>`;
export const peopleName = p => T(S.C.peoples[p].en);
export const artId = n => 'art-' + String(n).replace(/\s+/g, '');
export const artLink = n => `<a class="art" href="#${artId(n)}">${esc(T('Art. {0}', n))}</a>`;
const SOT = 'State of the ';
export const typeLine = s => s.t === 'T' ? T(SOT + S.C.peoples[s.p].en)
  : s.t === 'F' ? T('Confederal territory, counts as a state') : T('Confederal autonomous municipality');

export function toast(html) {
  let t = document.getElementById('toast');
  t.innerHTML = html; cyrApply(t); t.classList.add('on');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600);
}
