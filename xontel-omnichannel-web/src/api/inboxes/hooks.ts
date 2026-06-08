import { useMutation, useQuery, useInfiniteQuery, useQueries, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { inboxesAPI } from './endpoints';
import {
    InboxCreate,
    InboxUpdate,
    InboxResponse,
    InboxMemberResponse,
    GetInboxesParams,
    InboxesListResponse,
    InboxMembersListResponse,
    InboxConversationsListResponse,
    GetInboxMemberMessagesParams,
} from './types';
import { MessagesListResponse } from '../messages/types';

/**
 * Inboxes API Hooks using React Query
 */

/**
 * List inboxes hook
 */
export const useInboxes = (params?: GetInboxesParams): UseQueryResult<InboxesListResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['inboxes', params],
        queryFn: () => inboxesAPI.listInboxes(params),
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Get single inbox hook
 */
export const useInbox = (inboxId: number): UseQueryResult<InboxResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['inboxes', inboxId],
        queryFn: () => inboxesAPI.getInbox(inboxId),
        enabled: hasToken && !!inboxId,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Create inbox hook
 */
export const useCreateInbox = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InboxCreate) => inboxesAPI.createInbox(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inboxes'] });
        },
    });
};

/**
 * Update inbox hook
 */
export const useUpdateInbox = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: InboxUpdate }) =>
            inboxesAPI.updateInbox(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['inboxes'] });
            queryClient.invalidateQueries({ queryKey: ['inboxes', id] });
        },
    });
};

/**
 * Delete inbox hook
 */
export const useDeleteInbox = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => inboxesAPI.deleteInbox(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inboxes'] });
        },
    });
};

/**
 * Inbox members hook
 */
export const useGetInboxMembers = (inboxId: number): UseQueryResult<InboxMembersListResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['inboxes', inboxId, 'members'],
        queryFn: () => inboxesAPI.getInboxMembers(inboxId),
        enabled: hasToken && !!inboxId,
        staleTime: 5 * 60 * 1000,
    });
};

// Alias for backward compatibility
export { useGetInboxMembers as useInboxMembers };

export const useInboxesUnreadCounts = (inboxIds: number[]): Record<number, number> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    const results = useQueries({
        queries: inboxIds.map((id) => ({
            queryKey: ['inboxes', id, 'unread'],
            queryFn: () => inboxesAPI.getInbox(id),
            enabled: hasToken && !!id,
            staleTime: 30 * 1000,
            refetchInterval: 60 * 1000,
        })),
    });

    return results.reduce<Record<number, number>>((acc, result, index) => {
        const id = inboxIds[index];
        if (result.data?.unread_count != null) {
            acc[id] = result.data.unread_count;
        }
        return acc;
    }, {});
};

export const useGetInboxConversations = (inboxId: number, params:{ skip?: number , limit?: number}): UseQueryResult<InboxConversationsListResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));
    return useQuery({
        queryKey: ['inboxes', inboxId, 'conversations', params.skip, params.limit],
        queryFn: () => inboxesAPI.listInboxConversations(inboxId, params),
        enabled: hasToken && inboxId > 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
};

export const useInboxMemberMessages = (
    inboxId: number,
    userId: number,
    params?: GetInboxMemberMessagesParams
): UseQueryResult<MessagesListResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));
    return useQuery({
        queryKey: ['inboxes', inboxId, 'members', userId, 'messages', params],
        queryFn: () => inboxesAPI.getInboxMemberMessages(inboxId, userId, params),
        enabled: hasToken && inboxId > 0 && userId > 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
};

export const useInboxMemberCalls = (
    inboxId: number,
    userId: number,
    params?: Omit<GetInboxMemberMessagesParams, 'message_type'>
): UseQueryResult<MessagesListResponse, Error> => {
    return useInboxMemberMessages(inboxId, userId, { ...params, message_type: 'calls' });
};

export const useInfiniteInboxMemberCalls = (
    inboxId: number,
    userId: number,
    params?: Omit<GetInboxMemberMessagesParams, 'message_type' | 'skip'>
) => {
    const limit = params?.limit ?? 20;
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));
    return useInfiniteQuery({
        queryKey: ['inboxes', inboxId, 'members', userId, 'calls', 'infinite', params],
        queryFn: ({ pageParam }) =>
            inboxesAPI.getInboxMemberMessages(inboxId, userId, {
                ...params,
                message_type: 'calls',
                skip: pageParam as number,
                limit,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((acc, p) => acc + p.items.length, 0);
            return loaded < lastPage.total ? loaded : undefined;
        },
        enabled: hasToken && inboxId > 0 && userId > 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
};
