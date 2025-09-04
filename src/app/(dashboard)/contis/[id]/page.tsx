import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Share } from 'lucide-react'
import Link from 'next/link'

interface ContiDetailPageProps {
  params: { id: string }
}

export default function ContiDetailPage({ params }: ContiDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/contis">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">주일예배</h1>
            <p className="text-gray-600">2024년 1월 15일</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              공유
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">곡 목록</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">찬양하라</h3>
                  <p className="text-sm text-gray-600">키: C, BPM: 120</p>
                </div>
                <span className="text-sm text-gray-500">1</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">주님의 사랑</h3>
                  <p className="text-sm text-gray-600">키: G, BPM: 100</p>
                </div>
                <span className="text-sm text-gray-500">2</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">예배 정보</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">예배 시간:</span> 오전 10:30
              </div>
              <div>
                <span className="font-medium">장소:</span> 본당
              </div>
              <div>
                <span className="font-medium">리더:</span> 김리더
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">메모</h2>
            <p className="text-sm text-gray-600">
              오늘은 특별히 감사 예배로 진행합니다. 모든 팀원들이 미리
              연습해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
