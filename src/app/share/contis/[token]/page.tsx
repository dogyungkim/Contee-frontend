'use client'

import { useParams } from 'next/navigation'
import { Calendar, Loader2, Music } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSharedConti } from '@/domains/conti/hooks/use-conti'
import { ContiReadOnlyInfo } from '@/domains/conti/components/conti-read-only-info'
import { ContiReadOnlySongList } from '@/domains/conti/components/conti-read-only-song-list'

export default function SharedContiPage() {
  const params = useParams()
  const token = typeof params.token === 'string' ? params.token : null
  const { data: conti, isLoading, isError } = useSharedConti(token)

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#fafafa] px-4">
        <div className="flex max-w-sm items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>공유 콘티를 불러오는 중...</span>
        </div>
      </main>
    )
  }

  if (isError || !conti) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-sm rounded-lg border bg-white p-5 text-center sm:p-6">
          <h1 className="text-lg font-semibold">공유 콘티를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            링크가 만료되었거나 외부 공유가 꺼졌을 수 있습니다.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-[#fafafa]">
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold tracking-normal">Contee</div>
          <Badge variant="outline" className="bg-white text-[11px] sm:text-xs">읽기 전용 공유 콘티</Badge>
        </header>

        <section className="rounded-lg border bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold tracking-normal text-foreground sm:text-2xl">{conti.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {format(new Date(conti.worshipDate), 'yyyy. MM. dd (EEE)', { locale: ko })} · {conti.worshipTime}
                </span>
                <Separator orientation="vertical" className="hidden h-3 sm:block" />
                <span>{conti.contiSongs.length}곡</span>
              </div>
            </div>
          </div>
        </section>

        <ContiReadOnlyInfo
          memo={conti.memo}
          bibleVerse={conti.bibleVerse}
          sharingInfo={conti.sharingInfo}
          layout="split"
        />

        <section className="rounded-lg border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-4 sm:px-5">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">곡 목록</h2>
            </div>
          </div>
          <div className="space-y-3 p-3 sm:p-4">
            <ContiReadOnlySongList songs={conti.contiSongs} />
          </div>
        </section>
      </div>
    </main>
  )
}
