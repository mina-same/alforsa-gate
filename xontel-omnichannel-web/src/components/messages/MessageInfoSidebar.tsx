import { useState, useEffect } from 'react'
import { X, CheckCheck } from 'lucide-react'
import { useUIContext, closeMessageInfo } from '@/contexts/UIContext'
import MessageBubble from './MessageBubble'
import { useMessage } from '@/api'
import { MediaType } from '@/types/chat'
import { convertUTCToLocal, getDateLabel } from '@/utils/dateUtils'
import { ConversationProvider, type ConversationStaticContextValue, type ConversationSearchContextValue } from '@/contexts/ConversationContext'

const NOOP = () => {};
const previewStaticCtx: ConversationStaticContextValue = {
    conversationId: undefined,
    isInternalConversation: false,
    isAssignedToMe: false,
    canDelete: false,
    partnerName: undefined,
    channelType: undefined,
    currentUserAvatar: undefined,
    otherUserAvatar: undefined,
    onReply: NOOP,
    onDelete: NOOP,
    onEdit: NOOP,
    onResend: NOOP,
    onCall: NOOP,
    onOpenMediaViewer: NOOP,
};
const previewSearchCtx: ConversationSearchContextValue = { searchQuery: "" };

interface MessageInfoSidebarProps {
    className?: string
}

export default function MessageInfoSidebar({ className = '' }: MessageInfoSidebarProps) {
    const { state: uiState, dispatch: uiDispatch } = useUIContext()
    const { isOpen, messageId } = uiState.messageInfo
    const [activeMessageId, setActiveMessageId] = useState<string | null>(messageId)

    useEffect(() => {
        if (isOpen && messageId) {
            setActiveMessageId(messageId)
        }
    }, [isOpen, messageId])

    const message = useMessage(Number(activeMessageId)).data

    const formatStatusTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return '—'
        const date = convertUTCToLocal(dateStr)
        const label = getDateLabel(dateStr)
        const time = date.toLocaleTimeString('en-EG', { hour: 'numeric', minute: 'numeric' })
        return `${label} at ${time}`
    }

    return (
        <div className={`absolute inset-0 z-30 w-full bg-background sm:relative sm:z-20 sm:w-full sm:border-l sm:h-full sm:inset-auto flex flex-col duration-300 shadow-xl border-border transition-all ease-in-out ${isOpen
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none sm:translate-x-0 sm:opacity-100 sm:pointer-events-auto'
            } ${className}`}>
            {/* Header */}
            <div className="h-16 px-4 border-b border-border flex items-center justify-between text-base font-semibold bg-[hsl(var(--header-bg))]">
                <span>Message Info</span>
                <button
                    onClick={() => uiDispatch(closeMessageInfo())}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5 opacity-70" />
                </button>
            </div>

            {/* Content */}
            {message ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Message Preview */}
                    <div className="bg-muted/30 p-4 rounded-lg flex justify-center">
                        <div className="pointer-events-none select-none scale-90 origin-top">
                            <ConversationProvider staticValue={previewStaticCtx} searchValue={previewSearchCtx}>
                                <MessageBubble
                                    message={{
                                        text: message.content,
                                        status: message.status,
                                        createdAt: message.created_at,
                                        message_type: message.message_type,
                                        media_type: message.media_type,
                                        senderId: String(message.sender_id),
                                        id: String(message.id),
                                        template_id: 0,
                                        media: {
                                            type: message.media_type as MediaType || '',
                                            url: message.media_url || '',
                                            name: message.media_name || '',
                                            blob: new Blob(),
                                        }
                                    }}
                                    isSender={true}
                                />
                            </ConversationProvider>
                        </div>
                    </div>

                    {/* Read Receipt */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-2">
                            <CheckCheck className={`h-5 w-5 ${message.status === 'read' ? 'text-xon-primary' : 'text-muted-foreground'}`} />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Read</p>
                                <p className="text-xs text-muted-foreground">{formatStatusTime(message.read_at)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-2">
                            <CheckCheck className={`h-5 w-5 ${message.status === 'delivered' || message.status === 'read' ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Delivered</p>
                                <p className="text-xs text-muted-foreground">{formatStatusTime(message.delivered_at || (message.status === 'read' ? message.read_at : null))}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
                </div>
            )}
        </div>
    )
}
