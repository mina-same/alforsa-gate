import React from 'react'
import { useTranslation } from 'react-i18next'
import { WhatsAppTemplate } from '@/types/template'
import { TemplateStatusBadge } from './TemplateStatusBadge'
import { TemplateButtonIcon } from './TemplateButtonIcon'

interface TemplateDetailsProps {
  template: WhatsAppTemplate
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground block mb-0.5">{label}</label>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

export function TemplateDetails({ template }: TemplateDetailsProps) {
  const { t } = useTranslation('chat')
  return (
    <div className="border-t border-border pt-4">
      <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">{t('whatsapp_modal.template_details')}</h4>
      <div className="grid grid-cols-2 gap-3">
        <DetailItem label={t('whatsapp_modal.status')}><TemplateStatusBadge status={template.status} /></DetailItem>
        <DetailItem label={t('whatsapp_modal.usage')}>{template.usage_count.toLocaleString()} {t('whatsapp_modal.sends')}</DetailItem>
        <DetailItem label={t('whatsapp_modal.language')}>{template.language.toUpperCase()}</DetailItem>
        <DetailItem label={t('whatsapp_modal.category')}>{template.category}</DetailItem>
      </div>
      {template.header_text && (
        <div className="mt-3">
          <DetailItem label={t('whatsapp_modal.header')}>{template.header_text}</DetailItem>
        </div>
      )}
      <div className="mt-3">
        <label className="text-[11px] font-medium text-muted-foreground block mb-1">{t('whatsapp_modal.body')}</label>
        <div className="bg-muted/50 p-3 rounded-xl text-xs text-foreground whitespace-pre-wrap leading-relaxed border border-border">
          {template.body_text}
        </div>
      </div>
      {template.footer_text && (
        <div className="mt-3">
          <DetailItem label={t('whatsapp_modal.footer')}>{template.footer_text}</DetailItem>
        </div>
      )}
      {template.buttons && template.buttons.length > 0 && (
        <div className="mt-3">
          <label className="text-[11px] font-medium text-muted-foreground block mb-1.5">{t('whatsapp_modal.buttons')}</label>
          <div className="space-y-1.5">
            {template.buttons.map((btn, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 p-2.5 rounded-xl border border-border text-xs">
                <TemplateButtonIcon type={btn.type} />
                <span className="font-medium text-foreground">{btn.text}</span>
                <span className="text-muted-foreground ml-auto">{btn.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
