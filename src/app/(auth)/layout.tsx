import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인 | Contee',
  description: 'Contee에 로그인하여 찬양팀 콘티를 관리하세요.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
