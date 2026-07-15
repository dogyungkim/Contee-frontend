import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAccount, getMe, logout, refreshToken, uploadProfileImage } from '@/domains/auth/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import { STALE_TIME } from '@/constants/time';
import { DEV_AUTH_BYPASS_ENABLED, DEV_AUTH_BYPASS_USER } from '@/domains/auth/dev-auth';

export const authKeys = {
    all: ['auth'] as const,
    currentUser: () => [...authKeys.all, 'user'] as const,
    user: (sessionVersion: number) => [...authKeys.currentUser(), sessionVersion] as const,
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

export const useUserQuery = (enabled = true) => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const hasCheckedSession = useAuthStore((state) => state.hasCheckedSession);
    const sessionVersion = useAuthStore((state) => state.sessionVersion);

    return useQuery({
        queryKey: authKeys.user(sessionVersion),
        queryFn: async () => {
            if (DEV_AUTH_BYPASS_ENABLED) return DEV_AUTH_BYPASS_USER;
            if (!accessToken) return null;

            return await getMe(accessToken);
        },
        enabled: enabled && (DEV_AUTH_BYPASS_ENABLED || (hasCheckedSession && !!accessToken)),
        staleTime: STALE_TIME.FIVE_MINUTES,
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    const { reset } = useAuthStore();

    return useMutation({
        mutationFn: DEV_AUTH_BYPASS_ENABLED ? async () => undefined : logout,
        onSuccess: () => {
            reset();
            queryClient.clear();
        },
        onError: (error) => {
            console.error('Logout failed:', error);
            // Still reset local state on error
            reset();
            queryClient.clear();
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
            queryClient.clear();
        },
        onError: (error) => {
            console.error('Delete account failed:', error);
        },
    });
};

export const useUpdateProfileImageMutation = () => {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: DEV_AUTH_BYPASS_ENABLED
            ? async () => DEV_AUTH_BYPASS_USER
            : (file: File) => uploadProfileImage(file),
        onSuccess: (user) => {
            setUser(user);
            queryClient.setQueriesData({ queryKey: authKeys.currentUser() }, user);
        },
        onError: (error) => {
            console.error('Profile image update failed:', error);
        },
    });
};
