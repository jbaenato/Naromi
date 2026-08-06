// =========================================================
// Service worker minimo: cachea los ficheros estaticos para
// que la app cargue rapido y sea instalable (PWA). Los datos
// siempre se leen/escriben en vivo contra Supabase (no se
// cachean respuestas de la API).
// =========================================================

const CACHE_NAME = "naromi-cache-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/config.js",
  "./js/supabase.js",
  "./js/utils.js",
  "./js/wizard.js",
  "./js/bodyMap.js",
  "./js/clientForm.js",
  "./js/sessionForm.js",
  "./js/admin.js",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./img/bodymap-front.jpg",
  "./img/bodymap-back.jpg",
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

  // Red primero, y solo si falla (sin conexion) usamos la copia en cache.
  // Asi, cuando se edita config.js u otro archivo y se publica de nuevo,
  // la app siempre carga la version mas reciente en cuanto hay internet.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
