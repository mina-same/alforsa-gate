import React from 'react';
import { Edit3, Clock } from 'lucide-react';
import { Message } from '@/types/chat';

interface DraftMessageProps {
  message: Message;
  otherUserAvatar?: string;
  contactName?: string;
}

export default function DraftMessage({ message, otherUserAvatar, contactName = "Contact" }: DraftMessageProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[70%] flex items-end gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 opacity-60">
          {otherUserAvatar ? (
            <img
              src={otherUserAvatar}
              alt={contactName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-xon-surface-container-hover flex items-center justify-center">
              <span className="text-xs text-xon-text-secondary">{contactName[0]}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-xon-text-secondary">{contactName}</span>
            <div className="flex items-center gap-1 text-xs text-xon-text-secondary">
              <Edit3 className="h-3 w-3" />
              <span>Draft</span>
              <Clock className="h-3 w-3" />
            </div>
          </div>
          <div className="bg-xon-surface-container-hover/60 border border-xon-surface-outline/40 rounded-lg rounded-tl-none px-4 py-2 backdrop-blur-sm">
            <p className="text-sm text-xon-text-primary/80 italic">
              draft: {message.text}
            </p>
          </div>
          <div className="text-xs text-xon-text-secondary/60 mt-1">
            Not sent yet
          </div>
        </div>
      </div>
    </div>
  );
}
