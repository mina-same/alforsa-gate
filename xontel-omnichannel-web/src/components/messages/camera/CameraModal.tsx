
// --------------------------------------------------
// CameraModal.tsx (updated to support inline rendering via `inline` prop)
// --------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import type { OutgoingMessage } from "@/types/chat";
import { useCameraCapture } from "./useCameraCapture";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCcw, Send, Smile, Rotate3D } from "lucide-react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { useUploadMedia } from "@/api/media/hooks";
import FileUploadProgress from "../documents/FileUploadProgress";

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (msg: OutgoingMessage) => void;
  inline?: boolean; // when true, render in-place (no backdrop overlay)
}

export default function CameraModal({ open, onClose, onSend, inline = false }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const [retake, setRetake] = useState(false);
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const {
    preview,
    facingMode,
    startCamera,
    switchCamera,
    takePhoto,
    stopCamera,
    clearPreview,
  } = useCameraCapture();

  // Start camera when modal opens
  useEffect(() => {
    if (!open) return;

    let mounted = true;
    clearPreview();
    setCameraReady(false);

    (async () => {
      const s = await startCamera();
      if (!mounted) {
        if (s) s.getTracks().forEach((t) => t.stop());
        return;
      }
      if (videoRef.current && s) {
        try {
          videoRef.current.srcObject = s;
          console.log("Stream set to video element");
          
          // Wait for video to load metadata
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            setCameraReady(true);
          };
          
          await videoRef.current.play();
          console.log("Video playing");
        } catch (err) {
          console.error("video play error:", err);
          setCameraReady(false);
        }
      }
    })();

    return () => {
      mounted = false;
      stopCamera();
      clearPreview();
      setRetake(false);
      setMessage("");
      setCameraReady(false);
    };
  }, [open, retake]);

  /* ------------------------------
    Close emoji picker
  ------------------------------ */
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

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: uploadMedia } = useUploadMedia();

  const handleSend = async () => {
    if (!preview) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const response = await uploadMedia({
        file: new File([preview.blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" }),
        onProgress: (p) => setProgress(p),
      });

      onSend({
        text: message || "",
        media: {
          type: "image",
          blob: preview.blob,
          url: response.url,
          name: `photo_${Date.now()}.jpg`,
        },
      });

      setUploading(false);
      stopCamera();
      onClose();
    } catch (err: any) {
      console.error("Upload failed in CameraModal:", err);
      setError(err.message || "Failed to upload photo");
      setUploading(false);
    }
  };

  // When inline we render without backdrop and position relatively so it replaces the thread content
  const containerClass = inline
    ? "w-full flex-1 flex flex-col items-center justify-center "
    : "z-[999] flex items-center justify-center  backdrop-blur-sm px-2";

  const cardClass = inline
    ? "relative w-full max-w-none rounded-none shadow-none border-none  flex flex-col h-full"
    : "relative w-full max-w-lg rounded-xl shadow-xl border animate-in zoom-in duration-200 bg-black";

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        {/* Close Button */}
        <button
          onClick={() => {
            clearPreview();
            stopCamera();
            onClose();
          }}
          className="absolute right-4 top-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-gray-100 shadow"
        >
          ✕
        </button>

        {
          preview&&(
              <button
                onClick={() => {
                  clearPreview();
                  setRetake(true);
                }}
                className="absolute left-4 top-4 w-9 h-9 flex justify-center items-center bg-blue-600 text-white rounded-full shadow hover:bg-blue-700"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>

          )
        }





        {/* Camera / Preview */}
        <div className="relative w-full md:h-96 overflow-hidden flex items-center justify-center m-auto bg-black">
          {!preview ? (
     <div className={`h-full w-full relative overflow-hidden ${facingMode === "user" ? "video-mirror" : ""}`}>
  <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
</div>

          ) : (
            <div className="relative w-full h-full">
              <img
                src={preview.url}
                alt="preview"
                className="h-full w-full object-cover"

              />

              {/* Uploading */}
              {uploading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
                  <FileUploadProgress
                    progress={progress}
                    onCancel={() => {
                      setUploading(false);
                      setProgress(0);
                    }}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="absolute inset-x-0 bottom-4 z-30 flex flex-col items-center gap-2 text-white bg-red-600/80 p-4">
                  <p className="text-sm font-medium">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white hover:bg-white/20"
                    onClick={handleSend}
                  >
                    Retry Upload
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Camera Switch Button - Only show on mobile */}
          {!preview && (
            <button
              onClick={async () => {
                const newStream = await switchCamera();
                if (newStream && videoRef.current) {
                  videoRef.current.srcObject = newStream;
                  await videoRef.current.play();
                }
              }}
              className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 active:scale-95 md:hidden"
              title={facingMode === "user" ? "Switch to back camera" : "Switch to front camera"}
            >
              <Rotate3D className="w-5 h-5" />
            </button>
          )}
                 {!preview && cameraReady && (
          <div className="absolute bottom-0 left-0 right-0 mb-6 flex justify-center w-full">
            <button
              onClick={() => {
                console.log("Taking photo...");
                takePhoto(videoRef.current);
              }}
              className="w-14 h-14 flex justify-center items-center bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 active:scale-95"
              title="Take photo"
            >
              <Camera className="w-8 h-8" />
            </button>
          </div>
        )}
        </div>

        {preview && (
          <div className="px-1 md:px-4 py-3 border-t bg-white ">
            <div className="flex items-center gap-2 overflow-hidden">

              {/* Emoji Button */}
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <Smile className="w-6 h-6 text-gray-600" />
              </button>

              {/* Text Input */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Add a message..."
                disabled={false}
                className="flex-1 bg-transparent outline-none resize-none text-sm"
              />

              {/* Send */}
              <button
                onClick={handleSend}
                className="w-8 h-8 flex justify-center items-center bg-blue-600 text-white rounded-full shadow active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>

            </div>

            {/* Emoji Picker */}
            {showPicker && (
              <div className="absolute bottom-8 left-8 z-99 shadow-xl" ref={emojiRef}>
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
        )}

 
      </div>
    </div>
  );
}
