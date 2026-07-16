import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { RequireAuth } from '@/domains/auth/components/require-auth'
import Sidebar from '@/components/layout/sidebar'
import { DashboardMobileSidebar } from '@/components/layout/dashboard-mobile-sidebar'
import { TeamProvider } from '@/context/team-context'

export const metadata: Metadata = {
  title: '콘티 목록 | Contee',
  description: '콘티와 곡을 관리하는 작업 공간',
}

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="flex h-dvh items-center justify-center">Loading...</div>}>
        <TeamProvider>
          <div className="flex h-dvh overflow-hidden bg-[#f7f7f8] sm:gap-3 sm:p-2 lg:gap-4 lg:p-4">
            <Sidebar className="hidden shrink-0 lg:flex" />
            <div className="floating-shell relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-none sm:rounded-2xl">
              <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-white px-4 lg:hidden">
                <Link href="/dashboard/contis" className="flex h-[22px] w-[100px] items-center" aria-label="Contee 홈">
                  <Image
                    src="/logo-text.svg"
                    alt="Contee"
                    width={100}
                    height={22}
                    className="block h-[22px] w-[100px]"
                    priority
                  />
                </Link>
                <DashboardMobileSidebar />
              </header>
              <main className="dashboard-content flex-1 overflow-y-auto bg-white p-4 sm:p-5 lg:p-9">
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
