// The version suffix is stamped at build time (see vite.config.ts) so each deploy creates a
// fresh cache and the activate handler prunes the previous deploy's. Keep the placeholder
// string exactly 'guitarmateur-v1'.
const CACHE_NAME = 'guitarmateur-v1';

// Each app has its own shell document: the practice app at '/', the Theory app at '/theory'.
const THEORY_SHELL = '/theory';
const shellFor = (url) => {
  const { pathname } = new URL(url);
  return pathname === THEORY_SHELL || pathname.startsWith(THEORY_SHELL + '/') ? THEORY_SHELL : '/';
};

// A cached response that followed a redirect (e.g. '/theory' → '/theory/') cannot answer a
// navigation; Chrome rejects it. Re-wrap it as a plain response.
const servable = (res) =>
  res && res.redirected
    ? res.blob().then((body) => new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers }))
    : res;

// On install, cache both shell documents and nothing else — assets are cached on first fetch.
// The Theory shell is optional: if it fails, the practice app must still install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add('/').then(() => cache.add(THEORY_SHELL).catch(() => undefined)))
      .then(() => self.skipWaiting()),
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
//   - Navigation (HTML): network-first, fall back to the cached page, then to its app's shell
//     ('/theory' for /theory/*, '/' otherwise).
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
        .catch(() =>
          caches
            .match(request)
            .then((r) => r ?? caches.match(shellFor(request.url)))
            .then((r) => servable(r) ?? Response.error()),
        ),
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
