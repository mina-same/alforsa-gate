import { useState, useEffect } from "react";

export const getDraftKey = (conv: { id: string; numeric_id?: number | null }): string =>
  conv.numeric_id ? String(conv.numeric_id) : conv.id;

export interface UseDraftReturn {
  drafts: Record<string, string>;
  currentDraftConversation: string | null;
  saveDraft: (conversationId: string, text: string) => void;
  getDraft: (conversationId: string) => string;
}

export const useDraft = (conversationKey: string | undefined): UseDraftReturn => {
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    try {
      const savedDrafts = localStorage.getItem("messageDrafts");
      return savedDrafts ? JSON.parse(savedDrafts) : {};
    } catch (e) {
      console.error("Failed to parse drafts from localStorage", e);
      return {};
    }
  });

  const [currentDraftConversation, setCurrentDraftConversation] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationKey) return;
    if (currentDraftConversation && currentDraftConversation !== conversationKey) {
      setCurrentDraftConversation(conversationKey);
    } else if (!currentDraftConversation) {
      setCurrentDraftConversation(conversationKey);
    }
  }, [conversationKey, currentDraftConversation]);

  const saveDraft = (conversationId: string, text: string) => {
    setDrafts((prev) => {
      const next = { ...prev, [conversationId]: text };
      try {
        localStorage.setItem("messageDrafts", JSON.stringify(next));
        window.dispatchEvent(new Event("messageDraftsUpdated"));
      } catch (e) {
        console.error("Failed to save drafts to localStorage", e);
      }
      return next;
    });
  };

  const getDraft = (conversationId: string) => drafts[conversationId] || "";

  useEffect(() => {
    return () => {
      window.dispatchEvent(new Event("messageDraftsUpdated"));
    };
  }, [conversationKey]);

  return { drafts, currentDraftConversation, saveDraft, getDraft };
};