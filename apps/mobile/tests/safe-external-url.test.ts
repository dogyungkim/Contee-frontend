import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getSafeContiExternalUrl,
  getSafeHttpUrl,
} from '../src/lib/safe-external-url'

test('safe external URLs accept only absolute HTTP URLs', () => {
  assert.equal(
    getSafeHttpUrl(' https://music.example.com/sheet.pdf '),
    'https://music.example.com/sheet.pdf'
  )
  assert.equal(getSafeHttpUrl('/api/files/sheet.pdf'), undefined)
  assert.equal(getSafeHttpUrl('//music.example.com/sheet.pdf'), undefined)
  assert.equal(getSafeHttpUrl('javascript:alert(1)'), undefined)
})

test('YouTube actions only accept known YouTube hosts', () => {
  assert.equal(
    getSafeContiExternalUrl('https://www.youtube.com/watch?v=abc', 'youtube'),
    'https://www.youtube.com/watch?v=abc'
  )
  assert.equal(
    getSafeContiExternalUrl('https://video.example.com/watch?v=abc', 'youtube'),
    undefined
  )
  assert.equal(
    getSafeContiExternalUrl(
      'https://music.example.com/sheet.pdf',
      'sheetMusic'
    ),
    'https://music.example.com/sheet.pdf'
  )
})
