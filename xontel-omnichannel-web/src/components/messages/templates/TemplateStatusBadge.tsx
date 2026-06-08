import React from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { WhatsAppTemplate } from '@/types/template'

interface TemplateStatusBadgeProps {
  status: WhatsAppTemplate['status'] | string
}

const statusConfig: Record<string, { icon: React.ElementType; className: string }> = {
  APPROVED: { icon: CheckCircle2, className: 'bg-accent text-accent-foreground' },
  PENDING: { icon: Clock, className: 'bg-muted text-muted-foreground' },
  REJECTED: { icon: AlertCircle, className: 'bg-destructive/10 text-destructive' },
}

export function TemplateStatusBadge({ status }: TemplateStatusBadgeProps) {
  const { icon: Icon, className } = statusConfig[status] || statusConfig.REJECTED

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  )
}
