'use strict';

const CACHE_VERSION = 1;
const CACHE_NAME = `v${CACHE_VERSION}`;
const CACHE_FILES = [];

self.addEventListener('install', e => {
  console.log('install', e);

  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  console.log('activate', e);

  const deletion = caches.keys()
    .then(keys => keys.filter(key => key !== CACHE_NAME))
    .then(keys => Promise.all(keys.map(key => caches.delete(key))));

  e.waitUntil(deletion.then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  console.log('fetch', e);

  if (!CACHE_FILES.some(file => e.request.url.includes(file))) {
    return;
  }

  const cache = caches.match(e.request).then(response => {
    if (response) {
      return response;
    }

    return fetch(e.request.clone()).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }

      return response;
    });
  });

  e.respondWith(cache);
});
