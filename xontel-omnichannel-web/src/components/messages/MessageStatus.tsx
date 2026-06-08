import React from 'react'
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'

interface MessageStatusProps {
    status: 'sent' | 'delivered' | 'read' | 'sending' | 'failed' | string
    time: string
    isSender: boolean
    className?: string
    sentIconClassName?: string
    deliveredIconClassName?: string
    readIconClassName?: string
    pendingIconClassName?: string
    onResend?: () => void
    messageId?: string | number
    displayStatus?: boolean
}

export default function MessageStatus({
    status,
    time,
    isSender,
    className,
    sentIconClassName,
    deliveredIconClassName,
    readIconClassName,
    pendingIconClassName,
    onResend,
    messageId,
    displayStatus
}: MessageStatusProps) {
    const renderIcon = () => {
        if (!isSender) return null

        switch (status) {
            case 'sent':
                return <Check className={`h-3 w-3 ${sentIconClassName || 'text-muted-foreground'}`} />
            case 'delivered':
                return <CheckCheck className={`h-3 w-3 ${deliveredIconClassName || 'text-muted-foreground'}`} />
            case 'read':
                return <CheckCheck className={`h-3 w-3 ${readIconClassName || 'text-xon-primary'}`} />
            case 'failed':
                return null;
            case 'sending':
            case 'pending':
            default:
                return <Clock className={`h-3 w-3 ${pendingIconClassName || 'text-muted-foreground'}`} />
        }
    }

    return (
        <div
            className={
                className ||
                `flex items-center gap-1.5 mt-0.5 text-[0.65rem] text-muted-foreground/80 px-1 select-none ${isSender ? 'justify-end' : 'justify-start'}`
            }
        >
            <span className="tracking-tight">{time}</span>
            {displayStatus && renderIcon()}
        </div>
    )
}
