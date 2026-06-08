export type WhatsAppTemplateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED'

export interface TemplateVariableResponse {
  name: string
  type: 'text' | 'image' | 'video' | 'document'
  example: string
}

export interface TemplateButtonResponse {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'
  text: string
  url: string | null
  phone_number: string | null
}

export interface WhatsAppTemplateResponse {
  id: number
  account_id: number
  name: string
  language: string
  category: string
  body_text: string | null
  header_type: string | null
  header_text: string | null
  header_media_url: string | null
  footer_text: string | null
  status: WhatsAppTemplateStatus
  template_id: string | null
  usage_count: number
  created_at: string
  updated_at: string
  submitted_at: string | null
  approved_at: string | null
  buttons: TemplateButtonResponse[] | null
  variables: TemplateVariableResponse[] | null
}

export interface ListWhatsAppTemplatesParams {
  status?: string
  skip?: number
  limit?: number
}

export interface WhatsAppTemplatesListResponse {
  items: WhatsAppTemplateResponse[]
  total: number
  page: number
  size: number
  pages: number
}
