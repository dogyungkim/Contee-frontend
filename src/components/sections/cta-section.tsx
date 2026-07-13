import Link from 'next/link'

import { Button } from '@/components/ui/button'

const CtaSection = () => {
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-caption-upper text-muted-foreground">Start now</div>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
            팀이 같은 화면을 보게 되면 준비는 훨씬 단순해집니다.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Contee에서 콘티를 작성하고 곡을 정리하고 팀과 공유하세요. 예배 직전까지 확인하던 작은 혼선을 줄일 수 있습니다.
          </p>
          <div className="mt-8 flex justify-center sm:mt-10">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">무료로 시작하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
