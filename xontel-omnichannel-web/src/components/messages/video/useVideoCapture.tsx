import { useState, useRef } from "react";

export function useVideoCapture() {
  const [preview, setPreview] = useState<{ url: string; blob: Blob } | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

const getSupportedMimeType = () => {
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
    return "video/webm;codecs=vp8,opus";
  }

  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
    return "video/webm;codecs=vp9,opus";
  }

  if (MediaRecorder.isTypeSupported("video/webm;codecs=opus")) {
    return "video/webm;codecs=opus";
  }

  if (MediaRecorder.isTypeSupported("video/webm")) {
    return "video/webm";
  }

  return "";
};

 
  const startCamera = async (mode: "user" | "environment" = "user") => {
    try {
      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      console.log("Starting camera with mode:", mode);

      let stream: MediaStream | null = null;
      const constraints = [
        { video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true },
        { video: { facingMode: { ideal: mode } }, audio: true },
        { video: true, audio: true },
      ];

      for (let c of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          console.log("Camera started with constraint:", c);
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
      console.error("Camera error:", err);
      return null;
    }
  };

  // -------------------------------
  // Switch Camera
  // -------------------------------
  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    return await startCamera(newMode);
  };

  // -------------------------------




  // -------------------------------
  // Start Video Recording
  // -------------------------------
const startRecording = (video: HTMLVideoElement) => {
  if (!streamRef.current) return;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const chunks: BlobPart[] = [];

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (facingMode === "user") {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (facingMode === "user") ctx.restore();
    requestAnimationFrame(draw);
  };
  draw();

  const mirroredStream = canvas.captureStream(30);

  streamRef.current.getAudioTracks().forEach(track => mirroredStream.addTrack(track));

  const mediaRecorder = new MediaRecorder(mirroredStream, { mimeType: getSupportedMimeType() });
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
    setVideoBlob(blob);
    setPreview({ url: URL.createObjectURL(blob), blob });
    console.log("Recording stopped, preview ready");
  };

  mediaRecorder.start();
  recorderRef.current = mediaRecorder;
  setRecording(true);
  console.log("Recording started" + (facingMode === "user" ? " (mirrored)" : ""));
};


const stopRecording = () => {
  if (recorderRef.current && recorderRef.current.state !== "inactive") {
    recorderRef.current.stop(); 
    setRecording(false);
    recorderRef.current = null;
  }
};


  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  // -------------------------------
  // Clear preview
  // -------------------------------
  const clearPreview = () => {
    setPreview(null);
    setVideoBlob(null);
  };

  return {
    stream: streamRef.current,
    preview,
    videoBlob,
    facingMode,
    recording,
    startCamera,
    switchCamera,
    startRecording,
    stopRecording,
    clearPreview,
    stopCamera,
    getSupportedMimeType
  };
}
