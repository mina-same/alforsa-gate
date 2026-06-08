import React, { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useConversationItems } from '@/api/conversations/hooks'
import { isConversationClosed } from '@/api/conversations/cacheUtils'
import { MessageSquare, Phone, Settings, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useUIContext, setCallsTab, setSidebarView } from '@/contexts/UIContext'
import { useAuthUser } from '@/contexts/AuthContext'
import { useUser } from '@/api/users/hooks'
import AvatarCapacityRing from '@/components/shared/AvatarCapacityRing'
import Avatar from '@/components/shared/Avatar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { userPermissionsStorage } from '@/lib/userPermissions'
import { PERMISSIONS } from '@/constants/permissions'

interface NavItem {
    id: string
    label: string
    icon: React.ElementType
    path: string
}

export function MobileBottomNav() {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { state: uiState, dispatch: uiDispatch } = useUIContext()
    const { i18n, t } = useTranslation('chat')

    const activeView = uiState.sidebarView
    const activeInboxId = uiState.activeInboxId
    const isProfileOpen = uiState.profilePanel.isOpen

    const currentConversationId = searchParams.get('conversation')
    const conversationItems = useConversationItems();

    const authUser = useAuthUser();
    const userId = Number(authUser.id) || 0;
    const { data: currentUser } = useUser(userId);

    const maxConcurrentChats = useMemo(() => {
        const raw = (currentUser as any)?.max_concurrent_chats as number | string | undefined;
        const parsed = raw != null ? Number(raw) : undefined;
        return parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }, [currentUser]);

    const currentOpenChats = useMemo(() => {
        const apiCount = (currentUser as any)?.current_chat_count;
        if (apiCount != null && Number.isFinite(Number(apiCount)) && Number(apiCount) >= 0) {
            return Number(apiCount);
        }
        if (userId && conversationItems.length > 0) {
            return conversationItems.reduce((sum, conv: any) => {
                const assigned =
                    conv?.assigned_agent_id != null &&
                    Number(conv.assigned_agent_id) === Number(userId);
                const isClosed = isConversationClosed(conv);
                return assigned && !isClosed ? sum + 1 : sum;
            }, 0);
        }
        return 0;
    }, [currentUser, conversationItems, userId]);

    // Use current user status if available, fallback to initial
    const agentStatus = (currentUser as any)?.agent_status || (authUser as any)?.agent_status;

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

    const capacityTooltip = useMemo(() => {
        if (maxConcurrentChats != null) {
            return `${currentOpenChats} opened chats of ${maxConcurrentChats}`;
        }
        return `${currentOpenChats} opened chats`;
    }, [currentOpenChats, maxConcurrentChats]);

    const ProfileIcon = ({ className }: { className?: string }) => {
        // We ignore the passed className's sizing (h-6 w-6) to enforce our own size,
        // but keep the text spacing/positioning if relevant.
        return (
            <div className={cn("relative flex items-center justify-center")}>
                <AvatarCapacityRing
                    current={currentOpenChats}
                    max={maxConcurrentChats}
                    size={34}
                    strokeWidth={2.5}
                    tooltip={capacityTooltip}
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Avatar src={currentUser?.avatar_url || authUser.avatar_url} name={authUser.full_name || ''} size="sm" />
                        <span
                            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-xon-surface-container"
                            style={{ backgroundColor: statusColor }}
                        />
                    </div>
                </AvatarCapacityRing>
            </div>
        )
    }

    const canAccessSettings = userPermissionsStorage.hasPermission(PERMISSIONS.SETTINGS.MANAGE)
        || userPermissionsStorage.hasPermission(PERMISSIONS.INBOXES.READ);

    const navItems: NavItem[] = [
        {
            id: 'chats',
            label: t('sidebar.conversations'),
            icon: MessageSquare,
            path: activeInboxId
                ? `/?inbox_id=${activeInboxId}`
                : `/`,
        },
        {
            id: 'calls',
            label: t('sidebar.calls'),
            icon: Phone,
            // Match web sidebar behaviour: same base URL as Chat, only view/tab changes
            path: activeInboxId
                ? `/?inbox_id=${activeInboxId}`
                : `/`,
        },
        ...(canAccessSettings ? [{
            id: 'settings',
            label: t('profile.settings'),
            icon: Settings,
            path: activeInboxId
                ? `/settings?inbox_id=${activeInboxId}`
                : `/settings`,
        }] : []),
        {
            id: 'profile',
            label: t('profile.title'),
            icon: ProfileIcon,
            path: `/profile`,
        },
    ]

    const isActive = (itemId: string) => {
        const currentPath = location.pathname;
        if (itemId === 'profile') return currentPath.includes('/profile');
        if (itemId === 'settings') return currentPath.includes('/settings');
        // Only consider conversations/calls active if we're NOT on settings/profile pages
        if (currentPath.includes('/settings') || currentPath.includes('/profile')) {
            return false;
        }
        if (itemId === 'calls') return activeView === 'calls';
        if (itemId === 'chats') return activeView === 'conversations';
        return false;
    }

    const isSettingsRoute = location.pathname.includes('/settings')
    const isProfileRoute = location.pathname.includes('/profile')

    if (currentConversationId && !isSettingsRoute && !isProfileRoute && !isProfileOpen) {
        return null
    }

    return (
        <TooltipProvider>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 backdrop-blur-md bg-opacity-98 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-stretch justify-center gap-8 h-16 relative">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.id)
                        const isProfile = item.id === 'profile'

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === "calls") {
                                        uiDispatch(setCallsTab("all"))
                                        uiDispatch(setSidebarView('calls'))
                                    } else if (item.id === "chats") {
                                        uiDispatch(setSidebarView('conversations'))
                                    }
                                    navigate(item.path)
                                }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1 transition-all duration-200",
                                    "active:scale-95 w-16"
                                )}
                            >
                                {/* Active top indicator */}
                                <div
                                    className={cn(
                                        "absolute top-0 left-0 right-0 h-0.5 bg-primary transition-all duration-300",
                                        active ? "opacity-100" : "opacity-0"
                                    )}
                                />

                                {/* Icon */}
                                <Icon
                                    className={cn(
                                        "transition-all duration-200",
                                        isProfile ? "" : "h-6 w-6", // ProfileIcon handles its own size
                                        active
                                            ? "text-primary stroke-[2.5]"
                                            : "text-muted-foreground stroke-[2]"
                                    )}
                                />

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-[11px] font-medium transition-all duration-200",
                                        active
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </nav>
        </TooltipProvider>
    )
}
