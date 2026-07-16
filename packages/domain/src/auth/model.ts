export interface User {
  id: string
  email: string
  name: string
  profileImageUrl: string
  provider?: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface UserResponse {
  id: string
  email: string
  name: string
  profileImageUrl: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  provider: 'google'
}
