import { useState, useRef, useEffect } from "react";

export function useAttachmentMenuState() {
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const attachmentRef = useRef<HTMLDivElement>(null);
  const mobileAttachmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAttachmentMenu) return;
    const handler = (e: MouseEvent) => {
      const isInsideTrigger = attachmentRef.current?.contains(e.target as Node);
      const isInsideMobileMenu = mobileAttachmentRef.current?.contains(e.target as Node);
      if (!isInsideTrigger && !isInsideMobileMenu) {
        setShowAttachmentMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAttachmentMenu]);

  return { showAttachmentMenu, setShowAttachmentMenu, attachmentRef, mobileAttachmentRef };
}
