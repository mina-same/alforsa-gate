import React, { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { MessageGroup } from "@/hooks/useMessageGroups";
import MessageItem from "./MessageItem";
import { Message } from "@/types/chat";
import ImageAlbumMessageItem from "./ImageAlbumMessageItem";
import { useConversationStaticContext } from "@/contexts/ConversationContext";

interface MessageListProps {
  groupedMessages: MessageGroup[];
  highlightedMessageId?: string | null;
  replyingToMessageId?: string | null;
  isFetchingOlderMessages?: boolean;
  hasMore?: boolean;
  listRef?: React.RefObject<HTMLDivElement>;
  handleScrollUp?: (e: React.UIEvent<HTMLDivElement>) => void;
  onScrollChange?: (e: React.UIEvent<HTMLDivElement>) => void;
  onScrollToBottom?: () => void;
}

export default function MessageList({
  groupedMessages,
  highlightedMessageId,
  replyingToMessageId,
  isFetchingOlderMessages = false,
  hasMore = true,
  listRef,
  handleScrollUp,
  onScrollChange,
  onScrollToBottom,
}: MessageListProps) {
  const ctx = useConversationStaticContext();

  const [showScrollButton, setShowScrollButton] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const lastShowScrollButtonRef = useRef<boolean>(false);
  const lastDistanceFromBottomRef = useRef<number>(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    handleScrollUp?.(e);
    onScrollChange?.(e);

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    lastDistanceFromBottomRef.current = scrollHeight - scrollTop - clientHeight;
    if (rafIdRef.current != null) return;

    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      const distanceFromBottom = lastDistanceFromBottomRef.current;
      const nextShow = distanceFromBottom > 300;
      if (lastShowScrollButtonRef.current !== nextShow) {
        lastShowScrollButtonRef.current = nextShow;
        setShowScrollButton(nextShow);
      }
    });
  };

  const isImageMessage = (m: Message) => {
    if (m.mediaPending) return false;
    if (!m.media?.url || m.media.url === "string") return false;
    if (m.media?.type === "link") return false;
    const t = String(m.message_type || m.media?.type || "").toLowerCase();
    return t.includes("image");
  };

  const toMs = (v: string) => {
    const d = new Date(v);
    const ms = d.getTime();
    return Number.isFinite(ms) ? ms : 0;
  };

  return (
    <div className="flex-1 min-h-0 relative bg-whatsapp">
      <ScrollArea
        viewportRef={listRef}
        className="h-full px-2 sm:px-4"
        onScroll={(e) => { handleScroll(e); }}
      >
        <div className="min-h-full flex flex-col">
          {isFetchingOlderMessages ? (
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
                Loading older messages...
              </div>
            </div>
          ) : !hasMore ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                Beginning of conversation
              </span>
            </div>
          ) : null}
          <div className="flex-1" />
          <div className="space-y-3 pb-4">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted/60 text-muted-foreground text-xs rounded-full px-3 py-1 shadow-sm">
                    {group.date}
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  {(() => {
                    const nodes: React.ReactNode[] = [];
                    const list = group.messages;
                    const GAP_MS = 5000;

                    for (let idx = 0; idx < list.length; idx++) {
                      const msg = list[idx];
                      const isSender = msg.senderId === "me";

                      if (isImageMessage(msg)) {
                        const album: Message[] = [msg];
                        let j = idx + 1;
                        while (j < list.length) {
                          const next = list[j];
                          if (next.senderId !== msg.senderId) break;
                          if (!isImageMessage(next)) break;
                          const delta = Math.abs(toMs(next.createdAt) - toMs(album[album.length - 1].createdAt));
                          if (delta > GAP_MS) break;
                          album.push(next);
                          j++;
                        }

                        if (album.length > 1) {
                          nodes.push(
                            <ImageAlbumMessageItem
                              key={`album-${album[0].id}`}
                              messages={album}
                              isSender={isSender}
                              onReply={ctx.onReply}
                              onOpenMediaViewer={ctx.onOpenMediaViewer}
                              avatarUrl={isSender ? ctx.currentUserAvatar : ctx.otherUserAvatar}
                              isInternalConversation={ctx.isInternalConversation}
                            />,
                          );
                          idx = j - 1;
                          continue;
                        }
                      }

                      const nextMsg = list[idx + 1];
                      const prevMsg = list[idx - 1];

                      const isGroupedWithPrev = prevMsg && prevMsg.senderId === msg.senderId;
                      const isGroupedWithNext = nextMsg && nextMsg.senderId === msg.senderId;

                      nodes.push(
                        <MessageItem
                          key={msg.id}
                          message={msg}
                          isSender={isSender}
                          showTimestamp={true}
                          isGrouped={isGroupedWithPrev}
                          isGroupedWithNext={isGroupedWithNext}
                          isHighlighted={msg.id === highlightedMessageId}
                          isReplyTarget={!!replyingToMessageId && msg.id === replyingToMessageId}
                        />,
                      );
                    }

                    return nodes;
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {showScrollButton && (
        <Button
          onClick={() => onScrollToBottom?.()}
          size="icon"
          className="absolute bottom-6 right-8 z-50 h-10 w-10 rounded-full shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 animate-in fade-in zoom-in duration-200 border border-border"
          title="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
