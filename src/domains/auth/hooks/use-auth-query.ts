import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { deleteAccount, getMe, logout, refreshToken } from '@/domains/auth/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import { STALE_TIME } from '@/constants/time';
import { DEV_AUTH_BYPASS_ENABLED, DEV_AUTH_BYPASS_USER } from '@/domains/auth/dev-auth';

export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
    sessionRecovery: () => [...authKeys.all, 'session-recovery'] as const,
};

export const useSessionRecoveryQuery = (enabled: boolean) => {
    return useQuery({
        queryKey: authKeys.sessionRecovery(),
        queryFn: refreshToken,
        enabled: enabled && !DEV_AUTH_BYPASS_ENABLED,
        retry: false,
        staleTime: 0,
        gcTime: 0,
    });
};

export const useUserQuery = () => {
    const { accessToken, reset } = useAuthStore();

    return useQuery({
        queryKey: authKeys.user(),
        queryFn: async () => {
            if (DEV_AUTH_BYPASS_ENABLED) return DEV_AUTH_BYPASS_USER;
            if (!accessToken) return null;

            console.log('[useUserQuery] Fetching user data with token');
            try {
                return await getMe(accessToken);
            } catch (error) {
                console.error('[useUserQuery] Error:', error);
                const status = (error as AxiosError).response?.status;
                if (status === 401 || status === 403) {
                    reset();
                    return null;
                }
                throw error;
            }
        },
        enabled: DEV_AUTH_BYPASS_ENABLED || !!accessToken, // Only run when we have a token
        staleTime: STALE_TIME.FIVE_MINUTES,
        retry: false,
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    const { reset } = useAuthStore();

    return useMutation({
        mutationFn: DEV_AUTH_BYPASS_ENABLED ? async () => undefined : logout,
        onSuccess: () => {
            reset();
            queryClient.setQueryData(authKeys.user(), null);
            queryClient.removeQueries({ queryKey: authKeys.all });
        },
        onError: (error) => {
            console.error('Logout failed:', error);
            // Still reset local state on error
            reset();
            queryClient.setQueryData(authKeys.user(), null);
        }
    });
};

export const useDeleteAccountMutation = () => {
    const queryClient = useQueryClient();
    const { reset } = useAuthStore();

    return useMutation({
        mutationFn: DEV_AUTH_BYPASS_ENABLED ? async () => undefined : deleteAccount,
        onSuccess: () => {
            reset();
            queryClient.setQueryData(authKeys.user(), null);
            queryClient.removeQueries({ queryKey: authKeys.all });
        },
        onError: (error) => {
            console.error('Delete account failed:', error);
        },
    });
};
