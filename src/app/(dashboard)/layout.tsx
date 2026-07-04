import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Menu } from 'lucide-react'

import { RequireAuth } from '@/domains/auth/components/require-auth'
import Sidebar from '@/components/layout/sidebar'
import { TeamProvider } from '@/context/team-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export const metadata: Metadata = {
  title: '대시보드 | Contee',
  description: '콘티와 곡을 관리하는 대시보드',
}

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <TeamProvider>
          <div className="flex h-screen gap-3 overflow-hidden bg-[#f7f7f8] p-2 md:p-3 lg:gap-4 lg:p-4">
            <Sidebar className="hidden shrink-0 md:flex" />
            <div className="floating-shell relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl">
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4 md:hidden">
                <Link href="/dashboard" className="font-semibold tracking-[-0.03em]">Contee</Link>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="메뉴 열기">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0">
                    <SheetHeader className="sr-only">
                      <SheetTitle>메뉴</SheetTitle>
                    </SheetHeader>
                    <Sidebar className="w-full rounded-none border-0 shadow-none" />
                  </SheetContent>
                </Sheet>
              </header>
              <main className="dashboard-content flex-1 overflow-y-auto bg-white p-4 md:p-7 lg:p-9">
                <div className="mx-auto w-full max-w-[1440px]">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </TeamProvider>
      </Suspense>
    </RequireAuth>
  )
}
