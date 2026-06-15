import Link from 'next/link'
import { ArrowRight, Check, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

const metrics = [
  { label: '준비 흐름', value: '한 화면에서' },
  { label: '공유 속도', value: '링크 한 번으로' },
  { label: '팀 협업', value: '최신 버전 유지' },
]

const HeroSection = () => {
  return (
    <section className="bg-mesh bg-grid-soft relative overflow-hidden border-b border-border/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-3 py-1.5 text-caption text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-[linear-gradient(135deg,#007cf0,#00dfd8)]" />
            Worship planning, redesigned
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.08em] text-balance text-foreground sm:text-6xl md:text-7xl">
            찬양팀 콘티 작업을
            <br />
            더 선명하고 빠르게.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            흩어진 곡 정보, 반복되는 수정 요청, 뒤엉킨 공유 과정을 하나의 흐름으로 정리합니다.
            Contee는 예배 준비를 위한 운영 화면이자 팀의 단일 진실 원본입니다.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                지금 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#workflow">
                <PlayCircle className="h-4 w-4" />
                기능 둘러보기
              </Link>
            </Button>
          </div>
        </div>

        <div className="surface-panel relative mx-auto grid w-full max-w-6xl gap-6 rounded-[28px] p-4 sm:p-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="overflow-hidden rounded-[24px] border border-border bg-[#121212] text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-caption text-white/55">Sunday-Set.contee</span>
            </div>
            <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-caption text-white/50">Worship Set</div>
                  <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">6월 둘째 주일 2부</div>
                  <div className="mt-2 text-sm text-white/65">Opening prayer · 말씀 전 · 헌금 · 파송</div>
                </div>
                <div className="space-y-3">
                  {['주의 은혜라', '주 이름 찬양', '예수 우리 왕이여'].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <div className="text-xs text-white/45">#{String(index + 1).padStart(2, '0')}</div>
                        <div className="mt-1 text-sm font-medium">{item}</div>
                      </div>
                      <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-caption text-cyan-200">
                        Synced
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(0,124,240,0.22),rgba(255,0,128,0.18),rgba(249,203,40,0.18))] p-4">
                  <div className="text-caption text-white/55">Live Updates</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {metrics.map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="text-caption text-white/45">{metric.label}</div>
                        <div className="mt-2 text-sm font-medium text-white">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-caption text-white/55">Why teams switch</div>
                  <div className="mt-3 grid gap-3">
                    {[
                      '콘티와 곡 라이브러리를 같은 맥락에서 관리',
                      '수정 사항이 팀 전체 화면에 즉시 반영',
                      '예배 전 최종본을 링크와 PDF로 빠르게 전달',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-white/80">
                        <Check className="mt-0.5 h-4 w-4 text-cyan-300" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="surface-card rounded-[24px] p-6">
              <div className="text-caption text-muted-foreground">Current workflow</div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.04em]">예배 준비를 운영하는 화면</div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                계획, 검색, 공유가 서로 다른 앱에 흩어져 있지 않도록 콘티 중심으로 팀 작업을 재배치했습니다.
              </p>
            </div>
            <div className="surface-card rounded-[24px] p-6">
              <div className="text-caption text-muted-foreground">For leaders and teams</div>
              <div className="mt-3 text-sm leading-6 text-foreground">
                리더는 흐름을 설계하고, 팀원은 같은 버전의 자료를 보고, 모두가 예배 직전의 혼선을 줄입니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
