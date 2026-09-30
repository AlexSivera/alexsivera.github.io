# Alex Sivera · web personal y portfolio

Web estática (HTML, CSS y JavaScript sin dependencias). No hay que compilar nada: se sube tal cual a cualquier hosting.

```
index.html                     Inicio (resumen de todo)
proyectos/index.html           Todos los proyectos: webs para negocios y apps propias
proyectos/<nombre>/index.html  Un caso por proyecto (El Pegolí, Seriart, Fisioterapia Dénia, Beekery)
como-trabajo/  sobre-mi/       Proceso y presentación
contacto/index.html            Formulario «Cuéntame tu negocio» y preguntas frecuentes
privacidad/index.html          Política de privacidad
404.html                       Página de error
assets/css/styles.css          Todo el diseño (colores y tipografías al principio, en :root)
assets/js/main.js              Menú móvil, barra inferior, trazos a lápiz, capturas anotadas, formulario
assets/img/                    Imágenes optimizadas (se generan, no se editan a mano)
assets/fonts/                  Schibsted Grotesk y Source Serif 4 (licencia OFL)
_src/img/                      Originales de las imágenes (no se publican)
docs/                          Posicionamiento, dirección creativa, arquitectura e informe de QA
scripts/                       Servidor local, optimizador de imágenes, comprobación y dominio
```

## Verla en tu ordenador

```bash
npm run dev
```

Abre <http://localhost:4180>. (Con doble clic en `index.html` también se ve, pero los enlaces entre páginas funcionan mejor con el servidor.)

## Cambiar una imagen

1. Copia el original a `_src/img/` con el mismo nombre (por ejemplo `retrato-alex.png`).
2. Instala las herramientas una sola vez con `npm install` y ejecuta:

```bash
npm run images
```

## Comprobar que no hay enlaces rotos

```bash
npm run check
```

## Publicar cambios

La web está en GitHub Pages: <https://alexsivera.github.io/> (repositorio `AlexSivera/alexsivera.github.io`). Cada vez que subes cambios a la rama `main`, GitHub la actualiza sola en uno o dos minutos. Desde esta carpeta:

```bash
git add -A
```

```bash
git commit -m "Describe aquí el cambio"
```

```bash
git push
```

`docs/`, `_src/` y `.claude/` **no se suben** (están en `.gitignore`): son documentos internos y originales. Guárdalos tú en local o en una copia de seguridad.

## Cuando compres un dominio

1. En GitHub, en el repositorio: *Settings → Pages → Custom domain*. Escribe tu dominio y configura los DNS como te indique.
2. Ejecuta con tu dominio real y sube los cambios:

```bash
node scripts/set-domain.mjs https://tudominio.es
```

## Formulario

Los mensajes llegan a alexsivera.1999@gmail.com a través de Web3Forms. La clave está en `data-web3forms` de `contacto/index.html`. Si se borra, el formulario abre el programa de correo del visitante con el mensaje ya escrito.

La lista completa de pendientes está en `docs/qa-report.md`.
