import { createApiClient } from '@contee/api-client'

import { createSecureSessionAdapter } from './secure-session'

const getPublicEnv = (key: string) =>
  (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> }
    }
  ).process?.env?.[key]

export const API_BASE_URL = getPublicEnv('EXPO_PUBLIC_API_BASE_URL') ?? ''
export const API_LOG_ENABLED = getPublicEnv('EXPO_PUBLIC_API_LOG') === 'true'

export const mobileSession = createSecureSessionAdapter()

const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  session: mobileSession,
  log: API_LOG_ENABLED,
  withCredentials: false,
})

export default apiClient
