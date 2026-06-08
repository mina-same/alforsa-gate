import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUIContext, setSelectedEmailId as setSelectedEmailIdAction } from '@/contexts/UIContext';
import {
  Mail, Trash2, Archive, Reply, Forward,
  Paperclip, Download, FileText, FileImage,
  FileVideo, FileAudio, File, FileSpreadsheet,
  ArrowLeft, MailOpen, Pencil,
} from 'lucide-react';
import {
  useEmailMessages, useDeleteEmail, useMarkEmailAsRead,
  useUnreadEmails, useTrackEmailOpen,
} from '@/api/email/hooks';
import { useContact } from '@/api/contacts/hooks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Avatar from '@/components/shared/Avatar';
import EmailComposer from '@/components/email/EmailComposer';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmailAttachmentResponse } from '@/api/email/types';

export default function EmailInboxPage() {
  const { state: uiState, dispatch: uiDispatch } = useUIContext();
  const [searchParams] = useSearchParams();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'compose' | 'reply' | 'forward'>('compose');

  const selectedEmailId = uiState.email.selectedId;
  const setSelectedEmailId = (id: number | null) => uiDispatch(setSelectedEmailIdAction(id));

  const selectedChannelId =
    Number(searchParams.get('channel_id')) ||
    Number(localStorage.getItem('selectedEmailChannelId'));

  const { data } = useEmailMessages({ limit: 50, channel_id: selectedChannelId });
  const { mutate: deleteEmail } = useDeleteEmail();
  const { mutate: markAsRead } = useMarkEmailAsRead();
  const { data: unreadData } = useUnreadEmails();
  const { mutate: trackEmailOpen } = useTrackEmailOpen();

  const messages = data?.items || [];
  const selectedEmail = messages.find(m => m.id === selectedEmailId);
  const { data: contactData } = useContact(selectedEmail?.contact_id || 0);
  const avatarUrl = contactData?.avatar_url || undefined;

  const handleDelete = useCallback((id: number) => {
    deleteEmail(id, {
      onSuccess: () => {
        toast.success('Email deleted');
        if (selectedEmailId === id) setSelectedEmailId(null);
      },
      onError: () => toast.error('Failed to delete email'),
    });
  }, [deleteEmail, selectedEmailId]);

  const handleDownloadAttachment = useCallback((attachment: EmailAttachmentResponse) => {
    const url = attachment.file_url
      || `/api/v1/email/messages/${selectedEmail?.id}/attachments/${attachment.id}/download`;
    window.open(url, '_blank');
  }, [selectedEmail]);

  const handleArchive = useCallback(() => {
    toast.info('Archive coming soon');
  }, []);

  const handleMarkAsUnread = useCallback(() => {
    toast.info('Mark as unread coming soon');
  }, []);

  const getFileIcon = (contentType: string) => {
    if (contentType?.startsWith('image/')) return FileImage;
    if (contentType?.startsWith('video/')) return FileVideo;
    if (contentType?.startsWith('audio/')) return FileAudio;
    if (contentType?.includes('spreadsheet') || contentType?.includes('excel') || contentType?.includes('csv')) return FileSpreadsheet;
    if (contentType?.includes('pdf') || contentType?.includes('document') || contentType?.includes('word')) return FileText;
    return File;
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));

  const openComposer = (mode: 'compose' | 'reply' | 'forward') => {
    setComposerMode(mode);
    setIsComposerOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="flex h-full w-full bg-background overflow-hidden">
        <div className={cn(
          'flex-1 flex flex-col h-full transition-all duration-200',
          !selectedEmailId && 'hidden md:flex',
        )}>
          {selectedEmail ? (
            <>
              {/* ── Toolbar ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-4 h-13 py-2 border-b border-border/50 bg-background flex-shrink-0">
                {/* Left actions */}
                <div className="flex items-center gap-1">
                  {/* Back – mobile only */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden size-8 rounded-lg"
                        onClick={() => setSelectedEmailId(null)}
                      >
                        <ArrowLeft className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Back</TooltipContent>
                  </Tooltip>

                  <div className="flex items-center rounded-lg overflow-hidden border border-border/40">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-none border-r border-border/40 hover:bg-muted"
                          onClick={handleArchive}
                        >
                          <Archive className="size-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Archive</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-none border-r border-border/40 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                          onClick={() => handleDelete(selectedEmail.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-none hover:bg-muted"
                          onClick={handleMarkAsUnread}
                        >
                          <MailOpen className="size-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mark as unread</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium hidden sm:flex"
                    onClick={() => openComposer('reply')}
                  >
                    <Reply className="size-3.5" />
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium hidden sm:flex"
                    onClick={() => openComposer('forward')}
                  >
                    <Forward className="size-3.5" />
                    Forward
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium"
                    onClick={() => openComposer('compose')}
                  >
                    <Pencil className="size-3.5" />
                    Compose
                  </Button>
                </div>
              </div>

              {/* ── Email reading pane ───────────────────────────────────── */}
              <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto px-6 py-8 w-full">

                  {/* Subject */}
                  <h1 className="text-[22px] font-semibold text-foreground leading-snug mb-5">
                    {selectedEmail.subject || '(No subject)'}
                  </h1>

                  {/* Sender card */}
                  <div className="flex items-start gap-3 mb-6 pb-5 border-b border-border/50">
                    <Avatar
                      name={selectedEmail.from_addr}
                      src={avatarUrl}
                      size="md"
                      className="size-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-0.5">
                        <div>
                          <span className="text-sm font-semibold text-foreground">
                            {selectedEmail.from_addr.split('@')[0]}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1.5">
                            &lt;{selectedEmail.from_addr}&gt;
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 mt-0.5">
                          {formatDate(selectedEmail.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        To: <span className="text-foreground/70">{selectedEmail.to}</span>
                        {selectedEmail.cc && (
                          <span className="ml-2">Cc: <span className="text-foreground/70">{selectedEmail.cc}</span></span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="mb-8">
                    {selectedEmail.body_html ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-a:text-primary prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                      />
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedEmail.body_text || 'No content available.'}
                      </p>
                    )}
                  </div>

                  {/* Attachments */}
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="mb-8 p-4 rounded-xl bg-muted/40 border border-border/40">
                      <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Paperclip className="size-3.5" />
                        {selectedEmail.attachments.length} attachment{selectedEmail.attachments.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.attachments.map(attachment => {
                          const FileIcon = getFileIcon(attachment.content_type);
                          return (
                            <button
                              key={attachment.id}
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-background border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
                            >
                              <FileIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate max-w-[140px]">{attachment.filename}</p>
                                <p className="text-[10px] text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <Download className="size-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reply / Forward */}
                  <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 font-medium"
                      onClick={() => openComposer('reply')}
                    >
                      <Reply className="size-4" />
                      Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-2 font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => openComposer('forward')}
                    >
                      <Forward className="size-4" />
                      Forward
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            /* ── Empty state ──────────────────────────────────────────── */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Mail className="size-7 text-muted-foreground/40" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                No email selected
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[220px]">
                Select an email from the sidebar to start reading
              </p>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => openComposer('compose')}
              >
                <Pencil className="size-3.5" />
                Compose Email
              </Button>
            </div>
          )}
        </div>

        {/* ── Composer overlay ──────────────────────────────────────────── */}
        {isComposerOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:p-6 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-250">
              <EmailComposer
                mode={composerMode}
                initialData={
                  composerMode !== 'compose' && selectedEmail
                    ? {
                        channel_id: selectedChannelId,
                        to: composerMode === 'reply' ? selectedEmail.from_addr : '',
                        subject: composerMode === 'reply'
                          ? `Re: ${selectedEmail.subject}`
                          : `Fwd: ${selectedEmail.subject}`,
                        body_text: composerMode === 'reply'
                          ? `\n\n--- ${selectedEmail.from_addr} wrote ---\n\n${selectedEmail.body_text}`
                          : selectedEmail.body_text || '',
                      }
                    : { channel_id: selectedChannelId }
                }
                onClose={() => setIsComposerOpen(false)}
                message_id={selectedEmail?.id}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
