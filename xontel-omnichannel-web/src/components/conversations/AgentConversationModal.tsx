import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  Users,
  MessageCircle,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useCurrentUser } from "@/api/auth/hooks";
import { toast } from "sonner";
import { useUsersInfinite } from "@/api";
import { UserResponse } from "@/api/users/types";
import { useCreateGroupConversation, useCreateDirectConversation } from "@/api/conversations/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { addOrUpdateConversationInCache } from "@/api/conversations/cacheUtils";
import { cn } from "@/lib/utils";
import PermissionWrapper from "@/components/PermissionWrapper";
import AccessDenied from "@/components/AccessDenied";
import { PERMISSIONS } from "@/constants/permissions";

interface AgentConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "direct" | "group";
}

export default function AgentConversationModal({
  open,
  onOpenChange,
  defaultMode = "direct",
}: AgentConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar';
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const createGroupMutation = useCreateGroupConversation();
  const createDirectMutation = useCreateDirectConversation();

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsPWA(isStandalone);
    };
    checkPWA();
    window.addEventListener('resize', checkPWA);
    return () => window.removeEventListener('resize', checkPWA);
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const listContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: usersPages,
    isLoading: usersLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useUsersInfinite({ search: debouncedSearch || undefined });

  const filteredAgents: UserResponse[] = (usersPages?.pages.flatMap(p => p.users) ?? [])
    .filter(user => user && user.id !== currentUser?.id);

  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);
  hasNextPageRef.current = hasNextPage;
  isFetchingNextPageRef.current = isFetchingNextPage;
  fetchNextPageRef.current = fetchNextPage;

  // Callback ref: fires the moment the sentinel node enters/leaves the DOM.
  // By that time listContainerRef is already set, so root is always valid.
  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPageRef.current && !isFetchingNextPageRef.current) {
          fetchNextPageRef.current();
        }
      },
      { root: listContainerRef.current, threshold: 0, rootMargin: "0px 0px 80px 0px" },
    );
    observerRef.current.observe(node);
  }, []);

  const handleStartConversation = async () => {
    if (selectedAgents.length === 0) return;

    const inboxId = searchParams.get("inbox_id") ? Number(searchParams.get("inbox_id")) : undefined;

    setIsLoading(true);
    try {
      let response;
      if (selectedAgents.length === 1 && defaultMode === "direct") {
        response = await createDirectMutation.mutateAsync({
          user_id: selectedAgents[0].id,
          subject: subject || `${selectedAgents[0].full_name}`,
          inbox_id: inboxId,
        });
      } else {
        response = await createGroupMutation.mutateAsync({
          user_ids: selectedAgents.map(a => a.id),
          subject: subject || `Group Conversation`,
          inbox_id: inboxId,
        });
      }

      if (response.id || (response as any).conversation_id) {
        const conversationId = response.id || (response as any).conversation_id;
        
        // Only add to cache immediately when the server returned a real UUID.
        // Without a UUID the deduplication key is wrong (stringified numeric id ≠ UUID),
        // so ProfilePanel lookups would fail. The invalidation below handles the fallback.
        if (response.conversation_uuid) {
          addOrUpdateConversationInCache(queryClient, {
            ...response,
            conversation_type: selectedAgents.length === 1 && defaultMode === "direct" ? "direct" : "group",
            user_ids: selectedAgents.map(a => a.id).concat(currentUser?.id ? [currentUser.id] : []),
          } as any);
        }

        // Invalidate sidebar queries
        queryClient.invalidateQueries({ queryKey: ["sidebar-conversations-groups"] });
        queryClient.invalidateQueries({ queryKey: ["sidebar-conversations-direct"] });

        const next = new URLSearchParams(searchParams);
        next.set("conversation", String(conversationId));
        if (response.inbox_id) next.set("inbox_id", String(response.inbox_id));
        navigate(`/?${next.toString()}`);
        handleClose();
        toast.success(selectedAgents.length === 1 && defaultMode === "direct" ? "Conversation started!" : "Group created!");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAgents([]);
    setSubject("");
    setSearchQuery("");
    onOpenChange(false);
  };

  const toggleAgent = (agent: any) => {
    if (defaultMode === "direct") {
      setSelectedAgents([agent]);
    } else {
      if (selectedAgents.some(a => a.id === agent.id)) {
        setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id));
      } else {
        setSelectedAgents([...selectedAgents, agent]);
      }
    }
  };

  const removeAgent = (agentId: string) => {
    setSelectedAgents(prev => prev.filter(a => a.id !== agentId));
  };

  if (!open) return null;

  const renderContent = (isFull = false) => (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* Cool Header (Improved with balanced style) */}
      <div className={cn(
        "relative p-6 border-b border-border overflow-hidden shrink-0",
        isFull ? "pt-12" : ""
      )}>
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            {isFull && (
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
                <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
              </Button>
            )}
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                {defaultMode === "group" ? t("conversations.create_team_group") : t("conversations.direct_message")}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                {defaultMode === "group" ? t("conversations.collaborate_agents") : t("conversations.start_private")}
              </p>
            </div>
          </div>
          {!isFull && (
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-900/50">
        <PermissionWrapper
          permissionKey={PERMISSIONS.USERS.READ}
          fallback={<AccessDenied />}
        >
        {/* Input Area with Labels */}
        <div className="px-6 py-4 space-y-4 shrink-0">
          {(defaultMode === "group" || selectedAgents.length > 1) && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 text-start block">{t("conversations.group_subject")}</label>
              <Input
                placeholder={t("conversations.group_subject_placeholder")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 text-start block">{t("conversations.find_agents")}</label>
            <div className="relative group">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t("conversations.search_agents_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm", isRTL ? "pr-9 pl-3" : "pl-9")}
              />
            </div>
          </div>

          {/* Selected Members with Avatars */}
          {selectedAgents.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-start">{t("conversations.selected_members")}</label>
                <Button variant="link" onClick={() => setSelectedAgents([])} className="h-4 p-0 text-[10px] text-rose-500 font-bold uppercase tracking-tighter">{t("conversations.empty.clear_search")}</Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 max-h-24 overflow-y-auto xon-scrollbar-thin">
                {selectedAgents.map(agent => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm group hover:border-blue-300 transition-colors"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={agent.avatar_url} />
                      <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600 font-bold">{agent.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{agent.full_name}</span>
                    <button
                      onClick={() => removeAgent(agent.id)}
                      className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Improved Agent List with visible status */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto px-4 py-2 xon-scrollbar-thin">
          <div className="space-y-1">
            {usersLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 italic">
                <Search className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">{t("conversations.no_agents_found")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAgents.map((agent) => {
                  const isSelected = selectedAgents.some(a => a.id === agent.id);
                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border shadow-sm",
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-800 scale-[1.01]"
                          : "bg-white dark:bg-slate-900 border-transparent dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md"
                      )}
                      onClick={() => toggleAgent(agent)}
                    >
                      <div className="relative">
                        <Avatar className="h-11 w-11 border border-slate-100 dark:border-slate-800">
                          <AvatarImage src={agent.avatar_url} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold">{agent.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm",
                          agent.agent_status === "online" ? "bg-[var(--xon-color-text-green)]" :
                            agent.agent_status === "away" ? "bg-[var(--xon-color-text-yellow)]" : "bg-[var(--xon-color-text-red)]"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{agent.full_name}</span>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight shadow-sm",
                            agent.agent_status === "online" ? "bg-[var(--xon-color-text-green)]/20 text-[var(--xon-color-text-green)]" :
                              agent.agent_status === "away" ? "bg-[var(--xon-color-text-yellow)]/20 text-[var(--xon-color-text-yellow)]" :
                                "bg-[var(--xon-color-text-red)]/20 text-[var(--xon-color-text-red)]"
                          )}>
                            {t(`status.${agent.agent_status || 'offline'}`)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {agent.email} <span className="mx-1 text-slate-300">•</span> {agent.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Sentinel — triggers next page fetch when scrolled into view */}
                <div ref={sentinelCallbackRef} className="h-1" />
                {isFetchingNextPage && (
                  <div className="space-y-2 pb-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </PermissionWrapper>
      </div>

      {/* Modern Footer */}
      <div className="p-6 border-t border-border bg-white dark:bg-slate-950 shrink-0">
        <div className="flex gap-4">
          <Button variant="ghost" onClick={handleClose} className="flex-1 h-11 text-slate-500 font-semibold" disabled={isLoading}>
            {t("interface.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleStartConversation}
            disabled={selectedAgents.length === 0 || isLoading}
            className={cn(
              "flex-[1.5] h-11 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]",
              selectedAgents.length > 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed"
            )}
          >
            {isLoading ? "Starting..." : (
              <span className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {defaultMode === "group" ? t("conversations.create_group") : t("conversations.start_conversation")}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isPWA) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {renderContent(true)}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="p-0 gap-0 overflow-hidden flex flex-col max-w-lg h-[85vh] bg-background border shadow-2xl rounded-2xl">
        {renderContent(false)}
      </DialogContent>
    </Dialog>
  );
}
