'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Users, Copy, Check, MoreVertical, UserMinus, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTeam } from '@/context/team-context'
import { useTeamMembersQuery, useRemoveTeamMemberMutation, useUpdateTeamMemberRoleMutation, useTeamQuery } from '@/domains/team/hooks/use-team-query'
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
import toast from 'react-hot-toast'

export default function TeamsPage() {
  const { selectedTeam: summaryTeam, selectedTeamId } = useTeam()
  const { data: teamDetail } = useTeamQuery(selectedTeamId || '')
  const selectedTeam = teamDetail || summaryTeam
  const { user } = useAuth()
  const { data: members = [], isLoading: isMembersLoading } = useTeamMembersQuery(selectedTeamId || '')
  const removeTeamMemberMutation = useRemoveTeamMemberMutation()
  const updateTeamMemberRoleMutation = useUpdateTeamMemberRoleMutation()
  
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyInviteCode = async () => {
    if (!selectedTeam?.shortCode) return
    await navigator.clipboard.writeText(selectedTeam.shortCode)
    setCopiedCode(true)
    toast.success('초대 코드가 복사되었습니다')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!selectedTeamId) return
    
    if (!confirm(`${userName}님을 팀에서 내보내시겠습니까?`)) return

    try {
      await removeTeamMemberMutation.mutateAsync({ teamId: selectedTeamId, userId })
      toast.success(`${userName}님이 팀에서 제거되었습니다`)
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '멤버 제거에 실패했습니다'
      toast.error(errorMessage)
      console.error('Remove member error:', error)
    }
  }

  const handleChangeRole = async (userId: string, newRole: string, userName: string) => {
    if (!selectedTeamId) return

    try {
      await updateTeamMemberRoleMutation.mutateAsync({
        teamId: selectedTeamId,
        userId,
        role: { role: newRole as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' }
      })
      toast.success(`${userName}님의 역할이 ${getRoleLabel(newRole)}(으)로 변경되었습니다`)
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '역할 변경에 실패했습니다'
      toast.error(errorMessage)
      console.error('Change role error:', error)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default'
      case 'ADMIN':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return '소유자'
      case 'ADMIN':
        return '관리자'
      case 'MEMBER':
        return '멤버'
      case 'VIEWER':
        return '뷰어'
      default:
        return role
    }
  }

  if (!selectedTeam) {
    return (
      <div className="container max-w-5xl py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">팀이 없습니다</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
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
    <div className="container max-w-5xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">팀 관리</h1>
          <p className="text-sm text-muted-foreground">
            {selectedTeam.name} 팀의 정보와 멤버를 관리하세요.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Team Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>팀 정보</CardTitle>
            <CardDescription>현재 선택된 팀의 기본 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">팀 이름</label>
              <p className="text-lg font-semibold">{selectedTeam.name}</p>
            </div>
            
            {selectedTeam.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">설명</label>
                <p className="text-sm">{selectedTeam.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">초대 코드</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg bg-muted p-3">
                  <p className="font-mono text-lg font-semibold">{selectedTeam.shortCode}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyInviteCode}
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                이 코드를 공유하여 팀원을 초대하세요.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>팀 멤버</CardTitle>
                <CardDescription>
                  {members.length}명의 멤버가 있습니다.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isMembersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">멤버가 없습니다</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  초대 코드를 공유하여 팀원을 초대하세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const isCurrentUser = member.userId === String(user?.id)
                  const isOwner = member.role === 'OWNER'
                  
                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>

                        {!isCurrentUser && !isOwner && (
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
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
