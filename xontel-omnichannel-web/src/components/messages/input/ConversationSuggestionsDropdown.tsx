import React from "react";

import { Loader2, WandSparkles, X } from "lucide-react";

export default function ConversationSuggestionsDropdown({
  isOpen,
  isLoading,
  suggestions,
  selectedIndex,
  onSelect,
  onClose,
  containerRef,
}: {
  isOpen: boolean;
  isLoading: boolean;
  suggestions: string[];
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  containerRef?: React.Ref<HTMLDivElement>;
}) {
  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute bottom-full left-4 right-4 mb-2 bg-xon-surface-container border border-xon-surface-outline rounded-lg shadow-2xl overflow-hidden z-50 transition-all ${
        isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <div className="p-2 border-b border-xon-surface-outline flex items-center justify-between bg-xon-surface-container-hover">
        <span className="text-xs font-semibold flex items-center gap-1.5 text-xon-text-secondary uppercase tracking-wider">
          <WandSparkles className="h-3 w-3" />
          AI Suggestions
        </span>
        <div className="flex items-center gap-1.5">
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-xon-primary" />}
          <button
            onClick={onClose}
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-xon-surface-outline/20 text-xon-text-secondary hover:text-xon-text-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(suggestion)}
              className={`w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors border-l-2 ${
                idx === selectedIndex
                  ? "bg-xon-surface-container-hover border-xon-primary"
                  : "hover:bg-xon-surface-hover border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-xon-primary">
                  Suggestion {idx + 1}
                </span>
                <span className="text-[10px] text-xon-text-secondary bg-xon-surface-container-hover px-1.5 py-0.5 rounded">
                  Enter ↵
                </span>
              </div>
              <span className="text-xs text-xon-text-primary/80 line-clamp-2">
                {suggestion}
              </span>
            </button>
          ))
        ) : isLoading ? (
          <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-xon-primary/50" />
            <span className="text-xs text-xon-text-secondary italic">
              Generating suggestions...
            </span>
          </div>
        ) : (
          <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
            <div className="p-3 bg-xon-surface-container-hover rounded-full">
              <WandSparkles className="h-5 w-5 text-xon-text-secondary/30" />
            </div>
            <p className="text-xs text-xon-text-secondary">No suggestions available</p>
          </div>
        )}
      </div>
    </div>
  );
}
