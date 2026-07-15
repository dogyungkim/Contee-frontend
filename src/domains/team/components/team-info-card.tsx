import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamInfo {
  name: string
  shortCode?: string | null
  description?: string | null
}

interface TeamInfoCardProps {
  team: TeamInfo
  copiedCode: boolean
  onCopyInviteCode: () => void | Promise<void>
}

export function TeamInfoCard({ team, copiedCode, onCopyInviteCode }: TeamInfoCardProps) {
  return (
    <Card className="h-fit rounded-2xl">
      <CardHeader className="border-b border-border px-4 pb-3 sm:px-5 lg:px-6 lg:pb-4">
        <CardTitle className="type-card-title">팀 정보</CardTitle>
        <CardDescription className="break-words">현재 선택된 팀의 기본 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-4 sm:px-6">
        <div>
          <div className="text-caption-upper text-muted-foreground">Team name</div>
          <p className="type-emphasis mt-2 break-words">{team.name}</p>
        </div>

        {team.description && (
          <div>
            <div className="text-caption-upper text-muted-foreground">Description</div>
            <p className="type-body mt-2 break-words text-foreground">{team.description}</p>
          </div>
        )}

        <div>
          <div className="text-caption-upper text-muted-foreground">Invite code</div>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="min-w-0 flex-1 rounded-lg border border-border bg-[#fafafa] p-3">
              <p className="type-emphasis truncate font-mono">{team.shortCode || '-'}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="초대 코드 복사"
              disabled={!team.shortCode}
              onClick={() => { void onCopyInviteCode() }}
            >
              {copiedCode ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="type-body-sm mt-2 text-muted-foreground">이 코드를 공유하여 팀원을 초대하세요.</p>
        </div>
      </CardContent>
    </Card>
  )
}
