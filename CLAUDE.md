# CLAUDE.md

Web personal y portfolio de **Alex Sivera** (diseño y desarrollo web para negocios, Dénia). Sitio estático HTML/CSS/JS vanilla, **sin build ni dependencias en runtime**. Solo en español.

Antes de tocar copy o diseño, lee `docs/positioning.md` (qué se puede afirmar y qué no) y `docs/design-direction.md` (concepto «Anotado»). `docs/qa-report.md` lista lo pendiente.

## Comandos

```bash
npm run dev      # http://localhost:4180 (scripts/serve.mjs, sin caché, bloquea _src/docs/scripts)
npm run check    # enlaces, anclas, ids, alt, width/height, un h1, aria, JSON-LD
npm run images   # regenera assets/img/ desde _src/img/ (devDependency sharp)
node scripts/set-domain.mjs https://dominio.es   # al publicar: URLs absolutas + sitemap + robots
```

QA visual con Playwright contra `npm run dev` a 1440, 768 y 390 px.

## Arquitectura

- Varias páginas (ver `docs/architecture.md`): `index.html` (resumen), `proyectos/` (índice de webs + apps propias), `proyectos/<slug>/` (un caso por proyecto, misma estructura), `como-trabajo/`, `sobre-mi/`, `contacto/` (formulario + preguntas), `privacidad/` y `404.html`. Cabecera, menú (`<dialog>`) y pie están **duplicados a mano** en cada página: un cambio ahí va en todas. `404.html` usa rutas absolutas; el resto, relativas.
- Publicada en GitHub Pages (repo `AlexSivera/alexsivera.github.io`, rama `main`): `https://alexsivera.github.io/`. Publicar = commit + push.
- `assets/css/styles.css`: una hoja, tokens en `:root`, clases en español según el concepto (`nota`, `trazo`, `lamina`, `muestrario`, `anotada`, `marca`, `hoja`, `carta`, `hueco`).
- Estructura texto + margen: un `.par` agrupa un bloque y su `.nota`; a ≥70em la nota pasa a la columna de margen.
- Capturas anotadas: `.anotada[data-anotada]` > `.anotada-marco` > `.anotada-img` con `.marca[data-n]` (`--x/--y`, % de la imagen), un `svg.rodeos` con un círculo a lápiz `g[data-n]` por decisión y `.decisiones li[data-n]`. `main.js` activa marcador, decisión y rodeo a la vez; en móvil la captura se desliza y se centra en el rodeo elegido. Los rodeos y las posiciones de los marcadores se generaron con un script a partir de cajas medidas sobre cada captura: si cambia una captura, hay que volver a medirlas. En cada caso, la captura de portada anotada va en la cabecera.
- `manifest.webmanifest` + `assets/icons/` (generados desde `favicon.svg` al final de `scripts/images.mjs`). Sin service worker a propósito: en GitHub Pages serviría versiones viejas.
- `assets/js/main.js` (IIFE): no crea elementos, solo añade clases; el CSS solo oculta o anima si `<html>` tiene `.js`, así que la web funciona sin JS.
- Formulario-frase (`contacto/`): Web3Forms con la clave pública en `data-web3forms` y campo trampa `botcheck`; sin clave o sin JS, `mailto:` redactado. Nunca simular envíos; para probar, interceptar la petición en Playwright en vez de enviar.
- SEO: URLs absolutas con `https://alexsivera.github.io` (puestas con `set-domain.mjs`). Si cambia el dominio, volver a ejecutarlo.
- `docs/`, `_src/` y `.claude/` están en `.gitignore`: no se publican.

## Reglas del proyecto

- **No inventar**: clientes, testimonios, cifras, años de experiencia, precios, plazos. Seriart es el único encargo real; El Pegolí, Fisioterapia Dénia y Beekery son estudios propios sin encargo.
- **Sin etiquetas de estado** (decisión de Alex, 30/09/2026): no se muestran chips «Propuesta / Encargo real / Producto propio» ni frases del tipo «no son encargos» o «sin encargo», porque restan. Pero **nunca se afirma ni se insinúa que un estudio fue un encargo** (nada de «cliente», «me encargaron», resultados…). En la cabecera de cada caso de un negocio real se mantiene una sola línea discreta, `.aviso`: «Estudio de rediseño independiente, sin relación comercial con…». Cuando haya encargos reales, se podrán destacar como tales.
- Apps: sección «Aplicaciones». La de entrenamiento va sin el nombre Machoke ni el personaje (marca de Nintendo). LaCuenta solo aparece con su pantalla de acceso, porque sus datos son reales y privados.
- **Imágenes**: solo capturas propias de los proyectos (Playwright, 2× escritorio / 3× móvil). No mostrar fotos de terceros sin licencia: en Beekery se recortó la foto del pan; en Seriart se usa el fotograma del vídeo propio del taller. Créditos CC visibles en el caso El Pegolí.
- Paleta papel/tinta/azul lápiz; sin degradados decorativos ni sombras difusas. El azul lápiz es para notas, trazos, enlaces y la hoja de contacto.
- Tuteo peninsular. Copy concreto y en primera persona.
- Mantener AA de contraste, foco visible, `prefers-reduced-motion` y objetivos táctiles ≥ 38 px.
