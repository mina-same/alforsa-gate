import React, { useEffect, useMemo, useState } from "react";

import { MapPin, Mic, X, FileText, FileSpreadsheet, FileSliders, FileArchive, Link2, LayoutTemplate, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { Button } from "@components/ui/button";
import { Link as LinkIcon } from "lucide-react";

import MediaPreview from "../MediaPreview";
import VoiceMessagePlayer from "../record/VoiceMessagePlayer";
import ReplyPreviewMarkdown from "./ReplyPreviewMarkdown";
import { useLinkMetadata } from "@/hooks/useLinkMetadata";
import { normalizeMediaUrl } from "@/utils/urlHelper";

import type { Message } from "@/types/chat";

export default function ReplyBar({
  replyingTo,
  partnerName,
  isDarkMode,
  isInternalConversation,
  onClearReply,
}: {
  replyingTo: Message;
  partnerName: string;
  isDarkMode: boolean;
  isInternalConversation?: boolean;
  onClearReply?: () => void;
}) {
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
    const ext =
      getFileExt((replyingTo as any)?.media?.name) ||
      getFileExt((replyingTo as any)?.media?.url) ||
      getFileExt((replyingTo as any)?.media_url) ||
      getFileExt((replyingTo as any)?.media_name);

    const byExt = (e: string) => {
      if (e === "pdf") return { label: "PDF", icon: FileText, className: "text-red-600 dark:text-red-400" };
      if (e === "doc" || e === "docx") return { label: "Word", icon: FileText, className: "text-sky-600 dark:text-sky-400" };
      if (e === "xls" || e === "xlsx" || e === "csv") return { label: "Excel", icon: FileSpreadsheet, className: "text-emerald-600 dark:text-emerald-400" };
      if (e === "ppt" || e === "pptx") return { label: "PowerPoint", icon: FileSliders, className: "text-amber-600 dark:text-amber-400" };
      if (e === "zip" || e === "rar" || e === "7z") return { label: "Archive", icon: FileArchive, className: "text-xon-text-secondary" };
      return { label: "Document", icon: FileText, className: "text-xon-text-secondary" };
    };

    return byExt(ext);
  }, [replyingTo]);

  const formatDuration = (seconds: number | null) => {
    if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "";
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const limitWords = (text: string | undefined, limit: number = 3) => {
    if (!text) return "";
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(" ") + "...";
  };

  const extractFirstUrl = (raw: string | undefined) => {
    const s = String(raw || "");
    const m = s.match(/(https?:\/\/[^\s]+)/i);
    return m ? m[1] : null;
  };

  const looksLikeMapsUrl = (url: string | null | undefined) => {
    if (!url) return false;
    const s = String(url);
    if (!/^https?:\/\//i.test(s)) return false;
    try {
      const u = new URL(s);
      const host = u.hostname.toLowerCase();
      const path = u.pathname.toLowerCase();

      if (host.includes("maps.google.")) return true;
      if (host === "maps.app.goo.gl") return true;
      if (host.endsWith("google.com") && path.startsWith("/maps")) return true;
      return false;
    } catch {
      return /maps\.google\.|google\.com\/maps|maps\.app\.goo\.gl/i.test(s);
    }
  };

  const parseLocationFromText = (text: string | undefined): { lat: number; lng: number } | null => {
    const raw = String(text || "").trim();
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof (parsed as any).lat === "number" &&
        typeof (parsed as any).lng === "number"
      ) {
        return { lat: (parsed as any).lat, lng: (parsed as any).lng };
      }
    } catch {
      // ignore
    }

    const coords = raw.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coords) {
      const lat = Number(coords[1]);
      const lng = Number(coords[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    const url = extractFirstUrl(raw);
    if (!url) return null;

    const qMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
    if (qMatch) {
      const lat = Number(qMatch[1]);
      const lng = Number(qMatch[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    const atMatch = url.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
    if (atMatch) {
      const lat = Number(atMatch[1]);
      const lng = Number(atMatch[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    const queryMatch = url.match(/[?&](query|ll|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
    if (queryMatch) {
      const lat = Number(queryMatch[2]);
      const lng = Number(queryMatch[3]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    return null;
  };

  const isLocationReply =
    String(replyingTo.message_type || "").toLowerCase().includes("location") ||
    String((replyingTo as any).media_type || "").toLowerCase().includes("location") ||
    String(replyingTo.media?.type || "").toLowerCase().includes("location") ||
    looksLikeMapsUrl(replyingTo.media?.url) ||
    looksLikeMapsUrl(extractFirstUrl(replyingTo.text));

  const replyLocation =
    replyingTo.location ||
    parseLocationFromText(replyingTo.media?.url) ||
    parseLocationFromText(replyingTo.text);

  const replyLocationLatLng = useMemo(() => {
    if (!replyLocation) return null;
    if ("lat" in replyLocation && "lng" in replyLocation) {
      return { lat: replyLocation.lat, lng: replyLocation.lng };
    }
    if ("latitude" in replyLocation && "longitude" in replyLocation) {
      return { lat: replyLocation.latitude, lng: replyLocation.longitude };
    }
    return null;
  }, [replyLocation]);

  const replyLinkUrl = (() => {
    if (isLocationReply || replyLocation) return null;
    const fromMedia =
      replyingTo.media?.type === "link" ||
        replyingTo.message_type === "video" ||
        String(replyingTo.media?.type || "").toLowerCase().includes("video")
        ? replyingTo.media?.url
        : undefined;
    if (fromMedia) return fromMedia;
    if (replyingTo.message_type === "link" && replyingTo.media?.url) return replyingTo.media.url;
    return extractFirstUrl(replyingTo.text);
  })();

  const { metadata: replyLinkMeta, isLoading: isLoadingReplyLink } = useLinkMetadata(
    replyLinkUrl || undefined,
  );

  const replyLinkHost = (() => {
    if (!replyLinkUrl) return "";
    try {
      return new URL(replyLinkUrl).hostname;
    } catch {
      return replyLinkUrl.replace(/^https?:\/\//, "").split(/[/?#]/)[0];
    }
  })();

  const replyLinkClean = replyLinkUrl ? replyLinkUrl.replace(/^https?:\/\//, "") : "";

  const replyPreviewMediaType = replyingTo.message_type;

  const templateSummary = useMemo(() => {
    const t = (replyingTo as any)?.template;
    if (!t) return null;
    const title = String(t.header_text || t.name || 'template_message').trim();
    const body = String(t.body_text || "").trim().replace(/\s+/g, " ");
    const firstLine = body.split("\n")[0]?.trim() || body;
    return {
      title: title || 'template_message',
      body: firstLine,
    };
  }, [replyingTo]);

  const isTemplateReply = !!templateSummary || String(replyingTo.message_type || "").toLowerCase() === 'template_message';

  const audioPreviewUrl = useMemo(() => {
    if (replyingTo.audioUrl) return replyingTo.audioUrl;
    const t = String(replyingTo.media?.type || "").toLowerCase();
    if (replyingTo.message_type === "audio" || t.includes("audio")) return replyingTo.media?.url;
    return undefined;
  }, [replyingTo.audioUrl, replyingTo.media?.type, replyingTo.media?.url, replyingTo.message_type]);

  const isAudioReply = !!audioPreviewUrl;

  const [audioDurationSec, setAudioDurationSec] = useState<number | null>(null);
  useEffect(() => {
    if (!audioPreviewUrl) {
      setAudioDurationSec(null);
      return;
    }

    const src = normalizeMediaUrl(audioPreviewUrl);
    const audio = new Audio(src);

    const handleLoaded = () => {
      const d = audio.duration;
      setAudioDurationSec(Number.isFinite(d) ? d : null);
    };

    const handleError = () => {
      setAudioDurationSec(null);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("error", handleError);
      audio.src = "";
    };
  }, [audioPreviewUrl]);

  // Video duration detection
  const videoPreviewUrl = useMemo(() => {
    const t = String(replyingTo.media?.type || "").toLowerCase();
    if (replyingTo.message_type === "video" || t.includes("video")) {
      return replyingTo.media?.url || replyingTo.media?.thumbnail;
    }
    return undefined;
  }, [replyingTo.media?.type, replyingTo.media?.url, replyingTo.media?.thumbnail, replyingTo.message_type]);

  const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null);
  useEffect(() => {
    if (!videoPreviewUrl) {
      setVideoDurationSec(null);
      return;
    }

    const src = normalizeMediaUrl(videoPreviewUrl);
    const video = document.createElement("video");
    video.src = src;
    video.preload = "metadata";

    const handleLoaded = () => {
      const d = video.duration;
      setVideoDurationSec(Number.isFinite(d) ? d : null);
    };

    const handleError = () => {
      setVideoDurationSec(null);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("error", handleError);
      video.src = "";
    };
  }, [videoPreviewUrl]);

  const isReplyToMine = replyingTo.senderId === "me";
  const senderName = (() => {
    if (isReplyToMine) return "You";
    if (isInternalConversation) {
      const n = String((replyingTo as any).senderName || "").trim();
      return n || partnerName;
    }
    return partnerName;
  })();

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

  const senderNameClassName = isReplyToMine
    ? "text-xon-text-secondary"
    : getColorByFirstLetter(senderName);

  return (
    <div className="w-full min-w-0 px-3 py-1.5 border-b border-xon-surface-outline bg-xon-surface-container/10 flex items-center justify-between gap-3 h-[60px] animate-in slide-in-from-bottom-2 duration-200">
      {/* Horizontal Reply Layout */}
      <div className="flex items-center gap-3 flex-1 min-w-0 h-full">
        {/* Accent bar */}
        <div className="w-1 h-full bg-xon-primary rounded-full shrink-0" />

        {/* Content */}
        <div className="min-w-0 flex-1 flex flex-col justify-center h-full">
          <p className={`text-xs font-semibold truncate ${senderNameClassName}`}>
            {senderName}
          </p>

          <div className="text-xs text-xon-text-secondary truncate mt-0.5">
            {isTemplateReply ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <LayoutTemplate className="h-3 w-3 shrink-0" />
                <span className="shrink-0">Template</span>
                <span className="truncate">
                  {templateSummary ? `· ${templateSummary.title}${templateSummary.body ? ` · ${templateSummary.body}` : ""}` : ""}
                </span>
              </div>
            ) : isAudioReply ? (
              <div className="flex items-center gap-1.5">
                <Mic className="h-3 w-3" />
                <span>Voice message · {formatDuration(audioDurationSec)}</span>
              </div>
            ) : isLocationReply ? (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[120px]">Location</span>
              </div>
            ) : replyingTo.message_type === "file" || String(replyingTo.media?.type || "").toLowerCase().includes("file") || String(replyingTo.message_type || "").toLowerCase().includes("document") ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <fileMeta.icon className={`h-3 w-3 ${fileMeta.className}`} />
                <span className="truncate max-w-[120px]">{fileMeta.label}</span>
              </div>
            ) : replyingTo.message_type === "video" || String(replyingTo.media?.type || "").toLowerCase().includes("video") ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="truncate max-w-[120px]">Video</span>
              </div>
            ) : replyingTo.message_type === "image" || String(replyingTo.media?.type || "").toLowerCase().includes("image") ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="truncate max-w-[120px]">{replyingTo.text ? limitWords(replyingTo.text, 3) : "Image"}</span>
              </div>
            ) : replyLinkUrl ? (
              <div className="flex items-center gap-1.5 truncate">
                <Link2 className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{replyLinkMeta?.title || replyLinkClean}</span>
              </div>
            ) : replyingTo.message_type === "calls" ? (
              <div className="flex items-center gap-1.5 line-clamp-1">
                {(() => {
                  const direction = replyingTo.direction;
                  const originalText = replyingTo.text || "";
                  const isMissed = originalText.toLowerCase().includes("missed") || (replyingTo as any).additional_attributes?.status === "missed";
                  const isVideo = originalText.toLowerCase().includes("video") || (replyingTo as any).additional_attributes?.type === 'video';

                  const displayText = isVideo ? "Video call" : "Voice call";
                  const Icon = isMissed ? PhoneMissed : (direction === "outbound" ? PhoneOutgoing : PhoneIncoming);

                  return (
                    <>
                      <Icon className={`h-3 w-3 shrink-0 ${isMissed ? "text-red-500" : ""}`} />
                      <span className={isMissed ? "text-red-500" : ""}>{displayText}</span>
                    </>
                  );
                })()}
              </div>
            ) : (
              <span className="line-clamp-1 max-w-[150px]">{replyingTo.text ? limitWords(replyingTo.text, 4) : "Message"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Media Thumbnail on Right */}
      {!isAudioReply && !isLocationReply && (
        (() => {
          if (isTemplateReply) {
            return (
              <div className="h-11 w-11 rounded bg-black/5 dark:bg-white/5 overflow-hidden shrink-0 relative flex items-center justify-center">
                <LayoutTemplate className="h-5 w-5 text-foreground/40" />
              </div>
            );
          }
          const isVideoThumb =
            replyingTo.message_type === "video" ||
            String(replyingTo.media?.type || "").toLowerCase().includes("video");
          const isImageThumb =
            replyingTo.message_type === "image" ||
            String(replyingTo.media?.type || "").toLowerCase().includes("image");
          const isLinkThumb = !!(replyLinkUrl && replyLinkMeta?.image && replyingTo.message_type === "link");

          if (!isVideoThumb && !isImageThumb && !isLinkThumb) return null;

          // Determine the thumbnail source
          let thumbnailSrc = "";

          // For link previews with metadata images
          if (isLinkThumb) {
            thumbnailSrc = replyLinkMeta!.image!;
          }
          // For regular media - check both media.url and direct properties
          else if (replyingTo.media?.url) {
            thumbnailSrc = replyingTo.media.url;
          }
          // Also check for media thumbnail
          else if (replyingTo.media?.thumbnail) {
            thumbnailSrc = replyingTo.media.thumbnail;
          }

          // Only render if we have a valid source
          if (!thumbnailSrc) return null;

          return (
            <div className="h-11 w-11 rounded bg-black/5 dark:bg-white/5 overflow-hidden shrink-0 relative">
              {replyingTo.message_type === "video" || String(replyingTo.media?.type || "").toLowerCase().includes("video") ? (
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
                      <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
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
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
          );
        })()
      )}

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-xon-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
        onClick={onClearReply}
      >
        <X className="h-4.5 w-4.5" />
      </Button>
    </div>
  );
}
