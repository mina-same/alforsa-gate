import apiClient from '../client';
import {
  EmailSendRequest,
  EmailMessageResponse,
  EmailMessageListResponse,
  EmailActionResponse,
  GetEmailMessagesParams,
  EmailChannelListResponse,
} from './types';

export const emailAPI = {
  /**
   * Send an email
   */
  sendEmail: async (data: EmailSendRequest): Promise<EmailActionResponse> => {
    const response = await apiClient.post<EmailActionResponse>('/v1/email/send', data);
    return response.data;
  },

  /**
   * Get email message details
   */
  getEmailMessage: async (message_id: number): Promise<EmailMessageResponse> => {
    const response = await apiClient.get<EmailMessageResponse>(`/v1/email/messages/${message_id}`);
    return response.data;
  },

  /**
   * Delete an email message
   */
  deleteEmailMessage: async (message_id: number): Promise<void> => {
    await apiClient.delete(`/v1/email/messages/${message_id}`);
  },

  /**
   * List email messages
   */
  listEmailMessages: async (params: GetEmailMessagesParams): Promise<EmailMessageListResponse> => {
    const response = await apiClient.get<EmailMessageListResponse>('/v1/email/messages', { params });
    return response.data;
  },

  /**
   * Get unread email messages
   */
  getUnreadEmailMessages: async (): Promise<EmailMessageListResponse> => {
    const response = await apiClient.get<EmailMessageListResponse>('/v1/email/messages/unread');
    return response.data;
  },

  /**
   * Mark an email message as read
   */
  markAsRead: async (message_id: number): Promise<EmailActionResponse> => {
    const response = await apiClient.post<EmailActionResponse>(`/v1/email/messages/${message_id}/read`);
    return response.data;
  },

  /**
   * Reply to an email message
   */
  replyToEmail: async (message_id: number, data: EmailSendRequest): Promise<EmailActionResponse> => {
    const response = await apiClient.post<EmailActionResponse>(`/v1/email/messages/${message_id}/reply`, data);
    return response.data;
  },

  /**
   * Forward an email message
   */
  forwardEmail: async (message_id: number, data: EmailSendRequest): Promise<EmailActionResponse> => {
    const response = await apiClient.post<EmailActionResponse>(`/v1/email/messages/${message_id}/forward`, data);
    return response.data;
  },

  /**
   * Download an email attachment
   */
  downloadAttachment: async (message_id: number, attachment_id: number): Promise<string> => {
    const response = await apiClient.get<string>(`/v1/email/messages/${message_id}/attachments/${attachment_id}/download`);
    return response.data;
  },

  
  
  
  
  /**
   * Track email open
   */
  trackEmailOpen: async (message_id: number): Promise<any> => {
    const response = await apiClient.get(`/v1/email/tracking/open/${message_id}`);
    return response.data;
  },

  /**
   * Track email click
   */
  trackEmailClick: async (link_id: string): Promise<string> => {
    const response = await apiClient.get(`/v1/email/tracking/click/${link_id}`);
    return response.data;
  },

  /**
   * Get email channels
   */
  getEmailChannels: async (params?: { skip?: number; limit?: number }): Promise<EmailChannelListResponse> => {
    const response = await apiClient.get<EmailChannelListResponse>('/v1/email/channels/', { params });
    return response.data;
  },
};
