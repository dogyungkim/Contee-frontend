const GUARD_STATE_KEY = '__unsavedChangesGuard'

/**
 * Pushes a same-URL sentinel so back navigation can be confirmed before
 * the router leaves the current page.
 *
 * @param {{
 *   history: Pick<History, 'state' | 'pushState' | 'back' | 'forward'>,
 *   markerId: string,
 *   isEnabled: () => boolean,
 *   confirmLeave: () => boolean,
 * }} options
 */
export function createUnsavedChangesHistoryGuard({
  history,
  markerId,
  isEnabled,
  confirmLeave,
}) {
  const currentState =
    history.state && typeof history.state === 'object' && !Array.isArray(history.state)
      ? history.state
      : {}

  history.pushState(
    {
      ...currentState,
      [GUARD_STATE_KEY]: markerId,
    },
    '',
  )

  let isRestoringGuardedEntry = false

  return {
    handlePopState() {
      if (isRestoringGuardedEntry) {
        isRestoringGuardedEntry = false
        return 'restored'
      }

      if (!isEnabled()) return 'allowed'

      if (confirmLeave()) {
        history.back()
        return 'leaving'
      }

      isRestoringGuardedEntry = true
      history.forward()
      return 'blocked'
    },

    cleanup() {
      if (history.state?.[GUARD_STATE_KEY] !== markerId) return
      history.back()
    },
  }
}
