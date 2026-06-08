import React, { useState, useEffect } from "react";
import {
  Pin,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Video,
  Mic,
  FileText,
  MapPin,
} from "lucide-react";
import type { Message } from "@/types/chat";

interface PinnedMessagesBannerProps {
  pinnedMessages: Message[];
  conversationId: string | null;
  onNavigate: (messageId: string) => void;
}

export default function PinnedMessagesBanner({
  pinnedMessages,
  conversationId,
  onNavigate,
}: PinnedMessagesBannerProps): React.ReactElement | null {
  const [pinnedBannerIndex, setPinnedBannerIndex] = useState(0);
  const [pinnedBannerDismissed, setPinnedBannerDismissed] = useState(false);

  useEffect(() => {
    setPinnedBannerDismissed(false);
    setPinnedBannerIndex(0);
  }, [conversationId]);

  if (pinnedMessages.length === 0 || pinnedBannerDismissed) return null;

  const safeIndex = Math.min(pinnedBannerIndex, pinnedMessages.length - 1);
  const pinned = pinnedMessages[safeIndex];

  const attrs = (() => {
    const a = (pinned as any).additional_attributes;
    if (!a) return {};
    if (typeof a === "string") {
      try {
        return JSON.parse(a);
      } catch {
        return {};
      }
    }
    return a;
  })();

  const displayText =
    attrs?.isEdited && attrs?.editedMessage
      ? attrs.editedMessage
      : pinned.text || "";

  const media = pinned.media;
  const mediaType = media?.type;

  const pinnedPreview = (() => {
    if (mediaType === "image") {
      return (
        <div className="flex items-center gap-1.5">
          {media?.url ? (
            <img
              src={media.url}
              alt="image"
              className="h-7 w-7 rounded object-cover shrink-0"
            />
          ) : (
            <ImageIcon className="h-4 w-4 shrink-0 opacity-60" />
          )}
          <span className="truncate">{displayText || media?.name || "Photo"}</span>
        </div>
      );
    }
    if (mediaType === "video") {
      return (
        <div className="flex items-center gap-1.5">
          {media?.thumbnail ? (
            <img
              src={media.thumbnail}
              alt="video"
              className="h-7 w-7 rounded object-cover shrink-0"
            />
          ) : (
            <Video className="h-4 w-4 shrink-0 opacity-60" />
          )}
          <span className="truncate">{displayText || media?.name || "Video"}</span>
        </div>
      );
    }
    if (mediaType === "audio" || pinned.audioUrl) {
      return (
        <div className="flex items-center gap-1.5">
          <Mic className="h-4 w-4 shrink-0 opacity-60" />
          <span className="truncate">{displayText || "Audio message"}</span>
        </div>
      );
    }
    if (mediaType === "file") {
      return (
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 shrink-0 opacity-60" />
          <span className="truncate">{displayText || media?.name || "File"}</span>
        </div>
      );
    }
    if (pinned.location) {
      return (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 opacity-60" />
          <span className="truncate">Location</span>
        </div>
      );
    }
    return <span className="truncate">{displayText || "Message"}</span>;
  })();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-xon-surface-container border-b border-xon-surface-outline z-10 shrink-0">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-xon-primary/10 shrink-0">
        <Pin className="h-4 w-4 text-xon-primary fill-xon-primary" />
      </div>
      <button
        className="flex-1 min-w-0 text-start"
        onClick={() => onNavigate(pinned.id)}
      >
        <p className="text-[10px] font-semibold text-xon-primary leading-none mb-0.5">
          Pinned Message{" "}
          {pinnedMessages.length > 1
            ? `${safeIndex + 1}/${pinnedMessages.length}`
            : ""}
        </p>
        <p className="text-xs text-xon-text-secondary truncate flex items-center">
          {pinnedPreview}
        </p>
      </button>
      {pinnedMessages.length > 1 && (
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={() =>
              setPinnedBannerIndex(
                (i) => (i - 1 + pinnedMessages.length) % pinnedMessages.length,
              )
            }
            className="p-0.5 rounded hover:bg-xon-surface-outline transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5 text-xon-text-secondary" />
          </button>
          <button
            onClick={() =>
              setPinnedBannerIndex((i) => (i + 1) % pinnedMessages.length)
            }
            className="p-0.5 rounded hover:bg-xon-surface-outline transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5 text-xon-text-secondary" />
          </button>
        </div>
      )}
    </div>
  );
}
