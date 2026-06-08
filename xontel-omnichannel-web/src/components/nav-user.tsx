import {
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import Avatar from "@/components/shared/Avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthUser } from "@/contexts/AuthContext"
import { useConversationItems } from "@/api/conversations/hooks"
import { isConversationClosed } from "@/api/conversations/cacheUtils"
import { useMemo, useState } from "react"
import { useAgentStatusMonitor } from "@/hooks/useAgentStatusMonitor"
import { useUser } from "@/api"
import AvatarCapacityRing from "./shared/AvatarCapacityRing"
import { useNavigate } from "react-router-dom"

export function NavUser() {
  const { state } = useSidebar()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation('chat')
  const isRTL = i18n.language === 'ar'

  const userData = useAuthUser()
  const conversationItems = useConversationItems()
  const userId = Number(userData.id) || 0
  const { data: currentUser } = useUser(userId)

  const currentOpenChats = useMemo(() => {
    const apiCount = (currentUser as any)?.current_chat_count
    if (apiCount != null && Number.isFinite(Number(apiCount)) && Number(apiCount) >= 0) {
      return Number(apiCount)
    }
    return conversationItems.reduce((sum, conv: any) => {
      const assigned = conv?.assigned_agent_id != null && Number(conv.assigned_agent_id) === Number(userId)
      const isClosed = isConversationClosed(conv)
      return assigned && !isClosed ? sum + 1 : sum
    }, 0)
  }, [currentUser, conversationItems, userId])

  const maxConcurrentChats = useMemo(() => {
    const raw = (currentUser as any)?.max_concurrent_chats
    const parsed = raw != null ? Number(raw) : undefined
    return parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }, [currentUser])

  const capacityTooltip = useMemo(() => {
    if (maxConcurrentChats != null) {
      return t('sidebar.opened_chats_of', { current: currentOpenChats, max: maxConcurrentChats })
    }
    return t('sidebar.opened_chats', { count: currentOpenChats })
  }, [currentOpenChats, maxConcurrentChats, t])

  const [agentStatus, setAgentStatus] = useState(currentUser?.agent_status || "online")
  const { setManualStatus } = useAgentStatusMonitor({
    currentStatus: agentStatus,
    maxConcurrentChats,
    currentOpenChats,
    userId,
    onStatusChange: (status: string) => setAgentStatus(status),
  })
  const handleStatusChange = (nextStatus: string) => setManualStatus(nextStatus)

  const statusColor = useMemo(() => {
    switch (agentStatus) {
      case "offline": return "var(--xon-color-text-red)"
      case "away":    return "var(--xon-color-text-yellow)"
      case "busy":    return "var(--xon-color-text-red)"
      default:        return "var(--xon-color-text-green)"
    }
  }, [agentStatus])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="p-0 border-none outline-none overflow-hidden relative"
          asChild
        >
          <div>
            {/* Main click area — opens user settings in the sidebar */}
            <button
              onClick={() => navigate('/profile')}
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none cursor-pointer flex items-center px-2 hover:bg-sidebar-accent transition-all duration-300"
              aria-label={t('interface.settings', 'Settings')}
            />
            {/* </button> */}

            {/* Visual content — pointer-events-none so the button above handles clicks */}
            <div className="relative z-10 flex items-center gap-2 px-2 w-full h-full pointer-events-none group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0">
              <div className="pointer-events-auto shrink-0 flex items-center justify-center">
                <AvatarCapacityRing
                  current={currentOpenChats}
                  max={maxConcurrentChats}
                  size={state === "collapsed" ? 30 : 36}
                  strokeWidth={3}
                  tooltip={capacityTooltip}
                >
                  <div
                    onClick={() => navigate('/profile')}
                    className="relative cursor-pointer transition-transform active:scale-95 z-50"
                  >
                    <Avatar
                      src={currentUser?.avatar_url}
                      name={currentUser?.full_name}
                      size={state === "collapsed" ? "xs" : "sm"}
                    />
                    <span
                      className={`absolute rounded-full border-2 border-xon-surface-container shadow-sm ${
                        state === "collapsed" ? "-bottom-0.5 -right-0.5 h-2.5 w-2.5" : "-bottom-0.5 -right-0.5 h-3 w-3"
                      }`}
                      style={{ backgroundColor: statusColor }}
                    />
                  </div>
                </AvatarCapacityRing>
              </div>

              <div className="min-w-0 flex-1 group-data-[state=collapsed]:hidden flex flex-col justify-center">
                <h2 className="text-sm font-bold text-xon-text-primary truncate">
                  {currentUser?.full_name}
                </h2>
                {/* Status dropdown stays interactive */}
                <div className="pointer-events-auto w-fit mt-0.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-[10px] font-bold uppercase tracking-wider text-xon-text-secondary hover:text-xon-text-primary flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none p-0">
                        <span style={{ color: statusColor }}>{agentStatus}</span>
                        <ChevronDown className="h-2.5 w-2.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[140px] rounded-xl p-1 shadow-lg bg-xon-surface border border-sidebar-border z-50">
                      {["online", "away", "busy", "offline"].map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onSelect={() => handleStatusChange(status)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-sidebar-accent outline-none"
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                status === "online" ? "var(--xon-color-text-green)"
                                : status === "away"  ? "var(--xon-color-text-yellow)"
                                : "var(--xon-color-text-red)",
                            }}
                          />
                          <span className="text-xs font-medium capitalize">{t(`status.${status}`)}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="w-5 shrink-0 group-data-[state=collapsed]:hidden" />
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
