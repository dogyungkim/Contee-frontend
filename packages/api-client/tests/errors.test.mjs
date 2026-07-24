import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { normalizeApiError } = require('../dist/index.js')

test('normalizes network errors without exposing raw details', () => {
  const error = normalizeApiError(new Error('socket token=secret'))

  assert.deepEqual(error, {
    kind: 'network',
    message: '네트워크 연결을 확인한 뒤 다시 시도해주세요.',
    status: null,
    code: null,
    retryable: true,
  })
})

test('maps response status and code to a safe error', () => {
  const error = normalizeApiError({
    response: {
      status: 404,
      data: { code: 'CONTI_NOT_FOUND', message: 'internal detail' },
    },
  })

  assert.deepEqual(error, {
    kind: 'not_found',
    message: '요청한 정보를 찾을 수 없습니다.',
    status: 404,
    code: 'CONTI_NOT_FOUND',
    retryable: false,
  })
})

test('marks transient server errors retryable', () => {
  const error = normalizeApiError({ response: { status: 503, data: {} } })

  assert.equal(error.kind, 'server')
  assert.equal(error.retryable, true)
})
