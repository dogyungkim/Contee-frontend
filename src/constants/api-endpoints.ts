export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  contis: {
    root: '/contis',
    byId: (id: string) => `/contis/${id}`,
  },
  songs: {
    root: '/songs',
    byId: (id: string) => `/songs/${id}`,
    search: '/songs/search',
  },
} as const
