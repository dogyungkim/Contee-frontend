import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { TeamSelectionPanel } from '@/components/team-selection-panel'
import { useTeamSelection } from '@/lib/team-selection'

export default function ContisScreen() {
  const { selectedTeam } = useTeamSelection()

  return (
    <ScreenPlaceholder
      eyebrow="Read-only MVP"
      title="콘티"
      description={
        selectedTeam
          ? `${selectedTeam.name} 팀의 read-only 콘티 목록을 연결할 자리입니다.`
          : '팀 선택과 read-only 콘티 목록을 연결할 자리입니다.'
      }
      action={<TeamSelectionPanel />}
    />
  )
}
