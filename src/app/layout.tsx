import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { ConditionalHeader } from '@/components/layout/conditional-header'
import { ConditionalFooter } from '@/components/layout/conditional-footer'
import { AuthProvider } from '@/components/auth/auth-provider'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import QueryProvider from '@/components/providers/query-provider'

export const metadata: Metadata = {
  title: 'Contee',
  description: '찬양팀이 콘티와 곡 자료를 함께 정리하는 공간',
  manifest: '/manifest.json',
  applicationName: 'Contee',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: { url: '/icon.svg' },
  },
}

export const viewport: Viewport = {
  themeColor: '#3b4663',
}

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <ConditionalHeader />
              <main className="flex-1">{children}</main>
              <ConditionalFooter />
            </div>
          </AuthProvider>
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <GoogleAnalytics measurementId={gaMeasurementId} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  const isProduction = ${process.env.NODE_ENV === 'production'};

                  if (isProduction) {
                    navigator.serviceWorker.register('/sw.js').catch(() => {});
                    return;
                  }

                  const registrations = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(registrations.map((registration) => registration.unregister()));

                  if ('caches' in window) {
                    const cacheKeys = await caches.keys();
                    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
