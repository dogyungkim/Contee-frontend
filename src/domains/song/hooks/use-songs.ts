import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getTeamSongs,
    updateTeamSong
} from '@/domains/song/api/song.api';
import { UpdateTeamSongRequest } from '@/types/song';

export const songKeys = {
    all: ['songs'] as const,
    list: (teamId: string) => [...songKeys.all, 'list', teamId] as const,
};

export const useTeamSongs = (teamId: string | null) => {
    return useQuery({
        queryKey: songKeys.list(teamId || ''),
        queryFn: () => getTeamSongs(teamId!),
        enabled: !!teamId,
    });
};

export const useUpdateTeamSong = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, songId, request }: { teamId: string; songId: string; request: UpdateTeamSongRequest }) =>
            updateTeamSong(teamId, songId, request),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: songKeys.list(data.teamId) });
        },
    });
};
