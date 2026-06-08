import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuthUser } from "@/contexts/AuthContext";
import StartAgentConversationButton from "@components/conversations/StartAgentConversationButton";
import StartWhatsAppChatModal from "@components/conversations/StartWhatsAppChatModal";
import AgentConversationModal from "@components/conversations/AgentConversationModal";
import {
  ArrowRight,
  MessageCirclePlus,
  Archive,
  ArrowLeft,
  SearchX,
  AlertCircle,
  RotateCcw,
  Ban,
  MessageCircle,
} from "lucide-react";
import { useInfiniteConversations } from "@/api/conversations/hooks";
import { useBlockedContacts } from "@/api/contacts/hooks";
import { useCurrentUser } from "@/api/auth/hooks";
import { useUIState } from "@/contexts/UIContext";
import { useContactTags } from "@/api/tags/hooks";
import {
  ConversationResponse,
  GetConversationsParams,
} from "@/api/conversations/types";
import { Conversation } from "@/types/chat";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import EmptyConversation from "@/components/messages/EmptyConversation";
import { useTranslation } from "react-i18next";
import NoChatsSvg from "@/assets/empty-states/NoChatsSvg";
import { CHANNEL_CONFIG } from "@/utils/channelUtils";
import ContactGroupItem from "./ContactGroupItem";

export default function ConversationList() {
  const uiState = useUIState();

  const isMobile = useIsMobile();

  const { data: currentUser } = useCurrentUser();
  const authUser = useAuthUser();

  const currentUserId = useMemo(() => {
    if (currentUser?.id) return Number(currentUser.id);
    if (authUser.id) return Number(authUser.id);
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) return Number(JSON.parse(stored).id);
    } catch (e) {}
    return undefined;
  }, [currentUser, authUser.id]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isNewWhatsAppChatModalOpen, setIsNewWhatsAppChatModalOpen] =
    useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentModalMode, setAgentModalMode] = useState<"direct" | "group">(
    "direct",
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { t } = useTranslation("chat");

  const [view, setView] = useState<
    | "all"
    | "assigned"
    | "unassigned"
    | "closed"
    | "bot"
    | "blocked"
    | "direct"
    | "group"
  >("assigned");

  const activeInboxId = uiState.activeInboxId;

  const activeInbox = React.useMemo(() => {
    const storedInboxesData = JSON.parse(
      localStorage.getItem("userInboxes") || "null",
    );
    const storedInboxes = storedInboxesData?.items || storedInboxesData || [];
    return storedInboxes.find(
      (i: any) => Number(i.id) === Number(activeInboxId),
    );
  }, [activeInboxId]);

  const isInternal = activeInbox?.channel_type?.toLowerCase() === "internal";

  useEffect(() => {
    if (activeInboxId) {
      console.log(`🔍 [INBOX] Switched to inbox ID: ${activeInboxId}`);
    }
  }, [activeInboxId]);

  // Adjust view if switching to/from internal
  const prevActiveInboxIdRef = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    const inboxChanged = prevActiveInboxIdRef.current !== activeInboxId;
    if (!activeInboxId) return;

    prevActiveInboxIdRef.current = activeInboxId;

    if (inboxChanged) {
      if (isInternal) {
        setView("all");
      } else {
        setView("assigned");
      }
    }
  }, [activeInboxId, isInternal]);

  const queryParams: GetConversationsParams = useMemo(() => {
    const p: GetConversationsParams = { limit: 30 };
    if (debouncedSearchQuery) {
      // Detect if search query is a phone number (contains mostly digits, +, or -)
      const isPhoneQuery =
        /^[\d\+\-\s()]+$/.test(debouncedSearchQuery) &&
        /\d/.test(debouncedSearchQuery);
      if (isPhoneQuery) {
        p.contact_phone = debouncedSearchQuery;
      } else {
        p.contact_name = debouncedSearchQuery;
      }
    }

    if (isInternal) {
      p.channel_id = undefined;
      if (view === "direct") p.conversation_type = "direct";
      else if (view === "group") p.conversation_type = "group";
    } else {
      if (view === "assigned") {
        p.status = "assigned";
        p.assigned_agent_id = currentUserId ?? undefined;
      } else if (view === "unassigned") p.status = "open";
      else if (view === "closed") p.status = "closed";
      else if (view === "bot") p.status = "bot_handling";
    }
    return p;
  }, [view, isInternal, currentUserId, debouncedSearchQuery]);

  // External tab counts — only run when viewing a non-internal inbox, auto-inject inbox_id + channel_id
  const { data: assignedTotal, isLoading: assignedLoading } =
    useInfiniteConversations(
      {
        status: "assigned",
        assigned_agent_id: currentUserId ?? undefined,
        limit: 30,
      },
      { enabled: !isInternal && currentUserId != null },
    );
  const { data: unassignedTotal, isLoading: unassignedLoading } =
    useInfiniteConversations(
      { status: "open", limit: 30 },
      { enabled: !isInternal },
    );
  const {data: botTotal} =  useInfiniteConversations(
      { status: "bot_handling", limit: 30 },
      { enabled: !isInternal },
    );
  const { data: allTotal, isLoading: allTotalLoading } =
    useInfiniteConversations({ limit: 30 }, { enabled: !isInternal });
  const { data: closedTotal, isLoading: closedTotalLoading } =
    useInfiniteConversations(
      { status: "closed", limit: 30 },
      { enabled: !isInternal },
    );
  useInfiniteConversations({ status: "blocked", limit: 30 }, { enabled: false });

  // Internal tab counts — only run when viewing an internal inbox; inbox_id and channel_id explicitly
  // undefined so the hook skips its auto-inject and queries across all internal inboxes
  const { data: internalDirectTotalData } = useInfiniteConversations(
    { conversation_type: "direct", channel_id: undefined, limit: 30 },
    { enabled: isInternal },
  );
  const { data: internalGroupTotalData } = useInfiniteConversations(
    { conversation_type: "group", channel_id: undefined, limit: 30 },
    { enabled: isInternal },
  );
  const { data: internalAllTotalData } = useInfiniteConversations(
    { channel_id: undefined, limit: 30 },
    { enabled: isInternal },
  );

  const { data: tagsData } = useContactTags(0, 100);
  const availableTags = useMemo(() => tagsData?.items ?? [], [tagsData]);

  const getCount = (dataMap: any) => dataMap?.pages?.[0]?.total;

  const {
    data: infiniteData,
    // isLoading: assignedLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
    isLoading,
  } = useInfiniteConversations(queryParams);

  const sourceData = useMemo(() => {
    const raw = infiniteData?.pages?.flatMap((page) => page.items || []) ?? [];
    const seen = new Set<string>();
    return raw.filter((item) => {
      const key = item.conversation_uuid || String(item.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [infiniteData]);

  const apiConversations = useMemo(() => {
    return sourceData.map((c: any) => {

      const lastMessageText = (() => {
        if (!c.last_message) return "";
        const m = c.last_message;
        const t = (m.message_type || m.media_type || "").toLowerCase();
        if (t.includes("location") || m.media_url?.includes("maps"))
          return "Location";
        if (m.content) return m.content;
        if (t === "image") return "Photo";
        if (t === "video") return "Video";
        if (t === "audio") return "Audio";
        if (t === "link") return m.media_url || "Link";
        if (m.media_url) return "Document";
        return "";
      })();

      const isFromMe =
        currentUserId != null &&
        (Number(c.last_message?.sent_by_user_id) === currentUserId ||
          (["user", "agent"].includes(
            (c.last_message?.sender_type || "").toLowerCase(),
          ) &&
            Number(c.last_message?.sender_id) === currentUserId));
      const isFromAgent = c.last_message?.sender_type === "agent" && !isFromMe;

      return {
        ...c,
        id: c.conversation_uuid,
        numeric_id: c.id,
        blocked: c.status === "blocked",
        closed: c.status === "closed" || c.status === "archived",
        lastMessage: c.last_message
          ? {
              id: c.last_message.message_uuid || `msg-${c.id}`,
              numericId: c.last_message.id,
              createdAt: c.last_message.created_at,
              text: lastMessageText,
              senderId: isFromMe ? "me" : isFromAgent ? "agent" : "contact",
              sent_by_user_id: c.last_message.sent_by_user_id,
              status: c.last_message.status || "sent",
              message_type: c.last_message.message_type || "text",
              reply_to_message_id: c.last_message.reply_to_message_id ?? undefined,
            }
          : null,
        name: c.contact_name,
        phone: c.contact_phone,
        avatar_url: c.contact_avatar_url,
        unread: c.unread_messages_count || 0,
      };
    });
  }, [sourceData, currentUserId]);

  const { data: blockedContactsData } = useBlockedContacts();
  const blockedContactIds = useMemo(
    () => new Set((blockedContactsData?.contacts ?? []).map((c) => Number(c.id))),
    [blockedContactsData],
  );

  const blockedAssignedCount = useMemo(() => {
    if (blockedContactIds.size === 0 || !currentUserId) return 0;
    return apiConversations.filter(
      (c: any) =>
        !c.closed &&
        c.assigned_agent_id != null &&
        Number(c.assigned_agent_id) === Number(currentUserId) &&
        c.contact_id != null &&
        blockedContactIds.has(Number(c.contact_id)),
    ).length;
  }, [apiConversations, blockedContactIds, currentUserId]);


  const internalParticipating = useMemo(() => {
    if (!isInternal) return [];
    return apiConversations;
  }, [apiConversations, isInternal]);

  const internalCounts = useMemo(
    () => ({
      all: isInternal ? (getCount(internalAllTotalData) ?? 0) : 0,
      direct: isInternal ? (getCount(internalDirectTotalData) ?? 0) : 0,
      group: isInternal ? (getCount(internalGroupTotalData) ?? 0) : 0,
    }),
    [
      internalAllTotalData,
      internalDirectTotalData,
      internalGroupTotalData,
      isInternal,
    ],
  );

  const sortedGroups = useMemo(() => {
    let local: any[] = isInternal ? internalParticipating : apiConversations;

    if (isInternal) {
      if (view === "direct")
        local = local.filter((c: any) => c.conversation_type === "direct");
      else if (view === "group")
        local = local.filter((c: any) => c.conversation_type === "group");
    }

    if (!isInternal) {
      if (view === "blocked") {
        local = local.filter(
          (c: any) => c.contact_id != null && blockedContactIds.has(Number(c.contact_id)),
        );
      } else if (blockedContactIds.size > 0) {
        // Remove blocked contacts from all other views
        local = local.filter(
          (c: any) => c.contact_id == null || !blockedContactIds.has(Number(c.contact_id)),
        );
      }
    }

    const grouped = new Map();

    local.forEach((conv) => {
      const key = conv.contact_id === null ? conv.id : conv.contact_id;

      if (!grouped.has(key)) {
        grouped.set(key, {
          contact_id: key,
          contact_name: conv.contact_name || conv.name,
          contact_avatar_url: conv.contact_avatar_url,
          contact_phone: conv.contact_phone || conv.phone,
          conversations: [conv],
        });
      } else {
        grouped.get(key).conversations.push(conv);
      }
    });

    const groupedArray = Array.from(grouped.values());

    groupedArray.forEach((group) => {
      group.conversations.sort((a: any, b: any) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        const tA =
          new Date(a.last_activity_at || a.lastMessage?.createdAt || a.created_at || 0).getTime() || 0;
        const tB =
          new Date(b.last_activity_at || b.lastMessage?.createdAt || b.created_at || 0).getTime() || 0;

        return tB - tA;
      });
    });

    return groupedArray.sort((a, b) => {
      const aPinned = a.conversations.some((c: any) => c.pinned);
      const bPinned = b.conversations.some((c: any) => c.pinned);

      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      const tA =
        new Date(a.conversations[0].last_activity_at || a.conversations[0].lastMessage?.createdAt || a.conversations[0].created_at || 0).getTime() || 0;
      const tB =
        new Date(b.conversations[0].last_activity_at || b.conversations[0].lastMessage?.createdAt || b.conversations[0].created_at || 0).getTime() || 0;

      return tB - tA;
    });
  }, [internalParticipating, apiConversations, isInternal, view, blockedContactIds]);

  const displayConversations = useMemo(() => {
    if (!searchQuery.trim()) return sortedGroups;

    const q = searchQuery.toLowerCase();
    return sortedGroups.filter(
      (group) =>
        group.contact_name?.toLowerCase().includes(q) ||
        group.contact_phone?.toLowerCase().includes(q) ||
        group.conversations.some(
          (c: Conversation) =>
            c.lastMessage?.text?.toLowerCase().includes(q) ||
            c.subject?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.contact_phone?.toLowerCase().includes(q),
        ),
    );
  }, [sortedGroups, searchQuery]);

  const hasInboxes = useMemo(() => {
    const data = JSON.parse(localStorage.getItem("userInboxes") || "null");
    return (data?.items || data || []).length > 0;
  }, [activeInboxId]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset scroll to top when switching tabs
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [view]);

  // Re-run whenever loading finishes (target re-enters DOM) or pagination state changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    const target = observerTarget.current;
    if (!container || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: container, threshold: 0, rootMargin: "300px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, view, isLoading]);

  if (isMobile && !activeInboxId) {
    return (
      <div className="h-full w-full">
        <EmptyConversation />
      </div>
    );
  }

  if (!hasInboxes)
    return (
      <div className="text-sm text-xon-text-secondary">No inboxes assigned</div>
    );

  if (!activeInboxId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-xon-surface-container-hover p-4 rounded-full mb-4">
          <MessageCircle className="h-8 w-8 text-xon-text-secondary opacity-50" />
        </div>
        <p className="text-sm font-semibold text-xon-text-primary mb-1">
          {t("conversations.empty.select_inbox_title", {
            defaultValue: "No inbox selected",
          })}
        </p>
        <p className="text-xs text-xon-text-secondary max-w-[200px] mx-auto">
          {t("conversations.empty.select_inbox_desc", {
            defaultValue:
              "Select a channel from the sidebar to start managing conversations.",
          })}
        </p>
      </div>
    );
  }

  const channelType = activeInbox?.channel_type?.toLowerCase() ?? "";
  const channelConfig =
    !isInternal && channelType ? (CHANNEL_CONFIG[channelType] ?? null) : null;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mb-3 px-4">
        <input
          className="w-full rounded-md border border-xon-surface-outline bg-xon-surface-container px-3 py-2 text-sm outline-none text-xon-text-primary placeholder:text-xon-text-secondary"
          placeholder={t("conversations.search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isNewWhatsAppChatModalOpen && activeInboxId && (
        <StartWhatsAppChatModal
          open={isNewWhatsAppChatModalOpen}
          onOpenChange={setIsNewWhatsAppChatModalOpen}
          inboxId={Number(activeInboxId)}
          channelId={activeInbox?.channel_id}
        />
      )}

      <AgentConversationModal
        open={isAgentModalOpen}
        onOpenChange={setIsAgentModalOpen}
        defaultMode={agentModalMode}
      />

      <div className="mb-4 border-b border-xon-surface-outline">
        <div
          className="flex overflow-x-auto items-center gap-4 px-4 xon-scrollbar-hidden cursor-grab active:cursor-grabbing select-none"
          ref={(el) => {
            if (!el) return;
            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;
            el.onmousedown = (e) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
            el.onmouseleave = () => { isDown = false; };
            el.onmouseup = () => { isDown = false; };
            el.onmousemove = (e) => { if (!isDown) return; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX); };
          }}
        >
          {(isInternal
            ? [
                {
                  label: t("conversations.tabs.all"),
                  value: "all" as const,
                  count: internalCounts.all,
                },
                {
                  label: t("conversations.tabs.direct", {
                    defaultValue: "Direct",
                  }),
                  value: "direct" as const,
                  count: internalCounts.direct,
                },
                {
                  label: t("conversations.tabs.group", {
                    defaultValue: "Group",
                  }),
                  value: "group" as const,
                  count: internalCounts.group,
                },
              ]
            : [
                {
                  label: t("conversations.tabs.assigned"),
                  value: "assigned" as const,
                  count: (() => {
                    const raw = getCount(assignedTotal);
                    if (raw == null) return undefined;
                    return Math.max(0, raw - blockedAssignedCount);
                  })(),
                },
                {
                  label: t("conversations.tabs.unassigned"),
                  value: "unassigned" as const,
                  count: getCount(unassignedTotal),
                },
                {
                  label: t("conversations.tabs.all"),
                  value: "all" as const,
                  count: getCount(allTotal),
                },
                {
                  label: t("conversations.tabs.bot"),
                  value: "bot" as const,
                  count: getCount(botTotal),
                },
                {
                  label: t("conversations.tabs.closed"),
                  value: "closed" as const,
                  count: getCount(closedTotal),
                },
                {
                  label: t("conversations.tabs.blocked", "Blacklist"),
                  value: "blocked" as const,
                  count: blockedContactsData?.total,
                },
              ]
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setView(tab.value as any)}
              className={`pb-3 text-sm hover:text-md relative flex items-center gap-2 transition-all hover:font-bold hover:text-xon-primary hover:border-b-2 hover:border-b-xon-text-secondary ${view === tab.value ? "text-xon-primary" : "text-xon-text-secondary"}`}
            >
              <span className="font-semibold">{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`flex bg-xon-surface items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${view === tab.value ? "text-xon-primary" : "text-xon-text-secondary"}`}
                >
                  {tab.count}
                </span>
              )}
              {view === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-xon-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden border border-transparent bg-xon-surface-container"
        style={{ scrollbarWidth: "auto", maxHeight: "calc(100vh - 180px)" }}
      >
        {isLoading ? (
          <div>
            <ul className="space-y-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <li
                  key={idx}
                  className="w-full text-start flex items-center gap-3 p-2 rounded"
                >
                  <Skeleton variant="circle" className="h-10 w-10" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton variant="text" className="h-4 w-1/3" />
                    <Skeleton variant="text" className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </li>
              ))}
            </ul>
          </div>
        ) : error ? (
          <div className="p-4 flex items-start gap-3 bg-xon-container-red border border-xon-red rounded-md">
            <AlertCircle className="h-5 w-5 text-xon-text-red mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-xon-text-primary">
                Failed to load conversations
              </p>
              <p className="text-xs text-xon-text-secondary mt-1">
                {error instanceof Error ? error.message : "Error occurred"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
          </div>
        ) : (
          <ul className="pb-8">
            {displayConversations.length > 0 ? (
              displayConversations.map((group) => (
                <li key={group.contact_id}>
                  <ContactGroupItem
                    group={group}
                    availableTags={availableTags}
                  />
                </li>
              ))
            ) : searchQuery.trim().length > 0 ? (
              <div className="text-center py-12 px-4">
                <SearchX className="h-12 w-12 text-xon-text-secondary mx-auto mb-3 opacity-50" />
                <p className="text-base font-semibold text-xon-text-primary mb-2">
                  No results
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  <RotateCcw className="h-4 w-4" /> Clear search
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-10 px-4 gap-3">
                <NoChatsSvg />
                <p className="text-base font-semibold text-xon-text-primary">
                  No conversations available
                </p>
                {isInternal ? (
                  <div className="flex flex-col gap-2 w-full max-w-[220px] mt-1">
                    <button
                      onClick={() => {
                        setAgentModalMode("direct");
                        setIsAgentModalOpen(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[22px] text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      <MessageCirclePlus className="h-4 w-4" />
                      <span>{t("conversations.empty.new_direct_message")}</span>
                    </button>
                    <button
                      onClick={() => {
                        setAgentModalMode("group");
                        setIsAgentModalOpen(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[22px] text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-sm bg-gradient-to-r from-purple-600 to-violet-600"
                    >
                      <MessageCirclePlus className="h-4 w-4" />
                      <span>{t("conversations.empty.new_group")}</span>
                    </button>
                  </div>
                ) : channelConfig ? (
                  <button
                    onClick={() =>
                      channelType === "whatsapp"
                        ? setIsNewWhatsAppChatModalOpen(true)
                        : undefined
                    }
                    className="mt-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[22px] text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-sm"
                    style={{ backgroundImage: channelConfig.gradient }}
                  >
                    <channelConfig.icon
                      className="h-4 w-4"
                      style={{ color: "white" }}
                    />
                    <span>
                      {t("conversations.empty.new_channel_chat", {
                        channel: channelConfig.label,
                      })}
                    </span>
                  </button>
                ) : null}
              </div>
            )}

            <div
              ref={observerTarget}
              className="h-12 w-full flex items-center justify-center py-3"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-xs text-xon-text-secondary">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-xon-primary border-t-transparent" />
                  <span>Loading more…</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-xs text-xon-text-secondary opacity-0">
                  load trigger
                </span>
              ) : displayConversations.length > 0 ? (
                <span className="text-xs text-xon-text-secondary">
                  {displayConversations.length} conversation
                  {displayConversations.length !== 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
          </ul>
        )}
      </div>
    </div>
  );
}
