/* Service worker: makes the site installable and lets it open offline.
   Strategy: network first (so updates you deploy show up), cache as fallback.
   Bump VERSION whenever you want to force a clean cache. */
const VERSION = 'v1';
const CACHE = 'birthday-' + VERSION;
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css', 'js/config.js', 'js/app.js',
  'assets/audio/music.mp3', 'assets/images/placeholder.svg',
  'assets/images/photo-1.jpg', 'assets/images/photo-2.jpg', 'assets/images/photo-3.jpg', 'assets/images/photo-4.jpg',
  'assets/images/photo-5.jpg', 'assets/images/photo-6.jpg', 'assets/images/photo-7.jpg', 'assets/images/photo-8.jpg',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Safari needs byte-range answers for audio, so serve cached audio as a 206 when asked.
async function rangeFromCache(req, res) {
  const range = req.headers.get('range');
  if (!range || !res) return res;
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  const start = m[1] ? +m[1] : 0;
  const end = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1)
    }
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    } catch (err) {
      const cached = await caches.match(req, { ignoreSearch: true, ignoreVary: true })
        || (req.mode === 'navigate' ? await caches.match('index.html') : undefined);
      if (!cached) return Response.error();
      return req.headers.has('range') ? rangeFromCache(req, cached) : cached;
    }
  })());
});
