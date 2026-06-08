import apiClient from "../client";
import {
  ConversationResponse,
  ConversationSnooze,
  ConversationBulkAction,
  ConversationNoteCreate,
  ConversationNote,
  ConversationMediaItem,
  GetConversationsParams,
  CreateGroupConversationParams,
  CreateDirectConversationParams,
  AllConversations,
  ConversationMediaListResponse,
} from "./types";

/**
 * Conversations API Endpoints - /api/v1/conversations
 */

export const conversationsAPI = {
  /**
   * List conversations
   * GET /api/v1/conversations/
   */
  listConversations: async (
    params?: GetConversationsParams,
  ): Promise<AllConversations> => {
    const { skip = 0, limit = 20, inbox_id, channel_id, assigned_agent_id, status, conversation_type, contact_name } = params || {};

    const requestParams: Record<string, unknown> = { skip, limit };
    if (status !== undefined && status !== null) requestParams.status = status;
    if (conversation_type !== undefined && conversation_type !== null) requestParams.conversation_type = conversation_type;

    // Build the "query" parameter for generic query filters
    const queryParts: string[] = [];
    if (inbox_id !== undefined && inbox_id !== null) queryParts.push(`inbox_id=${inbox_id}`);
    if (channel_id !== undefined && channel_id !== null) queryParts.push(`channel_id=${channel_id}`);
    if (assigned_agent_id !== undefined && assigned_agent_id !== null) queryParts.push(`assigned_agent_id=${assigned_agent_id}`);
    if (contact_name !== undefined && contact_name !== null) queryParts.push(`contact_name=${encodeURIComponent(contact_name)}`);

    if (queryParts.length > 0) {
      requestParams.query = queryParts.join("&");
    }

    const response = await apiClient.get<AllConversations>(
      "/v1/conversations/",
      { params: requestParams },
    );
    return response.data;
  },

  /**
   * Get single conversation
   * GET /api/v1/conversations/{conversation_id}
   */
  getConversation: async (
    conversationId: number,
  ): Promise<ConversationResponse> => {
    const response = await apiClient.get<ConversationResponse>(
      `/v1/conversations/${conversationId}`,
    );
    return response.data;
  },

  /**
   * Update conversation
   * PUT /api/v1/conversations/{conversation_id}
   */
  updateConversation: async (
    conversationId: number,
    data: Partial<ConversationResponse>,
  ): Promise<ConversationResponse> => {
    const response = await apiClient.put<ConversationResponse>(
      `/v1/conversations/${conversationId}`,
      data,
    );
    return response.data;
  },

  getConversationMedia: async (
    conversationId: number,
    mediaType?: string,
  ): Promise<ConversationMediaListResponse> => {
    const response = await apiClient.get<ConversationMediaListResponse>(
      `/v1/conversations/${conversationId}/media`,
      { params: mediaType ? { media_type: mediaType } : undefined },
    );
    return response.data;
  },

  /**
   * Assign conversation to agent
   * POST /api/v1/conversations/{conversation_id}/assign
   */
  assignConversation: async (
    conversationId: number,
    agentId: number,
  ): Promise<void> => {
    await apiClient.post(`/v1/conversations/${conversationId}/assign`, null, {
      params: { agent_id: agentId },
    });
  },

  /**
   * Unassign agent from conversation
   * POST /api/v1/conversations/{conversation_id}/unassign
   */
  unassignConversation: async (conversationId: number): Promise<void> => {
    await apiClient.post(`/v1/conversations/${conversationId}/unassign`);
  },

  /**
   * Close conversation
   * POST /api/v1/conversations/{conversation_id}/close
   */
  closeConversation: async (conversationId: number): Promise<void> => {
    await apiClient.post(`/v1/conversations/${conversationId}/close`);
  },

  /**
   * Snooze conversation
   * POST /api/v1/conversations/{conversation_id}/snooze
   */
  snoozeConversation: async (
    conversationId: number,
    data: ConversationSnooze,
  ): Promise<void> => {
    await apiClient.post(`/v1/conversations/${conversationId}/snooze`, data);
  },

  /**
   * Unsnooze conversation
   * POST /api/v1/conversations/{conversation_id}/unsnooze
   */
  unsnoozeConversation: async (conversationId: number): Promise<void> => {
    await apiClient.post(`/v1/conversations/${conversationId}/unsnooze`);
  },

  /**
   * Bulk action on conversations
   * POST /api/v1/conversations/bulk-action
   */
  bulkAction: async (data: ConversationBulkAction): Promise<void> => {
    await apiClient.post("/v1/conversations/bulk-action", data);
  },

  /**
   * Create note on conversation
   * POST /api/v1/conversations/{conversation_id}/notes
   */
  createNote: async (
    conversationId: number,
    data: ConversationNoteCreate,
  ): Promise<void> => {
    await apiClient.post(`/v1/conversations/${conversationId}/notes`, data);
  },

  /**
   * Get notes for conversation
   * GET /api/v1/conversations/{conversation_id}/notes
   */
  getNotes: async (conversationId: number): Promise<ConversationNote[]> => {
    const response = await apiClient.get<ConversationNote[]>(
      `/v1/conversations/${conversationId}/notes`,
    );
    return response.data;
  },

  /**
   * Delete note
   * DELETE /api/v1/conversations/notes/{note_id}
   */
  deleteNote: async (noteId: number): Promise<void> => {
    await apiClient.delete(`/v1/conversations/notes/${noteId}`);
  },

  pinConversation: async (conversationId: number): Promise<void> => {
    await apiClient.put(`/v1/conversations/${conversationId}/pin`);
  },

  unpinConversation: async (conversationId: number): Promise<void> => {
    await apiClient.put(`/v1/conversations/${conversationId}/unpin`);
  },

  /**
   * Get AI suggestions for conversation
   * GET /api/v1/conversations/{conversation_id}/suggestions
   */
  getConversationSuggestions: async (
    conversationId: number,
  ): Promise<{ suggestions: string[] }> => {
    const response = await apiClient.get(
      `/v1/conversations/${conversationId}/suggestions`,
    );
    return response.data;
  },

  /**
   * Mark conversation messages as read
   * POST /api/v1/conversations/{conversation_id}/mark-read
   */
  markAsRead: async (conversationId: number): Promise<void> => {
    await apiClient.post(`/v1/conversations/${conversationId}/mark-read`);
  },

  /**
   * Create group conversation
   * POST /api/v1/conversations/group
   */
  createGroupConversation: async (
    data: CreateGroupConversationParams,
  ): Promise<ConversationResponse> => {
    const response = await apiClient.post<ConversationResponse>(
      "/v1/conversations/group",
      data,
    );
    return response.data;
  },

  /**
   * Create direct conversation
   * POST /api/v1/conversations/direct
   */
  createDirectConversation: async (
    data: CreateDirectConversationParams,
  ): Promise<ConversationResponse> => {
    const response = await apiClient.post<ConversationResponse>(
      "/v1/conversations/direct",
      data,
    );
    return response.data;
  },
};
