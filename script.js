// Configuration GSAP globale pour des animations plus fluides
gsap.config({
  force3D: true,
  nullTargetWarn: false
});

// Variables globales pour synchronisation
let pageIsReady = false;
let animationsStarted = false;

// Fonction pour démarrer les animations de façon fluide et synchronisée
function startPageAnimations() {
  if (!pageIsReady || animationsStarted) return;
  animationsStarted = true;
  
  // Timeline pour les animations d'entrée
  const introTimeline = gsap.timeline();
  
  // Affiche le contenu d'abord
  introTimeline.to('#hero .content', {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.out'
  });
  
  // Animations des éléments avec délai progressif
  const heroElements = document.querySelectorAll('#hero .animate-element');
  heroElements.forEach((element, index) => {
    element.style.visibility = 'visible'; // Rend visible avant l'animation
    
    // IMPORTANT: utilisation de fromTo pour garantir l'état final
    introTimeline.fromTo(element, 
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: index * 0.2
      },
      index === 0 ? '-=0.2' : '-=0.6'
    );
  });
  
  // S'assurer que les éléments restent visibles
  introTimeline.add(() => {
    heroElements.forEach(element => {
      gsap.set(element, {
        opacity: 1,
        y: 0,
        visibility: 'visible'
      });
    });
  });
  
  // Ajoute la classe page-loaded pour les autres animations
  document.body.classList.add('page-loaded');
}

// Document ready
document.addEventListener('DOMContentLoaded', function() {
  // Masque le flash de transition
  const pageTransition = document.getElementById('page-transition');
  if (pageTransition) {
    pageTransition.style.opacity = '0';
    pageTransition.style.visibility = 'hidden';
  }
  
  // Loader professionnel avec animation de logo
  function createProfessionalLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-logo-wrapper">
          <img src="logo/logo les100_DEF ROND.png" alt="Logo" class="loader-logo">
          <div class="loader-progress"></div>
        </div>
        <div class="loader-text">Chargement des cookies...</div>
      </div>
    `;
    document.body.appendChild(loader);
    
    // Animation du loader
    const tl = gsap.timeline();
    tl.from('.loader-logo', {
      scale: 0.3,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.7)'
    })
    .from('.loader-progress', {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.2,
      ease: 'power2.inOut'
    }, '-=0.4')
    .from('.loader-text', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.8');
    
    return loader;
  }
  
  const loader = createProfessionalLoader();
  
  // Préchargement des images
  const images = document.querySelectorAll('img');
  let loadedImages = 0;
  const totalImages = images.length;
  
  function imageLoaded() {
    loadedImages++;
    const progress = loadedImages / totalImages;
    gsap.to('.loader-progress', {
      scaleX: progress,
      duration: 0.3,
      ease: 'power1.inOut'
    });
    
    if (loadedImages === totalImages) {
      removeLoaderAndStartAnimations();
    }
  }
  
  function removeLoaderAndStartAnimations() {
    // Animation de sortie du loader
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.remove();
        pageIsReady = true;
        // Attente courte pour s'assurer que le DOM est prêt
        setTimeout(startPageAnimations, 100);
      }
    });
  }
  
  images.forEach(img => {
    if (img.complete) {
      imageLoaded();
    } else {
      img.addEventListener('load', imageLoaded);
      img.addEventListener('error', imageLoaded);
    }
  });
  
  // Si aucune image, lancer après un délai
  if (totalImages === 0) {
    setTimeout(removeLoaderAndStartAnimations, 1500);
  }
  
  // Reste du code (inchangé)...
  function initMainAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animation du header
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        gsap.to('header', {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
          duration: 0.3
        });
      } else {
        gsap.to('header', {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          duration: 0.3
        });
      }
      
      lastScroll = currentScroll;
    });
    
    // Parallaxe sur les sections (sauf le hero et hero-histoire)
    const parallaxSections = document.querySelectorAll('.parallax-container:not(#hero):not(#hero-histoire)');
    parallaxSections.forEach(section => {
      const bg = section.querySelector('.parallax-bg');
      if (bg) {
        gsap.to(bg, {
          y: () => section.offsetHeight * 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    });
    
    // Animation des cartes de cookies
    const cookieCards = document.querySelectorAll('.cookie-card');
    cookieCards.forEach((card, index) => {
      // Hover effects
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          scale: 1.02,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          duration: 0.4,
          ease: 'power2.out'
        });
        
        gsap.to(card.querySelector('img'), {
          scale: 1.1,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
          duration: 0.4,
          ease: 'power2.out'
        });
        
        gsap.to(card.querySelector('img'), {
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
      
      // Apparition au scroll
      gsap.from(card, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        }
      });
    });
    
    // Transitions de page CORRIGÉES
    const pageLinks = document.querySelectorAll('a[href$=".html"]:not([href^="#"])');
    pageLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const transitionElement = document.getElementById('page-transition');
        
        if (transitionElement) {
          transitionElement.style.opacity = '1';
          transitionElement.style.visibility = 'visible';
          transitionElement.classList.add('active');
          
          // Création d'une timeline complète pour la transition
          const tl = gsap.timeline();
          
          // Phase 1: Animation de l'écran de transition et du logo simultanément
          tl.to(transitionElement, {
            scaleY: 1,
            transformOrigin: 'bottom center',
            duration: 0.6,
            ease: 'power2.inOut'
          })
          .to('.logo img', {
            rotation: 360,
            scale: 0.8,
            duration: 0.6,
            ease: 'power2.inOut'
          }, 0) // Le 0 signifie que cette animation démarre en même temps que la précédente
          
          // Phase 2: Fade out du body
          .to('body', {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut'
          })
          
          // Phase 3: Attendre un peu pour que l'animation soit bien visible
          .to({}, {
            duration: 0.2
          })
          
          // Phase 4: Changement de page seulement après que TOUT soit terminé
          .add(() => {
            window.location.href = href;
          });
          
        } else {
          window.location.href = href;
        }
      });
    });
  }
  
  // Démarre les animations principales une fois la page prête
  window.addEventListener('load', () => {
    if (pageIsReady) {
      initMainAnimations();
    } else {
      // Si le loader est encore visible, attendre qu'il soit terminé
      const checkReady = setInterval(() => {
        if (pageIsReady) {
          clearInterval(checkReady);
          initMainAnimations();
        }
      }, 100);
    }
  });
});

// Fix pour la transition de retour
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    window.location.reload();
  }
});

// Gestion de l'effet de scroll pour le header
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('header');
  
  function handleScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

// Désactive l'effet parallax sur la section hero de la page d'accueil
document.addEventListener('DOMContentLoaded', function() {
  const heroParallax = document.querySelector('#hero .parallax-bg');
  if (heroParallax) {
    gsap.set(heroParallax, {
      clearProps: "all",
      y: 0,
      force3D: false,
      transform: "none"
    });
    
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger && trigger.trigger.id === 'hero') {
        trigger.kill();
      }
    });
  }
});

// Menu hamburger amélioré pour mobile (positionné à droite)
document.addEventListener('DOMContentLoaded', function() {
  // Créer le bouton hamburger s'il n'existe pas déjà
  let menuToggle = document.querySelector('.menu-toggle');
  if (!menuToggle) {
    menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.setAttribute('aria-label', 'Menu');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    if (header && nav) {
      // Insérer après la navigation (au lieu d'avant)
      // Cela le placera à droite visuellement
      if (nav.nextSibling) {
        header.insertBefore(menuToggle, nav.nextSibling);
      } else {
        header.appendChild(menuToggle);
      }
      
      const navList = document.querySelector('nav ul');
      
      // Toggle menu
      menuToggle.addEventListener('click', function() {
        navList.classList.toggle('active');
        const isExpanded = navList.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        
        // Animation du hamburger en X
        if (isExpanded) {
          menuToggle.classList.add('active');
          document.body.style.overflow = 'hidden'; // Empêcher le défilement du body
        } else {
          menuToggle.classList.remove('active');
          document.body.style.overflow = ''; // Rétablir le défilement
        }
      });
      
      // Fermer le menu quand on clique sur un lien
      navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navList.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('active');
          document.body.style.overflow = ''; // Rétablir le défilement
        });
      });
      
      // Fermer le menu en cliquant à l'extérieur
      document.addEventListener('click', function(e) {
        if (navList.classList.contains('active') && 
            !nav.contains(e.target) && 
            !menuToggle.contains(e.target)) {
          navList.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('active');
          document.body.style.overflow = ''; // Rétablir le défilement
        }
      });
      
      // Ajustement pour l'orientation du téléphone
      window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navList.classList.contains('active')) {
          navList.classList.remove('active');
          menuToggle.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  }
});
// Optimisation des images pour mobile
function optimizeImagesForMobile() {
  if (window.innerWidth <= 768) {
    document.querySelectorAll('img').forEach(img => {
      // Réduire la qualité des images sur mobile pour des performances optimales
      if (img.src.includes('COOKIE PNG')) {
        img.loading = 'lazy';
      }
    });
  }
}

window.addEventListener('load', optimizeImagesForMobile);
window.addEventListener('resize', optimizeImagesForMobile);

// Ajout de l'icône du panier dans le header
document.addEventListener('DOMContentLoaded', function() {
  const nav = document.querySelector('nav ul');
  if (nav) {
    const cartLi = document.createElement('li');
    cartLi.innerHTML = `
      <a href="#" class="cart-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="cart-count">0</span>
      </a>
    `;
    nav.appendChild(cartLi);
    
    document.querySelector('.cart-icon').addEventListener('click', (e) => {
      e.preventDefault();
      showCartModal();
    });
    
    updateCartCount();
  }
});

// ==========================================
// COOKIE DU MOIS
// ==========================================

function initCookieOfTheMonth() {
const cookieOfTheMonth = {
  id: "MAI",
  nom: "Mai - Coeur coco",
  description: "Un cookie à moitié pepite de chocolat noir et à moitié tout choco. Un régal pour les gourmands !",
  image: "image/COOKIE PNG/Mai.png",
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

// ==========================================
// SYSTÈME DE PANIER
// ==========================================

// Structure de données pour le panier
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fonction pour ajouter au panier
function addToCart(product) {
  const existingProduct = cart.find(item => 
    item.id === product.id && item.taille === product.taille
  );
  
  if (existingProduct) {
    // Si le produit existe déjà, on ajoute la quantité spécifiée
    existingProduct.quantity += product.quantity || 1;
  } else {
    // Si c'est un nouveau produit, on l'ajoute avec la quantité spécifiée
    cart.push({
      ...product,
      quantity: product.quantity || 1  // Si pas de quantité spécifiée, on met 1 par défaut
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showCartNotification(product);
  animateAddToCart(event);
}

// Met à jour le compteur du panier
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartIndicator = document.querySelector('.cart-count');
  
  if (cartIndicator) {
    cartIndicator.textContent = count;
    cartIndicator.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Animation d'ajout au panier
function animateAddToCart(event) {
  const button = event.target;
  const productCard = button.closest('.cookie-card, .cookie-detail');
  const productImage = productCard.querySelector('img');
  
  // Clone de l'image pour l'animation
  const imageClone = productImage.cloneNode(true);
  imageClone.style.position = 'fixed';
  imageClone.style.zIndex = '9999';
  imageClone.style.width = '100px';
  imageClone.style.height = '100px';
  imageClone.style.borderRadius = '50%';
  imageClone.style.objectFit = 'cover';
  
  const rect = productImage.getBoundingClientRect();
  imageClone.style.left = rect.left + 'px';
  imageClone.style.top = rect.top + 'px';
  
  document.body.appendChild(imageClone);
  
  // Animation vers l'icône du panier
  const cartIcon = document.querySelector('.cart-icon');
  const cartRect = cartIcon.getBoundingClientRect();
  
  gsap.to(imageClone, {
    x: cartRect.left - rect.left + cartRect.width / 2 - 50,
    y: cartRect.top - rect.top + cartRect.height / 2 - 50,
    scale: 0.1,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      imageClone.remove();
      
      // Animation du compteur
      gsap.fromTo('.cart-count', 
        { scale: 0.5 },
        { scale: 1, duration: 0.3, ease: 'back.out(4)' }
      );
    }
  });
}

// Notification d'ajout au panier
function showCartNotification(product) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">✓</div>
      <div class="notification-text">
        <h4>${product.quantity || 1} x ${product.nom} ajouté(s) au panier</h4>
        <p>Taille: ${product.taille} - Prix unitaire: ${product.prix}€</p>
      </div>
    </div>
    <div class="notification-actions">
      <button class="view-cart-btn">Voir le panier</button>
      <button class="continue-shopping-btn">Continuer</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animations de la notification
  gsap.fromTo(notification, 
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
  );
  
  // Gestion des boutons
  notification.querySelector('.view-cart-btn').addEventListener('click', () => {
    showCartModal();
    notification.remove();
  });
  
  notification.querySelector('.continue-shopping-btn').addEventListener('click', () => {
    gsap.to(notification, {
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => notification.remove()
    });
  });
  
  // Auto-fermeture après 5 secondes
  setTimeout(() => {
    if (notification.parentElement) {
      gsap.to(notification, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => notification.remove()
      });
    }
  }, 5000);
}

// Modal du panier
function showCartModal() {
  const modal = document.createElement('div');
  modal.className = 'cart-modal';
  modal.innerHTML = `
    <div class="cart-modal-content">
      <div class="cart-modal-header">
        <h2>Votre panier</h2>
        <button class="close-modal">×</button>
      </div>
      <div class="cart-modal-body">
        ${cart.length > 0 ? generateCartItems() : '<p class="empty-cart">Votre panier est vide</p>'}
      </div>
      <div class="cart-modal-footer">
        <div class="cart-total">
          <span>Total:</span>
          <span>${calculateTotal()}€</span>
        </div>
        <div class="cart-info">
          <p>Les cookies sont disponibles uniquement au marché de Gouvieux, tous les dimanches.</p>
          <p>Suivez-nous sur Instagram <a href="https://instagram.com/les100_gluten_oeuf_lactose" target="_blank">@les100_gluten_oeuf_lactose</a></p>
        </div>
        <div class="cart-actions">
          <a href="contact.html" class="contact-btn">Nous contacter</a>
          <button class="close-cart-btn">Continuer vos achats</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Animation d'ouverture
  gsap.fromTo(modal, 
    { opacity: 0 },
    { opacity: 1, duration: 0.3 }
  );
  
  gsap.fromTo('.cart-modal-content',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
  );
  
  // Ajout des écouteurs d'événements pour les boutons de quantité
  modal.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const taille = btn.dataset.taille;
      updateQuantity(id, taille, -1);
    });
  });
  
  modal.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const taille = btn.dataset.taille;
      updateQuantity(id, taille, 1);
    });
  });
  
  // Ajout des écouteurs d'événements pour les boutons de suppression
  modal.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const taille = btn.dataset.taille;
      removeFromCart(id, taille);
    });
  });
  
  // Fermeture du modal
  function closeModal() {
    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        modal.remove();
        document.body.style.overflow = '';
      }
    });
  }
  
  modal.querySelector('.close-modal').addEventListener('click', closeModal);
  modal.querySelector('.close-cart-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
  


// Génère les items du panier
function generateCartItems() {
  return cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.nom}">
      <div class="cart-item-info">
        <h3>${item.nom}</h3>
        <p>Taille: ${item.taille}</p>
        <p>Prix: ${item.prix}€</p>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn minus" data-id="${item.id}" data-taille="${item.taille}">-</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn plus" data-id="${item.id}" data-taille="${item.taille}">+</button>
      </div>
      <button class="remove-item" data-id="${item.id}" data-taille="${item.taille}">×</button>
    </div>
  `).join('');
}

// Calcule le total du panier
function calculateTotal() {
  return cart.reduce((total, item) => total + (item.prix * item.quantity), 0).toFixed(2);
}

// Fonction pour mettre à jour la quantité
function updateQuantity(id, taille, change) {
  const item = cart.find(item => item.id === id && item.taille === taille);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(id, taille);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartUI();
    }
  }
}

// Fonction pour supprimer un article du panier
function removeFromCart(id, taille) {
  cart = cart.filter(item => !(item.id === id && item.taille === taille));
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

// Fonction pour mettre à jour l'interface utilisateur du panier
function updateCartUI() {
  updateCartCount();
  
  // Si le modal est ouvert, mettre à jour son contenu
  const modalBody = document.querySelector('.cart-modal-body');
  if (modalBody) {
    modalBody.innerHTML = cart.length > 0 ? generateCartItems() : '<p class="empty-cart">Votre panier est vide</p>';
    
    // Mettre à jour le total
    const totalElement = document.querySelector('.cart-total span:last-child');
    if (totalElement) {
      totalElement.textContent = calculateTotal() + '€';
    }
    
    // Réattacher les écouteurs d'événements
    if (cart.length > 0) {
      modalBody.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const taille = btn.dataset.taille;
          updateQuantity(id, taille, -1);
        });
      });
      
      modalBody.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const taille = btn.dataset.taille;
          updateQuantity(id, taille, 1);
        });
      });
      
      modalBody.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const taille = btn.dataset.taille;
          removeFromCart(id, taille);
        });
      });
    }
  }
}

// Optimisations de performance spécifiques pour mobile
function optimizeForMobile() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Désactiver certaines animations lourdes sur mobile
    document.querySelectorAll('.parallax-bg').forEach(parallax => {
      parallax.style.transform = 'none';
      parallax.style.willChange = 'auto';
    });
    
    // Réduire la qualité d'image sur mobile
    document.querySelectorAll('img:not(.hero-logo):not(.logo img)').forEach(img => {
      if (!img.src.includes('logo')) {
        img.loading = 'lazy';
      }
    });
    
    // Simplifier les animations scroll
    const scrollTriggers = ScrollTrigger.getAll();
    for (let st of scrollTriggers) {
      if (st.animation && typeof st.animation.duration === 'function') {
        const currentDuration = st.animation.duration();
        st.animation.duration(currentDuration * 0.7);
      }
    }
  }
}

// Appliquer les optimisations au chargement et au redimensionnement
window.addEventListener('load', optimizeForMobile);
window.addEventListener('resize', optimizeForMobile);

// Animation spécifique pour la page histoire - à ajouter dans script.js
document.addEventListener('DOMContentLoaded', function() {
  // Vérifie si nous sommes sur la page histoire
  const heroHistoire = document.getElementById('hero-histoire');
  if (heroHistoire) {
    // Animation immédiate des éléments du hero
    const animatedElements = document.querySelectorAll('.hero-histoire-content .animate-element');
    
    // Force l'animation immédiate sans attendre le chargement complet
    setTimeout(() => {
      animatedElements.forEach((element, index) => {
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          element.style.visibility = 'visible';
        }, index * 200); // Délai progressif pour chaque élément
      });
    }, 300);
    
    // Animation de la timeline quand elle devient visible
    const timelineProgress = document.querySelector('.timeline-progress');
    if (timelineProgress) {
      // Initialisation de ScrollTrigger pour la timeline
      gsap.registerPlugin(ScrollTrigger);
      
      gsap.to(timelineProgress, {
        scaleY: 1,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.story-timeline',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1
        }
      });
    }
    
    // Animation pour chaque section d'histoire
    const storySections = document.querySelectorAll('.story-section');
    storySections.forEach((section, index) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
});

// Désactivation du parallax sur mobile - à ajouter dans script.js
document.addEventListener('DOMContentLoaded', function() {
  const isMobile = window.innerWidth <= 768;
  
  // Désactive spécifiquement le parallax pour hero-histoire sur mobile
  if (isMobile) {
    const heroHistoireParallax = document.querySelector('#hero-histoire .parallax-bg');
    if (heroHistoireParallax) {
      // Fixe l'image en arrière-plan sans effet parallax
      heroHistoireParallax.style.position = 'absolute';
      heroHistoireParallax.style.transform = 'none';
      heroHistoireParallax.style.top = '0';
      heroHistoireParallax.style.left = '0';
      heroHistoireParallax.style.width = '100%';
      heroHistoireParallax.style.height = '100%';
      heroHistoireParallax.style.objectFit = 'cover';
      
      // Si des ScrollTriggers sont configurés pour cet élément, les supprimer
      const allTriggers = ScrollTrigger.getAll();
      allTriggers.forEach(trigger => {
        if (trigger.trigger && trigger.trigger.id === 'hero-histoire') {
          trigger.kill();
        }
      });
    }
  }
});

// Forcer l'affichage des animations sur la page histoire
window.addEventListener('load', function() {
  const heroHistoire = document.getElementById('hero-histoire');
  if (heroHistoire) {
    // Après que la page soit complètement chargée
    document.body.classList.add('page-loaded');
    
    // Force l'affichage des éléments animés
    const animatedElements = document.querySelectorAll('.hero-histoire-content .animate-element');
    animatedElements.forEach(element => {
      element.classList.add('animate-visible');
    });
    
    // Ajoute une classe spécifique pour indiquer que la page histoire est chargée
    document.body.classList.add('histoire-loaded');
  }
});

// Correctif à ajouter dans script.js
// ==========================================
// CORRECTIONS SPÉCIFIQUES POUR LA PAGE HISTOIRE
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Détection de la page histoire
  const isHistoirePage = document.getElementById('histoire-timeline') !== null;
  
  if (isHistoirePage) {
      console.log("Page histoire détectée, application des correctifs...");
      
      // 1. Forcer l'affichage des sections immédiatement
      const historySections = document.querySelectorAll('.histoire-story-section');
      historySections.forEach(section => {
          section.style.opacity = '1';
          section.style.visibility = 'visible';
          section.style.transform = 'translateY(0)';
          
          // Forcer l'affichage du conteneur d'histoire
          const container = section.querySelector('.histoire-story-container');
          if (container) {
              container.style.opacity = '1';
              container.style.visibility = 'visible';
              container.style.transform = 'translateY(0)';
          }
          
          // Forcer l'affichage de l'icône
          const icon = section.querySelector('.histoire-story-icon');
          if (icon) {
              icon.style.opacity = '1';
              icon.style.visibility = 'visible';
          }
          
          // Forcer l'affichage du contenu
          const content = section.querySelector('.histoire-story-content');
          if (content) {
              content.style.opacity = '1';
              content.style.visibility = 'visible';
          }
          
          // Forcer l'affichage du connecteur
          const connector = section.querySelector('.histoire-timeline-connector');
          if (connector) {
              connector.style.opacity = '1';
              connector.style.visibility = 'visible';
          }
      });
      
      // 2. Correction de la timeline progress
      const timelineProgress = document.getElementById('histoire-timeline-progress');
      if (timelineProgress) {
          // Afficher la ligne de timeline à 50% par défaut si mobile
          if (window.innerWidth <= 768) {
              timelineProgress.style.transform = 'translateX(-50%) scaleY(0.5)';
              timelineProgress.style.opacity = '1';
              timelineProgress.style.visibility = 'visible';
          }
      }
      
      // 3. Forcer l'affichage du contenu du hero
      const heroElements = document.querySelectorAll('.hero-histoire-content .animate-element');
      heroElements.forEach(element => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          element.style.visibility = 'visible';
      });
      
      // 4. Créer une animation manuelle simplifiée pour mobile
      if (window.innerWidth <= 768) {
          // Animation séquentielle des sections sur mobile
          historySections.forEach((section, index) => {
              setTimeout(() => {
                  section.style.transform = 'translateY(0)';
                  section.style.opacity = '1';
                  
                  const container = section.querySelector('.histoire-story-container');
                  if (container) {
                      container.style.transform = 'translateY(0)';
                      container.style.opacity = '1';
                  }
              }, index * 100);
          });
          
          // Mise à jour manuelle de la barre de progression lors du scroll
          window.addEventListener('scroll', function() {
              if (!timelineProgress) return;
              
              const timeline = document.getElementById('histoire-timeline');
              if (!timeline) return;
              
              const rect = timeline.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              
              if (rect.top < windowHeight && rect.bottom > 0) {
                  const scrollProgress = Math.min(1, Math.max(0, 
                      (window.scrollY - (timeline.offsetTop - windowHeight)) / 
                      (timeline.offsetHeight + windowHeight)
                  ));
                  
                  timelineProgress.style.transform = `translateX(-50%) scaleY(${scrollProgress})`;
              }
          });
      }
      
      // 5. Ajout d'une classe pour indiquer que les corrections sont appliquées
      document.body.classList.add('histoire-fixed');
  }
});