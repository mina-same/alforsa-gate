import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { analyticsAPI } from './endpoints';
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
 * Analytics API Hooks using React Query
 */

/**
 * Dashboard stats hook
 */
export const useDashboardStats = (params?: GetAnalyticsParams): UseQueryResult<DashboardStatsResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['analytics', 'dashboard', params],
        queryFn: () => analyticsAPI.getDashboardStats(params),
        enabled: hasToken,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

/**
 * Conversation stats hook
 */
export const useConversationAnalytics = (params?: GetAnalyticsParams): UseQueryResult<ConversationStatsResponse[], Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['analytics', 'conversations', params],
        queryFn: () => analyticsAPI.getConversationStats(params),
        enabled: hasToken,
        staleTime: 10 * 60 * 1000,
    });
};

/**
 * Agent performance stats hook
 */
export const useAgentAnalytics = (params?: GetAnalyticsParams): UseQueryResult<AgentStatsResponse[], Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['analytics', 'agents', params],
        queryFn: () => analyticsAPI.getAgentStats(params),
        enabled: hasToken,
        staleTime: 10 * 60 * 1000,
    });
};

/**
 * Channel performance stats hook
 */
export const useChannelAnalytics = (params?: GetAnalyticsParams): UseQueryResult<ChannelStatsResponse[], Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['analytics', 'channels', params],
        queryFn: () => analyticsAPI.getChannelStats(params),
        enabled: hasToken,
        staleTime: 10 * 60 * 1000,
    });
};

/**
 * Current agent (me) analytics hook — today's stats by default
 */
export const useMyAgentAnalytics = (params?: MyAgentAnalyticsParams): UseQueryResult<MyAgentAnalyticsResponse, Error> => {
    const hasToken = !!(localStorage.getItem('authToken') || localStorage.getItem('token'));

    return useQuery({
        queryKey: ['analytics', 'myAgent', params],
        queryFn: () => analyticsAPI.getMyAgentAnalytics(params),
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
    });
};
