// Genera las imágenes optimizadas de /assets/img a partir de /_src/img.
// Uso: npm run images   (requiere la devDependency "sharp")
//
// Las capturas de los proyectos se hicieron con Playwright a 2× (escritorio, 1440 px)
// y 3× (móvil, 390 px). Aquí se recortan si hace falta y se exportan en varios anchos.
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';

const SRC = '_src/img';
const OUT = 'assets/img';
await mkdir(OUT, { recursive: true });

const DESK = [720, 1200, 1800];
const PHONE = [360, 720];

// crop: [left, top, width, height] en píxeles de la imagen original.
const images = [
  // El Pegolí
  { src: 'pegoli-hero', widths: DESK },
  { src: 'pegoli-gamba', widths: DESK },
  { src: 'pegoli-carta', widths: DESK, crop: [300, 170, 2300, 2000] },
  { src: 'pegoli-antes', widths: DESK },
  { src: 'pegoli-mobile', widths: PHONE },
  // Seriart
  { src: 'seriart-hero', widths: DESK, crop: [0, 0, 2850, 1800] }, // sin la barra de scroll
  { src: 'seriart-cta', widths: DESK, crop: [180, 180, 2520, 970] },
  { src: 'seriart-mobile', widths: PHONE },
  // Fisioterapia Dénia
  { src: 'fisio-hero', widths: DESK },
  { src: 'fisio-tratamientos', widths: DESK },
  { src: 'fisio-proceso', widths: DESK },
  { src: 'fisio-mobile', widths: PHONE },
  // Beekery
  { src: 'beekery-hero', widths: [480, 960, 1440] },
  { src: 'beekery-agenda', widths: DESK },
  { src: 'beekery-mobile', widths: PHONE },
  // Apps propias (capturas con datos de prueba; PituViajes, capturas de su modo demostración)
  { src: 'app-entreno-inicio', widths: PHONE },
  { src: 'app-entreno-peso', widths: PHONE },
  { src: 'app-kalibra-plan', widths: PHONE },
  { src: 'app-kalibra-diario', widths: PHONE },
  { src: 'app-lacuenta-acceso', widths: PHONE },
  { src: 'app-pituviajes-mapa', ext: 'webp', widths: PHONE },
  { src: 'app-pituviajes-escritorio', ext: 'webp', widths: DESK },
  // Retrato sobre fondo blanco, en B/N; el recorte deja fuera el borde inferior.
  { src: 'retrato-alex', ext: 'jpg', out: 'alex-sivera', widths: [480, 780], crop: [40, 20, 783, 1060], gray: true },
];

for (const img of images) {
  let base = sharp(`${SRC}/${img.src}.${img.ext || "png"}`);
  if (img.crop) {
    const [left, top, width, height] = img.crop;
    base = base.extract({ left, top, width, height });
  }
  if (img.gray) base = base.grayscale().linear(1.12, -10);
  const master = await base.toBuffer();
  const meta = await sharp(master).metadata();
  const name = img.out || img.src;
  for (const w of img.widths) {
    const r = sharp(master).resize({ width: Math.min(w, meta.width), withoutEnlargement: true });
    await r.clone().avif({ quality: 56, effort: 5 }).toFile(`${OUT}/${name}-${w}.avif`);
    await r.clone().webp({ quality: 80 }).toFile(`${OUT}/${name}-${w}.webp`);
    await r.clone().flatten({ background: '#ffffff' }).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(`${OUT}/${name}-${w}.jpg`);
  }
  console.log(`${name}: ${meta.width}x${meta.height} → ${img.widths.join(', ')}`);
}

// Iconos de la web instalada (manifest.webmanifest) y de iOS, a partir de favicon.svg.
// «maskable»: Android recorta el icono con su propia forma, así que el dibujo va al 80 % sobre fondo lleno.
await mkdir('assets/icons', { recursive: true });
const favicon = await readFile('favicon.svg');
const iconos = [['icon-192', 192, 1], ['icon-512', 512, 1], ['icon-maskable-512', 512, 0.8], ['apple-touch-icon', 180, 0.9]];
for (const [nombre, lado, escala] of iconos) {
  const dibujo = await sharp(favicon, { density: Math.ceil(72 * (lado / 64) * escala) }).resize(Math.round(lado * escala)).toBuffer();
  // Fondo de tinta lleno: sin esquinas transparentes, que iOS y Android pintarían de blanco o negro.
  await sharp({ create: { width: lado, height: lado, channels: 4, background: '#151515' } })
    .composite([{ input: dibujo, gravity: 'center' }])
    .png()
    .toFile(`assets/icons/${nombre}.png`);
  console.log(`icono ${nombre}: ${lado}px`);
}
