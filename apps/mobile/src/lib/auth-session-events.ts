const listeners = new Set<() => void>()

export const subscribeToAuthSessionInvalidation = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const notifyAuthSessionInvalidated = () => {
  listeners.forEach((listener) => listener())
}
