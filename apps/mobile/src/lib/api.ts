import { createApiClient } from '@contee/api-client'

import { createSecureSessionAdapter } from './secure-session'
import { notifyApiUnavailable } from './api-availability-core'
import {
  logoutMobileSession,
  refreshMobileSessionTokens,
} from './mobile-auth-api'
import { getPublicEnv, getPublicEnvFlag } from './public-env'

export const API_BASE_URL = getPublicEnv('EXPO_PUBLIC_API_BASE_URL') ?? ''
export const API_LOG_ENABLED = getPublicEnvFlag('EXPO_PUBLIC_API_LOG')

export const mobileSession = createSecureSessionAdapter({
  refreshSession: (refreshToken) =>
    refreshMobileSessionTokens(API_BASE_URL, refreshToken),
  logoutSession: (refreshToken) =>
    logoutMobileSession(API_BASE_URL, refreshToken),
})

const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  session: mobileSession,
  onUnavailable: notifyApiUnavailable,
  log: API_LOG_ENABLED,
  withCredentials: false,
})

export default apiClient
