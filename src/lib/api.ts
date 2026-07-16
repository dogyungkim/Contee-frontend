import axios from 'axios'
import { createApiClient, type AuthSessionAdapter } from '@contee/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { mockAdapter } from './mock/adapter'

const API_LOG_ENABLED = process.env.NEXT_PUBLIC_API_LOG === 'true'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const AUTH_REFRESH_PATH = '/api/v1/auth/refresh'
const UNAVAILABLE_MESSAGE = '서버에 연결할 수 없습니다.'

const webSession: AuthSessionAdapter = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  refresh: async () => {
    const response = await axios.post(
      `${API_BASE_URL}${AUTH_REFRESH_PATH}`,
      {},
      {
        withCredentials: true,
      }
    )
    const accessToken = response.data?.data?.accessToken

    if (typeof accessToken === 'string' && accessToken.length > 0) {
      useAuthStore.getState().setAccessToken(accessToken)
      return { accessToken }
    }

    return null
  },
  clear: () => {
    useAuthStore.getState().reset()
  },
}

const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  session: webSession,
  log: API_LOG_ENABLED,
  refreshPath: AUTH_REFRESH_PATH,
  onUnavailable: () => {
    useAuthStore.getState().setUnavailable(UNAVAILABLE_MESSAGE)
  },
  adapter:
    process.env.NEXT_PUBLIC_USE_MOCK === 'true' ? mockAdapter : undefined,
})

export default apiClient
