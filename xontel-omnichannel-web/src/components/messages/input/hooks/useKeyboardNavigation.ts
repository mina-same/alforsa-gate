import React, { useCallback } from "react";

export interface SuggestionNav {
  isOpen: boolean;
  count: number;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectAtIndex: (index: number) => void;
  close: () => void;
  /** Arrow axis: "vertical" uses Up/Down, "horizontal" uses Left/Right. Default: "vertical" */
  arrowAxis?: "vertical" | "horizontal";
}

interface Options {
  aiCompletion: string;
  acceptAiCompletion: () => void;
  clearAiCompletion: () => void;
  suggestions: SuggestionNav[];
  treatAsMobile: boolean;
  handleSendText: () => void;
}

export function useKeyboardNavigation({
  aiCompletion,
  acceptAiCompletion,
  clearAiCompletion,
  suggestions,
  treatAsMobile,
  handleSendText,
}: Options) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (aiCompletion) {
        if (e.key === "Tab") {
          e.preventDefault();
          acceptAiCompletion();
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          clearAiCompletion();
          return;
        }
      }

      for (const nav of suggestions) {
        if (!nav.isOpen) continue;
        const axis = nav.arrowAxis ?? "vertical";
        const prevKey = axis === "vertical" ? "ArrowUp" : "ArrowLeft";
        const nextKey = axis === "vertical" ? "ArrowDown" : "ArrowRight";
        const safeCount = nav.count || 1;

        if (e.key === nextKey) {
          e.preventDefault();
          nav.setSelectedIndex((prev) => (prev + 1) % safeCount);
        } else if (e.key === prevKey) {
          e.preventDefault();
          nav.setSelectedIndex((prev) => (prev - 1 + safeCount) % safeCount);
        } else if (e.key === "Enter") {
          e.preventDefault();
          nav.selectAtIndex(nav.selectedIndex);
        } else if (e.key === "Escape") {
          e.preventDefault();
          nav.close();
        }
        return;
      }

      if (e.key === "Enter" && !e.shiftKey && !treatAsMobile) {
        e.preventDefault();
        handleSendText();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aiCompletion, acceptAiCompletion, clearAiCompletion, suggestions, treatAsMobile, handleSendText]
  );
}
