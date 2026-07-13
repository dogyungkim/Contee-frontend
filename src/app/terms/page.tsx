import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관 | Contee',
  description: 'Contee 서비스 이용약관',
}

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-[calc(100dvh-8rem)] w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="break-words text-2xl font-bold">이용약관</h1>
      <p className="mt-4 break-words text-sm leading-6 text-muted-foreground">
        이용약관 문서는 현재 준비 중입니다. 정식 배포 전 최종 버전으로 업데이트됩니다.
      </p>
    </main>
  )
}
