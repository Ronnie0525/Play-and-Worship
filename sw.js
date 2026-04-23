/* ============================================================
   sw.js — Play & Worship service worker (site-wide).

   Placed at the repo root so its default scope is "/", covering both
   the marketing landing page and the /app/ operator console. That way
   the Install prompt can fire on either page.

   Strategy:
   - Precache the shell on install so the app can boot offline.
   - Navigation requests use network-first with cache fallback so page
     updates propagate on next reload but offline still works.
   - Static assets (JS/CSS/SVG/PNG) use cache-first with background
     revalidate for fast offline startup, fresh on next load.
   - Third-party XHR / fetches (Bible API, Firestore, etc.) are never
     cached — they fall through to the network.

   Bump CACHE_VERSION to invalidate on a breaking change.
   ============================================================ */

const CACHE_VERSION = 'paw-v32';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app/',
  './app/index.html',
  './app/projector.html',
  './app/css/app.css',
  './app/css/projector.css',
  './app/js/app.js',
  './app/js/bible.js',
  './app/js/mediaStore.js',
  './app/js/pdf.js',
  './app/js/pptx.js',
  './app/js/projector.js',
  './app/js/store.js',
  './app/js/video.js',
  './assets/logo.svg',
  './assets/logo-mark-gold.svg',
  './assets/logo-mark-white.svg',
  './assets/logo-mark-dark.svg',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-mask-192.png',
  './assets/icon-mask-512.png',
  // Offline Bibles — bundled so fresh installs can look up scripture
  // without any network round-trip. ~23 MB total across all 5.
  './assets/bible/kjv.json',
  './assets/bible/asv.json',
  './assets/bible/bbe.json',
  './assets/bible/ylt.json',
  './assets/bible/ang.json',
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

const CDN_ALLOW = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
];

const isNavigate = (req) => req.mode === 'navigate'
  || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));

// Seeded music tracks are stored in IndexedDB by the app on first run,
// so the service worker shouldn't duplicate them (~225 MB). Network
// requests for those URLs pass through without caching.
const MUSIC_FOLDER = '/assets/music/';
const isSeedMusic = (url) =>
  url.origin === self.location.origin
  && url.pathname.includes(MUSIC_FOLDER)
  && !/manifest\.json$/i.test(url.pathname);

const isCacheable = (url) => {
  if (isSeedMusic(url)) return false;
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
