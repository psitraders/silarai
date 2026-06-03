// ReplyCart Service Worker — v1
// Minimal SW: registers the app as installable; no aggressive caching
// (the app fetches fresh data from the API on every load).

const CACHE_NAME = 'replycart-shell-v1';

// App-shell assets to pre-cache so the app opens instantly offline
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
];

// ── Install: pre-cache the shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: clean up stale caches ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for API calls, cache-first for shell assets ─────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests (e.g., OpenAI, API server)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API routes — always network, never cache
  if (url.pathname.startsWith('/api/')) return;

  // Everything else: try network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone before consuming — cache the fresh copy
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
