'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SongLibraryHeaderProps {
  teamName: string
  canEdit: boolean
  onCreateSong: () => void
}

export function SongLibraryHeader({ teamName, canEdit, onCreateSong }: SongLibraryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-caption-upper text-muted-foreground">Song library</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">곡 라이브러리</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {teamName} 팀에서 사용하는 곡과 연습 자료를 모아둡니다.
        </p>
      </div>
      {canEdit && (
        <Button onClick={onCreateSong}>
          <Plus className="h-4 w-4" />
          곡 추가
        </Button>
      )}
    </div>
  )
}
