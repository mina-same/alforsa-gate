import { LucideIcon } from 'lucide-react';

export type TipKey =
  | 'mentions'
  | 'canned'
  | 'code'
  | 'attachments'
  | 'voice'
  | 'emoji'
  | 'reply'
  | 'search'
  | 'ai_suggestions'
  | 'pwa_install'
  | 'notifications';

export type Tip = {
  key: TipKey;
  Icon: LucideIcon;
};

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
