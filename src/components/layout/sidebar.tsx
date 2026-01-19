'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Music, 
  LayoutDashboard, 
  FileText, 
  Library, 
  Settings, 
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  // TODO: Replace with real team data fetching logic
  const mockHasTeam = false;
  
  const teams = [
    { id: 'team-main', name: '메인 팀' },
    { id: 'team-youth', name: '청년부' },
    { id: 'team-midweek', name: '수요예배' },
  ];
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id || '');

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

  const navItems = [
    {
      title: '대시보드',
      href: '/dashboard',
      icon: LayoutDashboard,
      requiresTeam: false,
    },
    {
      title: '콘티 리스트',
      href: '/dashboard/contis',
      icon: FileText,
      requiresTeam: true,
    },
    {
      title: 'Song Library',
      href: '/dashboard/songs',
      icon: Library,
      requiresTeam: false,
    },
    {
      title: '설정',
      href: '/dashboard/settings',
      icon: Settings,
      requiresTeam: false,
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Music className="h-6 w-6" />
          <span className="font-bold">Contee</span>
        </Link>
      </div>

      {/* Team Selector or Create Team Button */}
      <div className="p-4 pb-3">
        {mockHasTeam ? (
          <Select value={selectedTeam} onValueChange={handleTeamChange}>
            <SelectTrigger className="w-full" aria-label="팀 선택">
              <SelectValue placeholder="팀 선택" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
              <Separator className="my-1" />
              <SelectItem value="__add__">+ 팀 추가하기</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => router.push('/teams/new')}
          >
            팀 만들기
          </Button>
        )}
      </div>

      {/* User Profile */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 rounded-lg bg-accent/30 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.name || '사용자'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems
          .filter((item) => !item.requiresTeam || mockHasTeam)
          .map((item) => {
            // For /dashboard, only match exact path, not subpaths
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            const isDisabled = item.requiresTeam && !mockHasTeam;
            
            return (
              <Link
                key={item.href}
                href={isDisabled ? '#' : item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isDisabled && 'pointer-events-none opacity-50',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                aria-disabled={isDisabled}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
      </nav>

      <Separator />

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
