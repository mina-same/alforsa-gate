import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import MessageStatus from "../MessageStatus";

interface MessageFooterProps {
    isSender: boolean;
    status?: string;
    timestamp: string;
    edited?: boolean;
    originalMessage?: string;
    onResend?: () => void;
    messageId?: string | number;
    displayStatus?: boolean;
}

export default function MessageFooter({
    isSender,
    status,
    timestamp,
    edited,
    originalMessage,
    onResend,
    messageId,
    displayStatus,
}: MessageFooterProps) {
    const [open, setOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="flex flex-col items-end">
            <MessageStatus
                status={status || "sent"}
                time={timestamp}
                isSender={isSender}
                displayStatus={displayStatus}
                className="flex items-center gap-1 text-[10px] text-xon-text-primary/80 opacity-80 justify-end"
                sentIconClassName="text-xon-text-secondary"
                deliveredIconClassName="text-xon-text-secondary"
                readIconClassName="text-xon-primary"
                pendingIconClassName="text-xon-text-secondary"
                onResend={onResend}
                messageId={messageId}
            />
            {edited && (
                <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                    <p className="text-[10px] opacity-70 italic">(edited)</p>
                    {originalMessage && (
                        <div className="relative" ref={popoverRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                                className="p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity outline-none"
                                title="View original message"
                            >
                                <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
                            </button>
                            {open && (
                                <div className={`absolute z-50 bottom-full mb-1 w-56 max-w-[80vw] rounded-lg border border-xon-surface-outline bg-xon-surface-container shadow-lg p-2.5 text-xs ${isSender ? "right-0" : "left-0"}`}>
                                    <p className="text-[10px] opacity-60 mb-1">Original message</p>
                                    <p className="whitespace-pre-wrap break-words opacity-90">{originalMessage}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
