import assert from 'node:assert/strict'
import test from 'node:test'

import {
  bootstrapAuthSession,
  getAuthStatusForAccessToken,
  signOutAuthSession,
} from '../src/lib/auth-session-core'

test('auth status treats only non-empty tokens as authenticated', () => {
  assert.equal(getAuthStatusForAccessToken('access-token'), 'authenticated')
  assert.equal(getAuthStatusForAccessToken('  access-token  '), 'authenticated')
  assert.equal(getAuthStatusForAccessToken(''), 'unauthenticated')
  assert.equal(getAuthStatusForAccessToken('   '), 'unauthenticated')
  assert.equal(getAuthStatusForAccessToken(null), 'unauthenticated')
  assert.equal(getAuthStatusForAccessToken(undefined), 'unauthenticated')
})

test('auth bootstrap returns authenticated when session has an access token', async () => {
  const result = await bootstrapAuthSession({
    getAccessToken: () => 'access-token',
    clear: () => undefined,
  })

  assert.deepEqual(result, { status: 'authenticated' })
})

test('auth bootstrap clears invalid session read failures without exposing tokens', async () => {
  let clearCount = 0
  const result = await bootstrapAuthSession({
    getAccessToken: () => {
      throw new Error('storage unavailable')
    },
    clear: () => {
      clearCount += 1
    },
  })

  assert.deepEqual(result, { status: 'unauthenticated' })
  assert.equal(clearCount, 1)
})

test('auth bootstrap remains unauthenticated when cleanup also fails', async () => {
  const result = await bootstrapAuthSession({
    getAccessToken: () => {
      throw new Error('secret-token-read-failed')
    },
    clear: () => {
      throw new Error('secret-token-clear-failed')
    },
  })

  assert.deepEqual(result, { status: 'unauthenticated' })
})

test('auth sign out clears session and query cache', async () => {
  let clearCount = 0
  let queryClearCount = 0

  const result = await signOutAuthSession({
    session: {
      clear: () => {
        clearCount += 1
      },
    },
    clearQueryCache: () => {
      queryClearCount += 1
    },
  })

  assert.deepEqual(result, { status: 'unauthenticated' })
  assert.equal(clearCount, 1)
  assert.equal(queryClearCount, 1)
})

test('auth sign out clears query cache when session cleanup fails', async () => {
  let queryClearCount = 0
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  const originalConsoleLog = console.log
  let consoleCallCount = 0

  console.error = () => {
    consoleCallCount += 1
  }
  console.warn = () => {
    consoleCallCount += 1
  }
  console.log = () => {
    consoleCallCount += 1
  }

  try {
    const result = await signOutAuthSession({
      session: {
        clear: () => {
          throw new Error('refresh_token=should-not-leak')
        },
      },
      clearQueryCache: () => {
        queryClearCount += 1
      },
    })

    assert.deepEqual(result, { status: 'unauthenticated' })
    assert.equal(queryClearCount, 1)
    assert.equal(consoleCallCount, 0)
  } finally {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    console.log = originalConsoleLog
  }
})
