import axios, { AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { mockAdapter } from './mock/adapter';

const API_LOG_ENABLED = process.env.NEXT_PUBLIC_API_LOG === 'true';
const API_PATH_PREFIX = '/api/';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'email',
  'profileImageUrl',
].map((key) => key.toLowerCase());

const getRequestUrl = (config: { baseURL?: string; url?: string }) =>
  `${config.baseURL || ''}${config.url || ''}`;

const isSensitiveKey = (key: string) =>
  SENSITIVE_KEYS.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey));

const redactSensitive = (value: unknown, key = ''): unknown => {
  if (isSensitiveKey(key)) return '[REDACTED]';

  if (value === null || value === undefined) return value;

  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    return '[FormData]';
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return '[Blob]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
        entryKey,
        redactSensitive(entryValue, entryKey),
      ]),
    );
  }

  return value;
};

const isApiRequest = (config: { baseURL?: string; url?: string }) => {
  if (!config.url) return false;

  if (config.url.startsWith('/')) {
    return config.url.startsWith(API_PATH_PREFIX);
  }

  const baseURL = config.baseURL || API_BASE_URL;
  if (!baseURL) return false;

  try {
    const requestUrl = new URL(config.url, baseURL);
    const apiBaseUrl = new URL(baseURL);

    return (
      requestUrl.origin === apiBaseUrl.origin &&
      requestUrl.pathname.startsWith(API_PATH_PREFIX)
    );
  } catch {
    return false;
  }
};

const AUTH_REFRESH_PATH = '/api/v1/auth/refresh';

const isAuthRefreshRequest = (url?: string) =>
  url?.split('?')[0].endsWith(AUTH_REFRESH_PATH) ?? false;

let refreshAccessTokenPromise: Promise<string | null> | null = null;

const refreshAccessToken = () => {
  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}${AUTH_REFRESH_PATH}`, {}, {
        withCredentials: true,
      })
      .then((response) => {
        const accessToken = response.data?.data?.accessToken;
        return typeof accessToken === 'string' && accessToken.length > 0
          ? accessToken
          : null;
      })
      .finally(() => {
        refreshAccessTokenPromise = null;
      });
  }

  return refreshAccessTokenPromise;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함
  adapter:
    process.env.NEXT_PUBLIC_USE_MOCK === 'true'
      ? mockAdapter
      : undefined,
});

// Request interceptor - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && isApiRequest(config)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isApiRequest(config)) {
      delete config.headers.Authorization;
      config.withCredentials = false;
    }

    if (API_LOG_ENABLED) {
      console.debug('[API:REQ]', {
        method: config.method?.toUpperCase(),
        url: getRequestUrl(config),
        params: redactSensitive(config.params),
        data: redactSensitive(config.data),
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 에러 시 토큰 갱신
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (API_LOG_ENABLED) {
      console.debug('[API:RES]', {
        method: response.config.method?.toUpperCase(),
        url: getRequestUrl(response.config),
        status: response.status,
        data: redactSensitive(response.data),
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    if (API_LOG_ENABLED) {
      console.error('[API:ERR]', {
        method: error.config?.method?.toUpperCase(),
        url: getRequestUrl(error.config || {}),
        status: error.response?.status,
        data: redactSensitive(error.response?.data),
      });
    }

    const originalRequest =
      (error.config as (typeof error.config & { _retry?: boolean }) | undefined) ??
      undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRefreshRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const { setAccessToken, reset } = useAuthStore.getState();

        const accessToken = await refreshAccessToken();
        if (accessToken) {
          setAccessToken(accessToken);

          // 새 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          reset();
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        if (axios.isAxiosError(refreshError)) {
          const status = refreshError.response?.status;
          if (!status || status >= 500) {
            useAuthStore.getState().setUnavailable('서버에 연결할 수 없습니다.');
          } else {
            useAuthStore.getState().reset();
          }
        } else {
          useAuthStore.getState().setUnavailable('서버에 연결할 수 없습니다.');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
