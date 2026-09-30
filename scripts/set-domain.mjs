// Convierte las URLs relativas de SEO en absolutas y genera sitemap.xml.
// Uso (cuando exista dominio):  node scripts/set-domain.mjs https://www.ejemplo.es
import { readFile, writeFile } from 'node:fs/promises';

const site = (process.argv[2] || '').replace(/\/$/, '');
if (!/^https:\/\/[^/]+$/.test(site)) {
  console.error('Indica el dominio con https:// y sin barra final. Ej.: node scripts/set-domain.mjs https://www.ejemplo.es');
  process.exit(1);
}
const pages = [
  ['index.html', '/', '1.0'],
  ['proyectos/index.html', '/proyectos/', '0.9'],
  ['proyectos/el-pegoli/index.html', '/proyectos/el-pegoli/', '0.8'],
  ['proyectos/seriart/index.html', '/proyectos/seriart/', '0.8'],
  ['proyectos/fisioterapia-denia/index.html', '/proyectos/fisioterapia-denia/', '0.8'],
  ['proyectos/beekery/index.html', '/proyectos/beekery/', '0.8'],
  ['como-trabajo/index.html', '/como-trabajo/', '0.7'],
  ['sobre-mi/index.html', '/sobre-mi/', '0.7'],
  ['contacto/index.html', '/contacto/', '0.9'],
  ['privacidad/index.html', '/privacidad/', '0.2'],
];
for (const [file] of pages) {
  let html = await readFile(file, 'utf8');
  html = html
    .replace(/(<link rel="canonical" href=")(\/[^"]*)"/g, `$1${site}$2"`)
    .replace(/(<meta property="og:(?:url|image)" content=")(\/[^"]*)"/g, `$1${site}$2"`)
    .replace(/("(?:@id|url|image)": ")(\/[^"]*)"/g, `$1${site}$2"`);
  await writeFile(file, html);
}
const today = new Date().toISOString().slice(0, 10);
const urls = pages.map(([, p, prio]) => `  <url>\n    <loc>${site}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${prio}</priority>\n  </url>`).join('\n');
await writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
let robots = await readFile('robots.txt', 'utf8');
robots = robots.replace(/\n?Sitemap:.*\n?/g, '\n').replace(/# La línea Sitemap.*\n?/, '');
await writeFile('robots.txt', robots.trimEnd() + `\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`Listo: URLs absolutas con ${site}, sitemap.xml y robots.txt actualizados.`);
