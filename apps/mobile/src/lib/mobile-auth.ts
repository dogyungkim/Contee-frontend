import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import { exchangeMobileOAuthCode } from './mobile-auth-api'
import {
  MOBILE_AUTH_CALLBACK_PATH,
  buildMobileOAuthAuthorizationUrl,
  createRandomBase64UrlString,
  createS256CodeChallenge,
  parseMobileOAuthCallback,
  verifyMobileOAuthState,
} from './mobile-auth-core'
import { writeSecureSessionTokens } from './secure-session'

WebBrowser.maybeCompleteAuthSession()

export type MobileAuthFlowErrorCode =
  | 'configuration_missing'
  | 'cancelled'
  | 'callback_invalid'
  | 'state_mismatch'
  | 'oauth_error'
  | 'token_exchange_failed'

export class MobileAuthFlowError extends Error {
  code: MobileAuthFlowErrorCode

  constructor(code: MobileAuthFlowErrorCode, message: string) {
    super(message)
    this.name = 'MobileAuthFlowError'
    this.code = code
  }
}

export const getMobileAuthRedirectUri = () =>
  Linking.createURL(MOBILE_AUTH_CALLBACK_PATH)

export const getMobileAuthErrorMessage = (error: unknown) => {
  if (error instanceof MobileAuthFlowError) {
    switch (error.code) {
      case 'cancelled':
        return '로그인이 취소되었습니다.'
      case 'configuration_missing':
        return 'API 주소가 설정되지 않아 로그인할 수 없습니다.'
      case 'callback_invalid':
      case 'oauth_error':
      case 'state_mismatch':
      case 'token_exchange_failed':
        return '로그인에 실패했습니다. 다시 시도해주세요.'
    }
  }

  return '로그인 처리 중 오류가 발생했습니다.'
}

export const signInWithGoogleMobileOAuth = async ({
  apiBaseUrl,
  redirectUri = getMobileAuthRedirectUri(),
}: {
  apiBaseUrl: string
  redirectUri?: string
}) => {
  if (!apiBaseUrl.trim()) {
    throw new MobileAuthFlowError(
      'configuration_missing',
      'API base URL is not configured.'
    )
  }

  const codeVerifier = createRandomBase64UrlString()
  const state = createRandomBase64UrlString()
  const codeChallenge = await createS256CodeChallenge(codeVerifier)
  const authorizationUrl = buildMobileOAuthAuthorizationUrl({
    apiBaseUrl,
    redirectUri,
    codeChallenge,
    state,
  })

  const result = await WebBrowser.openAuthSessionAsync(
    authorizationUrl,
    redirectUri
  )

  if (result.type !== 'success') {
    throw new MobileAuthFlowError('cancelled', 'Mobile OAuth was cancelled.')
  }

  const callback = parseMobileOAuthCallback(result.url)
  if (!verifyMobileOAuthState(callback.state, state)) {
    throw new MobileAuthFlowError(
      'state_mismatch',
      'Mobile OAuth state does not match.'
    )
  }

  if (callback.type === 'error') {
    throw new MobileAuthFlowError(
      'oauth_error',
      `Mobile OAuth failed: ${callback.error}`
    )
  }

  try {
    const response = await exchangeMobileOAuthCode(apiBaseUrl, {
      code: callback.code,
      codeVerifier,
      redirectUri,
    })
    await writeSecureSessionTokens(response.tokens)
    return response
  } catch (error) {
    if (error instanceof MobileAuthFlowError) throw error

    throw new MobileAuthFlowError(
      'token_exchange_failed',
      'Mobile token exchange failed.'
    )
  }
}
