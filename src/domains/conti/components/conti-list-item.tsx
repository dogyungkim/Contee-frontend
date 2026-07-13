'use client'

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Calendar, FileText, MoreVertical, UserRound } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Conti } from '@/types/conti'
import { ContiExternalShareBadge, ContiStatusBadge } from './conti-badges'

interface ContiListItemProps {
  conti: Conti
  canEdit: boolean
  onDelete: (contiId: Conti['id']) => void | Promise<void>
}

const listBadgeClassName = 'type-badge h-5 px-1.5 py-0 leading-none'

export function ContiListItem({ conti, canEdit, onDelete }: ContiListItemProps) {
  return (
    <div className="group relative grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-4 transition-colors hover:bg-[#fafafa] sm:px-6 lg:grid-cols-[minmax(0,1.8fr)_136px_150px_64px_48px] lg:items-center lg:gap-3">
      <Link
        href={`/dashboard/contis/${conti.id}`}
        className="absolute inset-0 z-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-label={`${conti.title} 콘티 상세 보기`}
      />

      <div className="pointer-events-none relative z-10 col-start-1 row-start-1 min-w-0 lg:col-auto lg:row-auto">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-accent text-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="type-body-sm truncate font-medium text-foreground">{conti.title}</div>
              <ContiStatusBadge
                status={conti.status}
                className={`${listBadgeClassName} lg:hidden`}
              />
              {conti.externalShareEnabled && (
                <ContiExternalShareBadge className={`${listBadgeClassName} lg:hidden`} />
              )}
            </div>
            <div className="type-body-sm mt-1 flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(conti.worshipDate), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })} ·{' '}
              {conti.worshipTime}
            </div>
            {conti.memo ? (
              <p className="type-body-sm mt-2 line-clamp-1 text-muted-foreground">{conti.memo}</p>
            ) : null}
            {conti.songPreview && conti.songPreview.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {conti.songPreview.map((title, index) => (
                  <span
                    key={`${title}-${index}`}
                    className="type-badge rounded-md border border-border bg-[#fafafa] px-2 py-0.5 text-muted-foreground"
                  >
                    {index + 1}. {title}
                  </span>
                ))}
              </div>
            ) : null}
            {conti.createdByName ? (
              <div className="type-badge mt-2 flex items-center gap-1.5 text-muted-foreground">
                <UserRound className="h-3 w-3" />
                {conti.createdByName}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 hidden flex-col items-start gap-1.5 lg:flex">
        <ContiStatusBadge status={conti.status} className={listBadgeClassName} />
        {conti.externalShareEnabled && <ContiExternalShareBadge className={listBadgeClassName} />}
      </div>

      <div className="type-body-sm pointer-events-none relative z-10 hidden text-foreground lg:block">
        <div>{format(new Date(conti.worshipDate), 'yyyy.MM.dd', { locale: ko })}</div>
        <div className="type-body-sm mt-1 text-muted-foreground">{conti.worshipTime}</div>
      </div>

      <div className="pointer-events-none relative z-10 col-start-1 row-start-2 lg:col-auto lg:row-auto">
        <div className="type-badge inline-flex rounded-md bg-accent px-2.5 py-1 text-foreground">
          {conti.songCount ?? 0}곡
        </div>
      </div>

      <div className="relative z-10 col-start-2 row-span-2 row-start-1 flex justify-end self-start lg:col-auto lg:row-auto lg:self-center">
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
