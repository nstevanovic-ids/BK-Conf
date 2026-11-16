/* Codex — the annex of a State, opened from the articles that concern it, and the index of the 54.
   The heading and the figures come from data/core.json and are on screen at once; the flag, the
   articles, the map and the municipalities follow. */
import {S,load,esc,t,tx,pn,px,fmtN,artNum,swap,setLoc,setProgress,stateOf,slug} from './app.js';
import {seats} from './instr.js';
import {drawMap} from './map.js';

const LI={en:0,zap:1,sre:2,ist:3};
const PORDER=['slo','hrv','srb','bos','cng','mkd','bul'];
const $m=()=>document.getElementById('main');
const flag=(c,w)=>{const s=stateOf(c);return s&&s[10]?`<img src="flags/${c}.png" width="${s[10]}" height="${s[11]}" alt="" loading="lazy" decoding="async"${w?` style="width:${w}px"`:''}>`:'<span></span>';};
const plainText=h=>h.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');

export async function show(r){
  if(r.v==='states')return index();
  const s=stateOf(r.code), li=LI[S.lang];
  if(!s){await swap(()=>{$m().innerHTML=`<div class="wrap st"><h1>${tx('state_nf')}</h1><p class="nfh" translate="no">#state-${esc(r.code)}</p><p><a class="btn" href="#states">${tx('all_states')}</a></p></div>`;scrollTo(0,0);});
    document.title=t('notfound');setLoc('');setProgress(null);S.here='home';return {};}
  const [c,n,ty,pe,ch,pop,area,mun,gdp,eu,fw,fh]=s;
  const K=seats(S.core.st.map(x=>({c:x[0],t:x[2],pop:x[5]}))), my=K.rows.find(x=>x.c===c);
  const dens=pop&&area?pop/area:null;
  const i=S.core.st.indexOf(s), prev=S.core.st[i-1], next=S.core.st[i+1];
  const h=`<div class="wrap st">
  <div class="top">
    <div class="tt"><div class="eyebrow">${tx('t_'+ty)} · <span class="code" translate="no">${c}</span></div>
      <h1>${px(n)}</h1>
      <div class="sub">${ty==='T'?`<span>${tx('people')} <b>${px(S.core.pe[pe][li])}</b></span><span>${tx('seat')} <b>${px(ch)}</b></span>`
        :`<span><b>${px((S.core.ch[ch]||[ch])[li]||ch)}</b></span>`}</div></div>
    <figure id="stfig" style="--fw:${fw||600}">${fw?`<img src="flags/${c}.png" width="${fw}" height="${fh}" alt="${esc(pn(n))}">`:''}<figcaption id="stnote"></figcaption></figure>
    <dl class="kd">
      <div><dt>${tx('population')}</dt><dd>${fmtN(pop)}<small id="stsrc"></small></dd></div>
      <div><dt>${tx('area')}</dt><dd>${tx('km2',fmtN(area))}</dd></div>
      ${dens?`<div><dt>${tx('density')}</dt><dd>${tx('perkm2',fmtN(Math.round(dens)))}</dd></div>`:''}
      ${mun?`<div><dt>${tx('municipalities')}</dt><dd>${fmtN(mun)}</dd></div>`:''}
      ${gdp?`<div><dt>${tx('gdp')}</dt><dd>${tx('pps',fmtN(gdp))}<small>${tx('eu',eu)}<span id="stgsrc"></span></small></dd></div>`:''}
      ${my?`<div><dt>${tx('kseats')}</dt><dd>${my.s}<small><a class="rf pad" href="#art-103" data-follow>${tx('art_n','103')}</a></small></dd></div>`:''}
    </dl>
  </div>
  <div class="cols">
    <section><h2>${tx('in_const')}</h2><div id="start" class="al-list"></div>
      <div id="stcat"></div><div id="staut"></div>
      <h2 class="h2b">${tx('municipalities')}</h2><ul class="munl" id="stmun"></ul>
    </section>
    <section><h2>${tx('location')}</h2>
      <div class="mapbox big" id="stmap"></div><div class="det" id="stdet" aria-live="polite"></div>
      <div class="nbl" id="stnb"></div><div id="stsame"></div><div id="stcoa"></div>
    </section>
  </div>
  <nav class="stnav">${prev?`<a href="#state-${prev[0]}"><span aria-hidden="true">←</span><small translate="no">${prev[0]}</small>${px(prev[1])}</a>`:'<span></span>'}
    <a href="#states">${tx('all_states')}</a>
    ${next?`<a href="#state-${next[0]}">${px(next[1])}<small translate="no">${next[0]}</small><span aria-hidden="true">→</span></a>`:'<span></span>'}</nav>
  </div>`;
  S.vtTarget=name=>name==='stcode'?document.querySelector('.st .code'):name==='stflag'?document.querySelector('#stfig img'):null;
  await swap(()=>{$m().innerHTML=h;scrollTo(0,0);});
  document.title=`${c} ${pn(n)} — ${t('states')}`;
  S.here='state-'+c;setLoc(`<b>${esc(t('states'))}</b> · <span translate="no">${c}</span> ${esc(pn(n))}`,'#states');setProgress(null);
  const here=()=>S.here==='state-'+c&&document.getElementById('start');
  const q=id=>document.getElementById(id);

  // 2 — the record of the State: note of the flag, sources, articles, neighbours (after the first paint)
  const fimg=document.querySelector('#stfig img');
  const ready=new Promise(res=>{if(!fimg||fimg.complete)res();else{fimg.onload=fimg.onerror=res;setTimeout(res,2500);}}).then(()=>new Promise(res=>setTimeout(res,350)));
  const idle=f=>ready.then(f);   // the heading, the figures and the flag first; the rest must not compete with them
  idle(()=>load('states.json').then(async D=>{
    const d=D.s.find(x=>x.c===c); if(!here())return;
    const srcT=x=>x?(li&&D.src[x]?pn(D.src[x][li-1]):x):'';
    q('stnote').innerHTML=px((d.note[li]??d.note[0])||'');
    q('stsrc').textContent=srcT(d.src);
    if(q('stgsrc'))q('stgsrc').textContent=' · '+srcT(d.gsrc);
    q('stcat').innerHTML=`<div class="k2">${tx('t_'+ty)}</div><div class="chipl">${d.cat.map(a=>`<a class="rf" href="#${a}" data-follow translate="no">${esc(artNum(a))}</a>`).join('')}</div>`;
    if(d.aut.length)q('staut').innerHTML=`<div class="k2">${tx('autonomy')}</div><div class="al-list">${d.aut.map(a=>`<a href="#art-1quinquies" data-follow><b translate="no" style="font-size:1.05rem">${esc(a[0])}</b><div><strong>${px(a[1])}</strong></div></a>`).join('')}</div>`;
    const nrow=x=>`<a href="#state-${x}" data-follow>${flag(x,52)}<b translate="no">${x}</b><strong>${px(stateOf(x)[1])}</strong></a>`;
    q('stnb').innerHTML=d.nb.map(nrow).join('');
    const same=S.core.st.filter(x=>(ty==='T'?x[3]===pe&&x[2]==='T':x[2]===ty)&&x[0]!==c&&!d.nb.includes(x[0])).map(x=>x[0]);
    if(same.length)q('stsame').innerHTML=`<div class="k2">${ty==='T'?px(S.core.pe[pe][li]):tx('t_'+ty)}</div><div class="nbl">${same.map(nrow).join('')}</div>`;
    if(d.coa)q('stcoa').innerHTML=`<div class="k2">${tx('coa')}</div><img class="coa" src="coa/${c}.webp" alt="" loading="lazy">`;
    // the outline enlarged, its neighbours in the tab order
    const det=q('stdet'), base=()=>{det.innerHTML=`<strong>${esc(pn(n))}</strong> · ${fmtN(d.nb.length)} <span aria-hidden="true">↔</span>`;};
    base();
    drawMap(q('stmap'),{label:t('location'),view:[c,...d.nb],sel:c,fill:x=>x===c?1:d.nb.includes(x)?.34:.1,
      pick:x=>{if(!x||x===c){base();return;}const o=stateOf(x);det.innerHTML=`<a class="sl" href="#state-${x}" data-follow translate="no">${x}</a> <strong>${esc(pn(o[1]))}</strong>`;}});
    // articles that name it, with the paragraph where they do
    const idx=await load(`idx.${S.lang}.json`);
    const tids=[...new Set(d.named.map(([a])=>S.core.toc.find(tt=>tt.a.includes(a.replace('art-',''))).id))];
    const files=await Promise.all(tids.map(id=>load(`t/${id}.${S.lang}.json`)));
    if(!here())return;
    const unit=(aid,u)=>{for(const f of files)for(const chp of f.ch)for(const a of chp.arts)if(a.id===aid){const x=a.u[u];return x?plainText(x[x.length-1]):'';}return '';};
    q('start').innerHTML=d.named.map(([aid,u])=>{const e=idx[aid]||['','',''], [nn,sfx]=e[0].split(' '), snip=unit(aid,u);
      return `<a href="#${aid}" data-follow><b translate="no">${nn}${sfx?`<small>${sfx}</small>`:''}</b><div><strong>${px(e[1])}</strong><span>${px(snip.length>230?snip.slice(0,snip.lastIndexOf(' ',230))+'…':snip)}</span></div></a>`;}).join('');
  }));
  // 3 — its municipalities (portail/data/opstine.json); the one asked for in the palette is marked
  idle(()=>load('opstine.json').then(O=>{
    if(!here())return;
    const list=O.m.filter(m=>m[2]===c).map(m=>m[0]).sort((a,b)=>a.localeCompare(b,'hr'));
    q('stmun').innerHTML=list.map(m=>{const sl=slug(m);
      return `<li id="mun-${sl}"${sl===r.mun?' class="hit" aria-current="true"':''}>${px(m)}</li>`;}).join('');
    const hit=q('stmun').querySelector('.hit');
    if(hit){const top=hit.getBoundingClientRect().top;if(top>innerHeight*.7)scrollTo({top:scrollY+top-innerHeight*.4});}
  }));
  return {};
}

async function index(){
  const li=LI[S.lang], ST=S.core.st;
  const row=x=>`<a href="#state-${x[0]}">${flag(x[0],44)}<b translate="no">${x[0]}</b><strong>${px(x[1])}</strong></a>`;
  const grp=(title,sub,list)=>`<section class="grp"><h2>${title}<small>${sub}</small></h2><div class="lst">${list.map(row).join('')}</div></section>`;
  const h=`<div class="wrap st six"><div class="eyebrow"><a class="rf pad" href="#art-1bis">${tx('art_n','1 bis')}</a> · ${tx('constitution')}</div>
    <h1>${tx('states')}</h1>
    <div class="sixmap"><div class="mapbox big" id="sixm"></div><div class="det" id="sixd" aria-live="polite"></div></div>
    ${PORDER.map(p=>{const l=ST.filter(x=>x[2]==='T'&&x[3]===p);return grp(px(S.core.pe[p][li]),`${l.length} · ${tx('territorial')}`,l);}).join('')}
    ${grp(tx('t_F'),'4',ST.filter(x=>x[2]==='F'))}
    ${grp(tx('t_M'),'2',ST.filter(x=>x[2]==='M'))}
  </div>`;
  S.vtTarget=null;
  await swap(()=>{$m().innerHTML=h;scrollTo(0,0);});
  document.title=`${t('states')} — ${t('constitution')}`;
  S.here='states';setLoc(`<b>${esc(t('states'))}</b>`,'#states');setProgress(null);
  const det=document.getElementById('sixd');
  drawMap(document.getElementById('sixm'),{label:t('states'),fill:c=>({T:.3,F:1,M:.62})[stateOf(c)[2]],pick:c=>{
    document.querySelectorAll('.six .lst a.pk').forEach(a=>a.classList.remove('pk'));
    if(!c){det.textContent='';return;}
    const s=stateOf(c);det.innerHTML=`<b translate="no">${c}</b> <strong>${esc(pn(s[1]))}</strong> · ${tx('t_'+s[2])}${s[3]!=='fed'?' · '+esc(pn(S.core.pe[s[3]][li])):''}`;
    const a=document.querySelector(`.six .lst a[href="#state-${c}"]`);if(a)a.classList.add('pk');}});
  return {};
}
