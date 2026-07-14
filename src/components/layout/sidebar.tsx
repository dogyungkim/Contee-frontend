/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Music, 
  FileText, 
  Library, 
  Settings, 
  User,
  Users,
  Plus,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useProfileImageSrc } from '@/domains/auth/hooks/use-profile-image-src';
import { useTeam } from '@/context/team-context';
import { JoinTeamForm } from '@/domains/team/components/join-team-form';
import { cn } from '@/lib/utils';

const ADD_TEAM_VALUE = '__add__';
const JOIN_TEAM_VALUE = '__join__';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const Sidebar = ({ className, onNavigate }: SidebarProps) => {
  const { user } = useAuth();
  const profileImageSrc = useProfileImageSrc(user?.profileImageUrl);
  const router = useRouter();
  const pathname = usePathname();
  const [isJoinTeamOpen, setIsJoinTeamOpen] = useState(false);
  
  const { teams, selectedTeamId, setSelectedTeamId } = useTeam();
  const hasTeams = teams.length > 0;

  const handleTeamChange = (value: string) => {
    if (value === ADD_TEAM_VALUE) {
      onNavigate?.();
      router.push('/dashboard/teams/create');
      return;
    }
    if (value === JOIN_TEAM_VALUE) {
      setIsJoinTeamOpen(true);
      return;
    }
    setSelectedTeamId(value);
    onNavigate?.();
  };

  // Helper function to determine if a navigation item is active
  const isNavItemActive = (itemHref: string, currentPath: string): boolean => {
    if (itemHref === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath === itemHref || currentPath.startsWith(itemHref + '/');
  };

  const navItems = [
    {
      title: '콘티 리스트',
      href: '/dashboard/contis',
      icon: FileText,
      requiresTeam: true,
    },
    {
      title: '곡 라이브러리',
      href: '/dashboard/songs',
      icon: Library,
      requiresTeam: false,
    },
    {
      title: '팀 관리',
      href: '/dashboard/teams',
      icon: Users,
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
    <>
    <div className={cn("flex h-full w-62 flex-col overflow-hidden bg-transparent", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/dashboard/contis" className="flex min-w-0 items-center gap-3" onClick={onNavigate}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1c1c] text-white">
            <Music className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="type-body-sm font-semibold tracking-normal">Contee</div>
            <div className="text-caption-upper text-muted-foreground">Team workspace</div>
          </div>
        </Link>
      </div>

      {/* Team Selector or Create Team Button */}
      <div className="px-4 pb-3 pt-2">
        {hasTeams ? (
          <Select value={selectedTeamId || ''} onValueChange={handleTeamChange}>
            <SelectTrigger className="h-11 w-full rounded-xl border-[#dcdee0] bg-white/80" aria-label="팀 선택">
              <SelectValue placeholder="팀 선택" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
              <Separator className="my-1" />
              <SelectItem value={ADD_TEAM_VALUE}>
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  새 팀 만들기
                </span>
              </SelectItem>
              <SelectItem value={JOIN_TEAM_VALUE}>
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  초대 코드로 합류
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => {
                onNavigate?.();
                router.push('/dashboard/teams/create');
              }}
            >
              <Plus className="h-4 w-4" />
              팀 만들기
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsJoinTeamOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              초대 코드로 합류
            </Button>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="px-4 pb-4">
        <div className="rounded-xl border border-[#dcdee0] bg-white/60 p-4">
          <div className="text-caption-upper text-muted-foreground">Signed in</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt={user?.name || '사용자'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="type-body-sm truncate font-medium">{user?.name || '사용자'}</p>
              <p className="type-label truncate text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-2">
        {navItems
          .filter((item) => !item.requiresTeam || hasTeams)
          .map((item) => {
            const isActive = isNavItemActive(item.href, pathname);
            const isDisabled = item.requiresTeam && !hasTeams;
            
            return (
              <Link
                key={item.href}
                href={isDisabled ? '#' : item.href}
                className={cn(
                  'type-control flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                  isDisabled && 'pointer-events-none opacity-50',
                  isActive
                    ? 'bg-white/80 text-foreground'
                    : 'text-muted-foreground hover:bg-white/55 hover:text-foreground'
                )}
                aria-disabled={isDisabled}
                onClick={isDisabled ? undefined : onNavigate}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
      </nav>

    </div>
    <Dialog open={isJoinTeamOpen} onOpenChange={setIsJoinTeamOpen}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-md p-4 sm:p-6">
        <DialogHeader className="pr-8 sm:pr-10">
          <DialogTitle>팀 합류하기</DialogTitle>
          <DialogDescription>
            팀 관리자에게 받은 초대 코드를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <JoinTeamForm onJoined={() => setIsJoinTeamOpen(false)} />
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Sidebar;
