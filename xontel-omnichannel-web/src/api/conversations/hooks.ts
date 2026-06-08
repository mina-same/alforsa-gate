import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { conversationsAPI } from "./endpoints";
import {
  ConversationResponse,
  ConversationSnooze,
  ConversationBulkAction,
  ConversationNoteCreate,
  ConversationNote,
  ConversationMediaItem,
  GetConversationsParams,
  CreateGroupConversationParams,
  CreateDirectConversationParams,
  AllConversations,
} from "./types";

import { updateConversationInCache } from "./cacheUtils";
import { useUIState } from "@/contexts/UIContext";
import { useAuthUser } from "@/contexts/AuthContext";

/**
 * Conversations API Hooks using React Query
 */

/**
 * List conversations
 */
export const useConversations = (
  params?: GetConversationsParams,
): UseQueryResult<AllConversations, Error> => {
  // Check for 'authToken' as the single source of truth
  const hasToken = !!localStorage.getItem("authToken");
  const uiState = useUIState();
  const activeInboxId = uiState.activeInboxId;
  const DEBUG_CONVERSATIONS_LOGS =
    import.meta.env.DEV &&
    import.meta.env.VITE_DEBUG_CONVERSATIONS_LOGS === "true";

  // Find the channel_id for the active inbox
  const inboxesData = JSON.parse(localStorage.getItem("userInboxes") || "null");
  const inboxes = inboxesData?.items || inboxesData || [];
  const activeInbox = inboxes.find(
    (i: any) => Number(i.id) === Number(activeInboxId),
  );
  const channelId = activeInbox?.channel_id;

  if (DEBUG_CONVERSATIONS_LOGS) {
    console.log(
      "📱 Active Inbox:",
      activeInboxId,
      "ChannelID Found:",
      channelId,
      "Total Inboxes:",
      inboxes.length,
    );
  }

  // Get current user ID for filtering by assigned agent
  const currentUserId = useAuthUser().id;

  // Add default pagination and filtering parameters
  const queryParams = {
    skip: 0,
    limit: 50,
    inbox_id: activeInboxId || undefined,
    channel_id: channelId || undefined,
    assigned_agent_id: currentUserId || undefined,
    ...params,
  };

  const shouldEnable = hasToken && !!activeInboxId && !!channelId;

  const query = useQuery({
    queryKey: ["conversations", queryParams, activeInboxId, channelId],
    queryFn: async () => {
      if (DEBUG_CONVERSATIONS_LOGS) {
        console.log(
          "📡 Sending request to listConversations with:",
          queryParams,
        );
      }
      const result = await conversationsAPI.listConversations(queryParams);
      if (DEBUG_CONVERSATIONS_LOGS) {
        // console.log("✅ Received conversations:", result?.conversations?.length || 0);
      }
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Retry once on failure
    enabled: shouldEnable, // Only fetch if authenticated AND an active inbox/channel are selected
  });

  // Log errors
  if (query.error) {
    console.error("✗ Failed to fetch conversations:", query.error);
  }

  return query;
};

/**
 * List conversations with pagination (infinite query)
 */
export const useInfiniteConversations = (
  params?: GetConversationsParams,
  options?: { enabled?: boolean },
) => {
  const hasToken = !!localStorage.getItem("authToken");
  const uiState = useUIState();
  const activeInboxId = uiState.activeInboxId;
  const DEBUG_CONVERSATIONS_LOGS =
    import.meta.env.DEV &&
    import.meta.env.VITE_DEBUG_CONVERSATIONS_LOGS === "true";

  // Find the channel_id for the active inbox
  const inboxesData = JSON.parse(localStorage.getItem("userInboxes") || "null");
  const inboxes = inboxesData?.items || inboxesData || [];
  const activeInbox = inboxes.find(
    (i: any) => Number(i.id) === Number(activeInboxId),
  );
  const channelId = activeInbox?.channel_id;

  const limit = params?.limit || 20;

  return useInfiniteQuery({
    queryKey: ["conversations", "infinite", {
      ...params,
      inbox_id: params?.hasOwnProperty('inbox_id') ? params.inbox_id : activeInboxId,
      channel_id: params?.hasOwnProperty('channel_id') ? params.channel_id : channelId,
      // Use exact value from params — undefined means "no agent filter", a number means "filter by that agent"
      assigned_agent_id: params?.hasOwnProperty('assigned_agent_id') ? params.assigned_agent_id : undefined,
    }],
    queryFn: async ({ pageParam = 0 }) => {
      const queryParams = {
        ...params,  // spread first so explicit overrides below always win
        skip: pageParam as number,
        limit,
        inbox_id: params?.hasOwnProperty('inbox_id') ? params.inbox_id : (activeInboxId || undefined),
        channel_id: params?.hasOwnProperty('channel_id') ? params.channel_id : (channelId || undefined),
        // Only inject currentUserId when the caller didn't specify assigned_agent_id at all.
        // If the caller explicitly passes assigned_agent_id: undefined, respect it (no agent filter).
        assigned_agent_id: params?.hasOwnProperty('assigned_agent_id') ? params.assigned_agent_id : undefined,
      };

      if (DEBUG_CONVERSATIONS_LOGS) {
        console.log(
          "📡 Sending request to listConversations (Infinite) with:",
          queryParams,
        );
      }
      const result = await conversationsAPI.listConversations(queryParams);
      if (DEBUG_CONVERSATIONS_LOGS) {
        // console.log("✅ Received conversations (Infinite):", result?.conversations?.length || 0);
      }
      return result;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.items.length < lastPage.size || lastPage.page >= lastPage.pages - 1) {
        return undefined;
      }
      return (lastPage.page + 1) * lastPage.size;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled:
      (options?.enabled !== false) &&
      hasToken &&
      (!!activeInboxId || !!channelId || !!params?.status || !!params?.contact_name || !!params?.contact_phone),
  });
};

/**
 * Get single conversation
 */
export const useConversation = (
  conversationId: number,
): UseQueryResult<ConversationResponse, Error> => {
  return useQuery({
    queryKey: ["conversations", conversationId],
    queryFn: () => conversationsAPI.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useConversationMedia = (
  conversationId: number,
  mediaType?: string,
  enabled: boolean = true,
): UseQueryResult<ConversationMediaItem[], Error> => {
  return useQuery({
    queryKey: ["conversations", conversationId, "media", mediaType],
    queryFn: async () => {
      const response = await conversationsAPI.getConversationMedia(conversationId, mediaType);
      return response.items || [];
    },
    enabled: enabled && !!conversationId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Assign conversation
 */
export const useAssignConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      agentId,
    }: {
      conversationId: number;
      agentId: number;
    }) => conversationsAPI.assignConversation(conversationId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

/**
 * Unassign agent from conversation
 */
export const useUnassignConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) =>
      conversationsAPI.unassignConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

/**
 * Close conversation
 */
export const useCloseConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) =>
      conversationsAPI.closeConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

/**
 * Snooze conversation
 */
export const useSnoozeConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: number;
      data: ConversationSnooze;
    }) => conversationsAPI.snoozeConversation(conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

/**
 * Unsnooze conversation
 */
export const useUnsnoozeConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) =>
      conversationsAPI.unsnoozeConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const usePinConversation = () => {
  return useMutation({
    mutationFn: (conversationId: number) =>
      conversationsAPI.pinConversation(conversationId),
  });
};

export const useUnpinConversation = () => {
  return useMutation({
    mutationFn: (conversationId: number) =>
      conversationsAPI.unpinConversation(conversationId),
  });
};

/**
 * Bulk action on conversations
 */
export const useBulkAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConversationBulkAction) =>
      conversationsAPI.bulkAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

/**
 * Create note on conversation
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: number;
      data: ConversationNoteCreate;
    }) => conversationsAPI.createNote(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId, "notes"],
      });
    },
  });
};

/**
 * Get notes for conversation
 */
export const useNotes = (
  conversationId: number,
): UseQueryResult<ConversationNote[], Error> => {
  return useQuery({
    queryKey: ["conversations", conversationId, "notes"],
    queryFn: () => conversationsAPI.getNotes(conversationId),
    enabled: !!conversationId && conversationId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Delete note
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: number) => conversationsAPI.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
export const useConversationSuggestions = (conversationId: number) => {
  return useQuery({
    queryKey: ["conversationSuggestions", conversationId],
    queryFn: () => conversationsAPI.getConversationSuggestions(conversationId),
    enabled: !!conversationId,
  });
};

/**
 * Mark conversation messages as read
 */
export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: number) =>
      conversationsAPI.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      updateConversationInCache(queryClient, conversationId, (c) => ({
        ...c,
        unread_messages_count: 0,
        last_message: c.last_message
          ? { ...c.last_message, status: "read" }
          : c.last_message,
      }));
    },
  });
};

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupConversationParams) =>
      conversationsAPI.createGroupConversation(data),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate specific inbox query too if needed
      if (newConversation.inbox_id) {
        queryClient.invalidateQueries({
          queryKey: ["conversations", { inbox_id: newConversation.inbox_id }],
        });
      }
    },
  });
};

export const useCreateDirectConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDirectConversationParams) =>
      conversationsAPI.createDirectConversation(data),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (newConversation.inbox_id) {
        queryClient.invalidateQueries({
          queryKey: ["conversations", { inbox_id: newConversation.inbox_id }],
        });
      }
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: number;
      data: any;
    }) => conversationsAPI.updateConversation(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId],
      });
    },
  });
};

/**
 * Flat list of all conversations from the active infinite query cache.
 * Drop-in replacement for useSelector(s => s.conversations.items).
 */
export function useConversationItems() {
  const result = useInfiniteConversations();
  return useMemo(
    () => result.data?.pages.flatMap((p) => p.items) ?? [],
    [result.data],
  );
}
