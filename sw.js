const CACHE = 'demiand-app-v5';
const CORE = ['./', './app.html', './studio.css', './app.css?v=5', './typography.css?v=5', './assets/inter-full.woff2', './assets/unbounded-full.woff2', './app-mode.css?v=4', './icons.js', './player.js', './app.js?v=3', './guided.js', './texture.js', './rear.js', './hardware.js', './android-rear.js', './editor.js', './studio.js', './app-mode.js?v=4', './manifest.webmanifest', './assets/montserrat.woff2', './assets/montserrat-semibold.woff2', './assets/unbounded.woff2', './assets/app-icon-192.png', './assets/app-icon-512.png'];
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
      const response = await fetch(request, {cache: 'no-cache'});
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const saved = await cache.match(request);
      if (saved) return saved;
      throw error;
    }
  })());
});
