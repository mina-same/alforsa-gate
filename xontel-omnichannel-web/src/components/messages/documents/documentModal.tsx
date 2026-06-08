import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Send, Smile } from "lucide-react";
import FilePreview from "./FilePreview";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { OutgoingMessage } from "@/types/chat";
import FileUploadProgress from "./FileUploadProgress";

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (msg: OutgoingMessage) => void;
  inline?: boolean;
  initialFiles?: File[];
}

import { useUploadMedia } from "@/api/media/hooks";

export default function DocumentModal({
  open,
  onClose,
  onSend,
  inline = false,
  initialFiles = [],
}: DocumentModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState<File[]>(initialFiles);

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: uploadMedia } = useUploadMedia();

  const handleFile = (selected?: File | FileList) => {
    if (!selected) return;
    const newFiles: File[] = selected instanceof FileList ? Array.from(selected) : [selected];
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files;
    handleFile(selected);
  };

  /* Close emoji picker when clicking outside */
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const handleSend = async () => {
    if (files.length === 0) return;



    try {
      setUploading(true);
      setProgress(0);
      setCurrentIndex(0);
      setError(null);
      for (let i = 0; i < files.length; i++) {
        setCurrentIndex(i);
        const f = files[i];
        console.log(f.name)

        const response = await uploadMedia({
          file: f,
          onProgress: (p) => setProgress(p),
        });

        onSend({
          text: message || "",
          media: {
            type: "file",
            blob: f,
            url: response.url,
            name: f.name,
          },
        });
      }


    } catch (err: any) {
      console.error("Upload failed in DocumentModal:", err);
      setError(err.message || "Failed to upload files");
      setUploading(false);
    }
    setUploading(false);
    setProgress(0);
    setFiles([]);
    setCurrentIndex(null);
    onClose();
  };

  const handleCancelUpload = () => {

    setUploading(false);
    setProgress(0);
    setCurrentIndex(null);
    setFiles([]);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };



  const containerClass = inline
    ? "w-full flex-1 flex flex-col items-center justify-center"
    : "z-[999] fixed inset-0 flex items-center justify-center backdrop-blur-sm px-2";

  const cardClass = inline
    ? "relative w-full max-w-none rounded-none shadow-none border-none flex flex-col h-full items-center justify-center"
    : "relative w-full max-w-2xl rounded-2xl shadow-2xl border border-xon-surface-outline bg-xon-surface-container flex flex-col overflow-hidden";

  if (!open) return null;

  return (
    <div className={containerClass}>
      <div className={cardClass}>

        <button
          onClick={() => {
            onClose();
          }}
          className="absolute right-4 top-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-xon-surface-container hover:bg-xon-surface-container-hover shadow text-xon-text-primary"
        >
          ✕
        </button>


        {/* Hidden file input (always mounted so "+" can open it) */}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="
            image/*,
            video/*,
            audio/*,
            application/pdf,
            application/msword,
            application/vnd.openxmlformats-officedocument.wordprocessingml.document,
            application/vnd.ms-excel,
            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
          "
          onChange={(e) => handleFile(e.target.files ?? undefined)}
        />

        {/* Drag Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex-1 w-full overflow-hidden flex items-center justify-center transition border ${isDragging ? "border-xon-primary bg-xon-container-blue" : "border-xon-surface-outline bg-xon-surface-container"
            }`}
        >
          {uploading && (
            <div className="w-full px-6 py-4 flex flex-col items-center justify-center">
              <FileUploadProgress progress={progress} onCancel={handleCancelUpload} />
            </div>
          )}

          {!files.length && !uploading ? (
            <div className="flex flex-col justify-center items-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-xon-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-xon-primary" />
              </div>
              <p className="text-xon-text-primary font-semibold text-lg text-center">Drag files here</p>
              <p className="text-sm text-xon-text-secondary text-center mt-2">or click the button below to browse</p>
              <Button
                className="mt-6 bg-xon-primary hover:opacity-90 text-xon-primary-on"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>
          ) : !uploading ? (
            <div className="w-full px-6 py-6 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4 overflow-hidden">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="relative group rounded-lg overflow-hidden bg-xon-surface-container border border-xon-surface-outline hover:border-xon-primary/50 transition"
                  >
                    <div className="aspect-square flex items-center justify-center bg-xon-surface-container-hover relative">
                      {f.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(f)}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      ) : f.type.startsWith("video/") ? (
                        <div className="w-full h-full flex items-center justify-center bg-xon-surface-container-hover">
                          <video
                            src={URL.createObjectURL(f)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                          <FilePreview file={f} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-7 h-7 rounded-full bg-xon-red hover:opacity-90 flex items-center justify-center text-xon-text-inverse text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition"
                        aria-label={`Remove ${f.name}`}
                      >
                        ✕
                      </button>

                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {(f.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-xon-primary hover:opacity-90 hover:bg-xon-primary/5 flex items-center justify-center transition group"
                  aria-label="Add more files"
                >
                  <div className="flex flex-col items-center gap-1 group-hover:scale-110 transition">
                    <span className="text-2xl text-xon-primary">+</span>
                    <span className="text-xs text-xon-text-secondary">Add</span>
                  </div>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {error && (
          <div className="w-full border-t border-xon-red bg-xon-container-red px-6 py-3">
            <p className="text-sm font-medium text-xon-text-red">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xon-text-red border-xon-red hover:bg-xon-container-red"
              onClick={handleSend}
            >
              Retry Upload
            </Button>
          </div>
        )}
        {files.length > 0 && !uploading && (
          <div className="flex flex-col w-full justify-center items-center gap-2 md:gap-4 mb-4 mt-2">
            <div className="px-1 md:px-4 py-3 border-t border-xon-surface-outline bg-xon-surface-container relative w-full md:max-w-3xl md:rounded-md ">
              <div className="flex items-center gap-2 overflow-hidden">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="p-2 rounded-full hover:bg-xon-surface-container-hover"
                >
                  <Smile className="w-6 h-6 text-xon-text-secondary" />
                </button>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Add a message..."
                  className="flex-1 bg-transparent outline-none resize-none text-sm text-xon-text-primary placeholder:text-xon-text-secondary"
                />

                <button
                  onClick={handleSend}
                  className="w-8 h-8 flex justify-center items-center bg-xon-primary text-xon-primary-on rounded-full"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {showPicker && (
                <div
                  className="absolute bottom-full right-0 z-[9999] mb-2 shadow-xl"
                  ref={emojiRef}
                >
                  <EmojiPicker
                    width={280}
                    height={400}
                    emojiStyle={EmojiStyle.NATIVE}
                    onEmojiClick={(e) => {
                      setMessage((prev) => prev + e.emoji);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
