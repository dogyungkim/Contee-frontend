const CACHE_NAME = 'contee-v2'
const PRECACHE_URLS = ['/manifest.json']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((name) => name !== CACHE_NAME)
              .map((name) => caches.delete(name))
          )
        ),
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request)
        const requestUrl = new URL(request.url)
        const isSameOrigin = requestUrl.origin === self.location.origin
        const isApiRequest = requestUrl.pathname.startsWith('/api/')

        if (isSameOrigin && !isApiRequest) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(request, networkResponse.clone())
        }

        return networkResponse
      } catch (error) {
        const cached = await caches.match(request)
        if (cached) return cached
        throw error
      }
    })()
  )
})
