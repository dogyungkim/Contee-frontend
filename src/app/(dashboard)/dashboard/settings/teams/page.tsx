'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function TeamCreatePage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: API 연동 시 teamService.create 호출
    alert('팀 생성은 아직 API에 연결되지 않았습니다.')
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">팀 추가</h1>
          <p className="text-sm text-muted-foreground">새로운 팀을 생성해 관리하세요.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/settings">설정으로 돌아가기</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>팀 정보</CardTitle>
          <CardDescription>이름과 설명을 입력하면 팀을 만들 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="team-name">팀 이름</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 메인 팀"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-desc">설명 (선택)</Label>
              <Textarea
                id="team-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예) 주일/수요예배 메인 팀"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                팀 추가하기
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/settings">취소</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

