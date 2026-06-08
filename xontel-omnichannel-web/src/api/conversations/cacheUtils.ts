import { QueryClient, InfiniteData } from "@tanstack/react-query";
import { AllConversations, ConversationResponse } from "./types";
import { Conversation } from "@/types/chat";

const INFINITE_KEY = ["conversations", "infinite"];

/**
 * Patch a single conversation across all infinite query pages.
 * Matches by numeric id or conversation_uuid.
 */
export function updateConversationInCache(
  queryClient: QueryClient,
  conversationId: string | number,
  updater: (conv: ConversationResponse) => ConversationResponse,
): void {
  queryClient.setQueriesData<InfiniteData<AllConversations>>(
    { queryKey: INFINITE_KEY, exact: false },
    (data) => {
      if (!data) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((conv) => {
            const matches =
              String(conv.id) === String(conversationId) ||
              conv.conversation_uuid === String(conversationId);
            return matches ? updater(conv) : conv;
          }),
        })),
      };
    },
  );

  // Synchronously update sidebar flat lists (groups and direct)
  const sidebarKeys = [
    ["sidebar-conversations-groups"],
    ["sidebar-conversations-direct"],
  ];
  for (const key of sidebarKeys) {
    queryClient.setQueriesData<AllConversations>(
      { queryKey: key, exact: false },
      (data) => {
        if (!data || !data.items) return data;
        return {
          ...data,
          items: data.items.map((conv) => {
            const matches =
              String(conv.id) === String(conversationId) ||
              conv.conversation_uuid === String(conversationId);
            return matches ? updater(conv) : conv;
          }),
        };
      },
    );
  }
}

/**
 * Insert or merge a conversation into the first page of all infinite caches.
 * Pinned conversations go before unpinned ones; others go to the first unpinned slot.
 */
export function addOrUpdateConversationInCache(
  queryClient: QueryClient,
  incoming: ConversationResponse,
): void {
  // 1. Update infinite query pages (bump updated conversations to page 0)
  queryClient.setQueriesData<InfiniteData<AllConversations>>(
    { queryKey: INFINITE_KEY, exact: false },
    (data) => {
      if (!data || !data.pages.length) return data;

      let existingConv: ConversationResponse | undefined = undefined;

      // Map pages and strip the conversation if it exists anywhere
      const cleanedPages = data.pages.map((page) => {
        const filteredItems = page.items.filter((c) => {
          const matches =
            String(c.id) === String(incoming.id) ||
            (incoming.conversation_uuid &&
              c.conversation_uuid === incoming.conversation_uuid);
          if (matches) {
            existingConv = c;
            return false;
          }
          return true;
        });
        return {
          ...page,
          items: filteredItems,
        };
      });

      // Merge existing conversation with incoming updates
      const merged = existingConv ? { ...(existingConv as any), ...incoming } : incoming;

      // Prepend to page 0
      const [first, ...rest] = cleanedPages;
      const items = [...first.items];
      const firstUnpinned = items.findIndex((c) => !c.pinned);
      const insertAt = merged.pinned
        ? 0
        : firstUnpinned === -1
          ? items.length
          : firstUnpinned;
      items.splice(insertAt, 0, merged);

      return {
        ...data,
        pages: [
          {
            ...first,
            items,
            total: first.total + (existingConv ? 0 : 1),
          },
          ...rest,
        ],
      };
    },
  );

  // 2. Synchronously update sidebar flat lists (groups or DMs)
  const sidebarKey =
    incoming.conversation_type === "group"
      ? ["sidebar-conversations-groups"]
      : ["sidebar-conversations-direct"];

  queryClient.setQueriesData<AllConversations>(
    { queryKey: sidebarKey, exact: false },
    (data) => {
      if (!data || !data.items) return data;

      let existingConv: ConversationResponse | undefined = undefined;

      // Filter out existing conversation if present in sidebar items
      const filteredItems = data.items.filter((c) => {
        const matches =
          String(c.id) === String(incoming.id) ||
          (incoming.conversation_uuid &&
            c.conversation_uuid === incoming.conversation_uuid);
        if (matches) {
          existingConv = c;
          return false;
        }
        return true;
      });

      const merged = existingConv ? { ...(existingConv as any), ...incoming } : incoming;

      // Prepend to list
      const items = [...filteredItems];
      const firstUnpinned = items.findIndex((c) => !c.pinned);
      const insertAt = merged.pinned
        ? 0
        : firstUnpinned === -1
          ? items.length
          : firstUnpinned;
      items.splice(insertAt, 0, merged);

      return {
        ...data,
        items,
        total: data.total + (existingConv ? 0 : 1),
      };
    },
  );
}

/**
 * Read all conversations currently in the infinite query cache.
 * Safe to call imperatively inside event handlers.
 */
export function getConversationsFromCache(
  queryClient: QueryClient,
): ConversationResponse[] {
  const allData = queryClient.getQueriesData<InfiniteData<AllConversations>>({
    queryKey: INFINITE_KEY,
    exact: false,
  });
  return allData.flatMap(([, data]) => data?.pages.flatMap((p) => p.items) ?? []);
}

export function isConversationClosed(conv: { status?: string | null }): boolean {
  return conv.status === "closed" || conv.status === "archived";
}

/**
 * Transform a server ConversationResponse into the local Conversation type
 * used by message-thread components.
 */
export function conversationResponseToLocal(c: ConversationResponse): Conversation {
  const raw = c as any;
  return {
    id: c.conversation_uuid,
    numeric_id: c.id,
    name: raw.contact_name || c.contact?.name || c.subject || String(c.id),
    avatar: raw.contact_avatar_url || c.contact?.avatar_url || c.avatar_url,
    phone: raw.contact_phone || c.contact?.phone,
    contact_name: raw.contact_name,
    contact_avatar_url: raw.contact_avatar_url,
    contact_phone: raw.contact_phone,
    contact_tags: raw.contact_tags,
    closed: isConversationClosed(c),
    blocked: c.status === "blocked",
    archived: c.status === "archived",
    pinned: c.pinned,
    unread_messages_count: c.unread_messages_count ?? 0,
    last_message_id: c.last_message_id ?? undefined,
    assigned_agent_id: c.assigned_agent_id ?? undefined,
    channel_id: c.channel_id ?? undefined,
    inbox_id: c.inbox_id ?? undefined,
    contact_id: c.contact_id ?? undefined,
    updated_at: c.updated_at,
    status: c.status,
    conversation_type: c.conversation_type as Conversation["conversation_type"],
    user_ids: c.user_ids,
    subject: c.subject,
  };
}
