import React from "react";
import { useConversationStaticContext } from "@/contexts/ConversationContext";

interface MessageHeaderProps {
    shouldShow: boolean;
    isSender: boolean;
    senderIdInfo?: { type: string | null; id: number | null };
    senderName?: string | null;
    senderContact?: any;
}

export default function MessageHeader({
    shouldShow,
    isSender,
    senderIdInfo,
    senderName,
    senderContact,
}: MessageHeaderProps) {
    const { isInternalConversation } = useConversationStaticContext();

    if (!shouldShow || isSender) return null;

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

    const displayName = senderName || senderContact?.name || `Contact ${senderIdInfo?.id}`;

    const colorClass = isInternalConversation
        ? getColorByFirstLetter(displayName)
        : "text-xon-text-secondary";

    return (
        <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${colorClass}`}>
                {displayName}
            </span>
        </div>
    );
}
