import assert from 'node:assert/strict'
import test from 'node:test'

import {
  bootstrapAuthSession,
  signOutAuthSession,
  validateAndPersistAuthSession,
} from '../src/lib/auth-session-core'

test('auth bootstrap authenticates refresh token success after validation', async () => {
  let validationCount = 0

  const result = await bootstrapAuthSession({
    session: {
      refresh: async () => ({ accessToken: 'access-token' }),
      clear: () => undefined,
    },
    validateSession: (tokens) => {
      assert.deepEqual(tokens, { accessToken: 'access-token' })
      validationCount += 1
    },
  })

  assert.deepEqual(result, { status: 'authenticated' })
  assert.equal(validationCount, 1)
})

test('auth bootstrap returns unauthenticated when refresh returns null', async () => {
  let validationCount = 0

  const result = await bootstrapAuthSession({
    session: {
      refresh: async () => null,
      clear: () => undefined,
    },
    validateSession: () => {
      validationCount += 1
    },
  })

  assert.deepEqual(result, { status: 'unauthenticated' })
  assert.equal(validationCount, 0)
})

test('auth bootstrap returns unavailable when refresh throws without clearing', async () => {
  let clearCount = 0

  const result = await bootstrapAuthSession({
    session: {
      refresh: () => {
        throw new Error('storage unavailable')
      },
      clear: () => {
        clearCount += 1
      },
    },
  })

  assert.deepEqual(result, { status: 'unavailable' })
  assert.equal(clearCount, 0)
})

test('auth bootstrap returns unavailable when validation throws nonterminal', async () => {
  let clearCount = 0

  const result = await bootstrapAuthSession({
    session: {
      refresh: async () => ({ accessToken: 'access-token' }),
      clear: () => {
        clearCount += 1
      },
    },
    validateSession: () => {
      throw new Error('storage unavailable')
    },
    isTerminalAuthError: () => false,
  })

  assert.deepEqual(result, { status: 'unavailable' })
  assert.equal(clearCount, 0)
})

test('auth bootstrap clears session when validation throws terminal error', async () => {
  let clearCount = 0

  const result = await bootstrapAuthSession({
    session: {
      refresh: async () => ({ accessToken: 'access-token' }),
      clear: () => {
        clearCount += 1
      },
    },
    validateSession: () => {
      throw new Error('expired session')
    },
    isTerminalAuthError: () => true,
  })

  assert.deepEqual(result, { status: 'unauthenticated' })
  assert.equal(clearCount, 1)
})

test('auth bootstrap swallows terminal cleanup failures', async () => {
  const result = await bootstrapAuthSession({
    session: {
      refresh: async () => ({ accessToken: 'access-token' }),
      clear: () => {
        throw new Error('secret-token-clear-failed')
      },
    },
    validateSession: () => {
      throw new Error('expired session')
    },
    isTerminalAuthError: () => true,
  })

  assert.deepEqual(result, { status: 'unauthenticated' })
})

test('auth bootstrap does not log token-bearing errors', async () => {
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
    const result = await bootstrapAuthSession({
      session: {
        refresh: async () => ({ accessToken: 'access-token' }),
        clear: () => {
          throw new Error('refresh_token=should-not-leak')
        },
      },
      validateSession: () => {
        throw new Error('access_token=should-not-leak')
      },
      isTerminalAuthError: () => true,
    })

    assert.deepEqual(result, { status: 'unauthenticated' })
    assert.equal(consoleCallCount, 0)
  } finally {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    console.log = originalConsoleLog
  }
})

test('auth sign in persists tokens only after validation succeeds', async () => {
  const calls: string[] = []
  const tokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }

  await validateAndPersistAuthSession({
    tokens,
    validateSession: async () => {
      calls.push('validate')
    },
    persistSession: async () => {
      calls.push('persist')
    },
  })

  assert.deepEqual(calls, ['validate', 'persist'])
})

test('auth sign in does not persist tokens when validation fails', async () => {
  let persistCount = 0

  await assert.rejects(
    validateAndPersistAuthSession({
      tokens: { accessToken: 'invalid-access-token' },
      validateSession: async () => {
        throw new Error('invalid session')
      },
      persistSession: async () => {
        persistCount += 1
      },
    }),
    /invalid session/
  )

  assert.equal(persistCount, 0)
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

test('auth sign out reports local session cleanup failures', async () => {
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
    await assert.rejects(
      signOutAuthSession({
        session: {
          clear: () => {
            throw new Error('refresh_token=should-not-leak')
          },
        },
        clearQueryCache: () => {
          queryClearCount += 1
        },
      }),
      /refresh_token=should-not-leak/
    )

    assert.equal(queryClearCount, 1)
    assert.equal(consoleCallCount, 0)
  } finally {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    console.log = originalConsoleLog
  }
})
