import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type EmptyHeaderProps = {
  isMobile: boolean;
};

export default function EmptyHeader({ isMobile }: EmptyHeaderProps) {
  const { t } = useTranslation('chat');

  if (isMobile) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground ">
      <div className="relative">
        <div className="relative flex h-16 w-16  items-center justify-center rounded-2xl border border-border bg-background/70 backdrop-blur text-primary shadow-sm">
          <MessageCircle className="h-8 w-8 " />
        </div>
      </div>

      <div className="space-y-1 sm:space-y-2 px-4">
        <p className="text-lg sm:text-xl font-semibold text-foreground">
          {t('empty.title')}
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('empty.description')}
        </p>
      </div>
    </div>
  );
}
