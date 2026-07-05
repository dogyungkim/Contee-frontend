'use client'

import { useState } from 'react'

import type { CreateTeamSongRequest, TeamSong } from '@/types/song'
import type { Conti, ContiSong } from '@/types/conti'
import { useUpdateConti } from '@/domains/conti/hooks/use-conti'
import { useContiEditor } from '@/domains/conti/hooks/use-conti-editor'
import { useContiSharing } from '@/domains/conti/hooks/use-conti-sharing'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import { getContiApiErrorMessage } from '@/domains/conti/utils/conti-error'
import { toast } from '@/lib/toast'
import { ContiEditHeader, type ContiEditHeaderDraft } from './conti-edit-header'
import { ContiEditInfo } from './conti-edit-info'
import { ContiEditSongs } from './conti-edit-songs'
import { ContiEditorActionBar } from './conti-editor-action-bar'
import { ContiShareDialog } from './conti-share-dialog'
import { SongSearchDialog } from './song-search-dialog'

interface ContiEditContainerProps {
  conti: Conti
  permissionTeamId: string
  canManageExternalShare: boolean
  onClose: () => void
}

export function ContiEditContainer({
  conti,
  permissionTeamId,
  canManageExternalShare,
  onClose,
}: ContiEditContainerProps) {
  const { mutateAsync: updateConti } = useUpdateConti()
  const [searchOpen, setSearchOpen] = useState(false)
  const [isAddingNewSong, setIsAddingNewSong] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isWordSharingOpen, setIsWordSharingOpen] = useState(true)
  const {
    draft,
    setters,
    hasChanges,
    reset,
    createUpdateRequest,
  } = useContiEditor(conti)
  const sharing = useContiSharing({
    contiId: conti.id,
    externalShare: conti.externalShare,
    hasChanges,
  })

  useUnsavedChangesGuard({
    enabled: hasChanges && !isSaving,
  })

  const addExistingSong = (song: TeamSong) => {
    const draftId = `draft-song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setters.setSongs((current) => [
      ...current,
      {
        id: draftId,
        teamSongId: song.id,
        title: song.title,
        artist: song.artist,
        orderIndex: current.length,
        key: song.keySignature,
        bpm: song.bpm,
        note: undefined,
        youtubeUrl: song.youtubeUrl,
        sheetMusicUrl: song.sheetMusicUrl,
        songForm: [],
        teamSong: song,
      },
    ])
  }

  const addNewSong = (data: CreateTeamSongRequest) => {
    const draftId = `draft-song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()

    setters.setSongs((current) => [
      ...current,
      {
        id: draftId,
        title: data.title,
        artist: data.artist,
        orderIndex: current.length,
        key: data.keySignature,
        bpm: data.bpm,
        note: undefined,
        youtubeUrl: data.youtubeUrl,
        sheetMusicUrl: data.sheetMusicUrl,
        songForm:
          data.songForm?.map((part, index) => ({
            id: null,
            partOrder: index,
            partType: part.partType,
            customPartName: part.customPartName,
            repeatCount: part.repeatCount,
            barCount: part.barCount,
            note: part.note,
          })) ?? [],
        teamSong: {
          id: draftId,
          teamId: permissionTeamId,
          title: data.title,
          artist: data.artist,
          keySignature: data.keySignature,
          bpm: data.bpm,
          youtubeUrl: data.youtubeUrl,
          sheetMusicUrl: data.sheetMusicUrl,
          note: data.note,
          isFavorite: false,
          createdAt: now,
          updatedAt: now,
        },
      },
    ])
  }

  const removeSong = (songId: string) => {
    setters.setSongs((current) =>
      current
        .filter((song) => song.id !== songId)
        .map((song, index) => ({ ...song, orderIndex: index })),
    )
  }

  const changeSong = (changedSong: ContiSong) => {
    setters.setSongs((current) =>
      current.map((song) => (song.id === changedSong.id ? changedSong : song)),
    )
  }

  const cancel = () => {
    reset(conti)
    setIsAddingNewSong(false)
    onClose()
  }

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error('콘티 제목을 입력해주세요.')
      return
    }

    const request = createUpdateRequest()
    if (!request) return

    setIsSaving(true)
    try {
      await updateConti({ contiId: conti.id, request })
      toast.success('콘티 정보를 저장했습니다.')
      onClose()
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '콘티 정보 저장에 실패했습니다.'))
      setIsSaving(false)
    }
  }

  const shareMenuProps = {
    externalShareEnabled: !!conti.externalShare?.enabled,
    canManageExternalShare,
    hasChanges,
    isEnabling: sharing.isEnabling,
    isDisabling: sharing.isDisabling,
    onCopyTeamShare: () => {
      void sharing.copyTeamShare()
    },
    onCopyExternalShare: () => {
      void sharing.copyExternalShare()
    },
    onRequestExternalShare: sharing.setDialogMode,
  }

  return (
    <div className="flex flex-col gap-6">
      <ContiEditHeader
        draft={{
          title: draft.title,
          date: draft.date,
          period: draft.period,
          hour: draft.hour,
          minute: draft.minute,
        }}
        songCount={draft.songs.length}
        shareMenuProps={shareMenuProps}
        onDraftChange={(patch: Partial<ContiEditHeaderDraft>) => {
          if (patch.title !== undefined) setters.setTitle(patch.title)
          if ('date' in patch) setters.setDate(patch.date)
          if (patch.period !== undefined) setters.setPeriod(patch.period)
          if (patch.hour !== undefined) setters.setHour(patch.hour)
          if (patch.minute !== undefined) setters.setMinute(patch.minute)
        }}
      />

      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <ContiEditInfo
          memo={draft.memo}
          sharingInfo={draft.sharingInfo}
          bibleVerseReference={draft.bibleVerseReference}
          bibleVerseContent={draft.bibleVerseContent}
          isWordSharingOpen={isWordSharingOpen}
          onWordSharingOpenChange={setIsWordSharingOpen}
          onMemoChange={setters.setMemo}
          onBibleVerseReferenceChange={setters.setBibleVerseReference}
          onBibleVerseContentChange={setters.setBibleVerseContent}
          onSharingInfoChange={setters.setSharingInfo}
        />

        <ContiEditSongs
          songs={draft.songs}
          isAddingNewSong={isAddingNewSong}
          onAddingNewSongChange={setIsAddingNewSong}
          onAddNewSong={addNewSong}
          onOpenSearch={() => {
            setIsAddingNewSong(false)
            setSearchOpen(true)
          }}
          onRemoveSong={removeSong}
          onUpdateOrder={setters.setSongs}
          onChangeSong={changeSong}
        />
      </div>

      <SongSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(song) => {
          addExistingSong(song)
          setIsAddingNewSong(false)
          setSearchOpen(false)
        }}
        existingSongIds={draft.songs
          .map((song) => song.teamSongId)
          .filter(Boolean) as string[]}
      />

      <ContiEditorActionBar
        hasChanges={hasChanges}
        isSaving={isSaving}
        onCancel={cancel}
        onSave={() => {
          void save()
        }}
      />

      <ContiShareDialog
        mode={sharing.dialogMode}
        isPending={sharing.isPending}
        shareUrl={sharing.createdShareUrl}
        onClose={() => sharing.setDialogMode(null)}
        onConfirm={sharing.confirmDialog}
        onCopy={() => {
          void sharing.copyCreatedExternalShare()
        }}
      />
    </div>
  )
}
