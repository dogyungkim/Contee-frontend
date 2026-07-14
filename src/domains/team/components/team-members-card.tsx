/* eslint-disable @next/next/no-img-element */
'use client'

import { MoreVertical, Search, Shield, UserMinus, Users } from 'lucide-react'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  canManageTeamMember,
  MEMBER_ROLE_FILTERS,
  type MemberRoleFilter,
} from '@/domains/team/utils/team-member-filters'
import type { TeamMember, TeamRole } from '@/types/team'

type MemberAction = (userId: string, userName: string) => void | Promise<void>
type MemberRoleAction = (userId: string, role: TeamRole, userName: string) => void | Promise<void>

interface TeamMembersCardProps {
  members: TeamMember[]
  filteredMembers: TeamMember[]
  isLoading: boolean
  search: string
  roleFilter: MemberRoleFilter
  canManageMembers: boolean
  hasManageableMembers: boolean
  currentUserId?: string
  getRoleLabel: (role: TeamRole) => string
  getRoleBadgeVariant: (role: TeamRole) => BadgeProps['variant']
  onSearchChange: (search: string) => void
  onRoleFilterChange: (filter: MemberRoleFilter) => void
  onChangeRole: MemberRoleAction
  onRemoveMember: MemberAction
}

export function TeamMembersCard({
  members,
  filteredMembers,
  isLoading,
  search,
  roleFilter,
  canManageMembers,
  hasManageableMembers,
  currentUserId,
  getRoleLabel,
  getRoleBadgeVariant,
  onSearchChange,
  onRoleFilterChange,
  onChangeRole,
  onRemoveMember,
}: TeamMembersCardProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="border-b border-border px-4 pb-3 sm:px-5 lg:px-6 lg:pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="type-card-title">팀 멤버</CardTitle>
            <CardDescription>{members.length}명의 멤버가 있습니다.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <MembersLoadingState />
        ) : members.length === 0 ? (
          <MembersEmptyState />
        ) : (
          <>
            <MemberFilters
              search={search}
              roleFilter={roleFilter}
              visibleCount={filteredMembers.length}
              onSearchChange={onSearchChange}
              onRoleFilterChange={onRoleFilterChange}
            />
            <MemberTableHeader hasManageableMembers={hasManageableMembers} />
            {filteredMembers.length === 0 ? (
              <MemberSearchEmptyState />
            ) : (
              <div className="divide-y divide-border lg:max-h-[520px] lg:overflow-y-auto">
                {filteredMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    currentUserId={currentUserId}
                    canManageMembers={canManageMembers}
                    hasManageableMembers={hasManageableMembers}
                    getRoleLabel={getRoleLabel}
                    getRoleBadgeVariant={getRoleBadgeVariant}
                    onChangeRole={onChangeRole}
                    onRemoveMember={onRemoveMember}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function MembersLoadingState() {
  return (
    <div className="space-y-3 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-16" />
      ))}
    </div>
  )
}

function MembersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="type-card-title mb-1">멤버가 없습니다</h3>
      <p className="type-body-sm mb-4 text-muted-foreground">
        초대 코드를 공유하여 팀원을 초대하세요.
      </p>
    </div>
  )
}

interface MemberFiltersProps {
  search: string
  roleFilter: MemberRoleFilter
  visibleCount: number
  onSearchChange: (search: string) => void
  onRoleFilterChange: (filter: MemberRoleFilter) => void
}

function MemberFilters({
  search,
  roleFilter,
  visibleCount,
  onSearchChange,
  onRoleFilterChange,
}: MemberFiltersProps) {
  return (
    <div className="grid gap-3 border-b border-border px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:px-6">
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="이름 또는 이메일 검색"
          aria-label="팀 멤버 검색"
          className="pl-9"
        />
      </div>
      <Select
        value={roleFilter}
        onValueChange={(value) => onRoleFilterChange(value as MemberRoleFilter)}
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
        {visibleCount}명 표시 중
      </div>
    </div>
  )
}

function MemberTableHeader({ hasManageableMembers }: { hasManageableMembers: boolean }) {
  return (
    <div
      className={cn(
        'grid items-center gap-2 border-b border-border px-4 py-2 text-caption-upper text-muted-foreground sm:px-5 lg:gap-4 lg:px-6 lg:py-3',
        getMemberGridColumns(hasManageableMembers),
      )}
    >
      <div>Member</div>
      <div className="text-right lg:text-left">Role</div>
      {hasManageableMembers && <div className="text-right">Menu</div>}
    </div>
  )
}

function MemberSearchEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="type-card-title mb-1">검색 결과가 없습니다</h3>
      <p className="type-body-sm text-muted-foreground">
        검색어 또는 역할 필터를 변경해보세요.
      </p>
    </div>
  )
}

interface MemberRowProps
  extends Pick<
    TeamMembersCardProps,
    | 'canManageMembers'
    | 'currentUserId'
    | 'getRoleLabel'
    | 'getRoleBadgeVariant'
    | 'hasManageableMembers'
    | 'onChangeRole'
    | 'onRemoveMember'
  > {
  member: TeamMember
}

function MemberRow({
  member,
  currentUserId,
  canManageMembers,
  hasManageableMembers,
  getRoleLabel,
  getRoleBadgeVariant,
  onChangeRole,
  onRemoveMember,
}: MemberRowProps) {
  const isCurrentUser = member.userId === currentUserId
  const canManageMember = canManageMembers && canManageTeamMember(member, currentUserId)

  return (
    <div
      className={cn(
        'grid items-center gap-x-2 gap-y-1 px-4 py-3 transition-colors hover:bg-[#fafafa] sm:px-5 lg:gap-x-4 lg:px-6 lg:py-4',
        getMemberGridColumns(hasManageableMembers),
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <MemberAvatar member={member} />
        <div className="min-w-0">
          <p className="truncate font-medium">
            {member.userName}
            {isCurrentUser && <span className="type-label ml-2 text-muted-foreground">(나)</span>}
          </p>
          <p className="type-body-sm truncate text-muted-foreground">{member.userEmail}</p>
        </div>
      </div>

      <div className="flex items-center justify-end lg:justify-start">
        <Badge
          variant={getRoleBadgeVariant(member.role)}
          className="type-badge rounded-md border px-2 py-0.5 lg:px-2.5 lg:py-1"
        >
          {getRoleLabel(member.role)}
        </Badge>
      </div>

      {hasManageableMembers && (
        <div className="flex justify-end">
          {canManageMember ? (
            <MemberActionsMenu
              member={member}
              onChangeRole={onChangeRole}
              onRemoveMember={onRemoveMember}
            />
          ) : (
            <div className="h-8 w-8" />
          )}
        </div>
      )}
    </div>
  )
}

function getMemberGridColumns(hasManageableMembers: boolean) {
  return hasManageableMembers
    ? 'grid-cols-[minmax(0,1fr)_76px_32px] sm:grid-cols-[minmax(0,1fr)_88px_36px] lg:grid-cols-[minmax(0,1.6fr)_120px_56px]'
    : 'grid-cols-[minmax(0,1fr)_76px] sm:grid-cols-[minmax(0,1fr)_88px] lg:grid-cols-[minmax(0,1.6fr)_120px]'
}

function MemberAvatar({ member }: { member: TeamMember }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
      {member.userProfileImageUrl ? (
        <img
          src={member.userProfileImageUrl}
          alt={member.userName}
          className="h-10 w-10 rounded-full"
        />
      ) : (
        <span className="type-label">{member.userName.charAt(0).toUpperCase()}</span>
      )}
    </div>
  )
}

interface MemberActionsMenuProps {
  member: TeamMember
  onChangeRole: MemberRoleAction
  onRemoveMember: MemberAction
}

function MemberActionsMenu({ member, onChangeRole, onRemoveMember }: MemberActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-md lg:size-10 lg:rounded-lg"
          aria-label={`${member.userName} 멤버 관리`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>멤버 관리</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => { void onChangeRole(member.userId, 'ADMIN', member.userName) }}
          disabled={member.role === 'ADMIN'}
        >
          <Shield className="mr-2 h-4 w-4" />
          관리자로 변경
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => { void onChangeRole(member.userId, 'MEMBER', member.userName) }}
          disabled={member.role === 'MEMBER'}
        >
          <Shield className="mr-2 h-4 w-4" />
          멤버로 변경
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => { void onRemoveMember(member.userId, member.userName) }}
          className="text-destructive focus:text-destructive"
        >
          <UserMinus className="mr-2 h-4 w-4" />
          팀에서 내보내기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
