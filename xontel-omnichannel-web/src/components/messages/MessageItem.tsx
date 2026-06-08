import React, { useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import DraftMessage from "./DraftMessage";
import { Message } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversationStaticContext } from "@/contexts/ConversationContext";
import { useSenderInfo } from "./hooks/useSenderInfo";

interface MessageItemProps {
  message: Message;
  isSender: boolean;
  showTimestamp?: boolean;
  isGrouped?: boolean;
  isGroupedWithNext?: boolean;
  isHighlighted?: boolean;
  isReplyTarget?: boolean;
}

function MessageItem({
  message,
  isSender,
  showTimestamp = true,
  isGrouped = false,
  isGroupedWithNext = false,
  isHighlighted = false,
  isReplyTarget = false,
}: MessageItemProps) {
  const ctx = useConversationStaticContext();
  const { senderName, senderAvatar, senderIdInfo, senderContact } = useSenderInfo(message);

  // Touch / swipe-to-reply state (mobile)
  const touchStartXRef = useRef<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const draggingRef = useRef(false);
  const SWIPE_TRIGGER = 80;
  // Enrich the message with the resolved sender name for reply preview
  const replyMessage = React.useMemo<Message>(() => {
    const resolved = String(senderName || "").trim();
    if (!resolved) return message;
    if (message.senderName === resolved) return message;
    return { ...message, senderName: resolved };
  }, [message, senderName]);

  // WhatsApp business-initiated calls should appear on the sender side
  const effectiveIsSender = React.useMemo(() => {
    if (message.message_type === 'calls') {
      let callData: any = {};
      try {
        if (typeof message.additional_attributes === 'string') {
          callData = JSON.parse(message.additional_attributes);
        } else {
          callData = message.additional_attributes || {};
        }
      } catch (e) { }
      const isBusinessInitiated = callData.direction === 'BUSINESS_INITIATED' ||
        ((message as any).content || message.text || '').includes('BUSINESS_INITIATED');
      if (isBusinessInitiated) return true;
    }
    return isSender;
  }, [message, isSender]);

  const shouldShowAvatarSlot =
    ctx.isInternalConversation && !effectiveIsSender && !message.isDraft;

  const shouldShowSenderAvatarBeforeMessage =
    ctx.isInternalConversation &&
    !effectiveIsSender &&
    !message.isDraft &&
    !isGroupedWithNext;

  // Resolved avatar: sender's fetched avatar, or fall back to the conversation-level avatar
  const resolvedAvatar = senderAvatar
    ? senderAvatar
    : (effectiveIsSender ? ctx.currentUserAvatar : ctx.otherUserAvatar);

  // --- Touch Logic (Mobile Swipe) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    draggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current || touchStartXRef.current == null) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartXRef.current;
    if (dx > 0) setTranslateX(Math.min(dx, SWIPE_TRIGGER * 1.2));
  };

  const handleTouchEnd = () => {
    draggingRef.current = false;
    const final = translateX;
    setTranslateX(0);
    touchStartXRef.current = null;
    if (final >= SWIPE_TRIGGER && message.deletedBy !== "everyone") {
      ctx.onReply(replyMessage);
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`flex gap-2 group cursor-pointer transition-colors rounded-lg py-0.5 ${isHighlighted
        ? 'bg-xon-yellow/20 dark:bg-xon-yellow/10 ring-1 ring-xon-yellow/50'
        : isReplyTarget
          ? 'bg-xon-container-blue/30 dark:bg-xon-container-blue/20'
          : 'hover:bg-black/5 dark:hover:bg-white/5'
        } ${effectiveIsSender ? 'justify-end' : 'justify-start'}`}
      onDoubleClick={() => message.deletedBy !== 'everyone' && ctx.onReply(replyMessage)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col max-w-sm lg:max-w-lg">
        <div
          style={{
            transform: `translateX(${translateX}px)`,
            transition: draggingRef.current ? "none" : "transform 150ms ease",
            display: "inline-block",
          }}
        >
          {message.isDraft ? (
            <DraftMessage
              message={message}
              otherUserAvatar={ctx.otherUserAvatar}
              contactName="Contact"
            />
          ) : (
            <div className="flex items-end gap-2 max-w-full">
              {shouldShowAvatarSlot ? (
                shouldShowSenderAvatarBeforeMessage ? (
                  <Avatar className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full object-cover border-2 border-xon-surface-outline">
                    <AvatarImage className="object-cover" src={senderAvatar || undefined} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {senderName
                        ? senderName.charAt(0).toUpperCase()
                        : message.senderId?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
                )
              ) : null}

              <div className={`flex-1 ${effectiveIsSender ? "order-1" : "order-2"} max-w-[85vw] sm:max-w-xs md:max-w-sm lg:max-w-md`}>
                <MessageBubble
                  message={replyMessage}
                  isSender={effectiveIsSender}
                  userAvatar={resolvedAvatar}
                  isGrouped={isGrouped}
                  senderIdInfo={senderIdInfo}
                  senderContact={senderContact}
                  senderName={senderName}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(MessageItem, (prev, next) =>
  prev.message === next.message &&
  prev.isSender === next.isSender &&
  prev.showTimestamp === next.showTimestamp &&
  prev.isGrouped === next.isGrouped &&
  prev.isGroupedWithNext === next.isGroupedWithNext &&
  prev.isHighlighted === next.isHighlighted &&
  prev.isReplyTarget === next.isReplyTarget
);
