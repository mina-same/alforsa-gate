import { useRef, useEffect } from "react";

interface UseDraftSavingOptions {
  conversationId?: string;
  onSaveDraft?: (conversationId: string, text: string) => void;
}

export function useDraftSaving({ conversationId, onSaveDraft }: UseDraftSavingOptions) {
  const latestTextRef = useRef("");
  const draftSaveTimeoutRef = useRef<number | null>(null);

  const updateLatestText = (text: string) => {
    latestTextRef.current = text;
  };

  const scheduleSave = (text: string) => {
    if (!conversationId || !onSaveDraft) return;
    if (draftSaveTimeoutRef.current != null) window.clearTimeout(draftSaveTimeoutRef.current);
    draftSaveTimeoutRef.current = window.setTimeout(() => {
      onSaveDraft(conversationId, text);
    }, 300);
  };

  const cancelAndClearDraft = () => {
    if (draftSaveTimeoutRef.current != null) {
      window.clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = null;
    }
    if (conversationId && onSaveDraft) {
      onSaveDraft(conversationId, "");
    }
  };

  useEffect(() => {
    const handler = () => {
      if (!conversationId || !onSaveDraft) return;
      onSaveDraft(conversationId, latestTextRef.current);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [conversationId, onSaveDraft]);

  useEffect(() => {
    return () => {
      if (draftSaveTimeoutRef.current != null) window.clearTimeout(draftSaveTimeoutRef.current);
    };
  }, []);

  return { scheduleSave, cancelAndClearDraft, updateLatestText };
}
