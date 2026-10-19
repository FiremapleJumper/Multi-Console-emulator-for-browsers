// Caches the emulator files as they're fetched, so the page works offline after one online play session.
const V = 'n64-cache-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const isCdn = u.hostname === 'cdn.emulatorjs.org';
  const isSelf = u.origin === location.origin;
  if (!isCdn && !isSelf) return;

  e.respondWith((async () => {
    const cache = await caches.open(V);
    const hit = await cache.match(req);
    // Emulator files never change under /stable/: cache first. Own page: network first.
    if (isCdn && hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (hit) return hit;
      return Response.error();
    }
  })());
});
