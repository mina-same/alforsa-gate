import apiClient from '../client';
import {
  Label,
  ConversationLabelsListResponse,
  LabelsListResponse,
  CreateLabel,
} from './types';

export const labelsAPI = {
  /**
   * GET /api/v1/labels/
   */
  getLabels: async (skip: number, limit: number): Promise<LabelsListResponse> => {
    const response = await apiClient.get<LabelsListResponse>('/v1/labels/', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * GET /api/v1/conversations/{conversation_id}/labels
   */
  getConversationLabels: async (
    conversationId: number,
    skip: number,
    limit: number,
  ): Promise<ConversationLabelsListResponse> => {
    const response = await apiClient.get<ConversationLabelsListResponse>(
      `/v1/conversations/${conversationId}/labels`,
      { params: { skip, limit } },
    );
    return response.data;
  },

  /**
   * POST /api/v1/labels/conversations/{conversation_id}/labels/{label_id}
   */
  applyLabelToConversation: async (
    conversationId: number,
    labelId: number,
  ): Promise<{ message: string; id: number }> => {
    const response = await apiClient.post(
      `/v1/labels/conversations/${conversationId}/labels/${labelId}`,
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/labels/conversations/{conversation_id}/labels/{label_id}
   */
  removeLabelFromConversation: async (
    conversationId: number,
    labelId: number,
  ): Promise<void> => {
    await apiClient.delete(
      `/v1/labels/conversations/${conversationId}/labels/${labelId}`,
    );
  },

  /**
   * POST /api/v1/labels/
   */
  createLabel: async (data: CreateLabel): Promise<Label> => {
    const response = await apiClient.post<Label>('/v1/labels/', data);
    return response.data;
  },
};
