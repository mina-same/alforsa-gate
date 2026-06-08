import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { whatsappTemplatesAPI } from './endpoints'
import type { ListWhatsAppTemplatesParams, WhatsAppTemplateResponse, WhatsAppTemplatesListResponse } from './types'

export const useWhatsAppTemplates = (
  params?: ListWhatsAppTemplatesParams,
  enabled: boolean = true
): UseQueryResult<WhatsAppTemplatesListResponse, Error> => {
  const hasToken = !!localStorage.getItem('authToken')

  return useQuery({
    queryKey: ['whatsapp-templates', params],
    queryFn: () => whatsappTemplatesAPI.listTemplates(params),
    enabled: hasToken && enabled,
    staleTime: 5 * 60 * 1000,
  })
}


export const useWhatsAppTemplate = (templateId: number): UseQueryResult<WhatsAppTemplateResponse, Error> => {
  const hasToken = !!localStorage.getItem('authToken')

  return useQuery({
    queryKey: ['whatsapp-templates', templateId],
    queryFn: () => whatsappTemplatesAPI.getTemplate(templateId),
    enabled: hasToken && !!templateId,
    staleTime: 5 * 60 * 1000,
        refetchOnMount: 'always',

  })
}
