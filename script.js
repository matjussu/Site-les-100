// Configuration GSAP globale pour des animations plus fluides
gsap.config({
  force3D: true,
  nullTargetWarn: false
});

// Animations fluides avec GSAP
document.addEventListener('DOMContentLoaded', function() {
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
  
  // Préchargement des images pour éviter les saccades
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
      gsap.to(loader, {
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          loader.remove();
          initMainAnimations();
        }
      });
    }
  }
  
  images.forEach(img => {
    if (img.complete) {
      imageLoaded();
    } else {
      img.addEventListener('load', imageLoaded);
      img.addEventListener('error', imageLoaded);
    }
  });
  
  // Si aucune image, lancer directement les animations
  if (totalImages === 0) {
    setTimeout(() => {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          loader.remove();
          initMainAnimations();
        }
      });
    }, 1500);
  }
  
  function initMainAnimations() {
    // Parallaxe amélioré avec GSAP
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
    
    // Parallaxe sur les sections
    const parallaxSections = document.querySelectorAll('.parallax-container');
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
    
    // Animations d'entrée des éléments
    gsap.utils.toArray('.animate-element').forEach(element => {
      gsap.fromTo(element, 
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
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
    
    // Timeline animations améliorées
    const timelineItems = document.querySelectorAll('.story-section');
    timelineItems.forEach((item, index) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
      
      const direction = index % 2 === 0 ? -100 : 100;
      
      tl.from(item.querySelector('.story-container'), {
        x: direction,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      })
      .from(item.querySelector('.story-icon'), {
        scale: 0,
        rotation: -180,
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, '-=0.4')
      .from(item.querySelector('.story-content'), {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3');
    });
    
    // Transitions de page ultra-fluides
    const pageLinks = document.querySelectorAll('a[href$=".html"]:not([href^="#"])');
    pageLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        
        const tl = gsap.timeline();
        tl.to('#page-transition', {
          scaleY: 1,
          transformOrigin: 'bottom center',
          duration: 0.5,
          ease: 'power2.inOut'
        })
        .to('.logo img', {
          rotation: 360,
          scale: 0.8,
          duration: 0.5,
          ease: 'power2.inOut'
        }, '-=0.5')
        .to('body', {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            window.location.href = href;
          }
        });
      });
    });
    
    // Animation du bouton panier
    const btnPanier = document.querySelector('.btn-panier');
    if (btnPanier) {
      btnPanier.addEventListener('click', function() {
        // Animation de particules
        for (let i = 0; i < 8; i++) {
          const particle = document.createElement('div');
          particle.className = 'cart-particle';
          document.body.appendChild(particle);
          
          const angle = (i / 8) * Math.PI * 2;
          const distance = 50 + Math.random() * 50;
          
          gsap.set(particle, {
            x: this.offsetLeft + this.offsetWidth / 2,
            y: this.offsetTop + this.offsetHeight / 2
          });
          
          gsap.to(particle, {
            x: '+=' + Math.cos(angle) * distance,
            y: '+=' + Math.sin(angle) * distance,
            opacity: 0,
            scale: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => particle.remove()
          });
        }
        
        // Animation du bouton
        gsap.timeline()
          .to(this, {
            scale: 0.95,
            duration: 0.1
          })
          .to(this, {
            scale: 1.05,
            duration: 0.2,
            ease: 'back.out(2)'
          })
          .to(this, {
            scale: 1,
            duration: 0.2
          });
        
        // Notification
        const notification = document.createElement('div');
        notification.className = 'add-to-cart-notification';
        notification.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span>Ajouté au panier</span>
        `;
        document.body.appendChild(notification);
        
        gsap.fromTo(notification, 
          { y: 100, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.4, 
            ease: 'back.out(1.7)',
            onComplete: () => {
              gsap.to(notification, {
                y: -100,
                opacity: 0,
                duration: 0.4,
                delay: 2,
                ease: 'power2.in',
                onComplete: () => notification.remove()
              });
            }
          }
        );
      });
    }
    
    // Animation du changement de prix
    const cookieSize = document.getElementById('cookie-size');
    if (cookieSize) {
      cookieSize.addEventListener('change', function() {
        const prixElement = document.getElementById('prix-actuel');
        gsap.fromTo(prixElement,
          { scale: 1.2, color: '#f8660e' },
          { 
            scale: 1, 
            color: '#333', 
            duration: 0.5, 
            ease: 'elastic.out(1, 0.5)'
          }
        );
      });
    }
    
    // Scroll indicator animation
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = `
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
    `;
    const heroSection = document.querySelector('#hero');
    if (heroSection) {
      heroSection.appendChild(scrollIndicator);
      
      gsap.to(scrollIndicator, {
        y: 15,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }
  }
});

// Performance optimization
window.addEventListener('load', () => {
  // Lazy loading des images
  const lazyImages = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => imageObserver.observe(img));
});

// Fix pour la transition de retour
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    window.location.reload();
  }
});