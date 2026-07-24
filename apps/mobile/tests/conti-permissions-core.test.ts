import assert from 'node:assert/strict'
import test from 'node:test'

import { getContiPermissions } from '../src/lib/conti-permissions-core'

const conti = {
  id: 'conti-1',
  teamId: 'team-1',
  title: '주일 예배',
  worshipDate: '2026-07-19',
  worshipTime: '13:30',
  status: 'DRAFT' as const,
  createdById: 'user-1',
}

test('conti permissions require resolved membership and creator-only publishing', () => {
  assert.deepEqual(
    getContiPermissions({ conti, currentUserId: 'user-1', members: undefined }),
    { isResolved: false, canEdit: false, canDelete: false, canPublish: false }
  )
  assert.deepEqual(
    getContiPermissions({
      conti,
      currentUserId: 'user-1',
      members: [
        {
          id: 'member-1',
          userId: 'user-1',
          userName: '사용자',
          userEmail: 'user@example.com',
          role: 'MEMBER',
          joinedAt: '2026-07-01',
        },
      ],
    }),
    { isResolved: true, canEdit: true, canDelete: true, canPublish: true }
  )
  assert.deepEqual(
    getContiPermissions({
      conti,
      currentUserId: 'user-2',
      members: [
        {
          id: 'member-2',
          userId: 'user-2',
          userName: '다른 사용자',
          userEmail: 'other@example.com',
          role: 'ADMIN',
          joinedAt: '2026-07-01',
        },
      ],
    }),
    { isResolved: true, canEdit: true, canDelete: true, canPublish: false }
  )
})
