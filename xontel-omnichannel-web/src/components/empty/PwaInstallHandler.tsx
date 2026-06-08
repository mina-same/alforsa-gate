import { useEffect, useState } from 'react';
import { BeforeInstallPromptEvent } from './types';

export function usePwaInstall() {
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      // @ts-expect-error - iOS Safari
      window.navigator?.standalone === true;

    if (isStandalone) setIsPwaInstalled(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event received');
      e.preventDefault();
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
      setInstallError(null);
    };

    const handleAppInstalled = () => {
      console.log('PWA: appinstalled event received');
      setIsPwaInstalled(true);
      setDeferredInstallPrompt(null);
      setInstallError(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handlePwaInstall = async () => {
    console.log('PWA: Install button clicked', {
      hasPrompt: !!deferredInstallPrompt,
      isInstalled: isPwaInstalled
    });

    if (!deferredInstallPrompt || isPwaInstalled) {
      if (!deferredInstallPrompt) {
        setInstallError('Install prompt not available. Please try refreshing the page.');
      } else if (isPwaInstalled) {
        setInstallError('App is already installed.');
      }
      return;
    }

    try {
      console.log('PWA: Showing install prompt');
      setInstallError(null);
      
      // Show the install prompt
      await deferredInstallPrompt.prompt();
      
      // Wait for the user's response
      const choiceResult = await deferredInstallPrompt.userChoice;
      console.log('PWA: User choice:', choiceResult);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
        setInstallError('Install was cancelled. You can try again later.');
      }
    } catch (error) {
      console.error('PWA: Install error:', error);
      setInstallError('Failed to install app. Please try again.');
    } finally {
      setDeferredInstallPrompt(null);
    }
  };

  // Fallback for mobile devices that don't support beforeinstallprompt
  const handleMobileInstall = () => {
    setShowInstallGuide(true);
  };

  return {
    deferredInstallPrompt,
    isPwaInstalled,
    handlePwaInstall,
    installError,
    handleMobileInstall,
    showInstallGuide,
    setShowInstallGuide,
  };
}
