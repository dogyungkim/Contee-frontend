import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query'

import {
  getNetworkStatus,
  type NetworkStatus,
} from '@/lib/network-status-core'

const FIVE_MINUTES_MS = 5 * 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

const initialNetworkStatus = getNetworkStatus(undefined)

const NetworkStatusContext =
  createContext<NetworkStatus>(initialNetworkStatus)

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
  const [networkStatus, setNetworkStatus] =
    useState<NetworkStatus>(initialNetworkStatus)

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      syncFocusState
    )
    const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      const nextNetworkStatus = getNetworkStatus(state)

      setNetworkStatus(nextNetworkStatus)
      onlineManager.setOnline(nextNetworkStatus.isNetworkAvailable)
    })

    return () => {
      appStateSubscription.remove()
      netInfoUnsubscribe()
    }
  }, [])

  const networkContextValue = useMemo(() => networkStatus, [networkStatus])

  return (
    <NetworkStatusContext.Provider value={networkContextValue}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NetworkStatusContext.Provider>
  )
}

export function useNetworkStatus() {
  return useContext(NetworkStatusContext)
}
