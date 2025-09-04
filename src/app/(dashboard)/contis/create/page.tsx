import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateContiPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/contis">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">새 콘티 만들기</h1>
        <p className="text-gray-600">예배 정보를 입력하고 곡을 추가하세요</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">예배 정보</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">예배명</Label>
                <Input
                  id="title"
                  placeholder="예: 주일예배, 수요예배"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date">날짜</Label>
                <Input id="date" type="date" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="time">예배 시간</Label>
                <Input id="time" type="time" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  placeholder="예: 본당, 소예배실"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">곡 목록</h2>
            <div className="text-center py-8 text-gray-500">
              <p>곡을 검색하고 추가하세요</p>
              <Button variant="outline" className="mt-2">
                곡 추가하기
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">메모</h2>
            <Textarea
              placeholder="예배 관련 메모나 특이사항을 입력하세요..."
              rows={6}
            />
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">팀원 정보</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">리더:</span> 김리더
              </div>
              <div>
                <span className="font-medium">싱어:</span> 박싱어, 이싱어
              </div>
              <div>
                <span className="font-medium">연주자:</span> 최기타, 정베이스
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              임시저장
            </Button>
            <Button className="flex-1">저장하기</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
