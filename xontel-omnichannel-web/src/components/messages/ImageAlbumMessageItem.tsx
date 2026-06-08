import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Message } from "@/types/chat";
import { useDateFormat } from "@/hooks/useDateFormat";
import ImageAlbumGrid from "./ImageAlbumGrid";

export default function ImageAlbumMessageItem({
  messages,
  isSender,
  onReply,
  onOpenMediaViewer,
  avatarUrl,
  isInternalConversation,
}: {
  messages: Message[];
  isSender: boolean;
  onReply: (message: Message) => void;
  onOpenMediaViewer?: (messageId: number) => void;
  avatarUrl?: string;
  isInternalConversation?: boolean;
}) {
  const { i18n } = useTranslation();
  const last = messages[messages.length - 1];

  const { formatTime } = useDateFormat();

  const bubbleClass = isSender
    ? "bg-xon-msg-bg-sent text-xon-text-primary rounded-lg rounded-br-none shadow-sm"
    : "bg-xon-msg-bg-received text-xon-text-primary rounded-lg rounded-bl-none shadow-sm";

  const timestamp = useMemo(() => {
    return formatTime(last.createdAt, );
  }, [i18n.language, last.createdAt]);

  const showAvatarSlot = !!isInternalConversation && !isSender;

  return (
    <div className={`flex items-end gap-2 max-w-full ${isSender ? 'justify-end' : 'justify-start'}`}>
      {showAvatarSlot ? (
        avatarUrl ? (
          <img
            src={avatarUrl}
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full object-cover border-2 border-xon-surface-outline"
          />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
        )
      ) : null}

      <div className={`flex-1 ${isSender ? "order-2" : "order-1"} min-w-[8rem] max-w-[85vw] sm:max-w-xs md:max-w-sm lg:max-w-md`}>
        <div className={`${bubbleClass} p-0 bg-transparent border-none shadow-none`}>
          <div className="select-none" onDoubleClick={() => onReply(last)}>
            <ImageAlbumGrid
              messages={messages}
              onOpenMediaViewer={onOpenMediaViewer}
              footerTimestamp={timestamp}
              footerStatus={last.status}
              footerIsSender={isSender}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
