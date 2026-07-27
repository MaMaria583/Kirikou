/* Service worker — Le village de Naba (PWA).
   Rend l'app installable et utilisable hors-ligne après la 1re visite.
   - App shell (fichiers locaux) : pré-chargé à l'installation.
   - three.js (unpkg) et polices (Google Fonts) : mis en cache au vol.
   Incrémente CACHE à chaque déploiement pour forcer la mise à jour. */

const CACHE = 'naba-v2';

const APP_SHELL = [
  '/',
  '/index.html',
  '/Le%20village%20de%20Naba.html',
  '/case-kirikou.html',
  '/village-lieux.js',
  '/three-d-stage.js',
  '/_ds/classical-9af83fcb-e414-4ae4-b793-a669f9333310/styles.css',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32.png',
];

// Hôtes distants dont on met les réponses en cache au fil de l'eau.
const RUNTIME_HOSTS = ['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // allSettled : un fichier manquant ne fait pas échouer l'installation.
      await Promise.allSettled(APP_SHELL.map((u) => cache.add(u)));
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navigations (ouverture d'une page) : réseau d'abord, cache en secours.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match('/index.html') || caches.match('/'))
        )
    );
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isRuntime = RUNTIME_HOSTS.includes(url.hostname);
  if (!sameOrigin && !isRuntime) return; // on laisse passer le reste normalement

  // Cache-first pour tout le reste (fichiers locaux + CDN three.js / polices).
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // On ne met en cache que les réponses exploitables.
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
