"use client";

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

import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
}

export function VideoModal({ open, onClose, src }: VideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl bg-black border-none">
        <VideoPlayer className="rounded-lg overflow-hidden">
          <VideoPlayerContent
            crossOrigin=""
            preload="auto"
            slot="media"
            src={src}
          />

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
        </VideoPlayer>
      </DialogContent>
    </Dialog>
  );
}
