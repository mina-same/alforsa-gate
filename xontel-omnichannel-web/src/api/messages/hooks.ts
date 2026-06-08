
import { useMutation, useQuery, UseQueryResult, useQueryClient, useQueries } from '@tanstack/react-query';
import { updateConversationInCache } from '@/api/conversations/cacheUtils';
import { messagesAPI } from './endpoints';
import type { MessageCreate, MessageResponse, MessageUpdate, MessagesListResponse, MessageType, MessageDirection } from './types';

export const useMessage = (messageId: number): UseQueryResult<MessageResponse, Error> => {
  const hasToken = !!localStorage.getItem('authToken');

  return useQuery({
    queryKey: ['messages', messageId],
    queryFn: () => messagesAPI.getMessage(messageId),
    enabled: hasToken && !!messageId,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useConversationMessages = (
  conversationId: number,
  params?: {
    skip?: number;
    limit?: number;
    message_type?: MessageType;
  }
): UseQueryResult<MessagesListResponse, Error> => {
  const hasToken = !!localStorage.getItem('authToken');

  return useQuery({
    queryKey: ['conversationMessages', conversationId, params],
    queryFn: () => messagesAPI.listConversationMessages(conversationId, params),
    enabled: hasToken && !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 min — WebSocket delivers live updates
    gcTime: 10 * 60 * 1000,   // keep cache 10 min for instant conversation revisits
    retry: 1,
  });
};

export const useCreateMessage = () => {
  const hasToken = !!localStorage.getItem('authToken');

  return useMutation({
    mutationFn: (data: MessageCreate) => messagesAPI.createMessage(data),
    retry: 1,
    ...(hasToken ? {} : { mutationFn: async () => Promise.reject(new Error('Not authenticated')) }),
  });
};

export const useDeleteMessage = () => {
  const hasToken = !!localStorage.getItem('authToken');

  return useMutation({
    mutationFn: (messageId: number) => messagesAPI.deleteMessage(messageId),
    retry: 1,
    ...(hasToken ? {} : { mutationFn: async () => Promise.reject(new Error('Not authenticated')) }),
  });
};

export const useUpdateMessage = () => {
  const hasToken = !!localStorage.getItem('authToken');

  return useMutation({
    mutationFn: ({ messageId, data }: { messageId: number; data: MessageUpdate }) =>
      messagesAPI.updateMessage(messageId, data),
    retry: 1,
    ...(hasToken ? {} : { mutationFn: async () => Promise.reject(new Error('Not authenticated')) }),
  });
};

export const useUpdateMessageStatus = () => {
  const hasToken = !!localStorage.getItem('authToken');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, status }: { messageId: number; status: string }) =>
      messagesAPI.updateMessageStatus(messageId, status),
    onSuccess: (updatedMessage) => {
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', updatedMessage.conversation_id] });
    },
    retry: 1,
    ...(hasToken ? {} : { mutationFn: async () => Promise.reject(new Error('Not authenticated')) }),
  });
};

export const useMarkMessagesAsRead = () => {
  const updateStatus = useUpdateMessageStatus();
  const queryClient = useQueryClient();

  const markAsRead = (messages: MessageResponse[] | undefined) => {
    if (!messages || messages.length === 0) return;

    const lastUnreadInbound = [...messages]
      .reverse()
      .find(m => m.direction === 'inbound' && m.status !== 'read');

    if (lastUnreadInbound) {
      updateStatus.mutate({ messageId: lastUnreadInbound.id, status: 'read' });
      updateConversationInCache(queryClient, lastUnreadInbound.conversation_id, (c) => ({
        ...c,
        unread_messages_count: 0,
      }));
    }
  };

  return { markAsRead, isPending: updateStatus.isPending };
};

/**
 * Fetch call messages from multiple conversations
 * Used to get all calls across conversations for the CallsList
 */
export interface CallMessage {
  id: number;
  message_uuid: string;
  conversation_id: number;
  content: string;
  direction: MessageDirection;
  status: string;
  created_at: string;
  sent_at: string;
  media_url?: string;
  additional_attributes?: string | Record<string, any>;
}

export interface CallFromConversation {
  id: string;
  status: 'incoming' | 'outgoing' | 'missed';
  type: 'audio' | 'video';
  time: string;
  duration?: string;
  conversationId: string;
  conversationName: string;
  conversationAvatar?: string;
}

/**
 * Hook to fetch call messages from all conversations
 * Maps message direction to call status (inbound -> incoming, outbound -> outgoing)
 */
export const useAllCallsFromConversations = (
  conversationIds: number[],
  options?: { limit?: number; userId?: number }
) => {
  const hasToken = !!localStorage.getItem('authToken');
  const limit = options?.limit ?? 50;
  const userId = options?.userId;

  const queries = useQueries({
    queries: conversationIds.map((conversationId) => ({
      queryKey: ['conversationCalls', conversationId, { limit }],
      queryFn: () =>
        messagesAPI.listConversationMessages(conversationId, {
          message_type: 'calls' as MessageType,
          limit,
        }),
      enabled: hasToken && !!conversationId,
      staleTime: 30 * 1000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  // Flatten and transform all call messages
  const allCalls: CallFromConversation[] = queries
    .filter((q) => q.data?.items)
    .flatMap((q, index) => {
      const conversationId = conversationIds[index];
      const messages = q.data?.items || [];

      return messages
        .filter((message: MessageResponse) =>
          userId == null || Number(message.sent_by_user_id) === Number(userId)
        )
        .map((message: MessageResponse): CallFromConversation => {
        // Determine call status based on direction and message status
        // Missed calls are inbound calls that failed or have no duration
        let callStatus: 'incoming' | 'outgoing' | 'missed';

        if (message.direction === 'outbound') {
          callStatus = 'outgoing';
        } else if (message.direction === 'inbound') {
          // Check if call was missed (failed status, pending status, or no duration)
          const isMissed =
            message.status === 'failed' ||
            message.status === 'pending' ||
            !message.content ||
            message.content === '0' ||
            message.content === '00:00';
          callStatus = isMissed ? 'missed' : 'incoming';
        } else {
          callStatus = 'missed';
        }

        // Determine call type from additional_attributes or default to audio
        let callType: 'audio' | 'video' = 'audio';
        if (message.additional_attributes) {
          try {
            const attrs =
              typeof message.additional_attributes === 'string'
                ? JSON.parse(message.additional_attributes)
                : message.additional_attributes;
            if (attrs?.call_type === 'video') {
              callType = 'video';
            }
          } catch {
            // Ignore parse errors, default to audio
          }
        }

        return {
          id: String(message.id),
          status: callStatus,
          type: callType,
          time: message.created_at,
          duration: message.content, // Call duration stored in content
          conversationId: String(conversationId),
          conversationName: '', // Will be filled by parent component
          conversationAvatar: undefined,
        };
      });
    });

  // Sort by time descending (newest first)
  const sortedCalls = allCalls.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return {
    calls: sortedCalls,
    isLoading,
    isError,
    queries,
  };
};

