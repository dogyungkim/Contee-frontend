import assert from 'node:assert/strict'
import test from 'node:test'

import domain from '../dist/index.js'

const { formatWorshipTime, normalizeWorshipTime, parseWorshipTime } = domain

test('normalizes 24-hour worship times and strips seconds', () => {
  assert.equal(normalizeWorshipTime('9:05'), '09:05')
  assert.equal(normalizeWorshipTime('09:05:00'), '09:05')
  assert.equal(normalizeWorshipTime('23:59:30'), '23:59')
})

test('normalizes localized and AM/PM worship times', () => {
  assert.equal(normalizeWorshipTime('오전 12:00'), '00:00')
  assert.equal(normalizeWorshipTime('오후 12:00'), '12:00')
  assert.equal(normalizeWorshipTime('AM 7:30'), '07:30')
  assert.equal(normalizeWorshipTime('pm 7:30:00'), '19:30')
})

test('rejects invalid worship times', () => {
  assert.equal(normalizeWorshipTime(null), '')
  assert.equal(normalizeWorshipTime('24:00'), '')
  assert.equal(normalizeWorshipTime('13:60'), '')
  assert.equal(normalizeWorshipTime('오전 13:00'), '')
  assert.equal(normalizeWorshipTime('not-a-time'), '')
})

test('parses and formats worship time picker parts', () => {
  assert.deepEqual(parseWorshipTime(''), {
    period: 'AM',
    hour: '10',
    minute: '00',
  })
  assert.deepEqual(parseWorshipTime('15:05'), {
    period: 'PM',
    hour: '03',
    minute: '05',
  })

  assert.equal(
    formatWorshipTime({ period: 'PM', hour: '03', minute: '05' }),
    '15:05'
  )
  assert.equal(
    formatWorshipTime({ period: 'AM', hour: '12', minute: '00' }),
    '00:00'
  )
})
