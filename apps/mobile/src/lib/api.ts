import { createApiClient } from '@contee/api-client'

import { createSecureSessionAdapter } from './secure-session'
import { notifyApiUnavailable } from './api-availability-core'
import { getPublicEnv, getPublicEnvFlag } from './public-env'

export const API_BASE_URL = getPublicEnv('EXPO_PUBLIC_API_BASE_URL') ?? ''
export const API_LOG_ENABLED = getPublicEnvFlag('EXPO_PUBLIC_API_LOG')

export const mobileSession = createSecureSessionAdapter()

const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  session: mobileSession,
  onUnavailable: notifyApiUnavailable,
  log: API_LOG_ENABLED,
  withCredentials: false,
})

export default apiClient
