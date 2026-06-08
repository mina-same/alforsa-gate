import React, { useState, useRef, useEffect, useMemo } from "react";

import {
  Smile,
  Send,
  Mic,
  Paperclip,
  Image,
  FileText,
  MapPin,
  Camera,
  Layout,
  Video,
  WandSparkles,
} from "lucide-react";

const SlashIcon = ({ className }: { className?: string }) => (
  <span className={className} style={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>/</span>
);

import EmojiPicker, { EmojiClickData, Theme, EmojiStyle } from "emoji-picker-react";
import { useTranslation } from "react-i18next";
import { Button } from "@components/ui/button";

import VoiceRecording from "./record/VoiceRecording";
import TemplateModal from "./templates/TemplateModal";

import ReplyBar from "./input/ReplyBar";
import UrlPreviewBar from "./input/UrlPreviewBar";
import MentionSuggestionsDropdown from "./input/MentionSuggestionsDropdown";
import CannedSuggestionsDropdown from "./input/CannedSuggestionsDropdown";
import EmojiSuggestionsDropdown from "./input/EmojiSuggestionsDropdown";
import ConversationSuggestionsDropdown from "./input/ConversationSuggestionsDropdown";

import { Message, OutgoingMessage } from "@/types/chat";
import { WhatsAppTemplate } from "@/types/template";
import { sendLocation } from "./location/sendLocation";
import LocationPermissionDialog from "./location/LocationPermissionDialog";
import { useIsMobile } from "@/hooks/use-mobile";

import { useTextInputState } from "./input/hooks/useTextInputState";
import { useEmojiPickerState } from "./input/hooks/useEmojiPickerState";
import { useAttachmentMenuState } from "./input/hooks/useAttachmentMenuState";
import { useUrlDetection } from "./input/hooks/useUrlDetection";
import { useDraftSaving } from "./input/hooks/useDraftSaving";
import { useEmojiSuggestionsState } from "./input/hooks/useEmojiSuggestionsState";
import { useCannedSuggestionsState } from "./input/hooks/useCannedSuggestionsState";
import { useMentionSuggestionsState } from "./input/hooks/useMentionSuggestionsState";
import { useConversationSuggestionsState } from "./input/hooks/useConversationSuggestionsState";
import { useKeyboardNavigation, type SuggestionNav } from "./input/hooks/useKeyboardNavigation";

interface MessageInputProps {
  onSend: (message: OutgoingMessage) => void;
  placeholder?: string;
  disabled?: boolean;
  replyingTo?: Message | null;
  onClearReply?: () => void;
  partnerName?: string;
  isInternalConversation?: boolean;
  inboxId?: number | null;
  conversationType?: string;
  participantUserIds?: number[];
  currentUserId?: number;
  openCamera: () => void;
  openDoc: () => void;
  openPhoto: () => void;
  openVideo: () => void;
  onPasteFiles?: (files: File[]) => void;
  conversationId?: string;
  onSaveDraft?: (conversationId: string, text: string) => void;
  initialText?: string;
}

export default function MessageInput({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  replyingTo,
  onClearReply,
  partnerName = "user",
  isInternalConversation = false,
  inboxId,
  conversationType,
  participantUserIds,
  currentUserId,
  openCamera,
  openDoc,
  openPhoto,
  openVideo,
  onPasteFiles,
  conversationId,
  onSaveDraft,
  initialText = "",
}: MessageInputProps) {
  // ── Simple local state ───────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  // Tracks whether the user has intentionally edited text so we don't overwrite
  // their input when drafts sync in from initialText.
  const hasUserEditedTextRef = useRef(false);
  const prevConversationIdRef = useRef<string | undefined>(conversationId);
  // Tracks the position of the triggering '@' so selectMention can replace the correct word.
  const mentionTriggerIndexRef = useRef<number>(-1);

  // ── Hooks ────────────────────────────────────────────────────────────────────
  const isMobile = useIsMobile();
  const { i18n, t } = useTranslation("chat");
  const isRTL = i18n.language === "ar";
  const isDarkMode = document.documentElement.classList.contains("dark");

  const {
    text, setText, isExpanded, setIsExpanded,
    aiCompletion, clearAiCompletion, acceptAiCompletion, scheduleAiCompletion,
    isCoarsePointer, textareaRef, resizeTextarea,
  } = useTextInputState(initialText);

  const { showPicker, setShowPicker, emojiData, isLoadingEmojis, emojiRef, mobileEmojiRef } =
    useEmojiPickerState(i18n.language);

  const { showAttachmentMenu, setShowAttachmentMenu, attachmentRef, mobileAttachmentRef } =
    useAttachmentMenuState();

  const { detectedUrl, setDetectedUrl, detectUrl } = useUrlDetection();

  const { scheduleSave, cancelAndClearDraft, updateLatestText } = useDraftSaving({
    conversationId,
    onSaveDraft,
  });

  const emojiSuggestions = useEmojiSuggestionsState(emojiData);
  const cannedSuggestions = useCannedSuggestionsState(textareaRef);

  const mentionSuggestions = useMentionSuggestionsState({
    isInternalConversation,
    conversationType,
    inboxId,
    participantUserIds,
    currentUserId,
  });

  const convSuggestions = useConversationSuggestionsState(conversationId);

  // ── Derived values ───────────────────────────────────────────────────────────
  const treatAsMobile = isMobile || isCoarsePointer;

  // Determines the text direction (rtl/ltr) of the textarea based on the first
  // strongly-directional character in the input, rather than relying solely on
  // the UI language. This lets users seamlessly type Arabic in an LTR UI and
  // Latin in an RTL UI without manually toggling direction.
  //
  // Strategy: scan characters one by one from the start of the trimmed text.
  // The first character that belongs to an Arabic Unicode block \u2192 rtl.
  // The first Latin letter \u2192 ltr. Neutral characters (digits, punctuation,
  // spaces) are skipped. If no strongly-directional character is found, fall
  // back to the current UI language direction.
  //
  // Unicode blocks covered by arabicCharRegex:
  //   \u0600\u2013\u06FF  Arabic (core block \u2014 letters, diacritics, digits)
  //   \u0750\u2013\u077F  Arabic Supplement (additional letters)
  //   \u08A0\u2013\u08FF  Arabic Extended-A (Quranic marks, rare letters)
  //   \uFB50\u2013\uFDFF  Arabic Presentation Forms-A (ligatures, contextual forms)
  //   \uFE70\u2013\uFEFF  Arabic Presentation Forms-B (more legacy presentation forms)
  const inputDir = useMemo<"rtl" | "ltr">(() => {
    const trimmed = (text || "").trim();
    if (!trimmed) return isRTL ? "rtl" : "ltr";
    const arabicCharRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const latinCharRegex = /[A-Za-z]/;
    for (const ch of trimmed) {
      if (arabicCharRegex.test(ch)) return "rtl";
      if (latinCharRegex.test(ch)) return "ltr";
    }
    return isRTL ? "rtl" : "ltr";
  }, [text, isRTL]);

  // ── Effects ──────────────────────────────────────────────────────────────────

  // Keep latestTextRef in sync for the beforeunload handler in useDraftSaving.
  useEffect(() => {
    updateLatestText(text);
  }, [text, updateLatestText]);

  // Reset state and sync draft when the active conversation changes.
  useEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      hasUserEditedTextRef.current = false;
      setText(initialText);
      detectUrl(initialText);
      clearAiCompletion();
      return;
    }
    if (!hasUserEditedTextRef.current) {
      setText(initialText);
      detectUrl(initialText);
    }
  }, [conversationId, initialText]);

  // Debug logging for internal mentions (only in dev).
  useEffect(() => {
    if (!isInternalConversation) return;
    if (!mentionSuggestions.showMentionSuggestions) return;
    console.log("🔎 Mention debug:", {
      inboxId,
      inboxMembersCount: mentionSuggestions.inboxMembersCount,
      inboxMembersError: mentionSuggestions.inboxMembersError,
    });
  }, [isInternalConversation, mentionSuggestions.showMentionSuggestions, inboxId,
    mentionSuggestions.inboxMembersCount, mentionSuggestions.inboxMembersError]);

  // ── Selection handlers (need text + setText so live in the parent) ───────────

  const selectMention = (user: any) => {
    const label = `@${user.full_name || user.email || user.id}⁣`;
    const triggerIdx = mentionTriggerIndexRef.current;
    let newText: string;
    if (triggerIdx >= 0) {
      const atWord = text.slice(triggerIdx).match(/^@\S*/)?.[0] ?? "@";
      newText = text.slice(0, triggerIdx) + label + " " + text.slice(triggerIdx + atWord.length);
    } else {
      const words = text.split(/\s/);
      words.pop();
      newText = [...words, label].join(" ").trim() + " ";
    }
    mentionTriggerIndexRef.current = -1;
    setText(newText);
    mentionSuggestions.setShowMentionSuggestions(false);
    textareaRef.current?.focus();
  };

  const selectCannedResponse = (content: string) => {
    const words = text.split(/\s/);
    words.pop();
    const newText = [...words, content].join(" ").trim() + " ";
    setText(newText);
    cannedSuggestions.setShowCannedSuggestions(false);
    textareaRef.current?.focus();
  };

  const selectEmoji = (emoji: string) => {
    const words = text.split(/\s/);
    words.pop();
    const newText = [...words, emoji].join(" ").trim() + " ";
    setText(newText);
    emojiSuggestions.close();
    textareaRef.current?.focus();
  };

  const selectConversationSuggestion = (suggestion: string) => {
    setText((prev) => prev + suggestion);
    convSuggestions.setShowConversationSuggestions(false);
    textareaRef.current?.focus();
  };

  // ── Send ─────────────────────────────────────────────────────────────────────

  const handleSendText = () => {
    if (
      !text.trim() ||
      cannedSuggestions.showCannedSuggestions ||
      mentionSuggestions.showMentionSuggestions ||
      convSuggestions.showConversationSuggestions
    ) return;

    onSend({ text, message_type: "text" });
    hasUserEditedTextRef.current = true;
    setText("");
    setDetectedUrl(null);
    clearAiCompletion();
    cancelAndClearDraft();

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.scrollTop = 0;
    }
    setIsExpanded(false);
  };

  // ── Input handler ────────────────────────────────────────────────────────────

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart ?? value.length;
    hasUserEditedTextRef.current = true;
    setText(value);
    detectUrl(value);
    scheduleSave(value);

    // Use the word immediately before the cursor so triggers work anywhere in the text.
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastWord = textBeforeCursor.match(/\S+$/)?.[0] ?? "";

    if (isInternalConversation && lastWord.startsWith("@")) {
      mentionTriggerIndexRef.current = cursorPos - lastWord.length;
      mentionSuggestions.openWithQuery(lastWord.slice(1));
      cannedSuggestions.setShowCannedSuggestions(false);
      emojiSuggestions.close();
      clearAiCompletion();
    } else if (lastWord.startsWith("/")) {
      cannedSuggestions.openWithQuery(lastWord.slice(1));
      mentionSuggestions.setShowMentionSuggestions(false);
      emojiSuggestions.close();
      clearAiCompletion();
    } else if (lastWord.startsWith(":")) {
      emojiSuggestions.openWithQuery(lastWord.slice(1));
      cannedSuggestions.setShowCannedSuggestions(false);
      mentionSuggestions.setShowMentionSuggestions(false);
      clearAiCompletion();
    } else {
      mentionTriggerIndexRef.current = -1;
      cannedSuggestions.setShowCannedSuggestions(false);
      emojiSuggestions.close();
      mentionSuggestions.setShowMentionSuggestions(false);
      scheduleAiCompletion(value);
    }
  };

  // ── Emoji picker click ───────────────────────────────────────────────────────

  const onEmojiClick = (emojiClickData: EmojiClickData) => {
    const newText = text + emojiClickData.emoji;
    hasUserEditedTextRef.current = true;
    setText(newText);
    detectUrl(newText);
    setTimeout(resizeTextarea, 0);
    scheduleSave(newText);
  };

  // ── Paste ────────────────────────────────────────────────────────────────────

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!onPasteFiles) return;
    const dt = e.clipboardData;
    if (!dt) return;
    const files = Array.from(dt.files || []);
    if (files.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    onPasteFiles(files);
  };

  // ── Location ─────────────────────────────────────────────────────────────────

  const handleLocationClick = async () => {
    try {
      await sendLocation(onSend);
    } catch (error: any) {
      if (error.code === 1) {
        setShowLocationDialog(true);
      } else {
        console.error("Location error:", error);
      }
    }
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────────

  const mentionNav: SuggestionNav = {
    isOpen: mentionSuggestions.showMentionSuggestions,
    count: mentionSuggestions.filteredMentionUsers.length,
    selectedIndex: mentionSuggestions.mentionSelectedIndex,
    setSelectedIndex: mentionSuggestions.setMentionSelectedIndex,
    selectAtIndex: (i) => {
      if (mentionSuggestions.filteredMentionUsers[i]) selectMention(mentionSuggestions.filteredMentionUsers[i]);
      else mentionSuggestions.setShowMentionSuggestions(false);
    },
    close: () => mentionSuggestions.setShowMentionSuggestions(false),
  };

  const cannedNav: SuggestionNav = {
    isOpen: cannedSuggestions.showCannedSuggestions,
    count: cannedSuggestions.cannedResponses.length,
    selectedIndex: cannedSuggestions.selectedIndex,
    setSelectedIndex: cannedSuggestions.setSelectedIndex,
    selectAtIndex: (i) => {
      if (cannedSuggestions.cannedResponses[i]) selectCannedResponse(cannedSuggestions.cannedResponses[i].content);
      else cannedSuggestions.setShowCannedSuggestions(false);
    },
    close: () => cannedSuggestions.setShowCannedSuggestions(false),
  };

  const emojiNav: SuggestionNav = {
    isOpen: emojiSuggestions.showEmojiSuggestions,
    count: emojiSuggestions.filteredEmojis.length,
    selectedIndex: emojiSuggestions.emojiSelectedIndex,
    setSelectedIndex: emojiSuggestions.setEmojiSelectedIndex,
    selectAtIndex: (i) => {
      if (emojiSuggestions.filteredEmojis[i]) selectEmoji(emojiSuggestions.filteredEmojis[i].emoji);
      else emojiSuggestions.close();
    },
    close: emojiSuggestions.close,
    arrowAxis: "horizontal",
  };

  const convNav: SuggestionNav = {
    isOpen: convSuggestions.showConversationSuggestions,
    count: convSuggestions.suggestions.length,
    selectedIndex: convSuggestions.selectedIndex,
    setSelectedIndex: convSuggestions.setSelectedIndex,
    selectAtIndex: (i) => {
      if (convSuggestions.suggestions[i]) selectConversationSuggestion(convSuggestions.suggestions[i]);
      else convSuggestions.setShowConversationSuggestions(false);
    },
    close: () => convSuggestions.setShowConversationSuggestions(false),
  };

  const handleKeyDown = useKeyboardNavigation({
    aiCompletion,
    acceptAiCompletion: () => acceptAiCompletion(() => { hasUserEditedTextRef.current = true; }),
    clearAiCompletion,
    suggestions: [mentionNav, cannedNav, emojiNav, convNav],
    treatAsMobile,
    handleSendText,
  });

  // ── Attachment options ───────────────────────────────────────────────────────

  const attachmentOptions = [
    {
      icon: Image,
      label: t("attachment_menu.photo_video"),
      color: "text-xon-purple",
      bg: "bg-xon-container-purple",
      callback: () => openPhoto(),
    },
    {
      icon: Camera,
      label: t("attachment_menu.camera"),
      color: "text-xon-red",
      bg: "bg-xon-container-red",
      callback: () => openCamera(),
    },
    {
      icon: Video,
      label: t("attachment_menu.video"),
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      callback: () => openVideo(),
    },
    {
      icon: FileText,
      label: t("attachment_menu.document"),
      color: "text-xon-blue",
      bg: "bg-xon-container-blue",
      callback: () => openDoc(),
    },
    {
      icon: MapPin,
      label: t("attachment_menu.location"),
      color: "text-xon-green",
      bg: "bg-xon-container-green",
      callback: handleLocationClick,
    },
    ...(!isInternalConversation ? [{
      icon: Layout,
      label: t("attachment_menu.template_message"),
      color: "text-xon-yellow",
      bg: "bg-xon-container-yellow",
      callback: () => setShowTemplateModal(true),
    }] : []),
    {
      icon: SlashIcon,
      label: t("attachment_menu.canned_responses"),
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      callback: () => {
        cannedSuggestions.openWithQuery("");
        setShowAttachmentMenu(false);
      },
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="relative border-t border-xon-surface-outline bg-xon-surface-container flex-shrink-0">
        {/* Reply UI */}
        {replyingTo && (
          <ReplyBar
            replyingTo={replyingTo}
            partnerName={partnerName}
            isDarkMode={isDarkMode}
            isInternalConversation={isInternalConversation}
            onClearReply={onClearReply}
          />
        )}

        {/* URL Preview */}
        {detectedUrl && !replyingTo && (
          <UrlPreviewBar url={detectedUrl} onClose={() => setDetectedUrl(null)} />
        )}

        {/* Mention Suggestions Dropdown */}
        <MentionSuggestionsDropdown
          isInternalConversation={isInternalConversation}
          isOpen={mentionSuggestions.showMentionSuggestions}
          isLoading={mentionSuggestions.isMentionLoading}
          inboxId={inboxId}
          inboxMembersError={mentionSuggestions.inboxMembersError}
          inboxMembersCount={mentionSuggestions.inboxMembersCount}
          users={mentionSuggestions.filteredMentionUsers}
          selectedIndex={mentionSuggestions.mentionSelectedIndex}
          onSelect={selectMention}
        />

        {/* Canned Suggestions Dropdown */}
        <CannedSuggestionsDropdown
          isOpen={cannedSuggestions.showCannedSuggestions}
          isLoading={cannedSuggestions.isLoadingCanned}
          slashQuery={cannedSuggestions.slashQuery}
          responses={cannedSuggestions.cannedResponses}
          selectedIndex={cannedSuggestions.selectedIndex}
          onSelect={selectCannedResponse}
          onClose={() => cannedSuggestions.setShowCannedSuggestions(false)}
          containerRef={cannedSuggestions.cannedRef}
        />

        {/* Emoji Suggestions Dropdown */}
        <EmojiSuggestionsDropdown
          isOpen={emojiSuggestions.showEmojiSuggestions}
          emojis={emojiSuggestions.filteredEmojis}
          selectedIndex={emojiSuggestions.emojiSelectedIndex}
          onSelect={selectEmoji}
          isLoading={isLoadingEmojis}
        />

        {/* Conversation Suggestions Dropdown */}
        <ConversationSuggestionsDropdown
          isOpen={convSuggestions.showConversationSuggestions}
          isLoading={convSuggestions.isLoading}
          suggestions={convSuggestions.suggestions}
          selectedIndex={convSuggestions.selectedIndex}
          onSelect={selectConversationSuggestion}
          onClose={() => convSuggestions.setShowConversationSuggestions(false)}
          containerRef={convSuggestions.containerRef}
        />

        <div className={`flex items-end w-full min-w-0 ${treatAsMobile ? "px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+6px)] gap-1.5" : "p-4 gap-2"}`}>

          {/* Left Icon (Attachment) */}
          {!isRecording && (!treatAsMobile || !text.trim()) && (
            <div className="relative flex-shrink-0" ref={attachmentRef}>
              <Button
                variant="ghost"
                size="icon"
                className={`${treatAsMobile ? "h-10 w-9" : "h-9 w-9"} rounded-full hover:bg-xon-surface-container-hover transition-colors`}
                onClick={() => {
                  if (treatAsMobile && !showAttachmentMenu) {
                    textareaRef.current?.blur();
                    setShowPicker(false);
                  }
                  setShowAttachmentMenu(!showAttachmentMenu);
                }}
              >
                <Paperclip className={`${treatAsMobile ? "h-5 w-5" : "h-4 w-4"} text-xon-text-secondary`} />
              </Button>

              {!treatAsMobile && showAttachmentMenu && (
                <div className={`absolute bottom-12 ${isRTL ? "right-0" : "left-0"} bg-xon-surface-container border border-xon-surface-outline rounded-2xl shadow-2xl p-3 min-w-[240px] z-[100]`}>
                  <div className="grid grid-cols-2 gap-2">
                    {attachmentOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setShowAttachmentMenu(false);
                          opt.callback?.();
                        }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-xon-surface-container-hover active:scale-95 transition-all"
                      >
                        <div className={`p-3 rounded-full ${opt.bg} shadow-sm`}>
                          <opt.icon className={`h-5 w-5 ${opt.color}`} />
                        </div>
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Input */}
          {!isRecording && (
            <div className={`relative flex-1 bg-xon-surface-container-hover ${treatAsMobile ? "pl-3 pr-10" : "px-4"} py-2 border border-xon-surface-outline flex transition-all duration-200 shadow-sm ${isExpanded ? "rounded-xl items-start" : "rounded-3xl items-center"}`}>
              {/* AI ghost text — inline completion */}
              {aiCompletion && (
                <div
                  aria-hidden
                  className="absolute inset-0 z-[5] pointer-events-none overflow-hidden flex"
                  style={{
                    paddingLeft: treatAsMobile ? "12px" : "16px",
                    paddingRight: treatAsMobile ? "40px" : "56px",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    alignItems: isExpanded ? "flex-start" : "center",
                  }}
                >
                  <span
                    className="text-[16px] leading-[22px] md:text-sm whitespace-pre-wrap break-words min-w-0"
                    style={{ direction: inputDir, fontFamily: "inherit", lineHeight: "inherit", textAlign: inputDir === "rtl" ? "right" : "left" }}
                  >
                    <span style={{ color: "transparent", userSelect: "none" }}>{text}</span>
                    <span className="text-xon-text-secondary" style={{ userSelect: "none" }}>{aiCompletion}</span>
                  </span>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                rows={1}
                placeholder={placeholder}
                disabled={disabled}
                dir={inputDir}
                enterKeyHint={treatAsMobile ? "enter" : "send"}
                className={`relative z-10 flex-1 bg-transparent outline-none resize-none text-[16px] leading-[22px] md:text-sm text-xon-text-primary caret-xon-blue placeholder:text-xon-text-secondary ${inputDir === "rtl" ? "text-right" : "text-left"} ${!treatAsMobile ? "pr-10" : ""} ${isExpanded ? "overflow-y-auto pr-1" : "overflow-hidden"}`}
                style={{ minHeight: "24px" }}
              />

              {/* Emoji Button - Inside Right */}
              {!isRecording && (
                <div className="absolute right-1 bottom-1 z-20" ref={emojiRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${treatAsMobile ? "h-9 w-9" : "h-8 w-8"} rounded-full hover:bg-xon-surface-outline/10 transition-colors`}
                    onClick={() => {
                      if (treatAsMobile && !showPicker) {
                        textareaRef.current?.blur();
                        setShowAttachmentMenu(false);
                      }
                      setShowPicker(!showPicker);
                    }}
                  >
                    <Smile className={`${treatAsMobile ? "h-5 w-5" : "h-4 w-4"} text-xon-text-secondary`} />
                  </Button>

                  {!treatAsMobile && showPicker && (
                    <div className={`absolute bottom-full mb-2 ${isRTL ? "right-0" : "right-0"} z-50`}>
                      <EmojiPicker
                        width={280}
                        onEmojiClick={(data) => {
                          onEmojiClick(data);
                          setShowPicker(false);
                        }}
                        theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                        emojiStyle={EmojiStyle.NATIVE}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recording */}
          {isRecording && (
            <VoiceRecording
              onSend={(audio) => {
                onSend({ audio });
                setIsRecording(false);
              }}
              onCancel={() => setIsRecording(false)}
            />
          )}

          <div className={`flex items-center ${isMobile ? "gap-1" : "gap-1.5"} flex-shrink-0`}>
            {!isRecording && text.trim() && (
              <button
                onClick={handleSendText}
                className="h-10 w-10 rounded-full bg-xon-blue hover:bg-xon-blue/90 active:scale-90 text-white flex items-center justify-center transition-all shadow-md flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </button>
            )}

            {!text.trim() && !isRecording && (
              <>
                <button
                  onClick={convSuggestions.toggle}
                  className="h-10 w-10 rounded-full bg-xon-blue hover:bg-xon-blue/90 active:scale-90 text-white flex items-center justify-center transition-all shadow-md flex-shrink-0"
                >
                  <WandSparkles className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setIsRecording(true)}
                  className="h-10 w-10 bg-xon-surface-container-hover text-xon-text-secondary hover:text-xon-blue active:scale-90 rounded-full flex items-center justify-center transition-all border border-xon-surface-outline shadow-sm flex-shrink-0"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Attachment Menu */}
        {treatAsMobile && showAttachmentMenu && (
          <div ref={mobileAttachmentRef} className="w-full bg-xon-surface-container border-t border-xon-surface-outline animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center p-2 border-b border-xon-surface-outline/50" onClick={() => setShowAttachmentMenu(false)}>
              <div className="w-12 h-1.5 rounded-full bg-xon-surface-outline" />
            </div>
            <div className="grid grid-cols-4 gap-y-6 gap-x-2 p-6 pb-8">
              {attachmentOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    opt.callback?.();
                  }}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div className={`h-16 w-16 rounded-full ${opt.bg} shadow-md flex items-center justify-center border border-xon-surface-outline/20`}>
                    <opt.icon className={`h-7 w-7 ${opt.color}`} />
                  </div>
                  <span className="text-[11px] font-medium text-xon-text-secondary text-center px-1 leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="h-[env(safe-area-inset-bottom)] bg-xon-surface-container" />
          </div>
        )}

        {/* Mobile Emoji Picker */}
        {treatAsMobile && showPicker && (
          <div ref={mobileEmojiRef} className="w-full bg-xon-surface-container border-t border-xon-surface-outline animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center p-2 border-b border-xon-surface-outline/50" onClick={() => setShowPicker(false)}>
              <div className="w-12 h-1.5 rounded-full bg-xon-surface-outline" />
            </div>
            <EmojiPicker
              width="100%"
              height={300}
              autoFocusSearch={false}
              onEmojiClick={(data) => onEmojiClick(data)}
              theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
              emojiStyle={EmojiStyle.NATIVE}
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
            <div className="h-[env(safe-area-inset-bottom)] bg-xon-surface-container" />
          </div>
        )}
      </div>

      {/* Template Modal */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={(template: WhatsAppTemplate) => {
          onSend({
            text: template.body_text,
            message_type: "template_message",
            template_id: template.id,
            template: {
              name: template.name,
              header_text: template.header_text ?? undefined,
              header_media_url: template.header_media_url ?? undefined,
              body_text: template.body_text,
              header_type: template.header_type ?? "TEXT",
              variables: template.variables?.map((v) => ({
                name: v.name,
                type: v.type,
                example: v.example,
              })) || [],
              footer_text: template.footer_text ?? undefined,
              buttons: template.buttons?.map((btn) => ({
                type: btn.type,
                text: btn.text,
                url: btn.url ?? undefined,
                phone_number: btn.phone_number ?? undefined,
              })) as any,
            },
          });
          setShowAttachmentMenu(false);
          setShowTemplateModal(false);
          setText("");
        }}
      />

      {/* Location Permission Dialog */}
      <LocationPermissionDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onRetry={handleLocationClick}
      />
    </>
  );
}
