import assert from 'node:assert/strict'
import test from 'node:test'

import {
  hasContiChanges,
  getContiMetadataInputError,
  hasContiMetadataChanges,
  moveContiSong,
  normalizeContiMetadata,
  toContiSongInputs,
  toContiUpdateRequest,
} from '../src/lib/conti-form-core'
import type { Conti } from '@contee/domain'

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

const conti = {
  id: 'conti-1',
  title: '주일 예배',
  worshipDate: '2026-07-19',
  worshipTime: '13:30',
  teamId: 'team-1',
  status: 'DRAFT',
  contiSongs: [
    {
      id: 'song-1',
      title: '기존 곡',
      orderIndex: 3,
      songForm: [],
      teamSongId: 'team-song-1',
    },
    {
      id: 'song-2',
      title: '직접 입력 곡',
      orderIndex: 8,
      songForm: [],
      artist: '원곡자',
    },
  ],
} as Conti

test('conti update keeps existing ids and derives order from the edited list', () => {
  const songs = toContiSongInputs(conti)
  const reordered = moveContiSong(songs, 1, 0)
  const request = toContiUpdateRequest(
    conti,
    {
      title: conti.title,
      worshipDate: conti.worshipDate,
      worshipTime: conti.worshipTime,
    },
    reordered
  )

  assert.deepEqual(
    request.contiSongs.map(({ id, title, orderIndex }) => ({
      id,
      title,
      orderIndex,
    })),
    [
      { id: 'song-2', title: '직접 입력 곡', orderIndex: 0 },
      { id: 'song-1', title: '기존 곡', orderIndex: 1 },
    ]
  )
})

test('conti songs become dirty when direct entries change or reorder', () => {
  const songs = toContiSongInputs(conti)
  const metadata = {
    title: conti.title,
    worshipDate: conti.worshipDate,
    worshipTime: conti.worshipTime,
  }

  assert.equal(hasContiChanges(conti, metadata, songs), false)
  assert.equal(
    hasContiChanges(conti, metadata, moveContiSong(songs, 1, 0)),
    true
  )
  assert.equal(
    hasContiChanges(conti, metadata, [
      ...songs,
      { localId: 'new-1', title: '새 곡', songForm: [] },
    ]),
    true
  )
})
