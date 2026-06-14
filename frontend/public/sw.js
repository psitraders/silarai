// Silarai Service Worker — v3
// Strategy:
//   /assets/* (hashed filenames) → cache-first, serve instantly on repeat visits
//   API calls / cross-origin     → network-only, never cached
//   Everything else              → network-first, stale fallback

const CACHE_NAME = 'silarai-shell-v4';

const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Cross-origin requests (API server, Cloudinary, GA) — never intercept
  if (url.origin !== self.location.origin) return;

  // Azure backend API routes — always network
  if (url.pathname.startsWith('/api/')) return;

  // Hashed Vite assets (/assets/vendor-react-AbCdEf.js etc.) — cache-first.
  // Content-hash filenames never change, safe to serve from cache indefinitely.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // index.html and SPA navigation — network-first, no caching (must stay fresh)
  if (url.pathname === '/' || !url.pathname.includes('.')) return;

  // Static files (icons, manifest) — network-first, cache as fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone(); // clone BEFORE returning — body can only be read once
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
