import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MobileAuthApiError,
  parseMobileSessionUser,
} from '../src/lib/mobile-auth-api'

test('mobile session user parser accepts the safe API envelope only', () => {
  assert.deepEqual(
    parseMobileSessionUser({
      data: {
        id: 'user-1',
        email: 'user@example.com',
        name: '사용자',
        profileImageUrl: 'https://example.com/profile.png',
        provider: 'google',
      },
    }),
    {
      id: 'user-1',
      email: 'user@example.com',
      name: '사용자',
      profileImageUrl: 'https://example.com/profile.png',
      provider: 'google',
    }
  )

  assert.throws(
    () => parseMobileSessionUser({ data: { id: 'user-1' } }),
    MobileAuthApiError
  )
})
