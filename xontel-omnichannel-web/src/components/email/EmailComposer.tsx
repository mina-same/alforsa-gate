import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Send,
  X,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Trash2,
  Users,
  Loader2,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  FileSpreadsheet,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Minimize2,
  Maximize2,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendEmail, useReplyToEmail, useForwardEmail, useEmailMessage } from '@/api/email/hooks';
import { EmailSendRequest, EmailAttachmentRequest } from '@/api/email/types';
import { useInfiniteContacts } from '@/api/contacts/hooks';
import { useUploadMedia } from '@/api/media/hooks';
import { MediaUploadResponse } from '@/api/media/types';
import { ContactResponse } from '@/api/contacts/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import Avatar from '@/components/shared/Avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface EmailComposerProps {
  mode?: 'compose' | 'reply' | 'forward';
  initialData?: Partial<EmailSendRequest>;
  onClose: () => void;
  message_id?: number;
}

interface AttachmentWithFile extends EmailAttachmentRequest {
  file?: File;
  uploadProgress?: number;
}

interface Recipient {
  email: string;
  name?: string;
  contactId?: number;
}

// ── Reusable recipient chip field (Cc / Bcc) ──────────────────────────────
interface SimpleRecipientFieldProps {
  label: string;
  recipients: Recipient[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: (email: string) => void;
  onRemove: (index: number) => void;
  onClose: () => void;
}

function SimpleRecipientField({
  label, recipients, inputValue, onInputChange, onAdd, onRemove, onClose,
}: SimpleRecipientFieldProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === ';' || e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) onAdd(inputValue.trim());
    }
    if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      onRemove(recipients.length - 1);
    }
  };

  return (
    <div className="flex items-start gap-2 py-2 border-b border-border/50">
      <span className="text-sm text-muted-foreground w-12 flex-shrink-0 pt-1.5">{label}</span>
      <div className="flex-1 flex flex-wrap items-center gap-1 min-w-0">
        {recipients.map((r, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-sm rounded-md max-w-full"
          >
            <span className="truncate max-w-[180px]">
              {r.name ? `${r.name} <${r.email}>` : r.email}
            </span>
            <button type="button" onClick={() => onRemove(i)} className="hover:text-destructive flex-shrink-0">
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm py-1"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputValue.trim()) onAdd(inputValue.trim()); }}
          placeholder={recipients.length === 0 ? `${label} recipients` : ''}
        />
      </div>
      <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-1.5">
        <X className="size-4" />
      </button>
    </div>
  );
}

// ── Main composer ─────────────────────────────────────────────────────────
export default function EmailComposer({ mode = 'compose', initialData, onClose, message_id }: EmailComposerProps) {
  const [recipients, setRecipients] = useState<Recipient[]>(
    initialData?.to ? initialData.to.split(',').filter(e => e.trim()).map(e => ({ email: e.trim() })) : []
  );
  const [inputValue, setInputValue] = useState('');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [attachments, setAttachments] = useState<AttachmentWithFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactIndex, setSelectedContactIndex] = useState(-1);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [cc, setCc] = useState<Recipient[]>([]);
  const [ccInputValue, setCcInputValue] = useState('');
  const [bcc, setBcc] = useState<Recipient[]>([]);
  const [bccInputValue, setBccInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(!initialData?.body_text);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toString = recipients.map(r => r.email).join(', ');

  const {
    data: contactsData,
    isLoading: isLoadingContacts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteContacts({ search: searchQuery, limit: 20 });

  const contacts = contactsData?.pages.flatMap(page =>
    page.contacts.filter(contact => contact.email)
  ) || [];

  // Set initial editor content for reply/forward
  useEffect(() => {
    if (editorRef.current && initialData?.body_text) {
      editorRef.current.innerText = initialData.body_text;
      setIsEditorEmpty(false);
    }
  }, []);

  // ── To field helpers ────────────────────────────────────────────────────
  const addRecipient = (email: string, name?: string, contactId?: number) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    if (recipients.some(r => r.email.toLowerCase() === trimmedEmail.toLowerCase())) return;
    setRecipients(prev => [...prev, { email: trimmedEmail, name, contactId }]);
    setInputValue('');
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedContactIndex(-1);
  };

  const removeRecipient = (index: number) => setRecipients(prev => prev.filter((_, i) => i !== index));

  const handleContactSelect = (contact: ContactResponse) => {
    addRecipient(contact.email || '', contact.name, contact.id);
    setSelectedContactId(contact.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedContactIndex(-1);
    setSelectedContactId(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && contacts.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedContactIndex(p => p < contacts.length - 1 ? p + 1 : p); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedContactIndex(p => p > 0 ? p - 1 : -1); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedContactIndex >= 0 && contacts[selectedContactIndex]) handleContactSelect(contacts[selectedContactIndex]);
        else if (inputValue.trim()) addRecipient(inputValue);
        return;
      }
      if (e.key === 'Escape') { setShowSuggestions(false); setSelectedContactIndex(-1); return; }
    }
    if (e.key === ',' || e.key === ';' || e.key === ' ') {
      e.preventDefault();
      if (inputValue.trim()) addRecipient(inputValue);
      return;
    }
    if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      removeRecipient(recipients.length - 1);
    }
  };

  // ── Cc/Bcc helpers ──────────────────────────────────────────────────────
  const addCcRecipient = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed || cc.some(r => r.email.toLowerCase() === trimmed.toLowerCase())) return;
    setCc(prev => [...prev, { email: trimmed }]);
    setCcInputValue('');
  };

  const addBccRecipient = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed || bcc.some(r => r.email.toLowerCase() === trimmed.toLowerCase())) return;
    setBcc(prev => [...prev, { email: trimmed }]);
    setBccInputValue('');
  };

  // ── Rich text formatting ────────────────────────────────────────────────
  const execFormat = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value ?? undefined);
  }, []);

  // ── API hooks ───────────────────────────────────────────────────────────
  const { data: originalMessage } = useEmailMessage(message_id || 0);
  const { mutate: sendEmail, isPending: isSending } = useSendEmail();
  const { mutate: replyEmail, isPending: isReplying } = useReplyToEmail();
  const { mutate: forwardEmail, isPending: isForwarding } = useForwardEmail();
  const { mutateAsync: uploadMedia } = useUploadMedia();

  const isPending = isSending || isReplying || isForwarding || uploadingFiles.size > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bodyHtml = editorRef.current?.innerHTML || '';
    const bodyText = editorRef.current?.innerText || '';

    const apiAttachments: EmailAttachmentRequest[] = attachments.map(att => ({
      filename: att.filename,
      content_type: att.content_type,
      file_url: att.file_url || null,
      content_base64: att.content_base64 || null,
    }));

    const data: EmailSendRequest = {
      channel_id: initialData?.channel_id || 0,
      to: toString,
      cc: cc.length > 0 ? cc.map(r => r.email) : null,
      bcc: bcc.length > 0 ? bcc.map(r => r.email) : null,
      subject,
      body_text: bodyText,
      body_html: bodyHtml,
      attachments: apiAttachments.length > 0 ? apiAttachments : null,
      contact_id: selectedContactId,
      conversation_id: originalMessage?.conversation_id || null,
    };

    if (mode === 'reply' && message_id) {
      replyEmail({ message_id, data }, { onSuccess: onClose });
    } else if (mode === 'forward' && message_id) {
      forwardEmail({ message_id, data }, { onSuccess: onClose });
    } else {
      sendEmail(data, { onSuccess: onClose });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      const uploadId = `${file.name}-${file.size}-${Date.now()}`;
      setUploadingFiles(prev => new Set(prev).add(uploadId));
      try {
        const response: MediaUploadResponse = await uploadMedia({ file, onProgress: () => {} });
        setAttachments(prev => [...prev, {
          filename: response.file_name || file.name,
          content_type: response.content_type || file.type || 'application/octet-stream',
          file_url: response.url,
          content_base64: null,
          file,
          uploadProgress: 100,
        }]);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadingFiles(prev => { const n = new Set(prev); n.delete(uploadId); return n; });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => setAttachments(attachments.filter((_, i) => i !== index));

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return FileImage;
    if (contentType.startsWith('video/')) return FileVideo;
    if (contentType.startsWith('audio/')) return FileAudio;
    if (contentType.includes('spreadsheet') || contentType.includes('excel') || contentType.includes('csv')) return FileSpreadsheet;
    if (contentType.includes('pdf') || contentType.includes('document') || contentType.includes('word')) return FileText;
    if (contentType.includes('code') || contentType.includes('json') || contentType.includes('xml') || contentType.includes('javascript')) return FileCode;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editorRef.current?.focus();
      document.execCommand('createLink', false, url);
    }
  };

  const containerClasses = cn(
    "flex flex-col bg-background shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300",
    isMaximized
      ? "fixed inset-4 z-50 rounded-xl"
      : isMinimized
        ? "fixed bottom-0 right-4 w-[400px] h-[60px] rounded-t-xl"
        : "max-w-3xl w-full mx-auto rounded-t-xl h-[600px] max-h-[90vh]"
  );

  // ── Minimized state ────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <div className={containerClasses}>
        <div
          className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              {mode === 'compose' ? 'New Message' : mode === 'reply' ? 'Reply' : 'Forward'}
            </h3>
            {recipients.length > 0 && (
              <span className="text-sm text-foreground truncate max-w-[200px]">
                — {recipients.map(r => r.email).join(', ')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-7 hover:bg-muted" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}>
              <Maximize2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onClose(); }}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={containerClasses}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-background">
          <h3 className="text-sm font-semibold text-foreground">
            {mode === 'compose' ? 'New Message' : mode === 'reply' ? 'Reply' : 'Forward'}
          </h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-7 hover:bg-muted" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7 hover:bg-muted hidden sm:flex" onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Recipients Section */}
          <div className="px-4 py-1">
            {/* To Field */}
            <div className="relative">
              <div className="flex items-start gap-2 py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground w-12 flex-shrink-0 pt-1.5">To</span>
                <div className="flex-1 flex flex-wrap items-center gap-1 min-w-0">
                  {recipients.map((recipient, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary text-sm rounded-md max-w-full"
                    >
                      <span className="truncate max-w-[200px]">
                        {recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}
                      </span>
                      <button type="button" onClick={() => removeRecipient(index)} className="hover:text-destructive flex-shrink-0">
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm py-1"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={recipients.length === 0 ? "Recipients" : ""}
                  />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!showCc && (
                    <button type="button" onClick={() => setShowCc(true)} className="text-xs text-primary hover:underline">
                      Cc
                    </button>
                  )}
                  {!showBcc && (
                    <>
                      <span className="text-muted-foreground">|</span>
                      <button type="button" onClick={() => setShowBcc(true)} className="text-xs text-primary hover:underline">
                        Bcc
                      </button>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 hover:bg-muted"
                    onClick={() => { setSearchQuery(''); setShowSuggestions(true); setSelectedContactIndex(-1); }}
                  >
                    <Users className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Contact Autocomplete */}
              {showSuggestions && contacts.length !== 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
                  <ScrollArea className="max-h-64">
                    <div className="p-2">
                      {isLoadingContacts && contacts.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-sm">Loading contacts...</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {contacts.slice(0, 8).map((contact, index) => (
                            <div
                              key={contact.id}
                              className={cn(
                                "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-sm transition-colors",
                                index === selectedContactIndex ? 'bg-primary/10' : 'hover:bg-muted'
                              )}
                              onClick={() => handleContactSelect(contact)}
                              onMouseEnter={() => setSelectedContactIndex(index)}
                            >
                              <Avatar name={contact.name} src={contact.avatar_url} size="sm" className="size-8 rounded-full" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{contact.name}</div>
                                <div className="text-muted-foreground text-xs truncate">{contact.email}</div>
                              </div>
                            </div>
                          ))}
                          {hasNextPage && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.preventDefault(); fetchNextPage(); }}
                              disabled={isFetchingNextPage}
                              className="w-full text-xs h-8"
                            >
                              {isFetchingNextPage ? 'Loading...' : 'Load more'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Cc Field */}
            {showCc && (
              <SimpleRecipientField
                label="Cc"
                recipients={cc}
                inputValue={ccInputValue}
                onInputChange={setCcInputValue}
                onAdd={addCcRecipient}
                onRemove={(i) => setCc(prev => prev.filter((_, idx) => idx !== i))}
                onClose={() => { setShowCc(false); setCc([]); setCcInputValue(''); }}
              />
            )}

            {/* Bcc Field */}
            {showBcc && (
              <SimpleRecipientField
                label="Bcc"
                recipients={bcc}
                inputValue={bccInputValue}
                onInputChange={setBccInputValue}
                onAdd={addBccRecipient}
                onRemove={(i) => setBcc(prev => prev.filter((_, idx) => idx !== i))}
                onClose={() => { setShowBcc(false); setBcc([]); setBccInputValue(''); }}
              />
            )}

            {/* Subject Field */}
            <div className="flex items-center gap-2 py-2 border-b border-border/50">
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-sm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
              />
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-0 px-3 py-1 border-b border-border/40 bg-muted/20">
            {/* Text style group */}
            <div className="flex items-center rounded-md overflow-hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={() => execFormat('bold')}>
                    <Bold className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={() => execFormat('italic')}>
                    <Italic className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={() => execFormat('underline')}>
                    <Underline className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Underline</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-4 mx-1.5" />

            {/* Align group */}
            <div className="flex items-center rounded-md overflow-hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={() => execFormat('justifyLeft')}>
                    <AlignLeft className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align left</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={() => execFormat('justifyCenter')}>
                    <AlignCenter className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Center</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={() => execFormat('justifyRight')}>
                    <AlignRight className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align right</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-4 mx-1.5" />

            {/* List + link group */}
            <div className="flex items-center rounded-md overflow-hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={() => execFormat('insertUnorderedList')}>
                    <List className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet list</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={() => execFormat('insertOrderedList')}>
                    <ListOrdered className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered list</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-7 rounded-none hover:bg-muted" onClick={insertLink}>
                    <Link className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert link</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Message Body — contenteditable for real formatting */}
          <div className="flex-1 overflow-hidden p-4">
            <div className="relative h-full">
              {isEditorEmpty && (
                <span className="absolute top-0 left-0 text-sm text-muted-foreground/50 pointer-events-none select-none">
                  Write your message here...
                </span>
              )}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => setIsEditorEmpty(!editorRef.current?.innerText?.trim())}
                className="w-full h-full bg-transparent outline-none text-sm leading-relaxed focus:outline-none overflow-auto"
              />
            </div>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-4 py-2 border-t border-border/50">
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, i) => {
                  const FileIcon = getFileIcon(att.content_type);
                  const fileSize = att.file?.size || 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-muted/50 hover:bg-muted px-3 py-2 rounded-lg text-sm group transition-colors"
                    >
                      <FileIcon className="size-4 text-muted-foreground" />
                      <span className="truncate max-w-[120px]">{att.filename}</span>
                      <span className="text-muted-foreground text-xs">({formatFileSize(fileSize)})</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t bg-background">
            <div className="flex items-center gap-1.5">
              <Button
                type="submit"
                disabled={isPending || recipients.length === 0 || !subject}
                className="h-8 gap-2 px-4 font-medium text-sm"
              >
                {isPending ? (
                  <><Loader2 className="size-3.5 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="size-3.5" /> Send</>
                )}
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 hover:bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFiles.size > 0}
                  >
                    {uploadingFiles.size > 0 ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files</TooltipContent>
              </Tooltip>

              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="*/*"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-8 hover:bg-muted"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            editorRef.current?.focus();
                            document.execCommand('insertImage', false, ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <ImageIcon className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert image</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-8 hover:bg-muted">
                    <Smile className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert emoji</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  onClick={onClose}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discard</TooltipContent>
            </Tooltip>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}
