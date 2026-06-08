import { useState, useRef, useEffect } from "react";
import { useConversationSuggestions } from "@/api/conversations/hooks";

export function useConversationSuggestionsState(conversationId?: string) {
  const [showConversationSuggestions, setShowConversationSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useConversationSuggestions(Number(conversationId));
  const suggestions = data?.suggestions || [];

  useEffect(() => {
    if (suggestions.length > 0) setSelectedIndex(0);
  }, [suggestions.length]);

  useEffect(() => {
    if (!showConversationSuggestions) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowConversationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showConversationSuggestions]);

  const toggle = () => setShowConversationSuggestions((prev) => !prev);

  return {
    showConversationSuggestions,
    setShowConversationSuggestions,
    selectedIndex,
    setSelectedIndex,
    suggestions,
    isLoading,
    containerRef,
    toggle,
  };
}
