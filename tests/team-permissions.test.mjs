import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canCreateConti,
  canEditTeamContent,
} from '../src/domains/team/utils/team-permissions.js'

test('editors can edit team content', () => {
  for (const role of ['OWNER', 'ADMIN', 'MEMBER']) {
    assert.equal(canEditTeamContent(role), true)
  }
})

test('viewers and users without a confirmed role cannot edit team content', () => {
  assert.equal(canEditTeamContent('VIEWER'), false)
  assert.equal(canEditTeamContent(undefined), false)
  assert.equal(canEditTeamContent(null), false)
})

test('only owners and admins can create contis', () => {
  assert.equal(canCreateConti('OWNER'), true)
  assert.equal(canCreateConti('ADMIN'), true)
  assert.equal(canCreateConti('MEMBER'), false)
  assert.equal(canCreateConti('VIEWER'), false)
  assert.equal(canCreateConti(undefined), false)
  assert.equal(canCreateConti(null), false)
})
