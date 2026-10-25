// Serveur Google Wallet factice pour les tests : jeton OAuth (assertion vérifiée avec la
// clé publique de test), classes et objets génériques, état consultable par le test.
import http from 'node:http';
import crypto from 'node:crypto';

export function startGoogleMock(publicKeyPem, port = 8788) {
  const state = { classes: {}, objects: {}, tokens: 0, calls: [] };
  const verifyJwt = jwt => {
    const [h, b, s] = jwt.split('.');
    const ok = crypto.verify('RSA-SHA256', Buffer.from(h + '.' + b), publicKeyPem, Buffer.from(s, 'base64url'));
    return ok ? JSON.parse(Buffer.from(b, 'base64url').toString()) : null;
  };
  const server = http.createServer(async (req, res) => {
    let body = '';
    for await (const c of req) body += c;
    const send = (code, data) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
    state.calls.push(req.method + ' ' + req.url);
    if (req.url === '/token' && req.method === 'POST') {
      const assertion = new URLSearchParams(body).get('assertion');
      const claims = assertion && verifyJwt(assertion);
      if (!claims || claims.scope !== 'https://www.googleapis.com/auth/wallet_object.issuer') return send(401, { error: 'invalid_grant' });
      state.tokens++;
      return send(200, { access_token: 'mock-token', expires_in: 3600, token_type: 'Bearer' });
    }
    if (req.headers.authorization !== 'Bearer mock-token') return send(401, { error: 'unauthenticated' });
    const m = /^\/walletobjects\/v1\/(genericClass|genericObject)(?:\/(.+))?$/.exec(req.url);
    if (!m) return send(404, {});
    const store = m[1] === 'genericClass' ? state.classes : state.objects;
    const id = m[2] && decodeURIComponent(m[2]);
    if (req.method === 'GET') return store[id] ? send(200, store[id]) : send(404, { error: { code: 404 } });
    const obj = JSON.parse(body || '{}');
    if (req.method === 'POST') { if (store[obj.id]) return send(409, { error: { code: 409 } }); store[obj.id] = obj; return send(200, obj); }
    if (req.method === 'PUT') { if (!store[id]) return send(404, {}); store[id] = obj; return send(200, obj); }
    return send(405, {});
  });
  return new Promise(ok => server.listen(port, '127.0.0.1', () => ok({ state, close: () => server.close() })));
}
