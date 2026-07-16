import assert from 'node:assert/strict'
import test from 'node:test'

import query from '../dist/index.js'

const { authKeys, contiKeys, dashboardKeys, songKeys, teamKeys } = query

test('auth user keys are isolated by session version', () => {
  assert.deepEqual(authKeys.currentUser(), ['auth', 'user'])
  assert.deepEqual(authKeys.user(1), ['auth', 'user', 1])
  assert.deepEqual(authKeys.user(2), ['auth', 'user', 2])
  assert.notDeepEqual(authKeys.user(1), authKeys.user(2))
})

test('auth callback keys are isolated by callback result parameters', () => {
  const success = authKeys.callback({ success: 'true' })
  const failure = authKeys.callback({
    success: 'false',
    error: 'oauth_failed',
    message: 'Denied',
  })

  assert.deepEqual(success, ['auth', 'callback', 'true', '', ''])
  assert.deepEqual(failure, [
    'auth',
    'callback',
    'false',
    'oauth_failed',
    'Denied',
  ])
  assert.notDeepEqual(success, failure)
})

test('team keys isolate details and members by team id', () => {
  assert.deepEqual(teamKeys.lists(), ['teams', 'list'])
  assert.deepEqual(teamKeys.detail('team-1'), ['teams', 'detail', 'team-1'])
  assert.deepEqual(teamKeys.members('team-1'), [
    'teams',
    'detail',
    'team-1',
    'members',
  ])
  assert.notDeepEqual(teamKeys.members('team-1'), teamKeys.members('team-2'))
})

test('song keys isolate list by team and form by team plus song', () => {
  assert.deepEqual(songKeys.list('team-1'), ['songs', 'list', 'team-1'])
  assert.deepEqual(songKeys.form('team-1', 'song-1'), [
    'songs',
    'form',
    'team-1',
    'song-1',
  ])
  assert.notDeepEqual(songKeys.list('team-1'), songKeys.list('team-2'))
  assert.notDeepEqual(
    songKeys.form('team-1', 'song-1'),
    songKeys.form('team-1', 'song-2')
  )
})

test('conti list keys isolate team and filters while preserving team index', () => {
  const defaultFilter = { page: 0, size: 100 }
  const searchFilter = { page: 0, size: 100, q: 'Sunday' }

  assert.deepEqual(contiKeys.teamLists('team-1'), ['contis', 'list', 'team-1'])
  assert.deepEqual(contiKeys.list('team-1', defaultFilter), [
    'contis',
    'list',
    'team-1',
    defaultFilter,
  ])
  assert.equal(contiKeys.list('team-1', defaultFilter)[2], 'team-1')
  assert.notDeepEqual(
    contiKeys.list('team-1', defaultFilter),
    contiKeys.list('team-2', defaultFilter)
  )
  assert.notDeepEqual(
    contiKeys.list('team-1', defaultFilter),
    contiKeys.list('team-1', searchFilter)
  )
})

test('dashboard data keys isolate selected team including no-team state', () => {
  assert.deepEqual(dashboardKeys.data('team-1'), [
    'dashboard',
    'data',
    'team-1',
  ])
  assert.deepEqual(dashboardKeys.data(null), ['dashboard', 'data', null])
  assert.notDeepEqual(
    dashboardKeys.data('team-1'),
    dashboardKeys.data('team-2')
  )
  assert.notDeepEqual(dashboardKeys.data('team-1'), dashboardKeys.data(null))
})
