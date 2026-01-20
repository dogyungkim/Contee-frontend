import { Suspense } from 'react'
import type { Metadata } from 'next'

import { RequireAuth } from '@/components/auth/require-auth'
import Sidebar from '@/components/layout/sidebar'
import { TeamProvider } from '@/context/team-context'

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
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
        </TeamProvider>
      </Suspense>
    </RequireAuth>
  )
}

