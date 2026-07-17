export interface ApiAvailabilityState {
  isUnavailable: boolean
  changedAt: number | null
}

type ApiAvailabilityListener = () => void

const listeners = new Set<ApiAvailabilityListener>()

let state: ApiAvailabilityState = {
  isUnavailable: false,
  changedAt: null,
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export function getApiAvailabilitySnapshot(): ApiAvailabilityState {
  return state
}

export function subscribeApiAvailability(
  listener: ApiAvailabilityListener
) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function notifyApiUnavailable(_error?: unknown) {
  state = {
    isUnavailable: true,
    changedAt: Date.now(),
  }
  emitChange()
}

export function clearApiUnavailable() {
  if (!state.isUnavailable && state.changedAt === null) return

  state = {
    isUnavailable: false,
    changedAt: null,
  }
  emitChange()
}
