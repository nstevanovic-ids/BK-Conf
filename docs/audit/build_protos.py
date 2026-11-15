#!/usr/bin/env python3
"""Prototypes d'audit : trois directions visuelles pour la fiche d'État.

Génère docs/audit/proto-1.html, proto-2.html, proto-3.html, autonomes (polices,
drapeaux et blasons intégrés). Tout le contenu vient de portail/data/*.json et
des assets existants ; rien n'est dessiné ici.

L'emblème de l'en-tête et la carte de localisation sont ceux que le portail rend
lui-même : docs/audit/proto-assets.json les contient, extraits du portail servi en
local (document.getElementById('hdEmblem') et svg.minimap de six fiches).

Usage : python docs/audit/build_protos.py
"""
import base64, io, json, re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
D = ROOT / "portail" / "data"
OUT = Path(__file__).resolve().parent
CODES = ["LK-20", "SO-33", "TL-40", "US-43", "VB-44", "ZL-48"]

etats = {e["c"]: e for e in json.loads((D / "etats.json").read_text())}
stats = json.loads((D / "stats.json").read_text())
flags = json.loads((D / "state_flags.json").read_text())
notes = json.loads((D / "flagnotes.json").read_text())
peuples = json.loads((D / "peuples.json").read_text())
assets = json.loads((OUT / "proto-assets.json").read_text())

terr = [c for c, e in etats.items() if e["t"] == "T"]


def rank(code, key):
    vals = sorted((stats[c][key] for c in terr), reverse=True)
    return vals.index(stats[code][key]) + 1


def coa(code):
    im = Image.open(ROOT / "portail" / "images" / f"coa-{code}.webp").convert("RGBA")
    im.thumbnail((360, 480))
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=82)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def b64font(name):
    return base64.b64encode((ROOT / "portail" / "fonts" / name).read_bytes()).decode()


maxpop = max(stats[c]["population"] for c in terr)
maxgdp = max(stats[c]["gdp"] for c in terr)
maxarea = max(stats[c]["area"] for c in terr)
DATA = {}
for c in CODES:
    e, s = etats[c], stats[c]
    flag = flags[c]
    DATA[c] = dict(
        c=c, n=e["n"], seat=e["ch"], people=peuples[e["p"]]["en"], peopleNative=peuples[e["p"]]["name"],
        flag=flag if flag.startswith("data:") else "data:image/png;base64," + flag,
        coa=coa(c), note=notes[e["k"]], hit=assets["hit"][c],
        pop=s["population"], src=s["source"], area=s["area"], mun=s["municipalities"],
        gdp=s["gdp"], gdpEu=s["gdp_eu"], dens=round(s["population"] / s["area"]),
        rPop=rank(c, "population"), rGdp=rank(c, "gdp"), rArea=rank(c, "area"),
        pPop=round(100 * s["population"] / maxpop), pGdp=round(100 * s["gdp"] / maxgdp),
        pArea=round(100 * s["area"] / maxarea),
    )

FONTS = f"""@font-face{{font-family:'Arimo';font-weight:400 700;font-display:swap;src:url(data:font/woff2;base64,{b64font('arimo.woff2')}) format('woff2')}}
@font-face{{font-family:'Sofia Sans Extra Condensed';font-weight:400 800;font-display:swap;size-adjust:110%;src:url(data:font/woff2;base64,{b64font('sofia-sans-extra-condensed.woff2')}) format('woff2')}}"""

# ---------------------------------------------------------------- socle commun
BASE = """
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;font:400 1rem/1.6 'Arimo',system-ui,sans-serif;background:var(--bg);color:var(--ink)}
h1,h2,h3,.num{font-family:'Sofia Sans Extra Condensed','Arimo',sans-serif;font-weight:700;line-height:1.02;margin:0}
a{color:inherit}img{display:block;max-width:100%}
:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.skip{position:absolute;left:8px;top:-60px;background:#fff;color:#374078;padding:10px 14px;z-index:9;font-weight:700}
.skip:focus{top:8px}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}
@media(min-width:768px){.wrap{padding:0 32px}}
.bar{display:flex;align-items:center;gap:12px;min-height:56px}
.bar svg{width:38px;height:38px;flex:none}
.brand b{display:block;font:700 1.25rem/1 'Sofia Sans Extra Condensed',sans-serif;letter-spacing:.01em}
.brand{white-space:nowrap}.brand span{font-size:.75rem;letter-spacing:.16em;text-transform:uppercase}
@media(max-width:600px){.tag{display:none}}
.tag{margin-left:auto;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;opacity:.85;text-align:right}
.eyebrow{font-size:.75rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin:0}
.code{font:700 .82rem/1 'Arimo',sans-serif;letter-spacing:.08em;padding:6px 9px;display:inline-block}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;list-style:none;padding:0;margin:24px 0 56px}
@media(min-width:768px){.grid{grid-template-columns:repeat(3,1fr);gap:20px}}
@media(min-width:1100px){.grid{grid-template-columns:repeat(6,1fr)}}
.card{display:block;text-decoration:none;height:100%}
.card img{width:100%;aspect-ratio:3/2;object-fit:cover}
.card .meta{padding:10px 12px 12px}
.card .scode{font-size:.75rem;letter-spacing:.1em}
.card h3{font-size:1.25rem;margin:2px 0}
.card small{font-size:.8rem}
.flagfig{margin:0;min-width:0}.flagfig img{width:100%;height:auto}
.u{font-size:.55em;letter-spacing:.02em}
main *{min-width:0}
.flagfig figcaption{font-size:.86rem;line-height:1.5;margin-top:10px}
.coafig{margin:0}.coafig img{max-height:300px;margin:0 auto}
.facts{display:grid;grid-template-columns:repeat(2,1fr);gap:0;margin:0}
.facts>div{padding:14px 0}
.facts dt{font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.facts dd{margin:2px 0 0}.facts .num{font-size:2.1rem;display:block}
.facts small{font-size:.76rem}
@media(min-width:768px){.facts{grid-template-columns:repeat(4,1fr)}.facts .num{font-size:2.6rem}}
.minimap{width:100%;height:auto;display:block}
.minimap .mm-reg{transition:fill-opacity .15s}
.pn{display:flex;justify-content:space-between;gap:12px;margin:40px 0}
.pn button,.share{font:700 .86rem/1 'Arimo',sans-serif;min-height:44px;padding:0 16px;cursor:pointer;border-radius:2px}
.pn small{display:block;font-weight:400;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}
.crumb{font-size:.82rem;padding:14px 0}.crumb button{font:inherit;background:none;border:0;padding:0;color:inherit;text-decoration:underline;cursor:pointer;min-height:24px}
footer{padding:28px 0;font-size:.8rem;margin-top:40px}
[hidden]{display:none!important}
/* Transition entre la grille et la fiche : le drapeau est le seul élément partagé.
   Le reste suit le glissement canonique (ADR 2026-10-23), repris ici en horizontal. */
@media(prefers-reduced-motion:no-preference){
  ::view-transition-old(root){animation:620ms cubic-bezier(.65,0,.35,1) both vt-out}
  ::view-transition-new(root){animation:620ms cubic-bezier(.65,0,.35,1) both vt-in}
  ::view-transition-group(flag){animation-duration:620ms;animation-timing-function:cubic-bezier(.65,0,.35,1)}
  :root[data-dir=back]::view-transition-old(root){animation-name:vt-out-b}
  :root[data-dir=back]::view-transition-new(root){animation-name:vt-in-b}
  @keyframes vt-out{to{transform:translateX(-100%)}}@keyframes vt-in{from{transform:translateX(100%)}}
  @keyframes vt-out-b{to{transform:translateX(100%)}}@keyframes vt-in-b{from{transform:translateX(-100%)}}
  .card,.pn button,.share{transition:transform .14s,border-color .14s,background-color .14s,box-shadow .14s}
  @media(hover:hover){.card:hover{transform:translateY(-3px)}}
  /* Apparition au défilement, pour ce qui est sous la ligne de flottaison seulement
     (conservé par l'ADR) : CSS pur, sans observateur ; sans prise en charge, rien ne bouge. */
  @supports(animation-timeline:view()){
    .rv{animation:rv linear both;animation-timeline:view();animation-range:entry 0% entry 55%}
    @keyframes rv{from{opacity:.001;transform:translateY(18px)}}
    .bar-fill{animation:grow linear both;animation-timeline:view();animation-range:entry 10% entry 90%;transform-origin:left}
    @keyframes grow{from{transform:scaleX(0)}}
  }
}
@media(prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}
"""

HEADER = """<a class="skip" href="#main">Skip to content</a>
<header><div class="wrap bar">__EMBLEM__<div class="brand"><b>Balkanska Konfederacija</b><span>Balkan Confederation</span></div>
<div class="tag">Prototype __N__ · __NAME__</div></div></header>"""

GRID = """<section id="vGrid" class="wrap"><p class="eyebrow" style="margin-top:36px">Directory</p>
<h1 class="gtitle">States &amp; territories</h1><ul class="grid" id="grid"></ul></section>"""

FOOT = """<footer><div class="wrap">Prototype d'audit, non publié. Données : portail/data/*.json. Emblème, drapeaux, blasons et carte : assets existants du portail.</div></footer>"""

JS = """
const D=__DATA__, CODES=__CODES__;
const $=s=>document.querySelector(s), nf=n=>n.toLocaleString('en');
let cur=null;
$('#grid').innerHTML=CODES.map(c=>{const s=D[c];return `<li><a class="card" href="#/state/${c}" data-c="${c}">
<img src="${s.flag}" alt="Flag of ${s.n}" width="400" height="267"><div class="meta"><span class="scode">${c}</span>
<h3>${s.n}</h3><small>${s.people} · ${nf(s.pop)} inhabitants</small></div></a></li>`}).join('');
function fill(c){const s=D[c];
  document.querySelectorAll('[data-f]').forEach(e=>{const k=e.dataset.f,v=s[k];
    e.textContent=typeof v==='number'&&!/^r[A-Z]/.test(k)?nf(v):v});
  document.querySelectorAll('[data-w]').forEach(e=>e.style.width=s[e.dataset.w]+'%');
  const f=$('#fFlag');f.src=s.flag;f.alt='Flag of '+s.n;
  const a=$('#fCoa');a.src=s.coa;a.alt='Coat of arms of '+s.n;
  $('#hit').setAttribute('d',s.hit);$('.minimap').setAttribute('aria-label','Location of '+s.n+' in the Confederation');
  const i=CODES.indexOf(c),p=D[CODES[(i+5)%6]],n=D[CODES[(i+1)%6]];
  $('#prev').dataset.c=p.c;$('#prevN').textContent=p.n;$('#next').dataset.c=n.c;$('#nextN').textContent=n.n;
  document.title=s.n+' ('+c+') · Balkan Confederation';}
function paint(c){cur=c;$('#vGrid').hidden=!!c;$('#vState').hidden=!c;
  document.querySelectorAll('.card img').forEach(i=>i.style.viewTransitionName='');
  if(c){fill(c);scrollTo(0,0);$('#stateH').focus({preventScroll:true});}
  else{document.title='States & territories · Balkan Confederation';}}
function go(c,dir){
  /* un seul nom « flag » à la fois : la vignette au départ, le grand drapeau à l'arrivée */
  const card=document.querySelector(`.card[data-c="${c||cur}"] img`);
  const run=()=>{paint(c);if(!c&&card)card.style.viewTransitionName='flag';};
  if(c&&!cur&&card)card.style.viewTransitionName='flag';
  document.documentElement.dataset.dir=dir||'fwd';
  if(!document.startViewTransition||matchMedia('(prefers-reduced-motion:reduce)').matches){run();return;}
  document.startViewTransition(run).finished.then(()=>{if(card)card.style.viewTransitionName='';});}
function route(dir){const m=location.hash.match(/^#\\/state\\/([A-Z]{2}-\\d{2})$/);go(m&&D[m[1]]?m[1]:null,dir);}
let navDir='fwd';
addEventListener('hashchange',()=>{route(navDir);navDir='back';});
document.addEventListener('click',e=>{const b=e.target.closest('[data-c],[data-home]');if(!b)return;
  if(b.tagName==='A'){navDir='fwd';return;}
  navDir=b.id==='prev'||b.dataset.home!==undefined?'back':'fwd';
  location.hash=b.dataset.home!==undefined?'#/states':'#/state/'+b.dataset.c;});
navDir='back';
$('#share').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(location.href);
  e.currentTarget.textContent='Link copied';}catch(_){}});
{const m=location.hash.match(/^#\\/state\\/([A-Z]{2}-\\d{2})$/);paint(m&&D[m[1]]?m[1]:null);}
"""

# ------------------------------------------------- 1. Chancellerie (registre officiel)
CSS1 = """
:root{--bg:#fff;--ink:#1b2030;--mute:#565c6e;--line:#d7d9e4;--focus:#99402F}
/* neutres dérivés : encre #1b2030 et gris #565c6e = bleu #374078 assombri et désaturé (texte courant,
   16,2:1 et 6,7:1 sur blanc) ; filet #d7d9e4 = bleu à 20 % sur blanc. Aucune autre teinte. */
header{background:#374078;color:#fff;border-top:4px solid #99402F;border-bottom:2px solid #DFCC68}
.brand span,.tag{color:#DFCC68}
.eyebrow{color:#99402F}
.gtitle{font-size:2.4rem;margin-top:6px}
.card{border:1px solid var(--line);background:#fff}.card:hover{border-color:#374078}
.card .scode{color:var(--mute)}.card small{color:var(--mute)}
.crumb{color:var(--mute);border-bottom:1px solid var(--line)}
.head{display:grid;gap:24px;padding:28px 0 8px}
.head h1{font-size:clamp(3rem,9vw,5.2rem);margin:6px 0 14px}
.code{background:#374078;color:#fff}
.sub{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;color:var(--mute)}
.sub b{color:var(--ink)}
.flagfig img{border:1px solid var(--line)}
.note{color:var(--mute);border-left:2px solid #DFCC68;padding-left:14px;margin:20px 0;max-width:56ch}
@media(min-width:900px){.head{grid-template-columns:5fr 7fr;gap:48px;align-items:center;padding-top:40px}}
.facts{border-top:2px solid #374078;margin-top:28px}
.facts>div{border-bottom:1px solid var(--line)}
.facts dt{color:var(--mute)}.facts .num{color:#374078}.facts small{color:var(--mute)}
.two{display:grid;gap:28px;margin-top:40px}
@media(min-width:900px){.two{grid-template-columns:5fr 7fr;gap:48px}}
.panel{border:1px solid var(--line);padding:20px}
.panel h2{font-size:.75rem;font-family:'Arimo';letter-spacing:.16em;text-transform:uppercase;color:#99402F;margin-bottom:14px}
.minimap .mm-land{fill:#eef0f6}.minimap .mm-reg{fill:#374078;fill-opacity:.22;stroke:#fff;stroke-width:.5}
.minimap .mm-reg:hover{fill-opacity:.45}.minimap #hit{fill:#99402F;fill-opacity:1;stroke:#fff;stroke-width:1.2}
.pn{border-top:1px solid var(--line);padding-top:20px}
.pn button,.share{background:#fff;border:1px solid #374078;color:#374078;text-align:left}
.pn button:hover,.share:hover{background:#374078;color:#fff}
#next{text-align:right}
footer{background:#374078;color:#fff;border-top:2px solid #DFCC68}
"""
STATE1 = """<article id="vState" class="wrap" hidden>
<nav class="crumb" aria-label="Breadcrumb"><button data-home>States</button> › <span data-f="n"></span></nav>
<div class="head">
 <figure class="flagfig"><img id="fFlag" style="view-transition-name:flag" width="400" height="267" alt=""></figure>
 <div><p class="eyebrow">Territorial state</p><h1 id="stateH" tabindex="-1" data-f="n"></h1>
  <div class="sub"><span class="code" data-f="c"></span><span><b data-f="people"></b> · <span lang="sh" data-f="peopleNative"></span></span><span>Seat <b data-f="seat"></b></span></div>
  <p class="note" data-f="note"></p><button class="share" id="share">Copy link</button></div>
</div>
<dl class="facts">
   <div><dt>Population</dt><dd><span class="num" data-f="pop"></span><small data-f="src"></small></dd></div>
   <div><dt>Area</dt><dd><span class="num"><span data-f="area"></span> <span class="u">km²</span></span><small><span data-f="dens"></span> inhabitants / km²</small></dd></div>
   <div><dt>GDP per capita</dt><dd><span class="num"><span data-f="gdp"></span> <span class="u">PPS</span></span><small><span data-f="gdpEu"></span>% of the EU-27 average</small></dd></div>
   <div><dt>Municipalities</dt><dd><span class="num" data-f="mun"></span></dd></div>
</dl>
<div class="two">
 <section class="panel rv"><h2>Coat of arms</h2><figure class="coafig"><img id="fCoa" alt="" loading="lazy"></figure></section>
 <section class="panel rv"><h2>Location</h2>__MAP__</section>
</div>
<nav class="pn" aria-label="Neighbouring entries"><button id="prev"><small>Previous state</small><span id="prevN"></span></button>
<button id="next"><small>Next state</small><span id="nextN"></span></button></nav>
</article>"""

# ------------------------------------------------- 2. Pavillon (la structure du drapeau civil)
CSS2 = """
:root{--bg:#fff;--ink:#1b2030;--mute:#565c6e;--line:#d7d9e4;--focus:#DFCC68}
/* mêmes neutres dérivés que la direction 1 ; la page reprend la construction du drapeau civil :
   bande rouge au guindant, champ bleu, blanc, bleu. */
body{background:#fff}
header{background:#fff;color:#374078;border-bottom:1px solid var(--line)}
.brand span,.tag{color:#99402F}
:focus-visible{outline-color:#99402F}
.eyebrow{color:#99402F}
.gtitle{font-size:3rem;margin-top:6px;color:#374078}
.card{background:#374078;color:#fff}.card .scode,.card small{color:#DFCC68}
.hero{display:grid;grid-template-columns:44px 1fr;background:#374078;color:#fff}
.hoist{background:#99402F;display:flex;align-items:flex-end;justify-content:center;padding:18px 0}
.hoist span{writing-mode:vertical-rl;transform:rotate(180deg);font:700 1.5rem/1 'Sofia Sans Extra Condensed';letter-spacing:.12em;color:#fff}
.hero .in{padding:8px 20px 36px;min-width:0}
.hero :focus-visible{outline-color:#DFCC68}
.crumb{color:#fff;opacity:.9}
.hero .eyebrow{color:#DFCC68}
.hero h1{font-size:clamp(3.6rem,13vw,8.5rem);letter-spacing:-.01em;margin:4px 0 12px;overflow-wrap:anywhere}
.sub{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
.code{border:1px solid #DFCC68;color:#DFCC68}
.flagfig{margin-top:26px;max-width:560px}
.flagfig img{box-shadow:0 18px 40px rgba(0,0,0,.35)}
.flagfig figcaption{color:#fff;opacity:.92}
@media(min-width:900px){.hero{grid-template-columns:88px 1fr}.hoist span{font-size:2.4rem}
 .hero .in{display:grid;grid-template-columns:7fr 5fr;gap:48px;align-items:end;padding:16px 56px 56px}
 .crumb{grid-column:1/-1}.flagfig{margin:0}}
.band{background:#fff}
.facts{padding:12px 0}.facts>div{border-top:3px solid #DFCC68;margin-right:16px}
.facts dt{color:var(--mute)}.facts .num{color:#99402F;font-size:2.3rem}.facts small{color:var(--mute)}
@media(min-width:768px){.facts .num{font-size:3.4rem}}
.blue{background:#374078;color:#fff;padding:44px 0;margin-top:32px}
.two{display:grid;gap:32px}
@media(min-width:900px){.two{grid-template-columns:4fr 8fr;gap:56px;align-items:center}}
.two h2{font-size:2rem;margin-bottom:14px;color:#DFCC68}
.coafig img{background:#fff;padding:14px}
.minimap .mm-land{fill:#fff;fill-opacity:.08}.minimap .mm-reg{fill:#fff;fill-opacity:.2;stroke:#374078;stroke-width:.5}
.minimap .mm-reg:hover{fill-opacity:.4}.minimap #hit{fill:#DFCC68;fill-opacity:1;stroke:#374078;stroke-width:1}
.pn button,.share{background:#374078;border:0;color:#fff;text-align:left}
.share{background:none;border:1px solid #fff}
.pn button:hover{background:#99402F}.share:hover{background:#fff;color:#374078}
.pn small{color:#DFCC68}#next{text-align:right}
footer{border-top:6px solid #99402F;color:var(--mute)}
"""
STATE2 = """<article id="vState" hidden>
<div class="hero"><div class="hoist" aria-hidden="true"><span data-f="c"></span></div>
 <div class="in"><nav class="crumb" aria-label="Breadcrumb"><button data-home>States</button> › <span data-f="n"></span></nav>
  <div><p class="eyebrow">Territorial state</p><h1 id="stateH" tabindex="-1" data-f="n"></h1>
   <div class="sub"><span class="code" data-f="c"></span><span><b data-f="people"></b> · <span lang="sh" data-f="peopleNative"></span></span><span>Seat <b data-f="seat"></b></span>
   <button class="share" id="share">Copy link</button></div></div>
  <figure class="flagfig"><img id="fFlag" style="view-transition-name:flag" width="400" height="267" alt=""><figcaption data-f="note"></figcaption></figure>
 </div></div>
<div class="band"><div class="wrap"><dl class="facts">
   <div><dt>Population</dt><dd><span class="num" data-f="pop"></span><small data-f="src"></small></dd></div>
   <div><dt>Area</dt><dd><span class="num"><span data-f="area"></span> <span class="u">km²</span></span><small><span data-f="dens"></span> inhabitants / km²</small></dd></div>
   <div><dt>GDP per capita</dt><dd><span class="num"><span data-f="gdp"></span> <span class="u">PPS</span></span><small><span data-f="gdpEu"></span>% of the EU-27 average</small></dd></div>
   <div><dt>Municipalities</dt><dd><span class="num" data-f="mun"></span></dd></div>
</dl></div></div>
<div class="blue"><div class="wrap two">
 <section class="rv"><h2>Coat of arms</h2><figure class="coafig"><img id="fCoa" alt="" loading="lazy"></figure></section>
 <section class="rv"><h2>Location</h2>__MAP__</section>
</div></div>
<div class="wrap"><nav class="pn" aria-label="Neighbouring entries"><button id="prev"><small>Previous state</small><span id="prevN"></span></button>
<button id="next"><small>Next state</small><span id="nextN"></span></button></nav></div>
</article>"""

# ------------------------------------------------- 3. Atlas (la carte d'abord, écran sombre)
CSS3 = """
:root{--bg:#141a33;--ink:#fff;--mute:#c3c8dc;--line:#3b4571;--panel:#1d2547;--focus:#DFCC68}
/* neutres dérivés du bleu #374078 : fond #141a33 (assombri, blanc 17,1:1, or 10,6:1), panneau #1d2547,
   filet #3b4571, texte secondaire #c3c8dc (blanc teinté de bleu, 10,3:1). Le rouge ne porte jamais de
   texte sur le bleu (1,44:1) : il ne sert qu'en aplat, texte blanc dessus. */
header{background:#141a33;color:#fff;border-bottom:1px solid var(--line)}
.brand span,.tag,.eyebrow{color:#DFCC68}
.gtitle{font-size:2.6rem;margin-top:6px}
.card{background:var(--panel);border:1px solid var(--line)}.card:hover{border-color:#DFCC68}
.card .scode{color:#DFCC68}.card small{color:var(--mute)}
.crumb{color:var(--mute)}
.stage{position:relative}
.stage .minimap{max-height:62vh}
.minimap .mm-land{fill:#fff;fill-opacity:.05}.minimap .mm-reg{fill:#374078;fill-opacity:.9;stroke:#141a33;stroke-width:.6}
.minimap .mm-reg:hover{fill:#5560a0}.minimap #hit{fill:#DFCC68;fill-opacity:1;stroke:#141a33;stroke-width:1}
.title{padding:8px 0 20px}
.title h1{font-size:clamp(3.2rem,11vw,6.5rem);margin:4px 0 12px}
.sub{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;color:var(--mute)}.sub b{color:#fff}
.code{background:#DFCC68;color:#141a33}
@media(min-width:900px){.stage{display:grid;grid-template-columns:5fr 7fr;gap:40px;align-items:center}.stage .mapw{order:2}}
.cols{display:grid;gap:20px;margin-top:28px}
@media(min-width:900px){.cols{grid-template-columns:5fr 3fr 4fr}}
.panel{background:var(--panel);border:1px solid var(--line);padding:18px}
.panel h2{font:700 .75rem/1 'Arimo';letter-spacing:.16em;text-transform:uppercase;color:#DFCC68;margin-bottom:14px}
.flagfig figcaption{color:var(--mute)}
.meter{margin:0 0 16px}.meter:last-child{margin:0}
.meter .row{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.meter dt{font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
.meter .num{font-size:1.9rem}
.meter .track{height:6px;background:#141a33;margin-top:6px}.meter .bar-fill{height:100%;background:#DFCC68}
.meter small{font-size:.76rem;color:var(--mute)}
.pn{border-top:1px solid var(--line);padding-top:20px}
.pn button,.share{background:none;border:1px solid var(--line);color:#fff;text-align:left}
.pn button:hover,.share:hover{border-color:#DFCC68}
.pn small{color:#DFCC68}#next{text-align:right}
footer{border-top:1px solid var(--line);color:var(--mute)}
"""
STATE3 = """<article id="vState" class="wrap" hidden>
<nav class="crumb" aria-label="Breadcrumb"><button data-home>States</button> › <span data-f="n"></span></nav>
<div class="stage"><div class="mapw">__MAP__</div>
 <div class="title"><p class="eyebrow">Territorial state</p><h1 id="stateH" tabindex="-1" data-f="n"></h1>
  <div class="sub"><span class="code" data-f="c"></span><span><b data-f="people"></b> · <span lang="sh" data-f="peopleNative"></span></span><span>Seat <b data-f="seat"></b></span>
  <button class="share" id="share">Copy link</button></div></div></div>
<div class="cols">
 <section class="panel"><h2>Flag</h2><figure class="flagfig"><img id="fFlag" style="view-transition-name:flag" width="400" height="267" alt=""><figcaption data-f="note"></figcaption></figure></section>
 <section class="panel rv"><h2>Coat of arms</h2><figure class="coafig"><img id="fCoa" alt="" loading="lazy"></figure></section>
 <section class="panel rv"><h2>Among the 48 territorial states</h2><dl style="margin:0">
  <div class="meter"><div class="row"><dt>Population</dt><dd style="margin:0"><span class="num" data-f="pop"></span></dd></div>
   <div class="track"><div class="bar-fill" data-w="pPop"></div></div><small>Rank <span data-f="rPop"></span> of 48 · <span data-f="src"></span></small></div>
  <div class="meter"><div class="row"><dt>GDP per capita</dt><dd style="margin:0"><span class="num"><span data-f="gdp"></span> <span class="u">PPS</span></span></dd></div>
   <div class="track"><div class="bar-fill" data-w="pGdp"></div></div><small>Rank <span data-f="rGdp"></span> of 48 · <span data-f="gdpEu"></span>% of the EU-27 average</small></div>
  <div class="meter"><div class="row"><dt>Area</dt><dd style="margin:0"><span class="num"><span data-f="area"></span> <span class="u">km²</span></span></dd></div>
   <div class="track"><div class="bar-fill" data-w="pArea"></div></div><small>Rank <span data-f="rArea"></span> of 48 · <span data-f="dens"></span> inhabitants / km² · <span data-f="mun"></span> municipalities</small></div>
 </dl></section>
</div>
<nav class="pn" aria-label="Neighbouring entries"><button id="prev"><small>Previous state</small><span id="prevN"></span></button>
<button id="next"><small>Next state</small><span id="nextN"></span></button></nav>
</article>"""

DIRS = [(1, "Chancellerie", CSS1, STATE1), (2, "Pavillon", CSS2, STATE2), (3, "Atlas", CSS3, STATE3)]
js = JS.replace("__DATA__", json.dumps(DATA, ensure_ascii=False)).replace("__CODES__", json.dumps(CODES))
report = {}
for n, name, css, state in DIRS:
    head = HEADER.replace("__EMBLEM__", assets["emblem"]).replace("__N__", str(n)).replace("__NAME__", name)
    html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prototype {n} · {name}</title><meta name="robots" content="noindex">
<style>{FONTS}{BASE}{css}</style></head><body>
{head}<main id="main">{GRID}{state.replace("__MAP__", assets["map"])}</main>{FOOT}
<script>{js}</script></body></html>"""
    (OUT / f"proto-{n}.html").write_text(html, encoding="utf-8")
    report[name] = dict(css_propre=len(css.encode()), css_socle=len(BASE.encode()),
                        js=len(JS.encode()), fichier=len(html.encode()))
print(json.dumps(report, indent=1))
