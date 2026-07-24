import type { SessionTokens } from '@contee/api-client'
import type { ApiResponse } from '@contee/domain/api'
import type { User } from '@contee/domain'

import { buildApiUrl } from './mobile-auth-core'

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
  user: {
    id: string
    email: string
    name: string
    profileImageUrl: string
    provider?: string
  }
}

export interface MobileRefreshResponseDto {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresAt: string
}

export class MobileAuthApiError extends Error {
  status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'MobileAuthApiError'
    this.status = status
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const parseMobileSessionUser = (payload: unknown): User => {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new MobileAuthApiError('Mobile session user response is invalid.')
  }

  const { id, email, name, profileImageUrl, provider } = payload.data
  if (
    typeof id !== 'string' ||
    typeof email !== 'string' ||
    typeof name !== 'string' ||
    typeof profileImageUrl !== 'string' ||
    (provider !== undefined && typeof provider !== 'string')
  ) {
    throw new MobileAuthApiError('Mobile session user response is invalid.')
  }

  return { id, email, name, profileImageUrl, provider }
}

const toSessionTokens = (
  response: MobileRefreshResponseDto | MobileTokenResponseDto
): SessionTokens => ({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
})

function postMobileAuth<TData, TRequest>(
  apiBaseUrl: string,
  path: string,
  request: TRequest,
  options?: { allowNullData?: false }
): Promise<TData>
function postMobileAuth<TData, TRequest>(
  apiBaseUrl: string,
  path: string,
  request: TRequest,
  options: { allowNullData: true }
): Promise<TData | null>
async function postMobileAuth<TData, TRequest>(
  apiBaseUrl: string,
  path: string,
  request: TRequest,
  options: { allowNullData?: boolean } = {}
) {
  const response = await fetch(buildApiUrl(apiBaseUrl, path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<TData | null> | null

  if (!response.ok) {
    throw new MobileAuthApiError(
      payload?.message || 'Mobile auth request failed.',
      response.status
    )
  }

  if (!payload?.data && !options.allowNullData) {
    throw new MobileAuthApiError(
      'Mobile auth response is empty.',
      response.status
    )
  }

  return payload?.data ?? null
}

export const exchangeMobileOAuthCode = async (
  apiBaseUrl: string,
  request: MobileTokenExchangeRequestDto
) => {
  const response = await postMobileAuth<
    MobileTokenResponseDto,
    MobileTokenExchangeRequestDto
  >(apiBaseUrl, '/api/v1/auth/mobile/exchange', request)

  return {
    ...response,
    tokens: toSessionTokens(response),
  }
}

export const refreshMobileSessionTokens = async (
  apiBaseUrl: string,
  refreshToken: string
): Promise<SessionTokens | null> => {
  const trimmedRefreshToken = refreshToken.trim()
  if (!trimmedRefreshToken) return null

  try {
    const response = await postMobileAuth<
      MobileRefreshResponseDto,
      MobileRefreshRequestDto
    >(apiBaseUrl, '/api/v1/auth/mobile/refresh', {
      refreshToken: trimmedRefreshToken,
    })

    return toSessionTokens(response)
  } catch (error) {
    if (
      error instanceof MobileAuthApiError &&
      error.status != null &&
      error.status >= 400 &&
      error.status < 500
    ) {
      return null
    }

    throw error
  }
}

export const logoutMobileSession = async (
  apiBaseUrl: string,
  refreshToken: string
) => {
  const trimmedRefreshToken = refreshToken.trim()
  if (!trimmedRefreshToken) return

  await postMobileAuth<null, MobileRefreshRequestDto>(
    apiBaseUrl,
    '/api/v1/auth/mobile/logout',
    {
      refreshToken: trimmedRefreshToken,
    },
    { allowNullData: true }
  ).catch((error) => {
    if (
      error instanceof MobileAuthApiError &&
      error.status != null &&
      error.status >= 400 &&
      error.status < 500
    ) {
      return null
    }

    throw error
  })
}

export const validateMobileSession = async (
  apiBaseUrl: string,
  accessToken: string
): Promise<User> => {
  const trimmedAccessToken = accessToken.trim()
  if (!trimmedAccessToken) {
    throw new MobileAuthApiError('Mobile access token is empty.', 401)
  }

  const response = await fetch(buildApiUrl(apiBaseUrl, '/api/v1/users/me'), {
    headers: {
      Authorization: `Bearer ${trimmedAccessToken}`,
    },
  })

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as ApiResponse<null> | null

    throw new MobileAuthApiError(
      payload?.message || 'Mobile session validation failed.',
      response.status
    )
  }

  const payload = await response.json().catch(() => null)
  return parseMobileSessionUser(payload)
}
