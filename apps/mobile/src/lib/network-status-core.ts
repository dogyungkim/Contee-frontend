export type NetworkAvailability = 'online' | 'offline' | 'unknown'

export interface NetworkStatusInput {
  isConnected?: boolean | null
  isInternetReachable?: boolean | null
}

export interface NetworkStatus {
  availability: NetworkAvailability
  isOffline: boolean
  isNetworkAvailable: boolean
}

export function getNetworkStatus(
  state: NetworkStatusInput | null | undefined
): NetworkStatus {
  if (
    state?.isConnected === false ||
    state?.isInternetReachable === false
  ) {
    return {
      availability: 'offline',
      isOffline: true,
      isNetworkAvailable: false,
    }
  }

  if (
    state?.isConnected === true ||
    state?.isInternetReachable === true
  ) {
    return {
      availability: 'online',
      isOffline: false,
      isNetworkAvailable: true,
    }
  }

  return {
    availability: 'unknown',
    isOffline: false,
    isNetworkAvailable: true,
  }
}
