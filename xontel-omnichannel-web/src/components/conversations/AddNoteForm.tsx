"use client";

import React, { useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, MessageSquare } from "lucide-react";
import { ConversationNoteCreate } from "@/api/conversations/types";
import { useUsers, useUsersByIds } from "@/api/users/hooks";
import { useInboxMembers } from "@/api/inboxes/hooks";
import { UserResponse } from "@/api/users/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Mention extends UserResponse {
  startIndex: number;
  endIndex: number;
}

interface AddNoteFormProps {
  onSubmit: (data: ConversationNoteCreate) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  inboxId?: number;
  conversationType?: string;
  participantUserIds?: number[];
  currentUserId?: number;
}

export default function AddNoteForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder = "Add a note about this conversation...",
  inboxId,
  conversationType,
  participantUserIds,
  currentUserId,
}: AddNoteFormProps) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null); // Add this line!
  const { t } = useTranslation('chat');

  const isGroupConv = conversationType === "group";
  const isDirectConv = conversationType === "direct";
  const isParticipantScoped = isGroupConv || isDirectConv;

  // Fetch users — scoped to participants for group/direct, inbox members or all otherwise
  const { data: participantUsersData = [] } = useUsersByIds(
    isParticipantScoped ? (participantUserIds || []) : []
  );
  const { data: inboxMembersData } = useInboxMembers(
    !isParticipantScoped ? (inboxId ?? 0) : 0
  );
  const inboxMembers = inboxMembersData?.items || [];
  const { data: allUsersData } = useUsers();
  const allUsers = allUsersData?.users || [];

  const mentionUsers = useMemo(() => {
    if (isGroupConv) return participantUsersData;
    if (isDirectConv) return participantUsersData.filter((u) => u.id !== currentUserId);
    return inboxId ? inboxMembers : allUsers;
  }, [isGroupConv, isDirectConv, participantUsersData, currentUserId, inboxId, inboxMembers, allUsers]);

  const filteredUsers = useMemo(() => {
    if (!showMentions) return [];
    return mentionUsers
      .filter(
        (u) =>
          u.full_name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(mentionQuery.toLowerCase()),
      )
      .slice(0, 8);
  }, [mentionQuery, mentionUsers, showMentions]);

  // --- FIX: Highlighting Logic ---
  const highlightedNodes = useMemo(() => {
    const parts: React.ReactNode[] = [];

    // Confirmed mention names
    const mentionNames = Array.from(new Set(mentions.map((m) => m.full_name))).filter(Boolean);

    // Create a regex that matches either:
    // 1. A confirmed mention (e.g., @Agent One)
    // 2. A potential mention being typed (e.g., @Agent)
    // We sort confirmed names by length descending to match longer names first
    const escapedNames = mentionNames
      .map(name => name!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length);

    // Combined regex: Confirmed names OR potential mentions (starting with @)
    const combinedPattern = escapedNames.length > 0
      ? `@(${escapedNames.join("|")})|(@[\\w.]+)`
      : `@[\\w.]+`;

    const regex = new RegExp(combinedPattern, "g");

    let lastIdx = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the mention
      parts.push(content.substring(lastIdx, match.index));

      // Add the highlighted mention
      parts.push(
        <span key={match.index} className="text-blue-500 font-medium">
          {match[0]}
        </span>,
      );
      lastIdx = regex.lastIndex;
    }

    // Add remaining text
    parts.push(content.substring(lastIdx));

    // Handle the trailing newline issue common in textarea overlays
    if (content.endsWith("\n")) parts.push(" ");

    return parts;
  }, [content, mentions]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart ?? 0;
    setContent(val);

    // Sync mentions: remove those no longer in text
    setMentions((prev) => {
      // Keep mentions whose full name is still present in the text after an @
      const updated = prev.filter((m) => val.includes(`@${m.full_name}`));

      // Also check for exact name matches that aren't in the list yet
      // This regex looks for @ followed by words and spaces, but we only 
      // accept it if it matches a user in mentionUsers
      const mentionRegex = /@([\w\s.]+)/g;
      let match;
      const discovered: Mention[] = [];

      while ((match = mentionRegex.exec(val)) !== null) {
        const potentialName = match[1].trim();
        // Check if any part of the matched text corresponds to a user
        // We check from longest possible name to shortest to handle spaces
        const matchedUser = mentionUsers.find(
          (u) =>
            u.full_name &&
            (potentialName === u.full_name || potentialName.startsWith(u.full_name + " "))
        );

        if (matchedUser && !updated.find(m => m.id === matchedUser.id)) {
          // If we find a user, we only add if not already present
          // We don't need accurate startIndex/endIndex for UI highlighting now
          // since we use names, but we'll store them just in case
          discovered.push({
            ...matchedUser,
            startIndex: match.index,
            endIndex: match.index + matchedUser.full_name!.length + 1
          });
        }
      }

      return [...updated, ...discovered];
    });

    const lastAt = val.lastIndexOf("@", cursor - 1);
    if (lastAt === -1) {
      setShowMentions(false);
      return;
    }

    const textAfterAt = val.slice(lastAt + 1, cursor);

    // Trigger if @ is at start or preceded by space
    const isAtStart = lastAt === 0 || /\s/.test(val[lastAt - 1]);
    const noSpaceAfterAt = !/\s/.test(textAfterAt) || textAfterAt.includes(" ");
    // Allow spaces in mention query to support searching by full name

    if (isAtStart && !textAfterAt.includes("\n")) {
      setShowMentions(true);
      setMentionStart(lastAt);
      setMentionQuery(textAfterAt);
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectUser = (user: UserResponse) => {
    if (mentionStart === null || !textareaRef.current) return;

    const before = content.slice(0, mentionStart);
    const after = content.slice(textareaRef.current.selectionStart);
    const insertedText = `@${user.full_name} `;
    const newContent = before + insertedText + after;

    setContent(newContent);
    setMentions([
      ...mentions,
      {
        ...user,
        startIndex: mentionStart,
        endIndex: mentionStart + insertedText.length,
      },
    ]);
    setShowMentions(false);

    // Focus back and move cursor
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = mentionStart + insertedText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex(
          (prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length,
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleSelectUser(filteredUsers[selectedMentionIndex]);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    onSubmit({
      content: content.trim(),
      mentions: mentions.map((m) => m.id),
    });
    setContent("");
    setMentions([]);
  };

  return (
    <div className="bg-xon-surface-container rounded-lg border border-xon-surface-outline overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-xon-surface-outline bg-xon-surface-container/50">
        <div className="flex items-center gap-2">
          {/* <div className="flex items-center justify-center w-6 h-6 rounded-full bg-xon-primary text-xon-primary-on"> */}
          <MessageSquare className="h-3.5 w-3.5" />
          {/* </div> */}
          <h3 className="font-medium text-sm text-xon-text-primary">
            {t('conversations.notes.add_note')}
          </h3>
        </div>
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3">
        <div className="relative rounded-xl border border-xon-surface-outline bg-xon-surface ... ">
          {/* Highlighting Layer (The Display) */}
          <div
            ref={highlightRef}
            aria-hidden="true"
            className="absolute inset-0 w-full min-h-[120px] px-4 py-3 pointer-events-none  break-words text-sm leading-relaxed text-xon-text-primary"
            style={{ fontFamily: "inherit" }} // Force same font
          >
            {highlightedNodes}
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            spellCheck={false}
            rows={4}
            className="relative overflow-auto z-10 w-full max-h-[120px] px-4 py-3 rounded-xl bg-transparent resize-none text-sm leading-relaxed focus:outline-none break-words"
            style={{
              fontFamily: "inherit",
              color: "transparent", // Hide the real text
              caretColor: "#111827", // But keep the cursor visible (use your primary text color hex)
            }}
          />

          {/* Dropdown */}
          {showMentions && filteredUsers.length > 0 && (
            <div className="absolute left-0 top-full mt-1 z-[9999] w-full max-h-[200px] overflow-y-scroll rounded-xl border border-xon-surface-outline bg-white shadow-2xl overflow-hidden">
              {filteredUsers.map((user, idx) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`flex items-center gap-2 p-2 cursor-pointer transition-colors ${idx === selectedMentionIndex
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {user.full_name}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-xon-text-secondary">
            {t('conversations.notes.press')}{" "}
            <kbd className="px-1.5 py-0.5 bg-xon-surface rounded border text-[10px]">
              Ctrl+Enter
            </kbd>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting}
              className="bg-xon-primary"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> {t('conversations.notes.add_note')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
