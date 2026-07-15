interface TeamSettingsHeaderProps {
  teamName: string
}

export function TeamSettingsHeader({ teamName }: TeamSettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="text-caption-upper text-muted-foreground">Team settings</div>
        <h1 className="type-page-title mt-2">팀 관리</h1>
        <p className="type-page-description mt-2 break-words">
          {teamName} 팀의 정보와 멤버를 관리하세요.
        </p>
      </div>
    </div>
  )
}
