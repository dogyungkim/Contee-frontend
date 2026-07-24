import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  createContiRepository,
  createContiReadRepository,
  createSongReadRepository,
  createTeamRepository,
} = require('../dist/index.js')

const createRecordingClient = (responses = []) => {
  const calls = []
  const nextResponse = () => {
    const response = responses.shift()
    if (!response) {
      throw new Error('No fake response queued')
    }
    return Promise.resolve(response)
  }

  return {
    calls,
    client: {
      get: (url, config) => {
        calls.push({ method: 'get', url, config })
        return nextResponse()
      },
      post: (url, data, config) => {
        calls.push({ method: 'post', url, data, config })
        return nextResponse()
      },
      put: (url, data, config) => {
        calls.push({ method: 'put', url, data, config })
        return nextResponse()
      },
      delete: (url, config) => {
        calls.push({ method: 'delete', url, config })
        return nextResponse()
      },
    },
  }
}

const teamDto = {
  id: 'team-1',
  name: 'Sunday Team',
  shortCode: 'SUN123',
  description: 'Main team',
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-02T00:00:00Z',
  memberCount: 4,
}

const memberDto = {
  id: 'member-1',
  userId: 'user-1',
  userName: 'Member',
  userEmail: 'member@example.com',
  role: 'MEMBER',
  joinedAt: '2026-07-01T00:00:00Z',
}

test('team repository preserves endpoint paths, payloads, and mapping', async () => {
  const { client, calls } = createRecordingClient([
    { data: { data: teamDto } },
    { data: { data: [{ id: 'team-1', name: 'Sunday Team' }] } },
    { data: { data: teamDto } },
    { data: { data: teamDto } },
    { data: { data: null } },
    { data: { data: [memberDto] } },
    { data: { data: memberDto } },
    { data: { data: memberDto } },
    { data: { data: null } },
    { data: { data: { ...memberDto, role: 'ADMIN' } } },
  ])
  const repository = createTeamRepository(client)

  assert.equal((await repository.create({ name: 'Sunday Team' })).id, 'team-1')
  assert.equal((await repository.listMine())[0].name, 'Sunday Team')
  assert.equal((await repository.get('team-1')).memberCount, 4)
  assert.equal(
    (await repository.update('team-1', { description: 'Updated' })).name,
    'Sunday Team'
  )
  await repository.remove('team-1')
  assert.equal((await repository.listMembers('team-1'))[0].userId, 'user-1')
  assert.equal(
    (
      await repository.addMember('team-1', {
        userId: 'user-2',
        role: 'MEMBER',
      })
    ).role,
    'MEMBER'
  )
  assert.equal((await repository.join('SUN123')).id, 'member-1')
  await repository.removeMember('team-1', 'user-1')
  assert.equal(
    (await repository.updateMemberRole('team-1', 'user-1', { role: 'ADMIN' }))
      .role,
    'ADMIN'
  )

  assert.deepEqual(
    calls.map(({ method, url, data }) => ({ method, url, data })),
    [
      { method: 'post', url: '/api/v1/teams', data: { name: 'Sunday Team' } },
      { method: 'get', url: '/api/v1/teams', data: undefined },
      { method: 'get', url: '/api/v1/teams/team-1', data: undefined },
      {
        method: 'put',
        url: '/api/v1/teams/team-1',
        data: { description: 'Updated' },
      },
      { method: 'delete', url: '/api/v1/teams/team-1', data: undefined },
      { method: 'get', url: '/api/v1/teams/team-1/members', data: undefined },
      {
        method: 'post',
        url: '/api/v1/teams/team-1/members',
        data: { userId: 'user-2', role: 'MEMBER' },
      },
      {
        method: 'post',
        url: '/api/v1/teams/join',
        data: { shortCode: 'SUN123' },
      },
      {
        method: 'delete',
        url: '/api/v1/teams/team-1/members/user-1',
        data: undefined,
      },
      {
        method: 'put',
        url: '/api/v1/teams/team-1/members/user-1/role',
        data: { role: 'ADMIN' },
      },
    ]
  )
})

test('conti read repository maps list content and preserves pagination metadata', async () => {
  const contiDto = {
    id: 'conti-1',
    teamId: 'team-1',
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
          keySignature: 'D',
          isFavorite: false,
          createdAt: '2026-07-01T00:00:00Z',
          updatedAt: '2026-07-02T00:00:00Z',
        },
      },
    ],
  }
  const { client, calls } = createRecordingClient([
    {
      data: {
        data: {
          content: [contiDto],
          totalPages: 3,
          totalElements: 12,
          number: 1,
          size: 5,
          first: false,
          last: false,
        },
      },
    },
    { data: { data: contiDto } },
    {
      data: {
        data: {
          id: 'shared-1',
          title: 'Published',
          worshipDate: '2026-07-19',
          worshipTime: '09:00:00',
        },
      },
    },
  ])
  const repository = createContiReadRepository(client)

  const page = await repository.listByTeam('team-1', { q: 'Sunday', page: 1 })
  assert.equal(page.totalPages, 3)
  assert.equal(page.totalElements, 12)
  assert.equal(page.content[0].worshipTime, '13:30')
  assert.equal(page.content[0].contiSongs?.[0]?.title, 'Grace')

  const detail = await repository.get('conti-1')
  assert.equal(detail.title, 'Sunday Service')

  const shared = await repository.getShared('share-token')
  assert.equal(shared.worshipTime, '09:00')
  assert.deepEqual(shared.contiSongs, [])

  assert.deepEqual(calls, [
    {
      method: 'get',
      url: '/api/v1/teams/team-1/contis',
      config: { params: { q: 'Sunday', page: 1 } },
    },
    { method: 'get', url: '/api/v1/contis/conti-1', config: undefined },
    {
      method: 'get',
      url: '/api/v1/share/contis/share-token',
      config: undefined,
    },
  ])
})

test('conti repository creates through the canonical endpoint and maps the response', async () => {
  const request = {
    teamId: 'team-1',
    title: 'Sunday Service',
    worshipDate: '2026-07-19',
    worshipTime: '13:30',
  }
  const { client, calls } = createRecordingClient([
    {
      data: {
        data: {
          id: 'conti-1',
          ...request,
          worshipTime: '오후 1:30:00',
          status: 'DRAFT',
        },
      },
    },
  ])

  const conti = await createContiRepository(client).create(request)

  assert.equal(conti.id, 'conti-1')
  assert.equal(conti.worshipTime, '13:30')
  assert.deepEqual(calls, [
    { method: 'post', url: '/api/v1/contis', data: request, config: undefined },
  ])
})

test('song read repository maps list content and preserves pagination metadata', async () => {
  const songDto = {
    id: 'team-song-1',
    teamId: 'team-1',
    songId: 'song-1',
    title: 'Amazing Grace',
    artist: 'Traditional',
    keySignature: 'G',
    bpm: 72,
    note: 'Acoustic arrangement',
    isFavorite: true,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-02T00:00:00Z',
  }
  const { client, calls } = createRecordingClient([
    {
      data: {
        data: {
          content: [songDto],
          totalPages: 2,
          totalElements: 6,
          number: 1,
          size: 3,
          numberOfElements: 1,
          first: false,
          last: false,
        },
      },
    },
  ])
  const repository = createSongReadRepository(client)

  const page = await repository.listByTeam('team-1', {
    q: 'Grace',
    key: 'G',
    isFavorite: true,
    page: 1,
    size: 3,
  })

  assert.equal(page.totalPages, 2)
  assert.equal(page.totalElements, 6)
  assert.equal(page.number, 1)
  assert.equal(page.size, 3)
  assert.equal(page.numberOfElements, 1)
  assert.equal(page.first, false)
  assert.equal(page.last, false)
  assert.equal(page.content[0].title, 'Amazing Grace')
  assert.equal(page.content[0].artist, 'Traditional')
  assert.equal(page.content[0].keySignature, 'G')
  assert.equal(page.content[0].bpm, 72)
  assert.equal(page.content[0].note, 'Acoustic arrangement')
  assert.equal(page.content[0].isFavorite, true)

  assert.deepEqual(calls, [
    {
      method: 'get',
      url: '/api/v1/teams/team-1/songs',
      config: {
        params: {
          q: 'Grace',
          key: 'G',
          isFavorite: true,
          page: 1,
          size: 3,
        },
      },
    },
  ])
})
