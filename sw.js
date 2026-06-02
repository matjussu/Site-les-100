// Version du cache (à incrémenter à chaque déploiement majeur)
const CACHE_NAME = 'les100-cache-v5';

// Ressources à mettre en cache immédiatement (fallback hors-ligne)
const CACHE_URLS = [
  './',
  'index.html',
  'Goukie.html',
  'Goukie-detail.html',
  'epicerie.html',
  'allergenes.html',
  'histoire.html',
  'contact.html',
  'merci.html',
  'styles.css',
  'script.js',
  'Goukie-detail.js',
  'contact.js',
  'Goukies.json',
  'logo/logo les100_DEF ROND.png',
  'logo/logo les100_DEF.png'
];

// Ressources servies "network-first" : app shell + données qui évoluent.
// Tout le reste (images...) reste "cache-first" pour la performance.
function isNetworkFirst(request) {
  if (request.mode === 'navigate') return true;
  const url = new URL(request.url);
  return /\.(html|css|js|json)$/i.test(url.pathname);
}

// Installation : pré-cache + activation immédiate du nouveau SW
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation : purge des anciens caches + prise de contrôle immédiate des onglets
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Stratégie de fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (isNetworkFirst(event.request)) {
    // Network-first : on tente le réseau, on rafraîchit le cache, fallback cache si hors-ligne
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first (images et autres ressources statiques)
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(networkResponse => {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return networkResponse;
      });
    })
  );
});
