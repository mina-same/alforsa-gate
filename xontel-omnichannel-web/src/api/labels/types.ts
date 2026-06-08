export interface Label {
  id: number;
  title: string;
  description?: string;
  color?: string;
  show_on_sidebar: boolean;
  account_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ConversationLabel {
  id: number;
  title: string;
  description?: string;
  color?: string;
  show_on_sidebar: boolean;
  applied_at: string;
}

export interface LabelsListResponse {
  labels: Label[];
}

export interface ConversationLabelsListResponse {
  items: ConversationLabel[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateLabel {
  title: string;
  description?: string;
  color?: string;
  account_id?: number;
  show_on_sidebar?: boolean;
}
