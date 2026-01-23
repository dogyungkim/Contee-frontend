'use client'

import { useState } from 'react'
import { Plus, Settings, LayoutList, Share2, Info, Music } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { 
  useContiDetail, 
  useContiSongs, 
  useAddContiSong, 
  useRemoveContiSong,
  useUpdateContiSongOrder 
} from '../hooks/use-conti'
import { useCreateTeamSong } from '@/domains/song/hooks/use-songs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { ContiSongList } from './conti-song-list'
// import { SongSearchDialog } from './song-search-dialog'
// import { SongCreateDialog } from './song-create-dialog'
import { TeamSong, CreateTeamSongRequest, Song } from '@/types/song'
import { ContiSong } from '@/types/conti'
import { useTeam } from '@/context/team-context'

interface ContiDetailProps {
  contiId: string
}

export function ContiDetail({ contiId }: ContiDetailProps) {
  const { selectedTeamId } = useTeam()
  const { data: conti, isLoading: isContiLoading } = useContiDetail(contiId)
  const { data: songs = [], isLoading: isSongsLoading } = useContiSongs(contiId)
  
  const { mutate: addSongMutate } = useAddContiSong()
  const { mutate: removeSongMutate } = useRemoveContiSong()
  const { mutate: createSongMutate, isPending: isCreatingSong } = useCreateTeamSong()
  const { mutateAsync: updateOrderMutateAsync } = useUpdateContiSongOrder()

  const [searchOpen, setSearchOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [initialTitle, setInitialTitle] = useState('')
  const [isEditMode, setIsEditMode] = useState(true)

  // TODO: Replace with actual permission check based on user role
  // For now, we'll allow editing for everyone
  // In the future: check if user role is OWNER or ADMIN
  const canEdit = true // selectedTeam?.role === 'OWNER' || selectedTeam?.role === 'ADMIN'

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
            <a href="/dashboard/contis">목록으로 돌아가기</a>
        </Button>
      </div>
    )
  }

  const handleSelectExisting = (song: TeamSong) => {
    const nextOrder = songs.length > 0 
      ? Math.max(...songs.map(s => s.orderIndex)) + 1 
      : 0
    
    addSongMutate({
      contiId,
      request: {
        teamSongId: song.id,
        orderIndex: nextOrder,
        customKeySignature: song.keySignature,
        customBpm: song.bpm
      }
    })
  }

  const handleSelectMaster = (song: Song) => {
    if (!selectedTeamId) return

    createSongMutate({
      teamId: selectedTeamId,
      request: {
        songId: song.id,
        customTitle: song.title,
        artist: song.artist,
        customKeySignature: song.keySignature,
        customBpm: song.bpm,
        youtubeUrl: song.youtubeUrl,
        sheetMusicUrl: song.sheetMusicUrl
      }
    }, {
      onSuccess: (newSong) => {
        handleSelectExisting(newSong)
      }
    })
  }

  const handleCreateNew = (query: string) => {
    setInitialTitle(query)
    setSearchOpen(false)
    setCreateOpen(true)
  }

  const handleCreateSubmit = (data: CreateTeamSongRequest) => {
    if (!selectedTeamId) return

    createSongMutate({
      teamId: selectedTeamId,
      request: data
    }, {
      onSuccess: (newSong) => {
        handleSelectExisting(newSong)
        setCreateOpen(false)
      }
    })
  }

  const handleUpdateOrder = async (reorderedSongs: ContiSong[]) => {
    try {
      const songIds = reorderedSongs.map(s => s.id)
      await updateOrderMutateAsync({
        contiId,
        songIds
      })
    } catch (error) {
      console.error('Failed to update song order:', error)
    }
  }

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
            <h2 className="text-xl font-bold tracking-tight">{conti.title}</h2>
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
            {canEdit && (
              <Button 
                variant={isEditMode ? "default" : "outline"} 
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
            {isEditMode && (
              <Button className="h-9 gap-2" onClick={() => setSearchOpen(true)}>
                <Plus className="h-4 w-4" />
                곡 추가
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Full Width Song List */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 max-w-[1200px] mx-auto w-full">
         {/* Summary Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-neutral-500 mb-1">예배명</p>
                <p className="font-medium">{conti.title}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">날짜</p>
                <p className="font-medium">{format(new Date(conti.worshipDate), 'yyyy년 M월 d일')}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">시간</p>
                <p className="font-medium">{format(new Date(conti.worshipDate), 'a h:mm', { locale: ko })}</p>
              </div>
               {/* Placeholder for future fields */}
              <div>
                 <p className="text-xs text-neutral-500 mb-1">상태</p>
                 <span className="inline-block px-2 py-0.5 text-xs bg-emerald-50 text-emerald-600 rounded font-medium">준비중</span>
              </div>
            </div>
            {conti.memo && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-xs text-amber-600 mb-1 font-bold">특이사항</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{conti.memo}</p>
              </div>
            )}
          </div>

        <div className="space-y-4 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Music className="h-4 w-4 text-neutral-500" />
               <h3 className="font-semibold text-neutral-900">곡 목록</h3>
            </div>
          </div>
          
          <ContiSongList 
            songs={songs} 
            isEditMode={isEditMode}
            onRemove={(songId) => {
              removeSongMutate({ contiId, contiSongId: songId })
            }}
            onUpdateOrder={handleUpdateOrder} 
          />
          
          {isEditMode && (
            <Button 
              variant="outline" 
              className="w-full border-dashed py-10 bg-muted/5 hover:bg-muted/10 group transition-all"
              onClick={() => setSearchOpen(true)}
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

      {/* Dialogs */}
      {/* TODO: Implement SongSearchDialog and SongCreateDialog */}
      {/* <SongSearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
        onSelect={(song, isMasterSong) => {
          if (!isMasterSong) {
            handleSelectExisting(song as TeamSong)
          } else {
             handleSelectMaster(song as Song)
          }
        }}
        onCreateNew={handleCreateNew}
        existingSongIds={songs.map(s => s.teamSongId)}
      />

      <SongCreateDialog 
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateSubmit}
        isLoading={isCreatingSong}
        initialTitle={initialTitle}
      /> */}
    </div>
  )
}
