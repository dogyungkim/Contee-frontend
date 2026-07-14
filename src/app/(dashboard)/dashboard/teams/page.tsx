/* eslint-disable @next/next/no-img-element */
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Users, Copy, Check, MoreVertical, UserMinus, Shield, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTeam } from '@/context/team-context'
import { useTeamMembersQuery, useTeamQuery } from '@/domains/team/hooks/use-team-query'
import { useTeamMemberActions } from '@/domains/team/hooks/use-team-member-actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import type { TeamRole } from '@/types/team'

type MemberRoleFilter = 'ALL' | TeamRole

const MEMBER_ROLE_FILTERS: { value: MemberRoleFilter; label: string }[] = [
  { value: 'ALL', label: '모든 역할' },
  { value: 'OWNER', label: '소유자' },
  { value: 'ADMIN', label: '리더' },
  { value: 'MEMBER', label: '멤버' },
  { value: 'VIEWER', label: '뷰어' },
]

export default function TeamsPage() {
  const { selectedTeam: summaryTeam, selectedTeamId } = useTeam()
  const { data: teamDetail } = useTeamQuery(selectedTeamId || '')
  const selectedTeam = teamDetail || summaryTeam
  const { user } = useAuth()
  const { data: members = [], isLoading: isMembersLoading } = useTeamMembersQuery(selectedTeamId || '')
  const [memberSearch, setMemberSearch] = useState('')
  const [memberRoleFilter, setMemberRoleFilter] = useState<MemberRoleFilter>('ALL')
  const {
    copiedCode,
    canManageMembers,
    handleCopyInviteCode,
    handleRemoveMember,
    handleChangeRole,
    getRoleLabel,
    getRoleBadgeVariant,
  } = useTeamMemberActions({
    selectedTeamId,
    selectedTeamShortCode: selectedTeam?.shortCode,
    members,
    currentUserId: user?.id,
  })
  const hasManageableMembers = canManageMembers && members.some(
    (member) =>
      member.userId !== String(user?.id) &&
      member.role !== 'OWNER',
  )
  const filteredMembers = useMemo(() => {
    const normalizedSearch = memberSearch.trim().toLowerCase()

    return members.filter((member) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        member.userName.toLowerCase().includes(normalizedSearch) ||
        member.userEmail.toLowerCase().includes(normalizedSearch)
      const matchesRole =
        memberRoleFilter === 'ALL' || member.role === memberRoleFilter

      return matchesSearch && matchesRole
    })
  }, [memberRoleFilter, memberSearch, members])

  if (!selectedTeam) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
            <Users className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="type-card-title mb-2">팀이 없습니다</h3>
            <p className="type-body-sm mb-6 text-center text-muted-foreground">
              새로운 팀을 만들어 팀원들과 함께 작업을 시작하세요.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/teams/create">
                <Plus className="mr-2 h-4 w-4" />
                첫 팀 만들기
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-caption-upper text-muted-foreground">Team settings</div>
          <h1 className="type-page-title mt-2">팀 관리</h1>
          <p className="type-page-description mt-2 break-words">
            {selectedTeam.name} 팀의 정보와 멤버를 관리하세요.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit rounded-2xl">
          <CardHeader className="border-b border-border px-4 pb-4 sm:px-6">
            <CardTitle className="type-card-title">팀 정보</CardTitle>
            <CardDescription className="break-words">현재 선택된 팀의 기본 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-4 sm:px-6">
            <div>
              <div className="text-caption-upper text-muted-foreground">Team name</div>
              <p className="type-emphasis mt-2 break-words">{selectedTeam.name}</p>
            </div>

            {selectedTeam.description && (
              <div>
                <div className="text-caption-upper text-muted-foreground">Description</div>
                <p className="type-body mt-2 break-words text-foreground">{selectedTeam.description}</p>
              </div>
            )}

            <div>
              <div className="text-caption-upper text-muted-foreground">Invite code</div>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-[#fafafa] p-3">
                  <p className="type-emphasis truncate font-mono">{selectedTeam.shortCode}</p>
                </div>
                <Button variant="outline" size="icon" className="shrink-0" onClick={handleCopyInviteCode}>
                  {copiedCode ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="type-body-sm mt-2 text-muted-foreground">이 코드를 공유하여 팀원을 초대하세요.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="border-b border-border px-4 pb-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="type-card-title">팀 멤버</CardTitle>
                <CardDescription>{members.length}명의 멤버가 있습니다.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {isMembersLoading ? (
              <div className="space-y-3 px-4 py-5 sm:px-6 sm:py-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="type-card-title mb-1">멤버가 없습니다</h3>
                <p className="type-body-sm mb-4 text-muted-foreground">
                  초대 코드를 공유하여 팀원을 초대하세요.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 border-b border-border px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_180px]">
                  <div className="relative min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={memberSearch}
                      onChange={(event) => setMemberSearch(event.target.value)}
                      placeholder="이름 또는 이메일 검색"
                      aria-label="팀 멤버 검색"
                      className="pl-9"
                    />
                  </div>
                  <Select
                    value={memberRoleFilter}
                    onValueChange={(value) => setMemberRoleFilter(value as MemberRoleFilter)}
                  >
                    <SelectTrigger aria-label="역할 필터" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_ROLE_FILTERS.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="type-label text-muted-foreground lg:col-span-2">
                    {filteredMembers.length}명 표시 중
                  </div>
                </div>

                <div
                  className={`hidden items-center gap-4 border-b border-border px-6 py-3 text-caption-upper text-muted-foreground lg:grid
                    ${hasManageableMembers ?
                      'grid-cols-[minmax(0,1.6fr)_120px_56px]' :
                      'grid-cols-[minmax(0,1.6fr)_120px]'}`}
                >
                  <div>Member</div>
                  <div>Role</div>
                  {hasManageableMembers && <div className="text-right">Menu</div>}
                </div>

                {filteredMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="mb-4 rounded-full bg-muted p-4">
                      <Search className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h3 className="type-card-title mb-1">검색 결과가 없습니다</h3>
                    <p className="type-body-sm text-muted-foreground">
                      검색어 또는 역할 필터를 변경해보세요.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border lg:max-h-[520px] lg:overflow-y-auto">
                    {filteredMembers.map((member) => {
                      const isCurrentUser = member.userId === String(user?.id)
                      const isOwner = member.role === 'OWNER'
                      const canManageMember = canManageMembers && !isCurrentUser && !isOwner

                      return (
                        <div
                          key={member.id}
                          className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 px-4 py-4 transition-colors hover:bg-[#fafafa] sm:px-6 lg:items-center ${hasManageableMembers
                            ? 'lg:grid-cols-[minmax(0,1.6fr)_120px_56px]'
                            : 'lg:grid-cols-[minmax(0,1.6fr)_120px]'
                            }`}
                        >
                          <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 lg:col-auto lg:row-auto">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
                              {member.userProfileImageUrl ? (
                                <img
                                  src={member.userProfileImageUrl}
                                  alt={member.userName}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="type-label">
                                  {member.userName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {member.userName}
                                {isCurrentUser && (
                                  <span className="type-label ml-2 text-muted-foreground">(나)</span>
                                )}
                              </p>
                              <p className="type-body-sm truncate text-muted-foreground">{member.userEmail}</p>
                            </div>
                          </div>

                          <div className="col-start-1 row-start-2 flex items-center gap-2 lg:col-auto lg:row-auto lg:justify-start">
                            <Badge
                              variant={getRoleBadgeVariant(member.role)}
                              className="type-badge rounded-md border px-2.5 py-1"
                            >
                              {getRoleLabel(member.role)}
                            </Badge>
                          </div>

                          <div className="col-start-2 row-span-2 row-start-1 flex justify-end self-start lg:hidden">
                            {canManageMember && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label={`${member.userName} 멤버 관리`}>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>멤버 관리</DropdownMenuLabel>
                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => handleChangeRole(member.userId, 'ADMIN', member.userName)}
                                    disabled={member.role === 'ADMIN'}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    관리자로 변경
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleChangeRole(member.userId, 'MEMBER', member.userName)}
                                    disabled={member.role === 'MEMBER'}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    멤버로 변경
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => handleRemoveMember(member.userId, member.userName)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    팀에서 내보내기
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {hasManageableMembers && (
                            <div className="hidden justify-end lg:flex">
                              {canManageMember ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>멤버 관리</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleChangeRole(member.userId, 'ADMIN', member.userName)}
                                      disabled={member.role === 'ADMIN'}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      관리자로 변경
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleChangeRole(member.userId, 'MEMBER', member.userName)}
                                      disabled={member.role === 'MEMBER'}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      멤버로 변경
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleRemoveMember(member.userId, member.userName)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <UserMinus className="mr-2 h-4 w-4" />
                                      팀에서 내보내기
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <div className="h-8 w-8" />
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
