import React from 'react'
import { X, Image } from 'lucide-react'
import { WhatsAppTemplate } from '@/types/template'

interface TemplateModalHeaderProps {
  showPreview: boolean
  selectedTemplate: WhatsAppTemplate | null
  onClose: () => void
  onBack: () => void
}

export function TemplateModalHeader({ showPreview, selectedTemplate, onClose, onBack }: TemplateModalHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border shrink-0">
      {showPreview && (
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors sm:hidden"
        >
          {/* Mini skeleton preview (replaces back arrow) */}
          <div className="w-[44px] h-[44px] rounded-lg bg-muted/60 border border-border/50 overflow-hidden flex flex-col">
            {/* Header area */}
            {selectedTemplate?.header_type === 'IMAGE' ? (
              <div className="h-4 bg-muted flex items-center justify-center">
                <Image className="h-3 w-3 text-muted-foreground/50" />
              </div>
            ) : selectedTemplate?.header_type === 'TEXT' ? (
              <div className="px-1 pt-1">
                <div className="h-1 w-7 bg-muted-foreground/20 rounded-full" />
              </div>
            ) : null}

            {/* Body lines */}
            <div className="px-1 pt-1 flex-1 space-y-1">
              <div className="h-1 w-full bg-muted-foreground/15 rounded-full" />
              <div className="h-1 w-[85%] bg-muted-foreground/15 rounded-full" />
            </div>

            {/* Footer */}
            {selectedTemplate?.footer_text && (
              <div className="px-1 pb-0.5">
                <div className="h-0.5 w-5 bg-muted-foreground/10 rounded-full" />
              </div>
            )}

            {/* Buttons */}
            {(selectedTemplate?.buttons?.length ?? 0) > 0 && (
              <div className="border-t border-border/30 px-1 py-0.5 space-y-0.5">
                {(selectedTemplate?.buttons ?? []).slice(0, 1).map((btn, i) => (
                  <div key={i} className="h-1.5 w-full bg-primary/15 rounded-sm" />
                ))}
              </div>
            )}
          </div>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
          {showPreview ? selectedTemplate?.name : 'Select Template'}
        </h2>
        {!showPreview && (
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            Choose a template to send via WhatsApp
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <X className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  )
}
