var CACHE = 'tp-shell-v1';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(['./', './index.html']); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
      })
      .then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function(cached) {
      var net = fetch(req).then(function(resp) {
        if (resp && resp.ok) {
          var copy = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(req, copy); });
        }
        return resp;
      }).catch(function() { return cached; });
      return cached || net;
    })
  );
});