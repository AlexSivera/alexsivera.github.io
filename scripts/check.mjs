// Comprobación estática: enlaces internos, anclas, ids duplicados, alt, un h1 por página,
// dimensiones de imágenes y que los recursos existen. Uso: npm run check
import { readFile, stat } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';

const pages = ['index.html', 'proyectos/index.html', 'proyectos/el-pegoli/index.html', 'proyectos/seriart/index.html',
  'proyectos/fisioterapia-denia/index.html', 'proyectos/beekery/index.html', 'como-trabajo/index.html', 'sobre-mi/index.html',
  'contacto/index.html', 'privacidad/index.html', '404.html'];
const errors = [];
const cache = new Map();
const exists = async p => { try { await stat(p); return true; } catch { return false; } };
const ids = async file => {
  if (!cache.has(file)) cache.set(file, [...(await readFile(file, 'utf8')).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  return cache.get(file);
};

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const own = await ids(page);
  const dup = own.filter((id, i) => own.indexOf(id) !== i);
  if (dup.length) errors.push(`${page}: ids duplicados ${[...new Set(dup)].join(', ')}`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${page}: ${h1} h1 (debe haber 1)`);
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]*"/.test(tag)) errors.push(`${page}: img sin alt → ${tag.slice(0, 80)}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) errors.push(`${page}: img sin width/height → ${tag.slice(0, 80)}`);
  }
  for (const [, attr, raw] of html.matchAll(/\s(href|src|srcset)="([^"]+)"/g)) {
    const urls = attr === 'srcset' ? raw.split(',').map(s => s.trim().split(/\s+/)[0]) : [raw];
    for (const url of urls) {
      if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
      const [path, hash] = url.split('#');
      const base = page === '404.html' || path.startsWith('/') ? '.' : dirname(page);
      let target = path ? normalize(join(base, path.replace(/^\//, ''))) : page;
      if (path && (path.endsWith('/') || !/\.[a-z0-9]+$/i.test(path))) target = join(target, 'index.html');
      if (!(await exists(target))) { errors.push(`${page}: no existe ${url}`); continue; }
      if (hash && target.endsWith('.html') && !(await ids(target)).includes(hash)) errors.push(`${page}: ancla rota ${url}`);
    }
  }
  for (const [, id] of html.matchAll(/aria-(?:labelledby|controls)="([^"]+)"/g)) {
    for (const one of id.split(/\s+/)) if (!own.includes(one)) errors.push(`${page}: aria apunta a id inexistente "${one}"`);
  }
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch (e) { errors.push(`${page}: JSON-LD inválido (${e.message})`); }
  }
}
if (errors.length) { console.error(errors.join('\n')); console.error(`\n${errors.length} problema(s).`); process.exit(1); }
console.log(`OK: ${pages.length} páginas sin problemas.`);
