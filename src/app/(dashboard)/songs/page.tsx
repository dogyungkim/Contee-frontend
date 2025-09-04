import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

export default function SongsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">곡 목록</h1>
          <p className="text-gray-600">찬양곡을 관리하고 콘티에 추가하세요</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />새 곡 추가
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="곡명, 가수, 키워드로 검색..." className="pl-10" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 곡 카드들이 여기에 표시됩니다 */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="font-semibold text-lg mb-2">찬양하라</h3>
          <p className="text-gray-600 text-sm mb-2">작사/작곡: 김작곡</p>
          <div className="flex gap-2 text-xs text-gray-500 mb-4">
            <span>키: C</span>
            <span>BPM: 120</span>
            <span>장르: 찬양</span>
          </div>
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
          <h3 className="font-semibold text-lg mb-2">주님의 사랑</h3>
          <p className="text-gray-600 text-sm mb-2">작사/작곡: 이작곡</p>
          <div className="flex gap-2 text-xs text-gray-500 mb-4">
            <span>키: G</span>
            <span>BPM: 100</span>
            <span>장르: 찬양</span>
          </div>
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
          <h3 className="font-semibold text-lg mb-2">하나님의 은혜</h3>
          <p className="text-gray-600 text-sm mb-2">작사/작곡: 박작곡</p>
          <div className="flex gap-2 text-xs text-gray-500 mb-4">
            <span>키: D</span>
            <span>BPM: 110</span>
            <span>장르: 찬양</span>
          </div>
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
