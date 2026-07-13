import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Dashboard Header Component
 * Displays page title, description, and action buttons
 */
export function DashboardHeader() {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-caption-upper text-muted-foreground">Overview</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em]">대시보드</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          최근 콘티와 활동을 한눈에 확인하고, 빠르게 작업을 시작하세요.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/dashboard/contis/new">새 콘티 만들기</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/songs">곡 라이브러리</Link>
        </Button>
      </div>
    </div>
  );
}
