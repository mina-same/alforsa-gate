import { MessageResponse } from "@/api/messages/types";
import { MediaType, Message, TemplateMessage } from "@/types/chat";
import { deriveMessageStatus } from "@/utils/dateUtils";

// Map API messages to UI format
export const MapMessages = (
  currentUserContactId: number | null | undefined,
  currentUserId: number | null | undefined,
  messagesResp: MessageResponse[],
  existingMessages: Message[] = []
): Message[] => {
  const byId = new Map<number, any>();

  // Populate from existing messages first (for reply lookups)
  for (const m of existingMessages) {
    if (m.numericId) {
      byId.set(m.numericId, {
        message_uuid: m.id,
        id: m.numericId,
        content: m.text,
        sender_id: m.senderId,
        sender_name: m.senderName,
        user_name: m.senderName,
        sent_by_user_name: m.senderName,
        agent_name: m.senderName,
        contact_name: m.senderId?.startsWith?.("contact-") ? m.senderName : undefined,
        created_at: m.createdAt,
        message_type: m.message_type,
        media_type: m.media_type,
        media_url: m.media?.url,
        media_name: m.media?.name,
        external_message_id: m.external_message_id,
        direction: m.senderId === "me" ? "outbound" : "inbound",
      });
    }
  }

  for (const m of messagesResp) {
    if (typeof m.id === "number") byId.set(m.id, m);
  }

  // Helper to determine if a message was sent by the current user
  const isMine = (msg: MessageResponse): boolean => {
    return (
      (currentUserContactId != null &&
        currentUserContactId !== 0 &&
        msg.sent_by_contact_id != null &&
        Number(msg.sent_by_contact_id) === Number(currentUserContactId)) ||
      (currentUserId != null &&
        msg.sent_by_user_id != null &&
        Number(msg.sent_by_user_id) === Number(currentUserId)) ||
      (currentUserId != null &&
        ["user", "agent"].includes((msg.sender_type || "").toLowerCase()) &&
        msg.sender_id != null &&
        Number(msg.sender_id) === Number(currentUserId)) ||
      msg.direction === "outbound"
    );
  };

  const isMeStrict = (msg: MessageResponse): boolean => {
    return (
      (currentUserContactId != null &&
        currentUserContactId !== 0 &&
        msg.sent_by_contact_id != null &&
        Number(msg.sent_by_contact_id) === Number(currentUserContactId)) ||
      (currentUserId != null &&
        msg.sent_by_user_id != null &&
        Number(msg.sent_by_user_id) === Number(currentUserId)) ||
      (currentUserId != null &&
        ["user", "agent"].includes((msg.sender_type || "").toLowerCase()) &&
        msg.sender_id != null &&
        Number(msg.sender_id) === Number(currentUserId))
    );
  };

  const getReactorInfo = (msg: any) => {
    // Priority 1: Direct fields from reaction messages
    if (msg.sent_by_user_id) {
      return { id: String(msg.sent_by_user_id), type: "user" as const };
    }
    if (msg.sent_by_contact_id) {
      return { id: String(msg.sent_by_contact_id), type: "contact" as const };
    }

    // Priority 2: Standard sender fields
    const sId = String(msg.sender_id || "");
    const sType = String(msg.sender_type || "").toLowerCase();

    if (sId.startsWith("user-") || sType === "user" || sType === "agent") {
      const cleanId = sId.replace("user-", "");
      return { id: cleanId, type: "user" as const };
    }
    if (sId.startsWith("contact-") || sType === "contact" || sType === "customer") {
      const cleanId = sId.replace("contact-", "");
      return { id: cleanId, type: "contact" as const };
    }

    // Default to contact if it's numeric and we aren't sure, but try to be safe
    return { id: sId, type: (["user", "agent"].includes(sType) ? "user" : "contact") as "user" | "contact" };
  };

  // First, map all non-reaction messages to UI messages.
  const baseMessages: Message[] = [];
  const uiByNumericId = new Map<number, Message>();

  for (const msg of messagesResp) {
    const msgType = String(msg.message_type || "").toLowerCase();
    if (msgType.includes("reaction")) {
      // We'll attach reactions in a second pass.
      continue;
    }

    // Check if this is a location message
    let location: { lat: number; lng: number } | undefined;
    let mediaUrl = msg.media_url;
    const mine = isMine(msg);
    const combinedType = String(msg.message_type || msg.media_type || "").toLowerCase();
    const isImageMessage = combinedType.includes("image");
    const isStickerMessage = combinedType.includes("sticker") || msg.content === "[sticker]";
    const isVideoMessage = combinedType.includes("video");
    const isMediaMessage = isImageMessage || isStickerMessage || isVideoMessage;
    
    // Only mark as pending if it's a media message and we don't have a URL yet
    const isMediaPending = isMediaMessage && !mediaUrl;

    if ((msg.media_type === "location" || msg.message_type === "location") && (msg.media_url || msg.content)) {
      // Try to extract coordinates from media_url or content
      try {
        if (msg.media_url) {
          // If media_url contains coordinates like "lat,lng"
          const coords = msg.media_url.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
          if (coords) {
            location = {
              lat: parseFloat(coords[1]),
              lng: parseFloat(coords[2]),
            };
          }
        }

        if (!location && msg.content) {
          // Try parsing as JSON first (common for sent messages)
          try {
            const parsed = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            const lat = parsed.latitude || parsed.lat;
            const lng = parsed.longitude || parsed.lng || parsed.lon;
            if (lat != null && lng != null) {
              location = {
                lat: Number(lat),
                lng: Number(lng),
              };
            }
          } catch {
            // If not JSON, try regex on content
            const contentCoords = msg.content.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
            if (contentCoords) {
              location = {
                lat: parseFloat(contentCoords[1]),
                lng: parseFloat(contentCoords[2]),
              };
            }
          }

          // Create Google Maps URL if not present
          if (location && !mediaUrl) {
            mediaUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
          }
        }
      } catch (e) {
        console.warn("Failed to parse location coordinates:", e);
      }
    }

    const anyMsg = msg as any;
    const resolvedSenderName =
      anyMsg.contact_name ||
      anyMsg.sender?.name ||
      anyMsg.sender_name ||
      anyMsg.user_name ||
      anyMsg.sent_by_user_name ||
      anyMsg.agent_name ||
      (mine ? "You" : "Other");
    const resolvedSenderAvatar = anyMsg.contact_avatar || anyMsg.sender?.avatar;

    const uiMessage: Message = {
      id: msg.message_uuid || `msg-${msg.id}`,
      numericId: msg.id,
      text: msg.content || "",
      senderId: mine
        ? "me"
        : msg.sent_by_contact_id != null
          ? `contact-${msg.sent_by_contact_id}`
          : msg.sender_id?.toString() || "system",
      senderName: resolvedSenderName,
      senderAvatar: resolvedSenderAvatar,
      createdAt: msg.created_at,
      sentAt: msg.sent_at || undefined,
      deliveredAt: msg.delivered_at || undefined,
      readAt: msg.read_at || undefined,
      status: deriveMessageStatus(msg.status, msg.sent_at, msg.delivered_at, msg.read_at),
      external_message_id: msg.external_message_id,
      template_id: msg.template_id ?? 0,
      media: mediaUrl
        ? {
          url: mediaUrl,
          type: (msg.media_type || (msg.message_type === 'location' ? 'location' : 'file')) as MediaType,
          name: msg.media_name || "file",
        }
        : undefined,
      media_type: msg.media_type,
      message_type: msg.message_type,
      replyTo: (() => {
        const replyToId = (msg as any).reply_to_message_id as
          | number
          | null
          | undefined;
        if (replyToId == null) return undefined;
        const ref = byId.get(replyToId);
        if (!ref) {
          return {
            messageId: String(replyToId),
            numericId: replyToId,
            text: "",
            senderName: "",
          };
        }

        let replyLocation: { lat: number; lng: number } | undefined;
        if (ref.media_type === "location") {
          try {
            const coords = (ref.media_url || "").match(
              /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
            );
            if (coords) {
              replyLocation = {
                lat: parseFloat(coords[1]),
                lng: parseFloat(coords[2]),
              };
            } else if (ref.content) {
              const contentCoords = ref.content.match(
                /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
              );
              if (contentCoords) {
                replyLocation = {
                  lat: parseFloat(contentCoords[1]),
                  lng: parseFloat(contentCoords[2]),
                };
              }
            }
          } catch {
            // ignore
          }
        }

        const refIsMine =
          (currentUserContactId != null &&
            currentUserContactId !== 0 &&
            ref.sent_by_contact_id != null &&
            Number(ref.sent_by_contact_id) === Number(currentUserContactId)) ||
          (currentUserId != null &&
            ref.sent_by_user_id != null &&
            Number(ref.sent_by_user_id) === Number(currentUserId)) ||
          (currentUserId != null &&
            (ref.sender_type || "").toLowerCase() === "user" &&
            ref.sender_id != null &&
            Number(ref.sender_id) === Number(currentUserId));

        const refSenderName = (() => {
          if (refIsMine) return "You";
          const anyRef = ref as any;
          const name =
            anyRef?.contact_name ||
            anyRef?.sender?.name ||
            anyRef?.sender_name ||
            anyRef?.user_name ||
            anyRef?.sent_by_user_name ||
            anyRef?.agent_name;
          return (typeof name === "string" && name.trim()) ? name : "Other";
        })();

        const refSenderId = (() => {
          if (refIsMine) return "me";
          const anyRef = ref as any;
          if (anyRef.sent_by_user_id) return `user-${anyRef.sent_by_user_id}`;
          if (anyRef.sent_by_contact_id) return `contact-${anyRef.sent_by_contact_id}`;
          if (anyRef.sender_id) {
            const sType = String(anyRef.sender_type || "").toLowerCase();
            if (sType === "user" || sType === "agent") return `user-${anyRef.sender_id}`;
            if (sType === "contact" || sType === "customer") return `contact-${anyRef.sender_id}`;
            return String(anyRef.sender_id);
          }
          return undefined;
        })();

        return {
          messageId: ref.message_uuid,
          numericId: replyToId,
          text: ref.content || "",
          senderName: refSenderName,
          senderId: refSenderId,
          message_type: ref.message_type,
          media_type: ref.media_type,
          media_url: ref.media_url,
          media_name: ref.media_name,
          external_message_id: ref.external_message_id,
          direction: ref.direction,
          location: replyLocation,
        };
      })(),
      location: location ? { latitude: location.lat, longitude: location.lng } : undefined,
      template: (() => {
        if (msg.message_type === 'template_message' && msg.content) {
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed && typeof parsed === 'object' && parsed.name) {
              return parsed as TemplateMessage;
            }
          } catch {
            // content is not valid template JSON
          }
        }
        return undefined;
      })(),
      audioUrl: undefined,
      audioBlob: undefined,
      deletedBy: undefined,
      edited: (() => {
        const a = msg.additional_attributes;
        if (!a) return undefined;
        const parsed = typeof a === 'string' ? (() => { try { return JSON.parse(a); } catch { return {}; } })() : a;
        return (parsed as any)?.isEdited === true ? true : undefined;
      })(),
      sent_by_user_id: msg.sent_by_user_id || 0,
      mediaPending: isMediaPending && !mediaUrl,
      direction: (msg as any).direction,
      additional_attributes: msg.additional_attributes,
      reactions: (msg.reactions || []).filter(Boolean).map((r: any) => {
        const rUserId = r.user_id ? String(r.user_id) : "";
        const rContactId = r.contact_id ? String(r.contact_id) : "";

        // If it's a WhatsApp channel or has contact_id, it's likely a contact
        // Otherwise if it has user_id, it's a user/agent
        const reactorType = (rContactId || !rUserId) ? "contact" : "user";
        const reactorId = reactorType === "user" ? rUserId : rContactId;

        const isMe = reactorType === "user"
          ? (!!currentUserId && Number(reactorId) === Number(currentUserId))
          : (!!currentUserContactId && Number(reactorId) === Number(currentUserContactId));

        return {
          emoji: r.emoji || "",
          isMine: isMe,
          reactorId,
          reactorType,
          userName: r.user_name || r.contact_name,
        };
      }),
    };

    baseMessages.push(uiMessage);
    if (typeof uiMessage.numericId === "number") {
      uiByNumericId.set(uiMessage.numericId, uiMessage);
    }
  }

  // Second pass: attach reaction messages to their related base messages.
  // We first collect all reaction messages per target, then deduplicate by reactor
  // keeping only the NEWEST reaction from each reactor (handles both ascending and
  // descending message ordering from the API).
  const reactionsByTarget = new Map<number, typeof messagesResp>();
  for (const msg of messagesResp) {
    const msgType = String(msg.message_type || "").toLowerCase();
    if (!msgType.includes("reaction")) continue;
    const replyToId = msg.reply_to_message_id;
    if (replyToId == null) continue;
    const bucket = reactionsByTarget.get(replyToId) ?? [];
    bucket.push(msg);
    reactionsByTarget.set(replyToId, bucket);
  }

  for (const [replyToId, reactionMsgs] of reactionsByTarget) {
    const target = uiByNumericId.get(replyToId);
    if (!target) continue;

    // Build a map of reactor → newest reaction message
    const newestByReactor = new Map<string, (typeof messagesResp)[number]>();
    for (const msg of reactionMsgs) {
      const reactor = getReactorInfo(msg);
      if (!reactor.id) continue;
      const key = `${reactor.type}:${reactor.id}`;
      const existing = newestByReactor.get(key);
      if (!existing) {
        newestByReactor.set(key, msg);
      } else {
        const existingTs = existing.created_at ? new Date(existing.created_at).getTime() : 0;
        const currentTs = msg.created_at ? new Date(msg.created_at).getTime() : 0;
        if (currentTs > existingTs) {
          newestByReactor.set(key, msg);
        }
      }
    }

    // Start from first-pass reactions (from msg.reactions field), remove any that
    // will be replaced by a reaction message for the same reactor.
    const reactorKeysFromMessages = new Set(newestByReactor.keys());
    const baseReactions = (Array.isArray(target.reactions) ? target.reactions : []).filter((r) => {
      const key = `${r.reactorType}:${r.reactorId}`;
      return !reactorKeysFromMessages.has(key);
    });

    // Build final reactions: base (not overridden) + one per reactor from message events
    const finalReactions = [...baseReactions];
    for (const [, msg] of newestByReactor) {
      const emoji = (msg.content || "").trim();
      if (!emoji) continue;
      const reactor = getReactorInfo(msg);
      const isMe = reactor.type === "user"
        ? (!!currentUserId && Number(reactor.id) === Number(currentUserId))
        : (!!currentUserContactId && Number(reactor.id) === Number(currentUserContactId));

      finalReactions.push({
        emoji,
        isMine: isMe,
        messageId: msg.message_uuid,
        numericId: msg.id,
        createdAt: msg.created_at,
        reactorId: reactor.id,
        reactorType: reactor.type,
        userName: (msg as any).user_name || (isMe ? "You" : undefined),
      });
    }

    target.reactions = finalReactions;
  }

  return baseMessages;
};
