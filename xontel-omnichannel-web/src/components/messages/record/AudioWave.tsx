import { useEffect, useRef } from "react";

interface AudioWaveProps {
  mediaRecorder: MediaRecorder;
}

export default function AudioWave({ mediaRecorder }: AudioWaveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const stream = mediaRecorder?.stream;
    const canvas = canvasRef.current;
    if (!stream || !canvas) return;

    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    audioCtxRef.current = audioContext;
    audioContext.resume().catch(() => null);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      if (ctx) ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    const draw = () => {
      if (!ctx || !analyserRef.current) return;

      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, "#4f46e5");
      gradient.addColorStop(1, "#a855f7");

      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;
      ctx.fillStyle = "rgba(79, 70, 229, 0.12)";
      ctx.beginPath();

      const sliceWidth = rect.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * rect.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(rect.width, rect.height / 2);
      ctx.lineTo(0, rect.height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    draw();

    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        resizeCanvas();
      }
    });

    resizeObserver.observe(canvas);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (resizeObserver) resizeObserver.disconnect();
      if (sourceRef.current) sourceRef.current.disconnect();
      if (analyserRef.current) analyserRef.current.disconnect();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, [mediaRecorder]);

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full">
        <canvas ref={canvasRef} className="w-full h-[40px] rounded-md bg-slate-950/5" />
      </div>
    </div>
  );
}
