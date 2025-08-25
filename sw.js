// Service Worker dla Harmonia Rząska PWA
const CACHE_NAME = 'harmonia-rzaska-v1.0.0';
const STATIC_CACHE = 'harmonia-static-v1.0.0';
const DYNAMIC_CACHE = 'harmonia-dynamic-v1.0.0';

// Zasoby do cache'owania
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/js/app.js',
    '/css/styles.css',
    '/assets/logo-harmonia-rzaska.svg',
    '/assets/favicon-32x32.svg',
    '/assets/android-chrome-192x192.svg',
    '/assets/android-chrome-512x512.svg',
    '/assets/apple-touch-icon.svg',
    '/assets/site.webmanifest'
];

// API endpoints do cache'owania
const API_CACHE = [
    '/data/units/',
    '/data/site_settings/',
    '/data/contact_messages/',
    '/.netlify/functions/'
];

// Instalacja Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalacja...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Cache'owanie statycznych zasobów...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker zainstalowany');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Błąd podczas instalacji SW:', error);
            })
    );
});

// Aktywacja Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Aktywacja...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Usuwanie starego cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker aktywowany');
                return self.clients.claim();
            })
    );
});

// Interceptowanie requestów
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // NIE przechwytuj nic poza GET – pozwól Netlify obsłużyć formularze (POST)
    if (request.method !== 'GET') return;
    
    // Strategia cache'owania dla różnych typów zasobów
    // Statyczne zasoby - Cache First
    if (STATIC_ASSETS.includes(url.pathname) || 
        url.pathname.startsWith('/css/') || 
        url.pathname.startsWith('/js/') ||
        url.pathname.startsWith('/assets/')) {
        
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    // API requests - Network First z fallback
    else if (url.pathname.startsWith('/data/') || 
             url.pathname.startsWith('/.netlify/functions/')) {
        
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
    // HTML pages - Network First
    else if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
    // Pozostałe - Network First
    else {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

// Strategia Cache First
async function cacheFirst(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache First error:', error);
        return new Response('Offline - Zasób niedostępny', { status: 503 });
    }
}

// Strategia Network First
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network First fallback to cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback dla HTML
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
        }
        
        return new Response('Offline - Zasób niedostępny', { status: 503 });
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('📱 Push notification otrzymane:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Nowa oferta w Harmonia Rząska!',
        icon: '/assets/android-chrome-192x192.svg',
        badge: '/assets/favicon-32x32.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Zobacz oferty',
                icon: '/assets/logo-harmonia-rzaska.svg'
            },
            {
                action: 'close',
                title: 'Zamknij',
                icon: '/assets/favicon-32x32.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Harmonia Rząska', options)
    );
});

// Kliknięcie w notification
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Notification już zamknięte
    } else {
        // Domyślne działanie - otwórz stronę
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync (dla formularzy offline)
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event);
    
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForm());
    }
});

// Synchronizacja formularza kontaktowego
async function syncContactForm() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        const contactRequests = requests.filter(req => 
            req.url.includes('/.netlify/functions/contact-form')
        );
        
        for (const request of contactRequests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.delete(request);
                    console.log('✅ Contact form synced successfully');
                }
            } catch (error) {
                console.error('❌ Contact form sync failed:', error);
            }
        }
    } catch (error) {
        console.error('❌ Background sync error:', error);
    }
}

// Message handling
self.addEventListener('message', (event) => {
    console.log('💬 Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});
