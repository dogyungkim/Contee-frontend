import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Dashboard Header Component
 * Displays page title, description, and action buttons
 */
export function DashboardHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="text-caption-upper text-muted-foreground">Overview</div>
        <h1 className="type-page-title mt-2">대시보드</h1>
        <p className="type-page-description mt-3">
          최근 콘티와 활동을 한눈에 확인하고, 빠르게 작업을 시작하세요.
        </p>
      </div>
      <div className="grid gap-2 sm:flex sm:shrink-0">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/contis/new">새 콘티 만들기</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/dashboard/songs">곡 추가/검색</Link>
        </Button>
      </div>
    </div>
  );
}
