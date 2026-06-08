/**
 * Messages API Types
 */

export type MessageDirection = 'inbound' | 'outbound';
export type MessageType =
  | 'text'
  | 'link'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'button'
  | 'template_message'
  | 'interactive'
  | 'file'
  | 'other'
  | 'location'
  | 'contacts'
  | 'reaction'
|'template_message'
|'template_message'
  | 'calls'
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageCreate {
  content: string;
  message_type?: MessageType;
  conversation_id?: number;
  channel_id?: number;
  contact_id?: number;
  inbox_id?: number;
  direction?: MessageDirection;
  private?: boolean;
  client_message_id?: string;
  media_url?: string;
  media_name?: string;
  media_type?: string;
  sender_id?: number;
  legacy_sender_id?: number;
  sender_type?: string;
  sent_by_user_id?: number;
  sent_by_contact_id?: number;
  media_size?: number;
  external_message_id?: string;
  status?: string;
  reply_to_message_id?: number | null;
  template_id?: number;
  additional_attributes?: string | Record<string, any>;
  phone?: string;
}

export interface MessageUpdate {
  content?: string;
  status?: MessageStatus;
  additional_attributes?: string | Record<string, any>;
}

export interface MessageResponse {
  content: string;
  message_type: MessageType;
  id: number;
  message_uuid: string;
  conversation_id: number;
  sender_type?: string;
  sender_id?: number;
  legacy_sender_id?: number;
  external_message_id?: string;
  sent_by_user_id?: number | null;
  sent_by_contact_id?: number | null;
  direction: MessageDirection;
  status: MessageStatus;
  private: boolean;
  media_url?: string;
  media_name?: string;
  media_type?: string;
  media_size?: number | null;
  created_at: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  inbox_id?: number;
  reply_to_message_id?: number | null;
  reactions?: Array<{
    emoji: string;
    isMine: boolean;
    user_id: number;
    user_name?: string;
  }>;
  additional_attributes?: string | Record<string, any>;
  template_id?: number;
}

export interface MessagesListResponse {
  items: MessageResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
