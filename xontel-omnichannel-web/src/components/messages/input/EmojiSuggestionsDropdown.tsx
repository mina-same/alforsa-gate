import React, { useEffect, useRef } from "react";

type EmojiEntry = {
  short_code: string;
  emoji: string;
};

export default function EmojiSuggestionsDropdown({
  isOpen,
  emojis,
  selectedIndex,
  onSelect,
  isLoading,
}: {
  isOpen: boolean;
  emojis: EmojiEntry[];
  selectedIndex: number;
  onSelect: (emoji: string) => void;
  isLoading?: boolean;
}) {
  if (!isOpen) return null;

  if (!isLoading && emojis.length === 0) return null;

  const selectedButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isLoading) return;
    selectedButtonRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedIndex, isOpen, isLoading, emojis.length]);

  return (
    <div
      className={`absolute max-w-[800px] bottom-full left-0 right-0 mb-2 bg-xon-surface-container border border-xon-surface-outline rounded-2xl shadow-2xl overflow-hidden z-50 transition-all  ${
        isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <div className="px-2 py-2 overflow-x-auto xon-scrollbar-hidden">
        {isLoading ? (
          <div className="px-4 py-2 text-center text-xs text-xon-text-secondary italic">
            Loading emojis…
          </div>
        ) : (
          <div className="flex items-center gap-1.5 min-w-max">
            {emojis.map((e, idx) => (
              <button
                key={`${e.short_code}-${e.emoji}-${idx}`}
                ref={idx === selectedIndex ? selectedButtonRef : undefined}
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => onSelect(e.emoji)}
                className={`h-9 w-9 flex items-center justify-center rounded-xl transition-colors ${
                  idx === selectedIndex
                    ? "bg-xon-surface-hover ring-2 ring-xon-primary"
                    : "hover:bg-xon-surface-container-hover"
                }`}
                aria-label={e.short_code ? `:${e.short_code}:` : "emoji"}
                title={e.short_code ? `:${e.short_code}:` : undefined}
                type="button"
              >
                <span className="text-[20px] leading-none">{e.emoji || "❓"}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
