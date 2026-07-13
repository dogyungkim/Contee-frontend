'use client'

import { MoreVertical, Music, Pencil, Search, Star, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { TeamSong } from '@/types/song'

interface SongLibraryListProps {
  songs: TeamSong[]
  filteredSongs: TeamSong[]
  isLoading: boolean
  query: string
  favoritesOnly: boolean
  canEdit: boolean
  isDeleting: boolean
  onQueryChange: (query: string) => void
  onToggleFavoritesOnly: () => void
  onSelectSong: (song: TeamSong) => void
  onToggleFavorite: (song: TeamSong) => void
  onEditSong: (song: TeamSong) => void
  onDeleteSong: (song: TeamSong) => void
}

export function SongLibraryList({
  songs,
  filteredSongs,
  isLoading,
  query,
  favoritesOnly,
  canEdit,
  isDeleting,
  onQueryChange,
  onToggleFavoritesOnly,
  onSelectSong,
  onToggleFavorite,
  onEditSong,
  onDeleteSong,
}: SongLibraryListProps) {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg">팀 레퍼토리</CardTitle>
            <CardDescription className="mt-1">
              총 {songs.length}곡 중 {filteredSongs.length}곡을 표시합니다.
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="곡명, 아티스트, Key, BPM 검색"
                className="pl-9"
                aria-label="곡 검색"
              />
            </div>
            <Button
              type="button"
              variant={favoritesOnly ? 'default' : 'outline'}
              aria-pressed={favoritesOnly}
              onClick={onToggleFavoritesOnly}
            >
              <Star className={favoritesOnly ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
              즐겨찾기
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <SongLibraryEmptyState query={query} favoritesOnly={favoritesOnly} canEdit={canEdit} />
        ) : (
          <div className="divide-y divide-border">
            {filteredSongs.map((song) => (
              <SongLibraryRow
                key={song.id}
                song={song}
                canEdit={canEdit}
                isDeleting={isDeleting}
                onSelectSong={onSelectSong}
                onToggleFavorite={onToggleFavorite}
                onEditSong={onEditSong}
                onDeleteSong={onDeleteSong}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SongLibraryEmptyState({
  query,
  favoritesOnly,
  canEdit,
}: Pick<SongLibraryListProps, 'query' | 'favoritesOnly' | 'canEdit'>) {
  const hasFilter = query || favoritesOnly

  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-neutral-50">
        <Music className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          {hasFilter ? '조건에 맞는 곡이 없습니다.' : '등록된 곡이 없습니다.'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasFilter
            ? '검색어나 즐겨찾기 필터를 조정해보세요.'
            : canEdit
              ? '곡 추가 버튼으로 첫 곡을 등록해보세요.'
              : '팀 편집자가 곡을 등록하면 이곳에 표시됩니다.'}
        </p>
      </div>
    </div>
  )
}

interface SongLibraryRowProps {
  song: TeamSong
  canEdit: boolean
  isDeleting: boolean
  onSelectSong: (song: TeamSong) => void
  onToggleFavorite: (song: TeamSong) => void
  onEditSong: (song: TeamSong) => void
  onDeleteSong: (song: TeamSong) => void
}

function SongLibraryRow({
  song,
  canEdit,
  isDeleting,
  onSelectSong,
  onToggleFavorite,
  onEditSong,
  onDeleteSong,
}: SongLibraryRowProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('button, [role="menuitem"]')) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectSong(song)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="grid cursor-pointer gap-3 px-6 py-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none md:grid-cols-[minmax(0,1fr)_120px_120px_88px] md:items-center"
      onClick={() => onSelectSong(song)}
      onKeyDown={handleKeyDown}
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{song.title}</p>
          {song.isFavorite && <Badge variant="outline">즐겨찾기</Badge>}
        </div>
        {song.artist && <p className="mt-1 text-xs text-muted-foreground">{song.artist}</p>}
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="font-mono text-xs">{song.keySignature || '-'} Key</span>
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="font-mono text-xs">{song.bpm || '-'} BPM</span>
      </div>
      <div
        className="flex items-center justify-end gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        {canEdit && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`${song.title} 즐겨찾기 ${song.isFavorite ? '해제' : '추가'}`}
              onClick={() => onToggleFavorite(song)}
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
                <DropdownMenuItem onClick={() => onEditSong(song)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  상세 및 송폼 수정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isDeleting}
                  onClick={() => onDeleteSong(song)}
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
  )
}
