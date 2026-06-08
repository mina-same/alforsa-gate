import React from "react";
import { useAuthUser } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Trash2, Edit3, User, Clock } from "lucide-react";
import { ConversationNote } from "@/api/conversations/types";
import { useUser, useUsersByIds } from "@/api/users/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useDateFormat } from "@/hooks/useDateFormat";
import NoteContent from "./NoteContent";

interface NoteItemProps {
  note: ConversationNote;
  onDelete?: (noteId: number) => void;
  canDelete?: boolean;
  canEdit?: boolean;
}

export default function NoteItem({
  note,
  onDelete,
  canDelete = false,
  canEdit = false,
}: NoteItemProps) {
    const { formatDate } = useDateFormat();
  const { t } = useTranslation('chat');

  const getMentionsIds = () => {
    try {
      const mentions = JSON.parse(note.mentions || "[]");
      return Array.isArray(mentions) ? mentions : [];
    } catch {
      return [];
    }
  };

  // Fetch note author
  const { data: author } = useUser(note.user_id);

  // Fetch mentioned users
  const mentionIds = getMentionsIds();
  const { data: mentionedUsers = [] } = useUsersByIds(mentionIds);

  const getAuthorName = () => {
    if (author?.full_name) {
      return author.full_name;
    }
    if (author?.email) {
      return author.email;
    }
    return `${t('conversations.notes.user_prefix')} ${note.user_id}`;
  };

  const getAuthorInitials = () => {
    const name = getAuthorName();
    return name
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  const getMentionedUsersList = () => {
    return mentionedUsers
      .map((user) => user.full_name || user.email || `User ${user.id}`)
      .join(", ");
  };
  const profileTimezone = useAuthUser().timezone || null;

  return (
    <div className="w-full group relative bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      {/* Header with author info and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative">
            <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/10">
              <AvatarImage src={author?.avatar_url} alt={getAuthorName()} />
              <AvatarFallback className="text-sm bg-primary text-primary-foreground font-semibold">
                {getAuthorInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {getAuthorName()}
              </h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                <User className="h-3 w-3" />
                <span>{t('conversations.notes.agent')}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDate(note.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
              onClick={() => onDelete?.(note.id)}
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Note content */}
      <div className="mb-4">
        <NoteContent content={note.content} mentionedUsers={mentionedUsers} />
      </div>

      {/* Mentions */}
      {mentionIds.length > 0 && (
        <div className="pt-4 border-t border-border/50 bg-muted/20 -mx-4 px-4 -mb-4 rounded-b-xl">
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                <User className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground">{t('conversations.notes.mentions')}</span>
              <span className="text-primary font-medium">
                {mentionIds.length === 1 ? t('conversations.notes.user_count', { count: mentionIds.length }) : t('conversations.notes.users_count', { count: mentionIds.length })}
              </span>
            </div>
            {getMentionedUsersList() && (
              <div className="text-muted-foreground bg-background/50 rounded-lg p-2 border border-border/30">
                {getMentionedUsersList()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
