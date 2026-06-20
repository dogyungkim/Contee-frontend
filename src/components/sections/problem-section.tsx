import { FileText, Repeat, Share2 } from 'lucide-react'

const issues = [
  {
    icon: FileText,
    title: '자료 위치를 매번 다시 찾게 됩니다',
    description:
      '악보, 음원, 가사, 마지막 수정본이 흩어져 있으면 준비는 늘 검색과 확인부터 다시 시작됩니다.',
  },
  {
    icon: Repeat,
    title: '좋은 흐름이 반복 자산으로 남지 않습니다',
    description:
      '이전 예배의 곡 조합과 순서를 남겨두지 않으면 다음 주에도 같은 고민을 처음부터 반복하게 됩니다.',
  },
  {
    icon: Share2,
    title: '공유가 많을수록 최신본 확인 비용이 커집니다',
    description:
      '메신저, 파일, 캡처가 동시에 오가면 팀원마다 보는 정보가 달라지고 예배 직전까지 정렬이 필요해집니다.',
  },
]

const ProblemSection = () => {
  return (
    <section id="features" className="border-b border-border bg-[#fafafa]">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-caption-upper text-muted-foreground">Why Contee</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            예배 준비를 느리게 만드는 문제부터 덜어냅니다.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Contee는 화면을 화려하게 만들기보다 준비 과정을 조용하게 정리하는 데 집중합니다.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {issues.map((issue, index) => {
            const Icon = issue.icon
            const dark = index === 1

            return (
              <div
                key={issue.title}
                className={dark ? 'surface-dark rounded-xl p-7' : 'surface-card rounded-xl p-7'}
              >
                <div className={dark ? 'flex h-10 w-10 items-center justify-center rounded-md bg-white/10' : 'flex h-10 w-10 items-center justify-center rounded-md bg-accent'}>
                  <Icon className={dark ? 'h-5 w-5 text-white' : 'h-5 w-5 text-foreground'} />
                </div>
                <h3 className={dark ? 'mt-6 text-2xl font-semibold tracking-[-0.03em] text-white' : 'mt-6 text-2xl font-semibold tracking-[-0.03em] text-foreground'}>
                  {issue.title}
                </h3>
                <p className={dark ? 'mt-3 text-sm leading-7 text-white/72' : 'mt-3 text-sm leading-7 text-muted-foreground'}>
                  {issue.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
