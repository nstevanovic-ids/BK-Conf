/* Codex — core: state, languages, routing, home, reading thread, previews. */
import * as C from './cyr.js';

export const LANGS=['en','zap','sre','ist','fr'], UIL=['en','zap','sre','ist'];
const LI={en:0,zap:1,sre:2,ist:3};
const LOC={en:'en-GB',zap:'sl-SI',sre:'hr-HR',ist:'bg-BG',fr:'fr-FR'};
const FR={title:'Titre',chapter:'Chapitre',section:'Section',article:'Article',art:'art.'};
export const S={lang:'en',scripts:{sre:'lat',ist:'cyr'},cols:null,mtext:null,core:null,here:'home',view:null,vtSrc:null,vtTarget:null};
const $=id=>document.getElementById(id);
export const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ls={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
export const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export const narrow=()=>matchMedia('(max-width:760px)').matches;

const cache=new Map();
export function load(path){
  if(!cache.has(path))cache.set(path,fetch('data/'+path).then(r=>{if(!r.ok)throw new Error(path+' '+r.status);return r.json();}));
  return cache.get(path);
}

/* ---------- language ---------- */
export const scriptOf=l=>S.scripts[l]||'lat';
export const cyrOn=(l=S.lang)=>(l==='sre'||l==='ist')&&S.scripts[l]==='cyr';
export const pn=(s,l=S.lang)=>cyrOn(l)?C.cyrText(String(s),l):String(s);
export const px=s=>`<span data-pn="${esc(s)}">${esc(pn(s))}</span>`;
/* {0#one:…;few:…;other:…} picks the plural form for the number {0}, as on the portal */
const _pr={};
function plural(l,n,spec){
  const loc=LOC[l]||'en-GB', pr=_pr[loc]||(_pr[loc]=new Intl.PluralRules(loc)), f={};
  spec.split(';').forEach(x=>{const i=x.indexOf(':');if(i>0)f[x.slice(0,i).trim()]=x.slice(i+1);});
  return f[pr.select(Number(String(n).replace(/\D/g,'')))]??f.other??'';
}
export function tRaw(l,key,...a){
  const e=S.core.ui[key]; if(!e)return key;
  return (e[LI[l]]??e[0]).replace(/\{(\d+)#([^}]*)\}/g,(m,k,spec)=>plural(l,a[k],spec)).replace(/\{(\d+)\}/g,(m,k)=>a[k]??'');
}
export function tIn(l,key,...a){
  const e=S.core.ui[key]||[], s=tRaw(l,key,...a);
  return e.length>1&&cyrOn(l)?C.cyrText(s,l):s;
}
export const t=(key,...a)=>tIn(S.lang,key,...a);
const isNew=key=>(S.core.ui[key]||[]).length===1;
/* a string the portal does not have yet stays in English, with a visible mark: dotted line, tooltip */
export const todo=()=>S.core.ui.todo[0];
export function tx(key,...a){
  return `<span data-t="${key}"${a.length?` data-a="${esc(JSON.stringify(a))}"`:''}${isNew(key)?` data-untranslated lang="en" title="${esc(todo())}"`:''}>${esc(t(key,...a))}</span>`;
}
export function applyUI(root=document){
  root.querySelectorAll('[data-t]').forEach(el=>{el.textContent=t(el.dataset.t,...(el.dataset.a?JSON.parse(el.dataset.a):[]));});
  root.querySelectorAll('[data-pn]').forEach(el=>{el.textContent=pn(el.dataset.pn);});
  root.querySelectorAll('[data-tl]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.tl));});
}
export const fmtN=(n,l=S.lang,o)=>n==null?'–':new Intl.NumberFormat(LOC[l]||'en-GB',o).format(n);
export const fmtP=(x,d=1)=>fmtN(x*100,S.lang,{minimumFractionDigits:d,maximumFractionDigits:d})+' %';
/* structural labels in the language of a text; the French keeps the prefixes of its source */
export function lab(kind,num,l=S.lang,raw){
  if(l==='fr'){
    if(kind==='title'){const tt=S.core.toc.find(x=>x.num===num);num=tt?tt.id.replace('title-','').replace(/(\d+)(bis)/,'$1 $2'):num;}
    return FR[kind]+' '+num;}
  return (raw?tRaw:tIn)(l,{title:'title_n',chapter:'chapter_n',section:'section_n',article:'article_n',art:'art_n'}[kind],num);
}
export const artNum=id=>id.replace('art-','').replace(/(\d+)([a-z]+)/,'$1 $2');
export const artLab=(id,l=S.lang)=>lab('art',artNum(id),l);
export const stateOf=c=>S.core.st.find(s=>s[0]===c);
export const titleOf=aid=>S.core.toc.find(tt=>tt.a.includes(aid.replace('art-','')));
export const ORDER=()=>S._order||(S._order=S.core.toc.flatMap(tt=>tt.a.map(a=>'art-'+a)));
function fmtD(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso||''); if(!m)return iso||'';
  const y=m[1],mo=+m[2],d=+m[3];
  const M={zap:['januar','februar','marec','april','maj','junij','julij','avgust','september','oktober','november','december'],
    ist:['januari','fevruari','mart','april','maj','juni','juli','avgust','septemvri','oktomvri','noemvri','dekemvri']};
  if(S.lang==='zap')return `${d}. ${M.zap[mo-1]} ${y}`;
  if(S.lang==='sre')return `${d}. ${mo}. ${y}.`;
  if(S.lang==='ist')return cyrOn()?`${d} ${C.cyrText(M.ist[mo-1],'ist')} ${y} г.`:`${d} ${M.ist[mo-1]} ${y} g.`;
  return new Date(Date.UTC(+y,mo-1,d)).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
}
/* ASCII slug of a municipality name, for #state-LK-20-gospic */
const SL={'đ':'d','ł':'l','ß':'ss','æ':'ae','œ':'oe','ø':'o','ı':'i'};
export const slug=s=>C.cyr2lat(String(s)).toLowerCase().replace(/[đłßæœøı]/g,c=>SL[c]).normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* ---------- chrome ---------- */
function chrome(){
  const c=S.core;
  document.documentElement.lang=cyrOn()?(S.lang==='ist'?'bg':'sh-Cyrl'):(c.langs[S.lang].html||'en');
  $('langsel').innerHTML=UIL.map(l=>`<button type="button" data-l="${l}" translate="no" aria-pressed="${l===S.lang}" title="${esc(c.langs[l].name)}">${c.langs[l].lab}</button>`).join('');
  $('langsel').setAttribute('aria-label',t('language'));
  const ss=$('scriptsel'), sc=S.lang==='sre'||S.lang==='ist';
  ss.hidden=!sc;
  if(sc){const cur=scriptOf(S.lang);
    ss.innerHTML=`<button type="button" data-s="lat" translate="no" aria-pressed="${cur==='lat'}" aria-label="${esc(tRaw(S.lang,'lat'))}">Lat</button>`+
      `<button type="button" data-s="cyr" translate="no" aria-pressed="${cur==='cyr'}" aria-label="${esc(tRaw(S.lang,'cyr'))}">${S.lang==='ist'?'Кир':'Ћир'}</button>`+
      `<button type="button" data-s="dbl" translate="no" aria-pressed="${cur==='dbl'}" aria-label="${esc(tRaw(S.lang,'lat')+' / '+tRaw(S.lang,'cyr'))}">A/${S.lang==='ist'?'А':'Ћ'}</button>`;}
  $('themebtn').setAttribute('aria-label',t('theme'));
  $('pallab').textContent=t('search');
  $('palbtn').setAttribute('aria-label',t('search'));
  $('palkbd').textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘K':'Ctrl K';
  $('burger').setAttribute('aria-label',t($('tools').classList.contains('open')?'menu_x':'menu'));
  $('brand').setAttribute('aria-label',t('brand')+' · '+t('home'));
  $('brandn').textContent=pn(c.ui.brand[0]);
  const sk=$('skip');sk.textContent=t('skip');sk.title=todo();
  $('prog').setAttribute('aria-label',t('constitution'));
}
export function setLoc(html,href){$('loc').innerHTML=html||'';if(href)$('loc').setAttribute('href',href);}
/* the ruler under the header: eleven segments, one graduation per article, filled up to the reader */
function ruler(){
  const p=$('prog'); if(p.dataset.ok)return; p.dataset.ok=1;
  p.innerHTML=S.core.toc.map(tt=>`<i style="flex:${tt.a.length};--k:${tt.a.length}"><b></b></i>`).join('');
}
export function setProgress(i){const p=$('prog');ruler();
  if(i==null){p.classList.remove('on');p.setAttribute('aria-valuenow',0);return;}
  p.classList.add('on');p.setAttribute('aria-valuenow',i);
  let left=i;
  [...p.children].forEach((seg,k)=>{const n=S.core.toc[k].a.length, f=Math.max(0,Math.min(1,left/n));
    seg.firstChild.style.transform=`scaleX(${f.toFixed(4)})`;seg.classList.toggle('cur',left>0&&left<=n);left-=n;});
}

function setLang(l){
  if(l===S.lang||!UIL.includes(l))return;
  if(S.cols)S.cols=[l,...S.cols.filter(x=>x!==l&&x!==S.lang)];
  if(S.mtext===S.lang)S.mtext=l;
  S.lang=l;ls.set('cx-lang',l);
  const base=location.hash.replace(/^(#(?:art|title)-\d+[a-z]*).*$/,'$1');
  if(base!==location.hash)history.replaceState(null,'',base);
  chrome();route(true);
}
async function setScriptMode(m){
  const l=S.lang; if(!S.scripts[l]||S.scripts[l]===m)return;
  S.scripts[l]=m;ls.set('cx-script-'+l,m);
  chrome();renderThread();closeMenu();
  const cells=[...document.querySelectorAll(`#main .cx[data-l="${l}"]`)];
  if(cells.length&&S.view&&S.view.inplace){
    applyUI($('main'));
    document.dispatchEvent(new CustomEvent('cx:script'));
    const all=[...document.querySelectorAll('#main .cx')];
    await C.switchScript(cells,l,m,all);
  }else route(true);
}
function closeMenu(){$('tools').classList.remove('open');$('burger').setAttribute('aria-expanded','false');}

/* ---------- reading thread ---------- */
let thread=[], follow=null;
try{thread=JSON.parse(sessionStorage.getItem('cx-thread')||'[]');}catch(e){}
const tlabel=h=>h==='home'?t('home'):h==='states'?t('states'):h.startsWith('state-')?h.slice(6):h.startsWith('title-')?lab('title',(S.core.toc.find(x=>x.id===h)||{}).num||''):artLab(h);
function renderThread(){
  const el=$('thread');
  try{sessionStorage.setItem('cx-thread',JSON.stringify(thread));}catch(e){}
  const on=thread.length>=2;
  document.body.classList.toggle('has-thread',on);
  if(!on){el.hidden=true;el.innerHTML='';return;}
  el.hidden=false;el.setAttribute('aria-label',t('pages'));
  el.innerHTML=thread.map((h,i)=>
    `${i?'<span class="sep" aria-hidden="true">›</span>':''}<a href="#${h}" data-th="${i}"${i===thread.length-1?' aria-current="location"':''}${h.startsWith('state-')?' translate="no"':''}>${esc(tlabel(h))}</a>`).join('');
  el.scrollLeft=el.scrollWidth;
}
/* a place already in the thread is not stacked twice: the thread comes back to it */
function threadOn(target){
  const base=target.replace(/^(art-[0-9a-z]+).*$/,'$1').replace(/^(state-[A-Z]{2}-\d{2}).*$/,'$1');
  if(follow&&thread[thread.length-1]!==follow&&!thread.includes(follow))thread=[follow];
  const i=thread.lastIndexOf(base);
  if(i>=0)thread=thread.slice(0,i+1);
  else if(follow)thread.push(base);
  else thread=[];
  follow=null;renderThread();
}

/* ---------- previews ---------- */
let popFor=null, popT=0;
async function showPop(a){
  const href=a.getAttribute('href')||''; const id=href.slice(1).replace(/^(art-[0-9a-z]+).*$/,'$1');
  const l=(a.closest('[data-l]')||{dataset:{}}).dataset.l||S.lang;
  popFor=a; let h='';
  if(id.startsWith('art-')){
    const idx=await load(`idx.${l}.json`); const e=idx[id]; if(!e||popFor!==a)return;
    h=`<div class="k">${esc(pn(lab('article',e[0],l),l))}</div><h4>${esc(pn(e[1],l))}</h4><p>${esc(pn(e[2],l))}</p>`;
  }else if(id.startsWith('title-')){
    const tt=S.core.toc.find(x=>x.id===id); if(!tt)return;
    h=`<div class="k">${esc(pn(lab('title',tt.num,l),l))}</div><h4>${esc(pn(tt.name[LANGS.indexOf(l)],l))}</h4><p>${esc(artLab('art-'+tt.a[0],l))} – ${esc(artNum('art-'+tt.a[tt.a.length-1]))}</p>`;
  }else if(id.startsWith('state-')){
    const s=stateOf(id.slice(6,11)); if(!s)return;
    const people=s[3]!=='fed'?pn(S.core.pe[s[3]][LI[S.lang]]):'';
    h=`<img src="flags/${s[0]}.png" width="${s[10]}" height="${s[11]}" alt=""><div class="k" translate="no">${s[0]}</div><h4>${esc(pn(s[1]))}</h4><p>${esc(t('t_'+s[2]))}${people?' · '+esc(people):''}</p>`;
  }else return;
  const p=$('pop');p.innerHTML=h;p.hidden=false;
  const r=a.getBoundingClientRect(), pw=p.offsetWidth, ph=p.offsetHeight;
  let x=Math.min(Math.max(12,r.left+scrollX),scrollX+innerWidth-pw-12), y=r.bottom+scrollY+8;
  if(r.bottom+ph+16>innerHeight&&r.top-ph-8>60)y=r.top+scrollY-ph-8;
  p.style.left=x+'px';p.style.top=y+'px';
}
function hidePop(){popFor=null;clearTimeout(popT);$('pop').hidden=true;}
const PV='a.rf,a.sl,a[data-pv]';
document.addEventListener('mouseover',e=>{const a=e.target.closest&&e.target.closest(PV);
  if(!a||a===popFor||!matchMedia('(hover:hover)').matches)return;clearTimeout(popT);popT=setTimeout(()=>showPop(a),90);});
document.addEventListener('mouseout',e=>{const a=e.target.closest&&e.target.closest(PV);if(a)hidePop();});
document.addEventListener('focusin',e=>{const a=e.target.closest&&e.target.closest(PV);if(a&&a.matches(':focus-visible'))showPop(a);else hidePop();});
document.addEventListener('scroll',()=>{if(popFor&&!popFor.matches(':focus'))hidePop();},{passive:true});

/* ---------- routing ---------- */
/* hashes are forgiving: #art-1-bis, #Art-110, #/state/LK-20 and #/constitution/title-4/art-109 (the
   portal's scheme) are rewritten to the canonical form; what cannot be found is said, not hidden */
function canon(raw){
  let h=decodeURIComponent(raw.replace(/^#/,'')).trim();
  let m;
  if((m=/^\/?state\/([A-Za-z]{2}-\d{2})$/.exec(h)))return 'state-'+m[1].toUpperCase();
  if((m=/^\/?constitution(?:\/(title-[0-9a-z]+))?(?:\/(art-[0-9a-z]+))?$/.exec(h)))return m[2]||m[1]||'title-1';
  if(/^\/?(home|states)$/.test(h))return h.replace('/','');
  h=h.replace(/^\//,'');
  if((m=/^art-?(\d+)[- ]?(bis|ter|quater|quinquies|sexies|septies|octies)?((?:-(?:en|zap|sre|ist|fr))*)$/i.exec(h)))return 'art-'+m[1]+(m[2]||'').toLowerCase()+m[3].toLowerCase();
  if((m=/^title-?(\d+)[- ]?(bis)?((?:-(?:en|zap|sre|ist|fr))*)$/i.exec(h)))return 'title-'+m[1]+(m[2]||'').toLowerCase()+m[3].toLowerCase();
  if((m=/^state-([A-Za-z]{2}-\d{2})(-[a-z0-9-]+)?$/.exec(h)))return 'state-'+m[1].toUpperCase()+(m[2]||'');
  return h;
}
function parse(){
  const h=canon(location.hash);
  if('#'+h!==location.hash&&h)history.replaceState(null,'','#'+h);
  let m;
  if((m=/^art-(\d+[a-z]*?)((?:-(?:en|zap|sre|ist|fr))*)$/.exec(h))){
    if(!titleOf('art-'+m[1]))return {v:'nf',q:artNum('art-'+m[1]),h};
    return {v:'reader',art:'art-'+m[1],cols:m[2]?m[2].slice(1).split('-'):null};}
  if((m=/^title-(\d+(?:bis)?)((?:-(?:en|zap|sre|ist|fr))*)$/.exec(h))){
    if(!S.core.toc.some(x=>x.id==='title-'+m[1]))return {v:'nf',q:'',h};
    return {v:'reader',title:'title-'+m[1],cols:m[2]?m[2].slice(1).split('-'):null};}
  if((m=/^state-([A-Z]{2}-\d{2})(?:-([a-z0-9-]+))?$/.exec(h)))return {v:'state',code:m[1],mun:m[2]||null};
  if(h==='states')return {v:'states'};
  if(h==='preamble')return {v:'home',pre:true};
  if(h===''||h==='home')return {v:'home'};
  return {v:'nf',q:h.replace(/[-/]+/g,' ').trim(),h};
}
/* view change. Shared elements: the link that was followed (article number, State code, flag) and
   its counterpart in the new view carry the same view-transition-name for the time of the change. */
export function swap(fn){
  const src=S.vtSrc;S.vtSrc=null;
  if(document.startViewTransition&&!reduced()&&!document.hidden){
    try{
      const live=(src||[]).filter(x=>x.el&&x.el.isConnected), named=[];
      for(const x of live)x.el.style.viewTransitionName=x.name;
      const v=document.startViewTransition(async()=>{
        for(const x of live)x.el.style.viewTransitionName='';
        await fn();
        for(const x of live){const tg=S.vtTarget&&S.vtTarget(x.name);if(tg){tg.style.viewTransitionName=x.name;named.push(tg);}}
      });
      const clean=()=>{for(const n of named)n.style.viewTransitionName='';};
      v.finished.then(clean,clean);v.ready.catch(()=>{});
      return v.updateCallbackDone.catch(()=>{});
    }catch(e){}
  }
  return Promise.resolve(fn());
}
let routing=0;
export async function route(keep){
  const my=++routing, r=parse();
  hidePop();closeMenu();
  if(r.cols){
    const cols=[...new Set(r.cols)];
    if(UIL.includes(cols[0])&&cols[0]!==S.lang){S.lang=cols[0];ls.set('cx-lang',S.lang);chrome();}
    S.cols=cols;S.mtext=cols[0];
  }
  if(!keep)threadOn(location.hash.slice(1)||'home');else renderThread();
  const anchor=keep&&S.view&&S.view.anchor?S.view.anchor():null;
  if(S.view&&S.view.leave)S.view.leave();
  S.vtTarget=null;
  if(r.v==='reader'){
    const m=await import('./reader.js'); if(my!==routing)return;
    S.view=await m.show(r,keep,anchor);
  }else if(r.v==='state'||r.v==='states'){
    const m=await import('./state.js'); if(my!==routing)return;
    S.view=await m.show(r);
  }else if(r.v==='nf')S.view=await notFound(r);
  else S.view=await home(r);
}
async function notFound(r){
  await swap(()=>{$('main').innerHTML=`<div class="wrap nf"><div class="eyebrow">${tx('constitution')}</div>
    <h1>${tx('notfound')}</h1><p class="nfh" translate="no">#${esc(r.h)}</p>
    <p class="acts"><button type="button" class="btn pri" id="nfs">${tx('search')}</button><a class="btn" href="#home">${tx('home')}</a><a class="btn" href="#states">${tx('states')}</a></p></div>`;scrollTo(0,0);});
  $('nfs').onclick=async()=>{(await import('./palette.js')).open(r.q||'');};
  document.title=t('notfound');S.here='home';setLoc('');setProgress(null);
  return {};
}

/* ---------- home ---------- */
async function home(r){
  const c=S.core, li=LANGS.indexOf(S.lang), pre=c.pre[S.lang];
  const pos=JSON.parse(ls.get('cx-pos')||'{}')[S.lang];
  const ver=c.version.replace('v','');
  const h=`<div class="wrap hm">
  <section class="cover">
    <div class="eyebrow">${tx('law')} · ${px(c.ui.brand[0])}</div>
    <h1>${tx('h1')}</h1>
    <div class="meta"><span class="motto cx" data-l="${S.lang}">${esc(pre.motto)}</span><span>${tx('version',ver,fmtD(c.iso))}</span>
      <span class="num">${tx('n_articles',ORDER().length)}</span></div>
    <div class="acts"><a class="btn pri" href="#art-1">${tx('begin')}</a>
      ${pos?`<a class="btn" href="#${pos}">${tx('continue')} <span class="num">${tx('art_n',artNum(pos))}</span></a>`:''}
      <a class="btn" href="#states">${tx('states')}</a></div>
    <aside class="hero" id="hero" aria-label="${esc(artLab('art-110'))}">
      <a class="hk" href="#art-110" data-pv><b translate="no">110</b><span>${tx('article_n','110')}</span></a>
      <div class="hx" id="herox"></div>
      <div class="ins" data-ins="dk110" id="heroi"></div>
    </aside>
  </section>
  <section class="pre" id="preamble">
    <h2>${tx('preamble')}</h2>
    <div>${pre.paras.map((p,i)=>`<p class="pp cx${i===pre.paras.length-1?' last':''}" data-l="${S.lang}">${esc(p)}</p>`).join('')}
      <p class="mot cx" data-l="${S.lang}">${esc(pre.motto)}</p></div>
  </section>
  <section class="toc" aria-labelledby="toch">
    <h2 id="toch">${tx('titles')}</h2>
    ${c.toc.map(tt=>{const [rn,sfx]=tt.num.split(' ');return `<div class="trow">
      <a class="rn" href="#${tt.id}" translate="no" aria-label="${esc(lab('title',tt.num))}">${rn}${sfx?`<small>${sfx}</small>`:''}</a>
      <div><a class="tn cx" data-l="${S.lang}" href="#${tt.id}">${esc(tt.name[li])}</a>
        <div class="rg">${tx('art_n',artNum('art-'+tt.a[0]))} – <span translate="no">${esc(artNum('art-'+tt.a[tt.a.length-1]))}</span> · ${tx('n_articles',tt.a.length)}</div></div>
      <div class="ticks">${tt.a.map(a=>`<a href="#art-${a}" data-pv tabindex="-1" class="${/[a-z]/.test(a)?'b':''}${pos==='art-'+a?' here':''}" aria-label="${esc(artLab('art-'+a))}"></a>`).join('')}</div>
    </div>`;}).join('')}
  </section>
  <nav class="annex" aria-label="${esc(t('states'))}">
    <a href="#states"><b class="num">48</b><span>${tx('territorial')}</span></a>
    <a href="#states"><b class="num">6</b><span>${tx('fed_muni')}</span></a>
    <a href="#art-102"><b class="num">7</b><span>${tx('peoples')}</span></a>
    <a href="#art-1quinquies"><b class="num">24</b><span>${tx('autonomy')}</span></a>
  </nav>
  <footer class="foot"><span>${px(c.ui.topline[LI[S.lang]]??c.ui.topline[0])}</span><span translate="no">${esc(c.version)} · ${esc(c.iso)}</span></footer>
  </div>`;
  const boot=$('boot'), first=boot&&boot.isConnected;
  const fill=()=>{
    if(!first){$('main').innerHTML=h;return;}
    // first paint: the static heading stays the same node, the page is built around it
    const tpl=document.createElement('template');tpl.innerHTML=h;
    const nw=tpl.content.firstElementChild, oc=boot.querySelector('.cover'), nc=nw.querySelector('.cover');
    oc.querySelector('h1').innerHTML=nc.querySelector('h1').innerHTML;nc.querySelector('h1').remove();
    oc.querySelector('.eyebrow').replaceWith(nc.querySelector('.eyebrow'));
    while(nc.firstChild)oc.append(nc.firstChild);
    nc.remove();while(nw.firstChild)boot.append(nw.firstChild);boot.removeAttribute('id');
  };
  S.vtTarget=null;
  if(first)fill();else await swap(()=>{fill();scrollTo(0,0);});
  for(const l of ['sre','ist'])if(S.lang===l&&scriptOf(l)!=='lat')document.querySelectorAll('#main .cx').forEach(el=>C.setScript(el,l,scriptOf(l)));
  if(r.pre)$('preamble').scrollIntoView();else scrollTo(0,0);
  document.title=t('h1');
  S.here='home';setLoc('');setProgress(null);
  hero();
  return {inplace:true};
}
/* the first screen works: Article 110 with its double key, on the real text and the real figures */
async function hero(){
  const lang=S.lang, box=$('herox'), ins=$('heroi'); if(!box)return;
  const [f,m]=await Promise.all([load(`t/title-4.${lang}.json`),import('./instr.js')]);
  if(!box.isConnected||S.lang!==lang)return;
  const a=f.ch.flatMap(ch=>ch.arts).find(x=>x.id==='art-110');
  $('hero').querySelector('.hk span').innerHTML=`${tx('article_n','110')} · <span class="cx" data-l="${lang}">${esc(a.name)}</span>`;
  box.innerHTML=[3,4].map(u=>`<div class="cell cx" data-l="${lang}" data-u="${u}"><p class="u"><span class="al" translate="no" aria-hidden="true">${u+1}</span>${a.u[u][a.u[u].length-1]}</p></div>`).join('');
  if(scriptOf(lang)!=='lat')$('hero').querySelectorAll('.cx').forEach(el=>C.setScript(el,lang,scriptOf(lang)));
  m.mount(ins,'dk110',(u,cls,mk)=>{const c=box.querySelector(`.cell[data-u="${u}"]`); if(!c)return;
    c.classList.remove('ok','ko','na','on');if(cls)c.classList.add(cls);if(mk)c.dataset.mk=mk;else delete c.dataset.mk;});
}

/* ---------- boot ---------- */
async function boot(){
  S.core=await load('core.json');
  C.setKeep(S.core.keep);
  const l=ls.get('cx-lang'); if(UIL.includes(l))S.lang=l;
  for(const s of ['sre','ist']){const v=ls.get('cx-script-'+s);if(['lat','cyr','dbl'].includes(v))S.scripts[s]=v;}
  try{const c=JSON.parse(ls.get('cx-cols')||'null');if(Array.isArray(c)&&c.every(x=>LANGS.includes(x))&&c.length)S.cols=[S.lang,...c.filter(x=>x!==S.lang)];}catch(e){}
  chrome();
  $('langsel').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setLang(b.dataset.l);});
  $('scriptsel').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setScriptMode(b.dataset.s);});
  $('themebtn').addEventListener('click',()=>{
    const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
    document.documentElement.dataset.theme=dark?'light':'dark';ls.set('cx-theme',dark?'light':'dark');});
  $('burger').addEventListener('click',()=>{const o=$('tools').classList.toggle('open');$('burger').setAttribute('aria-expanded',o);
    $('burger').setAttribute('aria-label',t(o?'menu_x':'menu'));});
  const pal=async q=>{const m=await import('./palette.js');m.open(q);};
  $('palbtn').addEventListener('click',()=>pal());
  addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal();}
    else if(e.key==='Escape'){hidePop();closeMenu();}
    else if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();pal();}
  });
  document.addEventListener('click',e=>{
    const a=e.target.closest&&e.target.closest('a[href^="#"]'); if(!a)return;
    const href=a.getAttribute('href');
    if(a.matches('.rf,.sl,[data-follow]')&&a.closest('#main'))follow=S.here;
    if(a.dataset.th!==undefined)follow=null;
    // shared elements of the coming view change
    if(/^#art-/.test(href)){const n=a.matches('.tindex a')?a.querySelector('b'):a.querySelector('b')||a;S.vtSrc=[{el:n,name:'artnum'}];}
    else if(/^#state-/.test(href)){const im=a.querySelector('img'), b=a.querySelector('b')||(a.matches('.sl')?a:null);
      S.vtSrc=[im&&{el:im,name:'stflag'},b&&{el:b,name:'stcode'}].filter(Boolean);}
    if(href===location.hash){e.preventDefault();route();}
  });
  addEventListener('hashchange',()=>route());
  await route();
}
export function saveCols(){ls.set('cx-cols',JSON.stringify(S.cols));}
export function savePos(l,id){const p=JSON.parse(ls.get('cx-pos')||'{}');if(p[l]!==id){p[l]=id;ls.set('cx-pos',JSON.stringify(p));}}
boot().catch(e=>{console.error(e);$('main').innerHTML=`<div class="wrap"><p>${esc(e.message)}</p></div>`;});
