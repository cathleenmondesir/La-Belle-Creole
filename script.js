// ═══════════════ MENU MOBILE ═══════════════
const nav = document.getElementById('nav');
const navBurger = document.getElementById('navBurger');

navBurger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navBurger.classList.toggle('open');
  navBurger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

// Fermer le menu mobile au clic sur un lien
document.querySelectorAll('.nav-menu .nav-item, .nav-cta').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navBurger.classList.remove('open');
    navBurger.setAttribute('aria-expanded', 'false');
  });
});

// ═══════════════ NUMÉRO WHATSAPP DU GÎTE ═══════════════
// À remplacer par le vrai numéro (format international, sans le +)
const WHATSAPP_NUMBER = '590690000000';
const CONTACT_EMAIL = 'contact@labellecreole-guadeloupe.com';

// ═══════════════ FORMULAIRE DE DISPONIBILITÉ (HERO) ═══════════════
const bkForm = document.getElementById('bkForm');

bkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(bkForm);
  const arrivee = formatDate(data.get('arrivee'));
  const depart = formatDate(data.get('depart'));
  const logement = data.get('logement');
  const voyageurs = data.get('voyageurs');

  const message = `Bonjour, je souhaite vérifier une disponibilité à La Belle Créole.%0A%0A` +
    `Logement souhaité : ${encodeURIComponent(logement)}%0A` +
    `Arrivée : ${encodeURIComponent(arrivee)}%0A` +
    `Départ : ${encodeURIComponent(depart)}%0A` +
    `Nombre de personnes : ${encodeURIComponent(voyageurs)}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
});

// ═══════════════ FORMULAIRE DE CONTACT ═══════════════
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(contactForm);
  const nom = data.get('nom');
  const email = data.get('email');
  const message = data.get('message');

  const subject = encodeURIComponent('Demande de renseignements - La Belle Créole');
  const body = encodeURIComponent(
    `Nom : ${nom}\nEmail : ${email}\n\nMessage :\n${message}`
  );

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

// ═══════════════ PRÉ-REMPLISSAGE LOGEMENT DEPUIS LES CARTES ═══════════════
document.querySelectorAll('.card-link[data-logement]').forEach(link => {
  link.addEventListener('click', (e) => {
    const logement = link.getAttribute('data-logement');
    // Pré-sélectionner le logement dans le formulaire hero si on revient en haut
    const select = bkForm.querySelector('[name="logement"]');
    if (select) {
      [...select.options].forEach(opt => {
        if (opt.value === logement) select.value = logement;
      });
    }
    // Pré-remplir le message du formulaire de contact
    const messageField = contactForm.querySelector('[name="message"]');
    if (messageField && !messageField.value) {
      messageField.value = `Je suis intéressé(e) par : ${logement}\nDates envisagées : \nNombre de personnes : `;
    }
  });
});

// ═══════════════ HELPER : FORMAT DATE FR ═══════════════
function formatDate(isoDate) {
  if (!isoDate) return 'Non précisé';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
