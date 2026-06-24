'use client'

import Link from 'next/link'
import { Plus, Calendar, Music, MoreVertical, FileText, Share2, UserRound } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { Conti } from '@/types/conti'
import { useContis } from '../hooks/use-conti'
import { useContiActions } from '../hooks/use-conti-actions'
import { useTeam } from '@/context/team-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

export function ContiList() {
  const { selectedTeamId } = useTeam()
  const { data: contis = [], isLoading, isError } = useContis(selectedTeamId)
  const { handleDeleteConti } = useContiActions()

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

  if (contis.length === 0) {
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
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">예배 콘티</CardTitle>
            <CardDescription className="mt-1">
              총 {contis.length}개의 콘티가 등록되어 있습니다.
            </CardDescription>
          </div>
          <div className="hidden rounded-md bg-accent px-3 py-2 text-caption-upper text-muted-foreground sm:block">
            List view
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <div className="hidden grid-cols-[minmax(0,1.8fr)_180px_110px_100px_56px] items-center gap-4 border-b border-border px-6 py-3 text-caption-upper text-muted-foreground md:grid">
          <div>Conti</div>
          <div>Worship date</div>
          <div>Share</div>
          <div>Songs</div>
          <div className="text-right">Menu</div>
        </div>

        <div className="divide-y divide-border">
          {contis.map((conti: Conti) => (
            <div
              key={conti.id}
              className="group relative grid cursor-pointer gap-4 px-6 py-4 transition-colors hover:bg-[#fafafa] md:grid-cols-[minmax(0,1.8fr)_180px_110px_100px_56px] md:items-center"
            >
              <Link
                href={`/dashboard/contis/${conti.id}`}
                className="absolute inset-0 z-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                aria-label={`${conti.title} 콘티 상세 보기`}
              />

              <div className="pointer-events-none relative z-10 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-accent text-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{conti.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(conti.worshipDate), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })}
                    </div>
                    {conti.memo ? (
                      <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{conti.memo}</p>
                    ) : null}
                    {conti.songPreview && conti.songPreview.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {conti.songPreview.slice(0, 3).map((title) => (
                          <span
                            key={title}
                            className="rounded-md border border-border bg-[#fafafa] px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {conti.createdByName ? (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <UserRound className="h-3 w-3" />
                        {conti.createdByName}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="pointer-events-none relative z-10 hidden text-sm text-foreground md:block">
                {format(new Date(conti.worshipDate), 'yyyy.MM.dd', { locale: ko })}
              </div>

              <div className="pointer-events-none relative z-10">
                {conti.externalShareEnabled ? (
                  <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700">
                    <Share2 className="h-3 w-3" />
                    외부
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">팀 전용</span>
                )}
              </div>

              <div className="pointer-events-none relative z-10">
                <div className="inline-flex rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-foreground">
                  {conti.songCount ?? 0}곡
                </div>
              </div>

              <div className="relative z-10 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/contis/${conti.id}`}>편집</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        void handleDeleteConti(conti.id)
                      }}
                    >
                      지우기
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
