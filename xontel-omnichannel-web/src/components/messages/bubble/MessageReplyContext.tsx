import React, { useMemo, useState, useEffect } from "react";
import {
  Reply as ReplyIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  FileSpreadsheet,
  FileSliders,
  FileArchive,
  MapPin,
  Mic,
  Link2,
  LayoutTemplate,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { normalizeMediaUrl } from "@/utils/urlHelper";
import { useLinkMetadata } from "@/hooks/useLinkMetadata";
import { Message } from "@/types/chat";
import { useAuthUser } from "@/contexts/AuthContext";
import { messagesAPI } from "@/api/messages/endpoints";
import { MapMessages } from "../hooks/useMapMessage";
import { useContact } from "@/api/contacts/hooks";
import { useUser } from "@/api/users/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { MessageResponse } from "@/api/messages/types";

interface MessageReplyContextProps {
  replyTo: Message["replyTo"];
  isSender: boolean;
  isDarkMode: boolean;
  safeUrlTransform: (url: string) => string;
  isInternalConversation?: boolean;
  partnerName?: string;
}

export default function MessageReplyContext({
  replyTo,
  isSender,
  isDarkMode,
  safeUrlTransform,
  isInternalConversation,
  partnerName,
}: MessageReplyContextProps) {
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const [fetchedParent, setFetchedParent] = useState<Message | null>(null);

  const resolvedReplyMessage = useMemo(() => {
    if (!fetchedParent || !replyTo) return null;
    const targetNumericId =
      typeof replyTo?.numericId === "number" ? replyTo?.numericId : null;
    const targetId = replyTo?.messageId ? String(replyTo?.messageId) : null;
    if (
      (targetNumericId != null && fetchedParent.numericId === targetNumericId) ||
      (targetId && String(fetchedParent.id) === targetId)
    ) {
      return fetchedParent;
    }
    return null;
  }, [fetchedParent, replyTo?.messageId, replyTo?.numericId]);

  const getActualSenderId = useMemo<{
    type: "user" | "contact" | null;
    id: number | null;
  }>(() => {
    const sentByUserId = (resolvedReplyMessage as any)?.sent_by_user_id;
    if (
      typeof sentByUserId === "number" &&
      Number.isFinite(sentByUserId) &&
      sentByUserId > 0
    ) {
      return { type: "user", id: sentByUserId };
    }

    // Prefer senderId stored directly on replyTo (populated by useMapMessage)
    // so we can resolve the user without fetching the parent message.
    const rawSenderId = String(
      (resolvedReplyMessage as any)?.senderId ||
      (replyTo as any)?.senderId ||
      ""
    );
    if (!rawSenderId || rawSenderId === "me") return { type: null, id: null };

    const contactMatch = rawSenderId.match(/^contact-(\d+)$/);
    if (contactMatch) {
      const id = Number(contactMatch[1]);
      return { type: "contact", id: Number.isFinite(id) ? id : null };
    }

    const userMatch = rawSenderId.match(/^user-(\d+)$/);
    if (userMatch) {
      const id = Number(userMatch[1]);
      return { type: "user", id: Number.isFinite(id) ? id : null };
    }

    const numericId = Number(rawSenderId);
    if (Number.isFinite(numericId) && numericId > 0) {
      return { type: "user", id: numericId };
    }

    return { type: null, id: null };
  }, [resolvedReplyMessage, replyTo]);

  const { data: resolvedSenderContact } = useContact(
    getActualSenderId.type === "contact" ? getActualSenderId.id || 0 : 0,
  );
  const { data: resolvedSenderUser } = useUser(
    getActualSenderId.type === "user" ? getActualSenderId.id || 0 : 0,
  );

  const getColorByFirstLetter = (name: string) => {
    const letter = String(name || "?")[0] || "?";
    const code = letter.toUpperCase().charCodeAt(0);
    const idx = Number.isFinite(code) ? Math.abs(code - 65) % 8 : 0;

    const colors = [
      "text-emerald-600 dark:text-emerald-400",
      "text-sky-600 dark:text-sky-400",
      "text-violet-600 dark:text-violet-400",
      "text-amber-600 dark:text-amber-400",
      "text-rose-600 dark:text-rose-400",
      "text-teal-600 dark:text-teal-400",
      "text-fuchsia-600 dark:text-fuchsia-400",
      "text-indigo-600 dark:text-indigo-400",
    ];

    return colors[idx];
  };

  // Track fetched IDs to prevent duplicate requests in the same component instance
  const [isFetchingParent, setIsFetchingParent] = useState(false);

  useEffect(() => {
    const targetNumericId =
      typeof replyTo?.numericId === "number" ? replyTo?.numericId : null;

    // Only fetch if we have an ID, no local message, no text preview, and not already fetching
    if (
      !targetNumericId ||
      resolvedReplyMessage ||
      (replyTo?.text && replyTo?.text.trim()) ||
      isFetchingParent
    ) {
      return;
    }

    const fetchParent = async () => {
      // Check RQ cache first — another bubble for the same parent may have already fetched it
      const cached = queryClient.getQueryData<MessageResponse>(["messages", targetNumericId]);
      if (cached) {
        const mapped = MapMessages(user.contact_id, user.id, [cached], [])[0];
        if (mapped) { setFetchedParent(mapped); return; }
      }

      setIsFetchingParent(true);
      try {
        const parent = await messagesAPI.getMessage(targetNumericId);
        if (parent) {
          // Populate cache so sibling and future instances skip the fetch
          queryClient.setQueryData(["messages", parent.id], parent);
          const mapped = MapMessages(user.contact_id, user.id, [parent], [])[0];
          if (mapped) {
            setFetchedParent(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch old reply parent:", err);
      } finally {
        setIsFetchingParent(false);
      }
    };

    fetchParent();
  }, [
    replyTo?.numericId,
    resolvedReplyMessage,
    replyTo?.text,
    user.id,
    user.contact_id,
    isFetchingParent,
  ]);

  const resolvedMediaUrl =
    replyTo?.media_url || resolvedReplyMessage?.media?.url;
  const resolvedMediaName =
    replyTo?.media_name || resolvedReplyMessage?.media?.name;

  const getFileExt = (nameOrUrl: string | undefined | null) => {
    const raw = String(nameOrUrl || "").trim();
    if (!raw) return "";
    const base = raw.split(/[?#]/)[0];
    const part = base.split("/").pop() || base;
    const dot = part.lastIndexOf(".");
    if (dot === -1) return "";
    return part.slice(dot + 1).toLowerCase();
  };

  const fileMeta = useMemo(() => {
    const ext = getFileExt(resolvedMediaName) || getFileExt(resolvedMediaUrl);
    const byExt = (e: string) => {
      if (e === "pdf")
        return {
          kind: "pdf" as const,
          label: "PDF",
          icon: FileText,
          className: "text-red-600 dark:text-red-400",
        };
      if (e === "doc" || e === "docx")
        return {
          kind: "word" as const,
          label: "Word",
          icon: FileText,
          className: "text-sky-600 dark:text-sky-400",
        };
      if (e === "xls" || e === "xlsx" || e === "csv")
        return {
          kind: "excel" as const,
          label: "Excel",
          icon: FileSpreadsheet,
          className: "text-emerald-600 dark:text-emerald-400",
        };
      if (e === "ppt" || e === "pptx")
        return {
          kind: "ppt" as const,
          label: "PowerPoint",
          icon: FileSliders,
          className: "text-amber-600 dark:text-amber-400",
        };
      if (e === "zip" || e === "rar" || e === "7z")
        return {
          kind: "archive" as const,
          label: "Archive",
          icon: FileArchive,
          className: "text-xon-text-secondary",
        };
      return {
        kind: "file" as const,
        label: "Document",
        icon: FileText,
        className: "text-xon-text-secondary",
      };
    };
    return byExt(ext);
  }, [resolvedMediaName, resolvedMediaUrl]);

  const templateSummary = useMemo(() => {
    const t = (resolvedReplyMessage as any)?.template;
    if (!t) return null;
    const title = String(t.header_text || t.name || "template_message").trim();
    const body = String(t.body_text || "").trim();
    const firstLine = body.split("\n")[0]?.trim() || body;
    return {
      title: title || "template_message",
      body: firstLine,
    };
  }, [resolvedReplyMessage]);
  const resolvedPreviewText = (() => {
    if (templateSummary) {
      return `${templateSummary.title} · ${templateSummary.body || "template_message"}`;
    }
    const raw = String(replyTo?.text || "").trim();
    if (raw) return raw;
    const fromMsg = String(resolvedReplyMessage?.text || "").trim();
    if (fromMsg) return fromMsg;
    const t = String(
      replyTo?.message_type || replyTo?.media_type || "",
    ).toLowerCase();
    if (t.includes("template_message")) return "template_message";
    if (t.includes("image")) return "Photo";
    if (t.includes("video")) return "Video";
    if (t.includes("audio")) return "Voice message";
    if (t.includes("location")) return "Location";
    if (
      t.includes("file") ||
      t.includes("document") ||
      t.includes("application")
    )
      return "Document";
    if (t === "calls") return "Call";
    return "";
  })();

  const replyMeta = useMemo(() => {
    const t = String(
      replyTo?.message_type || replyTo?.media_type || "",
    ).toLowerCase();
    const urlString = String(
      replyTo?.media_url || replyTo?.text || "",
    ).toLowerCase();
    const hasVideoExt = /\.(mp4|webm|ogg|mov)($|\?)/.test(urlString);
    const hasImageExt = /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/.test(urlString);

    const isLocation = !!replyTo?.location || t.includes("location");
    const isTemplate = !!templateSummary || t.includes("template_message");
    const isImage = t.includes("image") || hasImageExt;
    const isVideo = t.includes("video") || hasVideoExt;
    const isAudio = t.includes("audio");
    const isFile =
      t.includes("file") || t.includes("document") || t.includes("application");
    const isLink = t.includes("link");
    const isCall = t === "calls";

    return {
      t,
      isLocation,
      isTemplate,
      isImage,
      isVideo,
      isAudio,
      isFile,
      isLink,
      isCall,
      url: resolvedMediaUrl,
      name: resolvedMediaName,
      previewText: resolvedPreviewText.replace(/\s+/g, " ").trim(),
    };
  }, [
    replyTo,
    resolvedMediaName,
    resolvedMediaUrl,
    resolvedPreviewText,
    templateSummary,
  ]);

  const extractFirstUrl = (raw: string | undefined) => {
    const s = String(raw || "");
    const m = s.match(/(https?:\/\/[^\s]+)/i);
    return m ? m[1] : null;
  };

  const replyLinkUrl = (() => {
    // If it's a location reply, we don't want a link preview
    if (replyMeta?.isLocation) return null;

    // Template replies should not behave like link replies
    if ((replyMeta as any)?.isTemplate) return null;

    // Prioritize media_url if it's a link or video type
    if ((replyMeta?.isLink || replyMeta?.isVideo) && replyTo?.media_url)
      return replyTo?.media_url;

    // Otherwise, try to extract a URL from the text
    return extractFirstUrl(replyTo?.text) || null;
  })();

  const { metadata: replyLinkMeta } = useLinkMetadata(
    replyLinkUrl || undefined,
  );

  const formatDuration = (seconds: number | null) => {
    if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "";
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const replyAudioUrl = useMemo(() => {
    if (!replyMeta?.isAudio) return null;
    return replyTo?.media_url || null;
  }, [replyTo, replyMeta?.isAudio]);

  const [replyAudioDurationSec, setReplyAudioDurationSec] = useState<
    number | null
  >(null);

  const senderName = useMemo(() => {
    if (isFetchingParent) return "Loading...";
    if (resolvedReplyMessage?.senderId === "me") return "You";

    // For internal conversations, prioritize the explicit replyTo sender name (e.g., agent name like 'mew')
    if (
      isInternalConversation &&
      replyTo?.senderName &&
      replyTo?.senderName !== "Other"
    )
      return replyTo?.senderName;

    // If we have the original replied-to message locally, prefer its resolved senderName
    const resolvedFromMessage = String(
      (resolvedReplyMessage as any)?.senderName || "",
    ).trim();
    if (resolvedFromMessage && resolvedFromMessage !== "Other")
      return resolvedFromMessage;

    // For 1-to-1 conversations, prefer the known partner/contact name.
    if (!isInternalConversation && partnerName) return partnerName;

    if (replyTo?.senderName && replyTo?.senderName !== "Other")
      return replyTo?.senderName;

    const resolved =
      resolvedSenderContact?.name ||
      resolvedSenderUser?.full_name ||
      resolvedSenderUser?.email;
    if (resolved) return resolved;

    // Try to get name from resolved message if available
    const anyMsg = resolvedReplyMessage as any;
    return (
      anyMsg?.contact_name ||
      anyMsg?.sender?.name ||
      replyTo?.senderName ||
      "Other"
    );
  }, [
    isFetchingParent,
    isInternalConversation,
    partnerName,
    replyTo?.senderName,
    resolvedReplyMessage,
    resolvedSenderContact?.name,
    resolvedSenderUser?.full_name,
    resolvedSenderUser?.email,
  ]);

  const isReplyToMine = senderName === "You";

  const senderNameClassName = isReplyToMine
    ? "text-xon-text-secondary"
    : isInternalConversation
      ? getColorByFirstLetter(senderName)
      : "text-xon-text-secondary";

  useEffect(() => {
    if (!replyAudioUrl) {
      setReplyAudioDurationSec(null);
      return;
    }
    const src = normalizeMediaUrl(replyAudioUrl);
    const audio = new Audio(src);
    const handleLoaded = () => {
      const d = audio.duration;
      setReplyAudioDurationSec(Number.isFinite(d) ? d : null);
    };
    audio.addEventListener("loadedmetadata", handleLoaded);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.src = "";
    };
  }, [replyAudioUrl]);

  // Video duration detection
  const replyVideoUrl = useMemo(() => {
    if (!replyMeta?.isVideo) return null;
    return replyTo?.media_url || null;
  }, [replyTo?.media_url, replyMeta?.isVideo]);

  const [replyVideoDurationSec, setReplyVideoDurationSec] = useState<
    number | null
  >(null);
  useEffect(() => {
    if (!replyVideoUrl) {
      setReplyVideoDurationSec(null);
      return;
    }
    const src = normalizeMediaUrl(replyVideoUrl);
    const video = document.createElement("video");
    video.src = src;
    video.preload = "metadata";

    const handleLoaded = () => {
      const d = video.duration;
      setReplyVideoDurationSec(Number.isFinite(d) ? d : null);
    };

    const handleError = () => {
      setReplyVideoDurationSec(null);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("error", handleError);
      video.src = "";
    };
  }, [replyVideoUrl]);

  if (!replyTo) return null;

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("jump-to-message", {
            detail: {
              messageId: replyTo.messageId,
              numericId: replyTo.numericId,
            },
          }),
        );
      }}
      className={`mt-1 mb-2 w-full text-left rounded-lg px-3 py-2 border-l-4 border-l-xon-primary transition-colors hover:bg-xon-surface-container-hover dark:hover:bg-white/10 ${
        isSender
          ? "bg-xon-surface-container-hover dark:bg-white/10"
          : "bg-gray-100 dark:bg-gray-800/60"
      }`}
      aria-label="Jump to replied message"
    >
      <div className="flex items-start gap-3 w-full">
        {/* Accent bar and content on the left */}
        <div className="flex-1 min-w-0 flex flex-col justify-start">
          <p
            className={`text-xs font-semibold leading-tight mb-1 ${senderNameClassName}`}
          >
            {senderName}
          </p>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="min-w-0 flex-1 text-xs text-foreground/70">
              {replyMeta?.isAudio ? (
                <div className="flex items-center gap-1.5">
                  <Mic className="h-3 w-3" />
                  <span>
                    Voice message · {formatDuration(replyAudioDurationSec)}
                  </span>
                </div>
              ) : replyMeta?.isVideo ? (
                <div className="flex items-start gap-1.5">
                  <svg
                    className="h-3 w-3 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="line-clamp-3">
                    Video
                    {replyVideoDurationSec &&
                      ` · ${formatDuration(replyVideoDurationSec)}`}
                    {replyMeta.previewText && ` · ${replyMeta.previewText}`}
                  </span>
                </div>
              ) : replyMeta?.isImage ? (
                <div className="flex items-start gap-1.5">
                  <svg
                    className="h-3 w-3 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="line-clamp-3">
                    {replyMeta.previewText || "Image"}
                  </span>
                </div>
              ) : replyMeta?.isLocation ? (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span>Location</span>
                </div>
              ) : replyMeta?.isTemplate ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <LayoutTemplate className="h-3 w-3 shrink-0" />
                  <span className="shrink-0">Template</span>
                  <span className="truncate">{resolvedPreviewText}</span>
                </div>
              ) : replyLinkUrl ? (
                <div className="flex items-center gap-1.5">
                  <Link2 className="h-3 w-3" />
                  <span className="truncate">
                    {replyLinkMeta?.title ||
                      replyLinkUrl
                        .replace(/^https?:\/\//, "")
                        .split(/[/?#]/)[0]}
                  </span>
                </div>
              ) : replyMeta?.isFile ? (
                <div className="flex items-center gap-1.5">
                  <fileMeta.icon className={`h-3 w-3 ${fileMeta.className}`} />
                  <span className="truncate">
                    {replyMeta?.name || fileMeta.label}
                  </span>
                </div>
              ) : replyMeta?.isCall ? (
                <div className="flex items-center gap-1.5 line-clamp-1">
                  {(() => {
                    const direction =
                      replyTo.direction ||
                      (resolvedReplyMessage as any)?.direction;
                    const originalText =
                      replyTo.text || (resolvedReplyMessage as any)?.text || "";
                    const isMissed =
                      originalText.toLowerCase().includes("missed") ||
                      (resolvedReplyMessage as any)?.additional_attributes
                        ?.status === "missed";
                    const isVideo =
                      originalText.toLowerCase().includes("video") ||
                      (resolvedReplyMessage as any)?.additional_attributes
                        ?.type === "video";

                    const displayText = isVideo ? "Video call" : "Voice call";
                    const Icon = isMissed
                      ? PhoneMissed
                      : direction === "outbound"
                        ? PhoneOutgoing
                        : PhoneIncoming;

                    return (
                      <>
                        <Icon
                          className={`h-3 w-3 shrink-0 ${isMissed ? "text-red-500" : ""}`}
                        />
                        <span className={isMissed ? "text-red-500" : ""}>
                          {displayText}
                        </span>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <span className="line-clamp-3">{resolvedPreviewText}</span>
              )}
            </div>
          </div>
        </div>

        {/* Media Thumbnail on the right */}
        {!replyMeta?.isAudio &&
          !replyMeta?.isLocation &&
          !replyMeta?.isCall &&
          (() => {
            if (replyMeta?.isTemplate) {
              return (
                <div className="h-10 w-10 rounded bg-black/5 dark:bg-white/5 overflow-hidden shrink-0 relative flex items-center justify-center">
                  <LayoutTemplate className="h-5 w-5 text-foreground/40" />
                </div>
              );
            }
            const allowVideoThumb = !!replyMeta?.isVideo;
            const allowImageThumb = !!replyMeta?.isImage;
            const allowLinkThumb = !!(
              replyLinkUrl &&
              replyLinkMeta?.image &&
              !replyMeta?.isVideo &&
              !replyMeta?.isImage
            );

            if (!allowVideoThumb && !allowImageThumb && !allowLinkThumb)
              return null;

            // Determine the thumbnail source
            let thumbnailSrc = "";

            // For link previews with metadata images
            if (allowLinkThumb) {
              thumbnailSrc = replyLinkMeta!.image!;
            }
            // For regular media - check both replyMeta.url and replyTo.media_url
            else if (replyMeta?.url) {
              thumbnailSrc = replyMeta.url;
            } else if (replyTo.media_url) {
              thumbnailSrc = replyTo.media_url;
            }

            // Only render if we have a valid source
            if (!thumbnailSrc) return null;

            return (
              <div className="h-10 w-10 rounded bg-black/5 dark:bg-white/5 overflow-hidden shrink-0 relative">
                {replyMeta?.isVideo ? (
                  <>
                    <video
                      src={normalizeMediaUrl(thumbnailSrc)}
                      className="h-full w-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={normalizeMediaUrl(thumbnailSrc)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
            );
          })()}
      </div>
    </button>
  );
}
