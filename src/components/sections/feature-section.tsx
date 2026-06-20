import { ArrowUpRight, Library, ListMusic, Share2 } from 'lucide-react'

const features = [
  {
    eyebrow: 'Plan',
    title: '콘티를 예배 흐름 중심으로 정리',
    description:
      '곡 순서를 빠르게 조정하고 예배의 호흡을 화면 안에서 확인합니다. 수정이 생겨도 전체 팀이 같은 구조를 따라갑니다.',
    bullets: ['드래그로 순서 조정', '리허설 직전 수정 반영', '모바일에서도 동일한 구조'],
    icon: ListMusic,
  },
  {
    eyebrow: 'Search',
    title: '곡 정보를 기준 데이터로 축적',
    description:
      '곡명, 아티스트, 키, BPM, 링크를 함께 쌓아두고 다음 예배 준비 시간을 줄입니다.',
    bullets: ['곡 메타데이터 정리', '조합 재사용', '링크와 자료 연결'],
    icon: Library,
  },
  {
    eyebrow: 'Share',
    title: '최종 공유를 더 조용하게 끝내기',
    description:
      '링크와 출력본을 기준으로 팀 전체가 최신 상태를 확인할 수 있어 전달 과정의 확인 비용이 줄어듭니다.',
    bullets: ['링크 중심 공유', 'PDF 출력 준비', '수정 후 즉시 최신화'],
    icon: Share2,
  },
]

const FeatureSection = () => {
  return (
    <section id="workflow" className="border-b border-border bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-caption-upper text-muted-foreground">Workflow</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            계획, 검색, 공유가 하나의 흐름으로 이어집니다.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            문서가 바뀔 때마다 팀이 다시 정렬되지 않도록, Contee는 준비 과정 전체를 같은 작업 문맥 안에 둡니다.
          </p>
        </div>

        <div className="mt-16 grid gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const dark = index === 1

            return (
              <div
                key={feature.title}
                className={dark ? 'grid gap-8 rounded-xl border border-[#1a1a1a] bg-[#171717] p-6 sm:p-8 lg:grid-cols-[0.92fr_1.08fr]' : 'surface-card grid gap-8 rounded-xl p-6 sm:p-8 lg:grid-cols-[0.92fr_1.08fr]'}
              >
                <div className="flex flex-col justify-between gap-6">
                  <div>
                    <div className={dark ? 'text-caption-upper text-white/60' : 'text-caption-upper text-muted-foreground'}>
                      {feature.eyebrow}
                    </div>
                    <h3 className={dark ? 'mt-4 text-3xl font-semibold tracking-[-0.05em] text-white' : 'mt-4 text-3xl font-semibold tracking-[-0.05em] text-foreground'}>
                      {feature.title}
                    </h3>
                    <p className={dark ? 'mt-4 max-w-xl text-base leading-7 text-white/72' : 'mt-4 max-w-xl text-base leading-7 text-muted-foreground'}>
                      {feature.description}
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {feature.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className={dark ? 'flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3' : 'flex items-center justify-between rounded-lg border border-border bg-[#fafafa] px-4 py-3'}
                      >
                        <span className={dark ? 'text-sm text-white' : 'text-sm text-foreground'}>{bullet}</span>
                        <ArrowUpRight className={dark ? 'h-4 w-4 text-white/55' : 'h-4 w-4 text-muted-foreground'} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={dark ? 'rounded-xl border border-white/10 bg-[#1a1a1a] p-5' : 'rounded-xl border border-border bg-[#fafafa] p-5'}>
                  <div className={dark ? 'rounded-xl border border-white/10 bg-[#171717] p-5' : 'rounded-xl border border-border bg-white p-5'}>
                    <div className="flex items-center justify-between">
                      <div className={dark ? 'flex h-10 w-10 items-center justify-center rounded-md bg-white/10' : 'flex h-10 w-10 items-center justify-center rounded-md bg-accent'}>
                        <Icon className={dark ? 'h-5 w-5 text-white' : 'h-5 w-5 text-foreground'} />
                      </div>
                      <div className={dark ? 'text-caption text-white/55' : 'text-caption text-muted-foreground'}>
                        0{index + 1}
                      </div>
                    </div>
                    <div className="mt-8 space-y-3">
                      <div className={dark ? 'h-3 w-24 rounded-full bg-white/14' : 'h-3 w-24 rounded-full bg-foreground/10'} />
                      <div className={dark ? 'h-11 rounded-lg border border-white/10 bg-[#1a1a1a]' : 'h-11 rounded-lg border border-border bg-white'} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className={dark ? 'h-24 rounded-lg border border-white/10 bg-[#202020]' : 'h-24 rounded-lg border border-border bg-[#fafafa]'} />
                        <div className={dark ? 'h-24 rounded-lg border border-white/10 bg-[#171717]' : 'h-24 rounded-lg border border-border bg-white'} />
                      </div>
                      <div className={dark ? 'h-20 rounded-lg border border-white/10 bg-[#171717]' : 'h-20 rounded-lg border border-border bg-white'} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection
