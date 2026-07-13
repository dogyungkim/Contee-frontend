import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card className="rounded-2xl">
        <CardHeader className="px-4 pb-4 sm:px-6">
          <CardTitle className="break-words">설정</CardTitle>
          <CardDescription className="break-words">프로필/팀/연동/로그아웃 등의 설정 화면이 여기에 들어갑니다.</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="type-body-sm break-words text-muted-foreground">
            현재는 헤더 메뉴 진입점만 제공하며, 백엔드 준비에 맞춰 점진적으로 추가합니다.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
