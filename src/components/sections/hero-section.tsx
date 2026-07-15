import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  Link2,
  Music2,
  Send,
  Youtube,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

const contiSongs = [
  {
    order: '1',
    title: '주님을 예배하는 것',
    artist: '제이어스',
    key: 'A',
    bpm: '72',
    flow: ['Intro', 'V1', 'Chorus', 'Bridge'],
  },
  {
    order: '2',
    title: '주 이름 찬양',
    artist: '마커스워십',
    key: 'B',
    bpm: '128',
    flow: ['Intro', 'V1', 'Pre', 'Chorus'],
  },
  {
    order: '3',
    title: '예수 우리 왕이여',
    artist: '어노인팅',
    key: 'G',
    bpm: '74',
    flow: ['V1', 'Chorus', 'Tag'],
  },
]

const HeroSection = () => {
  return (
    <section className="text-keep overflow-hidden border-b border-border bg-white">
      <div className="mx-auto grid min-w-0 w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-8 lg:py-20">
        <div className="landing-copy-shell min-w-0">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-[#fafafa] px-3 py-1.5 text-caption-upper text-muted-foreground">
            <Music2 className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">Contee for worship teams</span>
          </div>
          <h1 className="landing-copy-text mt-6 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:max-w-none sm:text-6xl lg:text-[64px] lg:leading-[1.02]">
            이번 주 콘티를
            <br />
            한곳에 정리하세요.
          </h1>
          <p className="landing-copy-text mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            <span className="block sm:inline">곡 순서, 악보, 말씀, 공유 링크까지</span>{' '}
            <span className="block sm:inline">예배 준비에 필요한 것만 담았습니다.</span>{' '}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">
                <span className="whitespace-nowrap">시작하기</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="landing-screen-shell min-w-0 rounded-md border border-[#dcdee0] bg-[#f6f6f6] shadow-[0_18px_60px_rgb(26_28_28/0.10)]">
          <div className="flex items-center justify-between border-b border-[#dcdee0] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9cacc]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9cacc]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9cacc]" />
            </div>
            <div className="text-anywhere hidden text-caption text-muted-foreground sm:block">contee.app/dashboard/contis/7월-셋째-주일</div>
          </div>

          <div className="min-w-0 bg-[#f4f4f4] p-3 sm:p-4">
            <div className="rounded-md border border-border bg-background px-4 py-4 sm:px-5">
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="type-badge flex flex-wrap items-center gap-2 uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      예배 콘티
                    </span>
                    <span className="whitespace-nowrap rounded border border-[#cdded1] bg-[#f0faf3] px-1.5 py-0 text-[#257a3e]">공개</span>
                    <span className="whitespace-nowrap rounded border border-[#d8deeb] bg-[#f4f6fa] px-1.5 py-0 text-primary">외부 공유</span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold tracking-normal text-foreground sm:text-2xl">
                    7월 셋째 주일 2부
                  </h2>
                  <div className="type-body-sm mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>2026. 07. 19 (주일)</span>
                    <span className="hidden sm:inline">·</span>
                    <span>오전 11:00</span>
                    <span className="hidden sm:inline">·</span>
                    <span>총 3곡</span>
                  </div>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm whitespace-nowrap">
                    <Download className="h-4 w-4" />
                    내보내기
                  </button>
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm whitespace-nowrap">
                    <Link2 className="h-4 w-4" />
                    링크 관리
                  </button>
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm text-primary-foreground whitespace-nowrap">
                    <Send className="h-4 w-4" />
                    팀에 공개
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="grid min-w-0 gap-4">
                <div className="rounded-md border border-neutral-200 bg-white p-4">
                  <p className="type-label mb-2 text-amber-600">특이사항</p>
                  <p className="type-body-sm text-neutral-600">
                    2번 곡 후 기도. 마지막 곡은 후렴을 한 번 더.
                  </p>
                </div>

                <div className="rounded-md border border-neutral-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                      <BookOpen className="h-4 w-4 text-neutral-600" />
                    </div>
                    <h3 className="type-card-title text-neutral-900">말씀 & 나눔</h3>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="rounded-md border border-neutral-200 bg-neutral-50/40 p-3">
                      <p className="type-label mb-1 text-neutral-700">본문</p>
                      <p className="type-body-sm font-semibold text-neutral-900">시편 103:1-5</p>
                      <p className="type-body-sm mt-1 text-neutral-700">내 영혼아 여호와를 송축하라.</p>
                    </div>
                    <div className="rounded-md border border-neutral-200 bg-neutral-50/40 p-3">
                      <p className="type-label mb-1 text-neutral-700">나눔</p>
                      <p className="type-body-sm text-neutral-700">은혜를 기억하며 함께 나눕니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Music2 className="h-4 w-4 text-neutral-500" />
                  <h3 className="font-semibold text-neutral-900">곡 목록</h3>
                </div>
                {contiSongs.map((song) => (
                  <div key={song.title} className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-neutral-100 bg-neutral-50/50 px-3 py-3">
                      <span className="type-label flex h-6 w-6 items-center justify-center rounded bg-neutral-200 text-neutral-600">
                        {song.order}
                      </span>
                      <div className="min-w-0">
                        <h4 className="type-emphasis truncate">{song.title}</h4>
                        <div className="type-body-sm mt-1 text-neutral-500">{song.artist}</div>
                      </div>
                      <div className="hidden gap-2 sm:flex">
                        <span className="type-badge whitespace-nowrap rounded border border-border bg-white px-2 py-1 text-muted-foreground">{song.key} Key</span>
                        <span className="type-badge whitespace-nowrap rounded border border-border bg-white px-2 py-1 text-muted-foreground">{song.bpm} BPM</span>
                      </div>
                    </div>
                    <div className="space-y-3 px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {song.flow.map((part, index) => (
                          <div key={`${song.title}-${part}-${index}`} className="flex items-center gap-1.5">
                            <span className="type-badge whitespace-nowrap rounded border border-blue-100 bg-blue-50 px-2 py-1 text-blue-700">{part}</span>
                            {index < song.flow.length - 1 && <span className="type-badge text-slate-300">→</span>}
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-muted px-3 text-sm whitespace-nowrap">
                          <FileText className="h-4 w-4" />
                          악보 보기
                        </div>
                        <div className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-muted px-3 text-sm whitespace-nowrap">
                          <Youtube className="h-4 w-4 text-red-500" />
                          유튜브
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
