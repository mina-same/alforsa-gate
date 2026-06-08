import { ChevronRight, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useSearchParams } from 'react-router-dom'
import { useUIDispatch, setActiveInboxId, setSidebarView, setCallsTab } from '@/contexts/UIContext'
import { getChannelIcon, getChannelLabel } from "@/utils/channelUtils"
import { useChannel } from "@/api/channels/hooks"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
export function NavMain({
  inbox,
}: {
  inbox: {
    id: number;
    name: string;
    channel_type: string;
    channel_id: number;
    channel?: {
      name: string;
      [key: string]: any;
    };
    [key: string]: any;
  }
}) {
  const { i18n, t } = useTranslation('chat')
  const isRTL = i18n.language === 'ar'
  const uiDispatch = useUIDispatch()
  const [, setSearchParams] = useSearchParams()

  const { data: channelData } = useChannel(inbox.channel_id);
  const ChannelIcon = getChannelIcon(inbox.channel_type);
  const channelDisplayName = channelData?.name || inbox.channel?.name || getChannelLabel(inbox.channel_type);

  const handleItemClick = (key: 'chat' | 'calls' | 'settings', inboxId: number) => {
    uiDispatch(setActiveInboxId(inboxId))
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.delete('conversation');
      return p;
    })
    if (key === 'calls') {
      uiDispatch(setSidebarView('calls'))
      uiDispatch(setCallsTab('all'))
    } else if (key === 'chat') {
      uiDispatch(setSidebarView('conversations'))
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{inbox.name}</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible key={inbox.id} asChild defaultOpen={true}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={channelDisplayName}>
              <Link
                to={`/?inbox_id=${inbox.id}`}
                className="transition-all duration-300"
                onClick={() => {
                  handleItemClick('chat', inbox.id)
                }}
              >
                <ChannelIcon className="size-4" />
                <span className="font-medium">{channelDisplayName}</span>
              </Link>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className={`transition-all duration-300 ${isRTL
                ? 'data-[state=open]:-rotate-90'
                : 'data-[state=open]:rotate-90'
                }`}>
                <ChevronRight className={isRTL ? 'rotate-180' : ''} />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {[
                  { key: 'chat' as const, label: t('sidebar.conversations'), url: '/' },
                  { key: 'calls' as const, label: t('sidebar.calls'), url: '/' },
                  { key: 'settings' as const, label: t('profile.settings'), url: '/settings' }
                ].map((subItem) => (
                  <SidebarMenuSubItem key={subItem.key}>
                    <SidebarMenuSubButton asChild>
                      <Link
                        to={
                          subItem.key === 'settings'
                            ? `/settings?inbox_id=${inbox.id}`
                            : `/?inbox_id=${inbox.id}`
                        }
                        className={`transition-all duration-300 ${isRTL ? 'text-right' : 'text-left'}`}
                        // onClick={() => handleItemClick(subItem.key, inbox.id)}
                        onClick={() => {
                          handleItemClick(subItem.key, inbox.id)
                        }}
                      >
                        <span>{subItem.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
