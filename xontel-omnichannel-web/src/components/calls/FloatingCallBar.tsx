import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingCallBarProps {
  name?: string;
  avatar?: string;
  onEndCall?: () => void;
  onMuteToggle?: (isMuted: boolean) => void;
  onExpandCall?: () => void;
  callDuration: number;
  isMuted?: boolean;
}

export default function FloatingCallBar({
  name = "Participant",
  avatar,
  onEndCall,
  onMuteToggle,
  onExpandCall,
  callDuration,
  isMuted = false,
}: FloatingCallBarProps) {
  const [localMuted, setLocalMuted] = useState(isMuted);

  useEffect(() => {
    setLocalMuted(isMuted);
  }, [isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    const newMutedState = !localMuted;
    setLocalMuted(newMutedState);
    onMuteToggle?.(newMutedState);
  };

  return (
    <div
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[10000] w-[95%] max-w-[420px] pointer-events-none"
    >
      <div
        className="bg-[#1C1C1E]/95 backdrop-blur-xl shadow-2xl border border-white/10 rounded-full px-5 py-2 cursor-pointer transition-all hover:bg-[#2C2C2E] pointer-events-auto active:scale-[0.98] ring-1 ring-white/5"
        onClick={onExpandCall}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left side - Mic Toggle */}
          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleMuteToggle();
              }}
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-full transition-colors ${localMuted
                  ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                  : 'text-white hover:bg-white/10'
                }`}
            >
              {localMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Center - Call info */}
          <div className="flex items-center justify-center gap-2 text-[#25D366] font-semibold text-sm sm:text-[15px] flex-1 min-w-0">
            <Phone className="h-4 w-4 fill-[#25D366] flex-shrink-0" />
            <span className="truncate">{name} - {formatTime(callDuration)}</span>
          </div>

          {/* Right side - End call */}
          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEndCall?.();
              }}
              variant="destructive"
              size="icon"
              className="h-10 w-10 rounded-full bg-[#FF3B30] hover:bg-red-600 shadow-lg active:scale-90 transition-transform flex items-center justify-center border border-white/10"
              title="End Call"
            >
              <PhoneOff className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
