import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function ContisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">콘티 목록</h1>
          <p className="text-gray-600">예배 콘티를 관리하고 공유하세요</p>
        </div>
        <Link href="/contis/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />새 콘티 만들기
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 콘티 카드들이 여기에 표시됩니다 */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="font-semibold text-lg mb-2">주일예배</h3>
          <p className="text-gray-600 text-sm mb-4">2024-01-15</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              보기
            </Button>
            <Button variant="outline" size="sm">
              편집
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="font-semibold text-lg mb-2">수요예배</h3>
          <p className="text-gray-600 text-sm mb-4">2024-01-17</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              보기
            </Button>
            <Button variant="outline" size="sm">
              편집
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
