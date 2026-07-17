import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { TeamSelectionPanel } from '@/components/team-selection-panel'
import { useTeamSelection } from '@/lib/team-selection'

export default function SongsScreen() {
  const { isLoading, selectedTeam } = useTeamSelection()

  return (
    <ScreenPlaceholder
      eyebrow="Read-only MVP"
      title="곡"
      description={
        isLoading
          ? '팀 정보를 불러온 뒤 곡 라이브러리를 연결합니다.'
          : selectedTeam
            ? `${selectedTeam.name} 팀의 곡 라이브러리 read-only 화면을 연결할 자리입니다.`
            : '팀을 선택하거나 참여한 뒤 곡 라이브러리를 볼 수 있습니다.'
      }
      action={<TeamSelectionPanel />}
    />
  )
}
