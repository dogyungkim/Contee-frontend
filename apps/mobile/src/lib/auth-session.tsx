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
  type MobileAuthStatus,
} from './auth-session-core'
import { createSecureSessionAdapter } from './secure-session'

const authSession = createSecureSessionAdapter()

interface AuthSessionContextValue {
  status: MobileAuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  bootstrap: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<MobileAuthStatus>('loading')

  const bootstrap = useCallback(async () => {
    setStatus('loading')
    const result = await bootstrapAuthSession(authSession)
    setStatus(result.status)
  }, [])

  useEffect(() => {
    let isMounted = true

    setStatus('loading')
    void bootstrapAuthSession(authSession).then((result) => {
      if (isMounted) {
        setStatus(result.status)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await authSession.clear()
    } finally {
      queryClient.clear()
      setStatus('unauthenticated')
    }
  }, [queryClient])

  const value = useMemo(
    () => ({
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      bootstrap,
      signOut,
    }),
    [bootstrap, signOut, status]
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
