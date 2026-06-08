import { useQuery } from "@tanstack/react-query";
import { messagesAPI } from "@/api/messages/endpoints";
import { useAuthUser } from "@/contexts/AuthContext";

/**
 * Fetches the last message of a conversation by ID and returns whether
 * it was sent by the current user. Only fires when unread_messages_count > 0
 * and a last_message_id is available (direct/group convs don't embed last_message).
 */
export function useLastMessageSentByMe(
  lastMessageId: number | null | undefined,
  unreadCount: number | null | undefined,
) {
  const authUser = useAuthUser();
  const n = Number(authUser.id);
  const currentUserId = Number.isFinite(n) && n > 0 ? n : undefined;

  const { data: lastMsg } = useQuery({
    queryKey: ["message", lastMessageId],
    queryFn: () => messagesAPI.getMessage(lastMessageId!),
    enabled: !!lastMessageId && Number(unreadCount) > 0 && !!currentUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (!lastMsg || !currentUserId) return false;

  return (
    lastMsg.direction === "outbound" ||
    (lastMsg.sent_by_user_id != null &&
      Number(lastMsg.sent_by_user_id) === currentUserId) ||
    (["user", "agent"].includes((lastMsg.sender_type || "").toLowerCase()) &&
      lastMsg.sender_id != null &&
      Number(lastMsg.sender_id) === currentUserId)
  );
}
