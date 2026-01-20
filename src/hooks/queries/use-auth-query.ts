import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, logout, refreshToken } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { STALE_TIME } from '@/constants/time';

export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

export const useUserQuery = () => {
    const { accessToken, reset } = useAuthStore();

    return useQuery({
        queryKey: authKeys.user(),
        queryFn: async () => {
            if (!accessToken) return null;

            console.log('[useUserQuery] Fetching user data with token');
            try {
                const response = await getMe(accessToken);
                if (response?.success && response.data) {
                    return response.data;
                }
                return null;
            } catch (error) {
                console.error('[useUserQuery] Error:', error);
                reset();
                return null;
            }
        },
        enabled: !!accessToken, // Only run when we have a token
        staleTime: STALE_TIME.FIVE_MINUTES,
        retry: false,
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    const { accessToken, reset } = useAuthStore();

    return useMutation({
        mutationFn: () => logout(accessToken),
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
