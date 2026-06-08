/**
 * Conversations API Types
 */

import { ContactResponse } from '../contacts/types';
import { MessageResponse } from '../messages/types';

export interface ConversationResponse {
  id: number;
  conversation_uuid: string;
  display_id?: number;
  organization_id: number;
  channel_id?: number | null;
  inbox_id?: number | null;
  contact_id?: number | null;
  assigned_agent_id?: number | null;
  team_id?: number | null;
  status: string;
  priority: number;
  subject?: string;
  conversation_type?: 'group' | 'direct' | 'contact';
  message_count: number;
  unread_messages_count?: number;
  last_message_id?: number | null;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
  last_message?: MessageResponse | null;
  contact?: ContactResponse | null;
  pinned: boolean;
  snoozed_until?: string | null;
  user_ids?: number[];
  numeric_id?: string;
  avatar_url?: string;
}

export interface AllConversations{
  items: ConversationResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateGroupConversationParams {
  user_ids: number[];
  subject: string;
  inbox_id?: number;
}

export interface CreateDirectConversationParams {
  user_id: number;
  subject: string;
  inbox_id?: number;
}


export interface ConversationSnooze {
  snooze_until: string;
}

export interface ConversationBulkAction {
  conversation_ids: number[];
  action: string;
  assigned_agent_id?: number;
  team_id?: number;
  label_id?: number;
  status?: string;
}

export interface ConversationNoteCreate {
  content: string;
  mentions?: number[];
}

export interface ConversationNote {
  id: number;
  conversation_id: number;
  content: string;
  user_id: number;
  mentions: string; // JSON string array like "[12, 6]"
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ConversationMediaItem {
  message_id: number;
  message_uuid: string;
  media_url: string;
  media_type: string;
  media_size: number | null;
  media_name: string | null;
  created_at: string;
}

export interface ConversationMediaListResponse {
  items: ConversationMediaItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetConversationsParams {
  skip?: number;
  limit?: number;
  status?: string;
  inbox_id?: number;
  channel_id?: number;
  conversation_type?: 'group' | 'direct' | 'external' | 'internal';
  contact_name?: string;
  contact_phone?: string;
  assigned_agent_id?: number | null;
}
