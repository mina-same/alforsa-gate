import { useState, useRef } from "react";

export type ComposerPickerMode = "mixed" | "media" | "video" | "image" | "document";

export interface UseAttachmentPickerReturn {
  attachmentInputRef: React.RefObject<HTMLInputElement>;
  attachmentAccept: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  composerOpen: boolean;
  composerFiles: File[];
  composerPickerMode: ComposerPickerMode;
  closeComposer: () => void;
  isGlobalDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  openAttachmentPicker: (accept: string, mode?: ComposerPickerMode) => void;
  handleIncomingFiles: (files: File[]) => void;
}

export function useAttachmentPicker(): UseAttachmentPickerReturn {
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerFiles, setComposerFiles] = useState<File[]>([]);
  const [composerPickerMode, setComposerPickerMode] =
    useState<ComposerPickerMode>("mixed");
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const [attachmentAccept, setAttachmentAccept] = useState<string>(
    "image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const composerPickerModeRef = useRef<ComposerPickerMode>("mixed");

  const handleIncomingFiles = (files: File[]) => {
    if (!files || files.length === 0) return;

    const mode = composerPickerModeRef.current;

    const filtered = (() => {
      if (mode === "image")
        return files.filter((f) => f.type.startsWith("image/"));
      if (mode === "video")
        return files.filter((f) => f.type.startsWith("video/"));
      if (mode === "media")
        return files.filter(
          (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
        );
      return files;
    })();

    if (filtered.length !== files.length) {
      if (mode === "image") {
        alert("Only photos are allowed here.");
      } else if (mode === "video") {
        alert("Only videos are allowed here.");
      } else if (mode === "media") {
        alert("Only photos and videos are allowed here.");
      }
    }

    if (filtered.length === 0) return;

    setComposerFiles(filtered);
    setComposerOpen(true);
  };

  const openAttachmentPicker = (
    accept: string,
    mode?: ComposerPickerMode,
  ) => {
    setAttachmentAccept(accept);

    const nextMode = (() => {
      if (mode) return mode;
      const normalizedAccept = String(accept || "")
        .replace(/\s+/g, "")
        .toLowerCase();
      const hasImage = normalizedAccept.includes("image/*");
      const hasVideo = normalizedAccept.includes("video/*");
      if (hasImage && hasVideo) return "media";
      if (normalizedAccept === "video/*" || (hasVideo && !hasImage))
        return "video";
      if (normalizedAccept === "image/*" || (hasImage && !hasVideo))
        return "image";
      return "mixed";
    })() as ComposerPickerMode;

    // React state updates are async; keep a ref in sync so file input change handlers
    // always see the latest intended picker mode.
    composerPickerModeRef.current = nextMode;
    setComposerPickerMode(nextMode);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
    attachmentInputRef.current?.click();
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setComposerFiles([]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsGlobalDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    handleIncomingFiles(files);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      handleIncomingFiles(selected);
    }
    e.currentTarget.value = "";
  };

  return {
    attachmentInputRef,
    attachmentAccept,
    onInputChange,
    composerOpen,
    composerFiles,
    composerPickerMode,
    closeComposer,
    isGlobalDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    openAttachmentPicker,
    handleIncomingFiles,
  };
}
