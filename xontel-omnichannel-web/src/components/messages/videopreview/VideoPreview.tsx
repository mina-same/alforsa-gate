"use client";

import { forwardRef, useState } from "react";

import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from "@/components/ui/shadcn-io/video-player";

import { VideoModal } from "./VideoModal";
import { Play } from "lucide-react";

interface VideoPreviewProps {
  src: string;
  className?: string;
  show: boolean;
  onOpen?: () => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onPlay?: () => void;
  poster?: string;
}

export const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  function VideoPreview({ src, className, show, onOpen, videoRef, onPlay, poster }, ref) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <div
          className="cursor-pointer"
          onClick={() => {
            onPlay?.();
            if (onOpen) {
              onOpen();
              return;
            }
            setOpen(true);
          }}
        >
          <VideoPlayer className={`rounded-md border ${className ?? ""}`}>
            <VideoPlayerContent
              ref={ref}
              crossOrigin=""
              muted
              preload="auto"
              slot="media"
              src={src}
              poster={poster}
            />


          {
            show&&(
                

             <VideoPlayerControlBar className="text-white bg-black/40 backdrop-blur-md">
            <VideoPlayerPlayButton className="text-white fill-white" />
            <VideoPlayerSeekBackwardButton className="text-white fill-white" />
            <VideoPlayerSeekForwardButton className="text-white fill-white" />
            <VideoPlayerTimeRange className="accent-white" />
            <VideoPlayerTimeDisplay
              showDuration
              className="text-white font-medium"
            />
            <VideoPlayerMuteButton className="text-white fill-white" />
            <VideoPlayerVolumeRange className="accent-white" />
          </VideoPlayerControlBar>

            )
          }

          {
            !show&&(
                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
  <button
 
    className="p-4 bg-black/60 rounded-full"
  >
    <Play className="w-8 h-8 text-white fill-white" />
  </button>
</div>
            )
          }


       
        </VideoPlayer>
      </div>

      {/* Fullscreen Modal Video */}
      {!onOpen && <VideoModal open={open} onClose={() => setOpen(false)} src={src} />}
    </>
  );
}
);
