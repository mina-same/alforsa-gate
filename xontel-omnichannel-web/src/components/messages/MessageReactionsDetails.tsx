import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useUsersByIds } from "@/api/users/hooks";
import { useContactsByIds } from "@/api/contacts/hooks";
import { useMemo } from "react";

interface MessageReactionsDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    context?: {
        title?: string;
        thumbnailUrl?: string;
    };
    sections?: Array<{
        context?: {
            title?: string;
            thumbnailUrl?: string;
        };
        reactions: Array<{
            emoji: string;
            isMine?: boolean;
            reactorId?: string;
            reactorType?: "user" | "contact";
            userName?: string;
            userAvatar?: string;
            createdAt?: string;
        }>;
    }>;
    reactions: Array<{
        emoji: string;
        isMine?: boolean;
        reactorId?: string;
        reactorType?: "user" | "contact";
        userName?: string;
        userAvatar?: string;
        createdAt?: string;
    }>;
}

export default function MessageReactionsDetails({
    open,
    onOpenChange,
    reactions = [],
    context,
    sections,
}: MessageReactionsDetailsProps) {
    if (!Array.isArray(reactions)) return null;
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<string>("All");

    const effectiveReactions = useMemo(() => {
        if (Array.isArray(sections) && sections.length > 0) {
            const out: typeof reactions = [];
            for (const s of sections) {
                if (Array.isArray(s?.reactions)) out.push(...s.reactions);
            }
            return out;
        }
        return reactions;
    }, [reactions, sections]);

    // Group reactions by emoji
    const groupedByEmoji = effectiveReactions.reduce((acc, r) => {
        if (!acc[r.emoji]) {
            acc[r.emoji] = [];
        }
        acc[r.emoji].push(r);
        return acc;
    }, {} as Record<string, typeof reactions>);

    const emojis = ["All", ...Object.keys(groupedByEmoji)];

    const filteredReactions =
        activeTab === "All" ? effectiveReactions : groupedByEmoji[activeTab] || [];

    // Fetch missing reactor details
    const userIds = useMemo(() => {
        return Array.from(
            new Set(
                effectiveReactions
                    .filter(r => r.reactorType === "user" && r.reactorId)
                    .map((r) => Number(r.reactorId))
                    .filter((id): id is number => !isNaN(id) && id > 0)
            )
        );
    }, [effectiveReactions]);

    const contactIds = useMemo(() => {
        return Array.from(
            new Set(
                effectiveReactions
                    .filter(r => r.reactorType === "contact" && r.reactorId)
                    .map((r) => Number(r.reactorId))
                    .filter((id): id is number => !isNaN(id) && id > 0)
            )
        );
    }, [effectiveReactions]);

    const { data: usersData } = useUsersByIds(userIds);
    const { data: contactsData } = useContactsByIds(contactIds);

    const reactorsMap = useMemo(() => {
        const map: Record<string, { name: string; avatar?: string; phone?: string }> = {};

        usersData?.forEach(u => {
            map[`user-${u.id}`] = { name: u.full_name, avatar: u.avatar_url, phone: u.phone };
        });

        contactsData?.forEach(c => {
            map[`contact-${c.id}`] = { name: c.name, avatar: c.avatar_url, phone: c.phone };
        });

        return map;
    }, [usersData, contactsData]);

    const renderSection = (title: string | undefined, thumbnailUrl: string | undefined, sectionReactions: typeof reactions) => {
        const grouped = sectionReactions.reduce((acc, r) => {
            if (!acc[r.emoji]) acc[r.emoji] = [];
            acc[r.emoji].push(r);
            return acc;
        }, {} as Record<string, typeof reactions>);

        const filtered = activeTab === "All" ? sectionReactions : grouped[activeTab] || [];

        if (!filtered.length) return null;

        return (
            <div className="border-b last:border-b-0">
                {(title || thumbnailUrl) && (
                    <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                        {thumbnailUrl && (
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-muted border border-xon-surface-outline shrink-0">
                                <img src={thumbnailUrl} alt={title || "Media"} className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{title || "Media"}</div>
                            <div className="text-xs text-muted-foreground">Reactions</div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col">
                    {filtered.map((r, idx) => {
                        const reactorKey = r.reactorType && r.reactorId ? `${r.reactorType}-${r.reactorId}` : null;
                        const fetchedInfo = reactorKey ? reactorsMap[reactorKey] : null;

                        const displayName = r.isMine ? "You" : fetchedInfo?.name || r.userName || "Unknown";
                        const displayAvatar = fetchedInfo?.avatar || r.userAvatar;
                        const displayPhone = fetchedInfo?.phone;

                        return (
                            <div
                                key={`${r.reactorId || 'me'}-${r.emoji}-${idx}`}
                                className="flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-xon-surface-outline">
                                        <AvatarImage src={displayAvatar} className="object-cover" />
                                        <AvatarFallback className="bg-muted">
                                            {displayName.charAt(0).toUpperCase()}
                                        </AvatarFallback>

                                    </Avatar>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {displayName}
                                            </span>
                                            {r.reactorType === "user" && !r.isMine && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-xon-primary/10 text-xon-primary text-[9px] font-bold uppercase tracking-wider">
                                                    Agent
                                                </span>
                                            )}
                                        </div>
                                        {displayPhone && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {displayPhone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-lg">{r.emoji}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderContent = () => (
        <div className="flex flex-col h-full max-h-[70vh]">
            {(context?.title || context?.thumbnailUrl) && (
                <div className="px-4 pt-3 pb-2 border-b flex items-center gap-3">
                    {context.thumbnailUrl && (
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted border border-xon-surface-outline shrink-0">
                            <img src={context.thumbnailUrl} alt={context.title || "Media"} className="h-full w-full object-cover" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{context.title || "Media"}</div>
                        <div className="text-xs text-muted-foreground">Reactions</div>
                    </div>
                </div>
            )}
            {/* Tab Bar */}
            <div className="flex items-center gap-1 border-b px-1 overflow-y-hidden overflow-x-auto shrink-0 xon-scrollbar-thin">
                {emojis.map((emoji) => {
                    const count = emoji === "All" ? effectiveReactions.length : groupedByEmoji[emoji].length;
                    const isActive = activeTab === emoji;

                    return (
                        <button
                            key={emoji}
                            onClick={() => setActiveTab(emoji)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
                                isActive
                                    ? "border-xon-primary text-xon-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span>{emoji === "All" ? "All" : emoji} {count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Reactions List */}
            <ScrollArea className="flex-1 py-2">
                {Array.isArray(sections) && sections.length > 0 ? (
                    <div className="flex flex-col">
                        {sections.map((s, idx) => (
                            <div key={`${s.context?.title || 'media'}-${idx}`}>
                                {renderSection(s.context?.title, s.context?.thumbnailUrl, Array.isArray(s.reactions) ? s.reactions : [])}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filteredReactions.map((r, idx) => {
                            const reactorKey = r.reactorType && r.reactorId ? `${r.reactorType}-${r.reactorId}` : null;
                            const fetchedInfo = reactorKey ? reactorsMap[reactorKey] : null;

                            const displayName = r.isMine ? "You" : fetchedInfo?.name || r.userName || "Unknown";
                            const displayAvatar = fetchedInfo?.avatar || r.userAvatar;
                            const displayPhone = fetchedInfo?.phone;

                            return (
                                <div
                                    key={`${r.reactorId || 'me'}-${r.emoji}-${idx}`}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-xon-surface-outline">
                                            <AvatarImage src={displayAvatar} className="object-cover" />
                                            <AvatarFallback className="bg-muted">
                                                {displayName.charAt(0).toUpperCase()}
                                            </AvatarFallback>

                                        </Avatar>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {displayName}
                                                </span>
                                                {r.reactorType === "user" && !r.isMine && (
                                                    <span className="px-1.5 py-0.5 rounded-full bg-xon-primary/10 text-xon-primary text-[9px] font-bold uppercase tracking-wider">
                                                        Agent
                                                    </span>
                                                )}
                                            </div>
                                            {displayPhone && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {displayPhone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-lg">{r.emoji}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="bottom" className="px-0 pt-2 h-[80vh] rounded-t-[20px]">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-muted mb-4" />
                    <SheetHeader className="px-4 pb-2">
                        <SheetTitle className="text-left text-base font-semibold">Message Reactions</SheetTitle>
                    </SheetHeader>
                    {renderContent()}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-[16px]">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle className="text-base font-semibold">Message Reactions</DialogTitle>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}
