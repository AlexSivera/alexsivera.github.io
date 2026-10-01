/* Alex Sivera · comportamiento de la web. Sin dependencias.
   La página funciona sin JS: el CSS solo oculta o anima cuando <html> tiene la clase .js. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = 'IntersectionObserver' in window;

  /* ---------- Cabecera: filete al hacer scroll ---------- */
  var cab = document.querySelector('.cab');
  if (cab) {
    var marcarCab = function () { cab.classList.toggle('con-borde', window.scrollY > 8); };
    marcarCab();
    window.addEventListener('scroll', marcarCab, { passive: true });
  }

  /* ---------- Menú móvil (<dialog>) ---------- */
  var menu = document.getElementById('menu');
  var abrir = document.querySelector('[data-menu-abrir]');
  if (menu && abrir && typeof menu.showModal === 'function') {
    abrir.addEventListener('click', function () {
      menu.showModal();
      abrir.setAttribute('aria-expanded', 'true');
    });
    menu.addEventListener('close', function () {
      abrir.setAttribute('aria-expanded', 'false');
      abrir.focus();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('[data-menu-cerrar]') || e.target.closest('nav a')) menu.close();
    });
  } else if (abrir) {
    // Sin soporte de <dialog>: el botón lleva a la navegación del pie.
    abrir.addEventListener('click', function () { location.hash = 'pie'; });
  }

  /* ---------- Trazos a lápiz y apariciones: una sola vez al entrar en pantalla ---------- */
  var porDibujar = document.querySelectorAll('.trazo, .retrato, [data-aparece]');
  var marcar = function (el) { el.classList.add(el.hasAttribute('data-aparece') ? 'visto' : 'dibujado'); };
  if (!io || reduce) {
    porDibujar.forEach(marcar);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { marcar(en.target); obs.unobserve(en.target); }
      });
    // threshold 0: los bloques de proyecto miden más de una pantalla; con un 20 % tardaban en aparecer y dejaban huecos en blanco.
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    porDibujar.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Barra inferior en móvil: aparece tras la portada, se oculta en el contacto y el pie ---------- */
  var barra = document.querySelector('.barra-movil');
  var inicio = document.querySelector('[data-inicio]');
  var destinos = document.querySelectorAll('[data-destino]');
  if (barra && inicio && io) {
    var pasadoInicio = false;
    var enPantalla = [];
    var actualizar = function () { barra.classList.toggle('visible', pasadoInicio && enPantalla.length === 0); };
    new IntersectionObserver(function (e) {
      pasadoInicio = !e[0].isIntersecting && e[0].boundingClientRect.top < 0;
      actualizar();
    }).observe(inicio);
    var obsDestino = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var i = enPantalla.indexOf(en.target);
        if (en.isIntersecting && i < 0) enPantalla.push(en.target);
        if (!en.isIntersecting && i >= 0) enPantalla.splice(i, 1);
      });
      actualizar();
    });
    destinos.forEach(function (d) { obsDestino.observe(d); });
  }

  /* ---------- Capturas anotadas: marcador ↔ decisión ↔ rodeo a lápiz ---------- */
  document.querySelectorAll('[data-anotada]').forEach(function (fig) {
    var marcas = fig.querySelectorAll('.marca');
    var items = fig.querySelectorAll('.decisiones li');
    var conN = fig.querySelectorAll('[data-n]');   // marcadores, decisiones y rodeos
    var marco = fig.querySelector('.anotada-marco');
    var lienzo = fig.querySelector('.anotada-img');
    var activar = function (n, on) {
      conN.forEach(function (el) { if (el.dataset.n === n) el.classList.toggle('activa', on); });
    };
    // En móvil la captura se recorre deslizando: al elegir una decisión, se lleva su rodeo a la vista.
    var mostrar = function (n) {
      if (!marco || !lienzo || marco.scrollWidth <= marco.clientWidth) return;
      var rodeo = fig.querySelector('.rodeos [data-n="' + n + '"]');
      if (!rodeo) return;
      var r = rodeo.getBoundingClientRect(), l = lienzo.getBoundingClientRect();
      var centro = r.left - l.left + r.width / 2;
      marco.scrollTo({ left: centro - marco.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    };
    [].forEach.call(marcas, function (el) { enlazar(el, false); });
    [].forEach.call(items, function (el) { enlazar(el, true); });
    function enlazar(el, esDecision) {
      var n = el.dataset.n;
      el.addEventListener('mouseenter', function () { activar(n, true); });
      el.addEventListener('mouseleave', function () { activar(n, false); });
      el.addEventListener('focusin', function () { activar(n, true); if (esDecision) mostrar(n); });
      el.addEventListener('focusout', function () { activar(n, false); });
      if (esDecision) el.addEventListener('click', function () { activar(n, true); mostrar(n); });
    }
  });

  /* ---------- Formulario «Cuéntame tu negocio» ---------- */
  var form = document.querySelector('[data-carta]');
  if (form) {
    var estado = form.querySelector('.form-estado');
    var email = form.getAttribute('data-email');
    var clave = (form.getAttribute('data-web3forms') || '').trim();
    var boton = form.querySelector('button[type="submit"]');

    var campo = function (nombre) {
      var el = form.elements[nombre];
      return el ? String(el.value || '').trim() : '';
    };
    var avisar = function (texto, tipo) {
      estado.textContent = texto;
      estado.className = 'form-estado' + (tipo ? ' ' + tipo : '');
    };

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
        e.target.removeAttribute('aria-invalid');
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.botcheck && form.elements.botcheck.checked) return;

      // Validación con mensajes propios, en orden de lectura
      var invalidos = [].filter.call(form.elements, function (el) {
        return el.willValidate && el.name !== 'botcheck' && !el.checkValidity();
      });
      [].forEach.call(form.elements, function (el) { el.removeAttribute && el.removeAttribute('aria-invalid'); });
      if (invalidos.length) {
        invalidos.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); });
        var primero = invalidos[0];
        var faltan = invalidos.map(function (el) { return el.getAttribute('data-nombre') || el.name; });
        var msg = primero.type === 'email' && primero.value
          ? 'Revisa el email: parece que le falta algo.'
          : 'Falta completar: ' + faltan.join(', ') + '.';
        avisar(msg, 'error');
        primero.focus();
        return;
      }

      var nombre = campo('nombre'), negocio = campo('negocio'), lugar = campo('localidad');
      var objetivo = campo('objetivo'), web = campo('web'), correo = campo('email'), extra = campo('mensaje');
      var asunto = 'Web para ' + negocio + (lugar ? ' en ' + lugar : '') + ' · ' + nombre;
      var cuerpo = 'Hola, Alex. Me llamo ' + nombre + ' y tengo ' + negocio + (lugar ? ' en ' + lugar : '') + '.\n' +
        'Me gustaría que quien visite mi web ' + objetivo + '.\n' +
        'Mi web actual: ' + (web || 'todavía no tengo') + '.\n' +
        'Puedes escribirme a ' + correo + '.' +
        (extra ? '\n\n' + extra : '');

      if (clave) {
        // Envío real a través de Web3Forms (clave pública en data-web3forms)
        boton.disabled = true;
        avisar('Enviando…');
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: clave, subject: asunto, from_name: nombre, replyto: correo, botcheck: false,
            nombre: nombre, negocio: negocio, localidad: lugar, objetivo: objetivo,
            web: web || 'todavía no tengo', email: correo, mensaje: cuerpo
          })
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (!res.success) throw new Error(res.message);
          form.reset();
          avisar('Gracias, ' + nombre + '. Tu mensaje me ha llegado: te respondo yo, personalmente.', 'ok');
        }).catch(function () {
          avisar('No se ha podido enviar. Escríbeme directamente a ' + email + ' y te respondo igual.', 'error');
        }).then(function () { boton.disabled = false; });
        return;
      }

      // Sin clave configurada: se abre el correo con el mensaje ya redactado. No se finge un envío.
      window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
      avisar('Se ha abierto tu programa de correo con el mensaje escrito: solo falta darle a enviar. Si no se abre, escríbeme a ' + email + '.', 'ok');
    });
  }

  /* ---------- Año en el pie ---------- */
  document.querySelectorAll('[data-anio]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
