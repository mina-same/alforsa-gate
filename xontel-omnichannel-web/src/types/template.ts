export interface TemplateVariable {
  name: string
  type: 'text' | 'image' | 'video' | 'document'
  example: string
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'
  text: string
  url: string | null
  phone_number: string | null
}



export interface WhatsAppTemplate {
  id: number
  name: string
  language: string
  category: string
  body_text: string
  header_type?: string | null
  header_text?: string | null
  header_media_url?: string | null
  footer_text?: string | null
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED'
  template_id?: string | null
  usage_count: number
  created_at: Date
  updated_at: Date
  submitted_at?: Date | null
  approved_at?: Date | null
  buttons?: TemplateButton[]
  variables?: TemplateVariable[]
  location?: Location
}

export interface TemplateSendRequest {
  template_id: number
  contact_id: number
  variables?: Record<string, string>
}
