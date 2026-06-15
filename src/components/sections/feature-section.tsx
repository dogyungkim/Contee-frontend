import { ArrowUpRight, Library, ListMusic, Share2 } from 'lucide-react'

const features = [
  {
    eyebrow: 'Plan',
    title: '드래그 앤 드롭으로 콘티 흐름을 설계',
    description:
      '곡 순서를 빠르게 조정하고 예배의 리듬을 시각적으로 정리합니다. 리허설 직전 변경도 부담 없이 반영할 수 있습니다.',
    bullets: ['직관적인 순서 변경', '모바일에서도 동일한 흐름 유지', '팀과 동시에 최신본 확인'],
    icon: ListMusic,
    accent:
      'from-[rgba(0,124,240,0.16)] via-[rgba(80,227,194,0.12)] to-transparent',
  },
  {
    eyebrow: 'Search',
    title: '곡 데이터베이스를 팀의 기준 정보로',
    description:
      '곡명, 아티스트, 키, BPM, 링크를 한 곳에 쌓아두고 다음 예배를 위한 검색 시간을 줄입니다.',
    bullets: ['곡 속성별 빠른 탐색', '자주 쓰는 조합 재사용', '악보와 참고 링크 연결'],
    icon: Library,
    accent:
      'from-[rgba(121,40,202,0.14)] via-[rgba(255,0,128,0.14)] to-transparent',
  },
  {
    eyebrow: 'Ship',
    title: '최종본 공유를 한 번의 전달로',
    description:
      '완성된 콘티를 링크와 출력 포맷으로 정리해 팀 전체가 같은 버전을 보게 만듭니다.',
    bullets: ['공유 링크 중심 전달', 'PDF 출력 준비', '수정 이후 즉시 반영'],
    icon: Share2,
    accent:
      'from-[rgba(255,77,77,0.14)] via-[rgba(249,203,40,0.14)] to-transparent',
  },
]

const FeatureSection = () => {
  return (
    <section id="workflow" className="border-b border-border/80 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-caption text-muted-foreground">Workflow</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
            계획하고, 찾고, 공유하는 전 과정을 하나의 제품 흐름으로.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            단순히 예쁜 랜딩이 아니라 실제 운영 화면으로 이어지는 구조를 담았습니다. Contee의 핵심은
            팀이 작업을 덜 잃어버리게 만드는 데 있습니다.
          </p>
        </div>

        <div className="mt-16 grid gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="surface-panel grid gap-8 rounded-[28px] p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr]"
              >
                <div className="flex flex-col justify-between gap-6">
                  <div>
                    <div className="text-caption text-muted-foreground">{feature.eyebrow}</div>
                    <h3 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">{feature.title}</h3>
                    <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {feature.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3"
                      >
                        <span className="text-sm text-foreground">{bullet}</span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`relative overflow-hidden rounded-[24px] border border-border bg-gradient-to-br ${feature.accent} p-5`}>
                  <div className="absolute inset-0 bg-grid-soft opacity-60" />
                  <div className="relative rounded-[20px] border border-border bg-white/90 p-5 shadow-[0_1px_2px_rgba(23,23,23,0.04)]">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-caption text-muted-foreground">0{index + 1}</div>
                    </div>
                    <div className="mt-8 space-y-3">
                      <div className="h-3 w-24 rounded-full bg-foreground/10" />
                      <div className="h-10 rounded-2xl border border-border bg-white" />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="h-24 rounded-2xl border border-border bg-[#fafafa]" />
                        <div className="h-24 rounded-2xl border border-border bg-white" />
                      </div>
                      <div className="h-20 rounded-2xl border border-border bg-white" />
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
