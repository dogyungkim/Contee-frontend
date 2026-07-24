import type { AuthSessionAdapter, SessionTokens } from '@contee/api-client'

export type MobileAuthStatus =
  | 'bootstrapping'
  | 'authenticated'
  | 'unauthenticated'
  | 'unavailable'

export interface AuthBootstrapResult<T = undefined> {
  status: Exclude<MobileAuthStatus, 'bootstrapping'>
  user?: T
}

export interface AuthBootstrapOptions<T = undefined> {
  session: Pick<AuthSessionAdapter, 'refresh' | 'clear'>
  validateSession?: (tokens: SessionTokens) => Promise<T> | T
  isTerminalAuthError?: (error: unknown) => boolean
}

export interface AuthSignOutOptions {
  session: Pick<AuthSessionAdapter, 'clear'>
  clearQueryCache?: () => Promise<void> | void
}

export interface AuthSignOutResult {
  status: 'unauthenticated'
}

export interface ValidateAndPersistAuthSessionOptions<T = undefined> {
  tokens: SessionTokens
  validateSession: (tokens: SessionTokens) => Promise<T> | T
  persistSession: (tokens: SessionTokens) => Promise<void> | void
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

export const bootstrapAuthSession = async <T = undefined>({
  session,
  validateSession,
  isTerminalAuthError,
}: AuthBootstrapOptions<T>): Promise<AuthBootstrapResult<T>> => {
  try {
    const refreshedTokens = await session.refresh()

    if (!refreshedTokens?.accessToken) {
      return { status: 'unauthenticated' }
    }

    const user = await validateSession?.(refreshedTokens)
    return user === undefined
      ? { status: 'authenticated' }
      : { status: 'authenticated', user }
  } catch (error) {
    if (isTerminalAuthError?.(error)) {
      await clearSessionSilently(session)
      return { status: 'unauthenticated' }
    }

    return { status: 'unavailable' }
  }
}

export const validateAndPersistAuthSession = async <T = undefined>({
  tokens,
  validateSession,
  persistSession,
}: ValidateAndPersistAuthSessionOptions<T>): Promise<T> => {
  const user = await validateSession(tokens)
  await persistSession(tokens)
  return user
}

export const signOutAuthSession = async ({
  session,
  clearQueryCache,
}: AuthSignOutOptions): Promise<AuthSignOutResult> => {
  try {
    await session.clear()
  } finally {
    await clearQueryCache?.()
  }

  return { status: 'unauthenticated' }
}
