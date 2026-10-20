const CACHE_NAME = 'rakah-tracker-v32';
const ASSETS = [
  './index.html',
  './manifest.json',
  './glass.css',
  './prayer.html',
  './manifest-prayer.json',
  './prayer-icon-180.png',
  './prayer-icon-192.png',
  './prayer-icon-512.png',
  './prayer-icon-512-maskable.png',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
  './fonts/amiri-arabic-400-normal.woff2',
  './fonts/amiri-arabic-700-normal.woff2',
  './fonts/amiri-latin-400-normal.woff2',
  './fonts/amiri-latin-700-normal.woff2',
  './fonts/fonts.css',
  './fonts/jetbrains-mono-latin-400-normal.woff2',
  './fonts/jetbrains-mono-latin-500-normal.woff2',
  './fonts/manrope-latin-400-normal.woff2',
  './fonts/manrope-latin-500-normal.woff2',
  './fonts/manrope-latin-600-normal.woff2',
  './fonts/manrope-latin-700-normal.woff2',
  './fonts/manrope-latin-800-normal.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigations/HTML so app-code updates land automatically
// the next time you're online, instead of getting stuck on a stale cached
// version. Falls back to the cached copy only when offline. Static assets
// (icons, manifest) stay cache-first since they rarely change and this
// keeps the app instant-loading and offline-capable.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isHTML = event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    event.request.url.endsWith('.html') ||
    event.request.url.endsWith('/');

  if (isHTML) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, copy);
            }
          });
          return response;
        })
        .catch(() => cached);
    })
  );
});
