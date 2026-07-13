'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function TeamEmptyState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md rounded-2xl">
        <CardContent className="flex flex-col items-center gap-5 px-4 py-10 text-center sm:gap-6 sm:p-12">
          <div className="rounded-full bg-primary/10 p-5 sm:p-6">
            <Users className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
          </div>
          
          <div className="space-y-2">
            <h2 className="type-section-title">
              환영합니다! 먼저 팀을 만들어보세요.
            </h2>
            <p className="text-sm text-muted-foreground">
              Contee를 시작하려면 팀이 필요합니다.<br />
              찬양팀을 위한 워크스페이스를 만들어보세요.
            </p>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard/teams/create">팀 만들기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
