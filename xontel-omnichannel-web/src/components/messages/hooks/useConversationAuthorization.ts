import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import type { ConversationResponse } from "@/api/conversations/types";
import { conversationsAPI } from "@/api/conversations/endpoints";
import { contactsAPI } from "@/api/contacts/endpoints";
import { addOrUpdateConversationInCache } from "@/api/conversations/cacheUtils";

interface UseConversationAuthorizationInput {
  urlConvParam: string | null;
  currentUserId: number | undefined;
  conversationItems: ConversationResponse[];
  queryClient: QueryClient;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

interface UseConversationAuthorizationReturn {
  authorizedConvId: number | null;
  storedInboxes: any[];
}

export function useConversationAuthorization({
  urlConvParam,
  currentUserId,
  conversationItems,
  queryClient,
  setSearchParams,
}: UseConversationAuthorizationInput): UseConversationAuthorizationReturn {
  const [asyncAuthorizedConvId, setAsyncAuthorizedConvId] = useState<number | null>(null);

  useEffect(() => {
    setAsyncAuthorizedConvId(null);
  }, [urlConvParam]);

  const storedInboxes = useMemo(() => {
    try {
      const raw = localStorage.getItem("userInboxes");
      if (!raw) return [];
      const data = JSON.parse(raw) as { items?: any[] } | any[];
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.items)) return data.items;
      return [];
    } catch {
      return [];
    }
  }, []);

  // Synchronously authorize conversations already in cache — eliminates 1-2 render-cycle
  // delay before message fetching begins when switching known conversations.
  const syncAuthorizedConvId = useMemo(() => {
    if (!urlConvParam || !currentUserId) return null;
    const existing = conversationItems.find(
      (c) => String(c.id) === urlConvParam || c.conversation_uuid === urlConvParam,
    );
    if (!existing) return null;
    const isInternal =
      existing.conversation_type === "group" ||
      existing.conversation_type === "direct";
    if (isInternal) {
      return (existing.user_ids || []).includes(currentUserId)
        ? existing.id
        : null;
    }
    const userInboxIds = storedInboxes.map((i: any) => Number(i.id));
    if (
      userInboxIds.length === 0 ||
      (existing.inbox_id != null &&
        userInboxIds.includes(Number(existing.inbox_id)))
    ) {
      return existing.id;
    }
    return null;
  }, [urlConvParam, conversationItems, currentUserId, storedInboxes]);

  // Combine: prefer sync (zero-delay) for cache-known conversations, fall back to async.
  const authorizedConvId = syncAuthorizedConvId ?? asyncAuthorizedConvId;

  useEffect(() => {
    if (!urlConvParam) return;

    // If the conversation is already in cache, syncAuthorizedConvId (useMemo) covers the
    // happy path. We only need to handle the unauthorized case here (clear the URL param).
    const existsInCache = conversationItems.some(
      (c) => String(c.id) === urlConvParam || c.conversation_uuid === urlConvParam,
    );
    if (existsInCache) {
      if (syncAuthorizedConvId === null) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete("conversation");
            return next;
          },
          { replace: true },
        );
      }
      return;
    }

    // Try to parse as numeric ID for fetching
    const numericConversationId = parseInt(urlConvParam, 10);
    if (!Number.isFinite(numericConversationId) || numericConversationId <= 0)
      return;

    let cancelled = false;

    (async () => {
      try {
        const data = await conversationsAPI.getConversation(numericConversationId);
        if (cancelled) return;

        // IDOR prevention: verify the current user is authorized to view this conversation.
        const numericUserId = currentUserId;
        const isInternalType =
          data.conversation_type === "group" ||
          data.conversation_type === "direct";

        const authorized = (() => {
          if (!numericUserId) return false;
          if (isInternalType) {
            return (data.user_ids || []).includes(numericUserId);
          }
          const userInboxIds = storedInboxes.map((i: any) => Number(i.id));
          return (
            userInboxIds.length > 0 &&
            data.inbox_id != null &&
            userInboxIds.includes(Number(data.inbox_id))
          );
        })();

        if (!authorized) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete("conversation");
              return next;
            },
            { replace: true },
          );
          return;
        }

        setAsyncAuthorizedConvId(numericConversationId);

        const contact =
          data.contact ||
          (data.contact_id
            ? await contactsAPI.getContact(data.contact_id)
            : null);

        addOrUpdateConversationInCache(queryClient, {
          ...data,
          contact: contact || data.contact,
        } as any);
      } catch (err: unknown) {
        const detail: string | undefined = (err as any)?.response?.data?.detail;
        if (
          typeof detail === "string" &&
          detail.toLowerCase().includes("access denied")
        ) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete("conversation");
              return next;
            },
            { replace: true },
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    urlConvParam,
    conversationItems,
    currentUserId,
    storedInboxes,
    setSearchParams,
    queryClient,
    syncAuthorizedConvId,
  ]);

  return { authorizedConvId, storedInboxes };
}
