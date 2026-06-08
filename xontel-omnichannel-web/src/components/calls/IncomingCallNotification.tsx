import React from 'react';
import { Phone, PhoneOff, Users, X, Check, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IncomingCallNotificationProps {
  name?: string;
  avatar?: string;
  onAccept?: () => Promise<void>;
  onDecline?: () => void;
  onIgnore?: () => void;
}

export default function IncomingCallNotification({
  name = 'Unknown Caller',
  avatar,
  onAccept,
  onDecline,
  onIgnore
}: IncomingCallNotificationProps) {
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [isDeclining, setIsDeclining] = React.useState(false);
  const [isIgnoring, setIsIgnoring] = React.useState(false);

  // Touch state for swipe up
  const touchStartRef = React.useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = React.useState(0);

  const handleAccept = async () => {
    if (isAccepting || isDeclining || isIgnoring) return;
    setIsAccepting(true);
    try {
      if (onAccept) {
        await onAccept();
      }
    } catch (error) {
      console.error('[Incoming Call] Failed to accept:', error);
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    if (isAccepting || isDeclining || isIgnoring) return;
    setIsDeclining(true);
    if (onDecline) {
      onDecline();
    }
  };

  const handleIgnore = () => {
    if (isAccepting || isDeclining || isIgnoring) return;
    setIsIgnoring(true);
    // Short delay for animation
    setTimeout(() => {
      if (onIgnore) onIgnore();
    }, 300);
  };

  // Mobile Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const currentY = e.targetTouches[0].clientY;
    const deltaY = currentY - touchStartRef.current;

    // Only allow swiping up (negative delta)
    if (deltaY < 0) {
      setSwipeOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartRef.current === null) return;

    // If swiped up more than 50px, trigger ignore
    if (swipeOffset < -50) {
      handleIgnore();
    } else {
      // Reset position
      setSwipeOffset(0);
    }
    touchStartRef.current = null;
  };

  return (
    <>
      {/* MOBILE VIEW: WhatsApp Style Toast (Visible on small screens only) */}
      <div
        className={`fixed top-2 left-0 right-0 z-[99999] px-4 pointer-events-none block md:hidden transition-all duration-300 ease-out ${isIgnoring ? 'opacity-0 -translate-y-full' : 'animate-in fade-in slide-in-from-top-4'}`}
        style={swipeOffset < 0 ? { transform: `translateY(${swipeOffset}px)`, opacity: 1 + swipeOffset / 200 } : {}}
      >
        <div
          className="mx-auto max-w-[420px] pointer-events-auto cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bg-gradient-to-r from-white via-slate-50 to-xon-surface dark:from-xon-surface dark:via-slate-900 dark:to-xon-surface-container backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl ">
            <div className='flex items-center justify-between p-4 '>

              <div className="flex flex-col gap-0.5 ml-1">
                <div className="flex items-center gap-1.5 opacity-70">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#25D366] fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437 0 12.045c0 2.112.553 4.177 1.604 6.004L0 24l6.117-1.605A11.803 11.803 0 0012.045 24c6.604 0 12.039-5.437 12.045-12.044a11.83 11.83 0 00-3.601-8.503z" />
                  </svg>
                  <span className=" text-[13px] font-medium tracking-tight">WhatsApp Audio...</span>
                </div>
                <h2 className="text-[16px] text-xon-text-primary font-bold tracking-tight leading-tight -mt-0.5 truncate max-w-[180px]">
                  {name}
                </h2>
                {/* <div className="w-full h-1 bg-slate-400/20 rounded-full mx-auto mt-2 block md:hidden" /> Swipe Handle */}
              </div>

              <div className="flex items-center gap-2 mr-1">
                <button
                  onClick={handleDecline}
                  disabled={isDeclining || isAccepting}
                  className="w-10 h-10 rounded-full bg-xon-red hover:bg-red-600 flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-50"
                  title="Reject"
                >
                  <X className="w-5 h-5 text-white stroke-[3px]" />
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isAccepting || isDeclining}
                  className="w-10 h-10 rounded-full bg-xon-green hover:bg-emerald-600 flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-50"
                  title="Accept"
                >
                  <Check className="w-5 h-5 text-white stroke-[3px]" />
                </button>
              </div>
            </div>
            <div className="w-40 h-1 bg-slate-400/20 rounded-full mx-auto mb-1 block md:hidden" /> {/* Swipe Handle */}
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW: Original Notification Design (Visible on medium screens and up) */}
      <div className="fixed top-0 left-0 right-0 z-[99998] pointer-events-none hidden md:block"
        style={{ animation: 'slideDown 0.3s ease-out forwards' }}>
        <style>{`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 2; }
          }
          @keyframes pulse-ring {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>

        <div className="m-4 mx-auto max-w-md pointer-events-auto relative">
          <div className="bg-gradient-to-r from-white via-slate-50 to-xon-surface dark:from-xon-surface dark:via-slate-900 dark:to-xon-surface-container
                          rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 
                          p-6 backdrop-blur-xl"
            style={{ animation: 'pulse-ring 2s infinite' }}>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full  bg-xon-green 
                              flex items-center justify-center text-white font-bold text-lg 
                              shadow-lg border-2 border-xon-green overflow-hidden flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-7 h-7" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-xon-text-primary truncate">
                  {name}
                </p>
                <p className="text-sm text-xon-green font-medium flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-xon-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-xon-green"></span>
                  </span>
                  Incoming call
                </p>
              </div>

              <Button
                onClick={handleIgnore}
                disabled={isDeclining || isAccepting || isIgnoring}
                className="px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 rounded-xl 
                           transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ignore call (silence)"
              >
                <BellOff className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-300 mb-6 font-medium">
              Do you want to accept this call?
            </p>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleDecline}
                disabled={isDeclining || isAccepting || isIgnoring}
                className="flex-1 bg-xon-red hover:bg-[var(--xon-color-surface-red-hover)] text-white font-semibold py-2.5 rounded-xl 
                           transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PhoneOff className="w-5 h-5 mr-2 inline" />
                Reject
              </Button>

              <Button
                onClick={handleAccept}
                disabled={isAccepting || isDeclining || isIgnoring}
                className="flex-1 bg-xon-green hover:bg-[var(--xon-color-surface-green-hover)] text-white font-semibold py-2.5 rounded-xl 
                           transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="w-5 h-5 mr-2 inline" />
                {isAccepting ? 'Accepting...' : 'Accept'}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
