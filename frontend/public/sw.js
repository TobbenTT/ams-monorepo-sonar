// AMS Service Worker — Offline-first for assets, stale-while-revalidate for API
const CACHE_STATIC = 'ams-static-v2';
const CACHE_API = 'ams-api-v1';

// Pre-cache shell on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache =>
      cache.addAll(['/', '/AMS_LOGO.png', '/manifest.webmanifest'])
    ).then(() => self.skipWaiting())
  );
});

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_STATIC && k !== CACHE_API).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;

  // Hashed assets (Vite /assets/) — cache first (immutable)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_STATIC).then(c => c.put(event.request, clone));
          }
          return res;
        })
      )
    );
    return;
  }

  // API calls — stale-while-revalidate (show cached data, update in background)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(CACHE_API).then(cache =>
        cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(res => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          }).catch(() => cached); // offline fallback
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // HTML / other — network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok && url.pathname === '/') {
          const clone = res.clone();
          caches.open(CACHE_STATIC).then(c => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then(c => c || caches.match('/')))
  );
});
