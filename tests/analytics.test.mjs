import assert from 'node:assert/strict'
import test from 'node:test'

import {
  maskAnalyticsPath,
  normalizeAnalyticsPath,
} from '../src/lib/analytics.js'

test('normalizes analytics paths before tracking', () => {
  assert.equal(normalizeAnalyticsPath(''), '/')
  assert.equal(normalizeAnalyticsPath('/dashboard/contis/123/'), '/dashboard/contis/123')
  assert.equal(normalizeAnalyticsPath('/dashboard/contis/123?mode=edit'), '/dashboard/contis/123')
  assert.equal(normalizeAnalyticsPath('/dashboard/contis/123#songs'), '/dashboard/contis/123')
})

test('masks dynamic analytics route parameters', () => {
  assert.equal(maskAnalyticsPath('/share/contis/secret-token'), '/share/contis/[token]')
  assert.equal(maskAnalyticsPath('/share/contis/secret-token?from=kakao'), '/share/contis/[token]')
  assert.equal(maskAnalyticsPath('/dashboard/contis/42'), '/dashboard/contis/[id]')
  assert.equal(maskAnalyticsPath('/dashboard/contis/42?mode=edit'), '/dashboard/contis/[id]')
})

test('keeps static analytics routes readable', () => {
  assert.equal(maskAnalyticsPath('/'), '/')
  assert.equal(maskAnalyticsPath('/dashboard/contis'), '/dashboard/contis')
  assert.equal(maskAnalyticsPath('/dashboard/contis/new'), '/dashboard/contis/new')
  assert.equal(maskAnalyticsPath('/dashboard/songs'), '/dashboard/songs')
})
