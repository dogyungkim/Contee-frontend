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
          <div className="flex h-screen overflow-hidden">
            <Sidebar className="hidden md:flex" />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
                <Link href="/dashboard" className="font-semibold">Contee</Link>
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
                    <Sidebar className="w-full border-r-0" />
                  </SheetContent>
                </Sheet>
              </header>
              <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
              </main>
            </div>
          </div>
        </TeamProvider>
      </Suspense>
    </RequireAuth>
  )
}
