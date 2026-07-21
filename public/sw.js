self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Pass-through to satisfy PWA criteria without complex caching issues during dev
  event.respondWith(
    fetch(event.request).catch(() => {
      // Basic offline fallback
      return new Response('عفواً، لا يوجد اتصال بالإنترنت', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    })
  )
})
