// Prépare le mode dev : clé de compte de service factice (pour le Google Wallet simulé)
// et .dev.vars. Rien de tout cela ne sert en production.
import { generateKeyPairSync } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
mkdirSync('test/keys', { recursive: true });
writeFileSync('test/keys/test-sa.pem', privateKey);
writeFileSync('test/keys/test-sa.pub.pem', publicKey);
const key = JSON.stringify({ type: 'service_account', client_email: 'registre-test@bk-test.iam.gserviceaccount.com', private_key: privateKey });
writeFileSync('.dev.vars', [
  'DEV=1',
  'GOOGLE_WALLET_ISSUER_ID=3388000000012345678',
  `GOOGLE_WALLET_KEY='${key}'`,
  'GOOGLE_OAUTH_URL=http://127.0.0.1:8788/token',
  'GOOGLE_WALLET_API=http://127.0.0.1:8788/walletobjects/v1',
  '',
].join('\n'));
console.log('.dev.vars et test/keys/ écrits (mode dev, Google Wallet simulé sur le port 8788)');
