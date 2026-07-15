import { CreateTeamForm } from '@/domains/team/components/create-team-form';

export const metadata = {
  title: '새 팀 생성 | Contee',
  description: 'Contee에서 새로운 찬양팀을 만드세요.',
};

export default function NewTeamPage() {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] items-start justify-center py-2 sm:min-h-[calc(100dvh-10rem)] sm:items-center sm:py-4">
      <CreateTeamForm />
    </div>
  );
}
