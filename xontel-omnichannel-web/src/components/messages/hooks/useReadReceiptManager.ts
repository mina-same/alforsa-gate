import { useState, useEffect, useRef } from "react";
import { QueryClient } from "@tanstack/react-query";
import type { MessageResponse } from "@/api/messages/types";
import type { Conversation } from "@/types/chat";
import { useMarkConversationAsRead } from "@/api/conversations/hooks";
import { messagesAPI } from "@/api/messages/endpoints";
import { updateConversationInCache } from "@/api/conversations/cacheUtils";

interface UseReadReceiptManagerInput {
  conv: Pick<
    Conversation,
    "id" | "numeric_id" | "unread_messages_count" | "conversation_type"
  >;
  currentUserId: number | undefined;
  isAssignedToMe: boolean;
  isLoading: boolean;
  isFetchingMessages: boolean;
  firstPage: MessageResponse[];
  queryClient: QueryClient;
}

export function useReadReceiptManager({
  conv,
  currentUserId,
  isAssignedToMe,
  isLoading,
  isFetchingMessages,
  firstPage,
  queryClient,
}: UseReadReceiptManagerInput): void {
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const markedAsReadRef = useRef<{
    conversationId?: string | number;
    lastMessageIds: Set<string | number>;
  }>({
    lastMessageIds: new Set(),
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
      if (!document.hidden) {
        markedAsReadRef.current = { lastMessageIds: new Set() };
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const { mutate: markMessagesAsRead } = useMarkConversationAsRead();

  useEffect(() => {
    if (!currentUserId) return;
    if (!conv?.numeric_id) return;
    if (!conv?.unread_messages_count || conv.unread_messages_count <= 0) return;
    if (
      !isAssignedToMe &&
      conv.conversation_type !== "direct" &&
      conv.conversation_type !== "group"
    )
      return;
    if (isLoading || isFetchingMessages) return;
    if (firstPage.length === 0) return;
    if (document.hidden) return;

    if (markedAsReadRef.current.conversationId !== conv.numeric_id) {
      markedAsReadRef.current = {
        conversationId: conv.numeric_id,
        lastMessageIds: new Set(),
      };
    }

    const isAIAgentMessage = (msg: MessageResponse) =>
      msg.direction === "outbound" &&
      !msg.sent_by_user_id &&
      !msg.sent_by_contact_id;

    const isSentByMe = (msg: MessageResponse) =>
      !isAIAgentMessage(msg) &&
      (msg.direction === "outbound" ||
        (msg.sent_by_user_id != null &&
          Number(msg.sent_by_user_id) === currentUserId) ||
        (["user", "agent"].includes((msg.sender_type || "").toLowerCase()) &&
          msg.sender_id != null &&
          Number(msg.sender_id) === currentUserId));

    const unreadMessageIds = new Set<string | number>();
    firstPage.forEach((msg) => {
      if (msg.status !== "read" && !isSentByMe(msg)) {
        unreadMessageIds.add(msg.id);
      }
    });

    const hasNewUnreadMessages = Array.from(unreadMessageIds).some(
      (id) => !markedAsReadRef.current.lastMessageIds.has(id),
    );
    if (!hasNewUnreadMessages) return;

    unreadMessageIds.forEach((id) =>
      markedAsReadRef.current.lastMessageIds.add(id),
    );

    const lastMsg = firstPage.reduce((a, b) => (a.id > b.id ? a : b));
    const lastMessageSentByMe = isSentByMe(lastMsg);

    if (lastMessageSentByMe) {
      updateConversationInCache(queryClient, conv.id, (c) => ({
        ...c,
        unread_messages_count: 0,
      }));
    } else {
      markMessagesAsRead(conv.numeric_id);
    }

    const mediaTypes = ["image", "document", "file"];
    firstPage
      .filter((msg) => {
        if (!mediaTypes.includes(msg.message_type)) return false;
        if (msg.status === "read") return false;
        return !isSentByMe(msg);
      })
      .forEach((msg) => {
        messagesAPI.updateMessageStatus(msg.id, "read").catch(() => {});
      });
  }, [
    conv?.numeric_id,
    conv?.unread_messages_count,
    markMessagesAsRead,
    isAssignedToMe,
    conv?.conversation_type,
    currentUserId,
    isLoading,
    isFetchingMessages,
    firstPage,
    isTabVisible,
    conv?.id,
    queryClient,
  ]);
}
