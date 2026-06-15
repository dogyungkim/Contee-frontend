import Link from 'next/link'

import { Button } from '@/components/ui/button'

const CtaSection = () => {
  return (
    <section className="bg-[#171717] text-white">
      <div className="bg-mesh mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/5 px-6 py-12 text-center backdrop-blur sm:px-10">
          <div className="text-caption text-white/55">Start now</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
            팀이 같은 화면을 보게 되면 준비는 훨씬 단순해집니다.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
            더 이상 메신저 스레드와 폴더를 뒤지지 말고, Contee에서 콘티를 작성하고 곡을 정리하고 팀과
            공유하세요.
          </p>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-black hover:bg-white/90">
              <Link href="/login">무료로 시작하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
