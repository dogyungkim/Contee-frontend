import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Dashboard Skeleton Component
 * Shows loading state with skeleton UI matching the actual dashboard layout
 */
export function DashboardSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="mb-2 h-8 w-48 max-w-full" />
        <Skeleton className="h-4 w-full max-w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid gap-6 lg:col-span-8">
          {/* Summary Cards Skeleton */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2 lg:pb-3">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full sm:w-20" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 lg:pb-3">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-6 w-8" />
                </div>
                <div className="rounded-md border p-3">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Contis Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <Skeleton className="mb-2 h-5 w-24" />
                  <Skeleton className="h-4 w-full max-w-48" />
                </div>
                <Skeleton className="h-9 w-full sm:w-20" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <Skeleton className="mb-2 h-4 w-full max-w-40" />
                    <Skeleton className="h-3 w-full max-w-32" />
                  </div>
                  <Skeleton className="h-9 w-full sm:w-16" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Song Search Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <Skeleton className="mb-2 h-5 w-24" />
                  <Skeleton className="h-4 w-full max-w-40" />
                </div>
                <Skeleton className="h-9 w-full sm:w-20" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-md border p-3">
                    <Skeleton className="mb-2 h-4 w-full max-w-32" />
                    <Skeleton className="mb-3 h-3 w-full max-w-24" />
                    <Skeleton className="h-9 w-full sm:w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="grid gap-6 lg:col-span-4">
          {/* Quick Actions Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent className="grid gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Recent Activities Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="grid gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-md border p-3">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
