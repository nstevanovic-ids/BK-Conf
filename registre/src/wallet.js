// Google Wallet — pass générique « carte citoyenne ».
// Le registre agit comme émetteur : compte de service Google (clé JSON en secret
// GOOGLE_WALLET_KEY), identifiant d'émetteur en variable GOOGLE_WALLET_ISSUER_ID.
//
// Données du pass volontairement réduites : nom, numéro, État, validité, QR de
// vérification. Ni date de naissance ni narodnost (catégorie particulière, RGPD art. 9) :
// un pass générique n'a pas les protections d'un pass « privé ».
//
// Flux : jeton OAuth (assertion JWT RS256) → classe créée au besoin → objet inséré ou
// remplacé → lien https://pay.google.com/gp/v/save/<JWT signé> ne portant que l'id de
// l'objet (« skinny JWT », court quelle que soit la carte).

const OAUTH = 'https://oauth2.googleapis.com/token';
const API = 'https://walletobjects.googleapis.com/walletobjects/v1';
const SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer';
const enc = new TextEncoder();

const b64url = buf => {
  const bytes = typeof buf === 'string' ? enc.encode(buf) : new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export function walletConfigured(env) {
  return !!(env.GOOGLE_WALLET_KEY && env.GOOGLE_WALLET_ISSUER_ID);
}

function serviceAccount(env) {
  let sa;
  try { sa = JSON.parse(env.GOOGLE_WALLET_KEY); } catch (e) { throw new Error('GOOGLE_WALLET_KEY is not valid JSON'); }
  if (!sa.client_email || !sa.private_key) throw new Error('GOOGLE_WALLET_KEY lacks client_email or private_key');
  return sa;
}

let KEY_CACHE = null;
async function signingKey(pem) {
  if (KEY_CACHE && KEY_CACHE.pem === pem) return KEY_CACHE.key;
  const der = Uint8Array.from(atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  KEY_CACHE = { pem, key };
  return key;
}

export async function signJwt(claims, pem) {
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(claims));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', await signingKey(pem), enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

let TOKEN = null;
async function accessToken(env) {
  if (TOKEN && TOKEN.exp > Date.now() + 60000) return TOKEN.value;
  const sa = serviceAccount(env);
  const now = Math.floor(Date.now() / 1000);
  const url = env.GOOGLE_OAUTH_URL || OAUTH;
  const assertion = await signJwt({ iss: sa.client_email, scope: SCOPE, aud: url, iat: now, exp: now + 3600 }, sa.private_key);
  const r = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${assertion}`,
  });
  if (!r.ok) throw new Error(`google oauth ${r.status} ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  TOKEN = { value: d.access_token, exp: Date.now() + (d.expires_in || 3600) * 1000 };
  return TOKEN.value;
}

async function gcall(env, method, path, body) {
  const r = await fetch((env.GOOGLE_WALLET_API || API) + path, {
    method,
    headers: { Authorization: 'Bearer ' + await accessToken(env), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r;
}

const classId = env => `${env.GOOGLE_WALLET_ISSUER_ID}.bk_citizen_card`;
const objectId = (env, c) => `${env.GOOGLE_WALLET_ISSUER_ID}.${c.id.replace(/[^A-Za-z0-9._-]/g, '')}`;
const loc = v => ({ defaultValue: { language: 'en', value: v } });
const DOC = { western: 'Državljanska izkaznica', central: 'Državljanska karta', eastern: 'Graždanska karta' };

let CLASS_OK = false;
async function ensureClass(env) {
  if (CLASS_OK) return;
  const id = classId(env);
  let r = await gcall(env, 'GET', `/genericClass/${encodeURIComponent(id)}`);
  if (r.status === 404) {
    r = await gcall(env, 'POST', '/genericClass', { id });
    if (!r.ok && r.status !== 409) throw new Error(`genericClass insert ${r.status} ${(await r.text()).slice(0, 200)}`);
  } else if (!r.ok) throw new Error(`genericClass get ${r.status}`);
  CLASS_OK = true;
}

export function passObject(env, c, s, verifyUrl) {
  const portal = (env.PORTAL_URL || '').replace(/\/?$/, '/');
  const d = x => x.split('-').reverse().join('.');
  return {
    id: objectId(env, c), classId: classId(env), state: 'ACTIVE',
    cardTitle: loc('Balkan Confederation'),
    subheader: loc(`Citizen card · ${DOC[c.std] || DOC.central}`),
    header: loc(`${c.surname.toUpperCase()} ${c.given}`),
    hexBackgroundColor: '#2c3466',
    logo: { sourceUri: { uri: portal + 'images/wallet-logo.png' }, contentDescription: loc('Winged lion of the Balkan Confederation') },
    heroImage: { sourceUri: { uri: portal + 'images/wallet-hero.png' }, contentDescription: loc('Balkanska Konfederacija') },
    textModulesData: [
      { id: 'num', header: 'Card no.', body: c.num },
      { id: 'state', header: 'State of attachment', body: `${s.n} · ${s.c}` },
      { id: 'expiry', header: 'Valid until', body: d(c.expiry) },
    ],
    barcode: { type: 'QR_CODE', value: verifyUrl, alternateText: c.num },
    validTimeInterval: { start: { date: c.issued + 'T00:00:00Z' }, end: { date: c.expiry + 'T23:59:59Z' } },
    linksModuleData: { uris: [{ id: 'portal', uri: portal + '#/participation', description: 'Confederal digital citizenship' }] },
  };
}

async function upsert(env, obj) {
  let r = await gcall(env, 'POST', '/genericObject', obj);
  if (r.status === 409) r = await gcall(env, 'PUT', `/genericObject/${encodeURIComponent(obj.id)}`, obj);
  if (!r.ok) throw new Error(`genericObject ${r.status} ${(await r.text()).slice(0, 200)}`);
}

/** Crée ou met à jour le pass et renvoie le lien « Ajouter à Google Wallet ». */
export async function googleSaveUrl(env, c, s, verifyUrl, origins) {
  await ensureClass(env);
  const obj = passObject(env, c, s, verifyUrl);
  await upsert(env, obj);
  const sa = serviceAccount(env);
  const jwt = await signJwt({
    iss: sa.client_email, aud: 'google', typ: 'savetowallet', iat: Math.floor(Date.now() / 1000),
    origins, payload: { genericObjects: [{ id: obj.id }] },
  }, sa.private_key);
  return 'https://pay.google.com/gp/v/save/' + jwt;
}

/** Après amendement : remet le pass à jour s'il a été ajouté. */
export async function googleRefresh(env, c, s, verifyUrl) {
  await ensureClass(env);
  await upsert(env, passObject(env, c, s, verifyUrl));
}

/** Après suppression : le pass est invalidé et vidé de toute donnée personnelle
 *  (l'API Google Wallet ne permet pas à l'émetteur de supprimer un objet). */
export async function googleRevoke(env, c) {
  await ensureClass(env);
  const portal = (env.PORTAL_URL || '').replace(/\/?$/, '/');
  await upsert(env, {
    id: objectId(env, c), classId: classId(env), state: 'INACTIVE',
    cardTitle: loc('Balkan Confederation'), header: loc('Card cancelled'),
    subheader: loc('Citizen card'), hexBackgroundColor: '#5f6678',
    logo: { sourceUri: { uri: portal + 'images/wallet-logo.png' }, contentDescription: loc('Winged lion of the Balkan Confederation') },
    textModulesData: [{ id: 'info', header: 'Status', body: 'This card has been cancelled at the request of its holder.' }],
  });
}
