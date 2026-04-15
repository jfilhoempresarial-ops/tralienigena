// Versão atualizada - limpa cache antigo
const CACHE_NAME = 'tralienigena-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Não faz cache - sempre busca da rede
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
