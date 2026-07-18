export interface UserDto {
  id: string
  email: string
  name: string
  profileImageUrl: string
  provider?: string
}

export interface AuthResponseDto {
  accessToken: string
  user: UserDto
}

export interface MobileTokenExchangeRequestDto {
  code: string
  codeVerifier: string
  redirectUri: string
}

export interface MobileRefreshRequestDto {
  refreshToken: string
}

export interface MobileTokenResponseDto {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresAt: string
  user: UserDto
}

export interface MobileRefreshResponseDto {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresAt: string
}
