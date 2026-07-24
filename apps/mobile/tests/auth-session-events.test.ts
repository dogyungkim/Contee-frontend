import assert from 'node:assert/strict'
import test from 'node:test'

import {
  notifyAuthSessionInvalidated,
  subscribeToAuthSessionInvalidation,
} from '../src/lib/auth-session-events'

test('auth session invalidation notifies active subscribers', () => {
  let notificationCount = 0
  const unsubscribe = subscribeToAuthSessionInvalidation(() => {
    notificationCount += 1
  })

  notifyAuthSessionInvalidated()
  unsubscribe()
  notifyAuthSessionInvalidated()

  assert.equal(notificationCount, 1)
})
