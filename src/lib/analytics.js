const DYNAMIC_ROUTE_MASKS = [
  {
    pattern: /^\/share\/contis\/[^/]+$/,
    replacement: '/share/contis/[token]',
  },
  {
    pattern: /^\/dashboard\/contis\/(?!new$)[^/]+$/,
    replacement: '/dashboard/contis/[id]',
  },
]

/**
 * @param {string | null | undefined} pathname
 * @returns {string}
 */
export function normalizeAnalyticsPath(pathname) {
  if (!pathname) {
    return '/'
  }

  const [pathWithoutSearch] = pathname.split(/[?#]/)
  const normalizedPath = pathWithoutSearch || '/'

  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    return normalizedPath.slice(0, -1)
  }

  return normalizedPath
}

/**
 * Masks route parameters before a path is sent to analytics.
 *
 * @param {string | null | undefined} pathname
 * @returns {string}
 */
export function maskAnalyticsPath(pathname) {
  const normalizedPath = normalizeAnalyticsPath(pathname)
  const routeMask = DYNAMIC_ROUTE_MASKS.find(({ pattern }) => pattern.test(normalizedPath))

  return routeMask?.replacement ?? normalizedPath
}
