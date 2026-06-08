import React, { useCallback, useMemo, useState } from "react";
import { messagesAPI } from "@/api/messages/endpoints";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MediaPreview from "../MediaPreview";
import ContactPreview from "../ContactPreview";
import VoiceMessagePlayer from "../record/VoiceMessagePlayer";
import { TemplatePreview } from "../templates/TemplatePreview";
import CallMessagePreview from "../CallMessagePreview";
import { Message } from "@/types/chat";
import CollapsibleCodeBlock from "./CollapsibleCodeBlock";
import { useTranslation } from "react-i18next";
import { useDateFormat } from "@/hooks/useDateFormat";
import { useAuthUser } from "@/contexts/AuthContext";
import { useConversationStaticContext, useConversationSearchContext } from "@/contexts/ConversationContext";

function startsWithArabicText(value: string): boolean {
    const s = String(value ?? "").trimStart();
    if (!s) return false;
    const first = s[0];
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(first);
}

interface MessageContentProps {
    message: Message;
    isSender: boolean;
    isDarkMode: boolean;
    userAvatar?: string;
}

function parseAdditionalAttributes(attrs: string | Record<string, any> | undefined): Record<string, any> {
    if (!attrs) return {};
    if (typeof attrs === 'string') { try { return JSON.parse(attrs); } catch { return {}; } }
    return attrs as Record<string, any>;
}

export default function MessageContent({
    message,
    isSender,
    isDarkMode,
    userAvatar,
}: MessageContentProps) {
    const [expandedCodeBlocks, setExpandedCodeBlocks] = useState<Record<string, boolean>>({});
    const authUser = useAuthUser();
    const currentUserName = authUser.full_name || authUser.email;
    const { channelType, partnerName, onOpenMediaViewer, isInternalConversation } = useConversationStaticContext();
    const { searchQuery } = useConversationSearchContext();

    const { formatTime } = useDateFormat();
    const timestampText = formatTime(message.createdAt);

    const isDeleted = !!message.deletedBy;
    const deletedText = message.deletedBy === "everyone" ? "Message deleted from both" : "Message deleted for me";

    const handleMediaPlay = useCallback(() => {
        if (!isSender && message.status !== 'read' && typeof message.numericId === 'number') {
            messagesAPI.updateMessageStatus(message.numericId, 'read').catch(() => {});
        }
    }, [isSender, message.status, message.numericId]);

    const parsedAttrs = parseAdditionalAttributes(message.additional_attributes);
    const displayText = (parsedAttrs?.isEdited && parsedAttrs?.editedMessage)
        ? String(parsedAttrs.editedMessage)
        : (message.text || "");

    const isRtlText = startsWithArabicText(displayText);

    const hasCaption = (() => {
        const txt = String(displayText).trim();
        if (!txt) return false;
        if (txt === "[Image]" || txt === "[Video]" || txt === "[sticker]" || txt === "[Audio]") return false;
        return true;
    })();

    const hasRenderableMedia =
        (!message.mediaPending || !!message.media?.url) &&
        !!message.media &&
        message.media.type !== "link" &&
        message.media.type !== "location" &&
        message.media.url !== "string" &&
        message.text !== "[Audio]" &&
        !(message.message_type === "audio");

    const isVideoMedia = (() => {
        const t = String(message.message_type || message.media?.type || "").toLowerCase();
        return t.includes("video");
    })();

    const linkUrl = (() => {
        if (message.media?.type === "link" && message.media.url && message.media.url !== "string") {
            return message.media.url;
        }
        if (!message.media && message.text) {
            const trimmed = message.text.trim();
            if (trimmed.startsWith("{") || trimmed.startsWith("[")) return null;
            const urlMatch = message.text.match(/(https?:\/\/[^\s]+)/);
            return urlMatch ? urlMatch[0] : null;
        }
        return null;
    })();

    const parseLocation = (text: string): { latitude: number; longitude: number } | null => {
        try {
            const parsed = JSON.parse(text);
            if (parsed.latitude && parsed.longitude && typeof parsed.longitude === "number" && typeof parsed.latitude === "number") {
                return { latitude: parsed.latitude, longitude: parsed.longitude };
            }
        } catch {
            return null;
        }
        return null;
    };

    const parseTemplate = (text: string): any | null => {
        if (!text || !text.trim().startsWith('{')) return null;
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === 'object' && (parsed.body_text || parsed.template_id)) {
                return parsed;
            }
            return null;
        } catch {
            return null;
        }
    };

    const locationFromText = message.text ? parseLocation(message.text) : null;
    const displayLocation = message.location || locationFromText;
    const hasRichMentions = displayText.includes("⁣");
    const templateData = message.template || (message.text ? parseTemplate(message.text) : null);

    // --- Inline text rendering utilities ---

    const safeUrlTransform = (url: string) => {
        try {
            if (!url || url.startsWith("#") || url.startsWith("/")) return url;
            const parsed = new URL(url, window.location.origin);
            return new Set(["http:", "https:", "mailto:", "tel:"]).has(parsed.protocol) ? parsed.toString() : "";
        } catch { return ""; }
    };

    const normalizeMentionTarget = (v: unknown) =>
        String(v ?? "").replace(/^@/, "").trim().toLowerCase();

    const currentUserMentionTargets = useMemo(() => {
        if (!authUser?.id) return new Set<string>();
        const targets = new Set<string>();
        [authUser.id, authUser.full_name, authUser.email]
            .forEach(v => { const t = normalizeMentionTarget(v); if (t) targets.add(t); });
        return targets;
    }, [authUser.id, authUser.full_name, authUser.email]);

    const isMentionForCurrentUser = (mentionText: string) => {
        const key = normalizeMentionTarget(mentionText);
        return key ? currentUserMentionTargets.has(key) : false;
    };

    const highlightText = (text: string, query: string) => {
        if (!query.trim() || !text) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp(`(${escaped})`, "gi"));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={index} className="bg-xon-yellow font-semibold">{part}</span>
            ) : part
        );
    };

    const renderTextWithMentions = (text: string, query: string) => {
        if (!text) return text;
        const MENTION_END_MARKER = "⁣";
        const tokens: Array<{ type: "text" | "mention"; value: string }> = [];
        let i = 0;
        while (i < text.length) {
            const atIndex = text.indexOf("@", i);
            if (atIndex === -1) { tokens.push({ type: "text", value: text.slice(i) }); break; }
            if (atIndex > i) tokens.push({ type: "text", value: text.slice(i, atIndex) });
            const markerIndex = text.indexOf(MENTION_END_MARKER, atIndex);
            if (markerIndex !== -1) {
                tokens.push({ type: "mention", value: text.slice(atIndex, markerIndex + 1).replaceAll(MENTION_END_MARKER, "") });
                i = markerIndex + 1;
            } else {
                const afterAt = text.slice(atIndex);
                const whitespaceOffset = afterAt.search(/\s/);
                const endIndex = whitespaceOffset === -1 ? text.length : atIndex + whitespaceOffset;
                tokens.push({ type: "mention", value: text.slice(atIndex, endIndex) });
                i = endIndex;
            }
        }
        return tokens.map((t, index) => {
            if (!t.value) return null;
            if (t.type === "mention") {
                const isForMe = isInternalConversation && isMentionForCurrentUser(t.value);
                return (
                    <span key={`mention-${index}`} className={isForMe ? "bg-emerald-200/80 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-200 font-semibold rounded px-1" : "text-blue-600 dark:text-blue-400"}>
                        {highlightText(t.value, query)}
                    </span>
                );
            }
            return <React.Fragment key={`text-${index}`}>{highlightText(t.value, query)}</React.Fragment>;
        });
    };

    const highlightReactChildren = (children: React.ReactNode, query: string): React.ReactNode => {
        if (!query.trim()) return children;
        const q = query.toLowerCase();
        return React.Children.map(children, (child, idx) => {
            if (child == null) return child;
            if (typeof child === "string") {
                const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const parts = child.split(new RegExp(`(${escaped})`, "gi"));
                return parts.map((part, partIndex) => part.toLowerCase() === q ? <span key={`hl-${idx}-${partIndex}`} className="bg-xon-yellow font-semibold">{part}</span> : part);
            }
            if (React.isValidElement(child)) {
                const childProps = child.props as { children?: React.ReactNode };
                return React.cloneElement(child, { ...childProps, children: highlightReactChildren(childProps.children, query) });
            }
            return child;
        });
    };

    if (isDeleted) {
        return <p className="italic text-xon-text-secondary">{deletedText}</p>;
    }

    return (
        <>
            {/* Media Pending Loader */}
            {message.mediaPending && !message.media?.url && ((message.message_type || "").toLowerCase().includes("image") || (message.message_type || "").toLowerCase().includes("sticker") || message.text === "[sticker]") && (
                <div className="mb-2 -mx-3 -my-2 rounded-t-md overflow-hidden p-2">
                    <div className="h-40 bg-xon-surface-container rounded-md flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-xon-text-secondary" />
                    </div>
                </div>
            )}

            {/* Media Preview */}
            {hasRenderableMedia && message.media && (
                <div className={`-mx-3 -my-2 rounded-t-md overflow-hidden p-1`}>
                    <MediaPreview
                        content={message.text}
                        type={message.message_type}
                        url={message.media.url}
                        metadata={message.media.metadata}
                        thumbnail={message.media.thumbnail}
                        blob={message.media.blob || new Blob()}
                        name={message.media.name}
                        messageId={typeof message.numericId === "number" ? message.numericId : undefined}
                        onOpenViewer={onOpenMediaViewer}
                        footerTimestamp={formatTime(message.createdAt)}
                        footerStatus={message.status}
                        footerIsSender={isSender}
                        onPlay={handleMediaPlay}
                    />
                </div>
            )}

            {/* Main Body */}
            <div
                className={`text-sm leading-relaxed ${templateData ? "mt-0" : (hasRenderableMedia ? (hasCaption ? "mt-3" : "mt-0") : "mt-1")} ${message.audioUrl && !isDeleted ? "p-3" : ""} ${isRtlText ? "text-right" : ""}`}
                dir={isRtlText ? "rtl" : "ltr"}
            >
                {message.audioUrl || (message.text === "[Audio]" && message.media?.url) || (message.message_type === "audio") ? (
                    <VoiceMessagePlayer
                        channel_type={channelType}
                        audioUrl={message.media?.url || (message.text === "[Audio]" ? message.media?.url || "" : "")}
                        isSender={isSender}
                        timestamp={timestampText}
                        status={message.status}
                        userAvatar={userAvatar}
                        userName={isSender ? (currentUserName || partnerName) : (partnerName || message.senderName)}
                        onPlay={handleMediaPlay}
                    />
                ) : message.message_type === "contacts" ? (
                    <ContactPreview contacts={message.text} isSender={isSender} />
                ) : message.message_type === "calls" ? (
                    <CallMessagePreview message={message} isSender={isSender} />
                ) : displayLocation ? (
                    <div className="w-full space-y-2">
                        <div className="rounded-lg overflow-hidden border border-xon-surface-outline">
                            <iframe
                                width="100%"
                                height="180"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://maps.google.com/maps?q=${displayLocation.latitude},${displayLocation.longitude}&z=15&output=embed`}
                            ></iframe>
                        </div>
                    </div>
                ) : templateData ? (
                    <TemplatePreview
                        template={templateData}
                        timestamp={timestampText}
                        status={message.status}
                        isSender={isSender}
                    />
                ) : (
                    !linkUrl &&
                    !(displayText === "[Audio]") &&
                    !(displayText === "[Image]") &&
                    !(displayText === "[sticker]") &&
                    !(displayText === "[Video]") &&
                    !(message.message_type === "document") && (
                        <div className="whitespace-pre-wrap">
                            {hasRichMentions ? (
                                <p>{renderTextWithMentions(displayText, searchQuery)}</p>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    urlTransform={safeUrlTransform}
                                    components={{
                                        p: ({ children }) => (
                                            <p className="m-0 whitespace-pre-wrap">{highlightReactChildren(children, searchQuery)}</p>
                                        ),
                                        a: ({ children, href }) => (
                                            <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
                                                {highlightReactChildren(children, searchQuery)}
                                            </a>
                                        ),
                                        pre: ({ children }) => {
                                            if (React.isValidElement(children)) {
                                                return React.cloneElement(children as React.ReactElement<any>, { isBlock: true });
                                            }
                                            return <>{children}</>;
                                        },
                                        code: ({ className, children, ...props }: any) => {
                                            const inline = !props.isBlock;
                                            if (inline) {
                                                return <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">{highlightReactChildren(children, searchQuery)}</code>;
                                            }
                                            const raw = String(children ?? "").replace(/\n$/, "");
                                            const match = /language-([\w-]+)/.exec(className || "");
                                            const detected = (match?.[1] || "text").toLowerCase();
                                            const normalizedLanguage = detected === "ts" ? "typescript" : detected === "js" ? "javascript" : detected;
                                            const codeBlockKey = `${normalizedLanguage}:${raw}`;
                                            const expanded = expandedCodeBlocks[codeBlockKey] ?? false;
                                            return (
                                                <CollapsibleCodeBlock
                                                    raw={raw}
                                                    detectedLanguage={detected}
                                                    normalizedLanguage={normalizedLanguage}
                                                    isDarkMode={isDarkMode}
                                                    expanded={expanded}
                                                    onToggleExpanded={() => setExpandedCodeBlocks((prev) => ({ ...prev, [codeBlockKey]: !expanded }))}
                                                />
                                            );
                                        },
                                        li: ({ children }) => <li className="my-0.5">{highlightReactChildren(children, searchQuery)}</li>,
                                    }}
                                >
                                    {displayText}
                                </ReactMarkdown>
                            )}
                        </div>
                    )
                )}
            </div>
        </>
    );
}
