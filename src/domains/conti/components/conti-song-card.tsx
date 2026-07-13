'use client'

import type { ReactNode } from 'react'
import { FileText, Youtube } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { SongFormPart } from '@/types/song'
import { getSectionStyle, getSongFormSummary } from '@/domains/song/utils/song-form'
import { openSheetMusic } from '@/domains/conti/utils/sheet-music'
import { toast } from '@/lib/toast'

interface ContiSongCardProps {
  index: number
  title: string
  artist?: string
  keySignature?: string
  bpm?: number
  originalKey?: string
  originalBpm?: number
  note?: string
  teamNote?: string
  songForm?: SongFormPart[]
  youtubeUrl?: string
  sheetMusicUrl?: string
  badge?: ReactNode
  dragHandle?: ReactNode
  headerAction?: ReactNode
  children?: ReactNode
  isDragging?: boolean
  showIndex?: boolean
  highlightKey?: boolean
  highlightBpm?: boolean
  showOriginalMeta?: boolean
  showBodyMeta?: boolean
}

export function ContiSongCard({
  index,
  title,
  artist,
  keySignature,
  bpm,
  originalKey,
  originalBpm,
  note,
  teamNote,
  songForm = [],
  youtubeUrl,
  sheetMusicUrl,
  badge,
  dragHandle,
  headerAction,
  children,
  isDragging = false,
  showIndex = true,
  highlightKey = false,
  highlightBpm = false,
  showOriginalMeta = false,
  showBodyMeta = true,
}: ContiSongCardProps) {
  const groupedFlow = getSongFormSummary(songForm)
  const metaCards = [
    {
      label: 'Key',
      value: keySignature || '-',
      emphasized: highlightKey,
    },
    {
      label: 'BPM',
      value: bpm || '-',
      emphasized: highlightBpm,
    },
    ...(showOriginalMeta
      ? [
        { label: '기본 Key', value: originalKey || '-' },
        { label: '기본 BPM', value: originalBpm || '-' },
      ]
      : []),
  ]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-white transition-all',
        'border-neutral-200 shadow-sm hover:border-neutral-300',
        isDragging && 'border-primary shadow-xl'
      )}
    >
      <div className="grid gap-3 border-b border-neutral-100 bg-neutral-50/50 px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-4">
        <div className="flex items-center gap-2">
          {dragHandle}
          <span className="type-label flex h-6 w-6 items-center justify-center rounded bg-neutral-200 text-neutral-600">
            {index + 1}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="type-emphasis min-w-0 break-words sm:truncate">{title}</h4>
            {badge}
          </div>
          {artist && <div className="type-body-sm mt-1 break-words text-neutral-500">{artist}</div>}
        </div>

        {headerAction ? <div className="justify-self-end sm:shrink-0">{headerAction}</div> : null}
      </div>

      <div className="space-y-4 bg-white px-3 py-4 sm:px-4">
        {children ? (
          children
        ) : (
          <>
            {showBodyMeta && (
              <div className={cn('grid gap-3', showOriginalMeta ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2')}>
                {metaCards.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      'rounded-lg border bg-muted/20 px-3 py-2',
                      item.emphasized && 'border-amber-200 bg-amber-50/70'
                    )}
                  >
                    <p className="type-label uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className={cn('type-emphasis mt-1 text-foreground', item.emphasized && 'text-amber-700')}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {note && (
              <div className="space-y-2">
                <Label className="type-label uppercase tracking-wider text-muted-foreground">콘티 메모</Label>
                <div className="type-body-sm whitespace-pre-wrap rounded-lg border bg-muted/20 px-3 py-3 text-foreground">
                  {note}
                </div>
              </div>
            )}
          </>
        )}

        {!children && (groupedFlow.length > 0 || teamNote) && (
          <div className="space-y-2">
            <Label className="type-label uppercase tracking-wider text-muted-foreground">
              {groupedFlow.length > 0 ? '곡 구성' : '팀 메모'}
            </Label>
            <div className="rounded-md border bg-muted/30 p-3">
              {groupedFlow.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {groupedFlow.map((group, groupIndex) => {
                    const style = getSectionStyle(group.type as SongFormPart['type'])

                    return (
                      <div key={`${group.abbr}-${groupIndex}`} className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            'type-badge whitespace-nowrap rounded border px-2 py-1 shadow-sm',
                            style.bg,
                            style.border,
                            style.type === 'Verse' && 'text-blue-700',
                            style.type === 'Pre-chorus' && 'text-pink-700',
                            style.type === 'Chorus' && 'text-purple-700',
                            style.type === 'Bridge' && 'text-amber-700',
                            style.type === 'Instrumental' && 'text-emerald-700',
                            style.type === 'Interlude' && 'text-cyan-700',
                            style.type === 'Tag' && 'text-rose-700',
                            (style.type === 'Intro' || style.type === 'Outro') && 'text-slate-700'
                          )}
                        >
                          {group.abbr}
                          {group.showBars && <span className="type-badge ml-1 font-normal opacity-70">({group.bars})</span>}
                          {group.count > 1 && <span className="type-badge ml-1 rounded bg-black/10 px-1 opacity-70">x{group.count}</span>}
                        </div>
                        {groupIndex < groupedFlow.length - 1 && <span className="type-badge text-slate-300">→</span>}
                      </div>
                    )
                  })}
                </div>
              )}

              {teamNote && (
                <div className={cn('type-body-sm text-muted-foreground whitespace-pre-wrap', groupedFlow.length > 0 && 'mt-3')}>
                  {teamNote}
                </div>
              )}
            </div>
          </div>
        )}

        {!children && (
          <div className="space-y-2">
            <Label className="type-label uppercase tracking-wider text-muted-foreground">빠른 링크</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="secondary"
                disabled={!sheetMusicUrl}
                className="h-9 gap-2"
                onClick={() => {
                  if (!sheetMusicUrl) return
                  void openSheetMusic(sheetMusicUrl).catch(() => {
                    toast.error('악보를 불러오지 못했습니다.')
                  })
                }}
              >
                <FileText className="h-4 w-4" /> 악보 보기
              </Button>
              <Button variant="secondary" disabled={!youtubeUrl} className="h-9 gap-2" asChild={!!youtubeUrl}>
                {youtubeUrl ? (
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4 text-red-500" /> 유튜브
                  </a>
                ) : (
                  <>
                    <Youtube className="h-4 w-4" /> 유튜브
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
