import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>설정</CardTitle>
          <CardDescription>프로필/팀/연동/로그아웃 등의 설정 화면이 여기에 들어갑니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            현재는 헤더 메뉴 진입점만 제공하며, 백엔드 준비에 맞춰 점진적으로 추가합니다.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

