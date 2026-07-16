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
}

const getStorageKey = (storageKey?: string) =>
  storageKey ?? SECURE_SESSION_STORAGE_KEY

const getNonEmptyString = (value: unknown) => {
  if (typeof value !== 'string') return null

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

const toSessionTokens = (value: unknown): SessionTokens | null => {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Record<string, unknown>
  const accessToken = getNonEmptyString(candidate.accessToken)
  if (!accessToken) return null

  const refreshToken = getNonEmptyString(candidate.refreshToken)
  return refreshToken ? { accessToken, refreshToken } : { accessToken }
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

export const parseStoredSessionTokens = (storedValue: string) => {
  try {
    return toSessionTokens(JSON.parse(storedValue))
  } catch {
    return null
  }
}

export const readStoredSessionTokens = async ({
  storage,
  storageKey,
}: Pick<SecureSessionAdapterOptions, 'storage' | 'storageKey'>) => {
  const key = getStorageKey(storageKey)
  const storedValue = await storage.getItemAsync(key)

  if (!storedValue) return null

  const tokens = parseStoredSessionTokens(storedValue)
  if (tokens) return tokens

  await storage.deleteItemAsync(key)
  return null
}

export const writeStoredSessionTokens = async (
  {
    storage,
    storageKey,
  }: Pick<SecureSessionAdapterOptions, 'storage' | 'storageKey'>,
  tokens: SessionTokens
) => {
  const normalizedTokens = toSessionTokens(tokens)
  if (!normalizedTokens) {
    throw new Error('Cannot save invalid session tokens.')
  }

  await storage.setItemAsync(
    getStorageKey(storageKey),
    JSON.stringify(normalizedTokens)
  )
}

export const clearStoredSessionTokens = ({
  storage,
  storageKey,
}: Pick<SecureSessionAdapterOptions, 'storage' | 'storageKey'>) =>
  storage.deleteItemAsync(getStorageKey(storageKey))

export const createSecureSessionAdapter = ({
  storage,
  storageKey,
  devAuthBypass,
  devAccessToken,
  devRefreshToken,
}: SecureSessionAdapterOptions): AuthSessionAdapter => {
  const sessionOptions = { storage, storageKey }
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

      const storedTokens = await readStoredSessionTokens(sessionOptions)
      return storedTokens?.accessToken ?? null
    },
    refresh: async () => {
      return getDevSession()
    },
    clear: async () => {
      await clearStoredSessionTokens(sessionOptions)
    },
  }
}
