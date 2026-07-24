const HTTP_PROTOCOLS = new Set(['http:', 'https:'])
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
])

export type ContiExternalLinkKind = 'youtube' | 'sheetMusic'

export function getSafeHttpUrl(url: string | null | undefined) {
  const trimmedUrl = url?.trim()
  if (!trimmedUrl) return undefined

  try {
    const parsedUrl = new URL(trimmedUrl)
    return HTTP_PROTOCOLS.has(parsedUrl.protocol) ? parsedUrl.href : undefined
  } catch {
    return undefined
  }
}

export function getSafeContiExternalUrl(
  url: string | null | undefined,
  kind: ContiExternalLinkKind
) {
  const safeUrl = getSafeHttpUrl(url)
  if (!safeUrl || kind === 'sheetMusic') return safeUrl

  return YOUTUBE_HOSTS.has(new URL(safeUrl).hostname.toLowerCase())
    ? safeUrl
    : undefined
}
