'use client'

import { useState } from 'react'
import { Music } from 'lucide-react'

import type { Conti } from '@/types/conti'
import { usePublishConti } from '@/domains/conti/hooks/use-conti'
import { useContiPdfDownload } from '@/domains/conti/hooks/use-conti-pdf-download'
import { useContiSharing } from '@/domains/conti/hooks/use-conti-sharing'
import { getContiApiErrorMessage } from '@/domains/conti/utils/conti-error'
import { toast } from '@/lib/toast'
import { ContiReadHeader } from './conti-read-header'
import { ContiReadOnlyInfo } from './conti-read-only-info'
import { ContiReadOnlySongList } from './conti-read-only-song-list'
import { ContiShareDialog } from './conti-share-dialog'

interface ContiDetailViewProps {
  conti: Conti
  canEdit: boolean
  canPublish: boolean
  canManageExternalShare: boolean
  isMembersLoading: boolean
  onStartEdit: () => void
}

export function ContiDetailView({
  conti,
  canEdit,
  canPublish,
  canManageExternalShare,
  isMembersLoading,
  onStartEdit,
}: ContiDetailViewProps) {
  const [isWordSharingOpen, setIsWordSharingOpen] = useState(true)
  const { mutateAsync: publishConti, isPending: isPublishing } = usePublishConti()
  const sharing = useContiSharing({
    contiId: conti.id,
    conti,
    externalShare: conti.externalShare,
  })
  const contiPdf = useContiPdfDownload(conti)
  const songs = conti.contiSongs ?? []
  const shareMenuProps = {
    isPublished: conti.status === 'PUBLISHED',
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
  const exportMenuProps = {
    onCopyYoutubeReferences: (includeKeyAndBpm?: boolean) => {
      void sharing.copyYoutubeReferences(includeKeyAndBpm)
    },
  }

  const publish = async () => {
    if (!window.confirm('이 콘티를 팀에 공개할까요? 공개 후에는 팀원이 바로 볼 수 있습니다.')) {
      return
    }

    try {
      await publishConti(conti.id)
      toast.success('콘티를 팀에 공개했습니다.')
    } catch (error) {
      toast.error(getContiApiErrorMessage(error, '콘티를 팀에 공개하지 못했습니다.'))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ContiReadHeader
        conti={conti}
        songCount={songs.length}
        canEdit={canEdit}
        canPublish={canPublish}
        isPublishing={isPublishing}
        isMembersLoading={isMembersLoading}
        sheetMusicCount={contiPdf.sheetMusicCount}
        isPdfDownloading={contiPdf.isDownloading}
        shareMenuProps={shareMenuProps}
        exportMenuProps={exportMenuProps}
        onDownloadPdf={() => {
          void contiPdf.download()
        }}
        onStartEdit={onStartEdit}
        onPublish={() => {
          void publish()
        }}
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
