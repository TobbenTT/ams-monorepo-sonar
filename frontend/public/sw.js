// ── OCP Maintenance AI — Service Worker ─────────────────────────
const CACHE_NAME = 'ocp-main-v1';
const APP_SHELL = ['/', '/index.html'];
const STATIC_EXTS = ['.js', '.css', '.woff', '.woff2', '.ttf', '.png', '.svg', '.ico', '.webp', '.webm', '.ogg', '.mp4'];

// ── Install: cache app shell & activate immediately ─────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate: purge old caches & claim clients ──────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch: strategy per request type ────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore cross-origin requests
  if (url.origin !== self.location.origin) return;

  // ── API requests ──────────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    // POST / PUT / PATCH / DELETE → network-only (mutations)
    if (req.method !== 'GET') return;

    // GET → network-first with cache fallback
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return (
            cached ??
            new Response(JSON.stringify({ error: 'offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }),
    );
    return;
  }

  // ── Static assets (Vite hashed files, fonts, images) → cache-first ─
  if (STATIC_EXTS.some((ext) => url.pathname.endsWith(ext))) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // ── HTML navigation → stale-while-revalidate ──────────────────
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      const networkFetch = fetch(req).then((response) => {
        if (response.ok) cache.put(req, response.clone());
        return response;
      });
      return cached ?? networkFetch;
    }),
  );
});

// ── Background sync ─────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      self.clients
        .matchAll({ includeUncontrolled: true, type: 'window' })
        .then((clients) => {
          clients.forEach((client) => client.postMessage({ type: 'SYNC_REQUESTED' }));
        }),
    );
  }
});
