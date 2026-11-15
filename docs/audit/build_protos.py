#!/usr/bin/env python3
"""Prototypes d'audit, deuxième série : trois systèmes d'interface.

Chaque prototype montre les mêmes quatre écrans (accueil, États, Constitution titre I,
planche de composants) dans cinq variantes de langue et d'écriture.

  proto-1.html  « Titre »     page typographique, claire
  proto-2.html  « Mosaïque »  tuiles aux quatre couleurs canoniques
  proto-3.html  « Console »   coquille d'application sombre, recherche d'abord

Rien n'est rédigé ni dessiné ici. Les textes sont ceux que le portail affiche
(proto-strings.json, relevé par extract_strings.py), les données viennent de
portail/data/*.json, l'emblème et la photo sont des assets du portail.

Usage : python docs/audit/build_protos.py
"""
import base64, io, json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
D = ROOT / "portail" / "data"
OUT = Path(__file__).resolve().parent

etats = json.loads((D / "etats.json").read_text())
stats = json.loads((D / "stats.json").read_text())
flags = json.loads((D / "state_flags.json").read_text())
S = json.loads((OUT / "proto-strings.json").read_text())
emblem = json.loads((OUT / "proto-assets.json").read_text())["emblem"]


def b64(path):
    return base64.b64encode(path.read_bytes()).decode()


def photo():
    im = Image.open(ROOT / "portail" / "images" / "home-hero.jpg").convert("RGB")
    im.thumbnail((1400, 800))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=72, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


STATES = [dict(c=e["c"], n=e["n"], p=e["p"],
               f=flags[e["c"]] if flags[e["c"]].startswith("data:") else "data:image/png;base64," + flags[e["c"]],
               a=stats[e["c"]].get("area")) for e in etats]

FONTS = f"""@font-face{{font-family:'Arimo';font-weight:400 700;font-display:swap;src:url(data:font/woff2;base64,{b64(ROOT/'portail/fonts/arimo.woff2')}) format('woff2')}}
@font-face{{font-family:'Sofia Sans Extra Condensed';font-weight:400 800;font-display:swap;size-adjust:110%;src:url(data:font/woff2;base64,{b64(ROOT/'portail/fonts/sofia-sans-extra-condensed.woff2')}) format('woff2')}}"""

# ------------------------------------------------------------------ socle commun
BASE = """
:root{--red:#99402F;--blue:#374078;--gold:#DFCC68;--white:#fff;
 /* neutres dérivés du bleu canonique, communs aux trois directions */
 --ink:#1b2030;--mute:#565c6e;--line:#d7d9e4;--wash:#eef0f6;
 --night:#141a33;--panel:#1d2547;--edge:#3b4571;--soft:#c3c8dc;
 --display:'Sofia Sans Extra Condensed','Arimo',sans-serif;
 --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:24px;--s6:32px;--s7:48px;--s8:72px;--s9:112px;
 --t-xs:.75rem;--t-s:.875rem;--t-m:1rem;--t-l:1.1875rem;--t-xl:1.5rem;--t-2:2.25rem;--t-3:3.5rem}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;scroll-padding-top:150px}
body{margin:0;font:400 var(--t-m)/1.6 'Arimo',system-ui,sans-serif;color:var(--ink);background:var(--white)}
h1,h2,h3{font-family:var(--display);font-weight:700;line-height:1;margin:0;text-wrap:balance;overflow-wrap:break-word}
p{margin:0}a{color:inherit}img{display:block;max-width:100%;height:auto}button,input{font:inherit;color:inherit}
ul,ol,dl,dd{margin:0;padding:0;list-style:none}
:focus-visible{outline:3px solid var(--focus,var(--red));outline-offset:3px}
.skip{position:fixed;left:8px;top:-80px;background:#fff;color:var(--blue);padding:12px 16px;z-index:99;font-weight:700}
.skip:focus{top:8px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;white-space:nowrap}
.brand svg{width:36px;height:36px;flex:none}
.brand b{display:block;font:700 1.375rem/1 var(--display)}
.brand i{display:block;font-style:normal;font-size:var(--t-xs);margin-top:2px}
.nav{display:flex;gap:var(--s1)}
.nav a{text-decoration:none;white-space:nowrap;padding:10px 12px;font-size:var(--t-s);font-weight:700;min-height:44px;display:flex;align-items:center}
.nav a[aria-disabled]{opacity:.45;pointer-events:none}
.langs{display:flex}
.langs button{background:none;border:0;min-width:44px;min-height:44px;padding:0 8px;font-size:var(--t-xs);font-weight:700;cursor:pointer}
select.langsel{display:none;min-height:44px;padding:0 var(--s3);font:700 var(--t-s)/1 'Arimo',sans-serif;border-radius:8px;border:1px solid var(--line);background:transparent;color:inherit;margin-left:auto}
select.langsel option{color:#1b2030;background:#fff}
@media(max-width:700px){.hd .langs{display:none}select.langsel{display:block}}
.brand{min-height:44px}
.doc{font-size:var(--t-xs);border:1px dashed currentColor;padding:2px 8px;opacity:.75}
.flag{aspect-ratio:3/2;object-fit:cover;width:100%}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 var(--s5);font-weight:700;text-decoration:none;cursor:pointer;border:0;text-align:center}
.chips{display:flex;flex-wrap:wrap;gap:var(--s2)}
.chips button{min-height:44px;padding:0 var(--s4);font-size:var(--t-s);font-weight:700;cursor:pointer;background:none;border:1px solid var(--line)}
.field{width:100%;min-height:52px;padding:0 var(--s4);font-size:var(--t-m);border:1px solid var(--mute);background:var(--white);color:var(--ink)}
.empty{padding:var(--s7) 0;font-size:var(--t-l)}
.num{font-variant-numeric:tabular-nums}
.clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
main{min-height:100vh}main:focus{outline:0}main *{min-width:0}
h1:focus{outline:0}
.toc a,.chips button,.nav a,.fit>*{flex:none}
.kit{display:grid;gap:var(--s7)}
.kit h2{font:700 var(--t-xs)/1.4 'Arimo',sans-serif;margin-bottom:var(--s4)}
.kit .rowx{display:flex;flex-wrap:wrap;gap:var(--s4);align-items:center}
.fit{display:grid;grid-template-columns:repeat(5,minmax(132px,1fr));gap:var(--s2);overflow-x:auto}
.kv{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:0 var(--s4)}
.kv dt,.kv dd{padding:var(--s3) 0;border-bottom:1px solid var(--line)}
.kv dt{font-size:var(--t-s);color:var(--mute)}.kv dd{font-weight:700}
.crumbs{display:flex;flex-wrap:wrap;gap:var(--s2);font-size:var(--t-s)}
.crumbs li+li::before{content:"/";margin-right:var(--s2);opacity:.5}
/* Changement d'écran : le glissement vertical de l'ADR 2026-10-23, en-tête immobile. */
.hd{view-transition-name:hd}
@media(prefers-reduced-motion:no-preference){
 ::view-transition-group(hd){animation:none}
 ::view-transition-old(root){animation:620ms cubic-bezier(.65,0,.35,1) both vt-up-out}
 ::view-transition-new(root){animation:620ms cubic-bezier(.65,0,.35,1) both vt-up-in}
 :root[data-dir=prev]::view-transition-old(root){animation-name:vt-dn-out}
 :root[data-dir=prev]::view-transition-new(root){animation-name:vt-dn-in}
 @keyframes vt-up-out{to{transform:translateY(-100%)}}@keyframes vt-up-in{from{transform:translateY(100%)}}
 @keyframes vt-dn-out{to{transform:translateY(100%)}}@keyframes vt-dn-in{from{transform:translateY(-100%)}}
 /* Filtrer : les cartes glissent vers leur nouvelle place (réponse à un geste, pas une arrivée). */
 :root[data-dir=same]::view-transition-old(root),:root[data-dir=same]::view-transition-new(root){animation:none}
 ::view-transition-group(*){animation-duration:320ms;animation-timing-function:cubic-bezier(.3,0,.2,1)}
 .btn,.chips button,.nav a,.langs button{transition:background-color .14s,color .14s,border-color .14s}
}
@media(prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}
"""

# ------------------------------------------------------------------ 1. Titre
CSS1 = """
:root{--focus:var(--red)}
.hd{position:sticky;top:0;z-index:20;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:0 var(--s5);
 padding:var(--s2) clamp(16px,4vw,56px);background:color-mix(in srgb,#fff 86%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.brand b{color:var(--blue)}.brand i{color:var(--mute)}
.nav{justify-content:center;overflow-x:auto;scrollbar-width:none}
.nav a{color:var(--mute);border-bottom:3px solid transparent}
.nav a:hover{color:var(--blue)}.nav a[aria-current]{color:var(--blue);border-color:var(--red)}
.langs button{color:var(--mute)}.langs button[aria-pressed=true]{color:var(--white);background:var(--blue)}
@media(max-width:1180px){.hd{grid-template-columns:1fr auto}.nav{grid-column:1/-1;grid-row:2;justify-content:flex-start;margin:0 -8px}}
@media(max-width:560px){.brand i{display:none}.langs button{min-width:40px;padding:0 4px}}
main{padding:0 clamp(16px,4vw,56px) var(--s9)}
.hero h1{font-size:clamp(3rem,15.5vw,17rem);line-height:.8;text-transform:uppercase;color:var(--blue);letter-spacing:-.012em;
 padding:clamp(28px,5vw,72px) 0 clamp(20px,3vw,40px);text-wrap:initial}
.hero-grid{display:grid;gap:var(--s6)}
.hero-img img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px}
.lead{font-size:var(--t-xl);line-height:1.35;max-width:30ch}
.motto{font:700 var(--t-2)/1 var(--display);color:var(--red);margin:var(--s5) 0}
.cta{display:flex;flex-wrap:wrap;gap:var(--s3) var(--s5);align-items:center}
.btn{background:var(--blue);color:#fff;border-radius:6px}.btn:hover{background:var(--red)}
.btn.alt{background:none;color:var(--blue);padding:0;text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px}
.btn.alt:hover{color:var(--red);background:none}
@media(min-width:900px){.hero-grid{grid-template-columns:7fr 5fr;gap:var(--s7);align-items:end}}
.sec{padding-top:var(--s9)}
.sec>h2{font-size:clamp(2.5rem,6vw,4.5rem);color:var(--ink);max-width:16ch}
.sec>h2+p{font-size:var(--t-l);max-width:60ch;margin-top:var(--s5);color:var(--mute)}
.figs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s5) var(--s6);margin-top:var(--s7);border-top:2px solid var(--blue);padding-top:var(--s5)}
.figs dt{order:2;font-size:var(--t-s);color:var(--mute)}
.figs div{display:flex;flex-direction:column}
.figs dd{font:700 clamp(3.5rem,8vw,6rem)/.9 var(--display);color:var(--blue)}
@media(min-width:900px){.figs{grid-template-columns:repeat(4,minmax(0,1fr))}}
.links{margin-top:var(--s6);display:grid}
@media(min-width:900px){.links{grid-template-columns:1fr 1fr;column-gap:var(--s8)}}
.links a{display:grid;gap:var(--s1);padding:var(--s5) 0;border-top:1px solid var(--line);text-decoration:none}
.links h3{font-size:clamp(2rem,4vw,2.75rem);color:var(--blue);width:fit-content;background:linear-gradient(var(--red),var(--red)) 0 100%/0 3px no-repeat;transition:background-size .25s,color .14s}
.links a:hover h3,.links a:focus-visible h3{background-size:100% 3px;color:var(--red)}
.links p{color:var(--mute);max-width:52ch}
.jr{display:grid;grid-template-columns:7.5rem 1fr;gap:var(--s4);padding:var(--s4) 0;border-top:1px solid var(--line)}
.jr time{font-weight:700;color:var(--blue)}.jr p{color:var(--mute)}
@media(max-width:560px){.jr{grid-template-columns:1fr;gap:var(--s1)}}
.page-h{padding:clamp(28px,5vw,64px) 0 var(--s6)}
.page-h h1{font-size:clamp(3.25rem,10vw,8rem);text-transform:uppercase;color:var(--blue);line-height:.85}
.page-h p{font-size:var(--t-l);max-width:60ch;margin-top:var(--s4);color:var(--mute)}
.tools{display:grid;gap:var(--s3);position:sticky;top:57px;background:#fff;padding:var(--s3) 0;z-index:5}
@media(max-width:1180px){.tools{top:105px}}
@media(min-width:900px){.tools{grid-template-columns:320px 1fr;align-items:center}}
.field{border-radius:6px}
.chips button{border-radius:6px;color:var(--mute)}.chips button:hover{border-color:var(--blue);color:var(--blue)}
.chips button[aria-pressed=true]{background:var(--blue);border-color:var(--blue);color:#fff}
@media(max-width:899px){.chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:0 16px}.chips button{white-space:nowrap}}
.rows .row{display:grid;grid-template-columns:72px 1fr auto;gap:0 var(--s4);align-items:center;padding:var(--s3) 0;border-bottom:1px solid var(--line);text-decoration:none}
.rows .row:hover h3{color:var(--red)}
.rows .flag{border:1px solid var(--line);grid-row:1/4}
.rows h3{font-size:var(--t-xl);grid-column:2;grid-row:2}
.rows .code{font-size:var(--t-xs);color:var(--mute);font-weight:700;grid-column:2;grid-row:1}
.rows .people{font-size:var(--t-s);color:var(--mute);grid-column:2;grid-row:3}
.rows .pop{font-size:var(--t-s);text-align:right;grid-row:1/4;grid-column:3;max-width:7.5rem}
.rows .head{display:none}
@media(min-width:900px){
 .rows .row,.rows .head{grid-template-columns:96px 6rem 1fr 12rem 14rem;gap:var(--s5)}
 .rows .head{display:grid;font-size:var(--t-s);color:var(--mute);padding:var(--s3) 0;border-bottom:2px solid var(--blue)}
 .rows .head span:last-child{text-align:right}
 .rows .row>*{grid-row:1!important}
 .rows .flag{grid-column:1}.rows .code{grid-column:2;font-size:var(--t-s)}.rows h3{grid-column:3;font-size:var(--t-2)}
 .rows .people{grid-column:4;font-size:var(--t-m)}.rows .pop{grid-column:5;font-size:var(--t-m);max-width:none}}
.read{display:grid;gap:var(--s6)}
.toc{font-size:var(--t-s)}
.toc a{display:flex;gap:var(--s3);padding:var(--s2) 0;text-decoration:none;color:var(--mute)}
.toc a:hover{color:var(--red)}.toc b{color:var(--blue);min-width:5.5rem}
@media(max-width:899px){.toc{display:flex;gap:var(--s2);overflow-x:auto;scrollbar-width:none;position:sticky;top:105px;background:#fff;padding:var(--s2) 16px;margin:0 -16px;z-index:5}
 .toc a{white-space:nowrap;border:1px solid var(--line);border-radius:6px;padding:var(--s2) var(--s3);min-height:44px;align-items:center}.toc a span{display:none}.toc b{min-width:0}}
@media(min-width:900px){.read{grid-template-columns:3fr 9fr;gap:var(--s8)}.toc{position:sticky;top:120px;align-self:start}}
.art{max-width:66ch;padding-bottom:var(--s7)}
.art .n{font-weight:700;color:var(--red)}
.art h3{font-size:clamp(2.25rem,9vw,3.5rem);color:var(--blue);margin:var(--s1) 0 var(--s4)}
.art p{font-size:var(--t-l);line-height:1.7;margin-bottom:var(--s4)}
.kit{padding-top:var(--s6)}.kit h2{color:var(--red)}
.card1{border:1px solid var(--line);padding:var(--s3);font-size:var(--t-s);overflow-wrap:anywhere;border-radius:6px}
"""

# ------------------------------------------------------------------ 2. Mosaïque
CSS2 = """
:root{--focus:var(--red);--r:28px}
body{background:var(--wash)}
.hd{position:sticky;top:12px;z-index:20;margin:12px auto 0;width:min(1280px,calc(100% - 24px));display:flex;align-items:center;gap:var(--s4);
 padding:var(--s2) var(--s2) var(--s2) var(--s4);background:color-mix(in srgb,#fff 88%,transparent);backdrop-filter:blur(16px);border-radius:999px;box-shadow:0 6px 28px rgba(55,64,120,.14)}
.brand b{color:var(--blue)}.brand i{display:none}
.nav{flex:1;justify-content:center;overflow-x:auto;scrollbar-width:none}
.nav a{border-radius:999px;color:var(--mute)}.nav a:hover{background:var(--wash);color:var(--blue)}
.nav a[aria-current]{background:var(--blue);color:#fff}
.langs{background:var(--wash);border-radius:999px;padding:2px}
.langs button{border-radius:999px;color:var(--mute)}.langs button[aria-pressed=true]{background:#fff;color:var(--blue)}
@media(max-width:1500px){.hd{flex-wrap:wrap;border-radius:var(--r);padding:var(--s2) var(--s3)}.nav{order:3;flex-basis:100%;justify-content:flex-start}.langs{margin-left:auto}}
@media(max-width:480px){.brand b{font-size:1.125rem}.brand svg{width:30px;height:30px}.langs button{min-width:38px;padding:0 3px}}
main{width:min(1280px,calc(100% - 24px));margin:0 auto;padding:var(--s4) 0 var(--s9)}
.mosaic{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr))}
.t{background:#fff;border-radius:var(--r);padding:var(--s5);display:flex;flex-direction:column}
.t-hero{grid-column:1/-1;background:var(--blue);color:#fff;padding:clamp(24px,4vw,56px);justify-content:space-between;gap:var(--s6);--focus:var(--gold)}
.t-hero h1{font-size:clamp(3.5rem,9.5vw,8.5rem);line-height:.86}
.lead{font-size:var(--t-l);max-width:44ch}
.cta{display:flex;flex-wrap:wrap;gap:var(--s3);margin-top:var(--s5)}
.btn{background:var(--gold);color:var(--ink);border-radius:999px}.btn:hover{background:#fff}
.btn.alt{background:none;color:#fff;box-shadow:inset 0 0 0 2px #fff}.btn.alt:hover{background:#fff;color:var(--blue)}
.t-photo{grid-column:1/-1;padding:0;overflow:hidden;min-height:220px;margin:0}.t-photo img{width:100%;height:100%;object-fit:cover}
.t-motto{grid-column:1/-1;background:var(--red);color:#fff;justify-content:flex-end;min-height:180px;font:700 clamp(3rem,8vw,5.5rem)/.9 var(--display)}
.t-fig{justify-content:space-between;min-height:150px}
.t-fig b{font:700 clamp(3.5rem,9vw,6rem)/.85 var(--display);color:var(--blue)}
.t-fig span{font-size:var(--t-s);color:var(--mute)}
.t-fig.gold{background:var(--gold)}.t-fig.gold span{color:var(--ink)}
.t-wide{grid-column:1/-1;gap:var(--s4)}
.t-wide h2{font-size:clamp(2.25rem,5vw,3.75rem);color:var(--blue);max-width:18ch}
.t-wide>p{font-size:var(--t-l);color:var(--mute);max-width:64ch}
.t-link{grid-column:1/-1;text-decoration:none;gap:var(--s2);justify-content:flex-end;min-height:150px;transition:background-color .18s}
.t-link h3{font-size:var(--t-2);color:var(--blue);transition:color .18s}.t-link p{color:var(--mute);font-size:var(--t-s);transition:color .18s}
.t-link:hover,.t-link:focus-visible{background:var(--blue)}.t-link:hover h3,.t-link:hover p,.t-link:focus-visible h3,.t-link:focus-visible p{color:#fff}
.jr{display:grid;gap:var(--s1);padding:var(--s3) 0;border-top:1px solid var(--line)}
.jr time{font-weight:700;color:var(--blue);font-size:var(--t-s)}.jr p{color:var(--mute)}
@media(min-width:700px){.t-link{grid-column:auto}.jr{grid-template-columns:7.5rem 1fr;gap:var(--s4)}}
@media(min-width:1000px){.mosaic{grid-template-columns:repeat(12,minmax(0,1fr))}
 .t-hero{grid-column:span 7;grid-row:span 2;min-height:520px}.t-photo{grid-column:span 5}.t-motto{grid-column:span 5}
 .t-fig{grid-column:span 3;min-height:200px}.t-link{grid-column:span 4;min-height:190px}}
.page-h{background:var(--blue);color:#fff;border-radius:var(--r);padding:clamp(24px,4vw,48px)}
.page-h h1{font-size:clamp(3rem,8vw,6rem);line-height:.88}.page-h p{font-size:var(--t-l);max-width:60ch;margin-top:var(--s4)}
.tools{display:grid;gap:var(--s2);margin:12px 0}
@media(min-width:900px){.tools{grid-template-columns:320px 1fr;align-items:center}}
.field{border-radius:999px;border-color:transparent;box-shadow:0 2px 12px rgba(55,64,120,.12);padding:0 var(--s5)}
.chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding:2px}
.chips button{border-radius:999px;background:#fff;border-color:transparent;color:var(--mute);white-space:nowrap}
.chips button[aria-pressed=true]{background:var(--blue);color:#fff}
.tiles{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:700px){.tiles{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:1000px){.tiles{grid-template-columns:repeat(5,minmax(0,1fr))}}
.tile{background:#fff;border-radius:20px;padding:var(--s2);text-decoration:none;display:flex;flex-direction:column;transition:box-shadow .18s}
.tile:hover{box-shadow:0 10px 30px rgba(55,64,120,.2)}
.tile .flag{border-radius:14px}
.tile div{padding:var(--s3) var(--s2) var(--s2)}
.tile h3{font-size:var(--t-xl);color:var(--blue);overflow-wrap:anywhere}
.tile .code{font-size:var(--t-xs);font-weight:700;color:var(--red)}
.tile .people,.tile .pop{font-size:var(--t-xs);color:var(--mute);display:block}
.sheet{background:#fff;border-radius:var(--r);padding:clamp(20px,5vw,72px)}
.read{display:grid;gap:12px;margin-top:12px}
.toc{display:flex;gap:var(--s2);overflow-x:auto;scrollbar-width:none;padding:2px}
.toc a{white-space:nowrap;text-decoration:none;background:#fff;border-radius:999px;padding:0 var(--s4);min-height:44px;display:flex;align-items:center;gap:var(--s2);font-size:var(--t-s);color:var(--mute)}
.toc a:hover{background:var(--blue);color:#fff}.toc a:hover b{color:#fff}.toc b{color:var(--blue)}
.art{max-width:66ch;margin:0 auto;padding-bottom:var(--s7)}
.art .n{display:inline-block;background:var(--gold);color:var(--ink);font-weight:700;border-radius:999px;padding:2px var(--s3);font-size:var(--t-s)}
.art h3{font-size:clamp(2.25rem,9vw,3.5rem);color:var(--blue);margin:var(--s3) 0 var(--s4)}
.art p{font-size:var(--t-l);line-height:1.7;margin-bottom:var(--s4)}
.kit{margin-top:12px;gap:12px}.kit>section{background:#fff;border-radius:var(--r);padding:var(--s5)}.kit h2{color:var(--red)}
.kit .btn.alt{color:var(--blue);box-shadow:inset 0 0 0 2px var(--blue)}
.kit .chips{flex-wrap:wrap}.kit .chips button{background:var(--wash)}.kit .chips button[aria-pressed=true]{background:var(--blue)}
.kit .field{box-shadow:none;border-color:var(--line)}
.card1{background:var(--wash);border-radius:14px;padding:var(--s3);font-size:var(--t-s);overflow-wrap:anywhere}
"""

# ------------------------------------------------------------------ 3. Console
CSS3 = """
:root{--focus:var(--gold);--line:var(--edge);--mute:var(--soft)}
body{background:var(--night);color:#fff}
.hd{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:var(--s3);padding:var(--s2) var(--s4);background:color-mix(in srgb,var(--night) 86%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--edge)}
.brand i{color:var(--gold)}
.langs{margin-left:auto;border:1px solid var(--edge);border-radius:10px;overflow:hidden}
.langs button{color:var(--soft)}.langs button[aria-pressed=true]{background:var(--gold);color:var(--night)}
.nav{position:fixed;left:0;right:0;bottom:0;z-index:20;background:color-mix(in srgb,var(--panel) 92%,transparent);backdrop-filter:blur(14px);border-top:1px solid var(--edge);overflow-x:auto;scrollbar-width:none;padding:var(--s1) var(--s2) calc(var(--s1) + env(safe-area-inset-bottom))}
.nav a{color:var(--soft);border-radius:10px;min-height:48px}
.nav a[aria-current]{background:var(--blue);color:#fff}.nav a:hover{color:#fff}
main{padding:var(--s5) var(--s4) 160px;max-width:1120px;margin:0 auto}
@media(max-width:480px){.brand i{display:none}.langs button{min-width:38px;padding:0 3px}}
@media(min-width:1000px){body{display:grid;grid-template-columns:248px minmax(0,1fr);grid-template-rows:auto 1fr}
 .hd{grid-column:1/-1}
 .nav{position:sticky;top:61px;align-self:start;height:calc(100vh - 61px);flex-direction:column;border-top:0;border-right:1px solid var(--edge);padding:var(--s4) var(--s3);background:none;backdrop-filter:none}
 .nav a{font-size:var(--t-m)}
 main{padding:var(--s7) var(--s7) var(--s9);margin:0;width:100%;max-width:1180px}}
.cmd{padding:clamp(8px,4vw,56px) 0 var(--s6)}
.cmd h1{font-size:clamp(3rem,8vw,6rem);line-height:.9}
.lead{font-size:var(--t-l);color:var(--soft);max-width:56ch;margin-top:var(--s4)}
.motto{color:var(--gold);font:700 var(--t-xl)/1 var(--display);margin-top:var(--s3)}
.field{background:var(--panel);color:#fff;border:1px solid var(--edge);border-radius:14px}
.field::placeholder{color:var(--soft)}
.cmdbar{margin-top:var(--s6);min-height:64px;font-size:var(--t-l);border-radius:18px;border-color:var(--gold);box-shadow:0 0 0 6px rgba(223,204,104,.12)}
.results{margin-top:var(--s3);background:var(--panel);border:1px solid var(--edge);border-radius:18px;overflow:hidden}
.results a{display:grid;grid-template-columns:56px 1fr auto;gap:var(--s4);align-items:center;padding:var(--s3) var(--s4);text-decoration:none;border-top:1px solid var(--edge);min-height:64px}
.results li:first-child a{border-top:0}
.results a:hover,.results a:focus-visible{background:var(--blue)}
.results h3{font-size:var(--t-xl)}.results p{font-size:var(--t-s);color:var(--soft)}
.results .k{font-size:var(--t-xs);color:var(--gold);font-weight:700}
.results .ic{width:56px;height:38px;border-radius:6px;background:var(--night);display:grid;place-items:center;font:700 var(--t-l)/1 var(--display);color:var(--gold)}
.results .flag{border-radius:6px}
@media(max-width:560px){.results .k{display:none}.results a{grid-template-columns:56px 1fr}}
.cta{display:flex;flex-wrap:wrap;gap:var(--s3);margin-top:var(--s5)}
.btn{background:var(--gold);color:var(--night);border-radius:12px}.btn:hover{background:#fff}
.btn.alt{background:none;color:#fff;border:1px solid var(--edge)}.btn.alt:hover{border-color:var(--gold);background:none}
.panels{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:var(--s6)}
@media(min-width:800px){.panels{grid-template-columns:repeat(4,minmax(0,1fr))}}
.pan{background:var(--panel);border:1px solid var(--edge);border-radius:18px;padding:var(--s4)}
.pan b{display:block;font:700 clamp(3rem,7vw,4.5rem)/.9 var(--display);color:var(--gold)}
.pan span{font-size:var(--t-s);color:var(--soft)}
.sec{margin-top:var(--s7)}.sec>h2{font-size:var(--t-2);margin-bottom:var(--s4)}
.jr{display:grid;gap:var(--s1);padding:var(--s3) 0;border-top:1px solid var(--edge)}
.jr time{font-weight:700;color:var(--gold);font-size:var(--t-s)}.jr p{color:var(--soft)}
@media(min-width:700px){.jr{grid-template-columns:7.5rem 1fr;gap:var(--s4)}}
.page-h h1{font-size:clamp(2.75rem,7vw,5rem)}.page-h p{color:var(--soft);max-width:60ch;margin-top:var(--s3)}
.tools{display:grid;gap:var(--s3);margin:var(--s5) 0 var(--s3)}
.chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
.chips button{border-radius:10px;color:var(--soft);white-space:nowrap}.chips button[aria-pressed=true]{background:var(--gold);border-color:var(--gold);color:var(--night)}
.split{display:grid;gap:var(--s5)}
.list a{display:grid;grid-template-columns:60px 1fr auto;gap:var(--s3);align-items:center;padding:var(--s2);border-radius:12px;text-decoration:none;min-height:56px}
.list a:hover{background:var(--panel)}.list a[aria-current]{background:var(--blue)}
.list .flag{border-radius:5px}.list h3{font-size:var(--t-xl)}
.list .code{font-size:var(--t-xs);color:var(--gold);font-weight:700}
.pv{view-transition-name:pv;background:var(--panel);border:1px solid var(--edge);border-radius:18px;padding:var(--s3);
 position:fixed;left:12px;right:12px;bottom:72px;z-index:15;display:grid;grid-template-columns:96px 1fr;gap:var(--s3);align-items:center;box-shadow:0 12px 40px rgba(0,0,0,.5)}
.pv .flag{border-radius:8px}.pv h2{font-size:var(--t-xl)}.pv .kv{display:none}.pv .sub{font-size:var(--t-s);color:var(--soft)}
@media(min-width:800px){.split{grid-template-columns:minmax(0,5fr) minmax(0,6fr)}
 .pv{position:sticky;top:96px;left:auto;right:auto;bottom:auto;align-self:start;display:block;padding:var(--s4);box-shadow:none}
 .pv .flag{border-radius:12px;margin-bottom:var(--s4)}.pv h2{font-size:var(--t-3)}.pv .kv{display:grid;margin-top:var(--s4)}.pv .sub{display:none}}
.kv dt{color:var(--soft)}
.read{display:grid;gap:var(--s5);margin-top:var(--s5)}
.toc{display:flex;gap:var(--s2);overflow-x:auto;scrollbar-width:none}
.toc a{white-space:nowrap;text-decoration:none;border:1px solid var(--edge);border-radius:10px;padding:0 var(--s3);min-height:44px;display:flex;align-items:center;gap:var(--s2);font-size:var(--t-s);color:var(--soft)}
.toc a:hover{border-color:var(--gold);color:#fff}.toc b{color:var(--gold)}
@media(max-width:999px){.toc a span{display:none}}
@media(min-width:1000px){.read{grid-template-columns:minmax(0,3fr) minmax(0,8fr);gap:var(--s7)}.toc{flex-direction:column;position:sticky;top:96px;align-self:start}.toc a{white-space:normal;border:0;padding:var(--s2) 0;min-height:0}}
.art{max-width:66ch;padding-bottom:var(--s7)}
.art .n{font-weight:700;color:var(--gold)}
.art h3{font-size:clamp(2.25rem,9vw,3.5rem);margin:var(--s1) 0 var(--s4)}
.art p{font-size:var(--t-l);line-height:1.7;margin-bottom:var(--s4);color:#e9ebf5}
.kit{margin-top:var(--s5);gap:12px}.kit>section{background:var(--panel);border:1px solid var(--edge);border-radius:18px;padding:var(--s4)}.kit h2{color:var(--gold)}
.kit .chips{flex-wrap:wrap}
.card1{background:var(--night);border-radius:10px;padding:var(--s3);font-size:var(--t-s);overflow-wrap:anywhere}
"""

JS = r"""
const DIR=__DIR__, S=__S__, ST=__ST__, EMB=__EMB__, PHOTO=__PHOTO__;
const VAR=['en','zap','sre','sre-cyr','ist-cyr'], VLAB={en:'EN',zap:'ZAP',sre:'SRE','sre-cyr':'СРЕ','ist-cyr':'ИСТ'};
const PEO=[null,'slo','hrv','srb','bos','cng','mkd','bul','fed'];
const ROUTES=['home','states','constitution','components'];
const NAVMAP={0:'home',1:'states',5:'constitution'};
let V='en', route='home', filt=null, q='', sel='LK-20', cq='';
const $=s=>document.querySelector(s), T=()=>S[V];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fold=s=>s.normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/gi,'d').toLowerCase();
const nm=s=>T().states.cards[s.c];
const flag=s=>`<img class="flag" src="${s.f}" alt="" loading="lazy" width="400" height="267">`;
const HAY={};ST.forEach(s=>HAY[s.c]=VAR.map(v=>fold(S[v].states.cards[s.c][0])).concat(fold(s.n),fold(s.c)));
const match=(s,x)=>!x||HAY[s.c].some(h=>h.includes(fold(x.trim())));
const starts=(s,x)=>HAY[s.c].some(h=>h.startsWith(fold(x.trim())))?0:1;
const doc=t=>`<span class="doc" lang="fr">${t}</span>`;

function chrome(){const t=T().home;
  document.documentElement.lang=t.htmlLang;
  $('.brand').innerHTML=EMB+`<span><b>${esc(t.brand)}</b><i>${esc(t.brandSub)}</i></span>`;
  $('.nav').innerHTML=t.nav.map((n,i)=>NAVMAP[i]?`<a href="#/${NAVMAP[i]}"${route===NAVMAP[i]?' aria-current="page"':''}>${esc(n)}</a>`
    :`<a aria-disabled="true">${esc(n)}</a>`).join('')+`<a href="#/components"${route==='components'?' aria-current="page"':''}>${doc('Composants')}</a>`;
  $('.langs').innerHTML=VAR.map(v=>`<button data-v="${v}" aria-pressed="${v===V}">${VLAB[v]}</button>`).join('');
  $('.langsel').innerHTML=VAR.map(v=>`<option value="${v}"${v===V?' selected':''}>${VLAB[v]}</option>`).join('');}

const journal=t=>t.journalRows.map(r=>`<div class="jr"><time>${esc(r[0])}</time><p class="clamp">${esc(r[1])}</p></div>`).join('');
const cta=t=>`<div class="cta"><a class="btn" href="#/states">${esc(t.cta[0])}</a><a class="btn alt" href="#/home">${esc(t.cta[1])}</a></div>`;
const cardHref=i=>['#/states','#/home','#/home','#/constitution','#/home','#/home'][i];

function home(){const t=T().home;
  if(DIR===1)return `<section class="hero"><h1 id="pageH" tabindex="-1">${esc(t.h1)}</h1>
   <div class="hero-grid"><figure class="hero-img" style="margin:0"><img src="${PHOTO}" alt="" width="1400" height="788"></figure>
   <div><p class="lead">${esc(t.lead)}</p><p class="motto">${esc(t.motto)}</p>${cta(t)}</div></div></section>
   <section class="sec"><h2>${esc(t.unionH)}</h2><p>${esc(t.unionP)}</p>
    <dl class="figs">${t.figs.map(f=>`<div><dt>${esc(f[1])}</dt><dd class="num">${f[0]}</dd></div>`).join('')}</dl></section>
   <section class="sec"><h2>${esc(t.exploreH)}</h2><ul class="links">${t.cards.map((c,i)=>`<li><a href="${cardHref(i)}"><h3>${esc(c[1])}</h3><p>${esc(c[2])}</p></a></li>`).join('')}</ul></section>
   <section class="sec"><h2>${esc(t.journalH)}</h2><div style="margin-top:var(--s6)">${journal(t)}</div></section>`;
  if(DIR===2)return `<div class="mosaic">
   <section class="t t-hero"><h1 id="pageH" tabindex="-1">${esc(t.h1)}</h1><div><p class="lead">${esc(t.lead)}</p>${cta(t)}</div></section>
   <figure class="t t-photo"><img src="${PHOTO}" alt="" width="1400" height="788"></figure>
   <p class="t t-motto">${esc(t.motto)}</p>
   ${t.figs.map((f,i)=>`<div class="t t-fig${i===0?' gold':''}"><b class="num">${f[0]}</b><span>${esc(f[1])}</span></div>`).join('')}
   <section class="t t-wide"><h2>${esc(t.unionH)}</h2><p>${esc(t.unionP)}</p></section>
   ${t.cards.map((c,i)=>`<a class="t t-link" href="${cardHref(i)}"><h3>${esc(c[1])}</h3><p>${esc(c[2])}</p></a>`).join('')}
   <section class="t t-wide"><h2>${esc(t.journalH)}</h2><div>${journal(t)}</div></section></div>`;
  return `<section class="cmd"><h1 id="pageH" tabindex="-1">${esc(t.h1)}</h1><p class="lead">${esc(t.lead)}</p><p class="motto">${esc(t.motto)}</p>
   <input class="field cmdbar" id="cq" type="search" value="${esc(cq)}" placeholder="${esc(T().searchPh)}" aria-label="${esc(t.search)}" autocomplete="off">
   <ul class="results" id="cres">${cres()}</ul>${cta(t)}</section>
   <div class="panels">${t.figs.map(f=>`<div class="pan"><b class="num">${f[0]}</b><span>${esc(f[1])}</span></div>`).join('')}</div>
   <section class="sec"><h2>${esc(t.journalH)}</h2>${journal(t)}</section>`;}
function cres(){const t=T().home;
  if(!cq.trim())return t.cards.map((c,i)=>`<li><a href="${cardHref(i)}"><span class="ic" aria-hidden="true">${esc(c[1][0])}</span><span><h3>${esc(c[1])}</h3><p class="clamp">${esc(c[2])}</p></span><span class="k">${esc(c[0])}</span></a></li>`).join('');
  const r=ST.filter(s=>match(s,cq)).sort((a,b)=>starts(a,cq)-starts(b,cq)).slice(0,6);
  return r.length?r.map(s=>`<li><a href="#/states" data-sel="${s.c}">${flag(s)}<span><h3>${esc(nm(s)[0])}</h3><p>${esc(nm(s)[1])}</p></span><span class="k">${s.c}</span></a></li>`).join('')
   :`<li><p class="empty" style="padding:var(--s5) var(--s4)">${esc(T().noMatch)}</p></li>`;}

function shown(){return ST.filter(s=>(!filt||s.p===filt)&&match(s,q));}
function tools(){const t=T().states;
  return `<div class="tools"><input class="field" id="q" type="search" value="${esc(q)}" placeholder="${esc(t.ph)}" aria-label="${esc(t.ph)}" autocomplete="off">
   <div class="chips" role="group">${t.chips.map((c,i)=>`<button data-p="${PEO[i]||''}" aria-pressed="${(PEO[i]||null)===filt}">${esc(c)}</button>`).join('')}</div></div>`;}
function list(){const r=shown(), t=T(), L=t.state.rows;
  if(!r.length)return `<p class="empty">${esc(t.noMatch)}</p>`;
  const vt=s=>`style="view-transition-name:s-${s.c}"`;
  if(DIR===1)return `<div class="rows"><div class="head" aria-hidden="true"><span></span><span>${esc(L[0][0])}</span><span></span><span>${esc(L[2][0])}</span><span>${esc(L[6][0])}</span></div>
   ${r.map(s=>`<a class="row" href="#/states" ${vt(s)}>${flag(s)}<span class="code">${s.c}</span><h3>${esc(nm(s)[0])}</h3><span class="people">${esc(nm(s)[1])}</span><span class="pop num">${esc(nm(s)[2])}</span></a>`).join('')}</div>`;
  if(DIR===2)return `<div class="tiles">${r.map(s=>`<a class="tile" href="#/states" ${vt(s)}>${flag(s)}<div><span class="code">${s.c}</span><h3>${esc(nm(s)[0])}</h3><span class="people">${esc(nm(s)[1])}</span><span class="pop num">${esc(nm(s)[2])}</span></div></a>`).join('')}</div>`;
  if(!r.find(s=>s.c===sel))sel=r[0].c;
  return `<div class="split"><ul class="list">${r.map(s=>`<li><a href="#/states" data-sel="${s.c}"${s.c===sel?' aria-current="true"':''}>${flag(s)}<h3>${esc(nm(s)[0])}</h3><span class="code">${s.c}</span></a></li>`).join('')}</ul>${preview()}</div>`;}
function preview(){const s=ST.find(x=>x.c===sel), L=T().state.rows, unit=L[7][1].split(/\s/).pop();
  return `<aside class="pv" id="pv" aria-live="polite">${flag(s)}<div><h2>${esc(nm(s)[0])}</h2><p class="sub">${s.c} / ${esc(nm(s)[1])} / <span class="num">${esc(nm(s)[2])}</span></p>
   <dl class="kv"><dt>${esc(L[0][0])}</dt><dd>${s.c}</dd><dt>${esc(L[2][0])}</dt><dd>${esc(nm(s)[1])}</dd><dt>${esc(L[6][0])}</dt><dd class="num">${esc(nm(s)[2])}</dd>
   ${s.a?`<dt>${esc(L[7][0])}</dt><dd class="num">${s.a.toLocaleString(T().home.htmlLang.slice(0,2))} ${esc(unit)}</dd>`:''}</dl></div></aside>`;}
function states(){const t=T().states;
  return `<header class="page-h"><h1 id="pageH" tabindex="-1">${esc(t.h1)}</h1><p>${esc(t.lead)}</p></header>${tools()}<div id="list">${list()}</div>`;}

function constitution(){const c=T().cons;
  return `<header class="page-h"><ol class="crumbs">${c.crumb.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
   <h1 id="pageH" tabindex="-1" style="margin-top:var(--s3)">${esc(c.h[0])}</h1></header>
   <div class="read"><nav class="toc" aria-label="${esc(c.h[0])}">${c.arts.map(a=>`<a href="#${a.id}" data-jump="${a.id}"><b>${esc(a.num)}</b><span>${esc(a.name)}</span></a>`).join('')}</nav>
   <div class="${DIR===2?'sheet':''}">${c.arts.map(a=>`<article class="art" id="${a.id}"><span class="n">${esc(a.num)}</span><h3>${esc(a.name)}</h3>${a.body.map(p=>`<p>${esc(p)}</p>`).join('')}</article>`).join('')}</div></div>`;}

function components(){const t=T(), h=t.home, L=t.state.rows, s=ST.find(x=>x.c==='LK-20');
  const fit=k=>VAR.map(v=>`<div class="card1" lang="${S[v].home.htmlLang}"><b>${VLAB[v]}</b><br>${esc(k(S[v]))}</div>`).join('');
  return `<header class="page-h"><h1 id="pageH" tabindex="-1" lang="fr">Composants</h1><p lang="fr">Planche de contrôle, hors portail. Les libellés sont ceux du portail dans la langue choisie ; les intitulés en français sont des annotations.</p></header>
  <div class="kit">
   <section><h2 lang="fr">Boutons</h2><div class="rowx"><a class="btn" href="#/components">${esc(h.cta[0])}</a><a class="btn alt" href="#/components">${esc(h.cta[1])}</a><a class="btn alt" href="#/components">${esc(h.feats[0][2])}</a></div></section>
   <section><h2 lang="fr">Filtres et champ de recherche</h2><div class="chips" style="margin-bottom:var(--s4)">${t.states.chips.map((c,i)=>`<button aria-pressed="${i===2}">${esc(c)}</button>`).join('')}</div>
    <input class="field" type="search" placeholder="${esc(t.states.ph)}" aria-label="${esc(t.states.ph)}" style="max-width:420px"></section>
   <section><h2 lang="fr">Fil d'Ariane et données clés</h2><ol class="crumbs" style="margin-bottom:var(--s4)">${t.state.crumb.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
    <dl class="kv" style="max-width:640px">${L.slice(0,9).map(r=>`<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl></section>
   <section><h2 lang="fr">Échelle typographique (7 tailles) et espacements (9 pas)</h2>
    <p style="font:700 var(--t-3)/1 var(--display)">${esc(nm(s)[0])}, ${esc(L[4][1])}</p><p style="font:700 var(--t-2)/1.1 var(--display)">${esc(h.unionH)}</p>
    <p style="font-size:var(--t-xl)">${esc(h.feats[0][0])}</p><p style="font-size:var(--t-l)">${esc(h.lead)}</p><p>${esc(h.unionP)}</p>
    <p style="font-size:var(--t-s)">${esc(h.cards[0][2])}</p><p style="font-size:var(--t-xs)">${esc(L[9][1])}</p>
    <div class="rowx" style="margin-top:var(--s4);align-items:flex-end">${[4,8,12,16,24,32,48,72,112].map(n=>`<span style="display:inline-block;width:${n}px;height:${n}px;background:var(--gold)" title="${n} px"></span>`).join('')}</div></section>
   <section><h2 lang="fr">Tenue des libellés dans les cinq variantes</h2>
    <div class="fit">${fit(x=>x.home.nav[7])}${fit(x=>x.state.rows[4][0])}${fit(x=>x.home.cta[1])}${fit(x=>x.state.rows[9][0])}${fit(x=>x.states.cards['KM-16'][0])}${fit(x=>x.states.cards['DR-10'][0])}</div></section>
   <section><h2 lang="fr">Palette : quatre couleurs canoniques, neutres dérivés du bleu</h2><div class="rowx">${[['#99402F','#fff'],['#374078','#fff'],['#FFFFFF','#1b2030'],['#DFCC68','#1b2030'],['#1b2030','#fff'],['#565c6e','#fff'],['#d7d9e4','#1b2030'],['#eef0f6','#1b2030'],['#141a33','#fff'],['#1d2547','#fff']].map(c=>`<span style="background:${c[0]};color:${c[1]};padding:var(--s4) var(--s3);min-width:96px;font-size:var(--t-xs);font-weight:700;border:1px solid var(--line)">${c[0]}</span>`).join('')}</div></section>
  </div>`;}

const VIEWS={home,states,constitution,components};
function paint(){chrome();$('#main').innerHTML=VIEWS[route]();
  document.title=({home:T().home.h1,states:T().states.h1,constitution:T().cons.h[0],components:'Composants'})[route]+' · '+T().home.brandSub;}
function vt(fn,dir){document.documentElement.dataset.dir=dir;
  if(!document.startViewTransition||matchMedia('(prefers-reduced-motion:reduce)').matches){fn();return;}
  document.startViewTransition(fn);}
function go(){const r=(location.hash.match(/^#\/(\w+)/)||[])[1], nx=ROUTES.includes(r)?r:'home';
  if(nx===route)return;
  const first=route===null, d=ROUTES.indexOf(nx)>ROUTES.indexOf(route)?'next':'prev';
  const run=()=>{route=nx;paint();scrollTo(0,0);const h=$('#pageH');if(h&&!first)h.focus({preventScroll:true});};
  first?run():vt(run,d);}
function relist(){vt(()=>{$('#list').innerHTML=list();document.querySelectorAll('.chips button[data-p]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.p||null)===filt));},'same');}
addEventListener('hashchange',go);
document.addEventListener('click',e=>{
  const l=e.target.closest('[data-v]');if(l){V=l.dataset.v;paint();return;}
  const p=e.target.closest('.chips button[data-p]');if(p){filt=p.dataset.p||null;relist();return;}
  const j=e.target.closest('[data-jump]');if(j){e.preventDefault();document.getElementById(j.dataset.jump).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});return;}
  const s=e.target.closest('[data-sel]');if(s){sel=s.dataset.sel;if(route==='states'){e.preventDefault();
    vt(()=>{$('#pv').outerHTML=preview();document.querySelectorAll('.list a').forEach(a=>a.dataset.sel===sel?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current'));},'same');}return;}
  const a=e.target.closest('a.row, a.tile, .kit a.btn');if(a)e.preventDefault();});
document.addEventListener('change',e=>{if(e.target.matches('.langsel')){V=e.target.value;paint();}});
document.addEventListener('input',e=>{
  if(e.target.id==='q'){q=e.target.value;$('#list').innerHTML=list();}
  if(e.target.id==='cq'){cq=e.target.value;$('#cres').innerHTML=cres();}});
route=null;go();
"""

SHELL = """<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Prototype __N__ · __NAME__</title><meta name="robots" content="noindex">
<style>__CSS__</style></head><body>
<a class="skip" href="#main" lang="fr">Aller au contenu</a>
<header class="hd"><a class="brand" href="#/home"></a>__NAVIN__<div class="langs" role="group" aria-label="Language"></div><select class="langsel" aria-label="Language"></select></header>
__NAVOUT__<main id="main" tabindex="-1"></main>
<script>__JS__</script></body></html>"""

DIRS = [(1, "Titre", CSS1), (2, "Mosaïque", CSS2), (3, "Console", CSS3)]
report = {}
PHOTO = photo()
for n, name, css in DIRS:
    js = (JS.replace("__DIR__", str(n)).replace("__S__", json.dumps(S, ensure_ascii=False))
          .replace("__ST__", json.dumps(STATES, ensure_ascii=False)).replace("__EMB__", json.dumps(emblem))
          .replace("__PHOTO__", json.dumps(PHOTO)))
    nav = '<nav class="nav" aria-label="Main"></nav>'
    html = (SHELL.replace("__N__", str(n)).replace("__NAME__", name).replace("__CSS__", FONTS + BASE + css)
            .replace("__NAVIN__", nav if n != 3 else "").replace("__NAVOUT__", nav if n == 3 else "")
            .replace("__JS__", js))
    (OUT / f"proto-{n}.html").write_text(html, encoding="utf-8")
    report[name] = dict(css_propre_o=len(css.encode()), css_socle_o=len(BASE.encode()), js_o=len(JS.encode()),
                        fichier_ko=round(len(html.encode()) / 1024))
print(json.dumps(report, ensure_ascii=False))
