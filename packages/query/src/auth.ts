export interface AuthCallbackKeyParams {
  success?: string | null
  error?: string | null
  message?: string | null
}

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'user'] as const,
  user: (sessionVersion: number) =>
    [...authKeys.currentUser(), sessionVersion] as const,
  sessionRecovery: () => [...authKeys.all, 'session-recovery'] as const,
  callback: ({ success, error, message }: AuthCallbackKeyParams = {}) =>
    [
      ...authKeys.all,
      'callback',
      success || '',
      error || '',
      message || '',
    ] as const,
}
