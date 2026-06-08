import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@components/ui/button";
import type { Conversation } from "@/types/chat";
import type { UserResponse } from "@/api/users/types";
import { useAssignConversation } from "@/api/conversations/hooks";
import { useSetAuthUser } from "@/contexts/AuthContext";
import { updateConversationInCache } from "@/api/conversations/cacheUtils";

interface ConversationStatusBarProps {
  conv: Conversation;
  isAssignedToMe: boolean;
  isContactBlocked: boolean;
  isInternalConversation: boolean;
  isWaitingForWhatsAppAcceptance: boolean;
  hasReachedMaxChats: boolean;
  currentUserId: number | undefined;
  userData: UserResponse;
}

export default function ConversationStatusBar({
  conv,
  isAssignedToMe,
  isContactBlocked,
  isInternalConversation,
  isWaitingForWhatsAppAcceptance,
  hasReachedMaxChats,
  currentUserId,
  userData,
}: ConversationStatusBarProps): React.ReactElement | null {
  const queryClient = useQueryClient();
  const setAuthUser = useSetAuthUser();
  const { mutate: assignConversation, isPending: isAssigning } =
    useAssignConversation();

  const handleAssignToMe = () => {
    if (!conv?.numeric_id || !currentUserId) return;
    if (hasReachedMaxChats) return;
    assignConversation(
      { conversationId: conv.numeric_id, agentId: Number(currentUserId) },
      {
        onSuccess: () => {
          updateConversationInCache(queryClient, conv.id, (c) => ({
            ...c,
            assigned_agent_id: Number(currentUserId),
          }));

          const numericUserId = Number(currentUserId);
          if (Number.isFinite(numericUserId) && numericUserId > 0) {
            const apply = (obj: any) => {
              if (!obj) return obj;
              const prev =
                obj.current_chat_count != null
                  ? Number(obj.current_chat_count)
                  : 0;
              const base = Number.isFinite(prev) && prev >= 0 ? prev : 0;
              return { ...obj, current_chat_count: base + 1 };
            };

            queryClient.setQueryData(["users", numericUserId], (prev: any) =>
              apply(prev),
            );
            queryClient.invalidateQueries({
              queryKey: ["users", numericUserId],
            });

            try {
              const updatedUser = apply(userData);
              if (updatedUser) {
                setAuthUser(updatedUser);
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                localStorage.setItem("userProfile", JSON.stringify(updatedUser));
              }
            } catch {}
          }
        },
      },
    );
  };

  if (isWaitingForWhatsAppAcceptance) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 p-4 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
          Waiting for the contact to accept the conversation. You can only send
          free-form messages after they reply.
        </p>
      </div>
    );
  }

  if (!isContactBlocked && conv.closed) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 p-4 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          This conversation is closed. You cannot send or delete messages.
        </p>
      </div>
    );
  }

  if (
    !isContactBlocked &&
    !isInternalConversation &&
    !conv.closed &&
    !conv.assigned_agent_id &&
    conv.inbox_id != null
  ) {
    if (hasReachedMaxChats) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            You have reached the maximum number of assigned conversations.
          </p>
        </div>
      );
    }
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 p-4 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          This conversation isn't assigned to you yet. Assign it to yourself to
          reply.
        </p>
        <Button
          size="sm"
          variant="default"
          onClick={handleAssignToMe}
          className="text-white"
          disabled={isAssigning}
        >
          {isAssigning ? "Assigning…" : "Assign to me"}
        </Button>
      </div>
    );
  }

  if (
    !isContactBlocked &&
    !isInternalConversation &&
    !conv.closed &&
    conv.assigned_agent_id &&
    conv.inbox_id != null &&
    !isAssignedToMe
  ) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 p-4 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          This conversation is assigned to another agent. You don't have
          permission to reply.
        </p>
      </div>
    );
  }

  if (isContactBlocked) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4 text-center">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          This conversation is blocked. You cannot send messages.
        </p>
      </div>
    );
  }

  return null;
}
