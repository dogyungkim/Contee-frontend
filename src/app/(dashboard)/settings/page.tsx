import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600">계정 및 팀 설정을 관리하세요</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">계정 정보</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">이름</Label>
                <Input id="name" defaultValue="김리더" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="leader@church.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue="010-1234-5678"
                  className="mt-1"
                />
              </div>
            </div>
            <Button className="mt-4">저장</Button>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">비밀번호 변경</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">현재 비밀번호</Label>
                <Input id="current-password" type="password" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input id="new-password" type="password" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="confirm-password">비밀번호 확인</Label>
                <Input id="confirm-password" type="password" className="mt-1" />
              </div>
            </div>
            <Button className="mt-4">비밀번호 변경</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">팀 정보</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">팀명</Label>
                <Input
                  id="team-name"
                  defaultValue="○○교회 찬양팀"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="church-name">교회명</Label>
                <Input
                  id="church-name"
                  defaultValue="○○교회"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role">역할</Label>
                <Input id="role" defaultValue="팀장" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="description">팀 소개</Label>
                <Textarea
                  id="description"
                  placeholder="팀에 대한 간단한 소개를 입력하세요..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
            <Button className="mt-4">저장</Button>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              위험 구역
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">계정 삭제</h3>
                <p className="text-sm text-gray-600 mb-2">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
                <Button variant="destructive">계정 삭제</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
