import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getContiMetadataInputError,
  hasContiMetadataChanges,
  normalizeContiMetadata,
} from '../src/lib/conti-form-core'

test('conti metadata trims input before sending it to the API', () => {
  assert.deepEqual(
    normalizeContiMetadata({
      title: '  주일 예배  ',
      worshipDate: ' 2026-07-19 ',
      worshipTime: ' 13:30 ',
    }),
    { title: '주일 예배', worshipDate: '2026-07-19', worshipTime: '13:30' }
  )
})

test('conti metadata only becomes dirty after a meaningful change', () => {
  const initial = {
    title: '주일 예배',
    worshipDate: '2026-07-19',
    worshipTime: '13:30',
  }

  assert.equal(
    hasContiMetadataChanges(initial, { ...initial, title: ' 주일 예배 ' }),
    false
  )
  assert.equal(
    hasContiMetadataChanges(initial, { ...initial, worshipTime: '14:00' }),
    true
  )
})

test('conti metadata validates required title, calendar date, and time format', () => {
  assert.equal(
    getContiMetadataInputError({
      title: ' ',
      worshipDate: '2026-07-19',
      worshipTime: '13:30',
    }),
    '콘티 제목을 입력해 주세요.'
  )
  assert.match(
    getContiMetadataInputError({
      title: '예배',
      worshipDate: '2026-02-29',
      worshipTime: '13:30',
    }) ?? '',
    /YYYY-MM-DD/
  )
  assert.match(
    getContiMetadataInputError({
      title: '예배',
      worshipDate: '2028-02-29',
      worshipTime: '24:00',
    }) ?? '',
    /HH:mm/
  )
  assert.equal(
    getContiMetadataInputError({
      title: '예배',
      worshipDate: '2028-02-29',
      worshipTime: '09:00',
    }),
    null
  )
})
