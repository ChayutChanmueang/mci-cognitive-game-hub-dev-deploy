// This is a basic Service Worker to satisfy PWA installability requirements.
// You can expand this with caching logic for offline support in the future.

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event');
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Basic fetch handler required for PWA installability.
    // For a real app, you would implement a caching strategy here.
    event.respondWith(fetch(event.request));
});
