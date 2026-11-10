/**
 * AutoPollution Manager Pro - Service Worker
 * Provides offline shell caching while server-side scheduled jobs
 * handle automated cloud reminders.
 */

const CACHE_NAME = 'autopollution-pro-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './register.html',
  './dashboard.html',
  './vehicles.html',
  './add-vehicle.html',
  './reminders.html',
  './subscription.html',
  './settings.html',
  './admin.html',
  './terms.html',
  './privacy.html',
  './offline.html',
  './css/style.css',
  './js/db.js',
  './js/auth.js',
  './js/whatsapp.js',
  './js/reminders.js',
  './js/payment.js',
  './js/admin.js',
  './js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
