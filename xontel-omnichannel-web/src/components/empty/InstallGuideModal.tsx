import React from 'react';
import { Button } from '@components/ui/button';
import { X, Download, Share, Menu, Chrome, Monitor, Globe } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function InstallGuideModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isEdge = /edge/.test(userAgent);

  const renderInstructions = () => {
    if (isIOS) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-5 w-5" />
            iOS Safari Instructions
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <span>Tap the <strong>Share</strong> icon at the bottom of the screen</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <span>Tap <strong>Add</strong> to install the app on your home screen</span>
            </li>
          </ol>
        </div>
      );
    }

    if (isAndroid) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Chrome className="h-5 w-5" />
            Android Chrome Instructions
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <span>Tap the <strong>Menu</strong> icon (three dots) in the top-right</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <span>Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <span>Tap <strong>Install</strong> to add the app to your home screen</span>
            </li>
          </ol>
        </div>
      );
    }

    if (isDesktop()) {
      const BrowserIcon = isChrome ? Chrome : isEdge ? Monitor : isSafari ? Globe : Download;
      const browserName = isChrome ? 'Chrome' : isEdge ? 'Edge' : isSafari ? 'Safari' : 'your browser';

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BrowserIcon className="h-5 w-5" />
            Desktop {browserName} Instructions
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <span>Look for the <strong>Install</strong> icon in your browser's address bar</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <span>Click the <strong>Install</strong> button to add the app</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <span>The app will be available in your applications/start menu</span>
            </li>
          </ol>
          {!isChrome && !isEdge && (
            <div className="mt-4 p-3 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> For the best experience, we recommend using Chrome or Edge on desktop.
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Download className="h-5 w-5" />
          General Instructions
        </div>
        <p className="text-sm text-muted-foreground">
          Look for an "Install" or "Add to Home Screen" option in your browser's menu or address bar.
          Installation steps may vary depending on your device and browser.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Install App</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Install this app on your device for quick access and a better experience.
            </p>
          </div>

          {renderInstructions()}

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isDesktop(): boolean {
  return !/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
}
