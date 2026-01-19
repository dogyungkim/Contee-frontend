import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContisPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>콘티</CardTitle>
          <CardDescription>콘티 목록/생성/편집 화면이 여기에 들어갑니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            백엔드 API가 준비되면 목록/검색/복사 기능을 연결할 예정입니다.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

