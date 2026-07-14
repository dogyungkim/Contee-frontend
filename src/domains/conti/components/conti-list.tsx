'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { format, isSameDay, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Music, Search, X } from 'lucide-react'

import { useContis } from '../hooks/use-conti'
import { useContiActions } from '../hooks/use-conti-actions'
import { ContiListItem } from './conti-list-item'
import { useTeam } from '@/context/team-context'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import { canEditTeamContent } from '@/domains/team/utils/team-permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'

const CONTI_PAGE_SIZE = 20

const formatDateParam = (date: Date) => format(date, 'yyyy-MM-dd')
const formatDateLabel = (date: string) => format(parseISO(date), 'yyyy. MM. dd', { locale: ko })
const parseDateRange = (from: string, to: string): DateRange | undefined =>
  from
    ? {
        from: parseISO(from),
        to: to ? parseISO(to) : undefined,
      }
    : undefined

export function ContiList() {
  const { selectedTeamId } = useTeam()
  const { user } = useAuth()
  const { data: teamMembers = [] } = useTeamMembersQuery(selectedTeamId || '')
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [selectedFrom, setSelectedFrom] = useState('')
  const [selectedTo, setSelectedTo] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const [page, setPage] = useState(0)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [pendingDateRange, setPendingDateRange] = useState<DateRange | undefined>()
  const searchParams = useMemo(
    () => ({
      page,
      size: CONTI_PAGE_SIZE,
      q: appliedQuery.trim() || undefined,
      from: appliedFrom || undefined,
      to: appliedTo || undefined,
    }),
    [page, appliedQuery, appliedFrom, appliedTo]
  )
  const { data, isLoading, isFetching, isError } = useContis(selectedTeamId, searchParams)
  const contis = data?.content ?? []
  const totalElements = data?.totalElements ?? contis.length
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.number ?? page
  const isFirstPage = data?.first ?? currentPage <= 0
  const isLastPage = data?.last ?? currentPage >= totalPages - 1
  const { handleDeleteConti } = useContiActions()
  const hasAnyFilterInput =
    !!query.trim() || !!appliedQuery.trim() || !!selectedFrom || !!selectedTo || !!appliedFrom || !!appliedTo
  const hasAppliedFilters = !!appliedQuery.trim() || !!appliedFrom || !!appliedTo
  const hasUnappliedFilters =
    query.trim() !== appliedQuery.trim() ||
    selectedFrom !== appliedFrom ||
    selectedTo !== appliedTo
  const dateRangeLabel = selectedFrom
    ? selectedTo && selectedTo !== selectedFrom
      ? `${formatDateLabel(selectedFrom)} - ${formatDateLabel(selectedTo)}`
      : formatDateLabel(selectedFrom)
    : '예배일 범위'
  const currentMember = teamMembers.find((member) => member.userId === String(user?.id))
  const canEdit = canEditTeamContent(currentMember?.role)

  const applySearchFilters = () => {
    setAppliedQuery(query.trim())
    setAppliedFrom(selectedFrom)
    setAppliedTo(selectedTo)
    setPage(0)
  }

  useEffect(() => {
    setQuery('')
    setAppliedQuery('')
    setSelectedFrom('')
    setSelectedTo('')
    setAppliedFrom('')
    setAppliedTo('')
    setPendingDateRange(undefined)
    setDateRangeOpen(false)
    setPage(0)
  }, [selectedTeamId])

  useEffect(() => {
    setPage(0)
  }, [appliedQuery, appliedFrom, appliedTo])

  const handleDateRangeOpenChange = (open: boolean) => {
    if (open) {
      setPendingDateRange(parseDateRange(selectedFrom, selectedTo))
    }

    setDateRangeOpen(open)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range?.from) {
      setPendingDateRange(undefined)
      return
    }

    setPendingDateRange({
      from: range.from,
      to: range.to && !isSameDay(range.from, range.to) ? range.to : undefined,
    })
  }

  const applyDateRange = () => {
    if (!pendingDateRange?.from) {
      setSelectedFrom('')
      setSelectedTo('')
      setDateRangeOpen(false)
      return
    }

    const nextFrom = formatDateParam(pendingDateRange.from)
    const nextTo = pendingDateRange.to ? formatDateParam(pendingDateRange.to) : nextFrom

    setSelectedFrom(nextFrom)
    setSelectedTo(nextTo)
    setDateRangeOpen(false)
  }

  const clearDateRange = () => {
    setPendingDateRange(undefined)
    setSelectedFrom('')
    setSelectedTo('')
  }

  if (isLoading) {
    return (
      <div className="surface-card overflow-hidden rounded-2xl">
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid gap-3 px-4 py-4 sm:px-6 md:grid-cols-[minmax(0,1.8fr)_136px_150px_64px_48px] md:items-center">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-5 w-20" />
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
      <div className="surface-card type-body-sm flex h-40 items-center justify-center rounded-2xl text-muted-foreground">
        콘티 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    )
  }

  const filterControls = (
    <form
      className="grid gap-3 border-b border-border bg-white px-4 py-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_240px_auto]"
      onSubmit={(event) => {
        event.preventDefault()
        applySearchFilters()
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="콘티명으로 검색"
          className="pl-9"
          aria-label="콘티명 검색"
        />
      </div>
      <Popover open={dateRangeOpen} onOpenChange={handleDateRangeOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="justify-start gap-2 overflow-hidden px-3 text-left font-normal"
            aria-label="예배일 범위 선택"
          >
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{dateRangeLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] overflow-x-auto p-0 sm:w-auto" align="start">
          <CalendarComponent
            mode="range"
            selected={pendingDateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={1}
            autoFocus
          />
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearDateRange}
              disabled={!pendingDateRange?.from && !selectedFrom}
            >
              날짜 지우기
            </Button>
            <Button type="button" size="sm" onClick={applyDateRange}>
              적용
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        type={hasUnappliedFilters ? 'submit' : 'button'}
        variant={hasUnappliedFilters ? 'default' : 'outline'}
        onClick={() => {
          if (hasUnappliedFilters) {
            return
          }

          setQuery('')
          setAppliedQuery('')
          setSelectedFrom('')
          setSelectedTo('')
          setAppliedFrom('')
          setAppliedTo('')
          setPage(0)
        }}
        disabled={!hasAnyFilterInput && !hasUnappliedFilters}
        className="gap-2"
      >
        {hasUnappliedFilters ? (
          <>
            <Search className="h-4 w-4" />
            검색
          </>
        ) : (
          <>
            <X className="h-4 w-4" />
            초기화
          </>
        )}
      </Button>
    </form>
  )

  if (contis.length === 0 && !hasAppliedFilters && !isFetching) {
    return (
      <div className="surface-card flex flex-col items-center justify-center rounded-2xl px-4 py-14 text-center sm:py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent">
          <Music className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="type-card-title mt-4">생성된 콘티가 없습니다</h3>
        <p className="type-page-description mt-2">
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
    <Card className="gap-0 overflow-hidden rounded-2xl py-1">
      <CardHeader className="border-b border-border px-4 py-3 sm:px-5 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="type-card-title">예배 콘티</CardTitle>
            <CardDescription className="mt-1">
              총 {totalElements}개의 콘티가 등록되어 있습니다.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {filterControls}
        {contis.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="type-body-sm font-medium text-foreground">조건에 맞는 콘티가 없습니다.</p>
            <p className="type-body-sm text-muted-foreground">검색어 또는 예배일 범위를 조정해보세요.</p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,1.8fr)_136px_150px_64px_48px] items-center gap-3 border-b border-border px-6 py-3 text-caption-upper text-muted-foreground md:grid">
              <div>Conti</div>
              <div>Status</div>
              <div>Worship date</div>
              <div>Songs</div>
              <div className="text-right">{canEdit ? 'Menu' : null}</div>
            </div>

            <div className="divide-y divide-border">
              {contis.map((conti) => (
                <ContiListItem
                  key={conti.id}
                  conti={conti}
                  canEdit={canEdit}
                  onDelete={handleDeleteConti}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="type-body-sm text-muted-foreground">
                  {currentPage + 1} / {totalPages} 페이지
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((value) => Math.max(0, value - 1))}
                    disabled={isFirstPage || isLoading}
                    aria-label="이전 페이지"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    이전
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((value) => value + 1)}
                    disabled={isLastPage || isLoading}
                    aria-label="다음 페이지"
                  >
                    다음
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
