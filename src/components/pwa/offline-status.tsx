'use client';

import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

import { toast } from '@/lib/toast';

const NETWORK_TOAST_ID = 'network-status';

export function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const hasReportedStatusChange = useRef(false);

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  useEffect(() => {
    if (!hasReportedStatusChange.current) {
      hasReportedStatusChange.current = true;
      if (isOnline) return;
    }

    if (!isOnline) return;

    toast.info('온라인으로 돌아왔습니다.', {
      id: NETWORK_TOAST_ID,
      duration: 3000,
      icon: <Wifi className="h-4 w-4 text-emerald-500" />,
    });
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center px-3"
    >
      <div className="flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950 shadow-sm">
        <WifiOff className="h-4 w-4 shrink-0 text-amber-600" />
        <span className="truncate">오프라인 상태입니다</span>
        <span className="hidden text-amber-800 sm:inline">
          이미 불러온 화면은 계속 볼 수 있어요.
        </span>
      </div>
    </div>
  );
}
