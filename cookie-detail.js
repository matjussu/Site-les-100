// cookie-detail.js

// 1. Récupère l'ID depuis l'URL
const params = new URLSearchParams(window.location.search);
const cookieId = params.get('id');

// 2. Fonction de mise à jour dynamique du prix
function updatePrice() {
  const taille = document.getElementById('cookie-size').value;
  let prix = 0;
  if (taille === 'petit') prix = 2.9;
  else if (taille === 'moyen') prix = 3.9;
  else if (taille === 'grand') prix = 4.9;

  document.getElementById('prix-actuel').textContent = prix.toFixed(2) + ' €';
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
    document.getElementById('cookie-img').src = cookie.image;
    document.getElementById('cookie-img').alt = cookie.nom;
    document.getElementById('cookie-name').textContent = cookie.nom;
    document.getElementById('cookie-desc').textContent = cookie.description;

    // Ajout listener sur la taille
    const select = document.getElementById('cookie-size');
    select.addEventListener('change', updatePrice);
    updatePrice();

    // Affiche 3 cookies en suggestion (autres que celui affiché)
    const container = document.getElementById('other-cookies');

    // Tu charges tous les cookies sauf celui affiché
    const others = cookies.filter(c => c.id !== cookieId);
    
    // Génération des cartes dans le carousel
    others.forEach(s => {
      const card = document.createElement('div');
      card.className = 'cookie-card';
      card.innerHTML = `
        <a href="cookie-detail.html?id=${s.id}">
          <img src="${s.image}" alt="${s.nom}">
          <h3>${s.nom}</h3>
          <p>${s.description.split('.')[0]}</p>
        </a>`;
      container.appendChild(card);
    });
    
  })
  .catch(err => {
    console.error('Erreur lors du chargement des cookies :', err);
  });

  document.getElementById('prevBtn').addEventListener('click', () => {
    document.getElementById('other-cookies').scrollBy({ left: -300, behavior: 'smooth' });
  });
  
  document.getElementById('nextBtn').addEventListener('click', () => {
    document.getElementById('other-cookies').scrollBy({ left: 300, behavior: 'smooth' });
  });
  