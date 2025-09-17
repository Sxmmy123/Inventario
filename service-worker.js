const CACHE_NAME = 'productos-cache-v2';

// Archivos esenciales
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.pixabay.com/audio/2025/08/05/audio_92c853a122.mp3'
];

// Agrega las imágenes de los productos
const productImages = [
  'https://i.postimg.cc/sDFDBySJ/Whats-App-Image-2024-09-15-at-6-07-47-PM.jpg',
  'https://i.postimg.cc/Df4wymWZ/Whats-App-Image-2024-09-15-at-6-07-47-PM-1.jpg',
  'https://i.postimg.cc/W1TNnn5F/Whats-App-Image-2024-09-15-at-6-07-46-PM.jpg',
  'https://i.postimg.cc/3RVrFQqY/Whats-App-Image-2024-09-15-at-6-07-48-PM-1.jpg'
];

// Combina todos los recursos a cachear
const CACHE_ASSETS = urlsToCache.concat(productImages);

// Instalación del service worker y cacheo
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando archivos...');
      return cache.addAll(CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de caches antiguas
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Limpiando cache vieja:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Intercepta las solicitudes y responde con cache o fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve del cache si existe
        if (response) return response;

        // Sino, busca en la red y guarda en cache
        return fetch(event.request)
          .then(fetchRes => {
            return caches.open(CACHE_NAME).then(cache => {
              // Evita cachear peticiones no GET
              if(event.request.method === "GET") cache.put(event.request, fetchRes.clone());
              return fetchRes;
            });
          })
          .catch(() => {
            // Opcional: respuesta offline para páginas HTML
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
