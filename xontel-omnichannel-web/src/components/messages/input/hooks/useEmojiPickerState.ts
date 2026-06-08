import { useState, useRef, useEffect } from "react";
import { loadEmojiData, type EmojiEntry } from "@/utils/emojis";

export function useEmojiPickerState(language: string) {
  const [showPicker, setShowPicker] = useState(false);
  const [emojiData, setEmojiData] = useState<EmojiEntry[]>([]);
  const [isLoadingEmojis, setIsLoadingEmojis] = useState(true);
  const emojiRef = useRef<HTMLDivElement>(null);
  const mobileEmojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadEmojiData(language).then((data) => {
      setEmojiData(data);
      setIsLoadingEmojis(false);
    });
  }, [language]);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      const isInsideTrigger = emojiRef.current?.contains(e.target as Node);
      const isInsideMobilePicker = mobileEmojiRef.current?.contains(e.target as Node);
      if (!isInsideTrigger && !isInsideMobilePicker) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  return { showPicker, setShowPicker, emojiData, isLoadingEmojis, emojiRef, mobileEmojiRef };
}
