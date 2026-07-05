'use client'

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { LayoutList } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { HOURS, MINUTES, PERIODS } from '@/domains/conti/utils/worship-time'
import { cn } from '@/lib/utils'
import { ContiShareMenu, type ContiShareMenuProps } from './conti-share-menu'

export interface ContiEditHeaderDraft {
  title: string
  date?: Date
  period: string
  hour: string
  minute: string
}

interface ContiEditHeaderProps {
  draft: ContiEditHeaderDraft
  songCount: number
  shareMenuProps: ContiShareMenuProps
  onDraftChange: (patch: Partial<ContiEditHeaderDraft>) => void
}

export function ContiEditHeader({
  draft,
  songCount,
  shareMenuProps,
  onDraftChange,
}: ContiEditHeaderProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] rounded-xl border bg-background px-6 py-4 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <LayoutList className="h-3 w-3" />
            Service Continuity Editor
          </div>
          <Input
            value={draft.title}
            onChange={(event) => onDraftChange({ title: event.target.value })}
            placeholder="콘티명을 입력하세요"
            className="h-11 max-w-xl border-none bg-transparent px-0 text-xl font-bold tracking-tight shadow-none focus-visible:ring-0"
          />
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                예배일
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-label="예배일 선택"
                    className={cn(
                      'h-8 justify-start text-left font-semibold text-primary/80',
                      !draft.date && 'text-muted-foreground',
                    )}
                  >
                    {draft.date
                      ? format(draft.date, 'yyyy. MM. dd (EEE)', { locale: ko })
                      : '예배일 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={draft.date}
                    onSelect={(date) => onDraftChange({ date })}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                예배 시간
              </span>
              <div className="flex items-center gap-2">
                <Select value={draft.period} onValueChange={(period) => onDraftChange({ period })}>
                  <SelectTrigger className="h-8 w-[88px]" aria-label="오전 또는 오후">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={draft.hour} onValueChange={(hour) => onDraftChange({ hour })}>
                  <SelectTrigger className="h-8 w-[88px]" aria-label="예배 시간 시">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}시
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={draft.minute} onValueChange={(minute) => onDraftChange({ minute })}>
                  <SelectTrigger className="h-8 w-[88px]" aria-label="예배 시간 분">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}분
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator orientation="vertical" className="hidden h-3 sm:block" />
            <span className="flex items-center gap-1">
              총 <span className="font-bold text-foreground">{songCount}</span>곡
            </span>
          </div>
        </div>

        <ContiShareMenu {...shareMenuProps} />
      </div>
    </div>
  )
}
