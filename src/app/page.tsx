import { Button } from '@/components/ui/button'
import { FileText, Music, Users, Settings } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Contee에 오신 것을 환영합니다
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          찬양팀을 위한 콘티 작성 및 공유 서비스
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/contis">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="h-5 w-5 mr-2" />
              콘티 시작하기
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              로그인
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <div className="text-center p-6 bg-card rounded-lg border shadow-sm">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">콘티 관리</h3>
          <p className="text-muted-foreground text-sm">
            예배 콘티를 쉽게 작성하고 관리하세요
          </p>
        </div>
        <div className="text-center p-6 bg-card rounded-lg border shadow-sm">
          <Music className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">곡 데이터베이스</h3>
          <p className="text-muted-foreground text-sm">
            찬양곡 정보를 체계적으로 관리하세요
          </p>
        </div>
        <div className="text-center p-6 bg-card rounded-lg border shadow-sm">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">팀 협업</h3>
          <p className="text-muted-foreground text-sm">
            팀원들과 실시간으로 콘티를 공유하세요
          </p>
        </div>
        <div className="text-center p-6 bg-card rounded-lg border shadow-sm">
          <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">맞춤 설정</h3>
          <p className="text-muted-foreground text-sm">
            팀에 맞는 설정으로 최적화하세요
          </p>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          지금 시작해보세요
        </h2>
        <p className="text-muted-foreground mb-6">
          무료로 가입하고 찬양팀의 예배 준비를 더욱 효율적으로 만들어보세요
        </p>
        <Link href="/register">
          <Button size="lg">무료로 시작하기</Button>
        </Link>
      </div>
    </div>
  )
}
