

// ==========================================
// COOKIE DU MOIS
// ==========================================

function initCookieOfTheMonth() {
  const cookieOfTheMonth = {
    id: "avril",
    nom: "Avril - Le 69",
    description: "Un cookie aux éclats de pistache et fleur d'oranger, célébrant l'arrivée du printemps",
    image: "image/COOKIE PNG/AVRIL.png",
    featured: true
  };
  
  // Vérifier s'il y a une section hero
  const heroSection = document.querySelector('#hero');
  if (heroSection) {
    // Ajouter le badge cookie du mois
    const badge = document.createElement('div');
    badge.className = 'featured-badge';
    badge.innerHTML = `
      <div class="featured-content">
        <span class="featured-title">Cookie du Mois</span>
        <span class="featured-name">${cookieOfTheMonth.nom}</span>
        <a href="cookie-detail.html?id=${cookieOfTheMonth.id}" class="featured-link">Découvrir</a>
      </div>
    `;
    heroSection.appendChild(badge);
    
    // Animation d'entrée du badge
    gsap.from(badge, {
      x: 100,
      opacity: 0,
      duration: 1,
      delay: 1.5,
      ease: 'power3.out'
    });
  }
  
  // Ajouter une bannière promotionnelle sur la page des cookies
  const cookiePage = document.querySelector('.cookies-catalogue');
  if (cookiePage) {
    const banner = document.createElement('div');
    banner.className = 'cookie-month-banner';
    banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-text">
          <h3>Cookie du Mois</h3>
          <h2>${cookieOfTheMonth.nom}</h2>
          <p>${cookieOfTheMonth.description}</p>
          <a href="cookie-detail.html?id=${cookieOfTheMonth.id}" class="banner-btn">Découvrir</a>
        </div>
        <div class="banner-image">
          <img src="${cookieOfTheMonth.image}" alt="${cookieOfTheMonth.nom}">
        </div>
      </div>
    `;
    
    cookiePage.insertBefore(banner, cookiePage.firstChild);
    
    // Animation de la bannière
    gsap.from('.banner-content', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.cookie-month-banner',
        start: 'top 80%'
      }
    });
  }
  
  // Mettre en avant le cookie du mois dans la grille
  const cookieCards = document.querySelectorAll('.cookie-card');
  cookieCards.forEach(card => {
    if (card.href.includes(cookieOfTheMonth.id)) {
      card.classList.add('featured-cookie');
      const ribbon = document.createElement('div');
      ribbon.className = 'featured-ribbon';
      ribbon.textContent = 'Cookie du Mois';
      card.appendChild(ribbon);
    }
  });
}

// Appeler la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', initCookieOfTheMonth);document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('.submit-button');
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        // Récupération des données du formulaire
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Simulation d'envoi (remplacez par votre vrai endpoint)
        setTimeout(() => {
            // Pour l'instant, nous allons utiliser mailto comme solution temporaire
            const mailtoLink = `mailto:contact@les100.fr?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
                `Nom: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
            )}`;
            
            window.location.href = mailtoLink;
            
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            
            // Message de confirmation
            showNotification('Message envoyé !', 'Nous vous répondrons dans les plus brefs délais.');
            
            form.reset();
        }, 1000);
    });
    
    // Animation des champs au focus
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            gsap.to(this.parentElement, {
                y: -2,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        input.addEventListener('blur', function() {
            gsap.to(this.parentElement, {
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
});