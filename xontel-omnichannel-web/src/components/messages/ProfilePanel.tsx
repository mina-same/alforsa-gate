import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthUser } from '@/contexts/AuthContext'
import { useUIContext, closeProfilePanel, requestScrollToMessage } from '@/contexts/UIContext'
import { useConversationItems } from '@/api/conversations/hooks'
import { updateConversationInCache, conversationResponseToLocal } from '@/api/conversations/cacheUtils'
import { useTranslation } from 'react-i18next'
import { useIsMobile } from '@hooks/use-mobile'
import {
  useBlockContact,
  useUnblockContact,
  useContact,
  useAddTagToContact,
  useRemoveTagFromContact,
  useUpdateContact,
} from '@/api/contacts/hooks'
import { useCloseConversation, useConversationMedia, useUpdateConversation } from '@/api/conversations/hooks'
import { useUpdateMessage, useConversationMessages } from '@/api/messages/hooks'
import type { MessagesListResponse } from '@/api/messages/types'
import type { ConversationMediaItem } from '@/api/conversations/types'
import { MapMessages } from './hooks/useMapMessage'
import { UserResponse } from '@/api'
import { useUploadMedia } from '@/api/media/hooks'
import { toast } from 'sonner'
import { useContactTags } from '@/api/tags/hooks'
import type { ContactTags, ContactTagsListResponse } from '@/api/tags/types'
import { useLabels, useConversationLabels, useApplyLabel, useRemoveLabel } from '@/api/labels/hooks'
import { labelsAPI } from '@/api/labels/endpoints'
import type { Label, LabelsListResponse } from '@/api/labels/types'
import { useQueryClient } from '@tanstack/react-query'
import { useUsers, useUsersByIds } from '@/api/users/hooks'
import { useDirectMessageOtherUser } from '@/hooks/useDirectMessageOtherUser'
import { useDateFormat } from '@/hooks/useDateFormat'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import { ProfileHeader } from './profile/ProfileHeader'
import { ProfileAvatar } from './profile/ProfileAvatar'
import { ProfileContactInfo } from './profile/ProfileContactInfo'
import { StarredMessages } from './profile/StarredMessages'
import { GroupParticipants } from './profile/GroupParticipants'
import { TagsSection } from './profile/TagsSection'
import { LabelsSection } from './profile/LabelsSection'
import { MediaSection } from './profile/MediaSection'
import { ActionButtons } from './profile/ActionButtons'

export default function ProfilePanel() {
  const { state: uiState, dispatch: uiDispatch } = useUIContext()
  const { i18n } = useTranslation('chat')
  const isRTL = i18n.dir() === 'rtl'
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'media' | 'documents' | 'links'>('media')
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false)
  const [mediaViewerMessageId, setMediaViewerMessageId] = useState<number | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [reactionsDetailsOpen, setReactionsDetailsOpen] = useState(false)
  const [reactionsDetailsReactions, setReactionsDetailsReactions] = useState<any[]>([])
  const [reactionsDetailsContext, setReactionsDetailsContext] = useState<{ title?: string; thumbnailUrl?: string } | undefined>(undefined)
  const [groupUsers, setGroupUsers] = useState<UserResponse[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [isAddingMemberActive, setIsAddingMemberActive] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')

  const { formatRelativeActiveTime, formatTime } = useDateFormat()
  const authUser = useAuthUser()

  const formatBytes = (bytes: number | null) => {
    if (!bytes || bytes <= 0) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
    const value = bytes / Math.pow(1024, i)
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
  }

  const toMs = (s: string) => {
    const t = new Date(s).getTime()
    return Number.isFinite(t) ? t : 0
  }

  const groupByMonth = (items: ConversationMediaItem[]) => {
    const map = new Map<string, { key: string; title: string; items: ConversationMediaItem[] }>()
    for (const item of items) {
      const d = new Date(item.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const title = isNaN(d.getTime())
        ? 'Unknown'
        : d.toLocaleString(i18n.language, { month: 'long', year: 'numeric' })
      const existing = map.get(key)
      if (existing) {
        existing.items.push(item)
      } else {
        map.set(key, { key, title, items: [item] })
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([, v]) => ({
        key: v.key,
        title: v.title,
        items: v.items.sort((a, b) => toMs(b.created_at) - toMs(a.created_at)),
      }))
  }

  const profilePanelState = uiState.profilePanel
  const organizationId = authUser.organization_id
  const conversationItems = useConversationItems()
  const conversation = useMemo(() => {
    const found = conversationItems.find((c) => c.conversation_uuid === profilePanelState.conversationId)
    return found ? conversationResponseToLocal(found) : undefined
  }, [conversationItems, profilePanelState.conversationId])

  const _convRef = useRef<typeof conversation>(undefined)
  const _convIdRef = useRef<string | null>(null)
  if (_convIdRef.current !== profilePanelState.conversationId) {
    _convIdRef.current = profilePanelState.conversationId
    _convRef.current = undefined
  }
  if (conversation !== undefined) _convRef.current = conversation
  const displayConversation = conversation ?? _convRef.current

  const { data: batchUsers } = useUsersByIds(displayConversation?.user_ids || [])

  const { data: conversationMessagesData } = useConversationMessages(
    displayConversation?.numeric_id || 0,
    { skip: 0, limit: 50 },
  )
  const currentMessages = useMemo(
    () =>
      conversationMessagesData?.items
        ? MapMessages(authUser.contact_id, authUser.id, conversationMessagesData.items, [])
        : [],
    [conversationMessagesData, authUser.contact_id, authUser.id],
  )

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'online': return '#10b981'
      case 'away': return '#f59e0b'
      case 'busy': return '#ef4444'
      case 'offline': return '#94a3b8'
      default: return '#94a3b8'
    }
  }

  const formatLastActive = (timestamp?: string) => formatRelativeActiveTime(timestamp)

  const reactionsByMessageId = useMemo(() => {
    const map = new Map<number, any[]>()
    for (const m of currentMessages || []) {
      if (typeof (m as any)?.numericId !== 'number') continue
      const id = (m as any).numericId as number
      const rs = Array.isArray((m as any).reactions) ? (m as any).reactions : []
      if (rs.length) map.set(id, rs)
    }
    return map
  }, [currentMessages])

  const starredMessages = useMemo(() => {
    return (currentMessages || []).filter((m) => {
      const a = (m as any).additional_attributes
      if (!a) return false
      const parsed = typeof a === 'string' ? (() => { try { return JSON.parse(a) } catch { return {} } })() : a
      return !!parsed?.isStar
    })
  }, [currentMessages])

  const { mutate: updateMessageMutate } = useUpdateMessage()
  const queryClient = useQueryClient()

  const handleUnstar = (m: any) => {
    if (!m.numericId) return
    let newAttrs: string | undefined
    let oldAttrs: string | undefined

    queryClient.setQueriesData<MessagesListResponse>(
      { queryKey: ['conversationMessages', conversation?.numeric_id] },
      (old) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.map((msg) => {
            if (msg.id !== m.numericId) return msg
            const a = msg.additional_attributes
            const current: Record<string, any> = !a ? {} : typeof a === 'string' ? (() => { try { return JSON.parse(a) } catch { return {} } })() : (a as Record<string, any>)
            oldAttrs = typeof a === 'string' ? a : JSON.stringify(a ?? {})
            newAttrs = JSON.stringify({ ...current, isStar: false })
            return { ...msg, additional_attributes: newAttrs }
          }),
        }
      },
    )

    if (!newAttrs) return
    const mutationAttrs = newAttrs
    const revertAttrs = oldAttrs

    updateMessageMutate(
      { messageId: m.numericId, data: { additional_attributes: mutationAttrs } },
      {
        onError: () => {
          queryClient.setQueriesData<MessagesListResponse>(
            { queryKey: ['conversationMessages', conversation?.numeric_id] },
            (old) => {
              if (!old) return old
              return {
                ...old,
                items: old.items.map((msg) =>
                  msg.id === m.numericId ? { ...msg, additional_attributes: revertAttrs } : msg,
                ),
              }
            },
          )
        },
      },
    )
  }

  useEffect(() => {
    if (!displayConversation?.user_ids?.length) {
      setGroupUsers([])
      setSelectedUserIds([])
      return
    }
    setSelectedUserIds(displayConversation.user_ids || [])
  }, [displayConversation?.user_ids])

  useEffect(() => {
    if (batchUsers) setGroupUsers(batchUsers)
  }, [batchUsers])

  const currentUserId = authUser.id || undefined

  const isAssignedToMe =
    currentUserId != null &&
    displayConversation?.assigned_agent_id != null &&
    Number(displayConversation.assigned_agent_id) === Number(currentUserId)


  const storedInboxes = useMemo(() => {
    try {
      const raw = localStorage.getItem('userInboxes')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.items)) return parsed.items
      if (Array.isArray(parsed)) return parsed
      return []
    } catch {
      return []
    }
  }, [])

  const currentInbox = useMemo(() => {
    if (!displayConversation?.inbox_id) return undefined
    return storedInboxes.find((i: any) => Number(i.id) === Number(displayConversation.inbox_id))
  }, [displayConversation?.inbox_id, storedInboxes])

  const isInternalConversation = (currentInbox?.channel_type || '').toLowerCase() === 'internal'
  const isGroup = displayConversation?.conversation_type === 'group'
  const isDirect = displayConversation?.conversation_type === 'direct'

  const { name: dmOtherUserName, avatar: dmOtherUserAvatar, otherUser } = useDirectMessageOtherUser(
    displayConversation,
    currentUserId,
  )

  const { mutate: blockContact, isPending: isBlocking } = useBlockContact()
  const { mutate: unblockContact, isPending: isUnblocking } = useUnblockContact()
  const { mutate: closeConversation, isPending: isClosing } = useCloseConversation()
  const { mutate: addTag, isPending: isAddingTag } = useAddTagToContact()
  const { mutate: removeTag } = useRemoveTagFromContact()
  const { mutate: updateContact, isPending: isUpdatingContact } = useUpdateContact()
  const { mutate: updateConversation, isPending: isUpdatingConversation } = useUpdateConversation()
  const isUpdating = isUpdatingContact || isUpdatingConversation
  const { mutate: uploadMedia, isPending: isUploadingAvatar } = useUploadMedia()

  const { data: tagsData, isLoading: isLoadingAvailableTags } = useContactTags(0, 100)
  const availableTags = tagsData?.items || []

  const numericConversationId = displayConversation?.numeric_id || 0
  const { data: labelsData, isLoading: isLoadingAvailableLabels } = useLabels(0, 100)
  const availableLabels = labelsData?.labels || []
  const { data: conversationLabelsData } = useConversationLabels(numericConversationId, !!numericConversationId)
  const appliedLabels = conversationLabelsData?.items || []
  const { mutate: applyLabel } = useApplyLabel()
  const { mutate: removeLabel } = useRemoveLabel()
  const { data: allUsersData, isLoading: isLoadingAllUsers } = useUsers({ limit: 1000 }, isGroup)
  const allUsers = allUsersData?.users || []

  const [newTag, setNewTag] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [isAddingLabelActive, setIsAddingLabelActive] = useState(false)

  const filteredLabels = useMemo(() => {
    if (!availableLabels) return []
    if (!newLabel.trim()) return availableLabels
    const query = newLabel.toLowerCase()
    return availableLabels.filter((l) => l.title.toLowerCase().includes(query))
  }, [availableLabels, newLabel])

  const exactLabelMatch = useMemo(
    () => availableLabels?.find((l) => l.title.toLowerCase() === newLabel.trim().toLowerCase()),
    [availableLabels, newLabel],
  )

  const filteredTags = useMemo(() => {
    if (!availableTags) return []
    if (!newTag.trim()) return availableTags
    const query = newTag.toLowerCase()
    return availableTags.filter((t) => t.name.toLowerCase().includes(query))
  }, [availableTags, newTag])

  const exactMatch = useMemo(
    () => availableTags?.find((t) => t.name.toLowerCase() === newTag.trim().toLowerCase()),
    [availableTags, newTag],
  )

  const [isAddingTagActive, setIsAddingTagActive] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>('')
  const [editPhone, setEditPhone] = useState('')

  const contactId = displayConversation?.contact_id || 0
  const { data: contact } = useContact(contactId)

  useEffect(() => {
    if (contact) {
      setEditName(contact.name || '')
      setEditEmail(contact.email || '')
      setEditBio(contact.bio || '')
      setEditAvatarUrl(contact.avatar_url || '')
      setEditPhone(contact.phone ? (contact.phone.startsWith('+') ? contact.phone : `+${contact.phone}`) : '')
    } else if (displayConversation && isGroup) {
      setEditName(displayConversation.subject || '')
      setEditAvatarUrl(displayConversation.avatar || '')
    }
  }, [contact, displayConversation, isGroup])

  const getCountryCode = () => {
    if (!editPhone?.trim()) return contact?.country_code || '+965'
    const parsed = parsePhoneNumberFromString(editPhone)
    if (parsed?.countryCallingCode) return `+${parsed.countryCallingCode}`
    if (editPhone.startsWith('+20')) return '+20'
    if (contact?.country_code) return contact.country_code
    const match = editPhone?.trim().match(/^\+([0-9]{1,3})/)
    return match?.[0] || '+965'
  }

  const handleUpdateContact = () => {
    if (isGroup) {
      const numericId = Number(displayConversation?.numeric_id || profilePanelState.conversationId)
      if (!numericId) return
      updateConversation(
        { conversationId: numericId, data: { subject: editName, avatar_url: editAvatarUrl, user_ids: selectedUserIds } },
        {
          onSuccess: (updatedConv) => {
            updateConversationInCache(queryClient, String(displayConversation!.id), (c) => ({
              ...c,
              subject: updatedConv.subject ?? c.subject,
              avatar_url: updatedConv.avatar_url ?? c.avatar_url,
              user_ids: updatedConv.user_ids ?? c.user_ids,
            }))
            setIsEditing(false)
            setIsAddingMemberActive(false)
            toast.success('Group updated successfully')
          },
          onError: (error: any) => {
            toast.error(`Failed to update group: ${error.message || 'Unknown error'}`)
          },
        },
      )
      return
    }

    if (!contactId) return

    const cleanEditPhone = editPhone?.trim() ? editPhone.replace(/^\+/, '').trim() : null
    const contactPhone = contact?.phone ? contact.phone.replace(/^\+/, '').trim() : null
    const hasPhoneChanged = cleanEditPhone !== contactPhone

    const updateData: any = {
      name: editName?.trim() || null,
      email: editEmail?.trim() || null,
      bio: editBio?.trim() || '',
      avatar_url: editAvatarUrl?.trim() || null,
      last_name: '',
      middle_name: '',
      identifier: '',
      location: '',
      country_code: getCountryCode(),
    }
    if (hasPhoneChanged) updateData.phone = cleanEditPhone

    updateContact(
      { contactId, data: updateData },
      {
        onSuccess: () => {
          setIsEditing(false)
          toast.success('Contact updated successfully')
        },
        onError: (error: any) => {
          toast.error(`Failed to update contact: ${error.message || 'Unknown error'}`)
        },
      },
    )
  }


  const handleCancelEdit = () => {
    if (contact) {
      setEditName(contact.name || '')
      setEditEmail(contact.email || '')
      setEditBio(contact.bio || '')
      setEditAvatarUrl(contact.avatar_url || '')
    } else if (displayConversation && isGroup) {
      setEditName(displayConversation.subject || displayConversation.name || '')
      setEditAvatarUrl(displayConversation.avatar || '')
    }
    setIsEditing(false)
    setIsAddingMemberActive(false)
    setSelectedUserIds(displayConversation?.user_ids || [])
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click()
  }

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditAvatarUrl(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMedia(
      { file },
      {
        onSuccess: (response) => setEditAvatarUrl(response.url),
        onError: (error: any) => toast.error(`Failed to upload avatar: ${error.message || 'Unknown error'}`),
      },
    )
  }

  const rawTags = contact?.tags
  const tags = useMemo((): ContactTags[] => {
    if (!rawTags) return []
    const raw = rawTags as unknown
    const ids: number[] = (() => {
      if (Array.isArray(raw)) return raw.map(Number).filter(Boolean)
      if (typeof raw === 'string' && raw.length > 0) {
        try {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean)
        } catch {}
        return raw.split(',').map((s) => Number(s.trim())).filter(Boolean)
      }
      return []
    })()
    return ids.map((id) => availableTags.find((t) => t.id === id)).filter(Boolean) as ContactTags[]
  }, [rawTags, availableTags])

  const handleAddTag = async () => {
    if (!newTag.trim() || !contactId) return
    const tagName = newTag.trim()
    let tagId: number | undefined
    const existing = (availableTags || []).find((t) => t.name.toLowerCase() === tagName.toLowerCase())
    if (existing) {
      tagId = existing.id
    } else {
      try {
        const { tagsAPI } = await import('@/api/tags/endpoints')
        const created = await tagsAPI.createContactTag({ name: tagName, organization_id: contact?.organization_id })
        tagId = created.id
        queryClient.setQueryData<ContactTagsListResponse>(['contactTags', 0, 100], (old) => {
          if (!old) return old
          return { ...old, items: [...old.items, created], total: old.total + 1 }
        })
      } catch (createError) {
        console.error(`Error creating tag ${tagName}:`, createError)
      }
    }
    if (!tagId) return
    addTag({ contactId, tagId }, { onSuccess: () => { setNewTag(''); setIsAddingTagActive(false) } })
  }

  const handleRemoveTag = (tagId: number) => {
    if (!contactId) return
    removeTag({ contactId, tagId })
  }

  const handleTagToggle = (tagId: number, isAssigned: boolean) => {
    if (isAssigned) {
      handleRemoveTag(tagId)
    } else {
      addTag({ contactId, tagId })
    }
  }

  const handleApplyLabel = (labelId: number) => {
    if (!numericConversationId) return
    applyLabel({ conversationId: numericConversationId, labelId })
  }

  const handleRemoveLabel = (labelId: number) => {
    if (!numericConversationId) return
    removeLabel({ conversationId: numericConversationId, labelId })
  }

  const handleAddNewLabel = async () => {
    if (!newLabel.trim() || !numericConversationId) return
    const labelTitle = newLabel.trim()
    let labelId: number | undefined
    const existing = availableLabels.find((l) => l.title.toLowerCase() === labelTitle.toLowerCase())
    if (existing) {
      labelId = existing.id
    } else {
      try {
        const created = await labelsAPI.createLabel({ title: labelTitle, account_id: organizationId })
        labelId = created.id
        queryClient.setQueryData<LabelsListResponse>(['labels', 0, 100], (old) => {
          if (!old) return old
          return { ...old, labels: [...old.labels, created] }
        })
      } catch (err) {
        console.error(`Error creating label ${labelTitle}:`, err)
      }
    }
    if (!labelId) return
    applyLabel(
      { conversationId: numericConversationId, labelId },
      { onSuccess: () => { setNewLabel(''); setIsAddingLabelActive(false) } },
    )
  }

  const shouldFetchMedia = profilePanelState.isOpen && !!numericConversationId

  const { data: imagePngMedia = [], isLoading: isLoadingImagePngMedia } = useConversationMedia(numericConversationId, 'image/png', shouldFetchMedia)
  const { data: imageJpegMedia = [], isLoading: isLoadingImageJpegMedia } = useConversationMedia(numericConversationId, 'image/jpeg', shouldFetchMedia)
  const { data: imageMedia = [], isLoading: isLoadingImageMedia } = useConversationMedia(numericConversationId, 'image', shouldFetchMedia)
  const { data: videoMp4Media = [], isLoading: isLoadingVideoMp4Media } = useConversationMedia(numericConversationId, 'video', shouldFetchMedia)
  const { data: documentMedia = [], isLoading: isLoadingDocumentMedia } = useConversationMedia(numericConversationId, 'document', shouldFetchMedia)

  const isImageLike = (item: ConversationMediaItem) => {
    const t = String(item.media_type || '').toLowerCase()
    if (t === 'image' || t.startsWith('image/')) return true
    const name = String(item.media_name || '').toLowerCase()
    const url = String(item.media_url || '').toLowerCase()
    const raw = name || url
    return raw.endsWith('.png') || raw.endsWith('.jpg') || raw.endsWith('.jpeg') || raw.endsWith('.webp') || raw.endsWith('.gif')
  }

  const combinedMedia: ConversationMediaItem[] = useMemo(() => {
    const map = new Map<number, ConversationMediaItem>()
    for (const item of [...imagePngMedia, ...imageJpegMedia, ...imageMedia, ...videoMp4Media, ...documentMedia.filter(isImageLike)]) {
      map.set(item.message_id, item)
    }
    return Array.from(map.values())
  }, [imagePngMedia, imageJpegMedia, imageMedia, videoMp4Media, documentMedia])

  const { data: fileMedia = [], isLoading: isLoadingFileMedia } = useConversationMedia(numericConversationId, 'file', shouldFetchMedia)
  const { data: xlsxMedia = [], isLoading: isLoadingXlsxMedia } = useConversationMedia(numericConversationId, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', shouldFetchMedia)
  const { data: mswordMedia = [], isLoading: isLoadingMswordMedia } = useConversationMedia(numericConversationId, 'application/msword', shouldFetchMedia)
  const { data: pdfMedia = [], isLoading: isLoadingPdfMedia } = useConversationMedia(numericConversationId, 'application/pdf', shouldFetchMedia)

  const documentsMedia: ConversationMediaItem[] = useMemo(() => {
    const map = new Map<number, ConversationMediaItem>()
    for (const item of [...documentMedia, ...fileMedia, ...xlsxMedia, ...mswordMedia, ...pdfMedia]) {
      map.set(item.message_id, item)
    }
    return Array.from(map.values())
  }, [documentMedia, fileMedia, xlsxMedia, mswordMedia, pdfMedia])

  const isLoadingDocs = isLoadingDocumentMedia || isLoadingFileMedia || isLoadingXlsxMedia || isLoadingMswordMedia || isLoadingPdfMedia
  const isLoadingMedia = isLoadingImagePngMedia || isLoadingImageJpegMedia || isLoadingImageMedia || isLoadingVideoMp4Media || isLoadingDocumentMedia

  const { data: linkMedia = [], isLoading: isLoadingLinkMedia } = useConversationMedia(numericConversationId, 'link', shouldFetchMedia)

  const groupedMedia = useMemo(() => groupByMonth(combinedMedia), [combinedMedia, i18n.language])
  const groupedDocuments = useMemo(() => groupByMonth(documentsMedia), [documentsMedia, i18n.language])
  const groupedLinks = useMemo(() => groupByMonth(linkMedia), [linkMedia, i18n.language])

  const handleCloseConversation = () => {
    const conversationNumericId = Number(displayConversation?.numeric_id)
    if (!Number.isFinite(conversationNumericId) || conversationNumericId <= 0 || !isAssignedToMe) {
      uiDispatch(closeProfilePanel())
      return
    }
    closeConversation(conversationNumericId)
    uiDispatch(closeProfilePanel())
  }

  const handleBlockToggle = () => {
    if (!isAssignedToMe || !displayConversation?.contact_id) {
      uiDispatch(closeProfilePanel())
      return
    }
    if (displayConversation.blocked) {
      unblockContact(displayConversation.contact_id, {
        onSuccess: () => {
          updateConversationInCache(queryClient, String(displayConversation.id), (c) => ({ ...c, status: 'open' }))
          uiDispatch(closeProfilePanel())
        },
        onError: () => { uiDispatch(closeProfilePanel()); toast.error('Failed to unblock contact') },
      })
    } else {
      blockContact(displayConversation.contact_id, {
        onSuccess: () => {
          updateConversationInCache(queryClient, String(displayConversation.id), (c) => ({ ...c, status: 'blocked' }))
          uiDispatch(closeProfilePanel())
        },
        onError: () => { uiDispatch(closeProfilePanel()); toast.error('Failed to block contact') },
      })
    }
  }

  if (!profilePanelState.isOpen || !displayConversation) return null

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="h-full w-full bg-xon-surface-container flex flex-col overflow-hidden">
      <ProfileHeader
        isRTL={isRTL}
        isMobile={isMobile}
        isGroup={isGroup}
        isDirect={isDirect}
        isInternalConversation={isInternalConversation}
        isAssignedToMe={isAssignedToMe}
        isEditing={isEditing}
        isUpdating={isUpdating}
        onClose={() => uiDispatch(closeProfilePanel())}
        onEdit={() => setIsEditing(true)}
        onSave={handleUpdateContact}
        onCancel={handleCancelEdit}
      />

      <div className="flex-1 overflow-y-auto bg-xon-surface-container xon-scrollbar-thin">
        <ProfileAvatar
          isEditing={isEditing}
          isGroup={isGroup}
          isDirect={isDirect}
          isUploadingAvatar={isUploadingAvatar}
          editAvatarUrl={editAvatarUrl}
          editName={editName}
          editEmail={editEmail}
          groupUsers={groupUsers}
          contact={contact}
          conversation={displayConversation}
          otherUser={otherUser}
          dmOtherUserName={dmOtherUserName || ''}
          dmOtherUserAvatar={dmOtherUserAvatar || ''}
          fileInputRef={fileInputRef}
          onAvatarClick={handleAvatarClick}
          onRemoveAvatar={handleRemoveAvatar}
          onFileChange={handleFileChange}
          onNameChange={setEditName}
          onEmailChange={setEditEmail}
          getStatusColor={getStatusColor}
          formatLastActive={formatLastActive}
        />

        <div className="bg-xon-surface-container border-b border-xon-surface-outline">
          <ProfileContactInfo
            isEditing={isEditing}
            isGroup={isGroup}
            isDirect={isDirect}
            contact={contact}
            conversation={displayConversation}
            editBio={editBio}
            editPhone={editPhone}
            onBioChange={setEditBio}
            onPhoneChange={(phone) => setEditPhone(phone)}
          />

          <StarredMessages
            starredMessages={starredMessages}
            groupUsers={groupUsers}
            contact={contact}
            conversation={displayConversation}
            formatTime={formatTime}
            onScrollTo={(id) => {
              uiDispatch(closeProfilePanel())
              uiDispatch(requestScrollToMessage(id))
            }}
            onUnstar={handleUnstar}
          />

          {isGroup && (
            <GroupParticipants
              isEditing={isEditing}
              isLoadingAllUsers={isLoadingAllUsers}
              allUsers={allUsers}
              groupUsers={groupUsers}
              selectedUserIds={selectedUserIds}
              currentUserId={currentUserId}
              conversation={displayConversation}
              isAddingMemberActive={isAddingMemberActive}
              memberSearchQuery={memberSearchQuery}
              onToggleAddMember={() => setIsAddingMemberActive(!isAddingMemberActive)}
              onMemberSearchChange={setMemberSearchQuery}
              onToggleUser={(userId) =>
                setSelectedUserIds((prev) =>
                  prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
                )
              }
              onRemoveUser={(userId) => setSelectedUserIds((prev) => prev.filter((id) => id !== userId))}
              getStatusColor={getStatusColor}
            />
          )}

          {displayConversation.lastMessage && (
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wide mb-2">
                Last message
              </p>
              <p className="text-base font-semibold text-xon-text-primary">
                {displayConversation.lastMessage.createdAt}
              </p>
            </div>
          )}

          <TagsSection
            tags={tags}
            filteredTags={filteredTags}
            newTag={newTag}
            exactMatch={exactMatch}
            isAddingTagActive={isAddingTagActive}
            isAddingTag={isAddingTag}
            isLoadingAvailableTags={isLoadingAvailableTags}
            isAssignedToMe={isAssignedToMe}
            onNewTagChange={setNewTag}
            onToggleAddTag={() => setIsAddingTagActive(!isAddingTagActive)}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onTagToggle={handleTagToggle}
          />

          {!isGroup && !isDirect && (
            <LabelsSection
              appliedLabels={appliedLabels}
              availableLabels={availableLabels}
              filteredLabels={filteredLabels}
              newLabel={newLabel}
              exactLabelMatch={exactLabelMatch}
              isAddingLabelActive={isAddingLabelActive}
              isLoadingAvailableLabels={isLoadingAvailableLabels}
              onNewLabelChange={setNewLabel}
              onToggleAddLabel={() => setIsAddingLabelActive(!isAddingLabelActive)}
              onAddNewLabel={handleAddNewLabel}
              onApplyLabel={handleApplyLabel}
              onRemoveLabel={handleRemoveLabel}
            />
          )}
        </div>

        {(displayConversation.pinned || displayConversation.blocked || displayConversation.archived) && (
          <div className="bg-xon-surface-container border-b border-xon-surface-outline px-4 py-4">
            <div className="flex gap-2 flex-wrap text-start">
              {displayConversation.pinned && (
                <div className="px-3 py-1 rounded-full bg-xon-surface-container-hover text-xon-text-primary text-xs font-semibold flex items-center gap-1">
                  <span>📌</span> Pinned
                </div>
              )}
              {displayConversation.blocked && (
                <div className="px-3 py-1 rounded-full bg-xon-container-red text-xon-text-red text-xs font-semibold flex items-center gap-1">
                  <span>🚫</span> Blocked
                </div>
              )}
              {displayConversation.archived && (
                <div className="px-3 py-1 rounded-full bg-xon-surface-container-hover text-xon-text-primary text-xs font-semibold flex items-center gap-1">
                  <span>📦</span> Archived
                </div>
              )}
            </div>
          </div>
        )}

        {displayConversation.lastMessage && (
          <div className="px-4 py-4 border-t border-xon-surface-outline">
            <p className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wide mb-2 text-start">
              Last Message
            </p>
            <div className="p-4 rounded-xl bg-xon-container-blue border border-xon-blue text-start">
              <p className="text-sm text-xon-text-primary line-clamp-3">
                {displayConversation.lastMessage.text || '[Media message]'}
              </p>
            </div>
          </div>
        )}

        <MediaSection
          activeTab={activeTab}
          onTabChange={setActiveTab}
          combinedMedia={combinedMedia}
          documentsMedia={documentsMedia}
          linkMedia={linkMedia}
          groupedMedia={groupedMedia}
          groupedDocuments={groupedDocuments}
          groupedLinks={groupedLinks}
          collapsedGroups={collapsedGroups}
          onToggleGroup={(key) => setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }))}
          isLoadingMedia={isLoadingMedia}
          isLoadingDocs={isLoadingDocs}
          isLoadingLinkMedia={isLoadingLinkMedia}
          reactionsByMessageId={reactionsByMessageId}
          numericConversationId={numericConversationId}
          isMediaViewerOpen={isMediaViewerOpen}
          mediaViewerMessageId={mediaViewerMessageId}
          onOpenMediaViewer={(id) => { setMediaViewerMessageId(id); setIsMediaViewerOpen(true) }}
          onMediaViewerOpenChange={setIsMediaViewerOpen}
          reactionsDetailsOpen={reactionsDetailsOpen}
          reactionsDetailsReactions={reactionsDetailsReactions}
          reactionsDetailsContext={reactionsDetailsContext}
          onReactionsDetailsOpenChange={setReactionsDetailsOpen}
          onReactionsDetailsSet={(reactions, context) => {
            setReactionsDetailsReactions(reactions)
            setReactionsDetailsContext(context)
            setReactionsDetailsOpen(true)
          }}
          formatBytes={formatBytes}
        />

        <ActionButtons
          conversation={displayConversation}
          isInternalConversation={isInternalConversation}
          isAssignedToMe={isAssignedToMe}
          isClosing={isClosing}
          isBlocking={isBlocking}
          isUnblocking={isUnblocking}
          onClose={handleCloseConversation}
          onBlock={handleBlockToggle}
        />
      </div>
    </div>
  )
}
