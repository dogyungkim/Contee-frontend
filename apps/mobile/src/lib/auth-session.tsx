import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { User } from '@contee/domain'

import {
  bootstrapAuthSession,
  signOutAuthSession,
  validateAndPersistAuthSession,
  type MobileAuthStatus,
} from './auth-session-core'
import { subscribeToAuthSessionInvalidation } from './auth-session-events'
import { API_BASE_URL, mobileSession } from './api'
import {
  getMobileAuthErrorMessage,
  MobileAuthFlowError,
  signInWithGoogleMobileOAuth,
} from './mobile-auth'
import { MobileAuthApiError, validateMobileSession } from './mobile-auth-api'
import { getPublicEnvFlag } from './public-env'

interface AuthSessionContextValue {
  status: MobileAuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  authError: string | null
  bootstrap: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearAuthError: () => void
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

const readResponseStatus = (error: object) => {
  const responseDescriptor = Object.getOwnPropertyDescriptor(error, 'response')
  const response = responseDescriptor?.value
  if (!response || typeof response !== 'object') return null

  const statusDescriptor = Object.getOwnPropertyDescriptor(response, 'status')
  return typeof statusDescriptor?.value === 'number'
    ? statusDescriptor.value
    : null
}

const isTerminalAuthError = (error: unknown) => {
  if (error instanceof MobileAuthApiError) {
    return error.status === 400 || error.status === 401 || error.status === 403
  }

  if (!error || typeof error !== 'object') return false

  const status = readResponseStatus(error)
  return status === 400 || status === 401 || status === 403
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<MobileAuthStatus>('bootstrapping')
  const [user, setUser] = useState<User | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const runBootstrap = useCallback(
    () =>
      bootstrapAuthSession({
        session: mobileSession,
        validateSession: (tokens) =>
          validateMobileSession(API_BASE_URL, tokens.accessToken),
        isTerminalAuthError,
      }),
    []
  )

  const bootstrap = useCallback(async () => {
    setStatus('bootstrapping')
    setAuthError(null)
    const result = await runBootstrap()
    setStatus(result.status)
    setUser(result.status === 'authenticated' ? (result.user ?? null) : null)
  }, [runBootstrap])

  useEffect(() => {
    let isMounted = true

    setStatus('bootstrapping')
    void runBootstrap().then((result) => {
      if (isMounted) {
        setStatus(result.status)
        setUser(
          result.status === 'authenticated' ? (result.user ?? null) : null
        )
      }
    })

    return () => {
      isMounted = false
    }
  }, [runBootstrap])

  useEffect(
    () =>
      subscribeToAuthSessionInvalidation(() => {
        queryClient.clear()
        setAuthError(null)
        setUser(null)
        setStatus('unauthenticated')
      }),
    [queryClient]
  )

  const signInWithGoogle = useCallback(async () => {
    setStatus('bootstrapping')
    setAuthError(null)
    setUser(null)

    if (getPublicEnvFlag('EXPO_PUBLIC_API_LOG')) {
      console.log('[AUTH:GOOGLE]', { step: 'sign_in_pressed' })
    }

    try {
      const response = await signInWithGoogleMobileOAuth({
        apiBaseUrl: API_BASE_URL,
      })
      const user = await validateAndPersistAuthSession({
        tokens: response.tokens,
        validateSession: (tokens) =>
          validateMobileSession(API_BASE_URL, tokens.accessToken),
        persistSession: mobileSession.setSession,
      })
      queryClient.clear()
      setUser(user)
      setStatus('authenticated')
    } catch (error) {
      if (getPublicEnvFlag('EXPO_PUBLIC_API_LOG')) {
        console.error('[AUTH:GOOGLE]', {
          step: 'sign_in_failed',
          code:
            error instanceof MobileAuthFlowError ? error.code : 'unexpected',
          status: error instanceof MobileAuthApiError ? error.status : null,
        })
      }
      setStatus('unauthenticated')
      setUser(null)
      setAuthError(getMobileAuthErrorMessage(error))
    }
  }, [queryClient])

  const signOut = useCallback(async () => {
    setAuthError(null)

    try {
      await signOutAuthSession({
        session: mobileSession,
        clearQueryCache: () => queryClient.clear(),
      })
      setStatus('unauthenticated')
      setUser(null)
    } catch {
      setStatus('authenticated')
      setAuthError(
        '이 기기의 로그인 정보를 삭제하지 못했습니다. 다시 시도해주세요.'
      )
    }
  }, [queryClient])

  const value = useMemo(
    () => ({
      status,
      isLoading: status === 'bootstrapping',
      isAuthenticated: status === 'authenticated',
      user,
      authError,
      bootstrap,
      signInWithGoogle,
      signOut,
      clearAuthError: () => setAuthError(null),
    }),
    [authError, bootstrap, signInWithGoogle, signOut, status, user]
  )

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext)

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider.')
  }

  return context
}
