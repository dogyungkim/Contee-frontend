'use client'

import { Loader2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SongDirectEditCard } from '@/domains/conti/components/song-direct-edit-card'
import type { CreateTeamSongRequest, SongFormPart, TeamSong } from '@/types/song'

export type SongEditorState =
  | { mode: 'create' }
  | { mode: 'edit'; song: TeamSong }
  | null

interface SongEditorDialogProps {
  editor: SongEditorState
  songForm: SongFormPart[]
  isSongFormLoading: boolean
  isSaving: boolean
  onClose: () => void
  onSave: (request: CreateTeamSongRequest) => void
}

export function SongEditorDialog({
  editor,
  songForm,
  isSongFormLoading,
  isSaving,
  onClose,
  onSave,
}: SongEditorDialogProps) {
  const editingSong = editor?.mode === 'edit' ? editor.song : null

  return (
    <Dialog
      open={editor !== null}
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose()
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl" showCloseButton={!isSaving}>
        <DialogHeader>
          <DialogTitle>{editor?.mode === 'create' ? '곡 추가' : '곡 상세 및 송폼 수정'}</DialogTitle>
          <DialogDescription>
            팀에서 공통으로 사용할 곡 정보와 예배 송폼을 관리합니다.
          </DialogDescription>
        </DialogHeader>

        {editingSong && isSongFormLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            곡 정보를 불러오는 중...
          </div>
        ) : editor ? (
          <SongDirectEditCard
            key={editingSong?.id ?? 'new-song'}
            variant="embedded"
            title=""
            initialValue={editingSong ?? undefined}
            initialSongForm={songForm}
            submitLabel={isSaving ? '저장 중...' : editor.mode === 'create' ? '곡 등록' : '변경사항 저장'}
            isSubmitting={isSaving}
            onCancel={onClose}
            onSave={onSave}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
