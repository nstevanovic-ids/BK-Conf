/* Codex — the map as a margin instrument. Geometry: data/map.json, built from portail/data/geo.json
   (54 entities, coverage-simplified, nothing hand-drawn). One canonical colour in a tonal scale:
   never a colour per people. Each entity is a link to its annex; one of them is in the tab order,
   the arrow keys move from one to the next (roving tabindex). */
import {S,load,esc,pn,stateOf} from './app.js';

let M=null;
export async function mapData(){return M||(M=await load('map.json'));}

/* opts: fill(code) -> 0..1 or null (not concerned) · view: [codes] to frame, or null for the whole
   · pick(code|null) on hover and focus · sel: selected code · labels: [codes] named on the map */
export async function drawMap(el,opts={}){
  const m=await mapData(), codes=Object.keys(m.e);
  let vb=[0,0,m.w,m.h];
  if(opts.view&&opts.view.length){
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    for(const c of opts.view){const b=m.e[c]&&m.e[c].b;if(!b)continue;x0=Math.min(x0,b[0]);y0=Math.min(y0,b[1]);x1=Math.max(x1,b[2]);y1=Math.max(y1,b[3]);}
    const px=(x1-x0)*.08+4,py=(y1-y0)*.08+4;vb=[x0-px,y0-py,x1-x0+2*px,y1-y0+2*py];
  }
  const sw=vb[2]/560;
  const order=opts.view?[...codes.filter(c=>!opts.view.includes(c)),...opts.view]:codes;
  el.innerHTML=`<svg class="mp" viewBox="${vb.map(v=>+v.toFixed(1)).join(' ')}" role="group" aria-label="${esc(opts.label||'')}" style="--sw:${sw.toFixed(2)}">${
    order.map(c=>{const s=stateOf(c)||[c,c];
      return `<a href="#state-${c}" data-c="${c}" data-follow tabindex="-1" aria-label="${c} ${esc(pn(s[1]))}"><path d="${m.e[c].d}"/></a>`;}).join('')}${
    (opts.labels||[]).map(c=>{const e=m.e[c],s=stateOf(c);return `<text x="${e.c[0]}" y="${e.c[1]-vb[2]*.022}" text-anchor="middle" font-size="${(vb[2]*.036).toFixed(1)}">${esc(pn(s[1]))}</text>`;}).join('')}</svg>`;
  const svg=el.firstChild, A=Object.fromEntries([...svg.querySelectorAll('a')].map(a=>[a.dataset.c,a]));
  let sel=null, tab=null;
  const setTab=c=>{if(tab&&A[tab])A[tab].tabIndex=-1;tab=c;if(A[c])A[c].tabIndex=0;};
  const api={
    paint(fill){for(const c of codes){const v=fill?fill(c):null, a=A[c];
      a.classList.toggle('off',v==null);a.style.setProperty('--v',v==null?0:Math.max(0,Math.min(1,v)).toFixed(3));}},
    select(c){if(sel&&A[sel])A[sel].classList.remove('sel');sel=c;if(c&&A[c]){A[c].classList.add('sel');svg.append(A[c]);svg.querySelectorAll('text').forEach(t=>svg.append(t));}},
    el:svg};
  api.paint(opts.fill||(()=>.3));
  setTab(opts.sel&&A[opts.sel]?opts.sel:(opts.view?opts.view[0]:codes[0]));
  if(opts.sel)api.select(opts.sel);
  const pick=c=>{if(opts.pick)opts.pick(c);};
  svg.addEventListener('pointerover',e=>{const a=e.target.closest('a');if(a)pick(a.dataset.c);});
  svg.addEventListener('pointerleave',()=>pick(null));
  svg.addEventListener('focusin',e=>{const a=e.target.closest('a');if(a){setTab(a.dataset.c);pick(a.dataset.c);}});
  svg.addEventListener('keydown',e=>{
    const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key]; if(!d)return;
    e.preventDefault();
    const list=opts.view&&opts.view.length>1?opts.view:codes, i=list.indexOf(tab);
    const c=list[(i+d+list.length)%list.length];setTab(c);A[c].focus({preventScroll:true});
  });
  return api;
}
