import assert from 'node:assert/strict'
import test from 'node:test'

import { createUnsavedChangesHistoryGuard } from '../src/hooks/unsaved-changes-history.js'

function createHistory(initialState = { nextInternalState: true }) {
  return {
    state: initialState,
    backCalls: 0,
    forwardCalls: 0,
    pushCalls: [],
    replaceCalls: [],
    pushState(state) {
      this.state = state
      this.pushCalls.push(state)
    },
    replaceState(state) {
      this.state = state
      this.replaceCalls.push(state)
    },
    back() {
      this.backCalls += 1
    },
    forward() {
      this.forwardCalls += 1
    },
  }
}

test('pushes one guarded entry and removes it when the guard is disabled', () => {
  const history = createHistory()
  const guard = createUnsavedChangesHistoryGuard({
    history,
    markerId: 'guard-1',
    isEnabled: () => true,
    confirmLeave: () => false,
  })

  assert.deepEqual(history.state, {
    nextInternalState: true,
    __unsavedChangesGuard: 'guard-1',
  })
  assert.equal(history.pushCalls.length, 1)

  guard.cleanup()

  assert.equal(history.backCalls, 1)
})

test('returns to the guarded entry when back navigation is cancelled', () => {
  const history = createHistory()
  const guard = createUnsavedChangesHistoryGuard({
    history,
    markerId: 'guard-2',
    isEnabled: () => true,
    confirmLeave: () => false,
  })

  assert.equal(guard.handlePopState(), 'blocked')
  assert.equal(guard.handlePopState(), 'restored')

  assert.equal(history.forwardCalls, 1)
})

test('moves past the sentinel to the previous page when back navigation is confirmed', () => {
  const history = createHistory()
  const guard = createUnsavedChangesHistoryGuard({
    history,
    markerId: 'guard-3',
    isEnabled: () => true,
    confirmLeave: () => true,
  })

  history.state = { nextInternalState: true }
  assert.equal(guard.handlePopState(), 'leaving')
  guard.cleanup()

  assert.equal(history.forwardCalls, 0)
  assert.equal(history.backCalls, 1)
})
