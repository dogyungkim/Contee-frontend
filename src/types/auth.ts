import type { ApiResponse } from '@contee/domain/api'
import type { AuthResponse } from '@contee/domain/auth/model'

export type {
  User,
  AuthResponse,
  UserResponse,
  AuthState,
  LoginCredentials,
} from '@contee/domain/auth/model'

export type RefreshTokenResponse = ApiResponse<AuthResponse | null>
