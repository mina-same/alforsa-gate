"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuthUser } from "@/contexts/AuthContext";
import {
  ChevronRight,
  ChevronDown,
  Layers,
  MessageSquare,
  Users,
  Plus,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Hash,
  AtSign,
  Search,
  Filter,
  Mail,
  Phone,
  GroupIcon,
  UsersIcon,
  Divide,
} from "lucide-react";


import {
  useUIContext,
  setActiveInboxId,
  setSidebarView,
  setCallsTab,
} from "@/contexts/UIContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getChannelIcon, getChannelLabel } from "@/utils/channelUtils";
import { ROUTE_PATHS } from "@/routes/config";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuSkeleton,
  // SidebarRail,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavUser } from "@/components/nav-user";
import { SidebarLanguageSwitcher } from "@/components/ui/sidebar-language-switcher";
import { SidebarThemeToggle } from "@/components/ui/sidebar-theme-toggle";
import logoLight from "@/assets/logos/logoLight.svg";
import logoDark from "@/assets/logos/logoDark.svg";
import logoAr from "@/assets/logos/logoAr.svg";     
import logoArDark from "@/assets/logos/logoArDark.svg";
import iconLight from "@/assets/logos/iconLight.svg";
import iconDark from "@/assets/logos/iconDark.svg";
import { useUser, useUserInboxes } from "@/api/users/hooks";
import { conversationsAPI } from "@/api/conversations/endpoints";
import { useConversationItems } from "@/api/conversations/hooks";
import { isConversationClosed } from "@/api/conversations/cacheUtils";
import AgentConversationModal from "@/components/conversations/AgentConversationModal";
import Avatar from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import AvatarCapacityRing from "./shared/AvatarCapacityRing";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useAgentStatusMonitor } from "@/hooks/useAgentStatusMonitor";
import { DirectMessageSidebarItem } from "./app-sidebar/DirectMessageSidebarItem";
import { GroupSidebarItem } from "./app-sidebar/GroupSidebarItem";
import StartWhatsAppChatModal from "@/components/conversations/StartWhatsAppChatModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEmailChannels, useUnreadEmails } from "@/api/email/hooks";

function InboxIconBadge({ icon: Icon, color, isActive }: { icon: React.ElementType; color: string; isActive: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  const bg = `${color}18`;
  const borders = isActive ? `1px solid ${color}` : hovered ? `1px solid ${color}` : ``;
  // const shadow = isActive ? `0 2px 10px ${color}30` : 'none';
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="size-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
      style={{ backgroundColor: bg, border :borders}}
    >
      <Icon className="h-[18px] w-[18px] flex-shrink-0" style={{ color }} />
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { i18n, t } = useTranslation("chat");
  const { state, setOpenMobile, isMobile: sidebarIsMobile } = useSidebar();
  const { state: uiState, dispatch: uiDispatch } = useUIContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isRTL = i18n.language === "ar";
  const isCollapsed = state === "collapsed";

  const activeInboxId = uiState.activeInboxId;
  const activeView = uiState.sidebarView;
  const currentConversationId = searchParams.get('conversation');

  const [isAgentModalOpen, setIsAgentModalOpen] = React.useState(false);
  const [agentModalMode, setAgentModalMode] = React.useState<
    "direct" | "group"
  >("direct");

  // Sections open states
  const [isChannelsOpen, setIsChannelsOpen] = React.useState(true);
  const [isGroupsOpen, setIsGroupsOpen] = React.useState(true);
  const [isDMsOpen, setIsDMsOpen] = React.useState(true);

  // WhatsApp chat modal state
  const [isNewWhatsAppChatModalOpen, setIsNewWhatsAppChatModalOpen] =
    useState(false);
  const [whatsappInboxId, setWhatsappInboxId] = useState<number | null>(null);

  // Email channels data
  const { data: unreadEmailsData } = useUnreadEmails();
  const unreadEmailCount = unreadEmailsData?.total || 0;

  // Fetch real user data and inboxes
  const userData = useAuthUser();
  const conversationItems = useConversationItems();

  const { data: userInboxes, isLoading: isLoadingInboxes } = useUserInboxes(
    userData.id,
  );
  const inboxes = userInboxes?.items || [];
  const inboxIds = inboxes.map((inbox: any) => inbox.id as number);
  // const inboxUnreadCounts = useInboxesUnreadCounts(inboxIds);

  // Fetch groups and direct messages independently using conversation_type parameter
  // This is more efficient than fetching all and filtering on client
  const hasToken = !!localStorage.getItem("authToken");

  const { data: groupsData } = useQuery({
    queryKey: ["sidebar-conversations-groups"],
    queryFn: () =>
      conversationsAPI.listConversations({
        limit: 10,
        skip: 0,
        conversation_type: "group",
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: hasToken,
  });

  const { data: directMessagesData } = useQuery({
    queryKey: ["sidebar-conversations-direct"],
    queryFn: () =>
      conversationsAPI.listConversations({
        limit: 15,
        skip: 0,
        conversation_type: "direct",
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: hasToken,
  });

  const groups = React.useMemo(() => {
    const userId = Number(userData.id) || 0;
    return (groupsData?.items || []).filter((conv: any) => {
      const userIds = conv.user_ids || [];
      return (
        userIds.includes(userId) ||
        userIds.some((id: any) => Number(id) === userId) ||
        conv.assigned_agent_id === userId
      );
    });
  }, [groupsData, userData.id]);

  const directMessages = React.useMemo(() => {
    const userId = Number(userData.id) || 0;
    return (directMessagesData?.items || []).filter((conv: any) => {
      const userIds = conv.user_ids || [];
      return (
        userIds.includes(userId) ||
        userIds.some((id: any) => Number(id) === userId) ||
        conv.assigned_agent_id === userId
      );
    });
  }, [directMessagesData, userData.id]);

  const handleSelectInbox = (inboxId: number | null) => {
    const inbox = inboxes.find((i: any) => Number(i.id) === Number(inboxId));
    const isEmail = inbox?.channel_type?.toLowerCase() === 'email';

    uiDispatch(setActiveInboxId(inboxId));

    const next = new URLSearchParams(searchParams);
    next.delete("conversation");

    if (isEmail) {
      uiDispatch(setSidebarView("email"));
      const channelId = inbox?.channel_id;
      if (channelId) {
        localStorage.setItem('selectedEmailChannelId', String(channelId));
        next.set('channel_id', String(channelId));
      }
      if (inboxId) next.set("inbox_id", String(inboxId));
      if (sidebarIsMobile) setOpenMobile(false);
      navigate(`/email?${next.toString()}`);
    } else {
      uiDispatch(setSidebarView("conversations"));
      if (inboxId) next.set("inbox_id", String(inboxId));
      else next.delete("inbox_id");
      if (sidebarIsMobile) setOpenMobile(false);
      navigate(`/?${next.toString()}`);
    }
  };

  const handleSelectConversation = (
    conversationId: string | number,
    inboxId?: number | null,
  ) => {
    if (inboxId !== undefined) {
      uiDispatch(setActiveInboxId(inboxId));
    }
    uiDispatch(setSidebarView("conversations"));

    const next = new URLSearchParams(searchParams);
    next.set("conversation", String(conversationId));
    if (inboxId) next.set("inbox_id", String(inboxId));
    else next.delete("inbox_id");
    if (sidebarIsMobile) setOpenMobile(false);
    navigate(`/?${next.toString()}`);
  };

  const userId = Number(userData.id) || 0;
  const { data: currentUser } = useUser(userId);

  const currentOpenChats = React.useMemo(() => {
    const apiCount = (currentUser as any)?.current_chat_count;
    if (
      apiCount != null &&
      Number.isFinite(Number(apiCount)) &&
      Number(apiCount) >= 0
    ) {
      return Number(apiCount);
    }
    return conversationItems.reduce((sum, conv: any) => {
      const assigned =
        conv?.assigned_agent_id != null &&
        Number(conv.assigned_agent_id) === Number(userId);
      const isClosed = isConversationClosed(conv);
      return assigned && !isClosed ? sum + 1 : sum;
    }, 0);
  }, [currentUser, conversationItems, userId]);

  const maxConcurrentChats = React.useMemo(() => {
    const raw = (currentUser as any)?.max_concurrent_chats;
    const parsed = raw != null ? Number(raw) : undefined;
    return parsed != null && Number.isFinite(parsed) && parsed > 0
      ? parsed
      : undefined;
  }, [currentUser]);

  const capacityTooltip = React.useMemo(() => {
    if (maxConcurrentChats != null) {
      return t("sidebar.opened_chats_of", {
        current: currentOpenChats,
        max: maxConcurrentChats,
      });
    }
    return t("sidebar.opened_chats", { count: currentOpenChats });
  }, [currentOpenChats, maxConcurrentChats, t]);

  const [agentStatus, setAgentStatus] = useState(
    currentUser?.agent_status || "online",
  );
  const { setManualStatus } = useAgentStatusMonitor({
    currentStatus: agentStatus,
    maxConcurrentChats,
    currentOpenChats,
    userId,
    onStatusChange: (status: string) => setAgentStatus(status),
  });
  const handleStatusChange = (nextStatus: string) =>
    setManualStatus(nextStatus);

  const statusColor = React.useMemo(() => {
    switch (agentStatus) {
      case "offline":
        return "var(--xon-color-text-red)";
      case "away":
        return "var(--xon-color-text-yellow)";
      case "busy":
        return "var(--xon-color-text-red)";
      default:
        return "var(--xon-color-text-green)";
    }
  }, [agentStatus]);

  const handleProfileClick = () => {
    navigate(`/profile`);
  };

  const getChannelColor = (channelType: string): string => {
    switch ((channelType || "").toLowerCase()) {
      case "whatsapp": return "#25D366";
      case "facebook":
      case "messenger": return "#0084FF";
      case "email": return "#EA4335";
      case "internal": return "#6366F1";
      default: return "#6B7280";
    }
  };

  const user = {
    name: userData.full_name || "User",
    email: userData.email || "",
    avatar: userData.avatar_url || "/avatars/default.jpg",
  };

  return (
    <Sidebar
      side={isRTL ? "right" : "left"}
      collapsible="icon"
      className={`top-[--header-height] !h-[calc(100svh-var(--header-height))] transition-all duration-500 ease-in-out ${isRTL ? "rtl" : "ltr"}`}
      {...props}
    >
      {/* <SidebarRail /> */}
      <SidebarHeader className="pt-4 px-4 group-data-[state=collapsed]:px-2">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-4 overflow-hidden`}>
          <div className="group-data-[state=collapsed]:hidden">
            <img
              src={isRTL ? logoAr : logoLight}
              alt="Xontel Logo"
              className="h-20 w-auto dark:hidden"
            />
            <img
              src={isRTL ? logoArDark : logoDark}
              alt="Xontel Logo"
              className="h-20 w-auto hidden dark:block"
            />
          </div>

          <div className="flex ">
            <SidebarTrigger className="h-6 w-6 text-xon-text-secondary hover:text-xon-primary" />
            <div className="hidden group-data-[state=collapsed]:block">
              <img
                src={iconDark}
                alt="Xontel Icon"
                className="h-8 w-8 dark:hidden"
              />
              <img
                src={iconLight}
                alt="Xontel Icon"
                className="h-8 w-8 hidden dark:block"
              />
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea dir={isRTL ? "rtl" : "ltr"}>
          {/* Channels Section */}
          <SidebarGroup>
            <Collapsible open={isChannelsOpen} onOpenChange={setIsChannelsOpen}>
              <div
                className={cn(
                  "flex items-center justify-between px-3 mb-1 group group-data-[state=collapsed]:hidden",
                )}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.15em] cursor-pointer text-xon-text-secondary" style={{  }}>
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-200",
                        !isChannelsOpen && (isRTL ? "rotate-90" : "-rotate-90"),
                      )}
                    />
                    <span className="[text-shadow:0_5.15px_10.29px_rgba(0,0,0,0.15)]">{t("conversations.channels")}</span>
                  </div>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent
                className={cn(!isCollapsed && (isRTL ? "pr-2" : "pl-2"))}
              >
                <SidebarMenu className={cn(isCollapsed  ? "gap-3" : "")}>
                  {/* <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleSelectInbox(null)}
                      isActive={!activeInboxId}
                      tooltip="General Inbox"
                    >
                      <Globe className="size-4" />
                      <span className="font-semibold truncate">General Inbox</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem> */}

             

                  {isLoadingInboxes
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <SidebarMenuItem key={i}>
                          <SidebarMenuSkeleton />
                        </SidebarMenuItem>
                      ))
                    : inboxes.map((inbox: any) => {
                        const Icon = getChannelIcon(inbox.channel_type);
                        const isActive = Number(activeInboxId) === Number(inbox.id);
                        const channelColor = getChannelColor(inbox.channel_type);
                        const unreadCount = inbox.channel_type?.toLowerCase() === 'email'
                          ? unreadEmailCount
                          : inbox.unread_count;
                        const isInternal = inbox.channel_type?.toLowerCase() === "internal";
                        const isConvActive = isActive && activeView === "conversations";
                        const isCallsActive = isActive && activeView === "calls";
                        const isContactsActive = isActive && activeView === "contacts";
                        const isEmailActive = isActive && activeView === "email";
                        return (
                          <Collapsible
                            key={inbox.id}
                            asChild
                            defaultOpen={isActive}
                          >
                            <SidebarMenuItem>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <SidebarMenuButton
                                    onClick={() => handleSelectInbox(inbox.id)}
                                    isActive={isActive}
                                    className="min-w-0 py-3 gap-0 group/inbox transition-all duration-200 hover:scale-[1.02] group-data-[state=collapsed]:justify-center"
                                  >
                                    <InboxIconBadge icon={Icon} color={channelColor} isActive={isActive} />
                                    <span className={cn(
                                      "truncate text-xon-text-secondary flex-1 min-w-0 transition-all duration-200",
                                      isRTL ? "mr-2" : "ml-2",
                                      isCollapsed ? "hidden" : "",
                                      isActive
                                        ? "font-semibold text-xon-text-primary"
                                        : "font-medium group-hover/inbox:font-semibold group-hover/inbox:text-[14px]",
                                    )}>
                                      {inbox.name}
                                    </span>
                                  </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="relative bg-xon-surface-container text-xon-text-primary border border-xon-surface-outline shadow-xl px-3 py-1.5 text-xs"
                                >
                                  {inbox.name}
                                </TooltipContent>
                              </Tooltip>
                              {!isInternal && unreadCount > 0 && (
                                <span
                                  className={cn(
                                    "pointer-events-none absolute flex items-center justify-center rounded-full bg-xon-red font-bold text-white",
                                    "top-4 h-5 min-w-[20px] px-1.5 text-[10px]",
                                    "group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-[16px] group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:text-[9px]",
                                    isCollapsed ? "group-data-[collapsible=icon]:-top-1" : "group-data-[collapsible=icon]:-top-3",
                                    isRTL
                                      ? "left-8 group-data-[collapsible=icon]:left-0.5"
                                      : "right-6 group-data-[collapsible=icon]:-right-0.5",
                                  )}
                                >
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                              )}
                              {/* {!isCollapsed && (
                                <CollapsibleTrigger className="[text-shadow:0_5.15px_10.29px_rgba(0,0,0,0.15)]" asChild>
                                  <SidebarMenuAction
                                    className={cn(
                                      "[text-shadow:0_5.15px_10.29px_rgba(0,0,0,0.15)] transition-transform rounded-full !top-4 duration-200",
                                      isRTL
                                        ? "rotate-180 data-[state=open]:rotate-90"
                                        : "data-[state=open]:rotate-90",
                                    )}
                                  >
                                    <ChevronRight className="size-4 group/inbox:hover:size-5 text-xon-text-secondary active:text-xon-text-primary drop-shadow-md" />
                                  </SidebarMenuAction>
                                </CollapsibleTrigger>
                              )} */}
                              {/* <CollapsibleContent>
                                <SidebarMenuSub>
                                  {inbox.channel_type?.toLowerCase() !== 'email' && (
                                    <>
                                      <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                          onClick={() => handleItemClick("chat", inbox.id)}
                                          className={cn(
                                            "text-xs w-full flex items-center gap-2 transition-all duration-150",
                                            isConvActive
                                              ? "font-semibold text-xon-text-primary bg-xon-surface rounded-lg"
                                              : "font-medium text-xon-text-secondary hover:font-semibold hover:text-xon-text-primary",
                                          )}
                                        >
                                          <MessageSquare className="size-3.5 shrink-0" />
                                          <span className="flex-1">{t("sidebar.conversations")}</span>
                                          {!isInternal && unreadCount > 0 && (
                                            <span className={cn(
                                              "flex h-4 min-w-[16px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                                              isConvActive
                                                ? "bg-xon-primary text-white"
                                                : "bg-xon-surface-container-hover text-xon-text-secondary",
                                            )}>
                                              {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                          )}
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                      {!isInternal && (
                                      <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                          onClick={() => handleItemClick("calls", inbox.id)}
                                          className={cn(
                                            "text-xs w-full flex items-center gap-2 transition-all duration-150",
                                            isCallsActive
                                              ? "font-semibold text-xon-text-primary bg-xon-surface rounded-lg"
                                              : "font-medium text-xon-text-secondary hover:font-semibold hover:text-xon-text-primary",
                                          )}
                                        >
                                          <Phone className="size-3.5 shrink-0" />
                                          <span className="flex-1">{t("sidebar.calls")}</span>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                      )}
                                    </>
                                  )}
                                  {inbox.channel_type?.toLowerCase() === "whatsapp" && (
                                    <SidebarMenuSubItem>
                                      <div className="flex items-center justify-between w-full">
                                        <SidebarMenuSubButton
                                          onClick={() => handleItemClick("contacts", inbox.id)}
                                          className={cn(
                                            "text-xs flex-1 flex items-center gap-2 transition-all duration-150",
                                            isContactsActive
                                              ? "font-semibold text-xon-text-primary bg-xon-surface rounded-lg"
                                              : "font-medium text-xon-text-secondary hover:font-semibold hover:text-xon-text-primary",
                                          )}
                                        >
                                          <UsersIcon className="size-3.5 shrink-0" />
                                          <span className="flex-1">{t("sidebar.contacts")}</span>
                                        </SidebarMenuSubButton>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setWhatsappInboxId(inbox.id);
                                            setIsNewWhatsAppChatModalOpen(true);
                                          }}
                                          className="flex items-center justify-center h-5 w-5 rounded hover:bg-sidebar-accent text-xon-text-secondary hover:text-xon-primary transition-colors"
                                          title={t("sidebar.new_whatsapp_chat")}
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </SidebarMenuSubItem>
                                  )}
                                  {inbox.channel_type?.toLowerCase() === 'email' && (
                                    <SidebarMenuSubItem>
                                      <SidebarMenuSubButton
                                        onClick={() => handleItemClick("email", inbox.id)}
                                        className={cn(
                                          "text-xs w-full flex items-center gap-2 transition-all duration-150",
                                          isEmailActive
                                            ? "font-semibold text-xon-primary bg-xon-primary/10 rounded-lg"
                                            : "font-medium text-xon-text-secondary hover:font-semibold hover:text-xon-text-primary",
                                        )}
                                      >
                                        <Mail className="size-3.5 shrink-0" />
                                        <span className="flex-1">{t("sidebar.email")}</span>
                                        {unreadCount > 0 && (
                                          <span className={cn(
                                            "flex h-4 min-w-[16px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                                            isEmailActive
                                              ? "bg-xon-primary text-white"
                                              : "bg-xon-surface-container-hover text-xon-text-secondary",
                                          )}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                          </span>
                                        )}
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  )}
                                </SidebarMenuSub>
                              </CollapsibleContent> */}
                            </SidebarMenuItem>
                          </Collapsible>
                        );
                      })}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          {/* Groups Section */}
          {/* <SidebarGroup>
            <Collapsible open={isGroupsOpen} onOpenChange={setIsGroupsOpen}>
              <div
                className={cn(
                  "flex items-center justify-between px-3 mb-2 group group-data-[state=collapsed]:hidden",
                )}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.15em] cursor-pointer text-xon-text-secondary">
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-200",
                        !isGroupsOpen && (isRTL ? "rotate-90" : "-rotate-90"),
                      )}
                    />
                    <span className="[text-shadow:0_5.15px_10.29px_rgba(0,0,0,0.15)]">{t("conversations.groups")}</span>
                  </div>
                </CollapsibleTrigger>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAgentModalMode("group");
                    setIsAgentModalOpen(true);
                  }}
                  className="flex items-center justify-center rounded-full border border-xon-surface-outline hover:border-xon-primary p-1 hover:bg-sidebar-accent text-sidebar-foreground transition-opacity"
                  title="Create Group"
                >
                  <Plus className="size-3" />
                </button>
              </div>
              <CollapsibleContent
                className={cn(!isCollapsed && (isRTL ? "pr-2" : "pl-2"))}
              >
                <SidebarMenu>
                  {groups?.length === 0 ? (
                    <div className="px-4 py-2 text-[10px] italic opacity-40 group-data-[state=collapsed]:hidden">
                      {t("conversations.empty.no_group_chats")}
                    </div>
                  ) : (
                    groups?.slice(0, 10).map((conv: any) => {
                      const convId = conv.numeric_id || conv.id;
                      const cid = currentConversationId ?? '';
                      const isGroupActive =
                        cid === String(conv.id) ||
                        (conv.numeric_id && cid === String(conv.numeric_id)) ||
                        (conv.conversation_uuid && cid === String(conv.conversation_uuid));
                      return (
                        <GroupSidebarItem
                          key={convId}
                          conv={conv}
                          isActive={isGroupActive}
                          isRTL={isRTL}
                          onClick={() => handleSelectConversation(convId, conv.inbox_id || undefined)}
                        />
                      );
                    })
                  )}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup> */}

          {/* Direct Messages Section */}
          {/* <SidebarGroup>
            <Collapsible open={isDMsOpen} onOpenChange={setIsDMsOpen}>
              <div
                className={cn(
                  "flex items-center justify-between px-3 mb-2 group group-data-[state=collapsed]:hidden",
                )}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.15em] cursor-pointer text-xon-text-secondary">
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-200",
                        !isDMsOpen && (isRTL ? "rotate-90" : "-rotate-90"),
                      )}
                    />
                    <span className="[text-shadow:0_5.15px_10.29px_rgba(0,0,0,0.15)]">{t("conversations.direct_messages")}</span>
                  </div>
                </CollapsibleTrigger>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAgentModalMode("direct");
                    setIsAgentModalOpen(true);
                  }}
                  className="flex border border-xon-surface-outline hover:border-xon-primary p-1 items-center justify-center rounded-full hover:bg-sidebar-accent text-sidebar-foreground transition-opacity"
                  title="New DM"
                >
                  <Plus className="size-3 w-full" />
                </button>
              </div>
              <CollapsibleContent
                className={cn(!isCollapsed && (isRTL ? "pr-2" : "pl-2"))}
              >
                <SidebarMenu>
                  {directMessages?.length === 0 ? (
                    <div className="px-4 py-2 text-[10px] italic opacity-40 group-data-[state=collapsed]:hidden">
                      {t("conversations.empty.no_direct_messages")}
                    </div>
                  ) : (
                    directMessages?.slice(0, 15).map((conv: any) => {
                      const convId = String(conv.numeric_id || conv.id);
                      const cid = currentConversationId ?? '';
                      const isActive =
                        cid === String(conv.id) ||
                        (conv.numeric_id && cid === String(conv.numeric_id)) ||
                        (conv.conversation_uuid && cid === String(conv.conversation_uuid));
                      return (
                        <DirectMessageSidebarItem
                          key={convId}
                          conversation={conv as any}
                          isActive={isActive}
                          onClick={() =>
                            handleSelectConversation(
                              convId,
                              conv.inbox_id || undefined,
                            )
                          }
                          isCollapsed={isCollapsed}
                          maxWidth="calc(var(--sidebar-width) - 90px)"
                        />
                      );
                    })
                  )}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup> */}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="pb-4 gap-4 group-data-[state=collapsed]:pb-2 group-data-[state=collapsed]:gap-4">
        <SidebarSeparator />
        <SidebarMenu className="gap-4">
          <SidebarMenuItem>
            <SidebarLanguageSwitcher />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>

      <AgentConversationModal
        open={isAgentModalOpen}
        onOpenChange={setIsAgentModalOpen}
        defaultMode={agentModalMode}
      />

      {whatsappInboxId && (
        <StartWhatsAppChatModal
          open={isNewWhatsAppChatModalOpen}
          onOpenChange={setIsNewWhatsAppChatModalOpen}
          inboxId={whatsappInboxId}
          channelId={
            inboxes.find((i: any) => i.id === whatsappInboxId)?.channel_id
          }
        />
      )}
    </Sidebar>
  );


  

  function handleItemClick(
    key: "chat" | "calls" | "contacts" | "settings" | "email",
    inboxId: number,
  ) {
    uiDispatch(setActiveInboxId(inboxId));

    if (key === "calls") {
      uiDispatch(setSidebarView("calls"));
      uiDispatch(setCallsTab("all"));
    } else if (key === "contacts") {
      uiDispatch(setSidebarView("contacts"));
    }
    else if (key === "email") {
      uiDispatch(setSidebarView("email"));
    }
    else {
      uiDispatch(setSidebarView("conversations"));
    }

    const next = new URLSearchParams(searchParams);
    next.set("inbox_id", String(inboxId));
    next.delete("conversation");
    if(key !== "email") {
      navigate(`/?${next.toString()}`);
    }else{
      navigate(`/email?${next.toString()}`);
    }
  }
}
