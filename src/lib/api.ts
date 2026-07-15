import axios, { AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { mockAdapter } from './mock/adapter';

const API_LOG_ENABLED =
  process.env.NEXT_PUBLIC_API_LOG === 'true' || process.env.NODE_ENV === 'development';

const getRequestUrl = (config: { baseURL?: string; url?: string }) =>
  `${config.baseURL || ''}${config.url || ''}`;

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
    if (API_LOG_ENABLED) {
      console.debug('[API:REQ]', {
        method: config.method?.toUpperCase(),
        url: getRequestUrl(config),
        params: config.params,
        data: config.data,
      });
    }

    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        data: response.data,
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
        data: error.response?.data,
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
