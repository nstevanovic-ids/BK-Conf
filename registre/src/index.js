// Registre confédéral des citoyens — API du parcours #/register.
// Canon : docs/canon/citoyennete.md · ADR : docs/decisions/2026-10-15-registre-confederal.md
//
// Principes de sécurité :
// - double opt-in : aucune carte sans confirmation de l'adresse e-mail ;
// - l'État est dérivé de la commune côté serveur (opstine.json), jamais saisi ;
// - jetons aléatoires de 256 bits, seule leur empreinte SHA-256 poivrée est stockée ;
// - jetons transmis dans le fragment d'URL (#/…), jamais vus par l'hébergeur du portail ;
// - réponses identiques que l'adresse soit inscrite ou non (pas d'énumération) ;
// - Turnstile + quotas par IP et par adresse ; échec fermé si un secret manque en production.

import OPSTINE from '../../portail/data/opstine.json';
import ETATS from '../../portail/data/etats.json';
import PEUPLES from '../../portail/data/peuples.json';
import { mailConfirm, mailCard, mailAccess } from './mail.js';
import { walletConfigured, googleSaveUrl, googleRefresh, googleRevoke } from './wallet.js';

const OP = new Map(OPSTINE.m.map(r => [r[0] + '|' + r[1], r[2]]));
const STATE = new Map(ETATS.map(s => [s.c, s]));
const PEOPLE = Object.keys(PEUPLES);
const DAY = 86400000;
const CONFIRM_TTL = 2 * DAY;
const ACCESS_TTL = 400 * DAY;
const PENDING_TTL = 7 * DAY;

class HttpError extends Error {
  constructor(status, code, message, field) { super(message); this.status = status; this.code = code; this.field = field; }
}
const bad = (field, message) => { throw new HttpError(422, 'invalid', message, field); };

/* ---------- utilitaires ---------- */
const nowIso = () => new Date().toISOString();
const todayIso = () => nowIso().slice(0, 10);
const later = ms => new Date(Date.now() + ms).toISOString();
function addYears(d, n) { const y = +d.slice(0, 4) + n, md = d.slice(5); return y + '-' + (md === '02-29' ? '02-28' : md); }
function ageOn(dob, today) { let a = +today.slice(0, 4) - +dob.slice(0, 4); if (today.slice(5) < dob.slice(5)) a--; return a; }
const isDev = env => env.DEV === '1';
const devLeak = env => isDev(env) && !env.BREVO_API_KEY;
const portal = env => (env.PORTAL_URL || '').replace(/\/?$/, '/');
const verifyUrl = (env, c) => portal(env) + '#/verify/' + c.num + '.' + c.card;
function hint(email) { const [u, d] = email.split('@'); return u.slice(0, 1) + '•••@' + d; }

function json(data, status = 200, headers = {}) {
  return new Response(data === null ? null : JSON.stringify(data), {
    status,
    headers: {
      ...(data === null ? {} : { 'Content-Type': 'application/json; charset=utf-8' }),
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
      ...headers,
    },
  });
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (isDev(env)) allowed.push('http://localhost:8000', 'http://127.0.0.1:8000', 'null');
  const h = { Vary: 'Origin' };
  if (origin && allowed.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
  return { h, ok: !origin || allowed.includes(origin) };
}

async function readJson(req, max) {
  if (!(req.headers.get('Content-Type') || '').includes('application/json'))
    throw new HttpError(415, 'content_type', 'Expected application/json');
  const len = +(req.headers.get('Content-Length') || 0);
  if (len > max) throw new HttpError(413, 'too_large', 'Request too large');
  const t = await req.text();
  if (t.length > max) throw new HttpError(413, 'too_large', 'Request too large');
  try { const v = JSON.parse(t); if (v && typeof v === 'object') return v; } catch (e) { /* fallthrough */ }
  throw new HttpError(400, 'bad_json', 'Invalid JSON');
}

/* ---------- jetons et empreintes ---------- */
const enc = new TextEncoder();
async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function randomToken() {
  const b = new Uint8Array(32); crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function pepper(env) {
  if (env.TOKEN_PEPPER && env.TOKEN_PEPPER.length >= 16) return env.TOKEN_PEPPER;
  if (isDev(env)) return 'dev-pepper-not-for-production';
  throw new HttpError(503, 'not_configured', 'The registry is not configured yet');
}
const tokenHash = (env, t) => sha256hex(pepper(env) + ':tok:' + t);
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

async function newToken(env, citizenId, kind, ttl) {
  const t = randomToken();
  await env.DB.prepare('INSERT INTO tokens(hash,citizen_id,kind,created_at,expires_at) VALUES(?1,?2,?3,?4,?5)')
    .bind(await tokenHash(env, t), citizenId, kind, nowIso(), later(ttl)).run();
  return t;
}

/* ---------- anti-abus ---------- */
async function limit(env, key, max, windowMs) {
  const w = String(Math.floor(Date.now() / windowMs));
  const k = await sha256hex(pepper(env) + ':rl:' + key);
  const row = await env.DB.prepare(
    `INSERT INTO ratelimit(key,window,count) VALUES(?1,?2,1)
     ON CONFLICT(key) DO UPDATE SET count = CASE WHEN window = ?2 THEN count + 1 ELSE 1 END, window = ?2
     RETURNING count`).bind(k, w).first();
  if (row.count > max) throw new HttpError(429, 'rate_limited', 'Too many attempts. Please try again later.');
}

async function turnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) {
    if (isDev(env)) return;
    throw new HttpError(503, 'not_configured', 'The registry is not configured yet');
  }
  if (!token || typeof token !== 'string' || token.length > 4096)
    throw new HttpError(400, 'captcha', 'Please complete the verification');
  const f = new FormData();
  f.append('secret', env.TURNSTILE_SECRET); f.append('response', token);
  if (ip) f.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: f });
  const d = await r.json().catch(() => ({}));
  if (!d.success) throw new HttpError(400, 'captcha', 'The verification failed. Please try again.');
}

/* ---------- envoi des e-mails (Brevo, API transactionnelle) ---------- */
async function send(env, m) {
  if (!env.BREVO_API_KEY) {
    if (isDev(env)) { console.log(`[dev mail] to=${m.to} subject="${m.subject}" link=${m.link || ''} attachments=${m.attachments.length}`); return; }
    throw new HttpError(503, 'not_configured', 'The registry is not configured yet');
  }
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: env.MAIL_FROM, name: env.MAIL_FROM_NAME || 'Konfederalni registar državljana' },
      to: [{ email: m.to, name: m.name }],
      subject: m.subject, htmlContent: m.html, textContent: m.text,
      ...(m.attachments.length ? { attachment: m.attachments } : {}),
      tags: ['registre'],
    }),
  });
  if (!r.ok) {
    console.error('brevo', r.status, (await r.text()).slice(0, 300));
    throw new HttpError(502, 'mail_failed', 'The e-mail could not be sent. Please try again later.');
  }
}

/* ---------- validation (miroir de regErrors côté portail) ---------- */
const NAME_RE = /^[\p{L}\p{M}](?:[\p{L}\p{M}'’ .-]*[\p{L}\p{M}.])?$/u;
const EMAIL_RE = /^[^\s@<>()",;:]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/;
function vName(v, f) {
  const s = String(v ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!s || s.length > 60 || !NAME_RE.test(s)) bad(f, f === 'surname' ? 'Enter a valid surname.' : 'Enter valid given names.');
  return s;
}
function validate(b, { email }) {
  const d = {};
  if (email) {
    d.email = String(b.email ?? '').trim().toLowerCase();
    if (d.email.length > 254 || !EMAIL_RE.test(d.email)) bad('email', 'Enter a valid e-mail address.');
  }
  d.surname = vName(b.surname, 'surname');
  d.given = vName(b.given, 'given');
  if (!['F', 'M'].includes(b.sex)) bad('sex', 'Choose the sex shown on the card.');
  d.sex = b.sex;
  const dob = String(b.dob ?? '');
  const dt = new Date(dob + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || isNaN(dt) || dt.toISOString().slice(0, 10) !== dob) bad('dob', 'Enter a valid date of birth.');
  const age = ageOn(dob, todayIso());
  if (age < 18) bad('dob', 'Registration is open from the age of 18 (Art. 104).');
  if (age > 130) bad('dob', 'Enter a valid date of birth.');
  d.dob = dob;
  if (!['own', 'ancestry', 'residence'].includes(b.basis)) bad('basis', 'Choose the basis of your attachment.');
  d.basis = b.basis;
  const o = b.origin || {};
  const state = OP.get(String(o.n ?? '') + '|' + String(o.iso ?? ''));
  if (!state || !STATE.has(state)) bad('origin', 'Choose a municipality from the list.');
  d.origin_name = String(o.n); d.origin_iso = String(o.iso); d.state = state;
  if (!['in', 'abroad'].includes(b.res)) bad('res', 'Tell us where you live.');
  if (d.basis === 'residence' && b.res === 'abroad') bad('res', 'Attachment by residence requires living in the Confederation.');
  d.abroad = b.res === 'abroad' ? 1 : 0;
  if (b.people !== 'none' && !PEOPLE.includes(b.people)) bad('people', 'Choose a register, or no register.');
  d.people = b.people;
  if (!['western', 'central', 'eastern'].includes(b.std)) bad('std', 'Choose the language of your card.');
  d.std = b.std;
  d.show_nat = d.people !== 'none' && b.showNat ? 1 : 0;
  const c = b.consent || {};
  if (d.people !== 'none' && c.register !== true) bad('consent_register', 'Your explicit consent is required to record your national register.');
  return d;
}

/* ---------- lecture des enregistrements ---------- */
async function citizen(env, id) {
  return env.DB.prepare(`SELECT c.*, r.people FROM citizens c LEFT JOIN national_register r ON r.citizen_id = c.id WHERE c.id = ?1`)
    .bind(id).first();
}
function cardOf(c) {
  return {
    v: 1, num: c.num, card: c.card, issued: c.issued, expiry: c.expiry,
    surname: c.surname, given: c.given, sex: c.sex, dob: c.dob,
    origin: { n: c.origin_name, iso: c.origin_iso, c: c.state },
    basis: c.basis, abroad: !!c.abroad, people: c.people || 'none', showNat: !!c.show_nat, std: c.std,
    emailHint: hint(c.email), remote: true,
  };
}
async function auth(req, env) {
  const m = /^Bearer\s+([A-Za-z0-9_-]{43})$/.exec(req.headers.get('Authorization') || '');
  if (!m) throw new HttpError(401, 'unauthorized', 'Missing or invalid access link');
  const row = await env.DB.prepare(`SELECT t.citizen_id, t.expires_at FROM tokens t WHERE t.hash = ?1 AND t.kind = 'access'`)
    .bind(await tokenHash(env, m[1])).first();
  if (!row || row.expires_at < nowIso()) throw new HttpError(401, 'unauthorized', 'This access link is invalid or has expired. Request a new one.');
  const c = await citizen(env, row.citizen_id);
  if (!c || !c.verified_at) throw new HttpError(401, 'unauthorized', 'This access link is invalid or has expired. Request a new one.');
  return c;
}
async function nextNumber(env, letters) {
  const r = await env.DB.prepare(`INSERT INTO counters(letters,n) VALUES(?1,1) ON CONFLICT(letters) DO UPDATE SET n = n + 1 RETURNING n`)
    .bind(letters).first();
  return `BK-${letters}-${String(r.n).padStart(6, '0')}`;
}
function registerStmts(env, id, people, t) {
  const s = [env.DB.prepare('DELETE FROM national_register WHERE citizen_id = ?1').bind(id)];
  if (people !== 'none') s.push(env.DB.prepare('INSERT INTO national_register(citizen_id,people,consent_at) VALUES(?1,?2,?3)').bind(id, people, t));
  return s;
}
async function dropStatsCache(url) {
  try { await caches.default.delete(new Request(new URL('/v1/stats', url).toString())); } catch (e) { /* workers.dev : sans cache */ }
}

/* ---------- points d'entrée ---------- */
async function register(req, env, ip) {
  const b = await readJson(req, 16384);
  await limit(env, 'reg-ip:' + ip, 20, 3600e3);
  await turnstile(env, b.turnstile, ip);
  const c0 = b.consent || {};
  if (c0.accession !== true) bad('consent_accession', 'The declaration is required to issue the card.');
  if (c0.data !== true) bad('consent_data', 'Your consent to the processing of your data is required.');
  const d = validate(b, { email: true });
  await limit(env, 'reg-mail:' + d.email, 3, 3600e3);
  const t = nowIso(), s = STATE.get(d.state);
  const ex = await env.DB.prepare('SELECT id, verified_at FROM citizens WHERE email = ?1').bind(d.email).first();
  const out = { status: 'pending', emailHint: hint(d.email) };

  if (ex && ex.verified_at) {               // déjà citoyen : lien d'accès, réponse identique
    const c = await citizen(env, ex.id);
    const tok = await newToken(env, c.id, 'access', ACCESS_TTL);
    await send(env, mailAccess({ to: c.email, given: c.given, surname: c.surname, num: c.num, link: portal(env) + '#/card/' + tok, reason: 'again' }));
    if (devLeak(env)) out.devAccess = tok;
    return json(out, 202);
  }
  const id = ex ? ex.id : crypto.randomUUID();
  const cols = [d.surname, d.given, d.sex, d.dob, d.origin_name, d.origin_iso, d.state, d.basis, d.abroad, d.std, d.show_nat];
  const stmts = ex
    ? [env.DB.prepare(`UPDATE citizens SET surname=?2, given=?3, sex=?4, dob=?5, origin_name=?6, origin_iso=?7, state=?8,
         basis=?9, abroad=?10, std=?11, show_nat=?12, updated_at=?13 WHERE id=?1`).bind(id, ...cols, t),
       env.DB.prepare(`DELETE FROM tokens WHERE citizen_id=?1 AND kind='confirm'`).bind(id)]
    : [env.DB.prepare(`INSERT INTO citizens(id,email,surname,given,sex,dob,origin_name,origin_iso,state,basis,abroad,std,show_nat,created_at,updated_at)
         VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?14)`).bind(id, d.email, ...cols, t)];
  await env.DB.batch([...stmts, ...registerStmts(env, id, d.people, t)]);
  const tok = await newToken(env, id, 'confirm', CONFIRM_TTL);
  await send(env, mailConfirm({ to: d.email, given: d.given, surname: d.surname, stateName: s.n, stateCode: s.c, link: portal(env) + '#/confirm/' + tok }));
  if (devLeak(env)) out.devToken = tok;
  return json(out, 202);
}

async function confirm(req, env, ip, url) {
  const b = await readJson(req, 1024);
  await limit(env, 'confirm-ip:' + ip, 30, 3600e3);
  const tok = String(b.token || '');
  if (!TOKEN_RE.test(tok)) throw new HttpError(404, 'invalid_token', 'This link is invalid or has expired.');
  const h = await tokenHash(env, tok);
  const row = await env.DB.prepare(`SELECT citizen_id, expires_at, used_at FROM tokens WHERE hash = ?1 AND kind = 'confirm'`).bind(h).first();
  if (!row) throw new HttpError(404, 'invalid_token', 'This link is invalid or has expired.');
  if (row.used_at) throw new HttpError(409, 'already_confirmed', 'This registration is already confirmed. Open your card from the e-mail you received, or request a new link.');
  if (row.expires_at < nowIso()) throw new HttpError(410, 'expired', 'This link has expired. Register again to receive a new one.');
  const t = nowIso();
  const claim = await env.DB.prepare('UPDATE tokens SET used_at = ?2 WHERE hash = ?1 AND used_at IS NULL').bind(h, t).run();
  if (!claim.meta.changes) throw new HttpError(409, 'already_confirmed', 'This registration is already confirmed.');
  const c = await citizen(env, row.citizen_id);
  if (c.verified_at) throw new HttpError(409, 'already_confirmed', 'This registration is already confirmed.');
  const num = await nextNumber(env, STATE.get(c.state).k);
  const issued = t.slice(0, 10);
  const access = randomToken();
  await env.DB.batch([
    env.DB.prepare(`UPDATE citizens SET verified_at=?2, num=?3, card=1, issued=?4, expiry=?5, updated_at=?2 WHERE id=?1 AND verified_at IS NULL`)
      .bind(c.id, t, num, issued, addYears(issued, 10)),
    env.DB.prepare(`INSERT INTO tokens(hash,citizen_id,kind,created_at,expires_at) VALUES(?1,?2,'access',?3,?4)`)
      .bind(await tokenHash(env, access), c.id, t, later(ACCESS_TTL)),
  ]);
  await dropStatsCache(url);
  return json({ accessToken: access, card: cardOf(await citizen(env, c.id)) });
}

async function amend(req, env, c, url, ctx) {
  const b = await readJson(req, 16384);
  await limit(env, 'amend:' + c.id, 20, DAY);
  const d = validate(b, { email: false });
  const t = nowIso(), issued = t.slice(0, 10);
  const moved = d.state !== c.state;        // changement d'État : nouveau numéro, l'ancien est retiré
  const num = moved ? await nextNumber(env, STATE.get(d.state).k) : c.num;
  await env.DB.batch([
    env.DB.prepare(`UPDATE citizens SET surname=?2, given=?3, sex=?4, dob=?5, origin_name=?6, origin_iso=?7, state=?8, basis=?9,
       abroad=?10, std=?11, show_nat=?12, num=?13, card=?14, issued=?15, expiry=?16, updated_at=?17 WHERE id=?1`)
      .bind(c.id, d.surname, d.given, d.sex, d.dob, d.origin_name, d.origin_iso, d.state, d.basis, d.abroad, d.std, d.show_nat,
        num, moved ? 1 : c.card + 1, issued, addYears(issued, 10), t),
    ...registerStmts(env, c.id, d.people, t),
  ]);
  await dropStatsCache(url);
  const fresh = await citizen(env, c.id);
  if (c.wallet_google && walletConfigured(env))
    ctx.waitUntil(googleRefresh(env, fresh, STATE.get(fresh.state), verifyUrl(env, fresh)).catch(e => console.error('wallet refresh', e.message)));
  return json({ card: cardOf(fresh) });
}

async function removeCitizen(env, c, url, ctx) {
  if (c.wallet_google && walletConfigured(env))
    ctx.waitUntil(googleRevoke(env, c).catch(e => console.error('wallet revoke', e.message)));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM tokens WHERE citizen_id = ?1').bind(c.id),
    env.DB.prepare('DELETE FROM national_register WHERE citizen_id = ?1').bind(c.id),
    env.DB.prepare('DELETE FROM citizens WHERE id = ?1').bind(c.id),
  ]);
  await dropStatsCache(url);
  return json(null, 204);
}

// Pièces jointes rendues par le navigateur du titulaire (recto/verso) : JPEG ou PNG.
// Sans risque pour l'authenticité : seul le titulaire, à sa propre adresse, peut les envoyer,
// et la carte fait foi par son numéro dans le registre, pas par l'image.
const IMG = [['/9j/', 'jpg'], ['iVBORw0KGgo', 'png']];
async function mailMyCard(req, env, c, accessHeader) {
  const b = await readJson(req, 4 * 1024 * 1024);
  const day = todayIso();
  const count = c.mail_day === day ? c.mail_count : 0;
  if (count >= 5) throw new HttpError(429, 'rate_limited', 'The card can be sent five times a day at most.');
  const attachments = [];
  for (const side of ['front', 'back']) {
    const v = b[side];
    if (v == null) continue;
    const kind = typeof v === 'string' && IMG.find(([sig]) => v.startsWith(sig));
    if (!kind || !/^[A-Za-z0-9+/]+={0,2}$/.test(v) || v.length > 1.5 * 1024 * 1024)
      throw new HttpError(422, 'invalid', 'Invalid card image', side);
    attachments.push({ name: `${c.num}-${side}.${kind[1]}`, content: v });
  }
  await env.DB.prepare('UPDATE citizens SET mail_day=?2, mail_count=?3, last_mail_at=?4 WHERE id=?1')
    .bind(c.id, day, count + 1, nowIso()).run();
  const s = STATE.get(c.state);
  await send(env, mailCard({
    to: c.email, given: c.given, surname: c.surname, num: c.num, stateName: s.n, stateCode: s.c,
    expiry: c.expiry.split('-').reverse().join('.'), link: portal(env) + '#/card/' + accessHeader, attachments,
  }));
  return json({ status: 'sent', emailHint: hint(c.email) }, 202);
}

async function access(req, env, ip) {
  const b = await readJson(req, 8192);
  await limit(env, 'access-ip:' + ip, 10, 3600e3);
  await turnstile(env, b.turnstile, ip);
  const email = String(b.email ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) bad('email', 'Enter a valid e-mail address.');
  await limit(env, 'access-mail:' + email, 3, 3600e3);
  const out = { status: 'sent', emailHint: hint(email) };
  const ex = await env.DB.prepare('SELECT id FROM citizens WHERE email = ?1 AND verified_at IS NOT NULL').bind(email).first();
  if (ex) {
    const c = await citizen(env, ex.id);
    const tok = await newToken(env, c.id, 'access', ACCESS_TTL);
    await send(env, mailAccess({ to: c.email, given: c.given, surname: c.surname, num: c.num, link: portal(env) + '#/card/' + tok, reason: 'request' }));
    if (devLeak(env)) out.devAccess = tok;
  }
  return json(out, 202);
}

async function stats(env, ctx, url) {
  const key = new Request(new URL('/v1/stats', url).toString());
  try { const hit = await caches.default.match(key); if (hit) return new Response(hit.body, hit); } catch (e) { /* sans cache */ }
  const since = later(-30 * DAY);
  const [tot, rec, abr, st, pe, days] = await env.DB.batch([
    env.DB.prepare('SELECT COUNT(*) AS n FROM citizens WHERE verified_at IS NOT NULL'),
    env.DB.prepare('SELECT COUNT(*) AS n FROM citizens WHERE verified_at >= ?1').bind(since),
    env.DB.prepare('SELECT COUNT(*) AS n FROM citizens WHERE verified_at IS NOT NULL AND abroad = 1'),
    env.DB.prepare('SELECT state, COUNT(*) AS n FROM citizens WHERE verified_at IS NOT NULL GROUP BY state'),
    env.DB.prepare(`SELECT r.people, COUNT(*) AS n FROM national_register r JOIN citizens c ON c.id = r.citizen_id
                    WHERE c.verified_at IS NOT NULL GROUP BY r.people`),
    env.DB.prepare(`SELECT substr(verified_at,1,10) AS d, COUNT(*) AS n FROM citizens WHERE verified_at >= ?1 GROUP BY d ORDER BY d`)
      .bind(later(-90 * DAY)),
  ]);
  const total = tot.results[0].n;
  const states = Object.fromEntries(st.results.map(r => [r.state, r.n]));
  const peoples = Object.fromEntries(PEOPLE.map(k => [k, 0]));
  for (const r of pe.results) peoples[r.people] = r.n;
  peoples.none = total - pe.results.reduce((a, r) => a + r.n, 0);
  const data = {
    total, last30: rec.results[0].n, abroad: abr.results[0].n,
    statesRepresented: Object.keys(states).length, states, peoples,
    daily: days.results.map(r => [r.d, r.n]), updated: nowIso(),
  };
  const res = json(data, 200, { 'Cache-Control': 'public, max-age=60' });
  try { ctx.waitUntil(caches.default.put(key, res.clone())); } catch (e) { /* sans cache */ }
  return res;
}

async function cleanup(env) {
  const old = later(-PENDING_TTL), t = nowIso();
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM tokens WHERE citizen_id IN (SELECT id FROM citizens WHERE verified_at IS NULL AND created_at < ?1)`).bind(old),
    env.DB.prepare(`DELETE FROM national_register WHERE citizen_id IN (SELECT id FROM citizens WHERE verified_at IS NULL AND created_at < ?1)`).bind(old),
    env.DB.prepare('DELETE FROM citizens WHERE verified_at IS NULL AND created_at < ?1').bind(old),
    env.DB.prepare(`DELETE FROM tokens WHERE expires_at < ?1 OR (kind = 'confirm' AND used_at IS NOT NULL)`).bind(t),
    env.DB.prepare('DELETE FROM ratelimit'),
  ]);
}

async function wallet(env, c) {
  if (!walletConfigured(env)) throw new HttpError(501, 'wallet_not_configured', 'Google Wallet is not available yet.');
  await limit(env, 'wallet:' + c.id, 10, DAY);
  const origins = (env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  let link;
  try { link = await googleSaveUrl(env, c, STATE.get(c.state), verifyUrl(env, c), origins); }
  catch (e) { console.error('wallet', e.message); throw new HttpError(502, 'wallet_failed', 'Google Wallet could not be reached. Please try again later.'); }
  if (!c.wallet_google) await env.DB.prepare('UPDATE citizens SET wallet_google = 1 WHERE id = ?1').bind(c.id).run();
  return json({ url: link });
}

// Vérification publique : statut d'un numéro, sans aucune donnée personnelle.
// Un numéro absent mais inférieur au compteur de son État a été délivré puis annulé
// (suppression ou changement d'État) : aucun registre des annulations n'est nécessaire.
async function verify(env, ip, num, url) {
  await limit(env, 'verify-ip:' + ip, 120, 3600e3);
  const m = /^BK-([A-Z]{2})-(\d{6})$/.exec(num);
  if (!m) throw new HttpError(400, 'invalid_number', 'A card number reads BK-XX-NNNNNN.');
  const issue = url.searchParams.get('issue');
  const c = await env.DB.prepare('SELECT state, card, issued, expiry FROM citizens WHERE num = ?1 AND verified_at IS NOT NULL').bind(num).first();
  const head = { 'Cache-Control': 'public, max-age=30' };
  if (c) {
    const s = STATE.get(c.state);
    const status = c.expiry < todayIso() ? 'expired' : issue && +issue !== c.card ? 'superseded' : 'valid';
    return json({ num, status, state: c.state, stateName: s ? s.n : c.state, issue: c.card, expiry: c.expiry }, 200, head);
  }
  const ctr = await env.DB.prepare('SELECT n FROM counters WHERE letters = ?1').bind(m[1]).first();
  return json({ num, status: ctr && +m[2] >= 1 && +m[2] <= ctr.n ? 'revoked' : 'unknown' }, 200, head);
}

async function route(req, env, ctx, url) {
  const p = url.pathname.replace(/\/+$/, '');
  const m = req.method;
  const ip = req.headers.get('CF-Connecting-IP') || 'local';
  if (p === '/v1/health' && m === 'GET') return json({ ok: true, wallet: { google: walletConfigured(env) } });
  if (p.startsWith('/v1/verify/') && m === 'GET') return verify(env, ip, decodeURIComponent(p.slice(11)), url);
  if (p === '/v1/stats' && m === 'GET') return stats(env, ctx, url);
  if (p === '/v1/registrations' && m === 'POST') return register(req, env, ip);
  if (p === '/v1/confirm' && m === 'POST') return confirm(req, env, ip, url);
  if (p === '/v1/access' && m === 'POST') return access(req, env, ip);
  if (p === '/v1/card' || p === '/v1/card/mail' || p === '/v1/card/wallet/google') {
    const c = await auth(req, env);
    if (p === '/v1/card/wallet/google' && m === 'POST') return wallet(env, c);
    if (p === '/v1/card/mail' && m === 'POST') return mailMyCard(req, env, c, req.headers.get('Authorization').slice(7).trim());
    if (p === '/v1/card' && m === 'GET') return json({ card: cardOf(c) });
    if (p === '/v1/card' && m === 'PATCH') return amend(req, env, c, url, ctx);
    if (p === '/v1/card' && m === 'DELETE') return removeCitizen(env, c, url, ctx);
    throw new HttpError(405, 'method', 'Method not allowed');
  }
  throw new HttpError(404, 'not_found', 'Not found');
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const { h, ok } = corsHeaders(req.headers.get('Origin') || '', env);
    if (req.method === 'OPTIONS') return new Response(null, { status: ok ? 204 : 403, headers: { ...h, 'Access-Control-Max-Age': '86400' } });
    let res;
    try {
      if (!ok) throw new HttpError(403, 'origin', 'Origin not allowed');
      res = await route(req, env, ctx, url);
    } catch (e) {
      if (e instanceof HttpError) res = json({ error: e.code, message: e.message, ...(e.field ? { field: e.field } : {}) }, e.status);
      else { console.error(e && e.stack || e); res = json({ error: 'internal', message: 'Internal error' }, 500); }
    }
    for (const [k, v] of Object.entries(h)) res.headers.set(k, v);
    return res;
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(cleanup(env)); },
};
