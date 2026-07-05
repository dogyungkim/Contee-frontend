import assert from 'node:assert/strict'
import test from 'node:test'

import { getExternalShareCompletion } from '../src/domains/conti/utils/conti-sharing.js'

test('waits for an explicit copy action after creating an external share link', () => {
  assert.deepEqual(getExternalShareCompletion('/share/contis/token-1'), {
    dialogMode: 'copy',
    shareUrl: '/share/contis/token-1',
  })
})

test('closes the dialog when the share response has no URL', () => {
  assert.deepEqual(getExternalShareCompletion(null), {
    dialogMode: null,
    shareUrl: null,
  })
})
