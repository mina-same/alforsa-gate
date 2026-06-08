import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUIContext, setSelectedEmailId, setEmailCategory } from '@/contexts/UIContext';
import { useEmailMessages, useDeleteEmail, useMarkEmailAsRead, useUnreadEmails, useTrackEmailOpen } from '@/api/email/hooks';
import { EmailMessageResponse } from '@/api/email/types';
import { Mail, Search, Trash2, RefreshCw, Paperclip, X, Archive, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import Avatar from '@/components/shared/Avatar';

interface EmailSidebarProps {
  channelId?: number;
}

export default function EmailSidebar({ channelId }: EmailSidebarProps) {
  const { t } = useTranslation('chat');
  const { state: uiState, dispatch: uiDispatch } = useUIContext();
  const [searchParams] = useSearchParams();
  const selectedEmailId = uiState.email.selectedId;
  const activeCategory = uiState.email.activeCategory;
  const [searchQuery, setSearchQuery] = useState('');

  const resolvedChannelId = channelId
    || Number(searchParams.get('channel_id'))
    || Number(localStorage.getItem('selectedEmailChannelId'))
    || undefined;

  const { data, isLoading, refetch } = useEmailMessages({
    limit: 50,
    ...(resolvedChannelId ? { channel_id: resolvedChannelId } : {}),
  });
  const { mutate: deleteEmail } = useDeleteEmail();
  const { mutate: markAsRead } = useMarkEmailAsRead();
  const { data: unreadData } = useUnreadEmails();
  const { mutate: trackEmailOpen } = useTrackEmailOpen();

  const allMessages = data?.items || [];
  const unreadMessages = unreadData?.items || [];
  const unreadCount = unreadData?.total || 0;
  const inboxUnread = allMessages.filter(m => !m.is_archived && !m.is_read).length;

  const categoryMessages = activeCategory === 'unread'
    ? unreadMessages
    : allMessages.filter(m => !m.is_archived);

  const messages = searchQuery.trim()
    ? categoryMessages.filter(email => {
        const q = searchQuery.toLowerCase();
        return (
          email.subject?.toLowerCase().includes(q) ||
          email.from_addr?.toLowerCase().includes(q) ||
          email.body_text?.toLowerCase().includes(q)
        );
      })
    : categoryMessages;

  const handleSelectEmail = (email: EmailMessageResponse) => {
    uiDispatch(setSelectedEmailId(email.id));
    if (!email.is_read) markAsRead(email.id);
    trackEmailOpen(email.id);
  };

  const handleDelete = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteEmail(id, {
      onSuccess: () => {
        toast.success('Email deleted');
        if (selectedEmailId === id) uiDispatch(setSelectedEmailId(null));
      },
      onError: () => toast.error('Failed to delete'),
    });
  }, [deleteEmail, selectedEmailId, uiDispatch]);

  const handleMarkAsRead = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id, { onSuccess: () => toast.success('Marked as read') });
  }, [markAsRead]);

  const handleArchive = useCallback((_id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Archive coming soon');
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diffDays === 0) return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
    if (diffDays < 7) return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
  };

  const categories = [
    { id: 'inbox' as const, label: t('email.inbox'), count: inboxUnread },
    { id: 'unread' as const, label: t('email.unread'), count: unreadCount },
  ];

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden select-none">

        {/* Search + Refresh */}
        <div className="px-3 pt-3 pb-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
            <input
              type="text"
              placeholder={t('email.search_placeholder') || 'Search emails…'}
              className="w-full pl-8 pr-7 h-8 text-xs bg-muted/60 rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg hover:bg-muted flex-shrink-0"
                onClick={() => refetch()}
              >
                <RefreshCw className={cn('size-3.5 text-muted-foreground', isLoading && 'animate-spin')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Refresh</TooltipContent>
          </Tooltip>
        </div>

        {/* Category tabs */}
        <div className="px-3 pb-2">
          <div className="flex bg-muted/60 rounded-lg p-0.5 gap-0.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => uiDispatch(setEmailCategory(cat.id))}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150',
                  activeCategory === cat.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 rounded-full leading-4',
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  )}>
                    {cat.count > 99 ? '99+' : cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search hint */}
        {searchQuery && (
          <div className="px-3 pb-1">
            <p className="text-[11px] text-muted-foreground/60">
              {messages.length === 0 ? `No results for "${searchQuery}"` : `${messages.length} result${messages.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

        {/* Message list */}
        <ScrollArea className="flex-1">
          <div className="px-2 pb-2 flex flex-col">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg">
                  <Skeleton className="size-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-0.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-3/4" />
                  </div>
                </div>
              ))
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Mail className="size-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {searchQuery ? 'No results' : t('email.empty_inbox')}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {searchQuery ? `Nothing matched "${searchQuery}"` : 'Your inbox is empty'}
                </p>
              </div>
            ) : (
              messages.map(email => {
                const isSelected = selectedEmailId === email.id;
                const hasAttachments = !!email.attachments?.length;
                return (
                  <button
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={cn(
                      'group relative flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg transition-all duration-150 text-left w-full',
                      isSelected
                        ? 'bg-primary/8 ring-1 ring-primary/20'
                        : 'hover:bg-muted/60'
                    )}
                  >
                    {/* Unread dot */}
                    {!email.is_read && (
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 size-1.5 bg-primary rounded-full" />
                    )}

                    <Avatar
                      name={email.from_addr}
                      size="sm"
                      className="size-8 rounded-full flex-shrink-0 mt-0.5"
                    />

                    <div className="flex-1 min-w-0 group-hover:pr-[72px] transition-all duration-150">
                      {/* Sender + date */}
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={cn(
                          'text-xs truncate',
                          !email.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'
                        )}>
                          {email.from_addr.split('@')[0]}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
                          {formatDate(email.created_at)}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className="flex items-center gap-1.5">
                        <p className={cn(
                          'text-xs truncate flex-1',
                          !email.is_read ? 'font-medium text-foreground' : 'text-muted-foreground/80'
                        )}>
                          {email.subject || '(no subject)'}
                        </p>
                        {hasAttachments && (
                          <Paperclip className="size-3 text-muted-foreground/40 flex-shrink-0" />
                        )}
                      </div>

                      {/* Preview */}
                      <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">
                        {email.body_text || t('email.no_content')}
                      </p>
                    </div>

                    {/* Hover actions */}
                    <div className="hidden sm:flex absolute right-1.5 top-1/2 -translate-y-1/2 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-background/90 backdrop-blur-sm rounded-md shadow-sm border border-border/30 overflow-hidden">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-none hover:bg-muted"
                            onClick={e => handleArchive(email.id, e)}
                          >
                            <Archive className="size-3.5 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[11px]">Archive</TooltipContent>
                      </Tooltip>

                      {!email.is_read && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-none hover:bg-muted"
                              onClick={e => handleMarkAsRead(email.id, e)}
                            >
                              <MailOpen className="size-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-[11px]">Mark read</TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-none hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                            onClick={e => handleDelete(email.id, e)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[11px]">Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
