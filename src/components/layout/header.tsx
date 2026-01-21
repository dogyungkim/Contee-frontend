'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Music } from 'lucide-react';

/**
 * Header Component - For Unauthenticated Users Only
 * 
 * This header is only shown on landing/public pages.
 * ConditionalHeader hides this component when user is on /dashboard routes.
 * No authentication logic or API calls needed here.
 */
const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-8">
        <div className="mr-4 hidden md:flex items-center gap-4">
          <Link href="/" className="mr-2 flex items-center space-x-2">
            <Music className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Contee</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="#features">기능</Link>
            <Link href="#pricing">가격</Link>
            <Link href="#contact">문의</Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                    <Music className="h-6 w-6" />
                    <span>Contee</span>
                  </Link>
                  <Link href="#features">기능</Link>
                  <Link href="#pricing">가격</Link>
                  <Link href="#contact">문의</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <nav className="flex items-center space-x-2">
            <Button asChild variant="ghost">
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link href="/login">시작하기</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
