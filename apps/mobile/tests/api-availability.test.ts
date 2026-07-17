import assert from 'node:assert/strict'
import test from 'node:test'

import {
  clearApiUnavailable,
  getApiAvailabilitySnapshot,
  notifyApiUnavailable,
} from '../src/lib/api-availability-core'

test('api availability starts available', () => {
  clearApiUnavailable()

  assert.deepEqual(getApiAvailabilitySnapshot(), {
    isUnavailable: false,
    changedAt: null,
  })
})

test('api availability marks service as unavailable', () => {
  clearApiUnavailable()

  notifyApiUnavailable()

  const snapshot = getApiAvailabilitySnapshot()
  assert.equal(snapshot.isUnavailable, true)
  assert.equal(typeof snapshot.changedAt, 'number')
})

test('api availability clear resets service state', () => {
  notifyApiUnavailable()

  clearApiUnavailable()

  assert.deepEqual(getApiAvailabilitySnapshot(), {
    isUnavailable: false,
    changedAt: null,
  })
})

test('api availability never stores or exposes raw error details', () => {
  const secretError = new Error('refresh_token=secret access_token=secret')

  notifyApiUnavailable(secretError)

  const snapshot = getApiAvailabilitySnapshot()
  assert.equal(snapshot.isUnavailable, true)
  assert.deepEqual(Object.keys(snapshot).sort(), ['changedAt', 'isUnavailable'])
  assert.equal(JSON.stringify(snapshot).includes('secret'), false)
})
