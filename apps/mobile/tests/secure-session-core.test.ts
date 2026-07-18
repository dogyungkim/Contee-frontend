import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createSecureSessionAdapter,
  readStoredSessionTokens,
  writeStoredSessionTokens,
  type SecureSessionStorage,
} from '../src/lib/secure-session-core'

const createMemoryStorage = (initialValues: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initialValues))
  const deletedKeys: string[] = []

  const storage: SecureSessionStorage = {
    getItemAsync: async (key) => values.get(key) ?? null,
    setItemAsync: async (key, value) => {
      values.set(key, value)
    },
    deleteItemAsync: async (key) => {
      deletedKeys.push(key)
      values.delete(key)
    },
  }

  return { storage, values, deletedKeys }
}

test('secure session adapter reads persisted access tokens', async () => {
  const { storage } = createMemoryStorage()
  const storageKey = 'session-test'
  const adapter = createSecureSessionAdapter({ storage, storageKey })

  await writeStoredSessionTokens(
    { storage, storageKey },
    { accessToken: 'access-token', refreshToken: 'refresh-token' }
  )

  assert.equal(await adapter.getAccessToken(), 'access-token')
})

test('secure session adapter clears persisted tokens', async () => {
  const { storage, values } = createMemoryStorage()
  const storageKey = 'session-test'
  const adapter = createSecureSessionAdapter({ storage, storageKey })

  await writeStoredSessionTokens(
    { storage, storageKey },
    { accessToken: 'secret' }
  )
  await adapter.clear()

  assert.equal(values.has(storageKey), false)
})

test('invalid stored session is deleted without exposing token values', async () => {
  const storageKey = 'session-test'
  const { storage, deletedKeys } = createMemoryStorage({
    [storageKey]: JSON.stringify({ accessToken: '' }),
  })

  const tokens = await readStoredSessionTokens({ storage, storageKey })

  assert.equal(tokens, null)
  assert.deepEqual(deletedKeys, [storageKey])
})

test('development bypass requires an explicit access token', async () => {
  const { storage } = createMemoryStorage()

  const disabledAdapter = createSecureSessionAdapter({
    storage,
    devAuthBypass: true,
  })
  const enabledAdapter = createSecureSessionAdapter({
    storage,
    devAuthBypass: true,
    devAccessToken: 'dev-token',
  })

  assert.equal(await disabledAdapter.getAccessToken(), null)
  assert.deepEqual(await disabledAdapter.refresh(), null)
  assert.equal(await enabledAdapter.getAccessToken(), 'dev-token')
  assert.deepEqual(await enabledAdapter.refresh(), { accessToken: 'dev-token' })
})

test('development bypass token takes precedence over persisted tokens', async () => {
  const { storage } = createMemoryStorage()
  const adapter = createSecureSessionAdapter({
    storage,
    devAuthBypass: true,
    devAccessToken: 'dev-token',
  })

  await writeStoredSessionTokens({ storage }, { accessToken: 'stored-token' })

  assert.equal(await adapter.getAccessToken(), 'dev-token')
})

test('secure session refresh rotates persisted mobile tokens', async () => {
  const { storage } = createMemoryStorage()
  const adapter = createSecureSessionAdapter({
    storage,
    refreshSession: async (refreshToken) => {
      assert.equal(refreshToken, 'old-refresh-token')

      return {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }
    },
  })

  await writeStoredSessionTokens(
    { storage },
    {
      accessToken: 'old-access-token',
      refreshToken: 'old-refresh-token',
    }
  )

  assert.deepEqual(await adapter.refresh(), {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  })
  assert.equal(await adapter.getAccessToken(), 'new-access-token')
})

test('secure session refresh clears invalid mobile refresh tokens', async () => {
  const { storage, values } = createMemoryStorage()
  const adapter = createSecureSessionAdapter({
    storage,
    refreshSession: async () => null,
  })

  await writeStoredSessionTokens(
    { storage },
    {
      accessToken: 'old-access-token',
      refreshToken: 'invalid-refresh-token',
    }
  )

  assert.equal(await adapter.refresh(), null)
  assert.equal(values.size, 0)
})

test('secure session clear revokes mobile refresh tokens before local cleanup', async () => {
  const { storage, values } = createMemoryStorage()
  const revokedTokens: string[] = []
  const adapter = createSecureSessionAdapter({
    storage,
    logoutSession: async (refreshToken) => {
      revokedTokens.push(refreshToken)
    },
  })

  await writeStoredSessionTokens(
    { storage },
    {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }
  )

  await adapter.clear()

  assert.deepEqual(revokedTokens, ['refresh-token'])
  assert.equal(values.size, 0)
})
