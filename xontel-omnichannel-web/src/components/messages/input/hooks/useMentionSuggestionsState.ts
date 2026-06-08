import { useState } from "react";
import { useInboxMembers } from "@/api/inboxes/hooks";
import { usersAPI } from "@/api/users/endpoints";
import { useQueries } from "@tanstack/react-query";

interface Options {
  isInternalConversation: boolean;
  conversationType?: string;
  inboxId?: number | null;
  participantUserIds?: number[];
  currentUserId?: number;
}

export function useMentionSuggestionsState({
  isInternalConversation,
  conversationType,
  inboxId,
  participantUserIds,
  currentUserId,
}: Options) {
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);

  const isGroupConv = conversationType === "group";
  const isDirectConv = conversationType === "direct";
  const useInboxForMentions = isInternalConversation && !isGroupConv && !isDirectConv;

  const { data: inboxMembersData, isLoading: isLoadingMembers, error: inboxMembersError } = useInboxMembers(
    useInboxForMentions ? (inboxId || 0) : 0
  );
  const inboxMembers = inboxMembersData?.items || [];

  const groupMemberQueries = useQueries({
    queries: ((isGroupConv || isDirectConv) ? (participantUserIds || []) : []).map((userId: number) => ({
      queryKey: ["users", userId],
      queryFn: () => usersAPI.getUser(userId),
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const memberUserQueries = useQueries({
    queries: (useInboxForMentions ? inboxMembers : []).map((m: any) => {
      const userId = m?.user_id ?? m?.id;
      const alreadyHasUserData = !!(m?.full_name || m?.email || m?.avatar_url);
      return {
        queryKey: ["users", userId],
        queryFn: () => usersAPI.getUser(userId),
        enabled: !!userId && !alreadyHasUserData,
        staleTime: 5 * 60 * 1000,
      };
    }),
  });

  const isMentionLoading =
    isGroupConv || isDirectConv
      ? groupMemberQueries.some((q: any) => q.isLoading)
      : isLoadingMembers || memberUserQueries.some((q: any) => q.isLoading);

  const mentionEntries: { id: number | undefined; full_name: string; email?: string; avatar_url?: string }[] =
    isDirectConv
      ? (participantUserIds || [])
          .map((userId: number, idx: number) => {
            const userData = groupMemberQueries[idx]?.data as any;
            return {
              id: userId,
              full_name: userData?.full_name || `User ${userId}`,
              email: userData?.email,
              avatar_url: userData?.avatar_url,
            };
          })
          .filter((u) => u.id !== currentUserId)
      : isGroupConv
        ? (participantUserIds || [])
            .map((userId: number, idx: number) => {
              const userData = groupMemberQueries[idx]?.data as any;
              return {
                id: userId,
                full_name: userData?.full_name || `User ${userId}`,
                email: userData?.email,
                avatar_url: userData?.avatar_url,
              };
            })
            .sort((a, b) => String(a.full_name).localeCompare(String(b.full_name)))
        : (isInternalConversation ? inboxMembers : [])
            .map((m: any, idx: number) => {
              const resolved = memberUserQueries[idx]?.data as any;
              const userId = m?.user_id ?? m?.id;
              return {
                id: userId,
                full_name: m?.full_name || resolved?.full_name || `User ${userId}`,
                email: m?.email || resolved?.email,
                avatar_url: m?.avatar_url || resolved?.avatar_url,
              };
            })
            .filter((u) => u.id != null)
            .sort((a, b) => String(a.full_name || "").localeCompare(String(b.full_name || "")));

  const filteredMentionUsers = mentionEntries.filter((u: any) => {
    const q = mentionQuery.toLowerCase();
    if (!q) return true;
    return (
      String(u.full_name || "").toLowerCase().includes(q) ||
      String(u.email || "").toLowerCase().includes(q)
    );
  });

  const openWithQuery = (query: string) => {
    setMentionQuery(query);
    setShowMentionSuggestions(true);
    setMentionSelectedIndex(0);
  };

  return {
    showMentionSuggestions,
    setShowMentionSuggestions,
    mentionQuery,
    mentionSelectedIndex,
    setMentionSelectedIndex,
    filteredMentionUsers,
    isMentionLoading,
    inboxMembersError,
    inboxMembersCount: inboxMembers.length,
    openWithQuery,
  };
}
