import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getCreateTeamInputError,
  getInviteCodeInputError,
  normalizeInviteCode,
  normalizeTeamDescription,
  normalizeTeamName,
} from '../src/lib/team-form-core'

test('team form input normalization removes boundary whitespace', () => {
  assert.equal(normalizeTeamName('  주일 찬양팀  '), '주일 찬양팀')
  assert.equal(normalizeTeamDescription('  소개  '), '소개')
  assert.equal(normalizeTeamDescription('  '), undefined)
  assert.equal(normalizeInviteCode('  wsHip001  '), 'WSHIP001')
})

test('team form input validation rejects missing and oversized values', () => {
  assert.equal(
    getCreateTeamInputError({ name: ' ', description: '' }),
    '팀 이름을 입력해 주세요.'
  )
  assert.match(
    getCreateTeamInputError({ name: 'a'.repeat(101), description: '' }) ?? '',
    /100자/
  )
  assert.match(
    getCreateTeamInputError({ name: '팀', description: 'a'.repeat(2001) }) ??
      '',
    /2000자/
  )
  assert.equal(getInviteCodeInputError('  '), '초대 코드를 입력해 주세요.')
  assert.equal(getInviteCodeInputError(' TEAM01 '), null)
})
