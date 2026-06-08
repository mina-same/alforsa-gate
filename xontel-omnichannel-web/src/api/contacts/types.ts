/**
 * Contacts API Types
 */

export interface ContactCreate {
  name: string;
  phone: string;
  email?: string;
  organization_id: number;
  middle_name?: string;
  last_name?: string;
  identifier?: string;
  location?: string;
  country_code?: string;
}

export interface ContactUpdate {
  name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  tags?: string | null;
  custom_fields?: string | null;
  location?: string | null;
  country_code?: string | null;
}

export interface ContactResponse {
  name: string;
  phone: string;
  email?: string;
  id: number;
  organization_id: number;
  middle_name: string;
  last_name: string;
  identifier?: string;
  avatar_url?: string;
  bio?: string;
  location: string;
  country_code: string;
  contact_type: number;
  is_blocked: boolean;
  total_conversations: number;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
  tags?: string[] | string;
}

export interface PaginatedContactsResponse {
  contacts: ContactResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetContactsParams {
  skip?: number;
  limit?: number;
  is_blocked?: boolean;
  search?: string;
}
