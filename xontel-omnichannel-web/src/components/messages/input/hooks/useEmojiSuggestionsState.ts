import { useState } from "react";
import { filterEmojis, type EmojiEntry } from "@/utils/emojis";

export function useEmojiSuggestionsState(emojiData: EmojiEntry[]) {
  const [showEmojiSuggestions, setShowEmojiSuggestions] = useState(false);
  const [emojiQuery, setEmojiQuery] = useState("");
  const [emojiSelectedIndex, setEmojiSelectedIndex] = useState(0);

  const filteredEmojis = filterEmojis(emojiQuery, emojiData);

  const openWithQuery = (query: string) => {
    setEmojiQuery(query);
    setShowEmojiSuggestions(true);
    setEmojiSelectedIndex(0);
  };

  const close = () => setShowEmojiSuggestions(false);

  return {
    showEmojiSuggestions,
    setShowEmojiSuggestions,
    emojiQuery,
    emojiSelectedIndex,
    setEmojiSelectedIndex,
    filteredEmojis,
    openWithQuery,
    close,
  };
}
