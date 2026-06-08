/**
 * Channels API Types
 */

export interface ChannelResponse {
  id: number;
  name: string;
  channel_type: string;
  is_active: boolean;
  phone_number?: string;
  page_id?: string | null;
  settings?: any;
  organization_id: number;
  status: string;
  webhook_url?: string;
  last_sync_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}
