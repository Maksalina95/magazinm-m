const CACHE_NAME = 'shop-cache-v5';

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/favorites.js',
  '/category-products.html', // если есть такой файл
  '/favorites.html',
  '/contacts.html',
  '/delivery.html',
  '/address.html',
  '/terms.html',
  '/manifest.json',
  '/up-button.js',
  '/images/reklama1.jpg',
  '/images/reklama2.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// При установке — кешируем необходимые файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// При активации — удаляем старые кеши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Обработка запросов
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Кешируем только ресурсы своего сайта
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              if (event.request.method === 'GET') {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch(() => {
            // Если офлайн и запрос на картинку — возвращаем заглушку
            if (event.request.destination === 'image') {
              return caches.match('/images/fallback.png');
            }
            return new Response('Нет подключения к интернету.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
    );
  } else {
    // Внешние ресурсы не кешируем, просто делаем fetch
    event.respondWith(fetch(event.request));
  }
});
