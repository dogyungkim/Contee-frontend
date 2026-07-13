'use client'

import { useMemo, useState } from 'react'

import { useTeam } from '@/context/team-context'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { getContiApiErrorMessage } from '@/domains/conti/utils/conti-error'
import { SongDetailDialog } from '@/domains/song/components/song-detail-dialog'
import { SongEditorDialog, type SongEditorState } from '@/domains/song/components/song-editor-dialog'
import { SongLibraryHeader } from '@/domains/song/components/song-library-header'
import { SongLibraryList } from '@/domains/song/components/song-library-list'
import {
  useCreateTeamSong,
  useDeleteTeamSong,
  useSongForm,
  useTeamSongs,
  useUpdateSongForm,
  useUpdateTeamSong,
} from '@/domains/song/hooks/use-songs'
import { filterSongLibrary, findDuplicateSong } from '@/domains/song/utils/song-library'
import { mapApiSongFormToUi } from '@/domains/song/utils/song-form'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import { canEditTeamContent } from '@/domains/team/utils/team-permissions'
import { useConfirmAction } from '@/hooks/use-confirm-action'
import { toast } from '@/lib/toast'
import type { CreateTeamSongRequest, TeamSong, UpdateTeamSongRequest } from '@/types/song'

const toUpdateRequest = (request: CreateTeamSongRequest): UpdateTeamSongRequest => ({
  title: request.title.trim(),
  artist: request.artist?.trim(),
  keySignature: request.keySignature,
  bpm: request.bpm,
  ccliNumber: request.ccliNumber,
  youtubeUrl: request.youtubeUrl,
  sheetMusicUrl: request.sheetMusicUrl,
  note: request.note,
})

export default function SongsPage() {
  const { selectedTeamId, selectedTeam, isLoading: isTeamLoading } = useTeam()
  const { user } = useAuth()
  const { data: members = [] } = useTeamMembersQuery(selectedTeamId || '')
  const { data: songs = [], isLoading: isSongsLoading } = useTeamSongs(selectedTeamId)
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [editor, setEditor] = useState<SongEditorState>(null)
  const [detailSong, setDetailSong] = useState<TeamSong | null>(null)

  const editingSong = editor?.mode === 'edit' ? editor.song : null
  const songFormTarget = editingSong ?? detailSong
  const { data: songForm, isLoading: isSongFormLoading } = useSongForm(
    selectedTeamId,
    songFormTarget?.id ?? null,
  )
  const { mutateAsync: createSong, isPending: isCreating } = useCreateTeamSong()
  const { mutateAsync: updateSong, isPending: isUpdating } = useUpdateTeamSong()
  const { mutateAsync: updateSongForm, isPending: isUpdatingForm } = useUpdateSongForm()
  const { mutateAsync: deleteSong, isPending: isDeleting } = useDeleteTeamSong()
  const { confirmAction } = useConfirmAction()

  const currentMember = user ? members.find((member) => member.userId === user.id) : undefined
  const canEdit = canEditTeamContent(currentMember?.role)
  const filteredSongs = useMemo(
    () => filterSongLibrary(songs, query, favoritesOnly),
    [favoritesOnly, query, songs],
  )
  const selectedSongForm = useMemo(() => mapApiSongFormToUi(songForm?.parts ?? []), [songForm])
  const isSaving = isCreating || isUpdating || isUpdatingForm

  const handleSave = async (request: CreateTeamSongRequest) => {
    if (!selectedTeamId) return

    const duplicate = findDuplicateSong(songs, request, editingSong?.id)
    if (duplicate) {
      toast.error(`이미 등록된 곡입니다: ${duplicate.title}${duplicate.artist ? ` · ${duplicate.artist}` : ''}`)
      return
    }

    try {
      if (editor?.mode === 'create') {
        await createSong({ teamId: selectedTeamId, request })
        toast.success('곡을 등록했습니다.')
      } else if (editingSong) {
        await updateSong({
          teamId: selectedTeamId,
          songId: editingSong.id,
          request: toUpdateRequest(request),
        })
        await updateSongForm({
          teamId: selectedTeamId,
          songId: editingSong.id,
          request: { parts: request.songForm ?? [] },
        })
        toast.success('곡 정보를 저장했습니다.')
      }
      setEditor(null)
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '곡 정보를 저장하지 못했습니다.'))
    }
  }

  const handleToggleFavorite = async (song: TeamSong) => {
    if (!selectedTeamId || !canEdit) return

    try {
      await updateSong({
        teamId: selectedTeamId,
        songId: song.id,
        request: { isFavorite: !song.isFavorite },
      })
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '즐겨찾기를 변경하지 못했습니다.'))
    }
  }

  const handleDelete = async (song: TeamSong) => {
    if (!selectedTeamId || !canEdit) return

    const confirmed = await confirmAction(`"${song.title}" 곡을 라이브러리에서 삭제할까요?`)
    if (!confirmed) return

    try {
      await deleteSong({ teamId: selectedTeamId, songId: song.id })
      toast.success('곡을 삭제했습니다.')
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '곡을 삭제하지 못했습니다.'))
    }
  }

  if (isTeamLoading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center space-y-3 rounded-lg border border-dashed px-4 text-center sm:min-h-[400px]">
        <p className="text-sm font-medium text-muted-foreground">팀 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!selectedTeamId || !selectedTeam) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed px-4 text-center sm:min-h-[400px]">
        <p className="text-muted-foreground">선택된 팀이 없습니다.</p>
        <p className="text-sm text-muted-foreground">먼저 팀을 선택하거나 생성해주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SongLibraryHeader
        teamName={selectedTeam.name}
        canEdit={canEdit}
        onCreateSong={() => setEditor({ mode: 'create' })}
      />

      <SongLibraryList
        songs={songs}
        filteredSongs={filteredSongs}
        isLoading={isSongsLoading}
        query={query}
        favoritesOnly={favoritesOnly}
        canEdit={canEdit}
        isDeleting={isDeleting}
        onQueryChange={setQuery}
        onToggleFavoritesOnly={() => setFavoritesOnly((value) => !value)}
        onSelectSong={setDetailSong}
        onToggleFavorite={(song) => { void handleToggleFavorite(song) }}
        onEditSong={(song) => setEditor({ mode: 'edit', song })}
        onDeleteSong={(song) => { void handleDelete(song) }}
      />

      <SongDetailDialog
        song={detailSong}
        songForm={selectedSongForm}
        isSongFormLoading={isSongFormLoading}
        canEdit={canEdit}
        onClose={() => setDetailSong(null)}
        onEdit={(song) => {
          setEditor({ mode: 'edit', song })
          setDetailSong(null)
        }}
      />

      <SongEditorDialog
        editor={editor}
        songForm={editor?.mode === 'edit' ? selectedSongForm : []}
        isSongFormLoading={editor?.mode === 'edit' && isSongFormLoading}
        isSaving={isSaving}
        onClose={() => setEditor(null)}
        onSave={(request) => { void handleSave(request) }}
      />
    </div>
  )
}
