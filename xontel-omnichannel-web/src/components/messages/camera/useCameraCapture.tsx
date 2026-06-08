import { useState, useRef } from "react";

export function useCameraCapture() {
  const [preview, setPreview] = useState<{ url: string; blob: Blob } | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (mode: "user" | "environment" = "user") => {
    try {
      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      console.log("Starting camera with mode:", mode);

      // Try multiple constraint combinations
      let stream: MediaStream | null = null;
      const constraints = [
        // Try with specific facing mode first
        {
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
            
          },
          audio: false
        },
        // Fallback: without width/height
        {
          video: {
            facingMode: { ideal: mode }
          },
          audio: false
        },
        // Last resort: just basic
        {
          video: true,
          audio: false
        }
      ];

      for (let constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log("Camera started with constraint:", constraint);
          break;
        } catch (err) {
          console.warn("Failed with constraint, trying next:", err);
          continue;
        }
      }

      if (!stream) {
        console.error("No stream available");
        return null;
      }

      streamRef.current = stream;
      setFacingMode(mode);
      return stream;
    } catch (err) {
      console.error("camera error:", err);
      return null;
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    return await startCamera(newMode);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const takePhoto = async (video: HTMLVideoElement | null) => {
    if (!video) {
      console.error("No video element");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (canvas.width === 0 || canvas.height === 0) {
        console.error("Invalid video dimensions:", canvas.width, canvas.height);
        return;
      }
      

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }
      
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // Draw the video frame directly - no flip
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob: Blob = await new Promise((resolve) => {
        canvas.toBlob((b) => {
          if (b) {
            resolve(b);
          }
        }, "image/jpeg", 0.95);
      });

      const url = URL.createObjectURL(blob);
      setPreview({ url, blob });

      console.log("Photo taken successfully");
      return { url, blob };
    } catch (err) {
      console.error("Error taking photo:", err);
      return null;
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return {
    stream: streamRef.current,
    preview,
    facingMode,
    startCamera,
    switchCamera,
    takePhoto,
    stopCamera,
    clearPreview,
  };
}
