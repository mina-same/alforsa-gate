import React from 'react';
import { useTranslation } from 'react-i18next';
import { UsersIcon } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLastMessageSentByMe } from '@/hooks/useLastMessageSentByMe';

interface GroupSidebarItemProps {
  conv: any;
  isActive: boolean;
  isRTL: boolean;
  onClick: () => void;
}

export function GroupSidebarItem({ conv, isActive, isRTL, onClick }: GroupSidebarItemProps) {
  const { i18n } = useTranslation();
  const lastMsgSentByMe = useLastMessageSentByMe(
    conv.last_message_id,
    conv.unread_messages_count,
  );

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            onClick={onClick}
            isActive={isActive}
            className="min-w-0 py-3 gap-0 transition-all duration-200 hover:scale-[1.02] group-data-[state=collapsed]:justify-center"
          >
            <div className="size-8 bg-[#FFF1C9] rounded-lg flex items-center justify-center flex-shrink-0">
              <UsersIcon className="size-4 text-xon-yellow" />
            </div>
            <div
              className={cn(
                "flex items-center justify-between w-full min-w-0 group-data-[state=collapsed]:hidden",
                isRTL ? "mr-2" : "ml-2",
              )}
            >
              <span className={cn(
                "truncate text-sm flex-1",
                isActive
                  ? "text-xon-text-primary font-semibold"
                  : "text-xon-text-secondary font-medium",
              )}>
                {conv.subject || conv.contact?.name || "Group"}
              </span>
              {Number(conv.unread_messages_count) > 0 && !lastMsgSentByMe && (
                <span
                  className={cn(
                    "flex h-4 min-w-[16px] items-center justify-center rounded-full bg-xon-primary px-1.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-stone-900 shrink-0",
                    isRTL ? "mr-2" : "ml-2",
                  )}
                >
                  {conv.unread_messages_count}
                </span>
              )}
            </div>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-xon-surface-container text-xon-text-primary border border-xon-surface-outline shadow-xl px-3 py-1.5 text-xs"
        >
          {conv.subject || conv.contact?.name || "Group"}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  );
}
