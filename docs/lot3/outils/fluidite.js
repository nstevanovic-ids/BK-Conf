#!/usr/bin/env node
/* Fluidité de la page des votes (#/votes) : durée des images pendant les sept cas joués et cinq
   changements de disposition, relevée par requestAnimationFrame dans la page.

   Usage : python docs/lot1/outils/serve.py _site 8001 &
           node docs/lot3/outils/fluidite.js [http://127.0.0.1:8001/] [sortie.json]

   Deux passages : 1440 px ; 375 px avec le processeur ralenti quatre fois (CDP). Chromium sans processeur
   graphique : ne remplace pas l'essai sur téléphone (docs/lot3/PLAN.md, « Essai sur un vrai téléphone »). */
const {chromium} = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || 'http://127.0.0.1:8001/';
const OUT = process.argv[3];
const CASES = ['consent-given', 'two-peoples', 'five-delegations', 'alarm', 'six-of-seven', 'nine-of-twelve', 'four-councillors'];

async function run(b, w, h, cpu, touch) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: touch, isMobile: touch});
  const p = await ctx.newPage();
  if (cpu > 1) { const s = await ctx.newCDPSession(p); await s.send('Emulation.setCPUThrottlingRate', {rate: cpu}); }
  await p.goto(BASE + '#/votes'); await p.waitForSelector('.vo-u', {state: 'attached'});
  await p.waitForFunction(() => window.d3 && d3.forceSimulation, null, {timeout: 20000});
  await p.waitForTimeout(800);
  await p.evaluate(() => { window.__f = []; let t0 = performance.now();
    const loop = t => { window.__f.push(t - t0); t0 = t; window.__raf = requestAnimationFrame(loop); }; window.__raf = requestAnimationFrame(loop); });
  for (const c of CASES) {
    await p.evaluate(id => { const b = document.querySelector(`.vo-sbtn[data-sc="${id}"]`); b.scrollIntoView({block: 'nearest'}); b.click(); }, c);
    await p.waitForTimeout(c === 'four-councillors' ? 4500 : 7000);
  }
  await p.evaluate(() => document.querySelector('.vo-tbtn[data-type="consent"]') && document.querySelector('.vo-tbtn[data-type="consent"]').click());
  await p.waitForTimeout(1500);
  for (let i = 0; i < 5; i++) { await p.click(`#voLay [data-lay="${i % 2 ? 'lanes' : 'map'}"]`); await p.waitForTimeout(2200); }
  const f = await p.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__f.slice(1); });
  await ctx.close();
  const s = [...f].sort((a, b) => a - b), q = k => Math.round(s[Math.floor(k * (s.length - 1))] * 10) / 10;
  return {largeur: w, processeur: cpu, images: f.length, moyenne_ms: Math.round(f.reduce((a, b) => a + b, 0) / f.length * 10) / 10,
    mediane_ms: q(.5), p95_ms: q(.95), max_ms: Math.round(s[s.length - 1]), au_dela_20ms: f.filter(x => x > 20).length, au_dela_50ms: f.filter(x => x > 50).length};
}

(async () => {
  const b = await chromium.launch({args: ['--no-sandbox']});
  const res = {_: `requestAnimationFrame pendant les sept cas joués et cinq changements de disposition ; ${new Date().toISOString().slice(0, 10)}`,
    bureau: await run(b, 1440, 900, 1, false), mobile: await run(b, 375, 812, 4, true)};
  await b.close();
  console.log(JSON.stringify(res, null, 1));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
})();
