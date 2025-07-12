// cookie-detail.js

// 1. Récupère l'ID depuis l'URL
const params = new URLSearchParams(window.location.search);
const cookieId = params.get('id');

// Variables globales
let selectedSize = 'moyen';
let currentPrice = 3.90;
let quantity = 1;
let currentCookie = null;

// 2. Gestion des options de taille
document.addEventListener('DOMContentLoaded', function() {
  // Initialisation du cookie sélectionné
  fetchCookieData();
  
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
  
  // Gestion des onglets
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Retirer la classe active de tous les onglets et contenus
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Ajouter la classe active à l'onglet cliqué et son contenu
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
});

// Fonction de mise à jour du prix
function updatePrice() {
  let totalPrice = currentPrice * quantity;
  document.querySelector('.current-price').textContent = `${totalPrice.toFixed(2)} €`;
}

// Fonction pour configurer les boutons de taille en fonction du type de cookie
function setupSizeButtons(cookie) {
  const sizeSelector = document.querySelector('.size-selector');
  
  // Vider le sélecteur de taille actuel
  sizeSelector.innerHTML = '';
  
  // Déterminer la catégorie du cookie et configurer les boutons en conséquence
  if (cookie.categorie === 'essentiels') {
    // Pour les cookies essentiels: petit, moyen
    if (cookie.prix.petit !== null) {
      addSizeButton(sizeSelector, 'petit', 'Petit', cookie.prix.petit);
    }
    if (cookie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Moyen', cookie.prix.moyen);
    }
  } else if (cookie.categorie === 'gourmets') {
    // Pour les cookies gourmets: moyen uniquement
    if (cookie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Standard', cookie.prix.moyen);
    }
  } else if (cookie.categorie === 'edition_limitee') {
    // Pour le cookie du mois
    if (cookie.prix.petit !== null) {
      addSizeButton(sizeSelector, 'petit', 'Petit', cookie.prix.petit);
    }
    if (cookie.prix.moyen !== null) {
      addSizeButton(sizeSelector, 'moyen', 'Moyen', cookie.prix.moyen);
    }
  }
  
  // Pour les cookies disponibles en format géant
  if (cookie.format_geant && (cookie.format_geant.parts_4_6 !== null || cookie.format_geant.parts_6_8 !== null)) {
    if (cookie.format_geant.parts_4_6 !== null) {
      addSizeButton(sizeSelector, 'geant_4_6', 'Géant 4-6 parts', cookie.format_geant.parts_4_6);
    }
    if (cookie.format_geant.parts_6_8 !== null) {
      addSizeButton(sizeSelector, 'geant_6_8', 'Géant 6-8 parts', cookie.format_geant.parts_6_8);
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
function displayPackFormats(cookie) {
  const optionGroup = document.querySelector('.option-group');
  const priceContainer = document.querySelector('.cookie-price-container');
  
  // Créer un élément pour afficher les offres de lots si applicable
  if (cookie.categorie === 'essentiels' && cookie.format_standard.x4 !== null) {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `<p>Offre spéciale: Lot de 4 cookies pour ${cookie.format_standard.x4.toFixed(2)} €</p>`;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  } else if (cookie.categorie === 'gourmets' && cookie.format_gourmet.x3 !== null) {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `
      <p>Offres spéciales:</p>
      <ul>
        <li>Lot de 3 cookies gourmets: ${cookie.format_gourmet.x3.toFixed(2)} €</li>
        <li>Lot de 5 cookies gourmets: ${cookie.format_gourmet.x5.toFixed(2)} €</li>
      </ul>
    `;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  } else if (cookie.categorie === 'mini') {
    const packInfo = document.createElement('div');
    packInfo.className = 'pack-info';
    packInfo.innerHTML = `
      <p>Formats disponibles:</p>
      <ul>
        <li>2 mini cookies: ${cookie.format_mini.x2.toFixed(2)} €</li>
        <li>3 mini cookies: ${cookie.format_mini.x3.toFixed(2)} €</li>
        <li>6 mini cookies: ${cookie.format_mini.x6.toFixed(2)} €</li>
        <li>9 mini cookies: ${cookie.format_mini.x9.toFixed(2)} €</li>
        <li>12 mini cookies: ${cookie.format_mini.x12.toFixed(2)} €</li>
        <li>18 mini cookies: ${cookie.format_mini.x18.toFixed(2)} €</li>
        <li>24 mini cookies: ${cookie.format_mini.x24.toFixed(2)} €</li>
      </ul>
    `;
    priceContainer.insertAdjacentElement('afterend', packInfo);
  }
}

// 3. Récupération des données cookies.json
function fetchCookieData() {
  fetch('./cookies.json')
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erreur HTTP : ${res.status}`);
      }
      return res.json();
    })
    .then(cookies => {
      const cookie = cookies.find(c => c.id.toLowerCase() === cookieId.toLowerCase());
      if (!cookie) {
        console.error('Cookie introuvable avec cet ID.');
        return;
      }

      // Sauvegarde le cookie en cours dans la variable globale
      currentCookie = cookie;

      // Remplit les infos du cookie sélectionné
      const mainImg = document.getElementById('cookie-main-img');
      const thumbnailContainer = document.getElementById('thumbnail-container');
      thumbnailContainer.innerHTML = ''; // Vider le conteneur de vignettes

      // Configuration spéciale pour le cookie #11 avec galerie
      if (cookie.id === 'le-11') {
        const images = [
          { src: 'image/IMG_0708.JPG', alt: 'Le 11 vue principale' },
          { src: 'image/11_coupé_bois.JPG', alt: 'Le 11 coupé' }
        ];

        // Configurer l'image principale
        mainImg.src = images[0].src;
        mainImg.alt = images[0].alt;

        // Créer les vignettes
        images.forEach((img, index) => {
          const thumb = document.createElement('img');
          thumb.src = img.src;
          thumb.alt = img.alt;
          thumb.className = 'thumbnail' + (index === 0 ? ' active' : '');
          thumb.addEventListener('click', () => {
            // Mettre à jour l'image principale
            mainImg.src = img.src;
            mainImg.alt = img.alt;
            // Mettre à jour la classe active
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
          });
          thumbnailContainer.appendChild(thumb);
        });
      } else {
        // Pour les autres cookies, afficher simplement l'image principale
        mainImg.src = cookie.image;
        mainImg.alt = cookie.nom;
      }

      document.getElementById('cookie-name').textContent = cookie.nom;
      document.getElementById('cookie-desc').textContent = cookie.description;
      
      // Afficher le badge "Nouveau" pour le cookie du mois
      if (cookie.id.toLowerCase() === 'mai') {
        document.getElementById('cookie-badge').style.display = 'block';
      }
      
      // Configurer les boutons de taille en fonction du type de cookie
      setupSizeButtons(cookie);
      
      // Afficher les formats d'achat groupés si applicable
      displayPackFormats(cookie);
      
      // Ajouter les ingrédients
      const ingredientList = document.getElementById('ingredient-list');
      ingredientList.innerHTML = ''; // Vider la liste avant d'ajouter
      
      cookie.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientList.appendChild(li);
      });
      
      // Remplir l'onglet Description
      document.getElementById('description').innerHTML = `
        <p>${cookie.description_detaillee}</p>
      `;
      
      // Remplir l'onglet Valeurs nutritionnelles
      const nutritionTable = document.querySelector('.nutrition-table');
      if (cookie.valeurs_nutritionnelles) {
        nutritionTable.innerHTML = `
          <tr><th>Pour 100g</th><th>Valeur</th></tr>
          <tr><td>Énergie</td><td>${cookie.valeurs_nutritionnelles.energie}</td></tr>
          <tr><td>Matières grasses</td><td>${cookie.valeurs_nutritionnelles.matieres_grasses}</td></tr>
          <tr><td>dont saturées</td><td>${cookie.valeurs_nutritionnelles.dont_saturees}</td></tr>
          <tr><td>Glucides</td><td>${cookie.valeurs_nutritionnelles.glucides}</td></tr>
          <tr><td>dont sucres</td><td>${cookie.valeurs_nutritionnelles.dont_sucres}</td></tr>
          <tr><td>Protéines</td><td>${cookie.valeurs_nutritionnelles.proteines}</td></tr>
          <tr><td>Sel</td><td>${cookie.valeurs_nutritionnelles.sel}</td></tr>
        `;
      }
      
      // Remplir l'onglet Allergènes
      document.getElementById('allergens').innerHTML = `
        <p>${cookie.allergenes.join(', ')}</p>
        <p class="allergy-note">Tous nos produits sont préparés dans la cuisine de ma mère qui manipule parfois des fruits à coque.</p>
      `;
      
      // Configurer le bouton d'ajout au panier
      const addToCartBtn = document.querySelector('.add-to-cart');
      addToCartBtn.addEventListener('click', (event) => {
        const product = {
          id: cookie.id,
          nom: cookie.nom,
          image: cookie.image,
          taille: selectedSize,
          prix: currentPrice,
          quantity: quantity
        };
        
        // Utiliser la fonction addToCart du fichier script.js
        if (typeof addToCart === 'function') {
          addToCart(product, event);
        }
      });
      
      // Carrousel de suggestions
      setupSuggestions(cookies, cookie);
    })
    .catch(err => {
      console.error('Erreur lors du chargement des cookies :', err);
    });
}

// Configuration du carrousel de suggestions
function setupSuggestions(allCookies, currentCookie) {
  const suggestionsTrack = document.getElementById('suggestions-track');
  suggestionsTrack.innerHTML = ''; // Vider le conteneur
  
  // Filtrer les cookies pour ne pas afficher le cookie actuel
  const filteredCookies = allCookies.filter(c => c.id !== currentCookie.id);
  
  // Trier les suggestions pour montrer d'abord les cookies de la même catégorie
  const sortedSuggestions = [
    ...filteredCookies.filter(c => c.categorie === currentCookie.categorie),
    ...filteredCookies.filter(c => c.categorie !== currentCookie.categorie)
  ];
  
  // Prendre les 6 premiers cookies pour les suggestions
  const suggestions = sortedSuggestions.slice(0, 6);
  
  // Ajouter les suggestions au carrousel
  suggestions.forEach(cookie => {
    const card = document.createElement('a');
    card.href = `cookie-detail.html?id=${cookie.id}`;
    card.className = 'cookie-card';
    card.innerHTML = `
      <img src="${cookie.image}" alt="${cookie.nom}">
      <h3>${cookie.nom}</h3>
      <p>${cookie.description.split('.')[0]}.</p>
    `;
    suggestionsTrack.appendChild(card);
  });
  
  // Navigation du carrousel
  document.getElementById('prevSuggestion').addEventListener('click', () => {
    const track = document.getElementById('suggestions-track');
    const cardWidth = track.querySelector('.cookie-card').offsetWidth + 24; // largeur + gap
    track.scrollBy({ 
      left: -cardWidth * 3, // Défile de 3 cartes
      behavior: 'smooth' 
    });
  });

  document.getElementById('nextSuggestion').addEventListener('click', () => {
    const track = document.getElementById('suggestions-track');
    const cardWidth = track.querySelector('.cookie-card').offsetWidth + 24; // largeur + gap
    track.scrollBy({ 
      left: cardWidth * 3, // Défile de 3 cartes
      behavior: 'smooth' 
    });
  });

  // Gestion de visibilité des boutons
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
  updateButtonsVisibility(); // Appel initial
}