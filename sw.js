// =========================================================
// Service worker minimo: cachea los ficheros estaticos para
// que la app cargue rapido y sea instalable (PWA). Los datos
// siempre se leen/escriben en vivo contra Supabase (no se
// cachean respuestas de la API).
// =========================================================

const CACHE_NAME = "naromi-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/config.js",
  "./js/supabase.js",
  "./js/utils.js",
  "./js/clientForm.js",
  "./js/sessionForm.js",
  "./js/admin.js",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Nunca cachear llamadas a la API de Supabase: siempre red.
  if (url.hostname.endsWith(".supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
