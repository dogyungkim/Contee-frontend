import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyTeams, getTeam, getTeamMembers, removeTeamMember, updateTeamMemberRole, createTeam } from '@/lib/api/team';
import { UpdateTeamMemberRoleRequest } from '@/types/team';

export const teamKeys = {
    all: ['teams'] as const,
    lists: () => [...teamKeys.all, 'list'] as const,
    details: () => [...teamKeys.all, 'detail'] as const,
    detail: (id: string) => [...teamKeys.details(), id] as const,
    members: (id: string) => [...teamKeys.detail(id), 'members'] as const,
};

export const useMyTeamsQuery = () => {
    return useQuery({
        queryKey: teamKeys.lists(),
        queryFn: getMyTeams,
    });
};

export const useTeamQuery = (id: string) => {
    return useQuery({
        queryKey: teamKeys.detail(id),
        queryFn: () => getTeam(id),
        enabled: !!id,
    });
};

export const useTeamMembersQuery = (teamId: string) => {
    return useQuery({
        queryKey: teamKeys.members(teamId),
        queryFn: () => getTeamMembers(teamId),
        enabled: !!teamId,
    });
};

export const useRemoveTeamMemberMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
            removeTeamMember(teamId, userId),
        onSuccess: (_, { teamId }) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
        },
    });
};

export const useUpdateTeamMemberRoleMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            teamId,
            userId,
            role
        }: {
            teamId: string;
            userId: string;
            role: UpdateTeamMemberRoleRequest
        }) => updateTeamMemberRole(teamId, userId, role),
        onSuccess: (_, { teamId }) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) });
        },
    });
};

export const useCreateTeamMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
        },
    });
};

