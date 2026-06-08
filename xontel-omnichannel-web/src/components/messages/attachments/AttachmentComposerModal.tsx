import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Send, Smile, Trash2 } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme, EmojiStyle } from "emoji-picker-react";

import { OutgoingMessage } from "@/types/chat";
import { useUploadMedia } from "@/api/media/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { getFileIcon } from "@/utils/getFileIcon";
import { generateUniqueFilename } from "@/utils/fileUtils";

import FileUploadProgress from "../documents/FileUploadProgress";
import FilePreview from "../documents/FilePreview";
import { VideoPreview } from "../videopreview/VideoPreview";

type ComposerFile = File;

interface AttachmentComposerModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (msg: OutgoingMessage) => void;
  inline?: boolean;
  initialFiles?: ComposerFile[];
  pickerMode?: "mixed" | "media" | "video" | "image" | "document";
}

export default function AttachmentComposerModal({
  open,
  onClose,
  onSend,
  inline = false,
  initialFiles = [],
  pickerMode = "mixed",
}: AttachmentComposerModalProps) {
  const isMobile = useIsMobile();
  const isDarkMode = document.documentElement.classList.contains("dark");
  const { mutateAsync: uploadMedia } = useUploadMedia();

  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const mobileEmojiRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const baseTextareaHeightRef = useRef<number | null>(null);

  const [files, setFiles] = useState<ComposerFile[]>(initialFiles);
  const [activeIndex, setActiveIndex] = useState(0);

  const [caption, setCaption] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const inputAccept = useMemo(() => {
    if (pickerMode === "video") return "video/*";
    if (pickerMode === "image") return "image/*";
    if (pickerMode === "media") return "image/*,video/*";
    if (pickerMode === "document") return "*/*";
    return "image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }, [pickerMode]);

  const openChooser = () => {
    if (uploading) return;
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const formatBytes = (bytes: number | undefined | null) => {
    if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  };

  const clampActiveIndex = (idx: number, list: ComposerFile[]) => {
    if (!list.length) return 0;
    if (idx < 0) return 0;
    if (idx >= list.length) return list.length - 1;
    return idx;
  };

  const goPrev = () => {
    setActiveIndex((prev) => clampActiveIndex(prev - 1, files));
  };

  const goNext = () => {
    setActiveIndex((prev) => clampActiveIndex(prev + 1, files));
  };

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);
      setActiveIndex(0);
    }
  }, [initialFiles]);

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowPicker(false);
        onClose();
        return;
      }

      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (!files.length) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "textarea" || tag === "input") return;
      if ((target as any)?.isContentEditable) return;

      e.preventDefault();

      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, files.length]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (uploading) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "textarea" || tag === "input") return;
      if ((target as any)?.isContentEditable) return;

      if (!files.length) return;
      e.preventDefault();
      void handleSend();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, uploading, files.length]);

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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setCaption((prev) => prev + emojiData.emoji);
    setTimeout(resizeTextarea, 0);
    captionRef.current?.focus();
  };

  const resizeTextarea = useCallback(() => {
    const el = captionRef.current;
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
    const el = captionRef.current;
    if (!el) return;

    el.style.height = "auto";
    baseTextareaHeightRef.current = el.scrollHeight;
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [caption, resizeTextarea]);

  const activeFile = files[activeIndex];

  // Stabilize object URLs to prevent flicker on index change
  const activeFileUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    files.forEach((f) => {
      if (!map.has(f.name)) {
        map.set(f.name, URL.createObjectURL(f));
      }
    });
    return map;
  }, [files]);

  const activeFileUrl = activeFile ? activeFileUrlMap.get(activeFile.name) ?? null : null;

  useEffect(() => {
    return () => {
      // Clean up all object URLs on unmount
      activeFileUrlMap.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [activeFileUrlMap]);

  const activeKind = useMemo(() => {
    if (!activeFile) return "none" as const;
    if (pickerMode === "document") return "file" as const;
    if (activeFile.type.startsWith("image/")) return "image" as const;
    if (activeFile.type.startsWith("video/")) return "video" as const;
    return "file" as const;
  }, [activeFile, pickerMode]);

  // Space to play/pause video
  useEffect(() => {
    if (!open) return;
    if (activeKind !== "video") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        // Find the native video element inside VideoPreview and toggle playback
        const videoEl = document.querySelector(`[data-video-preview="${activeFile?.name}"] video`) as HTMLVideoElement | null;
        if (videoEl) {
          if (videoEl.paused) {
            void videoEl.play();
          } else {
            videoEl.pause();
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, activeKind, activeFile?.name]);

  const handleAddFiles = (selected?: FileList | File[]) => {
    if (!selected) return;
    const next = Array.isArray(selected) ? selected : Array.from(selected);
    if (next.length === 0) return;

    const filteredNext = (() => {
      if (pickerMode === "image") return next.filter((f) => f.type.startsWith("image/"));
      if (pickerMode === "video") return next.filter((f) => f.type.startsWith("video/"));
      if (pickerMode === "media") return next.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
      return next;
    })();

    if (filteredNext.length !== next.length) {
      if (pickerMode === "image") {
        alert("Only photos are allowed here.");
      } else if (pickerMode === "video") {
        alert("Only videos are allowed here.");
      } else if (pickerMode === "media") {
        alert("Only photos and videos are allowed here.");
      }
    }

    if (filteredNext.length === 0) return;

    setFiles((prev) => {
      const merged = [...prev, ...filteredNext];
      return merged;
    });

    setError(null);

    if (!files.length && filteredNext.length > 0) {
      setActiveIndex(0);
    }
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });

    setActiveIndex((prev) => {
      if (index < prev) return Math.max(0, prev - 1);
      if (index === prev) return Math.max(0, prev - 1);
      return prev;
    });
  };

  const swipeStartXRef = useRef<number | null>(null);
  const swipeStartYRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches?.[0];
    if (!t) return;
    swipeStartXRef.current = t.clientX;
    swipeStartYRef.current = t.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = swipeStartXRef.current;
    const startY = swipeStartYRef.current;
    swipeStartXRef.current = null;
    swipeStartYRef.current = null;

    const t = e.changedTouches?.[0];
    if (startX == null || startY == null || !t) return;

    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // horizontal swipe only
    if (Math.abs(dx) < 50) return;
    if (Math.abs(dx) < Math.abs(dy)) return;

    if (dx > 0) {
      goPrev();
    } else {
      goNext();
    }
  };

  async function handleSend() {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setCurrentIndex(0);
    setUploadTotal(files.length);
    setError(null);

    try {
      for (let i = 0; i < files.length; i += 1) {
        setCurrentIndex(i);
        setProgress(0);
        const f = files[i];

        // Generate unique filename for the file
        const uniqueFileName = generateUniqueFilename(f.name, f.type);
        const fileWithUniqueName = new File([f], uniqueFileName, {
          type: f.type,
        });

        const response = await uploadMedia({
          file: fileWithUniqueName,
          onProgress: (p) => setProgress(p),
        });

        const type = pickerMode === "document"
          ? "file"
          : pickerMode === "video"
            ? "video"
            : pickerMode === "image"
              ? "image"
              : f.type.startsWith("video/")
                ? "video"
                : f.type.startsWith("image/")
                  ? "image"
                  : "file";

        onSend({
          text: caption || "",
          media: {
            type: type as any,
            blob: f,
            url: response.url,
            name: uniqueFileName,
          },
        });

        if (i < files.length - 1) {
          await new Promise((r) => setTimeout(r, 150));
        }
      }

      setUploading(false);
      setProgress(0);
      setCurrentIndex(null);
      setUploadTotal(0);
      setFiles([]);
      setCaption("");
      setShowPicker(false);
      onClose();
    } catch (err: any) {
      setUploading(false);
      setError(err?.message || "Failed to upload files");
    }
  }

  const containerClass = "fixed inset-0 z-[9999] bg-black";

  const cardClass = "relative w-full h-full flex flex-col";

  if (!open) return null;

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        <button
          onClick={() => {
            setShowPicker(false);
            onClose();
          }}
          className="absolute right-4 top-4 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/55 text-white"
        >
          ✕
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept={inputAccept}
          onChange={(e) => {
            handleAddFiles(e.target.files ?? undefined);
            if (e.currentTarget) e.currentTarget.value = "";
          }}
        />

        <div className="flex-1 min-h-0 w-full flex flex-col">
          <div
            className="relative flex-1 min-h-0 w-full flex items-center justify-center bg-black"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {uploading ? (
              <div className="w-full px-6 py-4 flex flex-col items-center justify-center">
                <FileUploadProgress
                  progress={progress}
                  onCancel={() => {
                    setUploading(false);
                    setProgress(0);
                    setCurrentIndex(null);
                    setUploadTotal(0);
                  }}
                />
                {typeof currentIndex === "number" && uploadTotal > 1 && (
                  <div className="mt-3 text-sm text-white/80">
                    Uploading {currentIndex + 1} / {uploadTotal}
                  </div>
                )}
              </div>
            ) : !activeFile ? (
              <div className="w-full px-6 py-10 flex flex-col items-center justify-center">
                <div className="text-white/70 text-sm">No files selected</div>
                <Button className="mt-4" onClick={openChooser} variant="secondary">
                  Choose Files
                </Button>
              </div>
            ) : activeKind === "image" ? (
              <img
                src={activeFileUrl ?? undefined}
                alt={activeFile?.name}
                className="max-h-[calc(100vh-210px)] md:max-h-[calc(100vh-240px)] max-w-[100vw] object-contain"
                onClick={openChooser}
              />
            ) : activeKind === "video" ? (
              <div className="w-full max-w-4xl px-3">
                <div data-video-preview={activeFile?.name}>
                  {activeFileUrl && (
                    <VideoPreview
                      show
                      src={activeFileUrl}
                      className="w-full max-h-[calc(100vh-210px)] md:max-h-[calc(100vh-240px)]"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-xl px-6 py-10">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10">
                  <div className="w-full flex flex-col items-center text-center">
                    {(() => {
                      const size = formatBytes(activeFile.size);
                      const typeLabel = activeFile.type || "Document";

                      return (
                        <>
                          <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center">
                            {getFileIcon(activeFile.type, activeFile.name, "w-14 h-14 flex items-center justify-center")}
                          </div>

                          <div className="mt-5 text-base font-semibold text-white truncate max-w-full">
                            {activeFile.name}
                          </div>
                          <div className="mt-2 text-sm text-white/60 truncate max-w-full">
                            {[typeLabel, size ? `- ${size}` : ""].filter(Boolean).join(" ")}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="hidden">
                    <FilePreview file={activeFile} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {files.length > 0 && !uploading && (
            <div className="w-full bg-black/70 backdrop-blur-md">
              <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto">
                {files.map((f, idx) => {
                  const isActive = idx === activeIndex;
                  const kind = pickerMode === "document"
                    ? "file"
                    : f.type.startsWith("image/")
                      ? "image"
                      : f.type.startsWith("video/")
                        ? "video"
                        : "file";

                  return (
                    <div key={`${f.name}-${idx}`} className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className="relative flex-shrink-0"
                        style={{ width: 56, height: 56 }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          className={`w-full h-full rounded-lg overflow-hidden border ${isActive ? "border-white" : "border-white/20"} bg-black/30 transition`}
                          aria-label={`Preview ${f.name}`}
                        >
                          {kind === "image" ? (
                            <img
                              src={activeFileUrlMap.get(f.name) ?? undefined}
                              alt={f.name}
                              className="w-full h-full object-cover"
                            />
                          ) : kind === "video" ? (
                            <video
                              src={activeFileUrlMap.get(f.name) ?? undefined}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                                {getFileIcon(f.type, f.name, "w-7 h-7 flex items-center justify-center")}
                              </div>
                            </div>
                          )}
                        </button>

                        {isActive && !uploading && (
                          <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/20 border-2 border-white"
                            aria-label={`Remove ${f.name}`}
                          >
                            <span className="h-10 w-10 rounded-xl bg-black/35 hover:bg-black/45 text-white flex items-center justify-center transition active:scale-95">
                              <Trash2 className="h-6 w-6" />
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex-shrink-0 hover:bg-white/5 transition flex items-center justify-center"
                  style={{ width: 56, height: 56 }}
                  aria-label="Add more"
                >
                  <span className="text-2xl text-white">+</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full bg-red-600/20 border-t border-red-500/30 px-4 py-3">
              <div className="text-sm font-medium text-red-100">{error}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-red-100 border-red-300/40 hover:bg-red-500/10"
                onClick={handleSend}
              >
                Retry Upload
              </Button>
            </div>
          )}

          {files.length > 0 && (
            <div className="px-2 md:px-4 py-3 bg-black/75 backdrop-blur-md border-t border-white/10">
              <div className="relative w-full">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="h-[44px] w-[44px] rounded-2xl bg-white/10 hover:bg-white/15 flex items-center justify-center border border-white/10 text-white transition active:scale-95"
                    aria-label="Add attachments"
                  >
                    +
                  </button>

                  <div className={`flex items-center gap-2 ${isExpanded ? "rounded-xl items-start" : "rounded-3xl items-center"} flex-1 min-w-0 relative bg-white/10 border border-white/10 px-4 py-3 pr-10 transition-all duration-200 shadow-sm`}>
                    <textarea
                      ref={captionRef}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={1}
                      placeholder="Add a caption..."
                      className={`relative z-10 flex-1 bg-transparent outline-none resize-none text-[16px] leading-[22px] md:text-sm text-white placeholder:text-white/55 ${isExpanded ? "overflow-y-auto pr-1" : "overflow-hidden"}`}
                      style={{ minHeight: '24px' }}
                    />

                    <div className="absolute right-1 bottom-1" ref={emojiRef}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-white/10"
                        onClick={() => {
                          if (isMobile) {
                            if (!showPicker) {
                              captionRef.current?.blur();
                            }
                            setShowPicker(!showPicker);
                          } else {
                            setShowPicker(!showPicker);
                          }
                        }}
                      >
                        <Smile className="h-5 w-5 text-white/80" />
                      </Button>

                      {!isMobile && showPicker && (
                        <div className="absolute bottom-full right-0 mb-2 z-50">
                          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl">
                            <EmojiPicker
                              width={280}
                              onEmojiClick={(data) => {
                                onEmojiClick(data);
                                setShowPicker(false);
                              }}
                              theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                              emojiStyle={EmojiStyle.NATIVE}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={uploading}
                    className="h-[44px] w-[44px] rounded-2xl bg-xon-blue hover:bg-xon-blue/90 active:scale-95 text-white flex items-center justify-center transition-all shadow-lg shadow-black/30 ring-1 ring-white/10 flex-shrink-0 disabled:opacity-50 disabled:active:scale-100"
                    aria-label="Send"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          )}

          {isMobile && showPicker && (
            <div
              ref={mobileEmojiRef}
              className="w-full bg-white border-t border-gray-200 animate-in slide-in-from-bottom duration-300"
            >
              <div className="flex justify-center p-2 border-b border-gray-200" onClick={() => setShowPicker(false)}>
                <div className="w-12 h-1.5 rounded-full bg-gray-300" />
              </div>

              <EmojiPicker
                width="100%"
                height={300}
                autoFocusSearch={false}
                onEmojiClick={(data) => onEmojiClick(data)}
                theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                emojiStyle={EmojiStyle.NATIVE}
                searchDisabled={false}
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
