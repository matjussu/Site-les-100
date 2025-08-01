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
    form.addEventListener('submit', function(e) {
        // NE PAS EMPÊCHER L'ACTION PAR DÉFAUT
        // NE PAS UTILISER e.preventDefault();
        
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
                innerHTML: '<div class="loader"></div>'
            });
        
        // FormSubmit se chargera automatiquement d'envoyer le formulaire
        // NE PAS ajouter de code de redirection ou de traitement d'e-mail ici
    });
});

// Fonction pour le Gookie du mois
function initGookieOfTheMonth() {
    const GookieOfTheMonth = {
        id: "avril",
        nom: "Avril - Le 69",
        description: "Un Gookie aux éclats de pistache et fleur d'oranger, célébrant l'arrivée du printemps",
        image: "image/Gookie PNG/AVRIL.png",
        featured: true
    };
    
    // Ajoutez ici le code pour afficher le Gookie du mois si nécessaire
}

// Appeler la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', initGookieOfTheMonth);