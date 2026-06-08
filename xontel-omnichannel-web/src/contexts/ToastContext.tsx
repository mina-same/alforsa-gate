import React, { createContext, useContext, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useEnhancedToast } from "@/components/ui/sonner-toast";

//  const getLanguagePrefixFromPath = (pathname: string): string => {
//    const parts = pathname.split('/').filter(Boolean)
//    const fromPath = parts.find((p) => p === 'en' || p === 'ar')
//    if (fromPath) return fromPath

//    const stored = localStorage.getItem('i18nextLng')
//    if (stored === 'en' || stored === 'ar') return stored

//    return 'en'
//  }
interface Toast {
  id: string;
  senderName: string;
  message: string;
  avatar?: string;
  timestamp: string;
  conversationId: number;
  inbox_id: number;
  type?: string;
}

const lastProcessedToastRef = {
  content: '',
  timestamp: 0,
  conversationId: 0
};

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { showMessageNotification, dismiss } = useEnhancedToast();
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeToastsRef = React.useRef<Map<number, { id: string | number; count: number }>>(new Map());
  const currentConversationId = searchParams.get('conversation');

  // Clear grouped toast count when a conversation is opened
  React.useEffect(() => {
    if (currentConversationId) {
      const numericId = Number(currentConversationId);
      if (activeToastsRef.current.has(numericId)) {
        const active = activeToastsRef.current.get(numericId);
        if (active) {
          dismiss(active.id);
          activeToastsRef.current.delete(numericId);
        }
      }
    }
  }, [currentConversationId, dismiss]);

  const addToast = (toast: Omit<Toast, "id">) => {
    // Deduplication logic: If same message for same conversation arrives within 1 second, skip it
    const now = Date.now();
    if (
      toast.message === lastProcessedToastRef.content &&
      toast.conversationId === lastProcessedToastRef.conversationId &&
      now - lastProcessedToastRef.timestamp < 1000
    ) {
      console.log('🚫 Toast duplicated, skipping:', toast.message);
      return;
    }

    lastProcessedToastRef.content = toast.message;
    lastProcessedToastRef.timestamp = now;
    lastProcessedToastRef.conversationId = toast.conversationId;

    const conversationId = Number(toast.conversationId);
    let unreadCount = 1;
    const sonnerId = `grouped-toast-${conversationId}`;
    
    // Check if we already have an active toast for this conversation
    if (activeToastsRef.current.has(conversationId)) {
      const active = activeToastsRef.current.get(conversationId);
      if (active) {
        unreadCount = active.count + 1;
      }
    }

    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Show Sonner toast (updates if sonnerId exists)
    showMessageNotification(
      toast.senderName,
      toast.message,
      toast.conversationId,
      toast.inbox_id,
      {
        id: sonnerId,
        avatar: toast.avatar,
        timestamp: toast.timestamp,
        unreadCount: unreadCount,
        onClick: (convId) => {
          activeToastsRef.current.delete(Number(convId));
          dismiss(sonnerId);
          const inboxId = toast.inbox_id;
          if (convId) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('inbox_id', String(inboxId));
            newParams.set('conversation', String(convId));
            if (toast.type === 'mention') {
              newParams.set('open_notes', 'true');
            }
            setSearchParams(newParams);

            window.dispatchEvent(new CustomEvent('navigate-to-conversation', {
              detail: {
                conversationId: convId.toString(),
                inbox_id: inboxId,
                type: toast.type
              }
            }));
          }
        },
      },
    );

    // Update the active toasts map
    activeToastsRef.current.set(conversationId, { id: sonnerId, count: unreadCount });

    // Remove from local state and map after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      // Reset the counter if no more messages arrive for a while
      // This is a safety measure, but the user requested reset on "read"
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, clearAllToasts }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
