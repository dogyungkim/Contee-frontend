import type { AuthSessionAdapter } from '@contee/api-client'

export type MobileAuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthBootstrapResult {
  status: Exclude<MobileAuthStatus, 'loading'>
}

export const getAuthStatusForAccessToken = (
  accessToken: string | null | undefined
): AuthBootstrapResult['status'] =>
  accessToken?.trim() ? 'authenticated' : 'unauthenticated'

export const bootstrapAuthSession = async (
  session: Pick<AuthSessionAdapter, 'getAccessToken' | 'clear'>
): Promise<AuthBootstrapResult> => {
  try {
    const accessToken = await session.getAccessToken()
    return { status: getAuthStatusForAccessToken(accessToken) }
  } catch {
    try {
      await session.clear()
    } catch {
      // Keep auth bootstrap deterministic even when secure storage cleanup fails.
    }

    return { status: 'unauthenticated' }
  }
}
