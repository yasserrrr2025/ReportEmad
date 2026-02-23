const CACHE_NAME = 'school-forms-pwa-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/styles.css',
    '/assets/app-icon.svg',
    '/pwa-handler.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Intentionally not failing on error, to ensure SW installs even if an asset is missing
            return cache.addAll(ASSETS_TO_CACHE).catch(err => console.error('Cache addAll failed', err));
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached version or fetch from network
            return cachedResponse || fetch(event.request).catch(() => {
                // Fallback or do nothing
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
