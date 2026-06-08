import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/ui/button';
import TipHeader from './TipHeader';
import TipContent from './TipContent';
import TipNavigation from './TipNavigation';
import TipPreview from './TipPreview';
import { Tip, TipKey } from './types';

type TipsContainerProps = {
  tips: Tip[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
  isRTL: boolean;
  isMobile: boolean;
  handlePwaInstall: () => void;
  handleAllowNotifications: () => void;
  deferredInstallPrompt: any;
  isPwaInstalled: boolean;
  isNotificationsSupported: boolean;
  notificationPermission: string;
  isRequestingNotificationPermission: boolean;
  installError?: string | null;
  handleMobileInstall?: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
};

export default function TipsContainer({
  tips,
  activeIndex,
  setActiveIndex,
  goPrev,
  goNext,
  isRTL,
  isMobile,
  handlePwaInstall,
  handleAllowNotifications,
  deferredInstallPrompt,
  isPwaInstalled,
  isNotificationsSupported,
  notificationPermission,
  isRequestingNotificationPermission,
  installError,
  handleMobileInstall,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: TipsContainerProps) {
  const { t } = useTranslation('chat');
  const active = tips[activeIndex];
  const tipKey = active?.key as TipKey;
  const TipIcon = active?.Icon ?? React.Fragment;

  if (isMobile) {
    return (
      <div
        className="flex h-full w-full flex-col bg-background text-left"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="px-5 pt-6 pb-4 space-y-1">
          <div className="flex flex-col items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-foreground tracking-tight text-center">
                {t('empty.title')}
              </h2>
              <p className="text-xs text-muted-foreground text-center">{t('empty.description')}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-3 text-center bg-xon-success">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider bg-muted/20 text-muted-foreground">
            <TipIcon className="h-3 w-3" />
            {activeIndex + 1} / {tips.length}
          </div>
        </div>

        <div className="flex-1 px-4 pb-3 min-h-0 overflow-hidden">
          <div className="h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 pt-4 pb-3 space-y-1.5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <TipIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground">
                    {t(`empty.tips.${tipKey}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {t(`empty.tips.${tipKey}.description`)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <TipPreview
                tip={tipKey}
                handlePwaInstall={handlePwaInstall}
                handleAllowNotifications={handleAllowNotifications}
                deferredInstallPrompt={deferredInstallPrompt}
                isPwaInstalled={isPwaInstalled}
                isNotificationsSupported={isNotificationsSupported}
                notificationPermission={notificationPermission}
                isRequestingNotificationPermission={isRequestingNotificationPermission}
                installError={installError}
                handleMobileInstall={handleMobileInstall}
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={isRTL ? goNext : goPrev}
            className="h-10 w-10 rounded-xl p-0"
          >
            {isRTL ? (
              <ChevronRight className="h-4 w-4 text-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-foreground" />
            )}
          </Button>

          <div className="flex items-center gap-1.5">
            {tips.map((tip, idx) => (
              <button
                key={tip.key}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`rounded-full transition-all duration-300 h-2 ${
                  idx === activeIndex
                    ? 'bg-primary w-6'
                    : 'bg-border w-2 hover:bg-muted-foreground/30'
                }`}
                aria-label={String(tip.key)}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={isRTL ? goPrev : goNext}
            className="h-10 w-10 rounded-xl p-0"
          >
            {isRTL ? (
              <ChevronLeft className="h-4 w-4 text-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-foreground" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isMobile
        ? 'flex-1 flex flex-col min-h-0 rounded-2xl border border-border w-full'
        : 'rounded-3xl border border-border max-w-3xl mx-auto '
        } shadow-sm overflow-hidden touch-pan-y`}
    >
      <TipHeader activeIndex={activeIndex} totalTips={tips.length} isMobile={isMobile} />

      <div className={`relative ${isMobile ? 'flex-1 min-h-0 overflow-y-auto scrollbar-thin' : ''}`}>
        <TipContent
          tipKey={tipKey}
          Icon={TipIcon}
          handlePwaInstall={handlePwaInstall}
          handleAllowNotifications={handleAllowNotifications}
          deferredInstallPrompt={deferredInstallPrompt}
          isPwaInstalled={isPwaInstalled}
          isNotificationsSupported={isNotificationsSupported}
          notificationPermission={notificationPermission}
          isRequestingNotificationPermission={isRequestingNotificationPermission}
          isMobile={isMobile}
          installError={installError}
          handleMobileInstall={handleMobileInstall}
        />
      </div>

      <div className={`p-3 sm:p-6 shrink-0 ${isMobile ? 'border-t border-border bg-background/50 backdrop-blur-sm' : 'pt-0'}`}>
        <TipNavigation
          tips={tips}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          goPrev={goPrev}
          goNext={goNext}
          isRTL={isRTL}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
