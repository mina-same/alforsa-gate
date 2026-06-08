import React from 'react';
import { useTranslation } from 'react-i18next';
import { TipKey } from './types';

type TipCardProps = {
  tipKey: TipKey;
  Icon: React.ComponentType<any>;
};

export default function TipCard({ tipKey, Icon }: TipCardProps) {
  const { t } = useTranslation('chat');

  return (
    <div className="rounded-2xl border border-border bg-background/50 p-4 sm:p-5 shrink-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div className="min-w-0 space-y-1 sm:space-y-2">
          <p className="text-base font-semibold text-foreground">
            {t(`empty.tips.${tipKey}.title`)}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(`empty.tips.${tipKey}.description`)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground/90 whitespace-pre-wrap">
        {t(`empty.tips.${tipKey}.example`)}
      </div>
    </div>
  );
}
