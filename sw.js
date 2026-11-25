const CACHE = 'demiand-app-v1';
const CORE = ['./', './app.html', './studio.css', './app.css', './app-mode.css', './icons.js', './player.js', './app.js', './guided.js', './texture.js', './rear.js', './hardware.js', './editor.js', './studio.js', './app-mode.js', './manifest.webmanifest', './assets/montserrat.woff2', './assets/montserrat-semibold.woff2', './assets/unbounded.woff2', './assets/app-icon-192.png', './assets/app-icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('demiand-app-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin || request.headers.has('range')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const saved = await cache.match(request);
      if (saved) return saved;
      throw error;
    }
  })());
});
