/* ============================================================
   La Belle Créole — Proposition 3 · Storytelling immersif
   script.js
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* UTILS                                                                */
  /* ------------------------------------------------------------------ */

  /**
   * Format a YYYY-MM-DD date string to a readable French date.
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
   * Validate an email address.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Display an inline validation error beneath a field.
   * @param {HTMLFormElement} form
   * @param {string} fieldSelector
   * @param {string} message
   */
  function showFormError(form, fieldSelector, message) {
    clearFormErrors(form);
    var field = form.querySelector(fieldSelector);
    if (!field) return;
    field.setAttribute('aria-invalid', 'true');
    field.style.borderColor = 'var(--hibiscus)';
    field.style.boxShadow   = '0 0 0 3px rgba(194,59,90,0.14)';
    var errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.setAttribute('aria-live', 'polite');
    errorEl.style.cssText =
      'color:var(--hibiscus);font-size:0.78rem;margin-top:0.3rem;' +
      'font-family:var(--font-sans);font-weight:300;';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
    field.focus();
  }

  /**
   * Remove all validation error states from a form.
   * @param {HTMLFormElement} form
   */
  function clearFormErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
      el.style.borderColor = '';
      el.style.boxShadow   = '';
    });
    form.querySelectorAll('.form-error').forEach(function (el) {
      el.remove();
    });
  }

  /* ------------------------------------------------------------------ */
  /* NAV SCROLL SHADOW                                                    */
  /* ------------------------------------------------------------------ */

  var nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* BURGER MENU                                                          */
  /* ------------------------------------------------------------------ */

  var burger   = document.getElementById('burger');
  var navLinks = document.getElementById('nav-links');

  function closeMobileMenu() {
    if (!navLinks || !burger) return;
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  }

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', function (e) {
      if (nav && !nav.contains(e.target) && navLinks.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMobileMenu();
        if (burger) burger.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* SMOOTH SCROLL — all anchor links                                     */
  /* ------------------------------------------------------------------ */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      var navHeight = nav ? nav.offsetHeight : 72;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ------------------------------------------------------------------ */
  /* INTERSECTION OBSERVER — .reveal → .visible                          */
  /* ------------------------------------------------------------------ */

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
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
    /* Fallback: immediately show all elements */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ------------------------------------------------------------------ */
  /* INTERSECTION OBSERVER — dynamic --current-accent per section        */
  /* ------------------------------------------------------------------ */

  if ('IntersectionObserver' in window) {
    var accentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var rawAccent = entry.target.getAttribute('data-accent');
          if (rawAccent) {
            /* rawAccent is e.g. "--hibiscus" → set as var(--hibiscus) */
            document.documentElement.style.setProperty(
              '--current-accent',
              'var(' + rawAccent + ')'
            );
          }
        }
      });
    }, {
      threshold: 0.3
    });

    document.querySelectorAll('[data-accent]').forEach(function (section) {
      accentObserver.observe(section);
    });
  }

  /* ------------------------------------------------------------------ */
  /* CHAPTER CTA BUTTONS — pre-fill logement + scroll to #contact        */
  /* ------------------------------------------------------------------ */

  document.querySelectorAll('.chapter-cta[data-logement]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      /* The anchor href="#contact" is handled by smooth-scroll above.
         Additionally, pre-fill the WhatsApp form select. */
      var logement = this.getAttribute('data-logement');
      if (!logement) return;

      var waSelect = document.getElementById('wa-logement');
      if (waSelect) {
        var matchingOption = waSelect.querySelector(
          'option[value="' + logement + '"]'
        );
        if (matchingOption) {
          waSelect.value = logement;
          waSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      /* Delay focus on select until after scroll animation */
      if (waSelect) {
        setTimeout(function () { waSelect.focus(); }, 800);
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* WHATSAPP FORM                                                        */
  /* ------------------------------------------------------------------ */

  var waForm = document.getElementById('whatsapp-form');
  if (waForm) {
    waForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors(waForm);

      var logement = waForm.querySelector('#wa-logement').value.trim();
      var arrivee  = waForm.querySelector('#wa-arrivee').value;
      var depart   = waForm.querySelector('#wa-depart').value;
      var nom      = waForm.querySelector('#wa-nom').value.trim();
      var tel      = waForm.querySelector('#wa-tel').value.trim();
      var message  = waForm.querySelector('#wa-message').value.trim();

      /* Validation */
      if (!logement) {
        showFormError(waForm, '#wa-logement', 'Veuillez sélectionner un logement.');
        return;
      }
      if (!arrivee) {
        showFormError(waForm, '#wa-arrivee', "Veuillez indiquer la date d'arrivée.");
        return;
      }
      if (!depart) {
        showFormError(waForm, '#wa-depart', 'Veuillez indiquer la date de départ.');
        return;
      }
      if (new Date(depart) <= new Date(arrivee)) {
        showFormError(waForm, '#wa-depart',
          "La date de départ doit être postérieure à la date d'arrivée.");
        return;
      }
      if (!nom) {
        showFormError(waForm, '#wa-nom', 'Veuillez indiquer votre nom.');
        return;
      }

      /* Build WhatsApp message */
      var lines = [
        'Bonjour,',
        '',
        'Je souhaite faire une demande de réservation pour *La Belle Créole*.',
        '',
        '*Logement :* ' + logement,
        "*Arrivée :* "  + formatDate(arrivee),
        '*Départ :* '   + formatDate(depart),
        '*Nom :* '      + nom
      ];
      if (tel)     lines.push('*Téléphone :* ' + tel);
      if (message) { lines.push(''); lines.push('*Message :* ' + message); }
      lines.push('');
      lines.push('Merci !');

      var waUrl = 'https://wa.me/590690000000?text=' +
        encodeURIComponent(lines.join('\n'));
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ------------------------------------------------------------------ */
  /* MAILTO FORM                                                          */
  /* ------------------------------------------------------------------ */

  var emailForm = document.getElementById('email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormErrors(emailForm);

      var nom     = emailForm.querySelector('#em-nom').value.trim();
      var email   = emailForm.querySelector('#em-email').value.trim();
      var sujet   = emailForm.querySelector('#em-sujet').value.trim();
      var message = emailForm.querySelector('#em-message').value.trim();

      /* Validation */
      if (!nom) {
        showFormError(emailForm, '#em-nom', 'Veuillez indiquer votre nom.');
        return;
      }
      if (!email || !isValidEmail(email)) {
        showFormError(emailForm, '#em-email',
          'Veuillez entrer une adresse email valide.');
        return;
      }
      if (!sujet) {
        showFormError(emailForm, '#em-sujet', 'Veuillez indiquer un sujet.');
        return;
      }
      if (!message) {
        showFormError(emailForm, '#em-message', 'Veuillez écrire votre message.');
        return;
      }

      var body = [
        'Bonjour,',
        '',
        message,
        '',
        'Cordialement,',
        nom
      ].join('\n');

      var mailtoUrl =
        'mailto:contact@labellecreole-guadeloupe.com' +
        '?subject=' + encodeURIComponent('[La Belle Créole] ' + sujet) +
        '&body='    + encodeURIComponent(body);

      window.location.href = mailtoUrl;
    });
  }

})();
