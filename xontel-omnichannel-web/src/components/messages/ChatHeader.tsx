import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Phone, Video, MoreVertical, Search, Info, ArrowLeft, ArrowRight, Pin, PinOff, Ban, Shield, X, StickyNote, Tag, Check, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'react-router-dom'
import { useContactTags } from '@/api/tags/hooks'
import type { ContactTags, ContactTagsListResponse } from '@/api/tags/types'
import { useContact, useAddTagToContact, useRemoveTagFromContact } from '@/api/contacts/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useNotes } from '@/api/conversations/hooks'
import { useAuthUser } from '@/contexts/AuthContext'
import { updateConversationInCache } from '@/api/conversations/cacheUtils'
import { useUIContext, openProfilePanel } from '@/contexts/UIContext'
import { Button } from '@components/ui/button'
import { useIsMobile } from '@hooks/use-mobile'
import { useTranslation } from 'react-i18next'
import { useBlockContact, useUnblockContact } from '@/api/contacts/hooks'
import { useCloseConversation, usePinConversation, useUnpinConversation } from '@/api/conversations/hooks'
import { useDirectMessageOtherUser } from '@/hooks/useDirectMessageOtherUser'
import { useDateFormat } from '@/hooks/useDateFormat'
import Avatar from '../shared/Avatar'
import GroupAvatarGrid from '../shared/GroupAvatarGrid'
import { useUsersByIds, useUser } from '@/api/users/hooks'
import AgentAvatarPopup from '@/components/conversations/AgentAvatarPopup'
import { Skeleton } from '@components/ui/skeleton'

interface ChatHeaderProps {
  conversation: any | null
  onCall?: () => void
  onVideoCall?: () => void
  onInfo?: () => void
  onBack?: () => void
  onSearch?: () => void
  onNotesToggle?: () => void
  isNotesOpen?: boolean
  isInternalConversation?: boolean
}

export default function ChatHeader({
  conversation,
  onCall,
  onVideoCall,
  onInfo,
  onBack,
  onSearch,
  onNotesToggle,
  isNotesOpen = false,
  isInternalConversation = false,
}: ChatHeaderProps) {
  const { state: uiState, dispatch: uiDispatch } = useUIContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCall = uiState.activeCall
  const isMobile = useIsMobile()
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      // Use 1024px (lg breakpoint) as the threshold for the compact/two-row layout
      setIsCompact(window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { t, i18n } = useTranslation('chat')
  const isRTL = i18n.language === 'ar'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [showVideoCall, setShowVideoCall] = useState(false);
  const { mutate: blockContact, isPending: isBlocking } = useBlockContact();
  const { mutate: unblockContact, isPending: isUnblocking } = useUnblockContact();
  const { mutate: closeConversation, isPending: isClosing } = useCloseConversation();
  const { mutate: pinConversationMutation } = usePinConversation();
  const { mutate: unpinConversationMutation } = useUnpinConversation();

  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false);
  const tagsMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);
  const [isAddingTagActive, setIsAddingTagActive] = useState(false);
  const [newTag, setNewTag] = useState('');
  const addTagPanelRef = useRef<HTMLDivElement>(null);

  const handleTagsMouseEnter = () => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsTagsMenuOpen(true);
  };

  const handleTagsMouseLeave = () => {
    if (isMobile) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsTagsMenuOpen(false);
    }, 150);
  };

  const contactId = conversation?.contact_id || 0;
  const { data: contact } = useContact(contactId);
  const { data: tagsData, isLoading: isLoadingAvailableTags } = useContactTags(0, 100);
  const availableTags = tagsData?.items || [];
  const { data: assignedAgent } = useUser(conversation?.assigned_agent_id || 0);

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
        return raw.split(',').map(s => Number(s.trim())).filter(Boolean)
      }
      return []
    })()
    return ids.map(id => availableTags.find(t => t.id === id)).filter(Boolean) as ContactTags[]
  }, [rawTags, availableTags])

  const { mutate: addTag, isPending: isAddingTag } = useAddTagToContact();
  const { mutate: removeTag } = useRemoveTagFromContact();
  const queryClient = useQueryClient();

  const filteredTags = useMemo(() => {
    if (!newTag.trim()) return availableTags;
    const query = newTag.toLowerCase();
    return availableTags.filter(t => t.name.toLowerCase().includes(query));
  }, [availableTags, newTag]);

  const exactMatch = useMemo(() => {
    return availableTags.some(t => t.name.toLowerCase() === newTag.trim().toLowerCase());
  }, [availableTags, newTag]);

  const handleAddTag = async () => {
    if (!newTag.trim() || !contactId) return;
    const tagName = newTag.trim();
    let tagId: number | undefined;
    const existing = availableTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    if (existing) {
      tagId = existing.id;
    } else {
      try {
        const { tagsAPI } = await import('@/api/tags/endpoints');
        const created = await tagsAPI.createContactTag({ name: tagName, organization_id: contact?.organization_id });
        tagId = created.id;
        queryClient.setQueryData<ContactTagsListResponse>(['contactTags', 0, 100], (old) => {
          if (!old) return old;
          return { ...old, items: [...old.items, created], total: old.total + 1 };
        });
      } catch (createError) {
        console.error(`Error creating tag ${tagName}:`, createError);
      }
    }
    if (!tagId) return;
    addTag({ contactId, tagId }, {
      onSuccess: () => {
        setNewTag('');
        setIsAddingTagActive(false);
      },
    });
  };

  const handleRemoveTagFromHeader = (tagId: number) => {
    if (!contactId) return;
    removeTag({ contactId, tagId });
  };

  // Fetch notes for badge count
  const { data: notes = [] } = useNotes(conversation?.numeric_id || 0);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const currentUserId = useAuthUser().id || undefined

  const isAssignedToMe =
    currentUserId != null &&
    conversation?.assigned_agent_id != null &&
    Number(conversation.assigned_agent_id) === Number(currentUserId)

  const { formatRelativeActiveTime } = useDateFormat();
  const isGroup = conversation?.conversation_type === 'group';

  // Get other user data for direct messages
  const { name: dmOtherUserName, avatar: dmOtherUserAvatar, otherUser } = useDirectMessageOtherUser(
    conversation.conversation_type === 'direct' ? conversation : null,
    currentUserId
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

  // For direct messages, use other user's name/avatar
  // Fallback to conversation.name if direct message other user data not found
  const displayName = (() => {
    // Only try to resolve other user for confirmed direct conversations
    if (conversation.conversation_type === 'direct' && conversation.user_ids?.length) {
      if (dmOtherUserName) return dmOtherUserName;
      if (conversation.name !== "Loading...") return conversation.name;
      return "Loading...";
    }
    // For groups, prioritize subject (group title)
    if (isGroup) {
      if (conversation.subject) return conversation.subject;
      if (conversation.name !== "Loading...") return conversation.name;
      return "Loading...";
    }
    return conversation.name;
  })();

  const displayAvatar = (() => {
    // Only try to resolve other user for confirmed direct conversations
    if (conversation.conversation_type === 'direct' && conversation.user_ids?.length) {
      return dmOtherUserAvatar || conversation.avatar;
    }
    return conversation.avatar;
  })();

  // Check if still loading
  const isLoading = displayName === "Loading..."

  // Fetch group member data for group conversations
  const { data: groupUsers } = useUsersByIds(
    isGroup && conversation.user_ids ? conversation.user_ids.slice(0, 9) : []
  );

  // Build avatar arrays for group grid
  const groupAvatars = groupUsers?.map(u => u.avatar_url) || [];
  const groupNames = groupUsers?.map(u => u.full_name) || [];

  // Debug logging for mobile
  useEffect(() => {
    if (displayName === "Loading...") {
      console.log("📱 ChatHeader: Name still loading", {
        conversationType: conversation.conversation_type,
        userIds: conversation.user_ids,
        contactId: conversation.contact_id,
        dmOtherUserName,
        conversationName: conversation.name,
      });
    }
  }, [displayName, conversation.conversation_type, conversation.user_ids, conversation.contact_id, dmOtherUserName, conversation.name]);

  useEffect(() => {
    if (!isMenuOpen && !isTagsMenuOpen && !isAddingTagActive) return
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
      if (tagsMenuRef.current && !tagsMenuRef.current.contains(event.target as Node)) {
        setIsTagsMenuOpen(false)
      }
      if (addTagPanelRef.current && !addTagPanelRef.current.contains(event.target as Node)) {
        setIsAddingTagActive(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen, isTagsMenuOpen, isAddingTagActive])

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    const newParams = new URLSearchParams(searchParams)
    newParams.delete('conversation')
    setSearchParams(newParams, { replace: true })
  }

  const handleMenuItemClick = () => {
    setIsMenuOpen(false)
  }

  if (!conversation) {
    return (
      <div className={`sm:h-16 border-b border-xon-surface-outline flex items-center justify-between flex-shrink-0 ${isMobile ? 'bg-xon-surface-container px-4 pt-[env(safe-area-inset-top)] pb-3' : 'bg-xon-surface-container px-3 sm:px-4 h-14 py-2'}`}>
        {!isMobile && (
          <div className="text-sm text-xon-text-secondary">Select a conversation</div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Chat Header */}
      <div className={`relative z-30 flex flex-col flex-shrink-0 border-b border-xon-surface-outline ${isCompact ? 'bg-xon-surface-container pt-4 px-4 pb-3' : 'bg-xon-surface-container h-16 px-3 sm:px-4 py-3'}`}>
        {/* Top Row: Back, Profile, Actions */}
        <div className="flex items-center justify-between w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-xon-text-primary hover:bg-xon-surface-container"
                onClick={handleBackClick}
                title="Back to conversations"
              >
                {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
              </Button>
            )}

            <button
              onClick={() => uiDispatch(openProfilePanel(conversation.id))}
              className="flex items-center gap-2 sm:gap-3 text-start cursor-pointer transition-opacity min-w-0 flex-1"
              title="View profile"
            >
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 w-32 sm:w-40" />
                </>
              ) : isGroup ? (
                <>
                  <GroupAvatarGrid
                    avatars={groupAvatars}
                    names={groupNames}
                    size={isCompact ? 32 : 40}
                    maxDisplay={9}
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 max-w-full">
                      <p className="font-semibold hover:opacity-80 transition-opacity truncate text-sm sm:text-lg text-xon-text-primary" style={{ maxWidth: isCompact ? '160px' : '400px' }}>{displayName}</p>

                      {!isCompact && tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                          {tags.slice(0, 3).map((tag) => {
                            const tagColor = tag.color || '#3b82f6';
                            return (
                              <div
                                key={tag.id}
                                className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg text-white text-[10px] font-semibold shadow-sm"
                                style={{ backgroundColor: tagColor }}
                              >
                                <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-white/20" />
                                <span className="truncate max-w-[60px] sm:max-w-[100px]">{tag.name}</span>
                              </div>
                            );
                          })}

                          {tags.length > 3 && (
                            <div
                              className="relative"
                              ref={tagsMenuRef}
                              onMouseEnter={handleTagsMouseEnter}
                              onMouseLeave={handleTagsMouseLeave}
                            >
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsTagsMenuOpen(!isTagsMenuOpen);
                                }}
                                className="inline-flex items-center justify-center h-5 sm:h-6 px-2 rounded-lg bg-xon-primary/10 text-xon-primary text-[10px] sm:text-xs font-bold hover:bg-xon-primary/20 transition-colors shadow-sm"
                              >
                                +{tags.length - 3}
                              </div>

                              {isTagsMenuOpen && (
                                <div className={cn(
                                  "absolute mt-1 w-48 bg-xon-surface-container rounded-xl shadow-xl border border-xon-surface-outline z-[99999] p-2 space-y-1",
                                  isRTL ? "right-0" : "left-0"
                                )}>
                                  <p className="text-[10px] font-bold text-xon-text-secondary uppercase px-2 py-1 mb-1 border-b border-xon-surface-outline">Contact Tags</p>
                                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                                    {tags.slice(3).map((tag) => {
                                      const tagColor = tag.color || '#3b82f6';
                                      return (
                                        <div
                                          key={tag.id}
                                          className="flex items-center w-fit gap-1 px-2 py-0.5 rounded-lg text-white text-xs font-semibold shadow-sm"
                                          style={{ backgroundColor: tagColor }}
                                        >
                                          <Tag className="h-3.5 w-3.5 fill-white/20" />
                                          <span className="truncate">{tag.name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Group members names - WhatsApp style */}
                    <p className="text-[10px] sm:text-xs text-xon-text-secondary truncate max-w-[150px] sm:max-w-[300px]">{(() => {
                      const names = groupNames.filter(Boolean);
                      if (names.length === 0) return '';
                      if (names.length <= 3) return names.join(', ');
                      return `${names.slice(0, 3).join(', ')} +${names.length - 3}`;
                    })()}</p>
                  </div>
                </>
              ) : (
                <>
                  <Avatar size={isCompact ? "sm" : "md"} src={displayAvatar} name={displayName} />
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 max-w-full">
                      <p className="font-semibold hover:opacity-80 transition-opacity truncate text-sm sm:text-lg text-xon-text-primary" style={{ maxWidth: isCompact ? '160px' : '400px' }}>{displayName}</p>

                      {!isCompact && (tags.length > 0 || contactId > 0) && (
                        <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                          {tags.slice(0, 3).map((tag) => {
                            const tagColor = tag.color || '#3b82f6';
                            return (
                              <div
                                key={tag.id}
                                className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg text-white text-[10px] font-semibold shadow-sm"
                                style={{ backgroundColor: tagColor }}
                              >
                                <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-white/20" />
                                <span className="truncate max-w-[60px] sm:max-w-[100px]">{tag.name}</span>
                              </div>
                            );
                          })}

                          {tags.length > 3 && (
                            <div
                              className="relative"
                              ref={tagsMenuRef}
                              onMouseEnter={handleTagsMouseEnter}
                              onMouseLeave={handleTagsMouseLeave}
                            >
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsTagsMenuOpen(!isTagsMenuOpen);
                                }}
                                className="inline-flex items-center justify-center h-5 sm:h-6 px-2 rounded-lg bg-xon-primary/10 text-xon-primary text-[10px] sm:text-xs font-bold hover:bg-xon-primary/20 transition-colors shadow-sm"
                              >
                                +{tags.length - 3}
                              </div>

                              {isTagsMenuOpen && (
                                <div className={cn(
                                  "absolute mt-1 w-48 bg-xon-surface-container rounded-xl shadow-xl border border-xon-surface-outline z-[99999] p-2 space-y-1",
                                  isRTL ? "right-0" : "left-0"
                                )}>
                                  <p className="text-[10px] font-bold text-xon-text-secondary uppercase px-2 py-1 mb-1 border-b border-xon-surface-outline">Contact Tags</p>
                                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                                    {tags.slice(3).map((tag) => {
                                      const tagColor = tag.color || '#3b82f6';
                                      return (
                                        <div
                                          key={tag.id}
                                          className="flex items-center w-fit gap-1 px-2 py-0.5 rounded-lg text-white text-xs font-semibold shadow-sm"
                                          style={{ backgroundColor: tagColor }}
                                        >
                                          <Tag className="h-3.5 w-3.5 fill-white/20" />
                                          <span className="truncate">{tag.name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {contactId > 0 && (
                            <div className="relative" ref={addTagPanelRef}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAddingTagActive(!isAddingTagActive);
                                  setNewTag('');
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1 px-1.5 h-5 sm:h-6 rounded-lg border border-dashed text-[10px] font-semibold transition-all shadow-sm",
                                  isAddingTagActive
                                    ? "border-xon-primary bg-xon-primary text-white"
                                    : "border-xon-primary/50 text-xon-primary hover:border-xon-primary hover:bg-xon-primary/10"
                                )}
                                title="Add tag"
                              >
                                <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span>{t('conversations.profile.add_tag_btn', 'Add tag')}</span>
                              </button>

                              {isAddingTagActive && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className={cn(
                                  "absolute top-full mt-1 w-56 bg-xon-surface-container rounded-xl shadow-xl border border-xon-surface-outline z-[99999] overflow-hidden",
                                  isRTL ? "right-0" : "left-0"
                                )}>
                                  <div className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-xon-text-secondary uppercase">Manage Tags</span>
                                      {newTag.trim() && !exactMatch && (
                                        <button
                                          onClick={handleAddTag}
                                          disabled={isAddingTag}
                                          className="flex items-center gap-1 px-2 py-1 bg-xon-primary text-white rounded-lg text-xs font-bold hover:bg-xon-primary/90 transition-all disabled:opacity-50"
                                        >
                                          <Plus className="h-3 w-3" />
                                          <span>Add "{newTag}"</span>
                                        </button>
                                      )}
                                    </div>
                                    <input
                                      type="text"
                                      value={newTag}
                                      onChange={(e) => setNewTag(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                                      placeholder="Search or type new tag..."
                                      className="w-full bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg text-xs outline-none text-xon-text-primary px-2 py-1.5 focus:ring-1 focus:ring-xon-primary/30 transition-all"
                                      disabled={isAddingTag}
                                      autoFocus
                                    />
                                  </div>
                                  <div className="border-t border-xon-surface-outline" />
                                  <div className="max-h-48 overflow-y-auto">
                                    {isLoadingAvailableTags ? (
                                      <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-4 w-4 animate-spin text-xon-text-secondary" />
                                      </div>
                                    ) : filteredTags.length > 0 ? (
                                      <div className="p-2 space-y-1">
                                        {filteredTags.map((tag) => {
                                          const isAssigned = tags.some(t => t.id === tag.id);
                                          return (
                                            <div
                                              key={tag.id}
                                              onClick={() => isAssigned ? handleRemoveTagFromHeader(tag.id) : addTag({ contactId, tagId: tag.id })}
                                              className={`flex items-center justify-between p-1 rounded-lg cursor-pointer transition-all ${isAssigned ? 'bg-xon-primary/5' : 'hover:bg-xon-surface-container-hover'}`}
                                            >
                                              <div
                                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-white text-xs font-semibold shadow-sm"
                                                style={{ backgroundColor: tag.color || '#3b82f6' }}
                                              >
                                                <Tag className="h-3.5 w-3.5 fill-white/20" />
                                                <span>{tag.name}</span>
                                              </div>
                                              <div className={`w-4 h-4 rounded flex items-center justify-center transition-all border ${isAssigned ? 'bg-xon-primary border-xon-primary' : 'bg-transparent border-xon-surface-outline'}`}>
                                                {isAssigned && <Check className="h-3 w-3 text-white stroke-[3]" />}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="py-6 px-4 text-center">
                                        <p className="text-xs text-xon-text-secondary italic">
                                          {newTag.trim() ? `No matches for "${newTag}"` : 'No existing tags found'}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {!isGroup && (conversation.conversation_type === 'direct' || !isInternalConversation) && (
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-xon-text-secondary">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getStatusColor(conversation.conversation_type === 'direct' ? otherUser?.agent_status : 'online') }} />
                        <span>
                          {conversation.conversation_type === 'direct' ? (
                            otherUser?.agent_status === 'online' ? 'Online' : formatRelativeActiveTime(
                       otherUser?.last_login
                            )
                          ) : 'Active now'}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Assigned Agent display */}
            {conversation?.assigned_agent_id && assignedAgent && (
              <AgentAvatarPopup agent={assignedAgent} isRTL={isRTL}>
                <div className="flex items-center gap-1.5 px-1.5 py-1 bg-xon-surface-container-hover rounded-full border border-xon-surface-outline mr-1 sm:mr-3 flex-shrink-0">
                  <Avatar size="xs" src={assignedAgent.avatar_url} name={assignedAgent.full_name} />
                  <span className="hidden sm:inline text-xs font-semibold text-xon-text-primary whitespace-nowrap truncate max-w-[120px]">
                    {assignedAgent.full_name}
                  </span>
                </div>
              </AgentAvatarPopup>
            )}

            {isAssignedToMe && !isInternalConversation && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-xon-text-primary hover:bg-xon-surface-container disabled:opacity-50"
                onClick={onCall}
                title={activeCall?.isInCall ? 'A call is currently in progress' : 'Call'}
                disabled={activeCall?.isInCall}
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}

            {onNotesToggle && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 hover:bg-xon-surface-container ${isNotesOpen ? 'text-xon-primary bg-xon-primary/10' : 'text-xon-text-primary'}`}
                  onClick={onNotesToggle}
                  title="Conversation Notes"
                >
                  <StickyNote className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                {notes.length > 0 && (
                  <div className="absolute -top-0 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                    {notes.length}
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-xon-text-primary hover:bg-xon-surface-container"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="More options"
              >
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {isMenuOpen && (
                <div className={cn(
                  "absolute mt-2 w-48 bg-xon-surface-container rounded-lg shadow-lg border border-xon-surface-outline z-[99999] overflow-hidden",
                  isRTL ? "left-0" : "right-0"
                )}>
                  <button
                    onClick={() => {
                      onSearch?.()
                      handleMenuItemClick()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xon-text-primary hover:bg-xon-surface-container-hover transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    <span>{t('common.search')}</span>
                  </button>
                  <button
                    onClick={() => {
                      uiDispatch(openProfilePanel(conversation.id))
                      handleMenuItemClick()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xon-text-primary hover:bg-xon-surface-container-hover transition-colors"
                  >
                    <Info className="h-4 w-4" />
                    <span>{t('conversations.menu.view_profile')}</span>
                  </button>
                  {!isInternalConversation && isAssignedToMe && (
                    <>
                      {!conversation.closed && (
                        <button
                          onClick={() => {
                            setShowCloseConfirm(true)
                            handleMenuItemClick()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xon-text-primary hover:bg-xon-surface-container-hover transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>{t('conversations.menu.close_conversation')}</span>
                        </button>
                      )}
                      {conversation.pinned ? (
                        <button
                          onClick={() => {
                            updateConversationInCache(queryClient, conversation.id, (c) => ({ ...c, pinned: false }))

                            const numericId = Number(conversation.numeric_id || 0)
                            if (!Number.isFinite(numericId) || numericId <= 0) {
                              handleMenuItemClick()
                              return
                            }

                            unpinConversationMutation(numericId, {
                              onError: () => {
                                updateConversationInCache(queryClient, conversation.id, (c) => ({ ...c, pinned: true }))
                              },
                            })
                            handleMenuItemClick()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xon-text-primary hover:bg-xon-surface-container-hover transition-colors"
                        >
                          <PinOff className="h-4 w-4" />
                          <span>{t('conversations.menu.unpin')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateConversationInCache(queryClient, conversation.id, (c) => ({ ...c, pinned: true }))

                            const numericId = Number(conversation.numeric_id || 0)
                            if (!Number.isFinite(numericId) || numericId <= 0) {
                              handleMenuItemClick()
                              return
                            }

                            pinConversationMutation(numericId, {
                              onError: () => {
                                updateConversationInCache(queryClient, conversation.id, (c) => ({ ...c, pinned: false }))
                              },
                            })
                            handleMenuItemClick()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xon-text-primary hover:bg-xon-surface-container-hover transition-colors"
                        >
                          <Pin className="h-4 w-4" />
                          <span>{t('conversations.menu.pin')}</span>
                        </button>
                      )}
                      {conversation.blocked ? (
                        <button
                          onClick={() => {
                            if (!conversation?.contact_id) {
                              handleMenuItemClick();
                              return;
                            }
                            if (!isAssignedToMe) {
                              handleMenuItemClick();
                              return;
                            }
                            unblockContact(conversation.contact_id, {
                              onSuccess: () => {
                                updateConversationInCache(queryClient, conversation.id, (c) => ({ ...c, status: "open" }))
                                handleMenuItemClick()
                              },
                              onError: () => {
                                handleMenuItemClick()
                                alert('Failed to unblock contact')
                              },
                            })
                          }}
                          disabled={isUnblocking}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xon-text-primary hover:bg-xon-surface-container-hover transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          <span>{isUnblocking ? t('conversations.menu.unblocking') : t('conversations.menu.unblock')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!conversation?.contact_id) {
                              handleMenuItemClick();
                              return;
                            }
                            if (!isAssignedToMe) {
                              handleMenuItemClick();
                              return;
                            }
                            blockContact(conversation.contact_id, {
                              onSuccess: () => {
                                updateConversationInCache(queryClient, conversation.id, (c) => ({ ...c, status: "blocked" }))
                                handleMenuItemClick()
                              },
                              onError: () => {
                                handleMenuItemClick()
                                alert('Failed to block contact')
                              },
                            })
                          }}
                          disabled={isBlocking}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xon-text-primary hover:bg-xon-surface-container-hover transition-colors"
                        >
                          <Ban className="h-4 w-4" />
                          <span>{isBlocking ? t('conversations.menu.blocking') : t('conversations.menu.block')}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Tags (Mobile/Tablet Only) */}
        {isCompact && (tags.length > 0 || contactId > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 px-1 w-full">
            {tags.slice(0, isMobile ? 2 : 3).map((tag) => {
              const tagColor = tag.color || '#3b82f6';
              return (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-white text-[10px] font-semibold shadow-sm"
                  style={{ backgroundColor: tagColor }}
                >
                  <Tag className="h-2.5 w-2.5 fill-white/20" />
                  <span className="truncate max-w-[100px]">{tag.name}</span>
                </div>
              );
            })}
            {tags.length > (isMobile ? 2 : 3) && (
              <div className="relative" ref={tagsMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTagsMenuOpen(!isTagsMenuOpen);
                  }}
                  className="h-5 px-1.5 rounded-lg bg-xon-primary/10 text-xon-primary text-[10px] font-bold flex items-center justify-center hover:bg-xon-primary/20 transition-colors"
                >
                  +{tags.length - (isMobile ? 2 : 3)}
                </button>

                {isTagsMenuOpen && (
                  <div className={cn(
                    "absolute mt-1 w-48 bg-xon-surface-container rounded-xl shadow-xl border border-xon-surface-outline z-[99999] p-2 space-y-1",
                    isRTL ? "right-0" : "left-0"
                  )}>
                    <p className="text-[10px] font-bold text-xon-text-secondary uppercase px-2 py-1 mb-1 border-b border-xon-surface-outline">Contact Tags</p>
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {tags.slice(isMobile ? 2 : 3).map((tag) => {
                        const tagColor = tag.color || '#3b82f6';
                        return (
                          <div
                            key={tag.id}
                            className="flex items-center w-fit gap-1 px-2 py-0.5 rounded-lg text-white text-xs font-semibold shadow-sm"
                            style={{ backgroundColor: tagColor }}
                          >
                            <Tag className="h-3.5 w-3.5 fill-white/20" />
                            <span className="truncate">{tag.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {contactId > 0 && (
              <div className="relative" ref={addTagPanelRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingTagActive(!isAddingTagActive);
                    setNewTag('');
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 h-5 sm:h-6 rounded-lg border border-dashed text-[10px] font-semibold transition-all shadow-sm",
                    isAddingTagActive
                      ? "border-xon-primary bg-xon-primary text-white"
                      : "border-xon-primary/50 text-xon-primary hover:border-xon-primary hover:bg-xon-primary/10"
                  )}
                  title="Add tag"
                >
                  <Plus className="h-2.5 w-2.5" />
                  <span>{t('conversations.profile.add_tag_btn', 'Add tag')}</span>
                </button>

                {isAddingTagActive && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                    "absolute top-full mt-1 w-56 bg-xon-surface-container rounded-xl shadow-xl border border-xon-surface-outline z-[99999] overflow-hidden",
                    isRTL ? "right-0" : "left-0"
                  )}>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-xon-text-secondary uppercase">Manage Tags</span>
                        {newTag.trim() && !exactMatch && (
                          <button
                            onClick={handleAddTag}
                            disabled={isAddingTag}
                            className="flex items-center gap-1 px-2 py-1 bg-xon-primary text-white rounded-lg text-xs font-bold hover:bg-xon-primary/90 transition-all disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add "{newTag}"</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                        placeholder="Search or type new tag..."
                        className="w-full bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg text-xs outline-none text-xon-text-primary px-2 py-1.5 focus:ring-1 focus:ring-xon-primary/30 transition-all"
                        disabled={isAddingTag}
                        autoFocus
                      />
                    </div>
                    <div className="border-t border-xon-surface-outline" />
                    <div className="max-h-48 overflow-y-auto">
                      {isLoadingAvailableTags ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-xon-text-secondary" />
                        </div>
                      ) : filteredTags.length > 0 ? (
                        <div className="p-2 space-y-1">
                          {filteredTags.map((tag) => {
                            const isAssigned = tags.some(t => t.id === tag.id);
                            return (
                              <div
                                key={tag.id}
                                onClick={() => isAssigned ? handleRemoveTagFromHeader(tag.id) : addTag({ contactId, tagId: tag.id })}
                                className={`flex items-center justify-between p-1 rounded-lg cursor-pointer transition-all ${isAssigned ? 'bg-xon-primary/5' : 'hover:bg-xon-surface-container-hover'}`}
                              >
                                <div
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-white text-xs font-semibold shadow-sm"
                                  style={{ backgroundColor: tag.color || '#3b82f6' }}
                                >
                                  <Tag className="h-3.5 w-3.5 fill-white/20" />
                                  <span>{tag.name}</span>
                                </div>
                                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all border ${isAssigned ? 'bg-xon-primary border-xon-primary' : 'bg-transparent border-xon-surface-outline'}`}>
                                  {isAssigned && <Check className="h-3 w-3 text-white stroke-[3]" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-6 px-4 text-center">
                          <p className="text-xs text-xon-text-secondary italic">
                            {newTag.trim() ? `No matches for "${newTag}"` : 'No existing tags found'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-xon-surface-container rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <X className="h-6 w-6 text-xon-text-secondary flex-shrink-0" />
              <h3 className="font-semibold text-lg text-xon-text-primary">
                Close conversation with {conversation.name}?
              </h3>
            </div>
            <p className="text-sm text-xon-text-secondary mb-6">
              Are you sure you want to close this conversation? You can still view it in the closed conversations list.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-xon-surface-hover transition-colors text-xon-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const conversationNumericId = Number(conversation?.numeric_id)
                  if (!Number.isFinite(conversationNumericId) || conversationNumericId <= 0) {
                    setShowCloseConfirm(false)
                    return
                  }
                  if (!isAssignedToMe) {
                    setShowCloseConfirm(false)
                    return
                  }
                  closeConversation(conversationNumericId)
                  setShowCloseConfirm(false)
                }}
                disabled={isClosing}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-xon-primary hover:opacity-90 transition-colors text-xon-primary-on disabled:opacity-50"
              >
                {isClosing ? 'Closing…' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
