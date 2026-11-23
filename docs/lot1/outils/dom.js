#!/usr/bin/env node
/* Non-régression du chargement par page : le DOM de chaque route doit être identique entre le fichier
   unique (toutes les données injectées) et le build lié (données chargées par page).

   Usage : python scripts/build_portail.py && python docs/lot1/outils/serve.py _site 8001 &
           node docs/lot1/outils/dom.js [http://127.0.0.1:8001/] [filtre de routes, expression régulière]

   Référence : <base>export/ (fichier unique, liens préfixés ../, retirés avant comparaison) ; essai :
   <base> (build lié). Pour chaque langue et écriture : chaque route ouverte dans une page neuve, puis
   la recherche (Ctrl+K, deux requêtes), puis un changement de langue sur un article. Sortie : routes
   divergentes (premier écart), erreurs console, JSON chargés par route dans le build lié. */
const {chromium} = require('playwright');

const BASE = process.argv[2] || 'http://127.0.0.1:8001/';
const FILTRE = new RegExp(process.argv[3] || '.');
const ROUTES_ALL = ['#/home', '#/states', '#/state/BA-01', '#/state/LK-20', '#/state/DA-08', '#/state/SA-92',
  '#/state/BK-95', '#/state/XX-99', '#/map', '#/map/LK-20', '#/map/LK-20/gospic', '#/institutions', '#/council', '#/security', '#/constitution',
  '#/constitution/preamble', '#/constitution/title-4', '#/constitution/title-4/art-110', '#/journal', '#/identity',
  '#/alphabet', '#/symbols', '#/autonomy', '#/participation', '#/dashboard', '#/register', '#/citizen', '#/confirm',
  '#/card', '#/access', '#/verify', '#/minor', '#/nimporte'];
const ROUTES = ROUTES_ALL.filter(r => FILTRE.test(r));
const NO_CMP = /^#\/map\/[A-Z]{2}-\d{2}\/./;
const LANGS = {en: ['en', 'lat'], zap: ['zap', 'lat'], 'sre-lat': ['sre', 'lat'], 'sre-cyr': ['sre', 'cyr'],
  'ist-cyr': ['ist', 'cyr']};
const QUERIES = ['110', 'gosp'];

const norm = s => s.replace(/\.\.\/(images|videos)\//g, '$1/')
  // carte (#/map) : le fichier unique n'a ni MapLibre ni communes (son worker exige http(s)) ; écarts
  // attendus, retirés avant comparaison : zoom masqué, moteur et libellés de MapLibre, liste des communes
  .replace(/(<div class="ca-zoom" id="caZoom" role="group") hidden=""/, '$1')
  .replace(/<h2>[^<]*<\/h2><ul class="ca-list ca-mun" id="caMun">[\s\S]*?<\/ul>/, '')
  // galerie des peuples, mélangée à chaque chargement (images/peoples/<clé>-<n>.jpg)
  .replace(/images\/peoples\/[a-z]+-\d+\.jpg/g, 'images/peoples/X.jpg');

async function snap(pg) {
  try { await pg.waitForLoadState('networkidle', {timeout: 10000}); } catch (e) {}
  await pg.waitForTimeout(400);
  return pg.evaluate(() => ({app: (() => {
    // carte : MapLibre (canevas, libellés) n'existe qu'en ligne ; on compare la page sans lui
    const a = document.getElementById('app').cloneNode(true);
    a.querySelectorAll('#caGl,#caLab').forEach(e => { e.innerHTML = ''; e.className = e.id === 'caGl' ? 'ca-gl' : 'ca-lab'; e.removeAttribute('style'); });
    const lg = a.querySelector('#caLegend'); if (lg) lg.innerHTML = '';   // niveau de la légende : celui du zoom de MapLibre
    const ca = a.querySelector('#ca'); if (ca) { ca.classList.add('ca-svg'); ca.classList.remove('ca-cut'); }
    return a.innerHTML;
  })(),
    head: document.querySelector('body>header').innerText, lang: document.documentElement.lang}));
}

function firstDiff(a, b) {
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  return `@${i} : « ${a.slice(Math.max(0, i - 60), i + 60)} » ≠ « ${b.slice(Math.max(0, i - 60), i + 60)} »`;
}

(async () => {
  const b = await chromium.launch({args: ['--no-sandbox']});
  let bad = 0, n = 0;
  const loaded = {};
  for (const [lname, [lang, script]] of Object.entries(LANGS)) {
    const mk = async () => {
      const ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
      await ctx.addInitScript(`try{localStorage.setItem('bk-lang','${lang}');localStorage.setItem('bk-script-${lang}','${script}')}catch(e){}`);
      return ctx;
    };
    const cref = await mk(), ctest = await mk();
    for (const r of ROUTES) {
      const out = [];
      for (const [ctx, url] of [[cref, BASE + 'export/' + r], [ctest, BASE + r]]) {
        const pg = await ctx.newPage(), errs = [], json = [];
        pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
        pg.on('pageerror', e => errs.push(String(e)));
        pg.on('requestfinished', q => { if (/\/data\/.*\.json/.test(q.url())) json.push(q.url().replace(/^.*\/data\/|\?.*$/g, '')); });
        await pg.goto(url, {waitUntil: 'load'});
        const s = await snap(pg);
        const srch = [];
        for (const q of QUERIES) {
          await pg.keyboard.press('Control+k');
          // le champ prend le focus par setTimeout : sur la carte en WebGL logiciel, le fil est occupé
          await pg.waitForFunction(() => document.activeElement && document.activeElement.id === 'searchInput', null, {timeout: 5000}).catch(() => {});
          await pg.waitForTimeout(150);
          await pg.keyboard.type(q);
          try { await pg.waitForLoadState('networkidle', {timeout: 8000}); } catch (e) {}
          await pg.waitForTimeout(300);
          srch.push(await pg.evaluate(() => document.getElementById('searchResults').innerHTML));
          await pg.keyboard.press('Escape');
        }
        out.push({...s, srch: srch.join('\n'), errs, json});
        await pg.close();
      }
      const [x, y] = out; n++;
      const pairs = [['app', norm(x.app), norm(y.app)], ['en-tête', x.head, y.head], ['lang', x.lang, y.lang],
        ['recherche', norm(x.srch), norm(y.srch)]];
      // une commune n'existe qu'en ligne : le fichier unique montre son État (seules les erreurs comptent)
      const diffs = NO_CMP.test(r) ? [] : pairs.filter(p => p[1] !== p[2]);
      if (diffs.length || y.errs.length || x.errs.length) {
        bad++;
        console.log(`✗ ${lname} ${r}`);
        for (const [k, p, q] of diffs) console.log(`    ${k} ${firstDiff(p, q)}`);
        if (x.errs.length || y.errs.length) console.log(`    erreurs : réf ${x.errs.join(' | ')} ; lié ${y.errs.join(' | ')}`);
      }
      if (lname === 'en' || lname === 'sre-lat') loaded[`${lname} ${r}`] = [...new Set(y.json)].sort().join(' ');
    }
    // changement de langue sur un article : EN → langue, même DOM que l'ouverture directe
    if (lang !== 'en' && FILTRE.test('#/constitution/title-4/art-110')) {
      const res = [];
      for (const pre of ['export/', '']) {
        const ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
        await ctx.addInitScript(`try{if(!sessionStorage.getItem('x')){sessionStorage.setItem('x',1);localStorage.setItem('bk-lang','en');localStorage.setItem('bk-script-${lang}','${script}')}}catch(e){}`);
        const pg = await ctx.newPage();
        await pg.goto(BASE + pre + '#/constitution/title-4/art-110', {waitUntil: 'load'});
        await snap(pg);
        await pg.click(`#langsel button[data-l="${lang}"]`);
        res.push(norm((await snap(pg)).app));
        await ctx.close();
      }
      n++;
      if (res[0] !== res[1]) { bad++; console.log(`✗ ${lname} bascule de langue sur l'article 110 ${firstDiff(res[0], res[1])}`); }
    }
    await cref.close(); await ctest.close();
  }
  await b.close();
  console.log(`${n} comparaisons, ${bad} divergentes`);
  console.log(JSON.stringify(loaded, null, 1));
})();
