import { useMemo } from 'react';
import {
  AtSign,
  Download,
  Bell,
  Code2,
  CornerUpLeft,
  Lightbulb,
  MessageCircle,
  Mic,
  Paperclip,
  Search,
  Slash,
  Smile,
  Sparkles,
} from 'lucide-react';
import { Tip } from './types';

export function useTipsManager() {
  const tips = useMemo(
    () =>
      [
        { key: 'pwa_install' as const, Icon: Download },
        { key: 'notifications' as const, Icon: Bell },
        { key: 'mentions' as const, Icon: AtSign },
        { key: 'canned' as const, Icon: Slash },
        { key: 'code' as const, Icon: Code2 },
        { key: 'attachments' as const, Icon: Paperclip },
        { key: 'voice' as const, Icon: Mic },
        { key: 'emoji' as const, Icon: Smile },
        { key: 'reply' as const, Icon: CornerUpLeft },
        { key: 'search' as const, Icon: Search },
        { key: 'ai_suggestions' as const, Icon: Sparkles },
      ],
    [],
  );

  return { tips };
}
