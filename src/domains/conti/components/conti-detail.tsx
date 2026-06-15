'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Settings, LayoutList, Share2, Info, Music, BookOpen, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import {
  useContiDetail,
  useAddContiSong,
  useRemoveContiSong,
  useUpdateContiSongOrder,
} from '../hooks/use-conti'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ContiSongList } from './conti-song-list'
import { SongSearchDialog } from './song-search-dialog'
import { TeamSong } from '@/types/song'
import { ContiSong } from '@/types/conti'
import { useTeam } from '@/context/team-context'
import { useTeamMembersQuery } from '@/domains/team/hooks/use-team-query'
import { useAuth } from '@/domains/auth/hooks/use-auth'
import { toast } from '@/lib/toast'
import { getContiApiErrorMessage } from '@/domains/conti/utils/conti-error'

interface ContiDetailProps {
  contiId: string
}

export function ContiDetail({ contiId }: ContiDetailProps) {
  const { selectedTeamId } = useTeam()
  const { user } = useAuth()
  const { data: conti, isLoading: isContiLoading, refetch: refetchConti } = useContiDetail(contiId)
  // Songs are included in the conti detail response
  const songs = conti?.contiSongs || []
  const permissionTeamId = conti?.teamId || selectedTeamId || ''
  const { data: teamMembers = [] } = useTeamMembersQuery(permissionTeamId)

  const { mutateAsync: addSongMutateAsync } = useAddContiSong()
  const { mutateAsync: removeSongMutateAsync } = useRemoveContiSong()
  const { mutateAsync: updateOrderMutateAsync } = useUpdateContiSongOrder()

  const [searchOpen, setSearchOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(true)

  const currentMember = teamMembers.find((member) => member.userId === String(user?.id))
  const canEdit = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN'
  const isEditable = canEdit && isEditMode

  if (isContiLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
        <p className="text-sm font-medium">콘티 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!conti) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-xl border-dashed bg-muted/5">
        <Info className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">콘티를 찾을 수 없습니다.</p>
        <Button variant="link" asChild className="mt-2">
            <Link href="/dashboard/contis">목록으로 돌아가기</Link>
        </Button>
      </div>
    )
  }

  const handleSelectExisting = async (song: TeamSong) => {
    if (!isEditable) {
      toast.error('편집 권한이 없거나 보기 모드입니다.')
      return
    }

    try {
      await addSongMutateAsync({
        contiId,
        request: {
          teamSongId: song.id,
          customKeySignature: song.keySignature,
          customBpm: song.bpm,
        },
      })
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '곡 추가에 실패했습니다.'))
      console.error('Failed to add song:', error)
      void refetchConti()
    }
  }

  const handleRemoveSong = async (songId: string) => {
    if (!isEditable) {
      toast.error('편집 권한이 없거나 보기 모드입니다.')
      return
    }

    try {
      await removeSongMutateAsync({ contiId, contiSongId: songId })
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '곡 삭제에 실패했습니다.'))
      console.error('Failed to remove song:', error)
      void refetchConti()
    }
  }

  const handleUpdateOrder = async (reorderedSongs: ContiSong[]) => {
    if (!isEditable) {
      toast.error('편집 권한이 없거나 보기 모드입니다.')
      return
    }

    try {
      const songIds = reorderedSongs.map((song) => song.id)
      await updateOrderMutateAsync({
        contiId,
        songIds,
      })
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '곡 순서 변경에 실패했습니다.'))
      console.error('Failed to update song order:', error)
      void refetchConti()
    }
  }

  const handleOpenSearch = () => {
    if (!isEditable) {
      toast.error('편집 권한이 없거나 보기 모드입니다.')
      return
    }
    setSearchOpen(true)
  }

  const bibleVerseLines = conti.bibleVerse
    ? conti.bibleVerse
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : []
  const bibleVerseReference = bibleVerseLines[0]
  const bibleVerseContent = bibleVerseLines.slice(1).join('\n')

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col -m-6 sm:-m-8">
      {/* Top Header Section */}
      <div className="bg-background border-b px-6 sm:px-8 py-4 shrink-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <LayoutList className="h-3 w-3" />
              Service Continuity Editor
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{conti.title}</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-semibold text-primary/80">
                {format(new Date(conti.worshipDate), 'yyyy. MM. dd (EEE)', { locale: ko })}
              </span>
              <Separator orientation="vertical" className="h-3" />
              <span className="flex items-center gap-1">
                총 <span className="font-bold text-foreground">{songs.length}</span>곡
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {isEditable && (
              <Button className="h-9 gap-2" onClick={handleOpenSearch}>
                <Plus className="h-4 w-4" />
                곡 추가
              </Button>
            )}
            {canEdit && (
              <Button
                variant={isEditMode ? 'default' : 'outline'}
                size="sm"
                className="h-9 gap-2"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{isEditMode ? '편집 중' : '보기 모드'}</span>
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">공유</span>
            </Button>

          </div>
        </div>
      </div>

      {/* Main Content: Full Width Song List */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 max-w-[1200px] mx-auto w-full">
        {/* Summary Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-neutral-500 mb-1">콘티명</p>
              <p className="font-medium">{conti.title}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">예배일</p>
              <p className="font-medium">{format(new Date(conti.worshipDate), 'yyyy. MM. dd (EEE)', { locale: ko })}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">예배 시간</p>
              <p className="font-medium">-</p>
            </div>
          </div>
          {conti.memo && (
            <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
              <div>
                <p className="text-xs text-amber-600 mb-1 font-bold">특이사항</p>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{conti.memo}</p>
              </div>
            </div>
          )}
        </div>

        {(conti.bibleVerse || conti.sharingInfo) && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-white">
                  <BookOpen className="h-4 w-4 text-sky-700" />
                </div>
                <h3 className="text-sm font-bold text-sky-900">말씀 & 나눔</h3>
              </div>
            </div>
            <div className="space-y-4">
              {conti.bibleVerse && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                  <p className="mb-1 text-xs font-bold text-emerald-800">본문</p>
                  {bibleVerseReference && (
                    <p className="text-sm font-semibold text-emerald-900">{bibleVerseReference}</p>
                  )}
                  {bibleVerseContent && (
                    <p className="mt-1 text-sm text-emerald-950/80 leading-relaxed whitespace-pre-wrap">{bibleVerseContent}</p>
                  )}
                </div>
              )}
              {conti.sharingInfo && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
                  <p className="mb-1 text-xs font-bold text-amber-800">나눔</p>
                  <p className="text-sm text-amber-950/80 leading-relaxed whitespace-pre-wrap">{conti.sharingInfo}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-neutral-500" />
              <h3 className="font-semibold text-neutral-900">곡 목록</h3>
            </div>
          </div>

          <ContiSongList
            contiId={contiId}
            songs={songs}
            isEditMode={isEditable}
            onRemove={(songId) => {
              void handleRemoveSong(songId)
            }}
            onUpdateOrder={handleUpdateOrder}
          />

          {isEditable && (
            <Button
              variant="outline"
              className="w-full border-dashed py-10 bg-muted/5 hover:bg-muted/10 group transition-all"
              onClick={handleOpenSearch}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-dashed flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">새로운 찬양 추가하기</span>
              </div>
            </Button>
          )}
        </div>
      </div>

      <SongSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(song) => {
          void handleSelectExisting(song)
          setSearchOpen(false)
        }}
        existingSongIds={songs.map((song) => song.teamSongId).filter(Boolean) as string[]}
      />
    </div>
  )
}
