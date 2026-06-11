/* ═══════════════════════════════════════════════════════════
   LA BELLE CRÉOLE — Proposition 1 : script.js
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Helper: format date string (YYYY-MM-DD → DD/MM/YYYY) ── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

/* ─── Helper: encode WhatsApp message text ───────────────── */
function encodeWhatsApp(text) {
  return encodeURIComponent(text);
}

/* ═══════════════════════════════════════════════════════════
   SMOOTH SCROLL — all anchor links
   ═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var href = this.getAttribute('href');
    if (href === '#' || href === '') return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    var navHeight = document.querySelector('.nav-wrapper')
      ? document.querySelector('.nav-wrapper').offsetHeight
      : 0;
    var targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════════════════
   MOBILE BURGER MENU
   ═══════════════════════════════════════════════════════════ */
(function () {
  var burger = document.getElementById('nav-burger');
  var navLinks = document.getElementById('nav-links');

  if (!burger || !navLinks) return;

  function openMenu() {
    navLinks.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleOutsideClick);
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.removeEventListener('keydown', handleEscape);
    document.removeEventListener('click', handleOutsideClick);
  }

  function toggleMenu() {
    var isOpen = navLinks.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeMenu();
      burger.focus();
    }
  }

  function handleOutsideClick(e) {
    var navWrapper = document.querySelector('.nav-wrapper');
    if (navWrapper && !navWrapper.contains(e.target)) {
      closeMenu();
    }
  }

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — .reveal → .visible
   ═══════════════════════════════════════════════════════════ */
(function () {
  // Respect prefers-reduced-motion: mark all visible immediately
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    // Fallback for old browsers: show everything immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();

/* ═══════════════════════════════════════════════════════════
   WHATSAPP FORM SUBMIT
   ═══════════════════════════════════════════════════════════ */
(function () {
  var form = document.getElementById('form-whatsapp');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var logement = form.querySelector('#wa-logement').value;
    var arrival  = form.querySelector('#wa-arrival').value;
    var departure = form.querySelector('#wa-departure').value;
    var name     = form.querySelector('#wa-name').value.trim();
    var phone    = form.querySelector('#wa-phone').value.trim();
    var message  = form.querySelector('#wa-message').value.trim();

    // Basic validation
    if (!name) {
      form.querySelector('#wa-name').focus();
      return;
    }

    var logementText = logement || 'Pas de préférence';
    var arrivalText  = arrival   ? formatDate(arrival)   : 'non précisée';
    var departText   = departure ? formatDate(departure) : 'non précisée';

    var waText = 'Bonjour, je souhaite réserver ' + logementText
      + ' du ' + arrivalText
      + ' au ' + departText
      + '. Mon nom : ' + name
      + (phone    ? '. Téléphone : ' + phone : '')
      + (message  ? '. ' + message : '')
      + '. Merci !';

    var url = 'https://wa.me/590690000000?text=' + encodeWhatsApp(waText);
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();

/* ═══════════════════════════════════════════════════════════
   EMAIL CONTACT FORM SUBMIT
   ═══════════════════════════════════════════════════════════ */
(function () {
  var form = document.getElementById('form-email');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name     = form.querySelector('#em-name').value.trim();
    var email    = form.querySelector('#em-email').value.trim();
    var subject  = form.querySelector('#em-subject').value.trim();
    var logement = form.querySelector('#em-logement').value;
    var message  = form.querySelector('#em-message').value.trim();

    // Basic validation
    if (!name || !email) {
      if (!name) form.querySelector('#em-name').focus();
      else form.querySelector('#em-email').focus();
      return;
    }

    var subjectText = subject || 'Contact depuis labellecreole-guadeloupe.com';

    var bodyLines = [];
    bodyLines.push('Bonjour,');
    bodyLines.push('');
    bodyLines.push('Voici mon message :');
    bodyLines.push('');
    if (message) bodyLines.push(message);
    bodyLines.push('');
    if (logement) bodyLines.push('Logement concerné : ' + logement);
    bodyLines.push('');
    bodyLines.push('Nom : ' + name);
    bodyLines.push('Email de réponse : ' + email);
    bodyLines.push('');
    bodyLines.push('Cordialement,');
    bodyLines.push(name);

    var body = bodyLines.join('\n');

    var mailto = 'mailto:contact@labellecreole-guadeloupe.com'
      + '?subject=' + encodeURIComponent(subjectText)
      + '&body='    + encodeURIComponent(body);

    window.location.href = mailto;
  });
})();

/* ═══════════════════════════════════════════════════════════
   CARD "DEMANDER À RÉSERVER" BUTTONS
   Scroll to #contact and pre-fill the logement dropdown
   ═══════════════════════════════════════════════════════════ */
(function () {
  var reserveButtons = document.querySelectorAll('.btn--reserve');
  var contactSection = document.getElementById('contact');
  var waSelect = document.getElementById('wa-logement');
  var navWrapper = document.querySelector('.nav-wrapper');

  reserveButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var logement = btn.getAttribute('data-logement') || '';

      // Pre-fill WhatsApp dropdown
      if (waSelect && logement) {
        waSelect.value = logement;
      }

      // Scroll to contact section
      if (contactSection) {
        var navHeight = navWrapper ? navWrapper.offsetHeight : 0;
        var targetTop = contactSection.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });

        // After scroll, focus first visible field
        setTimeout(function () {
          var firstField = contactSection.querySelector('#wa-arrival');
          if (firstField) firstField.focus();
        }, 600);
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   FOOTER — Dynamic year
   ═══════════════════════════════════════════════════════════ */
(function () {
  var yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
