/* Codex — Cyrillic display and the glyph-by-glyph switch.
   Part 1 is ported as is from portail/index.html (cyrWord, cyrPlain, cyrText, toCyr, cyr2lat):
   the Latin v3 text stays the only source, the Cyrillic is derived on the fly.
   Part 2 aligns each Latin chunk with its Cyrillic chunk (a digraph may become one glyph, one
   glyph may become two) and animates the switch on what is on screen. */

/* ---------- Part 1: verbatim port ---------- */
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
  'GADM','geoBoundaries','Natural Earth','ICAO','MRZ','PPS','EU-27','PDF','QR','HTML','CSS'];
let _latRe=null, AUT=[];
/* the names of the autonomous entities come from data/core.json (portail/data/entites-autonomes.json) */
export function setKeep(names){AUT=names.map(n=>({n}));_latRe=null;}
function latRe(){
  if(_latRe)return _latRe;
  const names=AUT.map(a=>a.n).filter(n=>LAT_FOREIGN.test(n)).concat(LAT_KEEP)
    .sort((a,b)=>b.length-a.length).map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  return _latRe=new RegExp('[^\\s@<>()]+@[^\\s@<>()]+|\\b(?:https?:\\/\\/|www\\.)\\S+|[\\w.-]+\\.(?:io|com|org|net|eu|app|dev)\\b'
    +(names.length?'|(?<![\\p{L}\\p{M}])(?:'+names.join('|')+')(?![\\p{L}\\p{M}])':''),'gu');
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
const CYR={'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'đ','ѓ':'đ','е':'e','ж':'ž','з':'z',
 'ѕ':'dz','и':'i','ѝ':'i','й':'j','ј':'j','к':'k','л':'l','љ':'ļ','м':'m','н':'n','њ':'ñ',
 'о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'ć','ќ':'ć','у':'u','ф':'f','х':'h','ц':'c',
 'ч':'č','џ':'x','ш':'š','щ':'št','ъ':'ã','ь':'j','ю':'ju','я':'ja','ѣ':'ě'};
export function cyr2lat(s){
  return String(s).replace(/дж/g,'x').replace(/Дж|ДЖ/g,'X')
   .replace(/([ЛлНн])([ьЬюЮяЯ])/g,(m,c,v)=>{const p={'л':'ļ','н':'ñ'}[c.toLowerCase()];
     return (c===c.toLowerCase()?p:p.toUpperCase())+({'ь':'','ю':'u','я':'a'}[v.toLowerCase()]);})
   .replace(/[Ѐ-ӿ]/g,ch=>{
    const lo=ch.toLowerCase(),t=CYR[lo];
    if(t===undefined)return ch;
    return ch===lo?t:t.charAt(0).toUpperCase()+t.slice(1);
  });
}

/* ---------- Part 2: alignment ---------- */
/* pairsWord('Ļubļana','ist') -> [['Ļu','Лю'],['b','б'],['ļa','ля'],['n','н'],['a','а']].
   Same walk as cyrWord, keeping for each output chunk the slice of the word it comes from.
   The result is checked against cyrWord: if the chunks do not rebuild it, the word is one pair. */
export function pairsWord(w,std){
  const out=cyrWord(w,std);
  if(out===w)return [[w,w]];
  const low=w.toLowerCase();
  if(low.length!==w.length)return [[w,out]];
  const U=[];                       // units: [normalised letter, start, length in the word]
  for(let i=0;i<low.length;i++){
    const two=low.substr(i,2);
    if(two==='lj'){U.push(['ļ',i,2]);i++;}
    else if(two==='nj'){U.push(['ñ',i,2]);i++;}
    else if(two==='dž'){U.push(['x',i,2]);i++;}
    else U.push([low[i],i,1]);
  }
  const P=[];                       // [start, length, cyr]
  if(std==='ist'){
    for(let i=0;i<U.length;i++){
      const c=U[i][0],n=U[i+1]?U[i+1][0]:'',p=U[i-1]?U[i-1][0]:'';
      const two=(cy)=>{P.push([U[i][1],U[i][2]+U[i+1][2],cy]);i++;};
      if(c==='š'&&n==='t'){two('щ');continue;}
      if(c==='j'||c==='ļ'||c==='ñ'){
        const base=c==='ļ'?'л':c==='ñ'?'н':'';
        if(n==='a'){two(base+'я');continue;}
        if(n==='u'){two(base+'ю');continue;}
        if(n==='o'){two(base?base+'ьо':(p&&!CYR_V.includes(p)?'ьо':'йо'));continue;}
        P.push([U[i][1],U[i][2],base?base+'ь':'й']);continue;
      }
      P.push([U[i][1],U[i][2],CYR_IST[c]!==undefined?CYR_IST[c]:c]);
    }
  }else for(const u of U)P.push([u[1],u[2],CYR_SRE[u[0]]!==undefined?CYR_SRE[u[0]]:u[0]]);
  const allUp=w.length>1&&w===w.toUpperCase()&&w!==w.toLowerCase();
  const cap=w[0]!==w[0].toLowerCase();
  const pairs=P.map(([s,l,cy],k)=>[w.substr(s,l),
    allUp?cy.toUpperCase():(k===0&&cap?cy[0].toUpperCase()+cy.slice(1):cy)]);
  return pairs.map(p=>p[1]).join('')===out?pairs:[[w,out]];
}
const WORD=/([\p{L}\p{M}\d]+)/u;
/* segments of a text: [[lat, cyr, isWord]], words converted in their context by cyrText */
export function segments(text,std){
  const a=text.split(WORD), b=cyrText(text,std).split(WORD);
  if(a.length!==b.length)return [[text,cyrText(text,std),false]];
  return a.map((s,i)=>[s,b[i],i%2===1]);
}

/* ---------- DOM: static conversion ---------- */
const skip=el=>!!el.closest('[translate="no"],[data-untranslated],code,script,style');
function textNodes(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT), out=[];
  for(let n=w.nextNode();n;n=w.nextNode())if(n.data)out.push(n);
  return out;
}
/* Plan of a cell: for each text node, its segments. The whole text of the cell is converted at
   once, so that the context rules of cyrText (Article 109 a, Glava III) see across the links. */
function plan(root,std){
  const nodes=textNodes(root), full=nodes.map(n=>n.data).join('');
  const segs=segments(full,std);
  const out=[]; let si=0, off=0, ok=true;
  for(const n of nodes){
    const mine=[], sk=skip(n.parentElement); let left=n.data.length;
    while(left>0&&si<segs.length){
      const [la,cy,isW]=segs[si], rest=la.length-off;
      if(rest<=left){
        mine.push(off===0?[la,sk?la:cy,isW&&!sk]:[la.slice(off),la.slice(off),false]);
        if(off!==0)ok=false;
        left-=rest;si++;off=0;
      }else{ // a word straddles two nodes: keep this node as written, in context-free conversion
        ok=false;mine.push([la.substr(off,left),la.substr(off,left),false]);off+=left;left=0;
      }
    }
    out.push([n,mine,sk]);
  }
  if(!ok)return nodes.map(n=>[n,skip(n.parentElement)?[[n.data,n.data,false]]:segments(n.data,std),skip(n.parentElement)]);
  return out;
}
/* A cell keeps its Latin source in _lat; dataset.sc holds what it shows: lat | cyr | dbl */
export function setScript(cell,std,mode){
  if(cell._lat===undefined)cell._lat=cell.innerHTML;
  const cur=cell.dataset.sc||'lat';
  if(cur===mode)return;
  cell.innerHTML=cell._lat;
  if(mode==='cyr'){for(const [n,segs,sk] of plan(cell,std))if(!sk)n.data=segs.map(s=>s[1]).join('');}
  else if(mode==='dbl')doubleLine(cell,std);
  cell.dataset.sc=mode;
  setLang(cell,std,mode);
}
function setLang(cell,std,mode){
  const base={sre:'sh',ist:'bg-Latn',zap:'sl',en:'en',fr:'fr'}[std]||'en';
  cell.lang=mode==='cyr'?(std==='ist'?'bg':'sh-Cyrl'):base;
}
/* Double line: every word carries its Cyrillic form under it (interlinear gloss), so the two
   scripts stay aligned word for word whatever the line breaks. */
function doubleLine(cell,std){
  for(const [n,segs,sk] of plan(cell,std)){
    if(sk)continue;
    const f=document.createDocumentFragment();
    for(let i=0;i<segs.length;i++){
      const [la,cy,isW]=segs[i];
      if(!isW||la===cy){f.append(la);continue;}
      let tail='';                                   // « , » « . » « ; » follow the word, not the gap
      const nx=segs[i+1], m=nx&&!nx[2]?/^[.,;:!?)»”…]+/.exec(nx[0]):null;
      if(m){tail=m[0];segs[i+1]=[nx[0].slice(tail.length),nx[1].slice(tail.length),false];}
      const w=document.createElement('span');w.className='w2';
      const a=document.createElement('span');a.textContent=la+tail;
      const b=document.createElement('span');b.textContent=cy+tail;b.setAttribute('aria-hidden','true');b.lang=std==='ist'?'bg':'sh-Cyrl';
      w.append(a,b);f.append(w);
    }
    n.replaceWith(f);
  }
}

/* ---------- DOM: the animated switch ---------- */
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let running=null, gen=0;
/* cells: elements of one standard; to: 'lat' | 'cyr' | 'dbl'. Only what is on screen is animated;
   the rest is converted at once, and the first visible cell keeps its place on screen. */
export function switchScript(cells,std,to,track=[]){
  if(running){running.finish();running=null;}
  const my=++gen;
  const vh=innerHeight, vis=[], off=[];
  const seen=new Map();                              // articles off screen are not measured cell by cell
  const near=c=>{const a=c.closest('.art'); if(!a)return true;
    if(!seen.has(a)){const r=a.getBoundingClientRect();seen.set(a,r.bottom>0&&r.top<vh);}
    return seen.get(a);};
  for(const c of cells){
    if((c.dataset.sc||'lat')===to)continue;
    if(!near(c)){off.push(c);continue;}
    const r=c.getBoundingClientRect();
    (r.bottom>0&&r.top<vh&&r.width>0&&r.right>0&&r.left<innerWidth?vis:off).push(c);
  }
  const anchor=vis[0]||null, top0=anchor?anchor.getBoundingClientRect().top:0;
  const keep=()=>{if(anchor){const d=anchor.getBoundingClientRect().top-top0;if(Math.abs(d)>.5)scrollBy(0,d);}};
  const root=document.documentElement;
  root.style.overflowAnchor='none';                 // the place is kept by hand, not twice
  /* what is off screen is converted afterwards, a slice per frame, the visible text held in place */
  const later=()=>new Promise(res=>{
    let i=0;
    const step=()=>{
      if(my!==gen){res();return;}
      const a=anchor&&anchor.isConnected?anchor:null;
      const t=a?a.getBoundingClientRect().top:0, end=performance.now()+7;
      while(i<off.length&&performance.now()<end)setScript(off[i++],std,to);
      if(a){const d=a.getBoundingClientRect().top-t;if(Math.abs(d)>.5)scrollBy(0,d);}
      if(i<off.length)requestAnimationFrame(step);else{root.style.overflowAnchor='';res();}
    };
    step();
  });
  if(!vis.length)return later();
  const glyph=!reduced()&&to!=='dbl'&&vis.every(c=>(c.dataset.sc||'lat')!=='dbl');
  const tr=track.filter(c=>!vis.includes(c)&&near(c)&&(r=>r.bottom>0&&r.top<vh)(c.getBoundingClientRect()));
  return (glyph?glyphSwitch(vis,std,to,keep,tr):fadeSwitch(vis,std,to,keep)).then(later);
}
/* Reduced motion (and the double line): a short cross-fade of the whole paragraph. */
function fadeSwitch(vis,std,to,keep){
  // the old picture stays inside the cell itself (same parent, same styles) and fades over the new text
  const top0=vis.map(c=>c.getBoundingClientRect().top);
  const ghosts=vis.map(c=>{const g=document.createElement('span');g.className='ghost2';g.setAttribute('aria-hidden','true');
    g.innerHTML=c.innerHTML;g.lang=c.lang;return g;});
  for(const c of vis)setScript(c,std,to);
  keep();
  vis.forEach((c,i)=>{
    const g=ghosts[i];
    for(const ch of c.children)ch.animate([{opacity:0},{opacity:1}],{duration:200,easing:'ease-out'});
    if(!c.children.length)c.animate([{opacity:.2},{opacity:1}],{duration:200,easing:'ease-out'});
    else{c.append(g);g.animate([{opacity:1},{opacity:0}],{duration:180,easing:'ease-in',fill:'forwards'}).finished.then(()=>g.remove(),()=>g.remove());}
  });
  return new Promise(r=>setTimeout(r,220));
}
/* Glyph by glyph. 1 read: the line breaks of the source text. 2 write: words and glyphs in
   spans, <br> at the measured breaks, white-space: nowrap, so no line can re-wrap while the
   glyphs change width. 3 a wave swaps each chunk for its counterpart (text and colour only: no
   layer per glyph). 4 the breaks are released; whatever moves glides to its place (FLIP). */
function glyphSwitch(vis,std,to,keep,track=[]){
  const toCyrl=to==='cyr';
  // 1 — read
  const jobs=[]; const rg=document.createRange();
  for(const c of vis){
    const from=c.dataset.sc||'lat';
    if(from!=='lat'){c.innerHTML=c._lat;c.dataset.sc='lat';}       // the plan is always made on the Latin
    if(c._lat===undefined)c._lat=c.innerHTML;
  }
  for(const c of vis){
    const pl=plan(c,std);
    if(!toCyrl){for(const [n,segs,sk] of pl)if(!sk)n.data=segs.map(s=>s[1]).join('');}  // show the source: Cyrillic
    jobs.push([c,pl]);
  }
  keep();
  const marks=[];                                  // per job: per node: per word: line top
  for(const [c,pl] of jobs){
    const m=[];
    for(const [n,segs,sk] of pl){
      const tops=[]; let o=0;
      for(const s of segs){
        const src=sk?s[0]:(toCyrl?s[0]:s[1]);
        if(/\S/.test(src)){
          const lead=src.length-src.trimStart().length;
          rg.setStart(n,Math.min(o+lead,n.data.length));rg.setEnd(n,Math.min(o+lead+1,n.data.length));
          const r=rg.getClientRects()[0];tops.push(r?r.top:null);
        }else tops.push(null);
        o+=src.length;
      }
      m.push(tops);
    }
    marks.push(m);
  }
  // 2 — write
  const glyphs=[];                                  // [span, target text, word span]
  const blocks=[];
  jobs.forEach(([c,pl],ji)=>{
    let lastTop=null, lastBlk=null;
    const h=0;
    pl.forEach(([n,segs,sk],ni)=>{
      const f=document.createDocumentFragment();
      const blk=n.parentElement.closest('p,h1,h2,h3,h4,li,div,header,a')||c;
      if(blk!==lastBlk){lastBlk=blk;lastTop=null;}
      segs.forEach((s,si)=>{
        const src=sk?s[0]:(toCyrl?s[0]:s[1]), top=marks[ji][ni][si];
        if(top!==null&&!sk){
          if(lastTop!==null&&top>lastTop+4){const br=document.createElement('br');br.className='fz';f.append(br);}
          lastTop=top;
        }
        if(sk||!s[2]||s[0]===s[1]){
          if(top!==null&&/^\s+/.test(src)&&f.lastChild&&f.lastChild.nodeName==='BR'){f.append(src.trimStart());}
          else f.append(src);
          return;
        }
        const w=document.createElement('span');w.className='w';
        let prs=pairsWord(s[0],std);
        if(prs.map(x=>x[1]).join('')!==s[1])prs=[[s[0],s[1]]];
        for(const [la,cy] of prs){
          const a=toCyrl?la:cy, b=toCyrl?cy:la;
          if(a===b){w.append(a);continue;}
          const g=document.createElement('span');g.className='g';g.textContent=a;
          w.append(g);glyphs.push([g,b,w]);
        }
        f.append(w);
      });
      n.replaceWith(f);
    });
    blocks.push([c,h]);
  });
  for(const [c] of blocks){c.classList.add('fz');setLang(c,std,'cyr');}   // Cyrillic glyph forms (ss01) for the whole wave
  // delays: a diagonal wave, from the top left of the screen
  const wpos=new Map();
  for(const [, ,w] of glyphs)if(!wpos.has(w)){const r=w.getBoundingClientRect();wpos.set(w,[r.left,r.top]);}
  const W=innerWidth,H=innerHeight; let maxD=0;
  const sched=glyphs.map(([g,b,w],i)=>{
    const [x,y]=wpos.get(w); let k=0;for(let p=g.previousSibling;p;p=p.previousSibling)k++;
    const d=Math.max(0,(y/H)*900+(x/W)*150+k*12);
    if(d>maxD)maxD=d;return [d,g,b];
  }).sort((a,b)=>a[0]-b[0]);
  let done=false, raf=0, fin;
  const p=new Promise(r=>fin=r);
  const settle=()=>{
    if(done)return;done=true;cancelAnimationFrame(raf);
    // 4 — release the lines. A paragraph whose lines break elsewhere cross-fades from its frozen
    // picture; whatever moves below glides to its place (FLIP).
    const flip=blocks.map(x=>x[0]).concat(track);
    const top0=flip.map(c=>c.getBoundingClientRect().top);
    const sig=c=>{let q='';for(const w of c.querySelectorAll('.w'))q+=w.offsetTop+',';return q+c.offsetHeight;};
    const frozen=blocks.map(([c])=>[c.cloneNode(true),sig(c)]);
    for(const [c] of blocks){c.classList.remove('fz');c.querySelectorAll('br.fz').forEach(x=>x.replaceWith(' '));}
    const changed=blocks.map(([c],n)=>sig(c)!==frozen[n][1]);
    for(const [c] of blocks){c.dataset.sc='lat';c.innerHTML=c._lat;setScript(c,std,to);}
    keep();
    const ease='cubic-bezier(.2,.7,.2,1)';
    blocks.forEach(([c],n)=>{
      if(!changed[n])return;
      const g=frozen[n][0];g.className='ghost2 fz';g.removeAttribute('id');g.removeAttribute('data-l');g.setAttribute('aria-hidden','true');
      for(const ch of c.children)ch.animate([{opacity:0},{opacity:1}],{duration:240,easing:'ease-out'});
      c.append(g);
      g.animate([{opacity:1},{opacity:0}],{duration:200,easing:'ease-in',fill:'forwards'}).finished.then(()=>g.remove(),()=>g.remove());
    });
    flip.forEach((c,n)=>{const d=top0[n]-c.getBoundingClientRect().top;
      if(Math.abs(d)>1)c.animate([{transform:`translateY(${d}px)`},{transform:'none'}],{duration:260,easing:ease});});
    running=null;setTimeout(fin,270);
  };
  const t0=performance.now(); let i=0, j=0, k=0; const HOT=150, WARM=300;
  const step=now=>{
    const t=now-t0;
    while(i<sched.length&&sched[i][0]<=t){const [,g,b]=sched[i++];g.firstChild.data=b;g.className='g h1';}
    while(j<i&&sched[j][0]+HOT<=t)sched[j++][1].className='g h2';
    while(k<j&&sched[k][0]+WARM<=t)sched[k++][1].className='g';
    if(k<sched.length)raf=requestAnimationFrame(step);else setTimeout(settle,90);
  };
  raf=requestAnimationFrame(step);
  running={finish(){for(;i<sched.length;i++){sched[i][1].textContent=sched[i][2];}
    if(!done){done=true;cancelAnimationFrame(raf);for(const [c] of blocks){c.classList.remove('fz');c.dataset.sc='lat';c.innerHTML=c._lat;setScript(c,std,to);}fin();}}};
  return p;
}

/* self-check, used by the tests: every word of a text rebuilds through its pairs */
export function checkPairs(text,std){
  let bad=0,n=0;
  for(const [la,cy,isW] of segments(text,std)){if(!isW)continue;n++;
    const p=pairsWord(la,std);
    if(p.map(x=>x[0]).join('')!==la||(p.length===1&&la!==cy&&la.length>3&&p[0][1]===cy&&cyrWord(la,std)!==cy))bad++;}
  return [n,bad];
}
