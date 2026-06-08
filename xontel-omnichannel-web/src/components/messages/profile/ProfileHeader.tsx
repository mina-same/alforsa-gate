import { X, ArrowLeft, ArrowRight, Pencil, Check, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProfileHeaderProps {
  isRTL: boolean
  isMobile: boolean
  isGroup: boolean
  isDirect: boolean
  isInternalConversation: boolean
  isAssignedToMe: boolean
  isEditing: boolean
  isUpdating: boolean
  onClose: () => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function ProfileHeader({
  isRTL, isMobile, isGroup, isDirect,
  isInternalConversation, isAssignedToMe,
  isEditing, isUpdating,
  onClose, onEdit, onSave, onCancel,
}: ProfileHeaderProps) {
  const { t } = useTranslation('chat')

  return (
    <div
      className={`flex items-center justify-between border-b border-xon-surface-outline ${isMobile ? 'px-4 pt-3 pb-3' : 'bg-xon-surface-container px-4 py-3'}`}
    >
      <button
        onClick={onClose}
        className="p-2 hover:bg-xon-surface-container-hover rounded-full transition-colors text-xon-text-primary"
        title={isMobile ? 'Back' : 'Close'}
      >
        {isMobile ? (
          isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />
        ) : (
          <X className="h-5 w-5" />
        )}
      </button>

      <h2 className="font-bold text-base text-xon-text-primary">
        {isGroup
          ? t('conversations.profile.group_info', 'Group info')
          : isDirect
          ? t('conversations.profile.agent_info', 'Agent info')
          : t('conversations.profile.contact_info', 'Contact info')}
      </h2>

      {!isGroup && !isDirect && (isInternalConversation || !isAssignedToMe) ? (
        <div className="w-10" />
      ) : (
        <div className="flex items-center gap-1">
          {!isDirect && (
            <>
              {isEditing && (
                <button
                  onClick={onCancel}
                  disabled={isUpdating}
                  className="p-2 hover:bg-xon-container-red/10 rounded-full transition-colors text-xon-text-red"
                  title="Cancel"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={isEditing ? onSave : onEdit}
                disabled={isUpdating}
                className={`p-2 rounded-full transition-colors ${
                  isEditing
                    ? 'text-xon-whatsapp-green hover:bg-xon-whatsapp-green/10'
                    : 'text-xon-text-secondary hover:bg-xon-surface-container-hover'
                }`}
                title={isEditing ? 'Save' : 'Edit'}
              >
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isEditing ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Pencil className="h-5 w-5" />
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
