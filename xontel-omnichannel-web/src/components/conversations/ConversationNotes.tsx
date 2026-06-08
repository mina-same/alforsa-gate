import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Plus, StickyNote, ChevronDown, ChevronUp, X } from 'lucide-react';
import { ConversationNote, ConversationNoteCreate } from '@/api/conversations/types';
import { useNotes, useCreateNote, useDeleteNote } from '@/api/conversations/hooks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoteItem from './NoteItem';
import AddNoteForm from './AddNoteForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { useAuthUser } from '@/contexts/AuthContext';

interface ConversationNotesProps {
  conversationId: number;
  isNotesOpen: boolean;
  setIsNotesOpen: (open: boolean) => void;
  inboxId?: number;
  conversationType?: string;
  participantUserIds?: number[];
  canAddNotes?: boolean;
  canDeleteNotes?: boolean;
  canEditNotes?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function ConversationNotes({
  conversationId,
  isNotesOpen,
  setIsNotesOpen,
  inboxId,
  conversationType,
  participantUserIds,
  canAddNotes = true,
  canDeleteNotes = false,
  canEditNotes = false,
  isOpen = true,
  onClose,
  className = '',
}: ConversationNotesProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const currentUserId = useAuthUser().id;
  const { data: notes = [], isLoading, error } = useNotes(conversationId);
  const { mutate: createNote, isPending: isCreatingNote } = useCreateNote();
  const { mutate: deleteNote, isPending: isDeletingNote } = useDeleteNote();
  const { t } = useTranslation('chat');

  const handleAddNote = (data: ConversationNoteCreate) => {
    createNote(
      { conversationId, data },
      {
        onSuccess: () => {
          setIsAddingNote(false);
        },
      }
    );
  };

  const handleDeleteNote = (noteId: number) => {
    setNoteToDelete(noteId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleCancelAdd = () => {
    setIsAddingNote(false);
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (error) {
    return (
      <div className={`bg-xon-surface-container border border-xon-surface-outline p-4 ${className}`}>
        <div className="flex items-center gap-2 text-xon-text-red">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">{t('conversations.notes.failed')}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 z-30 w-full sm:relative sm:z-20 sm:w-full sm:bg-[--xon-conversation-bg] sm:border-l sm:h-full sm:inset-auto flex flex-col duration-300 shadow-2xl border-border bg-[--xon-conversation-bg] transition-all ease-in-out ${isOpen
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0 pointer-events-none sm:translate-x-0 sm:opacity-100 sm:pointer-events-auto'
        } ${className}`}
    >
      {/* Header */}
      <div className="h-16 py-4 px-4 border-b border-border/50 flex items-center justify-between text-base font-semibold bg-[var(--xon-color-surface-container)]">
        <div className="flex items-center gap-3">

          <div>
            <h6 className="font-semibold text-foreground">{t('conversations.notes.title')}</h6>
            <p className="text-xs text-muted-foreground">
              {notes.length === 1 ? t('conversations.notes.note_count', { count: notes.length }) : t('conversations.notes.notes_count', { count: notes.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canAddNotes && !isAddingNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingNote(true)}
              className="text-xon-primary hover:bg-xon-surface-hover hover:text-xon-primary transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">{t('conversations.notes.add_note')}</span>
            </Button>
          )}

          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted/80 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="h-5 w-5 opacity-70" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted/80 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="h-5 w-5 opacity-70" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[var(--xon-color-surface-container)]">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {/* Add Note Form */}
          {isAddingNote && (
            <div className="mt-2 px-4 animate-in slide-in-from-top-2 duration-300">
              <AddNoteForm
                onSubmit={handleAddNote}
                onCancel={handleCancelAdd}
                isSubmitting={isCreatingNote}
                autoFocus={true}
                placeholder={t('conversations.notes.placeholder')}
                inboxId={inboxId}
                conversationType={conversationType}
                participantUserIds={participantUserIds}
                currentUserId={currentUserId}
              />
            </div>
          )}

          {/* Notes List */}
          <div className="px-4 ">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-xon-surface-outline"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
                </div>
                <span className="text-sm text-muted-foreground mt-4 animate-pulse">{t('conversations.notes.loading')}</span>
              </div>
            ) : sortedNotes.length === 0 && !isAddingNote ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
                <div className="relative mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                    <StickyNote className="h-8 w-8 text-xon-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-xon-surface-container rounded-full animate-ping"></div>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{t('conversations.notes.empty_title')}</h4>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                  {t('conversations.notes.empty_desc')}
                </p>
                {canAddNotes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingNote(true)}
                    className="border-xon-surface-outline text-xon-primary hover:bg-xon-surface-hover hover:text-xon-primary-foreground transition-all duration-200 hover:scale-105 shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('conversations.notes.add_first')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {sortedNotes.map((note, index) => (
                  <div
                    key={note.id}
                    className="animate-in slide-in-from-bottom-2 duration-300  "
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NoteItem
                      note={note}
                      onDelete={canDeleteNotes ? handleDeleteNote : undefined}
                      canDelete={canDeleteNotes && note.user_id === currentUserId}
                      canEdit={canEditNotes}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingNote}
      />
    </div>
  );
}
