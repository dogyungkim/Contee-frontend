import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getTeamContis,
    getConti,
    createConti,
    updateConti,
    publishConti,
    deleteConti,
    enableExternalShare,
    disableExternalShare,
    getSharedConti
} from '@/domains/conti/api/conti.api';
import { Conti, CreateContiRequest, UpdateContiRequest } from '@/types/conti';
import type { ContiSearchParamsDto } from '@/domains/conti/api/conti.dto';

export const contiKeys = {
    all: ['contis'] as const,
    lists: () => [...contiKeys.all, 'list'] as const,
    teamLists: (teamId: string) => [...contiKeys.lists(), teamId] as const,
    list: (teamId: string, params?: ContiSearchParamsDto) => [...contiKeys.teamLists(teamId), params] as const,
    detail: (id: string) => [...contiKeys.all, 'detail', id] as const,
    shared: (token: string) => [...contiKeys.all, 'shared', token] as const,
};

export const useContis = (teamId: string | null, params: ContiSearchParamsDto = { page: 0, size: 100 }) => {
    return useQuery({
        queryKey: contiKeys.list(teamId || '', params),
        queryFn: () => getTeamContis(teamId!, params),
        enabled: !!teamId,
        placeholderData: (previousData, previousQuery) => {
            const previousTeamId = previousQuery?.queryKey[2];
            return previousTeamId === teamId ? previousData : undefined;
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

export const useSharedConti = (token: string | null) => {
    return useQuery({
        queryKey: contiKeys.shared(token || ''),
        queryFn: () => getSharedConti(token!),
        enabled: !!token,
    });
};

export const useCreateConti = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateContiRequest) => createConti(request),
        onSuccess: (_, request) => {
            queryClient.invalidateQueries({ queryKey: contiKeys.teamLists(request.teamId) });
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
            queryClient.invalidateQueries({ queryKey: contiKeys.teamLists(data.teamId) });
        },
    });
};

export const usePublishConti = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contiId: string) => publishConti(contiId),
        onSuccess: (data) => {
            queryClient.setQueryData(contiKeys.detail(data.id), data);
            queryClient.invalidateQueries({ queryKey: contiKeys.teamLists(data.teamId) });
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

export const useEnableExternalShare = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contiId: string) => enableExternalShare(contiId),
        onSuccess: (externalShare, contiId) => {
            const previous = queryClient.getQueryData<Conti>(contiKeys.detail(contiId));

            if (previous) {
                queryClient.setQueryData(contiKeys.detail(contiId), {
                    ...previous,
                    externalShare,
                    externalShareEnabled: externalShare.enabled,
                });
                queryClient.invalidateQueries({ queryKey: contiKeys.teamLists(previous.teamId) });
            } else {
                queryClient.invalidateQueries({ queryKey: contiKeys.all });
            }
        },
    });
};

export const useDisableExternalShare = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contiId: string) => disableExternalShare(contiId),
        onSuccess: (_, contiId) => {
            const previous = queryClient.getQueryData<Conti>(contiKeys.detail(contiId));

            if (previous) {
                queryClient.setQueryData(contiKeys.detail(contiId), {
                    ...previous,
                    externalShare: {
                        enabled: false,
                        token: null,
                        url: null,
                        createdAt: null,
                        createdById: null,
                    },
                    externalShareEnabled: false,
                });
                queryClient.invalidateQueries({ queryKey: contiKeys.teamLists(previous.teamId) });
            } else {
                queryClient.invalidateQueries({ queryKey: contiKeys.all });
            }
        },
    });
};
