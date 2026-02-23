const CACHE_NAME = 'school-forms-pwa-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/styles.css',
    '/assets/app-icon.svg',
    '/pwa-handler.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    // Force the new SW to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(err => console.error('Cache addAll failed', err));
        })
    );
});

// NETWORK-FIRST strategy: Always try the network first, fall back to cache only if offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Clone the response and update the cache with the fresh version
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            })
            .catch(() => {
                // Network failed (offline), try the cache
                return caches.match(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    // Delete ALL old caches immediately
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});
