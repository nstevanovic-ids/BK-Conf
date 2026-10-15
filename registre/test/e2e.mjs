// Test de bout en bout du registre contre `wrangler dev --local` (DEV=1, sans clés : mails journalisés).
// Google Wallet est simulé sur le port 8788 (test/google-mock.mjs, clé de test/setup-dev.mjs).
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import { startGoogleMock } from './google-mock.mjs';
const API = process.env.API || 'http://127.0.0.1:8787';
const PUB = readFileSync(new URL('./keys/test-sa.pub.pem', import.meta.url), 'utf8');
const google = await startGoogleMock(PUB);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jwtPayload = url => { const j = url.split('/save/')[1]; const [h, b, sg] = j.split('.');
  return { ok: crypto.verify('RSA-SHA256', Buffer.from(h + '.' + b), PUB, Buffer.from(sg, 'base64url')), p: JSON.parse(Buffer.from(b, 'base64url')) }; };
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
async function call(method, path, body, headers = {}) {
  const r = await fetch(API + path, { method, headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) {}
  return { s: r.status, j, h: r.headers };
}
const base = {
  surname: 'Stevanović', given: 'Nikola', sex: 'M', dob: '1990-03-12', basis: 'ancestry',
  origin: { n: 'Kragujevac', iso: 'SRB' }, res: 'abroad', people: 'srb', showNat: true, std: 'central',
  consent: { accession: true, data: true, register: true }, turnstile: 'dev',
};
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

let r = await call('GET', '/v1/health'); ok(r.s === 200 && r.j.wallet && r.j.wallet.google === true, 'health (Google Wallet configured)');
r = await call('POST', '/v1/registrations', { ...base, email: 'a@example.org', dob: '2010-01-01' });
ok(r.s === 422 && r.j.field === 'dob', 'minor refused (422 dob)');
r = await call('POST', '/v1/registrations', { ...base, email: 'a@example.org', origin: { n: 'Kragujevac', iso: 'BGR' } });
ok(r.s === 422 && r.j.field === 'origin', 'forged municipality refused');
r = await call('POST', '/v1/registrations', { ...base, email: 'a@example.org', people: 'srb', consent: { accession: true, data: true } });
ok(r.s === 422 && r.j.field === 'consent_register', 'register needs explicit consent');
r = await call('POST', '/v1/registrations', { ...base, email: 'a@example.org', basis: 'residence', res: 'abroad' });
ok(r.s === 422 && r.j.field === 'res', 'residence basis requires living inside');
r = await fetch(API + '/v1/registrations', { method: 'POST', body: '{}', headers: { 'Content-Type': 'text/plain' } });
ok(r.status === 415, 'wrong content type (415)');

r = await call('POST', '/v1/registrations', { ...base, email: 'Nikola@Example.org' });
ok(r.s === 202 && r.j.status === 'pending' && r.j.devToken && r.j.emailHint === 'n•••@example.org', 'registration accepted (202, pending)');
const t1 = r.j.devToken;
r = await call('POST', '/v1/registrations', { ...base, email: 'nikola@example.org', given: 'Nikola Petar' });
ok(r.s === 202 && r.j.devToken && r.j.devToken !== t1, 'pending re-registration issues a new link');
const t2 = r.j.devToken;
r = await call('POST', '/v1/confirm', { token: t1 }); ok(r.s === 404, 'superseded link invalid');
r = await call('POST', '/v1/confirm', { token: t2 });
ok(r.s === 200 && r.j.card.num === 'BK-SU-000001' && r.j.card.given === 'Nikola Petar' && r.j.accessToken, 'confirmation issues BK-SU-000001');
const acc = r.j.accessToken;
ok(r.j.card.expiry.slice(0, 4) - r.j.card.issued.slice(0, 4) === 10, 'validity 10 years');
r = await call('POST', '/v1/confirm', { token: t2 }); ok(r.s === 409, 'second confirmation refused (409)');

r = await call('GET', '/v1/verify/BK-SU-000001?issue=1');
ok(r.s === 200 && r.j.status === 'valid' && r.j.state === 'SU-36' && !('surname' in r.j) && !('dob' in r.j), 'verify: valid, no personal data');
r = await call('GET', '/v1/verify/BK-SU-999999'); ok(r.j.status === 'unknown', 'verify: number never issued is unknown');
r = await call('GET', '/v1/verify/XX-123'); ok(r.s === 400, 'verify: malformed number refused');

const auth = { Authorization: 'Bearer ' + acc };
r = await call('GET', '/v1/card', undefined, auth); ok(r.s === 200 && r.j.card.people === 'srb' && r.j.card.origin.c === 'SU-36', 'card readable with access link');

r = await call('POST', '/v1/card/wallet/google', {}, auth);
ok(r.s === 200 && r.j.url.startsWith('https://pay.google.com/gp/v/save/'), 'Google Wallet: save link issued');
const jw = jwtPayload(r.j.url), oid = jw.p.payload.genericObjects[0].id;
ok(jw.ok && jw.p.aud === 'google' && jw.p.typ === 'savetowallet' && oid.startsWith('3388000000012345678.') && Object.keys(jw.p.payload.genericObjects[0]).length === 1,
  'Google Wallet: JWT signed by the service account, object referenced by id only');
const ob = google.state.objects[oid];
ok(ob && google.state.classes['3388000000012345678.bk_citizen_card'] && ob.header.defaultValue.value === 'STEVANOVIĆ Nikola Petar'
   && ob.barcode.value.endsWith('#/verify/BK-SU-000001.1'), 'Google Wallet: class and pass created with the verification QR');
ok(!JSON.stringify(ob).includes('1990-03-12') && !/Srbin|srb/.test(JSON.stringify(ob)), 'Google Wallet: no date of birth or nation on the pass');
r = await call('GET', '/v1/card', undefined, { Authorization: 'Bearer ' + 'x'.repeat(43) }); ok(r.s === 401, 'wrong access link refused');

r = await call('POST', '/v1/registrations', { ...base, email: 'nikola@example.org' });
ok(r.s === 202 && r.j.status === 'pending' && r.j.devAccess && !r.j.devToken, 'existing citizen: same answer, access link mailed');

r = await call('PATCH', '/v1/card', { ...base, people: 'none', std: 'western' }, auth);
ok(r.s === 200 && r.j.card.num === 'BK-SU-000001' && r.j.card.card === 2 && r.j.card.people === 'none' && !r.j.card.showNat, 'amend register: same number, issue 2');
r = await call('GET', '/v1/verify/BK-SU-000001?issue=1'); ok(r.j.status === 'superseded' && r.j.issue === 2, 'verify: older card issue is superseded');
r = await call('PATCH', '/v1/card', { ...base, basis: 'own', origin: { n: 'Dubrovnik', iso: 'HRV' }, res: 'in' }, auth);
ok(r.s === 200 && r.j.card.num === 'BK-DR-000001' && r.j.card.card === 1, 'change of state: new number BK-DR-000001');
r = await call('GET', '/v1/verify/BK-SU-000001'); ok(r.j.status === 'revoked', 'verify: retired number is revoked');
await sleep(700);
ok(google.state.objects[oid].textModulesData.find(t => t.id === 'num').body === 'BK-DR-000001', 'Google Wallet: pass updated after amendment');

r = await call('POST', '/v1/card/mail', { front: PNG, back: PNG }, auth); ok(r.s === 202, 'card mailed with attachments');
r = await call('POST', '/v1/card/mail', { front: 'PHN2Zz4=' }, auth); ok(r.s === 422, 'non-image attachment refused');

r = await call('POST', '/v1/registrations', { ...base, email: 'ana@example.org', given: 'Ana', sex: 'F', basis: 'own', origin: { n: 'Dubrovnik', iso: 'HRV' }, res: 'in', people: 'hrv' });
const t3 = r.j.devToken;
r = await call('POST', '/v1/confirm', { token: t3 }); ok(r.s === 200 && r.j.card.num === 'BK-DR-000002', 'sequence per state: BK-DR-000002');
const acc2 = r.j.accessToken;

r = await call('GET', '/v1/stats');
ok(r.s === 200 && r.j.total === 2 && r.j.states['DR-10'] === 2 && r.j.peoples.hrv === 1 && r.j.peoples.srb === 1 && r.j.peoples.none === 0 && r.j.statesRepresented === 1, 'stats: 2 citizens, DR-10, hrv 1, srb 1');
ok(Array.isArray(r.j.daily) && r.j.daily.length >= 1 && r.j.last30 === 2, 'stats: daily series and last 30 days');

r = await call('POST', '/v1/access', { email: 'ana@example.org', turnstile: 'dev' }); ok(r.s === 202 && r.j.devAccess, 'access link for a citizen');
r = await call('POST', '/v1/access', { email: 'nobody@example.org', turnstile: 'dev' }); ok(r.s === 202 && r.j.status === 'sent' && !r.j.devAccess, 'unknown address: same answer, nothing sent');

r = await call('POST', '/v1/card/wallet/google', {}, { Authorization: 'Bearer ' + acc2 });
const oid2 = jwtPayload(r.j.url).p.payload.genericObjects[0].id;
r = await call('DELETE', '/v1/card', undefined, { Authorization: 'Bearer ' + acc2 }); ok(r.s === 204, 'deletion (204)');
await sleep(700);
const ob2 = google.state.objects[oid2];
ok(ob2.state === 'INACTIVE' && ob2.header.defaultValue.value === 'Card cancelled' && !JSON.stringify(ob2).includes('Ana'), 'Google Wallet: pass cancelled and emptied on deletion');
r = await call('GET', '/v1/verify/BK-DR-000002'); ok(r.j.status === 'revoked', 'verify: deleted citizen\'s number is revoked');
r = await call('GET', '/v1/card', undefined, { Authorization: 'Bearer ' + acc2 }); ok(r.s === 401, 'deleted citizen: access link dead');
r = await call('GET', '/v1/stats'); ok(r.j.total === 1 && r.j.peoples.hrv === 0, 'stats follow deletion');

r = await call('GET', '/v1/health', undefined, { Origin: 'https://evil.example' }); ok(r.s === 403, 'foreign origin refused');
r = await call('GET', '/v1/health', undefined, { Origin: 'http://localhost:8000' }); ok(r.h.get('access-control-allow-origin') === 'http://localhost:8000', 'allowed origin gets CORS header');

for (let i = 0; i < 3; i++) r = await call('POST', '/v1/registrations', { ...base, email: 'spam@example.org' });
r = await call('POST', '/v1/registrations', { ...base, email: 'spam@example.org' }); ok(r.s === 429, 'per-address quota (429 on 4th mail in an hour)');

google.close();
console.log(fails ? `${fails} FAILURE(S)` : 'ALL PASS');
process.exit(fails ? 1 : 0);
