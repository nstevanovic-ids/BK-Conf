#!/usr/bin/env node
/* Rendu du film explicatif, image par image : Chromium (Playwright) appelle FILM.seek(t) pour chaque image,
   capture en PNG et passe les images à ffmpeg (H.264, yuv420p, faststart).

   Usage : NODE_PATH=$(npm root -g) node film/render.js [options]
     --lang en            langue des textes (film/explainer/<lang>.js)
     --from 0 --to 300    intervalle en secondes (défaut : tout le film)
     --fps 30             images par seconde
     --crf 20             qualité x264
     --out <fichier.mp4>  défaut : portail/videos/explainer-<lang>.mp4
     --data               au lieu du film : chapitres et texte pour la page du portail (portail/data/film.json)
                          et image d'attente (portail/videos/explainer-<lang>.jpg, --poster 3.5 secondes)
     --stills 3,law:20    au lieu du film, des images PNG à ces instants (secondes, ou scène:secondes après
                          son carton), dans --dir (défaut film/stills/)
   Le dépôt est servi par un petit serveur local ; rien ne sort de la machine. */
const {chromium} = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const A = {};
for (let i = 2; i < process.argv.length; i++) if (process.argv[i].startsWith('--')) A[process.argv[i].slice(2)] = process.argv[i + 1];
const LANG = A.lang || 'en', FPS = +(A.fps || 30), CRF = String(A.crf || 20);
const OUT = path.resolve(A.out || path.join(ROOT, 'portail', 'videos', `explainer-${LANG}.mp4`));

const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css'};
function serve() {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'});
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

/* Texte du film, chapitre par chapitre, tel qu'il passe à l'écran (accessibilité, recherche) ;
   *mise en valeur* retirée. Une phrase en titre et son détail font un paragraphe. */
function transcript(T, id, peuples) {
  const J = a => (Array.isArray(a) ? a : [a]).join(' '), S = x => x.replace(/\*/g, '');
  const para = p => { let h = S(J(p[0])); if (!/[.!?:,]$/.test(h)) h += '.'; return p[1] ? h + ' ' + S(J(p[1])) : h; };
  const end = x => /[.!?]$/.test(x) ? x : x + '.';
  const t = T[id];
  switch (id) {
    case 'intro': return [end(T.title), `${t.motto}: ${end(t.mottoEn)}`];
    case 'states': return [S(J(t.l1)) + ', ' + S(J(t.l2)) + '.', para([t.l3]), para(t.terr), para(t.city) + ' ' +
      Object.values(t.caps).map(c => c.join(', ')).join('; ') + '.', para(t.mun), para(t.sov) + ' ' + t.frozen];
    case 'peoples': return [t.head + ': ' + Object.values(peuples).map(p => `${p.name} (${p.en})`).join(', ') + '.',
      para(t.choice), para(t.free), para(t.commune), para(t.comm), t.mottoCap + ': ' + t.mottos.join(', ') + '.'];
    case 'institutions': return t.say.map(para);
    case 'law': return [para(t.k), para(t.id), para(t.five), para(t.six), para(t.alarm) + ' ' + t.flow.join(' → ') + '.', t.note];
    case 'democracy': return [para(t.ref), para(t.ini), para(t.dbl), para(t.sun)];
    case 'language': return [para(t.three) + ' ' + t.std.map((x, i) => `${x[0]} (${x[1]}): ${t.sabor[i]}`).join('; ') + '.', para(t.abc), para(t.cyr)];
    case 'together': return t.items.map(i => end(J(i))).concat([end(S(J(t.end)))]);
    case 'symbols': return [para(t.civil), para(t.state), para(t.lion), `${t.motto}: ${end(t.mottoEn)}`];
  }
  return [];
}

(async () => {
  const srv = await serve(), port = srv.address().port;
  const b = await chromium.launch({args: ['--no-sandbox', '--font-render-hinting=none']});
  const page = await b.newPage({viewport: {width: 1280, height: 720}, deviceScaleFactor: 1});
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/film/explainer/?render=1&lang=${LANG}`);
  await page.waitForFunction(() => window.FILM && FILM.ready, null, {timeout: 30000});
  const dur = await page.evaluate(() => FILM.duration);
  const svg = await page.$('#film');
  const shot = async t => { await page.evaluate(t => FILM.seek(t), t); return svg.screenshot({type: 'png'}); };

  if ('data' in A) {
    /* page du portail : chapitres, texte du film et image d'attente (portail/data/film.json, videos/explainer-<lang>.jpg) */
    const T = await page.evaluate(l => TXT[l], LANG), sc = await page.evaluate(() => FILM.scenes());
    const peuples = JSON.parse(fs.readFileSync(path.join(ROOT, 'portail', 'data', 'peuples.json'), 'utf8'));
    const poster = path.join(ROOT, 'portail', 'videos', `explainer-${LANG}.jpg`);
    await page.evaluate(t => FILM.seek(t), +(A.poster || 3.5));
    fs.writeFileSync(poster, await svg.screenshot({type: 'jpeg', quality: 86}));
    const df = path.join(ROOT, 'portail', 'data', 'film.json');
    const all = fs.existsSync(df) ? JSON.parse(fs.readFileSync(df, 'utf8')) : {};
    all[LANG] = {src: `videos/explainer-${LANG}.mp4`, poster: `videos/explainer-${LANG}.jpg`, dur: Math.round(dur * 10) / 10,
      chapters: sc.map(o => ({id: o.id, n: o.chap, title: o.chap ? T[o.id].chapter : T.title, t: Math.round(o.start * 10) / 10,
        text: transcript(T, o.id, peuples)}))};
    fs.writeFileSync(df, JSON.stringify(all, null, 1) + '\n');
    console.log(df + '\n' + poster);
  } else if (A.stills) {
    const dir = path.resolve(A.dir || path.join(__dirname, 'stills'));
    fs.mkdirSync(dir, {recursive: true});
    /* un instant = secondes du film, ou scène:secondes dans la scène (après son carton) */
    const sc = await page.evaluate(() => FILM.scenes());
    for (const s of A.stills.split(',')) {
      const [id, lt] = s.includes(':') ? s.split(':') : [null, s], o = id && sc.find(x => x.id === id);
      if (id && !o) throw new Error('scène inconnue : ' + id);
      const t = o ? o.start + o.card + +lt : +lt;
      const f = path.join(dir, `${LANG}-${s.replace(/[.:]/g, '_')}.png`);
      fs.writeFileSync(f, await shot(t)); console.log(f);
    }
  } else {
    const from = +(A.from || 0), to = Math.min(+(A.to || dur), dur), n = Math.round((to - from) * FPS);
    fs.mkdirSync(path.dirname(OUT), {recursive: true});
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', CRF, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT],
      {stdio: ['pipe', 'inherit', 'inherit']});
    const done = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await shot(from + i / FPS);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % (FPS * 10) === 0) process.stderr.write(`\r${(from + i / FPS).toFixed(0)} s / ${to} s · ${((Date.now() - t0) / 1000).toFixed(0)} s écoulées`);
    }
    ff.stdin.end(); await done;
    process.stderr.write(`\n${OUT} : ${n} images, ${(fs.statSync(OUT).size / 1e6).toFixed(1)} Mo, ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
  }
  if (errs.length) console.error('Erreurs de la page :', errs);
  await b.close(); srv.close();
  if (errs.length) process.exit(1);
})();
