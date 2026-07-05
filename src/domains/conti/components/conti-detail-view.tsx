'use client'

import { useState } from 'react'
import { Music } from 'lucide-react'

import type { Conti } from '@/types/conti'
import { useContiSharing } from '@/domains/conti/hooks/use-conti-sharing'
import { ContiReadHeader } from './conti-read-header'
import { ContiReadOnlyInfo } from './conti-read-only-info'
import { ContiReadOnlySongList } from './conti-read-only-song-list'
import { ContiShareDialog } from './conti-share-dialog'

interface ContiDetailViewProps {
  conti: Conti
  canEdit: boolean
  canManageExternalShare: boolean
  isMembersLoading: boolean
  onStartEdit: () => void
}

export function ContiDetailView({
  conti,
  canEdit,
  canManageExternalShare,
  isMembersLoading,
  onStartEdit,
}: ContiDetailViewProps) {
  const [isWordSharingOpen, setIsWordSharingOpen] = useState(true)
  const sharing = useContiSharing({
    contiId: conti.id,
    externalShare: conti.externalShare,
  })
  const songs = conti.contiSongs ?? []
  const shareMenuProps = {
    externalShareEnabled: !!conti.externalShare?.enabled,
    canManageExternalShare,
    hasChanges: false,
    isEnabling: sharing.isEnabling,
    isDisabling: sharing.isDisabling,
    onCopyTeamShare: () => {
      void sharing.copyTeamShare()
    },
    onCopyExternalShare: () => {
      void sharing.copyExternalShare()
    },
    onRequestExternalShare: sharing.setDialogMode,
  }

  return (
    <div className="flex flex-col gap-6">
      <ContiReadHeader
        conti={conti}
        songCount={songs.length}
        canEdit={canEdit}
        isMembersLoading={isMembersLoading}
        shareMenuProps={shareMenuProps}
        onStartEdit={onStartEdit}
      />

      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <ContiReadOnlyInfo
          memo={conti.memo}
          bibleVerse={conti.bibleVerse}
          sharingInfo={conti.sharingInfo}
          collapsible
          isWordSharingOpen={isWordSharingOpen}
          onWordSharingOpenChange={setIsWordSharingOpen}
        />

        <div className="space-y-4 pb-20">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-neutral-500" />
            <h3 className="font-semibold text-neutral-900">곡 목록</h3>
          </div>
          <ContiReadOnlySongList songs={songs} />
        </div>
      </div>

      <ContiShareDialog
        mode={sharing.dialogMode}
        isPending={sharing.isPending}
        shareUrl={sharing.createdShareUrl}
        onClose={() => sharing.setDialogMode(null)}
        onConfirm={sharing.confirmDialog}
        onCopy={() => {
          void sharing.copyCreatedExternalShare()
        }}
      />
    </div>
  )
}
