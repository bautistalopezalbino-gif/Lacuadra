// Renderiza una composición HTML a MP4 fotograma a fotograma (Playwright + ffmpeg).
// Uso: node render.js <composicion.html> <salida.mp4> [fps] [--stills t1,t2,...]
//   node render.js video-tv.html LaCuadra_Desayunos_Meriendas_TV_16x9.mp4 60
//   node render.js video.html LaCuadra_Promo_Desayunos_Meriendas.mp4 30
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const [html, out] = process.argv.slice(2, 4);
  const fps = Number(process.argv[4] || 30);
  const stillsArg = process.argv.indexOf('--stills');
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, html));
  await page.evaluate(() => window.ready);
  const { W, H, DURATION } = await page.evaluate(() => ({ W: document.body.clientWidth, H: document.body.clientHeight, DURATION: window.DURATION }));
  await page.setViewportSize({ width: W, height: H });
  if (stillsArg > -1) {
    for (const t of process.argv[stillsArg + 1].split(',').map(Number)) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: `${out}_${t.toFixed(2)}.png` });
    }
    await browser.close(); return;
  }
  const n = Math.round(DURATION * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.seek(t), i / fps);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 120 === 0) process.stdout.write(`frame ${i}/${n}\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', out);
})();
