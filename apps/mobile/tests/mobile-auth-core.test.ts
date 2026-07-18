import assert from 'node:assert/strict'
import test from 'node:test'

import {
  base64UrlEncode,
  buildMobileOAuthAuthorizationUrl,
  createS256CodeChallenge,
  parseMobileOAuthCallback,
  verifyMobileOAuthState,
} from '../src/lib/mobile-auth-core'

test('builds the mobile OAuth authorization URL for the backend contract', () => {
  const url = new URL(
    buildMobileOAuthAuthorizationUrl({
      apiBaseUrl: 'https://api.contee.test',
      redirectUri: 'contee-mobile-dev:///auth/callback',
      codeChallenge: 'challenge',
      state: 'state',
    })
  )

  assert.equal(
    url.toString(),
    'https://api.contee.test/oauth2/authorization/google/mobile?redirect_uri=contee-mobile-dev%3A%2F%2F%2Fauth%2Fcallback&code_challenge=challenge&code_challenge_method=S256&state=state'
  )
})

test('parses successful and failed mobile OAuth callbacks', () => {
  assert.deepEqual(
    parseMobileOAuthCallback(
      'contee-mobile-dev:///auth/callback?code=abc&state=s1'
    ),
    {
      type: 'success',
      code: 'abc',
      state: 's1',
    }
  )

  assert.deepEqual(
    parseMobileOAuthCallback(
      'contee-mobile-dev:///auth/callback?error=invalid_request&state=s1'
    ),
    {
      type: 'error',
      error: 'invalid_request',
      state: 's1',
    }
  )
})

test('validates callback state without exposing token values', () => {
  assert.equal(verifyMobileOAuthState('state-a', 'state-a'), true)
  assert.equal(verifyMobileOAuthState('state-b', 'state-a'), false)
  assert.equal(verifyMobileOAuthState(null, 'state-a'), false)
})

test('base64url encoding omits padding and unsafe characters', () => {
  assert.equal(base64UrlEncode(new Uint8Array([255, 238, 221])), '_-7d')
  assert.equal(base64UrlEncode(new Uint8Array([1])), 'AQ')
})

test('creates the RFC 7636 S256 code challenge', async () => {
  assert.equal(
    await createS256CodeChallenge(
      'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    ),
    'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
  )
})
