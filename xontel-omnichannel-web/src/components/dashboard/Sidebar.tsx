import React, { useEffect, useMemo, useState } from "react";
import { useConversationItems } from "@/api/conversations/hooks";
import { isConversationClosed } from "@/api/conversations/cacheUtils";
import { useAuthUser } from "@/contexts/AuthContext";
import {
  useUIContext,
  setSidebarView,
  setCallsTab,
  setActiveInboxId,
} from "@/contexts/UIContext";
import {
  Check,
  ChevronDown,
  Clock,
  X,
  Settings,
  Search,
  Filter,
  Mail,
  MessageCirclePlus,
  Users,
  MessageCircle,
  Plus,
  Phone,
  Contact,
} from "lucide-react";
import ConversationList from "@components/conversations/ConversationList";
import AgentConversationModal from "../conversations/AgentConversationModal";
import CallsList from "@components/calls/CallsList";
import ContactsList from "@components/conversations/ContactsList";
import EmailSidebar from "@components/email/EmailSidebar";
import EmailComposer from "@/components/email/EmailComposer";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import Avatar from "@components/shared/Avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser, useUserInboxes } from "@/api/users/hooks";
import { useAgentStatusMonitor } from "@/hooks/useAgentStatusMonitor";
import AvatarCapacityRing from "@/components/shared/AvatarCapacityRing";
import XonTooltip from "../ui/XonTooltip";
import { ContactResponse } from "@/api/contacts/types"
import { useDateFormat } from "@/hooks/useDateFormat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getChannelIcon } from "@/utils/channelUtils";
import StartWhatsAppChatModal from "../conversations/StartWhatsAppChatModal";
import UserSettingsPanel from "./UserSettingsPanel";


interface ContactWithConversation extends ContactResponse {
  conversationId?: number
  hasConversation: boolean
}

export default function Sidebar() {
  const { state: uiState, dispatch: uiDispatch } = useUIContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const { i18n, t } = useTranslation("chat");
  const isRTL = i18n.language === 'ar';
  const [selectedContact, setSelectedContact] = useState<ContactResponse | null>(null)
  const [isNewWhatsAppChatModalOpen, setIsNewWhatsAppChatModalOpen] = useState(false)
  const [isNewEmailModalOpen, setIsNewEmailModalOpen] = useState(false)
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentModalMode, setAgentModalMode] = useState<"direct" | "group">("direct");
  const activeView = uiState.sidebarView;
  const conversationItems = useConversationItems();

const location = useLocation();





  const { timezoneMismatch, getUserTimezone } = useDateFormat();

  const activeInboxId = uiState.activeInboxId;
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);



  useEffect(() => {
    const timeout = setTimeout(() => setShowInitialSkeleton(false), 600);
    return () => clearTimeout(timeout);
  }, []);

  const handleProfileClick = () => {
    navigate(`/profile`);
  };

  const authUser = useAuthUser();
  const userId = Number(authUser.id) || 0;
  const { data: currentUser } = useUser(userId);
  const { data: inboxes } = useUserInboxes(userId);


  const activeInboxName = React.useMemo(() => {
    if (activeView === "email") return t("interface.email_inbox");
    if (!activeInboxId) return t("sidebar.conversations"); // Fallback to 'Conversations' if general
    const currentInbox = inboxes?.items?.find(
      (i) => Number(i.id) === Number(activeInboxId),
    );
    return currentInbox?.name || t("sidebar.conversations");
  }, [activeView, activeInboxId, inboxes, t]);

  const maxConcurrentChats = useMemo(() => {
    const raw = (currentUser as any)?.max_concurrent_chats;
    const parsed = raw != null ? Number(raw) : undefined;
    return parsed != null && Number.isFinite(parsed) && parsed > 0
      ? parsed
      : undefined;
  }, [currentUser]);

  const currentOpenChats = useMemo(() => {
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

  const capacityTooltip = useMemo(() => {
    if (maxConcurrentChats != null) {
      return `${currentOpenChats} opened chats of ${maxConcurrentChats}`;
    }
    return `${currentOpenChats} opened chats`;
  }, [currentOpenChats, maxConcurrentChats]);

  const [agentStatus, setAgentStatus] = useState(
    currentUser?.agent_status || "online",
  );

  const handleStartNewChat = (contact: ContactResponse) => {
      setSelectedContact(contact)
      setIsNewWhatsAppChatModalOpen(true)
    }

  useEffect(() => {
    if (currentUser?.agent_status) setAgentStatus(currentUser.agent_status);
  }, [currentUser?.agent_status]);

  const { setManualStatus } = useAgentStatusMonitor({
    currentStatus: agentStatus,
    maxConcurrentChats,
    currentOpenChats,
    userId,
    onStatusChange: (status: string) => setAgentStatus(status),
  });

  const statusColor = useMemo(() => {
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


  const handleStatusChange = (nextStatus: string) =>
    setManualStatus(nextStatus);

  const hasToken = !!localStorage.getItem("authToken");
  const activeInbox = React.useMemo(() => {
    if (!activeInboxId) return null;
    return inboxes?.items?.find((i) => Number(i.id) === Number(activeInboxId));
  }, [activeInboxId, inboxes]);
  const channelId = activeInbox?.channel_id;
  const selectedChannelId = Number(searchParams.get('channel_id')) || 
                           Number(localStorage.getItem('selectedEmailChannelId')) ;

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

  const channelColor = activeView === "email"
    ? "#EA4335"
    : getChannelColor(activeInbox?.channel_type || "");

  const Icon = activeView === "email"
    ? (props: any) => React.createElement(Mail, { ...props, style: { color: "#EA4335", ...props.style } })
    : getChannelIcon(activeInbox?.channel_type || "");

  if (location.pathname.startsWith('/profile')) {
    return (
      <aside className="h-full min-h-0 flex flex-col bg-xon-surface-container border-e border-xon-surface-outline overflow-hidden px-0 py-0">
        <UserSettingsPanel />
      </aside>
    );
  }

  if (hasToken && showInitialSkeleton) {
    return (
      <aside className="h-full flex flex-col bg-xon-surface-container border-e border-xon-surface-outline px-4 py-4">
        <header className="flex items-center gap-3 mb-6">
          <Skeleton variant="circle" className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </header>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton variant="circle" className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full min-h-0 flex flex-col bg-xon-surface-container border-e border-xon-surface-outline overflow-hidden px-0 py-0">
      <header
        className={`sticky top-0 border-b border-xon-surface-outline bg-xon-surface-container ${isMobile ? "px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3" : "px-4 py-4"}`}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {isMobile && <SidebarTrigger className={cn("h-8 w-8", isRTL ? "-mr-1 ml-1" : "-ml-1 mr-1")} />}
            {/* <div className="flex gap-2 items-center min-w-0"> */}
              <div
                className={cn("size-8 rounded-lg flex items-center justify-center flex-shrink-0", isRTL ? "ml-2" : "mr-2")}
                style={{ backgroundColor: `${channelColor}20` }}
              >
                <Icon className="size-[18px] flex-shrink-0" style={{ color: channelColor }} />
              </div>
              <h2 className="text-sm font-bold text-xon-text-primary truncate">
                {activeInboxName}
              </h2>
              
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-[10px] font-bold uppercase tracking-wider text-xon-text-secondary hover:text-xon-text-primary flex items-center gap-1">
                    <span style={{ color: statusColor }}>{agentStatus}</span>
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[140px] rounded-xl p-1 shadow-lg">
                  {["online", "away", "busy", "offline"].map((status) => (
                    <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)} className="flex items-center gap-2 rounded-lg cursor-pointer">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status === "online" ? "var(--xon-color-text-green)" : status === "away" ? "var(--xon-color-text-yellow)" : "var(--xon-color-text-red)" }} />
                      <span className="text-xs font-medium capitalize">{status}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu> */}
            {/* </div> */}
          </div>
          

        {activeInbox?.channel_type?.toLowerCase() === "whatsapp" && activeView === "conversations" && (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                setSelectedContact(null)
                setIsNewWhatsAppChatModalOpen(true)
                }}
                variant="outline"
                className="shadow-none px-3 py-4 hover:bg-xon-surface "
                >
                <MessageCirclePlus className="h-5 w-5" />
            </Button>
          </div>
          )}

        {activeInbox?.channel_type?.toLowerCase() === "internal" && activeView === "conversations" && (
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="shadow-none px-3 py-4 hover:bg-xon-surface"
                >
                  <MessageCirclePlus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-[180px] p-1 rounded-xl">
                <DropdownMenuItem 
                  onClick={() => {
                    setAgentModalMode("direct");
                    setIsAgentModalOpen(true);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs font-semibold">{t("conversations.direct_message", "New Direct Message")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setAgentModalMode("group");
                    setIsAgentModalOpen(true);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-semibold">{t("conversations.create_group", "New Group")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {activeView === "email" && (
          <div className="flex bg-xon-surface-container-secondary rounded-xl p-0.5 border border-xon-surface-outline/30">
            <Button
            variant="ghost"
              onClick={() => {
                setIsNewEmailModalOpen(true);
              }}
                   className="shadow-none px-3 py-4 hover:bg-xon-surface"
       >
              <MessageCirclePlus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

        {activeView !== "email" && activeInbox?.channel_type !== "internal" && (
          <div className="flex bg-xon-surface-container-secondary rounded-xl p-0.5 border border-xon-surface-outline/30">
            <Button
              variant={activeView === "conversations" ? "ghost" : "ghost"}
              onClick={() => uiDispatch(setSidebarView("conversations"))}
              className={cn(
                "flex-1 h-8 text-[11px] hover:text-[12px] hover:text-xon-text-secondary font-bold rounded-lg transition-all",
                activeView === "conversations"
                  ? "bg-xon-primary text-white shadow-sm"
                  : "text-xon-text-secondary",
              )}
            >
              <MessageCircle className="h-3 w-3 " />
              {t("interface.chats")}
            </Button>
            <Button
              variant={activeView === "calls" ? "ghost" : "ghost"}
              onClick={() => {
                uiDispatch(setSidebarView("calls"));
                uiDispatch(setCallsTab("all"));
              }}
              className={cn(
                "flex-1 h-8 text-[11px] hover:text-[12px] hover:text-xon-text-secondary font-bold rounded-lg transition-all",
                activeView === "calls"
                  ? "bg-xon-primary text-white shadow-sm"
                  : "text-xon-text-secondary",
              )}
            >
              <Phone className="h-3 w-3" />
              {t("interface.calls")}
            </Button>
            {activeInbox?.channel_type?.toLowerCase() === 'whatsapp' && (
              <Button
                variant={activeView === "contacts" ? "ghost" : "ghost"}
                onClick={() => uiDispatch(setSidebarView("contacts"))}
                className={cn(
                  "flex-1 h-8 hover:text-xon-text-secondary text-[11px] hover:text-[12px] font-bold rounded-lg transition-all",
                  activeView === "contacts"
                    ? "bg-xon-primary text-white shadow-sm"
                    : "text-xon-text-secondary",
                )}
              >
                <Contact className="h-3 w-3" />
                {t("interface.contacts")}
              </Button>
            )}
          </div>
        )}
      
      </header>

      <div className="flex-1 overflow-hidden py-0">
        {activeView === "conversations" ? (
          <div className="h-full flex flex-col px-0 pt-2">
            <ConversationList />
          </div>
        ) : activeView === "calls" ? (
          <div className="h-full flex flex-col px-0 pt-2">
            <CallsList />
          </div>
        ) : activeView === "contacts" ? (
          <div className="h-full flex flex-col px-0 pt-2">
            <ContactsList />
          </div>
        ) : (
          <div className="h-full flex flex-col px-0 pt-2">
            <EmailSidebar channelId={selectedChannelId || undefined} />
          </div>
        )}
         {/* WhatsApp Chat Modal */}
              {isNewWhatsAppChatModalOpen && activeInboxId && (
                <StartWhatsAppChatModal
                  open={isNewWhatsAppChatModalOpen}
                  onOpenChange={setIsNewWhatsAppChatModalOpen}
                  inboxId={Number(activeInboxId)}
                  channelId={channelId}
                  selectedContact={selectedContact}
                />
              )}

              {/* Agent Conversation Modal */}
              {isAgentModalOpen && (
                <AgentConversationModal
                  open={isAgentModalOpen}
                  onOpenChange={setIsAgentModalOpen}
                  defaultMode={agentModalMode}
                />
              )}

              {/* Email Composer Modal */}
              {isNewEmailModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center p-6 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-500">
                  <div className="w-full max-w-4xl animate-in slide-in-from-bottom-12 duration-500">
                    <EmailComposer 
                      mode="compose"
                      initialData={{ channel_id: selectedChannelId }}
                      onClose={() => setIsNewEmailModalOpen(false)}
                    />
                  </div>
                </div>
              )}
      </div>
    </aside>
  );
}
