
export interface ContactTags {
  name: string;
  description?: string;
  color?: string;
  id: number;
  organization_id: number;
  created_at: string;
  updated_at: string;
}

export interface ContactTagsListResponse {
  items: ContactTags[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateContactTag {
  name: string;
  description?: string;
  color?: string;
  organization_id?: number;
}
