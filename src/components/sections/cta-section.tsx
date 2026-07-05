import Link from 'next/link'

import { Button } from '@/components/ui/button'

const CtaSection = () => {
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-caption-upper text-muted-foreground">Start now</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
            팀이 같은 화면을 보게 되면 준비는 훨씬 단순해집니다.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Contee에서 콘티를 작성하고 곡을 정리하고 팀과 공유하세요. 예배 직전까지 확인하던 작은 혼선을 줄일 수 있습니다.
          </p>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg">
              <Link href="/login">무료로 시작하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
