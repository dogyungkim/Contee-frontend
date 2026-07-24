import type { AuthSessionAdapter, SessionTokens } from '@contee/api-client'

export const SECURE_SESSION_STORAGE_KEY = 'contee.mobile.session.v1'

export interface SecureSessionStorage {
  getItemAsync(key: string): Promise<string | null>
  setItemAsync(key: string, value: string): Promise<void>
  deleteItemAsync(key: string): Promise<void>
}

export interface DevSessionOptions {
  devAuthBypass?: boolean
  devAccessToken?: string
  devRefreshToken?: string
}

export interface SecureSessionAdapterOptions extends DevSessionOptions {
  storage: SecureSessionStorage
  storageKey?: string
  refreshSession?: (refreshToken: string) => Promise<SessionTokens | null>
  logoutSession?: (refreshToken: string) => Promise<void>
}

const getStorageKey = (storageKey?: string) =>
  storageKey ?? SECURE_SESSION_STORAGE_KEY

const getNonEmptyString = (value: unknown) => {
  if (typeof value !== 'string') return null

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

const readStoredSessionField = (value: object, field: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(value, field)
  return getNonEmptyString(descriptor?.value)
}

const toRefreshToken = (value: unknown) => {
  if (!value || typeof value !== 'object') return null

  return readStoredSessionField(value, 'refreshToken')
}

export const getDevSessionTokens = ({
  devAuthBypass,
  devAccessToken,
  devRefreshToken,
}: DevSessionOptions): SessionTokens | null => {
  if (!devAuthBypass) return null

  const accessToken = getNonEmptyString(devAccessToken)
  if (!accessToken) return null

  const refreshToken = getNonEmptyString(devRefreshToken)
  return refreshToken ? { accessToken, refreshToken } : { accessToken }
}

export const parseStoredRefreshToken = (storedValue: string) => {
  try {
    return toRefreshToken(JSON.parse(storedValue))
  } catch {
    return null
  }
}

export const readStoredRefreshToken = async ({
  storage,
  storageKey,
}: Pick<SecureSessionAdapterOptions, 'storage' | 'storageKey'>) => {
  const key = getStorageKey(storageKey)
  const storedValue = await storage.getItemAsync(key)

  if (!storedValue) return null

  const refreshToken = parseStoredRefreshToken(storedValue)
  if (refreshToken) return refreshToken

  await storage.deleteItemAsync(key)
  return null
}

export const writeStoredRefreshToken = async (
  {
    storage,
    storageKey,
  }: Pick<SecureSessionAdapterOptions, 'storage' | 'storageKey'>,
  refreshToken: string
) => {
  const normalizedRefreshToken = getNonEmptyString(refreshToken)
  if (!normalizedRefreshToken) {
    throw new Error('Cannot save an invalid refresh token.')
  }

  await storage.setItemAsync(
    getStorageKey(storageKey),
    JSON.stringify({ refreshToken: normalizedRefreshToken })
  )
}

export const clearStoredRefreshToken = ({
  storage,
  storageKey,
}: Pick<SecureSessionAdapterOptions, 'storage' | 'storageKey'>) =>
  storage.deleteItemAsync(getStorageKey(storageKey))

export interface SecureSessionAdapter extends AuthSessionAdapter {
  setSession(tokens: SessionTokens): Promise<void>
}

export const createSecureSessionAdapter = ({
  storage,
  storageKey,
  devAuthBypass,
  devAccessToken,
  devRefreshToken,
  refreshSession,
  logoutSession,
}: SecureSessionAdapterOptions): SecureSessionAdapter => {
  const sessionOptions = { storage, storageKey }
  let accessToken: string | null = null
  const getDevSession = () =>
    getDevSessionTokens({
      devAuthBypass,
      devAccessToken,
      devRefreshToken,
    })

  return {
    getAccessToken: async () => {
      const devSession = getDevSession()
      if (devSession?.accessToken) return devSession.accessToken

      return accessToken
    },
    setSession: async (tokens) => {
      const nextAccessToken = getNonEmptyString(tokens.accessToken)
      const nextRefreshToken = getNonEmptyString(tokens.refreshToken)
      if (!nextAccessToken || !nextRefreshToken) {
        throw new Error('Cannot save invalid session tokens.')
      }

      await writeStoredRefreshToken(sessionOptions, nextRefreshToken)
      accessToken = nextAccessToken
    },
    refresh: async () => {
      const devSession = getDevSession()
      if (devSession?.accessToken) return devSession

      if (!refreshSession) return null

      const refreshToken = await readStoredRefreshToken(sessionOptions)
      if (!refreshToken) return null

      const refreshedTokens = await refreshSession(refreshToken)
      if (!refreshedTokens?.accessToken || !refreshedTokens.refreshToken) {
        accessToken = null
        await clearStoredRefreshToken(sessionOptions)
        return null
      }

      await writeStoredRefreshToken(
        sessionOptions,
        refreshedTokens.refreshToken
      )
      accessToken = refreshedTokens.accessToken
      return refreshedTokens
    },
    clear: async () => {
      accessToken = null
      let refreshToken: string | null = null

      try {
        refreshToken = await readStoredRefreshToken(sessionOptions)
      } catch {}

      if (refreshToken) {
        try {
          await logoutSession?.(refreshToken)
        } catch {}
      }

      await clearStoredRefreshToken(sessionOptions)
    },
  }
}
