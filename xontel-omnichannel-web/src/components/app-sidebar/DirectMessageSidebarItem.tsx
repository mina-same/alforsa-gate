import React, { useMemo } from 'react';
import { useAuthUser } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useDirectMessageOtherUser } from '@/hooks/useDirectMessageOtherUser';
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Avatar from '@/components/shared/Avatar';
import { cn } from '@/lib/utils';
import { useLastMessageSentByMe } from '@/hooks/useLastMessageSentByMe';

interface DirectMessageSidebarItemProps {
  conversation: any;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
  maxWidth?: string;
}

export function DirectMessageSidebarItem({
  conversation,
  isActive,
  onClick,
  isCollapsed,
  maxWidth = 'calc(var(--sidebar-width) - 90px)',
}: DirectMessageSidebarItemProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentUserId = useAuthUser().id || undefined;

  // Get other user data for direct messages
  const lastMsgSentByMe = useLastMessageSentByMe(
    conversation.last_message_id,
    conversation.unread_messages_count,
  );

  const { name: dmOtherUserName, avatar: dmOtherUserAvatar, otherUser } = useDirectMessageOtherUser(
    conversation,
    currentUserId
  );

  // For direct messages, use other user's name/avatar
  const displayName = dmOtherUserName || conversation.name;
  const displayAvatar = dmOtherUserAvatar || conversation.avatar;

  // Get user status/online indicator
  const userStatus = useMemo(() => {
    const status = (otherUser as any)?.agent_status || 'offline';
    const statusColor = status === 'online' ? '#10b981' : status === 'away' ? '#f59e0b' : '#ef4444';
    return { status, color: statusColor };
  }, [otherUser]);

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            onClick={onClick}
            isActive={isActive}
            className="min-w-0 py-3 gap-0 transition-all duration-200 hover:scale-[1.02] group-data-[state=collapsed]:justify-center"
          >
            <div className="relative flex-shrink-0 size-8 flex items-center justify-center">
              <Avatar src={displayAvatar} name={displayName} className="size-8" />
              {!isCollapsed && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: userStatus.color }}
                  title={userStatus.status}
                />
              )}
            </div>
            <div className={cn(
              "flex items-center text-xon-text-secondary justify-between w-full min-w-0 group-data-[state=collapsed]:hidden",
              isRTL ? "mr-2" : "ml-2",
              isActive ? "text-xon-text-primary font-medium" : "text-xon-text-secondary font-medium"
            )}>
              <span className="truncate text-sm font-medium flex-1">
                {displayName}
              </span>
              {Number(conversation.unread_messages_count) > 0 && !lastMsgSentByMe && (
                <span className={cn(
                  "flex h-4 min-w-[16px] items-center justify-center rounded-full bg-xon-primary px-1.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-stone-900 shrink-0",
                  isRTL ? "mr-2" : "ml-2"
                )}>
                  {conversation.unread_messages_count}
                </span>
              )}
            </div>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-xon-surface-container text-xon-text-primary border border-xon-surface-outline shadow-xl px-3 py-1.5 text-xs">
          {displayName}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  );
}
