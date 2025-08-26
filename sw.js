// Minimalny, bezpieczny SW – brak agresywnego cache, żadnych pułapek.
self.addEventListener('install', (evt) => self.skipWaiting());
self.addEventListener('activate', (evt) => evt.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (evt) => {
  // Passthrough – nic nie cache'ujemy dopóki nie dokończymy wdrożenia
});
