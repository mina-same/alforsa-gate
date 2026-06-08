import React, { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Search, MessageCirclePlus, User, Phone, Mail, MapPin, Tag, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInfiniteContacts } from "@/api/contacts/hooks"
import { useUserInboxes } from "@/api/users/hooks"
import { ContactResponse } from "@/api/contacts/types"
import { useAuthUser } from "@/contexts/AuthContext"
import { useUIState } from "@/contexts/UIContext"
import StartWhatsAppChatModal from "./StartWhatsAppChatModal"
import Avatar from "@/components/shared/Avatar"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { conversationsAPI } from "@/api/conversations/endpoints"
import NoUsersSvg from "@/assets/empty-states/NoUsersSvg"

interface ContactWithConversation extends ContactResponse {
  conversationId?: number
  hasConversation: boolean
}

export default function ContactsList() {
  const uiState = useUIState()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation("chat")
  const isRTL = i18n.dir() === "rtl"
  const isMobile = useIsMobile()

  const activeInboxId = uiState.activeInboxId
  const currentConversationId = searchParams.get('conversation')

  const [searchQuery, setSearchQuery] = useState("")
  const [isNewWhatsAppChatModalOpen, setIsNewWhatsAppChatModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactResponse | null>(null)
  const [contactsWithConversations, setContactsWithConversations] = useState<ContactWithConversation[]>([])

  const [debouncedSearch, setDebouncedSearch] = useState("")

  const currentUserId = useAuthUser().id;

  const { data: userInboxes } = useUserInboxes(currentUserId);
  const inboxes = userInboxes?.items || [];
  const activeInbox = inboxes.find((i: any) => i.id === Number(activeInboxId));
  const channelId = activeInbox?.channel_id;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteContacts({
    limit: 20,
    search: debouncedSearch || undefined,
  })

  const contacts = useMemo(
    () => data?.pages.flatMap((p) => p.contacts) ?? [],
    [data]
  )
  const totalContacts = data?.pages[0]?.total ?? 0

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.unobserve(el)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Check which contacts have conversations
  const checkConversations = useCallback(async () => {
    if (!contacts || contacts.length === 0 || !activeInboxId) return

    try {
      const conversations = await conversationsAPI.listConversations({
        inbox_id: activeInboxId,
        limit: 100,
      })

      const conversationList = conversations.items || [];
      const contactsWithConv = contacts.map(contact => {
        const conversation = conversationList.find(
          (conv: any) => conv.contact_id === contact.id || conv.contact?.id === contact.id
        )
        return {
          ...contact,
          conversationId: conversation?.id,
          hasConversation: !!conversation,
        }
      })

      setContactsWithConversations(contactsWithConv)
    } catch (error) {
      console.error("Error checking conversations:", error)
      setContactsWithConversations(contacts.map(c => ({ ...c, hasConversation: false })))
    }
  }, [contacts, activeInboxId])

  // Check conversations when contacts or inbox changes
  React.useEffect(() => {
    checkConversations()
  }, [checkConversations])

  const filteredContacts = useMemo(() => {
    if (!contactsWithConversations.length) return []

    if (!searchQuery.trim()) return contactsWithConversations

    const query = searchQuery.toLowerCase()
    return contactsWithConversations.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(query) ||
        contact.phone?.includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.location?.toLowerCase().includes(query) ||
        contact.country_code?.includes(query)
    )
  }, [contactsWithConversations, searchQuery])

  const handleContactClick = async (contact: ContactWithConversation) => {
    if (contact.hasConversation && contact.conversationId) {
      // Open existing conversation
      const conversationId = String(contact.conversationId)
      const params = new URLSearchParams(window.location.search)
      params.set("conversation", conversationId)
      if (activeInboxId) params.set("inbox_id", String(activeInboxId))
      navigate(`/?${params.toString()}`)
    } else {
      // Show start new conversation modal
      setSelectedContact(contact)
      setIsNewWhatsAppChatModalOpen(true)
    }
  }

  const handleStartNewChat = (contact: ContactResponse) => {
    setSelectedContact(contact)
    setIsNewWhatsAppChatModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-xon-surface-container">
        {/* Header Skeleton */}
        <div className="border-b border-xon-surface-outline space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-xon-surface-container-hover animate-pulse rounded" />
            <div className="h-5 w-24 bg-xon-surface-container-hover animate-pulse rounded" />
            <div className="h-5 w-8 bg-xon-surface-container-hover animate-pulse rounded-full ml-auto" />
          </div>
          <div className="h-9 w-full bg-xon-surface-container-hover animate-pulse rounded" />
          <div className="h-10 w-full bg-xon-surface-container-hover animate-pulse rounded" />
        </div>

        {/* List Skeleton */}
        <div className="flex-1 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-xon-surface-container-hover animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-xon-surface-container-hover animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-xon-surface-container-hover animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-xon-surface-container">
      {/* Header with New Chat Button */}
      <div className="pb-2 px-4 border-b border-xon-surface-outline space-y-3">
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <User className="h-5 w-5 text-xon-primary" />
          <h2 className={cn("text-lg font-bold text-xon-text-primary", isRTL && "text-right")}>
            {t("contacts.title", "Contacts")}
          </h2>
          <span className={cn("text-xs font-semibold bg-xon-primary/10 text-xon-primary px-2 py-1 rounded-full", isRTL ? "ml-auto" : "mr-auto")}>
            {totalContacts}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className={cn("absolute top-2.5 h-4 w-4 text-xon-text-secondary", isRTL ? "right-3" : "left-3")} />
          <Input
            placeholder={t("contacts.search_placeholder", "Search contacts...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("bg-xon-surface border-xon-surface-outline focus:ring-xon-primary", isRTL ? "pr-9" : "pl-9")}
          />
        </div>

        {/* New WhatsApp Chat Button */}
        {/* {activeInboxId && (
          <Button
            onClick={() => {
              setSelectedContact(null)
              setIsNewWhatsAppChatModalOpen(true)
            }}
            className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            size="lg"
          >
            <MessageCirclePlus className="h-5 w-5" />
            <span className="font-semibold">{t("conversations.new_whatsapp_chat")}</span>
          </Button>
        )} */}
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <div className="pb-2">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
              <NoUsersSvg />
              <p className="text-base font-semibold text-xon-text-primary">
                {searchQuery ? t("contacts.no_results", "No contacts found") : t("contacts.empty", "No contacts yet")}
              </p>
              <p className="text-xs text-xon-text-secondary max-w-[250px]">
                {searchQuery
                  ? t("contacts.try_different_search", "Try a different search term")
                  : t("contacts.add_first", "Add your first contact to start messaging")}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactClick(contact)}
                  dir={isRTL ? "rtl" : "ltr"}
                  className={cn(
                    "w-full flex items-start gap-4 py-3 pr-3 relative transition-all duration-200 border-b border-xon-surface-outline/30 group cursor-pointer",
                    contact.conversationId && currentConversationId === String(contact.conversationId)
                      ? "bg-xon-surface-container-hover pl-5 border-s-4 border-s-xon-primary"
                      : "bg-transparent hover:bg-xon-surface-hover pl-3 hover:pl-5 hover:border-s-2 hover:border-s-xon-primary"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <Avatar
                      src={contact.avatar_url}
                      name={contact.name}
                      size="md"
                    />
                    {/* Conversation indicator */}
                    {contact.hasConversation && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-xon-primary border-2 border-xon-surface-container" />
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={cn("font-semibold text-sm text-xon-text-primary truncate", isRTL && "text-right")}>
                        {contact.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {contact.hasConversation ? (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-xon-primary bg-xon-container-blue px-1.5 py-0.5 rounded">
                            <MessageSquare className="h-3 w-3" />
                            {t("contacts.has_chat", "Chat")}
                          </span>
                        ) : (
                          <span className="text-[10px] text-xon-text-secondary bg-xon-surface px-1.5 py-0.5 rounded">
                            {t("contacts.no_chat", "No chat")}
                          </span>
                        )}
                        {contact.is_blocked && (
                          <span className="text-[10px] font-bold uppercase bg-xon-red/10 text-xon-red px-1.5 py-0.5 rounded">
                            {t("contacts.blocked", "Blocked")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-xon-text-secondary">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate dir-ltr">
                          {contact.country_code && !contact.phone.startsWith('+') 
                            ? `+${contact.country_code} ${contact.phone}` 
                            : contact.phone}
                        </span>
                      </div>
                    )}

                    {/* Email */}
                    {contact.email && (
                      <div className="flex items-center gap-1.5 text-xs text-xon-text-secondary">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}

                    {/* Location */}
                    {contact.location && (
                      <div className="flex items-center gap-1.5 text-xs text-xon-text-secondary">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{contact.location}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {contact.tags && Array.isArray(contact.tags) && contact.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mt-1">
                        <Tag className="h-3 w-3 text-xon-text-secondary" />
                        {contact.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-xon-surface-container px-1.5 py-0.5 rounded text-xon-text-secondary"
                          >
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="text-[10px] text-xon-text-secondary">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Start Chat Button for contacts without conversation */}
                  {!contact.hasConversation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartNewChat(contact)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 px-2"
                    >
                      <MessageCirclePlus className="h-4 w-4 text-xon-primary" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sentinel triggers next page load when scrolled into view */}
        <div ref={sentinelRef} className="h-2" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-xon-primary" />
          </div>
        )}
      </div>

      {/* WhatsApp Chat Modal */}
      {isNewWhatsAppChatModalOpen && activeInboxId && (
        <StartWhatsAppChatModal
          open={isNewWhatsAppChatModalOpen}
          onOpenChange={setIsNewWhatsAppChatModalOpen}
          inboxId={Number(activeInboxId)}
          channelId={channelId}
          selectedContact={selectedContact}
        />
      )}
    </div>
  )
}
