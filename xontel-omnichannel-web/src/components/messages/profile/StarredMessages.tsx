import { Star, X } from 'lucide-react'
import type { Message } from '@/types/chat'
import type { UserResponse } from '@/api'
import type { ContactResponse } from '@/api/contacts/types'
import type { Conversation } from '@/types/chat'

interface StarredMessagesProps {
  starredMessages: Message[]
  groupUsers: UserResponse[]
  contact: ContactResponse | undefined
  conversation: Conversation
  formatTime: (ts: string) => string
  onScrollTo: (messageId: string) => void
  onUnstar: (m: Message) => void
}

export function StarredMessages({
  starredMessages, groupUsers, contact, conversation,
  formatTime, onScrollTo, onUnstar,
}: StarredMessagesProps) {
  if (starredMessages.length === 0) return null

  return (
    <div className="px-4 py-4 border-b border-xon-surface-outline">
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        <p className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wide">
          Starred Messages ({starredMessages.length})
        </p>
      </div>
      <div className="space-y-2">
        {starredMessages.map((m: any) => {
          const attrs = (() => {
            const a = m.additional_attributes
            if (!a) return {}
            if (typeof a === 'string') { try { return JSON.parse(a) } catch { return {} } }
            return a
          })()
          const displayText = attrs?.isEdited && attrs?.editedMessage
            ? attrs.editedMessage
            : (m.text || '')

          const senderName = (() => {
            if (m.senderName && m.senderName !== 'Other') return m.senderName
            const sentByUserId = m.sent_by_user_id
            if (sentByUserId) {
              const u = groupUsers.find(u => u.id === sentByUserId)
              if (u?.full_name) return u.full_name
            }
            if (m.senderId && !m.senderId.startsWith('contact-') && m.senderId !== 'me') {
              const u = groupUsers.find(u => String(u.id) === m.senderId)
              if (u?.full_name) return u.full_name
            }
            return contact?.name || conversation?.contact_name || conversation?.name || 'Unknown'
          })()

          return (
            <div
              key={m.id}
              className="flex items-start gap-2.5 rounded-lg bg-xon-surface-container px-3 py-2.5 border border-xon-surface-outline group/starred cursor-pointer hover:bg-xon-surface-outline/50 transition-colors"
              onClick={() => onScrollTo(m.id)}
            >
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-xon-text-primary truncate">
                    {senderName}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-xon-text-secondary">
                      {m.createdAt ? formatTime(m.createdAt) : ''}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onUnstar(m) }}
                      className="opacity-0 group-hover/starred:opacity-100 transition-opacity p-0.5 rounded hover:bg-xon-surface-outline"
                      title="Unstar message"
                    >
                      <X className="h-3 w-3 text-xon-text-secondary" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-xon-text-secondary line-clamp-2 break-words">
                  {displayText || <span className="italic opacity-60">Media message</span>}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
