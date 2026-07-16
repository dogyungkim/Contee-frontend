import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query'

const FIVE_MINUTES_MS = 5 * 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

function shouldRetry(failureCount: number, error: unknown) {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'status' in error.response &&
    typeof error.response.status === 'number'
      ? error.response.status
      : undefined

  if (status && status >= 400 && status < 500) return false
  return failureCount < 2
}

function syncFocusState(status: AppStateStatus) {
  focusManager.setFocused(status === 'active')
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: FIVE_MINUTES_MS,
            gcTime: ONE_DAY_MS,
            retry: shouldRetry,
            refetchOnReconnect: true,
          },
        },
      })
  )

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      syncFocusState
    )
    const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      onlineManager.setOnline(Boolean(state.isConnected))
    })

    return () => {
      appStateSubscription.remove()
      netInfoUnsubscribe()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
