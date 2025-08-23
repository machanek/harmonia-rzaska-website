// Service Worker dla Harmonia Rząska
const CACHE_NAME = 'harmonia-rzaska-v1.0.0';
const STATIC_CACHE = 'harmonia-static-v1.0.0';
const DYNAMIC_CACHE = 'harmonia-dynamic-v1.0.0';

// Zasoby do cache'owania
const STATIC_ASSETS = [
    '/',
    '/css/styles.css',
    '/js/app.js',
    '/assets/logo-harmonia-rzaska.png',
    '/assets/favicon.ico',
    '/assets/katalog-harmonia-rzaska.pdf'
];

// Zasoby zewnętrzne do cache'owania
const EXTERNAL_ASSETS = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&crop=center&fm=webp',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&h=1080&fit=crop&crop=center&fm=webp',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop&crop=center&fm=webp'
];

// Instalacja Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache statycznych zasobów
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache zewnętrznych obrazów
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('Service Worker: Caching external images');
                return cache.addAll(EXTERNAL_ASSETS);
            })
        ])
    );
    
    self.skipWaiting();
});

// Aktywacja Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

// Interceptowanie requestów
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Strategia cache-first dla statycznych zasobów
    if (request.method === 'GET' && 
        (url.pathname.startsWith('/css/') || 
         url.pathname.startsWith('/js/') || 
         url.pathname.startsWith('/assets/') ||
         url.origin === 'https://images.unsplash.com')) {
        
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(request).then(response => {
                    // Cache nowych zasobów
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
    }
    
    // Strategia network-first dla HTML
    else if (request.method === 'GET' && 
             (url.pathname === '/' || url.pathname.endsWith('.html'))) {
        
        event.respondWith(
            fetch(request).then(response => {
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            }).catch(() => {
                return caches.match(request);
            })
        );
    }
});

// Background sync dla formularzy
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implementacja synchronizacji w tle
    console.log('Service Worker: Performing background sync');
}
