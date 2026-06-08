import { X, Ban, Shield } from 'lucide-react'
import type { Conversation } from '@/types/chat'

interface ActionButtonsProps {
  conversation: Conversation
  isInternalConversation: boolean
  isAssignedToMe: boolean
  isClosing: boolean
  isBlocking: boolean
  isUnblocking: boolean
  onClose: () => void
  onBlock: () => void
}

export function ActionButtons({
  conversation, isInternalConversation, isAssignedToMe,
  isClosing, isBlocking, isUnblocking,
  onClose, onBlock,
}: ActionButtonsProps) {
  return (
    <div className="px-4 py-4 space-y-2 bg-xon-surface-container border-t border-xon-surface-outline">
      {!isInternalConversation && isAssignedToMe && !conversation.closed && (
        <button
          onClick={onClose}
          disabled={isClosing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-colors bg-xon-surface-container-hover hover:bg-xon-surface-hover text-xon-text-primary disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          <span>{isClosing ? 'Closing…' : 'Close conversation'}</span>
        </button>
      )}

      {!isInternalConversation && isAssignedToMe && (
        <button
          onClick={onBlock}
          disabled={conversation.blocked ? isUnblocking : isBlocking}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
            conversation.blocked
              ? 'bg-xon-surface-container-hover hover:bg-xon-surface-hover text-xon-text-primary disabled:opacity-50'
              : 'bg-xon-container-red hover:bg-xon-red-select text-xon-text-red disabled:opacity-50'
          }`}
        >
          {conversation.blocked ? (
            <>
              <Shield className="h-4 w-4" />
              <span>{isUnblocking ? 'Unblocking…' : 'Unblock'}</span>
            </>
          ) : (
            <>
              <Ban className="h-4 w-4" />
              <span>{isBlocking ? 'Blocking…' : 'Block'}</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
