import { useSyncExternalStore } from 'react'

import {
  getApiAvailabilitySnapshot,
  subscribeApiAvailability,
} from './api-availability-core'

export {
  clearApiUnavailable,
  getApiAvailabilitySnapshot,
  notifyApiUnavailable,
  subscribeApiAvailability,
  type ApiAvailabilityState,
} from './api-availability-core'

export function useApiAvailability() {
  return useSyncExternalStore(
    subscribeApiAvailability,
    getApiAvailabilitySnapshot,
    getApiAvailabilitySnapshot
  )
}
