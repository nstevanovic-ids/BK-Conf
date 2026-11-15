#!/usr/bin/env python3
"""Captures d'audit : chaque type de page en 375, 768 et 1440 px.
Usage : (cd portail && python -m http.server 8000) & python docs/audit/capture.py [dossier]"""
import sys, json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "docs/audit/captures"); OUT.mkdir(parents=True, exist_ok=True)
BASE = "http://localhost:8000/index.html"
PAGES = {"home":"#/home","states":"#/states","state-film":"#/state/BA-01","state-blason":"#/state/LK-20",
 "state-simple":"#/state/DA-08","state-ville":"#/state/SA-92","state-muni":"#/state/BK-95","map":"#/map",
 "institutions":"#/institutions","council":"#/council","security":"#/security","constitution":"#/constitution",
 "journal":"#/journal","identity":"#/identity","alphabet":"#/alphabet","symbols":"#/symbols","autonomy":"#/autonomy",
 "participation":"#/participation","dashboard":"#/dashboard","register":"#/register","citizen":"#/citizen",
 "verify":"#/verify","minor":"#/minor","err-route":"#/nimporte","err-state":"#/state/XX-99"}
LANGS = {"sre-lat":("sre","lat"),"sre-cyr":("sre","cyr"),"ist-cyr":("ist","cyr"),"zap":("zap","lat")}
metrics = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for w, h in ((375, 812), (768, 1024), (1440, 900)):
        ctx = b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
        pg = ctx.new_page(); errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        for name, hsh in PAGES.items():
            pg.goto(BASE + hsh); pg.reload(); pg.wait_for_timeout(1500 if name != "map" else 4000)
            pg.screenshot(path=str(OUT / f"{name}-{w}.png"), full_page=False)
            m = pg.evaluate("""()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
              h:document.documentElement.scrollHeight,title:document.title,h1:document.querySelectorAll('h1').length,
              imgs:document.querySelectorAll('img').length,noalt:[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).length,
              emptyalt:[...document.querySelectorAll('img')].filter(i=>i.getAttribute('alt')==='').length,
              lang:document.documentElement.lang,langblocks:document.querySelectorAll('#app [lang]').length})""")
            m["errors"] = errs[:]; errs.clear(); metrics[f"{name}-{w}"] = m
        ctx.close()
    for lname, (lang, script) in LANGS.items():
        for w in (375, 1440):
            ctx = b.new_context(viewport={"width": w, "height": 812 if w == 375 else 900}, reduced_motion="reduce")
            ctx.add_init_script(f"localStorage.setItem('bk-lang','{lang}');localStorage.setItem('bk-script-{lang}','{script}')")
            pg = ctx.new_page()
            for name in ("home", "states", "state-blason", "institutions", "constitution"):
                pg.goto(BASE + PAGES[name]); pg.reload(); pg.wait_for_timeout(1500)
                pg.screenshot(path=str(OUT / f"{name}-{lname}-{w}.png"))
                metrics[f"{name}-{lname}-{w}"] = pg.evaluate("()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,lang:document.documentElement.lang})")
            ctx.close()
    b.close()
(OUT / "metrics.json").write_text(json.dumps(metrics, indent=1, ensure_ascii=False))
print(len(metrics), "captures")
