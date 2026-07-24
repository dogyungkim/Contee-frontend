import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getNextContiPage,
  normalizeContiFilters,
} from '../src/lib/conti-list-core'

test('conti filters trim values and omit blank values', () => {
  assert.deepEqual(
    normalizeContiFilters({
      q: '  주일 예배  ',
      from: ' 2026-07-01 ',
      to: '   ',
    }),
    { q: '주일 예배', from: '2026-07-01', to: undefined }
  )
})

test('conti pagination stops at the final page', () => {
  assert.equal(
    getNextContiPage({
      content: [],
      totalElements: 40,
      totalPages: 2,
      number: 0,
    }),
    1
  )
  assert.equal(
    getNextContiPage({
      content: [],
      totalElements: 40,
      totalPages: 2,
      number: 1,
    }),
    undefined
  )
  assert.equal(
    getNextContiPage({ content: [], totalElements: 0, totalPages: 0 }),
    undefined
  )
})
