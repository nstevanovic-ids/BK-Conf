/* Codex — command palette: articles (by number or by word), States, municipalities.
   Diacritics and script are ignored: the query and the data are folded to plain Latin. */
import {S,load,esc,t,tx,pn,lab,artNum,LANGS,slug} from './app.js';
import {cyr2lat} from './cyr.js';

const MAP={'đ':'d','ł':'l','ß':'ss','æ':'ae','œ':'oe','ø':'o','ı':'i','’':"'",'–':'-','—':'-'};
export const fold=s=>cyr2lat(String(s)).toLowerCase().replace(/[đłßæœøı’–—]/g,c=>MAP[c]).normalize('NFD').replace(/\p{M}/gu,'');
const SUF='bis|ter|quater|quinquies|sexies|septies|octies';
let el=null, last=null, sel=0, items=[], seq=0, D=null;

async function data(){
  if(D&&D.lang===S.lang)return D;
  let [idx,full,ops]=await Promise.all([load(`idx.${S.lang}.json`),load(`full.${S.lang}.json`),load('opstine.json')]);
  const orig=full, folded={};
  for(const k in orig)folded[k]=fold(orig[k]);          // searched folded, shown in the original spelling
  full=folded;
  return D={lang:S.lang,idx,full,orig,ops:ops.m.map(m=>[m[0],m[2],fold(m.filter((x,i)=>i!==1&&i!==2&&x).join(' '))]),
    st:S.core.st.map(s=>[s[0],s[1],fold(s[0]+' '+s[1]+' '+s[0].replace('-',''))]),
    names:Object.fromEntries(Object.entries(idx).map(([k,v])=>[k,fold(v[1])]))};
}
function search(d,q){
  const f=fold(q).trim(), out=[], li=LANGS.indexOf(S.lang);
  if(!f){
    out.push(['gh',t('titles')]);
    for(const tt of S.core.toc)out.push(['a','#'+tt.id,tt.num,pn(tt.name[li]),'']);
    out.push(['gh',t('states')]);out.push(['a','#states','54',t('all_states'),'']);
    return out;
  }
  const arts=[];
  const m=new RegExp(`^(?:art(?:icles?|\\.)?|cl(?:an|en)?\\w*\\.?|§)?\\s*(\\d{1,3})\\s*(${SUF})?\\s*$`).exec(f)||
          new RegExp(`^(?:art(?:icles?|\\.)?|cl(?:an|en)?\\w*\\.?|§)?\\s*(\\d{1,3})\\s*([a-z]*)$`).exec(f);
  if(m){
    const exact='art-'+m[1]+(m[2]||'');
    for(const id of Object.keys(d.idx)){const n=id.replace('art-','');
      if(id===exact)arts.unshift(id);
      else if(n.startsWith(m[1])&&(!m[2]||n.slice(String(parseInt(n)).length).startsWith(m[2]))&&String(parseInt(n))===m[1])arts.push(id);}
    if(!m[2])for(const id of Object.keys(d.idx)){const n=String(parseInt(id.replace('art-','')));
      if(n.startsWith(m[1])&&n!==m[1]&&arts.length<12)arts.push(id);}
  }else{
    const toks=f.split(/\s+/).filter(Boolean);
    const at=(hay,k)=>hay.startsWith(k)||hay.includes(' '+k)||hay.includes('\n'+k)||hay.includes('('+k);   // start of a word
    const inName=[],inText=[],inside=[];
    for(const id of Object.keys(d.idx)){
      if(toks.every(k=>at(d.names[id],k)))inName.push(id);
      else if(toks.every(k=>at(d.full[id],k)))inText.push(id);
      else if(f.length>3&&toks.every(k=>d.full[id].includes(k)))inside.push(id);
    }
    arts.push(...inName,...inText,...inside);
  }
  // a State or a municipality that begins with the query comes before the articles
  const head=[];
  if(!m){
    const sts=d.st.filter(s=>s[1]&&(fold(s[1]).startsWith(f)||s[2].startsWith(f)));
    if(sts.length){head.push(['gh',t('states')]);for(const s of sts.slice(0,6))head.push(['a','#state-'+s[0],s[0],pn(s[1]),'']);}
  }
  out.push(...head);
  if(arts.length){out.push(['gh',t('constitution')+(arts.length>8?` · ${arts.length}`:'')]);
    for(const id of arts.slice(0,8)){const e=d.idx[id]; let sub='';
      if(!m){const k=f.split(/\s+/)[0], F=d.full[id], O=d.orig[id];
        let i=F.search(new RegExp('(^|[\\s(«"„])'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
        if(i>=0&&/[\s(«"„]/.test(F[i]))i++;
        if(i<0)i=F.indexOf(k);
        if(i>=0&&F.length===O.length&&!d.names[id].includes(k)){        // same positions in both texts
          let a0=O.lastIndexOf(' ',Math.max(0,i-36)); a0=a0<0||i<40?Math.max(0,O.lastIndexOf('\n',i)+1):a0+1;
          if(O.lastIndexOf('\n',i)>=a0)a0=O.lastIndexOf('\n',i)+1;
          let b0=O.indexOf(' ',Math.min(O.length,i+k.length+64)); if(b0<0)b0=O.length;
          const nl=O.indexOf('\n',i); if(nl>=0&&nl<b0)b0=nl;
          sub=[a0>0?'… ':'',O.slice(a0,i),['mark',O.substr(i,k.length)],O.slice(i+k.length,b0).trimEnd(),b0<O.length?' …':''];}}
      out.push(['a','#'+id,artNum(id),pn(e[1]),sub]);}}
  if(!m){
    const tts=S.core.toc.filter(tt=>fold(tt.name[li]).includes(f));
    if(tts.length){out.push(['gh',t('titles')]);for(const tt of tts)out.push(['a','#'+tt.id,tt.num,pn(tt.name[li]),'']);}
    const sts=head.length?[]:d.st.filter(s=>s[2].includes(f)).slice(0,6);
    if(sts.length){out.push(['gh',t('states')]);for(const s of sts)out.push(['a','#state-'+s[0],s[0],pn(s[1]),'']);}
    const pre=d.ops.filter(o=>o[2].startsWith(f)), inc=f.length>2?d.ops.filter(o=>!o[2].startsWith(f)&&o[2].includes(f)):[];
    const ops=[...pre,...inc].slice(0,8);
    if(ops.length){out.push(['gh',t('municipalities')+(pre.length+inc.length>8?` · ${pre.length+inc.length}`:'')]);
      for(const o of ops){const s=S.core.st.find(x=>x[0]===o[1]);out.push(['a','#state-'+o[1]+'-'+slug(o[0]),o[1],pn(o[0]),s?pn(s[1]):'']);}}
  }
  if(!out.some(o=>o[0]==='a'))out.push(['none',t('noresult')]);
  return out;
}
function render(out){
  items=out.filter(o=>o[0]==='a'); sel=0; let i=-1;
  el.querySelector('.palres').innerHTML=out.map(o=>o[0]==='gh'?`<div class="gh">${esc(o[1])}</div>`:
    o[0]==='none'?`<div class="none">${esc(o[1])}</div>`:
    `<a href="${o[1]}" role="option" id="po${++i}" aria-selected="${i===0}" tabindex="-1"><b translate="no">${esc(o[2])}</b><span>${esc(o[3])}</span>${o[4]?`<small>${Array.isArray(o[4])?o[4].map(x=>Array.isArray(x)?`<mark>${esc(pn(x[1]))}</mark>`:esc(pn(x))).join(''):esc(o[4])}</small>`:''}</a>`).join('');
  el.querySelector('input').setAttribute('aria-activedescendant',items.length?'po0':'');
}
function move(dn){
  if(!items.length)return;
  sel=(sel+dn+items.length)%items.length;
  el.querySelectorAll('.palres a').forEach((a,i)=>{a.setAttribute('aria-selected',i===sel);if(i===sel)a.scrollIntoView({block:'nearest'});});
  el.querySelector('input').setAttribute('aria-activedescendant','po'+sel);
}
export function close(){
  if(!el||el.hidden)return;
  el.hidden=true;el.innerHTML='';document.body.style.overflow='';
  if(last&&last.isConnected)last.focus({preventScroll:true});
}
export async function open(q=''){
  el=document.getElementById('pal');
  if(!el.hidden){el.querySelector('input').focus();return;}
  last=document.activeElement;
  el.hidden=false;document.body.style.overflow='hidden';
  el.innerHTML=`<div class="palbox" role="dialog" aria-modal="true" aria-label="${esc(t('search'))}">
    <input type="text" role="combobox" aria-expanded="true" aria-controls="palres" aria-autocomplete="list" autocomplete="off" autocapitalize="off" spellcheck="false"
      placeholder="${esc(t('search_ph'))}" aria-label="${esc(t('search_q'))}" value="${esc(q)}">
    <div class="palres" id="palres" role="listbox" aria-label="${esc(t('search'))}"></div>
    <div class="palfoot"><span><kbd>↑↓</kbd>${esc(t('k_nav'))}</span><span><kbd>↵</kbd>${esc(t('k_open'))}</span><span><kbd>esc</kbd>${esc(t('k_close'))}</span></div></div>`;
  const input=el.querySelector('input');input.focus();
  const run=async()=>{const my=++seq, d=await data();if(my===seq&&!el.hidden)render(search(d,input.value));};
  input.addEventListener('input',run);
  el.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();move(1);}
    else if(e.key==='ArrowUp'){e.preventDefault();move(-1);}
    else if(e.key==='Enter'){e.preventDefault();const a=el.querySelectorAll('.palres a')[sel];if(a){const h=a.getAttribute('href');close();if(location.hash===h)dispatchEvent(new HashChangeEvent('hashchange'));else location.hash=h;}}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
    else if(e.key==='Tab'){e.preventDefault();input.focus();}
  });
  el.onclick=e=>{const a=e.target.closest('.palres a');if(a){close();return;}if(e.target===el)close();};
  run();
}
