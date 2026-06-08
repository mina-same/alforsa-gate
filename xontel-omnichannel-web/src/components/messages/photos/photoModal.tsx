import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Send, Smile } from "lucide-react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { OutgoingMessage } from "@/types/chat";
import FileUploadProgress from "../documents/FileUploadProgress";
import { VideoPreview } from "../videopreview/VideoPreview";

interface PhotoModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (msg: OutgoingMessage) => void;
  inline?: boolean;
  initialFile?: File | null;
}

import { useUploadMedia } from "@/api/media/hooks";

export default function PhotoModal({
  open,
  onClose,
  onSend,
  inline = false,
  initialFile = null,
}: PhotoModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(initialFile);

  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
    }
  }, [initialFile]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: uploadMedia } = useUploadMedia();

  const handleFile = (selected?: File) => {
    if (!selected) return;
    setFile(selected);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files?.[0];
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
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Real upload
      const response = await uploadMedia({
        file,
        onProgress: (p) => setProgress(p),
      });

      // Once finished, call onSend with the URL
      onSend({
        text: message || "",
        media: {
          type: file.type.startsWith("video") ? "video" : "image",
          blob: file,
          url: response.url,
          name: file.name
        },
      });

      setUploading(false);
      setProgress(0);
      setFile(null);
      onClose();
    } catch (err: any) {
      console.error("Upload failed in modal:", err);
      setError(err.message || "Failed to upload file");
      setUploading(false);
      // We don't close the modal on error, so the user can see it
    }
  };

  const containerClass = inline
    ? "w-full flex-1 flex flex-col items-center justify-center"
    : "z-[999] flex items-center justify-center backdrop-blur-sm px-2";

  const cardClass = inline
    ? "relative w-full max-w-none rounded-none shadow-none border-none flex flex-col h-full"
    : "relative w-full max-w-lg rounded-xl shadow-xl border border-xon-surface-outline bg-xon-surface-container";

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={containerClass}>
      <div className={cardClass}>

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 w-9 h-9 rounded-full bg-xon-surface-container hover:bg-xon-surface-container-hover shadow flex items-center justify-center text-xon-text-primary"
        >
          ✕
        </button>

        {/* Drag Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`w-full h-full flex items-center justify-center mt-2 rounded-lg px-6 py-2 transition border ${isDragging ? "border-xon-primary bg-xon-container-blue" : "border-xon-surface-outline bg-xon-surface-container"
            }`}
        >
          {!file ? (
            <div className="flex flex-col justify-center items-center">
              <Upload className="w-8 h-8 text-xon-text-secondary mb-3" />
              <p className="text-xon-text-primary font-medium">Drag & drop photo/video</p>
              <p className="text-sm text-xon-text-secondary">or</p>

              <Button variant="outline" className="mt-2" onClick={() => inputRef.current?.click()}>
                Choose File
              </Button>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div className="md:h-96 flex flex-col items-center justify-center m-auto">

              {/* Preview */}
              {!uploading && (
                <>
                  {file.type.startsWith("image") && (
                    <img
                      src={URL.createObjectURL(file)}
                      className="max-h-80 rounded-md object-cover"
                    />
                  )}

                  {file.type.startsWith("video") && (
                    <VideoPreview
                      show={true}
                      src={URL.createObjectURL(file)}

                      className="w-full" />


                  )}
                </>
              )}

              {/* Uploading */}
              {uploading && (
                <FileUploadProgress
                  progress={progress}
                  onCancel={() => {
                    setUploading(false);
                    setProgress(0);
                  }}
                />
              )}

              {/* Error Message */}
              {error && (
                <div className="flex flex-col items-center gap-2 text-xon-text-red mt-2">
                  <p className="text-sm font-medium">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xon-text-red border-xon-red hover:bg-xon-container-red"
                    onClick={handleSend}
                  >
                    Retry Upload
                  </Button>
                </div>
              )}

              <p className="text-xs text-xon-text-secondary mt-2">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>

        {/* Text + Emoji + Send */}
        {file && !uploading && (
          <div className="px-4 py-3 border-t border-xon-surface-outline bg-xon-surface-container relative">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-2 rounded-full hover:bg-xon-surface-container-hover"
              >
                <Smile className="w-6 h-6 text-xon-text-secondary" />
              </button>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={1}
                onKeyDown={handleKeyDown}


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
                className="absolute bottom-12 left-4 z-[9999] shadow-xl"
                ref={emojiRef}
              >
                <EmojiPicker
                  width={280}
                  height={400}
                  emojiStyle={EmojiStyle.NATIVE}
                  onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
