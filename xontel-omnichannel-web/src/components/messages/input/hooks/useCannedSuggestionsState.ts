import { useState, useRef, useEffect, RefObject } from "react";
import { useSearchCannedResponses } from "@/api/canned-responses/hooks";

export function useCannedSuggestionsState(textareaRef: RefObject<HTMLTextAreaElement | null>) {
  const [showCannedSuggestions, setShowCannedSuggestions] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const cannedRef = useRef<HTMLDivElement>(null);

  const { data, isLoading: isLoadingCanned } = useSearchCannedResponses(
    { q: slashQuery, limit: 10 },
    showCannedSuggestions
  );
  const cannedResponses = data?.items || [];

  useEffect(() => {
    if (!showCannedSuggestions) return;
    const handler = (e: MouseEvent) => {
      if (
        cannedRef.current &&
        !cannedRef.current.contains(e.target as Node) &&
        !textareaRef.current?.contains(e.target as Node)
      ) {
        setShowCannedSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCannedSuggestions, textareaRef]);

  const openWithQuery = (query: string) => {
    setSlashQuery(query);
    setShowCannedSuggestions(true);
    setSelectedIndex(0);
  };

  return {
    showCannedSuggestions,
    setShowCannedSuggestions,
    slashQuery,
    selectedIndex,
    setSelectedIndex,
    cannedResponses,
    isLoadingCanned,
    cannedRef,
    openWithQuery,
  };
}
