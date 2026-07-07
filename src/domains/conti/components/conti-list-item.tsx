'use client'

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Calendar, FileText, MoreVertical, Share2, UserRound } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Conti } from '@/types/conti'

interface ContiListItemProps {
  conti: Conti
  canEdit: boolean
  onDelete: (contiId: Conti['id']) => void | Promise<void>
}

export function ContiListItem({ conti, canEdit, onDelete }: ContiListItemProps) {
  return (
    <div className="group relative grid cursor-pointer gap-2 px-6 py-4 transition-colors hover:bg-[#fafafa] md:grid-cols-[minmax(0,1.8fr)_160px_56px_56px] md:items-center">
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
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="truncate text-sm font-medium text-foreground">{conti.title}</div>
              <Badge
                variant="outline"
                className={
                  conti.status === 'DRAFT'
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-blue-200 bg-blue-50 text-blue-700'
                }
              >
                {conti.status === 'DRAFT' ? '작성 중' : '팀 공개됨'}
              </Badge>
              {conti.externalShareEnabled && (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  <Share2 className="h-3 w-3" />
                  외부 공유 중
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(conti.worshipDate), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })} ·{' '}
              {conti.worshipTime}
            </div>
            {conti.memo ? (
              <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{conti.memo}</p>
            ) : null}
            {conti.songPreview && conti.songPreview.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {conti.songPreview.map((title, index) => (
                  <span
                    key={`${title}-${index}`}
                    className="rounded-md border border-border bg-[#fafafa] px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {index + 1}. {title}
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
        <div>{format(new Date(conti.worshipDate), 'yyyy.MM.dd', { locale: ko })}</div>
        <div className="mt-1 text-xs text-muted-foreground">{conti.worshipTime}</div>
      </div>

      <div className="pointer-events-none relative z-10">
        <div className="inline-flex rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-foreground">
          {conti.songCount ?? 0}곡
        </div>
      </div>

      <div className="relative z-10 flex justify-end">
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/contis/${conti.id}?mode=edit`}>편집</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  void onDelete(conti.id)
                }}
              >
                지우기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
