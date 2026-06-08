import React from 'react'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Avatar from '@/components/shared/Avatar'
import GroupAvatarGrid from '@/components/shared/GroupAvatarGrid'
import type { UserResponse } from '@/api'
import type { ContactResponse } from '@/api/contacts/types'
import type { Conversation } from '@/types/chat'

interface ProfileAvatarProps {
  isEditing: boolean
  isGroup: boolean
  isDirect: boolean
  isUploadingAvatar: boolean
  editAvatarUrl: string | null
  editName: string
  editEmail: string
  groupUsers: UserResponse[]
  contact: ContactResponse | undefined
  conversation: Conversation
  otherUser: UserResponse | undefined
  dmOtherUserName: string
  dmOtherUserAvatar: string
  fileInputRef: React.RefObject<HTMLInputElement>
  onAvatarClick: () => void
  onRemoveAvatar: (e: React.MouseEvent) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  getStatusColor: (status?: string) => string
  formatLastActive: (ts?: string) => string
}

export function ProfileAvatar({
  isEditing, isGroup, isDirect, isUploadingAvatar,
  editAvatarUrl, editName, editEmail,
  groupUsers, contact, conversation, otherUser,
  dmOtherUserName, dmOtherUserAvatar,
  fileInputRef,
  onAvatarClick, onRemoveAvatar, onFileChange,
  onNameChange, onEmailChange,
  getStatusColor, formatLastActive,
}: ProfileAvatarProps) {
  const { t } = useTranslation('chat')

  const displayName = isDirect
    ? dmOtherUserName || conversation.name
    : isGroup
    ? conversation.subject || conversation.name
    : contact?.name || conversation.name

  const avatarSrc = isDirect
    ? dmOtherUserAvatar || conversation.avatar
    : editAvatarUrl === null
    ? ''
    : editAvatarUrl || contact?.avatar_url || conversation.avatar

  return (
    <div className="bg-xon-surface-container border-b border-xon-surface-outline p-6 text-center">
      <div className="mb-4 flex justify-center relative group">
        <div className="relative">
          <button
            type="button"
            onClick={onAvatarClick}
            disabled={!isEditing || isUploadingAvatar || isGroup}
            className={`relative ${isEditing && !isGroup ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {isGroup ? (
              <GroupAvatarGrid
                avatars={groupUsers?.map((u) => u.avatar_url) || []}
                names={groupUsers?.map((u) => u.full_name) || []}
                size={160}
                maxDisplay={9}
              />
            ) : (
              <Avatar
                src={avatarSrc}
                name={isDirect ? displayName : editName || conversation.name}
                className={`h-40 w-40 transition-all ${isEditing ? 'group-hover:opacity-75 ring-2 ring-transparent group-hover:ring-xon-primary/50' : ''}`}
              />
            )}
            {!isEditing && isDirect && (
              <div
                className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-xon-surface-container shadow-lg"
                style={{ backgroundColor: getStatusColor(otherUser?.agent_status) }}
                title={
                  otherUser?.agent_status === 'online'
                    ? 'Online'
                    : formatLastActive(otherUser?.last_login)
                }
              />
            )}
            {isEditing && !isGroup && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                {isUploadingAvatar ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </div>
            )}
          </button>

          {isEditing &&
            !isGroup &&
            (editAvatarUrl || (!editAvatarUrl && (contact?.avatar_url || conversation.avatar))) &&
            editAvatarUrl !== null && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="absolute -top-1 -right-1 p-2 bg-xon-container-red text-xon-text-red rounded-full shadow-lg border border-red-200/20 hover:bg-xon-text-red hover:text-white transition-all transform hover:scale-110 z-10"
                title="Remove photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
        />
      </div>

      {isEditing ? (
        <div className="space-y-3 max-w-sm mx-auto">
          <input
            type="text"
            value={editName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Name"
            className="w-full text-center text-xl font-bold bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg px-3 py-2 outline-none focus:border-xon-primary transition-colors text-xon-text-primary"
          />
          {!isGroup && (
            <input
              type="email"
              value={editEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Email address"
              className="w-full text-center text-sm bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg px-3 py-2 outline-none focus:border-xon-primary transition-colors text-xon-text-primary"
            />
          )}
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-xon-text-primary mb-1">{displayName}</h3>
          {!isGroup && !isDirect && contact?.email && (
            <p className="text-sm text-xon-text-secondary mb-2">{contact.email}</p>
          )}
          {!isGroup && (
            <div className="flex items-center justify-center gap-2 text-sm text-xon-text-secondary">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getStatusColor(isDirect ? otherUser?.agent_status : 'online') }}
              />
              <span>
                {isDirect
                  ? otherUser?.agent_status === 'online'
                    ? t('conversations.profile.online', 'Online')
                    : formatLastActive(otherUser?.last_login)
                  : t('conversations.profile.active_now', 'Active now')}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
