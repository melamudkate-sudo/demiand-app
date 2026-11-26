const CACHE = 'demiand-app-v7';
const CORE = ['./', './app.html', './studio.css', './app.css?v=5', './typography.css?v=7', './assets/inter-full.woff2', './assets/unbounded-full.woff2', './app-mode.css?v=7', './icons.js?v=7', './player.js', './app.js?v=7', './guided.js', './texture.js', './rear.js', './hardware.js', './android-rear.js', './editor.js?v=7', './control-data.js?v=7', './control.js?v=7', './control.css?v=7', './assets/control-fan.webp', './assets/program-icons.webp', './studio.js?v=7', './app-mode.js?v=7', './manifest.webmanifest', './assets/montserrat.woff2', './assets/montserrat-semibold.woff2', './assets/unbounded.woff2', './assets/app-icon-192.png', './assets/app-icon-512.png'];
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
