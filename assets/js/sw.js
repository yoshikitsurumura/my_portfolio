const CACHE_NAME = 'craneai-v1';
const urlsToCache = [
  '/',
  '/assets/css/style.css',
  '/images/CRANEAI.png',
  '/images/CRANEAIprof.png',
  '/pages/ai-chatbot-development.html',
  '/pages/business-automation-tool.html',
  '/pages/web-app-development.html'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
