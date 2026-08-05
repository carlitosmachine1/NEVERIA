self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('pos-store-v1').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/index.css',
      '/icon.svg',
      '/manifest.json'
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
