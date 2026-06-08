import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  toggleNotesSidebar,
  openNotesSidebar,
  closeNotesSidebar,
  clearScrollToMessage,
  useUIContext,
} from "@/contexts/UIContext";
import { useAuthUser } from "@/contexts/AuthContext";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import EmptyConversation from "./EmptyConversation";
import MessageList from "./MessageList";
import MessageInfoSidebar from "./MessageInfoSidebar";
import SearchBar from "./SearchModal";
import ConversationNotes from "../conversations/ConversationNotes";
import { useMessageGroups } from "@/hooks/useMessageGroups";
import CallHistoryView from "@/components/calls/CallHistoryView";
import { Message } from "@/types/chat";
import CameraModal from "@/components/messages/camera/CameraModal";
import AttachmentComposerModal from "./attachments/AttachmentComposerModal";
import { useConversationItems } from "@/api/conversations/hooks";
import { conversationResponseToLocal } from "@/api/conversations/cacheUtils";
import { useBlockedContacts } from "@/api/contacts/hooks";
import { useQueryClient } from "@tanstack/react-query";
import ConversationMediaViewer from "./ConversationMediaViewer";
import VideoModal from "./video/VideoModal";
import { handleScroll } from "./hooks/HandleScroll";
import { useScrollManager } from "./hooks/useScrollManager";
import {
  useHandleSend,
  useHandleDelete,
  useHandleEdit,
} from "./hooks/HandleSend";
import { useDraft, getDraftKey } from "./hooks/useDraft";
import { useMessageThreadCalls } from "./hooks/useMessageThreadCalls";
import MessageSkeleton from "./MessageSkeleton";
import { Upload } from "lucide-react";
import { WhatsAppService } from "@/providers/whatsapp/WhatsAppService";
import { useConversationAuthorization } from "./hooks/useConversationAuthorization";
import { useReadReceiptManager } from "./hooks/useReadReceiptManager";
import { useMessagePagination } from "./hooks/useMessagePagination";
import { useAttachmentPicker } from "./hooks/useAttachmentPicker";
import PinnedMessagesBanner from "./PinnedMessagesBanner";
import ConversationStatusBar from "./ConversationStatusBar";
import { ConversationProvider } from "@/contexts/ConversationContext";

export default function MessageThread() {
  const { state: uiState, dispatch: uiDispatch } = useUIContext();

  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentConvId = searchParams.get("conversation");
  const currentCallId = searchParams.get("call");
  const currentInboxId = uiState.activeInboxId;
  const conversationItems = useConversationItems();

  const urlInboxId = (() => {
    const v = searchParams.get("inbox_id");
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : undefined;
  })();

  const foundConvResponse = conversationItems.find(
    (it) => it.conversation_uuid === currentConvId || String(it.id) === currentConvId,
  );
  const conv = foundConvResponse
    ? conversationResponseToLocal(foundConvResponse)
    : {
        // Temporary object while the conversation is being fetched from API
        id: currentConvId || "",
        numeric_id: currentConvId ? parseInt(currentConvId, 10) : undefined,
        name: "Loading...",
        avatar: undefined,
        unread_messages_count: 0,
        pinned: false,
        blocked: false,
        closed: false,
        inbox_id: urlInboxId || currentInboxId || undefined,
        contact_id: undefined,
        assigned_agent_id: undefined,
        last_message_id: undefined,
        lastMessage: undefined,
        conversation_type: undefined as any,
        phone: undefined,
        subject: undefined,
        user_ids: [],
        channel_id: undefined,
      };

  const isInfoOpen = uiState.messageInfo.isOpen;

  // Get current user data from context (server-verified on every app load).
  // Do NOT read from localStorage here — tampered values would flow into
  // sent_by_user_id and could cause 403s or render-loop cascades.
  const userData = useAuthUser();
  const toValidNumber = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const currentUserId = toValidNumber(
    userData?.id ?? (userData as any)?.user_id,
  );
  const maxConcurrentChats = userData?.max_concurrent_chats;
  const currentChatCount = userData?.current_chat_count;
  const parsedMaxConcurrentChats =
    maxConcurrentChats != null ? Number(maxConcurrentChats) : undefined;
  const parsedCurrentChatCount =
    currentChatCount != null ? Number(currentChatCount) : undefined;
  const hasReachedMaxChats =
    parsedMaxConcurrentChats != null &&
    !Number.isNaN(parsedMaxConcurrentChats) &&
    parsedCurrentChatCount != null &&
    !Number.isNaN(parsedCurrentChatCount) &&
    parsedCurrentChatCount >= parsedMaxConcurrentChats;
  const currentUserContactId = toValidNumber(
    userData?.contact_id ?? (userData as any)?.contact?.id,
  );
  const isAssignedToMe =
    currentUserId != null &&
    conv?.assigned_agent_id != null &&
    Number(conv.assigned_agent_id) === Number(currentUserId);

  // Authorization + IDOR guard
  const { authorizedConvId, storedInboxes } = useConversationAuthorization({
    urlConvParam: currentConvId,
    currentUserId,
    conversationItems,
    queryClient,
    setSearchParams,
  });

  const currentInbox = React.useMemo(() => {
    if (!conv?.inbox_id) return undefined;
    return storedInboxes.find((i) => Number(i.id) === Number(conv.inbox_id));
  }, [storedInboxes, conv?.inbox_id]);

  const { data: blockedContactsData } = useBlockedContacts();
  const isContactBlocked =
    conv?.blocked ||
    (conv?.contact_id != null &&
      (blockedContactsData?.contacts?.some(
        (c) => Number(c.id) === Number(conv.contact_id),
      ) ?? false));

  // Initialize WhatsApp Service with channel credentials when inbox is available
  useEffect(() => {
    const initializeWhatsAppService = async () => {
      if (currentInbox?.channel_id) {
        const channelId = Number(currentInbox.channel_id);
        if (channelId > 0) {
          try {
            console.log(
              `[MessageThread] Initializing WhatsAppService with channel ${channelId}`,
            );
            await WhatsAppService.initWithChannel(channelId);
            console.log(
              `[MessageThread] WhatsApp Service initialized for channel ${channelId}`,
            );
          } catch (error) {
            console.error(
              "[MessageThread] Failed to initialize WhatsAppService:",
              error,
            );
          }
        }
      }
    };
    initializeWhatsAppService();
  }, [currentInbox?.channel_id]);

  const isInternalConversation =
    (currentInbox?.channel_type || "").toLowerCase() === "internal" ||
    conv?.inbox_id == null ||
    conv?.conversation_type === "direct" ||
    conv?.conversation_type === "group";

  // Attachment picker (file input, drag-drop, composer modal)
  const {
    attachmentInputRef,
    attachmentAccept,
    onInputChange,
    composerOpen,
    composerFiles,
    composerPickerMode,
    closeComposer,
    isGlobalDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    openAttachmentPicker,
    handleIncomingFiles,
  } = useAttachmentPicker();

  // Pagination + local message state + incremental WS sync
  const {
    messages,
    setMessages,
    firstPage,
    isLoading,
    isFetchingMessages,
    isFetching,
    hasMore,
    skip,
    setSkip,
    setHasMore,
    setIsFetching,
    prevScrollTopRef,
    fetchMessagesPage,
    ensureMessageLoadedAndScroll,
    flashHighlight,
    clearHighlight,
    highlightedMessageId,
    pinnedMessages,
    lastMessageId,
  } = useMessagePagination({
    conv,
    currentConvId,
    authorizedConvId,
    currentUserContactId,
    currentUserId,
    onConversationLoad: closeComposer,
  });

  // Read receipts (side-effect only)
  useReadReceiptManager({
    conv,
    currentUserId,
    isAssignedToMe,
    isLoading,
    isFetchingMessages,
    firstPage,
    queryClient,
  });

  // Draft management
  const draftConversationKey = conv ? getDraftKey(conv) : undefined;
  const { drafts, currentDraftConversation, saveDraft, getDraft } =
    useDraft(draftConversationKey);

  const handleSend = useHandleSend();
  const handleDelete = useHandleDelete();
  const handleEdit = useHandleEdit();

  // Keep a ref in sync so callbacks below can read the latest messages
  // without depending on `messages` and invalidating context on every update.
  const messagesRef = React.useRef(messages);
  messagesRef.current = messages;

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const handleResend = React.useCallback((messageId: string | number) => {
    const failedMessage = messagesRef.current.find((msg) => msg.id === messageId);
    if (!failedMessage) {
      console.error("Failed message not found:", messageId);
      return;
    }

    const sendableMedia =
      failedMessage.media && failedMessage.media.type !== "link"
        ? {
            type: failedMessage.media.type as
              | "image"
              | "video"
              | "audio"
              | "file"
              | "location",
            url: failedMessage.media.url,
            name: failedMessage.media.name,
            blob: failedMessage.media.blob || new Blob(),
          }
        : undefined;

    handleSend({
      saveDraft,
      setReplyingTo,
      replyingTo: null,
      drafts,
      setMessages,
      isInternalConversation,
      isAssignedToMe,
      currentUserContactId: currentUserContactId || 0,
      currentUserId,
      conv,
      message: {
        text: failedMessage.text || "",
        media: sendableMedia,
        audio: failedMessage.audioBlob
          ? {
              blob: failedMessage.audioBlob,
              url: failedMessage.audioUrl || "",
            }
          : undefined,
        template: failedMessage.template,
        template_id: failedMessage.template_id,
      },
    });

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, [handleSend, saveDraft, setReplyingTo, drafts, setMessages, isInternalConversation, isAssignedToMe, currentUserContactId, currentUserId, conv]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isNotesOpen = uiState.notesSidebar.isOpen;

  const isWhatsApp =
    (currentInbox?.channel_type || "").toLowerCase() === "whatsapp";
  const lastInboundMessage = [...messages]
    .reverse()
    .find((m) => m.direction === "inbound");
  const lastOutboundTemplate = [...messages]
    .reverse()
    .find(
      (m) =>
        m.direction === "outbound" && m.message_type === "template_message",
    );

  const isWaitingForWhatsAppAcceptance = React.useMemo(() => {
    if (!isWhatsApp || !lastOutboundTemplate) return false;

    const parseTemplate = (text: string): { name?: string } | null => {
      if (!text || !text.trim().startsWith("{")) return null;
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    };

    const templateData =
      lastOutboundTemplate.template ||
      parseTemplate(lastOutboundTemplate.text || "");
    const templateName = templateData?.name || "";
    const isPermissionTemplate = templateName
      .toLowerCase()
      .includes("permission");
    if (!isPermissionTemplate) return false;

    const sortedMessages = [...messages].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    const lastMessage = sortedMessages[0];

    return (
      lastMessage?.id === lastOutboundTemplate.id &&
      (!lastInboundMessage ||
        new Date(lastInboundMessage.createdAt) <
          new Date(lastOutboundTemplate.createdAt))
    );
  }, [isWhatsApp, lastOutboundTemplate, lastInboundMessage, messages]);

  const handleReply = React.useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const { handleCall, handleVideoCall } = useMessageThreadCalls({
    conv,
    currentInbox,
    handleSend,
    saveDraft,
    setReplyingTo,
    drafts,
    setMessages,
    isInternalConversation,
    isAssignedToMe,
    currentUserContactId: currentUserContactId || 0,
    currentUserId,
  });

  const prevConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    const id = conv?.id || null;
    if (prevConversationIdRef.current && prevConversationIdRef.current !== id) {
      setReplyingTo(null);
    }
    prevConversationIdRef.current = id;
  }, [conv?.id]);

  const [searchQuery, setSearchQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [mediaViewerMessageId, setMediaViewerMessageId] = useState<
    number | null
  >(null);

  const openMediaViewer = React.useCallback((messageId: number) => {
    setMediaViewerMessageId(messageId);
    setIsMediaViewerOpen(true);
  }, []);

  const handleMediaViewerReply = React.useCallback(
    (messageId: number) => {
      const target = messages.find(
        (m) => typeof m.numericId === "number" && m.numericId === messageId,
      );
      if (target) {
        handleReply(target);
        setIsMediaViewerOpen(false);
        window.dispatchEvent(new CustomEvent("focus-message-input"));
      }
    },
    [handleReply, messages],
  );

  const mediaViewerReactionsByMessageId = React.useMemo(() => {
    const map: Record<
      number,
      Array<{ emoji: string; numericId?: number; isMine?: boolean }>
    > = {};
    for (const m of messages) {
      if (typeof m.numericId !== "number") continue;
      const rs = (m.reactions || []).map((r) => ({
        emoji: r.emoji,
        numericId: typeof r.numericId === "number" ? r.numericId : undefined,
        isMine: !!r.isMine,
      }));
      if (rs.length > 0) map[m.numericId] = rs;
    }
    return map;
  }, [messages]);

  const { onScroll: onScrollManager, scrollToBottom } = useScrollManager({
    listRef,
    conversationId: conv?.id,
    lastMessageId,
  });

  const scrollToMessageRequestId = uiState.scrollToMessage.requestId;
  const scrollToMessageId = uiState.scrollToMessage.messageId;

  React.useEffect(() => {
    if (!scrollToMessageId) return;
    const id = scrollToMessageId;
    uiDispatch(clearScrollToMessage());
    const timer = window.setTimeout(() => {
      const el = document.getElementById(`message-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        flashHighlight(id);
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [scrollToMessageRequestId]);

  const isAuthPending = authorizedConvId === null && (conv?.numeric_id || 0) > 0;
  const shouldShowMessagesSkeleton =
    isAuthPending || isLoading || (isFetchingMessages && messages.length === 0);

  // Add draft message to messages if there's a draft for a DIFFERENT conversation
  const messagesWithDraft =
    draftConversationKey &&
    currentDraftConversation &&
    currentDraftConversation !== draftConversationKey &&
    drafts[currentDraftConversation]?.trim()
      ? [
          ...messages,
          {
            id: `draft-${currentDraftConversation}`,
            text: drafts[currentDraftConversation],
            senderId: "contact",
            createdAt: "",
            isDraft: true,
          } as Message,
        ]
      : messages;

  // Deduplicate messages by ID and numericId to prevent double rendering
  const uniqueMessages = React.useMemo(() => {
    const idSeen = new Set<string>();
    const numericIdSeen = new Set<number>();

    return messagesWithDraft.filter((m) => {
      if (m.id && idSeen.has(m.id)) return false;
      if (m.numericId && numericIdSeen.has(m.numericId)) return false;
      if (m.id) idSeen.add(m.id);
      if (m.numericId) numericIdSeen.add(m.numericId);
      return true;
    });
  }, [messagesWithDraft]);

  const groupedMessages = useMessageGroups(uniqueMessages);

  const handleDeleteMsg = React.useCallback(
    (messageId: string, deleteForEveryone?: boolean) =>
      handleDelete({
        setMessages,
        messages: messagesRef.current,
        isAssignedToMe,
        isInternalConversation,
        conv,
        messageId,
        deleteForEveryone,
      }),
    [handleDelete, setMessages, isAssignedToMe, isInternalConversation, conv],
  );

  const handleEditMsg = React.useCallback(
    (messageId: string, newContent: string) =>
      handleEdit({
        setMessages,
        messages: messagesRef.current,
        isAssignedToMe,
        isInternalConversation,
        conv,
        messageId,
        newContent,
      }),
    [handleEdit, setMessages, isAssignedToMe, isInternalConversation, conv],
  );

  const conversationStaticValue = React.useMemo(() => ({
    conversationId: conv?.numeric_id,
    isInternalConversation,
    isAssignedToMe,
    canDelete:
      Boolean(conv) &&
      (Boolean(isAssignedToMe) || isInternalConversation) &&
      !isContactBlocked &&
      !conv?.closed,
    partnerName: conv?.name,
    channelType: currentInbox?.channel_type,
    currentUserAvatar: userData.avatar_url || undefined,
    otherUserAvatar: conv?.avatar,
    onReply: handleReply,
    onDelete: handleDeleteMsg,
    onEdit: handleEditMsg,
    onResend: handleResend,
    onCall: handleCall,
    onOpenMediaViewer: openMediaViewer,
  }), [
    conv?.numeric_id, conv?.name, conv?.avatar, conv?.closed,
    isInternalConversation, isAssignedToMe, isContactBlocked,
    currentInbox?.channel_type,
    userData.avatar_url,
    handleReply, handleDeleteMsg, handleEditMsg, handleResend, handleCall, openMediaViewer,
  ]);

  const conversationSearchValue = React.useMemo(() => ({ searchQuery }), [searchQuery]);

  if (!conv || !currentConvId) {
    return <EmptyConversation />;
  }

  return (
    <div
      className="h-full w-full flex overflow-hidden relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={attachmentInputRef}
        type="file"
        multiple
        className="hidden"
        accept={attachmentAccept}
        onChange={onInputChange}
      />

      {/* Global Drag Overlay */}
      {isGlobalDragging && (
        <div className="absolute inset-0 z-[1000] m-4 rounded-2xl flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-200">
          <div className="absolute inset-0 rounded-2xl bg-xon-surface-container/40 backdrop-blur-md border border-xon-surface-outline shadow-2xl" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-xon-blue/10 via-transparent to-xon-purple/10" />

          <div className="relative flex flex-col items-center justify-center px-6 py-8">
            <div className="bg-xon-surface-container/70 backdrop-blur-md p-6 rounded-full shadow-2xl border border-xon-surface-outline/60">
              <Upload className="w-14 h-14 text-xon-blue" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-xon-text-primary mt-6">
              Drop files to upload
            </h2>
            <p className="text-xon-text-secondary mt-2">
              Images, videos, or documents
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Chat Header */}
        <ChatHeader
          conversation={conv}
          onSearch={() => setIsSearchOpen(true)}
          onNotesToggle={() => uiDispatch(toggleNotesSidebar())}
          isNotesOpen={isNotesOpen}
          isInternalConversation={isInternalConversation}
          onCall={handleCall}
          onVideoCall={handleVideoCall}
        />

        {/* Search Bar - positioned under header */}
        <SearchBar
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
            clearHighlight();
            setSearchQuery("");
          }}
          messages={messages}
          onSelectMessage={(messageId, query) => {
            setSearchQuery(query);
            flashHighlight(messageId);
            document.getElementById(`message-${messageId}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />

        {/* Pinned Messages Banner */}
        <PinnedMessagesBanner
          pinnedMessages={pinnedMessages}
          conversationId={currentConvId}
          onNavigate={ensureMessageLoadedAndScroll}
        />

        {/* If there's a call show call history */}
        {currentCallId ? (
          <CallHistoryView />
        ) : cameraOpen ? (
          <CameraModal
            open={cameraOpen}
            inline
            onClose={() => setCameraOpen(false)}
            onSend={(msg) => {
              handleSend({
                saveDraft,
                setReplyingTo,
                replyingTo,
                drafts,
                setMessages,
                isInternalConversation,
                isAssignedToMe,
                currentUserContactId:
                  currentUserContactId !== undefined ? currentUserContactId : 0,
                currentUserId,
                conv,
                message: msg,
              });
              setCameraOpen(false);
            }}
          />
        ) : composerOpen ? (
          <AttachmentComposerModal
            open={composerOpen}
            inline
            initialFiles={composerFiles}
            pickerMode={composerPickerMode}
            onClose={() => {
              closeComposer();
            }}
            onSend={(msg) => {
              handleSend({
                saveDraft,
                setReplyingTo,
                replyingTo,
                drafts,
                setMessages,
                isInternalConversation,
                isAssignedToMe,
                currentUserContactId: currentUserContactId || 0,
                currentUserId,
                conv,
                message: msg,
              });
            }}
          />
        ) : shouldShowMessagesSkeleton ? (
          <MessageSkeleton />
        ) : videoOpen ? (
          <VideoModal
            open={videoOpen}
            inline
            onClose={() => setVideoOpen(false)}
            onSend={(msg) => {
              handleSend({
                saveDraft,
                setReplyingTo,
                replyingTo,
                drafts,
                setMessages,
                isInternalConversation,
                isAssignedToMe,
                currentUserContactId: currentUserContactId || 0,
                currentUserId,
                conv,
                message: msg,
              });
            }}
          />
        ) : (
          <ConversationProvider staticValue={conversationStaticValue} searchValue={conversationSearchValue}>
            <MessageList
              key={conv?.id}
              listRef={listRef}
              handleScrollUp={() =>
                handleScroll(
                  skip,
                  setIsFetching,
                  prevScrollTopRef,
                  listRef,
                  isFetching,
                  conv,
                  hasMore,
                  setMessages,
                  setSkip,
                  setHasMore,
                  fetchMessagesPage,
                  currentUserContactId,
                  currentUserId,
                  50,
                  messages,
                )
              }
              onScrollChange={onScrollManager}
              onScrollToBottom={scrollToBottom}
              isFetchingOlderMessages={isFetching}
              hasMore={hasMore}
              groupedMessages={groupedMessages}
              highlightedMessageId={highlightedMessageId}
              replyingToMessageId={replyingTo?.id ?? null}
            />

            <ConversationMediaViewer
              conversationId={conv?.numeric_id || 0}
              open={isMediaViewerOpen}
              onOpenChange={setIsMediaViewerOpen}
              initialMessageId={mediaViewerMessageId}
              onReply={handleMediaViewerReply}
              reactionsByMessageId={mediaViewerReactionsByMessageId}
            />

            {!isContactBlocked &&
              !conv.closed &&
              (isInternalConversation ||
                isAssignedToMe ||
                conv.inbox_id == null) && (
                <MessageInput
                  onSend={(message) => {
                    handleSend({
                      saveDraft,
                      setReplyingTo,
                      replyingTo,
                      drafts,
                      setMessages,
                      isInternalConversation,
                      isAssignedToMe,
                      currentUserContactId:
                        currentUserContactId !== undefined
                          ? currentUserContactId
                          : 0,
                      currentUserId,
                      conv,
                      message,
                    });
                    setReplyingTo(null);
                  }}
                  replyingTo={replyingTo}
                  onClearReply={() => setReplyingTo(null)}
                  partnerName={conv?.name?.split(" ")[0] || "user"}
                  isInternalConversation={isInternalConversation}
                  inboxId={conv?.inbox_id}
                  conversationType={conv?.conversation_type}
                  participantUserIds={conv?.user_ids}
                  currentUserId={currentUserId}
                  openCamera={() => setCameraOpen(true)}
                  openDoc={() => openAttachmentPicker("*/*", "document")}
                  openPhoto={() =>
                    openAttachmentPicker("image/png,video/mp4", "media")
                  }
                  openVideo={() => setVideoOpen(true)}
                  onPasteFiles={(files) => handleIncomingFiles(files)}
                  conversationId={draftConversationKey}
                  onSaveDraft={saveDraft}
                  initialText={
                    draftConversationKey ? getDraft(draftConversationKey) : ""
                  }
                  disabled={!!isWaitingForWhatsAppAcceptance}
                />
              )}

            <ConversationStatusBar
              conv={conv}
              isAssignedToMe={isAssignedToMe}
              isContactBlocked={isContactBlocked}
              isInternalConversation={isInternalConversation}
              isWaitingForWhatsAppAcceptance={isWaitingForWhatsAppAcceptance}
              hasReachedMaxChats={hasReachedMaxChats}
              currentUserId={currentUserId}
              userData={userData}
            />
          </ConversationProvider>
        )}
      </div>

      {/* Info Sidebar */}
      <div
        className={`w-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out ${
          isInfoOpen
            ? `w-full fixed inset-0 z-[100] xl:relative xl:inset-auto xl:z-auto xl:border-l xl:border-border xl:opacity-100 ${
                isInfoOpen && isNotesOpen
                  ? "xl:w-[300px] 2xl:w-[320px]"
                  : "xl:w-[300px] 2xl:w-[350px]"
              }`
            : "xl:w-0 xl:opacity-0 xl:border-l-0"
        }`}
      >
        <MessageInfoSidebar className="h-full w-full" />
      </div>

      {/* Notes Sidebar */}
      <div
        className={`w-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out ${
          isNotesOpen
            ? `w-full fixed inset-0 z-[100] xl:relative xl:inset-auto xl:z-auto xl:border-l xl:border-xon-surface-outline xl:opacity-100 ${
                isInfoOpen && isNotesOpen
                  ? "xl:w-[300px] 2xl:w-[320px]"
                  : "xl:w-[300px] 2xl:w-[350px]"
              }`
            : "xl:w-0 xl:opacity-0 xl:border-l-0"
        }`}
      >
        <ConversationNotes
          conversationId={conv?.numeric_id || 0}
          inboxId={
            typeof conv?.inbox_id === "number" ? conv.inbox_id : undefined
          }
          conversationType={conv?.conversation_type}
          participantUserIds={conv?.user_ids}
          canAddNotes={isAssignedToMe || isInternalConversation}
          canDeleteNotes={isAssignedToMe || isInternalConversation}
          canEditNotes={isAssignedToMe}
          className="h-full"
          isNotesOpen={isNotesOpen}
          setIsNotesOpen={(open: boolean) =>
            uiDispatch(open ? openNotesSidebar() : closeNotesSidebar())
          }
          isOpen={isNotesOpen}
        />
      </div>
    </div>
  );
}
