// cookie-detail.js

// 1. Récupère l'ID depuis l'URL
const params = new URLSearchParams(window.location.search);
const cookieId = params.get('id');

// Variables globales
let selectedSize = 'moyen';
let currentPrice = 3.90;
let quantity = 1;

// 2. Gestion des options de taille
document.addEventListener('DOMContentLoaded', function() {
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
  const totalPrice = currentPrice * quantity;
  document.querySelector('.current-price').textContent = `${totalPrice.toFixed(2)} €`;
}

// 3. Récupération des données cookies.json
fetch('./cookies.json')
  .then(res => {
    if (!res.ok) {
      throw new Error(`Erreur HTTP : ${res.status}`);
    }
    return res.json();
  })
  .then(cookies => {
    const cookie = cookies.find(c => c.id === cookieId);
    if (!cookie) {
      console.error('Cookie introuvable avec cet ID.');
      return;
    }

    // Remplit les infos du cookie sélectionné
    document.getElementById('cookie-main-img').src = cookie.image;
    document.getElementById('cookie-main-img').alt = cookie.nom;
    document.getElementById('cookie-name').textContent = cookie.nom;
    document.getElementById('cookie-desc').textContent = cookie.description;
    
    // Afficher le badge "Nouveau" pour le cookie du mois
    if (cookie.id === 'avril') {
      document.getElementById('cookie-badge').style.display = 'block';
    }
    
    // Ajouter les ingrédients (à personnaliser selon vos données)
    const ingredientList = document.getElementById('ingredient-list');
    const ingredients = ['Farine de riz', 'Beurre végétal', 'Sucre de canne', 'Chocolat noir'];
    ingredients.forEach(ingredient => {
      const li = document.createElement('li');
      li.textContent = ingredient;
      ingredientList.appendChild(li);
    });
    
    // Configurer le bouton d'ajout au panier
const addToCartBtn = document.querySelector('.add-to-cart');
addToCartBtn.addEventListener('click', () => {
  const product = {
    id: cookie.id,
    nom: cookie.nom,
    image: cookie.image,
    taille: selectedSize,
    prix: currentPrice,
    quantity: quantity  // On utilise ici la quantité sélectionnée
  };
  
  // Utiliser la fonction addToCart du fichier script.js
  if (typeof addToCart === 'function') {
    addToCart(product);
  }
});
    
    // Carrousel de suggestions
    const suggestionsTrack = document.getElementById('suggestions-track');
    const others = cookies.filter(c => c.id !== cookieId);
    
    others.forEach(cookie => {
      const card = document.createElement('a');
      card.href = `cookie-detail.html?id=${cookie.id}`;
      card.className = 'cookie-card';
      card.innerHTML = `
        <img src="${cookie.image}" alt="${cookie.nom}">
        <h3>${cookie.nom}</h3>
        <p>${cookie.description.split('.')[0]}</p>
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

// Option : Ajouter une gestion de visibilité des boutons
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
  })
  .catch(err => {
    console.error('Erreur lors du chargement des cookies :', err);
  });
