import React, { useEffect, useRef, useState } from "react";
import type { OutgoingMessage } from "@/types/chat";
import { useVideoCapture } from "./useVideoCapture";
import { Button } from "@/components/ui/button";
import { Camera, Rotate3D, Send, Smile } from "lucide-react";
import { useUploadMedia } from "@/api/media/hooks";
import FileUploadProgress from "../documents/FileUploadProgress";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (msg: OutgoingMessage) => void;
  inline?: boolean;
}

export default function VideoModal({ open, onClose, onSend, inline = false }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        };
  

  const {
    preview,
    videoBlob,
    facingMode,
    recording,
    startCamera,
    switchCamera,
    startRecording,
    stopRecording,
    stopCamera,
    clearPreview,
    getSupportedMimeType
    
  } = useVideoCapture();

  const { mutateAsync: uploadMedia } = useUploadMedia();

  // Start camera
  useEffect(() => {
    if (!open) return;

    let mounted = true;
    clearPreview();
    setCameraReady(false);

    (async () => {
      const s = await startCamera();
      if (!mounted) {
        s?.getTracks().forEach((t) => t.stop());
        return;
      }
      if (videoRef.current && s) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
        videoRef.current.play().catch(console.error);
      }
    })();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [open]);

  // Upload video

  const handleVideoExtension=(mimeType: string)=> {
    if(mimeType.includes("webm")) {
      return "webm";
    }
    else {
      return "mp4";
    }
    
  }

  

  
  const handleSend = async () => {
    if (!videoBlob) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const file = new File([videoBlob], `video_${Date.now()}.${handleVideoExtension(getSupportedMimeType())}`, { type: getSupportedMimeType() });
      console.log('🎧 Video file:',file.type)

      const response = await uploadMedia({
        file,
        onProgress: (p) => setProgress(p),
      });

      onSend({
        text: message || "",
        media: {
          type: "video",
          blob: videoBlob,
          url: response.url,
          name: file.name,
        },
      });

      setUploading(false);
      clearPreview();
      onClose();
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload video");
      setUploading(false);
    }
  };

  const containerClass = inline
    ? "w-full flex-1 flex flex-col items-center justify-center"
    : "z-[999] flex items-center justify-center backdrop-blur-sm px-2";

  const cardClass = inline
    ? "relative w-full max-w-none rounded-none shadow-none border-none flex flex-col h-full"
    : "relative w-full max-w-lg rounded-xl shadow-xl border animate-in zoom-in duration-200 bg-black";

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        {/* Close Button */}
        <button
          onClick={() => {
            clearPreview();
            stopRecording();
            stopCamera();
            onClose();
          }}
          className="absolute right-4 top-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-gray-100 shadow"
        >
          ✕
        </button>

        {/* Video */}
        <div className="relative w-full md:h-96 overflow-hidden flex items-center justify-center m-auto bg-black">

          {!preview ? (
                                  <div className={`h-full w-full relative overflow-hidden ${facingMode === "user" ? "video-mirror" : ""}`}>

              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted
              />
              </div>
          ) : (
                        <video src={preview.url}  controls autoPlay className="h-full w-full object-cover " />

          )}
          

          {/* Camera switch */}
          {!preview && (
            <button
              onClick={async () => {
                const s = await switchCamera();
                if (s && videoRef.current) videoRef.current.srcObject = s;
              }}
              className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 active:scale-95 md:hidden"
              title={facingMode === "user" ? "Switch to back camera" : "Switch to front camera"}
            >
              <Rotate3D className="w-5 h-5" />
            </button>
          )}

          {/* Recording */}
          {!preview && cameraReady && (
            <div className="absolute bottom-0 left-0 right-0 mb-6 flex justify-center w-full gap-4">
              {!recording ? (
                <button
                  onClick={() => startRecording(videoRef.current!)}
                  className="w-14 h-14 flex justify-center items-center bg-green-600 text-white rounded-full shadow hover:bg-green-700 active:scale-95"
                  title="Start Recording"
                >
                  <Camera className="w-8 h-8" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-14 h-14 flex justify-center items-center bg-red-600 text-white rounded-full shadow hover:bg-red-700 active:scale-95"
                  title="Stop Recording"
                >
                  <Camera className="w-8 h-8" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Send button */}
        
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
        {/* Upload progress */}
        {uploading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
            <FileUploadProgress progress={progress} onCancel={() => setUploading(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
