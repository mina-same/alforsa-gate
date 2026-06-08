import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Reply as ReplyIcon, SmilePlus, AlertCircle } from "lucide-react";
import MessageActionsDropdown from "./MessageActionsDropdown";
import LinkPreview from "./LinkPreview";
import { Message } from "@/types/chat";
import { useTranslation } from "react-i18next";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import { useCreateMessage, useDeleteMessage, useUpdateMessage } from "@/api/messages/hooks";
import MessageReactionsDetails from "./MessageReactionsDetails";
import { useDateFormat } from "@/hooks/useDateFormat";
import { useAuthUser } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import type { MessagesListResponse } from "@/api/messages/types";
import { Star, Pin } from "lucide-react";
import { useConversationStaticContext } from "@/contexts/ConversationContext";

// Sub-components
import MessageHeader from "./bubble/MessageHeader";
import MessageReplyContext from "./bubble/MessageReplyContext";
import MessageContent from "./bubble/MessageContent";
import MessageFooter from "./bubble/MessageFooter";
import MessageReactions from "./bubble/MessageReactions";
import ResendModal from "./ResendModal";
import CallConfirmationSheet from "./CallConfirmationSheet";

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  userAvatar?: string;
  isGrouped?: boolean;
  senderIdInfo?: { type: string | null; id: number | null };
  senderContact?: any;
  senderName?: string | null;
}

function MessageBubble({
  message,
  isSender,
  userAvatar,
  isGrouped = false,
  senderIdInfo,
  senderContact,
  senderName,
}: MessageBubbleProps) {
  const { i18n } = useTranslation();
  const isDarkMode = document.documentElement.classList.contains("dark");
  const createMessageMutation = useCreateMessage();
  const deleteMessageMutation = useDeleteMessage();
  const { mutate: updateMessageMutate } = useUpdateMessage();
  const queryClient = useQueryClient();
  const { formatDate, formatTime } = useDateFormat();
  const authUser = useAuthUser();

  const {
    conversationId,
    isInternalConversation,
    isAssignedToMe,
    canDelete,
    partnerName,
    onReply,
    onDelete,
    onEdit,
    onResend,
    onCall,
  } = useConversationStaticContext();

  const messageWithLatestStatus = message;

  // --- States ---
  const [actionsOpen, setActionsOpen] = useState(false);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [bubbleRect, setBubbleRect] = useState<DOMRect | null>(null);
  const [reactionsDetailsOpen, setReactionsDetailsOpen] = useState(false);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [reactionPopoverPos, setReactionPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [showCallConfirmation, setShowCallConfirmation] = useState(false);
  const myReactionIdRef = React.useRef<number | null>(null);

  // --- Refs ---
  const bubbleRef = React.useRef<HTMLDivElement | null>(null);
  const reactionPickerRef = React.useRef<HTMLDivElement | null>(null);
  const reactionButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const reactionPopoverRef = React.useRef<HTMLDivElement | null>(null);
  const longPressTimerRef = React.useRef<number | null>(null);
  const lastContextMenuOpenAtRef = React.useRef<number>(0);
  const touchStartPosRef = React.useRef<{ x: number, y: number } | null>(null);
  const deletedReactionIds = React.useRef<Set<number>>(new Set());

  // --- Constants & Helpers ---
  const bubbleClass = isSender
    ? "bg-xon-msg-bg-sent text-xon-text-primary rounded-lg rounded-br-none shadow-sm"
    : "bg-xon-msg-bg-received text-xon-text-primary rounded-lg rounded-bl-none shadow-sm";

  const isDeleted = !!message.deletedBy;
  const isTemplateMessage = !!message.template || message.message_type === "template_message";
  const profileTimezone = authUser.timezone || null;

  const isRepliedToByMe = !!message.replyTo && message.replyTo.senderName !== "You" && !isSender;

  const repliedToHighlightClass = isRepliedToByMe
    ? "border-l-2 border-l-xon-primary/30 dark:border-l-xon-primary/20"
    : "";


  const shouldShowInternalSenderHeader =
    isInternalConversation && !isSender && !isGrouped && !message.isDraft;

  const safeUrlTransform = (url: string) => {
    try {
      if (!url || url.startsWith("#") || url.startsWith("/")) return url;
      const parsed = new URL(url, window.location.origin);
      return new Set(["http:", "https:", "mailto:", "tel:"]).has(parsed.protocol) ? parsed.toString() : "";
    } catch { return ""; }
  };

  const linkUrl = useMemo(() => {
    if (message.media?.type === "link" && message.media.url && message.media.url !== "string") {
      return message.media.url;
    }
    if (!message.media && message.text) {
      const trimmed = message.text.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) return null;
      const urlMatch = message.text.match(/(https?:\/\/[^\s]+)/);
      return urlMatch ? urlMatch[0] : null;
    }
    return null;
  }, [message.media, message.text]);

  // --- Reactions ---
  const allReactions = useMemo(() => {
    const base = message.reactions || [];
    const filtered = base.filter(r => !r.isMine);
    if (myReaction) {
      return [
        ...filtered,
        {
          emoji: myReaction,
          isMine: true,
          reactorType: "user" as "user" | "contact",
          userName: "You",
          userAvatar: authUser?.avatar_url,
          createdAt: new Date().toISOString()
        }
      ];
    }
    return filtered;
  }, [message.reactions, myReaction, authUser?.avatar_url]);

  useEffect(() => {
    const userReaction = message.reactions?.find((r) => r.isMine);
    if (userReaction?.numericId && deletedReactionIds.current.has(userReaction.numericId)) return;
    setMyReaction(userReaction?.emoji || null);
    if (userReaction?.numericId) {
      myReactionIdRef.current = userReaction.numericId;
    } else if (!userReaction) {
      myReactionIdRef.current = null;
    }
  }, [message.reactions]);

  const toggleReaction = async (emoji: string) => {
    const isRemove = myReaction === emoji;
    const isSwitch = myReaction && myReaction !== emoji;
    const previousReaction = myReaction;
    const previousReactionId = myReactionIdRef.current;

    setMyReaction(isRemove ? null : emoji);
    myReactionIdRef.current = null;

    try {
      const targetMessageNumericId = (() => {
        if (typeof message.numericId === "number" && Number.isFinite(message.numericId)) return message.numericId;
        const n = Number(message.id);
        if (Number.isFinite(n) && n > 0) return n;
        return null;
      })();

      if (!targetMessageNumericId) {
        setMyReaction(previousReaction);
        myReactionIdRef.current = previousReactionId;
        return;
      }

      let idToDelete = previousReactionId;
      if (!idToDelete) {
        const serverReaction = message.reactions?.find((r) => r.isMine);
        idToDelete = serverReaction?.numericId || null;
      }

      if ((isRemove || isSwitch) && idToDelete) {
        deletedReactionIds.current.add(idToDelete);
        await deleteMessageMutation.mutateAsync(idToDelete);
      }

      if (!isRemove && conversationId) {
        const response = await createMessageMutation.mutateAsync({
          content: emoji,
          message_type: "reaction",
          conversation_id: conversationId,
          reply_to_message_id: targetMessageNumericId,
        });
        if (response && response.id) myReactionIdRef.current = response.id;
      }
    } catch (error) {
      console.error("Failed to update reaction:", error);
      setMyReaction(previousReaction);
      myReactionIdRef.current = previousReactionId;
    }
  };

  useEffect(() => {
    if (!reactionPickerOpen) { setReactionPopoverPos(null); setIsLongPressing(false); return; }
    const updatePosition = () => {
      const buttonEl = reactionButtonRef.current;
      const popoverEl = reactionPopoverRef.current;
      if (!buttonEl || !popoverEl) return;
      const buttonRect = buttonEl.getBoundingClientRect();
      const popRect = popoverEl.getBoundingClientRect();
      const margin = 8, gap = 8, PICKER_WIDTH = 320, PICKER_HEIGHT = 420;
      const targetRect = (bubbleRef.current || (isLongPressing ? reactionPickerRef.current : buttonEl))?.getBoundingClientRect() || buttonRect;
      const spaceBelow = window.innerHeight - targetRect.bottom - margin, spaceAbove = targetRect.top - margin;
      const currentHeight = popRect.height > 30 ? popRect.height : 50;
      let top = (spaceBelow < PICKER_HEIGHT && spaceAbove > spaceBelow) ? Math.max(margin, targetRect.top - currentHeight - gap) : Math.max(margin, Math.min(targetRect.bottom + gap, window.innerHeight - currentHeight - margin));
      let left = Math.max(margin, Math.min(isSender ? targetRect.right - PICKER_WIDTH : targetRect.left, window.innerWidth - PICKER_WIDTH - margin));
      setReactionPopoverPos({ top, left });
    };
    const raf = window.requestAnimationFrame(updatePosition);
    const handler = (e: MouseEvent) => { if (!reactionButtonRef.current?.contains(e.target as Node) && !reactionPopoverRef.current?.contains(e.target as Node)) setReactionPickerOpen(false); };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handler);
    return () => { window.cancelAnimationFrame(raf); window.removeEventListener("resize", updatePosition); window.removeEventListener("scroll", updatePosition, true); document.removeEventListener("mousedown", handler); };
  }, [reactionPickerOpen, isSender, myReaction, isLongPressing]);

  const isMobile = typeof navigator !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0);

  const handleCloseMobileModal = () => { setMobileModalOpen(false); setIsLongPressing(false); };

  // --- Star / Pin ---
  const parsedMsgAttrs = useMemo(() => {
    const a = message.additional_attributes;
    if (!a) return {};
    if (typeof a === 'string') { try { return JSON.parse(a); } catch { return {}; } }
    return a as Record<string, any>;
  }, [message.additional_attributes]);
  const isStar = !!parsedMsgAttrs?.isStar;
  const isPinned = !!parsedMsgAttrs?.isPinned;

  const handleStarMessage = (msg: Message) => {
    if (!msg.numericId) return;
    let newAttrs: string | undefined;
    let oldAttrs: string | undefined;

    queryClient.setQueriesData<MessagesListResponse>(
      { queryKey: ["conversationMessages", conversationId] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((m) => {
            if (m.id !== msg.numericId) return m;
            const a = m.additional_attributes;
            const current: Record<string, any> = !a ? {} : typeof a === "string" ? (() => { try { return JSON.parse(a); } catch { return {}; } })() : (a as Record<string, any>);
            oldAttrs = typeof a === "string" ? a : JSON.stringify(a ?? {});
            newAttrs = JSON.stringify({ ...current, isStar: !current.isStar });
            return { ...m, additional_attributes: newAttrs };
          }),
        };
      },
    );

    if (!newAttrs) { handleCloseMobileModal(); return; }
    const mutationAttrs = newAttrs;
    const revertAttrs = oldAttrs;

    updateMessageMutate(
      { messageId: msg.numericId, data: { additional_attributes: mutationAttrs } },
      {
        onError: () => {
          queryClient.setQueriesData<MessagesListResponse>(
            { queryKey: ["conversationMessages", conversationId] },
            (old) => {
              if (!old) return old;
              return { ...old, items: old.items.map((m) => m.id === msg.numericId ? { ...m, additional_attributes: revertAttrs } : m) };
            },
          );
        },
      }
    );
    handleCloseMobileModal();
  };

  const handlePinMessage = (msg: Message) => {
    if (!msg.numericId) return;
    let newAttrs: string | undefined;
    let oldAttrs: string | undefined;

    queryClient.setQueriesData<MessagesListResponse>(
      { queryKey: ["conversationMessages", conversationId] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((m) => {
            if (m.id !== msg.numericId) return m;
            const a = m.additional_attributes;
            const current: Record<string, any> = !a ? {} : typeof a === "string" ? (() => { try { return JSON.parse(a); } catch { return {}; } })() : (a as Record<string, any>);
            oldAttrs = typeof a === "string" ? a : JSON.stringify(a ?? {});
            newAttrs = JSON.stringify({ ...current, isPinned: !current.isPinned });
            return { ...m, additional_attributes: newAttrs };
          }),
        };
      },
    );

    if (!newAttrs) { handleCloseMobileModal(); return; }
    const mutationAttrs = newAttrs;
    const revertAttrs = oldAttrs;

    updateMessageMutate(
      { messageId: msg.numericId, data: { additional_attributes: mutationAttrs } },
      {
        onError: () => {
          queryClient.setQueriesData<MessagesListResponse>(
            { queryKey: ["conversationMessages", conversationId] },
            (old) => {
              if (!old) return old;
              return { ...old, items: old.items.map((m) => m.id === msg.numericId ? { ...m, additional_attributes: revertAttrs } : m) };
            },
          );
        },
      }
    );
    handleCloseMobileModal();
  };

  // --- Event handlers ---
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isDeleted) return;
    e.preventDefault(); e.stopPropagation();
    if (isMobile && bubbleRef.current) { setBubbleRect(bubbleRef.current.getBoundingClientRect()); setMobileModalOpen(true); setIsLongPressing(true); return; }
    lastContextMenuOpenAtRef.current = Date.now();
    window.setTimeout(() => setActionsOpen(true), 0);
  };

  const handleActionsOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && Date.now() - lastContextMenuOpenAtRef.current < 200) return;
    setActionsOpen(nextOpen);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDeleted) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    longPressTimerRef.current = window.setTimeout(() => {
      setIsLongPressing(true);
      if (isMobile) { if (bubbleRef.current) { setBubbleRect(bubbleRef.current.getBoundingClientRect()); setMobileModalOpen(true); } }
      else { setReactionPickerOpen(true); }
      touchStartPosRef.current = null;
    }, 450);
  };

  const handleTouchEnd = () => { if (longPressTimerRef.current) { window.clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; } touchStartPosRef.current = null; };
  const handleTouchMove = (e: React.TouchEvent) => { if (!longPressTimerRef.current || !touchStartPosRef.current) return; const touch = e.touches[0]; if (Math.abs(touch.clientX - touchStartPosRef.current.x) > 10 || Math.abs(touch.clientY - touchStartPosRef.current.y) > 10) { window.clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; } };

  const handleResendClick = () => setResendModalOpen(true);
  const handleResendConfirm = () => onResend(message.id);
  const handleDeleteFailed = () => { onDelete(message.id, false); };
  const handleCopy = (_text: string) => {};

  const canInteract = isAssignedToMe || isInternalConversation;

  const renderMobileMenu = () => {
    if (!mobileModalOpen || !bubbleRect) return null;
    const margin = 16, reactionsHeight = 56, menuWidth = 220;
    const itemCount = [true, message.text, true, true].filter(Boolean).length;
    const totalMenuHeight = (itemCount * 50) + 12;
    const safeTop = reactionsHeight + margin + 10, safeBottom = window.innerHeight - totalMenuHeight - margin - 10;
    let finalBubbleTop = bubbleRect.height <= (safeBottom - safeTop) ? Math.max(safeTop, Math.min(bubbleRect.top, safeBottom - bubbleRect.height)) : Math.max(margin, Math.min(bubbleRect.top, safeBottom - Math.min(bubbleRect.height, 300)));
    const correctiveShift = (finalBubbleTop + bubbleRect.height + 12) - Math.min(finalBubbleTop + bubbleRect.height + 12, window.innerHeight - totalMenuHeight - margin);
    const actualBubbleTop = finalBubbleTop - (correctiveShift > 0 ? correctiveShift : 0);
    const actualReactionsTop = (actualBubbleTop - reactionsHeight - 12);
    const actualMenuTop = actualBubbleTop + bubbleRect.height + 12;

    return createPortal(
      <div className="fixed inset-0 z-[100]">
        <div className="mobile-long-press-backdrop opacity-100" onClick={handleCloseMobileModal} />
        {canInteract && (
          <div className="fixed z-[120] animate-reaction-picker" style={{ top: Math.max(margin, actualReactionsTop), left: isSender ? Math.max(10, bubbleRect.right - 320) : Math.min(window.innerWidth - 330, bubbleRect.left), width: 320, transformOrigin: 'bottom center' }}>
            <EmojiPicker width={320} height={420} reactionsDefaultOpen allowExpandReactions onEmojiClick={(ed) => { toggleReaction(ed.emoji); handleCloseMobileModal(); }} theme={isDarkMode ? Theme.DARK : Theme.LIGHT} emojiStyle={EmojiStyle.NATIVE} className="xon-emoji-picker" />
          </div>
        )}
        <div className={`fixed z-[110] ${bubbleClass} ${message.audioUrl || message.message_type === "audio" || message.text === "[sticker]" ? "px-0 py-0 shadow-none" : (isTemplateMessage ? "p-0.5" : "px-3 py-2")} ${message.text === "[sticker]" ? "!bg-transparent border-none shadow-none" : ""} shadow-2xl message-highlight-glow pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden`} style={{ top: actualBubbleTop, left: bubbleRect.left, width: bubbleRect.width, height: bubbleRect.height }}>
          <MessageHeader shouldShow={shouldShowInternalSenderHeader} isSender={isSender} senderIdInfo={senderIdInfo} senderName={senderName} senderContact={senderContact} />
          {!isDeleted && linkUrl && !isTemplateMessage && <LinkPreview url={linkUrl} />}
          {!isDeleted && <MessageReplyContext replyTo={message.replyTo} isSender={isSender} isDarkMode={isDarkMode} safeUrlTransform={safeUrlTransform} partnerName={partnerName} isInternalConversation={isInternalConversation} />}
          <MessageContent message={message} isSender={isSender} isDarkMode={isDarkMode} userAvatar={userAvatar} />
          <div className="absolute -bottom-5 right-2 flex items-center gap-1">
            <MessageReactions reactions={allReactions} isSender={isSender} onOpenDetails={() => { }} />
          </div>
          {!isTemplateMessage && message?.message_type && (
            <MessageFooter
              isSender={isSender}
              status={messageWithLatestStatus.status}
              displayStatus={message.message_type === "calls" ? false : true}
              timestamp={formatTime(message.createdAt)}
              edited={message.edited}
              originalMessage={message.edited ? message.text : undefined}
              onResend={handleResendClick}
              messageId={message.id}
            />
          )}
        </div>
        {canInteract && (
          <MessageActionsDropdown message={message} isSender={isSender} onCopy={handleCopy} onDelete={canDelete ? onDelete : undefined} onEdit={onEdit} onReply={onReply} onStar={handleStarMessage} onPin={handlePinMessage} open={true} onOpenChange={n => !n && handleCloseMobileModal()} showTrigger={false} isInternalConversation={isInternalConversation} style={{ top: actualMenuTop, left: isSender ? Math.max(10, bubbleRect.right - menuWidth) : Math.min(window.innerWidth - menuWidth - 10, bubbleRect.left), width: menuWidth }} containerClassName="fixed z-[130] animate-mobile-menu-appear" />
        )}
      </div>, document.body
    );
  };

  return (
    <>
      {renderMobileMenu()}
      <div className={`flex items-center max-w-full ${isSender ? "flex-row" : "flex-row"} ${!isDeleted && messageWithLatestStatus.status === "failed" ? "gap-3" : ""}`}>
        <div
          ref={bubbleRef}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onClick={() => {
            if (message.message_type === 'calls' && isAssignedToMe && !isDeleted) {
              setShowCallConfirmation(true);
            }
          }}
          className={`${bubbleClass} ${repliedToHighlightClass} ${message.audioUrl || message.text === "[sticker]" ? "px-0 py-0" : (isTemplateMessage ? "p-0.5" : "px-3 py-2")} ${message.text === "[sticker]" ? "!bg-transparent border-none shadow-none" : ""} ${message.message_type === 'calls' ? 'cursor-pointer hover:opacity-95' : ''} ${allReactions.length > 0 && !isDeleted ? "mb-6" : ""} break-words word-break relative group/bubble min-w-[80px] select-none`}
        >
          {!isDeleted && (
            <div className={`absolute top-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity z-10 hidden md:flex flex-col gap-1 ${isSender ? "-left-9" : "-right-9"}`} onClick={e => e.stopPropagation()}>
              {message.deletedBy !== "everyone" && canInteract && (
                <button type="button" onClick={() => onReply(message)} className="h-7 w-7 flex items-center justify-center rounded-full border border-xon-surface-outline bg-xon-surface-container shadow-sm text-foreground/60 hover:text-foreground hover:bg-xon-surface-container-hover dark:hover:bg-white/10 transition-colors outline-none" title="Reply"><ReplyIcon className="h-3.5 w-3.5" /></button>
              )}
              {canInteract && (
                <div className="relative" ref={reactionPickerRef}>
                  <button type="button" onClick={() => setReactionPickerOpen(!reactionPickerOpen)} ref={reactionButtonRef} className="h-7 w-7 flex items-center justify-center rounded-full border border-xon-surface-outline bg-xon-surface-container shadow-sm text-foreground/60 hover:text-foreground hover:bg-xon-surface-container-hover dark:hover:bg-white/10 transition-colors outline-none" title="React"><SmilePlus className="h-3.5 w-3.5" /></button>
                  {reactionPickerOpen && createPortal(
                    <div ref={reactionPopoverRef} className={`z-50 flex flex-col animate-reaction-picker backdrop-blur-sm ${reactionPopoverPos && bubbleRef.current ? (reactionPopoverPos.top < bubbleRef.current.getBoundingClientRect().top ? (isSender ? "origin-bottom-right" : "origin-bottom-left") : (isSender ? "origin-top-right" : "origin-top-left")) : "origin-top"}`} style={{ position: "absolute", top: reactionPopoverPos?.top ?? 0, left: reactionPopoverPos?.left ?? 0, width: 320, visibility: reactionPopoverPos ? "visible" : "hidden" }} onClick={e => e.stopPropagation()}>
                      <EmojiPicker width={320} height={420} reactionsDefaultOpen allowExpandReactions onEmojiClick={ed => { toggleReaction(ed.emoji); setReactionPickerOpen(false); }} theme={isDarkMode ? Theme.DARK : Theme.LIGHT} emojiStyle={EmojiStyle.NATIVE} className="xon-emoji-picker" />
                    </div>, document.body
                  )}
                </div>
              )}
            </div>
          )}

          {!isDeleted && message.media_type !== "calls" && canInteract && (
            <MessageActionsDropdown message={message} isSender={isSender} onCopy={handleCopy} onDelete={canDelete ? onDelete : undefined} onEdit={onEdit} onReply={onReply} onStar={handleStarMessage} onPin={handlePinMessage} open={actionsOpen} onOpenChange={handleActionsOpenChange} isInternalConversation={isInternalConversation} containerClassName="absolute top-1 right-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity z-10 hidden md:block" triggerClassName="h-6 w-6 flex items-center justify-center rounded-full bg-xon-surface-container shadow-sm text-foreground/60 hover:text-foreground hover:bg-xon-surface-container-hover dark:hover:bg-white/10 transition-colors outline-none" />
          )}

          <MessageHeader shouldShow={shouldShowInternalSenderHeader} isSender={isSender} senderIdInfo={senderIdInfo} senderName={senderName} senderContact={senderContact} />
          {!isDeleted && linkUrl && message.message_type !== "template_message" && <LinkPreview url={linkUrl} />}
          {!isDeleted && <MessageReplyContext replyTo={message.replyTo} isSender={isSender} isDarkMode={isDarkMode} safeUrlTransform={safeUrlTransform} partnerName={partnerName} isInternalConversation={isInternalConversation} />}

          <MessageContent message={message} isSender={isSender} isDarkMode={isDarkMode} userAvatar={userAvatar} />

          {(isStar || isPinned) && !isDeleted && (
            <div className="absolute top-1 right-1 flex items-center gap-0.5 pointer-events-none">
              {isPinned && <Pin className="h-3 w-3 fill-xon-primary text-xon-primary drop-shadow-sm" />}
              {isStar && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 drop-shadow-sm" />}
            </div>
          )}
          {!isDeleted && <MessageReactions reactions={allReactions} isSender={isSender} onOpenDetails={() => setReactionsDetailsOpen(true)} />}
          {(() => {
            const t = String(message.message_type || message.media?.type || '').toLowerCase()
            const isPureMedia = !!message.media && (t.includes('image') || t.includes('video'))
            const isVoice = t.includes('audio') || !!message.audioUrl || message.text === '[Audio]'
            const hasCaption = (() => {
              const txt = String(message.text || '').trim()
              if (!txt) return false
              if (txt === '[Image]' || txt === '[Video]' || txt === '[sticker]' || txt === '[Audio]') return false
              return true
            })()
            if (isPureMedia && !hasCaption) return null
            if (isVoice) return null
            if (isTemplateMessage) return null
            return <MessageFooter
              isSender={isSender}
              status={messageWithLatestStatus.status}
              displayStatus={message.message_type === "calls" ? false : true}
              timestamp={formatTime(message.createdAt)}
              edited={message.edited}
              originalMessage={message.edited ? message.text : undefined}
              onResend={handleResendClick}
              messageId={message.id}
            />
          })()}
        </div>
        {!isDeleted && messageWithLatestStatus.status === "failed" && (
          <button
            type="button"
            onClick={isAssignedToMe ? handleResendClick : undefined}
            className="flex-shrink-0 animate-in fade-in zoom-in duration-300 group/failed"
            title="Message not sent. Click to resend."
          >
            <div className="relative flex items-center justify-center">
              <AlertCircle className="h-5 w-5 fill-[var(--xon-color-surface-red)] text-white" />
            </div>
          </button>
        )}
      </div>

      {reactionsDetailsOpen && (
        <MessageReactionsDetails open={reactionsDetailsOpen} onOpenChange={setReactionsDetailsOpen} reactions={allReactions} />
      )}

      {resendModalOpen && (
        <ResendModal
          open={resendModalOpen}
          onOpenChange={setResendModalOpen}
          onResend={handleResendConfirm}
          onDelete={handleDeleteFailed}
        />
      )}
      {showCallConfirmation && (
        <CallConfirmationSheet
          isOpen={showCallConfirmation}
          onClose={() => setShowCallConfirmation(false)}
          onConfirm={() => onCall()}
          contactName={partnerName || String(conversationId || "Contact")}
        />
      )}
    </>
  );
}

export default React.memo(MessageBubble, (prev, next) =>
  prev.message === next.message &&
  prev.isSender === next.isSender &&
  prev.userAvatar === next.userAvatar &&
  prev.isGrouped === next.isGrouped &&
  prev.senderIdInfo?.type === next.senderIdInfo?.type &&
  prev.senderIdInfo?.id === next.senderIdInfo?.id &&
  prev.senderContact === next.senderContact &&
  prev.senderName === next.senderName
);
