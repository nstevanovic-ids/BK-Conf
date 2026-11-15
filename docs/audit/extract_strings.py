#!/usr/bin/env python3
"""Relève dans le portail servi en local les chaînes affichées, dans les cinq variantes
(en, zap, sre latin, sre cyrillique, ist cyrillique), pour les prototypes. Aucune chaîne
n'est traduite ici : tout vient du rendu du portail.
Usage : python docs/audit/extract_strings.py [http://localhost:8000/index.html]"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/index.html"
VARS = {"en": ("en", None), "zap": ("zap", "lat"), "sre": ("sre", "lat"), "sre-cyr": ("sre", "cyr"), "ist-cyr": ("ist", "cyr")}
JS_HOME = """()=>{const tx=e=>{const c=e.cloneNode(true);c.querySelectorAll('br').forEach(b=>b.replaceWith(' '));return c.textContent.replace(/\\s+/g,' ').trim()};
const t=s=>{const e=document.querySelector(s);return e?tx(e):''};
const all=s=>[...document.querySelectorAll(s)].map(tx);
return {nav:all('header nav a'),brand:t('header .brand b'),brandSub:t('header .brand span'),register:t('#utReg'),search:t('.sb-lab'),
 htmlLang:document.documentElement.lang,
 eyebrow:document.querySelector('.hero-inner .eyebrow').textContent.trim(),h1:t('.hero-inner h1'),lead:t('.hero-inner .lead'),motto:t('.hero-inner .motto'),cta:all('.hero-actions a'),
 unionH:t('#app>section:nth-of-type(2) h2'),unionP:t('#app>section:nth-of-type(2) .lead'),
 figs:[...document.querySelectorAll('.figs .fig')].map(f=>[f.querySelector('b').textContent.trim(),f.querySelector('span').textContent.trim()]),
 bands:all('.band-q'),bandSub:t('.band-sub'),
 feats:[...document.querySelectorAll('.feat')].map(f=>[f.querySelector('h2').innerText.trim(),f.querySelector('.lead').innerText.replace(/\\s+/g,' ').trim(),f.querySelector('a.btn').innerText.replace(/[→\\s]+$/,'').trim()]),
 exploreH:t('.h2row h2'),
 cards:[...document.querySelectorAll('.pcard')].map(c=>[c.querySelector('.pc-eye').textContent.trim(),c.querySelector('h3').innerText.trim(),c.querySelector('p').innerText.replace(/\\s+/g,' ').trim()]),
 journalH:all('.split-32 .h2row h2')[0]||'',
 journal:[...document.querySelectorAll('.jlist')][0]?[...document.querySelectorAll('.jlist')][0].children.length:0,
 journalRows:[...([...document.querySelectorAll('.jlist')][0]||{children:[]}).children].slice(0,3).map(r=>[...r.querySelectorAll('*')].filter(e=>e.childElementCount==0&&e.textContent.trim()).map(e=>e.textContent.replace(/\\s+/g,' ').trim()))}}"""
JS_STATES = """()=>{const t=s=>{const e=document.querySelector(s);return e?e.innerText.replace(/\\s+/g,' ').trim():''};
return {eyebrow:t('#app .eyebrow'),h1:t('#app h1'),lead:t('#app .lead'),ph:document.querySelector('#app input').placeholder,
 chips:[...document.querySelectorAll('#app input ~ button, #app .chips button, #app .filters button')].map(b=>b.innerText.trim()),
 cards:Object.fromEntries([...document.querySelectorAll('a.scard')].map(c=>[c.getAttribute('href').slice(8),[c.querySelector('h3').innerText.trim(),c.querySelector('.speu').innerText.trim(),c.querySelector('.spop').innerText.trim()]]))}}"""
JS_STATE = """()=>({crumb:[...document.querySelectorAll('.breadcrumb a, .breadcrumb b, .breadcrumb span')].map(e=>e.innerText.trim()).filter(x=>x&&x!=='›'),
 type:document.querySelector('#app .detail .eyebrow').textContent.trim(),
 rows:[...document.querySelectorAll('.dtable tr')].map(r=>[...r.children].map(td=>td.textContent.replace(/\\s+/g,' ').trim()))})"""
JS_CONS = """()=>({h:[...document.querySelectorAll('#app h1, #app h2')].map(e=>e.innerText.replace(/\\s+/g,' ').trim()).slice(0,3),
 crumb:[...document.querySelectorAll('.breadcrumb a, .breadcrumb b, .breadcrumb span')].map(e=>e.innerText.trim()).filter(x=>x&&x!=='›'),
 arts:[...document.querySelectorAll('article.cart')].map(a=>({id:a.id,num:a.querySelector('.cnum').textContent.trim(),name:a.querySelector('h3').innerText.trim(),
   body:[...a.querySelectorAll('p, li')].map(p=>p.innerText.replace(/\\s+/g,' ').trim())}))})"""
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for v, (lang, script) in VARS.items():
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        init = f"localStorage.setItem('bk-lang','{lang}');"
        if script: init += f"localStorage.setItem('bk-script-{lang}','{script}');"
        ctx.add_init_script(init)
        pg = ctx.new_page(); o = {}
        for key, h, js in (("home", "#/home", JS_HOME), ("states", "#/states", JS_STATES), ("state", "#/state/LK-20", JS_STATE), ("cons", "#/constitution/title-1", JS_CONS)):
            pg.goto(BASE + h); pg.reload(); pg.wait_for_timeout(1600); o[key] = pg.evaluate(js)
        pg.evaluate("openSearch()"); pg.wait_for_timeout(300)
        o["searchPh"] = pg.evaluate("document.activeElement.placeholder||''")
        pg.keyboard.type("zzzzqq"); pg.wait_for_timeout(400)
        o["noMatch"] = pg.evaluate("(document.activeElement.closest('[role=dialog]').innerText.split('\\n').map(x=>x.trim()).filter(Boolean))[1]||''")
        o["langs"] = pg.evaluate("[...document.querySelectorAll('header button')].filter(b=>/^(EN|ZAP|SRE|IST|ЗАП|СРЕ|ИСТ)$/i.test(b.innerText.trim())).map(b=>[b.innerText.trim(),b.title||b.getAttribute('aria-label')||''])")
        out[v] = o; ctx.close()
    b.close()
Path(__file__).with_name("proto-strings.json").write_text(json.dumps(out, ensure_ascii=False, indent=0), encoding="utf-8")
print({v: len(json.dumps(o)) for v, o in out.items()})
