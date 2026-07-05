import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

const heroSteps = [
  '콘티 순서 정리',
  '곡 데이터 확인',
  '팀과 최신본 공유',
]

const HeroSection = () => {
  return (
    <section className="bg-sky-wash relative overflow-hidden border-b border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-4xl text-center">
          <div className="text-caption-upper text-muted-foreground">Contee for worship teams</div>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl lg:text-[64px] lg:leading-[1.05]">
            찬양팀 준비를 위한
            <br />
            더 조용하고 정확한 워크스페이스.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            콘티 작성, 곡 확인, 최종 공유까지 이어지는 흐름을 하나의 화면으로 정리합니다.
            준비 과정은 단순해지고 팀은 같은 버전을 보게 됩니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#workflow">기능 살펴보기</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            {heroSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span>{step}</span>
                {index < heroSteps.length - 1 ? <ChevronRight className="h-4 w-4 text-muted-foreground/60" /> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 w-full max-w-5xl">
          <div className="relative mx-auto">
            <div className="surface-card overflow-hidden rounded-2xl border border-[#dcdee0] shadow-[0_20px_50px_rgba(168,200,232,0.18)]">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d7d8dc]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d7d8dc]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d7d8dc]" />
                </div>
                <span className="text-caption text-muted-foreground">contee.app/workspace</span>
              </div>
              <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="bg-white p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-caption-upper text-muted-foreground">Sunday set</div>
                      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">6월 셋째 주일 2부</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Opening prayer · 말씀 전 · 헌금 · 파송
                      </p>
                    </div>
                    <div className="rounded-full bg-black px-3 py-1 text-[11px] font-medium text-white">
                      Live
                    </div>
                  </div>
                  <div className="mt-8 space-y-3">
                    {[
                      ['01', '주의 은혜라', 'Key A · 72 BPM'],
                      ['02', '주 이름 찬양', 'Key B · 128 BPM'],
                      ['03', '예수 우리 왕이여', 'Key G · 74 BPM'],
                    ].map(([index, title, meta]) => (
                      <div key={title} className="flex items-center justify-between rounded-xl border border-border bg-[#fafafa] px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="text-caption text-muted-foreground">{index}</div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{title}</div>
                            <div className="mt-1 text-sm text-muted-foreground">{meta}</div>
                          </div>
                        </div>
                        <div className="rounded-md bg-white px-2.5 py-1 text-caption text-foreground ring-1 ring-border">
                          Ready
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-dark flex flex-col justify-between p-6 lg:p-8">
                  <div>
                    <div className="text-caption-upper text-white/70">Preview</div>
                    <div className="mt-4 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
                      <div className="font-[var(--font-caption)] text-[13px] leading-6 text-white/88">
                        {`{
  team: "2부 찬양팀",
  conti: 3,
  share: "latest",
  export: ["link", "pdf"]
}`}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
                      <div className="text-caption-upper text-white/60">Status</div>
                      <div className="mt-2 text-sm text-white">팀 전체에 최신 콘티가 동기화되었습니다.</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
                      <div className="text-caption-upper text-white/60">Share</div>
                      <div className="mt-2 text-sm text-white/80">링크 공유와 출력용 정리까지 한 번에 준비합니다.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card absolute -bottom-8 left-6 hidden w-44 rounded-2xl p-4 shadow-[0_12px_24px_rgba(23,23,23,0.06)] md:block">
              <div className="text-caption-upper text-muted-foreground">Mobile</div>
              <div className="mt-3 rounded-xl border border-border bg-[#fafafa] p-3">
                <div className="h-2.5 w-16 rounded-full bg-[#d8dadd]" />
                <div className="mt-3 space-y-2">
                  <div className="h-10 rounded-lg bg-white ring-1 ring-border" />
                  <div className="h-10 rounded-lg bg-white ring-1 ring-border" />
                  <div className="h-10 rounded-lg bg-white ring-1 ring-border" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
