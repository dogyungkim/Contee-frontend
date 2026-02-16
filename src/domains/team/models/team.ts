export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface TeamSummary {
  id: string;
  name: string;
  shortCode?: string;
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userProfileImageUrl?: string;
  role: TeamRole;
  joinedAt: string;
}
