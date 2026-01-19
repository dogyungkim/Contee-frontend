export const API_ENDPOINTS = {
  // Auth
  GOOGLE_LOGIN: '/oauth2/authorization/google',
  TOKEN_REFRESH: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',
  ME: '/api/v1/auth/me',

  // Contis
  CONTIS: '/api/v1/contis',
  CONTI_DETAIL: (id: string) => `/api/v1/contis/${id}`,

  // Songs
  SONGS: '/api/v1/songs',
  SONG_DETAIL: (id: string) => `/api/v1/songs/${id}`,
};
