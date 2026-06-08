import {
  Conversation,
  Message,
  OutgoingMessage,
  MediaType,
  TemplateMessage,
} from "@/types/chat";
import { getDraftKey } from "./useDraft";
import {
  useCreateMessage,
  useDeleteMessage,
  useUpdateMessage,
} from "@/api/messages/hooks";
import { useUploadMedia } from "@/api/media/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { updateConversationInCache } from "@/api/conversations/cacheUtils";
import type { MessageCreate, MessageType } from "@/api/messages/types";
import { buildTemplateComponents } from "@/utils/templateHelper";
import { getFileExtension, generateUniqueFilename } from "@/utils/fileUtils";

let sendSuccessAudio: HTMLAudioElement | null = null;

const getPublicSoundUrl = (relativePath: string) => {
  const base = String(import.meta.env.BASE_URL || "/");
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedRel = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;
  return `${normalizedBase}${normalizedRel}`;
};

const playSendSuccessSound = () => {
  try {
    const url = getPublicSoundUrl("sounds/notification-sound.mp3");
    if (!sendSuccessAudio) {
      sendSuccessAudio = new Audio(url);
      sendSuccessAudio.preload = "auto";
      sendSuccessAudio.volume = 0.6;
    }

    sendSuccessAudio.currentTime = 0;
    const p = sendSuccessAudio.play();
    if (p && typeof (p as Promise<void>).catch === "function") {
      (p as Promise<void>).catch(() => undefined);
    }
  } catch {
    // ignore
  }
};

// Type definitions for better type safety
type SetMessages = React.Dispatch<React.SetStateAction<Message[]>>;
type SetReplyingTo = React.Dispatch<React.SetStateAction<Message | null>>;
type SaveDraft = (conversationId: string, draft: string) => void;
type Drafts = Record<string, string>;

interface SendMessageParams {
  saveDraft: SaveDraft;
  setReplyingTo: SetReplyingTo;
  replyingTo: Message | null;
  drafts: Drafts;
  setMessages: SetMessages;
  isInternalConversation: boolean;
  isAssignedToMe: boolean;
  currentUserContactId: number;
  currentUserId?: number;
  conv: Conversation;
  message: OutgoingMessage;
}

interface DeleteMessageParams {
  setMessages: SetMessages;
  messages: Message[];
  isAssignedToMe: boolean;
  isInternalConversation: boolean;
  conv: Conversation;
  messageId: string;
  deleteForEveryone?: boolean;
}

interface UploadResponse {
  url: string;
  content_type?: string;
}

interface CreatedMessage {
  message_uuid?: string;
  id?: number;
  created_at?: string;
  status?: "pending" | "sent" | "delivered" | "read" | "failed";
  content?: string;
}

export const useHandleSend = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: uploadMedia, isPending: isUploadingMedia } =
    useUploadMedia();
  const { mutate: sendMessage } = useCreateMessage();

  return async ({
    saveDraft,
    setReplyingTo,
    replyingTo,
    drafts,
    setMessages,
    isInternalConversation,
    isAssignedToMe,
    currentUserContactId,
    currentUserId,
    conv,
    message,
  }: SendMessageParams) => {
    if (!conv?.numeric_id) return;
    if (conv.blocked) return;
    if (conv.closed) return;
    if (!isInternalConversation && !isAssignedToMe && conv.inbox_id != null)
      return;

    if (
      isInternalConversation &&
      (!currentUserContactId || currentUserContactId <= 0)
    ) {
      console.error(
        "Cannot send internal message: current user contact_id not found in localStorage",
      );
      return;
    }

    // Clear draft when message is sent
    const draftKey = getDraftKey(conv);
    if (drafts[draftKey]) {
      saveDraft(draftKey, "");
    }

    let mediaUrl: string | undefined = message.media?.url || message.audio?.url;
    let mediaType: string | undefined =
      message.media?.type || (message.audio ? "audio" : undefined);
    let mediaMimeType: string =
      message.audio?.blob?.type || message.media?.blob?.type || "";
    console.log("mediaMimeType", mediaMimeType);

    const textValue = message.text || "";
    const trimmedText = textValue.trim();

    const urlMatch = trimmedText.match(/(https?:\/\/[^\s]+)/);
    const urlInText = (() => {
      if (!urlMatch) return null;
      try {
        const url = new URL(urlMatch[1]);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url.toString();
      } catch {
        return null;
      }
    })();

    const isLinkMessage =
      !!urlInText &&
      !message.media &&
      !message.audio &&
      !message.location &&
      !message.template;

    if (isLinkMessage) {
      mediaUrl = urlInText;
      mediaType = "link";
    }

    // Check if media or audio needs uploading (if it's a blob url or local blob)
    // If mediaUrl starts with 'http' and NOT 'blob:', it's already uploaded
    const needsMediaUpload =
      message.media?.blob &&
      (!message.media.url || message.media.url.startsWith("blob:"));
    const needsAudioUpload =
      message.audio?.blob &&
      (!message.audio.url || message.audio.url.startsWith("blob:"));

    if (needsMediaUpload || needsAudioUpload) {
      try {
        let file: File;
        let fileName: string;
        let fileType: string;

        if (needsMediaUpload) {
          const uniqueFileName = generateUniqueFilename(
            message.media!.name,
            message.media!.blob.type,
          );
          file = new File([message.media!.blob], uniqueFileName, {
            type: message.media!.blob.type,
          });
          fileName = uniqueFileName;
          fileType = message.media!.type;
        } else {
          // Generate unique filename with timestamp and correct extension
          const uniqueFileName = generateUniqueFilename(
            "voice-recording",
            message.audio!.blob.type,
          );

          file = new File([message.audio!.blob], uniqueFileName, {
            type: message.audio!.blob.type,
          });
          fileName = uniqueFileName;
          fileType = "audio";
        }

        const uploadResponse = (await uploadMedia({ file })) as UploadResponse;
        mediaUrl = uploadResponse.url;
        mediaType = fileType;
        mediaMimeType = uploadResponse.content_type || file.type;
      } catch (error: unknown) {
        console.error("❌ Failed to upload media:", error);

        // Show user-friendly error message
        const errorMessage =
          (error as Error).message ||
          "Failed to upload media. Please try again.";
        alert(errorMessage);

        return; // Don't send the message if upload fails
      }
    }

    const normalizedMediaType =
      typeof mediaType === "string" ? mediaType : undefined;
    const isMediaMessage =
      !!mediaUrl && !!normalizedMediaType && normalizedMediaType !== "link";

    const resolvedMessageType: MessageType = (() => {
      if (message.template) return "template_message";
      if (isLinkMessage) return "text";
      if (message.location) return "location";
      if (!isMediaMessage) return "text";

      if (normalizedMediaType?.startsWith("image")) return "image";
      if (normalizedMediaType?.startsWith("video")) return "video";
      if (normalizedMediaType?.startsWith("audio")) return "audio";
      return "document";
    })();

    const optimisticId = `local-${Date.now()}`;

    // 1. Optimistic local update (chat + conversation list)
    const newMessage: Message = {
      id: optimisticId,
      senderId: "me",
      template_id: message.template_id ?? 0,

      createdAt: new Date().toISOString(),
      status: "sent",
      text: message.text || "",
      audioUrl: message.audio?.url,
      message_type: resolvedMessageType,
      audioBlob: message.audio?.blob,
      location: message.location
        ? { latitude: message.location.lat, longitude: message.location.lng }
        : undefined,
      template: message.template,
      mediaPending: needsMediaUpload || needsAudioUpload,
      media: mediaUrl
        ? {
            type: (mediaType as MediaType) || message.media?.type || "file",
            url: mediaUrl,
            thumbnail: undefined,
            metadata: undefined,
            name:
              message.media?.name ??
              (message.audio
                ? "recording.mp4"
                : (mediaUrl.split("/").pop() ?? "link")),
          }
        : undefined,
      replyTo: replyingTo
        ? {
            messageId: replyingTo.id,
            numericId:
              typeof replyingTo.numericId === "number"
                ? replyingTo.numericId
                : undefined,
            text: replyingTo.text || "[Media]",
            senderName:
              replyingTo.senderId === "me"
                ? "You"
                : conv?.name?.split(" ")[0] || "Other",
            message_type: replyingTo.message_type,
            media_type: replyingTo.media_type,
            media_url: replyingTo.media?.url,
            media_name: replyingTo.media?.name,
            direction: replyingTo.direction,
            location: replyingTo.location
              ? {
                  lat: replyingTo.location.latitude,
                  lng: replyingTo.location.longitude,
                }
              : undefined,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setReplyingTo(null);

    // Debug logging for optimistic message
    console.log("🚀 Creating optimistic message:", {
      messageId: newMessage.id,
      messageType: newMessage.message_type,
      hasReplyTo: !!newMessage.replyTo,
      replyToText: newMessage.replyTo?.text,
      replyToId: newMessage.replyTo?.numericId,
      isAudio: newMessage.message_type === "audio",
    });

    // 2. Send to API (reconcile in background)
    const payloadMessageType: MessageType = resolvedMessageType;

    const payloadMediaUrl = (() => {
      if (isLinkMessage) return null;
      if (!mediaUrl) return mediaUrl;
      const mediaIdx = mediaUrl.indexOf("/media/");
      if (mediaIdx >= 0) return mediaUrl.slice(mediaIdx);

      return mediaUrl;
    })();

    const payloadMediaType = (() => {
      if (isLinkMessage) return null;
      if (!isMediaMessage) return mediaType;

      // Backend expects a logical media category here (e.g. "image", "video", "document"),
      // not a MIME type like "image/png".
      if (normalizedMediaType?.startsWith("image")) return "image";
      if (normalizedMediaType?.startsWith("video")) return "video";
      if (normalizedMediaType?.startsWith("audio")) return "audio";
      return "document";
    })();
    const payloadContent = (() => {
      if (message.template) {
        return JSON.stringify(message.template);
      }

      // if (payloadMessageType =="document") {
      //   return (
      //     message.media?.name ?? (message.audio ? "recording.mp4" : message.media?.url.split("/").pop() ?? "link")
      //   );
      // }

      // For media, some backends reject empty content (422). If there's no caption,
      // send a safe placeholder.
      if (isMediaMessage) {
        const caption = message.text?.trim() || "";
        if (caption) return caption;

        // if (payloadMessageType === "image") return "[Image]";
        // if (payloadMessageType === "video") return "[Video]";
        // if (payloadMessageType === "audio") return "[Audio]";
        // return"[Document]";
      }
      return message.text || "";
    })();

    const payload: MessageCreate = {
      content: payloadContent,
      template_id: message.template_id,
      additional_attributes: buildTemplateComponents(message.template),
      conversation_id: conv.numeric_id,
      message_type: payloadMessageType,
      direction: isInternalConversation ? "inbound" : "outbound",
      private: false,
      channel_id: conv.channel_id,
      contact_id: conv.contact_id,
      inbox_id: conv.inbox_id,
      // sent_by_user_id: isInternalConversation && currentUserId != null ? Number(currentUserId) : undefined,
      // sent_by_contact_id: isInternalConversation
      //   ? currentUserContactId
      //   : undefined,
      media_url: payloadMediaUrl ?? undefined,
      media_type: payloadMediaType ?? undefined,
      media_name:
        message.media?.name ??
        (message.audio
          ? `Recording.${getFileExtension(payloadMediaType ?? "")}`
          : undefined),
      reply_to_message_id:
        replyingTo && typeof replyingTo.numericId === "number"
          ? replyingTo.numericId
          : undefined,
    };

    // Debug logging for WhatsApp reply context
    console.log("🔍 Sending message payload:", {
      messageType: payloadMessageType,
      isAudio: payloadMessageType === "audio",
      hasReplyTo: !!payload.reply_to_message_id,
      replyToId: payload.reply_to_message_id,
      replyingToText: replyingTo?.text,
      replyingToType: replyingTo?.message_type,
      channelId: conv.channel_id,
    });

    sendMessage(payload, {
      onSuccess: (created: CreatedMessage) => {
        // Debug logging for server response
        console.log("✅ Message sent successfully:", {
          createdId: created.id,
          createdUuid: created.message_uuid,
          serverStatus: created.status,
          serverContent: created.content,
          originalReplyTo: payload.reply_to_message_id,
        });

        playSendSuccessSound();

        setMessages((prev) => {
          const createdId =
            created.message_uuid ??
            (typeof created.id === "number" ? `msg-${created.id}` : undefined);
          const createdNumericId = created.id;

          // Find the optimistic message first
          const optimisticMessage = prev.find((m) => m.id === optimisticId);

          if (optimisticMessage) {
            const reconciled = prev.map((m) => {
              if (m.id === optimisticId) {
                return {
                  ...m,
                  id: createdId ?? m.id,
                  numericId: createdNumericId ?? m.numericId,
                  createdAt: created.created_at ?? m.createdAt,
                  status:
                    (created.status as
                      | "pending"
                      | "sent"
                      | "delivered"
                      | "read"
                      | "failed") ?? m.status,
                };
              }
              return m;
            });

            return reconciled;
          }

          const reconciled = prev.map((m) => {
            if (m.id !== optimisticId) return m;
            return {
              ...m,
              id: createdId ?? m.id,
              numericId: createdNumericId ?? m.numericId,
              createdAt: created.created_at ?? m.createdAt,
              status:
                (created.status as
                  | "pending"
                  | "sent"
                  | "delivered"
                  | "read"
                  | "failed") ?? m.status,
            };
          });

          return reconciled;
        });

        // Update sidebar preview and clear unread badge immediately,
        // before the WS echo arrives.
        updateConversationInCache(queryClient, conv.id, (c) => ({
          ...c,
          unread_messages_count: 0,
          ...(created.id
            ? {
                last_message: {
                  ...(c.last_message ?? {}),
                  ...(created as any),
                  sent_by_user_id: currentUserId,
                },
                last_message_id: created.id,
              }
            : {}),
        }));
      },
      onError: (error) => {
        console.error("❌ Failed to send message:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, status: "failed" } : m,
          ),
        );
      },
    });
  };
};

export const useHandleDelete = () => {
  const { mutate: deleteMessage } = useDeleteMessage();

  return ({
    setMessages,
    messages,
    isAssignedToMe,
    isInternalConversation,
    conv,
    messageId,
    deleteForEveryone,
  }: DeleteMessageParams) => {
    if (!conv) return;
    if (conv.blocked) return;
    if (conv.closed) return;
    if (!isInternalConversation && !isAssignedToMe && conv.inbox_id != null)
      return;
    // Find the message to get its numeric ID
    const message = messages.find((msg) => msg.id === messageId);
    if (!message?.numericId) {
      console.error("Cannot delete message: numeric ID not found");
      return;
    }

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, deletedBy: deleteForEveryone ? "everyone" : "me" }
          : msg,
      ),
    );

    // Call API to delete message
    deleteMessage(message.numericId, {
      onError: (error: unknown) => {
        console.error("Failed to delete message:", error);
        // Revert optimistic update on error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, deletedBy: undefined } : msg,
          ),
        );
        alert("Failed to delete message. Please try again.");
      },
    });

    console.log(
      `Deleting message ${messageId} (ID: ${message.numericId}) ${deleteForEveryone ? "for everyone" : "for me"}`,
    );
  };
};

interface EditMessageParams {
  setMessages: SetMessages;
  messages: Message[];
  isAssignedToMe: boolean;
  isInternalConversation: boolean;
  conv: Conversation;
  messageId: string;
  newContent: string;
}

export const useHandleEdit = () => {
  const { mutate: updateMessage } = useUpdateMessage();
  const queryClient = useQueryClient();

  return ({
    setMessages,
    messages,
    isAssignedToMe,
    isInternalConversation,
    conv,
    messageId,
    newContent,
  }: EditMessageParams) => {
    if (!conv) return;
    if (conv.blocked) return;
    if (conv.closed) return;
    if (!isInternalConversation && !isAssignedToMe && conv.inbox_id != null)
      return;

    // Find the message to get its numeric ID and current content
    const message = messages.find((msg) => msg.id === messageId);
    if (!message?.numericId) {
      console.error("Cannot edit message: numeric ID not found");
      return;
    }

    const trimmedContent = newContent.trim();

    // Resolve current displayed text (editedMessage if already edited, else original)
    const currentDisplayedText = (() => {
      const a = message.additional_attributes;
      if (!a) return message.text;
      const parsed = typeof a === 'string' ? (() => { try { return JSON.parse(a); } catch { return {}; } })() : (a as Record<string, any>);
      return (parsed?.isEdited && parsed?.editedMessage) ? parsed.editedMessage : message.text;
    })();

    // Don't update if content is the same
    if (currentDisplayedText === trimmedContent) {
      console.log("Message content unchanged, skipping update");
      return;
    }

    const originalAttributes = message.additional_attributes;

    // Build additional_attributes preserving existing isStar/isPinned and marking as edited
    const existingAttrs = (() => {
      const attrs = message.additional_attributes;
      if (!attrs) return {};
      if (typeof attrs === 'string') {
        try { return JSON.parse(attrs); } catch { return {}; }
      }
      return attrs as Record<string, any>;
    })();
    const editedAttributes = JSON.stringify({
      ...existingAttrs,
      isEdited: true,
      editedMessage: trimmedContent,
    });

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, edited: true, additional_attributes: editedAttributes }
          : msg,
      ),
    );

    // Update the React Query cache (correct key) so mappedFirstPage has the edit
    // when switching conversations and back, preventing Redux overwrite with stale data
    queryClient.setQueriesData(
      { queryKey: ["conversationMessages", conv.numeric_id] },
      (oldData: any) => {
        if (!oldData?.items) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((msg: any) =>
            Number(msg.id) === Number(message.numericId)
              ? { ...msg, additional_attributes: editedAttributes }
              : msg,
          ),
        };
      },
    );

    // Update the single-message cache used by ConversationItem sidebar preview
    queryClient.setQueryData(
      ["messages", message.numericId],
      (oldData: any) => oldData ? { ...oldData, additional_attributes: editedAttributes } : oldData,
    );

    // Update sidebar last_message if this is the last message of the conversation
    if (Number(message.numericId) === Number(conv.last_message_id)) {
      updateConversationInCache(queryClient, conv.id, (c) => ({
        ...c,
        last_message: c.last_message
          ? { ...c.last_message, content: trimmedContent, additional_attributes: editedAttributes }
          : c.last_message,
      }));
    }

    // Call API to update message (content unchanged, only additional_attributes updated)
    updateMessage(
      {
        messageId: message.numericId,
        data: { additional_attributes: editedAttributes },
      },
      {
        onSuccess: () => {
          console.log(`✅ Message ${messageId} updated successfully`);

          // Update the React Query cache with the server response
          queryClient.setQueriesData(
            { queryKey: ["conversationMessages", conv.numeric_id] },
            (oldData: any) => {
              if (!oldData?.items) return oldData;
              return {
                ...oldData,
                items: oldData.items.map((msg: any) =>
                  Number(msg.id) === Number(message.numericId)
                    ? { ...msg, additional_attributes: editedAttributes }
                    : msg,
                ),
              };
            },
          );

          // Invalidate to trigger a background refetch with correct data
          queryClient.invalidateQueries({
            queryKey: ["conversationMessages", conv.numeric_id],
          });
        },
        onError: (error: unknown) => {
          console.error("❌ Failed to edit message:", error);
          // Revert optimistic update on error
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, edited: false, additional_attributes: originalAttributes }
                : msg,
            ),
          );

          // Revert React Query cache on error
          queryClient.setQueriesData(
            { queryKey: ["conversationMessages", conv.numeric_id] },
            (oldData: any) => {
              if (!oldData?.items) return oldData;
              return {
                ...oldData,
                items: oldData.items.map((msg: any) =>
                  Number(msg.id) === Number(message.numericId)
                    ? { ...msg, additional_attributes: originalAttributes }
                    : msg,
                ),
              };
            },
          );

          alert("Failed to edit message. Please try again.");
        },
      },
    );

    console.log(`Editing message ${messageId} (ID: ${message.numericId})`);
  };
};
