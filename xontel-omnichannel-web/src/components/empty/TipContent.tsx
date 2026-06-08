import React from 'react';
import TipCard from './TipCard';
import TipPreview from './TipPreview';
import { TipKey } from './types';

type TipContentProps = {
  tipKey: TipKey;
  Icon: React.ComponentType<any>;
  handlePwaInstall: () => void;
  handleAllowNotifications: () => void;
  deferredInstallPrompt: any;
  isPwaInstalled: boolean;
  isNotificationsSupported: boolean;
  notificationPermission: string;
  isRequestingNotificationPermission: boolean;
  isMobile: boolean;
  installError?: string | null;
  handleMobileInstall?: () => void;
};

export default function TipContent({
  tipKey,
  Icon,
  handlePwaInstall,
  handleAllowNotifications,
  deferredInstallPrompt,
  isPwaInstalled,
  isNotificationsSupported,
  notificationPermission,
  isRequestingNotificationPermission,
  isMobile,
  installError,
  handleMobileInstall,
}: TipContentProps) {
  return (
    <div
      key={tipKey}
      className="px-4 sm:px-6 py-4 sm:py-6 animate-in fade-in zoom-in-95 duration-300"
    >
      <div className={`${isMobile ? 'flex flex-col gap-4' : 'grid gap-6 lg:grid-cols-[1fr_1.1fr] items-stretch'} text-left`}>
        <TipCard tipKey={tipKey} Icon={Icon} />

        <div className={`rounded-2xl border border-border bg-muted/20 p-2 sm:p-3 ${isMobile ? 'flex-1 flex flex-col min-h-[220px]' : ''}`}>
          <div className="h-full w-full rounded-xl border border-border bg-background overflow-hidden relative flex flex-col">
            <div className={`relative w-full ${isMobile ? 'flex-1 overflow-y-auto p-3' : 'h-full min-h-[240px] p-4'}`}>
              <div className="mx-auto max-w-xl h-full flex flex-col justify-center">
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
        </div>
      </div>
    </div>
  );
}
