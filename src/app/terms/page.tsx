import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관 | Contee',
  description: 'Contee 서비스 이용약관',
}

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">이용약관</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        이용약관 문서는 현재 준비 중입니다. 정식 배포 전 최종 버전으로 업데이트됩니다.
      </p>
    </main>
  )
}
