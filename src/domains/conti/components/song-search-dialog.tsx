'use client'
import { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  initialTab = 'team'
}: SongSearchDialogProps) {
  const { selectedTeamId } = useTeam()
  const { data: teamSongs = [], isLoading } = useTeamSongs(selectedTeamId)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'team' | 'new'>(initialTab)

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
    }
  }, [open, initialTab])

  // 검색 필터링
  const filteredSongs = teamSongs.filter(song => {
    const query = searchQuery.toLowerCase()
    return (
      song.customTitle.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query) ||
      song.keySignature?.toLowerCase().includes(query) ||
      song.bpm?.toString().includes(query)
    )
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>곡 추가하기</DialogTitle>
          <DialogDescription>
            팀 곡 목록에서 선택하거나 새로운 곡을 등록하세요.
          </DialogDescription>
        </DialogHeader>
        {/* 검색바 */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="곡명, 아티스트, 키, BPM으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'team' | 'new')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 w-fit">
            <TabsTrigger value="team">팀 곡 목록</TabsTrigger>
            <TabsTrigger value="new">새 곡 등록</TabsTrigger>
          </TabsList>
          {/* 팀 곡 목록 탭 */}
          <TabsContent value="team" className="flex-1 min-h-0 mt-4 px-6 pb-6">
            <ScrollArea className="h-full pr-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : filteredSongs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? '검색 결과가 없습니다.' : '등록된 곡이 없습니다.'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {searchQuery ? '다른 검색어를 입력해보세요.' : '새 곡 등록 탭에서 곡을 추가해보세요.'}
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
          </TabsContent>
          {/* 새 곡 등록 탭 */}
          <TabsContent value="new" className="flex-1 min-h-0 mt-4 px-6 pb-6">
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                새 곡 등록 기능은 곧 추가될 예정입니다.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                현재는 팀 곡 목록에서만 선택할 수 있습니다.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}