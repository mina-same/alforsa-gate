import { UserRole, UserStatus } from '../auth/types';

/**
 * Users API Types
 */

export interface UserCreate {
    email: string;
    password: string;
    full_name: string;
    organization_id: number;
    role?: UserRole | string;
    status?: UserStatus | string;
}

export interface UserUpdate {
    email?: string;
    full_name?: string;
    phone?: string;
    role?: UserRole | string;
    status?: UserStatus | string;
    password?: string;
    avatar_url?: string;
    bio?: string;
    timezone?: string;
    is_agent?: boolean;
    max_concurrent_chats?: number;
}

export interface UserResponse {
    id: number;
    email: string;
    full_name: string;
    organization_id: number;
    role: string | UserRole;
    status: string | UserStatus;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    timezone?: string;
    is_agent?: boolean;
    contact_id?: number;
    max_concurrent_chats?: number;
    current_chat_count?: number;
    agent_status?: string;
    last_login?: string;
    is_verified?: boolean;
    created_at?: string;
    updated_at?: string;
    last_online_timestamp?: string;
}

export interface UserListResponse {
    users: UserResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface GetUsersParams {
    skip?: number;
    limit?: number;
    page?: number;
    size?: number;
    search?: string;
    role?: string;
    status?: string;
    organization_id?: number;
}

export interface SearchUsersParams {
    q: string;
    limit?: number;
}

export interface Inbox {
    id: number;
    name: string;
    channel_type: string;
    account_id: number;
    channel_id: number;
    enable_auto_assignment: boolean;
    greeting_enabled: boolean;
    greeting_message: string;
    working_hours_enabled: boolean;
    csat_survey_enabled: boolean;
    ai_enabled: boolean;
    ai_chatbot_enabled: boolean;
    ai_provider: string;
    ai_model: string;
    ai_system_prompt: string;
    ai_auto_tagging_enabled: boolean;
    ai_reply_suggestions_enabled: boolean;
    ai_rag_enabled: boolean;
    ai_knowledge_base_ids: string | null;
    ai_rag_top_k: number;
    ai_rag_similarity_threshold: number;
    ai_rag_include_citations: boolean;
    timezone: string;
    n8n_webhook_url: string | null;
    n8n_workflow_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserInboxesResponse {
    items: Inbox[];
    total: number;
    page: number;
    size: number;
    pages: number;
}
