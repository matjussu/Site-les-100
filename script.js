// Loader d'entrée et animations de page
document.addEventListener('DOMContentLoaded', function() {
  // Créer le loader
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-spinner"></div>
    </div>
  `;
  document.body.appendChild(loader);
  
  // Cacher le contenu de la page pendant le chargement
  document.body.style.overflow = 'hidden';
  
  // Animation d'entrée après chargement des ressources
  window.addEventListener('load', function() {
    setTimeout(() => {
      // Animer la sortie du loader
      gsap.to(loader, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          loader.remove();
          document.body.style.overflow = '';
          
          // Animer l'apparition des éléments de la page d'accueil
          const timeline = gsap.timeline();
          
          // Animation du logo du header
          timeline.from('.logo img', {
            opacity: 0,
            y: -50,
            duration: 0.8,
            ease: 'power3.out'
          });
          
          // Animation des liens de navigation
          timeline.from('nav ul li', {
            opacity: 0,
            y: -20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
          }, '-=0.4');
          
          // Animation des éléments de la section principale
          timeline.from('.animate-element.fade-up', {
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.2,
            delay: 0.2,
            ease: 'power3.out'
          }, '-=0.2');

          setTimeout(() => {
            document.querySelectorAll('.animate-element.fade-up').forEach(el => {
              el.classList.add('animate-visible');
            });
          }, 1200); // Laisse GSAP finir avant d'ajouter
          

          
          // Configurer le parallaxe
          setupParallax();
          
          // Configurer les animations au défilement
          setupScrollAnimations();
        }
      });
    }, 800); // Durée minimale du loader
  });
});

// Effet parallaxe pour l'arrière-plan
function setupParallax() {
  if (document.querySelector('.parallax-bg')) {
    window.addEventListener('scroll', function() {
      const scrollPosition = window.pageYOffset;
      const parallaxBg = document.querySelector('.parallax-bg');
      const parallaxSpeed = 0.5;
      
      // Effet parallaxe: l'arrière-plan se déplace plus lentement que le défilement
      parallaxBg.style.transform = `translateY(${scrollPosition * parallaxSpeed}px)`;
    });
  }
}

// Animations au défilement
function setupScrollAnimations() {
  // Initialiser ScrollTrigger de GSAP
  gsap.registerPlugin(ScrollTrigger);
  
  // Animation des sections au défilement
  gsap.utils.toArray('section').forEach((section, i) => {
    if (i > 0) { // Ne pas animer la première section (déjà animée)
      gsap.from(section, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
      
    }
  });
  
  // Animation des images au défilement
  gsap.utils.toArray('section img').forEach((img, i) => {
    if (!img.closest('#les100')) { // Ne pas animer les images de la première section
      gsap.from(img, {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        scrollTrigger: {
          trigger: img,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }
  });
  
  // Animation des cartes de cookies
  if (document.querySelector('.cookie-card')) {
    gsap.utils.toArray('.cookie-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
}

// Animation de tous les boutons
document.querySelectorAll('.btn, .btn-panier').forEach(button => {
  button.addEventListener('mouseenter', function() {
    gsap.to(this, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  button.addEventListener('mouseleave', function() {
    gsap.to(this, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  button.addEventListener('click', function() {
    gsap.to(this, {
      scale: 0.95,
      duration: 0.1,
      onComplete: () => {
        gsap.to(this, {
          scale: 1,
          duration: 0.3
        });
      }
    });
  });
});

// Transitions fluides entre les pages
document.querySelectorAll('a[href$=".html"]:not([href^="#"])').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    e.preventDefault();

    const transition = document.getElementById('page-transition');
    const logo = document.querySelector('.logo img');

    const timeline = gsap.timeline({
      onComplete: () => {
        window.location.href = href;
      }
    });

    timeline
      .to(logo, {
        rotation: 360,
        duration: 0.6,
        ease: 'power2.inOut'
      }, 0)
      .to(transition, {
        opacity: 1,
        duration: 0.4,
        ease: 'power1.inOut'
      }, 0.2);
  });
});





// Restaurer l'opacité du body après la navigation
window.addEventListener('pageshow', function(event) {
  const transition = document.getElementById('page-transition');
  gsap.fromTo(transition, { opacity: 1 }, {
    opacity: 0,
    duration: 0.4,
    delay: 0.1,
    onComplete: () => {
      transition.style.pointerEvents = 'none';
    }
  });
});


// Enregistrer le service worker
if ('serviceWorker' in navigator && location.hostname !== '127.0.0.1') {
  navigator.serviceWorker.register('sw.js')
    .then(registration => {
      console.log('Service Worker enregistré:', registration.scope);
    })
    .catch(error => {
      console.error("Erreur Service Worker:", error);
    });
}


// Animations pour la page détail cookie
function setupCookieDetailInteractions() {
  // Vérifier si on est sur une page de détail de cookie
  const cookieSize = document.getElementById('cookie-size');
  if (!cookieSize) return;
  
  // Animation du prix lors du changement de taille
  cookieSize.addEventListener('change', function() {
    const prixElement = document.getElementById('prix-actuel');
    // Ajouter une classe pour l'animation
    prixElement.classList.add('price-change');
    
    // Supprimer la classe après l'animation
    setTimeout(() => {
      prixElement.classList.remove('price-change');
    }, 500);
  });
  
  // Animation de l'image du cookie au survol
  const cookieImg = document.getElementById('cookie-img');
  if (cookieImg) {
    cookieImg.addEventListener('mouseenter', function() {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    cookieImg.addEventListener('mouseleave', function() {
      gsap.to(this, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  }
  
  // Animation du bouton "Ajouter au panier"
  const btnPanier = document.querySelector('.btn-panier');
  if (btnPanier) {
    btnPanier.addEventListener('click', function() {
      // Créer un élément de notification
      const notification = document.createElement('div');
      notification.className = 'add-to-cart-notification';
      notification.innerHTML = '<span>Ajouté au panier</span>';
      document.body.appendChild(notification);
      
      // Animer la notification
      gsap.fromTo(notification, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, onComplete: () => {
          setTimeout(() => {
            gsap.to(notification, {
              y: -20, opacity: 0, duration: 0.3, onComplete: () => {
                notification.remove();
              }
            });
          }, 1500);
        }}
      );
    });
  }
}

gsap.utils.toArray('.cookie-card').forEach((card, i) => {
  gsap.from(card, {
    opacity: 0,
    y: 30,
    duration: 0.6,
    delay: i * 0.05,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });
});


// Appeler la fonction au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
  setupCookieDetailInteractions();
  // ... autres fonctions existantes

  window.addEventListener('pageshow', function(event) {
    const transition = document.getElementById('page-transition');
    gsap.fromTo(transition, { opacity: 1 }, {
      opacity: 0,
      duration: 0.4,
      delay: 0.1,
      onComplete: () => {
        transition.style.pointerEvents = 'none';
      }
    });
  });
  
});