import React, { useMemo } from "react";

interface Reaction {
    emoji: string;
    isMine?: boolean;
    count?: number;
}

interface MessageReactionsProps {
    reactions: Reaction[];
    isSender: boolean;
    onOpenDetails: () => void;
}

export default function MessageReactions({
    reactions,
    isSender,
    onOpenDetails,
}: MessageReactionsProps) {
    const groupedReactions = useMemo(() => {
        if (!reactions || reactions.length === 0) return [];
        const byEmoji = new Map<string, { emoji: string; count: number; hasMine: boolean }>();
        for (const r of reactions) {
            const key = r.emoji;
            const existing = byEmoji.get(key);
            if (existing) {
                existing.count += 1;
                existing.hasMine = existing.hasMine || !!r.isMine;
            } else {
                byEmoji.set(key, { emoji: key, count: r.count || 1, hasMine: !!r.isMine });
            }
        }
        return Array.from(byEmoji.values());
    }, [reactions]);

    if (groupedReactions.length === 0) return null;

    return (
        <div
            className={`absolute -bottom-5 ${isSender ? "right-2" : "left-2"} flex items-center gap-1 z-20`}
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails();
                }}
                className="flex py-0.5 items-center gap-1 cursor-pointer inline-flex px-2 rounded-full border border-xon-surface-outline bg-xon-surface-container text-xs shadow-sm hover:bg-xon-surface-container-hover transition-colors"
            >
                {groupedReactions.map((r) => (
                    <div
                        key={r.emoji}
                        className="inline-flex items-center gap-1 h-5 rounded-full"
                        title={`${r.emoji} ${r.count > 1 ? `(${r.count})` : ""} ${r.hasMine ? "(You reacted)" : ""}`}
                    >
                        <span className="hover:scale-125 transition-transform cursor-pointer">
                            {r.emoji}
                        </span>
                        {r.count > 1 && (
                            <span className="text-[10px] text-foreground/70">{r.count}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
