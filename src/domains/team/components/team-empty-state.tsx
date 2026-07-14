import Link from 'next/link'
import { Plus, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function TeamEmptyState() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
          <Users className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="type-card-title mb-2">팀이 없습니다</h3>
          <p className="type-body-sm mb-6 text-center text-muted-foreground">
            새로운 팀을 만들어 팀원들과 함께 작업을 시작하세요.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/teams/create">
              <Plus className="mr-2 h-4 w-4" />
              첫 팀 만들기
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
