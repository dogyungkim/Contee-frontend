import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

export const API_PATH_PREFIX = '/api/'

export type RequestUrlConfig = Pick<AxiosRequestConfig, 'baseURL' | 'url'>

export const getRequestUrl = (config: RequestUrlConfig) =>
  `${config.baseURL || ''}${config.url || ''}`

const getResolvedUrl = (config: RequestUrlConfig, baseUrl: string) => {
  if (!config.url) return null

  const baseURL = config.baseURL || baseUrl
  if (!baseURL) return null

  try {
    return new URL(config.url, baseURL)
  } catch {
    return null
  }
}

export const isApiRequest = (config: RequestUrlConfig, baseUrl: string) => {
  if (!config.url) return false

  if (config.url.startsWith('/')) {
    return config.url.startsWith(API_PATH_PREFIX)
  }

  const requestUrl = getResolvedUrl(config, baseUrl)
  if (!requestUrl) return false

  try {
    const apiBaseUrl = new URL(config.baseURL || baseUrl)

    return (
      requestUrl.origin === apiBaseUrl.origin &&
      requestUrl.pathname.startsWith(API_PATH_PREFIX)
    )
  } catch {
    return false
  }
}

export const isAuthRefreshRequest = (
  config: Pick<InternalAxiosRequestConfig, 'baseURL' | 'url'>,
  baseUrl: string,
  refreshPath: string
) => {
  const requestUrl = getResolvedUrl(config, baseUrl)
  if (requestUrl) {
    return requestUrl.pathname.endsWith(refreshPath)
  }

  return config.url?.split('?')[0]?.endsWith(refreshPath) ?? false
}
