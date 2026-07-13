'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Clock, ListMusic, Search, ChevronRight, Layers3 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { useDashboard } from '@/domains/dashboard/hooks/use-dashboard'
import { DashboardHeader } from './dashboard-header'
import { TeamEmptyState } from './team-empty-state'
import { DashboardSkeleton } from './dashboard-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function DashboardContent() {
  const [query, setQuery] = useState('')
  const { hasTeam, summary, recentContis, songs, activities, isLoading, isError } = useDashboard()

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return songs.slice(0, 4)
    return songs
      .filter((s) => `${s.title} ${s.artist}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, songs])

  if (!hasTeam) {
    return <TeamEmptyState />
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-destructive">데이터를 불러오는 중 오류가 발생했습니다.</div>
          <div className="type-body-sm mt-2 text-muted-foreground">잠시 후 다시 시도해주세요.</div>
        </div>
      </div>
    )
  }

  const hasSongQuery = query.trim().length > 0
  const hasUpcomingService =
    summary.nextServiceLabel.trim().length > 0 || summary.nextServiceDateLabel.trim().length > 0

  return (
    <>
      <DashboardHeader />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid gap-6 lg:col-span-8">
          <div className="surface-card overflow-hidden rounded-xl p-4 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="text-caption-upper text-muted-foreground">This week</div>
                <div className="type-page-title mt-3">
                  팀의 최근 준비 흐름을
                  <br className="hidden sm:block" />
                  한 화면에서 확인하세요.
                </div>
                <p className="type-page-description mt-3 max-w-xl">
                  콘티 작성, 곡 확인, 공유 상태를 하나의 작업 표면 안에서 관리할 수 있습니다.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:w-[320px] sm:shrink-0">
                <div className="rounded-xl border border-border bg p-4">
                  <div className="text-caption-upper text-muted-foreground">Contis</div>
                  <div className="type-kpi mt-2">{summary.thisWeekContiCount}</div>
                </div>
                <div className="rounded-xl border border-border bg p-4">
                  <div className="text-caption-upper text-muted-foreground">Songs</div>
                  <div className="type-kpi mt-2">{summary.totalSongCount}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle>다가오는 예배</CardTitle>
                <CardDescription>
                  {hasUpcomingService ? summary.nextServiceLabel : '등록된 예배 일정이 없습니다'}
                </CardDescription>
              </CardHeader>
              {hasUpcomingService ? (
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="type-body-sm flex min-w-0 items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="truncate">{summary.nextServiceDateLabel}</span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                    <Link href="/dashboard/contis">콘티 보기</Link>
                  </Button>
                </CardContent>
              ) : (
                <CardContent>
                  <div className="type-body-sm rounded-md border border-dashed p-3 text-muted-foreground">
                    아직 다가오는 예배가 설정되지 않았습니다. 새 콘티를 만들면 여기서 바로 확인할 수 있어요.
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle>이번 주 요약</CardTitle>
                <CardDescription>진행 현황을 빠르게 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-4">
                  <div className="text-caption-upper text-muted-foreground">이번 주 콘티</div>
                  <div className="type-kpi mt-1">{summary.thisWeekContiCount}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-caption-upper text-muted-foreground">등록된 곡</div>
                  <div className="type-kpi mt-1">{summary.totalSongCount}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle>최근 콘티</CardTitle>
                  <CardDescription>최근 작업한 콘티를 바로 열어보세요</CardDescription>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link href="/dashboard/contis">전체 보기</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {recentContis.length === 0 ? (
                <div className="type-body-sm rounded-md border border-dashed p-4 text-muted-foreground">
                  최근 콘티가 아직 없습니다. 새 콘티를 만들어보세요.
                </div>
              ) : (
                recentContis.map((conti) => (
                  <div key={conti.id} className="group grid gap-3 rounded-xl border p-4 transition-colors hover:bg-[#f3f3f3] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="type-body-sm truncate font-medium">{conti.title}</div>
                      <div className="type-badge mt-1 text-muted-foreground">
                        {format(new Date(conti.worshipDate), 'yyyy. M. d', { locale: ko })} ·{' '}
                        {conti.songCount}곡
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                      <Link href={`/dashboard/contis/${conti.id}`}>
                        열기
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <CardTitle>곡 빠른 검색</CardTitle>
                  <CardDescription>곡명/아티스트로 빠르게 찾기</CardDescription>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link href="/dashboard/songs">곡 관리</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="예) 주의 은혜라, 마커스"
                  className="pl-9"
                  aria-label="곡 검색"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {filteredSongs.length === 0 ? (
                  <div className="type-body-sm rounded-md border border-dashed p-4 text-muted-foreground sm:col-span-2">
                    {hasSongQuery
                      ? '검색 결과가 없습니다. 다른 키워드로 다시 시도해보세요.'
                      : '등록된 곡이 없습니다. 곡 라이브러리에서 곡을 추가해보세요.'}
                  </div>
                ) : (
                  filteredSongs.map((song) => (
                    <div key={song.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="type-body-sm min-w-0 break-words font-medium">{song.title}</div>
                        <div className="type-badge shrink-0 rounded-md bg-white px-2 py-1 text-foreground">
                          <Layers3 className="mr-1 inline h-3 w-3" />
                          {song.keySignature || '-'}
                        </div>
                      </div>
                      <div className="type-badge mt-1 break-words text-muted-foreground">
                        {song.artist}
                        {typeof song.bpm === 'number' ? ` · ${song.bpm}bpm` : ''}
                      </div>
                      <div className="mt-3">
                        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                          <Link href="/dashboard/songs">자세히</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:col-span-4">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
              <CardDescription>자주 쓰는 기능으로 바로 이동</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild className="justify-start" variant="outline">
                <Link href="/dashboard/contis/new">
                  <ListMusic className="mr-2 h-4 w-4" />
                  새 콘티 작성
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/dashboard/contis">
                  <ListMusic className="mr-2 h-4 w-4" />
                  콘티 목록 관리
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/dashboard/songs">
                  <Search className="mr-2 h-4 w-4" />
                  곡 라이브러리
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>최근 상태를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {activities.length === 0 ? (
                <div className="type-body-sm rounded-md border border-dashed p-4 text-muted-foreground">
                  최근 활동이 없습니다.
                </div>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="rounded-xl border p-4">
                    <div className="type-badge text-muted-foreground">{a.timeLabel}</div>
                    <div className="type-body-sm mt-1">{a.message}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
