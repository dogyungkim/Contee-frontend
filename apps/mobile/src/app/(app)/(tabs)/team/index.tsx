import { ScreenPlaceholder } from '@/components/screen-placeholder'
import { TeamSelectionPanel } from '@/components/team-selection-panel'
import { useTeamSelection } from '@/lib/team-selection'

export default function TeamScreen() {
  const { isLoading, selectedTeam, teams } = useTeamSelection()

  return (
    <ScreenPlaceholder
      eyebrow="Read-only MVP"
      title="팀"
      description={
        isLoading
          ? '선택된 팀을 확인하고 있습니다.'
          : selectedTeam
            ? `${selectedTeam.name} 팀 요약과 멤버 상태를 표시할 자리입니다. 현재 접근 가능한 팀은 ${teams.length}개입니다.`
            : '참여 중인 팀이 없습니다. 팀 만들기와 초대 코드 참여 플로우가 준비되면 연결합니다.'
      }
      action={<TeamSelectionPanel />}
    />
  )
}
