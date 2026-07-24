import { getApiErrorMessage } from '@contee/api-client'
import { useLocalSearchParams } from 'expo-router'

import { SongEditorScreen } from '@/components/song-editor-screen'
import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useAuthSession } from '@/lib/auth-session'
import { canEditSongs } from '@/lib/song-permissions-core'
import { useMobileSongs } from '@/lib/song-read'
import { useTeamSelection } from '@/lib/team-selection'
import { useMobileTeamMembers } from '@/lib/team-read'

export default function EditSongScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const songId = typeof id === 'string' ? id : null
  const { selectedTeamId } = useTeamSelection()
  const { user } = useAuthSession()
  const songsQuery = useMobileSongs(selectedTeamId)
  const membersQuery = useMobileTeamMembers(selectedTeamId)
  if (!selectedTeamId || !songId)
    return (
      <ScreenPlaceholder
        eyebrow="곡"
        title="곡을 찾을 수 없습니다"
        description="팀을 다시 선택한 뒤 시도해 주세요."
      />
    )
  if (songsQuery.isPending || membersQuery.isPending)
    return (
      <ScreenPlaceholder
        eyebrow="곡"
        title="곡을 불러오는 중"
        description="곡 정보와 권한을 확인하고 있습니다."
      />
    )
  if (songsQuery.isError)
    return (
      <ScreenPlaceholder
        eyebrow="곡"
        title="곡을 불러오지 못했습니다"
        description={getApiErrorMessage(songsQuery.error)}
      />
    )
  const song = songsQuery.data?.content.find((item) => item.id === songId)
  if (!song)
    return (
      <ScreenPlaceholder
        eyebrow="곡"
        title="곡을 찾을 수 없습니다"
        description="목록에서 다시 선택해 주세요."
      />
    )
  return (
    <SongEditorScreen
      canEdit={canEditSongs(user?.id ?? null, membersQuery.data)}
      song={song}
      teamId={selectedTeamId}
    />
  )
}
