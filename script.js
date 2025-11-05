// ==========================================
// CONFIGURATION GSAP
// ==========================================
gsap.config({
  force3D: true,
  nullTargetWarn: false
});

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let pageIsReady = false;
let animationsStarted = false;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ==========================================
// UTILITAIRES
// ==========================================
const utils = {
  isMobile: () => window.innerWidth <= 768,
  isHistoirePage: () => document.getElementById('histoire-timeline') !== null,
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ==========================================
// GESTION DU MENU MOBILE (VERSION UNIQUE)
// ==========================================
const MobileMenu = {
  menuToggle: null,
  navList: null,
  header: null,
  isInitialized: false,

  init() {
    if (this.isInitialized) return;

    this.header = document.querySelector('header');
    this.navList = document.querySelector('nav ul');

    if (!this.header || !this.navList) return;

    this.createMenuButton();
    this.attachEventListeners();
    this.setupHeaderStyle();
    this.isInitialized = true;
  },

  createMenuButton() {
    this.menuToggle = document.querySelector('.menu-toggle');

    if (!this.menuToggle) {
      this.menuToggle = document.createElement('button');
      this.menuToggle.className = 'menu-toggle';
      this.menuToggle.setAttribute('aria-label', 'Menu');
      this.menuToggle.setAttribute('aria-expanded', 'false');
      this.menuToggle.innerHTML = '<span></span><span></span><span></span>';
      this.header.appendChild(this.menuToggle);
    }
  },

  attachEventListeners() {
    // Toggle menu
    this.menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu();
    });

    // Fermer le menu quand on clique sur un lien
    this.navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
      if (this.navList.classList.contains('active') &&
          !this.navList.contains(e.target) &&
          !this.menuToggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Ajustement pour l'orientation du téléphone
    window.addEventListener('resize', utils.debounce(() => {
      if (!utils.isMobile() && this.navList.classList.contains('active')) {
        this.closeMenu();
      }
    }, 250));
  },

  toggleMenu() {
    const isExpanded = this.navList.classList.toggle('active');
    this.menuToggle.classList.toggle('active');
    this.menuToggle.setAttribute('aria-expanded', isExpanded);
    document.body.style.overflow = isExpanded ? 'hidden' : '';
  },

  closeMenu() {
    this.navList.classList.remove('active');
    this.menuToggle.classList.remove('active');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },

  setupHeaderStyle() {
    if (utils.isHistoirePage() && utils.isMobile()) {
      this.header.style.position = 'relative';
    } else {
      this.header.style.position = 'fixed';
      this.header.style.top = '0';
      this.header.style.left = '0';
      this.header.style.right = '0';
      this.header.style.width = '100%';
      this.header.style.zIndex = '1000';

      // Ajouter un padding au contenu principal
      const mainContent = document.querySelector('#hero, #hero-histoire, .Goukies-intro, .contact-hero, .Goukie-detail-hero, .main-content, .page-hero');
      if (mainContent && !utils.isMobile()) {
        mainContent.style.paddingTop = '70px';
      }
    }
  }
};

// ==========================================
// ANIMATIONS DE PAGE
// ==========================================
const PageAnimations = {
  startPageAnimations() {
    if (!pageIsReady || animationsStarted) return;
    animationsStarted = true;

    const introTimeline = gsap.timeline();

    introTimeline.to('#hero .content', {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    });

    const heroElements = document.querySelectorAll('#hero .animate-element');
    heroElements.forEach((element, index) => {
      element.style.visibility = 'visible';

      introTimeline.fromTo(element,
        { opacity: 0, y: 50 },
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

    introTimeline.add(() => {
      heroElements.forEach(element => {
        gsap.set(element, { opacity: 1, y: 0, visibility: 'visible' });
      });
    });

    document.body.classList.add('page-loaded');
  },

  initMainAnimations() {
    try {
      gsap.registerPlugin(ScrollTrigger);

      this.setupHeaderAnimation();
      this.setupParallax();
      this.setupCardAnimations();
      this.setupPageTransitions();
    } catch (error) {
      // Gestion silencieuse des erreurs d'animation non critiques
    }
  },

  setupHeaderAnimation() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      const header = document.querySelector('header');

      if (!header) return;

      if (currentScroll > 50) {
        gsap.to(header, {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
          duration: 0.3
        });
        header.classList.add('scrolled');
      } else {
        gsap.to(header, {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          duration: 0.3
        });
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
  },

  setupParallax() {
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

    // Désactive l'effet parallax sur le hero
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
  },

  setupCardAnimations() {
    const GoukieCards = document.querySelectorAll('.Goukie-card');
    GoukieCards.forEach((card, index) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          scale: 1.02,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          duration: 0.4,
          ease: 'power2.out'
        });

        const img = card.querySelector('img');
        if (img) {
          gsap.to(img, {
            scale: 1.1,
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
          duration: 0.4,
          ease: 'power2.out'
        });

        const img = card.querySelector('img');
        if (img) {
          gsap.to(img, {
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      });

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
  },

  setupPageTransitions() {
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

          const tl = gsap.timeline();

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
          }, 0)
          .to('body', {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut'
          })
          .to({}, { duration: 0.2 })
          .add(() => {
            window.location.href = href;
          });
        } else {
          window.location.href = href;
        }
      });
    });
  }
};

// ==========================================
// LOADER DE PAGE
// ==========================================
const PageLoader = {
  create() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-logo-wrapper">
          <img src="logo/logo les100_DEF ROND.png" alt="Logo" class="loader-logo">
          <div class="loader-progress"></div>
        </div>
        <div class="loader-text">Chargement des Goukies...</div>
      </div>
    `;
    document.body.appendChild(loader);

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
  },

  init() {
    const pageTransition = document.getElementById('page-transition');
    if (pageTransition) {
      pageTransition.style.opacity = '0';
      pageTransition.style.visibility = 'hidden';
    }

    const loader = this.create();
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    const totalImages = images.length;

    const imageLoaded = () => {
      loadedImages++;
      const progress = loadedImages / totalImages;
      gsap.to('.loader-progress', {
        scaleX: progress,
        duration: 0.3,
        ease: 'power1.inOut'
      });

      if (loadedImages === totalImages) {
        this.remove(loader);
      }
    };

    images.forEach(img => {
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded);
      }
    });

    if (totalImages === 0) {
      setTimeout(() => this.remove(loader), 1500);
    }
  },

  remove(loader) {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.remove();
        pageIsReady = true;
        setTimeout(PageAnimations.startPageAnimations, 100);
      }
    });
  }
};

// ==========================================
// SYSTÈME DE PANIER
// ==========================================
const Cart = {
  get items() {
    return cart;
  },

  addToCart(product, event) {
    try {
      const existingProduct = cart.find(item =>
        item.id === product.id && item.taille === product.taille
      );

      if (existingProduct) {
        existingProduct.quantity += product.quantity || 1;
      } else {
        cart.push({
          ...product,
          quantity: product.quantity || 1
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      this.updateCartCount();
      this.showNotification(product);
      if (event) this.animateAddToCart(event, product);
    } catch (error) {
      // Gestion silencieuse, ne pas interrompre l'expérience utilisateur
    }
  },

  updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartIndicator = document.querySelector('.cart-count');

    if (cartIndicator) {
      cartIndicator.textContent = count;
      cartIndicator.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  animateAddToCart(event, product) {
    const button = event.target;
    const productCard = button.closest('.Goukie-card, .Goukie-detail');
    if (!productCard) return;

    const productImage = productCard.querySelector('img');
    if (!productImage) return;

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

    const cartIcon = document.querySelector('.cart-icon');
    if (!cartIcon) {
      imageClone.remove();
      return;
    }

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
        gsap.fromTo('.cart-count',
          { scale: 0.5 },
          { scale: 1, duration: 0.3, ease: 'back.out(4)' }
        );
      }
    });
  },

  showNotification(product) {
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

    gsap.fromTo(notification,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    notification.querySelector('.view-cart-btn').addEventListener('click', () => {
      this.showModal();
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
  },

  showModal() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
      <div class="cart-modal-content">
        <div class="cart-modal-header">
          <h2>Votre panier du marché</h2>
          <button class="close-modal">×</button>
        </div>
        <div class="cart-modal-body">
          ${cart.length > 0 ? this.generateCartItems() : '<p class="empty-cart">Votre panier est vide</p>'}
        </div>
        <div class="cart-modal-footer">
          <div class="cart-total">
            <span>Total:</span>
            <span>${this.calculateTotal()}€</span>
          </div>
          <div class="cart-info">
            <p>Les Goukies sont disponibles uniquement au marché de Gouvieux, tous les dimanches.</p>
            <p>Suivez-nous sur Instagram <a href="https://instagram.com/les100_gluten_oeuf_lactose" target="_blank">@les100_gluten_oeuf_lactose</a></p>
          </div>
          <div class="cart-actions">
            <a href="contact.html" class="contact-btn">Nous contacter</a>
            <button class="close-cart-btn">Continuer vos découvertes</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    gsap.fromTo(modal,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );

    gsap.fromTo('.cart-modal-content',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );

    this.attachModalEventListeners(modal);
  },

  attachModalEventListeners(modal) {
    modal.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', () => {
        this.updateQuantity(btn.dataset.id, btn.dataset.taille, -1);
      });
    });

    modal.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', () => {
        this.updateQuantity(btn.dataset.id, btn.dataset.taille, 1);
      });
    });

    modal.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeFromCart(btn.dataset.id, btn.dataset.taille);
      });
    });

    const closeModal = () => {
      gsap.to(modal, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          modal.remove();
          document.body.style.overflow = '';
        }
      });
    };

    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.querySelector('.close-cart-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  },

  generateCartItems() {
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
  },

  calculateTotal() {
    return cart.reduce((total, item) => total + (item.prix * item.quantity), 0).toFixed(2);
  },

  updateQuantity(id, taille, change) {
    const item = cart.find(item => item.id === id && item.taille === taille);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        this.removeFromCart(id, taille);
      } else {
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateUI();
      }
    }
  },

  removeFromCart(id, taille) {
    cart = cart.filter(item => !(item.id === id && item.taille === taille));
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateUI();
  },

  updateUI() {
    this.updateCartCount();

    const modalBody = document.querySelector('.cart-modal-body');
    if (modalBody) {
      modalBody.innerHTML = cart.length > 0 ? this.generateCartItems() : '<p class="empty-cart">Votre panier est vide</p>';

      const totalElement = document.querySelector('.cart-total span:last-child');
      if (totalElement) {
        totalElement.textContent = this.calculateTotal() + '€';
      }

      if (cart.length > 0) {
        this.attachModalEventListeners(document.querySelector('.cart-modal'));
      }
    }
  },

  initCartIcon() {
    const nav = document.querySelector('nav ul');
    if (nav && !document.querySelector('.cart-icon')) {
      const cartLi = document.createElement('li');
      cartLi.innerHTML = `
        <a href="#" class="cart-icon">
          <svg width="24" height="24" viewBox="0 0 512 512" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M140 160C140 160 140 70 256 70C372 70 372 160 372 160" stroke="currentColor" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="60" y="160" width="392" height="50" rx="10" stroke="currentColor" stroke-width="24" fill="none"/>
            <path d="M80 210L110 430C110 440 120 450 130 450H382C392 450 402 440 402 430L432 210" stroke="currentColor" stroke-width="24" fill="none" stroke-linejoin="round"/>
            <path d="M155 210L170 450" stroke="currentColor" stroke-width="20" fill="none"/>
            <path d="M256 210L256 450" stroke="currentColor" stroke-width="20" fill="none"/>
            <path d="M357 210L342 450" stroke="currentColor" stroke-width="20" fill="none"/>
            <path d="M85 290L427 290" stroke="currentColor" stroke-width="20" fill="none"/>
            <path d="M95 370L417 370" stroke="currentColor" stroke-width="20" fill="none"/>
          </svg>
          <span class="cart-count">0</span>
        </a>
      `;
      nav.appendChild(cartLi);

      document.querySelector('.cart-icon').addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal();
      });

      this.updateCartCount();
    }
  }
};

// ==========================================
// PAGE HISTOIRE
// ==========================================
const HistoirePage = {
  init() {
    if (!utils.isHistoirePage()) return;

    this.setupHeroAnimations();
    this.setupTimelineAnimations();
    this.ensureVisibility();
  },

  setupHeroAnimations() {
    const animatedElements = document.querySelectorAll('.hero-histoire-content .animate-element');

    setTimeout(() => {
      animatedElements.forEach((element, index) => {
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          element.style.visibility = 'visible';
        }, index * 200);
      });
    }, 300);
  },

  setupTimelineAnimations() {
    const timelineProgress = document.querySelector('.timeline-progress');
    if (timelineProgress) {
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

    const storySections = document.querySelectorAll('.story-section, .histoire-story-section');
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
  },

  ensureVisibility() {
    document.querySelectorAll('#histoire-timeline, .histoire-story-section, .histoire-story-container, .histoire-story-icon, .histoire-story-content, .histoire-timeline-connector').forEach(el => {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });

    document.querySelectorAll('.hero-histoire-content .animate-element').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.visibility = 'visible';
    });
  }
};

// ==========================================
// GOUKIE DU MOIS
// ==========================================
const GoukieOfTheMonth = {
  data: {
    id: "novembre",
    nom: "Novembre - Crumble Amande",
    description: "Découvrez notre Goukie de la rentrée : une base sablée recouverte d'un crumble croustillant à l'amande.",
    image: "goukie_images/le-novembre-1.webp",
    featured: true
  },

  init() {
    this.addHeroBadge();
    this.addCatalogBanner();
    this.highlightInGrid();
  },

  addHeroBadge() {
    const heroSection = document.querySelector('#hero');
    if (heroSection) {
      const badge = document.createElement('div');
      badge.className = 'featured-badge';
      badge.innerHTML = `
        <div class="featured-content">
          <span class="featured-title">Goukie du Mois</span>
          <span class="featured-name">${this.data.nom}</span>
          <a href="Goukie-detail.html?id=${this.data.id}" class="featured-link">Découvrir</a>
        </div>
      `;
      heroSection.appendChild(badge);

      gsap.from(badge, {
        x: 100,
        opacity: 0,
        duration: 1,
        delay: 1.5,
        ease: 'power3.out'
      });
    }
  },

  addCatalogBanner() {
    const GoukiePage = document.querySelector('.Goukies-catalogue');
    if (GoukiePage) {
      const banner = document.createElement('div');
      banner.className = 'Goukie-month-banner';
      banner.innerHTML = `
        <div class="banner-content">
          <div class="banner-text">
            <h3>Goukie du Mois</h3>
            <h2>${this.data.nom}</h2>
            <p>${this.data.description}</p>
            <a href="Goukie-detail.html?id=${this.data.id}" class="banner-btn">Découvrir</a>
          </div>
          <div class="banner-image">
            <img src="${this.data.image}" alt="${this.data.nom}">
          </div>
        </div>
      `;

      GoukiePage.insertBefore(banner, GoukiePage.firstChild);

      gsap.from('.banner-content', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: '.Goukie-month-banner',
          start: 'top 80%'
        }
      });
    }
  },

  highlightInGrid() {
    const GoukieCards = document.querySelectorAll('.Goukie-card');
    GoukieCards.forEach(card => {
      if (card.href && card.href.includes(this.data.id)) {
        card.classList.add('featured-Goukie');
        const ribbon = document.createElement('div');
        ribbon.className = 'featured-ribbon';
        ribbon.textContent = 'Goukie du Mois';
        card.appendChild(ribbon);
      }
    });
  }
};

// ==========================================
// OPTIMISATIONS MOBILE
// ==========================================
const MobileOptimizations = {
  init() {
    if (utils.isMobile()) {
      this.disableHeavyAnimations();
      this.optimizeImages();
      this.simplifyScrollAnimations();
    }
  },

  disableHeavyAnimations() {
    document.querySelectorAll('.parallax-bg').forEach(parallax => {
      parallax.style.transform = 'none';
      parallax.style.willChange = 'auto';
    });

    const heroHistoireParallax = document.querySelector('#hero-histoire .parallax-bg');
    if (heroHistoireParallax) {
      heroHistoireParallax.style.position = 'absolute';
      heroHistoireParallax.style.transform = 'none';
      heroHistoireParallax.style.top = '0';
      heroHistoireParallax.style.left = '0';
      heroHistoireParallax.style.width = '100%';
      heroHistoireParallax.style.height = '100%';
      heroHistoireParallax.style.objectFit = 'cover';
    }
  },

  optimizeImages() {
    document.querySelectorAll('img:not(.hero-logo):not(.logo img)').forEach(img => {
      if (!img.src.includes('logo')) {
        img.loading = 'lazy';
      }
    });
  },

  simplifyScrollAnimations() {
    const scrollTriggers = ScrollTrigger.getAll();
    scrollTriggers.forEach(st => {
      if (st.animation && typeof st.animation.duration === 'function') {
        const currentDuration = st.animation.duration();
        st.animation.duration(currentDuration * 0.7);
      }
    });
  }
};

// ==========================================
// FONCTIONS GLOBALES (pour compatibilité avec HTML)
// ==========================================
function addToCart(product, event) {
  Cart.addToCart(product, event);
}

function showCartModal() {
  Cart.showModal();
}

function initGoukieOfTheMonth() {
  GoukieOfTheMonth.init();
}

// ==========================================
// INITIALISATION PRINCIPALE
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  PageLoader.init();
  MobileMenu.init();
  Cart.initCartIcon();
  HistoirePage.init();
  GoukieOfTheMonth.init();
});

window.addEventListener('load', () => {
  if (pageIsReady) {
    PageAnimations.initMainAnimations();
    MobileOptimizations.init();
  } else {
    const checkReady = setInterval(() => {
      if (pageIsReady) {
        clearInterval(checkReady);
        PageAnimations.initMainAnimations();
        MobileOptimizations.init();
      }
    }, 100);
  }

  if (utils.isHistoirePage()) {
    document.body.classList.add('page-loaded');
    document.body.classList.add('histoire-loaded');
  }
});

// Fix pour la transition de retour
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    window.location.reload();
  }
});
