import assert from 'node:assert/strict'
import test from 'node:test'

import { isDevelopmentAuthBypassEnabled } from '../src/lib/mobile-config-core'

test('development auth bypass is disabled outside development runtime', () => {
  assert.equal(
    isDevelopmentAuthBypassEnabled({
      isDevelopment: false,
      requested: true,
    }),
    false
  )
  assert.equal(
    isDevelopmentAuthBypassEnabled({
      isDevelopment: true,
      requested: true,
    }),
    true
  )
})
