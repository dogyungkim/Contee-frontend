import assert from 'node:assert/strict'
import test from 'node:test'

import domain from '../dist/index.js'

const {
  toAuthResponseModel,
  toContiModel,
  toDashboardDataModel,
  toSharedContiModel,
  toTeamMemberModel,
  toTeamModel,
  toTeamSongModel,
} = domain

test('maps auth responses without changing the user shape', () => {
  const model = toAuthResponseModel({
    accessToken: 'access-token',
    user: {
      id: 'user-1',
      email: 'person@example.com',
      name: 'Person',
      profileImageUrl: 'https://example.com/avatar.png',
      provider: 'google',
    },
  })

  assert.deepEqual(model, {
    accessToken: 'access-token',
    user: {
      id: 'user-1',
      email: 'person@example.com',
      name: 'Person',
      profileImageUrl: 'https://example.com/avatar.png',
      provider: 'google',
    },
  })
})

test('maps team and member DTOs by preserving server-owned fields', () => {
  assert.deepEqual(
    toTeamModel({
      id: 'team-1',
      name: 'Worship Team',
      shortCode: 'ABCD12',
      description: 'Sunday team',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-02T00:00:00Z',
      memberCount: 7,
    }),
    {
      id: 'team-1',
      name: 'Worship Team',
      shortCode: 'ABCD12',
      description: 'Sunday team',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-02T00:00:00Z',
      memberCount: 7,
    }
  )

  assert.equal(
    toTeamMemberModel({
      id: 'member-1',
      userId: 'user-1',
      userName: 'Member',
      userEmail: 'member@example.com',
      role: 'MEMBER',
      joinedAt: '2026-07-01T00:00:00Z',
    }).role,
    'MEMBER'
  )
})

test('maps team songs as platform-neutral song models', () => {
  const song = {
    id: 'team-song-1',
    teamId: 'team-1',
    title: 'Amazing Grace',
    artist: 'Traditional',
    keySignature: 'G',
    bpm: 72,
    isFavorite: true,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-02T00:00:00Z',
  }

  assert.deepEqual(toTeamSongModel(song), song)
})

test('maps conti DTOs with team-song fallbacks and normalized worship time', () => {
  const model = toContiModel({
    id: 'conti-1',
    title: 'Sunday Service',
    worshipDate: '2026-07-19',
    worshipTime: '오후 1:30:00',
    status: 'DRAFT',
    contiSongs: [
      {
        id: 'conti-song-1',
        orderIndex: 0,
        teamSong: {
          id: 'team-song-1',
          teamId: 'team-1',
          title: 'Grace',
          artist: 'Traditional',
          keySignature: 'D',
          bpm: 80,
          youtubeUrl: 'https://youtu.be/example',
          sheetMusicUrl: 'https://example.com/sheet.pdf',
          isFavorite: false,
          createdAt: '2026-07-01T00:00:00Z',
          updatedAt: '2026-07-02T00:00:00Z',
        },
      },
    ],
  })

  assert.equal(model.teamId, '')
  assert.equal(model.worshipTime, '13:30')
  assert.equal(model.contiSongs?.[0]?.title, 'Grace')
  assert.equal(model.contiSongs?.[0]?.key, 'D')
  assert.deepEqual(model.contiSongs?.[0]?.songForm, [])
})

test('maps shared conti DTOs with an empty song list fallback', () => {
  const model = toSharedContiModel({
    id: 'shared-1',
    title: 'Published Service',
    worshipDate: '2026-07-19',
    worshipTime: '09:00:00',
  })

  assert.deepEqual(model.contiSongs, [])
  assert.equal(model.worshipTime, '09:00')
})

test('maps dashboard aggregate data', () => {
  const model = toDashboardDataModel({
    summary: {
      nextServiceLabel: 'Next',
      nextServiceDateLabel: 'Jul 19',
      thisWeekContiCount: 2,
      totalSongCount: 10,
    },
    recentContis: [
      {
        id: 'conti-1',
        title: 'Sunday',
        worshipDate: '2026-07-19',
        updatedAt: '2026-07-16T00:00:00Z',
        songCount: 4,
      },
    ],
    songs: [
      {
        id: 'song-1',
        title: 'Song',
        artist: 'Artist',
        createdAt: '2026-07-01T00:00:00Z',
        updatedAt: '2026-07-02T00:00:00Z',
      },
    ],
    activities: [{ id: 'activity-1', timeLabel: 'Now', message: 'Updated' }],
  })

  assert.equal(model.summary.totalSongCount, 10)
  assert.equal(model.recentContis[0].songCount, 4)
  assert.equal(model.songs[0].title, 'Song')
  assert.equal(model.activities[0].message, 'Updated')
})
