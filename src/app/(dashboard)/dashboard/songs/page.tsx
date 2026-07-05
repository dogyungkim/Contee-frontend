'use client'

import { useMemo, useState } from 'react'
import {
  Loader2,
  MoreVertical,
  Music,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeam } from '@/context/team-context'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { SongDirectEditCard } from '@/domains/conti/components/song-direct-edit-card'
import { getContiApiErrorMessage } from '@/domains/conti/utils/conti-error'
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

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; song: TeamSong }
  | null

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
  const [editor, setEditor] = useState<EditorState>(null)

  const editingSong = editor?.mode === 'edit' ? editor.song : null
  const { data: songForm, isLoading: isSongFormLoading } = useSongForm(
    selectedTeamId,
    editingSong?.id ?? null,
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
      <div className="flex h-[400px] flex-col items-center justify-center space-y-3 rounded-lg border border-dashed text-center">
        <p className="text-sm font-medium text-muted-foreground">팀 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!selectedTeamId || !selectedTeam) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed text-center">
        <p className="text-muted-foreground">선택된 팀이 없습니다.</p>
        <p className="text-sm text-muted-foreground">먼저 팀을 선택하거나 생성해주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-caption-upper text-muted-foreground">Song library</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">곡 관리</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedTeam.name} 팀의 곡과 송폼을 관리합니다.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setEditor({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            곡 추가
          </Button>
        )}
      </div>

      <Card className="overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">팀 곡 라이브러리</CardTitle>
              <CardDescription className="mt-1">
                총 {songs.length}곡 중 {filteredSongs.length}곡을 표시합니다.
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="곡명, 아티스트, Key, BPM 검색"
                  className="pl-9"
                  aria-label="곡 검색"
                />
              </div>
              <Button
                type="button"
                variant={favoritesOnly ? 'default' : 'outline'}
                aria-pressed={favoritesOnly}
                onClick={() => setFavoritesOnly((value) => !value)}
              >
                <Star className={favoritesOnly ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                즐겨찾기
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {isSongsLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-neutral-50">
                <Music className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {query || favoritesOnly ? '조건에 맞는 곡이 없습니다.' : '등록된 곡이 없습니다.'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {query || favoritesOnly
                    ? '검색어나 즐겨찾기 필터를 조정해보세요.'
                    : canEdit
                      ? '곡 추가 버튼으로 첫 곡을 등록해보세요.'
                      : '팀 편집자가 곡을 등록하면 이곳에 표시됩니다.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  className="grid gap-3 px-6 py-4 md:grid-cols-[minmax(0,1fr)_120px_120px_88px] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{song.title}</p>
                      {song.isFavorite && <Badge variant="outline">즐겨찾기</Badge>}
                    </div>
                    {song.artist && <p className="mt-1 text-xs text-muted-foreground">{song.artist}</p>}
                    {song.note && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{song.note}</p>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-mono text-xs">{song.keySignature || '-'} Key</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-mono text-xs">{song.bpm || '-'} BPM</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    {canEdit && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`${song.title} 즐겨찾기 ${song.isFavorite ? '해제' : '추가'}`}
                          onClick={() => { void handleToggleFavorite(song) }}
                        >
                          <Star className={song.isFavorite ? 'h-4 w-4 fill-current text-amber-500' : 'h-4 w-4'} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" aria-label={`${song.title} 메뉴`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditor({ mode: 'edit', song })}>
                              <Pencil className="mr-2 h-4 w-4" />
                              상세 및 송폼 수정
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              disabled={isDeleting}
                              onClick={() => { void handleDelete(song) }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open && !isSaving) setEditor(null)
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
              initialSongForm={mapApiSongFormToUi(songForm?.parts ?? [])}
              submitLabel={isSaving ? '저장 중...' : editor.mode === 'create' ? '곡 등록' : '변경사항 저장'}
              isSubmitting={isSaving}
              onCancel={() => setEditor(null)}
              onSave={(request) => { void handleSave(request) }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
