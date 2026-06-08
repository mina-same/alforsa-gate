import { useMutation, useQuery, useInfiniteQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from './endpoints';
import {
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    GetUsersParams,
    SearchUsersParams,
    UserInboxesResponse,
} from './types';
import { useCurrentUser } from '../auth/hooks';
import { userPermissionsStorage } from '@/lib/userPermissions';

/**
 * Users API Hooks using React Query
 */

/**
 * List users hook - automatically includes organization_id from current user
 */
export const useUsers = (params?: GetUsersParams, enabled = true): UseQueryResult<UserListResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));
    const { data: currentUser } = useCurrentUser();

    const mergedParams: GetUsersParams | undefined = currentUser?.organization_id
        ? { ...params, organization_id: currentUser.organization_id }
        : params;

    return useQuery({
        queryKey: ['users', mergedParams],
        queryFn: () => usersAPI.listUsers(mergedParams),
        enabled: hasToken && enabled,
        staleTime: 5 * 60 * 1000,
    });
};

const USERS_PAGE_SIZE = 20;

/**
 * Infinite-scroll users hook — fetches one page at a time, keyed by search/filters.
 */
export const useUsersInfinite = (params?: Omit<GetUsersParams, 'skip' | 'limit' | 'page' | 'size'>) => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));
    const { data: currentUser } = useCurrentUser();

    const baseParams: GetUsersParams = currentUser?.organization_id
        ? { ...params, organization_id: currentUser.organization_id }
        : { ...params };

    return useInfiniteQuery({
        queryKey: ['users', 'infinite', baseParams],
        queryFn: ({ pageParam }) =>
            usersAPI.listUsers({
                ...baseParams,
                skip: ((pageParam as number) - 1) * USERS_PAGE_SIZE,
                limit: USERS_PAGE_SIZE,
            }),
        initialPageParam: 1,
        // Use total from the response — this is accurate regardless of whether
        // the backend echoes the page number correctly.
        getNextPageParam: (lastPage, allPages) => {
            const fetched = allPages.reduce((sum, p) => sum + p.users.length, 0);
            return fetched < lastPage.total ? allPages.length + 1 : undefined;
        },
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Get multiple users by IDs hook
 */
export const useUsersByIds = (userIds: number[]): UseQueryResult<UserResponse[], Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['users', 'batch', userIds],
        queryFn: async () => {
            if (userIds.length === 0) return [];

            // Fetch users in parallel
            const userPromises = userIds.map(userId => usersAPI.getUser(userId));
            const users = await Promise.all(userPromises);
            return users;
        },
        enabled: hasToken && userIds.length > 0,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Get single user hook
 */
export const useUser = (userId: number): UseQueryResult<UserResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['users', userId],
        queryFn: () => usersAPI.getUser(userId),
        enabled: hasToken && !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Create user hook
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UserCreate) => usersAPI.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

/**
 * Update user hook
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UserUpdate }) =>
            usersAPI.updateUser(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', id] });
        },
    });
};

/**
 * Delete user hook
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => usersAPI.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

/**
 * Activate user hook
 */
export const useActivateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => usersAPI.activateUser(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', id] });
        },
    });
};

/**
 * Deactivate user hook
 */
export const useDeactivateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => usersAPI.deactivateUser(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', id] });
        },
    });
};

/**
 * Search users hook
 */
export const useSearchUsers = (params: SearchUsersParams, enabled: boolean = true): UseQueryResult<UserResponse[], Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['users', 'search', params.q, params.limit],
        queryFn: () => usersAPI.searchUsers(params),
        enabled: hasToken && enabled && params.q.length > 0,
        staleTime: 1 * 60 * 1000,
    });
};

/**
 * Get user inboxes hook
 */
export const useUserInboxes = (userId: number): UseQueryResult<UserInboxesResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['users', userId, 'inboxes'],
        queryFn: async () => {
            console.log('🔍 Fetching inboxes for user:', userId);
            const data = await usersAPI.getUserInboxes(userId);
            console.log('✅ Fetched inboxes:', data);
            // Save to local storage as requested
            localStorage.setItem('userInboxes', JSON.stringify(data));
            return data;
        },
        enabled: hasToken && !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * User permissions hook — fetches from API and keeps localStorage in sync.
 * Refetches automatically when the window regains focus or the query goes stale.
 */
export const useUserPermissions = (userId: number) => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['users', userId, 'permissions'],
        queryFn: async () => {
            const data = await usersAPI.getPermissions(userId);
            userPermissionsStorage.set(data);
            return data;
        },
        enabled: hasToken && !!userId,
        staleTime: 5 * 60 * 1000,      // treat as fresh for 5 minutes
        refetchOnWindowFocus: true,      // re-sync when user returns to the tab
    });
};

/**
 * Self reset password hook (logged-in user resets own password)
 */
export const useSelfResetPassword = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
            usersAPI.selfResetPassword(currentPassword, newPassword),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] });
        },
    });
};