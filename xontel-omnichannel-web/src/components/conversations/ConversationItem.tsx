import { memo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateConversationInCache } from "@/api/conversations/cacheUtils";
import { useAuthUser } from "@/contexts/AuthContext";
import ReactDOM from "react-dom";
import { useUIDispatch, openProfilePanel } from "@/contexts/UIContext";
import Avatar from "@components/shared/Avatar";
import GroupAvatarGrid from "@components/shared/GroupAvatarGrid";
import { useUsersByIds, useUser } from "@/api/users/hooks";
import { useTranslation } from "react-i18next";
import { Conversation } from "@/types/chat";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MoreVertical,
  User,
  Archive,
  Ban,
  Pin,
  ArchiveRestore,
  PinOff,
  Check,
  AlertCircle,
  DoorClosedIcon,
  DoorClosed,
  ClosedCaption,
  X,
  Image as ImageIcon,
  FileText,
  Video as VideoIcon,
  Mic,
  MapPin,
  Link2,
  Layout,
  MousePointerClick,
  SmilePlus,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Users,
  Mail,
  Globe,
  Lock,
  Reply,
  MessageSquare,
  MessageCircle as MessengerIcon,
} from "lucide-react";
import { useIsMobile } from "@hooks/use-mobile";
import { useDirectMessageOtherUser } from "@/hooks/useDirectMessageOtherUser";
import {
  useCloseConversation,
  usePinConversation,
  useUnpinConversation,
  useUnassignConversation,
} from "@/api/conversations/hooks";
import {
  useBlockContact,
  useUnblockContact,
  useUpdateCustomFields,
  useBlockedContacts,
} from "@/api/contacts/hooks";
import type { ContactTags } from "@/api/tags/types";
import { useMessage } from "@/api/messages/hooks";
import { useDateFormat } from "@/hooks/useDateFormat";
import MessageStatus from "../messages/MessageStatus";
import { getDraftKey } from "../messages/hooks/useDraft";
import AgentAvatarPopup from "./AgentAvatarPopup";

export default memo(function ConversationItem({
  conversation,
  availableTags = [],
}: {
  conversation: Conversation;
  availableTags?: ContactTags[];
}) {
  const queryClient = useQueryClient();
  const uiDispatch = useUIDispatch();
  const { i18n, t } = useTranslation("chat");
  const isRTL = i18n.dir() === "rtl";
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedInboxes = (() => {
    try {
      const raw = localStorage.getItem("userInboxes");
      if (!raw) return [];
      const data = JSON.parse(raw) as { items?: any[] } | any[];
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.items)) return data.items;
      return [];
    } catch {
      return [];
    }
  })();
  const currentInbox = (() => {
    if (!conversation?.inbox_id) return undefined;
    return storedInboxes.find(
      (i) => Number(i.id) === Number(conversation.inbox_id),
    );
  })();
  const isInternalConversation =
    (currentInbox?.channel_type || "").toLowerCase() === "internal";
  const authUser = useAuthUser();
  const currentUserId = Number(authUser?.id) || 0;
  const currentConversationId = searchParams.get('conversation');
  const isActive =
    conversation.id === currentConversationId ||
    String(conversation.numeric_id) === currentConversationId;
  const isAssignedToMe =
    currentUserId > 0 &&
    conversation?.assigned_agent_id != null &&
    Number(conversation.assigned_agent_id) === currentUserId;

  const currentUserContactId = authUser?.contact_id as number | undefined;

  // Get other user data for direct messages
  const isDirect = conversation?.conversation_type === "direct";
  const isGroup = conversation?.conversation_type === "group";

  const { name: dmOtherUserName, avatar: dmOtherUserAvatar, otherUser: dmOtherUser } =
    useDirectMessageOtherUser(
      isDirect ? conversation : null,
      isDirect ? currentUserId : undefined,
    );

  const displayName = isDirect
    ? dmOtherUserName || conversation.contact_name
    : isGroup
      ? conversation.subject
      : conversation.contact_name;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ignoreNextOutsideCloseRef = useRef(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [draftPreview, setDraftPreview] = useState("");
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: blockContact, isPending: isBlocking } = useBlockContact();
  const { mutate: unblockContact, isPending: isUnblocking } = useUnblockContact();
  const { mutate: unassignConversation } = useUnassignConversation();
  const { mutate: updateCustomFields } = useUpdateCustomFields();
  const { mutate: closeConversation, isPending: isClosing } =
    useCloseConversation();
  const { mutate: pinConversationMutation } = usePinConversation();
  const { mutate: unpinConversationMutation } = useUnpinConversation();
  const { formatMessageRelativeTime } = useDateFormat();
  const { data: assignedAgent } = useUser(conversation.assigned_agent_id || 0);

  const { data: blockedContactsData } = useBlockedContacts();
  const isContactBlocked =
    conversation.blocked ||
    (conversation.contact_id != null &&
      (blockedContactsData?.contacts?.some(
        (c) => Number(c.id) === Number(conversation.contact_id),
      ) ?? false));

  const statusDotClass = isDirect ? (() => {
    switch (dmOtherUser?.agent_status) {
      case "offline": return "bg-gray-400";
      case "away":    return "bg-yellow-400";
      case "busy":    return "bg-red-500";
      default:        return dmOtherUser ? "bg-green-500" : null;
    }
  })() : null;

  // Use conversation avatar directly
  const displayAvatar = isDirect
    ? dmOtherUserAvatar ||
      conversation.contact_avatar_url ||
      conversation.avatar
    : conversation.contact_avatar_url || conversation.avatar;

  // Determine channel info
  const channelInfo = (() => {
    const type = (currentInbox?.channel_type || "custom").toLowerCase();
    const inboxName =
      currentInbox?.name || (isInternalConversation ? "Internal" : "Web");

    const icons: Record<string, { icon: any; color: string; label: string }> = {
      whatsapp: { icon: MessageSquare, color: "#25D366", label: "WhatsApp" },
      facebook: { icon: MessengerIcon, color: "#0084FF", label: "Facebook" },
      messenger: { icon: MessengerIcon, color: "#0084FF", label: "Facebook" },
      email: { icon: Mail, color: "#EA4335", label: "Email" },
      internal: { icon: Lock, color: "#6B7280", label: "Internal" },
    };

    const info = icons[type] || { icon: Globe, color: "#6B7280", label: "Web" };
    return { ...info, inboxName };
  })();

  // Fetch full message details when active (for richer preview) or when the list
  // API didn't embed last_message (internal DM/group conversations).
  const needsMessageFetch = !conversation.lastMessage && !!conversation.last_message_id;
  const { data: lastMessageDetails } = useMessage(
    isActive || needsMessageFetch ? (conversation.last_message_id || 0) : 0,
  );

  const rawLastMsgSenderId =
    lastMessageDetails?.sent_by_user_id ||
    (conversation.lastMessage as any)?.sent_by_user_id ||
    0;
  const { data: lastMsgSenderUser } = useUser(
    isGroup && rawLastMsgSenderId && rawLastMsgSenderId !== currentUserId
      ? rawLastMsgSenderId
      : 0,
  );

  const lastMsgSentByMe =
    conversation.lastMessage?.senderId === "me" ||
    lastMessageDetails?.direction === "outbound" ||
    (lastMessageDetails?.sent_by_user_id != null &&
      Number(lastMessageDetails.sent_by_user_id) === currentUserId) ||
    (["user", "agent"].includes(
      (lastMessageDetails?.sender_type || "").toLowerCase(),
    ) &&
      lastMessageDetails?.sender_id != null &&
      Number(lastMessageDetails.sender_id) === currentUserId);

  const displayMessage = (() => {
    const local = conversation.lastMessage;
    const localTime = local?.createdAt
      ? new Date(local.createdAt).getTime()
      : 0;
    const fetchedTime = lastMessageDetails?.created_at
      ? new Date(lastMessageDetails.created_at).getTime()
      : 0;

    const hasPreviewableContent = (m: any) => {
      if (!m) return false;
      const text = (typeof m.text === "string" ? m.text : undefined) as
        | string
        | undefined;
      const content = (
        typeof m.content === "string"
          ? m.content
          : typeof m.text === "string"
            ? m.text
            : undefined
      ) as string | undefined;

      if (text?.trim()) return true;
      if (content?.trim()) return true;
      if (m.media || m.media_url || m.message_type || m.media_type) return true;
      if (m.location) return true;
      if (m.template) return true;
      if (m.audioUrl) return true;
      return false;
    };

    if (local && hasPreviewableContent(local) && localTime >= fetchedTime) {
      return local;
    }
    return lastMessageDetails || local;
  })();

  const replyToId =
    (displayMessage as any)?.reply_to_message_id ||
    (isActive ? (displayMessage as any)?.replyTo?.numericId : undefined);
  const { data: repliedMessageDetails } = useMessage(replyToId || 0);

  // Helper function to get message content with types and status
  const getMessageContent = (msg: typeof displayMessage) => {
    if (!msg) {
      return (
        <span className="flex items-center gap-1.5 opacity-50 animate-pulse">
          <span className="h-2 w-24 bg-xon-text-secondary/20 rounded-full" />
        </span>
      );
    }

    const rawContent = (() => {
      const base = (
        typeof (msg as any).content === "string"
          ? (msg as any).content
          : typeof (msg as any).text === "string"
            ? (msg as any).text
            : ""
      ) as string;
      const attrs = (msg as any).additional_attributes;
      if (attrs) {
        const parsed = typeof attrs === "string"
          ? (() => { try { return JSON.parse(attrs); } catch { return {}; } })()
          : attrs;
        if (parsed?.isEdited && parsed?.editedMessage) return String(parsed.editedMessage);
      }
      return base;
    })();

    const getPreview = (): {
      text: string;
      Icon?: React.ComponentType<{ className?: string }>;
      hidePrefix?: boolean;
      iconClass?: string;
    } | null => {
      const looksLikeMapsUrl = (url: string | undefined) => {
        if (!url) return false;
        const s = String(url);
        if (!/^https?:\/\//i.test(s)) return false;
        try {
          const u = new URL(s);
          const host = u.hostname.toLowerCase();
          const path = u.pathname.toLowerCase();
          if (host.includes("maps.google.")) return true;
          if (host === "maps.app.goo.gl") return true;
          if (host === "goo.gl" && path.startsWith("/maps")) return true;
          if (host.endsWith("google.com") && path.startsWith("/maps"))
            return true;
          return false;
        } catch {
          return /maps\.google\.|google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(
            s,
          );
        }
      };

      const isLocationLikeFromText = (text: string | undefined) =>
        looksLikeMapsUrl(text);

      if ("location" in msg && (msg as any).location) {
        return { text: t("message_preview.location"), Icon: MapPin };
      }

      const mediaType = (msg as any).media_type || (msg as any).media?.type;
      const mediaName = (msg as any).media_name || (msg as any).media?.name;
      const type = (msg as any).message_type || mediaType;

      if (type === "image")
        return {
          text: mediaName
            ? `${t("message_preview.photo")} (${mediaName})`
            : t("message_preview.photo"),
          Icon: ImageIcon,
        };
      if (type === "video")
        return {
          text: mediaName
            ? `${t("message_preview.video")} (${mediaName})`
            : t("message_preview.video"),
          Icon: VideoIcon,
        };
      if (type === "audio" || (msg as any).audioUrl)
        return {
          text: mediaName
            ? `${t("message_preview.audio")} (${mediaName})`
            : t("message_preview.audio"),
          Icon: Mic,
        };
      if (type === "document" || type === "file" || type === "application") {
        return {
          text: mediaName
            ? `${t("message_preview.document")} (${mediaName})`
            : t("message_preview.document"),
          Icon: FileText,
        };
      }
      if (type === "location")
        return { text: t("message_preview.location"), Icon: MapPin };

      if (type === "template_message" || (msg as any).template) {
        return { text: t("message_preview.template_message"), Icon: Layout };
      }

      if (type === "reaction") {
        const emoji =
          (msg as any).content ||
          (msg as any).text?.split(" ")[1] ||
          (msg as any).text ||
          "";
        let repliedText = (msg as any).replyTo?.text || "";
        if (
          (!repliedText || repliedText === "message") &&
          repliedMessageDetails?.content
        ) {
          repliedText = repliedMessageDetails.content;
        }
        const truncatedText =
          repliedText.length > 20
            ? repliedText.substring(0, 20).trim() + "..."
            : repliedText;
        return {
          text: `${t("message_preview.reacted")} ${emoji}${repliedText && repliedText !== "message" ? ` ${t("message_preview.to")} "${truncatedText}"` : ` ${t("message_preview.to")} ${t("conversations.profile.media_message")}`}`,
          Icon: SmilePlus,
        };
      }

      const replyToId =
        (msg as any).reply_to_message_id || (msg as any).replyTo?.numericId;
      if (replyToId && type !== "reaction") {
        let repliedText = (msg as any).replyTo?.text || "";
        if (
          (!repliedText || repliedText === "message") &&
          repliedMessageDetails?.content
        ) {
          repliedText = repliedMessageDetails.content;
        }
        const truncatedText =
          repliedText.length > 15
            ? repliedText.substring(0, 15).trim() + "..."
            : repliedText;
        return {
          text: `${t("message_preview.replied_to")} "${truncatedText}": ${rawContent}`,
          Icon: Reply,
        };
      }

      if (type === "calls") {
        const rawAttrs =
          (msg as any).additional_attributes || (msg as any).attributes;
        let attributes: any = {};
        try {
          attributes =
            typeof rawAttrs === "string"
              ? JSON.parse(rawAttrs)
              : rawAttrs || {};
        } catch {}
        const isVideo = attributes.type === "video" || attributes.is_video;
        const status = attributes.status || attributes.event;
        const sentByMe = (msg as any).direction === "outbound";

        if (status === "missed" && !sentByMe) {
          return {
            text: isVideo
              ? t("message_preview.missed_video_call")
              : t("message_preview.missed_voice_call"),
            Icon: PhoneMissed,
            iconClass: "text-red-500",
            hidePrefix: true,
          };
        }
        return {
          text: isVideo
            ? t("message_preview.video_call")
            : t("message_preview.voice_call"),
          Icon: isVideo ? VideoIcon : sentByMe ? PhoneOutgoing : PhoneIncoming,
        };
      }

      if (isLocationLikeFromText(rawContent))
        return { text: t("message_preview.location"), Icon: MapPin };

      return null;
    };

    const preview = getPreview();
    const contentNode = preview ? (
      <span className="truncate flex items-center gap-1">
        {preview.Icon ? (
          <preview.Icon
            className={`h-3.5 w-3.5 flex-shrink-0 ${preview.iconClass || ""}`}
          />
        ) : null}
        <span className="truncate">{preview.text}</span>
      </span>
    ) : (
      <span className="truncate">{rawContent}</span>
    );

    let senderName = "";
    let senderColorClass = "";
    const senderId = (msg as any).senderId;
    const sentByUserId = (msg as any).sent_by_user_id;
    const msgSenderName = (msg as any).senderName as string | undefined;

    if (senderId === "me" || sentByUserId === currentUserId) {
      senderName = t("message_preview.you");
      senderColorClass = "text-xon-primary";
    } else if (isGroup && (lastMsgSenderUser?.full_name || msgSenderName)) {
      senderName = lastMsgSenderUser?.full_name || msgSenderName || "";
      senderColorClass = "text-xon-accent";
    } else if (
      senderId === "agent" ||
      (sentByUserId && (msg as any).sent_by_contact_id == null)
    ) {
      senderName = t("message_preview.agent");
      senderColorClass = "text-xon-text-secondary";
    } else {
      senderName = displayName || t("message_preview.contact");
      senderColorClass = "text-xon-accent";
    }

    if (preview?.hidePrefix) return contentNode;

    return (
      <span className={`flex items-center gap-1 flex-row`}>
        <span className={`${senderColorClass} font-medium whitespace-nowrap`}>
          {senderName}
          {isRTL ? " :" : ": "}
        </span>
        {contentNode}
      </span>
    );
  };

  const getMessageTimestamp = (msg: any) => {
    if (!msg) return undefined;
    return msg.created_at || msg.createdAt;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ignoreNextOutsideCloseRef.current) return;
      const target = event.target as Element;
      const isOutsideMenuButton =
        menuRef.current && !menuRef.current.contains(target);
      const isOutsideDropdown = !target.closest(".conversation-dropdown-menu");
      if (isMenuOpen && isOutsideMenuButton && isOutsideDropdown) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleMenuItemClick = () => setIsMenuOpen(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: buttonRect.bottom + 8,
      left: buttonRect.right - 180,
    });
    setIsMenuOpen(true);
  };

  useEffect(() => {
    const readDraft = () => {
      try {
        const savedDrafts = localStorage.getItem("messageDrafts");
        const drafts = savedDrafts ? JSON.parse(savedDrafts) : {};
        setDraftPreview(drafts[getDraftKey(conversation)] || "");
      } catch {}
    };
    readDraft();
    window.addEventListener("messageDraftsUpdated", readDraft);
    window.addEventListener("storage", readDraft);
    return () => {
      window.removeEventListener("messageDraftsUpdated", readDraft);
      window.removeEventListener("storage", readDraft);
    };
  }, [conversation.id, conversation.numeric_id]);

  const hasDraft = !isActive && Boolean(draftPreview.trim());
  const sentByMe =
    displayMessage &&
    ((displayMessage as any).direction === "outbound" ||
      (displayMessage as any).senderId === "me" ||
      (displayMessage as any).sent_by_user_id === currentUserId);

  // Fetch group member data for group conversations
  const { data: groupUsers } = useUsersByIds(
    isGroup && conversation.user_ids ? conversation.user_ids.slice(0, 9) : [],
  );

  // Build avatar arrays for group grid
  const groupAvatars = groupUsers?.map((u) => u.avatar_url) || [];
  const groupNames = groupUsers?.map((u) => u.full_name) || [];

  return (
    <div
      onContextMenu={handleContextMenu}
      className={`w-full text-start flex flex-col gap-1 py-3 relative transition-all duration-200 border-b border-xon-surface-outline/30 group ${
        isActive
          ? "bg-xon-surface-container-hover pl-5 pr-3 border-s-4 border-b border-b-xon-primary border-s-xon-primary"
          : "bg-transparent hover:bg-xon-surface-hover hover:pl-5 hover:pr-3 hover:border-s-2 hover:border-s-xon-primary pl-3 pr-3"
      }`}
    >
      <div className="flex items-start justify-between gap-1 w-full">
        <button
          onClick={() => {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(
              "conversation",
              String(conversation.numeric_id || conversation.id),
            );
            if (conversation.inbox_id)
              newParams.set("inbox_id", String(conversation.inbox_id));
            setSearchParams(newParams);
          }}
          className="flex-1 flex items-start gap-4 min-w-0"
        >
          <div className="relative flex-shrink-0">
            {isGroup &&
            conversation.user_ids &&
            conversation.user_ids.length > 0 ? (
              <GroupAvatarGrid
                avatars={groupAvatars}
                names={groupNames}
                size={40}
                maxDisplay={9}
              />
            ) : (
              <Avatar src={displayAvatar} name={displayName} size="md" />
            )}
            {statusDotClass && (
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-xon-surface-container ${statusDotClass}`}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`font-bold text-sm truncate text-xon-text-primary`}
                >
                  {displayName}
                </span>
                {conversation.pinned && (
                  <Pin className="h-3 w-3 text-xon-primary flex-shrink-0" />
                )}
              </div>
              <div className="text-[11px] text-xon-text-secondary whitespace-nowrap ml-2 tabular-nums">
                {formatMessageRelativeTime(getMessageTimestamp(displayMessage))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {sentByMe && !hasDraft && (
                  <MessageStatus
                    status={(displayMessage as any)?.status || ""}
                    time=""
                    isSender={true}
                    displayStatus={true}
                    className="flex-shrink-0 m-0"
                  />
                )}

                <div
                  className={`text-[13px] line-clamp-1 flex-1 text-xon-text-secondary`}
                >
                  {hasDraft ? (
                    <span className="flex items-center gap-1">
                      <span className="text-xon-primary font-medium">
                        {t("message_preview.draft")}:
                      </span>
                      <span className="truncate">{draftPreview}</span>
                    </span>
                  ) : (
                    getMessageContent(displayMessage)
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {conversation.closed ? (
                  <div className="flex-shrink-0 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (!conversation.assigned_agent_id || isAssignedToMe) &&
                  conversation.unread_messages_count &&
                  !lastMsgSentByMe ? (
                  <div className="flex-shrink-0 h-5 min-w-5 px-1.5 bg-xon-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                    {conversation.unread_messages_count}
                  </div>
                ) : null}

                {conversation.assigned_agent_id && assignedAgent && (
                  <AgentAvatarPopup agent={assignedAgent} isRTL={isRTL} />
                )}
              </div>
            </div>

            {(() => {
              const raw = conversation?.contact_tags as unknown;
              const tagIds: number[] = Array.isArray(raw)
                ? raw
                : typeof raw === "string" && raw.length > 0
                  ? (() => {
                      try {
                        return JSON.parse(raw);
                      } catch {
                        return (raw as string)
                          .split(",")
                          .map(Number)
                          .filter(Boolean);
                      }
                    })()
                  : [];
              if (tagIds.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tagIds.slice(0, 3).map((tagId: number, idx: number) => {
                    const tagData = availableTags?.find((t) => t.id === tagId);
                    const tagColor = tagData?.color || "#3b82f6";
                    const tagName = tagData?.name || String(tagId);
                    return (
                      <div
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-xon-surface-container-hover border border-xon-surface-outline/30 text-xon-text-secondary flex items-center gap-1"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: tagColor }}
                        />
                        {tagName}
                      </div>
                    );
                  })}
                  {tagIds.length > 3 && (
                    <span className="text-[10px] text-xon-text-secondary font-medium">
                      +{tagIds.length - 3}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </button>

        <div className="relative flex-shrink-0 ml-1" ref={menuRef}>
          <button
            ref={menuButtonRef}
            onClick={() => {
              const rect = menuButtonRef.current?.getBoundingClientRect();
              if (rect)
                setMenuPosition({
                  top: rect.bottom + 8,
                  left: rect.right - 180,
                });
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${isMenuOpen ? "bg-xon-surface-hover opacity-100" : "hover:bg-xon-surface-hover"}`}
          >
            <MoreVertical className="h-4 w-4 text-xon-text-secondary" />
          </button>

          {isMenuOpen &&
            menuPosition &&
            ReactDOM.createPortal(
              <div
                className="conversation-dropdown-menu fixed bg-xon-surface-container border border-xon-surface-outline rounded-md shadow-lg z-[99999] min-w-[180px]"
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                }}
              >
                <button
                  onClick={() => {
                    uiDispatch(openProfilePanel(conversation.id));
                    handleMenuItemClick();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xon-text-primary hover:bg-xon-surface-hover transition-colors whitespace-nowrap"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>{t("conversations.menu.view_profile")}</span>
                </button>
                {!isInternalConversation && isContactBlocked && (
                  <button
                    onClick={() => {
                      if (!conversation.contact_id) return;
                      unblockContact(conversation.contact_id, {
                        onSuccess: () => {
                          updateConversationInCache(queryClient, conversation.id, (c) => ({ ...c, status: "open" }));
                          handleMenuItemClick();
                        },
                        onError: () => {
                          alert("Failed to remove from blacklist");
                        },
                      });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-xon-surface-hover transition-colors whitespace-nowrap"
                  >
                    <Ban className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {isUnblocking
                        ? t("conversations.menu.unblocking", "Removing…")
                        : t("conversations.menu.unblock", "Remove from Blacklist")}
                    </span>
                  </button>
                )}
                {(isInternalConversation || isAssignedToMe) && (
                  <>
                    {!isInternalConversation && (
                      <button
                        onClick={() => {
                          setShowCloseConfirm(true);
                          handleMenuItemClick();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-xon-surface-hover transition-colors whitespace-nowrap"
                      >
                        <X className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {t("conversations.menu.close_conversation")}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const isPinned = conversation.pinned;
                        const conversationId = conversation.id;
                        const numericId = conversation.numeric_id;

                        if (isPinned) {
                          updateConversationInCache(queryClient, conversationId, (c) => ({ ...c, pinned: false }));
                          if (numericId) {
                            unpinConversationMutation(numericId, {
                              onError: (err) => {
                                console.error("Failed to unpin conversation:", err);
                                updateConversationInCache(queryClient, conversationId, (c) => ({ ...c, pinned: true }));
                              },
                            });
                          }
                        } else {
                          updateConversationInCache(queryClient, conversationId, (c) => ({ ...c, pinned: true }));
                          if (numericId) {
                            pinConversationMutation(numericId, {
                              onError: (err) => {
                                console.error("Failed to pin conversation:", err);
                                updateConversationInCache(queryClient, conversationId, (c) => ({ ...c, pinned: false }));
                              },
                            });
                          }
                        }
                        handleMenuItemClick();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-xon-surface-hover transition-colors whitespace-nowrap"
                    >
                      {conversation.pinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                      <span>
                        {conversation.pinned
                          ? t("conversations.menu.unpin")
                          : t("conversations.menu.pin")}
                      </span>
                    </button>
                    {!isContactBlocked && (
                      <button
                        onClick={() => {
                          setShowBlockConfirm(true);
                          setBlacklistReason("");
                          handleMenuItemClick();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-xon-surface-hover transition-colors whitespace-nowrap"
                      >
                        <Ban className="h-4 w-4 flex-shrink-0" />
                        <span>{t("conversations.menu.block", "Blacklist")}</span>
                      </button>
                    )}
                  </>
                )}
              </div>,
              document.body,
            )}
        </div>
      </div>

      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-xon-surface-container rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-lg mb-1 text-xon-text-primary">
              {t("conversations.confirm.block_title", { name: displayName, defaultValue: `Blacklist ${displayName}?` })}
            </h3>
            <p className="text-xs text-xon-text-secondary mb-4">
              {t("conversations.confirm.block_subtitle", "This contact will be blacklisted and unable to reach you.")}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-xon-text-primary mb-1">
                {t("conversations.confirm.blacklist_reason", "Blacklist Reason")}
                <span className="text-xon-red ml-1">*</span>
              </label>
              <textarea
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
                placeholder={t("conversations.confirm.blacklist_reason_placeholder", "Enter the reason for blacklisting…")}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-xon-surface-outline bg-xon-surface focus:outline-none focus:ring-2 focus:ring-xon-red/40 text-xon-text-primary placeholder:text-xon-text-secondary resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowBlockConfirm(false); setBlacklistReason(""); }}
                className="px-4 py-2 text-sm"
              >
                {t("conversations.confirm.cancel")}
              </button>
              <button
                onClick={() => {
                  if (!conversation.contact_id) return;
                  const contactId = conversation.contact_id;
                  const reason = blacklistReason.trim();
                  blockContact(contactId, {
                    onSuccess: () => {
                      updateConversationInCache(queryClient, conversation.id, (c) => ({ ...c, status: "blocked" }));
                      if (conversation.numeric_id) {
                        unassignConversation(conversation.numeric_id);
                      }
                      if (reason) {
                        updateCustomFields({ contactId, customFields: { blacklist_reason: reason } });
                      }
                      setShowBlockConfirm(false);
                      setBlacklistReason("");
                      handleMenuItemClick();
                    },
                    onError: () => {
                      setShowBlockConfirm(false);
                      alert("Failed to blacklist contact");
                    },
                  });
                }}
                disabled={isBlocking || !blacklistReason.trim()}
                className="px-4 py-2 text-sm bg-xon-red text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBlocking
                  ? t("conversations.menu.blocking", "Blacklisting…")
                  : t("conversations.confirm.block", "Blacklist")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-xon-surface-container rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="font-semibold text-lg mb-4 text-xon-text-primary">
              {t("conversations.confirm.close_title")}
            </h3>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-4 py-2 text-sm"
              >
                {t("conversations.confirm.cancel")}
              </button>
              <button
                onClick={() => {
                  if (conversation.numeric_id)
                    closeConversation(conversation.numeric_id);
                  setShowCloseConfirm(false);
                }}
                className="px-4 py-2 text-sm bg-xon-primary text-white rounded-lg"
              >
                {t("conversations.confirm.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
