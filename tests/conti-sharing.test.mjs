import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildContiYoutubeReferenceText,
  getExternalShareCompletion,
} from '../src/domains/conti/utils/conti-sharing.js'

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

test('builds plain youtube reference text from songs with youtube links', () => {
  assert.equal(
    buildContiYoutubeReferenceText({
      title: '주일 2부 예배',
      contiSongs: [
        {
          id: 'song-2',
          title: '두 번째 곡',
          orderIndex: 1,
          youtubeUrl: 'https://youtu.be/two',
          songForm: [],
        },
        {
          id: 'song-1',
          title: '첫 번째 곡',
          orderIndex: 0,
          youtubeUrl: 'https://youtube.com/watch?v=one',
          songForm: [],
        },
        {
          id: 'song-3',
          title: '링크 없는 곡',
          orderIndex: 2,
          songForm: [],
        },
      ],
    }),
    [
      '주일 2부 예배',
      '',
      '1. 첫 번째 곡',
      'https://youtube.com/watch?v=one',
      '2. 두 번째 곡',
      'https://youtu.be/two',
    ].join('\n'),
  )
})

test('adds key and bpm beside titles when requested', () => {
  assert.equal(
    buildContiYoutubeReferenceText(
      {
        title: '금요 예배',
        contiSongs: [
          {
            id: 'song-1',
            title: '주의 은혜라',
            orderIndex: 0,
            key: 'G',
            bpm: 72,
            youtubeUrl: 'https://youtube.com/watch?v=grace',
            songForm: [],
          },
          {
            id: 'song-2',
            title: '나는 예배자입니다',
            orderIndex: 1,
            youtubeUrl: 'https://youtube.com/watch?v=worshiper',
            songForm: [],
            teamSong: {
              keySignature: 'F',
              bpm: 66,
            },
          },
        ],
      },
      { includeKeyAndBpm: true },
    ),
    [
      '금요 예배',
      '',
      '1. 주의 은혜라 (Key G, BPM 72)',
      'https://youtube.com/watch?v=grace',
      '2. 나는 예배자입니다 (Key F, BPM 66)',
      'https://youtube.com/watch?v=worshiper',
    ].join('\n'),
  )
})

test('returns an empty string when no songs have youtube links', () => {
  assert.equal(
    buildContiYoutubeReferenceText({
      title: '주일 예배',
      contiSongs: [
        {
          id: 'song-1',
          title: '오프라인 레퍼런스',
          orderIndex: 0,
          songForm: [],
        },
      ],
    }),
    '',
  )
})
