'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, Music, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMyTeamsQuery } from '@/hooks/queries/use-team-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const { data: teams = [] } = useMyTeamsQuery();
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, selectedTeam]);

  const handleTeamChange = (value: string) => {
    if (value === '__add__') {
      router.push('/dashboard/settings/teams');
      return;
    }
    setSelectedTeam(value);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex items-center gap-4">
          <Link href="/" className="mr-2 flex items-center space-x-2">
            <Music className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Contee</span>
          </Link>
          {isAuthenticated && (
            <Select value={selectedTeam} onValueChange={handleTeamChange}>
              <SelectTrigger className="w-[160px]" aria-label="팀 선택">
                <SelectValue placeholder="팀 선택" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
                <DropdownMenuSeparator />
                <SelectItem value="__add__">+ 팀 추가하기</SelectItem>
              </SelectContent>
            </Select>
          )}
          {isAuthenticated && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard">대시보드</Link>
              <Link href="/dashboard/contis">콘티</Link>
              <Link href="/dashboard/songs">곡</Link>
            </nav>
          )}
          {!isAuthenticated && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#features">기능</Link>
              <Link href="#pricing">가격</Link>
              <Link href="#contact">문의</Link>
            </nav>
          )}
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
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard">대시보드</Link>
                      <Link href="/dashboard/contis">콘티</Link>
                      <Link href="/dashboard/songs">곡</Link>
                  <div className="pt-2">
                    <Select value={selectedTeam} onValueChange={handleTeamChange}>
                      <SelectTrigger aria-label="팀 선택">
                        <SelectValue placeholder="팀 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                        <DropdownMenuSeparator />
                        <SelectItem value="__add__">+ 팀 추가하기</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                      <Button variant="ghost" onClick={handleLogout} className="justify-start">
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="#features">기능</Link>
                      <Link href="#pricing">가격</Link>
                      <Link href="#contact">문의</Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">대시보드</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">설정</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">로그인</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">시작하기</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
