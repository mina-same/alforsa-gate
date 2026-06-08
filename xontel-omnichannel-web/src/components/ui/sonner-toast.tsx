import {  X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast as sonnerToast, Toaster } from 'sonner';

 const getLanguagePrefixFromPath = (pathname: string): string => {
   const parts = pathname.split('/').filter(Boolean)
   const fromPath = parts.find((p) => p === 'en' || p === 'ar')
   if (fromPath) return fromPath

   const stored = localStorage.getItem('i18nextLng')
   if (stored === 'en' || stored === 'ar') return stored

   return 'en'
 }

interface MessageToastProps {
  senderName: string;
  message: string;
  avatar?: string;
  timestamp: string;
  conversationId: number;
  inbox_id:number;
  unreadCount?: number;
  onClick?: (conversationId: number) => void;
  onClose?: () => void;
}

// Custom toast component for messages
export const MessageToast = ({
  senderName,
  message,
  avatar,
  timestamp,
  conversationId,
  inbox_id,
  unreadCount = 1,
  onClick,
  onClose,
}: MessageToastProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleClick = () => {
    onClick?.(conversationId);
    onClose?.();
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border cursor-pointer",
        "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl",
        "border-zinc-200/60 dark:border-zinc-800/60",
        "shadow-xl shadow-black/10 dark:shadow-black/40",
        "hover:-translate-y-0.5 hover:shadow-2xl transition-all",
        "w-full max-w-sm"
      )}
      onClick={handleClick}
    >
      {/* Accent gradient bar */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-green-600" />

      <div className="flex gap-3 p-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={senderName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-semibold">
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
          {unreadCount > 1 && (
            <div className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-xon-primary px-1.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
              {unreadCount}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {senderName}
              </p>
              {unreadCount > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                  {unreadCount} new messages
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className={cn(
                "opacity-0 group-hover:opacity-100 transition",
                "p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
            {unreadCount > 1 ? `Last: ${message}` : message}
          </p>

          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced toast context using Sonner
export const useEnhancedToast = () => {
  const showMessageNotification = (
    senderName: string,
    message: string,
    conversationId: number,
    inbox_id:number,
    options?: {
      avatar?: string;
      timestamp?: string;
      unreadCount?: number;
      id?: string | number;
      onClick?: (conversationId: number) => void;
    }
  ) => {
    const toastId = sonnerToast.custom(
      (t) => (
        <MessageToast
          senderName={senderName}
          message={message}
          avatar={options?.avatar}
          timestamp={options?.timestamp || new Date().toISOString()}
          conversationId={conversationId}
          inbox_id={inbox_id}
          unreadCount={options?.unreadCount}
          onClick={(conversationId) => {
            // Use the onClick prop from ToastContext if provided, otherwise default navigation
            if (options?.onClick) {
              options.onClick(conversationId);
            } else {
              // Fallback navigation using inbox_id query parameter
              const languagePrefix = getLanguagePrefixFromPath(window.location.pathname);
              const newUrl = `/web/?inbox_id=${inbox_id}&conversation=${conversationId}`;
              window.history.pushState({}, '', newUrl);

              window.dispatchEvent(new PopStateEvent('popstate'));
              
              // Dispatch custom event to trigger conversation loading
              window.dispatchEvent(new CustomEvent('navigate-to-conversation', {
                detail: {
                  conversationId: conversationId.toString(),
                  inbox_id: inbox_id
                }
              }));
            }
          }}
          onClose={() => sonnerToast.dismiss(t)}
        />
      ),
      {
        id: options?.id,
        duration: 5000, // Auto-dismiss after 5 seconds
        position: 'top-right',
        className: 'animate-in slide-in-from-right-full fade-in duration-300',
      }
    );

    return toastId;
  };

  return {
    showMessageNotification,
    success: sonnerToast.success,
    error: sonnerToast.error,
    info: sonnerToast.info,
    warning: sonnerToast.warning,
    dismiss: sonnerToast.dismiss,
  };
};

// Responsive Toaster component with mobile positioning
export const ResponsiveToaster = () => {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        className: cn(
          // Base styles
          "max-w-sm",
          "shadow-lg",
          // Mobile responsive styles
          "mx-4 sm:mx-0",
          "mt-4 sm:mt-0",
          "max-w-[calc(100vw-2rem)] sm:max-w-sm"
        ),
      }}
      theme="system"
    />
  );
};

export default useEnhancedToast;
