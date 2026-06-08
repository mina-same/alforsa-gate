/**
 * Email API Types
 */

export interface EmailAttachmentRequest {
  filename: string;
  content_type: string;
  content_base64?: string | null;
  file_url?: string | null;
}

export interface EmailSendRequest {
  channel_id: number;
  to: string;
  cc?: string[] | null;
  bcc?: string[] | null;
  subject: string;
  body_html?: string | null;
  body_text?: string | null;
  in_reply_to?: string | null;
  attachments?: EmailAttachmentRequest[] | null;
  conversation_id?: number | null;
  contact_id?: number | null;
}

export interface EmailAttachmentResponse {
  id: number;
  filename: string;
  content_type: string;
  size: number;
  file_url: string;
  created_at: string;
}

export interface EmailMessageResponse {
  id: number;
  channel_id: number;
  conversation_id: number | null;
  contact_id: number | null;
  message_id: string;
  from_addr: string;
  to: string;
  cc: string | null;
  bcc: string | null;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  status: string;
  error_message: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  is_read: boolean;
  is_replied: boolean;
  is_archived: boolean;
  is_manual: boolean;
  headers: Record<string, any> | null;
  attachments: EmailAttachmentResponse[] | null;
  in_reply_to: string | null;
  references: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailMessageListResponse {
  items: EmailMessageResponse[];
  total: number;
}

export interface EmailActionResponse {
  success: boolean;
  message_id: number;
  status: string;
  message?: string;
  queued_at?: string;
  is_read?: boolean;
  read_at?: string;
}

export interface GetEmailMessagesParams {
  skip?: number;
  limit?: number;
  channel_id?: number;
  status?: string;
  is_read?: boolean;
}

export interface EmailChannel {
  id: number;
  name: string;
  channel_type: string;
  organization_id: number;
  is_active: boolean;
  status: string;
  webhook_url: string;
  webhook_verify_token: string;
  webhook_token: string;
  last_sync_at: string;
  error_message: string;
  settings: Record<string, any>;
  credentials: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EmailChannelListResponse {
  items: EmailChannel[];
  total: number;
}
