/* ============================================================
   La Belle Créole — Proposition 3 · Storytelling immersif
   script.js — Vanilla JS, no dependencies
   ============================================================ */

(function () {
  'use strict';

  /* ---- CONSTANTS ---- */
  var WHATSAPP_NUMBER = '590690000000';
  var CONTACT_EMAIL   = 'contact@labellecreole-guadeloupe.com';

  /* ---- UTILS ---- */

  /**
   * Format a date string (YYYY-MM-DD) to a French human-readable date.
   * @param {string} dateStr
   * @returns {string}
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    var date = new Date(dateStr + 'T12:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Basic email validation.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Get trimmed value of an element by id.
   * @param {string} id
   * @returns {string}
   */
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  /* ---- FORM ERROR HELPERS ---- */

  /**
   * Show a validation error under a form field.
   * @param {HTMLElement} field
   * @param {string} message
   */
  function showFieldError(field, message) {
    if (!field) return;
    field.setAttribute('aria-invalid', 'true');
    var prev = field.parentNode.querySelector('.form__error');
    if (prev) prev.remove();
    var err = document.createElement('span');
    err.className = 'form__error';
    err.setAttribute('role', 'alert');
    err.textContent = message;
    field.parentNode.appendChild(err);
    field.focus();
  }

  /**
   * Clear all validation errors from a form.
   * @param {HTMLFormElement} form
   */
  function clearErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.form__error').forEach(function (el) {
      el.remove();
    });
  }

  /* ============================================================
     NAV SCROLL STATE
     ============================================================ */
  var nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ============================================================
     BURGER MENU — mobile toggle
     ============================================================ */
  var burgerBtn = document.getElementById('burgerBtn');
  var navLinks  = document.getElementById('navLinks');

  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      burgerBtn.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (nav && !nav.contains(e.target) && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
        burgerBtn.focus();
      }
    });
  }

  /* ============================================================
     SMOOTH SCROLL for anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = nav ? nav.offsetHeight : 72;
        var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     INTERSECTION OBSERVER — .reveal elements
     Fade + translateY animation. Respects prefers-reduced-motion.
     ============================================================ */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Reduced motion or no IntersectionObserver: show everything immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ============================================================
     INTERSECTION OBSERVER — scroll-driven accent color
     Updates --current-accent on body when a section becomes >50% visible.
     The sticky nav CTA button background transitions with this value.
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var accentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var color = entry.target.getAttribute('data-section-color');
          if (color) {
            document.body.style.setProperty('--current-accent', color);
          }
        }
      });
    }, {
      threshold: 0.5
    });

    document.querySelectorAll('[data-section-color]').forEach(function (section) {
      accentObserver.observe(section);
    });
  }

  /* ============================================================
     "DEMANDER À RÉSERVER" card buttons
     Pre-fills the logement dropdown, scrolls to the reservation form.
     ============================================================ */
  document.querySelectorAll('.js-reserve').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var logement = this.getAttribute('data-logement');
      var waSelect = document.getElementById('wa-logement');

      // Pre-fill dropdown
      if (waSelect && logement) {
        var matched = false;
        Array.prototype.forEach.call(waSelect.options, function (opt) {
          if (opt.value === logement) {
            waSelect.value = logement;
            matched = true;
          }
        });
        if (!matched) {
          // Fallback: partial match
          Array.prototype.forEach.call(waSelect.options, function (opt) {
            if (opt.value.toLowerCase().indexOf(logement.toLowerCase()) !== -1) {
              waSelect.value = opt.value;
            }
          });
        }
      }

      // Scroll to reservation section
      var reservationSection = document.getElementById('reservation');
      if (reservationSection) {
        var navHeight = nav ? nav.offsetHeight : 72;
        var top = reservationSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (waSelect) {
          setTimeout(function () { waSelect.focus(); }, 700);
        }
      }
    });
  });

  /* ============================================================
     WHATSAPP FORM — builds wa.me link with pre-filled message
     ============================================================ */
  var waForm = document.getElementById('waForm');
  if (waForm) {
    waForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(waForm);

      var prenom    = val('wa-prenom');
      var nom       = val('wa-nom');
      var tel       = val('wa-tel');
      var logement  = val('wa-logement');
      var arrivee   = val('wa-arrivee');
      var depart    = val('wa-depart');
      var personnes = val('wa-personnes');
      var message   = val('wa-message');

      // Validation
      var ok = true;
      if (!prenom) {
        showFieldError(document.getElementById('wa-prenom'), 'Veuillez indiquer votre prénom.');
        ok = false;
      }
      if (ok && !nom) {
        showFieldError(document.getElementById('wa-nom'), 'Veuillez indiquer votre nom.');
        ok = false;
      }
      if (ok && !tel) {
        showFieldError(document.getElementById('wa-tel'), 'Veuillez indiquer votre numéro de téléphone.');
        ok = false;
      }
      if (ok && !arrivee) {
        showFieldError(document.getElementById('wa-arrivee'), "Veuillez sélectionner une date d'arrivée.");
        ok = false;
      }
      if (ok && !depart) {
        showFieldError(document.getElementById('wa-depart'), 'Veuillez sélectionner une date de départ.');
        ok = false;
      }
      if (ok && arrivee && depart && new Date(depart) <= new Date(arrivee)) {
        showFieldError(document.getElementById('wa-depart'), "La date de départ doit être après la date d'arrivée.");
        ok = false;
      }
      if (ok && !personnes) {
        showFieldError(document.getElementById('wa-personnes'), 'Veuillez indiquer le nombre de personnes.');
        ok = false;
      }
      if (!ok) return;

      // Build pre-filled WhatsApp message
      var lines = [
        'Bonjour,',
        '',
        'Je souhaite faire une demande de réservation pour *La Belle Créole* à Sainte-Anne, Guadeloupe.',
        '',
        '*Logement souhaité :* ' + logement,
        '*Arrivée :* '            + formatDate(arrivee),
        '*Départ :* '             + formatDate(depart),
        '*Nombre de personnes :* '+ personnes,
        '*Nom :* '                + prenom + ' ' + nom,
        '*Téléphone :* '          + tel
      ];
      if (message) {
        lines.push('');
        lines.push('*Message :* ' + message);
      }
      lines.push('');
      lines.push('Merci !');

      var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ============================================================
     MAILTO / EMAIL FORM
     ============================================================ */
  var emailForm = document.getElementById('emailForm');
  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(emailForm);

      var nom     = val('em-nom');
      var email   = val('em-email');
      var message = val('em-message');

      var ok = true;
      if (!nom) {
        showFieldError(document.getElementById('em-nom'), 'Veuillez indiquer votre nom.');
        ok = false;
      }
      if (ok && (!email || !isValidEmail(email))) {
        showFieldError(document.getElementById('em-email'), 'Veuillez entrer une adresse email valide.');
        ok = false;
      }
      if (ok && !message) {
        showFieldError(document.getElementById('em-message'), 'Veuillez écrire votre message.');
        ok = false;
      }
      if (!ok) return;

      var body = [
        'Bonjour,',
        '',
        message,
        '',
        'Cordialement,',
        nom
      ].join('\n');

      var mailtoUrl = 'mailto:' + CONTACT_EMAIL
        + '?subject=' + encodeURIComponent('[La Belle Créole] Message de ' + nom)
        + '&body='    + encodeURIComponent(body);

      window.location.href = mailtoUrl;
    });
  }

})();
