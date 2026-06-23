import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getTeamContis,
    getConti,
    createConti,
    updateConti,
    deleteConti
} from '@/domains/conti/api/conti.api';
import { CreateContiRequest, UpdateContiRequest } from '@/types/conti';

export const contiKeys = {
    all: ['contis'] as const,
    list: (teamId: string) => [...contiKeys.all, 'list', teamId] as const,
    detail: (id: string) => [...contiKeys.all, 'detail', id] as const,
};

export const useContis = (teamId: string | null) => {
    return useQuery({
        queryKey: contiKeys.list(teamId || ''),
        queryFn: () => getTeamContis(teamId!, { page: 0, size: 100 }),
        enabled: !!teamId,
        select: (data) => data.content || [],
    });
};

export const useContiDetail = (contiId: string | null) => {
    return useQuery({
        queryKey: contiKeys.detail(contiId || ''),
        queryFn: () => getConti(contiId!),
        enabled: !!contiId,
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
            queryClient.setQueryData(contiKeys.detail(data.id), data);
            queryClient.invalidateQueries({ queryKey: contiKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: contiKeys.list(data.teamId) });
        },
    });
};

export const useDeleteConti = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contiId: string) => deleteConti(contiId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contiKeys.all });
        },
    });
};
