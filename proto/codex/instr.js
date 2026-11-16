/* Codex — active margins. Each instrument applies the article it sits beside, to the letter,
   on portail/data (through data/instr.json). What the text leaves open is said in the margin
   (“Assumption”) and listed in NOTES.md. `mark(unit, state, label)` writes the result on the
   paragraphs of the article, in every text shown. */
import {S,load,esc,t,tx,pn,fmtN,fmtP,stateOf} from './app.js';
import {drawMap} from './map.js';

const LI={en:0,zap:1,sre:2,ist:3};
const PORDER=['slo','hrv','srb','bos','cng','mkd','bul'];           // order of Article 110
let DATA=null;
async function data(){
  if(DATA)return DATA;
  const d=await load('instr.json');
  const reg={};                                                       // registers: see as_reg
  for(const s of d.states)if(s.t==='T')reg[s.p]=(reg[s.p]||0)+s.pop;
  const tot=Object.values(reg).reduce((a,b)=>a+b,0);
  return DATA={...d,reg,tot};
}
const pname=k=>pn(S.core.pe[k][LI[S.lang]]);
const as=(...keys)=>`<p class="as"><b>${tx('assumption')}</b>${keys.map(k=>tx(k)).join(' ')}</p>`;
const sign=ok=>ok?'✓':'✕';

const KIND=()=>({dk110,dk111,reg:regs,eq,sl,map1,cap,alarm});
export async function mount(el,kind,mark){
  const d=await data();
  KIND()[kind](el,d,mark);
  if(!el._wired){el._wired=true;document.addEventListener('cx:script',()=>{if(el.isConnected)KIND()[kind](el,d,mark);});}
}
const reset=()=>`<button type="button" class="rs" aria-label="${esc(t('back'))}"><span aria-hidden="true">↺</span></button>`;
const stLine=c=>{const s=stateOf(c);return `<a class="sl" href="#state-${c}" data-follow translate="no">${c}</a> <strong>${esc(pn(s[1]))}</strong>`;};

/* ---------- Articles 110 and 111: five of seven, and the double key ---------- */
function switches(el,d,state){
  return `<div class="legend" aria-hidden="true" translate="no">✕ ◂ ▸ ✓</div>
  <div class="rows">${PORDER.map(k=>`<button type="button" class="sw" role="switch" aria-checked="${!!state[k]}" data-k="${k}">
    <span class="kn"></span><span class="nm">${esc(pname(k))}<i style="--w:${(d.reg[k]/d.tot*100).toFixed(1)}%"></i></span>
    <span class="pc">${fmtP(d.reg[k]/d.tot)}</span></button>`).join('')}</div>`;
}
function tally(d,state){
  const yes=PORDER.filter(k=>state[k]); const share=yes.reduce((a,k)=>a+d.reg[k],0)/d.tot;
  return {n:yes.length,share,maj:share>.5};
}
function dk110(el,d,mark){
  const st=el._st||(el._st={slo:1,hrv:1,srb:0,bos:1,cng:1,mkd:1,bul:0}), init={...el._init||(el._init={...st})};
  const draw=()=>{
    const {n,share,maj}=tally(d,st);
    el.innerHTML=`<div class="ih"><div class="big ${n>=5?'ok':'ko'}">${n} / 7<small>≥ 5 ${sign(n>=5)}</small></div>
      <div class="big ${maj?'ok':'ko'}">${fmtP(share)}<small>&gt; 50 % ${sign(maj)} · ${tx('registered')}</small></div></div>
      ${switches(el,d,st)}${as('as_reg','as_plen')}${reset()}`;
    // units of Article 110: 3 = five of seven, 4 = the double key, 5 = six of seven, or all seven
    mark(3,n>=5?'ok':'ko',`${n} / 7 ${sign(n>=5)}`);
    mark(4,n>=5?(maj?'ok':'ko'):'na',`${fmtP(share)} ${n>=5?sign(maj):''}`.trim());
    mark(5,n>=6?'ok':'ko',`6 / 7 ${sign(n>=6)} · 7 / 7 ${sign(n===7)}`);
  };
  wire(el,st,init,draw);draw();
}
function dk111(el,d,mark){
  const st=el._st||(el._st={slo:1,hrv:1,srb:1,bos:1,cng:0,mkd:0,bul:0}), init={...el._init||(el._init={...st})};
  const draw=()=>{
    const {n,share,maj}=tally(d,st), cons=n===7, a=(n>=4&&maj), b=n>=5, adopted=cons||a||b, against=7-n;
    el.innerHTML=`<div class="ih"><div class="big ${adopted?'ok':'ko'}">${n} / 7<small>${cons?'7 / 7':b?'≥ 5':'≥ 4'} ${sign(adopted)}</small></div>
      <div class="big ${maj?'ok':'ko'}">${fmtP(share)}<small>&gt; 50 % ${sign(maj)} · ${tx('registered')}</small></div></div>
      ${switches(el,d,st)}${as('as_reg')}${reset()}`;
    // units of Article 111: 2 = consensus, 3 = four with the majority of the enrolled, or five, 4 = thirty days
    mark(2,cons?'ok':'ko',`7 / 7 ${sign(cons)}`);
    mark(3,cons?'na':(a||b)?'ok':'ko',cons?'–':`${n} + ${fmtP(share)} ${sign(a)} · ${n} ≥ 5 ${sign(b)}`);
    const susp=!cons&&(a||b)&&against>=3;
    mark(4,susp?'on':'na',`${against} ≥ 3 ${sign(susp)}`);
  };
  wire(el,st,init,draw);draw();
}
function wire(el,st,init,draw){
  if(el._w)return;el._w=true;
  el.addEventListener('click',e=>{
    const b=e.target.closest('.sw');
    if(b){st[b.dataset.k]=st[b.dataset.k]?0:1;const k=b.dataset.k;draw();const nb=el.querySelector(`.sw[data-k="${k}"]`);if(nb)nb.focus({preventScroll:true});return;}
    if(e.target.closest('.rs')){Object.assign(st,init);draw();el.querySelector('.rs').focus({preventScroll:true});}
  });
}
/* ---------- Article 115 bis: the annual count ---------- */
function regs(el,d,mark){
  el.innerHTML=`<table><tbody>${PORDER.map(k=>`<tr><td>${esc(pname(k))}</td><td class="r">${fmtN(d.reg[k])}</td><td class="r">${fmtP(d.reg[k]/d.tot)}</td></tr>`).join('')}
    <tr class="tot"><td>${tx('total')}</td><td class="r">${fmtN(d.tot)}</td><td class="r">${fmtP(1,0)}</td></tr></tbody></table>${as('as_reg')}`;
  mark(6,'on','');                                    // unit 6: the yearly count of each register
}

/* ---------- Article 132: floor of 85 %, ceiling of 30 % ---------- */
function equalise(S52,floor,cap){
  const P=S52.reduce((a,s)=>a+s.pop,0), mu=S52.reduce((a,s)=>a+s.pop*s.gdp,0)/P;
  const need=S52.reduce((a,s)=>a+s.pop*Math.max(0,floor*mu-s.gdp),0);
  const sur=S52.reduce((a,s)=>a+s.pop*Math.max(0,s.gdp-mu),0);
  const rNeed=sur?need/sur:0, rate=Math.min(rNeed,cap), pot=rate*sur;
  let level=floor*mu;
  if(rNeed>cap+1e-12){                 // the pot is short: it raises the poorest to one common level
    const asc=[...S52].sort((a,b)=>a.gdp-b.gdp); let lo=asc[0].gdp, hi=floor*mu;
    for(let i=0;i<60;i++){const L=(lo+hi)/2, c=asc.reduce((a,s)=>a+s.pop*Math.max(0,L-s.gdp),0);if(c>pot)hi=L;else lo=L;}
    level=lo;
  }
  const rows=S52.map(s=>({...s,after:s.gdp>mu?s.gdp-rate*(s.gdp-mu):Math.max(s.gdp,level)}));
  return {mu,rNeed,rate,level,rows,ok:rNeed<=cap+1e-12};
}
function eq(el,d,mark){
  const st=el._st||(el._st={f:85,c:30,sel:null});
  const S52=d.states.filter(s=>s.t!=='M'&&s.gdp).sort((a,b)=>b.gdp-a.gdp);
  const W=300,RH=7,T=16,H=T+S52.length*RH+6, xmax=2.4, X=v=>4+v/xmax*(W-8);
  el.classList.add('eq');
  el.innerHTML=`<div class="ih"><div class="big" id="eqA"></div><div class="big" id="eqB"></div></div>
    <div class="sl-row"><label for="eqf" translate="no">b.</label><input id="eqf" type="range" min="50" max="100" step="1" value="${st.f}" aria-label="${esc(t('art_n','132 b'))}"><output id="eqfo"></output></div>
    <div class="sl-row"><label for="eqc" translate="no">c.</label><input id="eqc" type="range" min="0" max="100" step="1" value="${st.c}" aria-label="${esc(t('art_n','132 c'))}"><output id="eqco"></output></div>
    <svg viewBox="0 0 ${W} ${H}" role="listbox" tabindex="0" aria-label="${esc(t('equal_formula'))}"></svg>
    <div class="det" id="eqd" aria-live="polite"></div><div class="mapbox" id="eqm"></div>${as('as_eq')}<p class="as" id="eqg" hidden>${tx('as_gap')}</p>
    ${reset()}`;
  let map=null, last=null;
  drawMap(el.querySelector('#eqm'),{label:t('equal_formula'),pick:c=>{if(c&&S52.some(s=>s.c===c))pick(c);}}).then(m=>{map=m;if(last)paint(last);});
  const paint=r=>{last=r;if(!map)return;
    const by=Object.fromEntries(r.rows.map(s=>[s.c,(s.after-s.gdp)/r.mu]));       // light: receives · dark: contributes
    map.paint(c=>by[c]==null?null:Math.max(.06,Math.min(1,.42-by[c]*1.6)));map.select(st.sel);};
  const svg=el.querySelector('svg'), q=id=>el.querySelector('#'+id);
  const draw=()=>{
    const r=equalise(S52,st.f/100,st.c/100), mu=r.mu;
    q('eqfo').textContent=st.f+' %';q('eqco').textContent=st.c+' %';
    q('eqf').style.setProperty('--v',(st.f-50)/50*100+'%');q('eqc').style.setProperty('--v',st.c+'%');
    q('eqA').className='big '+(r.ok?'ok':'ko');
    q('eqA').innerHTML=`${fmtP(r.level/mu,1)}<small>b. ≥ ${st.f} % ${sign(r.ok)}</small>`;
    q('eqB').className='big ok';
    q('eqB').innerHTML=`${fmtP(r.rate,1)}<small>c. ≤ ${st.c} % ✓${r.ok?'':` · ${st.f} % ⇒ ${fmtP(r.rNeed,1)}`}</small>`;
    q('eqg').hidden=r.ok;
    svg.innerHTML=`<line class="mu" x1="${X(1)}" x2="${X(1)}" y1="10" y2="${H}"/><text x="${X(1)+3}" y="8">100</text>
      <line class="fl" x1="${X(st.f/100)}" x2="${X(st.f/100)}" y1="10" y2="${H}"/><text x="${X(st.f/100)-3}" y="8" text-anchor="end">${st.f}</text>
      <text x="${X(2)}" y="8" text-anchor="middle">200</text><line class="ax" x1="${X(2)}" x2="${X(2)}" y1="10" y2="${H}"/>`+
      r.rows.map((s,i)=>{const y=T+i*RH+RH/2;
        return `<g class="row${st.sel===s.c?' sel':''}" data-c="${s.c}"><rect class="hit" x="0" y="${y-RH/2}" width="${W}" height="${RH}"/>
        <line class="ln" x1="${X(s.gdp/mu)}" x2="${X(s.after/mu)}" y1="${y}" y2="${y}"/>
        <circle class="b0" cx="${X(s.gdp/mu)}" cy="${y}" r="2.1"/><circle class="a1" cx="${X(s.after/mu)}" cy="${y}" r="2.4"/></g>`;}).join('');
    const s=r.rows.find(x=>x.c===st.sel);
    q('eqd').innerHTML=s?`${stLine(s.c)}<br>
      <b>${fmtN(s.gdp)}</b> → <b>${fmtN(Math.round(s.after))}</b> PPS · ${fmtP(s.gdp/mu,0)} → ${fmtP(s.after/mu,0)}`
      :`<span translate="no">100 %</span> = <b>${fmtN(Math.round(mu))}</b> PPS · ${tx('states')} <b>${S52.length}</b>`;
    paint(r);
    // units of Article 132: 2 = b, the floor; 3 = c, the ceiling
    mark(2,r.ok?'ok':'ko',r.ok?`${fmtP(r.level/mu,1)} ✓`:`${fmtP(r.level/mu,1)} ✕ · ${st.f} % ⇒ c. ${fmtP(r.rNeed,1)}`);
    mark(3,'ok',`${fmtP(r.rate,1)} ≤ ${st.c} % ✓`);
  };
  q('eqf').addEventListener('input',e=>{st.f=+e.target.value;draw();});
  q('eqc').addEventListener('input',e=>{st.c=+e.target.value;draw();});
  const pick=c=>{st.sel=c;draw();};
  svg.addEventListener('pointermove',e=>{const g=e.target.closest('.row');if(g&&g.dataset.c!==st.sel)pick(g.dataset.c);});
  svg.addEventListener('click',e=>{const g=e.target.closest('.row');if(g)pick(g.dataset.c);});
  svg.addEventListener('keydown',e=>{
    const i=S52.findIndex(s=>s.c===st.sel);
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();pick(S52[Math.max(0,Math.min(S52.length-1,i+(e.key==='ArrowDown'?1:-1)))].c);}
    else if(e.key==='Enter'&&st.sel)location.hash='state-'+st.sel;});
  el.querySelector('.rs').addEventListener('click',()=>{st.f=85;st.c=30;st.sel=null;q('eqf').value=85;q('eqc').value=30;draw();});
  draw();
}

/* ---------- Article 103: 250 seats, Sainte-Laguë, 2 to 20 ---------- */
export function seats(rows,total=250){
  const lim=r=>[r.t==='M'?1:2,r.t==='M'?Infinity:20];
  const at=D=>rows.map(r=>{const [lo,hi]=lim(r);return Math.min(hi,Math.max(lo,Math.round(r.pop/D)));});
  let lo=1,hi=1e7,D=0,s=[];
  for(let i=0;i<200;i++){D=(lo+hi)/2;s=at(D);const n=s.reduce((a,b)=>a+b,0);if(n>total)lo=D;else if(n<total)hi=D;else break;}
  return {D,rows:rows.map((r,i)=>{const nat=Math.round(r.pop/D),[l,h]=lim(r);return {...r,s:s[i],floor:nat<l,cap:nat>h};}),sum:s.reduce((a,b)=>a+b,0)};
}
function sl(el,d,mark){
  const st=el._st||(el._st={sel:null,f:{}});
  const base=seats(d.states.map(s=>({...s}))), b0=Object.fromEntries(base.rows.map(r=>[r.c,r.s]));
  const pct=c=>Math.round(((st.f[c]||1)-1)*100);
  el.innerHTML=`<div class="ih"></div><div class="mapbox"></div><div class="det" aria-live="polite"></div><div class="seats"></div>${as('as_sl')}${reset()}`;
  const q=c=>el.querySelector(c);
  let map=null, lastRows=null;
  drawMap(q('.mapbox'),{label:t('kseats'),pick:c=>{if(c&&c!==st.sel){st.sel=c;draw();}}}).then(m=>{map=m;if(lastRows)paintMap();});
  const paintMap=()=>{if(!map)return;const by=Object.fromEntries(lastRows.map(r=>[r.c,r.s]));map.paint(c=>.08+.92*by[c]/20);map.select(st.sel);};
  const draw=(dragging)=>{
    const cur=seats(d.states.map(s=>({...s,pop:Math.round(s.pop*(st.f[s.c]||1))})));
    const rows=[...cur.rows].sort((a,b)=>b.s-a.s||b.pop-a.pop), nf=rows.filter(r=>r.floor).length, nc=rows.filter(r=>r.cap).length;
    const sel=rows.find(r=>r.c===st.sel);
    q('.ih').innerHTML=`<div class="big">${cur.sum}<small>${tx('delegates')}</small></div>
      <div class="big">${rows.length}<small>${tx('constituencies')}</small></div>
      <div class="big">÷ ${fmtN(Math.round(cur.D/100)*100)}<small translate="no">min 2 : ${nf} · max 20 : ${nc}</small></div>`;
    lastRows=rows;paintMap();
    q('.seats').innerHTML=rows.map(r=>`<button type="button" data-c="${r.c}" aria-pressed="${r.c===st.sel}" class="${r.floor||r.cap?'lim':''}${r.s!==b0[r.c]?' chg':''}" title="${esc(pn(r.n))}" translate="no" aria-label="${r.c} ${esc(pn(r.n))}: ${r.s}">
        <span>${r.c}</span><i style="--w:${r.s/20*100}%"></i><b>${r.s}</b></button>`).join('');
    const info=sel?`${stLine(sel.c)} · ${tx('inhab',fmtN(sel.pop))} · <b>${sel.s}</b>${sel.floor?` · <span translate="no">min ${sel.t==='M'?1:2}</span>`:''}${sel.cap?` · <span translate="no">max 20</span>`:''}`:'';
    if(dragging&&sel){q('.det .inf').innerHTML=info;q('.det output').textContent=`${pct(sel.c)===0?'±':pct(sel.c)>0?'+':'−'}${Math.abs(pct(sel.c))} %`;}
    else{
      q('.det').innerHTML=sel?`<div class="inf">${info}</div>
        <div class="sl-row"><label for="slp" aria-hidden="true">±</label><input id="slp" type="range" min="-60" max="200" step="5" value="${pct(sel.c)}" aria-label="${esc(t('population'))} ${sel.c}"><output>${pct(sel.c)===0?'±':pct(sel.c)>0?'+':'−'}${Math.abs(pct(sel.c))} %</output></div>`
        :`${tx('per_delegate')}: <b>${fmtN(Math.round(d.states.reduce((a,s)=>a+s.pop,0)/250/100)*100)}</b>`;
      const sp=q('#slp');
      if(sp)sp.addEventListener('input',e=>{st.f[st.sel]=1+e.target.value/100;draw(true);});
    }
    const sp=q('#slp');if(sp)sp.style.setProperty('--v',(+sp.value+60)/260*100+'%');
    // units of Article 103: 2 = one constituency per State, two to twenty; 3 = Brčko and Mostar
    mark(2,'on',`min 2 : ${nf} · max 20 : ${nc}`);
    mark(3,'on',rows.filter(r=>r.t==='M').map(r=>r.s).join(' · '));
  };
  el.onclick=e=>{
    const b=e.target.closest('.seats button');
    if(b){st.sel=st.sel===b.dataset.c?null:b.dataset.c;draw();const nb=el.querySelector(`.seats [data-c="${b.dataset.c}"]`);if(nb)nb.focus({preventScroll:true});return;}
    if(e.target.closest('.rs')){st.sel=null;st.f={};draw();}
  };
  draw();
}

/* ---------- Article 1 bis: the States, list and map tied together ---------- */
function map1(el,d,mark){
  el.innerHTML=`<div class="mapbox"></div><div class="det" aria-live="polite"></div>`;
  const det=el.querySelector('.det'), art=()=>document.getElementById('art-1bis');
  let cur=null, map=null;
  const show=c=>{
    if(c===cur)return;cur=c;
    art()&&art().querySelectorAll('.cell.pk').forEach(x=>x.classList.remove('pk'));
    if(map)map.select(c);
    if(!c){det.innerHTML=`<b>48</b> ${tx('territorial')} · <b>6</b> ${tx('fed_muni')}`;return;}
    const s=stateOf(c);
    det.innerHTML=`${stLine(c)}<br>${tx('t_'+s[2])}${s[3]!=='fed'?' · '+esc(pn(S.core.pe[s[3]][LI[S.lang]])):''}${s[5]?' · '+tx('inhab',fmtN(s[5])):''}`;
    art()&&art().querySelectorAll(`a.sl[href="#state-${c}"]`).forEach(a=>{const cell=a.closest('.cell');if(cell)cell.classList.add('pk');});
  };
  drawMap(el.querySelector('.mapbox'),{label:t('states'),fill:c=>({T:.3,F:1,M:.62})[stateOf(c)[2]],pick:show}).then(m=>{map=m;});
  show(null);cur=null;
  if(!el._w){el._w=true;const A=art();
    if(A){const over=e=>{const a=e.target.closest&&e.target.closest('a.sl');if(a)show(a.getAttribute('href').slice(7));};
      A.addEventListener('mouseover',over);A.addEventListener('focusin',over);}}
}
/* ---------- Article 1 ter: four capitals ---------- */
function cap(el,d,mark){
  const U={'SA-92':1,'BG-91':2,'ZG-94':3,'SF-93':4};          // units of Article 1 ter, letters a to d
  el.innerHTML=`<div class="mapbox"></div><div class="det" aria-live="polite"></div>`;
  const det=el.querySelector('.det'); let map=null;
  const show=c=>{
    for(const u of Object.values(U))mark(u,null,'');
    if(map)map.select(U[c]?c:null);
    if(!c||!U[c]){det.innerHTML=Object.keys(U).map(k=>stLine(k)).join(' · ');return;}
    const s=stateOf(c);
    det.innerHTML=`${stLine(c)}<br>${esc(pn((S.core.ch[s[4]]||[s[4]])[LI[S.lang]]||s[4]))}`;
    mark(U[c],'on','');
  };
  drawMap(el.querySelector('.mapbox'),{label:t('states'),fill:c=>U[c]?1:.14,labels:Object.keys(U),pick:show}).then(m=>{map=m;});
  show(null);
}
/* ---------- Article 109 b and 110 ter: the alarm bell ---------- */
function alarm(el,d,mark){
  const st=el._st||(el._st={k:'cng',v:7,day:12,com:8,mem:1,kg:150});
  const init={k:'cng',v:7,day:12,com:8,mem:1,kg:150};
  const row=(id,lab,min,max,val)=>`<div class="sl-row"><label for="al${id}" translate="no">${lab}</label><input id="al${id}" data-f="${id}" type="range" min="${min}" max="${max}" step="1" value="${val}" aria-label="${esc(lab)}"><output></output></div>`;
  el.innerHTML=`<div class="ih"></div>
    <div class="pk7" role="group" aria-label="${esc(t('peoples'))}">${PORDER.map(k=>`<button type="button" data-k="${k}" aria-pressed="${k===st.k}">${esc(pname(k))}</button>`).join('')}</div>
    ${row('v','≥ 7 / 10',0,10,st.v)}${row('day','≤ 30',1,60,st.day)}
    <div class="k3" translate="no">${esc(t('art_n','110 ter'))}</div>
    ${row('com','≥ 8 / 14',0,14,st.com)}
    <button type="button" class="sw" role="switch" aria-checked="${!!st.mem}" data-mem><span class="kn"></span><span class="nm" id="almem"></span><span class="pc" translate="no">1 / 14</span></button>
    ${row('kg','≥ 167 / 250',0,250,st.kg)}
    ${as('as_al')}${reset()}`;
  const q=c=>el.querySelector(c);
  const draw=()=>{
    const raised=st.v>=7&&st.day<=30, comp=raised&&st.com>=8&&!!st.mem, two=st.kg>=167;
    q('.ih').innerHTML=`<div class="big ${raised?'ok':'ko'}">${st.v} / 10<small translate="no">≥ ⅔ ${sign(st.v>=7)} · ${st.day} ≤ 30 ${sign(st.day<=30)}</small></div>
      <div class="big ${!raised?'':comp?'ok':two?'ok':'ko'}">${!raised?'–':comp?st.com+' / 14':st.kg+' / 250'}<small translate="no">${!raised?'':comp?'≥ 8 '+sign(true):'≥ 167 '+sign(two)}</small></div>`;
    q('#almem').textContent=pname(st.k);
    el.querySelectorAll('.pk7 button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===st.k));
    for(const i of el.querySelectorAll('input[type=range]')){const f=i.dataset.f;i.nextElementSibling.textContent=st[f];
      i.style.setProperty('--v',(st[f]-i.min)/(i.max-i.min)*100+'%');}
    q('[data-mem]').setAttribute('aria-checked',!!st.mem);
    // Article 109, unit 14 (b): alarm raised = law suspended and referred to the committee
    mark(14,raised?'on':'na',`${st.v} / 10 ${sign(st.v>=7)} · ${st.day} ≤ 30 ${sign(st.day<=30)}`);
    // Article 110 ter: 1 = the committee is seized, 2 = majority including the member, 4 = fails, 6 = two thirds
    mark(1,raised?'on':null,'','art-110ter');
    mark(2,!raised?null:comp?'ok':'ko',raised?`${st.com} / 14 ${sign(st.com>=8)} · 1 / 14 ${sign(!!st.mem)}`:'','art-110ter');
    mark(4,raised&&!comp?'on':null,'','art-110ter');
    mark(6,raised&&!comp?(two?'ok':'ko'):null,raised&&!comp?`${st.kg} / 250 ${sign(two)}`:'','art-110ter');
  };
  el.oninput=e=>{const f=e.target.dataset.f;if(f){st[f]=+e.target.value;draw();}};
  el.onclick=e=>{
    const b=e.target.closest('.pk7 button');if(b){st.k=b.dataset.k;draw();return;}
    if(e.target.closest('[data-mem]')){st.mem=st.mem?0:1;draw();return;}
    if(e.target.closest('.rs')){Object.assign(st,init);el.querySelectorAll('input[type=range]').forEach(i=>i.value=st[i.dataset.f]);draw();}
  };
  draw();
}
