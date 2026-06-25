'use client'

import { useParams } from 'next/navigation'
import { BookOpen, Calendar, Loader2, Music } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSharedConti } from '@/domains/conti/hooks/use-conti'
import { ContiSongCard } from '@/domains/conti/components/conti-song-card'
import { mapApiSongFormToUi } from '@/domains/song/utils/song-form'

export default function SharedContiPage() {
  const params = useParams()
  const token = typeof params.token === 'string' ? params.token : null
  const { data: conti, isLoading, isError } = useSharedConti(token)

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          공유 콘티를 불러오는 중...
        </div>
      </main>
    )
  }

  if (isError || !conti) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
        <div className="max-w-sm rounded-lg border bg-white p-6 text-center">
          <h1 className="text-lg font-semibold">공유 콘티를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            링크가 만료되었거나 외부 공유가 꺼졌을 수 있습니다.
          </p>
        </div>
      </main>
    )
  }

  const verseLines = conti.bibleVerse
    ? conti.bibleVerse
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : []
  const bibleVerseReference = verseLines[0]
  const bibleVerseContent = verseLines.slice(1).join('\n')

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold tracking-[-0.02em]">Contee</div>
          <Badge variant="outline" className="bg-white">읽기 전용 공유 콘티</Badge>
        </header>

        <section className="rounded-lg border bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-normal text-foreground">{conti.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(conti.worshipDate), 'yyyy. MM. dd (EEE)', { locale: ko })} · {conti.worshipTime}
                </span>
                <Separator orientation="vertical" className="hidden h-3 sm:block" />
                  <span>{conti.contiSongs.length}곡</span>
              </div>
            </div>
          </div>
        </section>

        {(conti.memo || conti.bibleVerse || conti.sharingInfo) && (
          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            {conti.memo && (
              <div className="rounded-lg border bg-white p-5">
                <div className="mb-2 text-xs font-bold text-muted-foreground">특이사항</div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{conti.memo}</p>
              </div>
            )}

            {(conti.bibleVerse || conti.sharingInfo) && (
              <div className="rounded-lg border bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">말씀 & 나눔</h2>
                </div>
                {conti.bibleVerse && (
                  <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-4">
                    {bibleVerseReference && (
                      <p className="text-sm font-semibold text-neutral-900">{bibleVerseReference}</p>
                    )}
                    {bibleVerseContent && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                        {bibleVerseContent}
                      </p>
                    )}
                  </div>
                )}
                {conti.sharingInfo && (
                  <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50/50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-700">{conti.sharingInfo}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <section className="rounded-lg border bg-white">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">곡 목록</h2>
            </div>
          </div>
          <div className="space-y-3 p-4">
            {conti.contiSongs.map((song, index) => (
              <ContiSongCard
                key={song.id}
                index={index}
                title={song.title}
                artist={song.artist || song.teamSong?.artist}
                keySignature={song.key}
                bpm={song.bpm}
                note={song.note}
                teamNote={song.teamSong?.note}
                songForm={mapApiSongFormToUi(song.songForm)}
                youtubeUrl={song.youtubeUrl || song.teamSong?.youtubeUrl}
                sheetMusicUrl={song.sheetMusicUrl || song.teamSong?.sheetMusicUrl}
                showOriginalMeta={false}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
