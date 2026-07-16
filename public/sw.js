const CACHE_VERSION = 'contee-v3'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DOCUMENT_CACHE = `${CACHE_VERSION}-documents`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`
const CURRENT_CACHES = new Set([STATIC_CACHE, DOCUMENT_CACHE, RUNTIME_CACHE])
const STATIC_CACHE_LIMIT = 80
const DOCUMENT_CACHE_LIMIT = 30
const RUNTIME_CACHE_LIMIT = 50
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/icon.svg',
]
const STATIC_DESTINATIONS = new Set([
  'font',
  'image',
  'manifest',
  'script',
  'style',
  'worker',
])
const CACHE_BYPASS_PATH_PREFIXES = [
  '/api/',
  '/callback',
  '/_next/data/',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
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
              .filter((name) => name.startsWith('contee-') && !CURRENT_CACHES.has(name))
              .map((name) => caches.delete(name))
          )
        ),
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const requestUrl = new URL(request.url)

  if (!shouldHandleRequest(request, requestUrl)) return

  if (isStaticAsset(request, requestUrl)) {
    event.respondWith(staleWhileRevalidate(event, request, STATIC_CACHE, STATIC_CACHE_LIMIT))
    return
  }

  if (isDocumentRequest(request)) {
    event.respondWith(networkFirst(request, DOCUMENT_CACHE, DOCUMENT_CACHE_LIMIT, true))
    return
  }

  event.respondWith(networkFirst(request, RUNTIME_CACHE, RUNTIME_CACHE_LIMIT))
})

const shouldHandleRequest = (request, requestUrl) => {
  if (request.method !== 'GET') return false
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return false
  if (requestUrl.origin !== self.location.origin) return false
  if (request.headers.get('RSC') === '1') return false
  if (request.headers.has('Next-Router-Prefetch')) return false
  if (requestUrl.searchParams.has('_rsc')) return false

  return !CACHE_BYPASS_PATH_PREFIXES.some((pathname) =>
    requestUrl.pathname.startsWith(pathname)
  )
}

const isStaticAsset = (request, requestUrl) =>
  STATIC_DESTINATIONS.has(request.destination) ||
  requestUrl.pathname.startsWith('/_next/static/') ||
  PRECACHE_URLS.includes(requestUrl.pathname)

const isDocumentRequest = (request) =>
  request.mode === 'navigate' || request.destination === 'document'

const isCacheableResponse = (response) =>
  response && response.status === 200 && response.type === 'basic'

const trimCache = async (cache, maxEntries) => {
  const keys = await cache.keys()
  const entriesToDelete = keys.length - maxEntries

  if (entriesToDelete <= 0) return

  await Promise.all(keys.slice(0, entriesToDelete).map((key) => cache.delete(key)))
}

const putInCache = async (cacheName, request, response, maxEntries) => {
  if (!isCacheableResponse(response)) return

  const cache = await caches.open(cacheName)
  await cache.put(request, response.clone())
  await trimCache(cache, maxEntries)
}

const staleWhileRevalidate = async (event, request, cacheName, maxEntries) => {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  const networkResponsePromise = fetch(request).then((response) => {
    if (isCacheableResponse(response)) {
      event.waitUntil(
        putInCache(cacheName, request, response.clone(), maxEntries).catch(() => undefined)
      )
    }

    return response
  })

  if (cachedResponse) {
    event.waitUntil(networkResponsePromise.catch(() => undefined))
    return cachedResponse
  }

  try {
    return await networkResponsePromise
  } catch (error) {
    const precachedResponse = await caches.match(request)
    if (precachedResponse) return precachedResponse
    throw error
  }
}

const networkFirst = async (request, cacheName, maxEntries, useOfflineFallback = false) => {
  try {
    const networkResponse = await fetch(request)
    await putInCache(cacheName, request, networkResponse.clone(), maxEntries).catch(
      () => undefined
    )
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse
    if (useOfflineFallback) return createOfflineResponse()
    throw error
  }
}

const createOfflineResponse = () =>
  new Response(
    `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contee - 오프라인</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        color: #1f2937;
        background: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        max-width: 360px;
        text-align: center;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 22px;
        line-height: 1.3;
      }

      p {
        margin: 0;
        color: #64748b;
        font-size: 15px;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>오프라인 상태입니다</h1>
      <p>이미 열어본 화면은 계속 볼 수 있지만, 새 데이터를 불러오려면 인터넷 연결이 필요합니다.</p>
    </main>
  </body>
</html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  )
