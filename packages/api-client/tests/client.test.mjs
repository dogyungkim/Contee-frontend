import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { AxiosError } = require('axios')
const {
  createApiClient,
  isApiRequest,
  redactSensitive,
} = require('../dist/index.js')

const baseUrl = 'https://api.contee.test'

const ok = (config, data = { ok: true }) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

const rejectWithStatus = (config, status) => {
  const response = {
    data: { message: 'failed' },
    status,
    statusText: String(status),
    headers: {},
    config,
  }

  return Promise.reject(
    new AxiosError(
      `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      response
    )
  )
}

const rejectNetwork = (config) =>
  Promise.reject(
    new AxiosError(
      'Network Error',
      AxiosError.ERR_NETWORK,
      config,
      null,
      undefined
    )
  )

const createSession = ({
  token = 'old-token',
  refresh = async () => ({ accessToken: 'new-token' }),
} = {}) => {
  let accessToken = token
  let refreshCount = 0
  let clearCount = 0

  return {
    session: {
      getAccessToken: () => accessToken,
      refresh: async () => {
        refreshCount += 1
        const tokens = await refresh()
        accessToken = tokens?.accessToken ?? accessToken
        return tokens
      },
      clear: () => {
        clearCount += 1
        accessToken = null
      },
    },
    get refreshCount() {
      return refreshCount
    },
    get clearCount() {
      return clearCount
    },
  }
}

const getAuthorization = (headers) => headers?.get?.('Authorization')

test('auth header is scoped to trusted /api requests', async () => {
  const seen = []
  const sessionState = createSession()
  const client = createApiClient({
    baseUrl,
    session: sessionState.session,
    adapter: async (config) => {
      seen.push(config)
      return ok(config)
    },
  })

  await client.get('/api/v1/users/me')
  await client.get(`${baseUrl}/api/v1/teams`)
  await client.get('/assets/logo.png')

  assert.equal(getAuthorization(seen[0].headers), 'Bearer old-token')
  assert.equal(getAuthorization(seen[1].headers), 'Bearer old-token')
  assert.equal(getAuthorization(seen[2].headers), undefined)
  assert.equal(isApiRequest({ url: '/api/v1/users/me' }, baseUrl), true)
  assert.equal(isApiRequest({ url: '/assets/logo.png' }, baseUrl), false)
})

test('untrusted absolute URLs strip authorization and credentials', async () => {
  let seen
  const sessionState = createSession()
  const client = createApiClient({
    baseUrl,
    session: sessionState.session,
    adapter: async (config) => {
      seen = config
      return ok(config)
    },
  })

  await client.get('https://evil.test/api/v1/users/me', {
    headers: { Authorization: 'Bearer user-provided' },
  })

  assert.equal(getAuthorization(seen.headers), undefined)
  assert.equal(seen.withCredentials, false)
})

test('concurrent 401s share one refresh call and retry both requests', async () => {
  const seen = []
  const sessionState = createSession()
  const client = createApiClient({
    baseUrl,
    session: sessionState.session,
    adapter: async (config) => {
      seen.push(config)
      if (getAuthorization(config.headers) === 'Bearer old-token') {
        return rejectWithStatus(config, 401)
      }
      return ok(config, { authorization: getAuthorization(config.headers) })
    },
  })

  const [first, second] = await Promise.all([
    client.get('/api/v1/one'),
    client.get('/api/v1/two'),
  ])

  assert.equal(sessionState.refreshCount, 1)
  assert.equal(seen.length, 4)
  assert.equal(first.data.authorization, 'Bearer new-token')
  assert.equal(second.data.authorization, 'Bearer new-token')
})

test('401 retry happens at most once per original request', async () => {
  const seen = []
  const sessionState = createSession()
  const client = createApiClient({
    baseUrl,
    session: sessionState.session,
    adapter: async (config) => {
      seen.push(config)
      return rejectWithStatus(config, 401)
    },
  })

  await assert.rejects(client.get('/api/v1/protected'), AxiosError)

  assert.equal(sessionState.refreshCount, 1)
  assert.equal(seen.length, 2)
})

test('terminal refresh failure clears the session', async () => {
  const sessionState = createSession({
    refresh: async () => {
      const config = { url: '/api/v1/auth/refresh', baseURL: baseUrl }
      return rejectWithStatus(config, 401)
    },
  })
  const client = createApiClient({
    baseUrl,
    session: sessionState.session,
    adapter: async (config) => rejectWithStatus(config, 401),
  })

  await assert.rejects(client.get('/api/v1/protected'), AxiosError)

  assert.equal(sessionState.refreshCount, 1)
  assert.equal(sessionState.clearCount, 1)
})

test('unavailable callback runs for network and 5xx refresh failures', async () => {
  for (const refreshError of [
    () => rejectNetwork({ url: '/api/v1/auth/refresh', baseURL: baseUrl }),
    () =>
      rejectWithStatus({ url: '/api/v1/auth/refresh', baseURL: baseUrl }, 500),
  ]) {
    let unavailableCount = 0
    const sessionState = createSession({ refresh: refreshError })
    const client = createApiClient({
      baseUrl,
      session: sessionState.session,
      onUnavailable: () => {
        unavailableCount += 1
      },
      adapter: async (config) => rejectWithStatus(config, 401),
    })

    await assert.rejects(client.get('/api/v1/protected'), AxiosError)

    assert.equal(sessionState.refreshCount, 1)
    assert.equal(sessionState.clearCount, 0)
    assert.equal(unavailableCount, 1)
  }
})

test('redaction covers auth, cookie, password, token, email, and profile image fields', () => {
  const redacted = redactSensitive({
    authorization: 'Bearer secret',
    cookie: 'sid=secret',
    password: 'secret',
    token: 'secret',
    accessToken: 'secret',
    refreshToken: 'secret',
    email: 'user@example.com',
    profileImageUrl: 'https://example.com/me.png',
    nested: {
      safe: 'visible',
      backupEmail: 'backup@example.com',
    },
    list: [{ refreshToken: 'secret' }],
  })

  assert.deepEqual(redacted, {
    authorization: '[REDACTED]',
    cookie: '[REDACTED]',
    password: '[REDACTED]',
    token: '[REDACTED]',
    accessToken: '[REDACTED]',
    refreshToken: '[REDACTED]',
    email: '[REDACTED]',
    profileImageUrl: '[REDACTED]',
    nested: {
      safe: 'visible',
      backupEmail: '[REDACTED]',
    },
    list: [{ refreshToken: '[REDACTED]' }],
  })
})
