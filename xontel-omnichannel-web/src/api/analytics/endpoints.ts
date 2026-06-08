import apiClient from '../client';
import {
    DashboardStatsResponse,
    ConversationStatsResponse,
    AgentStatsResponse,
    ChannelStatsResponse,
    GetAnalyticsParams,
    MyAgentAnalyticsParams,
    MyAgentAnalyticsResponse,
} from './types';

/**
 * Analytics API Endpoints - /api/v1/analytics
 */

export const analyticsAPI = {
    /**
     * Get dashboard summary stats
     * GET /api/v1/analytics/dashboard/
     */
    getDashboardStats: async (params?: GetAnalyticsParams): Promise<DashboardStatsResponse> => {
        const response = await apiClient.get<DashboardStatsResponse>('/v1/analytics/dashboard/', { params });
        return response.data;
    },

    /**
     * Get conversation metrics over time
     * GET /api/v1/analytics/conversations/
     */
    getConversationStats: async (params?: GetAnalyticsParams): Promise<ConversationStatsResponse[]> => {
        const response = await apiClient.get<ConversationStatsResponse[]>('/v1/analytics/conversations/', { params });
        return response.data;
    },

    /**
     * Get agent performance stats
     * GET /api/v1/analytics/agents/
     */
    getAgentStats: async (params?: GetAnalyticsParams): Promise<AgentStatsResponse[]> => {
        const response = await apiClient.get<AgentStatsResponse[]>('/v1/analytics/agents/', { params });
        return response.data;
    },

    /**
     * Get channel performance stats
     * GET /api/v1/analytics/channels/
     */
    getChannelStats: async (params?: GetAnalyticsParams): Promise<ChannelStatsResponse[]> => {
        const response = await apiClient.get<ChannelStatsResponse[]>('/v1/analytics/channels/', { params });
        return response.data;
    },

    /**
     * Get analytics for the current agent (me)
     * GET /api/v1/analytics/agents/me
     */
    getMyAgentAnalytics: async (params?: MyAgentAnalyticsParams): Promise<MyAgentAnalyticsResponse> => {
        const response = await apiClient.get<MyAgentAnalyticsResponse>('/v1/analytics/agents/me', { params });
        return response.data;
    },

    /**
     * Export analytics data as CSV
     * GET /api/v1/analytics/export/csv/
     */
    exportStatsCsv: async (params?: GetAnalyticsParams): Promise<Blob> => {
        const response = await apiClient.get('/v1/analytics/export/csv/', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },
};
