import { SongEditorScreen } from '@/components/song-editor-screen'
import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { useAuthSession } from '@/lib/auth-session'
import { canEditSongs } from '@/lib/song-permissions-core'
import { useTeamSelection } from '@/lib/team-selection'
import { useMobileTeamMembers } from '@/lib/team-read'

export default function CreateSongScreen() {
  const { selectedTeamId } = useTeamSelection()
  const { user } = useAuthSession()
  const membersQuery = useMobileTeamMembers(selectedTeamId)
  if (!selectedTeamId)
    return (
      <ScreenPlaceholder
        eyebrow="곡"
        title="팀을 선택해 주세요"
        description="곡을 등록할 팀을 먼저 선택해 주세요."
      />
    )
  if (membersQuery.isPending)
    return (
      <ScreenPlaceholder
        eyebrow="곡"
        title="권한 확인 중"
        description="곡 등록 권한을 확인하고 있습니다."
      />
    )
  return (
    <SongEditorScreen
      canEdit={canEditSongs(user?.id ?? null, membersQuery.data)}
      teamId={selectedTeamId}
    />
  )
}
