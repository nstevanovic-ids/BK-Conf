#!/usr/bin/env node
/* Lecteur de la Constitution : une seule sélection, un texte dans une écriture (retour de l'auteur du
   2026-11-24). Scénarios dans un navigateur neuf ou avec d'anciens réglages (écriture mémorisée, ancienne
   double ligne) : option cochée, adresse, texte de l'al. 3 de l'art. 110, absence de <ruby>, débordement.

   Usage : python scripts/build_portail.py && python docs/lot1/outils/serve.py _site 8001 &
           node docs/lot1/outils/selection.js <dossier des captures> [http://127.0.0.1:8001/] > scenarios.json */
const {chromium} = require('playwright');
const dir = process.argv[2];
const BASE = process.argv[3] || 'http://127.0.0.1:8001/';
const out = [];
const state = pg => pg.evaluate(() => {
  const c = document.querySelector('#art-110 .cx-cell.cx-c1[data-u="2"] .cx-u') || document.querySelector('#art-110 .cx-cell .cx-u');
  return {
    hash: location.hash,
    checked: [...document.querySelectorAll('#cx .cx-chips [aria-checked="true"]')].map(b => b.textContent),
    chips: [...document.querySelectorAll('#cx .cx-chips [data-c]')].map(b => b.textContent).join(' '),
    ruby: document.querySelectorAll('#cx ruby').length,
    dblBtn: !!document.getElementById('cxDbl'),
    text: c ? c.textContent.slice(0, 48) : null,
    loc: (document.getElementById('cxLoc') || {}).textContent,
    dblKey: localStorage.getItem('bk-cx-dbl'),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
});
async function scenario(b, name, store, hash, steps = [], w = 1440) {
  const ctx = await b.newContext({viewport: {width: w, height: w < 500 ? 812 : 900}, reducedMotion: 'reduce'});
  await ctx.addInitScript(`if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');try{${Object.entries(store).map(([k, v]) => `localStorage.setItem('${k}','${v}');`).join('')}}catch(e){}}`);
  const pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(BASE + hash, {waitUntil: 'load'});
  await pg.waitForTimeout(2500);
  const res = {name, steps: [{at: 'ouverture', ...(await state(pg))}]};
  for (const st of steps) {
    if (st.chip) await pg.click(`#cx .cx-chips [data-c="${st.chip}"]`);
    if (st.key) await pg.keyboard.press(st.key);
    if (st.header) await pg.click(`#scriptsel button[data-s="${st.header}"]`);
    if (st.go) await pg.goto(BASE + st.go);
    await pg.waitForTimeout(1500);
    res.steps.push({at: JSON.stringify(st), ...(await state(pg))});
  }
  if (name.includes('375')) await pg.screenshot({path: `${dir}/u-${name}.png`});
  else await pg.screenshot({path: `${dir}/u-${name}.png`, clip: {x: 0, y: 0, width: w, height: 420}});
  res.errs = errs;
  out.push(res);
  await ctx.close();
}
(async () => {
  const b = await chromium.launch({args: ['--no-sandbox']});
  const A = '#/constitution/title-4/art-110';
  await scenario(b, 'en-neuf', {}, A, [{chip: 'ist'}, {chip: 'ist-lat'}, {chip: 'sre-cyr'}, {chip: 'fr'}, {key: 'ArrowLeft'}]);
  await scenario(b, 'ist-neuf', {'bk-lang': 'ist'}, A, []);
  await scenario(b, 'ist-anciens-reglages', {'bk-lang': 'ist', 'bk-script-ist': 'lat', 'bk-cx-dbl': '1'}, A, [{header: 'cyr'}, {header: 'lat'}]);
  await scenario(b, 'sre-anciens-reglages', {'bk-lang': 'sre', 'bk-script': 'cyr', 'bk-script-sre': 'cyr', 'bk-cx-dbl': '1'}, A, [{chip: 'sre-cyr'}, {chip: 'ist'}]);
  await scenario(b, 'adresse-sre-cyr', {}, A + '/sre-cyr', [{go: A + '/ist-lat'}]);
  await scenario(b, 'ist-375', {'bk-lang': 'ist'}, A, [], 375);
  await scenario(b, 'zap-375', {'bk-lang': 'zap'}, A, [{chip: 'sre-cyr'}], 375);
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
