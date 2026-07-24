import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getSongInputError,
  parseSongForm,
  toSongRequest,
} from '../src/lib/song-form-core'

test('song form validates Korean input and converts supported form labels', () => {
  assert.equal(
    getSongInputError({
      title: '',
      artist: '',
      keySignature: '',
      bpm: '',
      note: '',
      form: '',
    }),
    '곡 제목을 입력해 주세요.'
  )
  assert.equal(
    getSongInputError({
      title: '은혜',
      artist: '',
      keySignature: '',
      bpm: '0',
      note: '',
      form: '',
    }),
    'BPM은 0보다 큰 정수로 입력해 주세요.'
  )
  assert.deepEqual(parseSongForm('intro, verse, pre-chorus'), [
    'INTRO',
    'VERSE',
    'PRE_CHORUS',
  ])
  assert.deepEqual(
    toSongRequest({
      title: ' 은혜 ',
      artist: '',
      keySignature: ' G ',
      bpm: '72',
      note: '',
      form: 'verse, chorus',
    }),
    {
      title: '은혜',
      keySignature: 'G',
      bpm: 72,
      songForm: [
        { partType: 'VERSE', repeatCount: 1 },
        { partType: 'CHORUS', repeatCount: 1 },
      ],
    }
  )
})
