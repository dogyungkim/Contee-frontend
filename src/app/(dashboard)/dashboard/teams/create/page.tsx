import { CreateTeamForm } from '@/components/team/create-team-form';

export const metadata = {
  title: '새 팀 생성 | Contee',
  description: 'Contee에서 새로운 찬양팀을 만드세요.',
};

export default function NewTeamPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] p-4">
      <CreateTeamForm />
    </div>
  );
}
