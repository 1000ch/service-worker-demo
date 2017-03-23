'use strict';

const CACHE_VERSION = 1;
const CACHE_NAME = `v${CACHE_VERSION}`;
const CACHE_FILES = [];

self.addEventListener('install', e => {
  console.log('install', e);

  const cached = caches.open(CACHE_NAME).then(cache => {
    return cache.addAll(CACHE_FILES);
  });

  e.waitUntil(cached.then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  console.log('activate', e);

  const deleted = caches.keys()
    .then(keys => keys.filter(key => key !== CACHE_NAME))
    .then(keys => Promise.all(keys.map(key => caches.delete(key))));

  e.waitUntil(deleted.then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  console.log('fetch', e);

  const data = caches.match(e.request).then(response => {
    if (response) {
      return response;
    }

    return fetch(e.request.clone());
  });

  e.respondWith(data);
});
