'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Clock, ListMusic, Search } from 'lucide-react'

import {
  mockActivities,
  mockDashboardSummary,
  mockRecentContis,
  mockSongs,
} from '@/lib/mock/mock-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TeamEmptyState } from './team-empty-state'

export function DashboardClient() {
  const [query, setQuery] = useState('')
  
  // TODO: Replace with real team data fetching logic
  const mockHasTeam = false

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return mockSongs.slice(0, 4)
    return mockSongs
      .filter((s) => `${s.title} ${s.artist}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query])

  // Show empty state if user has no teams
  if (!mockHasTeam) {
    return <TeamEmptyState />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="grid gap-6 lg:col-span-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">다가오는 예배</CardTitle>
              <CardDescription>{mockDashboardSummary.nextServiceLabel}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{mockDashboardSummary.nextServiceDateLabel}</span>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/contis">콘티 보기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">이번 주 요약</CardTitle>
              <CardDescription>진행 현황을 빠르게 확인하세요</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">이번 주 콘티</div>
                <div className="mt-1 text-xl font-semibold">
                  {mockDashboardSummary.thisWeekContiCount}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">등록된 곡</div>
                <div className="mt-1 text-xl font-semibold">
                  {mockDashboardSummary.totalSongCount}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">최근 콘티</CardTitle>
                <CardDescription>최근 작업한 콘티를 바로 열어보세요</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/contis">전체 보기</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {mockRecentContis.map((conti) => (
              <div
                key={conti.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{conti.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {conti.dateLabel} · {conti.songCount}곡
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/contis">열기</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">곡 빠른 검색</CardTitle>
                <CardDescription>곡명/아티스트로 빠르게 찾기</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
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
              {filteredSongs.map((song) => (
                <div key={song.id} className="rounded-md border p-3">
                  <div className="text-sm font-medium">{song.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {song.artist}
                    {song.defaultKey ? ` · Key ${song.defaultKey}` : ''}
                    {typeof song.bpm === 'number' ? ` · ${song.bpm}bpm` : ''}
                  </div>
                  <div className="mt-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/songs">자세히</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">빠른 작업</CardTitle>
            <CardDescription>자주 쓰는 기능으로 바로 이동</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="justify-start" variant="outline">
              <Link href="/dashboard/contis">
                <ListMusic className="mr-2 h-4 w-4" />
                콘티 만들기/관리
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href="/dashboard/songs">
                <Search className="mr-2 h-4 w-4" />
                곡 검색/추가
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 활동</CardTitle>
            <CardDescription>최근 상태를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {mockActivities.map((a) => (
              <div key={a.id} className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">{a.timeLabel}</div>
                <div className="mt-1 text-sm">{a.message}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

