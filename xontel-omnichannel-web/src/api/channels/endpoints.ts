import apiClient from '../client';
import { ChannelResponse } from './types';

/**
 * Channels API Endpoints - /api/v1/channels
 */

export const channelsAPI = {
  /**
   * Get a specific channel by ID
   * GET /api/v1/channels/{channel_id}
   */
  getChannel: async (channelId: number): Promise<ChannelResponse> => {
    // Specifically removing trailing slash as per user URL example
    const response = await apiClient.get<ChannelResponse>(`/v1/channels/${channelId}`);
    return response.data;
  },
};
