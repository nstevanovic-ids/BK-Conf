/* constitution.js — lecteur de la Constitution (#/constitution), chargé avec sa page.
   Repris de Codex (proto/codex : app.js, reader.js, cyr.js, branche claude/proto-tour-2) et raccordé
   au portail : routes #/constitution/…, en-tête, thème, langue (LANG, L, T) et écriture (SCRIPTS,
   cyrText, cyrWord) du portail. ADR 2026-11-23-lecteur-constitution.md.

   Ouverture (#/constitution) : titre, préambule, article 110, table des onze titres, un trait par
   article. Lecture (#/constitution/<titre>[/<article>][/<textes>]) : un à cinq textes (en, zap, sre,
   ist, fr) alignés unité par unité dans une même grille ; renvois liés, aperçus, renvois inverses ;
   barre collante (titre et article, textes, règle graduée) ; fil de lecture ; j / k ; bascule
   d'écriture glyphe par glyphe ; un seul texte sur écran étroit (onglets, balayage).
   Données : portail/data/constitution/ (scripts/build_lecteur.py) ; CORE = core.json.

   Le portail appelle : CX.prepare(h) (données de la vue), CX.html(h) (contenu de #app),
   CX.mounted() (après insertion), CX.inplace(h) (même titre : défilement), CX.rerender()
   (langue ou écriture), CX.takeRef() / CX.target() (élément partagé d'un renvoi suivi), CX.leave(). */
var CX = (function () {
  'use strict';
  /* marqueur local des chaînes de tables (scripts/textes.py le lit comme N du gabarit) : dans le
     fichier unique, ce script s'exécute avant celui du portail */
  const N = s => s;
  const LANGS = ['en', 'zap', 'sre', 'ist', 'fr'];
  const HL = { en: 'en', zap: 'sl', sre: 'sh', ist: 'bg-Latn', fr: 'fr' };
  const LOC = { en: 'en-GB', zap: 'sl-SI', sre: 'hr-HR', ist: 'bg-BG', fr: 'fr-FR' };
  const FR = { title: 'Titre', chapter: 'Chapitre', section: 'Section', article: 'Article', art: 'art.' };
  const KEY = { title: N('Title {0}'), chapter: N('Chapter {0}'), section: N('Section {0}'), article: N('Article {0}'), art: N('Art. {0}') };
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = () => matchMedia('(max-width:760px)').matches;
  const $ = id => document.getElementById(id);
  const TITLE0 = document.title;

  const S = { text: null, tsc: null, shown: null, r: null, live: null, here: null, lang: null,
    ref: null, follow: null, thread: [], order: null, popFor: null, popT: 0 };
  try { S.thread = JSON.parse(ss.get('bk-cx-thread') || '[]'); } catch (e) {}
  try { localStorage.removeItem('bk-cx-dbl'); } catch (e) {}   // ancienne double ligne, retirée

  /* ---------------------------------------------------------------- données */
  const got = {}, cache = new Map();
  function load(p) {
    if (!cache.has(p)) {
      const inl = typeof CX_DATA !== 'undefined' && CX_DATA[p];
      cache.set(p, (inl ? Promise.resolve(inl) : fetch('data/constitution/' + p + DATA_V).then(r => {
        if (!r.ok) throw new Error(p + ' : ' + r.status); return r.json(); })).then(d => (got[p] = d)));
    }
    return cache.get(p);
  }

  /* ---------------------------------------------------------------- textes et libellés */
  const plural = (l, n, spec) => {
    const pr = new Intl.PluralRules(LOC[l] || 'en-GB'), f = {};
    spec.split(';').forEach(x => { const i = x.indexOf(':'); if (i > 0) f[x.slice(0, i).trim()] = x.slice(i + 1); });
    return f[pr.select(Number(String(n).replace(/\D/g, '')))] ?? f.other ?? '';
  };
  /* chaîne du portail dans la langue d'un texte (et non de l'interface) : en-têtes des colonnes */
  function tl(l, key, ...a) {
    let s = key;
    if (l !== 'en' && l !== 'fr') { const e = (TX.t || {})[key]; if (e && e[l] != null) s = e[l]; }
    return s.replace(/\{(\d+)#([^}]*)\}/g, (m, i, spec) => plural(l, a[i], spec)).replace(/\{(\d+)\}/g, (m, i) => a[i] ?? '');
  }
  /* préfixes de structure dans la langue d'un texte ; le français garde ceux de sa source */
  function lab(kind, num, l) {
    if (l === 'fr') {
      if (kind === 'title') { const t = CORE.toc.find(x => x.num === num); num = t ? t.id.replace('title-', '').replace(/(\d+)bis/, '$1 bis') : num; }
      return FR[kind] + ' ' + num;
    }
    return tl(l, KEY[kind], num);
  }
  const tk = k => { const e = (I18N.t || {})[k]; return e ? (e[LANG] || e.en) : k; };   // i18n.json, latin
  /* texte d'interface : sa source latine reste dans data-u, l'écriture choisie s'applique à l'affichage
     (le portail ne le convertit pas : .cxu, comme les cellules .cxl, lui échappe) */
  const sc = s => cyrOn() ? cyrText(String(s), LANG) : String(s);
  const ui = s => `<span class="cxu" data-u="${esc(s)}">${esc(sc(s))}</span>`;
  const ua = s => ` aria-label="${esc(sc(s))}" data-ua="${esc(s)}"`;
  function uiRefresh(root) {
    root.querySelectorAll('.cxu').forEach(e => { e.textContent = sc(e.dataset.u); });
    root.querySelectorAll('[data-ua]').forEach(e => e.setAttribute('aria-label', sc(e.dataset.ua)));
  }
  const artNum = id => id.replace('art-', '').replace(/(\d+)([a-z]+)/, '$1 $2');
  const titleOf = aid => CORE.toc.find(t => t.a.includes(aid.replace('art-', '')));
  const ORDER = () => S.order || (S.order = CORE.toc.flatMap(t => t.a.map(a => 'art-' + a)));
  const li = l => LANGS.indexOf(l);
  /* une seule sélection : un texte dans une seule écriture, choisis ensemble dans la barre du lecteur.
     Un texte s'ouvre dans l'écriture première de son standard, le latin pour le središñi, le cyrillique
     pour l'istočni (ADR 2026-11-06-istocni-cyrillique.md), quelle que soit l'écriture de l'interface ;
     seule la barre la change. La bascule Lat / Ћир de l'en-tête ne touche que l'interface. */
  const PRIMARY = { sre: 'lat', ist: 'cyr' };
  const mode = l => PRIMARY[l] ? (l === S.text && S.tsc ? S.tsc : PRIMARY[l]) : 'lat';
  const OPTS = [['en', 'en', 'lat'], ['zap', 'zap', 'lat'], ['sre', 'sre', 'lat'], ['sre-cyr', 'sre', 'cyr'],
    ['ist', 'ist', 'cyr'], ['ist-lat', 'ist', 'lat'], ['fr', 'fr', 'lat']];
  const optOf = id => OPTS.find(o => o[0] === id);
  const optId = (l, sc) => (OPTS.find(o => o[1] === l && o[2] === sc) || OPTS.find(o => o[1] === l))[0];
  const optNow = () => optId(S.text, mode(S.text));
  const OLAB = { en: 'EN', zap: 'ZAP', sre: 'SRE', 'sre-cyr': 'СРЕ', ist: 'ИСТ', 'ist-lat': 'IST', fr: 'FR' };

  /* ---------------------------------------------------------------- colonnes et adresses */
  /* un seul texte à la fois (la lecture comparée est retirée) : celui de la langue de l'interface, ou
     un autre choisi dans la barre (dont le texte de travail français), porté par l'adresse avec son
     écriture quand ce n'est pas la première (/sre-cyr, /ist-lat) */
  function initCols() {
    if (S.text) return;
    S.text = LANG; S.tsc = PRIMARY[LANG] || 'lat'; S.lang = LANG;
  }
  const suffix = o => o && o !== optId(LANG, PRIMARY[LANG] || 'lat') ? '/' + o : '';
  function hashFor(id, cols) {
    cols = cols === undefined ? (S.text ? optNow() : null) : cols;
    if (id === 'home') return '#/constitution';
    if (id === 'preamble') return '#/constitution/preamble';
    if (id.startsWith('art-')) { const t = titleOf(id); return '#/constitution/' + (t ? t.id : 'title-1') + '/' + id + suffix(cols); }
    return '#/constitution/' + id + suffix(cols);
  }
  /* adresses tolérantes : #/constitution/art-110, art-1-bis, Art-110, un mauvais titre, sont réécrites ;
     ce qui ne se trouve pas est dit (vue « Not found »), jamais caché */
  function parse(h) {
    const raw = decodeURIComponent(String(h || '').replace(/^#\/constitution\/?/, '')).trim();
    const parts = raw.split('/').filter(Boolean);
    if (!parts.length) return { v: 'home' };
    if (parts.length === 1 && parts[0] === 'preamble') return { v: 'home', pre: true };
    let title = null, art = null, cols = null, tsc = null, bad = false, m;
    for (const p of parts) {
      if ((m = /^title-?(\d+)[- ]?(bis)?$/i.exec(p))) title = 'title-' + m[1] + (m[2] || '').toLowerCase();
      else if ((m = /^art(?:icle)?-?(\d+)[- ]?(bis|ter|quater|quinquies|sexies|septies|octies)?$/i.exec(p)))
        art = 'art-' + m[1] + (m[2] || '').toLowerCase();
      else if ((m = /^(sre|ist)-(lat|cyr)$/.exec(p))) { cols = m[1]; tsc = m[2]; }   // texte dans son autre écriture
      else if (/^(?:en|zap|sre|ist|fr)(?:-(?:en|zap|sre|ist|fr))*$/.test(p)) cols = p.split('-')[0];   // ancienne forme en-sre-fr : le premier texte
      else bad = true;
    }
    if (bad || (!title && !art)) return { v: 'nf', q: raw.replace(/[-/]+/g, ' ').trim() };
    if (art) { const t = titleOf(art); if (!t) return { v: 'nf', q: artNum(art) }; title = t.id; }
    else if (!CORE.toc.some(t => t.id === title)) return { v: 'nf', q: '' };
    return { v: 'reader', title, art, text: cols, tsc: cols ? tsc || PRIMARY[cols] || 'lat' : null };
  }
  function colsNow() { initCols(); return [S.text]; }
  /* écran large : la marge (renvois inverses, instruments) à droite du texte ; écran étroit : sous l'article */
  function layout(n, mobile) { return { mg: !mobile && document.documentElement.clientWidth >= 1100 }; }

  /* ---------------------------------------------------------------- préparation (données de la vue) */
  async function prepare(h) {
    initCols();
    const r = parse(h);
    if (r.text) { S.text = r.text; S.tsc = r.tsc; }
    const jobs = [];
    const cols = r.v === 'reader' ? colsNow(narrow()) : [LANG];
    if (r.v === 'reader') cols.forEach(l => jobs.push(load(`t/${r.title}.${l}.json`)));
    if (cols.some(l => l !== 'en' && l !== 'fr')) jobs.push(need(['textes']));   // en-têtes du texte dans sa langue
    await Promise.all(jobs);
    return r;
  }

  /* ---------------------------------------------------------------- HTML */
  const cellA = (i, l, extra = '') => `class="cx-cell cxl cx-c${i + 1}${extra}" data-l="${l}" lang="${HL[l]}"`;
  function unitHTML(u, n, multi) {
    const k = u[0], mk = u.length === 3 ? u[1] : '', h = u[u.length - 1];
    if (k === 'li') return `<p class="cx-u cx-li"><span class="cx-mk" translate="no">${esc(mk)}</span>${h}</p>`;
    if (k === 'h') return `<p class="cx-u cx-sh">${h}</p>`;
    return `<p class="cx-u">${multi ? `<span class="cx-al" translate="no" aria-hidden="true">${n}</span>` : ''}${h}</p>`;
  }
  function articleHTML(arts, cols, gi) {
    const a0 = arts[0], id = a0.id, [n, sfx] = a0.num.split(' ');
    const R = a0.u.length, multi = a0.u.filter(u => u[0] === 'p').length > 1;
    let h = `<section class="cx-art cx-grid" id="${id}" data-i="${gi}">
  <div class="cx-gut"><a class="cx-anum" href="${hashFor(id)}" translate="no" tabindex="-1" aria-hidden="true">${n}${sfx ? `<small>${sfx}</small>` : ''}</a></div>`;
    arts.forEach((a, i) => {
      const l = cols[i];
      h += `<div ${cellA(i, l, ' cx-ah')} style="grid-row:1"><p class="cx-k">${esc(lab('article', a.num, l))}</p><h3>${esc(a.name)}</h3></div>`;
      let pn = 0;
      a.u.forEach((u, j) => { h += `<div ${cellA(i, l)} data-u="${j}" style="grid-row:${j + 2}">${unitHTML(u, u[0] === 'p' ? ++pn : 0, multi)}</div>`; });
    });
    const cited = CORE.cited[id] || [], ins = INS[id];
    if (cited.length || ins) {
      const mg = `${cited.length ? `<div class="cx-cb"><span class="cx-k">${ui(L`In the Constitution`)}</span>${cited.map(c =>
        `<a class="cx-rf" href="${hashFor(c)}" translate="no">${esc(artNum(c))}</a>`).join('')}</div>` : ''}${ins ? `<div class="cx-ins" data-ins="${ins}" data-art="${id}"></div>` : ''}`;
      h += `<aside class="cx-mg" style="grid-row:1 / span ${R + 1}"><div class="cx-mgi">${mg}</div></aside>`;
    }
    return h + '</section>';
  }
  /* instruments de marge par article (portail/js/marges.js, moteur portail/js/regles.js), chargés à
     l'approche de leur article ; l'art. 132 n'en a pas (révision en cours) */
  const INS = { 'art-1bis': 'map1', 'art-1ter': 'cap', 'art-103': 'sl', 'art-109': 'alarm', 'art-110': 'dk110',
    'art-111': 'dk111', 'art-115bis': 'reg' };
  const INS_NEED = ['js/regles.js', 'js/marges.js', 'stats'];
  const mountIns = el => need(INS_NEED).then(() => { if (el.isConnected) MARGES.mount(el); }).catch(() => {});
  function titleHTML(files, cols, tt, lay) {
    const f0 = files[0], order = ORDER(), [rn, sfx] = tt.num.split(' ');
    const ti = CORE.toc.indexOf(tt), prev = CORE.toc[ti - 1], next = CORE.toc[ti + 1], l0 = cols[0];
    let h = `<div class="cx-rd${lay.mg ? ' cx-has-mg' : ''}" data-n="1" style="--n:1">
  <div class="cx-sheet" id="cxSheet">
  <section class="cx-opener cx-grid" id="${tt.id}">
    <div class="cx-gt" translate="no" aria-hidden="true">${rn}${sfx ? `<small>${sfx}</small>` : ''}</div>
    ${files.map((f, i) => `<div ${cellA(i, cols[i])} style="grid-row:1"><p class="cx-k">${esc(lab('title', tt.num, cols[i]))}</p><h1>${esc(f.name)}</h1>${cols[i] === 'fr'
      ? `<p class="cx-frw" lang="${esc(I18N.langs[LANG] ? I18N.langs[LANG].html : 'en')}">${ui(L`French working text. The versions in the three regional standards are equally authentic (Art. 151).`)}</p>` : ''}</div>`).join('')}
    <nav class="cx-tindex" style="grid-row:2"${ua(L`Articles of ${lab('title', tt.num, LANG)}`)}>${f0.ch.map(ch =>
      `${ch.num ? `<div class="cx-ch cxl" data-l="${l0}" lang="${HL[l0]}">${esc(lab('chapter', ch.num.replace('Chapter ', ''), l0))} · ${esc(ch.name)}</div>` : ''}${ch.arts.map(a =>
      `<a href="${hashFor(a.id)}"><b class="cxl" data-l="${l0}" lang="${HL[l0]}">${esc(lab('art', a.num, l0))}</b><span class="cxl" data-l="${l0}" lang="${HL[l0]}">${esc(a.name)}</span></a>`).join('')}`).join('')}</nav>
  </section>`;
    f0.ch.forEach((ch, ci) => {
      if (ch.num) h += `<div class="cx-brk cx-grid">${files.map((f, i) => `<div ${cellA(i, cols[i])} style="grid-row:1"><p class="cx-k">${esc(lab('chapter', ch.num.replace('Chapter ', ''), cols[i]))}</p><h2>${esc(f.ch[ci].name)}</h2></div>`).join('')}</div>`;
      ch.arts.forEach((a, ai) => {
        if (a.sec) h += `<div class="cx-brk cx-sec cx-grid">${files.map((f, i) => { const s = f.ch[ci].arts[ai].sec || a.sec;
          return `<div ${cellA(i, cols[i])} style="grid-row:1"><p class="cx-k">${esc(lab('section', s[0].replace('Section ', ''), cols[i]))}</p><h2>${esc(s[1])}</h2></div>`; }).join('')}</div>`;
        h += articleHTML(files.map(f => f.ch[ci].arts[ai]), cols, order.indexOf(a.id));
      });
    });
    const tl_ = t => esc(sc(lab('title', t.num, LANG))) + ' · ' + esc(sc(t.name[li(LANG)]));
    h += `<nav class="cx-pager">${prev ? `<a href="${hashFor(prev.id)}"><small>← ${ui(L`Previous`)}</small><b>${tl_(prev)}</b></a>`
      : `<a href="${hashFor('preamble')}"><small>← ${ui(L`Back`)}</small><b>${ui(tk('h_preamble'))}</b></a>`}
    ${next ? `<a class="cx-nx" href="${hashFor(next.id)}"><small>${ui(L`Next`)} →</small><b>${tl_(next)}</b></a>` : '<span></span>'}</nav>
  </div></div>`;
    return h;
  }
  function barHTML(r, cols, mobile) {
    const chips = r.v === 'reader' ? `<div class="cx-texts">
      <span class="cx-lb">${ui(L`Language`)}</span>
      <div class="cx-chips" role="radiogroup"${ua(L`Language`)}>${OPTS.map(([id, l, scr]) => { const on = id === optNow();
        const nm = l === 'fr' ? 'FR' : ((I18N.langs[l] || {}).name || l) + (PRIMARY[l] ? ' · ' + tk(scr === 'cyr' ? 'scr_cyr' : 'scr_lat') : '');
        return `<button type="button" role="radio" data-c="${id}" translate="no" aria-checked="${on}" tabindex="${on ? 0 : -1}"${PRIMARY[l] && scr !== PRIMARY[l] ? ' class="cx-alt"' : ''} title="${esc(nm)}" aria-label="${esc(nm)}">${OLAB[id]}</button>`; }).join('')}</div>
      <span class="cx-cnt" id="cxCnt" translate="no"></span></div>` : '';
    return `<div class="cx-bar" id="cxBar"><div class="cx-bar-i">
    <a class="cx-loc" id="cxLoc" href="${hashFor('home')}"><b>${ui(L`Constitution`)}</b></a>${chips}</div>
    <div class="cx-prog" id="cxProg" role="progressbar" aria-valuemin="0" aria-valuemax="${ORDER().length}" aria-valuenow="0"${ua(L`Constitution`)}>${CORE.toc.map(tt =>
      `<i style="flex:${tt.a.length};--k:${tt.a.length}"><b></b></i>`).join('')}</div>
    <nav class="cx-thread" id="cxThread" hidden></nav></div>`;
  }
  function homeHTML(r) {
    const c = CORE, i = li(LANG), pre = c.pre[LANG] || c.pre.en, ver = c.version.replace('v', '');
    const pos = (JSON.parse(ls.get('bk-cx-pos') || '{}') || {})[LANG];
    const nArt = ORDER().length, cl = `data-l="${LANG}" lang="${HL[LANG]}"`;
    const lead = LANG === 'en'
      ? L`Consolidated text, version ${ver} of ${fmtD(c.iso)}: a preamble and ${fmtN(nArt)} articles in ${fmtN(c.toc.length)} titles. Official acts are published in the unified South Slavic Latin alphabet and in the three regional standards; this is the English text.`
      : L`Consolidated text, version ${ver} of ${fmtD(c.iso)}: a preamble and ${fmtN(nArt)} articles in ${fmtN(c.toc.length)} titles. The texts in the three regional standards are equally authentic (Art. 151); this is the official text in this standard.`;
    return `<div class="cx-hm">
  <section class="cx-cover">
    <div class="cx-eyebrow">${ui(tk('h_fundamental'))}</div>
    <h1>${ui(tk('h_constitution_h1'))}</h1>
    <p class="cx-lead">${ui(lead)}</p>
    <span class="cx-motto cxl" ${cl}>${esc(pre.motto)}</span>
    <div class="cx-acts"><a class="cx-btn cx-pri" href="${hashFor('art-1')}">${ui(L`Begin reading`)}</a>
      ${pos && titleOf(pos) ? `<a class="cx-btn" href="${hashFor(pos)}">${ui(L`Continue →`)} <span class="cx-num">${ui(lab('art', artNum(pos), LANG))}</span></a>` : ''}
      <a class="cx-btn" href="#/journal">${ui(L`Official Journal`)}</a></div>
  </section>
  <section class="cx-pre" id="preamble">
    <h2>${ui(tk('h_preamble'))}</h2>
    <div>${pre.paras.map((p, k) => `<p class="cx-pp cxl${k === pre.paras.length - 1 ? ' cx-last' : ''}" ${cl}>${esc(p)}</p>`).join('')}
      <p class="cx-mot cxl" ${cl}>${esc(pre.motto)}</p></div>
  </section>
  <section class="cx-toc" aria-labelledby="cxToc">
    <h2 id="cxToc">${ui(tk('h_titles'))}</h2>
    ${c.toc.map(tt => { const [rn, sfx] = tt.num.split(' '); return `<div class="cx-trow">
      <a class="cx-rn" href="${hashFor(tt.id)}" translate="no"${ua(lab('title', tt.num, LANG))}>${rn}${sfx ? `<small>${sfx}</small>` : ''}</a>
      <div><a class="cx-tn cxl" ${cl} href="${hashFor(tt.id)}">${esc(tt.name[i])}</a>
        <div class="cx-rg">${ui(lab('art', artNum('art-' + tt.a[0]), LANG))} – <span translate="no">${esc(artNum('art-' + tt.a[tt.a.length - 1]))}</span> · ${ui(L`${fmtN(tt.a.length)} articles`)}</div></div>
      <div class="cx-ticks">${tt.a.map(a => `<a href="${hashFor('art-' + a)}" data-pv tabindex="-1" class="${/[a-z]/.test(a) ? 'cx-b' : ''}${pos === 'art-' + a ? ' cx-here' : ''}"${ua(lab('art', artNum('art-' + a), LANG))}></a>`).join('')}</div>
    </div>`; }).join('')}
  </section></div>`;
  }
  function nfHTML(r) {
    return `<div class="cx-wrap cx-nf"><div class="cx-eyebrow">${ui(L`Constitution`)}</div>
    <h1>${ui(L`Not found`)}</h1><p class="cx-nfh" translate="no">${esc(decodeURIComponent(location.hash))}</p>
    <p class="cx-acts"><button type="button" class="cx-btn cx-pri" id="cxNfs">${ui(tk('search'))}</button><a class="cx-btn" href="${hashFor('home')}">${ui(L`Constitution`)}</a></p></div>`;
  }
  /* contenu de #app pour une adresse ; les données ont été chargées par prepare() */
  function html(h) {
    initCols();
    const r = S.r = parse(h), mobile = narrow();
    const cols = r.v === 'reader' ? colsNow(mobile) : [];
    let main = '';
    if (r.v === 'reader') {
      const tt = CORE.toc.find(x => x.id === r.title), files = cols.map(l => got[`t/${r.title}.${l}.json`]);
      if (files.some(f => !f)) return '';
      const lay = layout(cols.length, mobile);
      S.lay = { key: [tt.id, cols.join(), LANG, mobile, lay.mg].join('|'), mobile, lay, cols, tt };
      main = titleHTML(files, cols, tt, lay);
    } else { S.lay = null; main = r.v === 'home' ? homeHTML(r) : nfHTML(r); }
    return `<div class="cx" id="cx">${barHTML(r, cols, mobile)}<div class="cx-main">${main}</div></div>`;
  }

  /* ---------------------------------------------------------------- écriture des cellules */
  function applyScripts(root) {
    for (const l of ['sre', 'ist']) {
      const m = mode(l); if (m === 'lat') continue;
      root.querySelectorAll(`.cxl[data-l="${l}"]`).forEach(c => setScript(c, l, m));
    }
  }

  /* ---------------------------------------------------------------- arrivée sur un article */
  const barBottom = () => { const b = $('cxBar'); return b ? Math.max(0, b.getBoundingClientRect().bottom) : 0; };
  const topWant = () => barBottom() + 26;
  function arrive(el) {
    if (!el) return;
    el.classList.remove('cx-arrive'); void el.offsetWidth; el.classList.add('cx-arrive');
    setTimeout(() => el.classList.remove('cx-arrive'), reduced() ? 2600 : 1700);
  }
  /* content-visibility saute la mise en page des articles hors écran : leur hauteur est estimée
     tant qu'ils ne sont pas proches, d'où une arrivée corrigée sur les images suivantes, sauf si le
     lecteur bouge. */
  let landing = 0;
  function land(el, top) {
    const my = ++landing; let n = 0, calm = 0;
    const stop = () => { if (my === landing) landing++; };
    for (const ev of ['wheel', 'touchstart', 'keydown', 'mousedown']) addEventListener(ev, stop, { once: true, passive: true, capture: true });
    const step = () => {
      if (my !== landing || !el.isConnected || n++ > 50) return;
      const d = el.getBoundingClientRect().top - (top ?? topWant());
      if (Math.abs(d) > 1.5) { scrollBy(0, d); calm = 0; } else if (++calm > 5) return;
      requestAnimationFrame(step);
    };
    step();
  }
  /* l'unité sous la barre : ce qu'un nouveau rendu (textes, langue, largeur) doit rendre */
  function anchorNow() {
    if (!document.querySelector('#cx .cx-rd')) return null;
    const hd = topWant() + 10;
    for (const a of document.querySelectorAll('#cx .cx-art')) {
      const ar = a.getBoundingClientRect(); if (ar.bottom <= hd) continue;
      for (const c of a.querySelectorAll('.cx-cell.cx-c1')) {
        const r = c.getBoundingClientRect();
        if (r.bottom > hd) return { id: a.id, u: c.dataset.u, dy: r.top };
      }
      return { id: a.id, u: undefined, dy: ar.top };
    }
    return null;
  }
  function focusArt(el) {
    const h = el && el.querySelector('.cx-ah h3'); if (!h) return;
    h.tabIndex = -1; h.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------------- barre : lieu, règle, fil */
  function setLoc(html, href) { const l = $('cxLoc'); if (!l) return; l.innerHTML = html; if (href) l.setAttribute('href', href); }
  function setProgress(i) {
    const p = $('cxProg'); if (!p) return;
    if (i == null) { p.classList.remove('cx-on'); p.setAttribute('aria-valuenow', 0); return; }
    p.classList.add('cx-on'); p.setAttribute('aria-valuenow', i);
    let left = i;
    [...p.children].forEach((seg, k) => {
      const n = CORE.toc[k].a.length, f = Math.max(0, Math.min(1, left / n));
      seg.firstChild.style.transform = `scaleX(${f.toFixed(4)})`; seg.classList.toggle('cx-cur', left > 0 && left <= n); left -= n;
    });
  }
  const placeOf = r => r.v === 'reader' ? (r.art || r.title) : r.v === 'home' ? 'home' : null;
  const tlabel = k => k === 'home' ? L`Constitution` : k.startsWith('title-')
    ? lab('title', (CORE.toc.find(x => x.id === k) || {}).num || '', LANG) : lab('art', artNum(k), LANG);
  function renderThread() {
    const el = $('cxThread'), cx = $('cx'); if (!el) return;
    ss.set('bk-cx-thread', JSON.stringify(S.thread));
    const on = S.thread.length >= 2;
    cx.classList.toggle('cx-has-thread', on);
    if (!on) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false; el.setAttribute('aria-label', sc(L`Pages`));
    el.innerHTML = S.thread.map((k, i) => `${i ? '<span class="cx-sep" aria-hidden="true">›</span>' : ''}<a href="${hashFor(k)}"${i === S.thread.length - 1 ? ' aria-current="location"' : ''}>${ui(tlabel(k))}</a>`).join('');
    el.scrollLeft = el.scrollWidth;
  }
  /* un lieu déjà dans le fil n'y est pas empilé deux fois : le fil y revient */
  function threadOn(place) {
    if (!place) { S.thread = []; S.follow = null; renderThread(); return; }
    if (S.follow && S.thread[S.thread.length - 1] !== S.follow && !S.thread.includes(S.follow)) S.thread = [S.follow];
    const i = S.thread.lastIndexOf(place);
    if (i >= 0) S.thread = S.thread.slice(0, i + 1);
    else if (S.follow) S.thread.push(place);
    else S.thread = [];
    S.follow = null; renderThread();
  }
  const savePos = (l, id) => { let p = {}; try { p = JSON.parse(ls.get('bk-cx-pos') || '{}') || {}; } catch (e) {}
    if (p[l] !== id) { p[l] = id; ls.set('bk-cx-pos', JSON.stringify(p)); } };
  function docTitle(s) { document.title = (s ? s + ' — ' : '') + sc(L`Constitution`) + ' · ' + sc(tk('brand')); }

  /* ---------------------------------------------------------------- montage */
  let off = null;
  function leave() {
    if (off) { off(); off = null; }
    hidePop(); landing++;
    if (document.title !== TITLE0 && !$('cx')) document.title = TITLE0;
  }
  function mounted(anchor, keepThread) {
    if (off) { off(); off = null; }
    const cx = $('cx'); if (!cx) return;
    const r = S.r;
    if (r.v === 'reader') {
      const want = hashFor(r.art || r.title);
      if (location.hash !== want) history.replaceState(null, '', want);
    }
    S.lang = LANG; S.shown = r.v === 'reader' ? optNow() : null;
    applyScripts(cx);
    if (keepThread) renderThread(); else threadOn(placeOf(r));
    const ac = new AbortController(), sig = { signal: ac.signal }, psig = { signal: ac.signal, passive: true };
    off = () => ac.abort();
    /* renvoi suivi : le lieu quitté entre dans le fil ; vers un autre titre, le numéro passe d'une
       page à l'autre (élément partagé de la transition du portail) */
    cx.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href^="#/"]'); if (!a) return;
      const href = a.getAttribute('href');
      if (a.matches('.cx-rf,.cx-sl,[data-pv]') || a.closest('.cx-cb')) S.follow = S.here || placeOf(S.r);
      if (a.closest('#cxThread')) S.follow = null;
      const m = /^#\/constitution\/(title-[0-9a-z]+)(?:\/(art-[0-9a-z]+))?/.exec(href);
      if (m && m[2] && S.r.v === 'reader' && m[1] !== S.r.title && !reduced()) {
        const n = a.matches('.cx-tindex a') ? a.querySelector('b') : a.querySelector('b') || a;
        S.ref = { el: n, art: m[2] };
      } else S.ref = null;
    }, sig);
    if (r.v === 'home') {
      setLoc(`<b>${ui(L`Constitution`)}</b>`, hashFor('home')); setProgress(null);
      if (r.pre) { const p = $('preamble'); if (p) p.scrollIntoView({ block: 'start' }); } else scrollTo(0, 0);
      docTitle(''); S.here = 'home';
    } else if (r.v === 'nf') {
      setLoc(`<b>${ui(L`Constitution`)}</b>`, hashFor('home')); setProgress(null); docTitle(sc(L`Not found`));
      const b = $('cxNfs'); if (b) b.onclick = () => openSearch(r.q || '');
      setTimeout(() => { if ($('cxNfs')) openSearch(r.q || ''); }, 60);
    } else wireReader(r, anchor, ac, sig, psig);
  }
  function wireReader(r, anchor, ac, sig, psig) {
    const { tt, cols, mobile } = S.lay, rd = document.querySelector('#cx .cx-rd'), order = ORDER();
    const arts = [...rd.querySelectorAll('.cx-art')];
    let cur = null, tick = 0, curEl = null;
    // arrivée : l'unité tenue avant le nouveau rendu, sinon l'article demandé, sinon le haut
    let done = false;
    if (anchor) {
      const art = $(anchor.id), c = art && (art.querySelector(`.cx-cell.cx-c1[data-u="${anchor.u}"]`) || art.querySelector('.cx-cell.cx-c1'));
      if (c) { scrollTo(0, scrollY + c.getBoundingClientRect().top - anchor.dy); land(c, anchor.dy); done = true; }
    }
    if (!done) {
      const el = r.art && $(r.art);
      if (el) {
        el.scrollIntoView({ block: 'start' }); land(el);
        if (document.fonts && document.fonts.status !== 'loaded') { const my = landing; document.fonts.ready.then(() => { if (my === landing) land(el); }); }
        arrive(el); focusArt(el);
      } else { landing++; scrollTo(0, 0); }
    }
    const track = () => {
      tick = 0;
      const y = topWant() + 34;
      let art = null;
      for (const a of arts) { if (a.getBoundingClientRect().top <= y) art = a; else break; }
      const id = art ? art.id : tt.id;
      if (!id || id === cur) return;
      cur = id; S.here = id;
      if (curEl) curEl.classList.remove('cx-cur'); curEl = art; if (art) art.classList.add('cx-cur');
      const isArt = id.startsWith('art-');
      const nameEl = isArt && art ? art.querySelector('.cx-ah.cx-c1 h3') : null;
      setLoc(`<b>${ui(lab('title', tt.num, LANG))}</b> · ${ui(tt.name[li(LANG)])}${isArt ? ` · <b class="cx-la">${ui(lab('art', artNum(id), LANG))}</b>` : ''}`, hashFor(tt.id));
      const i = isArt ? order.indexOf(id) + 1 : order.indexOf('art-' + tt.a[0]);
      setProgress(i);
      const cnt = $('cxCnt'); if (cnt) cnt.textContent = isArt ? `${i} / ${order.length}` : '';
      docTitle(isArt ? `${sc(lab('art', artNum(id), LANG))} · ${nameEl ? nameEl.textContent : ''}` : `${sc(lab('title', tt.num, LANG))} · ${sc(tt.name[li(LANG)])}`);
      const h = hashFor(id);
      if (location.hash !== h) history.replaceState(null, '', h);
      if (isArt) savePos(LANG, id);
    };
    S.track = () => { cur = null; track(); };
    addEventListener('scroll', () => { if (!tick) tick = requestAnimationFrame(track); }, psig);
    track();
    const again = (extra) => remount(anchorNow(), extra);
    /* une seule sélection, un texte dans une écriture : un autre texte se monte sur le même alinéa ; le
       même texte dans l'autre écriture bascule glyphe par glyphe, sans nouveau rendu */
    const choose = (id, focus) => {
      const o = optOf(id); if (!o || id === optNow()) return;
      const [, l, scr] = o, d = OPTS.findIndex(x => x[0] === id) > OPTS.findIndex(x => x[0] === optNow()) ? 1 : -1;
      if (l !== S.text) { S.text = l; S.tsc = scr; again({ slide: d, focus: focus ? id : null }); return; }
      S.tsc = scr; syncChips(focus ? id : null);
      const cells = [...document.querySelectorAll(`#cx .cxl[data-l="${l}"]`)];
      if (cells.length) switchScript(cells, l, scr, [...document.querySelectorAll('#cx .cxl')]);
      if (S.track) S.track();
    };
    const chips = document.querySelector('#cx .cx-chips');
    if (chips) {
      chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) choose(b.dataset.c, true); }, sig);
      chips.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0; if (!d) return;
        e.preventDefault(); const o = OPTS[(OPTS.findIndex(x => x[0] === optNow()) + d + OPTS.length) % OPTS.length]; choose(o[0], true);
      }, sig);
    }
    if (mobile) {
      // balayage horizontal : texte suivant ou précédent, sur le même alinéa
      const sheet = $('cxSheet'); let sx = 0, sy = 0, st = 0;
      sheet.addEventListener('touchstart', e => { const p = e.touches[0]; sx = p.clientX; sy = p.clientY; st = e.target.closest('input,svg,.cx-seats') ? 0 : Date.now(); }, psig);
      sheet.addEventListener('touchend', e => {
        if (!st) return; const p = e.changedTouches[0], dx = p.clientX - sx, dy = p.clientY - sy;
        if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 2 || Date.now() - st > 700) return;
        const n = OPTS[OPTS.findIndex(x => x[0] === optNow()) + (dx < 0 ? 1 : -1)];
        if (n) choose(n[0]);
      }, psig);
      for (const l of LANGS) if (l !== cols[0]) setTimeout(() => load(`t/${tt.id}.${l}.json`).catch(() => {}), 600);   // prêts pour le balayage
    }
    // j / k : article suivant, précédent
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.documentElement.classList.contains('search-open')) return;
      const d = e.key === 'j' ? 1 : e.key === 'k' ? -1 : 0; if (!d) return;
      const onArt = cur && cur.startsWith('art-');
      const i = order.indexOf(onArt ? cur : 'art-' + tt.a[0]) + (onArt ? d : (d > 0 ? 0 : -1));
      if (order[i]) { e.preventDefault(); location.hash = hashFor(order[i]); }
    }, sig);
    // instruments : chargés à l'approche de leur article (marges.js)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); mountIns(e.target); } }), { rootMargin: '700px 0px' });
    rd.querySelectorAll('.cx-ins').forEach(el => io.observe(el));
    ac.signal.addEventListener('abort', () => io.disconnect());
    let rz = 0;
    addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => {
      const m = narrow(), lay = layout(1, m);
      if (m !== mobile || lay.mg !== rd.classList.contains('cx-has-mg')) again();
    }, 160); }, sig);
  }
  /* barre : l'option choisie (un texte, une écriture) et l'adresse qui la porte */
  function syncChips(focus) {
    const id = S.shown = optNow();
    document.querySelectorAll('#cx .cx-chips [data-c]').forEach(b => {
      const on = b.dataset.c === id; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus({ preventScroll: true });
    });
    if (S.r && S.r.v === 'reader') { const h = hashFor(S.here || S.r.art || S.r.title); if (location.hash !== h) history.replaceState(null, '', h); }
  }
  /* nouveau rendu en place (textes, langue, largeur) : l'unité tenue sous la barre reste à sa hauteur */
  async function remount(anchor, extra = {}) {
    const h = location.hash;
    await prepare(S.r && S.r.v === 'reader' ? hashFor(S.r.art || S.here || S.r.title) : h);
    const app = $('app'); if (!app || !$('cx')) return;
    app.innerHTML = html(S.r && S.r.v === 'reader' ? hashFor(S.here && S.here.startsWith('art-') ? S.here : S.r.art || S.r.title) : h);
    if (anchor) S.r.art = null;   // l'ancre fait l'arrivée, pas l'article de l'adresse
    mounted(anchor, true);
    if (extra.focus) { const b = document.querySelector(`#cx .cx-chips [data-c="${extra.focus}"]`); if (b) b.focus({ preventScroll: true }); }
    if (extra.slide && !reduced()) { const sh = $('cxSheet'); if (sh) sh.animate(
      [{ transform: `translateX(${extra.slide * 36}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 200, easing: 'cubic-bezier(.2,.7,.2,1)' }); }
  }
  /* même titre (le portail ne change pas de page) : défilement jusqu'à l'article */
  function inplace(h) {
    if (!$('cx') || !S.r) return false;
    const r = parse(h);
    /* texte ou écriture de l'adresse (lien, retour arrière) : prepare() a déjà posé l'état, on compare
       avec ce qui est affiché */
    if (r.text && S.shown && optId(r.text, r.tsc) !== S.shown) {
      const was = optOf(S.shown)[1];
      S.text = r.text; S.tsc = r.tsc;
      if (r.text !== was) { remount(anchorNow()); return true; }
      syncChips(); const cells = [...document.querySelectorAll(`#cx .cxl[data-l="${r.text}"]`)];
      if (cells.length) switchScript(cells, r.text, r.tsc, [...document.querySelectorAll('#cx .cxl')]);
    }
    if (r.v === 'home' && S.r.v === 'home') {
      S.r = r; if (r.pre) { const p = $('preamble'); if (p) p.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); }
      else scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
      return true;
    }
    if (r.v !== 'reader' || S.r.v !== 'reader' || r.title !== S.r.title) return false;
    S.r = r;
    threadOn(placeOf(r));
    const el = $(r.art || r.title); if (!el) return true;
    const far = Math.abs(el.getBoundingClientRect().top) > innerHeight * 3, sm = !(reduced() || far);
    landing++;
    el.scrollIntoView({ behavior: sm ? 'smooth' : 'auto', block: 'start' });
    if (sm) setTimeout(() => { if (Math.abs(el.getBoundingClientRect().top) < innerHeight) land(el); }, 650); else land(el);
    if (r.art) { arrive(el); focusArt(el); }
    return true;
  }
  /* langue ou écriture changée depuis l'en-tête du portail */
  function rerender() {
    const cx = $('cx'); if (!cx) return false;
    if (S.lang !== LANG) {
      const prev = S.lang; S.lang = LANG;
      S.text = LANG; S.tsc = PRIMARY[LANG] || 'lat';   // le texte suit la langue de l'interface, dans son écriture première
      remount(anchorNow());
      return true;
    }
    // écriture de l'interface : libellés seulement, le texte garde l'écriture choisie dans la barre
    uiRefresh(cx); renderThread();
    if (S.track) S.track();
    document.dispatchEvent(new CustomEvent('cx:script'));
    return true;
  }
  function takeRef() { const r = S.ref; S.ref = null; return r && r.el && r.el.isConnected ? r : null; }
  function target() {
    const a = S.r && S.r.art && $(S.r.art); if (!a) return null;
    return narrow() ? a.querySelector('.cx-ah .cx-k') : a.querySelector('.cx-anum');
  }

  /* ---------------------------------------------------------------- aperçus */
  function pop() { let p = $('cxPop'); if (!p) { p = document.createElement('div'); p.id = 'cxPop'; p.setAttribute('role', 'tooltip'); p.hidden = true; document.body.appendChild(p); } return p; }
  async function showPop(a) {
    const href = a.getAttribute('href') || '';
    const cell = a.closest('[data-l]'), l = cell ? cell.dataset.l : LANG, cv = s => mode(l) === 'cyr' ? cyrText(String(s), l) : String(s);
    S.popFor = a; let h = '', m;
    if ((m = /^#\/constitution\/title-[0-9a-z]+\/(art-[0-9a-z]+)/.exec(href))) {
      const idx = await load(`idx.${l}.json`), e = idx[m[1]]; if (!e || S.popFor !== a) return;
      h = `<div class="cx-k">${esc(cv(lab('article', e[0], l)))}</div><h4>${esc(cv(e[1]))}</h4><p>${esc(cv(e[2]))}</p>`;
    } else if ((m = /^#\/constitution\/(title-[0-9a-z]+)/.exec(href))) {
      const tt = CORE.toc.find(x => x.id === m[1]); if (!tt) return;
      h = `<div class="cx-k">${esc(cv(lab('title', tt.num, l)))}</div><h4>${esc(cv(tt.name[li(l)]))}</h4><p>${esc(cv(lab('art', artNum('art-' + tt.a[0]), l)))} – ${esc(artNum('art-' + tt.a[tt.a.length - 1]))}</p>`;
    } else if ((m = /^#\/state\/([A-Z]{2}-\d{2})/.exec(href))) {
      const s = byCode(m[1]); if (!s) return;
      const type = { T: N('Territorial state'), F: N('Confederal territory'), M: N('Confederal autonomous municipality') }[s.t];
      const pe = s.p !== 'fed' && PEUPLES[s.p] ? L(PEUPLES[s.p].en) : '';
      const fl = STATE_FLAGS[s.c] ? `<img src="${STATE_FLAGS[s.c]}" alt="">` : '';   // seulement si déjà chargés
      h = `${fl}<div class="cx-k" translate="no">${s.c}</div><h4>${esc(sc(s.n))}</h4><p>${esc(sc(L(type)))}${pe ? ' · ' + esc(sc(pe)) : ''}</p>`;
    } else return;
    const p = pop(); p.innerHTML = h; p.hidden = false;
    p.lang = l === 'fr' ? 'fr' : HL[l];
    const r = a.getBoundingClientRect(), pw = p.offsetWidth, ph = p.offsetHeight;
    const x = Math.min(Math.max(12, r.left + scrollX), scrollX + innerWidth - pw - 12);
    let y = r.bottom + scrollY + 8;
    if (r.bottom + ph + 16 > innerHeight && r.top - ph - 8 > 60) y = r.top + scrollY - ph - 8;
    p.style.left = x + 'px'; p.style.top = y + 'px';
  }
  function hidePop() { S.popFor = null; clearTimeout(S.popT); const p = $('cxPop'); if (p) p.hidden = true; }
  const PV = '#cx a.cx-rf,#cx a.cx-sl,#cx a[data-pv]';
  document.addEventListener('mouseover', e => {
    const a = e.target.closest && e.target.closest(PV);
    if (!a || a === S.popFor || !matchMedia('(hover:hover)').matches) return;
    clearTimeout(S.popT); S.popT = setTimeout(() => showPop(a), 90);
  });
  document.addEventListener('mouseout', e => { const a = e.target.closest && e.target.closest(PV); if (a) hidePop(); });
  document.addEventListener('focusin', e => { const a = e.target.closest && e.target.closest(PV); if (a && a.matches(':focus-visible')) showPop(a); else hidePop(); });
  document.addEventListener('scroll', () => { if (S.popFor && !S.popFor.matches(':focus')) hidePop(); }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePop(); });

  /* ================================================================ bascule d'écriture (cyr.js)
     Portée de Codex : l'alignement par tronçons (pairsWord) est une présentation, vérifiée contre
     cyrWord du portail, et retombe sur le mot entier s'il ne le reconstruit pas. */
  function pairsWord(w, std) {
    const out = cyrWord(w, std);
    if (out === w) return [[w, w]];
    const low = w.toLowerCase();
    if (low.length !== w.length) return [[w, out]];
    const U = [];
    for (let i = 0; i < low.length; i++) {
      const two = low.substr(i, 2);
      if (two === 'lj') { U.push(['ļ', i, 2]); i++; } else if (two === 'nj') { U.push(['ñ', i, 2]); i++; }
      else if (two === 'dž') { U.push(['x', i, 2]); i++; } else U.push([low[i], i, 1]);
    }
    const P = [];
    if (std === 'ist') {
      for (let i = 0; i < U.length; i++) {
        const c = U[i][0], n = U[i + 1] ? U[i + 1][0] : '', p = U[i - 1] ? U[i - 1][0] : '';
        const two = cy => { P.push([U[i][1], U[i][2] + U[i + 1][2], cy]); i++; };
        if (c === 'š' && n === 't') { two('щ'); continue; }
        if (c === 'j' || c === 'ļ' || c === 'ñ') {
          const base = c === 'ļ' ? 'л' : c === 'ñ' ? 'н' : '';
          if (n === 'a') { two(base + 'я'); continue; }
          if (n === 'u') { two(base + 'ю'); continue; }
          if (n === 'o') { two(base ? base + 'ьо' : (p && !CYR_V.includes(p) ? 'ьо' : 'йо')); continue; }
          P.push([U[i][1], U[i][2], base ? base + 'ь' : 'й']); continue;
        }
        P.push([U[i][1], U[i][2], CYR_IST[c] !== undefined ? CYR_IST[c] : c]);
      }
    } else for (const u of U) P.push([u[1], u[2], CYR_SRE[u[0]] !== undefined ? CYR_SRE[u[0]] : u[0]]);
    const allUp = w.length > 1 && w === w.toUpperCase() && w !== w.toLowerCase();
    const cap = w[0] !== w[0].toLowerCase();
    const pairs = P.map(([s, l, cy], k) => [w.substr(s, l), allUp ? cy.toUpperCase() : (k === 0 && cap ? cy[0].toUpperCase() + cy.slice(1) : cy)]);
    return pairs.map(p => p[1]).join('') === out ? pairs : [[w, out]];
  }
  const WORD = /([\p{L}\p{M}\d]+)/u;
  function segments(text, std) {
    const a = text.split(WORD), b = cyrText(text, std).split(WORD);
    if (a.length !== b.length) return [[text, cyrText(text, std), false]];
    return a.map((s, i) => [s, b[i], i % 2 === 1]);
  }
  const skip = el => !!el.closest('[translate="no"],code,script,style,.cxu');
  function textNodes(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), out = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data) out.push(n);
    return out;
  }
  /* plan d'une cellule : les segments de chaque nœud de texte ; le texte entier est converti d'un bloc,
     pour que les règles de contexte de cyrText (« Article 109 a », « Glava III ») voient à travers les liens */
  function plan(root, std) {
    const nodes = textNodes(root), full = nodes.map(n => n.data).join('');
    const segs = segments(full, std);
    const out = []; let si = 0, offs = 0, ok = true;
    for (const n of nodes) {
      const mine = [], sk = skip(n.parentElement); let left = n.data.length;
      while (left > 0 && si < segs.length) {
        const [la, cy, isW] = segs[si], rest = la.length - offs;
        if (rest <= left) {
          mine.push(offs === 0 ? [la, sk ? la : cy, isW && !sk] : [la.slice(offs), la.slice(offs), false]);
          if (offs !== 0) ok = false;
          left -= rest; si++; offs = 0;
        } else { ok = false; mine.push([la.substr(offs, left), la.substr(offs, left), false]); offs += left; left = 0; }
      }
      out.push([n, mine, sk]);
    }
    if (!ok) return nodes.map(n => [n, skip(n.parentElement) ? [[n.data, n.data, false]] : segments(n.data, std), skip(n.parentElement)]);
    return out;
  }
  /* une cellule garde sa source latine (_lat) ; dataset.sc dit ce qu'elle montre : lat | cyr */
  function setScript(cell, std, m) {
    if (cell._lat === undefined) cell._lat = cell.innerHTML;
    if ((cell.dataset.sc || 'lat') === m) return;
    cell.innerHTML = cell._lat;
    if (m === 'cyr') { for (const [n, segs, sk] of plan(cell, std)) if (!sk) n.data = segs.map(s => s[1]).join(''); }
    cell.dataset.sc = m;
    setLang(cell, std, m);
  }
  function setLang(cell, std, m) {
    cell.lang = m === 'cyr' ? (std === 'ist' ? 'bg' : 'sh-Cyrl') : HL[std];
  }
  let running = null, gen = 0;
  /* cells : cellules d'un standard ; to : lat | cyr. Seul ce qui est à l'écran s'anime ; le reste
     est converti ensuite, par tranches, la première cellule visible tenue à sa place. */
  function switchScript(cells, std, to, track = []) {
    if (running) { running.finish(); running = null; }
    const my = ++gen;
    const vh = innerHeight, vis = [], offs = [];
    const seen = new Map();
    const near = c => { const a = c.closest('.cx-art'); if (!a) return true;
      if (!seen.has(a)) { const r = a.getBoundingClientRect(); seen.set(a, r.bottom > 0 && r.top < vh); }
      return seen.get(a); };
    for (const c of cells) {
      if ((c.dataset.sc || 'lat') === to) continue;
      if (!near(c)) { offs.push(c); continue; }
      const r = c.getBoundingClientRect();
      (r.bottom > 0 && r.top < vh && r.width > 0 && r.right > 0 && r.left < innerWidth ? vis : offs).push(c);
    }
    /* la cellule tenue en place est celle de la ligne de lecture, sous la barre, pas une cellule
       en partie cachée au-dessus : son changement de hauteur ne doit pas déplacer le texte lu */
    const line = topWant(), anchor = vis.find(c => c.getBoundingClientRect().bottom > line) || vis[0] || null;
    const top0 = anchor ? anchor.getBoundingClientRect().top : 0;
    const keep = () => { if (anchor) { const d = anchor.getBoundingClientRect().top - top0; if (Math.abs(d) > .5) scrollBy(0, d); } };
    const root = document.documentElement;
    root.style.overflowAnchor = 'none';
    const later = () => new Promise(res => {
      let i = 0;
      const step = () => {
        if (my !== gen) { res(); return; }
        const a = anchor && anchor.isConnected ? anchor : null;
        const t = a ? a.getBoundingClientRect().top : 0, end = performance.now() + 7;
        while (i < offs.length && performance.now() < end) setScript(offs[i++], std, to);
        if (a) { const d = a.getBoundingClientRect().top - t; if (Math.abs(d) > .5) scrollBy(0, d); }
        if (i < offs.length) requestAnimationFrame(step); else { root.style.overflowAnchor = ''; res(); }
      };
      step();
    });
    if (!vis.length) return later();
    const glyph = !reduced();
    const tr = track.filter(c => !vis.includes(c) && near(c) && (r => r.bottom > 0 && r.top < vh)(c.getBoundingClientRect()));
    return (glyph ? glyphSwitch(vis, std, to, keep, tr) : fadeSwitch(vis, std, to, keep)).then(later);
  }
  /* mouvement réduit : fondu enchaîné de 200 ms dans la cellule même */
  function fadeSwitch(vis, std, to, keep) {
    const ghosts = vis.map(c => { const g = document.createElement('span'); g.className = 'cx-ghost2'; g.setAttribute('aria-hidden', 'true');
      g.innerHTML = c.innerHTML; g.lang = c.lang; return g; });
    for (const c of vis) setScript(c, std, to);
    keep();
    vis.forEach((c, i) => {
      const g = ghosts[i];
      for (const ch of c.children) ch.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      if (!c.children.length) c.animate([{ opacity: .2 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      else { c.append(g); g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-in', fill: 'forwards' }).finished.then(() => g.remove(), () => g.remove()); }
    });
    return new Promise(r => setTimeout(r, 220));
  }
  /* glyphe par glyphe. 1 lire les coupures de ligne de la source ; 2 écrire mots et glyphes en span,
     <br> aux coupures, sans retour à la ligne, pour qu'aucune ligne ne se recompose ; 3 une vague
     remplace chaque tronçon (texte et couleur, sans calque par glyphe) ; 4 relâcher les coupures, ce
     qui bouge glisse à sa place (FLIP). */
  function glyphSwitch(vis, std, to, keep, track = []) {
    const toCyrl = to === 'cyr';
    const jobs = [], rg = document.createRange();
    for (const c of vis) { if ((c.dataset.sc || 'lat') !== 'lat') { c.innerHTML = c._lat; c.dataset.sc = 'lat'; } if (c._lat === undefined) c._lat = c.innerHTML; }
    for (const c of vis) {
      const pl = plan(c, std);
      if (!toCyrl) { for (const [n, segs, sk] of pl) if (!sk) n.data = segs.map(s => s[1]).join(''); }
      jobs.push([c, pl]);
    }
    keep();
    const marks = [];
    for (const [, pl] of jobs) {
      const m = [];
      for (const [n, segs, sk] of pl) {
        const tops = []; let o = 0;
        for (const s of segs) {
          const src = sk ? s[0] : (toCyrl ? s[0] : s[1]);
          if (/\S/.test(src)) {
            const lead = src.length - src.trimStart().length;
            rg.setStart(n, Math.min(o + lead, n.data.length)); rg.setEnd(n, Math.min(o + lead + 1, n.data.length));
            const r = rg.getClientRects()[0]; tops.push(r ? r.top : null);
          } else tops.push(null);
          o += src.length;
        }
        m.push(tops);
      }
      marks.push(m);
    }
    const glyphs = [], blocks = [];
    jobs.forEach(([c, pl], ji) => {
      let lastTop = null, lastBlk = null;
      pl.forEach(([n, segs, sk], ni) => {
        const f = document.createDocumentFragment();
        const blk = n.parentElement.closest('p,h1,h2,h3,h4,li,div,header,a') || c;
        if (blk !== lastBlk) { lastBlk = blk; lastTop = null; }
        segs.forEach((s, si) => {
          const src = sk ? s[0] : (toCyrl ? s[0] : s[1]), top = marks[ji][ni][si];
          if (top !== null && !sk) {
            if (lastTop !== null && top > lastTop + 4) { const br = document.createElement('br'); br.className = 'cx-fz'; f.append(br); }
            lastTop = top;
          }
          if (sk || !s[2] || s[0] === s[1]) {
            if (top !== null && /^\s+/.test(src) && f.lastChild && f.lastChild.nodeName === 'BR') f.append(src.trimStart());
            else f.append(src);
            return;
          }
          const w = document.createElement('span'); w.className = 'cx-w';
          let prs = pairsWord(s[0], std);
          if (prs.map(x => x[1]).join('') !== s[1]) prs = [[s[0], s[1]]];
          for (const [la, cy] of prs) {
            const a = toCyrl ? la : cy, b = toCyrl ? cy : la;
            if (a === b) { w.append(a); continue; }
            const g = document.createElement('span'); g.className = 'cx-g'; g.textContent = a;
            w.append(g); glyphs.push([g, b, w]);
          }
          f.append(w);
        });
        n.replaceWith(f);
      });
      blocks.push(c);
    });
    for (const c of blocks) { c.classList.add('cx-fz'); setLang(c, std, 'cyr'); }
    const wpos = new Map();
    for (const [, , w] of glyphs) if (!wpos.has(w)) { const r = w.getBoundingClientRect(); wpos.set(w, [r.left, r.top]); }
    const W = innerWidth, H = innerHeight;
    const sched = glyphs.map(([g, b, w]) => {
      const [x, y] = wpos.get(w); let k = 0; for (let p = g.previousSibling; p; p = p.previousSibling) k++;
      return [Math.max(0, (y / H) * 900 + (x / W) * 150 + k * 12), g, b];
    }).sort((a, b) => a[0] - b[0]);
    let done = false, raf = 0, fin;
    const p = new Promise(r => (fin = r));
    const settle = () => {
      if (done) return; done = true; cancelAnimationFrame(raf);
      const flip = blocks.concat(track);
      const top0 = flip.map(c => c.getBoundingClientRect().top);
      const sig = c => { let q = ''; for (const w of c.querySelectorAll('.cx-w')) q += w.offsetTop + ','; return q + c.offsetHeight; };
      const frozen = blocks.map(c => [c.cloneNode(true), sig(c)]);
      for (const c of blocks) { c.classList.remove('cx-fz'); c.querySelectorAll('br.cx-fz').forEach(x => x.replaceWith(' ')); }
      const changed = blocks.map((c, n) => sig(c) !== frozen[n][1]);
      for (const c of blocks) { c.dataset.sc = 'lat'; c.innerHTML = c._lat; setScript(c, std, to); }
      keep();
      const ease = 'cubic-bezier(.2,.7,.2,1)';
      blocks.forEach((c, n) => {
        if (!changed[n]) return;
        const g = frozen[n][0]; g.className = 'cx-ghost2 cx-fz'; g.removeAttribute('id'); g.removeAttribute('data-l'); g.setAttribute('aria-hidden', 'true');
        for (const ch of c.children) ch.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
        c.append(g);
        g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' }).finished.then(() => g.remove(), () => g.remove());
      });
      flip.forEach((c, n) => { const d = top0[n] - c.getBoundingClientRect().top;
        if (Math.abs(d) > 1) c.animate([{ transform: `translateY(${d}px)` }, { transform: 'none' }], { duration: 260, easing: ease }); });
      running = null; setTimeout(fin, 270);
    };
    const t0 = performance.now(); let i = 0, j = 0, k = 0; const HOT = 150, WARM = 300;
    const step = now => {
      const t = now - t0;
      while (i < sched.length && sched[i][0] <= t) { const [, g, b] = sched[i++]; g.firstChild.data = b; g.className = 'cx-g cx-h1'; }
      while (j < i && sched[j][0] + HOT <= t) sched[j++][1].className = 'cx-g cx-h2';
      while (k < j && sched[k][0] + WARM <= t) sched[k++][1].className = 'cx-g';
      if (k < sched.length) raf = requestAnimationFrame(step); else setTimeout(settle, 90);
    };
    raf = requestAnimationFrame(step);
    running = { finish() {
      for (; i < sched.length; i++) sched[i][1].textContent = sched[i][2];
      if (!done) { done = true; cancelAnimationFrame(raf); for (const c of blocks) { c.classList.remove('cx-fz'); c.dataset.sc = 'lat'; c.innerHTML = c._lat; setScript(c, std, to); } fin(); } } };
    return p;
  }

  return { prepare, html, mounted, inplace, rerender, takeRef, target, leave, load, got, parse, hashFor, lab, ui, sc, tl,
    artNum, titleOf, mode, INS, S, setScript, anchorNow };
})();
