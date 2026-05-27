const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const DIR = __dirname;

let config = {};
try { config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')); } catch {}

const CACHE_FILE = path.join(__dirname, 'reviews-cache.json');
const CACHE_TTL  = 24 * 60 * 60 * 1000; // 24 horas

function fetchGoogleReviews() {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${config.GOOGLE_PLACE_ID}&fields=reviews,rating,user_ratings_total&language=es&key=${config.GOOGLE_API_KEY}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
};

http.createServer((req, res) => {

  // ── API: reseñas de Google ──
  if (req.url === '/api/reviews') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (Date.now() - cache.timestamp < CACHE_TTL) {
        res.writeHead(200);
        return res.end(JSON.stringify(cache));
      }
    } catch {}

    fetchGoogleReviews().then(data => {
      const reviews = (data.result?.reviews || [])
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);
      const payload = {
        timestamp: Date.now(),
        rating: data.result?.rating || 4.8,
        total: data.result?.user_ratings_total || 0,
        reviews
      };
      fs.writeFileSync(CACHE_FILE, JSON.stringify(payload));
      res.writeHead(200);
      res.end(JSON.stringify(payload));
    }).catch(err => {
      console.error('Error al obtener reseñas:', err.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'No se pudieron obtener las reseñas' }));
    });
    return;
  }

  // ── Archivos estáticos ──
  let filePath = path.join(DIR, req.url === '/' ? 'code.html' : req.url);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`La Cuadra corriendo en http://localhost:${PORT}`);
});
