import type { AuthSessionAdapter, SessionTokens } from '@contee/api-client'

export type MobileAuthStatus =
  | 'bootstrapping'
  | 'authenticated'
  | 'unauthenticated'
  | 'unavailable'

export interface AuthBootstrapResult {
  status: Exclude<MobileAuthStatus, 'bootstrapping'>
}

export interface AuthBootstrapOptions {
  session: Pick<AuthSessionAdapter, 'refresh' | 'clear'>
  validateSession?: (tokens: SessionTokens) => Promise<unknown> | unknown
  isTerminalAuthError?: (error: unknown) => boolean
}

export interface AuthSignOutOptions {
  session: Pick<AuthSessionAdapter, 'clear'>
  clearQueryCache?: () => Promise<void> | void
}

export interface AuthSignOutResult {
  status: 'unauthenticated'
}

const clearSessionSilently = async (
  session: Pick<AuthSessionAdapter, 'clear'>
) => {
  try {
    await session.clear()
  } catch (error) {
    if (error instanceof Error) return
    // Keep auth state deterministic without exposing storage/auth details.
  }
}

export const bootstrapAuthSession = async ({
  session,
  validateSession,
  isTerminalAuthError,
}: AuthBootstrapOptions): Promise<AuthBootstrapResult> => {
  try {
    const refreshedTokens = await session.refresh()

    if (!refreshedTokens?.accessToken) {
      return { status: 'unauthenticated' }
    }

    await validateSession?.(refreshedTokens)
    return { status: 'authenticated' }
  } catch (error) {
    if (isTerminalAuthError?.(error)) {
      await clearSessionSilently(session)
      return { status: 'unauthenticated' }
    }

    return { status: 'unavailable' }
  }
}

export const signOutAuthSession = async ({
  session,
  clearQueryCache,
}: AuthSignOutOptions): Promise<AuthSignOutResult> => {
  try {
    await clearSessionSilently(session)
  } finally {
    await clearQueryCache?.()
  }

  return { status: 'unauthenticated' }
}
