// Basic Service Worker for PWA installability.
// Network-first with a small offline-asset cache so the offline popup art
// (US-E7-27) still renders when the connection drops.

const CACHE_VERSION = 'v3';

// Assets that MUST be available while offline (offline popup character art).
// Precached on install so the "อินเทอร์เน็ตหายไปแล้ว" popup can show the
// คุณตา/คุณยาย image even when the network is gone.
const OFFLINE_ASSETS = [
    '/assets/common/character/man/OldMan_internet_loss.png',
    '/assets/common/character/female/OldWoman_internet_loss.png',
    '/assets/common/character/man/OldMan_profile.png',
    '/assets/common/character/female/OldWoman_profile.png',
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event');
    event.waitUntil(
        caches
            .open(CACHE_VERSION)
            // Cache each asset individually so one missing file doesn't abort install.
            .then((cache) =>
                Promise.all(
                    OFFLINE_ASSETS.map((url) =>
                        cache.add(url).catch((err) => {
                            console.warn('[Service Worker] Precache failed:', url, err);
                        })
                    )
                )
            )
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event');
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_VERSION)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Only handle same-origin requests.
    // Let all other requests (cross-origin fonts, CDN scripts, etc.) pass through.
    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {
        return; // Don't call respondWith — let the browser handle it normally
    }

    // Network-first strategy: always try the network so assets stay fresh,
    // but fall back to the precached copy (if any) when the network fails.
    event.respondWith(
        fetch(event.request).catch(async () => {
            const cached = await caches.match(event.request);
            if (cached) {
                return cached;
            }
            return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
            });
        })
    );
});
