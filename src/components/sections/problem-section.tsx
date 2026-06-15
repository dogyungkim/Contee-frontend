import { FileText, Repeat, Share2 } from 'lucide-react'

const issues = [
  {
    icon: FileText,
    title: '자료가 여러 곳에 흩어집니다',
    description:
      '악보, 음원 링크, 가사, 최종 콘티 파일이 메신저와 드라이브에 나뉘어 있으면 준비 속도가 매번 끊깁니다.',
  },
  {
    icon: Repeat,
    title: '좋았던 조합을 다시 찾기 어렵습니다',
    description:
      '이전에 사용한 곡 순서와 분위기를 기록해두지 않으면, 좋은 예배 흐름도 다음 주에는 다시 처음부터 고민하게 됩니다.',
  },
  {
    icon: Share2,
    title: '공유가 많을수록 버전이 엇갈립니다',
    description:
      '수정된 파일을 다시 전달하는 과정에서 팀원마다 보는 정보가 달라지고, 예배 직전까지 확인 비용이 커집니다.',
  },
]

const ProblemSection = () => {
  return (
    <section id="features" className="border-b border-border/80 bg-[#fafafa]">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-caption text-muted-foreground">Why Contee</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
            예배 준비를 복잡하게 만드는 병목부터 정리합니다.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Contee는 찬양팀이 실제로 겪는 반복 작업을 기준으로 설계되었습니다. 찾기 어렵고, 재사용
            어렵고, 공유할수록 꼬이는 지점을 먼저 줄입니다.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {issues.map((issue) => {
            const Icon = issue.icon
            return (
              <div key={issue.title} className="surface-card rounded-[24px] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">{issue.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{issue.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
