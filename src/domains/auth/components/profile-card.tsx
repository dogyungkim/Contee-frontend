'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Camera, Loader2, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { User as AuthUser } from '@/domains/auth/models/auth'
import { useUpdateProfileImageMutation } from '@/domains/auth/hooks/use-auth-query'
import { useProfileImageSrc } from '@/domains/auth/hooks/use-profile-image-src'
import { toast } from '@/lib/toast'

interface ProfileCardProps {
  user: AuthUser | null | undefined
}

const PROFILE_IMAGE_ACCEPT = 'image/png,image/jpeg,.png,.jpg,.jpeg'
const PROFILE_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg'])
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024

const getProfileImageValidationMessage = (file: File) => {
  if (file.size === 0) {
    return '비어 있는 이미지는 업로드할 수 없습니다.'
  }
  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    return '프로필 이미지는 5MB 이하만 업로드할 수 있습니다.'
  }
  if (!PROFILE_IMAGE_MIME_TYPES.has(file.type)) {
    return 'PNG, JPG, JPEG 이미지만 업로드할 수 있습니다.'
  }
  return null
}

export function ProfileCard({ user }: ProfileCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>()
  const profileImageSrc = useProfileImageSrc(user?.profileImageUrl)
  const updateProfileImageMutation = useUpdateProfileImageMutation()
  const isUploading = updateProfileImageMutation.isPending
  const displayedProfileImageSrc = previewUrl || profileImageSrc

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const validationMessage = getProfileImageValidationMessage(file)
    if (validationMessage) {
      toast.error(validationMessage)
      return
    }

    const nextPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }
      return nextPreviewUrl
    })

    try {
      await updateProfileImageMutation.mutateAsync(file)
      toast.success('프로필 사진을 변경했습니다.')
    } catch (error) {
      URL.revokeObjectURL(nextPreviewUrl)
      setPreviewUrl(undefined)
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '프로필 사진을 변경하지 못했습니다.'
      toast.error(errorMessage)
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-lg">내 프로필</CardTitle>
        <CardDescription>현재 로그인된 계정 정보와 프로필 사진입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
            {displayedProfileImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedProfileImageSrc}
                alt={user?.name || '사용자'}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user?.name || '사용자'}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {user?.email || '이메일 정보 없음'}
            </p>
          </div>

          <div className="flex sm:ml-auto">
            <input
              ref={inputRef}
              type="file"
              accept={PROFILE_IMAGE_ACCEPT}
              className="hidden"
              disabled={isUploading}
              onChange={handleProfileImageChange}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              사진 변경
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
