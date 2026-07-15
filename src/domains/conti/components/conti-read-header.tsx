import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { LayoutList, Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Conti } from '@/types/conti'
import { ContiExternalShareBadge, ContiStatusBadge } from './conti-badges'
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
    <div className="mx-auto w-full max-w-[1200px] rounded-xl border bg-background px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="type-badge flex flex-wrap items-center gap-2 uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-2">
              <LayoutList className="h-3 w-3" />
              Service Continuity
            </span>
            <div className="flex flex-wrap items-center gap-1 sm:border-l sm:border-border/70 sm:pl-2">
              <ContiStatusBadge
                status={conti.status}
                className="type-badge h-5 px-1.5 py-0 leading-none tracking-normal"
              />
              {conti.externalShare?.enabled && (
                <ContiExternalShareBadge
                  showIcon={false}
                  className="type-badge h-5 gap-1 px-1.5 py-0 leading-none tracking-normal"
                />
              )}
            </div>
          </div>

          <div>
            <h2 className="type-section-title break-words">{conti.title}</h2>
          </div>
          <div className="type-body-sm flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
            <span className="font-semibold text-primary/80">
              {format(new Date(conti.worshipDate), 'yyyy. MM. dd (EEE)', { locale: ko })}
            </span>
            <Separator orientation="vertical" className="hidden h-3 sm:block" />
            <span>{conti.worshipTime}</span>
            <Separator orientation="vertical" className="hidden h-3 sm:block" />
            <span className="flex items-center gap-1">
              총 <span className="font-bold text-foreground">{songCount}</span>곡
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:items-end">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
            {isMembersLoading && (
              <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto" disabled>
                권한 확인 중
              </Button>
            )}
            <ContiExportMenu
              {...exportMenuProps}
              sheetMusicCount={sheetMusicCount}
              isPdfDownloading={isPdfDownloading}
              onDownloadPdf={onDownloadPdf}
            />
            {conti.status === 'PUBLISHED' && <ContiShareMenu {...shareMenuProps} />}
            {canEdit && !isMembersLoading && (
              <Button
                variant="outline"
                size="sm"
                className="col-span-2 h-9 w-full sm:col-span-1 sm:w-auto"
                onClick={onStartEdit}
              >
                수정
              </Button>
            )}

            {canPublish && !isMembersLoading && (
              <Button
                size="sm"
                className="col-span-2 h-9 w-full gap-2 sm:col-span-1 sm:w-auto"
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
