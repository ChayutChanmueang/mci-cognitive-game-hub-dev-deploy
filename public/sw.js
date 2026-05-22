// Basic Service Worker for PWA installability.
// Expand with caching logic for offline support in the future.

const CACHE_VERSION = 'v1';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Only handle same-origin navigation requests.
    // Let all other requests (cross-origin fonts, CDN scripts, etc.) pass through.
    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {
        return; // Don't call respondWith — let the browser handle it normally
    }

    // Network-first strategy for same-origin requests.
    event.respondWith(
        fetch(event.request).catch(() => {
            // If network fails, could return cached fallback here in the future.
            return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
            });
        })
    );
});
