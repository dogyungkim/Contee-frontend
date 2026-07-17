import assert from 'node:assert/strict'
import test from 'node:test'

import { getNetworkStatus } from '../src/lib/network-status-core'

test('network status treats connected state as online', () => {
  assert.deepEqual(
    getNetworkStatus({
      isConnected: true,
      isInternetReachable: true,
    }),
    {
      availability: 'online',
      isOffline: false,
      isNetworkAvailable: true,
    }
  )
})

test('network status treats disconnected state as offline', () => {
  assert.deepEqual(
    getNetworkStatus({
      isConnected: false,
      isInternetReachable: true,
    }),
    {
      availability: 'offline',
      isOffline: true,
      isNetworkAvailable: false,
    }
  )
})

test('network status treats unreachable internet as offline', () => {
  assert.deepEqual(
    getNetworkStatus({
      isConnected: true,
      isInternetReachable: false,
    }),
    {
      availability: 'offline',
      isOffline: true,
      isNetworkAvailable: false,
    }
  )
})

test('network status keeps unknown initial state available without showing offline', () => {
  assert.deepEqual(getNetworkStatus(undefined), {
    availability: 'unknown',
    isOffline: false,
    isNetworkAvailable: true,
  })
  assert.deepEqual(getNetworkStatus({}), {
    availability: 'unknown',
    isOffline: false,
    isNetworkAvailable: true,
  })
})
