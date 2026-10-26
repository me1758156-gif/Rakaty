const CACHE_NAME = 'rakah-tracker-v52';
const ASSETS = [
  './index.html',
  './manifest.json',
  './glass.css',
  './i18n.js',
  './prayer.html',
  './compass-test.html',
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

// How long to wait for the network before using the saved copy. On weak reception
// (mosque basements) a request can hang for a very long time instead of failing, so the
// app must not wait for it: after this many ms the saved copy is used straight away.
const NETWORK_WAIT_MS = 2500;

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

// Pages that are not stored under their exact URL (the bare folder address, links with
// ?query parts, a first open straight after installing) still get the right saved page.
async function savedPage(request) {
  const exact = await caches.match(request, { ignoreSearch: true });
  if (exact) return exact;
  const path = new URL(request.url).pathname;
  if (path.endsWith('/prayer.html')) return caches.match('./prayer.html');
  if (path.endsWith('/compass-test.html')) return caches.match('./compass-test.html');
  return caches.match('./index.html');
}

// Pages: online -> newest version (and refresh the saved copy). Offline, or network
// slower than NETWORK_WAIT_MS -> the saved copy, instantly.
function pageResponse(request) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (r) => { if (!settled && r) { settled = true; resolve(r); } };
    const timer = setTimeout(() => { savedPage(request).then(finish); }, NETWORK_WAIT_MS);
    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          finish(response);
        } else {
          savedPage(request).then((saved) => finish(saved || response));
        }
      })
      .catch(() => {
        clearTimeout(timer);
        savedPage(request).then((saved) => finish(saved || Response.error()));
      });
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isPage = event.request.mode === 'navigate' || event.request.destination === 'document' ||
    url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isPage) {
    event.respondWith(pageResponse(event.request));
    return;
  }

  // Everything else (styles, scripts, fonts, icons): saved copy first, so it is instant and works offline.
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
