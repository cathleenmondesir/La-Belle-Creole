/* ============================================================
   La Belle Créole — Proposition 3 · Storytelling immersif
   script.js
   ============================================================ */

(function () {
  'use strict';

  /* ---- UTILS ---- */

  /**
   * Format a date string (YYYY-MM-DD) to a human-readable French date.
   * @param {string} dateStr
   * @returns {string}
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /**
   * Encode a string for WhatsApp URL.
   * @param {string} str
   * @returns {string}
   */
  function encodeWA(str) {
    return encodeURIComponent(str);
  }

  /* ---- NAV SCROLL STATE ---- */
  var nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ---- BURGER MENU ---- */
  var burger    = document.getElementById('burger');
  var navLinks  = document.getElementById('nav-links');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  /* ---- SMOOTH SCROLL for nav anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = nav ? nav.offsetHeight : 72;
        var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---- INTERSECTION OBSERVER — reveal ---- */
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
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ---- INTERSECTION OBSERVER — dynamic accent color ---- */
  if ('IntersectionObserver' in window) {
    var accentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var rawAccent = entry.target.getAttribute('data-accent');
          if (rawAccent) {
            // rawAccent is like "--hibiscus" — set as var(--hibiscus)
            var cssValue = 'var(' + rawAccent + ')';
            document.documentElement.style.setProperty('--current-accent', cssValue);
          }
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px 0px 0px'
    });

    document.querySelectorAll('[data-accent]').forEach(function (section) {
      accentObserver.observe(section);
    });
  }

  /* ---- CHAPTER CTA BUTTONS — scroll to contact + pre-fill logement ---- */
  document.querySelectorAll('.chapter-cta[data-logement]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var logement = this.getAttribute('data-logement');
      if (!logement) return;

      // Pre-fill the WhatsApp form select
      var waSelect = document.getElementById('wa-logement');
      if (waSelect) {
        var option = waSelect.querySelector('option[value="' + logement + '"]');
        if (option) {
          waSelect.value = logement;
          // Trigger a change event for any listeners
          waSelect.dispatchEvent(new Event('change'));
        }
      }
      // The smooth scroll to #contact is already handled by the anchor click handler above.
      // We just need to make sure focus goes to the first relevant field.
      var contactSection = document.getElementById('contact');
      if (contactSection) {
        setTimeout(function () {
          var navHeight = nav ? nav.offsetHeight : 72;
          var top = contactSection.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: top, behavior: 'smooth' });
          if (waSelect) {
            setTimeout(function () { waSelect.focus(); }, 600);
          }
        }, 0);
      }
    });
  });

  /* ---- WHATSAPP FORM ---- */
  var waForm = document.getElementById('whatsapp-form');
  if (waForm) {
    waForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var logement = waForm.querySelector('#wa-logement').value.trim();
      var arrivee  = waForm.querySelector('#wa-arrivee').value;
      var depart   = waForm.querySelector('#wa-depart').value;
      var nom      = waForm.querySelector('#wa-nom').value.trim();
      var tel      = waForm.querySelector('#wa-tel').value.trim();
      var message  = waForm.querySelector('#wa-message').value.trim();

      // Basic validation
      if (!logement) {
        showFormError(waForm, '#wa-logement', 'Veuillez sélectionner un logement.');
        return;
      }
      if (!arrivee || !depart) {
        showFormError(waForm, '#wa-arrivee', 'Veuillez indiquer vos dates de séjour.');
        return;
      }
      if (new Date(depart) <= new Date(arrivee)) {
        showFormError(waForm, '#wa-depart', 'La date de départ doit être après la date d\'arrivée.');
        return;
      }
      if (!nom) {
        showFormError(waForm, '#wa-nom', 'Veuillez indiquer votre nom.');
        return;
      }

      clearFormErrors(waForm);

      var lines = [];
      lines.push('Bonjour,');
      lines.push('');
      lines.push('Je souhaite faire une demande de réservation pour *La Belle Créole*.');
      lines.push('');
      lines.push('*Logement :* ' + logement);
      lines.push('*Arrivée :* ' + formatDate(arrivee));
      lines.push('*Départ :* ' + formatDate(depart));
      lines.push('*Nom :* ' + nom);
      if (tel) lines.push('*Téléphone :* ' + tel);
      if (message) { lines.push(''); lines.push('*Message :* ' + message); }
      lines.push('');
      lines.push('Merci !');

      var waMessage = lines.join('\n');
      var waUrl = 'https://wa.me/590690000000?text=' + encodeWA(waMessage);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ---- MAILTO FORM ---- */
  var emailForm = document.getElementById('email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nom     = emailForm.querySelector('#em-nom').value.trim();
      var email   = emailForm.querySelector('#em-email').value.trim();
      var sujet   = emailForm.querySelector('#em-sujet').value.trim();
      var message = emailForm.querySelector('#em-message').value.trim();

      if (!nom) {
        showFormError(emailForm, '#em-nom', 'Veuillez indiquer votre nom.');
        return;
      }
      if (!email || !isValidEmail(email)) {
        showFormError(emailForm, '#em-email', 'Veuillez entrer une adresse email valide.');
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

      clearFormErrors(emailForm);

      var body = [];
      body.push('Bonjour,');
      body.push('');
      body.push(message);
      body.push('');
      body.push('Cordialement,');
      body.push(nom);

      var mailtoUrl = 'mailto:contact@labellecreole-guadeloupe.com'
        + '?subject=' + encodeURIComponent('[La Belle Créole] ' + sujet)
        + '&body=' + encodeURIComponent(body.join('\n'));

      window.location.href = mailtoUrl;
    });
  }

  /* ---- FORM HELPERS ---- */

  /**
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
    field.style.boxShadow = '0 0 0 3px rgba(194,59,90,0.15)';

    var errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.style.cssText = 'color:var(--hibiscus);font-size:0.78rem;margin-top:0.3rem;font-family:var(--font-sans);';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
    field.focus();
  }

  /**
   * @param {HTMLFormElement} form
   */
  function clearFormErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
      el.style.borderColor = '';
      el.style.boxShadow = '';
    });
    form.querySelectorAll('.form-error').forEach(function (el) {
      el.remove();
    });
  }

  /**
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

})();
