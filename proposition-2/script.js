/* ═══════════════════════════════════════════════════════════════
   La Belle Créole — Proposition 2 : Mosaïque botanique
   script.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Constants ────────────────────────────────────────────────── */
const WHATSAPP_NUMBER = '590690000000';
const CONTACT_EMAIL   = 'contact@labellecreole-guadeloupe.com';

/* ── Helpers ──────────────────────────────────────────────────── */

/**
 * Format a date string (YYYY-MM-DD) to a locale-friendly French format.
 * @param {string} dateStr – ISO date string, e.g. "2025-08-15"
 * @returns {string} e.g. "15 août 2025"
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  // Build date in local time (avoid UTC off-by-one)
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('fr-FR', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
}

/**
 * Encode a plain string as a URI component safe for WhatsApp URLs.
 * @param {string} str
 * @returns {string}
 */
function encodeWA(str) {
  return encodeURIComponent(str);
}

/* ── Mobile burger menu ───────────────────────────────────────── */
(function initBurger() {
  const burger     = document.querySelector('.burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close mobile menu when a link inside it is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Close menu on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      mobileMenu.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      burger.focus();
    }
  });
})();

/* ── Smooth scroll for nav anchors ───────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#' || href === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
        10
      ) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── IntersectionObserver for .reveal ────────────────────────── */
(function initReveal() {
  // If reduced motion is preferred the CSS already makes .reveal instantly visible.
  // We still set .visible so any JS-dependent logic works.
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => {
    if (mediaQuery.matches) {
      // Immediately mark visible; no animation.
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });
})();

/* ── "Réserver" buttons on cards → scroll to #contact + prefill ─ */
(function initReserveButtons() {
  const navH = () =>
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
      10
    ) || 72;

  document.querySelectorAll('.btn-reserve').forEach(btn => {
    btn.addEventListener('click', () => {
      const logement = btn.dataset.logement || '';

      // Scroll to #contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const top = contactSection.getBoundingClientRect().top + window.scrollY - navH();
        window.scrollTo({ top, behavior: 'smooth' });
      }

      // Pre-fill WhatsApp form dropdown
      const waSelect = document.getElementById('wa-logement');
      if (waSelect && logement) {
        // Match option value to logement — try exact then partial
        const options = Array.from(waSelect.options);
        const exact = options.find(o => o.value === logement);
        if (exact) {
          waSelect.value = exact.value;
        } else {
          // Partial match: find option whose value includes the first word
          const keyword = logement.split(' ').pop(); // e.g. "Hibiscus"
          const partial = options.find(o => o.value.includes(keyword));
          if (partial) waSelect.value = partial.value;
        }
      }

      // Focus first empty required field in WA form
      setTimeout(() => {
        const waForm = document.getElementById('form-whatsapp');
        if (!waForm) return;
        const firstEmpty = waForm.querySelector('input:required:not([value])') ||
                           waForm.querySelector('input[required]');
        if (firstEmpty) firstEmpty.focus();
      }, 600);
    });
  });
})();

/* ── WhatsApp form submit ─────────────────────────────────────── */
(function initWhatsAppForm() {
  const form = document.getElementById('form-whatsapp');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const logement = form.querySelector('#wa-logement')?.value?.trim() || '';
    const arrivee  = form.querySelector('#wa-arrivee')?.value || '';
    const depart   = form.querySelector('#wa-depart')?.value || '';
    const nom      = form.querySelector('#wa-nom')?.value?.trim() || '';
    const tel      = form.querySelector('#wa-tel')?.value?.trim() || '';
    const msg      = form.querySelector('#wa-msg')?.value?.trim() || '';

    // Basic validation
    if (!logement) { focusWithError(form.querySelector('#wa-logement'), 'Veuillez choisir un logement.'); return; }
    if (!arrivee)  { focusWithError(form.querySelector('#wa-arrivee'),  'Veuillez indiquer une date d\'arrivée.'); return; }
    if (!depart)   { focusWithError(form.querySelector('#wa-depart'),   'Veuillez indiquer une date de départ.'); return; }
    if (!nom)      { focusWithError(form.querySelector('#wa-nom'),      'Veuillez indiquer votre nom.'); return; }

    const arriveeF = formatDate(arrivee);
    const departF  = formatDate(depart);

    const lines = [
      '🌺 *Demande de réservation — La Belle Créole*',
      '',
      `*Logement :* ${logement}`,
      `*Arrivée :* ${arriveeF}`,
      `*Départ :* ${departF}`,
      `*Nom :* ${nom}`,
    ];
    if (tel) lines.push(`*Téléphone :* ${tel}`);
    if (msg) lines.push(`*Message :* ${msg}`);
    lines.push('', '_Envoyé depuis labellecreole-guadeloupe.com_');

    const text = lines.join('\n');
    const url  = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeWA(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();

/* ── Mailto / email form submit ───────────────────────────────── */
(function initEmailForm() {
  const form = document.getElementById('form-email');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nom   = form.querySelector('#em-nom')?.value?.trim()  || '';
    const email = form.querySelector('#em-email')?.value?.trim() || '';
    const sujet = form.querySelector('#em-sujet')?.value?.trim() || 'Demande de renseignements — La Belle Créole';
    const msg   = form.querySelector('#em-msg')?.value?.trim()   || '';

    if (!nom)   { focusWithError(form.querySelector('#em-nom'),   'Veuillez indiquer votre nom.'); return; }
    if (!email) { focusWithError(form.querySelector('#em-email'), 'Veuillez indiquer votre e-mail.'); return; }
    if (!isValidEmail(email)) { focusWithError(form.querySelector('#em-email'), 'Adresse e-mail invalide.'); return; }
    if (!msg)   { focusWithError(form.querySelector('#em-msg'),   'Veuillez rédiger un message.'); return; }

    const body = [
      `Bonjour,`,
      ``,
      msg,
      ``,
      `---`,
      `Nom : ${nom}`,
      `E-mail : ${email}`,
    ].join('\n');

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  });
})();

/* ── Utilities ────────────────────────────────────────────────── */

/**
 * Basic email format check.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Focus an element and temporarily mark it as invalid (aria + visual cue).
 * Removes the error state after the user starts typing.
 * @param {HTMLElement|null} el
 * @param {string} message
 */
function focusWithError(el, message) {
  if (!el) return;
  el.focus();
  el.setAttribute('aria-invalid', 'true');

  // Show or update an inline error message
  let errEl = el.parentElement?.querySelector('.field-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error';
    errEl.setAttribute('role', 'alert');
    errEl.style.cssText = [
      'display:block',
      'margin-top:0.3rem',
      'font-size:0.75rem',
      'color:var(--hibiscus)',
      'font-family:var(--font-sans)',
    ].join(';');
    el.parentElement?.appendChild(errEl);
  }
  errEl.textContent = message;

  // Remove error state on input
  const clearError = () => {
    el.removeAttribute('aria-invalid');
    if (errEl) errEl.textContent = '';
    el.removeEventListener('input', clearError);
    el.removeEventListener('change', clearError);
  };
  el.addEventListener('input',  clearError);
  el.addEventListener('change', clearError);
}
