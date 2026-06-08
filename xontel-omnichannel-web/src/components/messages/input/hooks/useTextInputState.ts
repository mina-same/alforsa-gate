import { useState, useRef, useEffect, useCallback } from "react";
import { getAiCompletion, warmUpAiAutocomplete } from "@/utils/aiAutocomplete";

export function useTextInputState(initialText: string) {
  const [text, setText] = useState(initialText);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiCompletion, setAiCompletion] = useState("");
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const baseTextareaHeightRef = useRef<number | null>(null);
  const autocompleteTimerRef = useRef<number | null>(null);

  const clearAiCompletion = useCallback(() => {
    setAiCompletion("");
    if (autocompleteTimerRef.current != null) {
      window.clearTimeout(autocompleteTimerRef.current);
      autocompleteTimerRef.current = null;
    }
  }, []);

  const acceptAiCompletion = useCallback((onAccept?: () => void) => {
    if (!aiCompletion) return;
    onAccept?.();
    setText((prev) => prev + aiCompletion);
    setAiCompletion("");
    if (autocompleteTimerRef.current != null) {
      window.clearTimeout(autocompleteTimerRef.current);
      autocompleteTimerRef.current = null;
    }
    textareaRef.current?.focus();
  }, [aiCompletion]);

  const scheduleAiCompletion = useCallback((value: string) => {
    if (autocompleteTimerRef.current != null) window.clearTimeout(autocompleteTimerRef.current);
    if (value.trim().length >= 3) {
      setAiCompletion("");
      autocompleteTimerRef.current = window.setTimeout(async () => {
        const completion = await getAiCompletion(value);
        if (completion) setAiCompletion(completion);
      }, 800);
    } else {
      setAiCompletion("");
      autocompleteTimerRef.current = null;
    }
  }, []);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const MAX_TEXTAREA_HEIGHT = 120;
    el.style.height = "auto";
    if (baseTextareaHeightRef.current == null) {
      baseTextareaHeightRef.current = el.scrollHeight;
    }
    const nextHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = nextHeight + "px";
    const base = baseTextareaHeightRef.current ?? 0;
    const nextExpanded = nextHeight > base + 2;
    setIsExpanded((prev) => (prev === nextExpanded ? prev : nextExpanded));
  }, []);

  useEffect(() => {
    const handler = () => textareaRef.current?.focus();
    window.addEventListener("focus-message-input", handler);
    return () => window.removeEventListener("focus-message-input", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(pointer: coarse)");
    const onChange = () => setIsCoarsePointer(!!mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    warmUpAiAutocomplete();
  }, []);

  useEffect(() => {
    return () => {
      if (autocompleteTimerRef.current != null) window.clearTimeout(autocompleteTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    baseTextareaHeightRef.current = el.scrollHeight;
    setIsExpanded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [text, resizeTextarea]);

  return {
    text,
    setText,
    isExpanded,
    setIsExpanded,
    aiCompletion,
    clearAiCompletion,
    acceptAiCompletion,
    scheduleAiCompletion,
    isCoarsePointer,
    textareaRef,
    resizeTextarea,
  };
}
