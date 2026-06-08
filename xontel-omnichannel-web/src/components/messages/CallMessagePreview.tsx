import React from 'react';
import { PhoneIncoming, PhoneOutgoing, Video, VideoOff } from 'lucide-react';
import { Message } from '@/types/chat';

export default function CallMessagePreview({ message, isSender }: { message: Message; isSender: boolean }) {
  let callData: any = null;
  try {
    if (typeof message.additional_attributes === 'string') {
      callData = JSON.parse(message.additional_attributes);
    } else {
      callData = message.additional_attributes;
    }
  } catch (e) {
    console.error('Failed to parse call data:', e);
  }

  if (!callData) return null;

  const isVideoCall = ((message as any).content || message.text || '').toLowerCase().includes('video') || callData.type === 'video';
  const isOutbound = callData.direction === 'BUSINESS_INITIATED' || ((message as any).content || '').includes('BUSINESS_INITIATED');

  const status = callData.status || 'UNKNOWN';
  const duration = callData.duration || 0;
  const event = callData.event || 'terminate';

  const isMissed = !isOutbound && (status === 'NO_ANSWER' || status === 'MISSED' || status === 'missed' || status === 'FAILED');
  const isDeclined = status === 'REJECTED' || status === 'DECLINED' || status === 'declined' || status === 'rejected' || status === 'BUSY';

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return 'Ended';
    if (seconds < 60) return `${seconds} sec`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // WhatsApp Layout:
  // - Icon in a dark circle
  // - Title: "Voice call" or "Missed voice call"
  // - Subtitle: Duration or "Tap to call back"

  const title = isMissed ? `Missed ${isVideoCall ? 'video' : 'voice'} call` : `${isVideoCall ? 'Video' : 'Voice'} call`;
  const subtitle = isMissed ? 'Tap to call back' : (status === 'COMPLETED' || status === 'ACCEPTED' || duration > 0 ? formatDuration(duration) : (isDeclined ? 'Declined' : 'Ended'));

  return (
    <div className="flex items-center gap-4 min-w-[200px]">
      {/* Dynamic Icon Container with Premium Gradient */}
      <div className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center  ${isMissed
          ? 'bg-xon-red'
          : isOutbound
            ? 'bg-xon-blue'
            : 'bg-xon-green'
        }`}>
        {isOutbound ? (
          <PhoneOutgoing className="w-5 h-5 text-white" />
        ) : (
          <PhoneIncoming className={`w-5 h-5 text-white`} />
        )}
      </div>

      {/* Enhanced Text Stack */}
      <div className="flex flex-col flex-1 min-w-0 pr-4">
        <span className={`text-[16px] font-semibold tracking-tight leading-tight truncate ${isMissed ? 'text-xon-text-red' : 'text-xon-text-primary'
          }`}>
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-xon-text-secondary font-medium truncate">
            {subtitle}
          </span>
          {duration > 0 && !isMissed && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-400 opacity-50" />
              <span className="text-[12px] text-slate-400 lowercase">Connected</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
