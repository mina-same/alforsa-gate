import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { Button } from '@components/ui/button'

interface TemplateModalFooterProps {
  onBack: () => void
  onSend: () => void
}

export function TemplateModalFooter({ onBack, onSend }: TemplateModalFooterProps) {
  const { t } = useTranslation('chat')
  return (
    <div className="px-4 sm:px-6 py-3 border-t border-border flex gap-2 shrink-0">
      <Button
        variant="outline"
        className="flex-1 rounded-xl hidden sm:flex"
        onClick={onBack}
      >
        {t('whatsapp_modal.back')}
      </Button>
      <Button className="flex-1 rounded-xl bg-primary hover:opacity-90 text-primary-foreground" onClick={onSend}>
        <Send className="h-4 w-4 mr-2" />
        {t('whatsapp_modal.send_template')}
      </Button>
    </div>
  )
}
