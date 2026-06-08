/**
 * Analytics API Types
 */

export interface DashboardStatsResponse {
  total_conversations: number;
  open_conversations: number;
  closed_conversations: number;
  avg_response_time: number;
  avg_resolution_time: number;
  total_messages: number;
  customer_satisfaction_score: number;
}

export interface ConversationStatsResponse {
  date: string;
  total: number;
  open: number;
  closed: number;
}

export interface AgentStatsResponse {
  agent_id: number;
  agent_name: string;
  conversations_assigned: number;
  conversations_resolved: number;
  avg_response_time: number;
  avg_resolution_time: number;
}

export interface ChannelStatsResponse {
  channel_id: number;
  channel_type: string;
  total_conversations: number;
  total_messages: number;
}

export interface GetAnalyticsParams {
  start_date?: string;
  end_date?: string;
  inbox_id?: number;
  team_id?: number;
}

export interface MyAgentAnalyticsParams {
  /** ISO 8601 datetime string (e.g., "2026-05-17T00:00:00" or "2026-05-17T23:59:59") */
  start_date?: string;
  /** ISO 8601 datetime string (e.g., "2026-05-17T00:00:00" or "2026-05-17T23:59:59") */
  end_date?: string;
}

export interface MessageStats {
  total: number;
  by_channel: Record<string, number>;
  by_message_type: Record<string, number>;
}

export interface MyAgentAnalyticsResponse {
  agent_id: number;
  agent_name: string;
  is_active: boolean;
  time_period: {
    /** ISO 8601 datetime string */
    start_date: string;
    /** ISO 8601 datetime string */
    end_date: string;
  };
  messages_sent: MessageStats;
  assigned_conversation_messages: MessageStats;
  conversations_assigned: number;
  conversations_resolved: number;
  resolution_rate: number;
}
