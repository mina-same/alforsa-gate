import { useTranslation } from 'react-i18next'
import { CountryPhoneInput } from '@/components/ui/country-phone-input'
import type { ContactResponse } from '@/api/contacts/types'
import type { Conversation } from '@/types/chat'

interface ProfileContactInfoProps {
  isEditing: boolean
  isGroup: boolean
  isDirect: boolean
  contact: ContactResponse | undefined
  conversation: Conversation
  editBio: string
  editPhone: string
  onBioChange: (v: string) => void
  onPhoneChange: (phone: string, isValid: boolean) => void
}

export function ProfileContactInfo({
  isEditing, isGroup, isDirect,
  contact, conversation,
  editBio, editPhone,
  onBioChange, onPhoneChange,
}: ProfileContactInfoProps) {
  const { t } = useTranslation('chat')

  return (
    <div className="bg-xon-surface-container border-b border-xon-surface-outline">
      {/* Bio */}
      {!isGroup && !isDirect && (isEditing || contact?.bio) && (
        <div className="px-4 py-4 border-b border-xon-surface-outline">
          <p className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wide mb-2 text-start">
            {t('conversations.profile.about_bio', 'ABOUT / BIO')}
          </p>
          {isEditing ? (
            <textarea
              value={editBio}
              onChange={(e) => onBioChange(e.target.value)}
              placeholder="Set a bio..."
              className="w-full bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg px-3 py-2 text-sm outline-none focus:border-xon-primary transition-colors text-xon-text-primary resize-none h-20"
            />
          ) : (
            <p className="text-sm text-xon-text-primary italic text-start">
              {contact?.bio || t('conversations.profile.no_bio_set', 'No bio set')}
            </p>
          )}
        </div>
      )}

      {/* Phone */}
      {!isGroup && !isDirect && contact?.phone && (
        <div className="px-4 py-4 border-b border-xon-surface-outline">
          <p className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wide mb-2 text-start">
            {t('conversations.profile.phone_number', 'PHONE NUMBER')}
          </p>
          {isEditing ? (
            <CountryPhoneInput
              value={editPhone}
              onChange={onPhoneChange}
              placeholder="Enter phone number..."
            />
          ) : (
            <>
              <p className="text-base font-semibold text-xon-text-primary font-mono text-start" dir="ltr">
                {contact.phone.startsWith('+') ? contact.phone : `+${contact.phone}`}
              </p>
              <p className="text-xs text-xon-text-secondary mt-1 text-start">
                {contact.phone.startsWith('+20')
                  ? '🇪🇬 Egypt'
                  : t('conversations.profile.international', 'International')}
              </p>
            </>
          )}
        </div>
      )}

      {/* Messages count */}
      <div className="px-4 py-4 border-b border-xon-surface-outline">
        <p className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wide mb-2 text-start">
          {t('conversations.profile.messages', 'MESSAGES')}
        </p>
        <p className="text-base font-semibold text-xon-text-primary text-start">
          {conversation.unread
            ? t('conversations.profile.unread_count', '{{count}} unread', { count: conversation.unread })
            : t('conversations.profile.all_read', 'All read')}
        </p>
      </div>
    </div>
  )
}
