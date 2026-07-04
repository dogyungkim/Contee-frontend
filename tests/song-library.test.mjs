import assert from 'node:assert/strict'
import test from 'node:test'

import {
  filterSongLibrary,
  findDuplicateSong,
} from '../src/domains/song/utils/song-library.js'

const songs = [
  {
    id: 'song-1',
    title: '주의 은혜라',
    artist: '마커스 워십',
    keySignature: 'D',
    bpm: 72,
    isFavorite: true,
  },
  {
    id: 'song-2',
    title: 'Way Maker',
    artist: 'Sinach',
    keySignature: 'E',
    bpm: 68,
    isFavorite: false,
  },
]

test('finds a duplicate after normalizing title and artist', () => {
  assert.equal(
    findDuplicateSong(songs, {
      title: '  주의   은혜라 ',
      artist: '마커스워십',
    })?.id,
    'song-1',
  )
})

test('does not treat the song being edited as its own duplicate', () => {
  assert.equal(
    findDuplicateSong(
      songs,
      { title: '주의 은혜라', artist: '마커스 워십' },
      'song-1',
    ),
    undefined,
  )
})

test('combines favorites and text search filters', () => {
  assert.deepEqual(
    filterSongLibrary(songs, '72', true).map((song) => song.id),
    ['song-1'],
  )
  assert.deepEqual(filterSongLibrary(songs, 'way', true), [])
})
