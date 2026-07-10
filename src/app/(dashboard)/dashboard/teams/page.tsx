'use client'

import Link from 'next/link'
import { Plus, Users, Copy, Check, MoreVertical, UserMinus, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTeam } from '@/context/team-context'
import { useTeamMembersQuery, useTeamQuery } from '@/domains/team/hooks/use-team-query'
import { useTeamMemberActions } from '@/domains/team/hooks/use-team-member-actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/domains/auth/hooks/use-auth'

export default function TeamsPage() {
  const { selectedTeam: summaryTeam, selectedTeamId } = useTeam()
  const { data: teamDetail } = useTeamQuery(selectedTeamId || '')
  const selectedTeam = teamDetail || summaryTeam
  const { user } = useAuth()
  const { data: members = [], isLoading: isMembersLoading } = useTeamMembersQuery(selectedTeamId || '')
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
  const hasManageableMembers = members.some(
    (member) =>
      canManageMembers &&
      member.userId !== String(user?.id) &&
      member.role !== 'OWNER',
  )

  if (!selectedTeam) {
    return (
      <div className="mx-auto max-w-6xl">
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">팀이 없습니다</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              새로운 팀을 만들어 팀원들과 함께 작업을 시작하세요.
            </p>
            <Button asChild>
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-caption-upper text-muted-foreground">Team settings</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">팀 관리</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedTeam.name} 팀의 정보와 멤버를 관리하세요.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit rounded-2xl">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg">팀 정보</CardTitle>
            <CardDescription>현재 선택된 팀의 기본 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="text-caption-upper text-muted-foreground">Team name</div>
              <p className="mt-2 text-lg font-semibold">{selectedTeam.name}</p>
            </div>

            {selectedTeam.description && (
              <div>
                <div className="text-caption-upper text-muted-foreground">Description</div>
                <p className="mt-2 text-sm text-foreground">{selectedTeam.description}</p>
              </div>
            )}

            <div>
              <div className="text-caption-upper text-muted-foreground">Invite code</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-border bg-[#fafafa] p-3">
                  <p className="font-mono text-lg font-semibold tracking-tight">{selectedTeam.shortCode}</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyInviteCode}>
                  {copiedCode ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">이 코드를 공유하여 팀원을 초대하세요.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">팀 멤버</CardTitle>
                <CardDescription>{members.length}명의 멤버가 있습니다.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {isMembersLoading ? (
              <div className="space-y-3 px-6 py-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">멤버가 없습니다</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  초대 코드를 공유하여 팀원을 초대하세요.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    hasManageableMembers
                      ? 'hidden grid-cols-[minmax(0,1.6fr)_120px_56px] items-center gap-4 border-b border-border px-6 py-3 text-caption-upper text-muted-foreground md:grid'
                      : 'hidden grid-cols-[minmax(0,1.6fr)_120px] items-center gap-4 border-b border-border px-6 py-3 text-caption-upper text-muted-foreground md:grid'
                  }
                >
                  <div>Member</div>
                  <div>Role</div>
                  {hasManageableMembers && <div className="text-right">Menu</div>}
                </div>

                <div className="divide-y divide-border">
                {members.map((member) => {
                  const isCurrentUser = member.userId === String(user?.id)
                  const isOwner = member.role === 'OWNER'
                  
                  return (
                    <div
                      key={member.id}
                      className={
                        hasManageableMembers
                          ? 'grid gap-4 px-6 py-4 transition-colors hover:bg-[#fafafa] md:grid-cols-[minmax(0,1.6fr)_120px_56px] md:items-center'
                          : 'grid gap-4 px-6 py-4 transition-colors hover:bg-[#fafafa] md:grid-cols-[minmax(0,1.6fr)_120px] md:items-center'
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          {member.userProfileImageUrl ? (
                            <img
                              src={member.userProfileImageUrl}
                              alt={member.userName}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {member.userName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.userName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-muted-foreground">(나)</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 md:justify-start">
                        <Badge
                          variant={getRoleBadgeVariant(member.role)}
                          className="rounded-md border px-2.5 py-1 text-[11px] font-medium"
                        >
                          {getRoleLabel(member.role)}
                        </Badge>

                        {canManageMembers && !isCurrentUser && !isOwner && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="md:hidden">
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
                        <div className="hidden justify-end md:flex">
                          {canManageMembers && !isCurrentUser && !isOwner ? (
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
