import * as SecureStore from 'expo-secure-store'
import {
  SECURE_SESSION_STORAGE_KEY,
  clearStoredRefreshToken,
  createSecureSessionAdapter as createCoreSecureSessionAdapter,
  readStoredRefreshToken,
  writeStoredRefreshToken,
  type DevSessionOptions,
  type SecureSessionAdapterOptions,
  type SecureSessionStorage,
} from './secure-session-core'
import { getDevelopmentAuthBypassEnabled, getPublicEnv } from './public-env'

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
}

const secureStoreStorage: SecureSessionStorage = {
  getItemAsync: (key) => SecureStore.getItemAsync(key, secureStoreOptions),
  setItemAsync: (key, value) =>
    SecureStore.setItemAsync(key, value, secureStoreOptions),
  deleteItemAsync: (key) =>
    SecureStore.deleteItemAsync(key, secureStoreOptions),
}

const getDevSessionOptions = (): DevSessionOptions => ({
  devAuthBypass: getDevelopmentAuthBypassEnabled(),
  devAccessToken: getPublicEnv('EXPO_PUBLIC_DEV_ACCESS_TOKEN'),
  devRefreshToken: getPublicEnv('EXPO_PUBLIC_DEV_REFRESH_TOKEN'),
})

type ExpoSecureSessionAdapterOptions = Partial<
  Omit<SecureSessionAdapterOptions, 'storage'>
> & {
  storage?: SecureSessionStorage
}

const getSessionOptions = ({
  storage = secureStoreStorage,
  storageKey = SECURE_SESSION_STORAGE_KEY,
  devAuthBypass,
  devAccessToken,
  devRefreshToken,
  refreshSession,
  logoutSession,
}: ExpoSecureSessionAdapterOptions = {}): SecureSessionAdapterOptions => ({
  storage,
  storageKey,
  refreshSession,
  logoutSession,
  ...getDevSessionOptions(),
  ...(devAuthBypass === undefined ? undefined : { devAuthBypass }),
  ...(devAccessToken === undefined ? undefined : { devAccessToken }),
  ...(devRefreshToken === undefined ? undefined : { devRefreshToken }),
})

export const createSecureSessionAdapter = (
  options?: ExpoSecureSessionAdapterOptions
) => createCoreSecureSessionAdapter(getSessionOptions(options))

export const readSecureRefreshToken = (
  options?: Pick<ExpoSecureSessionAdapterOptions, 'storage' | 'storageKey'>
) => readStoredRefreshToken(getSessionOptions(options))

export const writeSecureRefreshToken = (
  refreshToken: string,
  options?: Pick<ExpoSecureSessionAdapterOptions, 'storage' | 'storageKey'>
) => writeStoredRefreshToken(getSessionOptions(options), refreshToken)

export const clearSecureRefreshToken = (
  options?: Pick<ExpoSecureSessionAdapterOptions, 'storage' | 'storageKey'>
) => clearStoredRefreshToken(getSessionOptions(options))
