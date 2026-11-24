/* regles.js — moteur unique des règles de vote et de sièges, à la lettre de la Constitution v4.16.
   ADR 2026-11-23 (lecteur) ; porté de proto/sabor/js/rules.js (branche claude/proto-tour-2), sans ses
   libellés (lot 3, avec leurs traductions) ni la péréquation (art. 132 en révision). Ajouts : sièges
   du Kongres (art. 103), délai de l'alarme (art. 109 b), commission de conciliation (art. 110 ter),
   double clé et Konfederalno Veće pour les instruments du lecteur (art. 110, 111, 115 bis).

   Script classique (fichier unique en file://), pur : aucun DOM, aucune chaîne affichée. Les
   identifiants rendus (org, line.k, hyp) sont traduits par la page qui les affiche. Ce que le texte
   ne tranche pas est une hypothèse nommée (HYP), affichée avec le résultat.
   Vérifié contre le texte : scripts/test_regles.js. */
var REGLES = (function () {
  'use strict';

  /* ---------------------------------------------------------------- contexte
     states : etats.json ; stats : stats.json ; peuples : peuples.json (ordre de l'art. 110, al. 1).
     Registres nationaux (art. 115 bis) : faute de relevé annuel, la population des États territoriaux
     rattachés à chaque peuple (HYP reg ; docs/canon/equilibre.md, section 2). */
  var MUN_AVEC = { 'BK-95': 'SA-92', 'MO-96': 'SA-92' };   // HYP mun : territoire confédéral le plus proche (art. 124)
  function contexte(states, stats, peuples) {
    var order = Object.keys(peuples);
    var rows = states.map(function (s) {
      var pop = (stats[s.c] || {}).population || 0;
      return { c: s.c, t: s.t, p: s.t === 'T' ? s.p : null, pop: pop, with: s.t === 'M' ? MUN_AVEC[s.c] : undefined };
    });
    var S = sieges(rows);
    var by = {};
    S.rows.forEach(function (r) { by[r.c] = r; });
    rows.forEach(function (r) { r.s = by[r.c].s; });
    var reg = {};
    order.forEach(function (p) { reg[p] = 0; });
    rows.forEach(function (r) { if (r.p) reg[r.p] += r.pop; });
    var C = { states: rows, order: order, reg: reg, seats: S, by: {} };
    rows.forEach(function (r, i) { r.i = i; C.by[r.c] = r; });
    C.regTotal = order.reduce(function (a, p) { return a + reg[p]; }, 0);
    C.popTotal = rows.reduce(function (a, r) { return a + r.pop; }, 0);
    return C;
  }

  /* ---------------------------------------------------------------- art. 103 : sièges du Kongres
     250 délégués ; chaque État, une circonscription, 2 à 20 sièges ; Brčko et Mostar, une
     circonscription chacune, au moins un délégué ; Sainte-Laguë, proportionnellement à la population.
     HYP sl : le texte ne dit pas comment les limites se combinent avec la méthode ; ici un diviseur
     commun, arrondi au plus proche, puis les limites (bornes [2, 20], [1, 20] pour les municipalités). */
  var KONGRES = 250;
  function bornes(r) { return [r.t === 'M' ? 1 : 2, 20]; }
  function sieges(rows, total) {
    total = total || KONGRES;
    var at = function (D) {
      return rows.map(function (r) { var b = bornes(r); return Math.min(b[1], Math.max(b[0], Math.round(r.pop / D))); });
    };
    var lo = 1, hi = 1e7, D = 0, s = [], n = 0;
    for (var i = 0; i < 200; i++) {
      D = (lo + hi) / 2; s = at(D); n = s.reduce(function (a, b) { return a + b; }, 0);
      if (n > total) lo = D; else if (n < total) hi = D; else break;
    }
    return {
      D: D, sum: n, total: total,
      rows: rows.map(function (r, k) {
        var nat = Math.round(r.pop / D), b = bornes(r);
        return { c: r.c, t: r.t, pop: r.pop, s: s[k], floor: nat < b[0], cap: nat > b[1] };
      })
    };
  }

  /* ---------------------------------------------------------------- seuils */
  var half = function (n) { return Math.floor(n / 2) + 1; };          // plus de la moitié
  var twoThirds = function (n) { return Math.ceil(n * 2 / 3); };      // deux tiers au moins (HYP al)
  var DELEGATION = 10, SABOR = 70, COMMISSION = 14;                    // art. 107, 110 ter al. 1

  /* ---------------------------------------------------------------- art. 110 et 115 bis : double clé
     oui : peuples dont la délégation approuve (majorité simple en son sein).
     cinq : au moins cinq des sept (al. 4) ; cle : ces délégations représentent ensemble la majorité des
     inscrits aux registres nationaux (al. 5, art. 115 bis) ; six : révision (al. 6), double clé
     comprise : six délégations sont « au moins cinq des sept » (HYP six, lecture retenue par l'auteur
     le 2026-11-24 ; aujourd'hui sans effet, six peuples font toujours plus de 68 % des inscrits) ;
     sept : garanties renforcées (al. 6, art. 150), qui font tous les inscrits. */
  function cleDouble(C, oui) {
    var n = oui.length, r = oui.reduce(function (a, p) { return a + C.reg[p]; }, 0);
    return { n: n, inscrits: r, part: C.regTotal ? r / C.regTotal : 0, cinq: n >= 5, cle: n >= 5 && r * 2 > C.regTotal,
      six: n >= 6 && r * 2 > C.regTotal, sept: n === 7 };
  }

  /* ---------------------------------------------------------------- art. 111 : Konfederalno Veće
     pour, contre : peuples des conseillers ; les autres s'abstiennent.
     consensus (al. 3) : aucun conseiller contre et au moins un pour (HYP cons) ; sinon quatre conseillers
     dont les peuples représentent la majorité des inscrits (art. 110), ou cinq (al. 4) ; suspension de
     trente jours si la décision est prise contre trois conseillers au moins (al. 5). Non calculés :
     siège vacant et voix prépondérante (al. 4), exceptions de l'al. 7 (HYP exc). */
  function conseil(C, pour, contre) {
    contre = contre || C.order.filter(function (p) { return pour.indexOf(p) < 0; });
    var nf = pour.length, na = contre.length;
    var r = pour.reduce(function (a, p) { return a + C.reg[p]; }, 0);
    var consensus = na === 0 && nf > 0;
    var quatre = nf >= 4 && r * 2 > C.regTotal, cinq = nf >= 5;
    var adoptee = consensus || quatre || cinq;
    return { n: nf, contre: na, inscrits: r, part: C.regTotal ? r / C.regTotal : 0, consensus: consensus,
      quatre: quatre, cinq: cinq, adoptee: adoptee, suspendue: adoptee && !consensus && na >= 3 };
  }

  /* ---------------------------------------------------------------- art. 109 b : sonnette d'alarme
     voix : membres de la délégation qui votent la motion (sur dix) ; jour : jours écoulés depuis
     l'adoption de la loi par le Kongres. Levée : deux tiers des membres (7 sur 10, HYP al) dans les
     trente jours ; la loi est alors suspendue et renvoyée à la commission de conciliation. */
  function alarme(o) {
    var need = twoThirds(DELEGATION), voix = o.voix >= need, delai = o.jour <= 30;
    return { need: need, voix: voix, delai: delai, levee: voix && delai };
  }

  /* ---------------------------------------------------------------- art. 110 ter : conciliation
     pour : membres de la commission (sur quatorze) qui adoptent le texte de compromis ; membre : vote
     du membre désigné par la délégation qui a levé l'alarme ; jours : depuis la saisine. Adopté :
     majorité des membres (8 sur 14), dans les soixante jours, avec ce membre en cas d'alarme (al. 3).
     Le compromis va ensuite aux deux chambres (al. 4) ; si la conciliation échoue, une loi visée par
     l'alarme ne peut être adoptée qu'aux deux tiers du Kongres (al. 5, lettre b ; 167 sur 250, HYP al). */
  function conciliation(o) {
    var need = half(COMMISSION), alarmeLevee = o.alarme !== false;
    var majorite = o.pour >= need, membre = !alarmeLevee || !!o.membre, delai = (o.jours || 0) <= 60;
    return { need: need, majorite: majorite, membre: membre, delai: delai, adopte: majorite && membre && delai,
      deuxTiers: twoThirds(KONGRES) };
  }
  function kongresDeuxTiers(voix) { var need = twoThirds(KONGRES); return { need: need, ok: voix >= need }; }

  /* ================================================================ moteur de Sabor (rules.js)
     Un vote : { type, st:{code:'f'|'a'|'x'}, del:{peuple:[pour, contre]}, cv:{peuple:'f'|'a'|'x'} }
     f = pour, a = contre, x = abstention. Libellés retirés : org, line.k et hyp sont des identifiants. */
  var TYPES = [
    { id: 'law', arts: ['106', '109'], k: 1, d: 1, steps: [['k'], ['alarm', 'k23']] },
    { id: 'consent', arts: ['109', '110'], k: 1, d: 1, steps: [['k'], ['ns', 'del'], ['key']] },
    { id: 'urgent', arts: ['123 bis'], k: 1, d: 1, steps: [['k'], ['ns', 'del'], ['key']] },
    { id: 'revision', arts: ['147', '110', '123'], k: 1, d: 1, s: 1, steps: [['k'], ['ns', 'del'], ['key'], ['p'], ['s']] },
    { id: 'entrenched', arts: ['150'], k: 1, d: 1, s: 1, steps: [['k'], ['ns', 'del'], ['p'], ['s']] },
    { id: 'initiative', arts: ['121', '124'], s: 1, steps: [['p'], ['s']] },
    { id: 'stinit', arts: ['106 bis'], s: 1, co: 8, steps: [['co'], ['half']] },
    { id: 'stref', arts: ['122'], s: 1, co: 12, steps: [['co'], ['half']] },
    { id: 'council', arts: ['111'], c: 1, steps: [['cons'], ['c4', 'c5']] }
  ];
  var typeById = function (id) { return TYPES.filter(function (t) { return t.id === id; })[0] || TYPES[1]; };
  /* Article → type de décision qu'il fonde (lecteur de la Constitution). */
  var ART_RULE = {
    'art-103': 'law', 'art-106': 'law', 'art-106bis': 'stinit', 'art-109': 'law', 'art-110': 'consent',
    'art-110ter': 'law', 'art-111': 'council', 'art-115bis': 'consent', 'art-121': 'initiative',
    'art-122': 'stref', 'art-123': 'initiative', 'art-123bis': 'urgent', 'art-124': 'initiative',
    'art-147': 'revision', 'art-149': 'revision', 'art-150': 'entrenched'
  };

  function tally(C, v) {
    var K = { f: 0, a: 0, x: 0 }, P = { f: 0, a: 0, x: 0 }, St = { f: 0, a: 0, x: 0 };
    var cityPop = {};                                 // art. 124 : Brčko et Mostar votent avec… (HYP mun)
    C.states.forEach(function (s) {
      var o = v.st[s.c] || 'x';
      K[o] += s.s; P[o] += s.pop;
      var host = s.t === 'M' ? s.with : s.t === 'F' ? s.c : null;
      if (host) { (cityPop[host] || (cityPop[host] = { f: 0, a: 0, x: 0 }))[o] += s.pop; }
      if (s.t === 'T') St[o]++;
    });
    var stateVote = {};
    C.states.forEach(function (s) {
      if (s.t === 'T') stateVote[s.c] = v.st[s.c] || 'x';
      else if (s.t === 'F') {
        var t = cityPop[s.c], o = t.f > t.a ? 'f' : t.a > t.f ? 'a' : 'x';
        stateVote[s.c] = o; St[o]++;
      }
    });
    /* coalitions d'États (art. 106 bis d et 122) : les États eux-mêmes, donc la position propre de
       chaque ville-État, sans Brčko ni Mostar */
    var coalStates = 0, coalBy = {};
    C.states.forEach(function (s) {
      if (s.t !== 'M' && (v.st[s.c] || 'x') === 'f') { coalStates++; if (s.p) coalBy[s.p] = (coalBy[s.p] || 0) + 1; }
    });
    var D = { f: 0, a: 0, x: 0 }, yes = [], alarm = [];
    C.order.forEach(function (p) {
      var fa = v.del[p] || [0, 0], f = fa[0], a = fa[1];
      D.f += f; D.a += a; D.x += DELEGATION - f - a;
      if (f > a) yes.push(p);
      if (a >= twoThirds(DELEGATION)) alarm.push(p); // art. 109 b : deux tiers des membres d'une délégation
    });
    var regYes = yes.reduce(function (t, p) { return t + C.reg[p]; }, 0);
    var cv = { f: [], a: [], x: [] };
    C.order.forEach(function (p) { cv[v.cv[p] || 'x'].push(p); });
    return { K: K, P: P, St: St, stateVote: stateVote, D: D, yes: yes, alarm: alarm, regYes: regYes, cv: cv,
      coalStates: coalStates, coalBy: coalBy };
  }

  function bar(id, org, req, arts, t, total, need, ok, extra) {
    var g = { id: id, org: org, req: req, arts: arts, kind: 'bar', f: t.f, a: t.a, x: t.x, total: total, need: need, ok: ok };
    for (var k in (extra || {})) g[k] = extra[k];
    return g;
  }
  var SIMPLE = '{f} > {a}';                           // majorité simple : plus de pour que de contre, l'abstention
                                                      // ne compte pas (HYP present, lecture retenue le 2026-11-24)

  function evaluate(C, v) {
    var type = typeById(v.type), t = tally(C, v), G = [];
    var simple = function (o) { return o.f > o.a; };
    var verdict = 'fail', line = null, hyp = [];
    var kSimple = function () { return bar('k', 'kongres', SIMPLE, ['106'], t.K, KONGRES, half(t.K.f + t.K.a), simple(t.K), { unit: 'seats', hyp: 'present' }); };
    var nsDeleg = function (need, arts) {
      return { id: 'del', org: 'delegations', req: '≥ ' + need + ' / 7', arts: arts, kind: 'count', value: t.yes.length, total: 7, need: need,
        ok: t.yes.length >= need, list: C.order.map(function (p) { return { p: p, on: t.yes.indexOf(p) >= 0 }; }) };
    };
    var key = function () {
      return { id: 'key', org: 'registered', req: '> 50 %', arts: ['110', '115 bis'], kind: 'share',
        value: t.regYes / C.regTotal, need: 0.5, ok: t.regYes * 2 > C.regTotal, hyp: 'reg' };
    };
    var people = function () { return bar('p', 'citizens', SIMPLE, ['123'], t.P, C.popTotal, null, simple(t.P), { unit: 'inhabitants', hyp: 'pop' }); };
    var states = function () { return bar('s', 'states', '≥ 27 / 52', ['124'], t.St, 52, 27, t.St.f >= 27, { unit: 'states', hyp: 'mun' }); };
    var all = function () { return G.every(function (g) { return g.ok; }); };

    if (type.id === 'law') {
      var k = kSimple(); G.push(k);
      var two = twoThirds(KONGRES);
      G.push({ id: 'alarm', org: 'alarm', req: '≥ ' + twoThirds(DELEGATION) + ' / 10', arts: ['109'], kind: 'alarm',
        list: C.order.map(function (p) { return { p: p, n: (v.del[p] || [0, 0])[1], on: t.alarm.indexOf(p) >= 0 }; }),
        need: twoThirds(DELEGATION), ok: !t.alarm.length, soft: true, hyp: 'alarm' });
      /* art. 109 b et 110 ter b : si la conciliation échoue, la loi ne peut être adoptée qu'aux deux tiers */
      G.push(bar('k23', 'kongres', '≥ ⅔', ['110 ter'], t.K, KONGRES, two, t.K.f >= two, { unit: 'seats', soft: true, when: t.alarm.length > 0 }));
      if (!k.ok) verdict = 'fail';
      else if (!t.alarm.length) { verdict = 'pass'; line = { k: 'law-pass' }; }
      else { verdict = 'hold'; line = { k: 'law-hold', art: '109' }; }   // suspendue dès que l'alarme est votée
      hyp = ['bloc', 'present', 'alarm'];
    } else if (type.id === 'consent' || type.id === 'urgent') {
      var urg = type.id === 'urgent';
      G.push(urg ? bar('k', 'kongres', '> ½ · 250', ['123 bis'], t.K, KONGRES, half(KONGRES), t.K.f >= half(KONGRES), { unit: 'seats' }) : kSimple());
      G.push(urg ? bar('ns', 'sabor', '> ½ · 70', ['123 bis'], t.D, SABOR, half(SABOR), t.D.f >= half(SABOR), { unit: 'members' })
        : bar('ns', 'sabor', SIMPLE, ['110'], t.D, SABOR, half(t.D.f + t.D.a), simple(t.D), { unit: 'members' }));
      G.push(nsDeleg(5, [urg ? '123 bis' : '110']));
      G.push(key());
      verdict = all() ? 'pass' : 'fail';
      line = verdict === 'pass' ? { k: urg ? 'urgent-pass' : 'consent-pass' } : (G[0].ok ? { k: 'consent-refused' } : null);
      hyp = ['bloc', 'present', 'reg'];
    } else if (type.id === 'revision' || type.id === 'entrenched') {
      var need = type.id === 'entrenched' ? 7 : 6;
      G.push(kSimple());
      G.push(bar('ns', 'sabor', '≥ ⅔ · 70', ['110'], t.D, SABOR, twoThirds(SABOR), t.D.f >= twoThirds(SABOR), { unit: 'members', hyp: 'present' }));
      G.push(nsDeleg(need, [need === 7 ? '150' : '110']));
      if (need === 6) { var kk = key(); kk.hyp = 'six'; G.push(kk); }   // art. 110 al. 5 et 6 (HYP six)
      G.push(people()); G.push(states());
      var gid = function (id) { return G.filter(function (g) { return g.id === id; })[0]; };
      var ns = ['ns', 'del', 'key'].every(function (id) { var g = gid(id); return !g || g.ok; });
      verdict = all() ? 'pass' : 'fail';
      line = verdict === 'pass' ? { k: 'revision-pass' }
        : !G[0].ok ? null : !ns ? { k: 'consent-refused' } : !gid('p').ok ? { k: 'people-rejects' } : null;
      hyp = need === 6 ? ['bloc', 'present', 'reg', 'six', 'pop', 'mun'] : ['bloc', 'present', 'pop', 'mun'];
    } else if (type.id === 'initiative') {
      G.push(people()); G.push(states());
      verdict = all() ? 'pass' : 'fail';
      line = verdict === 'pass' ? { k: 'revision-pass' } : (G[0].ok ? null : { k: 'people-rejects' });
      hyp = ['pop', 'mun'];
    } else if (type.co) {
      var n = t.coalStates, top = Math.max.apply(null, [0].concat(Object.keys(t.coalBy).map(function (p) { return t.coalBy[p]; })));
      var topP = C.order.filter(function (p) { return (t.coalBy[p] || 0) === top && top > 0; })[0] || null;
      G.push({ id: 'co', org: 'states', req: '≥ ' + type.co, arts: type.arts, kind: 'count', value: n, total: 52, need: type.co, ok: n >= type.co });
      G.push({ id: 'half', org: 'people', req: '≤ ½', arts: type.arts, kind: 'share', value: n ? top / n : 0, need: 0.5, max: true,
        ok: n > 0 && top * 2 <= n, top: top, topP: topP, n: n, hyp: 'coal' });
      verdict = all() ? 'pass' : 'fail';
      line = verdict === 'pass' ? { k: type.id + '-pass', art: type.id === 'stref' ? '122' : '106 bis' } : null;
      hyp = ['coal'];
    } else if (type.id === 'council') {
      var R = conseil(C, t.cv.f, t.cv.a);
      G.push({ id: 'cons', org: 'council', req: '0 {a}', arts: ['111'], kind: 'count', value: R.n, total: 7, need: 7, ok: R.consensus, soft: true, hyp: 'cons',
        list: C.order.map(function (p) { return { p: p, on: (v.cv[p] || 'x') === 'f', off: (v.cv[p] || 'x') === 'a' }; }) });
      G.push({ id: 'c4', org: 'registered', req: '≥ 4 / 7 · > 50 %', arts: ['111', '110'], kind: 'share', value: R.part, need: 0.5, ok: R.quatre, soft: true, hyp: 'reg' });
      G.push({ id: 'c5', org: 'council', req: '≥ 5 / 7', arts: ['111'], kind: 'count', value: R.n, total: 7, need: 5, ok: R.cinq, soft: true });
      if (!R.adoptee) { verdict = 'fail'; line = { k: 'council-fail' }; }
      else if (R.suspendue) { verdict = 'hold'; line = { k: 'council-hold' }; }
      else { verdict = 'pass'; line = { k: R.consensus ? 'council-consensus' : 'council-pass' }; }
      hyp = ['reg', 'cons', 'exc'];
    }
    return { type: type, t: t, gauges: G, verdict: verdict, line: line, hyp: hyp };
  }

  /* Hypothèses que le texte ne tranche pas : identifiants, affichés avec le résultat (libellés : lot 3,
     docs/lot1/PLAN.md, section « Chaînes », pour celles du lecteur). */
  var HYP = ['bloc', 'present', 'reg', 'pop', 'mun', 'alarm', 'coal', 'cons', 'exc', 'sl', 'al', 'six'];

  /* ---------------------------------------------------------------- état partageable (Sabor) */
  var B27 = '0123456789abcdefghijklmnopq', TR = ['f', 'a', 'x'], B11 = '0123456789a';
  function pack(arr) {
    var s = '';
    for (var i = 0; i < arr.length; i += 3)
      s += B27[TR.indexOf(arr[i]) * 9 + TR.indexOf(arr[i + 1] || 'f') * 3 + TR.indexOf(arr[i + 2] || 'f')];
    return s;
  }
  function unpack(s, n) {
    var o = [];
    for (var i = 0; i < s.length; i++) {
      var k = B27.indexOf(s[i]); if (k < 0) return null;
      o.push(TR[Math.floor(k / 9)], TR[Math.floor(k / 3) % 3], TR[k % 3]);
    }
    return o.length >= n ? o.slice(0, n) : null;
  }
  function encode(C, v) {
    var st = pack(C.states.map(function (s) { return v.st[s.c] || 'x'; }));
    var del = C.order.map(function (p) { var fa = v.del[p] || [0, 0]; return B11[fa[0]] + B11[fa[1]]; }).join('');
    var cv = pack(C.order.map(function (p) { return v.cv[p] || 'x'; }));
    return 'vote-' + v.type + '-' + st + '-' + del + '-' + cv;
  }
  function decode(C, hash) {
    var m = /^vote-([a-z]+)(?:-([0-9a-q]{18})-([0-9a]{14})-([0-9a-q]{3}))?$/.exec(hash);
    if (!m || !TYPES.some(function (t) { return t.id === m[1]; }) || !m[2]) return null;
    var st = unpack(m[2], C.states.length), cv = unpack(m[4], 7);
    if (!st || !cv) return null;
    var v = { type: m[1], st: {}, del: {}, cv: {} };
    C.states.forEach(function (s, i) { v.st[s.c] = st[i]; });
    C.order.forEach(function (p, i) {
      var f = B11.indexOf(m[3][2 * i]), a = B11.indexOf(m[3][2 * i + 1]);
      v.del[p] = f + a <= DELEGATION ? [f, a] : [0, 0]; v.cv[p] = cv[i];
    });
    return v;
  }
  function blank(C, type, o) {
    o = o || 'x';
    var v = { type: type, st: {}, del: {}, cv: {} };
    C.states.forEach(function (s) { v.st[s.c] = o; });
    C.order.forEach(function (p) { v.del[p] = o === 'f' ? [DELEGATION, 0] : o === 'a' ? [0, DELEGATION] : [0, 0]; v.cv[p] = o; });
    return v;
  }
  /* Place un groupe entier : un peuple (États, délégation, conseiller), 'fed' ou 'mun'. */
  function setGroup(C, v, g, o) {
    C.states.forEach(function (s) { if ((s.p || (s.t === 'F' ? 'fed' : 'mun')) === g) v.st[s.c] = o; });
    if (C.reg[g] != null) { v.del[g] = o === 'f' ? [DELEGATION, 0] : o === 'a' ? [0, DELEGATION] : [0, 0]; v.cv[g] = o; }
    return v;
  }

  return {
    contexte: contexte, sieges: sieges, cleDouble: cleDouble, conseil: conseil, alarme: alarme,
    conciliation: conciliation, kongresDeuxTiers: kongresDeuxTiers,
    TYPES: TYPES, typeById: typeById, ART_RULE: ART_RULE, tally: tally, evaluate: evaluate, HYP: HYP,
    encode: encode, decode: decode, blank: blank, setGroup: setGroup,
    seuils: { half: half, twoThirds: twoThirds, KONGRES: KONGRES, SABOR: SABOR, DELEGATION: DELEGATION, COMMISSION: COMMISSION }
  };
})();
