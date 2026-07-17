import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveSelectedTeamId } from '../src/lib/team-selection-core'

const teams = [
  { id: 'team-a', name: 'A Team' },
  { id: 'team-b', name: 'B Team' },
]

test('team selection keeps a persisted valid team id', () => {
  assert.equal(resolveSelectedTeamId(teams, 'team-b'), 'team-b')
})

test('team selection falls back to the first team when persisted team is revoked', () => {
  assert.equal(resolveSelectedTeamId(teams, 'revoked-team'), 'team-a')
})

test('team selection falls back to the first team when persisted team is blank', () => {
  assert.equal(resolveSelectedTeamId(teams, '   '), 'team-a')
})

test('team selection clears selected id when there are no teams', () => {
  assert.equal(resolveSelectedTeamId([], 'team-a'), null)
})
