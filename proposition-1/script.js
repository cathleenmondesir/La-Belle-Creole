/**
 * La Belle Créole — Proposition 1
 * Vanilla JS: navigation, forms, scroll reveal.
 * No frameworks, no external scripts.
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */

const WHATSAPP_NUMBER = '590690000000';
const CONTACT_EMAIL   = 'contact@labellecreole-guadeloupe.com';

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */

/**
 * Format a date string (YYYY-MM-DD from <input type="date">)
 * into a human-readable French string — e.g. "14 juillet 2026".
 *
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  return `${day} ${months[month - 1]} ${year}`;
}

/* ═══════════════════════════════════════════════════════
   FOOTER — current year
═══════════════════════════════════════════════════════ */

(function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}());

/* ═══════════════════════════════════════════════════════
   NAVIGATION — sticky tint + burger menu
═══════════════════════════════════════════════════════ */

(function initNav() {
  const navWrapper = document.querySelector('.nav-wrapper');
  const burger     = document.getElementById('nav-burger');
  const navLinks   = document.getElementById('nav-links');

  /* Scroll-based tint ---------------------------------- */
  if (navWrapper) {
    const tick = () =>
      navWrapper.classList.toggle('is-scrolled', window.scrollY > 60);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  if (!burger || !navLinks) return;

  /* Open / close helper -------------------------------- */
  function openMenu(open) {
    navLinks.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('is-open');
    openMenu(!isOpen);
  });

  /* Close on any nav-link click ------------------------ */
  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => openMenu(false));
  });

  /* Close on outside click ----------------------------- */
  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('is-open') &&
      !navLinks.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      openMenu(false);
    }
  });

  /* Close on Escape ------------------------------------ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      openMenu(false);
      burger.focus();
    }
  });
}());

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════════════════════════ */

(function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const elements = document.querySelectorAll('.reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}());

/* ═══════════════════════════════════════════════════════
   CARD RESERVE BUTTONS — pre-fill logement + scroll to form
═══════════════════════════════════════════════════════ */

(function initCardReserveButtons() {
  const waLogementSelect = document.getElementById('wa-logement');
  const contactSection   = document.getElementById('contact');
  const whatsappForm     = document.getElementById('form-whatsapp');

  document.querySelectorAll('.btn--reserve').forEach((btn) => {
    btn.addEventListener('click', () => {
      const logementValue = btn.dataset.logement || '';

      /* Pre-fill the WhatsApp form logement dropdown */
      if (waLogementSelect && logementValue) {
        // Try exact match first, then partial
        const exactOpt = Array.from(waLogementSelect.options).find(
          (o) => o.value === logementValue
        );
        const partialOpt = !exactOpt
          ? Array.from(waLogementSelect.options).find(
              (o) =>
                o.value.toLowerCase().includes(logementValue.toLowerCase()) ||
                logementValue.toLowerCase().includes(o.value.toLowerCase())
            )
          : null;

        if (exactOpt) {
          waLogementSelect.value = exactOpt.value;
        } else if (partialOpt) {
          waLogementSelect.value = partialOpt.value;
        }
      }

      /* Scroll to contact section */
      const scrollTarget = contactSection || whatsappForm;
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      /* Focus first input after scroll animation */
      if (whatsappForm) {
        setTimeout(() => {
          const firstInput = whatsappForm.querySelector('input, select, textarea');
          if (firstInput) firstInput.focus({ preventScroll: true });
        }, 750);
      }
    });
  });
}());

/* ═══════════════════════════════════════════════════════
   WHATSAPP FORM — build wa.me deep link
═══════════════════════════════════════════════════════ */

(function initWhatsAppForm() {
  const form = document.getElementById('form-whatsapp');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const logement  = form.querySelector('#wa-logement')?.value        || '';
    const arrival   = form.querySelector('#wa-arrival')?.value         || '';
    const departure = form.querySelector('#wa-departure')?.value       || '';
    const name      = (form.querySelector('#wa-name')?.value     || '').trim();
    const phone     = (form.querySelector('#wa-phone')?.value    || '').trim();
    const message   = (form.querySelector('#wa-message')?.value  || '').trim();

    /* Validate required fields */
    const missing = [];
    if (!name)      missing.push('votre nom');
    if (!arrival)   missing.push("la date d'arrivée");
    if (!departure) missing.push('la date de départ');

    if (missing.length) {
      alert(`Merci de renseigner : ${missing.join(', ')}.`);
      return;
    }

    /* Build pre-filled message */
    const bodyLines = [
      'Bonjour,',
      'Je souhaite réserver à La Belle Créole.',
      '',
      `Nom       : ${name}`,
      logement   ? `Logement  : ${logement}`           : null,
      `Arrivée   : ${formatDate(arrival)}`,
      `Départ    : ${formatDate(departure)}`,
      phone      ? `Téléphone : ${phone}`              : null,
      message    ? `\nMessage   : ${message}`           : null,
    ]
      .filter((l) => l !== null)
      .join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(bodyLines)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}());

/* ═══════════════════════════════════════════════════════
   MAILTO CONTACT FORM — build mailto deep link
═══════════════════════════════════════════════════════ */

(function initEmailForm() {
  const form = document.getElementById('form-email');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name     = (form.querySelector('#em-name')?.value    || '').trim();
    const email    = (form.querySelector('#em-email')?.value   || '').trim();
    const subject  = (form.querySelector('#em-subject')?.value || '').trim()
                     || 'Question — La Belle Créole';
    const logement = (form.querySelector('#em-logement')?.value || '');
    const message  = (form.querySelector('#em-message')?.value  || '').trim();

    /* Validate */
    const missing = [];
    if (!name)    missing.push('votre nom');
    if (!email)   missing.push('votre adresse email');
    if (!message) missing.push('un message');

    if (missing.length) {
      alert(`Merci de renseigner : ${missing.join(', ')}.`);
      return;
    }

    /* Build email body */
    const bodyLines = [
      'Bonjour,',
      '',
      `Nom      : ${name}`,
      `Email    : ${email}`,
      logement  ? `Logement : ${logement}` : null,
      '',
      message,
      '',
      '---',
      'Message envoyé depuis labellecreole-guadeloupe.com',
    ]
      .filter((l) => l !== null)
      .join('\n');

    const mailto =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines)}`;

    window.location.href = mailto;
  });
}());
