#!/usr/bin/env node
/* Quelles données chaque route lit-elle vraiment ? (table route → données du chargement par page)

   Usage : python scripts/build_portail.py --inline
           node docs/lot1/outils/usage.js [balkanska_konfederacija.html] > usage.json

   Copie instrumentée du fichier unique : chaque donnée globale (PEUPLES, STATES, STATE_FLAGS…) est
   enveloppée dans un Proxy qui note la première lecture ; CONS_TR note le standard lu. Chaque route est
   ouverte dans une page neuve, dans les quatre langues ; on relève ce qui a été lu au rendu, puis
   après ouverture de la recherche (Ctrl+K) et une frappe. */
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SRC = process.argv[2] || 'balkanska_konfederacija.html';
const GLOBALS = ['PEUPLES', 'STATES', 'AUT', 'ALPHA', 'STATE_FLAGS', 'FLAGNOTE', 'GEO', 'CONSTITUTION', 'CONS_TR',
  'STATS', 'LIGHTS', 'OPSTINE', 'VIDEOS', 'I18N', 'TX', 'REGISTRE'];
const ROUTES = ['#/home', '#/states', '#/state/BA-01', '#/state/LK-20', '#/state/DA-08', '#/state/SA-92',
  '#/state/BK-95', '#/map', '#/institutions', '#/council', '#/security', '#/constitution', '#/constitution/preamble',
  '#/constitution/title-4', '#/constitution/title-4/art-110', '#/journal', '#/identity', '#/alphabet', '#/symbols',
  '#/autonomy', '#/participation', '#/dashboard', '#/register', '#/citizen', '#/confirm', '#/card', '#/access',
  '#/verify', '#/minor', '#/nimporte', '#/state/XX-99'];
const LANGS = ['en', 'zap', 'sre', 'ist'];

let html = fs.readFileSync(SRC, 'utf8');
const TRACK = `<script>window.__USED=new Set();window.__t=(n,o)=>(o&&typeof o==='object')?new Proxy(o,{get(t,k,r){
  if(typeof k==='string')window.__USED.add(n==='CONS_TR'?n+'.'+k:n);return Reflect.get(t,k,r);}}):o;</script>`;
html = html.replace('<head>', '<head>' + TRACK);
let n = 0;
for (const g of GLOBALS) {
  // affectations du build inline, une par ligne : X={…}; ou REGISTRE={...REGISTRE,...{…}};
  const re = new RegExp(`^${g}=(.*);$`, 'm');
  if (re.test(html)) { html = html.replace(re, (m, v) => `${g}=__t('${g}',${v});`); n++; }
}
if (n !== GLOBALS.length) { console.error(`instrumentation incomplète : ${n}/${GLOBALS.length}`); process.exit(1); }
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'usage-')), 'index.html');
fs.writeFileSync(tmp, html);

(async () => {
  const b = await chromium.launch({args: ['--no-sandbox', '--allow-file-access-from-files']});
  const out = {};
  for (const lang of LANGS) {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
    await ctx.addInitScript(`try{localStorage.setItem('bk-lang','${lang}')}catch(e){}`);
    for (const r of ROUTES) {
      const pg = await ctx.newPage(), errs = [];
      pg.on('pageerror', e => errs.push(String(e)));
      await pg.goto('file://' + tmp + r);
      await pg.waitForTimeout(r === '#/map' ? 2500 : 700);
      const render = await pg.evaluate(() => [...window.__USED].sort());
      await pg.keyboard.press('Control+k');
      await pg.waitForTimeout(200);
      await pg.keyboard.type('110 gos');
      await pg.waitForTimeout(400);
      const search = await pg.evaluate(() => [...window.__USED].sort());
      out[`${lang} ${r}`] = {render, search: search.filter(x => !render.includes(x)), errs};
      await pg.close();
    }
    await ctx.close();
  }
  await b.close();
  console.log(JSON.stringify(out, null, 1));
})();
