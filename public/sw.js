const CACHE_NAME = 'guitarmateur-v1';

// On install, cache the shell document and nothing else — assets are cached on first fetch.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add('/')).then(() => self.skipWaiting()),
  );
});

// On activate, delete caches from older versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Fetch strategy:
//   - Navigation (HTML): network-first, fall back to cached '/' shell.
//   - Everything else (JS/CSS/images/fonts): cache-first, update cache in background.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin requests.
  if (!request.url.startsWith(self.location.origin)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/').then((r) => r ?? Response.error())),
    );
    return;
  }

  // Static assets: cache-first with background revalidation (stale-while-revalidate).
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        });
        return cached ?? networkFetch;
      }),
    ),
  );
});
