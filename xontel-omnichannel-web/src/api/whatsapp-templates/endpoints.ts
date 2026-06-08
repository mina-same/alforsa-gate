import apiClient from '../client'
import type { ListWhatsAppTemplatesParams, WhatsAppTemplateResponse, WhatsAppTemplatesListResponse } from './types'

/**
 * WhatsApp Templates API Endpoints - /api/v1/whatsapp/templates
 */
export const whatsappTemplatesAPI = {
  /**
   * List WhatsApp templates
   * GET /api/v1/whatsapp/templates/
   */
  listTemplates: async (params?: ListWhatsAppTemplatesParams): Promise<WhatsAppTemplatesListResponse> => {
    const response = await apiClient.get<WhatsAppTemplatesListResponse>('/v1/whatsapp/templates/', { params })
    return response.data
  },

  /**
   * Get WhatsApp template by id
   * GET /api/v1/whatsapp/templates/{template_id}
   */
  getTemplate: async (templateId: number): Promise<WhatsAppTemplateResponse> => {
    const response = await apiClient.get<WhatsAppTemplateResponse>(`/v1/whatsapp/templates/${templateId}`)
    return response.data
  },
}
