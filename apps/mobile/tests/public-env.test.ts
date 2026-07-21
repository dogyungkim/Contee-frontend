import assert from 'node:assert/strict'
import test from 'node:test'

import { getPublicEnv } from '../src/lib/public-env.js'

test('public Expo flags are read from their explicit environment keys', () => {
  assert.equal(
    getPublicEnv('EXPO_PUBLIC_DEV_AUTH_BYPASS'),
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS
  )
})
