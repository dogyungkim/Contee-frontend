'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateTeamMutation } from '@/hooks/queries/use-team-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';

const formSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요.').max(100, '팀 이름은 100자 이하로 입력해주세요.'),
  description: z.string().max(2000, '설명은 2000자 이하로 입력해주세요.').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTeamForm() {
  const router = useRouter();
  const createTeamMutation = useCreateTeamMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await createTeamMutation.mutateAsync(values);
      toast.success('팀이 성공적으로 생성되었습니다.');
      router.push(`/dashboard?teamId=${result.id}`);
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error('팀 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>새 팀 만들기</CardTitle>
        <CardDescription>
          함께 찬양을 준비할 팀을 만들어보세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>팀 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 여의도 청년부 찬양팀" {...field} />
                  </FormControl>
                  <FormDescription>
                    팀의 이름을 입력해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 (선택)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="팀에 대한 간단한 설명을 적어주세요." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={createTeamMutation.isPending}
            >
              {createTeamMutation.isPending ? '생성 중...' : '팀 생성하기'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
