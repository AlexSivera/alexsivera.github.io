// Servidor estático mínimo para desarrollo: node scripts/serve.mjs [puerto]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2] || process.env.PORT || 4180);
const ROOT = process.cwd();
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
};

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(ROOT, url));
  // No se publican: originales, documentación, scripts ni dependencias.
  if (!file.startsWith(ROOT) || /[\/](_src|node_modules|docs|scripts)([\/]|$)/.test(file.slice(ROOT.length))) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(file)).isDirectory()) {
      if (!url.endsWith('/')) { res.writeHead(301, { Location: url + '/' }).end(); return; }
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  } catch {
    const body = await readFile(join(ROOT, '404.html')).catch(() => 'No encontrado');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] }).end(body);
  }
}).listen(PORT, () => console.log(`Alex Sivera en http://localhost:${PORT}`));
