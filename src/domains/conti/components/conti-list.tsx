'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Music, Search, X } from 'lucide-react'

import { useContis } from '../hooks/use-conti'
import { useContiActions } from '../hooks/use-conti-actions'
import { ContiListItem } from './conti-list-item'
import { useTeam } from '@/context/team-context'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import { canEditTeamContent } from '@/domains/team/utils/team-permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ContiList() {
  const { selectedTeamId } = useTeam()
  const { user } = useAuth()
  const { data: teamMembers = [] } = useTeamMembersQuery(selectedTeamId || '')
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const searchParams = useMemo(
    () => ({
      page: 0,
      size: 100,
      q: query.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [query, from, to]
  )
  const { data, isLoading, isError } = useContis(selectedTeamId, searchParams)
  const contis = data?.content ?? []
  const totalElements = data?.totalElements ?? contis.length
  const { handleDeleteConti } = useContiActions()
  const hasFilters = !!query.trim() || !!from || !!to
  const currentMember = teamMembers.find((member) => member.userId === String(user?.id))
  const canEdit = canEditTeamContent(currentMember?.role)

  if (isLoading) {
    return (
      <div className="surface-card overflow-hidden rounded-2xl">
        <div className="border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid gap-3 px-6 py-4 md:grid-cols-[1.8fr_1fr_100px_56px] md:items-center">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="surface-card flex h-40 items-center justify-center rounded-2xl text-sm text-muted-foreground">
        콘티 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  const filterControls = (
    <div className="grid gap-3 border-b border-border bg-white px-4 py-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_160px_160px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="콘티명으로 검색"
          className="pl-9"
          aria-label="콘티명 검색"
        />
      </div>
      <Input
        type="date"
        value={from}
        onChange={(event) => setFrom(event.target.value)}
        aria-label="시작 예배일"
      />
      <Input
        type="date"
        value={to}
        onChange={(event) => setTo(event.target.value)}
        aria-label="종료 예배일"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setQuery('')
          setFrom('')
          setTo('')
        }}
        disabled={!hasFilters}
        className="gap-2"
      >
        <X className="h-4 w-4" />
        초기화
      </Button>
    </div>
  )

  if (contis.length === 0 && !hasFilters) {
    return (
      <div className="surface-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent">
          <Music className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">생성된 콘티가 없습니다</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          첫 번째 예배 콘티를 작성해보세요.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/contis/new">
            <Plus className="mr-2 h-4 w-4" />
            새 콘티 만들기
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl py-1">
      <CardHeader className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">예배 콘티</CardTitle>
            <CardDescription className="mt-1">
              총 {totalElements}개의 콘티가 등록되어 있습니다.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {filterControls}
        {contis.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium text-foreground">조건에 맞는 콘티가 없습니다.</p>
            <p className="text-xs text-muted-foreground">검색어 또는 예배일 범위를 조정해보세요.</p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,1.8fr)_160px_56px_56px] items-center gap-2 border-b border-border px-6 py-3 text-caption-upper text-muted-foreground md:grid">
              <div>Conti</div>
              <div>Worship date</div>
              <div>Songs</div>
              <div className="text-right">{canEdit ? 'Menu' : null}</div>
            </div>

            <div className="divide-y divide-border">
              {contis.map((conti) => (
                <ContiListItem
                  key={conti.id}
                  conti={conti}
                  canEdit={canEdit}
                  onDelete={handleDeleteConti}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
