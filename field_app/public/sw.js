/**
 * sw.js — AMS Field PWA Service Worker (GAP-W03 Session 4)
 *
 * Strategies:
 *   - App shell HTML: stale-while-revalidate (serve cache, update in background)
 *   - Static assets (.js/.css/fonts/images): cache-first (Vite hashes = immutable)
 *   - API GET requests: network-first, fall back to cached response
 *   - API POST/PUT/PATCH: network-only (writes must reach the server)
 *   - Background sync tag 'sync-captures': notify main thread via postMessage
 */

const CACHE_NAME = 'ams-field-v3'; // Version bump clears ams-field-v2 on activate

// Static file extensions produced by Vite (content-hashed — safe to cache forever)
const STATIC_EXTS = ['.js', '.css', '.woff', '.woff2', '.ttf', '.png', '.svg', '.ico', '.webp', '.webm', '.ogg', '.mp4'];

// Pre-cache the app shell entry points on install
const APP_SHELL = ['/field/', '/field/index.html'];

// ─── Install ───────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────

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

// ─── Fetch ────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only intercept same-origin requests
  if (url.origin !== self.location.origin) return;

  // ── API requests ──────────────────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    // Mutating requests are never cached
    if (req.method !== 'GET') return;

    // Network-first: try server, cache on success, fall back to cached
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

  // ── Static assets (Vite hashed bundles — effectively immutable) ───────
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

  // ── App shell / HTML navigation — stale-while-revalidate ─────────────
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      // Always refresh in background so next visit gets the latest shell
      const networkFetch = fetch(req).then((response) => {
        if (response.ok) cache.put(req, response.clone());
        return response;
      });
      return cached ?? networkFetch;
    }),
  );
});

// ─── Background Sync ──────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-captures') {
    // Notify all open app clients — the main thread handles the actual sync
    // (IndexedDB + SyncManager are in the main thread context)
    event.waitUntil(
      self.clients
        .matchAll({ includeUncontrolled: true, type: 'window' })
        .then((clients) => {
          clients.forEach((client) => client.postMessage({ type: 'SYNC_REQUESTED' }));
        }),
    );
  }
});
