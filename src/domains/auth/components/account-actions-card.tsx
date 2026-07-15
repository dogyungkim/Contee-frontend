'use client'

import { useState } from 'react'
import { LogOut, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeleteAccountMutation, useLogoutMutation } from '@/domains/auth/hooks/use-auth-query'
import { toast } from '@/lib/toast'

const DELETE_CONFIRM_TEXT = '탈퇴'

export function AccountActionsCard() {
  const router = useRouter()
  const logoutMutation = useLogoutMutation()
  const deleteAccountMutation = useDeleteAccountMutation()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const canDelete = confirmText.trim() === DELETE_CONFIRM_TEXT

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('로그아웃되었습니다.')
        router.push('/')
      },
      onError: () => {
        toast.info('로컬 로그인 정보를 정리했습니다.')
        router.push('/')
      },
    })
  }

  const handleDeleteAccount = () => {
    if (!canDelete) return

    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('회원 탈퇴가 완료되었습니다.')
        setIsDeleteDialogOpen(false)
        setConfirmText('')
        router.push('/')
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.'
        toast.error(errorMessage)
      },
    })
  }

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader className="border-b border-border pb-3 lg:pb-4">
          <CardTitle className="text-lg">계정</CardTitle>
          <CardDescription>로그인 세션과 계정 상태를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">로그아웃</p>
              <p className="mt-1 text-sm text-muted-foreground">
                현재 기기에서 Contee 사용을 종료합니다.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? '로그아웃 중' : '로그아웃'}
            </Button>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-destructive">회원 탈퇴</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  계정 삭제는 되돌릴 수 없습니다.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                회원 탈퇴
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 탈퇴</DialogTitle>
            <DialogDescription>
              회원 탈퇴 시 계정 정보가 삭제됩니다. 소유 중인 팀, 작성한 콘티, 곡 데이터 처리
              방식은 서비스 정책에 따라 적용되며 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label htmlFor="delete-confirm">계속하려면 &quot;탈퇴&quot;를 입력하세요.</Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              autoComplete="off"
              disabled={deleteAccountMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteAccountMutation.isPending}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!canDelete || deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? '탈퇴 처리 중' : '탈퇴'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
