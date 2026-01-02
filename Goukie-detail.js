// Goukie-detail.js

// 1. Récupère l'ID depuis l'URL
const params = new URLSearchParams(window.location.search);
const GoukieId = params.get('id');

// Variables globales
let selectedSize = 'moyen';
let currentPrice = 3.90;
let quantity = 1;
let currentGoukie = null;
// NOUVEAU : Variables pour la galerie
let GoukieImages = [];
let currentImageIndex = 0;


// 2. Gestion des options de taille
document.addEventListener('DOMContentLoaded', function() {
  // Initialisation du Goukie sélectionné
  fetchGoukieData();
  
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
  const mainImg = document.getElementById('Goukie-main-img');
  const thumbnails = document.querySelectorAll('#thumbnail-container .thumbnail');

  // Mettre à jour l'image principale
  mainImg.src = GoukieImages[index];
  
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

// Fonction pour configurer les boutons de taille en fonction du type de Goukie
function setupSizeButtons(Goukie) {
  const sizeSelector = document.querySelector('.size-selector');
  
  // Vider le sélecteur de taille actuel
  sizeSelector.innerHTML = '';
  
  // Déterminer la catégorie du Goukie et configurer les boutons en conséquence
  if (Goukie.categorie === 'essentiels') {
    // Pour les Goukies essentiels: petit, moyen
    if (Goukie.prix.petit !== null) {
      addSizeButton(sizeSelector, 'petit', 'Petit', Goukie.prix.petit);
    }
    if (Goukie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Moyen', Goukie.prix.moyen);
    }
  } else if (Goukie.categorie === 'gourmets') {
    // Pour les Goukies gourmets: moyen uniquement
    if (Goukie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Standard', Goukie.prix.moyen);
    }
  } else if (Goukie.categorie === 'edition_limitee') {
    // Pour le Goukie du mois
    if (Goukie.prix.petit !== null) {
      addSizeButton(sizeSelector, 'petit', 'Petit', Goukie.prix.petit);
    }
    if (Goukie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Moyen', Goukie.prix.moyen);
    }
  } else if (Goukie.categorie === 'insolites') {
    // Pour les Goukies insolites
    if (Goukie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Standard', Goukie.prix.moyen);
    }
  } else if (Goukie.categorie === 'epicerie') {
    // Pour les produits d'épicerie (pots)
    if (Goukie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Pot', Goukie.prix.moyen);
    }
  }

  // Pour les Goukies disponibles en format géant
  if (Goukie.format_geant && (Goukie.format_geant.parts_4_6 !== null || Goukie.format_geant.parts_6_8 !== null)) {
    if (Goukie.format_geant.parts_4_6 !== null) {
      addSizeButton(sizeSelector, 'geant_4_6', 'Géant 4-6 parts', Goukie.format_geant.parts_4_6);
    }
    if (Goukie.format_geant.parts_6_8 !== null) {
      addSizeButton(sizeSelector, 'geant_6_8', 'Géant 6-8 parts', Goukie.format_geant.parts_6_8);
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
function displayPackFormats(Goukie) {
  const optionGroup = document.querySelector('.option-group');
  const priceContainer = document.querySelector('.Goukie-price-container');
  
  // Créer un élément pour afficher les offres de lots si applicable
  if (Goukie.categorie === 'essentiels' && Goukie.format_standard.x4 !== null) {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `<p>Offre spéciale: Lot de 4 Goukies pour ${Goukie.format_standard.x4.toFixed(2)} €</p>`;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  } else if (Goukie.categorie === 'gourmets' && Goukie.format_gourmet.x3 !== null) {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `
      <p>Offres spéciales:</p>
      <ul>
        <li>Lot de 3 Goukies gourmets: ${Goukie.format_gourmet.x3.toFixed(2)} €</li>
        <li>Lot de 5 Goukies gourmets: ${Goukie.format_gourmet.x5.toFixed(2)} €</li>
      </ul>
    `;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  } else if (Goukie.categorie === 'insolites' && Goukie.format_gourmet && Goukie.format_gourmet.x3 !== null) {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `
      <p>Offres spéciales:</p>
      <ul>
        <li>Lot de 3 Goukies insolites: ${Goukie.format_gourmet.x3.toFixed(2)} €</li>
        <li>Lot de 5 Goukies insolites: ${Goukie.format_gourmet.x5.toFixed(2)} €</li>
      </ul>
    `;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  } else if (Goukie.categorie === 'mini') {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `
      <p>Formats disponibles:</p>
      <ul>
        <li>2 mini Goukies: ${Goukie.format_mini.x2.toFixed(2)} €</li>
        <li>3 mini Goukies: ${Goukie.format_mini.x3.toFixed(2)} €</li>
        <li>6 mini Goukies: ${Goukie.format_mini.x6.toFixed(2)} €</li>
        <li>9 mini Goukies: ${Goukie.format_mini.x9.toFixed(2)} €</li>
        <li>12 mini Goukies: ${Goukie.format_mini.x12.toFixed(2)} €</li>
        <li>18 mini Goukies: ${Goukie.format_mini.x18.toFixed(2)} €</li>
        <li>24 mini Goukies: ${Goukie.format_mini.x24.toFixed(2)} €</li>
      </ul>
    `;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  }
}

// 3. Récupération des données Goukies.json
function fetchGoukieData() {
  fetch('./Goukies.json')
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erreur HTTP : ${res.status}`);
      }
      return res.json();
    })
    .then(Goukies => {
      const Goukie = Goukies.find(c => c.id.toLowerCase() === GoukieId.toLowerCase());
      if (!Goukie) {
        console.error('Goukie introuvable avec cet ID.');
        return;
      }

      currentGoukie = Goukie;
      const mainImg = document.getElementById('Goukie-main-img');
      const thumbnailContainer = document.getElementById('thumbnail-container');
      const prevBtn = document.getElementById('prev-image-btn');
      const nextBtn = document.getElementById('next-image-btn');

      thumbnailContainer.innerHTML = '';
      GoukieImages = Goukie.images || (Goukie.image ? [Goukie.image] : []);
      currentImageIndex = 0;

      // MODIFIÉ : Logique de la galerie d'images
      if (GoukieImages.length > 0) {
        mainImg.src = GoukieImages[0];
        mainImg.alt = Goukie.nom;

        if (GoukieImages.length > 1) {
          // Affiche les vignettes
          GoukieImages.forEach((imgSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.alt = `${Goukie.nom} - vue ${index + 1}`;
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
            if (nextIndex >= GoukieImages.length) {
              nextIndex = 0; // Boucle au début
            }
            updateGallery(nextIndex);
          });

          prevBtn.addEventListener('click', () => {
            let prevIndex = currentImageIndex - 1;
            if (prevIndex < 0) {
              prevIndex = GoukieImages.length - 1; // Boucle à la fin
            }
            updateGallery(prevIndex);
          });

          // Initialise l'état de la galerie
          updateGallery(0);
        }
      }

      document.getElementById('Goukie-name').textContent = Goukie.nom;
      document.getElementById('Goukie-desc').textContent = Goukie.description;
      
      if (Goukie.id.toLowerCase() === 'mai') {
        document.getElementById('Goukie-badge').style.display = 'block';
      }
      
      setupSizeButtons(Goukie);
      displayPackFormats(Goukie);
      
      const ingredientList = document.getElementById('ingredient-list');
      ingredientList.innerHTML = '';
      Goukie.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientList.appendChild(li);
      });
      
      const addToCartBtn = document.querySelector('.add-to-cart');
      addToCartBtn.addEventListener('click', (event) => {
        const product = {
          id: Goukie.id,
          nom: Goukie.nom,
          image: GoukieImages[0],
          taille: selectedSize,
          prix: currentPrice,
          quantity: quantity
        };
        
        if (typeof addToCart === 'function') {
          addToCart(product, event);
        }
      });
      
      setupSuggestions(Goukies, Goukie);
    })
    .catch(err => {
      console.error('Erreur lors du chargement des Goukies :', err);
    });
}

// Configuration du carrousel de suggestions
function setupSuggestions(allGoukies, currentGoukie) {
  const suggestionsTrack = document.getElementById('suggestions-track');
  suggestionsTrack.innerHTML = '';
  
  const filteredGoukies = allGoukies.filter(c => c.id !== currentGoukie.id);
  
  const sortedSuggestions = [
    ...filteredGoukies.filter(c => c.categorie === currentGoukie.categorie),
    ...filteredGoukies.filter(c => c.categorie !== currentGoukie.categorie)
  ];
  
  const suggestions = sortedSuggestions.slice(0, 6);
  
  suggestions.forEach(Goukie => {
    const card = document.createElement('a');
    card.href = `Goukie-detail.html?id=${Goukie.id}`;
    card.className = 'Goukie-card';
    const mainImage = Goukie.images ? Goukie.images[0] : Goukie.image;
    card.innerHTML = `
      <img src="${mainImage}" alt="${Goukie.nom}">
      <h3>${Goukie.nom}</h3>
      <p>${Goukie.description.split('.')[0]}.</p>
    `;
    suggestionsTrack.appendChild(card);
  });
  
  document.getElementById('prevSuggestion').addEventListener('click', () => {
    const track = document.getElementById('suggestions-track');
    const cardWidth = track.querySelector('.Goukie-card').offsetWidth + 24;
    track.scrollBy({ 
      left: -cardWidth * 3,
      behavior: 'smooth' 
    });
  });

  document.getElementById('nextSuggestion').addEventListener('click', () => {
    const track = document.getElementById('suggestions-track');
    const cardWidth = track.querySelector('.Goukie-card').offsetWidth + 24;
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