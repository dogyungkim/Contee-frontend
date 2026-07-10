'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTeam } from '@/context/team-context'
import { useJoinTeamMutation } from '@/domains/team/hooks/use-team-query'
import { toast } from '@/lib/toast'

const formSchema = z.object({
  shortCode: z.string().trim().min(1, '초대 코드를 입력해주세요.'),
})

type FormValues = z.infer<typeof formSchema>

interface JoinTeamFormProps {
  onJoined?: () => void
}

export function JoinTeamForm({ onJoined }: JoinTeamFormProps) {
  const { teams, setSelectedTeamId } = useTeam()
  const joinTeamMutation = useJoinTeamMutation()
  const [teamIdsBeforeJoin, setTeamIdsBeforeJoin] = useState<string[] | null>(null)
  const [submittedShortCode, setSubmittedShortCode] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shortCode: '',
    },
  })

  useEffect(() => {
    if (!teamIdsBeforeJoin) return

    const joinedTeam =
      teams.find((team) => !teamIdsBeforeJoin.includes(team.id)) ||
      teams.find((team) => team.shortCode?.toUpperCase() === submittedShortCode)

    if (joinedTeam) {
      setSelectedTeamId(joinedTeam.id)
      setTeamIdsBeforeJoin(null)
      setSubmittedShortCode(null)
      onJoined?.()
    }
  }, [onJoined, setSelectedTeamId, submittedShortCode, teamIdsBeforeJoin, teams])

  const onSubmit = async (values: FormValues) => {
    const shortCode = values.shortCode.trim().toUpperCase()
    const currentTeamIds = teams.map((team) => team.id)

    try {
      await joinTeamMutation.mutateAsync(shortCode)
      setTeamIdsBeforeJoin(currentTeamIds)
      setSubmittedShortCode(shortCode)
      form.reset()
      toast.success('팀에 합류했습니다.')
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '팀 합류에 실패했습니다. 초대 코드를 확인해주세요.'
      toast.error(errorMessage)
      console.error('Join team error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="shortCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>초대 코드</FormLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <FormControl>
                  <Input
                    placeholder="예: WSHIP001"
                    autoComplete="off"
                    className="font-mono uppercase"
                    {...field}
                    onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  />
                </FormControl>
                <Button
                  type="submit"
                  className="sm:w-[120px]"
                  disabled={joinTeamMutation.isPending}
                >
                  <LogIn className="h-4 w-4" />
                  {joinTeamMutation.isPending ? '합류 중' : '합류'}
                </Button>
              </div>
              <FormDescription>
                팀 관리자에게 받은 초대 코드를 입력하세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
