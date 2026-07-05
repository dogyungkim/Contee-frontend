import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildContiModeHref,
  buildContiSongRequests,
  createContiDraft,
  getContiSongDisplay,
  normalizeContiSongs,
  parseBibleVerse,
} from '../src/domains/conti/utils/conti-editor.js'

const baseSong = {
  artist: '마커스',
  orderIndex: 0,
  key: 'D',
  bpm: 72,
  note: '두 번 반복',
  youtubeUrl: 'https://youtube.com/watch?v=1',
  sheetMusicUrl: 'https://example.com/sheet',
  songForm: [
    {
      id: 1,
      partOrder: 0,
      partType: 'VERSE',
      repeatCount: 2,
      barCount: 8,
      note: 'Verse 1',
    },
  ],
}

test('splits the first non-empty Bible verse line from its content', () => {
  assert.deepEqual(parseBibleVerse('  시편 23편  \n\n 여호와는 나의 목자시니 \n 부족함이 없으리로다 '), {
    reference: '시편 23편',
    content: '여호와는 나의 목자시니\n부족함이 없으리로다',
  })
})

test('normalizes draft ids and song order for change comparison', () => {
  assert.deepEqual(
    normalizeContiSongs([
      { ...baseSong, id: 'draft-song-1', title: '첫 곡', orderIndex: 4 },
      { ...baseSong, id: 'song-2', title: '둘째 곡', orderIndex: 9 },
    ]),
    [
      { ...baseSong, id: undefined, teamSongId: undefined, title: '첫 곡', orderIndex: 0 },
      { ...baseSong, id: 'song-2', teamSongId: undefined, title: '둘째 곡', orderIndex: 1 },
    ],
  )
})

test('builds different requests for existing, library, and newly created songs', () => {
  const requests = buildContiSongRequests([
    { ...baseSong, id: 'song-1', title: '기존 곡' },
    { ...baseSong, id: 'draft-song-2', teamSongId: 'team-song-2', title: '라이브러리 곡' },
    {
      ...baseSong,
      id: 'draft-song-3',
      title: '신규 곡',
      teamSong: { note: '팀 메모' },
    },
  ])

  assert.equal(requests[0].id, 'song-1')
  assert.equal(requests[0].title, '기존 곡')
  assert.equal(requests[1].teamSongId, 'team-song-2')
  assert.equal('title' in requests[1], false)
  assert.equal(requests[2].title, '신규 곡')
  assert.equal(requests[2].defaultKey, 'D')
  assert.equal(requests[2].defaultBpm, 72)
  assert.equal(requests[2].teamNote, '팀 메모')
  assert.deepEqual(requests.map((request) => request.orderIndex), [0, 1, 2])
})

test('adds and removes edit mode while preserving other query parameters', () => {
  assert.equal(
    buildContiModeHref('/dashboard/contis/1', 'tab=songs', 'edit'),
    '/dashboard/contis/1?tab=songs&mode=edit',
  )
  assert.equal(
    buildContiModeHref('/dashboard/contis/1', 'tab=songs&mode=edit', 'view'),
    '/dashboard/contis/1?tab=songs',
  )
  assert.equal(
    buildContiModeHref('/dashboard/contis/1', 'mode=edit', 'view'),
    '/dashboard/contis/1',
  )
})

test('builds the same read-only song display values from overrides and team defaults', () => {
  assert.deepEqual(
    getContiSongDisplay({
      id: 'song-1',
      title: '주의 은혜라',
      artist: '',
      orderIndex: 0,
      key: 'E',
      bpm: 76,
      note: '콘티 메모',
      youtubeUrl: '',
      songForm: [],
      teamSong: {
        artist: '마커스',
        note: '팀 메모',
        youtubeUrl: 'https://youtube.com/team',
        sheetMusicUrl: 'https://example.com/team-sheet',
      },
    }),
    {
      title: '주의 은혜라',
      artist: '마커스',
      keySignature: 'E',
      bpm: 76,
      note: '콘티 메모',
      teamNote: '팀 메모',
      youtubeUrl: 'https://youtube.com/team',
      sheetMusicUrl: 'https://example.com/team-sheet',
      songForm: [],
    },
  )
})

test('creates an editor draft from a conti when edit mode mounts', () => {
  const songs = [{ ...baseSong, id: 'song-1', title: '첫 곡' }]

  assert.deepEqual(
    createContiDraft({
      title: '주일 예배',
      worshipDate: '2026-07-05',
      worshipTime: '14:30',
      memo: '예배 메모',
      bibleVerse: '시편 23편\n여호와는 나의 목자시니',
      sharingInfo: '나눔 내용',
      contiSongs: songs,
    }),
    {
      title: '주일 예배',
      worshipDate: '2026-07-05',
      period: 'PM',
      hour: '02',
      minute: '30',
      memo: '예배 메모',
      bibleVerseReference: '시편 23편',
      bibleVerseContent: '여호와는 나의 목자시니',
      sharingInfo: '나눔 내용',
      songs,
    },
  )
})

test('creates an editor draft from a localized Korean worship time', () => {
  const draft = createContiDraft({
    title: '저녁 예배',
    worshipDate: '2026-07-05',
    worshipTime: '오후 7:30',
    contiSongs: [],
  })

  assert.equal(draft.period, 'PM')
  assert.equal(draft.hour, '07')
  assert.equal(draft.minute, '30')
})
