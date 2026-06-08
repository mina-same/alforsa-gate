import apiClient from '../client';
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
import { UserResponse } from '../users/types';
import { ConversationResponse } from '../conversations/types';

/**
 * Inboxes API Endpoints - /api/v1/inboxes
 */

export const inboxesAPI = {
    /**
     * List all inboxes
     * GET /api/v1/inboxes/
     */
    listInboxes: async (params?: GetInboxesParams): Promise<InboxesListResponse> => {
        const response = await apiClient.get<InboxesListResponse>('/v1/inboxes/', { params });
        return response.data;
    },

    /**
     * Create a new inbox
     * POST /api/v1/inboxes/
     */
    createInbox: async (data: InboxCreate): Promise<InboxResponse> => {
        const response = await apiClient.post<InboxResponse>('/v1/inboxes/', data);
        return response.data;
    },

    /**
     * Get a specific inbox
     * GET /api/v1/inboxes/{inbox_id}
     */
    getInbox: async (inboxId: number): Promise<InboxResponse> => {
        const response = await apiClient.get<InboxResponse>(`/v1/inboxes/${inboxId}`);
        return response.data;
    },

    /**
     * Update an inbox
     * PUT /api/v1/inboxes/{inbox_id}
     */
    updateInbox: async (inboxId: number, data: InboxUpdate): Promise<InboxResponse> => {
        const response = await apiClient.put<InboxResponse>(`/v1/inboxes/${inboxId}/`, data);
        return response.data;
    },

    /**
     * Delete an inbox
     * DELETE /api/v1/inboxes/{inbox_id}
     */
    deleteInbox: async (inboxId: number): Promise<void> => {
        await apiClient.delete(`/v1/inboxes/${inboxId}/`);
    },

    /**
     * List inbox members
     * GET /api/v1/inboxes/{inbox_id}/members
     */
    getInboxMembers: async (inboxId: number): Promise<InboxMembersListResponse> => {
        const response = await apiClient.get<InboxMembersListResponse>(`/v1/inboxes/${inboxId}/members`);
        return response.data;
    },

    /**
     * Add member to inbox
     * POST /api/v1/inboxes/{inbox_id}/members
     */
    addInboxMember: async (inboxId: number, data: { user_id: number; role?: string }): Promise<InboxMemberResponse> => {
        const response = await apiClient.post<InboxMemberResponse>(`/v1/inboxes/${inboxId}/members/`, data);
        return response.data;
    },

    listInboxConversations: async (inboxId: number, params:{ skip?: number , limit?: number}): Promise<InboxConversationsListResponse> => {
        const response = await apiClient.get<InboxConversationsListResponse>(`/v1/inboxes/${inboxId}/conversations/`, { params });
        return response.data;
    },

    /**
     * Remove member from inbox
     * DELETE /api/v1/inboxes/{inbox_id}/members/{user_id}
     */
    removeInboxMember: async (inboxId: number, userId: number): Promise<void> => {
        await apiClient.delete(`/v1/inboxes/${inboxId}/members/${userId}/`);
    },

    /**
     * Get messages for a specific inbox member
     * GET /api/v1/inboxes/{inbox_id}/members/{user_id}/messages
     */
    getInboxMemberMessages: async (
        inboxId: number,
        userId: number,
        params?: GetInboxMemberMessagesParams
    ): Promise<MessagesListResponse> => {
        const response = await apiClient.get<MessagesListResponse>(
            `/v1/inboxes/${inboxId}/members/${userId}/messages`,
            { params }
        );
        return response.data;
    },
};
