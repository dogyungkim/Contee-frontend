import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { LayoutList, Loader2, Send } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Conti } from '@/types/conti'
import { ContiExportMenu, type ContiExportMenuProps } from './conti-export-menu'
import { ContiShareMenu, type ContiShareMenuProps } from './conti-share-menu'

interface ContiReadHeaderProps {
  conti: Conti
  songCount: number
  canEdit: boolean
  canPublish: boolean
  isPublishing: boolean
  isMembersLoading: boolean
  sheetMusicCount: number
  isPdfDownloading: boolean
  shareMenuProps: ContiShareMenuProps
  exportMenuProps: ContiExportMenuProps
  onDownloadPdf: () => void
  onStartEdit: () => void
  onPublish: () => void
}

export function ContiReadHeader({
  conti,
  songCount,
  canEdit,
  canPublish,
  isPublishing,
  isMembersLoading,
  sheetMusicCount,
  isPdfDownloading,
  shareMenuProps,
  exportMenuProps,
  onDownloadPdf,
  onStartEdit,
  onPublish,
}: ContiReadHeaderProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] rounded-xl border bg-background px-6 py-4 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <LayoutList className="h-3 w-3" />
            Service Continuity
            <div className="ml-1 flex flex-wrap items-center gap-1 border-l border-border/70 pl-0">
              <Badge
                variant="outline"
                className={
                  conti.status === 'DRAFT'
                    ? 'h-5 px-1.5 py-0 text-[11px] font-semibold leading-none tracking-normal border-amber-200 bg-amber-50 text-amber-800'
                    : 'h-5 px-1.5 py-0 text-[11px] font-semibold leading-none tracking-normal border-blue-200 bg-blue-50 text-blue-700'
                }
              >
                {conti.status === 'DRAFT' ? '작성 중' : '팀 공개됨'}
              </Badge>
              {conti.externalShare?.enabled && (
                <Badge
                  variant="outline"
                  className="h-5 border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[11px] font-semibold leading-none tracking-normal text-emerald-700"
                >
                  외부 공유 중
                </Badge>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight">{conti.title}</h2>
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

        <div className="flex flex-col gap-4 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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

            <ContiExportMenu
              {...exportMenuProps}
              sheetMusicCount={sheetMusicCount}
              isPdfDownloading={isPdfDownloading}
              onDownloadPdf={onDownloadPdf}
            />
            {conti.status === 'PUBLISHED' && <ContiShareMenu {...shareMenuProps} />}

            {canPublish && !isMembersLoading && (
              <Button
                size="sm"
                className="h-9 gap-2"
                disabled={isPublishing}
                onClick={onPublish}
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isPublishing ? '공개 중' : '팀에 공개'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
