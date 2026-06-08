import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@hooks/use-mobile';
import { EmptyHeader, TipsContainer, useTipsManager, useTipsNavigation, usePwaInstall, useNotificationHandler } from '../empty';
import InstallGuideModal from '../empty/InstallGuideModal';

export default function EmptyConversation() {
  const { i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar';
  const isMobile = useIsMobile();

  const { tips } = useTipsManager();
  const {
    activeIndex,
    setActiveIndex,
    goPrev,
    goNext,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useTipsNavigation(tips, isRTL);
  const { deferredInstallPrompt, isPwaInstalled, handlePwaInstall, installError, handleMobileInstall, showInstallGuide, setShowInstallGuide } = usePwaInstall();
  const {
    isNotificationsSupported,
    notificationPermission,
    isRequestingNotificationPermission,
    handleAllowNotifications,
  } = useNotificationHandler();
  
  return (
    <div
      className={`relative flex h-full w-full flex-col items-center bg-transparent overflow-y-auto ${
        isMobile
          ? 'justify-start py-2 px-2 overflow-hidden text-left'
          : 'justify-center px-4 py-4 text-center'
      }`}
    >
      <div className="w-full z-10 flex flex-col sm:pt-80 md:pt-20 lg:pt-30 xl:pt-12">
        <EmptyHeader isMobile={isMobile} />

        <TipsContainer
          tips={tips}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          goPrev={goPrev}
          goNext={goNext}
          isRTL={isRTL}
          isMobile={isMobile}
          handlePwaInstall={handlePwaInstall}
          handleAllowNotifications={handleAllowNotifications}
          deferredInstallPrompt={deferredInstallPrompt}
          isPwaInstalled={isPwaInstalled}
          isNotificationsSupported={isNotificationsSupported}
          notificationPermission={notificationPermission}
          isRequestingNotificationPermission={isRequestingNotificationPermission}
          installError={installError}
          handleMobileInstall={handleMobileInstall}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </div>
      <InstallGuideModal isOpen={showInstallGuide} onClose={() => setShowInstallGuide(false)} />
    </div>
  );
}
