import React, { useEffect, useRef, useState } from "react";
import { Trash, Send, Pause, Play } from "lucide-react";
import EnhancedAudioPlayer from "../EnhancedAudioPlayer";
import RecordingWaveform from "./RecordingWaveform";


interface VoiceRecordingProps {
  onSend: (data: { type: "audio"; blob: Blob; url: string }) => void;
  onCancel: () => void;
}

export default function VoiceRecording({ onSend, onCancel }: VoiceRecordingProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [ready, setReady] = useState(false);

  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);


  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const cancelledRef = useRef(false);
  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const mimeTypeRef = useRef<string>('audio/ogg');


  // --------------------------
  // TIMER
  // --------------------------
  useEffect(() => {
    if (!isRecording || !ready || paused) return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, ready, paused]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // --------------------------
  // START RECORDING
  // --------------------------
  useEffect(() => {
    let cancelled = false;
    startRecording(() => cancelled);
    return () => {
      cancelled = true;
      stopStream();
    };
  }, []);
const getSupportedMimeType = () => {
  // if (MediaRecorder.isTypeSupported('audio/mp4')) {
  //   return 'audio/mp4'; // AAC → .m4a
  // }

  if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
    return 'audio/ogg;codecs=opus';
  }

  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  }

  return '';
};

const startRecording = async (isCancelled: () => boolean = () => false) => {
  chunksRef.current = [];
  cancelledRef.current = false;
  setTime(0);
  setPaused(false);

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  if (isCancelled()) {
    stream.getTracks().forEach((t) => t.stop());
    return;
  }

  streamRef.current = stream;
  setReady(true);

  const mimeType = getSupportedMimeType();
  mimeTypeRef.current = mimeType;

  console.log('🎧 Starting recording with mimeType:', mimeType);

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
  mediaRecorderRef.current = recorder;

  recorder.ondataavailable = (e) => {
    if (e.data.size && !cancelledRef.current) {
      chunksRef.current.push(e.data);
    }
  };

  recorder.onstop = () => {
    if (cancelledRef.current) return;

    const blob = new Blob(chunksRef.current, { type: mimeType });
    console.log('🎧 Recorded audio:', blob); 
    const url = URL.createObjectURL(blob);

    setBlob(blob);
    setPreviewUrl(url);
    onSend({ type: 'audio', blob, url });

    console.log('🎧 Recorded audio:', {
      mimeType,
      size: blob.size,
    });
  };

  recorder.start();
};


  // --------------------------                   
  // PAUSE & RESUME
  // --------------------------
 const handlePause = () => {
  if (mediaRecorderRef.current?.state === "recording" && time >= 1) {

  //REQUEST DATA
    mediaRecorderRef.current.requestData();

    mediaRecorderRef.current.pause();
    setPaused(true);

    setTimeout(() => {
      const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setBlob(blob);

      // Calculate actual duration from the audio blob
      

    }, 100);
  }
};


  const handleResume = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      setPreviewUrl(null);
      mediaRecorderRef.current.resume();
      setPaused(false);
    }
  };

  // --------------------------
  // STOP & SEND
  // --------------------------
  const handleStop = () => {
    setIsRecording(false);
    cancelledRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    stopStream();
  };

  // --------------------------
  // CANCEL (NO SEND)
  // --------------------------
  const handleCancel = () => {
    cancelledRef.current = true;
    setIsRecording(false);
    setTime(0);
    setPaused(false);

    chunksRef.current = [];

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.ondataavailable = null;

      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }

    stopStream();
    onCancel();
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  // --------------------------
  // UI
  // --------------------------
  return (
    <div className="flex items-center gap-2 w-full lg:px-4 py-1">
  {/* Recording waveform */}
  {isRecording && !paused && ready && mediaRecorderRef.current && (
      // <AudioWave
      //         mediaRecorder={mediaRecorderRef.current}

      // />


      <div className="flex-1">
                      <RecordingWaveform stream={streamRef.current} isRecording={isRecording} />


      </div>

      
  )}

  {/* Paused waveform */}
  {paused && blob && mediaRecorderRef.current && (
    <div className="flex-1">
      <EnhancedAudioPlayer blob={blob} />
    </div>
  )}

  {/* Timer */}
  <div className="text-gray-700 font-medium w-12 text-center">
    {formatTime(time)}
  </div>

  {/* Pause / Resume */}
  {paused ? (
    <button
      onClick={handleResume}
      className="p-2  text-blue-600 rounded-full"
    >
      <Play className="h-4 w-4" />
    </button>
  ) : (
    <button
      onClick={handlePause}
      className="p-2 text-blue-600  rounded-full"
    >
      <Pause className="h-4 w-4" />
    </button>
  )}

  {/* Cancel */}
  <button onClick={handleCancel} className="p-2 text-red-500 rounded-full">
    <Trash className="h-4 w-4" />
  </button>

  {/* Send */}
  <button
    onClick={handleStop}
    className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center"
  >
    <Send className="h-4 w-4" />
  </button>
</div>

  );
}
