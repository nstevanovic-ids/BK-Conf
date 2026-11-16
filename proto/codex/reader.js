/* Codex — the reading itself: one to five texts aligned unit by unit, references, margins. */
import {S,load,esc,t,tx,lab,artNum,artLab,pn,LANGS,scriptOf,swap,setLoc,setProgress,ORDER,titleOf,narrow,reduced,
  saveCols,savePos,todo} from './app.js';
import * as C from './cyr.js';

const HL={en:'en',zap:'sl',sre:'sh',ist:'bg-Latn',fr:'fr'};
const INS={'art-1bis':'map1','art-1ter':'cap','art-103':'sl','art-109':'alarm','art-110':'dk110','art-111':'dk111',
  'art-115bis':'reg','art-132':'eq'};
const $m=()=>document.getElementById('main');
let live=null;   // what is mounted: {key, tid, cols, off()}

const hashFor=(id,cols)=>'#'+id+(cols.length>1||cols[0]!==S.lang?'-'+cols.join('-'):'');
/* a narrow screen mounts one text only; the others come by the tabs or by a horizontal swipe */
function colsNow(mobile){
  if(!S.cols||!S.cols.length)S.cols=[S.lang];
  if(mobile){if(!LANGS.includes(S.mtext))S.mtext=S.cols[0];return [S.mtext];}
  return S.cols.slice(0,5);
}
/* wide screen: the margin stays whatever the number of texts; when a column would fall under 300 px
   the texts scroll sideways in columns of 340 px, the first one and the margin held in place */
function layout(n,mobile){
  if(mobile)return {mg:false,hs:false};
  const W=document.documentElement.clientWidth, mg=W>=1100;
  const pad=Math.min(40,Math.max(16,W*.04))*2, gut=n>=3?68:n===2?86:104, gap=n>=3?22:Math.min(44,Math.max(20,W*.026));
  const col=(W-pad-gut-(mg?272+gap:0)-n*gap)/n;
  return {mg,hs:n>=2&&col<300};
}
const cellA=(i,l,extra='')=>`class="cell cx c${i+1}${extra}" data-l="${l}" lang="${HL[l]}"`;

function unitHTML(u,n,multi){
  const k=u[0], mk=u.length===3?u[1]:'', h=u[u.length-1];
  if(k==='li')return `<p class="u li"><span class="mk" translate="no">${esc(mk)}</span>${h}</p>`;
  if(k==='h')return `<p class="u sh">${h}</p>`;
  return `<p class="u">${multi?`<span class="al" translate="no" aria-hidden="true">${n}</span>`:''}${h}</p>`;
}
function articleHTML(arts,cols,gi){
  const a0=arts[0], id=a0.id, [n,sfx]=a0.num.split(' ');
  const base=arts.find(a=>!a.miss&&!a.mis)||a0, R=base.u.length;
  const multi=base.u.filter(u=>u[0]==='p').length>1;
  let h=`<section class="art grid" id="${id}" data-i="${gi}">
  <div class="gut"><a class="anum" href="#${id}" translate="no" tabindex="-1" aria-hidden="true">${n}${sfx?`<small>${sfx}</small>`:''}</a></div>`;
  arts.forEach((a,i)=>{const l=cols[i];
    h+=`<header ${cellA(i,l,' ah')} style="grid-row:1"><p class="k">${esc(lab('article',a.num,l,true))}</p><h3>${esc(a.name)}</h3></header>`;
    if(a.miss){h+=`<div class="cell c${i+1}" style="grid-row:2"><p class="misal" data-untranslated title="${esc(todo())}">${esc(t('misaligned'))}</p></div>`;return;}
    if(a.mis){let pn_=0;
      h+=`<div ${cellA(i,l)} style="grid-row:2 / span ${R}"><p class="misal" data-untranslated title="${esc(todo())}">${esc(t('misaligned'))}</p>${a.u.map(u=>unitHTML(u,u[0]==='p'?++pn_:0,true)).join('')}</div>`;return;}
    let pn_=0;
    a.u.forEach((u,j)=>{h+=`<div ${cellA(i,l)} data-u="${j}" style="grid-row:${j+2}">${unitHTML(u,u[0]==='p'?++pn_:0,multi)}</div>`;});
  });
  const cited=S.core.cited[id]||[], ins=INS[id];
  if(cited.length||ins){
    h+=`<aside class="mg" style="grid-row:1 / span ${R+1}"><div class="mgi">${cited.length?`<div class="cb"><span class="k">${tx('in_const')}</span>${cited.map(c=>
      `<a class="rf" href="#${c}" translate="no">${esc(artNum(c))}</a>`).join('')}</div>`:''}${ins?`<div class="ins" data-ins="${ins}" data-art="${id}"></div>`:''}</div></aside>`;
  }
  return h+'</section>';
}
function titleHTML(files,cols,tt,mobile,L){
  const f0=files[0], order=ORDER(), [rn,sfx]=tt.num.split(' ');
  const ti=S.core.toc.indexOf(tt), prev=S.core.toc[ti-1], next=S.core.toc[ti+1], l0=cols[0], li=LANGS.indexOf(S.lang);
  let h=`<div class="rd${L.mg?' has-mg':''}${L.hs?' hs':''}" data-n="${cols.length}" style="--n:${cols.length}">
  <div class="texts"><span class="lb">${tx('language')}</span><div class="chips" role="group" aria-label="${esc(t('language'))}">${
    LANGS.map(l=>`<button type="button" data-c="${l}" translate="no" aria-pressed="${cols.includes(l)}"${l==='fr'?' aria-label="FR"':` title="${esc(S.core.langs[l].name)}"`}>${l==='fr'?'FR':S.core.langs[l].lab}</button>`).join('')
  }</div><span class="cnt" id="cnt" translate="no"></span></div>
  <div class="sheet" id="sheet">
  <section class="opener grid" id="${tt.id}">
    <div class="gt" translate="no" aria-hidden="true">${rn}${sfx?`<small>${sfx}</small>`:''}</div>
    ${files.map((f,i)=>`<div ${cellA(i,cols[i])} style="grid-row:1"><p class="k">${esc(lab('title',tt.num,cols[i],true))}</p><h1>${esc(f.name)}</h1></div>`).join('')}
    <nav class="tindex" style="grid-row:2" aria-label="${esc(t('articles_of',lab('title',tt.num)))}">${f0.ch.map(ch=>
      `${ch.num?`<div class="ch cx" data-l="${l0}">${esc(lab('chapter',ch.num.replace('Chapter ',''),l0,true))} · ${esc(ch.name)}</div>`:''}${ch.arts.map(a=>
      `<a href="#${a.id}"><b class="cx" data-l="${l0}">${esc(lab('art',a.num,l0,true))}</b><span class="cx" data-l="${l0}">${esc(a.name)}</span></a>`).join('')}`).join('')}</nav>
  </section>`;
  f0.ch.forEach((ch,ci)=>{
    if(ch.num)h+=`<div class="brk grid">${files.map((f,i)=>`<div ${cellA(i,cols[i])} style="grid-row:1"><p class="k">${esc(lab('chapter',ch.num.replace('Chapter ',''),cols[i],true))}</p><h2>${esc(f.ch[ci].name)}</h2></div>`).join('')}</div>`;
    ch.arts.forEach((a,ai)=>{
      if(a.sec)h+=`<div class="brk sec grid">${files.map((f,i)=>{const s=f.ch[ci].arts[ai].sec||a.sec;
        return `<div ${cellA(i,cols[i])} style="grid-row:1"><p class="k">${esc(lab('section',s[0].replace('Section ',''),cols[i],true))}</p><h2>${esc(s[1])}</h2></div>`;}).join('')}</div>`;
      h+=articleHTML(files.map(f=>f.ch[ci].arts[ai]),cols,order.indexOf(a.id));
    });
  });
  h+=`<nav class="pager">${prev?`<a href="#${prev.id}"><small>← ${tx('prev')}</small><b>${esc(pn(lab('title',prev.num)))} · ${esc(pn(prev.name[li]))}</b></a>`
      :`<a href="#preamble"><small>← ${tx('back')}</small><b>${tx('preamble')}</b></a>`}
    ${next?`<a class="nx" href="#${next.id}"><small>${tx('next')} →</small><b>${esc(pn(lab('title',next.num)))} · ${esc(pn(next.name[li]))}</b></a>`:`<a class="nx" href="#states"><small>${tx('next')} →</small><b>${tx('states')}</b></a>`}</nav>
  </div></div>`;
  return h;
}

function applyScripts(root,cols){
  for(const l of ['sre','ist']){
    const m=scriptOf(l); if(!cols.includes(l)||m==='lat')continue;
    root.querySelectorAll(`.cx[data-l="${l}"]`).forEach(c=>C.setScript(c,l,m));
  }
}
function arrive(el){
  if(!el)return;
  el.classList.remove('arrive');void el.offsetWidth;el.classList.add('arrive');
  setTimeout(()=>el.classList.remove('arrive'),reduced()?2600:1700);
}
/* content-visibility skips the layout of articles off screen: their heights are estimates until
   they come near, so a landing is corrected over the next frames, unless the reader moves. */
let landing=0;
const topWant=()=>document.getElementById('hd').offsetHeight+(document.body.classList.contains('has-thread')?40:0)+50;
function land(el,top){
  const my=++landing; let n=0, calm=0;
  const stop=()=>{if(my===landing)landing++;};
  for(const ev of ['wheel','touchstart','keydown','mousedown'])addEventListener(ev,stop,{once:true,passive:true,capture:true});
  const step=()=>{
    if(my!==landing||!el.isConnected||n++>50)return;
    const d=el.getBoundingClientRect().top-(top??topWant());
    if(Math.abs(d)>1.5){scrollBy(0,d);calm=0;}else if(++calm>5)return;
    requestAnimationFrame(step);
  };
  step();
}
/* the unit under the header: what a re-render (texts, language, width) must give back */
export function anchorNow(){
  if(!document.querySelector('.rd'))return null;
  const hd=topWant()+10;
  for(const a of document.querySelectorAll('.rd .art')){
    const ar=a.getBoundingClientRect(); if(ar.bottom<=hd)continue;
    for(const c of a.querySelectorAll('.cell.c1')){const r=c.getBoundingClientRect();
      if(r.bottom>hd)return {id:a.id,u:c.dataset.u,dy:r.top};}
    return {id:a.id,u:undefined,dy:ar.top};
  }
  return null;
}

export async function show(r,keep,anchor){
  let tt=r.title?S.core.toc.find(x=>x.id===r.title):titleOf(r.art||'');
  if(!tt)return null;
  const mobile=narrow(), cols=colsNow(mobile), L=layout(cols.length,mobile);
  const key=[tt.id,cols.join(),S.lang,mobile,L.mg,L.hs].join('|');
  if(live&&live.key===key&&document.querySelector('.rd')&&!keep){
    const el=document.getElementById(r.art||tt.id);
    if(el){const far=Math.abs(el.getBoundingClientRect().top)>innerHeight*3, sm=!(reduced()||far);
      landing++;
      el.scrollIntoView({behavior:sm?'smooth':'auto',block:'start'});
      if(sm)setTimeout(()=>{if(Math.abs(el.getBoundingClientRect().top)<innerHeight)land(el);},650);else land(el);
      if(r.art){arrive(el);focusArt(el);}}
    return live.view;
  }
  if(keep&&!anchor)anchor=anchorNow();
  if(live){live.off();live=null;}
  const files=await Promise.all(cols.map(l=>load(`t/${tt.id}.${l}.json`)));
  const html=titleHTML(files,cols,tt,mobile,L);
  S.vtTarget=name=>{if(name!=='artnum'||!r.art)return null;const a=document.getElementById(r.art);
    return a&&(mobile?a.querySelector('.ah .k'):a.querySelector('.anum'));};
  await swap(()=>{
    const main=$m();main.innerHTML=html;
    applyScripts(main,cols);
    let done=false;
    if(anchor){
      const art=document.getElementById(anchor.id);
      const c=art&&(art.querySelector(`.cell.c1[data-u="${anchor.u}"]`)||art.querySelector('.cell.c1'));
      if(c){scrollTo(0,scrollY+c.getBoundingClientRect().top-anchor.dy);land(c,anchor.dy);done=true;}
    }
    if(!done){const el=r.art&&document.getElementById(r.art);
      if(el){el.scrollIntoView({block:'start'});land(el);
        if(document.fonts&&document.fonts.status!=='loaded'){const my=landing;document.fonts.ready.then(()=>{if(my===landing)land(el);});}}   // the web fonts change the heights above
      else{landing++;scrollTo(0,0);}}
  });
  if(r.art&&!anchor){const el=document.getElementById(r.art);arrive(el);if(!keep)focusArt(el);}
  if(mobile&&r.slide&&!reduced())document.getElementById('sheet').animate(
    [{transform:`translateX(${r.slide*36}px)`,opacity:0},{transform:'none',opacity:1}],{duration:200,easing:'cubic-bezier(.2,.7,.2,1)'});
  const view={inplace:true,anchor:anchorNow,leave(){if(live){live.off();live=null;}}};
  live={key,tid:tt.id,cols,view,off:wire(tt,cols,mobile)};
  if(mobile)for(const l of LANGS)if(l!==cols[0])setTimeout(()=>load(`t/${tt.id}.${l}.json`).catch(()=>{}),600);   // ready for the swipe
  return view;
}
function focusArt(el){
  const h=el&&el.querySelector('.ah h3'); if(!h)return;
  h.tabIndex=-1;h.focus({preventScroll:true});
}

/* listeners of a mounted title; returns the function that removes them */
function wire(tt,cols,mobile){
  const ac=new AbortController(), sig={signal:ac.signal}, psig={signal:ac.signal,passive:true};
  const sheet=document.getElementById('sheet'), rd=document.querySelector('.rd'), order=ORDER();
  let cur=null, tick=0, curEl=null;
  const arts=[...rd.querySelectorAll('.art')];
  const li=LANGS.indexOf(S.lang);
  const track=()=>{
    tick=0;
    const y=topWant()+34;
    let art=null;
    for(const a of arts){if(a.getBoundingClientRect().top<=y)art=a;else break;}
    const id=art?art.id:tt.id;
    if(!id||id===cur)return;
    cur=id;S.here=id;
    if(curEl)curEl.classList.remove('cur');curEl=art;if(art)art.classList.add('cur');
    const isArt=id.startsWith('art-');
    const nameEl=isArt&&art?art.querySelector('.ah.c1 h3'):null;
    setLoc(`<b>${esc(pn(lab('title',tt.num)))}</b> · ${esc(pn(tt.name[li]))}${isArt?` · <b class="la">${esc(artLab(id))}</b>`:''}`,'#'+tt.id);
    const i=isArt?order.indexOf(id)+1:order.indexOf('art-'+tt.a[0]);
    setProgress(i);
    const cnt=document.getElementById('cnt');if(cnt)cnt.textContent=isArt?`${i} / ${order.length}`:'';
    document.title=(isArt?`${artLab(id)} · ${nameEl?nameEl.textContent:''}`:`${pn(lab('title',tt.num))} · ${pn(tt.name[li])}`)+' — '+t('constitution');
    const h=hashFor(id,cols);
    if(location.hash!==h)history.replaceState(null,'',h);
    if(isArt)savePos(cols[0],id);
  };
  const onScroll=()=>{if(!tick)tick=requestAnimationFrame(track);};
  addEventListener('scroll',onScroll,psig);
  document.addEventListener('cx:script',()=>{cur=null;track();},sig);
  track();
  const again=(extra={})=>show({title:tt.id,art:cur&&cur.startsWith('art-')?cur:null,...extra},true,anchorNow()).then(v=>{S.view=v;return v;});

  // tabs: on a wide screen they add or remove a column; on a narrow one they change the text shown
  const toText=(l,dir)=>{if(l===cols[0])return;S.mtext=l;again({slide:dir});};
  rd.querySelector('.chips').addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b)return; const l=b.dataset.c;
    if(mobile){toText(l,LANGS.indexOf(l)>LANGS.indexOf(cols[0])?1:-1);return;}
    let c=S.cols.slice();
    if(c.includes(l)){if(c.length===1)return;c=c.filter(x=>x!==l);}
    else c=[c[0],...LANGS.filter(x=>x!==c[0]&&(c.includes(x)||x===l))];
    S.cols=c;saveCols();
    again().then(()=>{const nb=document.querySelector(`.chips [data-c="${l}"]`);if(nb)nb.focus({preventScroll:true});});
  },sig);
  if(mobile){
    // horizontal swipe: next or previous text, on the same paragraph
    let sx=0,sy=0,st=0;
    sheet.addEventListener('touchstart',e=>{const p=e.touches[0];sx=p.clientX;sy=p.clientY;st=e.target.closest('input,svg,.seats')?0:Date.now();},psig);
    sheet.addEventListener('touchend',e=>{
      if(!st)return;const p=e.changedTouches[0], dx=p.clientX-sx, dy=p.clientY-sy;
      if(Math.abs(dx)<56||Math.abs(dx)<Math.abs(dy)*2||Date.now()-st>700)return;
      const i=LANGS.indexOf(cols[0]), n=LANGS[i+(dx<0?1:-1)];
      if(n)toText(n,dx<0?1:-1);
    },psig);
  }
  // j / k: next and previous article
  addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||!document.getElementById('pal').hidden)return;
    const d=e.key==='j'?1:e.key==='k'?-1:0; if(!d)return;
    const i=order.indexOf(cur&&cur.startsWith('art-')?cur:'art-'+tt.a[0])+(cur&&cur.startsWith('art-')?d:(d>0?0:-1));
    if(order[i]){e.preventDefault();location.hash=hashFor(order[i],cols);}
  },sig);
  // instruments: loaded when their article comes near
  const io=new IntersectionObserver(es=>es.forEach(async e=>{
    if(!e.isIntersecting)return;io.unobserve(e.target);
    const m=await import('./instr.js');
    m.mount(e.target,e.target.dataset.ins,(u,cls,mk,artId)=>{
      document.querySelectorAll(`#${artId||e.target.dataset.art} .cell[data-u="${u}"]`).forEach(c=>{
        c.classList.remove('ok','ko','na','on');if(cls)c.classList.add(cls);
        if(mk)c.dataset.mk=mk;else delete c.dataset.mk;});
    });
  }),{rootMargin:'700px 0px'});
  document.querySelectorAll('.rd .ins').forEach(el=>io.observe(el));
  let rz=0;
  addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{
    const m=narrow(), L=layout(colsNow(m).length,m);
    if(m!==mobile||L.mg!==rd.classList.contains('has-mg')||L.hs!==rd.classList.contains('hs'))again();
  },160);},sig);
  return ()=>{ac.abort();io.disconnect();cancelAnimationFrame(tick);};
}
