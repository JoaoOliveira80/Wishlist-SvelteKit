/**
 * Service Worker para GameWishlist PWA
 * Cache-first strategy for static assets, network-first for API
 */

const CACHE_NAME = 'gamewishlist-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
  '/favicon-192.png',
  '/favicon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('{"results": [], "count": 0}', {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Update cache in background
        fetch(request).then((response) => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, response);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return offline page or error
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/').then((cachedHome) => {
            return cachedHome || new Response('Offline - please connect to the internet', {
              headers: { 'Content-Type': 'text/html' }
            });
          });
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
