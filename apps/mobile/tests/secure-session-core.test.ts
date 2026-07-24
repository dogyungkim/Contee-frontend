import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createSecureSessionAdapter,
  readStoredRefreshToken,
  writeStoredRefreshToken,
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

test('secure session keeps access tokens only in memory', async () => {
  const { storage } = createMemoryStorage()
  const storageKey = 'session-test'
  const adapter = createSecureSessionAdapter({ storage, storageKey })

  await adapter.setSession({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  })

  assert.equal(await adapter.getAccessToken(), 'access-token')
  assert.equal(
    (await storage.getItemAsync(storageKey))?.includes('access-token'),
    false
  )
  assert.deepEqual(
    await storage.getItemAsync(storageKey),
    '{"refreshToken":"refresh-token"}'
  )
})

test('secure session adapter clears persisted tokens', async () => {
  const { storage, values } = createMemoryStorage()
  const storageKey = 'session-test'
  const adapter = createSecureSessionAdapter({ storage, storageKey })

  await writeStoredRefreshToken({ storage, storageKey }, 'refresh-token')
  await adapter.clear()

  assert.equal(values.has(storageKey), false)
})

test('invalid stored session is deleted without exposing token values', async () => {
  const storageKey = 'session-test'
  const { storage, deletedKeys } = createMemoryStorage({
    [storageKey]: JSON.stringify({ refreshToken: '' }),
  })

  const refreshToken = await readStoredRefreshToken({ storage, storageKey })

  assert.equal(refreshToken, null)
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

  await writeStoredRefreshToken({ storage }, 'old-refresh-token')

  assert.deepEqual(await adapter.refresh(), {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  })
  assert.equal(await adapter.getAccessToken(), 'new-access-token')
  assert.equal(
    await storage.getItemAsync('contee.mobile.session.v1'),
    '{"refreshToken":"new-refresh-token"}'
  )
})

test('secure session refresh clears invalid mobile refresh tokens', async () => {
  const { storage, values } = createMemoryStorage()
  const adapter = createSecureSessionAdapter({
    storage,
    refreshSession: async () => null,
  })

  await writeStoredRefreshToken({ storage }, 'invalid-refresh-token')

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

  await writeStoredRefreshToken({ storage }, 'refresh-token')

  await adapter.clear()

  assert.deepEqual(revokedTokens, ['refresh-token'])
  assert.equal(values.size, 0)
})

test('secure session clear succeeds locally when remote revocation fails', async () => {
  const { storage, values } = createMemoryStorage()
  const adapter = createSecureSessionAdapter({
    storage,
    logoutSession: async () => {
      throw new Error('server unavailable')
    },
  })

  await writeStoredRefreshToken({ storage }, 'refresh-token')

  await adapter.clear()

  assert.equal(values.size, 0)
})

test('secure session clear reports local credential deletion failures', async () => {
  const storage: SecureSessionStorage = {
    getItemAsync: async () =>
      JSON.stringify({
        refreshToken: 'refresh-token',
      }),
    setItemAsync: async () => undefined,
    deleteItemAsync: async () => {
      throw new Error('secure storage unavailable')
    },
  }
  const adapter = createSecureSessionAdapter({ storage })

  await assert.rejects(
    () => Promise.resolve(adapter.clear()),
    /secure storage unavailable/
  )
})
