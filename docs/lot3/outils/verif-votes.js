#!/usr/bin/env node
/* Vérification de la page des votes (#/votes) dans le portail : les points de la critique de Sabor repris
   par le plan (docs/lot3/PLAN.md) et les quatre corrections demandées par l'auteur.

   Usage : python docs/lot1/outils/serve.py _site 8001 &
           node docs/lot3/outils/verif-votes.js [http://127.0.0.1:8001/] [sortie.json] */
const {chromium} = require('playwright');
const fs = require('fs');
const U = process.argv[2] || 'http://127.0.0.1:8001/';
const OUT = process.argv[3];

(async () => {
  const b = await chromium.launch({args: ['--no-sandbox']}); const out = {}, errs = [];
  const page = async (opt = {}) => {
    const c = await b.newContext({viewport: opt.vp || {width: 1440, height: 900}, reducedMotion: opt.rm ? 'reduce' : 'no-preference',
      colorScheme: opt.dark ? 'dark' : 'light', hasTouch: !!opt.touch, isMobile: !!opt.touch});
    if (opt.dark) await c.addInitScript(() => { try { localStorage.setItem('bk-theme', 'dark'); } catch (e) {} });
    const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    return [c, p];
  };
  const open = async (p, h) => { await p.goto(U + h); await p.waitForSelector('.vo-u', {state: 'attached'}); await p.waitForTimeout(1500); };
  /* B3 : commandes et verdict à l'écran à 1440 × 900 ; I5 : tabulations jusqu'au premier disque ; ✓ ✕ */
  { const [c, p] = await page(); await open(p, '#/votes');
    out.B3 = await p.evaluate(() => { const r = s => Math.round(document.querySelector(s).getBoundingClientRect().bottom);
      return {types_bas: r('.vo-types'), cas_bas: r('.vo-scl'), scene_haut: Math.round(document.getElementById('voStage').getBoundingClientRect().top), verdict_bas: r('#voPv')}; });
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    let n = 0; for (; n < 80; n++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => document.activeElement.classList.contains('vo-u'))) break; }
    out.I5_tabulations = n + 1;
    out.marques = await p.evaluate(() => [...document.querySelectorAll('.vo-g')].map(g => ({jauge: g.dataset.g, marque: g.querySelector('.vo-g-st i').textContent,
      cachee: g.querySelector('.vo-g-st i').getAttribute('aria-hidden'), texte: g.querySelector('.vo-g-st .vo-vh').textContent})));
    /* commandes de délégation dans les deux dispositions */
    const vis = () => p.evaluate(() => { const v = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      return {delegation: [...document.querySelectorAll('[data-go]')].filter(v).length, membres: [...document.querySelectorAll('[data-step]')].filter(v).length}; });
    out.commandes = {peuples: await vis()};
    await p.click('#voLay [data-lay="map"]'); await p.waitForTimeout(1800);
    out.commandes.carte = await vis();
    out.commandes.carte_chevauchements = await p.evaluate(() => { const u = [...document.querySelectorAll('.vo-u')].map(e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width / 2]; });
      let k = 0; for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) if (Math.hypot(u[i][0] - u[j][0], u[i][1] - u[j][1]) < u[i][2] + u[j][2] - 1) k++; return k; });
    await c.close(); }
  /* B4 : alarme levée, deux tiers au Kongres : la loi reste suspendue */
  { const [c, p] = await page({rm: true}); await open(p, '#/votes/ordinary-law/alarm');
    await p.click('#voTbl summary');
    for (const code of ['KR-17', 'ST-35', 'IS-14', 'KV-18', 'DJ-09', 'SX-37', 'ZG-94', 'SI-31', 'TU-42', 'DA-08']) await p.check(`input[name="v-${code}"][value="f"]`, {force: true});
    await p.waitForTimeout(300);
    out.B4 = await p.evaluate(() => ({verdict: document.querySelector('#voPv strong').textContent, pour: document.getElementById('voHn-f').textContent,
      ligne: document.querySelector('.vo-pv-l').textContent.trim().slice(0, 70)}));
    await c.close(); }
  /* I1 : au toucher, sélection seule */
  { const [c, p] = await page({vp: {width: 375, height: 812}, touch: true}); await open(p, '#/votes');
    const el = await p.$('.vo-u[data-c="BC-02"]'); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    const o0 = await p.evaluate(() => document.querySelector('.vo-u[data-c="BC-02"]').dataset.o), bb = await el.boundingBox();
    await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(400);
    out.I1 = await p.evaluate(o0 => ({avant: o0, apres: document.querySelector('.vo-u[data-c="BC-02"]').dataset.o, choisi: (document.querySelector('.vo-u.vo-sel') || {dataset: {}}).dataset.c,
      fiche: !document.querySelector('.vo-pcard').hidden, petits: [...document.querySelectorAll('.vo-u')].filter(u => u.getBoundingClientRect().width < 24).length,
      debordement: document.documentElement.scrollWidth > innerWidth}), o0);
    await c.close(); }
  /* F10 : mouvement réduit ; I7 : Veće */
  { const [c, p] = await page({rm: true}); const req = []; p.on('request', r => req.push(r.url())); await open(p, '#/votes'); await p.waitForTimeout(1500);
    out.F10 = await p.evaluate(() => ({avis: !document.getElementById('voRm').hidden, texte: document.getElementById('voRm').textContent, decrit: document.getElementById('voUnits').getAttribute('aria-describedby')}));
    out.F10.d3force = req.some(u => /d3-force/.test(u));
    await open(p, '#/votes/council/four-councillors');
    out.I7 = await p.evaluate(() => ({sieges: document.querySelectorAll('.vo-seat').length, disques_visibles: [...document.querySelectorAll('.vo-u')].filter(u => getComputedStyle(document.getElementById('voUnits')).visibility !== 'hidden').length,
      verdict: document.querySelector('#voPv strong').textContent}));
    await c.close(); }
  /* thèmes clair et sombre : contrastes (texte, puis formes contre le fond de la page) */
  for (const dark of [false, true]) { const [c, p] = await page({dark}); await open(p, '#/votes/consent/five-delegations');
    out[dark ? 'sombre' : 'clair'] = await p.evaluate(() => {
      const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
      const cr = (a, b) => { const x = lum(a), y = lum(b); return Math.round((Math.max(x, y) + .05) / (Math.min(x, y) + .05) * 100) / 100; };
      const bg = e => { while (e) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; e = e.parentElement; } return 'rgb(255,255,255)'; };
      const txt = s => { const e = document.querySelector(s); return e ? [s, cr(getComputedStyle(e).color, bg(e))] : [s, null]; };
      const vo = getComputedStyle(document.getElementById('vo')), page = getComputedStyle(document.body).backgroundColor;
      const tone = v => { const d = document.createElement('i'); d.style.color = vo.getPropertyValue(v); document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      const on = (fg, b) => cr(tone(fg), tone(b));
      return {texte: ['.vo-pv-k', '.vo-g-req', '.vo-g-hyp', '.vo-cap', '.vo-lm', '.vo-hu', '.vo-tbtn small', '.vo-sbtn span', '.vo-q', '.vo-legend', '.vo-dn'].map(txt),
        sur_couleur: {blanc_pour: on('--on-for', '--for'), blanc_contre: cr('rgb(255,255,255)', tone('--ag')), blanc_contre2: cr('rgb(255,255,255)', tone('--ag2')), encre_or: on('--hold-ink', '--hold')},
        formes: {pour_fond: cr(tone('--for'), page), contre_fond: cr(tone('--ag'), page), contre2_fond: cr(tone('--ag2'), page), abstention_fond: cr(tone('--ink-3'), page), or_fond: cr(tone('--hold'), page)}};
    });
    await c.close(); }
  out.erreurs = errs;
  await b.close();
  console.log(JSON.stringify(out, null, 1));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
})();
