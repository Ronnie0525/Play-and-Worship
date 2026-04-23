/* ============================================================
   sw.js — Play & Worship service worker.

   Strategy:
   - Precache the shell on install so the app can boot offline.
   - Navigation requests (the .html documents) use network-first with
     cache fallback — so page updates reach users as soon as they
     have a connection, but the app still opens when offline.
   - Static assets (JS/CSS/SVG/fonts) use cache-first with a silent
     background revalidate — fast offline startup, fresh on next load.
   - Bible API + Firestore + other XHR/fetches are never cached.

   Bump CACHE_VERSION to invalidate the old cache on a breaking change.
   ============================================================ */

const CACHE_VERSION = 'paw-v2';
const SHELL = [
  './',
  './index.html',
  './projector.html',
  './manifest.webmanifest',
  './css/app.css',
  './css/projector.css',
  './js/app.js',
  './js/bible.js',
  './js/mediaStore.js',
  './js/pdf.js',
  './js/pptx.js',
  './js/projector.js',
  './js/store.js',
  './js/video.js',
  '../assets/logo.svg',
  '../assets/logo-mark-gold.svg',
  '../assets/logo-mark-white.svg',
  '../assets/logo-mark-dark.svg',
  '../assets/icon-180.png',
  '../assets/icon-192.png',
  '../assets/icon-512.png',
  '../assets/icon-mask-192.png',
  '../assets/icon-mask-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Only handle GETs from our own origin + a short list of trusted CDNs we use.
const CDN_ALLOW = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
];

const isNavigate = (req) => req.mode === 'navigate'
  || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));

const isCacheable = (url) => {
  if (url.origin === self.location.origin) return true;
  return CDN_ALLOW.some((origin) => url.href.startsWith(origin));
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!isCacheable(url)) return;

  if (isNavigate(req)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const fetchAndCache = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || fetchAndCache;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
