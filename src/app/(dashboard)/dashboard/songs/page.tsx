'use client'

import { useMemo, useState } from 'react'
import { Music, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeam } from '@/context/team-context'
import { useTeamSongs } from '@/domains/song/hooks/use-songs'

export default function SongsPage() {
  const { selectedTeamId, selectedTeam, isLoading: isTeamLoading } = useTeam()
  const { data: songs = [], isLoading: isSongsLoading } = useTeamSongs(selectedTeamId)
  const [query, setQuery] = useState('')

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return songs

    return songs.filter((song) =>
      song.title.toLowerCase().includes(normalizedQuery) ||
      song.artist?.toLowerCase().includes(normalizedQuery) ||
      song.keySignature?.toLowerCase().includes(normalizedQuery) ||
      song.bpm?.toString().includes(normalizedQuery)
    )
  }, [query, songs])

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
      <div>
        <div className="text-caption-upper text-muted-foreground">Song library</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">곡 관리</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {selectedTeam.name} 팀의 곡을 검색하고 콘티 작성에 필요한 메타데이터를 확인합니다.
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">팀 곡 라이브러리</CardTitle>
              <CardDescription className="mt-1">
                총 {songs.length}곡 중 {filteredSongs.length}곡을 표시합니다.
              </CardDescription>
            </div>
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
                  {query ? '검색 결과가 없습니다.' : '등록된 곡이 없습니다.'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {query ? '다른 검색어를 입력해보세요.' : '콘티 작성 화면에서 새 찬양을 등록하면 이곳에도 표시됩니다.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredSongs.map((song) => (
                <div key={song.id} className="grid gap-3 px-6 py-4 md:grid-cols-[minmax(0,1fr)_120px_120px] md:items-center">
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
