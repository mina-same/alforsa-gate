import React, { useState, useEffect, useRef, useMemo } from "react";
import type { Conversation, Message } from "@/types/chat";
import type { MessageResponse } from "@/api/messages/types";
import { useConversationMessages } from "@/api/messages/hooks";
import { messagesAPI } from "@/api/messages/endpoints";
import { MapMessages } from "./useMapMessage";

const PAGE_SIZE = 50;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface UseMessagePaginationInput {
  conv: Conversation;
  currentConvId: string | null;
  authorizedConvId: number | null;
  currentUserContactId: number | undefined;
  currentUserId: number | undefined;
  onConversationLoad?: () => void;
}

export interface UseMessagePaginationReturn {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  firstPage: MessageResponse[];
  isLoading: boolean;
  isFetchingMessages: boolean;
  isFetching: boolean;
  hasMore: boolean;
  skip: number;
  setSkip: React.Dispatch<React.SetStateAction<number>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  prevScrollTopRef: React.MutableRefObject<number | null>;
  fetchMessagesPage: (conversationId: number, skip: number) => Promise<MessageResponse[]>;
  ensureMessageLoadedAndScroll: (messageId: string) => Promise<void>;
  ensureMessageLoadedAndScrollByNumericId: (numericId: number) => Promise<void>;
  flashHighlight: (messageId: string) => void;
  clearHighlight: () => void;
  highlightedMessageId: string | null;
  pinnedMessages: Message[];
  lastMessageId: string;
}

export function useMessagePagination({
  conv,
  currentConvId,
  authorizedConvId,
  currentUserContactId,
  currentUserId,
  onConversationLoad,
}: UseMessagePaginationInput): UseMessagePaginationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  const skipInitializedRef = useRef(false);
  const prevScrollTopRef = useRef<number | null>(null);
  const lastIncrementalFirstPageKeyRef = useRef<string>("");

  const conversationId =
    conv?.numeric_id || (currentConvId ? parseInt(currentConvId, 10) : 0);

  const {
    data: firstPageData,
    isLoading,
    isFetching: isFetchingMessages,
  } = useConversationMessages(
    authorizedConvId === conversationId ? conversationId || 0 : 0,
    { skip: 0, limit: PAGE_SIZE },
  );
  const firstPage = firstPageData?.items || [];

  const mappedFirstPage = useMemo(
    () =>
      firstPage.length > 0
        ? MapMessages(currentUserContactId ?? 0, currentUserId, firstPage, [])
        : [],
    [firstPage, currentUserContactId, currentUserId],
  );

  const firstPageStatusHash = useMemo(
    () =>
      firstPage.length > 0
        ? firstPage
            .map((m: any) => `${m.status || ""}:${m.media_url || ""}:${JSON.stringify(m.additional_attributes ?? "")}`)
            .join("|")
        : "",
    [firstPage],
  );
  const firstPageKey =
    firstPage.length > 0
      ? `${(firstPage as any)[0]?.id ?? ""}-${(firstPage as any)[firstPage.length - 1]?.id ?? ""}-${firstPage.length}-${firstPageStatusHash}`
      : "empty";

  const pinnedMessages = useMemo(() => {
    return messages.filter((m) => {
      const a = (m as any).additional_attributes;
      if (!a) return false;
      const parsed =
        typeof a === "string"
          ? (() => { try { return JSON.parse(a); } catch { return {}; } })()
          : a;
      return !!parsed?.isPinned;
    });
  }, [messages]);

  const lastMessageId = messages.length
    ? String(messages[messages.length - 1]?.id ?? "")
    : "";

  // Reset everything when conversation changes
  useEffect(() => {
    prevScrollTopRef.current = null;
    skipInitializedRef.current = false;
    lastIncrementalFirstPageKeyRef.current = "";
    // Keep old messages visible until new conversation's messages arrive —
    // avoids skeleton flash for cached conversations.
    setSkip(0);
    setHasMore(true);
    setIsFetching(false);
  }, [conv?.id]);

  // Initial load
  useEffect(() => {
    const DEBUG_MESSAGES_LOGS =
      import.meta.env.DEV &&
      import.meta.env.VITE_DEBUG_MESSAGES_LOGS === "true";
    if (!firstPage || !conv?.id || !currentConvId) {
      if (DEBUG_MESSAGES_LOGS)
        console.log("🔌 Skipping initial load - no conversation");
      return;
    }
    if (skipInitializedRef.current) return;

    if (DEBUG_MESSAGES_LOGS) {
      console.log(
        "🔌 Initial load useEffect running, firstPage length:",
        firstPage.length,
        currentConvId,
      );
    }

    const mapped = mappedFirstPage;

    setMessages(mapped);

    onConversationLoad?.();
    skipInitializedRef.current = true;
    lastIncrementalFirstPageKeyRef.current = firstPageKey;
    setSkip(firstPage.length);
    setHasMore(firstPage.length === PAGE_SIZE);
  }, [currentConvId, conv?.id, firstPageKey]);

  // After initial load, sync React Query first-page updates (WS-driven cache changes)
  // into local messages state without re-ordering paginated history.
  useEffect(() => {
    if (!skipInitializedRef.current) return;
    if (lastIncrementalFirstPageKeyRef.current === firstPageKey) return;
    lastIncrementalFirstPageKeyRef.current = firstPageKey;
    if (mappedFirstPage.length === 0) return;

    setMessages((prev) => {
      const merged = [...prev];
      let hasChanges = false;

      const getKey = (msg: Message) =>
        typeof msg.numericId === "number" ? String(msg.numericId) : String(msg.id);

      mappedFirstPage.forEach((newMsg) => {
        const newKey = getKey(newMsg);
        const idx = merged.findIndex((m) => getKey(m) === newKey);

        if (idx >= 0) {
          const prevMsg = merged[idx];
          const isUpdated =
            prevMsg.status !== newMsg.status ||
            prevMsg.media?.url !== newMsg.media?.url ||
            prevMsg.text !== newMsg.text ||
            JSON.stringify(prevMsg.reactions) !== JSON.stringify(newMsg.reactions) ||
            JSON.stringify(prevMsg.additional_attributes) !== JSON.stringify(newMsg.additional_attributes);

          if (isUpdated) {
            merged[idx] = {
              ...newMsg,
              replyTo: newMsg.replyTo?.text ? newMsg.replyTo : (prevMsg.replyTo ?? newMsg.replyTo),
              isDraft: prevMsg.isDraft ?? newMsg.isDraft,
              audioBlob: prevMsg.audioBlob ?? newMsg.audioBlob,
              media: newMsg.media ?? prevMsg.media,
              mediaPending: newMsg.mediaPending ?? prevMsg.mediaPending,
            };
            hasChanges = true;
          }
        } else {
          const isOutbound = newMsg.senderId === "me" || newMsg.direction === "outbound";
          let optimisticMatchIdx = -1;

          if (isOutbound) {
            optimisticMatchIdx = merged.findIndex((m) => {
              if (!m.id.startsWith("local-")) return false;
              if (m.message_type !== newMsg.message_type) return false;
              if (m.text && newMsg.text && m.text === newMsg.text && (!m.media || m.media.type === newMsg.media?.type)) return true;
              const om = m.media;
              const nm = newMsg.media;
              if (!om || !nm) return false;
              const isOptimistic = m.mediaPending || om.url?.startsWith("blob:") || !om.url;
              const isFinal = !!nm.url && !nm.url.startsWith("blob:");
              if (!isOptimistic || !isFinal) return false;
              return om.type === nm.type || om.name === nm.name || m.message_type === newMsg.message_type;
            });
          }

          if (optimisticMatchIdx >= 0) {
            merged[optimisticMatchIdx] = {
              ...newMsg,
              replyTo: newMsg.replyTo?.text ? newMsg.replyTo : merged[optimisticMatchIdx].replyTo,
              isDraft: merged[optimisticMatchIdx].isDraft ?? newMsg.isDraft,
              audioBlob: merged[optimisticMatchIdx].audioBlob ?? newMsg.audioBlob,
              media: newMsg.media ?? merged[optimisticMatchIdx].media,
              mediaPending: newMsg.mediaPending ?? merged[optimisticMatchIdx].mediaPending,
            };
          } else {
            merged.push(newMsg);
          }
          hasChanges = true;
        }
      });

      // Apply reactions from firstPage that target messages in older (non-firstPage) pages.
      const firstPageNumericIds = new Set(
        mappedFirstPage
          .filter((m) => typeof m.numericId === "number")
          .map((m) => m.numericId as number),
      );
      const rawReactions = (firstPage as any[]).filter((m) =>
        String(m.message_type || "").toLowerCase().includes("reaction"),
      );
      for (const reactionItem of rawReactions) {
        const targetNumericId = reactionItem.reply_to_message_id as number | undefined;
        if (!targetNumericId || firstPageNumericIds.has(targetNumericId)) continue;

        const targetIdx = merged.findIndex(
          (m) => typeof m.numericId === "number" && m.numericId === targetNumericId,
        );
        if (targetIdx < 0) continue;

        const target = merged[targetIdx];
        const reactorId = String(
          reactionItem.sent_by_user_id || reactionItem.sent_by_contact_id || "",
        );
        const reactorType: "user" | "contact" = reactionItem.sent_by_user_id ? "user" : "contact";
        const incomingTs = reactionItem.created_at
          ? new Date(reactionItem.created_at).getTime()
          : 0;

        const updatedReactions = Array.isArray(target.reactions)
          ? [...target.reactions]
          : [];
        const existingIdx = updatedReactions.findIndex(
          (r) => r.reactorId === reactorId && r.reactorType === reactorType,
        );

        if (existingIdx >= 0) {
          const existingTs = (updatedReactions[existingIdx] as any).createdAt
            ? new Date((updatedReactions[existingIdx] as any).createdAt).getTime()
            : 0;
          if (incomingTs <= existingTs) continue;
          updatedReactions.splice(existingIdx, 1);
        }

        const isMe = String(reactionItem.sent_by_user_id) === String(currentUserId);
        updatedReactions.push({
          emoji: reactionItem.content,
          isMine: isMe,
          numericId: reactionItem.id,
          reactorId,
          reactorType,
          createdAt: reactionItem.created_at,
          userName: reactionItem.user_name || (isMe ? "You" : undefined),
        });

        if (JSON.stringify(target.reactions) !== JSON.stringify(updatedReactions)) {
          merged[targetIdx] = { ...target, reactions: updatedReactions };
          hasChanges = true;
        }
      }

      return hasChanges ? merged : prev;
    });
  }, [firstPageKey, conv?.id, mappedFirstPage, currentUserId, firstPage]);

  const fetchMessagesPage = async (
    conversationId: number,
    skip: number,
  ): Promise<MessageResponse[]> => {
    if (!conversationId) return [];
    const response = await messagesAPI.listConversationMessages(conversationId, {
      skip,
      limit: PAGE_SIZE,
    });
    return response.items || [];
  };

  const flashHighlight = (messageId: string) => {
    setHighlightedMessageId(messageId);
    window.setTimeout(() => {
      setHighlightedMessageId((prev) => (prev === messageId ? null : prev));
    }, 1200);
  };

  const clearHighlight = () => setHighlightedMessageId(null);

  const ensureMessageLoadedAndScroll = async (messageId: string) => {
    flashHighlight(messageId);

    const existing = document.getElementById(`message-${messageId}`);
    if (existing) {
      existing.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!conv?.numeric_id) return;
    if (isFetching) return;

    setIsFetching(true);
    try {
      let localSkip = skip;
      let localHasMore = hasMore;
      let attempts = 0;
      const maxAttempts = 60;

      while (attempts < maxAttempts && localHasMore) {
        const nextPage = await fetchMessagesPage(conv.numeric_id, localSkip);
        if (!nextPage || nextPage.length === 0) {
          localHasMore = false;
          setHasMore(false);
          break;
        }

        const mapped = MapMessages(
          currentUserContactId ?? 0,
          currentUserId,
          nextPage,
          messages,
        );
        setMessages((prev) => [...mapped, ...prev]);

        localSkip += nextPage.length;
        setSkip(localSkip);

        localHasMore = nextPage.length === PAGE_SIZE;
        setHasMore(localHasMore);

        await sleep(40);

        const el = document.getElementById(`message-${messageId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        attempts += 1;
      }
    } finally {
      setIsFetching(false);
    }
  };

  const ensureMessageLoadedAndScrollByNumericId = async (numericId: number) => {
    const existingLocal = messages.find(
      (m) => typeof m.numericId === "number" && m.numericId === numericId,
    );
    if (existingLocal) {
      await ensureMessageLoadedAndScroll(existingLocal.id);
      return;
    }

    if (!conv?.numeric_id) return;
    if (isFetching) return;

    setIsFetching(true);
    try {
      let localSkip = skip;
      let localHasMore = hasMore;
      let attempts = 0;
      const maxAttempts = 60;

      while (attempts < maxAttempts && localHasMore) {
        const nextPage = await fetchMessagesPage(conv.numeric_id, localSkip);
        if (!nextPage || nextPage.length === 0) {
          localHasMore = false;
          setHasMore(false);
          break;
        }

        const found = nextPage.find((m) => (m as any).id === numericId);
        const foundUuid = (found as any)?.message_uuid as string | undefined;

        const mapped = MapMessages(
          currentUserContactId ?? 0,
          currentUserId,
          nextPage,
          messages,
        );
        setMessages((prev) => [...mapped, ...prev]);

        localSkip += nextPage.length;
        setSkip(localSkip);
        localHasMore = nextPage.length === PAGE_SIZE;
        setHasMore(localHasMore);

        await sleep(40);

        if (foundUuid) {
          flashHighlight(foundUuid);
          const el = document.getElementById(`message-${foundUuid}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }

        attempts += 1;
      }
    } finally {
      setIsFetching(false);
    }
  };

  // Keep refs to the latest versions of these async functions so the event
  // listener below can call them without being re-registered on every state change.
  const ensureMessageLoadedAndScrollRef = useRef(ensureMessageLoadedAndScroll);
  ensureMessageLoadedAndScrollRef.current = ensureMessageLoadedAndScroll;
  const ensureMessageLoadedAndScrollByNumericIdRef = useRef(ensureMessageLoadedAndScrollByNumericId);
  ensureMessageLoadedAndScrollByNumericIdRef.current = ensureMessageLoadedAndScrollByNumericId;

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as
        | { messageId?: string; numericId?: number }
        | undefined;

      const messageId = detail?.messageId;
      const numericId = detail?.numericId;

      if (typeof messageId === "string" && messageId.trim()) {
        ensureMessageLoadedAndScrollRef.current(messageId);
        return;
      }

      if (typeof numericId === "number" && Number.isFinite(numericId)) {
        ensureMessageLoadedAndScrollByNumericIdRef.current(numericId);
      }
    };

    window.addEventListener("jump-to-message", handler as EventListener);
    return () =>
      window.removeEventListener("jump-to-message", handler as EventListener);
  }, []); // stable — refs keep the handler current without re-registration

  return {
    messages,
    setMessages,
    firstPage,
    isLoading,
    isFetchingMessages,
    isFetching,
    hasMore,
    skip,
    setSkip,
    setHasMore,
    setIsFetching,
    prevScrollTopRef,
    fetchMessagesPage,
    ensureMessageLoadedAndScroll,
    ensureMessageLoadedAndScrollByNumericId,
    flashHighlight,
    clearHighlight,
    highlightedMessageId,
    pinnedMessages,
    lastMessageId,
  };
}
