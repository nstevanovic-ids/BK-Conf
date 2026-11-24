#!/usr/bin/env node
/* Vérifie le moteur unique (portail/js/regles.js) contre le texte de la Constitution v4.16.
   Usage : node scripts/test_regles.js        (code de sortie 1 au premier écart)

   Chaque cas cite l'alinéa qu'il applique ; les attendus sont calculés ici, de façon indépendante,
   à partir des données du portail (etats.json, stats.json, peuples.json). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'portail', 'data', f), 'utf8'));
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'portail', 'js', 'regles.js'), 'utf8'), ctx);
const R = ctx.REGLES;
const STATES = J('etats.json'), STATS = J('stats.json'), PEUPLES = J('peuples.json');
const C = R.contexte(STATES, STATS, PEUPLES);

let n = 0, bad = 0;
function ok(cond, what) { n++; if (!cond) { bad++; console.log('✗ ' + what); } }
function eq(a, b, what) { ok(JSON.stringify(a) === JSON.stringify(b), `${what} : ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); }

/* ---------------------------------------------------------------- art. 103 */
const S = C.seats;
eq(S.sum, 250, 'art. 103 al. 2 : 250 délégués');
eq(S.rows.length, 54, 'art. 103 al. 3 et 4 : 54 circonscriptions (52 États, Brčko, Mostar)');
for (const r of S.rows) {
  const st = STATES.find(s => s.c === r.c);
  ok(STATS[r.c] && STATS[r.c].population > 0, `art. 103 al. 5 : population de ${r.c}`);
  if (st.t === 'M') ok(r.s >= 1 && r.s <= 20, `art. 103 al. 4 : ${r.c} élit au moins un délégué (${r.s})`);
  else ok(r.s >= 2 && r.s <= 20, `art. 103 al. 3 : ${r.c} entre deux et vingt sièges (${r.s})`);
  // Sainte-Laguë en diviseur commun : hors limites, sièges = population / diviseur, arrondi au plus proche
  if (!r.floor && !r.cap) eq(r.s, Math.round(r.pop / S.D), `art. 103 al. 3 : Sainte-Laguë pour ${r.c}`);
}
// le portail n'a plus d'autre calcul des sièges : kongresSeats délègue au moteur
{
  const tpl = fs.readFileSync(path.join(ROOT, 'portail', 'index.html'), 'utf8');
  const src = /function kongresSeats\(total=250\)\{[\s\S]*?\n\}/.exec(tpl);
  ok(!!src && /REGLES\.sieges\(/.test(src[0]), 'art. 103 : kongresSeats du portail passe par REGLES.sieges');
  if (src) {
    const k = vm.runInNewContext(`${src[0]};kongresSeats()`, { STATES, STATS, REGLES: R });
    const a = Object.fromEntries(k.rows.map(r => [r.c, r.s])), b = Object.fromEntries(S.rows.map(r => [r.c, r.s]));
    eq(Object.keys(a).sort().map(c => a[c]), Object.keys(b).sort().map(c => b[c]), 'art. 103 : sièges de la page Institutions');
  }
}

/* ---------------------------------------------------------------- art. 115 bis : registres */
const reg = {};
for (const s of STATES) if (s.t === 'T') reg[s.p] = (reg[s.p] || 0) + STATS[s.c].population;
eq(C.order, ['slo', 'hrv', 'srb', 'bos', 'cng', 'mkd', 'bul'], 'art. 110 al. 1 : ordre des délégations');
eq(C.order.map(p => C.reg[p]), C.order.map(p => reg[p]), 'art. 115 bis al. 7 : un registre par peuple (HYP reg)');
const tot = Object.values(reg).reduce((a, b) => a + b, 0);
eq(C.regTotal, tot, 'art. 115 bis : total des inscrits');
const part = ps => ps.reduce((a, p) => a + reg[p], 0) / tot;

/* ---------------------------------------------------------------- art. 110 : double clé */
const sets = {
  'cinq sans les Serbes ni les Bulgares': ['slo', 'hrv', 'bos', 'cng', 'mkd'],
  'cinq avec les Serbes et les Bulgares': ['hrv', 'srb', 'bos', 'mkd', 'bul'],
  'quatre': ['slo', 'hrv', 'srb', 'bul'],
  'six': ['slo', 'hrv', 'srb', 'bos', 'cng', 'mkd'],
  'sept': C.order,
};
for (const [k, ps] of Object.entries(sets)) {
  const d = R.cleDouble(C, ps), p = part(ps);
  eq(d.cinq, ps.length >= 5, `art. 110 al. 4, ${k} : au moins cinq des sept`);
  eq(d.cle, ps.length >= 5 && p > 0.5, `art. 110 al. 5, ${k} : majorité des inscrits (${(p * 100).toFixed(1)} %)`);
  eq(d.six, ps.length >= 6 && p > 0.5, `art. 110 al. 5 et 6, ${k} : six des sept, double clé comprise (HYP six)`);
  eq(d.sept, ps.length === 7, `art. 110 al. 6 et art. 150, ${k} : les sept`);
}
ok(!R.cleDouble(C, sets['cinq sans les Serbes ni les Bulgares']).cle, 'art. 110 al. 5 : cinq délégations minoritaires en inscrits ne suffisent pas');
ok(R.cleDouble(C, sets['cinq avec les Serbes et les Bulgares']).cle, 'art. 110 al. 5 : cinq délégations majoritaires en inscrits suffisent');
{
  // HYP six : six délégations représentent toujours la majorité des inscrits (la plus nombreuse exclue)
  const min = Math.min(...C.order.map(x => part(C.order.filter(p => p !== x))));
  ok(min > 0.5, `art. 110 al. 5 et 6 : six délégations font au moins ${(min * 100).toFixed(1)} % des inscrits`);
  ok(C.order.every(x => R.cleDouble(C, C.order.filter(p => p !== x)).six), 'art. 110 al. 6 : toute coalition de six délégations passe la double clé');
}

/* ---------------------------------------------------------------- art. 111 : Konfederalno Veće */
{
  const all = R.conseil(C, C.order, []);
  ok(all.consensus && all.adoptee && !all.suspendue, 'art. 111 al. 3 : consensus');
  const q = ['srb', 'bul', 'hrv', 'slo'];        // quatre, majorité des inscrits
  const a = R.conseil(C, q);
  ok(part(q) > 0.5 && a.quatre && a.adoptee, 'art. 111 al. 4 : quatre conseillers et majorité des inscrits');
  ok(a.suspendue, 'art. 111 al. 5 : adoptée contre trois conseillers, suspendue trente jours');
  const m = ['slo', 'bos', 'cng', 'mkd'];        // quatre, minorité des inscrits
  const b = R.conseil(C, m);
  ok(part(m) < 0.5 && !b.quatre && !b.cinq && !b.adoptee, 'art. 111 al. 4 : quatre conseillers minoritaires en inscrits, rejetée');
  const f = R.conseil(C, ['slo', 'bos', 'cng', 'mkd', 'hrv']);
  ok(f.cinq && f.adoptee && !f.suspendue, 'art. 111 al. 4 et 5 : cinq conseillers, deux contre, exécutoire');
  const t = R.conseil(C, ['slo', 'bos', 'cng'], ['srb']);
  ok(!t.adoptee, 'art. 111 al. 4 : trois conseillers ne suffisent pas');
}

/* ---------------------------------------------------------------- art. 109 b : sonnette d'alarme */
ok(R.alarme({ voix: 7, jour: 30 }).levee, 'art. 109 b : deux tiers des membres (7 sur 10) le trentième jour');
ok(!R.alarme({ voix: 6, jour: 1 }).levee, 'art. 109 b : 6 sur 10 ne font pas les deux tiers');
ok(!R.alarme({ voix: 10, jour: 31 }).levee, 'art. 109 b : hors des trente jours');
eq(R.alarme({ voix: 0, jour: 0 }).need, 7, 'art. 109 b : seuil de 7 sur 10 (HYP al)');

/* ---------------------------------------------------------------- art. 110 ter : conciliation */
ok(R.conciliation({ pour: 8, membre: 1 }).adopte, 'art. 110 ter al. 3 : 8 sur 14 avec le membre de la délégation');
ok(!R.conciliation({ pour: 8, membre: 0 }).adopte, 'art. 110 ter al. 3 : sans le membre de la délégation qui a levé l\'alarme');
ok(!R.conciliation({ pour: 7, membre: 1 }).adopte, 'art. 110 ter al. 3 : 7 sur 14 ne font pas la majorité');
ok(R.conciliation({ pour: 8, membre: 0, alarme: false }).adopte, 'art. 110 ter al. 3 : refus de consentement, le membre n\'est pas requis');
ok(!R.conciliation({ pour: 14, membre: 1, jours: 61 }).adopte, 'art. 110 ter al. 3 : dans les soixante jours');
eq(R.conciliation({ pour: 0 }).deuxTiers, 167, 'art. 110 ter al. 5 b : deux tiers du Kongres, 167 sur 250 (HYP al)');
ok(R.kongresDeuxTiers(167).ok && !R.kongresDeuxTiers(166).ok, 'art. 109 b et 110 ter al. 5 b : 167 sur 250');

/* ---------------------------------------------------------------- moteur de Sabor (evaluate) */
for (const t of R.TYPES) {
  const yes = R.evaluate(C, R.blank(C, t.id, 'f')), no = R.evaluate(C, R.blank(C, t.id, 'a'));
  eq(yes.verdict, 'pass', `${t.id} : tout pour, adoptée`);
  eq(no.verdict, 'fail', `${t.id} : tout contre, rejetée`);
}
{
  const v = R.blank(C, 'law', 'f'); v.del.cng = [3, 7];
  const E = R.evaluate(C, v);
  eq(E.verdict, 'hold', 'art. 109 b : alarme votée par 7 membres d\'une délégation, loi suspendue');
  const w = R.blank(C, 'consent', 'f'); for (const p of ['srb', 'bul']) R.setGroup(C, w, p, 'a');
  const F = R.evaluate(C, w), g = F.gauges.find(x => x.id === 'key');
  ok(F.verdict === 'fail' && g && !g.ok, 'art. 110 al. 5 : consentement sans la majorité des inscrits, refusé');
  const x = R.blank(C, 'council', 'a'); for (const p of ['srb', 'bul', 'hrv', 'slo']) x.cv[p] = 'f';
  eq(R.evaluate(C, x).verdict, 'hold', 'art. 111 al. 5 : evaluate, suspendue');
  const y = R.blank(C, 'stref', 'x'); STATES.filter(s => s.p === 'srb').slice(0, 7).forEach(s => { y.st[s.c] = 'f'; });
  ['BG-91', 'ZG-94', 'SA-92', 'SF-93', 'CG-06'].forEach(c => { y.st[c] = 'f'; });
  const Y = R.evaluate(C, y);
  eq([Y.t.coalStates, Y.verdict], [12, 'fail'], 'art. 122 : douze États dont sept d\'un même peuple, plus de la moitié');
  const r = R.evaluate(C, R.blank(C, 'revision', 'f')), rk = r.gauges.find(x => x.id === 'key');
  ok(rk && rk.ok && rk.hyp === 'six' && r.hyp.includes('six'), 'art. 110 al. 6 : révision, jauge de la double clé (HYP six)');
  ok(!R.evaluate(C, R.blank(C, 'entrenched', 'f')).gauges.some(x => x.id === 'key'), 'art. 150 : les sept délégations, pas de jauge de double clé');
  const rv = R.blank(C, 'revision', 'f'); for (const p of ['srb', 'bul']) R.setGroup(C, rv, p, 'a');
  eq([R.evaluate(C, rv).verdict, R.evaluate(C, rv).line.k], ['fail', 'consent-refused'], 'art. 110 al. 6 : révision avec cinq délégations, refusée');
  const v2 = R.decode(C, R.encode(C, v));
  eq(v2, v, 'état partageable : encode puis decode');
}

console.log(`${n} vérifications, ${bad} en échec`);
process.exit(bad ? 1 : 0);
