import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { LayoutList } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Conti } from '@/types/conti'
import { ContiShareMenu, type ContiShareMenuProps } from './conti-share-menu'

interface ContiReadHeaderProps {
  conti: Conti
  songCount: number
  canEdit: boolean
  isMembersLoading: boolean
  shareMenuProps: ContiShareMenuProps
  onStartEdit: () => void
}

export function ContiReadHeader({
  conti,
  songCount,
  canEdit,
  isMembersLoading,
  shareMenuProps,
  onStartEdit,
}: ContiReadHeaderProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] rounded-xl border bg-background px-6 py-4 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <LayoutList className="h-3 w-3" />
            Service Continuity
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">{conti.title}</h2>
            {conti.externalShare?.enabled && (
              <Badge variant="outline" className="border-neutral-300 bg-neutral-50 text-neutral-700">
                외부 공유 중
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-semibold text-primary/80">
              {format(new Date(conti.worshipDate), 'yyyy. MM. dd (EEE)', { locale: ko })}
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span>{conti.worshipTime}</span>
            <Separator orientation="vertical" className="h-3" />
            <span className="flex items-center gap-1">
              총 <span className="font-bold text-foreground">{songCount}</span>곡
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMembersLoading && (
            <Button variant="outline" size="sm" className="h-9" disabled>
              권한 확인 중
            </Button>
          )}
          {canEdit && !isMembersLoading && (
            <Button variant="outline" size="sm" className="h-9" onClick={onStartEdit}>
              수정
            </Button>
          )}
          <ContiShareMenu {...shareMenuProps} />
        </div>
      </div>
    </div>
  )
}
