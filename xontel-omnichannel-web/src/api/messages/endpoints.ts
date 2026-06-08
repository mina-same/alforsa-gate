import apiClient from '../client';
import {
  MessageCreate,
  MessageUpdate,
  MessageResponse,
  MessageDirection,
  MessageType,
  MessagesListResponse,
} from './types';

/**
 * Messages API Endpoints - /api/v1/messages
 */

export const messagesAPI = {
  /**
   * Create a new message
   * POST /api/v1/messages/
   */
  createMessage: async (data: MessageCreate): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/v1/messages/', data);
    return response.data;
  },

  /**
   * Get message by ID
   * GET /api/v1/messages/{message_id}
   */
  getMessage: async (messageId: number): Promise<MessageResponse> => {
    const response = await apiClient.get<MessageResponse>(`/v1/messages/${messageId}`);
    return response.data;
  },

  /**
   * Update message
   * PUT /api/v1/messages/{message_id}
   */
  updateMessage: async (messageId: number, data: MessageUpdate): Promise<MessageResponse> => {
    const response = await apiClient.put<MessageResponse>(`/v1/messages/${messageId}`, data);
    return response.data;
  },

  /**
   * Delete message
   * DELETE /api/v1/messages/{message_id}
   */
  deleteMessage: async (messageId: number): Promise<void> => {
    await apiClient.delete(`/v1/messages/${messageId}`);
  },

  /**
   * List conversation messages
   * GET /api/v1/messages/conversation/{conversation_id}
   */
  listConversationMessages: async (
    conversationId: number,
    params?: {
      skip?: number;
      limit?: number;
      direction?: MessageDirection;
      message_type?: MessageType;
    }
  ): Promise<MessagesListResponse> => {
    const response = await apiClient.get<MessagesListResponse>(
      `/v1/messages/conversation/${conversationId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Update message status
   * PUT /api/v1/messages/{message_id}/status
   */
  updateMessageStatus: async (messageId: number, status: string): Promise<MessageResponse> => {
    const response = await apiClient.put<MessageResponse>(
      `/v1/messages/${messageId}/status`,
      null,
      { params: { status_update: status } }
    );
    return response.data;
  },

  /**
   * Get conversation message stats
   * GET /api/v1/messages/conversation/{conversation_id}/stats
   */
  getConversationStats: async (conversationId: number): Promise<any> => {
    const response = await apiClient.get(`/v1/messages/conversation/${conversationId}/stats`);
    return response.data;
  },

  /**
   * Search messages
   * GET /api/v1/messages/search/
   */
  searchMessages: async (params: {
    q: string;
    conversation_id?: number | null;
    skip?: number;
    limit?: number;
  }): Promise<MessageResponse[]> => {
    const response = await apiClient.get<MessageResponse[]>('/v1/messages/search/', { params });
    return response.data;
  },
};
