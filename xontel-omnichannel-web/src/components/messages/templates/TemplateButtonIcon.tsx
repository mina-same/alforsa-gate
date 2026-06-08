import React from 'react'
import { ExternalLink, Phone, Reply } from 'lucide-react'

interface TemplateButtonIconProps {
  type: string
  className?: string
}

export function TemplateButtonIcon({ type, className = "h-3.5 w-3.5" }: TemplateButtonIconProps) {
  if (type === 'URL') return <ExternalLink className={className} />
  if (type === 'PHONE_NUMBER') return <Phone className={className} />
  return <Reply className={className} />
}
