import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getContis,
    getConti,
    createConti,
    updateConti,
    deleteConti,
    addContiSong,
    removeContiSong,
    updateContiSong,
    reorderContiSongs
} from '@/lib/api/conti';
import { Conti, CreateContiRequest, UpdateContiRequest, AddContiSongRequest, UpdateContiSongRequest } from '@/types/conti';

export const contiKeys = {
    all: ['contis'] as const,
    list: (teamId: string) => [...contiKeys.all, 'list', teamId] as const,
    detail: (id: string) => [...contiKeys.all, 'detail', id] as const,
    songs: (id: string) => [...contiKeys.detail(id), 'songs'] as const,
};

export const useContis = (teamId: string | null) => {
    return useQuery({
        queryKey: contiKeys.list(teamId || ''),
        queryFn: () => getContis(0, 100), // TODO: Implement proper pagination
        enabled: !!teamId,
        select: (data) => {
            const contis = data.content || [];
            if (!teamId) return contis;
            return contis.filter(c => c.teamId === teamId);
        },
    });
};

export const useContiDetail = (contiId: string | null) => {
    return useQuery({
        queryKey: contiKeys.detail(contiId || ''),
        queryFn: () => getConti(contiId!),
        enabled: !!contiId,
    });
};

export const useContiSongs = (contiId: string | null) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: contiKeys.songs(contiId || ''),
        queryFn: () => {
            // Get songs from the conti detail query cache
            const conti = queryClient.getQueryData(contiKeys.detail(contiId!)) as Conti;
            return conti?.contiSongs || [];
        },
        enabled: !!contiId,
        // This query depends on the conti detail query
        initialData: () => {
            const conti = queryClient.getQueryData(contiKeys.detail(contiId!)) as Conti;
            return conti?.contiSongs || [];
        },
    });
};

export const useCreateConti = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateContiRequest) => createConti(request),
        onSuccess: (_, request) => {
            queryClient.invalidateQueries({ queryKey: contiKeys.list(request.teamId) });
        },
    });
};

export const useUpdateConti = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contiId, request }: { contiId: string; request: UpdateContiRequest }) =>
            updateConti(contiId, request),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: contiKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: contiKeys.list(data.teamId) });
        },
    });
};

export const useDeleteConti = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contiId: string) => deleteConti(contiId),
        onSuccess: (_, contiId) => {
            queryClient.invalidateQueries({ queryKey: contiKeys.all });
        },
    });
};

export const useAddContiSong = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contiId, request }: { contiId: string; request: AddContiSongRequest }) =>
            addContiSong(contiId, request),
        onSuccess: (_, { contiId }) => {
            // Invalidate conti detail to refresh the contiSongs array
            queryClient.invalidateQueries({ queryKey: contiKeys.detail(contiId) });
        },
    });
};

export const useRemoveContiSong = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contiId, contiSongId }: { contiId: string; contiSongId: string }) =>
            removeContiSong(contiId, contiSongId),
        onSuccess: (_, { contiId }) => {
            // Invalidate conti detail to refresh the contiSongs array
            queryClient.invalidateQueries({ queryKey: contiKeys.detail(contiId) });
        },
    });
};

export const useUpdateContiSongOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contiId, songIds }: { contiId: string; songIds: string[] }) => {
            const songOrders = songIds.map((id, index) => ({
                contiSongId: id,
                order: index + 1 // 1-based index per API doc
            }));
            return reorderContiSongs(contiId, { songOrders });
        },
        onSuccess: (_, { contiId }) => {
            // Invalidate conti detail to refresh the contiSongs array
            queryClient.invalidateQueries({ queryKey: contiKeys.detail(contiId) });
        },
    });
};

export const useUpdateContiSongDetail = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contiId, contiSongId, request }: { contiId: string; contiSongId: string; request: UpdateContiSongRequest }) =>
            updateContiSong(contiId, contiSongId, request),
        onSuccess: (_, { contiId }) => {
            // Invalidate conti detail to refresh the contiSongs array
            queryClient.invalidateQueries({ queryKey: contiKeys.detail(contiId) });
        },
    });
};
