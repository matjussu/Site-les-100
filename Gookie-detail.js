// Gookie-detail.js

// 1. Récupère l'ID depuis l'URL
const params = new URLSearchParams(window.location.search);
const GookieId = params.get('id');

// Variables globales
let selectedSize = 'moyen';
let currentPrice = 3.90;
let quantity = 1;
let currentGookie = null;
// NOUVEAU : Variables pour la galerie
let GookieImages = [];
let currentImageIndex = 0;


// 2. Gestion des options de taille
document.addEventListener('DOMContentLoaded', function() {
  // Initialisation du Gookie sélectionné
  fetchGookieData();
  
  // Gestion de la quantité
  const quantityInput = document.getElementById('quantity');
  const minusBtn = document.querySelector('.quantity-btn.minus');
  const plusBtn = document.querySelector('.quantity-btn.plus');
  
  minusBtn.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      quantityInput.value = quantity;
      updatePrice();
    }
  });
  
  plusBtn.addEventListener('click', () => {
    if (quantity < 10) {
      quantity++;
      quantityInput.value = quantity;
      updatePrice();
    }
  });
  
  quantityInput.addEventListener('change', () => {
    quantity = parseInt(quantityInput.value);
    if (quantity < 1) quantity = 1;
    if (quantity > 10) quantity = 10;
    quantityInput.value = quantity;
    updatePrice();
  });
  
});

// NOUVEAU : Fonction pour mettre à jour la galerie (image principale et vignettes)
function updateGallery(index) {
  const mainImg = document.getElementById('Gookie-main-img');
  const thumbnails = document.querySelectorAll('#thumbnail-container .thumbnail');

  // Mettre à jour l'image principale
  mainImg.src = GookieImages[index];
  
  // Mettre à jour la classe 'active' sur les vignettes
  thumbnails.forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });

  // Mettre à jour l'index courant
  currentImageIndex = index;
}

// Fonction de mise à jour du prix
function updatePrice() {
  let totalPrice = currentPrice * quantity;
  document.querySelector('.current-price').textContent = `${totalPrice.toFixed(2)} €`;
}

// Fonction pour configurer les boutons de taille en fonction du type de Gookie
function setupSizeButtons(Gookie) {
  const sizeSelector = document.querySelector('.size-selector');
  
  // Vider le sélecteur de taille actuel
  sizeSelector.innerHTML = '';
  
  // Déterminer la catégorie du Gookie et configurer les boutons en conséquence
  if (Gookie.categorie === 'essentiels') {
    // Pour les Gookies essentiels: petit, moyen
    if (Gookie.prix.petit !== null) {
      addSizeButton(sizeSelector, 'petit', 'Petit', Gookie.prix.petit);
    }
    if (Gookie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Moyen', Gookie.prix.moyen);
    }
  } else if (Gookie.categorie === 'gourmets') {
    // Pour les Gookies gourmets: moyen uniquement
    if (Gookie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Standard', Gookie.prix.moyen);
    }
  } else if (Gookie.categorie === 'edition_limitee') {
    // Pour le Gookie du mois
    if (Gookie.prix.petit !== null) {
      addSizeButton(sizeSelector, 'petit', 'Petit', Gookie.prix.petit);
    }
    if (Gookie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Moyen', Gookie.prix.moyen);
    }
  }
  
  // Pour les Gookies disponibles en format géant
  if (Gookie.format_geant && (Gookie.format_geant.parts_4_6 !== null || Gookie.format_geant.parts_6_8 !== null)) {
    if (Gookie.format_geant.parts_4_6 !== null) {
      addSizeButton(sizeSelector, 'geant_4_6', 'Géant 4-6 parts', Gookie.format_geant.parts_4_6);
    }
    if (Gookie.format_geant.parts_6_8 !== null) {
      addSizeButton(sizeSelector, 'geant_6_8', 'Géant 6-8 parts', Gookie.format_geant.parts_6_8);
    }
  }
  
  // Ajouter les écouteurs d'événements pour les boutons de taille
  const sizeOptions = document.querySelectorAll('.size-option');
  sizeOptions.forEach(button => {
    button.addEventListener('click', function() {
      // Retirer la classe active de tous les boutons
      sizeOptions.forEach(btn => btn.classList.remove('active'));
      // Ajouter la classe active au bouton cliqué
      this.classList.add('active');
      
      // Mettre à jour la taille sélectionnée et le prix
      selectedSize = this.dataset.size;
      currentPrice = parseFloat(this.querySelector('.price').dataset.price);
      updatePrice();
    });
  });
  
  // Sélectionner le premier bouton par défaut
  if (sizeOptions.length > 0) {
    sizeOptions[0].click();
  }
}

// Fonction d'aide pour ajouter un bouton de taille
function addSizeButton(container, sizeId, sizeLabel, price) {
  const button = document.createElement('button');
  button.className = 'size-option';
  button.dataset.size = sizeId;
  button.innerHTML = `${sizeLabel}<br><span class="price" data-price="${price}">${price.toFixed(2)} €</span>`;
  container.appendChild(button);
}

// Fonction pour afficher les formats d'achat groupés (lots)
function displayPackFormats(Gookie) {
  const optionGroup = document.querySelector('.option-group');
  const priceContainer = document.querySelector('.Gookie-price-container');
  
  // Créer un élément pour afficher les offres de lots si applicable
  if (Gookie.categorie === 'essentiels' && Gookie.format_standard.x4 !== null) {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `<p>Offre spéciale: Lot de 4 Gookies pour ${Gookie.format_standard.x4.toFixed(2)} €</p>`;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  } else if (Gookie.categorie === 'gourmets' && Gookie.format_gourmet.x3 !== null) {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `
      <p>Offres spéciales:</p>
      <ul>
        <li>Lot de 3 Gookies gourmets: ${Gookie.format_gourmet.x3.toFixed(2)} €</li>
        <li>Lot de 5 Gookies gourmets: ${Gookie.format_gourmet.x5.toFixed(2)} €</li>
      </ul>
    `;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  } else if (Gookie.categorie === 'mini') {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `
      <p>Formats disponibles:</p>
      <ul>
        <li>2 mini Gookies: ${Gookie.format_mini.x2.toFixed(2)} €</li>
        <li>3 mini Gookies: ${Gookie.format_mini.x3.toFixed(2)} €</li>
        <li>6 mini Gookies: ${Gookie.format_mini.x6.toFixed(2)} €</li>
        <li>9 mini Gookies: ${Gookie.format_mini.x9.toFixed(2)} €</li>
        <li>12 mini Gookies: ${Gookie.format_mini.x12.toFixed(2)} €</li>
        <li>18 mini Gookies: ${Gookie.format_mini.x18.toFixed(2)} €</li>
        <li>24 mini Gookies: ${Gookie.format_mini.x24.toFixed(2)} €</li>
      </ul>
    `;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  }
}

// 3. Récupération des données Gookies.json
function fetchGookieData() {
  fetch('./Gookies.json')
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erreur HTTP : ${res.status}`);
      }
      return res.json();
    })
    .then(Gookies => {
      const Gookie = Gookies.find(c => c.id.toLowerCase() === GookieId.toLowerCase());
      if (!Gookie) {
        console.error('Gookie introuvable avec cet ID.');
        return;
      }

      currentGookie = Gookie;
      const mainImg = document.getElementById('Gookie-main-img');
      const thumbnailContainer = document.getElementById('thumbnail-container');
      const prevBtn = document.getElementById('prev-image-btn');
      const nextBtn = document.getElementById('next-image-btn');

      thumbnailContainer.innerHTML = '';
      GookieImages = Gookie.images || (Gookie.image ? [Gookie.image] : []);
      currentImageIndex = 0;

      // MODIFIÉ : Logique de la galerie d'images
      if (GookieImages.length > 0) {
        mainImg.src = GookieImages[0];
        mainImg.alt = Gookie.nom;

        if (GookieImages.length > 1) {
          // Affiche les vignettes
          GookieImages.forEach((imgSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.alt = `${Gookie.nom} - vue ${index + 1}`;
            thumb.className = 'thumbnail';
            thumb.addEventListener('click', () => updateGallery(index));
            thumbnailContainer.appendChild(thumb);
          });
          
          // Affiche les boutons de navigation
          prevBtn.style.display = 'flex';
          nextBtn.style.display = 'flex';

          // Ajoute les événements sur les boutons
          nextBtn.addEventListener('click', () => {
            let nextIndex = currentImageIndex + 1;
            if (nextIndex >= GookieImages.length) {
              nextIndex = 0; // Boucle au début
            }
            updateGallery(nextIndex);
          });

          prevBtn.addEventListener('click', () => {
            let prevIndex = currentImageIndex - 1;
            if (prevIndex < 0) {
              prevIndex = GookieImages.length - 1; // Boucle à la fin
            }
            updateGallery(prevIndex);
          });

          // Initialise l'état de la galerie
          updateGallery(0);
        }
      }

      document.getElementById('Gookie-name').textContent = Gookie.nom;
      document.getElementById('Gookie-desc').textContent = Gookie.description;
      
      if (Gookie.id.toLowerCase() === 'mai') {
        document.getElementById('Gookie-badge').style.display = 'block';
      }
      
      setupSizeButtons(Gookie);
      displayPackFormats(Gookie);
      
      const ingredientList = document.getElementById('ingredient-list');
      ingredientList.innerHTML = '';
      Gookie.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientList.appendChild(li);
      });
      
      const addToCartBtn = document.querySelector('.add-to-cart');
      addToCartBtn.addEventListener('click', (event) => {
        const product = {
          id: Gookie.id,
          nom: Gookie.nom,
          image: GookieImages[0],
          taille: selectedSize,
          prix: currentPrice,
          quantity: quantity
        };
        
        if (typeof addToCart === 'function') {
          addToCart(product, event);
        }
      });
      
      setupSuggestions(Gookies, Gookie);
    })
    .catch(err => {
      console.error('Erreur lors du chargement des Gookies :', err);
    });
}

// Configuration du carrousel de suggestions
function setupSuggestions(allGookies, currentGookie) {
  const suggestionsTrack = document.getElementById('suggestions-track');
  suggestionsTrack.innerHTML = '';
  
  const filteredGookies = allGookies.filter(c => c.id !== currentGookie.id);
  
  const sortedSuggestions = [
    ...filteredGookies.filter(c => c.categorie === currentGookie.categorie),
    ...filteredGookies.filter(c => c.categorie !== currentGookie.categorie)
  ];
  
  const suggestions = sortedSuggestions.slice(0, 6);
  
  suggestions.forEach(Gookie => {
    const card = document.createElement('a');
    card.href = `Gookie-detail.html?id=${Gookie.id}`;
    card.className = 'Gookie-card';
    const mainImage = Gookie.images ? Gookie.images[0] : Gookie.image;
    card.innerHTML = `
      <img src="${mainImage}" alt="${Gookie.nom}">
      <h3>${Gookie.nom}</h3>
      <p>${Gookie.description.split('.')[0]}.</p>
    `;
    suggestionsTrack.appendChild(card);
  });
  
  document.getElementById('prevSuggestion').addEventListener('click', () => {
    const track = document.getElementById('suggestions-track');
    const cardWidth = track.querySelector('.Gookie-card').offsetWidth + 24;
    track.scrollBy({ 
      left: -cardWidth * 3,
      behavior: 'smooth' 
    });
  });

  document.getElementById('nextSuggestion').addEventListener('click', () => {
    const track = document.getElementById('suggestions-track');
    const cardWidth = track.querySelector('.Gookie-card').offsetWidth + 24;
    track.scrollBy({ 
      left: cardWidth * 3,
      behavior: 'smooth' 
    });
  });

  const track = document.getElementById('suggestions-track');
  const prevBtn = document.getElementById('prevSuggestion');
  const nextBtn = document.getElementById('nextSuggestion');

  function updateButtonsVisibility() {
    prevBtn.style.opacity = track.scrollLeft <= 0 ? '0.5' : '1';
    prevBtn.style.pointerEvents = track.scrollLeft <= 0 ? 'none' : 'auto';
    
    const maxScroll = track.scrollWidth - track.clientWidth;
    nextBtn.style.opacity = track.scrollLeft >= maxScroll - 5 ? '0.5' : '1';
    nextBtn.style.pointerEvents = track.scrollLeft >= maxScroll - 5 ? 'none' : 'auto';
  }

  track.addEventListener('scroll', updateButtonsVisibility);
  updateButtonsVisibility();
}