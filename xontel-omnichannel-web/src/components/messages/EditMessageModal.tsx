import React, { useState, useRef, useEffect } from "react";
import { X, Check, Edit } from "lucide-react";
import { createPortal } from "react-dom";
import { useConversationItems } from "@/api/conversations/hooks";
import { useAuthUser } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Message } from "@/types/chat";
import { useMentionSuggestionsState } from "./input/hooks/useMentionSuggestionsState";
import MentionSuggestionsDropdown from "./input/MentionSuggestionsDropdown";

interface EditMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newContent: string) => void;
  message: Message;
  isInternalConversation?: boolean;
}

export default function EditMessageDialog({
  isOpen,
  onClose,
  onConfirm,
  message,
  isInternalConversation = false,
}: EditMessageDialogProps) {
  const [editedText, setEditedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionTriggerIndexRef = useRef<number>(-1);

  const [searchParams] = useSearchParams();
  const currentConversationId = searchParams.get('conversation');
  const currentUserId = useAuthUser().id as number | undefined;
  const allConversations = useConversationItems();
  const currentConversation = allConversations.find(
    (c) =>
      c.conversation_uuid === currentConversationId ||
      String(c.id) === currentConversationId,
  );

  const convType = currentConversation?.conversation_type;
  // Mentions are available in internal conversations AND in any group/direct conversation
  // (group/direct always use participantUserIds so they don't need the inbox check).
  const canUseMentions =
    isInternalConversation || convType === "group" || convType === "direct";

  const mentionSuggestions = useMentionSuggestionsState({
    isInternalConversation: canUseMentions,
    conversationType: convType,
    inboxId: currentConversation?.inbox_id,
    participantUserIds: currentConversation?.user_ids,
    currentUserId: currentUserId != null ? Number(currentUserId) : undefined,
  });

  // Resolve the currently displayed text (editedMessage if already edited, else original)
  const currentDisplayedText = (() => {
    const a = message?.additional_attributes;
    if (!a) return message?.text ?? "";
    const parsed = typeof a === "string" ? (() => { try { return JSON.parse(a); } catch { return {}; } })() : (a as Record<string, any>);
    return (parsed?.isEdited && parsed?.editedMessage) ? String(parsed.editedMessage) : (message?.text ?? "");
  })();

  // Reset text when message changes
  useEffect(() => {
    if (message) {
      setEditedText(currentDisplayedText);
      mentionTriggerIndexRef.current = -1;
      mentionSuggestions.setShowMentionSuggestions(false);
    }
  }, [message.id]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [editedText]);

  const handleConfirm = () => {
    if (editedText.trim() && editedText.trim() !== currentDisplayedText) {
      onConfirm(editedText.trim());
      onClose();
    }
  };

  const selectMention = (user: any) => {
    const label = `@${user.full_name || user.email || user.id}⁣`;
    const triggerIdx = mentionTriggerIndexRef.current;
    let newText: string;
    if (triggerIdx >= 0) {
      const atWord = editedText.slice(triggerIdx).match(/^@\S*/)?.[0] ?? "@";
      newText = editedText.slice(0, triggerIdx) + label + " " + editedText.slice(triggerIdx + atWord.length);
    } else {
      const words = editedText.split(/\s/);
      words.pop();
      newText = [...words, label].join(" ").trim() + " ";
    }
    mentionTriggerIndexRef.current = -1;
    setEditedText(newText);
    mentionSuggestions.setShowMentionSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart ?? value.length;
    setEditedText(value);

    const textBeforeCursor = value.slice(0, cursorPos);
    const lastWord = textBeforeCursor.match(/\S+$/)?.[0] ?? "";

    if (canUseMentions && lastWord.startsWith("@")) {
      mentionTriggerIndexRef.current = cursorPos - lastWord.length;
      mentionSuggestions.openWithQuery(lastWord.slice(1));
    } else {
      mentionTriggerIndexRef.current = -1;
      mentionSuggestions.setShowMentionSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionSuggestions.showMentionSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        mentionSuggestions.setMentionSelectedIndex((i) =>
          Math.min(i + 1, mentionSuggestions.filteredMentionUsers.length - 1),
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        mentionSuggestions.setMentionSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const user = mentionSuggestions.filteredMentionUsers[mentionSuggestions.mentionSelectedIndex];
        if (user) selectMention(user);
        return;
      }
      if (e.key === "Escape") {
        mentionSuggestions.setShowMentionSuggestions(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl dark:shadow-2xl max-w-lg w-full mx-4 border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              Edit Message
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Original Message Preview */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Original message
            </p>
            <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap overflow-auto max-h-40">
              {message.text}
            </div>
          </div>

          {/* Edit Input */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              Edit message
            </label>

            {/* Relative wrapper so the dropdown anchors above the textarea */}
            <div className="relative">
              <MentionSuggestionsDropdown
                isInternalConversation={canUseMentions}
                isOpen={mentionSuggestions.showMentionSuggestions}
                isLoading={mentionSuggestions.isMentionLoading}
                inboxId={currentConversation?.inbox_id}
                inboxMembersError={mentionSuggestions.inboxMembersError}
                inboxMembersCount={mentionSuggestions.inboxMembersCount}
                users={mentionSuggestions.filteredMentionUsers}
                selectedIndex={mentionSuggestions.mentionSelectedIndex}
                onSelect={selectMention}
              />
              <textarea
                ref={textareaRef}
                value={editedText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Edit your message..."
                className="w-full min-h-[80px] max-h-[200px] px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                rows={3}
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!editedText.trim() || editedText.trim() === currentDisplayedText}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all text-sm font-semibold text-white"
          >
            <Check className="w-4 h-4 inline mr-1" />
            Update
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
