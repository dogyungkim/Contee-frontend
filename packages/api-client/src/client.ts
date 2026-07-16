import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { redactSensitive } from './redaction'
import { getRequestUrl, isApiRequest, isAuthRefreshRequest } from './safe-url'

export interface SessionTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthSessionAdapter {
  getAccessToken(): string | null | Promise<string | null>
  refresh(): Promise<SessionTokens | null>
  clear(): void | Promise<void>
}

type ApiLogSink = (
  level: 'debug' | 'error',
  label: '[API:REQ]' | '[API:RES]' | '[API:ERR]',
  payload: Record<string, unknown>
) => void

export interface ApiClientOptions {
  baseUrl: string
  session: AuthSessionAdapter
  onUnavailable?: (error: unknown) => void
  log?: boolean | ApiLogSink
  adapter?: AxiosAdapter
  headers?: AxiosRequestConfig['headers']
  withCredentials?: boolean
  refreshPath?: string
  refresh?: () => Promise<SessionTokens | null>
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const DEFAULT_REFRESH_PATH = '/api/v1/auth/refresh'

const isTerminalAuthError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false

  const status = error.response?.status
  return typeof status === 'number' && status >= 400 && status < 500
}

const isUnavailableError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return true

  const status = error.response?.status
  return !status || status >= 500
}

const emitLog = (
  log: ApiClientOptions['log'],
  level: 'debug' | 'error',
  label: '[API:REQ]' | '[API:RES]' | '[API:ERR]',
  payload: Record<string, unknown>
) => {
  if (!log) return

  if (typeof log === 'function') {
    log(level, label, payload)
    return
  }

  const logger =
    level === 'error' ? globalThis.console?.error : globalThis.console?.debug
  logger?.(label, payload)
}

const rejectOriginal = (error: AxiosError) => Promise.reject(error)

export function createApiClient(options: ApiClientOptions): AxiosInstance {
  const refreshPath = options.refreshPath ?? DEFAULT_REFRESH_PATH
  const refresh = options.refresh ?? options.session.refresh

  let refreshAccessTokenPromise: Promise<SessionTokens | null> | null = null

  const apiClient = axios.create({
    baseURL: options.baseUrl,
    headers: options.headers ?? {
      'Content-Type': 'application/json',
    },
    withCredentials: options.withCredentials ?? true,
    adapter: options.adapter,
  })

  const refreshSession = () => {
    if (!refreshAccessTokenPromise) {
      refreshAccessTokenPromise = refresh
        .call(options.session)
        .then(async (tokens) => {
          if (tokens?.accessToken) return tokens

          await options.session.clear()
          return null
        })
        .catch(async (error: unknown) => {
          if (isTerminalAuthError(error)) {
            await options.session.clear()
          } else if (isUnavailableError(error)) {
            options.onUnavailable?.(error)
          }

          throw error
        })
        .finally(() => {
          refreshAccessTokenPromise = null
        })
    }

    return refreshAccessTokenPromise
  }

  apiClient.interceptors.request.use((config) => {
    const headers = AxiosHeaders.from(config.headers)

    if (isApiRequest(config, options.baseUrl)) {
      return Promise.resolve(options.session.getAccessToken()).then((token) => {
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        config.headers = headers

        if (options.log) {
          emitLog(options.log, 'debug', '[API:REQ]', {
            method: config.method?.toUpperCase(),
            url: getRequestUrl(config),
            params: redactSensitive(config.params),
            data: redactSensitive(config.data),
          })
        }

        return config
      })
    }

    headers.delete('Authorization')
    config.headers = headers
    config.withCredentials = false

    if (options.log) {
      emitLog(options.log, 'debug', '[API:REQ]', {
        method: config.method?.toUpperCase(),
        url: getRequestUrl(config),
        params: redactSensitive(config.params),
        data: redactSensitive(config.data),
      })
    }

    return config
  })

  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      if (options.log) {
        emitLog(options.log, 'debug', '[API:RES]', {
          method: response.config.method?.toUpperCase(),
          url: getRequestUrl(response.config),
          status: response.status,
          data: redactSensitive(response.data),
        })
      }

      return response
    },
    async (error: AxiosError) => {
      if (options.log) {
        emitLog(options.log, 'error', '[API:ERR]', {
          method: error.config?.method?.toUpperCase(),
          url: getRequestUrl(error.config || {}),
          status: error.response?.status,
          data: redactSensitive(error.response?.data),
        })
      }

      const originalRequest = error.config as RetriableRequestConfig | undefined
      if (!originalRequest) {
        return rejectOriginal(error)
      }

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isAuthRefreshRequest(originalRequest, options.baseUrl, refreshPath)
      ) {
        originalRequest._retry = true

        try {
          const tokens = await refreshSession()
          if (tokens?.accessToken) {
            const headers = AxiosHeaders.from(originalRequest.headers)
            headers.set('Authorization', `Bearer ${tokens.accessToken}`)
            originalRequest.headers = headers

            return apiClient(originalRequest)
          }
        } catch {
          return rejectOriginal(error)
        }
      }

      return rejectOriginal(error)
    }
  )

  return apiClient
}
