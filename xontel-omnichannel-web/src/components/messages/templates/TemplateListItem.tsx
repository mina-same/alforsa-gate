import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'lucide-react'
import { WhatsAppTemplate } from '@/types/template'
import { TemplateStatusBadge } from './TemplateStatusBadge'

interface TemplateListItemProps {
  template: WhatsAppTemplate
  onClick: (template: WhatsAppTemplate) => void
}

export function TemplateListItem({ template, onClick }: TemplateListItemProps) {
  const { t } = useTranslation('chat')
  return (
    <button
      onClick={() => onClick(template)}
      className="w-full text-left p-3 sm:p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition-all duration-150 group"
    >
      <div className="flex items-start gap-3">
        {/* Mini skeleton preview */}
        <div className="shrink-0 w-[56px] h-[72px] sm:w-[72px] sm:h-[88px] rounded-lg bg-muted/60 border border-border/50 overflow-hidden flex flex-col">
          {/* Header area */}
          {template.header_type === 'IMAGE' ? (
            <div className="h-5 sm:h-6 bg-muted flex items-center justify-center">
              <Image className="h-3 w-3 text-muted-foreground/50" />
            </div>
          ) : template.header_type === 'TEXT' ? (
            <div className="px-1 pt-1 sm:px-1.5 sm:pt-1.5">
              <div className="h-1 sm:h-1.5 w-8 sm:w-10 bg-muted-foreground/20 rounded-full" />
            </div>
          ) : null}

          {/* Body lines */}
          <div className="px-1 pt-1 sm:px-1.5 flex-1 space-y-1">
            <div className="h-1 w-full bg-muted-foreground/15 rounded-full" />
            <div className="h-1 w-[85%] bg-muted-foreground/15 rounded-full" />
            <div className="h-1 w-[60%] bg-muted-foreground/15 rounded-full" />
          </div>

          {/* Footer */}
          {template.footer_text && (
            <div className="px-1 pb-0.5 sm:px-1.5">
              <div className="h-0.5 w-6 sm:w-8 bg-muted-foreground/10 rounded-full" />
            </div>
          )}

          {/* Buttons */}
          {(template.buttons?.length ?? 0) > 0 && (
            <div className="border-t border-border/30 px-1 py-1 sm:px-1.5 space-y-0.5">
              {(template.buttons ?? []).slice(0, 2).map((btn, i) => (
                <div key={i} className="h-2 w-full bg-primary/15 rounded-sm" />
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {template.name}
            </h3>
            <TemplateStatusBadge status={template.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {template.body_text}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wide font-medium">{template.category}</span>
            <span>·</span>
            <span>{template.usage_count.toLocaleString()} {t('whatsapp_modal.uses')}</span>
            <span>·</span>
            <span>{template.language.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
