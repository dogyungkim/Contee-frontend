const HTTP_PROTOCOLS = new Set(['http:', 'https:'])
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
])
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

export const getSafeLinkHref = (url: string | null | undefined): string | undefined => {
  const trimmedUrl = url?.trim()
  if (!trimmedUrl) return undefined

  if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
    return trimmedUrl
  }

  try {
    const parsedUrl = new URL(trimmedUrl)
    return HTTP_PROTOCOLS.has(parsedUrl.protocol) ? parsedUrl.href : undefined
  } catch {
    return undefined
  }
}

export const getSafeHttpUrl = (url: string | null | undefined): string | undefined => {
  const trimmedUrl = url?.trim()
  if (!trimmedUrl) return undefined

  try {
    const parsedUrl = new URL(trimmedUrl)
    return HTTP_PROTOCOLS.has(parsedUrl.protocol) ? parsedUrl.href : undefined
  } catch {
    return undefined
  }
}

export const getSafeYouTubeUrl = (url: string | null | undefined): string | undefined => {
  const safeUrl = getSafeHttpUrl(url)
  if (!safeUrl) return undefined

  const parsedUrl = new URL(safeUrl)
  return YOUTUBE_HOSTS.has(parsedUrl.hostname.toLowerCase()) ? safeUrl : undefined
}

export const isSafeApiPath = (url: string | null | undefined) => {
  const trimmedUrl = url?.trim()
  return !!trimmedUrl && trimmedUrl.startsWith('/api/') && !trimmedUrl.startsWith('//')
}

export const isSafeApiUrl = (url: string | null | undefined) => {
  const trimmedUrl = url?.trim()
  if (!trimmedUrl) return false
  if (isSafeApiPath(trimmedUrl)) return true
  if (!API_BASE_URL) return false

  try {
    const parsedUrl = new URL(trimmedUrl)
    const apiBaseUrl = new URL(API_BASE_URL)

    return parsedUrl.origin === apiBaseUrl.origin && parsedUrl.pathname.startsWith('/api/')
  } catch {
    return false
  }
}
