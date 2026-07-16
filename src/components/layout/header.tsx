'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

/**
 * Header Component - For Unauthenticated Users Only
 * 
 * This header is only shown on landing/public pages.
 * ConditionalHeader hides this component when user is on /dashboard routes.
 * No authentication logic or API calls needed here.
 */
const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="mr-4 flex items-center gap-6">
          <Link href="/" className="mr-2 flex items-center gap-2">
            <Image src="/logo-text.svg" alt='logo-long' width={125} height={24} />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/login">
                <span className="whitespace-nowrap">시작하기</span>
                <ChevronRight className="h-4 w-4 opacity-80" />
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
