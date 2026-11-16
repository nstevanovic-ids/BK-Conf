const N = s => s;

export const TYPES = [
{ id: 'law', name: { t: N('Ordinary law') }, arts: ['106', '109'], grp: N('Law'), k: 1, d: 1, desc: { q: '106' }, steps: [['k'], ['alarm', 'k23']] },
{ id: 'consent', name: { q: 'consent' }, arts: ['109', '110'], grp: N('Law'), k: 1, d: 1, desc: { q: '110' }, steps: [['k'], ['ns', 'del'], ['key']] },
{ id: 'urgent', name: { q: 'n-art-123bis' }, arts: ['123 bis'], grp: N('Law'), k: 1, d: 1, desc: { q: '123bis' }, steps: [['k'], ['ns', 'del'], ['key']] },
{ id: 'revision', name: { t: N('Constitutional amendment') }, arts: ['147', '110', '123'], grp: N('Constitution'), k: 1, d: 1, s: 1,
desc: { t: N('Consent of the Narodni Sabor: two-thirds in plenary and a majority within at least six of the seven delegations, or within all seven if it touches an entrenched guarantee.') }, steps: [['k'], ['ns', 'del'], ['p'], ['s']] },
{ id: 'entrenched', name: { q: 'n-art-150' }, arts: ['150'], grp: N('Constitution'), k: 1, d: 1, s: 1, desc: { q: '150' }, steps: [['k'], ['ns', 'del'], ['p'], ['s']] },
{ id: 'initiative', name: { t: N('Popular initiative') }, arts: ['121', '124'], grp: N('Constitution'), s: 1, desc: { q: '121' }, steps: [['p'], ['s']] },
{ id: 'stinit', name: { t: N('Initiative'), n: 8 }, arts: ['106 bis'], grp: N('States'), s: 1, co: 8, desc: { q: '106bis' }, steps: [['co'], ['half']] },
{ id: 'stref', name: { t: N('Optional referendum'), n: 12 }, arts: ['122'], grp: N('States'), s: 1, co: 12, desc: { q: '122' }, steps: [['co'], ['half']] },
{ id: 'council', name: { t: N('Konfederalno Veće') }, arts: ['111'], grp: N('Government'), c: 1, desc: { q: '111' }, steps: [['cons'], ['c4', 'c5']] },
];
export const typeById = id => TYPES.find(t => t.id === id) || TYPES[1];
export const ART_RULE = {
'art-103': 'law', 'art-106': 'law', 'art-106bis': 'stinit', 'art-109': 'law', 'art-110': 'consent',
'art-110ter': 'law', 'art-111': 'council', 'art-115bis': 'consent', 'art-121': 'initiative',
'art-122': 'stref', 'art-123': 'initiative', 'art-123bis': 'urgent', 'art-124': 'initiative',
'art-147': 'revision', 'art-149': 'revision', 'art-150': 'entrenched',
'art-131': 'equalisation', 'art-132': 'equalisation', 'art-133': 'equalisation',
};

const half = n => Math.floor(n / 2) + 1;
const twoThirds = n => Math.ceil(n * 2 / 3);

export function tally(C, v) {
const K = { f: 0, a: 0, x: 0 }, P = { f: 0, a: 0, x: 0 }, St = { f: 0, a: 0, x: 0 };
const cityPop = {};
for (const s of C.states) {
const o = v.st[s.c] || 'x';
K[o] += s.s; P[o] += s.pop;
const host = s.t === 'M' ? s.with : s.t === 'F' ? s.c : null;
if (host) { (cityPop[host] || (cityPop[host] = { f: 0, a: 0, x: 0 }))[o] += s.pop; }
if (s.t === 'T') St[o]++;
}
const stateVote = {};
for (const s of C.states) {
if (s.t === 'T') stateVote[s.c] = v.st[s.c] || 'x';
else if (s.t === 'F') {
const t = cityPop[s.c], o = t.f > t.a ? 'f' : t.a > t.f ? 'a' : 'x';
stateVote[s.c] = o; St[o]++;
}
}
let coalStates = 0; const coalBy = {};
for (const s of C.states) if (s.t !== 'M' && (v.st[s.c] || 'x') === 'f') { coalStates++; if (s.p) coalBy[s.p] = (coalBy[s.p] || 0) + 1; }
const D = { f: 0, a: 0, x: 0 }, yes = [], alarm = [];
for (const p of C.order) {
const [f, a] = v.del[p] || [0, 0];
D.f += f; D.a += a; D.x += 10 - f - a;
if (f > a) yes.push(p);
if (a >= twoThirds(10)) alarm.push(p);          // art. 109 b : deux tiers des membres d'une délégation
}
const regYes = yes.reduce((t, p) => t + C.reg[p], 0);
const cv = { f: [], a: [], x: [] };
for (const p of C.order) cv[v.cv[p] || 'x'].push(p);
return { K, P, St, stateVote, D, yes, alarm, regYes, cv, coalStates, coalBy };
}

const bar = (id, org, req, arts, t, total, need, ok, extra = {}) =>
({ id, org, req, arts, kind: 'bar', f: t.f, a: t.a, x: t.x, total, need, ok, ...extra });
const SIMPLE = '{f} > {a}';

export function evaluate(C, v) {
const type = typeById(v.type), t = tally(C, v), G = [];
const simple = o => o.f > o.a;
let verdict = 'fail', line = null, hyp = [];
const kSimple = () => bar('k', N('Kongres'), SIMPLE, ['106'], t.K, 250, half(t.K.f + t.K.a), simple(t.K), { unit: 'seats', hyp: 'present' });
const nsDeleg = (need, arts) => ({ id: 'del', org: N('7 delegations'), req: `≥ ${need} / 7`, arts, kind: 'count',
value: t.yes.length, total: 7, need, ok: t.yes.length >= need, list: C.order.map(p => ({ p, on: t.yes.includes(p) })) });
const key = () => ({ id: 'key', org: N('Registered citizens'), req: '> 50 %', arts: ['110', '115 bis'], kind: 'share',
value: t.regYes / C.regTotal, need: 0.5, ok: t.regYes * 2 > C.regTotal, hyp: 'reg' });
const people = () => bar('p', N('Citizens'), SIMPLE, ['123'], t.P, C.popTotal, null, simple(t.P), { unit: 'inhabitants', hyp: 'pop' });
const states = () => bar('s', N('States'), '≥ 27 / 52', ['124'], t.St, 52, 27, t.St.f >= 27, { unit: 'states', hyp: 'mun' });
const all = () => G.every(g => g.ok);

if (type.id === 'law') {
const k = kSimple(); G.push(k);
const two = twoThirds(250);
G.push({ id: 'alarm', org: N('Alarm motion'), req: `≥ ${twoThirds(10)} / 10`, arts: ['109'], kind: 'alarm',
list: C.order.map(p => ({ p, n: (v.del[p] || [0, 0])[1], on: t.alarm.includes(p) })), need: twoThirds(10),
ok: !t.alarm.length, soft: true, hyp: 'alarm' });
G.push(bar('k23', N('Kongres'), '≥ ⅔', ['110 ter'], t.K, 250, two, t.K.f >= two, { unit: 'seats', soft: true, when: t.alarm.length > 0, q: 'n-art-110ter' }));
if (!k.ok) verdict = 'fail';
else if (!t.alarm.length) { verdict = 'pass'; line = { t: N('No consent is needed and no alarm is raised.') }; }
else { verdict = 'hold'; line = { q: '109b' }; }      // suspendue dès que l'alarme est votée, quels que soient les deux tiers
hyp = ['bloc', 'present', 'alarm'];
} else if (type.id === 'consent' || type.id === 'urgent') {
const urg = type.id === 'urgent';
G.push(urg ? bar('k', N('Kongres'), '> ½ · 250', ['123 bis'], t.K, 250, half(250), t.K.f >= half(250), { unit: 'seats' }) : kSimple());
G.push(urg ? bar('ns', N('Narodni Sabor'), '> ½ · 70', ['123 bis'], t.D, 70, half(70), t.D.f >= half(70), { unit: 'members' })
: bar('ns', N('Narodni Sabor'), SIMPLE, ['110'], t.D, 70, half(t.D.f + t.D.a), simple(t.D), { unit: 'members' }));
G.push(nsDeleg(5, [urg ? '123 bis' : '110']));
G.push(key());
verdict = all() ? 'pass' : 'fail';
line = verdict === 'pass' ? { t: urg ? N('The law enters into force.') : N('In force, with the consent of the peoples.') }
: (G[0].ok ? { t: N('Consent refused') } : null);
hyp = ['bloc', 'present', 'reg'];
} else if (type.id === 'revision' || type.id === 'entrenched') {
const need = type.id === 'entrenched' ? 7 : 6;
G.push(kSimple());
G.push(bar('ns', N('Narodni Sabor'), '≥ ⅔ · 70', ['110'], t.D, 70, twoThirds(70), t.D.f >= twoThirds(70), { unit: 'members', hyp: 'present' }));
G.push(nsDeleg(need, [need === 7 ? '150' : '110']));
G.push(people()); G.push(states());
verdict = all() ? 'pass' : 'fail';
line = verdict === 'pass' ? { t: N('The amendment enters the Constitution.') }
: !G[0].ok ? null : !(G[1].ok && G[2].ok) ? { t: N('Consent refused') } : !G[3].ok ? { t: N('Rejected by the people.') } : null;
hyp = ['bloc', 'present', 'pop', 'mun'];
} else if (type.id === 'initiative') {
G.push(people()); G.push(states());
verdict = all() ? 'pass' : 'fail';
line = verdict === 'pass' ? { t: N('The amendment enters the Constitution.') } : (G[0].ok ? null : { t: N('Rejected by the people.') });
hyp = ['pop', 'mun'];
} else if (type.co) {
const n = t.coalStates, top = Math.max(0, ...Object.values(t.coalBy));
const topP = C.order.find(p => (t.coalBy[p] || 0) === top && top > 0) || null;
G.push({ id: 'co', org: N('States'), req: `≥ ${type.co}`, arts: type.arts, kind: 'count', value: n, total: 52, need: type.co, ok: n >= type.co });
G.push({ id: 'half', org: N('Constituent people'), req: '≤ ½', arts: type.arts, kind: 'share', value: n ? top / n : 0, need: 0.5, max: true,
ok: n > 0 && top * 2 <= n, top, topP, n, hyp: 'coal' });
verdict = all() ? 'pass' : 'fail';
line = verdict === 'pass' ? { q: type.id === 'stref' ? '122e' : '106bis2' } : null;
hyp = ['coal'];
} else if (type.id === 'council') {
const nf = t.cv.f.length, na = t.cv.a.length;
const reg = t.cv.f.reduce((s, p) => s + C.reg[p], 0), share = reg / C.regTotal;
const consensus = na === 0 && nf > 0;
const four = nf >= 4 && reg * 2 > C.regTotal, five = nf >= 5;
G.push({ id: 'cons', org: N('Konfederalno Veće'), req: '0 {a}', arts: ['111'], kind: 'count', value: nf, total: 7, need: 7, ok: consensus, soft: true, hyp: 'cons',
list: C.order.map(p => ({ p, on: (v.cv[p] || 'x') === 'f', off: (v.cv[p] || 'x') === 'a' })) });
G.push({ id: 'c4', org: N('Registered citizens'), req: '≥ 4 / 7 · > 50 %', arts: ['111', '110'], kind: 'share', value: share, need: 0.5, ok: four, soft: true, hyp: 'reg' });
G.push({ id: 'c5', org: N('Konfederalno Veće'), req: '≥ 5 / 7', arts: ['111'], kind: 'count', value: nf, total: 7, need: 5, ok: five, soft: true });
const ok = consensus || four || five;
if (!ok) { verdict = 'fail'; line = { t: N('Without consensus, a decision needs four councillors whose peoples hold a majority of enrolled citizens, or five councillors.') }; }
else if (!consensus && na >= 3) { verdict = 'hold'; line = { t: N('A decision taken against three councillors or more is suspended for thirty days while the delegations of their peoples are heard, then reconsidered.') }; }
else { verdict = 'pass'; line = { q: consensus ? '111c' : '111' }; }
hyp = ['reg', 'cons'];
}
return { type, t, gauges: G, verdict, line, hyp };
}

export const HYP = {
bloc: N('The delegates of a State vote together, as their State is placed.'),
present: N('Every member is present; an abstention is not a vote cast.'),
reg: N('Registers: population of the territorial States attached to each people, as no register count exists yet.'),
pop: N('The voters of a State all vote as their State is placed; the weight is the resident population.'),
mun: N('Brčko and Mostar vote with Sarajevo, the nearest confederal territory (Art. 124).'),
alarm: N('A member placed against votes the alarm motion.'),
coal: N('The coalition is the set of States placed in favour; a confederal territory belongs to no people.'),
cons: N('Consensus: no councillor against.'),
};

const B27 = '0123456789abcdefghijklmnopq', TR = ['f', 'a', 'x'];
const pack = arr => { let s = ''; for (let i = 0; i < arr.length; i += 3) s += B27[(TR.indexOf(arr[i]) * 9 + TR.indexOf(arr[i + 1] || 'f') * 3 + TR.indexOf(arr[i + 2] || 'f'))]; return s; };
const unpack = (s, n) => { const o = []; for (const ch of s) { const k = B27.indexOf(ch); if (k < 0) return null; o.push(TR[Math.floor(k / 9)], TR[Math.floor(k / 3) % 3], TR[k % 3]); } return o.length >= n ? o.slice(0, n) : null; };
const B11 = '0123456789a';
export function encode(C, v) {
const st = pack(C.states.map(s => v.st[s.c] || 'x'));
const del = C.order.map(p => { const [f, a] = v.del[p] || [0, 0]; return B11[f] + B11[a]; }).join('');
const cv = pack(C.order.map(p => v.cv[p] || 'x'));
return `vote-${v.type}-${st}-${del}-${cv}`;
}
export function decode(C, hash) {
const m = /^vote-([a-z]+)(?:-([0-9a-q]{18})-([0-9a]{14})-([0-9a-q]{3}))?$/.exec(hash);
if (!m || !TYPES.some(t => t.id === m[1])) return null;
if (!m[2]) return null;
const st = unpack(m[2], 54), cv = unpack(m[4], 7);
if (!st || !cv) return null;
const v = { type: m[1], st: {}, del: {}, cv: {} };
C.states.forEach((s, i) => v.st[s.c] = st[i]);
C.order.forEach((p, i) => {
const f = B11.indexOf(m[3][2 * i]), a = B11.indexOf(m[3][2 * i + 1]);
v.del[p] = f + a <= 10 ? [f, a] : [0, 0]; v.cv[p] = cv[i];
});
return v;
}

export function blank(C, type, o = 'x') {
const v = { type, st: {}, del: {}, cv: {} };
C.states.forEach(s => v.st[s.c] = o);
C.order.forEach(p => { v.del[p] = o === 'f' ? [10, 0] : o === 'a' ? [0, 10] : [0, 0]; v.cv[p] = o; });
return v;
}
export function setGroup(C, v, g, o) {
C.states.forEach(s => { if ((s.p || (s.t === 'F' ? 'fed' : 'mun')) === g) v.st[s.c] = o; });
if (C.reg[g] != null) { v.del[g] = o === 'f' ? [10, 0] : o === 'a' ? [0, 10] : [0, 0]; v.cv[g] = o; }
return v;
}
const groups = (C, type, map, rest = 'a') => {
const v = blank(C, type, rest);
for (const [g, o] of Object.entries(map)) setGroup(C, v, g, o);
return v;
};
export const SCENARIOS = [
{ id: 'example', type: 'consent', tag: E => `${E.t.K.f} – ${E.t.K.a}`,
make: C => { const v = groups(C, 'consent', { slo: 'f', hrv: 'f', srb: 'f', bos: 'f', cng: 'f', fed: 'f' });
v.del.srb = [6, 4]; v.del.hrv = [7, 3]; v.del.mkd = [3, 7]; v.del.bul = [2, 8];
for (const c of ['KM-16', 'TK-39', 'TL-40', 'LK-20']) v.st[c] = 'a';
for (const c of ['PA-23', 'VS-45', 'SF-93']) v.st[c] = 'x';
for (const c of ['RO-29', 'PR-27']) v.st[c] = 'f';
return v; } },
{ id: 'two', type: 'revision', tag: E => `${E.t.yes.length} / 7`,
make: C => { const v = groups(C, 'revision', { srb: 'f', bul: 'f' }); v.st['BG-91'] = 'f'; v.st['SF-93'] = 'f'; return v; } },
{ id: 'five', type: 'consent', tag: (E, pct) => `${E.t.yes.length} / 7 · ${pct(E.t.regYes)}`,
make: C => groups(C, 'consent', { slo: 'f', hrv: 'f', bos: 'f', cng: 'f', mkd: 'f', fed: 'f', mun: 'f' }) },
{ id: 'one', type: 'law', tag: E => `${E.t.alarm.length} × ${E.gauges[1].list.find(x => x.on).n} / 10`,
make: C => { const v = groups(C, 'law', { cng: 'a', bos: 'a', mkd: 'a', mun: 'x' }, 'f'); v.del.bos = [5, 5]; v.del.mkd = [6, 4]; v.del.cng = [2, 8];
for (const c of ['KR-17', 'ST-35', 'IS-14', 'KV-18', 'DJ-09', 'SX-37', 'ZG-94', 'SI-31', 'TU-42', 'DA-08']) v.st[c] = 'a'; return v; } },
{ id: 'six', type: 'entrenched', tag: E => `${E.t.yes.length} / 7`,
make: C => { const v = groups(C, 'entrenched', { bos: 'a' }, 'f'); v.del.bos = [4, 6]; return v; } },
{ id: 'nine', type: 'stref', tag: E => `${E.gauges[1].top} / ${E.t.coalStates}`,
make: C => { const v = blank(C, 'stref', 'x');
for (const c of ['BC-02', 'BN-04', 'BZ-05', 'HI-12', 'KM-16', 'PI-24', 'PO-26', 'SU-36', 'TL-40', 'CG-06', 'BG-91', 'VS-45']) v.st[c] = 'f'; return v; } },
{ id: 'four', type: 'council', tag: E => `${E.t.cv.f.length} – ${E.t.cv.a.length}`,
make: C => groups(C, 'council', { srb: 'f', hrv: 'f', slo: 'f', cng: 'f' }) },
];

export function equalise(C, floor = 0.85, cap = 0.30) {
const st = C.states.filter(s => s.t !== 'M');
const pop = st.reduce((a, s) => a + s.pop, 0), gdp = st.reduce((a, s) => a + s.pop * s.gdp, 0);
const mean = gdp / pop;
let need = 0, room = 0;
for (const s of st) {
if (s.gdp < floor * mean) need += (floor * mean - s.gdp) * s.pop;
if (s.gdp > mean) room += cap * (s.gdp - mean) * s.pop;
}
const rate = room > 0 ? Math.min(cap, cap * need / room) : 0;   // fraction de l'excédent versée
const paid = cap > 0 ? room * rate / cap : 0;
const rows = st.map(s => {
let d = 0;
if (s.gdp < floor * mean) d = floor * mean - s.gdp;
else if (s.gdp > mean) d = -rate * (s.gdp - mean);
return { c: s.c, s, idx: s.gdp / mean, after: (s.gdp + d) / mean, d };
}).sort((a, b) => a.idx - b.idx || a.c.localeCompare(b.c));
return { mean, pop, gdp, need, room, paid, gap: Math.max(0, need - paid), rate, rows, cover: need > 0 ? Math.min(1, paid / need) : 1,
by: Object.fromEntries(rows.map(r => [r.c, r])),
nRecv: rows.filter(r => r.d > 0).length, nPay: rows.filter(r => r.d < 0).length };
}
