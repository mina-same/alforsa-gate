import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface Props {
  blob: Blob;
}

export default function EnhancedAudioPlayer({ blob }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#a5b4fc",
      progressColor: "#4f46e5",
      height: 40,
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1,

    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.loadBlob(blob);

    wavesurfer.on("ready", () => {
      setIsReady(true);
    });

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => wavesurfer.destroy();
  }, [blob]);

  const togglePlay = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
    setIsPlaying((p) => !p);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={togglePlay}
        disabled={!isReady}
        className="p-2 text-indigo-500  rounded-full"
      >
        {isPlaying ? <Pause size={16} /> : <Mic size={16} />}
      </button>

      <div
        ref={containerRef}
        className="h-[40px] w-full" // هنا المكان الصحيح
      />
    </div>
  );
}
