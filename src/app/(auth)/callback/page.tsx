import { Suspense } from 'react'

import { AuthCallbackClient } from './auth-callback-client'

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <AuthCallbackClient />
    </Suspense>
  );
}
