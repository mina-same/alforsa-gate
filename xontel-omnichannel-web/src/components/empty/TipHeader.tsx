import React from 'react';
import { useTranslation } from 'react-i18next';

type TipHeaderProps = {
  activeIndex: number;
  totalTips: number;
  isMobile: boolean;
};

export default function TipHeader({ activeIndex, totalTips, isMobile }: TipHeaderProps) {
  const { t } = useTranslation('chat');

  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between shrink-0 bg-background/40">
      <div className="text-left">
        <p className="text-sm font-semibold text-foreground">
          {t('empty.tips.title')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('empty.tips.counter', {
            current: activeIndex + 1,
            total: totalTips,
          })}
        </p>
      </div>
      {isMobile && (
        <div className="text-[10px] text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">
          {t('Swipe to navigate')}
        </div>
      )}
    </div>
  );
}
