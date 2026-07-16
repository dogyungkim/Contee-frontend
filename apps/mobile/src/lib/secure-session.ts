import * as SecureStore from 'expo-secure-store'
import type { SessionTokens } from '@contee/api-client'

import {
  SECURE_SESSION_STORAGE_KEY,
  clearStoredSessionTokens,
  createSecureSessionAdapter as createCoreSecureSessionAdapter,
  readStoredSessionTokens,
  writeStoredSessionTokens,
  type DevSessionOptions,
  type SecureSessionAdapterOptions,
  type SecureSessionStorage,
} from './secure-session-core'
import { getPublicEnv, getPublicEnvFlag } from './public-env'

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
  devAuthBypass: getPublicEnvFlag('EXPO_PUBLIC_DEV_AUTH_BYPASS'),
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
}: ExpoSecureSessionAdapterOptions = {}): SecureSessionAdapterOptions => ({
  storage,
  storageKey,
  ...getDevSessionOptions(),
  ...(devAuthBypass === undefined ? undefined : { devAuthBypass }),
  ...(devAccessToken === undefined ? undefined : { devAccessToken }),
  ...(devRefreshToken === undefined ? undefined : { devRefreshToken }),
})

export const createSecureSessionAdapter = (
  options?: ExpoSecureSessionAdapterOptions
) => createCoreSecureSessionAdapter(getSessionOptions(options))

export const readSecureSessionTokens = (
  options?: Pick<ExpoSecureSessionAdapterOptions, 'storage' | 'storageKey'>
) => readStoredSessionTokens(getSessionOptions(options))

export const writeSecureSessionTokens = (
  tokens: SessionTokens,
  options?: Pick<ExpoSecureSessionAdapterOptions, 'storage' | 'storageKey'>
) => writeStoredSessionTokens(getSessionOptions(options), tokens)

export const clearSecureSessionTokens = (
  options?: Pick<ExpoSecureSessionAdapterOptions, 'storage' | 'storageKey'>
) => clearStoredSessionTokens(getSessionOptions(options))
