import type { User } from '@/domains/auth/models/auth'

export const DEV_AUTH_BYPASS_ENABLED =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' &&
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

export const DEV_AUTH_BYPASS_TOKEN = 'dev-auth-bypass-token'

export const DEV_AUTH_BYPASS_USER: User = {
  id: 'mock-user',
  email: 'mock-user@contee.local',
  name: 'Mock User',
  profileImageUrl: '',
  provider: 'google',
}
