const SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'email',
  'profileImageUrl',
].map((key) => key.toLowerCase())

const isSensitiveKey = (key: string) =>
  SENSITIVE_KEYS.some((sensitiveKey) =>
    key.toLowerCase().includes(sensitiveKey)
  )

const getObjectTag = (value: object) =>
  Object.prototype.toString.call(value).slice(8, -1)

export const redactSensitive = (value: unknown, key = ''): unknown => {
  if (isSensitiveKey(key)) return '[REDACTED]'

  if (value === null || value === undefined) return value

  if (typeof value === 'object') {
    const tag = getObjectTag(value)
    if (tag === 'FormData' || tag === 'Blob') {
      return `[${tag}]`
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item))
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([entryKey, entryValue]) => [
          entryKey,
          redactSensitive(entryValue, entryKey),
        ]
      )
    )
  }

  return value
}
