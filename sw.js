/**
 * Service Worker Pikolèt
 * Stratégies :
 *   - navigation (HTML)  → Network-first, fallback cache
 *   - bundles Expo (_expo/static) → Cache-first (noms hachés, immuables)
 *   - Google Fonts        → Cache-first
 *   - images / assets     → Stale-while-revalidate
 *   - Supabase (API/WS)  → Jamais mis en cache (toujours réseau)
 */

const CACHE_NAME = 'pikolet-v2';
const BASE = '/pikolet';
const SHELL_URL = BASE + '/';

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(SHELL_URL))
      .catch(() => { /* silencieux si hors-ligne au 1er install */ })
  );
  // Active immédiatement sans attendre la fermeture des onglets existants
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n.startsWith('pikolet-') && n !== CACHE_NAME)
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch (_) {
    return;
  }

  // Ignorer les protocoles non-HTTP (chrome-extension:, etc.)
  if (!url.protocol.startsWith('http')) return;

  // ── Jamais de cache Supabase (auth, API REST, Realtime WS, Storage) ──
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.io')
  ) {
    return;
  }

  // ── Navigation (requêtes HTML de page) → Network-first ──
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // ── Bundles Expo (_expo/static/) → Cache-first immuable ──
  if (url.pathname.includes('/_expo/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Google Fonts (CSS + fichiers woff2) → Cache-first ──
  if (
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'fonts.googleapis.com'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Images et assets statiques → Stale-while-revalidate ──
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.includes('/assets/')
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

// ─── Stratégies ──────────────────────────────────────────────────────────────

async function networkFirstWithFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback sur le shell de l'application
    return cache.match(SHELL_URL);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || fetchPromise;
}
