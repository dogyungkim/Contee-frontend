'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronRight, Menu, Music } from 'lucide-react';

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
        <div className="mr-4 hidden items-center gap-6 md:flex">
          <Link href="/" className="mr-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Music className="h-4 w-4" />
            </div>
            <span className="whitespace-nowrap text-sm font-semibold tracking-normal sm:inline-block">Contee</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-border bg-background px-6">
                <nav className="grid gap-6 pt-8 text-lg font-medium">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Music className="h-4 w-4" />
                    </div>
                    <span>Contee</span>
                  </Link>
                  <Link href="#app-screens">앱 화면</Link>
                  <Link href="#song-form">송폼</Link>
                  <Link href="#share-preview">공유</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

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
