/* ═══════════════════════════════════════════════════════════════
   La Belle Créole — Proposition 2 : Mosaïque botanique
   script.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── CONFIG ─────────────────────────────────────────────────── */
const WHATSAPP_NUMBER = '590690000000';
const CONTACT_EMAIL   = 'contact@labellecreole-guadeloupe.com';

/* ─── HELPERS ────────────────────────────────────────────────── */
/**
 * Format a date string (YYYY-MM-DD) to a readable French format.
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date, e.g. "15 juillet 2025"
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
}

/* ─── BURGER MENU ────────────────────────────────────────────── */
(function initBurger() {
  const burger  = document.getElementById('burger');
  const nav     = document.querySelector('nav[aria-label="Navigation principale"]');
  const navList = document.getElementById('nav-links');

  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
    nav.classList.toggle('nav-open', !isOpen);
  });

  // Close on nav link click
  if (navList) {
    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        nav.classList.remove('nav-open');
      });
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      nav.classList.remove('nav-open');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      nav.classList.remove('nav-open');
      burger.focus();
    }
  });
})();

/* ─── WHATSAPP FORM ──────────────────────────────────────────── */
(function initWhatsAppForm() {
  const form = document.getElementById('form-whatsapp');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const prenom   = form.querySelector('#wa-prenom').value.trim();
    const nom      = form.querySelector('#wa-nom').value.trim();
    const tel      = form.querySelector('#wa-tel').value.trim();
    const logement = form.querySelector('#wa-logement').value;
    const arrivee  = form.querySelector('#wa-arrivee').value;
    const depart   = form.querySelector('#wa-depart').value;
    const personnes = form.querySelector('#wa-personnes').value;
    const message  = form.querySelector('#wa-message').value.trim();

    // Basic validation
    if (!prenom || !nom || !tel || !arrivee || !depart || !personnes) {
      alert('Merci de remplir tous les champs obligatoires (*).');
      return;
    }

    const lines = [
      `Bonjour, je souhaite réserver un logement à La Belle Créole.`,
      ``,
      `Nom : ${prenom} ${nom}`,
      `Téléphone : ${tel}`,
      `Logement souhaité : ${logement}`,
      `Arrivée : ${formatDate(arrivee)}`,
      `Départ : ${formatDate(depart)}`,
      `Nombre de personnes : ${personnes}`,
    ];

    if (message) {
      lines.push(``, `Message : ${message}`);
    }

    const text = encodeURIComponent(lines.join('\n'));
    const url  = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();

/* ─── CONTACT (MAILTO) FORM ──────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('form-contact');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nom     = form.querySelector('#ct-nom').value.trim();
    const email   = form.querySelector('#ct-email').value.trim();
    const message = form.querySelector('#ct-message').value.trim();

    if (!nom || !email || !message) {
      alert('Merci de remplir tous les champs obligatoires (*).');
      return;
    }

    const subject = encodeURIComponent(`La Belle Créole — Message de ${nom}`);
    const body    = encodeURIComponent(
      `Nom : ${nom}\nEmail : ${email}\n\n${message}`
    );
    const href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = href;
  });
})();

/* ─── CARD "DEMANDER À RÉSERVER" PRE-FILL ────────────────────── */
(function initCardButtons() {
  const buttons  = document.querySelectorAll('.btn-card[data-logement]');
  const select   = document.getElementById('wa-logement');
  const section  = document.getElementById('reservation');

  if (!buttons.length || !select || !section) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const logement = btn.getAttribute('data-logement');

      // Match option value
      const option = Array.from(select.options).find(opt =>
        opt.value === logement
      );

      if (option) {
        select.value = logement;
      }

      // Smooth scroll to reservation section
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Focus the logement select after scroll
      setTimeout(() => {
        select.focus();
      }, 600);
    });
  });
})();

/* ─── INTERSECTION OBSERVER (REVEAL) ────────────────────────── */
(function initReveal() {
  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Make all reveals visible immediately without animation
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach((el, i) => {
    // Stagger siblings in the same parent
    const siblings = el.parentElement
      ? Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'))
      : [];
    const idx = siblings.indexOf(el);
    if (idx > 0) {
      el.style.transitionDelay = `${idx * 0.08}s`;
    }
    observer.observe(el);
  });
})();
