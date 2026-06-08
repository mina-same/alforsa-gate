import React, { useMemo, useState } from 'react';
import { useConversationItems } from '@/api/conversations/hooks';
import { isConversationClosed } from '@/api/conversations/cacheUtils';
import { useAuthUser } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, BarChart2, Shield, Bell, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { useLogout } from '@/api/auth/hooks';
import { useUser } from '@/api/users/hooks';
import Avatar from '@/components/shared/Avatar';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useAgentStatusMonitor } from '@/hooks/useAgentStatusMonitor';

type Tab = 'profile' | 'analytics' | 'account' | 'notifications';

const tabRoutes: Record<Tab, string> = {
  profile:       '/profile',
  analytics:     '/profile/analytics',
  account:       '/profile/account',
  notifications: '/profile/notifications',
};

const menuItems: { id: Tab; icon: React.ElementType; iconBg: string; iconColor: string }[] = [
  { id: 'profile',       icon: User,      iconBg: 'rgba(20,128,196,0.12)',  iconColor: 'text-xon-primary'     },
  { id: 'analytics',     icon: BarChart2, iconBg: 'rgba(139,92,246,0.12)', iconColor: 'text-violet-500'      },
  { id: 'account',       icon: Shield,    iconBg: 'rgba(255,145,95,0.15)', iconColor: 'text-xon-text-yellow' },
  { id: 'notifications', icon: Bell,      iconBg: 'rgba(255,0,77,0.12)',   iconColor: 'text-xon-text-red'    },
];

export default function UserSettingsPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar';
  const { mutate: logout } = useLogout();
  const userData = useAuthUser();
  const userId = Number(userData.id) || 0;
  const [agentStatus, setAgentStatus] = useState(userData?.agent_status || "online");
  const conversationItems = useConversationItems();
  const { data: currentUser } = useUser(userId);

  const activeTab: Tab =
    location.pathname === '/profile/analytics' ? 'analytics'
    : location.pathname.startsWith('/profile/account') ? 'account'
    : location.pathname === '/profile/notifications' ? 'notifications'
    : 'profile';

  const maxConcurrentChats = useMemo(() => {
    const raw = (currentUser as any)?.max_concurrent_chats;
    const parsed = raw != null ? Number(raw) : undefined;
    return parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [currentUser]);

  const currentOpenChats = useMemo(() => {
    const apiCount = (currentUser as any)?.current_chat_count;
    if (apiCount != null && Number.isFinite(Number(apiCount)) && Number(apiCount) >= 0) {
      return Number(apiCount);
    }
    return conversationItems.reduce((sum, conv: any) => {
      const assigned = conv?.assigned_agent_id != null && Number(conv.assigned_agent_id) === Number(userId);
      const isClosed = isConversationClosed(conv);
      return assigned && !isClosed ? sum + 1 : sum;
    }, 0);
  }, [currentUser, conversationItems, userId]);

  const { setManualStatus } = useAgentStatusMonitor({
    currentStatus: agentStatus,
    maxConcurrentChats,
    currentOpenChats,
    userId,
    onStatusChange: (status: string) => setAgentStatus(status),
  });

  const statusColor = useMemo(() => {
    switch (agentStatus) {
      case "offline": return "var(--xon-color-text-red)";
      case "away":    return "var(--xon-color-text-yellow)";
      case "busy":    return "var(--xon-color-text-red)";
      default:        return "var(--xon-color-text-green)";
    }
  }, [agentStatus]);

  const labels: Record<Tab, { label: string; description: string }> = {
    profile:       { label: t('interface.profile', 'Profile'),                         description: t('profile.menu_description', 'Profile picture, personal information') },
    analytics:     { label: t('interface.performance_analytics', 'Performance Analytics'), description: t('profile.analytics_description', 'Your analytics, chat capacity') },
    account:       { label: t('interface.account', 'Account'),                         description: t('profile.account_description', 'Reset password, passkeys') },
    notifications: { label: t('interface.notifications', 'Notifications'),             description: t('profile.notifications_menu_description', 'Messages, groups, sounds') },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-xon-surface-container-secondary border-b border-xon-surface-outline">
        <Avatar src={currentUser?.avatar_url} name={currentUser?.full_name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-xon-text-primary truncate">{currentUser?.full_name}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-[10px] font-bold uppercase tracking-wider text-xon-text-secondary hover:text-xon-text-primary flex items-center gap-1">
                <span style={{ color: statusColor }}>{agentStatus}</span>
                <ChevronDown className="h-2.5 w-2.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] rounded-xl p-1 shadow-lg bg-xon-surface-container border border-xon-surface-outline z-50">
              {["online", "away", "busy", "offline"].map((status) => (
                <DropdownMenuItem key={status} onSelect={() => setManualStatus(status)} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-xon-surface-container-hover outline-none">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status === "online" ? "var(--xon-color-text-green)" : status === "away" ? "var(--xon-color-text-yellow)" : "var(--xon-color-text-red)" }} />
                  <span className="text-xs font-medium capitalize">{status}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto xon-scrollbar-hidden">
        {/* Menu */}
        <div className="bg-xon-surface-container border-b border-xon-surface-outline overflow-hidden">
          {menuItems.map(({ id, icon: Icon, iconBg, iconColor }) => {
            const { label, description } = labels[id];
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => navigate(tabRoutes[id])}
                className={cn(
                  'w-full flex items-center border-b border-xon-surface-outline gap-3 px-4 py-3 transition-colors text-left',
                  isActive
                    ? 'bg-xon-surface border-l-4 border-b border-xon-primary border-b-xon-primary'
                    : 'hover:bg-xon-surface-container-hover',
                )}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
                  <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-xon-primary' : iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold truncate')}>{label}</p>
                  <p className="text-xs text-xon-text-secondary truncate">{description}</p>
                </div>
                <ChevronRight className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-xon-primary' : 'text-xon-text-secondary', isRTL && 'rotate-180')} />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 py-3 px-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <LogOut className="h-[18px] w-[18px] text-xon-text-red" />
          </div>
          <span className="text-sm font-semibold text-xon-text-red">{t('interface.logout', 'Log out')}</span>
        </button>
      </div>
    </div>
  );
}
