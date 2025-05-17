document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    
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
    
    // Animation du bouton au clic
    form.addEventListener('submit', function() {
        const submitButton = form.querySelector('.submit-button');
        
        // Ajouter une classe pour indiquer le chargement
        submitButton.classList.add('loading');
        
        // Animation du bouton
        const timeline = gsap.timeline({
            defaults: { duration: 0.3, ease: 'power2.inOut' }
        });
        
        timeline
            .to(submitButton, { width: '50px', borderRadius: '25px' })
            .to(submitButton, { 
                innerHTML: '<div class="loader"></div>',
                onComplete: function() {
                    // Le formulaire sera soumis normalement à FormSubmit
                    // Cette animation est juste pour l'effet visuel
                }
            });
    });
});

// Gardez la fonction initCookieOfTheMonth telle quelle
function initCookieOfTheMonth() {
  const cookieOfTheMonth = {
    id: "avril",
    nom: "Avril - Le 69",
    description: "Un cookie aux éclats de pistache et fleur d'oranger, célébrant l'arrivée du printemps",
    image: "image/COOKIE PNG/AVRIL.png",
    featured: true
  };
}

// Appeler la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', initCookieOfTheMonth);