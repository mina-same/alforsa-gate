"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import ReconnectingWebSocket from "reconnecting-websocket";
import { useQueryClient } from "@tanstack/react-query";
import { WebSocketMessage } from "../types/websocket";
import { MessagesListResponse } from "@/api/messages/types";
import {
  updateConversationInCache,
  addOrUpdateConversationInCache,
  getConversationsFromCache,
} from "@/api/conversations/cacheUtils";
import { conversationsAPI } from "@/api/conversations/endpoints";
import { useToast } from "@/contexts/ToastContext";
import { notificationService } from "@/services/notificationService";
import { useAuthUser, useSetAuthUser } from "@/contexts/AuthContext";
import { WhatsAppService } from "./whatsapp/WhatsAppService";

// Utility function to detect if running as PWA (installed app)
const isPWA = (): boolean => {
  // Check if running as PWA (standalone mode)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone || // iOS Safari
    document.referrer.includes("android-app://"); // Android TWA

  return isStandalone;
};

interface WebSocketContextType {
  sendMessage: (message: WebSocketMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const queryClient = useQueryClient();
  const DEBUG_WS_LOGS =
    import.meta.env.DEV && import.meta.env.VITE_DEBUG_WS_LOGS === "true";
  const capacityAppliedRef = useRef(
    new Map<string, { assignedToMe: boolean; open: boolean }>(),
  );
  const { toasts, addToast, removeToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentConversationId = searchParams.get('conversation');
  const authUser = useAuthUser();
  const setAuthUser = useSetAuthUser();
  const currentUserId = authUser.id;
  // Use refs to avoid dependency issues in useEffect
  const addToastRef = useRef(addToast);
  const removeToastRef = useRef(removeToast);
  const toastsRef = useRef(toasts);
  const currentConversationIdRef = useRef(currentConversationId);
  const currentUserRef = useRef(authUser);
  const setSearchParamsRef = useRef(setSearchParams);

  useEffect(() => {
    addToastRef.current = addToast;
    removeToastRef.current = removeToast;
    toastsRef.current = toasts;
    currentConversationIdRef.current = currentConversationId;
    currentUserRef.current = authUser;
    setSearchParamsRef.current = setSearchParams;
  }, [
    addToast,
    removeToast,
    toasts,
    currentConversationId,
    authUser,
    setSearchParams,
  ]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const baseUrl = isLocalhost
      ? import.meta.env.VITE_API_WEB_Socket
      : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/v1/ws/connect`;

    if (!token) return;

    const ws = new ReconnectingWebSocket(`${baseUrl}?token=${token}`, [], {
      maxRetries: Infinity,
      minReconnectionDelay: 1000,
      maxReconnectionDelay: 10000,
    });

    (ws as any)._token = token;
    wsRef.current = ws;

    ws.onopen = () => {
      if (DEBUG_WS_LOGS) console.log("🟢 WebSocket connected");

      // Hook up WhatsApp WebRTC signaling to this websocket
      WhatsAppService.getInstance().onSignaling((sigData) => {
        const msg = {
          type: "call_event",
          data: sigData,
        };
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(msg));
        }
      });
    };
    ws.onclose = () => {
      if (DEBUG_WS_LOGS) console.log("🔴 WebSocket disconnected");
    };
    ws.onerror = (e) => console.error("❌ WebSocket error", e);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Handle WhatsApp Business API Call events (official Meta webhook format)
      // Field is "calls" as per official documentation
      if (message.field === "calls") {
        try {
          const callsData = message.value?.calls;
          const statusesData = message.value?.statuses;

          // Handle Call Connect webhook (SDP answer + media connection info)
          if (callsData && Array.isArray(callsData)) {
            callsData.forEach((callData: any) => {
              if (callData.event === "connect" && callData.session?.sdp) {
                const sdpType = callData.session.sdp_type || "offer";
                console.log(
                  `%c[WebSocket] Call ${sdpType === "offer" ? "Offer" : "Answer"} received - ID: ${callData.id}`,
                  "color: #25D366; font-weight: bold;",
                );

                // For outbound calls (Answer), process signaling immediately
                // For incoming calls (Offer), wait for UI acceptance
                if (sdpType === "answer") {
                  WhatsAppService.getInstance().handleCallSignaling(callData);
                }

                window.dispatchEvent(
                  new CustomEvent("whatsapp-incoming-call", {
                    detail: {
                      from: callData.from,
                      to:
                        message.value?.metadata?.display_phone_number ||
                        message.value?.metadata?.phone_number_id,
                      callId: callData.id,
                      name: callData.name,
                      sdpOffer: callData.session.sdp,
                      sdpType: sdpType,
                      outbound: sdpType === "answer",
                      contactPhone: callData.from,
                    },
                  }),
                );
              } else if (callData.event === "terminate") {
                // Call Terminate webhook: Call ended
                console.log(
                  `%c[WebSocket] Call Terminated - ID: ${callData.id}, Duration: ${callData.duration}s`,
                  "color: #FF0000;",
                );

                // Notify WhatsAppService to cleanup WebRTC
                WhatsAppService.getInstance().handleCallSignaling(callData);

                window.dispatchEvent(
                  new CustomEvent("whatsapp-call-ended", {
                    detail: {
                      callId: callData.id,
                      duration: callData.duration,
                      status: callData.status,
                    },
                  }),
                );
              }
            });
          }

          // Handle Call Status webhook (RINGING, ACCEPTED, REJECTED)
          if (statusesData && Array.isArray(statusesData)) {
            statusesData.forEach((status: any) => {
              console.log(
                `%c[WebSocket] Call Status: ${status.status} - ID: ${status.id}`,
                "color: #34b7f1;",
              );
              window.dispatchEvent(
                new CustomEvent("whatsapp-call-status", {
                  detail: {
                    callId: status.id,
                    status: status.status, // RINGING, ACCEPTED, REJECTED
                    recipientId: status.recipient_id,
                    timestamp: status.timestamp,
                  },
                }),
              );
            });
          }
        } catch (e) {
          console.error("[WebSocket] Failed to handle call webhook:", e);
        }
        return;
      }

      // Handle Omnichannel Call Message format (fallback for backward compatibility)
      if (
        message.type === "new_message" &&
        message.data?.message_type === "calls"
      ) {
        try {
          const attributes =
            typeof message.data.additional_attributes === "string"
              ? JSON.parse(message.data.additional_attributes)
              : message.data.additional_attributes;

          if (attributes && attributes.event === "connect") {
            const from = message.data?.sender_id || attributes.from;
            const sdpType =
              attributes.session?.sdp_type || attributes.sdp_type || "offer";
            console.log(
              `%c[Omnichannel] Call ${sdpType === "offer" ? "Offer" : "Answer"} Received from: ${from}`,
              "color: #25D366;",
            );

            // For outbound calls (Answer), process signaling immediately
            if (sdpType === "answer") {
              WhatsAppService.getInstance().handleCallSignaling({
                id: message.data?.call_id || attributes.id,
                event: "connect",
                session: attributes.session || {
                  sdp: attributes.sdp,
                  sdp_type: sdpType,
                },
                from: from,
              });
            }

            window.dispatchEvent(
              new CustomEvent("whatsapp-incoming-call", {
                detail: {
                  from: from,
                  to: attributes.to || attributes.recipient_id,
                  callId: message.data?.call_id || attributes.id,
                  name: message.data?.contact_name,
                  sdpOffer: attributes.sdp || attributes.session?.sdp,
                  sdpType: sdpType,
                  outbound: sdpType === "answer",
                  contactPhone: message.data?.sender_id,
                },
              }),
            );
          } else if (attributes && attributes.event === "terminate") {
            // Call Terminate: User ended the call
            console.log(
              `%c[Omnichannel] Call Terminated - ID: ${attributes.id}, Duration: ${attributes.duration}s`,
              "color: #FF0000;",
            );

            // Notify WhatsAppService to cleanup WebRTC
            WhatsAppService.getInstance().handleCallSignaling({
              id: attributes.id,
              event: "terminate",
              from: message.data?.sender_id || attributes.from,
            });

            window.dispatchEvent(
              new CustomEvent("whatsapp-call-ended", {
                detail: {
                  callId: attributes.id,
                  duration: attributes.duration,
                  status: attributes.status,
                },
              }),
            );
          }
        } catch (e) {
          console.error("[Omnichannel] Failed to parse call message:", e);
        }
      }

      // Handle new call_event message format
      if (message.type === "call_event") {
        try {
          console.log(
            `%c[WebSocket] Received call_event:`,
            "color: #FF6B35; font-weight: bold;",
            message.data,
          );

          const {
            call_data,
            call_id,
            contact_name,
            contact_phone,
            direction,
            event,
            sdp,
            sdp_type,
          } = message.data;

          // Dispatch the call_event to GlobalCallOverlay for handling
          window.dispatchEvent(
            new CustomEvent("socket-message", {
              detail: {
                type: "call_event",
                data: message.data,
              },
            }),
          );

          // Also handle immediate signaling for connect and candidate events
          if (
            (event === "connect" && call_data?.session) ||
            event === "candidate" ||
            event === "ice_candidate"
          ) {
            const sdpType =
              call_data?.session?.sdp_type || message.data.sdp_type || "offer";

            // Normalize data for WhatsAppService
            const signalingData = {
              ...message.data,
              id:
                message.data.call_id ||
                (call_data && (call_data.id || call_data.call_id)),
              session: call_data?.session || {
                sdp: message.data.sdp,
                sdp_type: sdpType,
                candidate: message.data.candidate,
                sdp_mid: message.data.sdp_mid,
                sdp_m_line_index: message.data.sdp_m_line_index,
              },
            };

            console.log(
              `%c[WebSocket] Call Signaling (${event}) from: ${contact_phone}`,
              "color: #25D366;",
            );

            // For candidates or outbound answers, process signaling immediately
            // For inbound offers, processing happens via GlobalCallOverlay -> acceptCall
            if (
              event === "candidate" ||
              event === "ice_candidate" ||
              sdpType === "answer"
            ) {
              WhatsAppService.getInstance().handleCallSignaling(signalingData);
            }

            if (event === "connect") {
              // Also dispatch the traditional whatsapp-incoming-call for backward compatibility
              window.dispatchEvent(
                new CustomEvent("whatsapp-incoming-call", {
                  detail: {
                    from: contact_phone,
                    to: call_data?.to || message.data.to,
                    callId:
                      message.data.call_id ||
                      (call_data && (call_data.id || call_data.call_id)),
                    name: contact_name,
                    sdpOffer: call_data?.session?.sdp || message.data.sdp,
                    sdpType: sdpType,
                    outbound: direction === "outbound",
                    contactPhone: contact_phone,
                    contact_id: message.data.contact_id,
                    channel_id: message.data.channel_id,
                    conversation_id: message.data.conversation_id,
                  },
                }),
              );
            }
          }
        } catch (e) {
          console.error("[WebSocket] Failed to handle call_event:", e);
        }
      }

      // Handle conversation updates
      if (message.type === "conversation_update") {
        const {
          id,
          status,
          assigned_agent_id,
          unread_messages_count,
          updated_at,
        } = message.data;

        // Find conversation by either UUID or numeric id
        const conversationId = String(id);
        const conversation = getConversationsFromCache(queryClient).find(
          (c) =>
            c.conversation_uuid === conversationId || String(c.id) === conversationId,
        );

        if (conversation) {
          // unread_messages_count is intentionally excluded here.
          // The backend's count in conversation_update is unreliable as a direct
          // setter — it can reflect DB state that diverges from the client's
          // optimistic +1 increments in new_message, causing inflation when both
          // events are processed. Count is managed exclusively by new_message
          // (optimistic ±1) and mark-as-read mutations (reset to 0).
          updateConversationInCache(queryClient, conversation.conversation_uuid, (c) => ({
            ...c,
            status: status ?? c.status,
            assigned_agent_id: assigned_agent_id ?? c.assigned_agent_id,
            updated_at,
          }));

          if (DEBUG_WS_LOGS) {
            console.log("🔄 Updated conversation via WebSocket:", {
              conversationId: conversation.conversation_uuid,
              numericId: conversation.id,
              status,
              assigned_agent_id,
              unread_messages_count,
            });
          }
        } else {
          // Conversation not in store yet — invalidate React Query infinite lists immediately
          // so all active conversation list views refetch and include the new conversation.
          queryClient.invalidateQueries({
            queryKey: ["conversations", "infinite"],
          });

          // Fetch the full conversation and add it to the cache
          conversationsAPI
            .getConversation(Number(id))
            .then((c: any) => {
              addOrUpdateConversationInCache(queryClient, c);
              if (DEBUG_WS_LOGS) {
                console.log(
                  "➕ Fetched and added new conversation from socket:",
                  c.id,
                );
              }
            })
            .catch((err: any) => {
              console.error(
                "[WebSocket] Failed to fetch new conversation:",
                err,
              );
            });
        }

        // Capacity tracking: adjust current_chat_count when assignment or status changes
        const prevAssignedAgentId = conversation?.assigned_agent_id;
        const nextAssignedAgentId = assigned_agent_id;
        const prevClosed = conversation?.status === "closed";
        const nextClosed = status === "closed";
        const liveUserId = currentUserRef.current?.id;
        const numericCurrentUserId =
          liveUserId != null ? Number(liveUserId) : undefined;
        const assignedToMe =
          numericCurrentUserId != null &&
          Number(nextAssignedAgentId) === numericCurrentUserId;

        if (numericCurrentUserId != null) {
          const convKey = String(id);
          const prevAssignedToMe =
            prevAssignedAgentId != null &&
            Number(prevAssignedAgentId) === numericCurrentUserId;
          const nextAssignedToMe =
            nextAssignedAgentId != null &&
            Number(nextAssignedAgentId) === numericCurrentUserId;

          const prevOpen = !prevClosed;
          const nextOpen = !nextClosed;

          const fallbackPrevState = { assignedToMe: prevAssignedToMe, open: prevOpen };
          const lastApplied =
            capacityAppliedRef.current.get(convKey) ?? fallbackPrevState;

          const fromCounted = lastApplied.assignedToMe && lastApplied.open;
          const toCounted = nextAssignedToMe && nextOpen;

          capacityAppliedRef.current.set(convKey, {
            assignedToMe: nextAssignedToMe,
            open: nextOpen,
          });

          let delta = 0;
          if (fromCounted && !toCounted) delta -= 1;
          if (!fromCounted && toCounted) delta += 1;

          if (delta !== 0) {
            const apply = (obj: any) => {
              if (!obj) return obj;
              const prev =
                obj.current_chat_count != null ? Number(obj.current_chat_count) : 0;
              const base = Number.isFinite(prev) && prev >= 0 ? prev : 0;
              return { ...obj, current_chat_count: Math.max(0, base + delta) };
            };

            queryClient.setQueryData(
              ["users", numericCurrentUserId],
              (prev: any) => apply(prev),
            );

            try {
              const updatedUser = apply(currentUserRef.current);
              if (updatedUser) {
                setAuthUser(updatedUser);
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                localStorage.setItem("userProfile", JSON.stringify(updatedUser));
              }
            } catch {}
          }
        }

        // Assignment toast notification
        const shouldNotifyAssignment =
          prevAssignedAgentId !== nextAssignedAgentId || !conversation;

        if (shouldNotifyAssignment) {
          const conversationName =
            conversation?.contact?.name ||
            conversation?.subject ||
            `Conversation "${id}"`;
          const assignmentMessage = !nextAssignedAgentId
            ? `${conversationName} was unassigned`
            : assignedToMe
              ? `${conversationName} assigned to you`
              : `${conversationName} was assigned`;

          if (!isPWA()) {
            addToastRef.current({
              senderName: "System",
              message: assignmentMessage,
              timestamp: new Date().toISOString(),
              conversationId: id,
              inbox_id: conversation?.inbox_id || 0,
            });
          }
        }

        // Auto-navigate away when the currently-open conversation is closed by another agent
        if (
          conversation &&
          status === "closed" &&
          (currentConversationIdRef.current === conversation.conversation_uuid ||
            String(conversation.id) === currentConversationIdRef.current)
        ) {
          setSearchParamsRef.current((prev) => {
            const p = new URLSearchParams(prev);
            p.delete("conversation");
            return p;
          });

          if (!isPWA()) {
            addToastRef.current({
              senderName: "System",
              message: `Conversation "${conversation.contact?.name || conversation.subject || conversation.id}" has been closed`,
              timestamp: new Date().toISOString(),
              conversationId: id,
              inbox_id: conversation.inbox_id || 0,
            });
          }
        }

        return;
      }

      // Handle message events (existing code)
      if (message.type === "new_message") {
        const conversationId = message.data.conversation_id;
        const resolvedMessage = message.data;

        // Notify WhatsAppService if this is a call log message
        if (resolvedMessage.message_type === "calls") {
          console.log(
            `%c[WS] Received call log message: ${resolvedMessage.id}`,
            "color: #34b7f1; font-weight: bold;",
          );
          WhatsAppService.getInstance().setCallMessageId(
            resolvedMessage.id,
            conversationId,
          );
        }

        // Update conversation messages cache
        const partialKey = ["conversationMessages", conversationId];
        const cachedEntries = queryClient.getQueriesData<MessagesListResponse>({
          queryKey: partialKey,
        });
        const hasCache = cachedEntries.some(
          ([, data]) => data && data.items && data.items.length > 0,
        );
        // Snapshot dedup state BEFORE setQueriesData adds the message (used below for count)
        const messageAlreadyInCache = cachedEntries.some(
          ([, data]) => data?.items.some((m) => m.id === resolvedMessage.id),
        );

        const userData = currentUserRef.current;

        if (hasCache) {
          // Append/update the new message in every cached page for this conversation
          // without triggering a network re-fetch.
          queryClient.setQueriesData<MessagesListResponse>(
            {
              queryKey: partialKey,
              predicate: (query) => {
                const queryParams = query.queryKey[2] as any;
                const filterType = queryParams?.message_type;
                if (filterType) {
                  return resolvedMessage.message_type === filterType;
                }
                return true;
              },
            },
            (old) => {
              if (!old) return old;

              const items = old.items;
              const exists = items.some((m) => m.id === resolvedMessage.id);

              if (exists) {
                return {
                  ...old,
                  items: items.map((item) =>
                    item.id === resolvedMessage.id ? resolvedMessage : item,
                  ),
                };
              }

              // For reactions, replace the existing reaction from the same reactor
              // only if the incoming message is NEWER (handles out-of-order delivery)
              if (resolvedMessage.message_type === "reaction") {
                const replyToId = resolvedMessage.reply_to_message_id;
                if (replyToId) {
                  const reactorId = String(
                    resolvedMessage.sent_by_user_id ||
                      resolvedMessage.sent_by_contact_id ||
                      "",
                  );
                  const incomingTs = resolvedMessage.created_at
                    ? new Date(resolvedMessage.created_at).getTime()
                    : 0;
                  const filteredItems = items.filter((item) => {
                    if (
                      item.message_type === "reaction" &&
                      item.reply_to_message_id === replyToId
                    ) {
                      const existingReactorId = String(
                        item.sent_by_user_id || item.sent_by_contact_id || "",
                      );
                      if (existingReactorId === reactorId) {
                        const existingTs = item.created_at
                          ? new Date(item.created_at).getTime()
                          : 0;
                        return incomingTs <= existingTs; // keep existing if it's newer
                      }
                    }
                    return true;
                  });
                  const hadExisting = items.some(
                    (item) =>
                      item.message_type === "reaction" &&
                      item.reply_to_message_id === replyToId &&
                      String(item.sent_by_user_id || item.sent_by_contact_id || "") === reactorId,
                  );
                  const existingNewer = hadExisting && filteredItems.length === items.length;
                  if (existingNewer) return old; // existing is newer, don't add
                  const netChange = filteredItems.length < items.length ? 0 : 1;
                  return { ...old, items: [...filteredItems, resolvedMessage], total: old.total + netChange };
                }
              }

              return { ...old, items: [...items, resolvedMessage], total: old.total + 1 };
            },
          );
        } else {
          // No cache yet — invalidate to trigger a fresh fetch
          queryClient.invalidateQueries({
            queryKey: partialKey,
            refetchType: "active",
          });
        }

        // Update conversation's last message in sidebar
        const currentUserId = userData?.id;

        const isFromMe = resolvedMessage.sent_by_user_id === currentUserId;
        const isFromAgent =
          resolvedMessage.sender_type === "agent" && !isFromMe;

        // Show toast notification for incoming messages (not from me, excluding call messages)
        const senderName =
          resolvedMessage.contact_name ||
          resolvedMessage.sender?.name ||
          "New Message";
         const isFromMeResolved =
          String(resolvedMessage.sent_by_user_id) === String(currentUserRef.current?.id);
        const isCallMessage = resolvedMessage.message_type === "calls";
        // AI agent messages are outbound with no user or contact sender
        const isFromAIAgent =
          resolvedMessage.direction === "outbound" &&
          !resolvedMessage.sent_by_user_id &&
          !resolvedMessage.sent_by_contact_id;

        if (!isFromMeResolved && !isCallMessage && !isFromAIAgent) {
          // Check if user is currently in this conversation
          const currentConversation = getConversationsFromCache(queryClient).find(
            (c) =>
              c.conversation_uuid === currentConversationIdRef.current ||
              String(c.id) === currentConversationIdRef.current,
          );
          const isInCurrentConversation =
            currentConversation &&
            String(currentConversation.id) ===
              String(message.data.conversation_id);

          // Show notifications if:
          // 1. User is NOT in the current conversation
          // 2. OR the app is NOT focused (screen locked, minimized, or another app open)
          const isAppFocused = !document.hidden;

          if (!isInCurrentConversation || !isAppFocused) {
            // Show toast notification ONLY if:
            // 1. App is focused (to avoid double notification)
            // 2. NOT running as PWA (PWA users only get system notifications)
            const shouldShowToast = isAppFocused && !isPWA();

            if (shouldShowToast) {
              addToastRef.current({
                senderName: senderName,
                message: resolvedMessage.content || "Media message",
                timestamp: resolvedMessage.created_at,
                conversationId: resolvedMessage.conversation_id,
                inbox_id: resolvedMessage.inbox_id,
              });
            }

            // Always show system notification (works on all platforms)
            notificationService
              .sendMessageNotification(
                senderName,
                resolvedMessage.content || "Media message",
                resolvedMessage.conversation_id,
                resolvedMessage.inbox_id,
              )
              .catch((err) =>
                console.error("Error sending notification:", err),
              );
          }
        }

        // Update conversation's last message, unread counts, and bump it to top (M2/M3)
        const cachedConvs = getConversationsFromCache(queryClient);
        const conversation = cachedConvs.find(
          (c) =>
            String(c.id) === String(conversationId) ||
            c.conversation_uuid === String(conversationId),
        );

        if (conversation) {
          const isActiveConversation =
            conversation.conversation_uuid === currentConversationIdRef.current ||
            String(conversation.id) === currentConversationIdRef.current;
          addOrUpdateConversationInCache(queryClient, {
            ...conversation,
            last_message: resolvedMessage,
            last_message_id: resolvedMessage.id,
            unread_messages_count:
              isFromMeResolved || isActiveConversation || messageAlreadyInCache
                ? 0
                : (conversation.unread_messages_count ?? 0) + 1,
            updated_at: resolvedMessage.created_at,
            last_activity_at: resolvedMessage.created_at,
          });
        } else {
          // If conversation is not in cache, invalidate list to fetch it
          queryClient.invalidateQueries({
            queryKey: ["conversations", "infinite"],
          });
        }
      } else if (message.type === "message_status") {
        const statusData = message.data;
        const conversationId = statusData.conversation_id;
        // Ensure messageId is a number for consistent matching
        const messageId =
          typeof statusData.id === "string"
            ? parseInt(statusData.id, 10)
            : statusData.id;
        const status = statusData.status;
        const delivered_at = statusData.delivered_at;
        const read_at = statusData.read_at;

        // Update message status in React Query cache
        queryClient.setQueriesData<MessagesListResponse>(
          { queryKey: ["conversationMessages", conversationId] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((msg) =>
                Number(msg.id) === Number(messageId)
                  ? { ...msg, status, delivered_at, read_at }
                  : msg,
              ),
            };
          },
        );

        // Update conversation's last message status in sidebar if this is the last message
        const currentConversation = getConversationsFromCache(queryClient).find(
          (c) =>
            String(c.id) === String(conversationId) ||
            c.conversation_uuid === String(conversationId),
        );

        if (
          currentConversation?.last_message &&
          (currentConversation.last_message.id === messageId ||
            (currentConversation.last_message_id != null &&
              Number(currentConversation.last_message_id) === messageId))
        ) {
          updateConversationInCache(queryClient, conversationId, (c) => ({
            ...c,
            last_message: c.last_message
              ? {
                  ...c.last_message,
                  status:
                    status === "pending" || status === "failed"
                      ? "sent"
                      : status,
                }
              : c.last_message,
          }));
        }
      } else if (message.type === "notification") {
        const notificationData = message.data;
        console.log(
          "🔔 Received notification via websocket:",
          notificationData,
        );

        if (notificationData.type === "mention") {
          const conversationId = notificationData.entity_id;

          // Try to find the inbox_id from existing conversations
          const conversationMatch = getConversationsFromCache(queryClient).find(
            (c) =>
              String(c.id) === String(conversationId) ||
              c.conversation_uuid === String(conversationId),
          );
          const inboxId = conversationMatch?.inbox_id || 0;

          console.log("📍 Mention handling:", { conversationId, inboxId });

          // Show system notification
          notificationService
            .sendMentionNotification(
              notificationData.title,
              notificationData.content,
              conversationId,
              inboxId,
            )
            .catch((err) =>
              console.error("Error sending mention notification:", err),
            );

          // Show toast notification ONLY if:
          // 1. App is focused (to avoid double notification)
          // 2. NOT running as PWA (PWA users only get system notifications)
          const isAppFocused = !document.hidden;
          const shouldShowToast = isAppFocused && !isPWA();

          if (shouldShowToast) {
            addToastRef.current({
              senderName: notificationData.title,
              message: notificationData.content,
              timestamp:
                notificationData.created_at || new Date().toISOString(),
              conversationId: conversationId,
              inbox_id: inboxId,
              type: "mention",
            });
          }
        }
      }
    };

    return () => ws.close();
  }, [currentUserId]);

  const sendMessage = (msg: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("Must be used inside WebSocketProvider");
  return ctx;
}
