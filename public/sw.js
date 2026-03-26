/**
 * Service Worker para Enlace UTC PWA
 * 
 * PERMISOS SOLICITADOS:
 * 1. MICRÓFONO (audio: true)
 *    - Justificación: Necesario para la captura de audio del usuario durante
 *      la simulación de entrevista. El usuario graba sus respuestas mediante
 *      la Web Speech API (reconocimiento de voz) para retroalimentación en tiempo real.
 *    - Contexto de uso: Función startRecording() en /pages/dashboard/entrevista/index.js
 *    - Usuario: Solicitado explícitamente al pulsar botón "Hablar"
 * 
 * 2. SÍNTESIS DE VOZ
 *    - Justificación: Genera respuestas de voz de la entrevistadora virtual (avatar)
 *      para crear una experiencia inmersiva de entrevista bidireccional.
 *    - Tecnología: Web Speech API (SpeechSynthesis)
 * 
 * Los permisos se solicitan en tiempo de ejecución desde JavaScript
 * mediante navigator.mediaDevices.getUserMedia({ audio: true })
 */

const CACHE_VERSION = "enlace-utc-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = ["/", OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE
          )
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  const isNavigation = request.mode === "navigate";
  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          () =>
            caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
