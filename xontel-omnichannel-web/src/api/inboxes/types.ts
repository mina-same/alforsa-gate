/**
 * Inboxes API Types
 */

export type InboxChannelType = 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'email' | 'telegram' | 'internal' | 'chatgpt' | 'ai' | 'custom';

export interface InboxCreate {
    name: string;
    organization_id: number;
    channel_id?: number;
    description?: string;
    avatar_url?: string;
    greeting_message?: string;
    working_hours_enabled?: boolean;
    out_of_office_message?: string;
    timezone?: string;
    enable_csat?: boolean;
    csat_message?: string;
    auto_assignment_config?: Record<string, any>;
}

export interface InboxUpdate extends Partial<InboxCreate> { }

export interface InboxResponse {
    id: number;
    organization_id: number;
    channel_id?: number;
    name: string;
    description?: string;
    avatar_url?: string;
    greeting_message?: string;
    working_hours_enabled: boolean;
    out_of_office_message?: string;
    timezone: string;
    enable_csat: boolean;
    csat_message?: string;
    auto_assignment_config: Record<string, any>;
    created_at: string;
    updated_at: string;
    channel_type?: InboxChannelType;
    unread_count?: number;
}

export interface InboxMemberResponse {
    user_id: number;
    inbox_id: number;
    role: string;
    created_at: string;
}

export interface GetInboxesParams {
    skip?: number;
    limit?: number;
}

export interface InboxesListResponse {
    items: InboxResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface InboxMembersListResponse {
    items: import('../users/types').UserResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface InboxConversationsListResponse {
    items: import('../conversations/types').ConversationResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface GetInboxMemberMessagesParams {
    skip?: number;
    limit?: number;
    direction?: 'INBOUND' | 'OUTBOUND' | null;
    message_type?: string | null;
}
