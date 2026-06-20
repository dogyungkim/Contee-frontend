import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SongsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-caption-upper text-muted-foreground">Song library</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">곡 관리</h1>
        <p className="mt-2 text-sm text-muted-foreground">곡 검색, 추가, 메타데이터 관리를 위한 작업 영역입니다.</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">라이브러리 준비 중</CardTitle>
          <CardDescription>현재는 대시보드에서 빠른 검색을 제공하고 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-[#fafafa] p-5 text-sm text-muted-foreground">
            MVP 단계에서는 대시보드 검색 경험을 우선 다듬고, 이후 이 화면을 표 중심의 라이브러리 관리 화면으로 확장할 예정입니다.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
