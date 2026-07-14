import Link from 'next/link'
import { ArrowRight, FileText, Library, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'

const nextSteps = [
  {
    icon: Users,
    title: '팀 만들기',
    description: '초대 코드로 팀원을 받습니다.',
  },
  {
    icon: Library,
    title: '곡 등록하기',
    description: 'Key, BPM, 링크를 남겨둡니다.',
  },
  {
    icon: FileText,
    title: '콘티 공개하기',
    description: '팀과 바로 공유합니다.',
  },
]

const CtaSection = () => {
  return (
    <section className="text-keep border-b border-border bg-[#f7f7f7]">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="rounded-md border border-border bg-white p-5 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="text-caption-upper text-muted-foreground">시작하기</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
                이번 주 콘티부터 만들어보세요.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                팀을 만들고 곡을 모아두면, 다음 준비가 조금 가벼워집니다.
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

            <div className="grid gap-3">
              {nextSteps.map((step) => {
                const Icon = step.icon

                return (
                  <article key={step.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 rounded-md border border-border bg-[#fafafa] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="type-body-sm font-semibold text-foreground">{step.title}</h3>
                      <p className="type-body-sm mt-1 text-muted-foreground">{step.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
