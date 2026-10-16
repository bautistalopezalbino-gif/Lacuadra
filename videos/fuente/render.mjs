// Renderiza videos/menu-desayunos.mp4 (16:9, 1920x1080) a partir de menu-desayunos.html.
// Uso, desde la raíz del repo:  node videos/fuente/render.mjs
// Necesita playwright (Chromium) y ffmpeg en el PATH.
// Para revisar fotogramas sueltos sin renderizar todo:  node videos/fuente/render.mjs --still=1.5,4.2 --dir=/tmp
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright'); // también si está instalado globalmente
const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'videos/menu-desayunos.mp4');
const FPS = 30;
const TYPES = { '.html':'text/html', '.css':'text/css', '.woff2':'font/woff2', '.png':'image/png', '.jpg':'image/jpeg', '.jfif':'image/jpeg' };

// Servidor estático mínimo: las fuentes no cargan bien desde file://
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${port}/videos/fuente/menu-desayunos.html`);
await page.evaluate(() => window.ready);
const duration = await page.evaluate(() => window.DURATION);
const frames = Math.round(duration * FPS);

if (arg('still')) {
  for (const t of arg('still').split(',').map(Number)) {
    await page.evaluate(t => window.render(t), t);
    await page.screenshot({ path: path.join(arg('dir') || '.', `still-${t}.png`) });
  }
  await browser.close(); server.close(); process.exit(0);
}

const ff = spawn('ffmpeg', [
  '-y', '-v', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
  '-map', '0:v', '-map', '1:a', '-shortest',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
  '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', OUT,
], { stdio: ['pipe', 'inherit', 'inherit'] });

for (let f = 0; f < frames; f++) {
  await page.evaluate(t => window.render(t), f / FPS);
  const jpg = await page.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % FPS === 0) process.stdout.write(`\r${Math.round(f / FPS)}/${Math.round(duration)} s`);
}
ff.stdin.end();
await new Promise((resolve, reject) => ff.on('close', c => c ? reject(new Error(`ffmpeg salió con ${c}`)) : resolve()));
await browser.close();
server.close();
console.log(`\n${OUT} · ${frames} fotogramas · ${duration.toFixed(1)} s`);
