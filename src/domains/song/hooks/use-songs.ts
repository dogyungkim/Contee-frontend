import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getTeamSongs,
    getTeamSong,
    createTeamSong,
    updateTeamSong,
    deleteTeamSong
} from '@/lib/api/song';
import { TeamSong, CreateTeamSongRequest, UpdateTeamSongRequest } from '@/types/song';

export const songKeys = {
    all: ['songs'] as const,
    list: (teamId: string) => [...songKeys.all, 'list', teamId] as const,
    detail: (teamId: string, songId: string) => [...songKeys.all, 'detail', teamId, songId] as const,
};

export const useTeamSongs = (teamId: string | null) => {
    return useQuery({
        queryKey: songKeys.list(teamId || ''),
        queryFn: () => getTeamSongs(teamId!),
        enabled: !!teamId,
        select: (data): TeamSong[] => Array.isArray(data) ? data : (data as { content: TeamSong[] })?.content || [],
    });
};

export const useTeamSongDetail = (teamId: string | null, songId: string | null) => {
    return useQuery({
        queryKey: songKeys.detail(teamId || '', songId || ''),
        queryFn: () => getTeamSong(teamId!, songId!),
        enabled: !!teamId && !!songId,
    });
};

export const useCreateTeamSong = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, request }: { teamId: string; request: CreateTeamSongRequest }) =>
            createTeamSong(teamId, request),
        onSuccess: (_, { teamId }) => {
            queryClient.invalidateQueries({ queryKey: songKeys.list(teamId) });
        },
    });
};

export const useUpdateTeamSong = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, songId, request }: { teamId: string; songId: string; request: UpdateTeamSongRequest }) =>
            updateTeamSong(teamId, songId, request),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: songKeys.detail(data.teamId, data.id) });
            queryClient.invalidateQueries({ queryKey: songKeys.list(data.teamId) });
        },
    });
};

export const useDeleteTeamSong = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, songId }: { teamId: string; songId: string }) =>
            deleteTeamSong(teamId, songId),
        onSuccess: (_, { teamId }) => {
            queryClient.invalidateQueries({ queryKey: songKeys.list(teamId) });
        },
    });
};
// ... (existing exports)

export const useSearchSongs = (query: string) => {
    return useQuery({
        queryKey: [...songKeys.all, 'search', query] as const,
        queryFn: () => import('@/lib/api/song').then(mod => mod.searchSongs(query)),
        enabled: query.length > 0,
        staleTime: 1000 * 60 * 5 // Cache search results for 5 minutes
    });
};
