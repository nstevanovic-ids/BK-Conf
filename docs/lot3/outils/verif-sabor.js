// Vérification des points de proto/critique-sabor.md sur le prototype Sabor servi tel quel.
// Usage : git archive origin/claude/proto-tour-2 proto | tar -x -C <dossier>
//         python3 -m http.server 8103 --directory <dossier>/proto/sabor
//         node docs/lot3/outils/verif-sabor.js docs/lot3/mesures/0-prototype/verif.json
// Lot 3 (docs/lot3/PLAN.md, section « Critique de Sabor, point par point »).
const { chromium } = require('playwright');
const U = process.env.SABOR_URL || 'http://localhost:8103/';
const out = {};
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const mk = async (opts = {}) => {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
    const p = await c.newPage();
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(String(e)));
    return [c, p];
  };
  // ---- B3 : accueil 1440 × 900
  {
    const [c, p] = await mk();
    await p.goto(U); await p.waitForSelector('.u'); await p.waitForTimeout(1500);
    out.B3 = await p.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), Math.round(b.height)]; };
      const panel = document.getElementById('panel');
      return { scl: r('.scl'), firstCase: r('.sbtn'), stage: r('#stage'), panel: r('#panel'), copy: r('#copy'),
        panelScroll: panel.scrollHeight > panel.clientHeight + 2, innerH: innerHeight };
    });
    // survol d'un disque : infobulle
    const kr = await p.$('.u[data-c="KR-17"]'); const bb = await kr.boundingBox();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(300);
    out.B3.tip = await p.evaluate(() => { const t = document.getElementById('tip'); const b = t.getBoundingClientRect(); return { hidden: t.hidden, top: Math.round(b.top), bottom: Math.round(b.bottom) }; });
    // I5 : tabulations avant le premier État
    await p.goto(U + '#home'); await p.reload(); await p.waitForSelector('.u'); await p.waitForTimeout(500);
    let n = 0, hit = null;
    for (; n < 120; n++) { await p.keyboard.press('Tab'); hit = await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('u') ? document.activeElement.dataset.c : null); if (hit) break; }
    out.I5 = { tabs: n + 1, first: hit };
    // ✓ ✕ : texte pour lecteur d'écran ?
    out.marks = await p.evaluate(() => [...document.querySelectorAll('.g')].slice(0, 6).map(g => {
      const i = g.querySelector('.g-st i'); return { id: g.dataset.g, mark: i.textContent, ariaHiddenParent: i.getAttribute('aria-hidden'), sr: (g.querySelector('.g-st').innerText || '').trim(), label: g.getAttribute('aria-label') };
    }));
    await c.close();
  }
  // ---- B4 : alarme levée puis deux tiers au Kongres
  {
    const [c, p] = await mk();
    await p.goto(U); await p.waitForSelector('.sbtn');
    await p.click('.sbtn[data-sc="one"]'); await p.waitForTimeout(400);
    await p.click('.ps-b [data-stp="1"]').catch(() => {});
    // aller à la fin
    for (let i = 0; i < 6; i++) await p.click('.ps-b [data-stp="1"]').catch(() => {});
    await p.waitForTimeout(300);
    const before = await p.evaluate(() => ({ v: document.querySelector('#pv').dataset.v, w: document.querySelector('#pv strong').textContent }));
    for (const code of ['KR-17', 'ST-35', 'IS-14', 'KV-18', 'DJ-09', 'SX-37', 'ZG-94', 'SI-31', 'TU-42', 'DA-08']) {
      await p.evaluate(c => { const r = document.querySelector(`input[name="v-${c}"][value="f"]`); }, code);
    }
    // via le tableau (radios)
    await p.click('#tbl summary');
    for (const code of ['KR-17', 'ST-35', 'IS-14', 'KV-18', 'DJ-09', 'SX-37', 'ZG-94', 'SI-31', 'TU-42', 'DA-08'])
      await p.check(`input[name="v-${code}"][value="f"]`, { force: true });
    await p.waitForTimeout(300);
    out.B4 = { before, after: await p.evaluate(() => ({ v: document.querySelector('#pv').dataset.v, w: document.querySelector('#pv strong').textContent, k: document.querySelector('#hn-f').textContent, line: document.querySelector('.pv-l').textContent.slice(0, 80) })) };
    await c.close();
  }
  // ---- B5 et carte : disposition géographique ; commandes de délégation
  {
    const [c, p] = await mk();
    await p.goto(U); await p.waitForSelector('.u');
    await p.click('#lay [data-lay="map"]'); await p.waitForTimeout(2500);
    out.B5 = await p.evaluate(() => {
      const us = [...document.querySelectorAll('.u')].map(e => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2, b.width / 2]; });
      let ov = 0; for (let i = 0; i < us.length; i++) for (let j = i + 1; j < us.length; j++) { const [x1, y1, r1] = us[i], [x2, y2, r2] = us[j]; if (Math.hypot(x1 - x2, y1 - y2) < r1 + r2 - 1) ov++; }
      const seg = [...document.querySelectorAll('.seg3 button[data-go]')];
      const vis = seg.filter(b => { const s = getComputedStyle(b); const l = b.closest('.lanes'); return getComputedStyle(l).visibility !== 'hidden' && b.offsetParent; }).length;
      const stp = [...document.querySelectorAll('.stp')].filter(b => getComputedStyle(b.closest('.lanes')).visibility !== 'hidden').length;
      return { paths: document.querySelectorAll('#geo path').length, units: us.length, overlaps: ov, delegationButtonsVisible: vis, delegationButtonsTotal: seg.length, memberStepsVisible: stp, hash: location.hash.slice(0, 20) };
    });
    // fiche d'État : contour ?
    await p.goto(U + '#state-LK-20'); await p.waitForTimeout(1200);
    out.B5.statePaths = await p.evaluate(() => document.querySelectorAll('svg path').length);
    await c.close();
  }
  // ---- I1 : mobile, toucher
  {
    const [c, p] = await mk({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
    await p.goto(U); await p.waitForSelector('.u'); await p.waitForTimeout(1500);
    const el = await p.$('.u[data-c="BC-02"]'); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    const st0 = await p.evaluate(() => document.querySelector('.u[data-c="BC-02"]').dataset.o);
    const bb = await el.boundingBox();
    await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(500);
    out.I1 = await p.evaluate(s0 => ({ before: s0, after: document.querySelector('.u[data-c="BC-02"]').dataset.o,
      sel: document.querySelector('.u.sel') && document.querySelector('.u.sel').dataset.c, card: !document.querySelector('.pcard').hidden, fixed: [...document.querySelectorAll('header,#panel')].map(e => Math.round(e.getBoundingClientRect().height)),
      small: [...document.querySelectorAll('.u')].filter(u => u.getBoundingClientRect().width < 24).length, nolabel: [...document.querySelectorAll('.u.sm')].length,
      overflow: document.documentElement.scrollWidth > innerWidth }), st0);
    await c.close();
  }
  // ---- I6, I7 : pas à pas, Konfederalno Veće
  {
    const [c, p] = await mk();
    await p.goto(U); await p.waitForSelector('.sbtn');
    await p.click('.sbtn[data-sc="five"]'); await p.waitForTimeout(300);
    out.I6 = await p.evaluate(() => ({ step: document.querySelector('.ps-n') && document.querySelector('.ps-n').textContent }));
    await p.goto(U + '#vote-council'); await p.waitForTimeout(800);
    out.I7 = await p.evaluate(() => ({ seats: document.querySelectorAll('.seat').length, unitsVisible: [...document.querySelectorAll('.u')].filter(u => u.offsetParent && getComputedStyle(u).visibility !== 'hidden' && getComputedStyle(u).opacity !== '0').length }));
    await c.close();
  }
  // ---- B2 : chaînes non traduites (SRE)
  {
    const [c, p] = await mk();
    await p.addInitScript(() => localStorage.setItem('bk-lang', 'sre'));
    await p.goto(U); await p.waitForSelector('.u'); await p.waitForTimeout(800);
    out.B2 = await p.evaluate(() => { const els = [...document.querySelectorAll('[data-untranslated]')].filter(e => e.offsetParent);
      return { n: els.length, chars: els.reduce((a, e) => a + e.textContent.trim().length, 0), total: document.getElementById('app').innerText.length, sample: els.slice(0, 12).map(e => e.textContent.trim().slice(0, 40)) }; });
    await c.close();
  }
  // ---- F8, F10 : introuvable ; mouvement réduit
  {
    const [c, p] = await mk({ reducedMotion: 'reduce' });
    const reqs = []; p.on('request', r => reqs.push(r.url()));
    await p.goto(U + '#foo'); await p.waitForTimeout(500);
    out.F8 = await p.evaluate(() => document.querySelector('h1') && document.querySelector('h1').textContent);
    await p.goto(U + '#home'); await p.reload(); await p.waitForSelector('.u'); await p.waitForTimeout(2500);
    const bb = await (await p.$('.u[data-c="BC-02"]')).boundingBox();
    const o0 = await p.evaluate(() => document.querySelector('.u[data-c="BC-02"]').dataset.o);
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + 300, bb.y + 10, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(400);
    out.F10 = { d3force: reqs.some(u => /d3-force/.test(u)), dragBefore: o0, dragAfter: await p.evaluate(() => document.querySelector('.u[data-c="BC-02"]').dataset.o),
      notice: await p.evaluate(() => /drag|glisse/i.test(document.body.innerText)) };
    await c.close();
  }
  // ---- thème sombre : contraste de quelques paires
  {
    const [c, p] = await mk({ colorScheme: 'dark' });
    await p.goto(U); await p.waitForSelector('.u'); await p.waitForTimeout(800);
    out.dark = await p.evaluate(() => {
      const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
      const cr = (a, b) => { const x = lum(a), y = lum(b); return ((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(2); };
      const bgOf = e => { while (e) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; e = e.parentElement; } return 'rgb(255,255,255)'; };
      const pick = s => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); return { s, fg: cs.color, bg: bgOf(e), cr: cr(cs.color, bgOf(e)) }; };
      return ['.pv strong', '.pv-k', '.g-req', '.cap', '.lm', '.u[data-o=f] span', '.u[data-o=x] span', '.tbtn small', '.g-hyp', '.chip', '.hn', '.legend'].map(pick).filter(Boolean);
    });
    await c.close();
  }
  out.errors = errs.slice(0, 10);
  require('fs').writeFileSync(process.argv[2] || 'verif.json', JSON.stringify(out, null, 1) + '\n');
  console.log(JSON.stringify(out));
  await b.close();
})();
