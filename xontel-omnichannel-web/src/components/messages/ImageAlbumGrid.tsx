import React, { useMemo, useState, useCallback } from "react";

import { getThumbnailUrl, normalizeMediaUrl } from "@/utils/urlHelper";
import type { Message } from "@/types/chat";
import MessageStatus from "./MessageStatus";
import MessageReactionsDetails from "./MessageReactionsDetails";
import MessageReactions from "./bubble/MessageReactions";

function AlbumTile({ thumbUrl, fallbackUrl, className }: { thumbUrl: string | null; fallbackUrl: string; className: string }) {
  const [error, setError] = useState(false)
  const src = (!error && thumbUrl) ? thumbUrl : fallbackUrl
  return (
    <img
      src={src}
      alt="Shared image"
      className={className}
      draggable={false}
      onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
      onError={() => { if (!error && thumbUrl) setError(true) }}
    />
  )
}

export default function ImageAlbumGrid({
  messages,
  onOpenMediaViewer,
  footerTimestamp,
  footerStatus,
  footerIsSender,
}: {
  messages: Message[];
  onOpenMediaViewer?: (messageId: number) => void;
  footerTimestamp?: string;
  footerStatus?: "pending" | "sent" | "delivered" | "read" | "failed";
  footerIsSender?: boolean;
}) {
  const [reactionsDetailsOpen, setReactionsDetailsOpen] = useState(false);
  const [reactionsDetailsReactions, setReactionsDetailsReactions] = useState<any[]>([]);
  const [reactionsDetailsSections, setReactionsDetailsSections] = useState<
    Array<{ context?: { title?: string; thumbnailUrl?: string }; reactions: any[] }> | undefined
  >(undefined);
  const [reactionsDetailsContext, setReactionsDetailsContext] = useState<
    { title?: string; thumbnailUrl?: string } | undefined
  >(undefined);

  const total = messages.length;
  const visible = useMemo(() => messages.slice(0, 4), [messages]);
  const overflow = Math.max(0, total - 4);

  const getMessageNumericId = (m: Message) => (typeof m.numericId === "number" ? m.numericId : undefined);

  const handleOpen = (m: Message) => {
    const id = getMessageNumericId(m);
    if (typeof id === "number" && onOpenMediaViewer) {
      onOpenMediaViewer(id);
      return;
    }
    const url = m.media?.url;
    if (url) window.open(normalizeMediaUrl(url), "_blank");
  };

  const gridClassName = useMemo(() => {
    if (visible.length === 2) return "grid grid-cols-2 gap-1";
    if (visible.length === 3) return "grid grid-cols-2 grid-rows-2 gap-1";
    return "grid grid-cols-2 grid-rows-2 gap-1";
  }, [visible.length]);

  const tileBase = "relative overflow-hidden bg-black/10 dark:bg-white/10";

  const dedupeReactions = (raw: any[]) => {
    if (!Array.isArray(raw) || raw.length === 0) return [] as any[];
    const seen = new Set<string>();
    const out: any[] = [];
    for (const r of raw) {
      const key = String(
        (r as any)?.numericId ??
        (r as any)?.id ??
        (r as any)?.messageId ??
        `${String((r as any)?.emoji ?? (r as any)?.content ?? "")}::${String((r as any)?.reactorId ?? "")}::${String((r as any)?.createdAt ?? "")}`
      );
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  };

  const albumReactionSections = useMemo(() => {
    return (messages || []).map((m) => {
      const url = m.media?.url ? normalizeMediaUrl(m.media.url) : "";
      const rs = dedupeReactions(Array.isArray((m as any).reactions) ? (m as any).reactions : []);
      return {
        context: { title: m.media?.name || "Media", thumbnailUrl: url },
        reactions: rs,
      };
    }).filter((s) => (s.reactions || []).length > 0);
  }, [messages]);

  const albumAggregatedReactions = useMemo(() => {
    const out: any[] = [];
    for (const s of albumReactionSections) {
      out.push(...(s.reactions || []));
    }
    return out;
  }, [albumReactionSections]);

  return (
    <div className="relative w-full">
      <div
        className={`relative group/album ${
          footerIsSender ? "bg-xon-msg-bg-sent text-xon-text-primary" : "bg-xon-msg-bg-received text-xon-text-primary"
        } rounded-lg shadow-sm ${
          footerIsSender ? "rounded-br-none" : "rounded-bl-none"
        } px-2 py-2 pb-6`}
      >
        <div className={gridClassName}>
          {visible.map((m, idx) => {
            const rawUrl = m.media?.url ?? ''
            const thumbSize = visible.length === 3 && idx === 2 ? '320x180' : '128x128'
            const thumbUrl = normalizeMediaUrl(getThumbnailUrl(rawUrl, thumbSize))
            const fallbackUrl = normalizeMediaUrl(rawUrl)
            const tileClassName = (() => {
              if (visible.length === 3 && idx === 2) return `${tileBase} col-span-2 aspect-[2/1] rounded-lg`;
              return `${tileBase} aspect-square rounded-lg`;
            })();

            return (
              <button
                key={String(getMessageNumericId(m) ?? m.id ?? idx)}
                type="button"
                onClick={() => handleOpen(m)}
                className={tileClassName + " block"}
              >
                {!!fallbackUrl && (
                  <AlbumTile
                    thumbUrl={thumbUrl}
                    fallbackUrl={fallbackUrl}
                    className="h-full w-full object-cover object-center"
                  />
                )}

                {overflow > 0 && idx === 3 && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">+{overflow}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-1.5 right-2 z-20">
          <MessageStatus
            status={footerStatus || "sent"}
            time={footerTimestamp || ""}
            isSender={!!footerIsSender}
            className="flex items-center gap-1 text-[10px] text-xon-text-primary/80 opacity-80 justify-end"
            sentIconClassName="text-xon-text-secondary"
            deliveredIconClassName="text-xon-text-secondary"
            readIconClassName="text-xon-primary"
            pendingIconClassName="text-xon-text-secondary"
          />
        </div>

        {albumAggregatedReactions.length > 0 && (
          <div className={`absolute ${footerIsSender ? "right-0" : "left-0"} bottom-0 z-20`}>
            <MessageReactions
              reactions={albumAggregatedReactions}
              isSender={!!footerIsSender}
              onOpenDetails={() => {
                setReactionsDetailsReactions(albumAggregatedReactions);
                setReactionsDetailsSections(albumReactionSections);
                setReactionsDetailsContext({ title: "Media", thumbnailUrl: undefined });
                setReactionsDetailsOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {reactionsDetailsOpen && (
        <MessageReactionsDetails
          open={reactionsDetailsOpen}
          onOpenChange={setReactionsDetailsOpen}
          reactions={reactionsDetailsReactions}
          sections={reactionsDetailsSections}
          context={reactionsDetailsContext}
        />
      )}
    </div>
  );
}
