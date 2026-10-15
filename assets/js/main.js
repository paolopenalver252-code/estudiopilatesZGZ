// Estudio Pilates ZGZ — interacción mínima: menú, cabecera, barra móvil,
// revelado suave y formulario que prepara el mensaje para WhatsApp o correo.
(() => {
  const PHONE = '34602091517';
  const EMAIL = 'info@estudiopilateszgz.com';

  /* ---------- Cabecera al hacer scroll ---------- */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const label = toggle.querySelector('.menu-toggle__label');
  const mq = window.matchMedia('(max-width: 959px)');

  const setMenu = (open, { focusToggle = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Cerrar' : 'Menú';
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-locked', open);
    if (open) menu.querySelector('a')?.focus();
    else if (focusToggle) toggle.focus();
  };

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a') && mq.matches) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, { focusToggle: true });
  });
  // Mantiene el foco dentro del menú abierto
  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !menu.classList.contains('is-open')) return;
    const items = [toggle, ...menu.querySelectorAll('a')];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === menu.querySelector('a')) { e.preventDefault(); toggle.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  mq.addEventListener('change', () => setMenu(false));

  /* ---------- Sección activa en la navegación ---------- */
  const navLinks = [...document.querySelectorAll('.nav__list a[href^="#"]')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Barra de contacto fija (móvil) ---------- */
  const bar = document.querySelector('[data-mobile-bar]');
  const hero = document.querySelector('.hero');
  const contact = document.querySelector('#contacto');
  const footer = document.querySelector('.site-footer');
  if (bar && 'IntersectionObserver' in window) {
    let heroVisible = true;
    let endVisible = false;
    const update = () => {
      const show = !heroVisible && !endVisible;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', String(!show));
      bar.querySelectorAll('a').forEach((a) => (show ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
    };
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
    const ends = new Set();
    const endObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? ends.add(e.target) : ends.delete(e.target)));
      endVisible = ends.size > 0;
      update();
    }, { rootMargin: '0px 0px -30% 0px' });
    endObserver.observe(contact);
    endObserver.observe(footer);
  }

  /* ---------- Revelado suave ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Formulario → WhatsApp / correo ---------- */
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const errorsBox = form.querySelector('[data-form-errors]');
  const statusBox = form.querySelector('[data-form-status]');
  const nameInput = form.elements.nombre;
  const interestFieldset = form.querySelector('input[name="interes"]').closest('fieldset');

  const showFieldError = (field, errorId, show) => {
    const err = document.getElementById(errorId);
    err.hidden = !show;
    if (field.tagName === 'FIELDSET') {
      field.classList.toggle('has-error', show);
      field.querySelectorAll('input').forEach((i) => i.setAttribute('aria-invalid', String(show)));
    } else {
      field.setAttribute('aria-invalid', String(show));
    }
  };

  const validate = () => {
    const problems = [];
    const name = nameInput.value.trim();
    const interest = form.elements.interes.value;
    showFieldError(nameInput, 'f-nombre-error', !name);
    if (!name) problems.push({ id: 'f-nombre', text: 'Falta tu nombre.' });
    showFieldError(interestFieldset, 'f-interes-error', !interest);
    if (!interest) problems.push({ id: form.querySelector('input[name="interes"]').id || null, text: 'Elige qué te interesa.', el: form.querySelector('input[name="interes"]') });
    return problems;
  };

  const buildMessage = () => {
    const f = form.elements;
    const lines = [`Hola, soy ${f.nombre.value.trim()}. Me gustaría ${f.interes.value} en Estudio Pilates ZGZ.`];
    if (f.experiencia.value) lines.push(`Experiencia: ${f.experiencia.value}.`);
    if (f.horario.value) lines.push(`Horario que prefiero: ${f.horario.value.toLowerCase()}.`);
    const msg = f.mensaje.value.trim();
    if (msg) lines.push('', msg);
    return lines.join('\n');
  };

  const renderErrors = (problems) => {
    if (!problems.length) { errorsBox.hidden = true; errorsBox.innerHTML = ''; return; }
    errorsBox.hidden = false;
    errorsBox.innerHTML = `<strong>Revisa ${problems.length === 1 ? 'este campo' : 'estos campos'}:</strong><ul>${problems.map((p) => `<li>${p.text}</li>`).join('')}</ul>`;
    const first = problems[0];
    (first.el || document.getElementById(first.id)).focus();
  };

  const showStatus = (html) => { statusBox.hidden = false; statusBox.innerHTML = html; };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const problems = validate();
    renderErrors(problems);
    if (problems.length) return;
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(buildMessage())}`;
    // window.open con noopener devuelve null siempre: se ofrece también el enlace directo
    window.open(url, '_blank', 'noopener');
    showStatus(`Hemos abierto WhatsApp con tu mensaje escrito: solo falta pulsar enviar. ¿No se ha abierto? <a href="${url}" target="_blank" rel="noopener">Ábrelo aquí</a>.`);
  });

  form.querySelector('[data-email-alt]').addEventListener('click', () => {
    const problems = validate();
    renderErrors(problems);
    if (problems.length) return;
    const subject = 'Consulta desde la web';
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`;
    window.location.href = href;
    showStatus(`Hemos preparado el mensaje en tu aplicación de correo. Si no se ha abierto, escribe directamente a <a href="mailto:${EMAIL}">${EMAIL}</a>.`);
  });

  // Limpia el error en cuanto el campo se corrige
  nameInput.addEventListener('input', () => { if (nameInput.value.trim()) showFieldError(nameInput, 'f-nombre-error', false); });
  interestFieldset.addEventListener('change', () => showFieldError(interestFieldset, 'f-interes-error', false));
})();
