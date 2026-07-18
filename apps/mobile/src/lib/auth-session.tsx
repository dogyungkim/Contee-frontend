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

import {
  bootstrapAuthSession,
  signOutAuthSession,
  type MobileAuthStatus,
} from './auth-session-core'
import { API_BASE_URL, mobileSession } from './api'
import {
  getMobileAuthErrorMessage,
  signInWithGoogleMobileOAuth,
} from './mobile-auth'
import {
  MobileAuthApiError,
  validateMobileSession,
} from './mobile-auth-api'

interface AuthSessionContextValue {
  status: MobileAuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  authError: string | null
  bootstrap: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearAuthError: () => void
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

const isTerminalAuthError = (error: unknown) => {
  if (error instanceof MobileAuthApiError) {
    return (
      error.status === 400 || error.status === 401 || error.status === 403
    )
  }

  const status = (error as { response?: { status?: unknown } })?.response
    ?.status

  return status === 400 || status === 401 || status === 403
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<MobileAuthStatus>('bootstrapping')
  const [authError, setAuthError] = useState<string | null>(null)

  const bootstrap = useCallback(async () => {
    setStatus('bootstrapping')
    setAuthError(null)
    const result = await bootstrapAuthSession({
      session: mobileSession,
      validateSession: (tokens) =>
        validateMobileSession(API_BASE_URL, tokens.accessToken),
      isTerminalAuthError,
    })
    setStatus(result.status)
  }, [])

  useEffect(() => {
    let isMounted = true

    setStatus('bootstrapping')
    void bootstrapAuthSession({
      session: mobileSession,
      validateSession: (tokens) =>
        validateMobileSession(API_BASE_URL, tokens.accessToken),
      isTerminalAuthError,
    }).then((result) => {
      if (isMounted) {
        setStatus(result.status)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setStatus('bootstrapping')
    setAuthError(null)

    try {
      const response = await signInWithGoogleMobileOAuth({
        apiBaseUrl: API_BASE_URL,
      })
      await validateMobileSession(API_BASE_URL, response.tokens.accessToken)
      queryClient.clear()
      setStatus('authenticated')
    } catch (error) {
      setStatus('unauthenticated')
      setAuthError(getMobileAuthErrorMessage(error))
    }
  }, [queryClient])

  const signOut = useCallback(async () => {
    let nextStatus: MobileAuthStatus = 'unauthenticated'

    try {
      const result = await signOutAuthSession({
        session: mobileSession,
        clearQueryCache: () => queryClient.clear(),
      })
      nextStatus = result.status
    } finally {
      setStatus(nextStatus)
    }
  }, [queryClient])

  const value = useMemo(
    () => ({
      status,
      isLoading: status === 'bootstrapping',
      isAuthenticated: status === 'authenticated',
      authError,
      bootstrap,
      signInWithGoogle,
      signOut,
      clearAuthError: () => setAuthError(null),
    }),
    [authError, bootstrap, signInWithGoogle, signOut, status]
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
