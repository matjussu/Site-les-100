// Version du cache
const CACHE_NAME = 'les100-cache-v2';

// Ressources à mettre en cache immédiatement
const CACHE_URLS = [
  'index.html',
  'cookie.html',
  'styles.css',
  'script.js',
  'logo/logo les100_DEF ROND.png',
  'logo/logo_horizontale.png',
  'image/cookie_accueil.png',
  // Ajoutez d'autres ressources importantes
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(CACHE_URLS);
      })
  );
});

// Activer le nouveau service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie de mise en cache: Cache-first puis réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          // Mettre en cache la nouvelle ressource si c'est une requête GET
          if (event.request.method === 'GET') {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        });
      })
  );
});