#!/usr/bin/env node
/* Rendu du film explicatif, image par image : Chromium (Playwright) appelle FILM.seek(t) pour chaque image,
   capture en PNG et passe les images à ffmpeg (H.264, yuv420p, faststart).

   Usage : NODE_PATH=$(npm root -g) node film/render.js [options]
     --lang en            langue des textes (film/explainer/<lang>.js)
     --from 0 --to 300    intervalle en secondes (défaut : tout le film)
     --fps 30             images par seconde
     --crf 20             qualité x264
     --out <fichier.mp4>  défaut : portail/videos/explainer-<lang>.mp4
     --stills 3,12.5,40   au lieu du film, des images PNG à ces instants (dans --dir, défaut film/stills/)
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

  if (A.stills) {
    const dir = path.resolve(A.dir || path.join(__dirname, 'stills'));
    fs.mkdirSync(dir, {recursive: true});
    for (const s of A.stills.split(',')) {
      const f = path.join(dir, `${LANG}-${String(s).replace('.', '_')}.png`);
      fs.writeFileSync(f, await shot(+s)); console.log(f);
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
