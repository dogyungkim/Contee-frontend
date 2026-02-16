import type { ApiResponse } from '@/types/api';

export type {
  User,
  AuthResponse,
  UserResponse,
  AuthState,
  LoginCredentials,
} from '@/domains/auth/models/auth';

export type RefreshTokenResponse = ApiResponse<import('@/domains/auth/models/auth').AuthResponse | null>;
