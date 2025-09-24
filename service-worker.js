// Nombre del cache (incrementa la versión cuando hagas cambios importantes)
const CACHE_NAME = "inventario-cache-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./images/1.png",
  "./images/2.png",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
];

// Instalación: cache inicial
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación: borrar caches antiguos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Actualiza cache
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // Offline: sirve cache
        return caches.match(event.request).then(resp => resp || caches.match("./index.html"));
      })
  );
});

// Detectar nueva versión y enviar mensaje a la app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATE') {
    self.skipWaiting();
  }
});
