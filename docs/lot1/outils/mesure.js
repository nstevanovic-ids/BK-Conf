#!/usr/bin/env node
/* Mesures du lot 1 : Lighthouse mobile, captures et contrôles de page.

   Usage (le site à mesurer servi par serve.py, en gzip comme GitHub Pages) :
     python docs/lot1/outils/serve.py <dossier> 8000 &
     node docs/lot1/outils/mesure.js --base http://127.0.0.1:8000/ --out docs/lot1/mesures/<étiquette> \
          [--runs 3] [--lh <chemin de lighthouse>] [--no-lh] [--no-captures] [--label "<texte>"]

   Lighthouse 13.6 (npx lighthouse@13.6.0), mobile simulé par défaut (Moto G Power, 4G lente), comme
   l'audit (docs/audit/lighthouse-avant.json, branche claude/audit-refonte-visuelle). Chaque route est
   mesurée --runs fois ; on garde la médiane de chaque indicateur et les valeurs de chaque passage.

   Captures : les routes de docs/audit/capture.py, à 375, 768 et 1440 px, mouvement réduit (images
   stables), puis les pages clés dans les quatre langues. Pour chaque capture : erreurs console,
   débordement horizontal, nombre de h1, page vide ou non. PNG convertis en WebP (Pillow). */
const {chromium} = require('playwright');
const {execFileSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes(k);
const BASE = arg('--base', 'http://127.0.0.1:8000/');
const OUT = arg('--out', 'docs/lot1/mesures/tmp');
const RUNS = parseInt(arg('--runs', '3'), 10);
const LH = arg('--lh', 'lighthouse');
const LABEL = arg('--label', '');
const CHROME = chromium.executablePath();

const LH_ROUTES = (arg('--routes', '') ? arg('--routes', '').split(',') : ['#/home', '#/states', '#/state/LK-20', '#/state/BA-01',
  '#/constitution', '#/constitution/title-4/art-110', '#/map']);
const PAGES = {home: '#/home', states: '#/states', 'state-film': '#/state/BA-01', 'state-blason': '#/state/LK-20',
  'state-simple': '#/state/DA-08', 'state-ville': '#/state/SA-92', 'state-muni': '#/state/BK-95', map: '#/map',
  'map-etat': '#/map/LK-20', 'map-commune': '#/map/LK-20/gospic', 'map-103': '#/map/art-103', 'map-110': '#/map/art-110',
  institutions: '#/institutions', council: '#/council', security: '#/security', constitution: '#/constitution',
  'constitution-titre': '#/constitution/title-4', 'constitution-art': '#/constitution/title-4/art-110',
  'constitution-textes': '#/constitution/title-4/art-110/en-sre-fr', 'constitution-introuvable': '#/constitution/art-999',
  journal: '#/journal', identity: '#/identity', alphabet: '#/alphabet', symbols: '#/symbols', autonomy: '#/autonomy',
  participation: '#/participation', dashboard: '#/dashboard', register: '#/register', citizen: '#/citizen',
  verify: '#/verify', minor: '#/minor', 'err-route': '#/nimporte', 'err-state': '#/state/XX-99'};
const LANGS = {zap: ['zap', 'lat'], 'sre-lat': ['sre', 'lat'], 'sre-cyr': ['sre', 'cyr'], 'ist-cyr': ['ist', 'cyr'],
  'ist-lat': ['ist', 'lat']};
const LANG_PAGES = ['home', 'states', 'state-blason', 'institutions', 'constitution', 'constitution-art', 'constitution-textes',
  'map', 'map-etat', 'map-110'];

const median = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const r1 = x => Math.round(x * 10) / 10, r3 = x => Math.round(x * 1000) / 1000;

function snippetOf(audit) {
  const s = JSON.stringify((audit || {}).details || {}).match(/"snippet":"((?:[^"\\]|\\.)*)"/);
  return s ? JSON.parse('"' + s[1] + '"').slice(0, 160) : null;
}

function lighthouse() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lh-'));
  const res = {_: `Lighthouse 13.6, mobile simulé (Moto G Power, 4G lente), servi en gzip comme GitHub Pages ` +
    `(docs/lot1/outils/serve.py) ; médiane de ${RUNS} passages ; ${new Date().toISOString().slice(0, 10)}` +
    (LABEL ? ` ; ${LABEL}` : '')};
  for (const route of LH_ROUTES) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const out = path.join(tmp, `r${i}.json`);
      try {
        execFileSync(LH, [BASE + route, '--quiet', '--output=json', `--output-path=${out}`,
          '--only-categories=performance,accessibility,best-practices,seo',
          '--chrome-flags=--headless=new --no-sandbox'], {env: {...process.env, CHROME_PATH: CHROME}, stdio: 'ignore',
          timeout: 240000});
      } catch (e) { if (!fs.existsSync(out)) { console.error('lighthouse a échoué', route, e.message); continue; } }
      const l = JSON.parse(fs.readFileSync(out, 'utf8')), a = l.audits, c = l.categories;
      runs.push({
        performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100),
        'best-practices': Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100),
        FCP_s: r1(a['first-contentful-paint'].numericValue / 1000),
        LCP_s: r1(a['largest-contentful-paint'].numericValue / 1000),
        TBT_ms: Math.round(a['total-blocking-time'].numericValue), CLS: r3(a['cumulative-layout-shift'].numericValue),
        SI_s: r1(a['speed-index'].numericValue / 1000), TTI_s: r1((a.interactive || {}).numericValue / 1000 || 0),
        poids_ko: Math.round(a['total-byte-weight'].numericValue / 1024),
        requetes: ((a['network-requests'].details || {}).items || []).length,
        lcp_element: snippetOf(a['lcp-breakdown-insight'] || a['largest-contentful-paint-element']),
      });
      process.stdout.write(`  ${route} passage ${i + 1} : perf ${runs.at(-1).performance}, LCP ${runs.at(-1).LCP_s} s\n`);
    }
    if (!runs.length) continue;
    const med = {};
    for (const k of Object.keys(runs[0])) {
      med[k] = typeof runs[0][k] === 'number' ? median(runs.map(r => r[k])) : runs[runs.length >> 1][k];
    }
    res[route] = {...med, passages: runs.map(({lcp_element, ...r}) => r)};
  }
  fs.writeFileSync(path.join(OUT, 'lighthouse.json'), JSON.stringify(res, null, 1));
  fs.rmSync(tmp, {recursive: true, force: true});
}

async function shoot(ctx, name, hash, file, metrics, key) {
  const pg = await ctx.newPage(), errs = [], reqs = [];
  pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('requestfinished', r => reqs.push(r.url()));
  const t0 = Date.now();
  await pg.goto(BASE + hash, {waitUntil: 'load'});
  try { await pg.waitForLoadState('networkidle', {timeout: 15000}); } catch (e) {}
  await pg.waitForTimeout(name.startsWith('map') ? 6000 : 1500);   // carte : MapLibre, au repos
  await pg.screenshot({path: file});
  const m = await pg.evaluate(() => ({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    h: document.documentElement.scrollHeight, h1: document.querySelectorAll('h1').length,
    app: (document.getElementById('app') || {}).textContent ? document.getElementById('app').textContent.trim().length : 0,
    lang: document.documentElement.lang, title: document.title,
  }));
  m.debordement = m.sw > m.cw; m.erreurs = errs; m.ms = Date.now() - t0;
  m.requetes = reqs.length; m.json = reqs.filter(u => /\.json(\?|$)/.test(u)).map(u => u.replace(/^.*\/data\//, ''));
  metrics[key] = m;
  await pg.close();
}

async function captures() {
  const dir = path.join(OUT, 'captures');
  fs.mkdirSync(dir, {recursive: true});
  const metrics = {};
  const b = await chromium.launch({args: ['--no-sandbox']});
  for (const [w, h] of [[375, 812], [768, 1024], [1440, 900]]) {
    const ctx = await b.newContext({viewport: {width: w, height: h}, reducedMotion: 'reduce'});
    for (const [name, hash] of Object.entries(PAGES)) await shoot(ctx, name, hash, path.join(dir, `${name}-${w}.png`), metrics, `${name}-${w}`);
    await ctx.close();
  }
  for (const [lname, [lang, script]] of Object.entries(LANGS)) {
    for (const w of [375, 1440]) {
      const ctx = await b.newContext({viewport: {width: w, height: w === 375 ? 812 : 900}, reducedMotion: 'reduce'});
      await ctx.addInitScript(`try{localStorage.setItem('bk-lang','${lang}');localStorage.setItem('bk-script-${lang}','${script}')}catch(e){}`);
      for (const name of LANG_PAGES) await shoot(ctx, name, PAGES[name], path.join(dir, `${name}-${lname}-${w}.png`), metrics, `${name}-${lname}-${w}`);
      await ctx.close();
    }
  }
  // thème sombre : le lecteur à 375 et 1440 px
  for (const w of [375, 1440]) {
    const ctx = await b.newContext({viewport: {width: w, height: w === 375 ? 812 : 900}, reducedMotion: 'reduce', colorScheme: 'dark'});
    await ctx.addInitScript(`try{localStorage.setItem('bk-theme','dark')}catch(e){}`);
    for (const name of ['constitution', 'constitution-art', 'constitution-textes', 'map', 'map-etat'])
      await shoot(ctx, name, PAGES[name], path.join(dir, `${name}-sombre-${w}.png`), metrics, `${name}-sombre-${w}`);
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, 'pages.json'), JSON.stringify(metrics, null, 1));
  // PNG → WebP (qualité 70) : les captures restent lisibles et légères dans le dépôt.
  execFileSync('python3', ['-I', '-c', `
import sys, pathlib
from PIL import Image
for p in pathlib.Path(sys.argv[1]).glob('*.png'):
    Image.open(p).save(p.with_suffix('.webp'), 'WEBP', quality=70, method=6); p.unlink()
`, dir]);
  const bad = Object.entries(metrics).filter(([, m]) => m.erreurs.length || m.debordement || !m.app);
  console.log(`${Object.keys(metrics).length} captures ; ${bad.length} avec erreur, débordement ou page vide`);
  for (const [k, m] of bad) console.log(`  ${k} : ${m.debordement ? `débordement ${m.sw}/${m.cw} ` : ''}${m.app ? '' : 'page vide '}${m.erreurs.join(' | ').slice(0, 200)}`);
}

(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  if (!has('--no-captures')) await captures();
  if (!has('--no-lh')) lighthouse();
})();
