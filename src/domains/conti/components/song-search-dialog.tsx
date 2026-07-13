'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useTeamSongs } from '@/domains/song/hooks/use-songs'
import { useTeam } from '@/context/team-context'
import { TeamSong } from '@/types/song'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { SongSearchCard } from './song-search-card'
interface SongSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (song: TeamSong) => void
  existingSongIds: string[]  // 이미 추가된 곡은 비활성화
  initialTab?: 'team' | 'new'
}
export function SongSearchDialog({
  open,
  onOpenChange,
  onSelect,
  existingSongIds,
}: SongSearchDialogProps) {
  const { selectedTeamId } = useTeam()
  const { data: teamSongs = [], isLoading } = useTeamSongs(selectedTeamId)
  const [searchQuery, setSearchQuery] = useState('')

  // 검색 필터링
  const filteredSongs = teamSongs.filter(song => {
    const query = searchQuery.toLowerCase()
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query) ||
      song.keySignature?.toLowerCase().includes(query) ||
      song.bpm?.toString().includes(query)
    )
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-3xl flex-col overflow-hidden p-0 sm:h-[min(720px,calc(100dvh-2rem))] sm:max-w-3xl">
        <DialogHeader className="shrink-0 px-4 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle>곡 추가하기</DialogTitle>
          <DialogDescription>
            팀 곡 목록에서 콘티에 추가할 곡을 선택하세요.
          </DialogDescription>
        </DialogHeader>
        {/* 검색바 */}
        <div className="shrink-0 px-4 pb-3 sm:px-6 sm:pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="곡명, 아티스트, 키, BPM으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="곡 검색"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 px-4 pb-4 sm:px-6 sm:pb-6">
            <ScrollArea className="h-full min-h-0 pr-2 sm:pr-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : filteredSongs.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? '검색 결과가 없습니다.' : '등록된 곡이 없습니다.'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {searchQuery ? '다른 검색어를 입력해보세요.' : '먼저 곡 라이브러리에 곡을 등록해보세요.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSongs.map(song => (
                    <SongSearchCard
                      key={song.id}
                      song={song}
                      isDisabled={existingSongIds.includes(song.id)}
                      onSelect={() => onSelect(song)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
