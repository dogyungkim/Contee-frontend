'use client'

import Link from 'next/link'
import { Plus, Calendar, Music, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { useContis, useDeleteConti } from '../hooks/use-conti'
import { useTeam } from '@/context/team-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { mutate: deleteContiMutate } = useDeleteConti()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        콘티 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  if (contis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contis.map((conti) => (
        <Card key={conti.id} className="group relative overflow-hidden transition-all hover:border-primary/50">
          <Link href={`/dashboard/contis/${conti.id}`} className="absolute inset-0 z-0">
            <span className="sr-only">상세 보기</span>
          </Link>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="line-clamp-1">{conti.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(conti.serviceDate), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })}
                </CardDescription>
              </div>
              <div className="z-10">
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
                        if (confirm('정말로 이 콘티를 삭제하시겠습니까?')) {
                          deleteContiMutate(conti.id)
                        }
                      }}
                    >
                      지우기
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {conti.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {conti.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
