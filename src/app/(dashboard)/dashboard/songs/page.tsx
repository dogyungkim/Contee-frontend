import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SongsPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>곡</CardTitle>
          <CardDescription>곡 검색/추가/관리 화면이 여기에 들어갑니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            MVP 단계에서는 대시보드에서 빠른 검색 UI를 제공하고, 이후 상세 관리 기능을 확장합니다.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

